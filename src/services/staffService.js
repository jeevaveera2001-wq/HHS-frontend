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
   Get staff members
===================================== */

export const getStaffMembers = async (
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
    `${API_URL}/staff${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Create staff account
===================================== */

export const createStaffMember = async (
  staffData
) => {
  const response = await fetch(
    `${API_URL}/staff`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(staffData),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Update staff member
===================================== */

export const updateStaffMember = async (
  staffId,
  staffData
) => {
  const response = await fetch(
    `${API_URL}/staff/${staffId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(staffData),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Update staff permissions
===================================== */

export const updateStaffPermissions = async (
  staffId,
  permissionData
) => {
  const response = await fetch(
    `${API_URL}/staff/${staffId}/permissions`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(permissionData),
    }
  );

  return handleResponse(response);
};

/* =====================================
   Activate or deactivate staff
===================================== */

export const toggleStaffStatus = async (
  staffId
) => {
  const response = await fetch(
    `${API_URL}/staff/${staffId}/status`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};