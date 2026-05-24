import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let browserClient = null;

function getExpectedAuthStorageKey() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  try {
    const host = new URL(supabaseUrl).host;
    const projectRef = host.split(".")[0];

    return projectRef ? `sb-${projectRef}-auth-token` : "";
  } catch {
    return "";
  }
}

function getAuthStorageValueSummary(key) {
  const summary = {
    key,
    parseable: false,
    hasAccessToken: false,
    hasRefreshToken: false,
    hasCurrentSession: false,
    userEmail: "",
  };

  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;
    const currentSession = parsedValue?.currentSession || parsedValue;
    const user = parsedValue?.user || currentSession?.user || null;

    summary.parseable = Boolean(parsedValue);
    summary.hasAccessToken = Boolean(currentSession?.access_token);
    summary.hasRefreshToken = Boolean(currentSession?.refresh_token);
    summary.hasCurrentSession = Boolean(parsedValue?.currentSession);
    summary.userEmail = user?.email || "";
  } catch {
    summary.parseable = false;
  }

  return summary;
}

function isSupabaseAuthStorageKey(key) {
  const normalizedKey = String(key || "").toLowerCase();
  const valueSummary =
    typeof window === "undefined"
      ? null
      : getAuthStorageValueSummary(key);

  return (
    normalizedKey === "supabase.auth.token" ||
    (normalizedKey.startsWith("sb-") && normalizedKey.includes("auth")) ||
    (normalizedKey.includes("supabase") && normalizedKey.includes("auth")) ||
    (normalizedKey.includes("auth") &&
      Boolean(
        valueSummary?.hasAccessToken ||
          valueSummary?.hasRefreshToken ||
          valueSummary?.hasCurrentSession
      ))
  );
}

export function getSupabaseAuthStorageSummary(activeStorageKey = "") {
  const expectedStorageKey = activeStorageKey || getExpectedAuthStorageKey();

  if (typeof window === "undefined") {
    return {
      activeStorageKey: expectedStorageKey,
      authStorageKeys: [],
      staleAuthStorageKeys: [],
      storedAuthKeySummaries: [],
    };
  }

  try {
    const authStorageKeys = Object.keys(window.localStorage).filter(
      isSupabaseAuthStorageKey
    );
    const staleAuthStorageKeys = authStorageKeys.filter(
      (key) => key !== expectedStorageKey
    );

    return {
      activeStorageKey: expectedStorageKey,
      authStorageKeys,
      staleAuthStorageKeys,
      hasActiveStorageKey: expectedStorageKey
        ? authStorageKeys.includes(expectedStorageKey)
        : false,
      storedAuthKeySummaries: authStorageKeys.map(getAuthStorageValueSummary),
    };
  } catch {
    return {
      activeStorageKey: expectedStorageKey,
      authStorageKeys: ["localStorage-unavailable"],
      staleAuthStorageKeys: [],
      hasActiveStorageKey: false,
      storedAuthKeySummaries: [],
    };
  }
}

export function cleanupStaleSupabaseAuthStorage(activeStorageKey = "") {
  const expectedStorageKey = activeStorageKey || getExpectedAuthStorageKey();

  if (typeof window === "undefined" || !expectedStorageKey) {
    return getSupabaseAuthStorageSummary(expectedStorageKey);
  }

  const before = getSupabaseAuthStorageSummary(expectedStorageKey);

  try {
    before.staleAuthStorageKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch {
    // Storage access can be restricted on some browsers.
  }

  const after = getSupabaseAuthStorageSummary(expectedStorageKey);

  return after;
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  cleanupStaleSupabaseAuthStorage();

  browserClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  cleanupStaleSupabaseAuthStorage(browserClient.auth.storageKey);

  return browserClient;
}
