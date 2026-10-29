# tokenless-empty-forms

Japanese version: [tokenless-empty-forms.ja.md](./tokenless-empty-forms.ja.md)

Diagram types: flowchart, sequence, class, state, er, gantt, requirement,
mindmap, xychart, quadrant, block, kanban, and agentflow. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

Some forms are written but hold nothing. In flowchart there are three:

- an **empty string**, `""`, or an empty markdown string; [fixture:
  flowchart/lex-empty-string-line] [fixture:
  flowchart/header-empty-markdown-string]
- an **empty call**, `call` and the whitespace after it, followed by parentheses
  with only whitespace between them, as in `click A call ()`; [fixture:
  flowchart/gram-empty-call-line]
- an **empty description block**, `accDescr {}`, with only whitespace between
  the braces. [fixture: flowchart/db-acc-descr-empty-block-alone]

In sequence, whose grammar has no strings and no `call`, there is the empty
description block only, and so in state, which has no `call` and whose lexer
reads `""` as a string unit with a token in the statement context, where a click
statement takes strings. [fixture: state/lex-string-outside-click] [fixture:
state/gram-click-terminal] In the state context, which `state` enters,
mermaid.js reads no token for an empty string either, but there it lies only
where a unit starts, and the tree holds it in every such place: as a
StateIgnoredText before or after a name, before a body, and before or after the
string of an alias statement, and as a StateIgnoredStatement after `state` or
after another statement on its line (see
[The state string context](../diagrams/state.md#the-state-context)). So such an
input is accepted, as in mermaid.js, and is no part of this divergence.
[fixture: state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-state-empty-strings-around-alias-string] [fixture:
state/gram-state-empty-string-after-name] In class there are five: the three of
flowchart, of which the empty string is only `""`, as class has no markdown
strings, and two that are written in a class name, an **empty backquoted name**,
two backquotes, and an **empty generic type**, two `~`. In er there are two: the
empty description block, and **empty backquotes**, two backquotes with nothing
between them, inside an attribute block, where mermaid.js reads no token for
them; between two attributes the tree holds them as an item of the block, so
only those inside an attribute are part of this divergence (see
[Attributes](../diagrams/er.md#attributes)). In gantt there are three: the empty
description block, an **empty href**, `href` and two quotes with nothing between
them, and the empty call, as in flowchart; an empty href and an empty call are
part of this divergence wherever they stand (see
[Empty hrefs and empty calls](../diagrams/gantt.md#empty-hrefs-and-empty-calls)).
In requirement there are two: the empty description block, and the empty string,
`""`, which is part of this divergence wherever it stands (see
[Units and contexts](../diagrams/requirement.md#units-and-contexts)). In mindmap
there are three: an **empty icon**, `::icon()`, an **empty class line**, `:::`
with nothing after it on its line, and an empty string, `""`, or an empty
markdown string inside a shape; all three are part of this divergence wherever
they stand (see [Empty forms](../diagrams/mindmap.md#empty-forms)). In xychart
there are two: the closed empty description block, and the empty string, `""`,
which is part of this divergence where it is not the whole title of an axis or
of a plot or the whole label of a value (see
[Empty strings](../diagrams/xychart.md#empty-strings)). In quadrant there are
three: the closed empty description block, the empty string, `""`, and the empty
markdown string; the two strings are part of this divergence wherever they stand
(see [Empty strings](../diagrams/quadrant.md#empty-strings)). In block there are
the same three, and the two strings are part of this divergence wherever they
stand (see [Empty strings](../diagrams/block.md#empty-strings)). [fixture:
block/div-empty-string-line] [fixture: block/div-empty-markdown-line] [fixture:
block/div-empty-block-in-edge] [fixture: quadrant/div-empty-string-alone]
[fixture: quadrant/div-empty-markdown-string-line] [fixture:
quadrant/div-empty-block-in-quadrant-text] [fixture:
er/div-empty-description-block-in-relationship] [fixture:
er/div-empty-backquotes-between-type-and-name] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
gantt/div-empty-href-before-call] [fixture: gantt/div-empty-call-before-href]
[fixture: gantt/gram-empty-href-line] [fixture: gantt/gram-empty-call-line]
[fixture: requirement/div-empty-string-line] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
mindmap/div-empty-icon-before-root] [fixture:
mindmap/div-empty-class-before-root] [fixture:
mindmap/div-empty-string-in-shape] [fixture:
mindmap/div-empty-markdown-string-in-shape] [fixture:
xychart/div-empty-string-line] [fixture:
xychart/div-empty-description-block-in-categories]

An empty description block on a line of its own is the ordinary way to write
one, and is a description block statement that changes nothing:

```mmd
flowchart LR
  accDescr { }
  A
```

The example keeps the empty description block as a statement. [fixture:
flowchart/gram-acc-descr-block-empty]

This document is about these forms where the tree of this specification has no
place for them: inside a statement, or next to other text in a value.

In kanban, an empty icon `::icon()` and an empty class line `:::` are rejected
wherever recognized, including before the first node and after a completed
shape, as in mindmap. [fixture: kanban/db-decoration-empty-class] [fixture:
kanban/db-decoration-empty-icon] [fixture: kanban/div-empty-icon-before-first]
[fixture: kanban/div-empty-icon-header] [fixture: kanban/div-empty-class-header]
[fixture: kanban/div-class-before-first-unindented-empty] [fixture:
kanban/div-class-end-empty] [fixture: kanban/div-empty-icon-after-shape]
[fixture: kanban/div-empty-class-after-shape] An empty string or markdown string
inside a shape is also rejected, including before or after a nonempty label (see
[Empty forms](../diagrams/kanban.md#empty-forms)). [fixture:
kanban/div-empty-string-before-label] [fixture:
kanban/div-empty-markdown-before-label] [fixture:
kanban/div-empty-string-after-label] [fixture:
kanban/div-empty-markdown-after-label] [fixture:
kanban/div-string-before-string] [fixture:
kanban/div-empty-markdown-before-string]

Bare `""` and empty markdown strings outside a shape are node text. [fixture:
kanban/db-empty-string-node] [fixture: kanban/db-empty-markdown-node] An empty
`@{}` is a data block. [fixture: kanban/db-metadata-empty] None of these is a
discarded empty form.

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

The fixtures record the readings compared in the table. [fixture:
flowchart/tokens-empty-string-in-label] [fixture:
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

Where the input without its comment regions
([Reading a source](../common.md#reading-a-source)) and without these forms is
read as the units of the input other than those of the forms, the same units in
the same order, this specification gives that input the Db that mermaid.js gives
the input. `subgraph a ""`, a line `A`, and a line `end` read as the same lines
without the empty string, also with a comment line, which is left out too, or an
empty line, which is kept, after the first line; `A[""x]` reads as `A[x]`, also
before a U+2028 or a U+2029; and in a Gantt chart, an empty href with a
directive between its quotes is left out with the directive. [fixture:
flowchart/db-subgraph-id-trailing-empty-string] [fixture:
flowchart/db-subgraph-id-trailing-empty-string-comment-line] [fixture:
flowchart/db-subgraph-id-trailing-empty-string-blank-line] [fixture:
flowchart/tokens-empty-string-in-label] [fixture:
flowchart/db-label-leading-empty-string-line-separator] [fixture:
flowchart/db-label-leading-empty-string-paragraph-separator] [fixture:
gantt/div-empty-href-directive-between-quotes-before-call] An empty description
block that the document of its diagram type reads as a statement, once the forms
before it are left out, is not one of these forms and stays: one where a
statement starts, and one after the last unit of a statement that only other
empty description blocks and then the separator of the statement follow. In
flowchart, a statement also starts right after another description block, and
the blocks before a separator are described in
[Empty description blocks before a separator](../diagrams/flowchart.md#empty-description-blocks-before-a-separator).
So blocks written one after another, with only whitespace between them, are
decided together, by what follows the last of them. In `""accDescr {}` followed
by a line break and `A`, the block starts a statement once the empty string is
left out, and so do two or three blocks there, with a space, a tab, or nothing
between them, also with `A` after them on the same line. [fixture:
flowchart/lex-empty-string-before-empty-description-block] [fixture:
flowchart/div-empty-string-before-empty-description-blocks] [fixture:
flowchart/div-empty-string-before-three-empty-description-blocks] [fixture:
flowchart/div-empty-string-before-glued-empty-description-blocks] [fixture:
flowchart/div-empty-string-before-tab-empty-description-blocks] [fixture:
flowchart/div-empty-string-before-empty-description-blocks-then-vertex] In
`A[""x]` followed by two or three blocks and a line feed, a `;`, or the end of
the text, the blocks stay too, and so they do with a comment line, an empty
line, or a directive between two blocks, before a `;` that the line rule ignores
after the blocks of a style statement, and with a U+2028 or a U+2029 before the
line feed. mermaid.js gives each of these inputs without the empty string the Db
of the input. [fixture:
flowchart/div-empty-string-then-empty-description-blocks-before-line-feed]
[fixture:
flowchart/div-empty-string-then-three-empty-description-blocks-before-line-feed]
[fixture:
flowchart/div-empty-string-then-glued-empty-description-blocks-before-line-feed]
[fixture:
flowchart/div-empty-string-then-tab-empty-description-blocks-before-line-feed]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-before-semicolon]
[fixture: flowchart/div-empty-string-then-empty-description-blocks-before-end]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-around-comment-line]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-around-blank-line]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-around-directive]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-before-ignored-semicolon]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-before-line-separator]
[fixture:
flowchart/div-empty-string-then-empty-description-blocks-before-paragraph-separator]
In `A`, two or three blocks, and `--> B`, more of the statement follows the last
block, so all of them are left out, the whitespace on their two sides joins into
one run, and nothing follows for the input without them. [fixture:
flowchart/div-empty-description-blocks-before-link] [fixture:
flowchart/div-three-empty-description-blocks-before-link] [fixture:
flowchart/div-glued-empty-description-blocks-before-link] [fixture:
flowchart/div-tab-empty-description-blocks-before-link] Where leaving the forms
out joins the text on their two sides into other units, nothing follows for the
input without them, and mermaid.js may read it otherwise. `1""2-->B` without the
empty string has the one unit `12`. `style A "" ;fill:red` has two spaces after
`A`, which mermaid.js rejects. In `style A "" fill:#f00;`, whose last `;` the
line rule ignores, the two spaces join, and mermaid.js gives the input the style
` fill:#f00` and the input without the empty string `fill:#f00`. In
`subgraph a ""` followed by a U+2028 or a U+2029, the space before the empty
string and the U+2028 or U+2029 after it become one run of whitespace, and so do
the space before the empty string and the space after the directive in
`subgraph ""%%{init: {}}%% a`. In class, `direction accDescr {} LR` without the
block is a direction line, while mermaid.js reads the input otherwise (see
below). [fixture: flowchart/tokens-id-empty-string-between] [fixture:
flowchart/db-style-empty-string-separator] [fixture:
flowchart/db-style-empty-string-ignored-semicolon] [fixture:
flowchart/db-subgraph-id-trailing-empty-string-line-separator] [fixture:
flowchart/db-subgraph-id-trailing-empty-string-paragraph-separator] [fixture:
flowchart/db-subgraph-id-empty-string-directive-space] [fixture:
class/div-empty-description-block-between-direction-and-value]

One form of class is read otherwise. mermaid.js reads a direction line of class
with one rule over `direction`, the whitespace, and the value, so an empty
description block between them keeps that rule from matching, and mermaid.js
reads `direction` and the value as the two name parts of a member statement,
which it joins without the whitespace: `direction accDescr {} LR` keeps the
direction `TB` and declares no class, while `direction LR` sets `LR`, and
`direction accDescr {} LR : x` declares the class `directionLR` with the member
`x`. So mermaid.js does not read this input as if the block were not there.
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/div-empty-description-block-before-direction-value-glued]
[fixture: class/div-empty-description-block-between-direction-and-value-label]

In class and state, a block also keeps another rule of mermaid.js that spans
whitespace from matching: mermaid.js reads `accTitle accDescr {}: t` as the name
`accTitle` with a member or a description, while `accTitle : t` is a title. This
specification rejects the input, since the block lies inside that statement.
[fixture: class/div-empty-description-block-between-acc-title-and-colon]
[fixture: state/div-empty-description-block-between-acc-title-and-colon]

Text that only looks like one of these forms is none of them, and both read it
the same: in `A""-->B` the quotes are characters of the vertex `A""`,
`accTitle: ""` has the title `""`, `A[" "]` has a string of one space, and
`A["call ()"]` has the label `call ()`. [fixture:
flowchart/lex-empty-quotes-in-id] [fixture: flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]

The difference goes one way only: mermaid.js accepts and this specification
rejects. The documents of the diagram types give examples of them in their Known
divergences sections: [flowchart](../diagrams/flowchart.md#known-divergences),
[sequence](../diagrams/sequence.md#known-divergences),
[class](../diagrams/class.md#known-divergences),
[state](../diagrams/state.md#known-divergences),
[er](../diagrams/er.md#known-divergences),
[gantt](../diagrams/gantt.md#known-divergences),
[requirement](../diagrams/requirement.md#known-divergences),
[mindmap](../diagrams/mindmap.md#known-divergences),
[xychart](../diagrams/xychart.md#known-divergences),
[quadrant](../diagrams/quadrant.md#known-divergences), and
[block](../diagrams/block.md#known-divergences).

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
toolkit rejects such a text and reports the form. Removing the form gives a text
that both read the same way, unless the text holds another of the
[known divergences](../known-divergences.md). mermaid.js usually reads that text
as it read the one with the form, which it reads as if the form were not there
(see [The difference](#the-difference)), but not where the form kept apart two
parts of the text that it reads together once the form is gone: it then reads
that text otherwise, or rejects it. `style A "" ""fill:red` has the style of a
space and `fill:red`, while `style A`, two spaces, and `fill:red` has the style
`fill:red`; `A:""::c` is the vertex `A:::c`, while `A:::c` is the vertex A with
the class `c`; in class, `direction accDescr {} LR` keeps the direction `TB`,
while `direction`, two spaces, and `LR` sets `LR`; and `flowchart""TD` is
accepted, while `flowchartTD` has no header and is rejected by both. [fixture:
flowchart/db-style-empty-strings-one-space] [fixture:
flowchart/db-style-two-spaces-before-style] [fixture:
flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/lex-triple-colon-after-id] [fixture:
class/div-empty-description-block-between-direction-and-value] [fixture:
class/lex-direction-two-spaces-before-value] [fixture:
flowchart/header-empty-string-no-space] [fixture:
flowchart/header-keyword-direction-glued] None of the inputs collected from the
tests, the documentation, and the demos of mermaid.js contains one of them.

## Why mermaid.js reads it so

The lexer of mermaid.js reads no token for any of these forms. In flowchart, it
passes over the quotes of an empty string
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)),
over the `call` and the parentheses of an empty call
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)),
and over the `accDescr {` and the `}` of an empty description block
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)).
Sequence and state pass over an empty description block in the same way
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77),
[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L93-L95)),
and class over all five forms
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L34-L35),
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L53-L62),
and
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)).
Er passes over an empty description block
([`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L16-L18))
and over empty backquotes
([`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L38-L40)).
Gantt passes over an empty description block
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L24-L25)),
over `href`, its whitespace, and both quotes of an empty href
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L42-L43)),
and over `call`, its whitespace, and the parentheses of an empty call
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L54-L55)).
Requirement passes over an empty description block
([`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L23-L24))
and over the quotes of an empty string, in the statement context and in the
style context
([`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L85-L96)).
Mindmap passes over `:::` with nothing after it on its line and over `::icon(`
and `)` with nothing between them
([`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L24-L32)),
and over the quotes of an empty string and the delimiters of an empty markdown
string
([`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L45-L50)).
Xychart passes over a closed empty description block
([`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L28-L30))
and over the quotes of an empty string
([`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L54-L56)).
Quadrant passes over a closed empty description block
([`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L28-L29)),
over the delimiters of an empty markdown string
([`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L41-L43)),
and over the quotes of an empty string
([`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L44-L45)).
Block passes over a closed empty description block
([`block.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/parser/block.jison#L79-L80)),
over the delimiters of an empty markdown string
([`block.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/parser/block.jison#L50-L52)),
and over the quotes of an empty string
([`block.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/parser/block.jison#L53-L54)).
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
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-empty-call-before-link] [fixture:
flowchart/gram-empty-description-block-before-link]

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

This specification makes such a form a node where the tree has a place for it,
and rejects the input elsewhere. The places are these: an empty description
block where a statement starts, also inside a sequence box, is a description
block statement, which another statement may follow on the same line (example
5), and so is one after the last unit of a statement and before its separator,
as in `A accDescr {}`, `note for A "x" accDescr {}` in class, and
`autonumber accDescr {}` in sequence, and so is one after the header, before its
separator, as in `flowchart LR accDescr {}` and `classDiagram accDescr {}`
followed by a line break (see the sections on empty description blocks before a
separator of
[flowchart](../diagrams/flowchart.md#empty-description-blocks-before-a-separator),
[class](../diagrams/class.md#empty-description-blocks-before-a-separator),
[sequence](../diagrams/sequence.md#empty-description-blocks-before-a-separator),
and [state](../diagrams/state.md#empty-description-blocks-before-a-separator));
[fixture: flowchart/gram-empty-description-block-after-vertex] [fixture:
class/gram-empty-description-block-after-note] [fixture:
sequence/gram-empty-description-block-after-autonumber] [fixture:
flowchart/header-empty-description-block-after-direction] [fixture:
class/header-empty-description-block] in class, an empty string as a cardinality
of a relation or as a tooltip is a StringLiteral with the empty value, which the
Db reads as none (example 8), and an empty generic type at the end of a class
name is its two `~` without a generic. [fixture: class/gram-link-tooltip-empty]
[fixture: class/gram-generic-empty-at-end] In state, nothing separates two
statements, so a statement starts right after each statement:
`A --> B accDescr {}` is a transition and a description block statement, while
in `A --> accDescr {} B` the block lies inside the transition, and the input is
rejected. A block, or a run of blocks with only whitespace between them, after
which a unit continues the statement before it, a `-->`, a `:::`, or a
description after a state reference, lies inside that statement too:
`A accDescr {} --> B` and `A --> B accDescr {} : x` are rejected. [fixture:
state/gram-empty-description-block-after-transition] [fixture:
state/div-empty-description-block-after-arrow] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-label]

An empty description block that lies neither where a statement starts nor before
the separator of a statement or of the header lies inside a statement. The tree
holds the empty strings of the state context and the empty description blocks
before a separator, and inside a composite or alias statement of state, the
blocks before the `{` of a body on the line after the name, in the
`textBeforeBody` that holds the other text that mermaid.js does not read there.
Apart from agentflow's name and click-prefix positions below, it holds no other
empty description block inside a statement, for one of two reasons:

- (a) Between two units of a statement, holding the block would take a field for
  text that mermaid.js does not read in that gap of the statement's node. Such a
  block can lie in almost every gap of every statement, so every gap of every
  statement node would need such a field.
- (b) Inside a value, such as an arrow, a style, or a name of name parts, no
  field can hold it, since the value lies on both sides of it.

An empty string of the state context, by contrast, lies only where a unit of the
state context starts, which is at a few fixed places of the composite and alias
statements, each with its field, as does a block before the `{` of a body, and a
block before a separator lies after the last unit of a statement, where a
statement can follow. [fixture:
state/gram-empty-description-block-before-alias-body-next-line] The places below
are examples, at least one for each statement node in which mermaid.js accepts
such a block, with the reason that applies; they do not exhaust the places,
which the rule above decides. In flowchart:

- Between two units of a FlowchartVertexStatement, with its FlowchartVertexGroup
  and FlowchartLink: `A accDescr {}-->B`, `A-->accDescr {}B`,
  `A accDescr {}& B`, `A & accDescr {}B`, `A e1@accDescr {} --> B`,
  `A --> accDescr {}|t| B`, `A -->|t| accDescr {}B`, `A &accDescr {} B[y]`, and
  `A@{ label: x } &accDescr {} A[y]`. Holding it would take a field in that gap
  (reason a). [fixture: flowchart/gram-empty-description-block-before-link]
  [fixture: flowchart/div-empty-description-block-after-arrow-glued] [fixture:
  flowchart/div-empty-description-block-before-ampersand] [fixture:
  flowchart/div-empty-description-block-after-ampersand] [fixture:
  flowchart/div-empty-description-block-after-edge-id] [fixture:
  flowchart/div-empty-description-block-before-link-label] [fixture:
  flowchart/div-empty-description-block-after-link-label] [fixture:
  flowchart/div-ampersand-empty-block-then-vertex] [fixture:
  flowchart/div-data-block-ampersand-empty-block-then-vertex]
- Between two units of a FlowchartStyleStatement, a FlowchartClassDefStatement,
  a FlowchartClassStatement, or a FlowchartLinkStyleStatement:
  `style A accDescr {} fill:red`, `style A fill:red accDescr {},stroke:blue`,
  `classDef accDescr {}c fill:red`, `class accDescr {}A c`, and
  `linkStyle accDescr {}0 stroke:red`. Holding it would take a field in that gap
  (reason a). [fixture:
  flowchart/db-style-first-style-after-empty-description-block] [fixture:
  flowchart/div-empty-description-block-before-style-comma] [fixture:
  flowchart/div-empty-description-block-before-classdef-names] [fixture:
  flowchart/div-empty-description-block-before-class-ids] [fixture:
  flowchart/div-empty-description-block-before-linkstyle-numbers]
- Inside a style, a FlowchartLiteral: `style A fill:accDescr {}red`, and
  `style A fill:red accDescr {} %% c`. A `%%` after other text on its line is no
  comment in flowchart but text (see
  [Comment lines](../common.md#comment-lines)), so the style is `fill:red`, two
  spaces, and `%% c`, with the block inside it. No field can hold it there,
  inside a value (reason b). [fixture:
  flowchart/div-empty-description-block-in-style] [fixture:
  flowchart/div-empty-description-block-in-style-before-percent]
- Between two units of a FlowchartClickUrlStatement or a
  FlowchartClickCallbackStatement: `click A accDescr {}href "u"`,
  `click A "u"accDescr {} "t"`, `click A href "u"accDescr {} _blank`, and
  `click A call cb()accDescr {} "t"`. Holding it would take a field in that gap
  (reason a). [fixture: flowchart/div-empty-description-block-before-href]
  [fixture: flowchart/div-empty-description-block-before-click-tooltip]
  [fixture: flowchart/div-empty-description-block-before-link-target] [fixture:
  flowchart/div-empty-description-block-before-callback-tooltip]
- Between two units of a FlowchartSubgraphStatement:
  `subgraph accDescr {} fe [Front end]`, `subgraph accDescr {}"x"y`, and
  `subgraph fe accDescr {} [Front end]`. Holding it would take a field in that
  gap (reason a). [fixture:
  flowchart/div-empty-description-block-before-subgraph-name] [fixture:
  flowchart/gram-subgraph-name-empty-description-block-then-string] [fixture:
  flowchart/div-empty-description-block-before-subgraph-title]
- Inside the name of a subgraph, a FlowchartLabel: `subgraph a accDescr {} b`,
  and `subgraph S accDescr {} %% c`, whose `%% c` is text of the name, as above,
  so that its title is `S`, two spaces, and `%% c`. No field can hold it there,
  inside a value (reason b). [fixture:
  flowchart/gram-empty-description-block-in-subgraph-name] [fixture:
  flowchart/div-empty-description-block-in-subgraph-name-before-percent]

In class:

- Between two units of a ClassRelationStatement, with its ClassName:
  `A accDescr {} --> B` and `A accDescr {}~T~ <|-- B`. Holding it would take a
  field in that gap (reason a). [fixture:
  class/div-empty-description-block-in-statement] [fixture:
  class/div-empty-description-block-before-generic]
- Inside a ClassArrow, or inside a name of name parts, an Identifier:
  `A --accDescr {}> B`, `A accDescr {} - B --> C`, whose name is `A-B`, and
  `direction accDescr {} LR` (see above). No field can hold it there, inside a
  value (reason b). [fixture: class/div-empty-description-block-in-arrow]
  [fixture: class/div-empty-description-block-in-dashed-name] [fixture:
  class/div-empty-description-block-between-direction-and-value]
- Between two units of a ClassNoteStatement, a ClassMemberStatement, a
  ClassLinkStatement, a ClassCallbackStatement, a ClassCssClassStatement, a
  ClassClassDefStatement, a ClassStyleStatement, or a ClassAnnotationStatement:
  `note for accDescr {}A "x"`, `A accDescr {}: x`,
  `click accDescr {}A href "u"`, `click A accDescr {} href "u" "t"`,
  `click A href "u" "t" accDescr {} _self`, `callback A accDescr {} "f"`,
  `click A call f() accDescr {} "t"`, `cssClass accDescr {}"A" c`,
  `cssClass "A" accDescr {} c`, `classDef c accDescr {} fill:red`,
  `style C accDescr {} fill:red`, and `<<interface>> accDescr {} Class01`.
  Holding it would take a field in that gap (reason a). [fixture:
  class/div-empty-description-block-before-note-class] [fixture:
  class/div-empty-description-block-before-member-colon] [fixture:
  class/div-empty-description-block-before-click-class] [fixture:
  class/div-empty-description-block-before-href] [fixture:
  class/div-empty-description-block-before-link-target] [fixture:
  class/div-empty-description-block-in-callback] [fixture:
  class/div-empty-description-block-before-click-call-tooltip] [fixture:
  class/div-empty-description-block-before-css-class-ids] [fixture:
  class/div-empty-description-block-before-css-class-name] [fixture:
  class/div-empty-description-block-in-class-def] [fixture:
  class/div-empty-description-block-in-style] [fixture:
  class/div-empty-description-block-after-annotation]
- Inside the name of a ClassAnnotation: `<<accDescr {}interface>> A`. No field
  can hold it there, inside a value (reason b). [fixture:
  class/div-empty-description-block-in-annotation]

In sequence:

- Between two units of a SequenceMessageStatement: `A->>accDescr {}B: x`,
  `A() accDescr {}->>()B: x`, `A->> accDescr {}+B: x`, and
  `A->>+ accDescr {}B: x`. Holding it would take a field in that gap (reason a).
  [fixture: sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/div-empty-description-block-after-central-connection] [fixture:
  sequence/div-empty-description-block-before-activation] [fixture:
  sequence/div-empty-description-block-after-activation]
- Between two units of a SequenceNoteStatement: `note accDescr {} left of A: x`,
  `note left of accDescr {} A: x`, and `note over A,accDescr {}B: x`. Holding it
  would take a field in that gap (reason a). [fixture:
  sequence/div-empty-description-block-before-note-placement] [fixture:
  sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/div-empty-description-block-between-note-ids]
- Between two units of a SequenceLinkStatement, a SequenceLinksStatement, a
  SequencePropertiesStatement, or a SequenceDetailsStatement:
  `link accDescr {}A: x@https://u`, `links accDescr {} A: {"a": "https://u"}`,
  `properties accDescr {} A: {}`, and `details accDescr {} A: x`. Holding it
  would take a field in that gap (reason a). [fixture:
  sequence/div-empty-description-block-before-link-id] [fixture:
  sequence/div-empty-description-block-before-links-id] [fixture:
  sequence/div-empty-description-block-before-properties-id] [fixture:
  sequence/div-empty-description-block-before-details-id]
- Between two units of a SequenceAutonumberStatement:
  `autonumber accDescr {}1 2` and `autonumber accDescr {} off`. Holding it would
  take a field in that gap (reason a). [fixture:
  sequence/div-empty-description-block-before-autonumber-numbers] [fixture:
  sequence/div-empty-description-block-before-autonumber-off]
- Between `create` and the keyword of a SequenceParticipantStatement or a
  SequenceDestroyStatement: `create accDescr {}participant A` and
  `create accDescr {} destroy A`. Holding it would take a field in that gap
  (reason a). [fixture: sequence/div-empty-description-block-after-create]
  [fixture: sequence/div-empty-description-block-before-destroy]

In state, all between two units of a statement:

- `A accDescr {} --> B` and `[*] accDescr {} --> A`: a field between the source
  and the arrow of a StateTransitionStatement. [fixture:
  state/div-empty-description-block-in-transition] [fixture:
  state/div-empty-description-block-terminal-before-arrow]
- `A --> accDescr {} B` and `A --> accDescr {} [*]`: a field between the arrow
  and the target of a StateTransitionStatement. [fixture:
  state/div-empty-description-block-after-arrow] [fixture:
  state/div-empty-description-block-before-terminal-target]
- `A --> B accDescr {} : x`: a field before the label of a
  StateTransitionStatement. [fixture:
  state/div-empty-description-block-before-label]
- `A accDescr {} : x`: a field before the description of a
  StateDefinitionStatement. [fixture:
  state/div-empty-description-block-before-description]
- `A accDescr {} :::c --> B` and `A --> B accDescr {} :::c`: a field before the
  `:::` of a StateReference. [fixture:
  state/div-empty-description-block-before-class] [fixture:
  state/div-empty-description-block-before-target-class]
- `A:::accDescr {}c`: a field between the `:::` and the class of a
  StateReference. [fixture:
  state/div-empty-description-block-after-class-separator]
- `click accDescr {} A "u" "t"`: a field before the id of a StateClickStatement.
  [fixture: state/div-empty-description-block-in-click-before-id]
- `click A accDescr {} "u" "t"` and `click A href accDescr {} "u"`: a field
  before the URL of a StateClickStatement. [fixture:
  state/div-empty-description-block-in-click-before-url] [fixture:
  state/div-empty-description-block-in-click-after-href]
- `click A "u" accDescr {} "t"`: a field before the tooltip of a
  StateClickStatement. [fixture:
  state/div-empty-description-block-in-click-before-tooltip]

In er, all between two units of a statement, where holding the block would take
a field for that gap (reason a): `A accDescr {} ||--o{ B : x` and
`A ||--o{ accDescr {} B : x` in an ErRelationshipStatement,
`A accDescr {} :::c`, `A accDescr {} [P]`, and `A[accDescr {} P]` in an
ErEntityStatement, `subgraph accDescr {} S` and `subgraph S [accDescr {} T]` in
an ErSubgraphStatement, and `class A accDescr {} a` in an ErClassStatement; and
empty backquotes between the units of an ErAttribute, as in `int `` a` and
`int a `` PK` (reason a). Between two attributes, before the first, and after
the last, the tree holds empty backquotes as an ErIgnoredText item of the
attribute list, so the input is accepted (see
[Attributes](../diagrams/er.md#attributes)). [fixture:
er/div-empty-description-block-in-relationship] [fixture:
er/div-empty-description-block-after-spec] [fixture:
er/div-empty-description-block-before-class-separator] [fixture:
er/div-empty-description-block-before-alias] [fixture:
er/div-empty-description-block-in-alias-start] [fixture:
er/div-empty-description-block-before-subgraph-id] [fixture:
er/div-empty-description-block-in-subgraph-title-start] [fixture:
er/div-empty-description-block-in-class] [fixture:
er/div-empty-backquotes-between-type-and-name] [fixture:
er/div-empty-backquotes-before-key] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-before-first] [fixture:
er/gram-empty-backquotes-after-last]

In gantt, an empty description block between the ids of a GanttClickStatement
and its first part, and between its two parts, where holding the form would take
a field for that gap (reason a): `click id1 accDescr {} href "u"`; and an empty
href or an empty call wherever it stands, `href ""` on a line of its own and
`call ()x : 1d` included, because the tree holds no statement for a link or a
call that mermaid.js discards whole, as in flowchart; where a statement starts,
an empty description block is a statement, and the input is accepted (see
[Empty hrefs and empty calls](../diagrams/gantt.md#empty-hrefs-and-empty-calls)).
[fixture: gantt/div-empty-description-block-between-click-id-and-href] [fixture:
gantt/div-empty-description-block-between-call-and-href] [fixture:
gantt/div-empty-href-before-call] [fixture:
gantt/div-empty-href-glued-before-href] [fixture:
gantt/div-empty-call-before-href] [fixture: gantt/gram-empty-href-line]
[fixture: gantt/gram-empty-call-line] [fixture:
gantt/gram-click-href-then-empty-href]

In requirement, an empty description block between two units of a statement,
where holding the block would take a field for that gap (reason a):
`requirement accDescr {} r {`, `requirement r:::accDescr {} c {`, and
`requirement "r" accDescr {} {` in a RequirementRequirementStatement,
`id accDescr {}: 1`, `id: accDescr {} 1`, and `risk: accDescr {} high` in a
field, `type: accDescr {} t` in a RequirementElementField,
`a - accDescr {} satisfies -> b`, `a - satisfies accDescr {} -> b`,
`a - satisfies -> accDescr {} b`, `a <- accDescr {} satisfies - b`, and
`"a" accDescr {} - satisfies -> b` in a RequirementRelationshipStatement, and
`r:::accDescr {} c` and `"r" accDescr {}:::c` in a
RequirementClassShorthandStatement; and an empty string wherever the statement
context or the style context reads one, on a line of its own, before a
statement, after the header, after `}`, on a line of a body, before or after the
value of a field, between two units of a statement, and in the style context,
because the tree holds no statement for a string that mermaid.js discards whole,
as in flowchart and class. Where a statement starts, an empty description block
is a statement, and on a line of the body of a requirement or an element it is a
RequirementIgnoredText item of the body, so the input is accepted (see
[Empty description blocks](../diagrams/requirement.md#empty-description-blocks)).
[fixture: requirement/div-empty-description-block-between-keyword-and-name]
[fixture: requirement/div-empty-description-block-after-class-separator]
[fixture: requirement/div-empty-description-block-before-brace] [fixture:
requirement/div-empty-description-block-before-field-colon] [fixture:
requirement/div-empty-description-block-after-field-colon] [fixture:
requirement/div-empty-description-block-before-risk] [fixture:
requirement/div-empty-description-block-before-element-value] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/div-empty-description-block-before-arrow] [fixture:
requirement/div-empty-description-block-after-arrow] [fixture:
requirement/div-empty-description-block-in-backward-relationship] [fixture:
requirement/div-empty-description-block-after-string-source] [fixture:
requirement/div-empty-description-block-after-shorthand-separator] [fixture:
requirement/div-empty-description-block-before-shorthand-separator] [fixture:
requirement/div-empty-string-line] [fixture:
requirement/div-empty-string-before-statement] [fixture:
requirement/div-empty-string-after-header] [fixture:
requirement/div-empty-string-after-close-brace] [fixture:
requirement/div-empty-string-body-line] [fixture:
requirement/div-empty-string-before-value] [fixture:
requirement/div-empty-string-in-relationship] [fixture:
requirement/div-empty-string-before-style] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/gram-empty-description-block-after-string-value]

In mindmap, an empty icon, an empty class line, or an empty string inside a
shape, wherever it stands: an icon or a class line after a node or before the
root, and an empty string or an empty markdown string before the text of a
shape, because the tree holds no statement for an icon or a class line that
mermaid.js discards whole, and no label for a string that it discards whole, as
in flowchart and class (see [Empty forms](../diagrams/mindmap.md#empty-forms)).
[fixture: mindmap/db-icon-empty] [fixture: mindmap/div-empty-icon-before-root]
[fixture: mindmap/db-class-empty] [fixture: mindmap/div-empty-class-before-root]
[fixture: mindmap/div-empty-string-in-shape] [fixture:
mindmap/div-empty-markdown-string-in-shape]

In xychart, a closed empty description block where no statement starts: inside
the words of a title, after an axis or a plot keyword, inside the categories,
the values, or a range, and between the header and the orientation, where no
field can hold it (reasons a and b); and an empty string that is not the whole
title of an axis or of a plot or the whole label of a value: on a line of its
own, before or after a statement, before or after the text of a title, of an
axis, or of a plot, before or after a category, before a value, before or after
a label, and between the header and the orientation, because the tree holds no
statement for a string that mermaid.js discards whole, as in flowchart and
class. As the whole title or label, an empty string is a StringLiteral with the
empty value, which the Db reads as no title and no label, as in class (see
[Empty description blocks](../diagrams/xychart.md#empty-description-blocks) and
[Empty strings](../diagrams/xychart.md#empty-strings)). [fixture:
xychart/div-empty-description-block-inside-title-text] [fixture:
xychart/div-empty-description-block-inside-axis] [fixture:
xychart/div-empty-description-block-inside-plot] [fixture:
xychart/div-empty-description-block-inside-values] [fixture:
xychart/div-empty-description-block-in-categories] [fixture:
xychart/div-empty-description-block-in-range] [fixture:
xychart/div-empty-description-block-before-orientation] [fixture:
xychart/div-empty-string-line] [fixture:
xychart/div-empty-string-before-statement] [fixture:
xychart/div-empty-string-after-title] [fixture:
xychart/div-empty-string-before-title-word] [fixture:
xychart/div-empty-string-after-quoted-title] [fixture:
xychart/div-empty-string-before-axis-title] [fixture:
xychart/div-empty-string-after-axis-title] [fixture:
xychart/div-empty-string-before-plot-title] [fixture:
xychart/div-empty-string-after-plot-title] [fixture:
xychart/div-empty-string-twice-as-plot-title] [fixture:
xychart/div-empty-string-before-category] [fixture:
xychart/div-empty-string-after-category] [fixture:
xychart/div-empty-string-before-value] [fixture:
xychart/div-empty-string-before-label] [fixture:
xychart/div-empty-string-after-label] [fixture:
xychart/div-empty-string-before-orientation] [fixture:
xychart/db-grid-empty-plot-title-quoted] [fixture:
xychart/db-empty-string-as-x-axis-title-before-band] [fixture:
xychart/db-label-empty-string]

In quadrant, a closed empty description block inside a statement: inside a text
or a name, between the `]` of a point and its styles, and between the name of a
class of `classDef` and its styles, where no field can hold it (reasons a and
b), while where a statement starts and after the last unit of a statement it is
a description block statement; and an empty string or an empty markdown string
wherever mermaid.js accepts it: on a line of its own, before a statement, before
or after a word of a text or a name, after the arrow of an axis, among the
styles of a point, and in a `classDef` line, because the tree holds no statement
for a string that mermaid.js discards whole, as in flowchart and class. No text
holds it as its whole value: `quadrant-1 ""` is rejected by both, and mermaid.js
reads `x-axis L --> ""` as the axis statement with the arrow and no second text,
which a second text with the empty value would not give (see
[Empty description blocks](../diagrams/quadrant.md#empty-description-blocks) and
[Empty strings](../diagrams/quadrant.md#empty-strings)). [fixture:
quadrant/div-empty-block-in-classdef] [fixture:
quadrant/div-empty-block-in-name] [fixture:
quadrant/div-empty-block-in-quadrant-text] [fixture:
quadrant/div-empty-block-in-x-axis-text] [fixture:
quadrant/div-empty-string-after-name] [fixture:
quadrant/div-empty-string-before-name] [fixture:
quadrant/div-empty-string-before-quadrant-text] [fixture:
quadrant/div-empty-string-before-statement] [fixture:
quadrant/div-empty-string-between-words] [fixture:
quadrant/div-empty-string-in-classdef] [fixture:
quadrant/div-empty-string-in-point-styles] [fixture:
quadrant/div-empty-string-in-quadrant-text] [fixture:
quadrant/div-empty-string-inside-word] [fixture: quadrant/div-empty-string-line]
[fixture: quadrant/div-x-axis-empty-string-after-arrow] [fixture:
quadrant/div-y-axis-empty-string-after-arrow] [fixture:
quadrant/div-empty-block-between-point-and-styles] [fixture:
quadrant/div-empty-markdown-string-before-statement] [fixture:
quadrant/div-empty-markdown-string-line] [fixture:
quadrant/div-empty-string-alone] [fixture:
quadrant/div-x-axis-empty-markdown-string-after-arrow] [fixture:
quadrant/gram-quadrant-empty-string] [fixture:
quadrant/gram-x-axis-empty-string-with-arrow] [fixture:
quadrant/gram-name-quoted-empty] [fixture: quadrant/db-empty-string-in-title]
[fixture: quadrant/db-empty-block-after-point] [fixture:
quadrant/db-empty-block-before-statement]

In block, which has no accessibility statement, a closed empty description block
inside a statement, such as between an arrow and the node it leads to, where no
field can hold it (reasons a and b), while where a statement starts it is a
description block statement with no fields; and an empty string or an empty
markdown string wherever mermaid.js accepts it: on a line of its own, before or
after an id, an edge, a shape, a width, or `end`, before and inside a composite,
and between `columns` and its number, because the tree holds no statement for a
string that mermaid.js discards whole, as in flowchart and class. No label holds
it as its whole value: `A[""]` and `A -- "" --> B` are rejected by both, and
glued to an id, `""` is part of the id (see
[Empty description blocks](../diagrams/block.md#empty-description-blocks) and
[Empty strings](../diagrams/block.md#empty-strings)). [fixture:
block/div-empty-block-in-edge] [fixture: block/div-empty-markdown-between]
[fixture: block/div-empty-markdown-line] [fixture:
block/div-empty-string-after-edge] [fixture: block/div-empty-string-after-id]
[fixture: block/div-empty-string-before-block-key] [fixture:
block/div-empty-string-before-columns-number] [fixture:
block/div-empty-string-before-edge] [fixture: block/div-empty-string-before-end]
[fixture: block/div-empty-string-before-shape] [fixture:
block/div-empty-string-before-width] [fixture: block/div-empty-string-between]
[fixture: block/div-empty-string-first-in-line] [fixture:
block/div-empty-string-in-composite] [fixture: block/div-empty-string-line]
[fixture: block/div-empty-strings-two] [fixture: block/db-empty-block-line]
[fixture: block/db-empty-block-between] [fixture:
block/db-empty-string-glued-to-id] [fixture: block/gram-empty-block-only]

After the last unit of a statement, before its separator, the block is a
statement, as in `click A "u" "t" accDescr {}` of state. An accepted input has
the Db of the same input with the block left out and the whitespace around it
kept: that whitespace keeps its effect, so `subgraph S accDescr {}` has the id
`subGraph0`, as `subgraph S` followed by a space has, while `subgraph S` has the
id `S` (see
[flowchart](../diagrams/flowchart.md#rejections-outside-the-grammar)). Whether
the whitespace before the block is accepted depends on the statement, as the
diagram documents say (see
[flowchart](../diagrams/flowchart.md#empty-description-blocks-before-a-separator)
and
[sequence](../diagrams/sequence.md#empty-description-blocks-before-a-separator)).
In class, `direction accDescr {}`, a line break, and `LR` is such an input: the
block keeps the two from forming a direction line, in mermaid.js too, so they
are two member statements without a label, and the direction stays `TB`.
[fixture: state/gram-click-empty-description-block-after] [fixture:
flowchart/gram-empty-description-block-after-data-block-space] [fixture:
sequence/gram-empty-description-block-after-autonumber-spaces] [fixture:
class/gram-empty-description-block-after-direction-word]

After the header, before its separator, the block is a statement too, and an
accepted input has the Db of the same input without the blocks. Where it is
accepted after the header depends on the diagram type, as the diagram documents
say (see
[flowchart](../diagrams/flowchart.md#empty-description-blocks-before-a-separator),
[class](../diagrams/class.md#empty-description-blocks-before-a-separator),
[sequence](../diagrams/sequence.md#empty-description-blocks-before-a-separator),
[state](../diagrams/state.md#empty-description-blocks-before-a-separator),
[er](../diagrams/er.md#empty-description-blocks),
[gantt](../diagrams/gantt.md#empty-description-blocks), and
[requirement](../diagrams/requirement.md#empty-description-blocks)). [fixture:
flowchart/header-empty-description-block-after-direction] [fixture:
flowchart/header-empty-description-block-before-semicolon] [fixture:
flowchart/header-empty-description-block-no-direction] [fixture:
class/header-empty-description-block] [fixture:
sequence/header-empty-description-block] [fixture:
state/header-empty-description-block] [fixture:
er/header-empty-description-block] [fixture:
gantt/gram-empty-description-block-after-header] [fixture:
requirement/header-empty-description-block]

Empty kanban decorations and shape strings have their own meaning. mermaid.js
discards them whole. The empty-form exception applies to them. The tree holds no
statement or label that changes nothing for these forms, and the input is
rejected. [fixture: kanban/db-decoration-empty-icon] [fixture:
kanban/db-decoration-empty-class] [fixture:
kanban/div-empty-string-before-label] [fixture:
kanban/div-empty-markdown-before-label]

### Agentflow

Agentflow shares flowchart's empty-string, empty-markdown-string, and empty-call
vocabulary. At statement start an IgnoredStatement could hold such a form, but
the explicit empty-form exception applies there: these are strings or calls with
their own written meaning that Mermaid discards whole, so no no-effect statement
is introduced. [fixture: agentflow/div-empty-string-statement] [fixture:
agentflow/div-empty-markdown-statement] [fixture:
agentflow/div-empty-call-statement] [fixture:
agentflow/div-empty-string-before-vertex] [fixture:
agentflow/div-empty-call-before-vertex]

Inside flow/connector names or before a following click URL/tooltip, the
existing AgentflowName.parts, textBeforeUrl, or textBeforeTooltip field holds a
recognized erased empty string, empty markdown string, or empty call as
AgentflowIgnoredText. Accept it as written, like the erased click or closed
empty description block there. The statement-start exception does not apply to
those positions. [fixture: agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-string-in-connector-name] [fixture:
agentflow/lex-empty-call-in-connector-name] [fixture:
agentflow/lex-empty-call-before-href] [fixture:
agentflow/lex-empty-string-before-url] [fixture:
agentflow/lex-empty-markdown-before-href] [fixture:
agentflow/lex-empty-string-before-url-tooltip] [fixture:
agentflow/lex-empty-call-before-url-tooltip] [fixture:
agentflow/lex-empty-markdown-before-callback-tooltip] [fixture:
agentflow/lex-mixed-empty-forms-before-url-tooltip]

At other interior positions without a retained field, such as before an arrow or
callback name or between the header and direction, reject the recognized erased
form under tokenless-empty-forms reason 1. Holding it would require splitting a
leaf or adding an arbitrary structural-gap field. [fixture:
agentflow/div-empty-string-before-arrow] [fixture:
agentflow/div-empty-call-before-arrow] [fixture:
agentflow/div-empty-string-before-callback] [fixture:
agentflow/div-empty-string-after-click] [fixture:
agentflow/div-empty-string-between-header-and-direction]

Closed empty description blocks do not use the statement-start exception. At
statement start or after a completed statement they are
AgentflowAccDescrBlockStatements; after the header direction they begin the
diagram body, and after a flow title/global heading they begin that body. Within
flow/connector names, AgentflowName.parts holds the whole form as
AgentflowIgnoredText; existing click textBefore fields hold it too. The measured
ordinary reading remains representable, so these inputs are accepted, not
reason-1 rejections. [fixture: agentflow/lex-empty-description-before-node]
[fixture: agentflow/gram-empty-description-after-vertex] [fixture:
agentflow/gram-empty-description-after-header-direction] [fixture:
agentflow/gram-empty-description-after-global] [fixture:
agentflow/gram-empty-description-after-flow-title] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/lex-empty-description-in-connector-name] [fixture:
agentflow/gram-empty-description-before-href]

An interior block without one of those places is rejected under reason 1: it can
split an Identifier, precede a required class name or first style, or stand
before a style comma. Retaining it would require changing a leaf value or adding
an arbitrary structural-gap field. A terminal block after a complete class value
is retained instead. Empty data blocks and whitespace-only strings remain real
syntax, not erased empty forms. [fixture:
agentflow/div-empty-description-inside-vertex-id] [fixture:
agentflow/div-empty-description-before-class-name] [fixture:
agentflow/div-empty-description-in-style] [fixture:
agentflow/div-empty-description-in-classdef] [fixture:
agentflow/div-empty-description-before-style-comma] [fixture:
agentflow/gram-empty-description-after-class-glued] [fixture:
agentflow/gram-data-null-document] [fixture:
agentflow/gram-url-tooltip-whitespace-only]

## The documentation of mermaid.js and its issues

The pinned documentation describes the forms below, without specifying the lexer
erasing the delimiters of these empty forms.

- flowchart: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/flowchart.md#L53-L74)
  shows quoted Unicode and markdown labels.

- sequence: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/config/accessibility.md#L67-L93)
  describes accDescr and a nonempty multiline description block.

- class: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/classDiagram.md#L150-L167)
  shows quoted labels and nonempty backquoted class names.

- state: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/config/accessibility.md#L67-L93)
  describes the shared description-block syntax.
  [PR #8498](https://github.com/mermaid-js/mermaid/pull/8498) is open as of
  2026-10-22 and proposes requiring a state id after as; it concerns a missing
  id, not a discarded empty description block.

- er: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/entityRelationshipDiagram.md#L225-L241)
  shows attribute blocks with type/name pairs. The closed
  [issue #1415](https://github.com/mermaid-js/mermaid/issues/1415), checked on
  2026-10-22, reports empty relationship labels rather than empty attribute
  backquotes.

- gantt: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/gantt.md#L450-L477)
  shows click href and call statements with URLs and callback names.

- requirement: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/requirementDiagram.md#L91-L109)
  allows quoted or unquoted user text and shows nonempty fields.

- mindmap: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/mindmap.md#L177-L203)
  shows icon names inside ::icon() and class names after :::.

- xychart: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/xyChart.md#L33-L56)
  shows quoted chart titles, axis titles, and category labels.

- quadrant: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/quadrantChart.md#L35-L62)
  describes titles and axis text.

- block: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/block.md#L175-L195)
  shows nonempty quoted labels inside shapes.

- kanban: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/kanban.md#L15-L47)
  shows bracketed column and task labels.

- agentflow: the
  [documentation](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/agentflow.md#L108-L118)
  describes flowchart-style node declarations. Searches on 2026-10-22 with
  `agentflow empty in:title,body` found no report about erased empty strings,
  calls, or interior description blocks.

Searches of issues and pull requests in `mermaid-js/mermaid` on 2026-10-22 with
`"empty string" in:title,body`, `"empty call" in:title,body`, and
`accDescr empty in:title,body` found the state and ER reports noted above. They
concern empty ids or relationship labels rather than a judgment about the
delimiter-erasure rules of this divergence.
