# Architecture formatting rules

Japanese version: [architecture.ja.md](./architecture.ja.md)

The printer follows the 29 adopted items using the authored AST and shared
flat-body layouts. The rules below explain each formatting choice; compatibility
limits are in [compatibility.md](./compatibility.md).

## Rules

### Header

Print `architecture-beta` at column one. Move an ordinary first statement below
it, as [sequence](./sequence.md#statements-one-per-line) and
[ER](./er.md#statements-one-per-line) diagrams move a statement written on the
line of their header;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the first statement its line. A header at column one is easier to find than an
indented one. Keep empty bodies. Hidden boundaries and protected header/body
segments take precedence; never invent a glued keyword.

[fixture: architecture/header/header-empty]

[fixture: architecture/header/header-inline-accessibility]

[fixture: architecture/header/header-inline-description]

[corpus fixture: architecture/header-inline-group]

[corpus fixture: architecture/header-inline-service]

[corpus fixture: architecture/header-inline-junction]

[corpus fixture: architecture/header-inline-edge]

[corpus fixture: architecture/header-inline-align]

[corpus fixture: architecture/common-all]

[corpus fixture: architecture/header-glued-service]

[corpus fixture: architecture/header-letter-suffix]

Input (escaped): `"architecture-beta accTitle: Topic\n"`.

Output
([header/header-inline-accessibility-output.mmd](../tests/fixtures/architecture/header/header-inline-accessibility-output.mmd)):

```mmd
architecture-beta
  accTitle: Topic
```

### Indentation

Ordinary declarations, edges, alignments, common statements and standalone
trivia stand one configured step below the header.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts these lines one
level deeper than the header, as Prettier prints the lines inside a block. The
body is flat: `in` is a reference, not nesting. `tabWidth: 0` gives zero spaces;
`useTabs` gives one tab even at width zero, because architecture columns have no
grammatical meaning. A level is what Prettier's `tabWidth` and `useTabs` options
say, as [pie](./pie.md#indentation), [packet](./packet.md#indentation),
[gitgraph](./gitgraph.md#indentation), [info](./info.md#indentation),
[radar](./radar.md#indentation), and [wardley](./wardley.md#indentation) print
it, and as Prettier indents JavaScript: in `if (a) { b }` there are zero spaces
before `b` at `tabWidth: 0` and one tab with `useTabs`. Other value continuation
columns, hidden closers and retained prefixes stay written.

[fixture: architecture/indentation/indent-four]

[fixture: architecture/indentation/indent-tabs]

[fixture: architecture/indentation/indent-two]

[fixture: architecture/indentation/indent-zero]

[fixture: architecture/indentation/zero-tabs]

Input (escaped): `"architecture-beta\nservice a\n"`.

Options: `{"tabWidth": 4}`.

Output
([indentation/indent-four-output.mmd](../tests/fixtures/architecture/indentation/indent-four-output.mmd)):

```mmd
architecture-beta
    service a
```

### Statements one per line

Print ordinary statements one per line, as
[flowchart](./flowchart.md#statements-one-per-line),
[sequence](./sequence.md#statements-one-per-line), and
[state](./state.md#statements-one-per-line) diagrams do;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
this form. A common line value owns apparent keywords through physical EOL, so
do not split it. Semicolons are not statement separators; invalid adjacent
statements and empty descriptions used as component gaps remain failures.

[fixture: architecture/statements-one-per-line/line-value-owns-keywords]

[corpus fixture: architecture/gram-same-line-statements]

[corpus fixture: architecture/end-group-semicolon]

[corpus fixture: architecture/gram-empty-description-gap]

[corpus fixture: architecture/gram-empty-description-after-service]

Input (escaped): `"architecture-beta title t service a; junction j\n"`.

Output
([statements-one-per-line/line-value-owns-keywords-output.mmd](../tests/fixtures/architecture/statements-one-per-line/line-value-owns-keywords-output.mmd)):

```mmd
architecture-beta title t service a; junction j
```

### Declaration spacing

Use one space between the keyword and ID.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between the keyword and its ID, as Prettier prints `return  x` as `return x;`.
Print `group g(cloud)[G]`, `service a(server)[A]` and `service a[A]`: touching
parentheses and brackets make the attached parts read as one node.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the touching
`(` and `[`: Prettier prints no whitespace before the `(` of a call and none
before the `[` of an index (`f (a) [0]` is printed `f(a)[0];`).
[Block](./block.md#shapes) and [mindmap](./mindmap.md#node-text) print the shape
of a node touching its id too (`A ("x")` is printed `A("x")`, and `a (x)` is
printed `a(x)`). A quoted text icon is an independent value, so print
`service a "I" [A]`. Missing optional parts stay absent. Trivia-bearing gaps
keep their contact.

[fixture: architecture/declaration-spacing/double-text-icon]

[fixture: architecture/declaration-spacing/group-id]

[fixture: architecture/declaration-spacing/group-label]

[fixture: architecture/declaration-spacing/junction-id]

[fixture: architecture/declaration-spacing/named-group]

[fixture: architecture/declaration-spacing/named-service]

[fixture: architecture/declaration-spacing/service-id]

[fixture: architecture/declaration-spacing/service-label]

[fixture: architecture/declaration-spacing/single-text-icon]

Input (escaped): `"architecture-beta\ngroup  g (cloud) [Group]\n"`.

Output
([declaration-spacing/named-group-output.mmd](../tests/fixtures/architecture/declaration-spacing/named-group-output.mmd)):

```mmd
architecture-beta
  group g(cloud)[Group]
```

### Parent references

Put one space on each side of `in`, without column alignment. This gives
equivalent padding a consistent spelling while preserving explicit references
and their absence. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives the space on each side of `in`: it is a mark between two things, as it is
in JavaScript, where Prettier prints `[G]in p` as `[G] in p` and `a  in   b` as
`a in b`, with one space on each side as for any other mark between two things.
Do not move declarations to resolve parents or turn membership into a nested
body.

[fixture: architecture/parent-references/group-parent]

[fixture: architecture/parent-references/junction-parent]

[fixture: architecture/parent-references/service-parent]

[corpus fixture: architecture/lex-keyword-prefix-ids]

[corpus fixture: architecture/db-service-forward-parent]

[corpus fixture: architecture/db-junction-forward-parent]

Input (escaped): `"architecture-beta\ngroup p\ngroup g(cloud)[G]in\tp\n"`.

Output
([parent-references/group-parent-output.mmd](../tests/fixtures/architecture/parent-references/group-parent-output.mmd)):

```mmd
architecture-beta
  group p
  group g(cloud)[G] in p
```

### Named icons

Keep each icon name as written inside its parentheses, including leading symbols
and unknown names. The Db holds the icon name as it is written, and the drawing
looks the icon up by that name, so another spelling is another name and not
another form of the same name. The composite requires a nonempty unpadded name:
inserting spaces would reject accepted input. Rule 1 prints none either:
Prettier prints no whitespace inside parentheses (`f( a )` is printed `f(a);`).
Global directives between complete components retain their boundaries. A
directive in such a gap is placed as under
[Directives](./flowchart.md#directives): the gap is printed as without the
directive, and inside the parentheses of an icon it has no space, so the
directive touches the unit on each side.

[fixture: architecture/named-icons/leading-symbols]

[fixture: architecture/named-icons/unknown-name]

[corpus fixture: architecture/lex-icon-leading-symbols]

[corpus fixture: architecture/db-unknown-icon]

[corpus fixture: architecture/lex-icon-empty]

[corpus fixture: architecture/lex-icon-spaces]

[corpus fixture: architecture/lex-icon-text-parenthesized]

Input (escaped): `"architecture-beta\ngroup symbols (-:A_)\n"`.

Output
([named-icons/leading-symbols-output.mmd](../tests/fixtures/architecture/named-icons/leading-symbols-output.mmd)):

```mmd
architecture-beta
  group symbols(-:A_)
```

### Text icons

Keep each StringLiteral source span, including single/double quotes, opposite
quotes, empty text, escapes, padding and physical continuation lines, except
that a run of spaces and tabs inside the text is printed as one space (see
[Label content](#label-content)); trimming the padding or decoding the escapes
can change the Db. `singleQuote` does not rewrite it.

[fixture: architecture/text-icons/double-quote]

[fixture: architecture/text-icons/empty]

[fixture: architecture/text-icons/padding]

[fixture: architecture/text-icons/single-quote]

[corpus fixture: architecture/lex-string-conversion]

[corpus fixture: architecture/lex-string-number-escape]

[corpus fixture: architecture/directive-empty-text-icon]

Input (escaped): `"architecture-beta\nservice double\"a'\\n\\t\\q\\\\b\"\n"`.

Options: `{"singleQuote": true}`.

Output
([text-icons/double-quote-output.mmd](../tests/fixtures/architecture/text-icons/double-quote-output.mmd)):

```mmd
architecture-beta
  service double "a'\n\t\q\\b"
```

### Label forms

Keep the whole ArchitectureLabel range and its quote spelling, except that a
label in quotes is printed without them where it is plain (see
[Quotes](#quotes)). A label with padding before its quote (`[ "x" ]`) is a bare
label in the tree, whose text holds the quote, but mermaid.js trims the padding
and takes the quote off, so it reads `x` as it reads `["x"]` and `[x]`: it is
printed like a label in quotes, `service padded [ "x" ]` as `service padded[x]`.
Fallback quote-looking text stays bare; never infer kind from converted text.

[fixture: architecture/label-forms/backslash-fallback]

[fixture: architecture/label-forms/bare]

[fixture: architecture/label-forms/inner-quote]

[fixture: architecture/label-forms/padded-quotes]

[fixture: architecture/label-forms/quoted-brackets]

[fixture: architecture/label-forms/single-quote]

[fixture: architecture/label-forms/unclosed-quote]

[fixture: architecture/label-forms/unescaped-quote]

[corpus fixture: architecture/lex-title-unclosed-quote-with-close]

[corpus fixture: architecture/lex-title-bare-inner-quote]

[corpus fixture: architecture/lex-title-unescaped-quote-fallback]

[corpus fixture: architecture/lex-title-quoted-backslash-fallback]

[corpus fixture: architecture/lex-title-quoted-brackets]

[corpus fixture: architecture/lex-title-single-quoted-brackets]

[corpus fixture: architecture/lex-title-padded-quoted-brackets]

[corpus fixture: architecture/html-label-authored-quotes]

[corpus fixture: architecture/lex-label-selected-semicolon-after-quote]

[corpus fixture: architecture/db-title-quote-only-double]

[corpus fixture: architecture/db-title-quote-only-single]

[corpus fixture: architecture/db-title-quote-only-padded]

Input (escaped): `"architecture-beta\nservice padded [ \"x\" ]\n"`.

Options: `{"singleQuote": true}`.

Output
([label-forms/padded-quotes-output.mmd](../tests/fixtures/architecture/label-forms/padded-quotes-output.mmd)):

```mmd
architecture-beta
  service padded[x]
```

### Quotes

A label in quotes is printed without them where it is plain, as the examples in
the documentation of mermaid.js write it (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)):
`group api(cloud)["API Group"]` is printed `group api(cloud)[API Group]`, and
`service s(server)['Plain Single']` is printed
`service s(server)[Plain Single]`. A label is plain where it holds no bracket,
quote, backslash, or line break, and has no space at its ends: a label without
quotes runs to the next `]`, and one that starts and ends with a quote is read
as a label in quotes, so `"a-b"`, `"A.B"`, and `"日本語"` are printed without
quotes, while `"a[b"`, the empty label, and a label with padding inside the
quotes (`[" padded "]`) keep theirs. The versions that were run reject
`service s[]` and accept `service s[""]`, which is the reason for the empty
label. A backslash and a quote keep theirs too: mermaid.js takes one pair of
outer quotes, `"` or `'`, off the title that it reads, and turns `\"` and `\'`
into `"` and `'` only in a title that had them, so `"a\"b"` printed `a\"b`, and
`"'x'"` printed `'x'`, would be read as other titles. A label without quotes is
never put in quotes. A run of spaces and tabs in a label is printed as one
space, except where it makes a word of its own: mermaid.js draws a label word by
word, split at single spaces, so a run of tabs alone, and a tab between two
spaces, stay (`"A<tab>B"` is printed `A<tab>B`). The words are what mermaid.js
keeps of the title: it takes the brackets off, trims, takes one pair of outer
quotes off, and trims again. A quote inside the words, or beside a bracket
inside them, is a character of a word like any other, so a tab beside it stays
too (`["A'<tab>B"]` and `["A[<tab>B"]` are printed as written).

[fixture: quotes/labels-without-quotes] [fixture:
quotes/labels-with-punctuation-without-quotes] [fixture:
quotes/labels-that-need-quotes] [fixture:
quotes/labels-with-runs-without-quotes] [fixture:
quotes/labels-with-tab-words-kept] [fixture:
quotes/labels-with-quotes-beside-tab-words-kept]

Input
([quotes/labels-without-quotes-input.mmd](../tests/fixtures/architecture/quotes/labels-without-quotes-input.mmd)):

```mmd
architecture-beta
group api(cloud)["API Group"]
service db(database)["Database_1"] in api
service s(server)['Plain Single']
service t(server)[Already bare]
```

Output
([quotes/labels-without-quotes-output.mmd](../tests/fixtures/architecture/quotes/labels-without-quotes-output.mmd)):

```mmd
architecture-beta
  group api(cloud)[API Group]
  service db(database)[Database_1] in api
  service s(server)[Plain Single]
  service t(server)[Already bare]
```

### Label content

Preserve bracket interiors, except the spaces, tabs, and no-break spaces next to
the brackets of the title of a group or a service and of the label of an arrow
(see [Arrow labels](#arrow-labels)): mermaid.js trims them, so
`group a(cloud)[ API ]` is printed `group a(cloud)[API]` and
`service s(server)["x" ]` is printed `service s(server)["x"]`. For the spaces
and tabs, [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives this
form, as Prettier prints no whitespace inside brackets (`f( a )` is printed
`f(a);`).

[fixture: label-content/title-edge-whitespace-dropped]

This holds on a line with a kept `;` too, apart from the stretch read by the
line rule (see [Semicolons](#semicolons)): dropping the padding outside that
stretch moves no `;`, adds none and removes none, so the line rule selects the
same `;`. `group g(cloud)[ a;b ]` is printed `group g(cloud)[a;b]`, and
`service s(server)[ x; ] in g` is printed `service s(server)[x;] in g`. One
space stays where the padding lies between a `:` and a `#` of a line that the
line rule may read, since whether it is there decides which `;` is ignored:
`service style(logos:aws)[ #y; ]` is printed `service style(logos:aws)[ #y;]`,
while `service s(logos:aws)[ #y; ]` has no `style` before the `:` and is printed
`service s(logos:aws)[#y;]`. The rule reads a line without its directives, so a
`style`, a `:`, a `#`, or a `;` inside one makes no stretch:
`service%%{style}%% s0(logos:aws)[ #y; ]` is printed
`service %%{style}%%s0(logos:aws)[#y;]`,
`service style1(logos:aws)[ #y ]%%{init:{"a":";"}}%%` is printed with `[#y]`,
and the same line with a `;` outside the directive, `[ #y; ]`, keeps its space.

[fixture: label-content/title-padding-line-rule-chars-in-directive]

A `%%` in the middle of a line is no comment line, so the rule reads its text:
`service style3(logos:aws)[ #y ] %% note;` is printed
`service style3(logos:aws)[ #y] %% note;`, since the `;` of the note lets the
rule match from the `:` of `logos:aws`, and
`service classDef(logos:aws)[#a;style: ]%%#c;` is not changed, since the `#` and
the `;` after the `%%` take part in the rule.

[fixture: label-content/title-padding-line-rule-chars-in-comment]

A U+2028 or U+2029 that no directive or comment holds ends the line that the
rule reads, so a `:` before it and a `;` after it make no stretch.

[test: architecture/label-content/title-style-rule-ends-at-u2028] [test:
architecture/label-content/title-style-rule-ends-at-u2029]

A title with a comment or a directive stays as written, and so does a padding
with a U+2028 or U+2029 in it.

[fixture: label-content/title-padding-with-directive-or-semicolon] [fixture:
label-content/title-padding-in-style-rule-stretch] [fixture:
label-content/title-padding-after-colon-without-style] [test:
architecture/label-content/title-u2028] [test:
architecture/label-content/title-u2029] [test:
architecture/label-content/title-with-semicolon-u2028] [test:
architecture/label-content/title-with-semicolon-u2029]

A run of spaces and tabs inside the text is printed as one space, since the
figure is the same (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)):
`group labels[A  B]` is printed `group labels[A B]`.

[fixture: label-content/bare-padding]

Whitespace-only and quoted-empty content, escapes, HTML, entities and
hidden-looking text stay. mermaid.js keeps an escape, HTML, an entity, a U+2028
or U+2029, and hidden-looking text in the value that it reads, apart from the
escape of a quote and the quotes of an HTML attribute (`["A\"B\q\n"]` has the
title `A"B\q\n`, `[<b>Service</b>]` the title `<b>Service</b>`, and `[%%{}%%]`
the title `%%{}%%`), so another spelling changes that value. A label of
whitespace only is printed with one space, and an empty label in quotes keeps
its quotes. Neither is printed empty, since versions of mermaid.js that count
reject an empty label without quotes (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A title with a comment or a directive stays as written. Physical CR/CRLF alone
follow the shared host policy.

[fixture: architecture/label-content/bare-padding]

[fixture: architecture/label-content/escapes]

[fixture: architecture/label-content/hidden-looking]

[fixture: architecture/label-content/html-entities]

[fixture: architecture/label-content/quoted-empty]

[fixture: architecture/label-content/quoted-padding]

[fixture: architecture/label-content/whitespace-only]

[corpus fixture: architecture/lex-title-conversion]

[corpus fixture: architecture/db-empty-values]

[corpus fixture: architecture/lex-title-bare-trailing-backslash]

[corpus fixture: architecture/line-ls-ps-values]

[corpus fixture: architecture/hidden-directive-inside-values]

[corpus fixture: architecture/html-all-fields]

[corpus fixture: architecture/style-entity-semicolons]

[corpus fixture: architecture/html-label-authored-quotes]

[corpus fixture: architecture/space-unicode-values]

Input (escaped): `"architecture-beta\ngroup labels [  A  B\t C  ]\n"`.

Output
([label-content/bare-padding-output.mmd](../tests/fixtures/architecture/label-content/bare-padding-output.mmd)):

```mmd
architecture-beta
  group labels[A B C]
```

### Port colons

Close ordinary gaps on both sides of each port colon, as `a:R` and `L:b`. The
colon is a colon inside a name: the side `R` is a part of how the edge names its
end, the side `R` of the service `a`, so no whitespace stands on either side
(step 1 of [Which kind a colon is](./printed-form.md#which-kind-a-colon-is)). It
is no aligned field. Keep trivia and hidden boundaries instead of tightening
them.

[fixture: architecture/port-colons/port-colons-tight]

Input (escaped):
`"architecture-beta\nservice a\nservice b\na {group} : R -- L : b {group}\n"`.

Output
([port-colons/port-colons-tight-output.mmd](../tests/fixtures/architecture/port-colons/port-colons-tight-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Arrow lines

Keep the line and its optional markers together, with one ordinary space on each
side: `a:R <-- L:b`, `a:T --> B:b`, `a:R <--> L:b`. This separates the line from
the ports. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
space on each side: the line with its markers is a mark between two things, as
the `-->` of a flowchart is, and Prettier prints a mark between two things with
one space on each side (the row of rule 1 for another mark between two things:
`A-->B` in a flowchart is printed `A --> B`, and `A<-->B` and `A---B` are
printed `A <--> B` and `A --- B`). Keep both actual marker characters, including
`>--<`; their presence flags do not specify their glyphs. The Db of the pinned
version gives `>--<` and `<-->` the same flags, and the versions that were run
read and draw both alike, so no reason keeps the reversed glyph, and its row is
in the list (D02). No-marker lines use the same spaces.

[fixture: architecture/arrow-lines/arrow-both-markers]

[fixture: architecture/arrow-lines/arrow-end-marker]

[fixture: architecture/arrow-lines/arrow-no-markers]

[fixture: architecture/arrow-lines/arrow-reversed-markers]

[fixture: architecture/arrow-lines/arrow-start-marker]

[corpus fixture: architecture/db-directions]

[corpus fixture: architecture/gram-edge-separated-dashes]

Input (escaped): `"architecture-beta\nservice a\nservice b\na:R < -- > L:b\n"`.

Output
([arrow-lines/arrow-both-markers-output.mmd](../tests/fixtures/architecture/arrow-lines/arrow-both-markers-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R <--> L:b
```

### Arrow labels

Print labelled lines as `a:R <-[label]-> L:b`: the single dashes, whole
bracketed label and markers form one visual unit. Remove the ordinary exterior
gaps, and the spaces, tabs, and no-break spaces next to the brackets of the
label, as for the title of a group or a service (see
[Label content](#label-content)): `a:R -[ Label ]- L:b` is printed
`a:R -[Label]- L:b`, and `a:R - [ "x" ] - L:b` is printed `a:R -["x"]- L:b`.
mermaid.js trims the label, so the Db is the same. Preserve the rest of the
label range, including empty quoted content. A label with a comment or a
directive stays as written, and so does a padding with a U+2028 or U+2029 in it.

[fixture: architecture/arrow-labels/edge-label-padded-quote]

[fixture: architecture/arrow-labels/edge-label-quoted]

[fixture: architecture/arrow-labels/labelled-dash-tight]

[fixture: architecture/arrow-labels/edge-label-padding-dropped]

[fixture: architecture/arrow-labels/edge-label-directive-kept]

[test: architecture/arrow-labels/edge-label-padding-u2028]

[test: architecture/arrow-labels/edge-label-padding-u2029]

[corpus fixture: architecture/gram-edge-reversed-labeled-markers]

[corpus fixture: architecture/db-edge-title-quote-only]

Input (escaped):
`"architecture-beta\nservice a\nservice b\na:R - [ \"x\" ] - L:b\n"`.

Output
([arrow-labels/edge-label-padded-quote-output.mmd](../tests/fixtures/architecture/arrow-labels/edge-label-padded-quote-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R -["x"]- L:b
```

### Group modifiers

Attach the authored `{group}` to its endpoint, as `a{group}:R`. This makes the
modifier read with its ID. Keep its fixed interior and both authored presence
flags, even on ungrouped nodes; do not substitute resolved group IDs.

[fixture: architecture/group-modifiers/modifier-touch]

[corpus fixture: architecture/db-group-modifier-junction]

[corpus fixture: architecture/db-group-modifier-one-group]

[corpus fixture: architecture/db-group-modifier-other-parent]

[corpus fixture: architecture/gram-hidden-modifier-gaps]

Input (escaped):
`"architecture-beta\nservice a\nservice b\na  {group}:R -- L:b\t{group}\n"`.

Output
([group-modifiers/modifier-touch-output.mmd](../tests/fixtures/architecture/group-modifiers/modifier-touch-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Alignment

Use one ordinary space between `align`, its row/column direction and each
member. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one
space between a keyword and what it takes, as Prettier prints `return  x` as
`return x;`, which gives the gap between `align` and its direction and the gap
between the direction and the first member.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between values that follow one another, as Prettier prints CSS
`margin: 1px    2px;` as `margin: 1px 2px;`: `a   b` and `a`, a tab, and `b` are
printed `a b`. Do not align columns, sort members, merge repeated constraints or
wrap them. The gaps do not change authored order or introduce visible EOL.

[fixture: architecture/alignment/alignment-row-and-column]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/db-align-layout-conflict]

Input (escaped):
`"architecture-beta\nservice a\nservice b\njunction j\nalign\t row\t a   b\tj\nalign  column j\t b\n"`.

Output
([alignment/alignment-row-and-column-output.mmd](../tests/fixtures/architecture/alignment/alignment-row-and-column-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  junction j
  align row a b j
  align column j b
```

### Title

Use shared common-line layout, except as the paragraphs below and the
[Semicolons](#semicolons) section state: `title value` trims only
common-whitespace edges, and null or whitespace-only values print `title`. A run
of spaces and tabs inside the value is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between `title` and a nonempty value, as Prettier prints `return  x` as
`return x;`. Never read the next physical line as a value, even across trivia.
mermaid.js reads the next line as a statement of its own, so joining it would
put that statement into the title, and what it declares (a node, a group, a
junction, or an edge) would disappear. Keep occurrences and content even though
the architecture summary does not publish title. Where a title has text and no
directive stands before its text or inside it, and no U+2028 or U+2029 stands
inside the text, the directives that end it are printed as follows, by what
stands before them and after them, except for the undecided lines. A line with
directives is undecided when, besides its directives, it holds a `;` outside a
comment (also inside a directive), when it holds a `;` inside a comment and a
U+2028 or U+2029, when a U+2028 or U+2029 stands inside or after its first
directive, when a directive holds a line break, or when a line between it and
the next statement holds a `;` inside a comment or a directive. A wide space is
one of U+000B, U+000C, U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000,
and U+FEFF. Where item 6 splits a line, none of the other items applies to it:

- Where only spaces and tabs, or nothing, stand before the directives, no `;`
  stands in the text before them or inside one of them, no directive holds a
  line break, a U+2028, or a U+2029, and nothing but spaces and tabs follow the
  last one, one space is printed before each directive that has spaces or tabs
  before it, and the spaces and tabs after the last one are left out, whatever
  the spaces and tabs at the end of the line.
- Where a wide space stands before the directives, they touch one another, and
  the end of the line or a comment touches the last one, the character is
  printed as one space with the rest of its run.
- Where a wide space stands before the directives and spaces or tabs and another
  directive or a comment follow the first one, the character stays, and each run
  of spaces and tabs after it before a directive or the comment is printed as
  one space.
- Where a U+2028 or U+2029 stands before the directives, they touch one another,
  and the end of the line touches the last one, it is printed as one space.
- Where a U+2028 or U+2029 stands before the directives, no comment follows the
  last one, and spaces or tabs follow the last one, or spaces or tabs and
  another directive follow the first one, the line stays as written.
- Where a U+2028 or U+2029 stands before the directives and a comment follows
  the last one, the comment region joins the next line of the source (see
  [A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)).
  The comment lines are removed, with the empty lines, the lines of whitespace,
  and the directive lines that stand before them, and the first line that is
  left decides. Where it is a statement or a line of whitespace, the line stays
  as written through that line. Where it is an empty line or a directive line,
  or no line is left, the U+2028 or U+2029 is dropped, the directives and the
  comment stand on a line of their own, a gap between them is printed as one
  space whatever whitespace it holds. Where no comment line follows it, a
  directive line holds directives only, with no whitespace before, between, or
  after them (`%%{y}%%`, `%%{y}%%%%{z}%%`); an indented directive, a directive
  that whitespace follows, directives that whitespace separates, and a directive
  that text follows are statements there. A comment line holds a comment
  (`%% d`, `  %% d`, `%%{y}%% %% e`). A line of whitespace holds spaces, tabs,
  wide spaces, U+2028, and U+2029 only: U+0085 and U+180E are no whitespace, and
  a line that holds one of them is a statement. A line that stands before a
  comment line is removed with it where it holds nothing but whitespace,
  directives, and comments, whatever their arrangement: an empty line, a line of
  whitespace, a directive line, an indented directive, a directive that
  whitespace follows, and directives that whitespace separate (`%%{y}%%`, two
  spaces, and `%%{z}%%`) are removed, and a line that holds text, U+0085,
  U+180E, or a `;` outside a comment and a directive is a statement.
- Where a wide space stands between two directives, the line stays as written,
  whatever follows the last one.
- Where a wide space stands after the last directive, also after spaces or tabs,
  the line stays as written, whatever follows the character. A title with a
  directive inside its text stays as written too.

Where a comment follows the last directive, no U+2028 or U+2029 stands between
the text and the comment, the line is not undecided, and neither of items 7 and
8 applies, a run of spaces and tabs before each directive and before the comment
is printed as one space, also where the comment holds a `;` (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`.

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) leaves out the spaces
at the end of the line (item 1), as Prettier ends no line with whitespace. The
other items say what the released version prints for the gaps and the characters
that the rules do not decide, and a form that the other diagram types print
differently stays as it is until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

Where a U+2028 or U+2029 stands inside the text, or the value holds directives
only, and the line is not undecided, the line stays as written if spaces or tabs
follow the last directive, whether the end of the line or a comment comes after
them, or if spaces or tabs stand between two directives, and item 3 does not
apply to it; otherwise the other items print it as they print a line of any
other text, so each run of spaces and tabs before a directive, the one after the
keyword included, is one space.

The undecided lines are not stated: the output there depends on each character
on each side of the `;` and of the U+2028 or U+2029, rule 1 names no mark for
these gaps, and the diagram types do not print them alike. The forms that the
released version prints there stay until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Where no U+2028 or U+2029 stands in the line, a `;` inside its comment makes no
difference to it, so a line that holds one only there is not undecided, unless a
line between it and the next statement holds a `;` inside a comment or a
directive. The lines that make the formatter throw there are not stated.

Where the text of a title starts with a directive, or with directives that touch
one another, after the one space or tab that follows the keyword, and the rest
of the line holds no directive, comment, `;`, wide space, U+2028, or U+2029, and
the line is not undecided, the spaces and tabs between the directives and the
rest of the text are left out, with the spaces and tabs at the end of the line:
`title %%{x}%%  T  ` is printed `title %%{x}%%T`, and
`title %%{x}%%%%{y}%%  T  ` is printed `title %%{x}%%%%{y}%%T`. mermaid.js
removes the directives before it reads the text, and it draws the title without
the whitespace at its start (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
The other titles that hold a directive before their text are not stated: a
directive that touches the keyword, a second whitespace character before the
first directive, whitespace between two directives, and a directive, a comment,
a `;`, a wide space, a U+2028, or a U+2029 elsewhere in the line, and the
`accTitle:` and `accDescr:` lines whose text starts with a directive. The
released version prints them as it prints them until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: title/title-directives-end-blanks-dropped] [fixture:
title/title-directives-end-tabs-dropped] [fixture:
title/title-directives-in-the-text-kept] [fixture:
title/title-directives-end-before-comment-line-and-empty-line] [fixture:
title/title-directives-then-comment] [fixture:
title/title-directives-end-at-the-end-of-the-text] [corpus fixture:
architecture/directive-fields] [test: a no-break space after the last directive
of a title of an architecture diagram] [test: U+3000 after the last directive of
a title of an architecture diagram] [test: U+2028 after the last directive of a
title of an architecture diagram] [test: U+2029 after the last directive of a
title of an architecture diagram] [test: a space and a no-break space after the
last directive of a title of an architecture diagram] [test: a no-break space
after the last of two directives of a title of an architecture diagram] [test: a
no-break space before the directive that ends a title of an architecture
diagram] [test: U+3000 before the directive that ends a title of an architecture
diagram] [test: a space, a no-break space, and a space before the directive that
ends a title of an architecture diagram] [test: a no-break space before two
directives that touch and end a title of an architecture diagram] [test: a
no-break space before a directive that a comment touches in a title of an
architecture diagram] [test: U+2028 before the directive that ends a title of an
architecture diagram] [test: U+2029 before the directive that ends a title of an
architecture diagram] [test: a no-break space before a directive that a space
and another directive follow in a title of an architecture diagram] [test:
U+3000 before a directive that a space and a comment follow in a title of an
architecture diagram] [test: a tab and a no-break space after the last directive
of a title of an architecture diagram] [test: U+3000 before a directive that a
comment touches in a title of an architecture diagram] [test: U+3000 before two
directives that touch and end a title of an architecture diagram] [test: U+3000
before a directive that a space and another directive follow in a title of an
architecture diagram] [test: a no-break space before a directive that a space
and a comment follow in a title of an architecture diagram] [test: a no-break
space between two directives that end a title of an architecture diagram] [test:
U+3000 between two directives that end a title of an architecture diagram]
[test: a no-break space between two directives, spaces after the last, in a
title of an architecture diagram] [test: U+3000 between two directives, spaces
after the last, in a title of an architecture diagram] [test: U+2028 before two
directives that touch and end a title of an architecture diagram] [test: U+2029
before two directives that touch and end a title of an architecture diagram]
[test: U+2028 before the last directive, a space and a tab after it, in a title
of an architecture diagram] [test: U+2029 before the last directive, a space and
a tab after it, in a title of an architecture diagram] [test: U+2028 before a
directive that a space and another directive follow in a title of an
architecture diagram] [test: U+2029 before a directive that a space and another
directive follow in a title of an architecture diagram] [test: U+2028 between
two directives that end a title of an architecture diagram] [test: U+2029
between two directives that end a title of an architecture diagram] [test:
U+2028 between two directives, spaces after the last, in a title of an
architecture diagram] [test: U+2029 between two directives, spaces after the
last, in a title of an architecture diagram] [test: a space, a tab, and a
no-break space after the last directive of a title of an architecture diagram]
[test: a space, a tab, and U+3000 after the last directive of a title of an
architecture diagram] [test: a space, a tab, and U+2028 after the last directive
of a title of an architecture diagram] [test: a space, a tab, and U+2029 after
the last directive of a title of an architecture diagram] [test: a semicolon
before the directive of a title of an architecture diagram, spaces after it]
[test: a semicolon and spaces before the directive that ends a title of an
architecture diagram] [test: a semicolon after the last directive of a title of
an architecture diagram, spaces around it] [test: a semicolon before the
directive of a title of an architecture diagram, a tab after it] [test: a
semicolon and a no-break space before the directive of a title of an
architecture diagram, spaces after it] [test: a semicolon and a no-break space
before the directive that ends a title of an architecture diagram] [test: a
semicolon touching the last directive of a title of an architecture diagram]
[test: U+000B before the directive that ends a title of an architecture diagram]
[test: U+000C before the directive that ends a title of an architecture diagram]
[test: U+1680 before the directive that ends a title of an architecture diagram]
[test: U+2000 before the directive that ends a title of an architecture diagram]
[test: U+2001 before the directive that ends a title of an architecture diagram]
[test: U+2002 before the directive that ends a title of an architecture diagram]
[test: U+2003 before the directive that ends a title of an architecture diagram]
[test: U+2004 before the directive that ends a title of an architecture diagram]
[test: U+2005 before the directive that ends a title of an architecture diagram]
[test: U+2006 before the directive that ends a title of an architecture diagram]
[test: U+2007 before the directive that ends a title of an architecture diagram]
[test: U+2008 before the directive that ends a title of an architecture diagram]
[test: U+2009 before the directive that ends a title of an architecture diagram]
[test: U+200A before the directive that ends a title of an architecture diagram]
[test: U+202F before the directive that ends a title of an architecture diagram]
[test: U+205F before the directive that ends a title of an architecture diagram]
[test: U+FEFF before the directive that ends a title of an architecture diagram]
[test: U+000B before two directives that touch and end a title of an
architecture diagram] [test: U+000B before a directive that a comment touches in
a title of an architecture diagram] [test: U+000B between two directives that
end a title of an architecture diagram] [test: U+000B after the last directive
of a title of an architecture diagram] [test: a semicolon and U+000B before the
directive that ends a title of an architecture diagram] [test: U+000C before two
directives that touch and end a title of an architecture diagram] [test: U+000C
before a directive that a comment touches in a title of an architecture diagram]
[test: U+000C between two directives that end a title of an architecture
diagram] [test: U+000C after the last directive of a title of an architecture
diagram] [test: a semicolon and U+000C before the directive that ends a title of
an architecture diagram] [test: U+1680 before two directives that touch and end
a title of an architecture diagram] [test: U+1680 before a directive that a
comment touches in a title of an architecture diagram] [test: U+1680 between two
directives that end a title of an architecture diagram] [test: U+1680 after the
last directive of a title of an architecture diagram] [test: a semicolon and
U+1680 before the directive that ends a title of an architecture diagram] [test:
U+2000 before two directives that touch and end a title of an architecture
diagram] [test: U+2000 before a directive that a comment touches in a title of
an architecture diagram] [test: U+2000 between two directives that end a title
of an architecture diagram] [test: U+2000 after the last directive of a title of
an architecture diagram] [test: a semicolon and U+2000 before the directive that
ends a title of an architecture diagram] [test: U+2001 before two directives
that touch and end a title of an architecture diagram] [test: U+2001 before a
directive that a comment touches in a title of an architecture diagram] [test:
U+2001 between two directives that end a title of an architecture diagram]
[test: U+2001 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2001 before the directive that ends a title of an
architecture diagram] [test: U+2002 before two directives that touch and end a
title of an architecture diagram] [test: U+2002 before a directive that a
comment touches in a title of an architecture diagram] [test: U+2002 between two
directives that end a title of an architecture diagram] [test: U+2002 after the
last directive of a title of an architecture diagram] [test: a semicolon and
U+2002 before the directive that ends a title of an architecture diagram] [test:
U+2003 before two directives that touch and end a title of an architecture
diagram] [test: U+2003 before a directive that a comment touches in a title of
an architecture diagram] [test: U+2003 between two directives that end a title
of an architecture diagram] [test: U+2003 after the last directive of a title of
an architecture diagram] [test: a semicolon and U+2003 before the directive that
ends a title of an architecture diagram] [test: U+2004 before two directives
that touch and end a title of an architecture diagram] [test: U+2004 before a
directive that a comment touches in a title of an architecture diagram] [test:
U+2004 between two directives that end a title of an architecture diagram]
[test: U+2004 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2004 before the directive that ends a title of an
architecture diagram] [test: U+2005 before two directives that touch and end a
title of an architecture diagram] [test: U+2005 before a directive that a
comment touches in a title of an architecture diagram] [test: U+2005 between two
directives that end a title of an architecture diagram] [test: U+2005 after the
last directive of a title of an architecture diagram] [test: a semicolon and
U+2005 before the directive that ends a title of an architecture diagram] [test:
U+2006 before two directives that touch and end a title of an architecture
diagram] [test: U+2006 before a directive that a comment touches in a title of
an architecture diagram] [test: U+2006 between two directives that end a title
of an architecture diagram] [test: U+2006 after the last directive of a title of
an architecture diagram] [test: a semicolon and U+2006 before the directive that
ends a title of an architecture diagram] [test: U+2007 before two directives
that touch and end a title of an architecture diagram] [test: U+2007 before a
directive that a comment touches in a title of an architecture diagram] [test:
U+2007 between two directives that end a title of an architecture diagram]
[test: U+2007 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2007 before the directive that ends a title of an
architecture diagram] [test: U+2008 before two directives that touch and end a
title of an architecture diagram] [test: U+2008 before a directive that a
comment touches in a title of an architecture diagram] [test: U+2008 between two
directives that end a title of an architecture diagram] [test: U+2008 after the
last directive of a title of an architecture diagram] [test: a semicolon and
U+2008 before the directive that ends a title of an architecture diagram] [test:
U+2009 before two directives that touch and end a title of an architecture
diagram] [test: U+2009 before a directive that a comment touches in a title of
an architecture diagram] [test: U+2009 between two directives that end a title
of an architecture diagram] [test: U+2009 after the last directive of a title of
an architecture diagram] [test: a semicolon and U+2009 before the directive that
ends a title of an architecture diagram] [test: U+200A before two directives
that touch and end a title of an architecture diagram] [test: U+200A before a
directive that a comment touches in a title of an architecture diagram] [test:
U+200A between two directives that end a title of an architecture diagram]
[test: U+200A after the last directive of a title of an architecture diagram]
[test: a semicolon and U+200A before the directive that ends a title of an
architecture diagram] [test: U+202F before two directives that touch and end a
title of an architecture diagram] [test: U+202F before a directive that a
comment touches in a title of an architecture diagram] [test: U+202F between two
directives that end a title of an architecture diagram] [test: U+202F after the
last directive of a title of an architecture diagram] [test: a semicolon and
U+202F before the directive that ends a title of an architecture diagram] [test:
U+205F before two directives that touch and end a title of an architecture
diagram] [test: U+205F before a directive that a comment touches in a title of
an architecture diagram] [test: U+205F between two directives that end a title
of an architecture diagram] [test: U+205F after the last directive of a title of
an architecture diagram] [test: a semicolon and U+205F before the directive that
ends a title of an architecture diagram] [test: a semicolon and U+3000 before
the directive that ends a title of an architecture diagram] [test: U+FEFF before
two directives that touch and end a title of an architecture diagram] [test:
U+FEFF before a directive that a comment touches in a title of an architecture
diagram] [test: U+FEFF between two directives that end a title of an
architecture diagram] [test: U+FEFF after the last directive of a title of an
architecture diagram] [test: a semicolon and U+FEFF before the directive that
ends a title of an architecture diagram] [test: a semicolon and U+2028 before
the directive that ends a title of an architecture diagram] [test: a semicolon
and U+2029 before the directive that ends a title of an architecture diagram]
[test: a semicolon and a tab before the directive that ends a title of an
architecture diagram] [test: released output that the document does not state: a
semicolon that the line rule ignores and spaces before the directive that ends a
title of an architecture diagram] [test: released output that the document does
not state: a semicolon that the line rule ignores before the directive of a
title of an architecture diagram, spaces after it] [test: a semicolon before the
directive of a title of an architecture diagram, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in a
title of an architecture diagram] [test: a comment that ends with a semicolon
after the last directive of a title of an architecture diagram] [test: a comment
that has a space before its semicolon after the last directive of a title of an
architecture diagram] [test: a comment that starts with a semicolon after the
last directive of a title of an architecture diagram] [test: a semicolon inside
the directive that ends a title, spaces after it, of an architecture diagram]
[test: a semicolon inside the directive that ends a title, spaces and a comment
after it, of an architecture diagram] [test: a semicolon inside the directive
that ends a title, a space and a comment after it, of an architecture diagram]
[test: a semicolon inside the last of two directives that end a title, spaces
after it, of an architecture diagram] [test: a semicolon inside the first of two
directives that end a title, spaces between them, of an architecture diagram]
[test: a semicolon inside the first of two directives that end a title, a space
between them, of an architecture diagram] [test: a semicolon inside the only
directive that ends a title, spaces before it, of an architecture diagram]
[test: a semicolon inside the last of two directives that end a title, spaces
before both, of an architecture diagram] [test: a semicolon inside a directive
that a comment touches in a title, spaces before the directive, of an
architecture diagram] [test: a semicolon inside the first of two directives that
touch in a title, spaces before them, of an architecture diagram] [test: a
semicolon inside the directive that ends a title, a no-break space before it, of
an architecture diagram] [test: a semicolon inside the directive that ends a
title, U+2028 before it, of an architecture diagram] [test: a semicolon in the
text, two directives with spaces between them, a title, of an architecture
diagram] [test: a semicolon in the text, two directives with a space between
them, a title, of an architecture diagram] [test: a semicolon and a space before
two directives with spaces between them, a title, of an architecture diagram]
[test: a semicolon in the text, two directives with a tab between them, a title,
of an architecture diagram] [test: a semicolon in the text, two directives that
touch, spaces before them, a title, of an architecture diagram] [test: a
semicolon that touches two directives in a title, of an architecture diagram]
[test: a semicolon that touches the second of two directives in a title, of an
architecture diagram] [test: a semicolon that touches the first of two
directives in a title, of an architecture diagram] [test: a semicolon between
two directives in a title, spaces around it, of an architecture diagram] [test:
a semicolon touching the last of two directives in a title, of an architecture
diagram] [test: a semicolon after the last of two directives in a title, spaces
around it and a comment after it, of an architecture diagram] [test: released
output that the document does not state: a second semicolon touching the
semicolon that the line rule ignores, spaces and a directive after them, in a
title of an architecture diagram] [test: released output that the document does
not state: a second semicolon touching the semicolon that the line rule ignores,
a directive and spaces after them, in a title of an architecture diagram] [test:
released output that the document does not state: a second semicolon touching
the semicolon that the line rule ignores, a directive touching them, in a title
of an architecture diagram] [test: released output that the document does not
state: a second semicolon touching the semicolon that the line rule ignores, a
directive that a comment touches, in a title of an architecture diagram] [test:
released output that the document does not state: a second semicolon touching
the semicolon that the line rule ignores, a directive and a space and a comment,
in a title of an architecture diagram] [test: released output that the document
does not state: spaces and a second semicolon after the semicolon that the line
rule ignores, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a space and a second
semicolon after the semicolon that the line rule ignores, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: a tab and a second semicolon after the semicolon that
the line rule ignores, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: a no-break
space and a second semicolon after the semicolon that the line rule ignores, a
directive after them, in a title of an architecture diagram] [test: released
output that the document does not state: a second semicolon touching the
semicolon that the line rule ignores, a no-break space and a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: a second semicolon touching the semicolon that the line
rule ignores, U+2028 and a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: two semicolons
after the semicolon that the line rule ignores, a directive after them, in a
title of an architecture diagram] [test: released output that the document does
not state: U+2028 and a directive after the semicolon that the line rule
ignores, in a title of an architecture diagram] [test: released output that the
document does not state: U+2029 and a directive after the semicolon that the
line rule ignores, in a title of an architecture diagram] [test: released output
that the document does not state: U+2028, a directive and spaces after the
semicolon that the line rule ignores, in a title of an architecture diagram]
[test: two semicolons that the line rule does not ignore, spaces and a directive
after them, in a title of an architecture diagram] [test: released output that
the document does not state: text and a semicolon after the semicolon that the
line rule does not ignore, spaces and a directive after them, in a title of an
architecture diagram] [test: released output that the document does not state: a
tab and a directive after the semicolon that the line rule ignores, in a title
of an architecture diagram] [test: released output that the document does not
state: a no-break space and a directive after the semicolon that the line rule
ignores, in a title of an architecture diagram] [test: released output that the
document does not state: spaces and a directive that a comment touches after the
semicolon that the line rule ignores, in a title of an architecture diagram]
[test: released output that the document does not state: spaces and two
directives with spaces between them after the semicolon that the line rule
ignores, in a title of an architecture diagram] [test: a semicolon at the end of
a title with whitespace around its text, of an architecture diagram] [test: a
semicolon in the text of a title, spaces and a directive after it, of an
architecture diagram] [test: spaces around a semicolon in the text of a title, a
directive after it, of an architecture diagram] [test: U+000B between two
directives, spaces after the last, in a title of an architecture diagram] [test:
U+000B after the last directive and spaces of a title of an architecture
diagram] [test: U+000C between two directives, spaces after the last, in a title
of an architecture diagram] [test: U+000C after the last directive and spaces of
a title of an architecture diagram] [test: a no-break space after the last
directive and spaces of a title of an architecture diagram] [test: U+1680
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+1680 after the last directive and spaces of a title of an
architecture diagram] [test: U+2000 between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+2000 after the last
directive and spaces of a title of an architecture diagram] [test: U+2001
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+2001 after the last directive and spaces of a title of an
architecture diagram] [test: U+2002 between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+2002 after the last
directive and spaces of a title of an architecture diagram] [test: U+2003
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+2003 after the last directive and spaces of a title of an
architecture diagram] [test: U+2004 between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+2004 after the last
directive and spaces of a title of an architecture diagram] [test: U+2005
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+2005 after the last directive and spaces of a title of an
architecture diagram] [test: U+2006 between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+2006 after the last
directive and spaces of a title of an architecture diagram] [test: U+2007
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+2007 after the last directive and spaces of a title of an
architecture diagram] [test: U+2008 between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+2008 after the last
directive and spaces of a title of an architecture diagram] [test: U+2009
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+2009 after the last directive and spaces of a title of an
architecture diagram] [test: U+200A between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+200A after the last
directive and spaces of a title of an architecture diagram] [test: U+202F
between two directives, spaces after the last, in a title of an architecture
diagram] [test: U+202F after the last directive and spaces of a title of an
architecture diagram] [test: U+205F between two directives, spaces after the
last, in a title of an architecture diagram] [test: U+205F after the last
directive and spaces of a title of an architecture diagram] [test: U+3000 after
the last directive and spaces of a title of an architecture diagram] [test:
U+FEFF between two directives, spaces after the last, in a title of an
architecture diagram] [test: U+FEFF after the last directive and spaces of a
title of an architecture diagram] [test: U+2028 after the last directive and
spaces of a title of an architecture diagram] [test: U+2029 after the last
directive and spaces of a title of an architecture diagram] [test: a no-break
space between two directives, a comment touching the last, in a title of an
architecture diagram] [test: a no-break space between two directives, a space
and a comment after the last, in a title of an architecture diagram] [test: a
no-break space between two directives, spaces and a comment after the last, in a
title of an architecture diagram] [test: a no-break space after the last
directive, a comment touching it, in a title of an architecture diagram] [test:
a no-break space after the last directive, spaces and a comment after it, in a
title of an architecture diagram] [test: a no-break space after the last
directive and spaces, spaces and a comment after it, in a title of an
architecture diagram] [test: a no-break space after the last directive and a
tab, spaces and a comment after it, in a title of an architecture diagram]
[test: U+2003 between two directives, a comment touching the last, in a title of
an architecture diagram] [test: U+2003 between two directives, a space and a
comment after the last, in a title of an architecture diagram] [test: U+2003
between two directives, spaces and a comment after the last, in a title of an
architecture diagram] [test: U+2003 after the last directive, a comment touching
it, in a title of an architecture diagram] [test: U+2003 after the last
directive, spaces and a comment after it, in a title of an architecture diagram]
[test: U+2003 after the last directive and spaces, spaces and a comment after
it, in a title of an architecture diagram] [test: U+2003 after the last
directive and a tab, spaces and a comment after it, in a title of an
architecture diagram] [test: a semicolon in the text, a no-break space between
two directives, in a title of an architecture diagram] [test: a semicolon in the
text, a no-break space after the last directive, in a title of an architecture
diagram] [test: a semicolon inside the directive, a no-break space after it, in
a title of an architecture diagram] [test: released output that the document
does not state: U+000B between a semicolon that the line rule ignores and a
second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+000C between a
semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+1680 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+2000 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+2001 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+2002 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+2003 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+2004 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+2005 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+2006 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+2007 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+2008 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+2009 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+200A between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+202F between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+205F between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: released output that the
document does not state: U+3000 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in a title of an architecture
diagram] [test: released output that the document does not state: U+FEFF between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in a title of an architecture diagram] [test: U+000B before the first of
two directives that a space separates, in a title of an architecture diagram]
[test: U+000B before the first of two directives that spaces separate, in a
title of an architecture diagram] [test: U+000B before a directive that spaces
and a comment follow in a title of an architecture diagram] [test: U+000C before
the first of two directives that a space separates, in a title of an
architecture diagram] [test: U+000C before the first of two directives that
spaces separate, in a title of an architecture diagram] [test: U+000C before a
directive that spaces and a comment follow in a title of an architecture
diagram] [test: a no-break space before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+1680 before the first
of two directives that a space separates, in a title of an architecture diagram]
[test: U+1680 before the first of two directives that spaces separate, in a
title of an architecture diagram] [test: U+1680 before a directive that spaces
and a comment follow in a title of an architecture diagram] [test: U+2000 before
the first of two directives that a space separates, in a title of an
architecture diagram] [test: U+2000 before the first of two directives that
spaces separate, in a title of an architecture diagram] [test: U+2000 before a
directive that spaces and a comment follow in a title of an architecture
diagram] [test: U+2001 before the first of two directives that a space
separates, in a title of an architecture diagram] [test: U+2001 before the first
of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2001 before a directive that spaces and a comment follow in a title of
an architecture diagram] [test: U+2002 before the first of two directives that a
space separates, in a title of an architecture diagram] [test: U+2002 before the
first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2002 before a directive that spaces and a comment follow in a
title of an architecture diagram] [test: U+2003 before the first of two
directives that a space separates, in a title of an architecture diagram] [test:
U+2003 before the first of two directives that spaces separate, in a title of an
architecture diagram] [test: U+2003 before a directive that spaces and a comment
follow in a title of an architecture diagram] [test: U+2004 before the first of
two directives that a space separates, in a title of an architecture diagram]
[test: U+2004 before the first of two directives that spaces separate, in a
title of an architecture diagram] [test: U+2004 before a directive that spaces
and a comment follow in a title of an architecture diagram] [test: U+2005 before
the first of two directives that a space separates, in a title of an
architecture diagram] [test: U+2005 before the first of two directives that
spaces separate, in a title of an architecture diagram] [test: U+2005 before a
directive that spaces and a comment follow in a title of an architecture
diagram] [test: U+2006 before the first of two directives that a space
separates, in a title of an architecture diagram] [test: U+2006 before the first
of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2006 before a directive that spaces and a comment follow in a title of
an architecture diagram] [test: U+2007 before the first of two directives that a
space separates, in a title of an architecture diagram] [test: U+2007 before the
first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2007 before a directive that spaces and a comment follow in a
title of an architecture diagram] [test: U+2008 before the first of two
directives that a space separates, in a title of an architecture diagram] [test:
U+2008 before the first of two directives that spaces separate, in a title of an
architecture diagram] [test: U+2008 before a directive that spaces and a comment
follow in a title of an architecture diagram] [test: U+2009 before the first of
two directives that a space separates, in a title of an architecture diagram]
[test: U+2009 before the first of two directives that spaces separate, in a
title of an architecture diagram] [test: U+2009 before a directive that spaces
and a comment follow in a title of an architecture diagram] [test: U+200A before
the first of two directives that a space separates, in a title of an
architecture diagram] [test: U+200A before the first of two directives that
spaces separate, in a title of an architecture diagram] [test: U+200A before a
directive that spaces and a comment follow in a title of an architecture
diagram] [test: U+202F before the first of two directives that a space
separates, in a title of an architecture diagram] [test: U+202F before the first
of two directives that spaces separate, in a title of an architecture diagram]
[test: U+202F before a directive that spaces and a comment follow in a title of
an architecture diagram] [test: U+205F before the first of two directives that a
space separates, in a title of an architecture diagram] [test: U+205F before the
first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+205F before a directive that spaces and a comment follow in a
title of an architecture diagram] [test: U+3000 before the first of two
directives that spaces separate, in a title of an architecture diagram] [test:
U+FEFF before the first of two directives that a space separates, in a title of
an architecture diagram] [test: U+FEFF before the first of two directives that
spaces separate, in a title of an architecture diagram] [test: U+FEFF before a
directive that spaces and a comment follow in a title of an architecture
diagram] [test: a run before the directive after a U+2028 inside the text of a
title of an architecture diagram] [test: spaces after the directive after a
U+2028 inside the text of a title of an architecture diagram] [test: spaces
after the directive after a U+2029 inside the text of a title of an architecture
diagram] [test: spaces between two directives after a U+2028 inside the text of
a title of an architecture diagram] [test: a tab after the directive after a
U+2028 inside the text of a title of an architecture diagram] [test: a run
before two directives that touch after a U+2028 inside the text of a title of an
architecture diagram] [test: U+000B and spaces before the first of two
directives that spaces separate, in a title of an architecture diagram] [test:
U+000C and spaces before the first of two directives that spaces separate, in a
title of an architecture diagram] [test: a no-break space and spaces before the
first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+1680 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+2000 and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2001 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+2002 and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2003 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+2004 and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2005 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+2006 and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2007 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+2008 and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+2009 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+200A and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+202F and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+205F and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: U+3000 and spaces before the first of two directives that spaces
separate, in a title of an architecture diagram] [test: U+FEFF and spaces before
the first of two directives that spaces separate, in a title of an architecture
diagram] [test: a no-break space and a tab before the first of two directives
that a space separates, in a title of an architecture diagram] [test: a no-break
space before the first of two directives that a tab separates, in a title of an
architecture diagram] [test: U+2003 and a tab before the first of two directives
that a space separates, in a title of an architecture diagram] [test: U+2003
before the first of two directives that a tab separates, in a title of an
architecture diagram] [test: U+2028 before the first of two directives that a
tab separates, in a title of an architecture diagram] [test: U+2029 before the
first of two directives that a tab separates, in a title of an architecture
diagram] [test: a U+2028 inside the directive that ends a title, spaces before
it, of an architecture diagram] [test: a U+2028 inside the directive that ends a
title, spaces after it, of an architecture diagram] [test: a U+2029 inside the
directive that ends a title, spaces before it, of an architecture diagram]
[test: a U+2029 inside the directive that ends a title, spaces after it, of an
architecture diagram] [test: a line break inside the directive that ends a
title, spaces before it, of an architecture diagram] [test: a line break inside
the directive that ends a title, spaces after it, of an architecture diagram]
[test: a U+2028 inside the first of two directives that spaces separate, in a
title of an architecture diagram] [test: a U+2028 inside the last of two
directives, spaces before both, in a title of an architecture diagram] [test: a
U+2028 inside the first of two directives that touch, spaces before them, in a
title of an architecture diagram] [test: a U+2028 inside the directive that ends
a title, a no-break space before it, of an architecture diagram] [test: a U+2028
inside a directive that a comment touches in a title, spaces before it, of an
architecture diagram] [test: a U+2028 inside a directive that spaces and a
comment follow in a title, of an architecture diagram] [test: a line break
inside the first of two directives that spaces separate, in a title of an
architecture diagram] [test: a line break inside the last of two directives,
spaces before both, in a title of an architecture diagram] [test: a line break
inside the first of two directives that touch, spaces before them, in a title of
an architecture diagram] [test: a line break inside the directive that ends a
title, a no-break space before it, of an architecture diagram] [test: a line
break inside a directive that a comment touches in a title, spaces before it, of
an architecture diagram] [test: a line break inside a directive that spaces and
a comment follow in a title, of an architecture diagram] [test: a tab between
the keyword and the directive of a title of directives only of an architecture
diagram] [test: spaces between the keyword and the directive of a title of
directives only of an architecture diagram] [test: spaces after the directive of
a title of directives only of an architecture diagram] [test: spaces on both
sides of the directive of a title of directives only of an architecture diagram]
[test: two directives that spaces separate, a title of directives only of an
architecture diagram] [test: two directives that touch, spaces before them, a
title of directives only of an architecture diagram] [test: a comment that
touches the directive of a title of directives only of an architecture diagram]
[test: a space and a comment after the directive of a title of directives only
of an architecture diagram] [test: a wide space before two directives that
spaces separate, one space before the first directive, in a title of an
architecture diagram] [test: a wide space before two directives that spaces
separate, a run of spaces before the first directive, in a title of an
architecture diagram] [test: a wide space before two directives that spaces
separate, a tab before the first directive, in a title of an architecture
diagram] [test: a wide space before two directives that spaces separate, U+2028
before the first directive, in a title of an architecture diagram] [test: a wide
space before two directives that spaces separate, U+2029 before the first
directive, in a title of an architecture diagram] [test: a wide space before two
directives that spaces separate, a no-break space between the two directives, in
a title of an architecture diagram] [test: a wide space before two directives
that spaces separate, U+2028 between the two directives, in a title of an
architecture diagram] [test: a wide space before two directives that spaces
separate, U+2029 between the two directives, in a title of an architecture
diagram] [test: a wide space before two directives that spaces separate, the
first directive holds a line break inside, in a title of an architecture
diagram] [test: a wide space before two directives that spaces separate, the
last directive holds a line break inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the first
directive holds a `;` inside, in a title of an architecture diagram] [test: a
wide space before two directives that spaces separate, the last directive holds
a `;` inside, in a title of an architecture diagram] [test: a wide space before
two directives that spaces separate, the first directive holds a U+2028 inside,
in a title of an architecture diagram] [test: a wide space before two directives
that spaces separate, the last directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a wide space before two directives that spaces
separate, a comment touching the last directive, in a title of an architecture
diagram] [test: a wide space before two directives that spaces separate, a value
of directives only, in a title of an architecture diagram] [test: a wide space
before a directive that spaces and a comment follow, one space before the first
directive, in a title of an architecture diagram] [test: a wide space before a
directive that spaces and a comment follow, a run of spaces before the first
directive, in a title of an architecture diagram] [test: a wide space before a
directive that spaces and a comment follow, a tab before the first directive, in
a title of an architecture diagram] [test: a wide space before a directive that
spaces and a comment follow, one space after the last directive, in a title of
an architecture diagram] [test: a wide space before a directive that spaces and
a comment follow, a tab after the last directive, in a title of an architecture
diagram] [test: a wide space before a directive that spaces and a comment
follow, a no-break space after the last directive, in a title of an architecture
diagram] [test: a wide space before a directive that spaces and a comment
follow, the first directive holds a line break inside, in a title of an
architecture diagram] [test: a wide space before a directive that spaces and a
comment follow, the first directive holds a `;` inside, in a title of an
architecture diagram] [test: a wide space before a directive that spaces and a
comment follow, the first directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a wide space before a directive that spaces and a
comment follow, a second directive touching the first, in a title of an
architecture diagram] [test: a wide space before a directive that spaces and a
comment follow, a second directive after a space, in a title of an architecture
diagram] [test: a wide space before a directive that spaces and a comment
follow, a value of directives only, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches
the last, in a title of an architecture diagram] [test: a wide space before two
directives that touch and a comment that touches the last, one space before the
first directive, in a title of an architecture diagram] [test: a wide space
before two directives that touch and a comment that touches the last, a run of
spaces before the first directive, in a title of an architecture diagram] [test:
a wide space before two directives that touch and a comment that touches the
last, a tab before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches
the last, one space after the last directive, in a title of an architecture
diagram] [test: a wide space before two directives that touch and a comment that
touches the last, a tab after the last directive, in a title of an architecture
diagram] [test: a wide space before two directives that touch and a comment that
touches the last, a no-break space after the last directive, in a title of an
architecture diagram] [test: a wide space before two directives that touch and a
comment that touches the last, the first directive holds a line break inside, in
a title of an architecture diagram] [test: a wide space before two directives
that touch and a comment that touches the last, the last directive holds a line
break inside, in a title of an architecture diagram] [test: a wide space before
two directives that touch and a comment that touches the last, the first
directive holds a `;` inside, in a title of an architecture diagram] [test: a
wide space before two directives that touch and a comment that touches the last,
the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches
the last, the first directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a wide space before two directives that touch and a
comment that touches the last, the last directive holds a U+2028 inside, in a
title of an architecture diagram] [test: a wide space before two directives that
touch and a comment that touches the last, a value of directives only, in a
title of an architecture diagram] [test: a U+2028 before two directives that
touch, one space before the first directive, in a title of an architecture
diagram] [test: a U+2028 before two directives that touch, a run of spaces
before the first directive, in a title of an architecture diagram] [test: a
U+2028 before two directives that touch, a tab before the first directive, in a
title of an architecture diagram] [test: a U+2028 before two directives that
touch, one space after the last directive, in a title of an architecture
diagram] [test: a U+2028 before two directives that touch, a run of spaces after
the last directive, in a title of an architecture diagram] [test: a U+2028
before two directives that touch, a tab after the last directive, in a title of
an architecture diagram] [test: a U+2028 before two directives that touch, a
no-break space after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, U+2028 after the last
directive, in a title of an architecture diagram] [test: a U+2028 before two
directives that touch, U+2029 after the last directive, in a title of an
architecture diagram] [test: a U+2028 before two directives that touch, the
first directive holds a line break inside, in a title of an architecture
diagram] [test: a U+2028 before two directives that touch, the last directive
holds a line break inside, in a title of an architecture diagram] [test: a
U+2028 before two directives that touch, the first directive holds a `;` inside,
in a title of an architecture diagram] [test: a U+2028 before two directives
that touch, the last directive holds a `;` inside, in a title of an architecture
diagram] [test: a U+2028 before two directives that touch, the first directive
holds a U+2028 inside, in a title of an architecture diagram] [test: a U+2028
before two directives that touch, the last directive holds a U+2028 inside, in a
title of an architecture diagram] [test: a U+2028 before two directives that
touch, a value of directives only, in a title of an architecture diagram] [test:
a U+2028 before a directive that spaces follow, in a title of an architecture
diagram] [test: a U+2028 before a directive that spaces follow, one space before
the first directive, in a title of an architecture diagram] [test: a U+2028
before a directive that spaces follow, a run of spaces before the first
directive, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces follow, a tab before the first directive, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces follow,
U+2029 before the first directive, in a title of an architecture diagram] [test:
a U+2028 before a directive that spaces follow, one space after the last
directive, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces follow, a tab after the last directive, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces follow, a
no-break space after the last directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, U+2028 after the last
directive, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces follow, U+2029 after the last directive, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces follow, the
first directive holds a line break inside, in a title of an architecture
diagram] [test: a U+2028 before a directive that spaces follow, the first
directive holds a `;` inside, in a title of an architecture diagram] [test: a
U+2028 before a directive that spaces follow, the first directive holds a U+2028
inside, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces follow, a second directive after a space, in a title of an
architecture diagram] [test: a U+2028 before two directives that spaces
separate, a no-break space between the two directives, in a title of an
architecture diagram] [test: a U+2028 before two directives that spaces
separate, U+2028 between the two directives, in a title of an architecture
diagram] [test: a U+2028 before two directives that spaces separate, U+2029
between the two directives, in a title of an architecture diagram] [test: a
U+2028 before two directives that spaces separate, the first directive holds a
line break inside, in a title of an architecture diagram] [test: a U+2028 before
two directives that spaces separate, the last directive holds a line break
inside, in a title of an architecture diagram] [test: a U+2028 before two
directives that spaces separate, the first directive holds a `;` inside, in a
title of an architecture diagram] [test: a U+2028 before two directives that
spaces separate, the last directive holds a `;` inside, in a title of an
architecture diagram] [test: a U+2028 before two directives that spaces
separate, the first directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a U+2028 before two directives that spaces
separate, the last directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a directive that holds a line break, spaces before
it, one space before the first directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a tab before the
first directive, in a title of an architecture diagram] [test: a directive that
holds a line break, spaces before it, U+2028 before the first directive, in a
title of an architecture diagram] [test: a directive that holds a line break,
spaces before it, U+2029 before the first directive, in a title of an
architecture diagram] [test: a directive that holds a line break, spaces before
it, one space after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a tab after the
last directive, in a title of an architecture diagram] [test: a directive that
holds a line break, spaces before it, a no-break space after the last directive,
in a title of an architecture diagram] [test: a directive that holds a line
break, spaces before it, U+2028 after the last directive, in a title of an
architecture diagram] [test: a directive that holds a line break, spaces before
it, U+2029 after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a second directive
after a space, in a title of an architecture diagram] [test: a directive that
holds a line break, spaces before it, a value of directives only, in a title of
an architecture diagram] [test: a directive that holds a U+2028, spaces before
it, one space before the first directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, a tab before the first
directive, in a title of an architecture diagram] [test: a directive that holds
a U+2028, spaces before it, U+2028 before the first directive, in a title of an
architecture diagram] [test: a directive that holds a U+2028, spaces before it,
U+2029 before the first directive, in a title of an architecture diagram] [test:
a directive that holds a U+2028, spaces before it, one space after the last
directive, in a title of an architecture diagram] [test: a directive that holds
a U+2028, spaces before it, a tab after the last directive, in a title of an
architecture diagram] [test: a directive that holds a U+2028, spaces before it,
a no-break space after the last directive, in a title of an architecture
diagram] [test: a directive that holds a U+2028, spaces before it, U+2028 after
the last directive, in a title of an architecture diagram] [test: a directive
that holds a U+2028, spaces before it, U+2029 after the last directive, in a
title of an architecture diagram] [test: a directive that holds a U+2028, spaces
before it, a second directive after a space, in a title of an architecture
diagram] [test: a directive that holds a U+2028, spaces before it, a value of
directives only, in a title of an architecture diagram] [test: a U+2028 inside
the text, spaces before the directive, one space before the first directive, in
a title of an architecture diagram] [test: a U+2028 inside the text, spaces
before the directive, a tab before the first directive, in a title of an
architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, a no-break space before the first directive, in a title of an
architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, U+2028 before the first directive, in a title of an architecture
diagram] [test: a U+2028 inside the text, spaces before the directive, U+2029
before the first directive, in a title of an architecture diagram] [test: a
U+2028 inside the text, spaces before the directive, one space after the last
directive, in a title of an architecture diagram] [test: a U+2028 inside the
text, spaces before the directive, a tab after the last directive, in a title of
an architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, a no-break space after the last directive, in a title of an
architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, U+2028 after the last directive, in a title of an architecture
diagram] [test: a U+2028 inside the text, spaces before the directive, U+2029
after the last directive, in a title of an architecture diagram] [test: a U+2028
inside the text, spaces before the directive, the first directive holds a line
break inside, in a title of an architecture diagram] [test: a U+2028 inside the
text, spaces before the directive, the first directive holds a `;` inside, in a
title of an architecture diagram] [test: a U+2028 inside the text, spaces before
the directive, the first directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, a second directive touching the first, in a title of an architecture
diagram] [test: a U+2028 inside the text, spaces before the directive, a second
directive after a space, in a title of an architecture diagram] [test: a U+2028
inside the text, spaces before the directive, a comment touching the last
directive, in a title of an architecture diagram] [test: a U+2028 inside the
text, spaces before the directive, a value of directives only, in a title of an
architecture diagram] [test: a value of directives only, spaces after the
directive, a tab before the first directive, in a title of an architecture
diagram] [test: a value of directives only, spaces after the directive, one
space after the last directive, in a title of an architecture diagram] [test: a
value of directives only, spaces after the directive, a tab after the last
directive, in a title of an architecture diagram] [test: a value of directives
only, spaces after the directive, a no-break space after the last directive, in
a title of an architecture diagram] [test: a value of directives only, spaces
after the directive, U+2028 after the last directive, in a title of an
architecture diagram] [test: a value of directives only, spaces after the
directive, U+2029 after the last directive, in a title of an architecture
diagram] [test: a value of directives only, spaces after the directive, the
first directive holds a line break inside, in a title of an architecture
diagram] [test: a value of directives only, spaces after the directive, the
first directive holds a `;` inside, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, the first
directive holds a U+2028 inside, in a title of an architecture diagram] [test: a
value of directives only, spaces after the directive, a second directive
touching the first, in a title of an architecture diagram] [test: a value of
directives only, spaces after the directive, a second directive after a space,
in a title of an architecture diagram] [test: a directive inside the text,
spaces before and after the last directive, in a title of an architecture
diagram] [test: a directive inside the text, spaces before and after the last
directive, one space before the first directive, in a title of an architecture
diagram] [test: a directive inside the text, spaces before and after the last
directive, a tab before the first directive, in a title of an architecture
diagram] [test: a directive inside the text, spaces before and after the last
directive, a no-break space before the first directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, U+2028 before the first directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, U+2029 before the first directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, one space after the last directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, a tab after the last directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, a no-break space after the last directive, in a title
of an architecture diagram] [test: a directive inside the text, spaces before
and after the last directive, U+2028 after the last directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, U+2029 after the last directive, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, the first directive holds a line break inside, in a
title of an architecture diagram] [test: a directive inside the text, spaces
before and after the last directive, the first directive holds a `;` inside, in
a title of an architecture diagram] [test: a directive inside the text, spaces
before and after the last directive, the first directive holds a U+2028 inside,
in a title of an architecture diagram] [test: a directive inside the text,
spaces before and after the last directive, a second directive touching the
first, in a title of an architecture diagram] [test: a directive inside the
text, spaces before and after the last directive, a second directive after a
space, in a title of an architecture diagram] [test: a directive inside the
text, spaces before and after the last directive, a comment touching the last
directive, in a title of an architecture diagram] [test: a directive inside the
text, spaces before and after the last directive, a value of directives only, in
a title of an architecture diagram] [test: a `;` in the text, spaces before the
directive, one space before the first directive, in a title of an architecture
diagram] [test: a `;` in the text, spaces before the directive, one space after
the last directive, in a title of an architecture diagram] [test: a `;` in the
text, spaces before the directive, U+2028 after the last directive, in a title
of an architecture diagram] [test: a `;` in the text, spaces before the
directive, U+2029 after the last directive, in a title of an architecture
diagram] [test: a `;` in the text, spaces before the directive, the first
directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the first directive holds
a `;` inside, in a title of an architecture diagram] [test: a `;` in the text,
spaces before the directive, the first directive holds a U+2028 inside, in a
title of an architecture diagram] [test: a `;` in the text, spaces between two
directives, a tab before the first directive, in a title of an architecture
diagram] [test: a `;` in the text, spaces between two directives, a no-break
space before the first directive, in a title of an architecture diagram] [test:
a `;` in the text, spaces between two directives, U+2028 before the first
directive, in a title of an architecture diagram] [test: a `;` in the text,
spaces between two directives, U+2029 before the first directive, in a title of
an architecture diagram] [test: a `;` in the text, spaces between two
directives, a tab between the two directives, in a title of an architecture
diagram] [test: a `;` in the text, spaces between two directives, U+2028 between
the two directives, in a title of an architecture diagram] [test: a `;` in the
text, spaces between two directives, U+2029 between the two directives, in a
title of an architecture diagram] [test: a `;` in the text, spaces between two
directives, the first directive holds a line break inside, in a title of an
architecture diagram] [test: a `;` in the text, spaces between two directives,
the last directive holds a line break inside, in a title of an architecture
diagram] [test: a `;` in the text, spaces between two directives, the first
directive holds a `;` inside, in a title of an architecture diagram] [test: a
`;` in the text, spaces between two directives, the last directive holds a `;`
inside, in a title of an architecture diagram] [test: a `;` in the text, spaces
between two directives, the first directive holds a U+2028 inside, in a title of
an architecture diagram] [test: a `;` in the text, spaces between two
directives, the last directive holds a U+2028 inside, in a title of an
architecture diagram] [test: a `;` in the text, spaces between two directives, a
comment touching the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, one space before the
first directive, in a title of an architecture diagram] [test: a `;` between two
directives, spaces around it, a tab before the first directive, in a title of an
architecture diagram] [test: a `;` between two directives, spaces around it, a
no-break space before the first directive, in a title of an architecture
diagram] [test: a `;` between two directives, spaces around it, U+2028 before
the first directive, in a title of an architecture diagram] [test: a `;` between
two directives, spaces around it, U+2029 before the first directive, in a title
of an architecture diagram] [test: a `;` between two directives, spaces around
it, one space after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a run of spaces after the
last directive, in a title of an architecture diagram] [test: a `;` between two
directives, spaces around it, a tab after the last directive, in a title of an
architecture diagram] [test: a `;` between two directives, spaces around it, a
no-break space after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, U+2028 after the last
directive, in a title of an architecture diagram] [test: a `;` between two
directives, spaces around it, U+2029 after the last directive, in a title of an
architecture diagram] [test: a `;` between two directives, spaces around it, the
first directive holds a line break inside, in a title of an architecture
diagram] [test: a `;` between two directives, spaces around it, the last
directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the first directive holds
a `;` inside, in a title of an architecture diagram] [test: a `;` between two
directives, spaces around it, the last directive holds a `;` inside, in a title
of an architecture diagram] [test: a `;` between two directives, spaces around
it, the first directive holds a U+2028 inside, in a title of an architecture
diagram] [test: a `;` between two directives, spaces around it, the last
directive holds a U+2028 inside, in a title of an architecture diagram] [test: a
`;` between two directives, spaces around it, one directive only, in a title of
an architecture diagram] [test: a `;` between two directives, spaces around it,
a comment touching the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a value of directives
only, in a title of an architecture diagram] [test: a `;` after the last
directive, one space before the first directive, in a title of an architecture
diagram] [test: a `;` after the last directive, a tab before the first
directive, in a title of an architecture diagram] [test: a `;` after the last
directive, a no-break space before the first directive, in a title of an
architecture diagram] [test: a `;` after the last directive, U+2028 before the
first directive, in a title of an architecture diagram] [test: a `;` after the
last directive, U+2029 before the first directive, in a title of an architecture
diagram] [test: a `;` after the last directive, the first directive holds a line
break inside, in a title of an architecture diagram] [test: a `;` after the last
directive, the first directive holds a `;` inside, in a title of an architecture
diagram] [test: a `;` after the last directive, the first directive holds a
U+2028 inside, in a title of an architecture diagram] [test: a `;` after the
last directive, a second directive touching the first, in a title of an
architecture diagram] [test: a `;` after the last directive, a second directive
after a space, in a title of an architecture diagram] [test: a `;` after the
last directive, a comment touching the last directive, in a title of an
architecture diagram] [test: a `;` after the last directive, a value of
directives only, in a title of an architecture diagram] [test: a U+2028 before
two directives that a wide space separates, a comment after them, one space
before the first directive, in a title of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
a tab before the first directive, in a title of an architecture diagram] [test:
a U+2028 before two directives that a wide space separates, a comment after
them, a no-break space before the first directive, in a title of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a value of directives only, in a title of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, one space before the first directive, in a title of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, a tab before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
value of directives only, in a title of an architecture diagram] [test: a `;`
after the last directive, a U+2028 before the directives, a comment after it, in
a title of an architecture diagram] [test: a `;` after the last directive, a
U+2028 before the directives, a comment after it, one space before the first
directive, in a title of an architecture diagram] [test: a `;` after the last
directive, a U+2028 before the directives, a comment after it, a run of spaces
before the first directive, in a title of an architecture diagram] [test: a `;`
after the last directive, a U+2028 before the directives, a comment after it, a
tab before the first directive, in a title of an architecture diagram] [test: a
`;` after the last directive, a U+2028 before the directives, a comment after
it, a no-break space before the first directive, in a title of an architecture
diagram] [test: a `;` after the last directive, a U+2028 before the directives,
a comment after it, U+2029 before the first directive, in a title of an
architecture diagram] [test: a `;` after the last directive, a U+2028 before the
directives, a comment after it, the first directive holds a line break inside,
in a title of an architecture diagram] [test: a `;` after the last directive, a
U+2028 before the directives, a comment after it, the first directive holds a
`;` inside, in a title of an architecture diagram] [test: a `;` after the last
directive, a U+2028 before the directives, a comment after it, the first
directive holds a U+2028 inside, in a title of an architecture diagram] [test: a
`;` after the last directive, a U+2028 before the directives, a comment after
it, a second directive touching the first, in a title of an architecture
diagram] [test: a `;` after the last directive, a U+2028 before the directives,
a comment after it, a second directive after a space, in a title of an
architecture diagram] [test: a `;` after the last directive, a U+2028 before the
directives, a comment after it, no comment, in a title of an architecture
diagram] [test: a `;` after the last directive, a U+2028 before the directives,
a comment after it, a value of directives only, in a title of an architecture
diagram] [test: a `;` between two directives, a U+2028 before the directives, a
comment after them, in a title of an architecture diagram] [test: a `;` between
two directives, a U+2028 before the directives, a comment after them, one space
before the first directive, in a title of an architecture diagram] [test: a `;`
between two directives, a U+2028 before the directives, a comment after them, a
run of spaces before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment
after them, a tab before the first directive, in a title of an architecture
diagram] [test: a `;` between two directives, a U+2028 before the directives, a
comment after them, a no-break space before the first directive, in a title of
an architecture diagram] [test: a `;` between two directives, a U+2028 before
the directives, a comment after them, U+2029 before the first directive, in a
title of an architecture diagram] [test: a `;` between two directives, a U+2028
before the directives, a comment after them, the first directive holds a line
break inside, in a title of an architecture diagram] [test: a `;` between two
directives, a U+2028 before the directives, a comment after them, the last
directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment
after them, the first directive holds a `;` inside, in a title of an
architecture diagram] [test: a `;` between two directives, a U+2028 before the
directives, a comment after them, the last directive holds a `;` inside, in a
title of an architecture diagram] [test: a `;` between two directives, a U+2028
before the directives, a comment after them, the first directive holds a U+2028
inside, in a title of an architecture diagram] [test: a `;` between two
directives, a U+2028 before the directives, a comment after them, the last
directive holds a U+2028 inside, in a title of an architecture diagram] [test: a
`;` between two directives, a U+2028 before the directives, a comment after
them, no comment, in a title of an architecture diagram] [test: a `;` between
two directives, a U+2028 before the directives, a comment after them, a value of
directives only, in a title of an architecture diagram] [test: a U+2028 after
the last directive that spaces and a comment follow, one space after the last
directive, in a title of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a tab after the last directive, in a
title of an architecture diagram] [test: a U+2028 after the last directive that
spaces and a comment follow, no comment, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one,
one space between the two directives, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one,
a run of spaces between the two directives, in a title of an architecture
diagram] [test: a U+2028 between two directives, spaces and a comment after the
last one, a tab between the two directives, in a title of an architecture
diagram] [test: a U+2028 between two directives, spaces and a comment after the
last one, a no-break space between the two directives, in a title of an
architecture diagram] [test: a U+2028 between two directives, spaces and a
comment after the last one, no comment, in a title of an architecture diagram]
[test: a directive, a `;`, two spaces, a directive, in a title of directives
only of an architecture diagram] [test: a directive, a space, a `;`, two spaces,
a directive, in a title of directives only of an architecture diagram] [test: a
directive, a tab, a `;`, two spaces, a directive, in a title of directives only
of an architecture diagram] [test: a directive, a no-break space, a `;`, two
spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, U+3000, a `;`, two spaces, a directive, in a title of
directives only of an architecture diagram] [test: a directive, a vertical tab,
a `;`, two spaces, a directive, in a title of directives only of an architecture
diagram] [test: a directive, a form feed, a `;`, two spaces, a directive, in a
title of directives only of an architecture diagram] [test: a directive, U+2028,
a `;`, two spaces, a directive, in a title of directives only of an architecture
diagram] [test: a directive, U+2029, a `;`, two spaces, a directive, in a title
of directives only of an architecture diagram] [test: a directive, a space,
U+2028, a `;`, two spaces, a directive, in a title of directives only of an
architecture diagram] [test: a directive, U+2028, a space, a `;`, two spaces, a
directive, in a title of directives only of an architecture diagram] [test: a
directive, two spaces, a `;`, a directive, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, a space, a
directive, in a title of directives only of an architecture diagram] [test: a
directive, two spaces, a `;`, a tab, a directive, in a title of directives only
of an architecture diagram] [test: a directive, two spaces, a `;`, a no-break
space, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, U+3000, a directive, in a title of
directives only of an architecture diagram] [test: a directive, two spaces, a
`;`, U+2028, a directive, in a title of directives only of an architecture
diagram] [test: a directive, two spaces, a `;`, U+2029, a directive, in a title
of directives only of an architecture diagram] [test: a directive, two spaces, a
`;`, a space, U+2028, a directive, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, two spaces, a
directive, a space, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, in a
title of directives only of an architecture diagram] [test: a directive, two
spaces, a `;`, two spaces, a directive, a tab, in a title of directives only of
an architecture diagram] [test: a directive, two spaces, a `;`, two spaces, a
directive, a no-break space, in a title of directives only of an architecture
diagram] [test: a directive, two spaces, a `;`, two spaces, a directive, U+3000,
in a title of directives only of an architecture diagram] [test: a directive,
two spaces, a `;`, two spaces, a directive, a vertical tab, in a title of
directives only of an architecture diagram] [test: a directive, two spaces, a
`;`, two spaces, a directive, U+2028, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, two spaces, a
directive, U+2029, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a comment, in a
title of directives only of an architecture diagram] [test: a directive, two
spaces, a `;`, two spaces, a directive, a space, a comment, in a title of
directives only of an architecture diagram] [test: a directive, two spaces, a
`;`, two spaces, a directive, a tab, a comment, in a title of directives only of
an architecture diagram] [test: a directive, two spaces, a `;`, two spaces, a
directive, a no-break space, a comment, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, in a title of
directives only of an architecture diagram] [test: a directive, a `;`, two
spaces, in a title of directives only of an architecture diagram] [test: a
directive, two spaces, a `;`, two spaces, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, a comment, in a
title of directives only of an architecture diagram] [test: a directive, a `;`,
a space, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a comment, in a title of
directives only of an architecture diagram] [test: a directive, a `;`, a
comment, in a title of directives only of an architecture diagram] [test: a
directive, two spaces, a `;`, a tab, a comment, in a title of directives only of
an architecture diagram] [test: a directive, a `;`, a `;`, in a title of
directives only of an architecture diagram] [test: a directive, two spaces, a
`;`, a `;`, in a title of directives only of an architecture diagram] [test: a
directive, a `;`, two spaces, a `;`, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, two spaces, a `;`,
in a title of directives only of an architecture diagram] [test: a directive,
two spaces, a `;`, two spaces, a `;`, two spaces, a directive, in a title of
directives only of an architecture diagram] [test: a directive, a `;`, a `;`,
two spaces, a directive, in a title of directives only of an architecture
diagram] [test: a directive, a directive, two spaces, a `;`, two spaces, a
directive, in a title of directives only of an architecture diagram] [test: a
directive, two spaces, a `;`, two spaces, a directive, a directive, in a title
of directives only of an architecture diagram] [test: a directive, a `;`, a
directive, a `;`, a directive, in a title of directives only of an architecture
diagram] [test: a directive, two spaces, a `;`, two spaces, a directive, two
spaces, a `;`, two spaces, a directive, in a title of directives only of an
architecture diagram] [test: a directive, two spaces, a `;`, two spaces, a
directive, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a
`;`, in a title of directives only of an architecture diagram] [test: a
directive, two spaces, a directive, two spaces, a `;`, two spaces, a directive,
in a title of directives only of an architecture diagram] [test: a directive,
two spaces, a `;`, two spaces, a directive, two spaces, a directive, in a title
of directives only of an architecture diagram] [test: a directive, a `;`, two
spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of
directives only of an architecture diagram] [test: a directive, a `;`, a
directive, a `;`, in a title of directives only of an architecture diagram]
[test: a `;`, a directive, in a title of directives only of an architecture
diagram] [test: a `;`, two spaces, a directive, in a title of directives only of
an architecture diagram] [test: a directive, a `;`, two spaces, a `;`, two
spaces, in a title of directives only of an architecture diagram] [test: a `;`
in the comment after the last directive, two spaces around the `;` between two
directives, in a title of directives only of an architecture diagram] [test: a
directive, a `;`, a no-break space, a `;`, two spaces, a directive, in a title
of directives only of an architecture diagram] [test: a directive, a no-break
space, a `;`, two spaces, a `;`, two spaces, a directive, in a title of
directives only of an architecture diagram] [test: a directive, a `;`, U+2028, a
`;`, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a no-break space, two spaces,
a `;`, two spaces, a directive, in a title of directives only of an architecture
diagram] [test: a directive, a `;`, a no-break space, a `;`, two spaces, a `;`,
two spaces, a directive, in a title of directives only of an architecture
diagram] [test: a directive, U+2028, a `;`, two spaces, a `;`, two spaces, a
directive, in a title of directives only of an architecture diagram] [test: two
U+2028 before the directive that ends a title, of an architecture diagram]
[test: two U+2029 before the directive that ends a title, of an architecture
diagram] [test: U+2028 and U+2029 before the directive that ends a title, of an
architecture diagram] [test: two U+2028 before the directive that ends a title,
spaces after it, of an architecture diagram] [test: U+2029 and U+2028 before the
directive that ends a title, spaces after it, of an architecture diagram] [test:
two U+2028 before two directives that touch and end a title, of an architecture
diagram] [test: two U+2028 before a directive that a space and another directive
follow in a title, of an architecture diagram] [test: a U+2028 inside the
directive that ends a title, spaces before it, a comment after two spaces, of an
architecture diagram] [test: a U+2028 inside the directive of a title of
directives only, spaces before and after it, of an architecture diagram] [test:
a directive that starts the text of a title, two spaces and a text after it,
spaces at the end, of an architecture diagram] [test: a directive that starts
the text of a title, a space and a text after it, of an architecture diagram]
[test: two directives that touch and start the text of a title, two spaces and a
text after them, spaces at the end, of an architecture diagram] [test: two
directives that touch and start the text of a title, a tab and a text after
them, of an architecture diagram] [test: a directive that starts the text of a
title, a text with a run of spaces inside it, spaces at the end, of an
architecture diagram] [test: a directive that starts the text of a title, a text
with a tab inside it, a tab at the end, of an architecture diagram] [test: two
spaces before the directive that starts the text of a title, of an architecture
diagram] [test: two directives with spaces between them that start the text of a
title, of an architecture diagram] [test: a directive that starts the text of a
title and a directive that ends it, of an architecture diagram] [test: a U+2028
inside the directive that starts the text of a title, two spaces and a text
after it, spaces at the end, of an architecture diagram] [test: a line break
inside the directive that starts the text of a title, two spaces and a text
after it, spaces at the end, of an architecture diagram] [test: a `;` inside the
directive that starts the text of a title, two spaces and a text after it,
spaces at the end, of an architecture diagram] [test: a `;` at the end of a
title, spaces after the keyword, of an architecture diagram] [test: a `;` at the
end of a title, a run of spaces inside the text, of an architecture diagram]
[test: a `;` at the end of a title, spaces after it, of an architecture diagram]
[test: a `;` after spaces at the end of a title, spaces after it, of an
architecture diagram] [test: a text after the `;` of a title, spaces at the end,
of an architecture diagram] [test: released output that the document does not
state: a `;` inside the comment after the text of a title, spaces at the end, of
an architecture diagram] [test: a `;` at the end of a title, U+3000 after it, of
an architecture diagram] [test: released output that the document does not
state: a U+2028 in the text of a title that ends with a `;`, of an architecture
diagram] [test: a comment after the text of a title, spaces before it, of an
architecture diagram] [test: a run of spaces inside the text of a title, of an
architecture diagram] [test: a run of tabs inside the text of a title, spaces at
the end, of an architecture diagram] [test: a run of spaces inside a quoted
string in a title, of an architecture diagram] [test: a run of spaces beside a
directive inside the text of a title, of an architecture diagram] [test:
released output that the document does not state: text after the `;` that the
line rule ignores in a title, runs before and after it, of an architecture
diagram] [test: released output that the document does not state: text touching
the `;` that the line rule ignores in a title, a run before it, of an
architecture diagram] [test: released output that the document does not state:
text and a run after the `;` that the line rule ignores in a title, spaces at
the end, of an architecture diagram] [test: released output that the document
does not state: two touching `;` that the line rule reads in a title, a run
before them, of an architecture diagram] [test: released output that the
document does not state: two `;` with spaces between them that the line rule
reads in a title, a run before them, of an architecture diagram] [test: released
output that the document does not state: text after the last of two `;` that the
line rule reads in a title, runs around them, of an architecture diagram] [test:
released output that the document does not state: text after the `;` that the
line rule ignores after classDef in a title, of an architecture diagram] [test:
nothing after the `;` that the line rule ignores in a title, runs before it, of
an architecture diagram] [test: a run inside the stretch of the line rule,
nothing after the `;` in a title, spaces at the end, of an architecture diagram]
[test: released output that the document does not state: nothing after the last
of two `;` that the line rule reads in a title, of an architecture diagram]
[test: released output that the document does not state: a comment after the `;`
that the line rule ignores in a title, of an architecture diagram] [test:
released output that the document does not state: a `;` inside the comment at
the end of a title, a run and spaces at the end, of an architecture diagram]
[test: nothing after the `;` that the line rule ignores in a title, spaces at
the end, of an architecture diagram] [test: a run after the keyword of a title,
nothing after the `;` that the line rule ignores, of an architecture diagram]
[test: the literal style without the trigger and a `;` at the end of a title,
spaces at the end, of an architecture diagram] [test: the word Style with a
capital and a `;` at the end of a title, spaces at the end, of an architecture
diagram] [test: a tab after the `;` that the line rule ignores in a title, runs
before it, of an architecture diagram] [test: a classDef trigger with nothing
after the `;` in a title, runs before it, of an architecture diagram] [test: the
literal classDef and a `;` at the end of a title, spaces at the end, of an
architecture diagram] [test: the literal style inside a word and a `;` at the
end of a title, spaces at the end, of an architecture diagram] [test: the word
classdef in lower case and a `;` at the end of a title, spaces at the end, of an
architecture diagram] [test: U+2028 before a directive that a comment touches, a
line follows, in a title of an architecture diagram] [test: U+2028 before a
directive that a comment touches, the text ends, in a title of an architecture
diagram] [test: U+2028 before a directive that a comment touches, an empty line
follows, in a title of an architecture diagram] [test: U+2028 before a directive
that a comment follows after spaces, a line follows, in a title of an
architecture diagram] [test: U+2028 before a directive that a comment follows
after spaces, the text ends, in a title of an architecture diagram] [test:
U+2028 before a directive that a comment follows after spaces, an empty line
follows, in a title of an architecture diagram] [test: U+2029 before a directive
that a comment touches, a line follows, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment touches, the text ends, in a
title of an architecture diagram] [test: U+2029 before a directive that a
comment touches, an empty line follows, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, a line
follows, in a title of an architecture diagram] [test: U+2029 before a directive
that a comment follows after spaces, the text ends, in a title of an
architecture diagram] [test: U+2029 before a directive that a comment follows
after spaces, an empty line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a comment line follows,
in a title of an architecture diagram] [test: U+2028 before a directive that a
comment touches, a line of whitespace follows, in a title of an architecture
diagram] [test: U+2028 before a directive that a comment touches, a directive
line follows, in a title of an architecture diagram] [test: U+2028 before a
directive that a comment touches, a directive line and a comment line follow, in
a title of an architecture diagram] [test: U+2028 before a directive that a
comment touches, an empty line and a comment line follow, in a title of an
architecture diagram] [test: U+2028 before a directive that a comment touches, a
directive line, an empty line, and a comment line follow, in a title of an
architecture diagram] [test: U+2028 before a directive that a comment touches,
an empty line and a directive line follow, in a title of an architecture
diagram] [test: U+2028 before a directive that a comment touches, a directive
line follows and the text ends, in a title of an architecture diagram] [test:
U+2028 before two directives with spaces between them that a comment touches,
the text ends, in a title of an architecture diagram] [test: U+2028 before two
directives with a tab between them that a comment follows after spaces, the text
ends, in a title of an architecture diagram] [test: U+2029 before a directive
that a comment touches, a directive line and a comment line follow, in a title
of an architecture diagram] [test: U+2028 after the last directive, spaces and a
comment after it, a comment line follows, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a line of
whitespace follows, in a title of an architecture diagram] [test: U+2028 after
the last directive, spaces and a comment after it, a directive line follows, in
a title of an architecture diagram] [test: U+2028 after the last directive,
spaces and a comment after it, a directive line and a comment line follow, in a
title of an architecture diagram] [test: U+2028 after the last directive, spaces
and a comment after it, an empty line and a comment line follow, in a title of
an architecture diagram] [test: U+2028 after the last directive, spaces and a
comment after it, a directive line, an empty line, and a comment line follow, in
a title of an architecture diagram] [test: U+2028 after the last directive,
spaces and a comment after it, an empty line and a directive line follow, in a
title of an architecture diagram] [test: U+2028 after the last directive, spaces
and a comment after it, a directive line follows and the text ends, in a title
of an architecture diagram] [test: U+2028 after the last directive, spaces and a
comment after it, the text ends, in a title of an architecture diagram] [test:
U+2028 after the last directive, spaces and a comment after it, an empty line
follows, in a title of an architecture diagram] [test: U+2028 after the last
directive, spaces and a comment after it, a line follows, in a title of an
architecture diagram] [test: U+2029 after the last directive, spaces and a
comment after it, the text ends, in a title of an architecture diagram] [test:
U+2028 after the last directive, a comment touching it, the text ends, in a
title of an architecture diagram] [test: U+2028 after the last directive, a
comment touching it, a directive line follows, in a title of an architecture
diagram] [test: U+2028 between two directives, spaces and a comment after it, a
comment line follows, in a title of an architecture diagram] [test: U+2028
between two directives, spaces and a comment after it, a line of whitespace
follows, in a title of an architecture diagram] [test: U+2028 between two
directives, spaces and a comment after it, a directive line follows, in a title
of an architecture diagram] [test: U+2028 between two directives, spaces and a
comment after it, a directive line and a comment line follow, in a title of an
architecture diagram] [test: U+2028 between two directives, spaces and a comment
after it, an empty line and a comment line follow, in a title of an architecture
diagram] [test: U+2028 between two directives, spaces and a comment after it, a
directive line, an empty line, and a comment line follow, in a title of an
architecture diagram] [test: U+2028 between two directives, spaces and a comment
after it, an empty line and a directive line follow, in a title of an
architecture diagram] [test: U+2028 between two directives, spaces and a comment
after it, a directive line follows and the text ends, in a title of an
architecture diagram] [test: U+2028 between two directives, spaces and a comment
after it, the text ends, in a title of an architecture diagram] [test: U+2028
between two directives, spaces and a comment after it, an empty line follows, in
a title of an architecture diagram] [test: U+2028 between two directives, spaces
and a comment after it, a line follows, in a title of an architecture diagram]
[test: U+2029 between two directives, spaces and a comment after it, the text
ends, in a title of an architecture diagram] [test: U+2028 between two
directives, a comment touching it, the text ends, in a title of an architecture
diagram] [test: U+2028 between two directives, a comment touching it, a
directive line follows, in a title of an architecture diagram] [test: U+2028
after the last directive and spaces, spaces and a comment after it, the text
ends, in a title of an architecture diagram] [test: a U+2028 inside the text, a
directive, and a comment after spaces, in a title of an architecture diagram]
[test: a U+2028 inside the text, a directive that a comment touches, in a title
of an architecture diagram] [test: a wide space before two directives that
spaces separate, the text ends, in a title of an architecture diagram] [test: a
wide space before a directive that spaces and a comment follow, the text ends,
in a title of an architecture diagram] [test: a wide space before two directives
that touch and a comment that touches the last, the text ends, in a title of an
architecture diagram] [test: a U+2028 before two directives that touch, the text
ends, in a title of an architecture diagram] [test: a U+2028 before a directive
that spaces follow, the text ends, in a title of an architecture diagram] [test:
a U+2028 before two directives that spaces separate, the text ends, in a title
of an architecture diagram] [test: a directive that holds a line break, spaces
before it, the text ends, in a title of an architecture diagram] [test: a
directive that holds a U+2028, spaces before it, the text ends, in a title of an
architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, the text ends, in a title of an architecture diagram] [test: a value
of directives only, spaces after the directive, the text ends, in a title of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, the text ends, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the text ends, in a title
of an architecture diagram] [test: a `;` in the text, spaces between two
directives, the text ends, in a title of an architecture diagram] [test: a `;`
between two directives, spaces around it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, the text ends, in a
title of an architecture diagram] [test: a U+2028 before a directive that spaces
and a comment follow, a comment line follows, in a title of an architecture
diagram] [test: a U+2028 before a directive that spaces and a comment follow, an
empty line follows, in a title of an architecture diagram] [test: a U+2028
before a directive that spaces and a comment follow, a line of whitespace
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, a directive line follows, in a title
of an architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a comment line and a statement follow, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, an empty line and a statement follow, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, the text ends, in a title of an architecture diagram] [test: a
U+2028 before a directive that spaces and a comment follow, a comment line
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, an empty line follows, in a title of
an architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a line of whitespace follows, in a title of an architecture
diagram] [test: a U+2028 before a directive that spaces and a comment follow, a
directive line follows, in a title of an architecture diagram] [test: a U+2028
before a directive that spaces and a comment follow, a comment line and a
statement follow, in a title of an architecture diagram] [test: a U+2028 before
a directive that spaces and a comment follow, an empty line and a statement
follow, in a title of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a comment line
follows, in a title of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, an empty line
follows, in a title of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a line of
whitespace follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, a
directive line follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, a
comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment
after them, an empty line and a statement follow, in a title of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, the text ends, in a title of an architecture diagram] [test:
a U+2028 before two directives that a wide space separates, a comment after
them, a comment line follows, in a title of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
an empty line follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, a line
of whitespace follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, a
directive line follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, a
comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment
after them, an empty line and a statement follow, in a title of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, a comment line follows, in a title of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, an empty line
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, a line of whitespace follows,
in a title of an architecture diagram] [test: a U+2028 before a directive that a
wide space and a comment follow, a directive line follows, in a title of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, a comment line and a statement follow, in a title of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, an empty line and a statement follow, in a title of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, the text ends, in a title of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, a comment line
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, an empty line follows, in a
title of an architecture diagram] [test: a U+2028 before a directive that a wide
space and a comment follow, a line of whitespace follows, in a title of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an
empty line and a statement follow, in a title of an architecture diagram] [test:
a U+2028 before a directive that spaces and a comment follow, an indented
directive line follows, in a title of an architecture diagram] [test: a U+2028
before a directive that spaces and a comment follow, a directive and spaces
follow, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, two directives that touch follow, in
a title of an architecture diagram] [test: a U+2028 before a directive that
spaces and a comment follow, a directive and a comment on a line follow, in a
title of an architecture diagram] [test: a U+2028 before a directive that spaces
and a comment follow, a line of a no-break space follows, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented
comment line follows, in a title of an architecture diagram] [test: a U+2028
before a directive that spaces and a comment follow, an indented directive line
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, a directive and spaces follow, in a
title of an architecture diagram] [test: a U+2028 before a directive that spaces
and a comment follow, two directives that touch follow, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a directive and a comment on a line follow, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a no-break space follows, in a title of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented
comment line follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, an
indented directive line follows, in a title of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
a directive and spaces follow, in a title of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
two directives that touch follow, in a title of an architecture diagram] [test:
a U+2028 before two directives that a wide space separates, a comment after
them, a directive and a comment on a line follow, in a title of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a line of a no-break space follows, in a title of an
architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, a line of a tab follows, in a title of an
architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, an indented comment line follows, in a title of
an architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, an indented directive line follows, in a title
of an architecture diagram] [test: a U+2028 before two directives that a wide
space separates, a comment after them, a directive and spaces follow, in a title
of an architecture diagram] [test: a U+2028 before two directives that a wide
space separates, a comment after them, two directives that touch follow, in a
title of an architecture diagram] [test: a U+2028 before two directives that a
wide space separates, a comment after them, a directive and a comment on a line
follow, in a title of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a line of a
no-break space follows, in a title of an architecture diagram] [test: a U+2028
before two directives that a wide space separates, a comment after them, a line
of a tab follows, in a title of an architecture diagram] [test: a U+2028 before
two directives that a wide space separates, a comment after them, an indented
comment line follows, in a title of an architecture diagram] [test: a U+2028
before a directive that a wide space and a comment follow, an indented directive
line follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, a directive and spaces follow,
in a title of an architecture diagram] [test: a U+2028 before a directive that a
wide space and a comment follow, two directives that touch follow, in a title of
an architecture diagram] [test: a U+2028 before a directive that a wide space
and a comment follow, a directive and a comment on a line follow, in a title of
an architecture diagram] [test: a U+2028 before a directive that a wide space
and a comment follow, a line of a no-break space follows, in a title of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an
indented comment line follows, in a title of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, an indented
directive line follows, in a title of an architecture diagram] [test: a U+2028
before a directive that a wide space and a comment follow, a directive and
spaces follow, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, two directives that touch
follow, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, a directive and a comment on a
line follow, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, a line of a no-break space
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that a wide space and a comment follow, a line of a tab follows, in a
title of an architecture diagram] [test: a U+2028 before a directive that a wide
space and a comment follow, an indented comment line follows, in a title of an
architecture diagram] [test: a `;` after the last directive, a U+2028 before the
directives, a comment after it, the text ends, in a title of an architecture
diagram] [test: a `;` between two directives, a U+2028 before the directives, a
comment after them, the text ends, in a title of an architecture diagram] [test:
a U+2028 after the last directive that spaces and a comment follow, a comment
line follows, in a title of an architecture diagram] [test: a U+2028 after the
last directive that spaces and a comment follow, an empty line follows, in a
title of an architecture diagram] [test: a U+2028 after the last directive that
spaces and a comment follow, a line of whitespace follows, in a title of an
architecture diagram] [test: a U+2028 after the last directive that spaces and a
comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a
comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an
empty line and a statement follow, in a title of an architecture diagram] [test:
a U+2028 after the last directive that spaces and a comment follow, the text
ends, in a title of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a comment line follows, in a title
of an architecture diagram] [test: a U+2028 after the last directive that spaces
and a comment follow, an empty line follows, in a title of an architecture
diagram] [test: a U+2028 after the last directive that spaces and a comment
follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a
directive line follows, in a title of an architecture diagram] [test: a U+2028
after the last directive that spaces and a comment follow, a comment line and a
statement follow, in a title of an architecture diagram] [test: a U+2028 after
the last directive that spaces and a comment follow, an empty line and a
statement follow, in a title of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, a comment line follows,
in a title of an architecture diagram] [test: a U+2028 between two directives,
spaces and a comment after the last one, an empty line follows, in a title of an
architecture diagram] [test: a U+2028 between two directives, spaces and a
comment after the last one, a line of whitespace follows, in a title of an
architecture diagram] [test: a U+2028 between two directives, spaces and a
comment after the last one, a directive line follows, in a title of an
architecture diagram] [test: a U+2028 between two directives, spaces and a
comment after the last one, a comment line and a statement follow, in a title of
an architecture diagram] [test: a U+2028 between two directives, spaces and a
comment after the last one, an empty line and a statement follow, in a title of
an architecture diagram] [test: a U+2028 between two directives, spaces and a
comment after the last one, the text ends, in a title of an architecture
diagram] [test: a U+2028 between two directives, spaces and a comment after the
last one, a comment line follows, in a title of an architecture diagram] [test:
a U+2028 between two directives, spaces and a comment after the last one, an
empty line follows, in a title of an architecture diagram] [test: a U+2028
between two directives, spaces and a comment after the last one, a line of
whitespace follows, in a title of an architecture diagram] [test: a U+2028
between two directives, spaces and a comment after the last one, a directive
line follows, in a title of an architecture diagram] [test: a U+2028 between two
directives, spaces and a comment after the last one, a comment line and a
statement follow, in a title of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, an empty line and a
statement follow, in a title of an architecture diagram] [test: a line of a
directive, two spaces before a comment line after a U+2028 before two
directives, the text ends, in a title of an architecture diagram] [test: a line
of two spaces, a directive before a comment line after a U+2028 before two
directives, the text ends, in a title of an architecture diagram] [test: a line
of a tab, a directive before a comment line after a U+2028 before two
directives, the text ends, in a title of an architecture diagram] [test: a line
of a directive, a tab before a comment line after a U+2028 before two
directives, the text ends, in a title of an architecture diagram] [test: a line
of a no-break space, a directive before a comment line after a U+2028 before two
directives, the text ends, in a title of an architecture diagram] [test: a line
of a directive, a no-break space before a comment line after a U+2028 before two
directives, the text ends, in a title of an architecture diagram] [test: a line
of a directive, two spaces, a directive before a comment line after a U+2028
before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a directive, U+2028 before a comment line after a U+2028 before
two directives, the text ends, in a title of an architecture diagram] [test: a
line of a directive, a space, a comment before a comment line after a U+2028
before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a tab before a comment line after a U+2028 before a directive,
the text ends, in a title of an architecture diagram] [test: a line of a
no-break space before a comment line after a U+2028 before a directive, the text
ends, in a title of an architecture diagram] [test: a line of U+3000 before a
comment line after a U+2028 before a directive, the text ends, in a title of an
architecture diagram] [test: a line of a vertical tab before a comment line
after a U+2028 before a directive, the text ends, in a title of an architecture
diagram] [test: a line of a form feed before a comment line after a U+2028
before a directive, the text ends, in a title of an architecture diagram] [test:
a line of U+2028 before a comment line after a U+2028 before a directive, the
text ends, in a title of an architecture diagram] [test: a line of U+2029 before
a comment line after a U+2028 before a directive, the text ends, in a title of
an architecture diagram] [test: a line of U+0085 before a comment line after a
U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of U+180E before a comment line after a U+2028 before a directive,
the text ends, in a title of an architecture diagram] [test: U+2028 between two
directives and after the last, a comment touches it, the text ends, in a title
of an architecture diagram] [test: U+2028 between two directives and after the
last, a comment follows after spaces, the text ends, in a title of an
architecture diagram] [test: U+2029 between two directives and after the last, a
comment follows after spaces, the text ends, in a title of an architecture
diagram] [test: U+2029 between two directives and U+2028 after the last, a
comment follows after a tab, the text ends, in a title of an architecture
diagram] [test: U+2028 between two directives and after the last, a comment
follows after a no-break space, the text ends, in a title of an architecture
diagram] [test: U+2028 between two directives and after the last, a comment
follows after spaces, a statement follows, in a title of an architecture
diagram] [test: U+2028 between two directives and after the last, a comment
follows after spaces, an empty line and a statement follow, in a title of an
architecture diagram] [test: U+2028 between two directives and after the last, a
comment follows after spaces, a directive line and a statement follow, in a
title of an architecture diagram] [test: U+2028 between two directives and after
the last, a comment follows after spaces, a comment line and a statement follow,
in a title of an architecture diagram] [test: U+2028 between two directives and
after the last, a comment follows after spaces, a comment line follows and the
text ends, in a title of an architecture diagram] [test: U+2028 between two
directives and after the last, a comment follows after spaces, a directive line
follows and the text ends, in a title of an architecture diagram] [test: U+2028
between the first and the second of three directives, between the second and the
third, and after the third, a comment touches it, the text ends, in a title of
an architecture diagram] [test: U+2028 before the directives, between two
directives, and after the last, a comment touches it, the text ends, in a title
of an architecture diagram] [test: U+2028 between two directives of a title of
directives only and after the last, a comment follows after spaces, the text
ends, in a title of an architecture diagram] [test: U+2028 after the last
directive, a no-break space and a comment after it, the text ends, in a title of
an architecture diagram] [test: U+2028 between two directives, a no-break space
and a comment after the last, the text ends, in a title of an architecture
diagram] [test: U+2028 after the last directive, U+3000 and a comment after it,
the text ends, in a title of an architecture diagram] [test: U+2028 between two
directives, U+3000 and a comment after the last, the text ends, in a title of an
architecture diagram] [test: U+2028 after the last directive, a space and a
no-break space and a comment after it, the text ends, in a title of an
architecture diagram] [test: U+2028 between two directives, a space and a
no-break space and a comment after the last, the text ends, in a title of an
architecture diagram] [test: U+2028 after the last directive, a no-break space
and a comment after it, a statement follows, in a title of an architecture
diagram] [test: U+2028 between two directives and after the last, two spaces
after the first, a comment touches the last U+2028, the text ends, in a title of
an architecture diagram] [test: U+2028 between two directives and after the
last, a tab after the first, a comment touches the last U+2028, the text ends,
in a title of an architecture diagram] [test: U+2028 between two directives and
after the last, a no-break space after the first, a comment touches the last
U+2028, the text ends, in a title of an architecture diagram] [test: U+2028
between two directives and after the last, U+3000 after the first, a comment
touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, two spaces before the
first, a comment touches the last U+2028, the text ends, in a title of an
architecture diagram] [test: U+2028 between two directives and after the last, a
tab before the first, a comment touches the last U+2028, the text ends, in a
title of an architecture diagram] [test: U+2028 between two directives and after
the last, a no-break space before the first, a comment touches the last U+2028,
the text ends, in a title of an architecture diagram] [test: U+2029 between two
directives, two spaces after it, and U+2028 after the last, a comment touches
the last U+2028, the text ends, in a title of an architecture diagram] [test:
U+2028 between two directives of a title of directives only, two spaces after
it, and U+2028 after the last, a comment touches the last U+2028, the text ends,
in a title of an architecture diagram] [test: U+2028 between two directives, two
spaces after it, and U+2028 after the last, a comment touches the last U+2028, a
statement follows, in a title of an architecture diagram] [test: U+2028 between
two directives, two spaces after it, a comment touches the last directive, the
text ends, in a title of an architecture diagram] [test: U+2028 between two
directives, two spaces after it, a comment follows the last directive after
spaces, the text ends, in a title of an architecture diagram] [test: U+2028
between two directives, a no-break space before the comment, the text ends, in a
title of an architecture diagram] [test: U+2028 between two directives, two
spaces after it, a comment touches the last directive, a statement follows, in a
title of an architecture diagram] [test: U+2028 between the first and the second
of three directives and between the second and the third, a comment follows the
third after a space, the text ends, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between
the second and the third, a comment touches the third, the text ends, in a title
of an architecture diagram] [test: U+2029 between the first and the second of
three directives and between the second and the third, a comment follows the
third after two spaces, the text ends, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between
the second and the third, a comment follows the third after a space, a statement
follows, in a title of an architecture diagram] [test: U+2028 between the first
and the second of three directives and between the second and the third of a
title of directives only, a comment follows the third after a space, the text
ends, in a title of an architecture diagram] [test: U+2028 between two
directives and after the last, a comment line stands between the last U+2028 and
a statement, in a title of an architecture diagram] [test: a `;` after the last
directive, touching the directive, U+2028 after it, the text ends, in a title of
an architecture diagram] [test: a `;` after the last directive, two spaces after
the directive, U+2028 after it, the text ends, in a title of an architecture
diagram] [test: a `;` after the last directive, touching the directive, U+2029
after it, the text ends, in a title of an architecture diagram] [test: a `;`
after the last directive, two spaces after the directive, U+2029 after it, the
text ends, in a title of an architecture diagram] [test: a `;` after the last
directive, touching the directive, a space and U+2028 after it, the text ends,
in a title of an architecture diagram] [test: a `;` after the last directive,
two spaces after the directive, a space and U+2028 after it, the text ends, in a
title of an architecture diagram] [test: a `;` after the last directive,
touching the directive, U+2028 and a space after it, the text ends, in a title
of an architecture diagram] [test: a `;` after the last directive, two spaces
after the directive, U+2028 and a space after it, the text ends, in a title of
an architecture diagram] [test: a `;` after the last directive, touching the
directive, a no-break space and U+2028 after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, two spaces after
the directive, a no-break space and U+2028 after it, the text ends, in a title
of an architecture diagram] [test: a `;` after the last directive, touching the
directive, U+2028 and a no-break space after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, two spaces after
the directive, U+2028 and a no-break space after it, the text ends, in a title
of an architecture diagram] [test: a `;` after the last directive, touching the
directive, U+2028, a space, and U+2028 after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, two spaces after
the directive, U+2028, a space, and U+2028 after it, the text ends, in a title
of an architecture diagram] [test: a `;` after the last directive, touching the
directive, two spaces and U+2028 after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, two spaces after
the directive, two spaces and U+2028 after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, touching the
directive, a no-break space after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, two spaces after
the directive, a no-break space after it, the text ends, in a title of an
architecture diagram] [test: a `;` after the last directive, touching the
directive, U+3000 after it, the text ends, in a title of an architecture
diagram] [test: a `;` after the last directive, two spaces after the directive,
U+3000 after it, the text ends, in a title of an architecture diagram] [test: a
`;` after the last directive, U+2028 after it, a statement follows, in a title
of an architecture diagram] [test: a `;` after the last directive, two spaces
and U+2028 after it, a statement follows, in a title of an architecture diagram]
[test: a `;` after the last directive, a no-break space after it, a statement
follows, in a title of an architecture diagram] [test: a `;`, two spaces, a `;`,
and U+2028 after the last directive, the text ends, in a title of an
architecture diagram] [test: a line of a directive and a `;` before a comment
line after a U+2028 before a directive, the text ends, in a title of an
architecture diagram] [test: a line of a `;` and a comment before a comment line
after a U+2028 before a directive, the text ends, in a title of an architecture
diagram] [test: a line of a comment that holds a `;` before a comment line after
a U+2028 before a directive, the text ends, in a title of an architecture
diagram] [test: a line of a directive and a comment that holds a `;` before a
comment line after a U+2028 before a directive, the text ends, in a title of an
architecture diagram] [test: a line of a directive that holds a `;` before a
comment line after a U+2028 before a directive, the text ends, in a title of an
architecture diagram] [test: a `;` before the U+2028 between two directives, a
comment follows the last directive after two spaces, the text ends, in a title
of an architecture diagram] [test: a `;` before the U+2028 between two
directives, two spaces after the U+2028, a comment follows the last directive
after two spaces, the text ends, in a title of an architecture diagram] [test: a
`;` between two directives, a U+2028 after the last directive, two spaces and a
comment after it, the text ends, in a title of an architecture diagram] [test: a
`;` after the U+2028 between two directives, a comment follows the last
directive after two spaces, the text ends, in a title of an architecture
diagram] [test: a `;` before the U+2028 between two directives, two spaces after
the U+2028, a comment follows the last directive after two spaces, a statement
follows, in a title of an architecture diagram] [test: two U+2028 with two
spaces on each side between two directives, a comment follows the last directive
after two spaces, the text ends, in a title of an architecture diagram] [test:
two U+2029 between two directives, a comment follows the last directive after
two spaces, the text ends, in a title of an architecture diagram] [test: U+2028
and U+2029 between two directives, a comment follows the last directive after
two spaces, the text ends, in a title of an architecture diagram] [test: two
U+2028 after the last directive, a comment touches the second, the text ends, in
a title of an architecture diagram] [test: U+2028 and U+2029 with two spaces on
each side after the last directive, a comment follows the second after two
spaces, the text ends, in a title of an architecture diagram] [test: two U+2028
with two spaces on each side after a single directive, a comment follows after
two spaces, the text ends, in a title of an architecture diagram] [test: a `;`
inside the comment after the last directive, two spaces before the comment, the
text ends, in a title of an architecture diagram] [test: a U+2028 between the
text and a directive, a U+2028 between the directive and the comment, an empty
line and a statement follow, in a title of an architecture diagram] [test: a
U+2028 after the last directive of a title of directives only, two spaces before
and after it, a comment follows, the text ends, in a title of an architecture
diagram] [test: two U+2028 before a directive that a comment touches, an empty
line and a statement follow, in a title of an architecture diagram] [test: two
U+2028 before a directive that a comment follows after spaces, an empty line and
a statement follow, in a title of an architecture diagram] [test: U+2029 and
U+2028 before a directive that a comment touches, the text ends, in a title of
an architecture diagram] [test: two U+2028 before a directive that a comment
touches, a comment line follows, in a title of an architecture diagram] [test:
two U+2028 before a directive that a comment touches, a line of whitespace
follows, in a title of an architecture diagram] [test: two U+2028 before a
directive that a comment touches, a directive line follows, in a title of an
architecture diagram] [test: a comment after the last directive after two
spaces, a comment line that holds a `;` and an empty line follow, a statement
follows, in a title of an architecture diagram] [test: a U+2028 before a
directive that a comment follows after two spaces, a comment line that holds a
`;` follows, a statement follows, in a title of an architecture diagram] [test:
a comment after the last directive after two spaces, a directive line that holds
a `;` and an empty line follow, a statement follows, in a title of an
architecture diagram] [test: a directive that starts the text, two spaces and a
text after it, spaces at the end, the text ends, in a title of an architecture
diagram] [test: two directives that touch and start the text, a text after them,
spaces at the end, the text ends, in a title of an architecture diagram] [test:
a directive that starts the text, two spaces and a text after it, spaces at the
end, a statement follows, in a title of an architecture diagram] [test: a
directive that starts the text, two spaces and a text after it, a statement
whose label holds a `;` follows, in a title of an architecture diagram]

[fixture: architecture/title/empty-next-statement]

[fixture: architecture/title/title-edge-trim]

[fixture: architecture/title/title-empty]

[fixture: architecture/title/title-next-global-gap]

[corpus fixture: architecture/common-title-next-statement]

[corpus fixture: architecture/common-title-comment-gap]

[corpus fixture: architecture/common-title-literal-quotes]

[corpus fixture: architecture/common-repeat-empty]

Input (escaped):
`"architecture-beta\ntitle\n%% next\nservice next_title\ntitle \"unclosed\n"`.

Output
([title/empty-next-statement-output.mmd](../tests/fixtures/architecture/title/empty-next-statement-output.mmd)):

```mmd
architecture-beta
  title
  %% next
  service next_title
  title "unclosed
```

### Accessibility lines

Reuse shared `accTitle: value` and `accDescr: value`, except as the paragraphs
below state, as the [paragraph on a directive before the text](#title) states,
and as the [Semicolons](#semicolons) section states: the colon touches its
keyword, with one space before a trimmed nonempty value; empty values end at the
colon. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
colon: it is the colon of a key (step 2 of
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is), and the table
there has `accTitle: text`), so it touches the keyword and has one space after
it. This keeps consistent outer spacing. A run of spaces and tabs inside the
value of an `accDescr` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of an `accTitle` stays as written, since the browser shows it as a
tooltip. Never join a next-line statement. mermaid.js reads the next line as a
statement of its own, so joining it would put that statement into the title or
the description, and what it declares (a node, a group, a junction, or an edge)
would disappear. Braces after a colon remain line text. Where a value has text
and no directive stands before its text or inside it, and no U+2028 or U+2029
stands inside the text, the directives that end it are printed as follows, by
what stands before them and after them, except for the undecided lines that the
[title list](#title) states. A wide space is one of U+000B, U+000C, U+00A0,
U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF. Where a U+2028 or
U+2029 stands before the directives and a comment follows the last one, a line
that is not undecided is printed as under item 6 of the title list, and where
item 6 of the title list splits it, none of the items below applies to it. The
colon touches the keyword, so a gap before it is printed as no gap even where
the line stays as written:

- Where only spaces and tabs, or nothing, stand before the directives, no `;`
  stands in the text before them or inside one of them, no directive holds a
  line break, a U+2028, or a U+2029, and nothing but spaces and tabs follow the
  last one, one space is printed before each directive that has spaces or tabs
  before it, and the spaces and tabs after the last one are left out, whatever
  the spaces and tabs at the end of the line.
- Where a wide space stands before the directives, they touch one another, and
  the end of the line or a comment touches the last one, the character is
  printed as one space with the rest of its run. So it does where a U+2028 or
  U+2029 stands there and the end of the line touches the last one.
- Where a wide space stands before the directives and spaces or tabs and another
  directive or a comment follow the first one, the character stays, and each run
  of spaces and tabs after it before a directive or the comment is printed as
  one space.
- Where a U+2028 or U+2029 stands before the directives, no comment follows the
  last one, and spaces or tabs follow the last one, or spaces or tabs and
  another directive follow the first one, the line stays as written.
- Where a wide space stands between two directives, the line stays as written,
  whatever follows the last one.
- Where a wide space stands after the last directive, also after spaces or tabs,
  the line stays as written, whatever follows the character. A value with a
  directive inside its text stays as written too.

Where a comment follows the last directive, no U+2028 or U+2029 stands between
the text and the comment, the line is not undecided, and neither of items 5 and
6 applies, a run of spaces and tabs before each directive and before the comment
is printed as one space, also where the comment holds a `;` (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`.

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) leaves out the spaces
at the end of the line (item 1), as Prettier ends no line with whitespace. The
other items say what the released version prints for the gaps and the characters
that the rules do not decide, and a form that the other diagram types print
differently stays as it is until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

Where a U+2028 or U+2029 stands inside the text, or the value holds directives
only, and the line is not undecided, the line stays as written if spaces or tabs
follow the last directive, whether the end of the line or a comment comes after
them, or if spaces or tabs stand between two directives, and item 3 does not
apply to it; otherwise the other items print it as they print a line of any
other text, so each run of spaces and tabs before a directive, the one after the
keyword included, is one space.

The undecided lines are not stated: the output there depends on each character
on each side of the `;` and of the U+2028 or U+2029, rule 1 names no mark for
these gaps, and the diagram types do not print them alike. The forms that the
released version prints there stay until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Where no U+2028 or U+2029 stands in the line, a `;` inside its comment makes no
difference to it, so a line that holds one only there is not undecided, unless a
line between it and the next statement holds a `;` inside a comment or a
directive. The lines that make the formatter throw there are not stated.

[fixture: accessibility-lines/acc-directives-end-blanks-dropped] [fixture:
accessibility-lines/acc-directives-end-tabs-dropped] [fixture:
accessibility-lines/acc-directives-in-the-text-kept] [fixture:
accessibility-lines/acc-directives-then-comment] [fixture:
accessibility-lines/acctitle-directives-end-at-the-end-of-the-text] [fixture:
accessibility-lines/accdescr-directives-end-at-the-end-of-the-text] [fixture:
accessibility-lines/acc-directives-end-before-comment-line-and-empty-line]
[fixture: architecture/accessibility-lines/a11y-empty-comment-gap] [test: a
no-break space after the last directive of an accTitle line of an architecture
diagram] [test: a no-break space before the directive that ends an accTitle line
of an architecture diagram] [test: a no-break space after the last directive of
an accDescr line of an architecture diagram] [test: a no-break space before the
directive that ends an accDescr line of an architecture diagram] [test: U+2028
before the directive that ends an accTitle line of an architecture diagram]
[test: a no-break space before a directive that a space and a comment follow in
an accDescr line of an architecture diagram] [test: the gap before the colon of
an accTitle line with a no-break space after its last directive of an
architecture diagram] [test: U+3000 after the last directive of an accTitle line
of an architecture diagram] [test: U+2028 after the last directive of an
accTitle line of an architecture diagram] [test: U+2029 after the last directive
of an accTitle line of an architecture diagram] [test: U+3000 before the
directive that ends an accTitle line of an architecture diagram] [test: U+2029
before the directive that ends an accTitle line of an architecture diagram]
[test: U+3000 after the last directive of an accDescr line of an architecture
diagram] [test: U+2028 after the last directive of an accDescr line of an
architecture diagram] [test: U+2029 after the last directive of an accDescr line
of an architecture diagram] [test: U+3000 before the directive that ends an
accDescr line of an architecture diagram] [test: U+2028 before the directive
that ends an accDescr line of an architecture diagram] [test: U+2029 before the
directive that ends an accDescr line of an architecture diagram] [test: a
no-break space before a directive that a space and a comment follow in an
accTitle line of an architecture diagram] [test: U+2028 before the last
directive, a space and a tab after it, in an accTitle line of an architecture
diagram] [test: U+2029 before the last directive, a space and a tab after it, in
an accTitle line of an architecture diagram] [test: a space, a tab, and a
no-break space after the last directive of an accTitle line of an architecture
diagram] [test: a space, a tab, and U+3000 after the last directive of an
accTitle line of an architecture diagram] [test: the gap before the colon of an
accTitle line with U+3000 after its last directive of an architecture diagram]
[test: a space, a tab, and U+2028 after the last directive of an accTitle line
of an architecture diagram] [test: the gap before the colon of an accTitle line
with U+2028 after its last directive of an architecture diagram] [test: a space,
a tab, and U+2029 after the last directive of an accTitle line of an
architecture diagram] [test: the gap before the colon of an accTitle line with
U+2029 after its last directive of an architecture diagram] [test: a semicolon
before the directive of an accTitle line of an architecture diagram, spaces
after it] [test: a semicolon and spaces before the directive that ends an
accTitle line of an architecture diagram] [test: a semicolon after the last
directive of an accTitle line of an architecture diagram, spaces around it]
[test: U+2028 before the last directive, a space and a tab after it, in an
accDescr line of an architecture diagram] [test: U+2029 before the last
directive, a space and a tab after it, in an accDescr line of an architecture
diagram] [test: a space, a tab, and a no-break space after the last directive of
an accDescr line of an architecture diagram] [test: the gap before the colon of
an accDescr line with a no-break space after its last directive of an
architecture diagram] [test: a space, a tab, and U+3000 after the last directive
of an accDescr line of an architecture diagram] [test: the gap before the colon
of an accDescr line with U+3000 after its last directive of an architecture
diagram] [test: a space, a tab, and U+2028 after the last directive of an
accDescr line of an architecture diagram] [test: the gap before the colon of an
accDescr line with U+2028 after its last directive of an architecture diagram]
[test: a space, a tab, and U+2029 after the last directive of an accDescr line
of an architecture diagram] [test: the gap before the colon of an accDescr line
with U+2029 after its last directive of an architecture diagram] [test: a
semicolon before the directive of an accDescr line of an architecture diagram,
spaces after it] [test: a semicolon and spaces before the directive that ends an
accDescr line of an architecture diagram] [test: a semicolon after the last
directive of an accDescr line of an architecture diagram, spaces around it]
[test: a semicolon before the directive of an accTitle line of an architecture
diagram, a space and a comment after it] [test: a semicolon and spaces before a
directive that a comment touches in an accTitle line of an architecture diagram]
[test: a comment that ends with a semicolon after the last directive of an
accTitle line of an architecture diagram] [test: a comment that has a space
before its semicolon after the last directive of an accTitle line of an
architecture diagram] [test: a comment that starts with a semicolon after the
last directive of an accTitle line of an architecture diagram] [test: a
semicolon before the directive of an accDescr line of an architecture diagram, a
space and a comment after it] [test: a semicolon and spaces before a directive
that a comment touches in an accDescr line of an architecture diagram] [test: a
comment that ends with a semicolon after the last directive of an accDescr line
of an architecture diagram] [test: a comment that has a space before its
semicolon after the last directive of an accDescr line of an architecture
diagram] [test: a comment that starts with a semicolon after the last directive
of an accDescr line of an architecture diagram] [test: U+3000 before a directive
that a space and a comment follow in an accTitle line of an architecture
diagram] [test: the gap before the colon of an accTitle line with U+2028 before
the last directive, a space and a tab after it of an architecture diagram]
[test: the gap before the colon of an accTitle line with U+2029 before the last
directive, a space and a tab after it of an architecture diagram] [test: the gap
before the colon of an accTitle line with a semicolon before the directive,
spaces after it of an architecture diagram] [test: the gap before the colon of
an accTitle line with a semicolon and spaces before the directive that ends it
of an architecture diagram] [test: the gap before the colon of an accTitle line
with a semicolon after the last directive of an architecture diagram] [test: the
gap before the colon of an accTitle line with a space, a tab, and a no-break
space after the last directive of an architecture diagram] [test: the gap before
the colon of an accTitle line with a space, a tab, and U+3000 after the last
directive of an architecture diagram] [test: the gap before the colon of an
accTitle line with a space, a tab, and U+2028 after the last directive of an
architecture diagram] [test: the gap before the colon of an accTitle line with a
space, a tab, and U+2029 after the last directive of an architecture diagram]
[test: released output that the document does not state: a semicolon that the
line rule ignores before the directive of an accTitle line of an architecture
diagram, spaces after it] [test: U+3000 before a directive that a space and a
comment follow in an accDescr line of an architecture diagram] [test: the gap
before the colon of an accDescr line with U+2028 before the last directive, a
space and a tab after it of an architecture diagram] [test: the gap before the
colon of an accDescr line with U+2029 before the last directive, a space and a
tab after it of an architecture diagram] [test: the gap before the colon of an
accDescr line with a semicolon before the directive, spaces after it of an
architecture diagram] [test: the gap before the colon of an accDescr line with a
semicolon and spaces before the directive that ends it of an architecture
diagram] [test: the gap before the colon of an accDescr line with a semicolon
after the last directive of an architecture diagram] [test: the gap before the
colon of an accDescr line with a space, a tab, and a no-break space after the
last directive of an architecture diagram] [test: the gap before the colon of an
accDescr line with a space, a tab, and U+3000 after the last directive of an
architecture diagram] [test: the gap before the colon of an accDescr line with a
space, a tab, and U+2028 after the last directive of an architecture diagram]
[test: the gap before the colon of an accDescr line with a space, a tab, and
U+2029 after the last directive of an architecture diagram] [test: released
output that the document does not state: a semicolon that the line rule ignores
before the directive of an accDescr line of an architecture diagram, spaces
after it] [test: the gap before the colon of an accTitle line that holds only
`a;` of an architecture diagram] [test: the gap before the colon of an accDescr
line that holds only `a;` of an architecture diagram] [test: the gap before the
colon of an accTitle line that holds only `style:#x;` of an architecture
diagram] [test: the gap before the colon of an accTitle line with a semicolon
inside the directive, spaces after it, of an architecture diagram] [test: the
gap before the colon of an accDescr line with a semicolon inside the directive
that ends it, of an architecture diagram] [test: a semicolon inside the
directive of an accDescr line, spaces and a comment after it, of an architecture
diagram] [test: a semicolon inside the directive that ends an accTitle line,
spaces before it, of an architecture diagram] [test: released output that the
document does not state: a second semicolon touching the semicolon that the line
rule ignores, a tab and a directive after them, in an accTitle line of an
architecture diagram] [test: released output that the document does not state:
spaces and a second semicolon after the semicolon that the line rule ignores, a
directive after them, in an accTitle line of an architecture diagram] [test:
released output that the document does not state: a second semicolon touching
the semicolon that the line rule ignores, spaces and a directive after them, in
an accDescr line of an architecture diagram] [test: released output that the
document does not state: U+2029 and a directive after the semicolon that the
line rule ignores, in an accTitle line of an architecture diagram] [test:
released output that the document does not state: U+2028 and a directive after
the semicolon that the line rule ignores, in an accDescr line of an architecture
diagram] [test: released output that the document does not state: spaces and a
directive after the semicolon that the line rule ignores, in an accDescr line of
an architecture diagram] [test: released output that the document does not
state: a no-break space and a directive after the semicolon that the line rule
ignores, in an accDescr line of an architecture diagram] [test: a tab before the
text of a title that ends with a semicolon, of an architecture diagram] [test:
spaces before the text of an accTitle line that ends with a semicolon, of an
architecture diagram] [test: no gap before the text of an accTitle line that
ends with a semicolon, of an architecture diagram] [test: a tab before the text
of an accDescr line that ends with a semicolon, of an architecture diagram]
[test: the gap before the colon of an accTitle line that ends with a semicolon,
of an architecture diagram] [test: the gap before the colon of an accDescr line
with a semicolon inside the last of two directives, of an architecture diagram]
[test: U+000B before the directive that ends an accTitle line of an architecture
diagram] [test: U+000B before a directive that a space and a comment follow in
an accDescr line of an architecture diagram] [test: U+000B after the last
directive of an accTitle line of an architecture diagram] [test: U+000B after
the last directive and spaces of an accDescr line, spaces after it, of an
architecture diagram] [test: U+000C before the directive that ends an accTitle
line of an architecture diagram] [test: U+000C before a directive that a space
and a comment follow in an accDescr line of an architecture diagram] [test:
U+000C after the last directive of an accTitle line of an architecture diagram]
[test: U+000C after the last directive and spaces of an accDescr line, spaces
after it, of an architecture diagram] [test: a no-break space after the last
directive and spaces of an accDescr line, spaces after it, of an architecture
diagram] [test: U+1680 before the directive that ends an accTitle line of an
architecture diagram] [test: U+1680 before a directive that a space and a
comment follow in an accDescr line of an architecture diagram] [test: U+1680
after the last directive of an accTitle line of an architecture diagram] [test:
U+1680 after the last directive and spaces of an accDescr line, spaces after it,
of an architecture diagram] [test: U+2000 before the directive that ends an
accTitle line of an architecture diagram] [test: U+2000 before a directive that
a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2000 after the last directive of an accTitle line of an architecture
diagram] [test: U+2000 after the last directive and spaces of an accDescr line,
spaces after it, of an architecture diagram] [test: U+2001 before the directive
that ends an accTitle line of an architecture diagram] [test: U+2001 before a
directive that a space and a comment follow in an accDescr line of an
architecture diagram] [test: U+2001 after the last directive of an accTitle line
of an architecture diagram] [test: U+2001 after the last directive and spaces of
an accDescr line, spaces after it, of an architecture diagram] [test: U+2002
before the directive that ends an accTitle line of an architecture diagram]
[test: U+2002 before a directive that a space and a comment follow in an
accDescr line of an architecture diagram] [test: U+2002 after the last directive
of an accTitle line of an architecture diagram] [test: U+2002 after the last
directive and spaces of an accDescr line, spaces after it, of an architecture
diagram] [test: U+2003 before the directive that ends an accTitle line of an
architecture diagram] [test: U+2003 before a directive that a space and a
comment follow in an accDescr line of an architecture diagram] [test: U+2003
after the last directive of an accTitle line of an architecture diagram] [test:
U+2003 after the last directive and spaces of an accDescr line, spaces after it,
of an architecture diagram] [test: U+2004 before the directive that ends an
accTitle line of an architecture diagram] [test: U+2004 before a directive that
a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2004 after the last directive of an accTitle line of an architecture
diagram] [test: U+2004 after the last directive and spaces of an accDescr line,
spaces after it, of an architecture diagram] [test: U+2005 before the directive
that ends an accTitle line of an architecture diagram] [test: U+2005 before a
directive that a space and a comment follow in an accDescr line of an
architecture diagram] [test: U+2005 after the last directive of an accTitle line
of an architecture diagram] [test: U+2005 after the last directive and spaces of
an accDescr line, spaces after it, of an architecture diagram] [test: U+2006
before the directive that ends an accTitle line of an architecture diagram]
[test: U+2006 before a directive that a space and a comment follow in an
accDescr line of an architecture diagram] [test: U+2006 after the last directive
of an accTitle line of an architecture diagram] [test: U+2006 after the last
directive and spaces of an accDescr line, spaces after it, of an architecture
diagram] [test: U+2007 before the directive that ends an accTitle line of an
architecture diagram] [test: U+2007 before a directive that a space and a
comment follow in an accDescr line of an architecture diagram] [test: U+2007
after the last directive of an accTitle line of an architecture diagram] [test:
U+2007 after the last directive and spaces of an accDescr line, spaces after it,
of an architecture diagram] [test: U+2008 before the directive that ends an
accTitle line of an architecture diagram] [test: U+2008 before a directive that
a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2008 after the last directive of an accTitle line of an architecture
diagram] [test: U+2008 after the last directive and spaces of an accDescr line,
spaces after it, of an architecture diagram] [test: U+2009 before the directive
that ends an accTitle line of an architecture diagram] [test: U+2009 before a
directive that a space and a comment follow in an accDescr line of an
architecture diagram] [test: U+2009 after the last directive of an accTitle line
of an architecture diagram] [test: U+2009 after the last directive and spaces of
an accDescr line, spaces after it, of an architecture diagram] [test: U+200A
before the directive that ends an accTitle line of an architecture diagram]
[test: U+200A before a directive that a space and a comment follow in an
accDescr line of an architecture diagram] [test: U+200A after the last directive
of an accTitle line of an architecture diagram] [test: U+200A after the last
directive and spaces of an accDescr line, spaces after it, of an architecture
diagram] [test: U+202F before the directive that ends an accTitle line of an
architecture diagram] [test: U+202F before a directive that a space and a
comment follow in an accDescr line of an architecture diagram] [test: U+202F
after the last directive of an accTitle line of an architecture diagram] [test:
U+202F after the last directive and spaces of an accDescr line, spaces after it,
of an architecture diagram] [test: U+205F before the directive that ends an
accTitle line of an architecture diagram] [test: U+205F before a directive that
a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+205F after the last directive of an accTitle line of an architecture
diagram] [test: U+205F after the last directive and spaces of an accDescr line,
spaces after it, of an architecture diagram] [test: U+3000 after the last
directive and spaces of an accDescr line, spaces after it, of an architecture
diagram] [test: U+FEFF before the directive that ends an accTitle line of an
architecture diagram] [test: U+FEFF before a directive that a space and a
comment follow in an accDescr line of an architecture diagram] [test: U+FEFF
after the last directive of an accTitle line of an architecture diagram] [test:
U+FEFF after the last directive and spaces of an accDescr line, spaces after it,
of an architecture diagram] [test: a no-break space after the last directive of
an accTitle line, a comment touching it, of an architecture diagram] [test: a
no-break space after the last directive of an accDescr line, spaces and a
comment after it, of an architecture diagram] [test: U+2003 after the last
directive of an accTitle line, a comment touching it, of an architecture
diagram] [test: U+2003 after the last directive of an accDescr line, spaces and
a comment after it, of an architecture diagram] [test: a semicolon in the text,
two directives with spaces between them, an accTitle line, of an architecture
diagram] [test: a semicolon in the text, two directives that touch, spaces
before them, an accTitle line, of an architecture diagram] [test: a semicolon
inside the first of two directives, a space between them, an accDescr line, of
an architecture diagram] [test: a semicolon inside the last of two directives,
spaces after it, an accDescr line, of an architecture diagram] [test: a
semicolon inside the last of two directives that end an accTitle line, spaces
before both, of an architecture diagram] [test: a semicolon that touches two
directives in an accTitle line, of an architecture diagram] [test: a semicolon
after the last of two directives in an accDescr line, spaces around it and a
comment after it, of an architecture diagram] [test: a semicolon in the text, a
no-break space after the last directive, an accTitle line, of an architecture
diagram] [test: a semicolon inside the directive, a no-break space after it, an
accDescr line, of an architecture diagram] [test: released output that the
document does not state: U+000B between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in an accTitle line of an
architecture diagram] [test: released output that the document does not state:
U+000C between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accTitle line of an architecture diagram] [test:
released output that the document does not state: a no-break space between a
semicolon that the line rule ignores and a second semicolon, a directive after
them, in an accTitle line of an architecture diagram] [test: released output
that the document does not state: U+1680 between a semicolon that the line rule
ignores and a second semicolon, a directive after them, in an accTitle line of
an architecture diagram] [test: released output that the document does not
state: U+2000 between a semicolon that the line rule ignores and a second
semicolon, a directive after them, in an accTitle line of an architecture
diagram] [test: released output that the document does not state: U+2001 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in an accTitle line of an architecture diagram] [test: released output
that the document does not state: U+2002 between a semicolon that the line rule
ignores and a second semicolon, a directive after them, in an accTitle line of
an architecture diagram] [test: released output that the document does not
state: U+2003 between a semicolon that the line rule ignores and a second
semicolon, a directive after them, in an accTitle line of an architecture
diagram] [test: released output that the document does not state: U+2004 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in an accTitle line of an architecture diagram] [test: released output
that the document does not state: U+2005 between a semicolon that the line rule
ignores and a second semicolon, a directive after them, in an accTitle line of
an architecture diagram] [test: released output that the document does not
state: U+2006 between a semicolon that the line rule ignores and a second
semicolon, a directive after them, in an accTitle line of an architecture
diagram] [test: released output that the document does not state: U+2007 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in an accTitle line of an architecture diagram] [test: released output
that the document does not state: U+2008 between a semicolon that the line rule
ignores and a second semicolon, a directive after them, in an accTitle line of
an architecture diagram] [test: released output that the document does not
state: U+2009 between a semicolon that the line rule ignores and a second
semicolon, a directive after them, in an accTitle line of an architecture
diagram] [test: released output that the document does not state: U+200A between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in an accTitle line of an architecture diagram] [test: released output
that the document does not state: U+202F between a semicolon that the line rule
ignores and a second semicolon, a directive after them, in an accTitle line of
an architecture diagram] [test: released output that the document does not
state: U+205F between a semicolon that the line rule ignores and a second
semicolon, a directive after them, in an accTitle line of an architecture
diagram] [test: released output that the document does not state: U+3000 between
a semicolon that the line rule ignores and a second semicolon, a directive after
them, in an accTitle line of an architecture diagram] [test: released output
that the document does not state: U+FEFF between a semicolon that the line rule
ignores and a second semicolon, a directive after them, in an accTitle line of
an architecture diagram] [test: U+000B before two directives that touch and end
an accTitle line of an architecture diagram] [test: U+000C before two directives
that touch and end an accTitle line of an architecture diagram] [test: a
no-break space before two directives that touch and end an accTitle line of an
architecture diagram] [test: U+1680 before two directives that touch and end an
accTitle line of an architecture diagram] [test: U+2000 before two directives
that touch and end an accTitle line of an architecture diagram] [test: U+2001
before two directives that touch and end an accTitle line of an architecture
diagram] [test: U+2002 before two directives that touch and end an accTitle line
of an architecture diagram] [test: U+2003 before two directives that touch and
end an accTitle line of an architecture diagram] [test: U+2004 before two
directives that touch and end an accTitle line of an architecture diagram]
[test: U+2005 before two directives that touch and end an accTitle line of an
architecture diagram] [test: U+2006 before two directives that touch and end an
accTitle line of an architecture diagram] [test: U+2007 before two directives
that touch and end an accTitle line of an architecture diagram] [test: U+2008
before two directives that touch and end an accTitle line of an architecture
diagram] [test: U+2009 before two directives that touch and end an accTitle line
of an architecture diagram] [test: U+200A before two directives that touch and
end an accTitle line of an architecture diagram] [test: U+202F before two
directives that touch and end an accTitle line of an architecture diagram]
[test: U+205F before two directives that touch and end an accTitle line of an
architecture diagram] [test: U+3000 before two directives that touch and end an
accTitle line of an architecture diagram] [test: U+FEFF before two directives
that touch and end an accTitle line of an architecture diagram] [test: U+2028
before two directives that touch and end an accTitle line of an architecture
diagram] [test: U+2029 before two directives that touch and end an accTitle line
of an architecture diagram] [test: U+000B before the first of two directives
that a space separates, in an accTitle line of an architecture diagram] [test:
U+000B before the first of two directives that spaces separate, in an accTitle
line of an architecture diagram] [test: U+000C before the first of two
directives that a space separates, in an accTitle line of an architecture
diagram] [test: U+000C before the first of two directives that spaces separate,
in an accTitle line of an architecture diagram] [test: a no-break space before
the first of two directives that a space separates, in an accTitle line of an
architecture diagram] [test: a no-break space before the first of two directives
that spaces separate, in an accTitle line of an architecture diagram] [test:
U+1680 before the first of two directives that a space separates, in an accTitle
line of an architecture diagram] [test: U+1680 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2000 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2000 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2001 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2001 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2002 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2002 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2003 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2003 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2004 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2004 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2005 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2005 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2006 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2006 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2007 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2007 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2008 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2008 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2009 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2009 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+200A before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+200A before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+202F before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+202F before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+205F before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+205F before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+3000 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+3000 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+FEFF before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+FEFF before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2028 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2028 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2029 before the first of two directives that a space separates, in an
accTitle line of an architecture diagram] [test: U+2029 before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+000B between two directives that end an accTitle line of an
architecture diagram] [test: U+000B between two directives, spaces after the
last, in an accDescr line of an architecture diagram] [test: U+000C between two
directives that end an accTitle line of an architecture diagram] [test: U+000C
between two directives, spaces after the last, in an accDescr line of an
architecture diagram] [test: a no-break space between two directives that end an
accTitle line of an architecture diagram] [test: a no-break space between two
directives, spaces after the last, in an accDescr line of an architecture
diagram] [test: U+1680 between two directives that end an accTitle line of an
architecture diagram] [test: U+1680 between two directives, spaces after the
last, in an accDescr line of an architecture diagram] [test: U+2000 between two
directives that end an accTitle line of an architecture diagram] [test: U+2000
between two directives, spaces after the last, in an accDescr line of an
architecture diagram] [test: U+2001 between two directives that end an accTitle
line of an architecture diagram] [test: U+2001 between two directives, spaces
after the last, in an accDescr line of an architecture diagram] [test: U+2002
between two directives that end an accTitle line of an architecture diagram]
[test: U+2002 between two directives, spaces after the last, in an accDescr line
of an architecture diagram] [test: U+2003 between two directives that end an
accTitle line of an architecture diagram] [test: U+2003 between two directives,
spaces after the last, in an accDescr line of an architecture diagram] [test:
U+2004 between two directives that end an accTitle line of an architecture
diagram] [test: U+2004 between two directives, spaces after the last, in an
accDescr line of an architecture diagram] [test: U+2005 between two directives
that end an accTitle line of an architecture diagram] [test: U+2005 between two
directives, spaces after the last, in an accDescr line of an architecture
diagram] [test: U+2006 between two directives that end an accTitle line of an
architecture diagram] [test: U+2006 between two directives, spaces after the
last, in an accDescr line of an architecture diagram] [test: U+2007 between two
directives that end an accTitle line of an architecture diagram] [test: U+2007
between two directives, spaces after the last, in an accDescr line of an
architecture diagram] [test: U+2008 between two directives that end an accTitle
line of an architecture diagram] [test: U+2008 between two directives, spaces
after the last, in an accDescr line of an architecture diagram] [test: U+2009
between two directives that end an accTitle line of an architecture diagram]
[test: U+2009 between two directives, spaces after the last, in an accDescr line
of an architecture diagram] [test: U+200A between two directives that end an
accTitle line of an architecture diagram] [test: U+200A between two directives,
spaces after the last, in an accDescr line of an architecture diagram] [test:
U+202F between two directives that end an accTitle line of an architecture
diagram] [test: U+202F between two directives, spaces after the last, in an
accDescr line of an architecture diagram] [test: U+205F between two directives
that end an accTitle line of an architecture diagram] [test: U+205F between two
directives, spaces after the last, in an accDescr line of an architecture
diagram] [test: U+3000 between two directives that end an accTitle line of an
architecture diagram] [test: U+3000 between two directives, spaces after the
last, in an accDescr line of an architecture diagram] [test: U+FEFF between two
directives that end an accTitle line of an architecture diagram] [test: U+FEFF
between two directives, spaces after the last, in an accDescr line of an
architecture diagram] [test: U+2028 between two directives that end an accTitle
line of an architecture diagram] [test: U+2028 between two directives, spaces
after the last, in an accDescr line of an architecture diagram] [test: U+2029
between two directives that end an accTitle line of an architecture diagram]
[test: U+2029 between two directives, spaces after the last, in an accDescr line
of an architecture diagram] [test: a no-break space between two directives, a
comment touching the last, in an accTitle line of an architecture diagram]
[test: a no-break space between two directives, a space and a comment after the
last, in an accTitle line of an architecture diagram] [test: a no-break space
between two directives, spaces and a comment after the last, in an accTitle line
of an architecture diagram] [test: U+2003 between two directives, a comment
touching the last, in an accTitle line of an architecture diagram] [test: U+2003
between two directives, a space and a comment after the last, in an accTitle
line of an architecture diagram] [test: U+2003 between two directives, spaces
and a comment after the last, in an accTitle line of an architecture diagram]
[test: a run before the directive after a U+2028 inside the text of an accTitle
line of an architecture diagram] [test: spaces after the directive after a
U+2028 inside the text of an accTitle line of an architecture diagram] [test:
U+000B before a directive that a comment touches in an accTitle line of an
architecture diagram] [test: U+000C before a directive that a comment touches in
an accTitle line of an architecture diagram] [test: a no-break space before a
directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+1680 before a directive that a comment touches in an accTitle line of
an architecture diagram] [test: U+2000 before a directive that a comment touches
in an accTitle line of an architecture diagram] [test: U+2001 before a directive
that a comment touches in an accTitle line of an architecture diagram] [test:
U+2002 before a directive that a comment touches in an accTitle line of an
architecture diagram] [test: U+2003 before a directive that a comment touches in
an accTitle line of an architecture diagram] [test: U+2004 before a directive
that a comment touches in an accTitle line of an architecture diagram] [test:
U+2005 before a directive that a comment touches in an accTitle line of an
architecture diagram] [test: U+2006 before a directive that a comment touches in
an accTitle line of an architecture diagram] [test: U+2007 before a directive
that a comment touches in an accTitle line of an architecture diagram] [test:
U+2008 before a directive that a comment touches in an accTitle line of an
architecture diagram] [test: U+2009 before a directive that a comment touches in
an accTitle line of an architecture diagram] [test: U+200A before a directive
that a comment touches in an accTitle line of an architecture diagram] [test:
U+202F before a directive that a comment touches in an accTitle line of an
architecture diagram] [test: U+205F before a directive that a comment touches in
an accTitle line of an architecture diagram] [test: U+3000 before a directive
that a comment touches in an accTitle line of an architecture diagram] [test:
U+FEFF before a directive that a comment touches in an accTitle line of an
architecture diagram] [test: a no-break space and spaces before a directive that
a comment touches in an accTitle line of an architecture diagram] [test: a
no-break space and a tab before the directive that ends an accTitle line of an
architecture diagram] [test: U+000B and spaces before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+000C and spaces before the first of two directives that spaces
separate, in an accTitle line of an architecture diagram] [test: a no-break
space and spaces before the first of two directives that spaces separate, in an
accTitle line of an architecture diagram] [test: U+1680 and spaces before the
first of two directives that spaces separate, in an accTitle line of an
architecture diagram] [test: U+2000 and spaces before the first of two
directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2001 and spaces before the first of two directives that spaces
separate, in an accTitle line of an architecture diagram] [test: U+2002 and
spaces before the first of two directives that spaces separate, in an accTitle
line of an architecture diagram] [test: U+2003 and spaces before the first of
two directives that spaces separate, in an accTitle line of an architecture
diagram] [test: U+2004 and spaces before the first of two directives that spaces
separate, in an accTitle line of an architecture diagram] [test: U+2005 and
spaces before the first of two directives that spaces separate, in an accTitle
line of an architecture diagram] [test: U+2006 and spaces before the first of
two directives that spaces separate, in an accTitle line of an architecture
diagram] [test: U+2007 and spaces before the first of two directives that spaces
separate, in an accTitle line of an architecture diagram] [test: U+2008 and
spaces before the first of two directives that spaces separate, in an accTitle
line of an architecture diagram] [test: U+2009 and spaces before the first of
two directives that spaces separate, in an accTitle line of an architecture
diagram] [test: U+200A and spaces before the first of two directives that spaces
separate, in an accTitle line of an architecture diagram] [test: U+202F and
spaces before the first of two directives that spaces separate, in an accTitle
line of an architecture diagram] [test: U+205F and spaces before the first of
two directives that spaces separate, in an accTitle line of an architecture
diagram] [test: U+3000 and spaces before the first of two directives that spaces
separate, in an accTitle line of an architecture diagram] [test: U+FEFF and
spaces before the first of two directives that spaces separate, in an accTitle
line of an architecture diagram] [test: a no-break space and a tab before the
first of two directives that a space separates, in an accTitle line of an
architecture diagram] [test: a no-break space before the first of two directives
that a tab separates, in an accTitle line of an architecture diagram] [test:
U+2003 and a tab before the first of two directives that a space separates, in
an accTitle line of an architecture diagram] [test: U+2003 before the first of
two directives that a tab separates, in an accTitle line of an architecture
diagram] [test: U+2028 before the first of two directives that a tab separates,
in an accTitle line of an architecture diagram] [test: U+2029 before the first
of two directives that a tab separates, in an accTitle line of an architecture
diagram] [test: a U+2028 inside the directive that ends an accTitle line, spaces
before it, of an architecture diagram] [test: a U+2028 inside the directive that
ends an accTitle line, spaces after it, of an architecture diagram] [test: a
U+2029 inside the directive that ends an accTitle line, spaces before it, of an
architecture diagram] [test: a U+2029 inside the directive that ends an accTitle
line, spaces after it, of an architecture diagram] [test: a line break inside
the directive that ends an accTitle line, spaces before it, of an architecture
diagram] [test: a line break inside the directive that ends an accTitle line,
spaces after it, of an architecture diagram] [test: a U+2028 inside the
directive that ends an accDescr line, spaces before it, of an architecture
diagram] [test: a U+2028 inside the directive that ends an accDescr line, spaces
after it, of an architecture diagram] [test: a U+2029 inside the directive that
ends an accDescr line, spaces before it, of an architecture diagram] [test: a
U+2029 inside the directive that ends an accDescr line, spaces after it, of an
architecture diagram] [test: a line break inside the directive that ends an
accDescr line, spaces before it, of an architecture diagram] [test: a line break
inside the directive that ends an accDescr line, spaces after it, of an
architecture diagram] [test: U+000B between the colon and the directive of an
accTitle line of directives only of an architecture diagram] [test: U+000C
between the colon and the directive of an accTitle line of directives only of an
architecture diagram] [test: a no-break space between the colon and the
directive of an accTitle line of directives only of an architecture diagram]
[test: U+1680 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+2000 between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2001 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+2002 between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2003 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+2004 between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2005 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+2006 between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2007 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+2008 between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2009 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+200A between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+202F between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+205F between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: U+3000 between the colon and the directive of an accTitle line of
directives only of an architecture diagram] [test: U+FEFF between the colon and
the directive of an accTitle line of directives only of an architecture diagram]
[test: a directive that touches the keyword of a title of directives only of an
architecture diagram] [test: the gap before the colon of an accDescr line of
directives only of an architecture diagram] [test: spaces after the directive of
an accDescr line of directives only of an architecture diagram] [test: released
output that the document does not state: U+000B between a semicolon that the
line rule ignores and a second semicolon, a directive after them, in an accDescr
line of an architecture diagram] [test: released output that the document does
not state: U+000C between a semicolon that the line rule ignores and a second
semicolon, a directive after them, in an accDescr line of an architecture
diagram] [test: released output that the document does not state: a no-break
space between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accDescr line of an architecture diagram] [test:
released output that the document does not state: U+1680 between a semicolon
that the line rule ignores and a second semicolon, a directive after them, in an
accDescr line of an architecture diagram] [test: released output that the
document does not state: U+2000 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in an accDescr line of an
architecture diagram] [test: released output that the document does not state:
U+2001 between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accDescr line of an architecture diagram] [test:
released output that the document does not state: U+2002 between a semicolon
that the line rule ignores and a second semicolon, a directive after them, in an
accDescr line of an architecture diagram] [test: released output that the
document does not state: U+2003 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in an accDescr line of an
architecture diagram] [test: released output that the document does not state:
U+2004 between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accDescr line of an architecture diagram] [test:
released output that the document does not state: U+2005 between a semicolon
that the line rule ignores and a second semicolon, a directive after them, in an
accDescr line of an architecture diagram] [test: released output that the
document does not state: U+2006 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in an accDescr line of an
architecture diagram] [test: released output that the document does not state:
U+2007 between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accDescr line of an architecture diagram] [test:
released output that the document does not state: U+2008 between a semicolon
that the line rule ignores and a second semicolon, a directive after them, in an
accDescr line of an architecture diagram] [test: released output that the
document does not state: U+2009 between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in an accDescr line of an
architecture diagram] [test: released output that the document does not state:
U+200A between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accDescr line of an architecture diagram] [test:
released output that the document does not state: U+202F between a semicolon
that the line rule ignores and a second semicolon, a directive after them, in an
accDescr line of an architecture diagram] [test: released output that the
document does not state: U+205F between a semicolon that the line rule ignores
and a second semicolon, a directive after them, in an accDescr line of an
architecture diagram] [test: released output that the document does not state:
U+3000 between a semicolon that the line rule ignores and a second semicolon, a
directive after them, in an accDescr line of an architecture diagram] [test:
released output that the document does not state: U+FEFF between a semicolon
that the line rule ignores and a second semicolon, a directive after them, in an
accDescr line of an architecture diagram] [test: spaces between two directives
after a U+2028 inside the text of an accTitle line of an architecture diagram]
[test: spaces after the directive after a U+2029 inside the text of an accTitle
line of an architecture diagram] [test: a run before the directive after a
U+2029 inside the text of an accTitle line of an architecture diagram] [test: a
run before two directives that touch after a U+2028 inside the text of an
accTitle line of an architecture diagram] [test: spaces between two directives
after a U+2028 inside the text of an accDescr line of an architecture diagram]
[test: spaces after the directive after a U+2029 inside the text of an accDescr
line of an architecture diagram] [test: a run before the directive after a
U+2029 inside the text of an accDescr line of an architecture diagram] [test: a
run before two directives that touch after a U+2028 inside the text of an
accDescr line of an architecture diagram] [test: a wide space before two
directives that spaces separate, in an accDescr line of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches
the last, in an accTitle line of an architecture diagram] [test: a wide space
before two directives that touch and a comment that touches the last, in an
accDescr line of an architecture diagram] [test: a U+2028 before two directives
that touch, in an accDescr line of an architecture diagram] [test: a U+2028
before a directive that spaces follow, in an accTitle line of an architecture
diagram] [test: a U+2028 before a directive that spaces follow, in an accDescr
line of an architecture diagram] [test: a U+2028 before two directives that
spaces separate, in an accDescr line of an architecture diagram] [test: a U+2028
inside the text, spaces before the directive, in an accDescr line of an
architecture diagram] [test: a value of directives only, spaces after the
directive, in an accTitle line of an architecture diagram] [test: a directive
inside the text, spaces before and after the last directive, in an accTitle line
of an architecture diagram] [test: a directive inside the text, spaces before
and after the last directive, in an accDescr line of an architecture diagram]
[test: a `;` in the text, spaces between two directives, in an accDescr line of
an architecture diagram] [test: a `;` between two directives, spaces around it,
in an accTitle line of an architecture diagram] [test: a `;` between two
directives, spaces around it, in an accDescr line of an architecture diagram]
[test: a `;` after the last directive, in an accTitle line of an architecture
diagram] [test: a `;` after the last directive, in an accDescr line of an
architecture diagram] [test: a `;` after the last directive, a U+2028 before the
directives, a comment after it, in an accTitle line of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment
after it, in an accDescr line of an architecture diagram] [test: a `;` between
two directives, a U+2028 before the directives, a comment after them, in an
accTitle line of an architecture diagram] [test: a `;` between two directives, a
U+2028 before the directives, a comment after them, in an accDescr line of an
architecture diagram] [test: two U+2028 before the directive that ends an
accTitle line, of an architecture diagram] [test: U+2029 and U+2028 before the
directive that ends an accDescr line, of an architecture diagram] [test: two
U+2028 before the directive that ends an accTitle line, spaces after it, of an
architecture diagram] [test: two U+2029 before a directive that a space and
another directive follow in an accDescr line, of an architecture diagram] [test:
a U+2028 inside the directive that ends an accDescr line, spaces before it, a
comment after two spaces, of an architecture diagram] [test: a line break inside
the directive that ends an accTitle line, a comment after two spaces, of an
architecture diagram] [test: a directive that starts the text of a title, tabs
before and after it, of an architecture diagram] [test: a directive that touches
the keyword of a title, a space and a text after it, of an architecture diagram]
[test: a directive that touches the colon of an accTitle line, a space and a
text after it, of an architecture diagram] [test: a directive that starts the
text of an accTitle line, two spaces and a text after it, spaces at the end, of
an architecture diagram] [test: a directive that starts the text of an accDescr
line, two spaces and a text after it, spaces at the end, of an architecture
diagram] [test: a `;` at the end of a title, a tab after the keyword, spaces
after the `;`, of an architecture diagram] [test: a `;` at the end of an
accTitle line, a gap before the colon, of an architecture diagram] [test: a `;`
at the end of an accDescr line, a run of spaces inside the text, of an
architecture diagram] [test: a `;` at the end of an accTitle line, a tab after
the colon, spaces after the `;`, of an architecture diagram] [test: a `;` at the
end of an accDescr line, a gap before the colon, of an architecture diagram]
[test: a comment after the text of an accTitle line, spaces before it, of an
architecture diagram] [test: a comment after the text of an accDescr line,
spaces before it, of an architecture diagram] [test: a run of spaces inside the
text of an accDescr line, of an architecture diagram] [test: a run of spaces
inside the text of an accTitle line, of an architecture diagram] [test: a run of
spaces inside a quoted string in an accDescr line, of an architecture diagram]
[test: released output that the document does not state: text after the `;` that
the line rule ignores in an accDescr line, runs before and after it, of an
architecture diagram] [test: nothing after the `;` that the line rule ignores in
an accDescr line, runs before it, of an architecture diagram] [test: released
output that the document does not state: two touching `;` that the line rule
reads in an accDescr line, a run before them, of an architecture diagram] [test:
released output that the document does not state: text after the `;` that the
line rule ignores in an accTitle line, of an architecture diagram] [test:
released output that the document does not state: a `;` inside the comment at
the end of an accTitle line, a gap before the colon, spaces at the end, of an
architecture diagram] [test: a gap before and after the colon of an accTitle
line, nothing after the `;` that the line rule ignores, of an architecture
diagram] [test: U+2028 before a directive that a comment touches, a line
follows, in an accTitle line of an architecture diagram] [test: U+2028 before a
directive that a comment touches, the text ends, in an accTitle line of an
architecture diagram] [test: U+2028 before a directive that a comment follows
after spaces, a line follows, in an accTitle line of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, the text
ends, in an accTitle line of an architecture diagram] [test: U+2029 before a
directive that a comment touches, a line follows, in an accTitle line of an
architecture diagram] [test: U+2029 before a directive that a comment touches,
the text ends, in an accTitle line of an architecture diagram] [test: U+2029
before a directive that a comment follows after spaces, a line follows, in an
accTitle line of an architecture diagram] [test: U+2029 before a directive that
a comment follows after spaces, the text ends, in an accTitle line of an
architecture diagram] [test: U+2028 before a directive that a comment touches, a
line follows, in an accDescr line of an architecture diagram] [test: U+2028
before a directive that a comment touches, the text ends, in an accDescr line of
an architecture diagram] [test: U+2028 before a directive that a comment follows
after spaces, a line follows, in an accDescr line of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, the text
ends, in an accDescr line of an architecture diagram] [test: U+2029 before a
directive that a comment touches, a line follows, in an accDescr line of an
architecture diagram] [test: U+2029 before a directive that a comment touches,
the text ends, in an accDescr line of an architecture diagram] [test: U+2029
before a directive that a comment follows after spaces, a line follows, in an
accDescr line of an architecture diagram] [test: U+2029 before a directive that
a comment follows after spaces, the text ends, in an accDescr line of an
architecture diagram] [test: a U+2028 inside the text, a directive, and a
comment after spaces, in an accTitle line of an architecture diagram] [test: a
U+2028 inside the text, a directive that a comment touches, in an accTitle line
of an architecture diagram] [test: a U+2029 inside the text, a directive, and a
comment after spaces, in an accDescr line of an architecture diagram] [test: a
U+2028 inside the text, two directives that touch, and a comment after spaces,
in an accDescr line of an architecture diagram] [test: a wide space before two
directives that spaces separate, the text ends, in an accTitle line of an
architecture diagram] [test: a wide space before two directives that spaces
separate, the text ends, in an accDescr line of an architecture diagram] [test:
a wide space before a directive that spaces and a comment follow, the text ends,
in an accTitle line of an architecture diagram] [test: a wide space before a
directive that spaces and a comment follow, the text ends, in an accDescr line
of an architecture diagram] [test: a wide space before two directives that touch
and a comment that touches the last, the text ends, in an accTitle line of an
architecture diagram] [test: a wide space before two directives that touch and a
comment that touches the last, the text ends, in an accDescr line of an
architecture diagram] [test: a U+2028 before two directives that touch, the text
ends, in an accTitle line of an architecture diagram] [test: a U+2028 before two
directives that touch, the text ends, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that spaces follow, the text ends,
in an accTitle line of an architecture diagram] [test: a U+2028 before a
directive that spaces follow, the text ends, in an accDescr line of an
architecture diagram] [test: a U+2028 before two directives that spaces
separate, the text ends, in an accTitle line of an architecture diagram] [test:
a U+2028 before two directives that spaces separate, the text ends, in an
accDescr line of an architecture diagram] [test: a directive that holds a line
break, spaces before it, the text ends, in an accTitle line of an architecture
diagram] [test: a directive that holds a line break, spaces before it, the text
ends, in an accDescr line of an architecture diagram] [test: a directive that
holds a U+2028, spaces before it, the text ends, in an accTitle line of an
architecture diagram] [test: a directive that holds a U+2028, spaces before it,
the text ends, in an accDescr line of an architecture diagram] [test: a U+2028
inside the text, spaces before the directive, the text ends, in an accTitle line
of an architecture diagram] [test: a U+2028 inside the text, spaces before the
directive, the text ends, in an accDescr line of an architecture diagram] [test:
a value of directives only, spaces after the directive, the text ends, in an
accTitle line of an architecture diagram] [test: a value of directives only,
spaces after the directive, the text ends, in an accDescr line of an
architecture diagram] [test: a directive inside the text, spaces before and
after the last directive, the text ends, in an accTitle line of an architecture
diagram] [test: a directive inside the text, spaces before and after the last
directive, the text ends, in an accDescr line of an architecture diagram] [test:
a `;` in the text, spaces before the directive, the text ends, in an accTitle
line of an architecture diagram] [test: a `;` in the text, spaces before the
directive, the text ends, in an accDescr line of an architecture diagram] [test:
a `;` in the text, spaces between two directives, the text ends, in an accTitle
line of an architecture diagram] [test: a `;` in the text, spaces between two
directives, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` between two directives, spaces around it, the text ends, in an
accTitle line of an architecture diagram] [test: a `;` between two directives,
spaces around it, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` after the last directive, the text ends, in an accTitle line of an
architecture diagram] [test: a `;` after the last directive, the text ends, in
an accDescr line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, the text ends, in an accTitle line of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a comment line follows, in an accTitle line of an architecture
diagram] [test: a U+2028 before a directive that spaces and a comment follow, an
empty line follows, in an accTitle line of an architecture diagram] [test: a
U+2028 before a directive that spaces and a comment follow, a line of whitespace
follows, in an accTitle line of an architecture diagram] [test: a U+2028 before
a directive that spaces and a comment follow, a directive line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, a comment line and a statement follow, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, an empty line and a statement follow, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, the text ends, in an accDescr line of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a comment line follows, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that spaces and a comment follow, an
empty line follows, in an accDescr line of an architecture diagram] [test: a
U+2028 before a directive that spaces and a comment follow, a line of whitespace
follows, in an accDescr line of an architecture diagram] [test: a U+2028 before
a directive that spaces and a comment follow, a directive line follows, in an
accDescr line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, a comment line and a statement follow, in an
accDescr line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, an empty line and a statement follow, in an
accDescr line of an architecture diagram] [test: a U+2028 before two directives
that a wide space separates, a comment after them, the text ends, in an accTitle
line of an architecture diagram] [test: a U+2028 before two directives that a
wide space separates, a comment after them, a comment line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before two directives
that a wide space separates, a comment after them, an empty line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before two directives
that a wide space separates, a comment after them, a line of whitespace follows,
in an accTitle line of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a directive line
follows, in an accTitle line of an architecture diagram] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a comment line
and a statement follow, in an accTitle line of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
an empty line and a statement follow, in an accTitle line of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, the text ends, in an accDescr line of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a comment line follows, in an accDescr line of an
architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, an empty line follows, in an accDescr line of
an architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, a line of whitespace follows, in an accDescr
line of an architecture diagram] [test: a U+2028 before two directives that a
wide space separates, a comment after them, a directive line follows, in an
accDescr line of an architecture diagram] [test: a U+2028 before two directives
that a wide space separates, a comment after them, a comment line and a
statement follow, in an accDescr line of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
an empty line and a statement follow, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, the text ends, in an accTitle line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, a comment line
follows, in an accTitle line of an architecture diagram] [test: a U+2028 before
a directive that a wide space and a comment follow, an empty line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that a wide space and a comment follow, a line of whitespace follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that a wide space and a comment follow, a directive line follows, in an accTitle
line of an architecture diagram] [test: a U+2028 before a directive that a wide
space and a comment follow, a comment line and a statement follow, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that a wide space and a comment follow, an empty line and a statement follow, in
an accTitle line of an architecture diagram] [test: a U+2028 before a directive
that a wide space and a comment follow, the text ends, in an accDescr line of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, a comment line follows, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, an empty line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
line of whitespace follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
directive line follows, in an accDescr line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, a comment line
and a statement follow, in an accDescr line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, an empty line
and a statement follow, in an accDescr line of an architecture diagram] [test: a
U+2028 before a directive that spaces and a comment follow, an indented
directive line follows, in an accTitle line of an architecture diagram] [test: a
U+2028 before a directive that spaces and a comment follow, a directive and
spaces follow, in an accTitle line of an architecture diagram] [test: a U+2028
before a directive that spaces and a comment follow, two directives that touch
follow, in an accTitle line of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, a directive and a comment on a line
follow, in an accTitle line of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, a line of a no-break space follows,
in an accTitle line of an architecture diagram] [test: a U+2028 before a
directive that spaces and a comment follow, a line of a tab follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, an indented comment line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, an indented directive line follows, in an
accDescr line of an architecture diagram] [test: a U+2028 before a directive
that spaces and a comment follow, a directive and spaces follow, in an accDescr
line of an architecture diagram] [test: a U+2028 before a directive that spaces
and a comment follow, two directives that touch follow, in an accDescr line of
an architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a directive and a comment on a line follow, in an accDescr line
of an architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a no-break space follows, in an accDescr line of an
architecture diagram] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a tab follows, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that spaces and a comment follow, an
indented comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment
after them, an indented directive line follows, in an accTitle line of an
architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, a directive and spaces follow, in an accTitle
line of an architecture diagram] [test: a U+2028 before two directives that a
wide space separates, a comment after them, two directives that touch follow, in
an accTitle line of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a directive and a
comment on a line follow, in an accTitle line of an architecture diagram] [test:
a U+2028 before two directives that a wide space separates, a comment after
them, a line of a no-break space follows, in an accTitle line of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a line of a tab follows, in an accTitle line of an
architecture diagram] [test: a U+2028 before two directives that a wide space
separates, a comment after them, an indented comment line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 before two directives
that a wide space separates, a comment after them, an indented directive line
follows, in an accDescr line of an architecture diagram] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a directive
and spaces follow, in an accDescr line of an architecture diagram] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
two directives that touch follow, in an accDescr line of an architecture
diagram] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a directive and a comment on a line follow, in an accDescr
line of an architecture diagram] [test: a U+2028 before two directives that a
wide space separates, a comment after them, a line of a no-break space follows,
in an accDescr line of an architecture diagram] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a line of a tab
follows, in an accDescr line of an architecture diagram] [test: a U+2028 before
two directives that a wide space separates, a comment after them, an indented
comment line follows, in an accDescr line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, an indented
directive line follows, in an accTitle line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, a directive
and spaces follow, in an accTitle line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, two directives
that touch follow, in an accTitle line of an architecture diagram] [test: a
U+2028 before a directive that a wide space and a comment follow, a directive
and a comment on a line follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
line of a no-break space follows, in an accTitle line of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, a line of a tab follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an
indented comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an
indented directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
directive and spaces follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, two
directives that touch follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a
directive and a comment on a line follow, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, a line of a no-break space follows, in an accDescr line of an
architecture diagram] [test: a U+2028 before a directive that a wide space and a
comment follow, a line of a tab follows, in an accDescr line of an architecture
diagram] [test: a U+2028 before a directive that a wide space and a comment
follow, an indented comment line follows, in an accDescr line of an architecture
diagram] [test: a `;` after the last directive, a U+2028 before the directives,
a comment after it, the text ends, in an accTitle line of an architecture
diagram] [test: a `;` after the last directive, a U+2028 before the directives,
a comment after it, the text ends, in an accDescr line of an architecture
diagram] [test: a `;` between two directives, a U+2028 before the directives, a
comment after them, the text ends, in an accTitle line of an architecture
diagram] [test: a `;` between two directives, a U+2028 before the directives, a
comment after them, the text ends, in an accDescr line of an architecture
diagram] [test: a U+2028 after the last directive that spaces and a comment
follow, the text ends, in an accTitle line of an architecture diagram] [test: a
U+2028 after the last directive that spaces and a comment follow, a comment line
follows, in an accTitle line of an architecture diagram] [test: a U+2028 after
the last directive that spaces and a comment follow, an empty line follows, in
an accTitle line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a line of whitespace follows, in an
accTitle line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a directive line follows, in an
accTitle line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a comment line and a statement
follow, in an accTitle line of an architecture diagram] [test: a U+2028 after
the last directive that spaces and a comment follow, an empty line and a
statement follow, in an accTitle line of an architecture diagram] [test: a
U+2028 after the last directive that spaces and a comment follow, the text ends,
in an accDescr line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a comment line follows, in an
accDescr line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, an empty line follows, in an
accDescr line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a line of whitespace follows, in an
accDescr line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a directive line follows, in an
accDescr line of an architecture diagram] [test: a U+2028 after the last
directive that spaces and a comment follow, a comment line and a statement
follow, in an accDescr line of an architecture diagram] [test: a U+2028 after
the last directive that spaces and a comment follow, an empty line and a
statement follow, in an accDescr line of an architecture diagram] [test: a
U+2028 between two directives, spaces and a comment after the last one, the text
ends, in an accTitle line of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, a comment line follows,
in an accTitle line of an architecture diagram] [test: a U+2028 between two
directives, spaces and a comment after the last one, an empty line follows, in
an accTitle line of an architecture diagram] [test: a U+2028 between two
directives, spaces and a comment after the last one, a line of whitespace
follows, in an accTitle line of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, a directive line
follows, in an accTitle line of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, a comment line and a
statement follow, in an accTitle line of an architecture diagram] [test: a
U+2028 between two directives, spaces and a comment after the last one, an empty
line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one,
the text ends, in an accDescr line of an architecture diagram] [test: a U+2028
between two directives, spaces and a comment after the last one, a comment line
follows, in an accDescr line of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, an empty line follows,
in an accDescr line of an architecture diagram] [test: a U+2028 between two
directives, spaces and a comment after the last one, a line of whitespace
follows, in an accDescr line of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, a directive line
follows, in an accDescr line of an architecture diagram] [test: a U+2028 between
two directives, spaces and a comment after the last one, a comment line and a
statement follow, in an accDescr line of an architecture diagram] [test: a
U+2028 between two directives, spaces and a comment after the last one, an empty
line and a statement follow, in an accDescr line of an architecture diagram]
[test: a directive that two spaces follow, before a comment line after a U+2028
before a directive, the text ends, in an accTitle line of an architecture
diagram] [test: a directive that two spaces follow, before a comment line after
a U+2028 before a directive, the text ends, in an accDescr line of an
architecture diagram] [test: U+2028 between two directives and after the last, a
comment follows after spaces, the text ends, in an accTitle line of an
architecture diagram] [test: U+2028 between two directives and after the last, a
comment follows after spaces, the text ends, in an accDescr line of an
architecture diagram] [test: U+2028 between two directives and after the last,
two spaces after the first, a comment touches the last U+2028, the text ends, in
an accTitle line of an architecture diagram] [test: U+2028 between two
directives and after the last, two spaces after the first, a comment touches the
last U+2028, the text ends, in an accDescr line of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between
the second and the third, a comment follows the third after a space, the text
ends, in an accTitle line of an architecture diagram] [test: U+2028 between the
first and the second of three directives and between the second and the third, a
comment follows the third after a space, the text ends, in an accDescr line of
an architecture diagram] [test: accTitle with a gap before the colon, a `;`
before a U+2028, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` after the U+2028, the text
ends, in an accTitle line of an architecture diagram] [test: accDescr with a gap
before the colon, a `;` before a U+2028, the text ends, in an accDescr line of
an architecture diagram] [test: accDescr with a gap before the colon, a `;`
after the U+2028, the text ends, in an accDescr line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` inside a directive that
touches the text, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` inside a comment after the
text, the text ends, in an accTitle line of an architecture diagram] [test:
accTitle with a gap before the colon, a `;` right after the colon and a U+2028
after it, the text ends, in an accTitle line of an architecture diagram] [test:
a `;` before the U+2028 between two directives, a comment follows the last
directive after two spaces, the text ends, in an accTitle line of an
architecture diagram] [test: two U+2028 with two spaces on each side between two
directives, a comment follows the last directive after two spaces, the text
ends, in an accTitle line of an architecture diagram] [test: accTitle with a gap
before the colon, a U+2028 before a `;`, and a second U+2028 after the `;`, the
text ends, in an accTitle line of an architecture diagram] [test: accDescr with
a gap before the colon, a U+2028 before a `;`, and a second U+2028 after the
`;`, the text ends, in an accDescr line of an architecture diagram] [test:
accTitle with a gap before the colon, a `;` before two U+2028, the text ends, in
an accTitle line of an architecture diagram] [test: accTitle with a gap before
the colon, a `;` inside a directive that a U+2028 follows, the text ends, in an
accTitle line of an architecture diagram] [test: accTitle with a gap before the
colon, a `;` inside a comment that a U+2028 follows, the text ends, in an
accTitle line of an architecture diagram] [test: accTitle with a gap before the
colon, a U+2028 inside a directive and a `;` after it inside the same directive,
the text ends, in an accTitle line of an architecture diagram] [test: accTitle
with a gap before the colon, a U+2028 inside a directive and no `;`, the text
ends, in an accTitle line of an architecture diagram] [test: accTitle with a gap
before the colon, a U+2028 inside a directive and a `;` inside a directive after
it, the text ends, in an accTitle line of an architecture diagram] [test:
accTitle with a gap before the colon, a U+2028 inside a comment and a `;` after
it in the comment, the text ends, in an accTitle line of an architecture
diagram] [test: accTitle with a gap before the colon, a U+2028 inside a comment
and no `;`, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 between the text and a directive, a U+2028 between the directive
and the comment, an empty line and a statement follow, in an accTitle line of an
architecture diagram] [test: a U+2028 before a directive that a comment follows
after two spaces, an empty line and a statement follow, in an accTitle line of
an architecture diagram] [test: a U+2028 before a directive that a comment
follows after two spaces, a comment line follows, in an accTitle line of an
architecture diagram] [test: a comment after the last directive after two
spaces, a comment line that holds a `;` follows, in an accTitle line of an
architecture diagram]

[fixture: architecture/accessibility-lines/accdescr-spacing]

[fixture: architecture/accessibility-lines/acctitle-spacing]

[fixture: architecture/accessibility-lines/empty-next-statement]

[corpus fixture: architecture/common-acctitle-next-statement]

[corpus fixture: architecture/common-accdescr-next-statement]

[corpus fixture: architecture/common-repeat-empty]

Input (escaped):
`"architecture-beta\naccTitle: %% note\n\naccDescr: %% note\nservice a\n"`.

Output
([accessibility-lines/a11y-empty-comment-gap-output.mmd](../tests/fixtures/architecture/accessibility-lines/a11y-empty-comment-gap-output.mmd)):

```mmd
architecture-beta
  accTitle: %% note

  accDescr: %% note
  service a
```

### Description blocks

Description blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
For blocks that keep their braces, separate the keyword and opening brace with
one space so the block boundary is clear.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the space:
Prettier prints one space between a keyword and the `{` of its block
(`try  { a }` is printed with `try {`, and `else   { z }` with `else {`).
Whitespace-only interiors become `{}` because no text needs surrounding space.
Plain opener whitespace can join; real trivia keeps its break.

A line break next to a comment or a directive stays. A U+2028 or U+2029 after
`accDescr`, with or without a space before it, is printed as a line break when a
comment follows it, with the comment on a line of its own one level deeper, and
as one space when only a directive follows it and the `{` stands on a later
line, with the directive on the line of `accDescr`. When a comment follows the
directive, the directive and the comment stand on a line of their own one level
deeper, as the comment does. Where the `{` follows the directive on its line,
the line stays as written. Rule 2 gives no one form for the separator: the
formatter, run on `accDescr`, a U+2028, and a comment, prints them as written in
sequence, gantt, and journey, and prints a line break in radar, as it does in
architecture, so the released form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

The line that holds the `{` after a comment or a directive stands at the level
of its statement. Of the 23 other diagram types that accept the form, c4, class,
er, flowchart, gantt, journey, quadrant, requirement, sequence, state, timeline,
and xychart print it one level deeper, with the comment line, and cynefin,
gitgraph, info, ishikawa, packet, pie, radar, railroad, treemap, treeview, and
wardley print it at the level of the statement. Rule 2 gives no one form for it,
so the released form stays until it is decided.

[fixture: architecture/description-blocks/opener-trivia] [test:
architecture/description-blocks/keyword-u2028-before-directive-touching-comment]
[test:
architecture/description-blocks/keyword-u2029-before-directive-touching-comment]
[test:
architecture/description-blocks/keyword-u2028-before-directive-and-comment]
[test:
architecture/description-blocks/keyword-u2029-before-directive-and-comment]
[test:
architecture/description-blocks/keyword-space-u2028-before-directive-touching-comment]
[test:
architecture/description-blocks/keyword-space-u2029-before-directive-touching-comment]
[test:
architecture/description-blocks/keyword-space-u2028-before-directive-and-comment]
[test:
architecture/description-blocks/keyword-space-u2029-before-directive-and-comment]
[test: architecture/description-blocks/keyword-u2028-before-comment] [test:
architecture/description-blocks/keyword-u2029-before-comment] [test:
architecture/description-blocks/keyword-u2028-before-directive] [test:
architecture/description-blocks/keyword-u2029-before-directive] [test:
architecture/description-blocks/keyword-space-u2028-before-comment] [test:
architecture/description-blocks/keyword-space-u2029-before-comment] [test:
architecture/description-blocks/keyword-space-u2028-before-directive] [test:
architecture/description-blocks/keyword-space-u2029-before-directive] [test:
architecture/description-blocks/keyword-u2028-directive-then-brace-on-line]
[test:
architecture/description-blocks/keyword-u2029-directive-then-brace-on-line]
[test:
architecture/description-blocks/keyword-space-u2028-directive-then-brace-on-line]
[test:
architecture/description-blocks/keyword-u2028-directive-touching-brace-on-line]
[test:
architecture/description-blocks/keyword-u2028-directive-then-spaces-and-brace-on-line]

Keep comment/directive-only interiors. Rule 1 does not decide the depth of
comment lines at the boundary of a description block. For a block that holds
only comment lines, rule 2 decides the depth of those boundary comment lines, as
[flowchart](./flowchart.md#multi-line-values) keeps the comment lines of a block
without text and puts them one level inside the block. A separate `}` stands at
the level of the `accDescr`. No rule gives the interior of a block that holds a
directive: [flowchart](./flowchart.md#multi-line-values),
[xychart](./xychart.md#empty-description-blocks), and
[quadrant](./quadrant.md#empty-description-blocks) keep its contents and line
breaks, but their documents give that form no reason, and it is a question of
the list of undecided forms (D34), so their printing is no decided form, and the
released form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Ordinary description body and standalone comment lines align one level inside
the statement, since the Db removes indentation after LF. Keep line breaks and
interior blank lines, and the whitespace at the end of each line of text except
the last one; a line of whitespace only becomes an empty line. The whitespace at
the end of the last line of text is dropped where the closer stands on a line of
its own, and is printed as one space where the closer follows it on that line.
Rule 2 gives the level of the description text and boundary comment lines: the
formatter, run on a block of each of flowchart, sequence, state, gantt, journey,
timeline, pie, and radar, puts the text lines and the comment lines of the block
one level inside the statement and a separate closer at the level of the
statement, and the sections of [flowchart](./flowchart.md#multi-line-values),
[sequence](./sequence.md#multi-line-values),
[state](./state.md#multi-line-values),
[gantt](./gantt.md#accessibility-statements), and
[journey](./journey.md#accessibility-statements) state both. No rule gives the
line breaks, the empty lines, the whitespace at the end of each line, and the
last line of the block: those types print them in the same way, but in each of
them these forms are a question of the list of undecided forms (D38 and D39), so
their printing is no decided form, and the released form stays until it is
decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Directives and shared removed comment regions keep their complete source. A
separate closer aligns with the statement; the first closing brace still ends
the value. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
closer that level, as Prettier prints the closing line at the level of the line
that opens a block: the line that holds the `{` is the statement's line or,
where a comment or a directive stands before the `{`, a later line at the level
of the statement.

[fixture: architecture/description-blocks/brace-on-a-later-line]

[fixture: architecture/description-blocks/asymmetric] [fixture:
architecture/description-blocks/directive-line-between-keyword-and-brace]
[fixture: description-blocks/block-trailing-whitespace] [fixture:
description-blocks/block-trailing-whitespace-closer-on-the-text-line]

[fixture: architecture/description-blocks/block-empty-fixed]

[fixture: architecture/description-blocks/block-present-spaces-fixed]

[fixture: architecture/description-blocks/block-touching-fixed]

[fixture: architecture/description-blocks/empty-block-comment-only-fixed]

[fixture: architecture/description-blocks/empty-block-global-only-fixed]

[fixture: architecture/description-blocks/interior-trivia]

[corpus fixture: architecture/common-block-newline-gap]

[corpus fixture: architecture/common-block-comment-gap]

[corpus fixture: architecture/common-block-directive-gap]

[corpus fixture: architecture/common-description-block-comment]

[corpus fixture: architecture/common-description-block-directive]

[corpus fixture: architecture/common-block-whitespace]

[test: architecture/description-blocks/unicode-empty]

[test: architecture/description-blocks/unicode-opener]

Input (escaped):
`"architecture-beta\naccDescr{A }\naccDescr{ B}\naccDescr {C}\naccDescr\n\n{ D }\n"`.

Output
([description-blocks/asymmetric-output.mmd](../tests/fixtures/architecture/description-blocks/asymmetric-output.mmd)):

```mmd
architecture-beta
  accDescr: A
  accDescr: B
  accDescr: C
  accDescr: D
```

### Multiline values

Do not wrap at printWidth. Visible LF between ordinary components can reject
input, and reflowing text icons or labels can change their Db. Keep authored
physical label and text-icon lines, continuation columns and internal blanks.
Description bodies use the shared indentation above.

[fixture: architecture/multiline-values/continuation-columns]

[fixture: architecture/multiline-values/no-wrap-long-declaration]

[fixture: architecture/multiline-values/no-wrap-long-edge]

[corpus fixture: architecture/line-lf-string-title]

Input (escaped):
`"architecture-beta\nservice multi \"A\n   B\n\nC\" [\"D\n E\"]\naccDescr {\n  F\n\n G\n}\n"`.

Output
([multiline-values/continuation-columns-output.mmd](../tests/fixtures/architecture/multiline-values/continuation-columns-output.mmd)):

```mmd
architecture-beta
  service multi "A
   B

C" ["D
 E"]
  accDescr {
    F

    G
  }
```

### Comments

Align ordinary standalone comments one body step in, or column one before the
header. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts a
standalone comment line inside a block one level deeper than the line that opens
it, as Prettier prints the lines inside a block. Inline comments keep their
line. A comment that touches stays touching.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`. Preserve marks, content and trailing padding
for attachment. Native comments end at LF/CR and keep LS/PS as content. Earlier
values own enclosed percent text; common lines stop at it. Removed common
regions keep complete source and continuation columns.

[fixture: architecture/comments/comment-attachments] [fixture:
architecture/comments/inline-gap-run-before-comment]

[fixture: architecture/comments/value-ownership]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/comment-in-quoted-label]

[corpus fixture: architecture/comment-directive-in-mark]

[corpus fixture: architecture/comment-directive-in-value]

[test: architecture/comments/ls-ps-content]

Input (escaped):
`"architecture-beta\nservice percent \"A%%B\" [C%%D]\naccDescr {E%%F}\ntitle Topic%% inline\n"`.

Output
([comments/value-ownership-output.mmd](../tests/fixtures/architecture/comments/value-ownership-output.mmd)):

```mmd
architecture-beta
  service percent "A%%B" [C%%D]
  accDescr { E%%F }
  title Topic%% inline
```

### Global directives

Keep Root directive content, order and ownership. Within a printed line, place a
directive as under [Directives](./flowchart.md#directives). When formatting
splits units that were on the same line, a directive in their gap moves with the
following unit: its right boundary stays touching or separated, while its left
contact is broken. Ordinary standalone starts align one body step in; multiline
interiors and EOF-reaching endings stay written.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts a standalone
directive line inside a block one level deeper than the line that opens it, as
Prettier prints the lines inside a block. Common removal joins surrounding text,
so deleting component-boundary whitespace can reject a declaration. Preserve
component/value-internal directives rather than treating their opaque text as
JSON.

[fixture: architecture/global-directives/header-to-body] [fixture:
architecture/global-directives/header-split-both-separated] [fixture:
architecture/global-directives/header-split-left-separated-right-touching]

[fixture: architecture/global-directives/composite-boundaries]

[fixture: architecture/global-directives/global-both-separated]

[fixture: architecture/global-directives/global-left-touch-right-separated]

[fixture: architecture/global-directives/global-neither-side-separated]

[fixture: architecture/global-directives/global-side-spacing]

[fixture: architecture/global-directives/global-standalone]

[fixture: architecture/global-directives/inside-values]

[fixture: architecture/global-directives/multiline]

[corpus fixture: architecture/directive-fields]

[corpus fixture: architecture/directive-edge-components]

[corpus fixture: architecture/directive-parent-align-components]

[corpus fixture: architecture/directive-icon-delimiters]

[corpus fixture: architecture/directive-group-delimiters]

[corpus fixture: architecture/end-group-unclosed-directive]

[corpus fixture: architecture/end-junction-unclosed-directive]

Input (escaped):
`"architecture-beta\nservice composite(%%{wrap}%%cloud%%{wrap}%%)\nservice target\ncomposite{%%{wrap}%%group%%{wrap}%%} : R < %%{wrap}%% -- > L :target\n"`.

Output
([global-directives/composite-boundaries-output.mmd](../tests/fixtures/architecture/global-directives/composite-boundaries-output.mmd)):

```mmd
architecture-beta
  service composite(%%{wrap}%%cloud%%{wrap}%%)
  service target
  composite{%%{wrap}%%group%%{wrap}%%}:R <%%{wrap}%%--> L:target
```

### Hidden forms

Keep each ArchitectureIgnoredText exactly once in its named gap,
textBeforeHeader, body or textAfter owner, using its complete source span rather
than its trivia-filtered value. Native YAML and DIRECTIVE are opaque, not
frontmatter or Root directives. Body openers may indent; internal and closing
columns stay. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives
both: the line that opens a hidden form stands at the level of the lines around
it, as every line inside a block does, whatever it holds, and its later lines
keep their columns, as Prettier keeps the later lines of a block comment as
written where they do not all start with `*` (in a block, `    /* x` and
`  y */` are printed `  /* x` and `  y */`). Keep three-fence matches, separate
forms, later qualifying closers and internal global cuts. Earlier values retain
ownership of hidden-looking text; no native gap is invented inside icons or
modifiers.

[fixture: architecture/hidden-forms/body-directive]

[fixture: architecture/hidden-forms/body-yaml]

[fixture: architecture/hidden-forms/hidden-group-parent-gaps]

[fixture: architecture/hidden-forms/hidden-rhs-modifier-gap]

[fixture: architecture/hidden-forms/yaml-named-icon-title-and-parent-gaps]

[corpus fixture: architecture/hidden-directive-unit-gaps]

[corpus fixture: architecture/hidden-yaml-group-gap]

[corpus fixture: architecture/hidden-yaml-service-gap]

[corpus fixture: architecture/hidden-yaml-junction-gap]

[corpus fixture: architecture/hidden-yaml-parent-gap]

[corpus fixture: architecture/hidden-yaml-edge-gaps]

[corpus fixture: architecture/hidden-yaml-align-gap]

[corpus fixture: architecture/hidden-yaml-three-fences]

[corpus fixture: architecture/hidden-yaml-adjacent-later-closer]

[corpus fixture: architecture/lex-yaml-two-nonempty]

[corpus fixture: architecture/lex-yaml-global-directive]

[corpus fixture: architecture/lex-yaml-common-comment]

[corpus fixture: architecture/lex-yaml-selected-semicolon]

[corpus fixture: architecture/lex-native-directive-selected-semicolon]

[corpus fixture: architecture/hidden-directive-nonqualifying-close]

[corpus fixture: architecture/hidden-directive-close-glued]

[corpus fixture: architecture/hidden-directive-unclosed]

[corpus fixture: architecture/hidden-directive-inside-values]

[corpus fixture: architecture/hidden-yaml-inside-values]

[corpus fixture: architecture/gram-hidden-inside-icon]

[corpus fixture: architecture/gram-hidden-inside-modifier]

Input (escaped):
`"architecture-beta\n%%{!opaque\nbody}%%\nservice body_directive\n"`.

Output
([hidden-forms/body-directive-output.mmd](../tests/fixtures/architecture/hidden-forms/body-directive-output.mmd)):

```mmd
architecture-beta
  %%{!opaque
body}%%
  service body_directive
```

### Hidden boundaries

Reuse the shared consumed-LF and closing-padding rules: these boundaries decide
whether the following statement has visible EOL. A statement suffix without
closing padding needs one spare LF before its successor; EOF also ends a
statement. Before `service following`, the space after
`service space_suffix%%{}%%` stays, since every version of mermaid.js that
counts rejects the same lines without that space (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Only the header's own hidden forms need no spare LF. A statement retained on the
header line still has a statement boundary after its suffix. Keep multiple
suffix owners and forms after visible EOL distinct; exterior excess blanks use
the shared one-blank-line rule.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives it: Prettier
prints a run of empty lines as one and drops the empty lines at the start and at
the end of a file or of a block in JavaScript and CSS, and
[gantt](./gantt.md#blank-lines), [journey](./journey.md#blank-lines), and
[sankey](./sankey.md#blank-lines) print a run of empty lines as one and drop the
empty lines at the start and at the end of a body.

[fixture: architecture/hidden-boundaries/header-and-statement]

[fixture:
architecture/hidden-boundaries/header-inline-statement-suffix-spare-fixed]

[fixture: architecture/hidden-boundaries/header-own-hidden-no-spare-fixed]

[fixture: architecture/hidden-boundaries/hidden-multiple-blank-grouping]

[fixture: architecture/hidden-boundaries/suffix-space]

[fixture: architecture/hidden-boundaries/yaml-header-inline-statement-suffix]

[fixture: architecture/hidden-boundaries/yaml-space]

[corpus fixture: architecture/hidden-directive-group-space]

[corpus fixture: architecture/hidden-directive-closing-space]

[corpus fixture: architecture/hidden-directive-junction-space]

[corpus fixture: architecture/hidden-directive-edge-space]

[corpus fixture: architecture/hidden-directive-align-space]

[corpus fixture: architecture/hidden-directive-title-space]

[corpus fixture: architecture/hidden-directive-acctitle-space]

[corpus fixture: architecture/hidden-directive-accdescr-space]

[corpus fixture: architecture/hidden-directive-block-space]

[corpus fixture: architecture/hidden-directive-spare-lf]

[corpus fixture: architecture/hidden-yaml-service-space]

[corpus fixture: architecture/hidden-yaml-service-spare]

[corpus fixture: architecture/hidden-yaml-group-space]

[corpus fixture: architecture/hidden-yaml-junction-space]

[corpus fixture: architecture/hidden-yaml-edge-space]

[corpus fixture: architecture/hidden-yaml-align-space]

[corpus fixture: architecture/hidden-yaml-common-space]

[corpus fixture: architecture/hidden-yaml-title-absorbs-opener]

[corpus fixture: architecture/hidden-yaml-acctitle-absorbs-opener]

[corpus fixture: architecture/hidden-yaml-accdescr-absorbs-opener]

[corpus fixture: architecture/lex-hidden-two-suffixes]

[corpus fixture: architecture/lex-hidden-after-visible-eol]

[corpus fixture: architecture/hidden-directive-body]

[corpus fixture: architecture/hidden-yaml-after-header]

Input (escaped): `"architecture-beta%%{}%% group a%%{}%%\n\nservice b"`.

Output
([hidden-boundaries/header-and-statement-output.mmd](../tests/fixtures/architecture/hidden-boundaries/header-and-statement-output.mmd)):

```mmd
architecture-beta%%{}%% group a%%{}%%

  service b
```

### Blank lines

Keep at most one ordinary ASCII blank line between statements or trivia,
removing ordinary body/document-edge blanks.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives it, as under
[Hidden boundaries](#hidden-boundaries): Prettier prints a run of empty lines as
one and drops the empty lines at the start and at the end of a file or of a
block in JavaScript and CSS, and [gantt](./gantt.md#blank-lines),
[journey](./journey.md#blank-lines), and [sankey](./sankey.md#blank-lines) print
a run of empty lines as one and drop the empty lines at the start and at the end
of a body. Value interiors, retained prefixes, protected segments and required
hidden-boundary LFs keep their own rules.

[fixture: architecture/blank-lines/blank-collapse]

[fixture: architecture/blank-lines/blank-in-value-kept]

Input (escaped):
`"\n\narchitecture-beta\n\n\nservice a\n\n \t\n\n%% note\n\n\nservice b\n\n\n"`.

Output
([blank-lines/blank-collapse-output.mmd](../tests/fixtures/architecture/blank-lines/blank-collapse-output.mmd)):

```mmd
architecture-beta
  service a

  %% note

  service b
```

### Trailing whitespace

Remove harmless exterior ASCII padding after the header and completed
declarations, edges, alignments and description closers.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives it: Prettier
prints no whitespace at the end of a line (`a = 1;` followed by spaces and a tab
is printed `a = 1;`). Keep source inside values and continuation lines, comment
tails, directive/hidden interiors, retained prefixes and protected segments.
Hidden closing padding remains even at EOF because trimming it can remove
visible EOL.

[fixture: architecture/trailing-whitespace/trailing-exterior]

[fixture: architecture/trailing-whitespace/trailing-string-content-kept]

Input (escaped):
`"architecture-beta \t\nservice a(cloud)[A] \t\njunction j\t\na:R -- L:j\t\nalign row a j \t\naccDescr {D}\t\n"`.

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/architecture/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
architecture-beta
  service a(cloud)[A]
  junction j
  a:R -- L:j
  align row a j
  accDescr: D
```

### Frontmatter yaml

Format only safe real frontmatter with the shared guarded YAML formatter. Keep
malformed YAML, indented fences, delimiter padding, HTML hazards and bodies
whose formatting would produce a fence. YAML uses the shared positive minimum
indentation at tabWidth zero. At `tabWidth: 0` every version of mermaid.js that
counts rejects a block scalar without indentation, and draws the diagram
differently when a nested `config` value is no longer nested (see
[Frontmatter](./compatibility.md#frontmatter)). If textBeforeHeader is present,
retain the complete prefix, including leading LF, comments, passed bare trivia,
second-scan forms and real/hidden order: cleanup could promote ignored YAML into
effective data. Without the line feed before a `---` block of invalid YAML, the
versions of mermaid.js that count read the block as frontmatter and reject the
text (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: architecture/frontmatter-yaml/frontmatter-delimiter-padding-kept]

[fixture: architecture/frontmatter-yaml/frontmatter-html-guard]

[fixture: architecture/frontmatter-yaml/frontmatter-indented-keep]

[fixture: architecture/frontmatter-yaml/frontmatter-safe]

[fixture: architecture/frontmatter-yaml/frontmatter-yaml-delimiter-hazard]

[fixture: architecture/frontmatter-yaml/frontmatter-zero-minimum-block-scalar]

[fixture: architecture/frontmatter-yaml/invalid-real]

[fixture: architecture/frontmatter-yaml/prefix-leading-lf-keep]

[fixture: architecture/frontmatter-yaml/real-and-retained]

[fixture: architecture/frontmatter-yaml/second-scan]

[corpus fixture: architecture/div-frontmatter-invalid-yaml]

[corpus fixture: architecture/div-invalid-keeps-config]

[corpus fixture: architecture/frontmatter-config]

[corpus fixture: architecture/div-frontmatter-open-tag-label]

[corpus fixture: architecture/detect-retained-before-second-scan]

[corpus fixture: architecture/detect-retained-bare-second-scan]

[corpus fixture: architecture/detect-retained-three-fences]

[corpus fixture: architecture/detect-retained-indent-opening]

[corpus fixture: architecture/retained-prefix-before-bare]

[corpus fixture: architecture/retained-directive-between-bare]

Input (escaped):
`"---\ntitle: \"<a b=\\\"c\\\">\"\n---\narchitecture-beta\nservice a\n"`.

Output
([frontmatter-yaml/frontmatter-html-guard-output.mmd](../tests/fixtures/architecture/frontmatter-yaml/frontmatter-html-guard-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
architecture-beta
  service a
```

### Semicolons

Keep every authored semicolon. A segment that holds a kept `;` is formatted as
anywhere else, except where formatting could change which `;` the line rule
ignores. The rule reads a segment from the first `:` after `style` or `classDef`
to the last `#` before its last kept `;`, with no whitespace between the `:` and
the `#` (see [Semicolons](./flowchart.md#semicolons)), so the gaps and the
padding inside that stretch keep whether they hold whitespace, a run becoming
one space, and the rest of the segment follows the ordinary rules of this
diagram, apart from a title and an accessibility line (see the paragraph after
the fixtures). Text that no part of the layout holds stays as written. A
statement over several lines whose lines, joined with one space or with nothing,
could change which `;` the line rule ignores keeps the text of each segment, up
to its last kept `;`, as written; any other statement over several lines is
formatted like one on a single line. Where a line holds more than one `;`,
removing one can make the line rule ignore another `;` and change a label or an
entity (see [Lines that hold a `;`](./compatibility.md#lines-that-hold-a-));
that reason does not reach a `;` that stands alone on its line, which stays as
written.

[fixture: semicolons/stretch-kept-rest-formatted] [fixture:
semicolons/no-stretch-formatted] [fixture: semicolons/crossing-comment]

A title or an accessibility line to which the line rule applies is not stated,
but in one case (the line rule is in
[Lines that hold a `;`](./compatibility.md#lines-that-hold-a-)). Its form
depends on the text after the `;` that the rule ignores, on a second `;`, on a
directive, on a comment, on a U+2028 or U+2029, and on the gap after the
keyword, and no rule of [How the printed form is decided](./printed-form.md)
gives these forms; the released version prints them as it prints them until they
are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
The ordinary rules decide the one case: a line that holds one `;`, which ends it
(spaces and tabs may follow it), and no directive, comment, U+2028, or U+2029
(`title a   b   style:#x;` is printed `title a b style:#x;`).

[test: nothing after the `;` that the line rule ignores in a title, runs before
it, of an architecture diagram] [test: a run inside the stretch of the line
rule, nothing after the `;` in a title, spaces at the end, of an architecture
diagram] [test: nothing after the `;` that the line rule ignores in an accDescr
line, runs before it, of an architecture diagram] [test: nothing after the `;`
that the line rule ignores in a title, spaces at the end, of an architecture
diagram] [test: a run after the keyword of a title, nothing after the `;` that
the line rule ignores, of an architecture diagram] [test: a gap before and after
the colon of an accTitle line, nothing after the `;` that the line rule ignores,
of an architecture diagram] [test: a tab after the `;` that the line rule
ignores in a title, runs before it, of an architecture diagram] [test: a
classDef trigger with nothing after the `;` in a title, runs before it, of an
architecture diagram]

Protected header/first-statement groups stay together. Removing one selected
semicolon or moving style/classDef triggers can select another and change the
Db, so keep both passes, nontriggers, entities, physical value lines and
global-rejoined triggers.

[fixture: architecture/semicolons/native-service-value]

[fixture: architecture/semicolons/crossing-comment]

[fixture: architecture/semicolons/global-rejoin]

[fixture: architecture/semicolons/protected-header-first-statement]

[fixture: architecture/semicolons/selection]

[fixture: architecture/semicolons/values]

[corpus fixture: architecture/style-fields]

[corpus fixture: architecture/style-controls]

[corpus fixture: architecture/style-entity-semicolons]

[corpus fixture: architecture/style-block]

[corpus fixture: architecture/style-other-line]

[corpus fixture: architecture/style-quoted-lines]

[corpus fixture: architecture/lex-yaml-global-opener]

[corpus fixture: architecture/lex-label-selected-semicolon-after-quote]

[test: architecture/semicolons/unicode-segment]

Input (escaped):
`"architecture-beta\naccDescr {\nstyle A fill:#red\n%% owned;\ntext\n}\n"`.

Output
([semicolons/crossing-comment-output.mmd](../tests/fixtures/architecture/semicolons/crossing-comment-output.mmd)):

```mmd
architecture-beta
  accDescr {
    style A fill:#red
%% owned;
    text
  }
```

### Line terminators and unicode

Use the shared host policy: normalize physical CR/CRLF to LF, then emit
configured endOfLine, including in values and hidden forms. Prettier reads the
line ending before the printer does: it turns every CR and CRLF into the line
ending of its `endOfLine` option, inside a template literal and a comment too,
and `endOfLine: "crlf"` prints CRLF everywhere. Keep LS/PS/NBSP/BOM in content;
common line-value edges alone trim common whitespace. Non-ASCII structural
separators remain rejected. A leading BOM follows Prettier host handling rather
than byte identity. Prettier keeps the BOM at the start of a JavaScript file.

[corpus fixture: architecture/hidden-yaml-crlf]

[corpus fixture: architecture/line-cr-title]

[corpus fixture: architecture/line-cr-values]

[corpus fixture: architecture/frontmatter-crlf]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/lex-yaml-ls-ps-body]

[corpus fixture: architecture/common-block-ls-gap]

[corpus fixture: architecture/common-block-bom-gap]

[corpus fixture: architecture/line-ls-between]

[corpus fixture: architecture/space-body-nbsp]

[corpus fixture: architecture/div-retained-bare-second-scan-ls]

[corpus fixture: architecture/space-bom-leading]

[corpus fixture: architecture/detect-retained-leading-bom]

[test: architecture/line-terminators-and-unicode/cr-structure]

[test: architecture/line-terminators-and-unicode/crlf-values-hidden]

[test: architecture/line-terminators-and-unicode/cr-yaml-block]

[test: architecture/line-terminators-and-unicode/output-crlf]

[test: architecture/line-terminators-and-unicode/output-cr]

[test: architecture/line-terminators-and-unicode/value-content]

[test: architecture/line-terminators-and-unicode/common-edge-trim]

[test: architecture/line-terminators-and-unicode/bom-header]

[test: architecture/line-terminators-and-unicode/hidden-content]

[test: architecture/line-terminators-and-unicode/description-content]

[test: architecture/line-terminators-and-unicode/frontmatter-crlf]

[test: architecture/line-terminators-and-unicode/frontmatter-bom]

Input (escaped): `"architecture-beta\rservice cr_node\r"`.

Output (escaped): `"architecture-beta\n  service cr_node\n"`.

### Final newline

End ordinary accepted input with one configured newline, including empty bodies,
final statements and comments. Remove ordinary terminal blank runs for a
predictable file ending.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives both: Prettier
ends a file with one line ending, adding it where it is missing and dropping the
empty lines at the end. EOF-reaching global directives and hidden closing
padding keep their shared boundary behavior; a closed hidden form can gain LF.

[fixture: architecture/final-newline/ending-comment]

[fixture: architecture/final-newline/ending-common-empty]

[fixture: architecture/final-newline/ending-hidden-space]

[fixture: architecture/final-newline/ending-service]

[fixture: architecture/final-newline/ending-triple-comment]

[fixture: architecture/final-newline/global-open-at-eof]

[corpus fixture: architecture/hidden-directive-eof]

[corpus fixture: architecture/hidden-yaml-service-eof]

[corpus fixture: architecture/end-group-unclosed-directive]

[corpus fixture: architecture/end-junction-unclosed-directive]

Input (escaped): `"architecture-beta\nservice a"`.

Output
([final-newline/ending-service-output.mmd](../tests/fixtures/architecture/final-newline/ending-service-output.mmd)):

```mmd
architecture-beta
  service a
```

### Source order

Keep every statement, reference, alignment member, repeated edge/constraint and
empty assignment in source order. Do not rebuild the tree from the Db or sort
declarations into publication order. Deleting an empty assignment can change the
final value. Numeric-looking IDs remain written text.

[fixture: architecture/source-order/authored-order]

[corpus fixture: architecture/db-mixed]

[corpus fixture: architecture/db-junction-order]

[corpus fixture: architecture/db-duplicate-edges]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/lex-numeric-ids-text]

[corpus fixture: architecture/db-prototype-ids]

[corpus fixture: architecture/db-id-case]

[corpus fixture: architecture/common-repeat-empty]

Input (escaped):
`"architecture-beta\nalign row later cross\njunction cross in parent\nservice later in parent\ngroup parent\nlater:R -- L:cross\nlater:R -- L:cross\nalign column cross later\nalign row later cross\ntitle First\ntitle\naccTitle: First\naccTitle:\naccDescr {First}\naccDescr {}\n"`.

Output
([source-order/authored-order-output.mmd](../tests/fixtures/architecture/source-order/authored-order-output.mmd)):

```mmd
architecture-beta
  align row later cross
  junction cross in parent
  service later in parent
  group parent
  later:R -- L:cross
  later:R -- L:cross
  align column cross later
  align row later cross
  title First
  title
  accTitle: First
  accTitle:
  accDescr: First
  accDescr {}
```

### Specified readings

Use the existing specification readings for directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque and bare-percent-line-before-header. Architecture has no
acceptance-setting configuration key, and its detection precedes C4. Raw
rejection supplies no raw Db. Do not repair rejected syntax: standalone
formatting reports a syntax error without output; Markdown declines embedding.
Empty quoted icons/labels, empty descriptions and native hidden forms need no
new divergence.

[corpus fixture: architecture/div-frontmatter-invalid-yaml]

[corpus fixture: architecture/div-frontmatter-open-tag-icon]

[corpus fixture: architecture/div-retained-bare-second-scan-ls]

[corpus fixture: architecture/div-directive-name]

[corpus fixture: architecture/div-semicolon-parent-id]

[corpus fixture: architecture/error-service-duplicate]

[corpus fixture: architecture/error-edge-group-lhs]

[corpus fixture: architecture/config-embedded-limit]

[test: architecture/specified-readings/bare-unicode]

For example, `service a%%{wrap}%%b` is an atomic ID cut and produces no repaired
output.

### Markdown fences

Apply the same rules to the dedented payload through the shared Markdown route.
The host supplies fence/list/quote indentation and EOL. It trims final
payload-line padding, including final hidden padding, while interior hidden
boundaries remain necessary. Check host output and idempotence separately from
payload Db and source preservation.

[test: architecture Markdown: top-level]

[test: architecture Markdown: list]

[test: architecture Markdown: quote]

[test: architecture Markdown: zero]

[test: architecture Markdown: tabs]

[test: architecture Markdown: hidden-gap]

[test: architecture Markdown: hidden-boundary]

[test: architecture Markdown: preheader]

[test: architecture Markdown: frontmatter]

[test: architecture Markdown: global-and-semicolons]

[test: architecture Markdown: final-comment]

[test: architecture Markdown: final-hidden-padding]

[test: architecture Markdown: rejected]

Input (escaped):

````json
"```mermaid\narchitecture-beta service fence\n```\n"
````

Output (escaped):

````json
"```mermaid\narchitecture-beta\n  service fence\n```\n"
````
