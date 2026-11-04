import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import {
  CREATE_PAYMENT_ORDER,
  VERIFY_RAZORPAY_PAYMENT,
} from "../../graphql/payments";

import { loadRazorpay } from "../../utils/loadRazorpay";

interface PayNowButtonProps {
  bookingId: string;
}

interface CreatePaymentOrderResponse {
  createPaymentOrder: {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    bookingNumber: string;
  };
}

interface VerifyPaymentResponse {
  verifyRazorpayPayment: {
    id: string;
    bookingNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    currency: string;
  };
}

export default function PayNowButton({ bookingId }: PayNowButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [createPaymentOrder] =
    useMutation<CreatePaymentOrderResponse>(CREATE_PAYMENT_ORDER);

  const [verifyPayment] = useMutation<VerifyPaymentResponse>(
    VERIFY_RAZORPAY_PAYMENT,
  );

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");

      // 1. Load Razorpay Checkout script.
      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      // 2. Ask backend to create a payment order.
      const { data } = await createPaymentOrder({
        variables: {
          bookingId,
        },
      });

      const order = data?.createPaymentOrder;

      if (!order) {
        throw new Error("Unable to create payment order.");
      }

      // 3. Configure Razorpay Checkout.
      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "EventPulse",
        description: `Booking ${order.bookingNumber}`,
        order_id: order.orderId,

        theme: {
          color: "#2563eb",
        },

        handler: async response => {
          try {
            setMessage("Verifying your payment...");

            // 4. Send payment details to backend.
            const result = await verifyPayment({
              variables: {
                input: {
                  razorpay_order_id: response.razorpay_order_id,

                  razorpay_payment_id: response.razorpay_payment_id,

                  razorpay_signature: response.razorpay_signature,
                },
              },
            });

            const booking = result.data?.verifyRazorpayPayment;

            if (
              booking?.status === "CONFIRMED" &&
              booking?.paymentStatus === "PAID"
            ) {
              setMessage(`Payment successful! Booking ${booking.bookingNumber} confirmed.`);
              navigate(`/booking/summary?bookingId=${encodeURIComponent(bookingId)}`, {
                replace: true,
                state: null,
              });
            } else {
              setMessage(
                "Payment verification is pending. Please check your booking status.",
              );
            }
          } catch (error) {
            console.error("Payment verification failed:", error);

            setMessage(
              "Payment received by checkout, but verification failed. Please check your booking before retrying.",
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment window closed.");
          },
        },
      };

      // 5. Open Checkout.
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", response => {
        console.error("Razorpay payment failed:", response.error);

        setMessage(response.error.description || "Payment failed.");

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);

      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );

      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
