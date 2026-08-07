"use client";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { updateProfile, type AuthState } from "@/app/actions";
const initial: AuthState = { error: "", success: "" };
const draftKey = "loudpage-profile-draft-v1";
type Theme = {
  preset?: string;
  font?: string;
  density?: string;
  inner_circle_label?: string;
  hide_inner_circle?: boolean;
  accent?: string;
  signal_line?: string;
  signal_status?: string;
  module_order?: string;
};
type Profile = {
  username: string | null;
  display_name: string | null;
  bio: string | null;
  mood: string | null;
  city: string | null;
  profile_song_title: string | null;
  profile_song_url: string | null;
  visibility: "public" | "friends" | "private";
  comment_permission: "everyone" | "friends" | "nobody";
  allow_tags: boolean;
  discoverable: boolean;
  search_indexing: boolean;
  theme: Theme | null;
};
export function ProfileForm({
  profile,
  isMinor,
}: {
  profile: Profile;
  isMinor: boolean;
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDraftAvailable(Boolean(localStorage.getItem(draftKey))),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!state.success) return;
    localStorage.removeItem(draftKey);
    const timer = window.setTimeout(() => setDraftAvailable(false), 0);
    return () => window.clearTimeout(timer);
  }, [state.success]);
  function saveDraft(event: FormEvent<HTMLFormElement>) {
    const values: Record<string, string | boolean> = {};
    new FormData(event.currentTarget).forEach((value, key) => {
      values[key] = String(value);
    });
    event.currentTarget
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((input) => {
        values[input.name] = input.checked;
      });
    localStorage.setItem(draftKey, JSON.stringify(values));
    setDraftAvailable(true);
  }
  function restoreDraft() {
    const raw = localStorage.getItem(draftKey),
      form = formRef.current;
    if (!raw || !form) return;
    const values = JSON.parse(raw) as Record<string, string | boolean>;
    Object.entries(values).forEach(([name, value]) => {
      const control = form.elements.namedItem(name);
      if (control instanceof HTMLInputElement && control.type === "checkbox")
        control.checked = Boolean(value);
      else if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement ||
        control instanceof HTMLSelectElement
      )
        control.value = String(value);
    });
    form.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function clearDraft() {
    localStorage.removeItem(draftKey);
    setDraftAvailable(false);
    formRef.current?.reset();
  }
  const theme = profile.theme || {};
  return (
    <form
      ref={formRef}
      action={action}
      onInput={saveDraft}
      className="settings-form"
    >
      <div className="visibility-banner">
        <b>
          {profile.visibility === "public"
            ? "PUBLIC PAGE"
            : profile.visibility === "friends"
              ? "FRIENDS-ONLY PAGE"
              : "PRIVATE PAGE"}
        </b>
        <span>
          {isMinor
            ? "Under-18 safety is active: public visibility and adult discovery are disabled."
            : "You always see the full preview. Visitors see only what this audience allows."}
        </span>
      </div>
      {draftAvailable && (
        <div className="draft-banner" role="status">
          <b>Browser draft saved</b>
          <span>Unsaved changes survived this tab.</span>
          <button type="button" onClick={restoreDraft}>
            Restore
          </button>
          <button type="button" onClick={clearDraft}>
            Discard
          </button>
        </div>
      )}
      <fieldset>
        <legend>Identity</legend>
        <div className="form-grid">
          <label>
            Username{" "}
            <span className="field-hint" id="username-rules">
              3–24 characters: lowercase letters a–z, numbers 0–9, or
              underscores. No spaces.
            </span>
            <input
              name="username"
              defaultValue={profile.username || ""}
              required
              minLength={3}
              maxLength={24}
              pattern="[a-z0-9_]{3,24}"
              placeholder="maya_chen"
              title="Use 3–24 lowercase letters, numbers, or underscores. No spaces."
              aria-describedby="username-rules"
              onInvalid={(event) =>
                event.currentTarget.setCustomValidity(
                  "Use 3–24 lowercase letters, numbers, or underscores. No spaces.",
                )
              }
              onInput={(event) => event.currentTarget.setCustomValidity("")}
            />
          </label>
          <label>
            Display name
            <input
              name="display_name"
              defaultValue={profile.display_name || ""}
              required
              maxLength={50}
            />
          </label>
          <label className="wide">
            About me
            <textarea
              name="bio"
              defaultValue={profile.bio || ""}
              maxLength={5000}
              rows={6}
            />
          </label>
          <label>
            Mood
            <input
              name="mood"
              defaultValue={profile.mood || ""}
              maxLength={80}
              placeholder="electric"
            />
          </label>
          <label>
            City{" "}
            <span className="field-hint">
              Optional. Never use a precise location.
            </span>
            <input
              name="city"
              defaultValue={profile.city || ""}
              maxLength={80}
            />
          </label>
          <label>
            Profile song title
            <input
              name="profile_song_title"
              defaultValue={profile.profile_song_title || ""}
              maxLength={160}
            />
          </label>
          <label>
            Profile song URL
            <input
              name="profile_song_url"
              type="url"
              defaultValue={profile.profile_song_url || ""}
              placeholder="https://…"
            />
          </label>
          <label>
            Page Signal headline
            <input name="signal_line" defaultValue={theme.signal_line || profile.mood || "quietly online"} maxLength={60} placeholder="electric after midnight" />
            <span className="field-hint">The signature line people see when your page is shared.</span>
          </label>
          <label>
            Page Signal status
            <input name="signal_status" defaultValue={theme.signal_status || "open to a quiet hello"} maxLength={80} placeholder="open to a quiet hello" />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Page design</legend>
        <div className="form-grid">
          <label>
            Template
            <select
              name="theme_preset"
              defaultValue={theme.preset || "classic"}
            >
              <option value="classic">Electric classic</option>
              <option value="midnight">Midnight signal</option>
              <option value="sunset">Sunset stereo</option>
              <option value="paper">Paper &amp; ink</option>
            </select>
          </label>
          <label>
            Typography
            <select name="theme_font" defaultValue={theme.font || "clean"}>
              <option value="clean">Clean &amp; direct</option>
              <option value="mono">Terminal romantic</option>
              <option value="serif">Editorial soul</option>
            </select>
          </label>
          <label>
            Layout rhythm
            <select
              name="theme_density"
              defaultValue={theme.density || "comfortable"}
            >
              <option value="compact">Compact signal</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious gallery</option>
            </select>
          </label>
          <label>
            Inner Circle label
            <input
              name="inner_circle_label"
              defaultValue={theme.inner_circle_label || "Inner Circle"}
              maxLength={32}
              required
            />
          </label>
          <label>
            Accent color
            <select name="theme_accent" defaultValue={theme.accent || "violet"}>
              <option value="violet">Voltage violet</option><option value="cyan">Signal cyan</option><option value="pink">Hot pink</option><option value="orange">Sunset orange</option>
            </select>
          </label>
          <label className="wide">
            Module order
            <select name="module_order" defaultValue={theme.module_order || "about,signal,song,circle,guestbook"}>
              <option value="about,signal,song,circle,guestbook">Story first</option><option value="signal,about,song,circle,guestbook">Signal first</option><option value="song,signal,about,circle,guestbook">Music first</option>
            </select>
            <span className="field-hint">Curated arrangements protect responsive layout and keyboard order.</span>
          </label>
          <label className="check-row">
            <input
              name="hide_inner_circle"
              type="checkbox"
              defaultChecked={Boolean(theme.hide_inner_circle)}
            />{" "}
            Hide the Inner Circle module
          </label>
        </div>
      </fieldset>
      <section className={`composer-preview theme-${theme.preset || "classic"}`} aria-label="Live page composition summary">
        <div><p className="eyebrow">LIVE COMPOSER</p><h2>{profile.display_name || profile.username}</h2><p>{profile.bio || "Your story starts here."}</p></div>
        <div><b>Draft-safe</b><span>Autosave survives refresh</span><b>Reversible</b><span>Restore or discard browser draft</span><b>Exact</b><span>Public Preview uses saved settings</span></div>
      </section>
      <fieldset>
        <legend>Audience &amp; boundaries</legend>
        <div className="form-grid">
          <label>
            Who can see my page
            <select name="visibility" defaultValue={profile.visibility}>
              <option value="public" disabled={isMinor}>
                Everyone{isMinor ? " — adults only" : ""}
              </option>
              <option value="friends">Friends only</option>
              <option value="private">Only me</option>
            </select>
          </label>
          <label>
            Who can sign my guestbook
            <select
              name="comment_permission"
              defaultValue={profile.comment_permission}
            >
              <option value="everyone">Anyone who can see my page</option>
              <option value="friends">Friends only</option>
              <option value="nobody">Nobody</option>
            </select>
          </label>
          <label className="check-row">
            <input
              name="discoverable"
              type="checkbox"
              defaultChecked={profile.discoverable}
            />{" "}
            Show me in safe discovery
          </label>
          <label className="check-row">
            <input
              name="allow_tags"
              type="checkbox"
              defaultChecked={profile.allow_tags}
            />{" "}
            Allow friends to tag me when tagging launches
          </label>
          <label className="check-row">
            <input
              name="search_indexing"
              type="checkbox"
              defaultChecked={profile.search_indexing}
              disabled={isMinor}
            />{" "}
            Allow search engines to index my public page
          </label>
        </div>
        <p className="control-note">
          Messages always require an accepted friendship. Adult and under-18
          friendship requests are separated at the database boundary. Blocks are
          private.
        </p>
      </fieldset>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-success" role="status">
          {state.success} Open Public view to verify every module and audience
          choice.
        </p>
      )}
      <div className="form-actions">
        <button className="primary" disabled={pending}>
          {pending ? "Saving…" : "Publish saved changes"}
        </button>
        <a className="secondary-button" href="/profile">
          Preview public page
        </a>
      </div>
    </form>
  );
}
