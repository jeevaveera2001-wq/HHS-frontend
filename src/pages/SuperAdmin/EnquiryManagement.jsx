import "./EnquiryManagement.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { toast } from "react-toastify";

import {
  getContactErrorMessage,
  getManagedEnquiries,
  updateManagedEnquiry,
} from "../../services/contactService";

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function EnquiryManagement() {
  const [enquiries, setEnquiries] =
    useState([]);

  const [statistics, setStatistics] =
    useState({
      total: 0,
      new: 0,
      contacted: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState(null);

  const [adminNote, setAdminNote] =
    useState("");

  const loadEnquiries =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getManagedEnquiries({
            search:
              search.trim() ||
              undefined,
            status:
              status === "all"
                ? undefined
                : status,
            page,
            limit: 20,
          });

        setEnquiries(
          Array.isArray(
            data?.enquiries
          )
            ? data.enquiries
            : []
        );

        setStatistics(
          data?.statistics || {
            total: 0,
            new: 0,
            contacted: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0,
          }
        );

        setTotalPages(
          data?.totalPages || 1
        );
      } catch (error) {
        toast.error(
          getContactErrorMessage(
            error
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      status,
    ]);

  useEffect(() => {
    const timer =
      setTimeout(
        loadEnquiries,
        350
      );

    return () =>
      clearTimeout(timer);
  }, [loadEnquiries]);

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(dateValue)
    );
  };

  const openEnquiry = (
    enquiry
  ) => {
    setSelectedEnquiry(
      enquiry
    );

    setAdminNote(
      enquiry.adminNote || ""
    );
  };

  const closeEnquiry = () => {
    setSelectedEnquiry(null);
    setAdminNote("");
  };

  const updateEnquiry = async (
    enquiryId,
    updateData
  ) => {
    try {
      setUpdatingId(enquiryId);

      const data =
        await updateManagedEnquiry(
          enquiryId,
          updateData
        );

      const updatedEnquiry =
        data?.enquiry;

      if (updatedEnquiry) {
        setEnquiries(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                updatedEnquiry._id
                  ? updatedEnquiry
                  : item
            )
        );

        if (
          selectedEnquiry?._id ===
          updatedEnquiry._id
        ) {
          setSelectedEnquiry(
            updatedEnquiry
          );

          setAdminNote(
            updatedEnquiry.adminNote ||
              ""
          );
        }
      }

      toast.success(
        data?.message ||
          "Enquiry updated successfully."
      );

      await loadEnquiries();
    } catch (error) {
      toast.error(
        getContactErrorMessage(
          error
        )
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="enquiry-admin-page">
      <header className="enquiry-admin-header">
        <div>
          <Link
            to="/super-admin"
            className="enquiry-back-link"
          >
            ← Super Admin Dashboard
          </Link>

          <span>
            CUSTOMER ENQUIRIES
          </span>

          <h1>
            Enquiry Management
          </h1>

          <p>
            Review and respond to
            enquiries submitted from
            the HHS contact page.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadEnquiries
          }
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      <section className="enquiry-statistics">
        <article>
          <span>Total</span>
          <strong>
            {statistics.total}
          </strong>
        </article>

        <article>
          <span>New</span>
          <strong>
            {statistics.new}
          </strong>
        </article>

        <article>
          <span>Contacted</span>
          <strong>
            {statistics.contacted}
          </strong>
        </article>

        <article>
          <span>In Progress</span>
          <strong>
            {statistics.in_progress}
          </strong>
        </article>

        <article>
          <span>Resolved</span>
          <strong>
            {statistics.resolved}
          </strong>
        </article>
      </section>

      <section className="enquiry-toolbar">
        <input
          type="search"
          value={search}
          placeholder="Search name, email, phone or reference"
          onChange={(event) => {
            setSearch(
              event.target.value
            );
            setPage(1);
          }}
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value
            );
            setPage(1);
          }}
        >
          <option value="all">
            All statuses
          </option>

          {Object.entries(
            statusLabels
          ).map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            )
          )}
        </select>
      </section>

      {loading ? (
        <section className="enquiry-state">
          Loading enquiries...
        </section>
      ) : enquiries.length === 0 ? (
        <section className="enquiry-state">
          No enquiries found.
        </section>
      ) : (
        <section className="enquiry-list">
          {enquiries.map(
            (enquiry) => (
              <article
                className="enquiry-card"
                key={enquiry._id}
              >
                <div className="enquiry-card-header">
                  <div>
                    <span>
                      {enquiry.enquiryReference}
                    </span>

                    <h2>
                      {enquiry.name}
                    </h2>
                  </div>

                  <select
                    value={
                      enquiry.status
                    }
                    disabled={
                      updatingId ===
                      enquiry._id
                    }
                    onChange={(
                      event
                    ) =>
                      updateEnquiry(
                        enquiry._id,
                        {
                          status:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  >
                    {Object.entries(
                      statusLabels
                    ).map(
                      ([
                        value,
                        label,
                      ]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="enquiry-contact-details">
                  <a
                    href={`mailto:${enquiry.email}`}
                  >
                    {enquiry.email}
                  </a>

                  <a
                    href={`tel:${enquiry.phone}`}
                  >
                    {enquiry.phone}
                  </a>
                </div>

                <p className="enquiry-message">
                  {enquiry.message}
                </p>

                <div className="enquiry-card-footer">
                  <span>
                    {formatDate(
                      enquiry.createdAt
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      openEnquiry(
                        enquiry
                      )
                    }
                  >
                    View Enquiry
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      )}

      <nav className="enquiry-pagination">
        <button
          type="button"
          disabled={
            page <= 1 ||
            loading
          }
          onClick={() =>
            setPage(
              (current) =>
                current - 1
            )
          }
        >
          Previous
        </button>

        <span>
          Page {page} of{" "}
          {totalPages}
        </span>

        <button
          type="button"
          disabled={
            page >=
              totalPages ||
            loading
          }
          onClick={() =>
            setPage(
              (current) =>
                current + 1
            )
          }
        >
          Next
        </button>
      </nav>

      {selectedEnquiry && (
        <div
          className="enquiry-modal-overlay"
          role="presentation"
          onMouseDown={
            closeEnquiry
          }
        >
          <section
            className="enquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Enquiry details"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="enquiry-modal-close"
              onClick={
                closeEnquiry
              }
            >
              ×
            </button>

            <span>
              {
                selectedEnquiry
                  .enquiryReference
              }
            </span>

            <h2>
              {selectedEnquiry.name}
            </h2>

            <div className="enquiry-modal-actions">
              <a
                href={`tel:${selectedEnquiry.phone}`}
              >
                Call Customer
              </a>

              <a
                href={`mailto:${selectedEnquiry.email}`}
              >
                Send Email
              </a>

              <a
                href={`https://wa.me/${selectedEnquiry.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>

            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  {
                    selectedEnquiry
                      .email
                  }
                </dd>
              </div>

              <div>
                <dt>Phone</dt>
                <dd>
                  {
                    selectedEnquiry
                      .phone
                  }
                </dd>
              </div>

              <div>
                <dt>Submitted</dt>
                <dd>
                  {formatDate(
                    selectedEnquiry
                      .createdAt
                  )}
                </dd>
              </div>
            </dl>

            <div className="enquiry-full-message">
              <strong>
                Customer Message
              </strong>

              <p>
                {
                  selectedEnquiry
                    .message
                }
              </p>
            </div>

            <label htmlFor="admin-note">
              Internal Admin Note
            </label>

            <textarea
              id="admin-note"
              rows={5}
              maxLength={2000}
              value={adminNote}
              onChange={(
                event
              ) =>
                setAdminNote(
                  event.target
                    .value
                )
              }
            />

            <button
              type="button"
              className="enquiry-save-button"
              disabled={
                updatingId ===
                selectedEnquiry._id
              }
              onClick={() =>
                updateEnquiry(
                  selectedEnquiry._id,
                  {
                    adminNote:
                      adminNote.trim(),
                  }
                )
              }
            >
              {updatingId ===
              selectedEnquiry._id
                ? "Saving..."
                : "Save Admin Note"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default EnquiryManagement;