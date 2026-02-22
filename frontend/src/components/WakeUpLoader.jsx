import { useState, useEffect } from "react";
import api from "../services/api";

const WakeUpLoader = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Waking up the EduHub AI engine...");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let isMounted = true;
        let pingerInterval;
        let messageTimer;
        let progressInterval;

        const checkHealth = async () => {
            try {
                // Keep the timeout short so we can ping repeatedly if it fails
                await api.get("/health", { timeout: 10000 });
                if (isMounted) setIsReady(true);
            } catch (error) {
                // Expected when waking up on Render: 502s, 503s, or timeouts
                console.log("Server still waking up...");
            }
        };

        const startChecking = () => {
            checkHealth();
            pingerInterval = setInterval(checkHealth, 5000); // Ping every 5 seconds until ready
        };

        // Simulate progress bar and change messages while waiting
        progressInterval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.random() * 5;
                return next > 95 ? 95 : next; // Cap at 95% until actually ready
            });
        }, 1000);

        messageTimer = setTimeout(() => {
            if (isMounted && !isReady) {
                setLoadingMessage("Warming up the servers... This can take up to 60 seconds.");
            }
        }, 8000);

        const thirdTimer = setTimeout(() => {
            if (isMounted && !isReady) {
                setLoadingMessage("Almost there! Securing your learning environment...");
            }
        }, 25000); // 25 seconds

        startChecking();

        return () => {
            isMounted = false;
            clearInterval(pingerInterval);
            clearInterval(progressInterval);
            clearTimeout(messageTimer);
            clearTimeout(thirdTimer);
        };
    }, []);

    if (isReady) {
        return children;
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

                {/* Logo Box */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-black font-black text-3xl shadow-[0_0_30px_rgba(200,162,76,0.5)] mb-8 animate-pulse">
                    E
                </div>

                <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">
                    Edu<span className="text-accent">Hub</span>
                </h2>

                <p className="text-textSecondary text-sm mb-10 h-10 flex items-center justify-center animate-fade-in">
                    {loadingMessage}
                </p>

                {/* Loading Bar */}
                <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#222]">
                    <div
                        className="h-full bg-gradient-to-r from-accent to-amber-500 rounded-full transition-all duration-300 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]" />
                    </div>
                </div>

                <p className="mt-4 text-[10px] text-[#555] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full border border-accent border-t-transparent animate-spin inline-block" />
                    Initializing Workspace
                </p>
            </div>
        </div>
    );
};

export default WakeUpLoader;
