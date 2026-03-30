import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SYMPTOM_LIST = [
  "Fever","High Fever","Chills","Sweating","Cough","Sore Throat","Runny Nose",
  "Congestion","Sneezing","Headache","Body Ache","Muscle Pain","Joint Pain","Fatigue",
  "Weakness","Dizziness","Chest Pain","Shortness Of Breath","Wheezing","Nausea",
  "Vomiting","Diarrhea","Stomach Cramps","Loss Of Appetite","Frequent Urination",
  "Excessive Thirst","Blurred Vision","Rash","Weight Loss","Nosebleed","Pain Behind Eyes",
  "Night Sweats","Coughing Blood","Loss Of Taste","Loss Of Smell","Itching",
  "Yellow Skin","Dark Urine","Sensitivity To Light",
];

const SEVERITY_CONFIG = {
  HIGH:   { color:"#ef4444", bg:"#fef2f2", border:"#fecaca", icon:"🔴" },
  MEDIUM: { color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", icon:"🟡" },
  LOW:    { color:"#22c55e", bg:"#f0fdf4", border:"#bbf7d0", icon:"🟢" },
};

// Parse medicine string: "Paracetamol (for fever)" → name + note
function parseMedicine(med) {
  const match = med.match(/^(.+?)\s*\((.+)\)$/);
  if (match) return { name: match[1].trim(), note: match[2].trim() };
  return { name: med.trim(), note: "" };
}

function Dashboard() {
  const navigate = useNavigate();

  const [patientName, setPatientName]     = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [age, setAge]                     = useState("");
  const [gender, setGender]               = useState("");
  const [symptomSearch, setSymptomSearch] = useState("");

  const [disease, setDisease]             = useState("");
  const [precautions, setPrecautions]     = useState("");
  const [severity, setSeverity]           = useState("");
  const [specialist, setSpecialist]       = useState("");
  const [confidence, setConfidence]       = useState(null);
  const [medicines, setMedicines]         = useState([]);
  const [symptomCauses, setSymptomCauses] = useState({});
  const [openCause, setOpenCause]         = useState(null);

  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [hasResult, setHasResult]         = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("patientProfile");
    if (saved) {
      const p = JSON.parse(saved);
      if (p.fullName) setPatientName(p.fullName);
      if (p.age)      setAge(p.age);
      if (p.gender)   setGender(p.gender === "Male" ? "MALE" : p.gender === "Female" ? "FEMALE" : p.gender);
    }
  }, []);

  const toggleSymptom = (sym) =>
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );

  const filteredSymptoms = SYMPTOM_LIST.filter((s) =>
    s.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  const predictDisease = async () => {
    if (selectedSymptoms.length === 0) { setError("Please select at least one symptom."); return; }
    if (!age || !gender)               { setError("Please fill in your age and gender."); return; }
    setError(""); setLoading(true); setHasResult(false);
    setMedicines([]); setSymptomCauses({});

    try {
      const res = await fetch("http://localhost:8080/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms.map((s) => s.toLowerCase()).join(","),
          age, gender,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setDisease(data.predictedDisease   || "Unknown");
      setPrecautions(data.precautions    || "Consult a doctor.");
      setSeverity(data.severity          || "LOW");
      setSpecialist(data.specialistType  || "General Physician");
      setConfidence(data.confidenceScore ?? null);
      setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
      setSymptomCauses(data.symptomCauses || {});
      setHasResult(true);
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sev = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={{ fontSize:22 }}>🩺</span>
          <span style={styles.navTitle}>MediScan</span>
        </div>
        <div style={styles.navLinks}>
          <button style={{ ...styles.navBtn, ...styles.navBtnActive }}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate("/image")}>Image Scan</button>
          <button style={styles.navBtn} onClick={() => navigate("/history")}>History</button>
          <button style={styles.navBtn} onClick={() => navigate("/profile")}>👤 Profile</button>
          <button style={styles.navBtn} onClick={() => navigate("/segments")}>📊 Age Segments</button>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
        </div>
      </nav>

      {patientName && (
        <div style={styles.welcomeBanner}>
          <span style={{ fontSize:18 }}>👋</span>
          <span>Welcome, <strong>{patientName}</strong>!</span>
          <button style={styles.viewProfileBtn} onClick={() => navigate("/profile")}>View Profile →</button>
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Disease Prediction</h1>
          <p style={styles.pageSubtitle}>Select your symptoms and let MediScan identify the most likely condition</p>
        </div>

        <div style={styles.mainGrid}>
          {/* LEFT */}
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ fontSize:22 }}>🔍</span>
                <div>
                  <h3 style={styles.cardTitle}>Select Symptoms</h3>
                  <p style={styles.cardSubtitle}>{selectedSymptoms.length} selected</p>
                </div>
              </div>
              <input style={styles.searchInput} placeholder="Search symptoms..."
                value={symptomSearch} onChange={(e) => setSymptomSearch(e.target.value)} />
              <div style={styles.symptomGrid}>
                {filteredSymptoms.map((sym) => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button key={sym} onClick={() => toggleSymptom(sym)}
                      style={{ ...styles.symptomChip, ...(active ? styles.symptomChipActive : {}) }}>
                      {active && <span style={{ fontSize:10 }}>✓ </span>}{sym}
                    </button>
                  );
                })}
              </div>
              {selectedSymptoms.length > 0 && (
                <div style={styles.selectedTags}>
                  <span style={styles.selectedLabel}>Selected:</span>
                  <div style={styles.tagRow}>
                    {selectedSymptoms.map((sym) => (
                      <span key={sym} style={styles.tag}>
                        {sym}
                        <button onClick={() => toggleSymptom(sym)} style={styles.tagRemove}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ fontSize:22 }}>👤</span>
                <div>
                  <h3 style={styles.cardTitle}>Patient Details</h3>
                  <p style={styles.cardSubtitle}>{patientName ? "Auto-filled from profile" : "Fill manually or set up your profile"}</p>
                </div>
                {!patientName && (
                  <button style={styles.setupProfileBtn} onClick={() => navigate("/profile")}>Setup Profile</button>
                )}
              </div>
              <div style={styles.detailsRow}>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Age</label>
                  <input type="number" style={styles.detailInput} placeholder="e.g. 28"
                    value={age} min={1} max={120} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Gender</label>
                  <select style={styles.detailInput} value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">-- Select --</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <div style={styles.errorBanner}><span>⚠️</span> {error}</div>}

            <button onClick={predictDisease} disabled={loading}
              style={{ ...styles.predictBtn, ...(loading ? styles.predictBtnLoading : {}) }}>
              {loading
                ? <span style={styles.spinnerWrap}><span style={styles.spinner} /> Analysing symptoms...</span>
                : <span>🔬 Predict Disease</span>}
            </button>

            <div style={styles.quickNav}>
              {[
                { icon:"🖼️", label:"Image Scan",       path:"/image" },
                { icon:"📋", label:"View History",      path:"/history" },
                { icon:"🏥", label:"Nearby Hospitals",  path:"/profile" },
                { icon:"📊", label:"Age Segments",      path:"/segments" },
              ].map((btn) => (
                <button key={btn.path} style={styles.quickNavBtn} onClick={() => navigate(btn.path)}>
                  <span style={{ fontSize:18 }}>{btn.icon}</span>
                  <span style={styles.quickNavLabel}>{btn.label}</span>
                  <span style={styles.quickNavArrow}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={styles.rightCol}>
            {!hasResult && !loading && (
              <div style={styles.emptyResult}>
                <div style={{ fontSize:52, marginBottom:"1rem" }}>🩺</div>
                <h3 style={styles.emptyTitle}>No prediction yet</h3>
                <p style={styles.emptyText}>Select symptoms and click <strong>Predict Disease</strong>.</p>
                <div style={styles.emptySteps}>
                  {["Select symptoms","Enter age & gender","Click Predict"].map((step, i) => (
                    <div key={i} style={styles.emptyStep}>
                      <div style={styles.emptyStepNum}>{i + 1}</div>
                      <span style={styles.emptyStepText}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div style={styles.loadingCard}>
                <div style={styles.loadingOrb} />
                <h3 style={styles.loadingTitle}>Analysing your symptoms...</h3>
                <p style={styles.loadingText}>Matching {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} against our database</p>
                <div style={styles.loadingDots}>
                  {[0,1,2].map((i) => <div key={i} style={{ ...styles.dot, animationDelay:`${i * 0.2}s` }} />)}
                </div>
              </div>
            )}

            {hasResult && !loading && (
              <div style={{ animation:"slideUp 0.5s ease" }}>

                {/* Disease result */}
                <div style={{ ...styles.resultHero, borderColor:sev.border, background:sev.bg }}>
                  <div style={styles.resultTopRow}>
                    <span style={styles.resultBadge}>Prediction Result</span>
                    <span style={{ ...styles.severityBadge, background:sev.bg, color:sev.color, border:`1px solid ${sev.border}` }}>
                      {sev.icon} {severity} Risk
                    </span>
                  </div>
                  <h2 style={{ ...styles.diseaseName, color:sev.color }}>{disease}</h2>
                  {confidence !== null && (
                    <div>
                      <div style={styles.confidenceRow}>
                        <span style={styles.confidenceLabel}>Confidence Score</span>
                        <span style={{ ...styles.confidenceValue, color:sev.color }}>{Number(confidence).toFixed(1)}%</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width:`${confidence}%`, background:sev.color }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Precautions + Specialist */}
                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoCardHeader}><span>🛡️</span><h4 style={styles.infoCardTitle}>Precautions</h4></div>
                    <p style={styles.infoCardText}>{precautions}</p>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoCardHeader}><span>👨‍⚕️</span><h4 style={styles.infoCardTitle}>Consult</h4></div>
                    <p style={styles.infoCardText}>{specialist}</p>
                  </div>
                </div>

                {/* ── MEDICINE SUGGESTIONS ── */}
                {medicines.length > 0 && (
                  <div style={styles.medicineSection}>
                    <div style={styles.medicineSectionHeader}>
                      <span style={{ fontSize:20 }}>💊</span>
                      <div>
                        <h3 style={styles.medicineSectionTitle}>Suggested Medicines</h3>
                        <p style={styles.medicineSectionSub}>
                          Always consult your doctor before taking any medication
                        </p>
                      </div>
                    </div>

                    <div style={styles.medicineWarning}>
                      ⚠️ These are general suggestions only. Do not self-medicate. Prescription medicines marked below require a doctor's prescription.
                    </div>

                    <div style={styles.medicineGrid}>
                      {medicines.map((med, i) => {
                        const { name, note } = parseMedicine(med);
                        const isPrescription = note.toLowerCase().includes("prescription");
                        const isHospital     = note.toLowerCase().includes("hospital");
                        return (
                          <div key={i} style={{
                            ...styles.medicineCard,
                            borderLeft: `3px solid ${isPrescription ? "#f59e0b" : isHospital ? "#ef4444" : "#22c55e"}`,
                          }}>
                            <div style={styles.medicineCardTop}>
                              <div style={{
                                ...styles.medicineIcon,
                                background: isPrescription ? "#fffbeb" : isHospital ? "#fef2f2" : "#f0fdf4",
                                color:      isPrescription ? "#d97706"  : isHospital ? "#dc2626"  : "#16a34a",
                              }}>
                                {isHospital ? "🏥" : isPrescription ? "📋" : "💊"}
                              </div>
                              <div style={styles.medicineInfo}>
                                <h4 style={styles.medicineName}>{name}</h4>
                                {isPrescription && (
                                  <span style={styles.rxBadge}>Rx Required</span>
                                )}
                                {isHospital && (
                                  <span style={{ ...styles.rxBadge, background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" }}>
                                    Hospital Only
                                  </span>
                                )}
                              </div>
                            </div>
                            {note && (
                              <p style={styles.medicineNote}>{note}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nearby hospitals */}
                <button style={styles.nearbyHospBtn} onClick={() => navigate("/profile")}>
                  🏥 Find Nearby Hospitals for {specialist}
                </button>

                {/* Symptom causes */}
                {Object.keys(symptomCauses).length > 0 && (
                  <div style={styles.causesSection}>
                    <div style={styles.causesSectionHeader}>
                      <span style={{ fontSize:20 }}>🤔</span>
                      <h3 style={styles.causesSectionTitle}>Why do you have these symptoms?</h3>
                    </div>
                    <p style={styles.causesSectionSubtitle}>Click on any symptom to understand what causes it</p>
                    {Object.entries(symptomCauses).map(([symptom, causes]) => {
                      const isOpen = openCause === symptom;
                      return (
                        <div key={symptom} style={styles.causeAccordion}>
                          <button style={styles.causeAccordionHeader}
                            onClick={() => setOpenCause(isOpen ? null : symptom)}>
                            <div style={styles.causeAccordionLeft}>
                              <span>🔸</span>
                              <span style={styles.causeSymptomName}>
                                {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                              </span>
                              <span style={styles.causesCount}>{causes.length} causes</span>
                            </div>
                            <span style={{ fontSize:11, color:"#6b7280", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>▼</span>
                          </button>
                          {isOpen && (
                            <div style={styles.causeAccordionBody}>
                              {causes.map((cause, i) => (
                                <div key={i} style={styles.causeItem}>
                                  <div style={styles.causeBullet}>{i + 1}</div>
                                  <p style={styles.causeText}>{cause}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <p style={styles.disclaimer}>
                  ⚠️ For informational purposes only. Not a substitute for professional medical advice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-20px) scale(1.05);} 66%{transform:translate(-20px,20px) scale(0.95);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8;} 50%{transform:scale(1.15);opacity:1;} }
        @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
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
  navLinks:{display:"flex",alignItems:"center",gap:6},
  navBtn:{background:"transparent",border:"none",color:"rgba(255,255,255,0.6)",fontSize:13,fontWeight:500,padding:"7px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  navBtnActive:{color:"#fff",background:"rgba(99,102,241,0.25)",border:"1px solid rgba(99,102,241,0.4)"},
  logoutBtn:{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#f87171",fontSize:13,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  welcomeBanner:{display:"flex",alignItems:"center",gap:12,background:"rgba(99,102,241,0.15)",borderBottom:"1px solid rgba(99,102,241,0.2)",padding:"10px 2rem",color:"rgba(255,255,255,0.9)",fontSize:14},
  viewProfileBtn:{marginLeft:"auto",background:"rgba(99,102,241,0.3)",border:"1px solid rgba(99,102,241,0.4)",color:"#a5b4fc",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"},
  content:{padding:"2rem",maxWidth:1200,margin:"0 auto"},
  pageHeader:{marginBottom:"2rem"},
  pageTitle:{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-0.5px",marginBottom:6},
  pageSubtitle:{color:"rgba(255,255,255,0.55)",fontSize:15},
  mainGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",alignItems:"start"},
  leftCol:{display:"flex",flexDirection:"column",gap:"1.25rem"},
  rightCol:{display:"flex",flexDirection:"column",gap:"1rem",position:"sticky",top:90},
  card:{background:"rgba(255,255,255,0.97)",borderRadius:16,padding:"1.5rem",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"},
  cardHeader:{display:"flex",alignItems:"flex-start",gap:12,marginBottom:"1.25rem"},
  cardTitle:{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:2},
  cardSubtitle:{fontSize:12,color:"#6b7280"},
  setupProfileBtn:{marginLeft:"auto",background:"#eef2ff",border:"1px solid #c7d2fe",color:"#6366f1",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  searchInput:{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:10,padding:"10px 14px",fontSize:14,color:"#111827",fontFamily:"'DM Sans',sans-serif",outline:"none",marginBottom:"1rem",background:"#f9fafb"},
  symptomGrid:{display:"flex",flexWrap:"wrap",gap:8,maxHeight:200,overflowY:"auto",paddingRight:4},
  symptomChip:{background:"#f1f5f9",border:"1.5px solid #e2e8f0",borderRadius:999,padding:"6px 14px",fontSize:13,fontWeight:500,color:"#475569",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  symptomChipActive:{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"1.5px solid #6366f1",color:"#fff",boxShadow:"0 2px 8px rgba(99,102,241,0.35)"},
  selectedTags:{marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid #f1f5f9"},
  selectedLabel:{fontSize:12,fontWeight:600,color:"#6b7280",marginBottom:6,display:"block"},
  tagRow:{display:"flex",flexWrap:"wrap",gap:6},
  tag:{background:"#eef2ff",color:"#4f46e5",borderRadius:999,padding:"4px 10px 4px 12px",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4},
  tagRemove:{background:"none",border:"none",cursor:"pointer",color:"#818cf8",fontSize:16,lineHeight:1,padding:0,fontWeight:700},
  detailsRow:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  fieldWrap:{display:"flex",flexDirection:"column",gap:6},
  label:{fontSize:13,fontWeight:600,color:"#374151"},
  detailInput:{border:"1.5px solid #e5e7eb",borderRadius:10,padding:"10px 14px",fontSize:14,color:"#111827",fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#f9fafb",width:"100%"},
  errorBanner:{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",color:"#dc2626",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:8},
  predictBtn:{width:"100%",background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)",color:"#fff",border:"none",borderRadius:12,padding:"15px 24px",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif",boxShadow:"0 4px 20px rgba(99,102,241,0.5)"},
  predictBtnLoading:{opacity:0.7,cursor:"not-allowed"},
  spinnerWrap:{display:"flex",alignItems:"center",justifyContent:"center",gap:10},
  spinner:{display:"inline-block",width:18,height:18,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"},
  quickNav:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  quickNavBtn:{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:"#fff",fontFamily:"'DM Sans',sans-serif"},
  quickNavLabel:{flex:1,fontSize:12,fontWeight:600,textAlign:"left"},
  quickNavArrow:{fontSize:14,opacity:0.6},
  emptyResult:{background:"rgba(255,255,255,0.97)",borderRadius:16,padding:"2.5rem 2rem",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"},
  emptyTitle:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#0f172a",marginBottom:8},
  emptyText:{color:"#6b7280",fontSize:14,lineHeight:1.7,marginBottom:"1.5rem"},
  emptySteps:{display:"flex",flexDirection:"column",gap:10,textAlign:"left"},
  emptyStep:{display:"flex",alignItems:"center",gap:12},
  emptyStepNum:{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  emptyStepText:{fontSize:14,color:"#374151",fontWeight:500},
  loadingCard:{background:"rgba(255,255,255,0.97)",borderRadius:16,padding:"2.5rem 2rem",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"},
  loadingOrb:{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#ec4899)",margin:"0 auto 1.25rem",animation:"pulse 1.5s ease-in-out infinite"},
  loadingTitle:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#0f172a",marginBottom:8},
  loadingText:{color:"#6b7280",fontSize:14,marginBottom:"1.25rem"},
  loadingDots:{display:"flex",justifyContent:"center",gap:8},
  dot:{width:10,height:10,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#ec4899)",animation:"bounce 0.9s ease-in-out infinite"},
  resultHero:{borderRadius:16,padding:"1.5rem",border:"1.5px solid",marginBottom:"1rem",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"},
  resultTopRow:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"},
  resultBadge:{fontSize:11,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7280"},
  severityBadge:{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:999},
  diseaseName:{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-0.5px",marginBottom:"1rem"},
  confidenceRow:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6},
  confidenceLabel:{fontSize:13,color:"#6b7280",fontWeight:500},
  confidenceValue:{fontSize:14,fontWeight:700},
  progressBar:{width:"100%",height:8,borderRadius:999,background:"#e5e7eb",overflow:"hidden"},
  progressFill:{height:"100%",borderRadius:999,transition:"width 0.8s ease"},
  infoGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"},
  infoCard:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"1rem",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  infoCardHeader:{display:"flex",alignItems:"center",gap:8,marginBottom:8},
  infoCardTitle:{fontSize:13,fontWeight:700,color:"#0f172a"},
  infoCardText:{fontSize:13,color:"#4b5563",lineHeight:1.6},

  // Medicine styles
  medicineSection:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:"1.25rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  medicineSectionHeader:{display:"flex",alignItems:"flex-start",gap:12,marginBottom:"0.75rem"},
  medicineSectionTitle:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:2},
  medicineSectionSub:{fontSize:12,color:"#9ca3af"},
  medicineWarning:{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400e",marginBottom:"1rem",lineHeight:1.5},
  medicineGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  medicineCard:{background:"#f9fafb",borderRadius:10,padding:"0.875rem",border:"1px solid #e5e7eb"},
  medicineCardTop:{display:"flex",alignItems:"center",gap:10,marginBottom:6},
  medicineIcon:{width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0},
  medicineInfo:{flex:1},
  medicineName:{fontSize:13,fontWeight:700,color:"#0f172a",lineHeight:1.3},
  rxBadge:{display:"inline-block",fontSize:10,fontWeight:700,background:"#fffbeb",color:"#d97706",border:"1px solid #fde68a",borderRadius:999,padding:"1px 8px",marginTop:3},
  medicineNote:{fontSize:11,color:"#6b7280",lineHeight:1.5},

  nearbyHospBtn:{width:"100%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif",marginBottom:"1rem"},
  causesSection:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:"1.25rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  causesSectionHeader:{display:"flex",alignItems:"center",gap:10,marginBottom:4},
  causesSectionTitle:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#0f172a"},
  causesSectionSubtitle:{fontSize:12,color:"#9ca3af",marginBottom:"1rem"},
  causeAccordion:{border:"1px solid #e5e7eb",borderRadius:10,marginBottom:8,overflow:"hidden"},
  causeAccordionHeader:{width:"100%",background:"#f9fafb",border:"none",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  causeAccordionLeft:{display:"flex",alignItems:"center",gap:10},
  causeSymptomName:{fontSize:14,fontWeight:700,color:"#0f172a",textTransform:"capitalize"},
  causesCount:{fontSize:11,background:"#eef2ff",color:"#6366f1",borderRadius:999,padding:"2px 8px",fontWeight:600},
  causeAccordionBody:{padding:"12px 16px",background:"#fff",display:"flex",flexDirection:"column",gap:10},
  causeItem:{display:"flex",alignItems:"flex-start",gap:12},
  causeBullet:{minWidth:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  causeText:{fontSize:13,color:"#4b5563",lineHeight:1.6},
  disclaimer:{fontSize:12,color:"#9ca3af",lineHeight:1.6,textAlign:"center",padding:"0.75rem",background:"rgba(255,255,255,0.05)",borderRadius:8},
};

export default Dashboard;