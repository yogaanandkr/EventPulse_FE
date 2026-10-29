import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { GET_EVENT } from "../graphql/events";
import type { Event } from "../types/event";
import EditEventForm from "../components/organizer/EditEventForm";

interface EventData {
  event: Event | null;
}

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<EventData>(GET_EVENT, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  if (!id) return <p>Invalid event ID.</p>;
  if (loading) return <p>Loading event...</p>;
  if (error) return <p>{error.message}</p>;
  if (!data?.event) return <p>Event not found.</p>;

  return <EditEventForm key={id} event={data.event} />;
};

export default EditEventPage;
