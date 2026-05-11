"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
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

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully.");
    router.push("/customer/login");
  }

  return (
    <div className="container py-5" style={{ maxWidth: "520px", marginTop: "90px" }}>
      <h1 className="fw-bold mb-2">Create New Password</h1>

      <p className="text-muted mb-4">
        Enter and confirm your new password.
      </p>

      <div className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">New Password</label>

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
            id="showResetPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />

          <label className="form-check-label" htmlFor="showResetPassword">
            Show password
          </label>
        </div>

        <button
          type="button"
          onClick={handleUpdatePassword}
          className="btn btn-dark w-100"
        >
          Update Password
        </button>

        {message && <p className="text-muted mt-3 mb-0">{message}</p>}
      </div>
    </div>
  );
}