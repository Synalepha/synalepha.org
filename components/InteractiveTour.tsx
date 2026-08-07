"use client";
import Link from "next/link";
import { useState } from "react";
const steps = [
  {
    k: "CHOOSE",
    title: "Claim a handle",
    copy: "One account. One page. Set the audience before anything leaves backstage.",
    signal: "@maya",
    detail: "Audience · Only me",
  },
  {
    k: "SHAPE",
    title: "Choose your signal",
    copy: "Pick a template, typography, rhythm, story, mood, and profile song.",
    signal: "MIDNIGHT SIGNAL",
    detail: "Browser draft · saved",
  },
  {
    k: "PREVIEW",
    title: "See what they see",
    copy: "Public Preview displays the exact audience, modules, and styling without another login.",
    signal: "PUBLIC PREVIEW",
    detail: "Audience · Friends only",
  },
  {
    k: "CONNECT",
    title: "Invite actual humans",
    copy: "Mutual friendships unlock messages. Age-group separation and private blocks are enforced.",
    signal: "3 FRIENDS",
    detail: "Feed · newest first",
  },
];
export function InteractiveTour() {
  const [active, setActive] = useState(0),
    step = steps[active];
  return (
    <section className="interactive-tour" id="demo">
      <div>
        <p className="eyebrow">30-SECOND INTERACTIVE TOUR</p>
        <h2>Do not imagine the loop. Touch it.</h2>
        <div
          className="tour-tabs"
          role="tablist"
          aria-label="LoudPage product tour"
        >
          {steps.map((item, index) => (
            <button
              key={item.k}
              role="tab"
              aria-selected={active === index}
              aria-controls="tour-panel"
              onClick={() => setActive(index)}
            >
              <b>0{index + 1}</b>
              <span>{item.k}</span>
            </button>
          ))}
        </div>
        <div id="tour-panel" role="tabpanel" className="tour-copy">
          <p className="eyebrow">STEP 0{active + 1}</p>
          <h3>{step.title}</h3>
          <p>{step.copy}</p>
          <div className="tour-controls">
            <button
              disabled={active === 0}
              onClick={() => setActive((value) => value - 1)}
            >
              ← Back
            </button>
            {active < steps.length - 1 ? (
              <button
                className="primary"
                onClick={() => setActive((value) => value + 1)}
              >
                Next step →
              </button>
            ) : (
              <Link className="primary" href="/signup">
                Build mine →
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className={`tour-live-card tour-step-${active}`} aria-live="polite">
        <div className="windowbar">
          <span>● ● ●</span>
          <b>synalepha.org/u/maya</b>
        </div>
        <div className="tour-signal">
          <small>{step.signal}</small>
          <strong>{step.detail}</strong>
        </div>
        <div className="profile-head">
          <div className="avatar">M</div>
          <div>
            <h3>MAYA ☻</h3>
            <p>designer · night owl · human</p>
          </div>
        </div>
        <div className="tour-modules">
          <span>ABOUT ME</span>
          <span>PROFILE SONG</span>
          <span>INNER CIRCLE</span>
        </div>
        <Link href="/u/maya">Open the working staged profile →</Link>
      </div>
    </section>
  );
}
