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
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      {mode === "signup" && (
        <label>
          Date of birth{" "}
          <span className="field-hint">
            Used for age-appropriate safety. Never shown publicly.
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
            : "Create my account"}
      </button>
      {mode === "signup" && (
        <p className="account-note">
          One email, one account. We preserve existing accounts and never
          overwrite their pages.
        </p>
      )}
    </form>
  );
}
