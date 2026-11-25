# Eventmodeling formatting

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

Formatting rules for `eventmodeling`, following its
[syntax](../../spec/docs/diagrams/eventmodeling.md),
[authored tree](../../spec/docs/ast/eventmodeling.md) and shared
[compatibility limits](./compatibility.md).

The printer uses the shared factory, blocks, atoms and hidden-gap path. GWT uses
two range-ended child bodies without synthesized closers. Common-terminal and
data boundaries constrain the line and indentation plan before it is printed.

## Rules

### Header

Keep `eventmodeling` at column one and move an ordinary first statement to the
next line, making the header easy to find. Where a statement stands is no place
of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: [wardley](./wardley.md#header), [cynefin](./cynefin.md#header),
[architecture](./architecture.md#header), and [packet](./packet.md#header) print
the header at column one and an ordinary first statement on the next line.
Hidden forms, retained prefixes and protected lines use their shared rules: when
the header line is kept, its first statement stays on that line. This gives
diagram types the same treatment. A first common statement retains its original
connection: moving it to line start can make identifier win and reject the
input. Every version of mermaid.js that counts rejects
`eventmodeling title Heading`, `eventmodeling accTitle: Heading`, and
`eventmodeling accDescr: Description` with the statement on the next line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Its padding stays as written too (see [Common boundaries](#common-boundaries)).

[fixture: eventmodeling/header/ordinary-frame]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/header/ordinary-frame-with-native-directive]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/header/empty-header]

[fixture: eventmodeling/header/first-title-preserved]

[fixture: eventmodeling/header/title-on-header-line-kept]

[fixture: eventmodeling/header/acctitle-on-header-line-kept]

[fixture: eventmodeling/header/accdescr-on-header-line-kept]

[fixture: eventmodeling/header/header-percent]

[fixture: eventmodeling/header/header-slash-boundary]

Input (escaped): `"  eventmodeling tf 01 evt Alpha"`.

Output
([header/ordinary-frame-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
```

Input (escaped): `"eventmodeling tf 01 evt A %%{{x}}%%\n"`.

Output
([header/ordinary-frame-with-native-directive-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-with-native-directive-output.mmd)):

```mmd
eventmodeling tf 01 evt A %%{{x}}%%
```

### Indentation

Start ordinary top-level statements at column one: frames, model entities,
`data`, `note` and `gwt`. A `title` after a line break and the `}` of a block
stand at column one too, since every version that counts rejects them indented
(see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

The pinned Mermaid requires `data` and `note` block closers at column one; the
formatter aligns their headers there and keeps peer statements at the same level
to avoid suggesting a hierarchy. Reconsider this choice if the pinned Mermaid
later accepts whitespace before block closers, checking that raw body values and
rendering remain unchanged.

GWT clauses use one configured step and items two. The start of a line is no
place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#indentation) and
[state](./state.md#indentation) stand the statements of a block one level deeper
than the line that opens it, and [flowchart](./flowchart.md#indentation) does
the same for a subgraph inside a subgraph: a clause stands one step deeper than
its `gwt`, and an item one step deeper than its clause. Ordinary structural
continuation lines, including a line completing a `data` or `note` header, stand
one step deeper than their statement, as under [Long lines](#long-lines). A
safely indented block body uses one further step inside that continued header
line (see [Data blocks](#data-blocks)). Columns do not define parents, so
`tabWidth: 0` adds no spaces; `useTabs` adds one tab per step even at width
zero. The width of one level is what Prettier's `tabWidth` and `useTabs` options
say: [flowchart](./flowchart.md#indentation),
[sequence](./sequence.md#indentation), [state](./state.md#indentation),
[class](./class.md#indentation), and [er](./er.md#indentation) take a level from
them, and [wardley](./wardley.md#indentation) and
[radar](./radar.md#indentation), where columns mean nothing either, print no
space at `tabWidth: 0` and one tab per level with `useTabs`, as Prettier does
for JavaScript. Value continuations, metadata padding and hidden consumed-LF
boundaries retain their authored columns, apart from the block-body margin
adjustment in [Data blocks](#data-blocks). A `title` after
`eventmodeling tf 01 evt Alpha.%%{{native}}%%` and a line break stays at column
one, since every version of mermaid.js that counts rejects it indented by two
spaces (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe] [fixture:
eventmodeling/qualified-names/hidden-before-title-segment-keep-no-prefix-space]

[fixture: eventmodeling/indentation/mixed-top-level-blocks]

[fixture: eventmodeling/indentation/gwt-four-spaces]

[fixture: eventmodeling/indentation/body-four-spaces]

[fixture: eventmodeling/indentation/body-tabs]

[fixture: eventmodeling/indentation/zero-width]

[fixture: eventmodeling/indentation/ordinary-continuation]

[fixture: eventmodeling/indentation/zero-width-tabs]

[fixture: eventmodeling/indentation/data-declaration-column-one]

[fixture: eventmodeling/indentation/data-declaration-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-tabs]

[fixture: eventmodeling/indentation/note-column-one]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

Input (escaped): `"eventmodeling\ntf 01 evt Alpha\nrf 02 cmd Beta"`.

Output
([indentation/body-four-spaces-output.mmd](../tests/fixtures/eventmodeling/indentation/body-four-spaces-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
rf 02 cmd Beta
```

Output
([indentation/data-declaration-column-one-output.mmd](../tests/fixtures/eventmodeling/indentation/data-declaration-column-one-output.mmd)):

```mmd
eventmodeling
data AddItem01 {
  sku: 'SHIRT-M'
  quantity: 2
}
```

Output
([indentation/note-column-one-output.mmd](../tests/fixtures/eventmodeling/indentation/note-column-one-output.mmd)):

```mmd
eventmodeling
note 01 {
  explanation
}
```

### Statements one per line

Put ordinary top-level AST statements on separate lines in source order, without
adding semicolons. Where a statement stands is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [er](./er.md#statements-one-per-line),
[gantt](./gantt.md#statements-one-per-line), and
[journey](./journey.md#statements-one-per-line) print each statement on a line
of its own, where no other rule keeps it as written (a common successor and
greedy inline data, below; a line that holds a hidden form or a `;`, see
[Hidden forms](#hidden-forms) and [Semicolons](#semicolons)). The grammar needs
no visible EOL between complete units, so this does not change the Db. A common
successor keeps its connection to the preceding unit.
`eventmodeling accDescr {}  title Next` stays on one line, since every version
of mermaid.js that counts rejects `title Next` on a line of its own (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Apparent statements inside greedy inline data remain part of that single value;
a closed description can instead be followed by an ordinary new statement. In
`eventmodeling tf 01 evt Alpha {x} tf 02 evt Beta {y}`, `tf 02 evt Beta {y}`
stays in the value, since every version of mermaid.js that counts draws a
different diagram when it stands on a line of its own (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: eventmodeling/statements-one-per-line/adjacent-frame-reset-entity]
[fixture: eventmodeling/statements-one-per-line/description-followed-by-common]
[fixture:
eventmodeling/statements-one-per-line/do-not-manufacture-statement-from-greedy-data]

[fixture: eventmodeling/statements-one-per-line/frame-metadata-adjacency]

[fixture: eventmodeling/statements-one-per-line/metadata-split-unsafe]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-frame]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-common]

[fixture:
eventmodeling/statements-one-per-line/do-not-manufacture-statement-from-greedy-data]

Input (escaped):
`"eventmodeling tf 01 evt Alpha rf 02 cmd Beta entity Shop.Beta"`.

Output
([statements-one-per-line/adjacent-frame-reset-entity-output.mmd](../tests/fixtures/eventmodeling/statements-one-per-line/adjacent-frame-reset-entity-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
rf 02 cmd Beta
entity Shop.Beta
```

### Frame components

Separate the frame keyword, digit-string name, entity-type word and qualified
name by one ordinary space, including where native whitespace originally crossed
lines. This distinguishes complete components such as `01 evt`. A run of
whitespace or a line break between two components is one space for the reason
given under [Declarations and notes](#declarations-and-notes). A required
identifier exactly `title` keeps its successful boundary: an ordinary LF remains
a continuation, while padding after a hidden form's consumed LF stays exact.
Introducing padded `title` there can turn the required name into EM_TITLE.

[fixture: eventmodeling/frame-components/time-parts-glued-number-type]

[fixture: eventmodeling/frame-components/reset-all-parts]

[fixture: eventmodeling/frame-components/long-time-and-type]

[fixture: eventmodeling/frame-components/name-title-lf-protected]

[fixture: eventmodeling/frame-components/acc-identifiers-without-delimiters]

[fixture:
eventmodeling/frame-components/hidden-before-required-title-identifier-keep-zero-indentation]

[test: eventmodeling/frame-components/required-title-unicode-gap]

[corpus fixture: eventmodeling/lex-name-title-after-lf]

Input (escaped): `"eventmodeling tf 01evt Alpha"`.

Output
([frame-components/time-parts-glued-number-type-output.mmd](../tests/fixtures/eventmodeling/frame-components/time-parts-glued-number-type-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
```

### Source references

Print complete source arrows as `Name ->> 02 ->> 001`, with one ordinary space
on each side. Rule 1 gives it: the `->>` stands between two things, and Prettier
prints `x = a+b;` as `x = a + b;`, with one space on each side of the mark, as
the table of rule 1 prints `A-->B` in a flowchart as `A --> B`. Preserve every
source, its order and leading zeroes; do not reverse or resolve references.
Hidden gaps and global trivia keep their protected boundaries.

[fixture: eventmodeling/source-references/arrows-touching]

[fixture: eventmodeling/source-references/source-newlines-and-repetitions]

[fixture: eventmodeling/source-references/arrow-comment-contact]

Input (escaped): `"eventmodeling tf 01 evt Alpha->>02->>001"`.

Output
([source-references/arrows-touching-output.mmd](../tests/fixtures/eventmodeling/source-references/arrows-touching-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha ->> 02 ->> 001
```

### Data references

Use one ordinary space before a data reference and tight inner edges, `[[D]]`.
This is how Prettier prints nested brackets, with none inside. Compact ordinary
component newlines too; `[[title]]` also avoids a padded title composite. The
one space that a line break between components becomes is the form that rule 2
gives, for the reason under [Declarations and notes](#declarations-and-notes).
Preserve hidden forms and trivia in their owned gaps, and never qualify a single
reference name: a reference holds one identifier, and a dot with another segment
is rejected.

[fixture: eventmodeling/data-references/reference-padded]

[fixture: eventmodeling/data-references/reference-component-lines]

[fixture: eventmodeling/data-references/reference-title-compact-valid]

[fixture: eventmodeling/data-references/reference-title-padding-unsafe]

[fixture: eventmodeling/data-references/reference-names-acctitle-accdescr]

Input (escaped): `"eventmodeling tf 01 evt Alpha [[ \tD\t ]]"`.

Output
([data-references/reference-padded-output.mmd](../tests/fixtures/eventmodeling/data-references/reference-padded-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
```

### Type tags

Keep type-tag inner gaps tight, as in `` `json` ``, and use one ordinary space
before its body. Tight tags distinguish the annotation from its value. Retain
the presence or absence of a tag and all eight authored type words. A tag does
not ask the formatter to parse its payload as JSON or another language; hidden
forms and global trivia retain their boundaries. A comment inside a tag or right
after it stays touching where it touches, and a run of spaces and tabs before it
becomes one space, also right after the opening backtick. A run of spaces and
tabs after a comment inside the tag becomes one space too, while the gaps
between the parts of the tag itself stay tight, whichever whitespace they hold
(spaces, tabs, a no-break space, U+3000, U+2028, or U+2029). A wide space, a
U+2028, or a U+2029 (see [Comments](#comments)) before a comment inside the tag,
right after the opening backtick, after a comment inside the tag, and before and
after a comment that follows the tag also becomes one space; each of these
places has a row for a no-break space, U+3000, U+2028, and U+2029. No rule gives
that form: no other diagram type has a type tag, and the printers that
[Comments](#comments) cites print these characters before a comment differently.
The released form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: eventmodeling/type-tags/inline-tag-parts]

[fixture: eventmodeling/type-tags/block-tag-parts]

[fixture: eventmodeling/type-tags/all-inline-tags-retained]

[fixture: eventmodeling/type-tags/tag-comments-retained] [fixture:
eventmodeling/type-tags/tag-comments-spaced] [fixture:
eventmodeling/type-tags/tag-comments-spaced-after] [fixture:
eventmodeling/type-tags/tag-comments-tab-before] [fixture:
eventmodeling/type-tags/tag-comments-tab-after] [fixture:
eventmodeling/type-tags/tag-comments-before-closing-backtick-and-body] [fixture:
eventmodeling/type-tags/tag-comments-after-opening-backtick] [test: a no-break
space before a comment inside a type tag of an eventmodeling diagram] [test:
U+3000 before a comment inside a type tag of an eventmodeling diagram] [test:
U+2028 before a comment inside a type tag of an eventmodeling diagram] [test:
U+2029 before a comment inside a type tag of an eventmodeling diagram] [test: a
no-break space after a comment inside a type tag, before its next part, of an
eventmodeling diagram] [test: a no-break space after a comment inside a type
tag, before its closing backtick, of an eventmodeling diagram] [test: a no-break
space before a comment after a type tag of an eventmodeling diagram] [test: a
no-break space after a comment after a type tag of an eventmodeling diagram]
[test: a no-break space between the parts of a type tag of an eventmodeling
diagram] [test: U+3000 after a comment inside a type tag, before its next part,
of an eventmodeling diagram] [test: U+2028 after a comment inside a type tag,
before its next part, of an eventmodeling diagram] [test: U+2029 after a comment
inside a type tag, before its next part, of an eventmodeling diagram] [test:
U+3000 after a comment inside a type tag, before its closing backtick, of an
eventmodeling diagram] [test: U+2028 after a comment inside a type tag, before
its closing backtick, of an eventmodeling diagram] [test: U+2029 after a comment
inside a type tag, before its closing backtick, of an eventmodeling diagram]
[test: U+3000 before a comment after a type tag of an eventmodeling diagram]
[test: U+2028 before a comment after a type tag of an eventmodeling diagram]
[test: U+2029 before a comment after a type tag of an eventmodeling diagram]
[test: U+3000 after a comment after a type tag of an eventmodeling diagram]
[test: U+2028 after a comment after a type tag of an eventmodeling diagram]
[test: U+2029 after a comment after a type tag of an eventmodeling diagram]
[test: U+3000 between the parts of a type tag of an eventmodeling diagram]
[test: U+2028 between the parts of a type tag of an eventmodeling diagram]
[test: U+2029 between the parts of a type tag of an eventmodeling diagram]
[test: a no-break space after the opening backtick of a type tag, before a
comment, of an eventmodeling diagram] [test: U+3000 after the opening backtick
of a type tag, before a comment, of an eventmodeling diagram] [test: U+2028
after the opening backtick of a type tag, before a comment, of an eventmodeling
diagram] [test: U+2029 after the opening backtick of a type tag, before a
comment, of an eventmodeling diagram]

[fixture: eventmodeling/type-tags/tag-absent-kept-absent]

[fixture: eventmodeling/type-tags/all-block-tags-retained]

Input (escaped): `"eventmodeling tf 01 evt Alpha \u0060 \tjson \t\u0060{ x }"`.

Output
([type-tags/inline-tag-parts-output.mmd](../tests/fixtures/eventmodeling/type-tags/inline-tag-parts-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha `json` { x }
```

### Qualified names

Join ordinary gaps around qualified-name dots into `Shop.Bought`, including
ordinary component newlines and Unicode whitespace. Rule 1 gives it: the dot of
a qualified name joins two names as the dot of a member access does, and
Prettier prints a member access written with a space, a line break, a no-break
space, or U+3000 around the dot as `a.b` in JavaScript (`x = a . b;` is printed
`x = a.b;`). The dot connects the existing identifier segments rather than
starting another component. Keep each complete identifier's spelling, since the
Db holds the complete qualified name of a frame as written, and every owned
hidden/comment gap. After a hidden consumed LF, a `title` segment gains no new
padding.

[test: eventmodeling/qualified-names/qualified-padded]

[fixture: eventmodeling/qualified-names/qualified-lines]

[fixture: eventmodeling/qualified-names/dot-title-no-padding]

[fixture: eventmodeling/qualified-names/dot-title-padded-unsafe]

[fixture: eventmodeling/qualified-names/dot-native-comment]

[fixture: eventmodeling/qualified-names/custom-header-identifier]

[fixture:
eventmodeling/qualified-names/hidden-before-title-segment-keep-no-prefix-space]

Input (escaped): `"eventmodeling rf 02 cmd Shop\n.\nBuy entity Root\n.\nChild"`.

Output
([qualified-names/qualified-lines-output.mmd](../tests/fixtures/eventmodeling/qualified-names/qualified-lines-output.mmd)):

```mmd
eventmodeling
rf 02 cmd Shop.Buy
entity Root.Child
```

### Authored spellings

Retain the authored short or long frame keyword, all nine entity-type words and
every digit-string spelling. Although changing a frame keyword alias can leave
the comparison Db equal, it loses the chosen form. Entity-type aliases remain in
the Db, and `1`, `01` and `001` name different frames, so neither alias
conversion nor numeric normalization is appropriate.

[fixture: eventmodeling/authored-spellings/alias-retained]

[fixture: eventmodeling/authored-spellings/frame-aliases-db-equal]

[fixture: eventmodeling/authored-spellings/entity-type-aliases-db-different]

[fixture: eventmodeling/authored-spellings/numeric-identity-zeroes]

[fixture: eventmodeling/authored-spellings/nine-entity-types-preserved]

Input (escaped):
`"eventmodeling timeframe 001 event Alpha resetframe 02 command Beta"`.

Output
([authored-spellings/alias-retained-output.mmd](../tests/fixtures/eventmodeling/authored-spellings/alias-retained-output.mmd)):

```mmd
eventmodeling
timeframe 001 event Alpha
resetframe 02 command Beta
```

### Declarations and notes

A declaration or note header split by a comment or directive keeps the trivia
and the line completing the header one level inside its keyword, as for a GWT
header: that is the depth that rule 2 gives to the later lines of a statement
and to the comment or directive lines between them, and the line break next to
the comment or directive stays, for the reasons under [Long lines](#long-lines).
Where the data-body rules allow margin changes, put the body one further level
inside that opening line. Keep the written order, value continuations and
required hidden boundaries. The closer still stays at column one, since every
version of mermaid.js that counts rejects it indented (see
[Data blocks](#data-blocks)).

[fixture: eventmodeling/declarations-and-notes/header-completion-comments]

[fixture: eventmodeling/declarations-and-notes/header-opener-comment]

[fixture: eventmodeling/declarations-and-notes/header-directive-continuation]

[fixture: eventmodeling/declarations-and-notes/header-continuation-tabs]

[fixture: eventmodeling/declarations-and-notes/header-continuation-unsafe-body]

Output
([declarations-and-notes/header-completion-comments-output.mmd](../tests/fixtures/eventmodeling/declarations-and-notes/header-completion-comments-output.mmd)):

```mmd
eventmodeling
data
  // payload
  Cart {
    sku: SHIRT-M
}
note
  // payment note
  01 {
    Payment received
}
```

Separate declaration and note components with one ordinary space:
`entity Shop.Buy`, `data D` and `note 01`. Rule 1 names no mark for a line break
between the components of a statement, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [gantt](./gantt.md#multi-line-statements),
[journey](./journey.md#multi-line-statements), and
[quadrant](./quadrant.md#multi-line-statements) print a statement that
mermaid.js reads over several lines on one line, with one space between the
components of the statement, and none beside the dot of a qualified name (see
[Qualified names](#qualified-names)), where no other rule keeps the layout as
written (a comment between the components, which the paragraph above covers, a
slash comment that spans the line break, and a line that holds an ignored `;`).
Put a block opener on its header line after one space. Rule 1 gives it: Prettier
prints one space before the `{` that opens a block, whether it was written
touching its header or on the next line (`class A{}` and `class A`, a line
break, `{}` are both printed `class A {}` in JavaScript). Values and closing
boundaries follow the data rules. A required name `title` keeps its safe
preceding boundary, as for frames. `eventmodeling data`, a line break and
`title {` stay, since every version of mermaid.js that counts rejects
`eventmodeling data title {` on one line (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: eventmodeling/declarations-and-notes/entity-ordinary] [fixture:
eventmodeling/declarations-and-notes/entity-break-after-whitespace-and-empty-line]
[fixture: eventmodeling/declarations-and-notes/entity-slash-comment-over-lines]
[fixture: eventmodeling/semicolons/ignored-semicolon-touches-next-atom]
[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

[fixture: eventmodeling/declarations-and-notes/entity-title-lf-protected]

[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

Input (escaped): `"eventmodeling entity\tShop\n.\nBuy"`.

Output
([declarations-and-notes/entity-ordinary-output.mmd](../tests/fixtures/eventmodeling/declarations-and-notes/entity-ordinary-output.mmd)):

```mmd
eventmodeling
entity Shop.Buy
```

### Gwt clauses and items

A GWT header continued after a comment or directive uses ordinary continuation
indentation: the trivia and source-frame line stand one level inside `gwt`, as
rule 2 gives the later lines of a statement that depth (see
[Long lines](#long-lines)). Keep their written order and comment form. Clause
keywords still use one level and items two, for the reason under
[Indentation](#indentation); the source-frame line is not a new top-level
statement.

[fixture: eventmodeling/gwt-clauses-and-items/header-completion-comment]
[fixture: eventmodeling/gwt-clauses-and-items/header-directive-continuation]

A clause that follows the directive of a continued GWT header keeps the
whitespace before it as written, and a directive that follows its item on its
line stays on that line: `given evt A %%{{tail}}%%` stays on one line.

[fixture:
eventmodeling/gwt-clauses-and-items/clause-after-header-directive-with-tail-directive]

Put `gwt 99` at column one, each clause keyword one step deeper and every item
another step deeper, for the reason under [Indentation](#indentation). This
shows the authored clause/item relationship without inventing closing
punctuation. Keep required given/then, optional when, item order, repetition and
type words. Ordinary item components use one space, as
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between a keyword and what it takes (Prettier prints `return  x` as
`return x;`). Required `title` boundaries, hidden forms, trivia and protected
opening edges take precedence. `eventmodeling gwt 01 given evt`, a line break
and `title then cmd accTitle tf 02 evt Alpha` stay, since every version of
mermaid.js that counts rejects the same text with a space in place of the line
break (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: eventmodeling/gwt-clauses-and-items/given-when-then-nested] [fixture:
eventmodeling/gwt-clauses-and-items/gwt-title-identifier-keep-lf]

[fixture: eventmodeling/gwt-clauses-and-items/without-when-repeated-items]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-inline-alternative]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-identifier-keep-lf]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-clause-and-item-comments]

[test: eventmodeling/gwt-clauses-and-items/gwt-blanks-and-separators]

[fixture:
eventmodeling/gwt-clauses-and-items/gwt-title-after-hidden-keep-zero-indentation]

[corpus fixture: eventmodeling/gram-gwt-item-comment-line]

Input (escaped):
`"eventmodeling gwt 99 given evt Alpha cmd Beta when command Buy then ui Screen rmo View tf 01 evt End"`.

Output
([gwt-clauses-and-items/given-when-then-nested-output.mmd](../tests/fixtures/eventmodeling/gwt-clauses-and-items/given-when-then-nested-output.mmd)):

```mmd
eventmodeling
gwt 99
  given
    evt Alpha
    cmd Beta
  when
    command Buy
  then
    ui Screen
    rmo View
tf 01 evt End
```

### Inline data

Print each inline body from its complete source span, retaining braces or
quotes, backslashes, padding, empty forms and native-looking text. `singleQuote`
does not rewrite these terminals. The lexer takes the last matching same-line
closer: apparent later frames inside that span are data, not statements.
Trimming, requoting or splitting that text changes the raw terminal in the Db.

[fixture: eventmodeling/inline-data/inline-braces-unchanged]

[fixture: eventmodeling/inline-data/inline-quote-spelling]

[fixture: eventmodeling/inline-data/inline-empty-and-whitespace]

[fixture: eventmodeling/inline-data/inline-trimming-changes-raw-value]

[fixture: eventmodeling/inline-data/inline-requote-changes-raw-value]

[fixture: eventmodeling/inline-data/greedy-apparent-frames-kept]

[fixture: eventmodeling/inline-data/data-hidden-looking-text]

Input (escaped): `"eventmodeling tf 01 evt Alpha { \t x  }"`.

Output
([inline-data/inline-braces-unchanged-output.mmd](../tests/fixtures/eventmodeling/inline-data/inline-braces-unchanged-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha { 	 x  }
```

### Data blocks

For ordinary data and note blocks written as `{` immediately followed by LF and
closed by LF followed by `}`, align every nonblank body line to `tabWidth` ASCII
spaces (U+0020) where the conditions below permit it. The start of a line is no
place of rule 1, and rule 2 gives no margin of a body line:
[pie](./pie.md#description-blocks), [radar](./radar.md#description-blocks), and
[cynefin](./cynefin.md#description-blocks) stand the lines of a description
block one level inside their statement, `tabWidth` spaces and none at
`tabWidth: 0`, but in each of them this is a question of the list of undecided
forms (D35), so their printing is no decided form, and the released form stays
until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Use `2 * tabWidth` spaces when an ordinary header continuation remains, putting
the body one further step inside its opening line, as
[sequence](./sequence.md#indentation) and [state](./state.md#indentation) stand
the body of a block one level deeper than the line that opens it, and the
continued line is that line. An authored LF that joins into the header, or an LF
inside an inline directive, does not add this step: the step stands for a
continuation line that the printer indents, a joined LF leaves none, and the
lines of a directive stay as written. Native hidden header forms retain their
boundary columns and use the ordinary one-step body rule. Use spaces even with
`useTabs`: a tab margin gives the same Db and the same drawing in the versions
that were run, so no reason keeps the spaces, and its row is in the list (D35).
At `tabWidth: 0`, keep the body as written, since the margin there is none, and
removing the margin of a later line draws a different diagram (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count):
a later line at column one against two spaces in). A body of one line, and a
body none of whose later lines has a margin, is kept as written, which no rule
gives either (D35); removing the margin of its first line draws the same. This
does not parse the body into data fields or format it as JSON or code; authored
indentation differences are not preserved.

[fixture: eventmodeling/declarations-and-notes/header-completion-comments]

[fixture: eventmodeling/declarations-and-notes/header-directive-continuation]

[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

[fixture:
eventmodeling/declarations-and-notes/header-inline-multiline-directive]

[fixture: eventmodeling/declarations-and-notes/header-continuation-tabs]

[fixture: eventmodeling/hidden-forms/hidden-data-tag-owners]

[fixture: eventmodeling/data-blocks/body-common-margin]

[fixture: eventmodeling/data-blocks/body-overindented-first-line]

[fixture: eventmodeling/data-blocks/body-overindented-later-line]

[fixture: eventmodeling/data-blocks/body-overindented-first-note-blanks-tabs]

[fixture: eventmodeling/data-blocks/body-overindented-first-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-tabs]

[fixture: eventmodeling/data-blocks/body-zero-width]

Only the first physical body line may gain a space prefix where it had none.
Every later nonblank physical line must have at least one leading ASCII space
both before and after the change. Otherwise keep the complete body as written: a
margin on every line would add the first space to a later line, which can change
the rendered label: 11.15.0 to 12.3.0 draw different text and geometry for it
(see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A leading empty line does not make the next line the first physical line.

[fixture: eventmodeling/data-blocks/body-first-line-zero-margin]

[fixture: eventmodeling/data-blocks/body-later-zero-margin-kept] [fixture:
eventmodeling/data-blocks/body-later-zero-margin-plain-kept]

[fixture: eventmodeling/data-blocks/body-after-empty-first-row-kept]

Keep blank and whitespace-only lines, line breaks, trailing spaces and tabs, and
every character after each line's leading margin. In a `data` block that a frame
reads, they are characters of the value that the Db holds for the frame, which
the margin exception below alone changes. The closing brace stays at column one.
`eventmodeling tf 01 evt Alpha [[D]] data D {`, `x` and `}` stay, since every
version of mermaid.js that counts rejects `}` indented by two spaces (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The other diagram types would indent the `}` (see [Indentation](#indentation)).
Preserve apparent statements, text containing braces and an adjacent
closing-looking line when the block's body-present rule reads through it to a
later closer, since in a `data` block that a frame reads they are characters of
the value that the Db holds for the frame.

[fixture: eventmodeling/data-blocks/body-whitespace-kept] [fixture:
eventmodeling/data-blocks/block-closer-indent-unsafe]

[fixture: eventmodeling/data-blocks/block-empty-kept]

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]

[fixture: eventmodeling/data-blocks/later-closer-owns-apparent-text]

[fixture: eventmodeling/data-blocks/block-nested-text]

Keep the entire body as written if the opener has padding before LF, the body
contains `<`, `&` or `%%{`, or a nonblank line starts with a tab or other
whitespace after its ASCII-space prefix. HTML, entities and directive-looking
text can make indentation affect rendering. A body that holds a `;` stays as
written too: Mermaid's native entity spellings, such as `#amp;`, end in a `;`.

[fixture: eventmodeling/data-blocks/block-interior-unchanged]

[fixture: eventmodeling/data-blocks/html-line-break-indentation-kept]

[fixture: eventmodeling/data-blocks/body-entity-kept]

[fixture: eventmodeling/data-blocks/body-native-directive-kept]

[fixture: eventmodeling/data-blocks/body-leading-tab-kept]

[test: eventmodeling/data-blocks/body-leading-nbsp-kept]

[fixture: eventmodeling/data-blocks/body-style-semicolon-kept]

Mermaid accepts body indentation and includes it in the raw value. The permitted
leading-margin adjustment can therefore change raw Db values while preserving
the rendered diagram. This is an explicit formatter exception; it changes no
parser, specification or recorded Mermaid Db reading.

The renderer takes the body of a data block between the `{` and the closing `}`
and passes it to `wrapLabel` in
[`calculateTextProps`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/eventmodeling/db.ts#L358-L371),
which splits it at every space and drops the empty pieces
([`wrapLabel`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L559-L594)).
A run of spaces at the start of a line after the first therefore draws as one
space, whatever its length, and no space at all draws as none. The spaces at the
start of the first line draw as none. Both texts of each case were drawn with
mermaid.js 12.3.0 in Chromium, and the SVG, without the generated ids, and the
pixels were the same for a margin of another length on every line and for a
margin added to the first line; a margin added to a later line that had none
changed the figure, which is why such a body stays as written. The tests compare
the Db of the printed text with the margins of the bodies restored from the Db
of the written text (`eventmodelingDbForFormattingComparison` in
`tests/eventmodeling-data-margins.ts`). When the pinned mermaid.js is updated,
draw both texts of each case again before the exception stays.

[fixture: eventmodeling/final-newline/final-block-padding-kept]

Input (escaped):
`"eventmodeling\ndata AddItem01 {\n    sku: 'SHIRT-M'\n  quantity: 2\n}\n"`.

Output
([data-blocks/body-overindented-first-line-output.mmd](../tests/fixtures/eventmodeling/data-blocks/body-overindented-first-line-output.mmd)):

```mmd
eventmodeling
data AddItem01 {
  sku: 'SHIRT-M'
  quantity: 2
}
```

Input (escaped):
`"eventmodeling\ndata D {\n  sku: 'SHIRT-M'\n    quantity: 2\n  price: 10\n}\n"`.

Output
([data-blocks/body-overindented-later-line-output.mmd](../tests/fixtures/eventmodeling/data-blocks/body-overindented-later-line-output.mmd)):

```mmd
eventmodeling
data D {
  sku: 'SHIRT-M'
  quantity: 2
  price: 10
}
```

Input (escaped): `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}\n"`.

Output
([data-blocks/block-closer-indent-unsafe-output.mmd](../tests/fixtures/eventmodeling/data-blocks/block-closer-indent-unsafe-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
data D {
  x
}
```

### Data boundaries

Preserve whether block-data consumes its closing LF or stops at a whitespace
lookahead. Block-data consumes an LF that immediately follows its closer and
only looks ahead at other whitespace, so replacing the lookahead with an LF can
change the Db (see
[Eventmodeling terminals and source boundaries](./compatibility.md#eventmodeling-terminals-and-source-boundaries)).
Keep closing horizontal padding before moving an ordinary successor to a new
line: the padding stands between the closer and the LF, and trimming it would
leave the LF to the block, while the successor goes to a line of its own as
under [Statements one per line](#statements-one-per-line). LS/PS lookahead
remains outside the terminal rather than becoming LF, for the same reason: an LF
there would be consumed by the block. Before a common successor, retain the
first LF or its absence, the complete leading run and its connection to the
prior unit, even at width zero: adding a spare LF, removing indentation or
trimming closing padding can change the Db or reject the text. EOF's logical LF
may become one explicit final LF: mermaid.js appends a LF to the text before it
reads it (see [End of text](../../spec/docs/common.md#end-of-text)), so the
explicit LF is a character that it already reads, and Prettier ends a file with
one line break (see [Final newline](#final-newline)).

[fixture: eventmodeling/data-boundaries/block-eof-logical-lf-kept]

[fixture: eventmodeling/data-boundaries/block-closer-space-retained]

[fixture: eventmodeling/data-boundaries/same-line-block-successor]

[fixture: eventmodeling/data-boundaries/lf-consuming-before-acctitle]

[fixture:
eventmodeling/data-boundaries/lf-consuming-before-accdescr-preserve-one-space]

[fixture: eventmodeling/data-boundaries/note-consumed-lf]

[fixture:
eventmodeling/data-boundaries/after-block-lf-tabwidth-zero-must-keep-metadata-padding]

[fixture:
eventmodeling/data-boundaries/after-block-same-line-tab-metadata-boundary-kept]

Input (escaped): `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}"`.

Output
([data-boundaries/block-eof-logical-lf-kept-output.mmd](../tests/fixtures/eventmodeling/data-boundaries/block-eof-logical-lf-kept-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha [[D]]
data D {
  x
}
```

### Common boundaries

Keep a common statement's complete source, the immediately preceding ASCII
space/tab run and its connection to the unit that lets the lexer read it.
Preserve the entire intervening source interval across global directives,
selected semicolons; these removals decide which padding joins. Do not
reconstruct a run after losing it. The shared accessibility layout is
deliberately bypassed here: EM terminals retain keyword, delimiter and leading
padding as values, unlike the converted common terminals of other diagrams. Even
when accTitle's setter strips some leading padding, retaining all common forms
avoids inconsistent exceptions.

[fixture:
eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps]

[fixture:
eventmodeling/common-boundaries/acctitle-prefix-leading-stripped-by-setter]

[fixture: eventmodeling/common-boundaries/accdescr-prefix-significant]

[fixture:
eventmodeling/common-boundaries/common-after-empty-description-keep-adjacency]

[fixture:
eventmodeling/common-boundaries/native-comment-separates-common-requires-following-padding]

[fixture:
eventmodeling/common-boundaries/native-comment-common-padding-change-db]

Input (escaped): `"eventmodeling tf 01 evt Alpha \t%%{init:{}}%%  accDescr: D"`.

Output
([common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd](../tests/fixtures/eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha 	%%{init:{}}%%  accDescr: D
```

### Title

Keep title padding, its one separator, payload and trailing text as written,
including quotes, empty titles and overwritten occurrences. Do not take a value
from the next physical line. The comparison summary omits diagram titles, so an
equal comparison Db would not justify rewriting the public EM_TITLE terminal.

[fixture: eventmodeling/title/title-exact-padding-and-quotes]

On the header line and on the line of a frame statement, the text of a `title`,
an `accTitle:`, or an `accDescr:` ends before the first `%%`, which starts a
comment: `title T  %% c` has the value `T  `. A `//` or a `/* */` after the text
is part of the text: `title T  // c` has the value `T  // c`. So the run of
spaces and tabs before the mark belongs to the value, and so does a wide space
(see [Comments](#comments)), a U+2028, or a U+2029 there, which stays as
written.

The run stays as written in an `accTitle:`, with a `%%`, a `//`, or a `/* */`
after it: collapsing it changes the Db and the text that mermaid.js draws in
every version that counts. The released version keeps `title T  %% c`,
`title T  // c`, `title T  /* c */`, `accDescr: T  %% c`, `accDescr: T  // c`,
and `accDescr: T  /* c */` as written.

[fixture: eventmodeling/title/header-line-title-run-before-percent-comment-kept]
[fixture:
eventmodeling/title/header-line-acctitle-run-before-percent-comment-kept]
[fixture:
eventmodeling/title/header-line-accdescr-run-before-percent-comment-kept]
[fixture: eventmodeling/title/frame-line-titles-run-before-percent-comment-kept]
[fixture: eventmodeling/title/header-line-title-slash-comment-mark-is-text]
[fixture: eventmodeling/title/header-line-accdescr-block-comment-mark-is-text]
[fixture: eventmodeling/title/frame-line-titles-slash-comment-marks-are-text]
[test: a no-break space before a comment mark after the text of the title of the
header line of an eventmodeling diagram stays as written] [test: U+3000 before a
comment mark after the text of the accTitle of the header line of an
eventmodeling diagram stays as written] [test: U+2028 before a comment mark
after the text of the accDescr of the header line of an eventmodeling diagram
stays as written] [test: U+2003 before a comment mark after the text of the
title of a frame statement of an eventmodeling diagram stays as written] [test:
a no-break space before a comment mark after the text of the accTitle of a frame
statement of an eventmodeling diagram stays as written] [test: U+3000 before a
comment mark after the text of the accDescr of a frame statement of an
eventmodeling diagram stays as written] [test: a no-break space before a `//`
comment mark after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: a no-break space before a `/* */` comment mark
after the text of the title of the header line of an eventmodeling diagram stays
as written] [test: U+000B before a `%%` comment after the text of the title of
the header line of an eventmodeling diagram stays as written] [test: U+000C
before a `%%` comment after the text of the title of the header line of an
eventmodeling diagram stays as written] [test: a no-break space before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: U+1680 before a `%%` comment after the text of
the title of the header line of an eventmodeling diagram stays as written]
[test: U+2000 before a `%%` comment after the text of the title of the header
line of an eventmodeling diagram stays as written] [test: U+2001 before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: U+2002 before a `%%` comment after the text of
the title of the header line of an eventmodeling diagram stays as written]
[test: U+2003 before a `%%` comment after the text of the title of the header
line of an eventmodeling diagram stays as written] [test: U+2004 before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: U+2005 before a `%%` comment after the text of
the title of the header line of an eventmodeling diagram stays as written]
[test: U+2006 before a `%%` comment after the text of the title of the header
line of an eventmodeling diagram stays as written] [test: U+2007 before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: U+2008 before a `%%` comment after the text of
the title of the header line of an eventmodeling diagram stays as written]
[test: U+2009 before a `%%` comment after the text of the title of the header
line of an eventmodeling diagram stays as written] [test: U+200A before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: U+202F before a `%%` comment after the text of
the title of the header line of an eventmodeling diagram stays as written]
[test: U+205F before a `%%` comment after the text of the title of the header
line of an eventmodeling diagram stays as written] [test: U+3000 before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written] [test: U+FEFF before a `%%` comment after the text of
the title of the header line of an eventmodeling diagram stays as written]
[test: U+2028 before a `%%` comment after the text of the title of the header
line of an eventmodeling diagram stays as written] [test: U+2029 before a `%%`
comment after the text of the title of the header line of an eventmodeling
diagram stays as written]

[fixture: eventmodeling/title/title-normalized-invisible-to-comparison-db]

[fixture: eventmodeling/title/title-empty-remains]

[fixture: eventmodeling/title/overwritten-occurrences]

Input (escaped): `"eventmodeling title\ntf 01 evt Alpha"`.

Output
([title/title-empty-remains-output.mmd](../tests/fixtures/eventmodeling/title/title-empty-remains-output.mmd)):

```mmd
eventmodeling title
tf 01 evt Alpha
```

### Accessibility lines

Keep accessibility line forms as written: leading padding, the keyword/colon
gap, colon-side and trailing padding, empty payloads, quotes and brace-looking
text. EM_ACC_TITLE and EM_ACC_DESCR include some of these parts in their values:
the Db of the pinned version has another accDescr for
`eventmodeling   accDescr: A` than for `eventmodeling accDescr: A`, and the
versions that were run draw both alike, so that padding stays as a part of the
value. The padding between the header and an `accTitle` is no part of the Db
(the setter strips leading whitespace) and the versions that were run draw both
forms alike, so it stays without a reason, and its row is in the list (D18). The
padding after the colon and at the end of an `accTitle` or `accDescr` line is
part of the value too: the versions that were run draw other accessibility text,
in the `<title>` or the `<desc>` of the SVG, with and without it, so it stays.
For the `accTitle` line with a space and a tab before `:`, that gap stays, since
every version of mermaid.js that counts draws different accessibility text when
the gap is removed (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
An empty payload is still a nonempty terminal; the colon form is not converted
into a description block. LS/PS inside line values remain content.

[fixture: eventmodeling/accessibility-lines/accessibility-lines-exact]

[fixture: eventmodeling/accessibility-lines/accessibility-shared-trim-changes]

[fixture:
eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string]

[fixture: eventmodeling/accessibility-lines/colon-braces-remain-text]

[test: eventmodeling/accessibility-lines/line-value-ls-ps-preserved]

[corpus fixture: eventmodeling/common-repeat-empty]

Input (escaped): `"eventmodeling accTitle: First\ntf 01 evt Alpha accTitle:"`.

Output
([accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd](../tests/fixtures/eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd)):

```mmd
eventmodeling accTitle: First
tf 01 evt Alpha accTitle:
```

### Description blocks

Keep the complete description block and its leading run, including opener
newlines, whitespace-only interiors and closing columns. Empty, whitespace-only
and removal-only interiors remain distinct authored forms. The Db of the pinned
version holds the block as written (`accDescr { }` and `accDescr {}`, and
`accDescr`, a line break, and `{ Details }` against `accDescr { Details }`, have
different accDescr values), so the whitespace-only interior and the opener
newline stay. The closing column is no part of the Db and the versions that were
run draw both forms alike, so it stays without a reason, and its row is in the
list (D34). This is the single selection point that bypasses shared
`layoutDescriptionBlock`: its ordinary `{}` compaction and closer alignment
would rewrite an EM_ACC_DESCR value. No diagram-local empty-block normalization
replaces it. For `accDescr {` followed by a space, a tab, LF and `  }`, that
whitespace stays, since every version of mermaid.js that counts draws different
accessibility text for `accDescr {}`, the compact form used for whitespace-only
descriptions in flowchart and class diagrams (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture:
eventmodeling/description-blocks/description-whitespace-literal-retained]

[fixture: eventmodeling/description-blocks/description-opener-newline-unchanged]

[fixture:
eventmodeling/description-blocks/description-closer-column-normalized-by-setter]

[fixture: eventmodeling/description-blocks/description-slash-yaml-are-content]

[corpus fixture: eventmodeling/gram-description-block-empty-after-removal]

[corpus fixture: eventmodeling/common-description-repeat]

Input (escaped): `"eventmodeling accDescr\n\n{ Details }"`.

Output
([description-blocks/description-opener-newline-unchanged-output.mmd](../tests/fixtures/eventmodeling/description-blocks/description-opener-newline-unchanged-output.mmd)):

```mmd
eventmodeling accDescr

{ Details }
```

### Hidden forms

Print each IgnoredText once from its source range at its AST owner. Keep
pre-header/body forms, required and optional named gaps, qualified-name tails,
tags and GWT clause/item gaps. Do not parse retained YAML or native DIRECTIVE as
configuration. The shared hidden path preserves internal columns, consumed LF
and closing lookahead padding; ordinary body openers align with their body. The
start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [radar](./radar.md#hidden-forms) indents the ordinary body openers,
and [pie](./pie.md#indentation) and [packet](./packet.md#indentation) stand a
standalone directive one step below the header, which a hidden directive on a
line of its own follows in each. Required opening gaps and common successors
keep their authored boundaries. `eventmodeling`, `%%{{x}}%%` and ` accDescr: D`
on lines of their own stay, with one space before `accDescr`, since every
version of mermaid.js that counts rejects the line without that space (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A fallback percent comment stays a comment.

Forms at authored body boundaries keep their line through GWT clause and item
openings too. The header and nested bodies share that decision so moving an item
cannot remove an enclosing opening's protection on the next formatting.

A hidden form that follows the `}` of a description block over several lines on
its line stays on that line: `eventmodeling accDescr {A`, a line break, and
`B} %%{{native}}%%` stay as they are, where the form went to a line of its own
before.

[fixture:
eventmodeling/hidden-forms/native-after-description-block-end-stays-on-its-line]
[fixture: eventmodeling/hidden-forms/header-inline-gwt-item-directive]

[fixture: eventmodeling/hidden-forms/header-inline-gwt-item-yaml]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/hidden-forms/hidden-frame-required-gaps]

[fixture: eventmodeling/hidden-forms/hidden-optional-owners]

[fixture: eventmodeling/hidden-forms/hidden-dot-owners]

[fixture: eventmodeling/hidden-forms/hidden-data-tag-owners]

[fixture: eventmodeling/hidden-forms/hidden-gwt-clause-item-owners]

[fixture:
eventmodeling/hidden-forms/hidden-next-common-keep-consumed-lf-padding]

[fixture: eventmodeling/hidden-forms/yaml-next-common-keep-consumed-lf-padding]

[fixture: eventmodeling/hidden-forms/native-later-qualifying-close-retained]

[fixture: eventmodeling/hidden-forms/fallback-percent-comment-remains-comment]

[fixture: eventmodeling/hidden-forms/adjacent-yaml-closer-source-whole]

[fixture: eventmodeling/hidden-forms/native-directive-closer-padding-retained]

[fixture: eventmodeling/hidden-forms/no-spare-lf-required-before-ordinary-frame]

[fixture: eventmodeling/hidden-forms/reference-internal-hidden-owners]

[fixture: eventmodeling/hidden-forms/inline-tag-hidden-owners]

[fixture: eventmodeling/hidden-forms/gwt-required-source-and-given-hidden-gaps]

[corpus fixture: eventmodeling/detect-real-retained-secondscan]

Input (escaped): `"eventmodeling tf 01 evt Alpha ---\nx\n---\ntf 02 evt Beta"`.

Output
([hidden-forms/body-hidden-yaml-no-visible-eol-needed-output.mmd](../tests/fixtures/eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha ---
x
---
tf 02 evt Beta
```

### Comments

Align ordinary standalone comments with their owning body; between GWT items
this is item depth. The start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [flowchart](./flowchart.md#comments),
[sequence](./sequence.md#comments) stand a comment line at the level of the
statements around it, and [journey](./journey.md#comments),
[timeline](./timeline.md#comments), [block](./block.md#comments),
[quadrant](./quadrant.md#comments), and [gantt](./gantt.md#comments) at the
level of the statement after it, which is the same level in the flat body of an
eventmodeling diagram. Within a printed line, a comment that touches stays
touching, and a run of spaces and tabs before it becomes one space, except in
the title, the accTitle, and the accDescr of the header line and of a frame
statement, where the run before a comment mark after the text belongs to the
value (see [Title](#title)). Rule 1 names no mark before a comment, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#comments) after a message and
[journey](./journey.md#comments) and [timeline](./timeline.md#comments) after
their header print a comment in the same way, where no other rule keeps the
whitespace as written; each of them names those cases in its own sections or in
[A comment right after a character](./compatibility.md#a-comment-right-after-a-character)
(whitespace that the Db holds, as after a `section` or a period, and whitespace
that changes what mermaid.js reads). A wide space, a U+2028, or a U+2029 before
a comment becomes one space, except in the title, the accTitle, and the accDescr
of the header line and of a frame statement, where it belongs to the value and
stays as written (see [Title](#title)). A wide space is one of U+000B, U+000C,
U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF; each of
them has a row after a frame statement at the end of the text, and a no-break
space, U+3000, U+2028, and U+2029 have a row at each of the other places: where
a statement follows the comment, and after the header line, a GWT header, a GWT
item, a clause keyword, a data declaration, a note declaration, an entity
declaration, a data reference, an inline body, a source reference, and the
closing brace of a block. mermaid.js rejects U+0085, U+180E, and U+200B before a
comment after a frame statement at the end of the text with a lexer error, so
the parser rejects them there too. The printers above print these characters
otherwise: sequence keeps a no-break space or U+3000 after a message as written,
and journey and timeline print them after their header as one space; before
U+2028 or U+2029, sequence, journey, and timeline keep the line as written where
a statement follows the comment and put the comment on a line of its own where
the text ends. So no rule gives the form of these characters, and the form that
the released version prints, one space, stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
When units split into separate lines, attach intervening inline comments to the
following unit, in the same direction as directives. Use this shared placement
so the same comments are treated alike across diagram types. Keep marks,
contents, trailing padding and block-comment continuation columns. Native `//`
and `%%` run through LS/PS to physical LF. A `%%` comment line inside a data
block, a note, an `accDescr` block, a slash block comment or a hidden form is
part of that text. Its columns stay written except for the block-body margin
adjustment in [Data blocks](#data-blocks), since in a `data` block that a frame
reads the Db holds them as a part of the value. Boundaries needed for metadata
or a required `title` take precedence. Slash comments are not moved before the
header, where detection would reject them. A comment line before the header
stands at column one. The start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [journey](./journey.md#comments),
[timeline](./timeline.md#comments), and [c4](./c4.md#comments) print it so.

[test: an em space before a `//` comment after a statement of an eventmodeling
diagram] [test: a sequence diagram keeps U+2029 before a comment that a
statement follows as written] [test: a sequence diagram puts a comment after
U+2028 at the end of the text on a line of its own] [test: a timeline keeps
U+2029 before a comment after its header that a statement follows as written]
[test: a timeline puts a comment after its header and U+2028 at the end of the
text on a line of its own] [test: a user journey keeps U+2029 before a comment
after its header that a statement follows as written] [test: a user journey puts
a comment after its header and U+2028 at the end of the text on a line of its
own] [test: a user journey prints a no-break space before a comment after its
header as one space] [test: a timeline prints U+3000 before a comment after its
header as one space] [test: a user journey prints a run before a comment after
its title as one space] [test: a timeline prints a run before a comment after
its title as one space] [test: a sequence diagram prints a run before a comment
after its title as one space] [fixture:
eventmodeling/comments/inline-gap-run-and-touching] [fixture:
eventmodeling/comments/standalone-native-comments] [test: a no-break space
before a `%%` comment after a statement of an eventmodeling diagram] [test:
U+3000 before a `//` comment after a statement of an eventmodeling diagram]
[test: U+2028 before a slash comment after a statement of an eventmodeling
diagram] [test: U+2029 before a `%%` comment after a statement of an
eventmodeling diagram] [test: a no-break space before a comment that a statement
follows, after a statement of an eventmodeling diagram] [test: U+2028 before a
comment that a statement follows, after a statement of an eventmodeling diagram]
[test: U+2029 before a comment that a statement follows, after a statement of an
eventmodeling diagram] [test: U+3000 before a comment that a statement follows,
after a statement of an eventmodeling diagram] [test: U+000B before a comment
after a statement of an eventmodeling diagram] [test: U+000C before a comment
after a statement of an eventmodeling diagram] [test: U+1680 before a comment
after a statement of an eventmodeling diagram] [test: U+2000 before a comment
after a statement of an eventmodeling diagram] [test: U+2001 before a comment
after a statement of an eventmodeling diagram] [test: U+2002 before a comment
after a statement of an eventmodeling diagram] [test: U+2003 before a comment
after a statement of an eventmodeling diagram] [test: U+2004 before a comment
after a statement of an eventmodeling diagram] [test: U+2005 before a comment
after a statement of an eventmodeling diagram] [test: U+2006 before a comment
after a statement of an eventmodeling diagram] [test: U+2007 before a comment
after a statement of an eventmodeling diagram] [test: U+2008 before a comment
after a statement of an eventmodeling diagram] [test: U+2009 before a comment
after a statement of an eventmodeling diagram] [test: U+200A before a comment
after a statement of an eventmodeling diagram] [test: U+202F before a comment
after a statement of an eventmodeling diagram] [test: U+205F before a comment
after a statement of an eventmodeling diagram] [test: U+FEFF before a comment
after a statement of an eventmodeling diagram] [test: a no-break space before a
comment after an entity declaration of an eventmodeling diagram] [test: U+3000
before a comment after an entity declaration of an eventmodeling diagram] [test:
U+2028 before a comment after an entity declaration of an eventmodeling diagram]
[test: U+2029 before a comment after an entity declaration of an eventmodeling
diagram] [test: a no-break space before a comment after a clause keyword of an
eventmodeling diagram] [test: U+3000 before a comment after a clause keyword of
an eventmodeling diagram] [test: U+2028 before a comment after a clause keyword
of an eventmodeling diagram] [test: U+2029 before a comment after a clause
keyword of an eventmodeling diagram] [test: a no-break space before a comment
after the closing brace of a block of an eventmodeling diagram] [test: U+3000
before a comment after the closing brace of a block of an eventmodeling diagram]
[test: U+2028 before a comment after the closing brace of a block of an
eventmodeling diagram] [test: U+2029 before a comment after the closing brace of
a block of an eventmodeling diagram] [test: a no-break space before a comment
after the header of an eventmodeling diagram] [test: U+3000 before a comment
after the header of an eventmodeling diagram] [test: U+2028 before a comment
after the header of an eventmodeling diagram] [test: U+2029 before a comment
after the header of an eventmodeling diagram] [test: a no-break space before a
comment after a GWT header of an eventmodeling diagram] [test: U+3000 before a
comment after a GWT header of an eventmodeling diagram] [test: U+2028 before a
comment after a GWT header of an eventmodeling diagram] [test: U+2029 before a
comment after a GWT header of an eventmodeling diagram] [test: a no-break space
before a comment after a GWT item of an eventmodeling diagram] [test: U+3000
before a comment after a GWT item of an eventmodeling diagram] [test: U+2028
before a comment after a GWT item of an eventmodeling diagram] [test: U+2029
before a comment after a GWT item of an eventmodeling diagram] [test: a no-break
space before a comment after a data declaration of an eventmodeling diagram]
[test: U+3000 before a comment after a data declaration of an eventmodeling
diagram] [test: U+2028 before a comment after a data declaration of an
eventmodeling diagram] [test: U+2029 before a comment after a data declaration
of an eventmodeling diagram] [test: a no-break space before a comment after a
note declaration of an eventmodeling diagram] [test: U+3000 before a comment
after a note declaration of an eventmodeling diagram] [test: U+2028 before a
comment after a note declaration of an eventmodeling diagram] [test: U+2029
before a comment after a note declaration of an eventmodeling diagram] [test: a
no-break space before a comment after a data reference of an eventmodeling
diagram] [test: U+3000 before a comment after a data reference of an
eventmodeling diagram] [test: U+2028 before a comment after a data reference of
an eventmodeling diagram] [test: U+2029 before a comment after a data reference
of an eventmodeling diagram] [test: a no-break space before a comment after an
inline body of an eventmodeling diagram] [test: U+3000 before a comment after an
inline body of an eventmodeling diagram] [test: U+2028 before a comment after an
inline body of an eventmodeling diagram] [test: U+2029 before a comment after an
inline body of an eventmodeling diagram] [test: a no-break space before a
comment after a source reference of an eventmodeling diagram] [test: U+3000
before a comment after a source reference of an eventmodeling diagram] [test:
U+2028 before a comment after a source reference of an eventmodeling diagram]
[test: U+2029 before a comment after a source reference of an eventmodeling
diagram] [test: a no-break space before a comment after a message of a sequence
diagram] [test: U+3000 before a comment after a message of a sequence diagram]
[test: U+2028 before a comment that a statement follows, after a message of a
sequence diagram] [test: U+2029 before a comment at the end of the text, after a
message of a sequence diagram] [test: a no-break space before a comment after
the header of a timeline] [test: U+2028 before a comment that a statement
follows, after the header of a timeline] [test: U+2029 before a comment at the
end of the text, after the header of a timeline] [test: U+3000 before a comment
after the header of a user journey] [test: U+2028 before a comment that a
statement follows, after the header of a user journey] [test: U+2029 before a
comment at the end of the text, after the header of a user journey]

[fixture: eventmodeling/comments/inline-comments-keep-contact]

[fixture: eventmodeling/comments/native-percent-and-bare-percent]

[test: eventmodeling/comments/native-line-comment-ls-stays-content]

[fixture: eventmodeling/comments/slash-comment-before-title-identifier]

[fixture: eventmodeling/comments/do-not-move-slash-comment-before-header]

[fixture: eventmodeling/comments/comment-line-before-header-indented] [fixture:
eventmodeling/comments/comment-line-before-header-tab] [fixture:
eventmodeling/comments/comment-lines-before-header-several] [fixture:
eventmodeling/comments/comment-line-before-header-after-frontmatter]

[test: eventmodeling/comments/comment-after-ls-gap-ends-at-lf]

[fixture: eventmodeling/comments/comment-line-inside-data-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-note-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-accdescr-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-slash-block-comment-kept]

[fixture: eventmodeling/comments/comment-line-inside-hidden-yaml-kept]

[corpus fixture: eventmodeling/comment-line-directive-in-data]

[corpus fixture: eventmodeling/comment-line-ignored-semicolon-in-data]

[corpus fixture: eventmodeling/comment-line-entity-in-data]

[corpus fixture: eventmodeling/comment-line-line-separator]

[corpus fixture: eventmodeling/comment-line-paragraph-separator]

[corpus fixture: eventmodeling/comment-line-directive]

[test: eventmodeling/comments/ps-native-line-comment-remains-owned]

[fixture: eventmodeling/comments/mixed-directive-order]

[fixture: eventmodeling/comments/split-statements-block]

[fixture: eventmodeling/comments/inline-percent-before-next-statement]

Input (escaped): `"eventmodeling\ntf 01 evt A /*c*/ tf 02 evt B\n"`.

Output
([comments/split-statements-block-output.mmd](../tests/fixtures/eventmodeling/comments/split-statements-block-output.mmd)):

```mmd
eventmodeling
tf 01 evt A
/*c*/ tf 02 evt B
```

### Default size branches

Eventmodeling differs from flowchart because its Db keeps comment lines, and
removes them when the source is longer than `maxTextSize`, 50000 UTF-16 code
units by default; agentflow has the same limit (see
[Default size branches](./agentflow.md#default-size-branches)). Measure after
the frontmatter, the whitespace-only lines that follow it and the directives are
removed, counting CRLF as one unit and a surrogate pair as two.

[fixture: default-size-branches/size-frontmatter-not-counted] [fixture:
default-size-branches/size-frontmatter-trivia-not-counted] [fixture:
default-size-branches/size-directive-not-counted] [fixture:
default-size-branches/size-utf16-surrogate]

At or above 50000 retain the complete diagram text and its ending.

[fixture: default-size-branches/size-preserving-to-fallback-unsafe] [fixture:
default-size-branches/size-at-limit-indented-comment]

Below it apply ordinary layout only when the planned printed measurement also
stays strictly below 50000; otherwise retain the complete diagram and its
ending.

[fixture: default-size-branches/size-below-planned-crossing] [fixture:
default-size-branches/size-below-planned-crossing-indented-comment] [fixture:
default-size-branches/size-below-planned-fits-indented-comment]

This keeps indentation or the final line break from moving the text across the
limit, where the comment lines in a value would be removed and the Db would
change. At 50000 units, and at 49999, indenting the first line of a data body
whose later lines, a comment line included, stand at least one space in makes
12.3.0 draw different text, structure and geometry (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The boundary itself is covered by the corpus, also with CRLF, an inline
directive and frontmatter.

[corpus fixture: eventmodeling/comment-default-size-equal] [corpus fixture:
eventmodeling/comment-default-size-above] [corpus fixture:
eventmodeling/comment-default-size-equal-crlf] [corpus fixture:
eventmodeling/comment-default-size-above-crlf] [corpus fixture:
eventmodeling/comment-default-size-equal-inline-directive] [corpus fixture:
eventmodeling/comment-default-size-above-inline-directive] [corpus fixture:
eventmodeling/comment-default-size-equal-frontmatter] [corpus fixture:
eventmodeling/comment-default-size-above-frontmatter] [corpus fixture:
eventmodeling/frontmatter-extra-trivia-below] [corpus fixture:
eventmodeling/frontmatter-extra-trivia-boundary] [corpus fixture:
eventmodeling/frontmatter-extra-trivia-above] [corpus fixture:
eventmodeling/frontmatter-extra-whitespace-line-boundary]

### Global directives

Use the shared directive placement: on the same printed line place a directive
as under [Directives](./flowchart.md#directives). When statements, clauses or
items split into lines, attach an intervening directive to the following unit,
retaining its right-side contact or separation. Rule 1 names no mark for a
directive between two units, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: [sequence](./sequence.md#directives),
[flowchart](./flowchart.md#directives), and [journey](./journey.md#directives)
print such a gap in the same way. Keep content, order, multiline interiors,
positions inside values and unfinished EOF endings. Standalone starts align with
the owning body. The start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [flowchart](./flowchart.md#directives) and
[sequence](./sequence.md#directives) stand a directive on a line of its own at
the level of the statements around it, and [journey](./journey.md#directives) at
the level of the statement after it. Common boundaries retain the full original
gap instead of this ordinary spacing; a removed directive cannot replace
required whitespace.

A directive that is not closed takes the whitespace after its argument, line
breaks included, so the next line goes on its line, which is printed as written
(see
[A line that a directive that is not closed joins](./compatibility.md#a-line-that-a-directive-that-is-not-closed-joins)),
also where the directive stands after the `}` of a description block over
several lines: `accDescr {alpha`, a line break, `beta} %%{wrap foo`, a line
break, and ` tf 23 evt End` stay as they are, with the whitespace before `tf`.

[fixture:
eventmodeling/global-directives/description-block-end-line-with-unclosed-directive-kept]
[fixture: eventmodeling/global-directives/directive-same-line-contacts]

[fixture:
eventmodeling/global-directives/directive-follows-split-next-statement]

[fixture: eventmodeling/global-directives/directive-follows-split-next-gwt-item]

[fixture: eventmodeling/global-directives/directive-follows-split-clause]

[fixture: eventmodeling/global-directives/directive-in-value-exact]

[fixture:
eventmodeling/global-directives/directive-creates-comment-mark-keep-source]

[fixture: eventmodeling/global-directives/unfinished-free-text-eof-unchanged]

[fixture:
eventmodeling/global-directives/standalone-directive-before-normal-frame]

Input (escaped):
`"eventmodeling tf%%{wrap}%% 01 evt Alpha%%{wrap}%%->>%%{wrap}%%02"`.

Output
([global-directives/directive-same-line-contacts-output.mmd](../tests/fixtures/eventmodeling/global-directives/directive-same-line-contacts-output.mmd)):

```mmd
eventmodeling
tf %%{wrap}%%01 evt Alpha %%{wrap}%%->> %%{wrap}%%02
```

### Semicolons

Keep every authored semicolon. A segment that holds a kept `;` is formatted as
anywhere else, except where formatting could change which `;` the line rule
ignores. The rule reads a segment from the first `:` after `style` or `classDef`
to the last `#` before its last kept `;`, with no whitespace between the `:` and
the `#` (see [Semicolons](./flowchart.md#semicolons)), so the gaps and the
padding inside that stretch keep whether they hold whitespace, a run becoming
one space, and the rest of the segment follows the ordinary rules of this
diagram. Text that no part of the layout holds stays as written. A statement
over several lines whose lines, joined with one space or with nothing, could
change which `;` the line rule ignores keeps the text of each segment, up to its
last kept `;`, as written, since the form that rule 2 gives, one line (see
[Declarations and notes](#declarations-and-notes)), would change what the line
rule ignores; any other statement over several lines is formatted like one on a
single line. A `;` that the line rule ignores is removed by mermaid.js, so the
tokens on both sides of it are one token where they touch: the gap after it
keeps whether it holds whitespace, and `/*style:#x*/;title` stays as it is,
since `/*style:#x*/ title` is rejected.

[fixture: semicolons/stretch-kept-rest-formatted] [fixture:
semicolons/ignored-semicolon-touches-next-atom] [fixture:
semicolons/no-stretch-formatted] [fixture:
semicolons/protected-gwt-title-hidden-gap-remains-zero]

The first protected body line aligns with its body; contents and later columns
remain authored. A `title` that follows
`eventmodeling gwt 01 given evt %%{{native}}%%` and a line break stays at column
one, since every version of mermaid.js that counts rejects it indented by two
spaces (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The other diagram types would indent it (see [Indentation](#indentation)).
Required identifier and common-value padding takes precedence over structural
indentation. The leading space of ` accDescr: style:#x;` after
`eventmodeling data D {`, `x` and `}` stays, since every version of mermaid.js
that counts rejects the line without that space (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Keep a child body's opening edge on the protected line too, so a second
formatting cannot split it differently. This grammar has no grammatical
semicolon, so `verbatimStyleLines` is false: a `style` or `classDef` word alone
does not freeze the whole line.

A line that holds a `;` keeps its statements together, also where the `;` stands
in the last line of a description block over several lines and a statement
follows its `}`: `accDescr {x`, a line break, and `y;}` stay with
`tf 17 evt End` on one line.

[fixture:
eventmodeling/semicolons/description-block-end-line-keeps-next-statement]
[fixture: eventmodeling/semicolons/native-gwt-value]

[fixture: eventmodeling/semicolons/native-frame-value]

[fixture: eventmodeling/semicolons/selected-external-semicolon-preserved]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/semicolons/two-semicolons-removing-selected-changes-db]

[fixture: eventmodeling/semicolons/no-grammar-semicolon-style-word-line-formats]

[fixture: eventmodeling/semicolons/gwt-protected-opening-kept]

[fixture: eventmodeling/semicolons/metadata-across-selected-semicolon-gap-exact]

[fixture: eventmodeling/semicolons/selected-semicolon-exposes-native-lf]

[fixture: eventmodeling/semicolons/classdef-trigger-inline-unchanged]

[fixture:
eventmodeling/semicolons/protected-metadata-prefix-is-value-whitespace]

[fixture: eventmodeling/semicolons/protected-gwt-title-hidden-gap-remains-zero]

[fixture: eventmodeling/semicolons/prefix-crosses-clause-header]

[fixture: eventmodeling/semicolons/two-hidden-clause-prefixes]

Input (escaped): `"eventmodeling tf 01 evt Alpha \"style:#x\" ;rf 02 cmd Beta"`.

Output
([semicolons/selected-external-semicolon-preserved-output.mmd](../tests/fixtures/eventmodeling/semicolons/selected-external-semicolon-preserved-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha "style:#x"; rf 02 cmd Beta
```

### Blank lines

Keep at most one ordinary ASCII blank line between statements or items and
remove ordinary blanks at document/body edges.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives it: Prettier
prints a run of empty lines as one and drops the empty lines at the start and
the end of a file or of a block in code, and
[flowchart](./flowchart.md#blank-lines), [sequence](./sequence.md#blank-lines),
[gantt](./gantt.md#blank-lines), and [journey](./journey.md#blank-lines) print a
run of empty lines as one empty line and drop the empty lines at the start and
the end of the body. Whitespace-only ordinary lines become empty; data interiors
follow [Data blocks](#data-blocks). Description, hidden and directive interiors,
retained prefixes and common consumed-LF boundaries remain as written.

[fixture: eventmodeling/blank-lines/ordinary-blanks-bounded]

[fixture: eventmodeling/blank-lines/gwt-blanks-bounded]

[fixture: eventmodeling/blank-lines/block-blank-contents-retained]

[fixture:
eventmodeling/blank-lines/hidden-spare-blank-before-normal-frame-collapse]

[fixture:
eventmodeling/blank-lines/description-empty-ends-same-line-common-no-split]

Input (escaped):
`"\n\neventmodeling\n\n\ntf 01 evt Alpha\n\n \t\n\nrf 02 cmd Beta\n\n"`.

Output
([blank-lines/ordinary-blanks-bounded-output.mmd](../tests/fixtures/eventmodeling/blank-lines/ordinary-blanks-bounded-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha

rf 02 cmd Beta
```

### Trailing whitespace

Remove only harmless exterior ASCII padding after the header or structural
components. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives it:
Prettier prints no whitespace at the end of a line in JavaScript, CSS, and YAML,
and [requirement](./requirement.md#whitespace-between-tokens) and
[radar](./radar.md#trailing-whitespace) drop the whitespace at the end of a
line. Decide by ownership rather than trimming every physical line. Keep
metadata values and prefixes, data interiors apart from the permitted margin
adjustment, comment/directive tails, hidden/data closing boundaries and
protected stretches; their whitespace can be content or determine acceptance.

[fixture: eventmodeling/trailing-whitespace/harmless-trailing-structure]

[fixture:
eventmodeling/trailing-whitespace/metadata-trailing-whitespace-retained]

[fixture:
eventmodeling/trailing-whitespace/metadata-trailing-whitespace-removal-changes]

Input (escaped): `"eventmodeling \t\ntf 01 evt Alpha \t\nentity Shop.Buy \t"`.

Output
([trailing-whitespace/harmless-trailing-structure-output.mmd](../tests/fixtures/eventmodeling/trailing-whitespace/harmless-trailing-structure-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha
entity Shop.Buy
```

### Long lines

Do not wrap by `printWidth`. Ordinary whitespace-only component newlines follow
their spacing rules, while trivia continuations retain structural depth. Rule 1
names no mark for a line break next to a comment or a directive, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#multi-line-statements),
[gantt](./gantt.md#multi-line-statements), and
[journey](./journey.md#multi-line-statements) keep such a line break, where no
other rule keeps the layout as written (a comment region that joins physical
lines, a line that holds a `;`). The start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [flowchart](./flowchart.md#multi-line-statements),
[sequence](./sequence.md#multi-line-statements), and
[xychart](./xychart.md#multi-line-statements) stand the later lines of a
statement and the comment or directive lines between them one level deeper than
the statement, where no other rule keeps the layout as written (a comment region
that joins physical lines, a line that holds a `;`) and except for the `}` that
closes a block whose `{` stands on a later line, which stands at the level of
the statement, as the `}` of an entity block does in
[ER](./er.md#attribute-blocks). Only GWT's decided clause/item layout adds
structural splits. Values, hidden forms, metadata and protected boundaries
retain their contents, apart from the limited block-body margin in
[Data blocks](#data-blocks). Avoiding width-dependent choices keeps those
lexical boundaries explicit and never inserts a forbidden LF into inline data.

[fixture: eventmodeling/long-lines/long-structural-line-no-wrap] [fixture:
eventmodeling/long-lines/break-next-to-comment] [fixture:
eventmodeling/long-lines/break-next-to-directive] [fixture:
eventmodeling/long-lines/break-next-to-percent-comment] [fixture:
eventmodeling/comments/block-opener-on-a-later-line-after-a-comment-line]

[fixture: eventmodeling/long-lines/safe-structural-wrapping-alternate]

[fixture: eventmodeling/long-lines/inline-value-wrapping-rejects]

Input (escaped):
`"eventmodeling tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] \u0060text\u0060 {a very long authored payload}"`.

Output
([long-lines/long-structural-line-no-wrap-output.mmd](../tests/fixtures/eventmodeling/long-lines/long-structural-line-no-wrap-output.mmd)):

```mmd
eventmodeling
tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] `text` {a very long authored payload}
```

### Quotes

The printer neither adds nor removes quotes. A name has no form in quotes:
`tf 01 evt "Alpha"` is rejected. A quote in the body of the data of a frame, in
braces on the line or in a block of a `data` declaration, in a title, and in an
accessibility value is a character of the text: the Db holds `{"x"}` for the
data `{"x"}` and `{x}` for `{x}`, and `accTitle: "T"` for the title written so.
So no text can be written with or without quotes as the same text, and none is
changed.

[fixture: quotes/quotes-as-written]

Input
([quotes/quotes-as-written-input.mmd](../tests/fixtures/eventmodeling/quotes/quotes-as-written-input.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha {"x"}
tf 02 evt Beta {x}
tf 03 evt Gamma [[D]]
data D {
  "y"
}
```

Output
([quotes/quotes-as-written-output.mmd](../tests/fixtures/eventmodeling/quotes/quotes-as-written-output.mmd)):

```mmd
eventmodeling
tf 01 evt Alpha {"x"}
tf 02 evt Beta {x}
tf 03 evt Gamma [[D]]
data D {
  "y"
}
```

### Frontmatter yaml

Use the shared YAML formatter only for safe real leading frontmatter. Malformed
YAML, indented or padded fences, HTML quote hazards and bodies that would create
a fence stay written under the existing guards. YAML nesting uses a positive
minimum indentation even at width zero. At `tabWidth: 0` every version of
mermaid.js that counts rejects a block scalar without indentation, and draws the
diagram differently when a nested `config` value is no longer nested (see
[Frontmatter](./compatibility.md#frontmatter)). If textBeforeHeader is present,
retain the complete prefix through the header: promoting native YAML or
DIRECTIVE into real frontmatter/configuration can change acceptance.

[fixture: eventmodeling/frontmatter-yaml/safe-real-yaml]

[fixture: eventmodeling/frontmatter-yaml/positive-minimum-yaml-indent]

[fixture: eventmodeling/frontmatter-yaml/retained-prefix-whole]

[fixture: eventmodeling/frontmatter-yaml/real-plus-retained-plus-second-scan]

[fixture: eventmodeling/frontmatter-yaml/html-frontmatter-guard-unchanged]

[fixture: eventmodeling/frontmatter-yaml/delimiter-padding-kept]

[fixture: eventmodeling/frontmatter-yaml/indented-fences-kept]

Input (escaped):
`"---\ntitle: 'YamlTitle'\nconfig: {eventmodeling: {padding: 12}}\n---\neventmodeling tf 01 evt Alpha"`.

Output
([frontmatter-yaml/safe-real-yaml-output.mmd](../tests/fixtures/eventmodeling/frontmatter-yaml/safe-real-yaml-output.mmd)):

```mmd
---
title: "YamlTitle"
config: { eventmodeling: { padding: 12 } }
---
eventmodeling
tf 01 evt Alpha
```

### Line terminators and unicode

Follow the shared host policy: read CR and CRLF as LF and write the configured
`endOfLine`, including inside values and hidden forms. Prettier converts them
before the plugin reads the text, and mermaid.js reads `\r\n` and a lone `\r` as
line breaks as it reads `\n`, so the Db does not change (see
[Line endings](./compatibility.md#line-endings)). Normalize ordinary native
Unicode gaps through their component rules. Preserve LS/PS in common values and
line comments, and preserve their block-closing lookahead role; they are not
interchangeable with consumed LF. Unicode value edges are not trimmed.
Prettier's leading-BOM handling keeps its existing limitation.

[test:
eventmodeling/line-terminators-and-unicode/cr-block-and-description-to-lf]

[test: eventmodeling/line-terminators-and-unicode/crlf-block-and-common-to-lf]

[test: eventmodeling/line-terminators-and-unicode/configured-crlf-output]

[test: eventmodeling/line-terminators-and-unicode/configured-cr-output-hidden]

[test:
eventmodeling/line-terminators-and-unicode/ls-ps-native-whitespace-safe-ordinary-components]

[test: eventmodeling/line-terminators-and-unicode/ls-ps-description-value-kept]

[test:
eventmodeling/line-terminators-and-unicode/block-ls-boundary-stays-outside-value]

[test: eventmodeling/line-terminators-and-unicode/common-unicode-edges-kept]

[test: eventmodeling/line-terminators-and-unicode/leading-bom-host]

[corpus fixture: eventmodeling/lex-block-close-ps-boundary]

[corpus fixture: eventmodeling/line-inline-ls]

[corpus fixture: eventmodeling/line-inline-ps]

### Source order

Retain every occurrence in source order, including unused model entities/data,
notes, GWT, type tags, repeated sources, later same-name data, overwritten
common forms and inline data alongside a reference. Only their decided layout
changes, including the permitted block-body margins. An equal comparison Db
after deduplication would still lose authored occurrences; reordering data can
also change the first lookup.

[fixture: eventmodeling/source-order/all-occurrences-retained]

[fixture:
eventmodeling/source-order/deduplicating-source-db-equal-but-not-permitted]

[fixture:
eventmodeling/source-order/reordering-duplicate-data-changes-first-lookup]

[fixture:
eventmodeling/source-order/unread-model-note-gwt-retained-not-raw-line-lock]

[fixture: eventmodeling/title/overwritten-occurrences]

[corpus fixture: eventmodeling/common-repeat-empty]

[corpus fixture: eventmodeling/common-description-repeat]

Input (escaped):
`"eventmodeling entity Shop.Alpha entity Shop.Alpha note 99 {\nunused\n}\ngwt 99 given evt Alpha then cmd Beta tf 01 evt Alpha ->> 02 ->> 02 [[D]] {unused} data D {\nfirst\n}\ndata D {\nsecond\n}\ndata Unused {\nx\n}\n"`.

Output
([source-order/all-occurrences-retained-output.mmd](../tests/fixtures/eventmodeling/source-order/all-occurrences-retained-output.mmd)):

```mmd
eventmodeling
entity Shop.Alpha
entity Shop.Alpha
note 99 {
  unused
}
gwt 99
  given
    evt Alpha
  then
    cmd Beta
tf 01 evt Alpha ->> 02 ->> 02 [[D]] {unused}
data D {
  first
}
data D {
  second
}
data Unused {
  x
}
```

### Final newline

End ordinary accepted text with one configured newline, removing ordinary
terminal blank runs. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives it: Prettier ends a file with one line break and no blank line after the
last line in JavaScript, CSS, and YAML, and [pie](./pie.md#final-newline),
[packet](./packet.md#final-newline), and [kanban](./kanban.md#final-newline) end
the text with one line break and drop the empty lines before it. mermaid.js
appends a LF to the text before it reads it (see
[End of text](../../spec/docs/common.md#end-of-text)), so the final LF is a
character that it already reads. Required hidden/data closing padding, protected
source and EOF-reaching unfinished directives retain their lexical endings. This
shares the file-ending policy without adding LF to directive content or changing
a block terminal's lookahead.

[fixture: eventmodeling/final-newline/final-common-line-newline]

[fixture: eventmodeling/final-newline/final-native-comment-newline]

[fixture: eventmodeling/final-newline/final-hidden-closer-padding-kept]

[fixture: eventmodeling/final-newline/final-block-padding-kept]

[fixture: eventmodeling/final-newline/hidden-eof-with-no-lf-gets-lf]

Input (escaped): `"eventmodeling accDescr: D"`.

Output
([final-newline/final-common-line-newline-output.mmd](../tests/fixtures/eventmodeling/final-newline/final-common-line-newline-output.mmd)):

```mmd
eventmodeling accDescr: D
```

### Specified readings

Follow the five existing divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque and c4-keyword-anywhere. Add no divergence and do not
repair atomic cuts in rejected inputs. Raw rejection supplies no raw Db;
comparisons use the recorded specified reading where needed. Rejected files
report syntax errors without being rewritten, and rejected Markdown payloads are
left to the host.

[corpus fixture: eventmodeling/directive-arrow-inside]

[corpus fixture: eventmodeling/lex-semicolon-frame-id-inside]

[corpus fixture: eventmodeling/div-html-frontmatter-value]

[corpus fixture: eventmodeling/div-frontmatter-invalid]

[corpus fixture: eventmodeling/c4-container-data]

### Markdown fences

Use the shared embedding path for dedented top-level, list and quote payloads,
with the same options, retained prefixes and common padding, so that the blank
lines at the end of a payload go as at the end of a file (see
[Final newline](#final-newline)), as Prettier formats the code of a fence of any
other language that it knows. The host strips trailing embedded newlines and
padding on the final code line, so final retained padding lacks the standalone
guarantee. Rejected payloads use Prettier's ordinary code handling.

[test: eventmodeling Markdown: top-level]

[test: eventmodeling Markdown: data-declaration]

[test: eventmodeling Markdown: list]

[test: eventmodeling Markdown: quote]

[test: eventmodeling Markdown: zero]

[test: eventmodeling Markdown: tabs]

[test: eventmodeling Markdown: metadata]

[test: eventmodeling Markdown: hidden-boundary]

[test: eventmodeling Markdown: prefix]

[test: eventmodeling Markdown: frontmatter]

[test: eventmodeling Markdown: final-hidden-padding]

[test: eventmodeling Markdown: rejected]
