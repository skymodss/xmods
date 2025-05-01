import { FragmentType, useFragment } from "../__generated__";
import {
  NC_IMAGE_MEDIA_FRAGMENT,
  NC_USER_FULL_FIELDS_FRAGMENT33,
  NC_USER_SHORT_FOR_POST_CARD_FRAGMENT,
} from "../fragments";
import { NcmazFcImageFieldsFragment } from "@/__generated__/graphql";

export function getUserDataFromUserCardFragment(
  user:
    | FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT33>
    | FragmentType<typeof NC_USER_SHORT_FOR_POST_CARD_FRAGMENT>
) {
  let query = useFragment(
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
    uri: query.uri || "",
    name: query.name || "",
    username: query.username || "",
    featuredImageMeta,
    bgImageMeta,
    verified: query.verified?.verified || false,
  };
}
