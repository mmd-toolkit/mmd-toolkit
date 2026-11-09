---
"mmdfmt": minor
---

Add `format(source, options)`, which takes and returns what Prettier's `format`
does and formats only the diagrams, as `mmdfmt --stdin-filepath` does, so that a
tool such as a language server can use `mmdfmt` without running the command.
