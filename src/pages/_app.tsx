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

// auth
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'


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
    // 1. Wrap everything in NextAuth's SessionProvider
    <SessionProvider session={session}>
      {/* 2. Wrap in your custom AuthProvider (uses useLoginModal under the hood) */}
      <AuthProvider>
        {/* 3. Analytics can stay here */}
        <GoogleAnalytics trackPageViews />

        {/* 4. Faust root provider */}
        <FaustProvider pageProps={pageProps}>
          {/* 5. WP Blocks context */}
          <WordPressBlocksProvider
            config={{
              blocks,
              theme: fromThemeJson(themeJson),
            }}
          >
            {/* 6. Your site-wide wrapper */}
            <SiteWrapperProvider {...pageProps}>
              <style jsx global>{`
                html {
                  font-family: ${poppins.style.fontFamily};
                }
              `}</style>

              {/* 7. Top-level progress bar */}
              <NextNProgress color="#818cf8" />

              {/* 8. Your page */}
              <Component {...pageProps} key={router.asPath} />

              {/* 10. Toasts */}
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
  )
}
