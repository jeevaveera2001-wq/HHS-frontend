import { Link } from "react-router-dom";

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

const socialLinks = [
  {
    label: "Facebook",
    url: import.meta.env.VITE_FACEBOOK_URL,
    Icon: FaFacebookF,
  },
  {
    label: "Instagram",
    url: import.meta.env.VITE_INSTAGRAM_URL,
    Icon: FaInstagram,
  },
  {
    label: "YouTube",
    url: import.meta.env.VITE_YOUTUBE_URL,
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
      <div className="footer-glow footer-glow-left" />
      <div className="footer-glow footer-glow-right" />

      <div className="footer-container">
        <section className="footer-brand">
          <BrandLogo
            className="footer-brand-logo"
            onClick={handleNavigation}
          />

          <p>
            Discover trusted homestays,
            cottages and resorts near
            Hogenakkal Falls. Book peaceful
            stays with comfort, confidence
            and secure support.
          </p>

          <div className="footer-social-icons">
            {socialLinks.map(
              ({
                label,
                url,
                Icon,
              }) =>
                url ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit Hogenakkal Home Stays on ${label}`}
                    title={label}
                  >
                    <Icon />
                  </a>
                ) : (
                  <span
                    key={label}
                    className="footer-social-disabled"
                    aria-label={`${label} page coming soon`}
                    title={`${label} page coming soon`}
                  >
                    <Icon />
                  </span>
                )
            )}
          </div>
        </section>

        <section className="footer-links">
          <h3>Quick Links</h3>

          <Link
            to="/"
            onClick={handleNavigation}
          >
            Home
          </Link>

          <Link
            to="/explore"
            onClick={handleNavigation}
          >
            Explore Stays
          </Link>

          <Link
            to="/about"
            onClick={handleNavigation}
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={handleNavigation}
          >
            Contact Us
          </Link>
        </section>

        <section className="footer-links">
          <h3>Services</h3>

          <Link
            to="/explore"
            onClick={handleNavigation}
          >
            Homestays
          </Link>

          <Link
            to="/explore?propertyType=Resort"
            onClick={handleNavigation}
          >
            Resorts
          </Link>

          <Link
            to="/add-property"
            onClick={handleNavigation}
          >
            List Your Property
          </Link>

          <Link
            to="/owner"
            onClick={handleNavigation}
          >
            Owner Centre
          </Link>
        </section>

        <section className="footer-links">
          <h3>Customer Support</h3>

          <Link
            to="/bookings"
            onClick={handleNavigation}
          >
            My Bookings
          </Link>

          <Link
            to="/saved-properties"
            onClick={handleNavigation}
          >
            Saved Properties
          </Link>

          <Link
            to="/support-tickets"
            onClick={handleNavigation}
          >
            Support Tickets
          </Link>

          <Link
            to="/contact"
            onClick={handleNavigation}
          >
            Help and Contact
          </Link>
        </section>

        <section className="footer-contact">
          <h3>Contact</h3>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">
              <FaMapMarkerAlt />
            </span>

            <span>
              Hogenakkal, Dharmapuri District,
              Tamil Nadu, India
            </span>
          </div>

          <a
            className="footer-contact-item"
            href="tel:+917871779134"
          >
            <span className="footer-contact-icon">
              <FaPhoneAlt />
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
              <FaEnvelope />
            </span>

            <span>
              hogenakkalhomestays@gmail.com
            </span>
          </a>
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} Hogenakkal Home
          Stays. All rights reserved.
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
            onClick={handleNavigation}
          >
            Terms & Conditions
          </Link>

          <Link
            to="/privacy-policy"
            onClick={handleNavigation}
          >
            Privacy Policy
          </Link>

          <Link
            to="/cancellation-refund-policy"
            onClick={handleNavigation}
          >
            Cancellation & Refund
          </Link>

          <Link
            to="/service-delivery-policy"
            onClick={handleNavigation}
          >
            Service Delivery
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;