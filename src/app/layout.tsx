import type { Metadata } from "next";
import { Cinzel, Hind_Guntur } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AudioPlayer from "./components/AudioPlayer";
import { GoogleAnalytics } from '@next/third-parties/google';

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const hindGuntur = Hind_Guntur({
  variable: "--font-hind-guntur",
  subsets: ["latin", "telugu"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chenchugudi-mahabharatham.vercel.app'),
  title: "Chenchugudi Mahabharatham Mahotsavam — 65th Annual Grand Festival",
  description:
    "Official website for the 65th Annual Chenchugudi Mahabharatham Mahotsavam. Sri Krishna, Draupadi Sametha Dharmarajuvari Devasthanam, Chenchugudi, Vedurukuppam Mandal, Tirupati District, Andhra Pradesh. Uniting 24 villages.",
  keywords: "Chenchugudi, Mahabharatham, Festival, Tirupati, Vedurukuppam, Draupadi, Dharmarajula, Telugu Temple, Chittoor District, Mahabharat Festival 2026, Hindu Festival",
  authors: [{ name: 'Chenchugudi Temple Committee' }],
  openGraph: {
    title: "Chenchugudi Mahabharatham Mahotsavam | 65th Annual Festival",
    description: "Join the 65th Annual Chenchugudi Mahabharatham Festival, uniting 24 villages in Chenchugudi, Vedurukuppam Mandal.",
    url: "https://chenchugudi-mahabharatham.vercel.app",
    siteName: "Chenchugudi Mahabharatham",
    images: [
      {
        url: '/mahabharatham-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Chenchugudi Mahabharatham Festival Banner',
      },
    ],
    locale: "te_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chenchugudi Mahabharatham Mahotsavam",
    description: "Join the 65th Annual Chenchugudi Mahabharatham Festival, uniting 24 villages in Chenchugudi, Vedurukuppam Mandal.",
    images: ['/mahabharatham-hero.jpg'],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mahabharatham",
  },
};

export const viewport = {
  themeColor: "#8B0000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="te"
        className={`${cinzel.variable} ${hindGuntur.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <AudioPlayer />
        </body>
        <GoogleAnalytics gaId="G-Q7KWK9H54H" />
      </html>
    </ClerkProvider>
  );
}

