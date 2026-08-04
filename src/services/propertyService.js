const API_URL = (
   import.meta.env.VITE_API_URL ||
  "https://hogenakkalhomestays.com/api"
).replace(/\/+$/, "");

/* =====================================
   Authentication helpers
===================================== */

const parseStoredToken = (
  storedValue
) => {
  if (!storedValue) {
    return "";
  }

  try {
    const parsedValue =
      JSON.parse(storedValue);

    if (
      typeof parsedValue ===
      "string"
    ) {
      return parsedValue;
    }

    return (
      parsedValue?.token || ""
    );
  } catch {
    return storedValue;
  }
};

const getToken = () => {
  const directToken =
    localStorage.getItem(
      "token"
    ) ||
    sessionStorage.getItem(
      "token"
    );

  if (directToken) {
    return parseStoredToken(
      directToken
    );
  }

  const storedAuth =
    localStorage.getItem(
      "auth"
    ) ||
    sessionStorage.getItem(
      "auth"
    );

  return parseStoredToken(
    storedAuth
  );
};

const createHeaders = ({
  includeAuth = false,
  includeJson = false,
} = {}) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] =
      "application/json";
  }

  if (includeAuth) {
    const token = getToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  return headers;
};

/* =====================================
   Query-string helper
===================================== */

const createQueryString = (
  filters = {}
) => {
  const query =
    new URLSearchParams();

  Object.entries(
    filters
  ).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        query.append(
          key,
          value.join(",")
        );
      }

      return;
    }

    query.append(
      key,
      String(value)
    );
  });

  const queryString =
    query.toString();

  return queryString
    ? `?${queryString}`
    : "";
};

/* =====================================
   Response helper
===================================== */

const handleResponse = async (
  response
) => {
  const contentType =
    response.headers.get(
      "content-type"
    );

  let data = null;

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    data = await response
      .json()
      .catch(() => null);
  } else {
    const text =
      await response
        .text()
        .catch(() => "");

    data = text
      ? {
          message: text,
        }
      : null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Unable to complete the request."
    );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
};

/* =====================================
   Request helper
===================================== */
const request = async (
  path,
  {
    method = "GET",
    includeAuth = false,
    body,
  } = {}
) => {
  try {
    const hasBody = body !== undefined && body !== null;
    const isFormData = body instanceof FormData;

    const options = {
      method,
      credentials: "include",
      headers: createHeaders({
        includeAuth,
        includeJson: hasBody && !isFormData,
      }),
    };

    if (hasBody) {
      options.body = isFormData
        ? body
        : JSON.stringify(body);
    }

    const response = await fetch(
      `${API_URL}${path}`,
      options
    );

    return await handleResponse(response);
  } catch (error) {
    if (error?.status !== undefined) {
      throw error;
    }

    const networkError = new Error(
      "Unable to connect to the server. Please check whether the backend is running."
    );

    networkError.status = 0;
    networkError.originalError = error;

    throw networkError;
  }
};

/* =====================================
   Public property APIs
===================================== */

export const getProperties =
  async (filters = {}) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/properties${queryString}`
    );
  };

export const getFeaturedProperties =
  async (limit = 6) => {
    const queryString =
      createQueryString({
        limit,
      });

    return request(
      `/properties/featured${queryString}`
    );
  };

export const getPropertyById =
  async (propertyId) => {
    return request(
      `/properties/${propertyId}`
    );
  };

/* =====================================
   Owner/authenticated-user APIs
===================================== */

export const getMyProperties =
  async (filters = {}) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/properties/owner/my-properties${queryString}`,
      {
        includeAuth: true,
      }
    );
  };

export const getManagedPropertyById =
  async (propertyId) => {
    return request(
      `/properties/manage/${propertyId}`,
      {
        includeAuth: true,
      }
    );
  };

  export const createProperty =
    async (propertyData) => {
      return request(
        "/properties",
        {
          method: "POST",

          includeAuth: true,

          body: propertyData,
        }
      );
    };

export const updateProperty =
  async (
    propertyId,
    propertyData
  ) => {
    return request(
      `/properties/${propertyId}`,
      {
        method: "PUT",

        includeAuth: true,

        body: propertyData,
      }
    );
  };

export const deleteProperty =
  async (propertyId) => {
    return request(
      `/properties/${propertyId}`,
      {
        method: "DELETE",

        includeAuth: true,
      }
    );
  };

export const updatePropertyActiveStatus =
  async (
    propertyId,
    isActive
  ) => {
    return request(
      `/properties/${propertyId}/active`,
      {
        method: "PATCH",

        includeAuth: true,

        body: {
          isActive,
        },
      }
    );
  };

/* =====================================
   Admin property APIs
===================================== */

export const getAdminProperties =
  async (filters = {}) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/properties/admin/all${queryString}`,
      {
        includeAuth: true,
      }
    );
  };

export const getPendingProperties =
  async (filters = {}) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/properties/admin/pending${queryString}`,
      {
        includeAuth: true,
      }
    );
  };

export const approveProperty =
  async (
    propertyId,
    note = ""
  ) => {
    return request(
      `/properties/admin/${propertyId}/approve`,
      {
        method: "PATCH",

        includeAuth: true,

        body: {
          note,
        },
      }
    );
  };

export const rejectProperty =
  async (
    propertyId,
    reason,
    note = ""
  ) => {
    return request(
      `/properties/admin/${propertyId}/reject`,
      {
        method: "PATCH",

        includeAuth: true,

        body: {
          reason,
          note,
        },
      }
    );
  };

export const updatePropertyFeaturedStatus =
  async (
    propertyId,
    isFeatured
  ) => {
    return request(
      `/properties/admin/${propertyId}/featured`,
      {
        method: "PATCH",

        includeAuth: true,

        body: {
          isFeatured,
        },
      }
    );
  };

/* =====================================
   Backward-compatible function names

   These aliases prevent existing
   frontend imports from breaking.
===================================== */

export const getApprovalQueue =
  getPendingProperties;

export const updatePropertyApproval =
  async (
    propertyId,
    approvalStatus,
    details = {}
  ) => {
    if (
      approvalStatus ===
      "approved"
    ) {
      return approveProperty(
        propertyId,
        details.note || ""
      );
    }

    if (
      approvalStatus ===
      "rejected"
    ) {
      const reason =
        details.reason ||
        details.rejectionReason ||
        "";

      if (!reason.trim()) {
        const error =
          new Error(
            "A rejection reason is required."
          );

        error.status = 400;

        throw error;
      }

      return rejectProperty(
        propertyId,
        reason,
        details.note || ""
      );
    }

    const error = new Error(
      "The backend supports approved or rejected review actions."
    );

    error.status = 400;

    throw error;
  };

export const resubmitProperty =
  async (propertyId) => {
    /*
     Updating a rejected property automatically
     returns it to pending status in the backend.
    */

    return updateProperty(
      propertyId,
      {}
    );
  };

export const toggleFeaturedProperty =
  async (propertyId) => {
    return request(
      `/properties/admin/${propertyId}/featured`,
      {
        method: "PATCH",

        includeAuth: true,
      }
    );
  };

/* =====================================
   Error-message helper
===================================== */

export const getPropertyApiErrorMessage =
  (
    error,
    fallbackMessage =
      "Something went wrong. Please try again."
  ) => {
    return (
      error?.data?.message ||
      error?.message ||
      fallbackMessage
    );
  };