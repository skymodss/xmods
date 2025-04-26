import {
	WordPressBlocksViewer,
	WordpressBlocksViewerProps,
} from '@faustwp/blocks'
import { FC } from 'react'

interface Props extends WordpressBlocksViewerProps {}

const MyWordPressBlockViewer: FC<Props> = ({ blocks }) => {
	return <WordPressBlocksViewer className="ml-[0px] mr-[0px] mt-[0px] mb-[0px]" blocks={blocks} />
}

export default MyWordPressBlockViewer
