import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import icon from "./image/3.png";
import ogImage from "./image/2.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  title: "PodiScan",
  description:
    "Dashboard IoT real-time untuk pemantauan suhu kaki diabetik dan deteksi dini anomali.",
  icons: [{ rel: "icon", url: icon.src }],
  openGraph: {
    title: "PodiScan",
    description: "Dashboard IoT real-time untuk pemantauan suhu kaki diabetik dan deteksi dini anomali.",
    images: [{ url: ogImage.src }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
