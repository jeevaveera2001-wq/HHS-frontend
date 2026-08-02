const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

/* =====================================
   Authentication helper
===================================== */

const getToken = () => {
  return (
    localStorage.getItem(
      "token"
    ) ||
    sessionStorage.getItem(
      "token"
    )
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

  Object.entries(
    filters
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value ===
          undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      if (
        Array.isArray(
          value
        )
      ) {
        if (
          value.length > 0
        ) {
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
    const error =
      new Error(
        data?.message ||
          "Unable to complete the payout-account request."
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
    body,
  } = {}
) => {
  try {
    const token =
      getToken();

    if (!token) {
      const authenticationError =
        new Error(
          "Authentication required. Please login."
        );

      authenticationError.status =
        401;

      throw authenticationError;
    }

    const hasBody =
      body !==
        undefined &&
      body !== null;

    const headers = {
      Authorization:
        `Bearer ${token}`,
    };

    if (hasBody) {
      headers[
        "Content-Type"
      ] =
        "application/json";
    }

    const response =
      await fetch(
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
      error?.status !==
      undefined
    ) {
      throw error;
    }

    const networkError =
      new Error(
        "Unable to connect to the server. Please check whether the backend is running."
      );

    networkError.status =
      0;

    networkError.originalError =
      error;

    throw networkError;
  }
};

/* =====================================
   Owner payout-account functions
===================================== */

/*
  Get logged-in owner's payout account.
*/

export const getMyPayoutAccount =
  async () => {
    return request(
      "/payout-accounts/me"
    );
  };

/*
  Submit a new payout account or replace
  existing payout details.
*/

export const submitPayoutAccount =
  async (
    payoutAccountData
  ) => {
    return request(
      "/payout-accounts",
      {
        method: "POST",

        body:
          payoutAccountData,
      }
    );
  };

/*
  Disable logged-in owner's payout
  account.
*/

export const disableMyPayoutAccount =
  async (
    note = ""
  ) => {
    return request(
      "/payout-accounts/me/disable",
      {
        method: "PATCH",

        body: {
          note,
        },
      }
    );
  };

/* =====================================
   Admin payout-account functions
===================================== */

/*
  Get and filter all payout accounts.
*/

export const getAdminPayoutAccounts =
  async (
    filters = {}
  ) => {
    const queryString =
      createQueryString(
        filters
      );

    return request(
      `/payout-accounts/admin${queryString}`
    );
  };

/*
  Get one payout account.
*/

export const getAdminPayoutAccountById =
  async (
    payoutAccountId
  ) => {
    return request(
      `/payout-accounts/admin/${payoutAccountId}`
    );
  };

/*
  Move payout account under review.
*/

export const markPayoutAccountUnderReview =
  async (
    payoutAccountId,
    note = ""
  ) => {
    return request(
      `/payout-accounts/admin/${payoutAccountId}/review`,
      {
        method: "PATCH",

        body: {
          note,
        },
      }
    );
  };

/*
  Approve and verify payout account.
*/

export const approvePayoutAccount =
  async (
    payoutAccountId,
    {
      note = "",
      verificationReference = "",
    } = {}
  ) => {
    return request(
      `/payout-accounts/admin/${payoutAccountId}/approve`,
      {
        method: "PATCH",

        body: {
          note,
          verificationReference,
        },
      }
    );
  };

/*
  Reject payout account.
*/

export const rejectPayoutAccount =
  async (
    payoutAccountId,
    {
      reason,
      note = "",
    }
  ) => {
    return request(
      `/payout-accounts/admin/${payoutAccountId}/reject`,
      {
        method: "PATCH",

        body: {
          reason,
          note,
        },
      }
    );
  };

/*
  Disable payout account as an admin.
*/

export const disablePayoutAccount =
  async (
    payoutAccountId,
    note
  ) => {
    return request(
      `/payout-accounts/admin/${payoutAccountId}/disable`,
      {
        method: "PATCH",

        body: {
          note,
        },
      }
    );
  };