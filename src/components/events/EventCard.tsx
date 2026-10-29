import { Link } from "react-router-dom";
import type { Event } from "../../types/event";

interface Props {
  event: Event;
}

const EventCard = ({ event }: Props) => {
  const date = new Date(event.startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <article className="event-card">
      {event.images[0] && (
        <img src={event.images[0]} alt={event.title} loading="lazy" />
      )}

      <div>
        <p>{event.category}</p>
        <h2>{event.title}</h2>

        <p>{date}</p>
        <p>
          {event.venue.name}, {event.venue.city}
        </p>

        <Link to={`/events/${event.id}`}>View Details</Link>
      </div>
    </article>
  );
};

export default EventCard;
