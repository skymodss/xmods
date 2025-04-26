import { FC } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import getTrans from '@/utils/getTrans'

interface Props {
	onUpdate: (editor: Editor) => void
	defaultTitle?: string
}

const TitleEditor: FC<Props> = ({ onUpdate, defaultTitle = '' }) => {
	const T = getTrans()
	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: T.pageSubmission['New post title here…'],
			}),
		],
		editorProps: {
			attributes: {
				class:
					'focus:outline-none max-w-screen-md mx-auto block w-full border-neutral-200 bg-white hover:ring hover:ring-primary-200/50 focus:border-primary-300 focus:ring focus:ring-primary-200/50 dark:border-neutral-600 dark:bg-transparent dark:placeholder:text-neutral-400 dark:hover:ring-primary-500/30 dark:focus:ring-primary-500/30 rounded-2xl text-sm font-normal h-11 px-4 py-3 mt-1',
			},
		},
		immediatelyRender: false,
		content: defaultTitle,
		onUpdate: ({ editor }) => {
			// @ts-ignore
			onUpdate(editor)
		},
	})

	return <EditorContent type={type} className="focus:outline-none" editor={editor} />
}

export default TitleEditor
