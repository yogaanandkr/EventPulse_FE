import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  GET_TICKET_TYPES,
  CREATE_TICKET_TYPE,
  UPDATE_TICKET_TYPE,
} from "../graphql/tickets";

import type { TicketType } from "../types/event";

interface TicketData {
  ticketTypes: TicketType[];
}

interface TicketForm {
  name: string;
  description: string;
  price: string;
  totalQuantity: string;
  saleStartDate: string;
  saleEndDate: string;
}

const emptyForm: TicketForm = {
  name: "",
  description: "",
  price: "",
  totalQuantity: "",
  saleStartDate: "",
  saleEndDate: "",
};

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
};

const TicketManagementPage = () => {
  const { id: eventId } = useParams<{ id: string }>();

  const [form, setForm] = useState<TicketForm>({
    ...emptyForm,
  });

  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { data, loading, error, refetch } = useQuery<TicketData>(
    GET_TICKET_TYPES,
    {
      variables: { eventId: eventId ?? "" },
      skip: !eventId,
      fetchPolicy: "cache-and-network",
    },
  );

  const [createTicket, { loading: creating }] = useMutation(
    CREATE_TICKET_TYPE,
    {
      refetchQueries: [
        {
          query: GET_TICKET_TYPES,
          variables: { eventId },
        },
      ],
    },
  );

  const [updateTicket, { loading: updating }] = useMutation(
    UPDATE_TICKET_TYPE,
    {
      refetchQueries: [
        {
          query: GET_TICKET_TYPES,
          variables: { eventId },
        },
      ],
    },
  );

  const tickets = data?.ticketTypes ?? [];
  const submitting = creating || updating;

  const updateField = (field: keyof TicketForm, value: string) => {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingTicketId(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEdit = (ticket: TicketType) => {
    setEditingTicketId(ticket.id);

    setForm({
      name: ticket.name,
      description: ticket.description ?? "",
      price: String(ticket.price),
      totalQuantity: String(ticket.totalQuantity),
      saleStartDate: formatDateTimeLocal(ticket.saleStartDate),
      saleEndDate: formatDateTimeLocal(ticket.saleEndDate),
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!eventId) {
      setErrorMessage("Event ID is missing.");
      return;
    }

    const price = Number(form.price);
    const quantity = Number(form.totalQuantity);

    if (!form.name.trim()) {
      setErrorMessage("Ticket name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setErrorMessage("Enter a valid non-negative price.");
      return;
    }

    if (!editingTicketId && (!Number.isInteger(quantity) || quantity <= 0)) {
      setErrorMessage("Ticket quantity must be a positive whole number.");
      return;
    }

    const saleStart = form.saleStartDate ? new Date(form.saleStartDate) : null;

    const saleEnd = form.saleEndDate ? new Date(form.saleEndDate) : null;

    if (
      (saleStart && Number.isNaN(saleStart.getTime())) ||
      (saleEnd && Number.isNaN(saleEnd.getTime()))
    ) {
      setErrorMessage("Enter valid ticket sale dates.");
      return;
    }

    if (saleStart && saleEnd && saleEnd <= saleStart) {
      setErrorMessage("Sale end date must be later than the sale start date.");
      return;
    }

    try {
      if (editingTicketId) {
        await updateTicket({
          variables: {
            id: editingTicketId,
            input: {
              name: form.name.trim(),
              description: form.description.trim() || null,
              price,
              saleStartDate: saleStart ? saleStart.toISOString() : null,
              saleEndDate: saleEnd ? saleEnd.toISOString() : null,
            },
          },
        });

        setSuccessMessage("Ticket type updated successfully.");
      } else {
        await createTicket({
          variables: {
            input: {
              eventId,
              name: form.name.trim(),
              description: form.description.trim() || undefined,
              price,
              currency: "INR",
              totalQuantity: quantity,
              saleStartDate: saleStart ? saleStart.toISOString() : undefined,
              saleEndDate: saleEnd ? saleEnd.toISOString() : undefined,
            },
          },
        });

        setSuccessMessage("Ticket type created successfully.");
      }

      setForm({ ...emptyForm });
      setEditingTicketId(null);

      await refetch();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to save ticket type.",
      );
    }
  };

  const handleToggleStatus = async (ticket: TicketType) => {
    const nextStatus = ticket.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      `${nextStatus === "INACTIVE" ? "Deactivate" : "Activate"} "${ticket.name}"?`,
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateTicket({
        variables: {
          id: ticket.id,
          input: {
            status: nextStatus,
          },
        },
      });

      setSuccessMessage(
        `Ticket type ${nextStatus.toLowerCase()} successfully.`,
      );

      await refetch();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to update ticket status.",
      );
    }
  };

  if (!eventId) {
    return <p>Invalid event ID.</p>;
  }

  if (loading && !data) {
    return <p>Loading ticket types...</p>;
  }

  if (error && !data) {
    return (
      <main>
        <p role="alert">Unable to load tickets: {error.message}</p>

        <button onClick={() => void refetch()}>Try Again</button>
      </main>
    );
  }

  return (
    <main className="ticket-management">
      <Link to="/organizer">← Back to Organizer Dashboard</Link>

      <h1>Ticket Management</h1>

      <p>Create and manage the ticket types available for this event.</p>

      <section>
        <h2>{editingTicketId ? "Edit Ticket Type" : "Create Ticket Type"}</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Ticket Name
            <input
              required
              value={form.name}
              onChange={e => updateField("name", e.target.value)}
              placeholder="Regular, VIP, Premium"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={e => updateField("description", e.target.value)}
              placeholder="Describe what this ticket includes"
            />
          </label>

          <label>
            Price (INR)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => updateField("price", e.target.value)}
            />
          </label>

          {!editingTicketId && (
            <label>
              Total Quantity
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.totalQuantity}
                onChange={e => updateField("totalQuantity", e.target.value)}
              />
            </label>
          )}

          <label>
            Sale Starts
            <input
              type="datetime-local"
              value={form.saleStartDate}
              onChange={e => updateField("saleStartDate", e.target.value)}
            />
          </label>

          <label>
            Sale Ends
            <input
              type="datetime-local"
              value={form.saleEndDate}
              onChange={e => updateField("saleEndDate", e.target.value)}
            />
          </label>

          {errorMessage && <p role="alert">{errorMessage}</p>}

          {successMessage && <p role="status">{successMessage}</p>}

          <button type="submit" disabled={submitting}>
            {submitting
              ? "Saving..."
              : editingTicketId
                ? "Save Changes"
                : "Create Ticket Type"}
          </button>

          {editingTicketId && (
            <button type="button" onClick={resetForm} disabled={submitting}>
              Cancel Editing
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Existing Ticket Types ({tickets.length})</h2>

        {tickets.length === 0 ? (
          <p>No ticket types created yet.</p>
        ) : (
          <div className="ticket-list">
            {tickets.map(ticket => (
              <article className="ticket-card" key={ticket.id}>
                <h3>{ticket.name}</h3>

                {ticket.description && <p>{ticket.description}</p>}

                <p>
                  Price:{" "}
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: ticket.currency,
                  }).format(ticket.price)}
                </p>

                <p>Status: {ticket.status}</p>

                <p>
                  Total: {ticket.totalQuantity} · Available:{" "}
                  {ticket.availableQuantity}
                </p>

                <p>
                  Sold: {ticket.soldQuantity} · Reserved:{" "}
                  {ticket.reservedQuantity}
                </p>

                <button type="button" onClick={() => handleEdit(ticket)}>
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={() => void handleToggleStatus(ticket)}
                  disabled={submitting}
                >
                  {ticket.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default TicketManagementPage;
