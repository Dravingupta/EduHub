import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center px-6 py-20 lg:py-0 border-b border-[#262626]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 w-full max-w-7xl mx-auto items-center">

                    {/* LEFT COLUMN */}
                    <div className="flex flex-col space-y-8 animate-slide-up">
                        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight text-[#F5F5F5]">
                            Education.<br />
                            <span className="text-[#C8A24C]">Engineered.</span>
                        </h1>
                        <p className="text-xl text-[#A1A1AA] max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                            The intelligent learning engine that adapts to you. Experience progressive lessons, deterministic mastery evaluation, and zero-latency universal curriculum.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-[#C8A24C] text-black font-bold rounded-xl px-8 py-4 hover:bg-[#D4AF57] transition-all hover:-translate-y-1 shadow-[0_0_20px_rgba(200,162,76,0.2)] hover:shadow-[0_0_30px_rgba(200,162,76,0.5)]"
                            >
                                Get Started Free
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="border border-[#262626] text-[#F5F5F5] font-medium rounded-xl px-8 py-4 hover:bg-[#1A1A1A] transition-colors"
                            >
                                View Curriculum
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex justify-center lg:justify-end relative">
                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#C8A24C] blur-[100px] opacity-10 rounded-full animate-pulse-slow"></div>

                        <div className="bg-[#131313] border border-[#262626] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-8 w-full max-w-md relative z-10 backdrop-blur-xl animate-scale-in animate-float">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active Learning Session
                            </h3>

                            <div className="mb-8">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[#A1A1AA]">Physics JEE: Thermodynamics</span>
                                    <span className="font-bold text-[#C8A24C]">84%</span>
                                </div>
                                <div className="w-full bg-[#0E0E0E] rounded-full h-2 border border-[#262626]">
                                    <div className="bg-gradient-to-r from-[#C8A24C] to-[#E5C16C] h-[6px] rounded-full mx-[1px] mt-[1px]" style={{ width: '84%' }}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0E0E0E] border border-[#262626] rounded-xl p-4">
                                    <div className="text-[#A1A1AA] text-xs mb-1 uppercase tracking-wider font-semibold">Time Elapsed</div>
                                    <div className="text-2xl font-bold font-mono">42<span className="text-sm text-[#A1A1AA]">m</span></div>
                                </div>
                                <div className="bg-[#0E0E0E] border border-[#262626] rounded-xl p-4">
                                    <div className="text-[#A1A1AA] text-xs mb-1 uppercase tracking-wider font-semibold">Mastery Gain</div>
                                    <div className="text-2xl font-bold font-mono text-green-500">+2.1<span className="text-sm">%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* FEATURES SECTION */}
            <div id="features" className="w-full bg-[#0E0E0E] px-6 py-24 border-b border-[#262626]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-[#F5F5F5]">A smarter way to learn.</h2>
                        <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto">EduHub isn't just an AI wrapper. It's a token-efficient learning core engineered for deterministic progress and radical personalization.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* FEATURE 1 */}
                        <div className="bg-[#131313] border border-[#262626] rounded-2xl p-8 hover:border-[#444] transition-all duration-300 hover:-translate-y-2 group animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                ⚡️
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#F5F5F5] group-hover:text-indigo-400 transition-colors">Instant Universal Content</h3>
                            <p className="text-[#A1A1AA] leading-relaxed">
                                Dive instantly into pre-generated comprehensive libraries for massive courses like JEE or NEET with zero loading times and zero API costs.
                            </p>
                        </div>

                        {/* FEATURE 2 */}
                        <div className="bg-[#131313] border border-[#262626] rounded-2xl p-8 hover:border-[#444] transition-all duration-300 hover:-translate-y-2 group animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                🎛️
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#F5F5F5] group-hover:text-green-400 transition-colors">Adaptive Swap Engine</h3>
                            <p className="text-[#A1A1AA] leading-relaxed">
                                Finding an explanation too dense or too brief? Use the interactive tuning dial to instantly swap out lesson blocks targeted precisely to your reading level.
                            </p>
                        </div>

                        {/* FEATURE 3 */}
                        <div className="bg-[#131313] border border-[#262626] rounded-2xl p-8 hover:border-[#444] transition-all duration-300 hover:-translate-y-2 group animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                🖼️
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#F5F5F5] group-hover:text-purple-400 transition-colors">Progressive Visual Delivery</h3>
                            <p className="text-[#A1A1AA] leading-relaxed">
                                Say goodbye to infinite walls of markdown text. Experience lessons cleanly formatted into interactive concept cards, math equations, and auto-rendered diagrams.
                            </p>
                        </div>

                        {/* FEATURE 4 */}
                        <div className="bg-[#131313] border border-[#262626] rounded-2xl p-8 hover:border-[#444] transition-all duration-300 hover:-translate-y-2 group animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                🤖
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#F5F5F5] group-hover:text-orange-400 transition-colors">Inline AI Learning Tutor</h3>
                            <p className="text-[#A1A1AA] leading-relaxed">
                                Stuck on a concept or got an assignment question wrong? Chat with the contextual AI tutor directly alongside your lesson without ever losing your place.
                            </p>
                        </div>

                        {/* FEATURE 5 */}
                        <div className="bg-[#131313] border border-[#262626] rounded-2xl p-8 hover:border-[#444] transition-all duration-300 hover:-translate-y-2 group animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                📈
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#F5F5F5] group-hover:text-blue-400 transition-colors">Deterministic Mastery</h3>
                            <p className="text-[#A1A1AA] leading-relaxed">
                                Stop guessing what you know. Our standardized 10-question modular evaluation engine precisely calculates your mastery based on calculated difficulty distributions.
                            </p>
                        </div>

                        {/* FEATURE 6 */}
                        <div className="bg-[#131313] border border-[#262626] rounded-2xl p-8 hover:border-[#444] transition-all duration-300 hover:-translate-y-2 group animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                            <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                🧠
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#F5F5F5] group-hover:text-red-400 transition-colors">Custom AI Subjects</h3>
                            <p className="text-[#A1A1AA] leading-relaxed">
                                Have a niche college course? Feed EduHub your syllabus and let our AI agents generate a fully mapped curriculum with identical tracking features.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="w-full py-24 px-6 flex items-center justify-center bg-gradient-to-b from-[#0E0E0E] to-[#131313]">
                <div className="max-w-3xl text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#F5F5F5]">Ready to engineer your education?</h2>
                    <p className="text-[#A1A1AA] text-lg mb-10">Join the next generation of adaptive, token-efficient learning platforms.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-[#C8A24C] text-black font-bold rounded-xl px-10 py-5 text-lg hover:bg-[#D4AF57] transition-all hover:scale-105 shadow-[0_0_30px_rgba(200,162,76,0.3)]"
                    >
                        Create Your Free Account
                    </button>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;
