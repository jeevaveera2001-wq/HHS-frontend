import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  getAuthErrorMessage,
  registerUser,
} from "../../services/authService";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import "./Register.css";

const initialFormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const navigate =
    useNavigate();

  const [
    formData,
    setFormData,
  ] = useState(
    initialFormData
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =====================================
     Input change
  ===================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]: value,
      })
    );
  };

  /* =====================================
     Registration validation
  ===================================== */

  const validateForm = () => {
    const fullName =
      formData.fullName
        .trim()
        .replace(
          /\s+/g,
          " "
        );

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const phone =
      formData.phone
        .trim()
        .replace(
          /[\s()-]/g,
          ""
        );

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      toast.error(
        "Please fill all fields."
      );

      return null;
    }

    if (
      fullName.length < 3 ||
      fullName.length > 100
    ) {
      toast.error(
        "Full name must contain between 3 and 100 characters."
      );

      return null;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email
      )
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return null;
    }

    const phonePattern =
      /^\+?[0-9]{10,15}$/;

    if (
      !phonePattern.test(
        phone
      )
    ) {
      toast.error(
        "Phone number must contain between 10 and 15 digits."
      );

      return null;
    }

    if (
      password.length < 8 ||
      password.length > 128
    ) {
      toast.error(
        "Password must contain between 8 and 128 characters."
      );

      return null;
    }

    if (
      !/[A-Za-z]/.test(
        password
      )
    ) {
      toast.error(
        "Password must contain at least one letter."
      );

      return null;
    }

    if (
      !/[0-9]/.test(
        password
      )
    ) {
      toast.error(
        "Password must contain at least one number."
      );

      return null;
    }

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return null;
    }

    return {
      fullName,
      email,
      phone,
      password,
    };
  };

  /* =====================================
     Registration submission
  ===================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const payload =
      validateForm();

    if (!payload) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await registerUser(
          payload
        );

      toast.success(
        response?.message ||
          "Registration successful. Please verify your email."
      );

      setFormData(
        initialFormData
      );

      /*
       * Registration does not log the
       * customer in automatically.
       * The email must be verified first.
       */

      navigate(
        "/verify-email",
        {
          replace: true,

          state: {
            email:
              payload.email,

            registrationSuccess:
              true,

            verificationEmailSent:
              response
                ?.verificationEmailSent !==
              false,

            message:
              response?.message ||
              "",
          },
        }
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      toast.error(
        getAuthErrorMessage(
          error
        )
      );

      setLoading(false);
    }
  };

  return (
    <main className="register-wrapper">
      <section className="register-visual">
        <div className="register-brand-area">
          <BrandLogo
            to="/"
            variant="auth"
            className="register-page-logo"
          />

          <div>
            <strong>
              Official Booking Platform
            </strong>

            <span>
              Hogenakkal, Tamil Nadu
            </span>
          </div>
        </div>

        <div className="register-content">
          <span className="register-eyebrow">
            Join Our Community
          </span>

          <h1>
            Create Your
            <br />
            Perfect Stay
          </h1>

          <p>
            Create your account and
            discover peaceful
            destinations, beautiful
            nature and memorable stays
            near Hogenakkal Falls.
          </p>
        </div>

        <div className="register-message">
          <h3>
            Start Your Journey
          </h3>

          <h2>
            Stay.
            <br />
            Explore.
            <br />
            Experience.
          </h2>

          <p>
            Book amazing homestays near
            Hogenakkal Falls with
            comfort and confidence.
          </p>

          <div className="register-features">
            <span>
              Easy Booking
            </span>

            <span>
              Safe Stay
            </span>

            <span>
              Nature Experience
            </span>
          </div>
        </div>
      </section>

      <section className="register-area">
        <form
          className="register-card"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <div className="register-card-heading">
            <span className="register-card-badge">
              Guest Registration
            </span>

            <h1>
              Create Account
            </h1>

            <p>
              Register to start your
              Hogenakkal journey.
            </p>
          </div>

          <div className="register-form-group">
            <label htmlFor="register-name">
              Full name
            </label>

            <input
              id="register-name"
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Enter your full name"
              value={
                formData.fullName
              }
              onChange={
                handleChange
              }
              disabled={loading}
              minLength="3"
              maxLength="100"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="register-email">
              Email address
            </label>

            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              disabled={loading}
              maxLength="150"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="register-phone">
              Phone number
            </label>

            <input
              id="register-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="Enter your phone number"
              value={
                formData.phone
              }
              onChange={
                handleChange
              }
              disabled={loading}
              maxLength="18"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              disabled={loading}
              minLength="8"
              maxLength="128"
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="register-confirm-password">
              Confirm password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={
                formData.confirmPassword
              }
              onChange={
                handleChange
              }
              disabled={loading}
              minLength="8"
              maxLength="128"
              required
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="login-link">
            Already have an
            account?

            <Link to="/login">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;