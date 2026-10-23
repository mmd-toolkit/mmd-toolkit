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
and for the other four keywords anywhere in the text remaining for detection.
This specification decides the diagram type at the first unit of the diagram
text (see [Diagram detection](../common.md#diagram-detection)), so it looks for
all five at the start only. The divergence is the texts whose header is another
diagram's and whose remaining detection text holds one of the four keywords
after it. mermaid.js tries the detector of mindmap before that of C4, so a
mindmap has no such texts: `C4Container` is a node text in both. [fixture:
mindmap/lex-c4-keyword-as-node-text]

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

In Ishikawa, `C4Container`, `C4Component`, `C4Dynamic`, and `C4Deployment`
anywhere in node text, including quoted-looking text and a suffix inside a
larger word, stay Ishikawa text here. When the C4 word remains in the text used
for detection, mermaid.js selects C4 and rejects the input. [fixture:
ishikawa/detect-c4-container-text] [fixture: ishikawa/detect-c4-component-root]
[fixture: ishikawa/detect-c4-dynamic-quoted] [fixture:
ishikawa/detect-c4-deployment-suffix] `C4Context`, C4 words in frontmatter, and
words removed as common comments or directives change no detection in either
reading. [fixture: ishikawa/detect-c4-context-text] [fixture:
ishikawa/detect-c4-frontmatter] [fixture: ishikawa/detect-c4-comment] [fixture:
ishikawa/detect-c4-in-directive]

Inline `R %% C4Container` is accepted by both when a physical line terminator
follows its percent suffix (see
[Line terminators](../common.md#line-terminators)): detection removes that
suffix, while Ishikawa keeps the whole node text. [fixture:
ishikawa/detect-inline-comment-c4-text] [fixture:
ishikawa/detect-inline-comment-c4-cr]

At EOF, including when only U+2028 or U+2029 follows the suffix, detection does
not remove it. mermaid.js selects C4 and rejects the input; this specification
accepts the Ishikawa text under this identifier. [fixture:
ishikawa/div-c4-inline-percent-eof] [fixture:
ishikawa/div-c4-inline-percent-ls-eof] [fixture:
ishikawa/div-c4-inline-percent-ps-eof]

## The difference

Each example is a whole diagram.

1. A keyword in a message text:

   ```mmd
   sequenceDiagram
     A ->> B: C4Container
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
     A --> C4Context
   ```

6. A keyword on a comment line:

   ```mmd
   flowchart LR
     %% C4Container
     A --> B
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
in the text that remains visible to detection, is read by this toolkit as the
diagram of its header and by mermaid.js as a C4 diagram, which fails. To write a
diagram that both read the same, do not use these four words in a diagram of
another type; `C4Context` is safe.

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

For detection, an inline `%%` suffix is removed only when LF terminates it; at
EOF it stays visible to the detector
([`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L40-L72)).
[fixture: usecase/lex-c4-inline-percent-with-lf] [fixture:
usecase/div-c4-inline-percent-eof]

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

### Usecase

Usecase is registered after C4. The affected words C4Container, C4Component,
C4Dynamic and C4Deployment fit unchanged in UsecaseLabel, UsecaseLiteral or
UsecaseJsonDataBlock. When such a word remains visible to detection, the pinned
detector selects C4 and rejects these examples; removing only that detector
behavior accepts the same inputs as usecase. The tree needs no missing-text
node. The existing reverse pipeline-order criterion selects the header's grammar
without rejecting any Mermaid-accepted input for this reason. C4Context and
words removed with frontmatter, directives or comments are controls, not
divergences. [fixture: usecase/div-detect-c4-label] [fixture:
usecase/div-c4-component-label] [fixture: usecase/div-c4-dynamic-json] [fixture:
usecase/div-c4-deployment-stereotype] [fixture:
usecase/gram-detect-c4-context-label] [fixture:
usecase/gram-detect-c4-frontmatter] [fixture: usecase/detect-c4-directive]
[fixture: usecase/detect-c4-comment]

Usecase keeps inline `%%` in labels. When LF terminates the line containing
`A(C4Context %% C4Container)`, detection removes the percent suffix and selects
usecase; its label still contains the whole written text. At EOF, detection
leaves that suffix in place, selects C4 and rejects the input. This
specification accepts that same label as usecase under the existing reverse
criterion. [fixture: usecase/lex-c4-inline-percent-with-lf] [fixture:
usecase/div-c4-inline-percent-eof]

### Pie

StringLiteral labels, PieLiteral titles, accessibility line values and
description blocks, PieIgnoredText YAML blocks, and shared Comments can hold a
C4 word as written. The comment cases include EOF after a section and EOF on the
header line. The tree therefore reads the pie header and accepts these inputs.
Mermaid.js instead selects C4 for one of the four unanchored words that remains
in the text detection sees and rejects these inputs. These are reverse-direction
divergences: this specification accepts what mermaid.js rejects; this rule
rejects no accepted pie input. A C4 word in the removed directive of the control
fixture is not seen by the detector and does not receive a mark. [fixture:
pie/div-detect-c4-label] [fixture: pie/div-detect-c4-title] [fixture:
pie/div-yaml-body-c4-hidden] [fixture: pie/detect-c4-directive-control]
[fixture: pie/div-detect-c4-acctitle] [fixture: pie/div-detect-c4-accdescr-line]
[fixture: pie/div-detect-c4-accdescr-block] [fixture:
pie/div-detect-c4-section-comment-eof] [fixture:
pie/div-detect-c4-header-comment-eof]

In the label `C4Context %% C4Container`, a final LF makes detection leave out
the inline percent suffix and select pie, while the label keeps its entire
written text. At EOF the suffix remains in detection's text, so Mermaid selects
C4 and rejects; this specification accepts the same pie label under the existing
reverse criterion. `C4Context` alone inside a label does not select C4.
[fixture: pie/lex-c4-inline-percent-with-lf] [fixture:
pie/div-c4-inline-percent-eof] [fixture: pie/lex-c4context-label]

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

- The pinned
  [Ishikawa documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
  starts its example with `ishikawa-beta`.
  [Issue #4784](https://github.com/mermaid-js/mermaid/issues/4784) proposes
  syntax like mindmap's, without a rule for C4 detection inside node text.
  Searches of issues and pull requests in `mermaid-js/mermaid` on 2026-10-21
  with `ishikawa` and `ishikawa C4 in:title,body` found no report about C4 words
  overriding an Ishikawa header.

- The pinned
  [usecase documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  describes beta header. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `usecase` found no inspected report
  establishing a maintainer defect judgment for this acceptance behavior.
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048), closed and merged
  on 2026-08-14 with Type: Enhancement, introduces the Chevrotain parser, model
  validation and JSON tables. This divergence follows the shared direct rule,
  not a claim that a bug label approves a grammar change.

- For pie, the pinned
  [syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  begins diagrams with `pie`. Searches of `pie` and `C4 detection` on 2026-10-23
  found no pie-specific exception.
  [PR #8501](https://github.com/mermaid-js/mermaid/pull/8501) and
  [PR #8504](https://github.com/mermaid-js/mermaid/pull/8504) propose anchoring
  every C4 alternative; this fact supports the shared detection rule, while the
  pinned version still has the unanchored alternatives.
