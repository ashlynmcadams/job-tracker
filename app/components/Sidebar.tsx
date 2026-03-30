"use client";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: "⊞" },
  { label: "Job Tracker", href: "/tracker", icon: "📋" },
  { label: "Document Vault", href: "/vault", icon: "🗂️" },
  { label: "Resume", href: "/resume", icon: "✏️" },
  { label: "Cover letter", href: "/coverletter", icon: "📝" },
  { label: "Interview prep", href: "/prep", icon: "🎯" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #E5E3DD",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 32px" }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>Valt</span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 12px" }}>
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#2D4878" : "#4A4A4A",
                background: active ? "#EBF0F8" : "transparent",
                textDecoration: "none",
                fontFamily: "system-ui, sans-serif",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}