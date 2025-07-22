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
import useSWR from 'swr'

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

	// --- POČETAK ISPRAVKE ---

	// Pomoćna funkcija je sada robusnija i prihvata string, null, ili undefined
	const createReactionPosts = (ids: string | null | undefined, type: 'LIKE' | 'SAVE' | 'VIEW') => {
		// Ako je `ids` prazan, null ili undefined, odmah vraćamo prazan niz.
		if (!ids) {
			return [];
		}
		return ids.split(',').filter(id => id).map(id => ({ id, title: `${id},${type}` }));
	}

	// --- KRAJ ISPRAVKE ---

	const { data: userMetaData, error } = useSWR<CMSUserMetaResponseData>(
		viewer?.userId ? `/api/cms-user-meta/${viewer.userId}` : null,
		fetcher
	);

	useEffect(() => {
		if (!userMetaData || !viewer) {
			return
		}

		dispatch(updateViewerToStore(viewer))

		const user = userMetaData?.data?.user
		if (user) {
			dispatch(updateViewerToStore(user))

			if (user?.userReactionFields) {
				// Sada je bezbedno proslediti vrednosti direktno, jer naša funkcija zna šta da radi sa njima
				const { likedPosts, savedPosts, viewedPosts } = user.userReactionFields;
				
				const likesPosts = createReactionPosts(likedPosts, 'LIKE');
				const savesPosts = createReactionPosts(savedPosts, 'SAVE');
				const viewsPosts = createReactionPosts(viewedPosts, 'VIEW');

				const reactionPosts = [...likesPosts, ...savesPosts, ...viewsPosts]
				if (reactionPosts.length > 0) {
					dispatch(addViewerReactionPosts(reactionPosts))
				}
			}
		}
	}, [userMetaData, viewer, dispatch])

	if (error) {
		console.error("SWR Fetch Error:", error);
	}

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
