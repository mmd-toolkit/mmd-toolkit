# c4-keyword-anywhere

Japanese version: [c4-keyword-anywhere.ja.md](./c4-keyword-anywhere.ja.md)

Diagram types: all that mermaid.js detects after C4. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A C4 diagram starts with one of five keywords, `C4Context`, `C4Container`,
`C4Component`, `C4Dynamic`, or `C4Deployment`, which name the five kinds of C4
diagram (entry 7 of [detection.md](../detection.md)):

```mmd
C4Container
  Container(a, "A")
```

[fixture: common/detect-minimal-c4]

In mermaid.js the detector of C4 looks for `C4Context` at the start of the text
and for the other four keywords anywhere in it. This specification decides the
diagram type at the first unit of the diagram text (see
[Diagram detection](../common.md#diagram-detection)), so it looks for all five
at the start only. The divergence is the texts whose header is another diagram's
and that hold one of the four keywords after it. mermaid.js tries the detector
of mindmap before that of C4, so a mindmap has no such texts: `C4Container` is a
node text in both. [fixture: mindmap/lex-c4-keyword-as-node-text]

In kanban, the four words in a node id, a label, or data content are read in
their kanban positions. mermaid.js selects C4 and rejects the input. [fixture:
kanban/lex-c4-c4component-id] [fixture: kanban/lex-c4-c4component-label]
[fixture: kanban/lex-c4-c4component-metadata] [fixture:
kanban/lex-c4-c4container-id] [fixture: kanban/lex-c4-c4container-label]
[fixture: kanban/lex-c4-c4container-metadata] [fixture:
kanban/lex-c4-c4deployment-id] [fixture: kanban/lex-c4-c4deployment-label]
[fixture: kanban/lex-c4-c4deployment-metadata] [fixture:
kanban/lex-c4-c4dynamic-id] [fixture: kanban/lex-c4-c4dynamic-label] [fixture:
kanban/lex-c4-c4dynamic-metadata]

A kanban node named `C4Context` changes no detection in either reading.
[fixture: kanban/lex-c4-c4context-id] `C4Container` inside a removed comment or
frontmatter changes no detection in either reading. [fixture:
kanban/lex-c4-c4container-comment] [fixture:
kanban/lex-c4-c4container-frontmatter]

In venn, `C4Container`, `C4Component`, `C4Dynamic`, and `C4Deployment` in a bare
or quoted set name, label, bare or quoted style value, or title are read in
their venn positions here. [fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4container-label] [fixture:
venn/lex-c4-c4container-style] [fixture: venn/lex-c4-c4container-title]
[fixture: venn/lex-c4-c4component-identifier] [fixture:
venn/lex-c4-c4component-label] [fixture: venn/lex-c4-c4component-style]
[fixture: venn/lex-c4-c4component-title] [fixture:
venn/lex-c4-c4dynamic-identifier] [fixture: venn/lex-c4-c4dynamic-label]
[fixture: venn/lex-c4-c4dynamic-style] [fixture: venn/lex-c4-c4dynamic-title]
[fixture: venn/lex-c4-c4deployment-identifier] [fixture:
venn/lex-c4-c4deployment-label] [fixture: venn/lex-c4-c4deployment-style]
[fixture: venn/lex-c4-c4deployment-title] mermaid.js selects C4 and rejects the
input. [fixture: venn/lex-c4-c4container-identifier] [fixture:
venn/lex-c4-c4container-label] [fixture: venn/lex-c4-c4container-style]
[fixture: venn/lex-c4-c4container-title] [fixture:
venn/lex-c4-c4component-identifier] [fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4component-style] [fixture:
venn/lex-c4-c4component-title] [fixture: venn/lex-c4-c4dynamic-identifier]
[fixture: venn/lex-c4-c4dynamic-label] [fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4dynamic-title] [fixture:
venn/lex-c4-c4deployment-identifier] [fixture: venn/lex-c4-c4deployment-label]
[fixture: venn/lex-c4-c4deployment-style] [fixture:
venn/lex-c4-c4deployment-title] [fixture: venn/div-c4-bare-identifier] [fixture:
venn/div-c4-bare-style-value]

`C4Context` after the venn header and C4 words in removed comments or
frontmatter change no detection in either reading. [fixture:
venn/lex-c4-c4context-identifier] [fixture: venn/lex-c4-c4context-label]
[fixture: venn/lex-c4-c4context-style] [fixture: venn/lex-c4-c4context-title]
[fixture: venn/lex-c4-c4container-comment] [fixture:
venn/lex-c4-c4container-frontmatter]

## The difference

Each example is a whole diagram.

1. A keyword in a message text:

   ```mmd
   sequenceDiagram
     A->>B: C4Container
   ```

2. A keyword as a label:

   ```mmd
   flowchart LR
     A[C4Component]
   ```

3. A keyword as a class name:

   ```mmd
   classDiagram
     class C4Dynamic
   ```

4. A keyword as a state id:

   ```mmd
   stateDiagram-v2
     [*] --> C4Deployment
   ```

5. `C4Context` after the header:

   ```mmd
   flowchart LR
     A-->C4Context
   ```

6. A keyword on a comment line:

   ```mmd
   flowchart LR
     %% C4Container
     A-->B
   ```

| Example | mermaid.js                              | This specification                                   |
| ------- | --------------------------------------- | ---------------------------------------------------- |
| 1       | handed to the C4 parser; rejected       | a sequence diagram with the message `C4Container`    |
| 2       | handed to the C4 parser; rejected       | a flowchart with the vertex A labelled `C4Component` |
| 3       | handed to the C4 parser; rejected       | a class diagram with the class `C4Dynamic`           |
| 4       | handed to the C4 parser; rejected       | a state diagram with the state `C4Deployment`        |
| 5       | a flowchart with the vertex `C4Context` | the same                                             |
| 6       | a flowchart with the vertices A and B   | the same                                             |

[fixture: common/detect-c4-anywhere] [fixture:
flowchart/div-c4-keyword-in-label] [fixture: class/div-c4-keyword-as-class-name]
[fixture: state/div-c4-keyword-as-state-id] [fixture:
common/detect-c4context-only-at-start] [fixture:
flowchart/detect-c4-keyword-on-comment-line]

The difference goes one way: this specification accepts, as the diagram of the
header, texts that mermaid.js rejects, because the C4 parser does not accept the
header of another diagram type. A text that both read as a C4 diagram, or that
both reject, is not affected. A keyword on a comment line or inside a directive
is left out before detection by both, so examples 6 and its like are read the
same.

## What it means for an author

A diagram of another type that contains `C4Container`, `C4Component`,
`C4Dynamic`, or `C4Deployment`, in a label, a message, a name, or anywhere else
in its text, is read by this toolkit as the diagram of its header and by
mermaid.js as a C4 diagram, which fails. To write a diagram that both read the
same, do not use these four words in a diagram of another type; `C4Context` is
safe.

## Why mermaid.js reads it so

The detector of C4
([`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10))
is one regular expression with five alternatives, of which only the first,
`C4Context`, is anchored to the start of the text; the other four match
anywhere. The detectors run on the whole text, after the frontmatter, the
directives, and the comment lines are removed
([`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)),
and the C4 detector is registered before every detector of a diagram type with
its own grammar except `flowchart-elk`, `mindmap`, `architecture`, and
`agentflow`
([`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L44-L126)),
so it claims such a text before the detector of the header's diagram type is
tried.

## The rule of this specification, and why

This specification decides the diagram type at the first unit of the diagram
text and reads no further for it. A detector that looks for a word anywhere in
the text can only be stated on the whole text, which mermaid.js has at hand
because its detection runs on a rewritten text before any lexer reads the
source; a specification that reads the source once, from left to right, states
the detection as a rule on the first unit. This is the second of the reasons for
a known divergence (see [known-divergences.md](../known-divergences.md)). The
inputs read differently are then those with one of the four keywords after
another header, which this specification reads as the diagram of the header.

## The documentation of mermaid.js and its issues

- The documentation of
  [C4 diagrams](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md)
  lists the five kinds of diagram with their keywords, and every example starts
  with its keyword on the first line.
- The
  [syntax reference](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  says that all diagram definitions begin with a declaration of the diagram
  type.
- No issue or pull request of mermaid.js about the four keywords matching
  anywhere was found (searched on 2026-10-07 for `C4Container detect`,
  `c4Detector`, `C4 detector anywhere`, `C4Container regex`, `detected as C4`,
  `C4Component sequence`, `C4 detection`, `C4Dynamic`, `C4Deployment`,
  `wrong diagram type detected`, and `detectType C4`). The open issue
  [mermaid-js/mermaid#4542](https://github.com/mermaid-js/mermaid/issues/4542)
  proposes to standardize the diagram keywords, among them the five of C4 as
  `c4 context`, `c4 container`, and so on; it does not mention where the keyword
  is looked for.

- The pinned
  [venn documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  starts diagrams with `venn-beta`. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-21 with `C4Container detection in:title,body`
  and `C4 detection in:title,body` found
  [PR #8501](https://github.com/mermaid-js/mermaid/pull/8501) and
  [PR #8504](https://github.com/mermaid-js/mermaid/pull/8504), which propose
  anchoring all C4 keywords to the start. The pinned detector still matches four
  keywords anywhere. [fixture: venn/lex-c4-c4container-identifier] [fixture:
  venn/lex-c4-c4component-label] [fixture: venn/lex-c4-c4dynamic-style]
  [fixture: venn/lex-c4-c4deployment-title]
