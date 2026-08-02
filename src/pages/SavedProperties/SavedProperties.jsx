import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  getSavedProperties,
  removeSavedProperty,
} from "../../services/savedPropertyService";

import "./SavedProperties.css";

const propertyTypes = [
  "Homestay",
  "Hotel",
  "Resort",
  "Villa",
  "Cottage",
  "Guest House",
];

const initialPagination = {
  currentPage: 1,
  totalPages: 0,
  totalSavedProperties: 0,
  pageSize: 12,
  hasNextPage: false,
  hasPreviousPage: false,
};

const getErrorStatus = (
  error
) => {
  return (
    error?.status ||
    error?.response?.status ||
    0
  );
};

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.data?.message ||
    error?.response?.data
      ?.message ||
    error?.message ||
    fallbackMessage
  );
};

const getPropertyId = (
  property
) => {
  return (
    property?._id ||
    property?.id ||
    null
  );
};

const getCoverImage = (
  property
) => {
  const images =
    Array.isArray(
      property?.images
    )
      ? property.images
      : [];

  const coverImage =
    images.find((image) => {
      return (
        image?.isCover &&
        image?.url
      );
    });

  return (
    coverImage?.url ||
    images.find(
      (image) => image?.url
    )?.url ||
    null
  );
};

const formatCurrency = (
  amount
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount) || 0
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

function SavedProperties() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    properties,
    setProperties,
  ] = useState([]);

  const [
    statistics,
    setStatistics,
  ] = useState({
    totalSaved: 0,
    matchingSaved: 0,
  });

  const [
    pagination,
    setPagination,
  ] = useState(
    initialPagination
  );

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

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    propertyType,
    setPropertyType,
  ] = useState("all");

  const [
    sort,
    setSort,
  ] = useState("newest");

  const [
    page,
    setPage,
  ] = useState(1);

  const handleUnauthorized =
    useCallback(() => {
      logout();

      toast.error(
        "Your session has expired. Please log in again."
      );

      navigate("/login", {
        replace: true,

        state: {
          from:
            "/saved-properties",
        },
      });
    }, [
      logout,
      navigate,
    ]);

  const loadSavedProperties =
    useCallback(
      async (
        showInitialLoader = true
      ) => {
        try {
          if (
            showInitialLoader
          ) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const data =
            await getSavedProperties(
              {
                search,
                propertyType,
                sort,
                page,
                limit: 12,
              }
            );

          const returnedProperties =
            data?.properties ||
            data?.data
              ?.properties ||
            [];

          setProperties(
            Array.isArray(
              returnedProperties
            )
              ? returnedProperties
              : []
          );

          setStatistics({
            totalSaved:
              Number(
                data?.statistics
                  ?.totalSaved ??
                  data?.data
                    ?.statistics
                    ?.totalSaved
              ) || 0,

            matchingSaved:
              Number(
                data?.statistics
                  ?.matchingSaved ??
                  data?.data
                    ?.statistics
                    ?.matchingSaved
              ) || 0,
          });

          setPagination({
            ...initialPagination,

            ...(data?.pagination ||
              data?.data
                ?.pagination ||
              {}),
          });
        } catch (
          requestError
        ) {
          if (
            getErrorStatus(
              requestError
            ) === 401
          ) {
            handleUnauthorized();
            return;
          }

          if (
            getErrorStatus(
              requestError
            ) === 403
          ) {
            toast.error(
              "You cannot access saved properties with this account."
            );

            navigate("/", {
              replace: true,
            });

            return;
          }

          const message =
            getErrorMessage(
              requestError,
              "Unable to load your saved properties."
            );

          setProperties([]);

          setError(message);
        } finally {
          setLoading(false);

          setRefreshing(false);
        }
      },
      [
        handleUnauthorized,
        navigate,
        page,
        propertyType,
        search,
        sort,
      ]
    );

  useEffect(() => {
    loadSavedProperties(
      true
    );
  }, [loadSavedProperties]);

  const handleSearchSubmit =
    (event) => {
      event.preventDefault();

      setPage(1);

      setSearch(
        searchInput.trim()
      );
    };

  const handleClearFilters =
    () => {
      setSearchInput("");

      setSearch("");

      setPropertyType(
        "all"
      );

      setSort("newest");

      setPage(1);
    };

  const handleRemoveProperty =
    async (property) => {
      const propertyId =
        getPropertyId(
          property
        );

      if (!propertyId) {
        toast.error(
          "Invalid property ID."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Remove ${
            property.title ||
            "this property"
          } from your saved list?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setRemovingId(
          propertyId
        );

        const data =
          await removeSavedProperty(
            propertyId
          );

        toast.success(
          data?.message ||
            "Property removed from your saved list."
        );

        if (
          properties.length ===
            1 &&
          page > 1
        ) {
          setPage(
            (previous) =>
              Math.max(
                previous - 1,
                1
              )
          );
        } else {
          await loadSavedProperties(
            false
          );
        }
      } catch (
        requestError
      ) {
        if (
          getErrorStatus(
            requestError
          ) === 401
        ) {
          handleUnauthorized();
          return;
        }

        toast.error(
          getErrorMessage(
            requestError,
            "Unable to remove this saved property."
          )
        );
      } finally {
        setRemovingId(null);
      }
    };

  const hasActiveFilters =
    Boolean(search) ||
    propertyType !== "all" ||
    sort !== "newest";

  return (
    <main className="saved-properties-page">
      <header className="saved-properties-header">
        <div>
          <span>
            HHS personal collection
          </span>

          <h1>
            Saved Properties
          </h1>

          <p>
            Keep your favourite
            Hogenakkal stays together
            and return whenever you are
            ready to book.
          </p>
        </div>

        <div className="saved-properties-header-actions">
          <button
            type="button"
            onClick={() =>
              loadSavedProperties(
                false
              )
            }
            disabled={
              loading ||
              refreshing
            }
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <Link to="/explore">
            Explore more stays
          </Link>
        </div>
      </header>

      <section className="saved-properties-summary">
        <article>
          <span>♥</span>

          <div>
            <small>
              Total saved
            </small>

            <strong>
              {
                statistics.totalSaved
              }
            </strong>
          </div>
        </article>

        <article>
          <span>⌕</span>

          <div>
            <small>
              Matching results
            </small>

            <strong>
              {
                statistics.matchingSaved
              }
            </strong>
          </div>
        </article>

        <article>
          <span>👤</span>

          <div>
            <small>
              Saved by
            </small>

            <strong>
              {user?.fullName ||
                "HHS Guest"}
            </strong>
          </div>
        </article>
      </section>

      <section className="saved-properties-panel">
        <form
          className="saved-properties-filters"
          onSubmit={
            handleSearchSubmit
          }
        >
          <div className="saved-property-search">
            <label htmlFor="saved-property-search">
              Search saved stays
            </label>

            <div>
              <input
                id="saved-property-search"
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Property name, location or description"
              />

              <button type="submit">
                Search
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="saved-property-type">
              Property type
            </label>

            <select
              id="saved-property-type"
              value={
                propertyType
              }
              onChange={(
                event
              ) => {
                setPropertyType(
                  event.target
                    .value
                );

                setPage(1);
              }}
            >
              <option value="all">
                All property types
              </option>

              {propertyTypes.map(
                (type) => (
                  <option
                    value={type}
                    key={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label htmlFor="saved-property-sort">
              Sort by
            </label>

            <select
              id="saved-property-sort"
              value={sort}
              onChange={(
                event
              ) => {
                setSort(
                  event.target
                    .value
                );

                setPage(1);
              }}
            >
              <option value="newest">
                Recently saved
              </option>

              <option value="oldest">
                Oldest saved
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="saved-property-clear-filters"
              type="button"
              onClick={
                handleClearFilters
              }
            >
              Clear filters
            </button>
          )}
        </form>

        {loading ? (
          <div className="saved-properties-state">
            <div className="saved-properties-spinner" />

            <p>
              Loading your saved
              properties...
            </p>
          </div>
        ) : error ? (
          <div className="saved-properties-state error">
            <span>!</span>

            <h2>
              Unable to load saved
              properties
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                loadSavedProperties(
                  true
                )
              }
            >
              Try again
            </button>
          </div>
        ) : properties.length ===
          0 ? (
          <div className="saved-properties-state">
            <span>♡</span>

            <h2>
              {hasActiveFilters
                ? "No saved properties match your filters"
                : "No saved properties yet"}
            </h2>

            <p>
              {hasActiveFilters
                ? "Clear the filters or search using another property name."
                : "Explore HHS stays and use the heart button to save your favourites."}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
              >
                Clear filters
              </button>
            ) : (
              <Link to="/explore">
                Explore properties
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="saved-properties-grid">
              {properties.map(
                (property) => {
                  const propertyId =
                    getPropertyId(
                      property
                    );

                  const coverImage =
                    getCoverImage(
                      property
                    );

                  const removing =
                    removingId ===
                    propertyId;

                  return (
                    <article
                      className="saved-property-card"
                      key={
                        propertyId
                      }
                    >
                      <div className="saved-property-image">
                        {coverImage ? (
                          <img
                            src={
                              coverImage
                            }
                            alt={
                              property.title ||
                              "HHS property"
                            }
                            loading="lazy"
                          />
                        ) : (
                          <div>
                            HHS
                          </div>
                        )}

                        <span className="saved-property-type">
                          {property.propertyType ||
                            "Property"}
                        </span>

                        {property.isFeatured && (
                          <span className="saved-property-featured">
                            ★ Featured
                          </span>
                        )}

                        <button
                          className="saved-property-remove-icon"
                          type="button"
                          aria-label={`Remove ${
                            property.title ||
                            "property"
                          } from saved properties`}
                          title="Remove from saved properties"
                          disabled={
                            removing
                          }
                          onClick={() =>
                            handleRemoveProperty(
                              property
                            )
                          }
                        >
                          {removing
                            ? "…"
                            : "♥"}
                        </button>
                      </div>

                      <div className="saved-property-content">
                        <div className="saved-property-heading">
                          <div>
                            <span>
                              Saved{" "}
                              {formatDate(
                                property.savedAt
                              )}
                            </span>

                            <h2>
                              {property.title ||
                                "HHS Property"}
                            </h2>
                          </div>

                          <strong>
                            ★{" "}
                            {Number(
                              property.rating ||
                                0
                            ).toFixed(
                              1
                            )}
                          </strong>
                        </div>

                        <p className="saved-property-location">
                          📍{" "}
                          {property
                            .location
                            ?.address ||
                            "Hogenakkal"}

                          {property
                            .location
                            ?.city
                            ? `, ${property.location.city}`
                            : ""}
                        </p>

                        <p className="saved-property-description">
                          {property.description ||
                            "A comfortable HHS stay in Hogenakkal."}
                        </p>

                        <div className="saved-property-details">
                          <span>
                            {property.maxGuests ||
                              1}{" "}
                            guests
                          </span>

                          <span>
                            {property.bedrooms ||
                              1}{" "}
                            bedrooms
                          </span>

                          <span>
                            {property.availableRooms ||
                              0}{" "}
                            rooms left
                          </span>
                        </div>

                        {Array.isArray(
                          property.amenities
                        ) &&
                          property
                            .amenities
                            .length >
                            0 && (
                            <div className="saved-property-amenities">
                              {property.amenities
                                .slice(
                                  0,
                                  3
                                )
                                .map(
                                  (
                                    amenity
                                  ) => (
                                    <span
                                      key={
                                        amenity
                                      }
                                    >
                                      ✓{" "}
                                      {
                                        amenity
                                      }
                                    </span>
                                  )
                                )}
                            </div>
                          )}

                        <div className="saved-property-footer">
                          <div>
                            {Number(
                              property.originalPrice
                            ) >
                              Number(
                                property.pricePerNight
                              ) && (
                              <del>
                                {formatCurrency(
                                  property.originalPrice
                                )}
                              </del>
                            )}

                            <strong>
                              {formatCurrency(
                                property.pricePerNight
                              )}
                            </strong>

                            <span>
                              per night
                            </span>
                          </div>

                          <Link
                            to={`/property/${propertyId}`}
                          >
                            View property
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            {pagination.totalPages >
              1 && (
              <div className="saved-properties-pagination">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage ||
                    loading
                  }
                  onClick={() => {
                    setPage(
                      (
                        previous
                      ) =>
                        Math.max(
                          previous -
                            1,
                          1
                        )
                    );

                    window.scrollTo(
                      {
                        top: 0,
                        behavior:
                          "smooth",
                      }
                    );
                  }}
                >
                  Previous
                </button>

                <span>
                  Page{" "}
                  {
                    pagination.currentPage
                  }{" "}
                  of{" "}
                  {
                    pagination.totalPages
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage ||
                    loading
                  }
                  onClick={() => {
                    setPage(
                      (
                        previous
                      ) =>
                        Math.min(
                          previous +
                            1,
                          pagination.totalPages
                        )
                    );

                    window.scrollTo(
                      {
                        top: 0,
                        behavior:
                          "smooth",
                      }
                    );
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default SavedProperties;