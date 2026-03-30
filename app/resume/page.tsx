"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Industry = "general" | "tech" | "finance" | "healthcare" | "marketing";

const INDUSTRIES: { label: string; value: Industry }[] = [
  { label: "General", value: "general" },
  { label: "Tech / Software", value: "tech" },
  { label: "Finance / Accounting", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Marketing / Creative", value: "marketing" },
];

type TipSection = { title: string; tips: string[] };

const TIPS: Record<Industry, TipSection[]> = {
  general: [
    { title: "Summary", tips: ["Keep it to 2–3 sentences focused on your value, not your history.", "Tailor it to each job — mention the role or company name.", "Avoid generic phrases like 'hardworking team player'."] },
    { title: "Work Experience", tips: ["Use bullet points, not paragraphs.", "Start each bullet with a strong action verb (Led, Built, Improved, Reduced).", "Include at least one metric per role if possible (e.g. 'managed a team of 5')."] },
    { title: "Skills", tips: ["List tools, software, and hard skills — not soft skills like 'communication'.", "Match skills to keywords in the job description.", "Group related skills together (e.g. Languages, Tools, Platforms)."] },
    { title: "Education", tips: ["List your most recent degree first.", "Include GPA only if it's above 3.5.", "Add relevant coursework or honors if you're early in your career."] },
  ],
  tech: [
    { title: "Summary", tips: ["Mention your primary stack or area of expertise upfront.", "Highlight years of experience and a key achievement.", "Keep it technical — recruiters in tech appreciate specificity."] },
    { title: "Work Experience", tips: ["Lead with impact: 'Reduced API latency by 40%' beats 'Worked on API performance'.", "Name the specific technologies used in each role.", "Include links to GitHub, deployed projects, or PRs where relevant."] },
    { title: "Skills", tips: ["Separate Languages, Frameworks, Tools, and Cloud platforms into groups.", "Be honest — only list things you can speak to in an interview.", "Put your strongest, most relevant skills first."] },
    { title: "Education", tips: ["Relevant bootcamps and certifications (AWS, GCP, etc.) carry weight — include them.", "Side projects and open source contributions can outweigh GPA.", "Include a Projects section if you're early-career or changing roles."] },
  ],
  finance: [
    { title: "Summary", tips: ["Lead with your designation or area (e.g. CPA, investment banking, FP&A).", "Mention the size of portfolios, budgets, or teams you've managed.", "Keep it formal — finance recruiting is traditional."] },
    { title: "Work Experience", tips: ["Quantify everything: deal sizes, budget managed, cost savings, revenue impact.", "Use industry-standard terms (DCF, M&A, variance analysis, financial modeling).", "List designations (CPA, CFA, Series 7) prominently within each role or in a dedicated section."] },
    { title: "Skills", tips: ["Include Excel and financial modeling tools explicitly (e.g. Bloomberg, Tableau, SQL).", "List certifications and licenses in a dedicated section near the top.", "Soft skills matter less here — focus on technical and analytical skills."] },
    { title: "Education", tips: ["School prestige matters more in finance than most fields — list it prominently.", "Include GPA if above 3.5, especially for early-career roles.", "Add relevant coursework like Corporate Finance, Econometrics, or Statistics."] },
  ],
  healthcare: [
    { title: "Summary", tips: ["Lead with your licensure and specialty (e.g. RN, BSN, ICU).", "Mention patient population and setting (pediatrics, acute care, outpatient).", "Keep it clinically focused — avoid vague language."] },
    { title: "Work Experience", tips: ["Include patient volume and acuity level where possible.", "Highlight specific procedures, equipment, or EMR systems (Epic, Cerner) you've used.", "For administrative roles, include budget size, team size, and compliance outcomes."] },
    { title: "Skills", tips: ["Lead with clinical skills and certifications (BLS, ACLS, PALS).", "Include EMR/EHR systems you're certified in.", "Add any language skills — bilingual healthcare workers are highly valued."] },
    { title: "Education", tips: ["List licenses and certifications in a dedicated section at the top.", "Include clinical rotations if you're a new grad.", "Continuing education and specializations are worth listing."] },
  ],
  marketing: [
    { title: "Summary", tips: ["Lead with your specialty — brand, performance, content, growth, etc.", "Drop a headline metric upfront (e.g. 'Grew organic traffic 3x in 12 months').", "Show personality — marketing resumes can have more voice than other fields."] },
    { title: "Work Experience", tips: ["Every bullet should tie to a result: impressions, conversions, revenue, CAC, ROAS.", "Name the channels and tools you used (Meta Ads, HubSpot, SEO, Figma).", "Include campaign names or brand work if it's recognizable."] },
    { title: "Skills", tips: ["List tools explicitly: Google Analytics, Salesforce, Mailchimp, Canva, etc.", "Include both creative and analytical skills — the best marketers have both.", "Add a portfolio or website link near your name at the top."] },
    { title: "Education", tips: ["Certifications matter a lot in marketing — Google Ads, HubSpot, Meta Blueprint.", "A strong portfolio can outweigh your degree.", "Include any notable campaigns, freelance work, or side projects."] },
  ],
};

const UNIVERSAL_CHECKLIST = [
  "One page (unless 10+ years of experience)",
  "No spelling or grammar errors",
  "Consistent formatting (fonts, spacing, bullet style)",
  "Contact info is up to date (email, LinkedIn, phone)",
  "No photos, age, or personal details",
  "Saved and exported as a PDF",
];

const INDUSTRY_CHECKLIST: Record<Industry, string[]> = {
  general: [
    "Tailored summary for the role you're applying to",
    "At least one metric or result per job",
  ],
  tech: [
    "GitHub or portfolio link included",
    "Tech stack clearly listed for each role",
    "Projects section included (if early-career)",
  ],
  finance: [
    "CPA, CFA, or other designations are prominent",
    "Deal sizes or budget figures included",
    "Financial tools (Excel, Bloomberg, SQL) listed",
  ],
  healthcare: [
    "License number and state included",
    "EMR/EHR systems listed (Epic, Cerner, etc.)",
    "Clinical certifications current (BLS, ACLS, etc.)",
  ],
  marketing: [
    "Portfolio or website link near your name",
    "Campaign metrics included (ROAS, CAC, conversions)",
    "Platform certifications listed (Google, HubSpot, Meta)",
  ],
};

export default function Resume() {
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState<Industry>("general");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setLoading(false);
    }
    init();
  }, []);

  function toggleCheck(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const allChecklist = [...UNIVERSAL_CHECKLIST.map(i => ({ text: i, key: `u_${i}` })), ...INDUSTRY_CHECKLIST[industry].map(i => ({ text: i, key: `ind_${i}` }))];
  const checkedCount = allChecklist.filter(i => checked[i.key]).length;

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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Resume Help</h1>
            {/* Locked AI button */}
            <button
              disabled
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#F3F4F6", color: "#9CA3AF", fontSize: 14, borderRadius: 10, border: "1px solid #E5E7EB", cursor: "not-allowed", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
            >
              🔒 AI Resume Review — Upgrade to Pro
            </button>
          </div>
        </nav>

        <section style={{ padding: "32px 40px", maxWidth: 860 }}>

          {/* Industry selector */}
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 14 }}>Select your industry to get tailored tips</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.value}
                  onClick={() => { setIndustry(ind.value); setChecked({}); }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "system-ui, sans-serif",
                    cursor: "pointer",
                    border: industry === ind.value ? "none" : "1px solid #E5E3DD",
                    background: industry === ind.value ? "#2D4878" : "#fff",
                    color: industry === ind.value ? "#fff" : "#4A4A4A",
                  }}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>
              Tips for {INDUSTRIES.find(i => i.value === industry)?.label} resumes
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {TIPS[industry].map(section => (
                <div key={section.title} style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "22px 24px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#2D4878", fontFamily: "system-ui, sans-serif", marginBottom: 12 }}>{section.title}</p>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                    {section.tips.map(tip => (
                      <li key={tip} style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Before you upload — checklist</h2>
              <span style={{ fontSize: 13, color: checkedCount === allChecklist.length ? "#059669" : "#4A4A4A", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>
                {checkedCount}/{allChecklist.length} complete
              </span>
            </div>

            {/* Universal items */}
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Universal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {UNIVERSAL_CHECKLIST.map(item => {
                const key = `u_${item}`;
                return (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!checked[key]} onChange={() => toggleCheck(key)} style={{ width: 16, height: 16, accentColor: "#2D4878", cursor: "pointer" }} />
                    <span style={{ fontSize: 13, color: checked[key] ? "#9CA3AF" : "#1A1A1A", fontFamily: "system-ui, sans-serif", textDecoration: checked[key] ? "line-through" : "none" }}>{item}</span>
                  </label>
                );
              })}
            </div>

            {/* Industry-specific items */}
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
              {INDUSTRIES.find(i => i.value === industry)?.label}-specific
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INDUSTRY_CHECKLIST[industry].map(item => {
                const key = `ind_${item}`;
                return (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!checked[key]} onChange={() => toggleCheck(key)} style={{ width: 16, height: 16, accentColor: "#2D4878", cursor: "pointer" }} />
                    <span style={{ fontSize: 13, color: checked[key] ? "#9CA3AF" : "#1A1A1A", fontFamily: "system-ui, sans-serif", textDecoration: checked[key] ? "line-through" : "none" }}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: "#EBF0F8", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>Ready? Store your resume in your Document Vault.</p>
              <p style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>Keep all your resumes and cover letters in one place.</p>
            </div>
            <a href="/vault" style={{ padding: "12px 24px", background: "#2D4878", color: "#fff", fontSize: 14, borderRadius: 10, fontFamily: "system-ui, sans-serif", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
              Go to Document Vault →
            </a>
          </div>

        </section>
      </div>
    </div>
  );
}
