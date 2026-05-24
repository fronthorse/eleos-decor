"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { withTimeout } from "../../../lib/supabase/auth";
import {
  logAdminAuthDebug,
  verifyAdminSession,
} from "../../../lib/adminSession";

const ADMIN_LOGIN_TIMEOUT_MS = 20000;
const ADMIN_LOGIN_INITIAL_CHECK_MAX_MS = 6000;
const ADMIN_STORAGE_KEYS = [
  "adminAuthError",
  "adminUploadError",
];

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

function logLoginAuthStorage(stage) {
  if (typeof window === "undefined") {
    return;
  }

  const supabase = createClient();
  const configuredStorageKey = supabase?.auth?.storageKey || "";
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
    storedAuthKeySummaries = authStorageKeys.map((key) => {
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
    });
  } catch {
    authStorageKeys = ["localStorage-unavailable"];
    storedAuthKeySummaries = [];
  }

  logAdminAuthDebug(stage, {
    configuredStorageKey,
    authStorageKeys,
    hasConfiguredStorageKey: configuredStorageKey
      ? authStorageKeys.includes(configuredStorageKey)
      : false,
    storedAuthKeySummaries,
  });
}

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timedOut = false;
    clearAdminTransientState();

    const checkTimeoutId = window.setTimeout(() => {
      timedOut = true;
      setIsCheckingSession(false);
    }, ADMIN_LOGIN_INITIAL_CHECK_MAX_MS);

    async function checkExistingSession() {
      try {
        const {
          user,
          error,
          status,
        } = await verifyAdminSession(supabase, {
          source: "admin-login-existing-session",
          isCancelled: () => cancelled || timedOut,
        });

        if (cancelled || timedOut) {
          return;
        }

        if (status === "ok" && user) {
          setIsRedirecting(true);
          router.replace("/admin");
          return;
        }

        if (
          status === "no_session" ||
          status === "retryable" ||
          status === "cancelled"
        ) {
          return;
        }

        if (status === "invalid_session" || status === "not_admin") {
          await supabase.auth.signOut();
          clearAdminTransientState();
          setMessage(
            error?.message ||
              "Admin login required. Please sign in with an admin account."
          );
        }
      } finally {
        if (!cancelled && !timedOut) {
          setIsCheckingSession(false);
        }
      }
    }

    checkExistingSession();

    return () => {
      cancelled = true;
      window.clearTimeout(checkTimeoutId);
    };
  }, [router, supabase]);

  async function handleLogin(e) {
    e.preventDefault();
    if (isSubmitting || isRedirecting) {
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

      logAdminAuthDebug("login password accepted", {
        email: data.user?.email || "",
      });
      logLoginAuthStorage("login auth storage after password accepted");

      const {
        user,
        error: adminError,
        status,
      } = await verifyAdminSession(supabase, {
        source: "admin-login-after-password",
      });

      if (status !== "ok" || !user) {
        if (status === "invalid_session" || status === "not_admin") {
          await supabase.auth.signOut();
          clearAdminTransientState();
        }

        setMessage(
          adminError?.message ||
            "Admin verification failed. Please retry or use an admin account."
        );
        return;
      }

      logAdminAuthDebug("login success", { email: user.email });
      logLoginAuthStorage("login auth storage after admin verification");
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
            disabled={isSubmitting || isRedirecting}
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
            disabled={isSubmitting || isRedirecting}
            required
          />
        </div>

        <button
          className="btn btn-dark w-100"
          disabled={isSubmitting || isRedirecting}
        >
          {isRedirecting
            ? "Checking session..."
            : isSubmitting
            ? "Signing in..."
            : "Login"}
        </button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>
    </div>
  );
}
