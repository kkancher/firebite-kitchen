import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-7">
        <section className="surface-panel bg-gradient-to-b from-white to-[#f4ecdf] p-5 text-center sm:p-6">
          <p className="eyebrow">About Us</p>
          <h1 className="brand-font text-3xl text-black sm:text-4xl">Built around fire, flavor, and unforgettable bites.</h1>
          <div className="mx-auto mt-4 h-px w-16 bg-stone-300" />
          <p className="section-copy mx-auto">
            FireBite Kitchen was born from a love of bold, fiery flavors and the belief that food should spark joy from the first aroma to the final bite.
          </p>
        </section>

        <section className="mt-3.5 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
          {[
            { emoji: "🍛", label: "Recipes", value: "20+" },
            { emoji: "⭐", label: "Avg. Rating", value: "4.9" },
            { emoji: "🚀", label: "Orders Served", value: "10K+" },
          ].map((stat) => (
            <div key={stat.label} className="surface-panel bg-gradient-to-b from-white to-[#f5ecdf] p-3.5 shadow-[0_12px_22px_-18px_rgba(56,45,33,0.3)]">
              <div className="mb-1 text-3xl">{stat.emoji}</div>
              <div className="brand-font text-[1.75rem] text-[#6a5132]">{stat.value}</div>
              <div className="mt-1 text-sm font-bold uppercase tracking-wide text-black/65">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="surface-panel mt-3.5 space-y-3 bg-gradient-to-b from-white to-[#f5ecdf] p-4.5 leading-relaxed text-black/72 sm:p-6">
          <p>
            We started FireBite in a small kitchen with one mission: make food that makes people pause mid-bite and say wow.
          </p>
          <p>
            Whether you are craving something spicy, comforting, or indulgent, our menu is designed to match your mood with confidence and care.
          </p>
          <p className="font-semibold text-[#6a5132]">Welcome to FireBite. Welcome home.</p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}