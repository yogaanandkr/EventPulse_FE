import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";

import { CREATE_EVENT, GET_MY_EVENTS } from "../graphql/organizer";

interface CreateEventResult {
  createEvent: {
    id: string;
    title: string;
    status: string;
  };
}

interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  startDate: string;
  endDate: string;
  images: string[];
}

const CreateEventPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateEventInput>({
    title: "",
    description: "",
    category: "",
    venue: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "India",
    },
    startDate: "",
    endDate: "",
    images: [],
  });

  const [errorMessage, setErrorMessage] = useState("");

  const [createEvent, { loading }] = useMutation<
    CreateEventResult,
    { input: CreateEventInput }
  >(CREATE_EVENT, {
    refetchQueries: [{ query: GET_MY_EVENTS }],
  });

  const updateField = (
    field: "title" | "description" | "category" | "startDate" | "endDate",
    value: string,
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateVenue = (
    field: keyof CreateEventInput["venue"],
    value: string,
  ) => {
    setForm(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      setErrorMessage("Enter a valid event date range.");
      return;
    }

    try {
      await createEvent({
        variables: {
          input: {
            ...form,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        },
      });

      navigate("/organizer");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create event",
      );
    }
  };

  return (
    <main>
      <Link to="/organizer">← Back to Dashboard</Link>

      <h1>Create Event</h1>

      <form onSubmit={handleSubmit}>
        <h2>Event Information</h2>

        <label>
          Event Title
          <input
            required
            value={form.title}
            onChange={e => updateField("title", e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={e => updateField("description", e.target.value)}
          />
        </label>

        <label>
          Category
          <input
            required
            value={form.category}
            onChange={e => updateField("category", e.target.value)}
          />
        </label>

        <h2>Venue</h2>

        {(["name", "address", "city", "state", "country"] as const).map(
          field => (
            <label key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                required
                value={form.venue[field]}
                onChange={e => updateVenue(field, e.target.value)}
              />
            </label>
          ),
        )}

        <h2>Schedule</h2>

        <label>
          Start Date
          <input
            type="datetime-local"
            required
            value={form.startDate}
            onChange={e => updateField("startDate", e.target.value)}
          />
        </label>

        <label>
          End Date
          <input
            type="datetime-local"
            required
            value={form.endDate}
            onChange={e => updateField("endDate", e.target.value)}
          />
        </label>

        {errorMessage && <p role="alert">{errorMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </main>
  );
};

export default CreateEventPage;
