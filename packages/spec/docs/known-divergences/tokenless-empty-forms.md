# tokenless-empty-forms

Japanese version: [tokenless-empty-forms.ja.md](./tokenless-empty-forms.ja.md)

Diagram types: flowchart, sequence, class. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

Some forms are written but hold nothing. In flowchart there are three:

- an **empty string**, `""`, or an empty markdown string;
- an **empty call**, `call` and the whitespace after it, followed by parentheses
  with only whitespace between them, as in `click A call ()`;
- an **empty description block**, `accDescr {}`, with only whitespace between
  the braces.

In sequence, whose grammar has no strings and no `call`, there is the empty
description block only. In class there are five: the three of flowchart, and two
that are written in a class name, an **empty backquoted name**, two backquotes,
and an **empty generic type**, two `~`.

An empty description block on a line of its own is the ordinary way to write
one, and is a description block statement that changes nothing:

```mmd
flowchart LR
  accDescr { }
  A
```

[fixture: flowchart/gram-acc-descr-block-empty]

This document is about these forms where the tree of this specification has no
place for them: inside a statement, or next to other text in a value.

## The difference

Each example is a whole diagram.

1. An empty string before the text of a label:

   ```mmd
   flowchart LR
     A[""x]
   ```

2. An empty call before the name of a callback:

   ```mmd
   flowchart LR
     A
     click A call ()cb
   ```

3. An empty string as a whole label:

   ```mmd
   flowchart LR
     A[""]
   ```

4. An empty description block between an arrow and an id:

   ```mmd
   sequenceDiagram
     A->>accDescr {}B: x
   ```

5. An empty description block before a message on its line:

   ```mmd
   sequenceDiagram
     accDescr {} A ->> B: x
   ```

6. An empty backquoted name inside a class name:

   ```mmd
   classDiagram
     class A``B
   ```

7. An empty string at the start of a statement:

   ```mmd
   classDiagram
     "" A --> B
   ```

8. An empty string as a cardinality:

   ```mmd
   classDiagram
     A "" --> B
   ```

| Example | mermaid.js                         | This specification                           |
| ------- | ---------------------------------- | -------------------------------------------- |
| 1       | the vertex A with the label `x`    | rejected                                     |
| 2       | A calls `cb`, as with `click A cb` | rejected                                     |
| 3       | rejected                           | rejected                                     |
| 4       | the message from A to B            | rejected                                     |
| 5       | the message from A to B            | an empty description block, then the message |
| 6       | the class `AB`                     | rejected                                     |
| 7       | the relation from A to B           | rejected                                     |
| 8       | the relation from A to B           | the relation, with an empty cardinality at A |

[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] [fixture:
flowchart/gram-label-empty-string] [fixture:
sequence/gram-empty-description-block-after-arrow] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] [fixture:
class/div-empty-backquoted-in-name] [fixture:
class/div-empty-string-statement-start] [fixture: class/gram-cardinality-empty]

So mermaid.js reads an input with one of these forms as if the form were not
there. It accepts such an input wherever what is left is accepted: between
statements, inside a statement, next to other text in a label, a style, or a
subgraph name, before the ids of a click statement, and right after the header
keyword. It rejects the input where what is left is not accepted: where the form
is all of a value, as in example 3, and where it lies inside what its lexer
reads as one token, such as an arrow or a number, as in `A --""> B` and
`linkStyle 0""0 stroke:red`. [fixture: flowchart/lex-empty-string-in-arrow]
[fixture: flowchart/gram-linkstyle-number-empty-string]

This specification makes such a form a node where the tree has a place for it,
and rejects the input elsewhere. The places are these: an empty description
block where a statement starts, also inside a sequence box, is a description
block statement, which another statement may follow on the same line (examples 5
and the one above); in class, an empty string as a cardinality of a relation or
as a tooltip is a StringLiteral with the empty value, which the Db reads as none
(example 8), and an empty generic type at the end of a class name is its two `~`
without a generic. [fixture: class/gram-link-tooltip-empty] [fixture:
class/gram-generic-empty-at-end]

Text that only looks like one of these forms is none of them, and both read it
the same: in `A""-->B` the quotes are characters of the vertex `A""`,
`accTitle: ""` has the title `""`, `A[" "]` has a string of one space, and
`A["call ()"]` has the label `call ()`. [fixture:
flowchart/lex-empty-quotes-in-id] [fixture: flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]

The difference goes one way only: mermaid.js accepts and this specification
rejects. The documents of the diagram types list the places in their Known
divergences sections: [flowchart](../diagrams/flowchart.md#known-divergences),
[sequence](../diagrams/sequence.md#known-divergences), and
[class](../diagrams/class.md#known-divergences).

## Why mermaid.js reads it so

The lexer of mermaid.js reads no token for any of these forms. In flowchart, it
passes over the quotes of an empty string
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)),
over the `call` and the parentheses of an empty call
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)),
and over the `accDescr {` and the `}` of an empty description block
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)).
Sequence passes over an empty description block in the same way
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77)),
and class over all five forms
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L34-L35),
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L53-L62),
and
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)).
Each of these rules enters or leaves a state of the lexer and returns nothing,
so the grammar never sees the form.

## The rule of this specification, and why

In this specification, each of these forms is read as units, the same units as
when the form is not empty: an empty string is its two quotes, an empty call its
`call` and its parentheses, an empty description block its `accDescr`, `{`, and
`}`. Where no rule of the grammar takes those units, the input is rejected (see
[Strings](../diagrams/flowchart.md#strings),
[Click and callbacks](../diagrams/flowchart.md#click-and-callbacks), and
[Accessibility values](../diagrams/flowchart.md#accessibility-values)).

Such a form can lie between any two units: inside the value of a leaf node, such
as an id, a label, or a style, as well as between the fields of a node. The tree
has no place there for a node of its own, and leaving the form out of the tree
would lose text that the author wrote. This is the first of the reasons for a
known divergence (see [known-divergences.md](../known-divergences.md)). That
mermaid.js reads no token for a text is not by itself a reason to reject it:
where the tree has a place, the form is a node, and the input is accepted, as
with the text that mermaid.js discards around a direction statement, which is a
[FlowchartIgnoredText](../ast/flowchart.md#flowchartignoredtext). [fixture:
flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value]

## What it means for an author

Where an author writes one of these forms to mean something empty, mermaid.js
rejects it too: `A[""]`, `A("")`, `A-->|""|B`, `A -- "" --> B`,
`click A href ""`, `subgraph ""`, and `click A call ()` are rejected by both.
[fixture: flowchart/gram-label-empty-string] [fixture:
flowchart/gram-shape-round-empty-string] [fixture:
flowchart/gram-link-text-empty-string] [fixture:
flowchart/gram-link-text-dash-empty-string] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-subgraph-name-empty-string-only] [fixture:
flowchart/gram-click-empty-call-only] mermaid.js accepts them only where they
leave nothing, next to other text, where they change nothing that is drawn. This
toolkit rejects such a text and reports the form; removing it gives a text that
both read the same way, in most cases (see below). None of the inputs collected
from the tests, the documentation, and the demos of mermaid.js contains one of
them.

## Counts and how they are checked

The differential test of the parser compares such an input with its **reference
input**: the input without its comment regions and without its empty forms, each
empty string, each empty call from its `call` to its `)`, and each empty
description block that does not start a statement from its `accDescr` to its
`}`. Whether a block starts a statement is decided without the empty strings and
empty calls before it: in `""accDescr {}` followed by a line break and `A`, the
block starts a statement once the empty string is removed, so it stays in the
reference input. [fixture:
flowchart/lex-empty-string-before-empty-description-block]

Where the lexer of this specification reads the reference input as the units of
the input other than those of the empty forms, and mermaid.js accepts the input,
the parser is to give the reference input the Db that mermaid.js gives the
input: `A[""x]` becomes `A[x]`, and `click A call ()cb` becomes `click A cb`.
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] Otherwise the removal joins
what lies on both sides of a form into other units, and mermaid.js may read the
reference input otherwise. In `style A "" fill:red`, the spaces before and after
the empty string become one `space` unit, so the style of the reference input is
`fill:red` instead of a space and `fill:red`. In `A:""::c`, `:` and `::` become
`:::`, so the reference input has the vertex `A` with the class `c` instead of
the vertex `A:::c`. `flowchart""TD` becomes `flowchartTD`, which mermaid.js
rejects. [fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

Inputs were made from the accepted fixtures of each diagram type that have no
comment, no directive, and no frontmatter and are not marked with a divergence,
by inserting each empty form of the diagram type after each space and at the end
of each line after the header. From each diagram type, about 2,000 of them were
taken at even intervals. Each was run through mermaid.js and through the parser
of this specification, and their acceptance and Db were compared:

| Diagram type | Inputs taken, of those made | Rejected by mermaid.js, accepted by this specification | Accepted by both, a different Db | Accepted by mermaid.js, rejected by this specification |
| ------------ | --------------------------: | -----------------------------------------------------: | -------------------------------: | -----------------------------------------------------: |
| flowchart    |             2,081 of 33,292 |                                                     95 |                                0 |                                                  1,134 |
| sequence     |              2,620 of 7,860 |                                                      0 |                                0 |                                                    117 |
| class        |            2,016 of 114,869 |                                                      0 |                                0 |                                                    670 |

The 95 inputs of flowchart have the form inserted into a data block, which
mermaid.js then rejects for its content; they are inputs of
[`embedded-data-opaque`](./embedded-data-opaque.md). In 18 more inputs of
sequence, the form is an empty description block that starts a statement inside
a box; this specification reads it as a description block statement, and
mermaid.js gives each of them the Db that it gives the input without the form.
[fixture: sequence/gram-box-empty-description-block-line] The others are read
the same by both. For each of the 1,921 inputs that mermaid.js accepts and this
specification rejects, the differential test of the parser checked that its
reference input explains the difference, as described above, and found none that
it does not explain.
