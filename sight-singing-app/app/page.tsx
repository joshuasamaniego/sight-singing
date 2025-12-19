"use client";
import { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import Playback from "./components/Playback";
import Staff from "./components/Staff";
import { generateMelody } from "./utils/melodyGenerator";

export default function HomePage() {
  const [tempo, setTempo] = useState<number>(100);
  const [meter, setMeter] = useState<string>("4/4");
  const [numMeasures, setNumMeasures] = useState<number>(2);
  const [melody, setMelody] = useState(generateMelody(meter, numMeasures));

  const handleGenerateMelody = () => {
    setMelody(generateMelody(meter, numMeasures));
  };

  return (
    <main style={{ padding: 20 }}>
      <ControlPanel
        tempo={tempo}
        meter={meter}
        numMeasures={numMeasures}
        onTempoChange={setTempo}
        onMeterChange={setMeter}
        onNumMeasuresChange={setNumMeasures}
        onGenerateMelody={handleGenerateMelody}
      />

      <Staff melody={melody} meter={meter} numMeasures={numMeasures} />
      <Playback melody={melody} tempo={tempo} />
    </main>
  );
}
