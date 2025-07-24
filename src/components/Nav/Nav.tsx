'use client'

import { Popover, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { Fragment, useState } from 'react'

import { useAuth } from '@/context/AuthContext'
import Button from '@/shared/Button/Button'
import Logo from '@/shared/Logo/Logo'

import { MainNav } from '../'
import { User } from '../SiteWrapperProvider' // Importujemo User tip
import User from './User'

// =================================================================
// POČETAK ISPRAVKE: Definišemo props koje komponenta prima
// =================================================================
export interface NavProps {
	viewer?: User | null
	loading?: boolean
}
// =================================================================
// KRAJ ISPRAVKE
// =================================================================

export default function Nav({ viewer, loading }: NavProps) {
	const { login } = useAuth()
	const [isLogin, setIsLogin] = useState(false)

	const handleLogin = () => {
		setIsLogin(true)
		login(process.env.NEXT_PUBLIC_FAUSTWP_CLIENT_SECRET as string)
	}

	return (
		<Popover
			as="header"
			className="nc-MainNav2 relative z-10 bg-white dark:bg-neutral-900"
		>
			<div className="container py-4 lg:py-5">
				<div className="flex items-center justify-between">
					<div className="flex-1 flex items-center">
						<Logo />

						<div className="hidden flex-1 items-center md:flex">
							<MainNav />
						</div>
					</div>

					<div className="hidden flex-shrink-0 items-center justify-end text-neutral-700 dark:text-neutral-100 md:flex">
						<div className="hidden items-center xl:flex">
							<Link
								href="/search"
								className="text-2xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
							>
								<MagnifyingGlassIcon className="h-6 w-6" />
							</Link>
							<div className="mx-2 h-6 border-l border-neutral-300 dark:border-neutral-700" />
						</div>

						{/* ================================================================= */}
						{/* POČETAK ISPRAVKE: Uslovno renderovanje na osnovu viewer-a */}
						{/* ================================================================= */}
						{!loading && (
							<>
								{viewer ? (
									<User viewer={viewer} />
								) : (
									<Button
										sizeClass="px-4 py-2 sm:px-5"
										onClick={handleLogin}
										loading={isLogin}
									>
										Login
									</Button>
								)}
							</>
						)}
						{/* ================================================================= */}
						{/* KRAJ ISPRAVKE */}
						{/* ================================================================= */}
					</div>

					<div className="flex flex-shrink-0 items-center justify-end text-neutral-700 dark:text-neutral-100 md:hidden">
						<Link
							href="/search"
							className="text-2xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
						>
							<MagnifyingGlassIcon className="h-6 w-6" />
						</Link>
						<div className="mx-2 h-6 border-l border-neutral-300 dark:border-neutral-700" />

						<Popover.Button
							as={UserCircleIcon}
							className="h-9 w-9 cursor-pointer"
						/>
					</div>
				</div>
			</div>

			<Transition
				as={Fragment}
				enter="duration-200 ease-out"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="duration-150 ease-in"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<Popover.Panel
					as="div"
					className="absolute inset-x-0 top-full bg-white text-sm text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200"
				>
					<MainNav />
				</Popover.Panel>
			</Transition>
		</Popover>
	)
}
