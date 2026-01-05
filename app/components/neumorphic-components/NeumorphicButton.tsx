"use client";

import { Button, ButtonProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function NeumorphicButton({
  children,
  sx,
  ...props
}: Omit<ButtonProps, "variant">) {
  const theme = useTheme();

  return (
    <Button
      variant="text"
      disableRipple
      disableElevation
      sx={{
        // 1. Start with theme styles (includes border: 'none')
        ...theme.neumorphic.button.raised,

        // 2. Then add/override specific properties
        transformOrigin: "center",
        backgroundColor: "transparent",

        // 3. Transitions
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

        // 4. Hover state
        "&:hover:not(:active)": {
          transform: "scale(1.02)",
          boxShadow: `12px 12px 20px rgba(163, 177, 198, 0.7), -12px -12px 20px rgba(255, 255, 255, 0.6)`,
          backgroundColor: "transparent",
        },

        // 5. Active state
        "&:active": {
          ...theme.neumorphic.button.pressed,
          transform: "scale(0.98)",
          transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
        },

        // 6. Disabled state
        "&:disabled": {
          opacity: 0.5,
          cursor: "not-allowed",
          transform: "scale(1)",
        },

        // 7. Focus state
        "&:focus": {
          outline: "none",
        },

        // 8. User's custom styles last (can override anything)
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
