import apiClient from "./apiClient";

/* =====================================
   API endpoint
===================================== */

const SUPPORT_TICKET_URL =
  "/support-tickets";

/* =====================================
   Customer and owner services
===================================== */

/**
 * Create a support ticket.
 *
 * @param {Object} ticketData
 * @returns {Promise<Object>}
 */
export const createSupportTicket = async (
  ticketData
) => {
  const response =
    await apiClient.post(
      SUPPORT_TICKET_URL,
      ticketData
    );

  return response.data;
};

/**
 * Get support tickets created by the
 * currently authenticated customer or owner.
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const getMySupportTickets = async (
  params = {}
) => {
  const response =
    await apiClient.get(
      `${SUPPORT_TICKET_URL}/my-tickets`,
      {
        params,
      }
    );

  return response.data;
};

/**
 * Get one support ticket.
 *
 * Backend authorization must verify that:
 * - the customer owns the ticket, or
 * - the logged-in staff member has access.
 *
 * @param {string} ticketId
 * @returns {Promise<Object>}
 */
export const getSupportTicketById = async (
  ticketId
) => {
  if (!ticketId) {
    throw new Error(
      "Ticket ID is required."
    );
  }

  const response =
    await apiClient.get(
      `${SUPPORT_TICKET_URL}/${ticketId}`
    );

  return response.data;
};

/**
 * Reply to a support ticket.
 *
 * @param {string} ticketId
 * @param {Object} replyData
 * @returns {Promise<Object>}
 */
export const replyToSupportTicket = async (
  ticketId,
  replyData
) => {
  if (!ticketId) {
    throw new Error(
      "Ticket ID is required."
    );
  }

  if (!replyData?.message?.trim()) {
    throw new Error(
      "Reply message is required."
    );
  }

  const response =
    await apiClient.post(
      `${SUPPORT_TICKET_URL}/${ticketId}/reply`,
      {
        ...replyData,
        message:
          replyData.message.trim(),
      }
    );

  return response.data;
};

/* =====================================
   Staff support-management services
===================================== */

/**
 * Get tickets available to support staff.
 *
 * Supported query parameters may include:
 * status, priority, category, search,
 * assignedTo, page and limit.
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const getManagedSupportTickets =
  async (params = {}) => {
    const response =
      await apiClient.get(
        `${SUPPORT_TICKET_URL}/manage`,
        {
          params,
        }
      );

    return response.data;
  };

/**
 * Assign a support ticket to a staff member.
 *
 * assignmentData example:
 * {
 *   assignedTo: "MongoDB user ID"
 * }
 *
 * @param {string} ticketId
 * @param {Object} assignmentData
 * @returns {Promise<Object>}
 */
export const assignSupportTicket = async (
  ticketId,
  assignmentData
) => {
  if (!ticketId) {
    throw new Error(
      "Ticket ID is required."
    );
  }

  const response =
    await apiClient.patch(
      `${SUPPORT_TICKET_URL}/${ticketId}/assign`,
      assignmentData
    );

  return response.data;
};

/**
 * Update ticket status, category or priority.
 *
 * updateData example:
 * {
 *   status: "in_progress",
 *   priority: "high"
 * }
 *
 * @param {string} ticketId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateSupportTicket = async (
  ticketId,
  updateData
) => {
  if (!ticketId) {
    throw new Error(
      "Ticket ID is required."
    );
  }

  if (
    !updateData ||
    typeof updateData !== "object"
  ) {
    throw new Error(
      "Ticket update data is required."
    );
  }

  const response =
    await apiClient.patch(
      `${SUPPORT_TICKET_URL}/${ticketId}/status`,
      updateData
    );

  return response.data;
};

/**
 * Add an internal staff note.
 * Internal notes are never shown to customers.
 *
 * @param {string} ticketId
 * @param {Object} noteData
 * @returns {Promise<Object>}
 */
export const addSupportTicketInternalNote =
  async (ticketId, noteData) => {
    if (!ticketId) {
      throw new Error(
        "Ticket ID is required."
      );
    }

    if (!noteData?.note?.trim()) {
      throw new Error(
        "Internal note is required."
      );
    }

    const response =
      await apiClient.post(
        `${SUPPORT_TICKET_URL}/${ticketId}/internal-note`,
        {
          ...noteData,
          note: noteData.note.trim(),
        }
      );

    return response.data;
  };

/* =====================================
   Error message helper
===================================== */

export const getSupportTicketErrorMessage = (
  error
) => {
  const backendMessage =
    error?.response?.data?.message;

  if (backendMessage) {
    return backendMessage;
  }

  if (
    error?.code === "ECONNABORTED"
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
    "Something went wrong while processing the support ticket."
  );
};

/* =====================================
   Default service export
===================================== */

const supportTicketService = {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicketById,
  replyToSupportTicket,
  getManagedSupportTickets,
  assignSupportTicket,
  updateSupportTicket,
  addSupportTicketInternalNote,
  getSupportTicketErrorMessage,
};

export default supportTicketService;