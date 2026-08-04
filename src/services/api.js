import axios from "axios";

// 1. Correctly read the Vite environment variable
// We include a fallback URL just in case the environment variable fails to load
const baseURL = import.meta.env.PROD
  ? "https://hhs-backend-cwzx.onrender.com/api"
  : "http://localhost:5000/api";

// 2. Create the Axios instance
const apiClient = axios.create({
  baseURL:  baseURL,
  // CRUCIAL: This allows your frontend to send and receive the secure admin cookie
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================================
   Optional: Global Error Handling
===================================== */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend says 401 Unauthorized (cookie missing or expired)
    if (error.response && error.response.status === 401) {
      console.error("Authentication error: Please log in again.");
      // Optional: You can force a redirect to login here if needed
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;