"use client";

import { useMemo, useState } from "react";
import MenuCard from "@/components/MenuCard";
import CartPanel from "@/components/CartPanel";
import { categories, menuItems } from "@/data/menu";
import { useLanguage } from "@/lib/language";

export default function MenuAndCheckout() {
  const { text } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price-low" | "price-high">(
    "popular"
  );
  const allCategories = ["All", ...categories];
  const filtered = useMemo(() => {
    const base =
      activeCategory === "All"
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory);

    const byQuery = query.trim().length
      ? base.filter((item) => {
          const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
          return haystack.includes(query.trim().toLowerCase());
        })
      : base;

    if (sortBy === "price-low") {
      return [...byQuery].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-high") {
      return [...byQuery].sort((a, b) => b.price - a.price);
    }
    return byQuery;
  }, [activeCategory, query, sortBy]);

  return (
    <section id="menu" className="site-shell pb-8 scroll-mt-28">
      <div className="surface-panel section-graphics fade-up p-3.5 text-center sm:p-4.5">
        <p className="eyebrow pulse-gold">Menu</p>
        <h2 className="brand-font text-[1.72rem] leading-tight text-black sm:text-[2.05rem]">{text.menu.title}</h2>
        <div className="mx-auto mt-2.5 h-px w-14 bg-[#c9b090]" />
        <p className="section-copy mx-auto">{text.menu.subtitle}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-all ${
              activeCategory === cat
                ? "bg-gradient-to-r from-[#26456f] to-[#c39b5e] text-[#faf0de] shadow-[0_12px_24px_-14px_rgba(31,48,74,0.56)]"
                : "border border-[#dcc8a6] bg-white/85 text-black/80 hover:-translate-y-0.5 hover:bg-[#f0e4cf]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <label className="relative">
          <span className="sr-only">Search menu</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={text.menu.search}
            className="w-full rounded-xl border border-[#d8c3a2] bg-white/92 px-3 py-2 text-sm text-black outline-none transition focus:border-[#a78659]"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Sort menu</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "popular" | "price-low" | "price-high")}
            className="w-full rounded-xl border border-[#d8c3a2] bg-white/92 px-3 py-2 text-sm text-black outline-none transition focus:border-[#a78659]"
          >
            <option value="popular">{text.menu.sortPopular}</option>
            <option value="price-low">{text.menu.sortLow}</option>
            <option value="price-high">{text.menu.sortHigh}</option>
          </select>
        </label>
      </div>

      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/55">
        {text.menu.showing} {filtered.length} {filtered.length === 1 ? text.menu.item : text.menu.items}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
        <CartPanel />
      </div>
    </section>
  );
}
