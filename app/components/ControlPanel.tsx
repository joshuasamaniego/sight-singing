"use client";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

type Props = {
  tempo: number;
  meter: string;
  numMeasures: number;
  onTempoChange: (newTempo: number) => void;
  onMeterChange: (newMeter: string) => void;
  onNumMeasuresChange: (newCount: number) => void;
  onGenerateMelody: () => void;
};

export default function ControlPanel({
  tempo,
  meter,
  numMeasures,
  onTempoChange,
  onMeterChange,
  onNumMeasuresChange,
  onGenerateMelody,
}: Props) {
  const [localTempo, setLocalTempo] = useState(tempo);

  const handleTempoChange = (_: Event, value: number | number[]) => {
    const t = Array.isArray(value) ? value[0] : value;
    setLocalTempo(t);
    onTempoChange(t);
  };

  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f9f9f9", boxShadow: 1 }}>
      <Stack spacing={3}>
        {/* TEMPO */}
        <Box>
          <Typography gutterBottom>Tempo: {localTempo} BPM</Typography>
          <Slider
            value={localTempo}
            onChange={handleTempoChange}
            min={40}
            max={160}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* METER */}
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

        {/* NUMBER OF MEASURES */}
        <FormControl fullWidth>
          <InputLabel>Number of Measures</InputLabel>
          <Select
            value={numMeasures}
            label="Number of Measures"
            onChange={(e) => onNumMeasuresChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* GENERATE BUTTON */}
        <Button
          variant="contained"
          color="secondary"
          onClick={onGenerateMelody}
          sx={{ mt: 2 }}
        >
          🎲 Generate New Melody
        </Button>
      </Stack>
    </Box>
  );
}
