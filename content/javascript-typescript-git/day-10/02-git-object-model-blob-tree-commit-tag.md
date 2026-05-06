# 2 — Git Object Model: Blob, Tree, Commit, Tag

## T — TL;DR

Git is a content-addressable filesystem — every object (blob, tree, commit, tag) is stored by the SHA-1 hash of its content; identical content always produces the same hash, enabling deduplication.

## K — Key Concepts

```
── Four Git object types ──────────────────────────────────

BLOB — stores file content (no filename, no permissions)
├── Content of "hello.js" → SHA: a1b2c3...
└── Same content in two files = one blob, two tree references

TREE — stores directory structure (filename + permissions + blob/subtree SHA)
├── 100644 README.md      → blob: d1e2f3
├── 100644 src/index.js   → blob: a1b2c3
└── 040000 src/           → tree: e4f5a6  (nested directory = nested tree)

COMMIT — stores snapshot metadata
├── tree:   e4f5a6...   (root tree for this snapshot)
├── parent: 9b8c7d...   (previous commit SHA)
├── author: Alice <alice@a.com> 1714928400 +0000
├── committer: Alice <alice@a.com> 1714928400 +0000
└── message: "Add user authentication"

TAG — annotated tag (points to any object, usually a commit)
├── object:  abc123...  (the commit being tagged)
├── type:    commit
├── tag:     v1.0.0
├── tagger:  Alice <alice@a.com>
└── message: "Release version 1.0.0"

── Inspect objects manually ──────────────────────────────

git cat-file -t abc123      # show object type (blob/tree/commit/tag)
git cat-file -p abc123      # pretty-print object content

# Example outputs:
$ git cat-file -p HEAD        # show current commit
tree 9e4f...
parent ab12...
author Alice <a@a.com> 1714928400 +0000
committer Alice <a@a.com> 1714928400 +0000

Initial commit

$ git cat-file -p HEAD^{tree}  # show root tree
100644 blob d670...    README.md
040000 tree 9e4f...    src

# SHA relationships:
Commit SHA ──points to──→ Tree SHA ──points to──→ Blob SHA
     ↑ also points to parent commit SHA

── Lightweight vs annotated tags ─────────────────────────

Lightweight tag: just a named pointer to a commit (like a branch, but doesn't move)
  git tag v1.0        → stored as .git/refs/tags/v1.0

Annotated tag: a full Git object with its own SHA, tagger, message, GPG signature
  git tag -a v1.0 -m "Release 1.0"
  git show v1.0       → shows tag object + commit
```

## W — Why It Matters

The object model explains key Git behaviors: renaming a file doesn't create a new blob (same content = same SHA), identical files across branches share storage, and every commit is immutable (changing anything changes its SHA). This is why `git rebase` creates _new_ commits — it can't edit old ones.

## I — Interview Q&A

**Q: What is the difference between a blob and a tree in Git?**
A: A blob stores raw file content with no metadata. A tree stores directory structure — mapping filenames and permissions to blob/tree SHAs. The filename lives in the tree, not the blob.

**Q: What is the difference between a lightweight tag and an annotated tag?**
A: A lightweight tag is just a pointer (a file in `.git/refs/tags/`) to a commit SHA — like an immutable branch. An annotated tag is a full Git object with its own SHA, tagger identity, date, message, and optional GPG signature. Use annotated tags for releases; lightweight for personal bookmarks.

## C — Common Pitfalls

| Pitfall                                       | Fix                                                                    |
| :-------------------------------------------- | :--------------------------------------------------------------------- |
| Thinking changing a commit message is "cheap" | It creates a new commit object (new SHA) — rewriting history           |
| Assuming Git stores filenames in blobs        | Filenames are stored in tree objects — blobs are pure content          |
| Lightweight tags moving with commits          | Unlike branches, tags (both types) never move — they're fixed pointers |

## K — Coding Challenge

**What does this chain represent?**

```bash
git cat-file -p HEAD         # shows: tree abc123, parent def456
git cat-file -p abc123       # shows: 100644 blob aaa111 README.md
git cat-file -p aaa111       # shows: # My Project\nWelcome!
```

**Solution:**

```
HEAD (current commit)
 └── tree abc123 (root directory snapshot)
      └── README.md → blob aaa111
           └── content: "# My Project\nWelcome!"

This is the complete chain: Commit → Tree → Blob → File content
```

---
