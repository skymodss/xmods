import { FragmentType, useFragment } from "../__generated__";
import {
  NC_IMAGE_MEDIA_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT,
  NC_USER_SHORT_FOR_POST_CARD_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT3, // Import the new fragment
} from "../fragments";
import { NcmazFcImageFieldsFragment } from "@/__generated__/graphql";

export function getUserDataFromUserCardFragment(
  user: NC_USER_FULL_FIELDS_FRAGMENT | NC_USER_SHORT_FOR_POST_CARD_FRAGMENT | NC_USER_FULL_FIELDS_FRAGMENT3 // Directly specify the fragments
) {
  let query = useFragment(NC_USER_FULL_FIELDS_FRAGMENT, user);

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

  // Extract the verified3 field if the user is of type NC_USER_FULL_FIELDS_FRAGMENT3
  const verified3 = (user as NC_USER_FULL_FIELDS_FRAGMENT3).verified3 || null;

  return {
    ...query,
    uri: query.uri || "",
    name: query.name || "",
    username: query.username || "",
    featuredImageMeta,
    bgImageMeta,
    verified3, // Add the verified3 field to the return object
  };
}
