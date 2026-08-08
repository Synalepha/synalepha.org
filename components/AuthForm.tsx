"use client";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions";
const initial = { error: "", success: "" };
export function AuthForm({
  mode,
  maxBirthDate,
}: {
  mode: "login" | "signup";
  maxBirthDate?: string;
}) {
  const [show, setShow] = useState(false);
  const action = async (
    state: AuthState,
    form: FormData,
  ): Promise<AuthState> =>
    mode === "login" ? signIn(state, form) : signUp(state, form);
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="auth-form">
      <label>
        Your email address{" "}
        <span className="field-hint">
          {mode === "login"
            ? "The email you used to save your page."
            : "We use this to save your work and let you back in. It will not appear on your page."}
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>
      {mode === "signup" && (
        <label>
          Your date of birth{" "}
          <span className="field-hint">
            This sets the right safety boundaries. It is never shown on your page.
          </span>
          <input
            name="birth_date"
            type="date"
            required
            max={maxBirthDate}
            autoComplete="bday"
          />
        </label>
      )}
      <label>
        Password <span className="field-hint">8–128 characters</span>
        <span className="password-field">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          <button
            type="button"
            className="show-password"
            onClick={() => setShow((v) => !v)}
            aria-pressed={show}
          >
            {show ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      {state.error && (
        <p className="form-error account-result" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-success account-result" role="status">
          {state.success}
        </p>
      )}
      <button className="primary" disabled={pending}>
        {pending
          ? "Working…"
          : mode === "login"
            ? "Log in"
            : "Save my page"}
      </button>
      {mode === "signup" && (
        <p className="account-note">
          Already have an account? We will never replace its page.
        </p>
      )}
    </form>
  );
}
