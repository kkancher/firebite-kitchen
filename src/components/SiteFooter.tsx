"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";

export default function SiteFooter() {
  const { text } = useLanguage();

  return (
    <footer className="fade-up mt-12 border-t border-[#d9c5a5]/80 bg-[linear-gradient(115deg,#1a2b46_0%,#243e66_52%,#1a2b46_100%)] py-7 text-sm text-[#f2e8d8]">
      <div className="site-shell grid gap-4 text-center md:grid-cols-3 md:text-left">
        <div>
          <p className="brand-font text-[2rem] font-semibold text-[#f9ecd7]">FireBite Kitchen</p>
          <p className="mt-1.5 text-[#eadfcd]">{text.footer.tagline}</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ecdcc5]">{text.footer.quickLinks}</p>
          <div className="mt-2 space-y-1.5">
            <Link href="/#home" className="footer-link-anim block transition hover:text-[#f7e5ca]">{text.nav.home}</Link>
            <Link href="/#menu" className="footer-link-anim block transition hover:text-[#f7e5ca]">Menu</Link>
            <Link href="/orders" className="footer-link-anim block transition hover:text-[#f7e5ca]">{text.nav.orders}</Link>
          </div>
        </div>

        <div className="md:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ecdcc5]">{text.footer.service}</p>
          <p className="mt-2 text-[#eadfcd]">{text.footer.delivery}</p>
          <p className="mt-1 text-[#eadfcd]">{text.footer.schedule}</p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-[#dcc09a]">© {new Date().getFullYear()} FireBite Kitchen. All rights reserved.</p>
    </footer>
  );
}