import {
  Link,
} from "react-router-dom";

import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaYoutube,
} from "react-icons/fa";

import BrandLogo from "../BrandLogo/BrandLogo";

import "./Footer.css";

/* =====================================
   Social URL helper
===================================== */

const normalizeSocialUrl = (
  environmentUrl,
  fallbackUrl
) => {
  if (
    typeof environmentUrl !==
      "string" ||
    !environmentUrl.trim()
  ) {
    return fallbackUrl;
  }

  const trimmedUrl =
    environmentUrl.trim();

  /*
   * Handle accidentally pasted Markdown:
   * [https://example.com](https://example.com)
   */

  const markdownMatch =
    trimmedUrl.match(
      /^\[.*?\]\((https?:\/\/[^)]+)\)$/
    );

  const socialUrl =
    markdownMatch?.[1] ||
    trimmedUrl;

  try {
    const parsedUrl =
      new URL(socialUrl);

    if (
      parsedUrl.protocol !==
        "https:" &&
      parsedUrl.protocol !==
        "http:"
    ) {
      return fallbackUrl;
    }

    return parsedUrl.toString();
  } catch {
    return fallbackUrl;
  }
};

/* =====================================
   Social media links
===================================== */

const socialLinks = [
  {
    label: "Facebook",

    url: normalizeSocialUrl(
      import.meta.env
        .VITE_FACEBOOK_URL,

      "https://www.facebook.com/share/1PSxDUPCUa/"
    ),

    Icon: FaFacebookF,
  },
  {
    label: "Instagram",

    url: normalizeSocialUrl(
      import.meta.env
        .VITE_INSTAGRAM_URL,

      "https://www.instagram.com/hogenakkalhomestays?igsh=MWFuOXRzd3I4cHN4aA=="
    ),

    Icon: FaInstagram,
  },
  {
    label: "YouTube",

    url: normalizeSocialUrl(
      import.meta.env
        .VITE_YOUTUBE_URL,

      "https://youtube.com/@hogenakkalhomestays?si=z3hdFt3tR4x0Lue7"
    ),

    Icon: FaYoutube,
  },
];

function Footer() {
  const currentYear =
    new Date().getFullYear();

  const handleNavigation = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <section className="footer-brand">
          <BrandLogo
            className="footer-brand-logo"
            onClick={
              handleNavigation
            }
          />

          <p>
            Discover trusted homestays,
            cottages and resorts near
            Hogenakkal Falls. Book
            peaceful stays with comfort,
            confidence and secure
            support.
          </p>

          <div className="footer-social-icons">
            {socialLinks.map(
              ({
                label,
                url,
                Icon,
              }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Hogenakkal Home Stays on ${label}`}
                  title={label}
                >
                  <Icon
                    aria-hidden="true"
                  />
                </a>
              )
            )}
          </div>
        </section>

        <section className="footer-links">
          <h3>
            Quick Links
          </h3>

          <Link
            to="/"
            onClick={
              handleNavigation
            }
          >
            Home
          </Link>

          <Link
            to="/explore"
            onClick={
              handleNavigation
            }
          >
            Explore Stays
          </Link>

          <Link
            to="/about"
            onClick={
              handleNavigation
            }
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={
              handleNavigation
            }
          >
            Contact Us
          </Link>
        </section>

        <section className="footer-links">
          <h3>
            Services
          </h3>

          <Link
            to="/explore"
            onClick={
              handleNavigation
            }
          >
            Homestays
          </Link>

          <Link
            to="/explore?propertyType=Resort"
            onClick={
              handleNavigation
            }
          >
            Resorts
          </Link>

          <Link
            to="/add-property"
            onClick={
              handleNavigation
            }
          >
            List Your Property
          </Link>

          <Link
            to="/owner"
            onClick={
              handleNavigation
            }
          >
            Owner Centre
          </Link>
        </section>

        <section className="footer-links">
          <h3>
            Customer Support
          </h3>

          <Link
            to="/bookings"
            onClick={
              handleNavigation
            }
          >
            My Bookings
          </Link>

          <Link
            to="/saved-properties"
            onClick={
              handleNavigation
            }
          >
            Saved Properties
          </Link>

          <Link
            to="/support-tickets"
            onClick={
              handleNavigation
            }
          >
            Support Tickets
          </Link>

          <Link
            to="/contact"
            onClick={
              handleNavigation
            }
          >
            Help and Contact
          </Link>
        </section>

        <section className="footer-contact">
          <h3>
            Contact
          </h3>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">
              <FaMapMarkerAlt
                aria-hidden="true"
              />
            </span>

            <span>
              Hogenakkal, Dharmapuri
              District, Tamil Nadu,
              India
            </span>
          </div>

          <a
            className="footer-contact-item"
            href="tel:+917871779134"
          >
            <span className="footer-contact-icon">
              <FaPhoneAlt
                aria-hidden="true"
              />
            </span>

            <span>
              +91 78717 79134
            </span>
          </a>

          <a
            className="footer-contact-item"
            href="mailto:hogenakkalhomestays@gmail.com"
          >
            <span className="footer-contact-icon">
              <FaEnvelope
                aria-hidden="true"
              />
            </span>

            <span>
              hogenakkalhomestays@gmail.com
            </span>
          </a>
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} Hogenakkal
          Home Stays. All rights
          reserved.
        </p>

        <p className="footer-operator">
          Operated by VeeraWebTech
        </p>

        <nav
          className="footer-legal-links"
          aria-label="Legal information"
        >
          <Link
            to="/terms-and-conditions"
            onClick={
              handleNavigation
            }
          >
            Terms & Conditions
          </Link>

          <Link
            to="/privacy-policy"
            onClick={
              handleNavigation
            }
          >
            Privacy Policy
          </Link>

          <Link
            to="/cancellation-refund-policy"
            onClick={
              handleNavigation
            }
          >
            Cancellation & Refund
          </Link>

          <Link
            to="/service-delivery-policy"
            onClick={
              handleNavigation
            }
          >
            Service Delivery
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;