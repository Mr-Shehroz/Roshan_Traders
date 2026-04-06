"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push("/dashboard");
    else setError("Invalid username or password.");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Decorative background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #c17f3a22 0%, transparent 50%), radial-gradient(circle at 80% 80%, #2d6a4f18 0%, transparent 50%)",
        }}
      />

      <div className="w-full max-w-sm relative fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ background: "var(--accent)", boxShadow: "0 8px 24px rgba(193,127,58,0.35)" }}
          >
            RT
          </div>
          <h1 className="font-serif text-3xl" style={{ color: "var(--ink)" }}>Roshan Traders</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink3)" }}>
            Inventory Management
          </p>
        </div>

        {/* Card */}
        <div
          className="card p-7"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <h2 className="font-serif text-xl mb-5" style={{ color: "var(--ink)" }}>
            Admin Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                name="username"
                type="text"
                required
                className="input"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--ink3)" }}>
          Admin access only
        </p>
      </div>
    </main>
  );
}