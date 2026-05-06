# 11 — Variance in TypeScript

## T — TL;DR

Variance describes how generic type relationships flow — covariance (`out`) means subtype is preserved; contravariance (`in`) means it flips; function parameters are contravariant, return types are covariant.

## K — Key Concepts

```ts
// ── Covariance — "out" position — subtype relationship preserved ──
// A producer/source of T is covariant in T
type Producer<T> = () => T     // return type — covariant

// If Animal extends Animal (itself), and Dog extends Animal:
type Animal = { name: string }
type Dog = Animal & { bark(): void }

const getDog: Producer<Dog> = () => ({ name: "Rex", bark() {} })
const getAnimal: Producer<Animal> = getDog  // ✅ Dog extends Animal — covariant!

// ── Contravariance — "in" position — subtype relationship flips ──
// A consumer/acceptor of T is contravariant in T
type Consumer<T> = (val: T) => void   // parameter type — contravariant

const processAnimal: Consumer<Animal> = (a) => console.log(a.name)
const processDog: Consumer<Dog> = processAnimal  // ✅ contravariance — flipped!
// processAnimal accepts ANY animal, so it can also process Dog
// processDog: Consumer<Dog> = something that handles Animal — valid!

// ── Why this matters in practice ─────────────────────────
// Function parameter types are contravariant
// strictFunctionTypes enforces this:

type OnAnimal = (a: Animal) => void
type OnDog    = (d: Dog) => void

let onAnimal: OnAnimal = (a) => console.log(a.name)
let onDog: OnDog = (d) => d.bark()

onAnimal = onDog   // ❌ strictFunctionTypes blocks — onDog can't handle non-Dog animals
onDog = onAnimal   // ✅ onAnimal handles any animal, including Dog — safe!

// ── Invariance — neither covariant nor contravariant ──────
// Mutable containers are invariant (both read and write)
// Array<T> is technically covariant in TypeScript (by design tradeoff, not pure math)

// ── TypeScript 4.7: explicit variance annotations ─────────
// `out T` — covariant: T only used in output positions
// `in T`  — contravariant: T only used in input positions
// `in out T` — invariant: T used in both

type ReadonlyBox<out T> = {   // covariant — only produces T
  readonly value: T
}

type WriteBox<in T> = {       // contravariant — only consumes T
  set(value: T): void
}

// TypeScript uses these annotations to:
// 1. Improve performance (skip costly checks)
// 2. Document intent
// 3. Error if the annotation doesn't match actual usage

// ── Practical: why Array<Dog> is NOT assignable to Array<Animal> in strict code ──
declare function processAll(animals: Animal[]): void
const dogs: Dog[] = []
processAll(dogs)  // ✅ TypeScript allows (covariant arrays — by design)
// But this is UNSAFE: processAll could push a non-Dog Animal into `dogs`!
// ReadonlyArray<Dog> → ReadonlyArray<Animal> is safe (no push)
```


## W — Why It Matters

```
Understanding variance explains why `(dog: Dog) => void` is NOT assignable to `(animal: Animal) => void` (even though `Dog extends Animal`) — and why `strictFunctionTypes` catches real bugs. It also explains why `ReadonlyArray<Dog>` is safely assignable to `ReadonlyArray<Animal>` but `Array<Dog>` is technically unsafe (TypeScript allows it for ergonomics).
```


## I — Interview Q&A

**Q: Why are function parameters contravariant?**

```
A: If a function expects `Dog`, it can only handle `Dog`. If you substitute it with a function that expects `Animal` (supertype), it can handle any animal — including `Dog`. So `Consumer<Animal>` is safely assignable to `Consumer<Dog>`. The direction flips from the type hierarchy: subtype parameter → supertype is valid, not the other way.
```

**Q: What does `strictFunctionTypes` enforce?**
A: It enforces contravariance on function parameter types — catching cases where a more-specific function type is used where a more-general one is expected. It was off by default for years due to breaking changes but is now part of `strict: true`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Array<Dog>` assigned to `Array<Animal>` then mutated | Use `ReadonlyArray<Dog>` for safe covariant assignment |
| Expecting `(dog: Dog) => void` to be usable as `(a: Animal) => void` | Contravariance flips this — use `(a: Animal) => void` as `(d: Dog) => void` instead |
| Variance annotations (`in`/`out`) crashing with incorrect usage | TypeScript will error if annotation contradicts actual use |

## K — Coding Challenge

**Explain why this code is an error with `strictFunctionTypes`, and fix it:**

```ts
type Handler<T> = (val: T) => void
const handleAnimal: Handler<Animal> = (a) => console.log(a.name)
const handleDog: Handler<Dog> = handleAnimal  // Error or not?
```

**Solution:**

```ts
// handleAnimal: Handler<Animal> = (a: Animal) => void
// handleDog:    Handler<Dog>    = (d: Dog) => void
// Handler is contravariant in T (parameter position)
// Dog extends Animal → Handler<Animal> extends Handler<Dog> (flipped!)
// So: Handler<Animal> IS assignable to Handler<Dog> ← CORRECT direction
const handleDog: Handler<Dog> = handleAnimal  // ✅ No error — correct!

// The ERROR would be the reverse:
// const handleAnimal: Handler<Animal> = handleDog  // ❌ Error!
// Because handleDog can only handle Dog — can't handle all Animal
```


***
