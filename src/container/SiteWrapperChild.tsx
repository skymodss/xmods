import { useAuth } from '@faustwp/core'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
	updateViewer as updateViewerToStore,
	updateAuthorizedUser,
	addViewerReactionPosts,
} from '@/stores/viewer/viewerSlice'
import { updateGeneralSettings } from '@/stores/general-settings/generalSettingsSlice'
import ControlSettingsDemo from './ControlSettingsDemo'
import CookiestBoxPopover from '@/components/CookiestBoxPopover'
import MusicPlayer from '@/components/MusicPlayer/MusicPlayer'
import { initLocalPostsSavedListFromLocalstored } from '@/stores/localPostSavedList/localPostsSavedListSlice'
import { usePathname } from 'next/navigation'
import { CMSUserMetaResponseData } from '@/pages/api/cms-user-meta/[id]'
import useSWR from 'swr' // <-- 1. Uvozimo SWR

// Definišemo "fetcher" funkciju koju će SWR koristiti
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SiteWrapperChild({
	...props
}: {
	__TEMPLATE_QUERY_DATA__: any
}) {
	const { isAuthenticated, isReady, loginUrl, viewer } = useAuth()
	const dispatch = useDispatch()
	const pathname = usePathname()

	// --- POČETAK VELIKE ISPRAVKE ---

	// 2. Koristimo SWR hook da preuzmemo podatke
	// SWR će automatski keširati rezultat. Poziv će se desiti samo jednom!
	// Ako korisnik nije ulogovan (viewer?.userId je null), SWR neće ni pokušati da pošalje zahtev.
	const { data: userMetaData, error } = useSWR<CMSUserMetaResponseData>(
		viewer?.userId ? `/api/cms-user-meta/${viewer.userId}` : null,
		fetcher
	);

	// 3. Koristimo useEffect da reagujemo na promenu podataka iz SWR-a
	useEffect(() => {
		// Ako nema podataka ili viewer-a, ne radimo ništa
		if (!userMetaData || !viewer) {
			return
		}

		// Ažuriramo osnovne podatke o korisniku
		dispatch(updateViewerToStore(viewer))

		const user = userMetaData?.data?.user
		if (user) {
			// Ažuriramo dodatne meta podatke
			dispatch(updateViewerToStore(user))

			if (user?.userReactionFields) {
				const { likedPosts = '', savedPosts = '', viewedPosts = '' } = user.userReactionFields;
				
				const createReactionPosts = (ids: string, type: 'LIKE' | 'SAVE' | 'VIEW') => {
					return ids.split(',').filter(id => id).map(id => ({ id, title: `${id},${type}` }));
				}

				const likesPosts = createReactionPosts(likedPosts, 'LIKE');
				const savesPosts = createReactionPosts(savedPosts, 'SAVE');
				const viewsPosts = createReactionPosts(viewedPosts, 'VIEW');

				const reactionPosts = [...likesPosts, ...savesPosts, ...viewsPosts]
				if (reactionPosts.length > 0) {
					dispatch(addViewerReactionPosts(reactionPosts))
				}
			}
		}
	}, [userMetaData, viewer, dispatch]) // Ovaj hook zavisi samo od podataka

	if (error) {
		console.error("SWR Fetch Error:", error);
	}

	// --- KRAJ VELIKE ISPRAVKE ---

	// update general settings to store
	useEffect(() => {
		const generalSettings =
			props?.__TEMPLATE_QUERY_DATA__?.generalSettings ?? {}
		dispatch(updateGeneralSettings(generalSettings))
	}, [dispatch, props?.__TEMPLATE_QUERY_DATA__?.generalSettings])

	useEffect(() => {
		const initialStateLocalSavedPosts: number[] = JSON.parse(
			localStorage?.getItem('localSavedPosts') || '[]',
		)
		dispatch(
			initLocalPostsSavedListFromLocalstored(initialStateLocalSavedPosts),
		)
	}, [dispatch])

	// update updateAuthorizedUser to store
	useEffect(() => {
		dispatch(
			updateAuthorizedUser({
				isAuthenticated,
				isReady,
				loginUrl,
			}),
		)
	}, [isAuthenticated, isReady, loginUrl, dispatch])

	if (pathname?.startsWith('/ncmaz_for_ncmazfc_preview_blocks')) {
		return null
	}

	return (
		<div>
			<CookiestBoxPopover />
			<ControlSettingsDemo />
			<MusicPlayer />
		</div>
	)
}
