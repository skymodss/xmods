import '@/../faust.config'
import React, { useEffect, useState } from 'react'
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
import dynamic from "next/dynamic"
const WordpressAuthSync = dynamic(() => import("@/components/WordpressAuthSync"), { ssr: false })
import { SessionProvider } from "next-auth/react";
// import { AuthProvider } from "../context/AuthContext"; // Ostavljen za kasniju upotrebu ako treba

// Helper funkcije za detekciju tipa login-a
function isGoogleJwtUser() {
  return typeof window !== "undefined" && !!localStorage.getItem('wp_jwt');
}

async function isClassicWpUser() {
  try {
    const res = await fetch('/wp-json/wp/v2/users/me', {
      credentials: 'include'
    });
    return res.ok;
  } catch {
    return false;
  }
}

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"google" | "classic" | "none">("none");

  useEffect(() => {
    // Detekcija tipa autentifikacije
    if (isGoogleJwtUser()) {
      setAuthMode("google");
    } else {
      isClassicWpUser().then((isLoggedIn) => {
        if (isLoggedIn) {
          setAuthMode("classic");
        } else {
          setAuthMode("none");
        }
      });
    }
  }, []);

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
            {/* Proslijedi authMode kao prop ako trebaš razlikovati */}
            <Component {...pageProps} key={router.asPath} authMode={authMode} />
            {/* Google login (JWT) sync aktivan samo za Google korisnike */}
            <SessionProvider session={pageProps.session}>
              <WordpressAuthSync />
            </SessionProvider>
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
