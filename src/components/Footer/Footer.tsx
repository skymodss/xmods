import { FragmentType } from '@/__generated__'
import { NC_FOOTER_MENU_QUERY_FRAGMENT } from '@/fragments/menu'
import WidgetAddSubscriberForm from '../WidgetAddSubscriberForm/WidgetAddSubscriberForm'
import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import MyImage from '../MyImage'
import { flatListToHierarchical } from '@faustwp/core'
import { NcFooterMenuFieldsFragmentFragment } from '@/__generated__/graphql'
import Link from 'next/link'

interface Props {
	menuItems: FragmentType<typeof NC_FOOTER_MENU_QUERY_FRAGMENT>[] | null
}

export type FooterNavItemType = NcFooterMenuFieldsFragmentFragment & {
	children?: FooterNavItemType[]
}

export default function Footer({ menuItems }: Props) {
	const menus = flatListToHierarchical(menuItems || [], {
		idKey: 'id',
		parentKey: 'parentId',
		childrenKey: 'children',
	}) as FooterNavItemType[]

	const renderMenuItem = (item: FooterNavItemType, index: number) => {
		return (
			<div key={index + item.id}>
				<h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-200">
					<Link href={item.uri ?? '/'} target={item.target ?? '_self'}>
						{item.label}
					</Link>
				</h3>
				<ul role="list" className="mt-6 space-y-4">
					{item.children?.map((j, id) => (
						<li key={j.id + id}>
							<Link
								href={j.uri ?? ''}
								className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
							>
								{j.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
		)
	}

	return (
		<footer
			className="border-t border-neutral-200/70 bg-white/85 backdrop-blur-2xl dark:bg-neutral-900/85 dark:border-neutral-600"
			aria-labelledby="footer-heading"
		>
			<h2 id="footer-heading" className="sr-only">
				Footer
			</h2>
			<div className="mx-auto max-w-7xl px-6 pb-8">
				<div className="xl:grid xl:grid-cols-3 xl:gap-8">
					<div className="grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2">
						{menus.map(renderMenuItem)}
					</div>
				</div>
				<div className="mt-1 border-gray-900/10 pt-8 sm:mt-1 md:flex md:items-center md:justify-between lg:mt-1 dark:border-neutral-700">
					<div className="flex flex-wrap gap-x-6 gap-y-3 md:order-2">
						{NC_SITE_SETTINGS.site_socials?.map((item) => (
							<a
								key={item?.name}
								href={item?.url}
								className="relative block"
								target="_blank"
								rel="noreferrer"
							>
								<span className="absolute -inset-0.5 hidden rounded-lg bg-neutral-400 dark:block"></span>
								<span className="sr-only">{item?.name}</span>
								<MyImage
									width={22}
									height={22}
									className="relative max-h-[22px] opacity-60 hover:opacity-100"
									src={item?.icon || ''}
									alt={item?.name || ''}
								/>
							</a>
						))}
					</div>
					<p
						className="rights_reserved_text mt-8 text-[13px] leading-5 text-neutral-500 md:order-1 md:mt-0"
						dangerouslySetInnerHTML={{
							__html:
								NC_SITE_SETTINGS.site_footer?.all_rights_reserved_text || '',
						}}
					></p>
				</div>
			</div>
		</footer>
	)
}
