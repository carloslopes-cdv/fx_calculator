"use client";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0284c7", // Azul Corporativo / Treasury
      light: "#38bdf8",
      dark: "#0369a1",
    },
    secondary: {
      main: "#6366f1",
    },
    background: {
      default: "#0f172a", // Slate escuro elegante
      paper: "#1e293b",
    },
    // Semáforo de Risco Cambial
    success: {
      main: "#10b981", // 🟢 HEALTHY (Cobertura >= 80%)
    },
    warning: {
      main: "#f59e0b", // 🟡 WARNING (Cobertura 50% - 79.9%)
    },
    error: {
      main: "#ef4444", // 🔴 CRITICAL (Cobertura < 50%)
    },
  },
  typography: {
    fontFamily: "Roboto, system-ui, -apple-system, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
        },
      },
    },
  },
});
