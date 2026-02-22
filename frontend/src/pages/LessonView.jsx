import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import mermaid from "mermaid";

/* ─── Mermaid initialization (dark theme) ─── */
mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
        primaryColor: "#2A2A3E",
        primaryTextColor: "#F5F5F5",
        primaryBorderColor: "#C8A24C",
        lineColor: "#C8A24C",
        secondaryColor: "#1E1E2E",
        tertiaryColor: "#161622",
        fontFamily: "inherit",
        fontSize: "14px",
    },
    securityLevel: "loose",
    flowchart: { curve: "basis", padding: 16 },
});

/* ─── Mermaid diagram renderer ─── */
const MermaidDiagram = ({ chart }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(false);
    const [rawSyntax, setRawSyntax] = useState("");

    const renderChart = useCallback(async () => {
        if (!containerRef.current || !chart) return;
        try {
            let cleanChart = chart.trim();

            // Remove markdown code fences the LLM might wrap
            cleanChart = cleanChart
                .replace(/^```(?:mermaid)?\s*/i, "")
                .replace(/\s*```\s*$/i, "");

            // Remove trailing semicolons on lines (breaks some Mermaid versions)
            cleanChart = cleanChart
                .split("\n")
                .map(line => line.replace(/;\s*$/, ""))
                .join("\n");

            setRawSyntax(cleanChart);

            const id = `mermaid-${Math.random().toString(36).substring(2, 10)}`;
            const { svg } = await mermaid.render(id, cleanChart);
            containerRef.current.innerHTML = svg;
            setError(false);
        } catch (err) {
            console.warn("Mermaid render error:", err?.message || err);
            setError(true);
        }
    }, [chart]);

    useEffect(() => {
        renderChart();
    }, [renderChart]);

    if (error) {
        return (
            <div className="bg-[#131313] border border-[#262626] rounded-xl p-5 overflow-x-auto my-2">
                <pre className="text-[13px] text-[#A1A1AA] whitespace-pre-wrap font-mono leading-[1.6] select-text">
                    {rawSyntax}
                </pre>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex justify-center py-4 [&_svg]:max-w-full [&_svg]:h-auto"
        />
    );
};

/* ─── LaTeX-aware text renderer ─── */
const RenderMath = ({ text }) => {
    if (!text) return null;

    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        const blockMatch = remaining.match(/\$\$([^$]+)\$\$/);
        const inlineMatch = remaining.match(/\$([^$]+)\$/);

        const firstMatch =
            blockMatch && inlineMatch
                ? remaining.indexOf(blockMatch[0]) <= remaining.indexOf(inlineMatch[0])
                    ? { type: "block", match: blockMatch }
                    : { type: "inline", match: inlineMatch }
                : blockMatch
                    ? { type: "block", match: blockMatch }
                    : inlineMatch
                        ? { type: "inline", match: inlineMatch }
                        : null;

        if (!firstMatch) {
            parts.push(<span key={key++}>{remaining}</span>);
            break;
        }

        const idx = remaining.indexOf(firstMatch.match[0]);
        if (idx > 0) {
            parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        }

        try {
            if (firstMatch.type === "block") {
                parts.push(
                    <div key={key++} className="my-4 flex justify-center">
                        <BlockMath math={firstMatch.match[1].trim()} />
                    </div>
                );
            } else {
                parts.push(<InlineMath key={key++} math={firstMatch.match[1].trim()} />);
            }
        } catch {
            parts.push(<code key={key++} className="text-accent">{firstMatch.match[0]}</code>);
        }

        remaining = remaining.substring(idx + firstMatch.match[0].length);
    }

    return <>{parts}</>;
};

/* ─── Bullet / numbered list parser ─── */
const RenderContent = ({ content }) => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements = [];
    let key = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
            elements.push(
                <div key={key++} className="flex gap-3 items-start mb-2">
                    <span className="text-accent font-bold text-sm min-w-[1.25rem] mt-0.5">{numberedMatch[1]}.</span>
                    <span className="text-[#D4D4D8] leading-relaxed flex-1">
                        <RenderMath text={numberedMatch[2]} />
                    </span>
                </div>
            );
            continue;
        }

        const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);
        if (bulletMatch) {
            elements.push(
                <div key={key++} className="flex gap-3 items-start mb-2 ml-1">
                    <span className="text-accent mt-1.5 text-[6px]">●</span>
                    <span className="text-[#D4D4D8] leading-relaxed flex-1">
                        <RenderMath text={bulletMatch[1]} />
                    </span>
                </div>
            );
            continue;
        }

        if (trimmed.length > 0) {
            elements.push(
                <p key={key++} className="text-[#A1A1AA] leading-[1.75] mb-2">
                    <RenderMath text={trimmed} />
                </p>
            );
        } else {
            elements.push(<div key={key++} className="h-2" />);
        }
    }

    return <>{elements}</>;
};

/* ─── Inline block controls (toggle arrow → slider + actions) ─── */
const BlockControls = ({
    isLastBlock,
    onNext,
    showTuner,
    setShowTuner,
    density,
    setDensity,
    tuning,
    onApplyTuning,
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mb-6">
            {/* Toggle arrow */}
            <div className="flex justify-center">
                <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="group flex items-center gap-2 text-xs text-textSecondary hover:text-accent transition-colors py-2 px-4"
                >
                    <span
                        className={`inline-block transition-transform duration-300 text-sm ${expanded ? "rotate-180" : ""}`}
                    >
                        ▼
                    </span>
                    <span>{expanded ? "Hide controls" : "Actions"}</span>
                </button>
            </div>

            {/* Expandable controls panel */}
            <div
                className={`overflow-hidden transition-all duration-400 ease-out ${expanded ? "max-h-[400px] opacity-100 mt-2" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="bg-[#131313] border border-[#1E1E1E] rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Left — Density tuner */}
                        <div className="flex-1 w-full sm:w-auto">
                            <p className="text-textSecondary text-xs mb-2">
                                Is this explanation working for you?
                            </p>

                            {!showTuner ? (
                                <button
                                    className="text-xs text-accent border border-accent/30 hover:border-accent/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    onClick={() => setShowTuner(true)}
                                >
                                    <span>🔄</span> Tune Density
                                </button>
                            ) : (
                                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 mt-1 w-full sm:max-w-xs">
                                    <div className="flex justify-between mb-1.5 text-[10px] font-semibold tracking-widest uppercase text-textSecondary">
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
                                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer mb-3"
                                        style={{ accentColor: "#C8A24C" }}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onApplyTuning}
                                            disabled={tuning}
                                            className="flex-1 bg-accent text-black text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {tuning ? "Regenerating…" : "Apply & Swap"}
                                        </button>
                                        <button
                                            onClick={() => setShowTuner(false)}
                                            disabled={tuning}
                                            className="text-xs text-textSecondary border border-[#444] px-3 py-2 rounded-lg hover:border-[#666] transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right — Next / Assignment button */}
                        <button
                            onClick={onNext}
                            className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap text-sm flex items-center gap-2 group shrink-0"
                        >
                            {!isLastBlock ? (
                                <>
                                    I Understand, Next
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            ) : (
                                <>
                                    Take Assignment
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Floating Lesson Chat (AI Tutor) ─── */
const LessonChat = ({ topicName, currentBlock }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const cleanMarkdown = (text) =>
        text
            .replace(/```[\s\S]*?```/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/^[-*•]\s+/gm, '- ')
            .trim();

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: "user", content: text };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        setLoading(true);

        try {
            const blockContent = typeof currentBlock?.content === 'string'
                ? currentBlock.content
                : JSON.stringify(currentBlock?.content || '');

            const res = await api.post("/chat/lesson", {
                topicName: topicName || "General",
                blockTitle: currentBlock?.title || "",
                blockContent,
                userMessage: text,
                chatHistory: messages
            });

            const rawReply = res.data?.data?.reply || "Sorry, I couldn't generate a response.";
            const reply = cleanMarkdown(rawReply);
            setMessages(prev => [...prev, { role: "assistant", content: reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to get a response. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: open ? "48px" : "auto",
                    height: "48px",
                    borderRadius: open ? "50%" : "24px",
                    border: "1px solid #333",
                    background: "linear-gradient(145deg, #1E1E1E, #161616)",
                    color: "#C8A24C",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: open ? "0" : "0 16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    zIndex: 1001,
                    transition: "all 0.3s ease",
                    fontSize: open ? "1.2rem" : "0.9rem",
                    fontWeight: "bold"
                }}
            >
                {open ? "✕" : "💬 Ask AI Tutor"}
            </button>

            {/* Chat panel */}
            {open && (
                <div style={{
                    position: "fixed",
                    bottom: "84px",
                    right: "24px",
                    width: "380px",
                    maxHeight: "500px",
                    background: "linear-gradient(145deg, #1A1A1A, #0E0E0E)",
                    border: "1px solid #262626",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    zIndex: 1000,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    animation: "fadeInUp 0.25s ease-out"
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #262626",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <span style={{ fontSize: "1.1rem" }}>🤖</span>
                        <div>
                            <div style={{ color: "#F5F5F5", fontWeight: "bold", fontSize: "0.9rem" }}>AI Lesson Tutor</div>
                            <div style={{ color: "#A1A1AA", fontSize: "0.7rem" }}>Ask anything about this lesson</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        minHeight: "250px",
                        maxHeight: "350px"
                    }}>
                        {messages.length === 0 && (
                            <div style={{
                                color: "#555",
                                fontSize: "0.85rem",
                                textAlign: "center",
                                marginTop: "2rem"
                            }}>
                                Ask a question about what you're learning!
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                    maxWidth: "85%",
                                    padding: "10px 14px",
                                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, #C8A24C, #A88734)"
                                        : "#1E1E1E",
                                    color: msg.role === "user" ? "#000" : "#E2E8F0",
                                    fontSize: "0.85rem",
                                    lineHeight: "1.5",
                                    border: msg.role === "user" ? "none" : "1px solid #2A2A2A"
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}

                        {loading && (
                            <div style={{
                                alignSelf: "flex-start",
                                padding: "10px 14px",
                                borderRadius: "14px 14px 14px 4px",
                                background: "#1E1E1E",
                                border: "1px solid #2A2A2A",
                                color: "#A1A1AA",
                                fontSize: "0.85rem"
                            }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: "12px 14px",
                        borderTop: "1px solid #262626",
                        display: "flex",
                        gap: "8px"
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder="Type your question..."
                            style={{
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: "1px solid #333",
                                background: "#0E0E0E",
                                color: "#F5F5F5",
                                fontSize: "0.85rem",
                                outline: "none"
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "10px",
                                border: "none",
                                background: loading || !input.trim() ? "#333" : "#C8A24C",
                                color: loading || !input.trim() ? "#666" : "#000",
                                fontWeight: "bold",
                                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease"
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

/* ─── Main LessonView component ─── */
const LessonView = () => {
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const [lessonData, setLessonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

    // Tuning State
    const [showTuner, setShowTuner] = useState(false);
    const [density, setDensity] = useState(50);
    const [tuning, setTuning] = useState(false);

    const fetchLesson = async (forceRegenerate = false) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/topics/${topicId}/lesson`, { forceRegenerate });
            if (res.data?.data?.lesson) {
                setLessonData(res.data.data.lesson);
                setCurrentVisibleIndex(0);
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
            await api.patch(`/subjects/${subjectId}/density`, { density });
            await fetchLesson(true);
            setShowTuner(false);
            setDensity(50);
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

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [currentVisibleIndex]);

    const handleNextBlock = () => {
        if (lessonData && currentVisibleIndex < lessonData.blocks.length - 1) {
            setCurrentVisibleIndex((prev) => prev + 1);
        } else {
            navigate(`/dashboard/subject/${subjectId}/topic/${topicId}/assignment`);
        }
    };

    const totalBlocks = lessonData?.blocks?.length || 0;
    const progress = totalBlocks > 0 ? ((currentVisibleIndex + 1) / totalBlocks) * 100 : 0;

    const renderBlock = (block, index) => {
        const isVisible = index <= currentVisibleIndex;
        if (!isVisible) return null;

        const isLatest = index === currentVisibleIndex;
        const isLastBlock = index === totalBlocks - 1;

        const cardContent = (() => {
            switch (block.type) {
                case "concept":
                    return (
                        <div className={`lesson-block relative bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden ${isLatest ? "lesson-block-enter" : ""}`}>
                            <div className="h-1 bg-gradient-to-r from-accent/80 via-accent/40 to-transparent" />
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg">📘</div>
                                    <h3 className="text-xl font-bold text-[#F5F5F5] tracking-tight">{block.title}</h3>
                                </div>
                                <div className="mt-4">
                                    <RenderContent content={block.content} />
                                </div>
                            </div>
                        </div>
                    );

                case "mistakes":
                    return (
                        <div className={`lesson-block relative rounded-2xl overflow-hidden bg-[#1A1212] border border-red-500/15 ${isLatest ? "lesson-block-enter" : ""}`}>
                            <div className="h-1 bg-gradient-to-r from-red-500/60 via-red-500/20 to-transparent" />
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-lg">⚠️</div>
                                    <h3 className="text-xl font-bold text-red-400 tracking-tight">{block.title}</h3>
                                </div>
                                <div className="mt-4">
                                    <RenderContent content={block.content} />
                                </div>
                            </div>
                        </div>
                    );

                case "example":
                    return (
                        <div className={`lesson-block relative rounded-2xl overflow-hidden bg-[#151510] border border-accent/15 ${isLatest ? "lesson-block-enter" : ""}`}>
                            <div className="h-1 bg-gradient-to-r from-accent via-accent/40 to-transparent" />
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg">🧪</div>
                                    <h3 className="text-xl font-bold text-accent tracking-tight">{block.title}</h3>
                                </div>
                                <div className="mt-4 font-mono text-sm">
                                    <RenderContent content={block.content} />
                                </div>
                            </div>
                        </div>
                    );

                case "summary":
                    return (
                        <div className={`lesson-block relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#141418] to-[#141414] border border-accent/20 ${isLatest ? "lesson-block-enter" : ""}`}>
                            <div className="h-1 bg-gradient-to-r from-accent via-blue-500/40 to-accent/20" />
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg">🎯</div>
                                    <h3 className="text-xl font-bold text-accent tracking-tight">{block.title}</h3>
                                </div>
                                <div className="mt-4">
                                    <RenderContent content={block.content} />
                                </div>
                            </div>
                        </div>
                    );

                case "diagram":
                    return (
                        <div className={`lesson-block relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#131320] to-[#141418] border border-indigo-500/15 ${isLatest ? "lesson-block-enter" : ""}`}>
                            <div className="h-1 bg-gradient-to-r from-indigo-500/60 via-purple-500/40 to-transparent" />
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg">📊</div>
                                    <h3 className="text-xl font-bold text-indigo-300 tracking-tight">{block.title}</h3>
                                </div>
                                <div className="mt-4 bg-[#0E0E1A] border border-[#222] rounded-xl p-4 overflow-x-auto">
                                    <MermaidDiagram chart={typeof block.content === "string" ? block.content : JSON.stringify(block.content)} />
                                </div>
                            </div>
                        </div>
                    );

                default:
                    return (
                        <div className={`lesson-block bg-surface border border-border rounded-2xl p-6 md:p-8 ${isLatest ? "lesson-block-enter" : ""}`}>
                            <h3 className="text-xl font-bold text-[#F5F5F5] mb-4">{block.title}</h3>
                            <RenderContent content={block.content} />
                        </div>
                    );
            }
        })();

        return (
            <div key={index} className="mb-5">
                {cardContent}

                {/* Controls rendered below the current (latest visible) card */}
                {isLatest && (
                    <div className="mt-3" ref={bottomRef}>
                        <BlockControls
                            isLastBlock={isLastBlock}
                            onNext={handleNextBlock}
                            showTuner={showTuner}
                            setShowTuner={setShowTuner}
                            density={density}
                            setDensity={setDensity}
                            tuning={tuning}
                            onApplyTuning={handleApplyTuning}
                        />
                    </div>
                )}
            </div>
        );
    };

    /* ─── Loading State ─── */
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
                </div>
                <p className="text-textSecondary text-sm animate-pulse">Generating interactive lesson…</p>
            </div>
        );
    }

    /* ─── Error State ─── */
    if (error) {
        return (
            <div className="max-w-3xl mx-auto mt-16">
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
                    <div className="text-3xl mb-4">😔</div>
                    <p className="text-red-400 mb-5">{error}</p>
                    <button
                        onClick={() => navigate(`/dashboard/subject/${subjectId}`)}
                        className="text-sm text-accent hover:underline"
                    >
                        ← Back to Subject
                    </button>
                </div>
            </div>
        );
    }

    if (!lessonData || !lessonData.blocks) return null;

    return (
        <div className="max-w-[840px] mx-auto w-full px-4 pb-8">
            {/* ─── Back Button ─── */}
            <button
                onClick={() => navigate(`/dashboard/subject/${subjectId}`)}
                className="text-textSecondary hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Topics
            </button>

            {/* ─── Progress Bar ─── */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-textSecondary font-medium tracking-wide uppercase">
                        Lesson Progress
                    </span>
                    <span className="text-xs text-accent font-semibold">
                        {currentVisibleIndex + 1} / {totalBlocks} sections
                    </span>
                </div>
                <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#222]">
                    <div
                        className="h-full bg-gradient-to-r from-accent to-amber-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* ─── Lesson Blocks with inline controls ─── */}
            <div>
                {lessonData.blocks.map((block, index) => renderBlock(block, index))}
            </div>

            {/* Floating AI Tutor Chat */}
            <LessonChat
                topicName={lessonData?.topic_name || ""}
                currentBlock={lessonData.blocks[currentVisibleIndex]}
            />
        </div>
    );
};

export default LessonView;
