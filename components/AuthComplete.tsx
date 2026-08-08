"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function AuthComplete() {
  const [error, setError] = useState("");
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          flowType: "implicit",
          detectSessionInUrl: true,
          persistSession: false,
        },
      },
    );
    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      const session = data.session;
      if (sessionError || !session) {
        setError(
          "This confirmation link is invalid or expired. Request a fresh link from Log in.",
        );
        return;
      }
      const response = await fetch("/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });
      if (!response.ok) {
        setError(
          "We could not finish signing you in. Request a fresh confirmation link.",
        );
        return;
      }
      const verified = await fetch("/auth/session/check", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!verified.ok) {
        setError(
          "Your email was confirmed, but Roomtone could not save the sign-in session. Please log in with the password you created.",
        );
        return;
      }
      history.replaceState(null, "", location.pathname);
      location.replace("/settings?welcome=1");
    });
  }, []);
  return error ? (
    <p className="form-error" role="alert">
      {error}
    </p>
  ) : (
    <p className="form-success" role="status">
      Confirming your account and opening your page…
    </p>
  );
}
