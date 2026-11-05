"use client";
import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="label">Admin password</label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
        <p className="mt-1 text-xs text-bark/55">It&apos;s the ADMIN_PASSWORD in your .env file.</p>
      </div>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
