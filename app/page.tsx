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
            You hit apply.<br />Now what?
          </h1>
          <p style={{ fontSize: 20, color: "#4A4A4A", maxWidth: 560, marginBottom: 48, lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>
            Most job trackers help you log what happened. Valt helps you decide what to do next.
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

      {/* The problem */}
      <section style={{ borderTop: "1px solid #E5E3DD", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>The problem</p>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 48, maxWidth: 640, lineHeight: 1.15 }}>
            Applying is the easy part. Everything after is chaos.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { q: "Which resume did I send them?", desc: "You've tailored it three times. You have no idea which version they have." },
              { q: "Should I follow up?", desc: "It's been 8 days. Or was it 12? You're not sure. You do nothing." },
              { q: "What even is the status?", desc: "Applied. Waiting. Still waiting. You refresh your inbox and hope." },
            ].map((item) => (
              <div key={item.q} style={{ background: "#F7F6F2", borderRadius: 16, padding: "32px 28px" }}>
                <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>"{item.q}"</p>
                <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Valt works */}
      <section style={{ borderTop: "1px solid #E5E3DD" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.15 }}>
            Always know your next move.
          </h2>
          <p style={{ fontSize: 18, color: "#4A4A4A", marginBottom: 72, fontFamily: "system-ui, sans-serif", maxWidth: 500, lineHeight: 1.6 }}>
            Valt turns your applications from a static list into a living process.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {[
              { step: "01", title: "Log it in seconds", desc: "Add a job — company, role, date, link. That's it. Valt handles the rest." },
              { step: "02", title: "Your dashboard shows what needs attention", desc: "Applications are sorted by urgency, not date. Anything going cold rises to the top automatically." },
              { step: "03", title: "Get nudged before it's too late", desc: "Valt tells you when to follow up, when something has gone quiet, and when it's time to move on." },
              { step: "04", title: "Every application has its full context", desc: "The resume you sent, the cover letter, the job description — all attached, so you're never scrambling before a call." },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 40, alignItems: "flex-start", maxWidth: 720 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2D4878", fontFamily: "system-ui, sans-serif", minWidth: 28, paddingTop: 4 }}>{item.step}</span>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: 16, color: "#5A5A5A", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid #E5E3DD", background: "#2D4878" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-1.5px", color: "#fff", marginBottom: 20, lineHeight: 1.1 }}>
            Stop waiting.<br />Start knowing.
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 48, fontFamily: "system-ui, sans-serif", maxWidth: 420, margin: "0 auto 48px" }}>
            Valt is coming soon. Join the waitlist and be first to know.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "14px 22px", borderRadius: 999, border: "none", fontSize: 15, width: 300, outline: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: "system-ui, sans-serif" }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: "14px 28px", background: "#fff", color: "#2D4878", fontSize: 15, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}
            >
              {loading ? "Saving..." : submitted ? "You're on the list!" : "Join the waitlist"}
            </button>
          </div>
          {submitted && <p style={{ marginTop: 14, fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "system-ui, sans-serif" }}>We'll be in touch soon.</p>}
          {error && <p style={{ marginTop: 14, fontSize: 14, color: "#ffaaaa", fontFamily: "system-ui, sans-serif" }}>{error}</p>}
        </div>
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
}"use client";
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
            You hit apply.<br />Now what?
          </h1>
          <p style={{ fontSize: 20, color: "#4A4A4A", maxWidth: 560, marginBottom: 48, lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>
            Most job trackers help you log what happened. Valt helps you decide what to do next.
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

      {/* The problem */}
      <section style={{ borderTop: "1px solid #E5E3DD", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>The problem</p>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 48, maxWidth: 640, lineHeight: 1.15 }}>
            Applying is the easy part. Everything after is chaos.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { q: "Which resume did I send them?", desc: "You've tailored it three times. You have no idea which version they have." },
              { q: "Should I follow up?", desc: "It's been 8 days. Or was it 12? You're not sure. You do nothing." },
              { q: "What even is the status?", desc: "Applied. Waiting. Still waiting. You refresh your inbox and hope." },
            ].map((item) => (
              <div key={item.q} style={{ background: "#F7F6F2", borderRadius: 16, padding: "32px 28px" }}>
                <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>"{item.q}"</p>
                <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Valt works */}
      <section style={{ borderTop: "1px solid #E5E3DD" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.15 }}>
            Always know your next move.
          </h2>
          <p style={{ fontSize: 18, color: "#4A4A4A", marginBottom: 72, fontFamily: "system-ui, sans-serif", maxWidth: 500, lineHeight: 1.6 }}>
            Valt turns your applications from a static list into a living process.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {[
              { step: "01", title: "Log it in seconds", desc: "Add a job — company, role, date, link. That's it. Valt handles the rest." },
              { step: "02", title: "Your dashboard shows what needs attention", desc: "Applications are sorted by urgency, not date. Anything going cold rises to the top automatically." },
              { step: "03", title: "Get nudged before it's too late", desc: "Valt tells you when to follow up, when something has gone quiet, and when it's time to move on." },
              { step: "04", title: "Every application has its full context", desc: "The resume you sent, the cover letter, the job description — all attached, so you're never scrambling before a call." },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 40, alignItems: "flex-start", maxWidth: 720 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2D4878", fontFamily: "system-ui, sans-serif", minWidth: 28, paddingTop: 4 }}>{item.step}</span>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: 16, color: "#5A5A5A", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid #E5E3DD", background: "#2D4878" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-1.5px", color: "#fff", marginBottom: 20, lineHeight: 1.1 }}>
            Stop waiting.<br />Start knowing.
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 48, fontFamily: "system-ui, sans-serif", maxWidth: 420, margin: "0 auto 48px" }}>
            Valt is coming soon. Join the waitlist and be first to know.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "14px 22px", borderRadius: 999, border: "none", fontSize: 15, width: 300, outline: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: "system-ui, sans-serif" }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: "14px 28px", background: "#fff", color: "#2D4878", fontSize: 15, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}
            >
              {loading ? "Saving..." : submitted ? "You're on the list!" : "Join the waitlist"}
            </button>
          </div>
          {submitted && <p style={{ marginTop: 14, fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "system-ui, sans-serif" }}>We'll be in touch soon.</p>}
          {error && <p style={{ marginTop: 14, fontSize: 14, color: "#ffaaaa", fontFamily: "system-ui, sans-serif" }}>{error}</p>}
        </div>
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
