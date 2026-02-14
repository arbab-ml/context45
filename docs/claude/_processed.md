# Anthropic Claude API - Core Documentation

Condensed reference for building with the Claude API. Covers models, authentication, API calls, and all core features.

---

## Table of Contents

1. [Authentication & Setup](#authentication--setup)
2. [Models & Pricing](#models--pricing)
3. [Client SDKs](#client-sdks)
4. [Messages API Reference](#messages-api-reference)
5. [Streaming](#streaming)
6. [Tool Use](#tool-use)
7. [Vision (Images)](#vision-images)
8. [Structured Outputs](#structured-outputs)
9. [Extended Thinking](#extended-thinking)
10. [Prompt Caching](#prompt-caching)
11. [Batch Processing](#batch-processing)
12. [Errors](#errors)
13. [Rate Limits](#rate-limits)

---

## Authentication & Setup

### API Key

Get your key from the [Claude Console](https://platform.claude.com/settings/keys).

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

### Required Headers

| Header | Value |
|--------|-------|
| `x-api-key` | Your API key |
| `anthropic-version` | `2023-06-01` |
| `content-type` | `application/json` |

### Base URL

```
https://api.anthropic.com/v1/messages
```

---

## Models & Pricing

### Current Models

| Model | API ID | Alias | Input | Output | Context | Max Output |
|-------|--------|-------|-------|--------|---------|------------|
| **Opus 4.6** | `claude-opus-4-6` | `claude-opus-4-6` | $5/MTok | $25/MTok | 200K (1M beta) | 128K |
| **Sonnet 4.5** | `claude-sonnet-4-5-20250929` | `claude-sonnet-4-5` | $3/MTok | $15/MTok | 200K (1M beta) | 64K |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | `claude-haiku-4-5` | $1/MTok | $5/MTok | 200K | 64K |

### Legacy Models (still available)

| Model | API ID | Alias | Input | Output |
|-------|--------|-------|-------|--------|
| Opus 4.5 | `claude-opus-4-5-20251101` | `claude-opus-4-5` | $5/MTok | $25/MTok |
| Opus 4.1 | `claude-opus-4-1-20250805` | `claude-opus-4-1` | $15/MTok | $75/MTok |
| Sonnet 4 | `claude-sonnet-4-20250514` | `claude-sonnet-4-0` | $3/MTok | $15/MTok |
| Opus 4 | `claude-opus-4-20250514` | `claude-opus-4-0` | $15/MTok | $75/MTok |
| Haiku 3 | `claude-3-haiku-20240307` | — | $0.25/MTok | $1.25/MTok |

### Third-Party Platform IDs

| Model | AWS Bedrock | GCP Vertex AI |
|-------|-------------|---------------|
| Opus 4.6 | `anthropic.claude-opus-4-6-v1` | `claude-opus-4-6` |
| Sonnet 4.5 | `anthropic.claude-sonnet-4-5-20250929-v1:0` | `claude-sonnet-4-5@20250929` |
| Haiku 4.5 | `anthropic.claude-haiku-4-5-20251001-v1:0` | `claude-haiku-4-5@20251001` |

### Batch API Pricing (50% discount)

| Model | Batch Input | Batch Output |
|-------|------------|--------------|
| Opus 4.6 | $2.50/MTok | $12.50/MTok |
| Sonnet 4.5 | $1.50/MTok | $7.50/MTok |
| Haiku 4.5 | $0.50/MTok | $2.50/MTok |

### Prompt Caching Pricing

| Model | Base Input | 5m Cache Write | 1h Cache Write | Cache Read | Output |
|-------|-----------|----------------|----------------|------------|--------|
| Opus 4.6 | $5/MTok | $6.25/MTok | $10/MTok | $0.50/MTok | $25/MTok |
| Sonnet 4.5 | $3/MTok | $3.75/MTok | $6/MTok | $0.30/MTok | $15/MTok |
| Haiku 4.5 | $1/MTok | $1.25/MTok | $2/MTok | $0.10/MTok | $5/MTok |

Multipliers: cache write = 1.25x base (5m) or 2x base (1h), cache read = 0.1x base.

### Model Selection Guide

| Need | Model | Use Cases |
|------|-------|-----------|
| Maximum intelligence | Opus 4.6 | Advanced agents, coding, research, complex reasoning |
| Balance of speed + intelligence | Sonnet 4.5 | Code gen, data analysis, content creation, tool use |
| Speed + economy | Haiku 4.5 | Real-time apps, high-volume processing, sub-agents |

---

## Client SDKs

### Installation

```bash
# Python
pip install anthropic

# TypeScript / Node.js
npm install @anthropic-ai/sdk

# Java (Gradle)
implementation("com.anthropic:anthropic-java:2.11.1")

# Go
go get github.com/anthropics/anthropic-sdk-go

# Ruby
bundler add anthropic

# C#
dotnet add package Anthropic

# PHP
composer require anthropic-ai/sdk
```

### Quick Start Examples

**Python:**
```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)
print(message.content)
```

**TypeScript:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const message = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }]
});
console.log(message.content);
```

**cURL:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, Claude"}]
  }'
```

---

## Messages API Reference

### `POST /v1/messages`

Create a message. The API is stateless — provide the full conversation in each request.

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model ID (e.g., `"claude-opus-4-6"`) |
| `max_tokens` | integer | Yes | Max tokens to generate (model-dependent max) |
| `messages` | array | Yes | Array of message objects with `role` and `content` |
| `system` | string \| array | No | System prompt (string or array of content blocks) |
| `temperature` | float | No | Randomness (0.0-1.0, default ~1.0). Lower = more deterministic |
| `top_p` | float | No | Nucleus sampling threshold |
| `top_k` | integer | No | Top-K sampling |
| `stop_sequences` | string[] | No | Custom stop sequences |
| `stream` | boolean | No | Enable SSE streaming |
| `tools` | array | No | Tool definitions for tool use |
| `tool_choice` | object | No | How Claude should use tools (`auto`, `any`, `tool`, `none`) |
| `metadata` | object | No | Request metadata (e.g., `user_id`) |
| `thinking` | object | No | Extended thinking config |
| `output_config` | object | No | Output format config (for structured outputs) |

### Message Format

```json
{
  "role": "user",
  "content": "Hello, Claude"
}
```

Content can be a string or an array of content blocks:

```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "What's in this image?"},
    {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": "..."}}
  ]
}
```

### Content Block Types (Input)

| Type | Description |
|------|-------------|
| `text` | Text content |
| `image` | Image (base64 or URL) |
| `document` | PDF or plain text document |
| `tool_use` | Tool call from assistant |
| `tool_result` | Result of a tool call |
| `thinking` | Thinking block (for multi-turn with extended thinking) |

### Response Object

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {"type": "text", "text": "Hello! How can I help you today?"}
  ],
  "model": "claude-opus-4-6",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 12,
    "output_tokens": 15
  }
}
```

### Stop Reasons

| Value | Meaning |
|-------|---------|
| `end_turn` | Natural end of response |
| `max_tokens` | Hit `max_tokens` limit |
| `stop_sequence` | Hit a custom stop sequence |
| `tool_use` | Claude wants to call a tool (client tools) |
| `pause_turn` | Server tool loop hit iteration limit — send response back to continue |

### Multi-turn Conversations

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What is the capital of France?"},
        {"role": "assistant", "content": "The capital of France is Paris."},
        {"role": "user", "content": "What's its population?"},
    ],
)
```

### System Prompts

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system="You are a helpful assistant that responds in JSON.",
    messages=[{"role": "user", "content": "List 3 colors"}],
)
```

---

## Streaming

Set `"stream": true` or use SDK streaming helpers for incremental responses via SSE.

### SDK Streaming

**Python:**
```python
with client.messages.stream(
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
    model="claude-opus-4-6",
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

**TypeScript:**
```typescript
await client.messages.stream({
  messages: [{ role: "user", content: "Hello" }],
  model: "claude-opus-4-6",
  max_tokens: 1024
}).on("text", (text) => {
  console.log(text);
});
```

### Get Final Message (no event handling needed)

```python
with client.messages.stream(
    max_tokens=128000,
    messages=[{"role": "user", "content": "Write a detailed analysis..."}],
    model="claude-opus-4-6",
) as stream:
    message = stream.get_final_message()
print(message.content[0].text)
```

### SSE Event Flow

1. `message_start` — Message object with empty content
2. `content_block_start` — Start of a content block
3. `content_block_delta` — Incremental content (`text_delta`, `input_json_delta`, `thinking_delta`)
4. `content_block_stop` — End of content block
5. `message_delta` — Top-level changes (stop_reason, usage)
6. `message_stop` — Stream complete

### cURL Streaming

```bash
curl https://api.anthropic.com/v1/messages \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{
    "model": "claude-opus-4-6",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 256,
    "stream": true
  }'
```

---

## Tool Use

Claude can call tools (functions) you define. Two types: **client tools** (you execute) and **server tools** (Anthropic executes, e.g., web search).

### Defining Tools

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=[{
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"]
        }
    }],
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
)
```

### Tool Use Flow (Client Tools)

1. Send request with `tools` and user message
2. Claude returns `stop_reason: "tool_use"` with a `tool_use` content block
3. Execute the tool on your side
4. Send `tool_result` back in a new `user` message
5. Claude uses the result to form its final response

### Tool Use Response

```json
{
  "stop_reason": "tool_use",
  "content": [
    {"type": "text", "text": "I'll check the weather for you."},
    {
      "type": "tool_use",
      "id": "toolu_01A09q90qw90lq917835lq9",
      "name": "get_weather",
      "input": {"location": "San Francisco, CA"}
    }
  ]
}
```

### Returning Tool Results

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=[...],  # same tools
    messages=[
        {"role": "user", "content": "What's the weather in SF?"},
        {"role": "assistant", "content": [
            {"type": "text", "text": "I'll check..."},
            {"type": "tool_use", "id": "toolu_01A09q90qw90lq917835lq9",
             "name": "get_weather", "input": {"location": "San Francisco, CA"}}
        ]},
        {"role": "user", "content": [
            {"type": "tool_result",
             "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
             "content": "65°F, sunny"}
        ]}
    ],
)
```

### Tool Choice Options

| Type | Description |
|------|-------------|
| `{"type": "auto"}` | Claude decides whether to use tools (default) |
| `{"type": "any"}` | Claude must use one of the provided tools |
| `{"type": "tool", "name": "..."}` | Claude must use the specified tool |
| `{"type": "none"}` | Claude won't use tools |

### Server Tools (Web Search)

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    messages=[{"role": "user", "content": "What's the latest news on AI?"}],
)
```

Web search: **$10 per 1,000 searches** + standard token costs.
Web fetch: **No additional cost** beyond tokens.

### Strict Tool Use (Structured Outputs)

Add `strict: true` to guarantee schema validation on tool inputs:

```json
{
  "name": "get_weather",
  "strict": true,
  "input_schema": { ... }
}
```

---

## Vision (Images)

Claude accepts images via base64 encoding or URL. Supports JPEG, PNG, GIF, WebP.

### Limits

- Up to 100 images per API request (20 on claude.ai)
- Max 8000x8000 px per image (2000x2000 if >20 images)
- Optimal: resize to max 1568px on longest edge
- Token cost: `tokens = (width * height) / 750`

### Base64 Image

```python
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": image_data,  # base64-encoded string
                },
            },
            {"type": "text", "text": "Describe this image."},
        ],
    }],
)
```

### URL Image

```python
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": "https://example.com/image.jpg",
                },
            },
            {"type": "text", "text": "What's in this image?"},
        ],
    }],
)
```

---

## Structured Outputs

Guarantee valid JSON responses matching a schema via constrained decoding.

### JSON Schema Output

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Extract info: John Smith (john@example.com) wants Enterprise plan."}],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan": {"type": "string"},
                },
                "required": ["name", "email", "plan"],
                "additionalProperties": False,
            },
        }
    },
)
# Response: {"name": "John Smith", "email": "john@example.com", "plan": "Enterprise"}
```

### With Pydantic (Python SDK)

```python
from pydantic import BaseModel
from anthropic import Anthropic

class ContactInfo(BaseModel):
    name: str
    email: str
    plan_interest: str

client = Anthropic()
# Use with .parse() for automatic validation
```

### With Zod (TypeScript SDK)

```typescript
import { z } from "zod";
// Use with client.messages.create() and zod schema
```

### Output Format Options

| Type | Description |
|------|-------------|
| `json_schema` | Strict JSON matching a provided schema |
| `text` | Default text output |

---

## Extended Thinking

Enhanced reasoning for complex tasks. Claude shows its step-by-step thought process.

### Supported Models

All current models except Haiku 3. For Opus 4.6, use **adaptive thinking** (`type: "adaptive"`) instead of manual mode.

### Basic Usage

```python
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "Prove there are infinite primes where n mod 4 == 3."}],
)

for block in response.content:
    if block.type == "thinking":
        print(f"Thinking: {block.thinking}")
    elif block.type == "text":
        print(f"Response: {block.text}")
```

### Adaptive Thinking (Opus 4.6 recommended)

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    messages=[{"role": "user", "content": "Solve this complex problem..."}],
)
```

### Key Points

- `budget_tokens` must be < `max_tokens`
- Claude 4 models return **summarized** thinking (charged for full tokens, not summary)
- Claude Sonnet 3.7 returns full thinking output
- With tool use: only `tool_choice: auto` or `none` is supported
- When using tools with thinking, pass `thinking` blocks back to the API for the last assistant message
- Cannot toggle thinking mid-turn (during tool use loops)

### Response Format

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me analyze this step by step...",
      "signature": "EqQBCgIYAhIM..."
    },
    {
      "type": "text",
      "text": "Based on my analysis..."
    }
  ]
}
```

---

## Prompt Caching

Cache repeated content (system prompts, documents, tool definitions) to reduce cost and latency.

### How to Use

Add `cache_control` to content blocks you want cached:

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system=[
        {"type": "text", "text": "You are an expert analyst."},
        {
            "type": "text",
            "text": "<large document content here>",
            "cache_control": {"type": "ephemeral"}  # default 5-min TTL
        }
    ],
    messages=[{"role": "user", "content": "Summarize the document."}],
)
```

### Key Rules

- Cache hierarchy: `tools` → `system` → `messages`
- Default TTL: 5 minutes (refreshed on use). Optional 1-hour TTL available
- Min cacheable tokens: 4096 (Opus 4.6, Opus 4.5, Haiku 4.5), 1024 (Sonnet 4.5, Opus 4.1, Opus 4, Sonnet 4)
- Up to 4 cache breakpoints per request
- 20-block lookback window for automatic prefix checking
- Cache reads are 10% of base input price

### 1-Hour Cache

```json
"cache_control": {"type": "ephemeral", "ttl": "1h"}
```

### Tracking Cache Performance

Response `usage` fields:
- `cache_creation_input_tokens` — tokens written to cache
- `cache_read_input_tokens` — tokens read from cache
- `input_tokens` — uncached tokens (after last breakpoint)

```
total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
```

---

## Batch Processing

Process large volumes of requests asynchronously at 50% discount.

### Create a Batch

```python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-opus-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Hello"}]
            }
        },
        # ... more requests
    ]
)
```

### Batch Limits

| Tier | Max RPM | Max Requests in Queue | Max per Batch |
|------|---------|----------------------|---------------|
| 1 | 50 | 100,000 | 100,000 |
| 2 | 1,000 | 200,000 | 100,000 |
| 3 | 2,000 | 300,000 | 100,000 |
| 4 | 4,000 | 500,000 | 100,000 |

---

## Errors

### HTTP Error Codes

| Code | Type | Description |
|------|------|-------------|
| 400 | `invalid_request_error` | Bad request format or content |
| 401 | `authentication_error` | Invalid API key |
| 403 | `permission_error` | Insufficient permissions |
| 404 | `not_found_error` | Resource not found |
| 413 | `request_too_large` | Exceeds max request size |
| 429 | `rate_limit_error` | Rate limit hit |
| 500 | `api_error` | Internal server error |
| 529 | `overloaded_error` | API temporarily overloaded |

### Request Size Limits

| Endpoint | Max Size |
|----------|----------|
| Messages API | 32 MB |
| Token Counting API | 32 MB |
| Batch API | 256 MB |
| Files API | 500 MB |

### Error Response Format

```json
{
  "type": "error",
  "error": {
    "type": "not_found_error",
    "message": "The requested resource could not be found."
  },
  "request_id": "req_011CSHoEeqs5C35K2UUqR7Fy"
}
```

### Request ID

Every response includes a `request-id` header. Access via SDKs:

```python
print(f"Request ID: {message._request_id}")
```

### Breaking Changes (Opus 4.6)

- **Prefill removal:** Prefilling assistant messages returns 400 error. Use structured outputs or system prompts instead.

---

## Rate Limits

Measured in RPM (requests/min), ITPM (input tokens/min), OTPM (output tokens/min).

### Rate Limits by Tier

| Tier | Opus 4.x RPM | Opus 4.x ITPM | Opus 4.x OTPM | Sonnet 4.x RPM | Haiku 4.5 RPM |
|------|-------------|---------------|---------------|----------------|---------------|
| 1 | 50 | 30,000 | 8,000 | 50 | 50 |
| 2 | 1,000 | 450,000 | 90,000 | 1,000 | 1,000 |
| 3 | 2,000 | 800,000 | 160,000 | 2,000 | 2,000 |
| 4 | 4,000 | 2,000,000 | 400,000 | 4,000 | 4,000 |

### Tier Requirements

| Tier | Credit Purchase | Max Credit Purchase |
|------|----------------|-------------------|
| 1 | $5 | $100 |
| 2 | $40 | $500 |
| 3 | $200 | $1,000 |
| 4 | $400 | $5,000 |

### Cache-Aware ITPM

Only **uncached input tokens** count toward ITPM limits for most models:
- `input_tokens` + `cache_creation_input_tokens` → count toward ITPM
- `cache_read_input_tokens` → do NOT count toward ITPM

This means prompt caching effectively multiplies your throughput.

### Rate Limit Response Headers

| Header | Description |
|--------|-------------|
| `retry-after` | Seconds to wait before retrying |
| `anthropic-ratelimit-requests-limit` | Max requests in period |
| `anthropic-ratelimit-requests-remaining` | Remaining requests |
| `anthropic-ratelimit-tokens-limit` | Max tokens in period |
| `anthropic-ratelimit-tokens-remaining` | Remaining tokens |

### Handling 429 Errors

- Use exponential backoff with jitter
- Check `retry-after` header
- Reduce `max_tokens` if hitting OTPM limits
- Use prompt caching to reduce ITPM usage
- Ramp up traffic gradually to avoid acceleration limits

---

## Quick Reference: Common Patterns

### Simple Text Generation

```python
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain quantum computing in simple terms."}],
)
```

### With System Prompt + Streaming

```python
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=2048,
    system="You are a concise technical writer.",
    messages=[{"role": "user", "content": "Explain REST APIs."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### JSON Output

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    output_config={"format": {"type": "json_schema", "schema": {
        "type": "object",
        "properties": {"summary": {"type": "string"}, "key_points": {"type": "array", "items": {"type": "string"}}},
        "required": ["summary", "key_points"],
        "additionalProperties": False,
    }}},
    messages=[{"role": "user", "content": "Summarize the benefits of exercise."}],
)
```

### Image Analysis

```python
import base64, httpx

image_data = base64.b64encode(httpx.get("https://example.com/chart.png").content).decode()

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
        {"type": "text", "text": "Analyze this chart."},
    ]}],
)
```

### Tool Use Loop

```python
import anthropic, json

client = anthropic.Anthropic()
tools = [{
    "name": "get_weather",
    "description": "Get weather for a location",
    "input_schema": {
        "type": "object",
        "properties": {"location": {"type": "string"}},
        "required": ["location"]
    }
}]

messages = [{"role": "user", "content": "What's the weather in Tokyo?"}]

# Step 1: Initial request
response = client.messages.create(model="claude-opus-4-6", max_tokens=1024, tools=tools, messages=messages)

# Step 2: Process tool calls
if response.stop_reason == "tool_use":
    tool_block = next(b for b in response.content if b.type == "tool_use")
    # Execute your tool
    result = "72°F, partly cloudy"

    # Step 3: Send result back
    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": tool_block.id, "content": result}
    ]})

    # Step 4: Get final response
    final = client.messages.create(model="claude-opus-4-6", max_tokens=1024, tools=tools, messages=messages)
    print(final.content[0].text)
```

---

## Additional Resources

- **Console**: https://platform.claude.com
- **API Status**: https://status.claude.com
- **Cookbooks**: https://platform.claude.com/cookbooks
- **Help Center**: https://support.claude.com
- **Discord**: https://www.anthropic.com/discord
