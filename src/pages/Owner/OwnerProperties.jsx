import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  deleteProperty,
  getMyProperties,
} from "../../services/propertyService";

import "./OwnerProperties.css";

const approvalLabels = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

function OwnerProperties() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionId, setActionId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const handleUnauthorized =
    useCallback(() => {
      logout();

      toast.error(
        "Your session has expired."
      );

      navigate("/login", {
        replace: true,
      });
    }, [logout, navigate]);

  const loadProperties =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getMyProperties();
         console.log("Fetched properties:", data);
        setProperties(
          data.properties || []
        );
      } catch (error) {
        if (error.status === 401) {
          handleUnauthorized();
          return;
        }

        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }, [handleUnauthorized]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filteredProperties =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return properties.filter(
        (property) => {
          const matchesStatus =
            statusFilter === "all" ||
            property.approvalStatus ===
              statusFilter;

          const searchableText = [
            property.title,
            property.propertyType,
            property.location?.city,
            property.location?.district,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return (
            matchesStatus &&
            (!normalizedSearch ||
              searchableText.includes(
                normalizedSearch
              ))
          );
        }
      );
    }, [
      properties,
      search,
      statusFilter,
    ]);

  const counts = useMemo(() => {
    return properties.reduce(
      (result, property) => {
        result.total += 1;

        if (
          property.approvalStatus ===
          "pending"
        ) {
          result.pending += 1;
        }

        if (
          property.approvalStatus ===
          "approved"
        ) {
          result.approved += 1;
        }

        if (
          property.approvalStatus ===
          "rejected"
        ) {
          result.rejected += 1;
        }

        if (!property.isActive) {
          result.inactive += 1;
        }

        return result;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        inactive: 0,
      }
    );
  }, [properties]);

  // const getCoverImage = (property) => {
  //   const images =
  //     property.images || [];

  //   const coverImage = images.find(
  //     (image) => image.isCover
  //   );

  //   return (
  //     coverImage?.url ||
  //     images[0]?.url ||
  //     null
  //   );
  // };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount || 0);
  };

  const handleDeactivate = async (
    property
  ) => {
    const confirmed = window.confirm(
      `Remove "${property.title}" from HHS?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(property._id);

      const data = await deleteProperty(
        property._id
      );

      setProperties((previous) =>
        previous.map((item) =>
          item._id === property._id
            ? {
                ...item,
                isActive: false,
              }
            : item
        )
      );

      toast.success(data.message);
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  const BASE_URL = import.meta.env.PROD
  ? "https://hhs-backend-cwzx.onrender.com"
  : "http://localhost:5000";

  return (
    <main className="owner-properties-page">
      <header className="owner-properties-header">
        <div>
          <Link
            className="owner-properties-back"
            to="/owner"
          >
            ← Owner Dashboard
          </Link>

          <span>
            HHS Property Portfolio
          </span>

          <h1>My Properties</h1>

          <p>
            View your property approval, availability
            and listing status.
          </p>
        </div>

        <Link
          className="owner-add-property"
          to="/add-property"
        >
          + Add new property
        </Link>
      </header>

      <section className="owner-property-summary">
        <button
          type="button"
          className={
            statusFilter === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter("all")
          }
        >
          <span>Total properties</span>
          <strong>{counts.total}</strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "pending"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter("pending")
          }
        >
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "approved"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter("approved")
          }
        >
          <span>Approved</span>
          <strong>
            {counts.approved}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "rejected"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter("rejected")
          }
        >
          <span>Rejected</span>
          <strong>
            {counts.rejected}
          </strong>
        </button>

        <article>
          <span>Inactive</span>
          <strong>
            {counts.inactive}
          </strong>
        </article>
      </section>

      <section className="owner-properties-panel">
        <div className="owner-properties-toolbar">
          <div>
            <label htmlFor="owner-property-search">
              Search properties
            </label>

            <input
              id="owner-property-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Property name, type or location"
            />
          </div>

          <button
            type="button"
            onClick={loadProperties}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="owner-properties-state">
            <div className="owner-properties-spinner" />
            <p>Loading your properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="owner-properties-state">
            <span>🏡</span>

            <h2>No properties found</h2>

            <p>
              Create your first HHS property
              listing.
            </p>

            <Link to="/add-property">
              Add property
            </Link>
          </div>
        ) : (
          <div className="owner-properties-grid">
            {filteredProperties.map(
              (property) => {
                const updating =
                  actionId === property._id;

                return (
                  <article
                    className="owner-managed-property"
                    key={property._id}
                  >
                    <div className="owner-managed-image">
                      {property.images[0].url ? (
                        <img
                          src={property.images[0].url ? `${BASE_URL}${property.images[0].url}` : "/images/no-image.png"}
                          alt={property.title}
                        />
                      ) : (
                        <div>HHS</div>
                      )}

                      <span
                        className={`owner-approval-badge ${property.approvalStatus}`}
                      >
                        {approvalLabels[
                          property
                            .approvalStatus
                        ] ||
                          property.approvalStatus}
                      </span>

                      {!property.isActive && (
                        <span className="owner-inactive-badge">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="owner-managed-content">
                      <span className="owner-managed-type">
                        {property.propertyType}
                      </span>

                      <h2>
                        {property.title}
                      </h2>

                      <p>
                        📍{" "}
                        {property.location
                          ?.city ||
                          "Hogenakkal"}
                        ,{" "}
                        {property.location
                          ?.district ||
                          "Dharmapuri"}
                      </p>

                      <div className="owner-managed-details">
                        <span>
                          {
                            property.totalRooms
                          }{" "}
                          rooms
                        </span>

                        <span>
                          {
                            property.availableRooms
                          }{" "}
                          available
                        </span>

                        <span>
                          {
                            property.maxGuests
                          }{" "}
                          guests
                        </span>
                      </div>

                      <div className="owner-managed-footer">
                        <div>
                          <span>
                            Price per night
                          </span>

                          <strong>
                            {formatCurrency(
                              property.pricePerNight
                            )}
                          </strong>
                        </div>

                        <div className="owner-managed-actions">
                          {property.approvalStatus ===
                            "approved" &&
                            property.isActive && (
                              <Link
                                to={`/property/${property._id}`}
                              >
                                View
                              </Link>
                            )}

                          {property.isActive && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                handleDeactivate(
                                  property
                                )
                              }
                            >
                              {updating
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default OwnerProperties;