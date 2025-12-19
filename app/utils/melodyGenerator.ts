// app/components/melodyGenerator.ts
export type MelodyNote = {
  name: string; // e.g. "C4"
  duration: string; // "q" (quarter), "h" (half), "8" (eighth)
};

const NOTE_POOL = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "E5",
  "G4",
  "A3",
  "F4",
];

const DURATIONS = ["q", "8", "h"]; // quarter, eighth, half

export function generateMelody(
  length = 8,
  meter = { beats: 4, beatUnit: 4 }
): MelodyNote[] {
  // Create a melody that fits within the measure(s) using variable durations
  const melody: MelodyNote[] = [];
  // Keep it simple — fill sequentially with random durations but ensure not to exceed length notes count
  for (let i = 0; i < length; i++) {
    const name = NOTE_POOL[Math.floor(Math.random() * NOTE_POOL.length)];
    const duration = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
    melody.push({ name, duration });
  }
  return melody;
}
