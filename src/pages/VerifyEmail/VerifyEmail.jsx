import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import {
  getAuthErrorMessage,
  resendVerificationEmail,
  verifyEmail as verifyUserEmail,
} from "../../services/authService";

import "./VerifyEmail.css";

function VerifyEmail() {
  const {
    token,
  } = useParams();

  const location =
    useLocation();

  const verificationStartedRef =
    useRef("");

  const emailFromNavigation =
    location.state?.email ||
    "";

  const decodedToken =
    useMemo(() => {
      if (!token) {
        return "";
      }

      try {
        return decodeURIComponent(
          token
        );
      } catch {
        return token;
      }
    }, [token]);

  const [
    verificationStatus,
    setVerificationStatus,
  ] = useState(
    decodedToken
      ? "checking"
      : "pending"
  );

  const [
    verificationMessage,
    setVerificationMessage,
  ] = useState(
    location.state?.message ||
      "Check your email for a verification link."
  );

  const [
    email,
    setEmail,
  ] = useState(
    emailFromNavigation
  );

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  const [
    resendCompleted,
    setResendCompleted,
  ] = useState(false);

  const verificationEmailSent =
    location.state
      ?.verificationEmailSent !==
    false;

  /* =====================================
     Verify token from email link
  ===================================== */

  useEffect(() => {
    if (!decodedToken) {
      setVerificationStatus(
        "pending"
      );

      return;
    }

    /*
     * Prevent React StrictMode from
     * submitting the same single-use
     * verification token twice.
     */

    if (
      verificationStartedRef
        .current ===
      decodedToken
    ) {
      return;
    }

    verificationStartedRef.current =
      decodedToken;

    setVerificationStatus(
      "checking"
    );

    verifyUserEmail(
      decodedToken
    )
      .then((response) => {
        setVerificationStatus(
          "success"
        );

        setVerificationMessage(
          response?.message ||
            "Your email address has been verified successfully."
        );

        toast.success(
          "Email verified successfully."
        );
      })
      .catch((error) => {
        setVerificationStatus(
          "error"
        );

        setVerificationMessage(
          getAuthErrorMessage(
            error
          )
        );
      });
  }, [decodedToken]);

  /* =====================================
     Resend verification email
  ===================================== */

  const handleResend = async (
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
      setResendLoading(
        true
      );

      const response =
        await resendVerificationEmail(
          normalizedEmail
        );

      setResendCompleted(
        true
      );

      toast.success(
        response?.message ||
          "A new verification link has been sent."
      );
    } catch (error) {
      toast.error(
        getAuthErrorMessage(
          error
        )
      );
    } finally {
      setResendLoading(
        false
      );
    }
  };

  /* =====================================
     Reusable resend section
  ===================================== */

  const renderResendSection =
    () => {
      if (resendCompleted) {
        return (
          <div className="verify-email-resend-success">
            <span>
              ✓
            </span>

            <div>
              <strong>
                Check your inbox
              </strong>

              <p>
                If an unverified HHS
                account exists for this
                email, a new verification
                link has been sent.
              </p>
            </div>
          </div>
        );
      }

      return (
        <form
          className="verify-email-resend-form"
          onSubmit={
            handleResend
          }
          noValidate
        >
          <label htmlFor="verificationEmail">
            Registered email
          </label>

          <div className="verify-email-input-wrapper">
            <span
              aria-hidden="true"
            >
              ✉
            </span>

            <input
              id="verificationEmail"
              name="email"
              type="email"
              value={email}
              onChange={(
                event
              ) => {
                setEmail(
                  event.target
                    .value
                );
              }}
              placeholder="Enter your registered email"
              autoComplete="email"
              disabled={
                resendLoading
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={
              resendLoading
            }
          >
            {resendLoading ? (
              <>
                <span className="verify-email-button-spinner" />

                Sending new link...
              </>
            ) : (
              "Send new verification link"
            )}
          </button>
        </form>
      );
    };

  return (
    <main className="verify-email-page">
      <div className="verify-email-background" />

      <section className="verify-email-container">
        <Link
          className="verify-email-home-link"
          to="/"
        >
          ← Return to home
        </Link>

        <div className="verify-email-card">
          <BrandLogo
            className="verify-email-logo"
            to="/"
          />

          {verificationStatus ===
            "checking" && (
            <div className="verify-email-state">
              <div className="verify-email-spinner" />

              <span className="verify-email-eyebrow">
                Email verification
              </span>

              <h1>
                Verifying your email
              </h1>

              <p>
                Please wait while we
                securely verify your HHS
                email address.
              </p>

              <div className="verify-email-progress">
                <span />
              </div>
            </div>
          )}

          {verificationStatus ===
            "pending" && (
            <div className="verify-email-state">
              <div className="verify-email-success-icon">
                ✉
              </div>

              <span className="verify-email-eyebrow">
                Registration complete
              </span>

              <h1>
                Check your inbox
              </h1>

              <p>
                {verificationEmailSent
                  ? "We sent a verification link to your registered email address."
                  : "Your account was created, but the verification email may not have been delivered."}
              </p>

              <div className="verify-email-information success">
                <span>
                  ✓
                </span>

                <p>
                  Open the email from HHS
                  and select “Verify Email
                  Address”. The link
                  expires automatically
                  for your security.
                </p>
              </div>

              {email && (
                <p
                  style={{
                    margin:
                      "0 0 5px",
                    color:
                      "#294455",
                    fontSize:
                      "12px",
                    fontWeight:
                      800,
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {email}
                </p>
              )}

              {renderResendSection()}

              <Link
                className="verify-email-secondary-link"
                to="/login"
              >
                Return to login
              </Link>
            </div>
          )}

          {verificationStatus ===
            "success" && (
            <div className="verify-email-state">
              <div className="verify-email-success-icon">
                ✓
              </div>

              <span className="verify-email-eyebrow">
                Verification complete
              </span>

              <h1>
                Email verified
              </h1>

              <p>
                {
                  verificationMessage
                }
              </p>

              <div className="verify-email-information success">
                <span>
                  ✓
                </span>

                <p>
                  Your account is now
                  active and ready to use.
                  You can log in and start
                  exploring Hogenakkal
                  stays.
                </p>
              </div>

              <Link
                className="verify-email-primary-link"
                to="/login"
              >
                Continue to login
              </Link>

              <Link
                className="verify-email-secondary-link"
                to="/explore"
              >
                Explore properties
              </Link>
            </div>
          )}

          {verificationStatus ===
            "error" && (
            <div className="verify-email-state">
              <div className="verify-email-error-icon">
                !
              </div>

              <span className="verify-email-eyebrow error">
                Verification unsuccessful
              </span>

              <h1>
                Link unavailable
              </h1>

              <p>
                {
                  verificationMessage
                }
              </p>

              <div className="verify-email-information error">
                <span>
                  !
                </span>

                <p>
                  Verification links
                  expire automatically and
                  can only be used once.
                  Request a new link below.
                </p>
              </div>

              {renderResendSection()}

              <Link
                className="verify-email-secondary-link"
                to="/login"
              >
                Return to login
              </Link>
            </div>
          )}
        </div>

        <p className="verify-email-security-note">
          🔒 HHS verification links
          expire automatically for your
          account security.
        </p>
      </section>
    </main>
  );
}

export default VerifyEmail;