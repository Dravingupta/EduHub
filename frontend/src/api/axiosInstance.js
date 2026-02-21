/**
 * Axios Instance with Firebase Auth Interceptor
 *
 * Creates a pre-configured Axios instance that:
 *  1. Uses VITE_API_BASE_URL as the base URL
 *  2. Automatically attaches the Firebase ID token as a Bearer token
 *     on every outgoing request (if a user is signed in)
 *  3. Always force-refreshes the token to ensure it's valid
 *
 * Usage:
 *   import api from "../api/axiosInstance";
 *   const res = await api.get("/some-endpoint");
 */

import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request Interceptor
 *
 * Before every request, check if a Firebase user is signed in.
 * If so, force-refresh the ID token and attach it as a Bearer token.
 * This ensures the backend always receives a valid, non-expired token.
 */
api.interceptors.request.use(
    async (config) => {
        const currentUser = auth.currentUser;

        if (currentUser) {
            try {
                // Force refresh ensures we always send a valid token
                const token = await currentUser.getIdToken(true);
                config.headers.Authorization = `Bearer ${token}`;
            } catch {
                // If token refresh fails, send request without auth header.
                // The backend should return 401, and the frontend can handle it.
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor (optional enhancement)
 *
 * Handles common response errors globally.
 * 401 responses could trigger a logout or redirect to login.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired — could redirect to login here
            // For now, just reject so the calling code can handle it
        }
        return Promise.reject(error);
    }
);

export default api;
