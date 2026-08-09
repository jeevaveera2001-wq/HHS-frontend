import "./Newsletter.css";

import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaHome,
  FaHotel,
  FaKey,
  FaRegBuilding,
  FaRegHandshake,
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
      className="newsletter-section"
      aria-labelledby="partner-title"
    >
      <div className="newsletter-container">
        {/* Main content */}

        <div className="newsletter-content">
          <span className="newsletter-eyebrow">
            <FaRegHandshake
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

          <p className="newsletter-description">
            Join Hogenakkal Home Stays and
            connect with travellers searching
            for homestays, cottages, resorts,
            hotels and guest houses near
            Hogenakkal Falls.
          </p>

          <div className="newsletter-benefits">
            {ownerBenefits.map(
              (benefit) => (
                <div
                  className="newsletter-benefit"
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

          <div className="newsletter-actions">
            <Link
              to="/add-property"
              className="newsletter-primary-button"
            >
              <FaKey
                aria-hidden="true"
              />

              <span>
                List Your Property
              </span>

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/contact"
              className="newsletter-secondary-button"
            >
              Talk to Our Team
            </Link>
          </div>

          <p className="newsletter-owner-login">
            Already registered as an owner?

            <Link to="/owner">
              Go to Owner Dashboard
            </Link>
          </p>
        </div>

        {/* Partnership card */}

        <div className="newsletter-partner-card">
          <header className="newsletter-card-header">
            <div className="newsletter-logo">
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

              <p>
                List and manage your
                accommodation on one trusted
                local platform.
              </p>
            </div>
          </header>

          <div className="newsletter-property-types">
            {propertyTypes.map(
              ({
                icon: PropertyIcon,
                title,
              }) => (
                <article
                  className="newsletter-property-type"
                  key={title}
                >
                  <div>
                    <PropertyIcon
                      aria-hidden="true"
                    />
                  </div>

                  <span>
                    {title}
                  </span>
                </article>
              )
            )}
          </div>

          <footer className="newsletter-card-footer">
            <div>
              <span
                className="newsletter-status-dot"
                aria-hidden="true"
              />

              <span>
                Owner registrations open
              </span>
            </div>

            <Link to="/add-property">
              <span>
                Get Started
              </span>

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>
          </footer>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;