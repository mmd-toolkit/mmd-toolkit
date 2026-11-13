# Compatibility

mmd-toolkit uses **[mermaid.js](https://mermaid.js.org/) 12.3.0** as its
compatibility reference. See [Diagram support](./support.md) for the diagram
types covered.

A formatted text is also drawn by other versions of mermaid.js, so the formatter
checks what it prints against up to five versions of mermaid.js for each diagram
type. When the formatter would change how something is written, such as the case
of a keyword, it keeps it as written if a version that counts for the diagram
type and reads the written form does not read the new form, or draws it
differently.
[Versions of mermaid.js that count](../../../prettier-plugin-mmd/docs/compatibility.md#versions-of-mermaidjs-that-count)
lists them for each diagram type, and
[Forms kept for versions of mermaid.js that count](../../../prettier-plugin-mmd/docs/compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)
lists each form that stays as written for them.

## Guarantees

- The parser accepts and rejects the same diagram text as mermaid.js and reads
  accepted text as the same diagram, except for the
  [known divergences](../../../spec/docs/known-divergences.md).
- Formatting is idempotent: formatting the result again produces the same text.
  It preserves the diagram's meaning, subject to the
  [documented exceptions](../formatter/compatibility.md).
- The linter uses the same parser. It reports syntax errors and the mistakes
  checked by enabled rules.

The known divergences page explains which inputs are accepted or interpreted
differently and what each difference means for an author.

## Validation scope

The compatibility scope is diagram text syntax. Rendering, layout, and checks
that depend on Mermaid's site configuration are outside that scope.

The parser preserves the frontmatter body, directive arguments, and `@{ ... }`
data blocks as text. It recognizes their boundaries but does not validate their
contents as YAML or JSON, their value types, or names such as node shapes.
Mermaid can therefore reject embedded data that this toolkit accepts. See
[Embedded data is not checked](../../../spec/docs/known-divergences/embedded-data-opaque.md)
for these differences.
