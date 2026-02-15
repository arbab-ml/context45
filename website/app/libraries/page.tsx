import Link from "next/link";
import { LIBRARIES } from "@/lib/libraries";

export const metadata = {
  title: "Libraries — Context45",
  description: "Browse available documentation libraries in Context45.",
};

export default function LibrariesPage() {
  return (
    <section className="max-w-[1000px] mx-auto px-6 pt-28 pb-20">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Libraries</h1>
      <p className="text-dim text-[15px] font-light mb-10">
        Pre-compressed API documentation available through Context45.
      </p>
      <div className="lib-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-5 text-dim font-medium text-xs">Library</th>
              <th className="text-left py-3 px-5 text-dim font-medium text-xs hidden sm:table-cell">Source</th>
              <th className="text-center py-3 px-5 text-dim font-medium text-xs">Sections</th>
              <th className="text-center py-3 px-5 text-dim font-medium text-xs hidden sm:table-cell">Version</th>
              <th className="py-3 px-5" />
            </tr>
          </thead>
          <tbody>
            {LIBRARIES.map((lib) => (
              <tr key={lib.id} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-5">
                  <Link href={`/libraries/${lib.id}`} className="text-white font-medium hover:text-accent transition-colors">
                    {lib.name}
                  </Link>
                  <p className="text-[11px] text-dim mt-0.5">{lib.description}</p>
                </td>
                <td className="py-3.5 px-5 text-dim hidden sm:table-cell font-mono text-xs">{lib.source}</td>
                <td className="py-3.5 px-5 text-center text-dim font-mono text-xs">{lib.sections}</td>
                <td className="py-3.5 px-5 text-center text-dim text-xs hidden sm:table-cell">{lib.version}</td>
                <td className="py-3.5 px-5 text-right">
                  <Link href={`/libraries/${lib.id}`} className="text-xs text-accent hover:brightness-125 transition-all">
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
