"use client";
import Link from "next/link";
import { useState } from "react";
const steps = [
  {
    k: "CHOOSE",
    title: "Claim a handle",
    copy: "One account. One page. Choose who can see it before it is published.",
    signal: "@maya",
    detail: "Audience · Only me",
  },
  {
    k: "SHAPE",
    title: "Make it yours",
    copy: "Choose a style, tell your story, set a mood, and add a profile song.",
    signal: "MIDNIGHT SIGNAL",
    detail: "Browser draft · saved",
  },
  {
    k: "PREVIEW",
    title: "See what they see",
    copy: "Preview the page exactly as your chosen audience will see it.",
    signal: "PUBLIC PREVIEW",
    detail: "Audience · Friends only",
  },
  {
    k: "CONNECT",
    title: "Invite your people",
    copy: "Messages open after both people connect. Adult and minor discovery stays separate.",
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
        <h2>See how a page comes to life.</h2>
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
        <Link href="/u/maya">See Maya&apos;s example page →</Link>
      </div>
    </section>
  );
}
