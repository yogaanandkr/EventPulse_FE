import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import type { Event } from "../../types/event";
import { Link } from "react-router-dom";
import {
  GET_MY_EVENTS,
  PUBLISH_EVENT,
  // CANCEL_EVENT,
} from "../../graphql/organizer";

interface Props {
  event: Event;
}

const OrganizerEventCard = ({ event }: Props) => {
  const [errorMessage, setErrorMessage] = useState("");

  const [publishEvent, { loading: publishing }] = useMutation(PUBLISH_EVENT, {
    refetchQueries: [{ query: GET_MY_EVENTS }],
  });

  // const [cancelEvent, { loading: cancelling }] = useMutation(CANCEL_EVENT, {
  //   refetchQueries: [{ query: GET_MY_EVENTS }],
  // });

  const handlePublish = async () => {
    setErrorMessage("");

    try {
      await publishEvent({
        variables: { id: event.id },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to publish event",
      );
    }
  };

  // const handleCancel = async () => {
  //   const confirmed = window.confirm(`Cancel "${event.title}"?`);

  //   if (!confirmed) return;

  //   setErrorMessage("");

  //   try {
  //     await cancelEvent({
  //       variables: { id: event.id },
  //     });
  //   } catch (error) {
  //     setErrorMessage(
  //       error instanceof Error ? error.message : "Unable to cancel event",
  //     );
  //   }
  // };

  const isBusy = publishing // || cancelling;

  return (
    <article className="organizer-event-card">
      <h3>{event.title}</h3>

      <p>Category: {event.category}</p>
      <p>City: {event.venue.city}</p>
      <p>Status: {event.status}</p>

      <p>Starts: {new Date(event.startDate).toLocaleDateString("en-IN")}</p>

      {event.status === "DRAFT" && (
        <button onClick={handlePublish} disabled={isBusy}>
          {publishing ? "Publishing..." : "Publish"}
        </button>
      )}

      {event.status !== "CANCELLED" && (
        <Link to={`/organizer/events/${event.id}/edit`}>Edit Event</Link>
      )}

      {errorMessage && <p role="alert">{errorMessage}</p>}
    </article>
  );
};

export default OrganizerEventCard;
