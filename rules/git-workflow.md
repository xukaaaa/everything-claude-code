# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

## Feature Implementation Workflow

1. **Plan First**
   - Use **planner** agent to create implementation plan
   - Identify dependencies and risks
   - Break down into phases

2. **TDD Approach**
   - Use **tdd-guide** agent
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify 80%+ coverage

3. **Code Review**
   - Use **code-reviewer** agent immediately after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format

## Commit & Push Protocol

**CRITICAL: NEVER auto-commit or push without explicit user request.**

### Rules

- **NEVER** commit code without user explicitly requesting it
- **NEVER** push code without user explicitly requesting it
- **NEVER** assume user wants code committed/pushed
- **ALWAYS** ask user before committing/pushing
- **ALWAYS** show what will be committed before doing it
- **ALWAYS** wait for user confirmation

### When to Commit/Push

Only commit/push when:
1. User explicitly says "commit", "push", "merge", etc.
2. User confirms after seeing the diff
3. User approves the commit message

### Workflow

Before committing:
1. Show the diff/changes to user
2. Show the proposed commit message
3. Ask: "Ready to commit and push?"
4. Wait for user confirmation
5. Only then commit and push
