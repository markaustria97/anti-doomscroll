# 8 — System Design Interview Simulation

## T — TL;DR

System design interviews for frontend/full-stack engineers test **API design, type contracts, module architecture, state management, and caching strategies** — not just backend infrastructure.

## K — Key Concepts

### Prompt: "Design a Type-Safe API Layer"

```
Requirements:
- Multiple API endpoints with different request/response types
- Authentication (JWT)
- Error handling (typed errors)
- Caching
- Retry logic
- Request cancellation
```

### Step 1: Define the Contract

```ts
// api/types.ts
interface ApiEndpoints {
  "GET /users": { response: User[]; query: { page: number; limit: number } }
  "GET /users/:id": { response: User; params: { id: string } }
  "POST /users": { response: User; body: CreateUserInput }
  "PUT /users/:id": { response: User; params: { id: string }; body: UpdateUserInput }
  "DELETE /users/:id": { response: void; params: { id: string } }
}

type ClientError =
  | { type: "http"; status: number; message: string }
  | { type: "network"; cause: Error }
  | { type: "validation"; issues: string[] }
  | { type: "timeout" }
  | { type: "unauthorized" }
```

### Step 2: Architecture Diagram

```
┌──────────────┐
│  React App   │
│  (UI Layer)  │
└──────┬───────┘
       │ uses hooks
┌──────▼───────┐
│ TanStack     │ ← caching, dedup, background refetch
│ Query        │
└──────┬───────┘
       │ calls
┌──────▼───────┐
│ API Client   │ ← typed requests, interceptors, retry
│ (Day 13 #2)  │
└──────┬───────┘
       │ Result<T, E>
┌──────▼───────┐
│ fetch()      │ ← AbortController for cancellation
└──────┬───────┘
       │
┌──────▼───────┐
│ Server API   │ ← Zod validation, typed responses
└──────────────┘
```

### Step 3: Key Design Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Error handling | Result type, not throw | Type-safe, composable, impossible to forget |
| Validation | Zod on both client & server | Single source of truth for types + runtime checks |
| Caching | TanStack Query | Automatic dedup, background refetch, stale-while-revalidate |
| Auth | Interceptor adds JWT | Centralized, not scattered across every call |
| Cancellation | AbortController | Per-request cancellation for navigation/unmount |
| Retry | Exponential backoff, 5xx only | Don't retry 4xx (client errors) |
| Type sharing | Monorepo shared-types package | Single source of truth for API contracts |

### Step 4: Communication Framework (STAR for System Design)

```
1. CLARIFY: Ask about scale, users, features, constraints
2. HIGH-LEVEL: Draw the architecture diagram
3. DEEP DIVE: Focus on the interviewer's area of interest
4. TRADEOFFS: Explain why each decision was made
5. EXTENSIONS: Mention what you'd add next (monitoring, rate limiting, etc.)
```

## W — Why It Matters

- System design rounds evaluate **architectural thinking**, not just coding.
- Frontend system design is increasingly common at L4+ interviews.
- The patterns in this architecture span all 5 groups of this curriculum.
- Clear communication of tradeoffs matters more than the "right" answer.

## I — Interview Questions with Answers

### Q1: How do you share types between frontend and backend?

**A:** Monorepo with a `shared-types` package. Both apps depend on it. Types defined once. Turborepo ensures build order. Zod schemas can also be shared for runtime validation on both sides.

### Q2: How do you handle API errors on the frontend?

**A:** API client returns `Result<T, ClientError>`. TanStack Query's `onError` handles UI feedback. Discriminated error union enables specific handling (401 → redirect to login, 404 → show not found, 500 → show generic error).

### Q3: How do you handle optimistic updates?

**A:** TanStack Query's `onMutate` updates the cache optimistically. `onError` rolls back. `onSettled` invalidates to refetch the true state. The mutation's `Result` type tells you whether to confirm or revert.

## C — Common Pitfalls with Fix

### Pitfall: Diving into implementation without clarifying requirements

**Fix:** Always start with 2-3 clarifying questions: "How many concurrent users? What's the latency requirement? Is offline support needed?"

### Pitfall: Not discussing tradeoffs

**Fix:** For every decision, state the alternative and why you chose differently: "I chose Result over throwing because [reason]. The tradeoff is [cost]."

## K — Coding Challenge with Solution

### Challenge

Design the type-safe API for a chat application:

### Solution

```ts
type ChatEndpoints = {
  "GET /conversations": {
    response: Conversation[]
    query: { page: number }
  }
  "GET /conversations/:id/messages": {
    response: PaginatedResult<Message>
    params: { id: ConversationId }
    query: { cursor?: string; limit?: number }
  }
  "POST /conversations/:id/messages": {
    response: Message
    params: { id: ConversationId }
    body: { content: string; attachments?: string[] }
  }
  "WS /conversations/:id": {
    events: {
      "message:new": Message
      "message:edited": Message
      "user:typing": { userId: UserId }
      "user:online": { userId: UserId; online: boolean }
    }
  }
}

type ConversationId = string & { __brand: "ConversationId" }
type UserId = string & { __brand: "UserId" }

interface Message {
  id: string
  conversationId: ConversationId
  authorId: UserId
  content: string
  createdAt: string
  editedAt?: string
}
```

---
