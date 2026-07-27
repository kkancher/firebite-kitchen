import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="fade-up mt-12 border-t border-stone-300/80 bg-gradient-to-r from-[#ece0ce]/80 via-[#f9f4ec] to-[#ece0ce]/80 py-7 text-sm text-black/65">
      <div className="site-shell grid gap-4 text-center md:grid-cols-3 md:text-left">
        <div>
          <p className="brand-font text-[2.15rem] font-semibold text-black">FireBite Kitchen</p>
          <p className="mt-1.5">Flame-grilled comfort, made fresh daily.</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/65">Quick Links</p>
          <div className="mt-2 space-y-1.5">
            <Link href="/#home" className="footer-link-anim block transition hover:text-[#6a5132]">Home</Link>
            <Link href="/#menu" className="footer-link-anim block transition hover:text-[#6a5132]">Menu</Link>
            <Link href="/orders" className="footer-link-anim block transition hover:text-[#6a5132]">Orders</Link>
          </div>
        </div>

        <div className="md:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/65">Service</p>
          <p className="mt-2">Paris Delivery • EU Friendly</p>
          <p className="mt-1">Open Daily • Fresh Kitchen</p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-black/55">© {new Date().getFullYear()} FireBite Kitchen. All rights reserved.</p>
    </footer>
  );
}