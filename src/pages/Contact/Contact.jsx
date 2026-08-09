import "./Contact.css";

import {
  useState,
} from "react";

import { toast } from "react-toastify";

import {
  getContactErrorMessage,
  submitContactEnquiry,
} from "../../services/contactService";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

function Contact() {
  const [formData, setFormData] =
    useState(initialFormData);

  const [submitting, setSubmitting] =
    useState(false);

  /* =====================================
     Input handler
  ===================================== */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );
  };

  /* =====================================
     Form validation
  ===================================== */

  const validateForm = () => {
    const name =
      formData.name.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const phone =
      formData.phone.trim();

    const message =
      formData.message.trim();

    if (!name) {
      return "Please enter your name.";
    }

    if (name.length < 2) {
      return (
        "Name must contain at least " +
        "2 characters."
      );
    }

    if (!email) {
      return "Please enter your email.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return (
        "Please enter a valid email address."
      );
    }

    if (!phone) {
      return (
        "Please enter your phone number."
      );
    }

    const phoneDigits =
      phone.replace(/\D/g, "");

    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      return (
        "Please enter a valid phone number."
      );
    }

    if (!message) {
      return "Please enter your message.";
    }

    if (message.length < 10) {
      return (
        "Message must contain at least " +
        "10 characters."
      );
    }

    if (message.length > 3000) {
      return (
        "Message cannot exceed " +
        "3000 characters."
      );
    }

    return null;
  };

  /* =====================================
     Submit enquiry
  ===================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await submitContactEnquiry({
          name:
            formData.name.trim(),

          email:
            formData.email
              .trim()
              .toLowerCase(),

          phone:
            formData.phone.trim(),

          message:
            formData.message.trim(),
        });

      toast.success(
        response?.message ||
          "Your enquiry was submitted successfully."
      );

      setFormData(initialFormData);
    } catch (error) {
      console.error(
        "Submit contact enquiry error:",
        error
      );

      toast.error(
        getContactErrorMessage(error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero section */}

      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>
            Contact HogenakkalHomeStay
          </h1>

          <p>
            Plan your perfect stay near
            Hogenakkal Falls. Our team is
            ready to help you.
          </p>
        </div>
      </section>

      {/* Contact section */}

      <section className="contact-section">
        <div className="contact-info">
          <div className="contact-card">
            <h2>Location</h2>

            <p>
              Hogenakkal Falls,
              Tamil Nadu, India
            </p>
          </div>

          <div className="contact-card">
            <h2>Phone</h2>

            <p>
              <a href="tel:+917871779134">
                +91 78717 79134
              </a>
            </p>
          </div>

          <div className="contact-card">
            <h2>Email</h2>

            <p>
              <a href="mailto:hogenakkalhomestays@gmail.com">
                hogenakkalhomestays@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Enquiry form */}

        <form
          className="contact-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2>Send Enquiry</h2>

          <p>
            Tell us about your travel plan
          </p>

          <label
            htmlFor="contact-name"
            className="contact-field-label"
          >
            Name
          </label>

          <input
            id="contact-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            minLength={2}
            maxLength={100}
            autoComplete="name"
            disabled={submitting}
            required
          />

          <label
            htmlFor="contact-email"
            className="contact-field-label"
          >
            Email
          </label>

          <input
            id="contact-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            maxLength={150}
            autoComplete="email"
            disabled={submitting}
            required
          />

          <label
            htmlFor="contact-phone"
            className="contact-field-label"
          >
            Phone number
          </label>

          <input
            id="contact-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            maxLength={20}
            autoComplete="tel"
            inputMode="tel"
            disabled={submitting}
            required
          />

          <label
            htmlFor="contact-message"
            className="contact-field-label"
          >
            Message
          </label>

          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            minLength={10}
            maxLength={3000}
            rows={6}
            disabled={submitting}
            required
          />

          <div className="contact-character-count">
            {formData.message.length}
            /3000 characters
          </div>

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting Enquiry..."
              : "Submit Enquiry"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Contact;