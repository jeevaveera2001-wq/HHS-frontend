import {
  FaArrowRight,
  FaBookmark,
  FaCalendarAlt,
  FaChevronRight,
  FaCompass,
  FaEnvelope,
  FaHeart,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegCalendarCheck,
  FaRegUser,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import "./Dashboard.css";

const quickActions = [
  {
    icon: FaCompass,
    title: "Explore Stays",
    description:
      "Discover trusted stays near Hogenakkal.",
    path: "/explore",
    color: "cyan",
  },
  {
    icon: FaRegCalendarCheck,
    title: "My Bookings",
    description:
      "View and manage your reservations.",
    path: "/bookings",
    color: "blue",
  },
  {
    icon: FaHeart,
    title: "Saved Properties",
    description:
      "Return to your favourite properties.",
    path: "/saved-properties",
    color: "rose",
  },
  {
    icon: FaUserShield,
    title: "Become an Owner",
    description:
      "Register your property with HHS.",
    path: "/request-owner-access",
    color: "green",
  },
];

function Dashboard() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const userName =
    user?.fullName?.trim() ||
    "HHS Traveller";

  const firstName =
    userName.split(" ")[0];

  const avatarLetter =
    userName
      .charAt(0)
      .toUpperCase() || "U";

  const userRole = String(
    user?.role || "customer"
  ).replaceAll("_", " ");

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <main className="customer-dashboard-page">
      <div
        className="dashboard-background-shape dashboard-shape-one"
        aria-hidden="true"
      />

      <div
        className="dashboard-background-shape dashboard-shape-two"
        aria-hidden="true"
      />

      <div className="customer-dashboard-container">
        {/* Welcome banner */}

        <section className="customer-welcome-card">
          <div className="customer-welcome-content">
            <span className="customer-welcome-eyebrow">
              YOUR HHS DASHBOARD
            </span>

            <h1>
              Welcome back,
              <span> {firstName}</span>
              <span
                className="customer-wave"
                aria-hidden="true"
              >
                👋
              </span>
            </h1>

            <p>
              Manage your stays, revisit your
              favourites and discover memorable
              experiences near Hogenakkal Falls.
            </p>

            <div className="customer-welcome-actions">
              <Link
                to="/explore"
                className="customer-primary-action"
              >
                <FaCompass aria-hidden="true" />

                <span>Explore Stays</span>

                <FaArrowRight
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/bookings"
                className="customer-secondary-action"
              >
                View My Bookings
              </Link>
            </div>
          </div>

          <div
            className="customer-welcome-visual"
            aria-hidden="true"
          >
            <div className="customer-visual-orbit">
              <FaHome />
            </div>

            <div className="customer-floating-badge customer-badge-top">
              <FaMapMarkerAlt />
              Hogenakkal
            </div>

            <div className="customer-floating-badge customer-badge-bottom">
              <FaHeart />
              Trusted stays
            </div>
          </div>
        </section>

        {/* Dashboard overview */}

        <section className="customer-dashboard-overview">
          {/* Profile card */}

          <article className="customer-profile-card">
            <div className="customer-profile-cover">
              <span>HHS MEMBER</span>
            </div>

            <div className="customer-profile-content">
              <div className="customer-avatar">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={userName}
                  />
                ) : (
                  <span>
                    {avatarLetter}
                  </span>
                )}
              </div>

              <h2>{userName}</h2>

              <span className="customer-role">
                {userRole}
              </span>

              <div className="customer-profile-details">
                <div>
                  <FaEnvelope
                    aria-hidden="true"
                  />

                  <span>
                    {user?.email ||
                      "Email not available"}
                  </span>
                </div>

                <div>
                  <FaPhoneAlt
                    aria-hidden="true"
                  />

                  <span>
                    {user?.phone ||
                      "Phone not available"}
                  </span>
                </div>
              </div>

              <Link
                to="/profile"
                className="customer-edit-profile"
              >
                <FaRegUser
                  aria-hidden="true"
                />

                <span>Manage Profile</span>

                <FaChevronRight
                  aria-hidden="true"
                />
              </Link>
            </div>
          </article>

          {/* Main information */}

          <div className="customer-dashboard-main">
            {/* Summary statistics */}

            <section className="customer-stat-grid">
              <Link
                to="/bookings"
                className="customer-stat-card"
              >
                <div className="customer-stat-icon booking">
                  <FaCalendarAlt
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>Total Bookings</span>
                  <strong>0</strong>
                  <small>
                    View reservations
                  </small>
                </div>

                <FaChevronRight
                  className="customer-stat-arrow"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/saved-properties"
                className="customer-stat-card"
              >
                <div className="customer-stat-icon saved">
                  <FaBookmark
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>Saved Stays</span>
                  <strong>0</strong>
                  <small>
                    View favourites
                  </small>
                </div>

                <FaChevronRight
                  className="customer-stat-arrow"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/support-tickets"
                className="customer-stat-card"
              >
                <div className="customer-stat-icon support">
                  <FaEnvelope
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>Support</span>
                  <strong>24/7</strong>
                  <small>
                    We're here to help
                  </small>
                </div>

                <FaChevronRight
                  className="customer-stat-arrow"
                  aria-hidden="true"
                />
              </Link>
            </section>

            {/* Booking and saved sections */}

            <section className="customer-content-grid">
              <article className="customer-info-card">
                <header className="customer-card-heading">
                  <div>
                    <span>
                      YOUR RESERVATIONS
                    </span>

                    <h2>Upcoming Stay</h2>
                  </div>

                  <Link to="/bookings">
                    View all
                  </Link>
                </header>

                <div className="customer-empty-state">
                  <div className="customer-empty-icon">
                    <FaRegCalendarCheck
                      aria-hidden="true"
                    />
                  </div>

                  <h3>
                    No upcoming bookings
                  </h3>

                  <p>
                    Your next Hogenakkal
                    experience is waiting.
                    Explore our handpicked
                    properties and book your
                    perfect stay.
                  </p>

                  <Link to="/explore">
                    Explore Properties

                    <FaArrowRight
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>

              <article className="customer-info-card">
                <header className="customer-card-heading">
                  <div>
                    <span>
                      YOUR FAVOURITES
                    </span>

                    <h2>Saved Properties</h2>
                  </div>

                  <Link to="/saved-properties">
                    View all
                  </Link>
                </header>

                <div className="customer-empty-state compact">
                  <div className="customer-empty-icon saved">
                    <FaHeart
                      aria-hidden="true"
                    />
                  </div>

                  <h3>
                    No saved properties
                  </h3>

                  <p>
                    Tap the heart icon on any
                    property to keep it here for
                    later.
                  </p>

                  <Link to="/explore">
                    Find Your Favourite

                    <FaArrowRight
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            </section>
          </div>
        </section>

        {/* Quick actions */}

        <section className="customer-quick-section">
          <div className="customer-section-heading">
            <div>
              <span>QUICK ACCESS</span>

              <h2>
                What would you like to do?
              </h2>
            </div>

            <p>
              Everything you need for your HHS
              experience in one place.
            </p>
          </div>

          <div className="customer-quick-grid">
            {quickActions.map(
              ({
                icon: ActionIcon,
                title,
                description,
                path,
                color,
              }) => (
                <Link
                  to={path}
                  className="customer-quick-card"
                  key={path}
                >
                  <div
                    className={`customer-quick-icon ${color}`}
                  >
                    <ActionIcon
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>

                  <FaArrowRight
                    className="customer-quick-arrow"
                    aria-hidden="true"
                  />
                </Link>
              )
            )}
          </div>
        </section>

        {/* Owner invitation */}

        {user?.role === "customer" && (
          <section className="customer-owner-banner">
            <div className="customer-owner-icon">
              <FaHome aria-hidden="true" />
            </div>

            <div>
              <span>PARTNER WITH HHS</span>

              <h2>
                Own a property near Hogenakkal?
              </h2>

              <p>
                Join our trusted network of
                property owners and connect with
                travellers searching for local
                stays.
              </p>
            </div>

            <Link to="/request-owner-access">
              Request Owner Access

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>
          </section>
        )}

        {/* Bottom actions */}

        <section className="customer-dashboard-footer">
          <p>
            Need help with your account or
            booking?
            <Link to="/contact">
              Contact the HHS team
            </Link>
          </p>

          <button
            type="button"
            className="customer-logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt
              aria-hidden="true"
            />

            <span>Sign Out</span>
          </button>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;