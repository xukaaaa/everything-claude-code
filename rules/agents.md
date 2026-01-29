# Agent Orchestration

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code review | After writing code |
| security-reviewer | Security analysis | Before commits |
| build-error-resolver | Fix build errors | When build fails |
| e2e-runner | E2E testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation | Updating docs |

## Built-in Explore Subagent

**CRITICAL for Context Management**: Use Explore subagent to keep codebase scanning OUT of main conversation context.

### Explore Characteristics
- **Model**: Haiku (fast, low-latency)
- **Tools**: Read-only (Glob, Grep, Read - NO Write/Edit)
- **Purpose**: File discovery, code search, codebase exploration
- **Benefit**: Keeps exploration results out of main context window

### When to Use Explore

**ALWAYS use Explore for:**
1. **Initial codebase scanning** - Finding files, patterns, structure
2. **Multi-location searches** - Searching across multiple directories
3. **Uncertain searches** - When you don't know where code lives
4. **Large-scale analysis** - Understanding project conventions
5. **Pattern discovery** - Finding similar implementations

**DON'T use Explore for:**
- Reading specific files you already know about (use Read directly)
- Making changes (Explore is read-only)
- Single file operations

### Thoroughness Levels

```typescript
// Quick: Targeted lookups (specific file/function names)
Task(subagent_type: "Explore", prompt: "Find the UserAuth component. Thoroughness: quick")

// Medium: Balanced exploration (patterns, conventions)
Task(subagent_type: "Explore", prompt: "How are API routes structured? Thoroughness: medium")

// Very thorough: Comprehensive analysis (full understanding)
Task(subagent_type: "Explore", prompt: "Analyze entire authentication system. Thoroughness: very thorough")
```

### Context Savings Example

```markdown
# BAD: Direct scanning (fills main context)
Grep pattern="API endpoint" path="src/"
Glob pattern="**/*route*.ts"
Read file_path="src/api/users.ts"
Read file_path="src/api/auth.ts"
# Result: 5000+ tokens in main context

# GOOD: Delegate to Explore (keeps context clean)
Task(
  subagent_type: "Explore",
  prompt: "Find all API endpoints and their authentication patterns. Thoroughness: medium"
)
# Result: ~500 tokens in main context (just the summary)
```

## Immediate Agent Usage

No user prompt needed:
1. Complex feature requests - Use **planner** agent (which uses Explore internally)
2. Code just written/modified - Use **code-reviewer** agent (which uses Explore for context)
3. Bug fix or new feature - Use **tdd-guide** agent
4. Architectural decision - Use **architect** agent (which uses Explore internally)

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth.ts
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utils.ts

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
