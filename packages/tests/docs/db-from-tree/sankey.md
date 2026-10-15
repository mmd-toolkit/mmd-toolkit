# Building the sankey Db from the tree

Japanese version: [sankey.ja.md](./sankey.ja.md)

The steps that build the Db summary of a sankey diagram from its tree, which
`src/db-from-tree/sankey.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in [diagrams/sankey.md](../../../spec/docs/diagrams/sankey.md)
and [ast/sankey.md](../../../spec/docs/ast/sankey.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#sankey).

mermaid.js builds the Db while it parses: the grammar calls the Db for each
record as the record ends
([`record`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L51-L58)),
and the Db keeps what it is given
([`findOrCreateNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L48-L58),
[`addLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L40-L42),
and
[`setDiagramTitle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)).
The summary is built the same way: the records are executed in source order, and
the lists the Db holds are the summary. The summary reads the graph once (see
[db-summaries.md](../db-summaries.md#sankey)), so each record of the tree is one
link of the summary.

## Building the summary from the tree

**Converted form.** Each field is read in
[converted form](../../../spec/docs/common.md#reading-a-source): each line
terminator, `\r\n` and a lone `\r` too, as `\n`, in a string, and each attribute
quote as `'`, in a field with quotes or without. An entity is rejected, so it is
in no tree. [fixture: sankey/db-quoted-crlf] [fixture: sankey/db-quoted-cr]
[fixture: sankey/lex-html-tag-in-unquoted-field] [fixture:
sankey/lex-html-tag-in-quoted-field]

**Texts.** The text of a field of the tree is read as follows.

- A SankeyIdentifier and a SankeyLiteral have the converted form of their range,
  and a StringLiteral the converted form of what lies between its quotes. The
  `value` of the tree is the written text, which the tree keeps, and the Db has
  the text as mermaid.js reads it.
- A directive inside a field or a string is not in the converted form, and so
  not in the text: `a,%%{init: {}}%%b,1` has the target `b`, and a directive
  after the value or at the start of a record changes nothing. A comment line
  and a directive on a line of their own inside a string are not in the text
  either. [fixture: sankey/db-directive-in-field] [fixture:
  sankey/db-directive-in-quotes] [fixture:
  sankey/db-directive-at-start-of-record] [fixture:
  sankey/db-directive-after-value] [fixture: sankey/db-quoted-comment-line]
  [fixture: sankey/db-quoted-directive-line]
- A `;` that the line rule ignores is not in the converted form either, in a
  field and in a string, also on the second line of a string; a `;` on another
  line stays. [fixture: sankey/lex-style-line-semicolon-source] [fixture:
  sankey/lex-style-line-semicolon-in-second-line-of-quotes] [fixture:
  sankey/lex-style-line-does-not-cross-lines-in-quotes] [fixture:
  sankey/lex-style-line-semicolon-at-end-of-field] [fixture:
  sankey/db-text-semicolon-at-end-of-field]

**The walk.** The records of the body are executed in source order. Each record
names its source node and then its target node, and adds a link. The Db has no
other statement, and the diagram has no other node. [fixture:
sankey/db-two-links] [fixture: sankey/db-node-order]

**Ids.** The id that a source or a target gives is the converted form of its
field without the whitespace at its ends, in a string also with each run of line
feeds as one line feed (the whole text has them so before it is read, see
[`prepareTextForParsing()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyUtils.ts#L1-L8)),
and with each `""` as one `"`, then with the replacement of characters (see
below). A field of whitespace only, and a string of whitespace only, give the
empty id. [fixture: sankey/db-fields-trimmed] [fixture:
sankey/db-quoted-doubled-quote] [fixture: sankey/db-quoted-four-quotes]
[fixture: sankey/db-quoted-only-quote] [fixture: sankey/db-quoted-comma]
[fixture: sankey/db-quoted-blank-line-collapses] [fixture:
sankey/db-quoted-crlf-blank-line-collapses] [fixture:
sankey/db-quoted-space-line-kept] [fixture: sankey/db-quoted-leading-line-feed]
[fixture: sankey/db-quoted-both-line-feed-ids] [fixture:
sankey/db-quoted-line-feeds-only] [fixture: sankey/db-quoted-spaces-trimmed]
[fixture: sankey/db-spaces-only-target-id] [fixture:
sankey/db-spaces-only-source-id]

**Nodes.** The node of an id is made when the id is new, and the node list holds
each id once, in the order in which the ids were first named. The same id names
the same node, whether it was written in quotes or not; ids that differ in case
are two nodes, and `__proto__` and `constructor` are ids like others. A link
that repeats another, reverses it, or joins a node to itself is a link of its
own. [fixture: sankey/db-quoted-and-unquoted-same-id] [fixture:
sankey/db-ids-case-sensitive] [fixture: sankey/db-ids-of-object-prototype]
[fixture: sankey/db-duplicate-link] [fixture: sankey/db-self-link]

**Values.** The value of a link is the number that `parseFloat()` makes of the
converted form of its field without the whitespace at its ends: the number from
the start of the text, whatever follows it, so `1 #c` is 1, `0x10` is 0, and a
text that starts with no number is no number. A value that is no finite number
is the text of the number, since JSON has no such number: `NaN` for a text that
is no number and for a field of whitespace only, and `Infinity` and `-Infinity`
for those texts and for a number too large for a double. `-0` is -0 in the Db,
and the summary holds 0, since JSON has no -0. A value in quotes is read in the
same way, from what lies between its quotes. [fixture:
sankey/db-value-not-a-number] [fixture: sankey/db-value-hexadecimal] [fixture:
sankey/db-value-exponent-negative] [fixture: sankey/db-value-negative-zero]
[fixture: sankey/db-value-infinity] [fixture: sankey/db-value-negative-infinity]
[fixture: sankey/db-value-overflow] [fixture: sankey/db-value-hash-after-number]
[fixture: sankey/db-spaces-only-value] [fixture:
sankey/db-quoted-value-with-comma] [fixture:
sankey/db-quoted-value-not-a-number] [fixture:
sankey/db-quoted-value-with-quotes]

**Title.** The title is that of the frontmatter, as mermaid.js reads it, with
the replacement of characters; the diagram has no `title` statement. The spaces
of the title stay. [fixture: sankey/db-title-frontmatter] [fixture:
sankey/db-title-frontmatter-spaces]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#sankey): the title, `nodes` as the ids in
the order above, and `links` in source order, each with `source`, `target`, and
`value`. [fixture: sankey/db-everything]

## The replacement of characters

The Db passes two kinds of text through `sanitizeText`: the title and every id.
`sankeyDbOf()` applies the replacement `textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text. An id is replaced after it is read as above, and nodes whose
ids become equal are one node. [fixture:
sankey/config-security-level-other-title-and-ids] [fixture:
sankey/config-security-level-other-html-labels-false] [fixture:
sankey/config-security-level-other-flowchart-html-labels-false] [fixture:
sankey/config-security-level-loose-ids] [fixture:
sankey/config-security-level-sandbox-ids]
