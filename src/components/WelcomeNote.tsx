"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export default function WelcomeNote() {
  const { user, isAuthenticated } = useSupabaseUser();

  if (!isAuthenticated) return null;

  const displayName =
    typeof user?.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : user?.email?.split("@")[0] || "Guest";

  return (
    <div className="account-chip fade-up fade-delay-1 mt-5 inline-flex w-full max-w-[27rem] items-center gap-3 rounded-[1.5rem] px-4 py-3 text-[#6c3f1e] sm:px-5">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-[0.95rem] font-extrabold uppercase tracking-[0.08em] text-[#d45a08] ring-1 ring-[#f0be84]">
        {displayName.slice(0, 1)}
      </span>

      <div className="min-w-0 leading-tight">
        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#cc6b1f]">
          FireBite Member
        </p>
        <p className="truncate pt-1 text-[1.28rem] font-semibold text-[#1f1a15]">
          Bonjour, <span className="font-black">{displayName}</span>
        </p>
      </div>

      <span className="ml-auto hidden rounded-full border border-[#efc08c] bg-white/70 px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-[#d45a08] sm:inline-flex">
        Verified
      </span>
    </div>
  );
}
