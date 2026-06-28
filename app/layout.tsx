import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xomjo — AI Agents for Fintech",
  description: "Live, interactive AI agents for payments and customer success. Open source.",
  openGraph: {
    title: "Xomjo — AI Agents for Fintech",
    description: "Watch AI agents recover declined payments, detect churn, and automate fintech workflows — live demos, open source.",
    url: "https://xomjo.com",
    siteName: "Xomjo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xomjo — AI Agents for Fintech",
    description: "Live AI agent demos for payments and customer success. Open source.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable)}>
      <body className="min-h-screen bg-white text-[#1C1C28] antialiased">
        <Navbar />
        <main>{children}</main>
        <GoogleAnalytics gaId="G-1D6FTLEHX2" />
      </body>
    </html>
  );
}
