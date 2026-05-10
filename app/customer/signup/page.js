"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function CustomerSignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup() {
    if (!email || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created. Please check your email and confirm your account before logging in."
    );

    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }
  async function handleGoogleSignup() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/customer/dashboard`,
    },
  });

  if (error) {
    setMessage(error.message);
  }
}

  return (
    <div
      className="container py-5"
      style={{ maxWidth: "520px", marginTop: "90px" }}
    >
      <h1 className="fw-bold mb-2">Create Account</h1>

      <p className="text-muted mb-4">
        Create an account to save your cart and continue shopping later.
      </p>

      <div className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="form-check mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />

          <label className="form-check-label" htmlFor="showPassword">
            Show password
          </label>
        </div>
<button
  type="button"
  onClick={handleGoogleSignup}
  className="btn btn-outline-dark w-100 mb-3"
>
  Continue with Google
</button>
        <button
          type="button"
          onClick={handleSignup}
          className="btn btn-dark w-100 mb-3"
        >
          Create Account
        </button>

        <p className="text-muted text-center mb-0">
          Already have an account?{" "}
          <a href="/customer/login" className="text-decoration-none fw-bold">
            Login
          </a>
        </p>

        {message && <p className="text-muted mt-3">{message}</p>}

        {message.includes("Account created") && (
          <a href="/customer/login" className="btn btn-outline-dark w-100 mt-2">
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
}