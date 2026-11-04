import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CREATE_RESERVATION } from "../../graphql/bookings";
import { GET_TICKET_TYPES } from "../../graphql/tickets";
import type { TicketType } from "../../types/event";
import type { ReservationPayload } from "../../types/booking";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  eventId: string;
}

interface TicketData {
  ticketTypes: TicketType[];
}

interface CreateReservationData {
  createReservation: ReservationPayload;
}

const TicketList = ({ eventId }: Props) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => new Date().getTime());
  const { data, loading, error } = useQuery<TicketData>(GET_TICKET_TYPES, {
    variables: { eventId },
  });
  const [createReservation, { loading: reserving }] =
    useMutation<CreateReservationData>(CREATE_RESERVATION);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date().getTime()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const reserveTickets = async () => {
    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    if (!items.length) {
      setMessage("Select at least one ticket to continue.");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: { from: `/events/${eventId}` },
      });
      return;
    }

    if (user.role !== "CUSTOMER") {
      setMessage("Only customer accounts can book tickets.");
      return;
    }

    try {
      setMessage("");
      const result = await createReservation({
        variables: { input: { eventId, items } },
      });
      const payload = result.data?.createReservation;
      if (!payload) throw new Error("Reservation could not be created.");

      navigate("/booking/summary", {
        state: { ...payload, eventTitle: "Event Booking" },
      });
    } catch (reservationError) {
      setMessage(
        reservationError instanceof Error
          ? reservationError.message
          : "Unable to reserve tickets. Please try again.",
      );
    }
  };

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p>Unable to load tickets.</p>;

  const tickets = data?.ticketTypes ?? [];

  if (tickets.length === 0) {
    return <p>No tickets available.</p>;
  }

  return (
    <section>
      <h2>Available Tickets</h2>

      {tickets.map(ticket => {
        const soldOut = ticket.availableQuantity <= 0;
        const saleNotStarted = Boolean(
          ticket.saleStartDate && new Date(ticket.saleStartDate).getTime() > now,
        );
        const saleEnded = Boolean(
          ticket.saleEndDate && new Date(ticket.saleEndDate).getTime() < now,
        );
        const quantity = quantities[ticket.id] ?? 0;

        return (
          <article key={ticket.id}>
            <h3>{ticket.name}</h3>
            <p>{ticket.description}</p>

            <p>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: ticket.currency,
              }).format(ticket.price)}
            </p>

            <p>
              {soldOut ? "Sold out" : `${ticket.availableQuantity} remaining`}
            </p>

            {saleNotStarted ? (
              <p>Sales have not started yet.</p>
            ) : saleEnded ? (
              <p>Sales have ended.</p>
            ) : soldOut ? null : (
              <label>
                Quantity
                <input
                  aria-label={`${ticket.name} quantity`}
                  type="number"
                  min={0}
                  max={ticket.availableQuantity}
                  value={quantity}
                  disabled={authLoading || reserving}
                  onChange={event => {
                    const next = Number(event.target.value);
                    setQuantities(current => ({
                      ...current,
                      [ticket.id]: Math.max(
                        0,
                        Math.min(ticket.availableQuantity, Number.isFinite(next) ? next : 0),
                      ),
                    }));
                  }}
                />
              </label>
            )}
            {soldOut && <p>Sold out</p>}
          </article>
        );
      })}
      {message && <p role="alert">{message}</p>}
      <button
        type="button"
        onClick={() => void reserveTickets()}
        disabled={reserving || authLoading || !tickets.some(ticket => (quantities[ticket.id] ?? 0) > 0)}
      >
        {reserving ? "Reserving tickets..." : "Continue to booking"}
      </button>
    </section>
  );
};

export default TicketList;
