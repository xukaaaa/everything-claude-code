#!/bin/bash
# Tavily Search Script
# Usage: ./search.sh "query" [options]

QUERY="$1"
SEARCH_DEPTH="${2:-basic}"
MAX_RESULTS="${3:-5}"
TOPIC="${4:-general}"

if [ -z "$TAVILY_API_KEY" ]; then
  echo "Error: TAVILY_API_KEY environment variable is not set"
  echo "Get your API key at: https://app.tavily.com"
  exit 1
fi

if [ -z "$QUERY" ]; then
  echo "Usage: ./search.sh \"query\" [search_depth] [max_results] [topic]"
  echo "  search_depth: basic (default), advanced, fast, ultra-fast"
  echo "  max_results: 1-20 (default: 5)"
  echo "  topic: general (default), news, finance"
  exit 1
fi

curl -s -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TAVILY_API_KEY" \
  -d "{
    \"query\": \"$QUERY\",
    \"search_depth\": \"$SEARCH_DEPTH\",
    \"max_results\": $MAX_RESULTS,
    \"topic\": \"$TOPIC\",
    \"include_answer\": true
  }"
