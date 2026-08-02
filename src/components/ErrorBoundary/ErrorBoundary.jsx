import {
  Component,
} from "react";

import BrandLogo from "../BrandLogo/BrandLogo";

import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(
    error
  ) {
    return {
      hasError: true,

      errorMessage:
        error?.message ||
        "An unexpected application error occurred.",
    };
  }

  componentDidCatch(
    error,
    errorInformation
  ) {
    console.error(
      "HHS application error:",
      error
    );

    console.error(
      "Component stack:",
      errorInformation
        ?.componentStack
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReturnHome = () => {
    window.location.assign("/");
  };

  render() {
    if (
      this.state.hasError
    ) {
      const isChunkError =
        /chunk|dynamically imported module|failed to fetch/i.test(
          this.state.errorMessage
        );

      return (
        <main className="hhs-error-boundary">
          <section className="hhs-error-card">
            <BrandLogo
              className="hhs-error-logo"
              to="/"
            />

            <span className="hhs-error-eyebrow">
              HHS recovery centre
            </span>

            <h1>
              {isChunkError
                ? "An update is available"
                : "Something went wrong"}
            </h1>

            <p>
              {isChunkError
                ? "The website has been updated while this page was open. Reload the page to continue with the latest version."
                : "We could not display this page correctly. Your account and booking information have not been changed."}
            </p>

            <div className="hhs-error-actions">
              <button
                type="button"
                onClick={
                  this.handleReload
                }
              >
                Reload Page
              </button>

              <button
                type="button"
                className="secondary"
                onClick={
                  this.handleReturnHome
                }
              >
                Return Home
              </button>
            </div>

            <small>
              If this problem continues,
              contact{" "}

              <a href="mailto:hogenakkalhomestays@gmail.com">
                hogenakkalhomestays@gmail.com
              </a>
            </small>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;