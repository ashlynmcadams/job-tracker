"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Job = {
  id: string;
  company: string;
  title: string;
  status: string;
  date_applied: string;
};

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "", title: "", url: "", location: "", salary: "", status: "applied", notes: "", date_applied: new Date().toISOString().split("T")[0],
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? "");
      const { data } = await supabase.from("jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setJobs(data ?? []);
      setLoading(false);
    }
    init();
  }, []);

  async function handleAddJob() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("jobs").insert([{ ...form, user_id: user.id }]).select();
    if (!error && data) {
      setJobs([data[0], ...jobs]);
      setForm({ company: "", title: "", url: "", location: "", salary: "", status: "applied", notes: "", date_applied: new Date().toISOString().split("T")[0] });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "system-ui, sans-serif", color: "#4A4A4A" }}>Loading...</p>
    </main>
  );

  // Stats
  const total = jobs.length;
  const interviews = jobs.filter(j => j.status === "interview").length;
  const offers = jobs.filter(j => j.status === "offer").length;
  const needsFollowUp = jobs.filter(j => j.status === "applied" && j.date_applied && (new Date().getTime() - new Date(j.date_applied).getTime()) > 7 * 24 * 60 * 60 * 1000);

  const STATUS_COLORS: Record<string, string> = {
    applied: "#2D4878",
    interview: "#7C3AED",
    offer: "#059669",
    rejected: "#DC2626",
    ghosted: "#6B7280",
  };

  return (
    <div style={{ display: "flex", background: "#F7F6F2", minHeight: "100vh" }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top nav */}
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E3DD", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Dashboard</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{userEmail}</span>
              <button onClick={handleLogout} style={{ fontSize: 14, background: "transparent", color: "#2D4878", padding: "10px 20px", borderRadius: 999, border: "2px solid #2D4878", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                Log out
              </button>
            </div>
          </div>
        </nav>

        <section style={{ padding: "40px 40px", maxWidth: 1100 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Total applications", value: total, color: "#2D4878" },
              { label: "Interviews", value: interviews, color: "#7C3AED" },
              { label: "Offers", value: offers, color: "#059669" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px" }}>
                <p style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", marginBottom: 8 }}>{s.label}</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: s.color, fontFamily: "system-ui, sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Recent applications */}
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>Recent applications</h2>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ fontSize: 13, background: "#2D4878", color: "#fff", padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
                  >
                    + Add job
                  </button>
                  <a href="/tracker" style={{ fontSize: 13, color: "#2D4878", padding: "7px 16px", borderRadius: 8, border: "2px solid #2D4878", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500, textDecoration: "none" }}>
                    View all
                  </a>
                </div>
              </div>

              {/* Quick add form */}
              {showForm && (
                <div style={{ background: "#F7F6F2", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    {[
                      { label: "Company", key: "company", placeholder: "Google" },
                      { label: "Job title", key: "title", placeholder: "Software Engineer" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 4 }}>{f.label}</label>
                        <input
                          type="text"
                          placeholder={f.placeholder}
                          value={form[f.key as keyof typeof form]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "2px solid #E5E3DD", fontSize: 13, outline: "none", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleAddJob}
                      disabled={saving || !form.company || !form.title}
                      style={{ padding: "8px 18px", background: "#2D4878", color: "#fff", fontSize: 13, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      style={{ padding: "8px 18px", background: "transparent", color: "#4A4A4A", fontSize: 13, borderRadius: 8, border: "2px solid #E5E3DD", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {jobs.length === 0 ? (
                <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>No applications yet. Add your first job!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {jobs.slice(0, 5).map(job => (
                    <div key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#F7F6F2", borderRadius: 10 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>{job.company}</p>
                        <p style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.title}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[job.status] ?? "#1A1A1A", background: "#fff", padding: "4px 10px", borderRadius: 999, fontFamily: "system-ui, sans-serif", border: `1px solid ${STATUS_COLORS[job.status] ?? "#E5E3DD"}` }}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Follow-up nudges */}
              <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginBottom: 16 }}>Follow-up nudges 🔔</h2>
                {needsFollowUp.length === 0 ? (
                  <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>You're all caught up!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {needsFollowUp.slice(0, 3).map(job => (
                      <div key={job.id} style={{ padding: "12px 14px", background: "#FFF8F0", border: "1px solid #FDE8C8", borderRadius: 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>{job.company}</p>
                        <p style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>Applied {job.date_applied} — consider following up</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document vault preview */}
              <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>Document vault 🗂️</h2>
                  <a href="/vault" style={{ fontSize: 13, color: "#2D4878", fontFamily: "system-ui, sans-serif", fontWeight: 500, textDecoration: "none" }}>View all</a>
                </div>
                <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>Store and manage your resumes and cover letters.</p>
                <a href="/vault" style={{ display: "inline-block", marginTop: 14, fontSize: 13, background: "#EBF0F8", color: "#2D4878", padding: "8px 16px", borderRadius: 8, fontFamily: "system-ui, sans-serif", fontWeight: 500, textDecoration: "none" }}>
                  Go to vault →
                </a>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
