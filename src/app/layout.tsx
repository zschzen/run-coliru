import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"
import { Space_Mono } from 'next/font/google';
import "./globals.css";

const spaceMono = Space_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Run, Coliru! Run.",
  description: "An interactive platform for running and sharing code snippets using the Coliru online compiler.",
  authors: [{ name: "Leandro Peres", url: "https://peres.dev" }],
  creator: "Leandro Peres",
  publisher: "Leandro Peres",
  openGraph: {
    title: "Run, Coliru! Run.",
    description: "Interactive code playground powered by Coliru compiler explorer",
    url: "https://run.peres.dev",
    siteName: "Run, Coliru! Run.",
    images: [
      {
        url: "https://run.peres.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "Run, Coliru! Run. - Interactive Code Playground",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Run, Coliru! Run.",
    description: "Interactive code playground powered by Coliru compiler explorer",
    creator: "@zschzen",
    images: ["https://run.peres.dev/twitter-image.png"],
  },
  keywords: ["code playground", "compiler explorer", "Coliru", "interactive coding", "code sharing"],
  //themeColor: "#000000",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  //manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://run.peres.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`subpixel-antialiased ${spaceMono.className}`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}