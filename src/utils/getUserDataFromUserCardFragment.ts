import { FragmentType, useFragment } from "../__generated__";
import {
  NC_IMAGE_MEDIA_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT,
  NC_USER_SHORT_FOR_POST_CARD_FRAGMENT,
} from "../fragments";
import { NcmazFcImageFieldsFragment } from "@/__generated__/graphql";
import { POST_CARD_FIELDS } from "@/fragments/posts";

export function getUserDataFromUserCardFragment(
  user:
    | FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
    | FragmentType<typeof NC_USER_SHORT_FOR_POST_CARD_FRAGMENT>
) {
  // Koristimo NC_USER_FULL_FIELDS_FRAGMENT za sve osnovne podatke
  let query = useFragment(
    NC_USER_FULL_FIELDS_FRAGMENT,
    user as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
  );

  // Koristimo POST_CARD_FIELDS samo za verified3
  let verified3Query = useFragment(
    POST_CARD_FIELDS,
    user as FragmentType<typeof POST_CARD_FIELDS>
  );

  let featuredImageMeta: NcmazFcImageFieldsFragment | undefined | null = null;
  featuredImageMeta = useFragment(
    NC_IMAGE_MEDIA_FRAGMENT,
    query.ncUserMeta?.featuredImage?.node
  );
  let bgImageMeta: NcmazFcImageFieldsFragment | undefined | null = null;
  bgImageMeta = useFragment(
    NC_IMAGE_MEDIA_FRAGMENT,
    query.ncUserMeta?.backgroundImage?.node
  );

  return {
    ...query,
    verified3: verified3Query.author?.node?.verified3 || false, // Isključivo koristimo POST_CARD_FIELDS za verified3
    uri: query.uri || "",
    name: query.name || "",
    username: query.username || "",
    featuredImageMeta,
    bgImageMeta,
  };
}
