---
"mmdfmt": minor
---

Give the Prettier configuration of a file to Prettier as it is, so that
`printWidth` (and `max_line_length` of `.editorconfig`), `singleQuote`,
`embeddedLanguageFormatting`, and the like apply to the diagrams as they do with
`prettier-plugin-mmd`; only the parser, the plugin, the line endings, and the
range (always the whole diagram) are `mmdfmt`'s own. In a code block in a list
or a block quote, the width of what stands before each line is taken off
`printWidth`.
