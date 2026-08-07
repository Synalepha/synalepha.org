"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
const themes = {
  electric: { label: "Electric", accent: "#7c5cff", shadow: "#19d7ff" },
  midnight: { label: "Midnight", accent: "#ff4fa3", shadow: "#19d7ff" },
  sunset: { label: "Sunset", accent: "#ff725e", shadow: "#ffd84a" },
  paper: { label: "Paper", accent: "#46513f", shadow: "#d6b45a" },
} as const;
const starters = ["About me", "Page signal", "Profile song", "Chosen people"];
type ThemeKey = keyof typeof themes;
export function TryPageBuilder() {
  const [name, setName] = useState("Maya"),
    [headline, setHeadline] = useState("night owl · camera collector"),
    [mood, setMood] = useState("electric"),
    [theme, setTheme] = useState<ThemeKey>("midnight"),
    [modules, setModules] = useState(starters),
    [saved, setSaved] = useState(false),
    [mobile, setMobile] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = localStorage.getItem("loudpage-disposable-page");
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        setName(d.name || "Maya");
        setHeadline(d.headline || "");
        setMood(d.mood || "electric");
        setTheme(d.theme in themes ? d.theme : "midnight");
        setModules(Array.isArray(d.modules) ? d.modules : starters);
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "loudpage-disposable-page",
      JSON.stringify({ name, headline, mood, theme, modules }),
    );
    const show = setTimeout(() => setSaved(true), 0),
      hide = setTimeout(() => setSaved(false), 900);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [name, headline, mood, theme, modules]);
  const initials = useMemo(
    () => name.trim().slice(0, 1).toUpperCase() || "Y",
    [name],
  );
  function move(index: number, direction: -1 | 1) {
    const next = [...modules],
      target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setModules(next);
  }
  return (
    <section className="try-builder" id="try-builder">
      <div className="builder-intro">
        <p className="eyebrow">THE 60-SECOND CREATION MIRACLE</p>
        <h2>Make something before we ask for anything.</h2>
        <p>
          This page lives only in this browser until you choose to claim it. No
          account. No fake publishing. No surprise upload.
        </p>
        <div className="builder-fields">
          <label>
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </label>
          <label>
            Your one-line signal
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={80}
            />
          </label>
          <label>
            Mood
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              maxLength={40}
            />
          </label>
        </div>
        <fieldset>
          <legend>Choose a visual seed</legend>
          <div className="theme-choices">
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
        </fieldset>
        <div className="module-order">
          <b>Arrange your page</b>
          {modules.map((module, index) => (
            <div key={module}>
              <span aria-hidden="true">⠿</span>
              <strong>{module}</strong>
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${module} up`}
              >
                ↑
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === modules.length - 1}
                aria-label={`Move ${module} down`}
              >
                ↓
              </button>
            </div>
          ))}
        </div>
        <div className="builder-actions">
          <button
            className="secondary-button"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? "Show desktop" : "Preview mobile"}
          </button>
          <Link className="primary" href="/signup">
            Claim this page →
          </Link>
          <span role="status">{saved ? "Saved in this browser" : ""}</span>
        </div>
      </div>
      <div
        className={`disposable-preview ${mobile ? "is-mobile" : ""}`}
        style={
          {
            "--demo-accent": themes[theme].accent,
            "--demo-shadow": themes[theme].shadow,
          } as CSSProperties
        }
      >
        <div className="windowbar">
          <span>● ● ●</span>
          <b>your future page</b>
        </div>
        <div className="disposable-identity">
          <div>{initials}</div>
          <p className="eyebrow">LOUDPAGE / UNCLAIMED</p>
          <h3>{name || "Your name"}</h3>
          <p>{headline || "Your signal goes here"}</p>
          <mark>mood: {mood || "unset"}</mark>
        </div>
        {modules.map((module, index) => (
          <div className="disposable-module" key={module}>
            <small>0{index + 1}</small>
            <b>{module}</b>
            <span>
              {module === "Page signal"
                ? "◉ broadcasting gently"
                : module === "Profile song"
                  ? "▶ nothing autoplays"
                  : module === "Chosen people"
                    ? "mutuals, not followers"
                    : "write like a human"}
            </span>
          </div>
        ))}
        <p className="preview-truth">PRIVATE BROWSER DRAFT · NOT PUBLISHED</p>
      </div>
    </section>
  );
}
