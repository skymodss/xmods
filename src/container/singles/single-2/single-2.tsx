import React, { FC } from "react";
import NcImage from "@/components/NcImage/NcImage";
import { getPostDataFromPostFragment } from "@/utils/getPostDataFromPostFragment";
import SingleHeader from "../SingleHeader";
import { SingleType1Props } from "../single/single";
import { GET_RELATED_POSTS } from '@/container/singles/single/related';
interface Props extends SingleType1Props {}
import SingleRelatedPosts2 from '@/container/singles/SingleRelatedPosts2';
import useGetPostsNcmazMetaByIds from "@/hooks/useGetPostsNcmazMetaByIds";
import { TPostCard } from '@/components/Card2/Card2';
import { gql } from '@/__generated__'

const GET_USER_VERIFICATION = gql(`
  fragment on User {
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

const Single2: React.FC = () => {
  const { data, loading, error } = useQuery(GET_USER_VERIFICATION);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Users and Verification Status</h2>
      <ul>
        {data?.users?.nodes?.map((user) =>
          user ? (
            <li key={user.id}>
              {user.name} - Verified:{" "}
              {user.ncUserMeta?.verified?.verified ? "Yes" : "No"}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default Single2;
