import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [userContext, setUserContext] = useState(null);
    const [streakData, setStreakData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [subjRes, userRes, streakRes] = await Promise.all([
                    api.get("/subjects"),
                    api.get("/users/me"),
                    api.get("/streak")
                ]);
                setSubjects(subjRes.data?.data?.subjects || []);
                setUserContext(userRes.data?.data?.user || null);
                setStreakData(streakRes.data?.data || null);
            } catch (err) {
                setError("Failed to fetch dashboard data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ color: "#A1A1AA" }}>Loading your learning context...</div>;
    }

    if (error) {
        return <div style={{ color: "#FC8181" }}>{error}</div>;
    }

    // Determine user preference label
    const densityPref = userContext?.global_behavior_profile?.preferred_density || 50;
    let learningStyle = "Balanced Pacing";
    if (densityPref < 35) learningStyle = "Fast & Concise";
    if (densityPref > 65) learningStyle = "Deep & Detailed";

    return (
        <div>
            {/* Context & Analytics Header */}
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ marginBottom: "1.5rem", color: "#F5F5F5", fontSize: "1.5rem" }}>Learning Context</h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    {/* Streak Card */}
                    <div style={{ background: "rgba(200, 162, 76, 0.05)", border: "1px solid rgba(200, 162, 76, 0.3)", borderRadius: "8px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <span style={{ color: "#C8A24C", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Current Streak 🔥</span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                            <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5" }}>{streakData?.current_streak || 0}</span>
                            <span style={{ color: "#A1A1AA", fontSize: "1rem" }}>days</span>
                        </div>
                        <span style={{ color: "#A1A1AA", fontSize: "0.75rem" }}>Longest: {streakData?.longest_streak || 0} days</span>
                    </div>

                    {/* Consistency Card */}
                    <div style={{ background: "#161616", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Consistency (30d)</span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                            <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5" }}>{streakData?.consistency_score || 0}%</span>
                        </div>
                        <span style={{ color: "#A1A1AA", fontSize: "0.75rem" }}>Total Active: {streakData?.total_active_days || 0} days</span>
                    </div>

                    {/* AI Profile Card */}
                    <div style={{ background: "#161616", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>AI Model Profile</span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#F5F5F5" }}>{learningStyle}</span>
                        </div>
                        <div style={{ marginTop: "0.5rem", width: "100%", height: "4px", background: "#333", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${densityPref}%`, height: "100%", background: "#C8A24C", borderRadius: "2px" }} />
                        </div>
                        <span style={{ color: "#A1A1AA", fontSize: "0.75rem", marginTop: "0.5rem" }}>Adaptation: {densityPref}/100 Density</span>
                    </div>
                </div>
            </div>

            {/* Subjects List */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ color: "#F5F5F5", fontSize: "1.5rem", margin: 0 }}>Your Subjects</h2>
                <button
                    onClick={() => navigate("/dashboard/create-subject")}
                    style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#C8A24C", color: "#000", border: "none", borderRadius: "4px", fontWeight: "bold" }}
                >
                    + Create Subject
                </button>
            </div>

            {subjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#A1A1AA", border: "1px dashed #262626", borderRadius: "8px" }}>
                    <p>No subjects found. Create your first subject to get started.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    {subjects.map((subject) => (
                        <div
                            key={subject._id}
                            onClick={() => navigate(`/dashboard/subject/${subject._id}`)}
                            style={{
                                background: "#161616",
                                border: "1px solid #262626",
                                borderRadius: "8px",
                                padding: "1.5rem",
                                cursor: "pointer",
                                transition: "transform 0.2s ease, border-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.borderColor = "#C8A24C";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.borderColor = "#262626";
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#F5F5F5" }}>{subject.subject_name}</h3>
                                <span style={{
                                    fontSize: "0.75rem",
                                    padding: "0.2rem 0.5rem",
                                    background: subject.type === "universal" ? "#2D3748" : "#2C5282",
                                    borderRadius: "12px",
                                    color: "#E2E8F0",
                                    textTransform: "uppercase",
                                    fontWeight: "bold"
                                }}>
                                    {subject.type}
                                </span>
                            </div>

                            <div style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#A1A1AA" }}>
                                <span>Avg. Mastery: </span>
                                <span style={{ color: subject.avg_subject_mastery >= 80 ? "#48BB78" : (subject.avg_subject_mastery >= 50 ? "#ECC94B" : "#FC8181"), fontWeight: "bold" }}>
                                    {subject.avg_subject_mastery !== undefined ? `${subject.avg_subject_mastery}%` : "N/A"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subjects;
