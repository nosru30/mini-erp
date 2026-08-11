import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";
import AuthGate from "./auth/AuthGate.tsx";
import AuthProvider from "./auth/AuthProvider.tsx";
import { configureAuth } from "./auth/config.ts";

configureAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </AuthProvider>
  </StrictMode>,
);
