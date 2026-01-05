"use client";

import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";
import { neumorphicComponents } from "./neumorphic";

// Extend MUI theme types to include your custom properties
declare module "@mui/material/styles" {
  interface Theme {
    neumorphic: typeof neumorphicComponents;
    customColors: typeof colors;
  }
  interface ThemeOptions {
    neumorphic?: typeof neumorphicComponents;
    customColors?: typeof colors;
  }
}

export const theme = createTheme({
  // Add custom properties
  neumorphic: neumorphicComponents,
  customColors: colors,

  // MUI palette configuration
  palette: {
    mode: "light",
    background: {
      default: colors.background.main,
      paper: colors.background.main,
    },
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    success: {
      main: colors.success,
    },
    error: {
      main: colors.error,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },

  // Typography
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      color: colors.text.primary,
    },
    h2: {
      fontWeight: 600,
      color: colors.text.primary,
    },
    body1: {
      color: colors.text.primary,
    },
  },

  // Component default props and styles
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true, // Neumorphism looks better without ripple
      },
      styleOverrides: {
        root: {
          textTransform: "none", // No uppercase
          fontWeight: 600,
          padding: "12px 24px",
        },
      },
    },

    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          ...neumorphicComponents.card.raised,
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
  },

  // Spacing (8px base unit)
  spacing: 8,
});
