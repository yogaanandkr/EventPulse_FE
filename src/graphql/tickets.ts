import { gql } from "@apollo/client";

export const GET_TICKET_TYPES = gql`
  query GetTicketTypes($eventId: ID!) {
    ticketTypes(eventId: $eventId) {
      id
      name
      description
      price
      currency
      availableQuantity
      saleStartDate
      saleEndDate
      status
    }
  }
`;
