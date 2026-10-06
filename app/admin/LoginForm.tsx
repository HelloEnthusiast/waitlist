"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mx-auto mt-32 max-w-sm space-y-4 p-6">
      <h1 className="text-xl font-semibold">Okil admin</h1>
      <input
        type="password"
        name="token"
        placeholder="Admin token"
        autoFocus
        required
        className="w-full rounded border border-neutral-300 px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
