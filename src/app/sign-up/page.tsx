"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Mark } from "@/components/Mark";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.signup({ name, email, password });
      router.push("/workspaces");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#F4F2F8] p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E9E4F2] shadow-sm p-8 flex flex-col gap-4 text-[#141220]"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] grid place-items-center text-white">
            <Mark />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#141220]">Create your account</h1>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#7B7589]">Name</span>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[#E9E4F2] bg-[#F7F5FB] px-3 py-2 outline-none focus:border-[#7C40D4] placeholder:text-[#7B7589]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#7B7589]">
            Work email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[#E9E4F2] bg-[#F7F5FB] px-3 py-2 outline-none focus:border-[#7C40D4] placeholder:text-[#7B7589]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#7B7589]">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[#E9E4F2] bg-[#F7F5FB] px-3 py-2 outline-none focus:border-[#7C40D4] placeholder:text-[#7B7589]"
          />
          <span className="text-[11px] text-[#7B7589]">At least 8 characters.</span>
        </label>

        {error && <p className="text-sm text-[#E0517A]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="h-10 rounded-lg text-white font-bold text-sm bg-gradient-to-r from-[#7C40D4] via-[#B98CFF] to-[#FE7CC2] cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        <p className="text-xs text-[#7B7589] text-center">
          Already have an account? <a href="/sign-in" className="text-[#7C40D4] font-semibold">Sign in</a>
        </p>
      </form>
    </div>
  );
}
