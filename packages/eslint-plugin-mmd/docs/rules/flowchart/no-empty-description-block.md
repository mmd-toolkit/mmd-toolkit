# mmd/flowchart/no-empty-description-block

Japanese version:
[no-empty-description-block.ja.md](./no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A description block is written to give the diagram its description. When the
block holds nothing, or only whitespace, mermaid.js accepts it and takes no
description from it.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing or only
whitespace. It applies to `flowchart-v2`, `flowchart-elk`, and `swimlane`.

The description stays what it was before the block: after `accDescr: x`, the
block `accDescr { }` leaves the description `x`, and with no description before
it, the description stays empty. An empty description written as a line is
different: `accDescr:` sets the description to the empty text.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so: the description before the block stays.

An empty block may also follow the last part of a statement on the same line, as
in `A accDescr {}`, or the header, as in `flowchart LR accDescr {}`. It sets no
description there either, and the rule reports it in the same way, with one
exception. After the name of a subgraph that has no title, whitespace around an
empty block can become part of the name of the subgraph, which decides its id
(the id of a subgraph in
[Building the summary from the tree](../../../../tests/docs/db-from-tree/flowchart.md#building-the-summary-from-the-tree)
in the documents of the Db of the tests package). When the name has no
whitespace of its own and the subgraph gets a generated id instead, as in
`subgraph S accDescr {}`, `style S` and links to `S` no longer reach it. The
message of the rule says so for each empty block between the name and the end of
its line or a `;`.

For a block that starts its line, the rule suggests removing it, with the
whitespace after it, or with its line when nothing else is on the line. A `;`
after it stays. mermaid.js then reads the diagram as before, because the block
changed nothing. A block that follows something on its line gets no suggestion:
whether removing the whitespace before it changes how mermaid.js reads what
comes before depends on that statement, and the tree does not tell it. Nor does
a block at the start of the body of a subgraph get one when a U+2028, a U+2029,
or an unclosed directive stands between the name and the block: such a unit
takes line breaks into the name, and without the block mermaid.js may read the
lines after it as part of the name.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A
  accDescr {}
```

```mmd
flowchart LR
  A
  accDescr { }
```

```mmd
flowchart LR
  A
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A
  accDescr { y }
```

```mmd
flowchart LR
  A
  accDescr {
    %% c
  }
```

## Options

This rule has no options. An option to also report a block that holds only
comments will be considered only if users of the rule ask for it.

## Related Rules

- [no-unclosed-description-block](./no-unclosed-description-block.md)
- [no-duplicate-description](./no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../../src/rules/flowchart/no-empty-description-block.ts)
- [Tests source](../../../tests/rules/flowchart/no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
