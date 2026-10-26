# Compatibility with mermaid.js

Japanese version: [compatibility.ja.md](./compatibility.ja.md)

The plugin is checked against what mermaid.js 12.0.0 recorded in the conformance
corpus. Formatting keeps what mermaid.js reads from a diagram, and text that
mermaid.js rejects is left unchanged. This document lists where that does not
hold, and why.

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
sequence diagram. [fixture: flowchart/directives/touching-token-kept] [fixture:
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

Directives and data blocks are kept as written. The frontmatter is formatted
with Prettier's YAML formatter when Prettier can read it as YAML, and kept as
written otherwise (see [Frontmatter](#frontmatter)). [fixture:
flowchart/frontmatter-yaml/formatted] [fixture:
flowchart/frontmatter-yaml/malformed-kept]

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
existing layout; diagram rules that preserve a surrounding line still apply.
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
formatted as usual. Where it does not (a class diagram, a state diagram, a block
diagram, and the others), the line is kept with its `;`, and the gap stays.
[fixture: flowchart/semicolons/style-line-dropped-semicolon-formats-the-gap]
[fixture:
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
it at the end of the last style, so this is the one place where formatting
changes what mermaid.js stores. The tests compare styles without their trailing
whitespace.

The whitespace is kept where removing it would make mermaid.js reject the
statement: after a `,` at the end of the list, as in `style A fill:#f00, `.
[fixture: flowchart/style-trailing-whitespace/whitespace-only-value-kept]
[corpus fixture: flowchart/db-style-whitespace-only-value] See
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace).

## Whitespace at the start of a label

mermaid.js drops whitespace at the start of a label without quotes, and so does
formatting, except where the label would then be read differently: the
whitespace is kept, as one space, when the label starts with `/`, `\`, `-`, or
`"`, or when its first word contains `@`, and the label then gets one space at
its end too. [fixture: flowchart/label-inner-whitespace/trimmed] [fixture:
flowchart/label-inner-whitespace/leading-whitespace-kept] [fixture:
flowchart/label-inner-whitespace/compat-leading-backslash-kept] For example,
`A[ /x/]` is a rectangle with the label `/x/`, while `A[/x/]` is a lean-right
shape with the label `x`, and `A[x@]` is rejected. See
[Label inner whitespace](./flowchart.md#label-inner-whitespace).

## Directives between tokens

mermaid.js removes a directive and reads the text on its two sides joined.
Formatting therefore keeps, on each side of a directive, whether whitespace was
written there: `flowchart %%{init: {}}%%LR` stays as it is, because
`flowchart%%{init: {}}%%LR` would be rejected. [fixture:
flowchart/directives/whitespace-on-each-side-kept] [fixture:
flowchart/directives/touching-token-kept] [fixture:
sequence/directives/compat-whitespace-on-one-side-of-directive-kept] [fixture:
class/directives/compat-whitespace-on-one-side-of-directive-kept] [fixture:
state/directives/compat-whitespace-on-one-side-of-directive-kept] See
[Directives](./flowchart.md#directives).

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
flowchart/indentation/direction-text-with-directive-kept] See
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
directive in it is kept as written, from its start to its end: it cannot stand
on one line, and the whitespace at the ends of its lines, which the formatter
does not write, is what joins its lines. [fixture:
sequence/multi-line-statements/comment-inside-kept] So is a title with a comment
line between `title` and its text: the comment line is removed before mermaid.js
reads the text, so the line after it is the title. [fixture:
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

In a class diagram, a member line and a generic type are kept as written: the
whitespace after a visibility mark and between the two `~` is part of the Db.
[fixture: class/member-lines/kept] [fixture: class/generic-types/kept] A label
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
its first two characters. [fixture: state/notes/kept] The second description of
an alias definition is kept as written, with the whitespace at its ends, which
mermaid.js reads. [fixture: state/aliases/second-description-kept] The names and
the empty strings after `state` stay on the line of `state`: on a line of its
own, a second name would add a state. [fixture:
state/statements-one-per-line/state-names-kept] A `%%` or an empty description
block right before a `{` is kept as written up to the `{`. [fixture:
state/composite-states/compat-comment-after-name-before-body] [fixture:
state/composite-states/compat-comment-line-before-body] [fixture:
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

- The whitespace at the ends of the value of `dateFormat`, `axisFormat`,
  `tickInterval`, `todayMarker`, `title`, and `section`, and between the text of
  a task description and its colon. The Db keeps it, so `dateFormat  YYYY-MM-DD`
  with two spaces and `A task           :a1` with padding are not the same as
  their trimmed forms, and the padding that aligns the colons stays. [fixture:
  gantt/settings/value-whitespace-kept] [fixture:
  gantt/titles-and-sections/value-whitespace-kept] [fixture:
  gantt/task-data/description-padding-kept]
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
- The name and the arguments of a call, with their whitespace: `f ()`,
  `f( 1, 2 )`, and `f(1,2)` are three calls. [fixture:
  gantt/click-statements/call-name-and-arguments-kept]
- A line that holds a `;`: its statements stay on it, since the line rule of
  mermaid.js reads the text of the line. [fixture:
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

- The whitespace at the ends of the value of `title` and `section`, and between
  the text of a task description and its colon. The Db keeps it, so `title  T`
  with two spaces and `Make tea  : 5` with padding are not the same as their
  trimmed forms, and the padding that aligns the colons stays. [fixture:
  journey/titles-and-sections/value-whitespace-kept] [fixture:
  journey/task-data/description-padding-kept]
- The whitespace before a `#` after a `title` or a `section`: it is part of the
  value, while after the data of a task it is not. [fixture:
  journey/titles-and-sections/whitespace-before-hash-is-the-value] [fixture:
  journey/task-data/hash-ends-the-data]
- The whitespace inside a person, and the number of the people: `Me  Two` is one
  person as written, and `a,` has an empty person that `a` does not. [fixture:
  journey/task-data/people-inner-whitespace-kept] [fixture:
  journey/task-data/empty-people]
- The whitespace after the colon of a task whose data is whitespace only.
  mermaid.js needs a character of the data after the colon, so `A:` is rejected
  and `A: ` is a task, and one whitespace character stays. [fixture:
  journey/task-data/whitespace-only-data]
- A line that holds a `;`: its statements stay on it, since the line rule of
  mermaid.js reads the text of the line. [fixture:
  journey/statements-one-per-line/ignored-semicolon-line-kept]

## Requirement lines that the place or the whitespace decides

mermaid.js keeps the whitespace in some names and values of a requirement
diagram and reads some lines by the place they stand in, so formatting keeps
them as they are written. See [Names](./requirement.md#names),
[Fields](./requirement.md#fields),
[Styles and classes](./requirement.md#styles-and-classes), and
[Statements one per line](./requirement.md#statements-one-per-line).

- The whitespace inside an unquoted name, value, or class, and everything
  between the quotes of a string. The Db keeps it, so `requirement spaced  name`
  with two spaces and `id: a  b` are not the same as their forms with one space.
  The whitespace at their ends is not in the Db, and is dropped. [fixture:
  requirement/names/inner-whitespace-kept] [fixture:
  requirement/fields/value-inner-whitespace-kept] [fixture:
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
- A line that holds a `;`: its statements stay on it, since the line rule of
  mermaid.js reads the text of the line. A statement written over lines whose
  last line holds a `;` of the statement after it stays as written too, since
  the joined line would be read as a whole. [fixture:
  requirement/statements-one-per-line/ignored-semicolon-line-kept] [fixture:
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

mermaid.js keeps the whitespace in the periods, events, titles, and section
names of a timeline, and reads a few lines by the place they stand in, so
formatting keeps them as they are written. See
[Periods and events](./timeline.md#periods-and-events),
[Event statements](./timeline.md#event-statements), and
[Statements one per line](./timeline.md#statements-one-per-line).

- The whitespace around the colons of a period and its events. The Db keeps the
  whitespace before the colon of a period and the whitespace of an event beyond
  the one character after its colon, so `2004 : a` and `2004: a` are different
  periods, and the padding that aligns the colons stays. The whitespace at the
  end of a line is part of the text too. [fixture:
  timeline/periods-and-events/period-whitespace-kept] [fixture:
  timeline/periods-and-events/event-whitespace-kept] [fixture:
  timeline/periods-and-events/trailing-whitespace-kept]
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
- A statement with a comment line, a directive, or a `;` in a line break that
  would be joined, such as the one between `title` and its text: it is kept as
  written. A line that holds a `;` keeps its statements together. [fixture:
  timeline/multi-line-statements/comment-line-inside-kept] [fixture:
  timeline/statements-one-per-line/ignored-semicolon-line-kept]

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
- A string, with the whitespace and the line breaks in it, which are in the Db,
  and the quotes, which are the author's: `"a b"` and `a b` are not the same
  text. [fixture: quotes/strings-as-written] [fixture:
  multi-line-values/string-with-line-breaks-kept]
- The digits of a category and of a title, which are text, so `007` and `.5`
  stay as written, and the numbers of a range and of a plot, which are the
  author's text as well. [fixture: numbers/categories-are-texts] [fixture:
  numbers/range-numbers-as-written]
- A block `accDescr {` that is not closed, which runs to the end of the text:
  mermaid.js reads no text for it, and a `}` that the printer wrote would make
  it a description. [fixture:
  accessibility-statements/block-not-closed-kept-as-written]
- A line that the line rule of mermaid.js reads, with a `style` or `classDef`, a
  `:` and a `#` after it with no whitespace between them, and a `;` after that,
  keeps its statements together with the `;`. [fixture:
  statements-one-per-line/line-rule-line-kept-together] [fixture:
  multi-line-statements/semicolon-inside-kept]
- A statement with a comment line or a directive in a line break that it would
  join, kept as written. [fixture:
  multi-line-statements/comment-line-inside-kept] [fixture:
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

The whitespace inside the texts of a quadrant chart is in the Db, so formatting
leaves the texts as written and changes the whitespace around them. What the Db
or the lexer reads stays. See
[Keywords and texts](./quadrant.md#keywords-and-texts) and
[Quotes](./quadrant.md#quotes).

- The whitespace inside a text without quotes, a name, a title, and an
  accessibility text: a run of spaces, a tab, and a form feed between two words
  are characters of the text. A string and the words after it keep the
  whitespace between them, since `"a" b` and `"a"b` are different texts.
  [fixture: keywords-and-texts/inner-whitespace-kept] [fixture:
  keywords-and-texts/string-then-text-whitespace-kept] [fixture:
  points/name-inner-whitespace-kept] [fixture:
  titles-and-accessibility-statements/text-inner-whitespace-kept]
- A word after the keyword `title` or `classDef` with no whitespace between them
  is a word of its own: `title1: [0.3, 0.6]` is a point named `title1`, and a
  space would make a title. [fixture:
  keywords-and-texts/word-after-title-keyword-is-a-point-name]
- The coordinates of a point, which are texts: `0.30` is not `0.3`. [fixture:
  points/coordinates-as-written]
- The arrow of an axis with no second text, which the Db reads as part of the
  left text. [fixture: axes/arrow-only]
- A string, with the whitespace and the line breaks in it, and the quotes, which
  the author chooses: a string can hold what a text without quotes cannot, so
  the quotes are not removed. [fixture: quotes/strings-as-written] [fixture:
  quotes/keywords-and-arrows-in-strings] [fixture:
  multi-line-values/string-with-line-breaks-kept]
- A `;` inside a title or an accessibility text, which is a character of it, and
  an empty description block inside a title, which is part of it. [fixture:
  statements-one-per-line/semicolon-in-a-title-is-text] [fixture:
  statements-one-per-line/empty-description-block-in-a-title-stays]
- A line that the line rule of mermaid.js reads, with a `style` or `classDef`, a
  `:` and a `#` after it with no whitespace between them, and a `;` after that,
  keeps its statements together with the `;`. [fixture:
  statements-one-per-line/line-rule-line-kept-together] [fixture:
  multi-line-statements/semicolon-on-the-last-line-kept]
- A statement with a comment line or a directive in a line break that it would
  join, kept as written. [fixture:
  multi-line-statements/comment-line-inside-kept] [fixture:
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

## Block diagram lines that the whitespace or the lexer decide

Most whitespace of a block diagram is not in the Db, so formatting changes it.
What the Db or the lexer reads stays. See [Rows](./block.md#rows),
[Shapes](./block.md#shapes), [Styles](./block.md#styles), and
[Multi-line statements](./block.md#multi-line-statements).

- The whitespace inside the parentheses of a block arrow, which is in the Db:
  `(right down)` has the direction `right `, and `( up)` has ` up`. [fixture:
  shapes/block-arrow-directions-as-written] [fixture:
  shapes/block-arrow-directions-whitespace-kept]
- The whitespace of `style` and `class`: of a style after a `,`, of the ids of
  `class`, and of its class name. [fixture: styles/style-commas-as-written]
  [fixture: styles/class-ids-as-written] [fixture: styles/class-name-as-written]
  [fixture: styles/class-name-with-a-comma-as-written]
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
  keeps its statements together with the `;`. [fixture:
  multi-line-statements/line-rule-line-kept] [fixture:
  multi-line-statements/line-rule-line-kept-with-columns] [fixture:
  multi-line-statements/line-rule-line-kept-with-composite]
- A statement with a comment line or a directive in a line break that it would
  join, kept as written. [fixture:
  multi-line-statements/comment-line-inside-kept] [fixture:
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

## Diagram types without a printer

A diagram type that the plugin does not format yet is printed as written in a
standalone file. Only the line endings may change: they follow Prettier's
`endOfLine` option, as for every other language. In Markdown, the code block is
left to Prettier.

## Kanban indentation, opaque suffixes, and kept lines

The Db of a kanban board has no indentation: it tells a section from an item by
comparing the indentation of a node with that of the first node. So the printer
chooses the indentation, one step for a section and two for an item, and keeps
what decides the roles. Bare-id, label, icon, and class whitespace remains value
text. Decorations align with their node; an inline-directive line keeps its
directives and the gaps beside them, and the printer chooses the whitespace
before the first one. See the [kanban rules](./kanban.md). [fixture:
kanban/indentation/sections-and-items] [fixture:
kanban/icons-and-classes/aligned] [fixture:
kanban/directives/leading-directive-indentation-decided] [fixture:
kanban/trailing-whitespace/class-trailing-trim]

Data blocks keep their interiors and attachment, including touching adjacent
blocks and intervening directives; YAML formatting applies only to guarded
frontmatter. Complete blank/comment gaps after diagram comments, terminal gaps
included, stay as written under `blank-line-after-header-or-comments`. A raw
rejection has no raw Db; the corpus checks the specified reading. [fixture:
kanban/data-blocks/adjacent] [fixture:
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
quoted forms stay authored; a non-ASCII-space prefix before a bare quote or `$`
stays because it selects bare lexing. A whitespace-only unit after a quoted
argument remains a unit. See the [C4 rules](./c4.md). [fixture:
c4/argument-spacing/null-space-kept] [fixture:
c4/empty-entries/named-null-slots] [fixture: c4/number-like-text/excess-kept]
[test: c4: tab-before-quote] [test: c4: bare-dollar-prefix]

Empty description blocks remain adjacent, with both `beforeBody` gaps retained,
because they supply neither a significant statement nor a newline. Multiline
values and named-key exterior newlines retain their lines and columns; joining
direction text can make an accepted input rejected even at column one. [fixture:
c4/empty-description-blocks/empty-header-gap] [fixture:
c4/empty-description-blocks/empty-boundary-next-gap] [fixture:
c4/empty-description-blocks/empty-on-close-line] [fixture:
c4/named-attributes/named-exterior-newline-kept] [fixture:
c4/direction-rejection/acc-colon-direction]

Diagram comments retain their complete following gaps, including whitespace-only
recovery lines and terminal gaps; the `comment-takes-line-break` divergence is
not repaired by moving comments. C4 keeps every semicolon and the shared
`style`/`classDef` line rule's protected prefix, with value nodes whole and
Unicode segment boundaries retained. Indentation and exterior trailing
whitespace remain printer whitespace. [fixture: c4/comments/comment-header]
[fixture: c4/blank-lines/comment-recovery] [fixture:
c4/final-newline/comment-eof-gap] [fixture:
c4/line-rule-and-semicolons/semicolon-inline-comment] [fixture:
c4/line-rule-and-semicolons/semicolon-suffix-spacing] [fixture:
c4/trailing-whitespace/semicolon-line] [test: c4: ls-line-rule-segments]

## Venn implicit text and textual line rules

Venn's body is flat: only targetless text is indented, since positive
indentation selects implicit text while its mode is enabled. Declarations retain
same-line style, explicit text and title followers so splitting cannot clear
that mode. Leading directives keep the positive/zero logical marker;
diagram-comment gaps preserve the empty versus whitespace-only line boundary
before `%%{ }%%`. See the [Venn rules](./venn.md).

[fixture: venn/indentation/indent-width] [fixture:
venn/statements-one-per-line/header-declaration-group] [fixture:
venn/directives/directive-leading-marker] [fixture:
venn/blank-lines/whitespace-before-empty-braces] [fixture:
venn/blank-lines/blank-before-empty-braces-explicit]

Names, labels, sizes, complete bare/quoted styles, titles, repetitions and
swallowed fragments remain authored text. Empty quoted names and styles are real
values; bare whitespace, quoted whitespace and empty quoted labels keep their
different readings. Every semicolon stays, with the prefix from first
non-whitespace through last semicolon protected and crossing values/trivia
whole; indentation and exterior trailing spaces remain printer whitespace, and
safe suffixes format normally. Unicode separators inside comments or directives
do not cut the kept part: Venn diagram comments continue to LF/EOF.

[fixture: venn/name-lists/empty-quoted-targets] [fixture:
venn/labels/labels-empty-kept] [fixture: venn/style-properties/style-atoms-kept]
[fixture: venn/comments/ignored-fragment] [fixture:
venn/line-rule-and-kept-lines/line-rule-suffix-spacing] [test: venn:
ls-kept-comment-whitespace-line] [test: venn: ps-kept-directive]

Only accepted whitespace roles normalize: ordinary ASCII gaps, configured
implicit indentation and the title's consumed first separator. CR/CRLF use
shared EOL handling; Unicode value characters remain, and invalid ordinary gaps
remain rejected. The shared failure, Markdown, frontmatter and final newline
paths apply. Specified token-boundary divergences still fail, while C4-detection
and opaque-YAML divergences use the specified reading; raw rejection provides no
raw Db.

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
ishikawa/trailing-whitespace/trailing-value-kept] [test: ishikawa:
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
and duplicates retained. JSON table data is opaque, including its @-to-brace
gap, number/escape spelling and property order. Formatting fixtures without
supplied effects use the shared null Db comparison and written-source check; the
corpus uses recorded effects where available. Full CSS declarations keep both
colon padding sides and the `--` name gap, which Mermaid stores. [fixture:
usecase/native-metadata/metadata-inline] [fixture:
usecase/native-metadata/metadata-blank-lines-kept] [fixture:
usecase/json-tables/json-opaque] [fixture:
usecase/classes-and-styles/css-colon-padding] [fixture:
usecase/classes-and-styles/css-custom-gap]

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
value. Description text keeps its lines and columns, and a separate closing
brace aligns with the statement. See the
[usecase rule](./usecase.md#direction-and-accessibility). [fixture:
usecase/direction-and-accessibility/a11y-padding] [fixture:
usecase/direction-and-accessibility/a11y-closer-aligned]

Stereotype declaration suffixes retain whether whitespace is present before `<<`
and inside each delimiter, including inside system boundaries. A nonempty run
becomes one space; absent whitespace stays absent. Mermaid trims the interior
ends; whitespace before `<<` is structural. Interior text remains written;
protected semicolon prefixes and common comment regions retain their complete
values. This reuses the
[class statement-annotation rule](./class.md#whitespace-between-tokens).
[fixture: usecase/stereotypes/stereotype-padding] [fixture:
usecase/stereotypes/opener-gap-sides] [test: usecase: stereotype-opener-tab]
[fixture: usecase/stereotypes/stereotype-inner-kept] [fixture:
usecase/stereotypes/side-padding] [fixture:
usecase/stereotypes/boundary-suffixes] [fixture:
usecase/stereotypes/semicolon-padding-kept] [test: usecase:
stereotype-comment-region-padding-kept]

Written labels/quotes, boundary title padding and continuation columns remain
authored even where trimming or requoting would have equal Db. Common
comment-region joins and native comments through LS/PS stay intact; semicolons
never separate statements and every textual prefix remains protected. The six
specified usecase divergences use their specified acceptance/reading, and
rejected trees follow the shared failure path. [fixture:
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

The [pie rules](./pie.md) retain written quotes, escapes, number spelling, value
continuation columns, duplicates and source order. Common title/accessibility
line edges compact like C4, but pie never joins a next-physical-line value.
Empty labels and description blocks are real syntax. [fixture:
pie/labels/label-quotes] [fixture: pie/numbers/number-spellings] [fixture:
pie/title/title-next-trivia] [fixture: pie/description-blocks/block-empty]

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
positive minimum. Every semicolon remains, with complete crossing value/trivia
prefixes protected. Physical EOL/BOM and final-newline handling are shared.
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

The [gitgraph rules](./gitgraph.md) keep header direction/colon presence,
checkout aliases, bare/explicit messages, quotes, reference forms, order digits
and every source-ordered option/statement occurrence. String/reference padding,
escapes, HTML, entities and tag order can change the Db, and empty cherry-pick
tags can suppress a default tag. The summary's omission of messages does not
permit deleting them. [fixture: gitgraph/header/header-tb] [fixture:
gitgraph/checkout-aliases/alias-kept] [fixture: gitgraph/messages/message-forms]
[fixture: gitgraph/quotes/quotes-kept] [fixture:
gitgraph/references/reference-empty] [corpus fixture: gitgraph/number-precision]
[fixture: gitgraph/authored-values/inner-padding-change] [corpus fixture:
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
next physical line. Shared description-block layout keeps touching braces, empty
blocks, value continuation columns and trivia. Physical EOL, BOM and final
newline use the shared host path. Markdown trims final payload padding; interior
hidden padding stays necessary. [corpus fixture: gitgraph/title-next-line]
[fixture: gitgraph/title-and-common-values/a11y-no-next-line] [fixture:
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
order and repetitions, empty forms, quotes, escapes, internal whitespace and
multiline columns. Info's public Db summary is empty even for common title and
accessibility assignments; equal empty Dbs do not authorize deleting source.
Common line edges compact, while next-line values stay separate. [fixture:
info/statements-one-per-line/order-and-empty] [fixture:
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
segment can change acceptance. Global directive source and each side's contact
remain, since removing init can change configuration despite the empty Db.
Physical EOL and EOF-reaching global endings use the shared path. Prettier
removes/restores a leading BOM; inside the plugin, an opening-fence BOM can
therefore make hidden YAML read as real frontmatter. A BOM repeated before the
closer instead causes the shared standalone syntax-error limitation. Markdown
trims final payload padding; interior hidden boundaries remain. [fixture:
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

The [packet rules](./packet.md) keep the authored `packet` / `packet-beta`
header and all three block forms: range, single and relative. Never reconstruct
blocks from published rows or remove occurrences after the publication cap.
Repeated labels stay separate, and empty common assignments remain: deleting an
empty title can restore an earlier title. Labels retain quotes, padding,
escapes, HTML, entities and physical continuation columns because rewriting
these can change the Db. Numeric digits remain written even when double
conversion rounds or overflows them; exponent/Infinity output is not packet
syntax. [fixture: packet/block-forms-and-order/block-three-forms] [fixture:
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
accessibility and description layouts retain empty forms, trivia and authored
continuation columns. Global directives keep opaque content and attachment;
removing init can change row configuration. All semicolons remain, using shared
segment protection for crossing values/trivia and header/body groups: removing
selected semicolons or moving their triggers can change the Db. Physical EOL,
BOM, final-newline and Markdown handling are shared. Markdown trims final
payload-line padding; interior hidden padding stays necessary. [fixture:
packet/title/title-no-next] [fixture:
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
source ranges, including bare/quoted kind, quote spelling, edge padding, empty
quoted text, escapes, HTML and entities. Interior whitespace and escape
conversion can change the Db. Text icons retain their complete StringLiteral
source, and named icons retain their names: trimming, decoding or replacing
these values can change what mermaid.js reads. `singleQuote` does not rewrite
icons or labels. Keep the actual arrow marker characters, including reversed
`>--<`, rather than reconstructing them from presence flags. [fixture:
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
preceding whitespace compacted as in gitgraph. NumericLiteral source spans
preserve leading/trailing decimal zeros, rounded precision, subnormals,
underflow and overflow rather than printing converted double values. Option
values remain authored: no tick cap, min/max reorder or replacement from drawing
configuration. Label StringLiteral spans keep quotes, empty/whitespace-only
text, escapes, HTML, entities and internal whitespace; singleQuote does not
rewrite them. Deleting an empty label changes the ID fallback, and rewriting
internal whitespace can change the Db. [fixture:
radar/source-order/declaration-order-kept] [fixture:
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
including compact whitespace-only interiors and written continuation columns.
Each native hidden form is printed once at its AST owner, with consumed LF and
closing padding retained outside its range. The last member of a group owns its
suffix; it uses the same boundary rule as other statements. Only the header's
own hidden forms use the header-edge exception. Keep the complete retained
prefix so ignored YAML does not become effective frontmatter; safe real
frontmatter alone uses guarded YAML formatting. All authored semicolons stay
under shared segment protection, preserving continuation columns without added
indentation inside each protected segment, including a semicolon on the last
line of a multiline statement: joining a style-like label to it can change
another statement's value. [fixture: radar/title/title-edge-trim] [fixture:
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

The [treemap rules](./treemap.md) preserve the ordered forest derived from the
original row indents. Spaces and tabs each count once; leaves close sections but
never become parents, and class/common statements do not participate. Ordinary
roots use one positive configured step, including at tabWidth zero because
indentation determines parentage. A class name touching a row keeps that contact
and uses root baseline zero throughout the diagram. Trailing or whitespace-line
indentation moves once to the following row. Standalone comments and directives
start at column one to avoid an extra native indentation unit. Protected
semicolon row boundaries keep the body as written.

[fixture: treemap/indentation/leaf-closes] [fixture:
treemap/indentation/common-and-class] [fixture: treemap/indentation/zero]
[fixture: treemap/indentation/glued-roots] [fixture:
treemap/carried-indentation/section-space] [fixture:
treemap/carried-indentation/whitespace-line] [fixture:
treemap/comments/carried-space] [fixture: treemap/directives/leading] [fixture:
treemap/semicolons/body-kept]

Keep numeric source spelling, including commas, underscores, dots and precision;
reprinting the numeric value can change its reading or produce rejected syntax.
Names keep quotes, empty names, whitespace, backslashes, entities, HTML and
physical continuation columns. Class styles remain whole authored literals,
including internal and trailing padding; they are not reformatted as CSS. Retain
repeated classes, empty assignments, unresolved selectors and source order.
Common values and description blocks use shared exterior spacing while retaining
internal text and trivia. Every semicolon stays, and protected segments retain
their columns without extra indentation inside them.

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

Strings keep their complete source spans, including quotes, empty and
whitespace-only values, escape spelling, HTML, entities and continuation
columns. singleQuote does not rewrite them. ABNF backslash is ordinary content;
the other three dialects have backslash escapes. ABNF repeat bounds retain
leading zeroes, omitted bounds, exact forms and large integers; numeric values
keep base-letter case, digits, dots and hyphens as raw text. EBNF special
sequences keep their whole span, including exterior and internal whitespace.
Converting these spellings or reflowing values can change the Db. PEG predicates
keep their entire authored operand rather than rebuilding it from a published
label. [fixture: railroad/quotes/ir-escape] [fixture:
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
required visible `;` stays attached where safe, and every other authored
semicolon stays under shared segment protection, including crossing values. The
first line uses one body step, matching other flat diagrams; later lines keep
their written columns. Railroad lines containing the literal string `style` or
`classDef` after global directive removal stay as written, including every
statement, comment, native hidden form and inner gap. They do not join their
neighbors. A removed directive forming a word across lines keeps all those
lines. [fixture: railroad/semicolons/ir-word-unclosed-directive-lines] [fixture:
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
