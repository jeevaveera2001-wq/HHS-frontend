import "./Testimonials.css";

import {
  FaMapMarkerAlt,
  FaQuoteLeft,
  FaStar,
} from "react-icons/fa";

const reviews = [
  {
    name: "Arun Kumar",
    location: "Chennai",
    review:
      "Amazing experience! The homestay was clean, peaceful and the location near Hogenakkal Falls was beautiful.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    location: "Bangalore",
    review:
      "Perfect weekend getaway with family. Great hospitality and comfortable rooms.",
    rating: 5,
  },
  {
    name: "Rahul Raj",
    location: "Coimbatore",
    review:
      "The booking process was very easy. Highly recommended for nature lovers.",
    rating: 4.8,
  },
  {
    name: "Karthik Rajan",
    location: "Salem",
    review:
      "A calm and refreshing stay close to Hogenakkal Falls. The rooms were comfortable and the service was excellent.",
    rating: 4.9,
  },
  {
    name: "Divya Prakash",
    location: "Dharmapuri",
    review:
      "A wonderful place for a family vacation. Everything was properly arranged and the surroundings were beautiful.",
    rating: 5,
  },
];

const renderStars = (rating) => {
  const roundedRating =
    Math.round(
      Number(rating)
    );

  return Array.from(
    {
      length: 5,
    },
    (_, index) => (
      <FaStar
        key={index}
        className={
          index <
          roundedRating
            ? "testimonial-star is-active"
            : "testimonial-star"
        }
        aria-hidden="true"
      />
    )
  );
};

function ReviewCard({
  item,
}) {
  return (
    <article className="testimonial-card">
      <div className="testimonial-card-glow" />

      <header className="testimonial-card-header">
        <div className="testimonial-quote-icon">
          <FaQuoteLeft
            aria-hidden="true"
          />
        </div>

        <div
          className="testimonial-rating"
          aria-label={`${item.rating} out of 5 stars`}
        >
          <div className="testimonial-stars">
            {renderStars(
              item.rating
            )}
          </div>

          <strong>
            {Number(
              item.rating
            ).toFixed(1)}
          </strong>
        </div>
      </header>

      <blockquote>
        “{item.review}”
      </blockquote>

      <footer className="testimonial-reviewer">
        <div className="testimonial-initial">
          {item.name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="testimonial-person">
          <strong>
            {item.name}
          </strong>

          <span>
            <FaMapMarkerAlt
              aria-hidden="true"
            />

            {item.location}
          </span>
        </div>

        <div className="verified-stay">
          <span />

          Verified Stay
        </div>
      </footer>
    </article>
  );
}

function Testimonials() {
  return (
    <section
      className="testimonials-section"
      aria-labelledby="testimonials-title"
    >
      <div className="testimonials-background-orb testimonial-orb-one" />
      <div className="testimonials-background-orb testimonial-orb-two" />

      <div className="testimonials-heading">
        <span className="testimonials-eyebrow">
          Guest Experiences
        </span>

        <h2 id="testimonials-title">
          Loved by travellers
        </h2>

        <p>
          Genuine experiences shared by
          guests who discovered memorable
          stays near Hogenakkal Falls.
        </p>
      </div>

      <div className="testimonials-slider">
        <div className="testimonials-track">
          <div className="testimonials-group">
            {reviews.map(
              (item) => (
                <ReviewCard
                  item={item}
                  key={`original-${item.name}`}
                />
              )
            )}
          </div>

          <div
            className="testimonials-group"
            aria-hidden="true"
          >
            {reviews.map(
              (item) => (
                <ReviewCard
                  item={item}
                  key={`duplicate-${item.name}`}
                />
              )
            )}
          </div>
        </div>
      </div>

      <div className="testimonials-trust-row">
        <div>
          <strong>
            4.9
          </strong>

          <span>
            Average guest rating
          </span>
        </div>

        <span className="trust-divider" />

        <div>
          <strong>
            100%
          </strong>

          <span>
            Verified experiences
          </span>
        </div>

        <span className="trust-divider" />

        <div>
          <strong>
            HHS
          </strong>

          <span>
            Trusted local stays
          </span>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;