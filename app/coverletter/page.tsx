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

const TIPS: Record<Industry, string[]> = {
  general: [
    "Address the hiring manager by name if you can find it — avoid 'To Whom It May Concern'.",
    "Open with a strong hook — why this company, why this role, why you.",
    "Don't just repeat your resume. Use the cover letter to tell a story.",
    "Keep it to one page and three to four paragraphs.",
    "Close with a clear call to action — express enthusiasm and ask for an interview.",
  ],
  tech: [
    "Mention specific technologies you've used that are relevant to the role.",
    "Reference a project or contribution that shows your technical depth.",
    "Show you understand the company's product or tech stack — do your research.",
    "Keep it concise — many tech hiring managers prefer shorter cover letters.",
    "Link to your GitHub or portfolio if it's strong.",
  ],
  finance: [
    "Lead with your most relevant credential (CPA, CFA, MBA, etc.).",
    "Quantify your experience — deal sizes, AUM, budget managed.",
    "Show you understand the firm's focus area (M&A, asset management, FP&A, etc.).",
    "Keep the tone formal and polished — finance culture is traditional.",
    "Demonstrate analytical thinking, not just experience.",
  ],
  healthcare: [
    "Mention your licensure and specialty in the opening paragraph.",
    "Highlight patient outcomes or care improvements you've contributed to.",
    "Reference specific EMR systems or clinical skills relevant to the role.",
    "Show empathy and patient-centeredness — it's not just about credentials.",
    "For leadership roles, highlight team size and any quality or compliance outcomes.",
  ],
  marketing: [
    "Open with a compelling line — you're a communicator, prove it from sentence one.",
    "Drop a key metric early: 'I grew organic traffic 3x in under a year'.",
    "Show brand awareness — reference their campaigns, voice, or positioning.",
    "Mention specific tools and channels you've worked with.",
    "Include a link to your portfolio or a relevant campaign you're proud of.",
  ],
};

const TEMPLATE: Record<Industry, string> = {
  general: `Dear [Hiring Manager's Name],

I'm excited to apply for the [Job Title] role at [Company Name]. With [X years] of experience in [your field], I've built a strong foundation in [key skill or area] and am eager to bring that to your team.

In my previous role at [Previous Company], I [specific achievement or responsibility]. This experience taught me [relevant insight], which I believe directly applies to what you're looking for in this position.

I'm drawn to [Company Name] because [specific reason — mission, product, culture, growth]. I'd love the opportunity to contribute to [specific team goal or company initiative].

Thank you for your time and consideration. I'd welcome the chance to discuss how my background fits the role.

Sincerely,
[Your Name]`,

  tech: `Dear [Hiring Manager's Name],

I'm applying for the [Job Title] position at [Company Name]. I'm a [role, e.g. full-stack engineer] with [X years] of experience building [relevant type of product], and I'm particularly excited about [specific thing about the company or product].

At [Previous Company], I [specific technical achievement — include stack and impact]. I thrive in [type of environment] and enjoy [relevant aspect of the work, e.g. solving infrastructure problems, shipping fast, etc.].

I've explored [Company Name]'s [product/engineering blog/GitHub] and I'm impressed by [specific technical detail]. I'd love to bring my experience with [key skill] to your team.

Happy to share more about my work — my portfolio is at [link].

Best,
[Your Name]`,

  finance: `Dear [Hiring Manager's Name],

I am writing to express my interest in the [Job Title] position at [Company Name]. I bring [X years] of experience in [area, e.g. investment banking, FP&A, asset management] and hold [relevant credential, e.g. CPA, CFA Level II].

In my current role at [Previous Company], I [specific achievement — include numbers, deal sizes, or scope]. I have developed strong expertise in [key skill, e.g. financial modeling, due diligence, variance analysis], which I am confident will add immediate value to your team.

[Company Name]'s focus on [specific area — e.g. middle market M&A, ESG investing] aligns closely with my experience and professional interests. I am eager to contribute to your continued success.

I would welcome the opportunity to discuss how my background fits your needs.

Sincerely,
[Your Name]`,

  healthcare: `Dear [Hiring Manager's Name],

I am interested in the [Job Title] position at [Facility/Organization Name]. As a licensed [credential, e.g. RN, BSN] with [X years] of experience in [specialty, e.g. critical care, pediatrics, surgical services], I am committed to delivering high-quality, patient-centered care.

In my current role at [Previous Employer], I [specific achievement — patient outcomes, process improvement, team leadership]. I am proficient in [EMR system, e.g. Epic, Cerner] and have experience working with [patient population or care setting].

I am drawn to [Facility Name] because of your reputation for [specific quality — e.g. Magnet status, community care, innovation in care delivery]. I would be proud to contribute to your team's mission.

Thank you for considering my application. I look forward to speaking with you.

Sincerely,
[Your Name]`,

  marketing: `Dear [Hiring Manager's Name],

When I saw the [Job Title] opening at [Company Name], I knew I had to apply. I've spent the last [X years] helping [type of company] grow through [key channel or skill — e.g. content-led SEO, performance marketing, brand storytelling], and I'm excited by what your team is building.

At [Previous Company], I [specific achievement with a metric — e.g. grew email list by 60%, reduced CAC by 25%, led a rebrand that increased NPS by 18 points]. I bring a mix of creative thinking and analytical rigor, and I'm comfortable working across [channels or tools].

I've followed [Company Name] for a while — particularly [specific campaign, product launch, or piece of content]. Your approach to [brand voice, growth strategy, etc.] resonates with how I think about marketing.

I'd love to chat. My portfolio is at [link].

Best,
[Your Name]`,
};

export default function CoverLetter() {
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState<Industry>("general");
  const [copied, setCopied] = useState(false);
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

  function handleCopy() {
    navigator.clipboard.writeText(TEMPLATE[industry]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Cover Letter</h1>
            <button
              disabled
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#F3F4F6", color: "#9CA3AF", fontSize: 14, borderRadius: 10, border: "1px solid #E5E7EB", cursor: "not-allowed", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
            >
              🔒 AI Cover Letter Review — Upgrade to Pro
            </button>
          </div>
        </nav>

        <section style={{ padding: "32px 40px", maxWidth: 860 }}>

          {/* Industry selector */}
          <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 14 }}>Select your industry to get a tailored template and tips</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.value}
                  onClick={() => setIndustry(ind.value)}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>

            {/* Tips */}
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>
                Tips for {INDUSTRIES.find(i => i.value === industry)?.label}
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {TIPS[industry].map(tip => (
                  <li key={tip} style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Template */}
            <div style={{ background: "#fff", border: "1px solid #E5E3DD", borderRadius: 16, padding: "24px 28px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif" }}>Template</h2>
                <button
                  onClick={handleCopy}
                  style={{ fontSize: 12, padding: "6px 14px", background: copied ? "#059669" : "#EBF0F8", color: copied ? "#fff" : "#2D4878", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}
                >
                  {copied ? "Copied!" : "Copy template"}
                </button>
              </div>
              <pre style={{ fontSize: 12, color: "#4A4A4A", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, flex: 1, overflowY: "auto", maxHeight: 320 }}>
                {TEMPLATE[industry]}
              </pre>
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: "#EBF0F8", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>Done? Save your cover letter to your Document Vault.</p>
              <p style={{ fontSize: 13, color: "#4A4A4A", fontFamily: "system-ui, sans-serif" }}>Keep all your application documents in one place.</p>
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
