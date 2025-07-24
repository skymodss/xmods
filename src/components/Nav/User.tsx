import { Popover, Transition } from '@headlessui/react'
import {
	UserCircleIcon,
	Cog8ToothIcon,
	ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Fragment } from 'react'
import Avatar from '@/shared/Avatar/Avatar'
import { useAuth } from '@/context/AuthContext'
import { User } from '../SiteWrapperProvider' // Importujemo User tip

// =================================================================
// POČETAK ISPRAVKE: Definišemo props
// =================================================================
export interface UserProps {
	viewer: User
}
// =================================================================
// KRAJ ISPRAVKE
// =================================================================

export default function User({ viewer }: UserProps) {
	const { logout } = useAuth()
	const { name, avatar } = viewer || {}

	const solutions = [
		{
			name: 'Account',
			href: '/account',
			icon: UserCircleIcon,
		},
		{
			name: 'Settings',
			href: '/settings',
			icon: Cog8ToothIcon,
		},
	]

	return (
		<Popover className="relative">
			{({ open }) => (
				<>
					<Popover.Button as="div">
						<Avatar
							imgUrl={avatar?.url}
							userName={name}
							sizeClass="w-9 h-9"
							radius="rounded-full"
						/>
					</Popover.Button>
					<Transition
						as={Fragment}
						enter="transition ease-out duration-200"
						enterFrom="opacity-0 translate-y-1"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in duration-150"
						leaveFrom="opacity-100 translate-y-0"
						leaveTo="opacity-0 translate-y-1"
					>
						<Popover.Panel className="absolute -right-1 z-10 mt-2.5 w-64">
							<div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
								<div className="relative grid gap-8 bg-white p-7 dark:bg-neutral-800">
									<div className="flex items-center">
										<Avatar imgUrl={avatar?.url} userName={name} />
										<div className="ml-4">
											<p className="text-sm font-medium ">{name}</p>
											<Link
												href="/account"
												className="mt-0.5 text-xs text-neutral-500"
											>
												View profile
											</Link>
										</div>
									</div>

									<hr className="border-t border-neutral-200 dark:border-neutral-700" />

									{solutions.map((item, index) => (
										<Link
											key={index}
											href={item.href}
											className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
										>
											<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-neutral-500">
												<item.icon aria-hidden="true" className="h-6 w-6" />
											</div>
											<div className="ml-4">
												<p className="text-sm font-medium ">{item.name}</p>
											</div>
										</Link>
									))}

									<hr className="border-t border-neutral-200 dark:border-neutral-700" />

									<div
										className="-m-3 flex cursor-pointer items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:hover:bg-neutral-700"
										onClick={() => logout()}
									>
										<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-neutral-500">
											<ArrowRightOnRectangleIcon
												aria-hidden="true"
												className="h-6 w-6"
											/>
										</div>
										<div className="ml-4">
											<p className="text-sm font-medium ">Logout</p>
										</div>
									</div>
								</div>
							</div>
						</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	)
}
