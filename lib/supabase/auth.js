function isInvalidRefreshTokenError(error) {
  return String(error?.message || "")
    .toLowerCase()
    .includes("refresh token");
}

export function createTimeoutError(message) {
  const error = new Error(message);
  error.name = "TimeoutError";
  return error;
}

export function withTimeout(promise, timeoutMs, message) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      reject(createTimeoutError(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    globalThis.clearTimeout(timeoutId);
  });
}

export function delay(ms) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export async function getSessionSafely(
  supabase,
  {
    timeoutMs = 12000,
    timeoutMessage = "Unable to check your session. Please log in again.",
  } = {}
) {
  let session = null;
  let error = null;

  try {
    const result = await withTimeout(
      supabase.auth.getSession(),
      timeoutMs,
      timeoutMessage
    );

    session = result.data?.session || null;
    error = result.error || null;
  } catch (sessionError) {
    error = sessionError;
  }

  if (!error) {
    return { session, error: null };
  }

  if (isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }

  return { session: null, error };
}

export async function getUserSafely(
  supabase,
  {
    timeoutMs = 12000,
    timeoutMessage = "Unable to verify your user session.",
  } = {}
) {
  let user = null;
  let error = null;

  try {
    const result = await withTimeout(
      supabase.auth.getUser(),
      timeoutMs,
      timeoutMessage
    );

    user = result.data?.user || null;
    error = result.error || null;
  } catch (userError) {
    error = userError;
  }

  if (!error) {
    return { user, error: null };
  }

  if (isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }

  return { user: null, error };
}
