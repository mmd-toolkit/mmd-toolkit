# Venn formatting rules

Japanese version: [venn.ja.md](./venn.ja.md)

How prettier-plugin-mmd formats `venn-beta`, following the
[Venn syntax](../../spec/docs/diagrams/venn.md) and
[tree](../../spec/docs/ast/venn.md). Each choice retains what mermaid.js reads;
where several forms have the same Db, the rule states its reason.

Some words used below:

- A **declaration** is a `set` or `union` statement. A **name list** supplies
  its sets, or the targets of text/style.
- **Explicit text** supplies targets (`text A item`); **implicit text** has
  `targets: null` (`  text item`) and uses the last declaration while its
  **mode** is enabled. Positive indentation selects syntax, not nesting.
- A **value** is an authored name, id, label, size, style value or title.
  **Exterior whitespace** lies outside values, comments and directives.
- A **directive** is `%%{ ... }%%`, removed before the diagram is read. A
  **standalone comment** occupies its own line; a **trailing comment** follows
  other text. A **diagram comment** is read by the Venn reader itself; a common
  comment region is removed earlier. A **swallowed fragment** is the preceding
  code unit recorded as `VennIgnoredText`.
- A **line** ends at LF after CR/CRLF normalization. A **line-rule segment** is
  what the shared semicolon rule reads: it ends at a line terminator, U+2028 or
  U+2029 outside directives, and is read without directives or removed common
  comment regions. A diagram comment does not shield its separators. Exact-case
  `style` or `classDef`, a colon, a later hash without intervening whitespace,
  and a later semicolon can select the segment's last semicolon for removal. See
  [the shared rule](../../spec/docs/common.md#style-and-classdef-lines).
- A **protected stretch** (or **kept part**) is the printer's prefix through the
  last semicolon, extended through whole crossing values, comments and
  directives. It can cover several line-rule segments: the printer cannot cut a
  diagram comment at a Unicode separator without exposing its text as diagram
  syntax or changing which semicolon the line rule selects.

Input/output examples link to fixed formatting fixtures. In escaped strings,
`\n` is LF, `\r` CR, `\t` a tab, and `\u2028`/`\u2029` the Unicode separators;
those denote characters, not backslashes in a diagram. See
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Header

The exact `venn-beta` header stands at column one so the diagram is easy to
find; ordinary header-line statements move to body lines, while attached
fragments, directives and kept parts retain their relations.

[fixture: venn/header/corpus-header-before-comment] [fixture:
venn/header/corpus-header-before-directive] [fixture:
venn/header/corpus-header-before-frontmatter-comment] [fixture:
venn/header/corpus-header-statement-tab] [fixture:
venn/header/header-comment-fragment-control] [fixture:
venn/header/header-comment-fragment] [fixture: venn/header/header-control]
[fixture: venn/header/header-inline] [fixture: venn/header/header] [fixture:
venn/header/header-leading-inline-directive] [fixture:
venn/header/header-only-control] [fixture: venn/header/header-only] [fixture:
venn/header/header-semicolon-prefix] [fixture: venn/header/header-title-control]
[fixture: venn/header/header-title] [fixture:
venn/header/header-trailing-comment]

Input (escaped):

```json
"venn-beta set A"
```

Output
([header/header-inline-output.mmd](../tests/fixtures/venn/header/header-inline-output.mmd)):

```mmd
venn-beta
set A
```

Under the specified
[`c4-keyword-anywhere`](../../spec/docs/known-divergences/c4-keyword-anywhere.md)
divergence, C4 words in names or values do not change Venn dispatch; these
accepted inputs follow their Venn formatting rules.

[fixture: venn/header/corpus-div-c4-bare-identifier] [fixture:
venn/header/div-c4-detector]

Input (escaped):

```json
"venn-beta\nset \"C4Container\""
```

Output
([header/div-c4-detector-output.mmd](../tests/fixtures/venn/header/div-c4-detector-output.mmd)):

```mmd
venn-beta
set "C4Container"
```

### Indentation

With spaces, one configured indentation level is at least one character, even
with `tabWidth: 0`; `useTabs` still supplies a tab. Formatting must not change
the Db, and one character is the smallest width that keeps the indentation's
reading. Only implicit text needs that positive marker; ordinary statements
remain at column one.

[fixture: venn/indentation/tab-width-0] [fixture:
venn/indentation/tab-width-0-leading-directive] [fixture:
venn/indentation/tab-width-0-kept] [fixture:
venn/indentation/tab-width-0-kept-leading-directive] [fixture:
venn/indentation/tab-width-0-internal-marker] [fixture:
venn/indentation/tab-width-0-use-tabs]

Ordinary set, union, style, title and explicit text statements stand at column
one; only implicit text stands one configured step deeper (`tabWidth`,
`useTabs`). Positive indentation selects implicit syntax while mode is enabled;
it expresses no nesting, and indenting explicit text can change its reading. A
declaration enables mode, a later ordinary line-start statement clears it, and
another declaration enables it again.

[fixture: venn/indentation/corpus-db-form-indent-id-label] [fixture:
venn/indentation/corpus-db-form-indent-number] [fixture:
venn/indentation/corpus-db-form-indent-string] [fixture:
venn/indentation/corpus-db-form-indent-string-label] [fixture:
venn/indentation/corpus-db-indent-after-header-set] [fixture:
venn/indentation/corpus-db-indent-after-indented-set] [fixture:
venn/indentation/corpus-db-indent-after-indented-union] [fixture:
venn/indentation/corpus-db-indent-after-union] [fixture:
venn/indentation/explicit-indent-unsafe] [fixture:
venn/indentation/implicit-dedent-unsafe] [fixture:
venn/indentation/indent-four-control] [fixture: venn/indentation/indent-four]
[fixture: venn/indentation/indent-tabs-control] [fixture:
venn/indentation/indent-tabs] [fixture: venn/indentation/indent-width-control]
[fixture: venn/indentation/indent-width] [fixture:
venn/indentation/leading-directives-positive] [fixture:
venn/indentation/leading-directives-zero] [fixture:
venn/indentation/marker-kept-prefix] [fixture:
venn/indentation/mode-end-explicit-control] [fixture:
venn/indentation/mode-end-explicit] [fixture:
venn/indentation/mode-end-style-control] [fixture:
venn/indentation/mode-end-style] [fixture:
venn/indentation/mode-end-title-control] [fixture:
venn/indentation/mode-end-title] [fixture:
venn/indentation/mode-no-current-control] [fixture:
venn/indentation/mode-no-current] [fixture:
venn/indentation/mode-reenabled-control] [fixture:
venn/indentation/mode-reenabled] [fixture:
venn/indentation/union-positive-widths]

Input (escaped):

```json
"venn-beta\n    set A\n         text one\n text two"
```

Output
([indentation/indent-width-output.mmd](../tests/fixtures/venn/indentation/indent-width-output.mmd)):

```mmd
venn-beta
set A
  text one
  text two
```

### Statements one per line

Ordinary complete statements split into separate lines for scanning; a
declaration and its same-line style, explicit text or title followers remain
together because splitting would introduce a line-start statement that clears
implicit mode. Same-line declaration runs can split, even where a retained group
is followed by a declaration that resets the mode. Titles keep their
statement-looking value text, and swallowed fragments stay with their written
line neighbours.

[fixture:
venn/statements-one-per-line/corpus-db-indent-after-same-line-explicit-text]
[fixture: venn/statements-one-per-line/corpus-db-indent-after-same-line-style]
[fixture: venn/statements-one-per-line/corpus-db-indent-after-same-line-title]
[fixture: venn/statements-one-per-line/corpus-header-statement-on-line]
[fixture: venn/statements-one-per-line/declaration-runs] [fixture:
venn/statements-one-per-line/header-declaration-group] [fixture:
venn/statements-one-per-line/ordinary-semicolon-repair-control] [fixture:
venn/statements-one-per-line/same-line-declaration-reset-control] [fixture:
venn/statements-one-per-line/same-line-declaration-reset] [fixture:
venn/statements-one-per-line/same-line-style-kept-control] [fixture:
venn/statements-one-per-line/same-line-style-kept] [fixture:
venn/statements-one-per-line/same-line-style-split-unsafe] [fixture:
venn/statements-one-per-line/same-line-text-kept-control] [fixture:
venn/statements-one-per-line/same-line-text-kept] [fixture:
venn/statements-one-per-line/same-line-text-split-unsafe] [fixture:
venn/statements-one-per-line/same-line-title-kept-control] [fixture:
venn/statements-one-per-line/same-line-title-kept] [fixture:
venn/statements-one-per-line/same-line-title-split-unsafe] [fixture:
venn/statements-one-per-line/same-line-title-value] [fixture:
venn/statements-one-per-line/split-inline-directive] [fixture:
venn/statements-one-per-line/statements-split-control] [fixture:
venn/statements-one-per-line/statements-split] [fixture:
venn/statements-one-per-line/title-not-two-statements-control] [fixture:
venn/statements-one-per-line/title-not-two-statements]

Input (escaped):

```json
"venn-beta set A   style A fill : red\n text item"
```

Output
([statements-one-per-line/header-declaration-group-output.mmd](../tests/fixtures/venn/statements-one-per-line/header-declaration-group-output.mmd)):

```mmd
venn-beta
set A style A fill:red
  text item
```

### Blank lines

Ordinary blank runs collapse to one and body-edge blanks disappear, retaining
grouping without excess space. Value blanks and protected diagram-comment gaps
remain: an empty line and a nonempty space/tab-only line before an unindented
`%%{ }%%` can select different modes. Common comment regions that join source
lines also retain their boundaries.

[fixture: venn/blank-lines/blank-before-empty-braces-explicit] [fixture:
venn/blank-lines/blank-before-indented-empty-braces] [fixture:
venn/blank-lines/blank-in-value-control] [fixture:
venn/blank-lines/blank-in-value] [fixture: venn/blank-lines/blank-runs-control]
[fixture: venn/blank-lines/blank-runs] [fixture:
venn/blank-lines/comment-groups] [fixture:
venn/blank-lines/corpus-db-indent-after-blank] [fixture:
venn/blank-lines/corpus-db-indent-blank-line] [fixture:
venn/blank-lines/corpus-gram-indent-after-empty-braces-explicit-id] [fixture:
venn/blank-lines/corpus-gram-indent-after-empty-braces-explicit-string]
[fixture:
venn/blank-lines/corpus-gram-indent-after-empty-braces-explicit-target-list]
[fixture: venn/blank-lines/corpus-lex-indent-indented-empty-braces-after-blank]
[fixture: venn/blank-lines/corpus-lex-indent-set-blank-directive] [fixture:
venn/blank-lines/corpus-lex-indent-set-empty-braces-blank] [fixture:
venn/blank-lines/corpus-lex-indent-set-two-empty-braces] [fixture:
venn/blank-lines/corpus-lex-indent-spaces-before-empty-braces] [fixture:
venn/blank-lines/corpus-lex-indent-tab-line-before-empty-braces] [fixture:
venn/blank-lines/corpus-lex-indent-union-blank-directive] [fixture:
venn/blank-lines/corpus-lex-unindented-blank-followed-comment] [fixture:
venn/blank-lines/directive-groups] [fixture: venn/blank-lines/fragment-gaps]
[fixture: venn/blank-lines/mode-trivia-control] [fixture:
venn/blank-lines/mode-trivia] [fixture:
venn/blank-lines/whitespace-before-empty-braces]

Input
([blank-lines/blank-runs-input.mmd](../tests/fixtures/venn/blank-lines/blank-runs-input.mmd)):

```mmd

venn-beta


set A


set B

```

Output
([blank-lines/blank-runs-output.mmd](../tests/fixtures/venn/blank-lines/blank-runs-output.mmd)):

```mmd
venn-beta
set A

set B
```

### Comments

Standalone comments align with the next statement, or the last statement at EOF,
to show their association. Trailing comments retain touching versus spaced
attachment, reducing an ordinary spaced gap to one space; a swallowed
`VennIgnoredText` fragment remains touching its comment because detaching it can
reject the input. Comment contents, including trailing spaces and U+2028/U+2029
through LF or EOF, stay whole; percent pairs inside values remain value text.
Protected gaps retain comment and mode boundaries.

[fixture: venn/comments/bare-percent-tail] [fixture:
venn/comments/comment-directives] [fixture:
venn/comments/comment-mark-value-control] [fixture:
venn/comments/comment-mark-value] [fixture:
venn/comments/comment-spaced-control] [fixture: venn/comments/comment-spaced]
[fixture: venn/comments/comment-touch-control] [fixture:
venn/comments/comment-touch] [fixture: venn/comments/comments-align-control]
[fixture: venn/comments/comments-align] [fixture:
venn/comments/complete-multiletter] [fixture:
venn/comments/corpus-lex-bare-percent-between-set-and-text] [fixture:
venn/comments/corpus-lex-comment-line-before-text] [fixture:
venn/comments/corpus-lex-comment-multiple-spaces-before-text] [fixture:
venn/comments/corpus-lex-eaten-fragment-before-line-break] [fixture:
venn/comments/corpus-lex-empty-braces-percent-between-set-and-text] [fixture:
venn/comments/corpus-lex-inline-comment-spaced] [fixture:
venn/comments/corpus-lex-style-extra-id-eaten] [fixture:
venn/comments/empty-braces-tail] [fixture: venn/comments/fragment-tail]
[fixture: venn/comments/header-comment] [fixture:
venn/comments/header-only-comment] [fixture:
venn/comments/ignored-fragment-control] [fixture:
venn/comments/ignored-fragment] [fixture:
venn/comments/ignored-line-preserves-mode-control] [fixture:
venn/comments/ignored-line-preserves-mode]

Input (escaped):

```json
"venn-beta\nset A Q%% note\n text item"
```

Output
([comments/ignored-fragment-output.mmd](../tests/fixtures/venn/comments/ignored-fragment-output.mmd)):

```mmd
venn-beta
set A Q%% note
  text item
```

### Name lists

Keywords and operands use one separator; name commas touch the preceding name
and take one following space for readable lists. Bare and quoted names, quoted
padding, empty names, source order and repeated members stay as written, even
where the Db sorts targets; directives and ignored semicolons override ordinary
gap spacing.

[fixture: venn/name-lists/corpus-db-case-distinct-ids] [fixture:
venn/name-lists/corpus-db-empty-identifiers] [fixture:
venn/name-lists/corpus-db-union-repeated-member] [fixture:
venn/name-lists/corpus-lex-name-list-comma-directive] [fixture:
venn/name-lists/corpus-lex-union-empty-quoted-members] [fixture:
venn/name-lists/corpus-lex-union-matching-quoted-padding] [fixture:
venn/name-lists/empty-quoted-targets] [fixture:
venn/name-lists/name-order-keep-control] [fixture:
venn/name-lists/name-order-keep] [fixture:
venn/name-lists/name-quoted-padding-control] [fixture:
venn/name-lists/name-quoted-padding] [fixture:
venn/name-lists/names-comma-control] [fixture: venn/name-lists/names-comma]
[fixture: venn/name-lists/names-quotes-equivalent-control] [fixture:
venn/name-lists/names-quotes-equivalent] [fixture:
venn/name-lists/quoted-keyword]

Input (escaped):

```json
"venn-beta\nset A\nset \"B\"\nunion A ,\"B\" , A\ntext A , \"B\" item\nstyle A ,\"B\" fill:red"
```

Output
([name-lists/names-comma-output.mmd](../tests/fixtures/venn/name-lists/names-comma-output.mmd)):

```mmd
venn-beta
set A
set "B"
union A, "B", A
text A, "B" item
style A, "B" fill:red
```

### Labels

A bracket label touches its name or text id for a compact suffix; its
bare/quoted form and every interior character stay as written. Db trimming does
not authorize value edits: an empty quoted label or bare whitespace label omits
the Db label, whereas quoted whitespace stores an empty label. Embedded trivia
stays inside the label, and gap items retain attachment instead of applying
tight spacing.

[fixture: venn/labels/specified-c4-label-title] [fixture:
venn/labels/all-suffixes] [fixture:
venn/labels/corpus-db-form-text-string-label] [fixture:
venn/labels/corpus-db-form-union-label] [fixture:
venn/labels/corpus-lex-directive-label-delimiter-gap] [fixture:
venn/labels/corpus-lex-label-bare-comment-only] [fixture:
venn/labels/corpus-lex-label-bare-padding] [fixture:
venn/labels/corpus-lex-label-quoted-comment-only] [fixture:
venn/labels/corpus-lex-label-quoted-directive-only] [fixture:
venn/labels/corpus-lex-label-quoted-ignored-semicolon-only] [fixture:
venn/labels/directive-attachment] [fixture:
venn/labels/labels-empty-form-differs-control] [fixture:
venn/labels/labels-empty-form-differs] [fixture:
venn/labels/labels-empty-kept-control] [fixture: venn/labels/labels-empty-kept]
[fixture: venn/labels/labels-form-equal-control] [fixture:
venn/labels/labels-form-equal] [fixture:
venn/labels/labels-padding-trim-equal-control] [fixture:
venn/labels/labels-padding-trim-equal] [fixture: venn/labels/multiline-padding]
[fixture: venn/labels/quoted-delimiter-directive] [fixture:
venn/labels/quoted-label-padding-trim-equal] [fixture:
venn/labels/suffix-spacing-control] [fixture: venn/labels/suffix-spacing]

Input (escaped):

```json
"venn-beta\nset A [ L ] : 002.00\n text item [\" Label \"]"
```

Output
([labels/suffix-spacing-output.mmd](../tests/fixtures/venn/labels/suffix-spacing-output.mmd)):

```mmd
venn-beta
set A[ L ]:002.00
  text item[" Label "]
```

### Sizes and numbers

A size touches the preceding name or label as `:number`, giving both suffixes
one compact form. Signs, fractions, leading zeros, signed zero and overflow
retain their spelling; numeric text ids also retain their spelling because
rewriting them changes the Db. Absent size and written zero remain distinct
written forms.

[fixture: venn/sizes-and-numbers/absent-zero-signs] [fixture:
venn/sizes-and-numbers/corpus-db-set-colon-size-inline-directive] [fixture:
venn/sizes-and-numbers/corpus-db-set-label-colon-size-inline-directive]
[fixture: venn/sizes-and-numbers/corpus-db-size-negative-overflow] [fixture:
venn/sizes-and-numbers/corpus-db-size-negative-zero] [fixture:
venn/sizes-and-numbers/corpus-db-size-overflow] [fixture:
venn/sizes-and-numbers/corpus-db-size-zero] [fixture:
venn/sizes-and-numbers/size-spaces-control] [fixture:
venn/sizes-and-numbers/size-spaces] [fixture:
venn/sizes-and-numbers/size-spelling-equal-control] [fixture:
venn/sizes-and-numbers/size-spelling-equal] [fixture:
venn/sizes-and-numbers/text-number-forms] [fixture:
venn/sizes-and-numbers/text-number-spelling-differs-control] [fixture:
venn/sizes-and-numbers/text-number-spelling-differs]

Input (escaped):

```json
"venn-beta\nset A : +02.50 set B: -.5 union A,B : 007\n text 007"
```

Output
([sizes-and-numbers/size-spaces-output.mmd](../tests/fixtures/venn/sizes-and-numbers/size-spaces-output.mmd)):

```mmd
venn-beta
set A:+02.50
set B:-.5
union A, B:007
  text 007
```

### Style properties

Properties use `key:value` and comma plus one space, distinguishing compact
punctuation from value whitespace. Each bare value is one written `VennLiteral`,
retaining adjacent atoms and their spacing even where the Db joins atoms with
spaces; quoted values, whole rgb/rgba tokens, key case, repetitions and separate
statements stay as written. A kept prefix overrides punctuation spacing so
colon-to-hash gaps cannot change semicolon selection.

[fixture: venn/style-properties/corpus-div-c4-bare-style-value] [fixture:
venn/style-properties/corpus-db-style-case-and-order] [fixture:
venn/style-properties/corpus-db-style-colon-value-inline-directive] [fixture:
venn/style-properties/corpus-db-style-property-colon-inline-directive] [fixture:
venn/style-properties/corpus-db-style-prototype-keys] [fixture:
venn/style-properties/corpus-db-style-unknown] [fixture:
venn/style-properties/corpus-lex-directive-style-value-color] [fixture:
venn/style-properties/corpus-lex-style-adjacent-units] [fixture:
venn/style-properties/corpus-lex-style-hex-ignored-semicolon] [fixture:
venn/style-properties/corpus-lex-style-rgb-ignored-semicolon] [fixture:
venn/style-properties/corpus-lex-style-single-number-whole-spelling] [fixture:
venn/style-properties/property-directives] [fixture:
venn/style-properties/prototype-repeat] [fixture:
venn/style-properties/style-atoms-kept-control] [fixture:
venn/style-properties/style-atoms-kept] [fixture:
venn/style-properties/style-atoms-normalize-equal-control] [fixture:
venn/style-properties/style-color-kept-control] [fixture:
venn/style-properties/style-color-kept] [fixture:
venn/style-properties/style-color-space-differs-control] [fixture:
venn/style-properties/style-color-space-differs] [fixture:
venn/style-properties/style-common-comment] [fixture:
venn/style-properties/style-order-kept-control] [fixture:
venn/style-properties/style-order-kept] [fixture:
venn/style-properties/style-property-spacing-control] [fixture:
venn/style-properties/style-property-spacing] [fixture:
venn/style-properties/style-quote-differs-control] [fixture:
venn/style-properties/style-quote-differs] [fixture:
venn/style-properties/style-string-empty-control] [fixture:
venn/style-properties/style-string-empty]

Input (escaped):

```json
"venn-beta\nstyle A , B fill : red , opacity : .50 , custom : \" dark blue \""
```

Output
([style-properties/style-property-spacing-output.mmd](../tests/fixtures/venn/style-properties/style-property-spacing-output.mmd)):

```mmd
venn-beta
style A, B fill:red, opacity:.50, custom:" dark blue "
```

### Line rule and kept lines

Every semicolon stays because it never separates Venn statements. The printer
keeps the protected stretch from the first non-whitespace character through the
last semicolon, extending through any crossing value, comment or directive; this
keeps the textual line-rule selection, including nonmatches and markers across
statements. Indentation and exterior trailing whitespace belong to the printer,
and a safe suffix formats normally. The shared rule's segments can end inside a
diagram comment, while the printer's protected stretch retains that whole
comment. Crossing values appear once, and an unclosed directive stopped by a
semicolon retains its stopping boundary.

For example, input `"venn-beta\nset A[style:#x;y]%% c\u2028tail;"` prints
`"venn-beta\nset A[style:#x;y]%% c\u2028tail;\n"` and keeps the Db label
`"style:#xy"`: the label's semicolon is last in the first line-rule segment.
U+2029 gives the same label. With an ASCII space in place of the separator,
input `"venn-beta\nset A[style:#x;y]%% c tail;"` prints the same text with its
final newline; the comment's semicolon is last, so the label retains its entity
(normalized Db text `"style:\ufb02\u00b0x\u00b6\u00dfy"`). Each input keeps its
own reading; the printer preserves the complete comment in both.

[test: venn: ls-comment-competing-semicolon] [test: venn:
ps-comment-competing-semicolon] [fixture:
venn/comments/comment-competing-semicolon-space]

[fixture: venn/line-rule-and-kept-lines/comment-only-semicolon] [fixture:
venn/line-rule-and-kept-lines/corpus-lex-after-set-directive-unclosed] [fixture:
venn/line-rule-and-kept-lines/corpus-lex-identifier-style-rule-other-line]
[fixture:
venn/line-rule-and-kept-lines/corpus-lex-identifier-style-rule-two-semicolons]
[fixture: venn/line-rule-and-kept-lines/corpus-lex-label-classdef-rule]
[fixture: venn/line-rule-and-kept-lines/corpus-lex-label-style-rule-other-line]
[fixture: venn/line-rule-and-kept-lines/corpus-lex-style-style-rule] [fixture:
venn/line-rule-and-kept-lines/corpus-lex-style-style-rule-other-line] [fixture:
venn/line-rule-and-kept-lines/corpus-lex-text-style-rule-other-line] [fixture:
venn/line-rule-and-kept-lines/crossing-multiline-value] [fixture:
venn/line-rule-and-kept-lines/directive-crossing-prefix] [fixture:
venn/line-rule-and-kept-lines/directive-semicolon-stop] [fixture:
venn/line-rule-and-kept-lines/line-rule-colon-space-unsafe] [fixture:
venn/line-rule-and-kept-lines/line-rule-comment-keep-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-comment-keep] [fixture:
venn/line-rule-and-kept-lines/line-rule-comment-move-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-comment-move] [fixture:
venn/line-rule-and-kept-lines/line-rule-cross-statement-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-cross-statement] [fixture:
venn/line-rule-and-kept-lines/line-rule-double-pass-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-double-pass] [fixture:
venn/line-rule-and-kept-lines/line-rule-kept-whitespace-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-kept-whitespace] [fixture:
venn/line-rule-and-kept-lines/line-rule-no-hash-control-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-no-hash-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-nonmatch-value-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-nonmatch-value] [fixture:
venn/line-rule-and-kept-lines/line-rule-other-line-control-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-other-line-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-split-equal-control-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-split-equal-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-suffix-spacing-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-suffix-spacing] [fixture:
venn/line-rule-and-kept-lines/line-rule-uppercase-control-control] [fixture:
venn/line-rule-and-kept-lines/line-rule-uppercase-control] [fixture:
venn/line-rule-and-kept-lines/markers-across-statements] [fixture:
venn/line-rule-and-kept-lines/multiple-last-semicolons] [fixture:
venn/line-rule-and-kept-lines/semicolon-removal-shifts]

Input (escaped):

```json
"venn-beta\n set A[style:#x;y]   set B : 2   "
```

Output
([line-rule-and-kept-lines/line-rule-suffix-spacing-output.mmd](../tests/fixtures/venn/line-rule-and-kept-lines/line-rule-suffix-spacing-output.mmd)):

```mmd
venn-beta
set A[style:#x;y] set B:2
```

### Title

The consumed first title separator becomes one ASCII space for readability;
every later value character, including leading/trailing whitespace and
statement-looking words, stays as written. LF and the broader accepted title
separators may normalize, but trivia, joined regions and kept parts protect
their written boundaries.

[fixture: venn/title/corpus-db-frontmatter-title-overridden] [fixture:
venn/title/corpus-db-title-on-header] [fixture:
venn/title/corpus-db-title-only-whitespace] [fixture:
venn/title/corpus-db-title-padding] [fixture:
venn/title/corpus-db-title-value-next-line] [fixture:
venn/title/corpus-lex-gap-title-comment] [fixture: venn/title/repeated-title]
[fixture: venn/title/title-directive] [fixture:
venn/title/title-inline-percent-control] [fixture:
venn/title/title-inline-percent] [fixture: venn/title/title-next-line-control]
[fixture: venn/title/title-next-line] [fixture:
venn/title/title-statement-words] [fixture:
venn/title/title-tab-separator-control] [fixture:
venn/title/title-tab-separator] [fixture: venn/title/title-trim-unsafe-control]
[fixture: venn/title/title-trim-unsafe] [fixture:
venn/title/title-whitespace-only-control] [fixture:
venn/title/title-whitespace-only]

Input (escaped):

```json
"venn-beta\ntitle\n  T"
```

Output
([title/title-next-line-output.mmd](../tests/fixtures/venn/title/title-next-line-output.mmd)):

```mmd
venn-beta
title   T
```

### Directives

Standalone directives align with nearby statements to show their association;
inline directives retain their containing line, order, contents and touching
relations, with ordinary spaced gap sides reduced to one space. A leading
directive retains the positive versus zero logical indentation of implicit
versus explicit text, choosing exterior indentation before the first directive
while keeping its internal gap relations. Embedded, multiline, semicolon-stopped
and EOF directives keep their boundaries; no embedded data is reformatted.

An internal gap, including between two leading directives, already supplies the
positive marker. Only where no internal gap supplies it does an implicit line
gain a configured step before the first directive, on ordinary and kept lines
alike, because removal joins all those gaps.

On a header or statement line, a directive stays with the preceding text when
the following statement moves to a new line; its written gap before the
directive becomes one space or stays touching. If a directive touches the
following statement, the line remains together to preserve that relation. A
semicolon-kept line also keeps its header attachment.

[fixture: venn/directives/corpus-db-indent-after-directive] [fixture:
venn/directives/corpus-db-set-label-unclosed-directive-gap] [fixture:
venn/directives/corpus-lex-after-set-directive-unclosed] [fixture:
venn/directives/corpus-lex-comment-after-directive-keeps-id] [fixture:
venn/directives/corpus-lex-directive-style-value-color] [fixture:
venn/directives/corpus-lex-identifier-directive-only] [fixture:
venn/directives/directive-body-tail] [fixture:
venn/directives/directive-bounded-argument] [fixture:
venn/directives/directive-header-inline-control] [fixture:
venn/directives/directive-header-inline] [fixture:
venn/directives/directive-in-value-control] [fixture:
venn/directives/directive-in-value] [fixture:
venn/directives/directive-leading-explicit-control] [fixture:
venn/directives/directive-leading-explicit] [fixture:
venn/directives/directive-leading-indent-chosen-control] [fixture:
venn/directives/directive-leading-indent-chosen] [fixture:
venn/directives/directive-leading-marker-control] [fixture:
venn/directives/directive-leading-marker] [fixture:
venn/directives/directive-multiline-control] [fixture:
venn/directives/directive-multiline] [fixture:
venn/directives/directive-unclosed-eof] [fixture:
venn/directives/directive-unclosed-object] [fixture:
venn/directives/directives-inline-gaps-control] [fixture:
venn/directives/directives-inline-gaps] [fixture:
venn/directives/directives-standalone-control] [fixture:
venn/directives/directives-standalone] [fixture:
venn/directives/directives-touch-control] [fixture:
venn/directives/directives-touch] [fixture:
venn/directives/leading-inline-directive-comment] [fixture:
venn/directives/leading-intermediate-marker] [fixture:
venn/directives/kept-leading-intermediate-marker] [fixture:
venn/directives/directive-header-inline] [fixture:
venn/directives/header-directive-spaced] [fixture:
venn/directives/header-directive-touching-statement] [fixture:
venn/directives/header-directives-touching] [fixture:
venn/directives/header-directives-spaced] [fixture:
venn/directives/header-directives-last-touching] [fixture:
venn/directives/header-directive-explicit-text] [fixture:
venn/directives/header-directive-implicit-line] [fixture:
venn/directives/header-directive-title] [fixture:
venn/directives/header-directive-touching-title] [fixture:
venn/directives/header-directive-comment] [fixture:
venn/directives/header-directive-touching-comment] [fixture:
venn/directives/header-directive-kept-line] [fixture:
venn/directives/header-directive-before-kept-line] [fixture:
venn/directives/declaration-trailing-directive] [fixture:
venn/directives/style-trailing-directive] [fixture:
venn/directives/style-directive-touching-next] [fixture:
venn/directives/declaration-directive-touching-next]

Input (escaped):

```json
"venn-beta\nset A  %%{init: {}}%% [L] : 2"
```

Output
([directives/directives-inline-gaps-output.mmd](../tests/fixtures/venn/directives/directives-inline-gaps-output.mmd)):

```mmd
venn-beta
set A %%{init: {}}%% [L]:2
```

Input (escaped):

```json
"venn-beta%%{init: {}}%% set A"
```

Output
([directives/directive-header-inline-output.mmd](../tests/fixtures/venn/directives/directive-header-inline-output.mmd)):

```mmd
venn-beta%%{init: {}}%%
set A
```

### Trailing whitespace

Exterior ASCII spaces and tabs after completed headers and non-title statements
disappear for clean line endings, including after kept parts and safe suffixes.
Spaces inside names, labels, colors, style strings, title values, comments and
directives remain authored text.

[fixture: venn/trailing-whitespace/continuation-spaces] [fixture:
venn/trailing-whitespace/corpus-db-after-set-label-size-space] [fixture:
venn/trailing-whitespace/corpus-db-title-padding] [fixture:
venn/trailing-whitespace/corpus-lex-tab-line-end] [fixture:
venn/trailing-whitespace/kept-prefix-exterior] [fixture:
venn/trailing-whitespace/trailing-comment-control] [fixture:
venn/trailing-whitespace/trailing-comment] [fixture:
venn/trailing-whitespace/trailing-exterior-control] [fixture:
venn/trailing-whitespace/trailing-exterior] [fixture:
venn/trailing-whitespace/trailing-in-values-control] [fixture:
venn/trailing-whitespace/trailing-in-values]

Input `"venn-beta \nset A \n"` prints `"venn-beta\nset A\n"`; `title T  ` keeps
its value spaces.

### Multiline values

Value lines, blank lines and continuation columns stay as written because
joining or reindenting can change the Db. Statements and values do not wrap for
`printWidth`, since ordinary token boundaries cannot gain newlines; the title
separator is the narrow exception above.

[fixture: venn/multiline-values/comment-in-value-control] [fixture:
venn/multiline-values/comment-in-value] [fixture:
venn/multiline-values/corpus-lex-identifier-blank-line] [fixture:
venn/multiline-values/corpus-lex-identifier-comment-line] [fixture:
venn/multiline-values/corpus-lex-label-blank-line] [fixture:
venn/multiline-values/corpus-lex-style-blank-line] [fixture:
venn/multiline-values/corpus-lex-style-value-rgb-multiline] [fixture:
venn/multiline-values/long-no-wrap-control] [fixture:
venn/multiline-values/long-no-wrap] [fixture:
venn/multiline-values/multiline-directive] [fixture:
venn/multiline-values/multiline-empty-lines] [fixture:
venn/multiline-values/multiline-join-unsafe-control] [fixture:
venn/multiline-values/multiline-join-unsafe] [fixture:
venn/multiline-values/multiline-reindent-unsafe-control] [fixture:
venn/multiline-values/multiline-reindent-unsafe] [fixture:
venn/multiline-values/multiline-values-control] [fixture:
venn/multiline-values/multiline-values] [fixture:
venn/multiline-values/wrap-list-rejected]

Input (escaped):

```json
"venn-beta\nset \"A\n B\"[L\n  M]\ntext A \"x\n y\"[N\n O]\nstyle A fill:\"red\n blue\",stroke:rgb(1,\n  2,3)"
```

Output
([multiline-values/multiline-values-output.mmd](../tests/fixtures/venn/multiline-values/multiline-values-output.mmd)):

```mmd
venn-beta
set "A
 B"[L
  M]
text A "x
 y"[N
 O]
style A fill:"red
 blue", stroke:rgb(1,
  2,3)
```

### Keyword case and order

Written keyword case and every declaration, target and property remain in source
order, including repeated or Db-ineffective entries, to retain authored choices.
Names, keys and colors retain case too; the textual semicolon markers have exact
case even though statement keywords are case-insensitive.

[fixture: venn/keyword-case-and-order/all-written-repeats] [fixture:
venn/keyword-case-and-order/corpus-db-style-three-definitions-same-target]
[fixture: venn/keyword-case-and-order/corpus-db-text-three-definitions]
[fixture: venn/keyword-case-and-order/corpus-db-three-definitions] [fixture:
venn/keyword-case-and-order/corpus-db-union-three-definitions] [fixture:
venn/keyword-case-and-order/corpus-lex-keyword-set-upper] [fixture:
venn/keyword-case-and-order/declarations-order-keep-control] [fixture:
venn/keyword-case-and-order/declarations-order-keep] [fixture:
venn/keyword-case-and-order/keyword-case-kept-control] [fixture:
venn/keyword-case-and-order/keyword-case-kept] [fixture:
venn/keyword-case-and-order/keyword-lower-equal-control] [fixture:
venn/keyword-case-and-order/keyword-lower-equal]

Input (escaped):

```json
"venn-beta\nSET A\n  TeXt item\nSTYLE A fill:RED\nTitle T"
```

Output
([keyword-case-and-order/keyword-case-kept-output.mmd](../tests/fixtures/venn/keyword-case-and-order/keyword-case-kept-output.mmd)):

```mmd
venn-beta
SET A
  TeXt item
STYLE A fill:RED
Title T
```

### Line terminators

CRLF and lone CR follow the shared `endOfLine`, including inside values, because
mermaid.js reads them as LF. U+2028/U+2029 stay as characters in values,
comments and directives; a Venn diagram comment runs through them to LF or EOF.
Only the consumed first title separator can become an ASCII space; Unicode
separators are rejected as ordinary body or bare-style gaps.

[fixture: venn/line-terminators/crlf-values-control] [fixture:
venn/line-terminators/ls-comment-split-unsafe-control] [fixture:
venn/line-terminators/ls-title-separator-control] [fixture:
venn/line-terminators/ls-value-to-lf-differs-control] [fixture:
venn/line-terminators/ps-value-to-lf-differs-control]

[test: a venn diagram with other line endings] [test: venn: crlf-values] [test:
venn: cr-values] [test: venn: ls-values] [test: venn: ps-values] [test: venn:
ls-comment-kept] [test: venn: ps-comment-kept] [test: venn: ls-header-comment]
[test: venn: ps-header-comment] [test: venn: ps-comment-eof] [test: venn:
ls-kept-comment-last-character] [test: venn: ps-kept-comment-last-character]
[test: venn: ls-kept-comment-whitespace-line] [test: venn:
ps-kept-comment-whitespace-line] [test: venn: ls-comment-cut-region] [test:
venn: ps-comment-cut-region] [test: venn: ls-kept-directive] [test: venn:
ps-kept-directive] [test: venn: ls-kept-overlapping-value] [test: venn:
ps-kept-overlapping-value]

Escaped input and output:
`"venn-beta\nset A[L\u2028M]" -> "venn-beta\nset A[L\u2028M]\n"`.

### Whitespace characters

Ordinary gaps normalize only accepted ASCII spaces/tabs; non-ASCII whitespace
inside values stays, while broader leading detection whitespace and title
separators use their dedicated rules. U+0085 is not whitespace, and NBSP, BOM,
U+3000, VT and FF do not become accepted body gaps. File-leading BOM and
BOM/frontmatter limitations follow shared host handling.

[fixture: venn/whitespace-characters/ff-title-separator-control] [fixture:
venn/whitespace-characters/nbsp-leading-header-control] [fixture:
venn/whitespace-characters/nbsp-title-separator-control] [fixture:
venn/whitespace-characters/tab-gaps-control] [fixture:
venn/whitespace-characters/tab-gaps]

[test: venn: nbsp-leading-header] [test: venn: nbsp-value-kept] [test: venn:
vt-value-kept] [test: venn: ff-title-separator] [test: venn:
bom-title-separator] [test: venn: bom-leading-header] [test: venn:
bom-frontmatter] [test: venn: unicode-role-whitespace]

Escaped input and output:
`"venn-beta\ntitle\u00a0 T" -> "venn-beta\ntitle  T\n"`.

### Frontmatter YAML

Frontmatter uses the shared guarded YAML formatter for readable configuration.
Delimiters, closing-line padding, comments/directives before the header and
title overrides retain their roles; malformed, indented, HTML-sensitive and
delimiter-hazard YAML stays as written, including ineffective accessibility
metadata.

[fixture: venn/frontmatter-yaml/specified-frontmatter-invalid] [fixture:
venn/frontmatter-yaml/closing-delimiter-padding] [fixture:
venn/frontmatter-yaml/corpus-db-frontmatter-accessibility] [fixture:
venn/frontmatter-yaml/corpus-db-frontmatter-title] [fixture:
venn/frontmatter-yaml/corpus-frontmatter-html-title] [fixture:
venn/frontmatter-yaml/corpus-frontmatter-invalid] [fixture:
venn/frontmatter-yaml/corpus-header-before-frontmatter-comment] [fixture:
venn/frontmatter-yaml/frontmatter-comments-directives] [fixture:
venn/frontmatter-yaml/frontmatter-delimiter-hazard] [fixture:
venn/frontmatter-yaml/frontmatter-html-kept] [fixture:
venn/frontmatter-yaml/frontmatter-html-requote-unsafe-control] [fixture:
venn/frontmatter-yaml/frontmatter-indented-kept-control] [fixture:
venn/frontmatter-yaml/frontmatter-indented-kept] [fixture:
venn/frontmatter-yaml/frontmatter-invalid-kept] [fixture:
venn/frontmatter-yaml/frontmatter-title-override] [fixture:
venn/frontmatter-yaml/frontmatter-yaml-control] [fixture:
venn/frontmatter-yaml/frontmatter-yaml]

Input (escaped):

```json
"---\ntitle:   T\nconfig: {venn: {padding:  20}}\n---\nvenn-beta\nset A"
```

Output
([frontmatter-yaml/frontmatter-yaml-output.mmd](../tests/fixtures/venn/frontmatter-yaml/frontmatter-yaml-output.mmd)):

```mmd
---
title: T
config: { venn: { padding: 20 } }
---
venn-beta
set A
```

### Final newline

Ordinary accepted input ends with one configured newline for the shared file
convention, including a header-only body. Protected comment gaps and unclosed
directives reaching EOF retain their written endings; terminal value spaces
remain. Markdown supplies fence/container indentation around these same Venn
rules.

[fixture: venn/final-newline/bounded-argument-eof] [fixture:
venn/final-newline/comment-gap-eof] [fixture:
venn/final-newline/corpus-db-style-string-eof] [fixture:
venn/final-newline/corpus-db-title-eof] [fixture:
venn/final-newline/corpus-header-only] [fixture:
venn/final-newline/corpus-lex-after-set-directive-unclosed] [fixture:
venn/final-newline/final-comment-control] [fixture:
venn/final-newline/final-comment] [fixture:
venn/final-newline/final-newline-control] [fixture:
venn/final-newline/final-newline] [fixture:
venn/final-newline/final-open-directive] [fixture:
venn/final-newline/final-title-spaces-control] [fixture:
venn/final-newline/final-title-spaces] [fixture:
venn/final-newline/ignored-fragment-comment] [fixture:
venn/final-newline/multiple-terminal-lf]

Input (escaped):

```json
"venn-beta\nset A"
```

Output
([final-newline/final-newline-output.mmd](../tests/fixtures/venn/final-newline/final-newline-output.mmd)):

```mmd
venn-beta
set A
```

## Rejected inputs

The shared failure path reports a syntax error and leaves rejected source
unformatted, and declines rejected Markdown fences. It repairs neither names,
lists, labels, sizes, quotes, newlines or headers, nor ordinary semicolons or
unsupported syntax. Specified token-boundary divergences remain failures.

For example, `venn-beta\nset A;` reports a syntax error and leaves the
standalone source unformatted; a rejected Markdown fence retains its contents
under the host's ordinary code-block handling.

[corpus fixture: venn/lex-after-set-semicolon] [corpus fixture:
venn/header-semicolon-spaced] [corpus fixture: venn/gram-bare-word] [corpus
fixture: venn/gram-unclosed-id] [corpus fixture: venn/gram-set-label-crlf-gap]
