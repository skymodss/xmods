'use client'

import { FC } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import Link from 'next/link'
import { NcmazFcUserFullFieldsFragment } from '@/__generated__/graphql'
import ncFormatDate from '@/utils/formatDate'
import { FragmentType, useFragment } from '@/__generated__'
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments'
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment'
import { getTwitterLinkStatus } from '@/container/AuthorPageLayout'  
import VerifyIcon from '@/components/VerifyIcon'
import SocialsList, { TSocialsItem } from '@/components/SocialsList/SocialsList'
import { useRouter } from 'next/router'



export interface PostCardMetaProps {
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
	user: FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>

}

const PostCardMeta: FC<PostCardMetaProps> = ({
	className = 'leading-none text-xs',
	meta,
	hiddenAvatar = false,
	avatarSize = 'h-7 w-7 text-sm',
	user,
}) => {
	const { date } = meta

	const { databaseId, description, name, ncUserMeta } = useFragment(
		NC_USER_FULL_FIELDS_FRAGMENT,
		user || {},
	)

	const author = getUserDataFromUserCardFragment(
		meta.author as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>,
	)

	if (!author.databaseId && !date) {
		return null
	}

	// Get Twitter link status
	const twitterLinkStatus = getTwitterLinkStatus(author?.twitterUrl || '')

	const router = useRouter()
	const authorSlug = router.query.slug as string

	let userSocials: TSocialsItem[] = [
		{
			name: 'Twitter',
			href: ncUserMeta?.twitterUrl || '',
			icon: (
				<svg
					fill="currentColor"
					className="h-5 w-5"
					height="1em"
					viewBox="0 0 512 512"
				>
					<path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
				</svg>
			),
		},
	
	]

	userSocials = userSocials.filter((item) => !!item.href)

	return (
		<div
			className={`nc-PostCardMeta inline-flex flex-wrap items-center text-neutral-800 dark:text-neutral-200 ${className}`}
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
					<SocialsList socials={userSocials} />
					{twitterLinkStatus === 1 ? (
						<VerifyIcon />
					) : (
						<p></p>
					)}
				</Link>
			)}
			{author?.databaseId && (
				<span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">
					·
				</span>
			)}
			<span className="font-normal text-neutral-500 dark:text-neutral-400">
				{ncFormatDate(date || '')}
			</span>
		</div>
	)
}

export default PostCardMeta
