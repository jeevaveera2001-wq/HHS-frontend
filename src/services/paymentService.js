const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

/* =====================================
   Authentication
===================================== */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
};

/* =====================================
   Response handler
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
        "Unable to complete the payment request."
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
    const options = {
      method,
      headers: getHeaders(),
    };

    if (
      body !== undefined &&
      body !== null
    ) {
      options.body =
        JSON.stringify(body);
    }

    const response = await fetch(
      `${API_URL}${path}`,
      options
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
        "Unable to connect to the payment server. Make sure the backend is running."
      );

    networkError.status = 0;
    networkError.originalError =
      error;

    throw networkError;
  }
};

/* =====================================
   Create Razorpay order
===================================== */

export const createPaymentOrder =
  async (bookingId) => {
    return request(
      "/payments/order",
      {
        method: "POST",

        body: {
          bookingId,
        },
      }
    );
  };

/* =====================================
   Verify completed payment
===================================== */

export const verifyPayment =
  async ({
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    return request(
      "/payments/verify",
      {
        method: "POST",

        body: {
          bookingId,

          razorpay_order_id:
            razorpayOrderId,

          razorpay_payment_id:
            razorpayPaymentId,

          razorpay_signature:
            razorpaySignature,
        },
      }
    );
  };

/* =====================================
   Record failed payment
===================================== */

export const recordPaymentFailure =
  async ({
    bookingId,
    orderId,
    paymentId = "",
    error = {},
  }) => {
    return request(
      "/payments/failure",
      {
        method: "POST",

        body: {
          bookingId,
          orderId,
          paymentId,
          error,
        },
      }
    );
  };

/* =====================================
   Get booking payment status
===================================== */

export const getPaymentStatus =
  async (bookingId) => {
    return request(
      `/payments/${bookingId}/status`
    );
  };

/* =====================================
   Initiate refund
   Authorized staff only
===================================== */

export const initiatePaymentRefund =
  async (
    bookingId,
    {
      amount,
      reason,
    } = {}
  ) => {
    const body = {};

    if (
      amount !== undefined &&
      amount !== null &&
      amount !== ""
    ) {
      body.amount =
        Number(amount);
    }

    if (reason?.trim()) {
      body.reason =
        reason.trim();
    }

    return request(
      `/payments/${bookingId}/refund`,
      {
        method: "POST",
        body,
      }
    );
  };