"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { usePathname } from "next/navigation"; // Import the usePathname hook

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get the current pathname

  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body className={inter.className}>
        {pathname !== "/" && <NavBar />} {/* Conditionally render NavBar */}
        {children}
      </body>
    </html>
  );
}
