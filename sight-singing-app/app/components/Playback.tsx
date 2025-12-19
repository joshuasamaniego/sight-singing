"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useRef, useState } from "react";
import * as Tone from "tone";
import { MelodyNote } from "../utils/melodyGenerator";
import { noteNameToFrequency } from "../utils/noteUtils";

type Props = {
  melody: MelodyNote[];
  tempo: number; // BPM
  onSchedule?: (
    schedule: { time: number; freq: number; noteIndex: number }[]
  ) => void;
};

export default function Playback({ melody, tempo, onSchedule }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatActive, setBeatActive] = useState(false);
  const synthRef = useRef<Tone.Synth | null>(null);
  const eventsRef = useRef<Tone.ToneEvent<any>[] | null>(null);
  const metronomeRef = useRef<Tone.Loop | null>(null);

  const durationBeats = (dur: string) =>
    dur === "h" ? 2 : dur === "q" ? 1 : 0.5;

  const startPlayback = async () => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = tempo;

    const synth = new Tone.Synth().toDestination();
    synthRef.current = synth;

    const schedule: { time: number; freq: number; noteIndex: number }[] = [];
    let currentTime = 0;

    melody.forEach((note, i) => {
      const durBeats = durationBeats(note.duration);
      const durSeconds = (durBeats * 60) / tempo;
      const freq = noteNameToFrequency(note.name);

      const evt = new Tone.ToneEvent((time) => {
        synth.triggerAttackRelease(freq, durSeconds, time);
      });
      evt.start(currentTime);
      if (!eventsRef.current) eventsRef.current = [];
      eventsRef.current.push(evt);

      schedule.push({ time: Tone.now() + currentTime, freq, noteIndex: i });
      currentTime += durBeats * (60 / tempo);
    });

    if (onSchedule) onSchedule(schedule);

    // 🔴 Create metronome pulse synced to tempo
    const loop = new Tone.Loop(() => {
      setBeatActive(true);
      setTimeout(() => setBeatActive(false), 100);
    }, "4n");
    loop.start(0);
    metronomeRef.current = loop;

    // 🕒 Schedule a stop/reset after the melody finishes
    Tone.Transport.scheduleOnce(() => {
      stopPlayback(); // auto-reset UI
    }, currentTime + 0.1); // add a tiny buffer

    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synthRef.current?.dispose();
    synthRef.current = null;
    eventsRef.current = null;
    metronomeRef.current?.dispose();
    metronomeRef.current = null;
    setIsPlaying(false);
    setBeatActive(false);
  };

  const togglePlayback = () => (isPlaying ? stopPlayback() : startPlayback());

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        variant={isPlaying ? "contained" : "outlined"}
        color={isPlaying ? "error" : "primary"}
        onClick={togglePlayback}
      >
        {isPlaying ? "Stop Playback" : "Play Melody"}
      </Button>

      {/* 🔴 Metronome LED */}
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: beatActive ? "red" : "gray",
          boxShadow: beatActive ? "0 0 10px red" : "none",
          transition: "background-color 0.1s ease",
        }}
      />
    </Stack>
  );
}
