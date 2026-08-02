import "./SupportTicketDetails.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  getSupportTicketById,
  getSupportTicketErrorMessage,
  replyToSupportTicket,
} from "../../services/supportTicketService";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  waiting_for_customer: "Waiting for You",
  resolved: "Resolved",
  closed: "Closed",
};

const categoryLabels = {
  general: "General enquiry",
  account: "Account support",
  booking: "Booking issue",
  payment: "Payment issue",
  refund: "Refund request",
  property: "Property issue",
  owner_verification: "Owner verification",
  technical: "Technical issue",
  complaint: "Complaint",
  other: "Other",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function SupportTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const conversationEndRef = useRef(null);

  const [ticket, setTicket] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [replying, setReplying] =
    useState(false);

  const [replyMessage, setReplyMessage] =
    useState("");

  /* =====================================
     Load ticket
  ===================================== */

  const loadTicket = useCallback(async () => {
    if (!ticketId) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getSupportTicketById(
          ticketId
        );

      const ticketData =
        data.ticket ||
        data.data?.ticket ||
        data.data ||
        null;

      setTicket(ticketData);
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );

      if (
        error.response?.status === 403 ||
        error.response?.status === 404
      ) {
        navigate(
          "/support-tickets",
          { replace: true }
        );
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, navigate]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  /* =====================================
     Scroll to newest message
  ===================================== */

  useEffect(() => {
    if (!ticket?.messages?.length) {
      return;
    }

    conversationEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [ticket?.messages?.length]);

  /* =====================================
     Reply handler
  ===================================== */

  const handleReply = async (event) => {
    event.preventDefault();

    const message = replyMessage.trim();

    if (!message) {
      toast.error(
        "Please enter your reply."
      );

      return;
    }

    if (message.length < 2) {
      toast.error(
        "Your reply is too short."
      );

      return;
    }

    try {
      setReplying(true);

      const data =
        await replyToSupportTicket(
          ticketId,
          { message }
        );

      const updatedTicket =
        data.ticket ||
        data.data?.ticket ||
        data.data ||
        null;

      setReplyMessage("");

      if (updatedTicket) {
        setTicket(updatedTicket);
      } else {
        await loadTicket();
      }

      toast.success(
        "Your reply was sent successfully."
      );
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setReplying(false);
    }
  };

  /* =====================================
     Formatters
  ===================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };

  const getSenderName = (message) => {
    if (
      typeof message.sender === "object" &&
      message.sender
    ) {
      return (
        message.sender.fullName ||
        message.sender.name ||
        "HHS User"
      );
    }

    if (message.isStaffReply) {
      return "HHS Support";
    }

    return user?.fullName || "You";
  };

  const isCurrentUserMessage = (
    message
  ) => {
    const senderId =
      typeof message.sender === "object"
        ? message.sender?._id ||
          message.sender?.id
        : message.sender;

    const currentUserId =
      user?._id || user?.id;

    if (senderId && currentUserId) {
      return (
        String(senderId) ===
        String(currentUserId)
      );
    }

    return !message.isStaffReply;
  };

  const ticketIsClosed = [
    "resolved",
    "closed",
  ].includes(ticket?.status);

  /* =====================================
     Loading state
  ===================================== */

  if (loading) {
    return (
      <main className="ticket-details-page">
        <section className="ticket-details-loading">
          <div className="ticket-details-loader" />

          <h2>Loading conversation</h2>

          <p>
            Retrieving your support ticket.
          </p>
        </section>
      </main>
    );
  }

  /* =====================================
     Missing ticket state
  ===================================== */

  if (!ticket) {
    return (
      <main className="ticket-details-page">
        <section className="ticket-details-empty">
          <div>🎫</div>

          <h1>Ticket Not Found</h1>

          <p>
            The requested ticket is unavailable
            or you do not have permission to view
            it.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/support-tickets")
            }
          >
            Return to Support
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="ticket-details-page">
      <section className="ticket-details-container">
        {/* Navigation */}

        <button
          type="button"
          className="ticket-back-button"
          onClick={() =>
            navigate("/support-tickets")
          }
        >
          ← Back to Support Tickets
        </button>

        {/* Ticket heading */}

        <header className="ticket-details-header">
          <div>
            <span className="ticket-details-number">
              {ticket.ticketNumber ||
                "HHS Support Ticket"}
            </span>

            <h1>{ticket.subject}</h1>

            <p>
              Created on{" "}
              {formatDate(ticket.createdAt)}
            </p>
          </div>

          <span
            className={`ticket-details-status ticket-details-status-${ticket.status}`}
          >
            {statusLabels[ticket.status] ||
              ticket.status}
          </span>
        </header>

        <div className="ticket-details-layout">
          {/* Conversation */}

          <section className="ticket-conversation-card">
            <div className="ticket-conversation-heading">
              <div>
                <h2>Conversation</h2>

                <p>
                  Messages between you and the HHS
                  support team.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={loadTicket}
              >
                Refresh
              </button>
            </div>

            <div className="ticket-original-message">
              <div className="ticket-message-avatar">
                {user?.fullName
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div>
                <div className="ticket-message-meta">
                  <strong>
                    {user?.fullName || "You"}
                  </strong>

                  <span>
                    {formatDate(
                      ticket.createdAt
                    )}
                  </span>
                </div>

                <p>{ticket.description}</p>
              </div>
            </div>

            <div className="ticket-message-list">
              {(ticket.messages || []).map(
                (message) => {
                  const currentUserMessage =
                    isCurrentUserMessage(
                      message
                    );

                  return (
                    <article
                      className={
                        currentUserMessage
                          ? "ticket-message ticket-message-user"
                          : "ticket-message ticket-message-staff"
                      }
                      key={
                        message._id ||
                        `${message.createdAt}-${message.message}`
                      }
                    >
                      <div className="ticket-message-avatar">
                        {getSenderName(message)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="ticket-message-body">
                        <div className="ticket-message-meta">
                          <strong>
                            {getSenderName(
                              message
                            )}
                          </strong>

                          <span>
                            {formatDate(
                              message.createdAt
                            )}
                          </span>
                        </div>

                        <p>
                          {message.message}
                        </p>

                        {message.attachments
                          ?.length > 0 && (
                          <div className="ticket-message-attachments">
                            {message.attachments.map(
                              (
                                attachment,
                                index
                              ) => (
                                <a
                                  href={
                                    attachment
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  key={`${attachment}-${index}`}
                                >
                                  View attachment{" "}
                                  {index + 1}
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                }
              )}

              <div
                ref={conversationEndRef}
              />
            </div>

            {/* Reply form */}

            {ticketIsClosed ? (
              <div className="ticket-closed-message">
                <span>✓</span>

                <div>
                  <strong>
                    This ticket is{" "}
                    {ticket.status}.
                  </strong>

                  <p>
                    Create a new support ticket if
                    you need additional assistance.
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="ticket-reply-form"
                onSubmit={handleReply}
              >
                <label htmlFor="ticket-reply">
                  Send a Reply
                </label>

                <textarea
                  id="ticket-reply"
                  value={replyMessage}
                  onChange={(event) =>
                    setReplyMessage(
                      event.target.value
                    )
                  }
                  placeholder="Write your message to the HHS support team..."
                  maxLength={5000}
                  rows={5}
                  disabled={replying}
                />

                <div className="ticket-reply-footer">
                  <span>
                    {replyMessage.length}/5000
                  </span>

                  <button
                    type="submit"
                    disabled={replying}
                  >
                    {replying
                      ? "Sending..."
                      : "Send Reply"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Ticket information */}

          <aside className="ticket-information-card">
            <h2>Ticket Information</h2>

            <dl>
              <div>
                <dt>Ticket number</dt>

                <dd>
                  {ticket.ticketNumber ||
                    "Not available"}
                </dd>
              </div>

              <div>
                <dt>Status</dt>

                <dd>
                  {statusLabels[
                    ticket.status
                  ] || ticket.status}
                </dd>
              </div>

              <div>
                <dt>Category</dt>

                <dd>
                  {categoryLabels[
                    ticket.category
                  ] || ticket.category}
                </dd>
              </div>

              <div>
                <dt>Priority</dt>

                <dd>
                  {priorityLabels[
                    ticket.priority
                  ] || ticket.priority}
                </dd>
              </div>

              <div>
                <dt>Assigned to</dt>

                <dd>
                  {ticket.assignedTo
                    ?.fullName ||
                    "Waiting for assignment"}
                </dd>
              </div>

              <div>
                <dt>Last updated</dt>

                <dd>
                  {formatDate(
                    ticket.updatedAt
                  )}
                </dd>
              </div>
            </dl>

            <div className="ticket-help-note">
              <strong>
                Need urgent assistance?
              </strong>

              <p>
                Mark new requests as urgent only
                when they involve an immediate
                booking, safety or payment issue.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default SupportTicketDetails;