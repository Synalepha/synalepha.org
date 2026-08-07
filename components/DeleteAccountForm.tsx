"use client";
import { useActionState } from "react";
import { deleteAccount, type AuthState } from "@/app/actions";
const initial: AuthState = { error: "", success: "" };
export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, initial);
  return (
    <form action={action} className="danger-zone">
      <label>
        Type <b>DELETE MY ACCOUNT</b>
        <input name="confirmation" autoComplete="off" required />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button disabled={pending}>
        {pending ? "Deleting…" : "Permanently delete my account"}
      </button>
    </form>
  );
}
