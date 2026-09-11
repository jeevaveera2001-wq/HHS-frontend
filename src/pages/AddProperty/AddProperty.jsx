import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createProperty } from "../../services/propertyService";
import PropertySubmittedModal from "../propertySuccess/PropertySubmittedModal";
import "./AddProperty.css";

// Fix Leaflet marker icon asset paths broken by bundlers (Webpack/Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Force Leaflet to recalculate container dimensions on initial SPA route entry
function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Helper component to capture map clicks and move the pin
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Draggable map component
function MapPicker({ lat, lng, onChange }) {
  const initialLat = Number(lat) || 12.1226;
  const initialLng = Number(lng) || 77.777;

  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const markerRef = useRef(null);

  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat: Number(lat), lng: Number(lng) });
    }
  }, [lat, lng]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onChange]
  );

  const handleMapClick = (clickLat, clickLng) => {
    setPosition({ lat: clickLat, lng: clickLng });
    onChange(clickLat, clickLng);
  };

  return (
    <div className="map-picker-wrapper">
      <div className="map-picker-instructions">
        <span>📍 Drag the marker or click anywhere on the map to set the exact property location.</span>
      </div>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="leaflet-picker-container"
      >
        <MapResizeFix />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[position.lat, position.lng]}
          ref={markerRef}
        />
        <MapClickHandler onLocationSelect={handleMapClick} />
      </MapContainer>
    </div>
  );
}

const initialForm = {
  title: "",
  description: "",
  propertyType: "Homestay",
  address: "",
  city: "Hogenakkal",
  district: "Dharmapuri",
  state: "Tamil Nadu",
  pincode: "",
  latitude: 12.1226,
  longitude: 77.777,
  pricePerNight: "",
  originalPrice: "",
  maxGuests: "",
  bedrooms: "",
  bathrooms: "",
  totalRooms: "",
  availableRooms: "",
  amenities: "",
  rules: "",
  images: [],
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM",
};

function AddProperty() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLocationChange = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: Number(lat).toFixed(6),
      longitude: Number(lng).toFixed(6),
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleLocationChange(latitude, longitude);
        toast.success("Location detected successfully!");
      },
      () => {
        toast.error("Unable to retrieve your location. Please drop the pin manually.");
      }
    );
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };

  const splitValues = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.address.trim()
    ) {
      toast.error("Complete all required property fields.");
      return;
    }

    if (form.description.trim().length < 20) {
      toast.error("Property description must contain at least 20 characters.");
      return;
    }

    if (Number(form.availableRooms) > Number(form.totalRooms)) {
      toast.error("Available rooms cannot exceed total rooms.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("propertyType", form.propertyType);

      formData.append(
        "location",
        JSON.stringify({
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          coordinates: {
            lat: Number(form.latitude),
            lng: Number(form.longitude),
          },
        })
      );

      formData.append("pricePerNight", form.pricePerNight);
      formData.append("originalPrice", form.originalPrice);
      formData.append("maxGuests", form.maxGuests);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("totalRooms", form.totalRooms);
      formData.append("availableRooms", form.availableRooms);

      formData.append("amenities", JSON.stringify(splitValues(form.amenities)));
      formData.append("rules", JSON.stringify(splitValues(form.rules)));

      formData.append("checkInTime", form.checkInTime);
      formData.append("checkOutTime", form.checkOutTime);

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      const data = await createProperty(formData);

      toast.success(data?.message || "Property submitted successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to submit property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="add-property-page">
      {showSuccessModal && (
        <PropertySubmittedModal
          redirectPath="/owner/properties"
          delaySeconds={3}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      <div className="add-property-container">
        <header className="add-property-header">
          <span>HHS Property Management</span>
          <h1>Add a new property</h1>
          <p>Enter the stay details, pricing, rooms, location pin and images.</p>
        </header>

        <form className="add-property-form" onSubmit={handleSubmit}>
          {/* Section 01: Basic information */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>01</span>
              <div>
                <h2>Basic information</h2>
                <p>Tell guests about your property.</p>
              </div>
            </div>

            <div className="property-form-grid">
              <div className="property-form-field form-wide">
                <label htmlFor="title">Property title *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: River View Hogenakkal Homestay"
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="propertyType">Property type *</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                >
                  <option value="Homestay">Homestay</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Villa">Villa</option>
                  <option value="Cottage">Cottage</option>
                  <option value="Guest House">Guest House</option>
                </select>
              </div>

              <div className="property-form-field form-full">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Describe the property, surrounding area and guest experience..."
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 02: Location & Map Pin */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>02</span>
              <div>
                <h2>Location & Pin Placement</h2>
                <p>Pin the exact location for guest directions and explore cards.</p>
              </div>
            </div>

            <div className="property-form-grid">
              <div className="property-form-field form-full">
                <label htmlFor="address">Address *</label>
                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street name and landmark"
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="district">District *</label>
                <input
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="state">State *</label>
                <input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="636810"
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <div className="property-form-field form-full">
                <button
                  type="button"
                  className="detect-location-btn"
                  onClick={handleUseCurrentLocation}
                >
                  📍 Auto-detect My Device Location
                </button>
              </div>

              <div className="property-form-field form-full">
                <label>Exact Location Pin</label>
                <MapPicker
                  lat={form.latitude}
                  lng={form.longitude}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </section>

          {/* Section 03: Pricing and rooms */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>03</span>
              <div>
                <h2>Pricing and rooms</h2>
                <p>Configure capacity and room availability.</p>
              </div>
            </div>

            <div className="property-form-grid">
              <div className="property-form-field">
                <label htmlFor="pricePerNight">Price per night *</label>
                <input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  min="0"
                  value={form.pricePerNight}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="originalPrice">Original price</label>
                <input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="maxGuests">Maximum guests *</label>
                <input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  min="1"
                  value={form.maxGuests}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="bedrooms">Bedrooms *</label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="1"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="bathrooms">Bathrooms *</label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="1"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="totalRooms">Total rooms *</label>
                <input
                  id="totalRooms"
                  name="totalRooms"
                  type="number"
                  min="1"
                  value={form.totalRooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="availableRooms">Available rooms *</label>
                <input
                  id="availableRooms"
                  name="availableRooms"
                  type="number"
                  min="0"
                  value={form.availableRooms}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 04: Features and images */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>04</span>
              <div>
                <h2>Features and images</h2>
                <p>Separate multiple values using commas.</p>
              </div>
            </div>

            <div className="property-form-grid">
              <div className="property-form-field form-full">
                <label htmlFor="amenities">Amenities</label>
                <input
                  id="amenities"
                  name="amenities"
                  value={form.amenities}
                  onChange={handleChange}
                  placeholder="Wi-Fi, Parking, Breakfast, Air conditioning"
                />
              </div>

              <div className="property-form-field form-full">
                <label htmlFor="rules">Property rules</label>
                <input
                  id="rules"
                  name="rules"
                  value={form.rules}
                  onChange={handleChange}
                  placeholder="No smoking, No pets, Quiet after 10 PM"
                />
              </div>

              <div className="property-form-field form-full">
                <label htmlFor="images">Property Images</label>
                <input
                  id="images"
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <small>The first image will be used as the cover.</small>
              </div>

              <div className="property-form-field">
                <label htmlFor="checkInTime">Check-in time</label>
                <input
                  id="checkInTime"
                  name="checkInTime"
                  value={form.checkInTime}
                  onChange={handleChange}
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="checkOutTime">Check-out time</label>
                <input
                  id="checkOutTime"
                  name="checkOutTime"
                  value={form.checkOutTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <div className="property-form-actions">
            <button
              type="button"
              className="property-cancel-button"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="property-submit-button"
              disabled={submitting}
            >
              {submitting ? "Submitting property..." : "Create property"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddProperty;