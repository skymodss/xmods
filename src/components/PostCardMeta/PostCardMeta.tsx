import { FC } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import Link from 'next/link'
import { NcmazFcUserFullFieldsFragment } from '@/__generated__/graphql'
import ncFormatDate from '@/utils/formatDate'
import { FragmentType } from '@/__generated__'
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments'
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment'
import { gql } from '@/__generated__'
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
}

const PostCardMeta: FC<PostCardMetaProps> = ({
	className = 'leading-none text-xs',
	meta,
	hiddenAvatar = false,
	avatarSize = 'h-7 w-7 text-sm',
}) => {
	// Ekstrakcija podataka iz meta objekta
	const { date } = meta

	const { ncUserMeta } = useFragment(
		NC_USER_FULL_FIELDS_FRAGMENT,
		author || {},
	)

	// Dohvaćanje podataka autora iz fragmenta
	const author = getUserDataFromUserCardFragment(
		meta.author as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>,
	)

	const twitterUrl3 = author?.ncUserMeta?.twitterUrl || "";

	// Povratak null ako nema autora i datuma
	if (!author.databaseId && !date) {
		return null
	}

	const router = useRouter()
	const authorSlug = router.query.slug as string

	return (
		<div
			className={`nc-PostCardMeta inline-flex flex-wrap items-center text-neutral-800 dark:text-neutral-200 ${className}`}
		>
			{/* Provjera i prikaz autora */}
			{author?.databaseId && (
				<Link
					href={twitterUrl3}
					className="relative flex items-center space-x-2 rtl:space-x-reverse"
				>
					{/* Prikaz avatara ako nije sakriven */}
					{!hiddenAvatar && (
						<Avatar
							radius="rounded-full"
							sizeClass={avatarSize}
							imgUrl={author.featuredImageMeta?.sourceUrl || ''}
							userName={author?.name || ''}
						/>
					)}
					{/* Prikaz imena autora i statusa verificiranosti */}
					<span className="block font-medium capitalize text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
						{author?.name || ''}
						{/* Provjera i prikaz statusa (verificiran/nije verificiran) */}
						<span className="text-xs text-gray-500">
							{author?.ncUserMeta?.twitterUrl ? 'verificiran' : 'nije verificiran'} 
						</span>
					</span>
				</Link>
			)}
			<>
				{/* Separator između autora i datuma */}
				{author?.databaseId && (
					<span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">
						·
					</span>
				)}
				{/* Prikaz datuma */}
				<span className="font-normal text-neutral-500 dark:text-neutral-400">
					{ncFormatDate(date || '')}
				</span>
			</>
		</div>
	)
}

export default PostCardMeta
