import { createClient } from "@supabase/supabase-js";
import { Agent } from "undici";
import { readFileSync } from "node:fs";

function getTlsDispatcher() {
  const insecureTls = process.env.SUPABASE_TLS_INSECURE === "true";
  const customCaPath = process.env.SUPABASE_CA_CERT_PATH;

  if (insecureTls) {
    // Development-only fallback for environments with TLS interception.
    return new Agent({ connect: { rejectUnauthorized: false } });
  }

  if (customCaPath) {
    return new Agent({ connect: { ca: readFileSync(customCaPath, "utf8") } });
  }

  return undefined;
}

function isTlsCertError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("unable to get local issuer certificate") ||
    msg.includes("unable_to_get_issuer_cert_locally") ||
    msg.includes("self-signed certificate")
  );
}

export function getSupabaseServerClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serverKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  const dispatcher = getTlsDispatcher();
  const fallbackDispatcher =
    process.env.NODE_ENV !== "production"
      ? new Agent({ connect: { rejectUnauthorized: false } })
      : undefined;

  const customFetch: typeof fetch = (input, init) =>
    fetch(input, {
      ...(init || {}),
      ...(dispatcher ? ({ dispatcher } as Record<string, unknown>) : {}),
    }).catch((error) => {
      if (fallbackDispatcher && !dispatcher && isTlsCertError(error)) {
        return fetch(input, {
          ...(init || {}),
          ...({ dispatcher: fallbackDispatcher } as Record<string, unknown>),
        });
      }
      throw error;
    });

  return createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: customFetch },
  });
}
