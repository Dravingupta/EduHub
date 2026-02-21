/**
 * Dashboard Page (Protected)
 *
 * Displays the authenticated user's information and provides a logout button.
 * This page is wrapped in <ProtectedRoute>, so unauthenticated users
 * are automatically redirected to /login.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Handle logout — signs user out and redirects to /login.
     */
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch {
            // Silently handle logout errors — user can retry
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Background decoration */}
            <div style={styles.bgOrb1} />
            <div style={styles.bgOrb2} />

            <div style={styles.container}>
                {/* Top bar */}
                <header style={styles.header}>
                    <div style={styles.brand}>
                        <span style={styles.brandIcon}>🎓</span>
                        <span style={styles.brandName}>EduHub</span>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Sign Out
                    </button>
                </header>

                {/* Welcome card */}
                <div style={styles.welcomeCard}>
                    <div style={styles.avatar}>
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <h1 style={styles.welcomeTitle}>Welcome to your Dashboard</h1>
                    <p style={styles.welcomeSubtitle}>
                        You're signed in and ready to go!
                    </p>
                </div>

                {/* Info grid */}
                <div style={styles.infoGrid}>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Email</div>
                        <div style={styles.infoValue}>{user?.email || "N/A"}</div>
                    </div>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>User ID</div>
                        <div style={styles.infoValue}>
                            {user?.uid ? `${user.uid.substring(0, 16)}...` : "N/A"}
                        </div>
                    </div>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Email Verified</div>
                        <div style={styles.infoValue}>
                            <span
                                style={{
                                    ...styles.badge,
                                    background: user?.emailVerified
                                        ? "rgba(34, 197, 94, 0.15)"
                                        : "rgba(245, 158, 11, 0.15)",
                                    color: user?.emailVerified ? "#4ade80" : "#fbbf24",
                                    border: user?.emailVerified
                                        ? "1px solid rgba(34, 197, 94, 0.3)"
                                        : "1px solid rgba(245, 158, 11, 0.3)",
                                }}
                            >
                                {user?.emailVerified ? "✓ Verified" : "⏳ Pending"}
                            </span>
                        </div>
                    </div>
                    <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Account Created</div>
                        <div style={styles.infoValue}>
                            {user?.metadata?.creationTime
                                ? new Date(user.metadata.creationTime).toLocaleDateString()
                                : "N/A"}
                        </div>
                    </div>
                </div>

                {/* Status bar */}
                <div style={styles.statusBar}>
                    <div style={styles.statusDot} />
                    <span style={styles.statusText}>
                        Firebase Auth Active — Token auto-refreshing
                    </span>
                </div>
            </div>
        </div>
    );
};

/* ── Inline Styles ─────────────────────────────────────────────────── */

const styles = {
    wrapper: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
    },
    bgOrb1: {
        position: "absolute",
        top: "-200px",
        right: "-200px",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    bgOrb2: {
        position: "absolute",
        bottom: "-150px",
        left: "-150px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
        pointerEvents: "none",
    },
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        marginBottom: "32px",
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    brandIcon: {
        fontSize: "28px",
    },
    brandName: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#ffffff",
        letterSpacing: "-0.3px",
    },
    logoutBtn: {
        padding: "10px 20px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    welcomeCard: {
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "48px 32px",
        marginBottom: "24px",
    },
    avatar: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "28px",
        fontWeight: "700",
        color: "#ffffff",
        margin: "0 auto 20px",
        boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
    },
    welcomeTitle: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#ffffff",
        margin: "0 0 8px 0",
        letterSpacing: "-0.5px",
    },
    welcomeSubtitle: {
        fontSize: "15px",
        color: "rgba(255, 255, 255, 0.45)",
        margin: 0,
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
    },
    infoCard: {
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "14px",
        padding: "20px",
    },
    infoLabel: {
        fontSize: "12px",
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.4)",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        marginBottom: "8px",
    },
    infoValue: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#ffffff",
        wordBreak: "break-all",
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
    },
    statusBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "14px",
        background: "rgba(34, 197, 94, 0.06)",
        border: "1px solid rgba(34, 197, 94, 0.15)",
        borderRadius: "12px",
    },
    statusDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#4ade80",
        boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
    },
    statusText: {
        fontSize: "13px",
        color: "rgba(255, 255, 255, 0.5)",
    },
};

export default Dashboard;
