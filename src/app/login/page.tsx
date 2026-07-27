"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setNeedsConfirmation(false);

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const confirmationError =
        error.message.toLowerCase().includes("email not confirmed") ||
        error.message.toLowerCase().includes("email not verified");

      setNeedsConfirmation(confirmationError);
      setMessage(
        confirmationError
          ? "Your email is not confirmed yet. Please check your inbox, or resend confirmation below."
          : error.message
      );
      setSubmitting(false);
      return;
    }

    setMessage("Login successful. Redirecting...");
    router.push("/");
    router.refresh();
  }

  async function resendConfirmationEmail() {
    if (!email.trim()) {
      setMessage("Enter your email first, then click resend confirmation.");
      return;
    }

    setResending(true);
    const { error } = await supabaseBrowser.auth.resend({
      type: "signup",
      email: email.trim(),
    });

    if (error) {
      setMessage(error.message);
      setResending(false);
      return;
    }

    setMessage("Confirmation email sent. Check inbox/spam and verify your account.");
    setResending(false);
  }

  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-10">
        <section className="surface-panel mx-auto w-full max-w-md p-5 sm:p-6">
          <p className="eyebrow">Welcome back</p>
          <h1 className="brand-font text-[2.2rem] leading-tight text-black">Login</h1>
          <p className="section-copy mt-2">Sign in to place orders and track your delivery status.</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm"
            />

            {message && (
              <p className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-black/75">
                {message}
              </p>
            )}

            {needsConfirmation && (
              <button
                type="button"
                onClick={() => void resendConfirmationEmail()}
                disabled={resending}
                className="w-full rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-60"
              >
                {resending ? "Sending confirmation..." : "Resend confirmation email"}
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-black/65">
            New here? <Link href="/register" className="font-semibold text-orange-700">Create an account</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
