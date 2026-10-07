"use client";

import { Lexend } from "next/font/google";
import "./globals.css";
import { BookOpen, Home, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const lexend = Lexend({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // This checks if the current URL starts with "/story/"
  // If it does, we hide the navigation bar so it doesn't block the book.
  const isReadingStory = pathname?.startsWith("/story/");

  return (
    <html lang="en">
      <body className={`${lexend.className} bg-amber-50`}>
        {!isReadingStory && (
          <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-5 rounded-full border-2 border-orange-200 bg-white/90 px-5 py-3 shadow-xl backdrop-blur-md sm:gap-8 sm:px-6">
            <NavItem href="/" icon={<Home size={23} />} label="Home" />
            <NavItem href="/#stories" icon={<BookOpen size={23} />} label="Library" />
            <NavItem href="/create" icon={<Sparkles size={23} />} label="Create" />
            <NavItem href="/parents" icon={<User size={23} />} label="Parents" />
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center text-slate-400 transition-all hover:scale-110 hover:text-orange-400">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}
