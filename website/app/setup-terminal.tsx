"use client";

import { useState } from "react";

const tabs = [
  {
    id: "claude",
    label: "Claude Code",
    content: (
      <div className="p-6 font-mono text-[13px] leading-[1.7]">
        <div><span className="text-[#555]"># Add to Claude Code</span></div>
        <div><span className="text-blue-300">claude</span> <span className="text-dim">mcp add context45 --</span> <span className="text-green-400">npx context45-mcp</span></div>
        <div>&nbsp;</div>
        <div><span className="text-[#555]"># Then just ask</span></div>
        <div><span className="text-green-400">&quot;use context45 for streaming docs&quot;</span></div>
        <div>&nbsp;</div>
        <div><span className="text-[#555]"># Result: ~146 tokens, exactly what you need</span></div>
        <div><span className="text-dim">Done.</span><span className="inline-block w-0.5 h-4 bg-accent align-text-bottom animate-[blink_1s_step-end_infinite]" /></div>
      </div>
    ),
  },
  {
    id: "cursor",
    label: "Cursor",
    content: (
      <div className="p-6 font-mono text-[13px] leading-[1.7]">
        <div><span className="text-[#555]"># Add to ~/.cursor/mcp.json</span></div>
        <div className="text-gray-300">{`{`}</div>
        <div className="text-gray-300">{`  "mcpServers": {`}</div>
        <div className="text-gray-300">{`    "context45": {`}</div>
        <div className="text-gray-300">{`      "command": `}<span className="text-green-400">&quot;npx&quot;</span>{`,`}</div>
        <div className="text-gray-300">{`      "args": [`}<span className="text-green-400">&quot;context45-mcp&quot;</span>{`]`}</div>
        <div className="text-gray-300">{`    }`}</div>
        <div className="text-gray-300">{`  }`}</div>
        <div className="text-gray-300">{`}`}</div>
      </div>
    ),
  },
];

export function SetupTerminal() {
  const [active, setActive] = useState("claude");

  return (
    <div className="code-window max-w-[680px] mx-auto">
      <div className="code-titlebar justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                active === tab.id
                  ? "text-white bg-white/[0.08]"
                  : "text-dim hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}
