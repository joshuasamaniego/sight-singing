import { colors } from "./colors";

export interface NeumorphicOptions {
  intensity?: "subtle" | "medium" | "strong";
  size?: "small" | "medium" | "large";
}

export const transitions = {
  // Quick and snappy for buttons
  quick: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

  // Smooth for cards and panels
  smooth: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

  // Slow and elegant for large movements
  elegant: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",

  // Spring-like for interactive elements
  spring: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",

  // Individual property transitions for fine control
  properties: {
    boxShadow: "box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "background-color 0.3s ease",
    opacity: "opacity 0.2s ease",
  },
};

// Helper function to generate neumorphic styles
export const createNeumorphic = (
  state: "raised" | "pressed" | "flat" = "raised",
  options: NeumorphicOptions = {}
) => {
  const { intensity = "medium", size = "medium" } = options;

  // Shadow sizes based on component size
  const shadowSizes = {
    small: { blur: 8, spread: 4 },
    medium: { blur: 16, spread: 9 },
    large: { blur: 30, spread: 15 },
  };

  const { blur, spread } = shadowSizes[size];

  // Intensity affects opacity
  const intensityMap = {
    subtle: 0.3,
    medium: 0.6,
    strong: 0.9,
  };

  const opacity = intensityMap[intensity];

  const baseStyle = {
    background: colors.background.main,
    borderRadius:
      size === "small" ? "10px" : size === "medium" ? "15px" : "20px",
    border: "none",
    transition: transitions.smooth,
  };

  switch (state) {
    case "raised":
      return {
        ...baseStyle,
        boxShadow: `${spread}px ${spread}px ${blur}px rgba(163, 177, 198, ${opacity}), -${spread}px -${spread}px ${blur}px ${colors.shadow.light}`,
      };

    case "pressed":
      return {
        ...baseStyle,
        boxShadow: `inset ${spread * 0.7}px ${spread * 0.7}px ${
          blur * 0.7
        }px rgba(163, 177, 198, ${opacity + 0.2}), inset -${spread * 0.7}px -${
          spread * 0.7
        }px ${blur * 0.7}px rgba(255, 255, 255, ${opacity - 0.2})`,
        // Add slight scale down when pressed for extra tactile feel
        transform: "scale(0.98)",
      };

    case "flat":
      return {
        ...baseStyle,
        boxShadow: `${spread * 0.5}px ${spread * 0.5}px ${
          blur * 0.5
        }px rgba(163, 177, 198, ${opacity * 0.5}), -${spread * 0.5}px -${
          spread * 0.5
        }px ${blur * 0.5}px ${colors.shadow.light}`,
      };

    default:
      return baseStyle;
  }
};

// Pre-defined component styles
export const neumorphicComponents = {
  button: {
    raised: {
      ...createNeumorphic("raised", { size: "medium" }),
      transition: transitions.quick, // Faster for buttons
      transform: "scale(1)",
      "&:hover": {
        transform: "scale(1.02)", // Slight grow on hover
      },
    },
    pressed: {
      ...createNeumorphic("pressed", { size: "medium" }),
      transition: transitions.quick,
    },
  },

  card: {
    raised: {
      ...createNeumorphic("raised", { size: "large" }),
      transition: transitions.smooth,
      "&:hover": {
        transform: "translateY(-2px)", // Lift slightly on hover
        boxShadow: `12px 12px 24px rgba(163, 177, 198, 0.7), -12px -12px 24px rgba(255, 255, 255, 0.6)`,
      },
    },
  },

  input: {
    pressed: {
      ...createNeumorphic("pressed", { size: "small", intensity: "subtle" }),
      transition: transitions.smooth,
      "&:focus-within": {
        boxShadow: `inset 4px 4px 8px rgba(163, 177, 198, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.3), 0 0 0 2px ${colors.primary}`,
      },
    },
  },

  panel: {
    flat: {
      ...createNeumorphic("flat", { size: "large", intensity: "subtle" }),
      transition: transitions.elegant,
    },
  },
};
