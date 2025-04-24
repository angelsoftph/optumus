import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESC, APP_NAME } from "@/lib/constants";
import Providers from "./providers";
import "./globals.css";

const font = Inter({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESC,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased min-h-screen bg-gray-100`}
      >
        <Providers>
          <main>
            {children}
            <Toaster />
          </main>
        </Providers>
      </body>
    </html>
  );
}
