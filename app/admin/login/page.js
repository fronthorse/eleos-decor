"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { isAdminEmail } from "../../../lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Logging in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      setMessage("You are not authorized to access the admin portal.");
      return;
    }

    setMessage("Login successful. Redirecting...");
    router.push("/admin");
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
            required
          />
        </div>

        <button className="btn btn-dark w-100">Login</button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>
    </div>
  );
}
