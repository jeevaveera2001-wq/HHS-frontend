import "./PopularPlaces.css";

import {
  FaMapMarkerAlt,
} from "react-icons/fa";

/* =====================================
   Genuine nearby-place information
===================================== */

const places = [
  {
    id: "hogenakkal-falls",

    title:
      "Hogenakkal Falls",

    location:
      "Dharmapuri, Tamil Nadu",

    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Hogenakkal%20Waterfalls%2001.jpg?width=1200",

    imageAlt:
      "Genuine view of Hogenakkal Falls in Dharmapuri district, Tamil Nadu",

    description:
      "Experience the dramatic waterfalls, rocky landscape and natural beauty of the Cauvery River at Hogenakkal.",

    imageCredit:
      "Aksheyaa Akilan / Wikimedia Commons",

    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Hogenakkal_Waterfalls_01.jpg",
  },

  {
    id: "coracle-boat-ride",

    title:
      "Coracle Boat Ride",

    location:
      "Cauvery River, Hogenakkal",

    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Hogenakkal%20Falls%20and%20Coracle%20Ride.jpg?width=1200",

    imageAlt:
      "Traditional coracle boat ride at Hogenakkal Falls on the Cauvery River",

    description:
      "Enjoy a traditional coracle ride through the Cauvery River and experience Hogenakkal from the water.",

    imageCredit:
      "Ezhuttukari / Wikimedia Commons",

    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Hogenakkal_Falls_and_Coracle_Ride.jpg",
  },

  {
    id: "mettur-dam",

    title:
      "Mettur Dam",

    location:
      "Mettur, Salem District",

    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Mettur%20Dam%202.jpg?width=1200",

    imageAlt:
      "Genuine panoramic view of Mettur Dam and Stanley Reservoir in Tamil Nadu",

    description:
      "Visit the historic Mettur Dam and enjoy expansive views of the Stanley Reservoir and surrounding landscape.",

    imageCredit:
      "Wikimedia Commons contributor",

    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Mettur_Dam_2.jpg",
  },
];

/* =====================================
   Popular places component
===================================== */

function PopularPlaces() {
  return (
    <section className="popular-places">
      <div className="popular-places-container">
        {/* Section heading */}

        <header className="popular-places-header">
          <span className="popular-places-eyebrow">
            PLACES TO VISIT
          </span>

          <h2>
            Explore Nearby Attractions
          </h2>

          <p>
            Discover genuine attractions and
            memorable experiences around
            Hogenakkal.
          </p>
        </header>

        {/* Place cards */}

        <div className="places-grid">
          {places.map((place) => (
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
                  referrerPolicy="no-referrer"
                />

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
                <h3>
                  {place.title}
                </h3>

                <p>
                  {place.description}
                </p>

                <a
                  className="place-image-credit"
                  href={place.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View photo source for ${place.title}`}
                >
                  Photo: {place.imageCredit}
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