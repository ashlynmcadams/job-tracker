"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  company: string;
  title: string;
  url: string;
  location: string;
  salary: string;
  status: string;
  notes: string;
  date_applied: string;
};

const STATUSES = ["applied", "interview", "offer", "rejected", "ghosted"];

const STATUS_COLORS: Record<string, string> = {
  applied: "#2D4878",
  interview: "#7C3AED",
  offer: "#059669",
  rejected: "#DC2626",
  ghosted: "#6B7280",
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

  // On page load, check if user is logged in and fetch their jobs
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

  async function handleStatusChange(id: string, status: string) {
    await supabase.from("jobs").update({ status }).eq("id", id);
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
  }

  async function handleDelete(id: string) {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(jobs.filter(j => j.id !== id));
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

  return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E5E3DD", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>Valt</span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{userEmail}</span>
            <button onClick={handleLogout} style={{ fontSize: 14, background: "transparent", color: "#2D4878", padding: "10px 20px", borderRadius: 999, border: "2px solid #2D4878", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 6, color: "#1A1A1A" }}>Application tracker</h1>
            <p style={{ fontSize: 15, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{jobs.length} {jobs.length === 1 ? "application" : "applications"} tracked</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
          >
            + Add job
          </button>
        </div>

        {/* Add job form */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "32px", marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#1A1A1A" }}>Add a job</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
              {[
                { label: "Company", key: "company", placeholder: "Google" },
                { label: "Job title", key: "title", placeholder: "Software Engineer" },
                { label: "Location", key: "location", placeholder: "New York, NY" },
                { label: "Salary range", key: "salary", placeholder: "$80,000 - $100,000" },
                { label: "Date applied", key: "date_applied", placeholder: "", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E5E3DD", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 6 }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E5E3DD", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box", background: "#fff" }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 6 }}>Job URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E5E3DD", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 6 }}>Notes</label>
              <textarea
                placeholder="Any notes about this job..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E5E3DD", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleAddJob}
                disabled={saving || !form.company || !form.title}
                style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
              >
                {saving ? "Saving..." : "Save job"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "12px 24px", background: "transparent", color: "#4A4A4A", fontSize: 14, borderRadius: 12, border: "2px solid #E5E3DD", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Jobs table */}
        {jobs.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "64px", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>No applications yet</p>
            <p style={{ fontSize: 15, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>Click "Add job" to track your first application.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E3DD" }}>
                  {["Company", "Job title", "Location", "Salary", "Date applied", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? "1px solid #E5E3DD" : "none", background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>
                        {job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1A1A1A", textDecoration: "none" }}>{job.company} ↗</a> : job.company}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.title}</td>
                    <td style={{ padding: "16px 20px", fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.location || "—"}</td>
                    <td style={{ padding: "16px 20px", fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.salary || "—"}</td>
                    <td style={{ padding: "16px 20px", fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>{job.date_applied || "—"}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <select
                        value={job.status}
                        onChange={e => handleStatusChange(job.id, e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: `2px solid ${STATUS_COLORS[job.status] ?? "#E5E3DD"}`, fontSize: 13, fontFamily: "system-ui, sans-serif", color: STATUS_COLORS[job.status] ?? "#1A1A1A", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <button
                        onClick={() => handleDelete(job.id)}
                        style={{ fontSize: 13, color: "#DC2626", background: "transparent", border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}