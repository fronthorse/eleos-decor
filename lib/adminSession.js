import { getAdminEmails, isAdminEmail, normalizeAdminEmail } from "./adminAuth";
import { getSessionSafely, withTimeout } from "./supabase/auth";

const DEFAULT_ADMIN_AUTH_TIMEOUT_MS = 10000;
const DEFAULT_ADMIN_AUTH_MAX_ATTEMPTS = 3;
const DEFAULT_ADMIN_AUTH_RETRY_DELAY_MS = 800;

function wait(ms) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export function logAdminAuthDebug(stage, details = {}) {
  console.info("[admin auth]", stage, details);
}

export function isRecoverableAdminAuthError(error) {
  if (!error) return false;
  if (error.name === "TimeoutError") return true;

  const message = String(error.message || "").toLowerCase();

  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

function getPublicSupabaseConfigSummary() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  let host = "";

  try {
    host = url ? new URL(url).host : "";
  } catch {
    host = "invalid-url";
  }

  return {
    hasUrl: Boolean(url),
    host,
    hasAnonKey: Boolean(anonKey),
  };
}

function getStoredAuthKeySummary(key) {
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

function getBrowserAuthStorageSummary(supabase) {
  const configuredStorageKey = supabase?.auth?.storageKey || "";

  if (typeof window === "undefined") {
    return {
      configuredStorageKey,
      authStorageKeys: [],
      storedAuthKeySummaries: [],
    };
  }

  let authStorageKeys = [];
  let storedAuthKeySummaries = [];

  try {
    authStorageKeys = Object.keys(window.localStorage).filter((key) => {
      const normalizedKey = key.toLowerCase();

      return (
        normalizedKey.includes("supabase") ||
        normalizedKey.includes("auth") ||
        normalizedKey.startsWith("sb-")
      );
    });
    storedAuthKeySummaries = authStorageKeys.map(getStoredAuthKeySummary);
  } catch {
    authStorageKeys = ["localStorage-unavailable"];
    storedAuthKeySummaries = [];
  }

  return {
    configuredStorageKey,
    authStorageKeys,
    hasConfiguredStorageKey: configuredStorageKey
      ? authStorageKeys.includes(configuredStorageKey)
      : false,
    storedAuthKeySummaries,
  };
}

function getAdminCheckSnapshot(email) {
  const adminEmails = getAdminEmails();
  const normalizedEmail = normalizeAdminEmail(email);

  return {
    normalizedEmail,
    adminEmailCount: adminEmails.length,
    isAdmin: adminEmails.includes(normalizedEmail),
  };
}

export async function verifyAdminSession(
  supabase,
  {
    source = "admin",
    timeoutMs = DEFAULT_ADMIN_AUTH_TIMEOUT_MS,
    maxAttempts = DEFAULT_ADMIN_AUTH_MAX_ATTEMPTS,
    retryDelayMs = DEFAULT_ADMIN_AUTH_RETRY_DELAY_MS,
    isCancelled = () => false,
  } = {}
) {
  let lastError = null;

  logAdminAuthDebug("supabase browser config", {
    source,
    ...getPublicSupabaseConfigSummary(),
    ...getBrowserAuthStorageSummary(supabase),
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (isCancelled()) {
      return {
        session: null,
        user: null,
        error: null,
        status: "cancelled",
      };
    }

    logAdminAuthDebug("checking session hint", { source, attempt });

    const { session, error: sessionError } = await getSessionSafely(supabase, {
      timeoutMs,
      timeoutMessage: "Admin session check timed out. Please retry.",
    });

    logAdminAuthDebug("getSession result", {
      source,
      attempt,
      hasSession: Boolean(session),
      sessionUserEmail: session?.user?.email || "",
      errorMessage: sessionError?.message || "",
    });

    if (isCancelled()) {
      return {
        session: null,
        user: null,
        error: null,
        status: "cancelled",
      };
    }

    if (sessionError) {
      lastError = sessionError;
      logAdminAuthDebug("getSession hint ignored", {
        source,
        attempt,
        reason: sessionError.message,
      });
    }

    logAdminAuthDebug("admin check started", {
      source,
      attempt,
      sessionUserEmail: session?.user?.email || "",
    });

    let user = null;
    let userError = null;

    logAdminAuthDebug("getUser started", {
      source,
      attempt,
    });

    try {
      const result = await withTimeout(
        supabase.auth.getUser(),
        timeoutMs,
        "Admin user verification timed out. Please retry."
      );

      user = result.data?.user || null;
      userError = result.error || null;
    } catch (error) {
      userError = error;
    }

    logAdminAuthDebug("getUser result", {
      source,
      attempt,
      userEmail: user?.email || "",
      errorMessage: userError?.message || "",
    });

    if (isCancelled()) {
      return {
        session: null,
        user: null,
        error: null,
        status: "cancelled",
      };
    }

    if (userError || !user) {
      lastError =
        userError || new Error("Admin session is invalid. Please log in again.");

      if (isRecoverableAdminAuthError(lastError) && attempt < maxAttempts) {
        await wait(retryDelayMs);
        continue;
      }

      logAdminAuthDebug("redirect reason", {
        source,
        reason: isRecoverableAdminAuthError(lastError)
          ? "verification_retryable_failure"
          : session?.user
          ? "verified_user_invalid"
          : "getUser_confirmed_no_user",
        errorMessage: lastError.message,
      });

      return {
        session: null,
        user: null,
        error: lastError,
        status: isRecoverableAdminAuthError(lastError)
          ? "retryable"
          : session?.user
          ? "invalid_session"
          : "no_session",
      };
    }

    const adminSnapshot = getAdminCheckSnapshot(user.email);

    logAdminAuthDebug("admin email check", {
      source,
      userEmail: user.email || "",
      normalizedEmail: adminSnapshot.normalizedEmail,
      adminEmailCount: adminSnapshot.adminEmailCount,
      isAdmin: adminSnapshot.isAdmin,
    });

    if (!isAdminEmail(user.email)) {
      logAdminAuthDebug("final admin check result", {
        source,
        result: "rejected",
        reason: "email_not_in_admin_list",
      });
      logAdminAuthDebug("redirect reason", {
        source,
        reason: "not_admin",
      });

      return {
        session,
        user,
        error: new Error("You are not authorized to access the admin portal."),
        status: "not_admin",
      };
    }

    logAdminAuthDebug("final admin check result", {
      source,
      result: "confirmed",
      userEmail: user.email || "",
      hadSessionHint: Boolean(session),
      sessionHintError: sessionError?.message || "",
    });

    return {
      session: session || null,
      user,
      error: null,
      status: "ok",
    };
  }

  return {
    session: null,
    user: null,
    error: lastError || new Error("Admin session check failed. Please retry."),
    status: "retryable",
  };
}
