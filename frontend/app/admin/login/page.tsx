"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("sksajarulhoque@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState("sksajarulhoque@gmail.com");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.me();
        router.replace("/admin");
      } catch {
        // stay on login page
      }
    };

    void checkAuth();
  }, [router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login({ username, password });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    setResetMessage(null);
    try {
      const response = await api.forgotPasswordRequest(resetEmail);
      setOtpRequested(true);
      setResetMessage(response.detail);
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : "Could not send OTP");
    }
  };

  const confirmReset = async () => {
    setResetMessage(null);
    try {
      const response = await api.forgotPasswordConfirm({
        email: resetEmail,
        code: otpCode,
        new_password: newPassword
      });
      setResetMessage(response.detail);
      setOtpCode("");
      setNewPassword("");
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : "Could not reset password");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:py-8">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2">
        <section className="glass-panel rounded-3xl p-5 sm:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-brand-400">Admin Access</p>
          <h1 className="text-3xl font-semibold">NextGen Dashboard Login</h1>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            Use your secure admin credentials to manage portfolio items, testimonials, and leads.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-brand-400"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-brand-400"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-glow disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-5 sm:p-8">
          <h2 className="text-2xl font-semibold">Forgot Password</h2>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            Request OTP by email, verify it, then create a new password.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm">Admin Email</span>
              <input
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                type="email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-brand-400"
              />
            </label>

            <button
              type="button"
              onClick={requestOtp}
              className="inline-flex w-full justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm transition hover:border-brand-400 hover:text-brand-300 sm:w-auto"
            >
              Send OTP
            </button>

            {otpRequested ? (
              <div className="space-y-4 rounded-2xl border border-white/10 p-4">
                <label className="block space-y-2">
                  <span className="text-sm">OTP Code</span>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-brand-400"
                    placeholder="Enter 6-digit OTP"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm">New Password</span>
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-brand-400"
                  />
                </label>

                <button
                  type="button"
                  onClick={confirmReset}
                  className="inline-flex w-full justify-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-slate-950 sm:w-auto"
                >
                  Verify OTP & Reset
                </button>
              </div>
            ) : null}

            {resetMessage ? <p className="text-sm text-brand-300">{resetMessage}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
