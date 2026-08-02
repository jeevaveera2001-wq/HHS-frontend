import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  deleteProperty,
  getApprovalQueue,
  toggleFeaturedProperty,
  updatePropertyApproval,
} from "../../services/propertyService";

import "./PropertyManagement.css";

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const initialSummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

function PropertyManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [properties, setProperties] =
    useState([]);

  const [summary, setSummary] =
    useState(initialSummary);

  const [loading, setLoading] =
    useState(true);

  const [actionId, setActionId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    selectedProperty,
    setSelectedProperty,
  ] = useState(null);

  const [
    rejectingProperty,
    setRejectingProperty,
  ] = useState(null);

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const handleUnauthorized =
    useCallback(() => {
      logout();

      toast.error(
        "Your session has expired. Please log in again."
      );

      navigate("/login", {
        replace: true,
      });
    }, [logout, navigate]);

  const handleRequestError = useCallback(
    (error) => {
      const status =
        error?.status ||
        error?.response?.status;

      if (status === 401) {
        handleUnauthorized();
        return;
      }

      if (status === 403) {
        toast.error(
          "You do not have permission to perform this action."
        );

        return;
      }

      toast.error(
        error?.message ||
          "Something went wrong. Please try again."
      );
    },
    [handleUnauthorized]
  );

  const loadProperties =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getApprovalQueue({
            status: "all",
            page: 1,
            limit: 50,
          });

        const loadedProperties =
          data.properties || [];

        const loadedSummary =
          data.summary || {};

        setProperties(loadedProperties);

        setSummary({
          total:
            data.totalProperties ??
            (loadedSummary.pending || 0) +
              (loadedSummary.approved ||
                0) +
              (loadedSummary.rejected ||
                0),

          pending:
            loadedSummary.pending || 0,

          approved:
            loadedSummary.approved || 0,

          rejected:
            loadedSummary.rejected || 0,
        });
      } catch (error) {
        handleRequestError(error);
      } finally {
        setLoading(false);
      }
    }, [handleRequestError]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    const modalOpen = Boolean(
      selectedProperty ||
        rejectingProperty
    );

    if (!modalOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    selectedProperty,
    rejectingProperty,
  ]);

  const filteredProperties =
    useMemo(() => {
      const normalizedSearch = search
        .trim()
        .toLowerCase();

      return properties.filter(
        (property) => {
          const matchesStatus =
            statusFilter === "all" ||
            property.approvalStatus ===
              statusFilter;

          const searchableText = [
            property.title,
            property.propertyType,
            property.location?.address,
            property.location?.city,
            property.location?.district,
            property.owner?.fullName,
            property.owner?.email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      properties,
      search,
      statusFilter,
    ]);

  const suspendedCount = useMemo(() => {
    return properties.filter(
      (property) => !property.isActive
    ).length;
  }, [properties]);

  const getCoverImage = (property) => {
    const cover =
      property.images?.find(
        (image) => image.isCover
      );

    return (
      cover?.url ||
      property.images?.[0]?.url ||
      null
    );
  };

  const updateLocalProperty = (
    updatedProperty
  ) => {
    if (!updatedProperty?._id) {
      return;
    }

    setProperties((previous) =>
      previous.map((property) => {
        if (
          property._id !==
          updatedProperty._id
        ) {
          return property;
        }

        const owner =
          updatedProperty.owner &&
          typeof updatedProperty.owner ===
            "object"
            ? updatedProperty.owner
            : property.owner;

        return {
          ...property,
          ...updatedProperty,
          owner,
        };
      })
    );

    setSelectedProperty((current) => {
      if (
        !current ||
        current._id !==
          updatedProperty._id
      ) {
        return current;
      }

      return {
        ...current,
        ...updatedProperty,

        owner:
          updatedProperty.owner &&
          typeof updatedProperty.owner ===
            "object"
            ? updatedProperty.owner
            : current.owner,
      };
    });
  };

  const refreshAfterAction =
    async () => {
      await loadProperties();
    };

  const handleApprove = async (
    property
  ) => {
    const confirmed =
      window.confirm(
        `Approve "${property.title}" and publish it on the website?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(property._id);

      const data =
        await updatePropertyApproval(
          property._id,
          "approved",
          {
            note:
              "Property details verified and approved.",
          }
        );

      updateLocalProperty(
        data.property
      );

      toast.success(data.message);

      await refreshAfterAction();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setActionId(null);
    }
  };

  const openRejectDialog = (
    property
  ) => {
    setRejectingProperty(property);

    setRejectionReason(
      property.rejectionReason || ""
    );
  };

  const closeRejectDialog = () => {
    if (actionId) {
      return;
    }

    setRejectingProperty(null);
    setRejectionReason("");
  };

  const handleReject = async (
    event
  ) => {
    event.preventDefault();

    const normalizedReason =
      rejectionReason.trim();

    if (!normalizedReason) {
      toast.error(
        "Please enter a reason for rejecting the property."
      );

      return;
    }

    try {
      setActionId(
        rejectingProperty._id
      );

      const data =
        await updatePropertyApproval(
          rejectingProperty._id,
          "rejected",
          {
            rejectionReason:
              normalizedReason,

            note: normalizedReason,
          }
        );

      updateLocalProperty(
        data.property
      );

      toast.success(data.message);

      setRejectingProperty(null);
      setRejectionReason("");

      await refreshAfterAction();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setActionId(null);
    }
  };

  const handleReturnToPending =
    async (property) => {
      const confirmed =
        window.confirm(
          `Return "${property.title}" to the pending review queue?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(property._id);

        const data =
          await updatePropertyApproval(
            property._id,
            "pending",
            {
              note:
                "Property returned to pending review.",
            }
          );

        updateLocalProperty(
          data.property
        );

        toast.success(data.message);

        await refreshAfterAction();
      } catch (error) {
        handleRequestError(error);
      } finally {
        setActionId(null);
      }
    };

  const handleFeatured = async (
    property
  ) => {
    try {
      setActionId(property._id);

      const data =
        await toggleFeaturedProperty(
          property._id
        );

      updateLocalProperty(
        data.property
      );

      toast.success(data.message);
    } catch (error) {
      handleRequestError(error);
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (
    property
  ) => {
    const confirmed =
      window.confirm(
        `Suspend "${property.title}"? It will no longer appear publicly.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(property._id);

      const data =
        await deleteProperty(
          property._id
        );

      setProperties((previous) =>
        previous.map((item) =>
          item._id === property._id
            ? {
                ...item,
                isActive: false,
                isFeatured: false,
              }
            : item
        )
      );

      toast.success(data.message);
    } catch (error) {
      handleRequestError(error);
    } finally {
      setActionId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(price || 0);
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

  return (
    <main className="property-admin-page">
      <header className="property-admin-header">
        <div>
          <Link
            className="property-admin-back"
            to="/super-admin"
          >
            ← Super Admin Dashboard
          </Link>

          <span>
            HHS Property Operations
          </span>

          <h1>
            Property Management
          </h1>

          <p>
            Review, approve, reject,
            feature and suspend
            Hogenakkal stay listings.
          </p>
        </div>

        <Link
          className="property-admin-create"
          to="/add-property"
        >
          + Add property
        </Link>
      </header>

      <section className="property-admin-summary">
        <article>
          <span>
            Total properties
          </span>

          <strong>
            {summary.total}
          </strong>
        </article>

        <article className="pending">
          <span>
            Pending review
          </span>

          <strong>
            {summary.pending}
          </strong>
        </article>

        <article className="approved">
          <span>Approved</span>

          <strong>
            {summary.approved}
          </strong>
        </article>

        <article className="rejected">
          <span>Rejected</span>

          <strong>
            {summary.rejected}
          </strong>
        </article>

        <article className="suspended">
          <span>
            Suspended on page
          </span>

          <strong>
            {suspendedCount}
          </strong>
        </article>
      </section>

      <section className="property-admin-panel">
        <div className="property-admin-filters">
          <div>
            <label htmlFor="property-admin-search">
              Search properties
            </label>

            <input
              id="property-admin-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Property, owner or location"
            />
          </div>

          <div>
            <label htmlFor="approval-filter">
              Approval status
            </label>

            <select
              id="approval-filter"
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

          <button
            type="button"
            onClick={loadProperties}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="property-admin-loading">
            <div />

            <p>
              Loading property
              listings...
            </p>
          </div>
        ) : filteredProperties.length ===
          0 ? (
          <div className="property-admin-empty">
            <span>🏨</span>

            <h2>
              No properties found
            </h2>

            <p>
              No listings match your
              current filters.
            </p>
          </div>
        ) : (
          <div className="property-admin-grid">
            {filteredProperties.map(
              (property) => {
                const coverImage =
                  getCoverImage(property);

                const isUpdating =
                  actionId ===
                  property._id;

                return (
                  <article
                    className="property-review-card"
                    key={property._id}
                  >
                    <div className="property-review-image">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={
                            property.title
                          }
                        />
                      ) : (
                        <div className="review-image-placeholder">
                          HHS
                        </div>
                      )}

                      <span
                        className={`review-status ${property.approvalStatus}`}
                      >
                        {statusLabels[
                          property
                            .approvalStatus
                        ] || "Unknown"}
                      </span>

                      {!property.isActive && (
                        <span className="review-suspended">
                          Suspended
                        </span>
                      )}
                    </div>

                    <div className="property-review-body">
                      <div className="review-type-row">
                        <span>
                          {
                            property.propertyType
                          }
                        </span>

                        {property.isFeatured && (
                          <strong>
                            ★ Featured
                          </strong>
                        )}
                      </div>

                      <h2>
                        {property.title}
                      </h2>

                      <p className="review-location">
                        📍{" "}
                        {property
                          .location?.city ||
                          "Hogenakkal"}
                        ,{" "}
                        {property
                          .location
                          ?.district ||
                          "Dharmapuri"}
                      </p>

                      <div className="review-property-info">
                        <span>
                          {formatPrice(
                            property.pricePerNight
                          )}
                          /night
                        </span>

                        <span>
                          {
                            property.totalRooms
                          }{" "}
                          rooms
                        </span>

                        <span>
                          {
                            property.maxGuests
                          }{" "}
                          guests
                        </span>
                      </div>

                      <div className="review-owner">
                        <small>
                          Property owner
                        </small>

                        <strong>
                          {property.owner
                            ?.fullName ||
                            "Unknown owner"}
                        </strong>

                        <span>
                          {property.owner
                            ?.email ||
                            "Email unavailable"}
                        </span>
                      </div>

                      {property.approvalStatus ===
                        "rejected" &&
                        property.rejectionReason && (
                          <div className="review-rejection-reason">
                            <strong>
                              Rejection
                              reason
                            </strong>

                            <p>
                              {
                                property.rejectionReason
                              }
                            </p>
                          </div>
                        )}

                      <div className="review-actions">
                        <button
                          type="button"
                          className="details"
                          onClick={() =>
                            setSelectedProperty(
                              property
                            )
                          }
                        >
                          View details
                        </button>

                        {property.approvalStatus !==
                          "approved" &&
                          property.isActive && (
                            <button
                              type="button"
                              className="approve"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleApprove(
                                  property
                                )
                              }
                            >
                              {isUpdating
                                ? "Working..."
                                : "Approve"}
                            </button>
                          )}

                        {property.approvalStatus !==
                          "rejected" &&
                          property.isActive && (
                            <button
                              type="button"
                              className="reject"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                openRejectDialog(
                                  property
                                )
                              }
                            >
                              Reject
                            </button>
                          )}

                        {property.approvalStatus ===
                          "rejected" &&
                          property.isActive && (
                            <button
                              type="button"
                              className="pending-action"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleReturnToPending(
                                  property
                                )
                              }
                            >
                              Return to
                              pending
                            </button>
                          )}

                        {property.approvalStatus ===
                          "approved" &&
                          property.isActive && (
                            <button
                              type="button"
                              className="feature"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleFeatured(
                                  property
                                )
                              }
                            >
                              {property.isFeatured
                                ? "Unfeature"
                                : "Feature"}
                            </button>
                          )}

                        {property.isActive && (
                          <button
                            type="button"
                            className="suspend"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleSuspend(
                                property
                              )
                            }
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {selectedProperty && (
        <div
          className="property-review-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            setSelectedProperty(null)
          }
        >
          <section
            className="property-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-details-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="property-review-modal-header">
              <div>
                <span>
                  Property review
                </span>

                <h2 id="property-details-title">
                  {
                    selectedProperty.title
                  }
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close property details"
                onClick={() =>
                  setSelectedProperty(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            {getCoverImage(
              selectedProperty
            ) && (
              <img
                className="property-review-modal-image"
                src={getCoverImage(
                  selectedProperty
                )}
                alt={
                  selectedProperty.title
                }
              />
            )}

            <div className="property-review-modal-content">
              <div className="property-review-detail-grid">
                <div>
                  <small>Status</small>

                  <strong>
                    {statusLabels[
                      selectedProperty
                        .approvalStatus
                    ] || "Unknown"}
                  </strong>
                </div>

                <div>
                  <small>
                    Property type
                  </small>

                  <strong>
                    {
                      selectedProperty.propertyType
                    }
                  </strong>
                </div>

                <div>
                  <small>Price</small>

                  <strong>
                    {formatPrice(
                      selectedProperty.pricePerNight
                    )}
                    /night
                  </strong>
                </div>

                <div>
                  <small>
                    Availability
                  </small>

                  <strong>
                    {
                      selectedProperty.availableRooms
                    }
                    /
                    {
                      selectedProperty.totalRooms
                    }{" "}
                    rooms
                  </strong>
                </div>

                <div>
                  <small>Guests</small>

                  <strong>
                    {
                      selectedProperty.maxGuests
                    }
                  </strong>
                </div>

                <div>
                  <small>
                    Submitted
                  </small>

                  <strong>
                    {formatDate(
                      selectedProperty.submittedAt
                    )}
                  </strong>
                </div>
              </div>

              <div className="property-review-section">
                <h3>Description</h3>

                <p>
                  {
                    selectedProperty.description
                  }
                </p>
              </div>

              <div className="property-review-section">
                <h3>Location</h3>

                <p>
                  {[
                    selectedProperty
                      .location?.address,

                    selectedProperty
                      .location?.city,

                    selectedProperty
                      .location?.district,

                    selectedProperty
                      .location?.state,

                    selectedProperty
                      .location?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <div className="property-review-section">
                <h3>Owner</h3>

                <p>
                  {selectedProperty
                    .owner?.fullName ||
                    "Unknown owner"}
                  <br />

                  {selectedProperty
                    .owner?.email ||
                    "Email unavailable"}
                  <br />

                  {selectedProperty
                    .owner?.phone ||
                    "Phone unavailable"}
                </p>
              </div>

              {selectedProperty
                .amenities?.length >
                0 && (
                <div className="property-review-section">
                  <h3>Amenities</h3>

                  <div className="property-review-tags">
                    {selectedProperty.amenities.map(
                      (amenity) => (
                        <span
                          key={amenity}
                        >
                          {amenity}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedProperty
                .rejectionReason && (
                <div className="property-review-rejection-box">
                  <h3>
                    Rejection reason
                  </h3>

                  <p>
                    {
                      selectedProperty.rejectionReason
                    }
                  </p>
                </div>
              )}

              {selectedProperty
                .reviewedAt && (
                <div className="property-review-section">
                  <h3>
                    Latest review
                  </h3>

                  <p>
                    Reviewed by{" "}
                    <strong>
                      {selectedProperty
                        .reviewedBy
                        ?.fullName ||
                        "HHS staff"}
                    </strong>{" "}
                    on{" "}
                    {formatDate(
                      selectedProperty.reviewedAt
                    )}
                    .
                  </p>
                </div>
              )}
            </div>

            <div className="property-review-modal-actions">
              <button
                type="button"
                className="modal-close-action"
                onClick={() =>
                  setSelectedProperty(
                    null
                  )
                }
              >
                Close
              </button>

              {selectedProperty.approvalStatus !==
                "approved" &&
                selectedProperty.isActive && (
                  <button
                    type="button"
                    className="approve"
                    disabled={
                      actionId ===
                      selectedProperty._id
                    }
                    onClick={() =>
                      handleApprove(
                        selectedProperty
                      )
                    }
                  >
                    Approve property
                  </button>
                )}

              {selectedProperty.approvalStatus !==
                "rejected" &&
                selectedProperty.isActive && (
                  <button
                    type="button"
                    className="reject"
                    disabled={
                      actionId ===
                      selectedProperty._id
                    }
                    onClick={() => {
                      const property =
                        selectedProperty;

                      setSelectedProperty(
                        null
                      );

                      openRejectDialog(
                        property
                      );
                    }}
                  >
                    Reject property
                  </button>
                )}
            </div>
          </section>
        </div>
      )}

      {rejectingProperty && (
        <div
          className="property-review-modal-backdrop"
          role="presentation"
          onMouseDown={
            closeRejectDialog
          }
        >
          <form
            className="property-reject-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-property-title"
            onSubmit={handleReject}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="property-review-modal-header">
              <div>
                <span>
                  Property review
                </span>

                <h2 id="reject-property-title">
                  Reject property
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close rejection dialog"
                onClick={
                  closeRejectDialog
                }
                disabled={Boolean(
                  actionId
                )}
              >
                ×
              </button>
            </div>

            <p>
              Explain what must be
              corrected in{" "}
              <strong>
                {
                  rejectingProperty.title
                }
              </strong>
              . The owner will see this
              message.
            </p>

            <label htmlFor="property-rejection-reason">
              Rejection reason
            </label>

            <textarea
              id="property-rejection-reason"
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(
                  event.target.value
                )
              }
              placeholder="Example: Upload clearer room images and verify the property address."
              rows={6}
              maxLength={1000}
              autoFocus
              required
            />

            <div className="property-rejection-meta">
              <span>
                The reason is required.
              </span>

              <span>
                {rejectionReason.length}
                /1000
              </span>
            </div>

            <div className="property-review-modal-actions">
              <button
                type="button"
                className="modal-close-action"
                onClick={
                  closeRejectDialog
                }
                disabled={Boolean(
                  actionId
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="reject"
                disabled={
                  Boolean(actionId) ||
                  !rejectionReason.trim()
                }
              >
                {actionId
                  ? "Rejecting..."
                  : "Reject property"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default PropertyManagement;