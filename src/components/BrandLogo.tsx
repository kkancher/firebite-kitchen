"use client";

import { useState } from "react";
import Image from "next/image";

export default function BrandLogo() {
  const [showImage, setShowImage] = useState(true);

  if (!showImage) {
    return (
      <div className="logo-stage section-graphics rounded-xl border border-[#d7c8ae] bg-gradient-to-br from-[#f7f2e8] to-[#ebe0ce] p-8 text-center">
        <p className="display-font text-5xl text-black">FireBite</p>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.32em] text-[#8d7248]">Kitchen</p>
        <p className="mt-4 text-sm text-black/60">Add your logo at public/firebite-logo.png to render the brand mark here.</p>
      </div>
    );
  }

  return (
    <div className="logo-stage logo-float relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-[1.55rem] border border-[#d8e1ef] bg-[radial-gradient(circle_at_52%_28%,#ffffff_0%,#edf3fb_78%,#e5eef9_100%)] p-3 shadow-[0_24px_46px_-34px_rgba(29,47,72,0.58)] sm:min-h-[220px]">
      <span className="logo-halo" />
      <span className="logo-ring logo-ring-a" />
      <div className="logo-breath relative z-[2] w-[min(84vw,19rem)] overflow-hidden rounded-full border border-[#cfdaeb]/90 bg-white/96 p-1.5 shadow-[0_18px_34px_-22px_rgba(30,47,73,0.56)] sm:w-[20rem]">
        <Image
          src="/firebite-logo.png"
          alt="FireBite Kitchen logo"
          width={420}
          height={420}
          unoptimized
          className="mx-auto max-h-[180px] w-auto max-w-full object-contain sm:max-h-[220px]"
          style={{ clipPath: "circle(49% at 50% 50%)" }}
          priority
          onError={() => setShowImage(false)}
        />
      </div>
    </div>
  );
}