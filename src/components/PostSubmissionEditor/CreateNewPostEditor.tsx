'use client'

import { FC, useEffect, useState } from 'react'
import ButtonPrimary from '@/components/Button/ButtonPrimary'
import TitleEditor from './TitleEditor'
import { debounce } from 'lodash'
import TagsInput, { TagNodeShort } from './TagsInput'
import CategoriesInput from './CategoriesInput'
import PostOptionsBtn, { PostOptionsData } from './PostOptionsBtn'
import TiptapEditor from './TiptapEditor'
import { Editor } from '@tiptap/react'
import { useMutation } from '@apollo/client'
import Alert from '@/components/Alert'
import toast from 'react-hot-toast'
import {
	NcmazFcCategoryFullFieldsFragmentFragment,
	PostStatusEnum,
} from '@/__generated__/graphql'
import ButtonInsertImage, { ImageState } from './ButtonInsertImage'
import { getApolloAuthClient } from '@faustwp/core'
import Button from '../Button/Button'
import { useRouter } from 'next/router'
import {
	NC_MUTATION_CREATE_POST,
	NC_MUTATION_UPDATE_POST,
} from '@/fragments/mutations'
import Label from '../Label/Label'
import Input from '../Input/Input'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'
import NcModal from '../NcModal/NcModal'
import Link from 'next/link'
import errorHandling from '@/utils/errorHandling'
import { useSelector } from 'react-redux'
import { RootState } from '@/stores/store'
import getTrans from '@/utils/getTrans'


interface Props {
	isEditingPage?: boolean
	isEditingPostId?: string
	isSubmittingPage?: boolean
	//
	defaultTitle?: string
	defaultContent?: string
	defaultFeaturedImage?: ImageState
	defaultTags?: TagNodeShort[]
	defaultCategories?: NcmazFcCategoryFullFieldsFragmentFragment[]
	defaultPostOptionsData?: PostOptionsData
	//
}

const CreateNewPostEditor: FC<Props> = ({
	isEditingPostId,
	isEditingPage,
	isSubmittingPage,
	defaultTitle: defaultTitleProp = '',
	defaultContent: defaultContentProp = '',
	defaultFeaturedImage: defaultFeaturedImageProp = {
		sourceUrl: '',
		altText: '',
	},
	defaultTags: defaultTagsProp = [],
	defaultCategories: defaultCategoriesProp = [],
	defaultPostOptionsData: defaultPostOptionsDataProp = {
		audioUrl: '',
		videoUrl: '',
		excerptText: '',
		postFormatsSelected: '',
		objGalleryImgs: undefined,
		isAllowComments: true,
		timeSchedulePublication: undefined,
		showRightSidebar: true,
	},
}) => {
	const { isReady, isAuthenticated } = useSelector(
		(state: RootState) => state.viewer.authorizedUser,
	)
	const client = getApolloAuthClient()
	//
	const router = useRouter()
	const T = getTrans()
	const localStoragePath = isSubmittingPage
		? 'submission_page__new'
		: 'submission_page__edit__' + (isEditingPostId || 'none')

	//
	const [titleContent, setTitleContent] = useState<string>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}').titleContent ||
			defaultTitleProp,
	)
	const [contentHTML, setContentHTML] = useState<string>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}').contentHTML ||
			defaultContentProp,
	)
	const [featuredImage, setFeaturedImage] = useState<ImageState>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}')
				.featuredImage || defaultFeaturedImageProp,
	)
	const [tags, setTags] = useState<TagNodeShort[]>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}').tags ||
			defaultTagsProp,
	)
	const [categories, setCategories] = useState<
		NcmazFcCategoryFullFieldsFragmentFragment[]
	>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}').categories ||
			defaultCategoriesProp,
	)
	const [postOptionsData, setPostOptionsData] = useState<PostOptionsData>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}')
				.postOptionsData || defaultPostOptionsDataProp,
	)
	const [videoUrl, setVideoUrl] = useState<string>(
		() =>
			JSON.parse(localStorage.getItem(localStoragePath) || '{}').videoUrl || ''
	)
	//
	const [newUpdatedUri, setNewUpdatedUri] = useState('')
	const [isSubmitSuccess, setIsSubmitSuccess] = useState(false)

	// all keys of states
	const stateKeys = [
		'titleContent',
		'contentHTML',
		'featuredImage',
		'tags',
		'categories',
		'postOptionsData',
		'videoUrl',
	] as const

	const updateToLocalStorage = (
		name: (typeof stateKeys)[number],
		value: unknown,
	) => {
		localStorage.setItem(
			localStoragePath,
			JSON.stringify({
				titleContent,
				contentHTML,
				featuredImage,
				tags,
				categories,
				postOptionsData,
				videoUrl,
				...{ [name]: value },
			}),
		)
	}

	const handleRevertToDefault = () => {
		localStorage.removeItem(localStoragePath)
		router.reload()
	}

	useEffect(() => {
		if (localStorage.getItem(localStoragePath)) {
			const data = JSON.parse(localStorage?.getItem?.(localStoragePath) || '')
			if (!data) {
				return
			}
			setTitleContent(data.titleContent || defaultTitleProp)
			setContentHTML(data.contentHTML || defaultContentProp)
			setFeaturedImage(data.featuredImage || defaultFeaturedImageProp)
			setTags(data.tags || defaultTagsProp)
			setCategories(data.categories || defaultCategoriesProp)
			setPostOptionsData(data.postOptionsData || defaultPostOptionsDataProp)
			setVideoUrl(data.videoUrl || '')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const [mutationCreatePost, { error, data, loading }] = useMutation(
		NC_MUTATION_CREATE_POST,
		{
			client,
			onCompleted: (data) => {
				setIsSubmitSuccess(true)
				toast.success(T.pageSubmission['Created new post successfully'])

				if (data.createPost?.post?.status !== 'publish') {
					router.push(
						`/preview${data?.createPost?.post?.uri}&preview=true&previewPathname=post`,
					)
					return
				}
				router.replace(data?.createPost?.post?.uri || '')
			},
			onError: (error) => {
				errorHandling(error)
			},
		},
	)
	const [
		mutationUpdatePost,
		{
			error: updatePostError,
			data: updatePostData,
			loading: updatePostLoading,
		},
	] = useMutation(NC_MUTATION_UPDATE_POST, {
		client,
		onCompleted: (data) => {
			setIsSubmitSuccess(true)
			toast.success(T.pageSubmission['Update post successfully'])
			setNewUpdatedUri(`/?p=${data?.updatePost?.post?.databaseId}`)
		},
		onError: (error) => {
			errorHandling(error)
		},
	})

	const debounceGetTitle = debounce(function (e: Editor) {
		setTitleContent(e.getText())
		updateToLocalStorage('titleContent', e.getText())
	}, 300)

	const debounceGetContentHtml = debounce(function (e: Editor) {
		setContentHTML(e.getHTML())
		updateToLocalStorage('contentHTML', e.getHTML())
	}, 400)

	const debounceVideoUrlChange = debounce(function (value: string) {
		setVideoUrl(value)
		updateToLocalStorage('videoUrl', value)
		setPostOptionsData((prev) => ({ ...prev, videoUrl: value }))
	}, 300)

	useEffect(() => {
		if (isSubmitSuccess) {
			localStorage.removeItem(localStoragePath)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSubmitSuccess])

	useEffect(() => {
		const keys = Object.keys(localStorage)
		const keysWithEdit = keys.filter((key) =>
			key.startsWith('submission_page__edit__'),
		)
		if (keysWithEdit.length > 2) {
			keysWithEdit.forEach((key) => {
				if (key !== localStoragePath) {
					localStorage.removeItem(key)
				}
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleChangeFeaturedImage = (image: ImageState) => {
		setFeaturedImage(image)
		updateToLocalStorage('featuredImage', image)
		return
	}

	const handleChangeCategories = (
		data: NcmazFcCategoryFullFieldsFragmentFragment[],
	) => {
		if (data.length === categories.length) {
			return
		}
		setCategories(data)
		updateToLocalStorage('categories', data)
	}

	const handleChangeTags = (data: TagNodeShort[]) => {
		if (data.length === tags.length) {
			return
		}
		setTags(data)
		updateToLocalStorage('tags', data)
	}

	const handleApplyPostOptions = (data: PostOptionsData) => {
		setPostOptionsData(data)
		updateToLocalStorage('postOptionsData', data)
		if (data.videoUrl !== videoUrl) {
			setVideoUrl(data.videoUrl || '')
			updateToLocalStorage('videoUrl', data.videoUrl || '')
		}
	}

	const onSubmmitMutation = (status: PostStatusEnum) => {
		if (IS_CHISNGHIAX_DEMO_SITE) {
			toast.error('Sorry, post submission is disabled on the demo site!')
			return
		}

		const videoUrlToSend = videoUrl || postOptionsData.videoUrl || null

		if (isSubmittingPage) {
			mutationCreatePost({
				variables: {
					status,
					title: titleContent,
					content: contentHTML,
					categoryNodes: categories.map((item) => ({
						id: item.databaseId.toString(),
					})),
					ncTags: tags.map((item) => item.name).join(','),
					featuredImg_alt: featuredImage?.altText ?? null,
					featuredImg_url: featuredImage?.sourceUrl ?? null,
					date: postOptionsData.timeSchedulePublication || null,
					//
					img_1_alt:
						postOptionsData.objGalleryImgs?.['image1']?.altText ?? null,
					img_2_alt:
						postOptionsData.objGalleryImgs?.['image2']?.altText ?? null,
					img_3_alt:
						postOptionsData.objGalleryImgs?.['image3']?.altText ?? null,
					img_4_alt:
						postOptionsData.objGalleryImgs?.['image4']?.altText ?? null,
					img_5_alt:
						postOptionsData.objGalleryImgs?.['image5']?.altText ?? null,
					img_6_alt:
						postOptionsData.objGalleryImgs?.['image6']?.altText ?? null,
					img_7_alt:
						postOptionsData.objGalleryImgs?.['image7']?.altText ?? null,
					img_8_alt:
						postOptionsData.objGalleryImgs?.['image8']?.altText ?? null,
					//
					img_1_url:
						postOptionsData.objGalleryImgs?.['image1']?.sourceUrl ?? null,
					img_2_url:
						postOptionsData.objGalleryImgs?.['image2']?.sourceUrl ?? null,
					img_3_url:
						postOptionsData.objGalleryImgs?.['image3']?.sourceUrl ?? null,
					img_4_url:
						postOptionsData.objGalleryImgs?.['image4']?.sourceUrl ?? null,
					img_5_url:
						postOptionsData.objGalleryImgs?.['image5']?.sourceUrl ?? null,
					img_6_url:
						postOptionsData.objGalleryImgs?.['image6']?.sourceUrl ?? null,
					img_7_url:
						postOptionsData.objGalleryImgs?.['image7']?.sourceUrl ?? null,
					img_8_url:
						postOptionsData.objGalleryImgs?.['image8']?.sourceUrl ?? null,
					//
					commentStatus: postOptionsData.isAllowComments ? 'open' : 'closed',
					excerpt: postOptionsData.excerptText ?? null,
					ncmazAudioUrl: postOptionsData.audioUrl ?? null,
					ncmazVideoUrl: videoUrlToSend,
					postFormatName:
						postOptionsData.postFormatsSelected !== ''
							? postOptionsData.postFormatsSelected
							: null,
					//
					showRightSidebar: postOptionsData.showRightSidebar ? '1' : '0',
					postStyle: postOptionsData.postStyleSelected,
					//
				},
			})
		} else if (isEditingPage) {
			mutationUpdatePost({
				variables: {
					id: isEditingPostId || '',
					status,
					title: titleContent,
					content: contentHTML,
					categoryNodes: categories.map((item) => ({
						id: item.databaseId.toString(),
					})),
					ncTags: tags.map((item) => item.name).join(','),
					featuredImg_alt: featuredImage?.altText ?? null,
					featuredImg_url: featuredImage?.sourceUrl ?? null,
					date: postOptionsData.timeSchedulePublication || null,
					//
					img_1_alt:
						postOptionsData.objGalleryImgs?.['image1']?.altText ?? null,
					img_2_alt:
						postOptionsData.objGalleryImgs?.['image2']?.altText ?? null,
					img_3_alt:
						postOptionsData.objGalleryImgs?.['image3']?.altText ?? null,
					img_4_alt:
						postOptionsData.objGalleryImgs?.['image4']?.altText ?? null,
					img_5_alt:
						postOptionsData.objGalleryImgs?.['image5']?.altText ?? null,
					img_6_alt:
						postOptionsData.objGalleryImgs?.['image6']?.altText ?? null,
					img_7_alt:
						postOptionsData.objGalleryImgs?.['image7']?.altText ?? null,
					img_8_alt:
						postOptionsData.objGalleryImgs?.['image8']?.altText ?? null,
					//
					img_1_url:
						postOptionsData.objGalleryImgs?.['image1']?.sourceUrl ?? null,
					img_2_url:
						postOptionsData.objGalleryImgs?.['image2']?.sourceUrl ?? null,
					img_3_url:
						postOptionsData.objGalleryImgs?.['image3']?.sourceUrl ?? null,
					img_4_url:
						postOptionsData.objGalleryImgs?.['image4']?.sourceUrl ?? null,
					img_5_url:
						postOptionsData.objGalleryImgs?.['image5']?.sourceUrl ?? null,
					img_6_url:
						postOptionsData.objGalleryImgs?.['image6']?.sourceUrl ?? null,
					img_7_url:
						postOptionsData.objGalleryImgs?.['image7']?.sourceUrl ?? null,
					img_8_url:
						postOptionsData.objGalleryImgs?.['image8']?.sourceUrl ?? null,
					//
					commentStatus: postOptionsData.isAllowComments ? 'open' : 'closed',
					excerpt: postOptionsData.excerptText ?? null,
					ncmazAudioUrl: postOptionsData.audioUrl ?? null,
					ncmazVideoUrl: videoUrlToSend,
					postFormatName:
						postOptionsData.postFormatsSelected !== ''
							? postOptionsData.postFormatsSelected
							: null,
					//
					showRightSidebar: postOptionsData.showRightSidebar ? '1' : '0',
					postStyle: postOptionsData.postStyleSelected,
					//
				},
			})
		}
	}

	const handleClickPublish = () => {
		if (!isAuthenticated && !isReady) return

		if (!!postOptionsData.timeSchedulePublication) {
			onSubmmitMutation(PostStatusEnum.Future)
			return
		}

		onSubmmitMutation(PostStatusEnum.Publish)
	}

	const handleClickSaveDraft = () => {
		if (!isAuthenticated && !isReady) return
		onSubmmitMutation(PostStatusEnum.Draft)
	}

	const LOADING = loading || updatePostLoading
	const ERROR = error || updatePostError

	const renderPostTitle = () => {
		return (
			<div className="w-full px-2.5 pb-10 pt-2.5 lg:py-10">
				<div>
					i
					<h2 className="text-xl font-semibold capitalize">
						Profile settings
					</h2>
					<span className="mt-2.5 block text-sm text-neutral-500 dark:text-neutral-400">
						Update your username and manage your account
					</span>
					</div>
				<div className="w-24 border-b border-neutral-200 dark:border-neutral-700"></div>
				<div className="mx-auto w-full max-w-screen-md space-y-5 rounded-xl border text-card-foreground shadow-sm bg-card/70 backdrop-blur-sm pl-[24px] pr-[24px] pt-[24px] pb-[24px]">
					<div className="">
						<Label className="text-sm">
							Mod Title
						</Label>
						<TitleEditor
							defaultTitle={titleContent}
							onUpdate={debounceGetTitle}
						/>
					</div>
					<div className="">
						<Label className="text-sm">
							{T.pageSubmission['Featured image']}
						</Label>
						<ButtonInsertImage
							defaultImage={featuredImage}
							onChangeImage={handleChangeFeaturedImage}
						/>
					</div>
					<CategoriesInput
						defaultValue={categories}
						onChange={handleChangeCategories}
					/>
					<div className="mx-auto w-full max-w-screen-md">
						<Label
							htmlFor="video-url"
							className="block capitalize"
							title={T.pageSubmission['Video URL (Youtube, Vimeo, mp4 ... )']}
						>
							{T.pageSubmission['Video URL (Youtube, Vimeo, mp4 ... )']}
						</Label>
						<Input
							onChange={(event) => {
								debounceVideoUrlChange(event.currentTarget.value)
							}}
							defaultValue={videoUrl}
							className="mt-1"
							placeholder="Download URL..."
							type="url"
							name="video-url"
							id="video-url"
						/>
					</div>
					<TagsInput defaultValue={tags} onChange={handleChangeTags} />
					{ERROR && (
						<Alert containerClassName="text-sm" type="error">
							{ERROR.message}
						</Alert>
					)}
					<TiptapEditor
						defaultContent={contentHTML}
						onUpdate={debounceGetContentHtml}
					/>
				</div>
			</div>
		)
	}


	const enableRevertBtn =
		localStoragePath.startsWith('submission_page__edit__') &&
		!!localStorage.getItem(localStoragePath)?.length

	return (
		<>
			<div className="nc-CreateNewPostEditor relative flex-1">
				<div className="absolute inset-0 flex h-full flex-col">
					<div className="flex-1 overflow-y-auto">
						{renderPostTitle()}
						
					</div>

					<div className="w-full flex-shrink-0 border-t border-neutral-200 px-2.5 dark:border-neutral-600">
						<div className="mx-auto flex w-full max-w-screen-md flex-wrap gap-2 py-4 pt-[18px] sm:gap-3">
							<ButtonPrimary
								fontSize="text-base font-medium"
								onClick={handleClickPublish}
								loading={LOADING}
								disabled={LOADING}
							>
								{!!postOptionsData.timeSchedulePublication
									? T.pageSubmission['Schedule']
									: T.pageSubmission['Publish']}
							</ButtonPrimary>
							<Button
								fontSize="text-base font-medium"
								onClick={handleClickSaveDraft}
								loading={LOADING}
								disabled={LOADING}
								pattern="third"
							>
								{isEditingPage
									? T.pageSubmission['Move to draft']
									: T.pageSubmission['Save draft']}
							</Button>
							<PostOptionsBtn
								defaultData={postOptionsData}
								onSubmit={handleApplyPostOptions}
							/>
							{enableRevertBtn ? (
								<Button
									fontSize="text-sm font-medium"
									onClick={() => {
										let result = confirm(
											'Are you sure you want to revert new changes?',
										)
										if (result) {
											handleRevertToDefault()
										}
									}}
									loading={LOADING}
									disabled={LOADING}
									pattern="link"
									sizeClass="py-3 px-4"
								>
									{T.pageSubmission['Revert new changes']}
								</Button>
							) : null}
						</div>
					</div>
				</div>
			</div>

			{!!isEditingPage && (
				<NcModal
					renderTrigger={() => null}
					isOpenProp={!!newUpdatedUri}
					renderContent={() => (
						<div className="py-5">
							<div className="font-medium">
								{
									T.pageSubmission[
										'Congratulations! You have successfully updated the post!'
									]
								}
							</div>
							<div className="mt-2.5 text-sm text-neutral-700">
								{
									T.pageSubmission[
										'These changes will be applied to the post in about 15 minutes.'
									]
								}{' '}
								<br />
								{T.pageSubmission['You can']}{' '}
								<Link
									href={`/preview${newUpdatedUri}&preview=true&previewPathname=post`}
									className="font-medium underline"
								>
									{T.pageSubmission['preview the post']}
								</Link>{' '}
								{T.pageSubmission['by clicking the button below.']}
							</div>
						</div>
					)}
					onCloseModal={() => setNewUpdatedUri('')}
					contentExtraClass="max-w-screen-sm"
					modalTitle="Update post successfully"
					renderFooter={() => (
						<div className="flex justify-end">
							<ButtonPrimary
								href={`/preview${newUpdatedUri}&preview=true&previewPathname=post`}
								onClick={() => {
									setNewUpdatedUri('')
								}}
							>
								{T.pageSubmission['Preview post']}
							</ButtonPrimary>
						</div>
					)}
				/>
			)}
		</>
	)
}

export default CreateNewPostEditor
