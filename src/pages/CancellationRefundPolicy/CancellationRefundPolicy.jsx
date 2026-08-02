import {
  Link,
} from "react-router-dom";

import BrandLogo from "../../components/BrandLogo/BrandLogo";

import "./CancellationRefundPolicy.css";

const policySections = [
  {
    id: "overview",
    label: "Policy Overview",
  },
  {
    id: "cancellation-window",
    label: "Cancellation Charges",
  },
  {
    id: "pending-bookings",
    label: "Pending Bookings",
  },
  {
    id: "property-cancellation",
    label: "Property Cancellation",
  },
  {
    id: "no-show",
    label: "No-Show and Early Exit",
  },
  {
    id: "refund-process",
    label: "Refund Process",
  },
  {
    id: "refund-timeline",
    label: "Refund Timeline",
  },
  {
    id: "non-refundable",
    label: "Non-Refundable Charges",
  },
  {
    id: "date-changes",
    label: "Booking Changes",
  },
  {
    id: "force-majeure",
    label: "Exceptional Events",
  },
  {
    id: "disputes",
    label: "Refund Disputes",
  },
  {
    id: "contact",
    label: "Contact Support",
  },
];

const cancellationTiers = [
  {
    period: "7 days or more",
    description:
      "Cancellation received at least 7 full days before the scheduled check-in time.",
    refund: "100%",
    className: "full",
  },
  {
    period: "72 hours to 7 days",
    description:
      "Cancellation received between 72 hours and 7 days before scheduled check-in.",
    refund: "75%",
    className: "high",
  },
  {
    period: "24 to 72 hours",
    description:
      "Cancellation received between 24 and 72 hours before scheduled check-in.",
    refund: "50%",
    className: "partial",
  },
  {
    period: "Less than 24 hours",
    description:
      "Cancellation received less than 24 hours before scheduled check-in.",
    refund: "0%",
    className: "none",
  },
];

function CancellationRefundPolicy() {
  return (
    <main className="refund-policy-page">
      <section className="refund-policy-hero">
        <div className="refund-hero-shape refund-shape-one" />
        <div className="refund-hero-shape refund-shape-two" />

        <div className="refund-policy-hero-content">
          <BrandLogo
            className="refund-policy-logo"
            variant="default"
          />

          <span className="refund-policy-eyebrow">
            Booking Protection
          </span>

          <h1>
            Cancellation and Refund Policy
          </h1>

          <p>
            This policy explains when an HHS booking can be cancelled,
            how the refundable amount is calculated and how approved
            refunds are processed.
          </p>

          <div className="refund-policy-meta">
            <span>
              Effective date: 02 August 2026
            </span>

            <span>
              Last updated: 02 August 2026
            </span>
          </div>
        </div>
      </section>

      <div className="refund-policy-layout">
        <aside className="refund-policy-sidebar">
          <div className="refund-sidebar-card">
            <span className="refund-sidebar-title">
              Policy sections
            </span>

            <nav aria-label="Cancellation and refund policy sections">
              {policySections.map((section) => (
                <a
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="refund-support-card">
            <span>
              Booking problem?
            </span>

            <p>
              Keep your booking reference ready and contact our support
              team for assistance.
            </p>

            <a href="mailto:hogenakkalhomestays@gmail.com?subject=HHS Booking Cancellation">
              Contact support
            </a>
          </div>
        </aside>

        <article className="refund-policy-content">
          <div className="refund-important-note">
            <span>
              Important
            </span>

            <p>
              Refund percentages are calculated using the time at which
              HHS receives the cancellation request, based on the
              property’s scheduled check-in time.
            </p>
          </div>

          <section
            className="refund-section"
            id="overview"
          >
            <span className="refund-section-number">
              01
            </span>

            <h2>
              Policy Overview
            </h2>

            <p>
              This Cancellation and Refund Policy applies to eligible
              accommodation bookings made through the Hogenakkal Home
              Stays website.
            </p>

            <p>
              By submitting a booking, you agree to the cancellation
              conditions shown during booking and the terms contained
              in this policy.
            </p>

            <p>
              The amount eligible for refund depends on:
            </p>

            <ul>
              <li>
                The booking and payment status.
              </li>

              <li>
                The time remaining before the scheduled check-in.
              </li>

              <li>
                Whether the customer or property owner cancelled the
                booking.
              </li>

              <li>
                Any property-specific condition clearly disclosed
                before booking.
              </li>

              <li>
                Whether part of the booking has already been used.
              </li>

              <li>
                Whether a previous refund was already processed.
              </li>
            </ul>

            <div className="refund-callout">
              <strong>
                Booking reference required
              </strong>

              <p>
                Always provide your HHS booking reference when
                requesting cancellation or refund assistance.
              </p>
            </div>
          </section>

          <section
            className="refund-section"
            id="cancellation-window"
          >
            <span className="refund-section-number">
              02
            </span>

            <h2>
              Customer Cancellation Charges
            </h2>

            <p>
              Unless a different property-specific policy was clearly
              disclosed before payment, the following standard HHS
              cancellation structure applies.
            </p>

            <div className="refund-tier-table">
              <div className="refund-tier-heading">
                <span>
                  Cancellation period
                </span>

                <span>
                  Refundable accommodation amount
                </span>
              </div>

              {cancellationTiers.map((tier) => (
                <div
                  className="refund-tier-row"
                  key={tier.period}
                >
                  <div>
                    <strong>
                      {tier.period}
                    </strong>

                    <p>
                      {tier.description}
                    </p>
                  </div>

                  <span
                    className={`refund-percentage ${tier.className}`}
                  >
                    {tier.refund}
                  </span>
                </div>
              ))}
            </div>

            <div className="refund-calculation-example">
              <span>
                Example
              </span>

              <div>
                <strong>
                  Refund calculation
                </strong>

                <p>
                  If the refundable accommodation amount is ₹4,000 and
                  the booking is cancelled four days before check-in,
                  the applicable 75% refund would be ₹3,000 before any
                  lawfully disclosed non-refundable charges.
                </p>
              </div>
            </div>

            <p>
              Cancellation percentages apply to the refundable
              accommodation amount. Taxes connected to the refunded
              accommodation amount will be handled as required by
              applicable tax and payment rules.
            </p>
          </section>

          <section
            className="refund-section"
            id="pending-bookings"
          >
            <span className="refund-section-number">
              03
            </span>

            <h2>
              Pending and Unconfirmed Bookings
            </h2>

            <p>
              A booking may remain pending while payment or booking
              confirmation is being verified.
            </p>

            <div className="refund-status-grid">
              <article>
                <span>
                  🕓
                </span>

                <h3>
                  No payment captured
                </h3>

                <p>
                  If payment was not captured, the pending booking may
                  be cancelled without a refund because no amount was
                  successfully collected.
                </p>
              </article>

              <article>
                <span>
                  💳
                </span>

                <h3>
                  Payment captured but not confirmed
                </h3>

                <p>
                  If payment was successfully captured but HHS could
                  not confirm the booking, the captured amount will be
                  eligible for a full refund.
                </p>
              </article>

              <article>
                <span>
                  ⏱️
                </span>

                <h3>
                  Booking hold expired
                </h3>

                <p>
                  If a payment is received after the booking hold
                  expires and the booking cannot be confirmed, the
                  payment will be marked for refund review.
                </p>
              </article>
            </div>
          </section>

          <section
            className="refund-section"
            id="property-cancellation"
          >
            <span className="refund-section-number">
              04
            </span>

            <h2>
              Cancellation by the Property or HHS
            </h2>

            <p>
              If a confirmed booking is cancelled by the property
              owner because the property cannot provide the reserved
              accommodation, the customer will be eligible for:
            </p>

            <ul>
              <li>
                A full refund of the amount paid for the affected
                booking; or
              </li>

              <li>
                An alternative property or revised booking, if offered
                and accepted by the customer.
              </li>
            </ul>

            <p>
              The customer is not required to accept an alternative
              property. If the alternative is declined, the eligible
              booking amount will be processed for a full refund.
            </p>

            <p>
              HHS may cancel or suspend a booking when reasonably
              necessary because of:
            </p>

            <ul>
              <li>
                A safety or security risk.
              </li>

              <li>
                Suspected fraud or unauthorized payment.
              </li>

              <li>
                Incorrect property availability.
              </li>

              <li>
                A legal or government restriction.
              </li>

              <li>
                Materially incorrect booking information.
              </li>
            </ul>

            <p>
              Refund eligibility in these cases will depend on the
              reason for cancellation and whether the customer caused
              or contributed to the issue.
            </p>
          </section>

          <section
            className="refund-section"
            id="no-show"
          >
            <span className="refund-section-number">
              05
            </span>

            <h2>
              No-Show, Late Arrival and Early Departure
            </h2>

            <h3>
              No-show
            </h3>

            <p>
              A booking may be treated as a no-show when the guest does
              not arrive on the scheduled check-in date and does not
              inform the property or HHS within a reasonable time.
            </p>

            <p>
              No-show bookings are generally not eligible for a refund
              unless the absence resulted from a verified emergency or
              another exception accepted by HHS and the property.
            </p>

            <h3>
              Late arrival
            </h3>

            <p>
              Guests should contact the property or HHS when they
              expect to arrive later than the stated check-in time.
              Failure to communicate may cause the property to release
              the room in accordance with its check-in rules.
            </p>

            <h3>
              Early departure
            </h3>

            <p>
              When a guest checks out before the scheduled departure
              date, unused nights are not automatically refundable.
              Any refund will depend on the reason, evidence provided,
              property approval and applicable consumer rights.
            </p>
          </section>

          <section
            className="refund-section"
            id="refund-process"
          >
            <span className="refund-section-number">
              06
            </span>

            <h2>
              How to Request a Cancellation
            </h2>

            <p>
              Customers should cancel through the My Bookings page
              whenever the cancellation option is available.
            </p>

            <div className="refund-process-steps">
              <article>
                <span>
                  1
                </span>

                <div>
                  <h3>
                    Open My Bookings
                  </h3>

                  <p>
                    Log in using the account that created the booking
                    and open the relevant reservation.
                  </p>
                </div>
              </article>

              <article>
                <span>
                  2
                </span>

                <div>
                  <h3>
                    Select Cancel Booking
                  </h3>

                  <p>
                    Review the booking information and select the
                    cancellation option.
                  </p>
                </div>
              </article>

              <article>
                <span>
                  3
                </span>

                <div>
                  <h3>
                    Provide a reason
                  </h3>

                  <p>
                    Enter an accurate cancellation reason and provide
                    supporting information when requested.
                  </p>
                </div>
              </article>

              <article>
                <span>
                  4
                </span>

                <div>
                  <h3>
                    Review refund status
                  </h3>

                  <p>
                    The booking will display whether a refund is
                    pending, processed, partially refunded or not
                    applicable.
                  </p>
                </div>
              </article>
            </div>

            <p>
              If you cannot access your account, contact support using
              the registered email address and provide:
            </p>

            <ul>
              <li>
                Booking reference.
              </li>

              <li>
                Primary guest name.
              </li>

              <li>
                Registered phone number or email.
              </li>

              <li>
                Cancellation reason.
              </li>

              <li>
                Supporting evidence, when requesting an exception.
              </li>
            </ul>
          </section>

          <section
            className="refund-section"
            id="refund-timeline"
          >
            <span className="refund-section-number">
              07
            </span>

            <h2>
              Refund Processing Timeline
            </h2>

            <p>
              Once a refund is approved and submitted to the payment
              provider, its status may initially appear as refund
              pending.
            </p>

            <div className="refund-timeline">
              <div>
                <span>
                  01
                </span>

                <strong>
                  Refund reviewed
                </strong>

                <p>
                  HHS verifies the booking, payment and cancellation
                  information.
                </p>
              </div>

              <div>
                <span>
                  02
                </span>

                <strong>
                  Refund initiated
                </strong>

                <p>
                  The approved amount is submitted to the payment
                  provider.
                </p>
              </div>

              <div>
                <span>
                  03
                </span>

                <strong>
                  Provider processing
                </strong>

                <p>
                  The bank or payment provider processes the refund to
                  the original payment method.
                </p>
              </div>

              <div>
                <span>
                  04
                </span>

                <strong>
                  Refund completed
                </strong>

                <p>
                  The booking and payment records are updated after
                  confirmation.
                </p>
              </div>
            </div>

            <p>
              Normal refunds generally take approximately 5–7 working
              days after successful initiation. The exact time may
              vary depending on the issuing bank, payment method and
              payment provider.
            </p>

            <div className="refund-callout neutral">
              <strong>
                Original payment method
              </strong>

              <p>
                Refunds are normally returned to the same payment
                method used for the original transaction. HHS will not
                request a UPI PIN, OTP or card PIN to complete a refund.
              </p>
            </div>
          </section>

          <section
            className="refund-section"
            id="non-refundable"
          >
            <span className="refund-section-number">
              08
            </span>

            <h2>
              Non-Refundable Amounts
            </h2>

            <p>
              Depending on the booking and applicable disclosures, the
              following amounts may be non-refundable:
            </p>

            <ul>
              <li>
                Accommodation charges excluded by the applicable
                cancellation tier.
              </li>

              <li>
                Clearly disclosed non-refundable promotional rates.
              </li>

              <li>
                Payment-provider or banking charges already incurred
                and not recoverable by HHS, where legally permitted.
              </li>

              <li>
                Charges for accommodation or services already used.
              </li>

              <li>
                Verified property-damage or additional-service charges.
              </li>

              <li>
                Amounts previously refunded.
              </li>
            </ul>

            <p>
              HHS will not deduct an undisclosed cancellation charge
              from an eligible refund.
            </p>
          </section>

          <section
            className="refund-section"
            id="date-changes"
          >
            <span className="refund-section-number">
              09
            </span>

            <h2>
              Date Changes and Booking Modifications
            </h2>

            <p>
              Requests to change travel dates, rooms or guest count
              depend on property availability and approval.
            </p>

            <p>
              A booking modification may result in:
            </p>

            <ul>
              <li>
                A price increase when the new dates or room selection
                cost more.
              </li>

              <li>
                A partial refund when the revised booking costs less.
              </li>

              <li>
                Cancellation and creation of a new booking when the
                existing reservation cannot be modified.
              </li>

              <li>
                Application of the cancellation policy if the requested
                modification cannot be accepted.
              </li>
            </ul>

            <p>
              A modification is confirmed only after the updated
              booking details and payment status appear on the HHS
              platform.
            </p>
          </section>

          <section
            className="refund-section"
            id="force-majeure"
          >
            <span className="refund-section-number">
              10
            </span>

            <h2>
              Emergencies and Exceptional Events
            </h2>

            <p>
              HHS may review cancellation exceptions for serious events
              outside the customer’s reasonable control, including:
            </p>

            <ul>
              <li>
                Government travel restrictions.
              </li>

              <li>
                Natural disasters or severe weather that prevents
                access to the destination.
              </li>

              <li>
                Verified medical emergencies.
              </li>

              <li>
                Closure of the booked property.
              </li>

              <li>
                Other serious events accepted by HHS after review.
              </li>
            </ul>

            <p>
              Supporting documents may be requested. An exception is
              not guaranteed and will be decided fairly based on the
              booking circumstances, property position and applicable
              law.
            </p>
          </section>

          <section
            className="refund-section"
            id="disputes"
          >
            <span className="refund-section-number">
              11
            </span>

            <h2>
              Failed Refunds and Disputes
            </h2>

            <p>
              If a refund fails, HHS may retry the refund through the
              payment provider or request additional information
              necessary to resolve the failure.
            </p>

            <p>
              If the platform shows a refund as processed but it has
              not appeared in your account after the expected
              processing period, contact support with:
            </p>

            <ul>
              <li>
                Booking reference.
              </li>

              <li>
                Refund amount.
              </li>

              <li>
                Refund initiation date.
              </li>

              <li>
                Payment or refund reference displayed on HHS.
              </li>
            </ul>

            <p>
              Customers should contact HHS before raising a duplicate
              chargeback or payment dispute so that the refund status
              can be verified.
            </p>

            <p>
              Nothing in this policy limits consumer rights or remedies
              that cannot be excluded under applicable law.
            </p>
          </section>

          <section
            className="refund-section refund-contact-section"
            id="contact"
          >
            <span className="refund-section-number">
              12
            </span>

            <h2>
              Cancellation and Refund Support
            </h2>

            <p>
              Contact the HHS support team for help with a booking
              cancellation or refund.
            </p>

            <div className="refund-contact-card">
              <div className="refund-contact-icon">
                🎧
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

          <div className="refund-policy-navigation">
            <Link to="/privacy-policy">
              ← Privacy Policy
            </Link>

            <Link to="/service-delivery-policy">
              Service Delivery Policy →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

export default CancellationRefundPolicy;