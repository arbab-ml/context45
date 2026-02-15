"""
Experiment: Measure ACTUAL token usage for OpenAI and Claude API calls
when Context7 documentation is included as context.
"""

import os
from dotenv import load_dotenv
import requests
import tiktoken

load_dotenv()

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY")

# ── Step 1: Fetch docs from Context7 API ──────────────────────────

def fetch_context7_docs(library_path, topic, tokens=5000):
    url = f"https://context7.com/api/v1/{library_path}"
    resp = requests.get(url, params={"tokens": tokens, "topic": topic}, timeout=30)
    resp.raise_for_status()
    return resp.text

print("=" * 70)
print("STEP 1: Fetching documentation from Context7 API")
print("=" * 70)

print("\nFetching OpenAI docs (topic: chat completions, 5000 tokens)...")
openai_docs = fetch_context7_docs("openai/openai-python", "chat completions", 5000)
print(f"  Got {len(openai_docs)} chars")

print("Fetching Anthropic docs (topic: messages api, 5000 tokens)...")
anthropic_docs = fetch_context7_docs("anthropics/anthropic-sdk-python", "messages api", 5000)
print(f"  Got {len(anthropic_docs)} chars")

# Count tokens with tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
openai_docs_toks = len(enc.encode(openai_docs))
anthropic_docs_toks = len(enc.encode(anthropic_docs))
print(f"\n  OpenAI docs:    {openai_docs_toks} tokens (tiktoken/gpt-4o)")
print(f"  Anthropic docs: {anthropic_docs_toks} tokens (tiktoken/gpt-4o)")

# ── Step 2: OpenAI API calls (ACTUAL) ────────────────────────────

print("\n" + "=" * 70)
print("STEP 2: OpenAI API Calls — ACTUAL (gpt-4o-mini)")
print("=" * 70)

from openai import OpenAI
client = OpenAI(api_key=OPENAI_KEY)

QUESTION = "How do I make a basic chat completion API call? Show a simple example."

# Baseline
print("\n--- Baseline (NO docs) ---")
r = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": QUESTION}
    ],
    max_tokens=200
)
u = r.usage
print(f"  Prompt tokens:     {u.prompt_tokens}")
print(f"  Completion tokens: {u.completion_tokens}")
print(f"  Total tokens:      {u.total_tokens}")
oai_base = {"prompt": u.prompt_tokens, "completion": u.completion_tokens, "total": u.total_tokens}

# With Context7 docs
print("\n--- With Context7 docs ---")
sys_msg = f"""You are a helpful assistant. Use the following documentation to answer:

--- DOCUMENTATION (retrieved via Context7) ---
{openai_docs}
--- END DOCUMENTATION ---"""

r = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": sys_msg},
        {"role": "user", "content": QUESTION}
    ],
    max_tokens=200
)
u = r.usage
print(f"  Prompt tokens:     {u.prompt_tokens}")
print(f"  Completion tokens: {u.completion_tokens}")
print(f"  Total tokens:      {u.total_tokens}")
oai_docs = {"prompt": u.prompt_tokens, "completion": u.completion_tokens, "total": u.total_tokens}

# ── Step 3: Claude API calls (ACTUAL) ────────────────────────────

print("\n" + "=" * 70)
print("STEP 3: Claude API Calls — ACTUAL (claude-haiku-4.5)")
print("=" * 70)

import anthropic
claude = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# Baseline
print("\n--- Baseline (NO docs) ---")
r = claude.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=200,
    system="You are a helpful assistant.",
    messages=[{"role": "user", "content": QUESTION}]
)
u = r.usage
print(f"  Input tokens:  {u.input_tokens}")
print(f"  Output tokens: {u.output_tokens}")
print(f"  Total tokens:  {u.input_tokens + u.output_tokens}")
cl_base = {"input": u.input_tokens, "output": u.output_tokens, "total": u.input_tokens + u.output_tokens}

# With Context7 docs
print("\n--- With Context7 docs ---")
sys_msg = f"""You are a helpful assistant. Use the following documentation to answer:

--- DOCUMENTATION (retrieved via Context7) ---
{anthropic_docs}
--- END DOCUMENTATION ---"""

r = claude.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=200,
    system=sys_msg,
    messages=[{"role": "user", "content": QUESTION}]
)
u = r.usage
print(f"  Input tokens:  {u.input_tokens}")
print(f"  Output tokens: {u.output_tokens}")
print(f"  Total tokens:  {u.input_tokens + u.output_tokens}")
cl_docs = {"input": u.input_tokens, "output": u.output_tokens, "total": u.input_tokens + u.output_tokens}

# ── Summary ──────────────────────────────────────────────────────

print("\n" + "=" * 70)
print("RESULTS: ALL ACTUAL (from API response.usage)")
print("=" * 70)

print(f"\nContext7 docs retrieved:")
print(f"  OpenAI library docs:    {openai_docs_toks} tokens (tiktoken)")
print(f"  Anthropic library docs: {anthropic_docs_toks} tokens (tiktoken)")

print(f"\n{'Metric':<35} {'OpenAI gpt-4o-mini':>20} {'Claude haiku-4.5':>20}")
print("-" * 75)
print(f"{'Baseline input tokens':<35} {oai_base['prompt']:>20} {cl_base['input']:>20}")
print(f"{'With Context7 input tokens':<35} {oai_docs['prompt']:>20} {cl_docs['input']:>20}")
print(f"{'Baseline output tokens':<35} {oai_base['completion']:>20} {cl_base['output']:>20}")
print(f"{'With Context7 output tokens':<35} {oai_docs['completion']:>20} {cl_docs['output']:>20}")
print(f"{'Baseline total':<35} {oai_base['total']:>20} {cl_base['total']:>20}")
print(f"{'With Context7 total':<35} {oai_docs['total']:>20} {cl_docs['total']:>20}")
print(f"{'Added by Context7 (input)':<35} {oai_docs['prompt'] - oai_base['prompt']:>20} {cl_docs['input'] - cl_base['input']:>20}")
oai_mult = f"{oai_docs['prompt']/oai_base['prompt']:.1f}x"
cl_input = cl_docs['input'] / cl_base['input']
cl_mult = f"{cl_input:.1f}x"
print(f"{'Input multiplier':<35} {oai_mult:>20} {cl_mult:>20}")

print("\nAll numbers are ACTUAL from API response.usage fields.")
