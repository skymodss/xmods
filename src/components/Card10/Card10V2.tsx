'use client'
import { FC, useState } from 'react'
import PostCardSaveAction from '@/components/PostCardSaveAction/PostCardSaveAction'
import CategoryBadgeList from '@/components/CategoryBadgeList/CategoryBadgeList'
import PostFeaturedMedia from '@/components/PostFeaturedMedia/PostFeaturedMedia'
import PostCardMetaV2 from '@/components/PostCardMeta/PostCardMetaV2'
import Link from 'next/link'
import { CommonPostCardProps } from '../Card2/Card2'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'
import convertNumbThousand from '@/utils/convertNumbThousand'
import MyImage from '../MyImage'

export interface Card10V2Props extends CommonPostCardProps {}

const Card10V2: FC<Card10V2Props> = ({ className = 'h-full', post }) => {
	const {
		title,
		link,
		date,
		categories,
		excerpt,
		author,
		postFormats,
		featuredImage,
		ncPostMetaData,
		commentCount,
		uri,
		databaseId,
	} = getPostDataFromPostFragment(post)

	const [isHover, setIsHover] = useState(false)

	const viewCount3 = ncPostMetaData?.viewsCount || 1

	return (
		<div
			className={`nc-Card10V2 relative flex flex-col ${className}`}
			onMouseEnter={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			<div className="group aspect-h-9 aspect-w-16 relative z-0 block w-full flex-shrink-0 rounded-3xl sm:aspect-h-9">
				<div>
					 <MyImage
            					alt=""
            					fill
            					className="h-full w-full object-cover rounded-3xl opacity-50 blur-3xl scale-100 rounded-3xl"
            					src={featuredImage?.sourceUrl || ''}
            					sizes="(max-width: 600px) 480px, 800px"
						aria-hidden
         				 />
					 <MyImage
            					alt=""
            					fill
            					className="object-cover duration-300 group-hover:scale-105 rounded-3xl border border-white/10 box-border"
            					src={featuredImage?.sourceUrl || ''}
            					sizes="(max-width: 600px) 480px, 800px"
         				 />
				</div>

				<Link
					href={uri || ''}
					className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 transition-opacity"
				></Link>
			</div>
			<div className="absolute inset-x-3 top-3 flex items-start justify-between space-x-4 rtl:space-x-reverse">
				<CategoryBadgeList categories={categories?.nodes || []} />
				<PostCardSaveAction
					postDatabseId={databaseId}
					readingTime={ncPostMetaData?.readingTime || 1}
					hidenReadingTime
				/>
			</div>

			<div className="mt-4 space-y-2.5 px-2 sm:px-4">
				<PostCardMetaV2 meta={{ author, date, title, uri, viewCount3 }} />
			</div>
		</div>
	)
}

export default Card10V2
