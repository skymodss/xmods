import Image, { ImageProps } from 'next/image'
import { FC } from 'react'

export interface Props extends ImageProps {
	enableDefaultPlaceholder?: boolean
	defaultPlaceholderDataUrl?: string
}

const MyImage: FC<Props> = ({
	enableDefaultPlaceholder = false,
	defaultPlaceholderDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+vx1PQAIqAM4jZDFJQAAAABJRU5ErkJggg==',
	...props
}) => {
	return (
		<Image
			{...props}
			className={`${props.className || ''} ${
				props.src ? '' : 'dark:brightness-75 dark:filter transition-transform duration-500 hover:scale-103'
			} `}
			src={props.src || '/images/placeholder.png'}
		/>
	)
}


export default MyImage
