import apiClient from "./apiClient";

/* =====================================
   Continue with Google
===================================== */

export const loginWithGoogle =
  async (credential) => {
    const normalizedCredential =
      String(
        credential || ""
      ).trim();

    if (
      !normalizedCredential
    ) {
      throw new Error(
        "Google login credential is required."
      );
    }

    const response =
      await apiClient.post(
        "/auth/google",
        {
          credential:
            normalizedCredential,
        }
      );

    return response.data;
  };

export default loginWithGoogle;