import { useParams, useNavigate } from "react-router-dom";

const AssignmentView = () => {
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", background: "#161616", borderRadius: "8px", border: "1px solid #262626" }}>
            <h2 style={{ marginBottom: "1rem", color: "#F5F5F5" }}>Topic Assignment (Standardized Evaluation)</h2>
            <p style={{ color: "#A1A1AA", marginBottom: "2rem" }}>
                This is the interactive 10-MCQ standardized test wrapper. Your Mastery Index will be calculated here in Phase 5.
            </p>

            <button
                onClick={() => navigate(`/dashboard/subject/${subjectId}`)}
                style={{ background: "#C8A24C", color: "#000", border: "none", padding: "0.75rem 1.5rem", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
                Complete & Return to Topics
            </button>
        </div>
    );
};

export default AssignmentView;
