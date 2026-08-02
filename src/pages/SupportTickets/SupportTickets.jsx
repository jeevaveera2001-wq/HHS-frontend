import "./SupportTickets.css";
import { useNavigate } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-toastify";

import {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicketErrorMessage,
} from "../../services/supportTicketService";

const initialFormData = {
  subject: "",
  category: "general",
  priority: "medium",
  description: "",
};

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

function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState("all");

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState(
    initialFormData
  );

  /* =====================================
     Load logged-in user's tickets
  ===================================== */

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await getMySupportTickets();

      const ticketList =
        data.tickets ||
        data.data?.tickets ||
        data.data ||
        [];

      setTickets(
        Array.isArray(ticketList)
          ? ticketList
          : []
      );
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  /* =====================================
     Form handlers
  ===================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const subject = formData.subject.trim();
    const description =
      formData.description.trim();

    if (!subject || !description) {
      toast.error(
        "Subject and description are required."
      );

      return;
    }

    if (subject.length < 5) {
      toast.error(
        "Subject must contain at least 5 characters."
      );

      return;
    }

    if (description.length < 10) {
      toast.error(
        "Description must contain at least 10 characters."
      );

      return;
    }

    try {
      setSubmitting(true);

      await createSupportTicket({
        subject,
        description,
        category: formData.category,
        priority: formData.priority,
      });

      toast.success(
        "Support ticket created successfully."
      );

      setFormData(initialFormData);
      setShowForm(false);

      await loadTickets();
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================
     Filter tickets
  ===================================== */

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        selectedStatus === "all" ||
        ticket.status === selectedStatus;

      const searchableText = [
        ticket.ticketNumber,
        ticket.subject,
        ticket.category,
        ticket.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );

      return matchesStatus && matchesSearch;
    });
  }, [
    tickets,
    selectedStatus,
    search,
  ]);

  /* =====================================
     Ticket statistics
  ===================================== */

  const statistics = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) => ticket.status === "open"
      ).length,

      active: tickets.filter((ticket) =>
        [
          "in_progress",
          "waiting_for_customer",
        ].includes(ticket.status)
      ).length,

      completed: tickets.filter((ticket) =>
        ["resolved", "closed"].includes(
          ticket.status
        )
      ).length,
    };
  }, [tickets]);

  /* =====================================
     Date formatter
  ===================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(dateValue));
  };

  return (
    <main className="support-page">
      <section className="support-container">
        {/* Header */}

        <header className="support-header">
          <div>
            <span className="support-eyebrow">
              HHS HELP CENTRE
            </span>

            <h1>Support Tickets</h1>

            <p>
              Contact the Hogenakkal Home Stay
              support team and track your requests.
            </p>
          </div>

          <button
            type="button"
            className="support-create-button"
            onClick={() =>
              setShowForm((current) => !current)
            }
          >
            {showForm
              ? "Close Form"
              : "+ Create Ticket"}
          </button>
        </header>

        {/* Statistics */}

        <section className="support-statistics">
          <article>
            <span>Total Tickets</span>
            <strong>
              {statistics.total}
            </strong>
          </article>

          <article>
            <span>Open</span>
            <strong>
              {statistics.open}
            </strong>
          </article>

          <article>
            <span>Being Handled</span>
            <strong>
              {statistics.active}
            </strong>
          </article>

          <article>
            <span>Completed</span>
            <strong>
              {statistics.completed}
            </strong>
          </article>
        </section>

        {/* Create ticket form */}

        {showForm && (
          <section className="support-form-section">
            <div className="support-form-heading">
              <div>
                <h2>Create a Support Ticket</h2>

                <p>
                  Provide clear details so our team
                  can assist you quickly.
                </p>
              </div>
            </div>

            <form
              className="support-form"
              onSubmit={handleSubmit}
            >
              <div className="support-field support-field-full">
                <label htmlFor="subject">
                  Subject
                </label>

                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Briefly describe your issue"
                  maxLength={200}
                  disabled={submitting}
                />
              </div>

              <div className="support-field">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {Object.entries(
                    categoryLabels
                  ).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="support-field">
                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {Object.entries(
                    priorityLabels
                  ).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="support-field support-field-full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Explain what happened and include any important booking or payment information..."
                  rows={7}
                  maxLength={5000}
                  disabled={submitting}
                />

                <small>
                  {formData.description.length}
                  /5000 characters
                </small>
              </div>

              <div className="support-form-actions">
                <button
                  type="button"
                  className="support-cancel-button"
                  disabled={submitting}
                  onClick={() => {
                    setFormData(initialFormData);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="support-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Creating Ticket..."
                    : "Submit Ticket"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}

        <section className="support-toolbar">
          <div className="support-search">
            <label htmlFor="ticket-search">
              Search tickets
            </label>

            <input
              id="ticket-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by ticket number or subject"
            />
          </div>

          <div className="support-filter">
            <label htmlFor="status-filter">
              Status
            </label>

            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
            >
              <option value="all">
                All statuses
              </option>

              {Object.entries(
                statusLabels
              ).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Ticket list */}

        {loading ? (
          <section className="support-state-card">
            <div className="support-loader" />

            <h2>Loading your tickets</h2>

            <p>
              Please wait while we retrieve your
              support requests.
            </p>
          </section>
        ) : filteredTickets.length === 0 ? (
          <section className="support-state-card">
            <div className="support-state-icon">
              🎫
            </div>

            <h2>
              {tickets.length === 0
                ? "No support tickets yet"
                : "No matching tickets"}
            </h2>

            <p>
              {tickets.length === 0
                ? "Create a ticket whenever you need help with an account, booking, payment or property."
                : "Try changing the search text or status filter."}
            </p>

            {tickets.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
              >
                Create Your First Ticket
              </button>
            )}
          </section>
        ) : (
          <section className="support-ticket-list">
            {filteredTickets.map((ticket) => (
              <article
                className="support-ticket-card"
                key={ticket._id}
              >
                <div className="support-ticket-top">
                  <div>
                    <span className="support-ticket-number">
                      {ticket.ticketNumber ||
                        "HHS Ticket"}
                    </span>

                    <h2>{ticket.subject}</h2>
                  </div>

                  <span
                    className={`support-status support-status-${ticket.status}`}
                  >
                    {statusLabels[
                      ticket.status
                    ] || ticket.status}
                  </span>
                </div>

                <p className="support-ticket-description">
                  {ticket.description}
                </p>

                <div className="support-ticket-tags">
                  <span>
                    {categoryLabels[
                      ticket.category
                    ] || ticket.category}
                  </span>

                  <span
                    className={`support-priority support-priority-${ticket.priority}`}
                  >
                    {priorityLabels[
                      ticket.priority
                    ] || ticket.priority}
                  </span>
                </div>

                <div className="support-ticket-footer">
                  <div>
                    <span>Created</span>

                    <strong>
                      {formatDate(
                        ticket.createdAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Last updated</span>

                    <strong>
                      {formatDate(
                        ticket.updatedAt
                      )}
                    </strong>
                  </div>

               <button
  type="button"
  onClick={() =>
    navigate(
      `/support-tickets/${ticket._id}`
    )
  }
>
  View Conversation
</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

export default SupportTickets;