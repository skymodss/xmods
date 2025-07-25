'use client'
import { FC, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/stores/store'
import { updateLocalPostsSavedList } from '@/stores/localPostSavedList/localPostsSavedListSlice'
import { useMutation } from '@apollo/client'
import { NC_MUTATION_UPDATE_USER_REACTION_POST_COUNT } from '@/fragments/mutations'
import {
	NcmazFcUserReactionPostActionEnum,
	NcmazFcUserReactionPostNumberUpdateEnum,
	NcmazFcUserReactionPostUpdateResuiltEnum,
} from '@/__generated__/graphql'
import { updateViewerAllReactionPosts } from '@/stores/viewer/viewerSlice'
import toast from 'react-hot-toast'
import { Bookmark02Icon, MyBookmarkIcon } from '../Icons/Icons'

export interface NcBookmarkProps {
	containerClassName?: string
	postDatabseId: number
}

const NcBookmark3: FC<NcBookmarkProps> = ({
	containerClassName = 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
	postDatabseId,
}) => {
	const [handleUpdateReactionCount, { loading, error, data }] = useMutation(
		NC_MUTATION_UPDATE_USER_REACTION_POST_COUNT,
	)
	//
	const { viewer, viewerReactionPosts, authorizedUser } = useSelector(
		(state: RootState) => state.viewer,
	)
	const localSavedPostsList = useSelector(
		(state: RootState) => state.localPostsSavedList.localSavedPosts,
	)
	const dispatch = useDispatch()

	const { isReady, isAuthenticated } = authorizedUser

	// handle dispatch update viewer reaction posts
	const handleDispatchUpdateViewerReactionPosts = (
		postDatabseId: number,
		type?: NcmazFcUserReactionPostUpdateResuiltEnum | null,
		number?: NcmazFcUserReactionPostNumberUpdateEnum | null,
	) => {
		let newViewerReactionPosts = viewerReactionPosts

		// neu type === Added -> them vao list binh thuong
		if (type === NcmazFcUserReactionPostUpdateResuiltEnum.Added) {
			newViewerReactionPosts = [
				...(viewerReactionPosts || []),
				{
					title: `${postDatabseId},SAVE`,
					id: String(new Date()),
				},
			]
		}
		if (type === NcmazFcUserReactionPostUpdateResuiltEnum.Removed) {
			// neu type === Remove -> xoa khoi list binh thuong
			newViewerReactionPosts = (viewerReactionPosts || []).filter(
				(post) => !(post.title?.trim() == `${postDatabseId},SAVE`),
			)
		}
		if (type === NcmazFcUserReactionPostUpdateResuiltEnum.Error) {
			// neu type === Error -> kiem tra xem hanh dong nay la dang remove hay add,
			// vi la Error nen se phai thuc hien nguoc lai voi hanh dong truoc do, vi truoc do da thuc hien dispatch tam 1 lan len redux roi
			// neu la remove -> them lai vao list.
			if (number === NcmazFcUserReactionPostNumberUpdateEnum.Remove_1) {
				newViewerReactionPosts = [
					...(viewerReactionPosts || []),
					{
						title: `${postDatabseId},SAVE`,
						id: String(new Date()),
					},
				]
			}
			// Neu la add -> xoa khoi list
			if (number === NcmazFcUserReactionPostNumberUpdateEnum.Add_1) {
				newViewerReactionPosts = (viewerReactionPosts || []).filter(
					(post) => !(post.title?.trim() == `${postDatabseId},SAVE`),
				)
			}
		}

		dispatch(updateViewerAllReactionPosts(newViewerReactionPosts))
	}
	//

	useEffect(() => {
		if (loading || !isReady) {
			return
		}

		if (
			error ||
			data?.ncmazFaustUpdateUserReactionPostCount?.result ===
				NcmazFcUserReactionPostUpdateResuiltEnum.Error
		) {
			console.log('___NcBookmark___error', { error, data })
			toast.error('An error occurred, please try again later.')
			// dispatch update viewer reaction posts -> when update have error
			handleDispatchUpdateViewerReactionPosts(
				postDatabseId,
				NcmazFcUserReactionPostUpdateResuiltEnum.Error,
				data?.ncmazFaustUpdateUserReactionPostCount?.number,
			)
			return
		}
	}, [data, error, loading, isReady])

	// check is bookmarked
	const isBookmarked = useMemo(() => {
		if (!viewer?.databaseId || !viewerReactionPosts?.length) {
			return localSavedPostsList.includes(postDatabseId)
		}

		// for user logged in
		return viewerReactionPosts.some(
			(post) => post.title?.trim() == `${postDatabseId},SAVE`,
		)
	}, [viewer, viewerReactionPosts, localSavedPostsList])

	const handleClickSaveAction = () => {
		if (!isReady) {
			toast.error('Please wait a moment, data is being prepared.')
			return
		}

		if (isAuthenticated === false) {
			// if user not logged in => update local saved list
			dispatch(updateLocalPostsSavedList(postDatabseId))
			return
		}

		if (!viewer?.databaseId) {
			toast.error('Please wait a moment, data is being prepared.')
			return
		}

		// unSaved list for user logged in
		// if (isBookmarked) {
		//   dispatch(addViewerUnSavedPostsList(postDatabseId));
		// }

		// dispatch pre update viewer reaction posts -> when prepare update to server. Will have a update again when have result from server
		handleDispatchUpdateViewerReactionPosts(
			postDatabseId,
			isBookmarked
				? NcmazFcUserReactionPostUpdateResuiltEnum.Removed
				: NcmazFcUserReactionPostUpdateResuiltEnum.Added,
		)

		// update server
		handleUpdateReactionCount({
			variables: {
				post_id: postDatabseId,
				user_id: viewer.databaseId,
				reaction: NcmazFcUserReactionPostActionEnum.Save,
				number: isBookmarked
					? NcmazFcUserReactionPostNumberUpdateEnum.Remove_1
					: NcmazFcUserReactionPostNumberUpdateEnum.Add_1,
			},
		})
	}

	return (
		<button
			className={`nc-NcBookmark relative flex items-center justify-center ${containerClassName}`}
			title={isBookmarked ? 'Remove from saved list' : 'Save to reading list'}
			onClick={handleClickSaveAction}
		>
			<span className="flex items-center gap-2">
				<MyBookmarkIcon
					fill={isBookmarked ? 'currentColor' : 'none'}
					className="z-[1] h-[18px] w-[18px]"
				/>
				{isBookmarked ? 'Saved' : 'Save'}
			</span>
			<span className={`absolute  ${
					isBookmarked ? 'bg-neutral-100 dark:bg-neutral-800' : ''
				}`}>
			</span>
		</button>
	)
}

export default NcBookmark3
