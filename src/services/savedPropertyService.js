const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://hogenakkalhomestays.com/api"
).replace(/\/+$/, "");

/* =====================================
   Authentication helper
===================================== */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

/* =====================================
   Query-string helper
===================================== */

const createQueryString = (
  filters = {}
) => {
  const query =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
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
    }
  );

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
    const text = await response
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
        "Unable to complete the saved-property request."
    );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
};

/* =====================================
   Property ID validation
===================================== */

const requirePropertyId = (
  propertyId
) => {
  const normalizedPropertyId =
    String(
      propertyId || ""
    ).trim();

  if (!normalizedPropertyId) {
    const error = new Error(
      "Property ID is required."
    );

    error.status = 400;

    throw error;
  }

  return normalizedPropertyId;
};

/* =====================================
   Request helper
===================================== */

const request = async (
  path,
  {
    method = "GET",
    body,
  } = {}
) => {
  try {
    const token = getToken();

    if (!token) {
      const authenticationError =
        new Error(
          "Authentication required. Please login."
        );

      authenticationError.status =
        401;

      throw authenticationError;
    }

    const headers = {
      Authorization:
        `Bearer ${token}`,
    };

    const hasBody =
      body !== undefined &&
      body !== null;

    if (hasBody) {
      headers["Content-Type"] =
        "application/json";
    }

    const response = await fetch(
      `${API_URL}${path}`,
      {
        method,
        headers,

        ...(hasBody
          ? {
              body:
                JSON.stringify(
                  body
                ),
            }
          : {}),
      }
    );

    return await handleResponse(
      response
    );
  } catch (error) {
    if (
      error?.status !== undefined
    ) {
      throw error;
    }

    const networkError =
      new Error(
        "Unable to connect to the server. Please check whether the backend is running."
      );

    networkError.status = 0;

    networkError.originalError =
      error;

    throw networkError;
  }
};

/* =====================================
   Get logged-in user's saved properties
===================================== */

export const getSavedProperties =
  async (filters = {}) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/saved-properties${queryString}`
    );
  };

/* =====================================
   Get saved property IDs
===================================== */

export const getSavedPropertyIds =
  async () => {
    return request(
      "/saved-properties/ids"
    );
  };

/* =====================================
   Check whether property is saved
===================================== */

export const checkSavedProperty =
  async (propertyId) => {
    const normalizedPropertyId =
      requirePropertyId(
        propertyId
      );

    return request(
      `/saved-properties/${normalizedPropertyId}/check`
    );
  };

/* =====================================
   Save property
===================================== */

export const saveProperty =
  async (propertyId) => {
    const normalizedPropertyId =
      requirePropertyId(
        propertyId
      );

    return request(
      `/saved-properties/${normalizedPropertyId}`,
      {
        method: "POST",
      }
    );
  };

/* =====================================
   Toggle saved property
===================================== */

export const toggleSavedProperty =
  async (propertyId) => {
    const normalizedPropertyId =
      requirePropertyId(
        propertyId
      );

    return request(
      `/saved-properties/${normalizedPropertyId}/toggle`,
      {
        method: "PATCH",
      }
    );
  };

/* =====================================
   Remove saved property
===================================== */

export const removeSavedProperty =
  async (propertyId) => {
    const normalizedPropertyId =
      requirePropertyId(
        propertyId
      );

    return request(
      `/saved-properties/${normalizedPropertyId}`,
      {
        method: "DELETE",
      }
    );
  };