import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get("/subjects");
                setSubjects(response.data.data.subjects || []);
            } catch (err) {
                setError("Failed to fetch subjects.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    if (loading) {
        return <div style={{ color: "#A1A1AA" }}>Loading subjects...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2>Your Subjects</h2>
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
                                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{subject.subject_name}</h3>
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
                                <span style={{ color: subject.avg_subject_mastery >= 80 ? "#48BB78" : "#ECC94B", fontWeight: "bold" }}>
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
