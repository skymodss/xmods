import { gql } from '@/__generated__';

export const POST_CARD_FIELDS = gql(`
  fragment PostCardFieldsNOTNcmazMEDIA4 on Post {
    databaseId
    title
    uri
    date
    excerpt
    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    author {
      node {
        name
        uri
        verified3
        avatar {
          url
        }
      }
    }
  }
`);
