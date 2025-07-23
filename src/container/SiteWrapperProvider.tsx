'use client'

import { useQuery } from '@apollo/client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

// Korišćenje relativnih putanja da se izbegnu problemi sa build-om
import { useAuth } from '../context/AuthContext'
import { Viewer, getViewer } from '../lib/viewer'
import {
	updateAuthorizedUser,
	updateViewer,
} from '../stores/viewer/viewerSlice'
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
