"use client";

import { BookOpen, Home, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const isReadingStory = pathname?.startsWith("/story/");

  if (isReadingStory) {
    return null;
  }

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-5 rounded-full border-2 border-orange-200 bg-white/90 px-5 py-3 shadow-xl backdrop-blur-md sm:gap-8 sm:px-6">
      <NavItem href="/" icon={<Home size={23} />} label="Home" />
      <NavItem href="/#stories" icon={<BookOpen size={23} />} label="Library" />
      <NavItem href="/create" icon={<Sparkles size={23} />} label="Create" />
      <NavItem href="/parents" icon={<User size={23} />} label="Parents" />
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-slate-400 transition-all hover:scale-110 hover:text-orange-400"
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}
