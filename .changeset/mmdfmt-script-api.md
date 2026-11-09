---
"mmdfmt": minor
---

Add `resolveConfig(fileUrlOrPath)`, which finds the configuration of a file as
`mmdfmt` does, `format(source, options)`, which given it returns the text that
`mmdfmt` writes for the file, `clearConfigCache()`, and their types
`ReadOptions` and `FormatOptions`, so that a tool such as a language server can
format the diagrams of a file without running the command.
