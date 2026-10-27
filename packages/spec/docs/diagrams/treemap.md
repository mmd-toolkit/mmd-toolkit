# Treemap

Japanese version: [treemap.ja.md](./treemap.ja.md)

This document defines `treemap` and `treemap-beta`. The
[source tree](../ast/treemap.md) preserves authored syntax; derived values
belong to the [tests summary](../../../tests/docs/db-summaries.md#treemap). The
syntax follows [treemap.langium][grammar]. [fixture: treemap/gram-written-tree]
[fixture: treemap/header-beta]

## Detection

Entry 31 of [detection.md](../detection.md), the [treemap detector][detector],
selects the exact lowercase prefix `treemap` without a suffix boundary. Accepted
headers are `treemap-beta` and `treemap`; both report diagram id `treemap`.
Uppercase spelling, repeated headers, a header colon and unreadable suffixes
reject. Detection alone does not establish acceptance. [fixture:
treemap/header-beta] [fixture: treemap/spec-treemap-test-ts-892fa294] [fixture:
treemap/header-uppercase] [fixture: treemap/header-repeat] [fixture:
treemap/header-colon] [fixture: treemap/header-letter-suffix] [fixture:
treemap/header-digit-suffix] [fixture: treemap/header-underscore-suffix]
[fixture: treemap/header-dash-suffix] [fixture: treemap/header-unicode-suffix]

Apply [common preprocessing](../common.md#reading-a-source): leading
frontmatter, global directives, comment regions, leading whitespace, line
conversion, HTML attribute quotes, entities and selected semicolons. Real
leading frontmatter is a shared Frontmatter record. The earlier C4 detector can
match later C4 words; the shared header-selection divergence below applies.
[fixture: treemap/frontmatter-title] [fixture: treemap/frontmatter-crlf]
[fixture: treemap/detect-equally-indented] [fixture: treemap/comment-leading]
[fixture: treemap/space-bom-leading] [fixture: treemap/line-cr] [fixture:
treemap/line-crlf] [fixture: treemap/html-fields] [fixture:
treemap/entity-names] [fixture: treemap/style-fields] [fixture:
treemap/c4-component-section]

At the detection point, pass at most one retained block satisfying the common
[Frontmatter shape](../common.md#frontmatter), before bare percent-pair lines
and the second directive scan. It remains diagram text. Treemap has no native
YAML rule, so even a passed block rejects. A second block, a block after a
passed bare line, or one after a second-scan directive is not passed. Real
frontmatter may precede a retained block. [fixture:
treemap/detect-retained-body-yaml-no-native] [fixture:
treemap/detect-two-body-blocks] [fixture: treemap/detect-block-after-bare-brace]
[fixture: treemap/detect-second-scan-before-yaml] [fixture:
treemap/detect-yaml-before-second-scan] [fixture:
treemap/detect-block-after-frontmatter]

Adjacent fences without a body line, a missing closer, mismatched indentation,
four opening dashes, closing suffix text and a closer without a following line
break stop that skip. Leading trimming can remove only the opening indentation
and make fences mismatch. Closing padding followed by LF can satisfy detection
while native reading still rejects. [fixture: treemap/retained-yaml-no-bare]
[fixture: treemap/frontmatter-unclosed] [fixture:
treemap/detect-retained-indent-mismatch] [fixture:
treemap/detect-retained-four-dashes] [fixture:
treemap/detect-retained-close-suffix] [fixture:
treemap/detect-retained-close-without-lf] [fixture:
treemap/detect-retained-leading-indent-trim] [fixture:
treemap/detect-retained-closing-space]

A form found only by detection's second directive scan also remains diagram
text. In `%%{%%{wrap}%%wrap}%%` followed by a newline and `treemap`, removing
the inner source directive leaves a one-line percent form. Read it as a native
Comment, not a new Directive or ignored-text node; retain the inner source
directive once in Root.directives. A multiline retained form with a noncomment
closing line rejects. A glued header swallowed by the native comment also
rejects. [fixture: treemap/detect-second-scan-single-line-comment] [fixture:
treemap/detect-second-scan-multiline-rejected] [fixture:
treemap/detect-second-scan-multiline-glued] [fixture:
treemap/detect-second-scan-single-line-header-swallowed]

Detection-passed bare percent-pair lines are shared Comments with mark `%%`.
Their accompanying whitespace and line breaks are trivia and are not read again,
including before, after or between retained forms, on whitespace-only lines and
immediately before the header. The retained form itself must still be readable.
This accepts some ASCII and Unicode gaps Mermaid rejects, under
bare-percent-line-before-header. Without a passed line, the same later gap
remains native diagram text; Unicode whitespace there rejects. [fixture:
treemap/bare-before-header-space] [fixture: treemap/bare-before-header-tab]
[fixture: treemap/bare-before-header-ls] [fixture: treemap/bare-line-nbsp]
[fixture: treemap/retained-directive-before-bare] [fixture:
treemap/retained-directive-between-bare] [fixture:
treemap/div-retained-before-bare-unicode-line] [fixture:
treemap/div-bare-before-retained-unicode-line] [fixture:
treemap/div-bare-retained-ascii-padding] [fixture:
treemap/div-retained-bare-ascii-line] [fixture:
treemap/div-bare-retained-unicode-header] [fixture:
treemap/div-bare-retained-ascii-header] [fixture:
treemap/detect-retained-bare-lf-control] [fixture:
treemap/lex-retained-no-bare-unicode-line] [fixture:
treemap/lex-retained-no-bare-unicode-header] [fixture:
treemap/detect-retained-yaml-bare-ascii-gap]

## Lexical structure

### Ordered rules

Read converted diagram text from the detection point, excluding the passed
intervals above. At every unit start take the first applicable rule below, then
restart after it. There is no general longest-match choice or explicit longer
alternative. Every character that no rule reads makes the input rejected.
Whitespace is not generally skipped. [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-selector-reserved-treemap] [fixture:
treemap/lex-class-name-title-prefix] [fixture: treemap/db-class-names] [fixture:
treemap/error-start] [fixture: treemap/error-after-prefix] [fixture:
treemap/gram-header-trailing-indent-eof]

| Order | Unit or trivia                    | Reading                                            |
| ----- | --------------------------------- | -------------------------------------------------- |
| 1     | acc-descr-line or acc-descr-block | Padded common description; colon form first.       |
| 2     | acc-title-line                    | Padded common accessibility title.                 |
| 3     | title-line                        | Padded title, with a bare-keyword alternative.     |
| 4     | Header                            | `treemap-beta` before `treemap`.                   |
| 5     | class-definition                  | Complete classDef form below.                      |
| 6     | class-marker                      | `:::`.                                             |
| 7     | colon                             | `:`.                                               |
| 8     | comma                             | `,`.                                               |
| 9     | indentation                       | Maximal nonempty ASCII space/tab run.              |
| 10    | Hidden WS                         | Same space/tab set; indentation matches first.     |
| 11    | Native comment                    | `%%` through before LF.                            |
| 12    | Hidden newline                    | LF, or CRLF before common normalization.           |
| 13    | identifier                        | ASCII letter/underscore, then word characters.     |
| 14    | number                            | Nonempty run of digits, underscores, dots, commas. |
| 15    | string                            | Double-quoted or single-quoted string.             |

The [grammar][grammar] imports no common grammar. BOOLEAN supplies no unit:
`true` and `false` are identifiers at selector positions, and standalone
booleans reject. There is no native YAML or DIRECTIVE unit and no hidden general
Unicode whitespace. [fixture: treemap/gram-selector-keywords] [fixture:
treemap/gram-standalone-boolean] [fixture: treemap/hidden-yaml-body] [fixture:
treemap/hidden-comment-inline] [fixture: treemap/space-nbsp-body] [fixture:
treemap/space-3000-body]

### Headers and indentation

Neither header requires a word or whitespace boundary. A quoted row or title may
follow immediately; `treemapX` instead leaves an unreadable suffix. Global
directives between complete components leave this rule unchanged. [fixture:
treemap/header-inline-section] [fixture: treemap/header-inline-leaf] [fixture:
treemap/header-glued-title] [fixture: treemap/header-beta-glued-title] [fixture:
treemap/header-letter-suffix] [fixture: treemap/directive-header-glued]

An indentation unit counts each ASCII space or tab once; a tab is not expanded.
Its only grammatical positions are before a row and immediately before or after
a leaf value separator. Hidden newlines may intervene between complete units. In
particular, a selector marker and its identifier may lie on later lines without
indentation; a space/tab before or after that marker rejects. [fixture:
treemap/db-tabs-count] [fixture: treemap/gram-leaf-newlines-around-separator]
[fixture: treemap/gram-leaf-indentation-before-newlines] [fixture:
treemap/gram-selector-marker-next-line] [fixture:
treemap/gram-selector-value-next-line] [fixture:
treemap/gram-section-space-before-selector] [fixture:
treemap/gram-space-after-selector] [fixture: treemap/gram-space-before-selector]
[fixture: treemap/gram-spaced-leaf]

After a complete selector, a space/tab run may indent the next adjacent quoted
row; it is not a gap inside the selector. [fixture:
treemap/gram-selector-followed-by-indented-row]

A row's indentation need not come from the start of its physical line.
Spaces/tabs at the end of the preceding header, section or leaf, or after a
classDef semicolon, can supply it across hidden newlines. A whitespace-only line
can supply it too. Separate runs on separate lines remain separate units: two
such runs where only one is allowed reject. A final unused run rejects.
[fixture: treemap/db-header-tail-space] [fixture: treemap/db-header-tail-tab]
[fixture: treemap/db-section-tail-space] [fixture: treemap/db-section-tail-tab]
[fixture: treemap/db-leaf-tail-space] [fixture: treemap/db-leaf-tail-tab]
[fixture: treemap/db-class-tail-space] [fixture: treemap/db-class-tail-tab]
[fixture: treemap/gram-indent-from-whitespace-line] [fixture:
treemap/gram-two-indent-runs] [fixture:
treemap/gram-header-tail-space-next-indent] [fixture:
treemap/gram-header-tail-tab-next-indent] [fixture:
treemap/gram-section-tail-space-next-indent] [fixture:
treemap/gram-section-tail-tab-next-indent] [fixture:
treemap/gram-leaf-tail-space-next-indent] [fixture:
treemap/gram-leaf-tail-tab-next-indent] [fixture:
treemap/gram-class-tail-space-next-indent] [fixture:
treemap/gram-class-tail-tab-next-indent] [fixture:
treemap/gram-header-trailing-indent-eof] [fixture:
treemap/gram-leaf-trailing-indent-eof]

Leaving out trailing whitespace can therefore change parentage. Whitespace
already enclosed by a title, accessibility line, class style before its
terminating semicolon, or native comment is content of that earlier match, not a
new indentation unit. A padded common form matches before indentation at the
same position; a separate earlier run across a newline cannot prefix that common
form. Common comment-region removal can also remove an earlier whitespace-only
line. A directive inside a whitespace run joins its two parts for counting.
[fixture: treemap/db-section-tail-no-space] [fixture:
treemap/db-leaf-tail-no-space] [fixture: treemap/db-class-tail-no-space]
[fixture: treemap/db-style-whitespace] [fixture: treemap/common-line-whitespace]
[fixture: treemap/hidden-comment-space] [fixture:
treemap/lex-leading-padding-title-priority] [fixture:
treemap/gram-indent-before-common-on-next-line] [fixture:
treemap/comment-region-removes-blank-indent] [fixture:
treemap/gram-indent-around-global-directive] [fixture:
treemap/db-style-tail-stays-content] [fixture:
treemap/db-title-tail-stays-content] [fixture:
treemap/db-acctitle-tail-stays-content] [fixture:
treemap/db-native-comment-tail-stays-content]

### Names, numbers and strings

An identifier starts with an ASCII letter or underscore and continues with zero
or more ASCII letters, digits or underscores. It can have one character. Earlier
matching forms still win: a selector beginning with `treemap` or `title` can
reject, whereas `accTitleStyle` and `classDefStyle` are identifiers when the
earlier composite does not match. Hyphens, Unicode letters, quotes, entities and
a leading digit do not form selector identifiers. [fixture:
treemap/lex-selector-single-letter] [fixture:
treemap/lex-selector-single-underscore] [fixture:
treemap/gram-selector-underscore] [fixture:
treemap/gram-selector-reserved-treemap] [fixture: treemap/db-class-names]
[fixture: treemap/gram-selector-reserved-acctitle] [fixture:
treemap/gram-selector-reserved-class] [fixture: treemap/gram-selector-dash]
[fixture: treemap/gram-selector-unicode] [fixture: treemap/gram-selector-quoted]
[fixture: treemap/gram-selector-entities] [fixture:
treemap/gram-selector-number]

A number unit takes as many digits, underscores, dots and commas as possible.
Identifier and comma rules have priority at its start: `_12` is an identifier
and `,12` starts with a comma, so neither is a leaf number. Once a digit or dot
starts the number, later commas and underscores stay inside it, including
trailing commas before the next quoted row. Signs, exponents, alphabetic
suffixes, bare NaN and Infinity reject. A newline, even next to a removed
comment line, does not join two numeric units. [fixture:
treemap/db-number-mixed] [fixture: treemap/db-number-trailing-comma] [fixture:
treemap/lex-number-commas-before-next-node] [fixture:
treemap/number-leading-underscore] [fixture: treemap/number-leading-comma]
[fixture: treemap/gram-comma-leaf-leading-comma-number] [fixture:
treemap/number-negative] [fixture: treemap/number-negative-zero] [fixture:
treemap/number-plus] [fixture: treemap/number-exponent] [fixture:
treemap/number-suffix] [fixture: treemap/number-nan] [fixture:
treemap/number-infinity] [fixture: treemap/lex-number-lf-no-concatenation]
[fixture: treemap/lex-number-comment-no-concatenation] [fixture:
treemap/directive-invalid-number-suffix-control]

Unusual numeric spellings such as `1_234.50`, `1.2.3`, `.` and `._` are
accepted, as are rounded, overflow, subnormal and underflow values. Their source
spelling stays in NumericLiteral.raw; [NumericLiteral](../ast.md#numericliteral)
defines the numeric field for this position. These values add no semantic
rejection. [fixture: treemap/db-number-underscore] [fixture:
treemap/db-number-multiple-dots] [fixture: treemap/db-number-nan] [fixture:
treemap/lex-number-dot-underscore] [fixture: treemap/db-number-rounded]
[fixture: treemap/db-number-overflow] [fixture: treemap/db-number-subnormal]
[fixture: treemap/db-number-underflow]

A string opens with a double or single quote and closes at the next same quote.
It may be empty and may include opposite quotes, backslashes, line terminators,
U+2028 and U+2029. Backslashes do not escape quotes or decode characters, and a
backslash followed by a physical line feed is allowed. An unclosed string
rejects. Preserve source quotes and line endings in StringLiteral.raw. [fixture:
treemap/db-empty-names] [fixture: treemap/docs-syntax-treemap-20b3fefc]
[fixture: treemap/lex-string-conversion] [fixture: treemap/line-name-values]
[fixture: treemap/lex-string-backslash-line-feed] [fixture:
treemap/lex-string-escaped-quote] [fixture: treemap/lex-string-open-double]
[fixture: treemap/lex-string-open-single]

### Class definitions

A class-definition unit consists of `classDef`, one or more common Notation
whitespace characters, a class name, an optional whitespace-led style text and
at most one final semicolon. Its name starts with an ASCII letter or underscore
and has at least one further ASCII letter, digit or underscore. It is not
re-lexed by earlier title/header rules inside the composite. A one-character
class name rejects, unlike a one-character selector. [fixture:
treemap/gram-class-name-two-characters] [fixture: treemap/gram-class-one-letter]
[fixture: treemap/lex-class-name-title-prefix] [fixture:
treemap/lex-selector-single-letter] [fixture: treemap/space-class-name-bom]
[fixture: treemap/gram-class-newline] [fixture: treemap/gram-class-glued]
[fixture: treemap/gram-class-number] [fixture: treemap/gram-class-name-quoted]
[fixture: treemap/gram-class-upper]

The separating whitespace is read maximally before style text. It can cross line
feeds and blank lines, so a following quoted row or classDef can be the style
rather than a new statement. Style text itself runs through all characters
before the first semicolon or line terminator, including commas, colons, quotes,
percent pairs, U+2028 and U+2029. Empty style is allowed. A second unselected
semicolon is unreadable and rejects. [fixture:
treemap/db-class-consumes-next-line] [fixture:
treemap/lex-class-style-takes-next-class] [fixture:
treemap/lex-class-style-crosses-blank-line] [fixture:
treemap/gram-class-style-next-line] [fixture: treemap/db-class-escaped-comma]
[fixture: treemap/hidden-comment-class] [fixture: treemap/line-class-ls]
[fixture: treemap/line-class-ps] [fixture:
treemap/gram-class-empty-with-semicolon] [fixture:
treemap/gram-class-whitespace-style-null] [fixture:
treemap/tail-class-double-semicolon]

Without intervening whitespace, a styleless class name may be followed
immediately by a quoted row. A terminating semicolon may likewise precede the
next row. Unknown CSS, unused definitions, repeated definitions and unresolved
selectors are not rejection conditions. Preserve each definition's whole style
text; splitting and merging styles belong to the tests summary. [fixture:
treemap/gram-class-name-glued-node] [fixture:
treemap/gram-class-semicolon-glued-node] [fixture: treemap/db-class-unused]
[fixture: treemap/db-class-repeat] [fixture: treemap/db-class-missing] [fixture:
treemap/db-prototype-names]

### Common forms

The three common terminals have the same character rules as
[common.langium][common], but this diagram does not import its fragment: no EOL
is required after a common form. At a unit start each may take preceding ASCII
spaces/tabs. A title reads `title` and, if present, exactly one ASCII space/tab
followed by line text; the bare-keyword alternative is also allowed. The line
text stops at the first percent pair or line terminator. `title"A":1` is an
empty title and a leaf, whereas `titleX` leaves an identifier that the grammar
does not take. [fixture: treemap/common-title-eof] [fixture:
treemap/common-title-one-space] [fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-two-spaces] [fixture:
treemap/gram-title-empty-before-glued-node] [fixture:
treemap/common-title-letter] [fixture: treemap/common-title-colon] [fixture:
treemap/hidden-comment-title] [fixture: treemap/gram-title-block-node-adjacent]
[fixture: treemap/gram-description-block-acctitle-adjacent]

An acc-title-line reads `accTitle`, optional ASCII space/tab, a colon and
possibly empty line text. An acc-descr-line does the same with `accDescr`; try
this colon form before its block form. Both line values stop at the first
percent pair or line terminator and may include U+2028/U+2029. Padding before
the colon does not include Unicode whitespace or newlines. [fixture:
treemap/common-acctitle-eof] [fixture: treemap/common-description-eof] [fixture:
treemap/common-accdescr-colon-block-priority] [fixture:
treemap/comment-acctitle] [fixture: treemap/comment-accdescr] [fixture:
treemap/line-common-values] [fixture: treemap/space-acctitle-nbsp-gap] [fixture:
treemap/common-acctitle-next-statement] [fixture:
treemap/common-accdescr-next-statement]

An acc-descr-block reads `accDescr`, zero or more common Notation whitespace
characters, `{`, any characters up to the first `}`, and that required closer.
Whitespace before the opener may include a newline, BOM, U+2028 or a removed
common directive/comment region. Quotes and backslashes do not protect a closing
brace. Empty and whitespace-only blocks are statements. Do not impose a
following EOL or a single occurrence. [fixture:
treemap/common-block-newline-gap] [fixture: treemap/common-block-bom-gap]
[fixture: treemap/common-block-ls-gap] [fixture:
treemap/common-block-directive-gap] [fixture: treemap/common-block-comment-gap]
[fixture: treemap/common-block-quoted-close] [fixture:
treemap/common-block-escaped-close] [fixture: treemap/common-block-first-close]
[fixture: treemap/common-block-open] [fixture:
treemap/common-block-empty-interleaved] [fixture:
treemap/common-block-whitespace-only] [fixture:
treemap/gram-description-block-acctitle-adjacent] [fixture:
treemap/common-repeat-empty]

### Comments and authored boundaries

At a native unit start, a percent pair reads a Comment through before the next
LF; in source terms CR, CRLF and LF end it after common line conversion. U+2028
and U+2029 do not end it. A `}%%`, a second percent form and all later text on
that line stay in its value. LF itself is not consumed; the hidden newline rule
reads it separately, including the appended LF at EOF. Comment.mark is `%%`;
range starts at its first percent and excludes the line terminator, and value
excludes the mark. [fixture: treemap/comment-native-crlf-ending] [fixture:
treemap/comment-ls] [fixture: treemap/comment-ps] [fixture:
treemap/hidden-comment-closer] [fixture: treemap/hidden-comment-no-lf] [fixture:
treemap/hidden-comment-sole-lf] [fixture: treemap/hidden-comment-spare-lf]
[fixture: treemap/hidden-comment-eof] [fixture:
treemap/lex-indent-comment-ps-semicolon-space] [fixture:
treemap/lex-indent-comment-ls-semicolon-space] [fixture:
treemap/lex-indent-comment-ps-selected-semicolon]

Earlier enclosing strings, class styles and description blocks own their
percent-looking text. Line common forms instead stop before the first percent
pair and then allow a Comment. A native comment can lie between complete
leaf/selector components, but it cannot hide forbidden indentation before a
selector. Source comment regions and directives keep the common ownership; a
directive between the two percent characters may form a native mark after
removal. [fixture: treemap/comment-in-name] [fixture:
treemap/hidden-comment-string] [fixture: treemap/hidden-comment-class] [fixture:
treemap/lex-description-block-native-percent] [fixture:
treemap/hidden-comment-title] [fixture: treemap/comment-leaf-separator-indent]
[fixture: treemap/comment-value-selector-gap] [fixture:
treemap/comment-selector-forbidden-indent] [fixture:
treemap/comment-mark-joined-by-directive]

Ordinary word-start global directives, including `%%{other: x}%%`, are common
trivia, not native hidden directives. A remaining nonword form such as `%%{!}%%`
is a one-line Comment and has no closing-delimiter rule. Bare YAML rejects
except when enclosed by a string, style or common value. There is no
TreemapIgnoredText or hidden-form gap node. [fixture:
treemap/hidden-native-inline] [fixture: treemap/hidden-native-multiline]
[fixture: treemap/hidden-native-open] [fixture: treemap/hidden-comment-inline]
[fixture: treemap/hidden-comment-multiline] [fixture: treemap/hidden-yaml-body]
[fixture: treemap/hidden-yaml-gap] [fixture: treemap/hidden-yaml-string]
[fixture: treemap/hidden-yaml-block] [fixture: treemap/hidden-yaml-title]
[fixture: treemap/hidden-yaml-class] [fixture:
treemap/comment-second-scan-shaped-body]

For the common directive and ignored-semicolon boundary rules, distinguish
authored components of composite forms: the header, classDef keyword, class
name, common keywords, number, identifier and `:::` are atoms. Class style,
common value text and string interiors are text/string positions;
whitespace-only parts are transparent. A directive between a common keyword and
colon, or a classDef keyword and name with its required whitespace, is
permitted. It cannot supply missing whitespace. Do not treat the entire
class-definition or common form as an indivisible atom. [fixture:
treemap/directive-header-middle] [fixture: treemap/div-directive-beta-header]
[fixture: treemap/directive-class-keyword] [fixture:
treemap/directive-class-name] [fixture: treemap/directive-common-keyword]
[fixture: treemap/directive-number] [fixture: treemap/directive-selector]
[fixture: treemap/div-directive-style-marker] [fixture:
treemap/directive-common-colon] [fixture:
treemap/directive-class-keyword-name-gap] [fixture:
treemap/directive-class-keyword-missing-space] [fixture:
treemap/directive-class-name-node-boundary] [fixture: treemap/directive-style]
[fixture: treemap/directive-title] [fixture: treemap/directive-name-middle]
[fixture: treemap/directive-title-glued-value] [fixture:
treemap/div-semicolon-selector-atom] [fixture:
treemap/div-semicolon-number-atom] [fixture: treemap/div-semicolon-style-marker]
[fixture: treemap/div-semicolon-class-keyword-style-trigger] [fixture:
treemap/div-semicolon-class-name-style-trigger] [fixture:
treemap/div-semicolon-title-keyword] [fixture:
treemap/div-semicolon-class-keyword-classdef-trigger] [fixture:
treemap/lex-class-name-unselected-semicolon] [fixture: treemap/style-fields]

## Grammar

```text
diagram = ("treemap-beta" | "treemap") statement* end-of-text
statement = row | common-statement
row = indentation? (section | leaf | class-definition)
section = string (class-marker identifier)?
leaf = string indentation? (colon | comma) indentation? number
       (class-marker identifier)?
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
```

Apply the [common notation](../common.md#notation). Hidden newlines and native
Comments add no statement separators or body items. Take the leaf reading when
the complete leaf production matches; otherwise a quoted name with its optional
selector is a section. A body may be empty and statements may be adjacent or
interleaved with common forms and class definitions. No EOL is required. A
number alone, unquoted row name, class assignment, data block, missing
number/selector or general semicolon separator rejects. [fixture:
treemap/spec-treemap-test-ts-892fa294] [fixture: treemap/gram-adjacent-sections]
[fixture: treemap/gram-same-line] [fixture: treemap/gram-written-tree] [fixture:
treemap/gram-title-block-node-adjacent] [fixture:
treemap/gram-description-block-acctitle-adjacent] [fixture:
treemap/lex-string-unquoted] [fixture: treemap/gram-data-block] [fixture:
treemap/error-recovered-row] [fixture: treemap/gram-selector-empty] [fixture:
treemap/tail-leaf-semicolon] [fixture: treemap/lex-number-lf-no-concatenation]
[fixture: treemap/spec-treemap-test-ts-42b43ee6] [fixture:
treemap/spec-treemap-test-ts-e40d6eee]

| Rule                       | Node                          |
| -------------------------- | ----------------------------- |
| diagram                    | TreemapDiagram                |
| section                    | TreemapSection                |
| leaf                       | TreemapLeaf                   |
| class-definition           | TreemapClassDefStatement      |
| title-line                 | TreemapTitleStatement         |
| acc-title-line             | TreemapAccTitleStatement      |
| acc-descr-line             | TreemapAccDescrStatement      |
| acc-descr-block            | TreemapAccDescrBlockStatement |
| string                     | StringLiteral                 |
| identifier / class name    | Identifier                    |
| number                     | NumericLiteral                |
| Class style / common value | TreemapLiteral                |

### Indentation and parents

The following direct rule, corresponding to [buildHierarchy][hierarchy],
determines the nesting of TreemapSection.children and the roots in
TreemapDiagram.body. Process sections and leaves in written order; common
statements and class definitions do not participate. Keep a list of open
sections. Before each node, remove the last open section while its indentation
is greater than or equal to the node's. The last remaining open section is the
parent; if none remains, the node is another root. Add the current node to the
open list only when it is a section. A leaf closes sections by the same
comparison but never becomes a parent. [fixture: treemap/db-indent-pop]
[fixture: treemap/db-leaf-not-parent] [fixture:
treemap/db-leaf-closes-open-sections] [fixture: treemap/db-class-indented]
[fixture: treemap/common-block-empty-interleaved] [fixture:
treemap/gram-written-tree]

The first node may be indented; multiple roots and arbitrary indentation
increases are allowed. A later deep row after a leaf attaches to a still-open
section or becomes a root. Closed sections do not reopen: in `"A"`, two-space
`"B"`, unindented `"L":1`, four-space `"C":2`, B is under A, while L and C are
roots. The preceding line's trailing spaces/tabs described above count in this
comparison too. [fixture: treemap/db-first-indented] [fixture:
treemap/db-tabs-count] [fixture: treemap/db-leaf-not-parent] [fixture:
treemap/db-leaf-closes-open-sections] [fixture: treemap/db-section-tail-space]
[fixture: treemap/db-leaf-tail-space] [fixture: treemap/db-header-tail-space]
[fixture: treemap/db-class-tail-space]

Directives, comments, empty lines and selected ignored semicolons add no
hierarchy nodes. Their lexical effect on indentation is unchanged. An empty
description block is a common statement and does not close an open section.
LS/PS outside a unit still reject; inside a native comment they remain comment
content through LF, so apparent nodes there are not children. [fixture:
treemap/gram-indent-around-global-directive] [fixture:
treemap/gram-nesting-child-after-directive-line] [fixture:
treemap/gram-nesting-child-after-comment] [fixture:
treemap/gram-nesting-child-after-empty-line] [fixture:
treemap/db-class-tail-space] [fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/line-ls-between] [fixture: treemap/line-ps-between] [fixture:
treemap/gram-nesting-child-after-comment-ls] [fixture:
treemap/gram-nesting-child-after-comment-ps]

### Semantic acceptance conditions

The [public parse wrapper][parse] rejects any lexer or parser error, including
incomplete consumption and errors on a recovered tree. The [registered
single-root validator][validator] is not called by that path. There is no
further input-dependent semantic rejection in the [adapter][adapter] or
[Db][db]. Multiple roots, empty or duplicate names, empty sections, NaN and
overflow numbers, unused/redefined classes and unresolved selectors are accepted
when the lexical and grammar rules above hold. [fixture: treemap/error-start]
[fixture: treemap/error-after-prefix] [fixture: treemap/error-recovered-row]
[fixture: treemap/db-first-indented] [fixture: treemap/db-empty-names] [fixture:
treemap/db-duplicate-names] [fixture: treemap/db-number-nan] [fixture:
treemap/db-number-overflow] [fixture: treemap/db-class-unused] [fixture:
treemap/db-class-repeat] [fixture: treemap/db-class-missing]

Treemap settings are drawing settings and change neither grammar acceptance nor
add a node-count limit in public parse. Site, frontmatter and init settings
cannot reject valid treemap syntax or rescue invalid syntax; invalid valueFormat
is not parsed by the renderer during public parse. There is no treemap-specific
acceptance key. Embedded-data validation remains the shared opaque-data
divergence. [fixture: treemap/config-drawing-only] [fixture:
treemap/config-frontmatter-drawing] [fixture: treemap/config-init-drawing]
[fixture: treemap/config-site-cannot-rescue] [fixture:
treemap/config-frontmatter-cannot-rescue] [fixture:
treemap/config-init-cannot-rescue] [fixture: treemap/config-limit-small]
[fixture: treemap/div-frontmatter-invalid]

### Db normalization

The [tests summary](../../../tests/docs/db-summaries.md#treemap) defines
common-value publication, numeric conversion, class splitting/merging and the
published forest. Its indentation includes preceding trailing whitespace as
specified here. Source AST order and raw spelling are independent of that
normalization; no artificial root, compiled style, aggregate, coordinate or
drawing order is added to this source tree. [fixture: treemap/gram-written-tree]
[fixture: treemap/db-all-fields] [fixture: treemap/db-class-forward] [fixture:
treemap/db-section-tail-space]

## Known divergences

**[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
A directive inside an atomic header, keyword, class name, selector, number or
class marker rejects here; text, strings and complete-component gaps retain
their allowed reading. [fixture: treemap/directive-header-middle] [fixture:
treemap/div-directive-beta-header] [fixture: treemap/directive-class-name]
[fixture: treemap/directive-common-keyword] [fixture: treemap/directive-number]
[fixture: treemap/directive-selector] [fixture:
treemap/div-directive-style-marker] [fixture: treemap/directive-common-colon]
[fixture: treemap/directive-style]

**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
An ignored semicolon inside a keyword, class name, selector, number or marker
rejects here; an unselected semicolon is not this divergence. [fixture:
treemap/div-semicolon-selector-atom] [fixture:
treemap/div-semicolon-number-atom] [fixture: treemap/div-semicolon-style-marker]
[fixture: treemap/div-semicolon-class-keyword-style-trigger] [fixture:
treemap/div-semicolon-class-name-style-trigger] [fixture:
treemap/div-semicolon-title-keyword] [fixture:
treemap/div-semicolon-class-keyword-classdef-trigger] [fixture:
treemap/lex-class-name-unselected-semicolon]

**[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
Body HTML-attribute quote reading starts after frontmatter. An open frontmatter
tag cannot change a name's string boundary or the quotes in a common value or
class style. This can reverse acceptance in either direction or change only a
value when both readings accept; specified.json records the comparison.
[fixture: treemap/div-html-tag-starts-in-frontmatter] [fixture:
treemap/div-html-frontmatter-reverse] [fixture:
treemap/div-html-frontmatter-title-value] [fixture:
treemap/div-html-frontmatter-style-value]

**[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).**
Shared frontmatter and directive payloads remain opaque; remove no treemap
acceptance key when making their comparison reading. [fixture:
treemap/div-frontmatter-invalid] [fixture: treemap/div-invalid-keeps-config]
[fixture: treemap/div-init-fontfamily-number] [fixture:
treemap/div-init-primitive-wrap] [fixture: treemap/div-init-invalid-colour-base]

**[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
Passed bare lines and accompanying trivia are not re-read; this can accept ASCII
and Unicode padding Mermaid rejects. Retained forms still have to be
native-readable. [fixture: treemap/bare-before-header-space] [fixture:
treemap/bare-line-nbsp] [fixture: treemap/div-retained-before-bare-unicode-line]
[fixture: treemap/div-bare-retained-ascii-header] [fixture:
treemap/lex-retained-no-bare-unicode-line] [fixture:
treemap/detect-retained-yaml-bare-ascii-gap]

**[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).** Choose
treemap by its header even when a later name, style, common value or
unterminated comment contains one of C4's four anywhere keywords. [fixture:
treemap/c4-container-section] [fixture: treemap/c4-component-leaf] [fixture:
treemap/c4-dynamic-title] [fixture: treemap/c4-deployment-block] [fixture:
treemap/c4-component-header-eof] [fixture: treemap/c4-component-header-lf]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treemap/treemap.langium#L9-L89
[common]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L6-L34
[detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treemap/detector.ts#L7-L11
[hierarchy]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treemap/utils.ts#L8-L64
[parse]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L149
[validator]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treemap/treemap-validator.ts#L8-L61
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treemap/parser.ts#L13-L108
[db]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treemap/db.ts#L17-L95
