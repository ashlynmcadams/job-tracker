"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Doc = {
  name: string;
  created_at: string;
  metadata: { size: number };
};

export default function Vault() {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      await fetchDocs(user.id);
      setLoading(false);
    }
    init();
  }, []);

  async function fetchDocs(uid: string) {
    const { data, error } = await supabase.storage.from("documents").list(uid, { sortBy: { column: "created_at", order: "desc" } });
    if (!error && data) setDocs(data as Doc[]);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow PDFs and Word docs
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setError("Only PDF and Word documents are supported.");
      return;
    }

    // Max file size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setUploading(true);
    setError("");

    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);

    if (error) {
      setError("Upload failed. Please try again.");
    } else {
      await fetchDocs(userId);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDownload(name: string) {
    const { data } = await supabase.storage.from("documents").createSignedUrl(`${userId}/${name}`, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(name: string) {
    if (!confirm("Delete this document?")) return;
    await supabase.storage.from("documents").remove([`${userId}/${name}`]);
    setDocs(docs.filter(d => d.name !== name));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function getFileIcon(name: string) {
    if (name.endsWith(".pdf")) return "📄";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "📝";
    return "📁";
  }

  function cleanName(name: string) {
    // Remove the timestamp prefix we added on upload
    return name.replace(/^\d+_/, "");
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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Document vault</h1>
            <label style={{ padding: "10px 22px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 10, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
              {uploading ? "Uploading..." : "+ Upload document"}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
            </label>
          </div>
        </nav>

        <section style={{ padding: "32px 40px" }}>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 14, color: "#DC2626", fontFamily: "system-ui, sans-serif" }}>
              {error}
            </div>
          )}

          {/* Info box */}
          <div style={{ background: "#EBF0F8", borderRadius: 14, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <p style={{ fontSize: 13, color: "#2D4878", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
              Upload your resumes and cover letters here. Supported formats: PDF, DOC, DOCX. Max size: 5MB per file. Only you can see your documents.
            </p>
          </div>

          {docs.length === 0 ? (
            <div style={{ background: "#fff", border: "2px dashed #E5E3DD", borderRadius: 20, padding: "80px 40px", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 16 }}>🗂️</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginBottom: 8 }}>No documents yet</p>
              <p style={{ fontSize: 14, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", marginBottom: 24 }}>Upload your resume or cover letter to get started.</p>
              <label style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 10, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                Upload your first document
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ display: "none" }} />
              </label>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {docs.map(doc => (
                <div key={doc.name} style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "22px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span style={{ fontSize: 28 }}>{getFileIcon(doc.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 4, wordBreak: "break-word" }}>{cleanName(doc.name)}</p>
                      <p style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>
                        {formatSize(doc.metadata?.size ?? 0)} · {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleDownload(doc.name)}
                      style={{ flex: 1, padding: "9px", background: "#EBF0F8", color: "#2D4878", fontSize: 13, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.name)}
                      style={{ padding: "9px 14px", background: "transparent", color: "#DC2626", fontSize: 13, borderRadius: 8, border: "1px solid #FECACA", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
