import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaHome,
  FaTag,
  FaSearch
} from "react-icons/fa";

function SearchBar() {
  const navigate = useNavigate();

  // Setup state for all search fields
  const [location, setLocation] = useState("Hogenakkal");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [stayType, setStayType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // Handle the search submission
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location) params.append("search", location);
    if (stayType) params.append("propertyType", stayType);
    if (checkIn) params.append("checkIn", checkIn);
    if (checkOut) params.append("checkOut", checkOut);
    if (guests) params.append("guests", guests);
    if (priceRange) params.append("priceRange", priceRange);

    // Navigate to the Explore page with the search queries attached
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <section className="search-section">
      <div className="search-box">
        
        {/* Location / Property Name */}
        <div className="search-item">
          <FaMapMarkerAlt className="search-icon" />
          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where to?"
            />
          </div>
        </div>

        {/* Check In */}
        <div className="search-item">
          <FaCalendarAlt className="search-icon" />
          <div>
            <label htmlFor="checkIn">Check In</label>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
        </div>

        {/* Check Out */}
        <div className="search-item">
          <FaCalendarAlt className="search-icon" />
          <div>
            <label htmlFor="checkOut">Check Out</label>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="search-item">
          <FaUsers className="search-icon" />
          <div>
            <label htmlFor="guests">Guests</label>
            <input
              id="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>
        </div>

        {/* Stay Type */}
        <div className="search-item">
          <FaHome className="search-icon" />
          <div>
            <label htmlFor="stayType">Stay Type</label>
            <select
              id="stayType"
              value={stayType}
              onChange={(e) => setStayType(e.target.value)}
            >
              <option value="">Any Type</option>
              <option value="Homestay">Homestay</option>
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Villa">Villa</option>
              <option value="Cottage">Cottage</option>
              <option value="Guest House">Guest House</option>
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="search-item">
          <FaTag className="search-icon" />
          <div>
            <label htmlFor="priceRange">Price</label>
            <select
              id="priceRange"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="priceLowToHigh">Low to High</option>
              <option value="priceHighToLow">High to Low</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button className="search-button" onClick={handleSearch} type="button">
          <FaSearch />
          Search
        </button>

      </div>
    </section>
  );
}

export default SearchBar;