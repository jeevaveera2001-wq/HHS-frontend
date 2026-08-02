import {
  useEffect,
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
  loginUser,
} from "../../services/authService";

import getDashboardPath, {
  normalizeRole,
} from "../../utils/getDashboardPath";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import "./Login.css";

const initialFormData = {
  email: "",
  password: "",
};

/* =====================================
   Clear authentication storage
===================================== */

const clearAuthenticationStorage =
  () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    sessionStorage.removeItem(
      "token"
    );

    sessionStorage.removeItem(
      "user"
    );
  };

/* =====================================
   Get stored authentication
===================================== */

const getStoredAuthentication =
  () => {
    const localToken =
      localStorage.getItem(
        "token"
      );

    const localUser =
      localStorage.getItem(
        "user"
      );

    if (
      localToken &&
      localUser
    ) {
      return {
        token: localToken,
        user: localUser,
      };
    }

    const sessionToken =
      sessionStorage.getItem(
        "token"
      );

    const sessionUser =
      sessionStorage.getItem(
        "user"
      );

    if (
      sessionToken &&
      sessionUser
    ) {
      return {
        token: sessionToken,
        user: sessionUser,
      };
    }

    return null;
  };

/* =====================================
   Store successful authentication
===================================== */

const storeAuthentication = ({
  token,
  user,
  rememberMe,
}) => {
  if (!token || !user) {
    throw new Error(
      "Authentication information is incomplete."
    );
  }

  clearAuthenticationStorage();

  const storage =
    rememberMe
      ? localStorage
      : sessionStorage;

  storage.setItem(
    "token",
    token
  );

  storage.setItem(
    "user",
    JSON.stringify(
      user
    )
  );

  /*
   * Confirm that the browser actually
   * persisted both values.
   */

  const persistedToken =
    storage.getItem(
      "token"
    );

  const persistedUser =
    storage.getItem(
      "user"
    );

  if (
    !persistedToken ||
    !persistedUser
  ) {
    clearAuthenticationStorage();

    throw new Error(
      "Unable to save your login session in this browser."
    );
  }
};

function Login() {
  const navigate =
    useNavigate();

  const [
    formData,
    setFormData,
  ] = useState(
    initialFormData
  );

  const [
    rememberMe,
    setRememberMe,
  ] = useState(true);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =====================================
     Redirect an existing session
  ===================================== */

  useEffect(() => {
    const storedAuthentication =
      getStoredAuthentication();

    if (
      !storedAuthentication
    ) {
      return;
    }

    try {
      const storedUser =
        JSON.parse(
          storedAuthentication.user
        );

      const destination =
        getDashboardPath(
          storedUser?.role
        );

      window.location.replace(
        destination
      );
    } catch (error) {
      console.error(
        "Invalid stored authentication:",
        error
      );

      clearAuthenticationStorage();
    }
  }, []);

  /* =====================================
     Handle input
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
     Validate login form
  ===================================== */

  const validateForm = () => {
    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    if (!email || !password) {
      toast.error(
        "Please enter your email and password."
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

    if (
      password.length < 6
    ) {
      toast.error(
        "Password must contain at least 6 characters."
      );

      return null;
    }

    return {
      email,
      password,
    };
  };

  /* =====================================
     Login submission
  ===================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const credentials =
      validateForm();

    if (!credentials) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await loginUser(
          credentials
        );

      if (
        !data?.success ||
        !data?.token ||
        !data?.user
      ) {
        throw new Error(
          "Invalid login response from the server."
        );
      }

      const normalizedRole =
        normalizeRole(
          data.user.role
        );

      const authenticatedUser = {
        ...data.user,
        role: normalizedRole,
      };

      /*
       * Save authentication directly.
       */

      storeAuthentication({
        token:
          data.token,

        user:
          authenticatedUser,

        rememberMe,
      });

      const destination =
        getDashboardPath(
          normalizedRole
        );

      toast.success(
        `Welcome back, ${
          authenticatedUser.fullName ||
          "User"
        }!`
      );

      /*
       * A full navigation allows AuthProvider
       * to initialize from the saved session.
       */

      window.location.replace(
        destination
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      const responseData =
        error.response?.data ||
        error.data ||
        {};

      if (
        responseData.code ===
          "EMAIL_NOT_VERIFIED" ||
        responseData
          .requiresEmailVerification
      ) {
        toast.info(
          responseData.message ||
            "Please verify your email address."
        );

        navigate(
          "/verify-email",
          {
            replace: true,

            state: {
              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              message:
                responseData.message,
            },
          }
        );

        return;
      }

      const message =
        responseData.message ||
        error.message ||
        "Unable to login. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper">
      <section className="login-visual">
        <div className="login-brand-area">
          <BrandLogo
            to="/"
            variant="auth"
            className="login-page-logo"
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

        <div className="visual-content">
          <span className="auth-page-eyebrow">
            Discover Hogenakkal
          </span>

          <h1>
            Find Your
            <br />
            Perfect Escape
          </h1>

          <p>
            Leave the stress behind and
            discover peaceful stays near
            the beautiful Hogenakkal
            Falls.
          </p>
        </div>

        <div className="travel-message">
          <h3>
            Explore Nature
          </h3>

          <h2>
            Relax.
            <br />
            Recharge.
            <br />
            Reconnect.
          </h2>

          <p>
            Experience comfortable
            stays, breathtaking views
            and peaceful moments
            surrounded by nature.
          </p>

          <div className="travel-features">
            <span>
              Luxury Stay
            </span>

            <span>
              Nature View
            </span>

            <span>
              Peaceful Escape
            </span>
          </div>
        </div>
      </section>

      <section className="login-area">
        <form
          className="login-card"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="login-card-heading">
            <span className="login-card-badge">
              Secure Guest Access
            </span>

            <h1>
              Welcome Back
            </h1>

            <p>
              Login to continue your
              Hogenakkal journey.
            </p>
          </div>

          <div className="login-form-group">
            <label htmlFor="login-email">
              Email address
            </label>

            <input
              id="login-email"
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
              disabled={
                loading
              }
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">
              Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                disabled={
                  loading
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                disabled={
                  loading
                }
                onClick={() => {
                  setShowPassword(
                    (previous) =>
                      !previous
                  );
                }}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={
                  showPassword
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          <div className="options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={
                  rememberMe
                }
                disabled={
                  loading
                }
                onChange={(event) => {
                  setRememberMe(
                    event.target.checked
                  );
                }}
              />

              <span>
                Remember me
              </span>
            </label>

            <Link
              className="forgot-password-button"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={
              loading
            }
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          <div className="divider">
            <span />

            <small>
              OR
            </small>

            <span />
          </div>

          <button
            type="button"
            className="google-login"
            disabled={
              loading
            }
            onClick={() => {
              toast.info(
                "Google login will be available soon."
              );
            }}
          >
            Continue with Google
          </button>

          <p className="register">
            Don&apos;t have an account?

            <Link to="/register">
              Create Account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;