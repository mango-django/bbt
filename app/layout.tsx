// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header/Header";
import { CartProvider } from "@/app/context/CartContext";
import Footer from "@/components/Footer";
import CartToast from "@/components/CartToast";

export const metadata: Metadata = {
  title: "Bellos Bespoke Tiles",
  description: "Premium Tiles, Porcelain, Ceramics, Outdoor Tiles & 3D Visualiser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <CartToast />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
