# click-reserved-word

Japanese version: [click-reserved-word.ja.md](./click-reserved-word.ja.md)

Diagram type: flowchart. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

In a flowchart, a click statement starts with the word `click`, and gives a
vertex a link or a callback:

```mmd
flowchart LR
  A
  click A href "u" "tip"
```

The example gives A the link `u` and tooltip `tip`. [fixture:
flowchart/gram-click-href-tooltip]

The word `click` where a unit starts, with the whitespace after it, is a `click`
unit (see [Click and callbacks](../diagrams/flowchart.md#click-and-callbacks)).
This document is about such a unit where no click statement starts: inside a
statement, after a statement on the same line, inside an id, a style, or a
subgraph name. The word inside a string, or as part of a longer id, is no
`click` unit, and both read it as text: `A["click"]` has the label `click`, and
`click-node` is a vertex. [fixture: flowchart/gram-label-string-click] [fixture:
flowchart/spec-flow-singlenode-ada86e69]

## The difference

Each example is a whole flowchart.

1. The word `click` in a subgraph name:

   ```mmd
   flowchart LR
     subgraph Handle click events
       A
     end
   ```

2. `click` after an edge:

   ```mmd
   flowchart LR
     A --> B click ""
   ```

3. `click` before the tooltip of a click statement:

   ```mmd
   flowchart LR
     A
     click A href "u" click "tip"
   ```

4. A click statement whose id looks like an arrow:

   ```mmd
   flowchart LR
     click --- abc
   ```

| Example | mermaid.js                                                     | This specification |
| ------- | -------------------------------------------------------------- | ------------------ |
| 1       | the subgraph `Handle events` and the next line, with no vertex | rejected           |
| 2       | the edge from A to B                                           | rejected           |
| 3       | the link `u` and the tooltip `tip` of A                        | rejected           |
| 4       | a click on the id `---`, and no vertices                       | the same           |

The fixtures record the readings compared in the table. [fixture:
flowchart/db-subgraph-name-click-word-indented] [fixture:
flowchart/gram-click-bare-after-vertex] [fixture:
flowchart/gram-click-mid-statement-tooltip] [fixture:
flowchart/lex-click-id-arrow-callback]

In example 1, mermaid.js reads `events` as a click id, discards it, and joins
the next line, with its indentation, to the title of the subgraph, which then
holds no vertex. In example 2 it reads the empty string after `click` as
nothing, and in example 3 it reads `click` as nothing before the tooltip. This
specification rejects each of them. A click statement itself is read as
mermaid.js reads it, also where `click` may have been meant as a vertex, as in
example 4: its click ids are the runs of characters that the click context
reads, whatever they are (see
[Click statements](../diagrams/flowchart.md#click-statements)). The difference
goes one way only: mermaid.js accepts and this specification rejects. The
flowchart document lists the places in its
[Known divergences](../diagrams/flowchart.md#known-divergences).

Where the input without its comment regions
([Reading a source](../common.md#reading-a-source)), without its empty forms
(see [tokenless-empty-forms](./tokenless-empty-forms.md)), and without each such
`click`, the whitespace after it, and the one whitespace character with which
mermaid.js leaves the click context is read as the units of the input other than
those, its click ids and the `click-comma` units between them being read as
units that start and end where each of them does, and the text of each click id
lies within one leaf node of its tree, this specification gives that input the
Db that mermaid.js gives the input. `A:click "" b-->C` reads as `A:b-->C`, with
the vertex `A:b` and its edge to C. `subgraph click me` reads as `subgraph me`,
with the id `me`, where an empty line follows, also after a comment line, where
a U+2028 or a U+2029 and a line break follow, and where a directive follows
`me`. `classDef a:click "" b fill:#f00;`, whose last `;` the line rule ignores,
reads as `classDef a:b fill:#f00;`. [fixture: flowchart/db-vertex-id-bare-click]
[fixture: flowchart/db-subgraph-id-click-blank-line] [fixture:
flowchart/db-subgraph-id-click-comment-line] [fixture:
flowchart/db-subgraph-id-click-line-separator] [fixture:
flowchart/db-subgraph-id-click-paragraph-separator] [fixture:
flowchart/db-subgraph-id-click-space-directive] [fixture:
flowchart/db-classdef-name-bare-click-ignored-semicolon] Elsewhere the removal
joins what lies on its two sides, or puts the text of a click id where the
statement context reads it otherwise, and nothing follows for the input without
the `click`: `subgraph click me`, a line break, and `A` become `subgraph meA`;
`subgraph click me accDescr {}` followed by an empty line becomes
`subgraph meaccDescr {}`, which mermaid.js rejects; in `subgraph click m;e`, the
`;` becomes a separator of `subgraph m;e`; and in `subgraph click a,b` followed
by an empty line, the `,` becomes a `,` unit, which a name does not take, so
`subgraph a,b` is rejected, by mermaid.js too. [fixture:
flowchart/gram-subgraph-name-click] [fixture:
flowchart/gram-subgraph-name-click-empty-description-block] [fixture:
flowchart/gram-subgraph-name-click-semicolon-in-id] [fixture:
flowchart/db-subgraph-id-click-comma-blank-line]

## What it means for an author

The word `click` is easy to write in the name of a subgraph or in other text
without quotes. mermaid.js then reads it as the start of a click, discards the
word after it, and may join the next line to the text, as in example 1, without
a word. This toolkit rejects the input and reports the reserved word. To write
the word as text, put the text in quotes: with `subgraph "Handle click events"`,
both read that title and the vertex A in the subgraph. [fixture:
flowchart/gram-subgraph-name-string-click]

## Why mermaid.js reads it so

The lexer of mermaid.js enters its click context at every `click` followed by
whitespace
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L112-L114)),
without checking that a click statement can start there. The rule returns no
token. In the click context, it reads what follows as click ids, up to the next
whitespace, or reads nothing when only strings and whitespace follow; its
grammar then accepts the result wherever it takes those click ids or nothing.

## The rule of this specification, and why

In this specification, `click` is a reserved word: a `click` unit is accepted
only as the first unit of a click statement, and an input with a `click` unit
anywhere else is rejected.

The maintainers of mermaid.js treat `click` as reserved, and treat its use
elsewhere as a defect (see below). This is the third of the reasons for a known
divergence (see [known-divergences.md](../known-divergences.md)).

## The documentation of mermaid.js and its issues

- [Issue #4182](https://github.com/mermaid-js/mermaid/issues/4182), "`click`
  cannot be used for node IDs", was closed on 2023-03-04 by a member of the
  project, who answered that `click` is a reserved keyword. It has the labels
  `Type: Bug / Error` and `Status: Triage`.
- [Issue #7023](https://github.com/mermaid-js/mermaid/issues/7023), "node named
  click is not rendered in flowgraph", is about `click --- abc;`, which
  mermaid.js reads as a click statement and draws as an empty diagram, as this
  specification reads it too. As of 2026-10-02 it is open, with the labels
  `Type: Bug / Error` and `Status: Approved`. A contributor replied on
  2025-10-09 that the input should throw a syntax error, and a collaborator
  answered on 2026-02-27, in a reply marked as written by a bot, that this is a
  reserved keyword collision, approved for a fix. How mermaid.js will change is
  not decided.
