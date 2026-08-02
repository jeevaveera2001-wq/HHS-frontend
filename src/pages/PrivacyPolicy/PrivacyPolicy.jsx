import {
  Link,
} from "react-router-dom";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import "./PrivacyPolicy.css";

const privacySections = [
  {
    id: "scope",
    label: "Policy Scope",
  },
  {
    id: "information-collected",
    label: "Information We Collect",
  },
  {
    id: "collection-methods",
    label: "How We Collect Data",
  },
  {
    id: "data-usage",
    label: "How We Use Data",
  },
  {
    id: "bookings",
    label: "Booking Information",
  },
  {
    id: "payments",
    label: "Payment Information",
  },
  {
    id: "owners",
    label: "Property Owner Data",
  },
  {
    id: "sharing",
    label: "Data Sharing",
  },
  {
    id: "cookies",
    label: "Cookies and Storage",
  },
  {
    id: "security",
    label: "Data Security",
  },
  {
    id: "retention",
    label: "Data Retention",
  },
  {
    id: "rights",
    label: "Your Privacy Rights",
  },
  {
    id: "children",
    label: "Children’s Privacy",
  },
  {
    id: "transfers",
    label: "Data Transfers",
  },
  {
    id: "updates",
    label: "Policy Updates",
  },
  {
    id: "contact",
    label: "Privacy Contact",
  },
];

const collectedInformation = [
  {
    icon: "👤",
    title: "Account information",
    description:
      "Your full name, email address, phone number, account role, profile image and authentication information.",
  },
  {
    icon: "📅",
    title: "Booking information",
    description:
      "Property, travel dates, number of rooms, number of guests, primary guest details and special requests.",
  },
  {
    icon: "🏨",
    title: "Property information",
    description:
      "Property descriptions, location, amenities, rules, photographs, ownership and verification information.",
  },
  {
    icon: "💳",
    title: "Transaction information",
    description:
      "Payment amount, payment status, transaction identifiers, refund information and booking receipt details.",
  },
  {
    icon: "💬",
    title: "Communications",
    description:
      "Support requests, emails, property-owner messages, reviews, replies and complaint information.",
  },
  {
    icon: "🖥️",
    title: "Technical information",
    description:
      "IP address, browser information, device type, access time, requested pages and security-related logs.",
  },
];

function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero-circle privacy-circle-one" />
        <div className="privacy-hero-circle privacy-circle-two" />

        <div className="privacy-hero-content">
          <BrandLogo
            className="privacy-brand-logo"
            variant="default"
          />

          <span className="privacy-eyebrow">
            Your Data Matters
          </span>

          <h1>
            Privacy Policy
          </h1>

          <p>
            This policy explains what personal information Hogenakkal
            Home Stays collects, why we use it and the choices available
            to you.
          </p>

          <div className="privacy-meta">
            <span>
              Effective date: 02 August 2026
            </span>

            <span>
              Last updated: 02 August 2026
            </span>
          </div>
        </div>
      </section>

      <div className="privacy-layout">
        <aside className="privacy-sidebar">
          <div className="privacy-sidebar-card">
            <span className="privacy-sidebar-title">
              Privacy sections
            </span>

            <nav aria-label="Privacy policy sections">
              {privacySections.map((section) => (
                <a
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="privacy-request-card">
            <span>
              Privacy request
            </span>

            <p>
              You can contact HHS to request access, correction or
              deletion of eligible personal information.
            </p>

            <a href="mailto:hogenakkalhomestays@gmail.com?subject=HHS Privacy Request">
              Submit a request
            </a>
          </div>
        </aside>

        <article className="privacy-content">
          <div className="privacy-summary">
            <div className="privacy-summary-icon">
              🛡️
            </div>

            <div>
              <strong>
                Our privacy commitment
              </strong>

              <p>
                HHS uses personal information only for legitimate
                platform, booking, safety, communication and legal
                purposes. We do not sell your personal information.
              </p>
            </div>
          </div>

          <section
            className="privacy-section"
            id="scope"
          >
            <span className="privacy-section-number">
              01
            </span>

            <h2>
              Scope of This Privacy Policy
            </h2>

            <p>
              This Privacy Policy applies to the Hogenakkal Home Stays
              website, customer and property-owner accounts, booking
              services, support services and administrative systems
              operated by VeeraWebTech.
            </p>

            <p>
              In this policy, “HHS”, “we”, “our” and “us” refer to
              Hogenakkal Home Stays and VeeraWebTech. “You” refers to
              customers, guests, property owners, website visitors and
              other platform users.
            </p>

            <p>
              By using HHS, you acknowledge that your personal
              information will be handled as described in this policy
              and in accordance with applicable Indian law.
            </p>
          </section>

          <section
            className="privacy-section"
            id="information-collected"
          >
            <span className="privacy-section-number">
              02
            </span>

            <h2>
              Information We Collect
            </h2>

            <p>
              The information collected depends on how you use the
              platform. We collect information necessary to operate
              accounts, process reservations, communicate with users
              and protect the platform.
            </p>

            <div className="privacy-information-grid">
              {collectedInformation.map((item) => (
                <article key={item.title}>
                  <span className="privacy-information-icon">
                    {item.icon}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="privacy-callout">
              <strong>
                Sensitive credentials
              </strong>

              <p>
                HHS will never ask you to provide your card PIN,
                internet-banking password, UPI PIN or account password
                through email, phone, support tickets or property-owner
                messages.
              </p>
            </div>
          </section>

          <section
            className="privacy-section"
            id="collection-methods"
          >
            <span className="privacy-section-number">
              03
            </span>

            <h2>
              How We Collect Information
            </h2>

            <p>
              We may collect personal information through the
              following sources:
            </p>

            <ul>
              <li>
                Information you provide while registering or updating
                your profile.
              </li>

              <li>
                Information submitted while creating or managing a
                booking.
              </li>

              <li>
                Property information submitted by property owners.
              </li>

              <li>
                Messages, reviews, support tickets and other
                communications you send through HHS.
              </li>

              <li>
                Transaction updates received from authorized payment
                providers.
              </li>

              <li>
                Technical and security information generated when you
                access the website.
              </li>

              <li>
                Information lawfully received from verification,
                fraud-prevention or service providers.
              </li>
            </ul>
          </section>

          <section
            className="privacy-section"
            id="data-usage"
          >
            <span className="privacy-section-number">
              04
            </span>

            <h2>
              How We Use Personal Information
            </h2>

            <p>
              HHS may process personal information for the following
              purposes:
            </p>

            <div className="privacy-purpose-list">
              <div>
                <span>01</span>

                <p>
                  Creating, authenticating and maintaining user
                  accounts.
                </p>
              </div>

              <div>
                <span>02</span>

                <p>
                  Processing bookings, availability checks,
                  confirmations, cancellations and refunds.
                </p>
              </div>

              <div>
                <span>03</span>

                <p>
                  Connecting guests with the relevant property owner
                  for an active booking.
                </p>
              </div>

              <div>
                <span>04</span>

                <p>
                  Sending booking receipts, status updates, reminders
                  and service-related emails.
                </p>
              </div>

              <div>
                <span>05</span>

                <p>
                  Reviewing and verifying property listings and owner
                  payout accounts.
                </p>
              </div>

              <div>
                <span>06</span>

                <p>
                  Responding to support requests, complaints and
                  privacy enquiries.
                </p>
              </div>

              <div>
                <span>07</span>

                <p>
                  Preventing unauthorized access, fraud, misuse and
                  security incidents.
                </p>
              </div>

              <div>
                <span>08</span>

                <p>
                  Maintaining financial, tax, legal and operational
                  records where required.
                </p>
              </div>

              <div>
                <span>09</span>

                <p>
                  Improving website performance, usability and
                  customer service.
                </p>
              </div>
            </div>

            <p>
              Where processing depends on consent, you may withdraw
              that consent through the available settings or by
              contacting us. Withdrawal does not affect processing
              already completed lawfully.
            </p>
          </section>

          <section
            className="privacy-section"
            id="bookings"
          >
            <span className="privacy-section-number">
              05
            </span>

            <h2>
              Booking and Guest Information
            </h2>

            <p>
              When you make a reservation, we collect the information
              required to create and manage that booking. This may
              include:
            </p>

            <ul>
              <li>
                Check-in and check-out dates.
              </li>

              <li>
                Number of rooms and guests.
              </li>

              <li>
                Primary guest name, email address and phone number.
              </li>

              <li>
                Additional guest information where required.
              </li>

              <li>
                Special requests and accessibility requirements that
                you choose to provide.
              </li>

              <li>
                Booking status, cancellation reason and refund
                information.
              </li>
            </ul>

            <p>
              Relevant booking information may be shared with the
              property owner so that the reservation can be fulfilled.
              Property owners must use this information only for
              legitimate booking, guest-service, safety and legal
              purposes.
            </p>

            <div className="privacy-callout neutral">
              <strong>
                Special requests
              </strong>

              <p>
                Avoid entering unnecessary sensitive personal or
                medical information in the special-request field.
                Provide only information needed by the property to
                support your stay.
              </p>
            </div>
          </section>

          <section
            className="privacy-section"
            id="payments"
          >
            <span className="privacy-section-number">
              06
            </span>

            <h2>
              Payment and Transaction Information
            </h2>

            <p>
              Payments may be handled through an authorized third-party
              payment provider. Payment providers process payment
              credentials according to their own security standards
              and privacy policies.
            </p>

            <p>
              HHS may store limited transaction information needed to
              manage the booking, including:
            </p>

            <ul>
              <li>
                Transaction or payment identifier.
              </li>

              <li>
                Payment order identifier.
              </li>

              <li>
                Payment amount and currency.
              </li>

              <li>
                Payment, refund and settlement status.
              </li>

              <li>
                Payment completion or failure time.
              </li>
            </ul>

            <p>
              HHS does not intend to store your full card number, CVV,
              card PIN, UPI PIN or internet-banking password.
            </p>
          </section>

          <section
            className="privacy-section"
            id="owners"
          >
            <span className="privacy-section-number">
              07
            </span>

            <h2>
              Property Owner Information
            </h2>

            <p>
              Property owners may be required to provide contact,
              identity, property, banking or UPI information for
              listing verification and owner payouts.
            </p>

            <p>
              Complete bank-account or UPI details may be transmitted
              directly to the authorized payout provider when an owner
              submits payout details.
            </p>

            <p>
              HHS is designed to retain only limited masked payout
              information where possible, such as:
            </p>

            <ul>
              <li>
                Account-holder name.
              </li>

              <li>
                Last four digits of a bank account.
              </li>

              <li>
                Masked UPI ID.
              </li>

              <li>
                Bank name and IFSC.
              </li>

              <li>
                Verification status and provider reference
                identifiers.
              </li>
            </ul>

            <p>
              Access to payout information is restricted to authorized
              owner, finance and administrative functions.
            </p>
          </section>

          <section
            className="privacy-section"
            id="sharing"
          >
            <span className="privacy-section-number">
              08
            </span>

            <h2>
              When We Share Information
            </h2>

            <p>
              HHS does not sell or rent personal information. We may
              share limited information when necessary with:
            </p>

            <div className="privacy-sharing-grid">
              <article>
                <span>🏨</span>

                <div>
                  <h3>
                    Property owners
                  </h3>

                  <p>
                    To confirm and fulfil reservations and provide
                    guest support.
                  </p>
                </div>
              </article>

              <article>
                <span>💳</span>

                <div>
                  <h3>
                    Payment providers
                  </h3>

                  <p>
                    To process payments, refunds, verification and
                    authorized owner payouts.
                  </p>
                </div>
              </article>

              <article>
                <span>☁️</span>

                <div>
                  <h3>
                    Technology providers
                  </h3>

                  <p>
                    To host the website, database, images, email and
                    security infrastructure.
                  </p>
                </div>
              </article>

              <article>
                <span>⚖️</span>

                <div>
                  <h3>
                    Legal authorities
                  </h3>

                  <p>
                    When disclosure is required by law, legal process
                    or a valid government request.
                  </p>
                </div>
              </article>

              <article>
                <span>🛡️</span>

                <div>
                  <h3>
                    Safety services
                  </h3>

                  <p>
                    To detect fraud, prevent misuse and protect users
                    or the platform.
                  </p>
                </div>
              </article>

              <article>
                <span>🏢</span>

                <div>
                  <h3>
                    Business restructuring
                  </h3>

                  <p>
                    If the platform is reorganized, acquired or
                    transferred, subject to applicable protections.
                  </p>
                </div>
              </article>
            </div>

            <p>
              Service providers are expected to process information
              only for authorized purposes and to apply appropriate
              confidentiality and security protections.
            </p>
          </section>

          <section
            className="privacy-section"
            id="cookies"
          >
            <span className="privacy-section-number">
              09
            </span>

            <h2>
              Cookies and Browser Storage
            </h2>

            <p>
              HHS may use cookies, local storage and session storage
              to operate essential website features.
            </p>

            <div className="privacy-cookie-table">
              <div className="privacy-cookie-heading">
                <span>Storage type</span>
                <span>Purpose</span>
              </div>

              <div>
                <strong>
                  Authentication storage
                </strong>

                <p>
                  Keeps you logged in and allows protected pages to
                  recognize your account.
                </p>
              </div>

              <div>
                <strong>
                  Session storage
                </strong>

                <p>
                  Maintains temporary login or navigation information
                  during the browser session.
                </p>
              </div>

              <div>
                <strong>
                  Preference storage
                </strong>

                <p>
                  Remembers selected filters, saved properties or
                  interface preferences where enabled.
                </p>
              </div>

              <div>
                <strong>
                  Security information
                </strong>

                <p>
                  Helps detect unauthorized access, suspicious requests
                  and misuse.
                </p>
              </div>
            </div>

            <p>
              You can clear browser storage through your browser
              settings. Removing essential authentication storage may
              log you out or prevent protected features from working.
            </p>

            <p>
              If HHS introduces non-essential advertising or analytics
              cookies, this policy and the website consent controls
              should be updated before those cookies are enabled.
            </p>
          </section>

          <section
            className="privacy-section"
            id="security"
          >
            <span className="privacy-section-number">
              10
            </span>

            <h2>
              Data Security
            </h2>

            <p>
              HHS uses reasonable technical and organizational
              safeguards designed to protect personal information
              against unauthorized access, alteration, disclosure,
              misuse or loss.
            </p>

            <div className="privacy-security-list">
              <div>
                <span>🔐</span>

                <p>
                  Passwords are stored using secure one-way password
                  hashing.
                </p>
              </div>

              <div>
                <span>🪪</span>

                <p>
                  Role-based permissions restrict access to protected
                  customer, owner and administrative functions.
                </p>
              </div>

              <div>
                <span>🔒</span>

                <p>
                  Production traffic should use HTTPS encryption
                  between users and the website.
                </p>
              </div>

              <div>
                <span>🧾</span>

                <p>
                  Sensitive administrative operations may be recorded
                  for security and accountability.
                </p>
              </div>

              <div>
                <span>🏦</span>

                <p>
                  Payment and payout credentials are handled through
                  authorized financial providers.
                </p>
              </div>
            </div>

            <p>
              No website or storage method is completely secure.
              Users should maintain a strong password, protect their
              device and immediately report suspected unauthorized
              account access.
            </p>
          </section>

          <section
            className="privacy-section"
            id="retention"
          >
            <span className="privacy-section-number">
              11
            </span>

            <h2>
              Data Retention
            </h2>

            <p>
              Personal information is retained only for as long as
              reasonably necessary for the purpose for which it was
              collected or as required by applicable law.
            </p>

            <p>
              Retention periods may depend on:
            </p>

            <ul>
              <li>
                Whether your account remains active.
              </li>

              <li>
                Whether a booking, payment, refund or complaint remains
                unresolved.
              </li>

              <li>
                Financial, tax, fraud-prevention and legal record
                requirements.
              </li>

              <li>
                The need to establish, exercise or defend legal claims.
              </li>

              <li>
                Platform safety and abuse-prevention requirements.
              </li>
            </ul>

            <p>
              When information is no longer required, HHS may delete,
              anonymize or securely isolate it, subject to technical
              and legal limitations.
            </p>
          </section>

          <section
            className="privacy-section"
            id="rights"
          >
            <span className="privacy-section-number">
              12
            </span>

            <h2>
              Your Privacy Rights
            </h2>

            <p>
              Subject to applicable law and identity verification, you
              may request to:
            </p>

            <div className="privacy-rights-grid">
              <article>
                <span>01</span>

                <h3>
                  Access
                </h3>

                <p>
                  Request a summary of eligible personal information
                  being processed about you.
                </p>
              </article>

              <article>
                <span>02</span>

                <h3>
                  Correction
                </h3>

                <p>
                  Correct inaccurate or misleading information and
                  complete incomplete information.
                </p>
              </article>

              <article>
                <span>03</span>

                <h3>
                  Update
                </h3>

                <p>
                  Update personal information that is no longer
                  current.
                </p>
              </article>

              <article>
                <span>04</span>

                <h3>
                  Erasure
                </h3>

                <p>
                  Request deletion of eligible information that is no
                  longer required.
                </p>
              </article>

              <article>
                <span>05</span>

                <h3>
                  Withdraw consent
                </h3>

                <p>
                  Withdraw consent where consent is the basis for
                  processing.
                </p>
              </article>

              <article>
                <span>06</span>

                <h3>
                  Grievance
                </h3>

                <p>
                  Raise a complaint about how your personal
                  information or privacy request was handled.
                </p>
              </article>
            </div>

            <p>
              Certain information may not be deleted immediately when
              retention is required to complete an existing booking,
              process a refund, prevent fraud, maintain financial
              records or comply with law.
            </p>

            <p>
              To exercise an applicable privacy right, email{" "}
              <a href="mailto:hogenakkalhomestays@gmail.com?subject=HHS Privacy Rights Request">
                hogenakkalhomestays@gmail.com
              </a>{" "}
              using the subject “HHS Privacy Rights Request”.
            </p>
          </section>

          <section
            className="privacy-section"
            id="children"
          >
            <span className="privacy-section-number">
              13
            </span>

            <h2>
              Children’s Privacy
            </h2>

            <p>
              HHS accounts and bookings are intended to be created by
              individuals who are at least 18 years old.
            </p>

            <p>
              Information about a child may be provided by a parent,
              legal guardian or responsible adult when reasonably
              necessary for a family booking. The responsible adult
              must ensure that the information is accurate and
              provided lawfully.
            </p>

            <p>
              HHS does not knowingly permit children to independently
              create accounts or make accommodation bookings.
            </p>
          </section>

          <section
            className="privacy-section"
            id="transfers"
          >
            <span className="privacy-section-number">
              14
            </span>

            <h2>
              Data Hosting and Transfers
            </h2>

            <p>
              HHS may use hosting, database, email, image-storage,
              security and payment providers whose systems operate in
              India or other permitted locations.
            </p>

            <p>
              Where information is processed outside India, HHS will
              take reasonable steps to use service providers with
              appropriate contractual, technical and organizational
              protections, subject to applicable transfer restrictions.
            </p>
          </section>

          <section
            className="privacy-section"
            id="third-party"
          >
            <span className="privacy-section-number">
              15
            </span>

            <h2>
              Third-Party Websites and Services
            </h2>

            <p>
              HHS may link to maps, social networks, payment providers
              or other third-party services.
            </p>

            <p>
              Third-party services operate under their own terms and
              privacy policies. HHS is not responsible for how an
              independent third party processes information after you
              leave the HHS website.
            </p>

            <p>
              You should review the applicable third-party policy
              before submitting personal or payment information.
            </p>
          </section>

          <section
            className="privacy-section"
            id="updates"
          >
            <span className="privacy-section-number">
              16
            </span>

            <h2>
              Changes to This Privacy Policy
            </h2>

            <p>
              HHS may update this Privacy Policy when platform
              features, providers, security practices or legal
              requirements change.
            </p>

            <p>
              The latest effective date will appear at the top of this
              page. Material updates may also be communicated through
              the website, email or an in-app notification where
              appropriate.
            </p>
          </section>

          <section
            className="privacy-section privacy-contact-section"
            id="contact"
          >
            <span className="privacy-section-number">
              17
            </span>

            <h2>
              Privacy and Grievance Contact
            </h2>

            <p>
              Contact us if you have a privacy question, request or
              complaint:
            </p>

            <div className="privacy-contact-card">
              <div className="privacy-contact-avatar">
                HHS
              </div>

              <div className="privacy-contact-details">
                <span>
                  Privacy and Grievance Contact
                </span>

                <strong>
                  Hogenakkal Home Stays
                </strong>

                <small>
                  Operated by VeeraWebTech
                </small>

                <a href="mailto:hogenakkalhomestays@gmail.com">
                  hogenakkalhomestays@gmail.com
                </a>

                <a href="tel:+917871779134">
                  +91 78717 79134
                </a>

                <p>
                  Hogenakkal, Dharmapuri District,
                  Tamil Nadu, India
                </p>
              </div>
            </div>
          </section>

          <div className="privacy-policy-navigation">
            <Link to="/terms-and-conditions">
              ← Terms and Conditions
            </Link>

            <Link to="/cancellation-refund-policy">
              Cancellation Policy →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default PrivacyPolicy;