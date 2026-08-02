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
  getOwnerBookings,
  updateBookingStatus,
} from "../../services/bookingService";

import "./OwnerBookings.css";

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

const ownerStatusOptions = {
  pending: ["cancelled"],

  confirmed: [
    "checked_in",
    "cancelled",
    "no_show",
  ],

  checked_in: [
    "completed",
  ],
};

const paidStatuses = [
  "paid",
  "partially_refunded",
];

const getOwnerStatusOptions = (
  booking
) => {
  if (
    booking.bookingStatus ===
    "pending"
  ) {
    return paidStatuses.includes(
      booking.paymentStatus
    )
      ? [
          "confirmed",
          "cancelled",
        ]
      : ["cancelled"];
  }

  return (
    ownerStatusOptions[
      booking.bookingStatus
    ] || []
  );
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

function OwnerBookings() {
  const navigate =
    useNavigate();

  const {
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
    statusFilter,
    setStatusFilter,
  ] = useState("all");

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
            await getOwnerBookings();

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
                  })
                )
              : [];

          setBookings(
            normalizedBookings
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
              "Unable to load property bookings."
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
        handleUnauthorized,
      ]
    );

  useEffect(() => {
    loadBookings(true);
  }, [loadBookings]);

  const filteredBookings =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return bookings.filter(
        (booking) => {
          const matchesStatus =
            statusFilter ===
              "all" ||
            booking.bookingStatus ===
              statusFilter;

          const searchableText =
            [
              booking.bookingReference,
              booking.customer
                ?.fullName,
              booking.customer
                ?.email,
              booking.customer
                ?.phone,
              booking.property
                ?.title,
              booking.primaryGuest
                ?.fullName,
              booking.primaryGuest
                ?.email,
              booking.primaryGuest
                ?.phone,
            ]
              .filter(
                Boolean
              )
              .join(" ")
              .toLowerCase();

          return (
            matchesStatus &&
            (!normalizedSearch ||
              searchableText.includes(
                normalizedSearch
              ))
          );
        }
      );
    }, [
      bookings,
      search,
      statusFilter,
    ]);

  const statistics =
    useMemo(() => {
      return bookings.reduce(
        (
          result,
          booking
        ) => {
          result.total += 1;

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
            "checked_in"
          ) {
            result.checkedIn +=
              1;
          }

          if (
            booking.bookingStatus ===
            "completed"
          ) {
            result.completed +=
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
          total: 0,
          pending: 0,
          confirmed: 0,
          checkedIn: 0,
          completed: 0,
          expired: 0,
        }
      );
    }, [bookings]);

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

  const handleStatusChange =
    async (
      booking,
      nextStatus
    ) => {
      if (!nextStatus) {
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
        getOwnerStatusOptions(
          booking
        );

      if (
        !allowedOptions.includes(
          nextStatus
        )
      ) {
        toast.error(
          "This booking status change is not allowed."
        );

        return;
      }

      if (
        nextStatus ===
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
              nextStatus
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
            nextStatus
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
              nextStatus,
          }
        );

        toast.success(
          data?.message ||
            "Booking status updated successfully."
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

  return (
    <main className="owner-bookings-page">
      <header className="owner-bookings-header">
        <div>
          <Link
            className="owner-bookings-back"
            to="/owner"
          >
            ← Owner Dashboard
          </Link>

          <span>
            HHS Reservation
            Operations
          </span>

          <h1>
            Property Bookings
          </h1>

          <p>
            Confirm reservations and
            manage guest check-in and
            completion.
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

      <section className="owner-booking-summary">
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
            {statistics.total}
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
            {statistics.pending}
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
            {statistics.confirmed}
          </strong>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "checked_in"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "checked_in"
            )
          }
        >
          <span>
            Checked In
          </span>

          <strong>
            {statistics.checkedIn}
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
            {statistics.completed}
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
            {statistics.expired}
          </strong>
        </button>
      </section>

      <section className="owner-bookings-panel">
        <div className="owner-bookings-toolbar">
          <div>
            <label htmlFor="owner-booking-search">
              Search booking
            </label>

            <input
              id="owner-booking-search"
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Booking ID, guest, phone, email or property"
            />
          </div>
        </div>

        {loading ? (
          <div className="owner-bookings-state">
            <div className="owner-bookings-spinner" />

            <p>
              Loading bookings...
            </p>
          </div>
        ) : loadError ? (
          <div className="owner-bookings-state">
            <span>⚠️</span>

            <h2>
              Unable to load bookings
            </h2>

            <p>
              {loadError}
            </p>

            <button
              className="owner-bookings-retry"
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
        ) : filteredBookings.length ===
          0 ? (
          <div className="owner-bookings-state">
            <span>📅</span>

            <h2>
              No bookings found
            </h2>

            <p>
              {search ||
              statusFilter !==
                "all"
                ? "No bookings match the selected search or status."
                : "Guest bookings for your properties will appear here."}
            </p>
          </div>
        ) : (
          <div className="owner-bookings-list">
            {filteredBookings.map(
              (booking) => {
                const bookingId =
                  getBookingId(
                    booking
                  );

                const options =
                  getOwnerStatusOptions(
                    booking
                  );

                const updating =
                  actionId ===
                  bookingId;

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

                const specialRequests =
                  booking.specialRequests?.trim();

                return (
                  <article
                    className="owner-managed-booking"
                    key={
                      bookingId ||
                      booking.bookingReference
                    }
                  >
                    <div className="owner-booking-top">
                      <div>
                        <span>
                          {booking.bookingReference ||
                            "Booking"}
                        </span>

                        <h2>
                          {booking
                            .property
                            ?.title ||
                            "HHS Property"}
                        </h2>
                      </div>

                      <span
                        className={`owner-booking-status ${booking.bookingStatus}`}
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
                    </div>

                    <div className="owner-guest-information">
                      <div className="owner-guest-avatar">
                        {guestName
                          .trim()
                          .charAt(
                            0
                          )
                          .toUpperCase() ||
                          "G"}
                      </div>

                      <div>
                        <small>
                          Primary guest
                        </small>

                        <strong>
                          {guestName}
                        </strong>

                        <span>
                          {guestEmail}
                        </span>

                        <span>
                          {guestPhone}
                        </span>
                      </div>
                    </div>

                    <div className="owner-booking-details">
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
                          Rooms
                        </span>

                        <strong>
                          {Number(
                            booking.numberOfRooms
                          ) || 0}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Guests
                        </span>

                        <strong>
                          {Number(
                            booking.numberOfGuests
                          ) || 0}
                        </strong>
                      </div>
                    </div>

                    {specialRequests && (
                      <div className="owner-special-requests">
                        <strong>
                          Special requests:
                        </strong>

                        <span>
                          {
                            specialRequests
                          }
                        </span>
                      </div>
                    )}

                    {booking.bookingStatus ===
                      "expired" && (
                      <div className="owner-booking-expired-note">
                        <strong>
                          Unpaid booking
                          expired
                        </strong>

                        <span>
                          The temporary
                          room hold ended
                          and these rooms
                          were released
                          back into
                          availability.
                        </span>
                      </div>
                    )}

                    <div className="owner-booking-footer">
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

                        <small>
                          Payment:{" "}
                          {booking.paymentStatus
                            ? String(
                                booking.paymentStatus
                              ).replaceAll(
                                "_",
                                " "
                              )
                            : "pending"}
                        </small>
                      </div>

                      {options.length >
                      0 ? (
                        <select
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
                            handleStatusChange(
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
                              : "Update status"}
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
                      ) : (
                        <span className="owner-no-actions">
                          No available
                          actions
                        </span>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default OwnerBookings;