'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="state-page"><p className="eyebrow">THE SIGNAL BROKE</p><h1>That didn’t work.</h1><p>Your saved account data was not intentionally changed. Retry once; if the problem persists, return home.</p><div><button className="primary" onClick={reset}>Try again</button><Link href="/">Return home</Link></div></main>}
