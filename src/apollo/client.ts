import { InMemoryCache } from "@apollo/client";
import { ApolloClient, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { getAccessToken } from "../utils/token";

const httplink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
  credentials: "include",
});

const authLink = new SetContextLink(prevContext => {
  const token = getAccessToken();

  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httplink),
  cache: new InMemoryCache(),
});
