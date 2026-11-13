# Usecase formatting rules

Japanese version: [usecase.ja.md](./usecase.ja.md)

These rules format `usecase-beta` from its written
[syntax tree](../../spec/docs/ast/usecase.md), following the
[usecase specification](../../spec/docs/diagrams/usecase.md). Each rule explains
its choice, links shared rules with their reasons, and cites the fixtures that
are written from its sentences. Inputs use escaped JSON strings; each output
block copies one fixture. Unicode/control/CR cases are escaped in
`usecase-cases.ts`.

HWS means ASCII horizontal whitespace: U+0020 SPACE and U+0009 TAB. LS means
U+2028 LINE SEPARATOR; PS means U+2029 PARAGRAPH SEPARATOR.

Formatting follows the shared failure path: standalone parser failures report
`SyntaxError`, and rejected Markdown payloads are declined to their host.
Headers, semicolon-separated statements, aliases, chains, nested boundaries,
unresolved notes, native validation and unclosed strings are never repaired. In
particular, usecase rejects unclosed single-quoted strings, including native
metadata; the EOF rule for class backquoted names does not apply. [corpus
fixture: usecase/header-uppercase] [corpus fixture:
usecase/gram-two-statements-line] [corpus fixture: usecase/gram-entity-as-alias]
[corpus fixture: usecase/gram-arrow-chain] [corpus fixture:
usecase/gram-boundary-nested] [corpus fixture: usecase/gram-note-unresolved]
[corpus fixture: usecase/gram-metadata-unknown-key] [corpus fixture:
usecase/lex-plain-unclosed] [corpus fixture:
usecase/lex-native-single-quote-comment-region-lf]

Accepted divergences use the specified reading under
[Compatibility](./compatibility.md#usecase-native-syntax-and-authored-values).
The six existing identifiers are `directive-as-token-boundary`,
`ignored-semicolon-as-token-boundary`, `html-tag-in-frontmatter`,
`embedded-data-opaque`, `c4-keyword-anywhere` and
`bare-percent-line-before-header`; they do not make every `div-` input accepted.
All corpus inputs run through the shared format/corpus test families, including
rejections and the marked cases. A raw rejection provides no raw Db. [corpus
fixture: usecase/div-directive-in-id] [corpus fixture:
usecase/div-semicolon-identifier-selected] [corpus fixture:
usecase/div-html-frontmatter-acc-title-db] [corpus fixture:
usecase/div-gram-json-unquoted-key] [corpus fixture:
usecase/div-detect-c4-label] [corpus fixture:
usecase/div-comment-preheader-bare]

## Rules

### Header

Reuse the visible header convention of [C4](./c4.md#header): put exact
lower-case `usecase-beta` at column one and place the body below it, so the
diagram starts visibly. Exterior ASCII spaces/tabs disappear; direction remains
a separate statement. A header alone is accepted and gains the ordinary final
newline; case, stable-header and inline-body failures follow the shared failure
path. Leading comments and directives follow their rules below.

[fixture: header/header-column] [fixture: header/leading-trivia-empty] [corpus
fixture: usecase/spec-usecase-parser-7ae00acb]

Input (escaped): `" \tusecase-beta  \nA"`

Output
([header/header-column-output.mmd](../tests/fixtures/usecase/header/header-column-output.mmd)):

```mmd
usecase-beta
  A
```

### Indentation

Reuse structural [class indentation](./class.md#indentation): one configured
step below the header, two for boundary declarations, and `end` aligned with its
opener, as in class diagrams. [fixture:
system-boundaries/boundary-header-comment-empty] A step follows `tabWidth` and
`useTabs`, two spaces by default or one tab per level. Indentation does not
determine usecase syntax, so `tabWidth: 0` stays zero; accessibility remains
accessibility at column zero and after ASCII whitespace. YAML retains the shared
minimum of one. Value and directive continuation columns stay authored; eligible
JSON margins follow [JSON tables](#json-tables). [fixture:
native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive] [fixture:
classes-and-styles/css-name-multiline-directive] [fixture:
json-tables/json-prefix-id-at-multiline-directive]

[fixture: indentation/indent-depth] [fixture: indentation/indent-four] [fixture:
indentation/indent-tabs] [fixture: indentation/indent-zero] [fixture:
indentation/indent-zero-a11y] [fixture: indentation/indent-zero-tabs] [fixture:
indentation/boundary-comments-before-end] [fixture:
indentation/zero-tabs-boundary] [fixture: indentation/value-and-json-columns]

Input (escaped):
`"usecase-beta\nsystemBoundary Portal\nactor User\nTask(Work)\nend\nUser-->Task"`

Output
([indentation/indent-depth-output.mmd](../tests/fixtures/usecase/indentation/indent-depth-output.mmd)):

```mmd
usecase-beta
  systemBoundary Portal
    actor User
    Task("Work")
  end
  User --> Task
```

### Statements and semicolons

Each native statement keeps its required physical grammar line; semicolons never
separate statements, and actor lists use commas. Except for
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement),
keep semicolons as written. A segment that holds a kept `;` is formatted as
anywhere else, except where formatting could change which `;` the line rule
ignores. The rule reads a segment from the first `:` after `style` or `classDef`
to the last `#` before its last kept `;`, with no whitespace between the `:` and
the `#` (see [Semicolons](./flowchart.md#semicolons)), so the gaps and the
padding inside that stretch keep whether they hold whitespace, a run becoming
one space, and the rest of the segment follows the ordinary rules of this
diagram. Text that no part of the layout holds stays as written. A statement
over several lines whose lines, joined with one space or with nothing, could
change which `;` the line rule ignores keeps the text of each segment, up to its
last kept `;`, as written; any other statement over several lines is formatted
like one on a single line. [fixture:
statements-and-semicolons/stretch-kept-rest-formatted] [fixture:
statements-and-semicolons/no-stretch-formatted] [fixture:
json-tables/kept-body-line] [fixture:
native-metadata/metadata-selected-semicolon-between-properties] Both textual
passes, colon/hash separation, Unicode segment boundaries and an open
directive's semicolon stop keep their reading.

[fixture: statements-and-semicolons/statements-lines] [fixture:
statements-and-semicolons/semicolon-label-content] [fixture:
statements-and-semicolons/semicolon-selected-boundary] [fixture:
statements-and-semicolons/semicolon-selected-retarget-kept] [fixture:
statements-and-semicolons/safe-suffix-after-kept-value] [fixture:
statements-and-semicolons/selected-directive-prefix]

Input (escaped): `"usecase-beta\n actor  Reader\nRead(Inspect)\nReader-->Read"`

Output
([statements-and-semicolons/statements-lines-output.mmd](../tests/fixtures/usecase/statements-and-semicolons/statements-lines-output.mmd)):

```mmd
usecase-beta
  actor Reader
  Read("Inspect")
  Reader --> Read
```

### Declarations

Reuse [ER's compact entity layout](./er.md#entities): one gap after `actor`,
tight id/shape delimiters and metadata/class suffixes, no exterior ASCII label
padding, and comma-space between actor items, which shows the separate actor
occurrences that one `actor` keyword introduces. Stereotype spacing follows
[its class-based rule](#stereotypes). Keep explicit ids, ellipse/rectangle
spelling, markdown labels, suffix order and every declaration/reference
occurrence; a name and a label are printed in the form that the examples use
(see [Quotes](#quotes)). Generated ids and resolved actor endpoints never
replace authored nodes; boundary metadata forms remain declarations while
top-level forms remain updates. This shows written syntax without inventing
aliases or geometry.

[fixture: declarations/actor-list] [fixture: declarations/entity-shapes]
[fixture: declarations/suffixes] [fixture: declarations/generated-name]
[fixture: declarations/shape-change-kept] [fixture:
declarations/reference-not-redeclared] [fixture:
declarations/actor-source-occurrence]

Input (escaped):
`"usecase-beta\nactor  User ( Person ) , Clerk('Desk') , \"Guest\""`

Output
([declarations/actor-list-output.mmd](../tests/fixtures/usecase/declarations/actor-list-output.mmd)):

```mmd
usecase-beta
  actor User("Person"), Clerk("Desk"), Guest
```

### Labels

Reuse [C4's authored value forms](./c4.md#argument-forms): a markdown label
keeps its kind, since markdown changes the label type, and every label keeps its
interior characters, including empty quoted values. A plain label is printed in
the form that the examples use (see [Quotes](#quotes)). Only exterior ASCII HWS
outside a bare label's contributing units is trimmed. Internal gaps, Unicode
padding, backslashes, entities and HTML stay; a string between `'` is printed
between `"`, unless its text holds a `'`, a `"`, a backslash, a line break,
U+2028, U+2029, a backquote, `&`, `#`, or `<` (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)),
and `singleQuote` is not read. [fixture: labels/single-quote-sensitive-kept]

A plain label whose text ends with a U+2028 or U+2029, and that a comment
follows with only whitespace, line breaks, and directives between, is not put in
quotes: the character starts the comment (see
[Comment lines](../../spec/docs/common.md#comment-lines)), the closing quote
would stand between them, the `%%` would be text of the label, and mermaid.js
rejects it. The same holds for a text that stands before such a character: the
line that holds the comment is read with the next one, and printed as written,
with its quotes. The same label with no comment after it is put in quotes as any
label with that character is. [test: usecase: U+2028 alone in the parentheses of
an actor label, before a comment] [test: usecase: U+2028 alone in the
parentheses of an entity label, before a comment] [test: usecase: U+2029 alone
in the parentheses of an entity label, before a comment] [test: usecase: U+2028
after a letter in the parentheses of an entity label, before a comment] [test:
usecase: U+2028 alone as a note text, before a comment] [test: usecase: U+2028
alone as an edge label, before a comment] [test: usecase: U+2028 alone in the
parentheses of a boundary title, before a comment] [test: usecase: U+2028 alone
in the brackets of a boundary title, before a comment] [test: usecase: U+2028
alone in the parentheses of an entity label, at the end of its line] [test:
usecase: U+2028, a space, and a comment after a label text] [test: usecase:
U+2028, a tab, and a comment after a label text] [test: usecase: U+2028, a
directive, a space, and a comment after a label text] [test: usecase: U+2028, a
directive, and a comment after a label text] [test: usecase: U+2028, a line
feed, and a comment after a label text] [test: usecase: U+2029, a directive, and
a comment after a label text] [test: usecase: U+2028, a space, and a comment
after a note text that holds a percent mark]

[fixture: labels/label-quote-kinds] [fixture: labels/label-empty-quotes]
[fixture: labels/label-quote-rewrite-one-form] [fixture:
labels/label-quote-remove-kept] [fixture: labels/label-interior-kept] [fixture:
labels/label-backslash-kept] [fixture: labels/label-html-entities] [fixture:
labels/div-c4-label] [fixture: labels/label-markdown-remove-kept] [test:
usecase: label-unicode-padding] [fixture: labels/single-quote-option] [fixture:
labels/empty-shape-labels] [corpus fixture: usecase/div-c4-inline-percent-eof]

Input (escaped):
``"usecase-beta\nA(unquoted  words)\nB(' single  text ')\nC(\" double  text \" )\nD(\"` markdown  text `\")"``

Output
([labels/label-quote-kinds-output.mmd](../tests/fixtures/usecase/labels/label-quote-kinds-output.mmd)):

```mmd
usecase-beta
  A("unquoted  words")
  B(" single  text ")
  C(" double  text ")
  D("` markdown  text `")
```

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style A stroke:#ABCDEF,fill:#F9F` is printed
`style A stroke: #abcdef, fill: #f9f`. The colors in the styles of the `style`
and `classDef` statements of a use case diagram are printed so. A color is a `#`
and 3, 4, 6, or 8 hexadecimal digits that stand alone in the value of a style;
it is never shortened, and a text that is no color stays as written (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).
[fixture: colors/colors-in-lower-case] [fixture:
colors/words-that-are-not-colors-as-written] [fixture:
usecase/colors/color-directive-in-url-name-kept]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/usecase/colors/colors-in-lower-case-input.mmd)):

```mmd
usecase-beta
actor A
B(Use)
A --> B
style A stroke:#ABCDEF,fill:#F9F
classDef c fill:#DEADBE
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/usecase/colors/colors-in-lower-case-output.mmd)):

```mmd
usecase-beta
  actor A
  B("Use")
  A --> B
  style A stroke: #abcdef, fill: #f9f
  classDef c fill: #deadbe
```

Input
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/usecase/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
usecase-beta
actor A
style A stroke:#ABCDE,fill:#ABCDEF1
classDef c fill:url(#ABC),stroke:#ABC-x
```

Output
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/usecase/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
usecase-beta
  actor A
  style A stroke: #ABCDE, fill: #ABCDEF1
  classDef c fill: url(#ABC), stroke: #ABC-x
```

### Quotes

A name, a label, and a word of the native metadata are printed in the form that
the examples in the documentation of mermaid.js write them (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)). mermaid.js
makes the id of a name that stands alone in quotes by replacing each character
other than an ASCII letter, a digit, and `_` with `_`
([the id of a name in quotes](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L197-L221),
[the function](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L876-L878)),
so `actor "Alice"` has the id and the label `Alice` of `actor Alice`.

A name that stands alone in quotes (the actor of `actor "Alice"`, the use case
of `"Login" --> "Logout"`, a system boundary, and the target of a metadata
update) is printed without quotes where it is ASCII letters, digits, and `_`,
and none of the words that the lexer reads as a unit of its own: `actor`,
`systemBoundary`, `end`, `direction`, `TD`, `TB`, `BT`, `LR`, `RL`, `note`,
`for`, `json`, `classDef`, `class`, `style`, `true`, `false`, `accTitle`, and
`accDescr` as written (a `:` after `accTitle` or `accDescr` at the start of a
statement makes a line of an accessibility title or description); `include` and
`extend` in any case; and `allowmixing`, `newpage`, `package`, `rectangle`, and
`skinparam`, which the grammar refuses as the name that starts a statement, in
any case. So `"Alice"`, `"1a"`, `"td"`, and `"Package2"` lose their quotes, and
`"a b"`, `"a-b"`, `"日本語"`, `"actor"`, `"Extend"`, `"TD"`, `"package"`, and
`"accTitle"` keep them. [fixture: quotes/names-without-quotes] [fixture:
quotes/names-that-need-quotes]

A label between parentheses of an actor or of a use case, the title of a system
boundary that has an id, the label of a split association, and the label of a
note are printed in quotes: `actor Bob(Display B)` is printed
`actor Bob("Display B")`, `A -- likes --> B` is printed `A -- "likes" --> B`,
and `note for A text` is printed `note for A "text"`. A label that starts with a
backquote stays as it is, since a quote and a backquote start a markdown string.
A label between square brackets of a use case is printed without quotes where it
is words of ASCII letters, digits, and `_` with one space between them:
`Panel["Display"]` is printed `Panel[Display]`, and `Dash["a-b"]` and
`Num["Costs 19.95"]` stay. [fixture: quotes/labels-in-quotes] [fixture:
quotes/labels-as-written] [fixture: quotes/square-bracket-labels]

In the native metadata, a key in quotes and the scalar of a property but `icon`
are printed without quotes where they are such a word (`"type": "hollow"` is
printed `type: hollow`), and the scalar of `icon` is printed in quotes where it
is such a word (`icon: user` is printed `icon: "user"`). A scalar that is not a
word, such as `"fa:user"`, stays. [fixture: quotes/metadata] The tree holds each
property of the native metadata as a key, a colon, and a scalar, unlike the data
block of a flowchart or a kanban board, which it holds whole. So the colon of a
property is the colon of a key (step 2 of
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)):
`type : hollow` is printed `type: hollow`. [fixture:
native-metadata/metadata-newline]

A name or a label that touches a unit in the source is printed in the same way,
since the printer sets a space or a delimiter between them: `A--important-->B`
is printed `A -- "important" --> B`, and `actor A@{icon:1}` is printed
`actor A@{ icon: "1" }`. A name or a label on a line that the printer writes as
it is, such as one with a `;`, keeps its form. [fixture: quotes/touching-units]
[fixture: quotes/texts-on-a-kept-line-as-written]

Input
([quotes/names-without-quotes-input.mmd](../tests/fixtures/usecase/quotes/names-without-quotes-input.mmd)):

```mmd
usecase-beta
actor "Alice", "Bob_2"
"Login" --> "Logout"
systemBoundary "Sys"
  "Inner"
end
"Alice"@{ icon: "user" }
Alice --> Inner
```

Output
([quotes/names-without-quotes-output.mmd](../tests/fixtures/usecase/quotes/names-without-quotes-output.mmd)):

```mmd
usecase-beta
  actor Alice, Bob_2
  Login --> Logout
  systemBoundary Sys
    Inner
  end
  Alice@{ icon: "user" }
  Alice --> Inner
```

### Stereotypes

Reuse the spacing of annotations attached to
[class statements](./class.md#whitespace-between-tokens): one space stands
before the `<<`, and nothing stands inside the delimiters. Thus `A[a]<<R>>` and
`A[a] <<  R  >>` are printed `A[a] <<R>>`. mermaid.js trims the text, so every
spelling gives the same Db, and the five examples of its documentation write
`<<...>>` after a space and touching its text
([the examples](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/usecase.md#L141-L144),
[two more](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/usecase.md#L546-L549)).
Where a directive or a comment stands at an end of the text, the whitespace
beside it keeps its written side. [fixture: stereotypes/stereotype-spaced-once]
[fixture: stereotypes/opener-gap-sides] [test: usecase: stereotype-opener-tab]
Actors and use cases follow the same rule, including relationship endpoints and
declarations inside system boundaries. Mermaid trims the interior ends;
whitespace before `<<` is structural. Both spacing choices keep the Db, so
usecase follows the shared rule. [fixture: stereotypes/stereotype-inner-kept]
[fixture: stereotypes/stereotype-padding] [fixture:
stereotypes/declaration-suffixes] [fixture: stereotypes/side-padding] [fixture:
stereotypes/endpoint-suffixes] [fixture: stereotypes/boundary-suffixes]

Keep the interior text as written: word gaps, nested openers, quotes,
backslashes, punctuation and directives remain. LS/PS and NBSP can be interior
content; exterior common whitespace follows the padding rule. [fixture:
stereotypes/stereotype-plain-backslash] [fixture: stereotypes/directive-padding]
[fixture: stereotypes/directive-gap-sides] [test: usecase:
stereotype-unicode-exterior-padding] [test: usecase:
stereotype-unicode-gap-sides] Protected common comment regions still retain
complete crossing values, including their padding. [test: usecase:
stereotype-comment-region-padding-kept] A `;` in the interior is no reason to
keep the padding: the line rule reads only the stretch from a `:` to a `#`, and
the padding is outside it. [fixture: stereotypes/semicolon-padding-dropped]
Physical multiline, empty and unclosed failures are never repaired. [corpus
fixture: usecase/gram-stereotype-newline] [corpus fixture:
usecase/gram-stereotype-empty] [corpus fixture: usecase/gram-stereotype-open]

[fixture: stereotypes/stereotype-padding] [fixture:
stereotypes/stereotype-inner-kept] [fixture: stereotypes/stereotype-punctuation]
[fixture: stereotypes/directive-and-selected-semicolon]

Input (escaped): `"usecase-beta\nactor User <<  service  user  >>"`

Output
([stereotypes/stereotype-padding-output.mmd](../tests/fixtures/usecase/stereotypes/stereotype-padding-output.mmd)):

```mmd
usecase-beta
  actor User <<service  user>>
```

### System boundaries

Openings, declaration bodies and aligned `end` use separate lines, including
empty boundaries and empty quoted names. [fixture:
system-boundaries/boundary-header-comment-empty] Reuse the heading form of
[flowchart subgraphs](./flowchart.md#subgraph-header): the opener of the title,
`[` or `(`, touches the id, so `systemBoundary S [t]` is printed
`systemBoundary S["t"]` and `systemBoundary S (t)` is printed
`systemBoundary S("t")`. mermaid.js reads the spaced and the touching spellings
as the same boundary. The spaces and tabs inside the brackets or the parentheses
are dropped, since mermaid.js trims them (it keeps a no-break space, which
stays): `systemBoundary S[ x ]` is printed `systemBoundary S["x"]`, and
`S("x" )` is printed `S("x")`. [fixture:
system-boundaries/boundary-title-padding-dropped] [fixture:
system-boundaries/boundary-title-opener-touches-id] A directive at an edge of
the title touches the bracket and the title, as the gap has no space
(`S[ %%{x}%% T ]` is printed `S[%%{x}%%"T"]`). The padding is dropped on a line
with a kept `;` too, apart from the stretch read by the line rule (see
[Statements and semicolons](#statements-and-semicolons)): dropping it outside
that stretch moves no `;`, so the line rule selects the same one. `S[ a;b ]` is
printed `S[a;b]`, and `S[ a; ]` is printed `S[a;]`. One space stays where the
padding lies between a `:` and a `#` of a line that the line rule may read, as
in architecture and venn. A usecase id cannot hold a `:`, and a `:` inside a
directive is not read by the line rule, so no `:` stands before the title for
the rule: `systemBoundary mystyle%%{init:{}}%%[ #x; ]` is printed
`systemBoundary mystyle%%{init:{}}%%[#x;]`. A padding with a U+2028 or U+2029 in
it stays. [fixture: system-boundaries/boundary-title-directive-or-semicolon]
[fixture: system-boundaries/boundary-title-padding-after-directive-colon] [test:
usecase: U+2028 inside the brackets of a boundary title] [test: usecase: U+2029
inside the brackets of a boundary title] [test: usecase: U+2028 inside the
brackets of a boundary title with a semicolon] [test: usecase: U+2029 inside the
brackets of a boundary title with a semicolon] A directive in the gap is placed
as under [flowchart's Directives](./flowchart.md#directives). [fixture:
system-boundaries/boundary-id-title-directed-gap] [fixture:
system-boundaries/boundary-id-title-directed-gap-runs] Preserve native
metadata/classes and repeated declarations; body membership comes from the AST's
single declaration-body level.

[fixture: system-boundaries/boundary-headings] [fixture:
system-boundaries/boundary-empty] [corpus fixture: usecase/db-empty-boundary-id]
[fixture: system-boundaries/boundary-title-touch] [fixture:
system-boundaries/empty-quoted-name-members] [fixture:
system-boundaries/repeated-boundaries] [fixture:
system-boundaries/quoted-markdown-title]

Input (escaped):
`"usecase-beta\nsystemBoundary Box [ Display ] @{ type : 'package' } ::: box , group\nactor User\nA@{ business : true }\nend"`

Output
([system-boundaries/boundary-headings-output.mmd](../tests/fixtures/usecase/system-boundaries/boundary-headings-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box["Display"]@{ type: package }:::box, group
    actor User
    A@{ business: true }
  end
```

### Arrows

Reuse [arrow spacing](./class.md#arrow-spacing): one ordinary gap on each side
of the actual complete usecase operator. Keep direction, marker, and every
dash/dot, including long split closing halves whose Db length is fixed. Semantic
operators print `..> : include` and `..> : extend`, with one space before and
after the colon and the keyword in lower case, as the examples in the
documentation of mermaid.js write it, 7 times and never with the colon touching
(counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon);
see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)),
then one target gap; the colon after an arrow takes the same gap in a class, an
ER, and a state diagram. mermaid.js reads `..>:include`, `..> :include`,
`..>: include`, and `..> : include` as the same operator. [fixture:
arrows/semantic-operator-directives] [fixture:
arrows/arrows-semantic-case-one-form] [fixture: arrows/semantic-colon-gaps]
Never swap endpoints or translate operator families. Direction, marker, and the
dash and dot counts stay as written because the printer never prints a
normalized Db operator: `A---->B` printed as `A --> B` changes the minimum
length, and `A<--B` printed as `B --> A` changes the order of source and target.
A split arrow keeps its dash counts even where the Db length is fixed.

[fixture: arrows/arrows-solid] [fixture: arrows/arrows-markers] [fixture:
arrows/arrows-semantic] [fixture: arrows/arrows-length-kept] [fixture:
arrows/arrows-source-order-kept] [fixture: arrows/arrows-semantic-case-one-form]
[fixture: arrows/arrows-generalization-actors] [fixture:
arrows/extended-split-lengths]

Input (escaped): `"usecase-beta\nA..>:InClUdE B\nB..> : EXTEND C\nC--|>D"`

Output
([arrows/arrows-semantic-output.mmd](../tests/fixtures/usecase/arrows/arrows-semantic-output.mmd)):

```mmd
usecase-beta
  A ..> : include B
  B ..> : extend C
  C --|> D
```

Input
([arrows/semantic-colon-gaps-input.mmd](../tests/fixtures/usecase/arrows/semantic-colon-gaps-input.mmd)):

```mmd
usecase-beta
Browse("Browse")
Checkout("Checkout")
Checkout..>:include Browse
Checkout ..> :include Browse
Checkout ..>: include Browse
Checkout ..>   :   extend   Browse
Checkout	..>	:	extend	Browse
Checkout pays@..>:include Browse
```

Output
([arrows/semantic-colon-gaps-output.mmd](../tests/fixtures/usecase/arrows/semantic-colon-gaps-output.mmd)):

```mmd
usecase-beta
  Browse("Browse")
  Checkout("Checkout")
  Checkout ..> : include Browse
  Checkout ..> : include Browse
  Checkout ..> : include Browse
  Checkout ..> : extend Browse
  Checkout ..> : extend Browse
  Checkout pays@..> : include Browse
```

### Arrow id boundaries

Space the arrow and endpoint exactly as the AST records them: `A --order` prints
`A --o rder`, while `A -- order` keeps `order`. Forward `--o`/`--x` are tried
before markerless `--` without a word boundary, so adding or removing a gap
inside those units changes the reading. Longer markerless dash runs and
uppercase O/X keep their recorded target; a directive in a gap at a complete
boundary is placed as under [Directives](#directives). [fixture:
arrow-id-boundaries/arrow-marker-both-gap-sides] This differs from class's
o-marker boundary. Recovering an apparent intended id belongs to lint, not
formatting.

[corpus fixture: usecase/lex-forward-circle-id-prefix] [corpus fixture:
usecase/lex-forward-cross-id-prefix] [fixture:
arrow-id-boundaries/markerless-o-id] [fixture:
arrow-id-boundaries/markerless-x-id] [fixture:
arrow-id-boundaries/circle-spaced-id] [corpus fixture:
usecase/lex-forward-cross-id-spaced] [fixture:
arrow-id-boundaries/markerless-long-before-o] [fixture:
arrow-id-boundaries/marker-uppercase-is-id] [fixture:
arrow-id-boundaries/circle-prefix-suffixes]

Input (escaped):
`"usecase-beta\nStart --order\nrder@{business:true}\nclass rder current"`

Output
([arrow-id-boundaries/circle-prefix-suffixes-output.mmd](../tests/fixtures/usecase/arrow-id-boundaries/circle-prefix-suffixes-output.mmd)):

```mmd
usecase-beta
  Start --o rder
  rder@{ business: true }
  class rder current
```

### Relationship labels and ids

Reuse
[flowchart's authored edge-label principle](./flowchart.md#link-label-form) and
tight edge-id attachment: keep split labels with one exterior gap, and print an
explicit id touching `@` and its opening/sole arrow. Usecase keeps only its
allowed split halves, markdown labels, empty quoted labels, actor source
keywords and both endpoint occurrences; a plain label is printed in quotes (see
[Quotes](#quotes)). Explicit ids remain available to later metadata/class/style
targets. A pipe or class-style colon label would be another grammar, and a chain
is never split into valid relationships.

[fixture: relationship-labels-and-ids/split-labels] [fixture:
relationship-labels-and-ids/edge-id-tight] [fixture:
relationship-labels-and-ids/edge-id-split] [fixture:
relationship-labels-and-ids/edge-empty-label] [fixture:
relationship-labels-and-ids/edge-pipe-convert-kept] [fixture:
relationship-labels-and-ids/split-circle-and-cross]

Input (escaped):
``"usecase-beta\nA--  likes  -->B\nB<--'uses'--C\nC o-- part --- D\nD x--\"`blocks`\"----E"``

Output
([relationship-labels-and-ids/split-labels-output.mmd](../tests/fixtures/usecase/relationship-labels-and-ids/split-labels-output.mmd)):

```mmd
usecase-beta
  A -- "likes" --> B
  B <-- "uses" -- C
  C o-- "part" --- D
  D x-- "`blocks`" ---- E
```

### Native metadata

Native metadata is parsed, validated syntax. Format only structural whitespace:
tight target/`@{`, no gap before a property colon, one after it, comma-space on
one line and one space inside inline braces, including `@{ }`. Preserve
integer-looking text, booleans, order, duplicates, separate updates, separators
and trailing commas; the quotes of a key and of a scalar are printed as
[Quotes](#quotes) says. Order and duplicates stay because they can change the
final geometry or reject conflicts: reordering `U@{icon:'x',icon:''}` to
`icon: '', icon: 'x'` changes the final icon, and `business: "true"` is rejected
where Mermaid requires a boolean. `@{` stays one touching opener because `@ {`
is rejected, and no newline is inserted inside a key, colon and value, because a
newline cannot split one property. [fixture:
native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive] Neither YAML nor opaque
flowchart/Agentflow metadata supplies a formatting model here.

Keep the first property on its written opening or following line. [fixture:
native-metadata/metadata-first-gap-standalone-directive] Ordinary
property/comment/directive lines stand one level below the containing statement;
a separate closing brace aligns with that statement. [fixture:
native-metadata/metadata-comma-comment-close] [fixture:
native-metadata/metadata-closer-directive-own-line] Preserve every metadata
blank line and comma-versus-newline separator; never insert a newline within a
key/colon/value property. [fixture:
native-metadata/metadata-first-gap-standalone-directive] [fixture:
native-metadata/metadata-selected-semicolon-between-properties] This gives the
property the form that Prettier prints for a key and its value, without changing
native validation or the declaration/update roles.

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

[fixture: native-metadata/metadata-inline] [fixture:
native-metadata/metadata-newline] [fixture: native-metadata/metadata-empty]
[fixture: native-metadata/metadata-duplicate-order] [fixture:
native-metadata/metadata-quote-spelling] [fixture:
native-metadata/metadata-update-order-kept] [fixture:
native-metadata/metadata-boolean-quote-kept] [fixture:
native-metadata/metadata-blank-lines-kept] [fixture:
native-metadata/metadata-target-roles] [fixture:
native-metadata/metadata-newline-separators] [fixture:
native-metadata/metadata-empty-touch] [fixture: native-metadata/all-targets]
[fixture: native-metadata/empty-multiline] [fixture:
native-metadata/blank-runs-around-trivia] [fixture:
native-metadata/boundary-property-columns] [fixture:
native-metadata/spelling-and-trailing-comma-option] [fixture:
native-metadata/multiline-directive-value-gap]

Input (escaped):
`"usecase-beta\nactor U @{\n type : hollow\n , business : true,\n}"`

Output
([native-metadata/metadata-newline-output.mmd](../tests/fixtures/usecase/native-metadata/metadata-newline-output.mmd)):

```mmd
usecase-beta
  actor U@{
    type: hollow
    , business: true,
  }
```

### JSON tables

Reuse [opaque data retention](./compatibility.md#embedded-data-is-not-checked):
keep the JSON contents, apart from the uniform margin movement below. Format
exterior json/id gaps and class suffixes; one ordinary gap precedes the data.
The `{` touches the `@`: `json A @ {"a":1}` is printed `json A @{"a":1}`, since
the spaces and tabs between them are not in the Db, and the documentation of
mermaid.js writes `@{`
([`json Payload@{`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/usecase.md#L334)).
A head with a directive between the `@` and the `{` stays as written. [fixture:
json-tables/head-padding-dropped] [fixture:
json-tables/empty-head-padding-dropped] [fixture:
json-tables/head-beside-directive-kept] [fixture:
json-tables/json-prefix-id-at-multiline-directive] Nested objects, duplicates,
integer-key order, numbers/escapes and apparent comments stay authored. Sorting
keys can change `propertyOrder`. Balanced malformed contents follow the
specified opaque reading, while balancing failures remain failures. Db checks
follow the shared data-block path: authored formatting fixtures without supplied
effects compare as null and check the written embedded strings instead. The
corpus uses recorded effects where available; the written-string comparison
allows only the uniform movement defined in
[Data blocks](./flowchart.md#data-blocks).

When `{` is immediately followed by a newline, shift all body lines by the same
number of ASCII spaces so the shallowest text stands one level inside the JSON
statement. Relative indentation, including nested objects, stays unchanged. A
separate `}` aligns with the statement; a closer after text stays on that line.
JSON strings cannot contain raw newlines: Mermaid rejects them with
`Bad control character in string literal`, so this movement cannot change a
string's contents. [fixture: json-tables/closing-deeper-kept] [fixture:
json-tables/closing-equal-depth] [fixture: json-tables/zero-and-shallow]
[fixture: json-tables/deep-nested-json] [fixture:
json-tables/closing-after-text]

Apply all the shared movement conditions and their reasons from
[Data blocks](./flowchart.md#data-blocks). In particular, keep inline-opening
JSON, embedded directives, kept lines, leading tabs and `tabWidth: 0` as
written, and, with `useTabs`, the statement that holds the JSON as a whole.
Comments, directives, blank lines and empty description blocks outside the JSON
keep their own rules; CR/LF follows `endOfLine` and Unicode separators inside
strings remain characters. [fixture: json-tables/inline-opening-kept] [fixture:
json-tables/directive-inside-kept] [fixture: json-tables/kept-body-line]
[fixture: json-tables/zero-width-kept] [fixture:
json-tables/tab-statement-space-body] [fixture: json-tables/surrounding-trivia]
[test: data blocks: JSON leading tab kept] [test: data blocks: usecase U+2029]
[test: data blocks: usecase CRLF]

A JSON table on one line stays as written, apart from the whitespace between the
`@` and the `{`: its `{` and `}` are the braces of the JSON itself, not the ends
of a block that mermaid.js wraps in braces, so the one-space padding of
[Data blocks](./flowchart.md#data-blocks) does not apply to it. [fixture:
json-tables/one-line-kept]

[fixture: json-tables/json-opaque] [corpus fixture:
usecase/gram-json-prefix-id-control] [fixture: json-tables/json-invalid-opaque]
[fixture: json-tables/json-order-kept] [fixture:
json-tables/json-directive-opaque] [fixture:
json-tables/numbers-escapes-and-comment-text]

Input (escaped):
`"usecase-beta\njson  Table  @ {\n \"2\": 2, \"1\": {\"z\":1}, \"2\": 3\n} ::: data , table"`

Output
([json-tables/json-opaque-output.mmd](../tests/fixtures/usecase/json-tables/json-opaque-output.mmd)):

```mmd
usecase-beta
  json Table @{
    "2": 2, "1": {"z":1}, "2": 3
  }:::data, table
```

### Semicolons at the end of a style statement

A line-ending `;` of a `classDef` or `style` statement is dropped when the
[line rule of mermaid.js](../../spec/docs/common.md#style-and-classdef-lines)
ignores it: no whitespace lies between the `:` and the later `#`. Removing this
terminator leaves the Db unchanged, also with several styles. [fixture:
semicolons-at-the-end-of-a-style-statement/hash-terminators] Whitespace
immediately before a dropped `;` is dropped with it. [fixture:
semicolons-at-the-end-of-a-style-statement/space-before-terminator] The line
then formats as a line without that `;`, including its usual style spacing.
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators] Blank
lines and comment lines keep their usual layout around the statement. [fixture:
semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines] An empty
description block follows its usual layout while the style terminator is
dropped. [fixture:
semicolons-at-the-end-of-a-style-statement/empty-description-block]

A directive after the semicolon on the same line keeps the `;`. [fixture:
semicolons-at-the-end-of-a-style-statement/trailing-items-kept] Following `%%`
text on the same line also keeps it; here it is part of the style. [fixture:
semicolons-at-the-end-of-a-style-statement/trailing-items-kept] A `;` after an
unclosed directive stays, preserving its stopping boundary. [fixture:
semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept] The same
protection applies before U+2028 and U+2029; see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends). [test: style
semicolons: usecase before U+2028] [test: style semicolons: usecase before
U+2029] A closed directive between the statement and an ignored terminator is
kept while the `;` is dropped. [fixture:
semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

Output
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/usecase/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
usecase-beta
  A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### Classes and styles

Reuse [ER's class lists](./er.md#styles-and-classes): a comma touches the target
or class name before it and has one space after it, with one gap between lists
and before the first declaration; CSS declarations use comma-space. A
declaration has no whitespace before its first colon and one space after it, as
in the other diagram types (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
Mermaid stores the padding before and after the colon, so the Db changes, but it
draws the same figure. A name that ends with `stroke` is the exception, since a
`classDef` or a `style` can reach a relationship with an explicit id, and
mermaid.js colours its arrowheads from `stroke:` only: such a name keeps whether
whitespace stands before the colon, a run becoming one space. The text of a
declaration from its name's start through its last value component otherwise
stays as written: directives in the dash gap, quoted or escaped commas, empty
string components, functions, order and repetition, except that a run of spaces
and tabs between its words is printed as one space, as in the other diagram
types (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)):
`style A --  color:red` is printed `style A -- color: red`, and
`translate(1  2)` is printed `translate(1 2)`. A run inside a string, a comment,
or the parentheses of `url(`, and the escape after a backslash, stay as written.
[fixture: classes-and-styles/css-name-multiline-directive] Only exterior HWS
after the last component can disappear; prefixes with kept semicolons, a comment
or a directive in the statement, and a declaration over lines override ordinary
list layout.

[fixture: classes-and-styles/class-lists] [fixture:
classes-and-styles/css-colon-padding] [fixture:
classes-and-styles/css-post-colon-run-collapsed] [fixture:
classes-and-styles/css-stroke-before-colon-kept] [fixture:
classes-and-styles/css-stroke-before-colon-run-collapsed] [fixture:
classes-and-styles/css-stroke-before-colon-touching] [fixture:
classes-and-styles/css-custom-gap-run-collapsed] [fixture:
classes-and-styles/css-custom-gap-touching-run-collapsed] [fixture:
classes-and-styles/css-words-run-spaced] [fixture:
classes-and-styles/css-string-runs-kept] [fixture:
classes-and-styles/css-url-runs-kept] [fixture:
classes-and-styles/css-value-internal] [corpus fixture:
usecase/gram-css-empty-string-component] [fixture:
classes-and-styles/css-gap-directive] [fixture:
classes-and-styles/css-semicolon-gap] [corpus fixture:
usecase/lex-style-hash-semicolon] [fixture:
classes-and-styles/css-pre-colon-whitespace-dropped] [fixture:
classes-and-styles/css-classdef-gap] [fixture:
classes-and-styles/css-line-rule-colon-gap-kept] [fixture:
classes-and-styles/css-both-passes] [test: usecase: css-other-case-segment]
[fixture: classes-and-styles/declaration-order-and-repetition] [fixture:
classes-and-styles/css-functions] [fixture:
classes-and-styles/css-inline-percent] [fixture:
classes-and-styles/trailing-after-comma]

Input (escaped):
`"usecase-beta\nA\nstyle  A   fill   :  red   ,  stroke-width : 2px  "`

Output
([classes-and-styles/css-colon-padding-output.mmd](../tests/fixtures/usecase/classes-and-styles/css-colon-padding-output.mmd)):

```mmd
usecase-beta
  A
  style A fill: red, stroke-width: 2px
```

### Notes

Print `note for <target> <label>` with one ordinary gap between parts, keeping
the target, markdown or empty label and note order; a plain label is printed in
quotes (see [Quotes](#quotes)). This reuses the source-value and keyword-spacing
reasons of [class notes](./class.md#whitespace-between-tokens). Forward
resolution never manufactures an id, position or declaration; inline percent
text remains label content.

[fixture: notes/notes-forms] [fixture: notes/notes-forward] [fixture:
notes/notes-empty-markdown] [fixture: notes/empty-and-markdown-order]

Input (escaped):
`"usecase-beta\nA\nnote  for  A'quoted note'\nnote for A bare  note %% literal"`

Output
([notes/notes-forms-output.mmd](../tests/fixtures/usecase/notes/notes-forms-output.mmd)):

```mmd
usecase-beta
  A
  note for A "quoted note"
  note for A "bare  note %% literal"
```

### Direction and accessibility

Direction prints `direction <written value>`, retaining TD and every occurrence
rather than rebuilding the final direction. Reuse
[class labels](./class.md#labels) and
[C4 accessibility lines](./c4.md#accessibility-lines): the colon touches its
keyword and one space precedes the trimmed value. Equivalent exterior whitespace
gets the same compact form as the sibling diagrams. Internal characters and
whitespace, comments, directives, percent and semicolon text stay. Empty and
whitespace-only lines print the colon form without a value. The next physical
line remains a separate statement; the siblings' next-line joining does not
apply. In particular, direction text after an empty colon line remains a
separate direction statement, rather than becoming accessibility value text.
[fixture: direction-and-accessibility/title-next-direction-separate] [fixture:
direction-and-accessibility/description-next-direction-separate] [fixture:
direction-and-accessibility/a11y-trimmed] [test: usecase: a11y-unicode-exterior]

Description blocks reuse [class multiline values](./class.md#multi-line-values):
align body lines one step inside the statement and a separate `}` with the
statement, including a block whose only content is a comment line. Mermaid
discards indentation after LF from the description. Structural indentation keeps
the same layout with zero width or tabs. [fixture:
direction-and-accessibility/a11y-closer-aligned] [fixture:
direction-and-accessibility/a11y-closer-tabs] [fixture:
direction-and-accessibility/a11y-closer-zero] [fixture:
direction-and-accessibility/a11y-directive-padding] [fixture:
direction-and-accessibility/a11y-comment-empty-tabs] The whitespace before the
`}` is no text, so the `}` stays aligned with the statement in every pass, also
after a comment line. [fixture:
direction-and-accessibility/block-comment-line-after-the-text] A block with one
line of text on a line of its own follows
[A description block on one line](./compatibility.md#a-description-block-on-one-line)
too, also where the text has runs of spaces and tabs or a directive follows it.
[fixture: direction-and-accessibility/block-text-on-its-own-line] [fixture:
direction-and-accessibility/block-text-on-its-own-line-runs-collapsed] [fixture:
direction-and-accessibility/block-directive-line-after-the-text]

Blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: direction-and-accessibility/keyword-brace-touching] [fixture:
direction-and-accessibility/keyword-brace-space] [fixture:
direction-and-accessibility/keyword-brace-run] [test: accessibility revisions:
usecase keyword-brace-tab] Empty and whitespace-only interiors print `{}`.
[fixture: direction-and-accessibility/empty-block-lines] The source retention
rules for protected common comment regions and semicolon prefixes still take
priority.

The directives that end the value of an `accTitle` or an `accDescr` are printed
as those that end a title (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)):
`accTitle: Column zero  %%{x}%%  ` and `accTitle: Column zero  %%{x}%%` are both
printed `accTitle: Column zero %%{x}%%`. [fixture:
direction-and-accessibility/acctitle-trailing-directive-blanks-dropped]

[fixture: direction-and-accessibility/direction-values] [fixture:
direction-and-accessibility/a11y-padding] [fixture:
direction-and-accessibility/a11y-empty-distinct] [fixture:
direction-and-accessibility/a11y-block-value] [fixture:
direction-and-accessibility/a11y-trimmed] [fixture:
direction-and-accessibility/a11y-next-line-is-node] [fixture:
direction-and-accessibility/a11y-comment-empty] [fixture:
direction-and-accessibility/a11y-closer-aligned] [fixture:
direction-and-accessibility/all-directions] [fixture:
direction-and-accessibility/literal-directives-semicolons] [fixture:
direction-and-accessibility/empty-block-lines]

Input (escaped): `"usecase-beta\ndirection  TD\nA\ndirection\tBT\ndirection RL"`

Output
([direction-and-accessibility/direction-values-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/direction-values-output.mmd)):

```mmd
usecase-beta
  direction TD
  A
  direction BT
  direction RL
```

Input (escaped): `"usecase-beta\naccDescr{ a }\nA[Keyword gap]"`.

Output
([direction-and-accessibility/keyword-brace-touching-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/keyword-brace-touching-output.mmd)):

```mmd
usecase-beta
  accDescr: a
  A[Keyword gap]
```

### Blank lines

Reuse [class blank grouping](./class.md#blank-lines): collapse ordinary blank
runs to one and drop diagram/boundary-edge blanks, because one blank separates
groups and more add nothing. ASCII space/tab-only lines are ordinary blanks,
including after native bare comments and around standalone directives. Values,
native metadata, JSON, directives and protected common-region joins keep their
own blank lines. No C4 recovery-gap or Ishikawa blank-pairing rule is imported.

[fixture: blank-lines/blank-runs] [fixture: blank-lines/blank-boundary]
[fixture: blank-lines/blank-comments] [fixture: blank-lines/blank-in-value]
[fixture: blank-lines/directives-and-boundary-edges]

Input (escaped): `"usecase-beta\nsystemBoundary Box\n\nactor U\n\n\nA\n\nend"`

Output
([blank-lines/blank-boundary-output.mmd](../tests/fixtures/usecase/blank-lines/blank-boundary-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box
    actor U

    A
  end
```

### Comments

Reuse [standalone comment alignment](./class.md#comments): comments align with
nearby statements, with declarations before boundary `end`, and at column one
before the header, retaining all comment text and terminal HWS. [fixture:
system-boundaries/boundary-header-comment-empty] [test: usecase:
terminal-comment-tab] A native comment starts only at an ASCII-HWS-only
physical-line prefix and runs through LS/PS to LF/EOF; bare percent and
non-directive brace forms are comments here. There is no native trailing
statement comment: inline percent text remains label/note/CSS/accessibility
content where allowed. Common comment regions apply earlier in all contexts;
preserve their swallowed suffixes, joins and later columns so text is not
exposed or reindented into another value. No Agentflow size branch applies.

[fixture: comments/comments-align] [fixture: comments/comments-bare] [fixture:
comments/comments-inline-label] [test: usecase: comment-region-join] [corpus
fixture: usecase/div-comment-preheader-bare] [fixture:
comments/div-preheader-braces] [fixture: comments/inline-note-css-accessibility]
[fixture: comments/common-region-inside-values]

Input (escaped): `"usecase-beta\n%%\n%%{}%%\nA"`

Output
([comments/comments-bare-output.mmd](../tests/fixtures/usecase/comments/comments-bare-output.mmd)):

```mmd
usecase-beta
  %%
  %%{}%%
  A
```

### Directives

Reuse [shared directive attachment](./class.md#directives): removal supplies no
separator. Keep directive contents, order and multiline columns; align
standalone directives, and place a directive within a printed line as under
[flowchart's Directives](./flowchart.md#directives). [fixture:
system-boundaries/boundary-id-title-directed-gap] [fixture:
arrows/semantic-operator-directives] [fixture:
arrow-id-boundaries/arrow-marker-both-gap-sides] Header-line directives remain
with the header. Value-side gaps, CSS name/value spans and opaque JSON remain
exact apart from [JSON table margins](#json-tables), including separate JSON
id/`@`/brace boundaries. [fixture:
classes-and-styles/css-name-multiline-directive] [fixture:
json-tables/json-prefix-id-at-multiline-directive] Native `@{`, unquoted words
and arrows stay atomic. EOF-reaching directives keep their ending and semicolon
stops keep their place; quoted native keys/scalars may contain directive
fragments. [fixture: native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive]

[fixture: directives/directives-align] [fixture:
directives/directives-ordinary-gap] [fixture: directives/directives-touch]
[fixture: directives/directives-value-gap] [fixture:
directives/directives-multiline] [fixture: directives/directives-json-prefix]
[corpus fixture: usecase/directive-after-header] [fixture:
directives/directives-open-eof] [fixture:
directives/directives-native-key-quoted] [fixture:
directives/directives-css-value] [fixture: directives/directives-gap-prefix-o]
[fixture: directives/directives-header-spaced] [fixture:
directives/header-at-eof] [fixture: directives/before-boundary-end] [fixture:
directives/open-word-stop]

Input (escaped): `"usecase-beta\nactor  %%{init: {}}%%  User"`

Output
([directives/directives-ordinary-gap-output.mmd](../tests/fixtures/usecase/directives/directives-ordinary-gap-output.mmd)):

```mmd
usecase-beta
  actor %%{init: {}}%%User
```

### Multiline values and order

Reuse [C4 value columns](./c4.md#multiline-values) and
[flowchart's no-wrapping rule](./flowchart.md#line-wrapping): authored lines and
columns are characters, and `printWidth` does not wrap long statements. Keep
markdown, JSON, directives and common-region continuations; ordinary strings and
stereotypes gain no physical newline. Usecase is line-oriented, so a structural
newline can reject a relationship: `A-->` followed by `B` on the next line is
rejected, and wrapping `LongSource-->LongTarget` at a small `printWidth` turns
an accepted input into a rejected one. Markdown strings, JSON and description
blocks can hold real newlines because those are value text. Description-body
columns follow [Direction and accessibility](#direction-and-accessibility).
Native metadata structure follows its own rule. [fixture:
native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive] Repeated compatible
declarations, boundaries, relationships, notes, class definitions/assignments
and updates stay in source order, even when a shorter representation would have
the same Db. Do not join physical statements or print the resolved model.

[fixture: multiline-values-and-order/no-wrap] [fixture:
multiline-values-and-order/multiline-markdown] [fixture:
multiline-values-and-order/repeated-order] [fixture:
multiline-values-and-order/wrap-arrow-kept] [fixture:
multiline-values-and-order/repeated-notes-and-updates]

Input (escaped):
`"usecase-beta\nVeryLongSourceIdentifier-- a deliberately long label -->VeryLongTargetIdentifier"`

Output
([multiline-values-and-order/no-wrap-output.mmd](../tests/fixtures/usecase/multiline-values-and-order/no-wrap-output.mmd)):

```mmd
usecase-beta
  VeryLongSourceIdentifier -- "a deliberately long label" --> VeryLongTargetIdentifier
```

### Trailing whitespace

Reuse [exterior cleanup](./c4.md#trailing-whitespace): remove harmless ASCII
spaces/tabs after completed structural forms and final CSS components. The
padding around the colon of a CSS declaration follows
[Classes and styles](#classes-and-styles). Accessibility lines and stereotype
boundaries normalize exterior whitespace by their sibling rules. [fixture:
stereotypes/side-padding] Quoted/markdown values, JSON, native property strings,
comments and directive contents keep their trailing characters. [test: usecase:
terminal-comment-tab] [test: usecase: terminal-a11y-tab] Unicode characters are
not automatically exterior HWS; no dangling null CSS style is synthesized.

[fixture: trailing-whitespace/trailing-exterior] [fixture:
trailing-whitespace/trailing-values] [fixture:
trailing-whitespace/trailing-global-trim-kept] [fixture:
trailing-whitespace/opaque-and-metadata-lines]

Input (escaped):
`"usecase-beta  \nactor U \t\nA-->B  \nA@{ }\t\nstyle A fill:red \t"`

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/usecase/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
usecase-beta
  actor U
  A --> B
  A@{ }
  style A fill: red
```

### Line terminators

Reuse shared [line endings](./compatibility.md#line-endings): Mermaid normalizes
physical CR/CRLF to LF before reading, and output follows `endOfLine`, including
inside metadata, JSON, markdown, accessibility, CSS and directives. LS/PS remain
contextual characters in labels, stereotype text, notes, quoted native/CSS
values, accessibility and comments; accessibility and stereotype exterior
whitespace follows their normalization rules. [test: usecase:
a11y-unicode-exterior] [test: usecase: stereotype-unicode-exterior-padding] In
JSON they remain opaque string or structural content. Native comments continue
through them to LF, and textual semicolon segments retain their Unicode
boundaries. Rejected default id/gap/property/CSS placements are not repaired.
Leading common trivia alone uses the broader whitespace set. The shared
file-leading BOM and frontmatter limitation remains. Escaped tests keep these
characters out of package files. For example, `"usecase-beta\rA\rA-->B\r"`
prints `"usecase-beta\n  A\n  A --> B\n"`.

[test: usecase: eol-cr] [test: usecase: eol-crlf] [test: usecase: eol-output-cr]
[test: usecase: eol-output-crlf] [test: usecase: unicode-labels] [test: usecase:
unicode-stereotype] [test: usecase: unicode-native-metadata] [test: usecase:
unicode-json-string] [test: usecase: unicode-a11y] [test: usecase:
unicode-comment] [test: usecase: unicode-comment-to-lf-kept] [test: usecase:
unicode-metadata-separator-opaque] [test: usecase: bom-leading] [test: usecase:
unicode-note] [test: usecase: eol-cr-all-modes] [test: usecase:
unicode-css-string] [test: usecase: unicode-joined-native-metadata] [test:
usecase: unicode-semicolon-segments] [test: usecase: crlf-metadata-blank-lines]
[test: usecase: nbsp-css-string] [test: usecase: unicode-boundary-title] [test:
usecase: crlf-output-values]

### Frontmatter YAML

Reuse [guarded frontmatter](./flowchart.md#frontmatter-yaml): safe configuration
benefits from YAML formatting, while malformed bodies, indented delimiters, HTML
tag starts in written/formatted YAML and formatted delimiter hazards retain
their reading. Keep delimiters and closing padding, comments and directives
before the header; frontmatter title is not an accessibility statement, and
usecase clears the common title at this pin. YAML uses the shared positive
minimum even with `tabWidth: 0`, while the body remains zero. HTML
cross-frontmatter cases use the specified body-only reading without rewriting
body quotes to imitate raw Mermaid.

[fixture: frontmatter-yaml/frontmatter-safe] [corpus fixture:
usecase/div-frontmatter-malformed] [fixture:
frontmatter-yaml/frontmatter-indented] [fixture:
frontmatter-yaml/frontmatter-html-guard] [fixture:
frontmatter-yaml/frontmatter-delimiter-guard] [fixture:
frontmatter-yaml/frontmatter-zero] [fixture:
frontmatter-yaml/frontmatter-zero-scalar] [corpus fixture:
usecase/div-html-frontmatter-acc-title-db] [fixture:
frontmatter-yaml/closing-padding-and-trivia] [fixture:
frontmatter-yaml/body-only-html-reading] [fixture:
frontmatter-yaml/malformed-title] [fixture:
frontmatter-yaml/ineffective-title-types]

Input (escaped):
`"---\ntitle:   T\nconfig: {usecase: {useMaxWidth:  true}}\n---\nusecase-beta\nA"`

Output
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/usecase/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: T
config: { usecase: { useMaxWidth: true } }
---
usecase-beta
  A
```

### Final newline

Reuse the [shared file ending](./c4.md#final-newline): ordinary accepted input
ends with exactly one configured newline, including header-only input, bare
comments and empty accessibility lines. Padding kept by each value's rule stays
before it; accessibility exterior whitespace is trimmed by its rule. An
EOF-reaching directive gains no character inside its value. [test: usecase:
terminal-comment-tab] [test: usecase: terminal-a11y-tab] Exterior terminal
directive whitespace follows the shared range rule. Rejected syntax is never
rescued by adding an ending.

[fixture: final-newline/final-ordinary] [fixture:
final-newline/final-bare-comment] [fixture: final-newline/final-value-padding]
[fixture: final-newline/final-open-directive] [fixture:
final-newline/empty-title-and-bare-comment] [fixture:
final-newline/directive-exterior-whitespace] [corpus fixture:
usecase/db-acctitle-eof]

Input (escaped): `"usecase-beta\nA\n\n\n"`

Output
([final-newline/final-ordinary-output.mmd](../tests/fixtures/usecase/final-newline/final-ordinary-output.mmd)):

```mmd
usecase-beta
  A
```

### Markdown fences

Reuse shared [Markdown containers](./compatibility.md#markdown-code-blocks):
apply these rules to the dedented payload, while the host supplies fence, list
and quote indentation. Fixed host tests cover stereotype suffixes, native
metadata, JSON, multiline values, directives, zero width, tabs, an empty header
and declined failures. [test: usecase Markdown: stereotype-suffixes]
Accessibility lines trim exterior whitespace in standalone files and Markdown:
`accTitle:  Title  ` becomes `accTitle: Title` in both. Declined fences receive
only the host's whitespace/EOL handling.

[fixture: markdown-fences/markdown-top-payload] [fixture:
markdown-fences/markdown-list-payload] [test: usecase Markdown: top-level]
[test: usecase Markdown: list] [test: usecase Markdown: block-quote] [test:
usecase Markdown: zero-metadata] [test: usecase Markdown: tabs-boundary] [test:
usecase Markdown: json] [test: usecase Markdown: multiline-value] [test: usecase
Markdown: directives] [test: usecase Markdown: last-value-padding] [test:
usecase Markdown: rejected-payload] [test: usecase Markdown: empty-header]

Input (escaped): `"usecase-beta\nactor U\nU-->A"`

Output
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/usecase/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
usecase-beta
  actor U
  U --> A
```
