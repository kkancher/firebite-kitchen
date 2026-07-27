"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useLanguage } from "@/lib/language";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useSupabaseUser();
  const { language, setLanguage, text } = useLanguage();
  const adminAllowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  const userEmail = user?.email?.toLowerCase() || "";
  const canSeeAdmin =
    isAuthenticated &&
    adminAllowlist.length > 0 &&
    userEmail.length > 0 &&
    adminAllowlist.includes(userEmail);

  const links = [
    { href: "/#home", label: text.nav.home },
    { href: "/about", label: text.nav.about },
    { href: "/orders", label: text.nav.orders },
    ...(canSeeAdmin ? [{ href: "/admin", label: text.nav.admin }] : []),
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href;
  };

  const displayName =
    typeof user?.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : user?.email?.split("@")[0] || "User";

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="top-strip border-b border-black/20 py-1 text-center text-[10px] font-medium tracking-wide">
        {text.topStrip}
      </div>

      <nav className="w-full border-b border-[#dcc8a8]/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(245,235,219,0.92))] shadow-[0_16px_32px_-24px_rgba(20,34,54,0.42)] backdrop-blur-xl">
        <div className="site-shell flex items-center justify-between py-2.5 md:py-3">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="nav-logo-pop rounded-full border border-[#dbc7a5] bg-white p-1 shadow-[0_10px_18px_-14px_rgba(29,44,67,0.48)]">
              <Image
                src="/firebite-logo.png"
                alt="FireBite logo"
                width={34}
                height={34}
                unoptimized
                className="h-8 w-8 rounded-full object-cover"
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="brand-font text-[1.55rem] font-semibold text-[#202534]">FireBite</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8f6f42]">Kitchen</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-black/80">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-anim rounded-full px-3 py-1.5 transition-colors hover:text-[#294062] focus:text-[#294062] ${
                  isActive(link.href)
                    ? "bg-gradient-to-r from-[#f7efdf] via-[#f1e4cf] to-[#e8d7bc] text-[#274368]"
                    : "text-black/80"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-1 inline-flex items-center overflow-hidden rounded-full border border-[#d9c4a2] bg-white/92 text-[0.62rem] font-extrabold tracking-[0.12em] shadow-[0_8px_16px_-14px_rgba(29,44,67,0.46)]">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 ${language === "en" ? "bg-[#274368] text-[#fff4e3]" : "text-[#2f4669]"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-2.5 py-1 ${language === "fr" ? "bg-[#274368] text-[#fff4e3]" : "text-[#2f4669]"}`}
              >
                FR
              </button>
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-full border border-[#d8c3a3] px-3.5 py-1.5 text-[0.82rem] font-bold text-black/75 transition hover:bg-[#ede0ca]"
              >
                {text.nav.logout}
              </button>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-3.5 py-1.5 hover:text-[#785d35]">
                  {text.nav.login}
                </Link>
                <Link href="/register" className="rounded-full px-3.5 py-1.5 hover:text-[#785d35]">
                  {text.nav.register}
                </Link>
              </>
            )}
          </div>

          <Link href="/#menu" className="btn-primary hidden md:inline-flex">
            {text.nav.shopNow}
          </Link>

          <button
            aria-label={open ? text.nav.closeMenu : text.nav.openMenu}
            className="text-2xl text-[#171513] md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open && (
          <div className="site-shell pb-4 md:hidden">
            <div className="surface-panel flex flex-col gap-3 px-4 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black/80">
              <div className="inline-flex w-fit items-center overflow-hidden rounded-full border border-[#d9c4a2] bg-white/92 text-[0.62rem] font-extrabold tracking-[0.12em]">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 ${language === "en" ? "bg-[#274368] text-[#fff4e3]" : "text-[#2f4669]"}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("fr")}
                  className={`px-2.5 py-1 ${language === "fr" ? "bg-[#274368] text-[#fff4e3]" : "text-[#2f4669]"}`}
                >
                  FR
                </button>
              </div>

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`${
                    isActive(link.href)
                      ? "text-[#5a4328]"
                      : "text-black/80"
                  } hover:text-[#7f5f37]`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <span className="text-left normal-case tracking-normal text-[#5a4328]">Welcome, {displayName}</span>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="text-left text-black/80 hover:text-[#7f5f37]"
                  >
                    {text.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="hover:text-[#7f5f37]">
                    {text.nav.login}
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="hover:text-[#7f5f37]">
                    {text.nav.register}
                  </Link>
                </>
              )}

              <Link href="/#menu" onClick={() => setOpen(false)} className="btn-primary mt-2 text-center">
                {text.nav.shopNow}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}