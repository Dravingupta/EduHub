import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const navLinkStyle = (path) => ({
        display: "block",
        padding: "0.75rem 1rem",
        marginBottom: "0.5rem",
        color: location.pathname === path ? "#C8A24C" : "#A1A1AA",
        background: location.pathname === path ? "#1E1E1E" : "transparent",
        borderRadius: "4px",
        textDecoration: "none",
        fontWeight: location.pathname === path ? "bold" : "normal",
        transition: "all 0.2s ease"
    });

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0E0E0E", color: "#F5F5F5" }}>
            {/* Sidebar */}
            <aside style={{ width: "250px", borderRight: "1px solid #262626", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
                <h3 style={{ marginBottom: "2rem", color: "#F5F5F5", fontSize: "1.25rem" }}>EduHub</h3>

                <nav style={{ flex: 1 }}>
                    <Link to="/dashboard" style={navLinkStyle("/dashboard")}>
                        Subjects
                    </Link>
                    <Link to="/dashboard/analytics" style={navLinkStyle("/dashboard/analytics")}>
                        Data Analytics
                    </Link>
                    <Link to="#" style={{ ...navLinkStyle("#"), opacity: 0.5, cursor: "not-allowed" }}>
                        Settings (Coming Soon)
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "2rem" }}>
                {/* Top bar */}
                <header style={{ width: "100%", display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #262626", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: "500" }}>Welcome, {currentUser?.displayName || "User"}</h2>
                    <button
                        onClick={logout}
                        style={{
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            background: "#161616",
                            color: "#F5F5F5",
                            border: "1px solid #262626",
                            borderRadius: "4px",
                            transition: "background 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#262626"}
                        onMouseLeave={(e) => e.target.style.background = "#161616"}
                    >
                        Logout
                    </button>
                </header>

                {/* Dynamic Nested Route Content */}
                <div style={{ flex: 1 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
