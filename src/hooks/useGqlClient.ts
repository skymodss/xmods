import { GraphQLClient } from "graphql-request";
import { useLoginModal } from "./useLoginModal";

let client: GraphQLClient;
let currentToken: string | undefined;

function getClient(token?: string) {
  // Recreate the client whenever the token changes
  if (!client || token !== currentToken) {
    client = new GraphQLClient(
      process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );
    currentToken = token;
  }
  return client;
}

export function useGqlClient() {
  const { token } = useLoginModal();
  return getClient(token);
}
