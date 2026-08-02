const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

/* =====================================
   Authentication helpers
===================================== */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const createQueryString = (
  filters = {}
) => {
  const query = new URLSearchParams();

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
        "Unable to complete the request."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

const request = async (path) => {
  try {
    const token = getToken();

    const headers = {
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}${path}`,
      {
        method: "GET",
        headers,
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

    const networkError = new Error(
      "Unable to connect to the server. Please check whether the backend is running."
    );

    networkError.status = 0;

    networkError.originalError =
      error;

    throw networkError;
  }
};

/* =====================================
   Finance summary
===================================== */

export const getFinanceSummary =
  async (filters = {}) => {
    const queryString =
      createQueryString(filters);

    return request(
      `/payments/admin/summary${queryString}`
    );
  };

/* =====================================
   Finance transactions
===================================== */

export const getFinanceTransactions =
  async (filters = {}) => {
    const queryString =
      createQueryString(filters);

    return request(
      `/payments/admin/transactions${queryString}`
    );
  };