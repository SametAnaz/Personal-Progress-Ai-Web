import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "./components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kişisel Gelişim Takip Sistemi",
  description: "n8n workflow'u ile desteklenen alışkanlık ve fiziksel gelişim takip sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
