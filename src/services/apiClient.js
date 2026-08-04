import axios from "axios";

const API_URL = import.meta.env.PROD
  ? "https://hhs-backend-cwzx.onrender.com/api"
  : "http://localhost:5000/api";

/* =====================================
   Create Axios client
===================================== */

const apiClient = axios.create({
  baseURL:  API_URL,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =====================================
   Authentication storage
===================================== */

const getStoredToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

/* =====================================
   Public authentication requests
===================================== */

const isPublicAuthenticationRequest = (
  url = ""
) => {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register")
  );
};

/* =====================================
   Extract request token
===================================== */

const getRequestToken = (config) => {
  const authorization =
    config?.headers?.Authorization ||
    config?.headers?.authorization;

  if (
    typeof authorization !== "string"
  ) {
    return null;
  }

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  return authorization.slice(7);
};

/* =====================================
   Request interceptor
===================================== */

apiClient.interceptors.request.use(
  (config) => {
    /*
     * Never send an old token with login
     * or registration requests.
     */

    if (
      isPublicAuthenticationRequest(
        config.url
      )
    ) {
      delete config.headers.Authorization;
      delete config.headers.authorization;

      return config;
    }

    const token = getStoredToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =====================================
   Response interceptor
===================================== */

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url || "";

    const publicAuthenticationRequest =
      isPublicAuthenticationRequest(
        requestUrl
      );

    /*
     * Determine which token was used by the
     * failed request.
     */

    const requestToken =
      getRequestToken(error.config);

    const currentToken =
      getStoredToken();

    /*
     * Only expire the session when:
     *
     * 1. The response is 401.
     * 2. It is not a login/register request.
     * 3. The failed request contained a token.
     * 4. That token is still the current token.
     *
     * This prevents an old request from logging
     * out a newly authenticated user.
     */

    const currentSessionExpired =
      status === 401 &&
      !publicAuthenticationRequest &&
      Boolean(requestToken) &&
      Boolean(currentToken) &&
      requestToken === currentToken;

    if (currentSessionExpired) {
      clearStoredAuth();

      window.dispatchEvent(
        new CustomEvent(
          "hhs:authentication-expired",
          {
            detail: {
              token: requestToken,
            },
          }
        )
      );
    }

    return Promise.reject(error);
  }
);

export {
  API_URL,
  getStoredToken,
  clearStoredAuth,
};

export default apiClient;