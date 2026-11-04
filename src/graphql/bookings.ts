import { gql } from "@apollo/client";

export const CREATE_RESERVATION = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      reservation {
        id
        eventId
        status
        expiresAt
        items {
          ticketTypeId
          ticketName
          quantity
          unitPrice
        }
      }
      booking {
        id
        eventId
        bookingNumber
        status
        paymentStatus
        subtotal
        discount
        totalAmount
        currency
        items {
          ticketTypeId
          ticketName
          quantity
          unitPrice
          totalPrice
        }
      }
    }
  }
`;

export const MY_BOOKINGS = gql`
  query MyBookings {
    myBookings {
      id
      eventId
      reservationId
      bookingNumber
      status
      paymentStatus
      subtotal
      discount
      totalAmount
      currency
      items {
        ticketTypeId
        ticketName
        quantity
        unitPrice
        totalPrice
      }
      reservation {
        id
        eventId
        status
        expiresAt
        items {
          ticketTypeId
          ticketName
          quantity
          unitPrice
        }
      }
    }
  }
`;

export const RELEASE_RESERVATION = gql`
  mutation ReleaseReservation($id: ID!) {
    releaseReservation(id: $id) {
      success
      status
    }
  }
`;
