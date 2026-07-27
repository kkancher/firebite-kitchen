"use client";

import { useMemo, useState } from "react";
import MenuCard from "@/components/MenuCard";
import CartPanel from "@/components/CartPanel";
import { categories, menuItems } from "@/data/menu";

export default function MenuAndCheckout() {
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
      <div className="surface-panel fade-up p-4 text-center sm:p-5">
        <p className="eyebrow pulse-gold">Menu</p>
        <h2 className="brand-font text-[1.95rem] leading-tight text-black sm:text-[2.25rem]">Handcrafted dishes for every craving</h2>
        <div className="mx-auto mt-3 h-px w-14 bg-orange-300" />
        <p className="section-copy mx-auto">Filter by category and order directly below.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
              activeCategory === cat
                ? "bg-gradient-to-r from-[#ff7b1b] to-[#c24806] text-[#fff3e4] shadow-[0_10px_22px_-12px_rgba(168,64,7,0.86)]"
                : "border border-orange-200 bg-white/80 text-black/80 hover:-translate-y-0.5 hover:bg-[#ffe9cb]"
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
            placeholder="Search dishes, category..."
            className="w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm text-black outline-none transition focus:border-[#9f835f]"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Sort menu</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "popular" | "price-low" | "price-high")}
            className="w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm text-black outline-none transition focus:border-[#9f835f]"
          >
            <option value="popular">Sort: Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </label>
      </div>

      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.11em] text-black/55">
        Showing {filtered.length} item{filtered.length === 1 ? "" : "s"}
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
