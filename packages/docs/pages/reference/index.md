# Compatibility

mmd-toolkit uses **[mermaid.js](https://mermaid.js.org/) 12.3.0** as its
compatibility reference. See [Diagram support](./support.md) for the diagram
types covered.

When the formatter would change how a token is spelled, such as the case of a
keyword, it keeps the spelling as written if the history of mermaid.js (its
changelog and the grammars of earlier releases) shows that an earlier version
reads the new spelling differently or not at all. The rest of its formatting is
checked with 12.3.0 only. The formatter's
[compatibility notes](../../../prettier-plugin-mmd/docs/compatibility.md#versions-of-mermaidjs)
list what was read for each kind of spelling.

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
