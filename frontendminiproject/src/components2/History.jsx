import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const SEVERITY_CONFIG = {
  HIGH:   { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "🔴" },
  MEDIUM: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: "🟡" },
  LOW:    { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", icon: "🟢" },
};

function History() {
  const navigate = useNavigate();
  const [history, setHistory]               = useState([]);   // always an array
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [expandedId, setExpandedId]         = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/history")   // FIXED: added /api
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // FIXED: always set an array, even if server returns something unexpected
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        setError("Failed to load history. Make sure the backend is running.");
        setHistory([]);   // FIXED: reset to array so .filter() never crashes
        setLoading(false);
      });
  }, []);

  // FIXED: useMemo so filtered is always derived from a guaranteed array
  const filtered = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history.filter((item) => {
      const matchSearch =
        (item.symptoms || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.predictedDisease || "").toLowerCase().includes(search.toLowerCase());
      const matchSeverity =
        filterSeverity === "ALL" || (item.severity || "LOW") === filterSeverity;
      return matchSearch && matchSeverity;
    });
  }, [history, search, filterSeverity]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const totalHigh   = history.filter((h) => h.severity === "HIGH").length;
  const totalMedium = history.filter((h) => h.severity === "MEDIUM").length;
  const totalLow    = history.filter((h) => (h.severity || "LOW") === "LOW").length;

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={{ fontSize: 22 }}>🩺</span>
          <span style={styles.navTitle}>MediScan</span>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate("/image")}>Image Scan</button>
          <button style={{ ...styles.navBtn, ...styles.navBtnActive }}>History</button>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Prediction History</h1>
            <p style={styles.pageSubtitle}>All your past disease predictions in one place</p>
          </div>
          <button style={styles.newCheckBtn} onClick={() => navigate("/dashboard")}>
            + New Prediction
          </button>
        </div>

        {/* Stats row */}
        {!loading && history.length > 0 && (
          <div style={styles.statsRow}>
            {[
              { label: "Total Predictions", value: history.length, icon: "🔬", color: "#6366f1" },
              { label: "High Risk",         value: totalHigh,       icon: "🔴", color: "#ef4444" },
              { label: "Medium Risk",       value: totalMedium,     icon: "🟡", color: "#f59e0b" },
              { label: "Low Risk",          value: totalLow,        icon: "🟢", color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {!loading && history.length > 0 && (
          <div style={styles.filtersRow}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search by symptom or disease..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} style={styles.clearBtn}>×</button>
              )}
            </div>
            <div style={styles.filterBtns}>
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  style={{
                    ...styles.filterBtn,
                    ...(filterSeverity === sev ? styles.filterBtnActive : {}),
                  }}
                  onClick={() => setFilterSeverity(sev)}
                >
                  {sev === "ALL" ? "All" : `${SEVERITY_CONFIG[sev].icon} ${sev}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.centerBox}>
            <div style={styles.loadingOrb} />
            <p style={styles.loadingText}>Loading your history...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Empty state — no predictions at all */}
        {!loading && !error && history.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 56, marginBottom: "1rem" }}>📋</div>
            <h3 style={styles.emptyTitle}>No predictions yet</h3>
            <p style={styles.emptyText}>
              Your prediction history will appear here once you run your first symptom check.
            </p>
            <button style={styles.newCheckBtn} onClick={() => navigate("/dashboard")}>
              Start Your First Check →
            </button>
          </div>
        )}

        {/* No results after search/filter */}
        {!loading && history.length > 0 && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>🔎</div>
            <h3 style={styles.emptyTitle}>No matching records</h3>
            <p style={styles.emptyText}>Try a different search term or filter.</p>
          </div>
        )}

        {/* History cards */}
        {!loading && filtered.length > 0 && (
          <div style={styles.cardList}>
            {filtered.map((item, i) => {
              const sev    = SEVERITY_CONFIG[item.severity || "LOW"];
              // FIXED: use item.id as stable key so expand state survives filter changes
              const itemId = item.id ?? i;
              const isOpen = expandedId === itemId;
              const symptoms = (item.symptoms || item.symptomsEntered || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              return (
                <div
                  key={itemId}
                  style={{
                    ...styles.historyCard,
                    borderLeft: `4px solid ${sev.color}`,
                    animation: `slideUp 0.4s ease ${i * 0.05}s both`,
                  }}
                >
                  {/* Card header */}
                  <div style={styles.cardTopRow}>
                    <div style={styles.cardLeft}>
                      <div style={{ ...styles.severityDot, background: sev.color }} />
                      <div>
                        <h3 style={styles.diseaseName}>
                          {item.predictedDisease || item.disease || "Unknown Disease"}
                        </h3>
                        <span style={styles.dateText}>
                          {formatDate(item.predictionDate || item.date)}
                        </span>
                      </div>
                    </div>
                    <div style={styles.cardRight}>
                      <span
                        style={{
                          ...styles.severityBadge,
                          background: sev.bg,
                          color: sev.color,
                          border: `1px solid ${sev.border}`,
                        }}
                      >
                        {sev.icon} {item.severity || "LOW"} Risk
                      </span>
                      {item.confidenceScore != null && (
                        <span style={styles.confidencePill}>
                          {Number(item.confidenceScore).toFixed(1)}% match
                        </span>
                      )}
                      <button
                        style={styles.expandBtn}
                        onClick={() => setExpandedId(isOpen ? null : itemId)}
                      >
                        {isOpen ? "▲ Less" : "▼ More"}
                      </button>
                    </div>
                  </div>

                  {/* Symptom chips */}
                  <div style={styles.symptomChips}>
                    {symptoms.slice(0, isOpen ? symptoms.length : 5).map((s, j) => (
                      <span key={j} style={styles.chip}>{s}</span>
                    ))}
                    {!isOpen && symptoms.length > 5 && (
                      <span style={styles.moreChip}>+{symptoms.length - 5} more</span>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={styles.expandedSection}>
                      <div style={styles.detailGrid}>
                        <div style={styles.detailCard}>
                          <div style={styles.detailCardHeader}>
                            <span>🛡️</span>
                            <strong style={styles.detailCardTitle}>Precautions</strong>
                          </div>
                          <p style={styles.detailCardText}>
                            {item.precautions || "Consult a doctor."}
                          </p>
                        </div>
                        {item.specialistType && (
                          <div style={styles.detailCard}>
                            <div style={styles.detailCardHeader}>
                              <span>👨‍⚕️</span>
                              <strong style={styles.detailCardTitle}>Consult</strong>
                            </div>
                            <p style={styles.detailCardText}>{item.specialistType}</p>
                          </div>
                        )}
                        {(item.age || item.gender) && (
                          <div style={styles.detailCard}>
                            <div style={styles.detailCardHeader}>
                              <span>👤</span>
                              <strong style={styles.detailCardTitle}>Patient</strong>
                            </div>
                            <p style={styles.detailCardText}>
                              {item.age ? `Age: ${item.age}` : ""}
                              {item.age && item.gender ? " · " : ""}
                              {item.gender || ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p style={styles.resultCount}>
            Showing {filtered.length} of {history.length} record
            {history.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.05); }
          66%      { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative", overflow: "hidden",
  },
  blob1: {
    position: "fixed", top: "-80px", left: "-80px",
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
    animation: "blob 8s ease-in-out infinite", pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-100px", right: "-60px",
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
    animation: "blob 10s ease-in-out infinite 2s", pointerEvents: "none",
  },
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 2rem",
    background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky", top: 0, zIndex: 100,
  },
  navBrand: { display: "flex", alignItems: "center", gap: 10 },
  navTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 20,
    fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
  },
  navLinks: { display: "flex", alignItems: "center", gap: 8 },
  navBtn: {
    background: "transparent", border: "none",
    color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500,
    padding: "8px 14px", borderRadius: 8, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  navBtnActive: {
    color: "#fff", background: "rgba(99,102,241,0.25)",
    border: "1px solid rgba(99,102,241,0.4)",
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171", fontSize: 14, fontWeight: 600,
    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: { padding: "2rem", maxWidth: 900, margin: "0 auto" },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "1.75rem",
  },
  pageTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 32,
    fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6,
  },
  pageSubtitle: { color: "rgba(255,255,255,0.55)", fontSize: 15 },
  newCheckBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 18px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Syne', sans-serif",
    whiteSpace: "nowrap", alignSelf: "center",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
  },
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: 12, marginBottom: "1.5rem",
  },
  statCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14, padding: "1rem 1.25rem",
    display: "flex", alignItems: "center", gap: 12,
  },
  statValue: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 26, fontWeight: 800, lineHeight: 1,
  },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 },
  filtersRow: {
    display: "flex", gap: 12, alignItems: "center",
    marginBottom: "1.5rem", flexWrap: "wrap",
  },
  searchWrap: {
    flex: 1, minWidth: 200,
    display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, padding: "0 12px",
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1, background: "none", border: "none", outline: "none",
    color: "#fff", fontSize: 14, padding: "10px 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: {
    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
    fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0,
  },
  filterBtns: { display: "flex", gap: 8 },
  filterBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)", borderRadius: 8,
    padding: "8px 14px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    background: "rgba(99,102,241,0.25)",
    border: "1px solid rgba(99,102,241,0.5)",
    color: "#fff",
  },
  centerBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "4rem 0",
  },
  loadingOrb: {
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#ec4899)",
    animation: "pulse 1.5s ease-in-out infinite", marginBottom: "1rem",
  },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  errorBanner: {
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: 10, padding: "12px 16px",
    color: "#dc2626", fontSize: 14, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: "1.5rem",
  },
  emptyState: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16, padding: "3rem", textAlign: "center",
  },
  emptyTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8,
  },
  emptyText: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: "1.5rem" },
  cardList: { display: "flex", flexDirection: "column", gap: 14 },
  historyCard: {
    background: "rgba(255,255,255,0.97)",
    borderRadius: 14, padding: "1.25rem 1.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },
  cardTopRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "0.875rem",
    flexWrap: "wrap", gap: 8,
  },
  cardLeft: { display: "flex", alignItems: "center", gap: 12 },
  severityDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4 },
  diseaseName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 3,
  },
  dateText: { fontSize: 12, color: "#9ca3af" },
  cardRight: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  severityBadge: {
    fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
  },
  confidencePill: {
    background: "#f1f5f9", color: "#475569",
    borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600,
  },
  expandBtn: {
    background: "none", border: "1px solid #e5e7eb",
    borderRadius: 8, padding: "4px 12px",
    fontSize: 12, fontWeight: 600, color: "#6366f1",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  symptomChips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    background: "#f1f5f9", color: "#475569",
    borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 500,
  },
  moreChip: {
    background: "#eef2ff", color: "#6366f1",
    borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700,
  },
  expandedSection: {
    marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9",
  },
  detailGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10,
  },
  detailCard: {
    background: "#f9fafb", borderRadius: 10,
    padding: "0.875rem", border: "1px solid #e5e7eb",
  },
  detailCardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  detailCardTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  detailCardText: { fontSize: 13, color: "#4b5563", lineHeight: 1.6 },
  resultCount: {
    textAlign: "center", color: "rgba(255,255,255,0.3)",
    fontSize: 13, marginTop: "1.5rem", paddingBottom: "2rem",
  },
};

export default History;