# Diagram support

mmd-toolkit supports **every diagram type in Mermaid 12.0.0**. The parser,
formatter, and linter share the same syntax definition.

## Using the tools

You can use the same tools for every diagram type.

| Tool                               | Purpose                                                          |
| ---------------------------------- | ---------------------------------------------------------------- |
| [Parser](../parser/index.md)       | Parse diagram text and return an AST.                            |
| [Formatter](../formatter/index.md) | Format indentation, whitespace, and line breaks with Prettier.   |
| [Linter](../linter/index.md)       | Report syntax errors and mistakes found by enabled ESLint rules. |

Each lint rule checks a particular kind of mistake. Its applicability and
examples are explained in the
[rule documentation](../../../eslint-plugin-mmd/docs/rules/index.md).

## Compatibility scope

The compatibility reference is mermaid.js **12.0.0**. This scope covers the
diagram text syntax of that version. Rendering and layout are handled by
Mermaid.

- [Compatibility](./index.md): tool guarantees and validation scope.
- [Known divergences](../../../spec/docs/known-divergences.md): differences in
  accepted syntax and interpretation.
- [Formatter compatibility](../../../prettier-plugin-mmd/docs/compatibility.md):
  guarantees and exceptions when formatting text.
