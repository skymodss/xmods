import React, { FC } from 'react';
import Head from 'next/head';
import Tag from '@/components/Tag/Tag';
import NcImage from '@/components/NcImage/NcImage';
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment';
import SingleHeader from '../SingleHeader';
import { FragmentTypePostFullFields } from '@/container/type';
import PostCardMeta from '@/components/PostCardMeta/PostCardMeta';
import useGetPostsNcmazMetaByIds from "@/hooks/useGetPostsNcmazMetaByIds";
import { gql, useQuery } from '@apollo/client';
import { TPostCard } from '@/components/Card2/Card2';
import SingleRelatedPosts from '@/container/singles/SingleRelatedPosts';


export const GET_RELATED_POSTS = gql`
  query GetRelatedPosts4($databaseId: Int!) {
    posts(where: { isRelatedOfPostId: $databaseId }, first: 6) {
      nodes {
        databaseId
        title
        uri
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
	categories {
		nodes {
  			__typename
			name
			uri
			count
			databaseId
			ncTaxonomyMeta {
				color
			}
		}
	}
        author {
          node {
            name
            uri
            avatar {
              url
            }
          }
        }
      }
    }
  }
`;
