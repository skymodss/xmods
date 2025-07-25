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
    <div className="w-full bg-neutral-300 space-y-4 text-card-foreground dark:bg-neutral-600 rounded-3xl pl-[14px] pr-[14px] pt-[14px] pb-[14px]">
      {posts.map((post, index) => (
        <div key={post.databaseId || index} className="mb-4 last:mb-0">
          <Card9 
            post={post}
            ratio="aspect-w-4 aspect-h-3"
            className="max-h-[180px] h-auto" // Za minimalnu i fiksnu visinu
          />
        </div>
      ))}
    </div>
  );
};

export default SingleRelatedPosts2;
