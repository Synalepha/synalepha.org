import Link from 'next/link';
export function Brand({href='/'}:{href?:string}){return <Link className="brand" href={href} aria-label="LoudPage home"><span className="brand-mark">LP</span><span><i>loud</i><b>page</b></span></Link>}
