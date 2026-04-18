# TS class features

## T — TL;DR
**TS class features** helps TypeScript describe what values are allowed before runtime. Use it to make assumptions explicit, not magical.

## K — Key Concepts
- Keep **TS class features** aligned with runtime truth.
- Prefer readable types over clever ones that teammates cannot explain.
- If data comes from outside your code, pair types with runtime validation.

## W — Why it matters
TypeScript is most useful when it prevents bad assumptions early. **TS class features** helps you move mistakes into the editor instead of discovering them through runtime bugs.

## I — Interview questions with answers
- **Q:** When is TS class features actually helpful?  
  **A:** When it makes an invariant clearer and reduces unsafe assumptions in real code.
- **Q:** What is the danger of overusing TS class features?  
  **A:** You can create types that look impressive but hide runtime uncertainty or confuse the team.

## C — Common pitfalls with fix
- Using types to hide uncertainty instead of model it. — **Fix:** keep unknown data unknown until you validate or narrow it.
- Making **TS class features** too clever. — **Fix:** choose the simpler type that your future self can explain quickly.

## K — Coding challenge with solution
**Challenge:** Read the example for **TS class features** and say which unsafe assumption became explicit.

**Solution:**
```ts
class User {
  constructor(public name: string) {}
}
```

**Why it works:** This works because **TS class features** is easiest to trust when the type rule and the runtime story match.
## Next topic
[public/private/protected](21-public-private-protected.md)

## One tiny action
Read the example for **TS class features** and name the exact value or shape that became safer.
