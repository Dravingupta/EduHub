import axios from "axios";
import { auth } from "../firebase/config";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

// Request Interceptor
api.interceptors.request.use(
    async (config) => {
        if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log("Unauthorized request - 401 error globally handled.");
        }
        return Promise.reject(error);
    }
);

export default api;
