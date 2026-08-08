"use client";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/Brand";

const people = [["Jules", "J"], ["Dani", "D"]];
const themes = ["midnight", "sunset", "paper"] as const;

export function DemoProfile() {
  const [theme, setTheme] = useState<(typeof themes)[number]>("midnight");
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`public-profile theme-${theme} font-serif density-spacious`}>
      <header className="topbar profile-topbar">
        <Brand />
        <nav><Link href="/">Why Roomtone</Link><Link className="nav-cta" href="/#try-builder">Make yours</Link></nav>
      </header>
      <div className="example-banner"><b>EXAMPLE PAGE</b><span>Maya is fictional. The interactions are real.</span></div>
      <main className="public-page human-demo">
        <section className="profile-hero">
          <div className="profile-avatar">M</div>
          <div><p className="eyebrow">ROOMTONE / MAYA</p><h1>Maya ☻</h1><p>Chicago · designer · night owl</p></div>
          <span className="audience-chip">● My people</span>
        </section>

        <section className="right-now demo-right-now">
          <div><p className="eyebrow">RIGHT NOW</p><span>Friday · 11:42 PM</span></div>
          <strong>electric after midnight</strong>
          <p>Developing disposable-camera photos and trying not to check the time.</p>
          <button onClick={() => setPlaying((value) => !value)} aria-pressed={playing}>
            {playing ? "Ⅱ Pause visual preview" : "▶ Midnight Receiver — Neon Exit"}
          </button>
        </section>

        <section className="demo-photo page-module">
          <div className="photo-art" role="img" aria-label="Abstract example photograph in violet and cyan tones"><span>12:07 AM</span></div>
          <div><p className="eyebrow">A NOTE</p><h2>The city looks kinder after the rain.</h2><p>Neon in the puddles. The train arriving exactly when it felt like it never would.</p></div>
        </section>
        <p className="maya-margin-note">keep the blurry ones. they remember more.</p>

        <div className="profile-columns">
          <section className="page-module"><div className="module-title"><span>MY PEOPLE</span><i>MUTUAL</i></div><div className="circle-grid">{people.map(([name, letter]) => <div className="demo-friend" key={name}><div>{letter}</div><b>{name}</b></div>)}</div></section>
          <section className="page-module"><div className="module-title"><span>GUESTBOOK</span><i>EXAMPLE NOTE</i></div><blockquote>“The rain photo feels like a song.”<footer>— Jules</footer></blockquote></section>
        </div>

        <section className="demo-style-switcher" aria-label="Restyle this example">
          <span>See this page differently</span>
          {themes.map((item) => <button key={item} aria-pressed={theme === item} onClick={() => setTheme(item)}>{item}</button>)}
        </section>
        <section className="example-cta"><p>A place that changes when you do.</p><Link className="primary" href="/#try-builder">Touch a page and make it yours →</Link></section>
      </main>
    </div>
  );
}
