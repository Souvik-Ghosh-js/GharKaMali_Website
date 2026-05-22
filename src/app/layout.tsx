import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import SocialProofToast from '@/components/SocialProofToast';
import NotificationListener from '@/components/NotificationListener';

export const metadata: Metadata = {
  metadataBase: new URL('https://gharkamali.com'),
  title: { default: 'GharKaMali — Expert Plant Care at Home | Starting ₹349', template: '%s | GharKaMali' },
  description: 'Expert plant care at your home starting just ₹349. Professional gardeners in Noida & Greater Noida. Book your garden visit today!',
  keywords: [
    'gardening', 'garden care', 'plants', 'gardener', 'home garden', 'plant care',
    'Noida gardener', 'plant service', 'GharKaMali', 'gardener near me', 'mali near me',
    'plant care near me', 'home gardening service', 'garden maintenance near me',
    'mali noida', 'plant care noida', 'balcony garden noida', 'terrace garden noida',
    'indoor plant care', 'outdoor garden maintenance', 'plant subscription india',
    'best gardener in noida', 'professional mali', 'home garden service delhi ncr',
  ],
  applicationName: 'GharKaMali',
  authors: [{ name: 'GharKaMali', url: 'https://gharkamali.com' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'home services',
  classification: 'Home & Garden Services',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://gharkamali.com',
    languages: { 'en-IN': 'https://gharkamali.com' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'GharKaMali — Expert Plant Care at Home | Starting ₹349',
    description: 'Expert plant care at your home starting just ₹349. Professional gardeners in Noida & Greater Noida. Book your garden visit today!',
    url: 'https://gharkamali.com',
    images: [
      { url: '/logo.png', width: 1200, height: 630, alt: 'GharKaMali — Professional Gardening Service' },
      { url: '/logo.png', width: 512, height: 512, alt: 'GharKaMali Logo' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'GharKaMali — Expert Plant Care at Home | Starting ₹349',
    description: 'Expert plant care at your home starting just ₹349. Professional gardeners in Noida & Greater Noida. Book your garden visit today!',
    images: [{ url: '/logo.png', alt: 'GharKaMali — Professional Gardening Service' }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#1E7A58' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'GharKaMali',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { email: false, address: false, telephone: false },
  verification: {
    google: 'REPLACE_WITH_GOOGLE_SITE_VERIFICATION',
    other: { 'msvalidate.01': 'REPLACE_WITH_BING_VERIFICATION' },
  },
  other: {
    'geo.region': 'IN-UP',
    'geo.placename': 'Noida, Uttar Pradesh',
    'geo.position': '28.5355;77.3910',
    'ICBM': '28.5355, 77.3910',
    'rating': 'general',
    'revisit-after': '3 days',
    'language': 'English',
    'copyright': 'GharKaMali',
    'og:price:amount': '349',
    'og:price:currency': 'INR',
    'theme-color': '#1E7A58',
    'msapplication-TileColor': '#1E7A58',
    'msapplication-config': '/browserconfig.xml',
  },
};

// Smooth scroll and page transition removed for now

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `
        }} />
        {/* ── Schema Markup — LocalBusiness + Organization ──────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['LocalBusiness', 'Organization'],
              name: 'GharKaMali',
              legalName: 'GharKaMali',
              description: 'Expert plant care at your home. Professional gardening services starting ₹349/month.',
              url: 'https://gharkamali.com',
              logo: '/logo.png',
              image: '/logo.png',
              telephone: '+91-9999999999',
              email: 'hello@gharkamali.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Noida',
                addressRegion: 'Uttar Pradesh',
                addressCountry: 'IN',
              },
              areaServed: ['Noida', 'Greater Noida', 'Delhi NCR'],
              priceRange: '₹349 - ₹1499',
              sameAs: [
                'https://www.instagram.com/gharkamali',
                'https://www.facebook.com/gharkamali',
                'https://twitter.com/gharkamali',
                'https://www.youtube.com/@gharkamali',
                'https://www.linkedin.com/company/gharkamali',
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Gardening Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Regular Garden Maintenance',
                      description: 'Professional gardener visits for regular plant care and garden maintenance',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Plant Expert Consultation',
                      description: 'Expert botanical consultation for plant health, landscaping, and garden design',
                    },
                  },
                ],
              },
            }),
          }}
        />
        {/* ── Meta Pixel ─────────────────────────────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function()
              {n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','1468638878299435');
              fbq('track','PageView');
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <WhatsAppFloat />
        <SocialProofToast />
        <NotificationListener />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 500,
              borderRadius: '16px',
              padding: '14px 20px',
              maxWidth: '400px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              background: '#0A1A13',
              color: '#E8F0EC',
              border: '1px solid rgba(201,168,76,0.15)',
            },
            success: {
              iconTheme: { primary: '#1E7A58', secondary: '#fff' },
              style: { background: '#0A1A13', color: '#4ADE80', border: '1px solid rgba(30,122,88,0.25)' },
            },
            error: {
              style: { background: '#0A1A13', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.25)' },
            },
          }}
        />
      </body>
    </html>
  );
}
