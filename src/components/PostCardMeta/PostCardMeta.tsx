import { FC } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import Link from 'next/link'
import { NcmazFcUserFullFieldsFragment, NcmazFcUserFullFields3Fragment } from '@/__generated__/graphql'
import ncFormatDate from '@/utils/formatDate'
import { FragmentType } from '@/__generated__'
import { NC_USER_FULL_FIELDS_FRAGMENT, NC_USER_FULL_FIELDS_FRAGMENT3 } from '@/fragments'
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment'
import { gql } from '@/__generated__'

// Definicija fragmenta za korisnika
export const POST_CARD_FIELDS = gql(`
  fragment NcmazFcUserFullFields3 on User {
    id
    databaseId
    uri
    username
    name
    description
    registeredDate
    verified3
    ncUserMeta {
      buymeacoffeUrl
      color
      facebookUrl
      githubUrl
      instagramUrl
      linkedinUrl
      mediumUrl
      ncBio
      pinterestUrl
      twitchUrl
      twitterUrl
      vimeoUrl
      websiteUrl
      youtubeUrl
      tiktokUrl
      featuredImage {
        node {
          ...NcmazFcImageFields
        }
      }
      backgroundImage {
        node {
          ...NcmazFcImageFields
        }
      }
    }
  }
`)

// Funkcija za dohvat verified3
// Funkcija za dohvat verified3
export function getVerified3FromUser(
	user: NcmazFcUserFullFields3Fragment | null | undefined
): boolean | null {
	// Provjera strukture user objekta
	console.log('getVerified3FromUser - user:', user);

	// Vraćanje verified3 statusa
	return user?.verified3 ?? null;
}

const PostCardMeta: FC<PostCardMetaProps> = ({
	className = 'leading-none text-xs',
	meta,
	hiddenAvatar = false,
	avatarSize = 'h-7 w-7 text-sm',
}) => {
	const { date } = meta;

	// Dohvati autora
	const author = getUserDataFromUserCardFragment(
		meta.author as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT3>,
	);

	// Log za autora
	console.log('PostCardMeta - author:', author);

	// Dohvati verified3 status
	const isVerified = getVerified3FromUser(author);

	// Ako nema autora ili datuma, vrati null
	if (!author?.databaseId && !date) {
		return null;
	}

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
							imgUrl={author?.ncUserMeta?.featuredImage?.node?.sourceUrl || ''}
							userName={author?.name || ''}
						/>
					)}
					<span className="block font-medium capitalize text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
						{author?.name || ''}
						<span className="text-xs text-gray-500">
							({isVerified ? 'verificiran' : 'nije verificiran'})
						</span>
					</span>
				</Link>
			)}
			<>
				{author?.databaseId && (
					<span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">
						·
					</span>
				)}
				<span className="font-normal text-neutral-500 dark:text-neutral-400">
					{ncFormatDate(date || '')}
				</span>
			</>
		</div>
	);
};

export default PostCardMeta
