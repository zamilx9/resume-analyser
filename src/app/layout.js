"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
         <meta name="google-site-verification" content="PS6-685dYcaCXLVx30dHnYk0D6opi7rv3HLhiByzs80" />
       </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
