import "./SupportManagement.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-toastify";

import {
  addSupportTicketInternalNote,
  getManagedSupportTickets,
  getSupportTicketById,
  getSupportTicketErrorMessage,
  replyToSupportTicket,
  updateSupportTicket,
} from "../../services/supportTicketService";

const statusOptions = [
  {
    value: "open",
    label: "Open",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "waiting_for_customer",
    label: "Waiting for Customer",
  },
  {
    value: "resolved",
    label: "Resolved",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

const priorityOptions = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: "urgent",
    label: "Urgent",
  },
];

const categoryLabels = {
  general: "General",
  account: "Account",
  booking: "Booking",
  payment: "Payment",
  refund: "Refund",
  property: "Property",
  owner_verification: "Owner Verification",
  technical: "Technical",
  complaint: "Complaint",
  other: "Other",
};

function SupportManagement() {
  const [tickets, setTickets] =
    useState([]);

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [replying, setReplying] =
    useState(false);

  const [addingNote, setAddingNote] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [replyMessage, setReplyMessage] =
    useState("");

  const [internalNote, setInternalNote] =
    useState("");

  /* =====================================
     Extract API response data
  ===================================== */

  const extractTickets = (data) => {
    const result =
      data?.tickets ||
      data?.data?.tickets ||
      data?.data ||
      [];

    return Array.isArray(result)
      ? result
      : [];
  };

  const extractTicket = (data) => {
    return (
      data?.ticket ||
      data?.data?.ticket ||
      data?.data ||
      null
    );
  };

  /* =====================================
     Load managed tickets
  ===================================== */

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const data =
        await getManagedSupportTickets(
          params
        );

      setTickets(extractTickets(data));
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    priorityFilter,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(
      loadTickets,
      300
    );

    return () =>
      window.clearTimeout(timer);
  }, [loadTickets]);

  /* =====================================
     Load one ticket
  ===================================== */

  const openTicket = async (ticketId) => {
    try {
      setDetailsLoading(true);

      const data =
        await getSupportTicketById(
          ticketId
        );

      setSelectedTicket(
        extractTicket(data)
      );

      setReplyMessage("");
      setInternalNote("");
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeTicket = () => {
    setSelectedTicket(null);
    setReplyMessage("");
    setInternalNote("");
  };

  /* =====================================
     Update status or priority
  ===================================== */

  const updateTicket = async (
    updateData
  ) => {
    if (!selectedTicket?._id) {
      return;
    }

    try {
      setSaving(true);

      const data =
        await updateSupportTicket(
          selectedTicket._id,
          updateData
        );

      const updatedTicket =
        extractTicket(data);

      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      } else {
        await openTicket(
          selectedTicket._id
        );
      }

      await loadTickets();

      toast.success(
        "Ticket updated successfully."
      );
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================
     Send customer reply
  ===================================== */

  const handleReply = async (event) => {
    event.preventDefault();

    const message = replyMessage.trim();

    if (!message) {
      toast.error(
        "Please enter a reply."
      );

      return;
    }

    try {
      setReplying(true);

      const data =
        await replyToSupportTicket(
          selectedTicket._id,
          { message }
        );

      const updatedTicket =
        extractTicket(data);

      setReplyMessage("");

      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      } else {
        await openTicket(
          selectedTicket._id
        );
      }

      await loadTickets();

      toast.success(
        "Reply sent to the customer."
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
     Add internal note
  ===================================== */

  const handleInternalNote = async (
    event
  ) => {
    event.preventDefault();

    const note = internalNote.trim();

    if (!note) {
      toast.error(
        "Please enter an internal note."
      );

      return;
    }

    try {
      setAddingNote(true);

      const data =
        await addSupportTicketInternalNote(
          selectedTicket._id,
          { note }
        );

      const updatedTicket =
        extractTicket(data);

      setInternalNote("");

      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      } else {
        await openTicket(
          selectedTicket._id
        );
      }

      toast.success(
        "Internal note added."
      );
    } catch (error) {
      toast.error(
        getSupportTicketErrorMessage(error)
      );
    } finally {
      setAddingNote(false);
    }
  };

  /* =====================================
     Statistics
  ===================================== */

  const statistics = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) =>
          ticket.status === "open"
      ).length,

      inProgress: tickets.filter(
        (ticket) =>
          ticket.status ===
          "in_progress"
      ).length,

      urgent: tickets.filter(
        (ticket) =>
          ticket.priority === "urgent"
      ).length,
    };
  }, [tickets]);

  /* =====================================
     Format helpers
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

  const getStatusLabel = (status) => {
    return (
      statusOptions.find(
        (option) =>
          option.value === status
      )?.label || status
    );
  };

  const getPriorityLabel = (
    priority
  ) => {
    return (
      priorityOptions.find(
        (option) =>
          option.value === priority
      )?.label || priority
    );
  };

  const getPersonName = (person) => {
    if (!person) {
      return "Not available";
    }

    if (typeof person === "string") {
      return person;
    }

    return (
      person.fullName ||
      person.name ||
      person.email ||
      "HHS User"
    );
  };

  return (
    <main className="support-management-page">
      <section className="support-management-container">
        {/* Header */}

        <header className="support-management-header">
          <div>
            <span>
              VEERAWEBTECH OPERATIONS
            </span>

            <h1>Support Management</h1>

            <p>
              Review customer and owner requests,
              respond to queries and resolve
              support issues.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTickets}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh Tickets"}
          </button>
        </header>

        {/* Statistics */}

        <section className="support-management-stats">
          <article>
            <span>Total Results</span>
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
            <span>In Progress</span>
            <strong>
              {statistics.inProgress}
            </strong>
          </article>

          <article>
            <span>Urgent</span>
            <strong>
              {statistics.urgent}
            </strong>
          </article>
        </section>

        {/* Filters */}

        <section className="support-management-filters">
          <div>
            <label htmlFor="support-search">
              Search
            </label>

            <input
              id="support-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Ticket number, customer or subject"
            />
          </div>

          <div>
            <label htmlFor="support-status">
              Status
            </label>

            <select
              id="support-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All statuses
              </option>

              {statusOptions.map(
                (option) => (
                  <option
                    value={option.value}
                    key={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label htmlFor="support-priority">
              Priority
            </label>

            <select
              id="support-priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All priorities
              </option>

              {priorityOptions.map(
                (option) => (
                  <option
                    value={option.value}
                    key={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {/* Ticket table */}

        <section className="support-management-table-card">
          {loading ? (
            <div className="support-management-state">
              <div className="support-management-loader" />

              <h2>Loading tickets</h2>

              <p>
                Retrieving support requests.
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="support-management-state">
              <div className="support-management-state-icon">
                ✓
              </div>

              <h2>No tickets found</h2>

              <p>
                There are no support tickets
                matching these filters.
              </p>
            </div>
          ) : (
            <div className="support-management-table-wrapper">
              <table className="support-management-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>
                        <strong>
                          {ticket.ticketNumber ||
                            "HHS Ticket"}
                        </strong>

                        <span>
                          {ticket.subject}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {getPersonName(
                            ticket.createdBy
                          )}
                        </strong>

                        <span>
                          {ticket.createdBy
                            ?.email || ""}
                        </span>
                      </td>

                      <td>
                        {categoryLabels[
                          ticket.category
                        ] || ticket.category}
                      </td>

                      <td>
                        <span
                          className={`support-management-priority priority-${ticket.priority}`}
                        >
                          {getPriorityLabel(
                            ticket.priority
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`support-management-status status-${ticket.status}`}
                        >
                          {getStatusLabel(
                            ticket.status
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          ticket.updatedAt
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            openTicket(
                              ticket._id
                            )
                          }
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {/* =====================================
          Ticket management drawer
      ====================================== */}

      {(selectedTicket ||
        detailsLoading) && (
        <div
          className="support-management-overlay"
          onMouseDown={closeTicket}
        >
          <aside
            className="support-management-drawer"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {detailsLoading ? (
              <div className="support-management-state">
                <div className="support-management-loader" />

                <h2>Loading ticket</h2>
              </div>
            ) : (
              <>
                <header className="support-drawer-header">
                  <div>
                    <span>
                      {selectedTicket.ticketNumber}
                    </span>

                    <h2>
                      {selectedTicket.subject}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeTicket}
                    aria-label="Close ticket drawer"
                  >
                    ×
                  </button>
                </header>

                <section className="support-drawer-controls">
                  <div>
                    <label>
                      Status
                    </label>

                    <select
                      value={
                        selectedTicket.status
                      }
                      disabled={saving}
                      onChange={(event) =>
                        updateTicket({
                          status:
                            event.target
                              .value,
                        })
                      }
                    >
                      {statusOptions.map(
                        (option) => (
                          <option
                            value={
                              option.value
                            }
                            key={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label>
                      Priority
                    </label>

                    <select
                      value={
                        selectedTicket.priority
                      }
                      disabled={saving}
                      onChange={(event) =>
                        updateTicket({
                          priority:
                            event.target
                              .value,
                        })
                      }
                    >
                      {priorityOptions.map(
                        (option) => (
                          <option
                            value={
                              option.value
                            }
                            key={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </section>

                <section className="support-drawer-customer">
                  <h3>Customer Details</h3>

                  <p>
                    <strong>Name:</strong>{" "}
                    {getPersonName(
                      selectedTicket.createdBy
                    )}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedTicket.createdBy
                      ?.email ||
                      "Not available"}
                  </p>

                  <p>
                    <strong>Category:</strong>{" "}
                    {categoryLabels[
                      selectedTicket.category
                    ] ||
                      selectedTicket.category}
                  </p>
                </section>

                <section className="support-drawer-conversation">
                  <h3>Conversation</h3>

                  <article className="support-drawer-message customer">
                    <strong>
                      {getPersonName(
                        selectedTicket.createdBy
                      )}
                    </strong>

                    <span>
                      {formatDate(
                        selectedTicket.createdAt
                      )}
                    </span>

                    <p>
                      {
                        selectedTicket.description
                      }
                    </p>
                  </article>

                  {(
                    selectedTicket.messages ||
                    []
                  ).map((message) => (
                    <article
                      className={
                        message.isStaffReply
                          ? "support-drawer-message staff"
                          : "support-drawer-message customer"
                      }
                      key={
                        message._id ||
                        `${message.createdAt}-${message.message}`
                      }
                    >
                      <strong>
                        {message.isStaffReply
                          ? getPersonName(
                              message.sender
                            ) ||
                            "HHS Support"
                          : getPersonName(
                              message.sender
                            )}
                      </strong>

                      <span>
                        {formatDate(
                          message.createdAt
                        )}
                      </span>

                      <p>
                        {message.message}
                      </p>
                    </article>
                  ))}
                </section>

                <form
                  className="support-drawer-form"
                  onSubmit={handleReply}
                >
                  <label htmlFor="staff-reply">
                    Reply to Customer
                  </label>

                  <textarea
                    id="staff-reply"
                    rows={4}
                    value={replyMessage}
                    onChange={(event) =>
                      setReplyMessage(
                        event.target.value
                      )
                    }
                    placeholder="Write a reply..."
                    disabled={
                      replying ||
                      [
                        "resolved",
                        "closed",
                      ].includes(
                        selectedTicket.status
                      )
                    }
                  />

                  <button
                    type="submit"
                    disabled={
                      replying ||
                      [
                        "resolved",
                        "closed",
                      ].includes(
                        selectedTicket.status
                      )
                    }
                  >
                    {replying
                      ? "Sending..."
                      : "Send Reply"}
                  </button>
                </form>

                <form
                  className="support-drawer-form internal"
                  onSubmit={
                    handleInternalNote
                  }
                >
                  <label htmlFor="internal-note">
                    Internal Staff Note
                  </label>

                  <textarea
                    id="internal-note"
                    rows={3}
                    value={internalNote}
                    onChange={(event) =>
                      setInternalNote(
                        event.target.value
                      )
                    }
                    placeholder="This note is not visible to the customer."
                    disabled={addingNote}
                  />

                  <button
                    type="submit"
                    disabled={addingNote}
                  >
                    {addingNote
                      ? "Adding..."
                      : "Add Internal Note"}
                  </button>
                </form>

                {selectedTicket.internalNotes
                  ?.length > 0 && (
                  <section className="support-internal-notes">
                    <h3>
                      Internal Notes
                    </h3>

                    {selectedTicket.internalNotes.map(
                      (note) => (
                        <article
                          key={
                            note._id ||
                            note.createdAt
                          }
                        >
                          <strong>
                            {getPersonName(
                              note.addedBy
                            )}
                          </strong>

                          <span>
                            {formatDate(
                              note.createdAt
                            )}
                          </span>

                          <p>{note.note}</p>
                        </article>
                      )
                    )}
                  </section>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default SupportManagement;