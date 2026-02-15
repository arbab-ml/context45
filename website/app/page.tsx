import Link from "next/link";
import { LIBRARIES } from "@/lib/libraries";
import { SetupTerminal } from "./setup-terminal";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[180px] pb-16 text-center">
        <div className="max-w-[1000px] mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 border border-border rounded-full text-xs text-dim mb-8 animate-fade-up delay-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            v0.1.0 &mdash; live on npm
          </div>

          <h1 className="text-[clamp(40px,7vw,72px)] font-semibold tracking-[-0.04em] leading-[1.05] mb-6 animate-fade-up delay-2">
            All the docs.<br />
            <span className="font-light text-dim">None of the bloat.</span>
          </h1>

          <p className="text-[17px] text-dim font-light max-w-[420px] mx-auto mb-4 leading-relaxed animate-fade-up delay-3">
            MCP server that gives AI assistants only what matters. 20x less tokens.
          </p>
          <p className="text-xs text-dim mb-12 animate-fade-up delay-3">
            Open source &middot; <a href="https://github.com/arbab-ml/context45" target="_blank" rel="noopener" className="text-accent hover:brightness-125 transition-all">Star on GitHub</a>
          </p>
        </div>
      </section>

      {/* Setup terminal */}
      <section id="install" className="pb-16 animate-fade-up delay-4">
        <div className="max-w-[1000px] mx-auto px-6">
          <SetupTerminal />
          <p className="text-center text-xs text-dim mt-4">
            Then add <code className="text-accent text-xs bg-surface px-1.5 py-0.5 rounded border border-border">&quot;use context45&quot;</code> to your prompts to fetch relevant docs.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 animate-fade-up delay-5">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-value text-accent">20<span className="text-base text-dim font-normal">x</span></div>
              <div className="text-[13px] text-dim">less tokens</div>
            </div>
            <div className="metric">
              <div className="metric-value text-green-400">300</div>
              <div className="text-[13px] text-dim">tokens per query</div>
            </div>
            <div className="metric">
              <div className="metric-value">6 <span className="text-base text-dim font-normal">KB</span></div>
              <div className="text-[13px] text-dim">package size</div>
            </div>
          </div>
        </div>
      </section>

      {/* Libraries */}
      <section id="libraries" className="py-12">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="section-label">Available libraries</div>
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
                      <p className="text-[11px] text-dim mt-0.5 sm:hidden">{lib.source}</p>
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
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="section-label">How it works</div>
          <div className="steps-grid">
            <div>
              <div className="font-mono text-[11px] text-accent/60 mb-4">01</div>
              <h4 className="text-sm font-medium mb-2">Curated</h4>
              <p className="text-[13px] text-dim font-light leading-snug">Hand-compressed docs covering 95% of use cases. No tutorials, no fluff.</p>
            </div>
            <div>
              <div className="font-mono text-[11px] text-accent/60 mb-4">02</div>
              <h4 className="text-sm font-medium mb-2">Indexed</h4>
              <p className="text-[13px] text-dim font-light leading-snug">Semantic search over vector embeddings finds the right chunk.</p>
            </div>
            <div>
              <div className="font-mono text-[11px] text-accent/60 mb-4">03</div>
              <h4 className="text-sm font-medium mb-2">Served</h4>
              <p className="text-[13px] text-dim font-light leading-snug">Returns 2-3 chunks via MCP. Just the answer, 100-300 tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-28 text-center">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-[clamp(28px,5vw,44px)] font-semibold tracking-[-0.03em] mb-8">Less noise. Better code.</h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://www.npmjs.com/package/context45-mcp" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-medium bg-accent text-[#08090a] hover:brightness-110 hover:-translate-y-px transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0h-2.666V8.667h2.666v5.331zm12-5.331v4h-1.333v-4h-1.333v4h-1.334v-4h-1.333v4h-1.333v-4h-1.334v5.331h8.001V8.667h-2.001z"/></svg>
              Install
            </a>
            <a href="https://github.com/arbab-ml/context45" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-medium bg-surface text-white border border-border hover:border-accent/30 hover:-translate-y-px transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Source
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
