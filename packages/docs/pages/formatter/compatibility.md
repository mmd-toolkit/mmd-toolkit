# Formatter compatibility

`prettier-plugin-mmd` preserves what mermaid.js reads from a diagram, subject to
the differences and exceptions below. Formatting is idempotent: formatting the
result again produces the same text.

The [project's compatibility policy](../reference/index.md) explains the
mermaid.js version used as the reference and the parser's known divergences.
Successful formatting does not establish that Mermaid can render the result.

## Syntax errors and differences from mermaid.js

For a standalone `.mmd` or `.mermaid` file, a syntax error is reported with its
position, and the Prettier CLI leaves that file unchanged. Inside Markdown,
Prettier continues formatting the document and handles the affected code block
with its usual Markdown formatting.

The parser's known divergences mean that some text accepted by mermaid.js is
reported as a syntax error, and some text rejected by mermaid.js is formatted.
For the latter, formatting may produce text that mermaid.js accepts, or the
result may still be rejected. The [known divergences][divergences] describe the
affected inputs.

If the plugin encounters a diagram type it does not support, a standalone file
is kept as written apart from line-ending normalization. In Markdown, the code
block is left to Prettier.

## Embedded data

Directive arguments and `@{ ... }` data blocks are kept as written. YAML
frontmatter is formatted with Prettier's YAML formatter when it can be read and
formatted safely; otherwise, it is kept as written. See [frontmatter
compatibility][frontmatter] for the exact conditions.

The plugin does not check whether embedded data is valid for Mermaid. Malformed
data, unknown configuration keys, or unknown node shapes can remain in the
result. Checks that depend on Mermaid's site configuration, such as its edge
limit, are also outside the plugin's scope.

## Trailing whitespace

In flowcharts, whitespace at the end of `style`, `classDef`, and `linkStyle`
statements is removed, except where doing so would make mermaid.js reject the
statement. This changes the style text stored by mermaid.js. See [style trailing
whitespace][styles].

Prettier removes trailing whitespace from the last line of every Markdown code
block, including a block formatted by this plugin. Where that whitespace is part
of the diagram, the result can change meaning or become invalid. For example, a
final `%%` comment whose body is a single space loses that space and can be read
as a node instead.

When a block is left to Prettier because the plugin cannot format it, Prettier
removes trailing whitespace from every line. See [Markdown code
blocks][markdown] for the limitations.

## Frontmatter with a byte order mark

A byte order mark (BOM) before frontmatter can make the plugin and mermaid.js
disagree:

- With a BOM before both `---` delimiters, mermaid.js accepts the text, but the
  plugin reports a syntax error.
- With a BOM only before the opening delimiter, mermaid.js rejects the text, but
  the plugin formats it.

The [BOM compatibility notes][bom] describe these cases. The repository's
[detailed compatibility document][details] records all differences and the rules
used to preserve Mermaid's reading of the input.

[divergences]: ../../../spec/docs/known-divergences.md
[frontmatter]: ../../../prettier-plugin-mmd/docs/compatibility.md#frontmatter
[styles]:
  ../../../prettier-plugin-mmd/docs/compatibility.md#whitespace-at-the-end-of-a-style
[markdown]:
  ../../../prettier-plugin-mmd/docs/compatibility.md#markdown-code-blocks
[bom]: ../../../prettier-plugin-mmd/docs/compatibility.md#byte-order-mark
[details]: ../../../prettier-plugin-mmd/docs/compatibility.md
