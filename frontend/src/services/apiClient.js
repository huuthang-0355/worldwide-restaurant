import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../constants/api";

// Track current portal context
let currentPortal = "staff"; // "staff" or "customer"

export const setPortalContext = (portal) => {
    currentPortal = portal;
};

export const getPortalContext = () => currentPortal;

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor (adds auth token based on portal context)
apiClient.interceptors.request.use(
    (config) => {
        // Determine which token to use based on portal context
        const tokenKey =
            currentPortal === "staff"
                ? STORAGE_KEYS.STAFF_TOKEN
                : STORAGE_KEYS.CUSTOMER_TOKEN;

        const token = localStorage.getItem(tokenKey);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status
            console.error("API Error:", error.response.data);

            // Handle 401 Unauthorized - redirect to login
            if (error.response.status === 401) {
                const loginPath =
                    currentPortal === "staff" ? "/admin/login" : "/login";
                // Only redirect if not already on login page
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = loginPath;
                }
            }
        } else if (error.request) {
            // Request made but no response
            console.error("Network Error:", error.message);
        } else {
            console.error("Error:", error.message);
        }
        return Promise.reject(error);
    },
);

export default apiClient;
