import { FragmentType, useFragment } from "../__generated__";
import {
  NC_IMAGE_MEDIA_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT,
  NC_USER_SHORT_FOR_POST_CARD_FRAGMENT,
  POST_CARD_FIELDS, // Dodajemo novi fragment
} from "../fragments";
import { NcmazFcImageFieldsFragment } from "@/__generated__/graphql";

export function getUserDataFromPostCardFragment(
  post:
    | FragmentType<typeof POST_CARD_FIELDS> // Koristimo POST_CARD_FIELDS za podatke
    | FragmentType<typeof NC_USER_SHORT_FOR_POST_CARD_FRAGMENT>
) {
  // Koristimo POST_CARD_FIELDS za podatke autora, uključujući verified3
  let postQuery = useFragment(
    POST_CARD_FIELDS,
    post as FragmentType<typeof POST_CARD_FIELDS>
  );

  let featuredImageMeta: NcmazFcImageFieldsFragment | undefined | null = null;
  featuredImageMeta = useFragment(
    NC_IMAGE_MEDIA_FRAGMENT,
    postQuery.featuredImage?.node
  );

  return {
    ...postQuery.author.node, // Vraćamo podatke autora
    verified3: postQuery.author.node.verified3 || false, // Dodajemo verified3
    uri: postQuery.author.node.uri || "",
    name: postQuery.author.node.name || "",
    avatar: postQuery.author.node.avatar?.url || "",
    featuredImageMeta,
  };
}
