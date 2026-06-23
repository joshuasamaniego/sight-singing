import { Melody } from "./melodyGenerator";

export interface AudioConfig {
  tempo: number;
  gain?: number;
}

let currentAudioContext: AudioContext | null = null;

function calculateNoteDuration(tempoMidi: number): number {
  return (2 / tempoMidi) * 60;
}

function playNote(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  startTime: number,
  gain: number,
): void {
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

  const attackTime = 0.05;
  const releaseTime = 0.1;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + attackTime);
  gainNode.gain.setValueAtTime(gain, startTime + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
}

export async function playMelody(
  melody: Melody,
  config: AudioConfig,
): Promise<void> {
  const audioContext = new (
    window.AudioContext || (window as any).webkitAudioContext
  )();
  currentAudioContext = audioContext;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const noteDuration = calculateNoteDuration(config.tempo);
  const gainLevel = config.gain ?? 0.3;
  const currentTime = audioContext.currentTime;

  melody.notes.forEach((note, index) => {
    const startTime = currentTime + index * noteDuration;
    playNote(audioContext, note.frequency, noteDuration, startTime, gainLevel);
  });

  return new Promise((resolve) => {
    const totalDuration = melody.notes.length * noteDuration;
    setTimeout(() => {
      if (currentAudioContext === audioContext) {
        currentAudioContext = null;
      }
      resolve();
    }, totalDuration * 1000);
  });
}

export async function playReferenceTone(
  frequency: number,
  durationMs: number = 2000,
): Promise<void> {
  const audioContext = new (
    window.AudioContext || (window as any).webkitAudioContext
  )();
  currentAudioContext = audioContext;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const startTime = audioContext.currentTime;
  const duration = durationMs / 1000;
  const attackTime = 0.05;
  const releaseTime = 0.1;

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + attackTime);
  gainNode.gain.setValueAtTime(0.3, startTime + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  return new Promise((resolve) => {
    setTimeout(() => {
      if (currentAudioContext === audioContext) {
        currentAudioContext = null;
      }
      resolve();
    }, durationMs);
  });
}

export function stopAudio(): void {
  if (currentAudioContext) {
    currentAudioContext.close();
    currentAudioContext = null;
  }
}
