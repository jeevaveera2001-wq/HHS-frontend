import "./Newsletter.css";

import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaHome,
  FaHotel,
  FaKey,
  FaRegBuilding,
  FaUserTie,
} from "react-icons/fa";

import {
  Link,
} from "react-router-dom";

import hhsLogo from "../../assets/images/hhs-logo-optimized.webp";

/* =====================================
   Owner benefits
===================================== */

const ownerBenefits = [
  "Reach travellers searching for Hogenakkal stays",
  "Manage your properties and booking requests",
  "Receive assistance from the HHS support team",
];

/* =====================================
   Supported property types
===================================== */

const propertyTypes = [
  {
    icon: FaHome,
    title: "Homestays",
  },
  {
    icon: FaHotel,
    title: "Hotels",
  },
  {
    icon: FaBuilding,
    title: "Resorts",
  },
  {
    icon: FaRegBuilding,
    title: "Guest Houses",
  },
];

/* =====================================
   Property-owner partnership section
===================================== */

function Newsletter() {
  return (
    <section
      className="partner-section"
      aria-labelledby="partner-title"
    >
      <div className="partner-container">
        {/* Main content */}

        <div className="partner-content">
          <span className="partner-eyebrow">
            <FaUserTie
              aria-hidden="true"
            />

            PARTNER WITH HHS
          </span>

          <h2 id="partner-title">
            Own a Stay Near
            <span>
              Hogenakkal?
            </span>
          </h2>

          <p className="partner-description">
            Join Hogenakkal Home Stays and
            connect with travellers searching
            for homestays, cottages, resorts,
            hotels and guest houses near
            Hogenakkal Falls.
          </p>

          <div className="partner-benefits">
            {ownerBenefits.map(
              (benefit) => (
                <div
                  className="partner-benefit"
                  key={benefit}
                >
                  <FaCheckCircle
                    aria-hidden="true"
                  />

                  <span>
                    {benefit}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="partner-actions">
            <Link
              to="/add-property"
              className="partner-primary-button"
            >
              <FaKey
                aria-hidden="true"
              />

              <span>
                List Your Property
              </span>

              <FaArrowRight
                className="partner-arrow"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/contact"
              className="partner-secondary-button"
            >
              Learn How It Works
            </Link>
          </div>

          <p className="partner-login-note">
            Already registered as an owner?{" "}

            <Link to="/owner">
              Go to Owner Dashboard
            </Link>
          </p>
        </div>

        {/* Partnership card */}

        <div className="partner-visual">
          <div className="partner-card">
            <header className="partner-card-header">
              <div className="partner-logo">
                <img
                  src={hhsLogo}
                  alt="Hogenakkal Home Stays logo"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div>
                <span>
                  HOGENAKKAL HOME STAYS
                </span>

                <h3>
                  Grow With HHS
                </h3>
              </div>
            </header>

            <p className="partner-card-description">
              We welcome eligible accommodation
              providers serving travellers around
              Hogenakkal and Dharmapuri.
            </p>

            <div className="partner-property-types">
              {propertyTypes.map(
                ({
                  icon: PropertyIcon,
                  title,
                }) => (
                  <article
                    className="partner-property-type"
                    key={title}
                  >
                    <div>
                      <PropertyIcon
                        aria-hidden="true"
                      />
                    </div>

                    <strong>
                      {title}
                    </strong>
                  </article>
                )
              )}
            </div>

            <div className="partner-card-footer">
              <div>
                <span className="partner-status-dot" />

                <span>
                  Owner registrations open
                </span>
              </div>

              <Link to="/add-property">
                Get Started
                <FaArrowRight
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          <div className="partner-floating-card partner-floating-card-one">
            <strong>
              Verified Listings
            </strong>

            <span>
              Build traveller confidence
            </span>
          </div>

          <div className="partner-floating-card partner-floating-card-two">
            <strong>
              Local Platform
            </strong>

            <span>
              Focused on Hogenakkal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;