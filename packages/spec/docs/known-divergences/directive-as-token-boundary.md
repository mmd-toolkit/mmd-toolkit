# directive-as-token-boundary

Japanese version:
[directive-as-token-boundary.ja.md](./directive-as-token-boundary.ja.md)

Diagram types: all. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A directive is `%%{`, a name, and `}%%`, such as `%%{init: {}}%%`; it gives
configuration to the diagram (see [Directives](../common.md#directives)). It is
usually written on a line of its own, before the header:

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

[fixture: common/directive-init-theme]

mermaid.js removes every directive from the text before it reads the diagram,
wherever the directive is, and joins the text before and after it. This
specification reads the text in the same way (see
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)),
with one exception, which this document is about: a directive inside a unit that
is not `RawText` or `Identifier`, such as a keyword, an arrow, a number, or a
string.

## The difference

Each example is a whole diagram.

1. A directive inside a string:

   ```mmd
   flowchart LR
     A["a %%{init: {}}%% b"] --> B
   ```

2. A directive inside an arrow:

   ```mmd
   flowchart LR
     A-%%{init: {}}%%-->B
   ```

3. A directive inside a keyword:

   ```mmd
   sequenceDiagram
     parti%%{init: {}}%%cipant A
   ```

4. A directive inside a relation:

   ```mmd
   classDiagram
     A -%%{init: {}}%%-> B
   ```

5. A directive inside an id:

   ```mmd
   sequenceDiagram
     Al%%{init: {}}%%ice ->> B: x
   ```

6. A directive inside the text of a label:

   ```mmd
   flowchart LR
     A[x%%{init: {}}%%y]
   ```

| Example | mermaid.js                         | This specification |
| ------- | ---------------------------------- | ------------------ |
| 1       | the vertex A with the label `a  b` | rejected           |
| 2       | an edge from A to B, as `A--->B`   | rejected           |
| 3       | the participant A                  | rejected           |
| 4       | the relation from A to B           | rejected           |
| 5       | the message from `Alice` to B      | the same           |
| 6       | the vertex A with the label `xy`   | the same           |

[fixture: common/directive-in-string] [fixture:
flowchart/div-directive-in-arrow-length] [fixture:
sequence/div-directive-in-keyword] [fixture: class/div-directive-in-line]
[fixture: sequence/lex-directive-in-id-run] [fixture:
common/directive-in-label-text]

So mermaid.js reads every input as the text without its directives. This
specification does so too, except that a unit that is not `RawText` or
`Identifier` cannot have a directive inside it; such an input is rejected. Where
mermaid.js rejects the text without its directives, both reject the input:
`flow%%{init: {}}%%chart LR` followed by a line `A-->` is rejected by the
flowchart grammar of mermaid.js, and by this specification because the directive
lies inside the header keyword. [fixture:
common/directive-splits-header-keyword] Followed by a line `A-->B` instead, the
same header gives a flowchart in mermaid.js, and is rejected by this
specification. [fixture: common/directive-in-header-keyword] The difference goes
one way only: this specification never accepts an input that mermaid.js rejects,
and it gives every input that both accept the same Db.

Each diagram document lists the units of its own that this concerns, in its
Known divergences section:
[flowchart](../diagrams/flowchart.md#known-divergences),
[sequence](../diagrams/sequence.md#known-divergences), and
[class](../diagrams/class.md#known-divergences).

## Why mermaid.js reads it so

Before it reads the diagram, mermaid.js removes every directive from the whole
text with one textual replacement
([`processDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L33-L45),
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)).
The lexer of each diagram type then reads the text that is left, and never sees
where a directive was. That a keyword or an arrow can be split by a directive
comes from the order of these steps.

## The rule of this specification, and why

In this specification, a directive is a token boundary: the text before and
after it is read as if it were joined, as in mermaid.js, so that an id or the
text of a label can hold a directive. A unit that is not `RawText` or
`Identifier` stands for its text as a whole, and a directive inside it makes the
input rejected.

A keyword, an arrow, a number, or a string is one token of the tree, whose text
is the input at its range. A directive inside it would split the token, or make
its text differ from the input, and the tree has no form for a keyword in two
pieces. mermaid.js can read such an input only because it removes the directives
as a step before reading, which is nothing that a specification would state as a
rule of the syntax; this is the second of the reasons for a known divergence
(see [known-divergences.md](../known-divergences.md)).

## What it means for an author

A directive inside a keyword, an arrow, a number, or a string is rejected by
this toolkit. mermaid.js accepts it and reads the text as if the directive were
not there; in a string, the directive leaves the spaces around it, as in example

1. To write a diagram that both read the same, put each directive on a line of
   its own.

## The documentation of mermaid.js and its tests

- The documentation of
  [directives](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md)
  shows every directive on a line of its own, and says nothing of a directive
  inside a token.
- The tests of mermaid.js place every directive on a line of its own. Of the 37
  occurrences of `%%{` in the 287 `*.spec.ts` and `*.spec.js` files of the
  pinned version, 34 are in test inputs, and each of them is the first thing on
  its line of the input, after any indentation; the other 3 are in code comments
  of
  [`agentflow-comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow-comments.spec.ts).
  The test inputs are in
  [`utils.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.spec.ts),
  [`mermaidAPI.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.spec.ts),
  [`comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.spec.ts),
  [`config.appearance.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.appearance.spec.ts),
  [`dagre/index.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.spec.js),
  [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js),
  [`radar.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/radar.spec.ts),
  and
  [`exampleConfig.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/.vitepress/theme/exampleConfig.spec.ts).
  The flowchart parser tests contain no directive at all.

## Counts and how they are checked

Inputs were made from the accepted fixtures of flowchart, sequence, and class
that have no comment, no directive, and no frontmatter and are not marked with a
divergence, by inserting `%%{init: {}}%%` between each two characters of a line.
From each diagram type, about 1,500 of them were taken at even intervals. Each
was run through mermaid.js and through the parser of this specification, and
their acceptance and Db were compared:

| Diagram type | Inputs taken, of those made | Rejected by mermaid.js, accepted by this specification | Accepted by both, a different Db | Accepted by mermaid.js, rejected by this specification |
| ------------ | --------------------------: | -----------------------------------------------------: | -------------------------------: | -----------------------------------------------------: |
| flowchart    |            1,515 of 101,449 |                                                      0 |                                0 |                                                    373 |
| sequence     |             1,525 of 36,588 |                                                      0 |                                0 |                                                    457 |
| class        |             1,537 of 50,706 |                                                      0 |                                0 |                                                    486 |

The others are read the same by both.

For each input that this specification rejects for a directive inside a unit,
the differential test of the parser compares the parser with mermaid.js on a
**reference input**: the input without its directives, with the text around each
joined. The parser is to give the reference input what mermaid.js gives the
input. For all 1,316 differences above, it did.
