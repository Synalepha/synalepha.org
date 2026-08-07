"use client";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/Brand";
const friends = [
  ["Jules", "J"],
  ["Dani", "D"],
  ["Kris", "K"],
  ["Ari", "A"],
];
const themes = ["midnight", "sunset", "paper"] as const;
export function DemoProfile() {
  const [theme, setTheme] = useState<(typeof themes)[number]>("midnight"),
    [mobile, setMobile] = useState(false),
    [playing, setPlaying] = useState(false),
    [audience, setAudience] = useState<"friends" | "public">("friends"),
    [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`public-profile theme-${theme} font-serif density-spacious demo-lab ${mobile ? "demo-mobile" : ""}`}
    >
      <header className="topbar profile-topbar">
        <Brand />
        <nav>
          <Link href="/#try-builder">Build in 60 seconds</Link>
          <Link href="/#demo">Tour</Link>
          <Link className="nav-cta" href="/signup">
            Make yours
          </Link>
        </nav>
      </header>
      <div className="demo-banner">
        <b>STAGED PRODUCT LAB</b>
        <span>
          Every control below works. Maya is a demonstration—not a real member
          or invented social proof.
        </span>
        <Link href="/signup">Claim your own</Link>
      </div>
      <div className="demo-labbar" aria-label="Demo controls">
        <div>
          <b>TOUCH THE PRODUCT</b>
          <span>Nothing here changes a real account.</span>
        </div>
        <label>
          Theme
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
          >
            {themes.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Audience
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
          >
            <option value="friends">Friends only</option>
            <option value="public">Everyone</option>
          </select>
        </label>
        <button onClick={() => setMobile((v) => !v)} aria-pressed={mobile}>
          {mobile ? "Desktop frame" : "Mobile frame"}
        </button>
      </div>
      <main className="public-page">
        <section className="profile-hero">
          <div className="profile-avatar">M</div>
          <div>
            <p className="eyebrow">LOUDPAGE / MAYA</p>
            <h1>Maya ☻</h1>
            <p>Chicago · mood: electric</p>
          </div>
          <span className="secondary-button">
            {audience === "friends" ? "Friends only" : "Everyone"}
          </span>
        </section>
        <section className={`profile-player ${playing ? "is-playing" : ""}`}>
          <button
            onClick={() => setPlaying((v) => !v)}
            aria-label={
              playing
                ? "Pause profile song preview"
                : "Play profile song preview"
            }
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <div>
            <small>PROFILE SONG · SAFE 8-SECOND DEMO</small>
            <b>Midnight Receiver — Neon Exit</b>
          </div>
          <i>{playing ? "playing silent visual preview" : "never autoplays"}</i>
        </section>
        <div className="profile-columns">
          <div>
            <section className="page-module">
              <div className="module-title">
                <span>ABOUT ME</span>
                <i>01</i>
              </div>
              <p className="profile-bio">
                designer, night owl, collector of disposable cameras. building a
                smaller internet with better lighting.
                {expanded
                  ? " currently learning risograph printing, walking without headphones, and making websites that remember people have nervous systems."
                  : ""}
              </p>
              <button
                className="text-button"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Read the rest →"}
              </button>
            </section>
            <section className="page-module">
              <div className="module-title">
                <span>GUESTBOOK</span>
                <i>
                  {audience === "friends" ? "FRIENDS ONLY" : "VISIBLE MEMBERS"}
                </i>
              </div>
              <div className="empty compact">
                <b>Boundaries are part of the design.</b>
                <p>
                  {audience === "friends"
                    ? "Only accepted friends can sign this guestbook."
                    : "Signed-in members who can see this page may leave a note."}
                </p>
              </div>
            </section>
          </div>
          <aside>
            <section className="page-module circle-module">
              <div className="module-title">
                <span>CHOSEN PEOPLE</span>
                <i>MUTUALS · OPTIONAL</i>
              </div>
              <div className="circle-grid">
                {friends.map(([name, letter]) => (
                  <button
                    className="demo-friend"
                    key={name}
                    title={`${name} is a staged mutual friend`}
                  >
                    <div>{letter}</div>
                    <b>{name}</b>
                  </button>
                ))}
              </div>
            </section>
            <section className="page-module page-signal-card">
              <div className="module-title">
                <span>PAGE SIGNAL</span>
                <i>LIVE</i>
              </div>
              <div className="signal-orbit" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <strong>electric after midnight</strong>
              <p>♫ Midnight Receiver · ☻ open to a quiet hello</p>
              <button
                onClick={() =>
                  navigator.clipboard?.writeText(
                    "Maya is electric after midnight — synalepha.org/u/maya",
                  )
                }
              >
                Copy signal card
              </button>
            </section>
          </aside>
        </div>
        <section className="demo-proof">
          <b>WHAT THIS DEMO PROVES</b>
          <span>Theme changes</span>
          <span>Audience language</span>
          <span>Responsive frame</span>
          <span>Expandable modules</span>
          <span>Non-autoplay media</span>
          <span>Shareable signal</span>
        </section>
      </main>
    </div>
  );
}
