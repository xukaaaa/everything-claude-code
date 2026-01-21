---
name: web-search
description: Search the web using Tavily API. Use when user asks to search online, find latest information, research topics, crawl websites, or needs real-time data from the internet.
allowed-tools: Bash
---

# Web Search Skill (Tavily API)

Tìm kiếm và trích xuất thông tin từ web sử dụng Tavily API.

## Khi nào sử dụng

- User yêu cầu tìm kiếm trên web/internet
- Cần thông tin mới nhất, real-time
- Research topics, news, hoặc thông tin không có trong codebase
- Crawl/map website để lấy structure hoặc content
- User hỏi "search for...", "find online...", "look up...", "crawl..."

---

## API 1: Search (Tìm kiếm web)

Tìm kiếm thông tin trên web với AI-powered ranking.

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{
    "query": "$ARGUMENTS",
    "search_depth": "basic",
    "max_results": 5,
    "include_answer": true
  }'
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `query` | string | required | Search query |
| `search_depth` | enum | `basic` | `basic` (1 credit), `advanced` (2 credits), `fast`, `ultra-fast` |
| `max_results` | int | 5 | 1-20 results |
| `include_answer` | bool | false | LLM-generated answer |
| `topic` | enum | `general` | `general`, `news`, `finance` |
| `time_range` | enum | - | `day`, `week`, `month`, `year` |
| `include_domains` | array | - | Filter specific domains |
| `exclude_domains` | array | - | Exclude specific domains |
| `country` | string | - | Boost results from specific country |

**Response:**
```json
{
  "query": "search query",
  "answer": "LLM-generated summary",
  "results": [
    {
      "title": "Page title",
      "url": "https://...",
      "content": "Snippet content",
      "score": 0.85
    }
  ],
  "response_time": "1.67"
}
```

---

## API 2: Extract (Trích xuất nội dung từ URL)

Trích xuất và parse nội dung từ một hoặc nhiều URLs.

```bash
curl -X POST https://api.tavily.com/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{
    "urls": ["https://example.com/article"],
    "extract_depth": "basic",
    "format": "markdown"
  }'
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `urls` | string/array | required | URL hoặc array URLs |
| `extract_depth` | enum | `basic` | `basic` (1 credit/5 URLs), `advanced` (2 credits/5 URLs) |
| `format` | enum | `markdown` | `markdown` hoặc `text` |
| `query` | string | - | Rerank chunks based on relevance to query |
| `chunks_per_source` | int | 3 | 1-5, only when query provided |
| `timeout` | float | - | 1-60 seconds |

**Response:**
```json
{
  "results": [
    {
      "url": "https://...",
      "raw_content": "Extracted markdown content...",
      "images": [],
      "favicon": "https://..."
    }
  ],
  "failed_results": [],
  "response_time": 0.02
}
```

---

## API 3: Crawl (Crawl website với extraction)

Graph-based website traversal với built-in extraction.

```bash
curl -X POST https://api.tavily.com/crawl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{
    "url": "https://docs.example.com",
    "max_depth": 2,
    "limit": 20,
    "instructions": "Find all API documentation pages"
  }'
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | string | required | Root URL to crawl |
| `instructions` | string | - | Natural language instructions (2 credits/10 pages if used) |
| `max_depth` | int | 1 | 1-5, how far from base URL |
| `max_breadth` | int | 20 | Links per page |
| `limit` | int | 50 | Total links to process |
| `select_paths` | array | - | Regex patterns to include paths |
| `exclude_paths` | array | - | Regex patterns to exclude paths |
| `select_domains` | array | - | Regex patterns for domains |
| `exclude_domains` | array | - | Regex patterns to exclude domains |
| `allow_external` | bool | true | Include external links |
| `extract_depth` | enum | `basic` | `basic` or `advanced` |
| `format` | enum | `markdown` | `markdown` or `text` |
| `timeout` | float | 150 | 10-150 seconds |

**Response:**
```json
{
  "base_url": "docs.example.com",
  "results": [
    {
      "url": "https://docs.example.com/api",
      "raw_content": "Extracted content...",
      "favicon": "https://..."
    }
  ],
  "response_time": 1.23
}
```

---

## API 4: Map (Tạo sitemap)

Traverses website để tạo comprehensive site map (chỉ URLs, không extract content).

```bash
curl -X POST https://api.tavily.com/map \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{
    "url": "https://docs.example.com",
    "max_depth": 2,
    "limit": 50
  }'
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | string | required | Root URL to map |
| `instructions` | string | - | Natural language instructions (2 credits/10 pages if used) |
| `max_depth` | int | 1 | 1-5, how far from base URL |
| `max_breadth` | int | 20 | Links per page |
| `limit` | int | 50 | Total links to process |
| `select_paths` | array | - | Regex patterns to include |
| `exclude_paths` | array | - | Regex patterns to exclude |
| `allow_external` | bool | true | Include external links |
| `timeout` | float | 150 | 10-150 seconds |

**Response:**
```json
{
  "base_url": "docs.example.com",
  "results": [
    "https://docs.example.com/welcome",
    "https://docs.example.com/api",
    "https://docs.example.com/guides"
  ],
  "response_time": 1.23
}
```

---

## Workflow

1. **Nhận query từ user** ($ARGUMENTS)
2. **Chọn API phù hợp:**
   - Tìm kiếm thông tin → **Search**
   - Đọc nội dung URL cụ thể → **Extract**
   - Crawl website lấy content → **Crawl**
   - Lấy danh sách URLs của site → **Map**
3. **Execute** với Bash curl command
4. **Parse response** và trình bày kết quả
5. **Nếu cần chi tiết** → dùng Extract cho URLs cụ thể

---

## Credits & Pricing

| API | Cost |
|-----|------|
| Search basic/fast/ultra-fast | 1 credit |
| Search advanced | 2 credits |
| Extract basic | 1 credit / 5 URLs |
| Extract advanced | 2 credits / 5 URLs |
| Crawl/Map | 1 credit / 10 pages |
| Crawl/Map with instructions | 2 credits / 10 pages |

Free tier: **1,000 credits/month**

---

## Environment Variable

```bash
export TAVILY_API_KEY="tvly-YOUR_API_KEY"
```

Get API key tại: https://app.tavily.com

---

## Ví dụ sử dụng

**Basic search:**
```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"query": "latest React 19 features", "include_answer": true, "max_results": 5}'
```

**News search:**
```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"query": "AI news today", "topic": "news", "time_range": "day", "include_answer": true}'
```

**Extract documentation:**
```bash
curl -X POST https://api.tavily.com/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"urls": ["https://react.dev/learn"], "format": "markdown"}'
```

**Crawl docs site:**
```bash
curl -X POST https://api.tavily.com/crawl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"url": "https://docs.python.org", "max_depth": 2, "limit": 20, "instructions": "Find tutorial pages"}'
```

**Map website structure:**
```bash
curl -X POST https://api.tavily.com/map \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"url": "https://example.com", "max_depth": 3, "limit": 100}'
```
