---
"mmdfmt": minor
---

Add `format(text, { filepath })`, which formats the text of a file as
`mmdfmt --stdin-filepath` does and returns the formatted text with its
diagnostics, so that a tool such as a language server can use `mmdfmt` without
running the command.
