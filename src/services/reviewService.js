const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
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
        "Unable to complete the review request."
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
    const headers = {};

    const hasBody =
      body !== undefined &&
      body !== null;

    if (hasBody) {
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
   Get public property reviews
===================================== */

export const getPropertyReviews =
  async (
    propertyId,
    filters = {}
  ) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/reviews/property/${propertyId}${queryString}`
    );
  };

/* =====================================
   Get logged-in customer's reviews
===================================== */

export const getMyReviews =
  async () => {
    return request(
      "/reviews/my-reviews",
      {
        includeAuth: true,
      }
    );
  };

/* =====================================
   Get managed reviews
===================================== */

export const getManagedReviews =
  async (filters = {}) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/reviews/manage${queryString}`,
      {
        includeAuth: true,
      }
    );
  };

/* =====================================
   Create verified review
===================================== */

export const createReview =
  async (reviewData) => {
    return request(
      "/reviews",
      {
        method: "POST",
        includeAuth: true,
        body: reviewData,
      }
    );
  };

/* =====================================
   Update customer review
===================================== */

export const updateReview =
  async (
    reviewId,
    reviewData
  ) => {
    return request(
      `/reviews/${reviewId}`,
      {
        method: "PUT",
        includeAuth: true,
        body: reviewData,
      }
    );
  };

/* =====================================
   Delete review
===================================== */

export const deleteReview =
  async (reviewId) => {
    return request(
      `/reviews/${reviewId}`,
      {
        method: "DELETE",
        includeAuth: true,
      }
    );
  };

/* =====================================
   Property-owner reply
===================================== */

export const replyToReview =
  async (
    reviewId,
    message
  ) => {
    return request(
      `/reviews/${reviewId}/reply`,
      {
        method: "PATCH",
        includeAuth: true,

        body: {
          message,
        },
      }
    );
  };

/* =====================================
   Staff review moderation
===================================== */

export const updateReviewVisibility =
  async (
    reviewId,
    isVisible,
    note = ""
  ) => {
    return request(
      `/reviews/${reviewId}/visibility`,
      {
        method: "PATCH",
        includeAuth: true,

        body: {
          isVisible,
          note,
        },
      }
    );
  };