# Pie formatting rules

Japanese version: [pie.ja.md](./pie.ja.md)

The 21 adopted items below use the written AST, with no runtime Mermaid calls or
output reparsing. Invisible-character examples are escaped test cases.

## Rules

### Header

Reuse [XY chart header/body layout](./xychart.md#header-and-orientation): an
exact lower-case `pie` starts at column one and a written `showData` follows one
space, for a consistent visible heading. An ordinary inline first statement
moves below it. Hidden predecessors of the flag retain their position and
consumed breaks; moving them would end the flag opportunity.

Fixed cases: [fixture: pie/header/header-space] [fixture:
pie/header/header-absent] [fixture: pie/header/flag-hidden-yaml] [fixture:
pie/header/flag-hidden-directive] [fixture: pie/header/flag-in-title] [fixture:
pie/header/header-global-flag] [fixture: pie/header/flag-hidden-remove-kept]
[fixture: pie/header/header-hidden-after-flag] [fixture:
pie/header/header-hidden-without-flag] [fixture:
pie/header/header-two-hidden-forms] [fixture:
pie/header/header-spare-visible-lf].

Input (escaped): `" \tpie   showData \"Revenue\":8"`.

Output
([header/header-space-output.mmd](../tests/fixtures/pie/header/header-space-output.mmd)):

```mmd
pie showData
  "Revenue" : 8
```

### Indentation

Reuse [XY chart indentation](./xychart.md#indentation): ordinary statements and
standalone comments/directives stand one configured step below the header, for
readable structure. A pie section is a slice and adds no nested level.
`tabWidth: 0` gives zero body spaces; `useTabs` gives one tab, including with
width zero, because pie columns have no grammatical meaning. Value continuation
columns and hidden closers retain their source columns; YAML alone uses the
shared positive minimum.

Fixed cases: [fixture: pie/indentation/indent-default] [fixture:
pie/indentation/indent-four] [fixture: pie/indentation/indent-zero] [fixture:
pie/indentation/indent-tabs] [fixture: pie/indentation/indent-zero-tabs]
[fixture: pie/indentation/indent-two] [fixture:
pie/indentation/indent-four-trivia].

Input (escaped):
`"pie\n    \"Zero\":0\n    accTitle: direction LR\n    accDescr {direction TB}"`
({"tabWidth":0}).

Output
([indentation/indent-zero-output.mmd](../tests/fixtures/pie/indentation/indent-zero-output.mmd)):

```mmd
pie
"Zero" : 0
accTitle: direction LR
accDescr {direction TB}
```

### Statements one per line

Reuse [one statement per line](./xychart.md#statements-one-per-line) for
readability, subject to pie EOL and protected source groups. Keep sections and
common assignments interleaved in written order, including empty description
blocks. Pie has no separator semicolon: semicolons in labels and common values
stay text. Invalid adjacent statements are handled by the corpus failure path
rather than repaired.

Fixed cases: [fixture: pie/statements-one-per-line/body-lines] [fixture:
pie/statements-one-per-line/semicolon-values] [fixture:
pie/statements-one-per-line/statement-interleaving].

Input (escaped): `"pie \"Line\":2\naccTitle: Data; title Later\n\"Next\":3"`.

Output
([statements-one-per-line/body-lines-output.mmd](../tests/fixtures/pie/statements-one-per-line/body-lines-output.mmd)):

```mmd
pie
  "Line" : 2
  accTitle: Data; title Later
  "Next" : 3
```

### Sections

Print a section as `"label" : value`, with one space on both sides of the colon
and no width alignment. This pie-specific choice follows the spelling in
[Mermaid pie examples](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md#L64-L69).
Both quoted label forms and empty labels follow this rule. A gap containing a
directive keeps its touching/separated sides; a hidden form also keeps its
physical boundary, since these items supply no separator.

Fixed cases: [fixture: pie/sections/section-colon] [fixture:
pie/sections/section-colon-tight-authored] [fixture:
pie/sections/section-gap-directive] [fixture: pie/sections/section-gap-sides]
[fixture: pie/sections/section-hidden-both-sides].

Input (escaped): `"pie\n\"Wide\"\t:   12\n'Narrow':3\n\"\":1"`.

Output
([sections/section-colon-output.mmd](../tests/fixtures/pie/sections/section-colon-output.mmd)):

```mmd
pie
  "Wide" : 12
  'Narrow' : 3
  "" : 1
```

### Labels

Reuse [XY chart authored strings](./xychart.md#quotes): keep complete quoted
source spans, because quotes and source text belong to the author. Preserve
single/double/opposite quotes, escapes without decoding, empty and
whitespace-only labels, entities/HTML and hidden-looking percent text.
`singleQuote` does not rewrite labels. Keep converted-label collisions as
separate occurrences; the resolved Map is not source.

Fixed cases: [fixture: pie/labels/label-quotes] [fixture:
pie/labels/label-escapes] [fixture: pie/labels/label-inner-trim-kept] [fixture:
pie/labels/label-quote-authored] [fixture: pie/labels/label-hidden-looking]
[fixture: pie/labels/div-c4-label] [fixture: pie/labels/div-c4-eof] [test:
pie/labels/div-bare-unicode] [test: pie/labels/div-retained-bare-unicode]
[fixture: pie/labels/div-html-invalid] [fixture:
pie/labels/label-whitespace-opposite] [fixture: pie/labels/label-html-entities]
[fixture: pie/labels/label-converted-collisions] [fixture:
pie/labels/label-quote-option].

Input (escaped): `"pie\n' single  label ':3\n\" double  label \":4\n'':2"`.

Output
([labels/label-quotes-output.mmd](../tests/fixtures/pie/labels/label-quotes-output.mmd)):

```mmd
pie
  ' single  label ' : 3
  " double  label " : 4
  '' : 2
```

### Numbers

Reuse [XY chart authored numbers](./xychart.md#numbers): print the
NumericLiteral source rather than its converted double. Keep negative zero,
fractional leading zeros, trailing zeros, long precision, zero and small slices.
Overflow and signed underflow follow the accepted corpus readings; invalid
spellings and negative duplicates remain parser failures.

Fixed cases: [fixture: pie/numbers/number-spellings] [fixture:
pie/numbers/number-normalize-authored] [fixture: pie/numbers/number-zero-small].

[corpus fixture: pie/number-overflow] [corpus fixture:
pie/review-number-negative-underflow-final] [corpus fixture:
pie/db-duplicate-negative]

Input (escaped):
`"pie showData\n\"negative zero\":-0\n\"fraction\":0007.2300\n\"precision\":0.12345678901234567890123456789"`.

Output
([numbers/number-spellings-output.mmd](../tests/fixtures/pie/numbers/number-spellings-output.mmd)):

```mmd
pie showData
  "negative zero" : -0
  "fraction" : 0007.2300
  "precision" : 0.12345678901234567890123456789
```

### Title

Reuse the compact common-value reason of
[C4 accessibility lines](./c4.md#accessibility-lines): equivalent exterior
whitespace gets one form. Print `title`, one space, and a trimmed nonempty
value; a null/empty/whitespace-only value prints bare `title`. Preserve internal
words, tabs, quotes and backslashes, and all repeated assignments, including
frontmatter fallback. Pie never joins the next physical line into a title: even
across blank/comment/directive gaps, a following section is a separate
statement. Protected trivia and semicolon groups take precedence.

Fixed cases: [fixture: pie/title/title-trim] [fixture: pie/title/title-empty]
[fixture: pie/title/title-next-section] [fixture: pie/title/title-next-trivia]
[fixture: pie/title/title-inner-text].

Input (escaped): `"pie\ntitle\t   Sales  report  \n\"Sales\":8"`.

Output
([title/title-trim-output.mmd](../tests/fixtures/pie/title/title-trim-output.mmd)):

```mmd
pie
  title Sales  report
  "Sales" : 8
```

### Accessibility lines

Reuse [C4 accessibility lines](./c4.md#accessibility-lines), with the same
compact exterior-whitespace reason: `accTitle: value` and `accDescr: value`,
with the colon touching the keyword and one space before a trimmed nonempty
value. Empty values end at the colon. Interior tabs, quotes and line-form braces
remain text; repeated assignments and percent comment attachment remain. Pie
never joins next-line values, including after blank/comment/directive gaps,
because its composite line forms stop at physical EOL. Hidden forms and
protected textual groups retain their gaps.

Fixed cases: [fixture: pie/accessibility-lines/a11y-lines] [fixture:
pie/accessibility-lines/a11y-empty] [fixture:
pie/accessibility-lines/a11y-next-section] [fixture:
pie/accessibility-lines/a11y-next-join-kept] [fixture:
pie/accessibility-lines/a11y-colon-braces] [fixture:
pie/accessibility-lines/a11y-percent] [fixture:
pie/accessibility-lines/accessibility-next-trivia] [fixture:
pie/accessibility-lines/accessibility-directive-edges] [fixture:
pie/accessibility-lines/accessibility-inner-tab] [fixture:
pie/accessibility-lines/accessibility-only-global-trivia].

Input (escaped):
`"pie\naccTitle \t:   Title  words \t\naccDescr\t:  Description  text  \n\"Line\":1"`.

Output
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/pie/accessibility-lines/a11y-lines-output.mmd)):

```mmd
pie
  accTitle: Title  words
  accDescr: Description  text
  "Line" : 1
```

### Description blocks

Reuse [flowchart multiline values](./flowchart.md#multi-line-values) and its
reason: authored value columns remain consistent everywhere. Touching
keyword/opener and interior sides stay touching; present runs collapse to one
space. Plain whitespace before the opener can join, including across physical or
Unicode line boundaries; a real comment/directive keeps its break. Empty
whitespace-only interiors print `{}` because no text needs surrounding
whitespace. Keep comment-only blocks with comments one level inside and a
separate closer at statement level. Nonempty later-line text keeps its columns
and blank lines, including internal comment lines; a separate `}` aligns with
the statement. Trivia-bearing interiors keep their trivia. The first closing
brace still closes the block, even inside quote/backslash/hidden-looking text.

Fixed cases: [fixture: pie/description-blocks/block-runs] [fixture:
pie/description-blocks/block-empty] [fixture:
pie/description-blocks/block-columns] [fixture:
pie/description-blocks/block-opener-newline] [fixture:
pie/description-blocks/block-comment-only] [fixture:
pie/description-blocks/block-directive-only] [fixture:
pie/description-blocks/block-inner-collapse-kept] [fixture:
pie/description-blocks/block-opener-trivia] [fixture:
pie/description-blocks/block-asymmetric] [fixture:
pie/description-blocks/block-inline-leading-lines] [fixture:
pie/description-blocks/block-first-brace] [fixture:
pie/description-blocks/block-keyword-tab] [fixture:
pie/description-blocks/block-mixed-trivia] [fixture:
pie/description-blocks/block-trailing-comment] [fixture:
pie/description-blocks/block-opener-directive] [fixture:
pie/description-blocks/block-quotes-backslashes].

Input (escaped):
`"pie\naccDescr {\n  first\n    second\n        }\n\"Data\":2"`.

Output
([description-blocks/block-columns-output.mmd](../tests/fixtures/pie/description-blocks/block-columns-output.mmd)):

```mmd
pie
  accDescr {
  first
    second
  }
  "Data" : 2
```

### Hidden yaml

Keep each yaml-block PieIgnoredText in its named header/body/section/textAfter
position, as a complete source span rather than its trivia-filtered value.
Preserving hidden forms in place is shared by diagram types whose specified
lexical rules have these forms; pie is the first printer to apply it. In pie,
the hidden rule consumes an immediate LF outside the node, and closing-boundary
whitespace can leave a required visible EOL. Keep consumed and spare LFs,
closing padding including at EOF, opaque malformed/empty/nested-looking
contents, internal trivia and multiple forms. Do not insert a break before a
form. Ordinary opener padding can compact and a body opener can be indented; its
interior and unindented closer keep their columns. Already-started
string/title/block text retains priority.

Keep closing padding and spare LFs for standalone forms at the start or middle
of the body, indented forms, forms after the header or showData, and forms at
EOF. The same boundary rule applies to hidden YAML and hidden directives.
Closing padding also stays between forms or before a same-line statement.

Fixed cases: [fixture: pie/hidden-yaml/yaml-section-gaps] [fixture:
pie/hidden-yaml/yaml-body] [fixture: pie/hidden-yaml/yaml-move-gap-kept]
[fixture: pie/hidden-yaml/yaml-after-space-boundary] [fixture:
pie/hidden-yaml/yaml-extra-eol] [fixture: pie/hidden-yaml/yaml-eof] [fixture:
pie/hidden-yaml/yaml-two-in-gap] [fixture:
pie/hidden-yaml/yaml-closer-indent-kept] [fixture:
pie/hidden-yaml/yaml-in-line-value] [fixture:
pie/hidden-yaml/yaml-global-trivia] [fixture: pie/hidden-yaml/yaml-empty-body]
[fixture: pie/hidden-yaml/yaml-padding] [fixture:
pie/hidden-yaml/yaml-qualifying-later-closer] [fixture:
pie/hidden-yaml/yaml-after-block] [fixture:
pie/hidden-yaml/yaml-selected-content] [fixture:
pie/hidden-yaml/yaml-followed-trivia].

[fixture: pie/hidden-yaml/body-closing-padding] [fixture:
pie/hidden-yaml/first-body-closing-padding] [fixture:
pie/hidden-yaml/indented-body-spare-lf] [fixture:
pie/hidden-yaml/header-closing-padding] [fixture:
pie/hidden-yaml/flag-closing-padding] [fixture:
pie/hidden-yaml/header-eof-closing-padding] [fixture:
pie/hidden-yaml/body-eof-closing-padding] [fixture:
pie/hidden-yaml/flag-eof-closing-padding] [fixture:
pie/hidden-yaml/inline-section-padding] [fixture:
pie/hidden-yaml/inline-two-forms-padding].

[fixture: pie/hidden-yaml/closing-line-comment-padding].

Input (escaped): `"pie\n\"Yaml\"---\nnot: [yaml\n---\n:---\nignored\n---\n7"`.

Output
([hidden-yaml/yaml-section-gaps-output.mmd](../tests/fixtures/pie/hidden-yaml/yaml-section-gaps-output.mmd)):

```mmd
pie
  "Yaml"---
not: [yaml
---
:---
ignored
---
7
```

### Hidden directives

Apply the same shared source/boundary reason as [Hidden yaml](#hidden-yaml) to
directive-kind PieIgnoredText. It is distinct from a Root directive. Keep
empty/punctuation/multiline forms, source gaps before colon/number/flag, global
cuts inside the range and textAfter of all five statement forms. A digit-glued
nonqualifying closer can be a real comment, or a later closer can qualify;
preserve that classification instead of adding a boundary. Strings and blocks
retain earlier lexical priority. Closing spaces and spare LF remain significant
before another statement; a closed form at EOF can gain the shared final LF.

Fixed cases: [fixture: pie/hidden-directives/hidden-number-gap] [fixture:
pie/hidden-directives/hidden-before-colon] [fixture:
pie/hidden-directives/hidden-after-space] [fixture:
pie/hidden-directives/hidden-after-extra-lf] [fixture:
pie/hidden-directives/hidden-after-title] [fixture:
pie/hidden-directives/hidden-after-block] [fixture:
pie/hidden-directives/hidden-eof] [fixture:
pie/hidden-directives/hidden-fallback] [fixture:
pie/hidden-directives/hidden-accdescr-line] [fixture:
pie/hidden-directives/hidden-acctitle-line] [fixture:
pie/hidden-directives/hidden-title-eof] [fixture:
pie/hidden-directives/hidden-description-eof] [fixture:
pie/hidden-directives/hidden-block-eof] [fixture:
pie/hidden-directives/hidden-multiline] [fixture:
pie/hidden-directives/hidden-global-trivia] [fixture:
pie/hidden-directives/hidden-body-standalone] [fixture:
pie/hidden-directives/hidden-later-closer] [fixture:
pie/hidden-directives/hidden-comment-cuts] [fixture:
pie/hidden-directives/hidden-split-opener] [fixture:
pie/hidden-directives/hidden-split-closer] [fixture:
pie/hidden-directives/hidden-boundary-comment] [fixture:
pie/hidden-directives/hidden-followed-trivia].

[fixture: pie/hidden-directives/body-closing-padding] [fixture:
pie/hidden-directives/first-body-closing-padding] [fixture:
pie/hidden-directives/indented-body-spare-lf] [fixture:
pie/hidden-directives/header-closing-padding] [fixture:
pie/hidden-directives/flag-closing-padding] [fixture:
pie/hidden-directives/header-eof-closing-padding] [fixture:
pie/hidden-directives/body-eof-closing-padding] [fixture:
pie/hidden-directives/flag-eof-closing-padding] [fixture:
pie/hidden-directives/inline-section-padding] [fixture:
pie/hidden-directives/inline-two-forms-padding].

[fixture: pie/hidden-directives/closing-line-comment-padding].

Input (escaped): `"pie\n\"Hidden\":%%{}%%\n7"`.

Output
([hidden-directives/hidden-number-gap-output.mmd](../tests/fixtures/pie/hidden-directives/hidden-number-gap-output.mmd)):

```mmd
pie
  "Hidden" :%%{}%%
7
```

### Comments

Reuse [shared comment placement](./flowchart.md#comments) to keep author
attachment and text: inline comments retain touching sides or one separating
space; standalone comments align with body statements, or column one before the
header. Keep bare/triple-percent marks and trailing comment spaces. Pie native
comments end at LF, retaining LS/PS inside them; strings and block interiors
keep percent content, while line common values stop at it. Common removed
regions keep their complete swallowed source and joined continuation columns. A
protected preheader prefix overrides ordinary alignment.

Fixed cases: [fixture: pie/comments/comments-align] [fixture:
pie/comments/comment-bare] [fixture: pie/comments/comment-value-text] [test:
pie/comments/comment-region-join] [fixture:
pie/comments/comment-section-move-attachment] [fixture:
pie/comments/comments-block-attachments] [fixture:
pie/comments/comments-final-triple].

Input (escaped):
`"pie\n\"percent %% label\":3\naccDescr {a%% text}\naccTitle: a%% real comment"`.

Output
([comments/comment-value-text-output.mmd](../tests/fixtures/pie/comments/comment-value-text-output.mmd)):

```mmd
pie
  "percent %% label" : 3
  accDescr {a%% text}
  accTitle: a%% real comment
```

### Directives and semicolons

Reuse [global directive opacity](./flowchart.md#directives) and
[C4 textual semicolon protection](./c4.md#line-rule-and-semicolons), because
common removal supplies no separator and semicolon selection reads source
segments. Keep directives in place with touching versus separated sides,
multiline contents and EOF-reaching endings. Protect from the first
non-whitespace character through the last semicolon, extending through complete
crossing values/comments/directives; do not split a protected header/body group.
Keep every semicolon and both style/classDef passes, case/colon-hash whitespace
distinctions, Unicode segment bounds, directive-rejoined triggers and comment
semicolons. Format only safe exterior/suffix gaps. Atomic keyword/number cuts
remain specified failures.

Fixed cases: [fixture: pie/directives-and-semicolons/global-align] [fixture:
pie/directives-and-semicolons/global-touch] [fixture:
pie/directives-and-semicolons/global-value] [fixture:
pie/directives-and-semicolons/global-colon-brace] [fixture:
pie/directives-and-semicolons/global-multiline] [fixture:
pie/directives-and-semicolons/selected-labels] [fixture:
pie/directives-and-semicolons/selected-delete-kept] [fixture:
pie/directives-and-semicolons/selected-common] [fixture:
pie/directives-and-semicolons/selected-two-passes] [fixture:
pie/directives-and-semicolons/selected-nontriggers] [fixture:
pie/directives-and-semicolons/selected-header-group] [fixture:
pie/directives-and-semicolons/selected-comment-tail] [test:
pie/directives-and-semicolons/selected-ls-segments] [fixture:
pie/directives-and-semicolons/global-joined-trigger] [fixture:
pie/directives-and-semicolons/global-header-first-statement] [fixture:
pie/directives-and-semicolons/global-gap-side-presence] [fixture:
pie/directives-and-semicolons/global-value-boundaries] [fixture:
pie/directives-and-semicolons/selected-one-three-padding] [fixture:
pie/directives-and-semicolons/selected-comment-semicolon] [fixture:
pie/directives-and-semicolons/semicolon-header-gap].

Input (escaped): `"pie title style:#a;b"`.

Output
([directives-and-semicolons/selected-header-group-output.mmd](../tests/fixtures/pie/directives-and-semicolons/selected-header-group-output.mmd)):

```mmd
pie title style:#a;b
```

### Blank lines

Reuse [shared blank grouping](./flowchart.md#blank-lines): collapse ordinary
ASCII blank runs to one and remove ordinary document/body edge blanks,
preserving a visible grouping choice. Values, directives, ignored interiors and
common-region joins keep authored blanks. Hidden consumed/spare EOL and complete
retained preheader prefixes are exempt: deleting them can change acceptance or
promote YAML. Unicode-only invalid body lines remain corpus failures.

Fixed cases: [fixture: pie/blank-lines/blank-runs] [fixture:
pie/blank-lines/blank-trivia] [fixture: pie/blank-lines/blank-literal] [fixture:
pie/blank-lines/blank-hidden-body] [fixture:
pie/blank-lines/blank-directive-content].

Input (escaped): `"\npie\n\n\n\"First\":2\n \t\n\n\"Second\":3\n\n"`.

Output
([blank-lines/blank-runs-output.mmd](../tests/fixtures/pie/blank-lines/blank-runs-output.mmd)):

```mmd
pie
  "First" : 2

  "Second" : 3
```

### Trailing whitespace

Reuse [C4 exterior cleanup](./c4.md#trailing-whitespace): remove harmless ASCII
padding after headers, numbers and completed blocks. Common line edges follow
Title and Accessibility lines. Preserve label lines, comments, directive/ignored
interiors, common-region continuations and protected semicolon text. Hidden
closing-boundary spaces are outside the node range but can preserve required
EOL, so they remain, including at EOF.

Fixed cases: [fixture: pie/trailing-whitespace/trailing-exterior] [fixture:
pie/trailing-whitespace/trailing-values] [fixture:
pie/trailing-whitespace/trailing-label-trim-kept] [fixture:
pie/trailing-whitespace/trailing-hidden-eof] [fixture:
pie/trailing-whitespace/trailing-protected-prefix].

A semicolon alone does not protect a line value's trailing whitespace; the
shared semicolon-prefix rule decides which source to retain. [fixture:
pie/trailing-whitespace/line-semicolons] [fixture:
pie/trailing-whitespace/line-selected-semicolons] [fixture:
pie/trailing-whitespace/line-without-semicolons] [fixture:
pie/trailing-whitespace/header-line-semicolon].

Input (escaped): `"pie showData \t\n\"Data\" : 2 \t\naccDescr {a} \t"`.

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/pie/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
pie showData
  "Data" : 2
  accDescr {a}
```

### Multiline values and order

Reuse [flowchart value columns](./flowchart.md#multi-line-values) and
[shared no wrapping](./flowchart.md#line-wrapping): source text is authored and
one layout should apply independently of width. Keep physical label/block lines,
continuation columns and internal blanks; do not reflow long statements at
printWidth or wrap section components. Preserve insertion order, duplicate
converted labels, prototype/numeric-looking keys, repeated/empty common
assignments and zero/small slices; reconstructing the resolved Map would lose
source occurrences or change the first value.

Fixed cases: [fixture: pie/multiline-values-and-order/multiline-label] [fixture:
pie/multiline-values-and-order/no-wrap] [fixture:
pie/multiline-values-and-order/order-duplicates] [fixture:
pie/multiline-values-and-order/order-sort-kept] [fixture:
pie/multiline-values-and-order/order-converted-prototype] [fixture:
pie/multiline-values-and-order/order-common-resets].

Input (escaped):
`"pie\n\"10\":3\n\"2\":4\n\"__proto__\":5\n\"constructor\":6\n'10':8\n\"a\\n\":1\n\"a\n\":7"`.

Output
([multiline-values-and-order/order-converted-prototype-output.mmd](../tests/fixtures/pie/multiline-values-and-order/order-converted-prototype-output.mmd)):

```mmd
pie
  "10" : 3
  "2" : 4
  "__proto__" : 5
  "constructor" : 6
  '10' : 8
  "a\n" : 1
  "a
" : 7
```

### Line terminators and unicode

Reuse [shared line endings](./compatibility.md#line-endings) and
[BOM host handling](./compatibility.md#byte-order-mark): Prettier normalizes
CR/CRLF before printing and applies endOfLine afterwards. These physical
conversions preserve Mermaid reading, including in labels, blocks and hidden
consumed LF. Preserve LS/PS/NBSP/BOM in value/comment/ignored content according
to its mode; unprotected common value edges trim
[common whitespace as defined in the specification](../../spec/docs/common.md#notation)
at either end. [corpus fixture: pie/review-common-all-whitespace-trim] Plain
block-opener whitespace joins. Native colon gaps remain ASCII. Invalid
structural Unicode stays rejected. A leading BOM is handled by Prettier, so byte
identity is not promised.

Fixed cases: [test: pie/line-terminators-and-unicode/eol-cr] [test:
pie/line-terminators-and-unicode/eol-crlf-hidden] [test:
pie/line-terminators-and-unicode/eol-output-cr] [test:
pie/line-terminators-and-unicode/eol-output-crlf] [test:
pie/line-terminators-and-unicode/unicode-values] [test:
pie/line-terminators-and-unicode/unicode-comments] [test:
pie/line-terminators-and-unicode/unicode-comment-split-kept] [test:
pie/line-terminators-and-unicode/unicode-opener] [test:
pie/line-terminators-and-unicode/unicode-block-empty] [test:
pie/line-terminators-and-unicode/unicode-line-trim] [test:
pie/line-terminators-and-unicode/bom-header] [test:
pie/line-terminators-and-unicode/unicode-label-boundaries] [test:
pie/line-terminators-and-unicode/unicode-ignored-bodies] [test:
pie/line-terminators-and-unicode/unicode-block-value-edges] [test:
pie/line-terminators-and-unicode/unicode-line-edges-and-internal] [test:
pie/line-terminators-and-unicode/eol-yaml-cr] [test:
pie/line-terminators-and-unicode/eol-block-crlf] [test:
pie/line-terminators-and-unicode/unicode-preheader-comment] [test:
pie/line-terminators-and-unicode/unicode-comment-region-common] [test:
pie/line-terminators-and-unicode/div-unicode-preheader-nbsp-hidden].

[test: pie/line-terminators-and-unicode/title-leading-ls] [test:
pie/line-terminators-and-unicode/title-leading-ps] [test:
pie/line-terminators-and-unicode/acctitle-leading-ls] [test:
pie/line-terminators-and-unicode/acctitle-leading-ps] [test:
pie/line-terminators-and-unicode/accdescr-leading-ls] [test:
pie/line-terminators-and-unicode/accdescr-leading-ps] [test:
pie/line-terminators-and-unicode/line-values-only-unicode].

Input (escaped):
`"pie\n\"x\u2028y\u2029z\":2\ntitle x\u2028y\naccTitle: x\u2029y\naccDescr {x\u2028y}"`.

Output (escaped):
`"pie\n  \"x\u2028y\u2029z\" : 2\n  title x\u2028y\n  accTitle: x\u2029y\n  accDescr {x\u2028y}\n"`.

### Frontmatter yaml

Reuse [guarded frontmatter](./flowchart.md#frontmatter-yaml), because only real
leading YAML supplies title/configuration. Format safe YAML, preserve delimiter
padding, and keep malformed, indented, HTML-hazard and delimiter-producing
bodies as written. YAML uses at least one indentation character at tabWidth
zero. Preserving hidden preheader text is shared by diagram types whose
specified lexical rules retain these hidden forms before the header; pie is the
first printer to apply it. Keep the entire prefix, including leading LF, comment
columns, second-scan forms, bare-line trivia and fence order: removing or moving
that prefix can promote ignored YAML into effective frontmatter. Never send
PieIgnoredText to the YAML formatter. Check written source separately from
embedded effects.

Fixed cases: [fixture: pie/frontmatter-yaml/frontmatter-safe] [fixture:
pie/frontmatter-yaml/frontmatter-invalid] [fixture:
pie/frontmatter-yaml/frontmatter-zero] [fixture:
pie/frontmatter-yaml/frontmatter-indent] [fixture:
pie/frontmatter-yaml/frontmatter-html-guard] [fixture:
pie/frontmatter-yaml/preheader-retained] [fixture:
pie/frontmatter-yaml/preheader-leading-lf] [fixture:
pie/frontmatter-yaml/preheader-second-scan] [fixture:
pie/frontmatter-yaml/frontmatter-delimiter-guard] [fixture:
pie/frontmatter-yaml/frontmatter-closing-padding] [fixture:
pie/frontmatter-yaml/frontmatter-less-than-safe] [fixture:
pie/frontmatter-yaml/preheader-malformed-yaml] [fixture:
pie/frontmatter-yaml/preheader-directive-before-yaml] [fixture:
pie/frontmatter-yaml/preheader-real-and-hidden] [fixture:
pie/frontmatter-yaml/preheader-leading-comments].

Input (escaped): `"\n---\ntitle: Hidden\n---\npie\n\"Leading\":2"`.

Output
([frontmatter-yaml/preheader-leading-lf-output.mmd](../tests/fixtures/pie/frontmatter-yaml/preheader-leading-lf-output.mmd)):

```mmd

---
title: Hidden
---
pie
  "Leading" : 2
```

### Specified readings

Reuse the
[shared failure policy](./compatibility.md#inputs-read-differently-from-mermaidjs):
accepted trees format with the specification reading, and parser failures report
a syntax error in standalone files and decline Markdown embedding. Corpus inputs
marked as known divergences use the specification's acceptance and Db readings.
Raw rejection has no raw Db; opaque malformed YAML has source/tree evidence
without invented accepted effects. Hidden forms, empty labels and empty blocks
introduce no further divergence. Rejected cases stay in corpus tests, including
failure after a valid prefix.

[corpus fixture: pie/div-directive-number] [corpus fixture:
pie/div-atomic-semicolon-number] [corpus fixture:
pie/div-review-frontmatter-html-cross-label] [corpus fixture:
pie/div-review-yaml-leading-invalid] [corpus fixture: pie/div-detect-c4-label]
[corpus fixture: pie/div-preheader-retained-yaml-bare-ls] [corpus fixture:
pie/recover-lexer-after-parser]

For example, input `"pie\n\"Atom\":1%%{init: {}}%%2"` reports a standalone
syntax error. No repaired output is supplied; Markdown leaves the payload to its
host.

### Final newline

Reuse the [shared file ending](./c4.md#final-newline) for a predictable
terminator: ordinary accepted files end with one configured newline.
Header-only, sections, closed blocks, empty common values, bare/triple-percent
comments and closed hidden forms use this path. Keep EOF-reaching global
directives and hidden closing padding; a closed hidden token may consume the
appended LF and satisfy EOL at EOF. Ordinary terminal blank runs disappear,
while protected hidden/preheader boundaries stay. A final LF may change raw C4
detection without changing the specified pie reading.

Fixed cases: [fixture: pie/final-newline/final-newline] [fixture:
pie/final-newline/final-bare] [fixture: pie/final-newline/final-global-open]
[fixture: pie/final-newline/final-hidden-space] [fixture:
pie/final-newline/markdown-top-payload] [fixture:
pie/final-newline/markdown-nested-payload] [fixture:
pie/final-newline/markdown-final-hidden-limit] [fixture:
pie/final-newline/final-section-without-lf] [fixture:
pie/final-newline/final-block] [fixture: pie/final-newline/final-common-empty].

[corpus fixture: pie/header-only] [corpus fixture: pie/acctitle-eof]

Input (escaped): `"pie\n\"End\":2\n\n\n"`.

Output
([final-newline/final-newline-output.mmd](../tests/fixtures/pie/final-newline/final-newline-output.mmd)):

```mmd
pie
  "End" : 2
```

### Markdown fences

Reuse [shared Markdown integration](./compatibility.md#markdown-code-blocks):
apply pie rules to the dedented payload, while Markdown supplies
list/quote/fence indentation. Fixed top-level, list and quote hosts check
multiline labels/blocks, zero/tabs, hidden gaps/boundaries, retained preheaders,
real YAML and textual semicolon/directive groups. The host trims final
code-block-line padding and controls EOL, including declined payloads; a final
hidden-boundary space may disappear where no later statement needs EOL. This
host limit does not authorize trimming an interior hidden boundary. Check host
output/idempotence separately from payload Db, tree and source.

[test: pie Markdown: top-level] [test: pie Markdown: list] [test: pie Markdown:
quote] [test: pie Markdown: zero] [test: pie Markdown: tabs] [test: pie
Markdown: hidden-gap] [test: pie Markdown: hidden-boundary] [test: pie Markdown:
preheader] [test: pie Markdown: frontmatter] [test: pie Markdown:
global-and-semicolons] [test: pie Markdown: final-comment] [test: pie Markdown:
final-hidden-padding] [test: pie Markdown: rejected]

Input (escaped): `"```mermaid\npie showData \"Fence\":2\n```\n"`.

Output (escaped): `"```mermaid\npie showData\n  \"Fence\" : 2\n```\n"`.
