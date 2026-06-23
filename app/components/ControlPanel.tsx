"use client";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { NeumorphicButton } from "./neumorphic-components/NeumorphicButton";

type Props = {
  tempo: number;
  meter: string;
  onTempoChange: (newTempo: number) => void;
  onMeterChange: (newMeter: string) => void;
  onGenerateMelody: () => void;
};

export default function ControlPanel({
  tempo,
  meter,
  onTempoChange,
  onMeterChange,
  onGenerateMelody,
}: Props) {
  const theme = useTheme();
  const [localTempo, setLocalTempo] = useState(tempo);

  const handleTempoChange = (_: Event, value: number | number[]) => {
    const t = Array.isArray(value) ? value[0] : value;
    setLocalTempo(t);
    onTempoChange(t);
  };

  return (
    <Box
      sx={{
        ...theme.neumorphic.panel.flat,
        padding: 3,
        height: "100%",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={3} sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: theme.customColors.text.primary }}
        >
          Settings
        </Typography>

        <Box>
          <Typography gutterBottom sx={{ fontSize: "0.9rem" }}>
            Tempo: {localTempo} BPM
          </Typography>
          <Slider
            value={localTempo}
            onChange={handleTempoChange}
            min={40}
            max={160}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel>Meter</InputLabel>
          <Select
            value={meter}
            label="Meter"
            onChange={(e) => onMeterChange(e.target.value)}
          >
            <MenuItem value="4/4">4/4</MenuItem>
            <MenuItem value="3/4">3/4</MenuItem>
            <MenuItem value="6/8">6/8</MenuItem>
          </Select>
        </FormControl>

        <NeumorphicButton
          onClick={onGenerateMelody}
          sx={{
            color: theme.customColors.primary,
            fontWeight: "bold",
            fontSize: "1rem",
            marginTop: "auto",
          }}
        >
          🎲 Generate New Melody
        </NeumorphicButton>
      </Stack>
    </Box>
  );
}
