import { isAdminEmail } from "./adminAuth";

const DEFAULT_ADMIN_AUTH_MAX_ATTEMPTS = 3;
const DEFAULT_ADMIN_AUTH_RETRY_DELAY_MS = 800;

function wait(ms) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export function isRecoverableAdminAuthError(error) {
  if (!error) return false;

  const message = String(error.message || "").toLowerCase();

  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

async function getSessionHint(supabase) {
  try {
    const result = await supabase.auth.getSession();

    return {
      session: result.data?.session || null,
      error: result.error || null,
    };
  } catch (error) {
    return {
      session: null,
      error,
    };
  }
}

async function getAuthenticatedUser(supabase) {
  try {
    const result = await supabase.auth.getUser();

    return {
      user: result.data?.user || null,
      error: result.error || null,
    };
  } catch (error) {
    return {
      user: null,
      error,
    };
  }
}

export async function verifyAdminSession(
  supabase,
  {
    maxAttempts = DEFAULT_ADMIN_AUTH_MAX_ATTEMPTS,
    retryDelayMs = DEFAULT_ADMIN_AUTH_RETRY_DELAY_MS,
    isCancelled = () => false,
  } = {}
) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (isCancelled()) {
      return {
        session: null,
        user: null,
        error: null,
        status: "cancelled",
      };
    }

    const { session, error: sessionError } = await getSessionHint(supabase);

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
    }

    let user = null;
    let userError = null;

    const userResult = await getAuthenticatedUser(supabase);
    user = userResult.user;
    userError = userResult.error;

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
        userError ||
        new Error("Admin session is invalid. Please log in again.");

      if (isRecoverableAdminAuthError(lastError) && attempt < maxAttempts) {
        await wait(retryDelayMs);
        continue;
      }

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

    if (!isAdminEmail(user.email)) {
      return {
        session,
        user,
        error: new Error("You are not authorized to access the admin portal."),
        status: "not_admin",
      };
    }

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
