"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function PasswordUpdateForm() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [state, setState] = useState({
    ready: false,
    error: "",
    success: "",
    pending: false,
  });
  useEffect(() => {
    Promise.resolve().then(async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) {
        setState((s) => ({
          ...s,
          error: "Account recovery is temporarily unavailable.",
        }));
        return;
      }
      const client = createClient(url, key, {
        auth: {
          flowType: "implicit",
          detectSessionInUrl: true,
          persistSession: false,
        },
      });
      setSupabase(client);
      const { data, error } = await client.auth.getSession();
      setState((s) => ({
        ...s,
        ready: Boolean(data.session),
        error:
          error?.message ||
          (!data.session
            ? "This reset link is invalid or expired. Request a fresh one from Log in."
            : ""),
      }));
    });
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm_password") || "");
    if (password.length < 8) {
      setState((s) => ({
        ...s,
        error: "Use a password of at least 8 characters.",
      }));
      return;
    }
    if (password !== confirm) {
      setState((s) => ({ ...s, error: "Passwords do not match." }));
      return;
    }
    setState((s) => ({ ...s, error: "", pending: true }));
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState((s) => ({
        ...s,
        error: "We could not update that password. Request a fresh reset link.",
        pending: false,
      }));
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setState((s) => ({
        ...s,
        error: "The reset session expired. Request a fresh link.",
        pending: false,
      }));
      return;
    }
    const response = await fetch("/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }),
    });
    if (!response.ok) {
      setState((s) => ({
        ...s,
        error:
          "Password changed, but sign-in could not be completed. Return to Log in.",
        pending: false,
      }));
      return;
    }
    history.replaceState(null, "", location.pathname);
    setState({
      ready: true,
      error: "",
      success: "Password updated. Opening your LoudPage…",
      pending: false,
    });
    window.setTimeout(() => router.replace("/home"), 500);
  }
  return (
    <form onSubmit={submit} className="auth-form">
      <label>
        New password
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          disabled={!state.ready}
        />
      </label>
      <label>
        Confirm new password
        <input
          name="confirm_password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          disabled={!state.ready}
        />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-success" role="status">
          {state.success}
        </p>
      )}
      <button className="primary" disabled={!state.ready || state.pending}>
        {state.pending
          ? "Updating…"
          : state.ready
            ? "Set new password"
            : "Checking reset link…"}
      </button>
    </form>
  );
}
