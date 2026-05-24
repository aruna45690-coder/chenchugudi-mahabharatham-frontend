import type { Metadata } from "next";
import { Cinzel, Hind_Guntur } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
  metadataBase: new URL('https://chenchugudi-mahabharath.vercel.app'),
  title: "Chenchugudi Mahabharatham Mahotsavam — 64th Annual Grand Festival",
  description:
    "Official website for the 64th Annual Chenchugudi Mahabharatham Mahotsavam. Sri Krishna, Draupadi Sametha Dharmarajuvari Devasthanam, Vedurukuppam Mandal, Tirupati District, Andhra Pradesh. Uniting 24 villages.",
  keywords: "Chenchugudi, Mahabharatham, Festival, Tirupati, Vedurukuppam, Draupadi, Dharmarajula, Telugu Temple, Chittoor District, Mahabharat Festival 2025, Hindu Festival",
  authors: [{ name: 'Chenchugudi Temple Committee' }],
  openGraph: {
    title: "Chenchugudi Mahabharatham Mahotsavam | 64th Annual Festival",
    description: "Join the 64th Annual Chenchugudi Mahabharatham Festival, uniting 24 villages in Vedurukuppam Mandal.",
    url: "https://chenchugudi-mahabharath.vercel.app",
    siteName: "Chenchugudi Mahabharatham",
    images: [
      {
        url: "/images/deity.jpg",
        width: 1200,
        height: 630,
        alt: "Chenchugudi Deity",
      },
    ],
    locale: "te_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chenchugudi Mahabharatham Mahotsavam",
    description: "Join the 64th Annual Chenchugudi Mahabharatham Festival, uniting 24 villages in Vedurukuppam Mandal.",
    images: ["/images/deity.jpg"],
  },
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
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}

