import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import BrandLogo from "@/components/BrandLogo";
import MenuAndCheckout from "@/components/MenuAndCheckout";
import WelcomeNote from "@/components/WelcomeNote";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section id="home" className="site-shell pt-28 pb-10 scroll-mt-28">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <p className="eyebrow fade-up">Story with every bite</p>
              <h1 className="fade-up fade-delay-1 section-title text-[2.35rem] sm:text-5xl md:text-[3.6rem]">
                Luxury street-style food, cooked fresh daily.
              </h1>
              <p className="fade-up fade-delay-2 mt-4 max-w-xl text-[0.98rem] leading-relaxed text-black/72">
                Flame-grilled flavors from the heart of FireBite Kitchen. Rich, smoky, and crafted to arrive hot and unforgettable.
              </p>
              <WelcomeNote />
              <div className="fade-up fade-delay-3 mt-6 flex flex-wrap gap-3">
                <Link href="/#menu" className="btn-primary">
                  Shop Now
                </Link>
                <Link href="/about" className="btn-secondary">
                  Our Story
                </Link>
              </div>

              <div className="mt-4 grid max-w-xl grid-cols-3 gap-2 text-center text-xs">
                <div className="lux-card-hover rounded-xl border border-orange-200 bg-white/85 px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(154,60,9,0.4)]">
                  <p className="brand-font text-xl text-black">2 Hrs</p>
                  <p className="text-black/55">Fast delivery</p>
                </div>
                <div className="lux-card-hover rounded-xl border border-orange-200 bg-white/85 px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(154,60,9,0.4)]">
                  <p className="brand-font text-xl text-black">100%</p>
                  <p className="text-black/55">Fresh batches</p>
                </div>
                <div className="lux-card-hover rounded-xl border border-orange-200 bg-white/85 px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(154,60,9,0.4)]">
                  <p className="brand-font text-xl text-black">4.9</p>
                  <p className="text-black/55">Average rating</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-4 rounded-[2rem] border-2 border-orange-200 bg-gradient-to-br from-[#ffe9ca] via-transparent to-[#ffd7a5]" />
              <div className="absolute -right-4 -top-4 rounded-full bg-gradient-to-r from-[#e66b13] to-[#bb4105] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#fff1de] shadow">
                FireBite Signature
              </div>
              <div className="lux-card-hover relative overflow-hidden rounded-[2rem] border border-orange-200 bg-white/95 p-3.5 shadow-[0_24px_38px_-24px_rgba(164,63,8,0.45)]">
                <BrandLogo />
              </div>
            </div>
          </div>
        </section>

        <section className="site-shell pb-6">
          <div className="surface-panel pulse-gold px-4 py-4 md:px-5 md:py-5">
            <div className="fade-up text-center">
              <p className="eyebrow">Elevating flavor craftsmanship</p>
              <h2 className="section-title text-[2rem] sm:text-[2.35rem]">Premium ingredients, exceptional taste</h2>
            </div>
            <div className="mt-4 grid gap-2.5 md:grid-cols-3">
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
                  className="reveal-card lux-card-hover rounded-xl border border-orange-200 bg-gradient-to-b from-white to-[#ffeac8] p-3 shadow-[0_12px_22px_-18px_rgba(155,60,9,0.35)]"
                  style={{ ["--reveal-delay" as string]: `${120 + idx * 90}ms` }}
                >
                  <p className="brand-font text-[1.65rem] leading-none text-[#cc5608]">{feature.no}</p>
                  <h3 className="mt-1 text-[1.6rem] font-semibold leading-tight text-black">{feature.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-black/65">{feature.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <MenuAndCheckout />

        <section className="site-shell pb-3">
          <div className="surface-panel fade-up bg-gradient-to-r from-[#ffe2ba] via-[#fff2de] to-[#ffdcb0] p-4 text-center sm:p-5">
            <h3 className="section-title text-gold-gradient text-[1.9rem] sm:text-[2.35rem]">Ready for your next favorite meal?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-black/70">
              Browse the menu and pick your perfect balance of spice, comfort, and sweetness.
            </p>
            <Link href="/#menu" className="btn-primary float-gentle mt-4">
              Start Ordering
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}