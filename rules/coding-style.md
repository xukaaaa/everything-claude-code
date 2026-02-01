# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large components
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Input Validation

ALWAYS validate user input:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)

## Documentation Policy

**NEVER create markdown guides, tutorials, or documentation files unless explicitly requested by user.**

### What NOT to Create

Do not create these files without user request:
- README.md, GUIDE.md, TUTORIAL.md, HOW-TO.md
- Setup instructions or architecture documentation
- API documentation (unless part of code comments)
- Troubleshooting guides or best practices documents
- Any .md/.txt files for explanation/guidance

### What IS Allowed

Create these without user request:
- Code comments (inline, JSDoc, TypeDoc)
- Type definitions and interfaces
- Error messages in code
- Configuration files (JSON, YAML, etc.)
- Test files with descriptive names

### When User Requests Documentation

If user explicitly says:
- "Create a README"
- "Write a guide for..."
- "Document this feature"
- "Add setup instructions"

Then create the markdown file. Otherwise, do not create it.
