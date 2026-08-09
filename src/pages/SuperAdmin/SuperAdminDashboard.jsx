import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  getDashboardStatistics,
} from "../../services/adminService";

import {
  getManagedReviews,
} from "../../services/reviewService";

import "./SuperAdminDashboard.css";

const panelItems = [
  {
    icon: "👥",
    title: "Users",
    description:
      "View and manage customer accounts.",
    path: "/super-admin/users",
  },
  {
    icon: "🏡",
    title: "Property Owners",
    description:
      "Review owners and verification.",
    path: "/super-admin/owners",
  },
  {
    icon: "🏨",
    title: "Properties",
    description:
      "Approve and manage properties.",
    path:
      "/super-admin/properties",
  },
  {
    icon: "📅",
    title: "Bookings",
    description:
      "Monitor bookings and check-ins.",
    path:
      "/super-admin/bookings",
  },
  {
    icon: "⭐",
    title: "Reviews",
    description:
      "Reply, moderate and manage guest reviews.",
    path:
      "/super-admin/reviews",
  },
  {
    icon: "🎧",
    title: "Support",
    description:
      "Review customer support tickets.",
    path: "/support",
  },
  {
  icon: "📨",
  title: "Enquiries",
  description:
    "View and manage website contact enquiries.",
  path:
    "/super-admin/enquiries",
},
  {
    icon: "💳",
    title: "Finance",
    description:
      "Manage payments and settlements.",
    path: "/finance",
  },
  {
    icon: "🏦",
    title: "Payout Accounts",
    description:
      "Verify owner bank and UPI payout accounts.",
    path:
      "/finance/payout-accounts",
  },
  {
    icon: "🧑‍💼",
    title: "Staff",
    description:
      "Create and manage staff accounts.",
    path:
      "/super-admin/staff",
  },
];

const initialStatistics = {
  users: {
    total: 0,
    active: 0,
    inactive: 0,
    customers: 0,
    owners: 0,
    staff: 0,
  },

  properties: {
    total: 0,
    active: 0,
    suspended: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    featured: 0,
  },

  bookings: {
    total: 0,
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    completed: 0,
    cancelled: 0,
    refundPending: 0,
    paid: 0,
  },

  finance: {
    totalRevenue: 0,
    totalBookingValue: 0,
  },

  reviews: {
    total: 0,
    visible: 0,
    hidden: 0,
    replied: 0,
    unreplied: 0,
  },
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

function SuperAdminDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    statistics,
    setStatistics,
  ] = useState(
    initialStatistics
  );

  const [
    recentUsers,
    setRecentUsers,
  ] = useState([]);

  const [
    recentProperties,
    setRecentProperties,
  ] = useState([]);

  const [
    recentBookings,
    setRecentBookings,
  ] = useState([]);

  const [
    recentReviews,
    setRecentReviews,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleLogout =
    useCallback(() => {
      logout();

      navigate("/login", {
        replace: true,
      });
    }, [
      logout,
      navigate,
    ]);

  const loadStatistics =
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

          setError("");

          const [
            dashboardResult,
            reviewResult,
          ] =
            await Promise.allSettled([
              getDashboardStatistics(),

              getManagedReviews({
                page: 1,
                limit: 5,
                sort: "newest",
              }),
            ]);

          const unauthorizedResult =
            [
              dashboardResult,
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

          if (
            unauthorizedResult
          ) {
            toast.error(
              "Your session has expired."
            );

            handleLogout();
            return;
          }

          const forbiddenResult =
            [
              dashboardResult,
              reviewResult,
            ].find((result) => {
              return (
                result.status ===
                  "rejected" &&
                getErrorStatus(
                  result.reason
                ) === 403
              );
            });

          if (forbiddenResult) {
            toast.error(
              "You cannot access this dashboard."
            );

            navigate("/", {
              replace: true,
            });

            return;
          }

          let nextStatistics = {
            ...initialStatistics,

            users: {
              ...initialStatistics.users,
            },

            properties: {
              ...initialStatistics.properties,
            },

            bookings: {
              ...initialStatistics.bookings,
            },

            finance: {
              ...initialStatistics.finance,
            },

            reviews: {
              ...initialStatistics.reviews,
            },
          };

          if (
            dashboardResult.status ===
            "fulfilled"
          ) {
            const responseData =
              dashboardResult.value;

            const data =
              responseData?.data ||
              responseData ||
              {};

            nextStatistics = {
              ...nextStatistics,
              ...data.statistics,

              users: {
                ...initialStatistics.users,
                ...data.statistics
                  ?.users,
              },

              properties: {
                ...initialStatistics.properties,
                ...data.statistics
                  ?.properties,
              },

              bookings: {
                ...initialStatistics.bookings,
                ...data.statistics
                  ?.bookings,
              },

              finance: {
                ...initialStatistics.finance,
                ...data.statistics
                  ?.finance,
              },

              reviews: {
                ...initialStatistics.reviews,
              },
            };

            setRecentUsers(
              Array.isArray(
                data.recentActivity
                  ?.users
              )
                ? data.recentActivity
                    .users
                : []
            );

            setRecentProperties(
              Array.isArray(
                data.recentActivity
                  ?.properties
              )
                ? data.recentActivity
                    .properties
                : []
            );

            setRecentBookings(
              Array.isArray(
                data.recentActivity
                  ?.bookings
              )
                ? data.recentActivity
                    .bookings
                : []
            );
          } else {
            setRecentUsers([]);
            setRecentProperties([]);
            setRecentBookings([]);

            setError(
              getErrorMessage(
                dashboardResult.reason,
                "Unable to load dashboard statistics."
              )
            );
          }

          if (
            reviewResult.status ===
            "fulfilled"
          ) {
            const responseData =
              reviewResult.value;

            const reviewData =
              responseData?.data ||
              responseData ||
              {};

            nextStatistics.reviews = {
              ...initialStatistics.reviews,
              ...reviewData.statistics,
            };

            setRecentReviews(
              Array.isArray(
                reviewData.reviews
              )
                ? reviewData.reviews
                : []
            );
          } else {
            nextStatistics.reviews = {
              ...initialStatistics.reviews,
            };

            setRecentReviews([]);

            toast.error(
              getErrorMessage(
                reviewResult.reason,
                "Unable to load review statistics."
              )
            );
          }

          setStatistics(
            nextStatistics
          );
        } catch (
          requestError
        ) {
          if (
            getErrorStatus(
              requestError
            ) === 401
          ) {
            toast.error(
              "Your session has expired."
            );

            handleLogout();
            return;
          }

          if (
            getErrorStatus(
              requestError
            ) === 403
          ) {
            toast.error(
              "You cannot access this dashboard."
            );

            navigate("/", {
              replace: true,
            });

            return;
          }

          const message =
            getErrorMessage(
              requestError,
              "Unable to load the dashboard."
            );

          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        handleLogout,
        navigate,
      ]
    );

  useEffect(() => {
    loadStatistics(true);
  }, [loadStatistics]);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

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

  const formatNumber = (value) => {
    if (loading) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN"
    ).format(
      Number(value) || 0
    );
  };

  const formatCurrency = (value) => {
    if (loading) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value) || 0
    );
  };

  const renderStars = (rating) => {
    const normalizedRating =
      Math.min(
        Math.max(
          Math.round(
            Number(rating) ||
              0
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

  return (
    <main className="super-admin-page">
      <aside className="admin-sidebar">
        <Link
          className="admin-brand"
          to="/super-admin"
        >
          <span>HHS</span>

          <div>
            <strong>
              Control Centre
            </strong>

            <small>
              VeeraWebTech
            </small>
          </div>
        </Link>

        <nav className="admin-navigation">
          <Link
            className="admin-nav-link active"
            to="/super-admin"
          >
            <span>◫</span>
            Dashboard
          </Link>

          {panelItems.map(
            (item) => (
              <Link
                className="admin-nav-link"
                to={item.path}
                key={item.path}
              >
                <span>
                  {item.icon}
                </span>

                {item.title}

                {item.path ===
                  "/super-admin/reviews" &&
                  statistics.reviews
                    .unreplied >
                    0 && (
                    <small className="admin-nav-count">
                      {
                        statistics
                          .reviews
                          .unreplied
                      }
                    </small>
                  )}
              </Link>
            )
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-mini">
            <div className="admin-mini-avatar">
              {user?.fullName
                ?.trim()
                .charAt(0)
                .toUpperCase() ||
                "A"}
            </div>

            <div>
              <strong>
                {user?.fullName ||
                  "Administrator"}
              </strong>

              <small>
                Super Admin
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
          >
            Sign out
          </button>
        </div>
      </aside>

      <section className="admin-main-content">
        <header className="admin-topbar">
          <div>
            <span>
              VeeraWebTech Operations
            </span>

            <h1>
              Super Admin Dashboard
            </h1>

            <p>
              Welcome back,{" "}
              {user?.fullName ||
                "Administrator"}
              . Here is the live HHS
              business overview.
            </p>
          </div>

          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-refresh-button"
              onClick={() =>
                loadStatistics(
                  false
                )
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

            <Link
              className="admin-add-property"
              to="/add-property"
            >
              + Add property
            </Link>
          </div>
        </header>

        {error && (
          <div className="admin-dashboard-error">
            <div>
              <strong>
                Unable to load dashboard
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadStatistics(
                  false
                )
              }
              disabled={
                refreshing
              }
            >
              Try again
            </button>
          </div>
        )}

        <section className="admin-stat-grid">
          <article className="admin-stat-card">
            <div className="stat-icon blue">
              👥
            </div>

            <div>
              <span>
                Total users
              </span>

              <strong>
                {formatNumber(
                  statistics.users
                    .total
                )}
              </strong>

              <small>
                {
                  statistics.users
                    .active
                }{" "}
                active
              </small>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon cyan">
              🏨
            </div>

            <div>
              <span>
                Properties
              </span>

              <strong>
                {formatNumber(
                  statistics
                    .properties
                    .total
                )}
              </strong>

              <small>
                {
                  statistics
                    .properties
                    .approved
                }{" "}
                approved
              </small>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon orange">
              📅
            </div>

            <div>
              <span>
                Total bookings
              </span>

              <strong>
                {formatNumber(
                  statistics.bookings
                    .total
                )}
              </strong>

              <small>
                {
                  statistics.bookings
                    .confirmed
                }{" "}
                confirmed
              </small>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon green">
              💰
            </div>

            <div>
              <span>
                Booking value
              </span>

              <strong>
                {formatCurrency(
                  statistics.finance
                    .totalBookingValue
                )}
              </strong>

              <small>
                Active booking value
              </small>
            </div>
          </article>

          <article className="admin-stat-card admin-review-stat-card">
            <div className="stat-icon purple">
              ⭐
            </div>

            <div>
              <span>
                Guest reviews
              </span>

              <strong>
                {formatNumber(
                  statistics.reviews
                    .total
                )}
              </strong>

              <small>
                {
                  statistics.reviews
                    .unreplied
                }{" "}
                awaiting reply
              </small>
            </div>

            <Link
              to="/super-admin/reviews"
              aria-label="Open review management"
            >
              →
            </Link>
          </article>
        </section>

        <section className="admin-secondary-stats">
          <article>
            <span>
              Pending properties
            </span>

            <strong>
              {formatNumber(
                statistics.properties
                  .pending
              )}
            </strong>
          </article>

          <article>
            <span>
              Pending bookings
            </span>

            <strong>
              {formatNumber(
                statistics.bookings
                  .pending
              )}
            </strong>
          </article>

          <article>
            <span>
              Staff members
            </span>

            <strong>
              {formatNumber(
                statistics.users.staff
              )}
            </strong>
          </article>

          <article>
            <span>
              Collected revenue
            </span>

            <strong>
              {formatCurrency(
                statistics.finance
                  .totalRevenue
              )}
            </strong>
          </article>

          <article>
            <span>
              Hidden reviews
            </span>

            <strong>
              {formatNumber(
                statistics.reviews
                  .hidden
              )}
            </strong>
          </article>

          <article>
            <span>
              Reviews awaiting reply
            </span>

            <strong>
              {formatNumber(
                statistics.reviews
                  .unreplied
              )}
            </strong>
          </article>
        </section>

        <section className="admin-booking-overview">
          <div>
            <span>
              Confirmed
            </span>

            <strong>
              {formatNumber(
                statistics.bookings
                  .confirmed
              )}
            </strong>
          </div>

          <div>
            <span>
              Checked In
            </span>

            <strong>
              {formatNumber(
                statistics.bookings
                  .checkedIn
              )}
            </strong>
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {formatNumber(
                statistics.bookings
                  .completed
              )}
            </strong>
          </div>

          <div>
            <span>
              Cancelled
            </span>

            <strong>
              {formatNumber(
                statistics.bookings
                  .cancelled
              )}
            </strong>
          </div>

          <div>
            <span>
              Refund Pending
            </span>

            <strong>
              {formatNumber(
                statistics.bookings
                  .refundPending
              )}
            </strong>
          </div>
        </section>

        <section className="admin-panel-section">
          <div className="admin-section-heading">
            <div>
              <h2>
                Management panels
              </h2>

              <p>
                Access all HHS operational
                departments.
              </p>
            </div>
          </div>

          <div className="admin-panel-grid">
            {panelItems.map(
              (item) => (
                <Link
                  className="admin-panel-card"
                  to={item.path}
                  key={item.path}
                >
                  <span className="panel-card-icon">
                    {item.icon}
                  </span>

                  <div>
                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {
                        item.description
                      }
                    </p>
                  </div>

                  <span className="panel-arrow">
                    →
                  </span>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="admin-recent-grid">
          <article className="admin-recent-card">
            <div className="admin-recent-heading">
              <div>
                <h2>
                  Recent users
                </h2>

                <p>
                  Latest registrations
                </p>
              </div>

              <Link to="/super-admin/users">
                View all
              </Link>
            </div>

            {recentUsers.length ===
            0 ? (
              <div className="admin-recent-empty">
                No users found.
              </div>
            ) : (
              <div className="admin-recent-list">
                {recentUsers.map(
                  (recentUser) => (
                    <div
                      className="admin-recent-item"
                      key={
                        recentUser._id ||
                        recentUser.id
                      }
                    >
                      <div className="recent-avatar">
                        {recentUser.fullName
                          ?.trim()
                          .charAt(0)
                          .toUpperCase() ||
                          "U"}
                      </div>

                      <div>
                        <strong>
                          {recentUser.fullName ||
                            "User"}
                        </strong>

                        <span>
                          {recentUser.email ||
                            "—"}
                        </span>
                      </div>

                      <div className="recent-meta">
                        <span>
                          {String(
                            recentUser.role ||
                              "user"
                          ).replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                        <small>
                          {formatDate(
                            recentUser.createdAt
                          )}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </article>

          <article className="admin-recent-card">
            <div className="admin-recent-heading">
              <div>
                <h2>
                  Recent properties
                </h2>

                <p>
                  Latest property submissions
                </p>
              </div>

              <Link to="/super-admin/properties">
                View all
              </Link>
            </div>

            {recentProperties.length ===
            0 ? (
              <div className="admin-recent-empty">
                No properties found.
              </div>
            ) : (
              <div className="admin-recent-list">
                {recentProperties.map(
                  (property) => (
                    <div
                      className="admin-recent-item"
                      key={
                        property._id ||
                        property.id
                      }
                    >
                      <div className="recent-avatar property">
                        🏨
                      </div>

                      <div>
                        <strong>
                          {property.title ||
                            "Untitled property"}
                        </strong>

                        <span>
                          {property.owner
                            ?.fullName ||
                            "Unknown owner"}
                        </span>
                      </div>

                      <div className="recent-meta">
                        <span
                          className={`recent-property-status ${
                            property.approvalStatus ||
                            "pending"
                          }`}
                        >
                          {property.approvalStatus ||
                            "pending"}
                        </span>

                        <small>
                          {formatDate(
                            property.createdAt
                          )}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </article>

          <article className="admin-recent-card">
            <div className="admin-recent-heading">
              <div>
                <h2>
                  Recent bookings
                </h2>

                <p>
                  Latest customer reservations
                </p>
              </div>

              <Link to="/super-admin/bookings">
                View all
              </Link>
            </div>

            {recentBookings.length ===
            0 ? (
              <div className="admin-recent-empty">
                No bookings found.
              </div>
            ) : (
              <div className="admin-recent-list">
                {recentBookings.map(
                  (booking) => (
                    <div
                      className="admin-recent-item"
                      key={
                        booking._id ||
                        booking.id ||
                        booking.bookingReference
                      }
                    >
                      <div className="recent-avatar booking">
                        📅
                      </div>

                      <div>
                        <strong>
                          {booking.bookingReference ||
                            "Booking"}
                        </strong>

                        <span>
                          {booking.customer
                            ?.fullName ||
                            "Unknown customer"}
                          {" · "}
                          {booking.property
                            ?.title ||
                            "HHS Property"}
                        </span>
                      </div>

                      <div className="recent-meta">
                        <span
                          className={`recent-booking-status ${
                            booking.bookingStatus ||
                            "pending"
                          }`}
                        >
                          {booking.bookingStatus ||
                            "pending"}
                        </span>

                        <small>
                          {formatCurrency(
                            booking
                              .priceDetails
                              ?.grandTotal ??
                              booking.grandTotal ??
                              booking.totalAmount
                          )}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </article>

          <article className="admin-recent-card">
            <div className="admin-recent-heading">
              <div>
                <h2>
                  Recent reviews
                </h2>

                <p>
                  Latest verified guest
                  feedback
                </p>
              </div>

              <Link to="/super-admin/reviews">
                Manage
              </Link>
            </div>

            {recentReviews.length ===
            0 ? (
              <div className="admin-recent-empty">
                No reviews found.
              </div>
            ) : (
              <div className="admin-recent-list">
                {recentReviews.map(
                  (review) => (
                    <div
                      className="admin-recent-item"
                      key={
                        review._id ||
                        review.id
                      }
                    >
                      <div className="recent-avatar review">
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
                          {" · "}
                          {review.title ||
                            review.comment ||
                            "Guest review"}
                        </span>
                      </div>

                      <div className="recent-meta review">
                        <strong>
                          {renderStars(
                            review.rating
                          )}
                        </strong>

                        <span
                          className={
                            review.isVisible
                              ? "visible"
                              : "hidden"
                          }
                        >
                          {review.isVisible
                            ? "Public"
                            : "Hidden"}
                        </span>

                        <small>
                          {formatDate(
                            review.createdAt
                          )}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

export default SuperAdminDashboard;