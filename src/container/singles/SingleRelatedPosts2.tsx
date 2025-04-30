import React, { FC } from "react";
import { PostDataFragmentType } from "@/data/types";
import Card9 from "@/components/Card9/Card9"; // Importamo Card9 komponentu

export interface SingleRelatedPostsProps {
  postDatabaseId: number;
  posts: PostDataFragmentType[] | null;
}

const SingleRelatedPosts: FC<SingleRelatedPostsProps> = ({
  postDatabaseId,
  posts,
}) => {
  if (!posts?.length) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {posts.map((post, index) => (
        <div key={post.databaseId || index} className="mb-4 last:mb-0">
          <Card9 
            post={post}
            ratio="aspect-w-3 aspect-h-3"
            className="lg:max-w-[360px] lg:max-h-[190px]" // Za minimalnu i fiksnu visinu
          />
        </div>
      ))}
    </div>
  );
};

export default SingleRelatedPosts;
