import "./AppDownload.css";

import {
  FaArrowRight,
  FaCheckCircle,
  FaHeadset,
  FaMapMarkedAlt,
  FaWhatsapp,
} from "react-icons/fa";

import {
  Link,
} from "react-router-dom";

import hogenakkalFallsImage from "../../assets/images/hogenakkal-falls.jpg";

/* =====================================
   Travel-assistance benefits
===================================== */

const travelBenefits = [
  "Verified stays near Hogenakkal Falls",
  "Options for families, couples and groups",
  "Local guidance for nearby attractions",
  "Direct support before and during your stay",
];

/* =====================================
   Assistance services
===================================== */

const assistanceServices = [
  {
    icon: "🏡",
    title: "Stay Selection",
    description:
      "Find a property that matches your group and budget.",
  },

  {
    icon: "🛶",
    title: "Local Experiences",
    description:
      "Get guidance about coracle rides and attractions.",
  },

  {
    icon: "🎧",
    title: "Booking Support",
    description:
      "Receive assistance throughout your booking journey.",
  },
];

/* =====================================
   WhatsApp URL
===================================== */

const whatsappMessage =
  "Hello Hogenakkal Home Stays, I need help planning my stay near Hogenakkal Falls.";

const whatsappUrl =
  `https://wa.me/917871779134?text=${encodeURIComponent(
    whatsappMessage
  )}`;

/* =====================================
   Trip-planning section
===================================== */

function AppDownload() {
  return (
    <section
      className="app-section"
      aria-labelledby="trip-planner-title"
    >
      <div className="app-decoration app-decoration-one" />
      <div className="app-decoration app-decoration-two" />

      <div className="app-container">
        {/* Content */}

        <div className="app-content">
          <span className="app-badge">
            <FaMapMarkedAlt
              aria-hidden="true"
            />

            LOCAL TRAVEL ASSISTANCE
          </span>

          <h2 id="trip-planner-title">
            Plan Your Perfect
            <span>
              Hogenakkal Trip
            </span>
          </h2>

          <p className="app-description">
            Not sure which stay is right for you?
            Tell us your travel dates, group size
            and budget. Our local team will help
            you choose a suitable stay near
            Hogenakkal Falls.
          </p>

          <div className="app-features">
            {travelBenefits.map(
              (item) => (
                <div
                  className="app-feature"
                  key={item}
                >
                  <FaCheckCircle
                    aria-hidden="true"
                  />

                  <span>{item}</span>
                </div>
              )
            )}
          </div>

          <div className="app-actions">
            <Link
              className="app-primary-button"
              to="/explore"
            >
              <span>
                Explore Available Stays
              </span>

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>

            <a
              className="app-whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp
                aria-hidden="true"
              />

              <span>
                Chat on WhatsApp
              </span>
            </a>
          </div>

          <div className="app-support-note">
            <FaHeadset
              aria-hidden="true"
            />

            <div>
              <strong>
                Need immediate assistance?
              </strong>

              <span>
                Call us at{" "}
                <a href="tel:+917871779134">
                  +91 78717 79134
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Genuine Hogenakkal visual */}

        <div className="app-visual">
          <div className="app-image-frame">
            <img
              src={hogenakkalFallsImage}
              alt="Real view of Hogenakkal Falls in Dharmapuri, Tamil Nadu"
              loading="lazy"
              decoding="async"
              width="900"
              height="760"
            />

            <div className="app-image-overlay" />

            <div className="app-location-badge">
              <FaMapMarkedAlt
                aria-hidden="true"
              />

              <div>
                <span>
                  Explore stays near
                </span>

                <strong>
                  Hogenakkal Falls
                </strong>
              </div>
            </div>
          </div>

          <div className="app-assistance-card">
            <div className="app-assistance-heading">
              <div className="app-assistance-icon">
                HHS
              </div>

              <div>
                <span>
                  HOGENAKKAL HOME STAYS
                </span>

                <h3>
                  Travel Assistance
                </h3>
              </div>
            </div>

            <div className="app-assistance-services">
              {assistanceServices.map(
                (service) => (
                  <article
                    className="app-assistance-service"
                    key={service.title}
                  >
                    <div>
                      {service.icon}
                    </div>

                    <section>
                      <strong>
                        {service.title}
                      </strong>

                      <p>
                        {service.description}
                      </p>
                    </section>
                  </article>
                )
              )}
            </div>

            <div className="app-assistance-footer">
              <span className="app-status-dot" />

              <span>
                Local assistance available
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppDownload;