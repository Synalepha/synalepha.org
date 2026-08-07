"use client";
import { useActionState } from "react";
import { resendConfirmation, type AuthState } from "@/app/actions";
const initial: AuthState = { error: "", success: "" };
export function ResendConfirmation() {
  const [state, action, pending] = useActionState(resendConfirmation, initial);
  return (
    <details className="resend-box">
      <summary>Confirmation link expired?</summary>
      <form action={action}>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
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
        <button disabled={pending}>
          {pending ? "Sending…" : "Send a fresh link"}
        </button>
      </form>
    </details>
  );
}
