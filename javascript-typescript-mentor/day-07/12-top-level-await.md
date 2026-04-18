# top-level await

## T — TL;DR
**top-level await** is a modern JavaScript feature worth learning through behavior, not hype. Aim for one clear mental picture.

## K — Key Concepts
- Name the runtime rule behind **top-level await** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **top-level await** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for top-level await?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with top-level await?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **top-level await** to explain the rule in your own words.

**Solution:**
```js
const config = await fetch("/config.json").then((r) => r.json())
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[globalThis](13-global-this.md)

## One tiny action
Spend two minutes turning **top-level await** into one tiny runnable example.
