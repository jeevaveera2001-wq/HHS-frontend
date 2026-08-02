import apiClient from "./apiClient";

/* =====================================
   Authentication endpoint
===================================== */

const AUTH_URL = "/auth";

/* =====================================
   Register user
===================================== */

export const registerUser = async (
  userData
) => {
  if (!userData) {
    throw new Error(
      "Registration data is required."
    );
  }

  const fullName =
    userData.fullName?.trim();

  const email =
    userData.email
      ?.trim()
      .toLowerCase();

  const phone =
    userData.phone?.trim();

  const password =
    userData.password;

  if (
    !fullName ||
    !email ||
    !phone ||
    !password
  ) {
    throw new Error(
      "All registration fields are required."
    );
  }

  const response =
    await apiClient.post(
      `${AUTH_URL}/register`,
      {
        fullName,
        email,
        phone,
        password,
      }
    );

  return response.data;
};

/* =====================================
   Login user
===================================== */

export const loginUser = async (
  credentials
) => {
  if (!credentials) {
    throw new Error(
      "Login credentials are required."
    );
  }

  const email =
    credentials.email
      ?.trim()
      .toLowerCase();

  const password =
    credentials.password;

  if (!email || !password) {
    throw new Error(
      "Email and password are required."
    );
  }

  const response =
    await apiClient.post(
      `${AUTH_URL}/login`,
      {
        email,
        password,
      }
    );

  return response.data;
};

/* =====================================
   Verify email address
===================================== */

export const verifyEmail = async (
  verificationToken
) => {
  const token =
    verificationToken?.trim();

  if (!token) {
    throw new Error(
      "Email verification token is missing."
    );
  }

  const encodedToken =
    encodeURIComponent(token);

  const response =
    await apiClient.put(
      `${AUTH_URL}/verify-email/${encodedToken}`
    );

  return response.data;
};

/* =====================================
   Resend verification email
===================================== */

export const resendVerificationEmail =
  async (emailAddress) => {
    const email =
      emailAddress
        ?.trim()
        .toLowerCase();

    if (!email) {
      throw new Error(
        "Email address is required."
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email
      )
    ) {
      throw new Error(
        "Please provide a valid email address."
      );
    }

    const response =
      await apiClient.post(
        `${AUTH_URL}/resend-verification`,
        {
          email,
        }
      );

    return response.data;
  };

/* =====================================
   Request password reset email
===================================== */

export const requestPasswordReset =
  async (emailAddress) => {
    const email =
      emailAddress
        ?.trim()
        .toLowerCase();

    if (!email) {
      throw new Error(
        "Email address is required."
      );
    }

    const response =
      await apiClient.post(
        `${AUTH_URL}/forgot-password`,
        {
          email,
        }
      );

    return response.data;
  };

/*
 * Alternative export name for components
 * that use forgotPassword().
 */

export const forgotPassword =
  requestPasswordReset;

/* =====================================
   Reset password
===================================== */

export const resetPassword = async (
  resetToken,
  passwordData
) => {
  const token =
    resetToken?.trim();

  if (!token) {
    throw new Error(
      "Password reset token is missing."
    );
  }

  if (!passwordData) {
    throw new Error(
      "Password information is required."
    );
  }

  const {
    newPassword,
    confirmPassword,
  } = passwordData;

  if (
    !newPassword ||
    !confirmPassword
  ) {
    throw new Error(
      "Both password fields are required."
    );
  }

  if (
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    throw new Error(
      "Password must contain between 8 and 128 characters."
    );
  }

  if (
    !/[A-Za-z]/.test(
      newPassword
    ) ||
    !/[0-9]/.test(
      newPassword
    )
  ) {
    throw new Error(
      "Password must contain at least one letter and one number."
    );
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    throw new Error(
      "Passwords do not match."
    );
  }

  const encodedToken =
    encodeURIComponent(token);

  const response =
    await apiClient.put(
      `${AUTH_URL}/reset-password/${encodedToken}`,
      {
        newPassword,
        confirmPassword,
      }
    );

  return response.data;
};

/* =====================================
   Get authenticated profile
===================================== */

export const getProfile = async () => {
  const response =
    await apiClient.get(
      `${AUTH_URL}/profile`
    );

  return response.data;
};

export const getUserProfile =
  getProfile;

/* =====================================
   Update profile
===================================== */

export const updateProfile = async (
  profileData
) => {
  if (!profileData) {
    throw new Error(
      "Profile data is required."
    );
  }

  const payload = {
    ...profileData,
  };

  if (
    typeof payload.fullName ===
    "string"
  ) {
    payload.fullName =
      payload.fullName.trim();
  }

  if (
    typeof payload.phone ===
    "string"
  ) {
    payload.phone =
      payload.phone.trim();
  }

  const response =
    await apiClient.put(
      `${AUTH_URL}/profile`,
      payload
    );

  return response.data;
};

export const updateUserProfile =
  updateProfile;

/* =====================================
   Change password
===================================== */

export const changePassword = async (
  passwordData
) => {
  if (!passwordData) {
    throw new Error(
      "Password information is required."
    );
  }

  const {
    currentPassword,
    newPassword,
    confirmPassword,
  } = passwordData;

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    throw new Error(
      "All password fields are required."
    );
  }

  if (
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    throw new Error(
      "New password must contain between 8 and 128 characters."
    );
  }

  if (
    !/[A-Za-z]/.test(
      newPassword
    ) ||
    !/[0-9]/.test(
      newPassword
    )
  ) {
    throw new Error(
      "New password must contain at least one letter and one number."
    );
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    throw new Error(
      "New passwords do not match."
    );
  }

  const response =
    await apiClient.put(
      `${AUTH_URL}/change-password`,
      {
        currentPassword,
        newPassword,
        confirmPassword,
      }
    );

  return response.data;
};

/* =====================================
   Backend logout
===================================== */

export const logoutUser = async (
  authenticationToken = null
) => {
  try {
    const configuration =
      authenticationToken
        ? {
            headers: {
              Authorization:
                `Bearer ${authenticationToken}`,
            },
          }
        : undefined;

    const response =
      await apiClient.post(
        `${AUTH_URL}/logout`,
        {},
        configuration
      );

    return response.data;
  } catch (error) {
    /*
     * Local logout must still work when
     * the token has already expired.
     */

    if (
      error.response?.status ===
      401
    ) {
      return {
        success: true,

        message:
          "Local logout completed.",
      };
    }

    throw error;
  }
};

/* =====================================
   Authentication error helper
===================================== */

export const getAuthErrorMessage = (
  error
) => {
  if (
    error?.response?.data
      ?.message
  ) {
    return error.response.data
      .message;
  }

  if (
    error?.data?.message
  ) {
    return error.data.message;
  }

  if (
    error?.code ===
    "ECONNABORTED"
  ) {
    return (
      "The request took too long. " +
      "Please try again."
    );
  }

  if (error?.request) {
    return (
      "Unable to connect to the HHS server. " +
      "Please make sure the backend is running."
    );
  }

  return (
    error?.message ||
    "Authentication request failed."
  );
};

/* =====================================
   Default export
===================================== */

const authService = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  forgotPassword,
  resetPassword,
  getProfile,
  getUserProfile,
  updateProfile,
  updateUserProfile,
  changePassword,
  logoutUser,
  getAuthErrorMessage,
};

export default authService;