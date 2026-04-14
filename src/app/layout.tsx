import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export const metadata: Metadata = {
  title: { default: 'GharKaMali — Expert Plant Care at Home | Starting ₹349', template: '%s | GharKaMali' },
  description: 'Expert plant care at your home starting just ₹349. Professional gardeners in Noida & Greater Noida. Book your garden visit today!',
  keywords: ['gardening', 'garden care', 'plants', 'gardener', 'home garden', 'plant care', 'Noida gardener', 'plant service', 'GharKaMali'],
  openGraph: { type: 'website', locale: 'en_IN', siteName: 'GharKaMali' },
  icons: {
    icon: '/favicon.ico',
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
