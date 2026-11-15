import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./router";
import { ThemeProvider } from "./context/ThemeProvider";
import { ToastProvider } from "./components/ui/ToastProvider";
import { queryClient } from "./lib/queryClient";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ToastProvider />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
