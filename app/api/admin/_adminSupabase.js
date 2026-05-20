import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "../../../lib/adminAuth";

export const PRODUCTS_STORAGE_BUCKET = "products";
const API_DB_TIMEOUT_MS = 15000;

export function withApiTimeout(promise, message, timeoutMs = API_DB_TIMEOUT_MS) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      const error = new Error(message);
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    globalThis.clearTimeout(timeoutId);
  });
}

export function getBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
}

export function jsonError(message, status = 500, details = null) {
  return Response.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export async function requireAdmin(request) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      errorResponse: jsonError("Not authenticated. Please log in again.", 401),
    };
  }

  const userSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await withApiTimeout(
    userSupabase.auth.getUser(accessToken),
    "Admin token verification timed out."
  );

  if (userError || !user) {
    return {
      errorResponse: jsonError("Not authenticated. Please log in again.", 401),
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      errorResponse: jsonError("You are not authorized for admin changes.", 403),
    };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      errorResponse: jsonError("Admin database service is not configured.", 500),
    };
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return { adminSupabase, user };
}

export function getStoragePathFromPublicUrl(url) {
  return String(url || "").split(`/${PRODUCTS_STORAGE_BUCKET}/`)[1] || "";
}
