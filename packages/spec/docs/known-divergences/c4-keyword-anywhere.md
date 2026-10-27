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

The example starts with `C4Container`. [fixture:
common/detect-minimal-c4-container]

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

The fixtures record the readings compared in the table. [fixture:
common/detect-c4-anywhere] [fixture: flowchart/div-c4-keyword-in-label]
[fixture: class/div-c4-keyword-as-class-name] [fixture:
state/div-c4-keyword-as-state-id] [fixture:
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

### Gitgraph

References, strings, common literals, ignored text and Comments can hold the C4
words as written. Apply detection only at the header under reverse reason 2:
`C4Container`, `C4Component`, `C4Dynamic` or `C4Deployment` in later text can
reject in Mermaid but accept here. This rule rejects no Mermaid-accepted input.
`C4Context` later in text and LF-terminated comment controls do not differ.
[fixture: gitgraph/div-detect-c4container-id] [fixture:
gitgraph/div-detect-c4component-branch] [fixture:
gitgraph/div-detect-c4dynamic-message] [fixture:
gitgraph/div-detect-c4deployment-tag] [fixture:
gitgraph/div-detect-c4container-title] [fixture:
gitgraph/div-detect-c4component-acctitle] [fixture:
gitgraph/div-detect-c4dynamic-accdescr] [fixture:
gitgraph/div-detect-c4deployment-block] [fixture:
gitgraph/div-detect-c4container-comment-eof] [fixture:
gitgraph/div-detect-c4component-header-comment-eof] [fixture:
gitgraph/detect-c4context-id] [fixture: gitgraph/detect-c4container-comment-lf]

### Info

InfoLiteral, InfoIgnoredText and shared Comments hold the C4 words as written.
The existing reverse pipeline-order rule selects the header grammar: four
unanchored C4 words later in detection text can reject in Mermaid but accept
here as info. This rejects no Mermaid-accepted input. C4Context, removed
frontmatter/directives and LF-terminated comment controls agree; an otherwise
invalid info body still rejects. [fixture: info/div-c4container-title] [fixture:
info/div-c4component-acctitle] [fixture: info/div-c4dynamic-line] [fixture:
info/div-c4deployment-block] [fixture: info/div-c4container-header-comment-eof]
[fixture: info/div-c4component-flag-comment-eof] [fixture:
info/c4container-header-comment-lf] [fixture: info/c4component-flag-comment-lf]
[fixture: info/div-c4-hidden-yaml] [fixture: info/div-c4-hidden-directive]
[fixture: info/div-c4-retained-yaml] [fixture: info/div-c4-retained-directive]
[fixture: info/lex-c4context-common] [fixture: info/lex-c4-removed-directive]
[fixture: info/lex-c4-frontmatter] [fixture: info/lex-c4-invalid-info]

### Packet

Strings, common literals, ignored text and Comments already hold C4 words.
Header-only selection under reverse reason 2 accepts later C4 words that switch
Mermaid to C4 and reject. It rejects no Mermaid-accepted input. LF-terminated
suffixes and detection-passed retained YAML are nondiffering controls. [fixture:
packet/c4container-label] [fixture: packet/c4component-title] [fixture:
packet/c4deployment-block] [fixture: packet/c4dynamic-header-comment-eof]
[fixture: packet/div-c4-hidden-yaml] [fixture: packet/div-c4-hidden-suffix-eof]
[fixture: packet/c4-hidden-suffix-lf] [fixture:
packet/c4-retained-preheader-yaml]

### Radar

A radar header selects radar even when a later title, label or reference
contains C4Container, C4Component, C4Dynamic or C4Deployment. First ask whether
the tree can preserve the reading: RadarLiteral, StringLiteral and Identifier
can hold those authored values without resolving them as C4. No new ignored-text
node or rejection is needed. The remaining reverse acceptance difference is the
direct header-selection rule in place of C4's earlier anywhere scan. [fixture:
radar/c4-container-title] [fixture: radar/c4-component-axis-label] [fixture:
radar/c4-dynamic-reference] [fixture: radar/c4-deployment-line]

C4Context does not perform that anywhere match. An LF-terminated leading comment
containing one of the four other words is a detection control, distinct from a
comment whose missing terminator exposes it to C4 detection. The same shared
identifier records the differing radar inputs, with their accepted specified
result. [fixture: radar/c4-context-title] [fixture:
radar/c4-container-header-lf] [fixture: radar/c4-container-header-eof] [fixture:
radar/c4-component-header-lf] [fixture: radar/c4-component-header-eof] [fixture:
radar/c4-dynamic-header-lf] [fixture: radar/c4-dynamic-header-eof] [fixture:
radar/c4-deployment-header-lf] [fixture: radar/c4-deployment-header-eof]

### Treemap

A treemap header selects treemap even when a later quoted name or common value
contains C4Container, C4Component, C4Dynamic or C4Deployment. StringLiteral and
TreemapLiteral can hold that text as written, so no ignored node or rejection is
needed. The remaining difference is the direct header rule instead of C4's
earlier anywhere match. A leading/native header comment ending in LF is a
nondiffering control; without its terminator the C4 scan may instead select C4.
Keep the existing accepted specified readings and distinguish those controls.
[fixture: treemap/c4-container-section] [fixture: treemap/c4-component-leaf]
[fixture: treemap/c4-dynamic-title] [fixture: treemap/c4-deployment-block]
[fixture: treemap/c4-component-header-eof] [fixture:
treemap/c4-component-header-lf]

### Railroad

The selected railroad header chooses IR, EBNF, ABNF or PEG even if later diagram
text contains C4Container, C4Component, C4Dynamic or C4Deployment. C4Context
alone is an ordinary value here too. The marked examples have accepted specified
railroad results where Mermaid instead selects C4. [fixture:
railroad/ir-c4-container-terminal] [fixture: railroad/ebnf-c4-component-special]
[fixture: railroad/abnf-c4-dynamic-string] [fixture:
railroad/peg-c4-deployment-predicate] For the first question, written rule
names, strings, metadata and special sequences retain these words naturally; no
ignored-text node is required. What cannot be represented as that source tree is
switching the entire diagram to C4 despite its header. The second answer is
reason 2: use the direct header-selection rule rather than detector registration
order. The four ids still share one RailroadDiagram node. [fixture:
railroad/ir-c4-container-terminal] [fixture: railroad/ebnf-c4-component-special]
[fixture: railroad/abnf-c4-dynamic-string] [fixture:
railroad/peg-c4-deployment-predicate]

### Wardley

Wardley follows C4 in detector registration. Its names, strings, literals and
native hidden forms can hold the written C4 word, but a Wardley tree cannot
simultaneously be the displaced C4 diagram. The existing reason-2 direct
header-selection rule selects Wardley from its leading header instead. Later
C4Container, C4Component, C4Dynamic or C4Deployment can therefore make Mermaid
reject where this specification accepts. Ordinary LF-terminated comments removed
before detection remain nondiffering; an EOF comment is not the same control.
[fixture: wardley/c4-component-component] [fixture:
wardley/c4-dynamic-flow-label] [fixture: wardley/c4-container-title] [fixture:
wardley/c4-component-header-eof] [fixture: wardley/c4-component-header-lf]

### Cynefin

Select cynefin from its header even when a later value contains a C4 detector
word. The value has a Cynefin node, but the same tree cannot also have the
displaced C4 diagram kind. An ordinary LF-terminated comment removed for
detection is a nondiffering control. [fixture: cynefin/c4-component-item]
[fixture: cynefin/c4-container-title] [fixture: cynefin/c4-component-header-eof]
[fixture: cynefin/c4-component-header-lf]

The
[pinned grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30)
and
[public adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19)
read the result of the common preprocessing/detection pipeline. The
[Cynefin syntax](../diagrams/cynefin.md) states the direct rule and
[tree](../ast/cynefin.md) retains its authored forms. [fixture:
cynefin/db-all-fields]

### eventmodeling

Eventmodeling occurs after C4 detection. Its authored identifiers, references,
inline/block data, notes, GWT and common values can hold C4Container,
C4Component, C4Dynamic or C4Deployment. Selecting C4 from those later words
would replace the written header's diagram rather than change those nodes.
Follow header selection instead: the marked cases reject in Mermaid but accept
in the specified eventmodeling reading. LF-terminated percent-comment controls
do not exhibit this detection difference, and no mark is added when both
readings reject. [fixture: eventmodeling/c4-container-data] [fixture:
eventmodeling/c4-component-identifier] [fixture: eventmodeling/c4-dynamic-gwt]
[fixture: eventmodeling/c4-deployment-reference] [fixture:
eventmodeling/c4-component-header-lf] [fixture:
eventmodeling/prefix-directive-c4] [fixture: eventmodeling/prefix-yaml-c4]
[fixture: eventmodeling/prefix-yaml-between-bares-c4]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70)
defines the units; [the diagram syntax](../diagrams/eventmodeling.md) defines
their direct boundaries.

### Treeview

Treeview is registered after C4. A later name, common value, description,
comment or directive can contain C4Container, C4Component, C4Dynamic or
C4Deployment. That text has a place in the tree; choose this diagram from its
header under the existing direct detection rule. The specified treeview readings
record the comparison, including an unterminated percent-comment control that
the earlier detector can still see. The
[syntax](../diagrams/treeview.md#detection) separates detection from its own
grammar acceptance. [fixture: treeview/c4-container-bare] [fixture:
treeview/c4-component-header-eof] [fixture: treeview/c4-dynamic-title] [fixture:
treeview/c4-deployment-block] [fixture: treeview/c4-component-header-lf]

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

For gitgraph,
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
documents the header and commands. Issue/PR searches on 2026-10-23 used
`gitGraph`, `gitGraph directive`, `gitGraph YAML`, `gitGraph semicolon`,
`gitGraph keyword`, `gitGraph duplicate` and `gitGraph cherry-pick`. No
inspected result settles this common boundary behavior.
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) is closed with
Status: Approved; merged
[#6707](https://github.com/mermaid-js/mermaid/pull/6707) adds a duplicate-id
warning. These facts do not justify any additional divergence.

- Info has no dedicated syntax page. The pinned
  [syntax reference](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  describes diagram declarations and percent comments. Searches of issues and
  pull requests on 2026-10-23 used `info showInfo`, `info directive`,
  `info semicolon` and `info accTitle`.
  [#7601](https://github.com/mermaid-js/mermaid/issues/7601) reports
  info/showInfo rendering and was open with Type: Bug / Error and Status:
  Triage. No inspected result establishes an info-specific maintainer decision
  to reject this syntax; this section follows the existing direct rule.

- The pinned
  [packet documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  shows single positions, ranges and relative counts; it does not define this
  preprocessing boundary. Searches of the official repository's issues and pull
  requests on 2026-10-25 used `packet bitsPerRow`, `packet fractional` and
  `packet maxPacketSize`. No inspected result establishes a maintainer ruling on
  this divergence.

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/radar.md#L66-L166)
  documents axes, curves and options. The official issues/PRs were searched on
  2026-10-25 for radar directive, radar semicolon and radar entries; no
  inspected result declares the boundaries above a defect.
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) is a closed
  documentation report marked Status: Approved.
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) corrects commas in
  documentation examples; it does not add grammar support for a trailing comma.

- Treemap: the pinned
  [treemap documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treemap.md#L24-L115)
  describes quoted rows, indentation and class definitions, without defining
  this common preprocessing boundary. Searches of the official repository's
  issues and pull requests on 2026-10-25 used `treemap C4`; no inspected result
  establishes a maintainer ruling on this divergence.
  [#6590](https://github.com/mermaid-js/mermaid/pull/6590) introduced treemap
  and was merged on 2025-06-27; it is not a ruling on this boundary.

- Railroad: the
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/railroad.md#L1-L280)
  describes the four notations, EBNF exception, ABNF semicolon comments and PEG
  predicates. It does not define native retained YAML or HTML quote context
  across frontmatter. Searches of the official repository’s issues and pull
  requests on 2026-10-26 used railroad frontmatter, railroad directive, railroad
  semicolon and railroad comment.
  [#7979](https://github.com/mermaid-js/mermaid/issues/7979) concerns demo
  header names (closed, Triage);
  [#6620](https://github.com/mermaid-js/mermaid/issues/6620) is an ABNF diagram
  proposal (open, Discussion Needed). Neither establishes a maintainer defect
  decision for these preprocessing boundaries. This divergence follows the
  existing shared rule, not such a decision. The inspected results do not
  establish that no other relevant issue exists.

- Wardley: the
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/wardley.md#L1-L461)
  shows coordinates, decorations and flows without defining this common
  boundary. Searches of the official issues and pull requests on 2026-10-26 used
  wardley directive, wardley semicolon and wardley flow.
  [#7642](https://github.com/mermaid-js/mermaid/pull/7642) fixes hyphenated
  names and [#7726](https://github.com/mermaid-js/mermaid/pull/7726) removes
  unnecessary sanitization; both are reflected in the pin.
  [#8379](https://github.com/mermaid-js/mermaid/pull/8379) was an open
  configuration-retention PR. The inspected results establish no maintainer
  defect decision for this boundary; the existing direct rule applies. The
  search is not claimed to be exhaustive.
- Cynefin’s
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L21-L111)
  describes fixed domains, quoted items and labeled transitions; its
  [notes](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L203-L210)
  state that self transitions are ignored.
  [PR #7535](https://github.com/mermaid-js/mermaid/pull/7535) added the diagram
  and was merged. On 2026-10-26, searches for cynefin parser, cynefin directive,
  cynefin semicolon and cynefin frontmatter found no inspected maintainer
  judgment on this boundary.
  [Issue #7921](https://github.com/mermaid-js/mermaid/issues/7921) was open with
  Status: Triage and requested framework naming/drawing changes, not a ruling on
  these lexical rules.

### eventmodeling

The pinned
[eventmodeling.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L37-L322)
describes frames, data and tags without defining this shared preprocessing
boundary. Searches of the official issues and pull requests on 2026-10-26 used
eventmodeling title, eventmodeling parser, event modeling data, eventmodeling
accTitle and eventmodeling validator.
[PR #7588](https://github.com/mermaid-js/mermaid/pull/7588), merged on
2026-04-16, adds validator registration; it does not establish a maintainer
ruling on this boundary. The inspected results establish no such ruling; the
existing direct rule applies. The search is not claimed to be exhaustive.

### Treeview

The pinned
[treeView.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treeView.md#L1-L277)
describes indentation, quoted names, annotations and box drawing, without
defining this common boundary. On 2026-10-26 the official issues/PRs were
searched for `treeView quoted`, `treeView indentation`, `treeView box`,
`treeView quotes`, `treeView whitespace` and `treeView accDescr`.
[PR #7721](https://github.com/mermaid-js/mermaid/pull/7721) is the merged
box-drawing addition;
[Issue #8014](https://github.com/mermaid-js/mermaid/issues/8014) is an open
Enhancement/Triage proposal to omit the header. Inspected results establish no
maintainer defect ruling on this boundary; the existing direct rule applies. The
search is not claimed to be exhaustive.
