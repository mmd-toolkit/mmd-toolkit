---
"mmdfmt": minor
---

Add `format` and `resolveConfig`, which take and return what Prettier's
functions of the same names do, so that a tool such as a language server can
format only the diagrams of a file, as `mmdfmt --stdin-filepath` does, without
running the command.
