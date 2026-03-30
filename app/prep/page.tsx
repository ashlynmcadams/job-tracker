"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Industry = "general" | "tech" | "finance" | "healthcare" | "marketing";
type Mode = "prep" | "interview";

const INDUSTRIES: { label: string; value: Industry }[] = [
  { label: "General", value: "general" },
  { label: "Tech / Software", value: "tech" },
  { label: "Finance / Accounting", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Marketing / Creative", value: "marketing" },
];

const SUGGESTED_QUESTIONS: Record<Industry, string[]> = {
  general: [
    "Tell me about yourself.",
    "Why do you want to work here?",
    "What are your greatest strengths?",
    "What is your biggest weakness?",
    "Where do you see yourself in 5 years?",
    "Tell me about a challenge you overcame.",
    "Why are you leaving your current job?",
    "What makes you the best candidate for this role?",
  ],
  tech: [
    "Tell me about yourself and your technical background.",
    "Walk me through a project you're most proud of.",
    "How do you approach debugging a complex issue?",
    "Tell me about a time you had to learn a new technology quickly.",
    "How do you handle disagreements about technical decisions?",
    "Describe your experience with relevant technologies.",
    "How do you prioritize tasks when everything feels urgent?",
    "What does good code look like to you?",
  ],
  finance: [
    "Walk me through your experience in finance.",
    "Why are you interested in this firm?",
    "Walk me through a DCF model.",
    "Tell me about a time you identified a financial risk.",
    "How do you stay current with market trends?",
    "Describe a time you presented financial data to a non-finance audience.",
    "What financial modeling tools are you most comfortable with?",
    "Where do you see yourself in this industry long term?",
  ],
  healthcare: [
    "Tell me about yourself and your clinical background.",
    "Why do you want to work at this facility?",
    "Describe a difficult patient situation and how you handled it.",
    "How do you prioritize care when managing multiple patients?",
    "Tell me about a time you worked with a challenging team member.",
    "How do you stay current with clinical best practices?",
    "Describe your experience with your EMR system.",
    "What does patient-centered care mean to you?",
  ],
  marketing: [
    "Tell me about yourself and your marketing background.",
    "Walk me through a campaign you're proud of.",
    "How do you measure the success of a marketing initiative?",
    "Tell me about a time a campaign didn't perform as expected.",
    "How do you balance creativity with data?",
    "What marketing tools and platforms do you use regularly?",
    "How do you approach learning a new brand's voice?",
    "Where do you see marketing heading in the next few years?",
  ],
};

const CHECKLIST = [
  "Research the company — know their mission, product, and recent news",
  "Review the job description and match your experience to it",
  "Prepare 2–3 questions to ask the interviewer",
  "Test your tech (camera, mic, internet) if it's virtual",
  "Have a copy of your resume in front of you",
  "Know the interviewer's name and title",
  "Prepare a strong answer for 'Tell me about yourself'",
  "Get a good night's sleep and eat beforehand",
];

type QA = { question: string; answer: string; isCustom?: boolean };

export default function InterviewPrep() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("prep");
  const [industry, setIndustry] = useState<Industry>("general");
  const [qaList, setQaList] = useState<QA[]>([]);
  const [editingQ, setEditingQ] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("interview_answers").select("*").eq("user_id", user.id);
      const savedMap: Record<string, { answer: string; isCustom?: boolean }> = {};
      if (data) data.forEach((row: { question: string; answer: string; is_custom?: boolean }) => {
        savedMap[row.question] = { answer: row.answer, isCustom: row.is_custom };
      });
      setQaList(buildQaList("general", savedMap));
      setLoading(false);
    }
    init();
  }, []);

  function buildQaList(ind: Industry, savedMap: Record<string, { answer: string; isCustom?: boolean }>): QA[] {
    const suggested = SUGGESTED_QUESTIONS[ind].map(q => ({ question: q, answer: savedMap[q]?.answer ?? "", isCustom: false }));
    const custom = Object.entries(savedMap).filter(([, v]) => v.isCustom).map(([q, v]) => ({ question: q, answer: v.answer, isCustom: true }));
    return [...suggested, ...custom];
  }

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  async function saveAnswer(question: string, answer: string, isCustom = false) {
    setSaving(true);
    await supabase.from("interview_answers").upsert({ user_id: userId, question, answer, is_custom: isCustom }, { onConflict: "user_id,question" });
    setQaList(prev => prev.map(qa => qa.question === question ? { ...qa, answer } : qa));
    setEditingQ(null);
    setDraftAnswer("");
    setSaving(false);
  }

  async function deleteQuestion(question: string) {
    if (!confirm("Delete this question?")) return;
    await supabase.from("interview_answers").delete().eq("user_id", userId).eq("question", question);
    setQaList(prev => prev.filter(qa => qa.question !== question));
  }

  async function addCustomQuestion() {
    if (!newQuestion.trim()) return;
    const qa: QA = { question: newQuestion.trim(), answer: "", isCustom: true };
    await supabase.from("interview_answers").upsert({ user_id: userId, question: qa.question, answer: "", is_custom: true }, { onConflict: "user_id,question" });
    setQaList(prev => [...prev, qa]);
    setNewQuestion("");
    setAddingQuestion(false);
    setEditingQ(qa.question);
    setDraftAnswer("");
  }

  async function exportToPDF() {
    const answered = qaList.filter(qa => qa.answer.trim());
    if (answered.length === 0) {
      setExportMsg("No answered questions to export yet.");
      setTimeout(() => setExportMsg(""), 3000);
      return;
    }
    setExporting(true);
    setExportMsg("");
    try {
      // Build plain text content
      const lines: string[] = [`Interview Prep Notes\n${"=".repeat(40)}\n`];
      answered.forEach((qa, i) => {
        lines.push(`Q${i + 1}: ${qa.question}\n`);
        lines.push(`A: ${qa.answer}\n`);
        lines.push("-".repeat(40) + "\n");
      });
      const text = lines.join("\n");

      // Convert to PDF-like blob using HTML + print
      const htmlContent = `
        <html><head><style>
          body { font-family: Georgia, serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1A1A1A; }
          h1 { font-size: 22px; margin-bottom: 8px; color: #2D4878; }
          .meta { font-size: 13px; color: #9CA3AF; margin-bottom: 32px; }
          .qa { margin-bottom: 28px; border-bottom: 1px solid #E5E3DD; padding-bottom: 20px; }
          .q { font-size: 15px; font-weight: 700; color: #2D4878; margin-bottom: 8px; }
          .a { font-size: 14px; line-height: 1.7; color: #1A1A1A; white-space: pre-wrap; }
        </style></head><body>
          <h1>Interview Prep Notes</h1>
          <div class="meta">Exported from Valt · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          ${answered.map((qa, i) => `
            <div class="qa">
              <div class="q">Q${i + 1}: ${qa.question}</div>
              <div class="a">${qa.answer.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </div>
          `).join("")}
        </body></html>
      `;

      const blob = new Blob([htmlContent], { type: "application/octet-stream" });
      const fileName = `${Date.now()}_interview-prep-notes.pdf`;
      const path = `${userId}/${fileName}`;
      const { error } = await supabase.storage.from("documents").upload(path, blob, { contentType: "application/pdf" });
      if (error) throw error;
      setExportMsg("✓ Saved to Document Vault!");
    } catch {
      setExportMsg("Export failed. Please try again.");
    }
    setExporting(false);
    setTimeout(() => setExportMsg(""), 4000);
  }

  function startEdit(q: string, currentAnswer: string) {
    setEditingQ(q);
    setDraftAnswer(currentAnswer);
  }

  function formatTimer(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function toggleCheck(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleIndustryChange(ind: Industry) {
    setIndustry(ind);
    // Re-merge suggested questions for new industry with existing saved answers
    const savedMap: Record<string, { answer: string; isCustom?: boolean }> = {};
    qaList.forEach(qa => { savedMap[qa.question] = { answer: qa.answer, isCustom: qa.isCustom }; });
    setQaList(buildQaList(ind, savedMap));
  }

  if (loading) return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "system-ui, sans-serif", color: "#4A4A4A" }}>Loading...</p>
    </main>
  );

  // ── INTERVIEW MODE ──
  if (mode === "interview") {
    const allQs = qaList;
    return (
      <div style={{ background: "#0F172A", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff", fontFamily: "'Georgia', serif" }}>Valt</span>
            <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "system-ui, sans-serif" }}>Interview Mode</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0F172A", borderRadius: 10, padding: "8px 16px" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: timerRunning ? "#34D399" : "#94A3B8", fontFamily: "monospace", minWidth: 48 }}>{formatTimer(timerSeconds)}</span>
              <button onClick={() => setTimerRunning(r => !r)} style={{ fontSize: 12, padding: "4px 10px", background: timerRunning ? "#DC2626" : "#2D4878", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                {timerRunning ? "Stop" : "Start"}
              </button>
              <button onClick={() => { setTimerSeconds(0); setTimerRunning(false); }} style={{ fontSize: 12, padding: "4px 10px", background: "transparent", color: "#94A3B8", border: "1px solid #334155", borderRadius: 6, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                Reset
              </button>
            </div>
            <button onClick={() => { setMode("prep"); setActiveQ(null); }} style={{ fontSize: 13, padding: "8px 18px", background: "transparent", color: "#94A3B8", border: "1px solid #334155", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
              ← Exit Interview Mode
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", flex: 1, minHeight: "calc(100vh - 64px)" }}>
          <div style={{ background: "#1E293B", borderRight: "1px solid #334155", padding: "24px 0", overflowY: "auto" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#64748B", fontFamily: "system-ui, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 24px", marginBottom: 12 }}>
              {allQs.length} Questions
            </p>
            {allQs.map((qa, i) => (
              <button key={qa.question} onClick={() => setActiveQ(activeQ === qa.question ? null : qa.question)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "16px 24px", background: activeQ === qa.question ? "#2D4878" : "transparent", border: "none", borderLeft: activeQ === qa.question ? "3px solid #60A5FA" : "3px solid transparent", cursor: "pointer" }}>
                <span style={{ fontSize: 11, color: activeQ === qa.question ? "#93C5FD" : "#64748B", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 4 }}>
                  Q{i + 1}{qa.isCustom ? " · Custom" : ""}
                </span>
                <span style={{ fontSize: 14, color: activeQ === qa.question ? "#fff" : "#CBD5E1", fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>{qa.question}</span>
                {qa.answer && <span style={{ fontSize: 11, color: "#34D399", display: "block", marginTop: 4 }}>✓ Answer saved</span>}
              </button>
            ))}
          </div>

          <div style={{ padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {!activeQ ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 48, marginBottom: 20 }}>🎯</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "system-ui, sans-serif", marginBottom: 12 }}>You're in Interview Mode</p>
                <p style={{ fontSize: 16, color: "#94A3B8", fontFamily: "system-ui, sans-serif" }}>Click a question on the left to see your answer.</p>
              </div>
            ) : (() => {
              const idx = allQs.findIndex(qa => qa.question === activeQ);
              const current = allQs[idx];
              return (
                <div>
                  <p style={{ fontSize: 13, color: "#60A5FA", fontFamily: "system-ui, sans-serif", fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Q{idx + 1} of {allQs.length}
                  </p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "system-ui, sans-serif", lineHeight: 1.4, marginBottom: 40 }}>{activeQ}</p>
                  {current?.answer ? (
                    <div style={{ background: "#1E293B", borderRadius: 16, padding: "32px 36px", border: "1px solid #334155" }}>
                      <p style={{ fontSize: 11, color: "#64748B", fontFamily: "system-ui, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Your Answer</p>
                      <p style={{ fontSize: 18, color: "#E2E8F0", fontFamily: "system-ui, sans-serif", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{current.answer}</p>
                    </div>
                  ) : (
                    <div style={{ background: "#1E293B", borderRadius: 16, padding: "32px 36px", border: "1px dashed #334155", textAlign: "center" }}>
                      <p style={{ fontSize: 16, color: "#64748B", fontFamily: "system-ui, sans-serif" }}>No answer saved for this question.</p>
                      <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginTop: 8 }}>Exit Interview Mode to add your answer.</p>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                    {idx > 0 && (
                      <button onClick={() => setActiveQ(allQs[idx - 1].question)}
                        style={{ padding: "12px 24px", background: "#1E293B", color: "#94A3B8", border: "1px solid #334155", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
                        ← Previous
                      </button>
                    )}
                    {idx < allQs.length - 1 && (
                      <button onClick={() => setActiveQ(allQs[idx + 1].question)}
                        style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
                        Next Question →
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ── PREP MODE ──
  const answeredCount = qaList.filter(qa => qa.answer.trim()).length;

  return (
    <div style={{ display: "flex", background: "#F7F6F2", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>

        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E3DD", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Interview Prep</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button disabled style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#F3F4F6", color: "#9CA3AF", fontSize: 14, borderRadius: 10, border: "1px solid #E5E7EB", cursor: "not-allowed", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                🔒 AI Interview Coach — Upgrade to Pro
              </button>
              <button onClick={() => setMode("interview")} style={{ padding: "10px 22px", background: "#0F172A", color: "#fff", fontSize: 14, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
                🎯 Enter Interview Mode
              </button>
            </div>
          </div>
        </nav>

        <section style={{ padding: "32px 40px", maxWidth: 960 }}>

          {/* Industry selector */}
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 14 }}>Select your industry</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {INDUSTRIES.map(ind => (
                <button key={ind.value} onClick={() => handleIndustryChange(ind.value)}
                  style={{ padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: "system-ui, sans-serif", cursor: "pointer", border: industry === ind.value ? "none" : "1px solid #E5E3DD", background: industry === ind.value ? "#2D4878" : "#fff", color: industry === ind.value ? "#fff" : "#4A4A4A" }}>
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>

            {/* Questions + answers */}
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Questions</h2>
                <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "system-ui, sans-serif" }}>{answeredCount}/{qaList.length} answered</span>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "system-ui, sans-serif", marginBottom: 18 }}>Write your answers — they'll show up in Interview Mode.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {qaList.map((qa, i) => (
                  <div key={qa.question} style={{ borderRadius: 12, border: "1px solid #E5E3DD", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 16px", background: "#F7F6F2", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: 2 }}>
                          Q{i + 1}{qa.isCustom ? " · Custom" : ""}
                        </span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>{qa.question}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => editingQ === qa.question ? setEditingQ(null) : startEdit(qa.question, qa.answer)}
                          style={{ fontSize: 12, padding: "5px 12px", background: editingQ === qa.question ? "#E5E3DD" : "#EBF0F8", color: editingQ === qa.question ? "#4A4A4A" : "#2D4878", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                          {editingQ === qa.question ? "Cancel" : qa.answer ? "Edit" : "+ Add"}
                        </button>
                        {qa.isCustom && (
                          <button onClick={() => deleteQuestion(qa.question)}
                            style={{ fontSize: 12, padding: "5px 10px", background: "transparent", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 6, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    {editingQ === qa.question && (
                      <div style={{ padding: "12px 16px", background: "#fff" }}>
                        <textarea value={draftAnswer} onChange={e => setDraftAnswer(e.target.value)} placeholder="Write your answer here..." rows={4}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E3DD", fontSize: 13, fontFamily: "system-ui, sans-serif", color: "#1A1A1A", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                        <button onClick={() => saveAnswer(qa.question, draftAnswer, qa.isCustom)} disabled={saving || !draftAnswer.trim()}
                          style={{ marginTop: 8, padding: "7px 18px", background: "#2D4878", color: "#fff", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                          {saving ? "Saving..." : "Save answer"}
                        </button>
                      </div>
                    )}
                    {editingQ !== qa.question && qa.answer && (
                      <div style={{ padding: "10px 16px", background: "#fff", borderTop: "1px solid #E5E3DD" }}>
                        <p style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{qa.answer}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add custom question */}
                {addingQuestion ? (
                  <div style={{ borderRadius: 12, border: "1px dashed #2D4878", padding: "14px 16px", background: "#EBF0F8" }}>
                    <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
                      placeholder="Type your custom question..." autoFocus
                      onKeyDown={e => { if (e.key === "Enter") addCustomQuestion(); if (e.key === "Escape") setAddingQuestion(false); }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E3DD", fontSize: 13, fontFamily: "system-ui, sans-serif", color: "#1A1A1A", boxSizing: "border-box", outline: "none", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={addCustomQuestion} disabled={!newQuestion.trim()}
                        style={{ padding: "6px 16px", background: "#2D4878", color: "#fff", fontSize: 13, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                        Add
                      </button>
                      <button onClick={() => setAddingQuestion(false)}
                        style={{ padding: "6px 16px", background: "transparent", color: "#4A4A4A", fontSize: 13, border: "1px solid #E5E3DD", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingQuestion(true)}
                    style={{ padding: "12px", background: "transparent", color: "#2D4878", fontSize: 13, border: "1px dashed #2D4878", borderRadius: 12, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                    + Add your own question
                  </button>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Export to vault */}
              <div style={{ background: "#EBF0F8", border: "1px solid #BFCFE8", borderRadius: 16, padding: "24px 28px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 6 }}>Save to Document Vault 🗂️</h2>
                <p style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", marginBottom: 16, lineHeight: 1.5 }}>
                  Export all your answered questions as a PDF and save it straight to your Document Vault.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={exportToPDF} disabled={exporting}
                    style={{ padding: "10px 22px", background: "#2D4878", color: "#fff", fontSize: 13, border: "none", borderRadius: 10, cursor: exporting ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
                    {exporting ? "Saving..." : `Export ${answeredCount} answer${answeredCount !== 1 ? "s" : ""} to Vault`}
                  </button>
                  {exportMsg && <span style={{ fontSize: 13, color: exportMsg.startsWith("✓") ? "#059669" : "#DC2626", fontFamily: "system-ui, sans-serif" }}>{exportMsg}</span>}
                </div>
              </div>

              {/* Practice timer */}
              <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 6 }}>Practice Timer ⏱️</h2>
                <p style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>Time yourself answering each question. Aim for 1–2 minutes.</p>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 52, fontWeight: 700, color: timerRunning ? "#2D4878" : "#1A1A1A", fontFamily: "monospace", marginBottom: 20 }}>{formatTimer(timerSeconds)}</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={() => setTimerRunning(r => !r)}
                      style={{ padding: "10px 28px", background: timerRunning ? "#DC2626" : "#2D4878", color: "#fff", fontSize: 14, border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
                      {timerRunning ? "Stop" : "Start"}
                    </button>
                    <button onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}
                      style={{ padding: "10px 20px", background: "transparent", color: "#4A4A4A", fontSize: 14, border: "1px solid #E5E3DD", borderRadius: 10, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Pre-interview checklist */}
              <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Before the Interview ✅</h2>
                  <span style={{ fontSize: 12, color: Object.values(checked).filter(Boolean).length === CHECKLIST.length ? "#059669" : "#9CA3AF", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                    {Object.values(checked).filter(Boolean).length}/{CHECKLIST.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CHECKLIST.map(item => (
                    <label key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" checked={!!checked[item]} onChange={() => toggleCheck(item)} style={{ marginTop: 2, width: 15, height: 15, accentColor: "#2D4878", cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: checked[item] ? "#9CA3AF" : "#1A1A1A", fontFamily: "system-ui, sans-serif", lineHeight: 1.5, textDecoration: checked[item] ? "line-through" : "none" }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
