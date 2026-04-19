# 11 — Decorators (TC39 Stage 3 + Legacy)

## T — TL;DR

Decorators are **functions that modify classes and their members** at definition time — TC39 Stage 3 decorators (TS 5.0+) are the standard, while legacy `experimentalDecorators` are still used in Angular and NestJS.

## K — Key Concepts

### TC39 Stage 3 Decorators (TS 5.0+)

```ts
// Class decorator:
function logged(target: any, context: ClassDecoratorContext) {
  console.log(`Class defined: ${context.name}`)
}

@logged
class UserService {}
// "Class defined: UserService"
```

### Method Decorator

```ts
function log(
  target: any,
  context: ClassMethodDecoratorContext
) {
  const methodName = String(context.name)

  return function (this: any, ...args: any[]) {
    console.log(`→ ${methodName}(${args.join(", ")})`)
    const result = target.call(this, ...args)
    console.log(`← ${methodName} = ${result}`)
    return result
  }
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b
  }
}

new Calculator().add(1, 2)
// → add(1, 2)
// ← add = 3
```

### Field Decorator

```ts
function defaultValue(value: unknown) {
  return function (
    _target: undefined,
    context: ClassFieldDecoratorContext
  ) {
    return function (initialValue: unknown) {
      return initialValue ?? value
    }
  }
}

class Config {
  @defaultValue(3000)
  port!: number

  @defaultValue("localhost")
  host!: string
}

const config = new Config()
config.port // 3000
config.host // "localhost"
```

### Accessor Decorator

```ts
function clamp(min: number, max: number) {
  return function (
    target: ClassAccessorDecoratorTarget<any, number>,
    context: ClassAccessorDecoratorContext
  ): ClassAccessorDecoratorResult<any, number> {
    return {
      set(value: number) {
        target.set.call(this, Math.max(min, Math.min(max, value)))
      },
      get() {
        return target.get.call(this)
      },
    }
  }
}

class Slider {
  @clamp(0, 100)
  accessor value = 50
}

const slider = new Slider()
slider.value = 150
slider.value // 100 (clamped)
```

### Decorator Context

Every Stage 3 decorator receives a `context` object:

```ts
interface DecoratorContext {
  kind: "class" | "method" | "getter" | "setter" | "field" | "accessor"
  name: string | symbol
  static: boolean
  private: boolean
  access?: { get?(): unknown; set?(value: unknown): void }
  addInitializer(initializer: () => void): void
  metadata: Record<string | symbol, unknown>
}
```

### Legacy Decorators (`experimentalDecorators`)

```ts
// tsconfig.json: "experimentalDecorators": true

// Method decorator (legacy):
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey}`)
    return original.apply(this, args)
  }
}

class Service {
  @Log
  fetchData() {
    return "data"
  }
}
```

### Decorator Factory Pattern

```ts
// A decorator factory returns a decorator:
function retry(attempts: number) {
  return function (
    target: any,
    context: ClassMethodDecoratorContext
  ) {
    return async function (this: any, ...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await target.call(this, ...args)
        } catch (e) {
          if (i === attempts - 1) throw e
          console.log(`Retry ${i + 1}/${attempts}`)
        }
      }
    }
  }
}

class ApiClient {
  @retry(3)
  async fetchUser(id: string) {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error("Failed")
    return res.json()
  }
}
```

### TC39 vs Legacy Comparison

| Feature | TC39 Stage 3 | Legacy `experimentalDecorators` |
|---------|--------------|-------------------------------|
| TS version | 5.0+ | Any |
| Config | Default (no flag) | `experimentalDecorators: true` |
| Decorator receives | `(target, context)` | `(target, key, descriptor)` |
| `context.metadata` | ✅ | ❌ |
| `addInitializer` | ✅ | ❌ |
| Parameter decorators | ❌ Not yet | ✅ |
| Used by | New projects | Angular, NestJS, TypeORM |

## W — Why It Matters

- Angular and NestJS are entirely built on decorators (`@Component`, `@Injectable`, `@Controller`).
- TC39 Stage 3 decorators are the future — they'll eventually replace legacy decorators.
- The `@log`, `@retry`, `@validate` patterns reduce boilerplate in real applications.
- Understanding both versions is necessary because legacy decorators dominate existing codebases.
- Decorator metadata enables dependency injection frameworks (covered Day 11).

## I — Interview Questions with Answers

### Q1: What are decorators?

**A:** Functions that modify classes and their members (methods, fields, accessors) at definition time. They're applied with `@decorator` syntax. They enable cross-cutting concerns like logging, validation, retry logic, and dependency injection.

### Q2: What is the difference between TC39 and legacy decorators?

**A:** TC39 Stage 3 (TS 5.0+, no config needed) receives `(target, context)` with metadata support. Legacy (`experimentalDecorators: true`) receives `(target, key, descriptor)` and supports parameter decorators. They're not interchangeable.

### Q3: What is a decorator factory?

**A:** A function that takes configuration arguments and returns a decorator. `@retry(3)` — `retry(3)` returns the actual decorator function. This enables parameterized decorators.

## C — Common Pitfalls with Fix

### Pitfall: Mixing TC39 and legacy decorators

```json
// tsconfig.json
{ "experimentalDecorators": true }
// Now TC39 decorators won't work — legacy mode is active
```

**Fix:** Choose one. New projects: omit `experimentalDecorators` (use TC39). Angular/NestJS: enable `experimentalDecorators`.

### Pitfall: Legacy parameter decorators don't exist in TC39

```ts
// Legacy:
function Inject(target: any, key: string, index: number) {}
class Service {
  constructor(@Inject private db: Database) {} // ❌ Not in TC39
}
```

**Fix:** TC39 doesn't support parameter decorators yet. Angular/NestJS still need legacy decorators.

## K — Coding Challenge with Solution

### Challenge

Create a `@memoize` method decorator (TC39 Stage 3) that caches results:

```ts
class Math {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
}
```

### Solution

```ts
function memoize(
  target: any,
  context: ClassMethodDecoratorContext
) {
  const cache = new Map<string, unknown>()

  return function (this: any, ...args: any[]) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = target.call(this, ...args)
    cache.set(key, result)
    return result
  }
}

class MathService {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
}

const math = new MathService()
math.fibonacci(40) // fast — cached recursion
```

---
