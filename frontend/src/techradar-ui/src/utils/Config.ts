import createConfig from "@spydersoft/react-runtime-config";

export const { useConfig: useApiConfig, getConfig: getApiConfig } = createConfig({
  namespace: "tech_radar",
  schema: {
    data: {
      type: "string",
      description: "Url Segment for Data",
      default: "/api/data",
    },
    bff: {
      type: "string",
      description: "Unifi IP Manager Backend Url",
      default: "",
    },
  },
});
