/**
 * App — Root Application Component
 *
 * Sets up:
 *  1. AuthProvider — wraps the entire app with auth context
 *  2. BrowserRouter — enables client-side routing
 *  3. Routes:
 *     - /login      → Login page (public)
 *     - /dashboard  → Dashboard page (protected)
 *     - /           → Redirects to /dashboard
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected route — requires authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect to dashboard (which will redirect to login if not auth'd) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
