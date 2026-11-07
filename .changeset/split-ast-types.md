---
"@mmd-toolkit/ast": minor
"@mmd-toolkit/parser": minor
"@mmd-toolkit/eslint-plugin": patch
"prettier-plugin-mmd": patch
---

Move the types of the tree to the new package `@mmd-toolkit/ast`, an optional
peer dependency of `@mmd-toolkit/parser`, so that installing the formatter or
the linter no longer downloads them. `@mmd-toolkit/parser` no longer exports
these types: TypeScript code imports them from `@mmd-toolkit/ast`, installed at
the same version or a later patch. The declarations of
`@mmd-toolkit/eslint-plugin` and `prettier-plugin-mmd` read that package too, as
an optional peer dependency, so a type check of their configuration without
`skipLibCheck` needs it installed.

The plugins now depend on `@mmd-toolkit/parser` with a caret range, so that the
formatter and the linter share one parser where their versions differ.
