import apiClient from "./apiClient";

/* =====================================
   API endpoint
===================================== */

const CONTACT_ENQUIRY_URL =
  "/contact-enquiries";

/* =====================================
   Public enquiry service
===================================== */

export const submitContactEnquiry =
  async (enquiryData) => {
    if (
      !enquiryData ||
      typeof enquiryData !==
        "object"
    ) {
      throw new Error(
        "Enquiry information is required."
      );
    }

    const response =
      await apiClient.post(
        CONTACT_ENQUIRY_URL,
        enquiryData
      );

    return response.data;
  };

/* =====================================
   Get managed enquiries
===================================== */

export const getManagedEnquiries =
  async (params = {}) => {
    const response =
      await apiClient.get(
        `${CONTACT_ENQUIRY_URL}/manage`,
        {
          params,
        }
      );

    return response.data;
  };

/* =====================================
   Get one managed enquiry
===================================== */

export const getManagedEnquiryById =
  async (enquiryId) => {
    if (!enquiryId) {
      throw new Error(
        "Enquiry ID is required."
      );
    }

    const response =
      await apiClient.get(
        `${CONTACT_ENQUIRY_URL}/manage/${enquiryId}`
      );

    return response.data;
  };

/* =====================================
   Update managed enquiry
===================================== */

export const updateManagedEnquiry =
  async (
    enquiryId,
    updateData
  ) => {
    if (!enquiryId) {
      throw new Error(
        "Enquiry ID is required."
      );
    }

    if (
      !updateData ||
      typeof updateData !==
        "object"
    ) {
      throw new Error(
        "Enquiry update information is required."
      );
    }

    const response =
      await apiClient.patch(
        `${CONTACT_ENQUIRY_URL}/manage/${enquiryId}`,
        updateData
      );

    return response.data;
  };

/* =====================================
   Error-message helper
===================================== */

export const getContactErrorMessage = (
  error
) => {
  const backendMessage =
    error?.response?.data?.message;

  if (backendMessage) {
    return backendMessage;
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

  if (error?.response?.status === 401) {
    return (
      "Your session has expired. " +
      "Please login again."
    );
  }

  if (error?.response?.status === 403) {
    return (
      "You do not have permission " +
      "to manage enquiries."
    );
  }

  if (error?.response?.status === 404) {
    return (
      "The requested enquiry was not found."
    );
  }

  if (error?.request) {
    return (
      "Unable to connect to the HHS server. " +
      "Please check your internet connection."
    );
  }

  return (
    error?.message ||
    "Unable to process the enquiry."
  );
};

/* =====================================
   Default export
===================================== */

const contactService = {
  submitContactEnquiry,
  getManagedEnquiries,
  getManagedEnquiryById,
  updateManagedEnquiry,
  getContactErrorMessage,
};

export default contactService;