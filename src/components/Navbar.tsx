"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useSupabaseUser();
  const links = [
    { href: "/#home", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/orders", label: "Orders" },
    { href: "/admin", label: "Admin" },
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
        France: fast delivery • EU shipping available • Freshly cooked daily
      </div>

      <nav className="w-full border-b border-orange-200/80 bg-[#fff9ef]/92 shadow-[0_12px_28px_-22px_rgba(143,58,10,0.4)] backdrop-blur-xl">
        <div className="site-shell flex items-center justify-between py-2.5 md:py-3">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="nav-logo-pop rounded-full border border-orange-200 bg-white p-1 shadow-sm">
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
              <p className="brand-font text-[1.75rem] font-semibold text-[#2b1710]">FireBite</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#da6f1d]">Kitchen</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3.5 text-[0.86rem] font-semibold uppercase tracking-[0.12em] text-black/80">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-anim rounded-full px-3.5 py-1.5 transition-colors hover:text-[#da6912] focus:text-[#da6912] ${
                  isActive(link.href)
                    ? "bg-gradient-to-r from-[#ffefda] via-[#ffe4c1] to-[#ffd8a7] text-[#8b3e07]"
                    : "text-black/80"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-full border border-orange-200 px-4 py-2 text-[0.92rem] font-bold text-black/75 transition hover:bg-[#ffe9cb]"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-3.5 py-1.5 hover:text-[#7f5f37]">
                  Login
                </Link>
                <Link href="/register" className="rounded-full px-3.5 py-1.5 hover:text-[#7f5f37]">
                  Register
                </Link>
              </>
            )}
          </div>

          <Link href="/#menu" className="btn-primary hidden md:inline-flex">
            Shop Now
          </Link>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            className="text-2xl text-[#171513] md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open && (
          <div className="site-shell pb-4 md:hidden">
            <div className="surface-panel flex flex-col gap-3 px-4 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black/80">
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
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="hover:text-[#7f5f37]">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="hover:text-[#7f5f37]">
                    Register
                  </Link>
                </>
              )}

              <Link href="/#menu" onClick={() => setOpen(false)} className="btn-primary mt-2 text-center">
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}