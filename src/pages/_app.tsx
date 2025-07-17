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
import dynamic from 'next/dynamic' // Vratili smo dynamic import

// Auth-related imports
import { SessionProvider } from 'next-auth/react'
// import { AuthProvider } from '@/context/AuthContext' // VIŠE NE IMPORTUJEMO OVAKO

// --- KLJUČNA IZMENA ---
// AuthProvider sada takođe učitavamo dinamički, samo na klijentu.
// Ovo osigurava da `useSession` i `localStorage` kod unutar njega
// rade bez grešaka pri serverskom renderovanju.
const AuthProvider = dynamic(
  () => import('@/context/AuthContext').then(mod => mod.AuthProvider),
  { ssr: false }
)
// --- KRAJ IZMENE ---

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
    <SessionProvider session={session}>
      {/* AuthProvider će se sada renderovati samo na klijentu, unutar SessionProvidera */}
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
  )
}
