#!/bin/bash
# Tavily Extract Script
# Usage: ./extract.sh "url" [format]

URL="$1"
FORMAT="${2:-markdown}"

if [ -z "$TAVILY_API_KEY" ]; then
  echo "Error: TAVILY_API_KEY environment variable is not set"
  echo "Get your API key at: https://app.tavily.com"
  exit 1
fi

if [ -z "$URL" ]; then
  echo "Usage: ./extract.sh \"url\" [format]"
  echo "  format: markdown (default), text"
  exit 1
fi

curl -s -X POST https://api.tavily.com/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d "{
    \"urls\": [\"$URL\"],
    \"format\": \"$FORMAT\",
    \"extract_depth\": \"basic\"
  }"
