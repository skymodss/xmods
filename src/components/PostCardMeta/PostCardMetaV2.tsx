import { FC } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import Link from 'next/link'
import { NcmazFcUserFullFieldsFragment, NcmazFcPostMetaFullFieldsFragment, NcPostMetaData } from '@/__generated__/graphql'
import { FragmentType } from '@/__generated__'
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments'
import ncFormatDate from '@/utils/formatDate'
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment'
import verifymem from '@/verifymem'
import VerifyIcon from '@/components/VerifyIcon'
import convertNumbThousand from '@/utils/convertNumbThousand'


export interface PostCardMetaV2Props {
	meta: {
		viewCount3?: number
		date?: string
		author?:
			| FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
			| NcmazFcUserFullFieldsFragment
		title?: string
		uri?: string
	}
	hiddenAvatar?: boolean
	className?: string
	titleClassName?: string
	avatarSize?: string
}

const PostCardMetaV2: FC<PostCardMetaV2Props> = ({
	meta,
	hiddenAvatar = false,
	className = 'leading-none text-xs',
	titleClassName = 'text-base',
	avatarSize = 'h-9 w-9 text-base',
}) => {
	const { date, title, uri, viewCount3 } = meta

	const author = getUserDataFromUserCardFragment(
		meta.author as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>,
	)

	const result = verifymem.includes((author?.name || '').toLowerCase()) ? 1 : 0 ;

	const pregledi = convertNumbThousand(viewCount3 ?? 0)

	if (!author?.databaseId && !date) {
		return null
	}

	return (
		<div
			className={`nc-PostCardMetaV2 inline-flex flex-wrap items-center text-neutral-800 dark:text-neutral-200 ${className}`}
		>
			<div className="relative flex space-x-2 rtl:space-x-reverse">
				{!hiddenAvatar && author?.name && (
					<div className="flex-shrink-0 pt-1">
						<Avatar
							radius="rounded-full"
							sizeClass={avatarSize}
							imgUrl={author.featuredImageMeta?.sourceUrl || ''}
							userName={author?.name || ''}
						/>
					</div>
				)}
				<div>
					<h2 className={`block font-semibold ${titleClassName}`}>
						<Link
							dangerouslySetInnerHTML={{ __html: title || '' }}
							className="line-clamp-2"
							href={uri || ''}
						></Link>
					</h2>

					<Link href={author?.uri || ''} className="mt-1 relative flex items-center">
						<span className="block font-medium capitalize text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
							{author?.name || ''}
						</span>
						{result === 1 && <VerifyIcon />}
						<span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">
							·
						</span>
						<span className="font-normal text-neutral-500 dark:text-neutral-400">
							{pregledi} views
						</span>
						<span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">
							·
						</span>
						<span className="font-normal text-neutral-500 dark:text-neutral-400">
							{ncFormatDate(date || ' ')}
						</span>
					</Link>
				</div>
			</div>
		</div>
	)
}


export default PostCardMetaV2
