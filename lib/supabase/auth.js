function isInvalidRefreshTokenError(error) {
  return String(error?.message || "")
    .toLowerCase()
    .includes("refresh token");
}

export async function getSessionSafely(supabase) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!error) {
    return { session, error: null };
  }

  if (isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }

  return { session: null, error };
}
