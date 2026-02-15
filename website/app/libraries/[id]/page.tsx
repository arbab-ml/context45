import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { LIBRARIES } from "@/lib/libraries";
import { getProcessedMd, extractTOC } from "@/lib/docs";
import { MarkdownContent } from "./markdown-content";

export function generateStaticParams() {
  return LIBRARIES.map((lib) => ({ id: lib.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Metadata {
  return {
    title: "Library — Context45",
    description: "API documentation on Context45.",
  };
}

export default async function LibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const library = LIBRARIES.find((l) => l.id === id);
  if (!library) notFound();

  const markdown = getProcessedMd(id);
  const toc = extractTOC(markdown).filter((item) => item.depth === 2);

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-dim mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="text-border">/</span>
        <Link href="/libraries" className="hover:text-white transition-colors">Libraries</Link>
        <span className="text-border">/</span>
        <span className="text-white">{library.name}</span>
      </nav>

      <div className="flex gap-12">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28">
            <h4 className="text-[11px] font-medium text-dim uppercase tracking-[0.1em] mb-4">On this page</h4>
            <nav className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {toc.map((item) => (
                <a
                  key={item.slug}
                  href={`#${item.slug}`}
                  className="block text-[13px] text-dim hover:text-white transition-colors py-0.5 truncate"
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{library.name}</h1>
          <p className="text-dim text-[15px] font-light mb-8">{library.description}</p>
          <div className="prose prose-invert max-w-none">
            <MarkdownContent content={markdown} />
          </div>
        </article>
      </div>
    </div>
  );
}
