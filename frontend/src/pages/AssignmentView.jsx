import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const AssignmentView = () => {
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleComplete = async () => {
        setSubmitting(true);
        try {
            await api.patch(`/topics/${topicId}/complete`);
            navigate(`/dashboard/subject/${subjectId}`);
        } catch (error) {
            console.error("Failed to complete assignment", error);
            setSubmitting(false);
            // Optionally could add a toast here in the future
            navigate(`/dashboard/subject/${subjectId}`);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", background: "#161616", borderRadius: "8px", border: "1px solid #262626" }}>
            <h2 style={{ marginBottom: "1rem", color: "#F5F5F5" }}>Topic Assignment (Standardized Evaluation)</h2>
            <p style={{ color: "#A1A1AA", marginBottom: "2rem" }}>
                This is the interactive 10-MCQ standardized test wrapper. Your Mastery Index will be calculated here in Phase 5.
            </p>

            <button
                onClick={handleComplete}
                disabled={submitting}
                style={{
                    background: submitting ? "#6b562a" : "#C8A24C",
                    color: submitting ? "#A1A1AA" : "#000",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: submitting ? "not-allowed" : "pointer"
                }}
            >
                {submitting ? "Saving Mastery..." : "Complete & Return to Topics"}
            </button>
        </div>
    );
};

export default AssignmentView;
