import { GraphQLClient } from "graphql-request";
import { useLoginModal } from "./useLoginModal";

export function useGqlClient() {
  const { token } = useLoginModal();
  // proslijedi i opciju credentials ako backend koristi cookie‐auth
  return new GraphQLClient(
    process.env.NEXT_PUBLIC_GRAPHQL_URL as string,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    }
  );
}
