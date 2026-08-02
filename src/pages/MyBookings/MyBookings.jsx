import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import RazorpayPaymentButton from "../../components/RazorpayPaymentButton/RazorpayPaymentButton";

import {
  cancelBooking,
  getMyBookings,
} from "../../services/bookingService";

import "./MyBookings.css";

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  refund_pending: "Refund Pending",
  refunded: "Refunded",
  no_show: "No Show",
};

const cancelledStatuses = [
  "cancelled",
  "refund_pending",
  "refunded",
];

const paymentStatusLabels = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refund_pending: "Refund Pending",
  partially_refunded:
    "Partially Refunded",
  refunded: "Refunded",
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
  fallbackMessage
) => {
  return (
    error?.data?.message ||
    error?.response?.data
      ?.message ||
    error?.message ||
    fallbackMessage
  );
};

const getDateTimestamp = (
  value
) => {
  if (!value) {
    return null;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(
    timestamp
  )
    ? null
    : timestamp;
};

const isTemporaryHoldExpired = (
  booking,
  currentTime
) => {
  if (
    booking.bookingStatus ===
    "expired"
  ) {
    return true;
  }

  if (
    booking.bookingStatus !==
    "pending"
  ) {
    return false;
  }

  if (
    ![
      "pending",
      "failed",
    ].includes(
      booking.paymentStatus ||
        "pending"
    )
  ) {
    return false;
  }

  const expiryTimestamp =
    getDateTimestamp(
      booking.holdExpiresAt
    );

  return (
    expiryTimestamp !== null &&
    expiryTimestamp <=
      currentTime
  );
};

const getEffectiveBookingStatus = (
  booking,
  currentTime
) => {
  return isTemporaryHoldExpired(
    booking,
    currentTime
  )
    ? "expired"
    : booking.bookingStatus;
};

const formatRemainingTime = (
  milliseconds
) => {
  const safeMilliseconds =
    Math.max(
      milliseconds,
      0
    );

  const totalSeconds =
    Math.ceil(
      safeMilliseconds / 1000
    );

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds =
    totalSeconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(2, "0")}`;
};

function MyBookings() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    cancellingId,
    setCancellingId,
  ] = useState(null);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    currentTime,
    setCurrentTime,
  ] = useState(Date.now());

  /* =====================================
     Handle expired session
  ===================================== */

  const handleUnauthorized =
    useCallback(() => {
      logout();

      toast.error(
        "Your session has expired. Please log in again."
      );

      navigate("/login", {
        replace: true,
      });
    }, [
      logout,
      navigate,
    ]);

  /* =====================================
     Load customer bookings
  ===================================== */

  const loadBookings =
    useCallback(async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data =
          await getMyBookings();

        const returnedBookings =
          data?.bookings ||
          data?.data
            ?.bookings ||
          [];

        setBookings(
          Array.isArray(
            returnedBookings
          )
            ? returnedBookings.map(
                (booking) => ({
                  ...booking,

                  bookingStatus:
                    booking.bookingStatus ||
                    booking.status ||
                    "pending",
                })
              )
            : []
        );

        setCurrentTime(
          Date.now()
        );
      } catch (error) {
        if (
          getErrorStatus(
            error
          ) === 401
        ) {
          handleUnauthorized();
          return;
        }

        const message =
          getErrorMessage(
            error,
            "Unable to load your bookings."
          );

        setLoadError(
          message
        );

        toast.error(
          message
        );
      } finally {
        setLoading(false);
      }
    }, [
      handleUnauthorized,
    ]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /* =====================================
     Live room-hold countdown
  ===================================== */

  useEffect(() => {
    const hasPendingHold =
      bookings.some(
        (booking) => {
          return (
            booking.bookingStatus ===
              "pending" &&
            [
              "pending",
              "failed",
            ].includes(
              booking.paymentStatus ||
                "pending"
            ) &&
            getDateTimestamp(
              booking.holdExpiresAt
            ) !== null
          );
        }
      );

    if (!hasPendingHold) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setCurrentTime(
            Date.now()
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [bookings]);

  /* =====================================
     Filter bookings
  ===================================== */

  const filteredBookings =
    useMemo(() => {
      if (
        statusFilter ===
        "all"
      ) {
        return bookings;
      }

      if (
        statusFilter ===
        "cancelled_group"
      ) {
        return bookings.filter(
          (booking) => {
            const status =
              getEffectiveBookingStatus(
                booking,
                currentTime
              );

            return cancelledStatuses.includes(
              status
            );
          }
        );
      }

      return bookings.filter(
        (booking) => {
          return (
            getEffectiveBookingStatus(
              booking,
              currentTime
            ) ===
            statusFilter
          );
        }
      );
    }, [
      bookings,
      currentTime,
      statusFilter,
    ]);

  /* =====================================
     Booking statistics
  ===================================== */

  const counts =
    useMemo(() => {
      return bookings.reduce(
        (
          result,
          booking
        ) => {
          const effectiveStatus =
            getEffectiveBookingStatus(
              booking,
              currentTime
            );

          result.total += 1;

          if (
            effectiveStatus ===
            "pending"
          ) {
            result.pending += 1;
          }

          if (
            effectiveStatus ===
            "confirmed"
          ) {
            result.confirmed +=
              1;
          }

          if (
            effectiveStatus ===
            "completed"
          ) {
            result.completed +=
              1;
          }

          if (
            effectiveStatus ===
            "expired"
          ) {
            result.expired += 1;
          }

          if (
            cancelledStatuses.includes(
              effectiveStatus
            )
          ) {
            result.cancelled +=
              1;
          }

          return result;
        },
        {
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          expired: 0,
          cancelled: 0,
        }
      );
    }, [
      bookings,
      currentTime,
    ]);

  /* =====================================
     Helpers
  ===================================== */

  const getCoverImage = (
    booking
  ) => {
    const images =
      Array.isArray(
        booking.property
          ?.images
      )
        ? booking.property
            .images
        : [];

    const coverImage =
      images.find(
        (image) =>
          image.isCover
      );

    return (
      coverImage?.url ||
      images[0]?.url ||
      null
    );
  };

  const formatCurrency = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
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
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatStatus = (
    status
  ) => {
    if (!status) {
      return "Pending";
    }

    return (
      statusLabels[
        status
      ] ||
      String(status).replaceAll(
        "_",
        " "
      )
    );
  };

  const formatPaymentStatus = (
    status
  ) => {
    if (!status) {
      return "Pending";
    }

    return (
      paymentStatusLabels[
        status
      ] ||
      String(status).replaceAll(
        "_",
        " "
      )
    );
  };

  const getPropertyId = (
    booking
  ) => {
    if (
      typeof booking.property ===
      "string"
    ) {
      return booking.property;
    }

    return (
      booking.property?._id ||
      booking.property?.id ||
      null
    );
  };

  const getBookingTotal = (
    booking
  ) => {
    return (
      booking.priceDetails
        ?.grandTotal ??
      booking.grandTotal ??
      booking.totalAmount ??
      0
    );
  };

  const canCancelBooking = (
    booking
  ) => {
    const status =
      getEffectiveBookingStatus(
        booking,
        currentTime
      );

    return [
      "pending",
      "confirmed",
    ].includes(status);
  };

  const canPayForBooking = (
    booking
  ) => {
    const status =
      getEffectiveBookingStatus(
        booking,
        currentTime
      );

    return (
      [
        "pending",
        "failed",
      ].includes(
        booking.paymentStatus ||
          "pending"
      ) &&
      [
        "pending",
        "confirmed",
      ].includes(status)
    );
  };

  const canViewReceipt = (
    booking
  ) => {
    return [
      "paid",
      "refund_pending",
      "partially_refunded",
      "refunded",
    ].includes(
      booking.paymentStatus
    );
  };

  const handlePaymentSuccess = (
    bookingId,
    paymentData
  ) => {
    const verifiedBooking =
      paymentData?.booking;

    setBookings(
      (previous) =>
        previous.map(
          (booking) => {
            const currentBookingId =
              booking._id ||
              booking.id;

            if (
              currentBookingId !==
              bookingId
            ) {
              return booking;
            }

            if (
              verifiedBooking
            ) {
              return {
                ...booking,
                ...verifiedBooking,

                property:
                  verifiedBooking.property ||
                  booking.property,
              };
            }

            return {
              ...booking,

              bookingStatus:
                paymentData?.requiresRefund
                  ? "refund_pending"
                  : "confirmed",

              paymentStatus:
                paymentData?.requiresRefund
                  ? "refund_pending"
                  : "paid",

              paymentMethod:
                "online",

              holdExpiresAt:
                null,
            };
          }
        )
    );
  };

  /* =====================================
     Cancel booking
  ===================================== */

  const handleCancellation =
    async (booking) => {
      const reason =
        window.prompt(
          "Please enter the cancellation reason:"
        );

      if (reason === null) {
        return;
      }

      if (!reason.trim()) {
        toast.error(
          "Cancellation reason is required."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Cancel booking ${booking.bookingReference}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        const bookingId =
          booking._id ||
          booking.id;

        setCancellingId(
          bookingId
        );

        const data =
          await cancelBooking(
            bookingId,
            reason.trim()
          );

        setBookings(
          (previous) =>
            previous.map(
              (item) => {
                const itemId =
                  item._id ||
                  item.id;

                if (
                  itemId !==
                  bookingId
                ) {
                  return item;
                }

                const updatedBooking =
                  data?.booking ||
                  {};

                return {
                  ...item,
                  ...updatedBooking,

                  property:
                    updatedBooking.property ||
                    item.property,

                  bookingStatus:
                    updatedBooking.bookingStatus ||
                    updatedBooking.status ||
                    "cancelled",
                };
              }
            )
        );

        toast.success(
          data?.message ||
            "Booking cancelled successfully."
        );
      } catch (error) {
        if (
          getErrorStatus(
            error
          ) === 401
        ) {
          handleUnauthorized();
          return;
        }

        toast.error(
          getErrorMessage(
            error,
            "Unable to cancel this booking."
          )
        );
      } finally {
        setCancellingId(
          null
        );
      }
    };

  return (
    <main className="my-bookings-page">
      <header className="my-bookings-header">
        <div>
          <span>
            HHS Reservations
          </span>

          <h1>
            My Bookings
          </h1>

          <p>
            View your upcoming,
            completed and cancelled
            Hogenakkal stays.
          </p>
        </div>

        <Link to="/explore">
          + Explore stays
        </Link>
      </header>

      <section className="booking-summary-grid">
        <button
          type="button"
          className={
            statusFilter ===
            "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "all"
            )
          }
        >
          <span>
            Total bookings
          </span>

          <strong>
            {counts.total}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "pending"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "pending"
            )
          }
        >
          <span>
            Pending
          </span>

          <strong>
            {counts.pending}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "confirmed"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "confirmed"
            )
          }
        >
          <span>
            Confirmed
          </span>

          <strong>
            {counts.confirmed}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "completed"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "completed"
            )
          }
        >
          <span>
            Completed
          </span>

          <strong>
            {counts.completed}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "expired"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "expired"
            )
          }
        >
          <span>
            Expired
          </span>

          <strong>
            {counts.expired}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "cancelled_group"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "cancelled_group"
            )
          }
        >
          <span>
            Cancelled
          </span>

          <strong>
            {counts.cancelled}
          </strong>
        </button>
      </section>

      {loading ? (
        <section className="my-bookings-state">
          <div className="my-bookings-spinner" />

          <p>
            Loading your bookings...
          </p>
        </section>
      ) : loadError ? (
        <section className="my-bookings-state">
          <span>⚠️</span>

          <h2>
            Unable to load bookings
          </h2>

          <p>
            {loadError}
          </p>

          <button
            className="my-bookings-retry-button"
            type="button"
            onClick={
              loadBookings
            }
          >
            Try again
          </button>
        </section>
      ) : filteredBookings.length ===
        0 ? (
        <section className="my-bookings-state">
          <span>🧳</span>

          <h2>
            No bookings found
          </h2>

          <p>
            Your property
            reservations will
            appear here after
            booking.
          </p>

          <Link to="/explore">
            Find a stay
          </Link>
        </section>
      ) : (
        <section className="my-bookings-list">
          {filteredBookings.map(
            (booking) => {
              const coverImage =
                getCoverImage(
                  booking
                );

              const bookingId =
                booking._id ||
                booking.id;

              const propertyId =
                getPropertyId(
                  booking
                );

              const cancellationReason =
                booking.cancellation
                  ?.reason ||
                booking.cancellationReason ||
                "";

              const effectiveBookingStatus =
                getEffectiveBookingStatus(
                  booking,
                  currentTime
                );

              const holdExpiryTimestamp =
                getDateTimestamp(
                  booking.holdExpiresAt
                );

              const holdRemainingMilliseconds =
                holdExpiryTimestamp ===
                null
                  ? 0
                  : Math.max(
                      holdExpiryTimestamp -
                        currentTime,
                      0
                    );

              return (
                <article
                  className="customer-booking-card"
                  key={
                    bookingId ||
                    booking.bookingReference
                  }
                >
                  <div className="customer-booking-image">
                    {coverImage ? (
                      <img
                        src={
                          coverImage
                        }
                        alt={
                          booking
                            .property
                            ?.title ||
                          "HHS Property"
                        }
                      />
                    ) : (
                      <div>
                        HHS
                      </div>
                    )}

                    <span
                      className={`customer-booking-status ${effectiveBookingStatus}`}
                    >
                      {formatStatus(
                        effectiveBookingStatus
                      )}
                    </span>
                  </div>

                  <div className="customer-booking-content">
                    <div className="booking-reference-row">
                      <span>
                        {
                          booking.bookingReference
                        }
                      </span>

                      <small>
                        Booked{" "}
                        {formatDate(
                          booking.createdAt
                        )}
                      </small>
                    </div>

                    <h2>
                      {booking
                        .property
                        ?.title ||
                        "HHS Property"}
                    </h2>

                    <p className="customer-booking-location">
                      📍{" "}
                      {booking
                        .property
                        ?.location
                        ?.city ||
                        "Hogenakkal"}
                      ,{" "}
                      {booking
                        .property
                        ?.location
                        ?.district ||
                        "Dharmapuri"}
                    </p>

                    <div className="customer-booking-dates">
                      <div>
                        <span>
                          Check-in
                        </span>

                        <strong>
                          {formatDate(
                            booking.checkInDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Check-out
                        </span>

                        <strong>
                          {formatDate(
                            booking.checkOutDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Duration
                        </span>

                        <strong>
                          {
                            booking.numberOfNights
                          }{" "}
                          night(s)
                        </strong>
                      </div>
                    </div>

                    <div className="customer-booking-details">
                      <span>
                        🛏️{" "}
                        {
                          booking.numberOfRooms
                        }{" "}
                        room(s)
                      </span>

                      <span>
                        👥{" "}
                        {
                          booking.numberOfGuests
                        }{" "}
                        guest(s)
                      </span>

                      <span
                        className={`customer-payment-status ${
                          booking.paymentStatus ||
                          "pending"
                        }`}
                      >
                        Payment:{" "}
                        {formatPaymentStatus(
                          booking.paymentStatus
                        )}
                      </span>
                    </div>

                    {effectiveBookingStatus ===
                      "pending" &&
                      holdExpiryTimestamp !==
                        null && (
                        <div
                          className={`booking-payment-hold ${
                            holdRemainingMilliseconds <=
                            60 *
                              1000
                              ? "urgent"
                              : ""
                          }`}
                        >
                          <div>
                            <span>
                              Room temporarily
                              reserved
                            </span>

                            <strong>
                              Complete payment
                              before the timer
                              expires.
                            </strong>
                          </div>

                          <time>
                            {formatRemainingTime(
                              holdRemainingMilliseconds
                            )}
                          </time>
                        </div>
                      )}

                    {effectiveBookingStatus ===
                      "expired" && (
                      <div className="booking-expired-note">
                        <div>
                          <strong>
                            Booking hold
                            expired
                          </strong>

                          <span>
                            The room was
                            released because
                            payment was not
                            completed in time.
                          </span>
                        </div>

                        {propertyId && (
                          <Link
                            to={`/property/${propertyId}`}
                          >
                            Book again
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="customer-booking-footer">
                      <div>
                        <span>
                          Total amount
                        </span>

                        <strong>
                          {formatCurrency(
                            getBookingTotal(
                              booking
                            )
                          )}
                        </strong>
                      </div>

                      <div className="customer-booking-actions">
                        {canPayForBooking(
                          booking
                        ) && (
                          <RazorpayPaymentButton
                            booking={
                              booking
                            }
                            user={
                              user
                            }
                            className="customer-pay-now-button"
                            onPaymentSuccess={(
                              paymentData
                            ) => {
                              handlePaymentSuccess(
                                bookingId,
                                paymentData
                              );
                            }}
                          />
                        )}

                        {propertyId && (
                          <Link
                            to={`/property/${propertyId}`}
                          >
                            View property
                          </Link>
                        )}

                        {canViewReceipt(
                          booking
                        ) && (
                          <Link
                            to={`/bookings/${bookingId}/receipt`}
                          >
                            Receipt
                          </Link>
                        )}

                        {canCancelBooking(
                          booking
                        ) && (
                          <button
                            type="button"
                            disabled={
                              cancellingId ===
                              bookingId
                            }
                            onClick={() =>
                              handleCancellation(
                                booking
                              )
                            }
                          >
                            {cancellingId ===
                            bookingId
                              ? "Cancelling..."
                              : "Cancel booking"}
                          </button>
                        )}
                      </div>
                    </div>

                    {cancellationReason && (
                      <div className="booking-cancellation-note">
                        <strong>
                          Cancellation
                          reason:
                        </strong>

                        <span>
                          {
                            cancellationReason
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </main>
  );
}

export default MyBookings;