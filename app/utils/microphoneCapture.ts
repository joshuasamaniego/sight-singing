let mediaStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioData: Float32Array[] = [];
let captureInterval: NodeJS.Timeout | null = null;

export async function startMicrophoneCapture(): Promise<void> {
  try {
    audioData = [];
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass() as AudioContext;

    const source = (audioContext as any).createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Capture audio data periodically
    captureInterval = setInterval(() => {
      if (analyser) {
        const data = new Float32Array(4096);
        analyser.getFloatTimeDomainData(data);
        audioData.push(new Float32Array(data));
      }
    }, 50);
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw error;
  }
}

export function stopMicrophoneCapture(): Float32Array {
  console.log("Stopping capture. Audio chunks collected:", audioData.length);

  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  console.log("Total audio data chunks:", audioData.length);

  const totalLength = audioData.reduce((acc, arr) => acc + arr.length, 0);
  console.log("Total audio length:", totalLength);

  const combined = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of audioData) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  audioData = [];
  return combined;
}
