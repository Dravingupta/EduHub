import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const UNIVERSAL_SUBJECTS = [
    "Physics_JEE",
    "Chemistry_JEE",
    "Mathematics_JEE",
    "Physics_NEET",
    "Chemistry_NEET",
    "Biology_NEET"
];

const CreateSubject = () => {
    const [type, setType] = useState("universal");
    const [subjectName, setSubjectName] = useState(UNIVERSAL_SUBJECTS[0]);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [syllabusText, setSyllabusText] = useState("");
    const navigate = useNavigate();

    // Filtered subjects based on search query
    const filteredUniversalSubjects = UNIVERSAL_SUBJECTS.filter(sub =>
        sub.toLowerCase().replace('_', ' ').includes(searchQuery.toLowerCase())
    );

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setType(selectedType);
        if (selectedType === "universal") {
            setSubjectName(UNIVERSAL_SUBJECTS[0]);
            setSearchQuery(UNIVERSAL_SUBJECTS[0].replace('_', ' '));
        } else {
            setSubjectName("");
        }
    };

    // Close dropdown when clicking outside could be added, but for simplicity we toggle on blur/focus
    const handleSelectUniversal = (sub) => {
        setSubjectName(sub);
        setSearchQuery(sub.replace('_', ' '));
        setIsDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subjectName.trim()) {
            setError("Subject name is required.");
            return;
        }

        if (type === "custom" && (!syllabusText || syllabusText.length < 50)) {
            setError("Syllabus text is required and must be at least 50 characters for Custom subjects.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            setStatusMessage(type === "custom" ? "Analyzing syllabus with AI..." : "Creating subject profile...");
            const subjectRes = await api.post("/subjects", {
                subject_name: subjectName,
                type: type,
                target_days: 120,
                ...(type === "custom" && { syllabusText })
            });

            const newSubjectId = subjectRes.data?.data?.subject?._id;

            if (type === "universal" && newSubjectId) {
                setStatusMessage("Generating universal curriculum path...");
                // Universal subjects use predefined syllabus, mapped natively in the backend script later,
                // but we can pass a dummy syllabus object just to trigger the standard creation if needed,
                // or the backend script `generateTestBank` handles universal questions.
                // Assuming the backend has a way to map universal subjects, we just redirect.
            }

            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create subject. Please try again.");
            console.error(err);
            setLoading(false);
            setStatusMessage("");
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem", background: "#161616", border: "1px solid #262626", borderRadius: "8px" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Create New Subject</h2>

            {error && <div style={{ color: "#FC8181", marginBottom: "1rem", fontSize: "0.875rem", padding: "0.75rem", background: "rgba(252, 129, 129, 0.1)", borderRadius: "4px" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="cardType" style={{ color: "#A1A1AA", fontSize: "0.875rem" }}>Subject Type *</label>
                    <select
                        id="cardType"
                        value={type}
                        onChange={handleTypeChange}
                        disabled={loading}
                        style={{
                            padding: "0.75rem",
                            background: "#0E0E0E",
                            border: "1px solid #262626",
                            color: "#F5F5F5",
                            borderRadius: "4px",
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        <option value="universal">Universal (Pre-mapped test bank)</option>
                        <option value="custom">Custom (Bring your syllabus)</option>
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label htmlFor="subjectName" style={{ color: "#A1A1AA", fontSize: "0.875rem" }}>Subject Name *</label>
                    {type === "universal" ? (
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                    // if it exactly matches, set the subject name, else keep the previous valid one or clear
                                    const match = UNIVERSAL_SUBJECTS.find(s => s.replace('_', ' ').toLowerCase() === e.target.value.toLowerCase());
                                    if (match) setSubjectName(match);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // delay to allow click
                                disabled={loading}
                                placeholder="Search universal subjects..."
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    background: "#0E0E0E",
                                    border: "1px solid #262626",
                                    color: "#F5F5F5",
                                    borderRadius: "4px",
                                    outline: "none"
                                }}
                            />
                            {isDropdownOpen && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    background: "#161616",
                                    border: "1px solid #262626",
                                    borderRadius: "4px",
                                    marginTop: "4px",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    zIndex: 10
                                }}>
                                    {filteredUniversalSubjects.length > 0 ? (
                                        filteredUniversalSubjects.map(sub => (
                                            <div
                                                key={sub}
                                                onClick={() => handleSelectUniversal(sub)}
                                                style={{
                                                    padding: "0.75rem",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid #262626",
                                                    background: subjectName === sub ? "rgba(200, 162, 76, 0.1)" : "transparent",
                                                    color: subjectName === sub ? "#C8A24C" : "#F5F5F5"
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = subjectName === sub ? "rgba(200, 162, 76, 0.1)" : "transparent"}
                                            >
                                                {sub.replace('_', ' ')}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: "0.75rem", color: "#A1A1AA" }}>No subjects found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <input
                            id="subjectName"
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            disabled={loading}
                            placeholder="e.g., Computer Networks"
                            style={{
                                padding: "0.75rem",
                                background: "#0E0E0E",
                                border: "1px solid #262626",
                                color: "#F5F5F5",
                                borderRadius: "4px",
                                outline: "none"
                            }}
                        />
                    )}
                </div>

                {type === "custom" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="syllabusText" style={{ color: "#A1A1AA", fontSize: "0.875rem" }}>Course Syllabus *</label>
                        <textarea
                            id="syllabusText"
                            value={syllabusText}
                            onChange={(e) => setSyllabusText(e.target.value)}
                            disabled={loading}
                            rows="6"
                            placeholder="Paste your course syllabus here (e.g., chapters, objectives, topics). The AI will structure this into a daily learning path..."
                            style={{
                                padding: "0.75rem",
                                background: "#0E0E0E",
                                border: "1px solid #262626",
                                color: "#F5F5F5",
                                borderRadius: "4px",
                                outline: "none",
                                resize: "vertical",
                                minHeight: "120px"
                            }}
                        />
                        <div style={{ padding: "0.75rem", background: "rgba(200, 162, 76, 0.05)", border: "1px dashed rgba(200, 162, 76, 0.3)", borderRadius: "4px", fontSize: "0.75rem", color: "#A1A1AA" }}>
                            <strong>AI Curriculum Mapping:</strong> We will automatically generate a progressive curriculum path based on the content above. Please ensure you provide at least 50 characters of detailed information.
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "0.75rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            background: "transparent",
                            color: "#F5F5F5",
                            border: "1px solid #262626",
                            borderRadius: "4px",
                            fontWeight: "bold"
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "0.75rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            background: "#C8A24C",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            opacity: loading ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem"
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                {statusMessage || "Creating..."}
                            </>
                        ) : "Create Subject"}
                    </button>
                </div>

            </form>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CreateSubject;
