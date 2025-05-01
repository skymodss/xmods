'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import convertNumbThousand from '@/utils/convertNumbThousand'
import { useMutation } from '@apollo/client'
import { NC_MUTATION_UPDATE_USER_REACTION_POST_COUNT } from '@/fragments/mutations'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/stores/store'
import {
	NcmazFcUserReactionPostActionEnum,
	NcmazFcUserReactionPostNumberUpdateEnum,
	NcmazFcUserReactionPostUpdateResuiltEnum,
} from '@/__generated__/graphql'
import { updateViewerAllReactionPosts } from '@/stores/viewer/viewerSlice'
import { useLoginModal } from '@/hooks/useLoginModal'

import toast from 'react-hot-toast'
import { FavouriteIcon } from '../Icons/Icons'

export interface PostCardLikeActionProps {
	className?: string
	sizeClassName?: string
	likeCount: number
	postDatabseId: number
}

const PostCardLikeAction2: FC<PostCardLikeActionProps> = ({
	className = '',
	sizeClassName = '',
	likeCount: likeCountProp = 34,
	postDatabseId,
}) => {
	const [likeCountState, setLikeCountState] = useState(likeCountProp)
	const [showTooltip, setShowTooltip] = useState(false)
	const { openLoginModal } = useLoginModal()

	const [handleUpdateReactionCount, { loading, error, data }] =
		useMutation(NC_MUTATION_UPDATE_USER_REACTION_POST_COUNT)

	const { viewer, viewerReactionPosts, authorizedUser } = useSelector(
		(state: RootState) => state.viewer,
	)
	const likesCountOkFromStore = useSelector(
		(state: RootState) =>
			state.postsNcmazMetaDataOk[postDatabseId]?.ncPostMetaData?.likesCount,
	)
	const dispatch = useDispatch()

	const { isAuthenticated, isReady } = authorizedUser

	useEffect(() => {
		if (likesCountOkFromStore !== undefined && likesCountOkFromStore !== null) {
			setLikeCountState(likesCountOkFromStore || 0)
		}
	}, [likesCountOkFromStore])

	const handleDispatchUpdateViewerReactionPosts = (
		postDatabseId: number,
		type?: NcmazFcUserReactionPostUpdateResuiltEnum | null,
	) => {
		let newViewerReactionPosts = viewerReactionPosts

		if (type === NcmazFcUserReactionPostUpdateResuiltEnum.Added) {
			newViewerReactionPosts = [
				...(viewerReactionPosts || []).filter(
					(post) => !post.title?.includes(`${postDatabseId},LIKE`),
				),
				{
					title: `${postDatabseId},LIKE`,
					id: String(new Date()),
					isNewAddedFromClient: true,
					newLikedCount: likeCountState + 1,
				},
			]
			setLikeCountState(likeCountState + 1)
		}

		if (type === NcmazFcUserReactionPostUpdateResuiltEnum.Removed) {
			newViewerReactionPosts = (viewerReactionPosts || []).map((post) => {
				if (!post.title?.includes(`${postDatabseId},LIKE`)) {
					return post
				} else {
					return {
						...post,
						isNewAddedFromClient: false,
						isNewUnLikeFromClient: true,
						newLikedCount: likeCountState > 0 ? likeCountState - 1 : 0,
					}
				}
			})
			setLikeCountState(likeCountState > 0 ? likeCountState - 1 : 0)
		}

		dispatch(updateViewerAllReactionPosts(newViewerReactionPosts))
	}

	const isLiked = useMemo(() => {
		return viewerReactionPosts?.some(
			(post) =>
				post.title?.trim() === `${postDatabseId},LIKE` &&
				!post.isNewUnLikeFromClient,
		)
	}, [viewerReactionPosts, postDatabseId])

	useEffect(() => {
		if (loading || !isReady) return

		if (
			error ||
			data?.ncmazFaustUpdateUserReactionPostCount?.result ===
				NcmazFcUserReactionPostUpdateResuiltEnum.Error
		) {
			toast.error('An error occurred, please try again later.')
			handleDispatchUpdateViewerReactionPosts(
				postDatabseId,
				NcmazFcUserReactionPostUpdateResuiltEnum.Error,
			)
		}
	}, [data, error, loading, isReady, postDatabseId])

	const handleClickAction = () => {
		if (!isReady) {
			toast.error('Please wait a moment, data is being prepared.')
			return
		}

		if (!isAuthenticated) {
			openLoginModal()
			return
		}

		if (!viewer?.databaseId) {
			toast.error('Please wait a moment, data is being prepared.')
			return
		}

		const loadingDOM = document.querySelectorAll(
			'.getPostsNcmazMetaByIds_is_loading',
		)
		if (loadingDOM.length > 0) {
			toast.error('Please wait a moment, data is being refreshed.')
			return
		}

		handleDispatchUpdateViewerReactionPosts(
			postDatabseId,
			isLiked
				? NcmazFcUserReactionPostUpdateResuiltEnum.Removed
				: NcmazFcUserReactionPostUpdateResuiltEnum.Added,
		)

		handleUpdateReactionCount({
			variables: {
				post_id: postDatabseId,
				user_id: viewer.databaseId,
				reaction: NcmazFcUserReactionPostActionEnum.Like,
				number: isLiked
					? NcmazFcUserReactionPostNumberUpdateEnum.Remove_1
					: NcmazFcUserReactionPostNumberUpdateEnum.Add_1,
			},
		})
	}

	const actualLikeCount = useMemo(() => {
		if (!viewerReactionPosts?.length) {
			return likeCountState
		}
		const viewerReactionPost = viewerReactionPosts?.find(
			(post) => post.title?.trim() === `${postDatabseId},LIKE`,
		)
		return viewerReactionPost?.newLikedCount ?? likeCountState
	}, [likeCountState, viewerReactionPosts, postDatabseId])

	return (
		<button
			className={`nc-PostCardLikeAction group/PostCardLikeAction relative flex items-center text-xs leading-none transition-colors ${className} ${
				isLiked
					? 'text-rose-600 dark:text-rose-500'
					: 'text-neutral-700 hover:text-rose-600 dark:text-neutral-200 dark:hover:text-rose-400'
			}`}
			onClick={handleClickAction}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<div
				className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[rgb(255,255,255)] rounded-2xl border shadow-xl bg-card text-start text-neutral-900 transition-transform duration-200 dark:text-neutral-200 px-2 py-1 pl-[12px] pr-[12px] pt-[12px] pb-[12px] ${
					showTooltip ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
				}`}
				style={{
					transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
				}}
			>
				{isLiked ? 'Unlike' : 'Like'}
			</div>

			<div
				className={`${sizeClassName} flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-75`}
			>
				<FavouriteIcon
					color={'currentColor'}
					fill={isLiked ? 'currentColor' : 'none'}
					className="h-[18px] w-[18px]"
				/>
			</div>

			<span
				className={`ml-[0px] flex-shrink-0 text-start transition-colors duration-75 ${
					isLiked
						? 'text-rose-600 dark:text-rose-500'
						: 'text-neutral-900 dark:text-neutral-200'
				}`}
			>
				{actualLikeCount ? convertNumbThousand(actualLikeCount) : 0}
			</span>
		</button>
	)
}

export default PostCardLikeAction2
