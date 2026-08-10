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
  useSearchParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  getPropertyById,
} from "../../services/propertyService";

import {
  checkAvailability,
  createBooking,
  getMyBookings,
} from "../../services/bookingService";

import {
  createReview,
  deleteReview,
  getMyReviews,
  getPropertyReviews,
  updateReview,
} from "../../services/reviewService";

import {
  checkSavedProperty,
  toggleSavedProperty,
} from "../../services/savedPropertyService";

import RazorpayPaymentButton from "../../components/RazorpayPaymentButton/RazorpayPaymentButton";

import "./PropertyDetails.css";

/* =====================================
   Date helpers
===================================== */

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getNextDate = (
  dateValue
) => {
  if (!dateValue) {
    return getToday();
  }

  const date = new Date(
    `${dateValue}T00:00:00`
  );

  date.setDate(
    date.getDate() + 1
  );

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatRating = (
  rating
) => {
  const numericRating =
    Number(rating);

  return Number.isFinite(
    numericRating
  )
    ? numericRating.toFixed(1)
    : "0.0";
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

const getEntityId = (
  value
) => {
  return String(
    value?._id ||
      value?.id ||
      value ||
      ""
  );
};

const formatReviewDate = (
  value
) => {
  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const renderReviewStars = (
  rating
) => {
  const normalizedRating =
    Math.min(
      Math.max(
        Math.round(
          Number(rating) || 0
        ),
        0
      ),
      5
    );

  return `${"★".repeat(
    normalizedRating
  )}${"☆".repeat(
    5 - normalizedRating
  )}`;
};

/*
 * These frontend values provide the
 * instant booking-price preview.
 *
 * The backend validates the offer again
 * before creating the booking.
 */

const BOOKING_OFFERS =
  Object.freeze({
    "family-vacation": {
      title:
        "Family Vacation Package",

      discountPercentage: 15,
    },

    "group-company-outing": {
      title:
        "Group & Company Outing",

      discountPercentage: 10,
    },

    "couple-retreat": {
      title:
        "Couple Retreat",

      discountPercentage: 10,
    },
  });

/* =====================================
   Property details page
===================================== */

function PropertyDetails() {
  const {
    id,
  } = useParams();

  const [
    searchParams,
  ] = useSearchParams();

  const offerCode =
    String(
      searchParams.get(
        "offer"
      ) || ""
    )
      .trim()
      .toLowerCase();

  const selectedOffer =
    BOOKING_OFFERS[
      offerCode
    ] || null;

  const navigate =
    useNavigate();

  const {
    user,
    token,
  } = useAuth();

  const [
    property,
    setProperty,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    checkingAvailability,
    setCheckingAvailability,
  ] = useState(false);

  const [
    availableRooms,
    setAvailableRooms,
  ] = useState(null);

  const [
    bookingLoading,
    setBookingLoading,
  ] = useState(false);

  const [
    createdBooking,
    setCreatedBooking,
  ] = useState(null);

  const [
    isSaved,
    setIsSaved,
  ] = useState(false);

  const [
    savedPropertyLoading,
    setSavedPropertyLoading,
  ] = useState(false);

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true);

  const [
    reviewsError,
    setReviewsError,
  ] = useState("");

  const [
    reviewSort,
    setReviewSort,
  ] = useState("newest");

  const [
    reviewPage,
    setReviewPage,
  ] = useState(1);

  const [
    reviewPagination,
    setReviewPagination,
  ] = useState({
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0,
    pageSize: 5,
  });

  const [
    myReview,
    setMyReview,
  ] = useState(null);

  const [
    eligibleBooking,
    setEligibleBooking,
  ] = useState(null);

  const [
    reviewEligibilityLoading,
    setReviewEligibilityLoading,
  ] = useState(false);

  const [
    reviewSubmitting,
    setReviewSubmitting,
  ] = useState(false);

  const [
    reviewForm,
    setReviewForm,
  ] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const [
    formData,
    setFormData,
  ] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: 1,
    numberOfGuests: 1,
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  /* =====================================
     Load property
  ===================================== */

  const loadProperty =
    useCallback(
      async () => {
        if (!id) {
          setProperty(null);

          setError(
            "Invalid property ID."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          setError("");

          const data =
            await getPropertyById(
              id
            );

          if (
            !data?.property
          ) {
            throw new Error(
              "This property could not be found."
            );
          }

          setProperty(
            data.property
          );
        } catch (
          requestError
        ) {
          setProperty(null);

          setError(
            requestError?.data
              ?.message ||
              requestError
                ?.message ||
              "Unable to load this property."
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  /* =====================================
     Load saved-property status
  ===================================== */

  useEffect(() => {
    let isMounted = true;

    const loadSavedStatus =
      async () => {
        const canSaveProperty =
          [
            "customer",
            "owner",
          ].includes(
            user?.role
          );

        if (
          !id ||
          !token ||
          !canSaveProperty
        ) {
          if (isMounted) {
            setIsSaved(false);

            setSavedPropertyLoading(
              false
            );
          }

          return;
        }

        try {
          setSavedPropertyLoading(
            true
          );

          const data =
            await checkSavedProperty(
              id
            );

          if (isMounted) {
            setIsSaved(
              Boolean(
                data?.isSaved
              )
            );
          }
        } catch (
          requestError
        ) {
          if (isMounted) {
            setIsSaved(false);
          }

          if (
            requestError?.status !==
            401
          ) {
            console.error(
              "Check saved property error:",
              requestError
            );
          }
        } finally {
          if (isMounted) {
            setSavedPropertyLoading(
              false
            );
          }
        }
      };

    loadSavedStatus();

    return () => {
      isMounted = false;
    };
  }, [
    id,
    token,
    user?.role,
  ]);

  /* =====================================
     Load public reviews
  ===================================== */

  const loadReviews =
    useCallback(
      async () => {
        if (!id) {
          return;
        }

        try {
          setReviewsLoading(
            true
          );

          setReviewsError("");

          const data =
            await getPropertyReviews(
              id,
              {
                sort:
                  reviewSort,

                page:
                  reviewPage,

                limit: 5,
              }
            );

          setReviews(
            Array.isArray(
              data?.reviews
            )
              ? data.reviews
              : []
          );

          setReviewPagination({
            currentPage:
              Number(
                data?.pagination
                  ?.currentPage
              ) ||
              reviewPage,

            totalPages:
              Number(
                data?.pagination
                  ?.totalPages
              ) ||
              0,

            totalReviews:
              Number(
                data?.pagination
                  ?.totalReviews
              ) ||
              0,

            pageSize:
              Number(
                data?.pagination
                  ?.pageSize
              ) ||
              5,
          });
        } catch (
          requestError
        ) {
          setReviews([]);

          setReviewsError(
            requestError?.data
              ?.message ||
              requestError
                ?.message ||
              "Unable to load property reviews."
          );
        } finally {
          setReviewsLoading(
            false
          );
        }
      },
      [
        id,
        reviewPage,
        reviewSort,
      ]
    );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  /* =====================================
     Load review eligibility
  ===================================== */

  const loadReviewEligibility =
    useCallback(
      async () => {
        if (
          !id ||
          !token ||
          !user ||
          ![
            "customer",
            "owner",
          ].includes(
            user.role
          )
        ) {
          setMyReview(null);

          setEligibleBooking(
            null
          );

          setReviewForm({
            rating: 5,
            title: "",
            comment: "",
          });

          return;
        }

        try {
          setReviewEligibilityLoading(
            true
          );

          const [
            bookingData,
            reviewData,
          ] =
            await Promise.all(
              [
                getMyBookings(),
                getMyReviews(),
              ]
            );

          const myReviews =
            Array.isArray(
              reviewData
                ?.reviews
            )
              ? reviewData
                  .reviews
              : [];

          const existingReview =
            myReviews.find(
              (review) => {
                return (
                  getEntityId(
                    review.property
                  ) ===
                  String(id)
                );
              }
            ) || null;

          const bookings =
            Array.isArray(
              bookingData
                ?.bookings
            )
              ? bookingData
                  .bookings
              : [];

          const completedBooking =
            bookings.find(
              (booking) => {
                return (
                  getEntityId(
                    booking.property
                  ) ===
                    String(
                      id
                    ) &&
                  booking
                    .bookingStatus ===
                    "completed"
                );
              }
            ) || null;

          setMyReview(
            existingReview
          );

          setEligibleBooking(
            completedBooking
          );

          if (
            existingReview
          ) {
            setReviewForm({
              rating:
                Number(
                  existingReview
                    .rating
                ) || 5,

              title:
                existingReview
                  .title ||
                "",

              comment:
                existingReview
                  .comment ||
                "",
            });
          } else {
            setReviewForm({
              rating: 5,
              title: "",
              comment: "",
            });
          }
        } catch (
          requestError
        ) {
          console.error(
            "Load review eligibility error:",
            requestError
          );

          setMyReview(null);

          setEligibleBooking(
            null
          );
        } finally {
          setReviewEligibilityLoading(
            false
          );
        }
      },
      [
        id,
        token,
        user,
      ]
    );

  useEffect(() => {
    loadReviewEligibility();
  }, [
    loadReviewEligibility,
  ]);

  /* =====================================
     Fill user information
  ===================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData(
      (previous) => ({
        ...previous,

        fullName:
          user.fullName ||
          "",

        email:
          user.email ||
          "",

        phone:
          user.phone ||
          "",
      })
    );
  }, [user]);

  /* =====================================
     Input change
  ===================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => {
        const nextFormData = {
          ...previous,
          [name]: value,
        };

        if (
          name ===
            "checkInDate" &&
          previous.checkOutDate &&
          previous.checkOutDate <=
            value
        ) {
          nextFormData.checkOutDate =
            "";
        }

        return nextFormData;
      }
    );

    if (
      name ===
        "checkInDate" ||
      name ===
        "checkOutDate" ||
      name ===
        "numberOfRooms"
    ) {
      setAvailableRooms(
        null
      );
    }
  };

  /* =====================================
     Calculate nights
  ===================================== */

  const numberOfNights =
    useMemo(() => {
      if (
        !formData
          .checkInDate ||
        !formData
          .checkOutDate
      ) {
        return 0;
      }

      const checkIn =
        new Date(
          `${formData.checkInDate}T00:00:00`
        );

      const checkOut =
        new Date(
          `${formData.checkOutDate}T00:00:00`
        );

      const difference =
        checkOut.getTime() -
        checkIn.getTime();

      if (
        difference <= 0
      ) {
        return 0;
      }

      return Math.ceil(
        difference /
          (
            1000 *
            60 *
            60 *
            24
          )
      );
    }, [
      formData.checkInDate,
      formData.checkOutDate,
    ]);

  /* =====================================
     Estimate discounted price
  ===================================== */

  const priceEstimate =
    useMemo(() => {
      if (
        !property ||
        numberOfNights ===
          0
      ) {
        return {
          roomTotal: 0,
          discount: 0,
          discountedRoomTotal:
            0,
          serviceFee: 0,
          taxes: 0,
          grandTotal: 0,
        };
      }

      const roomTotal =
        Number(
          property.pricePerNight
        ) *
        Number(
          formData.numberOfRooms
        ) *
        numberOfNights;

      const discount =
        selectedOffer
          ? Math.round(
              roomTotal *
                (
                  selectedOffer
                    .discountPercentage /
                  100
                )
            )
          : 0;

      const discountedRoomTotal =
        Math.max(
          roomTotal -
            discount,
          0
        );

      const serviceFee =
        Math.round(
          discountedRoomTotal *
            0.05
        );

      const taxes =
        Math.round(
          discountedRoomTotal *
            0.12
        );

      const grandTotal =
        discountedRoomTotal +
        serviceFee +
        taxes;

      return {
        roomTotal,
        discount,
        discountedRoomTotal,
        serviceFee,
        taxes,
        grandTotal,
      };
    }, [
      property,
      formData.numberOfRooms,
      numberOfNights,
      selectedOffer,
    ]);

  /* =====================================
     Save or remove property
  ===================================== */

  const handleToggleSavedProperty =
    async () => {
      if (
        !token ||
        !user
      ) {
        toast.info(
          "Please log in to save this property."
        );

        navigate(
          "/login",
          {
            state: {
              from:
                `/property/${id}`,
            },
          }
        );

        return;
      }

      if (
        ![
          "customer",
          "owner",
        ].includes(
          user.role
        )
      ) {
        toast.error(
          "Only customer and owner accounts can save properties."
        );

        return;
      }
            try {
        setSavedPropertyLoading(
          true
        );

        const data =
          await toggleSavedProperty(
            id
          );

        const nextSavedStatus =
          Boolean(
            data?.isSaved
          );

        setIsSaved(
          nextSavedStatus
        );

        toast.success(
          data?.message ||
            (
              nextSavedStatus
                ? "Property saved successfully."
                : "Property removed from saved properties."
            )
        );
      } catch (
        requestError
      ) {
        if (
          requestError?.status ===
          401
        ) {
          toast.error(
            "Your session has expired. Please log in again."
          );

          navigate(
            "/login",
            {
              replace: true,

              state: {
                from:
                  `/property/${id}`,
              },
            }
          );

          return;
        }

        toast.error(
          requestError?.data
            ?.message ||
            requestError?.message ||
            "Unable to update saved properties."
        );
      } finally {
        setSavedPropertyLoading(
          false
        );
      }
    };

  /* =====================================
     Check availability
  ===================================== */

  const handleAvailabilityCheck =
    async () => {
      if (
        !formData.checkInDate ||
        !formData.checkOutDate
      ) {
        toast.error(
          "Select check-in and check-out dates."
        );

        return null;
      }

      if (
        numberOfNights < 1
      ) {
        toast.error(
          "Check-out must be after check-in."
        );

        return null;
      }

      try {
        setCheckingAvailability(
          true
        );

        const data =
          await checkAvailability({
            propertyId: id,

            checkInDate:
              formData.checkInDate,

            checkOutDate:
              formData.checkOutDate,
          });

        const normalizedAvailableRooms =
          Number(
            data?.availableRooms ??
              data
                ?.availability
                ?.availableRooms ??
              0
          );

        const normalizedAvailability =
          {
            ...data,

            availableRooms:
              normalizedAvailableRooms,

            available:
              data?.available ??
              normalizedAvailableRooms >
                0,
          };

        setAvailableRooms(
          normalizedAvailableRooms
        );

        if (
          normalizedAvailability
            .available
        ) {
          toast.success(
            `${normalizedAvailableRooms} room(s) available.`
          );
        } else {
          toast.error(
            "No rooms are available for these dates."
          );
        }

        return normalizedAvailability;
      } catch (
        requestError
      ) {
        toast.error(
          requestError?.message ||
            "Unable to check availability."
        );

        return null;
      } finally {
        setCheckingAvailability(
          false
        );
      }
    };

  /* =====================================
     Create booking
  ===================================== */

  const handleBooking =
    async (event) => {
      event.preventDefault();

      if (
        !token ||
        !user
      ) {
        toast.info(
          "Please log in to book this property."
        );

        navigate(
          "/login",
          {
            state: {
              from:
                `/property/${id}`,
            },
          }
        );

        return;
      }

      if (
        ![
          "customer",
          "owner",
        ].includes(
          user.role
        )
      ) {
        toast.error(
          "Staff accounts cannot create customer bookings."
        );

        return;
      }

      if (
        !formData.fullName
          .trim() ||
        !formData.email
          .trim() ||
        !formData.phone
          .trim()
      ) {
        toast.error(
          "Complete the primary guest information."
        );

        return;
      }

      const requestedRooms =
        Number(
          formData.numberOfRooms
        );

      const requestedGuests =
        Number(
          formData.numberOfGuests
        );

      if (
        !Number.isInteger(
          requestedRooms
        ) ||
        requestedRooms < 1 ||
        requestedRooms >
          Number(
            property.availableRooms
          )
      ) {
        toast.error(
          "Select a valid number of available rooms."
        );

        return;
      }

      if (
        !Number.isInteger(
          requestedGuests
        ) ||
        requestedGuests < 1 ||
        requestedGuests >
          Number(
            property.maxGuests
          ) *
            requestedRooms
      ) {
        toast.error(
          "The guest count exceeds this property's capacity."
        );

        return;
      }

      const availability =
        await handleAvailabilityCheck();

      if (
        !availability?.available ||
        requestedRooms >
          availability.availableRooms
      ) {
        toast.error(
          "The requested number of rooms is unavailable."
        );

        return;
      }

      try {
        setBookingLoading(
          true
        );

        const data =
          await createBooking({
            propertyId: id,

            checkInDate:
              formData.checkInDate,

            checkOutDate:
              formData.checkOutDate,

            numberOfRooms:
              requestedRooms,

            numberOfGuests:
              requestedGuests,

            primaryGuest: {
              fullName:
                formData.fullName
                  .trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              phone:
                formData.phone
                  .trim(),
            },

            specialRequests:
              formData
                .specialRequests
                .trim(),

            /*
             * Send only the offer
             * identifier. The browser
             * never sends the discount
             * percentage.
             */
            offerCode:
              selectedOffer
                ? offerCode
                : "",

            guests: [],
          });

        if (
          !data?.booking
        ) {
          throw new Error(
            "The booking was created, but booking details were not returned."
          );
        }

        setCreatedBooking(
          data.booking
        );

        toast.success(
          `Booking ${data.booking.bookingReference} created. Complete payment to confirm it.`
        );
      } catch (
        requestError
      ) {
        toast.error(
          requestError?.data
            ?.message ||
            requestError?.message ||
            "Unable to create booking."
        );
      } finally {
        setBookingLoading(
          false
        );
      }
    };

  /* =====================================
     Payment success
  ===================================== */

  const handlePaymentSuccess =
    async (
      paymentData
    ) => {
      const paidBooking =
        paymentData?.booking ||
        createdBooking;

      if (
        paymentData?.booking
      ) {
        setCreatedBooking(
          paymentData.booking
        );
      }

      navigate(
        "/bookings",
        {
          replace: true,

          state: {
            paymentSuccess:
              true,

            bookingId:
              paidBooking?._id ||
              paidBooking?.id,
          },
        }
      );
    };

  /* =====================================
     Review form handlers
  ===================================== */

  const handleReviewChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setReviewForm(
      (previous) => ({
        ...previous,

        [name]:
          name === "rating"
            ? Number(value)
            : value,
      })
    );
  };

  const handleReviewSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !token ||
        !user
      ) {
        toast.info(
          "Please log in to submit a review."
        );

        navigate(
          "/login",
          {
            state: {
              from:
                `/property/${id}`,
            },
          }
        );

        return;
      }

      if (
        !myReview &&
        !eligibleBooking
      ) {
        toast.error(
          "Only customers with a completed stay can review this property."
        );

        return;
      }

      const numericRating =
        Number(
          reviewForm.rating
        );

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        toast.error(
          "Select a rating between 1 and 5 stars."
        );

        return;
      }

      if (
        reviewForm.comment
          .trim()
          .length < 10
      ) {
        toast.error(
          "Your review must contain at least 10 characters."
        );

        return;
      }

      try {
        setReviewSubmitting(
          true
        );

        if (myReview) {
          await updateReview(
            getEntityId(
              myReview
            ),
            {
              rating:
                numericRating,

              title:
                reviewForm.title
                  .trim(),

              comment:
                reviewForm.comment
                  .trim(),
            }
          );

          toast.success(
            "Review updated successfully."
          );
        } else {
          await createReview({
            propertyId: id,

            bookingId:
              getEntityId(
                eligibleBooking
              ),

            rating:
              numericRating,

            title:
              reviewForm.title
                .trim(),

            comment:
              reviewForm.comment
                .trim(),
          });

          toast.success(
            "Review submitted successfully."
          );
        }

        setReviewPage(1);

        await Promise.all([
          loadReviews(),
          loadReviewEligibility(),
          loadProperty(),
        ]);
      } catch (
        requestError
      ) {
        toast.error(
          requestError?.data
            ?.message ||
            requestError?.message ||
            "Unable to save your review."
        );
      } finally {
        setReviewSubmitting(
          false
        );
      }
    };

  const handleReviewDelete =
    async () => {
      if (!myReview) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete your review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setReviewSubmitting(
          true
        );

        await deleteReview(
          getEntityId(
            myReview
          )
        );

        toast.success(
          "Review deleted successfully."
        );

        setMyReview(null);

        setReviewForm({
          rating: 5,
          title: "",
          comment: "",
        });

        setReviewPage(1);

        await Promise.all([
          loadReviews(),
          loadReviewEligibility(),
          loadProperty(),
        ]);
      } catch (
        requestError
      ) {
        toast.error(
          requestError?.data
            ?.message ||
            requestError?.message ||
            "Unable to delete your review."
        );
      } finally {
        setReviewSubmitting(
          false
        );
      }
    };

  /* =====================================
     Property cover image
  ===================================== */

  const getCoverImage =
    () => {
      const images =
        Array.isArray(
          property?.images
        )
          ? property.images
          : [];

      const cover =
        images.find(
          (image) =>
            image.isCover
        );

      return (
        cover?.url ||
        images[0]?.url ||
        null
      );
    };

  /* =====================================
     Loading screen
  ===================================== */

  if (loading) {
    return (
      <main className="property-details-state">
        <div className="property-details-spinner" />

        <p>
          Loading property
          details...
        </p>
      </main>
    );
  }

  /* =====================================
     Error screen
  ===================================== */

  if (
    error ||
    !property
  ) {
    return (
      <main className="property-details-state">
        <span>
          🏨
        </span>

        <h1>
          Property unavailable
        </h1>

        <p>
          {error ||
            "This property could not be found."}
        </p>

        <Link to="/explore">
          Explore other stays
        </Link>
      </main>
    );
  }

  const coverImage =
    getCoverImage();

  return (
    <main className="property-details-page">
      {/* =================================
          Property hero
      ================================= */}

      <section className="property-details-hero">
        <Link
          className="property-details-back"
          to="/explore"
        >
          ← Back to Explore
        </Link>

        {(
          !user ||
          [
            "customer",
            "owner",
          ].includes(
            user.role
          )
        ) && (
          <button
            type="button"
            className={`property-save-button ${
              isSaved
                ? "saved"
                : ""
            }`}
            onClick={
              handleToggleSavedProperty
            }
            disabled={
              savedPropertyLoading
            }
            aria-pressed={
              isSaved
            }
            aria-label={
              isSaved
                ? "Remove property from saved properties"
                : "Save property"
            }
          >
            <span
              aria-hidden="true"
            >
              {isSaved
                ? "♥"
                : "♡"}
            </span>

            {savedPropertyLoading
              ? "Updating..."
              : isSaved
                ? "Saved"
                : "Save property"}
          </button>
        )}

        {coverImage ? (
          <img
            src={
              coverImage
            }
            alt={
              property.title
            }
          />
        ) : (
          <div className="property-details-placeholder">
            HHS
          </div>
        )}

        <div className="property-details-overlay" />

        <div className="property-details-title">
          <div className="property-details-badges">
            <span>
              {
                property.propertyType
              }
            </span>

            {property.isFeatured && (
              <span className="featured">
                ★ Featured
              </span>
            )}
          </div>

          <h1>
            {property.title}
          </h1>

          <p>
            📍{" "}
            {property.location
              ?.address}
            ,{" "}
            {property.location
              ?.city}
            ,{" "}
            {property.location
              ?.district}
          </p>
        </div>
      </section>

      <div className="property-details-container">
        {/* =================================
            Property information
        ================================= */}

        <section className="property-information">
          <div className="property-summary">
            <div>
              <span>
                Guests
              </span>

              <strong>
                {
                  property.maxGuests
                }
              </strong>
            </div>

            <div>
              <span>
                Bedrooms
              </span>

              <strong>
                {
                  property.bedrooms
                }
              </strong>
            </div>

            <div>
              <span>
                Bathrooms
              </span>

              <strong>
                {
                  property.bathrooms
                }
              </strong>
            </div>

            <div>
              <span>
                Available rooms
              </span>

              <strong>
                {
                  property.availableRooms
                }
              </strong>
            </div>

            <div>
              <span>
                Total rooms
              </span>

              <strong>
                {
                  property.totalRooms
                }
              </strong>
            </div>

            <div>
              <span>
                Rating
              </span>

              <strong>
                ⭐{" "}
                {formatRating(
                  property.rating ??
                    property.averageRating
                )}
              </strong>
            </div>
          </div>

          <article className="property-details-card">
            <h2>
              About this property
            </h2>

            <p>
              {
                property.description
              }
            </p>
          </article>

          <article className="property-details-card">
            <h2>
              Hosted by
            </h2>

            <div className="property-owner-card">
              <div className="property-owner-avatar">
                {(
                  property.owner
                    ?.fullName ||
                  "H"
                )
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {property.owner
                    ?.fullName ||
                    "HHS Property Partner"}
                </strong>

                <span>
                  Verified Hogenakkal
                  stay partner
                </span>
              </div>
            </div>
          </article>

          <article className="property-details-card">
            <h2>
              Amenities
            </h2>

            {property.amenities
              ?.length ? (
              <div className="property-amenities">
                {property.amenities.map(
                  (amenity) => (
                    <span
                      key={
                        amenity
                      }
                    >
                      ✓{" "}
                      {
                        amenity
                      }
                    </span>
                  )
                )}
              </div>
            ) : (
              <p>
                Amenities will be
                updated soon.
              </p>
            )}
          </article>

          <article className="property-details-card">
            <h2>
              Property rules
            </h2>

            {property.rules
              ?.length ? (
              <ul className="property-rules">
                {property.rules.map(
                  (rule) => (
                    <li
                      key={
                        rule
                      }
                    >
                      {rule}

                                          </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                Standard property
                rules apply.
              </p>
            )}

            <div className="property-times">
              <span>
                Check-in:

                <strong>
                  {
                    property.checkInTime
                  }
                </strong>
              </span>

              <span>
                Check-out:

                <strong>
                  {
                    property.checkOutTime
                  }
                </strong>
              </span>
            </div>
          </article>

          {property.images
            ?.length > 1 && (
            <article className="property-details-card">
              <h2>
                Property gallery
              </h2>

              <div className="property-gallery">
                {property.images.map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      src={
                        image.url
                      }
                      alt={`${
                        property.title
                      } ${
                        index + 1
                      }`}
                      key={
                        image.publicId ||
                        image.url
                      }
                      loading="lazy"
                    />
                  )
                )}
              </div>
            </article>
          )}

          {/* =================================
              Verified guest reviews
          ================================= */}

          <article className="property-details-card property-reviews-card">
            <div className="property-reviews-header">
              <div>
                <span className="property-reviews-eyebrow">
                  Verified guest
                  feedback
                </span>

                <h2>
                  Guest reviews
                </h2>

                <p>
                  Reviews can be
                  submitted only after
                  a completed HHS stay.
                </p>
              </div>

              <div className="property-review-overview">
                <strong>
                  {formatRating(
                    property.rating ??
                      property.averageRating
                  )}
                </strong>

                <span>
                  {renderReviewStars(
                    property.rating ??
                      property.averageRating
                  )}
                </span>

                <small>
                  {Number(
                    property.totalReviews
                  ) ||
                    reviewPagination
                      .totalReviews ||
                    0}{" "}
                  review(s)
                </small>
              </div>
            </div>

            {reviewEligibilityLoading ? (
              <div className="property-review-eligibility">
                Checking your review
                eligibility...
              </div>
            ) : !token ||
              !user ? (
              <div className="property-review-eligibility">
                <div>
                  <strong>
                    Stayed here before?
                  </strong>

                  <span>
                    Log in to submit a
                    verified review.
                  </span>
                </div>

                <Link
                  to="/login"
                  state={{
                    from:
                      `/property/${id}`,
                  }}
                >
                  Login to review
                </Link>
              </div>
            ) : [
                "customer",
                "owner",
              ].includes(
                user.role
              ) &&
              (
                eligibleBooking ||
                myReview
              ) ? (
              <form
                className="property-review-form"
                onSubmit={
                  handleReviewSubmit
                }
              >
                <div className="property-review-form-heading">
                  <div>
                    <strong>
                      {myReview
                        ? "Update your review"
                        : "Share your experience"}
                    </strong>

                    <span>
                      ✓ Verified completed
                      stay
                    </span>
                  </div>

                  {myReview &&
                    !myReview
                      .isVisible && (
                      <small>
                        Your review is
                        currently hidden
                        by moderation.
                      </small>
                    )}
                </div>

                <fieldset className="property-review-stars">
                  <legend>
                    Your rating
                  </legend>

                  <div>
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                    ].map(
                      (star) => (
                        <button
                          key={
                            star
                          }
                          type="button"
                          className={
                            star <=
                            reviewForm
                              .rating
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            setReviewForm(
                              (
                                previous
                              ) => ({
                                ...previous,

                                rating:
                                  star,
                              })
                            );
                          }}
                          aria-label={`${star} star rating`}
                          aria-pressed={
                            star ===
                            reviewForm
                              .rating
                          }
                        >
                          ★
                        </button>
                      )
                    )}
                  </div>
                </fieldset>

                <label
                  className="property-review-field"
                  htmlFor="reviewTitle"
                >
                  <span>
                    Review title
                  </span>

                  <input
                    id="reviewTitle"
                    name="title"
                    value={
                      reviewForm.title
                    }
                    onChange={
                      handleReviewChange
                    }
                    placeholder="Summarize your stay"
                    maxLength="120"
                  />
                </label>

                <label
                  className="property-review-field"
                  htmlFor="reviewComment"
                >
                  <span>
                    Your review
                  </span>

                  <textarea
                    id="reviewComment"
                    name="comment"
                    value={
                      reviewForm.comment
                    }
                    onChange={
                      handleReviewChange
                    }
                    placeholder="Tell other guests about the rooms, location, cleanliness and hospitality..."
                    rows="5"
                    minLength="10"
                    maxLength="2000"
                    required
                  />
                </label>

                <div className="property-review-form-actions">
                  <button
                    type="submit"
                    disabled={
                      reviewSubmitting
                    }
                  >
                    {reviewSubmitting
                      ? "Saving review..."
                      : myReview
                        ? "Update review"
                        : "Submit verified review"}
                  </button>

                  {myReview && (
                    <button
                      type="button"
                      className="delete"
                      onClick={
                        handleReviewDelete
                      }
                      disabled={
                        reviewSubmitting
                      }
                    >
                      Delete review
                    </button>
                  )}
                </div>
              </form>
            ) : [
                "customer",
                "owner",
              ].includes(
                user.role
              ) ? (
              <div className="property-review-eligibility muted">
                Complete a stay at this
                property before
                submitting a review.
              </div>
            ) : null}

            <div className="property-review-toolbar">
              <strong>
                {
                  reviewPagination
                    .totalReviews
                }{" "}
                public review(s)
              </strong>

              <label>
                <span>
                  Sort reviews
                </span>

                <select
                  value={
                    reviewSort
                  }
                  onChange={(
                    event
                  ) => {
                    setReviewSort(
                      event.target
                        .value
                    );

                    setReviewPage(
                      1
                    );
                  }}
                >
                  <option value="newest">
                    Newest first
                  </option>

                  <option value="oldest">
                    Oldest first
                  </option>

                  <option value="highest">
                    Highest rated
                  </option>

                  <option value="lowest">
                    Lowest rated
                  </option>
                </select>
              </label>
            </div>

            {reviewsLoading ? (
              <div className="property-reviews-state">
                <div className="property-review-spinner" />

                <p>
                  Loading guest
                  reviews...
                </p>
              </div>
            ) : reviewsError ? (
              <div className="property-reviews-state error">
                <span>
                  !
                </span>

                <p>
                  {reviewsError}
                </p>

                <button
                  type="button"
                  onClick={
                    loadReviews
                  }
                >
                  Try again
                </button>
              </div>
            ) : reviews.length ===
              0 ? (
              <div className="property-reviews-state">
                <span>
                  ☆
                </span>

                <h3>
                  No reviews yet
                </h3>

                <p>
                  Be the first verified
                  guest to review this
                  property.
                </p>
              </div>
            ) : (
              <div className="property-review-list">
                {reviews.map(
                  (review) => {
                    const reviewerName =
                      review.customer
                        ?.fullName ||
                      "Verified HHS guest";

                    return (
                      <article
                        className="property-review-item"
                        key={getEntityId(
                          review
                        )}
                      >
                        <div className="property-review-item-top">
                          <div className="property-review-person">
                            <div className="property-review-avatar">
                              {reviewerName
                                .trim()
                                .charAt(
                                  0
                                )
                                .toUpperCase() ||
                                "G"}
                            </div>

                            <div>
                              <strong>
                                {
                                  reviewerName
                                }
                              </strong>

                              <span>
                                ✓ Verified
                                stay
                              </span>
                            </div>
                          </div>

                          <div className="property-review-rating">
                            <strong>
                              {renderReviewStars(
                                review.rating
                              )}
                            </strong>

                            <span>
                              {formatReviewDate(
                                review.createdAt
                              )}
                            </span>
                          </div>
                        </div>

                        {review.title && (
                          <h3>
                            {
                              review.title
                            }
                          </h3>
                        )}

                        <p>
                          {
                            review.comment
                          }
                        </p>

                        {review.ownerReply
                          ?.message && (
                          <div className="property-review-reply">
                            <strong>
                              Response from
                              the property
                            </strong>

                            <p>
                              {
                                review
                                  .ownerReply
                                  .message
                              }
                            </p>

                            <span>
                              {formatReviewDate(
                                review
                                  .ownerReply
                                  .repliedAt
                              )}
                            </span>
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}

            {reviewPagination
              .totalPages >
              1 && (
              <div className="property-review-pagination">
                <button
                  type="button"
                  onClick={() => {
                    setReviewPage(
                      (previous) =>
                        Math.max(
                          previous -
                            1,
                          1
                        )
                    );
                  }}
                  disabled={
                    reviewPage <= 1 ||
                    reviewsLoading
                  }
                >
                  Previous
                </button>

                <span>
                  Page{" "}
                  {
                    reviewPagination
                      .currentPage
                  }{" "}
                  of{" "}
                  {
                    reviewPagination
                      .totalPages
                  }
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setReviewPage(
                      (previous) =>
                        Math.min(
                          previous +
                            1,
                          reviewPagination
                            .totalPages
                        )
                    );
                  }}
                  disabled={
                    reviewPage >=
                      reviewPagination
                        .totalPages ||
                    reviewsLoading
                  }
                >
                  Next
                </button>
              </div>
            )}
          </article>
        </section>

        {/* =================================
            Booking and payment card
        ================================= */}

        <aside className="booking-card">
          <div className="booking-price">
            <div>
              {Number(
                property.originalPrice
              ) >
                Number(
                  property.pricePerNight
                ) && (
                <del>
                  {formatCurrency(
                    property.originalPrice
                  )}
                </del>
              )}

              <strong>
                {formatCurrency(
                  property.pricePerNight
                )}
              </strong>

              <span>
                per room/night
              </span>
            </div>

            <span>
              ⭐{" "}
              {formatRating(
                property.rating ??
                  property.averageRating
              )}
            </span>
          </div>

          {selectedOffer && (
            <div className="availability-result available">
              {selectedOffer.title}
              {" — "}
              {
                selectedOffer
                  .discountPercentage
              }
              % OFF applied
            </div>
          )}

          {createdBooking ? (
            <form
              onSubmit={(
                event
              ) => {
                event.preventDefault();
              }}
            >
              <div className="availability-result available">
                Booking created
                successfully
              </div>

              <div className="booking-price-summary">
                <div>
                  <span>
                    Booking reference
                  </span>

                  <strong>
                    {
                      createdBooking
                        .bookingReference
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Check-in
                  </span>

                  <strong>
                    {new Date(
                      createdBooking
                        .checkInDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Check-out
                  </span>

                  <strong>
                    {new Date(
                      createdBooking
                        .checkOutDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Rooms
                  </span>

                  <strong>
                    {
                      createdBooking
                        .numberOfRooms
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Guests
                  </span>

                  <strong>
                    {
                      createdBooking
                        .numberOfGuests
                    }
                  </strong>
                </div>

                {Number(
                  createdBooking
                    .priceDetails
                    ?.discount
                ) > 0 && (
                  <div>
                    <span>
                      {
                        createdBooking
                          .priceDetails
                          ?.offerTitle
                      }{" "}
                      discount
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        createdBooking
                          .priceDetails
                          ?.discount
                      )}
                    </strong>
                  </div>
                )}

                <div className="booking-total">
                  <span>
                    Payable amount
                  </span>

                  <strong>
                    {formatCurrency(
                      createdBooking
                        .priceDetails
                        ?.grandTotal
                    )}
                  </strong>
                </div>
              </div>

              <RazorpayPaymentButton
                booking={
                  createdBooking
                }
                user={
                  user
                }
                onPaymentSuccess={
                  handlePaymentSuccess
                }
              />

              <button
                type="button"
                className="availability-button"
                onClick={() => {
                  navigate(
                    "/bookings"
                  );
                }}
              >
                View My Bookings
              </button>

              <small className="booking-note">
                Your booking remains
                pending until the
                payment is verified
                successfully.
              </small>
            </form>
          ) : (
            <form
              onSubmit={
                handleBooking
              }
            >
              <div className="booking-date-grid">
                <div className="booking-field">
                  <label htmlFor="checkInDate">
                    Check-in
                  </label>

                  <input
                    id="checkInDate"
                    name="checkInDate"
                    type="date"
                    min={
                      getToday()
                    }
                    value={
                      formData
                        .checkInDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="checkOutDate">
                    Check-out
                  </label>

                  <input
                    id="checkOutDate"
                    name="checkOutDate"
                    type="date"
                    min={getNextDate(
                      formData
                        .checkInDate
                    )}
                    value={
                      formData
                        .checkOutDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>
              </div>

              <div className="booking-date-grid">
                <div className="booking-field">
                  <label htmlFor="numberOfRooms">
                    Rooms
                  </label>

                  <input
                    id="numberOfRooms"
                    name="numberOfRooms"
                    type="number"
                    min="1"
                    max={Math.max(
                      Number(
                        property.availableRooms
                      ) || 1,
                      1
                    )}
                    value={
                      formData
                        .numberOfRooms
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="numberOfGuests">
                    Guests
                  </label>

                  <input
                    id="numberOfGuests"
                    name="numberOfGuests"
                    type="number"
                    min="1"
                    max={
                      Number(
                        property.maxGuests
                      ) *
                      Number(
                        formData
                          .numberOfRooms
                      )
                    }
                    value={
                      formData
                        .numberOfGuests
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>
              </div>

              <button
                className="availability-button"
                type="button"
                onClick={
                  handleAvailabilityCheck
                }
                disabled={
                  checkingAvailability
                }
              >
                {checkingAvailability
                  ? "Checking..."
                  : "Check availability"}
              </button>

              {availableRooms !==
                null && (
                <div
                  className={
                    availableRooms >
                    0
                      ? "availability-result available"
                      : "availability-result unavailable"
                  }
                >
                  {availableRooms >
                  0
                    ? `${availableRooms} room(s) available`
                    : "No rooms available"}
                </div>
              )}

              <div className="booking-field">
                <label htmlFor="fullName">
                  Primary guest name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter guest name"
                  required
                />
              </div>

              <div className="booking-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter email"
                  required
                />
              </div>
                            <div className="booking-field">
                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="booking-field">
                <label htmlFor="specialRequests">
                  Special requests
                </label>

                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  rows="3"
                  value={
                    formData
                      .specialRequests
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional requests"
                />
              </div>

              {numberOfNights >
                0 && (
                <div className="booking-price-summary">
                  <div>
                    <span>
                      {formatCurrency(
                        property.pricePerNight
                      )}{" "}
                      ×{" "}
                      {
                        numberOfNights
                      }{" "}
                      night(s) ×{" "}
                      {
                        formData.numberOfRooms
                      }{" "}
                      room(s)
                    </span>

                    <strong>
                      {formatCurrency(
                        priceEstimate.roomTotal
                      )}
                    </strong>
                  </div>

                  {selectedOffer && (
                    <>
                      <div>
                        <span>
                          {
                            selectedOffer.title
                          }{" "}
                          (
                          {
                            selectedOffer
                              .discountPercentage
                          }
                          % OFF)
                        </span>

                        <strong>
                          -
                          {formatCurrency(
                            priceEstimate.discount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Price after
                          offer
                        </span>

                        <strong>
                          {formatCurrency(
                            priceEstimate
                              .discountedRoomTotal
                          )}
                        </strong>
                      </div>
                    </>
                  )}

                  <div>
                    <span>
                      Service fee
                    </span>

                    <strong>
                      {formatCurrency(
                        priceEstimate.serviceFee
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Taxes
                    </span>

                    <strong>
                      {formatCurrency(
                        priceEstimate.taxes
                      )}
                    </strong>
                  </div>

                  <div className="booking-total">
                    <span>
                      Total payable
                    </span>

                    <strong>
                      {formatCurrency(
                        priceEstimate.grandTotal
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <button
                className="booking-submit-button"
                type="submit"
                disabled={
                  bookingLoading ||
                  Number(
                    property.availableRooms
                  ) < 1
                }
              >
                {Number(
                  property.availableRooms
                ) < 1
                  ? "Currently unavailable"
                  : bookingLoading
                    ? "Creating booking..."
                    : token
                      ? "Continue to payment"
                      : "Login to reserve"}
              </button>

              <small className="booking-note">
                The booking will be
                confirmed only after
                successful payment
                verification.
              </small>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}

export default PropertyDetails;