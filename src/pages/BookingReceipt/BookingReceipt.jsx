import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  getBookingById,
} from "../../services/bookingService";

import "./BookingReceipt.css";

/* =====================================
   Formatting helpers
===================================== */

const formatCurrency = (
  amount
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(
    Number(amount) || 0
  );
};

const formatDate = (
  date
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const formatDateTime = (
  date
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatStatus = (
  status
) => {
  if (!status) {
    return "Pending";
  }

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => {
      return letter.toUpperCase();
    });
};

const getErrorStatus = (
  error
) => {
  return (
    error?.status ||
    error?.response?.status ||
    0
  );
};

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.data?.message ||
    error?.response?.data
      ?.message ||
    error?.message ||
    fallback
  );
};

/* =====================================
   Booking receipt
===================================== */

function BookingReceipt() {
  const {
    bookingId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    booking,
    setBooking,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================
     Load booking
  ===================================== */

  const loadBooking =
    useCallback(async () => {
      if (!bookingId) {
        setError(
          "Invalid booking ID."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getBookingById(
            bookingId
          );

        if (!data?.booking) {
          throw new Error(
            "Booking details were not returned."
          );
        }

        setBooking(
          data.booking
        );
      } catch (
        requestError
      ) {
        if (
          getErrorStatus(
            requestError
          ) === 401
        ) {
          toast.error(
            "Please log in again."
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setError(
          getErrorMessage(
            requestError,
            "Unable to load this booking receipt."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      bookingId,
      navigate,
    ]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  /* =====================================
     Refund calculations
  ===================================== */

  const refunds = useMemo(() => {
    return Array.isArray(
      booking?.refunds
    )
      ? booking.refunds
      : [];
  }, [booking]);

  const totalRefunded =
    useMemo(() => {
      return refunds
        .filter((refund) => {
          return (
            refund.status ===
            "processed"
          );
        })
        .reduce(
          (
            total,
            refund
          ) => {
            return (
              total +
              Number(
                refund.amountInSubunits ||
                  0
              ) /
                100
            );
          },
          0
        );
    }, [refunds]);

  const handlePrint = () => {
    window.print();
  };

  /* =====================================
     Loading
  ===================================== */

  if (loading) {
    return (
      <main className="booking-receipt-state">
        <div className="booking-receipt-spinner" />

        <p>
          Loading booking receipt...
        </p>
      </main>
    );
  }

  /* =====================================
     Error
  ===================================== */

  if (error || !booking) {
    return (
      <main className="booking-receipt-state">
        <span>🧾</span>

        <h1>
          Receipt unavailable
        </h1>

        <p>
          {error ||
            "This booking could not be found."}
        </p>

        <Link to="/bookings">
          Return to My Bookings
        </Link>
      </main>
    );
  }

  const property =
    booking.property || {};

  const primaryGuest =
    booking.primaryGuest || {};

  const priceDetails =
    booking.priceDetails || {};

  const payment =
    booking.payment || {};

  const paymentId =
    payment.razorpayPaymentId ||
    booking.paymentTransactionId ||
    "—";

  const orderId =
    payment.razorpayOrderId ||
    "—";

  return (
    <main className="booking-receipt-page">
      {/* =================================
          Screen actions
      ================================= */}

      <div className="booking-receipt-actions">
        <Link to="/bookings">
          ← My Bookings
        </Link>

        <button
          type="button"
          onClick={handlePrint}
        >
          Print / Save PDF
        </button>
      </div>

      {/* =================================
          Printable receipt
      ================================= */}

      <article className="booking-receipt-document">
        <header className="receipt-header">
          <div className="receipt-brand">
            <div className="receipt-logo">
              HHS
            </div>

            <div>
              <h1>
                Hogenakkal Home Stay
              </h1>

              <p>
                Booking Confirmation
                & Payment Receipt
              </p>
            </div>
          </div>

          <div className="receipt-reference">
            <span>
              Booking Reference
            </span>

            <strong>
              {
                booking.bookingReference
              }
            </strong>

            <small>
              Created{" "}
              {formatDateTime(
                booking.createdAt
              )}
            </small>
          </div>
        </header>

        <section className="receipt-status-row">
          <div>
            <span>
              Booking status
            </span>

            <strong
              className={`receipt-status ${booking.bookingStatus}`}
            >
              {formatStatus(
                booking.bookingStatus
              )}
            </strong>
          </div>

          <div>
            <span>
              Payment status
            </span>

            <strong
              className={`receipt-status ${booking.paymentStatus}`}
            >
              {formatStatus(
                booking.paymentStatus
              )}
            </strong>
          </div>
        </section>

        {/* =================================
            Property details
        ================================= */}

        <section className="receipt-section">
          <h2>
            Property Details
          </h2>

          <div className="receipt-property">
            {property.images?.[0]
              ?.url && (
              <img
                src={
                  property.images[0]
                    .url
                }
                alt={
                  property.title ||
                  "HHS Property"
                }
              />
            )}

            <div>
              <h3>
                {property.title ||
                  "HHS Property"}
              </h3>

              <p>
                {property.location
                  ?.address ||
                  ""}
              </p>

              <p>
                {property.location
                  ?.city ||
                  "Hogenakkal"}
                ,{" "}
                {property.location
                  ?.district ||
                  "Dharmapuri"}
                ,{" "}
                {property.location
                  ?.state ||
                  "Tamil Nadu"}
              </p>
            </div>
          </div>
        </section>

        {/* =================================
            Guest and stay
        ================================= */}

        <div className="receipt-two-columns">
          <section className="receipt-section">
            <h2>
              Primary Guest
            </h2>

            <dl className="receipt-detail-list">
              <div>
                <dt>
                  Name
                </dt>

                <dd>
                  {primaryGuest.fullName ||
                    booking.customer
                      ?.fullName ||
                    "—"}
                </dd>
              </div>

              <div>
                <dt>
                  Email
                </dt>

                <dd>
                  {primaryGuest.email ||
                    booking.customer
                      ?.email ||
                    "—"}
                </dd>
              </div>

              <div>
                <dt>
                  Phone
                </dt>

                <dd>
                  {primaryGuest.phone ||
                    booking.customer
                      ?.phone ||
                    "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="receipt-section">
            <h2>
              Stay Details
            </h2>

            <dl className="receipt-detail-list">
              <div>
                <dt>
                  Check-in
                </dt>

                <dd>
                  {formatDate(
                    booking.checkInDate
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Check-out
                </dt>

                <dd>
                  {formatDate(
                    booking.checkOutDate
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Duration
                </dt>

                <dd>
                  {
                    booking.numberOfNights
                  }{" "}
                  night(s)
                </dd>
              </div>

              <div>
                <dt>
                  Rooms
                </dt>

                <dd>
                  {
                    booking.numberOfRooms
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Guests
                </dt>

                <dd>
                  {
                    booking.numberOfGuests
                  }
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* =================================
            Price breakdown
        ================================= */}

        <section className="receipt-section">
          <h2>
            Price Breakdown
          </h2>

          <div className="receipt-price-table">
            <div>
              <span>
                Room charges
              </span>

              <strong>
                {formatCurrency(
                  priceDetails.roomTotal
                )}
              </strong>
            </div>

            <div>
              <span>
                Service fee
              </span>

              <strong>
                {formatCurrency(
                  priceDetails.serviceFee
                )}
              </strong>
            </div>

            <div>
              <span>
                Taxes
              </span>

              <strong>
                {formatCurrency(
                  priceDetails.taxes
                )}
              </strong>
            </div>

            {Number(
              priceDetails.discount
            ) > 0 && (
              <div>
                <span>
                  Discount
                </span>

                <strong className="receipt-discount">
                  -
                  {formatCurrency(
                    priceDetails.discount
                  )}
                </strong>
              </div>
            )}

            <div className="receipt-grand-total">
              <span>
                Grand Total
              </span>

              <strong>
                {formatCurrency(
                  priceDetails.grandTotal
                )}
              </strong>
            </div>

            {totalRefunded > 0 && (
              <div className="receipt-refunded-total">
                <span>
                  Refunded
                </span>

                <strong>
                  -
                  {formatCurrency(
                    totalRefunded
                  )}
                </strong>
              </div>
            )}
          </div>
        </section>

        {/* =================================
            Payment details
        ================================= */}

        <section className="receipt-section">
          <h2>
            Payment Details
          </h2>

          <dl className="receipt-payment-details">
            <div>
              <dt>
                Payment method
              </dt>

              <dd>
                {formatStatus(
                  booking.paymentMethod
                )}
              </dd>
            </div>

            <div>
              <dt>
                Razorpay Payment ID
              </dt>

              <dd>
                {paymentId}
              </dd>
            </div>

            <div>
              <dt>
                Razorpay Order ID
              </dt>

              <dd>
                {orderId}
              </dd>
            </div>

            <div>
              <dt>
                Paid at
              </dt>

              <dd>
                {formatDateTime(
                  payment.paidAt
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* =================================
            Refund history
        ================================= */}

        {refunds.length > 0 && (
          <section className="receipt-section">
            <h2>
              Refund History
            </h2>

            <div className="receipt-refund-table">
              <div className="receipt-refund-header">
                <span>
                  Refund ID
                </span>

                <span>
                  Amount
                </span>

                <span>
                  Status
                </span>

                <span>
                  Date
                </span>
              </div>

              {refunds.map(
                (refund) => (
                  <div
                    className="receipt-refund-row"
                    key={
                      refund.razorpayRefundId ||
                      refund._id
                    }
                  >
                    <span>
                      {refund.razorpayRefundId ||
                        "—"}
                    </span>

                    <span>
                      {formatCurrency(
                        Number(
                          refund.amountInSubunits ||
                            0
                        ) / 100
                      )}
                    </span>

                    <span>
                      {formatStatus(
                        refund.status
                      )}
                    </span>

                    <span>
                      {formatDate(
                        refund.initiatedAt
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {booking.specialRequests && (
          <section className="receipt-section">
            <h2>
              Special Requests
            </h2>

            <p className="receipt-special-request">
              {
                booking.specialRequests
              }
            </p>
          </section>
        )}

        <footer className="receipt-footer">
          <p>
            Thank you for choosing
            Hogenakkal Home Stay.
          </p>

          <small>
            This computer-generated
            receipt does not require a
            physical signature.
          </small>

          <small>
            VeeraWebTech • HHS Booking
            Platform
          </small>
        </footer>
      </article>
    </main>
  );
}

export default BookingReceipt;