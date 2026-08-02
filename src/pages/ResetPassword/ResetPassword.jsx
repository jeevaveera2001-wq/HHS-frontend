import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import {
  getAuthErrorMessage,
  resetPassword as resetUserPassword,
} from "../../services/authService";

import "./ResetPassword.css";

function ResetPassword() {
  const {
    token,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    formData,
    setFormData,
  ] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resetCompleted,
    setResetCompleted,
  ] = useState(false);

  const [
    resetError,
    setResetError,
  ] = useState("");

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

  const passwordChecks =
    useMemo(() => {
      const password =
        formData.newPassword;

      return {
        validLength:
          password.length >= 8 &&
          password.length <= 128,

        hasLetter:
          /[A-Za-z]/.test(
            password
          ),

        hasNumber:
          /[0-9]/.test(
            password
          ),

        passwordsMatch:
          Boolean(
            formData.confirmPassword
          ) &&
          password ===
            formData.confirmPassword,
      };
    }, [
      formData.newPassword,
      formData.confirmPassword,
    ]);

  const passwordStrength =
    useMemo(() => {
      const password =
        formData.newPassword;

      if (!password) {
        return {
          level: 0,
          label: "",
          className: "",
        };
      }

      let score = 0;

      if (password.length >= 8) {
        score += 1;
      }

      if (
        /[A-Za-z]/.test(
          password
        ) &&
        /[0-9]/.test(
          password
        )
      ) {
        score += 1;
      }

      if (
        /[A-Z]/.test(
          password
        ) &&
        /[a-z]/.test(
          password
        )
      ) {
        score += 1;
      }

      if (
        /[^A-Za-z0-9]/.test(
          password
        )
      ) {
        score += 1;
      }

      const strengthLevels = {
        1: {
          level: 1,
          label: "Weak",
          className: "weak",
        },

        2: {
          level: 2,
          label: "Fair",
          className: "fair",
        },

        3: {
          level: 3,
          label: "Good",
          className: "good",
        },

        4: {
          level: 4,
          label: "Strong",
          className: "strong",
        },
      };

      return (
        strengthLevels[score] ||
        strengthLevels[1]
      );
    }, [formData.newPassword]);

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

    if (resetError) {
      setResetError("");
    }
  };

  const validateForm = () => {
    if (
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error(
        "Complete both password fields."
      );

      return false;
    }

    if (
      !passwordChecks.validLength
    ) {
      toast.error(
        "Password must contain between 8 and 128 characters."
      );

      return false;
    }

    if (
      !passwordChecks.hasLetter ||
      !passwordChecks.hasNumber
    ) {
      toast.error(
        "Password must contain at least one letter and one number."
      );

      return false;
    }

    if (
      !passwordChecks.passwordsMatch
    ) {
      toast.error(
        "Passwords do not match."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!decodedToken) {
      setResetError(
        "The password reset link is invalid or incomplete."
      );

      toast.error(
        "Invalid password reset link."
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setResetError("");

      const response =
        await resetUserPassword(
          decodedToken,
          {
            newPassword:
              formData.newPassword,

            confirmPassword:
              formData.confirmPassword,
          }
        );

      setResetCompleted(true);

      setFormData({
        newPassword: "",
        confirmPassword: "",
      });

      toast.success(
        response?.message ||
          "Password reset successfully."
      );
    } catch (error) {
      const errorMessage =
        getAuthErrorMessage(
          error
        );

      setResetError(
        errorMessage
      );

      toast.error(
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  if (!decodedToken) {
    return (
      <main className="reset-password-page">
        <div className="reset-password-background" />

        <section className="reset-password-container">
          <div className="reset-password-card reset-password-invalid">
            <BrandLogo
              className="reset-password-logo"
              to="/"
            />

            <div className="reset-password-invalid-icon">
              !
            </div>

            <span className="reset-password-eyebrow">
              Invalid reset link
            </span>

            <h1>
              Link unavailable
            </h1>

            <p>
              This password reset link is
              incomplete or invalid. Request a
              new link to continue.
            </p>

            <Link
              className="reset-password-primary-link"
              to="/forgot-password"
            >
              Request another link
            </Link>

            <Link
              className="reset-password-text-link"
              to="/login"
            >
              Return to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="reset-password-page">
      <div className="reset-password-background" />

      <section className="reset-password-container">
        <Link
          className="reset-password-home-link"
          to="/"
        >
          ← Return to home
        </Link>

        <div className="reset-password-card">
          <BrandLogo
            className="reset-password-logo"
            to="/"
          />

          {resetCompleted ? (
            <div className="reset-password-success">
              <div className="reset-password-success-icon">
                ✓
              </div>

              <span className="reset-password-eyebrow">
                Password updated
              </span>

              <h1>
                Reset successful
              </h1>

              <p>
                Your HHS account password has
                been changed successfully. Your
                previous login sessions have
                also been secured.
              </p>

              <button
                className="reset-password-primary-button"
                type="button"
                onClick={
                  handleLoginRedirect
                }
              >
                Continue to login
              </button>

              <p className="reset-password-success-note">
                Use your new password the next
                time you log in.
              </p>
            </div>
          ) : (
            <>
              <span className="reset-password-eyebrow">
                Secure account recovery
              </span>

              <h1>
                Create new password
              </h1>

              <p className="reset-password-description">
                Choose a secure password that
                you have not previously used
                for your HHS account.
              </p>

              {resetError && (
                <div
                  className="reset-password-error"
                  role="alert"
                >
                  <span>!</span>

                  <div>
                    <strong>
                      Unable to reset password
                    </strong>

                    <p>
                      {resetError}
                    </p>
                  </div>
                </div>
              )}

              <form
                className="reset-password-form"
                onSubmit={
                  handleSubmit
                }
                noValidate
              >
                <label
                  htmlFor="newPassword"
                >
                  New password
                </label>

                <div className="reset-password-input-wrapper">
                  <span
                    className="reset-password-field-icon"
                    aria-hidden="true"
                  >
                    🔒
                  </span>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.newPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    minLength="8"
                    maxLength="128"
                    disabled={loading}
                    autoFocus
                    required
                  />

                  <button
                    type="button"
                    className="reset-password-visibility"
                    onClick={() => {
                      setShowNewPassword(
                        (previous) =>
                          !previous
                      );
                    }}
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                {formData.newPassword && (
                  <div className="reset-password-strength">
                    <div className="reset-password-strength-heading">
                      <span>
                        Password strength
                      </span>

                      <strong
                        className={
                          passwordStrength.className
                        }
                      >
                        {
                          passwordStrength.label
                        }
                      </strong>
                    </div>

                    <div className="reset-password-strength-bars">
                      {[1, 2, 3, 4].map(
                        (level) => (
                          <span
                            key={
                              level
                            }
                            className={
                              level <=
                              passwordStrength.level
                                ? passwordStrength.className
                                : ""
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                <label
                  htmlFor="confirmPassword"
                >
                  Confirm new password
                </label>

                <div className="reset-password-input-wrapper">
                  <span
                    className="reset-password-field-icon"
                    aria-hidden="true"
                  >
                    🔒
                  </span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    minLength="8"
                    maxLength="128"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="reset-password-visibility"
                    onClick={() => {
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      );
                    }}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                <div className="reset-password-requirements">
                  <span
                    className={
                      passwordChecks.validLength
                        ? "valid"
                        : ""
                    }
                  >
                    <i>
                      {passwordChecks.validLength
                        ? "✓"
                        : "○"}
                    </i>

                    8–128 characters
                  </span>

                  <span
                    className={
                      passwordChecks.hasLetter
                        ? "valid"
                        : ""
                    }
                  >
                    <i>
                      {passwordChecks.hasLetter
                        ? "✓"
                        : "○"}
                    </i>

                    At least one letter
                  </span>

                  <span
                    className={
                      passwordChecks.hasNumber
                        ? "valid"
                        : ""
                    }
                  >
                    <i>
                      {passwordChecks.hasNumber
                        ? "✓"
                        : "○"}
                    </i>

                    At least one number
                  </span>

                  <span
                    className={
                      passwordChecks.passwordsMatch
                        ? "valid"
                        : ""
                    }
                  >
                    <i>
                      {passwordChecks.passwordsMatch
                        ? "✓"
                        : "○"}
                    </i>

                    Passwords match
                  </span>
                </div>

                <button
                  className="reset-password-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="reset-password-spinner" />
                      Updating password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </form>

              <div className="reset-password-back">
                <Link to="/login">
                  ← Return to login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="reset-password-security-note">
          🔒 Password reset links can only be
          used once and expire automatically.
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;