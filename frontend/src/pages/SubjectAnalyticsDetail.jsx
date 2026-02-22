import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const ProgressBar = ({ value, max = 100, color = "#C8A24C", bg = "#262626", height = "8px" }) => (
    <div style={{ width: "100%", height, background: bg, borderRadius: "4px", overflow: "hidden", marginTop: "0.5rem" }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
    </div>
);

const SubjectAnalyticsDetail = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [progress, setProgress] = useState(null);
    const [breakdown, setBreakdown] = useState([]);
    const [subjectName, setSubjectName] = useState("Subject Overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetailData = async () => {
            try {
                // Fetch the detailed stats for this subject
                const [progRes, topRes, subRes] = await Promise.all([
                    api.get(`/analytics/subject/${subjectId}`),
                    api.get(`/analytics/topics/${subjectId}`),
                    api.get("/subjects") // used to extract the subject name safely
                ]);

                setProgress(progRes.data?.data?.subject_progress || null);
                setBreakdown(topRes.data?.data?.breakdown || []);

                const subjectsArray = subRes.data?.data?.subjects || [];
                const currentSub = subjectsArray.find(s => s._id === subjectId);
                if (currentSub) {
                    setSubjectName(currentSub.subject_name);
                }
            } catch (err) {
                setError("Failed to load subject analytics.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailData();
    }, [subjectId]);

    if (loading) {
        return <div style={{ color: "#A1A1AA", display: "flex", justifyContent: "center", padding: "4rem" }}>Loading subject context...</div>;
    }

    if (error) {
        return <div style={{ color: "#FC8181", padding: "2rem", background: "rgba(252, 129, 129, 0.1)", borderRadius: "8px" }}>{error}</div>;
    }

    const { avg_mastery, completed_topics, completion_percentage, strong_topics_count, swap_count, total_topics, weak_topics_count } = progress || {};

    return (
        <div style={{ paddingBottom: "3rem" }} className="animate-fade-in">
            <button
                onClick={() => navigate("/dashboard/analytics")}
                style={{ background: "transparent", color: "#A1A1AA", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0", marginBottom: "2rem", fontSize: "0.875rem" }}
            >
                ← Back to Global Overview
            </button>

            <h2 style={{ marginBottom: "0.5rem", color: "#F5F5F5", fontSize: "1.875rem", letterSpacing: "-0.02em" }}>{subjectName} Context</h2>
            <p style={{ color: "#A1A1AA", marginBottom: "2.5rem" }}>Deep dive analysis into topic-by-topic mastery and learning patterns.</p>

            {/* Top KPI row specific to this subject */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div className="animate-slide-up group" style={{ animationDelay: '0.1s', animationFillMode: 'both', background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px solid #262626", borderRadius: "12px", padding: "1.5rem", position: "relative", overflow: "hidden", transition: 'transform 0.3s ease, border-color 0.3s ease' }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "radial-gradient(circle, rgba(200,162,76,0.1) 0%, rgba(0,0,0,0) 70%)", transform: "translate(30%, -30%)" }} />
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Average Mastery</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#C8A24C", marginTop: "0.5rem" }}>
                        {avg_mastery || 0}%
                    </div>
                </div>

                <div className="animate-slide-up group" style={{ animationDelay: '0.2s', animationFillMode: 'both', background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)", border: "1px solid #262626", borderRadius: "12px", padding: "1.5rem", transition: 'transform 0.3s ease, border-color 0.3s ease' }}>
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Completion Rate</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5", marginTop: "0.5rem" }}>
                        {completion_percentage || 0}%
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        <strong style={{ color: "#E2E8F0" }}>{completed_topics || 0}</strong> / {total_topics || 0} topics
                    </div>
                </div>

                <div className="animate-slide-up group" style={{ animationDelay: '0.3s', animationFillMode: 'both', background: "linear-gradient(145deg, rgba(72,187,120,0.05) 0%, #0E0E0E 100%)", border: "1px solid rgba(72, 187, 120, 0.2)", borderRadius: "12px", padding: "1.5rem", transition: 'transform 0.3s ease, border-color 0.3s ease' }}>
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Strong Areas</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#48BB78", marginTop: "0.5rem" }}>
                        {strong_topics_count || 0}
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>Mastered Topics</div>
                </div>

                <div className="animate-slide-up group" style={{ animationDelay: '0.4s', animationFillMode: 'both', background: "linear-gradient(145deg, rgba(252,129,129,0.05) 0%, #0E0E0E 100%)", border: "1px solid rgba(252, 129, 129, 0.2)", borderRadius: "12px", padding: "1.5rem", transition: 'transform 0.3s ease, border-color 0.3s ease' }}>
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Weak Areas</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#FC8181", marginTop: "0.5rem" }}>
                        {weak_topics_count || 0}
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>Requires Attention</div>
                </div>
            </div>

            <h3 style={{ fontSize: "1.25rem", color: "#F5F5F5", marginBottom: "1.5rem" }}>Topic-by-Topic Breakdown</h3>
            {breakdown.length === 0 ? (
                <div style={{ color: "#A1A1AA", padding: "2rem", background: "#161616", borderRadius: "12px", textAlign: "center" }}>No assessment data recorded for this subject yet.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {breakdown.map((topic, idx) => {
                        let statusColor = "#ECC94B"; // average
                        let statusBg = "rgba(236, 201, 75, 0.1)";
                        if (topic.status === "strong") {
                            statusColor = "#48BB78";
                            statusBg = "rgba(72, 187, 120, 0.1)";
                        } else if (topic.status === "weak") {
                            statusColor = "#FC8181";
                            statusBg = "rgba(252, 129, 129, 0.1)";
                        }

                        return (
                            <div key={idx} className="animate-slide-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: `${0.5 + (idx * 0.1)}s`, animationFillMode: 'both', background: "#161616", border: "1px solid #262626", borderLeft: `4px solid ${statusColor}`, padding: "1.25rem", borderRadius: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                    <div style={{ color: "#F5F5F5", fontWeight: "bold", fontSize: "1.05rem", paddingRight: "1rem" }}>
                                        {topic.topic_name}
                                    </div>
                                    <div style={{ color: statusColor, fontWeight: "bold", fontSize: "1.1rem" }}>
                                        {topic.mastery_score}%
                                    </div>
                                </div>
                                <div style={{ color: "#A1A1AA", fontSize: "0.75rem", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                                    Status: <span style={{ color: statusColor }}>{topic.status}</span>
                                </div>
                                <ProgressBar value={topic.mastery_score} color={statusColor} bg={statusBg} height="6px" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubjectAnalyticsDetail;
