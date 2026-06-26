import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Poppins } from "next/font/google";

import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "700"]
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"]
});

export const metadata: Metadata = {
  title: "NextGen Solutions | Premium Graphic Design Services",
  description:
    "NextGen Solutions delivers premium poster, social media, thumbnail, business card, wedding card, and book cover design services.",
  keywords: [
    "NextGen Solutions",
    "Graphic Design",
    "Poster Design",
    "Social Media Design",
    "YouTube Thumbnail Design",
    "Business Card Design"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${dmSans.variable} ${playfair.variable} font-[var(--font-dm)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
