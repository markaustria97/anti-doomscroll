# 9 — Code Review Simulation

## T — TL;DR

Code review interviews test your ability to **identify bugs, suggest improvements, and communicate clearly** — the skill isn't just finding issues but explaining why they matter and how to fix them.

## K — Key Concepts

### Review This Code

```ts
// api/userController.ts
import { Request, Response } from "express"
import db from "../database"

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email exists" })
    }

    // Create user
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Server error" })
  }
}
```

### Issues Found

```
🔴 CRITICAL:
1. Password stored in PLAINTEXT — must hash with bcrypt
2. SQL injection risk if parameterized queries aren't used properly
3. Raw user input not validated — name/email could be anything
4. Password returned in response (RETURNING *)

🟡 IMPORTANT:
5. No input validation (Zod)
6. console.log(err) loses stack trace — use console.error or logger
7. Generic error response — no error categorization
8. Business logic mixed with HTTP handling (SRP violation)
9. No TypeScript types for request body

🟢 SUGGESTIONS:
10. Use repository pattern for database access
11. Return Result type instead of throwing
12. Add rate limiting for registration endpoint
13. Use branded types for UserId
14. Return only safe fields (not password, internal fields)
```

### How to Communicate Review Findings

```
Structure each comment:
1. WHAT: What's the issue?
2. WHY: Why does it matter?
3. HOW: How to fix it?
4. SEVERITY: Critical / Important / Suggestion

Example:
"The password is stored in plaintext (line 15). This means anyone with 
database access can read all user passwords. Hash with bcrypt before 
storing: `const hashed = await bcrypt.hash(password, 12)`. This is a 
critical security issue that should block merge."
```

### The Corrected Version

```ts
// features/users/user.controller.ts
import { z } from "zod"
import { UserService } from "./user.service"
import type { Request, Response } from "express"

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response) {
    const parsed = CreateUserSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: parsed.error.issues,
      })
    }

    const result = await this.userService.register(parsed.data)

    if (!result.ok) {
      switch (result.error.type) {
        case "duplicate_email":
          return res.status(409).json({ error: "Email already registered" })
        default:
          return res.status(400).json({ error: result.error.message })
      }
    }

    const { password, ...safeUser } = result.value
    res.status(201).json(safeUser)
  }
}
```

## W — Why It Matters

- Code review is a **daily skill** for professional engineers — you'll do it more than coding.
- Review interviews assess judgment: can you prioritize critical issues over style nits?
- Security issues (plaintext passwords, SQL injection) must be caught immediately.
- Clear communication (WHAT/WHY/HOW) makes reviews actionable.

## I — Interview Questions with Answers

### Q1: How do you prioritize code review feedback?

**A:** (1) Security vulnerabilities — block merge. (2) Correctness bugs — block merge. (3) Performance issues — request changes. (4) Architecture/design — discuss. (5) Style/naming — suggest. Always lead with the critical issues.

### Q2: How do you give constructive feedback in reviews?

**A:** Focus on the code, not the person. Explain why (not just what). Suggest a specific fix. Use questions for subjective points: "Have you considered...?" Acknowledge good parts too.

## C — Common Pitfalls with Fix

### Pitfall: Only finding style issues, missing security bugs

**Fix:** Review in order: security → correctness → performance → architecture → style.

### Pitfall: Being too harsh or too lenient

**Fix:** Every comment needs WHY. Critical issues get "This should block merge because..." Suggestions get "Nit:" or "Optional:".

## K — Coding Challenge with Solution

### Challenge

Find all issues in this code:

```ts
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`)
  const data = await response.json()

  localStorage.setItem("userData", JSON.stringify(data))

  if (data.role == "admin") {
    data.permissions = ["read", "write", "delete"]
  }

  return data
}
```

### Solution

```
Issues:
1. No TypeScript types — userId: any, data: any, return: any
2. No error handling — fetch can fail, response might not be ok
3. No input validation — userId could be anything (XSS in URL)
4. response.json() can fail — no try/catch
5. Loose equality `==` instead of `===`
6. Mutation of response data — `data.permissions = ...`
7. localStorage side effect — impure function
8. No response.ok check — 404 would silently succeed
9. Business logic (role check) mixed with data fetching
10. No return type annotation

Fixed version:
```

```ts
import { z } from "zod"

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
})
type User = z.infer<typeof UserSchema>

const ADMIN_PERMISSIONS = ["read", "write", "delete"] as const
const USER_PERMISSIONS = ["read"] as const

function getPermissions(role: User["role"]): readonly string[] {
  return role === "admin" ? ADMIN_PERMISSIONS : USER_PERMISSIONS
}

async function fetchUser(userId: string): Promise<Result<User, string>> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`)
    if (!response.ok) return err(`HTTP ${response.status}`)
    const data = await response.json()
    const parsed = UserSchema.safeParse(data)
    if (!parsed.success) return err("Invalid response data")
    return ok(parsed.data)
  } catch (e) {
    return err(`Network error: ${(e as Error).message}`)
  }
}
```

---
