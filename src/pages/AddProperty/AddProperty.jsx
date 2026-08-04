import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { createProperty } from "../../services/propertyService";
import "./AddProperty.css";

const initialForm = {
  title: "",
  description: "",
  propertyType: "Homestay",
  address: "",
  city: "Hogenakkal",
  district: "Dharmapuri",
  state: "Tamil Nadu",
  pincode: "",
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

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      toast.error(
        "Property description must contain at least 20 characters."
      );
      return;
    }

    if (
      Number(form.availableRooms) > Number(form.totalRooms)
    ) {
      toast.error(
        "Available rooms cannot exceed total rooms."
      );
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
  })
);

formData.append("pricePerNight", form.pricePerNight);
formData.append("originalPrice", form.originalPrice);
formData.append("maxGuests", form.maxGuests);
formData.append("bedrooms", form.bedrooms);
formData.append("bathrooms", form.bathrooms);
formData.append("totalRooms", form.totalRooms);
formData.append("availableRooms", form.availableRooms);

formData.append(
  "amenities",
  JSON.stringify(splitValues(form.amenities))
);

formData.append(
  "rules",
  JSON.stringify(splitValues(form.rules))
);

formData.append("checkInTime", form.checkInTime);
formData.append("checkOutTime", form.checkOutTime);

form.images.forEach((image) => {
  formData.append("images", image);
});
  console.log("FormData entries before submission:", Array.from(formData.entries()),form);
const data = await createProperty(formData);

      toast.success(data.message);
      navigate("/my-properties");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="add-property-page">
      <div className="add-property-container">
        <header className="add-property-header">
          <span>HHS Property Management</span>
          <h1>Add a new property</h1>
          <p>
            Enter the stay details, pricing, rooms and images.
          </p>
        </header>

        <form
          className="add-property-form"
          onSubmit={handleSubmit}
        >
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
                <label htmlFor="propertyType">
                  Property type *
                </label>

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
                  <option value="Guest House">
                    Guest House
                  </option>
                </select>
              </div>

              <div className="property-form-field form-full">
                <label htmlFor="description">
                  Description *
                </label>

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

          <section className="property-form-section">
            <div className="form-section-heading">
              <span>02</span>

              <div>
                <h2>Location</h2>
                <p>Where can guests find this property?</p>
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
            </div>
          </section>

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
                <label htmlFor="pricePerNight">
                  Price per night *
                </label>

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
                <label htmlFor="originalPrice">
                  Original price
                </label>

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
                <label htmlFor="availableRooms">
                  Available rooms *
                </label>

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
                <label htmlFor="imageUrls">
                  Image URLs
                </label>

               <div className="property-form-field form-full">
  <label htmlFor="images">
    Property Images
  </label>

  <input
    id="images"
    type="file"
    name="images"
    multiple
    accept="image/*"
    onChange={handleImageChange}
  />

  <small>
    You can upload multiple images.
  </small>
</div>
                <small>
                  The first image will be used as the cover.
                </small>
              </div>

              <div className="property-form-field">
                <label htmlFor="checkInTime">
                  Check-in time
                </label>

                <input
                  id="checkInTime"
                  name="checkInTime"
                  value={form.checkInTime}
                  onChange={handleChange}
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="checkOutTime">
                  Check-out time
                </label>

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
              {submitting
                ? "Submitting property..."
                : "Create property"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddProperty;