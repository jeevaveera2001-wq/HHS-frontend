import "./PopularPlaces.css";

import {
  FaMapMarkerAlt,
  FaRoute,
} from "react-icons/fa";

import hogenakkalFallsImage from "../../assets/images/hogenakkal-falls.jpg";
import coracleRideImage from "../../assets/images/Coracleride.jpg";
import metturDamImage from "../../assets/images/metturdam.jpg";

/* =====================================
   Nearby attractions
===================================== */

const places = [
  {
    id: "hogenakkal-falls",

    title:
      "Hogenakkal Falls",

    location:
      "Dharmapuri, Tamil Nadu",

    distance:
      "Near Hogenakkal",

    image:
      hogenakkalFallsImage,

    imageAlt:
      "Real view of Hogenakkal Falls in Dharmapuri district, Tamil Nadu",

    description:
      "Experience the powerful waterfalls, rocky landscapes and breathtaking natural beauty of the Cauvery River.",

    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Hogenakkal+Falls+Tamil+Nadu",
  },

  {
    id: "coracle-boat-ride",

    title:
      "Coracle Boat Ride",

    location:
      "Cauvery River, Hogenakkal",

    distance:
      "At Hogenakkal Falls",

    image:
      coracleRideImage,

    imageAlt:
      "Traditional coracle boat ride on the Cauvery River at Hogenakkal Falls",

    description:
      "Enjoy a traditional coracle ride and discover the spectacular river, cliffs and waterfalls from the water.",

    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Hogenakkal+Coracle+Boat+Ride",
  },

  {
    id: "mettur-dam",

    title:
      "Mettur Dam",

    location:
      "Mettur, Salem District",

    distance:
      "Popular day trip",

    image:
      metturDamImage,

    imageAlt:
      "Real view of Mettur Dam and Stanley Reservoir in Tamil Nadu",

    description:
      "Visit the historic Mettur Dam and enjoy expansive views of Stanley Reservoir and the surrounding scenery.",

    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Mettur+Dam+Tamil+Nadu",
  },
];

/* =====================================
   Popular Places component
===================================== */

function PopularPlaces() {
  return (
    <section
      className="popular-places"
      aria-labelledby="popular-places-title"
    >
      <div className="popular-places-container">
        {/* Section heading */}

        <header className="popular-places-header">
          <div className="popular-places-heading">
            <span className="popular-places-eyebrow">
              EXPLORE HOGENAKKAL
            </span>

            <h2 id="popular-places-title">
              Nearby Attractions
            </h2>
          </div>

          <p>
            Discover iconic places, authentic
            experiences and beautiful destinations
            around Hogenakkal.
          </p>
        </header>

        {/* Attraction cards */}

        <div className="places-grid">
          {places.map((place, index) => (
            <article
              className="place-card"
              key={place.id}
            >
              <div className="place-image">
                <img
                  src={place.image}
                  alt={place.imageAlt}
                  loading="lazy"
                  decoding="async"
                  width="900"
                  height="650"
                />

                <div className="place-image-overlay" />

                <span className="place-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div className="place-location">
                  <FaMapMarkerAlt
                    aria-hidden="true"
                  />

                  <span>
                    {place.location}
                  </span>
                </div>
              </div>

              <div className="place-content">
                <div className="place-title-row">
                  <h3>
                    {place.title}
                  </h3>

                  <span className="place-distance">
                    {place.distance}
                  </span>
                </div>

                <p>
                  {place.description}
                </p>

                <a
                  className="place-map-link"
                  href={place.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${place.title} on Google Maps`}
                >
                  <FaRoute
                    aria-hidden="true"
                  />

                  <span>
                    View on Google Maps
                  </span>

                  <span
                    className="place-link-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularPlaces;