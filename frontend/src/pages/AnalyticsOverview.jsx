import { useState, useEffect } from "react";
import api from "../services/api";

const ProgressBar = ({ value, max = 100, color = "#C8A24C", bg = "#262626", height = "8px" }) => (
    <div style={{ width: "100%", height, background: bg, borderRadius: "4px", overflow: "hidden", marginTop: "0.5rem" }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
    </div>
);

const AnalyticsOverview = () => {
    const [stats, setStats] = useState(null);
    const [weakTopics, setWeakTopics] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const [userRes, weakRes, subjectsRes] = await Promise.all([
                    api.get("/analytics/user"),
                    api.get("/analytics/weak-topics"),
                    api.get("/subjects")
                ]);

                setStats(userRes.data?.data?.analytics || null);
                setWeakTopics(weakRes.data?.data?.weak_topics || []);
                setSubjects(subjectsRes.data?.data?.subjects || []);
            } catch (err) {
                setError("Failed to load analytics data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    if (loading) {
        return <div style={{ color: "#A1A1AA", display: "flex", justifyContent: "center", padding: "4rem" }}>Loading analytics dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: "#FC8181", padding: "2rem", background: "rgba(252, 129, 129, 0.1)", borderRadius: "8px" }}>{error}</div>;
    }

    return (
        <div style={{ paddingBottom: "3rem" }}>
            <h2 style={{ marginBottom: "2rem", color: "#F5F5F5", fontSize: "1.875rem", letterSpacing: "-0.02em" }}>Data Analytics Overview</h2>

            {/* Top KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px solid #262626", borderRadius: "12px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "radial-gradient(circle, rgba(200,162,76,0.1) 0%, rgba(0,0,0,0) 70%)", transform: "translate(30%, -30%)" }} />
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Global Mastery</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#C8A24C", marginTop: "0.5rem" }}>
                        {stats?.overall_avg_mastery || 0}%
                    </div>
                </div>

                <div style={{ background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px solid #262626", borderRadius: "12px", padding: "1.5rem" }}>
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Completion Rate</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5", marginTop: "0.5rem" }}>
                        {stats?.overall_completion_percentage || 0}%
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <strong style={{ color: "#E2E8F0" }}>{stats?.total_completed_topics || 0}</strong> of {stats?.total_topics || 0} topics
                    </div>
                </div>

                <div style={{ background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px solid #262626", borderRadius: "12px", padding: "1.5rem" }}>
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Active Curriculum</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5", marginTop: "0.5rem" }}>
                        {stats?.total_subjects || 0}
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>Subjects in focus</div>
                </div>

                <div style={{ background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px solid #262626", borderRadius: "12px", padding: "1.5rem" }}>
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>AI Tunes Used</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5", marginTop: "0.5rem" }}>
                        {stats?.total_swap_usage || 0}
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>Adaptive lesson rebuilds</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
                {/* Left Col: Areas for Improvement (Global Weak Topics) */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", color: "#F5F5F5", margin: 0 }}>Areas for Improvement</h3>
                        <span style={{ fontSize: "0.75rem", color: "#A1A1AA", background: "#262626", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>Mastery &lt; 60%</span>
                    </div>

                    {weakTopics.length === 0 ? (
                        <div style={{ padding: "3rem 2rem", background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px dashed #48BB78", borderRadius: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎉</div>
                            <div style={{ color: "#48BB78", fontWeight: "bold", fontSize: "1.1rem" }}>No Weak Topics Detected</div>
                            <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.5rem" }}>You're maintaining a strong mastery across all your subjects!</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {weakTopics.slice(0, 6).map((topic, idx) => (
                                <div key={idx} style={{ background: "#161616", border: "1px solid #333", borderLeft: "4px solid #FC8181", padding: "1.25rem", borderRadius: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: "#F5F5F5", fontWeight: "bold", fontSize: "1.05rem", marginBottom: "0.25rem" }}>{topic.topic_name}</div>
                                            <div style={{ color: "#A1A1AA", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span style={{ width: "6px", height: "6px", background: "#FC8181", borderRadius: "50%" }} />
                                                {topic.subject_name}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ color: "#FC8181", fontWeight: "bold", fontSize: "1.25rem" }}>{topic.mastery_score}%</div>
                                            <div style={{ color: "#A1A1AA", fontSize: "0.75rem" }}>Mastery</div>
                                        </div>
                                    </div>
                                    <ProgressBar value={topic.mastery_score} color="#FC8181" bg="rgba(252, 129, 129, 0.1)" />
                                </div>
                            ))}
                            {weakTopics.length > 6 && (
                                <div style={{ color: "#A1A1AA", fontSize: "0.875rem", textAlign: "center", marginTop: "1rem", padding: "1rem", background: "#161616", borderRadius: "8px", border: "1px solid #262626" }}>
                                    + {weakTopics.length - 6} more topics require attention
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Col: Subject Contexts */}
                <div>
                    <h3 style={{ fontSize: "1.25rem", color: "#F5F5F5", marginBottom: "1.5rem" }}>Subject Context Engine</h3>
                    {subjects.length === 0 ? (
                        <div style={{ color: "#A1A1AA", padding: "2rem", background: "#161616", borderRadius: "12px", textAlign: "center" }}>No active subjects found.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {subjects.map(sub => {
                                const avgColor = sub.avg_subject_mastery >= 80 ? "#48BB78" : (sub.avg_subject_mastery >= 60 ? "#ECC94B" : "#FC8181");

                                return (
                                    <div key={sub._id} style={{ background: "linear-gradient(145deg, #1A1A1A 0%, #161616 100%)", border: "1px solid #262626", padding: "1.5rem", borderRadius: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <div style={{ color: "#F5F5F5", fontWeight: "bold", fontSize: "1.1rem" }}>{sub.subject_name}</div>
                                            <div style={{ fontSize: "1.125rem", color: avgColor, fontWeight: "bold" }}>
                                                {sub.avg_subject_mastery}%
                                            </div>
                                        </div>

                                        <ProgressBar value={sub.avg_subject_mastery} color={avgColor} height="6px" />

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.25rem" }}>
                                            <div style={{ background: "rgba(72, 187, 120, 0.05)", border: "1px solid rgba(72, 187, 120, 0.2)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                                <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#48BB78" }}>{sub.strong_topics?.length || 0}</span>
                                                <span style={{ color: "#A1A1AA", fontSize: "0.75rem", textTransform: "uppercase" }}>Strong Topics</span>
                                            </div>
                                            <div style={{ background: "rgba(252, 129, 129, 0.05)", border: "1px solid rgba(252, 129, 129, 0.2)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                                <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#FC8181" }}>{sub.weak_topics?.length || 0}</span>
                                                <span style={{ color: "#A1A1AA", fontSize: "0.75rem", textTransform: "uppercase" }}>Weak Topics</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsOverview;
