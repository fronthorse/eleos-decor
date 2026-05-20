"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { isAdminEmail } from "../../../lib/adminAuth";
import { withTimeout } from "../../../lib/supabase/auth";

function clearAdminTransientState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem("adminUploadError");
    window.sessionStorage.removeItem("adminAuthError");
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

  useEffect(() => {
    let cancelled = false;
    clearAdminTransientState();

    async function checkExistingSession() {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "Unable to check your session."
        );

        if (cancelled) {
          return;
        }

        if (isAdminEmail(data.session?.user?.email)) {
          router.replace("/admin");
        }
      } catch {
        // Login remains available even if reading an existing session is slow.
      }
    }

    checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function handleLogin(e) {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    clearAdminTransientState();
    setMessage("Logging in...");

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        45000,
        "Login is taking too long. Please try again."
      );

      if (error) {
        throw error;
      }

      if (!isAdminEmail(data.user?.email)) {
        setMessage("You are not authorized to access the admin portal.");
        setIsSubmitting(false);
        return;
      }

      setMessage("Login successful. Redirecting...");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error.message || "Login failed. Please try again.");
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            required
          />
        </div>

        <button className="btn btn-dark w-100" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Login"}
        </button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>
    </div>
  );
}
