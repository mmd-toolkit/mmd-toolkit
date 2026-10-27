# Pie

Japanese version: [pie.ja.md](./pie.ja.md)

This document defines `pie`. Its source tree is in [ast/pie.md](../ast/pie.md);
the stored values are summarized by the
[tests package](../../../tests/docs/db-summaries.md#pie).

The lexical and grammar rules follow
[pie.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/pie.langium#L1-L20)
and its imported
[common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L1-L34).

## Detection

Entry 13 of [detection.md](../detection.md) selects pie for the exact lower-case
prefix `pie`. The detector requires no suffix boundary: `pieChart` is detected
as pie but rejected by the lexical rules. `Pie` and `PIE` do not select pie.
[fixture: pie/header-only] [fixture: pie/header-letter-suffix] [fixture:
pie/header-capitalized] [fixture: pie/header-uppercase]

Common leading trivia, frontmatter, directives, comment regions, HTML attribute
quotes, entities and selected semicolons apply. Bare percent-pair lines passed
by detection before the header are shared Comments with mark `%%`, including
`%%{}%%`, `%%{!}%%` and an unclosed `%%{!` line. They are not PieIgnoredText and
are not read again by the pie lexical rules. [fixture:
pie/directive-before-header] [fixture: pie/comment-before-header] [fixture:
pie/html-all-texts] [fixture: pie/entity-all-texts] [fixture:
pie/style-label-trigger] [fixture: pie/review-comment-bare-header-eof] [fixture:
pie/lex-bare-percent-braces-before-header] [fixture:
pie/lex-hidden-comment-before-header] [fixture:
pie/comment-preheader-unclosed-percent-brace]

At the detection point, before passing bare percent-pair lines, detection passes
one block satisfying the common [Frontmatter](../common.md#frontmatter) shape
and looks for the header after it. The block is not leading frontmatter: the
diagram lexer still reads it. Pie applies its hidden YAML rule to that retained
text; when it matches, PieIgnoredText holds the block and its title and
configuration do not apply. Gitgraph also retains a matching hidden block; the
cited other diagram types reject the retained block. [fixture:
pie/frontmatter-nonleading-comment] [fixture: gitgraph/lex-yaml-after-comment]
[fixture: pie/lex-yaml-leading-config-not-applied] [fixture:
pie/lex-yaml-after-leading-lf] [fixture: pie/lex-yaml-bom-opening-only]
[fixture: pie/lex-yaml-after-directive-line] [fixture:
pie/lex-yaml-after-directive-glued] [fixture:
common/directive-before-frontmatter] [fixture:
common/frontmatter-leading-newline] [fixture:
common/frontmatter-nonleading-sequence] [fixture:
common/frontmatter-nonleading-class] [fixture:
common/frontmatter-nonleading-state] [fixture:
agentflow/db-frontmatter-after-comment] [fixture:
block/gram-frontmatter-comment-before] [fixture:
ishikawa/frontmatter-after-comment] [fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before]

Matching byte order marks on both fences can instead form real leading
frontmatter. A malformed YAML body in a nonleading block is still ignored; no
YAML reader checks it. Adjacent `---` fences with no body line, an unmatched
fence, and a preceding bare `%%` line stop the detection skip and leave the
rejecting `---` pseudo-diagram selected. [fixture: pie/lex-yaml-bom-both-fences]
[fixture: pie/lex-yaml-after-comment-invalid-body] [fixture:
pie/lex-yaml-after-comment-adjacent-fences] [fixture: pie/frontmatter-unclosed]
[fixture: pie/lex-yaml-after-bare-comment] [fixture:
common/frontmatter-adjacent-delimiters] [fixture: common/frontmatter-unclosed]
[fixture: pie/detect-block-after-bare-brace-line]

This skip is tried only once, before passing bare lines or performing the second
directive scan. A second block is not skipped, nor is a block after a
second-scan directive; a second-scan directive may instead follow the skipped
block. Real leading frontmatter may precede this separate retained block.
Leading indentation at the detection point is trivia, so equal indentation on
the two nonleading fences leaves only the closer indented and prevents the skip.
[fixture: pie/detect-two-nonleading-blocks] [fixture:
pie/detect-block-after-real-frontmatter] [fixture:
pie/detect-second-scan-directive-before-block] [fixture:
pie/detect-block-before-second-scan-directive] [fixture:
pie/detect-block-equally-indented-fences]

Detection passes common whitespace between a bare `%%` line and the header.
After common CR/CRLF conversion, any common whitespace other than ASCII space,
tab or LF left there is rejected by Mermaid's pie lexical rules but accepted
here as leading trivia. This includes a whitespace-only line and LS or a byte
order mark immediately before the header; see
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).
An ASCII space/tab line there, or an LS line without the bare line, is accepted
by both. [fixture: pie/div-preheader-bare-ls-blank] [fixture:
pie/div-preheader-bare-ps-blank] [fixture: pie/div-preheader-bare-nbsp-blank]
[fixture: pie/div-preheader-bare-bom-blank] [fixture:
pie/lex-preheader-bare-ascii-blank-control] [fixture:
pie/lex-preheader-ls-without-bare-control] [fixture:
pie/div-preheader-bare-vt-blank] [fixture: pie/div-preheader-bare-ff-blank]
[fixture: pie/div-preheader-bare-u1680-blank] [fixture:
pie/div-preheader-bare-u2003-blank] [fixture:
pie/div-preheader-bare-u202f-blank] [fixture:
pie/div-preheader-bare-u205f-blank] [fixture:
pie/div-preheader-bare-u3000-blank] [fixture:
pie/div-preheader-bare-ls-before-header] [fixture:
pie/div-preheader-bare-bom-before-header]

This treatment also applies when a retained nonleading block or second-scan
directive precedes the bare line, or when the passed trivia separates a retained
block from a second-scan directive. [fixture:
pie/div-preheader-retained-directive-bare-bom] [fixture:
pie/div-preheader-retained-directive-bare-ls] [fixture:
pie/div-preheader-retained-directive-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-bom] [fixture:
pie/div-preheader-retained-yaml-bare-ls] [fixture:
pie/div-preheader-retained-yaml-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
pie/lex-preheader-retained-directive-bare-ascii] [fixture:
pie/lex-preheader-retained-directive-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-then-directive-ascii]

## Lexical structure

### Ordered rules

Read the converted diagram text defined in
[common.md](../common.md#reading-a-source). From the detection point, at each
unit position try the following rules in order, take the first match, and
restart after it; there is no general longest-match choice. An unreadable
character rejects the whole input. The bare `%%` lines and the whitespace and
line breaks detection passes with them are not read again. The bare lines are
shared Comments; the whitespace and line breaks are trivia. [fixture:
pie/div-preheader-retained-directive-bare-bom] [fixture:
pie/div-preheader-retained-directive-bare-ls] [fixture:
pie/div-preheader-retained-directive-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-bom] [fixture:
pie/div-preheader-retained-yaml-bare-ls] [fixture:
pie/div-preheader-retained-yaml-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
pie/lex-preheader-retained-directive-bare-ascii] [fixture:
pie/lex-preheader-retained-directive-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-then-directive-ascii] [fixture:
pie/div-preheader-bare-ls-blank] [fixture: pie/div-preheader-bare-ps-blank]
[fixture: pie/div-preheader-bare-nbsp-blank] [fixture:
pie/div-preheader-bare-bom-blank] [fixture: pie/div-preheader-bare-vt-blank]
[fixture: pie/div-preheader-bare-ff-blank] [fixture:
pie/div-preheader-bare-u1680-blank] [fixture:
pie/div-preheader-bare-u2003-blank] [fixture:
pie/div-preheader-bare-u202f-blank] [fixture:
pie/div-preheader-bare-u205f-blank] [fixture:
pie/div-preheader-bare-u3000-blank] [fixture:
pie/div-preheader-bare-ls-before-header] [fixture:
pie/div-preheader-bare-bom-before-header] [fixture:
pie/lex-preheader-bare-ascii-blank-control] [fixture:
pie/lex-preheader-ls-without-bare-control] A nonleading `---` block and a
directive found by detection's second scan are read by pie's hidden YAML and
hidden DIRECTIVE rules. Passing detection does not guarantee acceptance: those
rules and their boundaries still apply. [fixture:
pie/lex-preheader-yaml-opening-nbsp] [fixture:
pie/lex-preheader-yaml-opening-bom] [fixture:
pie/lex-preheader-yaml-closing-nbsp] [fixture:
pie/lex-preheader-yaml-closing-u3000] [fixture:
pie/lex-preheader-yaml-after-closing-u3000-line] [fixture:
pie/lex-preheader-yaml-adjacent-fence-tail] [fixture:
pie/lex-preheader-yaml-empty-line-control] [fixture:
pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/lex-hidden-directive-second-detection-scan-glued] [fixture:
pie/review-hidden-directive-in-string] [fixture:
pie/review-hidden-directive-in-block] [fixture: pie/recover-lexer-first]
[fixture: pie/recover-lexer-final] [fixture:
pie/comment-preheader-unclosed-percent-brace] [fixture:
pie/lex-bare-percent-braces-before-header] [fixture:
pie/lex-hidden-comment-before-header]

1. `showData`, with the keyword boundary below.
2. `pie`, with that boundary.
3. `:`.
4. `pie-number`, fraction before integer.
5. `acc-descr-line` or `acc-descr-block`, as one composite match.
6. `acc-title-line`, as one composite match.
7. `title-line`, as one composite match.
8. `string`.
9. `newline`: one line break.
10. Hidden ASCII whitespace.
11. Hidden YAML.
12. Hidden DIRECTIVE.
13. Diagram comment. [fixture: pie/db-all-fields] [fixture:
    pie/review-block-brace-colon-priority] [fixture:
    pie/review-hidden-directive-in-string] [fixture:
    pie/review-hidden-directive-in-block] [fixture: pie/lex-tab] [fixture:
    pie/review-yaml-before-showdata]

### Keyword boundaries

The words `pie` and `showData` are case-sensitive and must be followed
immediately by common whitespace, the end of text, or `%%`, judged on the text
with common directives removed. A directive glued between a keyword and showData
or a label supplies no boundary. A letter, digit, underscore, dash, non-ASCII
letter, colon, hash, single percent, opening brace or quote does not satisfy
this boundary. [fixture: pie/header-letter-suffix] [fixture:
pie/header-digit-suffix] [fixture: pie/header-underscore-suffix] [fixture:
pie/header-dash-suffix] [fixture: pie/header-unicode-suffix] [fixture:
pie/header-colon] [fixture: pie/header-quote-glued] [fixture:
pie/lex-header-hash-boundary] [fixture: pie/lex-header-single-percent-boundary]
[fixture: pie/lex-header-brace-boundary] [fixture: pie/showdata-letter-suffix]
[fixture: pie/review-showdata-digit-suffix] [fixture: pie/showdata-word-suffix]
[fixture: pie/showdata-dash-suffix] [fixture: pie/showdata-unicode-suffix]
[fixture: pie/showdata-quote-glued] [fixture: pie/lex-showdata-colon-glued]
[fixture: pie/lex-showdata-hash-glued] [fixture:
pie/lex-showdata-single-percent-glued] [fixture: pie/lex-showdata-brace-glued]
[fixture: pie/lex-showdata-eof-boundary] [fixture: pie/comment-header-glued]
[fixture: pie/comment-showdata-glued] [fixture:
pie/lex-header-global-directive-glued-showdata] [fixture:
pie/lex-header-global-directive-glued-label] [fixture:
pie/lex-showdata-global-directive-glued-label]

Common whitespace at the boundary is broader than hidden whitespace: NBSP or a
byte order mark can satisfy the boundary yet remain unreadable between units.
Leading common whitespace before the detection point is trivia. [fixture:
pie/lex-preheader-yaml-after-closing-u3000-line] [fixture: pie/lex-header-nbsp]
[fixture: pie/lex-showdata-bom] [fixture: pie/lex-unicode-before-header]
[fixture: pie/lex-bom-before-header]

### Numbers

A `pie-number` is an optional minus followed by either a fraction or an integer.
A fraction has one or more ASCII digits, a dot, and one or more digits; leading
zeroes are allowed. An integer is zero alone or a nonzero digit followed by zero
or more digits. The chosen match cannot end immediately before a dot. [fixture:
pie/number-zero] [fixture: pie/number-negative-zero] [fixture:
pie/number-decimal] [fixture: pie/number-decimal-leading-zero] [fixture:
pie/number-leading-zero] [fixture: pie/number-double-zero] [fixture:
pie/number-range] [fixture: pie/number-dots]

A plus, a separated minus, a leading-dot or trailing-dot fraction, exponent,
hexadecimal number, NaN, Infinity spelling or word suffix is rejected. Invalid
tails can leave a shorter numeric match, but the remaining input still rejects
the diagram. Fractional precision is not limited to two places. [fixture:
pie/number-plus] [fixture: pie/number-negative-space] [fixture:
pie/number-decimal-no-integer] [fixture: pie/number-decimal-no-fraction]
[fixture: pie/number-exponent] [fixture: pie/number-exponent-uppercase]
[fixture: pie/number-hex] [fixture: pie/number-nan] [fixture:
pie/number-infinity] [fixture: pie/number-tail] [fixture: pie/number-decimal]

### Strings

A `string` opens and closes with matching single or double quotes and may be
empty. Between them read any character except the matching quote and backslash,
or a backslash and its next character. That next character must not be a
physical line break, U+2028 or U+2029; an escaped matching quote does not close
the string. A closing quote is required. [fixture: pie/label-single-quote]
[fixture: pie/label-empty] [fixture: pie/review-label-empty-single] [fixture:
pie/label-escaped-quotes] [fixture: pie/label-escaped-newline] [fixture:
pie/review-label-escaped-crlf] [fixture: pie/label-backslash-ls] [fixture:
pie/label-backslash-ps] [fixture: pie/label-unclosed] [fixture:
pie/label-unclosed-single] [fixture: pie/label-escaped-final-quote]

Unescaped line breaks, U+2028 and U+2029 are string content, as are the opposite
quote, percent pairs, apparent YAML blocks and directive-like forms that survive
the common directive scan. The earlier string rule prevents them from becoming
hidden forms. Source whitespace and escape spelling stay in StringLiteral.
[fixture: pie/label-multiline] [fixture: pie/label-cr] [fixture: pie/label-crlf]
[fixture: pie/label-ls] [fixture: pie/label-ps] [fixture:
pie/label-opposite-quote] [fixture: pie/label-punctuation] [fixture:
pie/review-label-hidden-yaml-text] [fixture:
pie/review-hidden-directive-in-string] [fixture: pie/label-whitespace] [fixture:
pie/label-unknown-escapes]

### Composite common forms

The composite common forms below may begin at any unit position, with optional
leading ASCII spaces/tabs. That indentation is outside their written keywords.
`title-line` reads `title` followed by either one ASCII space/tab and all
remaining line text, or nothing. Line text ends before the first `%%` or
physical line end. It may be empty. [fixture: pie/header-title-inline] [fixture:
pie/title-spaces] [fixture: pie/title-comment] [fixture:
pie/review-title-bare-lone-eof] [fixture: pie/comment-title-value-start]
[fixture: pie/lex-title-double-percent-no-gap] [fixture:
pie/lex-title-tab-separator] [fixture: pie/ast-title-tab-null-eof] [fixture:
pie/ast-common-values-directive-only]

`acc-title-line` reads `accTitle`, zero or more ASCII spaces/tabs, a colon, and
the same possibly empty line text. `acc-descr-line` does so with `accDescr`.
Neither value takes text from the next physical line; blank, comment and
directive-only lines do not change that. [fixture: pie/acctitle-spaces]
[fixture: pie/accdescr-spaces] [fixture: pie/acctitle-eof] [fixture:
pie/accdescr-eof] [fixture: pie/title-blank-gap] [fixture:
pie/acctitle-blank-gap] [fixture: pie/accdescr-blank-gap] [fixture:
pie/title-comment-gap] [fixture: pie/acctitle-comment-gap] [fixture:
pie/accdescr-comment-gap] [fixture: pie/title-directive-gap] [fixture:
pie/acctitle-directive-gap] [fixture: pie/accdescr-directive-gap]

These forms have their own component rules, not the pie/showData boundary.
`title2` reads a bare title prefix but fails at its remaining number. With no
required separator, `title#`, `title%` and `title{` reject; a percent pair after
bare title can instead start a comment. An accessibility keyword without its
colon or block opener rejects. Unicode whitespace is not allowed in the colon
gap. [fixture: pie/review-title-digit-suffix] [fixture:
pie/review-acc-title-digit-suffix] [fixture: pie/review-acc-descr-digit-suffix]
[fixture: pie/lex-title-hash-no-gap] [fixture:
pie/lex-title-single-percent-no-gap] [fixture: pie/lex-title-brace-no-gap]
[fixture: pie/lex-title-double-percent-no-gap] [fixture:
pie/lex-acctitle-brace-without-colon] [fixture:
pie/lex-accdescr-hash-without-delimiter] [fixture:
pie/lex-accdescr-single-percent-without-delimiter] [fixture:
pie/lex-accdescr-double-percent-without-delimiter] [fixture:
pie/lex-accdescr-quote-without-delimiter] [fixture:
pie/lex-accdescr-bare-at-eof] [fixture: pie/acctitle-unicode-colon] [fixture:
pie/accdescr-unicode-colon]

The block alternative reads `accDescr`, zero or more common whitespace
characters, `{`, and any characters through the first `}`. The gap before the
brace may cross blank/comment/directive lines and Unicode separators. Braces do
not nest; quotes and backslashes do not protect the closer. A further opening
brace is ordinary content. An unclosed block rejects. A colon chooses the line
alternative even when its value starts with `{`. [fixture:
pie/accdescr-block-gap] [fixture: pie/review-accdescr-block-blank-before-opener]
[fixture: pie/accdescr-block-comment-gap] [fixture:
pie/accdescr-block-directive-gap] [fixture:
pie/review-block-unicode-opener-separators] [fixture: pie/accdescr-block-nested]
[fixture: pie/accdescr-block-quote-brace] [fixture:
pie/accdescr-block-escaped-brace] [fixture:
pie/lex-block-open-brace-content-single-close] [fixture:
pie/accdescr-block-unclosed] [fixture: pie/review-block-brace-colon-priority]

### Hidden ASCII whitespace

After the earlier rules, skip a maximal nonempty run of ASCII spaces/tabs. They
remain value text where a composite form or string has already read them. LF is
a visible newline; common CR/CRLF conversion makes each one line break. LS/PS
and other Unicode whitespace are not hidden separators, including at original
EOF before the appended LF. They can still be string/common-value content or
common leading trivia. [fixture: pie/lex-tab] [fixture: pie/lex-tab-blank-line]
[fixture: pie/label-whitespace] [fixture: pie/lex-cr] [fixture: pie/lex-crlf]
[fixture: pie/lex-ls-line] [fixture: pie/lex-ps-line] [fixture:
pie/lex-unicode-eof] [fixture: pie/lex-nbsp] [fixture: pie/lex-ideographic]
[fixture: pie/lex-bom] [fixture: pie/lex-unicode-before-header] [fixture:
pie/title-line-separators] [fixture: pie/accdescr-block-line-separators]

### Hidden YAML

At a unit position, `---`, zero or more ASCII spaces/tabs and LF open hidden
YAML; the opener need not start a physical line. Try the body-present form
first: read as few arbitrary characters as possible, including LF, LS and PS,
through a subsequent LF followed by an unindented `---` whose next character is
LF, common whitespace or end of text. Only when no body-present match works, try
an empty body whose closer immediately follows the opening LF. No YAML content
validation occurs. [fixture: pie/lex-yaml-immediate-fence-before-later-closer]
[fixture: pie/lex-preheader-yaml-opening-nbsp] [fixture:
pie/lex-preheader-yaml-opening-bom] [fixture:
pie/lex-preheader-yaml-empty-line-control] [fixture:
pie/frontmatter-between-section-parts] [fixture: pie/review-yaml-opening-tabs]
[fixture: pie/review-yaml-hidden-empty] [fixture:
pie/review-yaml-hidden-invalid] [fixture:
pie/review-yaml-closing-space-boundary] [fixture:
pie/lex-yaml-body-unicode-separators]

This priority can make the first following fence part of the body: three
adjacent fence lines form one block, with the middle fence in its body. The same
choice applies in a section gap and in the retained nonleading block before the
header. [fixture: pie/lex-yaml-three-adjacent-fences] [fixture:
pie/lex-yaml-three-fences-before-value] [fixture:
pie/lex-nonleading-yaml-three-adjacent-fences] What looks like two empty blocks
can leave an unmatched fence: the first block can contain an apparent section,
leaving `x` and the final `---` unreadable, so the input rejects. [fixture:
pie/lex-yaml-apparent-empty-pairs-unmatched-fence] Two nonempty blocks remain
distinct when the first body has a qualifying closer. [fixture:
pie/lex-yaml-before-colon-two-blocks]

Consume an LF immediately after the closing fence; another whitespace boundary
is only looked at. [fixture: pie/lex-preheader-yaml-closing-nbsp] [fixture:
pie/lex-preheader-yaml-closing-u3000] [fixture:
pie/lex-preheader-yaml-after-closing-u3000-line] [fixture:
pie/lex-preheader-yaml-adjacent-fence-tail] A nonqualifying `---x` remains body
if a later fence qualifies. An indented closer, Unicode padding in the opener,
or missing closer rejects. A YAML-looking form inside an already-started string,
title or description block is its content instead. [fixture:
pie/lex-yaml-closer-suffix-skip-later] [fixture:
pie/review-yaml-closing-tab-eof] [fixture: pie/review-yaml-closing-indent]
[fixture: pie/lex-yaml-opening-unicode-gap] [fixture: pie/yaml-unclosed-in-body]
[fixture: pie/review-label-hidden-yaml-text] [fixture:
pie/review-block-hidden-yaml-text] [fixture: pie/lex-yaml-in-title-line]
[fixture: pie/lex-yaml-closing-ls-boundary]

Retain each recognized block as PieIgnoredText with kind `yaml-block`. It may
precede the header, lie before/after showData, occupy a section gap, or follow a
value before EOL. Between two numbers it leaves two numbers; before a digit it
cannot repair an unreadable minus. [fixture: pie/frontmatter-nonleading-comment]
[fixture: gitgraph/lex-yaml-after-comment] [fixture:
pie/review-yaml-before-showdata] [fixture:
pie/lex-yaml-after-showdata-before-first-section] [fixture:
pie/review-yaml-between-label-colon] [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/gram-block-eof-hidden-yaml]
[fixture: pie/lex-yaml-before-colon-two-blocks] [fixture:
pie/lex-yaml-inside-integer] [fixture:
pie/lex-yaml-between-numeric-sign-and-digit]

### Hidden DIRECTIVE

After common directive removal, at a unit position read `%%{` and arbitrary
text, including LF, LS and PS, through the earliest `}%%` followed by a line
break, common whitespace or end of text. Empty and punctuation-only bodies are
allowed. Consume an immediately following LF; other whitespace is only looked
at. These are PieIgnoredText with kind `directive`, not common Directive
records. [fixture: pie/review-directive-empty-body] [fixture:
pie/review-directive-punctuation-body] [fixture:
pie/review-directive-hidden-crlf] [fixture:
pie/review-directive-hidden-space-boundary] [fixture:
pie/review-directive-hidden-eof] [fixture: pie/lex-hidden-before-colon-space]
[fixture: pie/lex-hidden-before-colon-lf] [fixture:
pie/review-hidden-directive-ls-boundary] [fixture:
pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/lex-hidden-directive-second-detection-scan-glued] [fixture:
pie/lex-hidden-body-unicode-separators] [fixture:
pie/lex-hidden-directive-lone-cr] [fixture:
pie/lex-hidden-directive-ps-boundary]

A closing spelling followed by a digit does not qualify; a later closer may
finish the form. Without a qualifying closer the comment rule can consume the
physical line instead, including the digit. Thus a missing value can reject
while the same fallback after a complete value allows the next line. The earlier
string/block rules still win inside their content. [fixture:
pie/lex-hidden-multiple-closers] [fixture:
pie/review-directive-hidden-word-boundary] [fixture:
pie/review-directive-hidden-unclosed] [fixture:
pie/review-directive-open-no-type] [fixture:
pie/lex-hidden-comment-fallback-no-boundary] [fixture:
pie/review-hidden-directive-in-string] [fixture:
pie/review-hidden-directive-in-block]

### Comments

The last rule reads `%%` with optional preceding ASCII spaces/tabs, then the
maximal text before the next physical line break. Its mark is `%%`, its value is
the text after the mark, and the terminating LF is not consumed. It can be
inline, bare, triple-percent or a failed directive-like form. A single percent
does not start this comment. [fixture: pie/comment-section-glued] [fixture:
pie/comment-section-eof] [fixture: pie/review-comment-bare-header-eof] [fixture:
pie/lex-native-triple-percent-inline] [fixture:
pie/review-directive-open-no-type] [fixture: pie/comment-single-percent]

LS/PS do not end a native comment. Common comment regions can cut it and join
its continuation to later physical-line text. Percent pairs in strings are
content; in line common values they end the value; inside a description block
they are content up to its first closing brace. Common comment-only lines are
still removed inside all these values. [fixture: pie/comment-ls] [fixture:
pie/comment-ps] [fixture: pie/lex-comment-ls-region-bridge] [fixture:
pie/label-punctuation] [fixture: pie/title-comment] [fixture:
pie/acctitle-comment] [fixture: pie/accdescr-comment] [fixture:
pie/accdescr-block-comment-lines] [fixture: pie/comment-label-line] [fixture:
pie/comment-label-single-line] [fixture:
pie/lex-common-values-comment-region-ls]

### Global trivia inside values

Common directives and selected semicolons can lie inside strings, common-value
text and ignored-form text; their written values leave those trivia out. This
includes split YAML fences and hidden-DIRECTIVE openers or closers. Common
comment regions also apply inside ignored YAML and hidden DIRECTIVE. Recognition
of these hidden forms is not a global removal pass. [fixture:
pie/directive-label-middle] [fixture: pie/directive-block-middle] [fixture:
pie/directive-title-middle] [fixture: pie/review-style-directive-rejoin-label]
[fixture: pie/lex-yaml-opener-global-directive] [fixture:
pie/lex-yaml-closer-global-directive] [fixture:
pie/lex-hidden-opener-global-directive] [fixture:
pie/lex-yaml-opener-selected-semicolon] [fixture:
pie/lex-hidden-body-global-directive] [fixture:
pie/lex-yaml-body-directive-content] [fixture:
pie/lex-yaml-body-comment-content] [fixture:
pie/lex-global-directive-before-quote-escape] [fixture:
pie/lex-hidden-global-comment-region] [fixture:
pie/lex-hidden-opener-selected-semicolon] [fixture:
pie/lex-hidden-closer-selected-semicolon] [fixture:
pie/lex-hidden-closer-global-directive]

A directive or selected semicolon inside a fixed keyword or number follows the
existing atomic-boundary divergences. Between complete components it is allowed,
including accTitle and its colon or accDescr and its brace. Mermaid's global
removal joins digits in such differing inputs; hidden forms at unit boundaries
do not join them. A visible LF in a section gap is not erased by a later
directive-only line. [fixture: pie/div-directive-in-header] [fixture:
pie/div-directive-in-showdata] [fixture: pie/div-directive-in-title-keyword]
[fixture: pie/div-directive-in-acctitle-keyword] [fixture:
pie/div-directive-in-accdescr-keyword] [fixture: pie/div-directive-number]
[fixture: pie/review-directive-acc-title-colon] [fixture:
pie/review-directive-acc-descr-block-opener] [fixture:
pie/review-directive-number-line-gap] [fixture:
pie/review-directive-label-colon-line-gap] [fixture:
pie/lex-hidden-before-colon-lf] [fixture: pie/div-atomic-semicolon-number]
[fixture: pie/div-directive-in-accdescr-block-keyword]

The common style/classDef line rule selects only the last qualifying semicolon
per trigger before entity encoding. It also acts inside labels and all common
values; see the [pie summary](../../../tests/docs/db-summaries.md#pie) for
converted values. Case, whitespace before the hash, separate line segments and
both triggers retain their common distinctions. [fixture:
pie/style-label-trigger] [fixture: pie/style-label-two-semicolons] [fixture:
pie/style-label-three-semicolons] [fixture: pie/review-style-title-two]
[fixture: pie/review-style-acctitle-two] [fixture:
pie/review-style-accdescr-two] [fixture: pie/review-style-block-two] [fixture:
pie/style-label-upper] [fixture: pie/style-label-space] [fixture:
pie/review-style-ls-boundaries] [fixture: pie/review-style-ps-boundaries]
[fixture: pie/review-style-both-triggers-label] [fixture: pie/entity-all-texts]

## Grammar

```text
diagram = newline* "pie" "showData"? body-item* end-of-text
body-item = section-statement | common-statement | newline
section-statement = string ":" pie-number eol
common-statement = title-statement | acc-title-statement
                 | acc-descr-statement | acc-descr-block-statement
title-statement = title-line eol
acc-title-statement = acc-title-line eol
acc-descr-statement = acc-descr-line eol
acc-descr-block-statement = acc-descr-block eol
eol = newline+ | end-of-text
```

The grammar uses [common notation](../common.md#notation), over the visible
units above. Hidden forms and comments have their own retention rules and supply
no visible separator. The body may be empty, contain blank lines, and interleave
sections and common statements. A first statement may follow the header on its
line after a valid keyword boundary. [fixture: pie/header-only] [fixture:
pie/lex-tab-blank-line] [fixture: pie/gram-common-between-sections] [fixture:
pie/header-section-inline] [fixture: pie/header-title-inline]

showData occurs only as the next visible unit after pie, once. A newline,
including one before a comment/directive-only line, ends that opportunity;
hidden forms can instead consume intervening physical line breaks. An additional
visible LF still prevents it. [fixture: pie/showdata] [fixture:
pie/showdata-repeated] [fixture: pie/showdata-next-line] [fixture:
pie/review-showdata-comment-gap] [fixture: pie/review-showdata-directive-gap]
[fixture: pie/review-hidden-directive-before-showdata] [fixture:
pie/review-yaml-before-showdata] [fixture: pie/lex-hidden-before-showdata-glued]
[fixture: pie/lex-hidden-before-showdata-extra-lf] [fixture:
pie/lex-hidden-directive-with-second-hidden-token]

A section requires a string, colon, number and EOL. Missing or doubled
components, bare labels, visible newlines inside those components, and adjacent
sections on one line reject. An empty label with colon and number is a real
section; an empty string alone is incomplete. [fixture: pie/gram-missing-colon]
[fixture: pie/gram-missing-number] [fixture: pie/gram-two-colons] [fixture:
pie/gram-bare-label] [fixture: pie/gram-newline-before-colon] [fixture:
pie/gram-newline-before-number] [fixture: pie/gram-adjacent-sections] [fixture:
pie/label-empty] [fixture: pie/lex-empty-label-alone] [fixture:
pie/lex-empty-label-duplicate]

Every completed common statement also requires EOL, including an empty
description block. A semicolon is not a statement separator; line values can
read semicolons and apparent later statements as text. A second header or a
misplaced showData rejects. Lexical or grammatical failure anywhere rejects the
whole input, even if a valid prefix or a recoverable complete section exists.
[fixture: pie/gram-block-next-inline] [fixture:
pie/lex-block-empty-followed-inline] [fixture: pie/header-spaced-semicolon]
[fixture: pie/lex-section-semicolon] [fixture: pie/title-semicolon] [fixture:
pie/acctitle-semicolons] [fixture: pie/gram-common-same-line] [fixture:
pie/header-twice] [fixture: pie/review-showdata-after-section] [fixture:
pie/recover-lexer-first] [fixture: pie/recover-parser-extra-token] [fixture:
pie/recover-parser-missing-number] [fixture: pie/recover-lexer-after-parser]

The end of the source supplies the common appended LF, without adding written
text. Hidden YAML or DIRECTIVE can consume it, leaving EOL satisfied by
end-of-text. Before a later statement, consuming the only separating LF instead
rejects; a spare LF restores EOL. This applies after sections and closed
description blocks as well as line common values. [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/gram-block-eof-hidden-yaml]
[fixture: pie/review-directive-hidden-eof] [fixture:
pie/review-hidden-directive-title-eof] [fixture:
pie/review-hidden-directive-acctitle-eof] [fixture:
pie/review-hidden-directive-accdescr-eof] [fixture:
pie/review-hidden-directive-block-eof] [fixture:
pie/review-hidden-directive-after-section] [fixture:
pie/review-hidden-directive-after-title] [fixture:
pie/review-hidden-directive-after-acctitle] [fixture:
pie/review-hidden-directive-after-accdescr] [fixture:
pie/review-hidden-directive-after-block] [fixture:
pie/lex-yaml-after-value-before-eol] [fixture:
pie/lex-yaml-after-value-extra-eol] [fixture:
pie/lex-yaml-after-block-before-eol] [fixture: pie/lex-hidden-eof-extra-lf]
[fixture: pie/lex-hidden-after-title-with-space-boundary] [fixture:
pie/lex-hidden-after-title-before-comment] [fixture:
pie/lex-yaml-after-showdata-eof]

### Rules and nodes

| Rule                      | Node                           |
| ------------------------- | ------------------------------ |
| diagram                   | PieDiagram                     |
| section-statement         | PieSectionStatement            |
| title-statement           | PieTitleStatement              |
| acc-title-statement       | PieAccTitleStatement           |
| acc-descr-statement       | PieAccDescrStatement           |
| acc-descr-block-statement | PieAccDescrBlockStatement      |
| string / pie-number       | StringLiteral / NumericLiteral |
| written common value      | PieLiteral                     |
| retained hidden form      | PieIgnoredText                 |

The fixtures illustrate the statement and value forms in the table. [fixture:
pie/db-all-fields] [fixture: pie/frontmatter-between-section-parts] [fixture:
pie/review-hidden-directive-before-showdata]

### Rejection outside the grammar

Reject when any section value, converted to a double, is less than zero.
Validate even duplicate labels. Negative infinity rejects, but negative zero and
a negative decimal rounded to negative zero do not. This is the condition in
[addSection()](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/pie/pieDb.ts#L36-L46),
not exact-real negativity of the written decimal. [fixture: pie/number-negative]
[fixture: pie/db-duplicate-negative] [fixture: pie/number-negative-overflow]
[fixture: pie/number-negative-zero] [fixture: pie/number-negative-decimal-zero]
[fixture: pie/review-number-negative-underflow-final]

### Db normalization

Only converted-number negativity decides acceptance here, as stated in
[Rejection outside the grammar](#rejection-outside-the-grammar). The AST keeps
the authored text; the remaining conversions and stored values are defined in
the [pie Db summary](../../../tests/docs/db-summaries.md#pie). [fixture:
pie/number-negative] [fixture: pie/number-negative-zero] [fixture:
pie/review-number-negative-underflow-final] [fixture: pie/label-unknown-escapes]
[fixture: pie/title-spaces]

## Known divergences

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
A global directive strictly inside a fixed keyword or number is rejected here
although Mermaid joins its parts. Complete component boundaries and written text
remain accepted. This rule introduces no acceptance of a Mermaid-rejected input.
[fixture: pie/div-directive-in-header] [fixture: pie/div-directive-in-showdata]
[fixture: pie/div-directive-in-title-keyword] [fixture:
pie/div-directive-in-acctitle-keyword] [fixture:
pie/div-directive-in-accdescr-keyword] [fixture: pie/div-directive-number]
[fixture: pie/div-review-directive-number-sign] [fixture:
pie/div-review-directive-number-decimal] [fixture:
pie/review-directive-acc-title-colon] [fixture:
pie/div-directive-in-accdescr-block-keyword]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
A selected semicolon strictly inside a fixed keyword or number has the same
rejection rule. Text and hidden-form interiors can retain it as common trivia.
The difference is only rejection here of Mermaid-accepted joined atoms.
[fixture: pie/div-atomic-semicolon-number] [fixture:
pie/div-selected-semicolon-title-keyword] [fixture:
pie/div-selected-semicolon-showdata] [fixture:
pie/div-selected-semicolon-acctitle] [fixture:
pie/div-selected-semicolon-accdescr] [fixture:
pie/div-selected-semicolon-block-keyword] [fixture:
pie/lex-yaml-opener-selected-semicolon]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md).**
The common HTML scan excludes real frontmatter. A tag crossing its fence can
make Mermaid accept a label rejected here; a title with a tag closed inside
frontmatter uses the same converted value in both readings. [fixture:
pie/frontmatter-html] [fixture: pie/div-review-frontmatter-html-cross-label]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).**
Malformed leading frontmatter content is accepted as opaque text here although
Mermaid can reject it. This includes YAML made invalid by HTML attribute-quote
conversion. The reverse direction does not occur under this rule. Malformed
hidden YAML is already accepted by both, so has no divergence mark. [fixture:
pie/div-review-yaml-leading-invalid] [fixture: pie/review-yaml-hidden-invalid]
[fixture: pie/div-review-frontmatter-html-invalid-yaml]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).** The pie
header selects pie here despite one of the four unanchored C4 words remaining in
detection's text inside a label, title, accessibility line value, description
block or body YAML, or in an EOF comment after a section or on the header line.
Mermaid instead selects C4 and rejects these otherwise valid pie inputs. This
rule only adds acceptance of those pie inputs. [fixture:
pie/div-detect-c4-label] [fixture: pie/div-detect-c4-title] [fixture:
pie/div-yaml-body-c4-hidden] [fixture: pie/div-detect-c4-acctitle] [fixture:
pie/div-detect-c4-accdescr-line] [fixture: pie/div-detect-c4-accdescr-block]
[fixture: pie/div-detect-c4-section-comment-eof] [fixture:
pie/div-detect-c4-header-comment-eof]

In the label `C4Context %% C4Container`, a final LF makes detection leave out
the inline percent suffix and select pie, while the label keeps its entire
written text. At EOF the suffix remains in detection's text, so Mermaid selects
C4 and rejects; this specification accepts the same pie label under the existing
reverse criterion. `C4Context` alone inside a label does not select C4.
[fixture: pie/lex-c4-inline-percent-with-lf] [fixture:
pie/div-c4-inline-percent-eof] [fixture: pie/lex-c4context-label]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
A common Comment holds the bare line and following common whitespace is trivia.
After common line-ending conversion, this specification accepts every common
whitespace character left between that line and the header, while Mermaid
rejects any other than ASCII space, tab or LF, whether on a whitespace-only line
or immediately before the header. This uses the existing reverse pipeline-order
criterion and rejects no input Mermaid accepts. ASCII space/tab lines and an LS
line without the bare line agree in both readings. [fixture:
pie/div-preheader-bare-ls-blank] [fixture: pie/div-preheader-bare-ps-blank]
[fixture: pie/div-preheader-bare-nbsp-blank] [fixture:
pie/div-preheader-bare-bom-blank] [fixture:
pie/lex-preheader-bare-ascii-blank-control] [fixture:
pie/lex-preheader-ls-without-bare-control] [fixture:
pie/div-preheader-bare-vt-blank] [fixture: pie/div-preheader-bare-ff-blank]
[fixture: pie/div-preheader-bare-u1680-blank] [fixture:
pie/div-preheader-bare-u2003-blank] [fixture:
pie/div-preheader-bare-u202f-blank] [fixture:
pie/div-preheader-bare-u205f-blank] [fixture:
pie/div-preheader-bare-u3000-blank] [fixture:
pie/div-preheader-bare-ls-before-header] [fixture:
pie/div-preheader-bare-bom-before-header]

Hidden YAML and hidden DIRECTIVE need no new divergence: PieIgnoredText can hold
them. Empty labels and description blocks are real syntax, so
tokenless-empty-forms does not apply. Native comments retain their terminating
LF and preceding character; the comment-taking divergences have no differing
case here. [fixture: pie/frontmatter-between-section-parts] [fixture:
pie/review-directive-empty-body] [fixture: pie/label-empty] [fixture:
pie/review-accdescr-empty-block-first] [fixture: pie/comment-section-glued]
[fixture: pie/review-comment-bare-header-eof] [fixture:
pie/lex-bare-percent-braces-before-header]
