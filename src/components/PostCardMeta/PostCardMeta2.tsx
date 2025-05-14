import { FC } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import Link from 'next/link'
import { NcmazFcUserFullFieldsFragment } from '@/__generated__/graphql'
import { FragmentType } from '@/__generated__'
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments'
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment'
import VerifyIcon2 from '@/components/VerifyIcon2'
import verifymem from '@/verifymem'

export interface PostCardMeta2Props {
	className?: string
	meta: {
		date?: string
		author?:
			| FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
			| NcmazFcUserFullFieldsFragment
	}
	hiddenAvatar?: boolean
	avatarSize?: string
	twitterUrl?: string
}

const PostCardMeta2: FC<PostCardMeta2Props> = ({
	className = 'leading-none text-xs',
	meta = { date: '', author: undefined }, // Ensure default value for `meta`
	hiddenAvatar = false,
	avatarSize = 'h-7 w-7 text-sm',
}) => {
	const { date } = meta

	const author = meta.author
		? getUserDataFromUserCardFragment(
				meta.author as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>,
		  )
		: undefined // Ensure `author` is safely defined

	const result = verifymem.includes((author?.username || '').toLowerCase()) ? 1 : 0 ;

	if (!author?.databaseId && !date) {
		return null
	}

	return (
		<div
			className={`nc-PostCardMeta2 inline-flex flex-wrap items-center text-neutral-800 dark:text-neutral-200 ${className}`}
		>
			{author?.databaseId && (
				<Link
					href={author?.uri || ''}
					className="relative flex items-center space-x-2 rtl:space-x-reverse"
				>
					{!hiddenAvatar && (
						<Avatar
							radius="rounded-full"
							sizeClass={avatarSize}
							imgUrl={author.featuredImageMeta?.sourceUrl || ''}
							userName={author?.name || ''}
						/>
					)}
					<span className="block font-medium capitalize text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
						{author?.name || ''}
					</span>
					{result === 1 && <VerifyIcon2 />} {/* Fix empty conditional block */}
				</Link>
			)}
		</div>
	)
}

export default PostCardMeta2
