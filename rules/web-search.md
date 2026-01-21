# Web Search Rule

## Quy tắc bắt buộc

**KHÔNG SỬ DỤNG** các tools sau để tìm kiếm/fetch web:
- ❌ `webfetch` tool
- ❌ `WebFetch` tool
- ❌ Bất kỳ built-in web fetching tool nào

**THAY THẾ BẰNG** `web-search` skill:
- ✅ Sử dụng Tavily Search API
- ✅ Sử dụng Tavily Extract API
- ✅ Sử dụng Tavily Crawl API
- ✅ Sử dụng Tavily Map API

## Lý do

1. **Consistency**: Tất cả web requests đi qua một API thống nhất
2. **Cost tracking**: Dễ theo dõi API credits usage
3. **Better results**: Tavily optimized cho AI/LLM use cases
4. **Rate limiting**: Tránh bị block bởi websites

## Cách sử dụng

### Thay vì dùng webfetch:
```bash
# ❌ KHÔNG LÀM:
# webfetch("https://docs.example.com")

# ✅ LÀM:
curl -X POST https://api.tavily.com/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"urls": ["https://docs.example.com"], "format": "markdown"}'
```

### Thay vì search Google:
```bash
# ✅ Dùng Tavily Search:
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d '{"query": "your search query", "include_answer": true}'
```

## Khi nào áp dụng

- Khi user yêu cầu tìm kiếm trên web
- Khi cần đọc nội dung từ URL
- Khi cần research thông tin online
- Khi cần crawl/map website

## Không có Exception

Quy tắc này **KHÔNG CÓ NGOẠI LỆ**. Luôn sử dụng `web-search` skill.

Nếu `TAVILY_API_KEY` chưa được set, yêu cầu user set up trước khi thực hiện web search.
