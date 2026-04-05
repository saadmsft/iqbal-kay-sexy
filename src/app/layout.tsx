import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iqbal Kay Sexy - Dota 2 Meta Analysis",
  description:
    "Comprehensive Dota 2 meta analysis. Track top players, hero tier lists, builds, pro matches, and AI-powered insights using OpenDota data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.opendota.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenDota API
            </a>{" "}
            &middot; AI analysis by GitHub Models
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
