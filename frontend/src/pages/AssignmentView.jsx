import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const AssignmentView = () => {
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [evaluation, setEvaluation] = useState(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await api.post("/assignments/start", { topicId });
                setAssignment(res.data?.data);
                setStartTime(Date.now());
            } catch (err) {
                console.error(err);
                setError("Failed to generate assignment. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [topicId]);

    const handleOptionSelect = (qId, option) => {
        if (evaluation) return; // locked after submit
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleSubmit = async () => {
        if (!assignment || submitting) return;
        setSubmitting(true);
        try {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            const userAnswersArray = Object.keys(answers).map(qId => ({
                question_id: qId,
                selected_answer: answers[qId]
            }));

            // Submit for evaluation
            const res = await api.post("/assignments/submit", {
                assignmentId: assignment.assignment_id,
                answers: userAnswersArray,
                time_taken: timeTaken
            });

            setEvaluation(res.data?.data);
        } catch (err) {
            console.error(err);
            alert("Failed to submit assignment");
            setSubmitting(false);
        }
    };

    const handleReturn = () => {
        navigate(`/dashboard/subject/${subjectId}`);
    };

    if (loading) return <div style={{ padding: "2rem", color: "#A1A1AA", textAlign: "center" }}>AI is generating your 10-MCQ test...</div>;
    if (error) return <div style={{ padding: "2rem", color: "#FC8181", textAlign: "center" }}>{error}</div>;
    if (!assignment) return null;

    const allAnswered = Object.keys(answers).length === assignment.questions.length;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <button
                    onClick={handleReturn}
                    style={{ background: "transparent", color: "#A1A1AA", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: 0 }}
                >
                    ← Back to Topics
                </button>
            </div>

            <div style={{ background: "#161616", borderRadius: "8px", border: "1px solid #262626", padding: "2rem", marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "1rem", color: "#F5F5F5" }}>Topic Assignment (Standardized Evaluation)</h2>
                {evaluation ? (
                    <div style={{ padding: "1.5rem", background: "rgba(200, 162, 76, 0.1)", border: "1px solid rgba(200, 162, 76, 0.3)", borderRadius: "8px", marginBottom: "2rem" }}>
                        <h3 style={{ color: "#C8A24C", marginBottom: "0.5rem" }}>Evaluation Complete!</h3>
                        <p style={{ color: "#F5F5F5", fontSize: "1.2rem", fontWeight: "bold" }}>Score: {evaluation.score}%</p>
                        <p style={{ color: "#F5F5F5", fontSize: "1.2rem", fontWeight: "bold" }}>Mastery: {evaluation.mastery_score}%</p>
                        <p style={{ color: "#A1A1AA", marginTop: "1rem" }}>{evaluation.mastery_score >= 65 ? "Topic Mastered! You can move to the next." : "Keep studying, you need 65% mastery."}</p>
                    </div>
                ) : (
                    <p style={{ color: "#A1A1AA", marginBottom: "2rem" }}>
                        Complete all {assignment.questions.length} questions to calculate your Mastery Index.
                    </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {(evaluation ? evaluation.results : assignment.questions).map((q, i) => (
                        <div
                            key={q.question_id}
                            style={{
                                padding: "1.5rem",
                                background: "#1E1E1E",
                                borderRadius: "8px",
                                border: evaluation ? (q.is_correct ? "1px solid rgba(72, 187, 120, 0.5)" : "1px solid rgba(245, 101, 101, 0.5)") : "1px solid #333"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <h4 style={{ color: "#F5F5F5", lineHeight: "1.5", margin: 0 }}>{i + 1}. {q.question}</h4>
                                {evaluation && (
                                    <span style={{
                                        padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold",
                                        background: q.is_correct ? "rgba(72, 187, 120, 0.2)" : "rgba(245, 101, 101, 0.2)",
                                        color: q.is_correct ? "#48BB78" : "#FC8181"
                                    }}>
                                        {q.is_correct ? "Correct" : "Incorrect"}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {q.options.map((opt, optIndex) => {
                                    const isSelected = answers[q.question_id] === opt;
                                    let bg = "#262626";
                                    let borderColor = "#333";
                                    let color = "#A1A1AA";

                                    if (evaluation) {
                                        const isCorrectOpt = q.correct_answer === opt;
                                        if (isCorrectOpt) {
                                            bg = "rgba(72, 187, 120, 0.15)";
                                            borderColor = "#48BB78";
                                            color = "#48BB78";
                                        } else if (isSelected && !isCorrectOpt) {
                                            bg = "rgba(245, 101, 101, 0.15)";
                                            borderColor = "#F56565";
                                            color = "#F56565";
                                        }
                                    } else if (isSelected) {
                                        bg = "rgba(200, 162, 76, 0.15)";
                                        borderColor = "#C8A24C";
                                        color = "#C8A24C";
                                    }

                                    return (
                                        <label
                                            key={optIndex}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem",
                                                background: bg,
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: "4px", cursor: evaluation ? "default" : "pointer",
                                                color: color, transition: "all 0.2s"
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={q.question_id}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(q.question_id, opt)}
                                                disabled={!!evaluation}
                                                style={{ cursor: evaluation ? "default" : "pointer", accentColor: evaluation ? "transparent" : "#C8A24C" }}
                                            />
                                            <span style={{ lineHeight: "1.4" }}>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {evaluation && (
                                <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(200, 162, 76, 0.05)", borderRadius: "6px", borderLeft: "4px solid #C8A24C" }}>
                                    <h5 style={{ color: "#C8A24C", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Explanation:</h5>
                                    <p style={{ color: "#A1A1AA", lineHeight: "1.5", fontSize: "0.9rem" }}>{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!evaluation && (
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !allAnswered}
                            style={{
                                background: (submitting || !allAnswered) ? "#6b562a" : "#C8A24C",
                                color: (submitting || !allAnswered) ? "#A1A1AA" : "#000",
                                border: "none", padding: "0.75rem 1.5rem", borderRadius: "4px", fontWeight: "bold",
                                cursor: (submitting || !allAnswered) ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? "Evaluating..." : "Submit Assignment"}
                        </button>
                    </div>
                )}

                {evaluation && (
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleReturn}
                            style={{ background: "#F5F5F5", color: "#000", border: "none", padding: "0.75rem 1.5rem", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                        >
                            Return to Topics
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentView;
