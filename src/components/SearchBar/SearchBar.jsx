import "./SearchBar.css";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaHome,
  FaSearch
} from "react-icons/fa";

function SearchBar() {

  return (
    <section className="search-section">

      <div className="search-box">

        {/* Location */}
        <div className="search-item">

          <FaMapMarkerAlt className="search-icon"/>

          <div>
            <label>Location</label>
            <p>Hogenakkal</p>
          </div>

        </div>


        {/* Check In */}
        <div className="search-item">

          <FaCalendarAlt className="search-icon"/>

          <div>
            <label>Check In</label>
            <input type="date"/>
          </div>

        </div>


        {/* Check Out */}
        <div className="search-item">

          <FaCalendarAlt className="search-icon"/>

          <div>
            <label>Check Out</label>
            <input type="date"/>
          </div>

        </div>


        {/* Guests */}
        <div className="search-item">

          <FaUsers className="search-icon"/>

          <div>
            <label>Guests</label>
            <p>2 Guests</p>
          </div>

        </div>


        {/* Type */}
        <div className="search-item">

          <FaHome className="search-icon"/>

          <div>
            <label>Stay Type</label>
            <p>Homestay</p>
          </div>

        </div>


        <button className="search-button">

          <FaSearch/>

          Search

        </button>


      </div>

    </section>
  );
}

export default SearchBar;