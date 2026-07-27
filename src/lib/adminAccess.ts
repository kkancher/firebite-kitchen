function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function parseAdminEmails(raw: string | undefined) {
  if (!raw) return [];

  return raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter((entry) => entry.length > 0);
}

export function getAdminEmailAllowlist() {
  const fromList = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (fromList.length > 0) return fromList;

  const singleAdmin = process.env.ADMIN_EMAIL?.trim();
  if (singleAdmin) return [normalizeEmail(singleAdmin)];

  return [];
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const allowlist = getAdminEmailAllowlist();
  if (allowlist.length === 0) return false;

  return allowlist.includes(normalizeEmail(email));
}

export function isAdminConfigured() {
  return getAdminEmailAllowlist().length > 0;
}
