"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/lib/language";

export default function AboutPage() {
  const { language } = useLanguage();
  const isFr = language === "fr";
  const galleryItems = [
    {
      src: "/chicken-biryani.png",
      en: "Smoky Chicken Biryani",
      fr: "Biryani de poulet fume",
    },
    {
      src: "/chicken-wings.png",
      en: "Fire Chicken Wings",
      fr: "Ailes de poulet relevees",
    },
    {
      src: "/french-fries.png",
      en: "Golden French Fries",
      fr: "Frites dorees",
    },
    {
      src: "/panna-cotta.png",
      en: "Vanilla Panna Cotta",
      fr: "Panna cotta a la vanille",
    },
    {
      src: "/egg-fried-rice.png",
      en: "Egg Fried Rice",
      fr: "Riz saute a l'oeuf",
    },
    {
      src: "/gulab-jamun.png",
      en: "Gulab Jamun",
      fr: "Gulab Jamun",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-7">
        <section className="surface-panel section-graphics fade-up bg-gradient-to-b from-white to-[#ece3d5] p-4 text-center sm:p-5">
          <p className="eyebrow">About Us</p>
          <h1 className="brand-font text-[2rem] text-black sm:text-[2.28rem]">
            {isFr
              ? "Concue autour du feu, des saveurs et de bouchees inoubliables."
              : "Built around fire, flavor, and unforgettable bites."}
          </h1>
          <div className="mx-auto mt-3 h-px w-14 bg-[#cab79b]" />
          <p className="section-copy mx-auto">
            {isFr
              ? "FireBite Kitchen est ne d'une passion pour les saveurs intenses et la conviction que la cuisine doit susciter la joie du premier parfum jusqu'a la derniere bouchee."
              : "FireBite Kitchen was born from a love of bold, fiery flavors and the belief that food should spark joy from the first aroma to the final bite."}
          </p>
        </section>

        <section className="mt-3.5 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
          {[
            { emoji: "🍛", label: "Recipes", value: "20+" },
            { emoji: "⭐", label: "Avg. Rating", value: "4.9" },
            { emoji: "🚀", label: "Orders Served", value: "10K+" },
          ].map((stat) => (
            <div key={stat.label} className="surface-panel reveal-card lux-card-hover bg-gradient-to-b from-white to-[#ece3d5] p-3 shadow-[0_12px_22px_-18px_rgba(30,47,73,0.24)]">
              <div className="mb-1 text-[1.72rem]">{stat.emoji}</div>
              <div className="brand-font text-[1.45rem] text-[#2f476c]">{stat.value}</div>
              <div className="mt-1 text-sm font-bold uppercase tracking-wide text-black/65">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="surface-panel section-graphics mt-3.5 bg-gradient-to-b from-white to-[#ece3d5] p-4 sm:p-5">
          <div className="text-center">
            <p className="eyebrow">{isFr ? "Galerie" : "Gallery"}</p>
            <h2 className="brand-font text-[1.5rem] text-black sm:text-[1.8rem]">
              {isFr ? "Un apercu de notre cuisine" : "A glimpse of our kitchen"}
            </h2>
            <p className="section-copy mx-auto mt-2">
              {isFr
                ? "Quelques assiettes signatures servies chaque jour avec soin, chaleur et caractere."
                : "A few signature plates we serve daily with care, warmth, and character."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {galleryItems.map((item, index) => (
              <figure
                key={item.src}
                className="reveal-card group overflow-hidden rounded-xl border border-[#d8c7ad] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,230,212,0.95))] shadow-[0_16px_24px_-22px_rgba(30,47,73,0.35)]"
                style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f8f1e5]">
                  <Image
                    src={item.src}
                    alt={isFr ? item.fr : item.en}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="image-glide object-cover"
                  />
                </div>
                <figcaption className="px-2.5 py-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.11em] text-[#2f476c]">
                  {isFr ? item.fr : item.en}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="surface-panel section-graphics mt-3.5 space-y-3 bg-gradient-to-b from-white to-[#ece3d5] p-4 leading-relaxed text-black/72 sm:p-5">
          <p>
            {isFr
              ? "Nous avons lance FireBite dans une petite cuisine avec une mission: creer des plats qui font dire wow des la premiere bouchee."
              : "We started FireBite in a small kitchen with one mission: make food that makes people pause mid-bite and say wow."}
          </p>
          <p>
            {isFr
              ? "Que vous cherchiez du pimente, du reconfort ou de la gourmandise, notre menu suit votre envie avec exigence et attention."
              : "Whether you are craving something spicy, comforting, or indulgent, our menu is designed to match your mood with confidence and care."}
          </p>
          <p className="font-semibold text-[#355076]">{isFr ? "Bienvenue chez FireBite. Comme a la maison." : "Welcome to FireBite. Welcome home."}</p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}