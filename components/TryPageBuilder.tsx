"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CreationObjects } from "@/components/CreationObjects";

const themes = {
  electric: { label: "Neon bedroom", accent: "#684fd3", shadow: "#16839a" },
  midnight: { label: "Midnight mixtape", accent: "#c23e72", shadow: "#f4e8d2" },
  sunset: { label: "Disposable sunset", accent: "#a9472f", shadow: "#e7c84e" },
  paper: { label: "Paper letter", accent: "#171522", shadow: "#dceaf0" },
} as const;
type ThemeKey = keyof typeof themes;

export function TryPageBuilder() {
  const [name, setName] = useState("Maya");
  const [bio, setBio] = useState("night owl · camera collector");
  const [feeling, setFeeling] = useState("electric");
  const [note, setNote] = useState("making a smaller internet with better lighting");
  const [song, setSong] = useState("Midnight Receiver — Neon Exit");
  const [theme, setTheme] = useState<ThemeKey>("midnight");
  const [audience, setAudience] = useState<"private" | "people" | "anyone">("private");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem("roomtone-page-draft-v1") || localStorage.getItem("loudpage-disposable-page");
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        setName(d.name || "Maya");
        setBio(d.bio || d.headline || "");
        setFeeling(d.feeling || d.mood || "electric");
        setNote(d.note || "making a smaller internet with better lighting");
        setSong(d.song || "Midnight Receiver — Neon Exit");
        setTheme(d.theme in themes ? d.theme : "midnight");
        setAudience(["private", "people", "anyone"].includes(d.audience) ? d.audience : "private");
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "roomtone-page-draft-v1",
      JSON.stringify({ name, bio, feeling, note, song, theme, audience }),
    );
    const show = window.setTimeout(() => setSaved(true), 0);
    const hide = window.setTimeout(() => setSaved(false), 1000);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [name, bio, feeling, note, song, theme, audience]);

  const initial = useMemo(() => name.trim().slice(0, 1).toUpperCase() || "Y", [name]);
  const audienceLabel = audience === "private" ? "Only me" : audience === "people" ? "My people" : "Anyone";

  return (
    <section className="canvas-builder" id="try-builder">
      <header className="canvas-intro">
        <div>
          <p className="eyebrow">TOUCH IT. MAKE IT YOURS.</p>
          <h2>Your first page is already here.</h2>
          <p>Edit the page. It stays private.</p>
        </div>
        <div className="canvas-save" role="status" aria-live="polite">
          {saved ? "Private draft saved" : "Private browser draft"}
        </div>
      </header>

      <div className="canvas-tools" aria-label="Page style">
        <span>Choose a room</span>
        <div>
          {Object.entries(themes).map(([key, value]) => (
            <button
              type="button"
              key={key}
              aria-pressed={theme === key}
              onClick={() => setTheme(key as ThemeKey)}
              style={{ "--swatch": value.accent } as CSSProperties}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`living-canvas canvas-${theme}`}
        style={{ "--demo-accent": themes[theme].accent, "--demo-shadow": themes[theme].shadow } as CSSProperties}
      >
        <div className="canvas-topline">
          <span>YOUR ROOMTONE</span>
          <label>
            <span className="sr-only">Who can see this page</span>
            <select value={audience} onChange={(event) => setAudience(event.target.value as typeof audience)}>
              <option value="private">◉ Only me</option>
              <option value="people">◉ My people</option>
              <option value="anyone">◉ Anyone</option>
            </select>
          </label>
        </div>

        <section className="canvas-identity" aria-label="Identity">
          <div className="canvas-avatar" aria-hidden="true">{initial}</div>
          <label>
            <span className="sr-only">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} aria-label="Your name" />
          </label>
          <label>
            <span className="sr-only">Short bio</span>
            <input value={bio} onChange={(e) => setBio(e.target.value)} maxLength={80} aria-label="Short bio" />
          </label>
        </section>

        <p className="canvas-handwritten" aria-hidden="true">made by a person, not assembled by a feed</p>

        <section className="right-now" aria-labelledby="right-now-title">
          <div>
            <p className="eyebrow" id="right-now-title">RIGHT NOW</p>
            <span>Visible to {audienceLabel.toLowerCase()}</span>
          </div>
          <label>
            <span>Feeling</span>
            <input value={feeling} onChange={(e) => setFeeling(e.target.value)} maxLength={80} />
          </label>
          <label>
            <span>A note from now</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={180} rows={2} />
          </label>
          <label>
            <span>Playing</span>
            <input value={song} onChange={(e) => setSong(e.target.value)} maxLength={160} />
          </label>
          <time>Updated just now</time>
        </section>
        <CreationObjects />

        <footer className="canvas-claim">
          <div><b>{audienceLabel}</b><span>This page is not published.</span></div>
          <Link className="primary" href="/signup?from=draft">Save my page →</Link>
        </footer>
      </div>
    </section>
  );
}
