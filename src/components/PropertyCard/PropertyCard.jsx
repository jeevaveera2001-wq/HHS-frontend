import { FaStar, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";

function PropertyCard({ property }) {
  if (!property) return null;

  // 1. Resolve Display Image (handles images array or flat property.image)
  const displayImage =
    property.image ||
    property.images?.[0]?.url ||
    (typeof property.images?.[0] === "string" ? property.images[0] : null) ||
    "/placeholder-stay.jpg";

  // 2. Resolve Display Name/Title
  const displayName = property.name || property.title || "Homestay Property";

  // 3. Resolve Display Location Text
  const locationText =
    typeof property.location === "string"
      ? property.location
      : [property.location?.city, property.location?.district]
          .filter(Boolean)
          .join(", ") || "Hogenakkal, Tamil Nadu";

  // 4. Resolve Price
  const displayPrice =
    property.price ?? property.pricePerNight ?? "N/A";

  // 5. Construct Exact Google Maps URL from Pinned Coordinates
  const getGoogleMapsLink = () => {
    const coords =
      typeof property.location === "object"
        ? property.location?.coordinates
        : null;

    const lat = coords?.lat ?? coords?.latitude;
    const lng = coords?.lng ?? coords?.longitude;

    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    // Fallback query if coordinates are absent
    const fallbackQuery =
      typeof property.location === "string"
        ? property.location
        : [
            property.location?.address,
            property.location?.city,
            property.location?.district,
            property.location?.state,
          ]
            .filter(Boolean)
            .join(", ");

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fallbackQuery || displayName
    )}`;
  };

  const googleMapsUrl = getGoogleMapsLink();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col justify-between">
      <div>
        <div className="relative">
          <img
            src={displayImage}
            alt={displayName}
            className="w-full h-60 object-cover"
            loading="lazy"
          />

          <button
            type="button"
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow hover:bg-white transition"
            aria-label="Save property"
          >
            <FaHeart className="text-red-500 text-sm" />
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
            {displayName}
          </h3>

          {/* Location & Google Maps Direct Pin Action */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="flex items-center gap-1.5 text-gray-500 text-sm truncate">
              <FaMapMarkerAlt className="text-red-500 shrink-0" />
              <span className="truncate">{locationText}</span>
            </p>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-600 hover:text-white transition shrink-0 shadow-sm"
              title="Open pinned location on Google Maps"
            >
              <SiGooglemaps className="text-xs" />
              <span>Map</span>
            </a>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="flex items-center gap-1.5 text-yellow-500 font-semibold text-sm">
              <FaStar />
              <span>{property.rating || "4.8"}</span>
              {property.totalReviews ? (
                <span className="text-gray-400 font-normal">
                  ({property.totalReviews})
                </span>
              ) : null}
            </span>

            <span className="text-blue-700 font-bold text-xl">
              ₹{displayPrice}
              <span className="text-gray-500 text-sm font-normal">
                {" "}/night
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default PropertyCard;