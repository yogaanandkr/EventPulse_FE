import { useQuery } from "@apollo/client/react";
import { GET_TICKET_TYPES } from "../../graphql/tickets";
import type { TicketType } from "../../types/event";

interface Props {
  eventId: string;
}

interface TicketData {
  ticketTypes: TicketType[];
}

const TicketList = ({ eventId }: Props) => {
  const { data, loading, error } = useQuery<TicketData>(GET_TICKET_TYPES, {
    variables: { eventId },
  });

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

            <button disabled>
              {soldOut ? "Sold Out" : "Booking Coming Soon"}
            </button>
          </article>
        );
      })}
    </section>
  );
};

export default TicketList;
