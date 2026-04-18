# logical assignment operators

## T — TL;DR
`||=`, `&&=`, and `??=` combine a logical check with assignment. They are useful only if you know exactly which values trigger the write.

## K — Key Concepts
- `x ||= y` assigns when `x` is falsy.
- `x &&= y` assigns when `x` is truthy.
- `x ??= y` assigns only when `x` is `null` or `undefined`.

## W — Why it matters
These operators are compact, but the difference between falsy and nullish matters. Using the wrong one can silently overwrite a valid value.

## I — Interview questions with answers
- **Q:** When is `??=` safer than `||=`?  
  **A:** When `0`, `false`, or an empty string are valid values and should not be replaced.
- **Q:** What is the main risk with logical assignment operators?  
  **A:** Accidentally choosing the wrong trigger condition and overwriting real data.

## C — Common pitfalls with fix
- Using `||=` for counters or text fields. — **Fix:** use `??=` if only nullish values should be treated as missing.
- Forgetting these operators still mutate state. — **Fix:** use them only where reassignment is intentional.

## K — Coding challenge with solution
**Challenge:** Set a default username without overwriting an intentionally empty string.

**Solution:**
```js
let username = ''
username ??= 'guest'
console.log(username) // ''
```

**Why it works:** `??=` checks only for `null` or `undefined`, so an empty string is preserved.

## Next topic
[optional chaining](12-optional-chaining.md)

## One tiny action
Choose between `||=` and `??=` for one value like `0` or `''`, and explain why.
