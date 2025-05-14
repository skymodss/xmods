import React, { FC } from "react";
import { PostDataFragmentType } from "@/data/types";
import Card9 from "@/components/Card9/Card9"; // Importamo Card9 komponentu

export interface SingleRelatedPostsProps {
  postDatabaseId: number;
  posts: PostDataFragmentType[] | null;
}

const SingleRelatedPosts2: FC<SingleRelatedPostsProps> = ({
  postDatabaseId,
  posts,
}) => {
  if (!posts?.length) {
    return null;
  }

  return (
    <div className="w-full space-y-4 border bg-card text-card-foreground bg-[rgb(255,255,255)] rounded-2xl pl-[14px] pr-[14px] pt-[14px] pb-[14px]">
      {posts.map((post, index) => (
        <div key={post.databaseId || index} className="mb-4 last:mb-0">
          <Card9 
            post={post}
            ratio="aspect-w-4 aspect-h-3"
            className="max-h-[200px] h-auto" // Za minimalnu i fiksnu visinu
          />
        </div>
      ))}
    </div>
  );
};

export default SingleRelatedPosts2;
