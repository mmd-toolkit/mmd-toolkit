# Sankey

Japanese version: [sankey.ja.md](./sankey.ja.md)

Source of truth in mermaid.js:

- [`sankey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison)
- [`sankeyUtils.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyUtils.ts)
- [`sankeyDB.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts)
- the tests (`*.spec.ts`) in
  [`sankey/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey)

This document covers the diagram type `sankey`. The nodes of the tree are
defined in [ast/sankey.md](../ast/sankey.md).

## Detection

Entry 23 of [detection.md](../detection.md) selects this grammar: the text
starts with `sankey`, after whitespace, in exactly this case
([`sankeyDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDetector.ts#L5-L7)).
`Sankey` and `SANKEY` match no detector; U+FEFF before the header is whitespace.
[fixture: sankey/db-link-basic] [fixture: sankey/db-byte-order-mark-at-start]
[fixture: sankey/header-indented] [fixture: sankey/header-tab-indented]
[fixture: sankey/header-nbsp-before] [fixture: sankey/header-after-blank-lines]
[fixture: sankey/header-capitalized] [fixture: sankey/header-upper-case]

The lexer then reads the header, the keyword `sankey-beta` or the keyword
`sankey`, compared case-insensitively and not followed by a word character (see
[The record context](#the-record-context)). The two headers are the same diagram
type and give the same Db: `sankey-beta` and `sankey-BETA` are headers, while
`sankeyx` is detected and rejected, and `sankey-x`, `sankey-beta-x`, `sankeyé`,
and `sankey-betaé` are a header followed by text on its line, which is rejected,
since a letter outside ASCII is no word character and no character of a field.
[fixture: sankey/db-header-beta] [fixture: sankey/db-header-beta-upper-case]
[fixture: sankey/header-word-suffix] [fixture: sankey/header-dash-suffix]
[fixture: sankey/header-beta-suffix] [fixture: sankey/header-non-ascii-suffix]
[fixture: sankey/header-beta-non-ascii-suffix]

The header stands alone on its line: a line feed follows it right away, and at
least one record follows. A header with nothing after it, with only empty lines
or a comment line after it, also after a frontmatter, is rejected, and so is a
header followed on its line by a record, by whitespace, or by `%%`, with a space
before it or not. A directive right after the header is a directive and nothing
else, while a space before the directive stays on the header line, and the input
is rejected. A directive on a line after the header changes nothing. [fixture:
sankey/header-only] [fixture: sankey/header-without-line-feed] [fixture:
sankey/header-beta-only] [fixture: sankey/header-blank-line-only] [fixture:
sankey/header-then-comment-line-only] [fixture:
sankey/header-only-after-frontmatter] [fixture:
sankey/header-record-on-header-line] [fixture: sankey/header-trailing-spaces]
[fixture: sankey/header-trailing-tab] [fixture:
sankey/header-comment-on-header-line] [fixture: sankey/header-comment-glued]
[fixture: sankey/header-directive-glued-to-header] [fixture:
sankey/header-beta-directive-glued] [fixture:
sankey/header-directive-after-space-on-header-line] [fixture:
sankey/header-then-directive-line]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, which detection reads and passes to find the header,
and which is a comment of the diagram here, with the mark `%%`, as in every
diagram type (see [Diagram detection](../common.md#diagram-detection)); the
comment belongs to no node, and the SankeyDiagram starts at the header.
mermaid.js rejects the input in both cases, and also with a line of whitespace
only after the bare line, because its lexer reads the `%%` as a field before the
header: the known divergence
[`bare-percent-line-before-header`](#known-divergences). A comment line or a
directive on a line before the header changes nothing, and a line `# c` before
the header is the first text, so no detector matches. [fixture:
sankey/header-after-bare-percent-line] [fixture:
sankey/header-after-empty-braces-line] [fixture:
sankey/header-after-bare-percent-line-and-whitespace-line] [fixture:
sankey/header-after-comment-line] [fixture: sankey/header-after-directive-line]
[fixture: sankey/header-after-hash-line]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. This
section describes the diagram's own unit rules, item 4 of
[Reading a source](../common.md#reading-a-source).

**The end of the text.** Whitespace at the end of the diagram text, line feeds
included, is nothing: the text ends at its last character that is not
whitespace, so the `\n` that the lexer reads after the last character (see
[End of text](../common.md#end-of-text)) is not read either. A last record
without a line feed, followed by empty lines or a line of spaces, or ending with
U+3000, U+00A0, U+2028, U+2029, U+FEFF, or a tab, is accepted. A field at the
end of the text is read without that whitespace, so `a,b,` and a space at the
end of the text is a record whose value is empty, which is rejected, while the
same line before another record is a record whose value field holds a space.
[fixture: sankey/db-no-line-feed-at-end] [fixture:
sankey/db-whitespace-line-at-end] [fixture:
sankey/db-trailing-ideographic-space-at-end] [fixture:
sankey/db-trailing-nbsp-at-end] [fixture:
sankey/db-trailing-line-separator-at-end] [fixture:
sankey/db-trailing-paragraph-separator-at-end] [fixture:
sankey/db-byte-order-mark-at-end] [fixture: sankey/db-tab-at-end-of-text]
[fixture: sankey/gram-spaces-only-value-at-end-of-text] [fixture:
sankey/db-spaces-only-value]

The lexer of mermaid.js for this diagram compares letters case-insensitively
(see [Notation](../common.md#notation)): only the header has letters to compare.
A **keyword** below is a word, matched case-insensitively, that is not followed
by a word character (see [Notation](../common.md#notation)).

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the record context. A rule
may enter a context, which puts it on top of the stack, or leave the current
context, which returns to the one below it. At each position, the lexer applies
the first rule of the current context that matches there. When no rule of the
current context matches, the input is rejected; the lists below do not repeat
this.

The text may end in the record context only: a string must be closed, so
`"a,c,1`, `a,"b,1`, and `a,"b` at the end of the text are rejected. [fixture:
sankey/gram-quoted-unclosed] [fixture: sankey/gram-quoted-value-unclosed]
[fixture: sankey/gram-quoted-unclosed-at-end-of-text]

**Characters.** The units of the record context are made of the characters from
U+0020 to U+007E: the space and the printable characters of ASCII. A tab, any
character outside ASCII, and any whitespace other than the space and a line feed
is read by no rule, before a record, inside a field, between a field and a
comma, inside a string, and between records: a tab, U+00A0, U+3000, U+2028,
U+2029, U+FEFF, `é`, CJK characters, and an emoji make the input rejected
wherever they stand, after the header, at the end of a line before another
record, and between records too, but not at the end of the text (see
[The end of the text](#lexical-structure)). An entity is read as its placeholder
(see [Entities](../common.md#entities)), whose characters are outside ASCII, so
a complete entity such as `#35;` or `#amp;` makes the input rejected, also
inside a string, while `#35` without its `;` is text. [fixture:
sankey/gram-tab-in-field] [fixture: sankey/gram-tab-after-first-field] [fixture:
sankey/gram-tab-before-record] [fixture: sankey/gram-tab-before-second-field]
[fixture: sankey/gram-tab-after-value-before-record] [fixture:
sankey/gram-byte-order-mark-after-header] [fixture:
sankey/gram-byte-order-mark-before-record] [fixture:
sankey/gram-byte-order-mark-between-records] [fixture:
sankey/gram-byte-order-mark-in-field] [fixture:
sankey/gram-no-break-space-in-field] [fixture:
sankey/gram-no-break-space-before-record] [fixture:
sankey/gram-ideographic-space-in-field] [fixture:
sankey/gram-line-separator-in-field] [fixture:
sankey/gram-line-separator-before-first-record] [fixture:
sankey/gram-line-separator-between-records] [fixture:
sankey/gram-paragraph-separator-in-field] [fixture:
sankey/gram-paragraph-separator-between-records] [fixture:
sankey/gram-non-ascii] [fixture: sankey/gram-cjk] [fixture: sankey/gram-emoji]
[fixture: sankey/gram-quoted-line-separator] [fixture:
sankey/gram-quoted-non-ascii] [fixture: sankey/gram-entity-numeric] [fixture:
sankey/gram-entity-named] [fixture: sankey/gram-entity-in-quoted-field]
[fixture: sankey/gram-entity-in-quoted-value] [fixture:
sankey/db-text-reference-without-semicolon]

The attribute quotes of an HTML tag are read as `'` as in every diagram type
(see [HTML attribute quotes](../common.md#html-attribute-quotes)), so a field
`<a b="c">d` holds no `"` and is the text `<a b='c'>d`, and so is a tag with
quotes inside a string. [fixture: sankey/lex-html-tag-in-unquoted-field]
[fixture: sankey/lex-html-tag-in-quoted-field] [fixture:
sankey/db-text-html-tags]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit makes the
input rejected. The **text unit** is a `field-text`, and the **string unit** is
a `string`. The other units, the header and `,`, are no text units.

- `a,%%{init: {}}%%b,1` has the target `b`, `a,"b%%{init: {}}%%c",1` the target
  `bc`, and a directive at the start of a record, after a value, or on a line of
  its own changes nothing, as in mermaid.js. [fixture:
  sankey/db-directive-in-field] [fixture: sankey/db-directive-in-quotes]
  [fixture: sankey/db-directive-at-start-of-record] [fixture:
  sankey/db-directive-after-value] [fixture:
  sankey/db-directive-sankey-settings]
- In `san%%{init: {}}%%key` and `sankey-%%{init: {}}%%beta`, the directive lies
  inside the header keyword: the input is rejected, while mermaid.js accepts it,
  reading the two parts as one (see [Known divergences](#known-divergences)).
  [fixture: sankey/div-directive-in-header-keyword] [fixture:
  sankey/div-directive-in-beta-header-keyword]

**Trivia between units.** The trivia of [common.md](../common.md) meet the units
of this diagram as follows. A lone CR and CRLF are line terminators, read as a
line feed (see [Line terminators](../common.md#line-terminators)), also inside a
string. An unclosed directive takes the rest of the text (see
[Where a directive is](../common.md#where-a-directive-is)): `a,b,1` and a space
and `%%{init` at the end of the text is the record `a,b,1` and a space, and
before a line `c,d,2` it takes `c` as its argument, which leaves `,d,2` after
the first record, and the input is rejected. A comment line is removed with its
line feed before the lexer reads the text, also when it is indented, between
records, at the end of the text, and inside a string, where its line is no part
of the string, while a line `%%` alone and a line `# c` are fields, which have
no comma, so the input is rejected. A directive on a line of its own inside a
string leaves its line empty. [fixture: sankey/db-crlf-line-ends] [fixture:
sankey/db-lone-cr-line-ends] [fixture: sankey/db-quoted-crlf] [fixture:
sankey/db-quoted-cr] [fixture: sankey/db-directive-unclosed-at-end] [fixture:
sankey/gram-directive-unclosed-takes-next-line] [fixture:
sankey/db-comment-line] [fixture: sankey/db-comment-line-indented] [fixture:
sankey/db-comment-line-between-records] [fixture: sankey/db-comment-line-at-end]
[fixture: sankey/db-comment-line-with-blank-lines] [fixture:
sankey/db-quoted-comment-line] [fixture: sankey/gram-percent-line-alone]
[fixture: sankey/gram-hash-line-alone] [fixture:
sankey/db-quoted-directive-line]

On a line that matches the `style` rule or the `classDef` rule (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)), the last
`;` is ignored and read through, in a field and in a string: `style:#x;y,b,1`
has the source `style:#xy`, and so with the target, with `classDef` in place of
`style`, with a string `"style:#x;y"`, and on the second line of a string, and
`a;b,style:#x;y,1` keeps the first `;`. The rule is read line by line: it does
not reach a `;` on the next line, also inside a string. It needs `style` or
`classDef` as written and a `#` after the `:`, with no whitespace between them,
so `style: #x;y`, `Style:#x;y`, and `classdef:#x;y` keep their `;`, which makes
`#x;` an entity and the input rejected, and `style:x;y` keeps its `;` as text.
With two, only the last is ignored, and `#x;` before it is an entity. A `;` that
the rule ignores at the end of a field leaves the field without it. [fixture:
sankey/lex-style-line-semicolon-source] [fixture:
sankey/lex-style-line-semicolon-target] [fixture:
sankey/lex-classdef-line-semicolon] [fixture:
sankey/lex-style-line-semicolon-in-quotes] [fixture:
sankey/lex-style-line-semicolon-in-second-line-of-quotes] [fixture:
sankey/lex-style-line-last-semicolon-only] [fixture:
sankey/lex-style-line-semicolon-in-other-field] [fixture:
sankey/lex-style-line-does-not-cross-lines] [fixture:
sankey/lex-style-line-does-not-cross-lines-in-quotes] [fixture:
sankey/lex-style-line-space-after-colon] [fixture:
sankey/lex-style-upper-case-entity] [fixture:
sankey/lex-classdef-lower-case-entity] [fixture:
sankey/lex-style-line-without-hash-keeps-semicolon] [fixture:
sankey/lex-style-line-space-before-colon] [fixture:
sankey/lex-style-line-text-between-colon-and-hash] [fixture:
sankey/lex-style-line-last-semicolon-of-two] [fixture:
sankey/lex-style-line-semicolon-at-end-of-field]

### The record context

In the record context, the lexer tries these rules in order:

1. The keyword `sankey-beta`, where the text starts: a `header` unit. [fixture:
   sankey/db-header-beta]
2. The keyword `sankey`, where the text starts: a `header` unit. [fixture:
   sankey/db-link-basic]
3. One or more line feeds: a `newline` unit. [fixture:
   sankey/db-blank-lines-between]
4. `,`: a `,` unit. [fixture: sankey/db-link-basic]
5. `"`: enters the string context (see [Strings](#strings)). [fixture:
   sankey/db-quoted-fields]
6. One or more characters from U+0020 to U+007E other than `"` and `,`, as many
   as possible: a `field-text` unit. [fixture: sankey/db-text-with-spaces]

A `field-text` unit takes the spaces around a field and every printable
character of ASCII but `"` and `,`: `%%`, `#`, `;`, `'`, `&`, `<`, `>`, `/`,
`\`, `-`, and `_` are characters of it, so no comment starts inside a record,
`a %% c` is a field, and `b;` keeps its `;`. A `"` inside it, a `""` inside it,
or a `"` after spaces before or after it stands where no unit fits the grammar,
and the input is rejected, while spaces after the comma that follows a string
are the next field, as in `a,"b",  1`. After the header, the word `sankey` is a
field like any other. [fixture: sankey/db-fields-trimmed] [fixture:
sankey/db-indented-records] [fixture: sankey/db-text-punctuation] [fixture:
sankey/db-text-slashes] [fixture: sankey/db-text-semicolon-and-hash] [fixture:
sankey/db-text-semicolon-at-end-of-field] [fixture: sankey/db-text-hash-leading]
[fixture: sankey/db-text-percent-in-field] [fixture:
sankey/db-text-percent-in-target] [fixture: sankey/db-text-apostrophe] [fixture:
sankey/db-text-ampersand-and-angle] [fixture:
sankey/gram-quote-in-unquoted-field] [fixture:
sankey/gram-doubled-quote-in-unquoted-field] [fixture:
sankey/gram-quote-after-space-in-field] [fixture:
sankey/gram-space-before-opening-quote] [fixture:
sankey/gram-space-before-quoted-second-field] [fixture:
sankey/gram-space-after-closing-quote] [fixture:
sankey/gram-text-after-closing-quote] [fixture:
sankey/gram-text-before-opening-quote] [fixture:
sankey/gram-quoted-value-then-text] [fixture:
sankey/db-quoted-space-before-value] [fixture: sankey/spec-sankey-39b0ab0f]

### Strings

The string context is entered after a `"` (rule 5 of the record context). It
reads one `string` unit: one or more characters, each a character from U+0020 to
U+007E other than `"`, a `,`, a line feed, or `""`, and then a `"` that no `"`
follows, which leaves the context. The text of the string is what lies between
its quotes, `""` as written. With nothing between its quotes, `""` reads no
`string` unit and is no field, and the input is rejected (see
[Diagram and records](#diagram-and-records)). So `"a,b"` has a comma, `"a""b"` a
doubled quote, `""""` one doubled quote, and a string may hold line feeds and
lines. [fixture: sankey/db-quoted-fields] [fixture: sankey/db-quoted-comma]
[fixture: sankey/db-quoted-doubled-quote] [fixture:
sankey/db-quoted-doubled-quote-at-end] [fixture:
sankey/db-quoted-doubled-quote-at-start] [fixture: sankey/db-quoted-only-quote]
[fixture: sankey/db-quoted-four-quotes] [fixture:
sankey/db-quoted-two-quotes-at-end] [fixture: sankey/db-id-quote-and-comma]
[fixture: sankey/db-quoted-line-feed] [fixture: sankey/gram-quoted-empty]
[fixture: sankey/gram-quoted-empty-value]

### Comments

This diagram type has no diagram comments: its lexer reads `%%` and `#` as
characters of a field or a string. A comment line is removed before the lexer
reads the text (see [Trivia between units](#directives-inside-units)). [fixture:
sankey/db-text-percent-in-field] [fixture: sankey/db-text-hash-leading]
[fixture: sankey/db-comment-line]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `field-text`, stands for one unit
with that name, and text in double quotes stands for the unit named by that
text, such as `","`. The grammar is a restatement of the grammar in
[`sankey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L45-L67)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in
[ast/sankey.md](../ast/sankey.md):

| Rule                                          | Node                |
| --------------------------------------------- | ------------------- |
| `diagram`                                     | SankeyDiagram       |
| `record`                                      | SankeyLinkStatement |
| `field-text` as the first or the second field | SankeyIdentifier    |
| `field-text` as the third field               | SankeyLiteral       |
| `string`                                      | StringLiteral       |

### Diagram and records

```text
diagram = header newline record ( newline record )*
record  = field "," field "," field
field   = field-text | string
```

The diagram is the header, a `newline` unit, and one or more records, each on a
line of its own; a `newline` unit stands for one or more line feeds, so empty
lines between records, after the header, and at the end change nothing. Every
line after the header is a record: a line of a title, an accessibility
statement, a line of whitespace only between records, and a line `%%` alone are
fields without a comma, and the input is rejected. [fixture:
sankey/db-two-links] [fixture: sankey/db-blank-lines-between] [fixture:
sankey/gram-title-statement] [fixture: sankey/gram-acc-title-statement]
[fixture: sankey/gram-whitespace-line-after-header] [fixture:
sankey/gram-whitespace-line-between] [fixture: sankey/gram-percent-line-alone]

A record is exactly three fields with a `,` between each two: one or two fields,
four fields, a `,` at the end, and a line of commas only are rejected, and so is
an empty field, since a field is one unit: `,b,1`, `a,,1`, and `a,b,` at the end
of the text. A field of spaces only is a field. [fixture: sankey/db-link-basic]
[fixture: sankey/gram-one-column] [fixture: sankey/gram-two-columns] [fixture:
sankey/gram-four-columns] [fixture: sankey/gram-trailing-comma] [fixture:
sankey/gram-quoted-then-trailing-comma] [fixture: sankey/gram-commas-only]
[fixture: sankey/gram-comma-only-line] [fixture:
sankey/gram-one-field-after-record] [fixture:
sankey/gram-short-line-after-record] [fixture: sankey/gram-empty-source]
[fixture: sankey/gram-empty-target] [fixture: sankey/gram-empty-value] [fixture:
sankey/db-spaces-only-source-id] [fixture:
sankey/db-spaces-only-source-id-first-record] [fixture:
sankey/db-spaces-only-target-id] [fixture: sankey/db-spaces-only-value]

### Ids and values

The first two fields are the ids of the source and the target node, and the
third is the value of the link; every record is a link. A field without quotes
is read without the whitespace at its ends, so that a field of spaces only is a
field with an empty text, and a string is read as its text between its quotes,
`""` and line feeds as written (see [ast/sankey.md](../ast/sankey.md)). The
value may be any text: the grammar asks for no number, so `abc` and a field of
spaces only are accepted as values. How mermaid.js reads the ids, the nodes, and
the values into its Db, and the title of the frontmatter, for which this diagram
type has no statement, is in the summary of the tests package. [fixture:
sankey/db-fields-trimmed] [fixture: sankey/db-spaces-only-source-id] [fixture:
sankey/db-quoted-doubled-quote] [fixture: sankey/db-quoted-line-feed] [fixture:
sankey/db-quoted-and-unquoted-same-id] [fixture: sankey/db-value-not-a-number]
[fixture: sankey/db-spaces-only-value] [fixture: sankey/db-title-frontmatter]

### Rejections outside the grammar

None. The Db of mermaid.js throws for no input that its grammar accepts:
[`findOrCreateNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L48-L58)
and
[`addLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L40-L42)
only store their texts, and an empty id, a value that is no number, and a link
that repeats are accepted. [fixture: sankey/db-spaces-only-source-id] [fixture:
sankey/db-value-not-a-number] [fixture: sankey/db-duplicate-link]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside the header keyword makes the input rejected in this
  specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): `san%%{init: {}}%%key`
  and `sankey-%%{init: {}}%%beta`. [fixture:
  sankey/div-directive-in-header-keyword] [fixture:
  sankey/div-directive-in-beta-header-keyword]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in a field with quotes or without, makes mermaid.js hand the text
  to the C4 parser, which rejects it; here the text is a sankey diagram.
  `C4Context` is text in both. [fixture: sankey/div-c4-keyword-in-target]
  [fixture: sankey/div-c4-keyword-in-quoted-source] [fixture:
  sankey/lex-c4context-in-field]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone, a line `%%{ }%%`, which is no directive, and a line of
  whitespace only after such a line, before the header, are a comment or nothing
  here, while mermaid.js rejects the input, because its lexer reads the `%%` as
  a field before the header (see [Detection](#detection)). [fixture:
  sankey/header-after-bare-percent-line] [fixture:
  sankey/header-after-empty-braces-line] [fixture:
  sankey/header-after-bare-percent-line-and-whitespace-line]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, the field `x b="c">d` is `x b='c'>d` in
  mermaid.js, which accepts it, while here the frontmatter is not searched for
  tags, the `"` stays in a field without quotes, and the input is rejected.
  Without the frontmatter, a tag that starts in the text, as in `<a b="c">d`, is
  read in the same way by both. [fixture:
  sankey/div-html-tag-starts-in-frontmatter-field] [fixture:
  sankey/lex-html-tag-in-unquoted-field]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: sankey/div-frontmatter-invalid-yaml]

The known divergences
[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md),
[`comment-takes-character`](../known-divergences/comment-takes-character.md),
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md),
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.md),
and [`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md)
have no case in this diagram type: nothing may follow the header on its line, so
no ignored `;` lies inside a keyword; the lexer reads no comment; and an empty
string is no field in both (see [Strings](#strings)).
