import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  deleteReview,
  getManagedReviews,
  replyToReview,
  updateReviewVisibility,
} from "../../services/reviewService";

import "./ReviewManagement.css";

/* =====================================
   Helpers
===================================== */

const getEntityId = (value) => {
  return String(
    value?._id ||
      value?.id ||
      value ||
      ""
  );
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const renderStars = (rating) => {
  const normalizedRating =
    Math.min(
      Math.max(
        Math.round(
          Number(rating) || 0
        ),
        0
      ),
      5
    );

  return (
    "★".repeat(
      normalizedRating
    ) +
    "☆".repeat(
      5 - normalizedRating
    )
  );
};

const getPropertyImage = (
  property
) => {
  const images =
    Array.isArray(
      property?.images
    )
      ? property.images
      : [];

  const coverImage =
    images.find(
      (image) => image.isCover
    ) || images[0];

  return coverImage?.url || "";
};

/* =====================================
   Review management page
===================================== */

function ReviewManagement() {
  const { user } = useAuth();

  const [reviews, setReviews] =
    useState([]);

  const [
    properties,
    setProperties,
  ] = useState([]);

  const [
    statistics,
    setStatistics,
  ] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    replied: 0,
    unreplied: 0,
  });

  const [
    pagination,
    setPagination,
  ] = useState({
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0,
    pageSize: 12,
  });

  const [filters, setFilters] =
    useState({
      search: "",
      propertyId: "",
      rating: "all",
      visibility: "all",
      replied: "all",
      sort: "newest",
      page: 1,
      limit: 12,
    });

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    replyDrafts,
    setReplyDrafts,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [actionId, setActionId] =
    useState("");

  const isStaff = useMemo(() => {
    return [
      "operations_manager",
      "super_admin",
    ].includes(user?.role);
  }, [user?.role]);

  const isOwner =
    user?.role === "owner";

  const backPath = isOwner
    ? "/owner"
    : "/super-admin";

  /* =====================================
     Load reviews
  ===================================== */

  const loadReviews =
    useCallback(
      async ({
        showRefresh = false,
      } = {}) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const data =
            await getManagedReviews(
              filters
            );

          const receivedReviews =
            Array.isArray(
              data?.reviews
            )
              ? data.reviews
              : [];

          setReviews(
            receivedReviews
          );

          setProperties(
            Array.isArray(
              data?.managedProperties
            )
              ? data.managedProperties
              : []
          );

          setStatistics({
            total:
              Number(
                data?.statistics
                  ?.total
              ) || 0,

            visible:
              Number(
                data?.statistics
                  ?.visible
              ) || 0,

            hidden:
              Number(
                data?.statistics
                  ?.hidden
              ) || 0,

            replied:
              Number(
                data?.statistics
                  ?.replied
              ) || 0,

            unreplied:
              Number(
                data?.statistics
                  ?.unreplied
              ) || 0,
          });

          setPagination({
            currentPage:
              Number(
                data?.pagination
                  ?.currentPage
              ) || 1,

            totalPages:
              Number(
                data?.pagination
                  ?.totalPages
              ) || 0,

            totalReviews:
              Number(
                data?.pagination
                  ?.totalReviews
              ) || 0,

            pageSize:
              Number(
                data?.pagination
                  ?.pageSize
              ) || 12,
          });

          const nextReplyDrafts =
            {};

          receivedReviews.forEach(
            (review) => {
              nextReplyDrafts[
                getEntityId(review)
              ] =
                review.ownerReply
                  ?.message || "";
            }
          );

          setReplyDrafts(
            nextReplyDrafts
          );
        } catch (requestError) {
          setReviews([]);

          setError(
            requestError?.data
              ?.message ||
              requestError?.message ||
              "Unable to load reviews."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [filters]
    );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  /* =====================================
     Filter handlers
  ===================================== */

  const updateFilter = (
    name,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: 1,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    setFilters((previous) => ({
      ...previous,
      search:
        searchInput.trim(),
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchInput("");

    setFilters({
      search: "",
      propertyId: "",
      rating: "all",
      visibility: "all",
      replied: "all",
      sort: "newest",
      page: 1,
      limit: 12,
    });
  };

  /* =====================================
     Reply to review
  ===================================== */

  const handleReply = async (
    event,
    review
  ) => {
    event.preventDefault();

    const reviewId =
      getEntityId(review);

    const message =
      replyDrafts[reviewId]
        ?.trim();

    if (!message) {
      toast.error(
        "Enter a reply message."
      );

      return;
    }

    try {
      setActionId(
        "reply-" + reviewId
      );

      await replyToReview(
        reviewId,
        message
      );

      toast.success(
        review.ownerReply?.message
          ? "Reply updated successfully."
          : "Reply added successfully."
      );

      await loadReviews({
        showRefresh: true,
      });
    } catch (requestError) {
      toast.error(
        requestError?.data
          ?.message ||
          requestError?.message ||
          "Unable to save the reply."
      );
    } finally {
      setActionId("");
    }
  };

  /* =====================================
     Visibility moderation
  ===================================== */

  const handleVisibility = async (
    review
  ) => {
    const reviewId =
      getEntityId(review);

    const nextVisibility =
      !review.isVisible;

    const note =
      window.prompt(
        nextVisibility
          ? "Optional note for restoring this review:"
          : "Enter the reason for hiding this review:",
        review.moderationNote ||
          ""
      );

    if (note === null) {
      return;
    }

    try {
      setActionId(
        "visibility-" +
          reviewId
      );

      await updateReviewVisibility(
        reviewId,
        nextVisibility,
        note.trim()
      );

      toast.success(
        nextVisibility
          ? "Review restored successfully."
          : "Review hidden successfully."
      );

      await loadReviews({
        showRefresh: true,
      });
    } catch (requestError) {
      toast.error(
        requestError?.data
          ?.message ||
          requestError?.message ||
          "Unable to update review visibility."
      );
    } finally {
      setActionId("");
    }
  };

  /* =====================================
     Delete review
  ===================================== */

  const handleDelete = async (
    review
  ) => {
    const reviewId =
      getEntityId(review);

    const confirmed =
      window.confirm(
        "Permanently delete this review? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(
        "delete-" + reviewId
      );

      await deleteReview(
        reviewId
      );

      toast.success(
        "Review deleted successfully."
      );

      if (
        reviews.length === 1 &&
        filters.page > 1
      ) {
        setFilters(
          (previous) => ({
            ...previous,
            page:
              previous.page - 1,
          })
        );
      } else {
        await loadReviews({
          showRefresh: true,
        });
      }
    } catch (requestError) {
      toast.error(
        requestError?.data
          ?.message ||
          requestError?.message ||
          "Unable to delete the review."
      );
    } finally {
      setActionId("");
    }
  };

  const summaryItems = [
    {
      key: "all",
      label: "All reviews",
      value: statistics.total,
    },
    {
      key: "visible",
      label: "Public",
      value: statistics.visible,
    },
    {
      key: "hidden",
      label: "Hidden",
      value: statistics.hidden,
    },
    {
      key: "replied",
      label: "Replied",
      value: statistics.replied,
    },
    {
      key: "unreplied",
      label:
        "Awaiting reply",
      value:
        statistics.unreplied,
    },
  ];

  return (
    <main className="review-management-page">
      <header className="review-management-header">
        <div>
          <Link
            className="review-management-back"
            to={backPath}
          >
            ← Back to dashboard
          </Link>

          <span>
            {isOwner
              ? "Property reputation"
              : "Review moderation"}
          </span>

          <h1>
            Review Management
          </h1>

          <p>
            {isOwner
              ? "Read verified guest feedback and reply to reviews received by your properties."
              : "Monitor guest feedback, reply to reviews and control public visibility."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadReviews({
              showRefresh: true,
            });
          }}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh reviews"}
        </button>
      </header>

      <section className="review-management-summary">
        {summaryItems.map(
          (item) => {
            const active =
              item.key ===
                "replied" ||
              item.key ===
                "unreplied"
                ? filters.replied ===
                  item.key
                : filters.visibility ===
                  item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={
                  active
                    ? "active"
                    : ""
                }
                onClick={() => {
                  if (
                    item.key ===
                      "replied" ||
                    item.key ===
                      "unreplied"
                  ) {
                    setFilters(
                      (previous) => ({
                        ...previous,
                        visibility:
                          "all",
                        replied:
                          item.key,
                        page: 1,
                      })
                    );
                  } else {
                    setFilters(
                      (previous) => ({
                        ...previous,
                        visibility:
                          item.key,
                        replied:
                          "all",
                        page: 1,
                      })
                    );
                  }
                }}
              >
                <span>
                  {item.label}
                </span>

                <strong>
                  {item.value}
                </strong>
              </button>
            );
          }
        )}
      </section>

      <section className="review-management-panel">
        <form
          className="review-management-filters"
          onSubmit={handleSearch}
        >
          <label className="review-search-field">
            <span>
              Search review text
            </span>

            <div>
              <input
                value={searchInput}
                onChange={(
                  event
                ) => {
                  setSearchInput(
                    event.target
                      .value
                  );
                }}
                placeholder="Search title, comment or reply..."
              />

              <button type="submit">
                Search
              </button>
            </div>
          </label>

          <label>
            <span>Property</span>

            <select
              value={
                filters.propertyId
              }
              onChange={(
                event
              ) => {
                updateFilter(
                  "propertyId",
                  event.target.value
                );
              }}
            >
              <option value="">
                All properties
              </option>

              {properties.map(
                (property) => (
                  <option
                    key={getEntityId(
                      property
                    )}
                    value={getEntityId(
                      property
                    )}
                  >
                    {property.title}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>Rating</span>

            <select
              value={
                filters.rating
              }
              onChange={(
                event
              ) => {
                updateFilter(
                  "rating",
                  event.target.value
                );
              }}
            >
              <option value="all">
                All ratings
              </option>

              {[5, 4, 3, 2, 1].map(
                (rating) => (
                  <option
                    key={rating}
                    value={rating}
                  >
                    {rating} star
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>
              Visibility
            </span>

            <select
              value={
                filters.visibility
              }
              onChange={(
                event
              ) => {
                updateFilter(
                  "visibility",
                  event.target.value
                );
              }}
            >
              <option value="all">
                All visibility
              </option>

              <option value="visible">
                Public
              </option>

              <option value="hidden">
                Hidden
              </option>
            </select>
          </label>

          <label>
            <span>
              Reply status
            </span>

            <select
              value={
                filters.replied
              }
              onChange={(
                event
              ) => {
                updateFilter(
                  "replied",
                  event.target.value
                );
              }}
            >
              <option value="all">
                All replies
              </option>

              <option value="replied">
                Replied
              </option>

              <option value="unreplied">
                Awaiting reply
              </option>
            </select>
          </label>

          <label>
            <span>Sort</span>

            <select
              value={filters.sort}
              onChange={(
                event
              ) => {
                updateFilter(
                  "sort",
                  event.target.value
                );
              }}
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="highest">
                Highest rated
              </option>

              <option value="lowest">
                Lowest rated
              </option>
            </select>
          </label>

          <button
            className="review-clear-filters"
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </form>

        {loading ? (
          <div className="review-management-state">
            <div className="review-management-spinner" />

            <p>
              Loading reviews...
            </p>
          </div>
        ) : error ? (
          <div className="review-management-state error">
            <span>!</span>

            <h2>
              Unable to load
              reviews
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                loadReviews();
              }}
            >
              Try again
            </button>
          </div>
        ) : reviews.length ===
          0 ? (
          <div className="review-management-state">
            <span>☆</span>

            <h2>
              No reviews found
            </h2>

            <p>
              No reviews match the
              selected filters.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="managed-review-list">
            {reviews.map(
              (review) => {
                const reviewId =
                  getEntityId(
                    review
                  );

                const propertyImage =
                  getPropertyImage(
                    review.property
                  );

                const customerName =
                  review.customer
                    ?.fullName ||
                  "Verified guest";

                return (
                  <article
                    className={
                      "managed-review-card " +
                      (review.isVisible
                        ? "visible"
                        : "hidden")
                    }
                    key={reviewId}
                  >
                    <div className="managed-review-property">
                      {propertyImage ? (
                        <img
                          src={
                            propertyImage
                          }
                          alt={
                            review
                              .property
                              ?.title ||
                            "Property"
                          }
                        />
                      ) : (
                        <div>
                          HHS
                        </div>
                      )}

                      <div>
                        <span>
                          Property
                        </span>

                        <strong>
                          {review
                            .property
                            ?.title ||
                            "Property unavailable"}
                        </strong>

                        <small>
                          {review
                            .property
                            ?.location
                            ?.city ||
                            "Hogenakkal"}
                        </small>
                      </div>

                      <span
                        className={
                          "managed-review-visibility " +
                          (review.isVisible
                            ? "public"
                            : "hidden")
                        }
                      >
                        {review.isVisible
                          ? "Public"
                          : "Hidden"}
                      </span>
                    </div>

                    <div className="managed-review-content">
                      <div className="managed-review-author-row">
                        <div className="managed-review-author">
                          <div>
                            {customerName
                              .trim()
                              .charAt(
                                0
                              )
                              .toUpperCase() ||
                              "G"}
                          </div>

                          <span>
                            <strong>
                              {
                                customerName
                              }
                            </strong>

                            <small>
                              ✓ Verified
                              stay
                            </small>
                          </span>
                        </div>

                        <div className="managed-review-rating">
                          <strong>
                            {renderStars(
                              review.rating
                            )}
                          </strong>

                          <span>
                            {formatDate(
                              review.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      {review.title && (
                        <h2>
                          {
                            review.title
                          }
                        </h2>
                      )}

                      <p className="managed-review-comment">
                        {
                          review.comment
                        }
                      </p>

                      <div className="managed-review-booking">
                        <span>
                          Booking:{" "}
                          <strong>
                            {review
                              .booking
                              ?.bookingReference ||
                              "Unavailable"}
                          </strong>
                        </span>

                        <span>
                          Stay:{" "}
                          <strong>
                            {formatDate(
                              review
                                .booking
                                ?.checkInDate
                            )}{" "}
                            –{" "}
                            {formatDate(
                              review
                                .booking
                                ?.checkOutDate
                            )}
                          </strong>
                        </span>
                      </div>

                      {!review.isVisible &&
                        review.moderationNote && (
                          <div className="managed-review-moderation-note">
                            <strong>
                              Moderation
                              note
                            </strong>

                            <p>
                              {
                                review.moderationNote
                              }
                            </p>
                          </div>
                        )}

                      <form
                        className="managed-review-reply-form"
                        onSubmit={(
                          event
                        ) => {
                          handleReply(
                            event,
                            review
                          );
                        }}
                      >
                        <label
                          htmlFor={
                            "reply-" +
                            reviewId
                          }
                        >
                          {review
                            .ownerReply
                            ?.message
                            ? "Update reply"
                            : "Reply to guest"}
                        </label>

                        <textarea
                          id={
                            "reply-" +
                            reviewId
                          }
                          value={
                            replyDrafts[
                              reviewId
                            ] || ""
                          }
                          onChange={(
                            event
                          ) => {
                            setReplyDrafts(
                              (
                                previous
                              ) => ({
                                ...previous,

                                [reviewId]:
                                  event
                                    .target
                                    .value,
                              })
                            );
                          }}
                          rows="3"
                          maxLength="1000"
                          placeholder="Thank the guest or respond professionally to their feedback..."
                        />

                        <div className="managed-review-actions">
                          <button
                            type="submit"
                            disabled={
                              actionId ===
                              "reply-" +
                                reviewId
                            }
                          >
                            {actionId ===
                            "reply-" +
                              reviewId
                              ? "Saving reply..."
                              : review
                                    .ownerReply
                                    ?.message
                                ? "Update reply"
                                : "Send reply"}
                          </button>

                          {isStaff && (
                            <>
                              <button
                                type="button"
                                className={
                                  review.isVisible
                                    ? "hide"
                                    : "restore"
                                }
                                onClick={() => {
                                  handleVisibility(
                                    review
                                  );
                                }}
                                disabled={
                                  actionId ===
                                  "visibility-" +
                                    reviewId
                                }
                              >
                                {actionId ===
                                "visibility-" +
                                  reviewId
                                  ? "Updating..."
                                  : review.isVisible
                                    ? "Hide review"
                                    : "Restore review"}
                              </button>

                              <button
                                type="button"
                                className="delete"
                                onClick={() => {
                                  handleDelete(
                                    review
                                  );
                                }}
                                disabled={
                                  actionId ===
                                  "delete-" +
                                    reviewId
                                }
                              >
                                {actionId ===
                                "delete-" +
                                  reviewId
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </form>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {!loading &&
          !error &&
          pagination.totalPages >
            1 && (
            <div className="review-management-pagination">
              <button
                type="button"
                onClick={() => {
                  setFilters(
                    (previous) => ({
                      ...previous,

                      page: Math.max(
                        previous.page -
                          1,
                        1
                      ),
                    })
                  );
                }}
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
                onClick={() => {
                  setFilters(
                    (previous) => ({
                      ...previous,

                      page: Math.min(
                        previous.page +
                          1,
                        pagination.totalPages
                      ),
                    })
                  );
                }}
                disabled={
                  pagination.currentPage >=
                  pagination.totalPages
                }
              >
                Next
              </button>
            </div>
          )}
      </section>
    </main>
  );
}

export default ReviewManagement;