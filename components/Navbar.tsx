"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <div className="w-2.5 h-2.5 rounded-full bg-[#5E5CE6]" />
        <span className="text-xl font-black text-[#4338CA] tracking-tight">XOMJO</span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
        <Link href="/agents" className="hover:text-[#4338CA] transition-colors">Agents</Link>
        <Link href="/models" className="hover:text-[#4338CA] transition-colors">Models</Link>
        <Link href="/pano" className="hover:text-[#4338CA] transition-colors">Pano Studio</Link>
        <a href="https://github.com/Xomjo/finagents#readme" target="_blank" rel="noopener noreferrer"
          className="hover:text-[#4338CA] transition-colors">Docs</a>
        <Link href="/about" className="hover:text-[#4338CA] transition-colors">About Me</Link>
      </div>

      {/* Right CTA */}
      <div className="flex items-center gap-3">
        <a href="https://github.com/Xomjo/finagents" target="_blank" rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors">
          ★ Open Source
        </a>
        <Link href="/agents/payments/stakepay"
          className="inline-flex items-center gap-1.5 bg-[#5E5CE6] hover:bg-[#4338CA] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
          Watch Demo →
        </Link>
      </div>
    </nav>
  );
}
