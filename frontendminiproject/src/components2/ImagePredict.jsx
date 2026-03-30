import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ImagePredict() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handlePredict = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", image);   // key must match @RequestParam in Spring Boot

    try {
      const res = await fetch("http://localhost:8080/api/predictImage", {  // FIXED URL
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header — browser sets it automatically with boundary
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Prediction failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
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
          <button style={{ ...styles.navBtn, ...styles.navBtnActive }}>Image Scan</button>
          <button style={styles.navBtn} onClick={() => navigate("/history")}>History</button>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Image-Based Prediction</h1>
          <p style={styles.pageSubtitle}>Upload a medical image to detect possible conditions</p>
        </div>

        <div style={styles.mainGrid}>
          {/* Upload Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: 22 }}>🖼️</span>
              <div>
                <h3 style={styles.cardTitle}>Upload Image</h3>
                <p style={styles.cardSubtitle}>JPG, PNG, JPEG supported</p>
              </div>
            </div>

            {/* Drop zone */}
            <label style={styles.dropZone}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {preview ? (
                <img src={preview} alt="preview" style={styles.previewImg} />
              ) : (
                <div style={styles.dropPlaceholder}>
                  <span style={{ fontSize: 48 }}>📁</span>
                  <p style={styles.dropText}>Click to select an image</p>
                  <p style={styles.dropHint}>or drag and drop here</p>
                </div>
              )}
            </label>

            {preview && (
              <p style={styles.fileName}>✅ {image?.name}</p>
            )}

            {error && (
              <div style={styles.errorBanner}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading || !image}
              style={{
                ...styles.predictBtn,
                ...(!image || loading ? styles.predictBtnDisabled : {}),
              }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} /> Analysing image...
                </span>
              ) : (
                "🔬 Predict from Image"
              )}
            </button>
          </div>

          {/* Result Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: 22 }}>📋</span>
              <div>
                <h3 style={styles.cardTitle}>Prediction Result</h3>
                <p style={styles.cardSubtitle}>Analysis will appear here</p>
              </div>
            </div>

            {!result && !loading && (
              <div style={styles.emptyResult}>
                <div style={{ fontSize: 52, marginBottom: "1rem" }}>🩻</div>
                <p style={styles.emptyText}>Upload an image and click <strong>Predict</strong> to see results.</p>
              </div>
            )}

            {loading && (
              <div style={styles.emptyResult}>
                <div style={styles.loadingOrb} />
                <p style={styles.emptyText}>Analysing your image...</p>
              </div>
            )}

            {result && !loading && (
              <div style={styles.resultBody}>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Detected Condition</span>
                  <span style={styles.resultValue}>{result.disease || result.predictedDisease || "Unknown"}</span>
                </div>
                <div style={styles.resultDivider} />
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Confidence</span>
                  <span style={styles.resultValue}>
                    {result.confidenceScore != null
                      ? `${Number(result.confidenceScore).toFixed(1)}%`
                      : "N/A"}
                  </span>
                </div>
                {result.confidenceScore != null && (
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${result.confidenceScore}%` }} />
                  </div>
                )}
                <div style={styles.resultDivider} />
                <div style={styles.infoBlock}>
                  <span style={styles.resultLabel}>🛡️ Precautions</span>
                  <p style={styles.infoText}>{result.precautions || "Consult a doctor."}</p>
                </div>
                {result.specialistType && (
                  <>
                    <div style={styles.resultDivider} />
                    <div style={styles.infoBlock}>
                      <span style={styles.resultLabel}>👨‍⚕️ Consult</span>
                      <p style={styles.infoText}>{result.specialistType}</p>
                    </div>
                  </>
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.05); }
          66%      { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
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
  content: { padding: "2rem", maxWidth: 1000, margin: "0 auto" },
  pageHeader: { marginBottom: "2rem" },
  pageTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 32,
    fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6,
  },
  pageSubtitle: { color: "rgba(255,255,255,0.55)", fontSize: 15 },
  mainGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem", alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,0.97)",
    borderRadius: 16, padding: "1.5rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    animation: "slideUp 0.5s ease",
  },
  cardHeader: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1.25rem" },
  cardTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: 16,
    fontWeight: 700, color: "#0f172a", marginBottom: 2,
  },
  cardSubtitle: { fontSize: 12, color: "#6b7280" },
  dropZone: {
    display: "block", width: "100%",
    border: "2px dashed #c7d2fe", borderRadius: 12,
    cursor: "pointer", overflow: "hidden",
    marginBottom: "1rem", minHeight: 200,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f8f9ff", transition: "border-color 0.2s",
  },
  dropPlaceholder: { textAlign: "center", padding: "2rem" },
  dropText: { fontSize: 15, fontWeight: 600, color: "#4f46e5", marginTop: "0.75rem" },
  dropHint: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  previewImg: { width: "100%", maxHeight: 260, objectFit: "contain", display: "block" },
  fileName: { fontSize: 13, color: "#6b7280", marginBottom: "0.75rem" },
  errorBanner: {
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: 10, padding: "10px 14px",
    color: "#dc2626", fontSize: 13, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: "0.75rem",
  },
  predictBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "14px 24px", fontSize: 15, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Syne', sans-serif",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
  },
  predictBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinnerWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  spinner: {
    display: "inline-block", width: 18, height: 18,
    border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  },
  emptyResult: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: 200, textAlign: "center",
  },
  loadingOrb: {
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #ec4899)",
    animation: "pulse 1.5s ease-in-out infinite", marginBottom: "1rem",
  },
  emptyText: { color: "#9ca3af", fontSize: 14, lineHeight: 1.6 },
  resultBody: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  resultRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { fontSize: 13, color: "#6b7280", fontWeight: 600 },
  resultValue: {
    fontSize: 15, fontWeight: 700, color: "#0f172a",
    fontFamily: "'Syne', sans-serif",
  },
  resultDivider: { height: 1, background: "#f1f5f9" },
  progressBar: {
    width: "100%", height: 8, borderRadius: 999,
    background: "#e5e7eb", overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 999,
    background: "linear-gradient(90deg, #6366f1, #ec4899)",
    transition: "width 0.8s ease",
  },
  infoBlock: { display: "flex", flexDirection: "column", gap: 6 },
  infoText: { fontSize: 13, color: "#4b5563", lineHeight: 1.6 },
  disclaimer: {
    fontSize: 12, color: "#9ca3af", lineHeight: 1.6,
    textAlign: "center", marginTop: "0.5rem",
    padding: "0.75rem", background: "#f9fafb", borderRadius: 8,
  },
};

export default ImagePredict;