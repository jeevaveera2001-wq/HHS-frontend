import "./PropertySubmittedModal.css";

function PropertySubmittedModal() {
 
  return (
    <div className="success-overlay">
      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <h2>Property Submitted Successfully!</h2>

        <p className="success-subtitle">
          Your property has been received and is awaiting verification.
        </p>

        {/* <div className="submitted-property">

          <img
            src={image}
            alt={property.title}
            className="submitted-image"
          />

          <div className="submitted-content">
            <h3>{property.title}</h3>

            <p>
              📍 {property.location.address}
            </p>

            <span className="status-badge">
              Pending Verification
            </span>
          </div>

        </div> */}

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
          Redirecting to My Properties...
        </p>

      </div>
    </div>
  );
}

export default PropertySubmittedModal;