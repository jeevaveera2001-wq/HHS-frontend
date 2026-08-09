import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBuilding,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRedoAlt,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

import "./OwnerRequests.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
};

const formatPropertyType = (
  propertyType
) => {
  const labels = {
    homestay: "Homestay",
    hotel: "Hotel",
    resort: "Resort",
    "guest-house": "Guest House",
  };

  return (
    labels[propertyType] ||
    propertyType ||
    "Not specified"
  );
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
};

const statusInformation = {
  pending: {
    label: "Pending",
    Icon: FaClock,
  },

  approved: {
    label: "Approved",
    Icon: FaCheckCircle,
  },

  rejected: {
    label: "Rejected",
    Icon: FaTimesCircle,
  },
};

function OwnerRequests() {
  const [requests, setRequests] =
    useState([]);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    propertyTypeFilter,
    setPropertyTypeFilter,
  ] = useState("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [reviewingId, setReviewingId] =
    useState("");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [adminNote, setAdminNote] =
    useState("");

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadOwnerRequests =
    useCallback(async () => {
      const token = getToken();

      if (!token) {
        setError(
          "Authentication token was not found. Please log in again."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        query.set("page", "1");
        query.set("limit", "100");

        if (statusFilter !== "all") {
          query.set(
            "status",
            statusFilter
          );
        }

        if (
          propertyTypeFilter !== "all"
        ) {
          query.set(
            "propertyType",
            propertyTypeFilter
          );
        }

        if (search.trim()) {
          query.set(
            "search",
            search.trim()
          );
        }

        const response = await fetch(
          `${API_URL}/owner-requests?${query.toString()}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const result = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load owner requests."
          );
        }

        setRequests(
          Array.isArray(result.requests)
            ? result.requests
            : []
        );
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load owner requests."
        );
      } finally {
        setLoading(false);
      }
    }, [
      propertyTypeFilter,
      search,
      statusFilter,
    ]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        loadOwnerRequests();
      },
      350
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadOwnerRequests]);

  const summary = useMemo(() => {
    return requests.reduce(
      (totals, request) => {
        totals.total += 1;

        if (
          request.status === "pending"
        ) {
          totals.pending += 1;
        }

        if (
          request.status === "approved"
        ) {
          totals.approved += 1;
        }

        if (
          request.status === "rejected"
        ) {
          totals.rejected += 1;
        }

        return totals;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      }
    );
  }, [requests]);

  const openRequest = (request) => {
    setSelectedRequest(request);
    setAdminNote(
      request.adminNote || ""
    );

    setError("");
    setSuccessMessage("");
  };

  const closeRequest = () => {
    if (reviewingId) {
      return;
    }

    setSelectedRequest(null);
    setAdminNote("");
  };

  const reviewRequest = async (
    status
  ) => {
    if (!selectedRequest?._id) {
      return;
    }

    if (
      ![
        "approved",
        "rejected",
      ].includes(status)
    ) {
      return;
    }

    if (
      status === "rejected" &&
      !adminNote.trim()
    ) {
      setError(
        "Please enter a reason before rejecting this request."
      );

      return;
    }

    const actionName =
      status === "approved"
        ? "approve"
        : "reject";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionName} the owner request from ${selectedRequest.fullName}?`
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token was not found. Please log in again."
      );

      return;
    }

    try {
      setReviewingId(
        selectedRequest._id
      );

      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/owner-requests/${selectedRequest._id}/review`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
            adminNote:
              adminNote.trim(),
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Unable to ${actionName} this request.`
        );
      }

      setSuccessMessage(
        result.message ||
          `Owner request ${status} successfully.`
      );

      setRequests(
        (currentRequests) =>
          currentRequests.map(
            (request) =>
              request._id ===
              selectedRequest._id
                ? result.request
                : request
          )
      );

      setSelectedRequest(
        result.request
      );

      setAdminNote(
        result.request?.adminNote ||
          ""
      );
    } catch (reviewError) {
      setError(
        reviewError.message ||
          `Unable to ${actionName} this request.`
      );
    } finally {
      setReviewingId("");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPropertyTypeFilter("all");
  };

  return (
    <main className="owner-admin-page">
      <header className="owner-admin-header">
        <div>
          <span className="owner-admin-eyebrow">
            HHS ADMINISTRATION
          </span>

          <h1>Owner Requests</h1>

          <p>
            Review property-owner applications and
            approve verified applicants.
          </p>
        </div>

        <button
          type="button"
          className="owner-admin-refresh"
          onClick={loadOwnerRequests}
          disabled={loading}
        >
          <FaRedoAlt
            className={
              loading ? "rotating" : ""
            }
            aria-hidden="true"
          />

          <span>
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </header>

      {successMessage && (
        <div
          className="owner-admin-alert success"
          role="status"
        >
          <FaCheckCircle aria-hidden="true" />

          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            aria-label="Close success message"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      )}

      {error && (
        <div
          className="owner-admin-alert error"
          role="alert"
        >
          <FaExclamationTriangle
            aria-hidden="true"
          />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error message"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="owner-admin-summary">
        <article>
          <div className="owner-admin-summary-icon total">
            <FaBuilding aria-hidden="true" />
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{summary.total}</strong>
          </div>
        </article>

        <article>
          <div className="owner-admin-summary-icon pending">
            <FaClock aria-hidden="true" />
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </article>

        <article>
          <div className="owner-admin-summary-icon approved">
            <FaCheckCircle aria-hidden="true" />
          </div>

          <div>
            <span>Approved</span>
            <strong>
              {summary.approved}
            </strong>
          </div>
        </article>

        <article>
          <div className="owner-admin-summary-icon rejected">
            <FaTimesCircle aria-hidden="true" />
          </div>

          <div>
            <span>Rejected</span>
            <strong>
              {summary.rejected}
            </strong>
          </div>
        </article>
      </section>

      <section className="owner-admin-toolbar">
        <div className="owner-admin-search">
          <FaSearch aria-hidden="true" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search applicant, property, email or phone"
            aria-label="Search owner requests"
          />
        </div>

        <div className="owner-admin-filter">
          <FaFilter aria-hidden="true" />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            aria-label="Filter by status"
          >
            <option value="all">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>

        <div className="owner-admin-filter">
          <FaBuilding aria-hidden="true" />

          <select
            value={propertyTypeFilter}
            onChange={(event) =>
              setPropertyTypeFilter(
                event.target.value
              )
            }
            aria-label="Filter by property type"
          >
            <option value="all">
              All property types
            </option>

            <option value="homestay">
              Homestays
            </option>

            <option value="hotel">
              Hotels
            </option>

            <option value="resort">
              Resorts
            </option>

            <option value="guest-house">
              Guest Houses
            </option>
          </select>
        </div>

        <button
          type="button"
          className="owner-admin-reset"
          onClick={resetFilters}
        >
          Clear Filters
        </button>
      </section>

      <section className="owner-admin-table-card">
        {loading ? (
          <div className="owner-admin-state">
            <div className="owner-admin-loader" />

            <h2>Loading requests</h2>

            <p>
              Please wait while owner applications
              are retrieved.
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="owner-admin-state">
            <FaBuilding aria-hidden="true" />

            <h2>No owner requests found</h2>

            <p>
              No applications match the selected
              filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="owner-admin-table-wrapper">
            <table className="owner-admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Property</th>
                  <th>Property Type</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const status =
                    statusInformation[
                      request.status
                    ] ||
                    statusInformation.pending;

                  const StatusIcon =
                    status.Icon;

                  return (
                    <tr key={request._id}>
                      <td>
                        <div className="owner-admin-applicant">
                          <div>
                            {request.fullName
                              ?.charAt(0)
                              .toUpperCase() ||
                              "U"}
                          </div>

                          <span>
                            <strong>
                              {request.fullName}
                            </strong>

                            <small>
                              {request.email}
                            </small>
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="owner-admin-property">
                          <strong>
                            {
                              request.propertyName
                            }
                          </strong>

                          <small>
                            <FaMapMarkerAlt
                              aria-hidden="true"
                            />

                            {
                              request.propertyLocation
                            }
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className="owner-admin-type">
                          {formatPropertyType(
                            request.propertyType
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="owner-admin-date">
                          {formatDate(
                            request.createdAt
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`owner-admin-status ${request.status}`}
                        >
                          <StatusIcon
                            aria-hidden="true"
                          />

                          {status.label}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="owner-admin-view"
                          onClick={() =>
                            openRequest(request)
                          }
                        >
                          <FaEye
                            aria-hidden="true"
                          />

                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRequest && (
        <div
          className="owner-request-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeRequest();
            }
          }}
          role="presentation"
        >
          <section
            className="owner-request-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="owner-request-modal-title"
          >
            <header className="owner-request-modal-header">
              <div>
                <span>
                  OWNER APPLICATION
                </span>

                <h2 id="owner-request-modal-title">
                  {
                    selectedRequest.propertyName
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={closeRequest}
                disabled={Boolean(
                  reviewingId
                )}
                aria-label="Close request details"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </header>

            <div className="owner-request-modal-body">
              <div className="owner-request-detail-status">
                {(() => {
                  const information =
                    statusInformation[
                      selectedRequest.status
                    ] ||
                    statusInformation.pending;

                  const StatusIcon =
                    information.Icon;

                  return (
                    <span
                      className={`owner-admin-status ${selectedRequest.status}`}
                    >
                      <StatusIcon
                        aria-hidden="true"
                      />

                      {information.label}
                    </span>
                  );
                })()}

                <small>
                  Submitted{" "}
                  {formatDate(
                    selectedRequest.createdAt
                  )}
                </small>
              </div>

              <div className="owner-request-detail-grid">
                <article>
                  <div>
                    <FaUser aria-hidden="true" />
                  </div>

                  <span>
                    <small>Applicant</small>
                    <strong>
                      {
                        selectedRequest.fullName
                      }
                    </strong>
                  </span>
                </article>

                <article>
                  <div>
                    <FaPhoneAlt
                      aria-hidden="true"
                    />
                  </div>

                  <span>
                    <small>Phone</small>

                    <a
                      href={`tel:${selectedRequest.phone}`}
                    >
                      {selectedRequest.phone}
                    </a>
                  </span>
                </article>

                <article>
                  <div>
                    <FaEnvelope
                      aria-hidden="true"
                    />
                  </div>

                  <span>
                    <small>Email</small>

                    <a
                      href={`mailto:${selectedRequest.email}`}
                    >
                      {selectedRequest.email}
                    </a>
                  </span>
                </article>

                <article>
                  <div>
                    <FaBuilding
                      aria-hidden="true"
                    />
                  </div>

                  <span>
                    <small>
                      Property Type
                    </small>

                    <strong>
                      {formatPropertyType(
                        selectedRequest.propertyType
                      )}
                    </strong>
                  </span>
                </article>
              </div>

              <div className="owner-request-detail-block">
                <span>
                  <FaMapMarkerAlt
                    aria-hidden="true"
                  />
                  Property Location
                </span>

                <p>
                  {
                    selectedRequest.propertyLocation
                  }
                </p>
              </div>

              <div className="owner-request-detail-block">
                <span>
                  Additional Information
                </span>

                <p>
                  {selectedRequest.message ||
                    "The applicant did not provide additional information."}
                </p>
              </div>

              <div className="owner-request-review-field">
                <label htmlFor="adminNote">
                  Administrative note
                  {selectedRequest.status ===
                    "pending" && (
                    <span>
                      Required when rejecting
                    </span>
                  )}
                </label>

                <textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(
                      event.target.value
                    )
                  }
                  placeholder="Enter verification details or the reason for rejection"
                  rows="4"
                  maxLength="1000"
                  disabled={
                    selectedRequest.status !==
                    "pending"
                  }
                />

                <small>
                  {adminNote.length}/1000
                </small>
              </div>

              {selectedRequest.reviewedBy && (
                <div className="owner-request-reviewed">
                  <FaCheckCircle
                    aria-hidden="true"
                  />

                  <p>
                    Reviewed by{" "}
                    <strong>
                      {selectedRequest
                        .reviewedBy
                        .fullName ||
                        "Administrator"}
                    </strong>
                    {selectedRequest.reviewedAt
                      ? ` on ${formatDate(
                          selectedRequest.reviewedAt
                        )}`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            <footer className="owner-request-modal-footer">
              {selectedRequest.status ===
              "pending" ? (
                <>
                  <button
                    type="button"
                    className="owner-request-reject"
                    onClick={() =>
                      reviewRequest(
                        "rejected"
                      )
                    }
                    disabled={Boolean(
                      reviewingId
                    )}
                  >
                    <FaTimes
                      aria-hidden="true"
                    />

                    {reviewingId
                      ? "Processing..."
                      : "Reject Request"}
                  </button>

                  <button
                    type="button"
                    className="owner-request-approve"
                    onClick={() =>
                      reviewRequest(
                        "approved"
                      )
                    }
                    disabled={Boolean(
                      reviewingId
                    )}
                  >
                    <FaCheck
                      aria-hidden="true"
                    />

                    {reviewingId
                      ? "Processing..."
                      : "Approve Owner"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="owner-request-close"
                  onClick={closeRequest}
                >
                  Close
                </button>
              )}
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

export default OwnerRequests;