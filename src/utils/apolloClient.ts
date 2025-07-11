// putanja: src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "/api/faust/graphql", // FaustWP proxy endpoint
});

const authLink = setContext((_, { headers }) => {
  // Uzimanje tokena iz localStorage ili cookie-ja
  const token = localStorage.getItem("wp_jwt"); // ili "accessToken", zavisi kako ga čuvaš
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
