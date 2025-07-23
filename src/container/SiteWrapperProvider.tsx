'use client'

import { useQuery } from '@apollo/client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

// =================================================================
// POČETAK ISPRAVKE: Apsolutno tačne putanje na osnovu strukture repozitorijuma
// =================================================================
// '@/' alias je ispravan jer pokazuje na 'src/' direktorijum.
import { useAuth } from '@/context/AuthContext'
import { Viewer, getViewer } from '@/lib/viewer' // Fajl je u src/lib/viewer.ts
import {
	updateAuthorizedUser,
	updateViewer,
} from '@/stores/viewer/viewerSlice'
import Footer from '@/container/Footer/Footer' // Ispravna putanja do Footer komponente
import Nav from '@/container/Nav/Nav' // Ispravna putanja do Nav komponente
// =================================================================
// KRAJ ISPRAVKE
// =================================================================

export default function SiteWrapperProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const dispatch = useDispatch()
	const { data, loading } = useQuery(getViewer)
	const viewer = data?.viewer as Viewer | null | undefined
	const pathname = usePathname()

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
	}, [viewer, dispatch, loading])

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
}
