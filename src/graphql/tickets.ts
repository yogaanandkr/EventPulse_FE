import { gql } from "@apollo/client";

export const GET_TICKET_TYPES = gql`
  query GetTicketTypes($eventId: ID!) {
    ticketTypes(eventId: $eventId) {
      id
      eventId
      name
      description
      price
      currency
      totalQuantity
      availableQuantity
      soldQuantity
      reservedQuantity
      saleStartDate
      saleEndDate
      status
    }
  }
`;

export const CREATE_TICKET_TYPE = gql`
  mutation CreateTicketType($input: CreateTicketTypeInput!) {
    createTicketType(input: $input) {
      id
      eventId
      name
      description
      price
      currency
      totalQuantity
      availableQuantity
      soldQuantity
      reservedQuantity
      saleStartDate
      saleEndDate
      status
    }
  }
`;

export const UPDATE_TICKET_TYPE = gql`
  mutation UpdateTicketType($id: ID!, $input: UpdateTicketTypeInput!) {
    updateTicketType(id: $id, input: $input) {
      id
      name
      description
      price
      saleStartDate
      saleEndDate
      status
    }
  }
`;
