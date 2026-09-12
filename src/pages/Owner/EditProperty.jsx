import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getPropertyForEdit, updateProperty } from "../../services/propertyService";
import "../AddProperty/AddProperty.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

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

  return (
    <div className="map-picker-wrapper">
      <div className="map-picker-instructions">
        <span>📍 Drag marker or click map to update property location.</span>
      </div>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="leaflet-picker-container"
      >
        <MapResizeFix />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[position.lat, position.lng]}
          ref={markerRef}
        />
        <MapClickHandler onLocationSelect={(cLat, cLng) => {
          setPosition({ lat: cLat, lng: cLng });
          onChange(cLat, cLng);
        }} />
      </MapContainer>
    </div>
  );
}

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getPropertyForEdit(id);
        const prop = data.property;

        setExistingImages(prop.images || []);
        setForm({
          title: prop.title || "",
          description: prop.description || "",
          propertyType: prop.propertyType || "Homestay",
          address: prop.location?.address || "",
          city: prop.location?.city || "Hogenakkal",
          district: prop.location?.district || "Dharmapuri",
          state: prop.location?.state || "Tamil Nadu",
          pincode: prop.location?.pincode || "",
          latitude: prop.location?.coordinates?.lat ?? prop.location?.coordinates?.latitude ?? 12.1226,
          longitude: prop.location?.coordinates?.lng ?? prop.location?.coordinates?.longitude ?? 77.7770,
          pricePerNight: prop.pricePerNight || "",
          originalPrice: prop.originalPrice || "",
          maxGuests: prop.maxGuests || "",
          bedrooms: prop.bedrooms || "",
          bathrooms: prop.bathrooms || "",
          totalRooms: prop.totalRooms || "",
          availableRooms: prop.availableRooms || "",
          amenities: Array.isArray(prop.amenities) ? prop.amenities.join(", ") : "",
          rules: Array.isArray(prop.rules) ? prop.rules.join(", ") : "",
          checkInTime: prop.checkInTime || "12:00 PM",
          checkOutTime: prop.checkOutTime || "11:00 AM",
        });
      } catch (err) {
        toast.error(err?.data?.message || err.message || "Failed to load property.");
        navigate("/owner/properties");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: Number(lat).toFixed(6),
      longitude: Number(lng).toFixed(6),
    }));
  };

  const handleNewImagesChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const splitValues = (val) => {
    return val.split(",").map((i) => i.trim()).filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.address.trim()) {
      toast.error("Please complete all required fields.");
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
      formData.append("originalPrice", form.originalPrice || "");
      formData.append("maxGuests", form.maxGuests);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("totalRooms", form.totalRooms);
      formData.append("availableRooms", form.availableRooms);

      formData.append("amenities", JSON.stringify(splitValues(form.amenities)));
      formData.append("rules", JSON.stringify(splitValues(form.rules)));
      formData.append("checkInTime", form.checkInTime);
      formData.append("checkOutTime", form.checkOutTime);

      // Keep existing images that weren't deleted
      formData.append("images", JSON.stringify(existingImages));

      // Append newly uploaded files
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      const res = await updateProperty(id, formData);
      toast.success(res?.message || "Property updated successfully!");
      navigate("/owner/properties");
    } catch (err) {
      toast.error(err?.data?.message || err.message || "Failed to update property.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <main className="add-property-page">
        <div className="property-details-state">
          <div className="property-details-spinner" />
          <p>Loading property details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="add-property-page">
      <div className="add-property-container">
        <header className="add-property-header">
          <span>HHS Property Management</span>
          <h1>Edit Property Details</h1>
          <p>Update pricing, availability, description, map pin, or add new photos.</p>
        </header>

        <form className="add-property-form" onSubmit={handleSubmit}>
          {/* Section 01: Basic Details */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>01</span>
              <div>
                <h2>Basic information</h2>
                <p>Update name and description.</p>
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
                  rows="6"
                  value={form.description}
                  onChange={handleChange}
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
                <h2>Location & Map Pin</h2>
                <p>Adjust the address or drag the pin on the map.</p>
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
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="city">City *</label>
                <input id="city" name="city" value={form.city} onChange={handleChange} required />
              </div>

              <div className="property-form-field">
                <label htmlFor="district">District *</label>
                <input id="district" name="district" value={form.district} onChange={handleChange} required />
              </div>

              <div className="property-form-field">
                <label htmlFor="state">State *</label>
                <input id="state" name="state" value={form.state} onChange={handleChange} required />
              </div>

              <div className="property-form-field">
                <label htmlFor="pincode">Pincode</label>
                <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} />
              </div>

              <div className="property-form-field form-full">
                <label>Exact Location Pin</label>
                <MapPicker lat={form.latitude} lng={form.longitude} onChange={handleLocationChange} />
              </div>
            </div>
          </section>

          {/* Section 03: Pricing and Capacity */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>03</span>
              <div>
                <h2>Pricing and rooms</h2>
                <p>Update room availability and rates.</p>
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

          {/* Section 04: Features, Rules & Images */}
          <section className="property-form-section">
            <div className="form-section-heading">
              <span>04</span>
              <div>
                <h2>Features and images</h2>
                <p>Manage existing images, add new ones, and update rules.</p>
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

              {/* Existing Uploaded Images */}
              {existingImages.length > 0 && (
                <div className="property-form-field form-full">
                  <label>Current Images</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                    {existingImages.map((img, idx) => (
                      <div key={idx} style={{ position: "relative", width: "100px", height: "80px" }}>
                        <img
                          src={img.url}
                          alt="preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            background: "#ef4444",
                            color: "#fff",
                            borderRadius: "50%",
                            border: "none",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "grid",
                            placeItems: "center"
                          }}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Additional Images */}
              <div className="property-form-field form-full">
                <label htmlFor="images">Upload Additional Images</label>
                <input
                  id="images"
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleNewImagesChange}
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="checkInTime">Check-in time</label>
                <input id="checkInTime" name="checkInTime" value={form.checkInTime} onChange={handleChange} />
              </div>

              <div className="property-form-field">
                <label htmlFor="checkOutTime">Check-out time</label>
                <input id="checkOutTime" name="checkOutTime" value={form.checkOutTime} onChange={handleChange} />
              </div>
            </div>
          </section>

          <div className="property-form-actions">
            <button
              type="button"
              className="property-cancel-button"
              onClick={() => navigate("/owner/properties")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="property-submit-button"
              disabled={submitting}
            >
              {submitting ? "Saving Changes..." : "Update Property"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProperty;