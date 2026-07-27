"use client";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useLanguage } from "@/lib/language";

export default function WelcomeNote() {
  const { user, isAuthenticated } = useSupabaseUser();
  const { text } = useLanguage();

  if (!isAuthenticated) return null;

  const displayName =
    typeof user?.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : user?.email?.split("@")[0] || "Guest";

  return (
    <div className="account-chip fade-up fade-delay-1 relative mt-4 inline-flex w-full max-w-[25rem] items-center gap-2.5 overflow-hidden rounded-[1.25rem] px-3.5 py-2.5 text-[#475066] sm:px-4">
      <span className="pointer-events-none absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(71,113,167,0.2)_0%,rgba(71,113,167,0)_72%)]" />
      <span className="pointer-events-none absolute right-10 top-1 h-10 w-10 rounded-full bg-[radial-gradient(circle,rgba(195,155,94,0.26)_0%,rgba(195,155,94,0)_72%)]" />

      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-[0.9rem] font-extrabold uppercase tracking-[0.08em] text-[#2a4365] ring-1 ring-[#d3c2a8]">
        {displayName.slice(0, 1)}
      </span>

      <div className="relative z-[1] min-w-0 leading-tight">
        <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.24em] text-[#8f744b]">
          {text.welcome.member}
        </p>
        <p className="truncate pt-1 text-[1.16rem] font-semibold text-[#1b2232] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
          <span className="bg-gradient-to-r from-[#1e3658] via-[#35547f] to-[#243c5e] bg-clip-text text-transparent">
            {text.welcome.hello}, <span className="font-black">{displayName}</span>
          </span>
        </p>
        <span className="mt-1 block h-[2px] w-20 rounded-full bg-gradient-to-r from-[#33537d] via-[#c39b5e] to-transparent" />
      </div>

      <span className="relative z-[1] ml-auto inline-flex items-center gap-1 rounded-full border border-[#7ec793] bg-[#ebf9ef]/85 px-2.5 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.14em] text-[#1f7d3c]">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 fill-current">
          <path d="M7.8 14.7 3.4 10.4l1.2-1.2 3.2 3.2 7-7 1.2 1.2-8.2 8.1z" />
        </svg>
        {text.welcome.verified}
      </span>
    </div>
  );
}
