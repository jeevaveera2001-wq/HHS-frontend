import { useMemo, useState } from "react";

import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaEnvelope,
  FaHome,
  FaHotel,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegBuilding,
  FaUser,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./RequestOwnerAccess.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const propertyTypeOptions = [
  {
    value: "homestay",
    label: "Homestay",
    Icon: FaHome,
  },
  {
    value: "hotel",
    label: "Hotel",
    Icon: FaHotel,
  },
  {
    value: "resort",
    label: "Resort",
    Icon: FaBuilding,
  },
  {
    value: "guest-house",
    label: "Guest House",
    Icon: FaRegBuilding,
  },
];

function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

function getStoredToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function RequestOwnerAccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const user = useMemo(
    () => getStoredUser(),
    []
  );

  const selectedPropertyType =
    searchParams.get("propertyType") || "";

  const validSelectedPropertyType =
    propertyTypeOptions.some(
      (option) =>
        option.value === selectedPropertyType
    )
      ? selectedPropertyType
      : "";

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    propertyName: "",
    propertyType: validSelectedPropertyType,
    propertyLocation: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (
      !/^[6-9]\d{9}$/.test(
        formData.phone.replace(/\s+/g, "")
      )
    ) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!formData.propertyName.trim()) {
      return "Please enter your property name.";
    }

    if (!formData.propertyType) {
      return "Please select your property type.";
    }

    if (!formData.propertyLocation.trim()) {
      return "Please enter your property location.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getStoredToken();

    if (!token) {
      navigate(
        "/login?redirect=/request-owner-access"
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/owner-requests`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email
              .trim()
              .toLowerCase(),
            phone: formData.phone
              .replace(/\s+/g, "")
              .trim(),
            propertyName:
              formData.propertyName.trim(),
            propertyType:
              formData.propertyType,
            propertyLocation:
              formData.propertyLocation.trim(),
            message: formData.message.trim(),
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit your request."
        );
      }

      setIsSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="owner-request-page">
        <section className="owner-request-success">
          <div className="owner-request-success-icon">
            <FaCheckCircle aria-hidden="true" />
          </div>

          <span>REQUEST SUBMITTED</span>

          <h1>Your owner request is under review</h1>

          <p>
            Thank you, {formData.fullName}. The HHS
            administration team will review your
            information and contact you using the
            provided phone number or email address.
          </p>

          <div className="owner-request-success-actions">
            <Link to="/">
              Return to Home
            </Link>

            <Link
              to="/contact"
              className="secondary"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="owner-request-page">
      <div
        className="owner-request-decoration owner-request-decoration-left"
        aria-hidden="true"
      />

      <div
        className="owner-request-decoration owner-request-decoration-right"
        aria-hidden="true"
      />

      <div className="owner-request-container">
        <section className="owner-request-intro">
          <Link
            to="/"
            className="owner-request-back"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to Home
          </Link>

          <span className="owner-request-eyebrow">
            PROPERTY PARTNERSHIP
          </span>

          <h1>
            Become an HHS
            <span> Property Owner</span>
          </h1>

          <p>
            Submit your property details to request
            owner access. Our team will verify the
            information before activating your owner
            dashboard.
          </p>

          <div className="owner-request-benefits">
            <div>
              <FaCheckCircle aria-hidden="true" />

              <span>
                List and manage your properties
              </span>
            </div>

            <div>
              <FaCheckCircle aria-hidden="true" />

              <span>
                Receive and manage booking requests
              </span>
            </div>

            <div>
              <FaCheckCircle aria-hidden="true" />

              <span>
                Get support from the local HHS team
              </span>
            </div>
          </div>

          <div className="owner-request-note">
            <strong>What happens next?</strong>

            <p>
              Your request will be sent to the HHS
              administrator. Owner access will only be
              enabled after verification and approval.
            </p>
          </div>
        </section>

        <section className="owner-request-form-card">
          <div className="owner-request-form-heading">
            <span>OWNER REGISTRATION</span>

            <h2>Request owner access</h2>

            <p>
              Enter accurate information so our team
              can verify your property.
            </p>
          </div>

          {error && (
            <div
              className="owner-request-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="owner-request-form-grid">
              <div className="owner-request-field">
                <label htmlFor="fullName">
                  Full name
                </label>

                <div className="owner-request-input">
                  <FaUser aria-hidden="true" />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="owner-request-field">
                <label htmlFor="phone">
                  Phone number
                </label>

                <div className="owner-request-input">
                  <FaPhoneAlt aria-hidden="true" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="owner-request-field owner-request-field-full">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="owner-request-input">
                  <FaEnvelope aria-hidden="true" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="owner-request-field owner-request-field-full">
                <label htmlFor="propertyName">
                  Property name
                </label>

                <div className="owner-request-input">
                  <FaBuilding aria-hidden="true" />

                  <input
                    id="propertyName"
                    name="propertyName"
                    type="text"
                    value={formData.propertyName}
                    onChange={handleChange}
                    placeholder="Example: Hogenakkal Riverside Stay"
                  />
                </div>
              </div>

              <div className="owner-request-field owner-request-field-full">
                <label>Property type</label>

                <div className="owner-request-property-types">
                  {propertyTypeOptions.map(
                    ({
                      value,
                      label,
                      Icon,
                    }) => (
                      <label
                        className={`owner-request-property-option ${
                          formData.propertyType === value
                            ? "selected"
                            : ""
                        }`}
                        key={value}
                      >
                        <input
                          type="radio"
                          name="propertyType"
                          value={value}
                          checked={
                            formData.propertyType ===
                            value
                          }
                          onChange={handleChange}
                        />

                        <Icon aria-hidden="true" />

                        <span>{label}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="owner-request-field owner-request-field-full">
                <label htmlFor="propertyLocation">
                  Property location
                </label>

                <div className="owner-request-input">
                  <FaMapMarkerAlt aria-hidden="true" />

                  <input
                    id="propertyLocation"
                    name="propertyLocation"
                    type="text"
                    value={
                      formData.propertyLocation
                    }
                    onChange={handleChange}
                    placeholder="Address or area near Hogenakkal"
                  />
                </div>
              </div>

              <div className="owner-request-field owner-request-field-full">
                <label htmlFor="message">
                  Additional information
                  <span> (optional)</span>
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your property, available rooms or other details"
                  rows="4"
                  maxLength="1000"
                />

                <small>
                  {formData.message.length}/1000
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="owner-request-submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Submitting Request..."
                  : "Submit Owner Request"}
              </span>

              {!isSubmitting && (
                <FaArrowLeft
                  className="owner-request-submit-arrow"
                  aria-hidden="true"
                />
              )}
            </button>

            <p className="owner-request-terms">
              By submitting this request, you confirm
              that the provided property information is
              accurate.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default RequestOwnerAccess;