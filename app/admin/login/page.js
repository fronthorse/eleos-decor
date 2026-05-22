"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { isAdminEmail } from "../../../lib/adminAuth";
import { getSessionSafely, withTimeout } from "../../../lib/supabase/auth";

const ADMIN_LOGIN_SESSION_TIMEOUT_MS = 10000;
const ADMIN_LOGIN_TIMEOUT_MS = 20000;
const ADMIN_STORAGE_KEYS = [
  "admin_access_token",
  "adminAuthError",
  "adminUploadError",
];

function logAdminAuthDebug(stage, details = {}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[admin auth]", stage, details);
}

function clearAdminTransientState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    ADMIN_STORAGE_KEYS.forEach((key) => {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    });
  } catch {
    // Storage access can be restricted on some mobile browsers.
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    clearAdminTransientState();

    async function checkExistingSession() {
      logAdminAuthDebug("checking session", { route: "/admin/login" });

      try {
        const { session, error } = await getSessionSafely(supabase, {
          timeoutMs: ADMIN_LOGIN_SESSION_TIMEOUT_MS,
          timeoutMessage: "Unable to check your current session.",
        });

        if (cancelled) {
          return;
        }

        if (error || !session?.user || !session?.access_token) {
          if (error) {
            logAdminAuthDebug("session check failed", {
              message: error.message,
            });
          } else {
            logAdminAuthDebug("no session found", { route: "/admin/login" });
          }
          return;
        }

        logAdminAuthDebug("session found", { email: session.user.email });
        logAdminAuthDebug("admin check started", { email: session.user.email });

        let verifiedUser = null;
        let verifyError = null;

        try {
          const result = await withTimeout(
            supabase.auth.getUser(session.access_token),
            ADMIN_LOGIN_SESSION_TIMEOUT_MS,
            "Existing session verification timed out."
          );

          verifiedUser = result.data?.user || null;
          verifyError = result.error || null;
        } catch (error) {
          verifyError = error;
        }

        if (cancelled) {
          return;
        }

        if (verifyError || !verifiedUser) {
          logAdminAuthDebug("admin rejected", {
            reason: verifyError?.message || "No verified user",
          });
          await supabase.auth.signOut();
          clearAdminTransientState();
          return;
        }

        if (isAdminEmail(verifiedUser.email)) {
          logAdminAuthDebug("admin confirmed", { email: verifiedUser.email });
          router.replace("/admin");
          return;
        }

        logAdminAuthDebug("admin rejected", { email: verifiedUser.email });
        await supabase.auth.signOut();
        clearAdminTransientState();
        setMessage("Admin login required. Please sign in with an admin account.");
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function handleLogin(e) {
    e.preventDefault();
    if (isSubmitting || isCheckingSession) {
      return;
    }

    let shouldResetSubmitting = true;

    setIsSubmitting(true);
    clearAdminTransientState();
    setMessage("Logging in...");
    logAdminAuthDebug("login started", { email });

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        ADMIN_LOGIN_TIMEOUT_MS,
        "Login is taking too long. Please try again."
      );

      if (error) {
        throw error;
      }

      if (!isAdminEmail(data.user?.email)) {
        logAdminAuthDebug("admin rejected", { email: data.user?.email });
        await supabase.auth.signOut();
        clearAdminTransientState();
        setMessage("You are not authorized to access the admin portal.");
        return;
      }

      const { session, error: sessionError } = await getSessionSafely(
        supabase,
        {
          timeoutMs: ADMIN_LOGIN_SESSION_TIMEOUT_MS,
          timeoutMessage:
            "Login succeeded, but session verification timed out. Please retry.",
        }
      );

      if (sessionError || !session?.user) {
        logAdminAuthDebug("login failure", {
          reason: sessionError?.message || "No session after login",
        });
        setMessage(
          sessionError?.message ||
            "Login succeeded, but the admin session was not available. Please retry."
        );
        return;
      }

      logAdminAuthDebug("admin check started", { email: session.user.email });

      const { data: verifiedData, error: verifyError } = await withTimeout(
        supabase.auth.getUser(session.access_token),
        ADMIN_LOGIN_SESSION_TIMEOUT_MS,
        "Admin user verification timed out. Please retry."
      );

      if (verifyError || !isAdminEmail(verifiedData.user?.email)) {
        logAdminAuthDebug("admin rejected", {
          email: verifiedData.user?.email,
          reason: verifyError?.message,
        });
        await supabase.auth.signOut();
        clearAdminTransientState();
        setMessage("You are not authorized to access the admin portal.");
        return;
      }

      logAdminAuthDebug("admin confirmed", { email: verifiedData.user.email });
      logAdminAuthDebug("login success", { email: verifiedData.user.email });
      setMessage("Login successful. Redirecting...");
      shouldResetSubmitting = false;
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      logAdminAuthDebug("login failure", { reason: error.message });
      setMessage(error.message || "Login failed. Please try again.");
    } finally {
      if (shouldResetSubmitting) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: "500px" }}>
      <h1 className="fw-bold mb-4">Eleos Decor Admin</h1>

      <form onSubmit={handleLogin} className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || isCheckingSession}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>

          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting || isCheckingSession}
            required
          />
        </div>

        <button
          className="btn btn-dark w-100"
          disabled={isSubmitting || isCheckingSession}
        >
          {isCheckingSession
            ? "Checking session..."
            : isSubmitting
            ? "Verifying..."
            : "Login"}
        </button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>
    </div>
  );
}
