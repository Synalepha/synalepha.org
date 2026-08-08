"use client";
import Link from "next/link";
import { useState } from "react";

const memories = [
  {
    year: "NOTE",
    label: "The sentence",
    title: "You write differently when one person might read it.",
    note: "out getting fries. leave something good.",
    track: "♫ track 04 · the one you never skipped",
  },
  {
    year: "TAPE",
    label: "The sequence",
    title: "Three songs can say the thing you still cannot.",
    note: "FOR THE DRIVE HOME — do not shuffle",
    track: "74:12 · written in permanent marker",
  },
  {
    year: "PHOTO",
    label: "The evidence",
    title: "Keep the picture that proves you were really there.",
    note: "last train. wet shoes. worth it.",
    track: "4 photos · one impossible expression",
  },
] as const;

export function TimeCapsule() {
  const [active, setActive] = useState(0);
  const [heard, setHeard] = useState(false);
  const memory = memories[active];

  function playMemory() {
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.15);
    master.connect(context.destination);
    const notes = active === 0 ? [880, 1200, 680, 1450] : active === 1 ? [220, 277, 330, 440] : [523, 659, 784];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = active === 0 ? "square" : active === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(master);
      const start = context.currentTime + index * 0.18;
      oscillator.start(start);
      oscillator.stop(start + 0.16);
    });
    window.setTimeout(() => void context.close(), 1400);
    setHeard(true);
  }

  return (
    <section className={`time-capsule capsule-${active}`} aria-labelledby="capsule-title">
      <div className="capsule-copy">
        <p className="eyebrow">NOT CONTENT. SOMETHING YOU KEPT.</p>
        <h2 id="capsule-title">The little things carry it.</h2>
        <p>Not nostalgia as decoration. Ordinary objects made heavy by who they were meant for.</p>
        <div className="capsule-tabs" role="tablist" aria-label="Choose an object">
          {memories.map((item, index) => (
            <button key={item.year} role="tab" aria-selected={active === index} onClick={() => { setActive(index); setHeard(false); }}>
              <b>{item.year}</b><span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <article className="memory-object" aria-live="polite">
        <div className="memory-chrome"><span>● ● ●</span><b>{memory.year} / FOR SOMEONE</b></div>
        <div className="memory-body">
          <span className="memory-year">{memory.year}</span>
          <p className="eyebrow">{memory.label}</p>
          <h3>{memory.title}</h3>
          <blockquote>{memory.note}</blockquote>
          <div className="memory-track"><span aria-hidden="true">▰▰▰▱▱</span><b>{memory.track}</b></div>
        </div>
        <div className="memory-actions">
          <button type="button" onClick={playMemory}>{heard ? "Heard it ✓" : "Hear this object"}</button>
          <span>No autoplay.</span>
        </div>
      </article>

      <footer>
        <p>If it could belong to anyone, it belongs to no one.</p>
        <Link href="#try-builder">Make it specific →</Link>
      </footer>
    </section>
  );
}
