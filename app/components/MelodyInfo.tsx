"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { Melody } from "../utils/melodyGenerator";

interface MelodyInfoProps {
  melody: Melody | null;
  captureResult?: { cents: number; message: string } | null;
}

export default function MelodyInfo({ melody, captureResult }: MelodyInfoProps) {
  const theme = useTheme();

  const feedbackStatus = captureResult
    ? Math.abs(captureResult.cents) <= 20
      ? "perfect"
      : Math.abs(captureResult.cents) <= 50
        ? "close"
        : captureResult.cents > 0
          ? "high"
          : "low"
    : "none";

  const targetNote = melody?.notes[1];

  return (
    <Box
      sx={{
        ...theme.neumorphic.card.raised,
        padding: 3,
        height: "100%",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: theme.customColors.text.primary,
        }}
      >
        Melody Information
      </Typography>

      {melody ? (
        <Box sx={{ flex: 1 }}>
          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: theme.customColors.text.secondary }}
            >
              KEY
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: theme.customColors.primary }}
            >
              {melody.key}
            </Typography>
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: theme.customColors.text.secondary }}
            >
              INTERVAL
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: theme.customColors.primary }}
            >
              {melody.interval}
            </Typography>
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: theme.customColors.text.secondary }}
            >
              NOTES
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", marginTop: 0.5 }}
            >
              {melody.notes.map((n) => n.note).join(" → ")}
            </Typography>
          </Box>

          <Box
            sx={{
              marginBottom: 3,
              paddingBottom: 2,
              borderBottom: `1px solid ${theme.customColors.text.secondary}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: theme.customColors.text.secondary }}
            >
              TARGET NOTE (2nd)
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", marginTop: 0.5 }}
            >
              {targetNote?.note} ({targetNote?.frequency.toFixed(1)} Hz)
            </Typography>
          </Box>

          {captureResult && (
            <Box sx={{ marginBottom: 3 }}>
              <Typography
                variant="caption"
                sx={{ color: theme.customColors.text.secondary }}
              >
                DETECTED PITCH
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", marginTop: 0.5 }}
              >
                Cents Off: {captureResult.cents > 0 ? "+" : ""}
                {captureResult.cents}
              </Typography>
            </Box>
          )}

          {captureResult && (
            <Box
              sx={{
                padding: 2,
                borderRadius: "10px",
                backgroundColor:
                  feedbackStatus === "perfect"
                    ? "rgba(76, 175, 80, 0.1)"
                    : feedbackStatus === "close"
                      ? "rgba(255, 193, 7, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color:
                    feedbackStatus === "perfect"
                      ? theme.customColors.success
                      : feedbackStatus === "close"
                        ? theme.customColors.warning
                        : theme.customColors.text.secondary,
                  textAlign: "center",
                }}
              >
                {captureResult.message}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{ color: theme.customColors.text.secondary, fontStyle: "italic" }}
        >
          Generate a melody to see information here.
        </Typography>
      )}
    </Box>
  );
}
