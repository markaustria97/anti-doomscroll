# try / catch / finally

## T — TL;DR
**try / catch / finally** is easier when you tie it to one concrete rule instead of memorizing isolated syntax.

## K — Key Concepts
- Name the runtime rule behind **try / catch / finally** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **try / catch / finally** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for try / catch / finally?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with try / catch / finally?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **try / catch / finally** to explain the rule in your own words.

**Solution:**
```js
try {
  riskyWork()
} catch (error) {
  console.error(error)
} finally {
  cleanup()
}
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[built-in Error types](17-built-in-error-types.md)

## One tiny action
Spend two minutes turning **try / catch / finally** into one tiny runnable example.
