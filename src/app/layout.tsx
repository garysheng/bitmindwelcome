import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const satori = localFont({
  src: [
    {
      path: '../../public/SatoriTRIAL-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/SatoriTRIAL-Regular.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-satori'
});

export const metadata: Metadata = {
  title: "Let's Stay Connected | BitMind",
  description: "It was great meeting you in Denver! Let's stay connected and continue our conversation.",
  openGraph: {
    title: "Let's Stay Connected | BitMind",
    description: "It was great meeting you in Denver! Let's stay connected and continue our conversation.",
    images: [
      {
        url: '/og.png',
        width: 1904,
        height: 1024,
        alt: 'BitMind - Decentralized Deepfake Detection'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: "Let's Stay Connected | BitMind",
    description: "It was great meeting you in Denver! Let's stay connected and continue our conversation.",
    images: ['/og.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${satori.variable} dark:bg-slate-950`}>{children}</body>
    </html>
  );
}
