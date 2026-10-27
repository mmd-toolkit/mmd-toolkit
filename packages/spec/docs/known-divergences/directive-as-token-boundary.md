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

The example places an `init` directive before the header. [fixture:
common/directive-init-theme]

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

The fixtures record the readings compared in the table. [fixture:
sequence/div-directive-in-keyword] [fixture:
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

### Packet

Shared Directive records hold the text, but a fixed word or integer has no
internal component boundary. The direct atomic rule rejects their split forms
under reason 2. A complete keyword/colon or keyword/brace boundary and value
text are nondiffering controls. [fixture: packet/directive-header-middle]
[fixture: packet/directive-beta-middle] [fixture: packet/directive-title-middle]
[fixture: packet/directive-acctitle-middle] [fixture:
packet/directive-accdescr-middle] [fixture: packet/directive-number-middle]
[fixture: packet/directive-acctitle-colon] [fixture:
packet/directive-accdescr-brace] [fixture: packet/directive-label-middle]

### Architecture

Architecture allows common directives between the parentheses and a complete
icon name, and between the braces and the complete group word of a modifier.
Inside an ID, icon name, keyword or double-dash line, a directive would cut an
indivisible component and has no ignored-text position. Mermaid joins those
pieces; this specification rejects them. A text/string value can retain the
written content with its directive omitted, so it is accepted instead. An
unclosed directive that joins a declaration ID to later text follows the same
name boundary rule. [fixture: architecture/directive-icon-delimiters] [fixture:
architecture/directive-group-delimiters] [fixture:
architecture/div-directive-name] [fixture: architecture/div-directive-icon-name]
[fixture: architecture/div-directive-group-word] [fixture:
architecture/div-directive-line] [fixture: architecture/directive-fields]
[fixture: architecture/end-group-unclosed-directive] [fixture:
architecture/end-junction-unclosed-directive]

### Radar

Radar rejects a global directive strictly inside an id, number or fixed word,
including true/false, circle/polygon and a common keyword. First ask whether a
node can preserve that reading: RadarIgnoredText can hold a whole native hidden
form, but has no slot inside an indivisible atom. The remaining difference
therefore follows the direct boundary rule rather than concatenating atom
fragments in preprocessing. [fixture: radar/directive-header-middle] [fixture:
radar/directive-axis-name] [fixture: radar/directive-curve-name] [fixture:
radar/directive-number] [fixture: radar/directive-reference] [fixture:
radar/div-directive-boolean-atom] [fixture: radar/div-directive-graticule-atom]
[fixture: radar/div-directive-common-keyword]

Between complete authored components a global directive is allowed: header word
and colon; common keyword and colon or brace; a label bracket and its string;
entry name, optional colon and number; and members and their commas. Its removal
must still leave a valid lexical boundary. A native form stays in its named gap
or body slot, whereas a global directive uses the shared root list. Strings,
common values and native-form contents can contain global directives without
splitting an atom. [fixture: radar/gram-directive-composite-header] [fixture:
radar/directive-common-colon] [fixture: radar/common-block-directive-gap]
[fixture: radar/directive-common] [fixture: radar/directive-label-before-open]
[fixture: radar/directive-label-after-open] [fixture:
radar/directive-label-before-close] [fixture:
radar/directive-entry-before-colon] [fixture:
radar/directive-entry-before-value] [fixture: radar/directive-list-comma]
[fixture: radar/directive-curve-brace] [fixture:
radar/directive-entry-no-colon-joins] [fixture: radar/directive-header-glued]
[fixture: radar/directive-header-space] [fixture:
radar/directive-option-space-control] [fixture:
radar/directive-title-space-control] [fixture:
radar/lex-hidden-yaml-global-inside] [fixture:
radar/lex-hidden-yaml-opener-global] [fixture:
radar/lex-hidden-yaml-closer-global] [fixture:
radar/lex-hidden-native-opener-global] [fixture:
radar/lex-hidden-native-closer-global]

### Treemap

Treemap distinguishes authored components even inside its composite terminals.
An atomic header, classDef/common keyword, class name, selector, number or `:::`
cannot hold an internal directive as one atomic spelling; adding ignored text
would not restore that atom. Strings, common text and whole class style can hold
the directive-spanning authored value, so no rejection is added there. A
directive between complete components is allowed when required whitespace
remains. Mermaid's removed-directive reading and the marked accepted fixtures
establish the difference; missing-whitespace and invalid-suffix controls still
reject in both readings. [fixture: treemap/directive-header-middle] [fixture:
treemap/div-directive-beta-header] [fixture: treemap/directive-class-keyword]
[fixture: treemap/directive-class-name] [fixture:
treemap/directive-common-keyword] [fixture: treemap/directive-number] [fixture:
treemap/directive-selector] [fixture: treemap/div-directive-style-marker]
[fixture: treemap/directive-style] [fixture: treemap/directive-name-middle]
[fixture: treemap/directive-common-colon] [fixture:
treemap/directive-class-keyword-name-gap] [fixture:
treemap/directive-class-keyword-missing-space] [fixture:
treemap/directive-invalid-number-suffix-control]

### Railroad

The
[railroad lexical rules](../diagrams/railroad.md#common-directive-and-semicolon-boundaries)
treat each header, name, IR constructor, metadata keyword, decimal count and
compound assignment as an authored atom. A common directive inside one splits it
and rejects. Metadata keywords, their colon/brace and values are separate
components. ABNF repeat bounds and star are separate components; its percent
numeric value is a text unit. Directives between complete repeat components or
within string/text values remain allowed. [fixture:
railroad/ir-div-directive-header] [fixture: railroad/ir-directive-keyword-glued]
[fixture: railroad/ir-directive-name] [fixture:
railroad/ir-directive-description-keyword] [fixture:
railroad/ebnf-div-directive-assignment] [fixture:
railroad/peg-directive-operator] [fixture:
railroad/abnf-directive-repeat-number] [fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star] [fixture:
railroad/abnf-directive-numval-prefix] [fixture:
railroad/abnf-directive-numval-digits]

The tree can retain native YAML and nonword native directives in
RailroadIgnoredText and ordinary comments in Comment; those inputs stay
accepted. A shared Directive record also preserves a split atom’s source, but no
expression or ignored-text sibling represents that atom as one authored unit.
The second answer is therefore reason 2: use the direct boundary rule instead of
Mermaid’s deletion-and-gluing order. No new divergence identifier is introduced.
[fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership] [fixture:
railroad/ir-directive-keyword-glued]

### Wardley

Global directives have shared Directive records. WardleyIdentifier,
StringLiteral, WardleyLiteral and WardleyIgnoredText retain the remaining
authored text wherever the syntax permits text. Fixed words, numbers, ID-form
names and indivisible arrow, port or marker glyphs have no internal authored
gap, so joining their fragments would require a different lexical rule, even
though their raw source can be retained. The existing reason-2 atomic-boundary
rule therefore rejects such splits. [fixture: wardley/directive-keyword-middle]
[fixture: wardley/directive-header-inside] [fixture:
wardley/directive-id-inside] [fixture: wardley/directive-strategy-inside]
[fixture: wardley/directive-arrow-inside] [fixture:
wardley/directive-port-inside] [fixture: wardley/directive-flow-marker-inside]
[fixture: wardley/directive-number]

The authored components of coordinates, signed offsets and parenthesized
decorations are separate boundaries. A labeled flow similarly has a plus, a
quoted label and an end marker. Global directives may occur between these
complete parts, inside strings or spaced-name text, and inside native hidden
punctuation. This does not permit ordinary padding or native hidden text inside
the composite flow unit. A directive is not made indivisible merely because
Mermaid matches the whole coordinate or decoration with one terminal. [fixture:
wardley/directive-coordinate-parts] [fixture: wardley/directive-offset-sign]
[fixture: wardley/directive-strategy-parts] [fixture:
wardley/directive-parenthesized-inertia-parts] [fixture:
wardley/directive-flow-before-label] [fixture:
wardley/directive-flow-after-label] [fixture: wardley/directive-name-inside]
[fixture: wardley/directive-native-opener-split] [fixture:
wardley/lex-link-native-flow-components]

### Cynefin

Shared directive records can hold a directive’s source, but a fixed
header/domain/common word or indivisible arrow has no internal authored gap.
Reject a global directive inside such an atom. Complete component boundaries and
text interiors remain allowed; native hidden forms already have nodes and need
no divergence. [fixture: cynefin/directive-header-inside] [fixture:
cynefin/directive-domain-inside] [fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/directive-common-keyword] [fixture:
cynefin/directive-title-inside] [fixture: cynefin/directive-block-inside]
[fixture: cynefin/directive-clear-inside] [fixture:
cynefin/directive-transition-parts] [fixture:
cynefin/directive-description-brace] [fixture:
cynefin/directive-native-yaml-components] [fixture:
cynefin/directive-native-directive-components] [fixture:
cynefin/directive-every-field]

The
[pinned grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30)
and
[public adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19)
read the result of the common preprocessing/detection pipeline. The
[Cynefin syntax](../diagrams/cynefin.md) states the direct rule and
[tree](../ast/cynefin.md) retains its authored forms. [fixture:
cynefin/db-all-fields]

### eventmodeling

Eventmodeling treats each header/statement/common keyword, entity/data-type
word, single identifier segment, frame-name digit string, ->>, [[ and ]] as an
atom. Root.directives can retain the removed directive, but cannot join the two
atomic spellings into one authored unit. Mermaid accepts the split atoms; this
specification rejects them under this existing boundary rule. Type-tag
backticks/type word/body, qualified-name dots/segments and reference
delimiters/name are separate components, so their boundaries remain permitted
when the remaining lexical text is valid. Native comment marks and ignored
fences have their own whole Comment/IgnoredText owners; they are not rejected
merely for being hidden. [fixture: eventmodeling/directive-header-inside]
[fixture: eventmodeling/directive-id-inside] [fixture:
eventmodeling/directive-number-inside] [fixture:
eventmodeling/directive-arrow-inside] [fixture:
eventmodeling/directive-reference-inside] [fixture:
eventmodeling/directive-reference-close-inside] [fixture:
eventmodeling/directive-json-inside] [fixture:
eventmodeling/directive-qualified] [fixture: eventmodeling/directive-reference]
[fixture: eventmodeling/directive-tag] [fixture:
eventmodeling/lex-hidden-yaml-fence-directive] [fixture:
eventmodeling/comment-mark-directive]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70)
defines the units; [the diagram syntax](../diagrams/eventmodeling.md) defines
their direct boundaries.

### Treeview

Treeview rejects directives inside the exact header, common keywords, the word
`icon`, `:::` or `##`, class names and complete icon references. The latter
reference includes its colon. Shared Directive records can retain the removed
text, but joining atomic spellings across it would violate the direct boundary
rule. Bare names and other text/string interiors can hold fragments;
complete-component gaps remain allowed. A branch and each dash are separate
components, so directives between them are allowed. The
[diagram syntax](../diagrams/treeview.md#comments-and-boundaries) defines these
boundaries from
[treeView.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L15-L64).
[fixture: treeview/directive-header-inside] [fixture:
treeview/directive-class-inside] [fixture:
treeview/directive-description-inside] [fixture:
treeview/directive-class-value-inside] [fixture:
treeview/directive-icon-value-inside] [fixture:
treeview/icon-pack-name-directive] [fixture: treeview/directive-bare-middle]
[fixture: treeview/directive-class-value-parts] [fixture:
treeview/directive-icon-parts-parts] [fixture:
treeview/icon-name-close-directive] [fixture:
treeview/box-branch-directive-parts] [fixture:
treeview/box-dash-directive-inside]

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

- The pinned
  [packet documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  shows single positions, ranges and relative counts; it does not define this
  preprocessing boundary. Searches of the official repository's issues and pull
  requests on 2026-10-25 used `packet bitsPerRow`, `packet fractional` and
  `packet maxPacketSize`. No inspected result establishes a maintainer ruling on
  this divergence.

- The pinned
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175)
  documents the header, declarations and edges, without defining this common
  preprocessing boundary. Searches of the official issues/PRs on 2026-10-25 used
  architecture group undefined, architecture quotes title, architecture reverse,
  architecture unclosed and architecture align.
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) was open with
  Status: Approved and concerns edges from outer parent groups, not a maintainer
  ruling on this common boundary.

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
  issues and pull requests on 2026-10-25 used `treemap directive`; no inspected
  result establishes a maintainer ruling on this divergence.
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
