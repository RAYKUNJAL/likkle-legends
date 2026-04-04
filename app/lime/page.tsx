import { useState } from "react";

const G = {
  bg: "#07090F", surface: "#0D1320", surface2: "#121B2E", border: "rgba(255,255,255,0.07)",
  text: "#EEF2FF", muted: "#6B7FA3", accent: "#FFD23F",
};

const MARKETPLACE_ITEMS = [
  {
    id: 1, title: "Caribbean Spice Starter Kit", seller: "Tanty Spice", price: "$24.99",
    category: "Educational", rating: 4.9, sales: 1230, icon: "🍲"
  },
  {
    id: 2, title: "Island Adventure Bundle", seller: "Mango Moko", price: "$34.99",
    category: "Games", rating: 4.8, sales: 892, icon: "🏝️"
  },
  {
    id: 3, title: "Cultural Stories Collection", seller: "Nova Hibiscus", price: "$19.99",
    category: "Content", rating: 5.0, sales: 2104, icon: "📚"
  },
  {
    id: 4, title: "Music & Rhythm Pack", seller: "Soca Brightwater", price: "$29.99",
    category: "Audio", rating: 4.7, sales: 567, icon: "🎵"
  },
];

export default function LimeMarketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredItems = MARKETPLACE_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #07090F; font-family: 'Inter', sans-serif; color: #EEF2FF; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: G.bg, padding: "40px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 40, animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, color: G.text, marginBottom: 8 }}>
              🍋 The Lime Marketplace
            </h1>
            <p style={{ fontSize: 16, color: G.muted, maxWidth: 600, lineHeight: 1.6 }}>
              Discover Caribbean-inspired educational content, games, and resources created by our creator community. Every purchase supports Caribbean storytelling.
            </p>
          </div>

          {/* Search & Filter */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
            <div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search marketplace..."
                style={{
                  width: "100%", padding: "12px 16px", background: G.surface2, border: `1px solid ${G.border}`,
                  borderRadius: 10, color: G.text, fontSize: 14, outline: "none", fontFamily: "inherit"
                }}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "12px 16px", background: G.surface2, border: `1px solid ${G.border}`,
                borderRadius: 10, color: G.text, fontSize: 14, outline: "none", fontFamily: "inherit"
              }}
            >
              <option value="all">All Categories</option>
              <option value="Educational">Educational</option>
              <option value="Games">Games</option>
              <option value="Content">Content</option>
              <option value="Audio">Audio</option>
            </select>
          </div>

          {/* Marketplace Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {filteredItems.map(item => (
              <div key={item.id} style={{
                background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12,
                padding: 16, display: "flex", flexDirection: "column", gap: 12,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = G.accent + "66";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "100%", height: 120, background: `linear-gradient(135deg, ${G.accent}22, ${G.accent}08)`,
                  borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 40
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.text, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: G.muted }}>by {item.seller}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: G.accent }}>{item.price}</div>
                  <div style={{ fontSize: 11, color: G.muted }}>⭐ {item.rating}</div>
                </div>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await fetch('/api/marketplace/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_id: item.id, payment_method: 'stripe' }),
                      });
                      const data = await res.json();
                      if (data.client_secret) {
                        window.location.href = `/checkout?order_id=${data.order_id}&client_secret=${data.client_secret}`;
                      }
                    } catch (err) {
                      alert('Checkout failed');
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                  style={{
                    width: "100%", padding: 10, background: G.accent, border: "none",
                    borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 12,
                    cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Processing..." : "Buy Now"}
                </button>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: G.muted }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
              <div>No items found. Try a different search or category!</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
