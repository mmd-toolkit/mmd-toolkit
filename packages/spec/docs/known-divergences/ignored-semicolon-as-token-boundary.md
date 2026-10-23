# ignored-semicolon-as-token-boundary

Japanese version:
[ignored-semicolon-as-token-boundary.ja.md](./ignored-semicolon-as-token-boundary.ja.md)

Diagram types: flowchart, sequence, class, state, er, gantt, journey,
requirement, mindmap, timeline, xychart, quadrant, block, kanban, c4, venn,
agentflow, usecase, pie, gitgraph, and info. This is one of the
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

In kanban, the selected semicolon inside an opener or closer splits the
delimiter and is rejected. mermaid.js accepts `style:#x{;{b}}` and
`style:#x{{b};}` as the same shape as `style:#x{{b}}`. [fixture:
kanban/div-semicolon-opener] [fixture: kanban/div-semicolon-closer] [fixture:
kanban/gram-semicolon-text-reference]

Inside node text, label text, a string, or data content, the selected semicolon
is ignored. [fixture: kanban/lex-id-style-rule] [fixture:
kanban/lex-id-classdef-rule] [fixture: kanban/lex-label-style-rule] [fixture:
kanban/lex-metadata-style-rule] A semicolon on the next line is not selected:
`::ic;on` after a line holding `style:#x` is node text (see
[Directives inside units](../diagrams/kanban.md#directives-inside-units)).
[fixture: kanban/lex-label-style-rule-other-line] [fixture:
kanban/lex-semicolon-icon-marker]

In C4, `accDescr { style:#x }Pers;on(a,"A")` is rejected here because the
selected semicolon lies inside the call keyword; mermaid.js removes it and
accepts the call. [fixture: c4/div-semicolon-call-keyword-after-block]

A selected semicolon inside bare argument text or a named key is trivia, and one
between `=` and the opening quote is trivia between delimiters. [fixture:
c4/lex-semicolon-text-selected] [fixture: c4/lex-semicolon-key-selected]
[fixture: c4/lex-semicolon-delimiter-selected]

In venn, the selected semicolon inside a name, size, text id, statement keyword,
property key, or an identifier or number in a bare style value is rejected here.
[fixture: venn/div-ignored-semicolon-set-name-selected] [fixture:
venn/div-ignored-semicolon-size] [fixture:
venn/div-ignored-semicolon-text-id-selected] [fixture:
venn/div-ignored-semicolon-text-number-selected] [fixture:
venn/div-ignored-semicolon-set-keyword-selected] [fixture:
venn/div-ignored-semicolon-title-keyword-selected] [fixture:
venn/div-ignored-semicolon-style-key-selected] [fixture:
venn/div-ignored-semicolon-style-value-selected] mermaid.js joins the parts.
[fixture: venn/div-ignored-semicolon-set-name-selected] [fixture:
venn/div-ignored-semicolon-size] [fixture:
venn/div-ignored-semicolon-text-id-selected] [fixture:
venn/div-ignored-semicolon-text-number-selected] [fixture:
venn/div-ignored-semicolon-set-keyword-selected] [fixture:
venn/div-ignored-semicolon-title-keyword-selected] [fixture:
venn/div-ignored-semicolon-style-key-selected] [fixture:
venn/div-ignored-semicolon-style-value-selected] [fixture:
venn/div-ignored-semicolon-style-value-number-selected]

A selected semicolon inside a whole venn color unit is trivia and does not cause
this divergence. [fixture: venn/lex-style-hex-ignored-semicolon] [fixture:
venn/lex-style-rgb-ignored-semicolon]

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

### Agentflow

In agentflow, a selected semicolon inside an id, class name, click id, edge id,
linkStyle number, keyword, arrow, or compound delimiter cannot be retained by an
EmptyStatement without splitting that atom or changing its value. Mermaid joins
the parts; the existing direct whole-unit rule rejects them under reason 2.
[fixture: agentflow/div-ignored-semicolon-in-id] [fixture:
agentflow/div-ignored-semicolon-in-css-class] [fixture:
agentflow/div-ignored-semicolon-in-click-id] [fixture:
agentflow/div-ignored-semicolon-in-edge-id] [fixture:
agentflow/div-ignored-semicolon-in-linkstyle-number] [fixture:
agentflow/div-ignored-semicolon-in-keyword] [fixture:
agentflow/div-ignored-semicolon-in-arrow] [fixture:
agentflow/div-ignored-semicolon-in-data-block-start]

Name text, labels, styles, and opaque metadata keys retain the selected
semicolon as trivia; it is not an Identifier boundary there. A semicolon at a
complete pipe boundary also changes no unit. Those controls remain unmarked.
[fixture: agentflow/lex-ignored-semicolon-in-flow-name-text] [fixture:
agentflow/lex-ignored-semicolon-in-metadata-key] [fixture:
agentflow/lex-ignored-semicolon-in-pipe-boundary]

### Usecase

In usecase, the affected text is the one-character range of a selected `;`
inside an atomic name, keyword, arrow or delimiter, including a word within a
CSS property name. An empty statement cannot stand inside that atom. Mermaid
accepts the joined id, include word, arrow, metadata key/value or delimiter; the
direct whole-unit rule rejects it for reason 2. No Mermaid rejection becomes
accepted under this rule. [fixture: usecase/div-semicolon-identifier-selected]
[fixture: usecase/div-semicolon-keyword-selected] [fixture:
usecase/div-semicolon-joins-arrow-selected] [fixture:
usecase/div-semicolon-native-key-valid] [fixture:
usecase/div-semicolon-native-value-selected] [fixture:
usecase/div-semicolon-native-opener-selected] [fixture:
usecase/div-semicolon-css-property-selected] [fixture:
usecase/div-semicolon-stereotype-closer-selected] [fixture:
usecase/lex-semicolon-stereotype-closer-control]

In CSS property names in `style` and `classDef`, a selected `;` in the HWS
between `--` and the following word is accepted as trivia. UsecaseIdentifier can
hold the surrounding text; `--` and the word remain separate units with or
without the semicolon, so nothing is joined and reason 2 does not apply.
[fixture: usecase/lex-semicolon-css-name-gap] [fixture:
usecase/lex-semicolon-classdef-css-name-gap]

In labels, CSS values, strings and opaque JSON, existing text nodes already hold
the written content and the semicolon can be trivia. A selected semicolon
between complete units is allowed too. A semicolon before the selection trigger,
or an independently invalid joined diagram, remains an ordinary rejection with
no divergence mark. [fixture: usecase/lex-semicolon-complete-unit-boundary]
[fixture: usecase/lex-semicolon-css-number-text] [fixture:
usecase/lex-semicolon-joins-id-selected] [fixture:
usecase/lex-semicolon-native-key-selected]

### Pie

PieIgnoredText holds a whole hidden YAML or DIRECTIVE form, not an arbitrary
character inside a number or keyword. A selected semicolon inside `1;2`,
`title`, `showData`, `accTitle` or `accDescr` therefore has no node at that
location. The direct rule makes it a boundary instead of joining those
fragments. In the fixtures below, a `style` or `classDef` trigger selects the
semicolon even inside the atom. A hidden DIRECTIVE can enclose the trigger while
the common line rule still selects the semicolon later on that line. Mermaid.js
then accepts the joined atom, while this specification rejects it. There is no
reverse-direction pie input introduced by this rule. A semicolon inside a label
or value is kept as written text with the shared ignored-semicolon record, and
an ignored semicolon inside a hidden block does not split that block; these
forms are not marked when the result agrees. [fixture:
pie/div-atomic-semicolon-number] [fixture:
pie/div-selected-semicolon-title-keyword] [fixture:
pie/div-selected-semicolon-showdata] [fixture:
pie/div-selected-semicolon-acctitle] [fixture:
pie/div-selected-semicolon-accdescr] [fixture:
pie/div-selected-semicolon-block-keyword] [fixture: pie/style-label-trigger]
[fixture: pie/style-title-trigger] [fixture:
pie/lex-yaml-opener-selected-semicolon]

### Gitgraph

A whole skipped form has a node; an arbitrary semicolon inside an atomic word,
reference or integer does not. Selected semicolons strictly inside those atoms
reject here although Mermaid joins them. This uses reason 2 and has no
acceptance in the reverse direction. A selected semicolon at the option
word/colon boundary or after a complete number is trivia; an unselected
semicolon rejects in both readings. [fixture:
gitgraph/div-style-semicolon-in-order-keyword] [fixture:
gitgraph/div-style-semicolon-in-order-number] [fixture:
gitgraph/div-lex-selected-semicolon-type-word] [fixture:
gitgraph/div-lex-selected-semicolon-bare-reference-valid] [fixture:
gitgraph/lex-selected-semicolon-option-word-colon] [fixture:
gitgraph/lex-selected-semicolon-number-control] [fixture:
gitgraph/lex-selected-semicolon-reference]

### Info

The one-character selected-semicolon range can be common trivia, but no
statement or ignored-text sibling can stand inside a fixed keyword. Reason 2
rejects selected semicolons inside showInfo, title, accTitle and both accDescr
forms although Mermaid joins them. There is no reverse acceptance. Complete
component boundaries and hidden/value text agree; an unselected semicolon, a
split header rejected before selection, or another invalid tail remains
unmarked. [fixture: info/div-selected-showinfo] [fixture:
info/div-selected-title] [fixture: info/div-selected-acctitle] [fixture:
info/div-selected-accdescr-line] [fixture: info/div-selected-accdescr-block]
[fixture: info/lex-selected-colon-boundary] [fixture:
info/lex-selected-brace-boundary] [fixture: info/lex-hidden-opener-selected]
[fixture: info/lex-selected-header] [fixture:
info/lex-selected-keyword-rejected-tail] [fixture: info/end-header-semicolon]

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

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L43-L49)
  shows `UpdateElementStyle` and `UpdateRelStyle` calls without semicolons, and
  does not describe a semicolon removed from inside a call keyword. Searches of
  issues and pull requests in `mermaid-js/mermaid` on 2026-10-21 with
  `C4 semicolon in:title,body` and `C4 encodeEntities in:title,body` found
  [PR #8039](https://github.com/mermaid-js/mermaid/pull/8039), which changes the
  handling of `#` in titles and descriptions and explicitly preserves semicolon
  termination of those values. No issue or pull request about the selected
  semicolon inside a C4 keyword was found.

- The pinned
  [venn documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  uses comma-separated properties and shows no semicolon inside a keyword, name,
  or number. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-21 with `venn semicolon in:title,body` returned no results.

- The pinned
  [Agentflow documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L108-L118)
  describes node declarations as flowchart syntax and shows bracket labels. It
  does not describe a selected semicolon removed from inside a keyword, id, or
  arrow. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-22 with `agentflow semicolon in:title,body` returned no results.

- The pinned
  [usecase documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  describes statement syntax. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `usecase semicolon` found no inspected
  report establishing a maintainer defect judgment for this acceptance behavior.
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048), closed and merged
  on 2026-08-14 with Type: Enhancement, introduces the Chevrotain parser, model
  validation and JSON tables. This divergence follows the shared direct rule,
  not a claim that a bug label approves a grammar change.

- For pie, the pinned
  [syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  has no `style` or `classDef` statement. Searches on 2026-10-23 for `pie`,
  `pie semicolon` and `pie classDef` found no maintainer decision about a
  selected semicolon joining parts of a pie atom. This follows the shared
  boundary rule, not an asserted defect classification.

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
