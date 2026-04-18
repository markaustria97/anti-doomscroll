# optional chaining

## T — TL;DR
**optional chaining** is easier when you tie it to one concrete rule instead of memorizing isolated syntax.

## K — Key Concepts
- Name the runtime rule behind **optional chaining** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **optional chaining** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for optional chaining?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with optional chaining?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **optional chaining** to explain the rule in your own words.

**Solution:**
```js
const city = user?.address?.city
const first = list?.[0]
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[nullish coalescing](13-nullish-coalescing.md)

## One tiny action
Spend two minutes turning **optional chaining** into one tiny runnable example.
