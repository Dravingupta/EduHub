import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "2rem", border: "1px solid #333", borderRadius: "8px" }}>
                <h2>Welcome to EduHub</h2>
                <p style={{ marginBottom: "2rem" }}>Please sign in to continue</p>
                <button
                    onClick={handleLogin}
                    style={{ padding: "0.75rem 1.5rem", cursor: "pointer", background: "#4285F4", color: "#fff", border: "none", borderRadius: "4px" }}
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
