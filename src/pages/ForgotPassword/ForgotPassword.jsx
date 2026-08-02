import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import {
  getAuthErrorMessage,
  requestPasswordReset,
} from "../../services/authService";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [emailSent, setEmailSent] =
    useState(false);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Enter your email address."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        normalizedEmail
      )
    ) {
      toast.error(
        "Enter a valid email address."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await requestPasswordReset(
          normalizedEmail
        );

      setEmailSent(true);

      toast.success(
        response?.message ||
          "Password reset instructions have been sent."
      );
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTryAnotherEmail = () => {
    setEmail("");
    setEmailSent(false);
  };

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-background" />

      <section className="forgot-password-container">
        <Link
          className="forgot-password-home-link"
          to="/"
        >
          ← Return to home
        </Link>

        <div className="forgot-password-card">
          <BrandLogo
            className="forgot-password-logo"
            to="/"
          />

          {emailSent ? (
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">
                ✓
              </div>

              <span className="forgot-password-eyebrow">
                Check your inbox
              </span>

              <h1>
                Reset email sent
              </h1>

              <p>
                If an HHS account exists for
                <strong>
                  {" "}
                  {email}
                </strong>
                , you will receive a password
                reset link shortly.
              </p>

              <div className="forgot-password-information">
                <span>✉</span>

                <p>
                  The reset link expires shortly
                  for your account security.
                  Remember to check your spam or
                  promotions folder.
                </p>
              </div>

              <Link
                className="forgot-password-primary-link"
                to="/login"
              >
                Return to login
              </Link>

              <button
                className="forgot-password-secondary-button"
                type="button"
                onClick={handleTryAnotherEmail}
              >
                Try another email
              </button>
            </div>
          ) : (
            <>
              <span className="forgot-password-eyebrow">
                Account recovery
              </span>

              <h1>
                Forgot your password?
              </h1>

              <p className="forgot-password-description">
                Enter the email address connected
                to your HHS account. We will send
                you a secure link to create a new
                password.
              </p>

              <form
                className="forgot-password-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <label htmlFor="forgotPasswordEmail">
                  Email address
                </label>

                <div className="forgot-password-input-wrapper">
                  <span aria-hidden="true">
                    ✉
                  </span>

                  <input
                    id="forgotPasswordEmail"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(
                        event.target.value
                      );
                    }}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  className="forgot-password-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="forgot-password-button-spinner" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>

              <div className="forgot-password-back">
                <span>
                  Remembered your password?
                </span>

                <Link to="/login">
                  Login securely
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="forgot-password-security-note">
          🔒 Your account information remains
          private and secure with HHS.
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;