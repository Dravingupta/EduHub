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

    const targetDays = subject?.target_days || 120;
    const completedTopicsCount = topics.filter(t => t.completed).length;
    const progressPercentage = topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0;

    // Simple timeline calculation
    const lessonsPerWeek = topics.length > 0 ? Math.ceil((topics.length / targetDays) * 7) : 0;

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

                {/* Timeline Box */}
                <div className="bg-surface border border-border p-4 rounded-xl flex items-center gap-6 shadow-sm">
                    <div>
                        <div className="text-xs text-textSecondary mb-1">Target Timeline</div>
                        <div className="font-semibold">{targetDays} Days</div>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div>
                        <div className="text-xs text-textSecondary mb-1">Pacing Goal</div>
                        <div className="font-semibold text-accent">{lessonsPerWeek} lessons / week</div>
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
                    <h3 className="text-lg font-semibold mb-4 text-white/90">Curriculum Path</h3>

                    {topics.sort((a, b) => a.order_index - b.order_index).map((topic, index) => {
                        const isNextTopic = index === completedTopicsCount; // The immediate next uncompleted topic
                        const isLocked = index > completedTopicsCount; // Topics further ahead

                        return (
                            <div
                                key={topic._id || index}
                                onClick={() => {
                                    if (!isLocked) {
                                        navigate(`/dashboard/subject/${subjectId}/topic/${topic._id}/lesson`);
                                    }
                                }}
                                className={`
                                    flex items-center justify-between p-5 rounded-xl border transition-all duration-200
                                    ${topic.completed
                                        ? "bg-surface/50 border-border opacity-70"
                                        : isNextTopic
                                            ? "bg-[#1E1E1E] border-accent/50 shadow-[0_0_15px_rgba(200,162,76,0.1)] cursor-pointer hover:border-accent hover:-translate-y-0.5"
                                            : "bg-[#161616] border-[#222] opacity-40 cursor-not-allowed"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Number / Status Icon */}
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                        ${topic.completed ? "bg-green-500/10 text-green-500" : isNextTopic ? "bg-accent/20 text-accent" : "bg-white/5 text-textSecondary"}
                                    `}>
                                        {topic.completed ? "✓" : (index + 1)}
                                    </div>

                                    <div>
                                        <h4 className={`text-base font-medium ${topic.completed ? "line-through text-textSecondary" : "text-textPrimary"}`}>
                                            {topic.topic_name}
                                        </h4>
                                        {topic.section_name && (
                                            <p className="text-xs text-textSecondary mt-1">{topic.section_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div>
                                    {topic.completed ? (
                                        <span className="text-xs font-semibold text-green-500 px-3 py-1 bg-green-500/10 rounded-full">
                                            Mastered
                                        </span>
                                    ) : isNextTopic ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent triggering parent div click
                                                navigate(`/dashboard/subject/${subjectId}/topic/${topic._id}/lesson`);
                                            }}
                                            className="text-sm font-semibold text-[#000] bg-accent px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Start Lesson
                                        </button>
                                    ) : (
                                        <span className="text-xs text-textSecondary px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                            Locked
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubjectDetailPlaceholder;
