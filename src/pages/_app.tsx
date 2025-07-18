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
import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider } from 'next-auth/react'

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
    <FaustProvider pageProps={pageProps}>
      {/* AuthProvider će se sada renderovati samo na klijentu, unutar SessionProvidera */}
      <SessionProvider session={session}>
        <GoogleAnalytics trackPageViews />
        <AuthProvider>
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
        </AuthProvider>
      </SessionProvider>
    </FaustProvider>
  )
}
