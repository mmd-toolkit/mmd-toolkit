# directive-as-token-boundary

Japanese version:
[directive-as-token-boundary.ja.md](./directive-as-token-boundary.ja.md)

Diagram types: all. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A directive is `%%{` and a name, which an argument may follow, usually closed by
`}%%`, such as `%%{init: {}}%%`; it gives configuration to the diagram (see
[Directives](../common.md#directives)). It is usually written on a line of its
own, before the header:

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
with one exception, which this document is about: a directive inside a name, a
keyword (the wrap prefix of a sequence message, such as `wrap:`, among them), a
delimiter such as `:::`, an arrow, or a number. A name here is what the diagram
document counts as a name unit, whether or not it may contain whitespace: the
name of an ER entity, which may contain U+00A0, is one, and so is a click id of
gantt. A name that the document counts as a text unit, such as the id of a
participant in a sequence diagram, a class name, an attribute word of ER written
with `~`, the description of a gantt task, or an unquoted name of a requirement
diagram, is read as a text. [fixture: sequence/div-directive-in-wrap-prefix]
[fixture: sequence/lex-directive-in-participant-id] [fixture:
class/lex-directive-in-name] [fixture: er/div-directive-in-name] [fixture:
er/lex-directive-in-tilde-word] [fixture: gantt/div-directive-in-click-id]
[fixture: gantt/lex-directive-in-task-text] [fixture:
requirement/lex-directive-in-name]

## The difference

Each example is a whole diagram.

1. A directive inside a keyword:

   ```mmd
   sequenceDiagram
     parti%%{init: {}}%%cipant A
   ```

2. A directive inside a delimiter:

   ```mmd
   flowchart LR
     A::%%{init: {}}%%:c
     classDef c fill:#f00
   ```

3. A directive inside a name:

   ```mmd
   flowchart LR
     A%%{init: {}}%%B-->C
   ```

4. A directive inside an arrow:

   ```mmd
   flowchart LR
     A-%%{init: {}}%%-->B
   ```

5. A directive inside a number:

   ```mmd
   sequenceDiagram
     autonumber 1%%{init: {}}%%0
     A->>B: x
   ```

6. A directive inside a string:

   ```mmd
   flowchart LR
     A["a %%{init: {}}%% b"]-->B
   ```

7. A directive inside the text of a label:

   ```mmd
   flowchart LR
     A[x%%{init: {}}%%y]
   ```

| Example | mermaid.js                                           | This specification |
| ------- | ---------------------------------------------------- | ------------------ |
| 1       | the participant A                                    | rejected           |
| 2       | the vertex A with the class c                        | rejected           |
| 3       | an edge from the vertex `AB` to C                    | rejected           |
| 4       | an edge from A to B, as `A--->B`                     | rejected           |
| 5       | the numbering of messages from 10                    | rejected           |
| 6       | the vertex A with the label `a`, two spaces, and `b` | the same           |
| 7       | the vertex A with the label `xy`                     | the same           |

[fixture: sequence/div-directive-in-keyword] [fixture:
flowchart/div-directive-in-style-separator] [fixture:
flowchart/div-directive-in-id] [fixture:
flowchart/div-directive-in-arrow-length] [fixture:
sequence/div-directive-in-number] [fixture: common/directive-in-string]
[fixture: common/directive-in-label-text]

So mermaid.js reads every input as the text without its directives. This
specification does so too, except that a name, a keyword, a delimiter, an arrow,
and a number cannot have a directive inside them; such an input is rejected.
Where mermaid.js rejects the text without its directives, both reject the input:
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
[sequence](../diagrams/sequence.md#known-divergences),
[class](../diagrams/class.md#known-divergences), and
[state](../diagrams/state.md#known-divergences).

## What it means for an author

A directive inside a name, a keyword, a delimiter, an arrow, or a number is
rejected by this toolkit. mermaid.js accepts it and reads the text as if the
directive were not there. To write a diagram that both read the same, put each
directive on a line of its own.

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
after it is read as if it were joined, as in mermaid.js, so that a text, a
string, or a name that may contain whitespace can hold a directive. A name, a
keyword, a delimiter, an arrow, and a number stand for their text as a whole,
and a directive inside one of them makes the input rejected.

A string can be cut into fragments already: a comment region can lie inside it,
and the string is then read as the fragments before and after the region. A
directive inside a string is held in the same way, and the value of the string
leaves it out, as it leaves out a comment region (see [Nodes](../ast.md#nodes)).
A text is prose, and so is a name that may contain whitespace; a directive
inside them is held in the same way. This specification does not cut a name, a
number, an arrow, a keyword, or a delimiter at a directive: each of them is read
as its text as a whole. mermaid.js can read a directive inside one of them only
because it removes the directives as a step before reading, which is nothing
that a specification would state as a rule of the syntax; this is the second of
the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

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
