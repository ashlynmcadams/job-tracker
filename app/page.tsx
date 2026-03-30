"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.from("waitlist").insert([{ email }]);
    if (error) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  return (
    <main style={{ background: "#F7F6F2", color: "#1A1A1A", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #E5E3DD",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>Valt</span>
          <button
            onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
            style={{ fontSize: 14, background: "#2D4878", color: "#fff", padding: "11px 26px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
          >
            Join waitlist
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 80px" }}>
        <div style={{ maxWidth: 780 }}>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, background: "#EBF0F8", color: "#2D4878", padding: "5px 14px", borderRadius: 999, marginBottom: 32, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
            Now in development
          </div>
          <h1 style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-2.5px", marginBottom: 24, color: "#1A1A1A" }}>
            Your job search,<br />finally out of<br />the void.
          </h1>
          <p style={{ fontSize: 20, color: "#4A4A4A", maxWidth: 540, marginBottom: 48, lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>
            Valt organizes every application you send, tracks where things stand, and helps you prepare — so nothing gets lost and nothing gets forgotten.
          </p>
          <div id="waitlist" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "14px 22px", borderRadius: 999, border: "2px solid #E5E3DD", fontSize: 15, width: 300, outline: "none", background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A1A1A" }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: "14px 28px", background: "#2D4878", color: "#fff", fontSize: 15, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
            >
              {loading ? "Saving..." : submitted ? "You're on the list!" : "Join the waitlist"}
            </button>
          </div>
          {submitted && <p style={{ marginTop: 14, fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>We'll be in touch soon.</p>}
          {error && <p style={{ marginTop: 14, fontSize: 14, color: "red", fontFamily: "system-ui, sans-serif" }}>{error}</p>}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px", borderTop: "1px solid #E5E3DD" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>Features</p>
        <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", marginBottom: 12 }}>
          Everything your job search needs
        </h2>
        <p style={{ color: "#4A4A4A", marginBottom: 56, fontSize: 17, fontFamily: "system-ui, sans-serif", maxWidth: 480 }}>
          One place for the whole process — from the first application to the final offer.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {[
            { title: "Application tracker", desc: "Save jobs in one click, track every status, and never wonder where you applied again.", icon: "📋" },
            { title: "Resume tailoring", desc: "Paste a job description and get your resume rewritten to match — keywords, tone, and all.", icon: "✏️" },
            { title: "Cover letter generator", desc: "Generate a tailored cover letter for any job in seconds. Edit it, save it, use it.", icon: "📝" },
            { title: "Interview prep", desc: "Get likely interview questions based on the job description. Practice and save your answers.", icon: "🎯" },
            { title: "Document vault", desc: "Every version of your resume and cover letter, linked to the job it was made for.", icon: "🗂️" },
            { title: "Smart nudges", desc: "Get reminders to follow up or mark applications as ghosted — so your tracker stays alive.", icon: "🔔" },
          ].map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px 28px" }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#1A1A1A" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#fff", borderTop: "1px solid #E5E3DD", borderBottom: "1px solid #E5E3DD", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", marginBottom: 12 }}>
            Simple by design.
          </h2>
          <p style={{ color: "#4A4A4A", marginBottom: 72, fontSize: 17, fontFamily: "system-ui, sans-serif" }}>
            Powerful where it counts.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
            {[
              { step: "01", title: "Save a job", desc: "Use the Valt Chrome extension to save any job posting in one click — from Handshake, Indeed, LinkedIn, or anywhere else." },
              { step: "02", title: "Prepare and apply", desc: "Tailor your resume, generate a cover letter, and prep for the interview — all tied to that specific job." },
              { step: "03", title: "Track what happens next", desc: "Update your status as things move. Get nudges when it's time to follow up. Never lose track of where you stand." },
            ].map((s) => (
              <div key={s.step}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2D4878", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em" }}>{s.step}</span>
                <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", margin: "12px 0 14px" }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: "#4A4A4A", lineHeight: 1.75, fontFamily: "system-ui, sans-serif" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 52, fontWeight: 700, marginBottom: 16, letterSpacing: "-1.5px" }}>
          Stop losing track.<br />Start making progress.
        </h2>
        <p style={{ color: "#4A4A4A", marginBottom: 40, fontSize: 18, fontFamily: "system-ui, sans-serif" }}>
          Join the waitlist and be first to know when Valt launches.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "14px 22px", borderRadius: 999, border: "2px solid #E5E3DD", fontSize: 15, width: 300, outline: "none", background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A1A1A" }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: "14px 28px", background: "#2D4878", color: "#fff", fontSize: 15, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
          >
            {loading ? "Saving..." : submitted ? "You're on the list!" : "Join the waitlist"}
          </button>
        </div>
        {submitted && <p style={{ marginTop: 14, fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>We'll be in touch soon.</p>}
        {error && <p style={{ marginTop: 14, fontSize: 14, color: "red", fontFamily: "system-ui, sans-serif" }}>{error}</p>}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #E5E3DD", padding: "32px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Georgia', serif" }}>Valt</span>
          <span style={{ fontSize: 12, color: "#AAAAAA", fontFamily: "system-ui, sans-serif" }}>© 2026 Valt. All rights reserved.</span>
        </div>
      </footer>

    </main>
  );
}
