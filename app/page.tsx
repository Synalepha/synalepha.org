import Link from "next/link";
import { Brand } from "@/components/Brand";
import { InteractiveTour } from "@/components/InteractiveTour";
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
          <a href="#demo">Tour</a>
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
            <p className="eyebrow">THE PERSONAL WEB, TURNED BACK ON</p>
            <h1>
              Make your corner
              <br />
              of the internet <em>loud.</em>
            </h1>
            <p className="lede">
              Build a page that feels like you. Share with people you choose.
              See updates newest-first—never ranked for outrage.
            </p>
            <div className="hero-actions">
              <Link className="primary" href="/signup">
                Create your LoudPage
              </Link>
              <a className="secondary" href="#demo">
                Try the interactive tour ↓
              </a>
            </div>
            <p className="micro">
              Free to join · 13+ · Under-18 pages begin private · Adult/minor
              discovery separated
            </p>
          </div>
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
                  <p>Chicago · staged profile</p>
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
            </div>
          </Link>
        </section>
        <section className="ticker" aria-label="Product values">
          <span>✦ PERSONAL PAGES</span>
          <span>✦ CHRONOLOGICAL UPDATES</span>
          <span>✦ MUTUAL FRIENDS</span>
          <span>✦ PROFILE SONGS</span>
          <span>✦ NO FOLLOWER CONTEST</span>
        </section>
        <TryPageBuilder />
        <InteractiveTour />
        <section id="how" className="features">
          <p className="eyebrow">A SOCIAL NETWORK WITH A SPINE</p>
          <h2>Your page—not the algorithm—is the point.</h2>
          <div className="feature-grid">
            <article>
              <span>01</span>
              <h3>Make it yours</h3>
              <p>
                Four templates, three type systems, three layout rhythms,
                optional modules, browser draft recovery, and exact public
                preview.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Choose your people</h3>
              <p>
                Friendship is mutual. Under-18 discovery stays separated from
                adults. Messages require an accepted friendship.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Post in time order</h3>
              <p>
                Bulletins arrive newest-first. No outrage ranking, paid reach,
                or casino disguised as connection.
              </p>
            </article>
          </div>
        </section>
        <section id="principles" className="safety">
          <div>
            <p className="eyebrow">NOSTALGIC, NOT NAIVE</p>
            <h2>
              Expressive pages.
              <br />
              Hard boundaries.
            </h2>
          </div>
          <div>
            <p>
              Minor accounts begin private and cannot become public. Guestbooks
              have their own audience. Discovery and indexing are separate
              choices. Blocks are private. Reports have visible status. Media
              stays hidden until approved.
            </p>
            <div className="trust-links">
              <Link href="/privacy">Privacy promise</Link>
              <Link href="/safety">Safety Center</Link>
              <Link href="/trust">Trust Console</Link>
              <Link href="/status">Product status</Link>
              <Link href="/community">Community rules</Link>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <Brand />
        <p>
          LoudPage is the product at synalepha.org—not a data broker wearing
          cool shoes.
        </p>
        <small>© 2026 LoudPage · Built for people, not metrics.</small>
      </footer>
    </>
  );
}
