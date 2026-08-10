import { useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaTag,
} from "react-icons/fa";

import "./SpecialOffers.css";

const offers = [
  {
    id: "family-vacation",
    title: "Family Vacation Package",
    discount: 15,
    description:
      "Enjoy a comfortable family stay with special facilities and beautiful surroundings.",
    color: "green",
  },
  {
    id: "group-company-outing",
    title: "Group & Company Outing",
    discount: 10,
    description:
      "Plan a refreshing group trip or company outing near Hogenakkal Falls.",
    color: "blue",
  },
  {
    id: "couple-retreat",
    title: "Couple Retreat",
    discount: 10,
    description:
      "Enjoy a peaceful and romantic riverside stay with beautiful views.",
    color: "purple",
  },
];

function SpecialOffers() {
  const navigate = useNavigate();

  const handleBookNow = (offerCode) => {
    navigate(
      `/explore?offer=${encodeURIComponent(
        offerCode
      )}`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="offers-section">
      <div className="offers-container">
        <div className="offers-heading">
          <h2>
            Exclusive Offers
          </h2>

          <p>
            Special deals for your unforgettable Hogenakkal trip
          </p>
        </div>

        <div className="offers-grid">
          {offers.map((offer) => (
            <div
              className={`offer-card ${offer.color}`}
              key={offer.id}
            >
              <div className="discount">
                <FaTag />

                {offer.discount}% OFF
              </div>

              <h3>
                {offer.title}
              </h3>

              <p>
                {offer.description}
              </p>

              <button
                type="button"
                onClick={() =>
                  handleBookNow(
                    offer.id
                  )
                }
                aria-label={`Book ${offer.title}`}
              >
                Book Now

                <FaArrowRight />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SpecialOffers;