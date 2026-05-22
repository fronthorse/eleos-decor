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
const ADMIN_STORAGE_KEYS = [
  "admin_access_token",
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
      try {
        const {
          user,
          error,
          status,
        } = await verifyAdminSession(supabase, {
          source: "admin-login-existing-session",
          isCancelled: () => cancelled,
        });

        if (cancelled) {
          return;
        }

        if (status === "ok" && user) {
          router.replace("/admin");
          return;
        }

        if (status === "no_session" || status === "retryable") {
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

      logAdminAuthDebug("login password accepted", {
        email: data.user?.email || "",
      });

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
