"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { isAdminEmail } from "../../../lib/adminAuth";
import {
  delay,
  getUserSafely,
  logAuthDebug,
  withTimeout,
} from "../../../lib/supabase/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Checking admin session...");
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        const { user, error } = await getUserSafely(supabase);

        if (cancelled) {
          return;
        }

        if (isAdminEmail(user?.email)) {
          router.replace("/admin");
          return;
        }

        setMessage(error ? "Please log in to continue." : "");
      } catch {
        if (!cancelled) {
          setMessage("Please log in to continue.");
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
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
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
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

      let verifiedUser = null;
      let verifyError = null;

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const result = await getUserSafely(supabase, {
          timeoutMs: 15000,
          timeoutMessage: "Unable to confirm your admin session after login.",
        });

        verifiedUser = result.user;
        verifyError = result.error;

        logAuthDebug("admin login getUser completed", {
          attempt,
          hasUser: Boolean(verifiedUser),
          userEmail: verifiedUser?.email || "",
          error: verifyError?.message || "",
        });

        if (verifiedUser) {
          break;
        }

        await delay(700);
      }

      if (verifyError && !verifiedUser) {
        throw verifyError;
      }

      if (!isAdminEmail(verifiedUser?.email || data.user?.email)) {
        await supabase.auth.signOut();
        setMessage("You are not authorized to access the admin portal.");
        setIsSubmitting(false);
        return;
      }

      setMessage("Login successful. Redirecting...");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      if (error.name === "TimeoutError") {
        for (let attempt = 1; attempt <= 2; attempt += 1) {
          await delay(1000);

          const { user } = await getUserSafely(supabase, {
            timeoutMs: 10000,
            timeoutMessage: "Unable to confirm your admin session after login.",
          });

          logAuthDebug("admin login timeout recovery getUser completed", {
            attempt,
            hasUser: Boolean(user),
            userEmail: user?.email || "",
          });

          if (isAdminEmail(user?.email)) {
            setMessage("Login successful. Redirecting...");
            router.replace("/admin");
            router.refresh();
            return;
          }
        }
      }

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
            disabled={checkingSession || isSubmitting}
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
            disabled={checkingSession || isSubmitting}
            required
          />
        </div>

        <button
          className="btn btn-dark w-100"
          disabled={checkingSession || isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Login"}
        </button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>
    </div>
  );
}
