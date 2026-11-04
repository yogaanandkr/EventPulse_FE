import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MY_BOOKINGS, RELEASE_RESERVATION } from "../graphql/bookings";
import type { BookingSummaryState, BookingWithReservation } from "../types/booking";
import PayNowButton from "../components/payment/PayNowButton";

interface MyBookingsData {
  myBookings: BookingWithReservation[];
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

function getRemainingSeconds(expiresAt: string) {
  const remaining = new Date(expiresAt).getTime() - Date.now();

  return Math.max(0, Math.ceil(remaining / 1000));
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function BookingSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const state = location.state as BookingSummaryState | null;
  const bookingId = searchParams.get("bookingId");
  const { data: bookingsData } = useQuery<MyBookingsData>(MY_BOOKINGS, {
    skip: Boolean(state?.booking),
    fetchPolicy: "network-only",
  });
  const recoveredBooking = bookingsData?.myBookings.find(
    booking => booking.id === bookingId,
  );
  const data: BookingSummaryState | null = state?.booking
    ? state
    : recoveredBooking
      ? {
          booking: recoveredBooking,
          reservation: recoveredBooking.reservation,
        }
      : null;
  const [releaseReservation, { loading: releasing }] = useMutation(RELEASE_RESERVATION);

  const expiresAt = data?.reservation?.expiresAt;

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    expiresAt ? getRemainingSeconds(expiresAt) : 0,
  );

  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      setRemainingSeconds(getRemainingSeconds(expiresAt));
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!state?.booking && bookingId && bookingsData && !recoveredBooking) {
      navigate("/events", { replace: true });
    }
  }, [bookingId, bookingsData, navigate, recoveredBooking, state?.booking]);

  if (!state?.booking && !bookingsData) {
    return <main className="booking-page"><p>Loading booking...</p></main>;
  }

  if (!data?.reservation || !data?.booking) {
    return (
      <main className="booking-page">
        <h1>Booking not available</h1>
        <p>Open an event and create a reservation to continue.</p>
        <Link to="/events">Browse Events</Link>
      </main>
    );
  }

  const { booking, reservation, eventTitle } = data;

  const isExpired = remainingSeconds === 0;

  const canPay =
    !isExpired &&
    reservation.status === "ACTIVE" &&
    booking.status === "PENDING" &&
    booking.paymentStatus === "UNPAID";

  const cancelReservation = async () => {
    try {
      await releaseReservation({ variables: { id: reservation.id } });
      navigate(`/events/${booking.eventId}`, { replace: true });
    } catch (releaseError) {
      window.alert(
        releaseError instanceof Error
          ? releaseError.message
          : "Unable to cancel this reservation.",
      );
    }
  };

  return (
    <main className="booking-page">
      <section className="booking-container">
        <header>
          <h1>Booking Summary</h1>
          <p>Review your tickets before payment.</p>
        </header>

        <div className="booking-card">
          <div className="booking-header">
            <h2>{eventTitle || "Event Booking"}</h2>

            <p>
              Booking Number: <strong>{booking.bookingNumber}</strong>
            </p>

            <p>Booking Status: {booking.status}</p>
          </div>

          <div className="reservation-timer">
            {isExpired ? (
              <p role="alert">Reservation time has expired.</p>
            ) : (
              <p>
                Complete payment within{" "}
                <strong>{formatCountdown(remainingSeconds)}</strong>
              </p>
            )}
          </div>

          <section>
            <h3>Selected Tickets</h3>

            {booking.items.map((item, index) => (
              <div className="ticket-row" key={`${item.ticketTypeId}-${index}`}>
                <div>
                  <strong>{item.ticketName}</strong>

                  <p>
                    {item.quantity} ×{" "}
                    {formatCurrency(item.unitPrice, booking.currency)}
                  </p>
                </div>

                <strong>
                  {formatCurrency(item.totalPrice, booking.currency)}
                </strong>
              </div>
            ))}
          </section>

          <div className="price-summary">
            <div className="price-row">
              <span>Subtotal</span>
              <span>{formatCurrency(booking.subtotal, booking.currency)}</span>
            </div>

            <div className="price-row">
              <span>Discount</span>
              <span>-{formatCurrency(booking.discount, booking.currency)}</span>
            </div>

            <hr />

            <div className="price-row total">
              <strong>Total Payable</strong>

              <strong>
                {formatCurrency(booking.totalAmount, booking.currency)}
              </strong>
            </div>
          </div>

          <div className="payment-section">
            {canPay ? (
              <PayNowButton bookingId={booking.id} />
            ) : booking.status === "CONFIRMED" ? (
              <p>Booking confirmed.</p>
            ) : (
              <p>
                Payment is unavailable for this reservation. Please check your
                booking status before trying again.
              </p>
            )}
          </div>
          {canPay && (
            <button type="button" onClick={() => void cancelReservation()} disabled={releasing}>
              {releasing ? "Cancelling..." : "Cancel reservation"}
            </button>
          )}
        </div>

      <Link to={`/events/${booking.eventId}`}>Back to Event</Link>
      </section>
    </main>
  );
}
