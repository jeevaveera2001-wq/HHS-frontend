import {
  Link,
} from "react-router-dom";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import "./ServiceDeliveryPolicy.css";

const deliverySections = [
  {
    id: "overview",
    label: "Policy Overview",
  },
  {
    id: "no-shipping",
    label: "No Physical Shipping",
  },
  {
    id: "booking-delivery",
    label: "Booking Confirmation",
  },
  {
    id: "delivery-time",
    label: "Delivery Timeline",
  },
  {
    id: "pending-bookings",
    label: "Pending Bookings",
  },
  {
    id: "property-service",
    label: "Accommodation Service",
  },
  {
    id: "guest-requirements",
    label: "Guest Requirements",
  },
  {
    id: "delivery-failure",
    label: "Delivery Problems",
  },
  {
    id: "receipts",
    label: "Receipts and Records",
  },
  {
    id: "service-area",
    label: "Service Area",
  },
  {
    id: "contact",
    label: "Contact Support",
  },
];

function ServiceDeliveryPolicy() {
  return (
    <main className="delivery-policy-page">
      <section className="delivery-policy-hero">
        <div className="delivery-hero-shape delivery-shape-one" />
        <div className="delivery-hero-shape delivery-shape-two" />

        <div className="delivery-policy-hero-content">
          <BrandLogo
            className="delivery-policy-logo"
            variant="default"
          />

          <span className="delivery-policy-eyebrow">
            Digital Booking Service
          </span>

          <h1>
            Service Delivery Policy
          </h1>

          <p>
            This policy explains how booking confirmations, receipts
            and accommodation services are delivered through
            Hogenakkal Home Stays.
          </p>

          <div className="delivery-policy-meta">
            <span>
              Effective date: 02 August 2026
            </span>

            <span>
              Last updated: 02 August 2026
            </span>
          </div>
        </div>
      </section>

      <div className="delivery-policy-layout">
        <aside className="delivery-policy-sidebar">
          <div className="delivery-sidebar-card">
            <span className="delivery-sidebar-title">
              Policy sections
            </span>

            <nav aria-label="Service delivery policy sections">
              {deliverySections.map((section) => (
                <a
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="delivery-support-card">
            <span>
              Missing confirmation?
            </span>

            <p>
              Contact HHS support with your booking reference and
              registered email address.
            </p>

            <a href="mailto:hogenakkalhomestays@gmail.com?subject=HHS Booking Confirmation Support">
              Contact support
            </a>
          </div>
        </aside>

        <article className="delivery-policy-content">
          <div className="delivery-summary">
            <div className="delivery-summary-icon">
              ✓
            </div>

            <div>
              <strong>
                Digital service delivery
              </strong>

              <p>
                HHS does not sell or ship physical products. Booking
                confirmations, invoices and service updates are
                delivered electronically.
              </p>
            </div>
          </div>

          <section
            className="delivery-section"
            id="overview"
          >
            <span className="delivery-section-number">
              01
            </span>

            <h2>
              Policy Overview
            </h2>

            <p>
              Hogenakkal Home Stays is an online accommodation-booking
              platform operated by VeeraWebTech.
            </p>

            <p>
              Customers use HHS to discover accommodation, check
              availability, create reservations and receive booking
              confirmations. Property owners use HHS to list and
              provide accommodation services.
            </p>

            <p>
              This Service Delivery Policy applies to:
            </p>

            <ul>
              <li>
                Digital booking confirmations.
              </li>

              <li>
                Booking references and reservation records.
              </li>

              <li>
                Electronic invoices and receipts.
              </li>

              <li>
                Booking-status and service-related notifications.
              </li>

              <li>
                Accommodation services provided on the reserved dates.
              </li>
            </ul>
          </section>

          <section
            className="delivery-section"
            id="no-shipping"
          >
            <span className="delivery-section-number">
              02
            </span>

            <h2>
              No Physical Shipping
            </h2>

            <div className="delivery-no-shipping-card">
              <span>
                📦
              </span>

              <div>
                <strong>
                  No products are shipped
                </strong>

                <p>
                  HHS provides digital booking and accommodation
                  services. We do not manufacture, sell, package,
                  courier or physically ship goods to customers.
                </p>
              </div>
            </div>

            <p>
              Therefore, traditional shipping charges, tracking
              numbers, courier partners and physical delivery
              addresses do not apply to standard HHS bookings.
            </p>

            <p>
              The customer’s contact and guest information is collected
              to manage the reservation, communicate booking updates
              and support check-in—not to deliver physical goods.
            </p>
          </section>

          <section
            className="delivery-section"
            id="booking-delivery"
          >
            <span className="delivery-section-number">
              03
            </span>

            <h2>
              Booking Confirmation Delivery
            </h2>

            <p>
              After a booking is successfully created, HHS generates a
              unique booking reference.
            </p>

            <p>
              Once all required booking and payment verification is
              completed, the confirmed reservation may be delivered
              through:
            </p>

            <div className="delivery-method-grid">
              <article>
                <span>
                  👤
                </span>

                <h3>
                  Customer account
                </h3>

                <p>
                  The reservation appears under the customer’s My
                  Bookings page.
                </p>
              </article>

              <article>
                <span>
                  ✉️
                </span>

                <h3>
                  Registered email
                </h3>

                <p>
                  A confirmation email may be sent to the email address
                  associated with the booking.
                </p>
              </article>

              <article>
                <span>
                  🔔
                </span>

                <h3>
                  In-app notification
                </h3>

                <p>
                  HHS may display an on-screen message confirming the
                  booking or status update.
                </p>
              </article>

              <article>
                <span>
                  🧾
                </span>

                <h3>
                  Digital receipt
                </h3>

                <p>
                  A downloadable or viewable receipt may become
                  available after successful payment verification.
                </p>
              </article>
            </div>

            <p>
              Customers should verify that their email address and
              phone number are correct before submitting a booking.
            </p>

            <div className="delivery-callout">
              <strong>
                Booking status matters
              </strong>

              <p>
                A booking reference alone does not always mean that the
                stay is confirmed. Check the booking status shown in
                My Bookings.
              </p>
            </div>
          </section>

          <section
            className="delivery-section"
            id="delivery-time"
          >
            <span className="delivery-section-number">
              04
            </span>

            <h2>
              Digital Delivery Timeline
            </h2>

            <p>
              Booking creation and confirmation normally follow this
              process:
            </p>

            <div className="delivery-timeline">
              <article>
                <span>
                  1
                </span>

                <div>
                  <strong>
                    Availability checked
                  </strong>

                  <p>
                    HHS confirms whether the requested rooms are
                    available for the selected dates.
                  </p>
                </div>
              </article>

              <article>
                <span>
                  2
                </span>

                <div>
                  <strong>
                    Booking created
                  </strong>

                  <p>
                    A booking reference is generated using the guest
                    and reservation information.
                  </p>
                </div>
              </article>

              <article>
                <span>
                  3
                </span>

                <div>
                  <strong>
                    Payment verified
                  </strong>

                  <p>
                    Where payment is required, HHS waits for a valid
                    payment confirmation from the payment provider.
                  </p>
                </div>
              </article>

              <article>
                <span>
                  4
                </span>

                <div>
                  <strong>
                    Confirmation delivered
                  </strong>

                  <p>
                    The booking is updated and displayed in the
                    customer account.
                  </p>
                </div>
              </article>
            </div>

            <p>
              Digital confirmation is usually generated shortly after
              successful verification. Delays may occur because of
              network problems, payment-provider processing, security
              review or temporary platform maintenance.
            </p>

            <p>
              If a successfully paid booking is not updated within 30
              minutes, the customer should avoid making a duplicate
              payment and contact HHS support.
            </p>
          </section>

          <section
            className="delivery-section"
            id="pending-bookings"
          >
            <span className="delivery-section-number">
              05
            </span>

            <h2>
              Pending and Failed Bookings
            </h2>

            <div className="delivery-status-list">
              <article>
                <span className="pending">
                  Pending
                </span>

                <div>
                  <strong>
                    Verification in progress
                  </strong>

                  <p>
                    HHS is waiting for payment, availability or
                    administrative verification.
                  </p>
                </div>
              </article>

              <article>
                <span className="confirmed">
                  Confirmed
                </span>

                <div>
                  <strong>
                    Reservation successfully delivered
                  </strong>

                  <p>
                    The booking is confirmed for the displayed dates,
                    rooms and guest count.
                  </p>
                </div>
              </article>

              <article>
                <span className="failed">
                  Failed
                </span>

                <div>
                  <strong>
                    Booking could not be completed
                  </strong>

                  <p>
                    Payment or booking verification was unsuccessful.
                    The customer should review the displayed message
                    before retrying.
                  </p>
                </div>
              </article>

              <article>
                <span className="refund">
                  Refund pending
                </span>

                <div>
                  <strong>
                    Payment captured without confirmation
                  </strong>

                  <p>
                    The payment is being reviewed or returned because
                    the booking could not be confirmed.
                  </p>
                </div>
              </article>
            </div>

            <p>
              Customers should not travel to the property based only
              on a pending or failed booking. A confirmed status is
              required.
            </p>
          </section>

          <section
            className="delivery-section"
            id="property-service"
          >
            <span className="delivery-section-number">
              06
            </span>

            <h2>
              Delivery of Accommodation Services
            </h2>

            <p>
              The physical accommodation service is provided at the
              property location during the confirmed booking period.
            </p>

            <p>
              Property owners are responsible for:
            </p>

            <ul>
              <li>
                Keeping confirmed accommodation available for the
                guest.
              </li>

              <li>
                Providing the room type and basic facilities described
                in the listing.
              </li>

              <li>
                Maintaining reasonable cleanliness, safety and
                hospitality standards.
              </li>

              <li>
                Providing check-in assistance during the stated
                check-in period.
              </li>

              <li>
                Informing HHS promptly if the property cannot honour a
                confirmed booking.
              </li>
            </ul>

            <p>
              Property-specific facilities, meal plans, transport,
              activities or additional services are provided only when
              included in the booking or separately agreed with the
              property.
            </p>
          </section>

          <section
            className="delivery-section"
            id="guest-requirements"
          >
            <span className="delivery-section-number">
              07
            </span>

            <h2>
              Guest Check-In Requirements
            </h2>

            <p>
              To receive the booked accommodation service, guests may
              be required to provide:
            </p>

            <ul>
              <li>
                The HHS booking reference.
              </li>

              <li>
                A valid government-issued identity document.
              </li>

              <li>
                The name and phone number used for the booking.
              </li>

              <li>
                Guest information required by applicable law.
              </li>

              <li>
                Confirmation of any remaining amount clearly disclosed
                during booking.
              </li>
            </ul>

            <p>
              Guests must arrive within the stated check-in period or
              inform the property about a delayed arrival.
            </p>

            <p>
              Accommodation may be refused when the guest cannot
              provide required identification, materially exceeds the
              booked guest capacity or violates applicable law or
              property safety rules.
            </p>
          </section>

          <section
            className="delivery-section"
            id="delivery-failure"
          >
            <span className="delivery-section-number">
              08
            </span>

            <h2>
              Service Delivery Problems
            </h2>

            <p>
              Customers should contact HHS immediately when:
            </p>

            <ul>
              <li>
                A payment succeeded but no booking confirmation was
                received.
              </li>

              <li>
                The booking does not appear under My Bookings.
              </li>

              <li>
                The property cannot locate a confirmed booking.
              </li>

              <li>
                The property is closed or unavailable on arrival.
              </li>

              <li>
                The delivered room materially differs from the
                confirmed booking.
              </li>

              <li>
                A serious cleanliness or safety issue prevents use of
                the accommodation.
              </li>
            </ul>

            <p>
              HHS may request photographs, messages, payment
              references, booking information or other reasonable
              evidence to investigate the issue.
            </p>

            <div className="delivery-callout warning">
              <strong>
                Report promptly
              </strong>

              <p>
                Where possible, report an accommodation problem before
                checking out or arranging another stay so that HHS and
                the property have an opportunity to assist.
              </p>
            </div>

            <p>
              Depending on the verified circumstances, HHS may help
              arrange:
            </p>

            <ul>
              <li>
                Correction of the booking information.
              </li>

              <li>
                An alternative room or property.
              </li>

              <li>
                Partial refund for an affected service.
              </li>

              <li>
                Full cancellation and refund where appropriate.
              </li>
            </ul>
          </section>

          <section
            className="delivery-section"
            id="receipts"
          >
            <span className="delivery-section-number">
              09
            </span>

            <h2>
              Booking Records and Receipts
            </h2>

            <p>
              Customers should keep their booking reference and
              digital receipt until the stay, cancellation and any
              refund process are complete.
            </p>

            <div className="delivery-record-grid">
              <article>
                <span>
                  Booking reference
                </span>

                <p>
                  The unique HHS identifier used to locate the
                  reservation.
                </p>
              </article>

              <article>
                <span>
                  Booking details
                </span>

                <p>
                  Property, dates, rooms, guests and primary guest
                  information.
                </p>
              </article>

              <article>
                <span>
                  Price summary
                </span>

                <p>
                  Accommodation amount, fees, taxes, discounts and
                  total.
                </p>
              </article>

              <article>
                <span>
                  Payment record
                </span>

                <p>
                  Transaction reference, payment status and refund
                  information where applicable.
                </p>
              </article>
            </div>

            <p>
              A receipt confirms the recorded transaction. It does not
              replace any identification or check-in document required
              by the property or applicable law.
            </p>
          </section>

          <section
            className="delivery-section"
            id="service-area"
          >
            <span className="delivery-section-number">
              10
            </span>

            <h2>
              Service Area
            </h2>

            <p>
              HHS primarily lists accommodation in and around
              Hogenakkal, Dharmapuri District, Tamil Nadu.
            </p>

            <p>
              Additional nearby destinations may be added as verified
              property partners join the platform.
            </p>

            <p>
              Property availability, check-in services and amenities
              depend on the specific listing and selected travel dates.
            </p>
          </section>

          <section
            className="delivery-section delivery-contact-section"
            id="contact"
          >
            <span className="delivery-section-number">
              11
            </span>

            <h2>
              Service Delivery Support
            </h2>

            <p>
              Contact the HHS support team if you have not received a
              booking confirmation or experience a problem receiving
              your reserved accommodation.
            </p>

            <div className="delivery-contact-card">
              <div className="delivery-contact-icon">
                🏨
              </div>

              <div>
                <span>
                  HHS Booking Support
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

          <div className="delivery-policy-navigation">
            <Link to="/cancellation-refund-policy">
              ← Cancellation Policy
            </Link>

            <Link to="/contact">
              Contact HHS →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default ServiceDeliveryPolicy;