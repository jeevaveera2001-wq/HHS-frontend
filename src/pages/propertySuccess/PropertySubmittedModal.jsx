import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PropertySubmittedModal.css";

function PropertySubmittedModal({ 
  redirectPath = "/owner/properties", // Change if your route in AppRoutes is "/owner-properties" or "/my-properties"
  delaySeconds = 3,
  onClose 
}) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(delaySeconds);

  useEffect(() => {
    // 1. Tick down every second
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    // 2. Perform the actual redirect after the delay
    const timer = setTimeout(() => {
      if (onClose) onClose();
      navigate(redirectPath);
    }, delaySeconds * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, redirectPath, delaySeconds, onClose]);

  const handleManualRedirect = () => {
    if (onClose) onClose();
    navigate(redirectPath);
  };

  return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h2>Property Submitted Successfully!</h2>

        <p className="success-subtitle">
          Your property has been received and is awaiting verification.
        </p>

        <div className="verification-box">
          <h4>What happens next?</h4>
          <ul>
            <li>✔ Our verification team will review your property.</li>
            <li>📞 We may contact you for additional details.</li>
            <li>🛡 After approval, your property will become visible to guests.</li>
            <li>🎉 You'll receive a notification once it's approved.</li>
          </ul>
        </div>

        <div className="loader"></div>

        <p className="redirect-text">
          Redirecting to My Properties in <strong>{countdown}s</strong>...
        </p>

        <button
          type="button"
          onClick={handleManualRedirect}
          className="redirect-now-btn"
          style={{
            marginTop: "12px",
            padding: "10px 20px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0e7490, #06b6d4)",
            color: "#ffffff",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Go to My Properties Now
        </button>
      </div>
    </div>
  );
}

export default PropertySubmittedModal;