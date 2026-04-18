# identifying memory leaks

## T — TL;DR
**identifying memory leaks** matters because leaks and retained objects stay invisible until the app feels slow or unstable.

## K — Key Concepts
- Ask what **identifying memory leaks** keeps alive and when those references can disappear.
- Memory problems usually come from retention, not from one large allocation.
- Use tools to confirm your guess instead of trusting a vague hunch.

## W — Why it matters
Memory issues are expensive to debug when you wait too long. **identifying memory leaks** gives you a smaller checklist for spotting leaks before they become user-facing.

## I — Interview questions with answers
- **Q:** What rule should you remember for identifying memory leaks?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with identifying memory leaks?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Guessing at leaks without measuring. — **Fix:** capture a snapshot, profile, or log the retention path.
- Keeping references around 'just in case'. — **Fix:** shorten object lifetimes and release caches or listeners.

## K — Coding challenge with solution
**Challenge:** Name what stays referenced in the example for **identifying memory leaks** and what would let it be cleaned up.

**Solution:**
```js
const retained = []
setInterval(() => retained.push(new Array(10_000).fill(0)), 1000)
```

**Why it works:** This works because it keeps object lifetime small enough to talk about what stays reachable in **identifying memory leaks**.
## Next topic
[closure-based leaks](07-closure-based-leaks.md)

## One tiny action
Point at one reference in the example for **identifying memory leaks** and ask, 'What keeps this alive?'
