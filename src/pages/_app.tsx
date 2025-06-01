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

// DODAJ OVO:
import { useSession } from 'next-auth/react'

const poppins = Poppins({
	subsets: ['latin'],
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

function WordpressAuthSync() {
	const { data: session, status } = useSession()

	useEffect(() => {
		if (
			status === 'authenticated' &&
			session?.user?.email &&
			session?.user?.name
		) {
			// Pozivaš svoj custom WP endpoint posle uspesnog logina
			fetch('https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/social-login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: session.user.email,
					name: session.user.name,
					google_id: (session.user as any).sub || '', // ili nesto drugo ako imas ID
				}),
			})
				.then(res => res.json())
				.then(data => {
					// Ako dobiješ JWT token, sačuvaj ga (npr. u localStorage ili kao cookie)
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

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	return (
		<>
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
						{/* DODAJ OVO */}
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
		</>
	)
}
