---
description: Generate release notes from task list and update CHANGELOG.md
---

# Release Notes Command

Automate the release notes workflow: create branch, update CHANGELOG.md with new tasks, and commit.

## What This Command Does

1. **Parse version** - Extract version number from user input
2. **Parse task list** - Parse tasks from Excel/table format (name, description, date, version)
3. **Create release branch** - Checkout new branch `release-notes/v{version}` from `origin/root`
4. **Update CHANGELOG** - Read existing CHANGELOG.md and insert new version section
5. **Review changes** - Show diff for user confirmation
6. **Commit** - Create commit with message `chore: release notes v{version}`

## When to Use

Use `/release-notes` when:
- Releasing a new version and need to document changes
- Have a list of completed tasks from Excel/project management tool
- Want to automate the branch creation and commit workflow
- Need consistent CHANGELOG format across releases

## How It Works

1. **Read CHANGELOG.md first** (CRITICAL)
   - Analyze existing format, structure, categories
   - Detect version header style, date format
   - Learn task entry format and categorization pattern

2. **Git Operations**
   - Verify working tree is clean (warn if dirty)
   - Fetch latest from origin
   - Create and checkout branch: `release-notes/v{version}`

3. **Parse Tasks**
   - Accept any format from user (table, list, raw paste from Excel)
   - AI will intelligently extract: Task ID, Description, Date
   - Categorize based on existing CHANGELOG categories

4. **Update CHANGELOG.md**
   - Generate new version section matching existing format
   - Insert after header, before previous versions

5. **Review & Commit**
   - Show diff for user review
   - On confirmation, stage and commit changes

## Input Format

AI accepts **any reasonable format**. Just paste your task list:

```
TASK-001 | Thêm tính năng login | 2026-01-20 | 1.2.0
TASK-002 | Fix bug checkout | 2026-01-21 | 1.2.0
```

Or from Excel (tab-separated):
```
TASK-001	Thêm tính năng login	2026-01-20	1.2.0
TASK-002	Fix bug checkout	2026-01-21	1.2.0
```

Or simple list:
```
- TASK-001: Add user login feature (2026-01-20)
- TASK-002: Fix checkout bug (2026-01-21)
```

**No strict format required** - AI will parse intelligently.

## Output Format

**Follow existing CHANGELOG.md format** - AI will read the current file and match its style:
- Header format (h1, h2)
- Version section format
- Task entry format
- Date format
- Categorization style (if any)

## Example Usage

```
User: /release-notes v1.2.0

TASK-001 | Thêm tính năng login | 2026-01-20 | 1.2.0
TASK-002 | Fix bug checkout | 2026-01-21 | 1.2.0
TASK-003 | Update UI dashboard | 2026-01-22 | 1.2.0

Agent:
1. ✅ Read CHANGELOG.md, detected format & categories
2. ✅ Parsed version: 1.2.0
3. ✅ Parsed 3 tasks
4. ✅ Created branch: release-notes/v1.2.0

📝 CHANGELOG.md changes (following existing format):
[Shows diff matching current CHANGELOG style]

Confirm commit? [Y/n]

User: Y

Agent:
5. ✅ Updated CHANGELOG.md
6. ✅ Committed: chore: release notes v1.2.0

Done! Ready for review.
```

## Task Categorization

**Learn from existing CHANGELOG** - AI will detect and reuse categories from previous versions:
- If CHANGELOG uses `### Features`, `### Bug Fixes` → follow that
- If CHANGELOG uses different categories → match them
- If no categories exist → list tasks without categorization

## Configuration

Default values (can be overridden):

| Config | Default | Description |
|--------|---------|-------------|
| `base_branch` | `origin/root` | Branch to create release from |
| `branch_prefix` | `release-notes/v` | Prefix for release branch |
| `changelog_path` | `CHANGELOG.md` | Path to changelog file |
| `commit_message` | `chore: release notes v{version}` | Commit message template |

## Edge Cases

| Case | Handling |
|------|----------|
| Working tree dirty | Warn user, suggest stash/commit first |
| Branch already exists | Ask user: checkout existing or create new with suffix |
| Version already in CHANGELOG | Ask user: merge tasks or replace section |
| Parse error | Show error, ask user to reformat input |

## Important Notes

**CRITICAL**: CHANGELOG.md must exist in the repository. This command does not create new changelog files.

- Always review the generated diff before confirming commit
- Branch is created from `origin/root` by default - ensure this branch exists

## Integration with Other Commands

- Use `/plan` before implementation to plan version scope
- Use `/code-review` after merging release notes to verify

## Workflow Summary

```
origin/root
    │
    ├── git checkout -b release-notes/v1.2.0
    │
    ├── Update CHANGELOG.md
    │
    └── git commit -m "chore: release notes v1.2.0"
```
