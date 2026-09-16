import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { LanguageProvider } from "@/context/LanguageContext";
import { FriendProvider } from "@/context/FriendContext";
import AppGuard from "@/components/AppGuard";
import AppLayoutWrapper from "@/components/AppLayoutWrapper"; // ⚡ New wrapper tool

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teyaqi Trivia",
  description: "Daily Trivia Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} bg-slate-950 text-white antialiased overflow-hidden`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />

        <LanguageProvider>
          <FriendProvider>
            <AppGuard>
              {/* ⚡ This wrapper reads the URL path and shows/hides BottomNav dynamically */}
              <AppLayoutWrapper>
                {children}
              </AppLayoutWrapper>
            </AppGuard>
          </FriendProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}