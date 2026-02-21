/**
 * Login / Register Page
 *
 * A polished, dark-themed authentication form that supports both
 * login and registration modes with smooth toggle animation.
 *
 * Features:
 *  - Email & password fields with validation
 *  - Toggle between Login and Register modes
 *  - Graceful error handling with user-visible messages
 *  - Redirects to /dashboard on successful auth
 *  - Automatically redirects if already logged in
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register, user } = useAuth();
    const navigate = useNavigate();

    // If user is already authenticated, redirect to dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    /**
     * Handle form submission for login or registration.
     * Clears previous errors and shows loading state during async call.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (isRegistering) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            // On success, redirect to dashboard
            navigate("/dashboard", { replace: true });
        } catch (err) {
            // Map Firebase error codes to friendly messages
            setError(getErrorMessage(err.code));
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Convert Firebase auth error codes to user-friendly messages.
     */
    const getErrorMessage = (code) => {
        const errorMap = {
            "auth/user-not-found": "No account found with this email.",
            "auth/wrong-password": "Incorrect password. Please try again.",
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/email-already-in-use": "An account with this email already exists.",
            "auth/weak-password": "Password must be at least 6 characters.",
            "auth/too-many-requests": "Too many attempts. Please try again later.",
            "auth/invalid-credential": "Invalid email or password.",
        };
        return errorMap[code] || "Authentication failed. Please try again.";
    };

    return (
        <div style={styles.wrapper}>
            {/* Decorative background elements */}
            <div style={styles.bgOrb1} />
            <div style={styles.bgOrb2} />

            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoIcon}>🎓</div>
                    <h1 style={styles.title}>
                        {isRegistering ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p style={styles.subtitle}>
                        {isRegistering
                            ? "Sign up to get started with EduHub"
                            : "Sign in to continue to EduHub"}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div style={styles.errorBox}>
                        <span style={styles.errorIcon}>⚠️</span>
                        {error}
                    </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={styles.input}
                            autoComplete="email"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={styles.input}
                            autoComplete={isRegistering ? "new-password" : "current-password"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...styles.submitBtn,
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {isSubmitting
                            ? "Please wait..."
                            : isRegistering
                                ? "Create Account"
                                : "Sign In"}
                    </button>
                </form>

                {/* Toggle between login and register */}
                <div style={styles.toggleSection}>
                    <span style={styles.toggleText}>
                        {isRegistering
                            ? "Already have an account?"
                            : "Don't have an account?"}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError("");
                        }}
                        style={styles.toggleBtn}
                    >
                        {isRegistering ? "Sign In" : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Inline Styles ─────────────────────────────────────────────────── */

const styles = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
    },
    bgOrb1: {
        position: "absolute",
        top: "-150px",
        right: "-150px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    bgOrb2: {
        position: "absolute",
        bottom: "-100px",
        left: "-100px",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    card: {
        width: "100%",
        maxWidth: "420px",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(99, 102, 241, 0.06)",
        position: "relative",
        zIndex: 1,
    },
    header: {
        textAlign: "center",
        marginBottom: "32px",
    },
    logoIcon: {
        fontSize: "48px",
        marginBottom: "16px",
    },
    title: {
        fontSize: "26px",
        fontWeight: "700",
        color: "#ffffff",
        margin: "0 0 8px 0",
        letterSpacing: "-0.5px",
    },
    subtitle: {
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.5)",
        margin: 0,
    },
    errorBox: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "12px",
        padding: "12px 16px",
        marginBottom: "20px",
        color: "#fca5a5",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    errorIcon: {
        fontSize: "16px",
        flexShrink: 0,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.6)",
        letterSpacing: "0.3px",
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        fontSize: "15px",
        color: "#ffffff",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxSizing: "border-box",
    },
    submitBtn: {
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        border: "none",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: "600",
        color: "#ffffff",
        letterSpacing: "0.3px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        marginTop: "4px",
        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
    },
    toggleSection: {
        textAlign: "center",
        marginTop: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
    },
    toggleText: {
        fontSize: "13px",
        color: "rgba(255, 255, 255, 0.4)",
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#818cf8",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "0",
        transition: "color 0.2s ease",
    },
};

export default Login;
