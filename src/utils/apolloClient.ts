import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// 1. Pravimo http link ka FaustWP GraphQL endpointu
const httpLink = createHttpLink({
  uri: "/api/faust/graphql",
});

// 2. Dodajemo Authorization header iz localStorage ili cookie-ja
const authLink = setContext((_, { headers }) => {
  // Probaj prvo iz localStorage, pa iz cookieja
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("wp_jwt") || ""; // ili "wp_jwt"
    // Ako koristiš cookie-je:
    // const cookies = document.cookie.split(';').map(x => x.trim().split('='));
    // const wpJwt = cookies.find(([k]) => k === 'wp_jwt');
    // token = wpJwt ? wpJwt[1] : token;
  }
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
