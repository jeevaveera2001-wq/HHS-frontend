import {
  Link,
} from "react-router-dom";

import hhsLogo from "../../assets/images/hhs-logo-optimized.webp";

import "./BrandLogo.css";

function BrandLogo({
  to = "/",
  variant = "default",
  className = "",
  alt = "Hogenakkal Home Stays",
  loading = "eager",
  onClick,
}) {
  const logoClassName = [
    "hhs-brand-logo",
    `hhs-brand-logo--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const logoImage = (
    <img
      src={hhsLogo}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={
        loading === "eager"
          ? "high"
          : "auto"
      }
      draggable={false}
    />
  );

  if (!to) {
    return (
      <span
        className={logoClassName}
        aria-label={alt}
      >
        {logoImage}
      </span>
    );
  }

  return (
    <Link
      className={logoClassName}
      to={to}
      onClick={onClick}
      aria-label="Go to Hogenakkal Home Stays homepage"
    >
      {logoImage}
    </Link>
  );
}

export default BrandLogo;