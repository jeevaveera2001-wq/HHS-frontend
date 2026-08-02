import {
  Link,
} from "react-router-dom";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import "./TermsAndConditions.css";

const sections = [
  {
    id: "acceptance",
    label: "Acceptance of Terms",
  },
  {
    id: "platform",
    label: "Platform Services",
  },
  {
    id: "eligibility",
    label: "User Eligibility",
  },
  {
    id: "accounts",
    label: "User Accounts",
  },
  {
    id: "bookings",
    label: "Bookings",
  },
  {
    id: "pricing",
    label: "Pricing and Payments",
  },
  {
    id: "cancellations",
    label: "Cancellations",
  },
  {
    id: "guest-responsibilities",
    label: "Guest Responsibilities",
  },
  {
    id: "owner-responsibilities",
    label: "Owner Responsibilities",
  },
  {
    id: "reviews",
    label: "Reviews and Content",
  },
  {
    id: "prohibited",
    label: "Prohibited Activities",
  },
  {
    id: "liability",
    label: "Liability",
  },
  {
    id: "termination",
    label: "Account Termination",
  },
  {
    id: "governing-law",
    label: "Governing Law",
  },
  {
    id: "contact",
    label: "Contact Information",
  },
];

function TermsAndConditions() {
  return (
    <main className="terms-page">
      <section className="terms-hero">
        <div className="terms-hero-decoration terms-decoration-one" />
        <div className="terms-hero-decoration terms-decoration-two" />

        <div className="terms-hero-content">
          <BrandLogo
            className="terms-brand-logo"
            variant="default"
          />

          <span className="terms-eyebrow">
            Legal Information
          </span>

          <h1>
            Terms and Conditions
          </h1>

          <p>
            These terms explain the rules that apply when using
            Hogenakkal Home Stays to discover, list and book
            accommodation.
          </p>

          <div className="terms-meta">
            <span>
              Effective date: 02 August 2026
            </span>

            <span>
              Last updated: 02 August 2026
            </span>
          </div>
        </div>
      </section>

      <div className="terms-layout">
        <aside className="terms-sidebar">
          <div className="terms-sidebar-card">
            <span className="terms-sidebar-title">
              On this page
            </span>

            <nav aria-label="Terms and conditions sections">
              {sections.map((section) => (
                <a
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="terms-help-card">
            <span>Need help?</span>

            <p>
              Contact the HHS support team if you have questions
              about these terms.
            </p>

            <a href="mailto:hogenakkalhomestays@gmail.com">
              Contact support
            </a>
          </div>
        </aside>

        <article className="terms-content">
          <div className="terms-introduction">
            <span>Important</span>

            <p>
              Please read these Terms and Conditions carefully before
              accessing or using the Hogenakkal Home Stays website.
              By creating an account, listing a property or making a
              booking, you agree to these terms.
            </p>
          </div>

          <section
            className="terms-section"
            id="acceptance"
          >
            <span className="terms-section-number">
              01
            </span>

            <h2>
              Acceptance of Terms
            </h2>

            <p>
              These Terms and Conditions form a legally binding
              agreement between you and Hogenakkal Home Stays,
              operated by VeeraWebTech.
            </p>

            <p>
              By accessing the website or using any HHS service, you
              confirm that you have read, understood and agreed to be
              bound by these terms and all policies referenced within
              them.
            </p>

            <p>
              If you do not agree with these terms, you should not
              create an account, make a booking, submit a property or
              continue using the platform.
            </p>
          </section>

          <section
            className="terms-section"
            id="platform"
          >
            <span className="terms-section-number">
              02
            </span>

            <h2>
              Platform Services
            </h2>

            <p>
              Hogenakkal Home Stays provides an online platform where
              travellers can discover and reserve homestays, cottages,
              resorts and other eligible accommodation near
              Hogenakkal and surrounding destinations.
            </p>

            <p>
              Property owners can use the platform to submit and
              manage property listings, availability, pricing,
              amenities and bookings after completing applicable
              verification requirements.
            </p>

            <p>
              Unless expressly stated otherwise, accommodation
              services are provided by the respective property owner.
              HHS facilitates communication, booking administration
              and related platform services.
            </p>

            <div className="terms-callout">
              <strong>
                Property information
              </strong>

              <p>
                Property descriptions, photographs, amenities and
                rules are provided by property owners and may be
                updated when necessary.
              </p>
            </div>
          </section>

          <section
            className="terms-section"
            id="eligibility"
          >
            <span className="terms-section-number">
              03
            </span>

            <h2>
              User Eligibility
            </h2>

            <p>
              You must be at least 18 years old and legally capable of
              entering into a binding agreement to create an account
              or make a booking.
            </p>

            <p>
              When making a booking for another person, you confirm
              that you have permission to provide their information
              and accept these terms on their behalf.
            </p>

            <p>
              HHS may request identity, age, contact or business
              verification information where reasonably required for
              safety, fraud prevention, account verification or legal
              compliance.
            </p>
          </section>

          <section
            className="terms-section"
            id="accounts"
          >
            <span className="terms-section-number">
              04
            </span>

            <h2>
              User Accounts
            </h2>

            <p>
              You must provide accurate, current and complete
              information while registering and keep your profile
              information updated.
            </p>

            <ul>
              <li>
                You are responsible for maintaining the security of
                your password and authentication credentials.
              </li>

              <li>
                You must not share your account with another person
                or permit unauthorized access.
              </li>

              <li>
                You must notify HHS immediately if you suspect that
                your account has been accessed without permission.
              </li>

              <li>
                You are responsible for activities completed through
                your account unless caused by an HHS security failure.
              </li>
            </ul>

            <p>
              HHS may temporarily restrict an account when suspicious
              activity, unauthorized access, fraud or a violation of
              these terms is detected.
            </p>
          </section>

          <section
            className="terms-section"
            id="bookings"
          >
            <span className="terms-section-number">
              05
            </span>

            <h2>
              Bookings and Reservations
            </h2>

            <p>
              A booking request is subject to property availability,
              guest capacity, property rules and successful completion
              of any required booking or payment verification.
            </p>

            <p>
              A booking is considered confirmed only when the platform
              displays a confirmed status and provides a booking
              reference or confirmation notice.
            </p>

            <ul>
              <li>
                Check-in and check-out dates must be entered correctly.
              </li>

              <li>
                The number of guests must not exceed the permitted
                property capacity.
              </li>

              <li>
                Guests must provide valid contact and identification
                information.
              </li>

              <li>
                Special requests are subject to property approval and
                are not guaranteed.
              </li>
            </ul>

            <p>
              The property may refuse check-in when the booking
              information is materially incorrect, the guest cannot
              provide valid identification or the guest violates
              applicable law or property safety rules.
            </p>
          </section>

          <section
            className="terms-section"
            id="pricing"
          >
            <span className="terms-section-number">
              06
            </span>

            <h2>
              Pricing, Taxes and Payments
            </h2>

            <p>
              Property prices are generally displayed per room and per
              night unless the listing states otherwise.
            </p>

            <p>
              Before confirming a booking, the booking summary may
              display the accommodation amount, service fee, taxes,
              discounts and total payable amount.
            </p>

            <p>
              Payments may be processed through an authorized
              third-party payment service provider. HHS does not
              request that users provide payment card PINs, UPI PINs
              or internet banking passwords directly to HHS staff.
            </p>

            <div className="terms-callout warning">
              <strong>
                Payment safety
              </strong>

              <p>
                Never send money to an unknown personal account or
                share an OTP, card PIN or UPI PIN with a property owner,
                staff member or support representative.
              </p>
            </div>

            <p>
              Any payment provider fees, currency conversion charges
              or bank charges that apply outside the displayed booking
              total may be governed by the respective provider’s
              terms.
            </p>
          </section>

          <section
            className="terms-section"
            id="cancellations"
          >
            <span className="terms-section-number">
              07
            </span>

            <h2>
              Cancellations and Refunds
            </h2>

            <p>
              Cancellation eligibility and refund amounts depend on
              the applicable property cancellation conditions, the
              booking status, the cancellation time and any
              non-refundable charges disclosed during booking.
            </p>

            <p>
              Refunds, when approved, will normally be returned through
              the original payment method. Bank or payment-provider
              processing times may apply after HHS initiates a refund.
            </p>

            <p>
              A detailed explanation is available in our{" "}
              <Link to="/cancellation-refund-policy">
                Cancellation and Refund Policy
              </Link>
              .
            </p>
          </section>

          <section
            className="terms-section"
            id="guest-responsibilities"
          >
            <span className="terms-section-number">
              08
            </span>

            <h2>
              Guest Responsibilities
            </h2>

            <p>
              Guests must behave responsibly and respect the property,
              its staff, nearby residents, local culture and the
              natural environment.
            </p>

            <ul>
              <li>
                Follow all property check-in, check-out and safety
                instructions.
              </li>

              <li>
                Do not damage, remove or misuse property belongings.
              </li>

              <li>
                Do not conduct illegal, dangerous or disruptive
                activities.
              </li>

              <li>
                Do not bring undeclared guests beyond the booked
                capacity.
              </li>

              <li>
                Inform the property promptly about damage, safety
                problems or emergencies.
              </li>
            </ul>

            <p>
              A guest may be responsible for reasonable costs arising
              from damage caused intentionally or through negligence,
              subject to supporting information and applicable law.
            </p>
          </section>

          <section
            className="terms-section"
            id="owner-responsibilities"
          >
            <span className="terms-section-number">
              09
            </span>

            <h2>
              Property Owner Responsibilities
            </h2>

            <p>
              Property owners must provide accurate and current listing
              information and possess all registrations, permissions
              and authority required to operate and offer the
              accommodation.
            </p>

            <ul>
              <li>
                Listings must use genuine property photographs and
                descriptions.
              </li>

              <li>
                Prices, taxes, availability and additional charges
                must be disclosed accurately.
              </li>

              <li>
                The property must meet reasonable cleanliness, health
                and safety requirements.
              </li>

              <li>
                Confirmed bookings must be honoured unless a genuine
                emergency or legal restriction prevents the stay.
              </li>

              <li>
                Guest personal information must be used only for
                legitimate booking and legal requirements.
              </li>
            </ul>

            <p>
              HHS may suspend, reject or remove a property listing when
              its information is misleading, unverifiable, unsafe,
              unlawful or repeatedly associated with unresolved guest
              complaints.
            </p>
          </section>

          <section
            className="terms-section"
            id="reviews"
          >
            <span className="terms-section-number">
              10
            </span>

            <h2>
              Reviews and User Content
            </h2>

            <p>
              Eligible guests may submit reviews based on their genuine
              experience. Reviews should remain relevant, respectful
              and factually honest.
            </p>

            <p>
              Users must not publish unlawful, threatening,
              discriminatory, abusive, misleading or privacy-invasive
              content.
            </p>

            <p>
              HHS may moderate, hide or remove content that violates
              these terms, applicable law or platform safety
              requirements. Moderation does not mean HHS endorses every
              review or statement published by users.
            </p>
          </section>

          <section
            className="terms-section"
            id="prohibited"
          >
            <span className="terms-section-number">
              11
            </span>

            <h2>
              Prohibited Activities
            </h2>

            <p>
              You must not use HHS to:
            </p>

            <ul>
              <li>
                Create fraudulent bookings, listings, payments,
                refunds or reviews.
              </li>

              <li>
                Impersonate another person or misrepresent your
                identity or authority.
              </li>

              <li>
                Circumvent platform security, verification or access
                restrictions.
              </li>

              <li>
                Introduce malware, automated scraping tools or harmful
                code.
              </li>

              <li>
                Collect another user’s information without a lawful
                purpose.
              </li>

              <li>
                Use the platform for unlawful, exploitative or harmful
                activities.
              </li>
            </ul>
          </section>

          <section
            className="terms-section"
            id="liability"
          >
            <span className="terms-section-number">
              12
            </span>

            <h2>
              Service Availability and Liability
            </h2>

            <p>
              HHS works to keep the platform accurate, secure and
              available. However, uninterrupted access cannot be
              guaranteed because maintenance, network failures,
              provider outages or events outside reasonable control
              may temporarily affect the service.
            </p>

            <p>
              Property owners remain responsible for accommodation
              services they provide. Guests remain responsible for
              their conduct and compliance with property rules.
            </p>

            <p>
              To the extent permitted by law, HHS will not be
              responsible for indirect or consequential loss caused by
              circumstances beyond its reasonable control.
            </p>

            <p>
              Nothing in these terms limits rights or remedies that
              cannot lawfully be excluded under applicable consumer
              protection law.
            </p>
          </section>

          <section
            className="terms-section"
            id="termination"
          >
            <span className="terms-section-number">
              13
            </span>

            <h2>
              Account Restriction and Termination
            </h2>

            <p>
              HHS may warn, restrict, suspend or terminate an account
              when reasonably necessary to:
            </p>

            <ul>
              <li>
                Protect guests, property owners, staff or the platform.
              </li>

              <li>
                Investigate suspected fraud or unauthorized access.
              </li>

              <li>
                Comply with legal, regulatory or law-enforcement
                requirements.
              </li>

              <li>
                Respond to serious or repeated violations of these
                terms.
              </li>
            </ul>

            <p>
              Where appropriate, users may contact support to request
              information about an account restriction or submit
              relevant clarification.
            </p>
          </section>

          <section
            className="terms-section"
            id="governing-law"
          >
            <span className="terms-section-number">
              14
            </span>

            <h2>
              Governing Law and Disputes
            </h2>

            <p>
              These terms are governed by the laws of India. Subject
              to applicable consumer rights and mandatory legal
              jurisdiction, disputes relating to these terms or the
              HHS platform will be subject to the competent courts of
              Dharmapuri District, Tamil Nadu.
            </p>

            <p>
              Before beginning formal proceedings, users are encouraged
              to contact HHS support so that the issue can be reviewed
              and an appropriate resolution can be attempted.
            </p>
          </section>

          <section
            className="terms-section"
            id="changes"
          >
            <span className="terms-section-number">
              15
            </span>

            <h2>
              Changes to These Terms
            </h2>

            <p>
              HHS may update these Terms and Conditions when platform
              features, legal requirements or business processes
              change.
            </p>

            <p>
              The updated effective date will be displayed at the top
              of this page. Material changes may also be communicated
              through the website, registered email address or an
              in-app notification.
            </p>

            <p>
              Continued use of HHS after updated terms take effect
              indicates acceptance of the revised terms, except where
              additional consent is required by law.
            </p>
          </section>

          <section
            className="terms-section terms-contact-section"
            id="contact"
          >
            <span className="terms-section-number">
              16
            </span>

            <h2>
              Contact Information
            </h2>

            <p>
              For questions, complaints or requests relating to these
              Terms and Conditions, contact:
            </p>

            <div className="terms-contact-grid">
              <div>
                <span>Business</span>
                <strong>
                  Hogenakkal Home Stays
                </strong>
                <small>
                  Operated by VeeraWebTech
                </small>
              </div>

              <div>
                <span>Email</span>
                <a href="mailto:hogenakkalhomestays@gmail.com">
                  hogenakkalhomestays@gmail.com
                </a>
              </div>

              <div>
                <span>Phone</span>
                <a href="tel:+917871779134">
                  +91 78717 79134
                </a>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  Hogenakkal, Dharmapuri District
                </strong>
                <small>
                  Tamil Nadu, India
                </small>
              </div>
            </div>
          </section>

          <div className="terms-policy-navigation">
            <Link to="/">
              ← Return Home
            </Link>

            <Link to="/privacy-policy">
              Privacy Policy →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default TermsAndConditions;