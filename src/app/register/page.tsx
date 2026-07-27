"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useLanguage } from "@/lib/language";

export default function RegisterPage() {
  const { language, text } = useLanguage();
  const isFr = language === "fr";
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await supabaseBrowser.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage("Registration successful. Please confirm your email, then login.");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-10">
        <section className="surface-panel section-graphics fade-up mx-auto w-full max-w-md p-4 sm:p-5">
          <p className="eyebrow">Create account</p>
          <h1 className="brand-font text-[1.9rem] leading-tight text-black">{text.nav.register}</h1>
          <p className="section-copy mt-2">{isFr ? "Creez votre compte pour commander et voir l'historique." : "Create your account to place orders and view order history."}</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isFr ? "Nom complet" : "Full Name"}
              required
              autoComplete="name"
              className="w-full rounded-xl border border-[#d3c2a8] bg-white px-3 py-2.5 text-sm"
            />
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
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#d3c2a8] bg-white px-3 py-2.5 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={isFr ? "Confirmer le mot de passe" : "Confirm Password"}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#d3c2a8] bg-white px-3 py-2.5 text-sm"
            />

            {message && (
              <p className="rounded-lg border border-[#d8c8ae] bg-[#f2ece2] px-3 py-2 text-sm text-black/75">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-[#2d4364] via-[#3a5883] to-[#a98a59] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
            >
              {submitting ? (isFr ? "Creation..." : "Creating account...") : text.nav.register}
            </button>
          </form>

          <p className="mt-4 text-sm text-black/65">
            {isFr ? "Vous avez deja un compte ? " : "Already have an account? "}<Link href="/login" className="font-semibold text-[#2e476b]">{text.nav.login}</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
