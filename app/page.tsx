"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <main style={{ background: "#F7F6F2", color: "#1A1A1A", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.5px", color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>Valt</span>
        <button
          onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
          style={{ fontSize: 13, background: "#2D4878", color: "#fff", padding: "10px 22px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
        >
          Join waitlist
        </button>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 11, fontWeight: 500, background: "#EBF0F8", color: "#2D4878", padding: "4px 14px", borderRadius: 999, marginBottom: 24, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
          Now in development
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-1.5px", marginBottom: 20, color: "#1A1A1A" }}>
          Your job search,<br />finally out of the void.
        </h1>
        <p style={{ fontSize: 18, color: "#4A4A4A", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>
          Valt organizes every application you send, tracks where things stand, and helps you prepare — so nothing gets lost and nothing gets forgotten.
        </p>
        <div id="waitlist" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "12px 20px", borderRadius: 999, border: "1px solid #E5E3DD", fontSize: 14, width: 280, outline: "none", background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A1A1A" }}
            />
            <button
              onClick={handleSubmit}
              style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
            >
              {submitted ? "You're on the list!" : "Join the waitlist"}
            </button>
          </div>
          {submitted && (
            <p style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>We'll be in touch soon.</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px", borderTop: "1px solid #E5E3DD" }}>
        <h2 style={{ fontSize: 32, fontWeight: 600, textAlign: "center", marginBottom: 10, letterSpacing: "-0.5px" }}>
          Everything your job search needs
        </h2>
        <p style={{ textAlign: "center", color: "#4A4A4A", marginBottom: 40, fontSize: 16, fontFamily: "system-ui, sans-serif" }}>
          One place for the whole process — from the first application to the final offer.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { title: "Application tracker", desc: "Save jobs in one click, track every status, and never wonder where you applied again." },
            { title: "Resume tailoring", desc: "Paste a job description and get your resume rewritten to match — keywords, tone, and all." },
            { title: "Cover letter generator", desc: "Generate a tailored cover letter for any job in seconds. Edit it, save it, use it." },
            { title: "Interview prep", desc: "Get likely interview questions based on the job description. Practice and save your answers." },
            { title: "Document vault", desc: "Every version of your resume and cover letter, linked to the job it was made for." },
            { title: "Smart nudges", desc: "Get reminders to follow up or mark applications as ghosted — so your tracker stays alive." },
          ].map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "22px 22px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "#1A1A1A" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#4A4A4A", lineHeight: 1.65, fontFamily: "system-ui, sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", borderTop: "1px solid #E5E3DD" }}>
        <h2 style={{ fontSize: 32, fontWeight: 600, textAlign: "center", marginBottom: 10, letterSpacing: "-0.5px" }}>
          How it works
        </h2>
        <p style={{ textAlign: "center", color: "#4A4A4A", marginBottom: 40, fontSize: 16, fontFamily: "system-ui, sans-serif" }}>
          Simple by design. Powerful where it counts.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            { step: "01", title: "Save a job", desc: "Use the Valt Chrome extension to save any job posting in one click — from Handshake, Indeed, LinkedIn, or anywhere else." },
            { step: "02", title: "Prepare and apply", desc: "Tailor your resume, generate a cover letter, and prep for the interview — all tied to that specific job." },
            { step: "03", title: "Track what happens next", desc: "Update your status as things move. Get nudges when it's time to follow up. Never lose track of where you stand." },
          ].map((s) => (
            <div key={s.step} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#2D4878", width: 40, flexShrink: 0, fontFamily: "system-ui, sans-serif" }}>{s.step}</span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#1A1A1A" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#4A4A4A", lineHeight: 1.65, fontFamily: "system-ui, sans-serif" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", borderTop: "1px solid #E5E3DD", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 600, marginBottom: 10, letterSpacing: "-0.5px" }}>
          Stop losing track.<br />Start making progress.
        </h2>
        <p style={{ color: "#4A4A4A", marginBottom: 28, fontSize: 16, fontFamily: "system-ui, sans-serif" }}>
          Join the waitlist and be first to know when Valt launches.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "12px 20px", borderRadius: 999, border: "1px solid #E5E3DD", fontSize: 14, width: 280, outline: "none", background: "#fff", fontFamily: "system-ui, sans-serif", color: "#1A1A1A" }}
          />
          <button
            onClick={handleSubmit}
            style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
          >
            {submitted ? "You're on the list!" : "Join the waitlist"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #E5E3DD", padding: "24px", textAlign: "center", fontSize: 12, color: "#AAAAAA", fontFamily: "system-ui, sans-serif" }}>
        © 2026 Valt. All rights reserved.
      </footer>

    </main>
  );
}