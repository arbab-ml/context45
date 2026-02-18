import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Context45 — All the docs. None of the bloat.",
  description:
    "Minimal MCP server that gives AI assistants only the essential documentation context. 100-300 tokens instead of 5,000+.",
};

function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-5 backdrop-blur-xl bg-[#08090a]/80 border-b border-transparent">
      <div className="max-w-[1000px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
          context<span className="text-accent font-mono text-[13px] font-medium">45</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/libraries" className="text-dim text-[13px] px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-accent/[0.08] transition-all">
            Libraries
          </Link>
          <a href="https://github.com/arbab-ml/context45" target="_blank" rel="noopener" className="text-dim text-[13px] px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-accent/[0.08] transition-all hidden sm:block">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/context45-mcp" target="_blank" rel="noopener" className="text-[#08090a] bg-accent text-[13px] font-medium px-3.5 py-1.5 rounded-lg hover:brightness-110 transition-all">
            npm
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-xs text-dim mt-auto">
      <div className="max-w-[1000px] mx-auto px-6">MIT &middot; context45</div>
    </footer>
  );
}

function AmbientGlow() {
  return (
    <>
      <div className="fixed -top-[200px] -right-[100px] w-[600px] h-[600px] rounded-full blur-[120px] bg-accent opacity-[0.06] pointer-events-none" />
      <div className="fixed -bottom-[300px] -left-[200px] w-[600px] h-[600px] rounded-full blur-[120px] bg-indigo-500 opacity-[0.06] pointer-events-none" />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col relative">
        <AmbientGlow />
        <Header />
        <main className="flex-1 relative">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
