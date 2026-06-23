"use client";

import { Box, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { playReferenceTone } from "../utils/audioPlayer";
import { Melody } from "../utils/melodyGenerator";
import {
  startMicrophoneCapture,
  stopMicrophoneCapture,
} from "../utils/microphoneCapture";
import {
  calculateCents,
  detectPitch,
  getAccuracyFeedback,
} from "../utils/pitchDetection";
import { NeumorphicButton } from "./neumorphic-components/NeumorphicButton";

interface SheetMusicDisplayProps {
  melody: Melody | null;
  isPlaying?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  onVoiceCaptured?: (cents: number, feedback: string) => void;
}

export default function SheetMusicDisplay({
  melody,
  isPlaying,
  onPlay,
  onStop,
  onVoiceCaptured,
}: SheetMusicDisplayProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const vexRef = useRef<any>(null);
  const playheadRef = useRef<SVGLineElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const playheadAnimationRef = useRef<number | null>(null);

  // Render staff once
  useEffect(() => {
    if (!containerRef.current) return;

    import("vexflow").then((VexModule) => {
      containerRef.current!.innerHTML = "";

      try {
        const Vex = (VexModule as any).default || VexModule;

        const renderer = new Vex.Renderer(
          containerRef.current!,
          Vex.Renderer.Backends.SVG,
        );
        renderer.resize(400, 150);
        const context = renderer.getContext();

        const stave = new Vex.Stave(10, 20, 350);
        stave.addClef("bass");
        stave.addTimeSignature("4/4");
        stave.setContext(context).draw();

        vexRef.current = { Vex, context, stave, renderer };
      } catch (error) {
        console.error("Error rendering staff:", error);
      }
    });
  }, []);

  // Update notes when melody changes
  useEffect(() => {
    if (!melody || !vexRef.current) return;

    const { Vex } = vexRef.current;

    containerRef.current!.innerHTML = "";

    try {
      const renderer = new Vex.Renderer(
        containerRef.current!,
        Vex.Renderer.Backends.SVG,
      );
      renderer.resize(400, 150);
      const newContext = renderer.getContext();

      const newStave = new Vex.Stave(10, 20, 350);
      newStave.addClef("bass");
      newStave.addTimeSignature("4/4");
      newStave.setContext(newContext).draw();

      const vexflowNotes = melody.notes.map((note) => {
        const noteMatch = note.note.match(/^([A-G])(#?)(\d)$/);
        if (!noteMatch) throw new Error(`Invalid note: ${note.note}`);

        const noteLetter = noteMatch[1].toLowerCase();
        const accidental = noteMatch[2];
        const octave = noteMatch[3];
        const vexflowFormat = `${noteLetter}/${octave}`;

        const staveNote = new Vex.StaveNote({
          keys: [vexflowFormat],
          duration: "h",
          clef: "bass",
        });

        if (accidental === "#") {
          staveNote.addModifier(new Vex.Accidental("#"), 0);
        }

        return staveNote;
      });

      const voice = new Vex.Voice({
        num_beats: 4,
        beat_value: 4,
      });

      voice.addTickables(vexflowNotes);

      const formatter = new Vex.Formatter();
      formatter.joinVoices([voice]).format([voice], 320);
      voice.draw(newContext, newStave);

      vexRef.current = { Vex, context: newContext, stave: newStave, renderer };
    } catch (error) {
      console.error("Error rendering notes:", error);
    }
  }, [melody]);

  // Animate playhead during playback
  useEffect(() => {
    if (!isPlaying || !melody) {
      if (playheadAnimationRef.current) {
        cancelAnimationFrame(playheadAnimationRef.current);
      }
      return;
    }

    const noteDuration = (2 / 120) * 60 * 1000; // 2 beats per note
    const totalDuration = melody.notes.length * noteDuration;
    const startX = 50;
    const endX = 350;
    const noteWidth = (endX - startX) / melody.notes.length;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const x = startX + progress * (endX - startX);

      if (playheadRef.current) {
        playheadRef.current.setAttribute("x1", x.toString());
        playheadRef.current.setAttribute("x2", x.toString());
      }

      if (progress < 1) {
        playheadAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    playheadAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (playheadAnimationRef.current) {
        cancelAnimationFrame(playheadAnimationRef.current);
      }
    };
  }, [isPlaying, melody]);

  const handlePlayReference = () => {
    if (!melody || melody.notes.length === 0) return;
    playReferenceTone(melody.notes[0].frequency, 2000);
  };

  const handleCaptureVoice = async () => {
    if (isCapturing) {
      const audioBuffer = stopMicrophoneCapture();
      setIsCapturing(false);

      console.log(
        "Calling detectPitch with buffer length:",
        audioBuffer.length,
      );
      const result = await detectPitch(audioBuffer);
      console.log("Pitch detection result:", result);

      if (result.frequency && melody && melody.notes.length > 1) {
        const targetFrequency = melody.notes[1].frequency;
        const cents = calculateCents(result.frequency, targetFrequency);
        const { message } = getAccuracyFeedback(cents);

        console.log(
          "Calling onVoiceCaptured with cents:",
          cents,
          "message:",
          message,
        );

        if (onVoiceCaptured) {
          onVoiceCaptured(cents, message);
        }
      } else {
        console.log("Result check failed:", {
          hasFrequency: result.frequency,
          hasNotes: melody?.notes.length,
          frequency: result.frequency,
        });
      }
    } else {
      try {
        await startMicrophoneCapture();
        setIsCapturing(true);
      } catch (error) {
        console.error("Failed to access microphone:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        ...theme.neumorphic.panel.flat,
        display: "flex",
        flexDirection: "column",
        padding: 2,
        height: "100%",
        minHeight: "400px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%", overflow: "hidden" }}
        />
        {isPlaying && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <line
              ref={playheadRef}
              x1="50"
              y1="0"
              x2="50"
              y2="150"
              stroke={theme.customColors.primary}
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {melody && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            marginTop: 2,
            flexWrap: "wrap",
          }}
        >
          <NeumorphicButton
            onClick={handlePlayReference}
            sx={{
              color: theme.customColors.info,
              fontWeight: "bold",
            }}
          >
            🔔 Reference Tone
          </NeumorphicButton>

          {isPlaying ? (
            <NeumorphicButton
              onClick={onStop}
              sx={{
                color: theme.customColors.error,
                fontWeight: "bold",
              }}
            >
              ⏹ Stop
            </NeumorphicButton>
          ) : (
            <NeumorphicButton
              onClick={onPlay}
              sx={{
                color: theme.customColors.success,
                fontWeight: "bold",
              }}
            >
              ▶ Play Melody
            </NeumorphicButton>
          )}

          <NeumorphicButton
            onClick={handleCaptureVoice}
            sx={{
              color: isCapturing
                ? theme.customColors.error
                : theme.customColors.success,
              fontWeight: "bold",
            }}
          >
            {isCapturing ? "⏹ Stop Capture" : "🎤 Capture Voice"}
          </NeumorphicButton>
        </Box>
      )}
    </Box>
  );
}
