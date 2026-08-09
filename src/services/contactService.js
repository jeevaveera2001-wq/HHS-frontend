import apiClient from "./apiClient";

const CONTACT_ENQUIRY_URL =
  "/contact-enquiries";

/* =====================================
   Submit public contact enquiry
===================================== */

export const submitContactEnquiry = async (
  enquiryData
) => {
  if (
    !enquiryData ||
    typeof enquiryData !== "object"
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

  if (error?.code === "ECONNABORTED") {
    return (
      "The request took too long. " +
      "Please try again."
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
    "Unable to submit your enquiry."
  );
};

const contactService = {
  submitContactEnquiry,
  getContactErrorMessage,
};

export default contactService;