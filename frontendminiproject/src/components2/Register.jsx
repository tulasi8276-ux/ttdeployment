import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ["", "Weak", "Good", "Strong"];
  const strengthColors = ["", "#f87171", "#fb923c", "#4ade80"];

  const registerUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.text();

      if (data === "User Registered Successfully") {
        setSuccess("Registration successful! Redirecting to login...");
        // Wait 1.5 seconds so user sees the success message, then go to login
        setTimeout(() => {
          navigate("/");   // ← goes to Login page (route "/")
        }, 1500);
      } else if (data === "Email already registered") {
        setError("This email is already registered. Please login instead.");
      } else {
        setError(data || "Registration failed. Please try again.");
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
            <div style={styles.featureList}>
              {[
                { icon: "🔬", text: "Symptom-based disease detection" },
                { icon: "📋", text: "Personalised health history" },
                { icon: "💊", text: "Precautions & specialist advice" },
                { icon: "🔒", text: "Secure & private — always" },
              ].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.wave} />
        </div>

        {/* Right form panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create your account</h2>
            <p style={styles.formSubtitle}>Start your health journey today — it's free</p>
          </div>

          {/* Success banner */}
          {success && (
            <div style={styles.successBanner}>
              <span>✅</span> {success}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={registerUser} style={styles.form}>

            {/* Name */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Full Name</label>
              <div style={{ ...styles.inputWrap, ...(focused === "name" ? styles.inputWrapFocused : {}) }}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  style={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  required
                />
              </div>
            </div>

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
              <label style={styles.label}>Password</label>
              <div style={{ ...styles.inputWrap, ...(focused === "password" ? styles.inputWrapFocused : {}) }}>
                <span style={styles.inputIcon}>🔐</span>
                <input
                  type={showPassword ? "text" : "password"}
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={styles.strengthWrap}>
                  <div style={styles.strengthBar}>
                    {[1, 2, 3].map((s) => (
                      <div key={s} style={{
                        ...styles.strengthSegment,
                        background: strength >= s ? strengthColors[strength] : "#e5e7eb",
                        transition: "background 0.3s ease",
                      }} />
                    ))}
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} /> Creating account...
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p style={styles.loginPrompt}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/")}>
              Sign in here
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blob {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(30px,-20px) scale(1.05); }
          66%      { transform:translate(-20px,20px) scale(0.95); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2rem", fontFamily: "'DM Sans',sans-serif",
    position: "relative", overflow: "hidden",
  },
  blob1: { position:"absolute", top:"-80px", left:"-80px", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)", animation:"blob 8s ease-in-out infinite", filter:"blur(2px)" },
  blob2: { position:"absolute", bottom:"-100px", right:"-60px", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.3) 0%,transparent 70%)", animation:"blob 10s ease-in-out infinite 2s", filter:"blur(2px)" },
  blob3: { position:"absolute", top:"40%", left:"40%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(34,211,238,0.2) 0%,transparent 70%)", animation:"blob 12s ease-in-out infinite 4s", filter:"blur(2px)" },
  card: { display:"flex", borderRadius:24, overflow:"hidden", width:"100%", maxWidth:900, boxShadow:"0 40px 80px rgba(0,0,0,0.6)", position:"relative", zIndex:1, animation:"slideUp 0.6s ease forwards" },
  leftPanel: { width:"42%", background:"linear-gradient(160deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)", padding:"3rem 2rem", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" },
  leftContent: { position:"relative", zIndex:1 },
  iconRing: { width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" },
  brandTitle: { fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", marginBottom:"0.5rem" },
  brandSubtitle: { color:"rgba(255,255,255,0.75)", fontSize:14, marginBottom:"2rem" },
  featureList: { display:"flex", flexDirection:"column", gap:14 },
  featureItem: { display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 14px", backdropFilter:"blur(4px)" },
  featureText: { color:"rgba(255,255,255,0.9)", fontSize:13, fontWeight:500 },
  wave: { position:"absolute", bottom:-2, left:0, right:0, height:80, background:"rgba(255,255,255,0.05)", clipPath:"ellipse(120% 100% at 50% 100%)" },
  rightPanel: { flex:1, background:"#ffffff", padding:"3rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center" },
  formHeader: { marginBottom:"1.5rem" },
  formTitle: { fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color:"#0f172a", letterSpacing:"-0.5px", marginBottom:6 },
  formSubtitle: { color:"#64748b", fontSize:14 },
  successBanner: { display:"flex", alignItems:"center", gap:10, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 14px", color:"#16a34a", fontSize:13, fontWeight:600, marginBottom:"1rem" },
  errorBanner: { display:"flex", alignItems:"center", gap:10, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", color:"#dc2626", fontSize:13, fontWeight:500, marginBottom:"1rem" },
  form: { display:"flex", flexDirection:"column", gap:"1.25rem" },
  fieldWrap: { display:"flex", flexDirection:"column", gap:6 },
  label: { fontSize:13, fontWeight:600, color:"#374151", letterSpacing:"0.3px" },
  inputWrap: { display:"flex", alignItems:"center", border:"1.5px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#f9fafb", transition:"border-color 0.2s,box-shadow 0.2s" },
  inputWrapFocused: { borderColor:"#6366f1", boxShadow:"0 0 0 3px rgba(99,102,241,0.12)", background:"#fff" },
  inputIcon: { padding:"0 12px", fontSize:16, borderRight:"1px solid #e5e7eb", height:46, display:"flex", alignItems:"center", background:"transparent" },
  input: { flex:1, border:"none", outline:"none", padding:"12px 14px", fontSize:15, color:"#111827", background:"transparent", fontFamily:"'DM Sans',sans-serif" },
  eyeBtn: { background:"none", border:"none", cursor:"pointer", padding:"0 12px", fontSize:16, lineHeight:1 },
  strengthWrap: { display:"flex", alignItems:"center", gap:8, marginTop:6 },
  strengthBar: { display:"flex", gap:4, flex:1 },
  strengthSegment: { height:4, flex:1, borderRadius:99 },
  strengthLabel: { fontSize:12, fontWeight:600, minWidth:42 },
  submitBtn: { background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)", color:"#fff", border:"none", borderRadius:12, padding:"14px 24px", fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"0.3px", transition:"opacity 0.2s,transform 0.1s", fontFamily:"'Syne',sans-serif", boxShadow:"0 4px 20px rgba(99,102,241,0.4)" },
  submitBtnLoading: { opacity:0.7, cursor:"not-allowed" },
  spinnerWrap: { display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  spinner: { display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" },
  loginPrompt: { marginTop:"1.5rem", textAlign:"center", fontSize:14, color:"#6b7280" },
  link: { color:"#6366f1", cursor:"pointer", fontWeight:600 },
};

export default Register;