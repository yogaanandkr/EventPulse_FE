import { gql } from "@apollo/client";

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      category
      images
      startDate
      endDate
      status
      venue {
        name
        city
        state
      }
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      title
      description
      category
      images
      startDate
      endDate
      status
      venue {
        name
        address
        city
        state
        country
      }
    }
  }
`;
