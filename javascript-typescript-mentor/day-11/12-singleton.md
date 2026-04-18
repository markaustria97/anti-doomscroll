# Singleton

## T — TL;DR
**Singleton** is a design tool for keeping change local. Use it only when it makes the next edit, test, or review easier.

## K — Key Concepts
- Use **Singleton** to separate a changing part from a stable part.
- Every abstraction should remove a real source of friction.
- Good names matter as much as the pattern itself.

## W — Why it matters
Architecture topics like **Singleton** matter when code has to survive change. A small amount of structure can make future edits cheaper and safer.

## I — Interview questions with answers
- **Q:** What problem does Singleton solve?  
  **A:** Explain the change or testing problem it reduces, not only the definition.
- **Q:** When would you avoid Singleton?  
  **A:** Avoid it when the abstraction cost is higher than the clarity or testability benefit.

## C — Common pitfalls with fix
- Adding the pattern because it sounds advanced. — **Fix:** point to the exact pain it removes first.
- Hiding simple logic behind too many layers. — **Fix:** keep the abstraction small and named by purpose.

## K — Coding challenge with solution
**Challenge:** Point to the boundary in the example for **Singleton** and explain why that split helps change or testing.

**Solution:**
```ts
class ConfigStore {
  private static instance: ConfigStore
  static getInstance() {
    return this.instance ??= new ConfigStore()
  }
}
```

**Why it works:** This works because the example keeps the abstraction small enough to see what responsibility **Singleton** is separating.
## Next topic
[Strategy](13-strategy.md)

## One tiny action
Name one responsibility that **Singleton** is separating in the example.
