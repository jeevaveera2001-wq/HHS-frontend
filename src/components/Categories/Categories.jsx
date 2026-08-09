import { Link } from "react-router-dom";

import "./Categories.css";

const categories = [
  {
    title: "Luxury Homestays",
    count: "120+ Properties",
    image:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=900",
    category: "homestay",
  },
  {
    title: "Premium Resorts",
    count: "50+ Resorts",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
    category: "resort",
  },
  {
    title: "Nature Camping",
    count: "30+ Camps",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=900",
    category: "camping",
  },
  {
    title: "River View Villas",
    count: "80+ Stays",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
    category: "villa",
  },
];

function Categories() {
  const handleCategoryClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="categories-section">
      <div className="categories-container">
        <div className="categories-heading">
          <span>Find Your Perfect Stay</span>
          <h2>Explore by Category</h2>

          <p>
            Discover handpicked stays designed for every kind of
            traveller.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link
              key={category.title}
              to={`/explore?category=${category.category}`}
              className="category-card"
              onClick={handleCategoryClick}
              aria-label={`Explore ${category.title}`}
            >
              <img
                src={category.image}
                alt={category.title}
                loading="lazy"
              />

              <div className="category-overlay" />

              <div className="category-content">
                <span>{category.count}</span>
                <h3>{category.title}</h3>
                <p>Explore stays →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;