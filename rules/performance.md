# Performance Optimization

## Model Selection Strategy

**Haiku 4.5** (90% of Sonnet capability, 3x cost savings):
- Lightweight agents with frequent invocation
- Pair programming and code generation
- Worker agents in multi-agent systems
- **Explore subagent** (built-in, uses Haiku)

**Sonnet 4.5** (Best coding model):
- Main development work
- Orchestrating multi-agent workflows
- Complex coding tasks

**Opus 4.5** (Deepest reasoning):
- Complex architectural decisions
- Maximum reasoning requirements
- Research and analysis tasks

## Context Window Management

### Critical: Use Explore Subagent for Codebase Scanning

**Problem**: Direct use of Grep/Glob/Read fills main context rapidly
**Solution**: Delegate to Explore subagent (keeps results out of main context)

### Context Consumption Comparison

```markdown
# Direct Scanning (BAD - fills context)
Grep pattern="authentication" → 2000 tokens
Glob pattern="**/*.ts" → 1500 tokens
Read multiple files → 5000+ tokens
Total: 8500+ tokens in main context

# Explore Subagent (GOOD - preserves context)
Task(subagent_type: "Explore", prompt: "Find auth patterns")
→ Only summary returned: ~500 tokens in main context
→ Savings: 8000 tokens (94% reduction!)
```

### When to Use Explore

**ALWAYS use Explore for:**
- Initial codebase exploration
- Finding files/patterns across project
- Understanding project structure
- Multi-location searches
- Pattern discovery

**Use direct tools (Read/Grep/Glob) only for:**
- Reading specific known files
- Quick single-file lookups
- After Explore has identified targets

### Explore Thoroughness Strategy

```typescript
// Quick (100-500 tokens): Specific lookups
"Find UserAuth component. Thoroughness: quick"

// Medium (500-1500 tokens): Balanced exploration
"How are API routes structured? Thoroughness: medium"

// Very thorough (1500-3000 tokens): Comprehensive
"Analyze entire auth system. Thoroughness: very thorough"
```

### Context Window Thresholds

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

### Context Preservation Best Practices

1. **Start with Explore**: Let Explore scan, then use Read for specific files
2. **Batch operations**: Group related searches in one Explore call
3. **Use thoroughness wisely**: Start with "quick", escalate if needed
4. **Parallel Explore agents**: Run multiple Explore agents in parallel for independent searches
5. **Avoid redundant scans**: Cache Explore results mentally, don't re-scan

### Example: Efficient Workflow

```markdown
# BAD: Sequential direct scanning
1. Grep "API endpoint" → 2000 tokens
2. Glob "**/*route*" → 1500 tokens
3. Read 5 files → 5000 tokens
4. Grep "middleware" → 2000 tokens
Total: 10,500 tokens

# GOOD: Single Explore delegation
1. Task(Explore, "Find all API endpoints, routes, and middleware. Thoroughness: medium")
   → 800 tokens (summary only)
2. Read specific files identified by Explore → 2000 tokens
Total: 2,800 tokens (73% savings!)
```

## Ultrathink + Plan Mode

For complex tasks requiring deep reasoning:
1. Use `ultrathink` for enhanced thinking
2. Enable **Plan Mode** for structured approach
3. "Rev the engine" with multiple critique rounds
4. Use split role sub-agents for diverse analysis

## Build Troubleshooting

If build fails:
1. Use **build-error-resolver** agent
2. Analyze error messages
3. Fix incrementally
4. Verify after each fix
