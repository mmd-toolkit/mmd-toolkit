# Agentflow formatting rules

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

These rules format `agentflow-beta` from its written AST. They keep the
specified reading, occurrence order and embedded source. Shared flowchart rules
are linked with their reasons; the differences below belong to Agentflow. Inputs
are shown as escaped JSON strings so missing final newlines and padding stay
visible. Output blocks copy the fixed fixtures. Unicode/control cases use
escaped test strings.

Formatting is not syntax repair: parser failures report `SyntaxError`, and
Markdown declines their payload to its host. Accepted divergences follow their
specified reading under
[Inputs read differently](./compatibility.md#inputs-read-differently-from-mermaidjs).
All corpus inputs, including rejections and divergences, run through the corpus
test. For example, `"Agentflow-beta TB\nA\n"` is rejected rather than having its
header repaired. [corpus fixture: agentflow/header-upper] Of the specified
divergences, Agentflow has six: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, embedded-data-opaque,
html-tag-in-frontmatter, bare-percent-line-before-header and
tokenless-empty-forms. A comment that takes the character before it or the line
breaks after it, the blank-line pairing and the C4 detection do not apply, a C4
word in Agentflow text stays Agentflow text, and the reserved word `click` does
not apply either. The formatter never asks mermaid.js while printing and never
reverts a result because mermaid.js reads it differently: formatting is not
syntax repair, and the specification already defines the exceptional readings.

## Rules

### Header

[Direction](./flowchart.md#direction) supplies the same column-one header
policy: the header is easy to find. Unlike the header of a flowchart, a header
direction `TD` is printed `TB`, the direction that the examples in the
documentation of mermaid.js use (10 times, and `TD` never; see
[The direction of a header](./compatibility.md#the-direction-of-a-header)): the
diagram type is later than the version of mermaid.js that made `TD` behave as
`TB`, so every version that reads it draws the two the same (see
[Versions of mermaid.js](./compatibility.md#versions-of-mermaidjs)). Agentflow
accepts only exact lower-case `agentflow-beta`. An absent direction stays
absent, symbol directions stay written, a direction that stands after a
directive which follows the header (`agentflow-beta%%{init: {}}%% TD`) stays as
written, and next-line LR remains a vertex. Ordinary header followers move into
the body; directive attachment follows Directives. [fixture:
header/header-column] [fixture: header/header-direction-spelling] [fixture:
header/header-inline-separated] [fixture: header/header-next-line-direction]
[fixture: header/header-symbol] [fixture:
header/header-direction-after-directive-kept] A symbol direction stands after
one space, as in [flowchart](./flowchart.md#direction): `agentflow-beta<` is
printed `agentflow-beta <`. [fixture: header/header-symbol-touching-spaced]
[test: agentflow: U+2028 between the header keyword and its direction]

Input (escaped): `"agentflow-beta"`. [fixture: header/header-only]

Output
([header/header-only-output.mmd](../tests/fixtures/agentflow/header/header-only-output.mmd)):

```mmd
agentflow-beta
```

### Indentation

Reuse [Indentation](./flowchart.md#indentation) for the same reason: indentation
from the AST makes nesting visible, while authored columns do not determine
membership. Use one configured step below the header and each flow/global, align
end with its opener, and give connectors no body. `useTabs` uses one tab per
level. Agentflow uses the shared significant indentation width: even with
`tabWidth: 0`, each body step is at least one space. Indented lines such as
`accTitle: direction LR` are direction statements; moving them to column one
would change the Db or reject a style-prefixed direction line. Non-direction
lines whose reading depends on their columns keep their written indentation
under Direction. [fixture: indentation/indent-direction-unsafe] [fixture:
indentation/indent-nested] [fixture: indentation/indent-tabs] [fixture:
indentation/indent-zero]

Input (escaped): `"agentflow-beta TB\nflow F\nA\nend"`. [fixture:
indentation/indent-four]

Output
([indentation/indent-four-output.mmd](../tests/fixtures/agentflow/indentation/indent-four-output.mmd)):

```mmd
agentflow-beta TB
    flow F
        A
    end
```

### Containers

Reuse flowchart [Indentation](./flowchart.md#indentation) and
[Statements one per line](./flowchart.md#statements-one-per-line): an opening,
body and closing line make structure readable. Keep named and unnamed flows,
globals, empty and mixed nested bodies, and statement order. Globals affect
membership despite emitting no container, so they remain blocks. Never
manufacture a name or data. Agentflow end/global consume only ASCII spaces/tabs;
they do not absorb LF into a name. A semicolon after end is a separate
EmptyStatement at the containing depth. [fixture: containers/containers-empty]
[fixture: containers/containers-one-line] [fixture:
containers/end-name-not-greedy] [fixture: containers/global-flatten-unsafe] A
run of spaces and tabs in the title of a flow is printed as one space, except in
a markdown string, in a flow with a data block (`F@{ view: "collapsed" }`; the
id of a flow named by a string is the text between the quotes, without the
whitespace at its ends, and for a markdown string the text between its
backquotes: `flow "F"` and `flow " F "` have the id `F`), and in a diagram that
names `swimlane`, where mermaid.js wraps the title (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: containers/flow-title-runs-collapsed] [fixture:
containers/flow-title-collapsed-runs-kept] [fixture:
containers/flow-quoted-name-title-collapsed-runs-kept] [fixture:
containers/flow-spaced-quoted-name-title-collapsed-runs-kept] [fixture:
containers/flow-markdown-name-title-collapsed-runs-kept] [fixture:
containers/flow-two-part-name-title-collapsed-runs-kept]

Input (escaped): `"agentflow-beta TB\nglobal\t \nA\nend B"`. [fixture:
containers/global-tabs]

Output
([containers/global-tabs-output.mmd](../tests/fixtures/agentflow/containers/global-tabs-output.mmd)):

```mmd
agentflow-beta TB
  global
    A
  end
  B
```

### Names and headings

Reuse [Subgraph header](./flowchart.md#subgraph-header) for an ordinary
single-part name with an explicit title: the `[` of the title touches the name,
so `flow F [T]` is printed `flow F[T]`, and so is `connector F [T]`. All 19
headings with a title in
[the documentation of agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L26-L363)
are written so, and the Db is the same for both forms. The whitespace inside the
brackets of the title is dropped, so `[ T ]` is printed `[T]` and `["x" ]` is
printed `["x"]`, as in flowchart; Agentflow has no reason to choose a different
form. One space stays where the title would be read otherwise (`[ /x/ ]`, and
`[ x@ ]` in Agentflow). A directive at an edge of the title touches the bracket
and the title, as the gap has no space: `flow F[ %%{x}%% T ]` is printed
`flow F[%%{x}%%T]`, and `flow G[ T %%{x}%% ]` is printed `flow G[T%%{x}%%]`.
[fixture: names-and-headings/heading-title-directive-at-edge] A U+2028 or U+2029
on the line of the `]` stays, and one at the start of a continuation line is
read as its indentation. [test: agentflow: U+2028 inside the brackets of a flow
title] [test: agentflow: U+2029 inside the brackets of a flow title] [fixture:
names-and-headings/heading-title-padding-dropped] [fixture:
names-and-headings/name-heading-touches-title] [fixture:
names-and-headings/name-heading-touches-title-kinds] A name of several parts,
with an erased `click` or an empty string in it, is kept as written from its
first part to its last, the whitespace before the title included, as under the
rules below. After `click`, that whitespace ends the click id, so
`flow F click [T]` and `flow F click[T]` are different headings; after an empty
string the Db would be the same, and the name is kept the same way. [fixture:
names-and-headings/name-heading-title-multi-part-name-kept] A directive or a
comment that ends the name keeps the whitespace written after it, as under
[Directives](#directives), and a directive inside the gap keeps whether
whitespace was written after it: that whitespace becomes one space. The
whitespace before the directive stays as written while the `[` is apart from the
directive, since the name then runs through the directive
(`flow F   %%{init: {}}%% [T]` is not changed). When the `[` touches the
directive, the name ends before the directive and the title touches the name, so
the whitespace before the directive is dropped (`flow H   %%{init: {}}%%[T]` is
printed `flow H%%{init: {}}%%[T]`). [fixture:
names-and-headings/name-heading-title-beside-directive] [fixture:
names-and-headings/name-heading-title-gap-run-beside-directive] [test:
agentflow: a comment and U+2028 between a flow name and its title] Between a `:`
and a `#` of a line that the line rule may read, the gap keeps whether it holds
whitespace, as in flowchart. [fixture:
names-and-headings/name-heading-title-after-colon-before-hash] A U+2028 or
U+2029 in the gap stays where it is. [test: agentflow: U+2028 between a flow
name and its title] [test: agentflow: U+2029 between a connector name and its
title]

The `@{` of a data block touches an ordinary single-part name that has no title,
as the `[` of a title does: `connector github @{ protocol: "mcp" }` is printed
`connector github@{ protocol: "mcp" }`, and `flow F  @{ a: 1 }` is printed
`flow F@{ a: 1 }`. mermaid.js trims the whitespace after the name, so the Db is
the same, and the documentation of mermaid.js writes the `@{` of a data block
touching the id or title before it
([`create["create_issue"]@{ ... }`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L290)).
A name that holds a directive or a comment is kept as written, as above.
[fixture: names-and-headings/heading-data-touches-name] [test: agentflow: U+2029
between a connector name and its data block]

The whitespace at the end of an ordinary single-part name that has neither a
title nor a data block is dropped in the same way: `flow F` followed by two
spaces is printed `flow F`, and so is `flow F ;` followed by a line, where the
`;` becomes a line break. mermaid.js trims the name, so the Db is the same, and
`flow F` followed by spaces and `flow F` are one flow. A name that holds a
directive or a comment, a name of several parts, and a name of whitespace only
are kept as written, as above. At the end of the name, U+2028 and U+2029 are
characters of the name and no spaces or tabs: the spaces after one go, and the
spaces before it stay. [test: agentflow: U+2028 and spaces at the end of a flow
name] [test: agentflow: U+2029 and spaces at the end of a connector name]
[fixture: trailing-whitespace/trailing-name-dropped] [fixture:
containers/end-name-not-greedy] [fixture:
names-and-headings/heading-word-gap-before-semicolon] [fixture:
names-and-headings/name-directive-trailing-kept]

The whitespace after the word `flow`, `connector`, or `global` is one space,
however many spaces or tabs were written: the word takes one whitespace
character, and mermaid.js trims the rest from the name. `flow   F["T"]` is
printed `flow F["T"]`, and `global` followed by spaces is printed `global`.
[fixture: names-and-headings/heading-word-gap-collapsed] A directive in the gap
is placed as under [Directives](#directives). [fixture:
names-and-headings/heading-word-gap-beside-directive] This holds where the name
is a single part; a name of several parts is kept as written, as above.
[fixture: names-and-headings/name-heading-title-multi-part-name-kept] A U+2028
or U+2029 in the gap stays where it is. [test: agentflow: U+2028 after the flow
word] [test: agentflow: U+2029 after the connector word]

A whitespace-only name before an explicit title keeps its written characters:
removing them would remove the required name. [fixture:
names-and-headings/whitespace-name-before-title]

Otherwise keep all source text from the first name part through the last:
quoted/markdown padding, erased `click`, empty description/string/markdown/call
forms, their gaps and continuation columns. These parts belong to the name even
when Mermaid drops them from its id. Unlike flowchart, Agentflow does not reject
this use of `click` or read LF after `end` as name text. A connector has a name
but no closing `end`. [fixture: names-and-headings/name-collapse-unsafe]
[fixture: names-and-headings/name-click-reindent-unsafe] [fixture:
names-and-headings/name-quoted-tail] [fixture:
names-and-headings/name-whitespace-only] [fixture:
names-and-headings/directive-after-erased-string]

After name text read as a click id, exactly one whitespace character ends that
reading. Keep that character, including a tab or LF, before a title, data, or a
statement that follows, also one after a `;` that becomes a line break: without
it the line break ends the id and the next statement is read as a part of the
name, so the Db differs. Drop a space or tab where nothing follows it but
whitespace, line breaks, and separators: the text then ends the id, as at EOF
without the character, and the Db and the figure are the same. [fixture:
names-and-headings/name-exit-space-before-statement-kept] [fixture:
names-and-headings/name-exit-space-before-separator-statement-kept] [fixture:
names-and-headings/name-exit-space-before-blank-end-dropped] Additional
whitespace belongs to the next name part. Empty strings and empty markdown
strings erase no such ending character. If whitespace already separates an
erased form from later name text, it has ended the click reading: do not take
another LF after the name or add a blank line. In connector names, text directly
after an erased empty string may begin with `;`. When LF ends that click-id
text, keep it before the statement-separating LF; removing it would merge the
next statement into the name and can reject it. [fixture:
names-and-headings/connector-empty-string-adjacent-semicolon-exit] [fixture:
names-and-headings/connector-empty-string-adjacent-text-exit] [fixture:
names-and-headings/click-empty-string-lf-body] [fixture:
names-and-headings/click-empty-markdown-eof-tab] [fixture:
names-and-headings/directive-before-click-exit] [fixture:
names-and-headings/empty-string-before-name-space] [fixture:
names-and-headings/empty-string-before-name-lf] [test: agentflow:
empty-string-before-name-ls-flow] [test: agentflow:
empty-string-before-name-ls-connector] [fixture:
names-and-headings/click-empty-markdown-connector-tab] [fixture:
names-and-headings/click-empty-markdown-lf-body] [fixture:
names-and-headings/click-empty-markdown-space-semicolon] [fixture:
names-and-headings/click-empty-string-connector-tab] [fixture:
names-and-headings/click-empty-string-eof-tab] [fixture:
names-and-headings/click-empty-string-space-semicolon] [fixture:
names-and-headings/name-exit-lf-empty-line] [fixture:
names-and-headings/name-exit-lf-semicolon] [fixture:
names-and-headings/name-exit-tab-eof] [fixture:
names-and-headings/name-ordinary-fragment-blank] [fixture:
names-and-headings/name-click-exit-before-data-tab] [fixture:
names-and-headings/name-click-exit-before-title-tab]

A name read as a click id that reaches EOF with no exit character keeps its text
as written; the only addition is the final LF of
[Final newline](#final-newline). [fixture:
names-and-headings/name-click-exit-eof]

Ordinary blank gaps after the character ending click-id text follow Blank lines.
[fixture: names-and-headings/name-exit-lf-empty-line] [fixture:
names-and-headings/name-ordinary-fragment-blank]

When a separator `;` becomes a line break, drop a final name part made only of
whitespace after an empty description block: whitespace before `;` is name text,
but whitespace before the printed LF is not. Keep it when the semicolon stays on
its line under Kept lines. [fixture:
names-and-headings/empty-description-kept-separator] This applies to flow and
connector names, spaces, tabs, runs of spaces, a separator followed by LF, and
repeated separators. [fixture: names-and-headings/empty-description-space-flow]
[fixture: names-and-headings/empty-description-tab-flow] [fixture:
names-and-headings/empty-description-two-spaces-flow] [fixture:
names-and-headings/empty-description-separator-lf] [fixture:
names-and-headings/empty-description-separated-semicolons] [fixture:
names-and-headings/empty-description-space-connector] [fixture:
names-and-headings/empty-description-tab-connector] [fixture:
names-and-headings/empty-description-two-spaces-connector]

Input (escaped): `"agentflow-beta TB\nflow F accDescr {} ;A\nend"`. [fixture:
names-and-headings/empty-description-space-flow]

Output
([names-and-headings/empty-description-space-flow-output.mmd](../tests/fixtures/agentflow/names-and-headings/empty-description-space-flow-output.mmd)):

```mmd
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

### Single space gaps

Unlike flowchart
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens), never
normalize the required single-whitespace-character gaps after
style/classDef/class/linkStyle, before class values and interpolation names, or
before tooltips. The grammar consumes exactly one whitespace character;
following whitespace is value text, and a second character where a token is
expected can reject. Tabs used as that character remain tabs. Preserve
first-style leading whitespace even across directives, empty style-list items,
escaped classDef commas, order and repetition. The first-style whitespace does
not collapse as in flowchart. Each style has no whitespace before its first `:`
and one space after it where the value is not empty. The `,` between styles has
no whitespace before it and one space after it:
`style A fill :#f00,stroke:  #333` is printed
`style A fill: #f00, stroke: #333`. [fixture:
single-space-gaps/style-colon-spaced] A run of spaces and tabs between the words
of a style is printed as one space, and whether whitespace stands between two
words stays as written, as in
[flowchart](./flowchart.md#whitespace-between-tokens): a run inside a
single-quoted string, inside a comment that is not closed, and the escape after
a backslash stay: the hexadecimal digits and the one space or tab that follows
them, or else the next character. [fixture:
single-space-gaps/style-words-run-spaced] [fixture:
single-space-gaps/style-string-runs-kept] [fixture:
single-space-gaps/style-hex-escape-run-spaced] A `linkStyle` with link numbers
keeps whether whitespace follows the `,` before a style that starts with `fill`,
a run of whitespace becoming one space; `fill-opacity` counts, as mermaid.js
reads only the start. [fixture:
single-space-gaps/link-style-fill-after-comma-kept] [fixture:
single-space-gaps/link-style-fill-opacity-after-comma-kept] A `linkStyle`, with
link numbers or `default`, keeps it for a style that starts with `stroke:` too,
which mermaid.js reads at the start where the look is `handDrawn`. [fixture:
single-space-gaps/link-style-stroke-after-comma-kept] The other styles of such a
statement, and `linkStyle default`, use the one form (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
In a `linkStyle` or a `classDef`, which can reach a link, a name that ends with
`stroke` keeps whether whitespace stands between it and the `:`, a run of
whitespace becoming one space (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
[fixture: single-space-gaps/link-style-stroke-before-colon-kept] [fixture:
single-space-gaps/class-def-stroke-before-colon-kept] A `style` styles a node,
and uses the one form. [fixture:
single-space-gaps/style-stroke-before-colon-spaced] A space after a backslash
that ends a style of a `style` is read as nothing, as in
[flowchart](./flowchart.md#whitespace-between-tokens). [fixture:
single-space-gaps/style-backslash-space-dropped] A style of a `linkStyle` with a
name that ends with `stroke` and a value of spaces and tabs only stays as
written, as in [flowchart](./flowchart.md#whitespace-between-tokens). [fixture:
single-space-gaps/link-style-blank-stroke-value-kept] A style of a `linkStyle`
that ends with a backslash keeps whether whitespace stands after it, a run of
whitespace becoming its first character, as in
[flowchart](./flowchart.md#whitespace-between-tokens). [fixture:
single-space-gaps/link-style-backslash-space-kept] In a `classDef` a `,` after a
backslash is part of its style, and a space between the backslash and the `,`
stays, since taking it away would make the `,` part of the style; in a `style`
and a `linkStyle` the `,` ends a style whatever stands before it. A space after
a backslash before the `:` stays as well, since taking it away would escape the
`:`, and the whitespace after that space goes, as in
[flowchart](./flowchart.md#whitespace-between-tokens). [fixture:
single-space-gaps/style-escaped-space-before-comma] [fixture:
single-space-gaps/style-backslash-before-comma] [fixture:
single-space-gaps/style-colon-escaped-space-kept] [fixture:
single-space-gaps/style-colon-escaped-space-run-dropped] A statement stays as
written where it holds a directive or a comment, where a style is all
whitespace, or where a style holds a line break, U+2028, or U+2029, or its line
holds a kept `;`. [fixture: single-space-gaps/classdef-first-tab] [fixture:
single-space-gaps/linkstyle-first-spaces] [fixture:
single-space-gaps/style-directive-gap] [fixture:
single-space-gaps/style-first-spaces] [fixture:
single-space-gaps/styles-inner-gaps] [fixture:
single-space-gaps/style-comma-before-dropped] [fixture:
single-space-gaps/style-comma-beside-directive-kept] [test: agentflow: U+2028
before the comma of a style statement]

A style that starts with the `:` is printed as any other: one space after the
`:`, and the runs between its words as one space. `style A :  red   x` is
printed `style A : red x`. [fixture:
single-space-gaps/style-colon-first-run-spaced]

The tab after linkStyle and the tab before an interpolation name each supply the
grammar's required single whitespace character; both remain written. [fixture:
single-space-gaps/linkstyle-required-tab] [fixture:
single-space-gaps/interpolate-required-tab]

Input (escaped): `"agentflow-beta TB\nA\nclass\tA\tc\n"`. [fixture:
single-space-gaps/class-required-tab]

Output
([single-space-gaps/class-required-tab-output.mmd](../tests/fixtures/agentflow/single-space-gaps/class-required-tab-output.mmd)):

```mmd
agentflow-beta TB
  A
  class	A	c
```

### Arrows

Reuse [Arrow spacing](./flowchart.md#arrow-spacing): one exterior space makes a
relation readable; an edge id touches its @ and arrow. Keep directive touching
and exact dash/dot counts, including counts beyond the Db cap: below the cap a
shorter or longer arrow is another arrow (`A---->B` printed as `A --> B` is read
differently), and beyond the cap the Db is the same but the tree keeps the
written length, and a Db-equal capped arrow is not shortened because an equal Db
alone gives no permission to rewrite authored text. Agentflow has only sequence
`-->`, failure `--x`, and reference `-.-`, with their extensions. Reference
length counts dots. A following x may be vertex text; no unsupported arrow
family is introduced. [fixture: arrows/arrow-cap-spelling] [fixture:
arrows/arrow-length-change-unsafe] [fixture: arrows/arrow-lengths] [fixture:
arrows/edge-id] [fixture: arrows/marker-letter-vertex] [fixture:
arrows/three-kinds]

An edge id after a data block touches it: a vertex statement takes no whitespace
after a data block except the one that an arrow reads, so
`A@{ shape: rect }e1@-->B` is accepted and `A@{ shape: rect } e1@-->B` is
rejected. [fixture: arrows/edge-id-after-data-block-touches] An edge id that
starts as an arrow does touches the shape or the data block before it, as in
`A["x"]--a@-->B`. In agentflow that is an edge id that starts with `--`, `-.-`,
or `-..-`; one such as `x--a`, `==a`, `-.a`, or `.-a` is read the same after
whitespace, and has one space before it. [fixture:
arrows/edge-id-arrow-like-kept-attached] [fixture:
arrows/edge-id-not-arrow-like-gets-one-space]

Input (escaped): `"agentflow-beta TB\nA--xB"`. [fixture:
arrows/arrow-kind-change-unsafe]

Output
([arrows/arrow-kind-change-unsafe-output.mmd](../tests/fixtures/agentflow/arrows/arrow-kind-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A --x B
```

### Edge labels

Reuse [Link label form](./flowchart.md#link-label-form) and
[Arrow spacing](./flowchart.md#arrow-spacing) with their reasons: make relations
readable. A label of plain text (letters, digits, spaces, `_`, `,`, `?`, and
`!`) on the arrow `-->` or `--x` is printed between two arrows, the form that
the examples in the documentation of mermaid.js use twice against none for the
form between pipes (see
[The label of a link](./compatibility.md#the-label-of-a-link)): `A -->|x| B` is
printed `A -- x --> B`. [fixture: edge-labels/pipes-to-arrows] Any other label
keeps the pipe/split form it is written in, since split text can contain a pipe,
a label with a `|` or a `%%`, a string, and a Markdown label cannot be printed
between the arrows, a label of blanks only is rejected between the arrows, and
only the arrows `-->` and `--x` can have a label between two arrows. [fixture:
edge-labels/blank-pipe-label-kept] Pipes touch the arrow and their label; split
text has one exterior space. Print one post-pipe gap. Only sequence/failure
support split labels. Keep string/markdown kind, bare continuation, and split
semicolons, percent text and line breaks; do not invent another string or split
reference form. [fixture: edge-labels/edge-label-forms] [fixture:
edge-labels/split-pipe-content] A string between pipes keeps its text, and the
pipes touch the arrow and the quotes: `A  -->  |"x  y"|B` is printed as
`A -->|"x  y"| B`. [fixture: edge-labels/pipe-label-string-kept] So does a
closing pipe that was written apart from the closing quote: `A-->|"x" |B` is
printed `A -->|"x"| B`. [fixture: edge-labels/pipe-string-closing-touches]
[test: agentflow: U+2028 between the closing quote and the `|` of an edge label]

Input (escaped): `"agentflow-beta TB\nA --> |x| B"`. [fixture:
edge-labels/pipe-label-gap]

Output
([edge-labels/pipe-label-gap-output.mmd](../tests/fixtures/agentflow/edge-labels/pipe-label-gap-output.mmd)):

```mmd
agentflow-beta TB
  A -- x --> B
```

### Labels

Reuse [Label inner whitespace](./flowchart.md#label-inner-whitespace): Mermaid
discards ordinary bare exterior padding, whereas internal and quoted/markdown
label text stays, and a label of spaces and tabs only is printed as one space.
Keep one leading/trailing space for slash, backslash, dash, quote characters,
and when `@` in the first word would make it read as an edge id; put no space
before slanted ?]/=] closers. Agentflow label comments are different: their
preceding spaces/tabs are label content, so preserve that padding, the comment
and its LF/continuation columns, including a closing bracket that belongs to the
comment rather than closing the shape. Tildes remain content. Shape spellings,
entities and HTML remain authored. [fixture: labels/labels-closers] [fixture:
labels/labels-leading-sensitive] [fixture: labels/labels-leading-at-sign]
[fixture: labels/labels-padding] [fixture: labels/labels-tilde] [fixture:
labels/labels-trim-sensitive-unsafe]

Flow/connector heading titles follow
[Subgraph header](./flowchart.md#subgraph-header) instead: drop the whitespace
inside their brackets, including `[ T ]`, for the same reason as flowchart.
[fixture: names-and-headings/name-heading-touches-title]

Input (escaped): `"agentflow-beta TB\nA[text]"`. [fixture:
labels/labels-quote-unsafe]

Output
([labels/labels-quote-unsafe-output.mmd](../tests/fixtures/agentflow/labels/labels-quote-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A["text"]
```

### Vertices and lists

Reuse [Whitespace between tokens](./flowchart.md#whitespace-between-tokens) and
[Kept as written](./flowchart.md#kept-as-written): touching is lexical, and
whitespace on both sides of & distinguishes a group from one id. Keep tight
id/shape/:::/data suffixes, property Identifiers, actual comma-list holes
(including empty ends), comma-bearing single ids, occurrences and order. Do not
split ids, sort lists or manufacture a trailing comma: a style target, a class
suffix, a second class id or a vertex id that contains commas is one Identifier,
and only the grammar's own id lists split at commas; property operands are
Identifiers, not numbers to rewrite. [fixture:
vertices-and-lists/class-list-holes] [fixture:
vertices-and-lists/groups-suffixes]

Input (escaped): `"agentflow-beta TB\nA&B"`. [fixture:
vertices-and-lists/ampersand-id]

Output
([vertices-and-lists/ampersand-id-output.mmd](../tests/fixtures/agentflow/vertices-and-lists/ampersand-id-output.mmd)):

```mmd
agentflow-beta TB
  A&B
```

### Metadata blocks

Reuse [Data blocks](./flowchart.md#data-blocks): embedded contents are outside
the syntax tree. Keep each complete `@{...}` separately on its written vertex or
flow/connector heading, with adjacency, directives, aliases, unknown/prototype
keys, scalar/array/empty/multiline content. Agentflow's later routing and domain
aliases do not authorize rewriting or merging the YAML. Content-only rejection
uses the specified opaque reading; a raw rejection has no Db, and delimiter
failures remain failures. [fixture: metadata-blocks/metadata-adjacent] [fixture:
metadata-blocks/metadata-alias-rewrite-unsafe] [fixture:
metadata-blocks/metadata-multiline]

A block on one line is printed with one space inside each end, and stays as
written in the cases listed under [Data blocks](./flowchart.md#data-blocks).
Where its line is too long it prints on lines, one entry on each, under the
conditions listed there. [fixture: metadata-blocks/long-split] [fixture:
metadata-blocks/one-line-padded] [fixture:
metadata-blocks/one-line-space-only-padded] [fixture:
metadata-blocks/one-line-directive-kept] [fixture:
metadata-blocks/one-line-kept-line-kept] [fixture:
metadata-blocks/one-line-touching-blocks-kept] [fixture:
metadata-blocks/one-line-separate-blocks-padded] [fixture:
metadata-blocks/compat-document-marker-data-block-kept] [fixture:
metadata-blocks/one-line-document-marker-after-space-padded] [fixture:
metadata-blocks/one-line-padded-zero-width] [fixture:
metadata-blocks/one-line-surrounding-trivia] [test: data blocks: agentflow one
line with U+2028 inside] [test: data blocks: agentflow one line with U+2029
inside] [test: data blocks: agentflow one line with no-break spaces at the ends]

For a block whose opener is immediately followed by a newline, move all body
lines by the same number of ASCII spaces so the shallowest text is one level
inside the statement, including in a `flow` body. Nested YAML keeps its relative
indentation; a separate `}` aligns with the statement, and a closer after text
moves with that line. [fixture: metadata-blocks/zero-and-shallow] [fixture:
metadata-blocks/deep-nested-yaml] [fixture: metadata-blocks/closing-after-text]
[fixture: metadata-blocks/connector-multiline]

The other shared movement conditions and their reasons are in
[Data blocks](./flowchart.md#data-blocks): keep inline-opening blocks, embedded
directives, kept lines, zero-width indentation, blocks starting after the
statement's first line as written, and, with `useTabs`, the statement that holds
a block of several lines as a whole. Surrounding comments, directives, empty
descriptions, blank lines and separators follow their own rules. [fixture:
metadata-blocks/inline-and-directive-kept] [fixture:
metadata-blocks/kept-body-line] [fixture: metadata-blocks/zero-width-kept]
[fixture: metadata-blocks/tab-statement-space-body] [fixture:
metadata-blocks/use-tabs-empty-lines-kept] [fixture:
metadata-blocks/use-tabs-folded-empty-lines-kept] [fixture:
metadata-blocks/surrounding-trivia] [test: data blocks: agentflow U+2029] [test:
data blocks: agentflow CRLF]

The header of a `flow` or `global` container moves its block in the same way.
[fixture: metadata-blocks/container-header] With `useTabs` the header is not
printed as written, unlike a statement: the `end` of the container stands at the
indentation that the printer gives the header, so the header takes it, and the
lines of its block move with it, as without `useTabs`. [fixture:
metadata-blocks/use-tabs-container-header-indented] A statement that stands
after the header on its line, as `A@{ … }` does in `flow G; A@{ … }`, is a
statement inside the container, and the indentation written at the start of the
line is that of the header, so the statement is not printed as written either
(see [Data blocks](./flowchart.md#data-blocks)). So is a statement after an
`end` when a statement of the container comes first, as `A@{ … }` in
`B; end; A@{ … }`, and a statement on a line that starts with anything else than
the things listed there, as `C; A@{ … }` does after `B -->`, or after the rest
of a directive that runs over lines. [fixture:
metadata-blocks/use-tabs-container-header-statement-moved] [fixture:
metadata-blocks/use-tabs-statement-before-end-moved] [fixture:
metadata-blocks/use-tabs-edge-continuation-moved] [fixture:
metadata-blocks/use-tabs-directive-continuation-moved]

A block after an arrow's newline retains its columns because it starts after the
statement's first line, and a statement with two blocks, of one line or of
several, retains both. The same holds for a `flow` header and a `connector`.
[fixture: metadata-blocks/later-statement-blocks-kept] [fixture:
metadata-blocks/adjacent-single-line-after-kept] [fixture:
metadata-blocks/adjacent-single-line-before-kept] [fixture:
metadata-blocks/separate-single-line-block-kept] [fixture:
metadata-blocks/container-header-adjacent-kept] [fixture:
metadata-blocks/connector-adjacent-single-line-kept]

Input (escaped): `"agentflow-beta TB\nA@{}@{\n}"`. [fixture:
metadata-blocks/metadata-empty]

Output
([metadata-blocks/metadata-empty-output.mmd](../tests/fixtures/agentflow/metadata-blocks/metadata-empty-output.mmd)):

```mmd
agentflow-beta TB
  A@{}@{
}
```

### Semicolons

Reuse [Semicolons](./flowchart.md#semicolons): ordinary separators and top-level
EmptyStatements add no meaning and are dropped; body EmptyStatements can be
members and stay on their own lines. Keep them in both flow and global bodies,
including after nested end. Do not flatten global membership. Kept lines and
style statements with a final empty style and following empty description blocks
override separator deletion. [fixture: semicolons/semicolon-before-directive]
[fixture: semicolons/semicolons-drop-member-unsafe] [fixture:
semicolons/semicolons-flow] [fixture: semicolons/semicolons-global]

The line rule reads the text of a `%%` comment in the middle of a line, which an
agentflow accepts, but not a directive: `A[style:]-->B %% #x;` keeps its arrow
tight, while `C[style:]-->D %%{init:{"x":"#;"}}%%` is spaced as any other line.
[fixture: semicolons/line-rule-comment-read]

Input (escaped): `"agentflow-beta TB\nA;B;; ;"`. [fixture:
semicolons/semicolons-top]

Output
([semicolons/semicolons-top-output.mmd](../tests/fixtures/agentflow/semicolons/semicolons-top-output.mmd)):

```mmd
agentflow-beta TB
  A
  B
```

### Kept lines

Reuse [Statements one per line](./flowchart.md#statements-one-per-line) and
[Semicolons](./flowchart.md#semicolons) for the same reasons: removing or moving
a semicolon can change which one Mermaid ignores. A line with a semicolon inside
a value or comment therefore keeps all its statements and semicolons together.
The presence of whitespace between a colon and a later `#` is kept, since those
characters select the ignored semicolon. Ordinary token gaps still format. A
sole terminal ignored semicolon can drop when no other candidate remains.
[fixture: kept-lines/line-rule-kept] [fixture: kept-lines/line-rule-colon-space]
[fixture: kept-lines/line-rule-safe-terminal] [fixture:
kept-lines/line-rule-shift-unsafe] [fixture: kept-lines/line-rule-two-passes]

Keep a separating semicolon after a statement or name ending in `accTitle`,
`accDescr`, `direction`, `click`, `call` or `href`, and after any id ending in
`direction`: these words can consume a new LF and the following text. Keep a
style statement whose final style is empty together with following empty
description blocks that start on its line; splitting them would change how the
required whitespace is read. [fixture: kept-lines/word-separator-kept] [corpus
fixture: agentflow/gram-empty-description-splits-interpolate-spaces]

A semicolon that terminates an unclosed directive stays where written. Keep
complete values and comments when they cross a kept line, and keep U+2028/U+2029
where they delimit the text on which the semicolon rule operates. Agentflow's
`end` and `global` do not consume LF, and its real comments need none of
flowchart's handling of percent text read as a vertex. [fixture:
kept-lines/open-directive-semicolon] [corpus fixture:
agentflow/lex-style-trigger-ls-segment]

Input (escaped): `"agentflow-beta TB\nA[Style:#x;y]"`. [fixture:
kept-lines/line-rule-nonmatch]

Output
([kept-lines/line-rule-nonmatch-output.mmd](../tests/fixtures/agentflow/kept-lines/line-rule-nonmatch-output.mmd)):

```mmd
agentflow-beta TB
  A[Style:#x;y]
```

### Blank lines

Reuse [Blank lines](./flowchart.md#blank-lines): one blank groups statements;
more add nothing. Collapse ordinary and whitespace-only runs to one and drop
document/body-edge blanks, including inside flows/globals. Preserve blanks
inside values, metadata and directives. Agentflow comments leave LF and do not
consume following blanks; no blank-line-pairing divergence applies. Default size
branches override ordinary blank layout. [fixture:
blank-lines/blank-comment-content] [fixture: blank-lines/blank-runs] [fixture:
blank-lines/blank-value]

Input (escaped): `"agentflow-beta TB\nA\n%% c\n\n\nB"`. [fixture:
blank-lines/blank-comments]

Output
([blank-lines/blank-comments-output.mmd](../tests/fixtures/agentflow/blank-lines/blank-comments-output.mmd)):

```mmd
agentflow-beta TB
  A
  %% c

  B
```

### Comments

Consecutive ordinary separators and top-level EmptyStatements before a real
comment are removed as well. [fixture:
comments/repeated-separators-before-comment] [fixture:
comments/comment-looking-values] [fixture: comments/comments-align]

Reuse [Comments](./flowchart.md#comments) for the same reason: align standalone
comments with neighbouring statements and retain the author's complete text,
including trailing spaces. [fixture: comments/comments-align] [fixture:
comments/comment-trailing] A harmless trailing-comment gap becomes one space.
Agentflow recognizes real comments after semicolons and description closers;
ordinary separator semicolons before them can drop. At normal size comments
continue through LS/PS until LF/EOF, and a percent pair inside an
already-started id is id text. Label-side padding stays under Labels. [fixture:
comments/comment-label] [fixture: comments/comment-label-spaces-unsafe] Strings,
markdown, split labels, accessibility, callbacks and data retain apparent
comments as values. [fixture: comments/comment-looking-values] Bare %% and
specified pre-header percent-brace comments remain authored. Above-limit common
regions are covered by Default size branches.

Input (escaped): `"agentflow-beta TB\nA;%% c\nB"`. [fixture:
comments/comment-after-semicolon]

Output
([comments/comment-after-semicolon-output.mmd](../tests/fixtures/agentflow/comments/comment-after-semicolon-output.mmd)):

```mmd
agentflow-beta TB
  A %% c
  B
```

### Directives

Reuse [Directives](./flowchart.md#directives) for the same reason: removal
supplies no separator. Keep contents, order and continuation columns, align
standalone directives, and place a directive within a printed line as under
[Directives](./flowchart.md#directives). A directive after a header separator
moves into the body with its following statement, keeping whether they touch,
just as in flowchart: the Db is the same, and no reason specific to Agentflow
calls for attaching it to the header instead. A line already kept under Kept
lines stays together. [fixture: directives/header-directive-before-body]
[fixture: directives/header-directive-touching-body] [fixture:
directives/header-touching-kept-line] [fixture: directives/directive-gap]
[fixture: directives/directive-header] [fixture: directives/directive-multiline]
[fixture: directives/directive-touch] [fixture: directives/directive-value]
[fixture: directives/directives-align]

Keep unclosed EOF endings and semicolons that stop a directive. Name text,
first-style whitespace and label-comment padding override generic gap collapse.
Token-internal directives remain specified failures; formatting never repairs
accepted text or data placements. [fixture: directives/directive-eof]

Input (escaped): `"agentflow-beta TB;%%{init: {}}%%A"`. [fixture:
directives/header-init-directive-touching-body]

Output
([directives/header-init-directive-touching-body-output.mmd](../tests/fixtures/agentflow/directives/header-init-directive-touching-body-output.mmd)):

```mmd
agentflow-beta TB
  %%{init: {}}%%A
```

### Default size branches

Agentflow differs from flowchart because its default comment preservation
changes above 50000 UTF-16 code units. Measure after frontmatter/directive
removal, counting CRLF as one; a surrogate pair counts as two units. [fixture:
default-size-branches/size-utf16-surrogate] At or above 50000 retain the
complete diagram text and ending. [fixture:
default-size-branches/size-preserving-to-fallback-unsafe] Below it apply
ordinary layout only when the planned printed measurement also remains strictly
below 50000; otherwise retain the complete diagram and ending. [fixture:
default-size-branches/size-below-planned-crossing] This prevents comment removal
from changing the Db, including a restored host BOM, growth from
indentation/final LF, and shrinkage from trimming. Never remove authored
comments to meet the limit. Frontmatter remains eligible for guarded YAML
formatting; configured CR/LF conversion remains shared. An escaped test string
covers the restored BOM; the corpus covers CRLF at the size boundary. [test:
agentflow: size-bom-grow-unsafe] [corpus fixture:
agentflow/comment-default-size-above-crlf] The layout plan measures recorded
spans without output parsing or site-config inference.

For example, with `tabWidth: 0`, the fixed input `size-utf16-exact-zero` has
50000 UTF-16 units and 49999 code points. Its output is identical, including its
two-space body prefix and ending; normalizing it to one space would incorrectly
use the count of Unicode characters. [fixture:
default-size-branches/size-utf16-exact-zero]

### Direction

Reuse [Direction](./flowchart.md#direction) and the
[Indentation](./flowchart.md#indentation) exception for the same reasons: TD is
observable within a container, and indentation can make a line become a
direction statement before its accessibility text is read. Keep the written
keyword, direction value, ignored text before and after it, and authored line
breaks. Mermaid chooses a direction by its ordered direction alternatives and
the last matching occurrence within that alternative; formatting does not
replace that choice with the last direction-looking word. Normalize only
ordinary gaps. [fixture: direction/direction-text] [corpus fixture:
agentflow/lex-direction-value-priority] [fixture:
direction/direction-block-directive] [fixture: direction/direction-gaps]
[fixture: direction/direction-keyword-directive] [fixture:
direction/direction-lowercase-text] [fixture:
direction/direction-lowercase-value] [fixture: direction/direction-title-column]
[fixture: direction/direction-value-directive]

Keep the source columns of non-direction lines when indentation would make
`direction` followed by whitespace and `TB`, `BT`, `RL`, `LR` or `TD` a
direction statement. Check this text after directive removal and after joining
an accessibility keyword to its next-line value; lowercase lookalikes do not
qualify. Conversely, actual direction statements retain a positive body step at
`tabWidth: 0`, so an accessibility or style prefix cannot regain column-one
priority. [fixture: direction/planned-title-direction] [fixture:
direction/planned-description-direction] [fixture:
direction/zero-title-indented] [fixture: direction/zero-description-indented]
[fixture: direction/zero-style-direction]

Input (escaped): `"agentflow-beta TB\nflow F\ndirection TD\nA\nend"`. [fixture:
direction/direction-td-change-unsafe]

Output
([direction/direction-td-change-unsafe-output.mmd](../tests/fixtures/agentflow/direction/direction-td-change-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  flow F
    direction TD
    A
  end
```

### Accessibility

Reuse [Accessibility lines](./flowchart.md#accessibility-lines) with the same
reason: among Db-equal forms, follow the sibling diagram types unless there is a
reason of this diagram's own. Agentflow has none for an ordinary accessibility
line, so C4, class, usecase and both graph types share `accTitle: value` and
`accDescr: value`. The colon touches the keyword, one ASCII space precedes the
trimmed value, and inline `%%` and `#` remain value text. A run of spaces and
tabs inside the value of an `accDescr` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of an `accTitle` stays as written, since the browser shows it as a
tooltip. [fixture: accessibility/tight-colon] [fixture:
accessibility/spaced-colon] [fixture: accessibility/value-runs-collapsed]
[fixture: accessibility/inline-percent-hash] Empty and whitespace-only values
keep `accTitle:` or `accDescr:` without a following space. [fixture:
accessibility/empty-title] [fixture: accessibility/empty-description] [fixture:
accessibility/accessibility-empty-null] [corpus fixture:
agentflow/db-acctitle-eof] [corpus fixture: agentflow/db-accdescr-eof]

Ordinary next-line values join, as Mermaid reads them. [fixture:
accessibility/next-line-values] Unlike flowchart, a comment-looking line after
the colon is itself value text; join it as such and leave the next statement
separate. [fixture: accessibility/next-line-percent-value] A directive inside
the statement declines ordinary joining and keeps the previous multiline
statement layout: continuation and directive lines stand one level deeper than
the keyword, with their text and authored line breaks retained. This reuses
flowchart's continuation rule for the same reason. [fixture:
accessibility/inline-directive-kept] [fixture:
accessibility/next-line-directive-kept] [fixture:
accessibility/title-directive-continuation] [corpus fixture:
agentflow/db-accdescr-directive-next-line] [corpus fixture:
agentflow/lex-directive-acctitle-next-line]

The same exceptions apply: non-separator `;` lines under
[Kept lines](#kept-lines) retain the accessibility text and whitespace beside
`;`, including when the semicolon is in another statement. A statement written
over several lines is joined also when it holds a `;` that separates statements:
on a line that holds no other `;`, the printer puts the statements on lines of
their own, so only the statement itself is joined. [fixture:
accessibility/semicolon-value-kept] [fixture:
accessibility/neighbour-semicolon-kept] A `;` alone does not prevent joining.
[fixture: accessibility/next-line-semicolon-joined] Direction-text lines keep
their text, line breaks and columns under [Direction](#direction), and other
documented kept-line reasons still take priority. [fixture:
accessibility/direction-text-kept] [fixture:
accessibility/next-line-direction-kept] Ordinary indentation uses the same
positive minimum at `tabWidth: 0` and the same `useTabs` step; both options keep
the exceptions. [fixture: accessibility/zero-width] [fixture:
accessibility/tabs]

CR normalization, accepted NBSP/U+2028/U+2029 in exterior gaps, internal Unicode
value characters and Unicode whitespace beside a kept `;` follow the same
flowchart rule, for the same reasons. These cases use escaped tests. [test:
graph accessibility: agentflow cr-lines] [test: graph accessibility: agentflow
unicode-gaps] [test: graph accessibility: agentflow unicode-values] [test: graph
accessibility: agentflow unicode-semicolon-kept]

Description blocks also reuse
[Accessibility lines](./flowchart.md#accessibility-lines) and
[Multi-line values](./flowchart.md#multi-line-values) with the same sibling
reason: ordinary closed blocks with no text or trivia print their interior as
`{}`, even with interior spaces or blank lines. The exterior keyword-to-brace
gap prints one space, even when originally touching, to distinguish the keyword
from its body: `accDescr {}`. [fixture:
accessibility/empty-block-touching-keyword] No text needs surrounding
whitespace, so this follows usecase's Db-equal form. [fixture:
accessibility/empty-block-tight] [fixture: accessibility/empty-block-spaced]
[fixture: accessibility/empty-block-lines] Accepted NBSP/U+2028/U+2029 interior
whitespace also disappears. [test: accessibility blocks: agentflow
empty-block-unicode] Kept lines and directive interiors retain their authored
layout. [fixture: accessibility/empty-block-semicolon-kept] [fixture:
accessibility/empty-block-directive-kept]

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: accessibility/block-tight-text] [fixture:
accessibility/block-spaced-text] [fixture: accessibility/block-padded-text]
[fixture: accessibility/block-left-padding-only] [fixture:
accessibility/block-right-padding-only] At the top level, align the body lines
of a closed description block one step inside its statement: Mermaid discards
this indentation from the accessibility description. Inside a flow or global
body, keep their columns, because the raw text also participates in membership.
Changing a global body's text can change the members of a later flow. [fixture:
accessibility/global-description-membership-kept] A closed description brace on
its own line aligns with `accDescr`, whether written at column zero or indented.
[fixture: accessibility/block-close-column-zero] [fixture:
accessibility/block-close-indented] [fixture:
accessibility/block-comment-close-column-zero] [fixture:
accessibility/block-comment-close-indented] The same empty-block and closer
rules apply with the minimum body step at `tabWidth: 0`. [fixture:
accessibility/block-zero-width] Keep unclosed block contents and EOF ending as
written, without adding a brace or newline. Unlike flowchart, comment-looking
description lines are real values; their indentation follows the same
block-context rule. Closed empty descriptions stay separate statements where the
grammar places them; Name/click placements stay IgnoredText, and style
statements with a final empty style stay with following empty description blocks
under Kept lines. An erased empty string, empty markdown string or empty call
where a statement starts is not a statement: it is rejected as
`tokenless-empty-forms`. [fixture: accessibility/accessibility-block] [fixture:
accessibility/accessibility-comment-indent-alternative] [fixture:
accessibility/accessibility-comment-is-value] [fixture:
accessibility/accessibility-empty-block] [fixture:
accessibility/accessibility-lines] [fixture:
accessibility/accessibility-open-eof]

Input (escaped):
`"agentflow-beta TB\naccTitle:Compact title\naccDescr:Compact description"`.

Output
([accessibility/tight-colon-output.mmd](../tests/fixtures/agentflow/accessibility/tight-colon-output.mmd)):

```mmd
agentflow-beta TB
  accTitle: Compact title
  accDescr: Compact description
```

Input (escaped): `"agentflow-beta TB\naccDescr {a}\nA[Block spacing]"`.

Output
([accessibility/block-tight-text-output.mmd](../tests/fixtures/agentflow/accessibility/block-tight-text-output.mmd)):

```mmd
agentflow-beta TB
  accDescr: a
  A["Block spacing"]
```

Input (escaped):
`"agentflow-beta TB\naccDescr: previous description\naccDescr { }\nA[Empty spacing]"`.

Output
([accessibility/empty-block-spaced-output.mmd](../tests/fixtures/agentflow/accessibility/empty-block-spaced-output.mmd)):

```mmd
agentflow-beta TB
  accDescr: previous description
  accDescr {}
  A["Empty spacing"]
```

Input (escaped):
`"agentflow-beta TB\naccTitle:\n%%{init: {}}%%\nTitle after directive\nA[Continuation]"`.

Output
([accessibility/title-directive-continuation-output.mmd](../tests/fixtures/agentflow/accessibility/title-directive-continuation-output.mmd)):

```mmd
agentflow-beta TB
  accTitle:
    %%{init: {}}%%
    Title after directive
  A["Continuation"]
```

### Multiline statements and values

Ordinary accessibility colon lines and closed empty description blocks without
trivia instead follow [Accessibility](#accessibility), joining their lines.
[fixture: accessibility/next-line-values] [fixture:
accessibility/empty-block-lines]

Reuse [Multi-line statements](./flowchart.md#multi-line-statements) and
[Multi-line values](./flowchart.md#multi-line-values) for the same reasons: the
author chooses statement breaks, and later value columns are characters except
for the description-body indentation described in
[Accessibility](#accessibility). Indent ordinary continuation tokens one
additional step; keep string/markdown/split text, Name, metadata, directive and
multiline click continuation columns. An extra whitespace character in a click
gap after the ids and the callback can reject (see
[Click statements](#click-statements)). Agentflow folds only line whitespace
immediately before the next LF after a closing brace; later blank LFs remain.
Keep those raw value lines, including LS/PS/VT/FF/NBSP, and never align an
opaque data closer as an accessibility closer. [fixture:
multiline-statements-and-values/brace-blank-kept] [fixture:
multiline-statements-and-values/multiline-chain] [fixture:
multiline-statements-and-values/multiline-string]

Input (escaped): `"agentflow-beta TB\nA\nclick A\ncb"`. [fixture:
multiline-statements-and-values/multiline-click]

Output
([multiline-statements-and-values/multiline-click-output.mmd](../tests/fixtures/agentflow/multiline-statements-and-values/multiline-click-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A
cb
```

### Chains and line wrapping

Reuse [Chains](./flowchart.md#chains) and
[Line wrapping](./flowchart.md#line-wrapping): author-chosen statement
boundaries stay, and `printWidth` never redistributes links. Keep long lines,
except that a data block on one line whose line is wider than `printWidth`
prints on lines under the conditions of [Metadata blocks](#metadata-blocks);
keep explicit split statements, repetitions and source order. Agentflow routing,
generated ids and completion-order containers make that order observable. Domain
shapes, numeric/prototype operands, entities, HTML and diagnostic-related
spelling remain authored even when a Db-normalized alternative exists. [fixture:
chains-and-line-wrapping/long-chain] [fixture:
chains-and-line-wrapping/order-repeated]

Input (escaped): `"agentflow-beta TB\nA[first]\nA[second]"`. [fixture:
chains-and-line-wrapping/order-sort-unsafe]

Output
([chains-and-line-wrapping/order-sort-unsafe-output.mmd](../tests/fixtures/agentflow/chains-and-line-wrapping/order-sort-unsafe-output.mmd)):

```mmd
agentflow-beta TB
  A["first"]
  A["second"]
```

### Trailing whitespace

Reuse [Style trailing whitespace](./flowchart.md#style-trailing-whitespace): the
tests compare styles without their trailing whitespace, while an all-whitespace
style still needs a written whitespace character. Remove harmless exterior and
trailing style padding; keep all-whitespace styles, including the last style
after commas (including escaped classDef commas), directives, ignored semicolons
and split empty-description groups. Extra first-style whitespace is leading
value text and stays. Name endings follow Names and headings. Label-comment
padding, strings, data, comments, directives and later value columns stay.
Forbidden class/callback/title padding remains rejected; the size guard
overrides trimming. [fixture: trailing-whitespace/trailing-comment] [fixture:
trailing-whitespace/trailing-name-dropped] [fixture:
trailing-whitespace/trailing-null-style] A `linkStyle` that ends with a
backslash keeps the whitespace after it too, as one character, as in
[flowchart](./flowchart.md#style-trailing-whitespace). [fixture:
trailing-whitespace/link-style-backslash-at-end-kept]

Input (escaped): `"agentflow-beta TB\nA   \nA-->B \t\nstyle A fill:red \t"`.
[fixture: trailing-whitespace/trailing-exterior]

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/agentflow/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
agentflow-beta TB
  A
  A --> B
  style A fill: red
```

### Line terminators

Reuse shared [Line endings](./compatibility.md#line-endings) with the same
reason: Mermaid converts CRLF and CR to LF before reading, and Prettier prints
the configured endOfLine. LS/PS are not generic newlines: keep them in
values/comments, textual style segments and open-directive boundaries. Ordinary
accepted header/operator whitespace can normalize; gaps that require one
whitespace character and the whitespace ending click-id name text retain their
own roles. NEL is not whitespace. Shared BOM/frontmatter limitations still
apply. Escaped cases below retain Unicode and control characters without putting
them literally in package fixtures.

Input `"agentflow-beta TB\r\nA[\"a\r\n b\"]\r\n"` becomes output
`"agentflow-beta TB\n  A[\"a\n b\"]\n"`. [test: agentflow: eol-crlf]

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style A fill:#F9F,stroke:#ABCDEF` is printed
`style A fill: #f9f, stroke: #abcdef`. The colors in the styles of the `style`,
`classDef`, and `linkStyle` statements of an agentflow diagram are printed so. A
color is a `#` and 3, 4, 6, or 8 hexadecimal digits that stand alone in the
value of a style; it is never shortened, and a text that is no color stays as
written (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).
[fixture: colors/colors-in-lower-case]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/agentflow/colors/colors-in-lower-case-input.mmd)):

```mmd
agentflow-beta TB
A --> B
C:::c
style A fill:#F9F,stroke:#ABCDEF
classDef c fill:#DEADBE
linkStyle 0 stroke:#FF0000
linkStyle default stroke:#ABCDEF
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/agentflow/colors/colors-in-lower-case-output.mmd)):

```mmd
agentflow-beta TB
  A --> B
  C:::c
  style A fill: #f9f, stroke: #abcdef
  classDef c fill: #deadbe
  linkStyle 0 stroke: #ff0000
  linkStyle default stroke: #abcdef
```

### Quotes

The name of a flow and of a connector in quotes is printed without them, under
the conditions of the name of a subgraph of a flowchart (see
[Quotes](./flowchart.md#quotes)), as the examples in the documentation of
mermaid.js write them, 17 and 2 times without quotes and never in quotes (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)):
`flow "My Flow"` is printed `flow My Flow`, `flow "my-team"` is printed
`flow my-team`, and `connector "Join"` is printed `connector Join`. A name that
is more than one label (`connector I "" J`) stays as written, and so does a name
that ends with `direction`, since the lexer reads `direction`, white space (a
line break too), and `TB`, `BT`, `RL`, `LR`, or `TD` as one line
(`flow "xdirection"` followed by a line `TB --> B`). [fixture:
quotes/names-next-to-a-direction-line]

The title of a connector in brackets is printed in quotes, as the examples write
the 2 titles: `connector C [Merge results]` is printed
`connector C["Merge results"]`. mermaid.js reads the title in both forms as the
same text. A title is put in quotes where it starts with a letter or a digit and
holds ASCII letters, digits, spaces, `_`, `-`, `.`, `,`, `:`, `!`, and `?`, so
that the padding inside its brackets, which the printer drops, never stands
before a quote; a title with another character, such as `[a/b]`, `[ /x/ ]`,
``[`md`]``, and `[日本語]`, stays as written. A title is put in quotes before a
comment, a `;`, or a directive, which a string does not join:
`connector C3 [T]%%{init: {}}%%` is printed `connector C3["T"]%%{init: {}}%%`. A
name that a comment follows keeps its quotes. [fixture:
quotes/names-without-quotes] [fixture: quotes/names-that-need-quotes] [fixture:
quotes/connector-titles-in-quotes] [fixture: quotes/connector-titles-as-written]
[fixture: quotes/names-and-titles-before-a-comment]

The title of a flow and the label of a shape are printed in quotes in the same
way, as the examples write the 17 titles and the 47 labels, none without quotes:
`flow F [T]` is printed `flow F["T"]`, and `A[Start]` is printed `A["Start"]`.
The label of a link is printed without quotes, as the examples write the 2
labels: `A -->|"text"| B` is printed `A -- text --> B` (see
[Link label form](./flowchart.md#link-label-form)), except that a label with a
`--` between two arrows keeps its quotes (`A -- "a--b" --> B`), since the lexer
ends the text there. The text is put in quotes under the conditions of the title
of a connector, and a label that is the first unit of its line, as after a
comment line, a directive on a line of its own, or a U+2028 or U+2029, stays as
written, since mermaid.js rejects a string there. mermaid.js reads `A["x"]` as a
string and `A[x]` as a text, and its Db holds the `labelType` `string` for the
first and `text` for the second, but it draws the same figure (see
[Labels that are drawn the same](./compatibility.md#labels-that-are-drawn-the-same)).
[fixture: quotes/flow-titles-in-quotes] [fixture: quotes/labels-in-quotes]
[fixture: quotes/labels-after-a-comment-line] [fixture:
quotes/labels-after-a-directive-line] [fixture:
quotes/edge-labels-with-two-dashes]

Input
([quotes/names-without-quotes-input.mmd](../tests/fixtures/agentflow/quotes/names-without-quotes-input.mmd)):

```mmd
agentflow-beta TB
flow "Main"
A --> B
end
flow "My Flow" [T]
C --> D
end
flow "F3"["T"]
E --> F
end
flow "F4"@{ x: 1 }
G --> H
end
connector "Join"
connector "Join2" ["Merge results"]
connector "J3"@{ x: 1 }
flow "my-team"
M --> N
end
connector "my-join"
flow Already
I --> J
end
```

Output
([quotes/names-without-quotes-output.mmd](../tests/fixtures/agentflow/quotes/names-without-quotes-output.mmd)):

```mmd
agentflow-beta TB
  flow Main
    A --> B
  end
  flow My Flow["T"]
    C --> D
  end
  flow F3["T"]
    E --> F
  end
  flow F4@{ x: 1 }
    G --> H
  end
  connector Join
  connector Join2["Merge results"]
  connector J3@{ x: 1 }
  flow my-team
    M --> N
  end
  connector my-join
  flow Already
    I --> J
  end
```

Input
([quotes/connector-titles-in-quotes-input.mmd](../tests/fixtures/agentflow/quotes/connector-titles-in-quotes-input.mmd)):

```mmd
agentflow-beta TB
connector C1 [Merge results]
connector C2 [ Padded ]
connector C3 [x-y]
connector C4 [A,b: c!]
connector C5 [1.5]
connector C6[Touching]
connector C7 ["Already"]
connector C8 [Done?]@{ x: 1 }
```

Output
([quotes/connector-titles-in-quotes-output.mmd](../tests/fixtures/agentflow/quotes/connector-titles-in-quotes-output.mmd)):

```mmd
agentflow-beta TB
  connector C1["Merge results"]
  connector C2["Padded"]
  connector C3["x-y"]
  connector C4["A,b: c!"]
  connector C5["1.5"]
  connector C6["Touching"]
  connector C7["Already"]
  connector C8["Done?"]@{ x: 1 }
```

Input
([quotes/labels-in-quotes-input.mmd](../tests/fixtures/agentflow/quotes/labels-in-quotes-input.mmd)):

```mmd
agentflow-beta TB
A[text]
B["text"]
C(Is it ready?)
D{Decision}
E[(Database v2)]
F[a/b]
G[`md`]
H -- text --> I
H -->|"text"| I
J -->|"a/b"| K
flow F1[title]
E1
end
flow F2["title"]
G1
end
```

Output
([quotes/labels-in-quotes-output.mmd](../tests/fixtures/agentflow/quotes/labels-in-quotes-output.mmd)):

```mmd
agentflow-beta TB
  A["text"]
  B["text"]
  C("Is it ready?")
  D{"Decision"}
  E[("Database v2")]
  F[a/b]
  G[`md`]
  H -- text --> I
  H -- text --> I
  J -->|"a/b"| K
  flow F1["title"]
    E1
  end
  flow F2["title"]
    G1
  end
```

### Frontmatter YAML

Reuse [Frontmatter YAML](./flowchart.md#frontmatter-yaml) and shared
[Frontmatter](./compatibility.md#frontmatter): safe YAML benefits from normal
formatting while hazardous text must retain its reading. Preserve delimiter
lines/padding; retain malformed YAML, indented delimiters, HTML-tag starts and
formatted delimiter hazards. YAML uses the shared significantIndentationWidth
minimum of one even at tabWidth zero, as do Agentflow bodies. Frontmatter
title/config is separate from accessibility and opaque metadata. Use the
specified body-only HTML reading across frontmatter; do not requote body text to
imitate raw preprocessing. [fixture:
frontmatter-yaml/frontmatter-delimiter-guard] [fixture:
frontmatter-yaml/frontmatter-html-guard] [fixture:
frontmatter-yaml/frontmatter-indented] [fixture:
frontmatter-yaml/frontmatter-yaml] [fixture:
frontmatter-yaml/frontmatter-zero-block-scalar] [fixture:
frontmatter-yaml/frontmatter-zero-width]

Input (escaped): `"---\ntitle: [\n---\nagentflow-beta TB\nA"`. [fixture:
frontmatter-yaml/frontmatter-invalid]

Output
([frontmatter-yaml/frontmatter-invalid-output.mmd](../tests/fixtures/agentflow/frontmatter-yaml/frontmatter-invalid-output.mmd)):

```mmd
---
title: [
---
agentflow-beta TB
  A
```

### Final newline

Reuse [Blank lines](./flowchart.md#blank-lines) and
[Directives](./flowchart.md#directives): ordinary accepted files, including
header-only input, end with one configured newline. Preserve EOF-reaching
directive/value endings and size-retained endings, since adding a value
character or crossing the size branch changes the reading. Whitespace required
for an empty style and comment text stay before the newline. An open directive
with trailing exterior whitespace uses the shared final-whitespace handling; an
open directive ending at EOF gains no value character. [fixture:
final-newline/final-comment] [fixture: final-newline/final-open-description]

Input (escaped): `"agentflow-beta TB\nA\n\n\n"`. [fixture:
final-newline/final-ordinary]

Output
([final-newline/final-ordinary-output.mmd](../tests/fixtures/agentflow/final-newline/final-ordinary-output.mmd)):

```mmd
agentflow-beta TB
  A
```

### Markdown fences

Reuse shared [Markdown code blocks](./compatibility.md#markdown-code-blocks): a
dedented diagram payload uses the standalone rules, while Markdown supplies
fence/list/quote indentation. Test top-level, nested-list and block-quote hosts,
options, values, directives, names and large retained payloads separately from
their dedented Db. Prettier trims final code-block line whitespace, which can
reject a final all-whitespace style; this host limitation also applies to
declined failures and does not authorize trimming standalone value text. Judge
the size branch on the dedented payload. [fixture:
markdown-fences/markdown-list-payload]

Input (escaped): `"agentflow-beta TB\nA-->B"`. [fixture:
markdown-fences/markdown-top-payload]

Output
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/agentflow/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
agentflow-beta TB
  A --> B
```

### Click statements

Reuse callback value retention from
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens) and
[Multi-line statements](./flowchart.md#multi-line-statements): whitespace before
call parentheses belongs to its name, and argument/string text is authored.
Normalize the harmless first click-keyword gap; keep the id/list/value suffix
and multiline columns, including href/call presence, targets,
punctuation/numeric/prototype ids, holes, URL/tooltip whitespace and a second
call supplying arguments. Agentflow retains each erased click/empty
description/string/markdown/call in textBeforeUrl/textBeforeTooltip with its
exact source gaps, including either side of href. It has no prefix field before
a callback name or target. The single whitespace characters required before
tooltips and targets stay written; terminal empty descriptions are following
statements. The erased prefixes are kept because the specification accepts them
and the tree holds them in textBeforeUrl/textBeforeTooltip, so dropping one
would lose written text; flowchart's rule for the reserved word `click`, which
rejects such input, does not apply to Agentflow. [fixture:
click-statements/callback-padding-unsafe] [fixture:
click-statements/tooltip-required-tab] [fixture: click-statements/url-form-kept]

A tab before a fixed link target also stays written, and directives inside a
retained click prefix keep their touching gaps. [fixture:
click-statements/target-required-tab] [fixture:
click-statements/prefix-with-directive]

The arguments of a call have no whitespace at their ends or before a `,`, and
one space after it, as in [flowchart](./flowchart.md#whitespace-between-tokens):
`click A call f(  "x" ,y )` is printed `click A call f("x", y)` (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
[fixture: click-statements/callback-arguments-spaced] A gap between the
arguments that the line rule of mermaid.js may read keeps whether it holds
whitespace: `click A call f(style:x,#b;c)` stays as written, since a space after
the `,` would change the last `;` that the rule ignores (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
[fixture: click-statements/callback-arguments-line-rule-kept] The parentheses of
a call with blank arguments touch each other, as in
[flowchart](./flowchart.md#whitespace-between-tokens): `click A call f( )` is
printed `click A call f()`, also before a tooltip or an erased prefix, since
mermaid.js reads both spellings as the same call. `f ()`, with whitespace before
the `(`, stays, because the name takes that whitespace. The whitespace after the
`)` stays written, since one more whitespace character there can reject.
[fixture: click-statements/callback-blank-parentheses-touch] [test: agentflow:
U+2028 between the parentheses of a blank callback] [test: agentflow: U+2029
between the parentheses of a blank callback] A statement whose line breaks are
all inside a string or between the parentheses of a call with arguments has its
first click-keyword gap normalized like one on a single line, and the rest stays
written: `click   A "/u" "x` and `  y"` on the next line is printed
`click A "/u" "x` and `  y"`. A line break in a gap, or between the blank
parentheses of `f(` and `)`, keeps the statement as written. [fixture:
click-statements/string-over-lines-keyword-gap] [fixture:
click-statements/callback-parentheses-over-lines]

Input (escaped): `"agentflow-beta TB\nA\nclick   A cb\n"`. [fixture:
click-statements/click-keyword-gap]

Output
([click-statements/click-keyword-gap-output.mmd](../tests/fixtures/agentflow/click-statements/click-keyword-gap-output.mmd)):

```mmd
agentflow-beta TB
  A
  click A cb
```
