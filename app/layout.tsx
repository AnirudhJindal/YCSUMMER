import type { Metadata } from "next";
import { Geist, Geist_Mono, Annie_Use_Your_Telescope } from "next/font/google";
import "./globals.css";
import Providers from "../app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const annie = Annie_Use_Your_Telescope({
  variable: "--font-annie",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vault.",
  description: "Privacy layer for LLMs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${annie.variable}`}
    >
      <body className="bg-white text-black min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}