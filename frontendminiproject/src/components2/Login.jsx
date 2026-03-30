import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.text();

      if (data === "Login Success") {
        // Save logged-in email so app knows the user is authenticated
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");   // ← go to dashboard
      } else if (data === "User Not Found") {
        setError("No account found with this email. Please register first.");
      } else if (data === "Incorrect Password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(data || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.iconRing}>
              <span style={{ fontSize: 40 }}>🩺</span>
            </div>
            <h1 style={styles.brandTitle}>MediScan</h1>
            <p style={styles.brandSubtitle}>Your AI-powered health companion</p>

            <div style={styles.statsGrid}>
              {[
                { value: "10+",   label: "Diseases Detected" },
                { value: "100%",  label: "Secure & Private" },
                { value: "24/7",  label: "Always Available" },
                { value: "Free",  label: "No Hidden Costs" },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <span style={styles.statValue}>{s.value}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...styles.floatingPill, top: "18%", right: "-18px" }}>🔬 Symptom Check</div>
          <div style={{ ...styles.floatingPill, top: "48%", right: "-24px" }}>💊 Precautions</div>
          <div style={{ ...styles.floatingPill, top: "70%", right: "-14px" }}>📋 Health History</div>
          <div style={styles.wave} />
        </div>

        {/* Right form panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <div style={styles.welcomeBack}>
              <span style={{ fontSize: 18 }}>👋</span>
              <span>Welcome back</span>
            </div>
            <h2 style={styles.formTitle}>Sign in to MediScan</h2>
            <p style={styles.formSubtitle}>Enter your credentials to continue your health journey</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>

            {/* Email */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email Address</label>
              <div style={{ ...styles.inputWrap, ...(focused === "email" ? styles.inputWrapFocused : {}) }}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldWrap}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
              </div>
              <div style={{ ...styles.inputWrap, ...(focused === "password" ? styles.inputWrapFocused : {}) }}>
                <span style={styles.inputIcon}>🔐</span>
                <input
                  type={showPassword ? "text" : "password"}
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>New to MediScan?</span>
            <div style={styles.dividerLine} />
          </div>

          <button
            onClick={() => navigate("/register")}
            style={styles.registerBtn}
          >
            Create a free account
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes blob {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(30px,-20px) scale(1.05); }
          66%      { transform:translate(-20px,20px) scale(0.95); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pillFloat {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden" },
  blob1: { position:"absolute", top:"-80px", left:"-80px", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)", animation:"blob 8s ease-in-out infinite", filter:"blur(2px)" },
  blob2: { position:"absolute", bottom:"-100px", right:"-60px", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.3) 0%,transparent 70%)", animation:"blob 10s ease-in-out infinite 2s", filter:"blur(2px)" },
  blob3: { position:"absolute", top:"40%", left:"40%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(34,211,238,0.2) 0%,transparent 70%)", animation:"blob 12s ease-in-out infinite 4s", filter:"blur(2px)" },
  card: { display:"flex", borderRadius:24, overflow:"hidden", width:"100%", maxWidth:880, boxShadow:"0 40px 80px rgba(0,0,0,0.6)", position:"relative", zIndex:1, animation:"slideUp 0.6s ease forwards" },
  leftPanel: { width:"42%", background:"linear-gradient(160deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)", padding:"3rem 2rem", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" },
  leftContent: { position:"relative", zIndex:1 },
  iconRing: { width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" },
  brandTitle: { fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", marginBottom:"0.5rem" },
  brandSubtitle: { color:"rgba(255,255,255,0.75)", fontSize:14, marginBottom:"2rem" },
  statsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  statCard: { background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"12px 14px", display:"flex", flexDirection:"column", gap:2, backdropFilter:"blur(4px)", border:"1px solid rgba(255,255,255,0.2)" },
  statValue: { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff" },
  statLabel: { fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:500 },
  floatingPill: { position:"absolute", background:"rgba(255,255,255,0.95)", color:"#4f46e5", fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:999, boxShadow:"0 4px 16px rgba(0,0,0,0.15)", animation:"pillFloat 3s ease-in-out infinite", whiteSpace:"nowrap", zIndex:2 },
  wave: { position:"absolute", bottom:-2, left:0, right:0, height:80, background:"rgba(255,255,255,0.05)", clipPath:"ellipse(120% 100% at 50% 100%)" },
  rightPanel: { flex:1, background:"#ffffff", padding:"3rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center" },
  formHeader: { marginBottom:"1.75rem" },
  welcomeBack: { display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600, color:"#6366f1", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" },
  formTitle: { fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color:"#0f172a", letterSpacing:"-0.5px", marginBottom:6 },
  formSubtitle: { color:"#64748b", fontSize:14 },
  errorBanner: { display:"flex", alignItems:"center", gap:10, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", color:"#dc2626", fontSize:13, fontWeight:500, marginBottom:"1.25rem" },
  form: { display:"flex", flexDirection:"column", gap:"1.25rem" },
  fieldWrap: { display:"flex", flexDirection:"column", gap:6 },
  labelRow: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  label: { fontSize:13, fontWeight:600, color:"#374151", letterSpacing:"0.3px" },
  inputWrap: { display:"flex", alignItems:"center", border:"1.5px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#f9fafb", transition:"border-color 0.2s,box-shadow 0.2s" },
  inputWrapFocused: { borderColor:"#6366f1", boxShadow:"0 0 0 3px rgba(99,102,241,0.12)", background:"#fff" },
  inputIcon: { padding:"0 12px", fontSize:16, borderRight:"1px solid #e5e7eb", height:46, display:"flex", alignItems:"center", background:"transparent" },
  input: { flex:1, border:"none", outline:"none", padding:"12px 14px", fontSize:15, color:"#111827", background:"transparent", fontFamily:"'DM Sans',sans-serif" },
  eyeBtn: { background:"none", border:"none", cursor:"pointer", padding:"0 12px", fontSize:16, lineHeight:1 },
  submitBtn: { background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)", color:"#fff", border:"none", borderRadius:12, padding:"14px 24px", fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"0.3px", transition:"opacity 0.2s,transform 0.2s", fontFamily:"'Syne',sans-serif", boxShadow:"0 4px 20px rgba(99,102,241,0.4)", marginTop:"0.25rem" },
  submitBtnLoading: { opacity:0.7, cursor:"not-allowed" },
  spinnerWrap: { display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  spinner: { display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" },
  divider: { display:"flex", alignItems:"center", gap:12, margin:"1.5rem 0 1rem" },
  dividerLine: { flex:1, height:1, background:"#e5e7eb" },
  dividerText: { fontSize:12, color:"#9ca3af", whiteSpace:"nowrap", fontWeight:500 },
  registerBtn: { width:"100%", background:"transparent", color:"#6366f1", border:"1.5px solid #6366f1", borderRadius:12, padding:"13px 24px", fontSize:15, fontWeight:700, cursor:"pointer", transition:"all 0.25s ease", fontFamily:"'Syne',sans-serif", letterSpacing:"0.3px" },
};

export default Login;