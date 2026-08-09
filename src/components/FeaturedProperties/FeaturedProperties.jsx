import "./FeaturedProperties.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
} from "react-icons/fa";

import {
  getFeaturedProperties,
  getPropertyApiErrorMessage,
} from "../../services/propertyService";

import usePropertyRealtime from "../../hooks/usePropertyRealtime";

/* =====================================
   Get property cover image
===================================== */

const getCoverImage = (
  property
) => {
  const images = Array.isArray(
    property?.images
  )
    ? property.images
    : [];

  if (images.length === 0) {
    return "";
  }

  return (
    images.find(
      (image) =>
        image?.isCover &&
        image?.url
    )?.url ||
    images.find(
      (image) => image?.url
    )?.url ||
    ""
  );
};

/* =====================================
   Format property price
===================================== */

const formatPrice = (
  price
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(price) || 0
  );
};

/* =====================================
   Format property rating
===================================== */

const formatRating = (
  rating
) => {
  const numericRating =
    Number(rating);

  if (
    !Number.isFinite(
      numericRating
    ) ||
    numericRating <= 0
  ) {
    return "New";
  }

  return numericRating.toFixed(1);
};

/* =====================================
   Get property location
===================================== */

const getPropertyLocation = (
  property
) => {
  const location =
    property?.location;

  if (
    typeof location === "string"
  ) {
    return location;
  }

  const locationParts = [
    location?.city,
    location?.district,
  ].filter(Boolean);

  return (
    locationParts.join(", ") ||
    "Hogenakkal, Tamil Nadu"
  );
};

/* =====================================
   Extract properties from API response
===================================== */

const extractProperties = (
  response
) => {
  const propertyList =
    response?.properties ||
    response?.data?.properties ||
    response?.data ||
    [];

  return Array.isArray(
    propertyList
  )
    ? propertyList
    : [];
};

/* =====================================
   Featured Properties component
===================================== */

function FeaturedProperties() {
  const [
    properties,
    setProperties,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================
     Load featured properties
  ===================================== */

  const loadFeaturedProperties =
    useCallback(
      async (
        showMainLoader = true
      ) => {
        try {
          if (showMainLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const response =
            await getFeaturedProperties(
              6
            );

          const propertyList =
            extractProperties(
              response
            );

          /*
           * Additional frontend safety:
           * only display approved, active
           * and featured properties.
           */
          const validProperties =
            propertyList.filter(
              (property) => {
                const approved =
                  !property
                    ?.approvalStatus ||
                  property
                    .approvalStatus ===
                    "approved";

                const active =
                  property?.isActive !==
                    false &&
                  property?.status !==
                    "inactive";

                const featured =
                  property
                    ?.isFeatured !==
                  false;

                return (
                  approved &&
                  active &&
                  featured
                );
              }
            );

          setProperties(
            validProperties
          );
        } catch (
          requestError
        ) {
          const message =
            getPropertyApiErrorMessage(
              requestError,
              "Unable to load featured properties."
            );

          console.error(
            "Load featured properties error:",
            requestError
          );

          setError(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /* =====================================
     Initial API request
  ===================================== */

  useEffect(() => {
    loadFeaturedProperties();
  }, [
    loadFeaturedProperties,
  ]);

  /* =====================================
     Realtime property updates
  ===================================== */

  usePropertyRealtime(
    useCallback(
      (eventData) => {
        console.log(
          "Featured property realtime update:",
          eventData
        );

        /*
         * Refetching is safer than manually
         * modifying state because the backend
         * decides which properties are public
         * and featured.
         */
        loadFeaturedProperties(
          false
        );
      },
      [
        loadFeaturedProperties,
      ]
    )
  );

  /* =====================================
     Loading state
  ===================================== */

  if (loading) {
    return (
      <section className="featured-section">
        <div className="featured-container">
          <header className="featured-heading">
            <span>
              FEATURED STAYS
            </span>

            <h2>
              Recommended Properties
            </h2>

            <p>
              Loading verified stays near
              Hogenakkal Falls.
            </p>
          </header>

          <div className="featured-loading-grid">
            {Array.from({
              length: 3,
            }).map(
              (_, index) => (
                <div
                  className="featured-skeleton"
                  key={index}
                >
                  <div className="featured-skeleton-image" />

                  <div className="featured-skeleton-content">
                    <span />
                    <strong />
                    <p />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  /* =====================================
     Error state
  ===================================== */

  if (
    error &&
    properties.length === 0
  ) {
    return (
      <section className="featured-section">
        <div className="featured-container">
          <header className="featured-heading">
            <span>
              FEATURED STAYS
            </span>

            <h2>
              Recommended Properties
            </h2>
          </header>

          <div className="featured-state-card">
            <h3>
              Featured stays are
              temporarily unavailable
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadFeaturedProperties()
              }
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* =====================================
     Empty state
  ===================================== */

  if (
    properties.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="featured-section"
      aria-labelledby="featured-properties-title"
    >
      <div className="featured-container">
        {/* Section heading */}

        <header className="featured-heading">
          <div>
            <span>
              FEATURED STAYS
            </span>

            <h2 id="featured-properties-title">
              Recommended Properties
            </h2>
          </div>

          <div className="featured-heading-action">
            {refreshing && (
              <small>
                Updating stays...
              </small>
            )}

            <Link to="/explore">
              View All Stays

              <FaArrowRight
                aria-hidden="true"
              />
            </Link>
          </div>
        </header>

        {/* Property cards */}

        <div className="featured-grid">
          {properties.map(
            (property) => {
              const coverImage =
                getCoverImage(
                  property
                );

              const rating =
                formatRating(
                  property
                    ?.averageRating
                );

              return (
                <article
                  className="featured-card"
                  key={property._id}
                >
                  <Link
                    className="featured-card-image"
                    to={`/property/${property._id}`}
                    aria-label={`View ${property.title}`}
                  >
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={
                          property.title
                        }
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="featured-image-placeholder">
                        <strong>
                          HHS
                        </strong>

                        <span>
                          Property image
                          coming soon
                        </span>
                      </div>
                    )}

                    <div className="featured-image-overlay" />

                    <span className="featured-property-type">
                      {property
                        .propertyType ||
                        "Stay"}
                    </span>

                    <span className="featured-badge">
                      Featured
                    </span>
                  </Link>

                  <div className="featured-card-content">
                    <div className="featured-location">
                      <FaMapMarkerAlt
                        aria-hidden="true"
                      />

                      <span>
                        {getPropertyLocation(
                          property
                        )}
                      </span>
                    </div>

                    <Link
                      className="featured-title-link"
                      to={`/property/${property._id}`}
                    >
                      <h3>
                        {property.title}
                      </h3>
                    </Link>

                    {property.description && (
                      <p className="featured-description">
                        {
                          property.description
                        }
                      </p>
                    )}

                    <div className="featured-card-meta">
                      <div className="featured-guests">
                        <FaUsers
                          aria-hidden="true"
                        />

                        <span>
                          Up to{" "}
                          {Number(
                            property.maxGuests
                          ) || 1}{" "}
                          guests
                        </span>
                      </div>

                      <div className="featured-rating">
                        <FaStar
                          aria-hidden="true"
                        />

                        <span>
                          {rating}
                        </span>
                      </div>
                    </div>

                    <div className="featured-card-footer">
                      <div className="featured-price">
                        <strong>
                          {formatPrice(
                            property
                              .pricePerNight
                          )}
                        </strong>

                        <span>
                          / night
                        </span>
                      </div>

                      <Link
                        className="featured-view-button"
                        to={`/property/${property._id}`}
                      >
                        View Stay

                        <FaArrowRight
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>

        {/* Mobile view-all button */}

        <div className="featured-mobile-action">
          <Link to="/explore">
            Explore All Properties

            <FaArrowRight
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProperties;