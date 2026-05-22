// Add admin emails in .env.local like:
// NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,owner@example.com
export function getAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeAdminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isAdminEmail(email) {
  if (!email) return false;

  return getAdminEmails().includes(normalizeAdminEmail(email));
}
