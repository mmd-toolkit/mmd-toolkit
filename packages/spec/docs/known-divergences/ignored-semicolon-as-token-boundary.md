# ignored-semicolon-as-token-boundary

Japanese version:
[ignored-semicolon-as-token-boundary.ja.md](./ignored-semicolon-as-token-boundary.ja.md)

Diagram types: flowchart, sequence, class, state, er, gantt, journey,
requirement, mindmap, timeline, xychart, quadrant, and block. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A line that contains `style`, then a `:` followed by zero or more characters
that are not whitespace and then a `#`, and then a `;`, matches the `style`
rule, and its last `;` is ignored: neither mermaid.js nor this specification
reads it (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)). Then the
same is done with `classDef` in place of `style`, on the line without the `;`
that the `style` rule ignored, so a line can have a second ignored `;`.
[fixture: common/entity-style-then-classdef-rule] The rule keeps the `;` that
ends a colour, as in `style A fill:#f00;`, from making the colour an
[entity](../common.md#entities), a character reference of the form `#name;`.

The rule looks at the text alone, so the ignored `;` can lie anywhere in the
line: inside a label, between two words, or inside a name, a number, a keyword,
an arrow, or a delimiter. This document is about the last of these. A name here
is what the diagram document counts as a name unit, whether or not it may
contain whitespace: the name of an ER entity, which may contain U+00A0, is one.
A name that the document counts as a text unit, such as the id of a participant
in a sequence diagram, a class name, or an attribute word of ER written with
`~`, an unquoted name of a requirement diagram, or a node text of a mindmap, may
hold an ignored `;`. [fixture:
sequence/tokens-ignored-semicolon-separator-line-feed] [fixture:
class/tokens-ignored-semicolon-in-relation-name] [fixture:
er/div-ignored-semicolon-in-name] [fixture:
er/tokens-ignored-semicolon-in-tilde-word] [fixture:
requirement/tokens-ignored-semicolon-in-name] [fixture:
mindmap/tokens-ignored-semicolon-in-node-text]

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

In a state diagram, the ignored `;` can lie inside the name after `state`, which
may hold `style`, a `:`, and a `#`: mermaid.js reads `state style:#x;B` followed
by a body as the composite state `style:#xB`, and this specification rejects it.
[fixture: state/div-ignored-semicolon-in-state-name] [fixture:
state/div-ignored-semicolon-in-state-name-without-body] The other statements
that can hold `style`, a `:`, and a `#` read the rest of their line as a text.
In an ER diagram, the `style`, the `:`, and the `#` may lie anywhere on the line
before the `;`: in an entity name such as `Bstyle`, in the `:` of a relationship
and its role `"#"`, or in an attribute comment `"c:#"`. So the ignored `;` can
lie inside a name, a number, a cardinality, a relationship line, a keyword,
`:::`, or a word or a key of an attribute block: mermaid.js reads
`A ||--o{ Bstyle :"#" C;D` as a relationship to Bstyle and the entity `CD`, and
this specification rejects it. [fixture: er/div-ignored-semicolon-in-name]
[fixture: er/div-ignored-semicolon-in-attribute-word] [fixture:
er/div-ignored-semicolon-in-relationship-line] In a Gantt chart, the `style`,
the `:`, and the `#` may lie in the URL string or the callback arguments of a
click statement, in a description block before the statement on its line, or in
the click ids themselves, so the ignored `;` can lie inside a click id, a
keyword, or an item of `includes` or `excludes`: mermaid.js reads
`click style:#y,id;1 href "u"` as a link of `id1` and
`click id1 href "style:#x" ca;ll f()` as a call, and this specification rejects
them. [fixture: gantt/div-ignored-semicolon-in-click-id] [fixture:
gantt/div-ignored-semicolon-in-call-keyword] [fixture:
gantt/div-ignored-semicolon-in-list-item] In a user journey diagram, a `#` ends
a title text, a section text, a task text, and task data, and starts a comment,
so the `style`, the `:`, and the `#` lie in a description block before the
statement on its line, and the ignored `;` can lie inside a keyword: mermaid.js
reads `accDescr { style:#x } ti;tle T` as the title `T` and
`accDescr { style:#x } sec;tion S` as the section `S`, and this specification
rejects them. [fixture: journey/div-ignored-semicolon-in-title-keyword]
[fixture: journey/div-ignored-semicolon-in-section-keyword] In a requirement
diagram, the `style`, the `:`, and the `#` may lie in a string name before the
`;`, such as `"style:#x"`, so the ignored `;` can lie inside a keyword:
mermaid.js reads `"style:#x" - sati;sfies -> b` as a relationship with the
relation `satisfies`, and this specification rejects it. [fixture:
requirement/div-ignored-semicolon-in-relationship-keyword] In a mindmap, the
`style`, the `:`, and the `#` may lie in a node text before the `;`, so the
ignored `;` can lie inside an opener or a closer: mermaid.js reads
`style:#x{;{b}}` as a node with the hexagon shape and the text `b`, and this
specification rejects it. [fixture: mindmap/div-ignored-semicolon-in-opener] In
a timeline, as in a user journey diagram, the `style`, the `:`, and the `#` lie
in a description block before the statement on its line, and the ignored `;` can
lie inside a keyword: mermaid.js reads `accDescr { style:#x } ti;tle T` as the
title `T`, and so with `sec;tion S` and `accTi;tle: T`, and this specification
rejects them. [fixture: timeline/div-ignored-semicolon-in-title-keyword]
[fixture: timeline/div-ignored-semicolon-in-section-keyword] [fixture:
timeline/div-ignored-semicolon-in-acc-title-keyword] In an XY chart, the
`style`, the `:`, and the `#` may lie in a string before the `;`, such as
`"style:#a"`, so the ignored `;` can lie inside a value or a keyword: mermaid.js
reads `line "style:#a" [1;2]` as a line with the value 12, and
`title "style:#a" li;ne [1]` as a title and a line, and this specification
rejects them. [fixture: xychart/div-ignored-semicolon-in-value] [fixture:
xychart/div-ignored-semicolon-in-keyword] In a quadrant chart, the `style` or
`classDef`, the `:`, and the `#` may lie in the name of a class of `classDef`,
which is a name, so the ignored `;` lies inside the name: mermaid.js reads
`classDef style:#x;y color: #f00` as the class `style:#xy`, and this
specification rejects it. [fixture: quadrant/div-grid-style-classdef-name] In a
block diagram, the `style`, the `:`, and the `#` may lie in a string before the
`;`, such as the label `"style:#a"`, so the ignored `;` can lie inside an id or
a keyword: mermaid.js reads `A["style:#a"] B;C` with the id `BC` and
`A["style:#a"] col;umns 2` with `columns 2`, and this specification rejects
them. [fixture: block/div-ignored-semicolon-in-id] [fixture:
block/div-ignored-semicolon-in-keyword]

Each diagram document lists where this shows, in its Known divergences section:
[flowchart](../diagrams/flowchart.md#known-divergences),
[sequence](../diagrams/sequence.md#known-divergences),
[class](../diagrams/class.md#known-divergences),
[state](../diagrams/state.md#known-divergences),
[er](../diagrams/er.md#known-divergences),
[gantt](../diagrams/gantt.md#known-divergences),
[journey](../diagrams/journey.md#known-divergences),
[requirement](../diagrams/requirement.md#known-divergences),
[mindmap](../diagrams/mindmap.md#known-divergences),
[timeline](../diagrams/timeline.md#known-divergences),
[xychart](../diagrams/xychart.md#known-divergences),
[quadrant](../diagrams/quadrant.md#known-divergences), and
[block](../diagrams/block.md#known-divergences).

## What it means for an author

An ignored `;` inside a name, a number, a keyword, an arrow, or a delimiter is
rejected by this toolkit. mermaid.js accepts it and reads the line as if the `;`
were not there. To write a diagram that both read the same, end a line that
matches the `style` rule with its `;`, or write no `;` inside a word.

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
