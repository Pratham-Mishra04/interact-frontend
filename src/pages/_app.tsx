import '@/styles/globals.css';
import '@/styles/loader.css';
import '@/styles/toastify.css';
import '@/styles/extras.tailwind.css';
import '@/styles/project_card.css';
import '@/styles/landing.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store, persistor } from '@/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NProgressConfig from '@/config/nprogress';
import socketService from '@/config/ws';
import { Inter, Fraunces, Great_Vibes } from 'next/font/google';
import ThemeCheck from '@/config/theme';
import Head from 'next/head';
import ThemeProvider from '@/components/ui/theme-provider';
import { NextSeo } from 'next-seo';
import SEO from '@/config/seo';
import { Toaster } from '@/components/ui/sonner';

NProgressConfig();

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter-font',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--fraunces-font',
});

const great_vibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--great-vibes-font',
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    socketService.connect();
    ThemeCheck();
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <>
      {/* <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
      />
      <Script id="ga_script" strategy="lazyOnload">
        {`
         window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', ${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID});
      `}
      </Script> */}

      <main className={`${inter.variable} ${fraunces.variable} ${great_vibes.variable}`}>
        <NextSeo {...SEO()} />
        <Head>
          <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="use-credentials" />
        </Head>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <Toaster />
              <ToastContainer />
              <Component {...pageProps} />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </main>
    </>
  );
}
