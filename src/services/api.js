import axios from "axios";

const api = axios.create({
  baseURL: "https://hhs-backend-cwzx.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;