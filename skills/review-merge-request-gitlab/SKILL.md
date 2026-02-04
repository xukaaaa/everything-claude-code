---
name: review-merge-request-gitlab
description: Review merge requests using GitLab MCP integration. Use when asked to review MR from GitLab with MCP tools available.
---

# Review Merge Request Skill (GitLab MCP)

This skill provides a comprehensive approach to reviewing Merge Requests using GitLab MCP integration.

## When to Activate

- Reviewing a merge request from GitLab
- User provides MR URL or MR ID
- GitLab MCP tools are available
- User mentions "review MR from GitLab", "check MR #123"

## Review Workflow

1. **Fetch MR from GitLab MCP** (default):
   - Get MR details (title, description, author, labels)
   - Get MR changes (diffs)

2. **Optional** (only if user requests):
   - Get MR commits

3. **Begin systematic review**

## GitLab MCP Commands

```
# Get MR details (always)
mcp__gitlab__get_merge_request(project_id, mr_iid)

# Get MR changes/diffs (always)
mcp__gitlab__get_merge_request_changes(project_id, mr_iid)

# Get MR commits (only if user requests)
mcp__gitlab__list_merge_request_commits(project_id, mr_iid)
```

Adjust tool names based on your actual GitLab MCP configuration.

## Review Checklist

### 1. Understand Context (CRITICAL)

- [ ] What is the purpose of this MR?
- [ ] What ticket/issue does it address?
- [ ] Does the implementation match the stated goal?
- [ ] Are there any missing requirements?

### 2. Code Changes (CRITICAL)

- [ ] **Logic correctness**: Trace main flows + edge cases
- [ ] **Naming**: Functions, variables, classes are descriptive
- [ ] **Error handling**: Try/catch, fail gracefully, proper error messages
- [ ] **Edge cases**: Null, empty, boundary values handled

### 3. Security (CRITICAL)

- [ ] **Secrets**: No hardcoded API keys, passwords, tokens
- [ ] **Input validation**: All user inputs validated
- [ ] **SQL injection**: No string concatenation in queries
- [ ] **XSS**: User input properly escaped
- [ ] **Auth/Authz**: Proper authentication and authorization checks
- [ ] **Sensitive data**: No logging of PII, tokens, passwords

### 4. Performance (HIGH)

- [ ] **N+1 queries**: Database calls inside loops
- [ ] **Algorithm complexity**: O(n²) when O(n log n) possible
- [ ] **Memory leaks**: Unclosed connections, missing cleanup
- [ ] **Unnecessary loops**: Can be optimized or removed
- [ ] **Caching**: Expensive operations cached appropriately

### 5. Breaking Changes (HIGH)

- [ ] **Backward compatibility**: Does it break existing APIs?
- [ ] **Database migrations**: Safe to run? Reversible?
- [ ] **Config changes**: New env vars documented?
- [ ] **Dependencies**: Version bumps breaking?

### 6. Conventions (MEDIUM)

- [ ] **Code style**: Consistent with codebase
- [ ] **Patterns**: Following existing patterns
- [ ] **File structure**: Files in correct locations
- [ ] **Readability**: Easy to understand and maintain

## Issue Priority Levels

| Priority | Description | Action |
|----------|-------------|--------|
| **CRITICAL** | Security vulnerabilities, data loss | Must fix before merge |
| **HIGH** | Logic errors, breaking changes | Should fix before merge |
| **MEDIUM** | Performance issues, style violations | Consider fixing |
| **LOW** | Minor improvements, suggestions | Optional |

## Output Format

### MR Info

| Field | Value |
|-------|-------|
| Title | {from MCP} |
| Author | {from MCP} |
| Target Branch | {from MCP} |
| Files Changed | {count} |

### Issues Found

For each issue:

```
[CRITICAL|HIGH|MEDIUM|LOW] Issue title
File: path/to/file.ts:42
Issue: Description of the problem
Fix: How to fix it

// ❌ Current code
const bad = "example";

// ✅ Suggested fix  
const good = "example";
```

### Checklist Results

- [ ] Context understood
- [ ] Logic correct
- [ ] Security checked
- [ ] Performance reviewed
- [ ] Breaking changes assessed
- [ ] Conventions followed

### Verdict

- ✅ **APPROVE**: No CRITICAL or HIGH issues
- ⚠️ **REQUEST CHANGES**: HIGH issues found (fix before merge)
- ❌ **BLOCK**: CRITICAL issues found (must fix)

### Questions for Author

List any clarifying questions about implementation decisions.
