import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "./ui/SiteChrome";

export const metadata: Metadata = {
  title: "Nomads of Aditya",
  description: "Journeys, people, places and thoughts from Aditya Valvi.",
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
      </body>
    </html>
  );
}