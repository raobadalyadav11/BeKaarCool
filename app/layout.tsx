import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeKaarCool - Custom Print-on-Demand Platform",
  description:
    "Create, customize, and sell premium custom clothing and accessories with advanced design tools",
  keywords:
    "custom clothing, print on demand, design studio, e-commerce, canvas editor",
  authors: [{ name: "BeKaarCool Team" }],
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            defer
          />
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}
