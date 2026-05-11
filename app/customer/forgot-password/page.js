"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleResetRequest() {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/customer/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset link sent. Please check your email.");
  }

  return (
    <div className="container py-5" style={{ maxWidth: "520px", marginTop: "90px" }}>
      <h1 className="fw-bold mb-2">Reset Password</h1>

      <p className="text-muted mb-4">
        Enter your email address and we’ll send you a password reset link.
      </p>

      <div className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Email Address</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <button
          type="button"
          onClick={handleResetRequest}
          className="btn btn-dark w-100"
        >
          Send Reset Link
        </button>

        {message && <p className="text-muted mt-3 mb-0">{message}</p>}
      </div>
    </div>
  );
}