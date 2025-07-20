import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gelişmiş Lise Forumu - Türkiye\'nin En İyi Lise Platformu',
  description: 'Lise öğrencileri için tasarlanmış modern forum ve sosyal platform. Arkadaşlık kur, ders yardımı al, eğlenceli içerikleri keşfet.',
  keywords: ['lise', 'forum', 'öğrenci', 'eğitim', 'sosyal', 'arkadaşlık'],
  authors: [{ name: 'Lise Forumu Ekibi' }],
  creator: 'Lise Forumu',
  publisher: 'Lise Forumu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Gelişmiş Lise Forumu',
    description: 'Türkiye\'nin en iyi lise öğrencileri platformu',
    url: '/',
    siteName: 'Gelişmiş Lise Forumu',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gelişmiş Lise Forumu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gelişmiş Lise Forumu',
    description: 'Türkiye\'nin en iyi lise öğrencileri platformu',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}