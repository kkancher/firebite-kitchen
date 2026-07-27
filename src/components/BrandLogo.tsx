"use client";

import { useState } from "react";
import Image from "next/image";

export default function BrandLogo() {
  const [showImage, setShowImage] = useState(true);

  if (!showImage) {
    return (
      <div className="logo-stage rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-8 text-center">
        <p className="display-font text-5xl text-black">FireBite</p>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.32em] text-orange-600">Kitchen</p>
        <p className="mt-4 text-sm text-black/60">Add your logo at public/firebite-logo.png to render the brand mark here.</p>
      </div>
    );
  }

  return (
    <div className="logo-stage logo-float relative flex min-h-[180px] items-center justify-center rounded-xl bg-white p-2.5 sm:min-h-[220px]">
      <span className="logo-halo" />
      <div className="logo-breath relative z-[2]">
        <Image
          src="/firebite-logo.png"
          alt="FireBite Kitchen logo"
          width={420}
          height={420}
          unoptimized
          className="max-h-[180px] w-auto max-w-full object-contain sm:max-h-[220px]"
          priority
          onError={() => setShowImage(false)}
        />
      </div>
    </div>
  );
}