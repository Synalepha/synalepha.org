"use client";
import { useEffect, useState } from "react";

export function DraftArrival() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setReady(Boolean(localStorage.getItem("loudpage-disposable-page"))),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  if (!ready) return null;
  return (
    <div className="draft-arrival" role="status">
      <span aria-hidden="true">✓</span>
      <div><b>Your page is ready.</b><p>Create your private account to save it. Your draft stays in this browser until then.</p></div>
    </div>
  );
}
