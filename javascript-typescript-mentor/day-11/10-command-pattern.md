# 10 — Command Pattern

## T — TL;DR

The Command pattern encapsulates an **action as an object** with an `execute()` method — enabling undo/redo, queuing, logging, and macro recording of operations.

## K — Key Concepts

### Command Interface

```ts
interface Command {
  execute(): void
  undo(): void
  describe(): string
}
```

### Concrete Commands

```ts
interface TextDocument {
  content: string
}

class InsertTextCommand implements Command {
  #previousContent: string = ""

  constructor(
    private doc: TextDocument,
    private position: number,
    private text: string,
  ) {}

  execute(): void {
    this.#previousContent = this.doc.content
    this.doc.content =
      this.doc.content.slice(0, this.position) +
      this.text +
      this.doc.content.slice(this.position)
  }

  undo(): void {
    this.doc.content = this.#previousContent
  }

  describe(): string {
    return `Insert "${this.text}" at position ${this.position}`
  }
}

class DeleteTextCommand implements Command {
  #deletedText: string = ""

  constructor(
    private doc: TextDocument,
    private position: number,
    private length: number,
  ) {}

  execute(): void {
    this.#deletedText = this.doc.content.slice(
      this.position,
      this.position + this.length,
    )
    this.doc.content =
      this.doc.content.slice(0, this.position) +
      this.doc.content.slice(this.position + this.length)
  }

  undo(): void {
    this.doc.content =
      this.doc.content.slice(0, this.position) +
      this.#deletedText +
      this.doc.content.slice(this.position)
  }

  describe(): string {
    return `Delete ${this.length} chars at position ${this.position}`
  }
}
```

### Command History (Undo/Redo)

```ts
class CommandHistory {
  #undoStack: Command[] = []
  #redoStack: Command[] = []

  execute(command: Command): void {
    command.execute()
    this.#undoStack.push(command)
    this.#redoStack = [] // clear redo on new command
  }

  undo(): void {
    const command = this.#undoStack.pop()
    if (!command) return
    command.undo()
    this.#redoStack.push(command)
  }

  redo(): void {
    const command = this.#redoStack.pop()
    if (!command) return
    command.execute()
    this.#undoStack.push(command)
  }

  getHistory(): string[] {
    return this.#undoStack.map(cmd => cmd.describe())
  }
}
```

### Usage

```ts
const doc: TextDocument = { content: "" }
const history = new CommandHistory()

history.execute(new InsertTextCommand(doc, 0, "Hello"))
console.log(doc.content) // "Hello"

history.execute(new InsertTextCommand(doc, 5, " World"))
console.log(doc.content) // "Hello World"

history.undo()
console.log(doc.content) // "Hello"

history.redo()
console.log(doc.content) // "Hello World"

history.execute(new DeleteTextCommand(doc, 5, 6))
console.log(doc.content) // "Hello"

console.log(history.getHistory())
// ["Insert "Hello" at 0", "Insert " World" at 5", "Delete 6 chars at 5"]
```

### Macro Command (Composite)

```ts
class MacroCommand implements Command {
  constructor(private commands: Command[]) {}

  execute(): void {
    for (const cmd of this.commands) cmd.execute()
  }

  undo(): void {
    for (const cmd of [...this.commands].reverse()) cmd.undo()
  }

  describe(): string {
    return `Macro: [${this.commands.map(c => c.describe()).join(", ")}]`
  }
}

// Batch operation:
const macro = new MacroCommand([
  new InsertTextCommand(doc, 0, "# Title\n"),
  new InsertTextCommand(doc, 9, "\nParagraph text"),
])

history.execute(macro)  // executes both
history.undo()           // undoes both
```

## W — Why It Matters

- Command pattern enables **undo/redo** — essential for text editors, drawing apps, and form wizards.
- **Task queues** use commands for serialization and replay.
- **Macro recording** (batch operations) is built with composite commands.
- The pattern is used in Redux (actions are commands), VS Code (command palette), and game engines.
- Understanding Command demonstrates advanced OOP design thinking.

## I — Interview Questions with Answers

### Q1: What is the Command pattern?

**A:** A behavioral pattern that encapsulates a request as an object with `execute()` and optionally `undo()`. This decouples the invoker (who triggers the action) from the receiver (who performs it), enabling queuing, logging, undo/redo, and macro composition.

### Q2: How does Command enable undo/redo?

**A:** Each command stores enough state to reverse its action. An undo stack tracks executed commands. `undo()` pops the last command and calls its `undo()` method. `redo()` re-executes it. This is the standard undo/redo implementation.

### Q3: How does Command relate to Redux?

**A:** Redux actions are commands — they describe an operation (type + payload). The reducer is the receiver that handles each action. The store's action history enables time-travel debugging (undo/redo).

## C — Common Pitfalls with Fix

### Pitfall: Command not storing enough state for undo

```ts
class BadDeleteCommand {
  execute() { this.doc.content = "" } // ❌ lost the original content
  undo() { /* can't restore! */ }
}
```

**Fix:** Always capture the state needed for reversal BEFORE executing.

### Pitfall: Commands holding references to stale state

**Fix:** Store snapshots (copies) of the relevant state, not references to mutable objects.

## K — Coding Challenge with Solution

### Challenge

Create a `Calculator` with command-based undo:

```ts
const calc = new CalculatorWithHistory()
calc.execute("add", 10)      // 10
calc.execute("multiply", 3)  // 30
calc.execute("subtract", 5)  // 25
calc.undo()                   // 30
calc.undo()                   // 10
```

### Solution

```ts
interface CalcCommand extends Command {
  execute(): void
  undo(): void
}

class CalculatorWithHistory {
  #value = 0
  #history: CalcCommand[] = []

  get value() { return this.#value }

  execute(op: "add" | "subtract" | "multiply" | "divide", operand: number): number {
    const command = this.#createCommand(op, operand)
    command.execute()
    this.#history.push(command)
    return this.#value
  }

  undo(): number {
    const cmd = this.#history.pop()
    cmd?.undo()
    return this.#value
  }

  #createCommand(op: string, operand: number): CalcCommand {
    const prev = this.#value
    const self = this

    const operations: Record<string, { exec: () => void }> = {
      add:      { exec: () => { self.#value += operand } },
      subtract: { exec: () => { self.#value -= operand } },
      multiply: { exec: () => { self.#value *= operand } },
      divide:   { exec: () => { self.#value /= operand } },
    }

    return {
      execute: () => operations[op].exec(),
      undo: () => { self.#value = prev },
      describe: () => `${op} ${operand}`,
    }
  }
}
```

---
