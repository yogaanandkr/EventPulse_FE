import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import type { Event } from "../../types/event";
import { UPDATE_EVENT, GET_MY_EVENTS } from "../../graphql/organizer";

interface Props {
  event: Event;
}

const toLocalDateTime = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    console.error("Invalid date received:", value);
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
};

const EditEventForm = ({ event }: Props) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    title: event.title,
    description: event.description,
    category: event.category,
    startDate: toLocalDateTime(event.startDate),
    endDate: toLocalDateTime(event.endDate),
    venue: {
      name: event.venue.name,
      address: event.venue.address,
      city: event.venue.city,
      state: event.venue.state,
      country: event.venue.country,
    },
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const [updateEvent, { loading: saving }] = useMutation(UPDATE_EVENT, {
    refetchQueries: [{ query: GET_MY_EVENTS }],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      setErrorMessage("Invalid event date range.");
      return;
    }

    try {
      await updateEvent({
        variables: {
          id: event.id,
          input: {
            ...form,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        },
      });

      navigate("/organizer");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to update event",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input
          required
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </label>

      <label>
        Description
        <textarea
          required
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <label>
        Category
        <input
          required
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />
      </label>

      <h3>Venue</h3>

      {(["name", "address", "city", "state", "country"] as const).map(field => (
        <label key={field}>
          {field}
          <input
            required
            value={form.venue[field]}
            onChange={e =>
              setForm({
                ...form,
                venue: {
                  ...form.venue,
                  [field]: e.target.value,
                },
              })
            }
          />
        </label>
      ))}

      <h3>Schedule</h3>

      <label>
        Start Date
        <input
          required
          type="datetime-local"
          value={form.startDate}
          onChange={e => setForm({ ...form, startDate: e.target.value })}
        />
      </label>

      <label>
        End Date
        <input
          required
          type="datetime-local"
          value={form.endDate}
          onChange={e => setForm({ ...form, endDate: e.target.value })}
        />
      </label>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};

export default EditEventForm;
