import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed", err);
            if (err?.code !== "auth/popup-closed-by-user") {
                setError("Login failed. Please try again.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-[#0A0A0A]">

            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors z-20 text-sm font-medium group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Home
            </Link>

            {/* Background ambient glow */}
            <div className="absolute top-[-20%] left-[15%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-10 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-accent/20">
                            E
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            Edu<span className="text-accent">Hub</span>
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                        Welcome back
                    </h1>
                    <p className="text-textSecondary text-base max-w-xs mx-auto leading-relaxed">
                        Sign in to continue your personalized learning journey
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-3xl p-8 shadow-2xl shadow-black/50 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    {/* Error message */}
                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-white/5 disabled:opacity-60 disabled:cursor-wait group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        <span>{loading ? "Signing in…" : "Continue with Google"}</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#1E1E1E]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#111111] px-4 text-xs text-textSecondary uppercase tracking-widest">
                                Secure Login
                            </span>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-6 text-textSecondary">
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            <span>Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <span>Firebase Auth</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>No Data Stored</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-textSecondary text-xs mt-8 opacity-60">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
