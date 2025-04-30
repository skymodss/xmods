import React, { FC } from "react";
import { PostDataFragmentType } from "@/data/types";
import Card9 from "@/components/Card9/Card9"; // Importamo Card9 komponentu
import { SectionMagazine1Props } from './SectionMagazine1'

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
    <div className={`nc-SectionMagazine9 relative ${className}`}>
			<div
				className={`w-full space-y-4 ${gapClassName}`}
			>
				{posts.map((post, index) => (
        <div key={post.databaseId || index} className="mb-4 last:mb-0">
          <Card9 
            ratio="aspect-w-4 aspect-h-3"
            post={post}
          />
        </div>
      ))}
			</div>
		</div>
  );
};

export default SingleRelatedPosts2;
