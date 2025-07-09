import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Wedding Photo Memories" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wedding Photos" />
        <meta name="description" content="Share and upload wedding photos and wishes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#d4af37" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#d4af37" />

        {/* Viewport */}
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* PWA Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
