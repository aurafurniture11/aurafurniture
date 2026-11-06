import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  IBM_Plex_Sans_Arabic,
  Geist_Mono,
} from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getCategories, getStoreInfo } from "@/lib/vondera";
import { StoreProvider } from "@/context/StoreContext";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreInfo();
  const title =
    store?.seoData?.seo?.title ||
    "Aura Furniture | أثاث منزلي عصري وتوصيل لكل مصر";
  const description =
    store?.seoData?.seo?.description ||
    "Aura Furniture — Contemporary home furniture, wardrobes, storage units, and modern living delivered across Egypt.";

  return {
    title,
    description,
    keywords: store?.seoData?.seo?.keywords,
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
    openGraph: {
      title: store?.seoData?.social?.ogTitle || title,
      description: store?.seoData?.social?.ogDescription || description,
      images: store?.seoData?.social?.ogImage
        ? [store.seoData.social.ogImage]
        : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, categories] = await Promise.all([
    getStoreInfo(),
    getCategories(),
  ]);

  const fbPixelId =
    store?.pixels?.facebookPixel ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
    "";

  return (
    <html
      lang="en"
      dir="ltr"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} ${ibmPlexArabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        {fbPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        <StoreProvider>
          <Navbar store={store} categories={categories} />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer store={store} categories={categories} />
        </StoreProvider>
      </body>
    </html>
  );
}
