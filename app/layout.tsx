import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MP Performance Dashboard",
  description: "A premium modern analytics dashboard tracking parliamentary member activities, attendance, questions, debates, and bills.",
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
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-50 flex flex-col md:flex-row">
        {/* Shared navigation sidebar */}
        <Sidebar />
        
        {/* Main application contents */}
        <main className="flex-1 min-w-0 min-h-screen flex flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-12 pt-20 lg:pt-8">
          {children}
        </main>
      </body>
    </html>

  );
}
