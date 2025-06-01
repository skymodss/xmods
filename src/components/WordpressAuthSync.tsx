import { useEffect } from 'react'
import { useSession } from 'next-auth/react'


export default function WordpressAuthSync() {
	if (typeof window === 'undefined') return null

	const { data: session, status } = useSession()

	useEffect(() => {
		if (
			status === 'authenticated' &&
			session?.user?.email &&
			session?.user?.name
		) {
			fetch(
				'https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/social-login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: session.user.email,
						name: session.user.name,
						google_id: (session.user as any).sub || '',
					}),
				}
			)
				.then(res => res.json())
				.then(data => {
					if (data?.token) {
						localStorage.setItem('wp_jwt', data.token)
					}
				})
				.catch(err => {
					console.error('WP sync error:', err)
				})
		}
	}, [session, status])

	return null
}
