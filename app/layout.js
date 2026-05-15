import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./components/BootstrapClient";
import "./globals.css";
import AOSClient from "./components/AOSClient";
import { CartProvider } from "../context/CartContext";
import WhatsAppFloat from "./components/WhatsAppFloat";
import AIDecorAssistant from "./components/AIDecorAssistant";
import { Toaster } from "react-hot-toast";
import { WishlistProvider } from "../context/WishlistContext";
import { RecentlyViewedProvider } from "../context/RecentlyViewedContext";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "../lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eleos Decor | Premium Home & Office Decor in Nigeria",
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: SITE_NAME,
    title: "Eleos Decor | Premium Home & Office Decor in Nigeria",
    description: DEFAULT_SEO_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Eleos Decor premium home and office decor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleos Decor | Premium Home & Office Decor in Nigeria",
    description: DEFAULT_SEO_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <BootstrapClient />
        <AOSClient />

        <WishlistProvider>
          <CartProvider>
            <RecentlyViewedProvider>
              {children}
              <AIDecorAssistant />
              <WhatsAppFloat />
            </RecentlyViewedProvider>
          </CartProvider>
        </WishlistProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2500,
            style: {
              background: "#fff",
              color: "#1f1f1f",
              borderRadius: "14px",
              padding: "14px 18px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              fontSize: "0.95rem",
              fontWeight: "500",
            },
          }}
        />
      </body>
    </html>
  );
}
