import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "./ui/SiteChrome";
import Footer from "./ui/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://nomads-of-aditya.vercel.app"),
  title: {
    default: "Nomads of Aditya",
    template: "%s | Nomads of Aditya",
  },

  description:
    "Journeys, people, places and thoughts from Aditya Valvi.",

  applicationName: "Nomads of Aditya",

  authors: [
    {
      name: "Aditya Valvi",
    },
  ],

  creator: "Aditya Valvi",

  keywords: [
    "Aditya Valvi",
    "Nomads of Aditya",
    "travel",
    "travel stories",
    "journeys",
    "Maharashtra travel",
    "trekking",
    "adventure",
    "personal blog",
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nomads-of-aditya.vercel.app",
    siteName: "Nomads of Aditya",
    title: "Nomads of Aditya",
    description:
      "Journeys, people, places and thoughts from Aditya Valvi.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nomads of Aditya",
    description:
      "Journeys, people, places and thoughts from Aditya Valvi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteChrome />

        {children}

        <Footer />
      </body>
    </html>
  );
}