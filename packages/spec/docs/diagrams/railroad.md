# Railroad

Japanese version: [railroad.ja.md](./railroad.ja.md)

This document defines four railroad dialects. The
[source tree](../ast/railroad.md) retains authored syntax; the
[tests summary](../../../tests/docs/db-summaries.md#railroad) defines derived Db
values. Read the section for the selected dialect together with the shared
metadata, hidden-form and boundary rules below. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree] [fixture:
railroad/peg-gram-written-tree]

## Detection

Entries 32–35 of [detection.md](../detection.md) compare the following prefixes
case-insensitively, without a suffix boundary. Detection does not establish
acceptance: each grammar requires its exact lowercase header and the header
boundary defined below. [fixture: railroad/ir-header-only] [fixture:
railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture:
railroad/peg-header-only] [fixture: railroad/ir-header-upper] [fixture:
railroad/ebnf-header-upper] [fixture: railroad/abnf-header-upper] [fixture:
railroad/peg-header-upper]

| Dialect / source                       | Header               | Root.diagramType                                      |
| -------------------------------------- | -------------------- | ----------------------------------------------------- |
| IR, [railroadDetector.ts][ir-detector] | `railroad-beta`      | `railroad` [fixture: railroad/ir-header-inline]       |
| EBNF, [ebnfDetector.ts][ebnf-detector] | `railroad-ebnf-beta` | `railroadEbnf` [fixture: railroad/ebnf-header-inline] |
| ABNF, [abnfDetector.ts][abnf-detector] | `railroad-abnf-beta` | `railroadAbnf` [fixture: railroad/abnf-header-inline] |
| PEG, [pegDetector.ts][peg-detector]    | `railroad-peg-beta`  | `railroadPeg` [fixture: railroad/peg-header-inline]   |

Apply [common preprocessing](../common.md#reading-a-source), including real
leading frontmatter, global directives, comment regions, leading whitespace,
line conversion, HTML attribute quotes, entities and selected semicolons. Real
frontmatter is a shared Frontmatter record; a later retained block is diagram
text. The earlier C4 detector follows the shared header-selection divergence
below. [fixture: railroad/ir-frontmatter-title-only] [fixture:
railroad/ebnf-frontmatter-title-only] [fixture:
railroad/abnf-frontmatter-title-only] [fixture:
railroad/peg-frontmatter-title-only] [fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-entity-texts] [fixture: railroad/ir-style-fields]
[fixture: railroad/ir-c4-container-terminal]

At the detection point, pass at most one retained block with the
[common frontmatter shape](../common.md#frontmatter), before bare percent-pair
lines and the second directive scan. It still must match native hidden-yaml,
belongs to RailroadDiagram.textBeforeHeader and applies no YAML properties. Real
frontmatter may precede this separate block. [fixture:
railroad/ir-prefix-yaml-no-bare] [fixture: railroad/ebnf-retained-leading]
[fixture: railroad/abnf-retained-leading] [fixture:
railroad/peg-retained-leading] [fixture:
railroad/ir-detect-block-after-frontmatter] [fixture:
railroad/ebnf-frontmatter-retained] [fixture:
railroad/abnf-frontmatter-retained] [fixture: railroad/peg-frontmatter-retained]

Two adjacent fences without a body line or a later closer, a missing closer,
mismatched indentation, four dashes, closing-fence suffix text or a closer
without a following line break stop the skip. Leading trimming can remove only
the opening indentation. A second block, a block after a passed bare line or one
after a second-scan directive is not passed. [fixture:
railroad/ir-detect-block-after-directive] [fixture:
railroad/ir-retained-no-closer] [fixture: railroad/ir-retained-mismatch-indent]
[fixture: railroad/ir-detect-retained-four-dashes] [fixture:
railroad/ir-detect-retained-close-suffix] [fixture:
railroad/ir-retained-close-only-eof] [fixture: railroad/ir-retained-close-no-lf]
[fixture: railroad/ir-retained-leading-indent-trim] [fixture:
railroad/ir-retained-two-valid-blocks] [fixture:
railroad/ir-prefix-yaml-between-bare] [fixture:
railroad/ir-secondscan-before-yaml-real] [fixture:
railroad/ebnf-secondscan-before-yaml-real] [fixture:
railroad/abnf-secondscan-before-yaml-real] [fixture:
railroad/peg-secondscan-before-yaml-real]

A directive formed only by detection’s second scan remains diagram text and is
read as native hidden-directive in textBeforeHeader. In `%%{%%{wrap}%%wrap}%%`,
the inner source directive is shared trivia and the outer retained form is one
ignored-text node. Multiple retained forms stay separate. Gluing the header to
the native closer rejects. [fixture: railroad/ir-secondscan-real] [fixture:
railroad/ebnf-secondscan-real] [fixture: railroad/abnf-secondscan-real]
[fixture: railroad/peg-secondscan-real] [fixture:
railroad/ir-secondscan-multiline] [fixture: railroad/ir-two-secondscans]
[fixture: railroad/ir-secondscan-glued]

Retained YAML followed by a second-scan directive is readable in all four
dialects; reversing that order fails detection. Read retained forms from the
detection point, not just from the reached header. [fixture:
railroad/ir-yaml-before-secondscan-real] [fixture:
railroad/ebnf-yaml-before-secondscan-real] [fixture:
railroad/abnf-yaml-before-secondscan-real] [fixture:
railroad/peg-yaml-before-secondscan-real] [fixture:
railroad/ir-secondscan-before-yaml-real] [fixture:
railroad/ebnf-secondscan-before-yaml-real] [fixture:
railroad/abnf-secondscan-before-yaml-real] [fixture:
railroad/peg-secondscan-before-yaml-real]

Passed bare percent-pair lines, including nonword percent-brace forms, are
shared Comments with mark `%%`. Their accompanying passed whitespace and line
breaks are trivia and are not read again, also before or between retained forms.
A leading `%%{!}%%` is such a passed bare line, unlike a genuine second-scan
directive. [fixture: railroad/ir-prefix-retained-directive] [fixture:
railroad/ebnf-prefix-retained-directive] [fixture:
railroad/ebnf-directive-bare-unicode] [fixture:
railroad/abnf-prefix-retained-directive] [fixture:
railroad/abnf-directive-bare-unicode] [fixture:
railroad/peg-prefix-retained-directive] [fixture:
railroad/peg-directive-bare-unicode] [fixture:
railroad/ir-bare-before-secondscan] [fixture:
railroad/ir-secondscan-between-bares] [fixture:
railroad/ir-secondscan-between-bares-unicode] [fixture:
railroad/ir-retained-bare-secondscan-unicode]

Passed Unicode trivia can therefore be accepted here where Mermaid’s native
lexer rejects it. Without a passed bare line, the same later whitespace stays
native text and rejects; ASCII space/tab controls accept. Retained forms always
retain their own native closing boundary. [fixture: railroad/ir-bare-nbsp]
[fixture: railroad/ebnf-retained-before-bare-unicode] [fixture:
railroad/abnf-retained-before-bare-unicode] [fixture:
railroad/peg-retained-before-bare-unicode] [fixture:
railroad/ir-yaml-unicode-no-bare] [fixture:
railroad/ebnf-retained-unicode-no-bare] [fixture:
railroad/abnf-retained-unicode-no-bare] [fixture:
railroad/peg-retained-unicode-no-bare] [fixture:
railroad/ir-prefix-yaml-before-bare] [fixture:
railroad/ebnf-retained-ascii-control] [fixture:
railroad/abnf-retained-ascii-control] [fixture:
railroad/peg-retained-ascii-control] [fixture:
railroad/ir-secondscan-no-bare-unicode]

## Lexical structure

### Shared scanning and header boundaries

Each grammar imports no common grammar: [railroad.langium][ir-lex],
[railroad-ebnf.langium][ebnf-lex], [railroad-abnf.langium][abnf-lex] and
[railroad-peg.langium][peg-lex]. At each unit start, take the first applicable
rule in that dialect’s order below, then restart after it. Only its explicit
longer alternative can replace an earlier match with a longer one; there is no
general longest-match rule. [fixture: railroad/ir-keywords-long-rule-name]
[fixture: railroad/ir-lex-name-nonascii] [fixture:
railroad/ebnf-postfix-special-priority] [fixture:
railroad/abnf-comment-empty-line] [fixture: railroad/peg-comment-in-literal]

The effective orders follow each [IR module.ts][ir-module], [EBNF
module.ts][ebnf-module], [ABNF module.ts][abnf-module] and [PEG
module.ts][peg-module] through its token builder and
[AbstractMermaidTokenBuilder][common-builder]. Their only custom keyword is
their header. It must end immediately before `%%`, common Notation whitespace or
EOF; the boundary is not consumed. Keywords otherwise use exact case. [fixture:
railroad/ir-header-letter] [fixture: railroad/ebnf-header-word] [fixture:
railroad/abnf-header-dash] [fixture: railroad/peg-header-unicode] [fixture:
railroad/ir-keyword-optional-upper]

Native padding is a nonempty maximal run of ASCII space, tab, CR or LF. There is
no visible EOL unit, and a physical newline is not a rule terminator. Other
Notation whitespace is not a native gap even when it satisfies the header or
hidden closer’s boundary. Common leading and detection-passed trivia are
separate rules. [fixture: railroad/ir-space-tabs] [fixture:
railroad/ir-line-crlf] [fixture: railroad/ebnf-line-cr] [fixture:
railroad/abnf-line-crlf] [fixture: railroad/peg-line-cr] [fixture:
railroad/ir-line-ls-gap] [fixture: railroad/ebnf-ls-gap] [fixture:
railroad/abnf-ps-gap] [fixture: railroad/peg-ls-gap] [fixture:
railroad/ir-native-close-boundary-nbsp] [fixture: railroad/ir-space-bom-leading]

Judge header boundaries after global directive and selected-semicolon removal. A
directive followed by a space before the next rule leaves a valid boundary in
each dialect; removing it without that space can join the header and rule name
and reject. The appended LF at EOF never becomes authored content. [fixture:
railroad/ir-directive-header-glued] [fixture:
railroad/ebnf-header-global-boundary] [fixture:
railroad/abnf-header-global-boundary] [fixture:
railroad/peg-header-global-boundary] [fixture:
railroad/ir-header-global-space-control] [fixture:
railroad/ebnf-header-global-space-control] [fixture:
railroad/abnf-header-global-space-control] [fixture:
railroad/peg-header-global-space-control] [fixture: railroad/ir-header-only]
[fixture: railroad/ebnf-header-only] [fixture: railroad/abnf-header-only]
[fixture: railroad/peg-header-only]

### IR units

IR tries its header first, then the constructors `nonterminal`, `zeroOrMore`,
`oneOrMore`, `sequence`, `optional`, `terminal`, `special`, `choice`, then
`= ; ( , )`, metadata, ir-name, ir-string, native padding, hidden-yaml,
hidden-directive, native-percent-comment and C-comment, in that order. The
header and constructors have ir-name as their longer alternative; other
punctuation has none. [fixture: railroad/ir-db-all-fields] [fixture:
railroad/ir-keywords-rule-name] [fixture: railroad/ir-keywords-long-rule-name]
[fixture: railroad/ir-keywords-all-calls] [fixture:
railroad/ir-native-ownership]

An ir-name starts with an ASCII letter or underscore and continues with word
characters or hyphens, taking as many as possible. A constructor prefix followed
by more name characters is a name; an exact constructor cannot be a rule name.
The earlier metadata title prefix still takes `title` from a longer name, as
described below. [fixture: railroad/ir-keywords-long-rule-name] [fixture:
railroad/ir-keywords-rule-name] [fixture: railroad/ir-db-prototype-names]
[fixture: railroad/ir-name-title-prefix-first] [fixture:
railroad/ir-name-title-prefix-later]

An ir-string uses matching single or double quotes. It may be empty and may
contain physical line breaks. Read nonquote, nonbackslash characters, or a
backslash and one following character, until the matching unescaped quote. The
character after a backslash cannot be CR, LF, U+2028 or U+2029. A missing quote
rejects; there are no number units in IR. [fixture:
railroad/ir-db-empty-strings] [fixture: railroad/ir-lex-string-conversion]
[fixture: railroad/ir-line-string-values] [fixture:
railroad/ir-string-escaped-lf] [fixture: railroad/ir-string-backslash-ls]
[fixture: railroad/ir-lex-string-open-double] [fixture:
railroad/ir-lex-string-open-single] [fixture: railroad/ir-error-bare-string]

### EBNF units

EBNF tries its header, `::=`, `= ; | , ( ) [ ] { } ? * + -`, metadata,
ebnf-name, ebnf-string, special-sequence, native padding, hidden-yaml,
hidden-directive, native-percent-comment, C-comment and ISO-comment. Its header
has ebnf-name as a longer alternative; `(` has ISO-comment, `?` has
special-sequence and `-` has hidden-yaml. No other EBNF punctuation has a longer
alternative. [fixture: railroad/ebnf-db-all-fields] [fixture:
railroad/ebnf-comment-iso] [fixture: railroad/ebnf-postfix-special-priority]
[fixture: railroad/ebnf-hidden-yaml-unit-gap] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/ebnf-hidden-yaml-inline]

An ebnf-name starts with an ASCII letter or underscore and continues maximally
with word characters or hyphens. In particular, `A-B` is one name; `A - B` has
an exception operator. Without the required colon or brace, an accTitle/accDescr
prefix can be a name, whereas the earlier title prefix is taken even from a
longer name. [fixture: railroad/ebnf-name-dash] [fixture:
railroad/ebnf-lex-name-nonascii] [fixture: railroad/ebnf-exception-dash-name]
[fixture: railroad/ebnf-reference-acctitle-prefix] [fixture:
railroad/ebnf-reference-title-prefix] [fixture:
railroad/ebnf-reference-accdescr-prefix] [fixture:
railroad/abnf-reference-accdescr-prefix] [fixture:
railroad/peg-reference-accdescr-prefix] [fixture:
railroad/ebnf-name-reserved-title]

An ebnf-string has matching single or double quotes, can be empty and can
contain physical line breaks. A backslash takes exactly the next character
except CR, LF, U+2028 and U+2029; an unescaped matching quote closes it.
Unclosed strings reject. There is no independent EBNF number unit. [fixture:
railroad/ebnf-db-empty-string] [fixture: railroad/ebnf-lex-string-conversion]
[fixture: railroad/ebnf-line-string-values] [fixture:
railroad/ebnf-string-escaped-lf] [fixture: railroad/ebnf-string-backslash-ps]
[fixture: railroad/ebnf-lex-string-open-double] [fixture:
railroad/ebnf-lex-string-open-single]

A special-sequence is `?`, content with no `?` or `;` and at least one
nonwhitespace character, then the first `?`. Its content can include physical
newlines, U+2028 and U+2029; backslashes and quotes do not protect a closer.
Empty or whitespace-only content does not make this unit. A longer
special-sequence wins over postfix `?`, so `"a"? "b"?` is a sequence of a string
and a special sequence, not two optional strings. [fixture:
railroad/ebnf-special-whitespace] [fixture: railroad/ebnf-special-empty]
[fixture: railroad/ebnf-special-whitespace-only] [fixture:
railroad/ebnf-special-semicolon] [fixture: railroad/ebnf-special-adjacent]
[fixture: railroad/ebnf-postfix-special-priority] [fixture:
railroad/ebnf-hidden-directive-special]

### ABNF units

ABNF tries its header, `= ; / ( ) [ ]`, metadata, abnf-name, abnf-string,
abnf-numeric-value, star-repeat, exact-repeat, native padding, hidden-yaml,
hidden-directive, native-percent-comment and semicolon-comment. Its header has
abnf-name as a longer alternative; `;` has semicolon-comment. There are no other
longer alternatives. [fixture: railroad/abnf-db-all-fields] [fixture:
railroad/abnf-comment-empty-line] [fixture: railroad/abnf-comment-before-rule]
[fixture: railroad/abnf-comment-terminator-space] [fixture:
railroad/abnf-native-ownership]

An abnf-name starts with an ASCII letter, then takes as many ASCII letters,
digits or hyphens as possible. Underscores and non-ASCII letters are not name
characters. The earlier metadata prefix rules apply before names, including
references. [fixture: railroad/abnf-name-underscore] [fixture:
railroad/abnf-lex-name-nonascii] [fixture: railroad/abnf-db-prototype-names]
[fixture: railroad/abnf-reference-acctitle-prefix] [fixture:
railroad/abnf-reference-title-prefix] [fixture:
railroad/abnf-name-title-prefix-first]

An abnf-string starts with a double quote and takes every character through the
next double quote; it can be empty and include physical newlines, U+2028 and
U+2029. Backslash is ordinary content and never protects a quote. Single quotes
and a missing closing double quote reject. [fixture:
railroad/abnf-db-empty-string] [fixture: railroad/abnf-line-string-values]
[fixture: railroad/abnf-lex-string-conversion] [fixture:
railroad/abnf-string-backslash-quote] [fixture:
railroad/abnf-error-single-quote] [fixture: railroad/abnf-lex-string-open]

An abnf-numeric-value is `%`, one of `x X d D b B`, a nonempty maximal run of
hexadecimal digits, then zero or more `-` or `.` separators each followed by
another nonempty run of hexadecimal digits. Here hexadecimal digits are ASCII
`0`–`9`, `A`–`F` and `a`–`f`. Do not validate digits against the base letter or
range order. Preserve the whole spelling as text; `%x41Z` is followed by a
separate reference Z. [fixture: railroad/abnf-numval-boundaries] [fixture:
railroad/abnf-numval-empty] [fixture: railroad/abnf-numval-suffix] [fixture:
railroad/abnf-gram-written-tree]

An abnf-count is a maximal nonempty run of ASCII decimal digits. A star-repeat
consists of an optional count, `*`, and an optional count; an exact-repeat
consists of one count. Ordinary whitespace and native hidden forms cannot occur
within either repeat, but can occur between a complete repeat and its primary.
Both counts may be omitted, and leading zeroes are allowed. [fixture:
railroad/abnf-db-all-fields] [fixture: railroad/abnf-db-repeat-leading-zero]
[fixture: railroad/abnf-db-repeat-implicit-optional] [fixture:
railroad/abnf-db-repeat-implicit-zero] [fixture: railroad/abnf-repeat-gap-star]
[fixture: railroad/abnf-native-in-atom] [fixture:
railroad/abnf-hidden-directive-unit-gap] [fixture:
railroad/abnf-hidden-yaml-unit-gap]

### PEG units

PEG tries its header, `<- ; / & ! ? * + ( ) .`, metadata, peg-name, peg-string,
native padding, hidden-yaml, hidden-directive, native-percent-comment and
hash-comment. Only its header has a longer alternative, peg-name. The assignment
arrow is one authored delimiter; prefix and postfix operators are separate
punctuation. [fixture: railroad/peg-db-all-fields] [fixture:
railroad/peg-native-ownership] [fixture: railroad/peg-arrow-hidden] [fixture:
railroad/peg-directive-operator]

A peg-name starts with an ASCII letter or underscore and continues maximally
with word characters or hyphens. Metadata is tried before names, so
title-prefixed references reject but accTitle-prefixed references without a
colon can be names. [fixture: railroad/peg-db-prototype-names] [fixture:
railroad/peg-lex-name-nonascii] [fixture: railroad/peg-reference-title-prefix]
[fixture: railroad/peg-reference-acctitle-prefix] [fixture:
railroad/peg-name-title-prefix-first] [fixture:
railroad/peg-name-title-prefix-later]

A peg-string uses matching single or double quotes, may be empty and may contain
physical newlines, U+2028 and U+2029. An escaped pair is a backslash and exactly
one following character other than CR, LF, U+2028 or U+2029. An unescaped
matching quote closes the string; an unclosed string rejects. PEG has no number
unit. [fixture: railroad/peg-db-empty-string] [fixture:
railroad/peg-line-string-values] [fixture: railroad/peg-lex-string-conversion]
[fixture: railroad/peg-string-escaped-lf] [fixture:
railroad/peg-lex-string-open-double] [fixture:
railroad/peg-lex-string-open-single] [fixture: railroad/peg-string-backslash-ls]
[fixture: railroad/peg-string-backslash-ps]

### Metadata units

All four grammars try title-line, acc-title-line, then acc-descr-line or
acc-descr-block before names. A title-line is `title`, optionally followed by
exactly one ASCII space/tab separator and line content. Content extends to CR/LF
or the first `%%`, whichever comes first. The separator is required for nonempty
title content; bare `title` is still a complete unit and has no word boundary.
[fixture: railroad/ir-common-title-eof] [fixture:
railroad/ir-common-title-comment] [fixture: railroad/ir-common-title-colon]
[fixture: railroad/ir-name-title-prefix-first] [fixture:
railroad/ebnf-name-reserved-title] [fixture:
railroad/abnf-name-title-prefix-first] [fixture:
railroad/peg-name-title-prefix-first] [fixture:
railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes]

An acc-title-line is `accTitle`, zero or more ASCII spaces/tabs, `:`, then
possibly empty content up to CR/LF or the first `%%`. The colon cannot be on the
next line. The colon form of accDescr follows the same rule and wins before its
block form; brace-looking text after a colon is line content. [fixture:
railroad/ir-common-acctitle-eof] [fixture:
railroad/ir-common-acctitle-gap-blank] [fixture:
railroad/ir-common-acctitle-comment] [fixture:
railroad/ir-common-description-eof] [fixture:
railroad/ir-common-description-gap-blank] [fixture:
railroad/ir-common-colon-block-priority] [fixture:
railroad/ir-common-repeat-empty] [fixture: railroad/ebnf-common-repeat-empty]
[fixture: railroad/abnf-common-repeat-empty] [fixture:
railroad/peg-common-repeat-empty]

An acc-descr-block is `accDescr`, zero or more Notation whitespace characters,
`{`, then every character through the first `}`. Its interior may be empty or
span lines and includes U+2028/U+2029. Quotes, backslashes and nested braces do
not protect the first closer; a missing closer rejects. Apply common directive
and comment-region reading before deciding whether a keyword-to-brace gap
matches. [fixture: railroad/ir-common-block-empty-interleaved] [fixture:
railroad/ir-line-block-values] [fixture: railroad/ir-common-block-first-close]
[fixture: railroad/ir-common-block-quoted-close] [fixture:
railroad/ir-common-block-escaped-close] [fixture: railroad/ir-common-block-open]
[fixture: railroad/ir-common-block-gap-comment] [fixture:
railroad/ir-common-block-gap-directive] [fixture:
railroad/ir-common-block-bom-gap] [fixture: railroad/ir-common-block-ls-gap]

Metadata keywords are case-sensitive. A first `titlex = …;` can be an empty
title and a rule named x, while the same prefix after a rule rejects. A space
after title can instead consume the entire apparent rule as title content. These
readings retain the written statements; they are not additional divergences.
[fixture: railroad/ir-common-uppercase] [fixture:
railroad/ir-name-title-prefix-first] [fixture:
railroad/ebnf-name-reserved-title] [fixture:
railroad/abnf-name-title-prefix-first] [fixture:
railroad/peg-name-title-prefix-first] [fixture:
railroad/ir-name-title-prefix-later] [fixture:
railroad/ebnf-name-title-prefix-later] [fixture:
railroad/abnf-name-title-prefix-later] [fixture:
railroad/peg-name-title-prefix-later] [fixture:
railroad/ir-name-title-whole-line] [fixture:
railroad/ebnf-name-title-whole-line] [fixture:
railroad/abnf-name-title-whole-line] [fixture:
railroad/peg-name-title-whole-line]

Metadata values remain authored RailroadLiteral text, even when they look quoted
or contain an unfinished quote. Their original quotes, escape spelling, internal
whitespace and line endings are not decoded or collapsed in the tree. Values
published after [RailroadValueConverter][ir-converter],
[RailroadEbnfValueConverter][ebnf-converter],
[RailroadAbnfValueConverter][abnf-converter] and
[RailroadPegValueConverter][peg-converter] are defined by the tests summary
instead. [fixture: railroad/ir-common-title-open-quote] [fixture:
railroad/ir-common-quoted-title-escape] [fixture:
railroad/ebnf-common-quoted-title-escape] [fixture:
railroad/abnf-common-quoted-title-escape] [fixture:
railroad/peg-common-quoted-title-escape] [fixture:
railroad/ir-common-quotes-whitespace] [fixture:
railroad/ebnf-common-block-values] [fixture: railroad/abnf-common-block-values]
[fixture: railroad/peg-common-block-values]

### Native hidden forms

At a unit boundary, hidden-yaml starts with `---`, zero or more ASCII
spaces/tabs and LF; raw CRLF is equivalent after common line conversion. An
optional body ends with LF before the closing `---`. Try the body-present
alternative first, taking as few body characters as allow a qualifying closer;
only if that fails use the empty-body alternative. Thus adjacent fences can pass
an apparent closer and hide intervening rules when a later closer exists.
[fixture: railroad/ir-hidden-separator-content] [fixture:
railroad/ebnf-hidden-separator-content] [fixture:
railroad/abnf-hidden-separator-content] [fixture:
railroad/peg-hidden-separator-content] [fixture: railroad/ir-hidden-yaml-crlf]
[fixture: railroad/ir-hidden-yaml-cr] [fixture:
railroad/ir-hidden-yaml-adjacent-later] [fixture:
railroad/ebnf-hidden-yaml-adjacent-later] [fixture:
railroad/abnf-hidden-yaml-adjacent-later] [fixture:
railroad/peg-hidden-yaml-adjacent-later] [fixture:
railroad/ir-hidden-yaml-adjacent-no-later] [fixture:
railroad/ir-hidden-yaml-adjacent-eof]

After a hidden-yaml closer, consume one LF if immediately present; otherwise
require Notation whitespace or EOF as a lookahead boundary. The opener need not
begin a physical line. Opening padding is only ASCII space/tab, and an indented
closer is not its own closing fence. Source padding before the opener and any
consumed following LF are outside RailroadIgnoredText. [fixture:
railroad/ir-hidden-yaml-unit-gap] [fixture: railroad/ebnf-hidden-yaml-unit-gap]
[fixture: railroad/abnf-hidden-yaml-unit-gap] [fixture:
railroad/peg-hidden-yaml-unit-gap] [fixture:
railroad/ir-hidden-yaml-closing-space] [fixture:
railroad/ir-native-close-boundary-nbsp] [fixture:
railroad/ir-retained-mismatch-indent] [fixture: railroad/ir-hidden-yaml-eof]
[fixture: railroad/ebnf-hidden-yaml-eof] [fixture:
railroad/abnf-hidden-yaml-eof] [fixture: railroad/peg-hidden-yaml-eof] [fixture:
railroad/ir-hidden-yaml-inline] [fixture: railroad/ebnf-hidden-yaml-inline]
[fixture: railroad/abnf-hidden-yaml-inline] [fixture:
railroad/peg-hidden-yaml-inline]

A hidden-directive starts with `%%{` and ends at the first `}%%` followed by LF,
Notation whitespace or EOF. Consume an immediately following LF; the other
boundary characters are only looked at. A closer without that boundary is passed
in search of a later qualifying closer. If no native directive matches,
native-percent-comment may take its opening line instead. [fixture:
railroad/ir-hidden-directive-closing-space] [fixture:
railroad/ebnf-hidden-directive-closing-space] [fixture:
railroad/abnf-hidden-directive-closing-space] [fixture:
railroad/peg-hidden-directive-closing-space] [fixture:
railroad/ir-native-directive-adjacent] [fixture:
railroad/ir-hidden-directive-no-boundary] [fixture:
railroad/ebnf-native-directive-fallback] [fixture:
railroad/abnf-native-directive-fallback] [fixture:
railroad/peg-native-directive-fallback] [fixture:
railroad/ir-hidden-directive-unclosed]

Hidden YAML and directives may contain physical line breaks, U+2028 and U+2029.
They need not leave a visible LF before the next rule: sole LF, spare LF,
closer-plus-space and EOF forms are valid in every dialect. They remain whole
RailroadIgnoredText nodes in their
[named owners](../ast/railroad.md#gap-ownership), with consumed following LF
outside their ranges. [fixture: railroad/ir-hidden-yaml-sole-lf] [fixture:
railroad/ir-hidden-yaml-spare-lf] [fixture: railroad/ebnf-hidden-yaml-sole-lf]
[fixture: railroad/ebnf-hidden-yaml-spare-lf] [fixture:
railroad/abnf-hidden-yaml-sole-lf] [fixture: railroad/abnf-hidden-yaml-spare-lf]
[fixture: railroad/peg-hidden-yaml-sole-lf] [fixture:
railroad/peg-hidden-yaml-spare-lf] [fixture: railroad/ir-hidden-directive-eof]
[fixture: railroad/ebnf-hidden-directive-eof] [fixture:
railroad/abnf-hidden-directive-eof] [fixture: railroad/peg-hidden-directive-eof]
[fixture: railroad/ir-hidden-directive-multiline] [fixture:
railroad/ebnf-hidden-directive-multiline] [fixture:
railroad/abnf-hidden-directive-multiline] [fixture:
railroad/peg-hidden-directive-multiline]

These forms separate native units; they do not join name or repeat fragments.
Earlier enclosing strings, special sequences or metadata own hidden-looking
content instead. Ordinary word-start global directives are common trivia removed
before native matching; they are not additional ignored-text nodes. [fixture:
railroad/ir-native-in-atom] [fixture: railroad/ebnf-native-in-atom] [fixture:
railroad/abnf-native-in-atom] [fixture: railroad/peg-native-in-atom] [fixture:
railroad/ir-hidden-yaml-string] [fixture: railroad/ir-hidden-directive-string]
[fixture: railroad/ebnf-enclosing-string-hidden] [fixture:
railroad/abnf-enclosing-string-hidden] [fixture:
railroad/peg-enclosing-string-hidden] [fixture:
railroad/ebnf-hidden-directive-special] [fixture: railroad/ir-hidden-yaml-title]
[fixture: railroad/ir-hidden-yaml-block] [fixture:
railroad/ir-directive-string-middle]

### Native comments

A native-percent-comment starts with `%%` and reads to CR/LF or EOF, excluding
that line terminator; even bare `%%` qualifies. In IR and EBNF, a C-comment is
`/*` through the first `*/`. EBNF also has ISO-comment, `(*` through the first
`*)`. Block comments do not nest, can contain all line-separator characters and
require their closer. [fixture: railroad/ir-comment-percent-ls] [fixture:
railroad/ir-comment-bare-percent-body] [fixture:
railroad/ebnf-comment-bare-percent-body] [fixture:
railroad/abnf-comment-bare-percent-body] [fixture:
railroad/peg-comment-bare-percent-body] [fixture:
railroad/ebnf-comment-block-ps] [fixture: railroad/ir-tail-comment] [fixture:
railroad/ebnf-tail-comment] [fixture: railroad/ir-c-comment-first-closer]
[fixture: railroad/ebnf-iso-first-closer] [fixture:
railroad/ir-comment-c-unclosed] [fixture: railroad/ebnf-comment-c-unclosed]
[fixture: railroad/ebnf-comment-iso-unclosed]

In ABNF, semicolon-comment starts with `;` and reads to CR/LF or EOF. Only a
match longer than the single-character terminator wins its longer alternative. A
bare `;` is therefore punctuation, whereas `;` followed by a space or other line
text becomes a comment, including where a rule terminator was intended.
[fixture: railroad/abnf-comment-semicolon-ls] [fixture:
railroad/abnf-comment-empty-line] [fixture: railroad/abnf-comment-before-rule]
[fixture: railroad/abnf-comment-terminator] [fixture:
railroad/abnf-comment-terminator-space] [fixture:
railroad/abnf-comment-terminator-control] [fixture:
railroad/abnf-comment-two-rules-line]

PEG hash-comment starts with `#` and reads to CR/LF or EOF, excluding that
terminator; a bare hash also matches. U+2028 and U+2029 do not terminate native
line comments. Hash comments are not IR, EBNF or ABNF comments; C comments are
not ABNF or PEG comments, and ISO comments are EBNF-only. [fixture:
railroad/peg-comment-hash-ps] [fixture: railroad/peg-comment-bare-hash]
[fixture: railroad/peg-comment-hash] [fixture: railroad/ir-comment-hash-foreign]
[fixture: railroad/ebnf-comment-hash-foreign] [fixture:
railroad/abnf-comment-hash-foreign] [fixture: railroad/abnf-comment-c-foreign]
[fixture: railroad/peg-comment-c-foreign] [fixture:
railroad/ir-comment-iso-foreign] [fixture: railroad/peg-comment-iso-foreign]

Native comments are shared Comment records, not body statements or
RailroadIgnoredText. A prior string, special sequence or metadata value owns
comment-looking text that its earlier unit already enclosed. Common comment
regions are distinct and may remove source lines before this native reading.
[fixture: railroad/ir-comment-string] [fixture:
railroad/ebnf-enclosing-string-hidden] [fixture:
railroad/abnf-enclosing-string-hidden] [fixture:
railroad/peg-comment-in-literal] [fixture: railroad/ir-common-block-comment]
[fixture: railroad/ir-common-block-gap-comment]

### Common directive and semicolon boundaries

For the common [directive](../common.md#a-directive-is-a-token-boundary) and
[ignored-semicolon](../common.md#style-and-classdef-lines) boundary rules, the
four headers, IR constructor words, metadata keywords, names, decimal counts,
`::=` and `<-` are atoms. Metadata keyword, colon or brace, and value are
separate authored components. The pieces of an ABNF repeat are its decimal
bounds and star, even though native matching requires them to be adjacent.
[fixture: railroad/ir-div-directive-header] [fixture:
railroad/ir-directive-keyword-glued] [fixture:
railroad/ir-directive-description-keyword] [fixture: railroad/ir-directive-name]
[fixture: railroad/peg-directive-operator] [fixture:
railroad/ir-div-semicolon-title-keyword] [fixture:
railroad/ir-div-semicolon-constructor-keyword] [fixture:
railroad/ir-div-semicolon-rule-name] [fixture:
railroad/abnf-div-semicolon-repeat-number] [fixture:
railroad/peg-div-semicolon-assignment] [fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star] [fixture:
railroad/abnf-directive-repeat-number]

Quoted-string interiors, metadata values, special-sequence content and the whole
abnf-numeric-value are string/text units and may contain common directives or
selected semicolons without splitting an atom. A directive between a metadata
keyword and its colon, or between a repeat bound and star, is allowed when the
required authored gaps still match. Selected semicolons likewise do not split
repeat components between a bound and star, or between a complete repeat and its
primary. A directive between a complete repeat and its primary is also allowed.
An ordinary native hidden form does not gain that ability. [fixture:
railroad/ir-directive-common-colon] [fixture:
railroad/ir-directive-string-middle] [fixture: railroad/ebnf-directive-string]
[fixture: railroad/abnf-directive-string] [fixture:
railroad/peg-directive-string] [fixture: railroad/abnf-directive-numval-prefix]
[fixture: railroad/abnf-directive-numval-digits] [fixture:
railroad/abnf-directive-numval-range] [fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star] [fixture:
railroad/abnf-native-in-atom] [fixture: railroad/ir-style-terminal-only]
[fixture: railroad/ebnf-style-special-only] [fixture:
railroad/abnf-semicolon-numval-text] [fixture:
railroad/abnf-semicolon-repeat-before-star] [fixture:
railroad/abnf-semicolon-repeat-after-star] [fixture:
railroad/abnf-semicolon-repeat-before-primary] [fixture:
railroad/abnf-directive-repeat-before-primary]

## Grammar

### Layout and metadata

```text
ir-diagram = "railroad-beta" metadata* ir-rule* end-of-text
ebnf-diagram = "railroad-ebnf-beta" metadata* ebnf-rule* end-of-text
abnf-diagram = "railroad-abnf-beta" metadata* abnf-rule* end-of-text
peg-diagram = "railroad-peg-beta" metadata* peg-rule* end-of-text
metadata = title-line | acc-title-line | acc-descr-line | acc-descr-block
```

Use [common grammar notation](../common.md#notation). Native padding, comments
and matching hidden forms may occur between complete native units, except within
a repeat. Metadata may repeat in any order, but only before the first rule.
Empty metadata blocks remain statements and cannot serve as hidden gaps inside
expressions. Headers have no flags. [fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership] [fixture:
railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]
[fixture: railroad/ir-common-repeat] [fixture: railroad/ir-common-repeat-empty]
[fixture: railroad/ebnf-common-repeat-empty] [fixture:
railroad/abnf-common-repeat-empty] [fixture: railroad/peg-common-repeat-empty]
[fixture: railroad/ir-metadata-after-rule-title] [fixture:
railroad/ebnf-metadata-after-rule-title] [fixture:
railroad/abnf-metadata-after-rule-title] [fixture:
railroad/peg-metadata-after-rule-title] [fixture:
railroad/ir-native-empty-block] [fixture: railroad/ebnf-native-empty-block]
[fixture: railroad/abnf-native-empty-block] [fixture:
railroad/peg-native-empty-block]

The body may be empty or contain only metadata and retained forms. No visible
newline is required after a header or between statements, subject to the header
boundary and the line-content rules. A rule always requires its visible
semicolon; an extra standalone semicolon is not an empty statement. [fixture:
railroad/ir-header-only] [fixture: railroad/ebnf-header-only] [fixture:
railroad/abnf-header-only] [fixture: railroad/peg-header-only] [fixture:
railroad/ir-header-inline] [fixture: railroad/ebnf-header-inline] [fixture:
railroad/abnf-header-inline] [fixture: railroad/peg-header-inline] [fixture:
railroad/ir-rule-tail-semicolon] [fixture: railroad/ebnf-rule-tail-semicolon]
[fixture: railroad/abnf-comment-double-terminator] [fixture:
railroad/peg-rule-tail-semicolon]

### IR grammar

```text
ir-rule = ir-name "=" ir-expression ";"
ir-expression = ir-sequence | ir-choice | ir-optional | ir-one-or-more
              | ir-zero-or-more | ir-terminal | ir-nonterminal | ir-special
ir-sequence = "sequence" "(" ir-arguments ")"
ir-choice = "choice" "(" ir-arguments ")"
ir-arguments = ir-expression ("," ir-expression)*
ir-optional = "optional" "(" ir-expression ")"
ir-one-or-more = "oneOrMore" "(" ir-expression ")"
ir-zero-or-more = "zeroOrMore" "(" ir-expression ")"
ir-terminal = "terminal" "(" ir-string ")"
ir-nonterminal = "nonterminal" "(" ir-string ")"
ir-special = "special" "(" ir-string ")"
```

The [IR grammar][ir-expressions] has eight case-sensitive constructors. Sequence
and choice require at least one argument; every other constructor requires
exactly one argument of its specified form. Empty calls, trailing commas, extra
arguments, bare strings, bare references and unknown constructors reject. A
single-argument sequence or choice remains an authored call in the tree.
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-error-empty-call]
[fixture: railroad/ir-error-empty-choice] [fixture:
railroad/ir-error-empty-optional] [fixture: railroad/ir-choice-trailing-comma]
[fixture: railroad/ir-error-extra-argument] [fixture:
railroad/ir-error-bare-string] [fixture: railroad/ir-error-unknown-expression]
[fixture: railroad/ir-error-bare-reference] [fixture: railroad/ir-db-singletons]
[fixture: railroad/ir-error-empty-oneormore] [fixture:
railroad/ir-error-extra-oneormore] [fixture: railroad/ir-error-empty-zeroormore]
[fixture: railroad/ir-error-extra-zeroormore] [fixture:
railroad/ir-error-extra-optional] [fixture: railroad/ir-error-extra-nonterminal]
[fixture: railroad/ir-error-extra-special]

### EBNF grammar

```text
ebnf-rule = ebnf-name ("=" | "::=") ebnf-choice ";"
ebnf-choice = ebnf-sequence ("|" ebnf-sequence)*
ebnf-sequence = ebnf-term (","? ebnf-term)*
ebnf-term = ebnf-primary ebnf-postfix*
ebnf-primary = ebnf-string | ebnf-name | special-sequence
             | "(" ebnf-choice ")" | "[" ebnf-choice "]"
             | "{" ebnf-choice "}"
ebnf-postfix = "?" | "*" | "+" | "-" ebnf-primary
```

The [EBNF grammar][ebnf-expressions] orders choice outside sequence, sequence
outside the postfix term, and the primary innermost. A comma is optional at each
sequence boundary, but never permits a missing term. Empty definitions,
alternatives, groups, optional groups and repetition groups reject. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/ebnf-rhs-empty] [fixture:
railroad/ebnf-alternative-empty-first] [fixture:
railroad/ebnf-alternative-empty-last] [fixture: railroad/ebnf-comma-trailing]
[fixture: railroad/ebnf-error-empty-group] [fixture:
railroad/ebnf-empty-optional] [fixture: railroad/ebnf-error-empty-repetition]

Apply successive postfixes in written order, nesting left to right; an
exception’s right operand is only a primary. In `A - B - C+`, the final plus
applies to both preceding exceptions. The lexical special-sequence rule is
decided first, so apparent question-mark postfixes may instead be part of that
primary. [fixture: railroad/ebnf-exception-leftfold] [fixture:
railroad/ebnf-db-postfix-order] [fixture:
railroad/ebnf-postfix-special-priority] [fixture:
railroad/ebnf-gram-postfix-chain]

### ABNF grammar

```text
abnf-rule = abnf-name "=" abnf-choice ";"
abnf-choice = abnf-sequence ("/" abnf-sequence)*
abnf-sequence = abnf-element+
abnf-element = abnf-repeat? abnf-primary
abnf-repeat = abnf-count | abnf-count? "*" abnf-count?
abnf-primary = abnf-string | abnf-numeric-value | abnf-name
             | "(" abnf-choice ")" | "[" abnf-choice "]"
```

The [ABNF grammar][abnf-expressions] orders slash choice outside concatenation,
then an optional repeat prefix on one primary. Native repeat components must be
adjacent as defined above. Empty definitions, alternatives, groups and optional
groups reject, as do incremental `=/` rules. Counts and references are distinct;
signed or fractional counts are not supported. [fixture:
railroad/abnf-gram-written-tree] [fixture: railroad/abnf-rhs-empty] [fixture:
railroad/abnf-alternative-empty-first] [fixture:
railroad/abnf-alternative-empty-last] [fixture: railroad/abnf-empty-group]
[fixture: railroad/abnf-empty-optional] [fixture:
railroad/abnf-error-incremental] [fixture: railroad/abnf-number-negative]
[fixture: railroad/abnf-number-plus] [fixture: railroad/abnf-number-fraction]

A semicolon consumed by a native comment cannot terminate a rule.
`r="a"; comment` needs a separate visible semicolon; a second rule written after
that semicolon on the same line is comment content, not another rule. A
terminator immediately followed by LF or EOF remains visible. [fixture:
railroad/abnf-comment-terminator] [fixture:
railroad/abnf-comment-terminator-control] [fixture:
railroad/abnf-comment-two-rules-line] [fixture:
railroad/abnf-comment-terminator-space] [fixture: railroad/abnf-db-empty-string]
[fixture: railroad/abnf-line-crlf]

### PEG grammar

```text
peg-rule = peg-name "<-" peg-choice ";"
peg-choice = peg-sequence ("/" peg-sequence)*
peg-sequence = peg-prefix+
peg-prefix = ("&" | "!")? peg-suffix
peg-suffix = peg-primary ("?" | "*" | "+")?
peg-primary = peg-string | peg-name | "(" peg-choice ")" | "."
```

The [PEG grammar][peg-expressions] preserves slash alternative order. Sequence
binds inside choice, suffix binds inside prefix, and grouping encloses a full
choice. Each term permits at most one prefix and one suffix; parentheses can
nest further expressions. Empty definitions, alternatives, groups or a prefix
without its operand reject. [fixture: railroad/peg-gram-written-tree] [fixture:
railroad/peg-gram-double-prefix] [fixture: railroad/peg-gram-double-suffix]
[fixture: railroad/peg-rhs-empty] [fixture: railroad/peg-gram-empty-alternative]
[fixture: railroad/peg-alternative-empty-last] [fixture:
railroad/peg-gram-empty-group] [fixture: railroad/peg-prefix-missing-operand]
[fixture: railroad/peg-db-predicate-predicate]

A dot is a distinct primary, and a predicate keeps its entire suffix operand,
including groups and postfixes. Do not replace an authored predicate operand
with its published label or remove singleton groups. [fixture:
railroad/peg-gram-written-tree] [fixture: railroad/peg-db-predicates] [fixture:
railroad/peg-db-predicate-singleton-group] [fixture:
railroad/peg-db-predicate-quote-newline]

### Grammar and tree nodes

| Production                                       | Node                                                                                                                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Each diagram                                     | RailroadDiagram [fixture: railroad/ir-header-only] [fixture: railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture: railroad/peg-header-only]                          |
| Each rule                                        | RailroadRule [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]     |
| title-line / acc-title-line                      | RailroadTitleStatement / RailroadAccTitleStatement [fixture: railroad/ir-common-repeat-empty]                                                                                             |
| acc-descr-line / acc-descr-block                 | RailroadAccDescrStatement / RailroadAccDescrBlockStatement [fixture: railroad/ir-common-block-empty-interleaved]                                                                          |
| ir-sequence / ir-choice                          | RailroadSequenceCall / RailroadChoiceCall [fixture: railroad/ir-db-singletons] [fixture: railroad/ir-gram-written-tree]                                                                   |
| ir-optional / ir-one-or-more / ir-zero-or-more   | RailroadOptionalCall / RailroadOneOrMoreCall / RailroadZeroOrMoreCall [fixture: railroad/ir-gram-written-tree]                                                                            |
| ir-terminal / ir-nonterminal / ir-special        | RailroadTerminalCall / RailroadNonterminalCall / RailroadSpecialCall [fixture: railroad/ir-db-empty-strings]                                                                              |
| Natural choice / sequence with multiple elements | RailroadChoiceExpression / RailroadSequenceExpression [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]     |
| Parenthesized / bracketed group                  | RailroadGroupExpression / RailroadOptionalGroupExpression [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree] |
| EBNF brace group / special sequence / exception  | RailroadRepetitionGroupExpression / RailroadSpecialSequence / RailroadExceptionExpression [fixture: railroad/ebnf-gram-written-tree]                                                      |
| EBNF or PEG postfix                              | RailroadPostfixExpression [fixture: railroad/ebnf-db-postfix-order] [fixture: railroad/peg-gram-written-tree]                                                                             |
| ABNF repeat / star-repeat                        | RailroadRepeatExpression / RailroadRepeatRange [fixture: railroad/abnf-gram-written-tree]                                                                                                 |
| abnf-numeric-value                               | RailroadNumericValue [fixture: railroad/abnf-numval-boundaries]                                                                                                                           |
| PEG predicate / dot                              | RailroadPredicateExpression / RailroadAnyExpression [fixture: railroad/peg-gram-written-tree]                                                                                             |
| Name / quoted string / decimal count             | Identifier / StringLiteral / NumericLiteral [fixture: railroad/ir-db-empty-strings] [fixture: railroad/abnf-gram-written-tree]                                                            |
| Metadata value / native hidden form              | RailroadLiteral / RailroadIgnoredText [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ir-native-ownership]                                                             |

Natural choices or sequences with one element produce that element without a
wrapper. Explicit calls and every authored group remain nodes, even for one
child. List members use RailroadExpressionMember for the named hidden ownership
defined in the tree document. [fixture: railroad/ir-db-singletons] [fixture:
railroad/ebnf-db-singletons] [fixture: railroad/abnf-db-singletons] [fixture:
railroad/peg-db-singletons] [fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### Acceptance and configuration

Accept only a complete reading with no unread unit or unmatched character.
Recovery does not establish acceptance. There is no additional semantic
acceptance gate: duplicate names, forward or undefined references, recursion,
reversed repeat bounds and counts beyond finite double precision are allowed. No
rule-name uniqueness or base-specific numeric-value validation is imposed.
[fixture: railroad/ir-error-before-rule] [fixture:
railroad/ir-gram-reference-resolution] [fixture:
railroad/ebnf-gram-reference-resolution] [fixture:
railroad/abnf-gram-reference-resolution] [fixture:
railroad/peg-gram-reference-resolution] [fixture:
railroad/ebnf-error-before-rule] [fixture: railroad/abnf-error-before-rule]
[fixture: railroad/peg-error-before-rule] [fixture: railroad/ir-db-duplicates]
[fixture: railroad/ebnf-db-duplicates] [fixture: railroad/abnf-db-duplicates]
[fixture: railroad/peg-db-duplicates] [fixture: railroad/ir-db-all-fields]
[fixture: railroad/abnf-db-repeat-reversed] [fixture:
railroad/abnf-db-repeat-precision] [fixture: railroad/abnf-db-repeat-overflow]
[fixture: railroad/abnf-numval-boundaries]

These conditions follow the complete-input checks in
[railroadParser.ts][ir-gate], [ebnfParser.ts][ebnf-gate],
[abnfParser.ts][abnf-gate], [pegParser.ts][peg-gate] and the absence of an
additional rejection in [railroadDb.ts][db]. Valid `railroad.*` settings affect
drawing, not syntax acceptance, and add no semantic acceptance keys.
Embedded-data derivation failures use the common opaque-data rule instead.
[fixture: railroad/ir-config-drawing-site] [fixture:
railroad/ir-config-frontmatter-drawing] [fixture:
railroad/ebnf-config-init-drawing] [fixture:
railroad/abnf-config-frontmatter-drawing] [fixture:
railroad/peg-config-init-drawing] [fixture:
railroad/ir-config-frontmatter-cannot-rescue] [fixture:
railroad/ebnf-config-frontmatter-cannot-rescue] [fixture:
railroad/abnf-config-init-cannot-rescue] [fixture:
railroad/peg-config-init-cannot-rescue] [fixture:
railroad/ir-config-frontmatter-fontfamily-number] [fixture:
railroad/ebnf-config-init-fontfamily-number] [fixture:
railroad/abnf-config-frontmatter-fontfamily-number] [fixture:
railroad/peg-config-init-fontfamily-number]

### Db normalization

The [railroad Db summary](../../../tests/docs/db-summaries.md#railroad) defines
conversions and normalization for all four ids. The diagram title is excluded
from that comparison summary and remains in the source tree; frontmatter title
remains in the shared embedded values. Grouping, call syntax, quote spelling,
repeat spelling and complete predicate operands likewise remain authored
structure regardless of the normalized Db. [fixture:
railroad/ir-frontmatter-empty-body-title] [fixture:
railroad/ebnf-frontmatter-empty-body-title] [fixture:
railroad/abnf-frontmatter-empty-body-title] [fixture:
railroad/peg-frontmatter-empty-body-title] [fixture: railroad/ir-db-singletons]
[fixture: railroad/ebnf-db-singletons] [fixture:
railroad/abnf-db-repeat-leading-zero] [fixture: railroad/peg-db-predicates]

## Known divergences

The following existing identifiers apply. Empty strings are retained values and
empty calls are syntax errors, so tokenless-empty-forms does not apply. Native
hidden forms have owners and are not rejected merely because Mermaid does not
publish them. [fixture: railroad/ir-db-empty-strings] [fixture:
railroad/ebnf-db-empty-string] [fixture: railroad/abnf-db-empty-string]
[fixture: railroad/peg-db-empty-string] [fixture: railroad/ir-error-empty-call]
[fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md):
directives inside the authored atoms listed above reject. Between repeat bounds
and star, and inside numeric-value text, they remain permitted. A shared
Directive record preserves source but does not make a split name, keyword,
delimiter or decimal count one atom. [fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-directive-keyword-glued] [fixture:
railroad/ebnf-div-directive-assignment] [fixture:
railroad/abnf-directive-repeat-number] [fixture:
railroad/peg-directive-operator] [fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-numval-digits]

[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md):
a semicolon selected by the common line rule inside a name, keyword, decimal
count or compound delimiter splits that atom. Text values, including
numeric-value text, still admit selected semicolons. The original punctuation
remains common trivia. [fixture: railroad/ir-div-semicolon-rule-name] [fixture:
railroad/ir-div-semicolon-constructor-keyword] [fixture:
railroad/ir-div-semicolon-title-keyword] [fixture:
railroad/abnf-div-semicolon-repeat-number] [fixture:
railroad/peg-div-semicolon-assignment] [fixture:
railroad/abnf-semicolon-numval-text]

[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md):
body HTML-quote reading starts after frontmatter rather than carrying an open
frontmatter tag into a body string or common value. Frontmatter and value nodes
preserve the source; an ignored-text sibling cannot represent that cross-fence
quote context. Each dialect has Mermaid-only acceptance, specification-only
acceptance and both-accepted value differences. [fixture:
railroad/ir-div-html-frontmatter-rule-accept] [fixture:
railroad/ir-div-html-frontmatter-rule-reject] [fixture:
railroad/ir-div-html-frontmatter-acctitle] [fixture:
railroad/ebnf-div-html-frontmatter-rule-accept] [fixture:
railroad/ebnf-div-html-frontmatter-rule-reject] [fixture:
railroad/ebnf-div-html-frontmatter-acctitle] [fixture:
railroad/abnf-div-html-frontmatter-rule-accept] [fixture:
railroad/abnf-div-html-frontmatter-rule-reject] [fixture:
railroad/abnf-div-html-frontmatter-acctitle] [fixture:
railroad/peg-div-html-frontmatter-rule-accept] [fixture:
railroad/peg-div-html-frontmatter-rule-reject] [fixture:
railroad/peg-div-html-frontmatter-acctitle]

[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md): leading
frontmatter and global directive contents are retained without validating their
YAML, JSON or setting types. No railroad acceptance key is removed from valid
configuration. A numeric embedded railroad font family can fail Mermaid
configuration derivation while its well-delimited diagram is accepted here.
[fixture: railroad/ir-div-frontmatter-invalid] [fixture:
railroad/ir-config-frontmatter-fontfamily-number] [fixture:
railroad/ebnf-config-init-fontfamily-number] [fixture:
railroad/abnf-config-frontmatter-fontfamily-number] [fixture:
railroad/peg-config-init-fontfamily-number]

[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md):
passed bare lines and accompanying trivia are not read again. Comment records
and whitespace preserve them, while the shared direct rule avoids handing that
Unicode padding back to a native lexer that rejects it. [fixture:
railroad/ir-bare-nbsp] [fixture: railroad/ebnf-bare-unicode] [fixture:
railroad/abnf-bare-unicode] [fixture: railroad/peg-bare-unicode] [fixture:
railroad/ir-secondscan-between-bares-unicode]

[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md): select the
railroad dialect from its header instead of switching to C4 because a later text
contains C4Container, C4Component, C4Dynamic or C4Deployment. Written names,
strings and special forms retain those words in their natural nodes. [fixture:
railroad/ir-c4-container-terminal] [fixture: railroad/ebnf-c4-component-special]
[fixture: railroad/abnf-c4-dynamic-string] [fixture:
railroad/peg-c4-deployment-predicate]

[ir-module]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/module.ts#L1-L56
[ir-converter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/valueConverter.ts#L1-L68
[ebnf-module]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/module.ts#L1-L58
[ebnf-converter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/valueConverter.ts#L1-L72
[abnf-module]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/module.ts#L1-L58
[abnf-converter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/valueConverter.ts#L1-L37
[peg-module]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/module.ts#L1-L58
[peg-converter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/valueConverter.ts#L1-L68
[ir-lex]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/railroad.langium#L3-L14
[ebnf-lex]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/railroad-ebnf.langium#L3-L20
[abnf-lex]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/railroad-abnf.langium#L3-L17
[peg-lex]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/railroad-peg.langium#L3-L14
[ir-expressions]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/railroad.langium#L72-L113
[ebnf-expressions]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/railroad-ebnf.langium#L100-L166
[abnf-expressions]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/railroad-abnf.langium#L76-L114
[peg-expressions]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/railroad-peg.langium#L74-L111
[common-builder]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L1-L31
[db]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/railroadDb.ts#L1-L155
[ir-detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/railroadDetector.ts#L1-L32
[ir-gate]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/railroadParser.ts#L92-L113
[ebnf-detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/ebnfDetector.ts#L1-L22
[ebnf-gate]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/ebnfParser.ts#L148-L169
[abnf-detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/abnfDetector.ts#L1-L22
[abnf-gate]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/abnfParser.ts#L130-L151
[peg-detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/pegDetector.ts#L1-L22
[peg-gate]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/pegParser.ts#L139-L160
