"use client";

import { useState } from 'react';
import { Mail, DollarSign, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

const G = {
  bg: "#07090F", surface: "#0D1320", surface2: "#121B2E",
  border: "rgba(255,255,255,0.07)", text: "#EEF2FF",
  muted: "#6B7FA3", accent: "#FFD23F", primary: "#2EC4B6"
};

export default function AffiliatesPage() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', paypal_email: '', instagram: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const benefits = [
    { icon: <DollarSign size={24} />, title: "Earn Commission", desc: "Earn 5-15% commission on every referral" },
    { icon: <TrendingUp size={24} />, title: "Track Performance", desc: "Real-time dashboard to monitor sales" },
    { icon: <Users size={24} />, title: "Community", desc: "Join our growing Caribbean creator network" },
    { icon: <Mail size={24} />, title: "Support", desc: "Dedicated affiliate marketing support" },
  ];

  const tiers = [
    { level: "Starter", commission: "5%", requirement: "$0+", perks: ["Basic dashboard", "Monthly payouts"] },
    { level: "Growth", commission: "10%", requirement: "10 referrals/month", perks: ["Advanced analytics", "Priority support", "Co-marketing"] },
    { level: "Elite", commission: "15%", requirement: "50 referrals/month", perks: ["Custom assets", "Dedicated manager", "Exclusive events"] },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, submit to backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { background: ${G.bg}; font-family: 'Inter', sans-serif; color: ${G.text}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: G.bg, padding: "40px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 60, animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800, marginBottom: 16, color: G.text }}>
              🌴 Become a Likkle Legends Affiliate
            </h1>
            <p style={{ fontSize: 18, color: G.muted, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Partner with us to share Caribbean education with families worldwide. Earn commission on every referral.
            </p>
          </div>

          {/* Benefits Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 60 }}>
            {benefits.map((b, i) => (
              <div key={i} style={{
                background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12,
                padding: 24, textAlign: "center"
              }}>
                <div style={{ color: G.primary, marginBottom: 12 }}>{b.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: G.muted }}>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Commission Tiers */}
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>Earn More as You Grow</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {tiers.map((tier, i) => (
                <div key={i} style={{
                  background: G.surface, border: `2px solid ${G.accent}`,
                  borderRadius: 12, padding: 24, position: "relative"
                }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: G.accent, marginBottom: 4 }}>
                    {tier.commission}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{tier.level}</h3>
                  <p style={{ fontSize: 12, color: G.muted, marginBottom: 16 }}>{tier.requirement}</p>
                  <ul style={{ listStyle: "none", gap: 8, display: "flex", flexDirection: "column" }}>
                    {tier.perks.map((p, j) => (
                      <li key={j} style={{ fontSize: 13, color: G.muted, display: "flex", gap: 8 }}>
                        <CheckCircle2 size={16} style={{ color: G.primary, flexShrink: 0 }} /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div style={{
            background: G.surface, border: `1px solid ${G.border}`,
            borderRadius: 12, padding: 32, maxWidth: 600, margin: "0 auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Apply Now</h2>
            <p style={{ fontSize: 13, color: G.muted, marginBottom: 24 }}>
              Complete the form below. We'll review your application and get back to you within 48 hours.
            </p>

            {submitted && (
              <div style={{
                background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)",
                borderRadius: 8, padding: 16, marginBottom: 24, display: "flex", gap: 12
              }}>
                <CheckCircle2 size={20} style={{ color: "#00C853", flexShrink: 0 }} />
                <div style={{ color: "#00C853", fontSize: 13 }}>
                  <strong>Application submitted!</strong> We'll email you shortly.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Full Name", key: "full_name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "PayPal Email", key: "paypal_email", type: "email" },
                { label: "Instagram Handle (optional)", key: "instagram", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: G.muted, display: "block", marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    required={f.key !== "instagram"}
                    value={formData[f.key]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 16px", background: G.surface2,
                      border: `1px solid ${G.border}`, borderRadius: 8, color: G.text,
                      fontSize: 13, fontFamily: "inherit", outline: "none"
                    }}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{
                  padding: "14px 24px", background: G.accent, border: "none",
                  borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit", marginTop: 8
                }}
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
