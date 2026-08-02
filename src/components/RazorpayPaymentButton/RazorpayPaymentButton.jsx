import {
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  createPaymentOrder,
  recordPaymentFailure,
  verifyPayment,
} from "../../services/paymentService";

import {
  loadRazorpayCheckout,
} from "../../utils/loadRazorpay";

import "./RazorpayPaymentButton.css";

function RazorpayPaymentButton({
  booking,
  user,
  onPaymentSuccess,
  disabled = false,
  className = "",
}) {
  const [
    processing,
    setProcessing,
  ] = useState(false);

  const bookingId =
    booking?._id ||
    booking?.id;

  const paymentStatus =
    booking?.paymentStatus ||
    "pending";

  const isPaid =
    paymentStatus === "paid";

  const canPay =
    booking &&
    bookingId &&
    !disabled &&
    !processing &&
    !isPaid &&
    [
      "pending",
      "confirmed",
    ].includes(
      booking.bookingStatus
    );

  const handlePayment =
    async () => {
      if (!bookingId) {
        toast.error(
          "Booking information is missing."
        );

        return;
      }

      if (isPaid) {
        toast.info(
          "This booking has already been paid."
        );

        return;
      }

      try {
        setProcessing(true);

        const sdkLoaded =
          await loadRazorpayCheckout();

        if (
          !sdkLoaded ||
          !window.Razorpay
        ) {
          throw new Error(
            "Razorpay Checkout is unavailable."
          );
        }

        const orderResponse =
          await createPaymentOrder(
            bookingId
          );

        const {
          keyId,
          order,
        } = orderResponse;

        if (
          !keyId ||
          !order?.id ||
          !order?.amount
        ) {
          throw new Error(
            "The server returned incomplete payment order details."
          );
        }

        const options = {
          key: keyId,

          amount: order.amount,

          currency:
            order.currency ||
            "INR",

          name:
            "Hogenakkal Home Stay",

          description:
            booking.property?.title
              ? `Booking payment for ${booking.property.title}`
              : `Booking ${booking.bookingReference || ""}`,

          order_id: order.id,

          prefill: {
            name:
              user?.fullName ||
              booking.primaryGuest
                ?.fullName ||
              "",

            email:
              user?.email ||
              booking.primaryGuest
                ?.email ||
              "",

            contact:
              user?.phone ||
              booking.primaryGuest
                ?.phone ||
              "",
          },

          notes: {
            bookingId:
              String(bookingId),

            bookingReference:
              booking.bookingReference ||
              "",
          },

          theme: {
            color: "#0891b2",
          },

          modal: {
            confirm_close: true,

            escape: true,

            ondismiss() {
              setProcessing(
                false
              );

              toast.info(
                "Payment window closed."
              );
            },
          },

          handler:
            async (
              paymentResponse
            ) => {
              try {
                const verifiedData =
                  await verifyPayment(
                    {
                      bookingId,

                      razorpayOrderId:
                        paymentResponse.razorpay_order_id,

                      razorpayPaymentId:
                        paymentResponse.razorpay_payment_id,

                      razorpaySignature:
                        paymentResponse.razorpay_signature,
                    }
                  );

                toast.success(
                  "Payment completed successfully. Your booking is confirmed."
                );

                if (
                  onPaymentSuccess
                ) {
                  await onPaymentSuccess(
                    verifiedData
                  );
                }
              } catch (
                verificationError
              ) {
                console.error(
                  "Payment verification error:",
                  verificationError
                );

                toast.error(
                  verificationError
                    ?.message ||
                    "Payment was received, but verification failed. Contact support before trying again."
                );
              } finally {
                setProcessing(
                  false
                );
              }
            },
        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          async (
            failureResponse
          ) => {
            const errorDetails =
              failureResponse
                ?.error || {};

            const metadata =
              errorDetails
                ?.metadata || {};

            try {
              await recordPaymentFailure(
                {
                  bookingId,

                  orderId:
                    metadata.order_id ||
                    order.id,

                  paymentId:
                    metadata.payment_id ||
                    "",

                  error: {
                    code:
                      errorDetails.code ||
                      "",

                    description:
                      errorDetails.description ||
                      "Payment failed.",

                    reason:
                      errorDetails.reason ||
                      "",

                    source:
                      errorDetails.source ||
                      "",

                    step:
                      errorDetails.step ||
                      "",
                  },
                }
              );
            } catch (
              recordError
            ) {
              console.error(
                "Unable to record payment failure:",
                recordError
              );
            }

            setProcessing(false);

            toast.error(
              errorDetails.description ||
                "Payment failed. Please try again."
            );
          }
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Start payment error:",
          error
        );

        setProcessing(false);

        toast.error(
          error?.message ||
            "Unable to start payment."
        );
      }
    };

  if (isPaid) {
    return (
      <button
        type="button"
        className={`razorpay-payment-button paid ${className}`}
        disabled
      >
        <span className="payment-button-icon">
          ✓
        </span>

        Payment Completed
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`razorpay-payment-button ${className}`}
      onClick={
        handlePayment
      }
      disabled={!canPay}
    >
      {processing ? (
        <>
          <span className="payment-button-spinner" />

          Opening Payment...
        </>
      ) : (
        <>
          <span className="payment-button-icon">
            ₹
          </span>

          Pay Securely
        </>
      )}
    </button>
  );
}

export default RazorpayPaymentButton;