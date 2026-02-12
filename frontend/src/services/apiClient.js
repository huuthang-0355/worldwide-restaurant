import axios from "axios";
import { API_BASE_URL } from "../constants/api";

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor (for adding auth tokens later)
apiClient.interceptors.request.use(
    (config) => {
        // TODO: Add authentication token when implemented
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
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
