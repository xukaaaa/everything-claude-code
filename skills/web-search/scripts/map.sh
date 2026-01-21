#!/bin/bash
# Tavily Map Script
# Usage: ./map.sh "url" [max_depth] [limit]

URL="$1"
MAX_DEPTH="${2:-2}"
LIMIT="${3:-50}"

if [ -z "$TAVILY_API_KEY" ]; then
  echo "Error: TAVILY_API_KEY environment variable is not set"
  echo "Get your API key at: https://app.tavily.com"
  exit 1
fi

if [ -z "$URL" ]; then
  echo "Usage: ./map.sh \"url\" [max_depth] [limit]"
  echo "  max_depth: 1-5 (default: 2)"
  echo "  limit: total links to process (default: 50)"
  exit 1
fi

curl -s -X POST https://api.tavily.com/map \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d "{
    \"url\": \"$URL\",
    \"max_depth\": $MAX_DEPTH,
    \"limit\": $LIMIT
  }"
