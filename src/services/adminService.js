const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =====================================
   Read authentication token
===================================== */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

/* =====================================
   Create authenticated headers
===================================== */

const getAuthenticatedHeaders = () => {
  const token = getToken();

  if (!token) {
    const error = new Error(
      "Authentication token is missing. Please login again."
    );

    error.status = 401;
    error.code = "TOKEN_MISSING";

    throw error;
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* =====================================
   Handle backend response
===================================== */

const handleResponse = async (
  response
) => {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Unable to complete the admin request."
    );

    error.status = response.status;
    error.code = data?.code;
    error.data = data;

    throw error;
  }

  return data;
};

/* =====================================
   Get dashboard statistics
===================================== */

export const getDashboardStatistics =
  async () => {
    const headers =
      getAuthenticatedHeaders();

    const response = await fetch(
      `${API_URL}/admin/dashboard-statistics`,
      {
        method: "GET",
        headers,
      }
    );

    return handleResponse(response);
  };

/* =====================================
   Admin error helper
===================================== */

export const getAdminErrorMessage = (
  error
) => {
  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return (
    "Unable to complete the admin request."
  );
};

/* =====================================
   Default export
===================================== */

const adminService = {
  getDashboardStatistics,
  getAdminErrorMessage,
};

export default adminService;