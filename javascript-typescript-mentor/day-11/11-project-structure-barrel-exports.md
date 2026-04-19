# 11 — Project Structure & Barrel Exports

## T — TL;DR

A well-structured project organizes code by **feature or domain** (not by technical layer), uses barrel exports (`index.ts`) for clean public APIs, and follows consistent naming conventions.

## K — Key Concepts

### Feature-Based Structure (Recommended)

```
src/
├── features/
│   ├── users/
│   │   ├── user.model.ts
│   │   ├── user.repository.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   ├── user.validation.ts
│   │   ├── user.types.ts
│   │   └── index.ts           ← barrel export
│   ├── orders/
│   │   ├── order.model.ts
│   │   ├── order.repository.ts
│   │   ├── order.service.ts
│   │   └── index.ts
│   └── auth/
│       ├── auth.service.ts
│       ├── auth.middleware.ts
│       └── index.ts
├── shared/
│   ├── types/
│   ├── utils/
│   ├── errors/
│   └── index.ts
├── infrastructure/
│   ├── database.ts
│   ├── logger.ts
│   └── config.ts
├── app.ts                     ← composition root
└── main.ts                    ← entry point
```

### vs Layer-Based Structure (Avoid for Large Apps)

```
src/
├── controllers/    ← all controllers mixed together
│   ├── user.controller.ts
│   ├── order.controller.ts
├── services/       ← all services mixed together
│   ├── user.service.ts
│   ├── order.service.ts
├── models/
├── repositories/
```

Feature-based is better because:
- **Cohesion** — related files are together
- **Encapsulation** — each feature has a clear public API
- **Scalability** — adding features means adding folders, not modifying existing ones
- **Deletability** — remove a feature by deleting its folder

### Barrel Exports (`index.ts`)

```ts
// features/users/index.ts
export { UserService } from "./user.service"
export { UserRepository } from "./user.repository"
export type { User, CreateUserInput, UpdateUserInput } from "./user.types"

// Do NOT export internal implementation details:
// export { hashPassword } from "./user.utils"  ← keep internal
```

### Importing from Barrels

```ts
// Clean import — one path, multiple exports:
import { UserService, UserRepository, type User } from "./features/users"

// Without barrels — multiple deep imports:
import { UserService } from "./features/users/user.service"
import { UserRepository } from "./features/users/user.repository"
import type { User } from "./features/users/user.types"
```

### Naming Conventions

```
Files:       kebab-case or dot-notation     user.service.ts, create-user.ts
Types:       PascalCase                      User, CreateUserInput
Variables:   camelCase                       userService, isActive
Constants:   UPPER_SNAKE or camelCase        MAX_RETRIES, defaultConfig
Interfaces:  PascalCase (no I prefix)        UserRepository (not IUserRepository)
Enums:       PascalCase                      UserRole (prefer union types)
```

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

```ts
// Clean imports with aliases:
import { UserService } from "@features/users"
import { AppError } from "@shared/errors"
```

## W — Why It Matters

- Project structure is the **first thing** senior engineers evaluate in a codebase.
- Feature-based structure scales from small projects to large monorepos.
- Barrel exports create **encapsulation boundaries** — control what's public vs internal.
- Consistent naming eliminates cognitive overhead for teams.
- Good structure makes code discoverable, deletable, and navigable.

## I — Interview Questions with Answers

### Q1: Feature-based vs layer-based structure?

**A:** Feature-based groups files by business domain (users/, orders/). Layer-based groups by technical role (controllers/, services/). Feature-based is preferred for medium-to-large apps because it provides better cohesion, encapsulation, and scalability. Layer-based can work for small apps.

### Q2: What are barrel exports?

**A:** An `index.ts` file that re-exports the public API of a module/feature. It creates a clean import surface (`from "./features/users"`) and hides internal implementation details.

### Q3: What are the downsides of barrel exports?

**A:** (1) Can cause circular dependency issues. (2) Bundlers may struggle to tree-shake barrel re-exports. (3) Over-barreling (too many nested barrels) creates import confusion. Use them at feature boundaries, not everywhere.

## C — Common Pitfalls with Fix

### Pitfall: Circular dependencies from barrels

```ts
// users/index.ts exports UserService
// UserService imports from orders/index.ts
// orders/index.ts exports OrderService
// OrderService imports from users/index.ts → CIRCULAR!
```

**Fix:** Import specific files instead of barrels when crossing feature boundaries. Or refactor shared types into `shared/`.

### Pitfall: Exporting everything from barrels

```ts
// ❌ Exports internal implementation details
export * from "./user.service"
export * from "./user.repository"
export * from "./user.utils"      // internal helpers exposed!
```

**Fix:** Explicitly export only the public API. Keep internal utilities unexported.

## K — Coding Challenge with Solution

### Challenge

Restructure this flat project into feature-based:

```
src/
├── userController.ts
├── userService.ts
├── userModel.ts
├── orderController.ts
├── orderService.ts
├── orderModel.ts
├── db.ts
├── logger.ts
└── types.ts
```

### Solution

```
src/
├── features/
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.model.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   └── orders/
│       ├── order.controller.ts
│       ├── order.service.ts
│       ├── order.model.ts
│       ├── order.types.ts
│       └── index.ts
├── shared/
│   └── types.ts
├── infrastructure/
│   ├── database.ts
│   └── logger.ts
├── app.ts
└── main.ts
```

```ts
// features/users/index.ts
export { UserController } from "./user.controller"
export { UserService } from "./user.service"
export type { User, CreateUserInput } from "./user.types"
```

---
