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

In kanban, a directive inside `kanban`, a shape opener or closer, `::icon(`,
`:::`, or the data opener `@{` is rejected. mermaid.js joins the two parts and
accepts the input. [fixture: kanban/header-directive-inside] [fixture:
kanban/div-directive-opener] [fixture: kanban/div-directive-closer] [fixture:
kanban/div-directive-icon-marker] [fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker]

Node text, shape text, icon text, class text, strings, and data content may
contain a directive. [fixture: kanban/db-grid-directive-item-id] [fixture:
kanban/db-grid-directive-item-label-bare] [fixture:
kanban/db-grid-directive-item-icon] [fixture:
kanban/db-grid-directive-item-class] [fixture: kanban/lex-label-directive-line]
[fixture: kanban/db-metadata-directive] A directive between complete data blocks
is allowed (see
[Directives inside units](../diagrams/kanban.md#directives-inside-units)).
[fixture: kanban/db-metadata-adjacent-directive]

In C4, a directive inside a header keyword, call keyword, `accTitle`, or
`accDescr` is rejected, while mermaid.js joins its parts. [fixture:
c4/lex-directive-keyword] [fixture: c4/div-directive-header] [fixture:
c4/div-acc-title-directive] [fixture: c4/div-acc-block-marker-directive]

Bare arguments and named keys are text units and may contain directives, as may
quoted arguments and title or description text. [fixture:
c4/lex-directive-bare-alias] [fixture: c4/lex-directive-named-key] [fixture:
c4/lex-directive-quoted] [fixture: c4/lex-title-directive-value]

The equals sign and opening quote of a named value are separate delimiters, so a
directive between them is allowed. [fixture:
c4/lex-directive-named-equals-quote]

In venn, a directive inside the header, a statement keyword, a name, a size, a
numeric text id, or an identifier or number of a bare style value is rejected
here. [fixture: venn/header-directive-inside] [fixture:
venn/lex-directive-in-set] [fixture: venn/lex-directive-in-union] [fixture:
venn/lex-directive-in-text] [fixture: venn/lex-directive-in-style] [fixture:
venn/lex-directive-in-title] [fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size] [fixture:
venn/db-grid-directive-style-key] [fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value] [fixture:
venn/div-directive-union-target] [fixture: venn/div-directive-text-id] [fixture:
venn/div-directive-style-target] [fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number] [fixture:
venn/lex-unterminated-directive-next-line] [fixture:
venn/lex-unterminated-colon-directive-next-line] mermaid.js joins the parts.
[fixture: venn/header-directive-inside] [fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare] [fixture:
venn/db-grid-directive-size] [fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number] [fixture:
venn/db-grid-directive-style-value] [fixture: venn/div-directive-union-target]
[fixture: venn/div-directive-text-id] [fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word] [fixture:
venn/div-directive-style-value-number] [fixture:
venn/lex-unterminated-directive-next-line] [fixture:
venn/lex-unterminated-colon-directive-next-line]

Venn strings, label content, title content, and whole color units can contain
directives. [fixture: venn/lex-identifier-directive-middle] [fixture:
venn/db-grid-directive-label-bare] [fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-style-directive-middle] [fixture:
venn/lex-title-directive-middle] [fixture: venn/lex-directive-style-value-color]
[fixture: venn/lex-style-value-rgb-directive-in-comma] [fixture:
venn/lex-directive-label-delimiter-gap] The bracket and quote of a label are
separate delimiters. [fixture: venn/lex-identifier-directive-middle] [fixture:
venn/db-grid-directive-label-bare] [fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-style-directive-middle] [fixture:
venn/lex-title-directive-middle] [fixture: venn/lex-directive-style-value-color]
[fixture: venn/lex-style-value-rgb-directive-in-comma] [fixture:
venn/lex-directive-label-delimiter-gap]

In Ishikawa, a directive splitting the selected `ishikawa` or `ishikawa-beta`
keyword, including before `-beta` in a complete beta header, is rejected here.
mermaid.js joins the parts and accepts these inputs. [fixture:
ishikawa/directive-in-header] [fixture: ishikawa/directive-in-beta-header]
[fixture: ishikawa/div-directive-beta-prefix]

If the beta word boundary fails, the suffix is node text after the stable header
and may contain a directive, also immediately before `-betaX`. Numeric-looking
node text may contain directives too. These inputs are accepted by both and have
no divergence mark. [fixture: ishikawa/lex-directive-before-beta-fallback-text]
[fixture: ishikawa/lex-directive-in-beta-fallback-text] [fixture:
ishikawa/lex-directive-in-numeric-looking-text]

Node text is prose, including quotes, and may contain directives; its value
leaves them out. [fixture: ishikawa/directive-root-middle] [fixture:
ishikawa/directive-in-quoted-root] [fixture: ishikawa/directive-child-middle]

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
     A["a %%{init: {}}%% b"] --> B
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

### Agentflow

In agentflow, the whole-unit rule also covers its beta header,
flow/connector/global/end keywords, three arrow kinds, opening arrow, edge id,
shape/property delimiters, click ids, interpolation name, and linkStyle indices.
Their spelling spans both sides of the removed directive. An Identifier or arrow
sibling cannot hold that internal text without changing its value or delimiter;
apply reason 2 rather than reconstructing the atom. [fixture:
agentflow/div-directive-in-header] [fixture:
agentflow/div-directive-in-flow-keyword] [fixture:
agentflow/div-directive-in-connector-keyword] [fixture:
agentflow/div-directive-in-global-keyword] [fixture:
agentflow/div-directive-in-end-keyword] [fixture:
agentflow/div-directive-in-arrow-reference] [fixture:
agentflow/div-directive-in-opening-arrow] [fixture:
agentflow/div-directive-in-edge-id] [fixture:
agentflow/div-directive-in-props-field] [fixture:
agentflow/div-directive-in-linkstyle-number]

Flow/connector Name fragments, labels, styles, accessibility text, callback
text, strings, and opaque data interiors already retain directives as common
trivia. In particular, a metadata key is data text. Complete-unit pipe
boundaries stay accepted. These cases need no mark; a joined input already
rejected by Mermaid needs none either. [fixture:
agentflow/lex-directive-in-flow-name-text] [fixture:
agentflow/lex-directive-in-classdef-value] [fixture:
agentflow/lex-directive-in-metadata-key] [fixture:
agentflow/lex-directive-in-pipe-boundary] [fixture:
agentflow/lex-directive-joins-invalid-linkstyle-index]

### Usecase

In usecase, the affected text is a directive strictly inside a header or
statement keyword, direction word, id, edge id, class name, native bare metadata
key/value, word within a CSS property name, arrow, or compound `@{`, `:::`,
`<<`, or `>>`. Root.directives retains the directive, but the atomic spelling
cannot contain it as a child or sibling and remain a whole unit. Mermaid accepts
the joined spellings; the whole-unit rule rejects them for reason 2, rather than
copying its preprocessing. This rule introduces no reverse-direction acceptance.
[fixture: usecase/div-directive-in-header] [fixture:
usecase/div-directive-in-id] [fixture: usecase/div-directive-splits-operator]
[fixture: usecase/div-lex-directive-in-metadata-key] [fixture:
usecase/div-directive-in-native-boolean] [fixture:
usecase/div-directive-stereotype-closer] [fixture:
usecase/div-directive-raw-json-id] [fixture:
usecase/div-directive-explicit-edge-id] [fixture:
usecase/lex-stereotype-closer-control] [fixture:
usecase/gram-json-prefix-id-control] [fixture:
usecase/gram-explicit-edge-id-control]

CSS property names are name units that may include the internal HWS of
`-- color`. A directive in that HWS is accepted as trivia: the name node can
hold the text around it just as a string or raw-text node can. Mermaid reads
`--` and the following word as separate units with or without the directive, so
nothing is joined and reason 2 does not apply. [fixture:
usecase/lex-directive-css-name-gap] [fixture:
usecase/lex-class-property-custom-gap] A directive inside the word, as in
`co%%{init: {}}%%lor`, remains this divergence. [fixture:
usecase/div-directive-css-property]

CSS values, quoted native metadata keys/values, labels, stereotypes, and JSON
contents retain their written text and allow trivia fragments. [fixture:
usecase/lex-directive-css-number] [fixture:
usecase/lex-directive-native-quoted-key] The json-prefix matcher packages json,
id and @ together, but they are separate authored components: a directive
between the complete id and @ or between @ and { is allowed; native `@{` is
atomic. [fixture: usecase/lex-directive-whole-json-prefix-boundary] [fixture:
usecase/lex-directive-in-json-declaration-at]

### Pie

PieIgnoredText can hold a hidden DIRECTIVE at a unit boundary, including one
that consumes the line break after a value; a common Directive holds a global
directive between complete authored components. Neither can stand inside the
fixed spelling of `pie`, `showData`, `title`, `accTitle`, `accDescr` or a single
number. The direct boundary rule rejects the latter inputs where mermaid.js
removes the directive and joins their fragments. A directive between a complete
`accTitle` and its colon, or between `accDescr` and its brace, is a component
boundary; a directive inside a quoted label or a common statement value remains
allowed trivia. Hidden forms retain their own written text and do not join
numeric fragments. These accepted forms need no divergence. The differing
fixtures below are all accepted by mermaid.js and rejected here; this rule adds
no pie input accepted here and rejected by mermaid.js. An unclosed global
directive that both reject is not marked. [fixture: pie/div-directive-in-header]
[fixture: pie/div-directive-in-showdata] [fixture:
pie/div-directive-in-title-keyword] [fixture:
pie/div-directive-in-acctitle-keyword] [fixture:
pie/div-directive-in-accdescr-keyword] [fixture: pie/div-directive-number]
[fixture: pie/div-review-directive-number-sign] [fixture:
pie/div-review-directive-number-decimal] [fixture:
pie/review-directive-acc-title-colon] [fixture:
pie/review-directive-acc-descr-block-opener] [fixture:
pie/directive-label-middle] [fixture: pie/directive-title-middle] [fixture:
pie/lex-hidden-eof-extra-lf] [fixture: pie/review-directive-open-inside-header]
[fixture: pie/div-directive-in-accdescr-block-keyword]

### Gitgraph

Whole hidden forms have GitgraphIgnoredText owners and common trivia can cut
strings/common literals. A directive strictly inside a keyword word,
direction/type word, integer or bare reference cannot be held as a separate
complete component without joining its spelling. The direct atomic rule
therefore rejects these Mermaid-accepted inputs under reason 2. It introduces no
input accepted only here. A directive between an option word and colon, or
inside quoted text, is allowed; both-rejected glued boundary cases carry no
mark. [fixture: gitgraph/div-directive-in-header] [fixture:
gitgraph/div-directive-in-commit] [fixture:
gitgraph/div-directive-in-option-keyword] [fixture:
gitgraph/div-directive-in-type] [fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-directive-in-reference] [fixture:
gitgraph/lex-option-global-before-colon] [fixture: gitgraph/directive-in-string]
[fixture: gitgraph/directive-after-header-glued]

### Info

Common Directive records hold global directives and InfoIgnoredText holds
complete hidden forms. Neither supplies a separate component strictly inside a
fixed keyword. The direct atomic rule rejects a directive inside info, showInfo,
title, accTitle or accDescr although Mermaid joins its parts; this is reason 2.
It adds no reverse acceptance. Complete component boundaries and value/hidden
text are allowed; independently invalid joined inputs remain rejected by both.
[fixture: info/div-directive-header-middle] [fixture:
info/div-directive-flag-middle] [fixture: info/div-directive-title-middle]
[fixture: info/div-directive-acctitle-middle] [fixture:
info/div-directive-accdescr-middle] [fixture:
info/div-directive-accdescr-line-keyword] [fixture:
info/directive-acctitle-colon] [fixture: info/directive-block-brace] [fixture:
info/lex-yaml-opener-global] [fixture: info/lex-directive-rejected-tail]

## The documentation of mermaid.js and its issues

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

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L148-L157)
  shows calls and named arguments, but does not describe directives inside a
  header or call keyword. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-21 with `C4 directive`,
  `C4 directive in:title,body`, `C4 directive keyword in:title,body`, and
  `"Add directive support" in:title` found no report about that form.
  [PR #4759](https://github.com/mermaid-js/mermaid/pull/4759) introduces
  preprocessing that removes directives, frontmatter, and comments before
  diagram parsing for all diagram types.

- The pinned
  [venn documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  shows complete keywords and names, but no directive inside them. Searches of
  issues and pull requests in `mermaid-js/mermaid` on 2026-10-21 with
  `venn directive in:title,body` found no report about a directive inside a venn
  keyword, name, or number.

- The pinned
  [Ishikawa documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
  shows a complete `ishikawa-beta` header and indented node text, but no
  directive inside the header.
  [Issue #4784](https://github.com/mermaid-js/mermaid/issues/4784) proposes
  syntax like mindmap's. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-21 with `ishikawa` and
  `ishikawa directive in:title,body` found no report about a directive splitting
  an Ishikawa header.

- The pinned
  [usecase documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  describes native metadata and CSS. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `usecase directive` found no inspected
  report establishing a maintainer defect judgment for this acceptance behavior.
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048), closed and merged
  on 2026-08-14 with Type: Enhancement, introduces the Chevrotain parser, model
  validation and JSON tables. This divergence follows the shared direct rule,
  not a claim that a bug label approves a grammar change.

- For pie, the pinned
  [syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  describes the header, sections and titles, without directives inside their
  spellings. [PR #4751](https://github.com/mermaid-js/mermaid/pull/4751), merged
  on 2024-02-11, introduced the Langium grammar and its ignored YAML, directives
  and comments. Searches of `mermaid-js/mermaid` issues and pull requests on
  2026-10-23 for `pie`, `pie directive` and `pie Langium` found no maintainer
  decision that directives inside these atoms are a defect. The boundary rule is
  a direct syntax choice, not such a decision.

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
