#!/bin/bash
# Tavily Crawl Script
# Usage: ./crawl.sh "url" [max_depth] [limit] [instructions]

URL="$1"
MAX_DEPTH="${2:-2}"
LIMIT="${3:-20}"
INSTRUCTIONS="$4"

if [ -z "$TAVILY_API_KEY" ]; then
  echo "Error: TAVILY_API_KEY environment variable is not set"
  echo "Get your API key at: https://app.tavily.com"
  exit 1
fi

if [ -z "$URL" ]; then
  echo "Usage: ./crawl.sh \"url\" [max_depth] [limit] [instructions]"
  echo "  max_depth: 1-5 (default: 2)"
  echo "  limit: total links to process (default: 20)"
  echo "  instructions: natural language instructions (optional)"
  exit 1
fi

if [ -n "$INSTRUCTIONS" ]; then
  curl -s -X POST https://api.tavily.com/crawl \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -d "{
      \"url\": \"$URL\",
      \"max_depth\": $MAX_DEPTH,
      \"limit\": $LIMIT,
      \"instructions\": \"$INSTRUCTIONS\",
      \"format\": \"markdown\"
    }"
else
  curl -s -X POST https://api.tavily.com/crawl \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -d "{
      \"url\": \"$URL\",
      \"max_depth\": $MAX_DEPTH,
      \"limit\": $LIMIT,
      \"format\": \"markdown\"
    }"
fi
