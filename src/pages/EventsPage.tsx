import { useQuery } from "@apollo/client/react";
import { ME } from "../graphql/auth";

const EventsPage = () => {
  const { data, loading, error } = useQuery(ME);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Authentication failed: {error.message}</p>;
  }

  return (
    <div>
      <h1>EventPulse</h1>

      <p>Welcome, {data?.me?.name}</p>

      <p>Role: {data?.me?.role}</p>
    </div>
  );
};

export default EventsPage;
