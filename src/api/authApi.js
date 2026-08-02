import api from "./axios";

export const registerUser = (userData) =>
  api.post("/auth/register", userData);

export const loginUser = (userData) =>
  api.post("/auth/login", userData);

export const getProfile = (token) =>
  api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const logoutUser = (token) =>
  api.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );