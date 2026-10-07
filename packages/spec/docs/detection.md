# Diagram detection

Japanese version: [detection.ja.md](./detection.ja.md)

The detectors that select the diagram type, in the order in which mermaid.js
tries them. [Diagram detection](./common.md#diagram-detection) in common.md
defines where they look, with two terms used here as there: the **detection
point**, the first position of the text that is not leading trivia, and the
**position reached**, the detection point moved past the bare `%%` lines and the
directives that detection skips. The detectors look at the diagram text from the
position reached, except the detector of the `error` pseudo-diagram, whose
condition is stated from the detection point. The first detector whose condition
holds selects the diagram type, whose id is also the `diagramType` of the tree
(see [ast.md](./ast.md#root)). When no condition holds, the input is rejected
with `UnknownDiagramError`. [fixture: common/empty]

The registration order is in
[`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L44-L126),
and each detector is in its diagram's directory under
[`diagrams/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams).

## How to read the list

Each detector looks for a **keyword** at the position reached.

- **Where** says where the keyword must be:
  - **start**: the diagram text at the position reached begins with the keyword;
  - **whole text**: the condition of the `error` pseudo-diagram in
    [Diagram detection](./common.md#diagram-detection): the diagram text at the
    detection point, with what that condition leaves out, is the keyword,
    compared case-insensitively, and nothing but whitespace and line terminators
    follows it up to the end of the text.
- **Case** says how the keyword is compared: **exact**, or **case-insensitive**
  in the sense of [Notation](./common.md#notation).
- **After the keyword** says what may come right after it:
  - **anything may follow**: the detector puts no condition on the characters
    after the keyword; `flowchartLR` starts with `flowchart`, for example;
  - **a non-word character or the end**: the character after the keyword is not
    a word character, or the diagram text ends after the keyword;
  - the other entries name the characters that may follow.
- Whitespace, word characters, and characters are as defined in
  [Notation](./common.md#notation).

Each diagram document refers to its entry here and adds only what is specific to
that diagram.

## The detectors

| #   | id              | Keyword                                                                | Where      | Case             | After the keyword               |
| --- | --------------- | ---------------------------------------------------------------------- | ---------- | ---------------- | ------------------------------- |
| 1   | `error`         | `error`                                                                | whole text | case-insensitive | nothing may follow              |
| 2   | `---`           | `---`                                                                  | start      | exact            | anything may follow             |
| 3   | `flowchart-elk` | `flowchart-elk`                                                        | start      | exact            | anything may follow             |
| 4   | `mindmap`       | `mindmap`                                                              | start      | exact            | anything may follow             |
| 5   | `architecture`  | `architecture`                                                         | start      | exact            | anything may follow             |
| 6   | `agentflow`     | `agentflow-beta`                                                       | start      | exact            | a non-word character or the end |
| 7   | `c4`            | `C4Context`, `C4Container`, `C4Component`, `C4Dynamic`, `C4Deployment` | start      | exact            | anything may follow             |
| 8   | `kanban`        | `kanban`                                                               | start      | exact            | anything may follow             |
| 9   | `classDiagram`  | `classDiagram`                                                         | start      | exact            | anything may follow             |
| 10  | `er`            | `erDiagram`                                                            | start      | exact            | anything may follow             |
| 11  | `gantt`         | `gantt`                                                                | start      | exact            | anything may follow             |
| 12  | `info`          | `info`                                                                 | start      | exact            | anything may follow             |
| 13  | `pie`           | `pie`                                                                  | start      | exact            | anything may follow             |
| 14  | `requirement`   | `requirement`                                                          | start      | exact            | anything may follow             |
| 15  | `sequence`      | `sequenceDiagram`                                                      | start      | exact            | anything may follow             |
| 16  | `swimlane`      | `swimlane-beta`                                                        | start      | exact            | a non-word character or the end |
| 17  | `flowchart-v2`  | `graph`, `flowchart`                                                   | start      | exact            | anything may follow             |
| 18  | `timeline`      | `timeline`                                                             | start      | exact            | anything may follow             |
| 19  | `gitGraph`      | `gitGraph`                                                             | start      | exact            | anything may follow             |
| 20  | `stateDiagram`  | `stateDiagram`                                                         | start      | exact            | anything may follow             |
| 21  | `journey`       | `journey`                                                              | start      | exact            | anything may follow             |
| 22  | `quadrantChart` | `quadrantChart`                                                        | start      | exact            | anything may follow             |
| 23  | `sankey`        | `sankey`                                                               | start      | exact            | anything may follow             |
| 24  | `packet`        | `packet`                                                               | start      | exact            | anything may follow             |
| 25  | `xychart`       | `xychart`                                                              | start      | exact            | anything may follow             |
| 26  | `block`         | `block`                                                                | start      | exact            | anything may follow             |
| 27  | `eventmodeling` | `eventmodeling`                                                        | start      | exact            | anything may follow             |
| 28  | `treeView`      | `treeView-beta`                                                        | start      | exact            | anything may follow             |
| 29  | `radar`         | `radar-beta`                                                           | start      | exact            | anything may follow             |
| 30  | `ishikawa`      | `ishikawa`                                                             | start      | case-insensitive | a non-word character or the end |
| 31  | `treemap`       | `treemap`                                                              | start      | exact            | anything may follow             |
| 32  | `railroad`      | `railroad-beta`                                                        | start      | case-insensitive | anything may follow             |
| 33  | `railroadEbnf`  | `railroad-ebnf-beta`                                                   | start      | case-insensitive | anything may follow             |
| 34  | `railroadAbnf`  | `railroad-abnf-beta`                                                   | start      | case-insensitive | anything may follow             |
| 35  | `railroadPeg`   | `railroad-peg-beta`                                                    | start      | case-insensitive | anything may follow             |
| 36  | `venn`          | `venn-beta`                                                            | start      | exact            | anything may follow             |
| 37  | `wardley`       | `wardley-beta`                                                         | start      | case-insensitive | anything may follow             |
| 38  | `cynefin`       | `cynefin-beta`                                                         | start      | exact            | whitespace, `:`, or the end     |
| 39  | `usecase`       | `usecase-beta`                                                         | start      | exact            | whitespace or the end           |

Each entry except entry 2 has a minimal input that mermaid.js accepts as that
id: the header line alone where the diagram's grammar accepts it, and otherwise
the header line and one minimal statement. [fixture:
common/error-pseudo-diagram] [fixture: common/detect-minimal-flowchart-elk]
[fixture: common/detect-minimal-mindmap] [fixture:
common/detect-minimal-architecture] [fixture: common/detect-minimal-agentflow]
[fixture: common/detect-minimal-c4] [fixture: common/detect-minimal-kanban]
[fixture: common/detect-minimal-class-diagram] [fixture:
common/detect-minimal-er] [fixture: common/detect-minimal-gantt] [fixture:
common/detect-minimal-info] [fixture: common/detect-minimal-pie] [fixture:
common/detect-minimal-requirement] [fixture: common/detect-minimal-sequence]
[fixture: common/detect-minimal-swimlane] [fixture:
common/detect-minimal-flowchart-v2] [fixture: common/detect-minimal-timeline]
[fixture: common/detect-minimal-git-graph] [fixture:
common/detect-minimal-state-diagram] [fixture: common/detect-minimal-journey]
[fixture: common/detect-minimal-quadrant-chart] [fixture:
common/detect-minimal-sankey] [fixture: common/detect-minimal-packet] [fixture:
common/detect-minimal-xychart] [fixture: common/detect-minimal-block] [fixture:
common/detect-minimal-eventmodeling] [fixture: common/detect-minimal-tree-view]
[fixture: common/detect-minimal-radar] [fixture: common/detect-minimal-ishikawa]
[fixture: common/detect-minimal-treemap] [fixture:
common/detect-minimal-railroad] [fixture: common/detect-minimal-railroad-ebnf]
[fixture: common/detect-minimal-railroad-abnf] [fixture:
common/detect-minimal-railroad-peg] [fixture: common/detect-minimal-venn]
[fixture: common/detect-minimal-wardley] [fixture:
common/detect-minimal-cynefin] [fixture: common/detect-minimal-usecase] For
entry 7, each of the other four keywords at the start selects `c4` as well; a
keyword in another case selects nothing, since the comparison is exact; a
keyword followed by a word character is detected as `c4`, since anything may
follow, and the C4 grammar then rejects it; and a keyword after another word is
not at the start. [fixture: common/detect-minimal-c4-container] [fixture:
common/detect-minimal-c4-component] [fixture: common/detect-minimal-c4-dynamic]
[fixture: common/detect-minimal-c4-deployment] [fixture: common/detect-c4-case]
[fixture: common/detect-c4-word-after] [fixture:
common/detect-c4-keyword-after-word]

## Notes

- **Pseudo-diagrams.** Entries 1 and 2 are registered before all real diagrams
  ([`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L51-L83)).
  `error` is accepted and has no Db content; `---` is always rejected, so it is
  not a DiagramType. See [common.md](./common.md#diagram-detection) for both.
  For entry 1, mermaid.js lower-cases the whole text with the full Unicode
  lowercase mapping; the only character outside ASCII whose lowercase is an
  ASCII letter is U+212A, which lowers to `k`, and `error` has no `k`, so the
  result is the same as a case-insensitive comparison in the sense of Notation.
  [fixture: common/error-pseudo-diagram] [fixture: common/error-uppercase]
- **Entries registered only with large features.** Entries 3–5 are registered
  only when mermaid.js is built with
  [`includeLargeFeatures`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L87).
  The default entry point of the npm package is built that way, so this
  specification includes them, in this position: after the pseudo-diagrams and
  before every other detector. Entry 3 also sets the layout configuration to
  `elk`; that affects rendering only.
- **Order matters.** Entry 3 comes before entry 17, so `flowchart-elk` selects
  `flowchart-elk`, although it also starts with `flowchart`. No other two
  conditions overlap.
- **Entry 7 in mermaid.js.** mermaid.js writes the condition of entry 7 as five
  alternatives of which only the first, `C4Context`, is anchored to the start of
  the text
  ([`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10)).
  There, a text that contains `C4Container`, `C4Component`, `C4Dynamic`, or
  `C4Deployment` anywhere, for example as a node id or a message text, is a C4
  diagram unless one of entries 1–6 matched first, and a sequence diagram with a
  message `C4Container` is handed to the C4 parser, which rejects it. This
  specification looks at the position reached only, and reads such a text as the
  diagram of its header: the known divergence
  [`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.md).
  `C4Context` counts at the start only in both. [fixture:
  common/detect-c4-anywhere] [fixture: common/detect-c4context-only-at-start]
- **Anything may follow.** For most keywords the detector does not look at the
  next character. `flowchartLR` is detected as `flowchart-v2`, and the flowchart
  grammar then rejects it; the same holds for `graphTD`. [fixture:
  common/detect-no-boundary-flowchart] [fixture:
  common/detect-no-boundary-graph]
- **A non-word character or the end.** For entries 6, 16, and 30 the keyword
  must not be followed by a word character. `swimlane-betaX` is not detected,
  and no other detector matches it. For entry 30 the condition applies right
  after `ishikawa`, so `ishikawa-beta` and even `ishikawa-betaX` are detected,
  while `ishikawaX` is not. [fixture: common/detect-boundary-swimlane] [fixture:
  common/detect-ishikawa-beta-suffix] [fixture:
  common/detect-ishikawa-word-after] A character outside ASCII is not a word
  character (see [Notation](./common.md#notation)): `ishikawa` followed by
  U+017F or by `é` is detected as ishikawa and accepted, and `swimlane-beta`
  followed by `é` is detected as swimlane, whose grammar then rejects it.
  [fixture: common/detect-boundary-ishikawa-long-s] [fixture:
  common/detect-boundary-ishikawa-e-acute] [fixture:
  common/detect-boundary-swimlane-e-acute]
- **Specific characters after the keyword.** Entry 38 accepts `:` after
  `cynefin-beta`, and entry 39 does not accept `:` after `usecase-beta`.
  [fixture: common/detect-cynefin-colon] [fixture: common/detect-usecase-colon]
- **Case.** Entries 30, 32–35, and 37 are case-insensitive: `ISHIKAWA` and
  `IsHiKaWa` select ishikawa. They compare case-insensitively as defined in
  [Notation](./common.md#notation), where a character outside ASCII whose
  uppercase would be an ASCII letter keeps itself, so U+212A in place of `K` and
  U+017F in place of `s` are not detected. All other detectors are exact:
  `sequencediagram` is not detected. Whether the diagram's own grammar then
  accepts an upper-case keyword is up to that grammar and is described in its
  document. [fixture: common/detect-case-insensitive-ishikawa] [fixture:
  common/detect-case-mixed-ishikawa] [fixture: common/detect-case-kelvin-sign]
  [fixture: common/detect-case-long-s] [fixture:
  common/detect-case-sensitive-sequence]
