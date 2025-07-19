import '@/../faust.config'
import React from 'react'
import { useRouter } from 'next/router'
import { FaustProvider } from '@faustwp/core'
import '@/styles/globals.css'
import '@/styles/index.scss'
import type { AppProps } from 'next/app'
import { WordPressBlocksProvider, fromThemeJson } from '@faustwp/blocks'
import blocks from '@/wp-blocks'
import { Poppins } from 'next/font/google'
import SiteWrapperProvider from '@/container/SiteWrapperProvider'
import { Toaster } from 'react-hot-toast'
import NextNProgress from 'nextjs-progressbar'
import themeJson from '@/../theme.json'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import dynamic from 'next/dynamic'

// Redux imports
import { Provider as ReduxProvider } from 'react-redux'
import store from '@/stores/store' // <- ovo mora biti tvoj store

// Auth-related imports
import { SessionProvider } from 'next-auth/react'
const AuthProvider = dynamic(
  () => import('@/context/AuthContext').then(mod => mod.AuthProvider),
  { ssr: false }
)

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300','400','500','600','700','800','900'],
})

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter()

  return (
    <ReduxProvider store={store}>
      <SessionProvider session={session}>
        <AuthProvider>
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
        </AuthProvider>
      </SessionProvider>
    </ReduxProvider>
  )
}
