"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type ObjectKey = "photo" | "mixtape" | "note" | "sticker";
type Audience = "private" | "people" | "anyone";
const labels = {
  en: {
    tools: "Objects",
    photo: "Photo strip",
    note: "Note",
    mixtape: "Mixtape",
    sticker: "Stickers + doodles",
    addPhoto: "Choose photos",
    alt: "Describe the photo",
    calm: "Calm",
    reading: "Reading comfort",
    data: "Low data",
    local: "Local preview · not uploaded",
    only: "Only me",
    people: "My people",
    anyone: "Anyone",
    up: "Move up",
    down: "Move down",
  },
  es: {
    tools: "Objetos",
    photo: "Tira de fotos",
    note: "Nota",
    mixtape: "Mixtape",
    sticker: "Pegatinas + dibujos",
    addPhoto: "Elegir fotos",
    alt: "Describe la foto",
    calm: "Calma",
    reading: "Lectura cómoda",
    data: "Datos bajos",
    local: "Vista local · no publicada",
    only: "Solo yo",
    people: "Mi gente",
    anyone: "Cualquiera",
    up: "Subir",
    down: "Bajar",
  },
} as const;

export function CreationObjects() {
  const [language, setLanguage] = useState<keyof typeof labels>("en");
  const [calm, setCalm] = useState(false);
  const [reading, setReading] = useState(false);
  const [lowData, setLowData] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [note, setNote] = useState("keep the blurry ones");
  const [tracks, setTracks] = useState(["the drive home", "2:17 AM", "play this last"]);
  const [sticker, setSticker] = useState("★");
  const [doodle, setDoodle] = useState("〰︎");
  const [order, setOrder] = useState<ObjectKey[]>(["photo", "mixtape", "note", "sticker"]);
  const [audience, setAudience] = useState<Record<ObjectKey, Audience>>({ photo: "private", mixtape: "people", note: "people", sticker: "people" });
  const objectUrl = useRef("");
  const t = labels[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem("roomtone-object-draft-v1");
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        setAlt(data.alt || "");
        setNote(data.note || "keep the blurry ones");
        if (Array.isArray(data.tracks)) setTracks(data.tracks);
        setSticker(data.sticker || "★");
        setDoodle(data.doodle || "〰︎");
        if (Array.isArray(data.order)) setOrder(data.order);
        if (data.audience) setAudience(data.audience);
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("roomtone-object-draft-v1", JSON.stringify({ alt, note, tracks, sticker, doodle, order, audience }));
  }, [alt, note, tracks, sticker, doodle, order, audience]);

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function choosePhoto(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setPhotoUrl(objectUrl.current);
  }

  function move(index: number, change: -1 | 1) {
    const target = index + change;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  function AudienceControl({ objectKey }: { objectKey: ObjectKey }) {
    return (
      <label className="object-audience">
        <span className="sr-only">Who can see this object?</span>
        <select value={audience[objectKey]} onChange={(event) => setAudience((current) => ({ ...current, [objectKey]: event.target.value as Audience }))}>
          <option value="private">● {t.only}</option>
          <option value="people">● {t.people}</option>
          <option value="anyone">● {t.anyone}</option>
        </select>
      </label>
    );
  }

  return (
    <section className={`creation-objects ${calm ? "is-calm" : ""} ${reading ? "is-reading" : ""} ${lowData ? "is-low-data" : ""}`} aria-labelledby="objects-title">
      <div className="object-toolbar">
        <b id="objects-title">{t.tools}</b>
        <button type="button" onClick={() => setLanguage((value) => value === "en" ? "es" : "en")}>{language === "en" ? "ES" : "EN"}</button>
        <button type="button" aria-pressed={calm} onClick={() => setCalm((value) => !value)}>{t.calm}</button>
        <button type="button" aria-pressed={reading} onClick={() => setReading((value) => !value)}>{t.reading}</button>
        <button type="button" aria-pressed={lowData} onClick={() => setLowData((value) => !value)}>{t.data}</button>
      </div>
      <div className="object-stack">
        {order.map((objectKey, index) => (
          <article className={`creation-object object-${objectKey}`} key={objectKey}>
            <header>
              <b>{t[objectKey]}</b>
              <AudienceControl objectKey={objectKey} />
              <div className="object-move">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`${t.up}: ${t[objectKey]}`}>↑</button>
                <button type="button" disabled={index === order.length - 1} onClick={() => move(index, 1)} aria-label={`${t.down}: ${t[objectKey]}`}>↓</button>
              </div>
            </header>
            {objectKey === "photo" && (
              <div className="photo-tool">
                <label className="photo-picker">＋ {t.addPhoto}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => choosePhoto(event.target.files?.[0])} /></label>
                {photoUrl ? (
                  <div className="photo-strip">
                    {(lowData ? ["one"] : ["one", "two", "three", "four"]).map((frame) => <div key={frame} role="img" aria-label={alt || t.alt} style={{ backgroundImage: `url(${photoUrl})` } as CSSProperties} />)}
                  </div>
                ) : <div className="photo-empty" aria-hidden="true"><i /><i /><i /><i /></div>}
                <label>{t.alt}<input value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={500} /></label>
                <small>{t.local}</small>
              </div>
            )}
            {objectKey === "note" && <textarea className="tape-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={180} aria-label={t.note} />}
            {objectKey === "mixtape" && (
              <div className="mixtape-tool">
                <div className="cassette" aria-hidden="true"><span>ROOMTONE</span><i /><b>60</b></div>
                <ol>
                  {tracks.map((track, trackIndex) => (
                    <li key={trackIndex}><span>{String(trackIndex + 1).padStart(2, "0")}</span><input value={track} onChange={(event) => setTracks((current) => current.map((value, index) => index === trackIndex ? event.target.value : value))} maxLength={80} aria-label={`Track ${trackIndex + 1}`} /></li>
                  ))}
                </ol>
                <small>Titles or external links only · nothing autoplays</small>
              </div>
            )}
            {objectKey === "sticker" && (
              <div className="sticker-tool">
                <div>{["★", "♥", "☻", "✿", "⚡"].map((item) => <button type="button" key={item} aria-pressed={sticker === item} onClick={() => setSticker(item)}>{item}</button>)}</div>
                <div>{["〰︎", "↝", "⌁", "✦"].map((item) => <button type="button" key={item} aria-pressed={doodle === item} onClick={() => setDoodle(item)}>{item}</button>)}</div>
                <output aria-label="Selected sticker and doodle"><span>{sticker}</span><i>{doodle}</i></output>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
