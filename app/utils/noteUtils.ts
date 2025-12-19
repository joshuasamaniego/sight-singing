// app/components/noteUtils.ts
export const NOTE_TO_SEMITONE = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// Convert e.g. "C4" -> frequency (Hz)
export function noteNameToFrequency(noteName: string) {
  // parse letter, accidental, octave
  const match = noteName.match(/^([A-G][b#]?)(\d+)$/i);
  if (!match) throw new Error("Invalid note name: " + noteName);
  const pitchClass = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);

  const semitoneFromC0 = octave * 12 + NOTE_TO_SEMITONE[pitchClass];
  // A4 = 440 Hz → A4 is semitone number: 4*12 + 9 = 57 (if C0 = 0)
  const semitoneA4 = 4 * 12 + NOTE_TO_SEMITONE["A"]; // 4*12 + 9 = 57
  const semitoneDiff = semitoneFromC0 - semitoneA4;
  // Frequency formula: f = 440 * 2^(semitoneDiff/12)
  return 440 * Math.pow(2, semitoneDiff / 12);
}

// cents difference: positive means sungPitch is sharp relative to target
export function centsDifference(sungFreq: number, targetFreq: number) {
  if (!sungFreq || !targetFreq || sungFreq <= 0 || targetFreq <= 0) return null;
  const ratio = sungFreq / targetFreq;
  const cents = 1200 * Math.log2(ratio); // 1200 cents per octave
  return cents;
}
