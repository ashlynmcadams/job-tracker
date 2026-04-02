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

function daysSince(dateStr: string) {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyLabel(job: Job): { label: string; color: string; bg: string; border: string; priority: number } {
  const days = daysSince(job.date_applied);
  if (job.status === "interview") return { label: "Interview stage", color: "#7C3AED", bg: "#F5F0FF", border: "#DDD6FE", priority: 0 };
  if (job.status === "offer")     return { label: "Offer received", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", priority: 0 };
  if (job.status === "applied" && days >= 14) return { label: `${days}d — no update`, color: "#DC2626", bg: "#FFF5F5", border: "#FECACA", priority: 1 };
  if (job.status === "applied" && days >= 7)  return { label: `${days}d — still waiting`, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", priority: 2 };
  if (job.status === "ghosted")  return { label: "Ghosted", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", priority: 4 };
  if (job.status === "rejected") return { label: "Rejected", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", priority: 4 };
  return { label: `${days}d ago`, color: "#2D4878", bg: "#EBF0F8", border: "#BFCFEC", priority: 3 };
}

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "", title: "", url: "", location: "", salary: "", status: "applied", notes: "",
    date_applied: new Date().toISOString().split("T")[0],
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

  // Resets the clock — "still active" snooze
  async function handleStillActive(id: string) {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("jobs").update({ date_applied: today }).eq("id", id);
    setJobs(jobs.map(j => j.id === id ? { ...j, date_applied: today } : j));
  }

  // Marks as ghosted — "move on"
  async function handleMoveOn(id: string) {
    await supabase.from("jobs").update({ status: "ghosted" }).eq("id", id);
    setJobs(jobs.map(j => j.id === id ? { ...j, status: "ghosted" } : j));
  }

  if (loading) return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "system-ui, sans-serif", color: "#4A4A4A" }}>Loading...</p>
    </main>
  );

  const sorted = [...jobs].sort((a, b) => urgencyLabel(a).priority - urgencyLabel(b).priority);
  const needsDecision = sorted.filter(j => j.status === "applied" && daysSince(j.date_applied) >= 7);
  const interviews = jobs.filter(j => j.status === "interview").length;
  const offers = jobs.filter(j => j.status === "offer").length;
  const active = sorted.filter(j => j.status !== "rejected" && j.status !== "ghosted");

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ display: "flex", background: "#F7F6F2", minHeight: "100vh" }}>
      <Sidebar />

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

        <section style={{ padding: "40px", maxWidth: 1100 }}>

          {/* Greeting */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 }}>{greeting()}.</h2>
            <p style={{ fontSize: 15, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>
              {needsDecision.length === 0
                ? "You're all caught up. No decisions needed right now."
                : `${needsDecision.length} application${needsDecision.length > 1 ? "s need" : " needs"} a decision.`}
            </p>
          </div>

          {/* Needs a decision */}
          {needsDecision.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>Make a call</h3>
              <p style={{ fontSize: 13, color: "#6B7280", fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>
                These have gone quiet. Are you still waiting, or is it time to move on?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {needsDecision.map(job => {
                  const u = urgencyLabel(job);
                  return (
                    <div
                      key={job.id}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: u.bg, border: `1px solid ${u.border}`, borderRadius: 12 }}
                    >
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>{job.company}</p>
                        <p style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.title} · {u.label}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleStillActive(job.id)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: "2px solid #E5E3DD", background: "#fff", color: "#1A1A1A", cursor: "pointer", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}
                        >
                          Still active
                        </button>
                        <button
                          onClick={() => handleMoveOn(job.id)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: "none", background: "#1A1A1A", color: "#fff", cursor: "pointer", fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}
                        >
                          Move on
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Active applications */}
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A" }}>Active applications</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ fontSize: 13, background: "#2D4878", color: "#fff", padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
                  >
                    + Add
                  </button>
                  <a href="/tracker" style={{ fontSize: 13, color: "#2D4878", padding: "7px 16px", borderRadius: 8, border: "2px solid #2D4878", fontFamily: "system-ui, sans-serif", fontWeight: 500, textDecoration: "none" }}>
                    View all
                  </a>
                </div>
              </div>

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

              {active.length === 0 ? (
                <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>No active applications. Add your first job!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {active.slice(0, 6).map(job => {
                    const u = urgencyLabel(job);
                    return (
                      <button
                        key={job.id}
                        onClick={() => router.push("/tracker")}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#F7F6F2", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 2 }}>{job.company}</p>
                          <p style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.title}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: u.color, fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}>
                          {u.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "28px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 16 }}>Overview</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Active applications", value: active.length, color: "#2D4878" },
                    { label: "In interviews", value: interviews, color: "#7C3AED" },
                    { label: "Offers", value: offers, color: "#059669" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0EFEB" }}>
                      <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{s.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "system-ui, sans-serif" }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#2D4878", borderRadius: 20, padding: "28px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui, sans-serif", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tip</p>
                <p style={{ fontSize: 15, color: "#fff", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
                  {offers > 0
                    ? "You have an offer — make sure you've followed up with any other active applications before deciding."
                    : interviews > 0
                    ? "You're in interviews. Keep your other applications moving so you have options."
                    : needsDecision.length > 0
                    ? "Keeping your tracker honest is half the battle. Move on from what's gone quiet and focus on what's alive."
                    : "Stay consistent. Even one new application a day adds up fast."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
