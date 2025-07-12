import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { useGqlClient } from "./useGqlClient";

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
    }
  }
`;

export function useMe() {
  const client = useGqlClient();
  const [user, setUser] = useState<{ id: string; name: string; email: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    client.request(GET_ME).then((data) => {
      setUser(data.me);
      setLoading(false);
    });
  }, [client]);

  return { user, loading };
}
