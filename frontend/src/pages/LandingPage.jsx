import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center px-6 py-20 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 w-full max-w-7xl mx-auto items-center">

                {/* LEFT COLUMN */}
                <div className="flex flex-col space-y-8">
                    <h1 className="text-6xl lg:text-8xl font-bold leading-tight tracking-tight">
                        Education.<br />
                        Engineered.
                    </h1>
                    <p className="text-xl text-textSecondary max-w-md">
                        Adaptive lessons. Deterministic mastery.<br />
                        Real measurable growth.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-accent text-black font-medium rounded-lg px-6 py-3 hover:opacity-90 transition-opacity"
                        >
                            Get Started
                        </button>
                        <button className="border border-border text-textPrimary font-medium rounded-lg px-6 py-3 hover:bg-surface transition-colors">
                            View Curriculum
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex justify-center lg:justify-end">
                    <div className="bg-surface border border-border rounded-2xl shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-6">Active Session</h3>

                        <div className="mb-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-textSecondary">Algorithms & Data Structures</span>
                                <span className="font-medium text-accent">84%</span>
                            </div>
                            <div className="w-full bg-[#0E0E0E] rounded-full h-2">
                                <div className="bg-accent h-2 rounded-full" style={{ width: '84%' }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0E0E0E] border border-border rounded-xl p-4">
                                <div className="text-textSecondary text-xs mb-1">Time Elapsed</div>
                                <div className="text-xl font-medium">42m</div>
                            </div>
                            <div className="bg-[#0E0E0E] border border-border rounded-xl p-4">
                                <div className="text-textSecondary text-xs mb-1">Mastery Gain</div>
                                <div className="text-xl font-medium text-green-500">+2.1%</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
