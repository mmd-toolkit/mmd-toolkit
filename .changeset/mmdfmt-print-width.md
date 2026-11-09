---
"mmdfmt": minor
---

Read `printWidth` (and `max_line_length` of `.editorconfig`),
`embeddedLanguageFormatting`, `singleQuote`, `bracketSpacing`, `proseWrap`, and
`trailingComma` from the Prettier configuration of a file, so that they apply to
the diagrams as they do with `prettier-plugin-mmd`; `mmdfmt` reads no other
option. In a code block in a list or a block quote, the width of what stands
before each line is taken off `printWidth`.
