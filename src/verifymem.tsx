import { FC } from 'react';
import Avatar from '@/components/Avatar/Avatar';
import Link from 'next/link';
import { NcmazFcUserFullFieldsFragment } from '@/__generated__/graphql';
import ncFormatDate from '@/utils/formatDate';
import { FragmentType } from '@/__generated__';
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments';
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment';
import VerifyIcon from '@/components/VerifyIcon';

export interface VerifymemProps {
	className?: string;
	meta: {
		date?: string;
		author?:
			| FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
			| NcmazFcUserFullFieldsFragment;
	};
	hiddenAvatar?: boolean;
	avatarSize?: string;
	twitterUrl?: string;
}

const Verifymem: FC<VerifymemProps> = ({
	className = 'leading-none text-xs',
	meta,
	hiddenAvatar = false,
	avatarSize = 'h-7 w-7 text-sm',
}) => {
	const { date } = meta;

	const author = getUserDataFromUserCardFragment(
		meta.author as FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>,
	);

	const result45 = (author?.username || '').toLowerCase() === 'jovica33' ? 1 : 0;

	// Render JSX (ako treba)
	return (
		<div className={className}>
			{!hiddenAvatar && author?.avatarUrl && (
				<Avatar src={author.avatarUrl} size={avatarSize} />
			)}
			{date && <p>{ncFormatDate(date)}</p>}
			<p>Result45: {result45}</p>
		</div>
	);
};

// Ako želite da izvezete `result45` nezavisno:
export const calculateResult45 = (
	authorUsername: string | undefined | null
): number => {
	return (authorUsername || '').toLowerCase() === 'jovica33' ? 1 : 0;
};

// Default export je komponenta
export default Verifymem;
