import { FC } from 'react'
import Avatar from '@/components/Avatar/Avatar'
import Link from 'next/link'
import { NcmazFcUserFullFieldsFragment } from '@/__generated__/graphql'
import ncFormatDate from '@/utils/formatDate'
import { FragmentType } from '@/__generated__'
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments'
import { getUserDataFromUserCardFragment } from '@/utils/getUserDataFromUserCardFragment'
import VerifyIcon from '@/components/VerifyIcon'

export interface verifymemProps {
	className?: string
}

export const result45 = (author?.username || '').toLowerCase() === 'jovica33' ? 1 : 0 ;

const verifymem: FC<verifymemProps> = ({}) => {

	return ()
}

export default verifymem
