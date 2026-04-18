# scope to closure mental model

## T — TL;DR
**scope to closure mental model** is about how JavaScript creates, scopes, and calls functions. Get the mental model first, then the syntax feels small.

## K — Key Concepts
- Name the runtime rule behind **scope to closure mental model** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **scope to closure mental model** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for scope to closure mental model?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with scope to closure mental model?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **scope to closure mental model** to explain the rule in your own words.

**Solution:**
```js
function makeCounter() {
  let count = 0
  return () => ++count
}
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[closure patterns and practical uses](../day-03/01-closure-patterns-and-practical-uses.md)

## One tiny action
Spend two minutes turning **scope to closure mental model** into one tiny runnable example.
