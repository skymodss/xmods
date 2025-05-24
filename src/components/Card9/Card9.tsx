import { FC } from 'react'
import PostCardSaveAction from '@/components/PostCardSaveAction/PostCardSaveAction'
import PostCardLikeAndComment from '@/components/PostCardLikeAndComment/PostCardLikeAndComment'
import CategoryBadgeList from '@/components/CategoryBadgeList/CategoryBadgeList'
import PostTypeFeaturedIcon from '@/components/PostTypeFeaturedIcon/PostTypeFeaturedIcon'
import PostFeaturedMedia from '@/components/PostFeaturedMedia/PostFeaturedMedia'
import Link from 'next/link'
import { CommonPostCardProps } from '../Card2/Card2'
import { getPostDataFromPostFragment } from '@/utils/getPostDataFromPostFragment'
import MyImage from '../MyImage'
import ncFormatDate from '@/utils/formatDate'

export interface Card9Props extends CommonPostCardProps {
	ratio?: string
	hoverClass?: string
}

const Card9: FC<Card9Props> = ({
	className = 'h-full',
	ratio = 'aspect-w-3 aspect-h-3 sm:aspect-h-4',
	post,
	hoverClass = '',
}) => {
	const {
		title,
		link,
		date,
		categories,
		excerpt,
		author,
		postFormats: postType,
		featuredImage,
		ncPostMetaData,
		commentCount,
		uri,
		databaseId,
	} = getPostDataFromPostFragment(post)

	const renderMeta = () => {
		return (
			<div className="inline-flex items-center text-xs text-neutral-300">
				<div className="block">
					<h2 className="block text-base font-semibold text-white sm:text-lg">
						<span
							dangerouslySetInnerHTML={{ __html: title }}
							className="line-clamp-2"
							title={title || ''}
						></span>
					</h2>
					<Link href={author?.uri || ''} className="relative mt-2.5 flex">
						<span className="block truncate font-medium capitalize text-neutral-200 hover:text-white">
							{author?.name}
						</span>
						<span className="mx-[6px] font-medium">·</span>
						<span className="truncate font-normal">{ncFormatDate(date)}</span>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div
			className={`nc-Card9 group relative z-0 flex flex-col overflow-hidden rounded-2xl ${hoverClass} ${className}`}
		>
			<div className={`relative flex w-full items-start ${ratio}`}></div>
			{postType === 'audio' ? (
				<div className="absolute inset-0">
					<PostFeaturedMedia post={post} />
				</div>
			) : (
				<Link href={uri || ''}>
					<MyImage
						fill
						alt={title || ''}
						className="h-full w-full rounded-2xl object-cover dark:brightness-90 dark:filter duration-300 group-hover:scale-105"
						src={featuredImage?.sourceUrl || ''}
						sizes="(max-width: 600px) 480px, 500px"
						style={{
        						boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.5)', // Ovdje postavljaš unutrašnji border
    						}}
					/>
					<PostTypeFeaturedIcon
						className="absolute left-3 top-3 group-hover:hidden"
						postType={postType}
						wrapSize="w-7 h-7"
						iconSize="w-4 h-4"
					/>
					<span className="absolute inset-0 bg-black bg-opacity-10 opacity-0"></span>
				</Link>
			)}
			<Link
				href={uri || ''}
				className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black opacity-50"
			></Link>
			<div className="absolute inset-x-3 top-3 flex items-start justify-between space-x-4 rtl:space-x-reverse opacity-0 transition-all duration-300 group-hover:z-10 group-hover:opacity-100">
				<CategoryBadgeList categories={categories?.nodes || []} />
				<PostCardSaveAction
					postDatabseId={databaseId}
					readingTime={ncPostMetaData?.readingTime || 1}
					hidenReadingTime
				/>
			</div>
			<div className="absolute inset-x-0 bottom-0 flex flex-grow flex-col p-4">
				<Link href={uri || ''} className="absolute inset-0"></Link>
				{renderMeta()}
			</div>
		</div>
	)
}

export default Card9
