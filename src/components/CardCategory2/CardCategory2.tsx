import { FC } from 'react'
import NcImage from '@/components/NcImage/NcImage'
import { TwMainColor } from '@/data/types'
import Badge from '@/components/Badge/Badge'
import Link from 'next/link'
import { CommonTermCardProps } from '../CardCategory1/CardCategory1'
import { getCatgoryDataFromCategoryFragment } from '@/utils/getCatgoryDataFromCategoryFragment'

export interface CardCategory2Props extends CommonTermCardProps {
	index?: string
}

const CardCategory2: FC<CardCategory2Props> = ({
	className = '',
	term,
	index,
}) => {
	const { count, databaseId, name, uri, featuredImageMeta, colorMeta } =
		getCatgoryDataFromCategoryFragment(term)
	return (
		<Link
			href={uri}
			className={`nc-CardCategory2 relative flex flex-col items-center justify-center rounded-3xl border border-neutral-100 bg-neutral-300 px-3 py-5 text-center transition-colors sm:p-6 dark:border-black/20 dark:bg-neutral-600 ${className}`}
		>
			{index && (
				<Badge
					color={(colorMeta?.[0] as TwMainColor) || undefined}
					name={index}
					className="absolute -top-2 left-3 sm:top-3"
				/>
			)}
			<NcImage
				containerClassName={`relative flex-shrink-0 w-20 h-20 rounded-2xl shadow-lg overflow-hidden z-0`}
				src={featuredImageMeta?.sourceUrl || ''}
				fill
				sizes="80px"
				alt={name}
				className="object-cover"
			/>
			<div className="mt-3">
				<h2 className={`text-base font-semibold`}>{name}</h2>
				<span
					className={`mt-1 block text-sm text-neutral-500 dark:text-neutral-400`}
				>
					{count} Mods
				</span>
			</div>
		</Link>
	)
}

export default CardCategory2
