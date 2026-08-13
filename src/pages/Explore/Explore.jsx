import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getProperties,
  getPropertyApiErrorMessage,
} from "../../services/propertyService";
import usePropertyRealtime from "../../hooks/usePropertyRealtime";
import "./Explore.css";

const PROPERTY_TYPES = [
  "Homestay",
  "Hotel",
  "Resort",
  "Villa",
  "Cottage",
  "Guest House",
];

const VALID_OFFERS = [
  "family-vacation",
  "group-company-outing",
  "couple-retreat",
];

const PAGE_SIZE = 9;

const getCoverImage = (property) => {
  if (!Array.isArray(property?.images) || property.images.length === 0) {
    return "";
  }
  const coverImage = property.images.find((image) => image.isCover);
  return coverImage?.url || property.images[0]?.url || "";
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const formatRating = (rating) => {
  const numericRating = Number(rating);
  return Number.isFinite(numericRating) ? numericRating.toFixed(1) : "0.0";
};

function Explore() {
  const [searchParams] = useSearchParams();

  const requestedOfferCode = String(searchParams.get("offer") || "")
    .trim()
    .toLowerCase();

  const offerCode = VALID_OFFERS.includes(requestedOfferCode)
    ? requestedOfferCode
    : "";

  // Initialize filters directly from the URL parameters passed by the SearchBar
  const initialFilters = {
    search: searchParams.get("search") || "",
    propertyType: searchParams.get("propertyType") || "",
    priceRange: searchParams.get("priceRange") || "", 
    sort: searchParams.get("sort") || "newest",
    guests: searchParams.get("guests") || "",     // Hidden filter from SearchBar
    checkIn: searchParams.get("checkIn") || "",   // Hidden filter from SearchBar
    checkOut: searchParams.get("checkOut") || "", // Hidden filter from SearchBar
  };

  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);

  const getPropertyPath = (propertyId) => {
    const query = offerCode ? `?offer=${encodeURIComponent(offerCode)}` : "";
    return `/property/${propertyId}${query}`;
  };

  const loadProperties = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }
        setError("");

        const data = await getProperties({
          ...appliedFilters,
          page: currentPage,
          limit: PAGE_SIZE,
        });

        const responsePagination = data?.pagination || {};
        const responseTotalPages = Number(
          responsePagination.totalPages ?? data?.totalPages ?? 0
        );
        const responseTotalProperties = Number(
          responsePagination.totalProperties ??
            data?.totalProperties ??
            data?.count ??
            0
        );

        setProperties(Array.isArray(data?.properties) ? data.properties : []);
        setTotalPages(Math.max(responseTotalPages, 1));
        setTotalProperties(responseTotalProperties);
      } catch (requestError) {
        const message = getPropertyApiErrorMessage(
          requestError,
          "Unable to load properties."
        );
        setError(message);
        setProperties([]);
        setTotalPages(1);
        setTotalProperties(0);
        toast.error(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [appliedFilters, currentPage]
  );

  const handleRealtimePropertyChange = useCallback(() => {
    loadProperties(false);
  }, [loadProperties]);

  usePropertyRealtime(handleRealtimePropertyChange);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedFilters({
      ...filters,
      search: filters.search.trim(),
    });
  };

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      propertyType: "",
      priceRange: "",
      sort: "newest",
      guests: "",
      checkIn: "",
      checkOut: ""
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }
    setCurrentPage(nextPage);
    window.requestAnimationFrame(() => {
      document.getElementById("explore-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <div>
          <span className="explore-badge">Stay near Hogenakkal Falls</span>
          <h1>Find your perfect stay</h1>
          <p>
            Explore approved homestays, cottages, hotels and resorts around
            Hogenakkal.
          </p>
        </div>
      </section>

      <section className="explore-content">
        <form className="property-filters" onSubmit={handleSearch}>
          <div className="filter-field search-field">
            <label htmlFor="search">Property Name</label>
            <input
              id="search"
              name="search"
              type="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search by property name"
            />
          </div>

          <div className="filter-field">
            <label htmlFor="propertyType">Property type</label>
            <select
              id="propertyType"
              name="propertyType"
              value={filters.propertyType}
              onChange={handleChange}
            >
              <option value="">All types</option>
              {PROPERTY_TYPES.map((propertyType) => (
                <option key={propertyType} value={propertyType}>
                  {propertyType}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="priceRange">Price range</label>
            <select
              id="priceRange"
              name="priceRange"
              value={filters.priceRange}
              onChange={handleChange}
            >
              <option value="">Any price</option>
              <option value="priceLowToHigh">Low to High</option>
              <option value="priceHighToLow">High to Low</option>
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="sort">Sort by</label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleChange}
            >
              <option value="newest">Newest</option>
              <option value="topRated">Top rated</option>
              <option value="luxeriest">Luxeriest</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="search-button" type="submit">
              Search stays
            </button>
            <button
              className="reset-button"
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="explore-results-heading" id="explore-results">
          <div>
            <span className="results-eyebrow">Approved stays</span>
            <h2>Available properties</h2>
            <p>
              {totalProperties} {totalProperties === 1 ? "stay" : "stays"} found
            </p>
          </div>

          {!loading && totalProperties > 0 && (
            <span className="results-page-count">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="properties-loading">
            <div className="loading-spinner" />
            <p>Finding the best stays for you...</p>
          </div>
        ) : error ? (
          <div className="properties-empty properties-error">
            <div className="empty-icon">!</div>
            <h2>Unable to load properties</h2>
            <p>{error}</p>
            <button type="button" onClick={() => loadProperties()}>
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="properties-empty">
            <div className="empty-icon">⌂</div>
            <h2>No properties found</h2>
            <p>Try changing your search, price or guest filters.</p>
            <button type="button" onClick={handleReset}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="properties-grid">
              {properties.map((property) => {
                const coverImage = getCoverImage(property);
                const propertyPath = getPropertyPath(property._id);

                return (
                  <article className="explore-property-card" key={property._id}>
                    <Link
                      className="property-image-wrapper"
                      to={propertyPath}
                      aria-label={`View ${property.title}`}
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={property.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="property-image-placeholder">
                          <span>HHS</span>
                        </div>
                      )}

                      {property.isFeatured && (
                        <span className="featured-label">★ Featured</span>
                      )}

                      <span className="property-type-label">
                        {property.propertyType}
                      </span>
                    </Link>

                    <div className="property-card-body">
                      <div className="property-location">
                        <span aria-hidden="true">⌖</span>{" "}
                        {property.location?.city || "Hogenakkal"}
                        {property.location?.district
                          ? `, ${property.location.district}`
                          : ""}
                      </div>

                      <h3>
                        <Link to={propertyPath}>{property.title}</Link>
                      </h3>

                      <div className="property-details">
                        <span>Guests: {property.maxGuests}</span>
                        <span>Bedrooms: {property.bedrooms}</span>
                        <span>Bathrooms: {property.bathrooms}</span>
                      </div>

                      <div className="property-availability">
                        {property.availableRooms} of {property.totalRooms}{" "}
                        rooms available
                      </div>

                      <div className="property-card-footer">
                        <div className="property-price">
                          {Number(property.originalPrice) >
                            Number(property.pricePerNight) && (
                            <del>
                              {formatPrice(property.originalPrice)}
                            </del>
                          )}
                          <strong>
                            {formatPrice(property.pricePerNight)}
                          </strong>
                          <span>per night</span>
                        </div>

                        <div className="property-rating">
                          <span aria-hidden="true">★</span>{" "}
                          {formatRating(
                            property.rating ?? property.averageRating
                          )}
                        </div>
                      </div>

                      <Link className="view-property-button" to={propertyPath}>
                        View property
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className="property-pagination" aria-label="Property pages">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Explore;