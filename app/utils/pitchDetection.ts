// eslint-disable-next-line @typescript-eslint/no-require-imports
const pitchyModule = require("pitchy");

export interface PitchDetectionResult {
  frequency: number | null;
  confidence: number;
  cents: number;
  isAccurate: boolean;
}

export async function detectPitch(
  audioBuffer: Float32Array,
): Promise<PitchDetectionResult> {
  try {
    if (!audioBuffer || audioBuffer.length === 0) {
      return {
        frequency: null,
        confidence: 0,
        cents: 0,
        isAccurate: false,
      };
    }

    // Get PitchDetector from module
    const { PitchDetector } = pitchyModule;

    const inputLength = 4096;

    // Take the LAST 4096 samples for most recent audio
    const startIndex = Math.max(0, audioBuffer.length - inputLength);
    const properBuffer = audioBuffer.slice(
      startIndex,
      startIndex + inputLength,
    );

    console.log("Detector buffer length:", properBuffer.length);
    console.log(
      "Audio buffer slice from",
      startIndex,
      "to",
      startIndex + inputLength,
    );

    // Ensure buffer is exactly inputLength
    const finalBuffer = new Float32Array(inputLength);
    finalBuffer.set(properBuffer);

    const detector = PitchDetector.forFloat32Array(inputLength);
    const [frequency, clarity] = detector.findPitch(finalBuffer, 44100);

    console.log(
      "Detector returned - frequency:",
      frequency,
      "clarity:",
      clarity,
    );

    if (!frequency || frequency < 50 || frequency > 500) {
      return {
        frequency: null,
        confidence: clarity,
        cents: 0,
        isAccurate: false,
      };
    }

    return {
      frequency: frequency,
      confidence: clarity,
      cents: 0,
      isAccurate: clarity > 0.9,
    };
  } catch (error) {
    console.error("Pitch detection error:", error);
    return {
      frequency: null,
      confidence: 0,
      cents: 0,
      isAccurate: false,
    };
  }
}

export function calculateCents(
  detectedFrequency: number,
  targetFrequency: number,
): number {
  if (detectedFrequency <= 0 || targetFrequency <= 0) return 0;
  return Math.round(1200 * Math.log2(detectedFrequency / targetFrequency));
}

export function getAccuracyFeedback(cents: number): {
  status: "perfect" | "close" | "low" | "high" | "none";
  message: string;
} {
  if (cents === 0) {
    return { status: "none", message: "Listening..." };
  }

  if (Math.abs(cents) <= 20) {
    return { status: "perfect", message: `🎯 Perfect! (${cents} cents)` };
  } else if (Math.abs(cents) <= 50) {
    return { status: "close", message: `📍 Very Close! (${cents} cents)` };
  } else if (cents > 0) {
    return { status: "high", message: `📈 Too High (${cents} cents)` };
  } else {
    return { status: "low", message: `📉 Too Low (${cents} cents)` };
  }
}
