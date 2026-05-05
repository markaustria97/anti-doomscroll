# 7 — Abstract Classes

## T — TL;DR

Abstract classes define a contract for subclasses — they can have both implemented and `abstract` (unimplemented) members; they cannot be instantiated directly.

## K — Key Concepts

```ts
// ── Abstract class ────────────────────────────────────────
abstract class Shape {
  // Concrete: shared implementation
  toString(): string {
    return `${this.constructor.name}(area=${this.area().toFixed(2)})`
  }

  // Abstract: must be implemented by subclasses
  abstract area(): number
  abstract perimeter(): number
  abstract readonly name: string   // abstract property
}

// Cannot instantiate abstract class directly:
// const s = new Shape()  // ❌ Cannot create an instance of an abstract class

// Subclass MUST implement all abstract members
class Circle extends Shape {
  readonly name = "Circle"
  constructor(public radius: number) { super() }
  area(): number { return Math.PI * this.radius ** 2 }
  perimeter(): number { return 2 * Math.PI * this.radius }
}

class Rectangle extends Shape {
  readonly name = "Rectangle"
  constructor(public width: number, public height: number) { super() }
  area(): number { return this.width * this.height }
  perimeter(): number { return 2 * (this.width + this.height) }
}

// Polymorphism — use the abstract type
const shapes: Shape[] = [new Circle(5), new Rectangle(3, 4)]
shapes.forEach(s => console.log(s.toString()))
// "Circle(area=78.54)"
// "Rectangle(area=12.00)"

// ── Abstract class vs interface ────────────────────────────
// Interface: purely structural, no implementation, no constructor
// Abstract class: can have implementation + state + constructor + access modifiers

// Use abstract class when:
// - Subclasses share some implementation (e.g., toString, validate)
// - You need protected state or constructor
// - You want to enforce a template method pattern

// ── Template method pattern ────────────────────────────────
abstract class DataProcessor {
  // Template method — defines the algorithm
  process(data: string): string {
    const validated = this.validate(data)     // step 1 (abstract)
    const transformed = this.transform(validated) // step 2 (abstract)
    return this.format(transformed)            // step 3 (concrete)
  }

  protected abstract validate(data: string): string
  protected abstract transform(data: string): string

  protected format(data: string): string {
    return `[RESULT]: ${data}`  // shared implementation
  }
}

class UpperCaseProcessor extends DataProcessor {
  protected validate(d: string) {
    if (!d.trim()) throw new Error("Empty input")
    return d.trim()
  }
  protected transform(d: string) { return d.toUpperCase() }
}
```


## W — Why It Matters

Abstract classes enable the Template Method pattern — define the algorithm skeleton in the base class and delegate specific steps to subclasses. This is how Node.js `stream.Transform`, React's old class lifecycle, and many ORMs structure extensible processing pipelines.

## I — Interview Q&A

**Q: What is the difference between an abstract class and an interface?**
A: An interface is a pure structural contract — no implementation, no runtime existence. An abstract class is a partial implementation — it can have concrete methods, instance state, constructors, and access modifiers. Choose interface when you just need a shape; choose abstract class when subclasses share logic.

**Q: Can an abstract class implement an interface?**
A: Yes — and it's a common pattern: the interface defines the public contract, the abstract class provides shared implementation, and concrete subclasses fill in the abstract gaps. `class Base extends AbstractImpl implements Interface`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `new AbstractClass()` — forgetting it's abstract | TypeScript will error — instantiate a concrete subclass |
| Subclass forgetting to implement an abstract member | TypeScript errors: "Non-abstract class doesn't implement all abstract members" |
| Using abstract class where interface suffices | Prefer interfaces for contracts — abstract class adds inheritance coupling |

## K — Coding Challenge

**Build an abstract `Logger` class with a shared `log` method and abstract `write` method:**

```ts
const console = new ConsoleLogger()
const file = new FileLogger("app.log")
console.log("info", "Server started")  // calls write internally
```

**Solution:**

```ts
abstract class Logger {
  log(level: "info" | "warn" | "error", message: string): void {
    const formatted = `[${level.toUpperCase()}] ${new Date().toISOString()} ${message}`
    this.write(formatted)
  }
  protected abstract write(line: string): void
}

class ConsoleLogger extends Logger {
  protected write(line: string) { console.log(line) }
}

class FileLogger extends Logger {
  constructor(private filename: string) { super() }
  protected write(line: string) {
    // fs.appendFileSync(this.filename, line + "\n")
    console.log(`→ ${this.filename}: ${line}`)
  }
}
```


***
