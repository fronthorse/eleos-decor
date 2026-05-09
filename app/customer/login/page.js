"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function CustomerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 async function handleLogin() {
  if (!email || !password) {
    setMessage("Please enter your email and password.");
    return;
  }

  setMessage("Logging in...");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Login successful.");
  router.push("/customer/dashboard");
  router.refresh();
}
async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/customer/dashboard`,
    },
  });

  if (error) {
    setMessage(error.message);
  }
}

  async function handleSignup() {
    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created. You can now log in.");
  }

  return (
    <div className="container py-5" style={{ maxWidth: "520px", marginTop: "90px" }}>
      <h1 className="fw-bold mb-2">Customer Login</h1>

      <p className="text-muted mb-4">
        Sign in to save your cart and continue shopping later.
      </p>

      <div className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Password</label>

          <input
  type={showPassword ? "text" : "password"}
  className="form-control"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
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
  onClick={handleGoogleLogin}
  className="btn btn-outline-dark w-100 mb-3"
>
  Continue with Google
</button>
       <button
  type="button"
  onClick={handleLogin}
  className="btn btn-dark w-100 mb-3"
>
  Login
</button>

<p className="text-muted text-center mb-0">
  Don’t have an account?{" "}
  <a href="/customer/signup" className="text-decoration-none fw-bold">
    Create one
  </a>
</p>

        {message && <p className="text-muted mt-3">{message}</p>}
      </div>
    </div>
  );
}