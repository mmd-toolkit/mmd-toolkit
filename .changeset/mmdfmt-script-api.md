---
"mmdfmt": minor
---

Add `format` and `resolveConfig`, shaped as Prettier's functions of the same
names, so that a tool such as a language server can find the configuration of a
file as `mmdfmt` does and format only its diagrams, as `mmdfmt --stdin-filepath`
does, without running the command.
