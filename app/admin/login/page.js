"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cleanupStaleSupabaseAuthStorage,
  createClient,
  getSupabaseAuthStorageSummary,
} from "../../../lib/supabase/client";
import {
  logAdminAuthDebug,
  verifyAdminSession,
} from "../../../lib/adminSession";

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

  const summary = getSupabaseAuthStorageSummary();

  logAdminAuthDebug(stage, {
    activeStorageKey: summary.activeStorageKey,
    authStorageKeys: summary.authStorageKeys,
    staleAuthStorageKeys: summary.staleAuthStorageKeys,
    hasActiveStorageKey: summary.hasActiveStorageKey,
    storedAuthKeySummaries: summary.storedAuthKeySummaries,
  });
}

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    clearAdminTransientState();
    cleanupStaleSupabaseAuthStorage(supabase.auth.storageKey);
    logLoginAuthStorage("login auth storage after init cleanup");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logAdminAuthDebug("login auth event received", {
        event,
        hasSession: Boolean(session),
        email: session?.user?.email || "",
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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
    cleanupStaleSupabaseAuthStorage(supabase.auth.storageKey);
    logLoginAuthStorage("login auth storage before signInWithPassword");

    try {
      logAdminAuthDebug("before signInWithPassword", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      logAdminAuthDebug("after signInWithPassword resolves", {
        hasUser: Boolean(data?.user),
        email: data?.user?.email || "",
        hasSession: Boolean(data?.session),
        errorMessage: error?.message || "",
      });

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
      logAdminAuthDebug("signInWithPassword catch block", {
        reason: error.message,
      });
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
