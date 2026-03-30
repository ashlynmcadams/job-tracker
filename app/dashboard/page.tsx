"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // When the page loads, check if the user is logged in.
  // If they're not, send them to the login page.
  // If they are, grab their email to display.
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setEmail(user.email ?? "");
        setLoading(false);
      }
    }
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main style={{ background: "#F7F6F2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "system-ui, sans-serif", color: "#4A4A4A" }}>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E5E3DD", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>Valt</span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{email}</span>
            <button
              onClick={handleLogout}
              style={{ fontSize: 14, background: "transparent", color: "#2D4878", padding: "10px 20px", borderRadius: 999, border: "2px solid #2D4878", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard content */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 40px" }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "#1A1A1A" }}>
          Welcome to Valt
        </h1>
        <p style={{ fontSize: 17, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", marginBottom: 56 }}>
          Your job search dashboard is coming soon. More features on the way.
        </p>

        {/* Placeholder cards for future features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { title: "Application tracker", desc: "Track every job you apply to.", icon: "📋", coming: true },
            { title: "Resume tailoring", desc: "Tailor your resume to any job.", icon: "✏️", coming: true },
            { title: "Cover letter generator", desc: "Generate cover letters in seconds.", icon: "📝", coming: true },
            { title: "Interview prep", desc: "Practice answers to likely questions.", icon: "🎯", coming: true },
            { title: "Document vault", desc: "Store all your resumes and cover letters.", icon: "🗂️", coming: true },
            { title: "Smart nudges", desc: "Get reminders to follow up.", icon: "🔔", coming: true },
          ].map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px", opacity: 0.6 }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#1A1A1A" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.7, fontFamily: "system-ui, sans-serif", marginBottom: 12 }}>{f.desc}</p>
              <span style={{ fontSize: 11, fontWeight: 600, background: "#EBF0F8", color: "#2D4878", padding: "3px 10px", borderRadius: 999, fontFamily: "system-ui, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Coming soon</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
