import Link from "next/link";
import { Brand } from "@/components/Brand";
import { TryPageBuilder } from "@/components/TryPageBuilder";

export const metadata = {
  title: "Roomtone — Tu espacio. Tu gente.",
  description: "Crea una página personal para tu música, tus recuerdos y tu gente.",
  alternates: { canonical: "/es", languages: { en: "/", es: "/es" } },
  openGraph: { url: "/es", locale: "es_ES" },
};

export default function SpanishLanding() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="topbar">
        <Brand />
        <nav aria-label="Principal">
          <a href="#try-builder">Crear</a>
          <Link href="/u/maya">Ver un ejemplo</Link>
          <Link href="/signup">Guardar mi página</Link>
          <Link href="/">English</Link>
        </nav>
      </header>
      <main id="contenido">
        <section className="hero spanish-hero">
          <div className="hero-copy">
            <p className="eyebrow">TU ESPACIO · TU GENTE</p>
            <h1>Internet debería sentirse como tú.</h1>
            <p className="lede">Canciones. Recuerdos. Estados de ánimo. Tu gente. La vida en orden.</p>
            <div className="hero-actions"><a className="primary" href="#try-builder">Crear mi página</a></div>
            <p className="micro">Gratis · 13+ · Menores de 18 empiezan en privado</p>
          </div>
          <div className="spanish-card" aria-hidden="true"><span>AHORA</span><strong>eléctrica después de medianoche</strong><i>♫ la canción del camino a casa</i></div>
        </section>
        <TryPageBuilder />
      </main>
    </>
  );
}
