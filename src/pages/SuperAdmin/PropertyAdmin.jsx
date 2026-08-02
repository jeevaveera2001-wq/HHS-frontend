import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  approveProperty,
  deleteProperty,
  getAdminProperties,
  getPropertyApiErrorMessage,
  rejectProperty,
  updatePropertyActiveStatus,
  updatePropertyFeaturedStatus,
} from "../../services/propertyService";

import "./PropertyAdmin.css";

const DEFAULT_FILTERS = {
  search: "",
  approvalStatus: "all",
  propertyType: "all",
  active: "all",
  featured: "all",
};

const DEFAULT_STATISTICS = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  active: 0,
  featured: 0,
};

const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalProperties: 0,
  pageSize: 20,
};

const PROPERTY_TYPES = [
  "Homestay",
  "Hotel",
  "Resort",
  "Villa",
  "Cottage",
  "Guest House",
];

const formatCurrency = (
  value
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(Number(value) || 0);
};

const formatDate = (value) => {
  if (!value) {
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
  ).format(new Date(value));
};

const getCoverImage = (
  property
) => {
  const images = Array.isArray(
    property?.images
  )
    ? property.images
    : [];

  return (
    images.find(
      (image) => image.isCover
    )?.url ||
    images[0]?.url ||
    ""
  );
};

function PropertyAdmin() {
  const [
    properties,
    setProperties,
  ] = useState([]);

  const [
    statistics,
    setStatistics,
  ] = useState(
    DEFAULT_STATISTICS
  );

  const [
    pagination,
    setPagination,
  ] = useState(
    DEFAULT_PAGINATION
  );

  const [filters, setFilters] =
    useState(DEFAULT_FILTERS);

  const [loading, setLoading] =
    useState(true);

  const [actionId, setActionId] =
    useState("");

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const [
    selectedProperty,
    setSelectedProperty,
  ] = useState(null);

  const [
    rejectTarget,
    setRejectTarget,
  ] = useState(null);

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    rejectionNote,
    setRejectionNote,
  ] = useState("");

  const queryFilters = useMemo(
    () => ({
      search:
        filters.search.trim(),

      approvalStatus:
        filters.approvalStatus,

      propertyType:
        filters.propertyType,

      active:
        filters.active,

      featured:
        filters.featured,
    }),
    [filters]
  );

  const loadProperties =
    useCallback(
      async (
        page = 1,
        showLoader = true
      ) => {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        try {
          const response =
            await getAdminProperties(
              {
                ...queryFilters,
                page,
                limit:
                  pagination.pageSize,
              }
            );

          setProperties(
            response?.properties ||
              []
          );

          setStatistics({
            ...DEFAULT_STATISTICS,
            ...(response?.statistics ||
              {}),
          });

          setPagination(
            (current) => ({
              ...current,
              ...(response?.pagination ||
                {}),

              currentPage:
                response?.pagination
                  ?.currentPage ||
                page,
            })
          );
        } catch (
          requestError
        ) {
          setError(
            getPropertyApiErrorMessage(
              requestError,
              "Unable to load properties."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [
        pagination.pageSize,
        queryFilters,
      ]
    );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        loadProperties(1);
      }, 350);

    return () =>
      window.clearTimeout(
        timeoutId
      );
  }, [loadProperties]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        setNotice("");
      }, 3500);

    return () =>
      window.clearTimeout(
        timeoutId
      );
  }, [notice]);

  const updateFilter = (
    event
  ) => {
    const { name, value } =
      event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(
      DEFAULT_FILTERS
    );
  };

  const refreshAfterAction =
    async (message) => {
      setNotice(message);

      await loadProperties(
        pagination.currentPage,
        false
      );
    };

  const handleApprove =
    async (property) => {
      const confirmed =
        window.confirm(
          `Approve “${property.title}” for public listing?`
        );

      if (!confirmed) {
        return;
      }

      const note =
        window.prompt(
          "Optional approval note:",
          "Property details verified and approved."
        ) ?? "";

      setActionId(
        property._id
      );

      setError("");

      try {
        await approveProperty(
          property._id,
          note
        );

        await refreshAfterAction(
          "Property approved successfully."
        );
      } catch (
        requestError
      ) {
        setError(
          getPropertyApiErrorMessage(
            requestError
          )
        );
      } finally {
        setActionId("");
      }
    };

  const openRejectModal = (
    property
  ) => {
    setRejectTarget(property);
    setRejectionReason("");
    setRejectionNote("");
    setError("");
  };

  const closeRejectModal =
    () => {
      if (actionId) {
        return;
      }

      setRejectTarget(null);
      setRejectionReason("");
      setRejectionNote("");
    };

  const handleReject = async (
    event
  ) => {
    event.preventDefault();

    if (
      !rejectionReason.trim()
    ) {
      setError(
        "Please enter a rejection reason."
      );

      return;
    }

    setActionId(
      rejectTarget._id
    );

    setError("");

    try {
      await rejectProperty(
        rejectTarget._id,
        rejectionReason.trim(),
        rejectionNote.trim()
      );

      setRejectTarget(null);
      setRejectionReason("");
      setRejectionNote("");

      await refreshAfterAction(
        "Property rejected successfully."
      );
    } catch (
      requestError
    ) {
      setError(
        getPropertyApiErrorMessage(
          requestError
        )
      );
    } finally {
      setActionId("");
    }
  };

  const handleFeaturedChange =
    async (property) => {
      const nextStatus =
        !property.isFeatured;

      setActionId(
        property._id
      );

      setError("");

      try {
        await updatePropertyFeaturedStatus(
          property._id,
          nextStatus
        );

        await refreshAfterAction(
          nextStatus
            ? "Property added to featured listings."
            : "Property removed from featured listings."
        );
      } catch (
        requestError
      ) {
        setError(
          getPropertyApiErrorMessage(
            requestError
          )
        );
      } finally {
        setActionId("");
      }
    };

  const handleActiveChange =
    async (property) => {
      const nextStatus =
        !property.isActive;

      setActionId(
        property._id
      );

      setError("");

      try {
        await updatePropertyActiveStatus(
          property._id,
          nextStatus
        );

        await refreshAfterAction(
          nextStatus
            ? "Property activated successfully."
            : "Property deactivated successfully."
        );
      } catch (
        requestError
      ) {
        setError(
          getPropertyApiErrorMessage(
            requestError
          )
        );
      } finally {
        setActionId("");
      }
    };

  const handleDelete =
    async (property) => {
      const confirmed =
        window.confirm(
          `Delete “${property.title}”? This action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      setActionId(
        property._id
      );

      setError("");

      try {
        await deleteProperty(
          property._id
        );

        const nextPage =
          properties.length ===
            1 &&
          pagination.currentPage >
            1
            ? pagination.currentPage -
              1
            : pagination.currentPage;

        setNotice(
          "Property deleted successfully."
        );

        await loadProperties(
          nextPage,
          false
        );
      } catch (
        requestError
      ) {
        setError(
          getPropertyApiErrorMessage(
            requestError
          )
        );
      } finally {
        setActionId("");
      }
    };

  return (
    <main className="property-admin-page">
      <section className="property-admin-shell">
        <header className="property-admin-header">
          <div>
            <span className="property-admin-eyebrow">
              VeeraWebTech · HHS
              Administration
            </span>

            <h1>
              Property Management
            </h1>

            <p>
              Review submissions,
              control public visibility
              and manage every
              Hogenakkal property from
              one place.
            </p>
          </div>

          <button
            type="button"
            className="property-admin-refresh"
            onClick={() =>
              loadProperties(
                pagination.currentPage
              )
            }
            disabled={loading}
          >
            {loading
              ? "Refreshing…"
              : "Refresh properties"}
          </button>
        </header>

        <section
          className="property-admin-stats"
          aria-label="Property statistics"
        >
          <article>
            <span>Total</span>

            <strong>
              {statistics.total}
            </strong>
          </article>

          <article className="is-pending">
            <span>Pending</span>

            <strong>
              {statistics.pending}
            </strong>
          </article>

          <article className="is-approved">
            <span>Approved</span>

            <strong>
              {statistics.approved}
            </strong>
          </article>

          <article className="is-rejected">
            <span>Rejected</span>

            <strong>
              {statistics.rejected}
            </strong>
          </article>

          <article className="is-active">
            <span>Active</span>

            <strong>
              {statistics.active}
            </strong>
          </article>

          <article className="is-featured">
            <span>Featured</span>

            <strong>
              {statistics.featured}
            </strong>
          </article>
        </section>

        <section className="property-admin-filters">
          <label className="property-admin-search">
            <span>Search</span>

            <input
              type="search"
              name="search"
              value={
                filters.search
              }
              onChange={
                updateFilter
              }
              placeholder="Property, address or city"
            />
          </label>

          <label>
            <span>
              Approval
            </span>

            <select
              name="approvalStatus"
              value={
                filters.approvalStatus
              }
              onChange={
                updateFilter
              }
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
          </label>

          <label>
            <span>
              Property type
            </span>

            <select
              name="propertyType"
              value={
                filters.propertyType
              }
              onChange={
                updateFilter
              }
            >
              <option value="all">
                All types
              </option>

              {PROPERTY_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>
              Availability
            </span>

            <select
              name="active"
              value={
                filters.active
              }
              onChange={
                updateFilter
              }
            >
              <option value="all">
                All properties
              </option>

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>
          </label>

          <label>
            <span>
              Featured
            </span>

            <select
              name="featured"
              value={
                filters.featured
              }
              onChange={
                updateFilter
              }
            >
              <option value="all">
                All properties
              </option>

              <option value="true">
                Featured
              </option>

              <option value="false">
                Not featured
              </option>
            </select>
          </label>

          <button
            type="button"
            className="property-admin-reset"
            onClick={
              resetFilters
            }
          >
            Clear filters
          </button>
        </section>

        {error && (
          <div
            className="property-admin-alert is-error"
            role="alert"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div
            className="property-admin-alert is-success"
            role="status"
          >
            <span>
              {notice}
            </span>

            <button
              type="button"
              onClick={() =>
                setNotice("")
              }
            >
              ×
            </button>
          </div>
        )}

        <section className="property-admin-content">
          {loading ? (
            <div className="property-admin-state">
              <span className="property-admin-spinner" />

              <h2>
                Loading properties
              </h2>

              <p>
                Please wait while
                the latest property
                records are loaded.
              </p>
            </div>
          ) : properties.length ===
            0 ? (
            <div className="property-admin-state">
              <span className="property-admin-empty-icon">
                ⌂
              </span>

              <h2>
                No properties found
              </h2>

              <p>
                Try clearing the
                filters or submit a
                new property.
              </p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="property-admin-grid">
              {properties.map(
                (property) => {
                  const coverImage =
                    getCoverImage(
                      property
                    );

                  const isWorking =
                    actionId ===
                    property._id;

                  return (
                    <article
                      className="property-admin-card"
                      key={
                        property._id
                      }
                    >
                      <div className="property-admin-card-media">
                        {coverImage ? (
                          <img
                            src={
                              coverImage
                            }
                            alt={
                              property.title
                            }
                          />
                        ) : (
                          <div className="property-admin-image-placeholder">
                            HHS
                          </div>
                        )}

                        <span
                          className={`property-admin-status is-${property.approvalStatus}`}
                        >
                          {
                            property.approvalStatus
                          }
                        </span>

                        {property.isFeatured && (
                          <span className="property-admin-featured-badge">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <div className="property-admin-card-body">
                        <div className="property-admin-card-heading">
                          <div>
                            <span>
                              {
                                property.propertyType
                              }
                            </span>

                            <h2>
                              {
                                property.title
                              }
                            </h2>
                          </div>

                          <strong>
                            {formatCurrency(
                              property.pricePerNight
                            )}
                          </strong>
                        </div>

                        <p className="property-admin-location">
                          {
                            property
                              .location
                              ?.address
                          }
                          ,{" "}
                          {
                            property
                              .location
                              ?.city
                          }
                        </p>

                        <div className="property-admin-meta">
                          <span>
                            {
                              property.maxGuests
                            }{" "}
                            guests
                          </span>

                          <span>
                            {
                              property.bedrooms
                            }{" "}
                            bedrooms
                          </span>

                          <span>
                            {
                              property.availableRooms
                            }
                            /
                            {
                              property.totalRooms
                            }{" "}
                            rooms
                          </span>
                        </div>

                        <div className="property-admin-owner">
                          <span>
                            Owner
                          </span>

                          <strong>
                            {property
                              .owner
                              ?.fullName ||
                              "Unknown owner"}
                          </strong>

                          <small>
                            {property
                              .owner
                              ?.email ||
                              "No email available"}
                          </small>
                        </div>

                        <div className="property-admin-switches">
                          <label>
                            <input
                              type="checkbox"
                              checked={Boolean(
                                property.isActive
                              )}
                              onChange={() =>
                                handleActiveChange(
                                  property
                                )
                              }
                              disabled={
                                isWorking
                              }
                            />

                            <span>
                              Active
                            </span>
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              checked={Boolean(
                                property.isFeatured
                              )}
                              onChange={() =>
                                handleFeaturedChange(
                                  property
                                )
                              }
                              disabled={
                                isWorking ||
                                property.approvalStatus !==
                                  "approved"
                              }
                            />

                            <span>
                              Featured
                            </span>
                          </label>
                        </div>

                        <div className="property-admin-actions">
                          <button
                            type="button"
                            className="is-view"
                            onClick={() =>
                              setSelectedProperty(
                                property
                              )
                            }
                            disabled={
                              isWorking
                            }
                          >
                            View
                          </button>

                          {property.approvalStatus !==
                            "approved" && (
                            <button
                              type="button"
                              className="is-approve"
                              onClick={() =>
                                handleApprove(
                                  property
                                )
                              }
                              disabled={
                                isWorking
                              }
                            >
                              Approve
                            </button>
                          )}

                          {property.approvalStatus !==
                            "rejected" && (
                            <button
                              type="button"
                              className="is-reject"
                              onClick={() =>
                                openRejectModal(
                                  property
                                )
                              }
                              disabled={
                                isWorking
                              }
                            >
                              Reject
                            </button>
                          )}

                          <button
                            type="button"
                            className="is-delete"
                            onClick={() =>
                              handleDelete(
                                property
                              )
                            }
                            disabled={
                              isWorking
                            }
                          >
                            {isWorking
                              ? "Working…"
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {!loading &&
          pagination.totalPages >
            1 && (
            <nav
              className="property-admin-pagination"
              aria-label="Property pages"
            >
              <button
                type="button"
                onClick={() =>
                  loadProperties(
                    pagination.currentPage -
                      1
                  )
                }
                disabled={
                  pagination.currentPage <=
                  1
                }
              >
                Previous
              </button>

              <span>
                Page{" "}
                {
                  pagination.currentPage
                }{" "}
                of{" "}
                {
                  pagination.totalPages
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  loadProperties(
                    pagination.currentPage +
                      1
                  )
                }
                disabled={
                  pagination.currentPage >=
                  pagination.totalPages
                }
              >
                Next
              </button>
            </nav>
          )}
      </section>

      {selectedProperty && (
        <div
          className="property-admin-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            setSelectedProperty(
              null
            )
          }
        >
          <section
            className="property-admin-modal property-admin-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-details-title"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="property-admin-modal-close"
              onClick={() =>
                setSelectedProperty(
                  null
                )
              }
              aria-label="Close property details"
            >
              ×
            </button>

            <span className="property-admin-eyebrow">
              Property details
            </span>

            <h2 id="property-details-title">
              {
                selectedProperty.title
              }
            </h2>

            <p>
              {
                selectedProperty.description
              }
            </p>

            <div className="property-admin-details-grid">
              <div>
                <span>
                  Price per night
                </span>

                <strong>
                  {formatCurrency(
                    selectedProperty.pricePerNight
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Submitted
                </span>

                <strong>
                  {formatDate(
                    selectedProperty.submittedAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Check-in
                </span>

                <strong>
                  {
                    selectedProperty.checkInTime
                  }
                </strong>
              </div>

              <div>
                <span>
                  Check-out
                </span>

                <strong>
                  {
                    selectedProperty.checkOutTime
                  }
                </strong>
              </div>
            </div>

            <div className="property-admin-detail-section">
              <h3>
                Amenities
              </h3>

              <div className="property-admin-tags">
                {(
                  selectedProperty.amenities ||
                  []
                ).map(
                  (amenity) => (
                    <span
                      key={
                        amenity
                      }
                    >
                      {amenity}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="property-admin-detail-section">
              <h3>
                Approval
                information
              </h3>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {
                  selectedProperty.approvalStatus
                }
              </p>

              {selectedProperty.approvalNote && (
                <p>
                  <strong>
                    Note:
                  </strong>{" "}
                  {
                    selectedProperty.approvalNote
                  }
                </p>
              )}

              {selectedProperty.rejectionReason && (
                <p>
                  <strong>
                    Rejection
                    reason:
                  </strong>{" "}
                  {
                    selectedProperty.rejectionReason
                  }
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {rejectTarget && (
        <div
          className="property-admin-modal-backdrop"
          role="presentation"
          onMouseDown={
            closeRejectModal
          }
        >
          <form
            className="property-admin-modal"
            onSubmit={
              handleReject
            }
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="property-admin-modal-close"
              onClick={
                closeRejectModal
              }
              aria-label="Close rejection form"
            >
              ×
            </button>

            <span className="property-admin-eyebrow">
              Review decision
            </span>

            <h2>
              Reject{" "}
              {
                rejectTarget.title
              }
            </h2>

            <p>
              The rejection reason
              will be visible to the
              property owner.
            </p>

            <label>
              <span>
                Rejection reason *
              </span>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(
                  event
                ) =>
                  setRejectionReason(
                    event.target
                      .value
                  )
                }
                placeholder="Explain what must be corrected before approval"
                rows="5"
                maxLength="1000"
                required
              />
            </label>

            <label>
              <span>
                Internal note
              </span>

              <textarea
                value={
                  rejectionNote
                }
                onChange={(
                  event
                ) =>
                  setRejectionNote(
                    event.target
                      .value
                  )
                }
                placeholder="Optional administrator note"
                rows="3"
                maxLength="1000"
              />
            </label>

            <div className="property-admin-modal-actions">
              <button
                type="button"
                onClick={
                  closeRejectModal
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="is-danger"
                disabled={Boolean(
                  actionId
                )}
              >
                {actionId
                  ? "Rejecting…"
                  : "Reject property"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default PropertyAdmin;