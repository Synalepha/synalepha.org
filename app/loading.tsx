export default function Loading() {
  return (
    <main className="state-page" aria-live="polite" aria-busy="true">
      <p className="eyebrow">TUNING THE SIGNAL</p>
      <div className="loading-signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <h1>Loading your corner…</h1>
    </main>
  );
}
