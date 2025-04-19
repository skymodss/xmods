import React from "react";
import { gql } from "src/__generated__/gql";
import { useQuery } from "@apollo/client";

// Definiši query koristeći generisani gql helper
const GET_USER_VERIFICATION = gql(`
  query GetUserVerification {
    users {
      nodes {
        id
        name
        ncUserMeta {
          verified {
            fieldGroupName
            verified
          }
        }
      }
    }
  }
`);

const Single2 = () => {
  const { data, loading, error } = useQuery(GET_USER_VERIFICATION);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Users and Verification Status</h2>
      <ul>
        {data?.users?.nodes?.map((user) => (
          <li key={user?.id}>
            {user?.name} - Verified:{" "}
            {user?.ncUserMeta?.verified?.verified ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Single2;
