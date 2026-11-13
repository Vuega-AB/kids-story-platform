import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { BottomNav } from "./components/BottomNav";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storyland — Magical AI Bedtime & Adventure Stories for Kids",
  description:
    "Explore interactive 3D flipbook stories for children or create custom AI-illustrated adventures in seconds.",
  openGraph: {
    title: "Storyland — Magical AI Stories for Kids",
    description:
      "Explore interactive 3D flipbook stories for children or create custom AI-illustrated adventures in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lexend.className} bg-amber-50`}>
        <BottomNav />
        {children}
      </body>
    </html>
  );
}
