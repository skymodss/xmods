import { MyQueryGetCmsUserQuery } from "@/__generated__/graphql";
import { GET_USER_META_BY_ID } from "@/fragments/queries";
import { getApolloClient } from "@faustwp/core";
import type { NextApiRequest, NextApiResponse } from "next";

export type CMSUserMetaResponseData = {
  data?: MyQueryGetCmsUserQuery | null;
  error?: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CMSUserMetaResponseData>
) {
  // 1. Uzmite JWT token iz Authorization headera
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "");
  }

  // 2. Proslijedite token u FaustWP Apollo klijent
  const client = getApolloClient({
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const id = req.query.id || null;

  if (!id || typeof id !== "string") {
    res.status(400).send({ error: "id is required and must be a number type" });
    return;
  }

  try {
    const { data, error, errors } = await client
      .query({
        query: GET_USER_META_BY_ID,
        variables: { id },
      });
    if (error || errors) {
      res.status(500).send({ error: "Failed to fetch data" });
      return;
    }
    res.status(200).send({ data });
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch data" });
  }
}
