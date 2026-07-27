"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function RegisterPage() {
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
        <section className="surface-panel mx-auto w-full max-w-md p-5 sm:p-6">
          <p className="eyebrow">Create account</p>
          <h1 className="brand-font text-[2.2rem] leading-tight text-black">Register</h1>
          <p className="section-copy mt-2">Create your account to place orders and view order history.</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              autoComplete="name"
              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm"
            />
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
              autoComplete="new-password"
              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm"
            />

            {message && (
              <p className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-black/75">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-black/65">
            Already have an account? <Link href="/login" className="font-semibold text-orange-700">Login</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
