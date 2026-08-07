import Link from "next/link";
import { Brand } from "@/components/Brand";
import { TryPageBuilder } from "@/components/TryPageBuilder";
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
            <p className="eyebrow">A PERSONAL PAGE FOR A PERSONAL INTERNET</p>
            <h1>
              Your internet should
              <br />
              feel like <em>you.</em>
            </h1>
            <p className="lede">
              Build a personal page. Share it with your people. See life in
              order—not through an algorithm.
            </p>
            <div className="hero-actions">
              <Link className="primary" href="/signup">
                Make my page
              </Link>
              <Link className="secondary" href="/u/maya">
                See Maya&apos;s page →
              </Link>
            </div>
            <p className="micro">
              Free to join · 13+ · Under-18 pages begin private · Adult/minor
              discovery separated
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
                  <span className="mood">mood: electric</span>
                </div>
              </div>
              <div className="now-playing">
                <span>▶</span>
                <div>
                  <small>PROFILE SONG</small>
                  <b>Midnight Receiver — Neon Exit</b>
                </div>
                <i>no autoplay</i>
              </div>
              <div className="profile-blurb">
                <b>ABOUT ME</b>
                <p>
                  designer, night owl, collector of disposable cameras. leave a
                  comment before you go.
                </p>
              </div>
              <div className="top-eight">
                <div>
                  <b>CHOSEN PEOPLE</b>
                  <span>optional module</span>
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
                Example profile created for this demonstration.
              </p>
              </div>
            </Link>
            <p className="profile-story">
              Maya made a place for midnight photos, unfinished thoughts, and
              the people she actually knows.
            </p>
          </div>
        </section>
        <section className="ticker" aria-label="Product values">
          <span>✦ PERSONAL PAGES</span>
          <span>✦ CHRONOLOGICAL UPDATES</span>
          <span>✦ MUTUAL FRIENDS</span>
          <span>✦ PROFILE SONGS</span>
          <span>✦ NO FOLLOWER CONTEST</span>
        </section>
        <TryPageBuilder />
        <section id="how" className="features">
          <p className="eyebrow">PEOPLE, NOT AUDIENCES</p>
          <h2>A social place built at human scale.</h2>
          <div className="feature-grid">
            <article>
              <span>01</span>
              <h3>Make it unmistakably yours.</h3>
              <p>
                Start with a style. Add a song, pin a mood, tell your story,
                and change your mind tomorrow.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Keep friendship mutual.</h3>
              <p>
                Connect with people you choose—not followers to collect.
                Messages open only after both people say yes.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>See what happened.</h3>
              <p>
                Updates arrive newest-first. No outrage ranking, paid reach,
                or pressure to perform.
              </p>
            </article>
          </div>
        </section>
        <section id="principles" className="safety">
          <div>
            <p className="eyebrow">CONTROL SHOULD NEVER BE HIDDEN</p>
            <h2>
              Private when it matters.
              <br />
              Clear when it counts.
            </h2>
          </div>
          <div>
            <p>
              Under-18 pages start private. Adults and minors are kept out of
              each other&apos;s discovery. You choose who can find, message, or
              comment on you.
            </p>
            <div className="trust-links">
              <Link href="/safety">See every safety control →</Link>
            </div>
          </div>
        </section>
        <section className="closing-cta" aria-labelledby="closing-title">
          <p className="eyebrow">YOUR PAGE IS WAITING</p>
          <h2 id="closing-title">The web has room for you again.</h2>
          <p>
            No follower contest. No outrage machine. No pressure to perform.
            Just a page that sounds, looks, and feels like yours.
          </p>
          <Link className="primary" href="/signup">
            Make my LoudPage
          </Link>
          <small>Free · 13+ · Start privately · Change anything later</small>
        </section>
      </main>
      <footer>
        <Brand />
        <p>
          A personal page for people, not metrics.
        </p>
        <small>© 2026 LoudPage · Built for people, not metrics.</small>
      </footer>
    </>
  );
}
