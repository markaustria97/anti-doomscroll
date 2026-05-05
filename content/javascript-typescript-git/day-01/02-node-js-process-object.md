# 2 — Node.js `process` Object (`env`, `argv`, `exit`)

## T — TL;DR

`process` is Node's global object that exposes environment variables, command-line arguments, and process control.

## K — Key Concepts

```js
// Environment variables
process.env.NODE_ENV          // "development" | "production"
process.env.PORT              // "3000" (always a string!)

// Command-line arguments
process.argv
// ["node", "/path/to/script.js", "arg1", "arg2"]
// index 0 = node binary, index 1 = script path, index 2+ = your args

const [,, first, second] = process.argv

// Exit codes
process.exit(0)    // success
process.exit(1)    // failure (any non-zero = error)

// Current working directory
process.cwd()
```


## W — Why It Matters

Every backend app uses `process.env` for config (API keys, DB URLs). Mishandling `process.argv` breaks CLI tools. Wrong exit codes break CI/CD pipelines.

## I — Interview Q&A

**Q: Why is `process.env.PORT` always a string even if you set it to `3000`?**
A: Environment variables are always strings in Unix/POSIX systems. You must cast it: `const port = Number(process.env.PORT) || 3000`.

**Q: What does `process.exit(1)` signal to the shell?**
A: A non-zero exit code signals failure. CI/CD systems (GitHub Actions, Jenkins) read this to mark a build as failed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `process.env.PORT === 3000` (number compare) | Cast first: `Number(process.env.PORT) === 3000` |
| Reading `process.argv[^0]` expecting your arg | Your args start at index `2` |
| Forgetting `process.exit()` in long-running scripts | Call explicitly or use `process.exitCode = 1` |

## K — Coding Challenge

**Write a script that reads a name from CLI args and greets it:**

```js
// run: node greet.js Alice
```

**Solution:**

```js
const name = process.argv[^2]
if (!name) {
  console.error("Usage: node greet.js <name>")
  process.exit(1)
}
console.log(`Hello, ${name}!`)
```


***
