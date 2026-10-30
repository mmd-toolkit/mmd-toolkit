# Radar

Japanese version: [radar.ja.md](./radar.ja.md)

This document defines radar syntax and acceptance. Its
[source tree](../ast/radar.md) preserves authored forms; derived Db values
belong to the [tests summary](../../../tests/docs/db-summaries.md#radar). The
syntax follows [radar.langium][grammar] and [common.langium][common]. [fixture:
radar/gram-written-tree] [fixture: radar/db-all-fields]

## Detection

Entry 29 of [detection.md](../detection.md), the [radar detector][detector],
selects the exact lowercase prefix radar-beta without a suffix boundary.
Accepted headers are radar-beta, radar-beta: and radar-beta followed by a
separate colon. Bare radar, uppercase spelling, repeated headers and invalid
suffixes reject. Detection precedes syntax checking, so selecting radar does not
establish acceptance. [fixture: radar/header-colon-inline] [fixture:
radar/header-separated-colon] [fixture: radar/header-bare] [fixture:
radar/header-uppercase] [fixture: radar/header-repeated] [fixture:
radar/header-letter-suffix] [fixture: radar/header-digit-suffix] [fixture:
radar/header-dash-suffix] [fixture: radar/header-unicode-suffix]

Apply [common preprocessing](../common.md#reading-a-source), including leading
frontmatter, global directives, comment regions, leading whitespace, line
conversion, HTML attribute quotes, entities and selected semicolons. Leading
frontmatter is a shared Frontmatter record, distinct from a retained YAML-shaped
diagram form. C4 is registered earlier in [diagram-orchestration.ts][order]; its
four anywhere keywords follow the divergence below. [fixture:
radar/frontmatter-title] [fixture: radar/retained-yaml-control] [fixture:
radar/line-cr] [fixture: radar/line-crlf] [fixture: radar/html-fields] [fixture:
radar/entity-labels] [fixture: radar/style-fields] [fixture:
radar/c4-component-axis-label]

At the detection point, pass at most one retained block satisfying the common
[Frontmatter shape](../common.md#frontmatter), before passing bare percent-pair
lines or the second directive scan. It remains diagram text, must satisfy the
native hidden-yaml rule and belongs to RadarDiagram.textBeforeHeader without
applying YAML properties. Real frontmatter may precede it. A second retained
block, one after a passed bare line, or one after a second-scan directive is not
passed. [fixture: radar/retained-yaml-control] [fixture:
radar/detect-retained-two] [fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/detect-secondscan-before-yaml-native] [fixture:
radar/detect-native-bare-yaml]

The skip stops at adjacent fences without a body line, a missing closer,
mismatched indentation, four opening dashes, closing suffix text, or a closer
without a following line break, including EOF. Three adjacent fences can provide
a body line. Leading trim can remove only opening indentation; matching
real-frontmatter indentation is a different case. Passing detection does not
relax native opener or closer rules. [fixture:
radar/detect-block-after-directive] [fixture: radar/frontmatter-unclosed]
[fixture: radar/detect-retained-indent-both-native] [fixture:
radar/detect-retained-indent-open-native] [fixture:
radar/detect-retained-three-native] [fixture: radar/detect-retained-close-eof]
[fixture: radar/detect-retained-four-dashes-control] [fixture:
radar/detect-retained-close-suffix-control] [fixture:
radar/detect-retained-close-no-lf-control] [fixture:
radar/detect-retained-opener-nbsp] [fixture: radar/detect-retained-closer-u3000]

The lexer reads retained forms from the detection point, not just the reached
header. A directive formed only by detection's second scan is retained as
hidden-directive in textBeforeHeader, under its own closing boundary; a glued
header rejects. Multiple such matches remain separate. A word-start global
directive is removed earlier and is not this native form. [fixture:
radar/detect-secondscan-native] [fixture: radar/detect-secondscan-native-glued]
[fixture: radar/detect-secondscan-native-twice] [fixture:
radar/detect-yaml-before-secondscan-native] [fixture:
radar/detect-secondscan-native-nbsp] [fixture: radar/detect-second-scan-glued]

Bare percent-pair lines passed by detection, including nonword percent-brace
forms, are shared Comments with mark %%. Their accompanying whitespace and line
breaks are trivia and are not read again, also between retained forms. Retained
forms still satisfy their native boundaries. The same Unicode whitespace without
a passed line remains native diagram text and can reject; ASCII controls and
passed Unicode trivia are distinguished. [fixture: radar/comment-bare] [fixture:
radar/retained-directive-control] [fixture:
radar/retained-directive-between-bare] [fixture: radar/bare-before-header-space]
[fixture: radar/bare-before-header-tab] [fixture: radar/bare-before-header-ls]
[fixture: radar/bare-line-ls] [fixture: radar/retained-yaml-unicode] [fixture:
radar/retained-directive-unicode] [fixture:
radar/detect-retained-no-bare-control] [fixture:
radar/div-detect-yaml-bare-secondscan-native-ls] [fixture:
radar/detect-yaml-bare-secondscan-native-ascii]

## Lexical structure

### Ordered rules

At each position of converted diagram text, excluding the passed intervals
above, take the first applicable rule and restart after it. This is not a
general longest-match rule. Each word keyword except the joined-colon header has
an explicit longer-id alternative; punctuation does not. The effective order
follows [module.ts][module], [tokenBuilder.ts][builder], the [common keyword
builder][common-builder] and the imported grammar. [fixture:
radar/lex-id-keyword-prefix] [fixture: radar/lex-id-keywords] [fixture:
radar/lex-id-numeric-leading] [fixture: radar/lex-id-title-prefix] [fixture:
radar/lex-bare-accessibility-ids] [fixture: radar/lex-false-prefix-id] [fixture:
radar/lex-polygon-prefix-id] [fixture: radar/error-start] [fixture:
radar/error-after-prefix]

| Priority | Unit                             | Reading                                             |
| -------- | -------------------------------- | --------------------------------------------------- |
| 1        | joined header                    | radar-beta:                                         |
| 2        | bare header                      | radar-beta                                          |
| 3–9      | word keywords                    | showLegend, graticule, curve, ticks, axis, max, min |
| 10–15    | punctuation                      | : , [ ] { }                                         |
| 16       | graticule-value                  | circle or polygon                                   |
| 17       | boolean-value                    | true or false                                       |
| 18       | acc-descr-line / acc-descr-block | Composite common form                               |
| 19       | acc-title-line                   | Composite common form                               |
| 20       | title-line                       | Composite common form                               |
| 21       | number                           | Unsigned decimal                                    |
| 22       | string                           | Matching quoted form                                |
| 23       | id                               | Bare name                                           |
| 24       | newline                          | LF                                                  |
| 25       | ASCII padding                    | Hidden space/tab                                    |
| 26       | hidden-yaml                      | Whole fenced form                                   |
| 27       | hidden-directive                 | Whole percent-brace form                            |
| 28       | native-comment                   | Percent pair to line end                            |

FLOAT and INT in [common.langium][common] supply the number rule internally;
they are not separate active units. Only ASCII space and tab are skipped between
units. Newline is visible. Common CR/CRLF conversion applies; NBSP, BOM, LS
U+2028, PS U+2029 and other common whitespace are not general gaps, although
leading trivia, detection-passed trivia or enclosing values can admit them.
[fixture: radar/space-tabs] [fixture: radar/space-nbsp-body] [fixture:
radar/space-bom-body] [fixture: radar/space-3000-body] [fixture:
radar/space-bom-leading] [fixture: radar/line-cr] [fixture: radar/line-crlf]
[fixture: radar/line-ls-between] [fixture: radar/line-ps-between] [fixture:
radar/line-ls-ps-values]

### Names and keyword boundaries

An id starts with an ASCII letter, digit or underscore, continues with those
characters or dash, and cannot end with dash. Read as many characters as that
form permits, subject to earlier rules. A longer name such as axisX is an id
rather than axis. Exact word keywords cannot be names. Numeric prefixes,
true/false, circle/polygon and the title prefix are taken by earlier rules even
at an id position. [fixture: radar/lex-id-underscore] [fixture:
radar/lex-id-dash-end] [fixture: radar/lex-id-nonascii] [fixture:
radar/lex-id-keyword-prefix] [fixture: radar/lex-id-keywords] [fixture:
radar/lex-id-numeric-leading] [fixture: radar/lex-id-numeric-curve] [fixture:
radar/lex-id-boolean-prefix] [fixture: radar/lex-id-graticule-prefix] [fixture:
radar/lex-id-title-prefix] [fixture: radar/lex-false-prefix-id] [fixture:
radar/lex-polygon-prefix-id]

Without the required colon or brace, accTitle and accDescr can be ids. Before
their colon, the earlier common composite rule instead wins. Thus an axis named
accTitle can be referenced as accTitle 1 but not as accTitle:1. The
optional-colon grammar does not override lexical priority. [fixture:
radar/lex-id-accessibility-prefix] [fixture: radar/lex-bare-accessibility-ids]
[fixture: radar/lex-bare-accessibility-axis-only] [fixture:
radar/lex-bare-accessibility-no-colon-reference]

The [custom matcher][common-builder] restricts only the bare header
`radar-beta`: it must end before %%, common Notation whitespace or EOF. That
whitespace is U+0009–U+000D, U+0020, U+00A0, U+1680, U+2000–U+200A, U+2028,
U+2029, U+202F, U+205F, U+3000 or U+FEFF. Satisfying a boundary does not make
the following character a legal gap. Other word keywords need no whitespace
boundary beyond their longer-id alternative. Boolean and graticule values have
no suffix boundary. [fixture: radar/comment-header] [fixture:
radar/header-native-glued] [fixture: radar/header-native-no-boundary] [fixture:
radar/header-unicode-suffix] [fixture: radar/space-nbsp-body] [fixture:
radar/gram-option-number-adjacent] [fixture: radar/gram-option-bool-adjacent]
[fixture: radar/gram-option-enum-adjacent] [fixture:
radar/gram-option-boolean-suffix] [fixture: radar/gram-option-graticule-suffix]

The joined radar-beta: form has no additional boundary: it can touch axis, title
or hidden-yaml. Its written components are the header word and colon. The
separate colon must follow the bare header before any visible newline; a native
hidden form can consume the intervening LF. Header spelling remains
punctuation/keyword syntax, not another diagram id. [fixture:
radar/header-colon-inline] [fixture: radar/header-colon-glued-title] [fixture:
radar/header-separated-colon] [fixture: radar/header-colon-newline] [fixture:
radar/header-colon-hidden] [fixture: radar/header-colon-yaml]

Judge these boundaries after global directives and selected semicolons are left
out. A removed directive supplies no separator: radar-beta followed by a
directive and axis rejects if removal produces radar-betaaxis, but accepts if a
space remains. The same longer-id rule applies to axis, curve and all five
option keywords. [fixture: radar/directive-header-glued] [fixture:
radar/directive-header-space] [fixture: radar/directive-axis-glued] [fixture:
radar/directive-curve-glued] [fixture: radar/directive-showlegend] [fixture:
radar/directive-ticks] [fixture: radar/directive-max] [fixture:
radar/directive-min] [fixture: radar/directive-graticule]

### Numbers and strings

The number rule first tries one or more ASCII digits, a dot and one or more
ASCII digits, with no dot immediately after that candidate. Otherwise it tries
the single digit zero, or a nonzero digit and further digits, again with no
immediately following dot for the nonzero form. Repetitions take as many digits
as the remaining condition permits. Decimal leading zeros are allowed; integer
leading zeros, signs, a missing side of the decimal point, exponent notation,
NaN and Infinity spellings are not numbers. [fixture:
radar/db-number-leading-zero-decimal] [fixture: radar/number-leading-zero]
[fixture: radar/number-plus] [fixture: radar/number-negative] [fixture:
radar/number-negative-zero] [fixture: radar/number-leading-dot] [fixture:
radar/number-trailing-dot] [fixture: radar/number-exponent] [fixture:
radar/number-nan] [fixture: radar/number-infinity] [fixture:
radar/number-double-dot] [fixture: radar/number-suffix]

A written number uses the shared NumericLiteral, including its raw spelling and
double value. Rounding, subnormal values, underflow to zero and overflow to
positive infinity do not reject. The grammar cannot write a negative number or
produce NaN or negative infinity. Number normalization belongs to the
[tests summary](../../../tests/docs/db-summaries.md#radar). [fixture:
radar/db-number-rounded] [fixture: radar/db-number-subnormal] [fixture:
radar/db-number-underflow] [fixture: radar/db-number-overflow] [fixture:
radar/db-option-overflow] [fixture: radar/number-negative]

A string opens with a single or double quote and closes with the matching quote.
It may be empty. Inside it, take characters other than that quote or backslash,
including LF, LS and PS; a backslash instead takes the next character, which
must not be LF, CR, LS or PS. An unclosed string rejects. Earlier strings own
enclosed native hidden-looking text. Authored escapes and quote spelling stay in
StringLiteral rather than the converted label. [fixture: radar/db-empty-labels]
[fixture: radar/lex-string-conversion] [fixture: radar/lex-string-multiline]
[fixture: radar/line-cr-values] [fixture: radar/line-ls-ps-values] [fixture:
radar/lex-string-open-axis] [fixture: radar/lex-string-open-curve] [fixture:
radar/hidden-native-string] [fixture: radar/hidden-yaml-in-string] [fixture:
radar/lex-string-escaped-ls] [fixture: radar/lex-string-escaped-lf] [fixture:
radar/lex-string-escaped-ps]

### Composite common forms

The [common terminals][common] read each common statement as a composite form. A
title is title alone, or title followed by exactly one ASCII space/tab and a
line value. Remaining padding belongs to the value. An accessibility title is
accTitle, optional ASCII padding, colon and a line value. A description line is
the same form with accDescr. A line value ends before the first %% or physical
EOL, not at LS/PS. It may be empty and does not take text from the next line.
[fixture: radar/lex-common-title-one-space] [fixture:
radar/lex-common-title-two-spaces] [fixture: radar/lex-title-tab-null] [fixture:
radar/lex-title-second-tab] [fixture: radar/lex-common-empty-values] [fixture:
radar/common-line-whitespace] [fixture: radar/line-common-values] [fixture:
radar/common-title-next-statement] [fixture:
radar/common-acctitle-next-statement] [fixture:
radar/common-accdescr-next-statement] [fixture: radar/comment-title] [fixture:
radar/comment-acctitle] [fixture: radar/comment-accdescr]

A description block is accDescr, optional common Notation whitespace, an opening
brace, arbitrary characters through the first closing brace, and that closer.
The body admits physical newlines, LS and PS and may be empty. Neither quotes
nor backslashes protect a closing brace. A colon chooses the line form instead.
Unclosed blocks and common composites interrupted by native hidden forms reject;
global directives and comment regions follow the common rules. [fixture:
radar/common-block-newline-gap] [fixture: radar/common-block-ls-gap] [fixture:
radar/common-block-bom-gap] [fixture: radar/common-block-whitespace] [fixture:
radar/common-block-empty-interleaved] [fixture: radar/common-block-open]
[fixture: radar/common-block-quoted-close] [fixture:
radar/common-block-escaped-close] [fixture: radar/common-block-directive-gap]
[fixture: radar/common-block-comment-gap] [fixture:
radar/lex-common-block-colon-first] [fixture:
radar/lex-common-block-hidden-inside] [fixture:
radar/lex-common-hidden-yaml-block-owner] [fixture:
radar/lex-common-hidden-percent-block-owner] [fixture:
radar/lex-common-description-only-directive] [fixture:
radar/lex-common-description-only-comment] [fixture:
radar/gram-native-description-gap]

Every common form, even an empty block, requires visible EOL or EOF. The
following statement may not touch a completed block, although line-value text
can absorb apparent keywords. Keep all repeated and empty statements. Their
authored values use RadarLiteral; trimming, whitespace collapse and escape
conversion of published values are defined by the
[tests summary](../../../tests/docs/db-summaries.md#radar), not by tree fields.
[fixture: radar/common-block-first-close] [fixture:
radar/common-title-next-statement] [fixture: radar/common-repeat] [fixture:
radar/common-repeat-empty] [fixture: radar/common-title-open-quote] [fixture:
radar/common-line-whitespace]

### Hidden forms and comments

After ASCII padding, hidden-yaml starts with ---, optional ASCII padding and LF.
Try a body ending in LF before its closing --- first, taking as few body
characters as permit that match; only if that fails try adjacent empty fences.
Content can include LF, LS and PS. A closer starts immediately after a body LF,
without indentation, and ends before LF, common Notation whitespace or EOF. A
nonqualifying closer may be passed for a later qualifying one. [fixture:
radar/hidden-yaml-adjacent-later] [fixture: radar/hidden-yaml-adjacent-no-later]
[fixture: radar/hidden-yaml-adjacent-eof] [fixture:
radar/hidden-yaml-closer-indent] [fixture: radar/hidden-yaml-closer-suffix]
[fixture: radar/lex-hidden-padding] [fixture:
radar/lex-hidden-yaml-two-nonempty] [fixture:
radar/lex-hidden-yaml-body-separators]

The body-present alternative can make three adjacent fences one match. Two
nonempty blocks can remain separate. Native YAML has no property/configuration
effect, and NBSP/BOM are not opener padding. Newline-like or other common
whitespace after a closer is only a boundary unless it is LF; it must still be
readable at the next position. [fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/detect-retained-three-native] [fixture: radar/hidden-yaml-body]
[fixture: radar/hidden-yaml-opener-bom] [fixture: radar/hidden-yaml-closer-ls]
[fixture: radar/hidden-yaml-closer-nbsp] [fixture:
radar/detect-retained-opener-nbsp] [fixture: radar/detect-retained-closer-u3000]

After optional ASCII padding, hidden-directive reads %%{ and arbitrary content,
including LF/LS/PS or an empty/nonword body, through the earliest }%% ending
before LF, common Notation whitespace or EOF. A nonqualifying closer can be
passed. Without a qualifying closer, native-comment may read the entire
remaining line, including an attached axis. These native forms are distinct from
the earlier global directive scan. [fixture: radar/hidden-native-closer]
[fixture: radar/hidden-native-unclosed] [fixture:
radar/hidden-native-empty-adjacent] [fixture: radar/lex-hidden-padding]
[fixture: radar/lex-hidden-native-fallback] [fixture:
radar/lex-hidden-native-body-separators]

Both hidden forms consume an immediately following LF, including the appended LF
at source EOF. They do not consume another qualifying whitespace character. If a
common statement loses its only EOL to that consumption, the next statement
rejects. A spare LF or ASCII space/tab after the closer preserves EOL; EOF
itself also satisfies the common statement. The consumed LF stays outside
RadarIgnoredText's range and value. [fixture: radar/hidden-native-title]
[fixture: radar/hidden-native-title-space] [fixture:
radar/hidden-native-title-spare] [fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-after] [fixture:
radar/hidden-native-acctitle-space] [fixture:
radar/hidden-native-acctitle-spare] [fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-after] [fixture:
radar/hidden-native-description-space] [fixture:
radar/hidden-native-description-spare] [fixture:
radar/hidden-native-description-eof] [fixture: radar/hidden-native-sole-lf]
[fixture: radar/hidden-native-space] [fixture: radar/hidden-native-spare-lf]
[fixture: radar/hidden-native-eof] [fixture: radar/hidden-yaml-block-sole-lf]
[fixture: radar/hidden-yaml-block-space] [fixture:
radar/hidden-yaml-block-spare-lf] [fixture: radar/hidden-yaml-block-eof]

Hidden forms can stand between complete units and consume physical LF where the
grammar permits no visible newline. They are preserved once, in the
[tree's named gap or body position](../ast/radar.md#gap-ownership). They cannot
split an id or fixed word, and an earlier string or common value owns enclosed
hidden-looking text. Global directives, common comment regions and selected
semicolons can occur inside retained-form text and fences under the common
rules. [fixture: radar/hidden-native-axis] [fixture: radar/hidden-native-curve]
[fixture: radar/hidden-native-entry-gap] [fixture:
radar/lex-hidden-before-label-open] [fixture:
radar/lex-hidden-before-label-close] [fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-hidden-detailed-before-colon] [fixture:
radar/lex-hidden-detailed-no-colon] [fixture:
radar/lex-hidden-yaml-global-inside] [fixture:
radar/lex-hidden-yaml-opener-selected-control] [fixture:
radar/lex-hidden-yaml-opener-global] [fixture:
radar/lex-hidden-yaml-closer-global] [fixture:
radar/lex-hidden-native-opener-global] [fixture:
radar/lex-hidden-native-closer-global] [fixture:
radar/lex-hidden-yaml-content-common-comment] [fixture:
radar/lex-hidden-native-content-common-comment] [fixture:
radar/lex-common-hidden-yaml-block-owner] [fixture:
radar/lex-common-hidden-percent-block-owner] [fixture:
radar/lex-hidden-native-opener-selected]

A native comment reads optional ASCII padding, %%, and maximal content before
physical EOL. Its shared Comment has mark %% and the text after that mark as
value; preceding padding and terminating LF are outside its range. LS/PS do not
end it. A single percent or a separated percent pair rejects, while bare and
triple-percent comments are allowed. Common directives may separate the percent
characters; common comment regions still apply first. [fixture:
radar/comment-axis] [fixture: radar/comment-curve] [fixture:
radar/comment-header] [fixture: radar/comment-bare] [fixture:
radar/comment-triple] [fixture: radar/comment-ls] [fixture: radar/comment-ps]
[fixture: radar/comment-single-percent] [fixture: radar/comment-split-mark]
[fixture: radar/gram-comment-mark-global]

A bare percent line inside an already-started description is value text unless
common preprocessing removes it; native-directive-looking text there closes the
description at its first brace. Ordinary semicolons are not statement
separators. A semicolon in a line common value remains value text unless the
shared style/classDef rule selects it; a remaining semicolon after axis, curve,
option or block rejects. [fixture: radar/common-block-comment] [fixture:
radar/lex-common-hidden-percent-block-owner] [fixture:
radar/tail-title-semicolon] [fixture: radar/tail-acctitle-semicolon] [fixture:
radar/tail-description-semicolon] [fixture: radar/tail-axis-semicolon] [fixture:
radar/tail-curve-semicolon] [fixture: radar/tail-option-semicolon] [fixture:
radar/tail-block-semicolon] [fixture: radar/style-fields] [fixture:
radar/style-controls] [fixture: radar/gram-semicolon-between-units]

## Grammar

```text
diagram = newline* header newline*
          (common-statement eol | axis-statement | curve-statement
           | options-statement | newline)* end-of-text
header = "radar-beta" | "radar-beta:" | "radar-beta" ":"
axis-statement = "axis" axis ("," axis)*
axis = id ("[" string "]")?
curve-statement = "curve" curve ("," curve)*
curve = id ("[" string "]")? "{" entries "}"
entries = newline* number-entry ("," newline* number-entry)* newline*
        | newline* named-entry ("," newline* named-entry)* newline*
number-entry = number
named-entry = id ":"? number
options-statement = option ("," option)*
option = "showLegend" boolean-value | "ticks" number | "max" number
       | "min" number | "graticule" graticule-value
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

Use [common notation](../common.md#notation) and the lexical rules above. Hidden
forms have their stated owners without adding visible separators. The body may
be empty. Axis, curve and options groups do not require EOL and may follow one
another on the same line when unit boundaries permit. Common statements require
EOL. One header is allowed. [fixture: radar/spec-radar-test-ts-f0c0291e]
[fixture: radar/gram-inline-statements] [fixture: radar/header-inline-curve]
[fixture: radar/header-repeated] [fixture: radar/common-block-first-close]

| Rule                     | Tree node                                          |
| ------------------------ | -------------------------------------------------- |
| diagram                  | RadarDiagram                                       |
| axis-statement           | RadarAxisStatement                                 |
| axis                     | RadarAxis                                          |
| curve-statement          | RadarCurveStatement                                |
| curve                    | RadarCurve                                         |
| number-entry             | RadarNumberEntry                                   |
| named-entry              | RadarNamedEntry                                    |
| options-statement        | RadarOptionsStatement                              |
| showLegend option        | RadarShowLegendOption                              |
| ticks / max / min option | RadarTicksOption / RadarMaxOption / RadarMinOption |
| graticule option         | RadarGraticuleOption                               |
| title-line               | RadarTitleStatement                                |
| acc-title-line           | RadarAccTitleStatement                             |
| acc-descr-line           | RadarAccDescrStatement                             |
| acc-descr-block          | RadarAccDescrBlockStatement                        |

An axis or curve group has at least one member. Each declaration has one id and
an optional bracketed string label; a missing label differs from an empty
string. A curve requires braces and nonempty entries. Commas separate members in
the written group; empty members and trailing commas reject. Neither a member
comma nor a label/name/brace gap admits an unstated visible newline. [fixture:
radar/db-empty-labels] [fixture: radar/gram-written-tree] [fixture:
radar/gram-axis-trailing-comma] [fixture: radar/gram-curve-trailing-comma]
[fixture: radar/gram-axis-newline-comma] [fixture:
radar/gram-curve-newline-comma] [fixture: radar/gram-axis-before-comma-visible]
[fixture: radar/gram-curve-before-brace-visible] [fixture:
radar/gram-label-before-close-visible] [fixture: radar/gram-entry-empty]

A curve's entries are all positional numbers or all named entries; mixing the
two rejects in either order. Different curves in one comma group may choose
different forms. A named entry's colon is optional and its presence stays in the
written punctuation; lexical priority still applies. Newlines are allowed before
the first entry, after each comma and after the last entry, but not before an
entry comma or between a named entry's components. [fixture:
radar/gram-entry-mixed-detailed-first] [fixture:
radar/spec-radar-test-ts-59721355] [fixture:
radar/gram-detailed-line-after-colon] [fixture:
radar/gram-detailed-colon-mixed-spelling] [fixture:
radar/gram-detailed-entry-comment] [fixture: radar/gram-curve-kind-per-curve]
[fixture: radar/gram-entry-newline-after-comma] [fixture:
radar/gram-entry-newline-before-comma] [fixture:
radar/gram-named-entry-line-before-comma] [fixture:
radar/lex-bare-accessibility-ids]

An entry list cannot be empty, newline-only or end in a comma. Empty description
blocks are statements only where the body grammar takes them, not free ignored
forms inside entries. Native hidden LF consumption changes which newlines are
visible; it does not relax the surviving-newline restrictions. [fixture:
radar/gram-entry-empty] [fixture: radar/gram-entry-trailing-comma] [fixture:
radar/gram-empty-block-in-entries] [fixture: radar/gram-entry-empty-newlines]
[fixture: radar/gram-entry-block-after-number] [fixture:
radar/lex-hidden-entry-comma] [fixture:
radar/gram-entry-before-comma-native-spare] [fixture:
radar/common-block-empty-interleaved]

An options group has one or more options separated by commas, without visible
newlines after those commas. Another option without a comma starts another
group. showLegend takes only the fixed lowercase boolean words true/false;
ticks, max and min take number; graticule takes only the unquoted lowercase
words circle/polygon. A colon, quoted number, numeric boolean or quoted
graticule is not accepted. Missing option values and trailing commas reject.
[fixture: radar/db-options-repeat] [fixture: radar/gram-inline-statements]
[fixture: radar/gram-option-comma] [fixture: radar/gram-option-case] [fixture:
radar/gram-option-graticule-case] [fixture: radar/gram-option-boolean-number]
[fixture: radar/gram-option-graticule-string] [fixture:
radar/gram-option-no-value] [fixture: radar/gram-option-colon] [fixture:
radar/gram-option-quoted-number] [fixture: radar/gram-option-comma-trailing]

### Semantic acceptance conditions

The [parse wrapper][parse] rejects any lexer or parser error, including errors
on a recovered model, and requires complete input consumption. After the
grammar, acceptance depends on the following two conditions from
[computeCurveEntries()][db-entries]. Consider all axis declarations in the
diagram, including ones written after a curve; axis order does not restrict
references. [fixture: radar/error-start] [fixture: radar/error-after-prefix]
[fixture: radar/error-recovered-curve] [fixture: radar/db-forward-axis]

For every curve with named entries, at least one axis must be declared in the
diagram. That curve must contain at least one entry whose axis name exactly
equals each declared axis name. Missing any such entry rejects. Comparison is
case-sensitive and uses the written id name, never the axis label; equal labels
do not make different names equal. [fixture: radar/error-reference-no-axes]
[fixture: radar/error-reference-missing] [fixture: radar/error-reference-case]
[fixture: radar/error-reference-label] [fixture: radar/db-duplicate-axes]

Extra names, duplicate entries, duplicate axes/curves and prototype-shaped names
do not themselves reject. Positional entries need no axes and need not equal the
axis count. Options have no further semantic rejection: zero/fractional ticks,
numeric overflow or min above max remain accepted. The grammar's entry-form and
option-value restrictions still apply. [fixture: radar/db-extra-detailed-entry]
[fixture: radar/db-duplicate-axes] [fixture: radar/db-duplicate-curves]
[fixture: radar/db-prototype-names] [fixture: radar/db-detailed-zero-first]
[fixture: radar/db-detailed-zero-last] [fixture: radar/db-positional-no-axis]
[fixture: radar/db-positional-short] [fixture: radar/db-positional-long]
[fixture: radar/db-ticks-cap-fraction] [fixture: radar/db-number-overflow]
[fixture: radar/db-option-overflow] [fixture: radar/db-min-above-max]

### Db normalization

The [tests summary](../../../tests/docs/db-summaries.md#radar) defines Db
publication and normalization. The source tree retains declaration groups,
original entry forms and order, extra and duplicate named entries, all repeated
options and common statements, numeric spelling, label quotes and hidden forms.
Publication does not replace these nodes with resolved arrays, final options or
renderer results. [fixture: radar/gram-written-tree] [fixture:
radar/db-extra-detailed-entry] [fixture: radar/db-options-repeat] [fixture:
radar/common-repeat-empty] [fixture: radar/db-number-leading-zero-decimal]
[fixture: radar/db-empty-labels] [fixture: radar/lex-hidden-axis-comma]
[fixture: radar/lex-hidden-curve-comma] [fixture: radar/lex-hidden-option-comma]

### Configuration

The [adapter][adapter] and [Db acceptance checks][db-entries] do not read
radar.* configuration. Its drawing settings, including width/height, margins,
axisScaleFactor, axisLabelFactor, curveTension and useMaxWidth, do not change
acceptance. Configuration keys named showLegend, ticks, max, min or graticule do
not supply statement options. These radar settings, supplied by site,
frontmatter or init configuration, neither reject an otherwise valid radar
diagram nor rescue a missing named entry. No radar-specific acceptance key is
removed by the opaque-data comparison. [fixture: radar/config-drawing-only]
[fixture: radar/config-options-site] [fixture:
radar/config-frontmatter-options-cannot-reject] [fixture:
radar/config-init-options-cannot-reject] [fixture:
radar/config-site-invalid-cannot-rescue] [fixture:
radar/config-invalid-cannot-rescue] [fixture: radar/config-init-cannot-rescue]

## Known divergences

The following six existing identifiers apply. A whole native hidden form has a
RadarIgnoredText node and is not a reason to reject. Empty labels and empty
description statements are retained too; they are not tokenless-empty-forms.
[fixture: radar/lex-hidden-yaml-two-nonempty] [fixture:
radar/lex-hidden-native-body-separators] [fixture: radar/db-empty-labels]
[fixture: radar/common-block-empty-interleaved]

For
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md),
reject a global directive strictly inside an id, number or fixed word, including
boolean/graticule words and common keywords. An ignored-text node has no
position inside an indivisible atom. Between complete authored components, a
global directive is allowed: header word/colon, common keyword/colon or brace,
label brackets/string, entry axis/colon/number, and complete list members/comma.
A removed directive must still leave valid lexical boundaries. String,
common-value and native hidden text may contain it. [fixture:
radar/directive-header-middle] [fixture: radar/directive-axis-name] [fixture:
radar/directive-curve-name] [fixture: radar/directive-number] [fixture:
radar/directive-reference] [fixture: radar/div-directive-boolean-atom] [fixture:
radar/div-directive-graticule-atom] [fixture:
radar/div-directive-common-keyword] [fixture:
radar/gram-directive-composite-header] [fixture: radar/directive-common-colon]
[fixture: radar/common-block-directive-gap] [fixture: radar/directive-common]
[fixture: radar/directive-label-before-open] [fixture:
radar/directive-label-after-open] [fixture: radar/directive-label-before-close]
[fixture: radar/directive-entry-before-colon] [fixture:
radar/directive-entry-before-value] [fixture:
radar/directive-entry-no-colon-joins] [fixture: radar/directive-list-comma]
[fixture: radar/directive-curve-brace] [fixture:
radar/directive-option-space-control] [fixture:
radar/directive-title-space-control] [fixture: radar/directive-axis-label]
[fixture: radar/directive-curve-label] [fixture:
radar/lex-hidden-yaml-global-inside] [fixture:
radar/lex-hidden-yaml-opener-global] [fixture:
radar/lex-hidden-yaml-closer-global] [fixture:
radar/lex-hidden-native-opener-global] [fixture:
radar/lex-hidden-native-closer-global]

For
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md),
a selected semicolon strictly inside an id, number or fixed word likewise
rejects instead of joining fragments. A selected semicolon between complete
components or within text/string/hidden-form content is trivia. This rule does
not make ordinary semicolons separators. [fixture: radar/div-semicolon-id]
[fixture: radar/div-semicolon-number] [fixture: radar/div-semicolon-keyword]
[fixture: radar/div-semicolon-boolean-atom] [fixture:
radar/div-semicolon-graticule-atom] [fixture:
radar/gram-semicolon-between-units] [fixture:
radar/lex-hidden-yaml-opener-selected-control] [fixture:
radar/lex-hidden-native-opener-selected] [fixture: radar/style-fields] [fixture:
radar/tail-option-semicolon]

For [html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md),
body HTML quote reading starts after frontmatter; it does not carry an open
frontmatter tag into the body. This can change acceptance in either direction,
or change a common value while both readings accept. For
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md),
frontmatter and directive arguments are retained without validating their
content. The comparison removes only embedded data causing rejection and
preserves unrelated embedded values. [fixture: radar/div-html-frontmatter-cross]
[fixture: radar/div-html-frontmatter-reverse] [fixture:
radar/gram-html-body-only-double] [fixture: radar/gram-html-body-only-single]
[fixture: radar/div-html-frontmatter-value] [fixture: radar/frontmatter-invalid]
[fixture: radar/frontmatter-invalid-keeps-config] [fixture:
radar/config-invalid-display-mode]

For
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md),
detection-passed lines and accompanying whitespace remain trivia even where
Mermaid's lexer rejects the whitespace. For
[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md), a radar
header selects radar even if later value/name text contains C4Container,
C4Component, C4Dynamic or C4Deployment. LF-terminated comment controls and
C4Context follow ordinary detection. [fixture: radar/bare-before-header-nbsp]
[fixture: radar/bare-line-ls] [fixture:
radar/div-detect-yaml-bare-secondscan-native-ls] [fixture:
radar/detect-yaml-bare-secondscan-native-ascii] [fixture:
radar/detect-retained-no-bare-control] [fixture: radar/c4-container-title]
[fixture: radar/c4-component-axis-label] [fixture: radar/c4-dynamic-reference]
[fixture: radar/c4-deployment-line] [fixture: radar/c4-container-header-lf]
[fixture: radar/c4-context-title]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/radar/radar.langium#L1-L55
[common]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L6-L34
[builder]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/radar/tokenBuilder.ts#L1-L7
[common-builder]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/tokenBuilder.ts#L6-L31
[module]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/radar/module.ts#L1-L74
[parse]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L149
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/parser.ts#L8-L24
[db-entries]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/db.ts#L56-L91
[detector]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/detector.ts#L7-L11
[order]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L124
