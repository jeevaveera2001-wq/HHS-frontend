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

import {
  cancelBooking,
  getManagedBookings,
  updateBookingStatus,
} from "../../services/bookingService";

import {
  initiatePaymentRefund,
} from "../../services/paymentService";

import "./BookingManagement.css";

const PAGE_SIZE = 15;

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  refund_pending:
    "Refund Pending",
  refunded: "Refunded",
  no_show: "No Show",
};

const nextStatusOptions = {
  pending: [
    "cancelled",
  ],

  confirmed: [
    "checked_in",
    "cancelled",
    "no_show",
  ],

  checked_in: [
    "completed",
  ],
};

const getNextStatusOptions = (
  booking
) => {
  if (
    booking.bookingStatus ===
    "pending"
  ) {
    return (
      booking.paymentStatus ===
      "paid"
        ? [
            "confirmed",
            "cancelled",
          ]
        : ["cancelled"]
    );
  }

  return (
    nextStatusOptions[
      booking.bookingStatus
    ] || []
  );
};

const refundRoles = [
  "finance_manager",
  "booking_manager",
  "operations_manager",
  "super_admin",
];

const dashboardRoutes = {
  super_admin:
    "/super-admin",

  operations_manager:
    "/manager",

  booking_manager:
    "/booking-admin",
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

const getBookingId = (
  booking
) => {
  return (
    booking?._id ||
    booking?.id ||
    null
  );
};

const getBookingTotal = (
  booking
) => {
  return (
    booking?.priceDetails
      ?.grandTotal ??
    booking?.grandTotal ??
    booking?.totalAmount ??
    0
  );
};

const preservePopulatedReference = (
  currentValue,
  updatedValue
) => {
  if (!updatedValue) {
    return currentValue;
  }

  if (
    currentValue &&
    typeof currentValue ===
      "object" &&
    typeof updatedValue ===
      "string"
  ) {
    return currentValue;
  }

  return updatedValue;
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

const formatPaymentStatus = (
  status
) => {
  const labels = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",

    refund_pending:
      "Refund Pending",

    partially_refunded:
      "Partially Refunded",

    refunded: "Refunded",
  };

  return (
    labels[status] ||
    String(
      status || "pending"
    ).replaceAll("_", " ")
  );
};

function BookingManagement() {
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
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    actionId,
    setActionId,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    bookingStatus,
    setBookingStatus,
  ] = useState("");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState("");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    totalBookings,
    setTotalBookings,
  ] = useState(0);

  const backPath =
    dashboardRoutes[
      user?.role
    ] || "/dashboard";

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

  const loadBookings =
    useCallback(
      async (
        showInitialLoader = true
      ) => {
        try {
          if (
            showInitialLoader
          ) {
            setLoading(
              true
            );
          } else {
            setRefreshing(
              true
            );
          }

          setLoadError(
            ""
          );

          const data =
            await getManagedBookings({
              search:
                search.trim(),

              bookingStatus,
              paymentStatus,
              page:
                currentPage,

              limit:
                PAGE_SIZE,
            });

          const returnedBookings =
            data?.bookings ||
            data?.data
              ?.bookings ||
            [];

          const normalizedBookings =
            Array.isArray(
              returnedBookings
            )
              ? returnedBookings.map(
                  (
                    booking
                  ) => ({
                    ...booking,

                    bookingStatus:
                      booking.bookingStatus ||
                      booking.status ||
                      "pending",

                    paymentStatus:
                      booking.paymentStatus ||
                      "pending",
                  })
                )
              : [];

          const pagination =
            data?.pagination ||
            data?.data
              ?.pagination ||
            {};

          const normalizedTotalPages =
            Math.max(
              Number(
                data?.totalPages ??
                  pagination.totalPages
              ) || 1,
              1
            );

          const normalizedTotalBookings =
            Math.max(
              Number(
                data?.totalBookings ??
                  pagination.totalBookings ??
                  pagination.totalItems
              ) ||
                normalizedBookings.length,
              0
            );

          setBookings(
            normalizedBookings
          );

          setTotalBookings(
            normalizedTotalBookings
          );

          setTotalPages(
            normalizedTotalPages
          );

          if (
            currentPage >
            normalizedTotalPages
          ) {
            setCurrentPage(
              normalizedTotalPages
            );
          }
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
              "Unable to load managed bookings."
            );

          setLoadError(
            message
          );

          toast.error(
            message
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        search,
        bookingStatus,
        paymentStatus,
        currentPage,
        handleUnauthorized,
      ]
    );

  useEffect(() => {
    const delay =
      window.setTimeout(
        () => {
          loadBookings(
            true
          );
        },
        350
      );

    return () =>
      window.clearTimeout(
        delay
      );
  }, [loadBookings]);

  const pageStatistics =
    useMemo(() => {
      return bookings.reduce(
        (
          result,
          booking
        ) => {
          if (
            booking.bookingStatus ===
            "pending"
          ) {
            result.pending += 1;
          }

          if (
            booking.bookingStatus ===
            "confirmed"
          ) {
            result.confirmed +=
              1;
          }

          if (
            booking.bookingStatus ===
            "expired"
          ) {
            result.expired += 1;
          }

          return result;
        },
        {
          pending: 0,
          confirmed: 0,
          expired: 0,
        }
      );
    }, [bookings]);

  const changeFilter = (
    setter,
    value
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setBookingStatus("");
    setPaymentStatus("");
    setCurrentPage(1);
  };

  const updateLocalBooking = (
    bookingId,
    updatedBooking = {}
  ) => {
    setBookings(
      (previous) =>
        previous.map(
          (booking) => {
            if (
              getBookingId(
                booking
              ) !== bookingId
            ) {
              return booking;
            }

            return {
              ...booking,
              ...updatedBooking,

              property:
                preservePopulatedReference(
                  booking.property,
                  updatedBooking.property
                ),

              customer:
                preservePopulatedReference(
                  booking.customer,
                  updatedBooking.customer
                ),

              bookingStatus:
                updatedBooking.bookingStatus ||
                updatedBooking.status ||
                booking.bookingStatus,
            };
          }
        )
    );
  };

  const handleCancellation =
    async (booking) => {
      const bookingId =
        getBookingId(
          booking
        );

      if (!bookingId) {
        toast.error(
          "Invalid booking ID."
        );

        return;
      }

      const reason =
        window.prompt(
          `Enter cancellation reason for ${
            booking.bookingReference ||
            "this booking"
          }:`
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
          `Are you sure you want to cancel ${
            booking.bookingReference ||
            "this booking"
          }?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(
          bookingId
        );

        const data =
          await cancelBooking(
            bookingId,
            reason.trim()
          );

        updateLocalBooking(
          bookingId,
          {
            ...(data?.booking ||
              {}),

            bookingStatus:
              data?.booking
                ?.bookingStatus ||
              data?.booking
                ?.status ||
              "cancelled",
          }
        );

        toast.success(
          data?.message ||
            "Booking cancelled successfully."
        );

        await loadBookings(
          false
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
        setActionId(
          null
        );
      }
    };

  const handleStatusUpdate =
    async (
      booking,
      newStatus
    ) => {
      if (!newStatus) {
        return;
      }

      const bookingId =
        getBookingId(
          booking
        );

      if (!bookingId) {
        toast.error(
          "Invalid booking ID."
        );

        return;
      }

      const allowedOptions =
        getNextStatusOptions(
          booking
        );

      if (
        !allowedOptions.includes(
          newStatus
        )
      ) {
        toast.error(
          "This booking status change is not allowed."
        );

        return;
      }

      if (
        newStatus ===
        "cancelled"
      ) {
        await handleCancellation(
          booking
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Change ${
            booking.bookingReference ||
            "this booking"
          } to ${
            statusLabels[
              newStatus
            ]
          }?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(
          bookingId
        );

        const data =
          await updateBookingStatus(
            bookingId,
            newStatus
          );

        updateLocalBooking(
          bookingId,
          {
            ...(data?.booking ||
              {}),

            bookingStatus:
              data?.booking
                ?.bookingStatus ||
              data?.booking
                ?.status ||
              newStatus,
          }
        );

        toast.success(
          data?.message ||
            "Booking status updated successfully."
        );

        await loadBookings(
          false
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
            "Unable to update the booking status."
          )
        );
      } finally {
        setActionId(
          null
        );
      }
    };

  const canRefundBooking = (
    booking
  ) => {
    const hasPendingRefund =
      (
        booking.refunds ||
        []
      ).some((refund) => {
        return (
          refund.status ===
          "pending"
        );
      });

    return (
      refundRoles.includes(
        user?.role
      ) &&
      [
        "cancelled",
        "refund_pending",
      ].includes(
        booking.bookingStatus
      ) &&
      [
        "paid",
        "partially_refunded",
        "refund_pending",
      ].includes(
        booking.paymentStatus
      ) &&
      !hasPendingRefund
    );
  };

  const handleRefund =
    async (booking) => {
      const bookingId =
        getBookingId(
          booking
        );

      if (!bookingId) {
        toast.error(
          "Invalid booking ID."
        );

        return;
      }

      const amountInput =
        window.prompt(
          `Enter refund amount for ${booking.bookingReference}. Leave empty for the full remaining refund.`,
          ""
        );

      if (
        amountInput === null
      ) {
        return;
      }

      const trimmedAmount =
        amountInput.trim();

      let refundAmount;

      if (trimmedAmount) {
        refundAmount =
          Number(
            trimmedAmount
          );

        if (
          !Number.isFinite(
            refundAmount
          ) ||
          refundAmount <= 0
        ) {
          toast.error(
            "Enter a valid refund amount."
          );

          return;
        }

        if (
          refundAmount >
          Number(
            getBookingTotal(
              booking
            )
          )
        ) {
          toast.error(
            "Refund amount cannot exceed the booking total."
          );

          return;
        }
      }

      const reason =
        window.prompt(
          "Enter the reason for this refund:",

          booking.cancellation
            ?.reason ||
            "Booking cancellation refund"
        );

      if (reason === null) {
        return;
      }

      if (!reason.trim()) {
        toast.error(
          "Refund reason is required."
        );

        return;
      }

      const refundDescription =
        trimmedAmount
          ? formatCurrency(
              refundAmount
            )
          : "the full remaining amount";

      const confirmed =
        window.confirm(
          `Refund ${refundDescription} for ${booking.bookingReference}? This action sends the request to Razorpay.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(
          bookingId
        );

        const data =
          await initiatePaymentRefund(
            bookingId,
            {
              amount:
                refundAmount,

              reason:
                reason.trim(),
            }
          );

        const payment =
          data?.payment ||
          {};

        updateLocalBooking(
          bookingId,
          {
            bookingStatus:
              payment.bookingStatus ||
              booking.bookingStatus,

            paymentStatus:
              payment.paymentStatus ||
              "refund_pending",

            paymentMethod:
              payment.paymentMethod ||
              booking.paymentMethod,

            refunds:
              payment.refunds ||
              booking.refunds,
          }
        );

        toast.success(
          data?.message ||
            "Refund initiated successfully."
        );

        await loadBookings(
          false
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
            "Unable to initiate the refund."
          )
        );
      } finally {
        setActionId(
          null
        );
      }
    };

  return (
    <main className="booking-management-page">
      <header className="booking-management-header">
        <div>
          <Link
            className="booking-management-back"
            to={backPath}
          >
            ← Back to Dashboard
          </Link>

          <span>
            HHS Reservation
            Operations
          </span>

          <h1>
            Booking Management
          </h1>

          <p>
            Monitor reservations,
            check-ins, cancellations
            and booking status.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadBookings(
              false
            )
          }
          disabled={
            loading ||
            refreshing
          }
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh bookings"}
        </button>
      </header>

      <section className="booking-management-summary">
        <article>
          <span>
            Total results
          </span>

          <strong>
            {totalBookings}
          </strong>
        </article>

        <article>
          <span>
            Visible on page
          </span>

          <strong>
            {bookings.length}
          </strong>
        </article>

        <article>
          <span>
            Pending on page
          </span>

          <strong>
            {pageStatistics.pending}
          </strong>
        </article>

        <article>
          <span>
            Confirmed on page
          </span>

          <strong>
            {
              pageStatistics.confirmed
            }
          </strong>
        </article>

        <article>
          <span>
            Expired on page
          </span>

          <strong>
            {pageStatistics.expired}
          </strong>
        </article>
      </section>

      <section className="booking-management-panel">
        <div className="booking-management-filters">
          <div>
            <label htmlFor="booking-search">
              Search booking
            </label>

            <input
              id="booking-search"
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                changeFilter(
                  setSearch,
                  event.target
                    .value
                )
              }
              placeholder="Reference, guest, email, phone or property"
            />
          </div>

          <div>
            <label htmlFor="booking-status">
              Booking status
            </label>

            <select
              id="booking-status"
              value={
                bookingStatus
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  setBookingStatus,
                  event.target
                    .value
                )
              }
            >
              <option value="">
                All statuses
              </option>

              {Object.entries(
                statusLabels
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    value={
                      value
                    }
                    key={
                      value
                    }
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label htmlFor="payment-status">
              Payment status
            </label>

            <select
              id="payment-status"
              value={
                paymentStatus
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  setPaymentStatus,
                  event.target
                    .value
                )
              }
            >
              <option value="">
                All payments
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="refund_pending">
                Refund Pending
              </option>

              <option value="partially_refunded">
                Partially Refunded
              </option>

              <option value="refunded">
                Refunded
              </option>
            </select>
          </div>

          <button
            className="booking-filters-clear"
            type="button"
            onClick={
              clearFilters
            }
            disabled={
              !search &&
              !bookingStatus &&
              !paymentStatus
            }
          >
            Clear filters
          </button>
        </div>

        {loading ? (
          <div className="managed-bookings-state">
            <div className="managed-bookings-spinner" />

            <p>
              Loading bookings...
            </p>
          </div>
        ) : loadError ? (
          <div className="managed-bookings-state">
            <span>⚠️</span>

            <h2>
              Unable to load bookings
            </h2>

            <p>
              {loadError}
            </p>

            <button
              className="managed-bookings-retry"
              type="button"
              onClick={() =>
                loadBookings(
                  true
                )
              }
            >
              Try again
            </button>
          </div>
        ) : bookings.length ===
          0 ? (
          <div className="managed-bookings-state">
            <span>📅</span>

            <h2>
              No bookings found
            </h2>

            <p>
              No reservations match
              the current filters.
            </p>
          </div>
        ) : (
          <div className="booking-management-table-wrapper">
            <table className="booking-management-table">
              <thead>
                <tr>
                  <th>
                    Booking
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Property
                  </th>

                  <th>
                    Stay dates
                  </th>

                  <th>
                    Rooms/Guests
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Update
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map(
                  (booking) => {
                    const bookingId =
                      getBookingId(
                        booking
                      );

                    const options =
                      getNextStatusOptions(
                        booking
                      );

                    const updating =
                      actionId ===
                      bookingId;

                    const canRefund =
                      canRefundBooking(
                        booking
                      );

                    const paymentId =
                      booking.payment
                        ?.razorpayPaymentId ||
                      booking.paymentTransactionId ||
                      "";

                    const guestName =
                      booking.customer
                        ?.fullName ||
                      booking.primaryGuest
                        ?.fullName ||
                      "Guest";

                    const guestEmail =
                      booking.customer
                        ?.email ||
                      booking.primaryGuest
                        ?.email ||
                      "—";

                    const guestPhone =
                      booking.customer
                        ?.phone ||
                      booking.primaryGuest
                        ?.phone ||
                      "—";

                    return (
                      <tr
                        className={
                          booking.bookingStatus ===
                          "expired"
                            ? "managed-expired-row"
                            : ""
                        }
                        key={
                          bookingId ||
                          booking.bookingReference
                        }
                      >
                        <td>
                          <div className="managed-booking-reference">
                            <strong>
                              {booking.bookingReference ||
                                "Booking"}
                            </strong>

                            <span>
                              {formatDate(
                                booking.createdAt
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="managed-booking-person">
                            <strong>
                              {
                                guestName
                              }
                            </strong>

                            <span>
                              {
                                guestEmail
                              }
                            </span>

                            <small>
                              {
                                guestPhone
                              }
                            </small>
                          </div>
                        </td>

                        <td>
                          <div className="managed-booking-property">
                            <strong>
                              {booking
                                .property
                                ?.title ||
                                "HHS Property"}
                            </strong>

                            <span>
                              {booking
                                .property
                                ?.location
                                ?.city ||
                                "Hogenakkal"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="managed-booking-dates">
                            <span>
                              {formatDate(
                                booking.checkInDate
                              )}
                            </span>

                            <small>
                              to
                            </small>

                            <span>
                              {formatDate(
                                booking.checkOutDate
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span>
                            {Number(
                              booking.numberOfRooms
                            ) ||
                              0}{" "}
                            room(s)
                          </span>

                          <br />

                          <span>
                            {Number(
                              booking.numberOfGuests
                            ) ||
                              0}{" "}
                            guest(s)
                          </span>
                        </td>

                        <td>
                          <strong className="managed-booking-price">
                            {formatCurrency(
                              getBookingTotal(
                                booking
                              )
                            )}
                          </strong>
                        </td>

                        <td>
                          <div className="managed-payment-information">
                            <span
                              className={`managed-payment-status ${booking.paymentStatus}`}
                            >
                              {formatPaymentStatus(
                                booking.paymentStatus
                              )}
                            </span>

                            {paymentId && (
                              <small
                                title={
                                  paymentId
                                }
                              >
                                {paymentId.length >
                                18
                                  ? `${paymentId.slice(
                                      0,
                                      18
                                    )}…`
                                  : paymentId}
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`managed-booking-status ${booking.bookingStatus}`}
                          >
                            {statusLabels[
                              booking.bookingStatus
                            ] ||
                              String(
                                booking.bookingStatus
                              ).replaceAll(
                                "_",
                                " "
                              )}
                          </span>
                        </td>

                        <td>
                          <div className="managed-booking-actions">
                            {options.length >
                              0 && (
                              <select
                                className="booking-status-select"
                                value=""
                                aria-label={`Update ${
                                  booking.bookingReference ||
                                  "booking"
                                } status`}
                                disabled={
                                  updating
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleStatusUpdate(
                                    booking,
                                    event
                                      .target
                                      .value
                                  )
                                }
                              >
                                <option value="">
                                  {updating
                                    ? "Updating..."
                                    : "Select action"}
                                </option>

                                {options.map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      value={
                                        status
                                      }
                                      key={
                                        status
                                      }
                                    >
                                      {
                                        statusLabels[
                                          status
                                        ]
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            )}

                            {canRefund && (
                              <button
                                className="managed-refund-button"
                                type="button"
                                disabled={
                                  updating
                                }
                                onClick={() =>
                                  handleRefund(
                                    booking
                                  )
                                }
                              >
                                {updating
                                  ? "Processing..."
                                  : "Issue refund"}
                              </button>
                            )}

                            {options.length ===
                              0 &&
                              !canRefund && (
                                <span className="booking-final-status">
                                  {booking.paymentStatus ===
                                  "refund_pending"
                                    ? "Refund processing"
                                    : booking.bookingStatus ===
                                        "expired"
                                      ? "Room released"
                                      : "No actions"}
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 &&
          !loadError && (
            <div className="booking-management-pagination">
              <button
                type="button"
                disabled={
                  currentPage <=
                    1 ||
                  loading ||
                  refreshing
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        page -
                          1,
                        1
                      )
                  )
                }
              >
                Previous
              </button>

              <span>
                Page{" "}
                {
                  currentPage
                }{" "}
                of{" "}
                {
                  totalPages
                }
              </span>

              <button
                type="button"
                disabled={
                  currentPage >=
                    totalPages ||
                  loading ||
                  refreshing
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        page +
                          1,
                        totalPages
                      )
                  )
                }
              >
                Next
              </button>
            </div>
          )}
      </section>
    </main>
  );
}

export default BookingManagement;