import { GraphQLClient } from "graphql-request";
import { useLoginModal } from "./useLoginModal";

let client: GraphQLClient;

function getClient(token?: string) {
  if (!client || client.headers["Authorization"] !== `Bearer ${token}`) {
    client = new GraphQLClient(
      process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );
  }
  return client;
}

export function useGqlClient() {
  const { token } = useLoginModal();
  return getClient(token);
}
