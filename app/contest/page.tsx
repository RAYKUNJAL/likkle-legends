import { useState, useRef, useEffect, useCallback } from "react";

// ─── ISSUE TRACKER DATA ──────────────────────────────────────────────────────
const ISSUES = [
  {
    id: 1, severity: "CRITICAL", status: "open",
    title: "Admin Login – No Access",
    area: "Auth", owner: "Reef",
    detail: "Ray cannot find or access the admin panel. Route is /admin. Auth guard added in commit 5616328 but admin role may not be set in Supabase profiles table.",
    fix: `-- Run in Supabase SQL editor:\nUPDATE profiles SET role = 'admin'\nWHERE email = 'YOUR_EMAIL@example.com';\n\n-- Then navigate to: https://www.likklelegends.com/admin\n-- Login URL: https://www.likklelegends.com/login`,
    file: "app/admin/layout.tsx + Supabase profiles table"
  },
];

const SEVERITY_COLOR = { CRITICAL: "#FF4444", HIGH: "#FF6B35", MEDIUM: "#FFD23F", LOW: "#2EC4B6" };
const SEVERITY_BG = { CRITICAL: "rgba(255,68,68,0.1)", HIGH: "rgba(255,107,53,0.1)", MEDIUM: "rgba(255,210,63,0.1)", LOW: "rgba(46,196,182,0.1)" };

const G = {
  bg: "#070D1A",
  surface: "#0E1829",
  surface2: "#131F33",
  border: "rgba(255,255,255,0.07)",
  text: "#EEF2FF",
  muted: "#6B7FA3",
  accent: "#FFD23F",
};

function Pill({ children, color, bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
      padding: "3px 9px", borderRadius: 4,
      color, background: bg || `${color}18`,
      border: `1px solid ${color}44`,
    }}>{children}</span>
  );
}

function GameZone() {
  const GAMES = [
    { name: "Mango's Island Hop", char: "Mango Moko", type: "Geography", ages: "4-8", icon: "🏝️", color: "#00C853", status: "needs-gate", file: "island-hop.html" },
    { name: "Tanty's Kitchen", char: "Tanty Spice", type: "Cooking", ages: "3-8", icon: "🍲", color: "#FF69B4", status: "needs-gate", file: "tantys-kitchen.html" },
    { name: "R.O.T.I.'s Math Market", char: "R.O.T.I.", type: "Math", ages: "4-8", icon: "🧮", color: "#2EC4B6", status: "needs-gate", file: "math-market.html" },
    { name: "Scorcha's Spelling Blaze", char: "Scorcha Pepper", type: "Spelling", ages: "5-8", icon: "🔥", color: "#FF1744", status: "needs-gate", file: "spelling-blaze.html" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
      {GAMES.map(g => (
        <div key={g.name} style={{
          background: G.surface, border: `1px solid ${G.border}`,
          borderRadius: 12, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: `${g.color}18`,
            border: `1px solid ${g.color}33`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22, flexShrink: 0,
          }}>{g.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 4 }}>{g.name}</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 10 }}>{g.char} · {g.type} · Ages {g.ages}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill color="#FF6B35">Playing Now</Pill>
              <Pill color={g.color}>{g.file}</Pill>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContestPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #07090F; font-family: 'Inter', sans-serif; color: #EEF2FF; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ minHeight: "100vh", background: G.bg, padding: "40px 28px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: G.text, letterSpacing: "-0.5px", marginBottom: 8 }}>
              🎮 Likkle Legends Contest Zone
            </h1>
            <p style={{ fontSize: 16, color: G.muted, lineHeight: 1.6, maxWidth: 600 }}>
              Play our four legendary games, earn points, and compete on the global leaderboard. Every victory counts!
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 16 }}>Available Games</h2>
              <GameZone />
            </div>

            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, padding: "24px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 12 }}>🏆 Leaderboard</h2>
              <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>
                Coming soon: Global rankings, regional champions, and special prizes every week!
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
