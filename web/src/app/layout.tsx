import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/app-layout";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Scraper Agent",
  description: "自然语言驱动的智能爬虫",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", geist.variable)}>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
