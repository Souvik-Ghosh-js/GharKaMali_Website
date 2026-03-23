import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'Ghar Ka Mali — Expert Garden Care', template: '%s | Ghar Ka Mali' },
  description: 'Premium professional gardening services at your doorstep. Book expert gardeners instantly.',
  keywords: ['gardening', 'garden care', 'plants', 'gardener', 'home garden', 'plant care'],
  openGraph: { type: 'website', locale: 'en_IN', siteName: 'Ghar Ka Mali' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Load Poppins with all needed weights */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 500,
              borderRadius: '14px',
              padding: '12px 18px',
              maxWidth: '380px',
              boxShadow: '0 8px 32px rgba(11,61,46,0.13)',
            },
            success: {
              iconTheme: { primary: '#0B3D2E', secondary: '#fff' },
              style: { background: '#f0fdf6', color: '#0B3D2E', border: '1px solid rgba(11,61,46,0.12)' },
            },
            error: {
              style: { background: '#fff1f1', color: '#7f1d1d', border: '1px solid rgba(220,38,38,0.12)' },
            },
          }}
        />
      </body>
    </html>
  );
}
