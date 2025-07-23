'use client'

import { useAuth } from '@/context/AuthContext'
import { Viewer, getViewer } from '@/lib/viewer'
import { updateAuthorizedUser, updateViewer } from '@/stores/viewer/viewerSlice'
import { useQuery } from '@apollo/client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Footer from './Footer'
import Nav from './Nav'

export default function SiteWrapperProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const dispatch = useDispatch()
	const { data, loading } = useQuery(getViewer)
	const viewer = data?.viewer as Viewer | null | undefined
	const { isLoggedIn } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	const [isReady, setIsReady] = useState(false)

	useEffect(() => {
		if (loading) {
			return
		}
		if (viewer) {
			dispatch(updateViewer(viewer))
		}
		dispatch(
			updateAuthorizedUser({
				isAuthenticated: !!viewer?.databaseId,
				isReady: true,
			}),
		)

		setIsReady(true)
	}, [viewer, dispatch, loading])

	// =================================================================
	// POČETAK ISPRAVKE
	// =================================================================
	// Uklanjamo duplu `Nav` komponentu i renderujemo je samo jednom,
	// ali sa ispravnim `viewer` podatkom koji će unutar nje odlučiti
	// da li da prikaže "Login" ili "Logout" dugme.
	return (
		<div className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
			<Nav viewer={viewer} loading={loading} />

			<div
				className={`pt-16 sm:pt-20 ${
					pathname === '/' ? 'min-h-screen' : 'min-h-[70vh]'
				}`}
			>
				{children}
			</div>

			<Footer />
		</div>
	)
	// =================================================================
	// KRAJ ISPRAVKE
	// =================================================================
}
