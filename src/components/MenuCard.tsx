"use client";

import { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/data/menu";
import { useCart } from "@/hooks/useCart";

export default function MenuCard({ item }: { item: MenuItem }) {
  const [showImage, setShowImage] = useState(Boolean(item.image));
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <article className="surface-panel reveal-card lux-card-hover group overflow-hidden border-orange-200/90 transition duration-300" style={{ ["--reveal-delay" as string]: `${(item.id % 8) * 65}ms` }}>
      {showImage && item.image ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ffe8cc]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            unoptimized
            className="image-glide object-cover object-center"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
            onError={() => setShowImage(false)}
          />
        </div>
      ) : (
        <div className="float-gentle flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#fff1dd] to-[#ffd7a9] text-5xl transition-transform duration-300 group-hover:scale-105">
          {item.emoji}
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="brand-font text-[1.65rem] font-semibold leading-[1.18] text-black sm:text-[1.78rem]">{item.name}</h3>
          {item.spicy && (
            <span className="whitespace-nowrap rounded-full border border-[#f2b77d] bg-[#ffebd0] px-2 py-0.5 text-[11px] font-semibold text-[#c35811]">
              🌶 Spicy
            </span>
          )}
        </div>

        <p className="mb-4 text-[0.92rem] leading-relaxed text-black/70">{item.description}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-extrabold text-[#d45a08] [font-variant-numeric:tabular-nums]">€{item.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white transition active:scale-95 ${
              added
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "pulse-gold bg-gradient-to-r from-[#ff7a1a] via-[#dd5608] to-[#b54105] hover:brightness-105"
            }`}
          >
            {added ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}