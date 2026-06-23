"use client";

import { Box, useTheme } from "@mui/material";
import { useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import MelodyInfo from "./components/MelodyInfo";
import SheetMusicDisplay from "./components/SheetMusicDisplay";
import { playMelody, stopAudio } from "./utils/audioPlayer";
import { generateMelody, Melody } from "./utils/melodyGenerator";

export default function Home() {
  const theme = useTheme();
  const [tempo, setTempo] = useState(120);
  const [meter, setMeter] = useState("4/4");
  const [currentMelody, setCurrentMelody] = useState<Melody | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captureResult, setCaptureResult] = useState<{
    cents: number;
    message: string;
  } | null>(null);
  const playbackRef = useRef<Promise<void> | null>(null);

  const handleGenerateMelody = () => {
    setIsPlaying(false);
    stopAudio();
    setCaptureResult(null);
    const newMelody = generateMelody();
    setCurrentMelody(newMelody);
  };

  const handlePlay = async () => {
    if (!currentMelody) return;
    setIsPlaying(true);
    try {
      playbackRef.current = playMelody(currentMelody, { tempo, gain: 0.3 });
      await playbackRef.current;
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    stopAudio();
    playbackRef.current = null;
  };

  const handleVoiceCaptured = (cents: number, message: string) => {
    setCaptureResult({ cents, message });
  };

  return (
    <Box
      sx={{
        background: theme.customColors.background.main,
        minHeight: "100vh",
        padding: 4,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 3,
        }}
      >
        <ControlPanel
          tempo={tempo}
          meter={meter}
          onTempoChange={setTempo}
          onMeterChange={setMeter}
          onGenerateMelody={handleGenerateMelody}
        />

        <SheetMusicDisplay
          melody={currentMelody}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onStop={handleStop}
          onVoiceCaptured={handleVoiceCaptured}
        />

        <MelodyInfo melody={currentMelody} captureResult={captureResult} />
      </Box>
    </Box>
  );
}
