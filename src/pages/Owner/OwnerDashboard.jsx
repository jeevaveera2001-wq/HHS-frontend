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

import BrandLogo from "../../components/BrandLogo/BrandLogo";
import useAuth from "../../hooks/useAuth";

import {
  getMyProperties,
} from "../../services/propertyService";

import {
  getOwnerBookings,
} from "../../services/bookingService";

import {
  getManagedReviews,
} from "../../services/reviewService";

import "./OwnerDashboard.css";

const initialReviewStatistics = {
  total: 0,
  visible: 0,
  hidden: 0,
  replied: 0,
  unreplied: 0,
};

const getErrorStatus = (error) => {
  return (
    error?.status ||
    error?.response?.status ||
    0
  );
};

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const renderStars = (rating) => {
  const normalizedRating = Math.min(
    Math.max(
      Math.round(
        Number(rating) || 0
      ),
      0
    ),
    5
  );

  return (
    "★".repeat(normalizedRating) +
    "☆".repeat(
      5 - normalizedRating
    )
  );
};

function OwnerDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    properties,
    setProperties,
  ] = useState([]);

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    reviewStatistics,
    setReviewStatistics,
  ] = useState(
    initialReviewStatistics
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
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
    }, [
      logout,
      navigate,
    ]);

  const loadOwnerData =
    useCallback(
      async (
        showInitialLoader = true
      ) => {
        try {
          if (showInitialLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setLoadError("");

          const [
            propertyResult,
            bookingResult,
            reviewResult,
          ] =
            await Promise.allSettled([
              getMyProperties(),

              getOwnerBookings(),

              getManagedReviews({
                page: 1,
                limit: 5,
                sort: "newest",
              }),
            ]);

          const unauthorizedResult =
            [
              propertyResult,
              bookingResult,
              reviewResult,
            ].find((result) => {
              return (
                result.status ===
                  "rejected" &&
                getErrorStatus(
                  result.reason
                ) === 401
              );
            });

          if (unauthorizedResult) {
            handleUnauthorized();
            return;
          }

          const errorMessages = [];

          if (
            propertyResult.status ===
            "fulfilled"
          ) {
            const returnedProperties =
              propertyResult.value
                ?.properties ||
              propertyResult.value?.data
                ?.properties ||
              [];

            setProperties(
              Array.isArray(
                returnedProperties
              )
                ? returnedProperties
                : []
            );
          } else {
            setProperties([]);

            errorMessages.push(
              getErrorMessage(
                propertyResult.reason,
                "Unable to load properties."
              )
            );
          }

          if (
            bookingResult.status ===
            "fulfilled"
          ) {
            const returnedBookings =
              bookingResult.value
                ?.bookings ||
              bookingResult.value?.data
                ?.bookings ||
              [];

            setBookings(
              Array.isArray(
                returnedBookings
              )
                ? returnedBookings
                : []
            );
          } else {
            setBookings([]);

            errorMessages.push(
              getErrorMessage(
                bookingResult.reason,
                "Unable to load bookings."
              )
            );
          }

          if (
            reviewResult.status ===
            "fulfilled"
          ) {
            const returnedReviews =
              reviewResult.value
                ?.reviews ||
              reviewResult.value?.data
                ?.reviews ||
              [];

            setReviews(
              Array.isArray(
                returnedReviews
              )
                ? returnedReviews
                : []
            );

            setReviewStatistics({
              ...initialReviewStatistics,

              ...(reviewResult.value
                ?.statistics ||
                reviewResult.value?.data
                  ?.statistics ||
                {}),
            });
          } else {
            setReviews([]);

            setReviewStatistics(
              initialReviewStatistics
            );

            errorMessages.push(
              getErrorMessage(
                reviewResult.reason,
                "Unable to load guest reviews."
              )
            );
          }

          if (
            errorMessages.length > 0
          ) {
            const uniqueErrors = [
              ...new Set(
                errorMessages
              ),
            ];

            const message =
              uniqueErrors.join(" ");

            setLoadError(message);
            toast.error(message);
          }
        } catch (error) {
          if (
            getErrorStatus(error) ===
            401
          ) {
            handleUnauthorized();
            return;
          }

          const message =
            getErrorMessage(
              error,
              "Unable to load the owner dashboard."
            );

          setLoadError(message);
          toast.error(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [handleUnauthorized]
    );

  useEffect(() => {
    loadOwnerData(true);
  }, [loadOwnerData]);

  const statistics = useMemo(() => {
    const result = {
      totalProperties:
        properties.length,

      approvedProperties: 0,
      pendingProperties: 0,
      rejectedProperties: 0,

      totalBookings:
        bookings.length,

      pendingBookings: 0,
      confirmedBookings: 0,
      checkedInBookings: 0,
      completedBookings: 0,

      totalBookingValue: 0,
      paidRevenue: 0,

      totalReviews:
        reviewStatistics.total || 0,

      repliedReviews:
        reviewStatistics.replied || 0,

      unrepliedReviews:
        reviewStatistics.unreplied || 0,
    };

    properties.forEach(
      (property) => {
        if (
          property.approvalStatus ===
          "approved"
        ) {
          result.approvedProperties +=
            1;
        }

        if (
          property.approvalStatus ===
          "pending"
        ) {
          result.pendingProperties +=
            1;
        }

        if (
          property.approvalStatus ===
          "rejected"
        ) {
          result.rejectedProperties +=
            1;
        }
      }
    );

    bookings.forEach((booking) => {
      const bookingStatus =
        booking.bookingStatus ||
        booking.status ||
        "pending";

      if (
        bookingStatus ===
        "pending"
      ) {
        result.pendingBookings += 1;
      }

      if (
        bookingStatus ===
        "confirmed"
      ) {
        result.confirmedBookings +=
          1;
      }

      if (
        bookingStatus ===
        "checked_in"
      ) {
        result.checkedInBookings +=
          1;
      }

      if (
        bookingStatus ===
        "completed"
      ) {
        result.completedBookings +=
          1;
      }

      const bookingTotal =
        Number(
          booking.priceDetails
            ?.grandTotal ??
            booking.grandTotal ??
            booking.totalAmount ??
            0
        ) || 0;

      if (
        ![
          "cancelled",
          "expired",
          "refunded",
        ].includes(bookingStatus)
      ) {
        result.totalBookingValue +=
          bookingTotal;
      }

      if (
        [
          "paid",
          "partially_refunded",
        ].includes(
          booking.paymentStatus
        )
      ) {
        result.paidRevenue +=
          bookingTotal;
      }
    });

    return result;
  }, [
    properties,
    bookings,
    reviewStatistics,
  ]);

  const recentProperties =
    useMemo(() => {
      return [...properties]
        .sort((first, second) => {
          return (
            new Date(
              second.createdAt || 0
            ).getTime() -
            new Date(
              first.createdAt || 0
            ).getTime()
          );
        })
        .slice(0, 4);
    }, [properties]);

  const recentBookings =
    useMemo(() => {
      return [...bookings]
        .sort((first, second) => {
          return (
            new Date(
              second.createdAt || 0
            ).getTime() -
            new Date(
              first.createdAt || 0
            ).getTime()
          );
        })
        .slice(0, 5);
    }, [bookings]);

  const recentReviews =
    useMemo(() => {
      return [...reviews]
        .sort((first, second) => {
          return (
            new Date(
              second.createdAt || 0
            ).getTime() -
            new Date(
              first.createdAt || 0
            ).getTime()
          );
        })
        .slice(0, 5);
    }, [reviews]);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <main className="owner-dashboard-page">
      <aside className="owner-sidebar">
        <Link
          className="owner-brand"
          to="/owner"
        >
          <BrandLogo
            to={null}
            variant="sidebar"
            className="owner-dashboard-brand-logo"
          />

          <div>
            <strong>
              Owner Centre
            </strong>

            <small>
              VeeraWebTech
            </small>
          </div>
        </Link>

        <nav className="owner-navigation">
          <Link
            className="owner-nav-link active"
            to="/owner"
          >
            <span>◫</span>
            Dashboard
          </Link>

          <Link
            className="owner-nav-link"
            to="/add-property"
          >
            <span>＋</span>
            Add Property
          </Link>

          <Link
            className="owner-nav-link"
            to="/owner/properties"
          >
            <span>🏨</span>
            My Properties
          </Link>

          <Link
            className="owner-nav-link"
            to="/owner/bookings"
          >
            <span>📅</span>
            Property Bookings
          </Link>

          <Link
            className="owner-nav-link"
            to="/owner/reviews"
          >
            <span>⭐</span>
            Guest Reviews

            {statistics.unrepliedReviews >
              0 && (
              <small className="owner-nav-count">
                {
                  statistics.unrepliedReviews
                }
              </small>
            )}
          </Link>

          <Link
            className="owner-nav-link"
            to="/owner/payout-settings"
          >
            <span>🏦</span>
            Payout Settings
          </Link>

          <Link
            className="owner-nav-link"
            to="/profile"
          >
            <span>👤</span>
            Profile
          </Link>
        </nav>

        <div className="owner-sidebar-footer">
          <div className="owner-user-card">
            <div>
              {user?.fullName
                ?.trim()
                .charAt(0)
                .toUpperCase() || "O"}
            </div>

            <span>
              <strong>
                {user?.fullName ||
                  "Property Owner"}
              </strong>

              <small>
                Property Owner
              </small>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <section className="owner-main-content">
        <header className="owner-dashboard-header">
          <div>
            <span>
              HHS Partner Operations
            </span>

            <h1>
              Welcome,{" "}
              {user?.fullName ||
                "Property Owner"}
            </h1>

            <p>
              Manage your properties,
              bookings, guest reviews and
              stay performance.
            </p>
          </div>

          <div className="owner-header-actions">
            <button
              type="button"
              onClick={() =>
                loadOwnerData(false)
              }
              disabled={
                loading ||
                refreshing
              }
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link to="/add-property">
              + Add property
            </Link>
          </div>
        </header>

        {loadError && !loading && (
          <div className="owner-dashboard-error">
            <div>
              <strong>
                Some dashboard information
                could not be loaded.
              </strong>

              <p>{loadError}</p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadOwnerData(false)
              }
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <section className="owner-dashboard-loading">
            <div />

            <p>
              Loading owner dashboard...
            </p>
          </section>
        ) : (
          <>
            <section className="owner-stat-grid">
              <article>
                <div className="owner-stat-icon blue">
                  🏨
                </div>

                <span>
                  <small>
                    Total properties
                  </small>

                  <strong>
                    {
                      statistics.totalProperties
                    }
                  </strong>

                  <em>
                    {
                      statistics.approvedProperties
                    }{" "}
                    approved
                  </em>
                </span>
              </article>

              <article>
                <div className="owner-stat-icon orange">
                  ⏳
                </div>

                <span>
                  <small>
                    Pending properties
                  </small>

                  <strong>
                    {
                      statistics.pendingProperties
                    }
                  </strong>

                  <em>
                    Awaiting verification
                  </em>
                </span>
              </article>

              <article>
                <div className="owner-stat-icon cyan">
                  📅
                </div>

                <span>
                  <small>
                    Total bookings
                  </small>

                  <strong>
                    {
                      statistics.totalBookings
                    }
                  </strong>

                  <em>
                    {
                      statistics.confirmedBookings
                    }{" "}
                    confirmed
                  </em>
                </span>
              </article>

              <article>
                <div className="owner-stat-icon green">
                  💰
                </div>

                <span>
                  <small>
                    Paid revenue
                  </small>

                  <strong>
                    {formatCurrency(
                      statistics.paidRevenue
                    )}
                  </strong>

                  <em>
                    Booking value{" "}
                    {formatCurrency(
                      statistics.totalBookingValue
                    )}
                  </em>
                </span>
              </article>

              <article className="owner-review-stat">
                <div className="owner-stat-icon purple">
                  ⭐
                </div>

                <span>
                  <small>
                    Guest reviews
                  </small>

                  <strong>
                    {
                      statistics.totalReviews
                    }
                  </strong>

                  <em>
                    {
                      statistics.unrepliedReviews
                    }{" "}
                    awaiting reply
                  </em>
                </span>

                <Link
                  to="/owner/reviews"
                  aria-label="Open guest reviews"
                >
                  →
                </Link>
              </article>
            </section>

            <section className="owner-dashboard-grid">
              <article className="owner-dashboard-card">
                <div className="owner-card-heading">
                  <div>
                    <h2>
                      Recent properties
                    </h2>

                    <p>
                      Your latest property
                      submissions.
                    </p>
                  </div>

                  <Link to="/owner/properties">
                    View all
                  </Link>
                </div>

                {recentProperties.length ===
                0 ? (
                  <div className="owner-empty-state">
                    <span>🏡</span>

                    <h3>
                      No properties yet
                    </h3>

                    <Link to="/add-property">
                      Add your first property
                    </Link>
                  </div>
                ) : (
                  <div className="owner-property-list">
                    {recentProperties.map(
                      (property) => (
                        <div
                          className="owner-property-item"
                          key={
                            property._id ||
                            property.id
                          }
                        >
                          <div className="owner-property-icon">
                            🏨
                          </div>

                          <div>
                            <strong>
                              {property.title ||
                                "Untitled property"}
                            </strong>

                            <span>
                              {property.propertyType ||
                                "Property"}
                              {" · "}
                              {property
                                .location
                                ?.city ||
                                "Hogenakkal"}
                            </span>
                          </div>

                          <span
                            className={`owner-property-status ${
                              property.approvalStatus ||
                              "pending"
                            }`}
                          >
                            {property.approvalStatus ||
                              "pending"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </article>

              <article className="owner-dashboard-card">
                <div className="owner-card-heading">
                  <div>
                    <h2>
                      Recent bookings
                    </h2>

                    <p>
                      Latest bookings for your
                      properties.
                    </p>
                  </div>

                  <Link to="/owner/bookings">
                    View all
                  </Link>
                </div>

                {recentBookings.length ===
                0 ? (
                  <div className="owner-empty-state">
                    <span>📅</span>

                    <h3>
                      No bookings yet
                    </h3>

                    <p>
                      Property bookings will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="owner-booking-list">
                    {recentBookings.map(
                      (booking) => (
                        <div
                          className="owner-booking-item"
                          key={
                            booking._id ||
                            booking.id ||
                            booking.bookingReference
                          }
                        >
                          <div>
                            <strong>
                              {booking.bookingReference ||
                                "Booking"}
                            </strong>

                            <span>
                              {booking.customer
                                ?.fullName ||
                                booking
                                  .primaryGuest
                                  ?.fullName ||
                                "Guest"}
                              {" · "}
                              {booking.property
                                ?.title ||
                                "HHS Property"}
                            </span>
                          </div>

                          <div>
                            <strong>
                              {formatCurrency(
                                booking
                                  .priceDetails
                                  ?.grandTotal ??
                                  booking.grandTotal ??
                                  booking.totalAmount
                              )}
                            </strong>

                            <small>
                              {formatDate(
                                booking.checkInDate
                              )}
                            </small>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </article>

              <article className="owner-dashboard-card owner-review-card">
                <div className="owner-card-heading">
                  <div>
                    <h2>
                      Recent guest reviews
                    </h2>

                    <p>
                      Verified feedback
                      received by your
                      properties.
                    </p>
                  </div>

                  <Link to="/owner/reviews">
                    Manage reviews
                  </Link>
                </div>

                {recentReviews.length ===
                0 ? (
                  <div className="owner-empty-state">
                    <span>⭐</span>

                    <h3>
                      No reviews yet
                    </h3>

                    <p>
                      Guest reviews will appear
                      after completed stays.
                    </p>
                  </div>
                ) : (
                  <div className="owner-review-list">
                    {recentReviews.map(
                      (review) => {
                        const hasReply =
                          Boolean(
                            review.ownerReply
                              ?.message?.trim()
                          );

                        return (
                          <div
                            className="owner-review-item"
                            key={
                              review._id ||
                              review.id
                            }
                          >
                            <div className="owner-review-avatar">
                              {review.customer
                                ?.fullName
                                ?.trim()
                                .charAt(0)
                                .toUpperCase() ||
                                "G"}
                            </div>

                            <div>
                              <strong>
                                {review.customer
                                  ?.fullName ||
                                  "Verified guest"}
                              </strong>

                              <span>
                                {review.property
                                  ?.title ||
                                  "HHS Property"}
                              </span>

                              <p>
                                {review.title ||
                                  review.comment ||
                                  "Guest review"}
                              </p>
                            </div>

                            <div className="owner-review-meta">
                              <strong>
                                {renderStars(
                                  review.rating
                                )}
                              </strong>

                              <small>
                                {formatDate(
                                  review.createdAt
                                )}
                              </small>

                              <span
                                className={
                                  hasReply
                                    ? "replied"
                                    : "pending"
                                }
                              >
                                {hasReply
                                  ? "Replied"
                                  : "Reply needed"}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default OwnerDashboard;