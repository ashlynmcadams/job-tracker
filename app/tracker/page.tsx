"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

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

const STATUSES = ["all", "applied", "interview", "offer", "rejected", "ghosted"];

const STATUS_COLORS: Record<string, string> = {
  applied: "#2D4878",
  interview: "#7C3AED",
  offer: "#059669",
  rejected: "#DC2626",
  ghosted: "#6B7280",
};

export default function Tracker() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_applied");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "", title: "", url: "", location: "", salary: "", status: "applied", notes: "", date_applied: new Date().toISOString().split("T")[0],
  });
  const router = useRouter();
  const supabase = createClient();

  // On load, check auth and fetch jobs
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setJobs(data ?? []);
      setFiltered(data ?? []);
      setLoading(false);
    }
    init();
  }, []);

  // Filter and sort whenever jobs, search, filter, or sort changes
  useEffect(() => {
    let result = [...jobs];
    if (statusFilter !== "all") result = result.filter(j => j.status === statusFilter);
    if (search) result = result.filter(j =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.location ?? "").toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      const aVal = a[sortBy as keyof Job] ?? "";
      const bVal = b[sortBy as keyof Job] ?? "";
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setFiltered(result);
  }, [jobs, statusFilter, search, sortBy, sortDir]);

  function toggleSort(col: string) {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

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
  }async function handleStillActive(id: string) {
  const today = new Date().toISOString().split("T")[0];
  await supabase.from("jobs").update({ date_applied: today }).eq("id", id);
  setJobs(jobs.map(j => j.id === id ? { ...j, date_applied: today } : j));
}

  async function handleDelete(id: string) {
    if (!confirm("Delete this application?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(jobs.filter(j => j.id !== id));
  }

  if (loading) return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "system-ui, sans-serif", color: "#4A4A4A" }}>Loading...</p>
    </main>
  );

  return (
    <div style={{ display: "flex", background: "#F7F6F2", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top nav */}
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E3DD", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Application tracker</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ padding: "10px 22px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
            >
              + Add job
            </button>
          </div>
        </nav>

        <section style={{ padding: "32px 40px" }}>

          {/* Add job form */}
          {showForm && (
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "32px", marginBottom: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 22, color: "#1A1A1A" }}>Add a job</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                {[
                  { label: "Company", key: "company", placeholder: "Google" },
                  { label: "Job title", key: "title", placeholder: "Software Engineer" },
                  { label: "Location", key: "location", placeholder: "New York, NY" },
                  { label: "Salary range", key: "salary", placeholder: "$80k - $100k" },
                  { label: "Date applied", key: "date_applied", type: "date" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type ?? "text"}
                      placeholder={f.placeholder ?? ""}
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
                    {STATUSES.filter(s => s !== "all").map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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
                  style={{ padding: "11px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
                >
                  {saving ? "Saving..." : "Save job"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ padding: "11px 24px", background: "transparent", color: "#4A4A4A", fontSize: 14, borderRadius: 10, border: "2px solid #E5E3DD", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search company, title, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: 10, border: "2px solid #E5E3DD", fontSize: 14, outline: "none", fontFamily: "system-ui, sans-serif", color: "#1A1A1A", background: "#fff", width: 280 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontFamily: "system-ui, sans-serif", fontWeight: 500, cursor: "pointer", border: "2px solid",
                    borderColor: statusFilter === s ? (STATUS_COLORS[s] ?? "#2D4878") : "#E5E3DD",
                    background: statusFilter === s ? (STATUS_COLORS[s] ?? "#EBF0F8") : "#fff",
                    color: statusFilter === s ? "#fff" : "#4A4A4A",
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>
              Showing <strong>{filtered.length}</strong> of <strong>{jobs.length}</strong> applications
            </span>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, padding: "64px", textAlign: "center" }}>
              <p style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>No applications found</p>
              <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>Try adjusting your filters or add a new job.</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 20, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E5E3DD" }}>
                    {[
                      { label: "Company", key: "company" },
                      { label: "Job title", key: "title" },
                      { label: "Location", key: "location" },
                      { label: "Salary", key: "salary" },
                      { label: "Date applied", key: "date_applied" },
                      { label: "Status", key: "status" },
                    ].map(h => (
                      <th
                        key={h.key}
                        onClick={() => toggleSort(h.key)}
                        style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                      >
                        {h.label} {sortBy === h.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                      </th>
                    ))}
                    <th style={{ padding: "14px 20px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job, i) => (
                    <tr key={job.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #E5E3DD" : "none", background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
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
                          {STATUSES.filter(s => s !== "all").map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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
      </div>
    </div>
  );
}
