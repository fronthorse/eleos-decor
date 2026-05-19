"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { isAdminEmail } from "../../../lib/adminAuth";
import { getSessionSafely } from "../../../lib/supabase/auth";

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
      const { session } = await getSessionSafely(supabase);

      if (cancelled) {
        return;
      }

      if (isAdminEmail(session?.user?.email)) {
        router.replace("/admin");
        return;
      }

      setCheckingSession(false);
      setMessage("");
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      setMessage("You are not authorized to access the admin portal.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Login successful. Redirecting...");
    router.replace("/admin");
    router.refresh();
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
