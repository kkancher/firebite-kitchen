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
    <article className="surface-panel reveal-card lux-card-hover group overflow-hidden border-[#d8c8ae]/90 transition duration-300" style={{ ["--reveal-delay" as string]: `${(item.id % 8) * 65}ms` }}>
      {showImage && item.image ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ede4d6]">
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
        <div className="float-gentle flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#f4eee3] to-[#e2d5c3] text-5xl transition-transform duration-300 group-hover:scale-105">
          {item.emoji}
        </div>
      )}

      <div className="p-3.5 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="brand-font text-[1.42rem] font-semibold leading-[1.18] text-black sm:text-[1.56rem]">{item.name}</h3>
          <div className="flex flex-col items-end gap-1">
            {item.spicy && (
              <span className="whitespace-nowrap rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                🌶 Spicy
              </span>
            )}
            {item.veg && (
              <span className="whitespace-nowrap rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                🍃 Veg
              </span>
            )}
          </div>
        </div>

        <p className="mb-3.5 text-[0.84rem] leading-relaxed text-black/70">{item.description}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.96rem] font-extrabold text-[#8b7350] [font-variant-numeric:tabular-nums]">€{item.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white transition active:scale-95 ${
              added
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "pulse-gold bg-gradient-to-r from-[#2d4364] via-[#3a5883] to-[#a98a59] hover:brightness-105"
            }`}
          >
            {added ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}