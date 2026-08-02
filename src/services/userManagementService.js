const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =====================================
   Helpers
===================================== */

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response) => {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Unable to complete the request."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

/* =====================================
   Get customers and owners
===================================== */

export const getUsers = async (
  filters = {}
) => {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(key, value);
      }
    }
  );

  const queryString = query.toString();

  const response = await fetch(
    `${API_URL}/users${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Get individual user
===================================== */

export const getUserById = async (
  userId
) => {
  const response = await fetch(
    `${API_URL}/users/${userId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Change customer/owner role
===================================== */

export const updateUserRole = async (
  userId,
  role
) => {
  const response = await fetch(
    `${API_URL}/users/${userId}/role`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        role,
      }),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Verify or unverify user
===================================== */

export const toggleUserVerification =
  async (userId) => {
    const response = await fetch(
      `${API_URL}/users/${userId}/verification`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

/* =====================================
   Activate or suspend user
===================================== */

export const toggleUserStatus = async (
  userId
) => {
  const response = await fetch(
    `${API_URL}/users/${userId}/status`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};