"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cleanupStaleSupabaseAuthStorage,
  createClient,
} from "../../../lib/supabase/client";
import { verifyAdminSession } from "../../../lib/adminSession";

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
    cleanupStaleSupabaseAuthStorage(supabase.auth.storageKey);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

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

      setMessage("Login successful. Redirecting...");
      shouldResetSubmitting = false;
      router.replace("/admin");
      router.refresh();
    } catch (error) {
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
