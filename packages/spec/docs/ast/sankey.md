# Sankey nodes

Japanese version: [sankey.ja.md](./sankey.ja.md)

This document defines the nodes of the tree for the diagram type `sankey`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/sankey.md](../diagrams/sankey.md).

The body of this diagram type is a [SankeyDiagram](#sankeydiagram). The values
of the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines
the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A field without quotes is read
without the whitespace at its ends, as mermaid.js reads it: its value starts and
ends with a character that is not whitespace, or is empty when the field holds
only spaces. A field in quotes is a [StringLiteral](../ast.md#stringliteral),
whose value is what lies between its quotes as written.

A **link** is a record of three fields: the **source** node, the **target**
node, and the **value** of the flow between them. A node is named by its id, so
two links with the same id name the same node.

## Nodes

### SankeyDiagram

| Field  | Type                        | Meaning                                   |
| ------ | --------------------------- | ----------------------------------------- |
| `body` | list of SankeyLinkStatement | The links, in source order; at least one. |

Child fields: `body`. The header keyword, `sankey` or `sankey-beta`, is not a
field: both give the same diagram type and the same Db. A line break belongs to
no link, and an empty line makes no node. [fixture: sankey/db-link-basic]
[fixture: sankey/db-header-beta] [fixture: sankey/db-blank-lines-between]
[fixture: sankey/header-only]

### SankeyLinkStatement

A record: `Pumped heat,"Heating and cooling, homes",193.026`.

| Field    | Type                              | Meaning                                      |
| -------- | --------------------------------- | -------------------------------------------- |
| `source` | SankeyIdentifier or StringLiteral | The first field, the id of the source node.  |
| `target` | SankeyIdentifier or StringLiteral | The second field, the id of the target node. |
| `value`  | SankeyLiteral or StringLiteral    | The third field, the value.                  |

Child fields: `source`, `target`, `value`. Each field is written without quotes
or in quotes, and which of them is written is shown by the type of its node:
`"a",b,1` has a StringLiteral as its source, and `a,b,1` a SankeyIdentifier. How
mermaid.js reads the fields into its Db is in the summary of the tests package.
[fixture: sankey/docs-syntax-sankey-9cc115a6] [fixture:
sankey/db-quoted-and-unquoted-same-id] [fixture: sankey/db-quoted-value]

### SankeyIdentifier

The id of a node written without quotes: a name that may contain whitespace,
which links refer to by its text.

| Field  | Type   | Meaning                                                   |
| ------ | ------ | --------------------------------------------------------- |
| `name` | string | The field without the whitespace at its ends, as written. |

No child fields. The name holds the spaces between its characters and every
printable character of ASCII but `"` and `,`: `Bio-conversion`, with a space at
each end, has the name `Bio-conversion`, and `a b` the name `a b`. A field of
spaces only has the empty name. [fixture: sankey/db-fields-trimmed] [fixture:
sankey/db-text-with-spaces] [fixture: sankey/db-spaces-only-source-id] [fixture:
sankey/db-spaces-only-target-id]

### SankeyLiteral

The value of a link written without quotes.

| Field   | Type   | Meaning                                                   |
| ------- | ------ | --------------------------------------------------------- |
| `value` | string | The field without the whitespace at its ends, as written. |

No child fields. It is no [NumericLiteral](../ast.md#numericliteral), because
the grammar takes any text here: `12.5`, `1e3`, `abc`, `1 #c`, and `0x10` are
values. A field of spaces only before another record has the empty value.
[fixture: sankey/db-value-decimal] [fixture: sankey/db-value-exponent] [fixture:
sankey/db-value-not-a-number] [fixture: sankey/db-value-hash-after-number]
[fixture: sankey/db-value-hexadecimal] [fixture: sankey/db-spaces-only-value]
