import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";
import AuthGate from "./auth/AuthGate.tsx";
import AuthProvider from "./auth/AuthProvider.tsx";
import { configureAuth } from "./auth/config.ts";
import { queryClient } from "./shared/queryClient.ts";

configureAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
