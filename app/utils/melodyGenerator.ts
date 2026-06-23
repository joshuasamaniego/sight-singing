// All notes in an octave
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Define intervals with their semitone distances
export const INTERVALS = {
  Unison: 0,
  "Minor 2nd": 1,
  "Major 2nd": 2,
  "Minor 3rd": 3,
  "Major 3rd": 4,
  "Perfect 4th": 5,
  "Augmented 4th": 6,
  "Perfect 5th": 7,
  "Minor 6th": 8,
  "Major 6th": 9,
  "Minor 7th": 10,
  "Major 7th": 11,
  Octave: 12,
} as const;

export interface MelodyNote {
  note: string; // e.g., "C4"
  frequency: number; // Hz
  midi: number; // MIDI note number
}

export interface Melody {
  notes: MelodyNote[];
  key: string; // e.g., "C4" - the starting note
  interval: keyof typeof INTERVALS; // e.g., "Major 3rd"
}

/**
 * Parse a note string like "C#4" into note name and octave
 */
function parseNote(noteString: string): { note: string; octave: number } {
  const match = noteString.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new Error(`Invalid note format: ${noteString}`);

  return {
    note: match[1], // "C#" or "C"
    octave: parseInt(match[2]), // "4"
  };
}

/**
 * Convert note name and octave to MIDI number
 * C4 = 60 (middle C)
 */
function noteToMidi(noteString: string): number {
  const { note, octave } = parseNote(noteString);
  const noteIndex = NOTES.indexOf(note);

  if (noteIndex === -1) throw new Error(`Invalid note: ${note}`);

  // MIDI formula: C4 is 60
  return 12 + octave * 12 + noteIndex;
}

/**
 * Convert MIDI number to note string
 */
function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTES[noteIndex]}${octave}`;
}

/**
 * Convert MIDI number to frequency (Hz)
 * A4 = 440 Hz
 */
function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Generate a random key within bass range
 * Bass tessitura: G2 to D4 (comfortable singing range)
 */
function getRandomKey(): string {
  // G2 = MIDI 43, D4 = MIDI 62
  const minMidi = noteToMidi("G2"); // 43
  const maxMidi = noteToMidi("D4"); // 62

  const randomMidi =
    Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
  return midiToNote(randomMidi);
}

/**
 * Get a random interval
 */
function getRandomInterval(): keyof typeof INTERVALS {
  const intervalNames = Object.keys(INTERVALS) as (keyof typeof INTERVALS)[];
  return intervalNames[Math.floor(Math.random() * intervalNames.length)];
}

/**
 * Create a melody object with 2 half notes
 * Stays within bass range (G2 to D4)
 */
export function generateMelody(): Melody {
  let key = getRandomKey();
  let interval = getRandomInterval();
  let intervalSemitones = INTERVALS[interval];

  // Get MIDI values
  const firstMidi = noteToMidi(key);
  let secondMidi = firstMidi + intervalSemitones;

  // Ensure second note stays within bass range (G2 = 43 to D4 = 62)
  const minMidi = noteToMidi("G2"); // 43
  const maxMidi = noteToMidi("D4"); // 62

  // If second note is out of range, reduce the interval
  if (secondMidi > maxMidi) {
    // Try smaller intervals until we fit
    const availableIntervals = Object.entries(INTERVALS)
      .filter(([_, semitones]) => firstMidi + semitones <= maxMidi)
      .map(([name]) => name as keyof typeof INTERVALS);

    if (availableIntervals.length === 0) {
      // If no intervals fit, pick a lower starting note
      key = midiToNote(
        Math.floor(Math.random() * (maxMidi - minMidi - 12)) + minMidi,
      );
      interval = getRandomInterval();
      intervalSemitones = INTERVALS[interval];
      secondMidi = noteToMidi(key) + intervalSemitones;
    } else {
      // Use a random interval that fits
      interval =
        availableIntervals[
          Math.floor(Math.random() * availableIntervals.length)
        ];
      intervalSemitones = INTERVALS[interval];
      secondMidi = noteToMidi(key) + intervalSemitones;
    }
  }

  if (secondMidi < minMidi) {
    secondMidi = minMidi;
  }

  // First note
  const firstNote: MelodyNote = {
    note: key,
    midi: firstMidi,
    frequency: midiToFrequency(firstMidi),
  };

  // Second note
  const secondNoteName = midiToNote(secondMidi);
  const secondNote: MelodyNote = {
    note: secondNoteName,
    midi: secondMidi,
    frequency: midiToFrequency(secondMidi),
  };

  return {
    notes: [firstNote, secondNote],
    key,
    interval,
  };
}

/**
 * Utility to get all interval names (for UI dropdowns if needed)
 */
export function getIntervalNames(): (keyof typeof INTERVALS)[] {
  return Object.keys(INTERVALS) as (keyof typeof INTERVALS)[];
}
