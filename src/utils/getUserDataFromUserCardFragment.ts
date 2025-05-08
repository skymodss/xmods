import { FragmentType, useFragment } from "../__generated__";
import {
  NC_IMAGE_MEDIA_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT3, // Import the updated fragment for verified3
  NC_USER_SHORT_FOR_POST_CARD_FRAGMENT,
} from "../fragments";
import { NcmazFcImageFieldsFragment } from "@/__generated__/graphql";

export function getUserDataFromUserCardFragment(
  user:
    | FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
    | FragmentType<typeof NC_USER_SHORT_FOR_POST_CARD_FRAGMENT>
) {
  // Use NC_USER_FULL_FIELDS_FRAGMENT for the main query
  let query = useFragment(
    NC_USER_FULL_FIELDS_FRAGMENT,
    user as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
  );

  // Use NC_USER_FULL_FIELDS_FRAGMENT3 only to fetch verified3
  let verified3Query = useFragment(
    NC_USER_FULL_FIELDS_FRAGMENT3,
    user as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT3>
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
    verified3: verified3Query.verified3 || false, // Fetch only verified3 from NC_USER_FULL_FIELDS_FRAGMENT3
    uri: query.uri || "",
    name: query.name || "",
    username: query.username || "",
    featuredImageMeta,
    bgImageMeta,
  };
}
