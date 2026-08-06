  import { useNavigate } from "react-router-dom";
import "./Hero.css";
  import { motion } from "framer-motion";

  function Hero() {
    const navigate=useNavigate();
    return (
      <section
        className="hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=2000')",
        }}
      >
        <div className="hero-overlay"></div>

        <div className="hero-container">
          <div className="hero-content">
            <motion.span
              className="hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              🌊 Welcome to Hogenakkal
            </motion.span>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Find Your Perfect
              <br />
              <span>Hogenakkal Homestay</span>
            </motion.h1>

            <motion.p
              className="hero-text"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Experience premium riverside cottages, luxury villas,
              family-friendly homestays and unforgettable adventures
              near the majestic Hogenakkal Falls.
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <button className="btn-primary" onClick={()=>navigate("/explore")}>
                Book Now
              </button>

              <button className="btn-secondary" onClick={()=>navigate("/explore")}>
                Explore Stays
              </button>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
            >
              <div className="hero-stat">
                <h2>500+</h2>
                <p>Verified Homestays</p>
              </div>

              <div className="hero-stat">
                <h2>10K+</h2>
                <p>Happy Guests</p>
              </div>

              <div className="hero-stat">
                <h2>4.9★</h2>
                <p>Average Rating</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <span></span>
        </div>
      </section>
    );
  }

  export default Hero;