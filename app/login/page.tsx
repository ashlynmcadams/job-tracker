"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.MouseEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E5E3DD", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#1A1A1A", fontFamily: "'Georgia', serif", textDecoration: "none" }}>Valt</a>
          <a href="/signup" style={{ fontSize: 14, color: "#2D4878", fontFamily: "system-ui, sans-serif", textDecoration: "none", fontWeight: 500 }}>Sign up</a>
        </div>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 24, padding: "48px 40px", width: "100%", maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8, color: "#1A1A1A" }}>Welcome back</h1>
          <p style={{ fontSize: 15, color: "#4A4A4A", marginBottom: 32, fontFamily: "system-ui, sans-serif" }}>Log in to your Valt account.</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 8 }}>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #E5E3DD", fontSize: 15, outline: "none", background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 8 }}>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #E5E3DD", fontSize: 15, outline: "none", background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box" }}
            />
          </div>
          {error && <p style={{ fontSize: 13, color: "red", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#2D4878", color: "#fff", fontSize: 15, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color: "#2D4878", fontWeight: 500, textDecoration: "none" }}>Sign up</a>
          </p>
        </div>
      </div>

    </main>
  );
}
