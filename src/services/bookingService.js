const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const getToken = () => {
  return (
    localStorage.getItem(
      "token",
    ) ||
    sessionStorage.getItem(
      "token",
    ) ||
    ""
  );
};

const createHeaders = ({
  includeAuth = true,
  includeJson = false,
} = {}) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] =
      "application/json";
  }

  if (includeAuth) {
    const token =
      getToken();

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  return headers;
};

const createQueryString = (
  values = {},
) => {
  const query =
    new URLSearchParams();

  Object.entries(
    values,
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      if (
        Array.isArray(
          value,
        )
      ) {
        if (
          value.length > 0
        ) {
          query.append(
            key,
            value.join(","),
          );
        }

        return;
      }

      query.append(
        key,
        String(value),
      );
    },
  );

  const queryString =
    query.toString();

  return queryString
    ? `?${queryString}`
    : "";
};

const handleResponse =
  async (response) => {
    const contentType =
      response.headers.get(
        "content-type",
      );

    let data = null;

    if (
      contentType?.includes(
        "application/json",
      )
    ) {
      data =
        await response
          .json()
          .catch(
            () => null,
          );
    } else {
      const text =
        await response
          .text()
          .catch(
            () => "",
          );

      data = text
        ? {
            message: text,
          }
        : null;
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            `Request failed with status ${response.status}.`,
        );

      error.status =
        response.status;

      error.data = data;

      throw error;
    }

    return data;
  };

const request = async (
  path,
  {
    method = "GET",
    includeAuth = true,
    body,
  } = {},
) => {
  const hasBody =
    body !== undefined &&
    body !== null;

  try {
    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          method,

          credentials:
            "include",

          headers:
            createHeaders({
              includeAuth,
              includeJson:
                hasBody,
            }),

          ...(hasBody
            ? {
                body: JSON.stringify(
                  body,
                ),
              }
            : {}),
        },
      );

    return await handleResponse(
      response,
    );
  } catch (error) {
    if (
      error?.status !==
      undefined
    ) {
      throw error;
    }

    const networkError =
      new Error(
        "Unable to connect to the server. Please check whether the backend is running.",
      );

    networkError.status = 0;

    networkError.originalError =
      error;

    throw networkError;
  }
};

export const checkAvailability =
  async ({
    propertyId,
    checkInDate,
    checkOutDate,
  }) => {
    const queryString =
      createQueryString({
        propertyId,
        checkInDate,
        checkOutDate,
      });

    return request(
      `/bookings/availability${queryString}`,
      {
        includeAuth: false,
      },
    );
  };

export const createBooking =
  async (
    bookingData,
  ) => {
    return request(
      "/bookings",
      {
        method: "POST",
        body: bookingData,
      },
    );
  };

export const getMyBookings =
  async (
    filters = {},
  ) => {
    const queryString =
      createQueryString(
        filters,
      );

    return request(
      `/bookings/my-bookings${queryString}`,
    );
  };

export const getOwnerBookings =
  async (
    filters = {},
  ) => {
    const queryString =
      createQueryString(
        filters,
      );

    return request(
      `/bookings/owner-bookings${queryString}`,
    );
  };

export const getManagedBookings =
  async (
    filters = {},
  ) => {
    const queryString =
      createQueryString(
        filters,
      );

    return request(
      `/bookings/manage${queryString}`,
    );
  };

export const getBookingById =
  async (
    bookingId,
  ) => {
    return request(
      `/bookings/${bookingId}`,
    );
  };

export const updateBookingStatus =
  async (
    bookingId,
    bookingStatus,
    details = {},
  ) => {
    return request(
      `/bookings/${bookingId}/status`,
      {
        method: "PATCH",

        body: {
          ...details,
          bookingStatus,
        },
      },
    );
  };

export const cancelBooking =
  async (
    bookingId,
    reason,
  ) => {
    return request(
      `/bookings/${bookingId}/cancel`,
      {
        method: "PATCH",

        body: {
          reason,
        },
      },
    );
  };