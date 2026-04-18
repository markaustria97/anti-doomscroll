# dynamic import()

## T — TL;DR
**dynamic import()** is a modern JavaScript feature worth learning through behavior, not hype. Aim for one clear mental picture.

## K — Key Concepts
- Name the runtime rule behind **dynamic import()** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **dynamic import()** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for dynamic import()?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with dynamic import()?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **dynamic import()** to explain the rule in your own words.

**Solution:**
```js
const module = await import("./feature.js")
module.run()
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[top-level await](12-top-level-await.md)

## One tiny action
Spend two minutes turning **dynamic import()** into one tiny runnable example.
