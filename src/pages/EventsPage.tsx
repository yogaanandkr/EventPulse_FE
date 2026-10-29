import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";

import { GET_EVENTS } from "../graphql/events";
import EventCard from "../components/events/EventCard";
import type { Event } from "../types/event";

interface EventsData {
  events: Event[];
}

const EventsPage = () => {
  const [search, setSearch] = useState("");

  const { data, loading, error, refetch } = useQuery<EventsData>(GET_EVENTS);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data?.events ?? []).filter(event =>
      [event.title, event.category, event.venue.city].some(value =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [data, search]);

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Unable to load events: {error.message}</p>
        <button onClick={() => void refetch()}>Try Again</button>
      </div>
    );
  }

  return (
    <main>
      <h1>Discover Events</h1>
      <p>Find your next experience.</p>

      <input
        type="search"
        placeholder="Search events, categories or cities"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filteredEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
};

export default EventsPage;
