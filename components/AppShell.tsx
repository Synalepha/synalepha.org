import Link from "next/link";
import { Brand } from "@/components/Brand";
import { signOut } from "@/app/actions";

export type ShellProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};
export function AppShell({
  profile,
  children,
}: {
  profile: ShellProfile;
  children: React.ReactNode;
}) {
  const initial = (profile.display_name || profile.username || "You")
    .slice(0, 1)
    .toUpperCase();
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="appbar">
        <Brand href="/home" />
        <nav aria-label="Primary">
          <Link href="/home">Neighborhood</Link>
          <Link href="/discover">Discover</Link>
          <Link href="/friends">Friends</Link>
          <Link href="/messages">Messages</Link>
        </nav>
        <div className="account-menu">
          <Link href="/profile">Public view</Link>
          <Link href="/settings">Edit page</Link>
          <Link
            href="/account"
            className="mini-avatar"
            aria-label="Account and safety settings"
          >
            {initial}
          </Link>
          <form action={signOut}>
            <button>Log out</button>
          </form>
        </div>
      </header>
      <main className="app-content" id="main-content">
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/home">
          <span>⌂</span>Home
        </Link>
        <Link href="/discover">
          <span>✦</span>Discover
        </Link>
        <Link href="/friends">
          <span>◎</span>Friends
        </Link>
        <Link href="/messages">
          <span>✉</span>Messages
        </Link>
        <Link href="/profile">
          <span>☺</span>Page
        </Link>
      </nav>
    </div>
  );
}
