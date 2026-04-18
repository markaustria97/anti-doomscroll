# tsconfig.json

## TL;DR
tsconfig.json is part of the JavaScript or TypeScript platform and workflow story. Learn what it is responsible for, what it is not responsible for, and the small set of defaults you need to be productive. Good tooling and platform choices remove friction long before you notice them.

## Key Concepts
- tsconfig.json belongs to the platform or tooling layer rather than your application domain logic.
- Start with the default setup and only add configuration you can explain.
- Know whether the topic affects runtime behavior, development experience, or both.
- Healthy tooling reduces accidental complexity and keeps teams aligned.

## Why It Matters
tsconfig.json matters because setup and platform decisions quietly shape every other lesson in the stack. Good defaults reduce friction, make teams more consistent, and help you spend more time on application logic than on environment drift.

## Syntax / Example
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  }
}
```

## Common Pitfalls
- Over-configuring early instead of learning the default workflow first.
- Assuming the tool can fix unclear architecture or weak tests on its own.
- Letting local setup drift across teammates or CI environments.

## Interview Angle
- **Q:** What role does tsconfig.json play in a JS/TS project?  
  **A:** Name the problem it solves, where it fits in the workflow, and what it does not replace.
- **Q:** What is a safe default for tsconfig.json?  
  **A:** Choose the smallest setup that gives consistency without needless configuration.

## Mini Challenge
Create the smallest setup example or command sequence that shows how tsconfig.json helps your workflow.

## Mini Challenge Solution
A correct solution uses the tool for one concrete job and briefly states what feedback or outcome you expect.

## Related Topics
- Previous: [why TypeScript](01-why-type-script.md)
- Next: [strict mode](03-strict-mode.md)
