import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import child_process from "child_process";

// Only set up HTTPS certificates if not running tests or building
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const isBuild = process.env.NODE_ENV === 'production' || process.argv.includes('build');

let keyFilePath = '';
let certFilePath = '';

if (!isTest && !isBuild) {
  console.log("Setting up HTTPS certificates...");
  console.log("Environment:", process.env.APPDATA);
  const baseFolder =
    process.env.APPDATA !== undefined && process.env.APPDATA !== ""
      ? `${process.env.APPDATA}/ASP.NET/https`
      : `${process.env.HOME}/.aspnet/https`;

  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
  }

  const certificateArg = process.argv
    .map((arg) => arg.match(/--name=(?<value>.+)/i))
    .filter(Boolean)[0];
  const certificateName = certificateArg
    ? certificateArg.groups.value
    : "reactapp1.client";

  if (!certificateName) {
    console.error(
      "Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly.",
    );
    process.exit(-1);
  }

  certFilePath = path.join(baseFolder, `${certificateName}.pem`);
  keyFilePath = path.join(baseFolder, `${certificateName}.key`);

  if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (
      0 !==
      child_process.spawnSync(
        "dotnet",
        [
          "dev-certs",
          "https",
          "--export-path",
          certFilePath,
          "--format",
          "Pem",
          "--no-password",
        ],
        { stdio: "inherit" },
      ).status
    ) {
      throw new Error("Could not create certificate.");
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  build: {
    // Increase chunk size warning limit to reduce bundle size warnings
    chunkSizeWarningLimit: 1200,
  },
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf'],
  server: {
    proxy: {
      "^/api": {
        target: "https://localhost:7197/",
        secure: false,
      },
      "^/swagger": {
        target: "https://localhost:7197/",
        secure: false,
      },
      "^/Auth": {
        target: "https://localhost:7197/",
        secure: false,
      },
      "^/.auth": {
        target: "https://localhost:7197/",
        secure: false,
      },
      "^/fe": {
        target: "https://localhost:7197/",
        secure: false,
       },
       "^/livez": {
        target: "https://localhost:7197/",
        secure: false,
       },
       "^/readyz": {
        target: "https://localhost:7197/",
        secure: false,
       }
    },
    port: 3000,
    cors: {
      origin: "*",
    },
    ...((!isTest && !isBuild && keyFilePath && certFilePath) && {
      https: {
        key: fs.readFileSync(keyFilePath),
        cert: fs.readFileSync(certFilePath),
      }
    }),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.js",
    reporters: ["html", "junit"],
    outputFile: "./output/test/junit.xml",
    coverage: {
      provider: "v8",
      reporter: ["html", "cobertura", "lcov", "text"],
      reportsDirectory: "./output/coverage",
      exclude: [
        "**/node_modules/**", 
        "**/tests/**", 
        "**/dist/**", 
        "**/output/**",
        "**/vite.config.mts",
        "**/eslint.config.js",
        "**/coverage/**",
        "**/.yarn/**",
        "**/src/api/**",
        "**/*.d.ts",
      ],
    },
  }
});
