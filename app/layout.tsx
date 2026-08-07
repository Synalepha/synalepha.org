import type {Metadata} from 'next';
import './globals.css';

const title='LoudPage — Make your corner of the internet loud';
const description='LoudPage is a personal-page social network for expressive profiles, mutual friendships, and chronological updates—without follower contests or algorithmic outrage.';
export const metadata:Metadata={
  metadataBase:new URL('https://synalepha.org'),title,description,
  applicationName:'LoudPage',
  alternates:{canonical:'/'},
  openGraph:{title,description,url:'https://synalepha.org',siteName:'LoudPage',type:'website',locale:'en_US'},
  twitter:{card:'summary',title,description},
  robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
