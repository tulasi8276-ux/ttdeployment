import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Age group definitions
const AGE_GROUPS = [
  { key: "infant",    label: "Infant",       range: "0 – 2 yrs",   min: 0,   max: 2,   icon: "👶", color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", desc: "Newborns & toddlers" },
  { key: "child",     label: "Child",        range: "3 – 12 yrs",  min: 3,   max: 12,  icon: "🧒", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", desc: "School-age children" },
  { key: "teen",      label: "Teenager",     range: "13 – 17 yrs", min: 13,  max: 17,  icon: "🧑", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", desc: "Adolescents" },
  { key: "young",     label: "Young Adult",  range: "18 – 35 yrs", min: 18,  max: 35,  icon: "👨", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", desc: "Early adulthood" },
  { key: "adult",     label: "Middle-Aged",  range: "36 – 59 yrs", min: 36,  max: 59,  icon: "🧑‍💼", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd", desc: "Working adults" },
  { key: "senior",    label: "Senior",       range: "60 – 79 yrs", min: 60,  max: 79,  icon: "🧓", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", desc: "Elderly patients" },
  { key: "geriatric", label: "Geriatric",    range: "80+ yrs",     min: 80,  max: 999, icon: "👴", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", desc: "Very elderly patients" },
];

const SEVERITY_CONFIG = {
  HIGH:   { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  MEDIUM: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  LOW:    { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
};

function getAgeGroup(age) {
  const n = parseInt(age);
  if (isNaN(n)) return null;
  return AGE_GROUPS.find((g) => n >= g.min && n <= g.max) || null;
}

function PatientSegment() {
  const navigate = useNavigate();
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [search, setSearch]           = useState("");
  const [expandedId, setExpandedId]   = useState(null);
  const [viewMode, setViewMode]       = useState("cards"); // "cards" | "table"

  useEffect(() => {
    fetch("http://localhost:8080/api/history")
      .then((res) => { if (!res.ok) throw new Error("Server error"); return res.json(); })
      .then((data) => { setHistory(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Failed to load patient data. Make sure the backend is running."); setLoading(false); });
  }, []);

  // Group all patients by age group
  const grouped = AGE_GROUPS.reduce((acc, g) => {
    acc[g.key] = history.filter((p) => {
      const grp = getAgeGroup(p.age);
      return grp && grp.key === g.key;
    });
    return acc;
  }, {});
  grouped["unknown"] = history.filter((p) => !getAgeGroup(p.age));

  // Filtered list for selected group
  const groupPatients = selectedGroup === "ALL"
    ? history
    : selectedGroup === "unknown"
      ? grouped["unknown"]
      : grouped[selectedGroup] || [];

  const filtered = groupPatients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.predictedDisease || "").toLowerCase().includes(q) ||
      (p.symptoms || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      String(p.age || "").includes(q)
    );
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Stats per group
  const groupStats = AGE_GROUPS.map((g) => ({
    ...g,
    count: grouped[g.key]?.length || 0,
    highRisk: (grouped[g.key] || []).filter((p) => p.severity === "HIGH").length,
  }));

  const totalPatients   = history.length;
  const highRiskTotal   = history.filter((p) => p.severity === "HIGH").length;
  const mostAffectedGrp = [...groupStats].sort((a, b) => b.count - a.count)[0];

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
          <button style={styles.navBtn} onClick={() => navigate("/history")}>History</button>
          <button style={styles.navBtn} onClick={() => navigate("/profile")}>Profile</button>
          <button style={{ ...styles.navBtn, ...styles.navBtnActive }}>Age Segments</button>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Patient Age Segmentation</h1>
            <p style={styles.pageSubtitle}>Patients grouped by age category for targeted care</p>
          </div>
          <div style={styles.viewToggle}>
            <button style={{ ...styles.viewBtn, ...(viewMode === "cards" ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode("cards")}>🃏 Cards</button>
            <button style={{ ...styles.viewBtn, ...(viewMode === "table" ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode("table")}>📋 Table</button>
          </div>
        </div>

        {/* Summary stats */}
        {!loading && (
          <div style={styles.summaryRow}>
            {[
              { label: "Total Patients",     value: totalPatients,                    icon: "👥", color: "#6366f1" },
              { label: "High Risk Patients", value: highRiskTotal,                    icon: "🔴", color: "#ef4444" },
              { label: "Age Groups Active",  value: groupStats.filter(g => g.count > 0).length, icon: "📊", color: "#0ea5e9" },
              { label: "Most Affected Group", value: mostAffectedGrp?.count > 0 ? mostAffectedGrp.label : "—", icon: mostAffectedGrp?.icon || "👤", color: mostAffectedGrp?.color || "#6b7280" },
            ].map((s, i) => (
              <div key={i} style={styles.summaryCard}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <div>
                  <div style={{ ...styles.summaryValue, color: s.color }}>{s.value}</div>
                  <div style={styles.summaryLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Age group pill filter */}
        <div style={styles.groupFilter}>
          <button
            style={{ ...styles.groupPill, ...(selectedGroup === "ALL" ? styles.groupPillActive : {}) }}
            onClick={() => setSelectedGroup("ALL")}
          >
            All ({totalPatients})
          </button>
          {AGE_GROUPS.map((g) => (
            <button
              key={g.key}
              style={{
                ...styles.groupPill,
                ...(selectedGroup === g.key ? { background: g.color, color: "#fff", borderColor: g.color } : {}),
              }}
              onClick={() => setSelectedGroup(g.key)}
            >
              {g.icon} {g.label}
              <span style={{
                ...styles.groupCount,
                background: selectedGroup === g.key ? "rgba(255,255,255,0.3)" : g.bg,
                color: selectedGroup === g.key ? "#fff" : g.color,
              }}>
                {grouped[g.key]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Age group overview cards (shown only when ALL is selected) */}
        {selectedGroup === "ALL" && !loading && (
          <div style={styles.overviewGrid}>
            {groupStats.map((g) => (
              <div
                key={g.key}
                style={{ ...styles.overviewCard, borderTop: `3px solid ${g.color}`, cursor: "pointer" }}
                onClick={() => setSelectedGroup(g.key)}
              >
                <div style={styles.overviewCardTop}>
                  <div style={{ ...styles.overviewIcon, background: g.bg, color: g.color }}>
                    {g.icon}
                  </div>
                  <div>
                    <h4 style={styles.overviewLabel}>{g.label}</h4>
                    <p style={styles.overviewRange}>{g.range}</p>
                  </div>
                </div>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewStatVal, color: g.color }}>{g.count}</span>
                    <span style={styles.overviewStatLbl}>Total</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewStatVal, color: "#ef4444" }}>{g.highRisk}</span>
                    <span style={styles.overviewStatLbl}>High Risk</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewStatVal, color: "#6b7280" }}>
                      {g.count > 0 ? Math.round((g.highRisk / g.count) * 100) : 0}%
                    </span>
                    <span style={styles.overviewStatLbl}>Risk Rate</span>
                  </div>
                </div>
                {g.count > 0 && (
                  <div style={styles.overviewBar}>
                    <div style={{
                      ...styles.overviewBarFill,
                      width: `${Math.round((g.count / Math.max(totalPatients, 1)) * 100)}%`,
                      background: g.color,
                    }} />
                  </div>
                )}
                <p style={styles.overviewDesc}>{g.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + patient list */}
        {selectedGroup !== "ALL" && (
          <div>
            {/* Group header */}
            {(() => {
              const grp = AGE_GROUPS.find(g => g.key === selectedGroup);
              return grp ? (
                <div style={{ ...styles.groupHeaderBanner, background: grp.bg, borderColor: grp.border }}>
                  <span style={{ fontSize: 32 }}>{grp.icon}</span>
                  <div>
                    <h3 style={{ ...styles.groupBannerTitle, color: grp.color }}>{grp.label} Patients</h3>
                    <p style={styles.groupBannerSub}>{grp.range} · {grp.desc}</p>
                  </div>
                  <div style={styles.groupBannerStats}>
                    <span style={{ ...styles.groupBannerBadge, background: grp.color, color: "#fff" }}>
                      {grouped[grp.key]?.length || 0} patients
                    </span>
                    <span style={{ ...styles.groupBannerBadge, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                      🔴 {(grouped[grp.key] || []).filter(p => p.severity === "HIGH").length} high risk
                    </span>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Search */}
            <div style={styles.searchWrap}>
              <span>🔍</span>
              <input style={styles.searchInput}
                placeholder="Search by disease, symptom or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)} />
              {search && <button style={styles.clearBtn} onClick={() => setSearch("")}>×</button>}
            </div>

            {/* Loading */}
            {loading && (
              <div style={styles.centerBox}>
                <div style={styles.loadingOrb} />
                <p style={styles.loadingText}>Loading patients...</p>
              </div>
            )}

            {/* Error */}
            {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {AGE_GROUPS.find(g => g.key === selectedGroup)?.icon || "👤"}
                </div>
                <h3 style={styles.emptyTitle}>No patients in this group</h3>
                <p style={styles.emptyText}>No prediction records found for this age category.</p>
              </div>
            )}

            {/* Cards view */}
            {!loading && filtered.length > 0 && viewMode === "cards" && (
              <div style={styles.patientGrid}>
                {filtered.map((p, i) => {
                  const grp  = getAgeGroup(p.age);
                  const sev  = SEVERITY_CONFIG[p.severity || "LOW"];
                  const isOpen = expandedId === (p.id ?? i);
                  return (
                    <div key={p.id ?? i} style={{
                      ...styles.patientCard,
                      borderTop: `3px solid ${grp?.color || "#6366f1"}`,
                      animation: `slideUp 0.4s ease ${i * 0.04}s both`,
                    }}>
                      <div style={styles.patientCardTop}>
                        <div style={{ ...styles.ageCircle, background: grp?.bg || "#eef2ff", color: grp?.color || "#6366f1" }}>
                          <span style={{ fontSize: 20 }}>{grp?.icon || "👤"}</span>
                          <span style={styles.ageNum}>{p.age || "?"}</span>
                        </div>
                        <div style={styles.patientInfo}>
                          <h4 style={styles.patientDisease}>{p.predictedDisease || "Unknown"}</h4>
                          <p style={styles.patientMeta}>
                            {p.gender || "—"} · {formatDate(p.predictionDate)}
                          </p>
                        </div>
                        <span style={{
                          ...styles.severityPill,
                          background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
                        }}>
                          {p.severity || "LOW"}
                        </span>
                      </div>

                      {/* Symptoms */}
                      <div style={styles.sympChips}>
                        {(p.symptoms || "").split(",").filter(Boolean).slice(0, 4).map((s, j) => (
                          <span key={j} style={styles.sympChip}>{s.trim()}</span>
                        ))}
                        {(p.symptoms || "").split(",").filter(Boolean).length > 4 && (
                          <span style={styles.sympMore}>+{(p.symptoms || "").split(",").filter(Boolean).length - 4}</span>
                        )}
                      </div>

                      {/* Expand */}
                      <button style={styles.expandBtn}
                        onClick={() => setExpandedId(isOpen ? null : (p.id ?? i))}>
                        {isOpen ? "▲ Less" : "▼ More Details"}
                      </button>

                      {isOpen && (
                        <div style={styles.expandedBody}>
                          {[
                            { icon: "🛡️", label: "Precautions",  val: p.precautions },
                            { icon: "👨‍⚕️", label: "Specialist",   val: p.specialistType },
                            { icon: "📧", label: "Email",        val: p.email },
                          ].filter(r => r.val).map((row, j) => (
                            <div key={j} style={styles.detailRow}>
                              <span style={styles.detailIcon}>{row.icon}</span>
                              <div>
                                <span style={styles.detailLabel}>{row.label}</span>
                                <p style={styles.detailVal}>{row.val}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table view */}
            {!loading && filtered.length > 0 && viewMode === "table" && (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      {["Age","Group","Gender","Disease","Severity","Specialist","Date"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => {
                      const grp = getAgeGroup(p.age);
                      const sev = SEVERITY_CONFIG[p.severity || "LOW"];
                      return (
                        <tr key={p.id ?? i} style={{ ...styles.tr, background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={styles.td}>
                            <span style={{ ...styles.agePill, background: grp?.bg || "#eef2ff", color: grp?.color || "#6366f1" }}>
                              {grp?.icon} {p.age || "?"}
                            </span>
                          </td>
                          <td style={styles.td}>{grp?.label || "Unknown"}</td>
                          <td style={styles.td}>{p.gender || "—"}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{p.predictedDisease || "Unknown"}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.severityPill, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                              {p.severity || "LOW"}
                            </span>
                          </td>
                          <td style={styles.td}>{p.specialistType || "—"}</td>
                          <td style={styles.td}>{formatDate(p.predictionDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <p style={styles.resultCount}>
                Showing {filtered.length} patient{filtered.length !== 1 ? "s" : ""} in this group
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-20px) scale(1.05);} 66%{transform:translate(-20px,20px) scale(0.95);} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8;} 50%{transform:scale(1.15);opacity:1;} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
      `}</style>
    </div>
  );
}

const styles = {
  page:{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"},
  blob1:{position:"fixed",top:"-80px",left:"-80px",width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)",animation:"blob 8s ease-in-out infinite",pointerEvents:"none"},
  blob2:{position:"fixed",bottom:"-100px",right:"-60px",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%)",animation:"blob 10s ease-in-out infinite 2s",pointerEvents:"none"},
  navbar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 2rem",background:"rgba(15,23,42,0.8)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,zIndex:100},
  navBrand:{display:"flex",alignItems:"center",gap:10},
  navTitle:{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"},
  navLinks:{display:"flex",alignItems:"center",gap:8},
  navBtn:{background:"transparent",border:"none",color:"rgba(255,255,255,0.6)",fontSize:14,fontWeight:500,padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  navBtnActive:{color:"#fff",background:"rgba(99,102,241,0.25)",border:"1px solid rgba(99,102,241,0.4)"},
  logoutBtn:{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#f87171",fontSize:14,fontWeight:600,padding:"8px 16px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  content:{padding:"2rem",maxWidth:1200,margin:"0 auto"},
  pageHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem"},
  pageTitle:{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-0.5px",marginBottom:6},
  pageSubtitle:{color:"rgba(255,255,255,0.55)",fontSize:15},
  viewToggle:{display:"flex",gap:6,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:4},
  viewBtn:{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  viewBtnActive:{background:"rgba(99,102,241,0.3)",color:"#fff",border:"1px solid rgba(99,102,241,0.4)"},
  summaryRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.5rem"},
  summaryCard:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:12},
  summaryValue:{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,lineHeight:1},
  summaryLabel:{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:3},
  groupFilter:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:"1.5rem"},
  groupPill:{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",borderRadius:999,padding:"7px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8,transition:"all 0.2s"},
  groupPillActive:{background:"#6366f1",color:"#fff",borderColor:"#6366f1"},
  groupCount:{borderRadius:999,padding:"2px 8px",fontSize:11,fontWeight:700},
  overviewGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"1rem",marginBottom:"1.5rem"},
  overviewCard:{background:"rgba(255,255,255,0.97)",borderRadius:14,padding:"1.25rem",boxShadow:"0 4px 20px rgba(0,0,0,0.25)",transition:"transform 0.2s"},
  overviewCardTop:{display:"flex",alignItems:"center",gap:10,marginBottom:"0.875rem"},
  overviewIcon:{width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
  overviewLabel:{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#0f172a"},
  overviewRange:{fontSize:11,color:"#9ca3af",marginTop:1},
  overviewStats:{display:"flex",gap:12,marginBottom:8},
  overviewStat:{display:"flex",flexDirection:"column",alignItems:"center"},
  overviewStatVal:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,lineHeight:1},
  overviewStatLbl:{fontSize:10,color:"#9ca3af",marginTop:2},
  overviewBar:{height:4,background:"#f1f5f9",borderRadius:999,overflow:"hidden",marginBottom:8},
  overviewBarFill:{height:"100%",borderRadius:999,transition:"width 0.8s ease"},
  overviewDesc:{fontSize:11,color:"#9ca3af"},
  groupHeaderBanner:{display:"flex",alignItems:"center",gap:16,borderRadius:14,padding:"1.25rem 1.5rem",border:"1.5px solid",marginBottom:"1.25rem"},
  groupBannerTitle:{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,marginBottom:2},
  groupBannerSub:{fontSize:13,color:"#6b7280"},
  groupBannerStats:{marginLeft:"auto",display:"flex",gap:8},
  groupBannerBadge:{borderRadius:999,padding:"5px 14px",fontSize:12,fontWeight:700},
  searchWrap:{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"0 14px",marginBottom:"1.25rem"},
  searchInput:{flex:1,background:"none",border:"none",outline:"none",color:"#fff",fontSize:14,padding:"11px 0",fontFamily:"'DM Sans',sans-serif"},
  clearBtn:{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer",lineHeight:1,padding:0},
  centerBox:{display:"flex",flexDirection:"column",alignItems:"center",padding:"4rem 0"},
  loadingOrb:{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#ec4899)",animation:"pulse 1.5s ease-in-out infinite",marginBottom:"1rem"},
  loadingText:{color:"rgba(255,255,255,0.5)",fontSize:15},
  errorBanner:{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"14px 16px",color:"#dc2626",fontSize:14,fontWeight:500,marginBottom:"1.25rem"},
  emptyState:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"3rem",textAlign:"center"},
  emptyTitle:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#fff",marginBottom:8},
  emptyText:{color:"rgba(255,255,255,0.5)",fontSize:14},
  patientGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem"},
  patientCard:{background:"rgba(255,255,255,0.97)",borderRadius:14,padding:"1.25rem",boxShadow:"0 4px 20px rgba(0,0,0,0.25)",display:"flex",flexDirection:"column",gap:"0.875rem"},
  patientCardTop:{display:"flex",alignItems:"center",gap:12},
  ageCircle:{width:52,height:52,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0},
  ageNum:{fontSize:11,fontWeight:800,lineHeight:1},
  patientInfo:{flex:1},
  patientDisease:{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:2},
  patientMeta:{fontSize:12,color:"#9ca3af"},
  severityPill:{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:999},
  sympChips:{display:"flex",flexWrap:"wrap",gap:5},
  sympChip:{background:"#f1f5f9",color:"#475569",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:500},
  sympMore:{background:"#eef2ff",color:"#6366f1",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700},
  expandBtn:{background:"none",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,color:"#6366f1",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  expandedBody:{display:"flex",flexDirection:"column",gap:10,paddingTop:10,borderTop:"1px solid #f1f5f9"},
  detailRow:{display:"flex",alignItems:"flex-start",gap:10},
  detailIcon:{fontSize:14,marginTop:1,flexShrink:0},
  detailLabel:{fontSize:11,color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:2},
  detailVal:{fontSize:13,color:"#374151",lineHeight:1.5},
  tableWrap:{background:"rgba(255,255,255,0.97)",borderRadius:14,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"},
  table:{width:"100%",borderCollapse:"collapse"},
  thead:{background:"#f8fafc"},
  th:{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:"1px solid #e5e7eb"},
  tr:{borderBottom:"1px solid #f1f5f9"},
  td:{padding:"12px 16px",fontSize:13,color:"#374151"},
  agePill:{borderRadius:999,padding:"3px 10px",fontSize:12,fontWeight:700},
  resultCount:{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:13,marginTop:"1.5rem",paddingBottom:"2rem"},
};

export default PatientSegment;