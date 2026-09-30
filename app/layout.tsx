import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { Header } from '@/components/home/Header';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/home/Footer';
import { NavigationProgressBar } from '@/components/ui/NavigationProgressBar';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF7F2',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MOAMLIGHT | Artisanal Indian Luxury Scented Candles',
    template: '%s | MOAMLIGHT Luxury Scented Candles',
  },
  description:
    'Handcrafted slow-burning 100% botanical soy wax candles infused with ancient Indian botanicals, royal spices, and clean aromas. Mysore Sandalwood, Kashmir Saffron, Kannauj Mitti Attar, and Madurai Mogra.',
  keywords: [
    'luxury scented candles india',
    'botanical soy wax candles',
    'sandalwood candle india',
    'kashmir saffron oudh candle',
    'kannauj mitti attar petrichor candle',
    'madurai mogra jasmine candle',
    'handcrafted candles bengaluru',
    'clean burn non toxic candles',
    'aromatherapy candles india',
    'd2c candle brand india',
    'lead free cotton wick candles',
    'sustainable luxury home fragrance',
    'festive candle gift sets',
  ],
  authors: [{ name: 'MOAMLIGHT Artisanal Home Fragrance Atelier', url: siteUrl }],
  creator: 'MOAMLIGHT',
  publisher: 'MOAMLIGHT',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'MOAMLIGHT',
    title: 'MOAMLIGHT | Artisanal Indian Luxury Scented Candles',
    description:
      'Handcrafted slow-burning 100% botanical soy wax candles infused with ancient Indian botanicals, royal spices, and clean aromas.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&h=630&q=85',
        width: 1200,
        height: 630,
        alt: 'MOAMLIGHT Artisanal Indian Luxury Scented Candles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOAMLIGHT | Artisanal Indian Luxury Scented Candles',
    description:
      'Handcrafted slow-burning 100% botanical soy wax candles infused with ancient Indian botanicals, royal spices, and clean aromas.',
    site: '@moamlight',
    creator: '@moamlight',
    images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&h=630&q=85'],
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
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'MOAMLIGHT',
      legalName: 'MOAMLIGHT Artisanal Home Fragrance Atelier',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        caption: 'MOAMLIGHT Handcrafted Luxury Scented Candles',
      },
      description:
        'Artisanal Indian home fragrance house handcrafting slow-burning 100% botanical soy wax candles infused with ancient botanicals and mindful aromatherapy.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '14/2 Indiranagar 100ft Rd',
        addressLocality: 'Bengaluru',
        addressRegion: 'Karnataka',
        postalCode: '560038',
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-98765-43210',
        contactType: 'Customer Service & WhatsApp Concierge',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
      sameAs: [
        'https://www.instagram.com/moamlight',
        'https://twitter.com/moamlight',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'MOAMLIGHT',
      description: 'Artisanal Indian Luxury Scented Candles',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      inLanguage: 'en-IN',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className="min-h-screen bg-warm-linen text-charcoal antialiased">
        <SmoothScrollProvider>
          {/* Instant Luxury Amber Navigation Progress Bar */}
          <NavigationProgressBar />
          <CartProvider>
            <AuthProvider>
              <ToastProvider>
                <div id="app-root" className="relative min-h-screen flex flex-col">
                  {/* Promotional Top Bar */}
                  <AnnouncementBar />

                  {/* Main Sticky Navigation */}
                  <Header />

                  {/* Page Dynamic Content */}
                  <main className="flex-1 relative z-10">{children}</main>

                  {/* Persistent Slide-Out Cart Drawer */}
                  <CartDrawer />

                  {/* Indian D2C Footer */}
                  <Footer />
                </div>
              </ToastProvider>
            </AuthProvider>
          </CartProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
