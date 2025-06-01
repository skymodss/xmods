import '@/../faust.config'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaustProvider } from '@faustwp/core'
import '@/styles/globals.css'
import '@/styles/index.scss'
import { AppProps } from 'next/app'
import { WordPressBlocksProvider, fromThemeJson } from '@faustwp/blocks'
import blocks from '@/wp-blocks'
import { Poppins } from 'next/font/google'
import SiteWrapperProvider from '@/container/SiteWrapperProvider'
import { Toaster } from 'react-hot-toast'
import NextNProgress from 'nextjs-progressbar'
import themeJson from '@/../theme.json'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { SessionProvider, useSession } from 'next-auth/react'

// Dodaj proveru za klijent pre upotrebe useSession
function WordpressAuthSync() {
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

const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	return (
		<SessionProvider session={pageProps.session}>
			<GoogleAnalytics trackPageViews />
			<FaustProvider pageProps={pageProps}>
				<WordPressBlocksProvider
					config={{
						blocks,
						theme: fromThemeJson(themeJson),
					}}
				>
					<SiteWrapperProvider {...pageProps}>
						<style jsx global>{`
							html {
								font-family: ${poppins.style.fontFamily};
							}
						`}</style>
						<NextNProgress color="#818cf8" />
						<WordpressAuthSync />
						<Component {...pageProps} key={router.asPath} />
						<Toaster
							position="bottom-left"
							toastOptions={{
								style: {
									fontSize: '14px',
									borderRadius: '0.75rem',
								},
							}}
							containerClassName="text-sm"
						/>
					</SiteWrapperProvider>
				</WordPressBlocksProvider>
			</FaustProvider>
		</SessionProvider>
	)
}
