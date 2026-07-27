"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useLanguage } from "@/lib/language";

export default function LoginPage() {
  const { language, text } = useLanguage();
  const isFr = language === "fr";
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
        <section className="surface-panel section-graphics fade-up mx-auto w-full max-w-md p-4 sm:p-5">
          <p className="eyebrow">Welcome back</p>
          <h1 className="brand-font text-[1.9rem] leading-tight text-black">{text.nav.login}</h1>
          <p className="section-copy mt-2">{isFr ? "Connectez-vous pour commander et suivre vos livraisons." : "Sign in to place orders and track your delivery status."}</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isFr ? "Email" : "Email"}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[#d3c2a8] bg-white px-3 py-2.5 text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isFr ? "Mot de passe" : "Password"}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#d3c2a8] bg-white px-3 py-2.5 text-sm"
            />

            {message && (
              <p className="rounded-lg border border-[#d8c8ae] bg-[#f2ece2] px-3 py-2 text-sm text-black/75">
                {message}
              </p>
            )}

            {needsConfirmation && (
              <button
                type="button"
                onClick={() => void resendConfirmationEmail()}
                disabled={resending}
                className="w-full rounded-full border border-[#d3c2a8] bg-white px-4 py-2 text-sm font-semibold text-[#2e476b] transition hover:bg-[#f2ece2] disabled:opacity-60"
              >
                {resending ? (isFr ? "Envoi en cours..." : "Sending confirmation...") : isFr ? "Renvoyer l'email de confirmation" : "Resend confirmation email"}
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-[#2d4364] via-[#3a5883] to-[#a98a59] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
            >
              {submitting ? (isFr ? "Connexion..." : "Signing in...") : text.nav.login}
            </button>
          </form>

          <p className="mt-4 text-sm text-black/65">
            {isFr ? "Nouveau ici ? " : "New here? "}<Link href="/register" className="font-semibold text-[#2e476b]">{isFr ? "Creer un compte" : "Create an account"}</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
