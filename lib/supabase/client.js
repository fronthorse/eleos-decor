import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const isBrowser = typeof window !== "undefined";

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      ...(isBrowser
        ? {
            cookies: {
              encode: "tokens-only",
            },
          }
        : {}),
      isSingleton: true,
    }
  );
}
