"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import BrandLogo from "@/components/BrandLogo";
import MenuAndCheckout from "@/components/MenuAndCheckout";
import WelcomeNote from "@/components/WelcomeNote";
import { useLanguage } from "@/lib/language";

export default function Home() {
  const { text } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="relative pb-4">
        <div className="lux-orb lux-orb-a left-[-4rem] top-24" />
        <div className="lux-orb lux-orb-b right-[-3rem] top-[26rem]" />
        <div className="ambience-line left-[-12rem] top-28" />
        <div className="ambience-line ambience-line-b right-[-10rem] top-40" />

        <section id="home" className="site-shell section-graphics pt-24 pb-10 scroll-mt-28">
          <div className="surface-panel px-4 py-5 sm:px-6 sm:py-6">
            <div className="relative z-[1] grid items-center gap-6 lg:grid-cols-[1.06fr_0.94fr]">
            <div>
              <p className="eyebrow fade-up">{text.hero.eyebrow}</p>
              <h1 className="fade-up fade-delay-1 section-title text-[1.92rem] sm:text-[2.36rem] md:text-[2.76rem]">
                {text.hero.title}
              </h1>
              <p className="fade-up fade-delay-2 mt-3 max-w-xl text-[0.92rem] leading-relaxed text-black/72">
                {text.hero.subtitle}
              </p>
              <WelcomeNote />
              <div className="fade-up fade-delay-3 mt-5 flex flex-wrap gap-2.5">
                <Link href="/#menu" className="btn-primary">
                  {text.nav.shopNow}
                </Link>
                <Link href="/about" className="btn-secondary">
                  {text.hero.ourStory}
                </Link>
              </div>

              <div className="mt-3.5 grid max-w-xl grid-cols-3 gap-2 text-center text-xs">
                <div className="lux-card-hover rounded-xl border border-[#ddc8a4] bg-white/92 px-3 py-2 shadow-[0_14px_24px_-20px_rgba(30,47,73,0.3)]">
                  <p className="brand-font text-xl text-black">2 Hrs</p>
                  <p className="text-black/55">{text.hero.fastDelivery}</p>
                </div>
                <div className="lux-card-hover rounded-xl border border-[#ddc8a4] bg-white/92 px-3 py-2 shadow-[0_14px_24px_-20px_rgba(30,47,73,0.3)]">
                  <p className="brand-font text-xl text-black">100%</p>
                  <p className="text-black/55">{text.hero.freshBatches}</p>
                </div>
                <div className="lux-card-hover rounded-xl border border-[#ddc8a4] bg-white/92 px-3 py-2 shadow-[0_14px_24px_-20px_rgba(30,47,73,0.3)]">
                  <p className="brand-font text-xl text-black">4.9</p>
                  <p className="text-black/55">{text.hero.avgRating}</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:justify-self-end">
              <div className="absolute -inset-4 rounded-[2rem] border-2 border-[#dcc8a9] bg-gradient-to-br from-[#f8f0e3] via-transparent to-[#ecdcc3]" />
              <div className="absolute -right-4 -top-4 rounded-full bg-gradient-to-r from-[#274269] to-[#c39b5e] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#fbefdd] shadow">
                Maison Signature
              </div>
              <div className="lux-card-hover relative overflow-hidden rounded-[2rem] border border-[#dcc7a7] bg-white/96 p-3 shadow-[0_26px_40px_-24px_rgba(30,47,73,0.34)]">
                <BrandLogo />
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="site-shell pb-5">
          <div className="surface-panel section-graphics pulse-gold px-4 py-4 md:px-5 md:py-5">
            <div className="fade-up text-center">
              <p className="eyebrow">{text.hero.craftsmanship}</p>
              <h2 className="section-title text-[1.55rem] sm:text-[1.86rem]">{text.hero.premiumTitle}</h2>
            </div>
            <div className="mt-3.5 grid gap-2 md:grid-cols-3">
              {[
                {
                  no: "I",
                  title: "Fresh Spice Blends",
                  copy: "Layered house masalas bring depth, aroma, and just the right heat in every dish.",
                },
                {
                  no: "II",
                  title: "Slow-Cooked Sauces",
                  copy: "From smoky to creamy, every sauce is simmered in small batches for richer flavor.",
                },
                {
                  no: "III",
                  title: "Premium Proteins",
                  copy: "Tender chicken and quality ingredients ensure each plate tastes bold yet balanced.",
                },
              ].map((feature, idx) => (
                <article
                  key={feature.no}
                  className="reveal-card lux-card-hover rounded-xl border border-[#dcc8a8] bg-gradient-to-b from-white to-[#efe3d0] p-3 shadow-[0_14px_26px_-20px_rgba(30,47,73,0.26)]"
                  style={{ ["--reveal-delay" as string]: `${120 + idx * 90}ms` }}
                >
                  <p className="brand-font text-[1.35rem] leading-none text-[#355076]">{feature.no}</p>
                  <h3 className="mt-1 text-[1.35rem] font-semibold leading-tight text-black">{feature.title}</h3>
                  <p className="mt-1.5 text-[0.88rem] leading-relaxed text-black/65">{feature.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <MenuAndCheckout />

        <section className="site-shell pb-3">
          <div className="surface-panel section-graphics fade-up bg-gradient-to-r from-[#efe3d1] via-[#fcf6ec] to-[#e9d9bf] p-4 text-center sm:p-5">
            <h3 className="section-title text-gold-gradient text-[1.7rem] sm:text-[2rem]">{text.hero.ctaTitle}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-black/70">
              {text.hero.ctaCopy}
            </p>
            <Link href="/#menu" className="btn-primary float-gentle mt-4">
              {text.hero.startOrdering}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}