# Compatibility with mermaid.js

Japanese version: [compatibility.ja.md](./compatibility.ja.md)

The plugin is checked against what the pinned mermaid.js recorded in the
conformance corpus. Formatting keeps what mermaid.js reads from a diagram, and
text that mermaid.js rejects is left unchanged. This document lists where that
does not hold, and why.

## Versions of mermaid.js that count

A formatted text is also drawn by versions of mermaid.js other than the pinned
one, so the forms that the formatter prints are checked against the versions
that count, defined by [How the printed form is decided](./printed-form.md): the
versions published in the 18 months before the pinned version was published; of
each major version, the smallest and the largest minor version among them, and
of a diagram type that was added in that time, the first minor version that has
it, each at its latest patch. The pinned version, 12.3.0, was published on
2026-11-03, so the period starts on 2025-05-03. The ten versions are these:

| Version | Published  | Why it counts                                                                            |
| ------- | ---------- | ---------------------------------------------------------------------------------------- |
| 10.9.8  | 2026-08-04 | the only minor version of 10 published in the period (10.9), at its last patch           |
| 11.7.0  | 2025-06-20 | the smallest minor version of 11 in the period                                           |
| 11.8.1  | 2025-07-07 | the first minor version with the treemap diagram (11.8)                                  |
| 11.13.0 | 2026-03-09 | the first with the Venn and the ishikawa diagrams                                        |
| 11.14.0 | 2026-04-01 | the first with the Wardley and the treeView diagrams                                     |
| 11.15.0 | 2026-05-11 | the first with the eventmodeling diagram                                                 |
| 11.16.1 | 2026-08-04 | the first minor version with the cynefin, railroad, and swimlane diagrams                |
| 11.17.2 | 2026-08-25 | the largest minor version of 11                                                          |
| 12.0.0  | 2026-09-10 | the smallest minor version of 12, and the first with the agentflow and use case diagrams |
| 12.3.0  | 2026-11-03 | the largest minor version of 12, the pinned version                                      |

The diagram types come from running a minimal text of each type in Chromium with
the bundle of every version published in the period that is the last patch of
its minor version (`mermaid.detectType` and a parse): treemap is first read by
11.8.0 and not by 11.7.0, ishikawa and Venn by 11.13.0, Wardley and treeView
(whose first grammar reads a name in quotes only) by 11.14.0, eventmodeling by
11.15.0, cynefin, railroad, and swimlane by 11.16.0, and agentflow and use case
by 12.0.0. The other versions of the period (11.9.0, 11.10.1, 11.11.0, 11.12.3,
12.1.0, and 12.2.0) are not checked, and a form that only they reject or draw
differently is printed.

The period is about the versions that users run. Of the downloads of mermaid
from npm in the week before 2026-11-12 (about 26.6 million, by version from
[`api.npmjs.org/versions/mermaid/last-week`](https://api.npmjs.org/versions/mermaid/last-week)),
the versions published in the last 12 months make 92.3%, those of the last 15
months 96.7%, those of the last 18 months 97.1%, and those of the last 24 months
98.0%: after 18 months the share grows by less than a point for each further
half year. When the pinned version is raised, the period and the list are
computed again from the publication date of the new pinned version, with the
versions of npm.

The three examples that [How the printed form is decided](./printed-form.md)
gives of a spelling kept as written because versions disagree hold for these
versions: `block` is rejected by 10.9.8, 11.7.0, and 11.8.1, which read
`block-beta` only; a label whose first word has a `@` is rejected by the
versions from 11.7.0 to 12.0.0 without the space after the `[` (see
[Whitespace at the start of a label](#whitespace-at-the-start-of-a-label)); and
`TB` and `TD` are drawn differently by 10.9.8, 11.7.0, and 11.8.1 in a flowchart
with a subgraph.

## Inputs read differently from mermaid.js

The parser that the plugin uses reads the same inputs as mermaid.js, with a few
deliberate differences, whose exact definitions are in the specification's
[Known divergences](../../spec/docs/known-divergences.md), and without the site
configuration.

### Directives and `;` inside a token

A directive (`%%{ ... }%%`) and a `;` that the line rule ignores (see
[Lines that hold a `;`](#lines-that-hold-a-)) are read as mermaid.js reads them:
they are removed, and the text on their two sides is joined. They may lie
between any two tokens, and inside a string, a backquoted name, and a text that
may contain whitespace: the text of a label, a class name, a participant id of a
sequence diagram. [fixture: flowchart/directives/touching-token] [fixture:
flowchart/directives/compat-directive-in-string] [fixture:
state/directives/compat-directive-in-string] [fixture:
class/directives/compat-directive-in-backquoted-name] [fixture:
flowchart/directives/compat-directive-in-label] [fixture: class/directives/kept]
[fixture: sequence/directives/compat-directive-in-participant-id] [fixture:
flowchart/semicolons/compat-ignored-semicolon-in-label] [fixture:
flowchart/semicolons/compat-ignored-semicolon-in-string] [fixture:
class/whitespace-between-tokens/compat-ignored-semicolon-in-backquoted-name]
[fixture: state/whitespace-between-tokens/compat-ignored-semicolon-in-string]
They may not lie inside a name without whitespace (the id of a flowchart or
state diagram), a number, a keyword, an arrow, or a delimiter such as `:::` or
`((`, although mermaid.js accepts that. Such input is reported as a syntax error
and left unchanged. [corpus fixture: flowchart/div-directive-in-id] [corpus
fixture: flowchart/div-directive-in-circle-opening] [corpus fixture:
flowchart/div-directive-inside-arrow] [corpus fixture:
sequence/div-directive-in-number] [corpus fixture:
sequence/div-directive-in-keyword] [corpus fixture:
flowchart/div-directive-in-subgraph-keyword] [corpus fixture:
class/div-directive-in-triple-colon] [corpus fixture: state/div-directive-in-id]
For example, mermaid.js reads `sub%%{init: {}}%%graph S` as the keyword
`subgraph`, and `A%%{init: {}}%%B-->C` as the node `AB`. Where the input is
accepted, the directive is printed as written with the text around it:
`A["a %%{init: {}}%% b"]` is a node with the label `a  b`. [fixture:
flowchart/directives/compat-directive-in-string]

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### Embedded data is not checked

The YAML inside the frontmatter, the content of a directive, and the opaque data
blocks written as `@{ ... }` in the diagram are not parsed. A diagram whose
embedded data is malformed, has the wrong shape, or names something unknown may
be accepted or rejected by mermaid.js, and is formatted here in either case.
mermaid.js accepts `%%{init:   {oops}}%%`, a data block of a participant that is
not JSON, and an unknown key of the configuration, and rejects an unknown node
shape in a data block and malformed YAML in the frontmatter. [fixture:
flowchart/directives/compat-malformed-directive-kept] [fixture:
flowchart/whitespace-between-tokens/compat-unknown-shape-data-block-kept]
[fixture: sequence/whitespace-between-tokens/compat-malformed-data-block-kept]
[fixture: flowchart/frontmatter-yaml/malformed-kept] [fixture:
flowchart/frontmatter-yaml/compat-unknown-config-formatted] [corpus fixture:
common/directive-bad-json] [corpus fixture: flowchart/div-data-unknown-shape]
[corpus fixture: flowchart/frontmatter-invalid-yaml]

Directives stay as written. A data block on one line in flowchart, agentflow,
kanban and sequence is printed with one space inside each end, and stays as
written where [Data blocks](./flowchart.md#data-blocks) says so. [fixture:
flowchart/data-blocks/one-line-padded] [fixture:
flowchart/data-blocks/one-line-space-only-padded] [fixture:
flowchart/data-blocks/one-line-touching-blocks-kept] [fixture:
flowchart/data-blocks/one-line-separate-blocks-padded] In flowchart, agentflow
and kanban, a data block on one line whose line is longer than `printWidth`
prints on lines, one entry on each, where every entry is a simple key and value:
only the whitespace, the line breaks and the `,` between its entries change, and
the characters of the keys and values stay. The conditions are in
[Data blocks](./flowchart.md#data-blocks). [fixture:
flowchart/data-blocks/long-split] Eligible multiline data blocks in flowchart,
agentflow, kanban and sequence, and usecase JSON tables, move their body lines
by one uniform number of ASCII spaces, preserving relative indentation and
trailing whitespace; a separate `}` aligns with its statement. Inline-opening
blocks, leading non-space whitespace, embedded directives, column-zero YAML
markers, kept lines, blocks after the statement's first line and `tabWidth: 0`
prevent movement; with `useTabs` the statement that holds the block is printed
as written instead. Sequence additionally requires a single text-bearing body
line because Mermaid trims the whole block. The conditions and their reasons are
in [Data blocks](./flowchart.md#data-blocks); other blocks keep their columns.
[fixture: flowchart/data-blocks/deep-nested-yaml] [fixture:
flowchart/data-blocks/scalar-blank-lines] [fixture:
sequence/multi-line-values/data-multiple-lines-kept] [fixture:
usecase/json-tables/tab-statement-space-body]

The frontmatter is formatted with Prettier's YAML formatter when Prettier can
read it as YAML, and kept as written otherwise (see
[Frontmatter](#frontmatter)). [fixture: flowchart/frontmatter-yaml/formatted]
[fixture: flowchart/frontmatter-yaml/malformed-kept]

### HTML tags that start in the frontmatter

mermaid.js rewrites `="..."` inside HTML tags over the whole text, frontmatter
included, before it removes the frontmatter. A tag that starts in the
frontmatter can therefore change how a `"` of the diagram is read. The plugin
does not look for tags in the frontmatter.

For example, mermaid.js accepts a flowchart whose frontmatter has `title: <a`
and whose node is `A[b="c">d]`, with the label `b='c'>d`. The plugin reports it
as a syntax error and leaves it unchanged. [corpus fixture:
flowchart/html-tag-starts-in-frontmatter]

### `click` only starts a click statement

In flowchart, `click` is a reserved word: the word `click` followed by
whitespace may only start a click statement (the specification's
[`click-reserved-word`](../../spec/docs/known-divergences/click-reserved-word.md)).
mermaid.js enters its click context wherever it reads that word, and accepts
some inputs that have it elsewhere, often drawing something other than what was
written. For example, mermaid.js reads `A-->B click ""` as the edge from A to B,
reading past the `click` and the empty string, and gives the subgraph of
`subgraph Handle click events`, `A`, and `end` the title `Handle eventsA` and no
members. The plugin reports such input as a syntax error and leaves it
unchanged. [corpus fixture: flowchart/gram-click-bare-after-vertex] [corpus
fixture: flowchart/db-subgraph-name-click-word]

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### Empty forms between tokens

In flowchart, an empty string (`""`), an empty call (`call ()`), and an empty
description block (`accDescr {}`) inside a statement hold nothing, and they can
lie between any two tokens, where the tree has no place for them (the
specification's
[`tokenless-empty-forms`](../../spec/docs/known-divergences/tokenless-empty-forms.md)).
mermaid.js accepts them in many such places, as if they were not there:
`A-->|x""|B` is the edge from A to B with the label `x`, and `A call ()-->B` and
`A accDescr {}-->B` are accepted too. The plugin reports such input as a syntax
error and leaves it unchanged. [corpus fixture:
flowchart/div-edge-label-empty-quoted-pair] [corpus fixture:
flowchart/gram-empty-call-before-link] [corpus fixture:
flowchart/gram-empty-description-block-before-link] An empty description block
is not reported where the tree has a place for it, where a statement starts or
before the separator that ends a statement: as on a line of its own, or after
another statement on its line (`A accDescr {}` is the vertex A and an empty
description block), it is a description block statement. An ordinary closed
block without text or trivia prints an empty interior `{}`, including when it
contained a line break. A touching keyword stays touching, as `accDescr{}`.
Every diagram with description-block syntax uses this form for whitespace-only
interiors, including tabs and Unicode whitespace: there is no text for interior
whitespace to surround. Blocks containing comments or directives retain their
contents and required line breaks; ordinary indentation follows
[Description block indentation](#description-block-indentation) and each
diagram's structural rules. Protections for the surrounding line still apply.
[test: sequence Unicode and tab interiors] [test: class Unicode and tab
interiors] [test: state Unicode and tab interiors] [test: block Unicode and tab
interiors] [test: c4 Unicode and tab interiors] [fixture:
flowchart/accessibility-lines/empty-block-touching-keyword] Under
[Accessibility lines](./flowchart.md#accessibility-lines), there is no text for
an interior space to surround, so follow the sibling usecase form among Db-equal
forms. [fixture:
flowchart/statements-one-per-line/compat-empty-description-block-before-statement]
[fixture:
flowchart/statements-one-per-line/compat-empty-description-block-after-statement]
[fixture:
flowchart/statements-one-per-line/compat-empty-description-block-before-separator]
[fixture:
flowchart/whitespace-between-tokens/compat-empty-description-block-own-line]
[fixture:
flowchart/multi-line-values/compat-empty-description-block-line-break-kept]

In a class diagram, the same holds for an empty string where the grammar takes
none, an empty backquoted name, an empty generic type that does not end a class
name, an empty call, and an empty description block inside a statement:
`"" A --> B`, `class A``B`, and `class A~~B` are reported as syntax errors.
[corpus fixture: class/div-empty-string-statement-start] [corpus fixture:
class/div-empty-backquoted-in-name] [corpus fixture:
class/div-empty-generic-in-name] [corpus fixture: class/div-empty-call] [corpus
fixture: class/div-empty-description-block-after-annotation] An empty
description block that shares its line with another statement or with the header
is a statement, as in mermaid.js (see
[Empty description blocks](./class.md#empty-description-blocks)). [fixture:
class/empty-description-blocks/kept-with-statement] [fixture:
class/empty-description-blocks/after-statement] In a state diagram, an empty
description block inside a statement, as in `A accDescr {} --> B`, is reported
as a syntax error, while an empty string after `state`, which mermaid.js reads
as nothing, is text that it does not read and is kept as written. [fixture:
state/statements-one-per-line/state-names-kept] [corpus fixture:
state/div-empty-description-block-in-transition] [corpus fixture:
state/gram-state-empty-string-after-name]

In a sequence diagram, which has no strings and no `call`, an empty description
block inside a statement, as in `A->> accDescr {}+B: x` and
`create accDescr {}participant A`, is reported as a syntax error. [corpus
fixture: sequence/div-empty-description-block-before-activation] [corpus
fixture: sequence/div-empty-description-block-after-create] An empty description
block where the tree has a place for it is a statement, as in the other
diagrams. [fixture:
sequence/statements-one-per-line/empty-description-block-moves-next-statement]

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### A comment right after a character

In a sequence diagram, a comment starts at its `%%`, and the character before
the `%%` belongs to what comes before it (the specification's
[`comment-takes-character`](../../spec/docs/known-divergences/comment-takes-character.md)).
mermaid.js reads that character as part of the comment in some places: it reads
`autonumber 5%% c` without the number 5, rejects `A->>B:%% c`, which is the
message `%% c` here, and accepts a line `C%% c`, which is rejected here. [corpus
fixture: sequence/div-comment-after-number-across-directive] [corpus fixture:
sequence/div-comment-after-text-colon] [corpus fixture:
sequence/div-comment-after-one-character-id] The plugin keeps whether whitespace
is written before the mark of a comment, so that mermaid.js reads
`autonumber 5%% c` as before. [fixture:
sequence/comments/compat-comment-touching-number-kept] [fixture:
sequence/comments/compat-comment-after-number-spaced-kept] It prints
`A->>B:%% c` as `A ->> B: %% c`, which mermaid.js reads as this specification
does. [fixture: sequence/comments/compat-comment-after-colon] It reports what
this specification rejects as a syntax error and leaves it unchanged. [corpus
fixture: sequence/div-comment-after-one-character-id]

This difference goes both ways.

### A comment that takes the line breaks after it

In a class diagram, a comment after a statement ends at the end of its line (the
specification's
[`comment-takes-line-break`](../../spec/docs/known-divergences/comment-takes-line-break.md)).
mermaid.js reads the line breaks after it as part of the comment, up to a line
of only whitespace, and the next line as part of the same statement: it rejects
`A --> B %% c` followed by a line `class C`, which is two statements here, and
reads `A --> B %% c` followed by a line `A : +int age` as a relation from A to
`BA`. The plugin keeps comments where they are, and keeps a line of only
whitespace after such a comment (see
[A line of only whitespace after a comment](#a-line-of-only-whitespace-after-a-comment)),
so that mermaid.js reads the formatted text as it read the input. [fixture:
class/comments/compat-comment-then-class] [fixture:
class/comments/compat-comment-then-member] [fixture:
class/comments/compat-comment-then-empty-lines] [fixture:
class/comments/whitespace-line-kept] [corpus fixture:
class/div-comment-then-statement] [corpus fixture:
class/div-comment-splits-relation]

This difference goes both ways.

### A text that starts with `classDiagram` and a word character

A text whose first word is `classDiagram` followed by an ASCII word character,
such as `classDiagramX`, has no header and is rejected here (the specification's
[`headerless-empty-ending`](../../spec/docs/known-divergences/headerless-empty-ending.md)).
mermaid.js accepts it when the text ends with an empty title, description, or
call, or a string opened at the end of a click statement. The plugin reports it
as a syntax error and leaves it unchanged. [corpus fixture:
class/div-headerless-empty-string] [corpus fixture:
class/div-headerless-empty-title] [corpus fixture:
class/div-headerless-empty-call]

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### The start of a backquoted name or a generic type

In a class diagram, a backquoted name or the text of a generic type may start
with `"`, `~`, `<<`, `>>`, or a keyword such as `note` (the specification's
[`name-start-reads-unit`](../../spec/docs/known-divergences/name-start-reads-unit.md)).
mermaid.js reads that unit instead of the name: it rejects ``class `note` ``,
which declares the class `note` here, and reads ``A `"1"` --> B`` with the
cardinality `1`, where this is a relation from `A"1"`. The plugin keeps
backquoted names and generic types as written. [fixture:
class/whitespace-between-tokens/compat-backquoted-name-start-reads-unit]
[fixture: class/generic-types/compat-start-reads-unit] [corpus fixture:
class/div-backquote-starts-with-keyword] [corpus fixture:
class/div-generic-starts-with-keyword]

This difference goes both ways.

### Site configuration

The parser does not know the site configuration that a page passes to
mermaid.js. A flowchart with more edges than the `maxEdges` setting allows, 500
by default, is rejected by mermaid.js, but the parser accepts it, and the plugin
formats it. [fixture: flowchart/chains/compat-more-edges-than-max-edges] [corpus
fixture: flowchart/config-max-edges-exceeded]

## Words read with the line break after them

After the words `accTitle`, `accDescr`, `direction`, `click`, `call`, and
`href`, mermaid.js reads the whitespace that follows, line breaks included, with
the word (the specification's
[The statement context](../../spec/docs/diagrams/flowchart.md#the-statement-context)
and
[Click and callbacks](../../spec/docs/diagrams/flowchart.md#click-and-callbacks)).
A `;` after such a word separates two statements, and a line break in its place
would not: `accTitle ; :` is the vertices `accTitle` and `:`, while `accTitle`
and `:` on two lines is an accessibility title. So when a statement ends with
one of these ids, or with an id that ends with `direction` (a direction line
takes `direction` after any run of characters), and a `;` separates it from the
next one, the statements stay on the line and the `;` stays in place; the
whitespace within the statements is formatted as usual. [fixture:
flowchart/statements-one-per-line/semicolon-after-word-kept] [fixture:
flowchart/statements-one-per-line/semicolon-after-link-to-word-kept] [corpus
fixture: flowchart/lex-acc-title-semicolon-before-colon] [corpus fixture:
flowchart/lex-direction-line-semicolon-before-value] [corpus fixture:
flowchart/lex-call-keyword-semicolon] See
[Statements one per line](./flowchart.md#statements-one-per-line).

Whether the printer drops the `;` that ends such a line decides which `;` the
rule ignores in the printed line, so the printer asks one question for both the
printing of the `;` and the whitespace between the `:` and the `#`, which it
keeps as touching or as one space. Where a `;` separates statements (a
flowchart, a sequence diagram, a quadrant chart, an XY chart), the ignored `;`
at the end of the line is dropped, and the whitespace of the line before it is
formatted as usual. Where it does not, a line-ending `;` of `classDef` or
`style` is also dropped in class, state, ER, requirement, block, Venn and
usecase diagrams when the line rule ignores it; style spacing then follows the
ordinary rules. Other semicolons keep their protected lines and gaps. [fixture:
flowchart/semicolons/style-line-dropped-semicolon-formats-the-gap] [fixture:
xychart/statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture:
quadrant/statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture:
class/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-touching-kept]
[fixture:
class/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-becomes-one-space]
[fixture:
state/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-touching-kept]
[fixture:
state/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-becomes-one-space]
[fixture:
block/multi-line-statements/line-rule-semicolon-after-touching-arrow-kept]
[fixture: block/multi-line-statements/line-rule-semicolon-after-an-id-kept]
[fixture: block/multi-line-statements/semicolon-after-spaced-arrow-is-an-id]

## Whitespace at the end of a style

Whitespace at the end of a `style`, `classDef`, or `linkStyle` statement is
removed. [fixture: flowchart/style-trailing-whitespace/removed] mermaid.js keeps
it at the end of the last style, so this changes what mermaid.js stores,
separately from the permitted eventmodeling body margins in
[Data blocks](./eventmodeling.md#data-blocks). The tests compare styles without
their trailing whitespace.

The whitespace is kept where removing it would make mermaid.js reject the
statement: after a `,` at the end of the list, as in `style A fill:#f00, `.
[fixture: flowchart/style-trailing-whitespace/whitespace-only-value-kept]
[corpus fixture: flowchart/db-style-whitespace-only-value] See
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace).

## Styles that are drawn the same

A `style`, `classDef`, or `linkStyle` statement prints its styles in one form in
flowchart, agentflow, class, state, block, and usecase diagrams, as it does in
ER and requirement diagrams: no whitespace before the first `:` of a style, one
space after it where the value is not empty, no whitespace before the `,`
between two styles, and one space after it. `style A fill :#f00,stroke:  #333`
is printed `style A fill: #f00, stroke: #333`. A run of spaces and tabs between
the words of a style is printed as one space (see below). [fixture:
flowchart/whitespace-between-tokens/style-colon-spaced] [fixture:
flowchart/whitespace-between-tokens/style-colon-empty-value-kept] [fixture:
agentflow/single-space-gaps/style-colon-spaced] [fixture:
class/whitespace-between-tokens/style-colon-spaced] [fixture:
state/whitespace-between-tokens/style-colon-spaced] [fixture:
block/styles/style-colon-spaced] [fixture:
usecase/classes-and-styles/css-colon-padding]

mermaid.js keeps this whitespace in the Db, so the Db of the printed text
differs from the Db of the written text, but it draws the same figure.
[`styles2Map`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L44-L51)
takes the whitespace around the name and the value of a style away before it
makes the CSS of a shape, and the shapes of class diagrams and the links of
flowcharts put the styles into the CSS `style` attribute, in which the
whitespace around `:` and `;` is not read, except after a backslash that ends a
style (see below). Both texts of each kind of statement were drawn with
mermaid.js 12.3.0 in Chromium, and the pixels were the same, and so was the SVG,
without the generated ids and without that whitespace: for `style` and
`classDef` in the five diagram types, and for the styles of a `linkStyle`, with
link numbers or `default`, except for the cases below.

A usecase diagram makes its figure the same way. The styles of an actor, a use
case, a boundary, and a JSON table reach their shape as `cssStyles`
([`usecaseDb`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L354-L355)),
and the shapes make their CSS from them and from the styles of their classes
with `styles2String`, which takes the whitespace around the name and the value
of a style away through `styles2Map`
([`usecaseEllipse`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/usecaseEllipse.ts#L14),
[`usecaseActor`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/usecaseActor.ts#L160),
[`usecaseJsonTable`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/usecaseJsonTable.ts#L62-L63)).
The styles of a class are trimmed first
([`getCompiledStyles`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L118-L135)).
The styles of a relationship go to its edge as `style`
([`usecaseDb`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L472-L473)),
which puts them into the `style` attribute of its path. Both texts of
`style A stroke:#d33,fill:#fee` and `style A   stroke  :  #d33 ,  fill : #fee`
on an actor, and likewise on a use case, a boundary, and a JSON table, and of
`classDef c stroke:#d33,fill:#fee` and `classDef c stroke: #d33, fill  :  #fee`
put on an actor, were drawn with mermaid.js 12.3.0 in Chromium, and the SVG was
the same. For a relationship (`style e1 stroke-width:3px,fill:none` and
`style e1 stroke-width: 3px, fill  :  none`, and a `classDef` put on it) the
pixels were the same, and so was the SVG without the whitespace around `:` and
`;` in the `style` attribute of its path.

A `classDef` in a treemap drops the whitespace at the end of its styles:
`classDef zz color:red  ` is printed `classDef zz color:red`. mermaid.js keeps
it in the Db and draws the same figure: the pixels were the same with the class
put on a node. [fixture: treemap/styles/trailing-before-semicolon] [fixture:
treemap/trailing-whitespace/style-content]

A `linkStyle` with link numbers is drawn differently where a style after a `,`
starts with whitespace.
[`updateLink`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L417-L440)
adds `fill:none` to the styles of a link when none of them starts with `fill`,
and a style with a space before it does not. In
`linkStyle 0 stroke:#f00,fill:red` the link is filled with red; in
`linkStyle 0 stroke:#f00, fill:red` mermaid.js adds `fill:none`, and it is not.
So in flowchart and agentflow a style that starts with `fill`, `fill-opacity`
included, keeps whether whitespace stands before it, a run of whitespace
becoming one space. [fixture:
flowchart/whitespace-between-tokens/link-style-fill-after-comma-kept] [fixture:
flowchart/whitespace-between-tokens/link-style-fill-opacity-after-comma-kept]
[fixture: agentflow/single-space-gaps/link-style-fill-after-comma-kept]
[fixture: agentflow/single-space-gaps/link-style-fill-opacity-after-comma-kept]
The other styles of such a statement, and the styles of `linkStyle default`, are
printed in the one form, except for a style that starts with `stroke:` (see
below). [fixture:
flowchart/whitespace-between-tokens/link-style-other-after-comma-spaced]
[fixture:
flowchart/whitespace-between-tokens/link-style-default-after-comma-spaced]

A style of a link is read for `stroke:`.
[`insertEdge`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L956-L957)
looks for `stroke:` in the styles of a link, and
[`addEdgeMarker`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edgeMarker.ts#L105-L127)
makes the arrowheads of that colour; `stroke :` is no match. In
`linkStyle 0 stroke :#f00` the line is red and the arrowhead keeps its theme
colour, and in `linkStyle 0 stroke: #f00` both are red, so the pixels differ,
with the same result for `linkStyle default` and for a `classDef` that is put on
a link. So in flowchart and agentflow, in a `linkStyle` and in a `classDef`, a
name that ends with `stroke` keeps whether whitespace stands between it and the
`:`, a run of whitespace becoming one space: `linkStyle 0 stroke  :#f00` is
printed `linkStyle 0 stroke : #f00`. A `style` styles a node, and is printed in
the one form: the pixels of `style A stroke :#f00` and `style A stroke: #f00`
were the same. [fixture:
flowchart/whitespace-between-tokens/link-style-stroke-before-colon-kept]
[fixture:
flowchart/whitespace-between-tokens/class-def-stroke-before-colon-kept]
[fixture: flowchart/whitespace-between-tokens/style-stroke-before-colon-spaced]
[fixture: agentflow/single-space-gaps/link-style-stroke-before-colon-kept]

In a usecase diagram a `style` and a `classDef` can reach a relationship that
has an explicit id, so both keep it. The arrowheads of `A e1@--> B` with
`classDef c stroke:#d33` put on `e1` are red, and with `classDef c stroke :#d33`
they keep their theme colour, and so it is for `style e1 stroke :#d33`; the
pixels differ. A name that ends with `stroke` keeps whether whitespace stands
between it and the `:`, a run of whitespace becoming one space, in a `style`
too: `style A stroke  :#d33` is printed `style A stroke : #d33`, while
`style A stroke:#d33` is printed `style A stroke: #d33`. [fixture:
usecase/classes-and-styles/css-stroke-before-colon-kept] [fixture:
usecase/classes-and-styles/css-stroke-before-colon-run-collapsed] [fixture:
usecase/classes-and-styles/css-stroke-before-colon-touching]

Where the look is `handDrawn`, the start of a style of a link is read too.
[`insertEdge`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L899)
takes the first style of the link that starts with `stroke:` whole as the colour
of the arrowheads and does not look further, and a style with whitespace before
it does not start with `stroke:`. The pixels of
`linkStyle 0 fill:none,stroke:#f00` and `linkStyle 0 fill:none, stroke:#f00`
with that look were the same, and the SVG of the first held one more definition
of an arrowhead, of the colour `stroke:#f00`. So in flowchart and agentflow a
style of a `linkStyle` with link numbers or `default` that starts with `stroke:`
keeps whether whitespace stands before it, as a style that starts with `fill`
does, a run of whitespace becoming one space. [fixture:
flowchart/whitespace-between-tokens/link-style-stroke-after-comma-kept]
[fixture: agentflow/single-space-gaps/link-style-stroke-after-comma-kept]

A `stroke:` whose value is whitespace only is read too. mermaid.js takes the
colour from the characters after the first `stroke:` up to a `;`, and draws no
colour where they are whitespace only, without trying the next `stroke:`. In
`linkStyle 0 stroke: ,stroke:#f00` the arrowheads keep their theme colour, and
in `linkStyle 0 stroke:, stroke: #f00` they are red, so the pixels differ. So a
style of a `linkStyle` with a name that ends with `stroke` and a value of spaces
and tabs only stays as written, with its whitespace, also at the end of the
statement, where the whitespace at the end of a style statement is dropped
otherwise (see
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace)). A style
after it that starts with `stroke:` follows the rule above for such a style:
`linkStyle 0 stroke: ,stroke:#f00` is printed
`linkStyle 0 stroke: ,stroke: #f00`. A `classDef` is not affected: the pixels of
`classDef c stroke: ,stroke:#f00` put on a link and of
`classDef c stroke:, stroke: #f00` were the same. [fixture:
flowchart/whitespace-between-tokens/link-style-blank-stroke-value-kept]
[fixture:
flowchart/style-trailing-whitespace/link-style-blank-stroke-value-at-end-kept]
[fixture: agentflow/single-space-gaps/link-style-blank-stroke-value-kept]

A backslash escapes a `,` in the `classDef` of flowchart and agentflow:
`classDef c fill:a\,b` is the style `fill:a,b`. A space between the backslash
and the `,` therefore stays: without it, the `,` would be part of the style
instead of ending it. In a `style` and a `linkStyle` of these diagram types, and
in the other diagram types, the `,` always ends a style, and a backslash before
it does not escape it: `style A fill:#f00\,stroke:#00f` has the two styles
`fill:#f00\` and `stroke:#00f`. A space after a backslash before the `:` stays
in all of them, since taking it away would escape the `:`, and the whitespace
after that space goes. [fixture:
flowchart/whitespace-between-tokens/style-colon-escaped-space-run-dropped]
[fixture: flowchart/whitespace-between-tokens/style-escaped-space-before-comma]
[fixture: flowchart/whitespace-between-tokens/style-backslash-before-comma]
[fixture: agentflow/single-space-gaps/style-escaped-space-before-comma]
[fixture: agentflow/single-space-gaps/style-backslash-before-comma] [fixture:
block/styles/style-backslash-before-comma] [fixture:
class/whitespace-between-tokens/style-backslash-before-comma] [fixture:
state/whitespace-between-tokens/style-backslash-before-comma]

The whitespace after a backslash at the end of a style is read where mermaid.js
joins the styles as they are, without taking their whitespace away.
[`insertEdge`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L936-L954)
joins the styles of a link with `;` into the CSS text of its path,
[`getStylesFromArray`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L443-L459)
does so for the `style` of a node of a block diagram, which the shapes of a
block arrow
([`blockArrow`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/blockArrow.ts#L217))
and of a group
([`composite`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/composite.ts#L29))
put into their `style` attribute, and
[`classBox`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/classBox.ts#L36)
does so for the `style` of a class, which it puts into the `style` attribute of
its parts, and for a `classDef` that stands after the class it is put on, since
[`defineClass`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/class/classDb.ts#L363-L367)
then adds its styles to those of the class as they are. A backslash at the end
of a style escapes the `;` after it, and the styles after it are lost. In
`linkStyle 0 stroke-width:4px\ ,stroke:#0f0` the line is green, and in
`linkStyle 0 stroke-width: 4px\,stroke: #0f0` it is black, so the pixels differ,
with the same result for `linkStyle default`, in agentflow, for a block arrow
and a group of a block diagram, and for `style A fill:abc\ ,stroke:green` on a
class, whose border is green or not. So a style of a `linkStyle`, with link
numbers or `default`, and of a `style` of a block diagram, and of a `style` and
a `classDef` of a class diagram, that ends with a backslash keeps whether
whitespace stands after it, a run of whitespace becoming its first character,
also at the end of the statement, where the whitespace at the end of a style
statement is dropped otherwise (see
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace)). Two
backslashes at the end escape each other, and the pixels of
`linkStyle 0 stroke-width:4px\\ ,stroke:#0f0` and of the same without the space
were the same, so the whitespace after them is dropped. The other styles are not
affected: the `classDef` of the other diagram types, the `style` of a node of a
flowchart, an agentflow, and a state diagram, and of the other shapes of a block
diagram, since mermaid.js takes the whitespace at the ends of their styles away
before it uses them
([`getCompiledStyles`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1156-L1168),
[`styles2Map`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L44-L51)),
and the pixels of both spellings were the same. A `classDef` of a class diagram
that stands before the class it is put on is trimmed too, and the pixels were
the same, but the formatter keeps it as written either way, since only the order
of the statements tells the two apart. ER, requirement, and treemap diagrams
reject a backslash in a style. [fixture:
flowchart/whitespace-between-tokens/link-style-backslash-space-kept] [fixture:
agentflow/single-space-gaps/link-style-backslash-space-kept] [fixture:
flowchart/style-trailing-whitespace/link-style-backslash-at-end-kept] [fixture:
agentflow/trailing-whitespace/link-style-backslash-at-end-kept] [fixture:
block/styles/style-backslash-space-kept] [fixture:
block/styles/style-backslash-at-end-kept] [fixture:
class/whitespace-between-tokens/style-backslash-space-kept] [fixture:
class/whitespace-between-tokens/style-backslash-at-end-kept] [fixture:
flowchart/whitespace-between-tokens/style-backslash-space-dropped] [fixture:
agentflow/single-space-gaps/style-backslash-space-dropped] [fixture:
state/whitespace-between-tokens/style-backslash-space-dropped] [fixture:
block/styles/class-def-backslash-space-dropped] [fixture:
class/whitespace-between-tokens/class-def-backslash-space-kept] [fixture:
class/whitespace-between-tokens/class-def-backslash-at-end-kept]

The start of a style of a node of a block diagram is read too.
[`getStylesFromArray`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L443-L459)
puts a style that starts with `color:` or `text-align:` in the style of the
label of the node and every other style in the style of its shape, and the shape
of a block arrow
([`blockArrow`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/blockArrow.ts#L205))
takes the style of its label as it is. A style that starts with whitespace, or
has whitespace between `color` and the `:`, does not start so. In
`style K fill:#ff0,color:red` the label of the block arrow is red, and in
`style K fill: #ff0, color: red` it is black, so the pixels differ, with the
same result for `style K color :red` and `style L fill:#ff0,text-align:left` on
a block arrow with a label of two lines. So in a `style` of a block diagram a
style that starts with `color:` or `text-align:` keeps whether whitespace stands
before it, and a name `color` or `text-align` keeps whether whitespace stands
between it and the `:`, a run of whitespace becoming one space. The other shapes
of a block diagram make the style of their label again from their styles with
`styles2String`, which takes the whitespace away, and the pixels of both
spellings were the same for them and for a `classDef`. [fixture:
block/styles/style-label-styles-kept]

A run of spaces and tabs between the words of a style is printed as one space in
flowchart, agentflow, class, state, block, usecase, treemap, ER, and requirement
diagrams, in a style with a `:` and in one without, and whether whitespace
stands between two words stays as written: `style A fill   #f00` is printed
`style A fill #f00`, and `style A fill#f00` stays. CSS reads a run as one
whitespace, so the figure is the same, except where the run is a character of
the value, and there it stays as written: inside a string (`"…"` or `'…'`),
inside a comment (`/* … */`), inside the parentheses of `url(`, and the escape
after a backslash, which CSS reads as part of the value: the hexadecimal digits
(at most six) and the one space or tab that follows them, or else the next
character, so that `a\   b` is printed `a\  b`, and `Arial\20   Black` is
printed `Arial\20  Black`. A string, a comment, or `url(` that is not closed
runs to the end of the style. [fixture:
flowchart/whitespace-between-tokens/style-string-runs-kept] [fixture:
flowchart/whitespace-between-tokens/style-backslash-run-spaced] [fixture:
flowchart/whitespace-between-tokens/style-hex-escape-run-spaced] [fixture:
flowchart/whitespace-between-tokens/style-hex-escape-tab-run-spaced] [fixture:
flowchart/whitespace-between-tokens/style-hex-escape-seven-digits-run-spaced]
[fixture: state/whitespace-between-tokens/style-hex-escape-run-spaced] [fixture:
agentflow/single-space-gaps/style-hex-escape-run-spaced] [fixture:
block/styles/style-hex-escape-run-spaced] [fixture:
state/whitespace-between-tokens/style-string-runs-kept] [fixture:
state/whitespace-between-tokens/style-url-runs-kept] [fixture:
state/whitespace-between-tokens/style-comment-runs-kept] [fixture:
block/styles/style-string-runs-kept] [fixture: block/styles/style-url-runs-kept]
[fixture: usecase/classes-and-styles/css-string-runs-kept] [fixture:
usecase/classes-and-styles/css-url-runs-kept] [fixture:
class/whitespace-between-tokens/style-url-runs-kept] [fixture:
class/whitespace-between-tokens/style-comment-runs-kept]

mermaid.js joins the words of a style that has no `:` in a class diagram, and
the native style units of ER and requirement diagrams in every style, so the Db
does not change there: `stroke-dasharray: 5   5` and `stroke-dasharray: 5 5` are
both read as `stroke-dasharray:55` in an ER or a requirement diagram. The other
diagram types, and the styles with a `:` of a class diagram, keep the runs in
the Db, as they keep the whitespace around the `:`, and draw the same figure.
Both texts of each of these were drawn with mermaid.js 12.3.0 in Chromium, with
the runs as written and printed as one space, and the pixels were the same, and
so was the SVG, without the generated ids and without the runs in its `style`
and `fill` attributes: in a class diagram `style A border:2px   solid   red`,
`style A font:20px   serif`, `style A fill:#f00   stroke:blue`,
`style A fill:#f00,   x   y`, and `style A border:2px solid red` written with
tabs between its words, and a `classDef` put on a class; in a flowchart and in
an agentflow diagram a `style`, a `classDef`, and a `linkStyle` with words, with
and without a `:`; in a state and in a block diagram a `style` and a `classDef`
with the same values, a string, a comment, and `url(` beside the runs; and in a
usecase diagram a `style` and a `classDef` with the same values; and in a
treemap a `classDef` with the whitespace around the `:` and the `,`, runs
between words, a string, an escaped `,`, and whitespace at its end. Beyond
these, the statements of the corpus and of the fixtures of this package whose
styles change by formatting were drawn the same way: 1,355 texts hold a `style`,
a `classDef`, or a `linkStyle`; of the 769 of them whose Db changes, 754 have
the same pixels, 10 cannot be drawn before or after (mermaid.js stops with an
error), and 5 are use case diagrams with an animated link, whose pixels differ
by the frame of the animation and whose SVG is the same without the whitespace
in the `style` attribute. The `classDef` statements of a treemap in the corpus,
in the fixtures of this package, and in the documents of mermaid.js whose styles
change by formatting were drawn the same way: of the 78 texts, all have the same
pixels, and the SVG is the same without the whitespace in the `style` attribute.
mermaid.js keeps the text of each style of a treemap in the Db, and before it
draws it takes the text before the first `:` as the name and the text up to the
next `:` as the value, with the whitespace around each taken away. A hexadecimal
escape was drawn too, with a font name that the escape decides: in a flowchart,
a state, a block, an agentflow, and a swimlane diagram
`style A font-family:\41   rial,font-size:30px` and the printed
`font-family: \41  rial, font-size: 30px` have the same pixels, while the
`\41 rial` that collapsing the whole run after the escape would print draws
another figure. A style that starts with the `:` was drawn as written and as
printed in these diagram types and in a class, an ER, and a requirement diagram,
and so was one whose `:` follows a backslash and a space, in the diagram types
that accept a backslash in a style (flowchart, agentflow, swimlane, state, and
block): `style A :  red   x` and `style A : red x`, and
`style A fill\   :red   x` and `style A fill\ : red x`, have the same pixels.
[fixture: treemap/styles/spaced] [fixture: treemap/styles/escaped-comma-spaced]
[fixture: class/whitespace-between-tokens/style-value-words-spaced] [fixture:
class/whitespace-between-tokens/style-words-run-spaced] [fixture:
flowchart/whitespace-between-tokens/style-words-run-spaced] [fixture:
agentflow/single-space-gaps/style-words-run-spaced] [fixture:
state/whitespace-between-tokens/style-words-run-spaced] [fixture:
block/styles/style-words-run-spaced] [fixture:
usecase/classes-and-styles/css-words-run-spaced] [fixture:
er/styles-and-classes/style-words-run-spaced] [fixture:
requirement/styles-and-classes/style-words-run-spaced] [fixture:
class/whitespace-between-tokens/style-words-directive-kept] [fixture:
flowchart/whitespace-between-tokens/style-words-directive-kept]

A statement stays as written where a style holds a line break or a U+2028 or
U+2029, where the statement holds a comment or a directive, where a style is all
whitespace, and where its line holds a `;` of its own (see
[Lines that hold a `;`](#lines-that-hold-a-)). [fixture:
flowchart/whitespace-between-tokens/style-blank-style-kept] [fixture:
flowchart/whitespace-between-tokens/style-colon-escaped-space-kept] [fixture:
flowchart/whitespace-between-tokens/style-comma-beside-directive-kept] [fixture:
flowchart/whitespace-between-tokens/style-comma-with-kept-semicolon-kept]

The tests compare the Db of the printed text with the margins of its styles
restored from the Db of the written text (`styleDbForFormattingComparison` in
`tests/style-margins.ts`): a style that differs from the written one only by the
whitespace at its ends and around its first `:`, and in the diagram types above
by the runs between its words outside strings, comments, `url(`, and the escape
after a backslash, takes the written text, and any other difference, among them
the presence of whitespace between two words of a style, a changed run inside a
string, a comment, or `url(`, the number of styles of a link, the presence of
whitespace before the `:` of a `stroke` in a style that can reach a link, the
presence of whitespace before a style of a link that starts with `stroke:`, and
the presence of whitespace in the value of a `stroke` of a link that is
whitespace only, the presence of whitespace after a backslash that ends a style
that mermaid.js joins as it is, and the presence of whitespace before a style of
a block that starts with `color:` or `text-align:`, or between such a name and
the `:`, fails. When the pinned mermaid.js is updated, draw the statements of
each of these kinds again and compare the SVG and the pixels before the
exception stays.

## Texts after a keyword that are drawn the same

A title, and the date format and the axis format of a Gantt chart, are printed
with one space after their keyword and without the whitespace at the start or at
the end of their text, in Gantt, user journey, timeline, sequence, Venn, and C4
diagrams (the description `accDescription` of a C4 diagram too):
`title   Plan  ` is printed `title Plan`, and `dateFormat   YYYY-MM-DD` is
printed `dateFormat YYYY-MM-DD`. The whitespace inside the text stays as
written, and so does a text of spaces and tabs only. The last event of a line of
a timeline and the second description of a state with an alias lose the
whitespace at their end in the same way, not the whitespace at their start,
which aligns the colons of a timeline: `2020 : e   ` is printed `2020 : e`, and
`state "d" as A : x   ` is printed `state "d" as A : x`. A period of a timeline,
and an event that another colon follows, gain one space at their end where they
end without whitespace, which stands before that colon: `2004: a: b` is printed
`2004 : a : b`, except after the word `title` or `section` as the period, where
a space would make the line a title or a section. Where a comment follows the
text on its line, one space separates it from the text. Where directives do,
each keeps whether whitespace precedes it, a run becoming one space, and the
whitespace after the last one is dropped like any whitespace at the end of the
line, so the line is printed alike whether or not whitespace follows its last
directive, as a directive at the end of a line is in the other diagrams (see
[Directives](./flowchart.md#directives)): `title T  %%{x}%%  %%{y}%%` and
`title T  %%{x}%%  %%{y}%%  ` are both printed `title T %%{x}%% %%{y}%%`,
`title T%%{x}%%%%{y}%%  ` is printed `title T%%{x}%%%%{y}%%`, and
`state "d" as A : x  %%{x}%%  ` is printed `state "d" as A : x %%{x}%%`.
mermaid.js removes the directives before it reads the text, so the whitespace
around them is whitespace at the end of the text, which it draws the same
whatever it is. This holds for the title of a Gantt chart, a user journey, a
timeline, a sequence diagram, a Venn diagram, a C4 diagram, a pie chart, a radar
chart, a packet diagram, an architecture diagram, a gitGraph, a cynefin diagram,
a treemap, a Wardley map, a treeView, an info diagram, and a railroad diagram,
for the `accTitle:` and `accDescr:` lines of those diagram types and of a
usecase diagram, for the text of a node of an ishikawa diagram, a mindmap, and a
treeView, and of a card of a kanban board (not the id of a column, which the
figure depends on), for the date format and the axis format of a Gantt chart,
for the `accDescription` of a C4 diagram, for the last event of a line of a
timeline and the space that a period and an event before a colon gain, and for
the second description of a state alias. The runs of spaces and tabs inside a
date format, an axis format, or the value of an `accTitle:` line stay as written
before the directives as they do without them. [fixture:
ishikawa/trailing-whitespace/directives-end-blanks-dropped] [fixture:
usecase/direction-and-accessibility/acctitle-trailing-directive-blanks-dropped]
[fixture: treeview/trailing-whitespace/directives-end-blanks-dropped] [fixture:
gantt/settings/format-runs-kept-before-directives] [fixture:
gantt/titles-and-sections/title-two-directives-trailing-blanks-dropped]
[fixture: pie/title/title-directives-end-blanks-dropped] [fixture:
radar/title/title-directives-end-blanks-dropped] [fixture:
packet/title/title-directives-end-blanks-dropped] [fixture:
architecture/title/title-directives-end-blanks-dropped] [fixture:
gitgraph/title-and-common-values/title-directives-end-blanks-dropped] [fixture:
cynefin/title/title-directives-end-blanks-dropped] [fixture:
treemap/title/title-directives-end-blanks-dropped] [fixture:
wardley/title/title-directives-end-blanks-dropped] [fixture:
treeview/title/title-directives-end-blanks-dropped] [fixture:
info/title/title-directives-end-blanks-dropped] [fixture:
railroad/title/title-directives-end-blanks-dropped] [fixture:
pie/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
radar/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
packet/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
architecture/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
gitgraph/title-and-common-values/acc-directives-end-blanks-dropped] [fixture:
cynefin/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
treemap/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
wardley/accessibility/acc-directives-end-blanks-dropped] [fixture:
treeview/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
info/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
railroad/accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
gantt/settings/format-two-directives-trailing-blanks-dropped] [fixture:
journey/titles-and-sections/title-two-directives-trailing-blanks-dropped]
[fixture:
timeline/titles-and-sections/title-two-directives-trailing-blanks-dropped]
[fixture: sequence/title/title-two-directives-trailing-blanks-dropped] [fixture:
venn/title/title-two-directives-trailing-blanks-dropped] [fixture:
c4/title-and-accdescription/title-two-directives-trailing-blanks-dropped]
[fixture:
c4/title-and-accdescription/description-two-directives-trailing-blanks-dropped]
[fixture:
timeline/periods-and-events/event-two-directives-trailing-blanks-dropped]
[fixture: timeline/periods-and-events/space-before-colon-added] [fixture:
timeline/periods-and-events/space-before-colon-keyword-period] [fixture:
state/aliases/second-description-two-directives-trailing-blanks-dropped]
[fixture: gantt/titles-and-sections/title-trailing-directive-blanks-dropped]
[fixture: venn/title/title-trailing-directive-blanks-dropped] [fixture:
c4/title-and-accdescription/title-trailing-directive-blanks-dropped] [fixture:
c4/title-and-accdescription/description-trailing-directive-blanks-dropped]
[fixture: timeline/periods-and-events/event-trailing-directive-blanks-dropped]
[fixture: state/aliases/second-description-trailing-directive-blanks-dropped]
[fixture: gantt/titles-and-sections/title-padding-dropped] [fixture:
gantt/titles-and-sections/title-blank-kept] [fixture:
gantt/settings/format-padding-dropped] [fixture:
gantt/settings/trailing-whitespace-by-setting] [fixture:
gantt/settings/format-blank-kept] [fixture:
journey/titles-and-sections/title-padding-dropped] [fixture:
journey/titles-and-sections/title-blank-kept] [fixture:
journey/titles-and-sections/title-hash-gap-one-space-section-kept] [fixture:
timeline/titles-and-sections/title-padding-dropped] [fixture:
timeline/titles-and-sections/title-blank-kept] [fixture:
timeline/periods-and-events/event-padding-kept-end-dropped] [fixture:
timeline/periods-and-events/event-end-before-continuation-dropped] [fixture:
sequence/title/text-padding-dropped] [fixture:
sequence/title/text-padding-dropped-colon] [fixture:
sequence/title/trailing-whitespace-dropped] [fixture:
sequence/title/title-blank-kept] [fixture: venn/title/text-padding-dropped]
[fixture: venn/title/title-blank-kept] [fixture:
c4/title-and-accdescription/title] [fixture:
c4/title-and-accdescription/accdescription] [fixture:
c4/title-and-accdescription/title-white-only] [fixture:
state/aliases/second-description-trailing-whitespace-dropped]

mermaid.js reads one whitespace character after the keyword and keeps the rest
in the Db, so the Db of the printed text differs from the Db of the written
text, but it draws the same figure. Each renderer puts the text into an SVG
`text` element with `text()`, which draws no whitespace at its start or at its
end:
[Gantt](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L194-L199),
[user journey](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/user-journey/journeyRenderer.ts#L166-L176),
[timeline](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/timeline/timelineRenderer.ts#L209-L216),
[sequence](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/sequenceRenderer.ts#L1450-L1456),
and
[Venn](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L76-L86).
The date format is trimmed before the dates are read
([`getStartDate`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L305-L359)),
and the axis format is only the format of the labels of the axis. Both texts of
each kind were drawn with mermaid.js 12.3.0 in Chromium, and the pixels were the
same, and so was the SVG, without the generated ids and without the whitespace
at the ends of a text. The same holds for the events of a timeline, the second
description of a state, and the title and the description of a C4 diagram, which
were drawn in the same way. A timeline puts the text of a period and of an event
through
[`wrap`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/timeline/svgDraw.js#L456-L496),
which cuts the text at its whitespace and `<br>`, and sets each line trimmed
([`drawNode`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/timeline/svgDraw.js#L511-L521)),
so a period and an event are drawn without the whitespace at their end. Texts
with and without the space before each colon were drawn with the ten versions
that count (see
[Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)), and the
SVG was the same: a period and events on one line and on later lines, in a
section, with `<br>`, with a text that wraps, and with a text of other scripts.

The name of a section is not printed in this form. The renderers tell two
sections apart by their names, so two names that differ only by the whitespace
at their start are two sections, and not any longer once the whitespace is taken
away. Gantt gives the tasks of a section a band of their own
([`checkUnique`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L120-L126)),
user journey starts a new box where the name of the section changes
([`drawTasks`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/user-journey/journeyRenderer.ts#L297-L324)),
and timeline collects the events of the sections with the same name
([`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/timeline/timelineRenderer.ts#L144)).
`section A` and `section  A` in a row draw two sections, `section A` and
`section A` one, and the figures differ in the colour of the bands, in the
number of boxes, and in the width. [fixture:
gantt/titles-and-sections/section-padding-kept] [fixture:
journey/titles-and-sections/section-padding-kept] [fixture:
timeline/titles-and-sections/section-padding-kept]

Three settings of a Gantt chart are drawn differently where whitespace stands
around the value, and stay as written. A tick interval is matched as a whole
against the intervals that it names
([`makeGrid`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L665-L668)),
so a space before or after `1day` turns its ticks into the default ones. A date
format of `D` has the axis of days only where it has no whitespace around it
([`makeGrid`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L650-L659)).
A today marker hides the line only where it is `off` as a whole
([`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L861-L878)),
so `todayMarker off` followed by two spaces draws the line where the chart holds
today, and the pixels differ. [fixture:
gantt/settings/format-padding-kept-where-drawn-differently] [fixture:
gantt/settings/trailing-whitespace-by-setting]

The name of a task of a Gantt chart ends with the whitespace between its text
and the colon, which the printer sets one space after the longest name of a
section whose names have padding, or of the sections that share a column, and
one space after a name that touches its colon (see
[Task data](./gantt.md#task-data)). The rule of the grammar takes everything
before the colon as the name, whitespace included
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L93)),
`addTask` keeps it in the `task` of the task
([`addTask`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L596-L606)),
and the renderer puts `task` into an SVG `text` element and measures its width
to decide where the text stands and which class it gets
([`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L394-L429),
[the class](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L449-L509)).
The whitespace at the end of the name is drawn as nothing and adds nothing to
the measured width, so the Db differs and the figure is the same. Both texts of
eight charts were drawn with mermaid.js 12.3.0 in Chromium: a name with no
whitespace before the colon and one with a space, with a space and with thirty,
with tabs and with spaces, a name that fits in its bar and one wider than it, a
name near the right edge of the chart, the states `done`, `crit`, `active`, and
`milestone`, and two sections. The pixels were the same, and so was the SVG,
without the generated ids and without the whitespace at the end of the text of a
task. The same holds for the 36 of the 39 texts of the corpus, of the documents
of mermaid.js, and of the fixtures of this package whose task names the printer
changes that mermaid.js can draw (it stops with an error on the other three,
before and after); the SVG of two of them differs also in the whitespace at the
start of the title, which is the exception of the title above. Both texts of the
15 fixtures that the space after a name that touches its colon added or changed
were drawn with the 14 versions of mermaid.js from 9.0.0 to 12.3.0: the pixels
were the same in 162 drawings and the SVG in 14, and mermaid.js stopped with an
error, before and after, in the other 34. Where the CSS of the chart keeps
whitespace, the figure differs: with
`%%{init: {"themeCSS": ".taskText{white-space:pre}"}}%%` the pixels of the two
texts differ. So the printer leaves the colons of a chart that holds
`white-space` as written, as it leaves the runs of whitespace in the other texts
(see
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: gantt/task-data/colon-column-new-longest-name] [fixture:
gantt/task-data/description-padding-tightened] [fixture:
gantt/task-data/colon-column-white-space-kept]

The tests compare the Db of the printed text with the whitespace at the ends of
its texts restored from the Db of the written text
(`keywordTextDbForFormattingComparison` in `tests/keyword-text-margins.ts`): a
title, a date format, or an axis format that differs from the written one only
by the spaces and tabs at its ends takes the written text, and so does the title
and the description of a C4 diagram; an event of a timeline, a description of a
state, and the name of a task of a Gantt chart, only by the spaces and tabs at
their end. Any other difference, among them one in the name of a section, in a
tick interval, or in a today marker, fails. When the pinned mermaid.js is
updated, draw both texts of each kind again and compare the SVG and the pixels
before the exception stays.

## Runs of whitespace in a text that are drawn the same

A run of spaces and tabs inside a text is printed as one space where mermaid.js
draws the text without the run: `title Sales   report` is printed
`title Sales report`, `accDescr: A`, a tab, and `B` is printed `accDescr: A B`,
and `quadrant-1 a    b` is printed `quadrant-1 a b`. The texts are the `title`
and the `accDescr` of every diagram type, and the texts that these diagram types
draw as SVG text: the labels of an architecture diagram, a block diagram, a
quadrant chart, and a radar chart, the titles of the subgraphs of a flowchart
and the flows of an agentflow diagram, the members and annotations of a class
diagram, the types of the attributes of an ER diagram, the fields and class
lists of a requirement diagram, the texts of a sequence diagram (the messages,
notes, blocks, boxes, and descriptions after `as`), the labels, technologies,
types, and descriptions among the arguments of a C4 diagram, the literals of a
Cynefin diagram and an ishikawa diagram, the labels of a packet and a Venn
diagram, the links of a Wardley map, the names of a treemap, and the strings and
special sequences of a railroad diagram. A string of spaces and tabs only is a
string like any other: `["   "]` is printed `[" "]`. [fixture:
pie/title/title-inner-text] [fixture: railroad/quotes/ir-string-runs-collapsed]
[fixture: pie/accessibility-lines/accessibility-inner-tab] [fixture:
quadrant/keywords-and-texts/inner-runs-collapsed] [fixture:
sequence/whitespace-between-tokens/values-runs-collapsed] [fixture:
class/member-lines/runs-collapsed] [fixture: block/shapes/label-runs-collapsed]
[fixture: er/attribute-spacing/tilde-word-runs-collapsed] [fixture:
requirement/fields/value-inner-runs-collapsed] [fixture:
radar/quotes/padding-label] [fixture: railroad/quotes/ebnf-empty-and-text]
[fixture: radar/quotes/whitespace-only-labels] [fixture:
treemap/names/whitespace] [fixture:
c4/argument-forms/text-places-element-runs-collapsed] [fixture:
flowchart/accessibility-lines/swimlane-description-runs-collapsed]

These stay as written:

- A text of spaces and tabs only that is not a string, except for the icon, the
  class, and the shape text of a mindmap node and a kanban card, which are
  printed as one space (see
  [Mindmap texts that are drawn the same](#mindmap-texts-that-are-drawn-the-same)).
  [fixture: gantt/titles-and-sections/title-blank-kept]
- A text over several lines, and a text with a comment, a directive, or a U+2028
  or U+2029 in it, whose lines and marks mermaid.js reads by their place.
  [fixture: pie/directives-and-semicolons/global-value]
- A text with a `<`, which may start an HTML tag that keeps the whitespace
  (`<pre>`), and every text of a diagram that holds `white-space` anywhere,
  which a `style` or a `classDef` can use to keep the runs of a label. [fixture:
  sequence/whitespace-between-tokens/html-tag-runs-kept] [fixture:
  pie/title/white-space-property-kept]
- The labels that mermaid.js draws as HTML: the nodes and the edges of a
  flowchart and an agentflow diagram, the descriptions, transitions, and notes
  of a state diagram, the nodes of a mindmap, the labels of a relation of a
  class diagram, and all texts of a use case diagram. A label that reaches its
  maximum width is laid out with `white-space: break-spaces`, which draws the
  runs
  ([`createText`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/createText.ts#L61-L77)),
  and whether a label does depends on the font and on the width setting, which
  the formatter does not know. A long label with runs was drawn with and without
  them, and the pixels differed. [fixture:
  flowchart/label-inner-whitespace/inner-whitespace-kept] [fixture:
  agentflow/labels/labels-padding] [fixture:
  state/descriptions-and-labels/text-kept] [fixture:
  mindmap/node-text/inner-whitespace-kept] [fixture:
  usecase/labels/label-interior-kept] [fixture: class/labels/spaced]
- The title of a subgraph of a flowchart, and of a `flow` of an agentflow
  diagram, that mermaid.js draws with the width of the subgraph, which wraps it:
  the title is a markdown string
  ([`rect`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters.js#L40-L50)
  and
  [`createContainerGroup`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters.js#L555-L564)
  pass a markdown title to `createText` with the width, and any other title to
  [`createLabel`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/createLabel.js#L38-L50),
  which passes none); the subgraph has a data block (`S@{ view: collapsed }`
  draws it as a collapsed group, whose title
  [`labelHelper`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/util.ts#L89-L104)
  passes to `createText` with a width;
  [`getData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1288-L1301)
  of a flowchart and
  [`getData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1794-L1815)
  of an agentflow diagram choose it); or the diagram draws lanes (the header
  `swimlane-beta`, or the setting `layout: swimlane`, which can stand in the
  frontmatter and in a directive, and which
  [sets the shape of every group to a lane](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/layout-algorithms/swimlanes/helpers.ts#L174),
  drawn by
  [`swimlane`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters/swimlane.js#L50-L55)
  with the width). A title with runs was drawn with and without them in each of
  the cases, and the pixels differed in each. A title of any other kind was
  drawn the same in nine cases of an ordinary subgraph (a long title, a small
  `wrappingWidth`, `htmlLabels: false`, `layout: elk`, `look: neo`, nested
  subgraphs, edges, the keyword `graph`) and in an agentflow `flow`, so it is
  printed with one space. A data block is not read for its keys: any block
  written for the id of the subgraph keeps its title (the id of a subgraph or a
  flow named by a string is the text between the quotes, without the whitespace
  at its ends, and for a markdown string the text between its backquotes:
  `subgraph "S"` and `subgraph " S "` have the id `S`), and so does a block
  written for an id like `subGraph0`, which mermaid.js gives to a subgraph whose
  name holds whitespace; a diagram that names `swimlane` anywhere keeps every
  title. A setting of the host of mermaid.js, outside the text, is not read.
  [fixture: flowchart/subgraph-header/markdown-title-runs-kept] [fixture:
  flowchart/subgraph-header/collapsed-title-runs-kept] [fixture:
  flowchart/subgraph-header/swimlane-title-runs-kept] [fixture:
  flowchart/subgraph-header/layout-swimlane-title-runs-kept] [fixture:
  agentflow/containers/flow-title-runs-collapsed] [fixture:
  agentflow/containers/flow-title-collapsed-runs-kept] [fixture:
  flowchart/subgraph-header/collapsed-quoted-name-title-runs-kept] [fixture:
  flowchart/subgraph-header/collapsed-markdown-name-title-runs-kept] [fixture:
  flowchart/subgraph-header/collapsed-spaced-name-title-runs-kept] [fixture:
  flowchart/subgraph-header/collapsed-generated-id-title-runs-kept] [fixture:
  agentflow/containers/flow-quoted-name-title-collapsed-runs-kept] [fixture:
  agentflow/containers/flow-spaced-quoted-name-title-collapsed-runs-kept]
  [fixture: agentflow/containers/flow-markdown-name-title-collapsed-runs-kept]
  [fixture: agentflow/containers/flow-two-part-name-title-collapsed-runs-kept]
- The `accTitle`. mermaid.js puts it into the `title` element of the SVG, which
  the browser shows as a tooltip when the pointer rests on the figure, and
  AGENTS.md compares tooltips. Whether the tooltip shows the runs could not be
  seen in a headless browser, so the text stays as written; the accessible name,
  which was the same for both texts, does not decide it. The `accDescr` is a
  `desc` element, which no tooltip shows. [fixture:
  pie/accessibility-lines/accessibility-inner-tab] [fixture:
  quadrant/titles-and-accessibility-statements/text-inner-whitespace-kept]
- The arguments of a C4 statement that are not a label, a technology, a type, or
  a description (the sprite, the tags, the link), and a named attribute at
  another place than its own, which mermaid.js reads in a way that depends on
  the place (see [Argument forms](./c4.md#argument-forms)). [fixture:
  c4/named-attributes/named-text-places-runs-collapsed]
- The names that other statements refer to: two names that differ by a run are
  two things, and are one once the run is gone. A pair of such names was drawn
  for the labels of a pie chart, the nodes of a Sankey diagram, the names of a
  requirement diagram, the entities of an ER diagram, the names of a class
  diagram, the ids of a state diagram, the aliases of a C4 diagram, the people
  of a user journey, and the components of a Wardley map, and the figures
  differ; a repeated branch of a gitgraph is rejected. [fixture:
  pie/labels/label-quotes] [fixture: requirement/names/inner-whitespace-kept]
  [fixture: state/aliases/id-kept]

mermaid.js keeps the runs in the Db. The renderers put these texts into `text`
elements of the SVG, whose whitespace the browser collapses
([`drawText`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/svgDraw.js#L259-L303)
is one of them), and the `accDescr` into a `desc` element, whose runs the
accessible description also collapses. Both texts of each case were drawn with
mermaid.js 12.3.0 in Chromium, once as written and once with about 140
characters after the run to see the wrap, and the pixels were the same, and so
was the SVG without the generated ids, the curves drawn at random, and the
whitespace in text nodes. The accessible description that a `desc` gives was the
same for both texts in the accessibility tree of Chromium. The SVG differs in
the text of one attribute only for the class list of a block diagram and a
requirement diagram (`class="node c   d"`) and for the arguments of a color of a
sequence diagram (`fill="rgb(1,   2, 3)"`): the browser reads the `class`
attribute as words and ignores whitespace in the arguments of a CSS color, like
the whitespace around a CSS declaration, which AGENTS.md does not compare.
[fixture: block/styles/class-name-runs-collapsed] [fixture:
requirement/class-lists/classes-with-spaces] [fixture:
sequence/whitespace-between-tokens/values-of-other-statements-runs-collapsed]

The tests compare the Db of the printed text with the runs restored from the Db
of the written text (`textRunDbForFormattingComparison` in
`tests/text-run-margins.ts`): a text of a place that the file lists for the
diagram type, which differs from the written one only by the runs, takes the
written text, and so does a text that also lost the whitespace at its ends (see
[Texts after a keyword that are drawn the same](#texts-after-a-keyword-that-are-drawn-the-same)).
The names that other statements refer to are not in the lists, so a difference
in one of them fails. When the pinned mermaid.js is updated, draw both texts of
each kind again, with a short text and a long one, and compare the SVG and the
pixels before the exception stays.

## Call arguments that are drawn the same

The arguments of a `click` call in flowchart, agentflow, class, and Gantt
diagrams are printed without whitespace at their ends or before a `,`, and with
one space after it: `click A call f(  "x" ,y ,   z  )` is printed
`click A call f("x", y, z)`. The whitespace inside quotes stays, and so does the
whitespace beside a `,` inside quotes. Arguments with an empty part, with a line
break, or with a comment or a directive stay as written. [fixture:
flowchart/whitespace-between-tokens/callback-arguments-spaced] [fixture:
agentflow/click-statements/callback-arguments-spaced] [fixture:
class/whitespace-between-tokens/callback-arguments-spaced] [fixture:
gantt/click-statements/call-arguments-spaced]

The line rule of mermaid.js (see [Lines that hold a `;`](#lines-that-hold-a-))
reads the line of a call. Where the line holds `style` or `classDef`, later a
`:`, later a `#`, and later a `;`, and only characters that are not whitespace
lie between the `:` and the `#`, it ignores the last `;` of the line. So
`click A call f(style:x,#b;c)` calls `f` with `style:x` and `#bc`, and
`click A call f(style:x, #b;c)`, with a space after the `,`, calls it with
another second argument, since the `;` is then no longer ignored and `#b;` is
read as an entity code. A gap between the arguments that the rule may read keeps
whether it holds whitespace, a run becoming one space, so the first call keeps
its spelling. The word may be in an argument or before the call, such as in the
id of the node, and `classDef` takes the place of `style`. [fixture:
flowchart/whitespace-between-tokens/callback-arguments-line-rule-kept] [fixture:
agentflow/click-statements/callback-arguments-line-rule-kept] [fixture:
class/whitespace-between-tokens/callback-arguments-line-rule-kept] [fixture:
gantt/click-statements/call-arguments-line-rule-kept]

mermaid.js keeps the text between the parentheses in the Db, so the Db of the
printed text differs from the Db of the written text, but it calls the function
with the same arguments. Each of the four diagram types splits the text at every
`,` that has an even number of `"` after it, trims each part, and takes a part
that starts and ends with `"` without them
([flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L533-L545),
[class](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/class/classDb.ts#L458-L471),
[Gantt](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L752-L765),
[agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L963-L976)).
The function is bound only where `securityLevel` is `loose`. Both texts of each
case were drawn with mermaid.js 12.3.0 in Chromium at that level and the nodes
were clicked: the function got the same arguments, `x`, `y`, and `z` for both
spellings above, in all four diagram types, while a change inside quotes changed
them.

The tests compare the Db of the printed text with the arguments restored from
the Db of the written text (`clickCallDbForFormattingComparison` in
`tests/click-call-margins.ts`): arguments that are read as the same parts take
the written text, and any other difference fails. When the pinned mermaid.js is
updated, click both texts of each kind again before the exception stays.

## Mindmap texts that are drawn the same

The text of a node of a mindmap, the text of its shape, its icon, and its class
are printed without the spaces and tabs at their ends: `a (x)` is printed
`a(x)`, `b[ y ]` is printed `b[y]`, `::icon( fa )` is printed `::icon(fa)`, and
`::: big ` is printed `:::big`. The whitespace inside a text stays, since a node
that wraps draws its runs (see
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
A shape text that would start with a quote once its padding is gone (`a[ "x" ]`
is a text with its quotes, `a["x"]` a string), a string, a markdown string, a
text over lines, and a line with a comment or a directive in it or after it stay
as written, except that the directives that end the text of a node, of a class,
or of a card are printed as in
[Texts after a keyword that are drawn the same](#texts-after-a-keyword-that-are-drawn-the-same).
A text of nothing but spaces and tabs is printed as one space. [fixture:
mindmap/node-text/directives-end-blanks-dropped] [fixture:
kanban/trailing-whitespace/directives-end-blanks-dropped] [fixture:
mindmap/node-text/trailing-whitespace-dropped] [fixture:
mindmap/node-text/space-before-a-shape-dropped] [fixture:
mindmap/shapes/inner-padding-dropped] [fixture:
mindmap/decorations/padding-in-icon-and-class-dropped] [fixture:
mindmap/shapes/padding-kept-where-drawn-differently] [fixture:
mindmap/decorations/blank-icon-and-class-one-space] [fixture:
mindmap/node-text/inner-whitespace-kept]

mermaid.js keeps the texts in the Db (`nodeId`, `descr`, `icon`, and `class`),
so the Db of the printed text differs from the Db of the written text, but it
draws the same node. The text of a node and of its shape go into a markdown
label, the icon into the icon of the node, and the class into the list of
classes of its element, which the browser reads whitespace-separated; the id of
a node is not drawn
([`flattenNodes`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L224-L309)).
Both texts of each case were drawn with mermaid.js 12.3.0 in Chromium, and the
pixels were the same, and so was the SVG, without the generated ids and the
whitespace that HTML does not draw. The nodes are numbered, not compared by
their ids or texts, so two nodes that get the same text by the change are still
two nodes, drawn as before. A text that becomes a string was drawn differently.

A kanban board follows the same rules for the texts of its cards, the labels of
its columns and cards, and its icons and classes (see
[Kanban](./kanban.md#shapes)). The id of a column is the exception: mermaid.js
tells two columns apart by it. `todo [A]` and `todo[B]` are two columns, drawn
apart, and with the space gone they were drawn differently. The id of a card is
not compared, and `id1 [x]` and `id1[x]` were drawn the same, also where two
cards got the same id by the change. [fixture:
kanban/shapes/card-id-before-shape-dropped] [fixture:
kanban/shapes/id-before-shape]

The tests compare the Db of the printed text with the texts of the nodes
restored from the Db of the written text (`mindmapDbForFormattingComparison` in
`tests/mindmap-text-margins.ts` and `kanbanDbForFormattingComparison` in
`tests/kanban-text-margins.ts`): a text that differs from the written one only
by the spaces and tabs at its ends takes the written text, and any other
difference, among them a text that became a string, fails. When the pinned
mermaid.js is updated, draw both texts of each case again and compare the SVG
and the pixels before the exception stays.

## Labels that are drawn the same

The labels of flowchart, swimlane, and agentflow diagrams are printed in the
form that the examples use (see [The quotes of a text](#the-quotes-of-a-text)):
`A["Start here"]` is printed `A[Start here]` in a flowchart and a swimlane
diagram, `A[Start]` is printed `A["Start"]` in an agentflow diagram, and the
labels of links and the titles of subgraphs and flows follow. A text that
mermaid.js reads differently in the other form stays as written. [fixture:
flowchart/quotes/shape-labels-without-quotes] [fixture:
flowchart/quotes/link-labels-without-quotes] [fixture:
flowchart/quotes/subgraph-titles-without-quotes] [fixture:
agentflow/quotes/labels-in-quotes] [fixture:
agentflow/quotes/flow-titles-in-quotes]

mermaid.js keeps the `labelType` `string` in the Db for a label in quotes and
`text` for a label without them, so the Db of the printed text differs from the
Db of the written text, but it draws the same figure. The Db gets the type from
the text of a vertex
([`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L228),
and
[`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L485)),
of an edge
([L333](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L333)
and
[L752](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L752)),
and of the title of a subgraph or a flow
([L763](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L763)
and
[L1245](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1245)),
and the renderers read only whether it is `markdown`: the label of a node
([`labelHelper`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/util.ts#L89)),
the label of an edge
([`edges.js`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L87)),
and the title of a subgraph
([`clusters.js`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters.js#L41)
and
[L555](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters.js#L555)).

Both texts of each case were drawn in Chromium, and the SVG was the same, or the
pixels were: a text of letters, digits, spaces, and `-`, `.`, `,`, `:`, `!`, and
`?` in each of the fourteen shapes of a flowchart, as the label of a link
between `|`, between two arrows, between two dotted arrows, and between two
thick arrows, and as the title of a subgraph. The drawings were made with
mermaid.js 9.0.0, 9.1.7, 9.4.3, 10.3.1, 10.9.0, 11.0.0, 11.4.1, 11.12.3,
11.13.0, 11.16.1, 12.0.0, and 12.3.0 for a flowchart, with 11.16.1, 12.0.0, and
12.3.0 for a swimlane diagram, and with 12.0.0 and 12.3.0 for an agentflow
diagram. The stadium and the asymmetric shape are drawn with strokes at random,
and the same text drawn twice differs in the data of their paths only. Before
10.3.1 a label in quotes has the type `text`, as a label without them, so there
the two forms have the same Db. The characters of the list were compared with
and without quotes in each shape and form of a link, at the start, in the
middle, and at the end of a text: the Db was the same apart from the
`labelType`. Other characters are read differently in some places, and stay in
quotes: an `@` in the asymmetric shape and in an agentflow diagram, a `%` in an
agentflow diagram, a `.` between dotted arrows, and a `=` between thick arrows
are rejected without quotes, and a `/`, a `\`, or a `-` at the start of a text
makes another shape or is rejected.

The tests compare the Db of the printed text with the `labelType` restored from
the Db of the written text (`labelTypeDbForFormattingComparison` in
`tests/label-type-differences.ts`): a `labelType` that differs between `string`
and `text` takes the written one, and any other difference, among them a label
that became markdown or stopped being it, fails. When the pinned mermaid.js is
updated, draw both texts of each case again and compare the SVG and the pixels
before the exception stays.

## Colors that are drawn the same

The colors in the styles of flowchart, swimlane, agentflow, class, state, ER,
requirement, block, usecase, quadrant, and Venn diagrams are printed in lower
case: `style A fill:#F9F,stroke:#ABCDEF` is printed
`style A fill: #f9f, stroke: #abcdef`. The colors are in these places:

| Diagram type | Where the colors are                                             | Colors of the examples, lower case / otherwise |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------------: |
| flowchart    | `style`, `classDef`, `linkStyle` with link numbers and `default` |                                         10 / 0 |
| swimlane     | the same statements                                              |                                          2 / 0 |
| agentflow    | the same statements                                              |                                          0 / 0 |
| class        | `style`, `classDef`                                              |                                          8 / 0 |
| state        | `style`, `classDef`                                              |                                          2 / 0 |
| ER           | `style`, `classDef`                                              |                                         12 / 0 |
| requirement  | `style`, `classDef`                                              |                                          5 / 0 |
| block        | `style`, `classDef`                                              |                                          7 / 0 |
| usecase      | `style`, `classDef`                                              |                                         10 / 0 |
| quadrant     | `color` and `stroke-color` of a point and of a `classDef`        |                                          7 / 0 |
| Venn         | the properties of `style`                                        |                                          1 / 0 |

The counts are the colors with a hexadecimal letter (`#F9F`) in those places in
the examples of the documentation of mermaid.js, read with the parser; the
examples write 64 of them in lower case and none in upper case or in both. A
color of digits only (`#333`, 30 more) has no case and is not counted. The
colors of other places are texts of another kind and stay as written: the labels
and the titles (a `<span>` with `style='color:#F00'` in a label is a label), the
notes, the arguments of a call of a C4 diagram (`$bgColor="#FFF"`), the colors
of the boxes and the rectangles of a sequence diagram (not the commas of a color
function, see below), and the settings of the frontmatter and of the directives.
The `classDef` of a treemap has none, since its lexer rejects a `#`. [fixture:
flowchart/colors/colors-in-lower-case] [fixture:
flowchart/colors/swimlane-colors-in-lower-case] [fixture:
agentflow/colors/colors-in-lower-case] [fixture:
class/colors/colors-in-lower-case] [fixture: state/colors/colors-in-lower-case]
[fixture: er/colors/colors-in-lower-case] [fixture:
requirement/colors/colors-in-lower-case] [fixture:
block/colors/colors-in-lower-case] [fixture:
usecase/colors/colors-in-lower-case] [fixture:
quadrant/colors/colors-in-lower-case] [fixture:
venn/colors/colors-in-lower-case]

A text is a color only where it cannot be anything else, and the formatter
prints it as the CSS formatter of Prettier does (3.9.9, run on `fill: <value>`
for each value below; the formatter gave the same text, apart from the case of
the unit in `#fff 10PX`, which it does not change). A color is a `#` and 3, 4,
6, or 8 hexadecimal digits that is a word of its own in the text of a style: it
starts the text or follows whitespace, a `:`, a `,`, or a `(`, and it ends the
text or is followed by whitespace, a `,`, a `)`, a `!`, or the `;` that ends the
statement. So `#F9F`, `#ABCD`, `#ABCDEF`, `#ABCDEF12`, `#FFF !important`,
`#FFF!important`, `1px solid #FFF`, `rgb(#FFF)`, `calc(#ABC)`, `var(--x, #ABC)`,
`fn(#FFF, #000)`, and `/* #ABC */ #DEF` (the color after the comment) are
printed in lower case, and a color is never shortened (`#FFFFFF` stays six
digits). These stay as written: a run of 2, 5, 7, or 9 digits (`#AB`, `#ABCDE`,
`#ABCDEF1`, `#ABCDEF123`), a `#` followed by other letters (`#GGG`), a word that
more characters touch (`#ABC-x`, `x#ABC`, `#ABC.5`, `#ABC#DEF`, `#ABC/#DEF`),
and a `#` inside a string (`'#ABC'`), a comment, the parentheses of `url(`
(`url(#ABC)` is a reference to an element), or after a backslash (`\#ABC`). A
`;` inside the text of a style makes the color the placeholder of an entity, or
joins it to the word after the `;` (`classDef c fill:#F9F;stroke:red` has the
style `fill:#F9Fstroke:red`,
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)),
so it stays; the `;` that ends the statement is dropped by the formatter, and
the color before it is printed in lower case. A directive that touches the color
(`fill:#ABCDEF%%{init: {}}%%`) can join the word before it to the word after it
once mermaid.js has taken it away, so that color stays as written too. [fixture:
flowchart/colors/words-that-are-not-colors-as-written] [fixture:
flowchart/colors/colors-in-quotes-and-after-a-backslash-as-written] [fixture:
flowchart/colors/color-before-the-final-semicolon] [fixture:
flowchart/colors/colors-before-a-semicolon-as-written] [fixture:
flowchart/colors/colors-next-to-comments-and-directives] [fixture:
class/colors/words-that-are-not-colors-as-written] [fixture:
state/colors/words-that-are-not-colors-as-written] [fixture:
er/colors/words-that-are-not-colors-as-written] [fixture:
requirement/colors/words-that-are-not-colors-as-written] [fixture:
block/colors/words-that-are-not-colors-as-written] [fixture:
usecase/colors/words-that-are-not-colors-as-written] [fixture:
venn/colors/words-that-are-not-colors-as-written]

A color function that stands alone in its text is printed with one space after
each comma: `rect rgb(191,223,255)` is printed `rect rgb(191, 223, 255)`,
`box hsl(10,40%,90%) Team` is printed `box hsl(10, 40%, 90%) Team`, and
`style A fill:rgb(1,2,3)` of a Venn diagram is printed
`style A fill: rgb(1, 2, 3)`. The places are the text of a `rect` and the part
of the text of a `box` that mermaid.js asks the browser about (the
`color-candidate` of the specification), in a sequence diagram, and the value of
a property of a `style` of a Venn diagram. The whitespace before a comma and
inside the parentheses stays as written. The text is a color function when it is
`rgb(`, `rgba(`, `hsl(`, or `hsla(` in lower case, with three arguments for
`rgb` and `hsl` and four for `rgba` and `hsla`, each of digits and at most one
dot, with a `%` after it for a percentage, and a `)`; the first three arguments
of an `rgb` are all numbers or all percentages, and the second and the third of
an `hsl` are percentages. That is a color in every browser. For anything else
the printer cannot know that it is one: mermaid.js asks the browser, and takes
the whole text of a `box` for its title when it is not
([`parseBoxData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)),
so the spaces would change the title. So `box rgb(33,66,99) Team (x,y)` (the
pattern of mermaid.js reads up to the last `)`), `box RGB(33,66,99) Team`,
`box rgb (33,66,99) Team`, `box hsl(120,100,50) Team`,
`box rgb(10%,20,30) Team`, and `box rgb(1,2) Team` stay as written; 12 versions
drew the two texts of each of them differently. The documentation of mermaid.js
writes the colors of a `rect` with a space after the commas 4 times and without
it never, those of a `box` 2 times with it and 2 times without it, and has no
color function in a Venn diagram. The space is the form of the examples of the
sequence diagram (6 of 8), and the form in which the styles of the other diagram
types are printed (see
[Styles that are drawn the same](#styles-that-are-drawn-the-same)). A comma
followed by a whitespace character other than a space and a tab, such as U+00A0
and U+2028, and a text that has more than the function, such as `rect` followed
by `rgb(1,2,3) extra`, stay as written. [fixture:
sequence/colors/functions-spaced] [fixture:
sequence/colors/function-padding-kept] [fixture:
sequence/colors/functions-as-written] [fixture:
sequence/colors/functions-beside-comments-and-directives] [fixture:
venn/colors/functions-spaced] [fixture: venn/colors/function-padding-kept]
[fixture: venn/colors/functions-as-written]

mermaid.js keeps the colors in the case in which they are written, in its Db and
in the figure, and draws the same figure. It puts the style of a node into the
CSS `style` attribute of its shape as it is, with `!important`, where CSS reads
the digits of a color in any case
([`styles2Map`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L44-L51)
and
[`styles2String`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L75-L106)).
The style of a link goes into the `style` attribute of its path, and its
`stroke` is the color of the arrowheads
([`stroke:` of the styles](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L899)
and
[of the path](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L957)),
which
[`addEdgeMarkers`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edgeMarker.ts#L104-L136)
copies into a marker with the id of the color (`…pointEnd-margin__ABCDEF`), an
id that mermaid.js generates. A quadrant chart puts the color of a point into
the attributes `fill` and `stroke` as it is
([`quadrantBuilder.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/quadrant-chart/quadrantBuilder.ts#L496-L508)).
Both texts of each place were drawn in Chromium: the SVG was the same apart from
the case of the colors and from the generated ids and the random paths of the
hand drawn shapes, or the pixels were the same (`style`, `classDef`, and
`linkStyle` of a flowchart with the 14 versions 9.0.0, 9.1.7, 9.4.3, 10.3.1,
10.9.0, 11.0.0, 11.4.1, 11.12.3, 11.13.0, 11.14.0, 11.15.0, 11.16.1, 12.0.0, and
12.3.0; a swimlane diagram with 11.16.1, 12.0.0, and 12.3.0; an agentflow
diagram with 12.0.0 and 12.3.0; a class diagram with 10.9.0, 11.0.0, and 11.4.1
to 12.3.0 for `style`, and with 11.4.1 to 12.3.0 for `classDef`; a state diagram
with 9.4.3, 10.3.1, 10.9.0, and 11.0.0 to 12.3.0 for `classDef`, and with 11.0.0
to 12.3.0 for `style`; an ER diagram with 11.12.3 to 12.3.0; a requirement
diagram with 11.12.3 to 12.3.0; a block diagram with 10.9.0 to 12.3.0; a usecase
diagram with 12.0.0 and 12.3.0; a quadrant chart with 11.0.0 to 12.3.0; and a
Venn diagram with 11.13.0 to 12.3.0). Of the 14 versions, the others reject the
statement or the diagram type, except 9.0.0 for an ER diagram, which accepts a
`style` or `classDef` line and draws the words `style` or `classDef` and the ids
after it as entities, without a style, and draws the text with the color in
upper case and in lower case as the same SVG, so that the formatter's change
draws the same there too.

A `rect` puts its text into the attribute `fill` of the rectangle behind the
messages as it is
([`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/sequenceRenderer.ts#L1182-L1196)
and
[`drawBackgroundRect`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/common/svgDrawCommon.ts#L54-L66)),
and a `box` does the same with the color that `parseBoxData` finds
([`drawBox`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/svgDraw.js#L1445-L1462)),
where CSS reads the whitespace after a comma in any form. The Db keeps the text
as it is written, so it differs, and the figure is the same. Both texts of 7
`rect` and 4 `box` colors of the forms above were drawn in Chromium with the 14
versions: the pixels were the same in the 98 drawings of the `rect` and the 48
of the `box` (9.0.0 and 9.1.7 have no `box`), and 7 Venn colors were drawn with
the 6 versions from 11.13.0 that have a Venn diagram, with the same SVG in the
42 drawings. The same was drawn for the fixtures above: 61 drawings of the
sequence fixtures had the same pixels and 18 of the Venn fixtures the same SVG,
and mermaid.js stopped with an error, before and after, in the others.

The tests compare the Db with the colors of the styles restored from the Db of
the written text (`colorCaseDbForFormattingComparison` in
`tests/color-case-differences.ts`): a color that is the written color in lower
case takes the written case, in the places of the Db that hold a style, and so
does a color function that differs from the written one only in the spaces after
its commas, in the `fill` of a box and the message that starts a `rect` of a
sequence diagram and in the value of a property of a Venn style; any other
difference, among them a text that is no color by the definition above and was
printed in lower case, a color that became another color, a color that was lost,
and a name of a box that differs in its commas, fails. When the pinned
mermaid.js is updated, draw both texts of each place again and compare the SVG
and the pixels before the exception stays.

## The examples that decide the whitespace before a colon

A colon that can also be read as a mark that stands between two things has the
whitespace before it that the examples in the documentation of the pinned
mermaid.js write at least twice as often as any other (see
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)). All these
examples are counted in one way. The page is the syntax page of the diagram type
(`packages/mermaid/src/docs/syntax/<page>.md`), and the blocks are its fenced
`mermaid-example` blocks; the `mermaid` blocks of the generated copy under
`docs/syntax/` repeat them. The frontmatter of a block, the comment lines, and
the directive lines are left out. Of the lines of the kind in question, a line
is counted when a space or a tab follows the colon, and it is counted by whether
a space or a tab stands before the colon. A line with no whitespace after the
colon is not counted, and neither is one with no whitespace on either side, such
as the `set A:3` of a Venn diagram, which is a way of writing that differs from
every printed form. A colon at the start of its line has nothing before it (4 in
the timeline page).

| Line                                           | Page                           | Space before | No space before | Not counted |
| ---------------------------------------------- | ------------------------------ | -----------: | --------------: | ----------: |
| The description of a state                     | `stateDiagram.md`              |            1 |               4 |           0 |
| The label of a transition between states       | `stateDiagram.md`              |           13 |               2 |           0 |
| The label of a relationship of an ER diagram   | `entityRelationshipDiagram.md` |           40 |               0 |           0 |
| The label of a relation between classes        | `classDiagram.md`              |           26 |               0 |           0 |
| A member that a line adds to a class           | `classDiagram.md`              |           16 |               2 |           0 |
| The text of a message of a sequence diagram    | `sequenceDiagram.md`           |            0 |             107 |           0 |
| The data of a task of a Gantt chart            | `gantt.md`                     |           22 |               0 |          28 |
| A colon between a period and its events        | `timeline.md`                  |           88 |               0 |           0 |
| The size of a set or a union of a Venn diagram | `venn.md`                      |            0 |               0 |           6 |

The lines of a kind are these. A description of a state is `id: text` with no
arrow, apart from `accTitle`, `accDescr`, and the `:::` that gives a class, and
the label of a transition is the text after the colon that follows `-->`. The
label of a relationship of an ER diagram follows the symbols of the
relationship, and the label of a relation between classes follows the relation.
A member line is `Name : member` with no relation on the line, where the name
starts with a letter or `_`. A message of a sequence diagram is the text after
the colon that follows the arrow of a message. A task of a Gantt chart is any
line that is none of the statements of the diagram (`title`, `dateFormat`,
`section`, and the others); the 28 not counted write the data against the colon
(`Task :a1, 2014-01-01, 3d`). The colons of a timeline are those of the lines
that are no `title`, `section`, or accessibility line. A Venn size is the last
colon of a `set` or `union` line.

## Lists separated by commas

Prettier prints one space after a comma, and none before it. The formatter
prints the lists of names that mermaid.js reads the same with the space in that
form, a comma that touches the name before it and one space after it: the
`class`, `classDef`, and `style` statements of ER and requirement diagrams, the
`class` and `classDef` statements of usecase diagrams (a usecase `style` takes
one id), and the `:::` classes of the three (`class A,B c,d` is printed
`class A, B c, d`, and `A:::c1,c2` is printed `A:::c1, c2`), the `classDef`
names of a class diagram, the `class` ids of a state diagram, the two ids of a
`Note over` in a sequence diagram (`Note over A,B` is printed `Note over A, B`),
and the names of a Venn diagram (`union A,B` is printed `union A, B`). [fixture:
er/entities/classes-tight] [fixture: er/styles-and-classes/class-lists]
[fixture: requirement/class-lists/shorthand] [fixture:
class/whitespace-between-tokens/classdef-names-touching] [fixture:
state/whitespace-between-tokens/class-ids-touching] [fixture:
sequence/whitespace-between-tokens/comma-touching] [fixture:
usecase/classes-and-styles/class-lists] [fixture: venn/name-lists/names-comma]
The lists of the other diagram types that have a comma already had the space:
the items of a task of a Gantt chart, the people of a user journey, the
arguments of a C4 call, the values of an XY chart, the coordinates of a point of
a quadrant chart and of a Wardley map, and the actors of a use case diagram.

For the 17 kinds of lists that are printed with the space, the text with the
space and the text without it were run in Chromium with the 17 versions on hand
(the 14 of the earlier runs, and 10.9.8, 11.7.0, and 11.17.2), and with 11.8.1
after it. The Db of mermaid.js 12.3.0 was the same for each of them, and no
version rejected the text with the space where it read the text without it. In
the ten versions that count (see
[Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)) the SVG
or the pixels were the same wherever the version has the diagram type and draws
it; a class diagram draws other random ids each time, so the Db is its evidence
there. (A state diagram `class` statement is drawn differently in 9.0.0 and
9.1.7, which do not count.)

The space is not printed where mermaid.js rejects it or reads something else.
The lists stay without the space in these places:

| Where                                                                | With the space                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `class`, `click`, and `linkStyle` of a flowchart and of an agentflow | rejected by every version that reads the text without it (17 versions for a flowchart, 2 for agentflow) |
| `classDef` names of a flowchart and of an agentflow                  | `classDef a, b fill:red` gives `a` the style `b fill:red`, and `b` none: the Db differs                 |
| `class` ids of a block diagram                                       | the id after the space gets no class: `class A, B x` leaves `B` without it                              |
| the classes of a `class` statement of a block and of a state diagram | `x, y` is one class with that name, as `x,y` is one class named `x,y`: the Db differs                   |
| `style` ids of a state diagram                                       | `style A, B fill:red` gives `A` the style `B fill:red`: the Db differs                                  |
| `click` ids of a Gantt chart                                         | rejected by every version (17)                                                                          |

[fixture: flowchart/whitespace-between-tokens/comma-lists-without-space-kept]
[fixture: agentflow/single-space-gaps/comma-lists-without-space-kept] [fixture:
block/styles/class-ids-as-written] [fixture:
block/styles/class-names-without-space-kept] [fixture:
state/whitespace-between-tokens/comma-lists-without-space-kept] [fixture:
gantt/click-statements/ids-touch-commas]

A row of a sankey diagram stays without the space as well, though mermaid.js
reads `a, b, 1` as `a,b,1`. The rows are CSV: the documentation of mermaid.js
says that the diagram
[implements the CSV standard](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/sankey.md#L97),
and RFC 4180 (section 2, item 4) counts the spaces beside a comma as part of the
field. A comma between such fields is not a mark beside which Prettier prints a
space, since Prettier formats no language with rows of this kind, and no other
diagram type has one, so the form that was published decides. A space would also
be possible only in some rows: `a, "b c", 1` is rejected by the 14 versions that
have sankey, since mermaid.js rejects a space before a quote. [fixture:
sankey/commas/spaces-around-commas-dropped] [fixture:
sankey/commas/quoted-fields-touch-commas]

## Spellings that are drawn the same

mermaid.js reads some different spellings of a token as the same token and draws
the same figure from them: a keyword in another case, a string between `'`
instead of `"`, a number with a zero at the end, the words of a relationship of
an ER diagram instead of its symbols, an accessibility description in a block on
one line instead of after a colon, a text in quotes instead of without them, an
arrow longer than it needs to be. The printer writes such a spelling in one
form. For the whitespace between tokens the form is the one that the other
diagram types print for the same kind of gap (see the sections above). For a
spelling, the form is the one that the examples in the documentation of the
pinned mermaid.js use at least twice as often as any other form. Where no form
is used that often, or the examples use none, the spelling is kept as written. A
line that the printer prints as written has these spellings in one form too:
`NOTE OVER A:%%{init: {}}%%  ;ACTOR B` is printed
`Note over A:%%{init: {}}%%  ;actor B`, the whitespace, the `;`, and the
directive staying as they are. [fixture:
sequence/keyword-case/kept-line-in-one-form] [fixture:
gantt/keyword-case/kept-line-in-one-form] The examples are the 541 fenced
`mermaid-example` and `mermaid` blocks of the
[syntax pages](https://github.com/mermaid-js/mermaid/tree/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax);
the parser reads 524 of them, and the counts below are counts in those 524.

The comparisons use the pinned mermaid.js only, while the formatted text is also
drawn by other versions of mermaid.js. So a spelling is also kept as written
where the form that would be printed is not accepted by every version that
accepts the form that was written.
[Versions of mermaid.js](#versions-of-mermaidjs) shows what was read for each
kind.

Each kind was compared with mermaid.js 12.3.0 before the printer wrote its form.
For each example that holds the spelling, the example was written again in the
other spelling, and mermaid.js read both texts; a pair whose other spelling
mermaid.js rejects (a `+` before a number in a pie chart) is not counted. Both
texts were drawn in Chromium. In every counted pair the Db was the same, and the
SVG screenshots were the same, pixel for pixel; where the same text drawn twice
already differs (the strokes of the Agentflow shapes, of the `hourglass` of a
flowchart, and of the choice of a state diagram are drawn at random, and so are
the commit ids and the widths of the labels of a gitGraph), the SVG without its
numbers, commit ids, and element ids was the same. mermaid.js draws from the Db,
so the same Db is what makes the drawing the same; the drawings are the check
that nothing else reads the text.

| Kind                         | Pairs | Same Db | Drawn the same |
| ---------------------------- | ----: | ------: | -------------: |
| Keywords in one case         |   445 |     445 |   138 (sample) |
| Strings between `"`          |    79 |      79 |             79 |
| Numbers in the shortest form |    37 |      37 |             37 |
| Values of a sankey link      |    22 |      22 |             22 |
| Header directions            |    11 |      11 |             11 |
| `switch` of a gitGraph       |    27 |      27 |             27 |

Of the keyword pairs a sample was drawn, and a pair whose own text, drawn twice,
already differs was not counted. The kinds below were compared in the examples
and, with the Db only, in the inputs of the conformance corpus:

| Kind                                        | Examples | Same Db and drawing | Corpus | Same Db |
| ------------------------------------------- | -------: | ------------------: | -----: | ------: |
| Relationships of an ER diagram              |        4 |                   4 |     66 |      66 |
| Length of an arrow of a block diagram       |        0 |                   0 |      4 |       4 |
| Length of an axis arrow of a quadrant chart |        0 |                   0 |      2 |       2 |
| `Rel_Up` and the like of C4                 |        1 |                   1 |      7 |       7 |
| `::=` of the EBNF notation                  |        9 |                   9 |     91 |      91 |
| A packet range with equal ends              |        2 |                   2 |    133 |     131 |
| The colon of a header (removed)             |        6 |                   6 |    646 |     643 |
| The colon of a header (line break)          |        0 |                   0 |     22 |      21 |
| The label of a link                         |       19 |                  19 |    170 |     162 |
| A description block on one line             |        3 |                   3 |    533 |     483 |
| Quotes of a sankey field                    |        6 |                   6 |     11 |      11 |
| Quotes of an ER name                        |        0 |                   0 |     15 |      15 |
| Quotes of a requirement name                |        0 |                   0 |     12 |      12 |
| Quotes of a Wardley map name                |        0 |                   0 |     35 |      35 |
| Quotes of a gitGraph branch                 |        0 |                   0 |      2 |       2 |
| Quotes of a quadrant text                   |        0 |                   0 |     19 |      13 |
| Quotes of an XY chart text                  |        0 |                   0 |    191 |     191 |
| Quotes of a venn name or label              |        0 |                   0 |    176 |     174 |
| Quotes of a use case name or label          |        0 |                   0 |     93 |      90 |
| Quotes of an architecture label             |        0 |                   0 |      2 |       2 |
| Quotes of a mindmap shape text              |        0 |                   0 |      7 |       7 |
| Quotes of a kanban shape text               |        0 |                   0 |    114 |     114 |
| Quotes of a C4 argument                     |        0 |                   0 |     67 |      65 |
| Quotes of a heading name                    |        0 |                   0 |     11 |      11 |
| Quotes of an agentflow name                 |        0 |                   0 |     26 |      24 |
| Quotes of a class name                      |        0 |                   0 |      7 |       7 |

A corpus pair that is not counted in the last column is a pair of which
mermaid.js rejects the other spelling, except two pairs of the label of a link,
which have a `%%` in the label and a different Db, 37 pairs of a description
block, of which mermaid.js rejects both spellings (the known divergence
`c4-keyword-anywhere`), 4 pairs of an XY chart, of which it rejects both (the
known divergence `title-digit-after-axis-statement`), and 9 pairs of a
description block whose Db differs in the whitespace of a title, a description,
or a style (see
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)
and [Styles that are drawn the same](#styles-that-are-drawn-the-same)), 6 pairs
of a quadrant chart with a tab inside a text (see the same section), 2 pairs of
a venn label whose Db differs in a run of spaces or tabs (see
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
3 pairs of a use case diagram and 2 pairs of an agentflow diagram whose Db
differs in the whitespace of a style, and 2 pairs of a C4 diagram whose Db
differs in a run of spaces or tabs in a text. The printer does not rewrite a
range of a packet diagram next to a hidden YAML block, a colon that a `;` or the
`---` of a hidden YAML block touches, or the label of a link with a `%%` in it.
When the pinned mermaid.js is updated, the examples are counted again and each
kind is compared again.

### Keywords in one case

The lexers of these diagram types read a keyword in any case. The printer writes
the keywords below in the case shown, and every other keyword as written.

- ER diagram: `BT`, `direction`, `end`, `LR`, `RL`, `subgraph`, `TB`.
- Gantt chart: `axisFormat`, `dateFormat`, `excludes`, `friday`, `monday`,
  `section`, `tickInterval`, `title`, `weekday`, `weekend`.
- User journey: `section`, `title`.
- Mindmap: `::icon(`.
- Quadrant chart: `quadrant-1`, `quadrant-2`, `quadrant-3`, `quadrant-4`,
  `title`, `x-axis`, `y-axis`.
- Requirement diagram: `analysis`, `class`, `contains`, `copies`,
  `demonstration`, `derives`, `designConstraint`, `direction`, `docRef`,
  `element`, `functionalRequirement`, `high`, `id`, `inspection`,
  `interfaceRequirement`, `low`, `LR`, `medium`, `performanceRequirement`,
  `physicalRequirement`, `refines`, `requirement`, `risk`, `satisfies`, `test`,
  `text`, `traces`, `type`, `verifies`, `verifymethod`.
- Sequence diagram: `activate`, `actor`, `alt`, `and`, `as`, `autonumber`,
  `box`, `break`, `create`, `critical`, `deactivate`, `destroy`, `else`, `end`,
  `link`, `links`, `loop`, `Note`, `of`, `opt`, `option`, `over`, `par`,
  `participant`, `rect`, `right`.
- State diagram: `<<choice>>`, `<<fork>>`, `<<join>>`, `accDescr`, `accTitle`,
  `as`, `class`, `direction`, `end`, `LR`, `note`, `state`, `TB`.
- Timeline: `section`, `TD`, `title`.
- Usecase diagram: `extend`, `include`.
- Venn diagram: `set`, `text`, `title`, `union`.
- XY chart: `bar`, `line`, `title`, `x-axis`, `y-axis`.

The examples use the printed case of each keyword at least twice as often as any
other case: `Note` is written seven times and `note` once, and the other
keywords are never written in another case. [fixture:
er/whitespace-between-tokens/keyword-case-one-form] [fixture:
er/direction/case-one-form] [fixture: er/direction/case-bt-rl-one-form]
[fixture: er/subgraphs/end-case-one-form] [fixture:
gantt/keyword-case/keywords-one-form] [fixture:
gantt/weekday-and-weekend/day-case-one-form] [fixture:
journey/keyword-case/keywords-one-form] [fixture:
mindmap/keyword-case/icon-keyword] [fixture:
quadrant/keyword-case/statement-keywords-one-form] [fixture:
quadrant/keyword-case/quadrant-3-4-one-form] [fixture:
requirement/keyword-case/keywords-one-form] [fixture:
requirement/keyword-case/types-one-form] [fixture:
requirement/fields/field-keywords-case-one-form] [fixture:
requirement/fields/keyword-values-case-one-form] [fixture:
requirement/fields/keyword-values-low-test-analysis-case-one-form] [fixture:
requirement/relationship-spacing/relation-case-one-form] [fixture:
requirement/relationship-spacing/relations-case-one-form] [fixture:
requirement/direction/case-one-form] [fixture:
sequence/whitespace-between-tokens/keyword-case-one-form] [fixture:
sequence/keyword-case/statements-one-form] [fixture:
sequence/keyword-case/blocks-one-form] [fixture:
state/whitespace-between-tokens/keyword-case-one-form] [fixture:
state/whitespace-between-tokens/keyword-case-more-one-form] [fixture:
state/keyword-case/pseudo-states-one-form] [fixture:
state/keyword-case/accessibility-alias-direction-one-form] [fixture:
timeline/keyword-case/keywords-one-form] [fixture:
usecase/arrows/arrows-semantic-case-one-form] [fixture:
venn/keyword-case-and-order/keyword-case-one-form] [fixture:
xychart/keyword-case/statement-keywords-one-form]

A keyword that the table does not list stays as written: one that the examples
do not use (the `todayMarker` of a Gantt chart, the `HIDE EMPTY DESCRIPTION` of
a state diagram), one that the examples use in no case twice as often as in
another, and one whose other case changes the Db or the drawing. A block diagram
reads `COLUMNS` and `SPACE` as ids, a state diagram keeps the `LEFT`, `RIGHT`,
and `OF` of a note in its Db as written, and a note with `LEFT` or `OF` was
drawn differently, an ER diagram keeps the key `PK` or `FK` of an attribute in
its Db as written, a Gantt chart keeps the tags `done` and `crit` and the
`after` of a task, an xychart keeps `horizontal`, and a treeView reads `ICON(…)`
as part of a name. The `style` of an ER diagram, a requirement diagram, and a
Venn diagram, and the `classDef` of an ER diagram, a state diagram, a
requirement diagram, and a quadrant chart stay as written too. Before it reads a
text, mermaid.js removes the last `;` of a line that has a `style` or a
`classDef` in exactly this case, then a `:`, then a `#` after non-blank
characters only, then a `;`. It reads a line with the keyword in another case
with that `;`, so `STYLE A fill:#f00;` has another Db than `style A fill:#f00;`.
The rule reads the line after the directives and the comments are removed, so a
directive that spans lines joins its two sides into one line, and whether
another case reads a line the same cannot be told from the line of the keyword
alone. The quadrant chart rejects some texts that the two cases would read
differently and reads the others the same, and stays as written too. [fixture:
er/whitespace-between-tokens/keyword-case-one-form] [fixture:
state/whitespace-between-tokens/keyword-case-one-form] [fixture:
block/keyword-case/keywords-kept] [fixture: treeview/keyword-case/icon-kept]
[fixture: er/attribute-spacing/keys-case-kept] [fixture:
gantt/keyword-case/tags-case-kept] [fixture:
er/styles-and-classes/keyword-case-kept] [fixture:
er/styles-and-classes/keyword-case-semicolon-line-kept] [fixture:
requirement/styles-and-classes/keyword-case-kept] [fixture:
requirement/styles-and-classes/keyword-case-semicolon-line-kept] [fixture:
state/keyword-case/classdef-semicolon-line-kept] [fixture:
venn/keyword-case-and-order/style-semicolon-line-kept] [fixture:
quadrant/styles/class-definition-keyword-case-kept] [fixture:
quadrant/styles/class-definition-semicolons-case-kept]

In the body of an ER subgraph, mermaid.js lists the keyword of a `class`,
`classDef`, or `style` statement as a node of the subgraph, as written, which is
one more reason why those three keywords keep their case. [fixture:
er/subgraphs/statement-keywords-case-kept]

### Strings between `"`

In cynefin, gitGraph, packet, pie, radar, railroad (the IR, EBNF, and PEG
notations), treeView, treemap, usecase, and wardley diagrams a string can be
written between `'` as well as between `"`, and mermaid.js reads both the same.
The examples write 408 of the 409 strings of these diagram types between `"`;
the one other is the label of a Wardley flow, which is read between `'` only.
The printer writes `"`. The Prettier option `singleQuote` is not read: these ten
diagram types are the only ones that read a string between `'` at all (the
others reject it or read the quote marks as part of the text), and the examples
do not use it. [fixture: cynefin/strings/strings-quotes] [fixture:
gitgraph/quotes/quotes-one-form] [fixture: packet/quotes/quotes-one-form]
[fixture: pie/labels/label-quote-one-form] [fixture:
radar/quotes/quotes-and-empty] [fixture: railroad/quotes/ir-empty-and-text]
[fixture: railroad/quotes/ebnf-empty-and-text] [fixture:
railroad/quotes/peg-empty-and-text] [fixture: treeview/names/name-empty]
[fixture: usecase/labels/label-quote-rewrite-one-form] [fixture:
wardley/names-and-quotes/name-quotes-empty]

A string whose text holds a `'`, a `"`, a backslash, a line break, U+2028,
U+2029, a backquote, `&`, `#`, or `<` stays as written: it would need an escape
between `"`, or it holds a character that mermaid.js reads in a second way (an
entity such as `#35;`, HTML, a Markdown string). The label of a Wardley flow
(`+'moving'>`) stays between `'`. [fixture:
cynefin/strings/single-quote-sensitive-kept] [fixture:
gitgraph/quotes/single-quote-sensitive-kept] [fixture:
packet/quotes/single-quote-sensitive-kept] [fixture:
pie/labels/single-quote-sensitive-kept] [fixture:
radar/quotes/single-quote-sensitive-kept] [fixture:
railroad/quotes/ir-single-quote-sensitive-kept] [fixture:
railroad/quotes/ebnf-single-quote-sensitive-kept] [fixture:
railroad/quotes/peg-single-quote-sensitive-kept] [fixture:
treeview/names/single-quote-sensitive-kept] [fixture:
treemap/names/single-quote-sensitive-kept] [fixture:
usecase/labels/single-quote-sensitive-kept] [fixture:
wardley/names-and-quotes/single-quote-sensitive-kept] [fixture:
wardley/flows/flow-forward]

### Numbers in the shortest form

A number is printed with no `+`, no zero at the end of the fraction, no `.` at
the end, and a `0` before a `.` at the start: `+3` is `3`, `1.50` is `1.5`,
`2.0` is `2`, `3.` is `3`, and `.5` is `0.5`. This holds for the numbers that
mermaid.js reads as numbers, in these places only: the value of a section of a
pie chart; the values of a `bar` and a `line` and the two ends of a range
(`a --> b`) of an xychart, not the categories; the value of a treemap leaf, in
the forms digits, digits with a fraction, and a fraction alone (a leaf with a
sign, with a `.` at its end, or with a `,` or a `_` in it stays as written); the
`max`, `min`, `ticks`, and curve values of a radar chart; the value of a link of
a sankey diagram, not a value in quotes or followed by text; and the size after
the `:` of a Venn set, not the numbers of a `text` or of a style. Of the 300
numbers in these places in the examples, 297 are in this form and 3 (all in
xychart: `49.0`, `103.0`, and `177.0`) have a zero at the end of the fraction.
[fixture: pie/numbers/shortest-form] [fixture:
xychart/numbers/range-numbers-one-form] [fixture:
xychart/numbers/values-one-form] [fixture: treemap/numbers/shortest-form]
[fixture: treemap/numbers/leading-dot] [fixture: radar/numbers/shortest-form]
[fixture: radar/numbers/raw-option-numbers] [fixture:
venn/sizes-and-numbers/absent-zero-signs] [fixture:
venn/sizes-and-numbers/size-spaces] [fixture: sankey/values/shortest-form]
[fixture: sankey/values/shortest-form-with-trivia]

These numbers were also drawn with the settings that write a number as text
(`showData` of a pie chart, `showDataLabel` of an xychart, the value labels of a
treemap, the ticks of a radar chart, the value labels of a sankey diagram with
their prefix and suffix), and the drawings were the same. The value of a sankey
link is made a number by `parseFloat` when the diagram is read
([the grammar action](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L55)),
and the label that shows it is made from that number
([the renderer](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/sankeyRenderer.ts#L178)),
not from the text that was written. A number stays as written where mermaid.js
reads it as text (the `text A 1.50` of a Venn diagram, the value of a style, a
category `007` or `1.50` of the x-axis of an xychart), where it has a zero at
the start of its integer part (`007`), more than 15 digits, an exponent (`1e3`),
or is `-0`, where it is no plain decimal (`abc`, `1_0`, `0x1` as the value of a
sankey link), and in a diagram type that this section does not list: the
coordinates of a Wardley map have a zero at the end of the fraction in 81 of its
168 decimals. [fixture: venn/sizes-and-numbers/text-number-forms] [fixture:
venn/sizes-and-numbers/text-and-style-numbers-kept] [fixture:
xychart/numbers/forms-kept] [fixture:
xychart/numbers/category-trailing-zero-kept] [fixture: pie/numbers/forms-kept]
[fixture: radar/numbers/forms-kept] [fixture: treemap/numbers/forms-kept]
[fixture: treemap/numbers/trailing-dot-kept] [fixture: sankey/values/forms-kept]
[fixture: wardley/numbers/forms-kept]

### The direction of a header

The direction `TD` of an agentflow or swimlane header is printed `TB`, which the
examples use 10 times in agentflow and once in swimlane, and `TD` never; the
swimlane count is a single example. A direction that stands after a directive
which follows the header (`agentflow-beta%%{x}%% TD`) stays as written. A
`direction` statement stays as written in all of them: mermaid.js keeps the
direction of the statement as written in the Db. [fixture:
agentflow/header/header-direction-spelling] [fixture:
agentflow/header/header-direction-after-directive-kept] [fixture:
flowchart/direction/swimlane-header-td-after-directive-kept] [fixture:
flowchart/direction/swimlane-header-td-one-form] [fixture:
flowchart/direction/statement-td-kept-with-other-header] [fixture:
flowchart/direction/statement-values-kept]

The header of a flowchart stays as written, `TB` or `TD`, though the examples
use `TD` 59 times against 5: see
[Versions of mermaid.js](#versions-of-mermaidjs). [fixture:
flowchart/direction/header-tb-kept] [fixture:
flowchart/link-label-form/flowchart-header-both-forms-kept]

### The relationships of an ER diagram

The cardinalities and the line of a relationship are printed as the symbols that
mermaid.js reads the same, whatever the case of the words, and each cardinality
as the symbol of its side. `only one`, `one`, and `1` are `||`; `zero or one`
and `one or zero` are `|o` on the left and `o|` on the right; `zero or more`,
`zero or many`, `many`, `many(0)`, and `0+` are `}o` on the left and `o{` on the
right; `one or more`, `one or many`, `many(1)`, and `1+` are `}|` on the left
and `|{` on the right. A symbol written on the other side is printed as the
symbol of its side: `o|` on the left is `|o`, and `o{` on the left is `}o`. The
line `to` is `--`, and the lines `optionally to`, `.-`, and `-.` are `..`. The
cardinality `u` has no symbol and stays as written, and so does a relationship
with a directive between its units. The examples write the symbols 84 times and
the words and the other forms 6 times (`only one` once, `zero or more` twice,
`many(0)` once, `0+` once, and `1` once), and the line as `--` 39 times against
`to` twice and as `..` 3 times against `optionally to` once. [fixture:
er/relationship-spacing/words-to-symbols] [fixture:
er/relationship-spacing/cardinality-words-case-one-form] [fixture:
er/relationship-spacing/entity-only-before-cardinality] [fixture:
er/relationship-spacing/directive-between-word-units-kept] [fixture:
er/relationship-spacing/symbols-on-the-other-side]

### The length of an arrow

The line of an arrow of a block diagram is printed in its shortest form, and so
is the arrow between the two texts of an axis of a quadrant chart (see
[Edges](./block.md#edges) and [Axes](./quadrant.md#axes)): `--->` is `-->`,
`-----` is `---`, `<--->` is `<-->`, `-..->` is `-.->`, and `====>` is `==>`.
The length of the line is no part of the Db of either, and the examples write
the shortest form only (`-->` nine times and `--` once in the block page, `-->`
six times in the quadrant page). Drawn in Chromium, the solid, open,
bidirectional, dotted, and labelled arrows gave the same SVG in the ten versions
from 10.9.0 to 12.3.0 that have a block diagram, `==>` and `====>` gave the same
SVG from 11.15.0, which first reads a thick line (the versions before it reject
both), and the axes `--->` and `-->` of a quadrant chart gave the same SVG in
the twelve versions from 10.3.1 to 12.3.0 that have the chart, also with no text
after the arrow, whose Db holds the same text for both. The four block inputs
and the two quadrant inputs of the corpus that the printer changes were read
with the same Db and drawn the same by every version that reads them. These stay
as written, since a version draws them differently: an arrow that ends in `x` or
`o` (10.9.0, 11.0.0, and 11.4.1 draw `---x` and `--x`, and `---o` and `--o`,
differently), a thick line without an end arrow (the versions before 11.15.0
read `===` and `====` as two ids that differ), and a line of `~` (an id). The
length of the link of a flowchart is not one of these: it asks for a link that
spans more ranks (see
[What else stays as written](#what-else-stays-as-written)). [fixture:
block/edges/arrow-length-shortest] [fixture:
block/edges/arrow-length-kept-where-drawn-differently] [fixture:
quadrant/axes/arrow-length-shortest]

### Other spellings of a keyword or of a punctuation mark

gitGraph reads `switch` as `checkout`; the examples write `checkout` 160 times
and never `switch`, so `switch` is printed `checkout`. C4 reads `Rel_Up`,
`Rel_Down`, `Rel_Left`, and `Rel_Right` as `Rel_U`, `Rel_D`, `Rel_L`, and
`Rel_R`; the examples write `Rel_U` once and `Rel_R` once and none of the long
forms, so the long forms are printed short, and `Rel_Back` and `BiRel` stay. The
EBNF notation of a railroad diagram reads `::=` as `=`; the examples write `=`
35 times and `::=` never, so `::=` is printed `=`. A range of a packet diagram
that starts and ends at the same position is the position alone; the examples
write the position alone 7 times and the range with equal ends never, so `4-4`
is printed `4`, unless something other than whitespace and the `-` lies between
the ends. [fixture: gitgraph/checkout-aliases/alias-one-form] [fixture:
c4/argument-forms/relationship-direction-long-forms] [fixture:
railroad/assignment/ebnf-assignment-equals] [fixture:
packet/block-forms-and-order/equal-range-single]

### The colon after a header

A cynefin or a radar diagram reads `cynefin-beta:` and `radar-beta:` as the
header without the colon. The examples write the header without the colon 3
times in each, and with it never, so the colon is removed, and what follows it
on the line goes to the next line as it does after a header without the colon.
The colon stays where a `;` or the `---` of a hidden YAML block touches it.
[fixture: cynefin/header/colon-removed] [fixture:
cynefin/header/colon-semicolon-kept] [fixture: radar/header/colon-removed]
[fixture: radar/header/colon-yaml-kept]

A gitGraph without a direction reads `gitGraph:` and `gitGraph` the same in
every version that counts, with the same commits and branches and the same
figure. The examples write the header without the colon 30 times and with it
twice (counted over the `mermaid-example` blocks of
`packages/mermaid/src/docs/syntax/gitgraph.md` of the pinned version, after the
frontmatter of a block; the other lines of the file that start with `gitGraph:`
are the key of the configuration in a frontmatter), so the colon is removed:
`gitGraph:` is printed `gitGraph`, and what follows it on the line goes to the
next line. The colon stays after a direction, since every version that counts
rejects `gitGraph LR` and `gitGraph TB` without it (10.9.8 does not read `BT`
either way). It stays too where a directive or a hidden YAML block stands
between the keyword and the colon: the examples write no such header, and 10.9.8
rejects `gitGraph %%{x}%%` followed by a statement on the next line, which it
accepts with the colon. A directive, a comment, or a hidden form after the colon
does not keep it: `gitGraph:%%{}%% commit%%{}%%`, `gitGraph: %% note`, and
`gitGraph: %%{}%%` followed by a statement are drawn the same by the ten
versions, with and without the colon. [fixture: gitgraph/header/header-colon]
[fixture: gitgraph/header/header-colon-comment] [fixture:
gitgraph/header/header-colon-hidden-statement] [fixture:
gitgraph/header/header-colon-directive-line] [fixture:
gitgraph/header/header-colon-tab-blank-lines] [fixture:
gitgraph/header/header-hidden-before-colon] [fixture: gitgraph/header/header-lr]
[fixture: gitgraph/header/header-tb] [fixture: gitgraph/header/header-bt]

### The label of a link

A label can be written between two arrows (`-- text -->`) or between `|` after
the arrow (`-->|text|`), and mermaid.js reads both the same. The form is the one
that the examples of the diagram type use at least twice as often as the other:
an agentflow diagram has 2 links of the first form and none of the second, so
its label is printed between the arrows, for the arrows `-->` and `--x`, which
it reads in the first form; a swimlane diagram has none of the first form and 12
of the second, so its label is printed between `|`, for the eight arrows of a
flowchart; a flowchart has 14 of the first form and 8 of the second, which is
not twice as often, and stays as written. The label must be plain text (letters,
digits, spaces, `_`, `,`, `?`, and `!`); a label with a `|` or a `%%`, a string,
a Markdown label, a label of blanks only, and an empty label stay as written.
[fixture: agentflow/edge-labels/pipes-to-arrows] [fixture:
agentflow/edge-labels/blank-pipe-label-kept] [fixture:
flowchart/link-label-form/swimlane-arrows-to-pipes] [fixture:
flowchart/link-label-form/flowchart-header-both-forms-kept] [fixture:
flowchart/link-label-form/kept]

### A description block on one line

mermaid.js reads `accDescr {text}` and `accDescr: text` as the same accessible
description, the text without the whitespace at its ends, and draws the same
figure from both
([the grammar of the flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L33-L37)
has a rule for each form and
[trims the text](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L390-L391)
of both). The examples write a description after the colon 3 times (a swimlane
diagram and two state diagrams), in a block over several lines twice (two use
case diagrams), and in a block on one line never. Every diagram type that
accepts a block with text accepts the form with the colon as well, and the
statement is the same in all of them, so their examples are counted together, as
they are for strings and numbers. Three diagram types are not among them: a
block diagram accepts only an empty block, an ishikawa diagram reads both forms
as nodes and gives the description no text, and an event modeling diagram stores
the token as it is written, so that the description is ` accDescr {a}` in one
form and ` accDescr: a` in the other. A block with a text of one line is printed
in the form with the colon, on a line of its own: `accDescr {a}`,
`accDescr { a }`, and `accDescr{ a }` become `accDescr: a`. The keyword and the
`{` can stand apart in any whitespace, a line break included, and so can the
text and the braces: `accDescr {`, `a`, and `}` on three lines are `accDescr: a`
too. A `;` after the `}` is dropped like any `;` that separates statements. The
text can hold a `{`, a `:`, a `#`, a directive, and any whitespace character
that is no line break (a no-break space, U+3000, a vertical tab, a form feed,
U+FEFF, U+2028, or U+2029), and a run of spaces and tabs in it is printed by the
rule of
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same).
A directive stays where it is, and the block is printed as the same text written
with the colon is. A directive after the text, inside the braces or after the
`}`, and a directive before the statement on its line, keep one space before
them where the source has whitespace there. A directive before the `{` or
between the `{` and the text gets the whitespace that the form with the colon of
the diagram type prints next to a directive, which differs by diagram type:
`accDescr { %%{init: {}}%% a }` is printed `accDescr: %%{init: {}}%%a` in an
agentflow, C4, class, ER, flowchart, Gantt, user journey, quadrant, requirement,
sequence, state, swimlane, timeline, and XY chart diagram (14 diagram types),
and `accDescr: %%{init: {}}%% a` in an architecture, cynefin, gitGraph, info,
packet, pie, radar, railroad, treemap, treeView, use case, and wardley diagram
(the other 12); `accDescr %%{init: {}}%% {c}` is printed
`accDescr %%{init: {}}%%: c` in a flowchart, an agentflow, and a swimlane
diagram and `accDescr%%{init: {}}%%: c` in the other 23. Each of these is the
output of the same text written with the colon. [fixture:
class/multi-line-values/block-with-directive-before-the-text] [fixture:
class/multi-line-values/colon-with-directive-before-the-text] [fixture:
pie/accessibility-lines/block-with-directive-before-the-text] [fixture:
pie/accessibility-lines/colon-with-directive-before-the-text] [fixture:
flowchart/accessibility-lines/block-with-directive-before-the-text] [fixture:
flowchart/accessibility-lines/colon-with-directive-before-the-text] [fixture:
flowchart/accessibility-lines/block-tight-text] [fixture:
flowchart/accessibility-lines/block-spaced-text] [fixture:
flowchart/accessibility-lines/block-left-padding-only] [fixture:
flowchart/accessibility-lines/block-right-padding-only] [fixture:
flowchart/accessibility-lines/block-text-with-semicolons-padded] [fixture:
flowchart/accessibility-lines/block-text-starts-with-brace] [fixture:
flowchart/accessibility-lines/block-text-with-colon-and-hash] [fixture:
flowchart/accessibility-lines/block-runs-collapsed] [fixture:
flowchart/accessibility-lines/block-text-with-line-break-before-the-brace]
[fixture: flowchart/accessibility-lines/block-directive-inside-text] [fixture:
flowchart/accessibility-lines/block-text-beside-directive] [fixture:
pie/description-blocks/block-asymmetric] [fixture:
pie/description-blocks/block-keyword-tab] [fixture:
pie/description-blocks/block-opener-newline] [fixture:
pie/description-blocks/block-text-on-its-own-line] [fixture:
pie/description-blocks/block-with-directive-after-the-text] [fixture:
usecase/direction-and-accessibility/block-text-on-its-own-line] [fixture:
sequence/multi-line-values/accdescr-block-closing-brace-after-text] [fixture:
c4/description-blocks/opener-whitespace-dropped] [fixture:
c4/description-blocks/block-after-directive] [fixture:
treemap/description-blocks/block-after-directive] [fixture:
treeview/description-blocks/block-after-directive] [test: U+2028 between the
keyword and the brace of a flowchart description block] [test: a no-break space
inside the text of a flowchart description block] [test: U+3000 inside the text
of a flowchart description block] [test: a vertical tab inside the text of a
flowchart description block] [test: a form feed inside the text of a flowchart
description block] [test: U+FEFF inside the text of a flowchart description
block] [test: U+2028 in the text of a flowchart description block] [test: U+2029
in the text of a flowchart description block] [test: U+2028 before the text of a
flowchart description block] [test: U+2028 after the text of a flowchart
description block]

A comment after the `}` stays after the text in the diagram types that end the
text of the form with the colon before a `%%`, as the list below says. A
statement that follows the block on its line goes to a line of its own, as any
statement does, where the line does not keep its statements together:
`accDescr { %%{init: {}}%% a } A` is `accDescr: %%{init: {}}%%a` and `A`, on two
lines. A block on a line that keeps its statements together is printed in the
form with the colon where it is the last statement of the line and only
whitespace, comments, and directives follow it: `A --> B; accDescr {a;b}` is
`A --> B; accDescr: a;b`, and in a C4 diagram a block after an empty block,
`accDescr {}accDescr {D}`, is `accDescr {}accDescr: D`. In a treeView diagram
drawn with branch characters (a box), the characters of the drawing before the
keyword and between the keyword and the `{` are redrawn, not printed, so they do
not keep the block. [fixture:
flowchart/accessibility-lines/block-last-on-a-line-with-a-semicolon] [fixture:
flowchart/accessibility-lines/block-text-with-semicolon] [fixture:
c4/description-blocks/block-after-an-empty-block] [fixture:
treeview/modes/ordinary-block] [fixture:
treeview/modes/box-common-block-zero-column] [fixture:
treeview/description-blocks/box-redraw-remove-opener-prefixes] [fixture:
flowchart/accessibility-lines/block-with-directive-before-the-text-then-statement]
[fixture:
usecase/direction-and-accessibility/block-text-on-its-own-line-runs-collapsed]
[fixture: treeview/description-blocks/block-text-on-its-own-line-runs-collapsed]
[fixture:
usecase/direction-and-accessibility/block-directive-line-after-the-text] [test:
accessibility blocks: pie brace-after-ls-direction-converted]

The block stays as written where the form with the colon would not hold what the
block holds, or would not be read as the block is:

- The text is over several lines: the form with the colon is one line. [fixture:
  er/accessibility-statements/block-lines-kept] [fixture:
  pie/description-blocks/block-inline-leading-lines] [fixture:
  pie/description-blocks/block-columns]
- The diagram type reads a line with `direction` as the direction of the diagram
  (a flowchart, swimlane, agentflow, class, state, ER, requirement, C4, or use
  case diagram), and the text holds `direction` out of the reach of that rule.
  The lexer reads a line from its start with `.*direction\s+RL[^\n]*`, and the
  rule does not reach past a line terminator (LF, CR, U+2028, or U+2029). A
  block whose text stands after a line terminator that follows the keyword, or
  precedes the `}`, has the description `direction RL`, as has a block whose
  word `direction` a directive splits (mermaid.js removes a directive before it
  reads the line); the form with the colon puts the text on the line of the
  keyword. In a class diagram, a state diagram, and a C4 diagram the rule comes
  before `accDescr`, so `accDescr: direction RL` sets the direction and has an
  empty description, or, in a C4 diagram, is rejected. In a flowchart, an
  agentflow diagram, an ER diagram, and a requirement diagram it comes after, so
  `accDescr: direction RL` is the description at the start of a line and a
  direction line when the line is indented, which the printer does for the
  statements of a body. [fixture:
  class/multi-line-values/block-direction-on-its-own-line-kept] [fixture:
  class/multi-line-values/block-brace-on-the-next-line-direction-kept] [fixture:
  state/multi-line-values/block-direction-on-its-own-line-kept] [fixture:
  state/multi-line-values/block-on-a-line-with-a-semicolon-brace-on-the-next-line-direction-kept]
  [fixture: c4/description-blocks/acc-block-direction-keep] [fixture:
  c4/description-blocks/block-after-an-empty-block-brace-on-the-next-line-direction-kept]
  [fixture:
  er/accessibility-statements/block-direction-split-by-a-directive-kept]
  [fixture: requirement/accessibility-statements/first-column-kept] [fixture:
  requirement/accessibility-statements/block-brace-on-the-next-line-direction-kept]
  [test: accessibility blocks: class brace-after-ls-direction-kept] [test:
  accessibility blocks: class text-between-ls-direction-kept] [test:
  accessibility blocks: er text-between-ps-direction-kept] [test: accessibility
  blocks: requirement brace-after-ps-direction-kept]
- A directive stands before the `{` or between the `{` and the text, and the
  block is over several lines, or another statement follows it on a line that
  keeps its statements together (see
  [Lines that hold a `;`](#lines-that-hold-a-): a C4 line that holds a block
  beside an empty block is such a line). The printer writes such a block with
  the colon only where it stands on one line and its line does not keep its
  statements together; elsewhere it prints the block as a block, and a second
  pass changes nothing. [fixture:
  flowchart/accessibility-lines/block-with-directive-before-the-text-over-lines]
  [fixture:
  flowchart/accessibility-lines/block-with-directive-before-the-text-on-a-kept-line]
- A comment follows the `}` on its line, in an agentflow, C4, Gantt, user
  journey, quadrant, requirement, sequence, state, timeline, or XY chart
  diagram. These diagram types take the `%%` as part of the text of the form
  with the colon, so `accDescr: a %% c` has the description `a %% c`, while the
  block `accDescr {a} %% c` has `a`. In the diagram types that end the text of
  the form with the colon before a `%%` (the next but one sentence), both forms
  have `a`, and the block is printed in the form with the colon. A class, ER,
  flowchart, swimlane, or use case diagram rejects a block with a comment after
  it. [fixture: sequence/multi-line-values/block-then-comment-kept] [fixture:
  pie/description-blocks/block-then-comment] [fixture:
  pie/description-blocks/block-trailing-comment] [fixture:
  info/comments/comments-inline]
- The block has no text, or only a directive: it is printed `accDescr {}`, as
  [Accessibility lines](./flowchart.md#accessibility-lines) says. [fixture:
  flowchart/accessibility-lines/empty-block-tight] [fixture:
  flowchart/accessibility-lines/empty-block-spaced] [fixture:
  flowchart/accessibility-lines/empty-block-directive-kept]
- The block is not closed. [fixture:
  flowchart/accessibility-lines/block-unclosed]
- The block is on a line that keeps its statements together, and a statement, or
  a `;`, follows it on that line, or the line is one that the line rule of
  mermaid.js reads (see [Lines that hold a `;`](#lines-that-hold-a-)). The form
  with the colon runs to the end of the line, so a statement after it would
  become part of its text. [fixture:
  flowchart/accessibility-lines/block-before-another-statement-on-a-kept-line]
  [fixture: flowchart/accessibility-lines/block-on-style-line-kept] [fixture:
  c4/statements-one-per-line/description-null-adjacency]
- The text holds a `%%`, or a U+2028 or U+2029, in an architecture, cynefin,
  gitGraph, info, packet, pie, radar, railroad, treemap, treeView, or wardley
  diagram. These diagram types read the description with
  [one terminal of the common grammar](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/common.langium#L14),
  which ends the text of the form with the colon before a `%%` and reads the
  rest of the line as a comment, but takes a `%%` in a block as part of the
  text: `accDescr: a %% b` has the description `a`, and `accDescr {a %% b}` has
  `a %% b`. A block there also drops the whitespace around a line separator:
  `accDescr { A<U+2028> B }` has the description `A<U+2028>B` in a pie chart and
  a gitGraph, and `accDescr: A<U+2028> B` has `A<U+2028> B`. The other diagram
  types take the `%%` and the line separator as part of the text in both forms,
  and the block is printed in the form with the colon also when the text holds
  one. [fixture: pie/description-blocks/block-text-with-percent-kept] [fixture:
  flowchart/accessibility-lines/block-text-with-percent] [test:
  pie/line-terminators-and-unicode/unicode-values]
- The diagram is a state diagram and a U+2028 or U+2029 stands in the block: the
  state diagram prints a line that holds one as it is written (see
  [State lines that hold a line separator](#state-lines-that-hold-a-line-separator)).
  [test: accessibility blocks: state text-with-ls-kept]
- The diagram is an event modeling diagram, whose description is kept whole (see
  [Description blocks](./eventmodeling.md#description-blocks)), or an ishikawa
  diagram, which reads `accDescr {a}` and `accDescr: a` as nodes with no
  description (the Db of both has an empty `accDescr`): the printer does not
  change the form. [corpus fixture: ishikawa/db-accdescr-block-is-nodes] [corpus
  fixture: ishikawa/db-accdescr-is-node] [fixture:
  ishikawa/node-text/values-opaque]
- In a treeView diagram drawn with branch characters (a box), the text holds a
  character of the drawing, such as `x─`, which the diagram reads as the box, or
  the box keeps the characters between the keyword and the `{`. [fixture:
  treeview/modes/block-interior-active]

mermaid.js 12.3.0 read both spellings of each of the 3 examples that write a
description after a colon, written again as a block: both were accepted, with
the same Db and the same SVG. A description was also inserted, in both
spellings, into 2 examples of each of 22 diagram types, into 1 example of the
info and of the user journey diagram types, and into 3 more examples of the
gitGraph, which makes 49 pairs. The two SVGs were the same in the 44 pairs of
the other diagram types (in 6 of them once the generated ids were taken away),
and in the 5 pairs of the gitGraph once the numbers, the commit ids, and the
element ids were taken away. A text with a `%%` in it was inserted the same way
into examples of 13 of the diagram types that take the `%%` as part of the text,
which makes 26 pairs, and the SVGs were the same in all of them. No railroad
diagram was drawn; those were compared by Db only.

The rules of the second list were found by inserting the block and the form with
the colon into one accepted example of each of 25 diagram types (every type with
a description block but the block diagram and the event modeling diagram), 3
examples for most. With a text of a no-break space, U+3000, a vertical tab, a
form feed, U+FEFF, U+2028 (alone), U+2029 (alone), a tab, a run of spaces, or a
`;` in it, and with a directive inside the text, before the `{`, or between the
`{` and the text, the Db was the same in all 25 types. With the text on a line
of its own it was the same in all 25 types, but for a `direction` in a class
diagram, a state diagram, and a C4 diagram, and for a line that starts with
`%%`, which 11 of the types read as a comment, so that the block has no text. A
comment after the `}` made the Db differ in 10 types, none in the 11 types that
end the text before a `%%`, and mermaid.js rejected it in 4. In the conformance
corpus, formatting writes the form with the colon for 544 blocks in 533
fixtures. In 483 of them the Db of mermaid.js is the same, 41 are inputs that
mermaid.js rejects, and 9 differ in the whitespace of a title, a description, or
a style, which the sections
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)
and [Styles that are drawn the same](#styles-that-are-drawn-the-same) define. 71
pairs of the fixtures of the formatter that change were drawn, and the SVGs were
the same in the 68 that mermaid.js draws.

### The quotes of a text

mermaid.js reads some texts the same with and without quotes: the source of a
link of a sankey diagram has the same id in `"a b",c,1` and in `a b,c,1`, since
[the action of a record](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L53-L55)
drops the spaces at the ends of a field and reads `""` as `"` for a field of
both forms. The form is the one that the examples of the diagram type use at
least twice as often as the other, and a text is printed in it when both forms
read it the same; any other text stays as written. The fields, with the number
of the examples that write each in each form, are:

| Diagram type | Field                                         | Without quotes | In quotes |
| ------------ | --------------------------------------------- | -------------: | --------: |
| sankey       | the source of a link                          |             87 |         0 |
| sankey       | the target of a link                          |             83 |         4 |
| sankey       | the value of a link, in its own shape         |             87 |         0 |
| ER           | the name of an entity                         |             39 |         2 |
| ER           | the role of a relationship                    |             43 |         2 |
| ER           | the left name of a relationship               |             45 |         0 |
| ER           | the right name of a relationship              |             45 |         0 |
| ER           | the id of a subgraph                          |             11 |         1 |
| requirement  | the name of a requirement                     |             15 |         1 |
| requirement  | the name of an element                        |             10 |         0 |
| requirement  | the id of a requirement                       |             16 |         0 |
| requirement  | the text of a requirement                     |             13 |         3 |
| requirement  | the type of an element                        |              9 |         1 |
| requirement  | the docRef of an element                      |              2 |         0 |
| requirement  | the left name of a relationship               |             14 |         0 |
| requirement  | the right name of a relationship              |             14 |         0 |
| requirement  | a class, and the names of `style`             |              9 |         0 |
| Wardley map  | the name of a component                       |             46 |         7 |
| Wardley map  | the name of an anchor                         |              5 |         0 |
| Wardley map  | the names of a link                           |             50 |        12 |
| Wardley map  | the name of an evolve, a pipeline             |              5 |         2 |
| Wardley map  | the name of a stage of an evolution           |             20 |         0 |
| Wardley map  | the name of an accelerator or a deaccelerator |              0 |         4 |
| Wardley map  | the name of a pipeline component              |              0 |         4 |
| gitGraph     | the name of a branch                          |             84 |         0 |
| gitGraph     | the branch of a checkout or a switch          |            160 |         0 |
| gitGraph     | the branch of a merge                         |             49 |         0 |
| quadrant     | the text of an x-axis                         |              6 |         0 |
| quadrant     | the start of a y-axis                         |              3 |         0 |
| quadrant     | the end of a y-axis                           |              2 |         1 |
| quadrant     | the text of a quadrant                        |             12 |         0 |
| quadrant     | the name of a point                           |             12 |         0 |
| XY chart     | the title of a chart                          |              0 |         8 |
| XY chart     | the title of an x axis                        |              0 |         2 |
| XY chart     | the title of a y axis                         |              0 |         8 |
| XY chart     | the title of a line                           |              0 |         3 |
| XY chart     | a category                                    |             38 |        17 |
| venn         | the name of a set, in a list of sets          |             50 |         0 |
| venn         | the label of a set or a union                 |              0 |        22 |
| venn         | the id of a text without targets              |              6 |         0 |
| venn         | the label of a text without targets           |              0 |         6 |
| venn         | the target of a style                         |              4 |         0 |
| venn         | the value of a style property                 |              3 |         0 |
| use case     | the name of an actor                          |             21 |         0 |
| use case     | the name of a use case                        |              8 |         1 |
| use case     | the source of a relationship                  |             66 |         0 |
| use case     | the target of a relationship                  |             66 |         0 |
| use case     | the name of a system boundary                 |              7 |         2 |
| use case     | the target of a metadata update               |              4 |         0 |
| use case     | the key of a metadata property                |             16 |         0 |
| use case     | the type of an actor, a boundary, an update   |              7 |         0 |
| use case     | the animation of an edge                      |              2 |         0 |
| use case     | the label of an actor, between parentheses    |              1 |        12 |
| use case     | the label of a use case, between parentheses  |              1 |        27 |
| use case     | the title of a system boundary with an id     |              0 |         2 |
| use case     | the label of a split association              |              1 |         3 |
| use case     | the label of a note                           |              0 |         1 |
| use case     | the icon of an actor                          |              0 |         2 |
| use case     | the label of a use case, between brackets     |              6 |         0 |
| architecture | the label of a group                          |              6 |         0 |
| architecture | the label of a service                        |             30 |         0 |
| mindmap      | the text of a shape                           |             21 |         0 |
| kanban       | the text of a shape                           |             19 |         0 |
| C4           | the alias of an element or a boundary         |             73 |         0 |
| C4           | the alias of an element, in an update         |              2 |         0 |
| C4           | the source of a relationship                  |             35 |         0 |
| C4           | the target of a relationship                  |             35 |         0 |
| C4           | the source of a relationship, in an update    |             31 |         0 |
| C4           | the target of a relationship, in an update    |             31 |         0 |
| C4           | the label                                     |              1 |       107 |
| C4           | the technology                                |              0 |        43 |
| C4           | the type of a boundary or a node              |              0 |        14 |
| C4           | the description of an element                 |              0 |        46 |
| flowchart    | the name of a subgraph                        |             53 |         1 |
| flowchart    | the label of a shape                          |            109 |         8 |
| flowchart    | the label of a link                           |             32 |         1 |
| flowchart    | the title of a subgraph                       |              6 |         0 |
| agentflow    | the name of a flow                            |             17 |         0 |
| agentflow    | the name of a connector                       |              2 |         0 |
| agentflow    | the title of a connector                      |              0 |         2 |
| agentflow    | the label of a shape                          |              0 |        47 |
| agentflow    | the title of a flow                           |              0 |        17 |
| agentflow    | the label of a link                           |              2 |         0 |
| class        | the name of a class                           |            178 |         4 |
| class        | the name of a namespace                       |             11 |         0 |

The name of an actor, of a use case, and of a system boundary is counted where
it has no label or title of its own, since a name in quotes cannot have one;
counting every name gives 35 / 0 for an actor, 44 / 1 for a use case, and 9 / 2
for a system boundary. The rows of a flowchart count the examples of a swimlane
diagram too, which write 59 labels of shapes, 12 labels of links, and 4 titles
of subgraphs without quotes, and none in quotes.

A text is printed without quotes where it is plain: ASCII letters, digits, `_`,
`-`, and `.`, with spaces between them, and, in a sankey diagram, with spaces at
its ends, which the field drops. The source and the target of a link of a sankey
diagram may also hold `&`, `<`, `>`, `'`, `/`, and `\`, as `R&D` and `it's` do.
The sankey lexer takes any printable character of ASCII but `"` and `,` into a
field without quotes, and the Db of a source and of a target that holds one of
these characters, alone or inside a text, is the same with and without quotes;
the value of a link was not compared with them, and stays as written. A
character of another kind is not one that every stage reads the same: `%%`
starts a comment or a directive, `#` starts an entity, `;` takes part in the
line rule of `style` and `classDef` lines, and a line break ends the record. So
a text with any of them, or with a `,` or a `"`, stays in quotes, and so does a
string with a directive or a comment region inside it. [fixture:
sankey/quotes/plain-text-without-quotes] [fixture:
sankey/quotes/plain-text-with-spaces-without-quotes] [fixture:
sankey/quotes/spaces-at-the-ends-left-out] [fixture:
sankey/quotes/symbols-without-quotes] [fixture:
sankey/quotes/comma-and-doubled-quotes-kept] [fixture:
sankey/quotes/other-characters-keep-the-quotes] [fixture:
sankey/values/forms-kept] [fixture:
sankey/quotes/values-in-quotes-without-quotes] [fixture:
sankey/directives/inside-fields-kept] [fixture:
sankey/multi-line-strings/string-over-lines]

In an ER diagram a text is printed without quotes where it is a word of ASCII
letters, digits, and `_` that starts with a letter or a `_`, with a single `-`
allowed between its parts (`LINE-ITEM`, `a-1`), and the word, or the part before
its first `-`, is none of the words that the lexer reads as a unit of its own,
in any case: `erDiagram`, `style`, `classDef`, `class`, `subgraph`, `end`,
`one`, `many`, `only`, `zero`, `optionally`, `or`, `to`, `accTitle`, `accDescr`,
`direction`, `TB`, `BT`, `RL`, `LR`, `PK`, `FK`, `UK`, `u`, and `o`. A `-` ends
a keyword, so `end-x` is `end` and `-x`. A name of other characters, such as a
space, a `.`, or a letter outside ASCII, a name with a `-` at its start or its
end or two together (`-a`, `a-`, `a--b`), a name that starts with a digit, which
the lexer can read as a number or a cardinality, and a title of a subgraph,
whose names mermaid.js joins with one space, stay as written. So does a name
that ends with `direction` or starts with `TB`, `BT`, `RL`, or `LR`, in any
case, since the lexer reads `direction`, white space (a line break too), and the
name of a direction as one line, which a name without quotes would join with the
line before or after it. [fixture: er/entities/plain-names-without-quotes]
[fixture: er/entities/hyphenated-names-without-quotes] [fixture:
er/entities/names-that-need-quotes] [fixture:
er/entities/names-next-to-a-direction-line] [fixture: er/entities/alias-tight]
[fixture: er/statements-one-per-line/relationships] [fixture:
er/statements-one-per-line/role-then-entity] [fixture:
er/subgraphs/quoted-and-number-ids]

In a requirement diagram a name, a class, and the names of a `style`,
`classDef`, or `class` statement are printed without quotes where they are one
word of ASCII letters, digits, and `_` that is none of the words that the lexer
reads as a unit of its own (the keywords, the kinds of a requirement and of a
relationship, the risks, the verification methods, the directions, in any case),
and the id, the text, the type, and the docRef where they are words with spaces
between them whose first word is none of those words: `text: "the test text"` is
printed `text: the test text`, and `text: "risk high"` stays in quotes, since a
text that starts with `risk` is read as the field `risk`. A name that ends with
`direction` or starts with `TB`, `BT`, `RL`, or `LR`, in any case, stays in
quotes too, since the lexer reads `direction`, white space (a line break too),
and the name of a direction as one line, which a name without quotes would join
with the line before or after it. [fixture:
requirement/names/plain-names-without-quotes] [fixture:
requirement/names/names-that-need-quotes] [fixture:
requirement/names/names-next-to-a-direction-line] [fixture:
requirement/fields/plain-values-without-quotes] [fixture:
requirement/class-lists/string-classes] [fixture:
requirement/styles-and-classes/style-names]

In a Wardley map a text is printed without quotes where it is words of ASCII
letters, digits, and `_` that start with a letter, with one space between them,
and it does not start with a word that the lexer reads as a unit of its own,
without a boundary and in lower case: `build`, `buy`, `outsource`, `market`,
`size`, `evolution`, `anchor`, `component`, `label`, `inertia`, `evolve`,
`pipeline`, `note`, `annotation`, `accelerator`, `deaccelerator`, `title`,
`accTitle`, and `accDescr`, so that `"buyer"` stays in quotes, as does
`"title x"` but not `"Title x"`. The names of an accelerator, a deaccelerator,
and a component of a pipeline are printed in quotes. A name with a `-` stays as
written, since 11.14.0, the first release with the diagram type, rejects it
without quotes (see [Versions of mermaid.js](#versions-of-mermaidjs)). Two names
of a link without an arrow, `"A" "B"`, would be read as one name without quotes,
and the `---` of a hidden YAML block next to a name would join the name, so
these keep their quotes. [fixture:
wardley/names-and-quotes/plain-names-without-quotes] [fixture:
wardley/names-and-quotes/names-that-need-quotes] [fixture:
wardley/links/link-no-arrow] [fixture: wardley/pipeline/pipeline-depth]

In a gitGraph a branch is printed without quotes where it is ASCII letters,
digits, and `_` with `-`, `.`, and `/` between them, starting with a letter or
`_` (a digit can start a number), ending with a letter, a digit, or `_`, and not
starting with `title`, which the line of a title takes, or with one of the words
that the lexer reads as a unit of its own, in any case, before a character that
is no part of a word: older versions of mermaid.js compare them in any case, and
read `commit-x` as the word `commit` and `-x`. So `"develop"` and
`"feature/login"` lose their quotes, and `"commit"`, `"Merge"`, `"titleA"`,
`"1st"`, `"release/1."`, and a name with a space keep them. [fixture:
gitgraph/references/plain-names-without-quotes] [fixture:
gitgraph/references/names-that-need-quotes] [fixture:
gitgraph/references/reference-forms]

In a quadrant chart a text is printed without quotes where it is words of ASCII
letters that end in digits, with one space between them, whose parts may be
joined by a single `-`, and none of the parts is `title`, `classDef`,
`accTitle`, `accDescr`, or a word that starts with `quadrant` (in any case), and
the text holds no `x-axis` or `y-axis`: the lexer reads a `-` as the end of a
word, so a part after it starts a word, and `my-x-axis` holds the keyword
`x-axis`. The lexer reads a letter after a digit or a `_` as the start of a word
again, so a text with a `_`, a digit in the middle of a word, a number at its
start or after a `-`, or a `-` at its start or its end or two together stays in
quotes. [fixture: quadrant/quotes/plain-texts-without-quotes] [fixture:
quadrant/quotes/texts-with-hyphens-without-quotes] [fixture:
quadrant/quotes/texts-that-need-quotes] [fixture: quadrant/points/string-names]
[fixture: quadrant/axes/strings]

In an XY chart a text is one word of ASCII letters, digits, `_`, and `-`, with
no space: mermaid.js drops the spaces of a text without quotes, so a text of
several words is not the same in quotes. The title of a chart, of an axis, and
of a line is printed in quotes, and a category without quotes where none of the
words that the lexer reads as a unit of its own starts where a run of letters
starts (at the start of the text, and after a digit, a `_`, or a `-`), in any
case: `title`, `xychart-beta`, `xychart`, `x-axis`, `y-axis`, `line`, and `bar`
where no letter, digit, or `_` follows them, and `vertical` and `horizontal`
wherever they start. So `"a-line"` and `"Line"` keep their quotes, and `"line1"`
and `"Barcelona"` lose them. The title of a bar, which the examples do not
write, stays as written, and so does a title that touches a unit other than its
keyword. [fixture: xychart/quotes/titles-in-quotes] [fixture:
xychart/quotes/categories-without-quotes] [fixture:
xychart/quotes/categories-that-need-quotes] [fixture:
xychart/quotes/texts-of-several-words] [fixture:
xychart/quotes/bar-titles-as-written] [fixture:
xychart/quotes/texts-on-a-kept-line-as-written] [fixture:
xychart/text-units/hyphen-and-number-touching-kept]

In a venn diagram a name is printed without quotes where it is ASCII letters,
digits, `_`, and `-` that starts with a letter or a `_`, and does not start with
a word that the lexer reads as a unit of its own, in any case, before a
character that is no letter, digit, or `_` (`venn-beta`, `set`, `union`, `text`,
`style`; `-` is such a character, so `set-a` starts with `set`), and is not
`title`, which starts a title where text follows it on its line: `"A"` and
`"xset"` lose their quotes, and `"set"`, `"set-a"`, `"title"`, `"a b"`, `"1a"`,
and `"007"` keep them. The value of a style property is printed without quotes
where it is such names, numbers, and colors of `#` and three to eight
hexadecimal digits, with one space between them: mermaid.js joins the words of
such a value with one space, so `"red  blue"` is not the same without quotes,
and `"1a"` would be read as a number and a name. A label is printed in quotes
with the text between its brackets, without the spaces, tabs, and no-break
spaces next to the brackets, which mermaid.js trims from a label with or without
quotes; a label of whitespace only (its Db has no label, where `[" "]` has an
empty one), with a `%%`, or with a directive or a comment inside stays as
written. A text with targets stays as written, since the examples write none.
[fixture: venn/quotes/names-without-quotes] [fixture:
venn/quotes/names-that-need-quotes] [fixture:
venn/quotes/style-values-without-quotes] [fixture: venn/quotes/labels-in-quotes]
[fixture: venn/quotes/labels-that-stay-as-written] [fixture:
venn/quotes/explicit-text-as-written] [fixture:
venn/quotes/names-before-a-comment-as-written] [fixture:
venn/quotes/texts-on-a-kept-line-as-written]

In a use case diagram a name that stands alone in quotes is printed without
quotes where it is ASCII letters, digits, and `_`, since mermaid.js makes its id
by replacing the other characters with `_`, and none of the words that the lexer
reads as a unit of its own (`actor`, `systemBoundary`, `end`, `direction`, `TD`,
`TB`, `BT`, `LR`, `RL`, `note`, `for`, `json`, `classDef`, `class`, `style`,
`true`, `false`, `accTitle`, and `accDescr` as written; `include`, `extend`,
`allowmixing`, `newpage`, `package`, `rectangle`, and `skinparam` in any case).
A label between parentheses, the title of a system boundary, the label of a
split association, and the label of a note are printed in quotes, except a label
that starts with a backquote, which a quote and a backquote would make a
markdown string. A label between square brackets of a use case is printed
without quotes where it is words of ASCII letters, digits, and `_` with one
space between them. In the native metadata a key and a scalar are printed
without quotes where they are a word, but the scalar of `icon`, which is printed
in quotes. [fixture: usecase/quotes/names-without-quotes] [fixture:
usecase/quotes/names-that-need-quotes] [fixture:
usecase/quotes/labels-in-quotes] [fixture: usecase/quotes/labels-as-written]
[fixture: usecase/quotes/square-bracket-labels] [fixture:
usecase/quotes/metadata] [fixture: usecase/quotes/touching-units] [fixture:
usecase/quotes/texts-on-a-kept-line-as-written]

In an architecture diagram a label in quotes is printed without them where it is
ASCII letters, digits, `_`, and spaces, with no space at its ends: the grammars
of 11.13.0 to 11.16.1, which read a label in quotes, read a label without quotes
of these characters only, and a backslash or a quote would change the title that
mermaid.js reads, since it takes one pair of outer quotes off a title and turns
`\"` and `\'` into `"` and `'` only in a title that had them (`"a\"b"` printed
`a\"b`, and `"'x'"` printed `'x'`). In a mindmap and a kanban board the text of
a shape in quotes is printed without them where it holds none of `)`, `]`, `(`,
and `}`, which end a text without quotes or are read as a closer, has no padding
or line break, does not start with a `-` (`(` and a `-` make the opener `(-`,
and a `-` before a `)` makes the closer `-)`), and does not stand next to a dash
of the dash form (`(-"x"-)`, whose closer `-)` follows only a string). A
markdown string stays. [fixture: architecture/quotes/labels-without-quotes]
[fixture: architecture/quotes/labels-that-need-quotes] [fixture:
mindmap/quotes/labels-without-quotes] [fixture:
mindmap/quotes/labels-that-need-quotes] [fixture:
kanban/quotes/labels-without-quotes] [fixture:
kanban/quotes/labels-that-need-quotes]

In a C4 diagram the alias of an element or a boundary, and the two ends of a
relationship and of `UpdateRelStyle`, are printed without quotes where they are
ASCII letters, digits, `_`, `-`, and `.`, with spaces between them, and a `,`
follows them right away; the label, the technology, the type, and the
description of an element are printed in quotes. An argument without quotes runs
to the next `,`, and mermaid.js reads a string only after ASCII spaces, so an
alias that a space, a tab, a line break, or another string follows, and the last
argument of a call (which without quotes takes the `)` into its text), stay in
quotes, and a text that holds a `"` or a line break, that stands after a string
with a tab, a line break, or a space other than the ASCII space between them or
at the start of its line, or that is not followed by a `,` on its line, stays
without them; a tab or another space after a `,` or a `(` is replaced by one
space and does not stop it. The description of a node and of a relationship, the
arguments of `RelIndex`, the sprite, the tags, the link, the settings of an
update, and the tags that stand at the third place of `Enterprise_Boundary`,
`System_Boundary`, and `Container_Boundary` are written as named attributes in
the examples, or not at all, and stay as written, and so does a named attribute,
whose value is a string in every form and whose key holds the quotes. [fixture:
c4/quotes/names-without-quotes] [fixture: c4/quotes/names-that-need-quotes]
[fixture: c4/quotes/names-before-a-gap-as-written] [fixture:
c4/quotes/texts-in-quotes] [fixture: c4/quotes/texts-that-stay-without-quotes]
[fixture: c4/quotes/other-arguments-as-written] [fixture:
c4/quotes/names-and-texts-on-a-kept-line-as-written]

In a flowchart, a swimlane diagram, and an agentflow diagram the name of a
subgraph, a flow, and a connector in quotes is printed without them where it is
words of ASCII letters, digits, and `_` with one space between them, whose parts
may be joined by a single `-` (`my-team`), none of the words `_blank`,
`_parent`, `_self`, `_top`, `call`, `click`, `default`, `direction`, `end`,
`href`, and `interpolate`, compared by the part before the first `-`, which ends
a keyword: the lexer reads these as a unit of its own, so `"end"`, `"click"`,
`"end-x"`, and `"x _self"` stay in quotes (the lexer of an agentflow diagram
reads `end` as a name, and the printer leaves it in quotes too). A name with a
`-` at its start or its end, or two together, stays in quotes. A word of the
list that is only a part of a longer word, or stands after a `-`, a `_`, or a
digit, does not keep a name in quotes: the versions that count draw `x-end`,
`x_end`, `x1click`, `x_self`, and `a b_top` the same with and without quotes
(see [Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)). A
name that a word touches on its line (`subgraph "S"accDescr {}`), a name that a
comment follows, and a name of two spaces that is an id, since the subgraph has
a title, keep their quotes, and so does a name that ends with `direction`,
whatever follows it: the lexer reads `direction`, white space (a line break
too), and the name of a direction (`TB`, `BT`, `RL`, `LR`, or `TD`) as one line,
which `subgraph xdirection` and a next line `TB --> C` would form. [fixture:
flowchart/quotes/subgraph-names-without-quotes] [fixture:
flowchart/quotes/subgraph-names-with-hyphens] [fixture:
flowchart/quotes/swimlane-lane-names-without-quotes] [fixture:
flowchart/quotes/subgraph-names-that-need-quotes] [fixture:
flowchart/quotes/subgraph-names-that-look-like-keywords] [fixture:
flowchart/quotes/subgraph-names-next-to-a-direction-line] [fixture:
flowchart/quotes/subgraph-names-with-runs-without-quotes] [fixture:
flowchart/quotes/subgraph-names-before-a-comment] [fixture:
flowchart/subgraph-header/whitespace-before-block-kept] [fixture:
agentflow/quotes/names-without-quotes] [fixture:
agentflow/quotes/names-that-need-quotes] [fixture:
agentflow/quotes/names-next-to-a-direction-line] [fixture:
agentflow/quotes/names-and-titles-before-a-comment]

The label of a shape, the label of a link, and the title of a subgraph of a
flowchart and a swimlane diagram are printed without quotes, and the label of a
shape, the title of a flow, and the title of a connector of an agentflow diagram
in quotes (the label of a link of an agentflow diagram without them), where the
text starts with a letter or a digit, has no space at its end, and holds ASCII
letters, digits, spaces, `_`, `-`, `.`, `,`, `:`, `!`, and `?`. mermaid.js reads
such a text the same in quotes and without them, in every shape and in every
version that reads it, apart from the `labelType` that its Db keeps (see
[Labels that are drawn the same](#labels-that-are-drawn-the-same)). A `.` stays
in quotes in a label between the arrows of a dotted link (`-. "a.b" .->`), which
a `.` ends, and so does a `--` in a label between the arrows of a solid link
(`-- "a--b" -->`), in a flowchart, a swimlane diagram, and an agentflow diagram:
the lexer ends the text at a `--`, and reads `go--on` as the arrow `--o`. A text
that holds what is another token outside a label, such as a `-` at its end
(`go-`), an arrow (`a---b`, `a.-b`), `:::`, `_self`, `click` or `call` before a
space, and `accTitle`, is drawn the same with and without quotes by the versions
that count, in a shape, between `|`, between two arrows, and as the title of a
subgraph, so it loses its quotes like any other text, except where it holds a
`--` between the arrows of a solid link or a `.` between those of a dotted link
(`A -- a---b --> B` is read as an open link from `A` to `b` with the label `a`
and a link from `b` to `B`, and `A -- "a---b" --> B` as one link). Any other
text stays as written: a markdown string, a text that starts with `_`, a `/`, a
`\`, a `-`, or a space, a text with a bracket, a `|`, a `&`, a `"`, a `;`, a
`#`, a `%`, or a `<`, a text that ends with a space, and a label on a line that
is kept whole. In an agentflow diagram a label also stays as written where it is
the first unit of its line, as after a comment line, a directive on a line of
its own, or a U+2028 or U+2029, since mermaid.js rejects a string there. The
label of a link that the printer writes in the other form (see
[The label of a link](#the-label-of-a-link)) is written without quotes in that
form. [fixture: flowchart/quotes/shape-labels-without-quotes] [fixture:
flowchart/quotes/link-labels-without-quotes] [fixture:
flowchart/quotes/subgraph-titles-without-quotes] [fixture:
flowchart/quotes/labels-that-need-quotes] [fixture:
flowchart/quotes/labels-next-to-trivia] [fixture:
flowchart/quotes/labels-that-look-like-other-tokens] [fixture:
flowchart/quotes/labels-with-two-dashes-between-arrows] [fixture:
flowchart/quotes/swimlane-labels-with-two-dashes-between-arrows] [fixture:
flowchart/quotes/swimlane-labels-without-quotes] [fixture:
flowchart/link-label-form/swimlane-arrows-to-pipes] [fixture:
agentflow/quotes/edge-labels-with-two-dashes] [fixture:
agentflow/quotes/labels-after-a-directive-line] [fixture:
agentflow/quotes/labels-in-quotes] [fixture:
agentflow/quotes/flow-titles-in-quotes] [fixture:
agentflow/quotes/connector-titles-in-quotes] [fixture:
agentflow/quotes/connector-titles-as-written] [fixture:
agentflow/quotes/labels-after-a-comment-line] [fixture:
agentflow/edge-labels/pipes-to-arrows] [fixture:
agentflow/labels/labels-quote-unsafe]

In a class diagram the name of a class or of a namespace between backquotes is
printed without them where it is a word of ASCII letters, digits, and `_` that
is none of `_blank`, `_parent`, `_self`, `_top`, `accDescr`, `accTitle`, `call`,
`callback`, `class`, `classDef`, `classDiagram`, `click`, `cssClass`, `href`,
`link`, `namespace`, `note`, `o`, and `style`, the words that the lexer reads as
a unit of its own where they stand as a name, and that neither ends with
`direction` nor starts with `TB`, `BT`, `RL`, or `LR`: the lexer reads
`direction`, white space (a line break too), and the name of a direction as one
line, which a name without quotes would join with the line before or after it. A
name of two words is the two words joined without the space, a name with another
character is not read the same, and a name on a line that holds a comment or a
directive keeps its backquotes. [fixture: class/quotes/names-without-quotes]
[fixture: class/quotes/names-that-need-quotes] [fixture:
class/quotes/names-next-to-a-direction-line] [fixture:
class/quotes/names-on-a-kept-line-as-written]

In a sequence diagram there is no string: the quotes of the description of a
participant (`participant A as "Alice"`), of a message, and of a note are
characters of the text. In a class diagram the grammar needs a string for the
label of a class, the text of a note, and a cardinality, and rejects the text
without quotes (`class A[Label]`, `note for B Text`, `A 1 --> * B`). In an
eventmodeling diagram a name has no form in quotes, and the quotes in the data
of a frame, in a title, and in an accessibility value are characters of the text
(the Db holds `{"x"}` for the data `{"x"}` and `{x}` for `{x}`). [fixture:
sequence/quotes/texts-as-written] [fixture: class/quotes/strings-as-written]
[fixture: eventmodeling/quotes/quotes-as-written]

The name of a treeView node in quotes stays as written, though the examples
write a name without quotes 58 times and in quotes 8 times: the grammars of
11.14.0 and 11.15.0 read a name in quotes only, and a name without quotes is
read from 11.16.0, so a text printed without quotes would not be read by a
version that reads the text as it is written.

Where the printer writes the runs of spaces and tabs of a text as one space (see
[Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
the text is judged as it is then written, so that a second formatting reads what
the first one wrote: `text: "a b"` of a requirement diagram with a tab between
the letters is printed `text: a b`, and so are `quadrant-2 "c d"` of a quadrant
chart and `service s(server)["a b"]` of an architecture diagram. A text that
stays as written, such as one in a diagram that holds `white-space`, is judged
as it is written, and keeps its quotes when it has a tab. [fixture:
requirement/fields/string-values-tabs-collapsed] [fixture:
requirement/fields/string-values-tabs-kept-with-white-space] [fixture:
quadrant/quotes/strings-runs-collapsed] [fixture:
architecture/quotes/labels-with-runs-without-quotes]

A string that a `#` or a `%` follows keeps its quotes in every diagram type,
where what follows is the first character after the spaces, tabs, and directives
that come after the string, since mermaid.js takes the directives away before it
reads the text: a text without quotes can run to the end of the line, and then
takes that character and what follows into the text, as `b #c` in
`a - satisfies -> "b" #c`. So `quadrant-1 "A"%%{init: {}}%%`, after which the
text ends, is printed `quadrant-1 A%%{init: {}}%%`, and `quadrant-1 "A" %% c`
keeps its quotes. A string that a `:` follows keeps its quotes too when the text
ends with `style` or `classDef`, in any case, since the line rule of mermaid.js
reads such a line (see [Lines that hold a `;`](#lines-that-hold-a-)). A `;` that
follows the string is no such character: the printer drops a `;` that separates
statements, and the quotes go with it as they go without it (`quadrant-1 "A";`
is printed `quadrant-1 A`). A string on a line that the printer writes as it is,
such as one with a `;` that the line rule keeps, keeps its quotes. [fixture:
requirement/comments/after-string-name] [fixture:
requirement/comments/after-keyword-and-string-values] [fixture:
requirement/multi-line-statements/class-last-line-semicolon-kept] [fixture:
quadrant/quotes/texts-that-need-quotes] [fixture:
quadrant/quotes/texts-before-a-directive] [fixture:
quadrant/quotes/texts-before-a-semicolon]

The inputs of the conformance corpus that are counted for a diagram type are
those that mermaid.js accepts, that no declared divergence makes it read
otherwise than the specification does, and whose formatted text changes when the
table `quoteRules` of `src/printers/quote-form.ts` is empty. mermaid.js 12.3.0
read both forms of these inputs with the same Db: 11 inputs of sankey diagrams,
15 of ER diagrams, 12 of requirement diagrams, 35 of Wardley maps, 2 of
gitGraphs, 13 of the 19 quadrant charts (the other 6 hold a tab inside a text,
which the printer also changes), 191 of XY charts, 174 of the 176 venn diagrams
(the 2 others differ in a run of spaces or tabs in a label, which the printer
also changes), 90 of the 93 use case diagrams (the 3 others differ in the
whitespace of a style, which
[Styles that are drawn the same](#styles-that-are-drawn-the-same) defines), 2
architecture diagrams, 7 mindmaps, 114 kanban boards, 65 of the 67 C4 diagrams
(the 2 others differ in a run of spaces or tabs in a text, which the printer
also changes), 11 flowcharts, 24 of the 26 agentflow diagrams (the 2 others
differ in the whitespace of a style, which
[Styles that are drawn the same](#styles-that-are-drawn-the-same) defines), and
7 class diagrams. It read both forms of the 6 sankey examples that were written
again with every plain field in quotes, with the same Db and the same SVG, and
drew the same SVG from the input and the formatted text of the 11 sankey inputs,
the 15 ER inputs, 9 of the 12 requirement inputs (the other 3 are drawn by
mermaid.js in neither form), the 35 Wardley inputs, the 2 gitGraph inputs, the
19 quadrant inputs, 73 of the 191 XY chart inputs (the other 118 have no plot,
and mermaid.js draws no chart without one, in either form), and 166 of the 176
venn inputs (the other 10 are drawn in neither form), the 93 use case inputs
(once the whitespace of one style was taken away), 1 of the 2 architecture
inputs (the other is drawn in neither form), the 7 mindmap inputs, the 114
kanban inputs, the 67 C4 inputs, the 11 flowchart inputs, the 26 agentflow
inputs (once the whitespace of a style was taken away), and the 7 class inputs.

### Versions of mermaid.js

The CHANGELOG.md of the pinned mermaid.js has no entry about the case of
keywords, the quotes of strings, or the digits of the numbers that this section
lists, so none of these is kept for its version. For the other kinds the
CHANGELOG.md and the grammars of the release tags, read from the history of
mermaid.js, show which form each version reads:

- The colon after the header of a gitGraph: the grammar of 8.14.0 has the rule
  `gitGraph:` only, and the grammar of 9.0.0 reads the header with the colon and
  without it. 8.14.0 does not count, so the colon of a header without a
  direction is left out (see
  [The colon after a header](#the-colon-after-a-header)).
- The quotes of a field of a sankey diagram: the grammars of 10.3.0, 10.9.0,
  11.0.0, and 12.3.0 have the same rules for a field without quotes and a field
  in quotes, and the same action of a record, which drops the spaces at the ends
  of the source and the target, reads `""` as `"`, and reads the value with
  `parseFloat` of the field without its spaces at the ends.
- The names and the roles of an ER diagram: the grammar of 8.14.0 has no name in
  quotes, and the grammars of 9.4.3, 10.9.0, 11.0.0, and 12.3.0 read a name and
  a role in quotes with a rule of their own and drop the quotes
  (`$1.replace(/"/g, '')`), so that a name in quotes and the same name without
  them have the same text. The words that these grammars read as units of their
  own (`erDiagram`, `one`, `many`, `only one`, `to`, `optionally to`, and the
  others of the lexer) are among the words that the printer leaves in quotes.
  The grammars of 10.5.0 to 11.4.1 read a name without quotes as
  `[A-Za-z_][A-Za-z0-9\-_]*`, and those of 11.5.0 to 12.3.0 as
  `([^\x00-\x7F]|\w|\-|\*)+` (11.13.0 adds `.`). So a name of letters, digits,
  `_`, and `-` that starts with a letter or a `_` is read without quotes in
  every version that counts. The names `_x`, `_1`, and `_a-b`, the role `_role`,
  and the name of a subgraph `_group` were drawn the same with and without
  quotes by those versions (see
  [Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)).
- The names and the values of a requirement diagram: the grammars of 9.1.0,
  10.9.0, and 12.3.0 give a requirement name, an id, a text, an element name, a
  type, and a reference the same production for a string in quotes and for a
  string without quotes (`unqString | qString`), and read the keywords of the
  lexer as whole words in any case, so that a word that is none of them is read
  as a name in every one of these versions.
- The names of a Wardley map: the grammar of 11.14.0, the first with the diagram
  type, reads a name without quotes with the terminal `NAME_WITH_SPACES`, words
  of ASCII letters, digits, `_`, `(`, `)`, and `&` that start with a letter and
  have spaces between them; the grammars of 11.15.0 (which adds the `-` to a
  name), 12.0.0, and 12.3.0 read the same words. A name in quotes has the same
  text as the name without them. 11.14.0 rejects a name with a `-` without
  quotes, so such a name stays in quotes.
- The branches of a gitGraph: the grammars of 9.4.3, 10.9.0, and 11.0.0 read a
  reference (`ref`) as a name without quotes, `\w([-\./\w]*[-\w])?`, or as a
  string, and the lexers of these grammars compare their keywords in any case;
  the grammar of 12.3.0 compares them as written, and reads a name that is
  longer than a keyword as a name.
- The texts of a quadrant chart: the grammars of 10.2.0, the first version of
  the type, 10.3.0, 10.9.0, 11.0.0, and 12.3.0 read a text without quotes
  (`ALPHA` and the tokens that follow it) and a string with the same `text`
  rule, and the lexers of these grammars read `x-axis`, `quadrant-1` to
  `quadrant-4`, and `quadrantChart` without a boundary after them. The rule
  takes a `-` as the token `MINUS` inside a text
  (`textNoTagsToken: alphaNumToken | SPACE | MINUS`), and 10.3.1 to 12.3.0 draw
  a text with a `-` the same with and without quotes.
- The titles and the categories of an XY chart: the grammars of 10.6.0, 10.9.0,
  11.0.0, 12.0.0, and 12.3.0 read a title, the title of an axis or of a plot,
  and a category with the same `text` rule, which takes a string as its text and
  a text without quotes as its tokens joined without the whitespace between
  them. Their lexers read `title`, `x-axis`, `y-axis`, `line`, and `bar` in any
  case, where no letter, digit, or `_` follows, and `vertical` and `horizontal`
  wherever they start.
- The labels of an architecture diagram: the grammars of 11.1.0 to 11.12.3 read
  a label of ASCII letters, digits, `_`, and spaces in brackets and no label in
  quotes. The grammars of 11.13.0 to 11.16.1 read such a label or a label in
  quotes, and the grammars of 11.17.0 to 12.3.0 read a label in quotes or any
  text without `[`, `]`, and a line break. So a label in quotes is printed
  without them only where it is of those characters, which every version that
  reads the quotes reads.
- The texts of the shapes of a mindmap: the grammars of v9.4.0 (the first with
  the rule), v10.1.0, and v10.3.0 to 12.3.0 read a string in a shape and a text
  without `)`, `]`, `(`, and `}` as the same `NODE_DESCR`, with the rule of the
  string before the rule of the text. The texts of the shapes of a kanban board:
  the grammar of 11.4.0, the first with the diagram type, is the grammar of
  every later release to 12.3.0.
- The names of a treeView diagram: the grammar of 11.14.0, the first with the
  diagram type, and of 11.15.0 reads the name of a node as a string in quotes
  only (`name=STRING2`), and the grammar of 11.16.0 added the name without
  quotes (`BARE_NAME`). A name in quotes stays as written, as the text above
  says.
- The arguments of a C4 diagram: the lexer rules of the argument context
  (`<attribute>[ ]*["]`, `<string>[^"]*`, and `<attribute>[^,]+`, which both
  return `STR`) and the action `attribute: STR { $$ = $1.trim(); }` are the same
  in the grammars of 9.1.2, the first tag with a C4 grammar (before the named
  attribute `$key="value"`, which 9.1.3 added), 9.1.3, 9.2.0, 10.3.0, 10.5.0,
  11.0.0, 11.13.0, and 12.3.0; the grammars of 9.1.x only log the rules to the
  console. So a string and an argument without quotes are the same argument in
  every version that has the diagram type.
- The names of the subgraphs of a flowchart and of the flows of an agentflow
  diagram: the grammars of 9.0.0 to 10.0.2 read the name of a subgraph with the
  rule `text`, which takes a string as it is and has no type (`$$ = $1`); the
  grammars of 10.1.0 to 10.3.0 read it with `text` too, where a string has the
  type `text`, as words have; and the grammars of 10.3.1 to 12.3.0 read it with
  the rule `textNoTags`, where a string has the type `text`. The type `string`
  belongs to the rule `text` from 10.3.1, which reads the title in brackets and
  the label of a shape, not the name. So the name of a subgraph has the same
  text and the same type in both forms in every version. The grammar of the
  agentflow diagram is the same file in 12.0.0, 12.1.0, 12.2.0, and 12.3.0. The
  grammar of 9.4.3 reads a name as the tokens `ALPHA`, `MINUS`, and `NUM`, and
  the grammars of 10.9.0 to 12.3.0 take a `-` that no `>`, `-`, or `.` follows
  into the token `NODE_STRING`, so a `-` between letters is part of a name. A
  `-` ends a keyword, so `end-x` is `end` and `-x`. The names `my-group` and
  `"my-group"` were drawn the same by 9.0.0, 9.1.7, 9.4.3, 10.3.1, 10.9.0,
  11.0.0, 11.4.1, 11.12.3, 11.13.0, 11.16.1, 12.0.0, and 12.3.0 (a swimlane
  diagram from 11.16.1, an agentflow diagram from 12.0.0). The subgraph names
  `x-end`, `x_end`, `x-click`, `x-call`, `x-interpolate`, `x-_top`, `x_self`,
  `a b_top`, `x1click`, `x-ending`, `x-clicker`, and `x-End` were drawn the same
  with and without quotes by the versions that count (see
  [Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)).
- The labels of the shapes, the links, and the subgraphs of a flowchart, a
  swimlane diagram, and an agentflow diagram: the rule `text`, which reads the
  title in brackets and the label of a shape, gives a string the type `string`
  from 10.3.1, and the type `text` before, so the Db of a label in quotes and of
  the same label without them differs from 10.3.1. The renderers read only
  whether the type is `markdown`, and a plain label was drawn the same in quotes
  and without them in every version listed under
  [Labels that are drawn the same](#labels-that-are-drawn-the-same), except a
  text with a `--` between two solid arrows, below. The texts `go-` in a round
  shape, `a.-b`, `a---b`, `a:::b`, `please click here`, `call x`,
  `interpolate x`, `x_self`, `a b_top`, and `accTitle: x`, in a shape, between
  `|`, and as the title of a subgraph, and, where they hold no `--` between
  solid arrows and no `.` between dotted ones, between two arrows, were drawn
  the same with and without quotes by the versions that count (see
  [Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)). The
  lexers of 10.3.1 and later read the text between two solid arrows one
  character at a time, a `-` only when no `-` follows it
  (`<edgeText>[^-]|\-(?!\-)`), so the text ends at a `--`, and a label with a
  `--` stays in quotes there in a flowchart, a swimlane diagram, and an
  agentflow diagram: `-- a--b -->` is rejected and `-- go--on -->` has the arrow
  `--o`. The texts `Click here`, `aclick x`, `recall x`, `interpolated x`,
  `direction TB x`, and `the end of it` were drawn the same by the 14 versions
  from 9.0.0 to 12.3.0, with and without quotes.
- The names of the classes of a class diagram: the grammars of 9.0.0 to 12.3.0
  read a name between backquotes (`classLiteralName`: `BQUOTE_STR`) and a name
  of letters and digits (`alphaNumToken`: `ALPHA`, `NUM`) as a `className`. The
  words that the jison lexers of these versions read as whole words are the
  words that [The quotes of a text](#the-quotes-of-a-text) lists for a class
  diagram; the rule for the header `classDiagram` is in the lexer of each of
  them. Every other string of letters, digits, and `_` is read as `ALPHA` or
  `NUM`. So a name of letters, digits, and `_` that is none of these words is
  the same name in both forms in every version, unless it joins a line that
  holds `direction` (the next item).
- The names that end with `direction` and that start with the name of a
  direction, in a class, a flowchart, an agentflow, an ER, and a requirement
  diagram: the lexers of the class grammars and of the flowchart grammars of
  9.0.0 to 12.3.0 try the rules `.*direction\s+TB[^\n]*`, and the same for `BT`,
  `RL`, and `LR`, before their other rules, and `\s+` reads a line break. The
  flowchart grammars of 11.13.0 to 12.3.0 and the agentflow grammars of 12.0.0
  to 12.3.0 have the rule for `TD` too, and the ER and the requirement grammars
  of 11.5.0 to 12.3.0 have the four rules, which the grammars before them do
  not. The ER and the requirement lexers read in any case in all these versions,
  the others in the case written. A version without the rules reads a name the
  same with and without quotes, so the names that the printer leaves in quotes
  are read the same in every version.
- The names, the labels, and the metadata of a use case diagram: the lexer, the
  parser, the visitor, and the model builder of 12.0.0, the first release with
  the diagram type, 12.1.0, 12.2.0, and 12.3.0 are the same files. The visitor
  makes the id of a name in quotes with the characters other than an ASCII
  letter, a digit, and `_` replaced by `_`, and the id of a name without quotes
  from the name itself.
- The names, the labels, and the values of a venn diagram: the grammars of
  11.13.0, the first with the diagram type, 12.0.0, and 12.3.0 are the same, and
  so is the `vennDB.ts` of each. A name in quotes and the same name without them
  have the same text (`normalizeText` takes the quotes off a string and trims
  any text), a label in brackets is trimmed with or without quotes, and the
  lexers read `venn-beta`, `set`, `union`, `text`, and `style` in any case.
- An accessibility description in a block on one line: the grammar of the
  flowchart in 9.0.0 and 9.0.1 has no rule for `accDescr`, and the grammar in
  9.1.0, the first with the rule, has the form with the colon and the form with
  the block. In every file of the grammars of 9.1.0, 9.4.3, 10.9.0, 11.0.0,
  12.0.0, and 12.3.0 that has a rule for the block, the same file has the rule
  for the colon, and in 9.1.0, 10.9.0, and 12.3.0 the rule for the colon takes
  the rest of the line, `(?!\n|;|#)*[^\n]*`, in every such file. The grammars of
  the diagram types that use the Langium parser, from 11.0.0, read both forms
  with one terminal of the common grammar. So a text printed with the colon is
  read by every version that reads the block.
- `switch` of a gitGraph: the grammar of 10.9.0 has `checkout` and no `switch`,
  and the grammar of 11.0.0 has both. A text printed with `checkout` is read by
  every version that reads `switch`.
- The symbols of an ER relationship: the grammars of 8.8.0, 8.14.0, and 9.0.0
  have the symbols and no word, and the grammar of 9.4.3 has the words as well.
  A text printed with the symbols is read by every version that reads the words.
- `Rel_Up` and the like of C4: the first tag with a C4 grammar is 9.1.2 (9.1.0
  and 9.1.1 have none), and that grammar has `Rel_Up` and `Rel_U` both.
- `::=` of EBNF: the CHANGELOG.md adds the railroad diagrams in 11.16.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L601)),
  and the grammar of 11.16.0 has `=` and `::=` both.
- The range of a packet diagram: the grammar of 11.0.0, the first with the
  packet diagram, reads a position and a range with the rule
  `start=INT('-' end=INT)?`.
- The colon after the header of a cynefin or a radar diagram: the CHANGELOG.md
  adds the radar chart in 11.6.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1168))
  and the cynefin diagram in 11.16.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L585)),
  and the grammar of each in its first release reads the header with the colon
  and without it.
- The direction of the header of a flowchart: the CHANGELOG.md of 11.10.0 says
  that the behavior of `TD` is updated to be the same as that of `TB`
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1061)).
  Version 11.9.0 keeps the direction `TD` in the Db and draws the flowchart
  example of the documentation that links nodes across three subgraphs
  (`flowchart TB`, `c1-->a2`) differently from the same text with `TD`; 12.3.0
  draws them the same. Version 11.9.0 also rejects `direction TD` in a subgraph,
  which 11.13.0 reads
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L860)).
  The flowchart grammars of 8.14.0, 9.4.3, and 10.9.0 read `TB` and `TD` both as
  the direction of a header. So `TB` stays as written.
- The label of a link and the direction of a header in agentflow and swimlane
  diagrams: the CHANGELOG.md adds the swimlane diagram in 11.16.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L605));
  it reads the grammar of the flowchart, which has both forms of a label. The
  grammar of the agentflow diagram, added in 12.0.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L250)),
  is the same file in 12.0.0 and 12.3.0, and it has both forms. Both diagram
  types are later than 11.10.0, so `TD` is `TB` in every version that reads
  them.
- The value of a link of a sankey diagram: the sankey grammar is first in the
  tag 10.3.0 (10.2.4 has none), and the grammar of 10.3.0, 10.3.1, 10.4.0,
  10.5.0, 10.6.0, 10.7.0, 10.8.0, 10.9.0, 11.0.0, 11.4.0, 11.8.0, 11.10.0,
  11.14.0, 12.0.0, and 12.3.0 makes the value a number with
  `parseFloat($value.trim())`, so `1` and `0.5` are read in every version that
  reads `1.0`, `+1`, or `.5`. The CHANGELOG.md has no entry about how the value
  is read.
- The case of a keyword: the lexers of the sequence, Gantt, user journey, ER,
  requirement, and state diagrams are case-insensitive in the grammars of
  8.14.0, 9.4.3, 10.9.0, and 12.3.0. The earliest tags read that have the
  grammar of another diagram type are case-insensitive as well: 9.4.0 for the
  timeline and the mindmap diagrams, 10.2.0 for the quadrant chart, 10.6.0 for
  the xychart, 11.13.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L836))
  for the Venn diagram, and 12.0.0
  ([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L248))
  for the use case diagram. Versions before 8.14.0 were not read.

### The names of a header

The name of a header stays as written: `block-beta` and `block`, `graph` and
`flowchart`, `packet-beta` and `packet`, `sankey-beta` and `sankey`,
`xychart-beta` and `xychart`, `treemap` and `treemap-beta`, `ishikawa` and
`ishikawa-beta`. mermaid.js 12.3.0 accepts both names of each pair
([block](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/block/blockDetector.ts#L6),
[sankey](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/sankeyDetector.ts#L6),
[xychart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/xychart/xychartDetector.ts#L10),
[packet](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/packet/detector.ts#L10),
[treemap](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/treemap/detector.ts#L10),
[ishikawa](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/ishikawa/ishikawaDetector.ts#L10),
[flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDetector-v2.ts#L9-L11)),
and the two names of a pair draw the same: the `aria-roledescription` of the
drawing and its accessibility tree are the same for both, and 175 pairs of the
examples, written with the other name, gave the same Db and the same drawing.
The examples use `block` 30 times against none of `block-beta`, `flowchart` 116
against none of `graph`, `packet` 4 against none, `sankey` 8 against none,
`xychart` 7 against 1, `treemap-beta` 8 against none, and `ishikawa-beta` once
against none.

But other versions accept the names differently. mermaid.js 11.9.0 detects no
diagram from `block`, `sankey`, or `xychart` without `-beta`, and the
CHANGELOG.md removes the suffix of these three diagrams in 11.10.0
([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1020)).
It moves the packet diagram out of beta in 11.9.0
([the entry](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1087)),
and the grammars of 11.1.0 and 11.3.0 read `packet-beta` only. So a text printed
without the suffix is not drawn by the versions before the release that removed
it. mermaid.js 11.9.0 reads `graph` and `flowchart`, and `treemap-beta` and
`treemap`, both, and the CHANGELOG.md records no change of the names of the
flowchart, treemap, and ishikawa diagrams. The version that draws a text is
known to its writer and not to the formatter, so none of the names is rewritten.
A header in another case (`ISHIKAWA`, `sankey-BETA`, `XYCHART-BETA`) stays as
written as well. [fixture: block/header/block-beta-kept] [fixture:
flowchart/direction/header-keyword-kept] [fixture:
flowchart/direction/header-td-kept] [fixture: ishikawa/header/header-valid]
[fixture: ishikawa/header/header-stable] [fixture: packet/header/header-beta]
[fixture: packet/hidden-yaml/yaml-beta-header] [fixture:
sankey/header/sankey-beta] [fixture: sankey/header/upper-case-beta] [fixture:
treemap/header/common] [fixture:
xychart/header-and-orientation/beta-header-kept] [fixture:
xychart/keyword-case/header-spelling-kept] [fixture:
xychart/header-and-orientation/second-header-spelling-and-case-kept]

`stateDiagram` and `stateDiagram-v2` stay as written for the same reason. The
detector of mermaid.js 12.3.0 draws both with the unified state diagram
([the comment](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/state/stateDetector-V2.ts#L9)).
The 22 pairs of the examples gave the same Db, and 21 of their drawings were the
same, pixel for pixel. The 22nd, the choice example
(`state if_state <<choice>>`), differs only in the strokes of the diamond, which
are drawn at random: the same text drawn twice differs in the same way. The
examples use `-v2` 17 times and the other 5 times. [fixture:
state/header/spellings-kept]

### What else stays as written

A longer link of a flowchart (`--->` for `-->`) stays as written. The
documentation of mermaid.js says that extra dashes ask for a link that spans
more ranks
([Minimum length of a link](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/flowchart.md#L933-L955)),
and the code passes the length on to the layout:
[`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1378)
gives it as `minlen` of the edge, which the dagre layout
([`index.js`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.js#L759))
and the elk layout
([`render.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/layout-algorithms/elk/render.ts#L2754))
take over. The examples that were drawn gave the same figure, but the length is
the author's request. [fixture: flowchart/arrow-spacing/arrow-length-kept]

## Whitespace at the start of a label

mermaid.js drops whitespace at the start of a label without quotes, and so does
formatting, except where the label would then be read differently or not at all:
the whitespace is kept, as one space, when the label starts with `/`, `\`, `-`,
or `"`, or when its first word has a `@`, and the label then gets one space at
its end too. [fixture: flowchart/label-inner-whitespace/trimmed] [fixture:
flowchart/label-inner-whitespace/leading-whitespace-kept] [fixture:
flowchart/label-inner-whitespace/compat-leading-backslash-kept] For example,
`A[ /x/]` is a rectangle with the label `/x/`, while `A[/x/]` is a lean-right
shape with the label `x`. See
[Label inner whitespace](./flowchart.md#label-inner-whitespace).

The `@` depends on the version of mermaid.js. In a flowchart, 12.3.0 stops the
run of an edge id at a bracket and at `|`, so it reads `A[user@example.com]` and
`A-->|x@|B` as it reads them with the whitespace, and rejects only `A>x@]`; an
agentflow diagram rejects `A[x@]` in 12.3.0 too. The grammars of 11.5.0, the
first with edge ids, to 12.2.0 do not stop the run there (the rule of the edge
id in `flow.jison` of the tags 11.4.1, 11.5.0, 12.2.0, and 12.3.0 was read), so
they reject a label whose first word has a `@` without the whitespace, in a
shape, between `|`, and in the title of a subgraph, and read it with the
whitespace. Drawn in Chromium, `A[ x@y ]`, `A-->| x@y |B`, `subgraph S[ x@y ]`,
and `A( x@y )` and the same texts without the spaces were the same in 10.3.1,
10.9.0, 11.0.0, 11.4.1, and 12.3.0, rejected in the form without the spaces by
11.12.3, 11.13.0, 11.14.0, 11.15.0, 11.16.1, and 12.0.0, and rejected in both
forms by 9.0.0, 9.1.7, and 9.4.3. A text printed without the space would be
rejected by versions that read the text as it is written, so the space is kept
in a flowchart, a swimlane diagram, and an agentflow diagram alike. [fixture:
flowchart/label-inner-whitespace/leading-whitespace-at-sign-kept] [fixture:
flowchart/label-inner-whitespace/leading-whitespace-at-sign-every-shape-kept]
[fixture:
flowchart/label-inner-whitespace/leading-whitespace-at-sign-before-question-end-kept]
[fixture:
flowchart/label-inner-whitespace/leading-whitespace-at-sign-swimlane-kept]

## Directives between tokens

mermaid.js removes a directive and reads the text on its two sides joined, so
the whitespace that remains is that of the two sides together. A unit such as
`note for`, or the text after `title`, reads exactly one whitespace character,
and a space on each side of a directive would leave two. Within a printed line,
formatting therefore prints the gap as its ordinary rule prints it without the
directive, and puts the directive after the space of that rule, so that it
touches the unit after it. Where the rule has no space, the directive touches
both units. For example, `note%%{init: {}}%% for A "t"` is printed
`note %%{init: {}}%%for A "t"`, and `A  %%{init: {}}%%  --> B` is printed
`A %%{init: {}}%%--> B`. [fixture: flowchart/directives/whitespace-on-each-side]
[fixture: flowchart/directives/touching-token] [fixture:
flowchart/directives/whitespace-on-both-sides] [fixture:
class/directives/count-sensitive-unit] [fixture:
sequence/directives/compat-whitespace-on-one-side-of-directive] [fixture:
class/directives/compat-whitespace-on-one-side-of-directive] [fixture:
state/directives/compat-whitespace-on-one-side-of-directive] The gap keeps
whether it holds whitespace, a run becoming one space, where the line rule of
mermaid.js may read its whitespace, and where a directive stands at the start or
at the end of the printed line. [fixture:
flowchart/directives/line-edge-whitespace] See
[Directives](./flowchart.md#directives).

## Structural continuations around comments and directives

Ordinary comments and directives between structural parts retain their required
line breaks without freezing the parts' columns. Continuations and intervening
standalone trivia use one indentation level inside the statement. Keep each
first gap-line tail, including whitespace needed before LF, and keep value and
directive interiors whole. Joining comment regions, semicolon protections and
diagram-specific value boundaries still take precedence.

This applies to class and state statements, ER statements, requirement headers,
fields and statements, and sequence statements other than trivia-separated
titles. Empty description blocks inside requirement and element bodies also
align their standalone trivia and separate closer. [fixture:
requirement/empty-description-blocks/in-body-with-comment-line-kept] [fixture:
requirement/empty-description-blocks/in-body-with-directive-line] A state's
separate opening brace aligns with its keyword. Callback-name whitespace through
`(` in class remains value text. [fixture:
class/multi-line-statements/comment-inside-kept] [fixture:
class/whitespace-between-tokens/callback-name-comment-line-kept] [fixture:
state/multi-line-statements/declaration-trivia-continuations] [fixture:
state/multi-line-statements/brace-after-comment-line-kept] [fixture:
er/multi-line-statements/style-comment-continuation] [fixture:
requirement/multi-line-statements/header-directive-continuation] [fixture:
requirement/fields/comment-and-directive-continuations] [fixture:
sequence/multi-line-statements/autonumber-comment-continuation]

The same rule covers Gantt click/calendar/list/accessibility structure, journey
and timeline accessibility lines, quadrant points and accessibility, block
structure, and XY chart headers, axes, plots and accessibility. It does not
reindent literal text: Gantt settings/tasks/titles/sections, journey and
timeline titles/sections, and timeline events retain their value-owned padding.
Multiline labels and quoted values keep their internal columns. [fixture:
gantt/multi-line-statements/structural-trivia-continuations] [fixture:
journey/multi-line-statements/accessibility-trivia-continuations] [fixture:
timeline/multi-line-statements/accessibility-trivia-continuations] [fixture:
quadrant/multi-line-statements/point-trivia-with-multiline-label] [fixture:
block/multi-line-statements/structural-trivia-continuations] [fixture:
xychart/multi-line-statements/axis-trivia-with-multiline-string]

C4 call padding also formats around inline directives while retaining their
contents, contacts and required breaks; a boundary opener kept below a directive
aligns with its call. [fixture: c4/directives/directive-inline] [fixture:
c4/boundary-bodies/opener-directive] [fixture:
c4/named-attributes/named-exterior-directive-lines] [fixture:
c4/argument-spacing/directive-semicolon-prefix]

The physical line completing an ordinary block header aligns with its statement,
leaving its body one level deeper. Crossing literal values keep their own
columns. This applies to state, requirement and C4 boundary headers. [fixture:
state/composite-states/header-completion-after-comment] [fixture:
requirement/bodies/header-completion-after-comment] [fixture:
c4/boundary-bodies/named-header-completion] [fixture:
c4/boundary-bodies/value-spans-header-line-kept]

Eventmodeling data and note headers use ordinary continuation indentation for
comments, directives and the line completing the header. An eligible body uses
one further configured step inside that opening line; native hidden header
boundaries and body-preservation guards take precedence. Block closers still
stay at column one. Keep source order and trivia form, as for GWT headers.
[fixture: eventmodeling/declarations-and-notes/header-completion-comments]
[fixture: eventmodeling/declarations-and-notes/header-opener-comment] [fixture:
eventmodeling/declarations-and-notes/header-directive-continuation] [fixture:
eventmodeling/declarations-and-notes/header-continuation-unsafe-body]

GWT has no opening brace. Its continued source-frame line and intervening
comments or directives use one ordinary continuation level inside `gwt`, keeping
the written order and trivia form. Clause keywords and items retain their own
one-level and two-level indentation. [fixture:
eventmodeling/gwt-clauses-and-items/header-completion-comment] [fixture:
eventmodeling/gwt-clauses-and-items/header-directive-continuation]

Ordinary ER and requirement style units use `property: value`, with styles
separated by a comma and one space. Property and value contents stay written,
except that a run of spaces between value words is printed as one space (see
[Styles that are drawn the same](#styles-that-are-drawn-the-same)). A plain
joined header gets this spacing on the first pass too. Trivia, multiline style
literals and semicolon-sensitive lines retain their existing layout. [fixture:
er/styles-and-classes/style-unit-padding] [fixture:
er/styles-and-classes/over-lines-joined] [fixture:
requirement/styles-and-classes/style-unit-padding]

## Lines that hold a `;`

mermaid.js ignores the last `;` of a line that contains `style`, then a `:`
followed by a `#` without whitespace between them, then a `;` (the
specification's
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)).
The rule reads the text of the line, so removing a `;` that separates
statements, or moving a statement to a line of its own, can make it ignore
another `;`, and change a label or an entity: `A[style:#x;];` has the label
`style:` followed by the entity `#x;`, and `A[style:#x;]` the label `style:#x`.
[corpus fixture: common/entity-style-separator-ignored] [corpus fixture:
common/entity-style-label-semicolon-ignored] Both are accepted, so only the
diagram shows the change. A line that holds a `;` other than one that separates
statements or ends a statement therefore keeps its statements on it and its `;`
where they are, whether the rule applies to it or not; the rule does not read
the whitespace between other tokens, so that is formatted as usual. [fixture:
flowchart/statements-one-per-line/line-with-semicolon-kept] [fixture:
flowchart/statements-one-per-line/compat-semicolon-in-label-without-style-kept]
[fixture: sequence/comments/semicolon-after-comment-kept] [fixture:
class/labels/semicolon-line-kept] [fixture:
state/descriptions-and-labels/semicolon-line-kept] See
[Statements one per line](./flowchart.md#statements-one-per-line).

In class, state, ER, requirement, block, Venn and usecase diagrams, line-ending
`classDef` and `style` semicolons are dropped where this leaves the Db
unchanged. This includes the ignored terminator and its preceding whitespace,
with a closed directive before it retained. [fixture:
class/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture:
state/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture:
er/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture:
requirement/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture:
block/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture:
venn/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture:
usecase/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
Without a `#` in the statement, ER also drops its terminating `;` unit when no
trivia separates it from the last style. A treemap `classDef` statement with a
style drops its terminating `;` unit on the same condition, with or without a
`#`. A `;` inside the style, as in `fill: #f00;`, where `#f00;` is an entity,
stays. [fixture: treemap/semicolons/class-terminator-dropped] [fixture:
treemap/semicolons/class-terminator-directive-kept] [fixture:
treemap/semicolons/class-terminator-entity-kept] State style statements and
block `classDef` statements drop a final `;` from the last style only when it is
that style's sole semicolon and follows non-whitespace text. Other style
semicolons remain where deleting them changes the Db. [fixture:
er/semicolons-at-the-end-of-a-style-statement/unit-terminators] [fixture:
er/semicolons-at-the-end-of-a-style-statement/directive-before-unit-kept]
[fixture:
state/semicolons-at-the-end-of-a-style-statement/style-text-terminators]
[fixture: state/semicolons-at-the-end-of-a-style-statement/style-text-kept]
[fixture:
block/semicolons-at-the-end-of-a-style-statement/classdef-text-terminators]
[fixture: block/semicolons-at-the-end-of-a-style-statement/style-text-kept]
[fixture:
requirement/semicolons-at-the-end-of-a-style-statement/style-text-kept]

## A line that a `;` ends

A `;` decides where a line ends and, when it is the one that the line rule
ignores (see [Lines that hold a `;`](#lines-that-hold-a-)), which `;` that is.
The rule removes the `;` from the text before mermaid.js reads it, and the scan
of a directive that is not closed takes the whitespace after its argument, line
breaks included, until a `;` stops it. A line is printed as written, with its
statements on it, in every diagram type, when dropping a `;` on it would change
one of those two things. That is the case on a line that holds

- a `;` after a directive that is not closed, with only whitespace between them.
  The scan of such a directive takes the whitespace after its argument, line
  breaks included, and a `;` stops it. `%%{wrap foo;` and the next line
  `participant D` end the directive at the `;`, while without it the line break
  and the next line are taken with the directive. [fixture:
  sequence/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [fixture:
  flowchart/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [fixture:
  state/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [corpus fixture: sequence/ignored-semicolon-after-directive-06349fee] [corpus
  fixture: common/directive-word-argument-unclosed-next-line] The same holds for
  `%%{init: {}`, U+2029, and `;`, where the argument stops before the U+2029,
  which the directive takes as whitespace. [corpus fixture:
  flowchart/ignored-semicolon-after-directive-530d2c05]
- a `;` that the line rule ignores, with only whitespace and directives between
  it and another `;`. The directives are removed first, so the two are next to
  each other for the rule, which ignores only the last `;` of the line: dropping
  the last one makes the one before it the ignored one, and a message text
  `style:#x`, with `;;` after a directive, changes into `style:`. [fixture:
  sequence/statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
  [fixture:
  flowchart/statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
  [fixture:
  state/statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
- a `;` that the line rule ignores and, after it, a U+2028 or U+2029. The rule
  reads the text up to the character as the line, so the character stays where
  it is, and printed as a space it would end the line elsewhere. In a flowchart,
  `Z[style:#x];`, U+2029, and `;` would become `Z[style:#x]; ;`, whose last `;`
  is another one. [corpus fixture:
  flowchart/ignored-semicolon-after-directive-5072803f]

A `;` after a directive that is closed, with no other `;`, changes nothing when
it is dropped, so it is dropped: `A-->B %%{init: {}}%% ;` is printed as
`A --> B %%{init: {}}%%`. [fixture:
flowchart/semicolons/closed-directive-formatted] [fixture:
sequence/statements-one-per-line/compat-closed-directive-semicolon-dropped]

The same protections apply to the style terminators above: removing a semicolon
must not move an unclosed directive's stopping boundary or make the line rule
discard a different semicolon. [fixture:
class/semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
[fixture:
state/semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]

In a sequence diagram, a statement that ends with a unit that reads no
whitespace, a data block of a participant or `autonumber`, keeps a `;` that
follows a directive after it, and its line is printed as written when it holds a
U+2028 or U+2029: the character is no whitespace to the `}` that ends the unit,
while a space is. [fixture:
sequence/statements-one-per-line/data-block-directive-kept] [fixture:
sequence/statements-one-per-line/autonumber-directive-kept]
`participant Z@{ ... }%%{init: {}}%%`, U+2029, and `;` is accepted, and with a
space in place of the U+2029 it is rejected. [corpus fixture:
sequence/ignored-semicolon-after-directive-5689c99a] The same holds for a `;`
that the line rule ignores and, after it, a U+2028 or U+2029, and the `;` that
ends the statement may stand on a later line: the line is printed as written to
the last of those `;`. `participant Z@{ "style": "x:#y" };`, U+2028, a line
break, and `;` is accepted, and without the second `;` the whitespace at the end
of the line hides the line break, and it is rejected. [corpus fixture:
sequence/ignored-semicolon-then-separator-line-1902f8c5]

See [Statements one per line](./flowchart.md#statements-one-per-line).

## A line that a directive that is not closed joins

The whitespace that follows the argument of a directive that is not closed is
taken with it, line breaks included (the specification's
[Where a directive is](../../spec/docs/common.md#where-a-directive-is)), so the
next line goes on the line of the directive, as it does after a comment line
(see
[A comment line after U+2028 or U+2029](#a-comment-line-after-u2028-or-u2029)).
The line is printed as written, with what stands on it, and no `;` is needed for
that. [fixture: flowchart/directives/compat-unclosed-directive-joins-next-line]
[fixture: sequence/statements-one-per-line/compat-unclosed-directive-joins-line]
[fixture:
state/statements-one-per-line/compat-unclosed-directive-joins-next-line]
[fixture: class/directives/compat-unclosed-directive-joins-next-line] [corpus
fixture: common/directive-word-argument-unclosed-next-line]
`participant A@{ "style": "x:#y" };participant C%%{init: {}`, a line break,
U+2029, and `;participant D` is one line for the line rule, and moving
`participant C` to a line of its own would leave that `;` unignored. [corpus
fixture: sequence/ignored-semicolon-after-directive-435fa018] In a class or
state diagram, a statement after such a line break is kept as it is written,
without the indentation of its level: `state S {%%{wrap foo`, an empty line, and
`A` keep the empty line and the `A` where they stand. [fixture:
state/composite-states/compat-unclosed-directive-joins-body-line] [fixture:
class/member-bodies/compat-unclosed-directive-joins-body-line]

A directive with a free-text argument, such as `init`, and no `}%%` extends to
the end of the text (the specification's
[Where a directive is](../../spec/docs/common.md#where-a-directive-is)), so
everything after it is printed as written, as part of the directive:
`A --> B %%{init: {};` is formatted up to the directive and the lines after it
stay as they are. A directive whose argument is a word, such as `%%{wrap foo;`,
ends after the word, and the lines after it are formatted. [fixture:
flowchart/directives/unclosed-free-text-takes-the-rest] [fixture:
flowchart/directives/unclosed-word-argument-stops-after-word]

Whitespace that holds a U+2028 or U+2029 is printed as written, with the
directive, wherever the directive stands. The free text of the argument stops
before such a character, which is no whitespace to it, and the directive takes
the whitespace after it; with the character printed as a space, the argument
would reach past it, and take the statements that follow, up to the next `}%%`
or the end of the text. `class A%%{init: {}`, a space, U+2028, `class D`, and
`class B` declare the classes `AclassD` and `B`, and with a space in place of
the U+2028, only `A`. [corpus fixture:
class/unclosed-directive-separator-whitespace-5cfdfca6]

## Lines that hold a direction text

At the first position of a line where a unit starts, mermaid.js tries the
direction line before whitespace (the specification's
[The statement context](../../spec/docs/diagrams/flowchart.md#the-statement-context)).
An indented line that holds `direction`, whitespace, and a direction value
anywhere is therefore a direction statement, while the same line at the first
column may be read in another way: `accTitle: t;direction TB` is an
accessibility title. [fixture:
flowchart/indentation/compat-direction-text-indented] [corpus fixture:
flowchart/lex-direction-line-acc-title-column-zero] [corpus fixture:
flowchart/lex-direction-line-acc-title-indented] Such a line that is not a
direction statement is kept as written, with its indentation. [fixture:
flowchart/indentation/direction-text-kept] [fixture:
flowchart/indentation/direction-text-with-directive-kept] mermaid.js takes the
directives away before the lexer reads the text, so a `direction` that a
directive splits (`accDescr: direc%%{init: {}}%%tion RL`) is a direction text as
well, in a description in a block or after a colon, in a title, after a `;`, and
inside a subgraph, in a flowchart and in a swimlane diagram. [fixture:
flowchart/indentation/direction-text-split-by-a-directive-kept] [fixture:
flowchart/indentation/swimlane-direction-text-split-by-a-directive-kept] See
[Indentation](./flowchart.md#indentation).

Flowchart bodies use the shared significant indentation minimum, at least one
space per level even with `tabWidth: 0`. This prevents a direction statement
from gaining column-one accessibility or keyword priority when its indentation
is removed. [fixture: flowchart/indentation/zero-direction-description-subgraph]
[fixture: flowchart/indentation/zero-direction-title] [fixture:
flowchart/indentation/zero-direction-title-tab] [fixture:
flowchart/indentation/zero-direction-description-block] [fixture:
flowchart/indentation/zero-direction-title-prefix] [fixture:
flowchart/indentation/zero-direction-directive] [fixture:
flowchart/indentation/zero-direction-style-prefix] The same minimum protects
[mindmap](./mindmap.md#indentation), [kanban](./kanban.md#indentation),
[Venn](./venn.md#indentation), [Ishikawa](./ishikawa.md#indentation),
[Agentflow](./agentflow.md#indentation), [class](./class.md#indentation) and
[YAML](#frontmatter) where zero-width indentation would change the reading.

## Sequence messages from a number or `title`

A sequence message has one space on each side of its arrow, except when its
source is an id that whitespace after it would make another unit: a number, as
in `1->>2: x`, where `1 ->>2: x` is rejected, and `title` in any case, as in
`title->>B: x`, where `title ->> B: x` is a title (the specification's
[The statement context](../../spec/docs/diagrams/sequence.md#the-statement-context)).
Such a message keeps its arrow touching on both sides. [fixture:
sequence/arrow-spacing/touching-before-read-otherwise-kept] See
[Arrow spacing](./sequence.md#arrow-spacing).

## Sequence statements over several lines

In a sequence diagram, a statement continues on the next line when whitespace
comes before the line break, and such a statement is printed on one line.
[fixture: sequence/multi-line-statements/joined] One with a comment or a
directive keeps its line breaks and aligns structural continuations. The
whitespace before the first line break of each gap is retained because it can
join the lines for the lexer. [fixture:
sequence/multi-line-statements/comment-inside-kept] A title with a comment line
between `title` and its text keeps its complete source instead, including
value-owned indentation: the comment line is removed before mermaid.js reads the
text, so the line after it is the title. [fixture:
sequence/title/comment-line-kept] See
[Multi-line statements](./sequence.md#multi-line-statements).

## A line of only whitespace after a comment

In a class diagram, a line of only whitespace right after a line that ends with
a comment after a statement is printed as a line of one space, where any other
empty line is printed without whitespace. [fixture:
class/comments/whitespace-line-kept] [fixture:
class/comments/whitespace-line-after-header-comment-kept] [fixture:
class/comments/compat-whitespace-line-after-comment-line] [fixture:
class/comments/compat-comment-then-empty-lines] [corpus fixture:
class/lex-comment-then-spaces-line] [corpus fixture:
class/div-comment-then-empty-line] mermaid.js reads the line breaks after such a
comment as part of the comment, and the next line as part of the commented
statement, unless a line of only whitespace comes between them (see
[A comment that takes the line breaks after it](#a-comment-that-takes-the-line-breaks-after-it)):
`A --> B %% c`, a line of two spaces, and `A : +int age` is a relation and a
member, and without the spaces, a relation from A to `BA`. An editor that
removes whitespace at the ends of lines removes that space too, and mermaid.js
then reads the diagram otherwise. See [Comments](./class.md#comments).

## Class labels and member lines

Class attributes, annotations, method-field contents and generic types keep
their written text: whitespace after a visibility mark and between two `~` can
be part of the Db. Ordinary methods remove padding around their parentheses and
use one space before a nonempty return type. Methods with trivia, ignored text,
line separators or semicolon protection keep their source. [fixture:
class/member-lines/method-padding] [fixture:
class/member-lines/method-values-and-classifiers-runs-collapsed] [fixture:
class/member-lines/method-trivia-and-semicolon-kept] [fixture:
class/member-lines/runs-collapsed] [fixture: class/generic-types/kept] A label
of only whitespace keeps the whitespace after its `:`, at the end of its line:
`A --> B : ` has an empty title and `A --> B` none. [fixture:
class/labels/blank-kept] On a line that holds a `;`, whether whitespace follows
the `:` of a label is kept as written, since the line rule of mermaid.js reads a
`:` directly followed by text up to a `#`. [fixture:
class/labels/semicolon-line-kept] See [Labels](./class.md#labels) and
[Member lines](./class.md#member-lines).

## Unclosed backquoted names

A backquoted name that is not closed runs to the end of the text, with the
whitespace and line breaks at its end. It is printed as written to the end of
the text, and no line break is added after it. [fixture:
class/unclosed-backquoted-names/kept] See
[Unclosed backquoted names](./class.md#unclosed-backquoted-names).

## Description block indentation

Separate an ordinary `accDescr` keyword and its opening `{` with one space,
including in empty blocks. This is how Prettier prints the space before a `{`,
without changing its text. Interior contacts and trivia keep their own rules.
[fixture: info/description-blocks/block-gap-presence] [fixture:
flowchart/accessibility-lines/empty-block-touching-keyword]

Ordinary closed multiline `accDescr` bodies use the statement's continuation
indentation, with a separate `}` at the statement's level. Mermaid discards
leading spaces and tabs after LF from the description. Keep the remaining text,
line breaks, trailing whitespace and directive contents. Quoted strings and
opaque data blocks retain their separate value-preservation rules. [fixture:
flowchart/multi-line-values/accdescr-block-kept]

Where the text starts on a line after the `{`, the whitespace between the `{`
and that line break is left out, also where the raw body columns stay:
mermaid.js reads the whitespace after the `{`, line breaks included, with the
`{`, so the text starts after it and the Db is the same. `accDescr { ` followed
by a line break is printed `accDescr {`. A comment or a directive after the `{`
stays, with the gap before it as under
[Directives between tokens](#directives-between-tokens), where a run or a tab
becomes one space; the whitespace after a directive at the end of the line is
left out like the whitespace after the `{`, and the whitespace after a comment
is part of the comment, so it stays. Text on the line of the `{` is spaced as
any other token. This holds in every diagram type that has the block. [fixture:
flowchart/multi-line-values/accdescr-block-opener-whitespace-dropped] [fixture:
flowchart/multi-line-values/accdescr-block-opener-tab-dropped] [fixture:
flowchart/multi-line-values/accdescr-block-opener-directive-trailing-dropped]
[fixture:
flowchart/multi-line-values/accdescr-block-opener-directive-run-collapsed]
[fixture:
flowchart/multi-line-values/accdescr-block-opener-directive-tab-collapsed]
[fixture:
usecase/direction-and-accessibility/accdescr-block-opener-directive-trailing-dropped]
[fixture: treeview/description-blocks/opener-directive-trailing-dropped]
[fixture:
flowchart/multi-line-values/accdescr-block-opener-comment-trailing-kept]
[fixture:
flowchart/multi-line-values/accdescr-block-subgraph-opener-whitespace-dropped]
[fixture: pie/description-blocks/opener-whitespace-dropped] [fixture:
c4/description-blocks/opener-whitespace-dropped] [fixture:
agentflow/accessibility/global-description-opener-whitespace-dropped]

Keep authored description columns when the raw text also determines membership:
inside flowchart subgraphs, Agentflow flow/global bodies and ER subgraphs.
Changing a global body's text can change a later flow's members. Treeview box
mode also keeps body columns because indenting a plain physical line can reject
the input. Eventmodeling's raw common terminals follow their own rules.
[fixture:
flowchart/multi-line-values/accdescr-block-subgraph-raw-membership-kept]
[fixture: agentflow/accessibility/global-description-membership-kept] [corpus
fixture: er/db-subgraph-nodes-acc-descr-block-lines] [corpus fixture:
treeview/box-block-tail-decoration-ascii-dash-control] [fixture:
eventmodeling/description-blocks/description-whitespace-literal-retained]

## State ids spelled as keywords

In a state diagram, `scale`, `classDef`, `class`, `style`, `state`, `note`, and
`stateDiagram`, in any case, are keywords only when whitespace follows them. A
transition from an id spelled so keeps its arrow touching on both sides, as in
`scale-->B`, and a description after such an id keeps its `:` touching it:
`scale -->B` and `style :x` are rejected. [fixture:
state/arrow-spacing/touching-before-keyword-kept] [fixture:
state/arrow-spacing/compat-keyword-ids-transition] [fixture:
state/descriptions-and-labels/compat-keyword-ids-description] See
[Arrow spacing](./state.md#arrow-spacing).

## State notes, aliases, and names

In a state diagram, what follows the id of a note on one line is kept as
written: mermaid.js reads the text of the note from right after the id, without
its first two characters. [fixture: state/notes/kept]

For multiline block notes, the restricted [Notes](./state.md#notes) rule aligns
every content line of a single paragraph one level inside the note, using ASCII
spaces even with `useTabs`. Tabs in the source margin are allowed only in the
first content line's trimmed margin; later tab margins stay written. Inline
emphasis, code closed on the same physical line, and noninitial exact `<br/>`
forms are included. Outer blank rows stay exact. Literal marker continuations
align only when the source and output both retain the required four-space
margin. Only permitted ASCII-space prefixes in raw `notes[].text` may differ,
while rendering stays the same. [fixture: state/notes/payment-prose] [fixture:
state/notes/prose-tab-margin-kept] [fixture: state/notes/later-tab-margin-kept]
[fixture: state/notes/over-lines-text-ends-kept] [fixture:
state/notes/inline-emphasis-margins] [fixture: state/notes/inline-code-margins]
[fixture: state/notes/inline-br-margins] [fixture:
state/notes/markdown-ordered-list-kept] [fixture:
state/notes/literal-markers-zero-width]

Keep later margins for block syntax, blank-separated paragraphs, hard breaks,
multiline code, strikethrough, general HTML and other protected forms. These
margins can appear in the rendered label: changing indentation inside `<pre>` or
after a blank line can change its size or layout. For such bodies, only a
nonempty first physical row with ASCII-space/tab padding aligns; Mermaid trims
that margin, so the raw Db stays identical. Use the configured body level for
that first row, regardless of later margins or whether later content exists. Do
not copy authored later indentation into it. Later bytes stay exact even when
their margins differ from the first line. [fixture:
state/notes/backslash-margins-kept] [fixture:
state/notes/protected-tab-margins-kept] [fixture: state/notes/single-markup-row]

Trivia, semicolons and protected joining regions keep the whole body written.
This does not reformat general Markdown. [fixture: state/notes/html-note-kept]
[fixture: state/notes/html-pre-first-line] [fixture:
state/notes/html-break-first-line] [fixture:
state/notes/first-tab-markup-margin] [fixture:
state/notes/over-lines-empty-lines-kept] [fixture:
state/notes/list-body-margin-kept] [fixture:
state/notes/heading-at-paragraph-boundary-kept] [fixture:
state/notes/prose-trailing-spaces] [fixture:
state/notes/code-spanning-lines-kept] [fixture:
state/notes/strikethrough-spanning-lines-kept] [fixture:
state/notes/marker-at-paragraph-boundary-kept]

The second description of an alias definition is kept as written, with the
whitespace at its ends, which mermaid.js reads. [fixture:
state/aliases/second-description-kept] The names and the empty strings after
`state` stay on the line of `state`: on a line of its own, a second name would
add a state. [fixture: state/statements-one-per-line/state-names-kept] A `%%` or
an empty description block right before a `{` is kept as written up to the `{`.
[fixture: state/composite-states/compat-comment-after-name-before-body]
[fixture: state/composite-states/compat-comment-line-before-body] [fixture:
state/composite-states/percent-before-body-kept] [fixture:
state/composite-states/empty-block-before-body-kept] [corpus fixture:
state/gram-ignored-state-comment-before-brace] See [Notes](./state.md#notes),
[Aliases](./state.md#aliases),
[Statements one per line](./state.md#statements-one-per-line), and
[Composite states](./state.md#composite-states).

## State lines that hold a line separator

In a state diagram, a line that holds U+2028 or U+2029 is kept as written:
mermaid.js stops at these characters when it looks for a pseudostate mark, a
direction line, and a second name before a `{`, while the plugin reads them as
whitespace. [corpus fixture: state/lex-pseudostate-mark-after-line-separator]
See [Line separators](./state.md#line-separators).

## ER lines that the place or the whitespace decides

mermaid.js reads some ER lines as the place they stand in or the whitespace
around them decide, so formatting keeps them as they are written. See
[Accessibility statements](./er.md#accessibility-statements),
[Statements one per line](./er.md#statements-one-per-line), and
[Relationship spacing](./er.md#relationship-spacing).

- An `accTitle`, `accDescr:`, or `accDescr {` statement that holds `direction`
  and a direction on its first printed line, where a text written on a later
  line is brought to the `:`. The line is judged as the lexer reads it, without
  the directives. The lexer tries the rule of a direction line after the rules
  of these statements, so at the first column the line is a title or a
  description, and after an indentation it is a direction line with the text
  `accTitle:` before `direction`: the title is lost. The statement keeps the
  first column. The direction may stand on a later line, after empty lines,
  comment lines, and directives, which the lexer does not read. [fixture:
  er/accessibility-statements/first-column-for-direction-text] [fixture:
  er/accessibility-statements/first-column-value-after-directive-line] [corpus
  fixture: er/lex-acc-title-direction] [corpus fixture:
  er/lex-acc-descr-block-direction]
- The entity `1`, right before another statement, the `end` of its subgraph, or
  a unit of a relationship that starts with a letter, a digit, or `_`, also
  after directives between them. `1` followed by whitespace, line breaks
  included, and such a character is the cardinality `only-one` (diagrams/er.md,
  the cardinalities, rule 11), so `1a` stays on its line, and
  `1one to one B : x` stays touching. [fixture:
  er/statements-one-per-line/number-name-then-name-kept] [fixture:
  er/relationship-spacing/number-name-before-unit-kept] [corpus fixture:
  er/lex-name-number-then-letter]
- The entity `only` before a cardinality that starts with `one`. `only one` with
  exactly one space is the cardinality `only one`, while two spaces or a tab
  make `only` an entity, so the whitespace stays as written. [fixture:
  er/relationship-spacing/entity-only-before-one-kept] [corpus fixture:
  er/lex-only-one-two-spaces]
- The right cardinality `u`, which is `md-parent` only right before the name of
  the right entity, so a space after it is rejected. [fixture:
  er/relationship-spacing/md-parent] [corpus fixture:
  er/lex-md-parent-right-glued-name]
- The whitespace at the end of a `classDef` or `style` statement, which takes
  the line feed after it, so the next line goes on in the style. [fixture:
  er/styles-and-classes/trailing-whitespace-takes-next-line] [corpus fixture:
  er/lex-classdef-space-before-line-feed]

## Gantt lines that the whitespace decides

mermaid.js keeps the whitespace in some values of a Gantt chart and reads some
lines by the whitespace on them, so formatting keeps them as they are written.
See [Task data](./gantt.md#task-data), [Settings](./gantt.md#settings),
[Titles and sections](./gantt.md#titles-and-sections), and
[Lists](./gantt.md#lists).

- The whitespace at the ends of the value of `tickInterval`, `todayMarker`, and
  `section`. The Db keeps it, and it is drawn: `tickInterval  1week` with two
  spaces turns the ticks into the default ones, and `section  A` is another
  section than `section A`. The whitespace at the ends of `dateFormat`,
  `axisFormat`, and `title` is left out, and the whitespace between the text of
  a task description and its colon is set one space after the longest name of a
  section whose names have padding, or of the sections that share a column, and
  one space after a name that touches its colon (see
  [Texts after a keyword that are drawn the same](#texts-after-a-keyword-that-are-drawn-the-same)).
  [fixture: gantt/settings/trailing-whitespace-by-setting] [fixture:
  gantt/titles-and-sections/title-trailing-dropped-section-kept] [fixture:
  gantt/task-data/description-padding-tightened]
- The colon of a task named by a word that starts a statement once whitespace
  follows it: `title:T` is a task, and `title :T` is a title, so no whitespace
  is set before the colon of such a task (see
  [Task data](./gantt.md#task-data)). [fixture:
  gantt/task-data/colon-touching-keyword-name-kept]
- The whitespace after the `:` of a task, which the printer sets to one space.
  mermaid.js splits the data at its commas and trims each item
  ([`parseData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L496-L505)),
  so the whitespace is not in the Db. Both texts of 27 charts, with a space
  after the colon and without one, were drawn with the 17 versions on hand: the
  SVG was the same in all the drawings of the 13 versions from 10.9.0 to 12.3.0,
  and in the 4 versions before them the SVG or the pixels were the same in 88 of
  108 drawings, with an error before and after in 16, and in 4 only for the text
  with no space after a colon that a directive follows. Where the line rule of
  mermaid.js reads the line (the segment holds `style` or `classDef`, later a
  `:` followed by characters that are not whitespace, then a `#`, and later a
  `;`), the whitespace after every `:` from the first `:` after `style` or
  `classDef` to the last `#` before the last `;` stays as written (`:` after
  that `#` gets its space): `classDef it:a1,2024-01-01,2d;#y:3d;z:2d` has two
  tasks, `classDef it` and `#y`, and with a space after the first colon it has
  three, and the two texts are drawn differently by the 10 versions that count.
  [fixture: gantt/task-data/colon-touches-first-item] [fixture:
  gantt/task-data/colon-space-line-rule-kept]
- The whitespace inside an item of task data, the number of its items, and the
  case of its tags: `after   a1` is one item as written, `a : 1d,` has an empty
  item that `a : 1d` does not, and `Done` is no tag. [fixture:
  gantt/task-data/inner-whitespace-kept] [fixture: gantt/task-data/empty-items]
  [fixture: gantt/keyword-case/tags-case-kept]
- The whitespace after the `:` of a task whose data is whitespace only, and
  after the keyword of an `includes` or `excludes` statement whose list is
  whitespace only. mermaid.js needs a character of the data after the colon and
  of the list text after the whitespace that follows the keyword, so `a :` and
  `includes ` are rejected, and one whitespace character, or two, stay.
  [fixture: gantt/task-data/whitespace-only-data] [fixture:
  gantt/lists/whitespace-only]
- A U+FEFF between the items of a list of `includes` or `excludes`. mermaid.js
  lowers the case of the whole list text before it splits it, and the conversion
  ignores U+FEFF, so a capital sigma after it, at the end of a word, is `ς`,
  while after a space, or any other whitespace, it is `σ`. [test: U+FEFF between
  the items of a list]
- The name of a call, with its whitespace: `f ()` and `f()` call two functions,
  while the whitespace in the arguments is printed in one form (see
  [Call arguments that are drawn the same](#call-arguments-that-are-drawn-the-same)).
  [fixture: gantt/click-statements/call-name-kept-arguments-spaced]
- A line that holds a kept `;`: its statements stay on it, since the line rule
  of mermaid.js reads the text of the line. [fixture:
  gantt/statements-one-per-line/ignored-semicolon-line-kept]
- A comment line that starts with `%%{` without being a directive, and a comment
  line with the mark `%` right before it, stand after one whitespace character.
  mermaid.js reads that `%%{` only after one whitespace character, or one after
  the line feeds, and rejects the text with more, or with none after an empty
  line (known divergence
  [`percent-brace-after-unit`](../../spec/docs/known-divergences/percent-brace-after-unit.md)),
  and a `%` comment that it reaches directly takes the line feeds after it
  (known divergence
  [`comment-takes-line-break`](../../spec/docs/known-divergences/comment-takes-line-break.md)).
  mermaid.js removes the directives before it reads the text, so the lines of
  only a directive before such a `%%{`, with empty lines between them or not,
  stand at the first column, and the spaces between the directives on the line
  of the `%%{` count as its whitespace. Where an input is read in the same way
  by mermaid.js and by the specification, as a `%%{` line at the first column or
  after one space or one tab, the formatter prints a form that both read in the
  same way, and not one that falls under these divergences. [fixture:
  gantt/comments/percent-brace-line-after-blank-line] [fixture:
  gantt/comments/percent-comment-then-percent-brace-line]

## User journey lines that the whitespace decides

mermaid.js keeps the whitespace in some values of a user journey and reads some
lines by the whitespace on them, so formatting keeps them as they are written.
See [Task data](./journey.md#task-data) and
[Titles and sections](./journey.md#titles-and-sections).

- The whitespace at the ends of the name of a `section`, and between the text of
  a task description and its colon. The Db keeps it, so `section  S` with two
  spaces and `Make tea  : 5` with padding are not the same as their trimmed
  forms, and the padding that aligns the colons stays. The whitespace at the
  ends of a `title` is left out (see
  [Texts after a keyword that are drawn the same](#texts-after-a-keyword-that-are-drawn-the-same)).
  [fixture: journey/titles-and-sections/title-trailing-dropped-section-kept]
  [fixture: journey/task-data/description-padding-kept]
- The whitespace before a `#` after a `section`: it is part of the name, while
  after the data of a task it is not. After a `title` it is left out too, and
  one space stands before the `#`. [fixture:
  journey/titles-and-sections/title-hash-gap-one-space-section-kept] [fixture:
  journey/task-data/hash-ends-the-data]
- The whitespace inside a person, and the number of the people: `Me  Two` is one
  person as written, and `a,` has an empty person that `a` does not. [fixture:
  journey/task-data/people-inner-whitespace-kept] [fixture:
  journey/task-data/empty-people]
- The whitespace after the colon of a task whose data is whitespace only.
  mermaid.js needs a character of the data after the colon, so `A:` is rejected
  and `A: ` is a task, and one whitespace character stays. [fixture:
  journey/task-data/whitespace-only-data]
- A line that holds a kept `;`: its statements stay on it, since the line rule
  of mermaid.js reads the text of the line. [fixture:
  journey/statements-one-per-line/ignored-semicolon-line-kept]

## Requirement lines that the place or the whitespace decides

mermaid.js keeps the whitespace in some names and values of a requirement
diagram and reads some lines by the place they stand in, so formatting keeps
them as they are written. See [Names](./requirement.md#names),
[Fields](./requirement.md#fields),
[Styles and classes](./requirement.md#styles-and-classes), and
[Statements one per line](./requirement.md#statements-one-per-line).

- The whitespace inside an unquoted name. The Db keeps it, and it is drawn:
  `requirement spaced  name` with two spaces is not the same requirement as the
  one with one space. The whitespace at the ends of a name, a value, or a class
  is not in the Db, and is dropped, and a run inside a value, a class, or a
  string is printed as one space (see
  [Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
  [fixture: requirement/names/inner-whitespace-kept] [fixture:
  requirement/fields/value-inner-runs-collapsed] [fixture:
  requirement/class-lists/classes-with-spaces]
- A `#` or a `%` after an unquoted name or value. It is a character of the text,
  so `id: 1 #c` has the value `1 #c`, and the comment is not moved or touched.
  [fixture: requirement/comments/in-unquoted-text-is-text]
- A statement that a string at the end of a `style`, `classDef`, or `class`
  statement starts. The lexer is still in the style context there, and the line
  feed after the string lets the statement go on, so `style r fill:red "r"` and
  a line `:::c` give r the class c, while `"r"` and `:::c` on lines of their own
  are rejected. The statement is printed on a line of its own with its parts on
  one line, and, when a comment line or a directive stands in it, or it stands
  on a line that holds a `;`, it stays on the line of the statement before it,
  which is printed as written. [fixture:
  requirement/statements-one-per-line/string-continued-after-styles] [fixture:
  requirement/statements-one-per-line/continued-with-comment-line-kept]
  [fixture:
  requirement/statements-one-per-line/continued-on-semicolon-line-kept]
- The names of a `class` statement after a line break, which are read in the
  statement context, where an unquoted name may hold whitespace and other
  characters. On one line, they would be read in the style context, where an
  unquoted name is a `style-word`, and the statement would be rejected.
  [fixture: requirement/styles-and-classes/class-over-lines-kept]
- An `accTitle`, `accDescr:`, or `accDescr {` statement that holds `direction`
  and a direction on its first printed line keeps the first column, as in an ER
  diagram. [fixture: requirement/accessibility-statements/first-column-kept]
- A line that holds a kept `;`: its statements stay on it, since the line rule
  of mermaid.js reads the text of the line. A statement written over lines whose
  last line holds a `;` of the statement after it stays as written too, since
  the joined line would be read as a whole. [fixture:
  requirement/statements-one-per-line/semicolon-line-kept] [fixture:
  requirement/multi-line-statements/relationship-last-line-semicolon-kept]
- A body with no field: the `{` and the `}` on two lines, since mermaid.js needs
  a line break after the `{`. [fixture:
  requirement/bodies/empty-body-on-two-lines]

## Mindmap lines that the indentation or the empty lines decide

The Db of a mindmap reads the indentation of a node as its level, and mermaid.js
rejects some empty lines that this specification accepts, so formatting keeps
what the Db reads and does not repair what mermaid.js rejects. See
[Indentation](./mindmap.md#indentation) and
[Blank lines](./mindmap.md#blank-lines).

- The width of the step between a node and its children, in characters: the Db
  reads the level of a node as its indentation minus that of the root, so `root`
  with a child at 4 characters and one at 2 are different diagrams, and the
  widths in one diagram can differ. Only the indentation of the root, and the
  characters of the indentation, change. [fixture:
  mindmap/indentation/step-widths-kept] [fixture:
  mindmap/indentation/root-shifted-to-one-level]
- The whitespace after a directive at the start of a line, which counts as
  indentation of the node: the line is printed as written from the directive.
  [fixture: mindmap/directives/before-a-node-on-its-line]
- A diagram comment that a U+2028 or a U+2029 ends: the text after it is a new
  line, so a line break is written there. [test: U+2028 after a comment after a
  shape]
- The empty lines that mermaid.js rejects (known divergence
  [`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.md)):
  the ones after the header are dropped, which makes the output accepted, and
  the ones after a diagram comment between nodes stay, as one, as in the input.
  [fixture: mindmap/blank-lines/after-the-header-dropped] [fixture:
  mindmap/blank-lines/after-a-comment-between-nodes-kept]

## Timeline lines that the whitespace decides

mermaid.js keeps the whitespace in the periods, events, and section names of a
timeline, and reads a few lines by the place they stand in, so formatting keeps
them as they are written, except for the whitespace at the ends of a title, at
the end of the last event of a line, and the space that a colon gets before it.
See [Periods and events](./timeline.md#periods-and-events),
[Event statements](./timeline.md#event-statements), and
[Statements one per line](./timeline.md#statements-one-per-line).

- The whitespace around the colons of a period and its events. The Db keeps the
  whitespace before the colon of a period and the whitespace of an event beyond
  the one character after its colon, so `2004 : a` and `2004: a` are different
  periods, and the padding that aligns the colons stays. The whitespace at the
  end of a period is part of the text too, and so is that at the end of an event
  that another colon follows on its line; a text without it gets one space
  before the colon, except a period that is the word `title` or `section`, and
  the whitespace at the end of the last event of a line is left out, including
  an event that a line break separates from the next colon (see
  [Texts after a keyword that are drawn the same](#texts-after-a-keyword-that-are-drawn-the-same)).
  [fixture: timeline/periods-and-events/period-whitespace-kept] [fixture:
  timeline/periods-and-events/event-padding-kept-end-dropped] [fixture:
  timeline/periods-and-events/period-trailing-kept-event-end-dropped]
- The line on which an event stands. Joining the event on a later line to the
  line of the period with a space would add the space to the text of the event
  before it, and splitting an event off its line would leave the space at the
  end of the line before it. [fixture:
  timeline/periods-and-events/events-on-both]
- An event after a section on its line, as in `section T : Google`. The name of
  the section keeps the space before its colon, so the event stays on the line;
  without the space, as in `section T: Google`, it goes to a line of its own.
  [fixture:
  timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event]
  [fixture:
  timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event]
- A line of only a directive after the word `title` or `section` alone on a
  line, which is a period: the whitespace before the directive would become the
  text of a title or a section, so it stands at the first column. [fixture:
  timeline/periods-and-events/title-word-then-directive-line]
- A title or section with a comment line or directive between its keyword and
  text keeps its complete source, including value-owned padding. Accessibility
  lines instead follow
  [Structural continuations around comments and directives](#structural-continuations-around-comments-and-directives).
  A line that holds a `;` keeps its statements together. [fixture:
  timeline/multi-line-statements/comment-line-inside-kept] [fixture:
  timeline/statements-one-per-line/ignored-semicolon-line-kept]

An `accDescr` block indents later text lines by replacing only spaces and tabs
immediately after LF, which the Db setter discards. Its text, line breaks,
trailing whitespace and directive contents remain as written. [fixture:
timeline/multi-line-values/description-line-ending-whitespace] [fixture:
timeline/multi-line-values/description-directive-lines]

## Timeline texts that the versions read differently

Of the versions that count (see
[Versions of mermaid.js that count](#versions-of-mermaidjs-that-count)), 10.9.8,
11.7.0, 11.8.1, and 11.13.0 have no direction in the header of a timeline: they
read the words after `timeline` as the text of a period, and 11.14.0 and the
later versions read `LR` or `TD` as the direction. 10.9.8 also draws a title
that starts with a `#` differently from the later versions (see the last case).
Both texts of each case below were drawn with the ten versions, and a form that
one of them draws differently is kept as written. See
[Header and direction](./timeline.md#header-and-direction) and
[Titles and sections](./timeline.md#titles-and-sections).

- The case of the direction. `timeline td` and `timeline TD` followed by a line
  `2004 : a` or `title T` were drawn the same by the six versions from 11.14.0
  and differently by the four others, which draw the period `td` and the period
  `TD`. So `td` is not printed `TD`, though the examples in the documentation of
  mermaid.js write `TD`. [fixture: timeline/header-and-direction/direction-kept]
  [fixture: timeline/header-and-direction/direction-case-kept] [fixture:
  timeline/header-and-direction/spaces-before-the-direction]
- The text after a direction on the line of the header. `timeline TD title T`
  against `timeline TD` and a line `title T`, `timeline TD LR` against `TD` and
  `LR` on lines of their own, and `timeline LR 2004 : a` against the period on a
  line of its own were drawn the same by the six versions from 11.14.0 and
  differently by the four others (one period against a period and a statement).
  So the text after a direction stays on the line of the header. Without a
  direction (`timeline History`, `timeline title T`, `timeline 2004 : a`) the
  text on the line of the header and on a line of its own were drawn the same by
  all ten versions, and the text goes to a line of its own. [fixture:
  timeline/header-and-direction/second-word-stays-on-the-header-line] [fixture:
  timeline/header-and-direction/direction-then-period-stays] [fixture:
  timeline/statements-one-per-line/header-direction-then-title] [fixture:
  timeline/header-and-direction/text-after-the-header-without-direction-moves]
- A title whose text starts with a `#` on a later line than its keyword.
  `title`, a line break, and `  # c`, against `title # c` on one line, were
  drawn the same by the nine versions from 11.7.0, which draw the title `# c`
  for both, and differently by 10.9.8, which draws no title text for the first
  and the period `title` for the second. So the title stays as written.
  [fixture: timeline/titles-and-sections/title-hash-on-next-line-kept]

## Sankey lines that the characters or the quotes decide

mermaid.js reads a sankey diagram as CSV: it rejects a tab, a character outside
ASCII, and a space next to a quote, and it keeps the text of a string and of a
value. So formatting changes little, and keeps what the Db and the lexer read.
See [Indentation](./sankey.md#indentation) and [Commas](./sankey.md#commas).

- The first column of every line. A record that starts with a string has no
  indentation, since a space before a quote is rejected, and a line of only a
  directive is a line of whitespace once the directive is removed, which is
  rejected too. So no line is indented, and the options `useTabs` and `tabWidth`
  have no effect. [fixture:
  sankey/indentation/quoted-first-record-at-the-first-column] [fixture:
  sankey/indentation/use-tabs] [fixture:
  sankey/indentation/directive-lines-at-the-first-column]
- The commas touch the strings, and no space is added next to a quote. The space
  before a field after a string is dropped. [fixture:
  sankey/commas/quoted-fields-touch-commas]
- Whether there is whitespace between a `:` and a later `#` of a line that holds
  `style` or `classDef` before the `:` and a `;` after the `#`. The line rule
  ignores the last `;` of a line only when no whitespace lies between them, so a
  comma between them keeps whether whitespace is around it, and a line that
  dropping a `;` would change the end of is printed as written. Where there is
  whitespace, it is one space. [fixture:
  sankey/commas/style-line-colon-and-hash-in-two-fields-kept] [fixture:
  sankey/commas/style-line-spaces-between-colon-and-hash-become-one] [fixture:
  sankey/commas/semicolon-ends-the-line-kept] [fixture:
  flowchart/semicolons/style-line-gap-between-colon-and-hash-kept]
- A field of spaces only, which is a field with an empty text, is printed as one
  space, and a value of spaces only before another record ends its line with
  that space. [fixture: sankey/commas/spaces-only-field-is-one-space] [fixture:
  sankey/commas/spaces-only-value-before-another-record]
- The text of a string, with its line breaks, the empty lines in it, and the
  whitespace at the start of a later line, which is part of its value. [fixture:
  sankey/multi-line-strings/string-over-lines] [fixture:
  sankey/multi-line-strings/empty-line-in-string]
- A tab, U+00A0, U+3000, U+2028, U+2029, and U+FEFF at the end of the text,
  which mermaid.js accepts only there, are dropped. [test: U+3000 at the end of
  the text without a line feed]

## XY chart lines that the units, the quotes, or the lexer decide

Most whitespace of an XY chart is not in the Db, so formatting changes it. What
the Db or the lexer reads stays. See [Text units](./xychart.md#text-units) and
[Quotes](./xychart.md#quotes).

- Whether two units of a text without quotes touch. A keyword is a keyword only
  where no character of a word follows it, so `x-axis Title1 --> 5` has the
  title `Title`, and a space in `Title 1` would make the keyword `Title`, which
  mermaid.js rejects here; `title ba r` is not the keyword `bar`, and joining
  the units makes it one. So a run of whitespace becomes one space, and units
  that touch keep touching. [fixture: text-units/title-then-range-touching-kept]
  [fixture: text-units/plot-title-digits-touching-kept] [fixture:
  text-units/category-digits-touching-kept] [fixture:
  text-units/hyphen-and-number-touching-kept]
- The case of the orientation. Only `horizontal` in lower case makes the chart
  horizontal, and `Horizontal` makes it vertical, so the case is in the Db.
  [fixture: header-and-orientation/orientation-case-kept]
- A string, with the line breaks in it, which are in the Db, and the quotes of a
  text of several words: `"a b"` and `a b` are not the same text, so they stay
  as written. A run of spaces and tabs in a string is printed as one space. A
  text of one word changes its quotes only as
  [The quotes of a text](#the-quotes-of-a-text) says. [fixture:
  quotes/strings-runs-collapsed] [fixture: quotes/texts-of-several-words]
  [fixture: multi-line-values/string-with-line-breaks-kept]
- The digits of a category and of a title, which are text, so `007` and `.5`
  stay as written; the numbers of a range and of a plot are printed in the
  shortest form (see
  [Spellings that are drawn the same](#spellings-that-are-drawn-the-same)).
  [fixture: numbers/categories-are-texts] [fixture:
  numbers/range-numbers-one-form]
- A block `accDescr {` that is not closed, which runs to the end of the text:
  mermaid.js reads no text for it, and a `}` that the printer wrote would make
  it a description. [fixture:
  accessibility-statements/block-not-closed-kept-as-written]
- A line that the line rule of mermaid.js reads, with a `style` or `classDef`, a
  `:` and a `#` after it with no whitespace between them, and a `;` after that,
  keeps its statements together with the kept `;`; dropped style terminators
  follow
  [the style rule](./block.md#semicolons-at-the-end-of-a-style-statement).
  [fixture: statements-one-per-line/line-rule-line-kept-together] [fixture:
  multi-line-statements/semicolon-inside-joined]
- A statement with a comment or directive keeps the required line breaks while
  structural continuations align under
  [Structural continuations around comments and directives](#structural-continuations-around-comments-and-directives).
  [fixture: multi-line-statements/comment-line-inside-kept] [fixture:
  multi-line-statements/directive-inside-kept]
- Whether a comment touches the unit before it: mermaid.js reads a `%%` that
  touches a unit of one character together with that character (the known
  divergence `comment-takes-character`), and the printer keeps whether the
  comment touches. [fixture:
  comments/comment-glued-to-a-one-character-word-kept] [fixture:
  comments/comment-takes-a-character-kept]
- A U+2028 or U+2029 in the gap of a statement, which is printed as written.
  [test: U+2028 between the words of a title]
- An input of the known divergence `title-digit-after-axis-statement`, which the
  specification accepts and mermaid.js rejects, is split into statements on
  lines of their own, and mermaid.js accepts the result with the Db of the
  specification. [fixture:
  statements-one-per-line/axis-then-title-with-a-digit-split] [fixture:
  statements-one-per-line/axis-band-then-title-with-a-digit-split]

## Quadrant chart lines that the texts, the quotes, or the lexer decide

The whitespace inside quadrant labels, titles and accessibility texts is in the
Db, so formatting leaves those texts as written and changes the whitespace
around them. What the Db or the lexer reads stays. See
[Keywords and texts](./quadrant.md#keywords-and-texts) and
[Quotes](./quadrant.md#quotes).

- A form feed between two words, which is a character of the text and no space
  or tab. A string and the words after it keep the whitespace between them,
  since `"a" b` and `"a"b` are different texts. A run of spaces and tabs inside
  a text without quotes, a name, a title, or an accessibility description is
  printed as one space (see
  [Runs of whitespace in a text that are drawn the same](#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
  [fixture: keywords-and-texts/inner-runs-collapsed] [fixture:
  keywords-and-texts/string-then-text-whitespace-kept] [fixture:
  points/name-inner-runs-collapsed] [fixture:
  titles-and-accessibility-statements/text-inner-whitespace-kept]
- A word after the keyword `title` or `classDef` with no whitespace between them
  is a word of its own: `title1: [0.3, 0.6]` is a point named `title1`, and a
  space would make a title. [fixture:
  keywords-and-texts/word-after-title-keyword-is-a-point-name]
- The coordinates of a point, which are texts: `0.30` is not `0.3`. [fixture:
  points/coordinates-as-written]
- The arrow of an axis with no second text, which the Db reads as part of the
  left text. [fixture: axes/arrow-only]
- A string, with the line breaks in it, and the quotes of a string that holds
  what a text without quotes cannot (`"a: b"` has a colon, which a text without
  quotes is rejected for), which stay, while a run of spaces and tabs in it is
  printed as one space. A plain text loses its quotes, as
  [The quotes of a text](#the-quotes-of-a-text) says. [fixture:
  quotes/strings-runs-collapsed] [fixture: quotes/texts-that-need-quotes]
  [fixture: quotes/keywords-and-arrows-in-strings] [fixture:
  multi-line-values/string-with-line-breaks-kept]
- A `;` inside a title or an accessibility text, which is a character of it, and
  an empty description block inside a title, which is part of it. [fixture:
  statements-one-per-line/semicolon-in-a-title-is-text] [fixture:
  statements-one-per-line/empty-description-block-in-a-title-stays]
- A line that the line rule of mermaid.js reads, with a `style` or `classDef`, a
  `:` and a `#` after it with no whitespace between them, and a `;` after that,
  keeps its statements together with the kept `;`; dropped style terminators
  follow
  [the style rule](./block.md#semicolons-at-the-end-of-a-style-statement).
  [fixture: statements-one-per-line/line-rule-line-kept-together] [fixture:
  multi-line-statements/semicolon-on-the-last-line-joined]
- A point or accessibility statement with a comment or directive keeps the
  required line breaks while structural continuations align under
  [Structural continuations around comments and directives](#structural-continuations-around-comments-and-directives).
  [fixture: multi-line-statements/comment-line-inside-kept] [fixture:
  multi-line-statements/directive-inside-kept]
- Whether a comment touches the unit before it: mermaid.js reads a `%%` that
  touches a unit of one character together with that character (the known
  divergence `comment-takes-character`), and the printer keeps whether the
  comment touches. [fixture:
  comments/comment-glued-to-a-one-character-word-kept] [fixture:
  comments/comment-takes-a-character-kept]
- U+2028, U+2029, and U+00A0, which are characters of a word in a text, a name,
  a title, and an accessibility text, and stay where they stand, also in a gap.
  [test: U+2028 between the words of a text] [test: U+2028 around the arrow of
  an axis]

Ordinary point and class styles use `name: value`. Only ASCII spaces and tabs
next to the first colon are normalized; the value spelling stays intact. A style
with trivia, whitespace other than ASCII spaces and tabs, a semicolon or a
second colon, or on a protected semicolon line, keeps its interior as written.
The suffix after a second colon is not interpreted. [fixture:
quadrant/styles/style-colon-padding] [fixture:
quadrant/styles/style-colon-tab-padding] [fixture:
quadrant/styles/style-extra-colon-kept] [fixture:
quadrant/styles/style-directive-kept] [fixture:
quadrant/styles/style-semicolon-protected]

## Block diagram lines that the whitespace or the lexer decide

Most whitespace of a block diagram is not in the Db, so formatting changes it.
What the Db or the lexer reads stays. See [Rows](./block.md#rows),
[Shapes](./block.md#shapes), [Styles](./block.md#styles), and
[Multi-line statements](./block.md#multi-line-statements).

- The whitespace inside the parentheses of a block arrow, which is in the Db:
  `(right down)` has the direction `right `, and `( up)` has ` up`. [fixture:
  shapes/block-arrow-directions-as-written] [fixture:
  shapes/block-arrow-directions-whitespace-kept]
- The whitespace of `class`: of its ids and of its class name. [fixture:
  styles/class-ids-as-written] [fixture: styles/class-name-runs-collapsed]
  [fixture: styles/class-name-with-a-comma-runs-collapsed]
- A statement that starts with `%%`: mermaid.js reads `%%x` after a node as an
  id and a line that starts with `%%x` as a comment line, so the line that holds
  such a statement stays on one line. [fixture:
  rows/percent-id-stays-in-its-row] [fixture:
  rows/percent-id-keeps-columns-with-it] [fixture:
  rows/percent-id-after-end-not-moved] [fixture:
  rows/percent-id-after-the-header-stays-on-the-line] [fixture:
  comments/percent-in-a-line-is-an-id]
- A chain of links, `A --> B --> C`, which mermaid.js reads badly (its Db loses
  the nodes before the last) and which splitting would read otherwise, stays one
  statement on one line. [fixture: edges/chain-on-one-line]
- A line that the line rule of mermaid.js reads, with a `style` or `classDef`, a
  `:` and a `#` after it with no whitespace between them, and a `;` after that,
  keeps its statements together with the kept `;`; dropped style terminators
  follow
  [the style rule](./block.md#semicolons-at-the-end-of-a-style-statement).
  [fixture: multi-line-statements/line-rule-line-kept] [fixture:
  multi-line-statements/line-rule-line-kept-with-columns] [fixture:
  multi-line-statements/line-rule-line-kept-with-composite]
- A statement with a comment or directive keeps the required line breaks while
  structural continuations align under
  [Structural continuations around comments and directives](#structural-continuations-around-comments-and-directives).
  [fixture: multi-line-statements/comment-line-inside-kept] [fixture:
  multi-line-statements/directive-inside-kept]
- U+0085, which mermaid.js does not read as whitespace: it is a character of an
  id. A U+2028 or U+2029 in the gap of a statement is printed as written. [test:
  U+0085 inside an id] [test: U+2028 between two statements of a row]

## A comment line after U+2028 or U+2029

This common removal applies outside Agentflow's preserving size branch; see
[Agentflow values, comments, and the default size boundary](#agentflow-values-comments-and-the-default-size-boundary).

mermaid.js removes the comment lines from the text before it reads it. A comment
line `%%` is removed with the whitespace-only lines and the directives before
it, and with the line break that ends it (the comment region of the
specification's [Comment lines](../../spec/docs/common.md#comment-lines)). When
the region starts right after U+2028 or U+2029, or right where another region of
this kind ends, the text before it and the text after it become one line: `alt`,
U+2028, `%% e`, and a line ` a` is `alt a`. [corpus fixture:
common/comment-after-u2028] [corpus fixture:
flowchart/comment-lines-after-separator-006f79fb] A `#` comment is no such
region: the lexer of its diagram reads it. Nor is a `%%` with nothing after it,
or a line that starts with `%%{` without being a directive: mermaid.js does not
remove these as comment lines, and a class diagram reads them itself.

A line that mermaid.js reads this way runs over several lines of the source. The
formatter prints it as written, from its first line to its end, with the
statements that stand on it: it does not format the whitespace between them, and
it does not indent the lines after the comment line. This is one rule for every
statement, block opening, and header; a diagram comment that such a comment line
cuts is printed as written as well (see
[Line separators](./sequence.md#line-separators)). The line ends at the first
line break that no region removes, so what stands on the line after the comment
lines is part of it: a `;` there ends the name of a `subgraph` line without a
title and stays where it is. An empty line or a line of only whitespace ends the
line, unless a comment line follows it: before a comment line, such lines belong
to the region and are removed with it.

## Frontmatter

The YAML between the `---` lines is formatted with Prettier's YAML formatter.
The `---` lines are kept as written. [fixture:
flowchart/frontmatter-yaml/formatted]

YAML uses at least one space per indentation level, including with
`tabWidth: 0`. Its indentation carries block scalars and nested values: zero
width would make Mermaid reject a block scalar or change a title or
configuration. This shared minimum preserves the reading for every diagram type.
[fixture: ishikawa/frontmatter-yaml/zero-width-block-scalar-title] [fixture:
ishikawa/frontmatter-yaml/zero-width-nested-title] [fixture:
ishikawa/frontmatter-yaml/zero-width-nested-config] [fixture:
flowchart/frontmatter-yaml/zero-width-nested-title]

The YAML is kept as written when the `---` lines are indented, and when a line
of the formatted YAML has the form of a `---` line (the specification's
[Frontmatter](../../spec/docs/common.md#frontmatter)), which would end the
frontmatter early. Prettier prints such lines: it prints `--- !!map` after a
`%YAML` directive as `---` and `!!map` on two lines. [fixture:
flowchart/frontmatter-yaml/indented-delimiters-kept] [fixture:
flowchart/frontmatter-yaml/delimiter-line-kept]

The YAML is kept as written when it contains a `<` followed by an ASCII letter,
a digit, or `_`. The formatted YAML is checked too, as a guard against the YAML
printer of the installed Prettier version: no input is known whose formatted
form has a `<` that the written one lacks. [fixture:
flowchart/frontmatter-yaml/html-tag-kept] [fixture:
flowchart/frontmatter-yaml/compat-tag-start-digit-kept] [fixture:
flowchart/frontmatter-yaml/compat-tag-start-underscore-kept] [fixture:
flowchart/frontmatter-yaml/compat-less-than-without-tag-formatted] Such a `<`
may start an HTML tag, and mermaid.js rewrites `="..."` inside HTML tags before
it reads the YAML. Changing the quotes of a value inside a tag can change what
mermaid.js reads. For example, mermaid.js accepts `title: "<a b=\"c\">"`.
Prettier would print it as `title: '<a b="c">'`, which mermaid.js rewrites to
`title: '<a b='c'>'`, which is not YAML.

## Byte order mark

Prettier removes a byte order mark at the start of a file before the plugin
reads it, and adds it back afterwards. mermaid.js reads frontmatter after such a
mark only when the closing `---` line repeats the mark. So:

- When the mark stands before both `---` lines, mermaid.js accepts the text, and
  the plugin reports a syntax error. [corpus fixture:
  common/frontmatter-bom-both-delimiters]
- When the mark stands only before the opening line, mermaid.js rejects the
  text, and the plugin formats it. [corpus fixture: common/frontmatter-bom]

## Line endings

mermaid.js reads `\r\n` and a lone `\r` as line breaks, as it reads `\n` (the
specification's [Line terminators](../../spec/docs/common.md#line-terminators)).
Prettier converts them before the plugin reads the text, and the output has the
line ending of Prettier's `endOfLine` option, with the same lines as for a text
with line feeds. [test: a flowchart diagram with other line endings] [test: a
sequence diagram with other line endings] [test: a class diagram with other line
endings] [test: a state diagram with other line endings]

## Markdown code blocks

Prettier removes whitespace at the end of the last line of every code block in
Markdown, including the blocks the plugin formats. Where mermaid.js reads that
whitespace, the diagram changes: `style A fill:#f00, ` is accepted, and
`style A fill:#f00,` is rejected. The change can also be silent: the comment
`%% ` as the last line becomes `%%`, which is not a comment, and mermaid.js
reads it as a vertex named `%%`.

In the blocks the plugin formats, whitespace at the end of the other lines is
kept. The blocks it does not format are left to Prettier, which removes
whitespace at the end of every line.

## The error pseudo-diagram

The `error` pseudo-diagram that mermaid.js accepts, a text of the word `error`
with only comments, directives, and line breaks around it, has nothing to
format: its printer prints the whole text as written, the frontmatter included,
in a standalone file. Only the line endings may change: they follow Prettier's
`endOfLine` option, as for every other language. In Markdown, the code block is
left to Prettier. [fixture: error/as-written/frontmatter-kept] [fixture:
error/as-written/trailing-whitespace-and-comment-kept] [fixture:
error/as-written/directive-kept] [corpus fixture: common/error-pseudo-diagram]
[corpus fixture: common/error-comment-inside]

## Kanban indentation, opaque suffixes, and kept lines

The Db of a kanban board has no indentation: it tells a section from an item by
comparing the indentation of a node with that of the first node. So the printer
chooses the indentation, one step for a section and two for an item, and keeps
what decides the roles. Bare-id, label, icon, and class whitespace remains value
text. Decorations align with their node; an inline-directive line keeps its
directives and the gaps beside them, and the printer chooses the whitespace
before the first one. A data block with invalid YAML is accepted by the parser
as opaque text, although mermaid.js rejects it (known divergence
[`embedded-data-opaque`](../../spec/docs/known-divergences/embedded-data-opaque.md)),
and the printer retains its opaque content with only eligible margin movement.
See the [kanban rules](./kanban.md). [fixture:
kanban/indentation/sections-and-items] [fixture:
kanban/icons-and-classes/aligned] [fixture:
kanban/directives/leading-directive-indentation-decided] [fixture:
kanban/trailing-whitespace/class-trailing-trim]

Data blocks keep their contents apart from the eligible uniform margin change
and the spaces at the ends of a block on one line in
[Data blocks](./kanban.md#data-blocks), and their attachment, including touching
adjacent blocks and intervening directives; YAML formatting applies only to
guarded frontmatter. Complete blank/comment gaps after diagram comments,
terminal gaps included, stay as written under
`blank-line-after-header-or-comments`. A raw rejection has no raw Db; the corpus
checks the specified reading. [fixture: kanban/data-blocks/adjacent] [fixture:
kanban/data-blocks/data-adjacent-directive] [fixture:
kanban/blank-lines/div-between-comment-blank] [fixture:
kanban/blank-lines/comment-blank-trailing]

Lines kept because of the shared `style`/`classDef` line rule retain their
complete segments, whitespace, comments, and directives. Kanban keeps `;`,
including ignored semicolons: none is a statement separator. Removing a
semicolon or moving its inline comment can select a different last semicolon.
Unicode segment boundaries and comment endings remain characters; configured
CR/LF conversion is shared with the other diagrams. [fixture:
kanban/line-rule-and-kept-lines/line-rule-comment-to-own-line] [fixture:
kanban/line-rule-and-kept-lines/line-rule-classdef-and-style] [fixture:
kanban/semicolons/values] [test: kanban: line-rule-ls-segment] [test: kanban:
comment-ls-split-count] [test: a kanban diagram with other line endings]

## C4 argument units and physical lines

C4 keeps every written argument unit and slot, including nulls, empty strings,
ignored indices and sprites, excess arguments, and adjacent units. Bare and
quoted forms are printed as [The quotes of a text](#the-quotes-of-a-text) says;
a non-ASCII-space prefix before a bare quote or `$` stays because it selects
bare lexing. A whitespace-only unit after a quoted argument remains a unit. See
the [C4 rules](./c4.md). [fixture: c4/argument-spacing/null-space-kept]
[fixture: c4/empty-entries/named-null-slots] [fixture:
c4/number-like-text/excess-kept] [test: c4: tab-before-quote] [test: c4:
bare-dollar-prefix]

Ordinary named-attribute gaps format as `$key = "value"`, keeping key and quoted
contents intact. [fixture: c4/named-attributes/named-equals] [fixture:
c4/named-attributes/named-multiline]

Empty description blocks remain adjacent, with both `beforeBody` gaps retained,
because they supply neither a significant statement nor a newline. Multiline
argument values retain their lines and columns. Named-key exterior gaps retain
their line breaks with ordinary continuation indentation; joining direction text
can make an accepted input rejected even at column one. [fixture:
c4/empty-description-blocks/empty-header-gap] [fixture:
c4/empty-description-blocks/empty-boundary-next-gap] [fixture:
c4/empty-description-blocks/empty-on-close-line] [fixture:
c4/named-attributes/named-exterior-newline-kept] [fixture:
c4/named-attributes/named-key-newline] [fixture:
c4/direction-rejection/acc-colon-direction]

Inside multiline empty `beforeBody` blocks, standalone trivia uses one level
inside the containing header or call, and the closer aligns with that owner.
Existing adjacency and brace-joining rules still apply. [fixture:
c4/header/empty-header-comment-columns] [fixture:
c4/boundary-bodies/empty-beforebody-comment-columns]

Colon accessibility forms keep trivia line breaks while ordinary exterior tokens
and standalone trivia use continuation indentation. Own-line directives in
description blocks align with the body, keeping directive contents and contact
unchanged. Native `title` and `accDescription` value prefixes, direction-text
lines, semicolon protections and joining comment regions retain their separate
preservation rules. [fixture: c4/accessibility-lines/colon-trivia-continuations]
[fixture: c4/description-blocks/block-directive-lines]

Diagram comments retain their complete following gaps, including whitespace-only
recovery lines and terminal gaps; the `comment-takes-line-break` divergence is
not repaired by moving comments. C4 keeps every semicolon and Unicode segment
boundary. A segment that holds a kept `;` is formatted as anywhere else, except
where formatting could change which `;` the line rule ignores. The rule reads a
segment from the first `:` after `style` or `classDef` to the last `#` before
its last kept `;`, with no whitespace between the `:` and the `#` (see
[Semicolons](./flowchart.md#semicolons)), so the gaps and the padding inside
that stretch keep whether they hold whitespace, a run becoming one space, and
the rest of the segment follows the ordinary rules of this diagram. Indentation
and exterior trailing whitespace remain printer whitespace. [fixture:
c4/comments/comment-header] [fixture: c4/blank-lines/comment-recovery] [fixture:
c4/final-newline/comment-eof-gap] [fixture:
c4/line-rule-and-semicolons/semicolon-inline-comment] [fixture:
c4/line-rule-and-semicolons/semicolon-suffix-spacing] [fixture:
c4/trailing-whitespace/semicolon-line] [test: c4: ls-line-rule-segments]

## Venn implicit text and textual line rules

Venn's body is one step deep, and targetless text one step deeper: positive
indentation selects implicit text while its mode is enabled, while explicit text
stands at the level of the header, since indenting it there can make it implicit
text. Declarations retain same-line style, explicit text and title followers so
splitting cannot clear that mode. Leading directives keep the positive/zero
logical marker; diagram-comment gaps preserve the empty versus whitespace-only
line boundary before `%%{ }%%`. See the [Venn rules](./venn.md).

[fixture: venn/indentation/indent-width] [fixture:
venn/statements-one-per-line/header-declaration-group] [fixture:
venn/directives/directive-leading-marker] [fixture:
venn/blank-lines/whitespace-before-empty-braces] [fixture:
venn/blank-lines/blank-before-empty-braces-explicit]

Names, labels, complete bare/quoted styles, titles, repetitions and swallowed
fragments remain authored text, and so do the sizes that are not plain decimals;
a plain decimal size is printed in the shortest form (see
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same)). Empty
quoted names and styles are real values; bare whitespace, quoted whitespace and
empty quoted labels keep their different readings. Except for the line-ending
style terminator described above, semicolons stay, and a line with a kept
semicolon is formatted as anywhere else apart from the stretch that the line
rule reads (see [Line rule and kept lines](./venn.md#line-rule-and-kept-lines)).
Unicode separators inside comments or directives do not cut the kept part: Venn
diagram comments continue to LF/EOF.

[fixture: venn/name-lists/empty-quoted-targets] [fixture:
venn/labels/labels-empty-kept] [fixture:
venn/style-properties/style-atoms-spaced] [fixture:
venn/comments/ignored-fragment] [fixture:
venn/line-rule-and-kept-lines/line-rule-suffix-spacing] [test: venn:
ls-kept-comment-whitespace-line] [test: venn: ps-kept-directive]

Only accepted whitespace roles and the spellings of the section above normalize:
ordinary ASCII gaps, configured implicit indentation and the title's consumed
first separator. CR/CRLF use shared EOL handling; Unicode value characters
remain, and invalid ordinary gaps remain rejected. The shared failure, Markdown,
frontmatter and final newline paths apply. Specified token-boundary divergences
still fail, while C4-detection and opaque-YAML divergences use the specified
reading; raw rejection provides no raw Db.

[fixture: venn/whitespace-characters/tab-gaps] [fixture:
venn/title/title-next-line] [fixture: venn/header/div-c4-detector] [fixture:
venn/frontmatter-yaml/frontmatter-invalid-kept] [test: a venn diagram with other
line endings] [test: venn: unicode-role-whitespace]

## Ishikawa nesting and literal lines

Ishikawa uses the nested AST, not written indentation widths or temporary Db
levels: the root stands one configured positive step below the header, each
child one deeper, with a one-character minimum at `tabWidth: 0`. Root column is
not a parenting input. See the [Ishikawa rules](./ishikawa.md).

[fixture: ishikawa/indentation/indent-depth] [fixture:
ishikawa/indentation/indent-clamped] [fixture: ishikawa/indentation/indent-zero]

Quotes, empty-looking forms, apparent accessibility/style/data statements and
inline percent text remain literals. Internal directive gaps and joined
physical-line continuation columns stay written, including every trailing
literal character on ordinary and kept lines. The value is what was written; Db
equality does not require erasing it, the same choice as mindmap. Every
semicolon stays, with whole crossing literals and trivia protected by the shared
kept-stretch path.

[fixture: ishikawa/node-text/values-opaque] [fixture:
ishikawa/inline-directives/directive-in-value] [fixture:
ishikawa/trailing-whitespace/trailing-value-dropped] [test: ishikawa:
joined-common-region] [fixture:
ishikawa/line-rule-and-kept-lines/line-rule-kept]

Diagram-comment Unicode endings remain characters counted toward the following
node's depth indentation; common comment regions instead keep their swallowed
suffixes and joins. Ordinary blank runs collapse to one, including the
separating blank after diagram comments, while complete terminal diagram-comment
gaps stay written. Accepted divergences use their specified tree, and failures
are not repaired; raw rejection supplies no raw Db. Guarded frontmatter,
configured CR/LF conversion, EOF directives and Markdown host handling use
shared paths.

[test: ishikawa: ls-comment-boundary] [test: ishikawa: ps-comment-boundary]
[fixture: ishikawa/blank-lines/blank-comment-div] [fixture:
ishikawa/blank-lines/terminal-comment-complete-gap] [fixture:
ishikawa/node-text/div-c4] [fixture:
ishikawa/frontmatter-yaml/frontmatter-html-guard] [test: ishikawa: eol-crlf]
[test: ishikawa Markdown: quote-list-clamped]

Header-line directives touching the header stay there when a separated root
moves below. A whitespace-separated directive instead moves with a same-line
root and its following gaps count toward the root's indentation under
[Inline directives](./ishikawa.md#inline-directives); otherwise its removal
would leave header trailing whitespace that Mermaid rejects. A directive
touching root text keeps the whole header group, and header directives without a
same-line root keep their specified reading.

[fixture: ishikawa/standalone-directives/header-spaced-directive] [fixture:
ishikawa/standalone-directives/header-spaced-multiline-directive] [fixture:
ishikawa/standalone-directives/header-spaced-two-directives] [fixture:
ishikawa/standalone-directives/header-spaced-directive-comment] [fixture:
ishikawa/standalone-directives/header-touching-directive] [fixture:
ishikawa/standalone-directives/header-directive-touching-root] [corpus fixture:
ishikawa/div-header-space-directive-node]

## Agentflow values, comments, and the default size boundary

Agentflow body indentation uses the shared significant width, at least one space
per step even at `tabWidth: 0`. Moving an indented direction statement to column
one can turn its prefix into accessibility text or a syntax error. [fixture:
agentflow/direction/zero-title-indented] [fixture:
agentflow/direction/zero-description-indented] [fixture:
agentflow/direction/zero-style-direction]

The [Agentflow rules](./agentflow.md) reuse flowchart layout with distinct value
boundaries. Required one-unit gaps after style/classDef/class/linkStyle, before
class values, interpolation names and tooltips stay written: following
whitespace is value text. First-style leading whitespace and label-comment
padding remain characters. Names keep erased click/empty parts and the one
whitespace character that ends reading name text as a click id. A trailing
whitespace-only part drops when replacing its separator with LF makes it
exterior whitespace. [fixture:
agentflow/names-and-headings/empty-description-space-flow] Click
textBeforeUrl/textBeforeTooltip keeps each prefix and its source gaps. No
reserved-click exception applies. [fixture:
agentflow/single-space-gaps/style-first-spaces] [corpus fixture:
agentflow/lex-flow-name-click-state] [corpus fixture:
agentflow/gram-click-erased-before-url-tooltip]

Normal-size Agentflow comments continue through LS/PS to LF/EOF; apparent
comments inside strings, descriptions, callbacks and metadata are value text.
End/global consume ASCII spaces/tabs rather than LF, and the brace fold takes
only the whitespace immediately before the next LF. Metadata remains separate on
its written occurrence, including content-only rejections under the specified
opaque reading; raw rejection supplies no raw Db. [fixture:
agentflow/comments/comment-looking-values] [fixture:
agentflow/multiline-statements-and-values/brace-blank-kept] [corpus fixture:
agentflow/db-data-block-invalid-yaml]

At/above 50000 normalized UTF-16 units after frontmatter/directive removal,
retain the complete diagram text and ending. Below it, ordinary layout is
applied only if its planned measurement stays strictly below 50000. This keeps
Mermaid's comment-preservation branch stable despite indentation, final LF,
trimming and the host's restored BOM. Frontmatter keeps its shared YAML guards;
CR/LF and Markdown retain their shared host handling, including final
code-block-line trimming that can reject a null style. [fixture:
agentflow/default-size-branches/size-preserving-to-fallback-unsafe] [fixture:
agentflow/default-size-branches/size-below-planned-crossing] [test: agentflow
Markdown: null style host limitation]

## Usecase native syntax and authored values

Usecase follows its written AST: boundary membership, endpoint occurrences,
arrow/id boundaries, declaration/update roles and source order are not rebuilt
from the resolved Db. Body indentation is structural presentation, so
`tabWidth: 0` stays zero; guarded YAML retains the shared minimum of one.
`A --order` prints `A --o rder`, while `A -- order` keeps its complete target.
See the [usecase rules](./usecase.md). [fixture:
usecase/arrow-id-boundaries/circle-prefix-suffixes] [fixture:
usecase/indentation/indent-zero] [fixture:
usecase/frontmatter-yaml/frontmatter-zero]

Native `@{...}` metadata is parsed and validated syntax: only structural
whitespace changes, with all written separators, blank lines, spelling, order
and duplicates retained. JSON table data is opaque, including its number/escape
spelling and property order, but the `{` of its head touches the `@`; eligible
margins follow [JSON tables](./usecase.md#json-tables). Formatting fixtures
without supplied effects use the shared null Db comparison and written-source
check; the corpus uses recorded effects where available. The padding of a CSS
declaration around its first colon follows
[Styles that are drawn the same](#styles-that-are-drawn-the-same); the runs in a
declaration are printed as one space as well. [fixture:
usecase/native-metadata/metadata-inline] [fixture:
usecase/native-metadata/metadata-blank-lines-kept] [fixture:
usecase/json-tables/json-opaque] [fixture:
usecase/classes-and-styles/css-colon-padding] [fixture:
usecase/classes-and-styles/css-custom-gap-run-collapsed]

After common comment-region and line-terminator handling, the optional trailing
comma and physical line breaks between the last property and `}` total at most
two, with the comma allowed only before the line breaks. Keep the written line
breaks and blank lines of accepted tails. [corpus fixture:
usecase/gram-metadata-property-comma-no-newline] [corpus fixture:
usecase/gram-native-trailing-newline] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-three-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-four-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines] [corpus
fixture: usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
[corpus fixture: usecase/gram-edge-metadata-two-newlines] [corpus fixture:
usecase/gram-edge-metadata-three-newlines] [corpus fixture:
usecase/gram-metadata-trailing-comma-no-newline] [corpus fixture:
usecase/gram-native-trailing-comma-newline] [corpus fixture:
usecase/gram-metadata-trailing-comma-two-newlines] [corpus fixture:
usecase/gram-metadata-trailing-comma-three-newlines] [corpus fixture:
usecase/gram-native-trailing-newline-comma] [corpus fixture:
usecase/gram-metadata-tail-newline-before-comma] [corpus fixture:
usecase/gram-metadata-tail-newline-before-comma-newline] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-crlf] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-three-crlf] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-whitespace-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-whitespace-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-tab-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-tab-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-comment-two-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-comment-three-newlines] A comma between
properties permits zero or more line breaks. [corpus fixture:
usecase/gram-metadata-property-comma-no-newline] [corpus fixture:
usecase/gram-metadata-property-comma-one-newline] [corpus fixture:
usecase/gram-metadata-property-comma-two-newlines] [corpus fixture:
usecase/gram-metadata-property-comma-three-newlines]

Accessibility lines reuse class/C4 spacing: one space precedes the trimmed
value. Description bodies follow
[Description block indentation](#description-block-indentation), retaining
contents and line breaks while aligning ordinary body prefixes and a separate
closing brace. Comment-only bodies use the same body and closer alignment. See
the [usecase rule](./usecase.md#direction-and-accessibility). [fixture:
usecase/direction-and-accessibility/a11y-comment-empty-tabs] [fixture:
usecase/direction-and-accessibility/a11y-padding] [fixture:
usecase/direction-and-accessibility/a11y-closer-aligned]

Stereotype declaration suffixes retain whether whitespace is present before `<<`
and inside each delimiter, including inside system boundaries. A nonempty run
becomes one space; absent whitespace stays absent. Mermaid trims the interior
ends; whitespace before `<<` is structural. Interior text remains written;
protected common comment regions retain their complete values. This reuses the
[class statement-annotation rule](./class.md#whitespace-between-tokens).
[fixture: usecase/stereotypes/stereotype-padding] [fixture:
usecase/stereotypes/opener-gap-sides] [test: usecase: stereotype-opener-tab]
[fixture: usecase/stereotypes/stereotype-inner-kept] [fixture:
usecase/stereotypes/side-padding] [fixture:
usecase/stereotypes/boundary-suffixes] [fixture:
usecase/stereotypes/semicolon-padding-dropped] [test: usecase:
stereotype-comment-region-padding-kept]

Written labels, boundary title padding and continuation columns remain authored
even where trimming would have equal Db; a label between `'` is printed between
`"` as under
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same). Common
comment-region joins and native comments through LS/PS stay intact; semicolons
never separate statements and the stretch that the line rule reads is protected.
The six specified usecase divergences use their specified acceptance/reading,
and rejected trees follow the shared failure path. [fixture:
usecase/labels/label-quote-kinds] [fixture:
usecase/system-boundaries/boundary-headings] [fixture:
usecase/direction-and-accessibility/a11y-padding] [fixture:
usecase/statements-and-semicolons/semicolon-selected-boundary] [test: usecase:
comment-region-join] [test: usecase: unicode-comment]

Shared EOL, BOM, frontmatter, final-newline and Markdown handling apply.
Accessibility exterior whitespace is trimmed in standalone files and Markdown.
[fixture: usecase/final-newline/final-value-padding] [test: usecase Markdown:
last-value-padding]

## Pie hidden boundaries and authored values

The [pie rules](./pie.md) print the quotes of a label and the digits of a value
in one form (see
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same)) and
retain escapes, value continuation columns, duplicates and source order. Common
title/accessibility line edges compact like C4, but pie never joins a
next-physical-line value. Empty labels and description blocks are real syntax.
[fixture: pie/labels/label-quotes] [fixture: pie/numbers/number-spellings]
[fixture: pie/title/title-next-trivia] [fixture:
pie/description-blocks/block-empty]

Hidden YAML and hidden DIRECTIVE are PieIgnoredText, separate from leading
frontmatter and Root directives. Their complete hidden source stays in place,
and closing whitespace that can determine acceptance stays, including at EOF.
Required exterior LF and edge blanks follow
[pie Blank lines](./pie.md#blank-lines). Hidden YAML closers keep column one. A
detection-skipped prefix stays whole, including its leading LF and comments, so
ignored YAML cannot be promoted into frontmatter. Guarded YAML formatting
applies only to real frontmatter. [fixture:
pie/hidden-yaml/yaml-after-space-boundary] [fixture:
pie/hidden-directives/hidden-after-extra-lf] [fixture:
pie/frontmatter-yaml/preheader-leading-lf] [fixture:
pie/frontmatter-yaml/frontmatter-safe]

Pie uses zero body indentation at `tabWidth: 0`; YAML retains its shared
positive minimum. Every semicolon remains, and the stretch that the line rule
reads is protected. Physical EOL/BOM and final-newline handling are shared.
Markdown hosts trim final code-block-line padding, including final hidden
boundary padding; interior hidden boundary padding remains necessary before a
later statement. [fixture: pie/indentation/indent-zero] [fixture:
pie/frontmatter-yaml/frontmatter-zero] [fixture:
pie/directives-and-semicolons/selected-two-passes] [test: pie Markdown:
hidden-boundary] [test: pie Markdown: final-hidden-padding]

The pie corpus includes marked divergences with specified acceptance and Db
readings. Raw-rejected C4 detection, preheader Unicode and opaque YAML do not
supply raw Db evidence; available specified Dbs and trees are checked
separately. Rejected payloads follow the shared failure path. See
[Specified readings](./pie.md#specified-readings). [corpus fixture:
pie/div-detect-c4-label] [corpus fixture: pie/div-review-yaml-leading-invalid]
[corpus fixture: pie/div-preheader-retained-yaml-bare-ls] [test: pie Markdown:
rejected]

## Gitgraph hidden boundaries and authored history

The [gitgraph rules](./gitgraph.md) keep the header direction, bare/explicit
messages, reference forms, order digits and every source-ordered
option/statement occurrence. The colon after the header, `switch` for
`checkout`, and the quotes of a string are printed in one form (see
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same)).
String/reference padding, escapes, HTML, entities and tag order can change the
Db, and empty cherry-pick tags can suppress a default tag. The summary's
omission of messages does not permit deleting them. [fixture:
gitgraph/header/header-tb] [fixture: gitgraph/checkout-aliases/alias-one-form]
[fixture: gitgraph/messages/message-forms] [fixture:
gitgraph/quotes/quotes-one-form] [fixture: gitgraph/references/reference-empty]
[corpus fixture: gitgraph/number-precision] [fixture:
gitgraph/authored-values/inner-padding-change] [corpus fixture:
gitgraph/db-cherry-pick-only-empty-tags] [fixture:
gitgraph/order-and-repetitions/order-reverse-id]

GitgraphIgnoredText holds native hidden YAML/DIRECTIVE, separately from real
frontmatter and global directives. Keep its complete hidden source at its owner
and closing padding, including at EOF. Required exterior LF and edge blanks
follow [gitgraph Blank lines](./gitgraph.md#blank-lines). Hidden YAML closers
keep their source columns. Preserve the entire retained preheader prefix so
ignored YAML cannot become effective frontmatter. Safe real YAML uses the shared
formatter and positive indentation minimum at tabWidth zero. Global trivia,
comments and semicolon-protected groups use the shared preservation rules; a
protected header/first statement stays together. [corpus fixture:
gitgraph/lex-hidden-yaml-before-option-value] [corpus fixture:
gitgraph/lex-hidden-yaml-commit-closing-space] [corpus fixture:
gitgraph/lex-hidden-directive-commit-spare-lf] [fixture:
gitgraph/trailing-whitespace/hidden-eof-padding] [fixture:
gitgraph/frontmatter-yaml/prefix-retained] [fixture:
gitgraph/frontmatter-yaml/frontmatter-zero-minimum] [fixture:
gitgraph/global-directives/directive-sides] [fixture:
gitgraph/semicolons/semicolon-cross-trigger]

Common title/accessibility line edges compact, but never take a value from the
next physical line. Shared description-block layout keeps interior brace
contacts, empty blocks and trivia, and aligns ordinary body indentation under
[Description block indentation](#description-block-indentation). Physical EOL,
BOM and final newline use the shared host path. Markdown trims final payload
padding; interior hidden padding stays necessary. [corpus fixture:
gitgraph/title-next-line] [fixture:
gitgraph/title-and-common-values/a11y-no-next-line] [fixture:
gitgraph/title-and-common-values/a11y-fixed] [corpus fixture:
gitgraph/lex-description-block-only-comment] [test:
gitgraph/line-terminators-and-unicode/eol-string-crlf] [test: gitgraph Markdown:
hidden-boundary] [test: gitgraph Markdown: final-hidden-padding]

Marked divergences follow the specification: atomic directive/semicolon cuts,
body-only frontmatter HTML, opaque embedded data, C4 detection and bare-percent
preheader trivia. Raw rejection supplies no raw Db, including malformed YAML;
check available specified readings separately. Empty quoted options and empty
description blocks remain accepted. Parser failures report standalone syntax
errors and decline Markdown embedding without repairing the payload. See
[Specified readings](./gitgraph.md#specified-readings). [corpus fixture:
gitgraph/div-directive-in-commit] [corpus fixture:
gitgraph/div-style-semicolon-in-order-number] [corpus fixture:
gitgraph/div-frontmatter-cross-title-value] [corpus fixture:
gitgraph/div-frontmatter-invalid-yaml] [corpus fixture:
gitgraph/div-detect-c4container-comment-eof] [corpus fixture:
gitgraph/div-detect-bare-before-header-ls] [test: gitgraph Markdown: rejected]

## Info hidden boundaries and authored statements

The [info rules](./info.md) retain the written showInfo choice, common statement
order and repetitions, empty forms, quotes, escapes and value text. Ordinary
description-body prefixes follow
[Description block indentation](#description-block-indentation); other literal
and hidden-form continuation columns remain authored. Info's public Db summary
is empty even for common title and accessibility assignments; equal empty Dbs do
not authorize deleting source. Common line edges compact, while next-line values
stay separate. [fixture: info/statements-one-per-line/order-and-empty] [fixture:
info/authored-values/literal-quotes-escapes] [fixture:
info/title/title-next-comment-directive] [fixture:
info/accessibility-lines/a11y-line-braces]

InfoIgnoredText holds hidden YAML/DIRECTIVE at its original owner, separately
from real frontmatter and Root directives. Keep complete hidden source and
closing padding, including at EOF: these boundaries can decide acceptance.
Required exterior LF and edge blanks follow
[info Blank lines](./info.md#blank-lines). Hidden YAML closers retain their
columns. Keep the complete retained prefix, including leading LF and comment
columns, to prevent ignored YAML from becoming effective frontmatter and
changing configuration or acceptance. Only safe real YAML uses the shared
formatter and positive indentation minimum. [fixture:
info/hidden-yaml/yaml-block-space] [fixture: info/hidden-yaml/yaml-block-spare]
[fixture: info/hidden-directives/hidden-title-space] [fixture:
info/trailing-whitespace/trailing-hidden-eof-kept] [fixture:
info/retained-prefix/prefix-leading-lf-kept] [fixture:
info/frontmatter-yaml/frontmatter-zero-minimum]

All semicolons remain, and shared source-segment protection keeps crossing
values/trivia and protected header/body groups whole; changing a trigger's
segment can change acceptance. Global directive source remains, placed in its
gap as under [Directives](./flowchart.md#directives), since removing init can
change configuration despite the empty Db. Physical EOL and EOF-reaching global
endings use the shared path. Prettier removes/restores a leading BOM; inside the
plugin, an opening-fence BOM can therefore make hidden YAML read as real
frontmatter. A BOM repeated before the closer instead causes the shared
standalone syntax-error limitation. Markdown trims final payload padding;
interior hidden boundaries remain. [fixture:
info/semicolons/semicolon-style-classdef] [fixture:
info/global-directives/global-config-align] [fixture:
info/final-newline/final-open-global] [test:
info/line-terminators-and-unicode/bom-frontmatter-opening] [corpus fixture:
info/frontmatter-bom-both] [test: info Markdown: hidden-boundary] [test: info
Markdown: final-hidden-padding]

Marked readings follow the specification: atomic keyword cuts remain rejected,
while opaque embedded data, C4 detection and bare-percent preheader Unicode use
their specified acceptance. Raw rejection supplies no raw Db or invented
embedded effects. Parser failures report standalone syntax errors and decline
Markdown embedding without repairing the payload. [corpus fixture:
info/div-directive-flag-middle] [corpus fixture: info/div-selected-showinfo]
[corpus fixture: info/div-frontmatter-invalid-yaml] [corpus fixture:
info/div-c4container-title] [corpus fixture: info/div-bare-before-header-ls]
[test: info Markdown: rejected]

## Packet hidden boundaries and authored blocks

The [packet rules](./packet.md) print `packet-beta` as `packet` and keep all
three block forms: range, single and relative. Never reconstruct blocks from
published rows or remove occurrences after the publication cap. Repeated labels
stay separate, and empty common assignments remain: deleting an empty title can
restore an earlier title. Labels retain padding, escapes, HTML, entities and
physical continuation columns because rewriting these can change the Db; a label
between `'` is printed between `"` as under
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same). Numeric
digits remain written even when double conversion rounds or overflows them;
exponent/Infinity output is not packet syntax. [fixture:
packet/block-forms-and-order/block-three-forms] [fixture:
packet/block-forms-and-order/keep-interleaving] [fixture:
packet/block-forms-and-order/cap-unpublished-kept] [fixture:
packet/label-content/label-padding] [fixture:
packet/label-content/label-escapes] [fixture: packet/numbers/number-precision]
[fixture: packet/numbers/number-overflow]

PacketIgnoredText holds native hidden YAML/DIRECTIVE separately from real
frontmatter and Root directives. Keep its complete hidden source in its named
owner and closing padding, including EOF: these can decide whether a following
statement has visible EOL. Required exterior LF and edge blanks follow
[packet Blank lines](./packet.md#blank-lines). Keep internal and closing
columns, and keep the complete retained preheader prefix so ignored YAML cannot
become effective title/configuration. Only safe real frontmatter uses the
guarded YAML formatter and positive minimum indentation. Body indentation can
instead be zero at `tabWidth: 0`, since packet columns have no grammatical
meaning. [fixture: packet/hidden-yaml/yaml-all-range-gaps] [fixture:
packet/hidden-yaml/yaml-suffix-space] [fixture:
packet/hidden-directives/hidden-common-suffixes] [fixture:
packet/hidden-directives/hidden-eof-padding] [fixture:
packet/retained-prefix/prefix-retain] [fixture:
packet/frontmatter-yaml/frontmatter-zero-min] [fixture:
packet/indentation/indent-zero]

Common line edges compact, but never read a next-physical-line value. Shared
accessibility and description layouts retain empty forms and trivia; ordinary
description-body prefixes follow
[Description block indentation](#description-block-indentation). Other literal
and hidden-form continuation columns stay authored. Global directives keep
opaque content and attachment; removing init can change row configuration. All
semicolons remain, using shared segment protection for crossing values/trivia
and header/body groups: removing selected semicolons or moving their triggers
can change the Db. Physical EOL, BOM, final-newline and Markdown handling are
shared. Markdown trims final payload-line padding; interior hidden padding stays
necessary. [fixture: packet/title/title-no-next] [fixture:
packet/accessibility-lines/a11y-empty-next] [fixture:
packet/description-blocks/description-columns] [fixture:
packet/global-directives/global-standalone] [fixture:
packet/semicolons/semicolons-trigger] [fixture:
packet/semicolons/semicolons-component] [test: packet Markdown: hidden-boundary]
[test: packet Markdown: final-hidden-padding]

The six [specified readings](./packet.md#specified-readings) cover atomic
keyword/integer cuts, body-only frontmatter HTML, opaque embedded data, C4
detection and passed bare-percent trivia. Acceptance-changing text
`packet.bitsPerRow` follows the specified comparison path, retaining site
configuration, title and other settings. Raw rejection supplies no raw Db or
invented accepted effects. Hidden forms, empty labels and empty descriptions
need no new divergence. Parser failures report standalone syntax errors without
output and decline Markdown embedding without repairing the payload. [corpus
fixture: packet/directive-header-middle] [corpus fixture:
packet/div-selected-title-interior] [corpus fixture:
packet/config-frontmatter-fraction] [corpus fixture:
packet/config-frontmatter-overrides-site] [corpus fixture:
packet/c4container-label] [test: packet Markdown: rejected]

## Architecture values and hidden boundaries

The [architecture rules](./architecture.md) keep bracketed labels as complete
source ranges, including bare/quoted kind, quote spelling, empty quoted text,
escapes, HTML and entities, except for the spaces, tabs, and no-break spaces
next to the brackets of a title or an arrow label, which are dropped (see
[Label content](./architecture.md#label-content)). Interior whitespace and
escape conversion can change the Db. Text icons retain their complete
StringLiteral source, and named icons retain their names: trimming, decoding or
replacing these values can change what mermaid.js reads. `singleQuote` does not
rewrite icons or labels. Keep the actual arrow marker characters, including
reversed `>--<`, rather than reconstructing them from presence flags. [fixture:
architecture/label-forms/padded-quotes] [fixture:
architecture/label-content/bare-padding] [fixture:
architecture/label-content/html-entities] [fixture:
architecture/text-icons/double-quote] [fixture: architecture/text-icons/padding]
[fixture: architecture/named-icons/unknown-name] [fixture:
architecture/arrow-lines/arrow-reversed-markers]

Keep every native hidden YAML/DIRECTIVE source span in its AST owner and retain
consumed LF and closing padding outside it. These boundaries can decide
acceptance. Only the header's own hidden forms need no spare LF; a statement on
the header line still needs its statement boundary. Keep the complete retained
prefix so ignored YAML cannot become effective frontmatter. Only safe real
frontmatter uses guarded YAML formatting, with the shared positive minimum
indentation. All authored semicolons remain under shared segment protection;
removing a selected one can select another and change a label. Source order,
repeated constraints and empty common assignments remain written. [fixture:
architecture/hidden-forms/yaml-named-icon-title-and-parent-gaps] [fixture:
architecture/hidden-boundaries/header-and-statement] [fixture:
architecture/hidden-boundaries/suffix-space] [fixture:
architecture/frontmatter-yaml/prefix-leading-lf-keep] [fixture:
architecture/frontmatter-yaml/frontmatter-zero-minimum-block-scalar] [fixture:
architecture/semicolons/selection] [fixture:
architecture/source-order/authored-order]

The five existing [specified readings](./architecture.md#specified-readings)
cover atomic directive/selected-semicolon cuts, frontmatter HTML, opaque
embedded data and passed bare-percent trivia. Architecture has no
acceptance-setting configuration key and is detected before C4; no C4 detection
exception is added. Raw rejection supplies no raw Db or invented effects. Parser
failures report standalone syntax errors without repaired output and decline
Markdown embedding. Markdown's host trims the final payload line's padding;
interior hidden padding remains necessary. [corpus fixture:
architecture/div-directive-name] [corpus fixture:
architecture/div-semicolon-parent-id] [corpus fixture:
architecture/div-frontmatter-open-tag-icon] [corpus fixture:
architecture/div-frontmatter-invalid-yaml] [corpus fixture:
architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/label-content/hidden-looking] [test: architecture Markdown:
hidden-boundary] [test: architecture Markdown: final-hidden-padding] [test:
architecture Markdown: rejected]

## Radar authored groups and hidden boundaries

The [radar rules](./radar.md) retain every axis/curve/options group, entry form,
optional named-entry colon, repetition and source order. Extra or duplicate
named entries stay even when publication does not use them; positional and named
curves remain distinct. The header's optional colon is retained, with ordinary
preceding whitespace compacted as in gitgraph. NumericLiteral source spans that
are plain decimals are printed in the shortest form, and the others preserve a
zero at the start of the integer part, rounded precision, subnormals, underflow
and overflow rather than printing converted double values. Option values remain
authored: no tick cap, min/max reorder or replacement from drawing
configuration. Label StringLiteral spans keep empty/whitespace-only text,
escapes, HTML, entities, with a run of spaces and tabs inside a label printed as
one space; a label between `'` is printed between `"` as under
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same), and
`singleQuote` is not read. Deleting an empty label changes the ID fallback.
[fixture: radar/source-order/declaration-order-kept] [fixture:
radar/source-order/mixed-curve-forms] [fixture:
radar/header/join-separated-inline-alternative] [fixture:
radar/numbers/raw-number-forms] [corpus fixture: radar/db-number-subnormal]
[corpus fixture: radar/db-number-underflow] [corpus fixture:
radar/db-number-overflow] [fixture: radar/options/option-repetitions] [fixture:
radar/options/min-max-order-kept] [fixture: radar/quotes/quotes-and-empty]
[fixture: radar/quotes/padding-label] [fixture: radar/quotes/escape-label]
[fixture: radar/quotes/label-html-entity] [fixture:
radar/quotes/whitespace-only-labels]

Shared common-line trimming changes only ordinary value edges; trivia and
semicolon protection take precedence. Descriptions use the shared block layout,
including compact whitespace-only interiors and
[ordinary body indentation](#description-block-indentation). Each native hidden
form is printed once at its AST owner, with consumed LF and closing padding
retained outside its range. The last member of a group owns its suffix; it uses
the same boundary rule as other statements. Only the header's own hidden forms
use the header-edge exception. Keep the complete retained prefix so ignored YAML
does not become effective frontmatter; safe real frontmatter alone uses guarded
YAML formatting. All authored semicolons stay under shared segment protection,
preserving continuation columns without added indentation inside each protected
segment, including a semicolon on the last line of a multiline statement:
joining a style-like label to it can change another statement's value. [fixture:
radar/title/title-edge-trim] [fixture:
radar/description-blocks/block-empty-fixed] [fixture:
radar/multiline-values/physical-value-columns] [fixture:
radar/hidden-forms/named-entry-hidden-owners] [fixture:
radar/hidden-boundaries/header-axis-suffix] [fixture:
radar/hidden-boundaries/hidden-title-space] [fixture:
radar/trailing-whitespace/trailing-hidden-eof-kept] [fixture:
radar/retained-prefix/retained-leading-lf] [fixture:
radar/frontmatter-yaml/frontmatter-safe] [fixture:
radar/semicolons/semicolon-selected-kept] [fixture:
radar/multi-line-statements/semicolon-terminal-line]

A list containing comments or directives keeps its other authored entry newlines
too, so it remains a block as written. A separate closing brace aligns with the
statement. Comment-free lists still compact their ordinary entry newlines.
[fixture: radar/multi-line-statements/entry-comment-after-comma] [fixture:
radar/multi-line-statements/entry-global-lines]

Radar follows six existing specified readings: atomic directive and selected
semicolon cuts reject, frontmatter HTML is read from the body, embedded data
remains opaque, detection-passed bare-percent trivia stays trivia, and C4
keywords do not replace a selected radar diagram. Opaque comparison removes no
radar-specific acceptance key. Raw rejection supplies no raw Db or invented
accepted effects. Empty labels/descriptions and whole hidden forms are nodes,
not new divergences. Standalone failures report syntax errors without repaired
output; Markdown declines embedding. Physical CR/CRLF and leading BOM follow the
shared host limits; LS/PS remain value characters where the lexer reads them.
Markdown's host trims final payload padding while interior common-suffix padding
remains necessary. [corpus fixture: radar/directive-header-middle] [corpus
fixture: radar/div-semicolon-id] [corpus fixture:
radar/div-html-frontmatter-cross] [corpus fixture:
radar/frontmatter-invalid-keeps-config] [corpus fixture:
radar/bare-before-header-nbsp] [corpus fixture: radar/c4-component-axis-label]
[corpus fixture: radar/db-empty-labels] [corpus fixture:
radar/common-block-empty-interleaved] [test:
radar/line-terminators-and-unicode/crlf-values] [test:
radar/line-terminators-and-unicode/unicode-values] [test:
radar/line-terminators-and-unicode/leading-bom-header] [test: radar Markdown:
hidden-boundary] [test: radar Markdown: final-hidden-padding] [test: radar
Markdown: rejected]

## Treemap parentage and authored values

The [treemap rules](./treemap.md) preserve the ordered forest in AST children.
The tree already accounts for assigned row indentation: spaces and tabs each
count once; leaves close sections but never become parents, and class/common
statements do not participate. Ordinary roots use one positive configured step,
including at tabWidth zero because indentation determines parentage. A class
name touching a row keeps that contact and uses root baseline zero throughout
the diagram. Trailing or whitespace-line indentation moves once to the following
row. Standalone comment lines align with the next statement, or the last
statement at EOF, as described in [Comments](./treemap.md#comments). [fixture:
treemap/comments/aligned-depths] [fixture: treemap/comments/aligned-final]
Between statements, bare `%%`, non-directive `%%{` lines and standalone
directives stay at column one because mermaid.js rejects them when indented.
[fixture: treemap/comments/native-bare] [fixture:
treemap/comments/native-nonword] [fixture: treemap/comments/unclosed-directive]
[fixture: treemap/comments/mixed-directives] In a class-style separator,
standalone trivia and style continuation align one step inside `classDef`. The
style text and the protected semicolon segments of a statement over several
lines remain unchanged. [fixture: treemap/style-gaps/css-comment] [fixture:
treemap/style-gaps/css-directive-tabs] [fixture:
treemap/style-gaps/css-comment-semicolon-kept] Protected semicolon row
boundaries keep the body as written.

[fixture: treemap/indentation/leaf-closes] [fixture:
treemap/indentation/common-and-class] [fixture: treemap/indentation/zero]
[fixture: treemap/indentation/glued-roots] [fixture:
treemap/carried-indentation/section-space] [fixture:
treemap/carried-indentation/whitespace-line] [fixture:
treemap/comments/carried-space] [fixture: treemap/directives/leading] [fixture:
treemap/semicolons/body-kept]

Keep numeric source spelling, including commas, underscores, dots and precision,
except that a plain decimal is printed in the shortest form (see
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same));
reprinting the numeric value can change its reading or produce rejected syntax.
Names keep empty names, backslashes, entities, HTML and physical continuation
columns, with a run of spaces and tabs inside a name printed as one space; a
name between `'` is printed between `"` as under the same section. Class styles
remain whole authored literals, including internal and trailing padding; they
are not reformatted as CSS. Retain repeated classes, empty assignments,
unresolved selectors and source order. Common values and description blocks use
shared exterior spacing while retaining internal text and trivia. Every
semicolon stays, and the protected segments of a statement over several lines
retain their columns without extra indentation inside them.

[fixture: treemap/numbers/underscore] [fixture: treemap/numbers/precision]
[fixture: treemap/names/quotes] [fixture: treemap/names/physical-columns]
[fixture: treemap/styles/written] [fixture: treemap/styles/trailing] [fixture:
treemap/source-order/repetitions] [fixture:
treemap/accessibility-lines/title-padding] [fixture:
treemap/description-blocks/continuation] [fixture:
treemap/semicolons/protected-class-column]

The six existing [specified readings](./treemap.md#specified-readings) reject
atomic directive/selected-semicolon cuts, isolate frontmatter HTML quote
effects, leave embedded data opaque, do not reread detection-passed bare-percent
trivia, and keep treemap selected across later C4 words. Treemap has no native
hidden YAML/directive nodes and no acceptance setting to remove for opaque
comparison. Rejected input produces no repaired output. A raw-rejected input has
no raw Db; the corpus's accepted specified reading supplies the comparison
instead. The shared host normalizes CR/CRLF, guards real frontmatter YAML and
can trim the last Markdown code line's padding, including a style tail.

[corpus fixture: treemap/directive-header-middle] [corpus fixture:
treemap/div-semicolon-number-atom] [corpus fixture:
treemap/div-html-frontmatter-reverse] [corpus fixture:
treemap/div-frontmatter-invalid] [corpus fixture:
treemap/bare-before-header-space] [corpus fixture: treemap/c4-component-section]
[corpus fixture: treemap/hidden-yaml-body] [fixture:
treemap/frontmatter-yaml/html-guard] [test:
treemap/line-terminators-and-unicode/crlf-values] [test: treemap Markdown:
final-style-padding] [test: treemap Markdown: rejected]

## Treeview modes and authored values

The [treeview rules](./treeview.md) keep indentation-mode input in that mode.
For box diagrams they read the forest from AST children, including file parents,
and redraw ordinary branches and guides with fixed four-column cells. A
following sibling uses `├── `, the last sibling `└── `, and continuing ancestors
`│   `. Mixed or prefixed roots all receive root branches; otherwise roots and
first-generation branches start at column one. This deliberately replaces
misleading source columns, sibling marks, heavy strokes and dash counts with the
tree Mermaid reads. Nodes sharing a physical line also split in source order and
receive their branches from that tree.

[fixture:
treeview/statements-one-per-line/review159-box-quoted-line-rule-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-two]

[fixture: treeview/statements-one-per-line/review159-box-quoted-three]

[fixture: treeview/statements-one-per-line/review159-box-quoted-wide-gap]

[fixture: treeview/statements-one-per-line/review159-box-quoted-class]

[fixture: treeview/statements-one-per-line/review159-box-quoted-forest]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unbranched-root]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-box-quoted-directive-line]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-unselected-semicolon]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-protected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-comment-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-line]

[test: treeview/statements-one-per-line/review159-box-quoted-ls]

[test:
treeview/statements-one-per-line/review159-box-quoted-unprefixed-leading-ps]

[test: treeview/statements-one-per-line/review159-box-quoted-ps]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-block]

[test: treeview/tabs/review159-box-multiple-value-tab-retained]

[test: treeview/trailing-whitespace/review159-box-multiple-owned-tail-retained]

[fixture: treeview/branch-prefixes/rounding-half] [fixture:
treeview/branch-prefixes/first-positive] [fixture:
treeview/branch-prefixes/box-redraw-deep-jump] [fixture:
treeview/branch-prefixes/box-redraw-mixed-roots] [fixture:
treeview/branch-prefixes/box-redraw-heavy-to-light]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

Outer decoration becomes a continuing guide or a blank line, while a necessary
mode selector remains. A sole selector in an `accDescr` opener gap keeps only
that gap; other structure follows the description rules, while box-mode body
columns remain authored. Common and native-comment prefixes are removed; a
comment's carried branch is drawn once at its node. Prefixed annotations move
inline in source order only without an earlier description or intervening shared
trivia or selected semicolon. Indentation-mode annotation lines stay separate.
After a joining comment region or removed directive, an annotation starting its
own physical line keeps positive leading spaces at its owner's name column, with
a minimum of one space. This keeps its marker separate from the preceding name
even when Mermaid joins the LF. Every name, value, annotation occurrence,
arbitrary prefix character and shared trivia remains authored text.

[fixture:
treeview/decorations/review159-sole-opener-selector-line-rule-semicolon]

[fixture: treeview/decorations/review159-sole-opener-selector]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-block]

[fixture: treeview/decorations/review159-sole-opener-selector-inline-directive]

[fixture: treeview/decorations/review159-sole-opener-selector-directive-line]

[fixture: treeview/decorations/review159-sole-opener-selector-comment]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-line]

[test: treeview/decorations/review159-sole-opener-selector-ls]

[test: treeview/decorations/review159-sole-opener-selector-ps]

[fixture: treeview/decorations/review159-sole-opener-selector-value-prefix]

[test: treeview/annotation-lines/review159-region-line-rule-semicolon]

[test: treeview/annotation-lines/review159-region-class-ls-four]

[test: treeview/annotation-lines/review159-region-class-ps-four]

[test: treeview/annotation-lines/review159-region-class-ls-one]

[test: treeview/annotation-lines/review159-region-class-ps-one]

[test: treeview/annotation-lines/review159-region-class-ls-tab]

[test: treeview/annotation-lines/review159-region-class-ps-tab]

[test: treeview/annotation-lines/review159-region-icon-ls-four]

[test: treeview/annotation-lines/review159-region-icon-ps-four]

[test: treeview/annotation-lines/review159-region-icon-ls-one]

[test: treeview/annotation-lines/review159-region-icon-ps-one]

[test: treeview/annotation-lines/review159-region-icon-ls-tab]

[test: treeview/annotation-lines/review159-region-icon-ps-tab]

[test: treeview/annotation-lines/review159-region-description-ls-four]

[test: treeview/annotation-lines/review159-region-description-ps-four]

[test: treeview/annotation-lines/review159-region-description-ls-one]

[test: treeview/annotation-lines/review159-region-description-ps-one]

[test: treeview/annotation-lines/review159-region-description-ls-tab]

[test: treeview/annotation-lines/review159-region-description-ps-tab]

[test: treeview/annotation-lines/review159-region-unbranched-root-class-ls]

[test: treeview/annotation-lines/review159-region-unbranched-root-icon-ps]

[test:
treeview/annotation-lines/review159-region-unbranched-root-description-ls]

[test: treeview/annotation-lines/review159-region-forest-class-ps]

[test: treeview/annotation-lines/review159-region-forest-icon-ls]

[test: treeview/annotation-lines/review159-region-forest-description-ps]

[test: treeview/annotation-lines/review159-region-unprefixed-quoted-ls]

[test: treeview/annotation-lines/review159-region-quoted-class-ls]

[test: treeview/annotation-lines/review159-region-quoted-icon-ps]

[test: treeview/annotation-lines/review159-region-quoted-description-ls]

[test: treeview/annotation-lines/review159-region-repeated-classes-ps]

[test: treeview/annotation-lines/review159-region-directive-inline]

[test: treeview/annotation-lines/review159-region-protected-semicolon]

[test: treeview/annotation-lines/review159-region-unselected-semicolon]

[test: treeview/annotation-lines/review159-region-empty-block]

[test:
treeview/annotation-lines/review159-region-value-prefix-and-protected-row]

[fixture: treeview/decorations/box-redraw-decorations-guides] [fixture:
treeview/decorations/box-redraw-sole-selector-after-empty-block] [fixture:
treeview/comments/box-redraw-move-comment-prefix-once] [fixture:
treeview/annotation-lines/box-redraw-join-prefixed-class] [fixture:
treeview/annotation-lines/box-redraw-keep-after-description] [fixture:
treeview/annotation-lines/box-redraw-keep-comment-between]

[fixture: treeview/decorations/box-redraw-annotation-blank-repeat]

[fixture: treeview/decorations/box-redraw-annotation-blank-and-gap]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

[fixture:
treeview/decorations/box-redraw-annotation-blank-before-directive-line]

[fixture:
treeview/decorations/box-redraw-annotation-blank-after-inline-directive]

[fixture: treeview/decorations/box-redraw-annotation-blank-at-eof]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

[test: treeview/decorations/box-redraw-annotation-blank-ls]

[test: treeview/decorations/box-redraw-annotation-blank-ps]

Retain the complete body when prefix/decoration trivia, arbitrary prefix text,
fixed row boundaries, unsafe annotation movement, mode loss or changed value
reading prevents safe redrawing. Splitting that exposes leading Unicode
whitespace in a name on a new unprefixed line also keeps the body. Value-owned
prefixes and decoration keep their spelling, and the planned first-positive
branch width must preserve their indentation reading. Adding/removing a branch
must preserve value tabs and owned tails. Shared semicolon protection composes
with these conditions. Body-retained diagrams can still look different from
their read tree; the printer does not discard authored text to force visual
agreement.

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]
[fixture: treeview/multiline-values/box-redraw-value-width-changes] [fixture:
treeview/multiline-values/box-redraw-value-width-and-protected-line] [fixture:
treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]
[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-name] [corpus
fixture: treeview/box-tabs-after-selected-semicolon]

[fixture: treeview/annotation-lines/box-redraw-keep-inline-directive-between]

[fixture: treeview/annotation-lines/box-redraw-keep-directive-line-between]

[fixture: treeview/annotation-lines/box-redraw-keep-selected-semicolon-between]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[fixture: treeview/semicolons/box-redraw-arbitrary-prefix-on-protected-line]

[fixture: treeview/tabs/box-redraw-joined-description-value-tab-kept]

[fixture: treeview/tabs/box-redraw-joined-description-directive-tab]

The six existing [specified readings](./treeview.md#specified-readings), guarded
frontmatter, shared CR/CRLF handling and Markdown final-line trimming still
apply. Rejected standalone input produces a syntax error, without repair.

[corpus fixture: treeview/directive-header-inside] [corpus fixture:
treeview/semicolon-class-inside] [corpus fixture:
treeview/div-html-frontmatter-reject] [corpus fixture:
treeview/div-frontmatter-invalid] [corpus fixture: treeview/bare-line-nbsp]
[corpus fixture: treeview/c4-container-bare] [test: treeview Markdown:
final-bare-padding] [test: treeview Markdown: rejected]

## Railroad dialects and authored values

The [railroad rules](./railroad.md) preserve the selected IR, EBNF, ABNF or PEG
header, authored assignment delimiters, EBNF optional commas and expression
structure. Singleton calls and groups remain even where their normalized Dbs are
equal. Keep every rule, alternative, repeated metadata assignment and empty
reset in source order. The comparison Db excludes body titles; that does not
permit dropping their contents. [fixture: railroad/assignment/ebnf-spellings]
[fixture: railroad/ebnf-sequences/mixed] [fixture: railroad/calls/ir-singletons]
[fixture: railroad/groups/peg-delimiters] [fixture:
railroad/source-order/ir-duplicates] [fixture:
railroad/source-order/ebnf-duplicates] [fixture:
railroad/source-order/abnf-duplicates] [fixture:
railroad/source-order/peg-duplicates] [fixture: railroad/title/ir-trim]

Ordinary composite IR calls always use nested argument lines, independently of
`printWidth` and authored padding line breaks, to show the grammar hierarchy.
Values remain whole and trailing commas are not added. Plain `terminal`,
`nonterminal` and `special` calls keep their quoted values compact; a comment,
global directive or native hidden form at a call boundary makes a leaf call
multiline too. Call gaps use canonical outside spaces while preserving trivia
contents, internal contacts and written trivia line breaks. Native hidden forms
remain complete opaque items, including global directives inside them, while the
grammar around them receives structural indentation. After a line break
following a constructor, both parentheses use continuation indentation, with
their arguments one level deeper. Semicolons inside values do not prevent this
layout; lines containing `style` or `classDef` and ignored semicolons retain
their protected layout. EBNF, ABNF and PEG keep their flat layout. [fixture:
railroad/comments/ir-leaf-value-comments] [fixture:
railroad/comments/ir-leaf-boundary-comments] [fixture:
railroad/hidden-forms/ir-call-global-inside-native] [fixture:
railroad/hidden-forms/ir-call-native-yaml] [fixture:
railroad/long-lines/ir-expression-grammar] [fixture:
railroad/long-lines/ir-written-breaks] [fixture:
railroad/long-lines/ir-unary-width] [fixture:
railroad/long-lines/ir-comments-kept] [fixture:
railroad/comments/ir-call-inline-spacing] [fixture:
railroad/comments/ir-call-comment-lines] [fixture:
railroad/comments/ir-call-constructor-nested] [fixture:
railroad/global-directives/ir-call-boundaries] [fixture:
railroad/long-lines/ir-directive-kept] [fixture:
railroad/long-lines/ir-hidden-kept] [fixture:
railroad/long-lines/ir-semicolon-kept] [fixture: railroad/long-lines/ebnf-width]
[fixture: railroad/long-lines/abnf-width] [fixture:
railroad/long-lines/peg-width]

Strings keep their complete source spans, including empty and whitespace-only
values, escape spelling, HTML, entities and continuation columns; an IR, EBNF,
or PEG string between `'` is printed between `"` as under
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same), and
`singleQuote` is not read. ABNF backslash is ordinary content; the other three
dialects have backslash escapes. ABNF repeat bounds retain leading zeroes,
omitted bounds, exact forms and large integers; numeric values keep base-letter
case, digits, dots and hyphens as raw text. EBNF special sequences keep their
whole span, including exterior whitespace, with a run of spaces and tabs inside
printed as one space. Converting these spellings or reflowing values can change
the Db. PEG predicates keep their entire authored operand rather than rebuilding
it from a published label. [fixture: railroad/quotes/ir-escape] [fixture:
railroad/quotes/ebnf-escape] [fixture: railroad/quotes/abnf-backslash] [fixture:
railroad/quotes/peg-escape] [fixture: railroad/quotes/ir-empty-and-text]
[fixture: railroad/quotes/ebnf-empty-and-text] [fixture:
railroad/quotes/abnf-empty-and-text] [fixture:
railroad/quotes/peg-empty-and-text] [fixture: railroad/repeats/abnf-spellings]
[fixture: railroad/repeats/abnf-zero] [fixture: railroad/repeats/abnf-large]
[fixture: railroad/numeric-values/abnf-spellings] [fixture:
railroad/special-sequences/ebnf-content] [fixture:
railroad/multiline-values/peg-columns] [fixture: railroad/predicates/peg-nested]

Comment forms and contents remain written: all four dialects have `%%`, IR has C
comments, EBNF has C and ISO comments, ABNF has semicolon line comments and PEG
has hash line comments. LS/PS remain native line-comment content. A bare ABNF
`;` is punctuation; its terminator must meet LF or EOF immediately. Every rule's
required visible `;` stays attached where safe. Ordinary IR rules retain
semicolons inside values without freezing their layout; every other authored
semicolon stays under shared segment protection, including crossing values. Each
protected segment's first line uses one body step, matching other flat diagrams;
its later lines keep their written columns. Railroad lines containing the
literal string `style` or `classDef` after global directive removal stay as
written, including every statement, comment, native hidden form and inner gap.
They do not join their neighbors. A removed directive forming a word across
lines keeps all those lines. [fixture:
railroad/semicolons/ir-word-unclosed-directive-lines] [fixture:
railroad/semicolons/ebnf-word-unclosed-directive-lines] [fixture:
railroad/semicolons/abnf-word-unclosed-directive-lines] [fixture:
railroad/semicolons/peg-word-unclosed-directive-lines] A line is the complete
range that mermaid.js reads as one line. When a comment line after U+2028 or
U+2029 joins text before or after the line containing the word, or on both
sides, retain every connected source line. Only the first source line receives
one body indentation step; the contents and later source columns remain written.
[test: railroad/semicolons/ir-style-comment-before-ls] [test:
railroad/semicolons/ir-style-comment-after-ls] [test:
railroad/semicolons/ir-style-comment-both-ls] [test:
railroad/semicolons/ir-classdef-comment-before-ps] [test:
railroad/semicolons/ir-classdef-comment-after-ps] [test:
railroad/semicolons/ir-classdef-comment-both-ps] [test:
railroad/semicolons/ebnf-style-comment-before-ls] [test:
railroad/semicolons/ebnf-style-comment-after-ls] [test:
railroad/semicolons/ebnf-style-comment-both-ls] [test:
railroad/semicolons/ebnf-classdef-comment-before-ps] [test:
railroad/semicolons/ebnf-classdef-comment-after-ps] [test:
railroad/semicolons/ebnf-classdef-comment-both-ps] [test:
railroad/semicolons/abnf-style-comment-before-ls] [test:
railroad/semicolons/abnf-style-comment-after-ls] [test:
railroad/semicolons/abnf-style-comment-both-ls] [test:
railroad/semicolons/abnf-classdef-comment-before-ps] [test:
railroad/semicolons/abnf-classdef-comment-after-ps] [test:
railroad/semicolons/abnf-classdef-comment-both-ps] [test:
railroad/semicolons/peg-style-comment-before-ls] [test:
railroad/semicolons/peg-style-comment-after-ls] [test:
railroad/semicolons/peg-style-comment-both-ls] [test:
railroad/semicolons/peg-classdef-comment-before-ps] [test:
railroad/semicolons/peg-classdef-comment-after-ps] [test:
railroad/semicolons/peg-classdef-comment-both-ps] Shared kept-line layout also
retains whole crossing statements and indivisible values/trivia. mermaid.js can
ignore the last semicolon of such a line; in railroad this can remove a required
terminator or an ABNF comment mark, so formatting could reject a rule or turn
comment text into code. This source preservation protects both without
predicting the line rule after movement. The cost is that names, strings and
comments containing these strings leave their lines unformatted even without a
colon/hash. Other lines format normally; words found only inside removed
directives do not protect a line. [fixture: railroad/comments/ir-positions]
[fixture: railroad/comments/ebnf-positions] [fixture:
railroad/comments/abnf-positions] [fixture: railroad/comments/peg-positions]
[fixture: railroad/comments/abnf-before-terminator] [fixture:
railroad/statements-one-per-line/abnf-terminators] [fixture:
railroad/semicolons/ir-value-last-line] [fixture:
railroad/semicolons/ebnf-special-last-line] [fixture:
railroad/semicolons/abnf-protected] [fixture:
railroad/semicolons/peg-value-last-line] [fixture:
railroad/semicolons/ir-style-call-close] [fixture:
railroad/semicolons/abnf-style-group-newline] [fixture:
railroad/semicolons/ir-protected-rule-indent] [fixture:
railroad/semicolons/ir-protected-multiline-indent] [fixture:
railroad/semicolons/ir-leading-c] [fixture:
railroad/semicolons/ebnf-leading-iso] [fixture:
railroad/semicolons/ebnf-leading-c] [fixture:
railroad/semicolons/abnf-leading-hidden] [fixture:
railroad/semicolons/peg-leading-hidden] [fixture:
railroad/semicolons/ir-leading-multiline-c] [fixture:
railroad/semicolons/ir-header-leading-c] [fixture:
railroad/semicolons/ir-leading-directive-c] [fixture:
railroad/semicolons/ir-after-rule] [fixture:
railroad/semicolons/ebnf-after-description] [fixture:
railroad/semicolons/abnf-after-description] [fixture:
railroad/semicolons/peg-after-rule-name] [fixture:
railroad/semicolons/ir-kept-description-hidden] [fixture:
railroad/semicolons/ebnf-comment-after-moved-rule] [fixture:
railroad/semicolons/abnf-removed-directive-word] [fixture:
railroad/semicolons/peg-directive-split-style] [fixture:
railroad/semicolons/ebnf-terminator-after-hash] [fixture:
railroad/semicolons/ir-assignment-after-word] [fixture:
railroad/semicolons/abnf-comment-marker-spaced] [fixture:
railroad/semicolons/abnf-comment-marker-multiline] [fixture:
railroad/semicolons/ir-word-multiple-statements] [fixture:
railroad/semicolons/abnf-word-multiple-statements] [fixture:
railroad/semicolons/peg-word-quoted] [fixture:
railroad/semicolons/ebnf-word-rule-name] [fixture:
railroad/semicolons/ir-word-comment-line] [fixture:
railroad/semicolons/ebnf-word-directive-lines] [fixture:
railroad/semicolons/abnf-word-neighbor-boundaries] [fixture:
railroad/semicolons/peg-word-middle-line]

Common lines and descriptions use the shared layouts. Hidden YAML and native
directives remain whole RailroadIgnoredText spans at each AST owner; consumed LF
and closing padding remain outside their ranges. Only header-owned forms use the
header-edge exception; body forms retain the shared spare-LF rule, including
after a statement moved from the header line. Keep the complete retained prefix
so ignored YAML cannot become effective frontmatter. Safe real frontmatter alone
uses guarded YAML formatting. Physical CR/CRLF, leading BOM and final Markdown
payload padding follow the shared host limits. [fixture:
railroad/description-blocks/ir-edges] [fixture: railroad/hidden-forms/ir-owners]
[fixture: railroad/hidden-forms/ebnf-owners] [fixture:
railroad/hidden-forms/abnf-owners] [fixture: railroad/hidden-forms/peg-owners]
[fixture: railroad/hidden-boundaries/ir-moved-before-hidden] [fixture:
railroad/hidden-boundaries/ebnf-moved-before-hidden] [fixture:
railroad/hidden-boundaries/abnf-moved-before-hidden] [fixture:
railroad/hidden-boundaries/peg-moved-before-hidden] [fixture:
railroad/retained-prefix/ir-leading] [fixture:
railroad/frontmatter-yaml/abnf-safe] [test:
railroad/line-terminators-and-unicode/ir-cr] [test:
railroad/line-terminators-and-unicode/ebnf-leading-bom] [test: railroad
Markdown: abnf-final-hidden-padding]

The six existing [specified readings](./railroad.md#specified-readings) reject
atomic directive/selected-semicolon cuts, isolate frontmatter HTML quote
handling, leave embedded data opaque, keep detection-passed bare-percent trivia
and retain railroad across later C4 words. There is no railroad acceptance key
to remove in opaque comparison. Empty strings remain values and empty calls
reject; no new divergence is added. Raw rejection supplies no raw Db or invented
accepted effects. Rejected standalone inputs report syntax errors without
repaired output; Markdown declines embedding. [corpus fixture:
railroad/ir-div-directive-header] [corpus fixture:
railroad/abnf-div-semicolon-repeat-number] [corpus fixture:
railroad/ebnf-div-html-frontmatter-rule-reject] [corpus fixture:
railroad/peg-config-init-fontfamily-number] [corpus fixture:
railroad/ir-bare-nbsp] [corpus fixture: railroad/peg-c4-deployment-predicate]
[corpus fixture: railroad/ir-error-empty-call] [test: railroad Markdown:
ir-rejected]

## Wardley authored text and required line breaks

The [Wardley rules](./wardley.md) preserve names and strings, numeric spellings,
source order and every occurrence. Bare names exactly `title` keep their contact
with following components: inserting whitespace can turn a component, link,
evolve or evolution stage into metadata. Quoted names and longer bare names use
ordinary spacing. [fixture: wardley/name-boundaries/component-title-contact]
[fixture: wardley/name-boundaries/link-title-contact] [fixture:
wardley/name-boundaries/title-evolve-hidden] [fixture:
wardley/name-boundaries/stage-title-contact] [fixture:
wardley/name-boundaries/force-title-contact] [fixture:
wardley/name-boundaries/quoted-title] [fixture:
wardley/name-boundaries/title-prefix-safe]

Flow interiors keep their complete authored spelling, including empty labels,
backslashes and continuation columns. A link's grammatical label-opening `;`
attaches to the preceding component, while everything after it through physical
line end remains written, including whitespace-only labels and trailing padding.
Bare `;` rejects. The shared textual-prefix protection excludes that opener;
further semicolons protect their segment and whole crossing values/trivia. Keep
both labels and ports even when only one affects the Db. [fixture:
wardley/flows/flow-ports-and-label] [fixture:
wardley/flows/flow-padding-escapes] [fixture:
wardley/multiline-values/multiline-flow-columns] [fixture:
wardley/semicolon-labels/label-exterior] [fixture:
wardley/semicolon-labels/label-whitespace] [fixture:
wardley/semicolon-labels/label-two-semicolons] [corpus fixture:
wardley/tail-link-empty-label]

Shared line protection keeps a complete source line containing both a semicolon
and literal `style` or `classDef` after global directives are omitted, including
its statements, comments and hidden forms. This applies even when that semicolon
is not selected. A line with no semicolon, such as a component or pipeline whose
name includes `mystyle`, formats normally. [fixture:
wardley/semicolons/style-no-semicolon-directive-lines] [fixture:
wardley/semicolons/style-pipeline-header] [fixture:
wardley/semicolons/style-pipeline-child] The first line starts at its body
indentation; content and later source columns stay written, without joining
neighboring lines. Count lines as Mermaid reads them, including
directive-spanning words and U+2028/U+2029 comment-region joins. The line rule
can ignore the grammatical label opener and change a link's endpoints or label,
so complete source preservation avoids predicting the rule after moving text.
Words only inside removed global directives do not protect a line. [fixture:
wardley/semicolons/style-selected-delimiter] [fixture:
wardley/semicolons/style-delimiter-hash-after] [fixture:
wardley/semicolons/style-colon-space-nontrigger] [fixture:
wardley/semicolons/style-no-semicolon] [fixture:
wardley/semicolons/style-header-group] [fixture:
wardley/semicolons/style-directive-lines] [test:
wardley/semicolons/style-comment-before-connected] [test:
wardley/semicolons/style-comment-ls-connected] [test:
wardley/semicolons/style-comment-both-connected] [fixture:
wardley/semicolons/style-inside-global]

Hidden forms remain source spans at their AST owner, with consumed LF and
closing padding protected by shared rules. Pipeline opening braces and children
need visible LF even at tabWidth zero; hidden forms do not supply it. Only
header-owned forms use the header-edge exception. Keep the complete retained
prefix so ignored YAML cannot become effective frontmatter. Safe real YAML alone
uses guarded formatting; description blocks use the shared layout. [fixture:
wardley/pipeline/pipeline-zero] [fixture:
wardley/hidden-boundaries/hidden-pipeline-opening] [fixture:
wardley/hidden-boundaries/hidden-pipeline-child] [fixture:
wardley/hidden-boundaries/header-first-statement-hidden] [fixture:
wardley/frontmatter-yaml/retained-prefix] [fixture:
wardley/frontmatter-yaml/frontmatter-safe] [fixture:
wardley/accessibility/description-empty]

The six existing [specified readings](./wardley.md#specified-readings) handle
atomic directive/selected-semicolon cuts, frontmatter HTML, opaque embedded
data, passed bare-percent trivia and later C4 words. Wardley adds no divergence
or opaque acceptance-setting key. Raw rejection supplies no raw Db. Parse
failures report standalone syntax errors without output and decline Markdown
embedding. CR/CRLF and leading BOM use shared host limits. Markdown trims the
final code line: removing a whitespace-only link label leaves bare `;`, making
an accepted payload reject. Standalone formatting keeps that padding. [corpus
fixture: wardley/directive-arrow-inside] [corpus fixture:
wardley/lex-selected-decimal-inside] [corpus fixture:
wardley/div-html-frontmatter-reject] [corpus fixture:
wardley/config-fontfamily-keeps-title] [corpus fixture: wardley/bare-before-ls]
[corpus fixture: wardley/c4-component-component] [test: wardley Markdown:
rejected] [test: wardley/line-terminators-and-unicode/crlf-string] [test:
wardley Markdown: final-whitespace-label]

## Cynefin authored domains and hidden boundaries

A semicolon-protected prefix is printed once even when a native suffix keeps the
line; the suffix retains its owner.

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-yaml]

The [Cynefin rules](./cynefin.md) keep both header spellings, every domain
redeclaration and empty domain, item order and duplicates, self transitions,
empty labels and common resets. Domain/item lines express the authored tree;
columns do not select parents. Rebuilding from the effective Db would lose
occurrences and can change replacement or reset behavior. Strings retain escapes
and interior columns, including empty values and native-looking text; a string
between `'` is printed between `"` as under
[Spellings that are drawn the same](#spellings-that-are-drawn-the-same).
[fixture: cynefin/empty-domains/empty-domain-last-reset] [fixture:
cynefin/redeclarations/domain-repeat-order] [fixture:
cynefin/transition-occurrences/transition-occurrences] [fixture:
cynefin/source-order/source-common-empty-resets] [fixture:
cynefin/strings/strings-quote-backslash] [fixture:
cynefin/multiline-values/multiline-string-columns]

Each native hidden form stays at its AST owner: prefix, body, name suffix,
item-leading/trailing form, transition gap or common suffix. Print its source
once, preserving interiors and closer columns, consumed LF outside the node and
required closing padding. Transitions/common statements need visible EOL;
domains/items do not. Only header-owned forms use the header's edge exception.
Kept lines use the same decision for the header, domain openings and items,
including item suffix forms, so moving a child cannot remove its parent's
protection. Retain the complete skipped prefix so ignored YAML cannot become
effective frontmatter. Safe real YAML and description blocks use the shared
layouts. [fixture: cynefin/hidden-forms/hidden-domain-name] [fixture:
cynefin/hidden-forms/hidden-between-items] [fixture:
cynefin/hidden-forms/hidden-body-after-last-item] [fixture:
cynefin/hidden-forms/hidden-transition-all-gaps] [fixture:
cynefin/hidden-boundaries/boundary-suffix-directive-spare] [fixture:
cynefin/hidden-boundaries/boundary-suffix-yaml-tab] [fixture:
cynefin/hidden-boundaries/boundary-header-body-suffix] [fixture:
cynefin/hidden-boundaries/header-inline-domain-item-directive] [fixture:
cynefin/hidden-boundaries/header-inline-domain-item-yaml] [fixture:
cynefin/retained-prefix/prefix-retained-yaml] [fixture:
cynefin/frontmatter-yaml/frontmatter-safe-yaml] [fixture:
cynefin/description-blocks/description-empty]

Keep every authored semicolon. A segment that holds a kept `;` is formatted as
anywhere else, except where formatting could change which `;` the line rule
ignores (see [Semicolons](./cynefin.md#semicolons)). Mermaid's reading
determines segments, including removed directives and comment joins. Cynefin has
no grammatical semicolons, so style/classDef word lines without semicolons still
format; complete word-line preservation does not apply. Root directives within a
printed line are placed as under [Directives](./flowchart.md#directives). At
split statement/item boundaries they attach to the following unit, retaining the
right boundary and breaking left contact. Native comments retain LS/PS as
content. These boundaries can affect selection, values and acceptance. [fixture:
cynefin/semicolons/semi-selected-before-arrow] [fixture:
cynefin/semicolons/semi-item-body-indentation] [fixture:
cynefin/semicolons/semi-plain-style-line-formats] [fixture:
cynefin/semicolons/semi-multiline-global-word] [fixture:
cynefin/global-directives/between-items-contact] [test:
cynefin/comments/comment-ls-native-content] [test:
cynefin/comments/comment-unicode-join]

The six existing [specified readings](./cynefin.md#specified-readings) cover
atomic cuts, frontmatter HTML, opaque embedded data, passed bare-percent trivia
and C4 words. Raw rejection supplies no raw Db; Cynefin adds no divergence or
acceptance-setting key. Standalone parse failures leave files unchanged through
a syntax error; Markdown declines embedding. CR/CRLF and leading BOM follow
shared host limits. Markdown trims final code-line hidden padding; standalone
formatting retains it, and required internal padding stays protected. [corpus
fixture: cynefin/directive-arrow-inside] [corpus fixture:
cynefin/semicolon-arrow-inside] [test:
cynefin/specified-readings/divergence-html-cross] [test:
cynefin/specified-readings/divergence-opaque-yaml] [test:
cynefin/specified-readings/divergence-c4-string] [test:
cynefin/specified-readings/divergence-bare-unicode] [test:
cynefin/line-terminators-and-unicode/eol-crlf-string] [test: cynefin Markdown:
final-hidden-padding] [test: cynefin Markdown: rejected]

## Eventmodeling terminals and source boundaries

The [eventmodeling rules](./eventmodeling.md) preserve inline data and block
contents, except for the restricted ASCII-space margin adjustment in
[Data blocks](./eventmodeling.md#data-blocks). That adjustment aligns every
nonblank body line to `tabWidth` spaces, or `2 * tabWidth` after an ordinary
continued header, without interpreting data fields, JSON or code structure.
Plain joined header LF and LF inside an inline directive add no step; native
hidden header forms retain their base body rule. [fixture:
eventmodeling/declarations-and-notes/header-directive-continuation] [fixture:
eventmodeling/declarations-and-notes/header-inline-multiline-directive]
[fixture: eventmodeling/declarations-and-notes/header-continuation-tabs]
[fixture: eventmodeling/declarations-and-notes/data-and-note-headers] [fixture:
eventmodeling/hidden-forms/hidden-data-tag-owners]

It preserves rendering but may change raw Db values; it changes no parser,
specification or recorded Mermaid reading. Other payload characters, quotes,
braces, blank lines, trailing whitespace and apparent following statements
remain as written. Tags can still format. Block-data consumes an immediately
following LF; other whitespace is lookahead. Closing padding and LS/PS
boundaries stay written, including at EOF. Reindenting a block closer can reject
input, and replacing closing lookahead with LF can change the comparison Db.
Native data is read directly from source rather than evaluated as embedded
configuration. [fixture: eventmodeling/data-blocks/body-overindented-first-line]
[fixture: eventmodeling/data-blocks/body-overindented-later-line] [fixture:
eventmodeling/inline-data/greedy-apparent-frames-kept] [fixture:
eventmodeling/data-blocks/block-closer-indent-unsafe] [fixture:
eventmodeling/data-boundaries/same-line-block-successor] [test:
eventmodeling/line-terminators-and-unicode/block-ls-boundary-stays-outside-value]
[fixture: eventmodeling/final-newline/final-block-padding-kept]

Ordinary top-level statements start at column one, keeping frames, model
entities, data and note declarations at the same level as the required
unindented block closers. GWT clauses and items remain nested using the
configured indentation. Data bodies outside the margin rule keep their authored
columns. [fixture: eventmodeling/indentation/mixed-top-level-blocks] [fixture:
eventmodeling/indentation/gwt-four-spaces] [fixture:
eventmodeling/indentation/data-declaration-column-one] [fixture:
eventmodeling/indentation/note-column-one]

Common EM terminals retain keyword, delimiter and leading ASCII padding as
values. Preserve their complete source and preceding interval, including across
global directives and selected semicolons. Ordinary accessibility spacing and
shared description-block compaction therefore do not apply: even a
whitespace-only description keeps its interior. Common statements can depend on
their original connection to the header, a preceding statement or a consumed LF;
putting them on ordinary body lines can reject input. Required identifier
`title` likewise keeps its successful LF or hidden boundary, because adding
horizontal padding can turn it into metadata. [fixture:
eventmodeling/header/accdescr-moved-to-line-start] [fixture:
eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps]
[fixture: eventmodeling/semicolons/metadata-across-selected-semicolon-gap-exact]
[fixture:
eventmodeling/description-blocks/description-whitespace-literal-retained]
[fixture:
eventmodeling/frame-components/hidden-before-required-title-identifier-keep-zero-indentation]

Eventmodeling keeps comment lines in its Db unless the source is longer than
`maxTextSize`, 50000 UTF-16 code units by default. At normal size a `%%` comment
line inside a data block, a note, a description block, a slash block comment or
a hidden form is part of that text and stays as written, apart from the
permitted block-body margin adjustment. At or above 50000 normalized units after
frontmatter and directive removal, retain the complete diagram text and ending.
Below it, ordinary layout is applied only if its planned measurement stays
strictly below 50000, so that indentation or the final line break cannot move
the text across the limit and drop those comment lines from the Db. [fixture:
eventmodeling/default-size-branches/size-utf16-surrogate] [fixture:
eventmodeling/default-size-branches/size-preserving-to-fallback-unsafe]
[fixture: eventmodeling/default-size-branches/size-below-planned-crossing]
[fixture: eventmodeling/comments/comment-line-inside-data-block-kept]

Every source occurrence remains, including model entities, notes, GWT, unused or
later same-name data, repeated references, type words and inline data alongside
a reference. GWT's clauses/items use the shared range-ended body path. Hidden
YAML and native DIRECTIVE print once at their original owner; consumed LF and
closing padding are protected by the shared hidden rules. A retained pre-header
form keeps the complete prefix so it cannot become real frontmatter. Safe real
frontmatter alone uses the guarded YAML formatter. [fixture:
eventmodeling/source-order/all-occurrences-retained] [fixture:
eventmodeling/hidden-forms/hidden-gwt-clause-item-owners] [fixture:
eventmodeling/hidden-forms/gwt-required-source-and-given-hidden-gaps] [fixture:
eventmodeling/frontmatter-yaml/retained-prefix-whole] [fixture:
eventmodeling/frontmatter-yaml/safe-real-yaml]

Keep every authored semicolon, including one at a child body's opening edge. A
segment that holds a kept `;` is formatted as anywhere else, except where
formatting could change which `;` the line rule ignores (see
[Semicolons](./eventmodeling.md#semicolons)); value-owned padding remains
written. There are no grammatical semicolons, so a style/classDef word alone
does not freeze the entire line. Directives keep both contacts within a printed
line; when units split, the directive moves with the following unit.
Common-value intervals override this ordinary placement. Comments keep their
marks and contents; native line comments include LS/PS. When units split,
intervening inline comments and directives move with the following unit in
source order. This shared placement treats comments alike across diagram types.
[fixture: eventmodeling/comments/mixed-directive-order] [fixture:
eventmodeling/semicolons/gwt-protected-opening-kept] [fixture:
eventmodeling/semicolons/no-grammar-semicolon-style-word-line-formats] [fixture:
eventmodeling/global-directives/directive-follows-split-next-gwt-item] [test:
eventmodeling/comments/native-line-comment-ls-stays-content] [test:
eventmodeling/comments/comment-after-ls-gap-ends-at-lf]

The five existing [specified readings](./eventmodeling.md#specified-readings)
apply without new divergences: atomic directive/semicolon cuts,
cross-frontmatter HTML quotes, opaque embedded configuration and later C4 words.
Raw rejection provides no raw Db. Rejected files report syntax errors and are
not rewritten; Markdown leaves rejected payloads to Prettier. Shared CR/CRLF
conversion and the Markdown host's final-code-line padding limitation still
apply. [corpus fixture: eventmodeling/directive-arrow-inside] [corpus fixture:
eventmodeling/lex-semicolon-frame-id-inside] [corpus fixture:
eventmodeling/div-html-frontmatter-value] [corpus fixture:
eventmodeling/div-frontmatter-invalid] [corpus fixture:
eventmodeling/c4-container-data] [test: eventmodeling Markdown: rejected] [test:
eventmodeling Markdown: final-hidden-padding]
