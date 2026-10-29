import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { GET_EVENT } from "../graphql/events";
import TicketList from "../components/events/TicketList";
import type { Event } from "../types/event";

interface EventData {
  event: Event | null;
}

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<EventData>(GET_EVENT, {
    variables: { id },
    skip: !id,
  });

  if (!id) return <p>Invalid event ID.</p>;
  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Unable to load event.</p>;
  if (!data?.event) return <p>Event not found.</p>;

  const event = data.event;

  return (
    <main>
      <Link to="/events">← Back to Events</Link>

      {event.images[0] && (
        <img src={event.images[0]} alt={event.title} className="event-banner" />
      )}

      <h1>{event.title}</h1>
      <p>{event.category}</p>
      <p>{event.description}</p>

      <section>
        <h2>Event Information</h2>

        <p>
          <strong>Starts:</strong>{" "}
          {new Date(event.startDate).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </p>

        <p>
          <strong>Venue:</strong> {event.venue.name}, {event.venue.address},{" "}
          {event.venue.city}, {event.venue.state}
        </p>
      </section>

      <TicketList eventId={event.id} />
    </main>
  );
};

export default EventDetailsPage;
