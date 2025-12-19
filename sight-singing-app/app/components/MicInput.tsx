// app/components/MicInput.tsx
"use client";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { PitchDetector } from "pitchy";
import { useEffect, useRef, useState } from "react";
import { centsDifference } from "../utils/noteUtils";

type ScheduleItem = { time: number; freq: number; noteIndex: number };

export default function MicInput({
  schedule,
  lookahead = 0.25,
}: {
  schedule: ScheduleItem[] | null;
  lookahead?: number;
}) {
  const audioRef = useRef<AudioContext | null>(null);
  const detectorRef = useRef<any>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [listening, setListening] = useState(false);
  const [lastDetectedFreq, setLastDetectedFreq] = useState<number | null>(null);
  const [lastCents, setLastCents] = useState<number | null>(null);
  const [lastNoteIndex, setLastNoteIndex] = useState<number | null>(null);
  const [clarity, setClarity] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const start = async () => {
    if (listening) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    audioRef.current = audioCtx;
    sourceRef.current = audioCtx.createMediaStreamSource(stream);
    // analyser sized for pitchy
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    sourceRef.current.connect(analyser);

    // Create detector
    detectorRef.current = PitchDetector.forFloat32Array(
      analyser.fftSize,
      audioCtx.sampleRate
    );

    setListening(true);
    tick();
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioRef.current) {
      // closing AudioContext releases the mic
      audioRef.current.close();
      audioRef.current = null;
    }
    sourceRef.current = null;
    analyserRef.current = null;
    detectorRef.current = null;
    setListening(false);
    setLastDetectedFreq(null);
    setLastCents(null);
    setLastNoteIndex(null);
  };

  const tick = () => {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    if (!analyser || !detector) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const floatBuffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(floatBuffer);
    const [pitch, clarityVal] = detector.findPitch(
      floatBuffer,
      audioRef.current!.sampleRate
    );
    setClarity(clarityVal);
    if (pitch && pitch > 0) {
      setLastDetectedFreq(pitch);
      // find which scheduled note this pitch should be compared to
      if (schedule && schedule.length > 0 && audioRef.current) {
        // current audio context time in seconds since creation — convert to absolute Tone-like times by relative offset
        // Since schedule times are Tone.now()-based, we will approximate with performance.now() alignment.
        // Simpler: assume schedule times are in the same epoch as audio context time (they are both seconds since page load).
        const currentTime =
          audioRef.current.currentTime + (audioRef.current.baseLatency || 0);
        // find the nearest scheduled item where currentTime lies within the note's onset..onset+lookahead window
        let best: { item: any; dt: number } | null = null;
        for (const item of schedule) {
          const dt = currentTime - item.time;
          // allow a small window around the start of the note and during its duration
          if (Math.abs(dt) <= Math.max(0.5, lookahead + 0.25)) {
            if (!best || Math.abs(dt) < Math.abs(best.dt)) best = { item, dt };
          }
        }
        if (best) {
          const cents = centsDifference(pitch, best.item.freq);
          setLastCents(cents === null ? null : Math.round(cents * 10) / 10); // round to 0.1 cent
          setLastNoteIndex(best.item.noteIndex);
        }
      }
    } else {
      setLastDetectedFreq(null);
      setLastCents(null);
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div style={{ textAlign: "center", marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <Button variant="contained" onClick={start} disabled={listening}>
          Start Mic
        </Button>
        <Button variant="outlined" onClick={stop} disabled={!listening}>
          Stop Mic
        </Button>
      </div>

      <Typography variant="body1">
        Detected pitch:{" "}
        {lastDetectedFreq ? lastDetectedFreq.toFixed(1) + " Hz" : "—"}
      </Typography>
      <Typography variant="body1">
        Clarity: {clarity ? clarity.toFixed(2) : "—"}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1 }}>
        {lastCents === null
          ? "Sing when you hear the note — cents deviation will appear."
          : `Note #${lastNoteIndex ?? "-"}: ${
              lastCents > 0 ? "+" : ""
            }${lastCents} cents`}
      </Typography>

      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        (Positive = sharp, Negative = flat)
      </Typography>
    </div>
  );
}
