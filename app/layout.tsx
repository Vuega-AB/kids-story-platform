import { Inter, Lexend } from "next/font/google"; // Lexend is great for reading
import "./globals.css";
import { BookOpen, Home, Sparkles, User } from "lucide-react";

const lexend = Lexend({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lexend.className} bg-amber-50`}>
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border-2 border-orange-200 px-6 py-3 rounded-full flex items-center gap-8 shadow-xl z-50">
          <NavItem icon={<Home size={24} />} label="Home" active />
          <NavItem icon={<BookOpen size={24} />} label="Library" />
          <NavItem icon={<Sparkles size={24} />} label="Create" />
          <NavItem icon={<User size={24} />} label="Parents" />
        </nav>
        {children}
      </body>
    </html>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex flex-col items-center cursor-pointer transition-all ${active ? 'text-orange-500 scale-110' : 'text-slate-400 hover:text-orange-400'}`}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}