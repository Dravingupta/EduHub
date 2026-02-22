import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const SubjectDetailPlaceholder = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchSubjectAndTopics = async () => {
            try {
                // Fetch the subject details (to get the name/type)
                // We'll also fetch the topics for this subject
                const [subjectRes, topicsRes] = await Promise.all([
                    api.get("/subjects"), // API doesn't have a single GET /subjects/:id yet, so we filter from the list
                    api.get(`/topics/${subjectId}`)
                ]);

                const allSubjects = subjectRes.data?.data?.subjects || [];
                const currentSubject = allSubjects.find(s => s._id === subjectId);

                if (currentSubject) setSubject(currentSubject);
                setTopics(topicsRes.data?.data?.topics || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load subject details.");
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) {
            fetchSubjectAndTopics();
        }
    }, [subjectId]);

    if (loading) return <div className="text-textSecondary">Loading subject timeline...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const completedTopicsCount = topics.filter(t => t.completed).length;
    const progressPercentage = topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0;

    return (
        <div className="max-w-5xl mx-auto w-full pb-12">
            {/* Header Area */}
            <button
                onClick={() => navigate('/dashboard')}
                className="text-textSecondary hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm"
            >
                ← Back to Subjects
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{subject?.subject_name || "Subject Details"}</h1>
                    <div className="flex gap-3 items-center">
                        <span className="px-3 py-1 bg-surface border border-border text-xs rounded-full uppercase tracking-wider text-textSecondary">
                            {subject?.type || "Custom"}
                        </span>
                        <span className="text-sm text-textSecondary">
                            {completedTopicsCount} of {topics.length} topics completed
                        </span>
                    </div>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-[#161616] rounded-full h-3 mb-10 border border-border overflow-hidden">
                <div
                    className="bg-accent h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>

            {/* Topics List */}
            {topics.length === 0 ? (
                <div className="text-center p-12 bg-surface border border-border rounded-xl">
                    <p className="text-textSecondary">No topics found for this subject.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4 text-white/90">Topics</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topics.sort((a, b) => a.order_index - b.order_index).map((topic, index) => {
                            return (
                                <div
                                    key={topic._id || index}
                                    onClick={() => {
                                        navigate(`/dashboard/subject/${subjectId}/topic/${topic._id}/lesson`);
                                    }}
                                    className={`
                                        flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 h-full
                                        ${topic.completed
                                            ? "bg-surface/50 border-border opacity-70"
                                            : "bg-[#1E1E1E] border-accent/50 shadow-[0_0_15px_rgba(200,162,76,0.1)] cursor-pointer hover:border-accent hover:-translate-y-0.5"
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                            ${topic.completed ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-accent/20 text-accent"}
                                        `}>
                                            {topic.completed ? "✓" : (index + 1)}
                                        </div>
                                        {topic.completed && (
                                            <span className="text-xs font-semibold text-green-500 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                                Mastered
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <h4 className={`text-lg font-semibold ${topic.completed ? "text-textSecondary" : "text-textPrimary"}`}>
                                            {topic.topic_name}
                                        </h4>
                                        {topic.section_name && (
                                            <p className="text-xs text-textSecondary mt-1">{topic.section_name}</p>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        {!topic.completed ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent triggering parent div click
                                                    navigate(`/dashboard/subject/${subjectId}/topic/${topic._id}/lesson`);
                                                }}
                                                className="w-full text-sm font-semibold text-[#000] bg-accent px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Start Lesson
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/subject/${subjectId}/topic/${topic._id}/lesson`);
                                                }}
                                                className="w-full text-sm font-semibold text-textSecondary bg-surface border border-border px-4 py-2 rounded-lg hover:text-white transition-opacity hover:bg-[#2A2A2A]"
                                            >
                                                Review Lesson
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectDetailPlaceholder;
