import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let browserClient = null;

function getSupabaseProjectRef() {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").host;

    return host.split(".")[0] || "eleos";
  } catch {
    return "eleos";
  }
}

export const SUPABASE_AUTH_STORAGE_KEY = `sb-${getSupabaseProjectRef()}-auth-token`;

function createLocalStorageAdapter() {
  return {
    getItem(key) {
      if (typeof window === "undefined") return null;

      return window.localStorage.getItem(key);
    },
    setItem(key, value) {
      if (typeof window === "undefined") return;

      window.localStorage.setItem(key, value);
    },
    removeItem(key) {
      if (typeof window === "undefined") return;

      window.localStorage.removeItem(key);
    },
  };
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: createLocalStorageAdapter(),
        storageKey: SUPABASE_AUTH_STORAGE_KEY,
      },
    }
  );

  return browserClient;
}
