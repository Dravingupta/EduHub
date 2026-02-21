/**
 * ProtectedRoute — Route Guard Component
 *
 * Wraps routes that require authentication.
 *  - While auth state is loading → shows a centered spinner
 *  - If no user is signed in   → redirects to /login
 *  - If user is authenticated  → renders the children
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   } />
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Show a loading spinner while Firebase resolves the auth state
    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "#0a0a1a",
                }}
            >
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        border: "4px solid rgba(99, 102, 241, 0.2)",
                        borderTop: "4px solid #6366f1",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // No authenticated user → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated → render the protected content
    return children;
};

export default ProtectedRoute;
