import {
	WordPressBlocksViewer,
	WordpressBlocksViewerProps,
} from '@faustwp/blocks'
import { FC } from 'react'

interface Props extends WordpressBlocksViewerProps {}

const MyWordPressBlockViewer: FC<Props> = ({ blocks }) => {
	return (
		<div className="ml-[0px] mr-[0px] mt-[0px] mb-[0px]">
			<WordPressBlocksViewer blocks={blocks} />
		</div>
	)
}

export default MyWordPressBlockViewer
