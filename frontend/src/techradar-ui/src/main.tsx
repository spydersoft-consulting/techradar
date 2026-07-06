import "./styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./components/AppRouter";
import { store } from "./store/store";

import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { PrimeReactProvider } from "./context/PrimeReactProvider";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <PrimeReactProvider>
      <AuthProvider>
        <Provider store={store}>
          <AppRouter />
        </Provider>
      </AuthProvider>
    </PrimeReactProvider>
  </React.StrictMode>,
);
