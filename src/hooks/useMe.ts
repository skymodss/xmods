import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { useGqlClient } from "./useGqlClient";

const GET_ME = gql`
  query viewer {
    me {
      id
      name
      email
    }
  }
`;

interface MeResponse {
  me: {
    id: string;
    name: string;
    email: string;
  };
}

export function useMe() {
  const client = useGqlClient();
  const [user, setUser] = useState<MeResponse["me"]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    client
      .request<MeResponse>(GET_ME)
      .then((data) => {
        setUser(data.me);
      })
      .catch((err) => {
        console.error("Failed to fetch current user:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client]);

  return { user, loading };
}
