import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SerwistProvider } from "./serwist";
import { SearchBox } from "@/components/SearchBox";
import { SearchButton } from "@/components/SearchButton";

export const metadata: Metadata = {
  title: "Anti-Doom Scroll",
  description:
    "A focused learning hub that turns tech study tracks into small, finishable daily lessons.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anti-Doom Scroll",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <div className="fixed top-3 right-5 z-50 flex items-center gap-2">
            <SearchButton />
            <SearchBox />
          </div>
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
