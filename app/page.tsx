import Link from "next/link";
import { Brand } from "@/components/Brand";
import { TryPageBuilder } from "@/components/TryPageBuilder";
import { TimeCapsule } from "@/components/TimeCapsule";
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};
const people = [
  ["Maya", "M"],
  ["Jules", "J"],
  ["Dani", "D"],
  ["Kris", "K"],
];
export default function Landing() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <Brand />
        <nav>
          <a href="#try-builder">Try it</a>
          <Link href="/u/maya">Meet Maya</Link>
          <a href="#principles">Safety</a>
          <Link href="/login">Log in</Link>
          <Link className="nav-cta" href="/signup">
            Make your page
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A QUIET PLACE THAT SOUNDS LIKE YOU</p>
            <h1>
              Leave something
              <br />
              of <em>yourself.</em>
            </h1>
            <p className="lede">
              A song for the drive home. The blurry photo you kept.
              A sentence meant for four people, not four thousand.
            </p>
            <div className="hero-actions">
              <Link className="primary" href="/signup">
                Make a room
              </Link>
              <Link className="secondary" href="/u/maya">
                See Maya&apos;s page →
              </Link>
            </div>
            <p className="micro">
              Yours first. Private first.
            </p>
          </div>
          <div className="hero-proof">
            <Link href="/u/maya" className="profile-card-link">
              <div className="profile-card synth-card">
              <div className="windowbar">
                <span>● ● ●</span>
                <b>synalepha.org/u/maya</b>
              </div>
              <div className="profile-head">
                <div className="avatar">M</div>
                <div>
                  <h2>MAYA ☻</h2>
                  <p>Chicago</p>
                  <span className="mood">still awake</span>
                </div>
              </div>
              <div className="now-playing">
                <span>▶</span>
                <div>
                  <small>FOR THE DRIVE HOME</small>
                  <b>Midnight Receiver — Neon Exit</b>
                </div>
                <i>no autoplay</i>
              </div>
              <div className="profile-blurb">
                <b>THE SHORT VERSION</b>
                <p>
                  camera collector · calls instead of texts
                </p>
              </div>
              <div className="top-eight">
                <div>
                  <b>THE PEOPLE WHO GET IT</b>
                  <span>four is enough</span>
                </div>
                <div className="faces">
                  {people.map(([name, letter]) => (
                    <figure key={name}>
                      <div>{letter}</div>
                      <figcaption>{name}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
              <p className="demo-disclosure">
                Fictional example.
              </p>
              </div>
            </Link>
          </div>
        </section>
        <section className="ticker" aria-label="Product values">
          <span>✦ KEEP THE BLURRY ONES</span>
          <span>✦ WRITE TO SOMEONE</span>
          <span>✦ PLAY THIS LAST</span>
          <span>✦ CHANGE YOUR MIND</span>
          <span>✦ FOUR PEOPLE CAN BE ENOUGH</span>
        </section>
        <TryPageBuilder />
        <TimeCapsule />
        <section id="how" className="features">
          <p className="eyebrow">NO PERFORMANCE REQUIRED</p>
          <h2>Small enough to be honest.</h2>
          <div className="feature-grid">
            <article>
              <span>01</span>
              <h3>Leave fingerprints.</h3>
              <p>
                Move things. Cross things out. Keep the photo that moved.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Choose the room.</h3>
              <p>
                Only you. Your people. Or the open door. Object by object.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Let time stay put.</h3>
              <p>
                Friday night stays before Saturday morning. Nothing races.
              </p>
            </article>
          </div>
        </section>
        <section id="principles" className="safety">
          <div>
            <p className="eyebrow">THE DOOR HAS A LOCK</p>
            <h2>
              Close means closed.
              <br />
              You hold the key.
            </h2>
          </div>
          <div>
            <p>
              Every photo, note, and song says who can see it. Under-18
              pages begin with the door closed.
            </p>
            <div className="trust-links">
              <Link href="/safety">See every safety control →</Link>
            </div>
          </div>
        </section>
        <section className="closing-cta" aria-labelledby="closing-title">
          <p className="eyebrow">LEAVE THE LIGHT ON</p>
          <h2 id="closing-title">Make a place someone remembers.</h2>
          <p>
            Not for everyone. For the right ones.
          </p>
          <Link className="primary" href="/signup">
            Make my Roomtone
          </Link>
          <small>Free · 13+ · Start privately · Change anything later</small>
        </section>
      </main>
      <footer>
        <Brand />
        <p>
          A personal page for people, not metrics.
        </p>
        <small>© 2026 Roomtone · Built for people, not metrics.</small>
      </footer>
    </>
  );
}
