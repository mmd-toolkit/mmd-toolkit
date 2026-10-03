# Compatibility with mermaid.js

Japanese version: [compatibility.ja.md](./compatibility.ja.md)

The plugin is checked against mermaid.js 12.0.0. Formatting keeps what
mermaid.js reads from a diagram, and text that mermaid.js rejects is left
unchanged. This document lists where that does not hold, and why.

## Inputs read differently from mermaid.js

The parser that the plugin uses reads the same inputs as mermaid.js, with nine
deliberate differences, whose exact definitions are in the specification's
[Known divergences](../../spec/docs/known-divergences.md), and without the site
configuration.

### Directives inside a token

A directive (`%%{ ... }%%`) is read as mermaid.js reads it: it is removed, and
the text on its two sides is joined. It may not lie inside a keyword, an arrow,
a string, a number, or punctuation, although mermaid.js accepts that. Such input
is reported as a syntax error and left unchanged. For example, mermaid.js reads
`A["a %%{init: {}}%% b"]` as a node with the label `a  b`.

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### Embedded data is not checked

The YAML inside the frontmatter, the content of a directive, and the data blocks
written as `@{ ... }` in the diagram are not parsed. A diagram whose embedded
data is malformed, has the wrong shape, or names something unknown, such as a
node shape, is rejected by mermaid.js, but is still formatted here.

Directives and data blocks are kept as written. The frontmatter is formatted
with Prettier's YAML formatter when Prettier can read it as YAML, and kept as
written otherwise (see [Frontmatter](#frontmatter)).

### HTML tags that start in the frontmatter

mermaid.js rewrites `="..."` inside HTML tags over the whole text, frontmatter
included, before it removes the frontmatter. A tag that starts in the
frontmatter can therefore change how a `"` of the diagram is read. The plugin
does not look for tags in the frontmatter.

For example, mermaid.js accepts a flowchart whose frontmatter has `title: <a`
and whose node is `A[b="c">d]`, with the label `b='c'>d`. The plugin reports it
as a syntax error and leaves it unchanged.

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
unchanged.

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### Empty forms between tokens

In flowchart, an empty string (`""`), an empty call (`call ()`), and an empty
description block (`accDescr {}`) that does not start a statement hold nothing,
and they can lie between any two tokens, where the tree has no place for them
(the specification's
[`tokenless-empty-forms`](../../spec/docs/known-divergences/tokenless-empty-forms.md)).
mermaid.js accepts them in many such places, as if they were not there:
`A-->|x""|B` is the edge from A to B with the label `x`, and `A call ()-->B` and
`A accDescr {}` are accepted too. The plugin reports such input as a syntax
error and leaves it unchanged. An empty description block where a statement
starts, as on a line of its own, is a description block statement, and it is
formatted as any other: the whitespace between its tokens follows
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens), and a
line break inside it is kept, with the `}` at the level of the `accDescr`.

In a class diagram, the same holds for an empty string where the grammar takes
none, an empty backquoted name, an empty generic type that does not end a class
name, an empty call, and an empty description block that does not start a
statement: `"" A --> B`, `class A``B`, and `class A~~B` are reported as syntax
errors. In a state diagram, an empty description block inside a statement, as in
`A accDescr {} --> B`, is reported as a syntax error, while an empty string
after `state`, which mermaid.js reads as nothing, is text that it does not read
and is kept as written.

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### A comment right after a character

In a sequence diagram, a comment starts at its `%%`, and the character before
the `%%` belongs to what comes before it (the specification's
[`comment-takes-character`](../../spec/docs/known-divergences/comment-takes-character.md)).
mermaid.js reads that character as part of the comment in some places: it reads
`autonumber 5%% c` without the number 5, rejects `A->>B:%% c`, which is the
message `%% c` here, and accepts a line `C%% c`, which is rejected here. The
plugin keeps whether whitespace is written before the mark of a comment, so that
mermaid.js reads `autonumber 5%% c` as before. It prints `A->>B:%% c` as
`A ->> B: %% c`, which mermaid.js reads as this specification does. It reports
what this specification rejects as a syntax error and leaves it unchanged.

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
so that mermaid.js reads the formatted text as it read the input.

This difference goes both ways.

### A text that starts with `classDiagram` and a word character

A text whose first word is `classDiagram` followed by an ASCII word character,
such as `classDiagramX`, has no header and is rejected here (the specification's
[`headerless-empty-ending`](../../spec/docs/known-divergences/headerless-empty-ending.md)).
mermaid.js accepts it when the text ends with an empty title, description, or
call, or a string opened at the end of a click statement. The plugin reports it
as a syntax error and leaves it unchanged.

This difference goes one way only: input that mermaid.js rejects is never
accepted.

### The start of a backquoted name or a generic type

In a class diagram, a backquoted name or the text of a generic type may start
with `"`, `~`, `<<`, `>>`, or a keyword such as `note` (the specification's
[`name-start-reads-unit`](../../spec/docs/known-divergences/name-start-reads-unit.md)).
mermaid.js reads that unit instead of the name: it rejects ``class `note` ``,
which declares the class `note` here, and reads ``A `"1"` --> B`` with the
cardinality `1`, where this is a relation from `A"1"`. The plugin keeps
backquoted names and generic types as written.

This difference goes both ways.

### Site configuration

The parser does not know the site configuration that a page passes to
mermaid.js. A flowchart with more edges than the `maxEdges` setting allows, 500
by default, is rejected by mermaid.js, but the parser accepts it, and the plugin
formats it.

## Words read with the line break after them

After the words `accTitle`, `accDescr`, `direction`, `click`, `call`, and
`href`, mermaid.js reads the whitespace that follows, line breaks included, with
the word (diagrams/flowchart.md, The statement context, and Click and callbacks,
in the specification). A `;` after such a word separates two statements, and a
line break in its place would not: `accTitle ; :` is the vertices `accTitle` and
`:`, while `accTitle` and `:` on two lines is an accessibility title. So when a
statement ends with one of these ids, or with an id that ends with `direction`
(a direction line takes `direction` after any run of characters), and a `;`
separates it from the next one, the statements stay on the line and the `;`
stays in place; the whitespace within the statements is formatted as usual. See
[Statements one per line](./flowchart.md#statements-one-per-line).

## Whitespace at the end of a style

Whitespace at the end of a `style`, `classDef`, or `linkStyle` statement is
removed. mermaid.js keeps it at the end of the last style, so this is the one
place where formatting changes what mermaid.js stores. The tests compare styles
without the whitespace at their ends.

The whitespace is kept where removing it would make mermaid.js reject the
statement: after a `,` at the end of the list, as in `style A fill:#f00, `. See
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace).

## Whitespace at the start of a label

mermaid.js drops whitespace at the start of a label without quotes, and so does
formatting, except where the label would then be read differently: the
whitespace is kept, as one space, when the label starts with `/`, `\`, `-`, or
`"`, or when its first word contains `@`, and the label then gets one space at
its end too. For example, `A[ /x/]` is a rectangle with the label `/x/`, while
`A[/x/]` is a lean-right shape with the label `x`, and `A[x@]` is rejected. See
[Label inner whitespace](./flowchart.md#label-inner-whitespace).

## Directives between tokens

mermaid.js removes a directive and reads the text on its two sides joined.
Formatting therefore keeps, on each side of a directive, whether whitespace was
written there: `flowchart %%{init: {}}%%LR` stays as it is, because
`flowchart%%{init: {}}%%LR` would be rejected. See
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
Both are accepted, so only the diagram shows the change. A line that holds a `;`
other than one that separates statements or ends a statement therefore keeps its
statements on it and its `;` where they are, whether the rule applies to it or
not; the rule does not read the whitespace between other tokens, so that is
formatted as usual. See
[Statements one per line](./flowchart.md#statements-one-per-line).

## Lines that hold a direction text

At the first position of a line where a unit starts, mermaid.js tries the
direction line before whitespace (diagrams/flowchart.md, The statement context,
in the specification). An indented line that holds `direction`, whitespace, and
a direction value anywhere is therefore a direction statement, while the same
line at the first column may be read in another way: `accTitle: t;direction TB`
is an accessibility title. Such a line that is not a direction statement is kept
as written, with its indentation. See [Indentation](./flowchart.md#indentation).

## Sequence messages from a number or `title`

A sequence message has one space on each side of its arrow, except when its
source is an id that whitespace after it would make another unit: a number, as
in `1->>2: x`, where `1 ->>2: x` is rejected, and `title` in any case, as in
`title->>B: x`, where `title ->> B: x` is a title (diagrams/sequence.md, The
statement context, in the specification). Such a message keeps its arrow
touching on both sides. See [Arrow spacing](./sequence.md#arrow-spacing).

## Sequence statements over several lines

In a sequence diagram, a statement continues on the next line when whitespace
comes before the line break, and such a statement is printed on one line. One
with a comment or a directive in it is kept as written, from its start to its
end: it cannot stand on one line, and the whitespace at the ends of its lines,
which the formatter does not write, is what joins its lines. So is a title with
a comment line between `title` and its text: the comment line is removed before
mermaid.js reads the text, so the line after it is the title. See
[Multi-line statements](./sequence.md#multi-line-statements).

## A line of only whitespace after a comment

In a class diagram, a line of only whitespace right after a line that ends with
a comment after a statement is printed as a line of one space, where any other
empty line is printed without whitespace. mermaid.js reads the line breaks after
such a comment as part of the comment, and the next line as part of the
commented statement, unless a line of only whitespace comes between them (see
[A comment that takes the line breaks after it](#a-comment-that-takes-the-line-breaks-after-it)):
`A --> B %% c`, a line of two spaces, and `A : +int age` is a relation and a
member, and without the spaces, a relation from A to `BA`. An editor that
removes whitespace at the ends of lines removes that space too, and mermaid.js
then reads the diagram otherwise. See [Comments](./class.md#comments).

## Class labels and member lines

In a class diagram, a member line and a generic type are kept as written: the
whitespace after a visibility mark and between the two `~` is part of the Db. A
label of only whitespace keeps the whitespace after its `:`, at the end of its
line: `A --> B : ` has an empty title and `A --> B` none. On a line that holds a
`;`, whether whitespace follows the `:` of a label is kept as written, since the
line rule of mermaid.js reads a `:` directly followed by text up to a `#`. See
[Labels](./class.md#labels) and [Member lines](./class.md#member-lines).

## Unclosed backquoted names

A backquoted name that is not closed runs to the end of the text, with the
whitespace and line breaks at its end. It is printed as written to the end of
the text, and no line break is added after it. See
[Unclosed backquoted names](./class.md#unclosed-backquoted-names).

## State ids spelled as keywords

In a state diagram, `scale`, `classDef`, `class`, `style`, `state`, `note`, and
`stateDiagram`, in any case, are keywords only when whitespace follows them. A
transition from an id spelled so keeps its arrow touching on both sides, as in
`scale-->B`, and a description after such an id keeps its `:` touching it:
`scale -->B` and `style :x` are rejected. See
[Arrow spacing](./state.md#arrow-spacing).

## State notes, aliases, and names

In a state diagram, what follows the id of a note on one line is kept as
written: mermaid.js reads the text of the note from right after the id, without
its first two characters. The second description of an alias definition is kept
as written, with the whitespace at its ends, which mermaid.js reads. The names
and the empty strings after `state` stay on the line of `state`: on a line of
its own, a second name would add a state. A `%%` or an empty description block
right before a `{` is kept as written up to the `{`. See
[Notes](./state.md#notes), [Aliases](./state.md#aliases),
[Statements one per line](./state.md#statements-one-per-line), and
[Composite states](./state.md#composite-states).

## State lines that hold a line separator

In a state diagram, a line that holds U+2028 or U+2029 is kept as written:
mermaid.js stops at these characters when it looks for a pseudostate mark, a
direction line, and a second name before a `{`, while the plugin reads them as
whitespace. See [Line separators](./state.md#line-separators).

## A comment line after U+2028 or U+2029

mermaid.js reads a comment line that starts right after U+2028 or U+2029, and
removes it together with its line break, so the text on the next line goes on
where the comment line was cut in: `alt`, U+2028, `%% e`, and a line ` a` is
`alt a`. The printer prints such a comment line on a line of its own. Where it
lies inside a statement or a block opener, such as `alt`, `box`, `namespace`,
`subgraph`, `style`, or the header of a diagram, formatting can give an output
that is rejected or that mermaid.js reads differently, or throw. A diagram
comment that such a comment line cuts is kept as written (see
[Line separators](./sequence.md#line-separators)). This is a known limitation.

## Frontmatter

The YAML between the `---` lines is formatted with Prettier's YAML formatter.
The `---` lines are kept as written.

The YAML is kept as written when the `---` lines are indented, and when a line
of the formatted YAML has the form of a `---` line (the specification's
[Frontmatter](../../spec/docs/common.md#frontmatter)), which would end the
frontmatter early. Prettier prints such lines: it prints `--- !!map` after a
`%YAML` directive as `---` and `!!map` on two lines.

The YAML is kept as written when it contains a `<` followed by an ASCII letter,
a digit, or `_`, before or after formatting. Such a `<` may start an HTML tag,
and mermaid.js rewrites `="..."` inside HTML tags before it reads the YAML.
Changing the quotes of a value inside a tag can change what mermaid.js reads.
For example, mermaid.js accepts `title: "<a b=\"c\">"`. Prettier would print it
as `title: '<a b="c">'`, which mermaid.js rewrites to `title: '<a b='c'>'`,
which is not YAML.

## Byte order mark

Prettier removes a byte order mark at the start of a file before the plugin
reads it, and adds it back afterwards. mermaid.js reads frontmatter after such a
mark only when the closing `---` line repeats the mark. So:

- When the mark stands before both `---` lines, mermaid.js accepts the text, and
  the plugin reports a syntax error.
- When the mark stands only before the opening line, mermaid.js rejects the
  text, and the plugin formats it.

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
