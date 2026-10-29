import { gql } from "@apollo/client";

export const GET_MY_EVENTS = gql`
  query GetMyEvents {
    myEvents {
      id
      title
      description
      category
      status
      startDate
      endDate
      images
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

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      status
    }
  }
`;

export const PUBLISH_EVENT = gql`
  mutation PublishEvent($id: ID!) {
    publishEvent(id: $id) {
      id
      title
      status
      publishedAt
    }
  }
`;

export const CANCEL_EVENT = gql`
  mutation CancelEvent($id: ID!) {
    cancelEvent(id: $id) {
      id
      title
      status
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      category
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