import '@/styles/globals.css';
import '@/styles/loader.css';
import '@/styles/toastify.css';
import '@/styles/extras.tailwind.css';
import '@/styles/project_card.css';
import '@/styles/variables.module.scss';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store, persistor } from '@/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NProgressConfig from '@/config/nprogress';
import socketService from '@/config/ws';
import { Inter } from 'next/font/google';
import ThemeCheck from '@/config/theme';
import Head from 'next/head';

NProgressConfig();

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter-font',
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

      <main className={`${inter.variable}`}>
        <Head>
          <title>Interact Now</title>
          <meta
            name="description"
            content="Interact is a groundbreaking web platform designed for college-going students, freelancers, professionals, and creatives. It serves as a collaborative hub where users can upload their ongoing projects and connect with others who are interested in collaborating on those projects."
          />
          <meta
            name="keywords"
            content="Collaborative platform for projects, Project collaboration network, Online project collaboration, College student collaboration, Freelancer collaboration, Professional project sharing, Creative project collaboration, Collaborate on ongoing projects, Project collaboration hub, Project showcase platform, Collaborative networking for students, Collaborate with professionals, Collaborate with creatives, Free project collaboration, Showcase achievements online, Project collaboration for all niches, Connect with project partners, College project sharing, Networking for freelancers, Creative project sharing platform"
          />
          <meta property="og:title" content="Interact Now" />
          <meta
            property="og:description"
            content="Interact is a groundbreaking web platform designed for college-going students, freelancers, professionals, and creatives. It serves as a collaborative hub where users can upload their ongoing projects and connect with others who are interested in collaborating on those projects."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://interactnow.in/" />
          <meta property="og:site_name" content="Interact Now" />
          <meta property="og:image" content="https://i.imgur.com/oXPWynA.jpg" />
          <meta property="og:image:width" content="720" />
          <meta property="og:image:height" content="720" />
          <meta
            property="og:image:alt"
            content="Interact: The collaborative hub for project sharing and collaboration among college students, freelancers, professionals, and creatives."
          />
          <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="use-credentials" />
        </Head>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ToastContainer />
            <Component {...pageProps} />
          </PersistGate>
        </Provider>
      </main>
    </>
  );
}
