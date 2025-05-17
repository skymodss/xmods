import { NC_SITE_SETTINGS } from '@/contains/site-settings'

type DateFormatter = (d: Date) => string | number

interface DateFormatters {
	[key: string]: DateFormatter
}

export default function ncFormatDate(date_string: string): string {
	if (!date_string || typeof date_string !== 'string') return ''
	const date = new Date(date_string)
	// Check date invalid
	if (isNaN(date.getTime())) return ''

	const now = new Date()
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

	const intervals = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'week', seconds: 604800 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 },
		{ label: 'second', seconds: 1 },
	]

	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds)
		if (count >= 1) {
			if (count === 1) {
				return `one ${interval.label} ago`
			} else {
				return `${count} ${interval.label}s ago`
			}
		}
	}
	return 'just now'
}
