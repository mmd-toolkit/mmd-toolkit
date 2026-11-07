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

[Direction](./flowchart.md#direction) supplies the same column-one header and
written-direction policy: the header is easy to find, and TD has one spelling
policy in headers and bodies. Agentflow accepts only exact lower-case
`agentflow-beta`. An absent direction stays absent, symbol directions stay
written, and next-line LR remains a vertex. Ordinary header followers move into
the body; directive attachment follows Directives. [fixture:
header/header-column] [fixture: header/header-direction-spelling] [fixture:
header/header-inline-separated] [fixture: header/header-next-line-direction]
[fixture: header/header-symbol]

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
containers/end-name-not-greedy] [fixture: containers/global-flatten-unsafe]

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
`[ x@ ]` in Agentflow). A directive at an edge of the title keeps the gap beside
it, one space where whitespace was written: `flow F[ %%{x}%% T ]` is printed
`flow F[ %%{x}%% T]`, and `flow G[ T %%{x}%% ]` is printed `flow G[T %%{x}%% ]`.
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
directive, the name ends before the directive, and the whitespace before it
becomes one space (`flow H   %%{init: {}}%%[T]` is printed
`flow H %%{init: {}}%%[T]`). [fixture:
names-and-headings/name-heading-title-beside-directive-kept] [fixture:
names-and-headings/name-heading-title-gap-run-beside-directive] [test:
agentflow: a comment and U+2028 between a flow name and its title] Between a `:`
and a `#` of a line that the line rule may read, the gap keeps whether it holds
whitespace, as in flowchart. [fixture:
names-and-headings/name-heading-title-after-colon-before-hash] A U+2028 or
U+2029 in the gap stays where it is. [test: agentflow: U+2028 between a flow
name and its title] [test: agentflow: U+2029 between a connector name and its
title]

The whitespace after the word `flow`, `connector`, or `global` is one space,
however many spaces or tabs were written: the word takes one whitespace
character, and mermaid.js trims the rest from the name. `flow   F["T"]` is
printed `flow F["T"]`, and `global` followed by spaces is printed `global`.
[fixture: names-and-headings/heading-word-gap-collapsed] A directive in the gap
keeps whether whitespace was written on each side of it, a run of whitespace
becoming one space, as under [Directives](#directives). [fixture:
names-and-headings/heading-word-gap-beside-directive-kept] This holds where the
name is a single part; a name of several parts is kept as written, as above.
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
reading. Keep that character, including a tab or LF, before a title, data,
separator or EOF; additional whitespace belongs to the next name part. Empty
strings and empty markdown strings erase no such ending character. If whitespace
already separates an erased form from later name text, it has ended the click
reading: do not take another LF after the name or add a blank line. In connector
names, text directly after an erased empty string may begin with `;`. When LF
ends that click-id text, keep it before the statement-separating LF; removing it
would merge the next statement into the name and can reject it. [fixture:
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
first-style leading whitespace even across directives, inner/comma-side style
whitespace, empty style-list items, escaped classDef commas, order and
repetition. The flowchart reason for keeping inner styles applies unchanged:
they are values; its first-style collapse does not. [fixture:
single-space-gaps/classdef-first-tab] [fixture:
single-space-gaps/linkstyle-first-spaces] [fixture:
single-space-gaps/style-directive-gap] [fixture:
single-space-gaps/style-first-spaces] [fixture:
single-space-gaps/styles-inner-gaps]

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
[Arrow spacing](./flowchart.md#arrow-spacing) with their reasons: preserve the
author's pipe/split form, since split text can contain a pipe, and make
relations readable. Pipes touch the arrow and their label; split text has one
exterior space. Print one post-pipe gap. Only sequence/failure support split
labels. Keep string/markdown kind, bare continuation, and split semicolons,
percent text and line breaks; do not invent another string or split reference
form. [fixture: edge-labels/edge-label-forms] [fixture:
edge-labels/split-pipe-content] A string between pipes keeps its text, and the
pipes touch the arrow and the quotes: `A  -->  |"x  y"|B` is printed as
`A -->|"x  y"| B`. [fixture: edge-labels/pipe-label-string-kept]

Input (escaped): `"agentflow-beta TB\nA --> |x| B"`. [fixture:
edge-labels/pipe-label-gap]

Output
([edge-labels/pipe-label-gap-output.mmd](../tests/fixtures/agentflow/edge-labels/pipe-label-gap-output.mmd)):

```mmd
agentflow-beta TB
  A -->|x| B
```

### Labels

Reuse [Label inner whitespace](./flowchart.md#label-inner-whitespace): Mermaid
discards ordinary bare exterior padding, whereas internal, quoted/markdown and
whitespace-only label text stays. Keep one leading/trailing space for slash,
backslash, dash, quote characters, and when `@` in the first word would make it
read as an edge id; put no space before slanted ?]/=] closers. Agentflow label
comments are different: their preceding spaces/tabs are label content, so
preserve that padding, the comment and its LF/continuation columns, including a
closing bracket that belongs to the comment rather than closing the shape.
Tildes remain content. Shape spellings, entities and HTML remain authored.
[fixture: labels/labels-closers] [fixture: labels/labels-leading-sensitive]
[fixture: labels/labels-leading-at-sign] [fixture: labels/labels-padding]
[fixture: labels/labels-tilde] [fixture: labels/labels-trim-sensitive-unsafe]

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
  A[text]
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
[fixture: metadata-blocks/one-line-padded] [fixture:
metadata-blocks/one-line-space-only-kept] [fixture:
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
directives, kept lines, zero-width indentation and blocks starting after the
statement's first line as written. Body margins use spaces even with `useTabs`,
while a separate closer uses spaces too, at the column of the statement.
Surrounding comments, directives, empty descriptions, blank lines and separators
follow their own rules. [fixture: metadata-blocks/inline-and-directive-kept]
[fixture: metadata-blocks/kept-body-line] [fixture:
metadata-blocks/zero-width-kept] [fixture:
metadata-blocks/tab-statement-space-body] [fixture:
metadata-blocks/surrounding-trivia] [test: data blocks: agentflow U+2029] [test:
data blocks: agentflow CRLF]

The header of a `flow` or `global` container moves its block in the same way.
[fixture: metadata-blocks/container-header]

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
supplies no separator. Keep contents, order, touching and continuation columns,
align standalone directives, and collapse only harmless gap sides. A directive
after a header separator moves into the body with its following statement,
keeping whether they touch, just as in flowchart: the Db is the same, and no
reason specific to Agentflow calls for attaching it to the header instead. A
line already kept under Kept lines stays together. [fixture:
directives/header-directive-before-body] [fixture:
directives/header-directive-touching-body] [fixture:
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
trimmed value, and internal whitespace, inline `%%` and `#` remain value text.
[fixture: accessibility/tight-colon] [fixture: accessibility/spaced-colon]
[fixture: accessibility/value-padding] [fixture:
accessibility/inline-percent-hash] Empty and whitespace-only values keep
`accTitle:` or `accDescr:` without a following space. [fixture:
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
`;`, including when the semicolon is in another statement or a next-line value.
[fixture: accessibility/semicolon-value-kept] [fixture:
accessibility/neighbour-semicolon-kept] [fixture:
accessibility/next-line-semicolon-kept] Direction-text lines keep their text,
line breaks and columns under [Direction](#direction), and other documented
kept-line reasons still take priority. [fixture:
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

For nonempty blocks on one line, the text stands between one space on each side,
as in the sibling diagrams (see
[Accessibility lines](./flowchart.md#accessibility-lines)): `{a}`, `{ a }`,
`{  a  }`, `{  a}`, and `{a  }` all become `{ a }`. [fixture:
accessibility/block-tight-text] [fixture: accessibility/block-spaced-text]
[fixture: accessibility/block-padded-text] [fixture:
accessibility/block-left-padding-only] [fixture:
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
  accDescr { a }
  A[Block spacing]
```

Input (escaped):
`"agentflow-beta TB\naccDescr: previous description\naccDescr { }\nA[Empty spacing]"`.

Output
([accessibility/empty-block-spaced-output.mmd](../tests/fixtures/agentflow/accessibility/empty-block-spaced-output.mmd)):

```mmd
agentflow-beta TB
  accDescr: previous description
  accDescr {}
  A[Empty spacing]
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
  A[Continuation]
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
boundaries stay, and printWidth never redistributes links. Keep long lines,
explicit split statements, repetitions and source order. Agentflow routing,
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
  A[first]
  A[second]
```

### Trailing whitespace

Reuse [Style trailing whitespace](./flowchart.md#style-trailing-whitespace): the
Db summary normalizes trailing style padding, while an all-whitespace style
still needs a written whitespace character. Remove harmless exterior and
trailing style padding; keep all-whitespace styles, including the last style
after commas (including escaped classDef commas), directives, ignored semicolons
and split empty-description groups. Extra first-style whitespace is leading
value text and stays. Name endings follow Names and headings. Label-comment
padding, strings, data, comments, directives and later value columns stay.
Forbidden class/callback/title padding remains rejected; the size guard
overrides trimming. [fixture: trailing-whitespace/trailing-comment] [fixture:
trailing-whitespace/trailing-name] [fixture:
trailing-whitespace/trailing-null-style]

Input (escaped): `"agentflow-beta TB\nA   \nA-->B \t\nstyle A fill:red \t"`.
[fixture: trailing-whitespace/trailing-exterior]

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/agentflow/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
agentflow-beta TB
  A
  A --> B
  style A fill:red
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

The parentheses of a call with blank arguments touch each other, as in
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
