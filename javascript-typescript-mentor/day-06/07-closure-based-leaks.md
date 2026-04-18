# closure-based leaks

## T — TL;DR
**closure-based leaks** matters because leaks and retained objects stay invisible until the app feels slow or unstable.

## K — Key Concepts
- Ask what **closure-based leaks** keeps alive and when those references can disappear.
- Memory problems usually come from retention, not from one large allocation.
- Use tools to confirm your guess instead of trusting a vague hunch.

## W — Why it matters
Memory issues are expensive to debug when you wait too long. **closure-based leaks** gives you a smaller checklist for spotting leaks before they become user-facing.

## I — Interview questions with answers
- **Q:** What rule should you remember for closure-based leaks?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with closure-based leaks?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Guessing at leaks without measuring. — **Fix:** capture a snapshot, profile, or log the retention path.
- Keeping references around 'just in case'. — **Fix:** shorten object lifetimes and release caches or listeners.

## K — Coding challenge with solution
**Challenge:** Name what stays referenced in the example for **closure-based leaks** and what would let it be cleaned up.

**Solution:**
```js
function attach() {
  const big = new Array(100_000).fill("data")
  return () => big.length
}
```

**Why it works:** This works because it keeps object lifetime small enough to talk about what stays reachable in **closure-based leaks**.
## Next topic
[WeakRef](08-weak-ref.md)

## One tiny action
Point at one reference in the example for **closure-based leaks** and ask, 'What keeps this alive?'
