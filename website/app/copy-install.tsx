"use client";

import { useState } from "react";

export function CopyInstall() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("npx context45-mcp");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy"
      className={`install-block inline-flex mx-auto ${copied ? "!border-green-400" : ""}`}
    >
      <span className="text-dim select-none relative z-10">$</span>
      <span className="text-white relative z-10">npx context45-mcp</span>
      <span className={`relative z-10 transition-colors ${copied ? "text-green-400" : "text-dim hover:text-accent"}`}>
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        )}
      </span>
    </button>
  );
}
