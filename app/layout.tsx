import type { Metadata } from "next";
import "./globals.css";

const title = "LoudPage — Your internet should feel like you";
const description =
  "LoudPage is a personal-page social network for expressive profiles, mutual friendships, and chronological updates—without follower contests or algorithmic outrage.";
export const metadata: Metadata = {
  metadataBase: new URL("https://synalepha.org"),
  title,
  description,
  applicationName: "LoudPage",
  openGraph: {
    title,
    description,
    siteName: "LoudPage",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary", title, description },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
