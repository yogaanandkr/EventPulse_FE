import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { GET_MY_EVENTS } from "../graphql/organizer";
import OrganizerEventCard from "../components/organizer/OrganizerEventCard";
import type { Event } from "../types/event";

interface MyEventsData {
  myEvents: Event[];
}

const OrganizerDashboard = () => {
  const { data, loading, error, refetch } =
    useQuery<MyEventsData>(GET_MY_EVENTS);

  if (loading) {
    return <p>Loading your events...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Unable to load events: {error.message}</p>
        <button onClick={() => void refetch()}>Try Again</button>
      </div>
    );
  }

  const events = data?.myEvents ?? [];

  return (
    <main>
      <header>
        <h1>Organizer Dashboard</h1>
        <p>Manage your events and ticket sales.</p>

        <Link to="/organizer/events/new">Create Event</Link>
      </header>

      <section>
        <h2>My Events ({events.length})</h2>

        {events.length === 0 ? (
          <p>You haven't created any events yet.</p>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <OrganizerEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default OrganizerDashboard;
