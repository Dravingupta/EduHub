import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* ─── Activity Heatmap (LeetCode-Style) ─────────────────────────────────── */

const CELL_SIZE = 13;
const CELL_GAP = 3;
const WEEKS = 52;
const DAYS_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const getIntensityColor = (count) => {
    if (count === 0) return "#161616";
    if (count === 1) return "#0e4429";
    if (count <= 3) return "#006d32";
    if (count <= 6) return "#26a641";
    return "#39d353";
};

const getMonthLabels = () => {
    const labels = [];
    const today = new Date();
    for (let w = WEEKS - 1; w >= 0; w--) {
        const d = new Date(today);
        d.setDate(d.getDate() - (w * 7));
        if (d.getDate() <= 7) {
            labels.push({ week: WEEKS - 1 - w, label: d.toLocaleString("default", { month: "short" }) });
        }
    }
    return labels;
};

const ActivityHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState({});
    const [tooltip, setTooltip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const res = await api.get("/streak/heatmap");
                const activities = res.data?.data?.activities || [];
                const map = {};
                activities.forEach(a => { map[a.date] = (map[a.date] || 0) + a.count; });
                setHeatmapData(map);
            } catch (err) {
                console.error("Failed to load heatmap:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, []);

    // Build grid: 52 weeks × 7 days
    const buildGrid = () => {
        const grid = [];
        const today = new Date();
        const todayDay = today.getDay(); // 0=Sun ... 6=Sat

        for (let w = 0; w < WEEKS; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const daysAgo = (WEEKS - 1 - w) * 7 + (todayDay - d);
                const cellDate = new Date(today);
                cellDate.setDate(today.getDate() - daysAgo);
                const key = cellDate.toISOString().split("T")[0];
                week.push({ date: key, count: heatmapData[key] || 0 });
            }
            grid.push(week);
        }
        return grid;
    };

    const grid = buildGrid();
    const monthLabels = getMonthLabels();
    const totalActivities = Object.values(heatmapData).reduce((s, c) => s + c, 0);

    return (
        <div style={{
            background: "linear-gradient(145deg, #1A1A1A 0%, #0E0E0E 100%)",
            border: "1px solid #262626",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2.5rem",
            position: "relative"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                    <h3 style={{ color: "#F5F5F5", fontSize: "1.1rem", margin: 0 }}>Activity Overview</h3>
                    <span style={{ color: "#A1A1AA", fontSize: "0.8rem" }}>
                        {totalActivities} activities in the last year
                    </span>
                </div>
            </div>

            {loading ? (
                <div style={{ color: "#A1A1AA", textAlign: "center", padding: "2rem" }}>Loading activity data...</div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    {/* Month labels */}
                    <div style={{ display: "flex", marginLeft: "32px", marginBottom: "4px" }}>
                        {monthLabels.map((m, i) => (
                            <span key={i} style={{
                                position: "absolute",
                                left: `${32 + m.week * (CELL_SIZE + CELL_GAP)}px`,
                                color: "#A1A1AA",
                                fontSize: "0.7rem"
                            }}>
                                {m.label}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: `${CELL_GAP}px`, marginTop: "20px" }}>
                        {/* Day labels */}
                        <div style={{ display: "flex", flexDirection: "column", gap: `${CELL_GAP}px`, paddingRight: "4px" }}>
                            {DAYS_LABELS.map((label, i) => (
                                <div key={i} style={{
                                    width: "24px",
                                    height: `${CELL_SIZE}px`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    color: "#A1A1AA",
                                    fontSize: "0.65rem"
                                }}>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Grid cells */}
                        {grid.map((week, wi) => (
                            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: `${CELL_GAP}px` }}>
                                {week.map((cell, di) => (
                                    <div
                                        key={di}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltip({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top - 8,
                                                text: `${cell.count} activit${cell.count === 1 ? 'y' : 'ies'} on ${cell.date}`
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{
                                            width: `${CELL_SIZE}px`,
                                            height: `${CELL_SIZE}px`,
                                            borderRadius: "2px",
                                            background: getIntensityColor(cell.count),
                                            border: "1px solid rgba(255,255,255,0.04)",
                                            cursor: "pointer",
                                            transition: "transform 0.1s",
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.3)"}
                                        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", marginTop: "12px" }}>
                        <span style={{ color: "#A1A1AA", fontSize: "0.7rem", marginRight: "4px" }}>Less</span>
                        {[0, 1, 3, 6, 10].map((count, i) => (
                            <div key={i} style={{
                                width: `${CELL_SIZE}px`,
                                height: `${CELL_SIZE}px`,
                                borderRadius: "2px",
                                background: getIntensityColor(count),
                                border: "1px solid rgba(255,255,255,0.04)"
                            }} />
                        ))}
                        <span style={{ color: "#A1A1AA", fontSize: "0.7rem", marginLeft: "4px" }}>More</span>
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div style={{
                    position: "fixed",
                    left: `${tooltip.x}px`,
                    top: `${tooltip.y}px`,
                    transform: "translate(-50%, -100%)",
                    background: "#262626",
                    border: "1px solid #404040",
                    color: "#F5F5F5",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 1000
                }}>
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};

/* ─── Progress Bar ──────────────────────────────────────────────────────── */

const ProgressBar = ({ value, max = 100, color = "#C8A24C", bg = "#262626", height = "8px" }) => (
    <div style={{ width: "100%", height, background: bg, borderRadius: "4px", overflow: "hidden", marginTop: "0.5rem" }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
    </div>
);

const AnalyticsOverview = () => {
    const navigate = useNavigate();
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

            {/* Activity Heatmap — LeetCode style */}
            <ActivityHeatmap />

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
                    <span style={{ color: "#A1A1AA", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Adaptive Swaps Used</span>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#F5F5F5", marginTop: "0.5rem" }}>
                        {stats?.total_swap_usage || 0}
                    </div>
                    <div style={{ color: "#A1A1AA", fontSize: "0.875rem", marginTop: "0.25rem" }}>Tuning Dial regenerations</div>
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
                                    <div
                                        key={sub._id}
                                        onClick={() => navigate(`/dashboard/analytics/${sub._id}`)}
                                        style={{
                                            background: "linear-gradient(145deg, #1A1A1A 0%, #161616 100%)",
                                            border: "1px solid #262626",
                                            padding: "1.5rem",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.borderColor = "#404040";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "none";
                                            e.currentTarget.style.borderColor = "#262626";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <div style={{ color: "#F5F5F5", fontWeight: "bold", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {sub.subject_name}
                                                <span style={{ color: "#A1A1AA", fontSize: "0.875rem", fontWeight: "normal" }}>↗</span>
                                            </div>
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
