---
"@mmd-toolkit/ast": minor
"@mmd-toolkit/parser": minor
---

Move the types of the tree to the new package `@mmd-toolkit/ast`, an optional
peer dependency of `@mmd-toolkit/parser`, so that installing the formatter or
the linter no longer downloads them. TypeScript code that uses the types of
`@mmd-toolkit/parser` needs `@mmd-toolkit/ast` installed at the same version;
`import type { Root } from "@mmd-toolkit/parser"` stays as it is.
