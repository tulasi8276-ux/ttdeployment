import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh"
];

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "", email: "", phone: "", age: "", gender: "",
    bloodGroup: "", city: "", state: "", pincode: "",
    emergencyContact: "", medicalHistory: "",
  });

  const [hospitals, setHospitals]   = useState([]);
  const [loadingHosp, setLoadingHosp] = useState(false);
  const [hospError, setHospError]   = useState("");
  const [saved, setSaved]           = useState(false);
  const [activeTab, setActiveTab]   = useState("profile"); // "profile" | "hospitals"

  // Load saved profile on mount
  useEffect(() => {
    const saved = localStorage.getItem("patientProfile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    localStorage.setItem("patientProfile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Fetch nearby hospitals using OpenStreetMap Nominatim + Overpass API (free, no key needed)
  const fetchHospitals = async () => {
    if (!profile.city.trim()) {
      setHospError("Please enter your city first and save your profile.");
      return;
    }
    setLoadingHosp(true);
    setHospError("");
    setHospitals([]);
    setActiveTab("hospitals");

    try {
      // Step 1: Get lat/lon for the city using Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(profile.city + ", " + profile.state + ", India")}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        setHospError("Could not find your city. Please check the spelling.");
        setLoadingHosp(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);

      // Step 2: Query Overpass API for hospitals within 10km radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:10000,${lat},${lon});
          way["amenity"="hospital"](around:10000,${lat},${lon});
          node["amenity"="clinic"](around:10000,${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });

      const overpassData = await overpassRes.json();
      const elements = overpassData.elements || [];

      // Parse hospital data
      const parsed = elements
        .filter((el) => el.tags && el.tags.name)
        .map((el) => ({
          id:        el.id,
          name:      el.tags.name,
          type:      el.tags.amenity === "clinic" ? "Clinic" : "Hospital",
          phone:     el.tags.phone || el.tags["contact:phone"] || "Not available",
          address:   [
            el.tags["addr:street"],
            el.tags["addr:suburb"],
            el.tags["addr:city"] || profile.city,
          ].filter(Boolean).join(", ") || profile.city,
          emergency: el.tags.emergency === "yes" ? "Yes" : "Check with hospital",
          lat:       el.lat || lat,
          lon:       el.lon || lon,
        }))
        .slice(0, 15); // Show max 15

      if (parsed.length === 0) {
        setHospError(`No hospitals found near ${profile.city}. Try a larger nearby city.`);
      } else {
        setHospitals(parsed);
      }
    } catch (err) {
      setHospError("Failed to fetch hospitals. Please check your internet connection.");
    } finally {
      setLoadingHosp(false);
    }
  };

  const openMaps = (hospital) => {
    const query = encodeURIComponent(`${hospital.name} ${profile.city}`);
    window.open(`https://www.google.com/maps/search/${query}`, "_blank");
  };

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
          <button style={styles.navBtn} onClick={() => navigate("/history")}>History</button>
          <button style={{ ...styles.navBtn, ...styles.navBtnActive }}>Profile</button>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Patient Profile</h1>
            <p style={styles.pageSubtitle}>Manage your personal details and find nearby hospitals</p>
          </div>
          <button style={styles.saveBtn} onClick={saveProfile}>
            {saved ? "✅ Saved!" : "💾 Save Profile"}
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === "profile" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("profile")}
          >
            👤 Personal Details
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "hospitals" ? styles.tabActive : {}) }}
            onClick={() => { setActiveTab("hospitals"); if (hospitals.length === 0) fetchHospitals(); }}
          >
            🏥 Nearby Hospitals
            {hospitals.length > 0 && <span style={styles.tabBadge}>{hospitals.length}</span>}
          </button>
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div style={styles.profileGrid}>

            {/* Personal Info */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ fontSize: 20 }}>👤</span>
                <h3 style={styles.cardTitle}>Personal Information</h3>
              </div>
              <div style={styles.formGrid}>
                {[
                  { label: "Full Name",          field: "fullName",         type: "text",   placeholder: "John Doe" },
                  { label: "Email Address",       field: "email",            type: "email",  placeholder: "you@example.com" },
                  { label: "Phone Number",        field: "phone",            type: "tel",    placeholder: "+91 9876543210" },
                  { label: "Age",                 field: "age",              type: "number", placeholder: "28" },
                ].map((f) => (
                  <div key={f.field} style={styles.fieldWrap}>
                    <label style={styles.label}>{f.label}</label>
                    <input
                      type={f.type}
                      style={styles.input}
                      placeholder={f.placeholder}
                      value={profile[f.field]}
                      onChange={(e) => handleChange(f.field, e.target.value)}
                    />
                  </div>
                ))}

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Gender</label>
                  <select style={styles.input} value={profile.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}>
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Blood Group</label>
                  <select style={styles.input} value={profile.bloodGroup}
                    onChange={(e) => handleChange("bloodGroup", e.target.value)}>
                    <option value="">-- Select --</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Emergency Contact</label>
                  <input type="tel" style={styles.input}
                    placeholder="+91 9876543210"
                    value={profile.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ fontSize: 20 }}>📍</span>
                <h3 style={styles.cardTitle}>Location Details</h3>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>City *</label>
                  <input type="text" style={styles.input}
                    placeholder="e.g. Hyderabad"
                    value={profile.city}
                    onChange={(e) => handleChange("city", e.target.value)} />
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>State</label>
                  <select style={styles.input} value={profile.state}
                    onChange={(e) => handleChange("state", e.target.value)}>
                    <option value="">-- Select State --</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Pincode</label>
                  <input type="text" style={styles.input}
                    placeholder="e.g. 500001"
                    value={profile.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)} />
                </div>
              </div>

              {/* Find Hospitals CTA */}
              <div style={styles.findHospitalCta}>
                <div style={styles.ctaText}>
                  <span style={{ fontSize: 28 }}>🏥</span>
                  <div>
                    <p style={styles.ctaTitle}>Find Hospitals Near You</p>
                    <p style={styles.ctaSubtitle}>
                      Based on your city: <strong>{profile.city || "Not set"}</strong>
                    </p>
                  </div>
                </div>
                <button style={styles.findBtn} onClick={() => { saveProfile(); fetchHospitals(); }}>
                  Search Hospitals →
                </button>
              </div>
            </div>

            {/* Medical History */}
            <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
              <div style={styles.cardHeader}>
                <span style={{ fontSize: 20 }}>📋</span>
                <h3 style={styles.cardTitle}>Medical History</h3>
              </div>
              <textarea
                style={styles.textarea}
                placeholder="Enter any existing conditions, allergies, past surgeries, current medications..."
                value={profile.medicalHistory}
                rows={4}
                onChange={(e) => handleChange("medicalHistory", e.target.value)}
              />
            </div>

            {/* Profile summary card */}
            {profile.fullName && (
              <div style={{ ...styles.card, gridColumn: "1 / -1", background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryAvatar}>
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.summaryInfo}>
                    <h3 style={styles.summaryName}>{profile.fullName}</h3>
                    <p style={styles.summaryDetail}>
                      {[profile.age && `Age: ${profile.age}`, profile.gender, profile.bloodGroup && `Blood: ${profile.bloodGroup}`].filter(Boolean).join(" · ")}
                    </p>
                    <p style={styles.summaryDetail}>
                      📍 {[profile.city, profile.state].filter(Boolean).join(", ") || "Location not set"}
                      {profile.pincode && ` — ${profile.pincode}`}
                    </p>
                  </div>
                  {profile.emergencyContact && (
                    <div style={styles.emergencyBadge}>
                      <span style={{ fontSize: 12 }}>🚨 Emergency</span>
                      <span style={styles.emergencyNum}>{profile.emergencyContact}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HOSPITALS TAB ── */}
        {activeTab === "hospitals" && (
          <div>
            <div style={styles.hospitalHeader}>
              <div>
                <h3 style={styles.hospitalHeaderTitle}>
                  🏥 Hospitals & Clinics near <span style={{ color:"#a5b4fc" }}>{profile.city || "your city"}</span>
                </h3>
                <p style={styles.hospitalHeaderSub}>
                  Showing results within 10 km radius
                </p>
              </div>
              <button style={styles.refreshBtn} onClick={fetchHospitals} disabled={loadingHosp}>
                {loadingHosp ? "Searching..." : "🔄 Refresh"}
              </button>
            </div>

            {/* Loading */}
            {loadingHosp && (
              <div style={styles.centerBox}>
                <div style={styles.loadingOrb} />
                <p style={styles.loadingText}>Searching hospitals near {profile.city}...</p>
              </div>
            )}

            {/* Error */}
            {hospError && !loadingHosp && (
              <div style={styles.errorBanner}>
                <span>⚠️</span> {hospError}
                <button style={styles.goProfileBtn} onClick={() => setActiveTab("profile")}>
                  ← Go to Profile
                </button>
              </div>
            )}

            {/* Hospital cards */}
            {!loadingHosp && hospitals.length > 0 && (
              <div style={styles.hospitalGrid}>
                {hospitals.map((h, i) => (
                  <div key={h.id} style={{
                    ...styles.hospitalCard,
                    animation: `slideUp 0.4s ease ${i * 0.04}s both`,
                  }}>
                    <div style={styles.hospitalCardTop}>
                      <div style={styles.hospitalIconWrap}>
                        <span style={{ fontSize: 24 }}>{h.type === "Clinic" ? "🏪" : "🏥"}</span>
                      </div>
                      <div style={styles.hospitalInfo}>
                        <h4 style={styles.hospitalName}>{h.name}</h4>
                        <span style={{
                          ...styles.hospitalTypeBadge,
                          background: h.type === "Clinic" ? "#fef3c7" : "#eff6ff",
                          color:      h.type === "Clinic" ? "#d97706"  : "#2563eb",
                        }}>
                          {h.type}
                        </span>
                      </div>
                    </div>

                    <div style={styles.hospitalDetails}>
                      <div style={styles.hospitalDetailRow}>
                        <span style={styles.hospitalDetailIcon}>📍</span>
                        <span style={styles.hospitalDetailText}>{h.address}</span>
                      </div>
                      <div style={styles.hospitalDetailRow}>
                        <span style={styles.hospitalDetailIcon}>📞</span>
                        <span style={styles.hospitalDetailText}>{h.phone}</span>
                      </div>
                      <div style={styles.hospitalDetailRow}>
                        <span style={styles.hospitalDetailIcon}>🚨</span>
                        <span style={styles.hospitalDetailText}>Emergency: {h.emergency}</span>
                      </div>
                    </div>

                    <button style={styles.directionsBtn} onClick={() => openMaps(h)}>
                      📍 Get Directions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes blob {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(30px,-20px) scale(1.05); }
          66%      { transform:translate(-20px,20px) scale(0.95); }
        }
        @keyframes pulse {
          0%,100% { transform:scale(1); opacity:0.8; }
          50%      { transform:scale(1.15); opacity:1; }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden" },
  blob1: { position:"fixed", top:"-80px", left:"-80px", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)", animation:"blob 8s ease-in-out infinite", pointerEvents:"none" },
  blob2: { position:"fixed", bottom:"-100px", right:"-60px", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%)", animation:"blob 10s ease-in-out infinite 2s", pointerEvents:"none" },
  navbar: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 2rem", background:"rgba(15,23,42,0.8)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, zIndex:100 },
  navBrand: { display:"flex", alignItems:"center", gap:10 },
  navTitle: { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" },
  navLinks: { display:"flex", alignItems:"center", gap:8 },
  navBtn: { background:"transparent", border:"none", color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:500, padding:"8px 14px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  navBtnActive: { color:"#fff", background:"rgba(99,102,241,0.25)", border:"1px solid rgba(99,102,241,0.4)" },
  logoutBtn: { background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", fontSize:14, fontWeight:600, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  content: { padding:"2rem", maxWidth:1100, margin:"0 auto" },
  pageHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem" },
  pageTitle: { fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", marginBottom:6 },
  pageSubtitle: { color:"rgba(255,255,255,0.55)", fontSize:15 },
  saveBtn: { background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif", boxShadow:"0 4px 14px rgba(99,102,241,0.4)", whiteSpace:"nowrap" },
  tabs: { display:"flex", gap:8, marginBottom:"1.5rem", background:"rgba(255,255,255,0.05)", borderRadius:12, padding:6 },
  tab: { flex:1, background:"transparent", border:"none", color:"rgba(255,255,255,0.5)", fontSize:14, fontWeight:600, padding:"10px 16px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" },
  tabActive: { background:"rgba(99,102,241,0.3)", color:"#fff", border:"1px solid rgba(99,102,241,0.4)" },
  tabBadge: { background:"#6366f1", color:"#fff", borderRadius:999, fontSize:11, fontWeight:700, padding:"2px 8px" },
  profileGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" },
  card: { background:"rgba(255,255,255,0.97)", borderRadius:16, padding:"1.5rem", boxShadow:"0 8px 32px rgba(0,0,0,0.25)" },
  cardHeader: { display:"flex", alignItems:"center", gap:10, marginBottom:"1.25rem" },
  cardTitle: { fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:"#0f172a" },
  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" },
  fieldWrap: { display:"flex", flexDirection:"column", gap:6 },
  label: { fontSize:13, fontWeight:600, color:"#374151" },
  input: { border:"1.5px solid #e5e7eb", borderRadius:10, padding:"10px 14px", fontSize:14, color:"#111827", fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#f9fafb", width:"100%" },
  textarea: { border:"1.5px solid #e5e7eb", borderRadius:10, padding:"12px 14px", fontSize:14, color:"#111827", fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#f9fafb", width:"100%", resize:"vertical" },
  findHospitalCta: { marginTop:"1.25rem", background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", borderRadius:12, padding:"1rem 1.25rem", border:"1px solid #c7d2fe", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  ctaText: { display:"flex", alignItems:"center", gap:12 },
  ctaTitle: { fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:2 },
  ctaSubtitle: { fontSize:12, color:"#6b7280" },
  findBtn: { background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" },
  summaryRow: { display:"flex", alignItems:"center", gap:16 },
  summaryAvatar: { width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"2px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:"#fff", flexShrink:0 },
  summaryInfo: { flex:1 },
  summaryName: { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#fff", marginBottom:4 },
  summaryDetail: { fontSize:13, color:"rgba(255,255,255,0.8)", marginBottom:3 },
  emergencyBadge: { background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:10, padding:"8px 14px", display:"flex", flexDirection:"column", gap:2, alignItems:"center" },
  emergencyNum: { fontSize:13, fontWeight:700, color:"#fca5a5" },
  hospitalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" },
  hospitalHeaderTitle: { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", marginBottom:4 },
  hospitalHeaderSub: { fontSize:13, color:"rgba(255,255,255,0.5)" },
  refreshBtn: { background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  centerBox: { display:"flex", flexDirection:"column", alignItems:"center", padding:"4rem 0" },
  loadingOrb: { width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#ec4899)", animation:"pulse 1.5s ease-in-out infinite", marginBottom:"1rem" },
  loadingText: { color:"rgba(255,255,255,0.5)", fontSize:15 },
  errorBanner: { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"14px 16px", color:"#dc2626", fontSize:14, fontWeight:500, display:"flex", alignItems:"center", gap:10 },
  goProfileBtn: { marginLeft:"auto", background:"#dc2626", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" },
  hospitalGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" },
  hospitalCard: { background:"rgba(255,255,255,0.97)", borderRadius:14, padding:"1.25rem", boxShadow:"0 4px 20px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column", gap:"0.875rem" },
  hospitalCardTop: { display:"flex", alignItems:"flex-start", gap:12 },
  hospitalIconWrap: { width:44, height:44, borderRadius:10, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  hospitalInfo: { flex:1 },
  hospitalName: { fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:4, lineHeight:1.3 },
  hospitalTypeBadge: { fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:999 },
  hospitalDetails: { display:"flex", flexDirection:"column", gap:6 },
  hospitalDetailRow: { display:"flex", alignItems:"flex-start", gap:8 },
  hospitalDetailIcon: { fontSize:13, flexShrink:0, marginTop:1 },
  hospitalDetailText: { fontSize:12, color:"#6b7280", lineHeight:1.5 },
  directionsBtn: { width:"100%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:10, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif", marginTop:"auto" },
};

export default Profile;