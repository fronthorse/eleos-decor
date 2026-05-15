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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eleos Decor - Premium Home & Office Décor",
  description: "Curated elegant décor solutions for your home and office. Nationwide delivery across Nigeria.",
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
