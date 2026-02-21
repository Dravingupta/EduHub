import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const LessonView = () => {
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();

    const [lessonData, setLessonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

    // Tuning State
    const [showTuner, setShowTuner] = useState(false);
    const [density, setDensity] = useState(50);
    const [tuning, setTuning] = useState(false);

    // Mock Fetching for now - Will connect to exact LLM generation route next
    const fetchLesson = async (forceRegenerate = false) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/topics/${topicId}/lesson`, { forceRegenerate });
            if (res.data?.data?.lesson) {
                setLessonData(res.data.data.lesson);
                setCurrentVisibleIndex(0); // Reset to top on fetch/regenerate
            } else {
                throw new Error("Invalid lesson data received");
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load lesson.");
            setLoading(false);
        }
    };

    const handleApplyTuning = async () => {
        setTuning(true);
        try {
            // Update the subject's density preference in the backend
            await api.patch(`/subjects/${subjectId}/density`, { density });
            // Then instantly trigger a full LLM regeneration bypassing the cache
            await fetchLesson(true);
            setShowTuner(false);
            setDensity(50); // Reset UI slider back to balanced for the next tune
        } catch (err) {
            console.error(err);
            alert("Failed to update density tuning.");
        } finally {
            setTuning(false);
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [subjectId, topicId]);

    const handleNextBlock = () => {
        if (lessonData && currentVisibleIndex < lessonData.blocks.length - 1) {
            setCurrentVisibleIndex(prev => prev + 1);
        } else {
            // End of lesson - go to assignment
            navigate(`/dashboard/subject/${subjectId}/topic/${topicId}/assignment`);
        }
    };

    const renderBlock = (block, index) => {
        const isVisible = index <= currentVisibleIndex;
        if (!isVisible) return null;

        const baseStyle = {
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            border: "1px solid #262626",
            animation: "fadeIn 0.5s ease-out forwards"
        };

        switch (block.type) {
            case "concept":
                return (
                    <div key={index} style={{ ...baseStyle, background: "#161616" }}>
                        <h3 style={{ color: "#F5F5F5", marginBottom: "0.5rem" }}>{block.title}</h3>
                        <p style={{ color: "#A1A1AA", lineHeight: "1.6" }}>{block.content}</p>
                    </div>
                );
            case "mistakes":
                return (
                    <div key={index} style={{ ...baseStyle, background: "rgba(252, 129, 129, 0.05)", borderColor: "rgba(252, 129, 129, 0.3)" }}>
                        <h3 style={{ color: "#FC8181", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>⚠️</span> {block.title}
                        </h3>
                        <p style={{ color: "#F5F5F5", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{block.content}</p>
                    </div>
                );
            case "example":
                return (
                    <div key={index} style={{ ...baseStyle, background: "#1A1A1A", borderLeft: "4px solid #C8A24C" }}>
                        <h3 style={{ color: "#C8A24C", marginBottom: "0.5rem" }}>{block.title}</h3>
                        <pre style={{ color: "#D4D4D8", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: "1.6" }}>
                            {block.content}
                        </pre>
                    </div>
                );
            case "summary":
                return (
                    <div key={index} style={{ ...baseStyle, background: "rgba(200, 162, 76, 0.05)", borderColor: "rgba(200, 162, 76, 0.3)" }}>
                        <h3 style={{ color: "#C8A24C", marginBottom: "0.5rem" }}>{block.title}</h3>
                        <p style={{ color: "#A1A1AA", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{block.content}</p>
                    </div>
                );
            default:
                return (
                    <div key={index} style={{ ...baseStyle, background: "#161616" }}>
                        <h3 style={{ color: "#F5F5F5" }}>{block.title}</h3>
                        <p style={{ color: "#A1A1AA", whiteSpace: "pre-wrap" }}>{block.content}</p>
                    </div>
                );
        }
    };

    if (loading) return <div style={{ padding: "2rem", color: "#A1A1AA", textAlign: "center" }}>Generating interactive lesson... Please wait.</div>;
    if (error) return <div style={{ padding: "2rem", color: "#FC8181", textAlign: "center" }}>{error}</div>;
    if (!lessonData || !lessonData.blocks) return null;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate(`/dashboard/subject/${subjectId}`)}
                    style={{ background: "transparent", color: "#A1A1AA", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: 0 }}
                >
                    ← Back to Topics
                </button>
            </div>

            <div style={{ marginBottom: "3rem" }}>
                {lessonData.blocks.map((block, index) => renderBlock(block, index))}
            </div>

            {/* User Interaction / Paging Zone */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "#161616", borderRadius: "8px", border: "1px solid #262626" }}>
                <div style={{ flex: 1, paddingRight: "2rem" }}>
                    <p style={{ color: "#A1A1AA", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Is this explanation working for you?</p>

                    {!showTuner ? (
                        <button
                            style={{ background: "transparent", color: "#C8A24C", border: "1px solid rgba(200, 162, 76, 0.5)", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer" }}
                            onClick={() => setShowTuner(true)}
                        >
                            🔄 Tune Explanation Density
                        </button>
                    ) : (
                        <div style={{ background: "#262626", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.75rem", color: "#A1A1AA" }}>
                                <span>Concise</span>
                                <span>Balanced</span>
                                <span>Detailed</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={density}
                                onChange={(e) => setDensity(Number(e.target.value))}
                                style={{ width: "100%", accentColor: "#C8A24C", marginBottom: "1rem" }}
                            />
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={handleApplyTuning}
                                    disabled={tuning}
                                    style={{ background: "#C8A24C", color: "#000", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.875rem", fontWeight: "bold", cursor: tuning ? "not-allowed" : "pointer", flex: 1 }}
                                >
                                    {tuning ? "Regenerating..." : "Apply & Swap Lesson"}
                                </button>
                                <button
                                    onClick={() => setShowTuner(false)}
                                    disabled={tuning}
                                    style={{ background: "transparent", color: "#A1A1AA", border: "1px solid #555", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.875rem", cursor: tuning ? "not-allowed" : "pointer" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <button
                        onClick={handleNextBlock}
                        style={{ background: "#F5F5F5", color: "#000", border: "none", padding: "0.75rem 1.5rem", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                    >
                        {currentVisibleIndex < lessonData.blocks.length - 1 ? "I Understand, Next →" : "Take Assignment"}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default LessonView;
