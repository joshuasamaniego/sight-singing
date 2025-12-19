// app/components/Staff.tsx
"use client";

import { useEffect, useRef } from "react";
import Flow from "vexflow";
import { MelodyNote } from "../utils/melodyGenerator";

export default function Staff({
  melody,
  meter,
}: {
  melody: MelodyNote[];
  meter: { beats: number; beatUnit: number };
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!melody || melody.length === 0 || !meter) return;

    containerRef.current.innerHTML = "";
    const VF = Flow;
    const renderer = new VF.Renderer(
      containerRef.current,
      VF.Renderer.Backends.SVG
    );
    // size adjustable
    const width = Math.max(500, melody.length * 60);
    renderer.resize(width, 160);
    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, width - 20);
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Map durations from our strings to VexFlow durations and keys format
    const vfNotes = melody.map((n) => {
      // format key: 'c/4' or 'g/4'
      const key = n.name.slice(0, -1).toLowerCase() + "/" + n.name.slice(-1);
      // mapping durations: 'q'->'q', '8'->'8', 'h'->'h'
      return new VF.StaveNote({
        clef: "treble",
        keys: [key],
        duration: n.duration,
      });
    });

    // Add simple beams for consecutive eighths if any
    const beams: any[] = [];
    for (let i = 0; i < vfNotes.length - 1; i++) {
      // If both are eighth notes, beam them
      if (melody[i].duration === "8" && melody[i + 1].duration === "8") {
        beams.push(new VF.Beam([vfNotes[i], vfNotes[i + 1]]));
      }
    }

    // Format and draw
    VF.Formatter.FormatAndDraw(context, stave, vfNotes);
    beams.forEach((b) => b.setContext(context).draw());
  }, [melody, meter]);

  return <div ref={containerRef}></div>;
}
