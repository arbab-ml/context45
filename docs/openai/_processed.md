# OpenAI API — Condensed Reference

## 1. Authentication & Setup

```bash
# Set API key as environment variable
export OPENAI_API_KEY="your_api_key_here"
```

- **Base URL (Responses API):** `https://api.openai.com/v1/responses`
- **Base URL (Chat Completions):** `https://api.openai.com/v1/chat/completions`
- **Auth Header:** `Authorization: Bearer $OPENAI_API_KEY`

All SDKs auto-read `OPENAI_API_KEY` from environment.

---

## 2. Models & Pricing

### Flagship Models (GPT-5 Family — Reasoning)

| Model | Best For | Context | Reasoning |
|-------|----------|---------|-----------|
| `gpt-5.2` | Complex reasoning, broad knowledge, coding, multi-step agentic tasks | 1M tokens | `none`/`low`/`medium`/`high`/`xhigh` |
| `gpt-5.2-pro` | Hardest problems requiring extended thinking | 1M tokens | `low`/`medium`/`high`/`xhigh` |
| `gpt-5.2-codex` | Interactive coding products, full-spectrum coding | 1M tokens | `none`/`low`/`medium`/`high`/`xhigh` |
| `gpt-5-mini` | Cost-optimized reasoning and chat | 1M tokens | `low`/`medium`/`high` |
| `gpt-5-nano` | High-throughput, simple tasks, classification | 1M tokens | `low`/`medium`/`high` |

### Non-Reasoning Models (GPT-4 Family)

| Model | Best For | Context |
|-------|----------|---------|
| `gpt-4.1` | Best balance of intelligence, speed, cost | 1M tokens |
| `gpt-4.1-mini` | Fast, cost-effective for simpler tasks | 1M tokens |
| `gpt-4.1-nano` | Fastest, cheapest, simple tasks | 1M tokens |
| `gpt-4o` | Multimodal (text + vision + audio) | 128K tokens |
| `gpt-4o-mini` | Affordable multimodal | 128K tokens |

### Reasoning-Only Models

| Model | Best For | Context |
|-------|----------|---------|
| `o3` | STEM reasoning, coding, complex analysis | 200K tokens |
| `o4-mini` | Fast reasoning, cost-efficient | 200K tokens |

### Image Models

| Model | Capability |
|-------|-----------|
| `gpt-image-1` | Native multimodal image generation |
| `dall-e-3` | Image generation |
| `dall-e-2` | Image generation (legacy) |

### Recommended Starting Points
- **General tasks:** `gpt-4.1`
- **Complex reasoning:** `gpt-5.2` with `reasoning.effort: "medium"`
- **Cost-sensitive:** `gpt-4.1-mini` or `gpt-5-mini`
- **High-throughput:** `gpt-5-nano` or `gpt-4.1-nano`

---

## 3. Client SDKs

### Python
```bash
pip install openai
```
```python
from openai import OpenAI
client = OpenAI()  # reads OPENAI_API_KEY from env

response = client.responses.create(
    model="gpt-5",
    input="Hello, world!"
)
print(response.output_text)
```

### JavaScript/TypeScript
```bash
npm install openai
```
```javascript
import OpenAI from "openai";
const client = new OpenAI();  // reads OPENAI_API_KEY from env

const response = await client.responses.create({
    model: "gpt-5",
    input: "Hello, world!",
});
console.log(response.output_text);
```

### Other Official SDKs
- **.NET:** `dotnet add package OpenAI`
- **Java:** Maven/Gradle — `com.openai:openai-java`
- **Go:** `go get github.com/openai/openai-go`

### cURL
```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5",
    "input": "Hello, world!"
  }'
```

---

## 4. Responses API (Recommended)

The Responses API is the recommended API for all new projects. Reasoning models perform better with the Responses API.

### Basic Request

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="Write a haiku about coding.",
)
print(response.output_text)
```

### With Instructions (System Prompt)

```python
response = client.responses.create(
    model="gpt-5",
    instructions="You are a helpful coding assistant. Be concise.",
    input="How do I reverse a string in Python?",
)
```

### With Message Roles

```python
response = client.responses.create(
    model="gpt-5",
    input=[
        {"role": "developer", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is machine learning?"},
    ],
)
```

**Message role priority:** `developer` > `user` > `assistant`
- `developer`: Application-level instructions (highest priority)
- `user`: End-user input
- `assistant`: Model-generated messages

### Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | **Required.** Model ID (e.g., `"gpt-5"`) |
| `input` | string/array | **Required.** Text string or array of messages |
| `instructions` | string | System-level instructions (high priority) |
| `tools` | array | Available tools (functions, built-in tools) |
| `reasoning` | object | `{"effort": "none"\|"low"\|"medium"\|"high"\|"xhigh"}` |
| `text` | object | `{"format": {...}, "verbosity": "low"\|"medium"\|"high"}` |
| `stream` | boolean | Enable streaming |
| `max_output_tokens` | integer | Max tokens in response (reasoning + output) |
| `temperature` | float | 0-2, randomness (not for reasoning models) |
| `top_p` | float | Nucleus sampling |
| `store` | boolean | Whether to store for later retrieval |
| `previous_response_id` | string | Continue a conversation |
| `prompt_cache_retention` | string | `"in_memory"` or `"24h"` |
| `prompt_cache_key` | string | Custom cache routing key |

### Response Object

```json
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5",
  "output": [
    {
      "id": "msg_abc123",
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Response text here.",
          "annotations": []
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 25,
    "output_tokens": 150,
    "total_tokens": 175,
    "output_tokens_details": {
      "reasoning_tokens": 100
    }
  }
}
```

**Important:** The `output` array can contain multiple items (text, tool calls, reasoning). Use `response.output_text` (SDK convenience) to get aggregated text.

### Conversation State

```python
# Option 1: Use previous_response_id for automatic context
response1 = client.responses.create(
    model="gpt-5",
    input="My name is Alice.",
)

response2 = client.responses.create(
    model="gpt-5",
    input="What's my name?",
    previous_response_id=response1.id,
)

# Option 2: Manually pass conversation history
response = client.responses.create(
    model="gpt-5",
    input=[
        {"role": "user", "content": "My name is Alice."},
        {"role": "assistant", "content": "Hello Alice!"},
        {"role": "user", "content": "What's my name?"},
    ],
)
```

---

## 5. Chat Completions API (Legacy, Still Supported)

```python
response = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
    ],
)
print(response.choices[0].message.content)
```

```javascript
const response = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
    ],
});
console.log(response.choices[0].message.content);
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Chat Completions Response Format

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4.1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30
  }
}
```

**Key difference:** Chat Completions uses `messages` array with `system`/`user`/`assistant` roles. Responses API uses `input` with `developer`/`user`/`assistant` roles.

---

## 6. Reasoning Models

Reasoning models (GPT-5 family, o3, o4-mini) generate internal chain-of-thought tokens before responding. Reasoning tokens are billed as output tokens but not visible in the API response.

### Reasoning Effort

```python
response = client.responses.create(
    model="gpt-5.2",
    reasoning={"effort": "medium"},
    input="Write a bash script that transposes a matrix.",
)
```

| Effort | Description | GPT-5.2 Default |
|--------|-------------|-----------------|
| `none` | No reasoning, lowest latency (GPT-5.2 only) | ✓ (default) |
| `low` | Minimal reasoning, fast | |
| `medium` | Balanced speed and accuracy | |
| `high` | Thorough reasoning for complex tasks | |
| `xhigh` | Maximum reasoning (GPT-5.2 only) | |

### Verbosity Control (GPT-5 Family)

```python
response = client.responses.create(
    model="gpt-5.2",
    input="What is recursion?",
    reasoning={"effort": "low"},
    text={"verbosity": "low"},  # low | medium | high
)
```

### Reasoning Summaries

```python
response = client.responses.create(
    model="gpt-5",
    input="What is the capital of France?",
    reasoning={"effort": "low", "summary": "auto"},
)
```

### Handling Incomplete Responses

```python
response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "medium"},
    input=[{"role": "user", "content": "Complex problem..."}],
    max_output_tokens=300,
)

if response.status == "incomplete":
    reason = response.incomplete_details.reason  # "max_output_tokens"
    if response.output_text:
        print("Partial:", response.output_text)
    else:
        print("Ran out of tokens during reasoning")
```

**Tip:** Reserve at least 25,000 tokens for reasoning + output when starting.

### Reasoning Token Usage

```json
{
  "usage": {
    "input_tokens": 75,
    "output_tokens": 1186,
    "output_tokens_details": {
      "reasoning_tokens": 1024
    },
    "total_tokens": 1261
  }
}
```

---

## 7. Streaming

### Responses API Streaming

```python
stream = client.responses.create(
    model="gpt-5",
    input="Tell me a story.",
    stream=True,
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
```

```javascript
const stream = await client.responses.create({
    model: "gpt-5",
    input: "Tell me a story.",
    stream: true,
});

for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
        process.stdout.write(event.delta);
    }
}
```

### Key Streaming Events

| Event | Description |
|-------|-------------|
| `response.created` | Response object created |
| `response.output_text.delta` | Text chunk received |
| `response.completed` | Generation complete |
| `response.function_call_arguments.delta` | Tool call argument chunk |
| `error` | Error occurred |

### Chat Completions Streaming

```python
stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

---

## 8. Function Calling (Tool Use)

### Define and Use Functions

```python
import json
from openai import OpenAI
client = OpenAI()

# Step 1: Define tools
tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get current weather for a location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country, e.g. 'Paris, France'"
                },
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"]
                }
            },
            "required": ["location", "units"],
            "additionalProperties": False
        },
        "strict": True
    }
]

# Step 2: Send request with tools
input_messages = [
    {"role": "user", "content": "What's the weather in Paris?"}
]

response = client.responses.create(
    model="gpt-5",
    tools=tools,
    input=input_messages,
)

# Step 3: Handle tool calls
input_messages += response.output

for item in response.output:
    if item.type == "function_call":
        # Step 4: Execute function and return result
        args = json.loads(item.arguments)
        result = get_weather(**args)  # your function
        input_messages.append({
            "type": "function_call_output",
            "call_id": item.call_id,
            "output": json.dumps(result)
        })

# Step 5: Get final response
final = client.responses.create(
    model="gpt-5",
    tools=tools,
    input=input_messages,
)
print(final.output_text)
```

### Function Definition Schema

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Always `"function"` |
| `name` | string | Function name (e.g., `"get_weather"`) |
| `description` | string | When/how to use the function |
| `parameters` | object | JSON Schema for input arguments |
| `strict` | boolean | Enforce strict schema adherence |

### Built-in Tools

| Tool Type | Description |
|-----------|-------------|
| `web_search_preview` | Search the web |
| `file_search` | Search uploaded files/vector stores |
| `code_interpreter` | Execute Python code |
| `image_generation` | Generate images with gpt-image-1 |
| `computer_use_preview` | Control computer interfaces (beta) |

```python
# Using web search
response = client.responses.create(
    model="gpt-5",
    tools=[{"type": "web_search_preview"}],
    input="What happened in tech news today?",
)
```

**Important:** When using function calling with reasoning models, pass back all reasoning items from previous responses along with function call outputs.

---

## 9. Structured Outputs

Ensures model responses conform to a JSON Schema.

### With Responses API (Pydantic)

```python
from pydantic import BaseModel
from openai import OpenAI
client = OpenAI()

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

response = client.responses.parse(
    model="gpt-5",
    input="Alice and Bob are going to a conference on Jan 15.",
    text_format=CalendarEvent,
)

for item in response.output:
    if item.type == "message":
        for content in item.content:
            print(content.parsed)  # CalendarEvent object
```

### With Responses API (Zod — JavaScript)

```javascript
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
const client = new OpenAI();

const CalendarEvent = z.object({
    name: z.string(),
    date: z.string(),
    participants: z.array(z.string()),
});

const response = await client.responses.parse({
    model: "gpt-5",
    input: "Alice and Bob are going to a conference on Jan 15.",
    text: { format: zodTextFormat(CalendarEvent, "calendar_event") },
});
```

### JSON Schema via text.format

```python
response = client.responses.create(
    model="gpt-5",
    input="Extract the event details.",
    text={
        "format": {
            "type": "json_schema",
            "strict": True,
            "name": "calendar_event",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "date": {"type": "string"},
                    "participants": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["name", "date", "participants"],
                "additionalProperties": False
            }
        }
    },
)
```

### Handling Refusals

```python
for item in response.output:
    if item.type == "message":
        for content in item.content:
            if content.type == "refusal":
                print("Refused:", content.refusal)
            elif content.parsed:
                print(content.parsed)
```

---

## 10. Vision (Image Analysis)

### Analyze Image by URL

```python
response = client.responses.create(
    model="gpt-4.1-mini",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "What's in this image?"},
            {
                "type": "input_image",
                "image_url": "https://example.com/photo.jpg",
            },
        ],
    }],
)
print(response.output_text)
```

### Analyze Image by Base64

```python
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.responses.create(
    model="gpt-4.1-mini",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Describe this image."},
            {
                "type": "input_image",
                "image_url": f"data:image/jpeg;base64,{b64}",
            },
        ],
    }],
)
```

### Generate Images

```python
response = client.responses.create(
    model="gpt-4.1-mini",
    input="Generate an image of a cat wearing a hat.",
    tools=[{"type": "image_generation"}],
)

import base64
for item in response.output:
    if item.type == "image_generation_call":
        with open("output.png", "wb") as f:
            f.write(base64.b64decode(item.result))
```

---

## 11. Prompt Caching

Automatic for prompts ≥1024 tokens. No code changes needed.

### Benefits
- Up to **80% latency reduction**
- Up to **90% input cost reduction** (cached tokens pricing)
- Works automatically on all recent models (gpt-4o and newer)

### Optimize for Caching
- Place **static content** (instructions, examples) at the **beginning** of prompts
- Place **dynamic content** (user input) at the **end**

### Extended Cache Retention

```python
response = client.responses.create(
    model="gpt-5.1",
    input="Your prompt here...",
    prompt_cache_retention="24h",  # "in_memory" (default) or "24h"
)
```

### Custom Cache Key

```python
response = client.responses.create(
    model="gpt-5.1",
    input="Your prompt here...",
    prompt_cache_key="my-app-v2",  # improve cache routing
)
```

### Monitor Cache Performance

```json
{
  "usage": {
    "prompt_tokens": 2006,
    "completion_tokens": 300,
    "prompt_tokens_details": {
      "cached_tokens": 1920
    }
  }
}
```

---

## 12. Batch API

Process large volumes at 50% cost reduction with 24-hour turnaround.

### Usage

```python
# 1. Create JSONL input file
# Each line: {"custom_id": "req-1", "method": "POST", "url": "/v1/chat/completions", "body": {...}}

# 2. Upload file
file = client.files.create(file=open("batch.jsonl", "rb"), purpose="batch")

# 3. Create batch
batch = client.batches.create(
    input_file_id=file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
)

# 4. Check status
batch = client.batches.retrieve(batch.id)
print(batch.status)  # validating -> in_progress -> completed

# 5. Download results
result_file = client.files.content(batch.output_file_id)
```

---

## 13. Errors & Error Handling

### HTTP Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 401 | Invalid/incorrect API key | Check API key, regenerate if needed |
| 403 | Region not supported | Check supported countries |
| 429 | Rate limit exceeded | Implement backoff, reduce request rate |
| 429 | Quota exceeded | Check billing, upgrade plan |
| 500 | Server error | Retry after brief wait |
| 503 | Server overloaded | Retry with exponential backoff |

### Python SDK Exception Types

| Exception | Cause |
|-----------|-------|
| `APIConnectionError` | Network/proxy/SSL issue |
| `APITimeoutError` | Request timed out |
| `AuthenticationError` | Invalid/expired API key |
| `BadRequestError` | Malformed request |
| `RateLimitError` | Rate limit hit |
| `InternalServerError` | Server-side issue |
| `ConflictError` | Resource update conflict |
| `NotFoundError` | Resource doesn't exist |
| `PermissionDeniedError` | No access to resource |

### Retry with Exponential Backoff

```python
from openai import OpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt

client = OpenAI()

@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def completion_with_backoff(**kwargs):
    return client.responses.create(**kwargs)

response = completion_with_backoff(
    model="gpt-5",
    input="Hello!",
)
```

---

## 14. Rate Limits

- Applied **per organization** and **per project**
- Measured in: **RPM** (requests/min), **TPM** (tokens/min), **RPD** (requests/day)
- Higher tiers unlock higher limits
- Cached tokens still count toward TPM limits
- Check limits at: `platform.openai.com/settings/organization/limits`

---

## 15. Quick Reference Patterns

### Simple Text Generation
```python
response = client.responses.create(model="gpt-5", input="Hello!")
print(response.output_text)
```

### With Reasoning
```python
response = client.responses.create(
    model="gpt-5.2",
    input="Solve this complex problem...",
    reasoning={"effort": "high"},
)
```

### Fast Low-Latency Response
```python
response = client.responses.create(
    model="gpt-5.2",
    input="Quick question?",
    reasoning={"effort": "none"},
    text={"verbosity": "low"},
)
```

### Multi-turn Conversation
```python
r1 = client.responses.create(model="gpt-5", input="Hi, I'm Alice.")
r2 = client.responses.create(
    model="gpt-5",
    input="What's my name?",
    previous_response_id=r1.id,
)
```

### Streaming + Tool Use
```python
stream = client.responses.create(
    model="gpt-5",
    input="Search the web for today's news.",
    tools=[{"type": "web_search_preview"}],
    stream=True,
)
for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="")
```

### Image Analysis + Text
```python
response = client.responses.create(
    model="gpt-4.1-mini",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Describe this."},
            {"type": "input_image", "image_url": "https://example.com/img.jpg"},
        ],
    }],
)
```

### Structured Output
```python
from pydantic import BaseModel

class Summary(BaseModel):
    title: str
    key_points: list[str]
    sentiment: str

response = client.responses.parse(
    model="gpt-5",
    input="Summarize this article: ...",
    text_format=Summary,
)
```

### Chat Completions (Legacy Pattern)
```python
response = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "Hello!"},
    ],
)
print(response.choices[0].message.content)
```

---

## 16. Migration: Chat Completions → Responses API

| Chat Completions | Responses API |
|-----------------|---------------|
| `messages` array | `input` array or string |
| `system` role | `developer` role or `instructions` param |
| `response_format` | `text.format` |
| `response.choices[0].message.content` | `response.output_text` |
| Manual conversation history | `previous_response_id` for auto context |
| `client.chat.completions.create()` | `client.responses.create()` |
| `client.chat.completions.parse()` | `client.responses.parse()` |
