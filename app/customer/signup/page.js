"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

export default function CustomerSignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  }

  async function handleSignup() {
    if (isSubmitting) return;

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

    setIsSubmitting(true);
    setMessage("Creating account...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setIsSubmitting(false);

      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("already registered") ||
        errorMessage.includes("already exists") ||
        errorMessage.includes("user already")
      ) {
        setMessage(
          "An account already exists with this email. Please login instead."
        );
        return;
      }

      if (errorMessage.includes("rate limit")) {
        setMessage(
          "Too many signup emails have been requested. Please wait a few minutes before trying again."
        );
        return;
      }

      setMessage(error.message);
      return;
    }

    if (data?.user && data.user.identities?.length === 0) {
      setIsSubmitting(false);
      setMessage(
        "An account already exists with this email. Please login instead."
      );
      return;
    }

    setIsSubmitting(false);

    setMessage(
      "Account created. Please check your email and confirm your account before logging in."
    );

    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div
      className="container py-5"
      style={{ maxWidth: "520px", marginTop: "90px" }}
    >
      <Link href="/" className="auth-back-link">
        Back to Home
      </Link>

      <h1 className="fw-bold mb-2">Create Account</h1>

      <p className="text-muted mb-4">
        Create an account to save your cart and continue shopping later.
      </p>

      <div className="bg-white p-4 rounded shadow-sm">
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn btn-outline-dark w-100 mb-3"
        >
          Continue with Google
        </button>

        <div className="mb-3">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-check mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
          />

          <label className="form-check-label" htmlFor="showPassword">
            Show password
          </label>
        </div>

        <button
          type="button"
          onClick={handleSignup}
          className="btn btn-dark w-100 mb-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-muted text-center mb-0">
          Already have an account?{" "}
          <a href="/customer/login" className="text-decoration-none fw-bold">
            Login
          </a>
        </p>

        {message && <p className="text-muted mt-3">{message}</p>}

        {message.includes("already exists") && (
          <a href="/customer/login" className="btn btn-outline-dark w-100 mt-2">
            Go to Login
          </a>
        )}

        {message.includes("Account created") && (
          <a href="/customer/login" className="btn btn-outline-dark w-100 mt-2">
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
}
