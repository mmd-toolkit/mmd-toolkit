# ignored-semicolon-as-token-boundary

Japanese version:
[ignored-semicolon-as-token-boundary.ja.md](./ignored-semicolon-as-token-boundary.ja.md)

Diagram types: flowchart, sequence, and class. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A line that contains `style`, then a `:` followed by characters that are not
whitespace and a `#`, and then a `;`, matches the `style` rule, and its last `;`
is ignored: neither mermaid.js nor this specification reads it (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)). The rule
keeps the `;` that ends a colour, as in `style A fill:#f00;`, from making the
colour an entity.

The rule looks at the text alone, so the ignored `;` can lie anywhere in the
line: inside a label, between two words, or inside a name, a number, a keyword,
an arrow, or a delimiter. This document is about the last of these. A name here
is one without whitespace; a name that may contain whitespace, such as the id of
a participant in a sequence diagram or a class name, is read as a text, and may
hold an ignored `;`.

## The difference

Each example is a whole diagram.

1. An ignored `;` inside a name:

   ```mmd
   flowchart LR
     A[style:#x] --> B;b
   ```

2. An ignored `;` inside a number:

   ```mmd
   sequenceDiagram
     participant Z@{ "style": "x:#y" };autonumber 1;0
     A->>B: m
   ```

3. An ignored `;` inside a keyword:

   ```mmd
   flowchart LR
     A[style:#x];sub;graph S
     B
     end
   ```

4. An ignored `;` inside an arrow:

   ```mmd
   flowchart LR
     A[style:#x] -;-> B
   ```

5. An ignored `;` inside a delimiter:

   ```mmd
   flowchart LR
     A[style:#x]::;:c
   ```

6. An ignored `;` inside the text of a label:

   ```mmd
   flowchart LR
     A[style:#x ; y]
   ```

| Example | mermaid.js                                                  | This specification |
| ------- | ----------------------------------------------------------- | ------------------ |
| 1       | an edge from A to the vertex `Bb`                           | rejected           |
| 2       | the numbering of messages from 10                           | rejected           |
| 3       | the subgraph S                                              | rejected           |
| 4       | an edge from A to B, as `A --> B`                           | rejected           |
| 5       | the vertex A with the class c                               | rejected           |
| 6       | the vertex A with the label `style:#x`, two spaces, and `y` | the same           |

[fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
sequence/div-ignored-semicolon-in-autonumber-start] [fixture:
flowchart/div-ignored-semicolon-in-keyword] [fixture:
flowchart/div-ignored-semicolon-in-arrow] [fixture:
flowchart/div-ignored-semicolon-in-triple-colon] [fixture:
flowchart/tokens-ignored-semicolon-label-spaces]

So mermaid.js reads every such input as the line without the `;`. This
specification does so too, except that a name, a number, a keyword, an arrow,
and a delimiter cannot have an ignored `;` inside them; such an input is
rejected. The difference goes one way only: this specification never accepts an
input that mermaid.js rejects, and it gives every input that both accept the
same Db.

In a state diagram, no line was found where the ignored `;` lies inside one of
these: a statement that can hold `style`, a `:`, and a `#` reads the rest of its
line as a text.

Each diagram document lists where this shows, in its Known divergences section:
[flowchart](../diagrams/flowchart.md#known-divergences),
[sequence](../diagrams/sequence.md#known-divergences), and
[class](../diagrams/class.md#known-divergences).

## Why mermaid.js reads it so

Before it reads the diagram, mermaid.js removes the `;` from the text of the
line
([`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917)).
The lexer of each diagram type then reads the text that is left, and never sees
where the `;` was. That a name or an arrow can be split by such a `;` comes from
the order of these steps.

## The rule of this specification, and why

In this specification, the ignored `;` stays in the source, and the lexer reads
through it as if it were not there. It may lie inside a text or a string, and
between two units, as a directive may (see
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)).
A name, a number, a keyword, an arrow, and a delimiter stand for their text as a
whole, and an ignored `;` inside one of them makes the input rejected.

A text and a string can be cut into fragments already: a comment region can lie
inside them, and their value leaves out an ignored `;` inside them, as it leaves
out a comment region (see [Nodes](../ast.md#nodes)). This specification does not
cut the token of a name, a number, a keyword, an arrow, or a delimiter at an
ignored `;`: each of them is read as its text as a whole. mermaid.js can read an
ignored `;` inside one of them only because it removes the `;` as a step before
reading, which is nothing that a specification would state as a rule of the
syntax; this is the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

## What it means for an author

An ignored `;` inside a name, a number, a keyword, an arrow, or a delimiter is
rejected by this toolkit. mermaid.js accepts it and reads the line as if the `;`
were not there. To write a diagram that both read the same, end a line that
matches the `style` rule with its `;`, or write no `;` inside a word.

## The documentation of mermaid.js and its issues

- The documentation of
  [flowcharts](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1237-L1237)
  shows a `;` only at the end of a `style`, `classDef`, or `linkStyle` line, and
  says nothing of a `;` inside a name or an arrow.
- [Issue #1666](https://github.com/mermaid-js/mermaid/issues/1666), "Flowchart:
  linkStyle issues with hex colors", reports that `linkStyle 0 stroke:#ff9900;`
  was rejected, as `#ff9900;` was read as an entity. As of 2026-10-03 it is
  closed, with the labels `Type: Bug / Error` and `Status: Triage`. It is the
  case that the rule of the ignored `;` handles.
- [Issue #7140](https://github.com/mermaid-js/mermaid/issues/7140), "Error on
  invalid syntax of style", suggests reporting a `;` that an author writes in a
  `classDef` as in CSS. As of 2026-10-03 it is open, with the labels
  `Type: Bug / Error` and `new parser`.
- No issue or pull request about a `;` inside a name, a number, a keyword, an
  arrow, or a delimiter was found, with the queries `semicolon`,
  `semicolon style`, `semicolon arrow`, `semicolon flowchart`,
  `semicolon in style`, `semicolon link`, `encodeEntities`,
  `classDef semicolon`, and `semicolon entity`, on 2026-10-03.
