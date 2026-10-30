# Wardley

Japanese version: [wardley.ja.md](./wardley.ja.md)

This document defines wardley syntax and acceptance. Its
[source tree](../ast/wardley.md) preserves authored forms; the
[tests summary](../../../tests/docs/db-summaries.md#wardley) defines derived Db
values. The sources are [wardley.langium][grammar] and [common.langium][common].
[fixture: wardley/db-all-fields] [fixture: wardley/header-only]

## Detection

Entry 37 of [detection.md](../detection.md), the [wardleyDetector.ts][detector],
compares the prefix wardley-beta case-insensitively with no suffix boundary. The
grammar accepts only the lowercase header. Uppercase spelling, a repeated
header, a colon or an otherwise unreadable suffix rejects. The header needs no
EOL: a following statement can be glued directly to it. Root.diagramType is
wardley. [fixture: wardley/header-only] [fixture: wardley/header-upper]
[fixture: wardley/header-double] [fixture: wardley/header-punctuation] [fixture:
wardley/header-letter] [fixture: wardley/header-word] [fixture:
wardley/header-dash] [fixture: wardley/header-unicode] [fixture:
wardley/header-glued-statement] [fixture: wardley/header-inline]

Apply [common preprocessing](../common.md#reading-a-source), including real
leading frontmatter, global directives, comment regions, leading whitespace,
line conversion, HTML attribute quotes, entities and selected semicolons.
[diagram-orchestration.ts][order] registers Wardley after C4; later C4 words
therefore need the shared header-selection divergence below. [fixture:
wardley/frontmatter-title] [fixture: wardley/space-bom-leading] [fixture:
wardley/line-cr] [fixture: wardley/line-crlf] [fixture: wardley/html-texts]
[fixture: wardley/entity-texts] [fixture: wardley/style-every-text] [fixture:
wardley/c4-component-component] [fixture: wardley/c4-component-header-lf]

Real frontmatter is shared Frontmatter. At the detection point, pass at most one
retained block satisfying the
[common frontmatter shape](../common.md#frontmatter), before bare percent-pair
lines and the second directive scan. It remains diagram text, must match
hidden-yaml, belongs to WardleyDiagram.textBeforeHeader and applies no YAML
properties. Real frontmatter may precede this separate block. [fixture:
wardley/detect-block-after-directive] [fixture:
wardley/detect-block-after-frontmatter] [fixture: wardley/detect-two-blocks]
[fixture: wardley/detect-real-before-retained-secondscan]

Adjacent fences without a body line, a missing closer, mismatched indentation,
four opening dashes, closing suffix text and a closer without a following line
break, including EOF, stop that skip. Three adjacent fences can supply a body
line. Leading trimming can remove just the opening indentation. Passing
detection never relaxes native opener or closer boundaries. [fixture:
wardley/detect-empty-after-directive] [fixture: wardley/detect-retained-missing]
[fixture: wardley/detect-retained-indent-mismatch] [fixture:
wardley/detect-retained-four-dashes] [fixture:
wardley/detect-retained-close-suffix] [fixture:
wardley/detect-retained-close-no-lf] [fixture:
wardley/detect-retained-close-eof] [fixture:
wardley/detect-retained-three-fences] [fixture:
wardley/detect-retained-opening-indent] [fixture:
wardley/detect-body-equal-indentation] [fixture:
wardley/detect-retained-opening-nbsp] [fixture:
wardley/detect-retained-closing-u3000]

A second retained block, a block after a passed bare line and a block after a
second-scan directive are not passed. Retained YAML followed by a second-scan
directive is readable; reversing the order fails detection. Read retained forms
from the detection point, not only from the reached header. [fixture:
wardley/detect-retained-two] [fixture: wardley/retained-yaml-between-bares]
[fixture: wardley/detect-block-after-bare-brace] [fixture:
wardley/prefix-yaml-before-secondscan] [fixture:
wardley/prefix-yaml-after-secondscan]

A directive formed only by the second scan remains diagram text and is read as
hidden-directive in textBeforeHeader. Its native closing boundary still applies;
gluing the header to the closer rejects. Keep multiple retained forms separate,
including forms after real frontmatter and a retained YAML block. [fixture:
wardley/prefix-secondscan] [fixture: wardley/prefix-secondscan-multiline]
[fixture: wardley/detect-secondscan-glued] [fixture:
wardley/detect-two-secondscans] [fixture:
wardley/detect-real-before-retained-secondscan]

Passed bare percent-pair lines, including percent-brace forms that are not
global directives, are shared Comments with mark %% and are not read again.
Their accompanying whitespace and line breaks are trivia, also before or between
retained forms. ASCII space/tab controls accept. Passed Unicode trivia
immediately before the header or on its own line can differ from Mermaid under
bare-percent-line-before-header. Without a passed bare line, later native
Unicode gaps can still reject. [fixture:
wardley/retained-directive-between-bares] [fixture:
wardley/prefix-directive-between-bare-unicode] [fixture:
wardley/detect-retained-secondscan-bare-ascii] [fixture:
wardley/detect-retained-secondscan-bare-ls] [fixture: wardley/bare-before-space]
[fixture: wardley/bare-before-tab] [fixture: wardley/bare-before-ls] [fixture:
wardley/bare-before-ps] [fixture: wardley/bare-line-ls] [fixture:
wardley/bare-line-ps] [fixture: wardley/prefix-yaml-bare-unicode] [fixture:
wardley/prefix-yaml-unicode-no-bare] [fixture: wardley/retained-no-bare-unicode]

## Lexical structure

### Ordered units

Read converted diagram text, excluding common trivia and detection-passed
intervals. At each unit start take the first applicable rule below and restart
after it. There is no general longest-match choice. The [module.ts][module] uses
the default token builder and its own [valueConverter.ts][wardley-converter]; it
installs no custom keyword matcher or validator. Unreadable characters reject
the entire input, even when a recovered model exists. [fixture:
wardley/db-all-fields] [fixture: wardley/error-start] [fixture:
wardley/error-after-prefix] [fixture: wardley/error-recovered]

| Priority | Units, from left to right                                                   |
| -------- | --------------------------------------------------------------------------- |
| 1        | `[ , ] @ / ( ) - { }`                                                       |
| 2        | decimal, dependency-arrow, port, link-arrow, link-label, strategy           |
| 3        | wardley-beta, size, evolution, anchor, component, label, inertia            |
| 4        | evolve, pipeline, note, annotations, annotation, accelerator, deaccelerator |
| 5        | spaced-name, native space/tab padding                                       |
| 6        | acc-descr-line / acc-descr-block, acc-title-line, title-line                |
| 7        | integer, string, id-name, newline                                           |
| 8        | hidden-yaml, hidden-directive, native-comment                               |

The fixtures illustrate the unit priorities in the table. [fixture:
wardley/keywords-all-glued] [fixture: wardley/db-link-forms] [fixture:
wardley/hidden-yaml-component-gaps] [fixture: wardley/lex-name-priority]
[fixture: wardley/common-repeat]

The minus punctuation has dependency-arrow, link-arrow and hidden-yaml as longer
alternatives, in that order, when they match more text. Other punctuation has
none. Keyword and strategy terminals have no longer alternative and no trailing
boundary. Imported BOOLEAN, FLOAT, NUMBER and space/tab padding are unreachable
and supply no units. The imported padding has the same form as native space/tab
padding, whose earlier rule always matches first. [fixture: wardley/space-tabs]
[fixture: wardley/space-lines] The effective order follows
[wardley.langium][terminals] and [common.langium][common]. [fixture:
wardley/db-link-forms] [fixture: wardley/hidden-yaml-block] [fixture:
wardley/keywords-all-glued] [fixture: wardley/number-integer-coordinate]

### Keyword and name boundaries

A strategy is build, buy, outsource or market, in that priority order. [fixture:
wardley/db-inertia-forms] [fixture: wardley/spec-wardley-parser-95189f48]

All Wardley command/header keywords and strategy values use their exact
lowercase spelling without a word or whitespace boundary. Thus componentA and
anchor_A split at their keyword prefixes; annotations precedes annotation. A
global directive glued after a complete keyword does not add a boundary
requirement after its removal. A split keyword instead follows the atomic
divergence below. [fixture: wardley/keywords-all-glued] [fixture:
wardley/keywords-letter] [fixture: wardley/anchor-word] [fixture:
wardley/annotations-letter] [fixture: wardley/annotation-letter] [fixture:
wardley/strategy-prefix] [fixture: wardley/strategy-upper] [fixture:
wardley/directive-keyword-glued] [fixture: wardley/directive-keyword-middle]
[fixture: wardley/directive-header-inside]

An id-name starts with an ASCII letter, digit or underscore, continues with
those characters or hyphens and ends with a word character. Earlier rules still
win: integer takes the 9 of 9a, whereas _a is a name. Non-ASCII bare names
reject. Quoting a name avoids these keyword and bare-name restrictions.
[fixture: wardley/lex-id-forms] [fixture: wardley/db-id-underscore] [fixture:
wardley/lex-name-nonascii] [fixture: wardley/lex-keyword-name-quoted] [fixture:
wardley/db-prototype-names]

A spaced-name starts with an ASCII letter. Continue with ASCII letters, digits,
underscore, parentheses, ampersand, or a hyphen not immediately followed by >.
Then repeat a nonempty space/tab run and another part starting with an ASCII
letter or opening parenthesis, followed by the same continuation characters.
Take as much as this form allows. Internal space/tab is authored name text;
trailing padding is outside the name. A space followed by ampersand cannot start
another part. [fixture: wardley/db-unquoted-names] [fixture:
wardley/spec-wardley-parser-069bb337] [fixture:
wardley/spec-wardley-parser-2ba74bc6] [fixture:
wardley/lex-native-after-name-space] [fixture: wardley/lex-name-trailing-space]
[fixture: wardley/lex-name-spaces] [fixture: wardley/space-tabs]

Do not try spaced-name when its start is title followed by common whitespace, or
begins with accTitle or accDescr. Later common forms or id-name may read that
position instead. Thus title immediately before [ can be a name, title followed
by a space is taken as metadata, and accTitlex can be id-name but accTitlex Foo
cannot be one component name. A reserved prefix at the start is distinct from a
keyword inside an already-started spaced-name: builder rejects as a component
name, while My builder is a single name. [fixture: wardley/lex-name-title-glued]
[fixture: wardley/lex-name-title-with-space] [fixture:
wardley/lex-name-title-prefix] [fixture: wardley/lex-name-acctitle-multiword]
[fixture: wardley/lex-name-priority] [fixture: wardley/lex-name-inner-keyword]

Lexical priority also decides arrow boundaries: A->B has name A and
dependency-arrow ->, but A-->B has name A- and dependency-arrow ->. A-.->B
rejects at its dot. Padding before the longer or dashed arrow lets it be read as
a whole. An uppercase Evolution A -> B is a link from the name Evolution A, not
an evolution statement. [fixture: wardley/spec-wardley-parser-14953f7f]
[fixture: wardley/lex-link-long-arrow-glued] [fixture:
wardley/lex-link-dashed-arrow-glued] [fixture: wardley/db-link-forms] [fixture:
wardley/evolution-upper]

### Numbers

A decimal is a nonempty ASCII digit run, one dot and a nonempty ASCII digit run.
Leading zeros are allowed. An integer is 0, tried first, or a nonzero ASCII
digit followed by as many ASCII digits as possible without ending immediately
before a dot. Decimal precedes integer. Leading-zero integers consequently split
and reject where one integer is required. Plus, negative decimals, exponent
notation, a missing side of the dot, NaN and Infinity spellings are not numeric
units. [fixture: wardley/number-leading-zero] [fixture:
wardley/number-int-leading-zero] [fixture:
wardley/lex-number-int-annotation-leading-zero] [fixture: wardley/number-plus]
[fixture: wardley/number-negative-zero] [fixture: wardley/number-exponent]
[fixture: wardley/number-leading-dot] [fixture: wardley/number-trailing-dot]
[fixture: wardley/number-nan] [fixture: wardley/number-infinity] [fixture:
wardley/number-suffix]

Coordinates of anchors, components, notes and forces, pipeline evolution values,
evolve targets and stage boundaries require decimal. Annotation and
annotations-box coordinates allow decimal or integer. Size dimensions,
annotation numbers and offset magnitudes require integer. An offset minus is
separate punctuation, so space/tab or whole hidden forms may separate it from
the unsigned magnitude. A decimal offset or size dimension rejects. [fixture:
wardley/number-integer-coordinate] [fixture:
wardley/lex-number-boundary-integer] [fixture:
wardley/lex-number-evolve-integer] [fixture: wardley/db-coordinate-boundary]
[fixture: wardley/lex-number-offset-decimal] [fixture:
wardley/lex-number-size-decimal] [fixture:
wardley/lex-number-offset-separated-minus] [fixture:
wardley/hidden-yaml-component-gaps]

NumericLiteral preserves the original number spelling and its double value,
before coordinate normalization. Integers and decimals use the converter
fallback in [module.ts][module] and the shared double definition. Rounding,
subnormal values, underflow and overflow do not change raw. Offset magnitudes
remain unsigned leaves; the written sign is held separately, including minus
zero. Coordinate acceptance compares the double as defined below. [fixture:
wardley/db-number-int-precision] [fixture: wardley/db-number-subnormal]
[fixture: wardley/db-number-underflow] [fixture: wardley/db-number-overflow]
[fixture: wardley/number-offset-negative-zero] [fixture:
wardley/db-coordinate-double-hundred] [fixture:
wardley/db-coordinate-double-one] [fixture:
wardley/lex-coordinate-above-boundary]

### Strings and link labels

A string uses matching single or double quotes, may be empty and must close.
Read nonmatching-quote, nonbackslash characters or a backslash with exactly one
following character until the unescaped matching quote. The character after a
backslash cannot be a normalized LF, U+2028 or U+2029. Unescaped physical line
breaks and both separators are content. A missing closer or dangling backslash
rejects. Common quote conversion applies before this matching; authored quotes
and escape spelling remain in StringLiteral.raw. [fixture:
wardley/db-empty-texts] [fixture: wardley/lex-string-escaped-quotes] [fixture:
wardley/lex-string-multiline] [fixture: wardley/line-string-values] [fixture:
wardley/lex-string-escaped-lf] [fixture: wardley/lex-string-escaped-ls]
[fixture: wardley/lex-string-escaped-ps] [fixture:
wardley/lex-string-open-single] [fixture: wardley/lex-string-open-double]
[fixture: wardley/lex-string-dangling-backslash] [fixture: wardley/html-texts]

For semantic comparison only, a string escape b, f, n, r, t, v or 0 reads its
corresponding control character. Any other escaped character reads that next
character without the backslash: backslash-q reads q and backslash-u0041 reads
u0041, not a Unicode escape. Bare names and string contents are not trimmed or
whitespace-collapsed. Tree values retain authored text instead of this
comparison conversion. [fixture: wardley/lex-string-conversion] [fixture:
wardley/lex-string-escaped-quotes] [fixture:
wardley/gram-reference-decoded-escape] [fixture:
wardley/gram-reference-same-whitespace] [fixture:
wardley/gram-reference-case-mismatch] [fixture:
wardley/gram-reference-unicode-mismatch] [fixture: wardley/space-name-values]

A port is +<>, +> or +<, in that priority order. A dependency-arrow is ->. A
link-arrow is -->, -.->, >, or a labeled flow consisting of +, single-quoted
content and the marker <>, < or >. Flow content contains any characters except
single quote, including line breaks and U+2028/U+2029, and may be empty.
Backslash is ordinary there and cannot escape a quote. Its label does not use
the string escape conversion. [fixture: wardley/db-link-forms] [fixture:
wardley/line-every-text] [fixture: wardley/lex-link-flow-raw-escapes] [fixture:
wardley/lex-link-flow-quote-not-escapable] [fixture:
wardley/lex-flow-label-changes-direction] [fixture:
wardley/lex-flow-label-changes-bidirectional] [fixture:
wardley/lex-flow-label-changes-dashed] [fixture:
wardley/lex-flow-label-changes-dashed-short]

A link-label is a semicolon followed by one or more characters other than CR/LF,
taking the rest of that physical line. Bare semicolon rejects; semicolon-space
is a nonempty authored literal even when its derived value is empty, and two
semicolons give content consisting of the second one. U+2028/U+2029 and
native-looking hidden forms remain label content. Keep this label separately
even when a flow label takes precedence in the Db. Derived label and flow rules
belong to the tests summary, not the authored arrow fields. [fixture:
wardley/tail-link-empty-label] [fixture: wardley/tail-link-spaced-label]
[fixture: wardley/tail-link-double-label] [fixture:
wardley/line-link-label-values] [fixture:
wardley/lex-hidden-directive-multiline-label] [fixture: wardley/db-link-forms]
[fixture: wardley/lex-flow-port-wins]

### Common metadata values

Title-line is title and an optional separator of exactly one ASCII space/tab
followed by line content. Acc-title-line and acc-descr-line have their exact
keyword, optional space/tab, colon and line content. Line content stops
immediately before the first %% or CR/LF; quotes are ordinary text and need not
close. Title-colon is not a title form. Earlier spaced-name exclusions still
apply. [fixture: wardley/common-title-eof] [fixture: wardley/common-title-tabs]
[fixture: wardley/common-title-two-spaces] [fixture:
wardley/common-line-whitespace] [fixture: wardley/common-acctitle-eof] [fixture:
wardley/common-description-eof] [fixture: wardley/common-open-quote] [fixture:
wardley/common-quoted-values] [fixture: wardley/common-title-colon]

Acc-descr-block has accDescr, optional common whitespace, opening brace and
content through the first closing brace. The closer is required. Quotes and
backslashes do not protect a closing brace. Internal line breaks, indentation,
bare percent lines and native-looking YAML remain content unless a shared
removal applies; native-directive-looking text can instead close the block at
its first brace. [fixture: wardley/common-block-empty-gap] [fixture:
wardley/common-block-comment-gap] [fixture: wardley/common-block-directive-gap]
[fixture: wardley/common-block-open] [fixture: wardley/common-block-first-close]
[fixture: wardley/common-block-escaped-close] [fixture:
wardley/common-block-bare-percent] [fixture: wardley/hidden-yaml-block]
[fixture: wardley/hidden-directive-block] [fixture:
wardley/common-block-comment]

The tree uses four separate statements. A title value starts after exactly one
written separator; accessibility line values start immediately after the colon.
Keep remaining padding, quotes, entities, escapes and source line endings as
WardleyLiteral text, omitting shared trivia. No remaining line content means
null, whereas whitespace-only line content is a literal. A block value removes
common whitespace only at its outer ends; no content then means null, but the
empty block still makes a statement. Repeated occurrences stay separate.
[AbstractMermaidValueConverter][converter] and
[populateCommonDb][populate-common] determine derived metadata as described by
the tests summary. [fixture: wardley/common-empty-literals] [fixture:
wardley/common-title-two-spaces] [fixture: wardley/common-title-tabs] [fixture:
wardley/common-block-whitespace] [fixture: wardley/common-line-ls-ps] [fixture:
wardley/line-block-values] [fixture: wardley/common-repeat] [fixture:
wardley/common-repeat-empty] [fixture: wardley/frontmatter-empty-body-title]
[fixture: wardley/directive-every-field]

### Native padding, hidden forms and EOL

Native padding is a nonempty ASCII space/tab run. Newline is visible LF after
common CR/CRLF conversion. EOL is one or more visible newlines or end-of-text.
Other common whitespace, including BOM, NBSP, U+2028 and U+2029, is not general
body padding. Enclosing values and hidden boundaries have their own rules. The
LF appended after the source is never part of an authored value or range.
[fixture: wardley/space-tabs] [fixture: wardley/space-lines] [fixture:
wardley/line-cr] [fixture: wardley/line-crlf] [fixture: wardley/space-bom-body]
[fixture: wardley/space-nbsp-body] [fixture: wardley/line-ls-gap] [fixture:
wardley/line-ps-eof] [fixture: wardley/hidden-directive-eof] [fixture:
wardley/hidden-yaml-eof]

Hidden-yaml starts with three dashes, optional ASCII space/tab and a line break.
Try a body ending in a line break before the empty-body alternative; within that
first alternative take as little body as allows a qualifying closer. A closer is
three dashes at the beginning of a line, followed by a consumed line break or a
nonconsumed common-whitespace/end boundary. It need not use the opener’s
indentation. An indented closer or four closing dashes is not that closer.
[fixture: wardley/hidden-yaml-nested] [fixture:
wardley/hidden-yaml-adjacent-eof] [fixture: wardley/hidden-yaml-adjacent-later]
[fixture: wardley/hidden-yaml-adjacent-no-later] [fixture:
wardley/lex-hidden-yaml-closer-indented] [fixture:
wardley/lex-hidden-yaml-four-dashes] [fixture:
wardley/hidden-yaml-closing-space]

This alternative order can make three fences one whole match: two adjacent
fences followed by another closer may enclose intervening apparent statements.
Two nonempty YAML blocks remain separate. An opener may follow a complete unit,
but earlier name greediness can take its dashes instead. A qualifying hidden
closer followed by U+2028/U+2029 only sees that whitespace as its boundary; it
does not consume it, and unreadable remaining padding rejects. [fixture:
wardley/hidden-yaml-adjacent-later] [fixture: wardley/hidden-yaml-nested]
[fixture: wardley/hidden-yaml-unit-gap] [fixture: wardley/hidden-after-link]
[fixture: wardley/hidden-yaml-closing-ls] [fixture:
wardley/detect-retained-closing-u3000] [fixture:
wardley/lex-native-directive-closing-ls]

Hidden-directive starts with optional ASCII space/tab and %%{, reads any
characters as few as possible through a qualifying }%%, then consumes a
following line break or only tests a common-whitespace/end boundary. If an early
closer is glued to nonwhitespace, try a later qualifying closer. If the whole
rule fails, native-comment can read the percent pair and the rest of its line,
including apparent following syntax. A native comment stops before CR/LF and
consumes no line break. Its mark is %%; a single percent is not a comment.
[fixture: wardley/hidden-directive-adjacent] [fixture:
wardley/lex-hidden-directive-later-closer] [fixture:
wardley/hidden-directive-no-boundary] [fixture: wardley/comment-eof] [fixture:
wardley/comment-native-triple] [fixture: wardley/comment-single-percent]

Strings, flow content, link-label and common values take earlier enclosed text
before native hidden rules are tried; they do not create duplicate ignored
nodes. A common line value stops at %% and a description block at its first
brace, so native-looking text can stop those earlier units. Shared directives,
comment regions and selected semicolons retain their common scope inside hidden
forms. Their removal can join hidden punctuation or comment marks. [fixture:
wardley/hidden-directive-string] [fixture: wardley/hidden-yaml-string] [fixture:
wardley/hidden-yaml-title] [fixture: wardley/hidden-yaml-acctitle] [fixture:
wardley/hidden-yaml-description] [fixture: wardley/hidden-yaml-block] [fixture:
wardley/hidden-directive-block] [fixture: wardley/hidden-directive-title]
[fixture: wardley/lex-hidden-directive-multiline-label] [fixture:
wardley/lex-hidden-yaml-common-directive] [fixture:
wardley/lex-hidden-yaml-comment-region] [fixture:
wardley/directive-native-opener-split] [fixture:
wardley/directive-native-yaml-closer] [fixture:
wardley/directive-native-directive-opener] [fixture:
wardley/lex-selected-native-yaml-opener] [fixture:
wardley/lex-selected-native-directive-opener]

A whole hidden form is WardleyIgnoredText, from its opener through its
qualifying closer, excluding preceding padding and any immediately consumed
final line break. Preserve internal authored line endings. Keep each match
exactly once in its [named owner](../ast/wardley.md). Native forms have no
frontmatter or configuration effect; an independent global directive inside one
retains its own effect. Comments are shared Comment records instead. [fixture:
wardley/lex-hidden-directive-cr] [fixture: wardley/lex-hidden-yaml-cr] [fixture:
wardley/hidden-yaml-crlf] [fixture: wardley/lex-hidden-two-suffixes] [fixture:
wardley/lex-hidden-yaml-common-directive] [fixture:
wardley/comment-line-in-string] [fixture: wardley/prefix-secondscan]

Consume a hidden form’s following LF before testing EOL. A sole consumed LF
between statements is insufficient; a spare visible LF, space before LF at the
closer, or EOF can satisfy the ending. Header-following hidden forms need no
visible EOL. A pipeline opener instead needs a visible LF after any consumed
hidden ending, and each child needs its own EOL. After a visible EOL, following
hidden forms belong to body rather than the previous suffix. [fixture:
wardley/hidden-directive-sole-lf] [fixture: wardley/hidden-directive-spare-lf]
[fixture: wardley/hidden-directive-closing-space] [fixture:
wardley/hidden-directive-eof] [fixture: wardley/hidden-yaml-sole-lf] [fixture:
wardley/hidden-yaml-spare-lf] [fixture: wardley/hidden-yaml-eof] [fixture:
wardley/lex-hidden-header-no-eol] [fixture: wardley/hidden-pipeline-open-gap]
[fixture: wardley/lex-hidden-pipeline-open-spare] [fixture:
wardley/hidden-pipeline-eol] [fixture: wardley/lex-hidden-pipeline-child-spare]
[fixture: wardley/lex-hidden-pipeline-before-close] [fixture:
wardley/lex-hidden-after-visible-eol] [fixture:
wardley/lex-hidden-common-prefix-eol]

### Common boundaries in authored components

Global directives and semicolons actually selected by the shared line rule may
lie between complete authored components. A coordinate pair has bracket, number,
comma, number and bracket components; offset sign and integer are separate;
strategy and parenthesized inertia have parenthesis, fixed word and parenthesis
components. Stage names, @, boundary, slash and second name also have separate
boundaries. Common metadata separates its complete word from colon, brace or
title separator. [fixture: wardley/directive-coordinate-parts] [fixture:
wardley/directive-offset-sign] [fixture: wardley/directive-strategy-parts]
[fixture: wardley/directive-parenthesized-inertia-parts] [fixture:
wardley/lex-selected-parenthesized-inertia-parts] [fixture:
wardley/lex-hidden-evolution-members] [fixture: wardley/directive-common-colon]
[fixture: wardley/lex-selected-coordinate-parts] [fixture:
wardley/lex-selected-offset-sign] [fixture: wardley/lex-selected-strategy-parts]

A labeled flow has +, its whole quoted label and its ending marker as authored
components. Global trivia may separate those components and may lie inside label
text. A dependency arrow, a whole port and the <> marker are indivisible glyphs.
A fixed keyword, strategy word, integer, decimal or id-name is also indivisible.
A spaced-name is a text unit and can contain shared removals. Internal atom
splits reject under the two atomic divergences below. [fixture:
wardley/directive-flow-before-label] [fixture:
wardley/directive-flow-after-label] [fixture: wardley/directive-every-field]
[fixture: wardley/directive-name-inside] [fixture: wardley/directive-id-inside]
[fixture: wardley/directive-strategy-inside] [fixture:
wardley/directive-arrow-inside] [fixture: wardley/directive-port-inside]
[fixture: wardley/directive-flow-marker-inside] [fixture:
wardley/lex-selected-flow-after-label] [fixture:
wardley/lex-selected-flow-label-inside] [fixture:
wardley/lex-selected-flow-marker-inside] [fixture:
wardley/lex-selected-arrow-inside] [fixture:
wardley/lex-selected-target-id-inside] [fixture:
wardley/lex-selected-port-inside] [fixture: wardley/lex-selected-label-keyword]
[fixture: wardley/lex-selected-strategy-inside] [fixture:
wardley/lex-selected-decimal-inside] [fixture: wardley/common-keyword-directive]

This permission adds no ordinary whitespace or native-hidden gap inside a
composite flow or metadata unit, and never joins separate native numbers or
names. A semicolon before the qualifying style/hash text may not be selected at
all; such a semicolon still rejects outside permitted values. Detection precedes
selected-semicolon removal, so a split header can fail detection before the
atomic rule applies. [fixture: wardley/lex-link-native-flow-components]
[fixture: wardley/lex-native-common-keyword-colon] [fixture:
wardley/lex-native-inside-number] [fixture:
wardley/lex-native-between-name-chunks] [fixture:
wardley/lex-selected-keyword-inside] [fixture: wardley/lex-selected-flow-parts]
[fixture: wardley/lex-selected-header-before-detection]

## Grammar

```text
diagram = newline* "wardley-beta" (newline | common-statement eol | statement)* end-of-text
statement = (anchor | component | link | evolve | pipeline | note
           | annotations | annotation | accelerator | deaccelerator
           | evolution-statement | size) eol
name = string | id-name | spaced-name
coordinates = "[" decimal "," decimal "]"
annotation-coordinates = "[" coordinate-value "," coordinate-value "]"
coordinate-value = decimal | integer
anchor = "anchor" name coordinates
component = "component" name coordinates label-offset? source-strategy? inertia-decoration?
label-offset = "label" "[" "-"? integer "," "-"? integer "]"
source-strategy = "(" strategy ")"
inertia-decoration = "inertia" | "(" "inertia" ")"
link = name port? (dependency-arrow | link-arrow)? name port? link-label?
evolve = "evolve" name decimal
pipeline = "pipeline" name "{" newline+ pipeline-component+ "}"
pipeline-component = "component" name "[" decimal "]" label-offset? eol
note = "note" string coordinates
annotations = "annotations" annotation-coordinates
annotation = "annotation" integer "," annotation-coordinates string
accelerator = "accelerator" name coordinates
deaccelerator = "deaccelerator" name coordinates
evolution-statement = "evolution" stage (dependency-arrow stage)+
stage = name ("@" decimal)? ("/" name)?
size = "size" "[" integer "," integer "]"
common-statement = title-line | acc-title-line | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

Use [common notation](../common.md#notation) and the lexical rules above. Native
hidden forms have their stated owners without supplying visible EOL. Body can be
empty. Each ordinary or common statement requires EOL; only the header is free
of that requirement. Components of a statement admit no unstated visible
newline. [fixture: wardley/header-only] [fixture: wardley/header-inline]
[fixture: wardley/tail-all-spaces] [fixture: wardley/gram-component-empty-gap]
[fixture: wardley/gram-component-comment-gap] [fixture:
wardley/gram-component-directive-gap] [fixture:
wardley/common-empty-block-same-line] [fixture: wardley/common-title-empty-gap]
[fixture: wardley/common-acctitle-empty-gap] [fixture:
wardley/common-description-empty-gap]

| Rule                                 | Tree node                                                        |
| ------------------------------------ | ---------------------------------------------------------------- |
| diagram                              | WardleyDiagram                                                   |
| anchor                               | WardleyAnchorStatement                                           |
| component                            | WardleyComponentStatement                                        |
| link                                 | WardleyLinkStatement                                             |
| evolve                               | WardleyEvolveStatement                                           |
| pipeline                             | WardleyPipelineStatement                                         |
| pipeline-component                   | WardleyPipelineComponent                                         |
| note                                 | WardleyNoteStatement                                             |
| annotations                          | WardleyAnnotationsStatement                                      |
| annotation                           | WardleyAnnotationStatement                                       |
| accelerator                          | WardleyAcceleratorStatement                                      |
| deaccelerator                        | WardleyDeacceleratorStatement                                    |
| evolution-statement / stage          | WardleyEvolutionStatement / WardleyEvolutionStage                |
| size                                 | WardleySizeStatement                                             |
| coordinates / annotation-coordinates | WardleyCoordinates                                               |
| label-offset                         | WardleyLabelOffsetDecoration                                     |
| source-strategy                      | WardleySourceStrategyDecoration                                  |
| bare / parenthesized inertia         | WardleyInertiaDecoration / WardleyParenthesizedInertiaDecoration |
| dependency-arrow / link-arrow        | WardleyArrow                                                     |
| title-line / acc-title-line          | WardleyTitleStatement / WardleyAccTitleStatement                 |
| acc-descr-line / acc-descr-block     | WardleyAccDescrStatement / WardleyAccDescrBlockStatement         |

The fixtures illustrate the statement and value forms in the table. [fixture:
wardley/db-all-fields] [fixture: wardley/db-inertia-forms] [fixture:
wardley/db-link-forms] [fixture: wardley/common-repeat]

A component has at most one label offset, one source strategy and one inertia
decoration, in that order. Inertia can be bare or parenthesized. Anchors have no
decorations. There is no class assignment syntax: class is not an authored field
of these statements. Unknown or repeated decorations, reversed order and
data-block syntax reject. [fixture: wardley/db-inertia-forms] [fixture:
wardley/gram-label-order] [fixture: wardley/gram-decorator-order] [fixture:
wardley/gram-component-class-unsupported] [fixture:
wardley/gram-anchor-decoration-rejected] [fixture:
wardley/gram-component-inertia-duplicate] [fixture:
wardley/gram-component-strategy-duplicate] [fixture: wardley/gram-data-block]
[fixture: wardley/strategy-upper]

Pipeline body contains one or more pipeline components, not nested pipeline
statements or common metadata. Empty description blocks are therefore rejected
both on their own body line and on the opening brace’s line. The opening brace
must be followed by visible newline. Child components have one evolution value
and only optional label offset; they require EOL before the closing brace.
Empty, inline and unclosed bodies reject. Blank/comment lines can lie in the
allowed newline runs. A line containing only a global directive is allowed
because common preprocessing removes the directive before the Wardley grammar
reads the body. U+2028 rejects immediately after the opening brace and between
children; it supplies neither visible LF nor native padding. [fixture:
wardley/directive-pipeline-line] [fixture:
wardley/gram-pipeline-empty-description] [fixture:
wardley/gram-pipeline-open-empty-description] [fixture:
wardley/lex-pipeline-open-ls] [fixture:
wardley/lex-pipeline-between-children-ls] [fixture: wardley/gram-empty-pipeline]
[fixture: wardley/gram-pipeline-inline] [fixture: wardley/gram-pipeline-open]
[fixture: wardley/gram-pipeline-nondeclaration-lines] [fixture:
wardley/gram-pipeline-nested-body] [fixture:
wardley/gram-pipeline-child-strategy-rejected] [fixture:
wardley/gram-pipeline-blank-child-gap] [fixture:
wardley/gram-pipeline-blank-before-first] [fixture:
wardley/spec-wardley-parser-2c2c9064]

A link permits either or both ports and an optional arrow. Two quoted names can
form a link with no arrow; two bare words can instead be one greedy name and
leave no target. Unresolved endpoints, duplicates and self links are allowed.
Evolve writes a name and decimal target even when no node will be found. Notes
and annotations require a string, including an empty one. [fixture:
wardley/db-bare-link] [fixture: wardley/lex-link-target-port-no-arrow] [fixture:
wardley/lex-link-no-arrow-bare-greedy] [fixture:
wardley/db-link-unresolved-duplicates] [fixture: wardley/db-trend-missing]
[fixture: wardley/db-empty-texts]

Evolution has at least two stages separated by ->; an optional boundary precedes
an optional second name. Empty quoted stage names, repeated stages and partial
boundaries remain written syntax. There is no trailing stage separator or extra
coordinate/size comma. The documentation’s trend-indicator spelling is not an
additional grammar production. [fixture: wardley/gram-evolution-single]
[fixture: wardley/db-stage-empty-second-name] [fixture:
wardley/db-stages-boundaries] [fixture: wardley/gram-stage-trailing-arrow]
[fixture: wardley/gram-coordinate-trailing-comma] [fixture:
wardley/gram-size-trailing-comma] [fixture:
wardley/gram-trend-indicator-unsupported] [fixture: wardley/db-all-fields]

### Semantic acceptance conditions

The public [parse][parse] rejects any lexer or parser error, including an error
attached to a recovered model and an unread trailing unit. After complete
parsing, [wardleyParser.ts][adapter] applies the conditions below. It has no
separate validation phase. The [WardleyBuilder.build][builder-build]
coordinate-presence check adds no further reachable rejection on this text path,
because every registered node receives coordinates. [fixture:
wardley/error-start] [fixture: wardley/error-after-prefix] [fixture:
wardley/error-recovered] [fixture: wardley/db-all-fields]

A comparison name is the common converted form of its authored name, with string
quotes removed and string escapes decoded as above. Apply line conversion, HTML
attribute quotes and entity placeholders before decoding escapes. Keep internal
whitespace, letter case and Unicode spelling unchanged; do not trim, collapse,
Unicode-normalize or finally decode entity placeholders. Wardley names do not
pass through common text sanitization, including under a changed security level.
[fixture: wardley/gram-reference-decoded-escape] [fixture:
wardley/gram-reference-same-whitespace] [fixture:
wardley/gram-reference-html-converted] [fixture:
wardley/gram-reference-entity-converted] [fixture:
wardley/gram-reference-security-noeffect] [fixture:
wardley/gram-reference-html-before-escape] [fixture:
wardley/gram-reference-html-escape-mismatch] [fixture: wardley/entity-texts]
[fixture: wardley/line-string-values] [fixture: wardley/space-name-values]

For each checked coordinate, read its double value first. If it is at most 1,
multiply it by 100; otherwise leave it unchanged. Reject when that result is
below 0 or above 100. Compare rounded doubles, not mathematical decimals: a
spelling just above 1 or 100 can round to that boundary. The grammar cannot
supply negative coordinates or NaN, while overflow to positive infinity fails
this check. [fixture: wardley/db-coordinate-boundary] [fixture:
wardley/db-coordinate-double-one] [fixture:
wardley/db-coordinate-double-hundred] [fixture:
wardley/lex-coordinate-above-boundary] [fixture:
wardley/number-coordinate-overflow] [fixture: wardley/number-negative-zero]
[fixture: wardley/number-nan]

Check both coordinates of every anchor, top-level component, note, annotation,
accelerator and deaccelerator occurrence, even when a later declaration replaces
its name. Check each pipeline child’s evolution as well. The authored order of
every two-value position is visibility then evolution, including annotation and
force syntax whose source field names are x and y. Size dimensions and stage
boundaries have no extra range, order, count or finite-value restriction.
[fixture: wardley/gram-invalid-anchor] [fixture:
wardley/gram-replaced-invalid-node] [fixture:
wardley/gram-replaced-invalid-node-last] [fixture: wardley/gram-invalid-note]
[fixture: wardley/gram-invalid-annotation] [fixture:
wardley/gram-invalid-accelerator] [fixture: wardley/gram-invalid-deaccelerator]
[fixture: wardley/gram-invalid-pipeline-child] [fixture:
wardley/gram-pipeline-invalid-replaced] [fixture: wardley/db-all-fields]
[fixture: wardley/db-stages-boundaries] [fixture: wardley/db-number-overflow]
[fixture: wardley/gram-size-zero]

Establish existence in this order: all anchors in source order, all top-level
components in source order, then pipelines in source order. Register each
declaration under its comparison name; replacing a key does not move its first
insertion position. When processing a pipeline, its parent must already exist by
exact ID with numeric coordinates. A source-later top-level declaration is
already available, an anchor can be a parent, and a child of an earlier
processed pipeline can be a parent. A label-only match and a child created by a
later pipeline do not qualify. [fixture: wardley/db-publication-order] [fixture:
wardley/db-pipeline-forward-parent] [fixture: wardley/db-pipeline-anchor-parent]
[fixture: wardley/db-pipeline-nested-parent] [fixture:
wardley/gram-missing-pipeline-parent] [fixture:
wardley/gram-pipeline-plain-name-ref] [fixture:
wardley/gram-pipeline-child-parent-before]

For each pipeline child, the ID for later existence checks is the parent
comparison name, underscore and child comparison name joined in that order.
Register it with the parent’s then-current visibility. Apply replacements and
authored/synthetic ID collisions; redefining a pipeline does not remove earlier
registered children. This state is needed for later parent and evolve checks,
without changing the authored tree. [fixture: wardley/db-pipeline-collision]
[fixture: wardley/db-pipeline-duplicates] [fixture:
wardley/db-pipeline-label-inheritance] [fixture:
wardley/db-pipeline-nested-parent] [fixture: wardley/db-empty-pipeline-names]

After all nodes are registered, check every evolve target only if its comparison
name has an exact registered ID. A missing ID is accepted without checking that
target’s range, even when it exceeds 100; matching a pipeline-child label alone
is still missing. A source-earlier evolve can therefore fail against a later
top-level declaration. Replacement by another evolve does not bypass checking an
existing target. [fixture: wardley/db-trend-missing] [fixture:
wardley/gram-evolve-missing-label-invalid] [fixture:
wardley/gram-evolve-exact-child-invalid] [fixture:
wardley/gram-evolve-forward-invalid] [fixture: wardley/gram-invalid-evolve]
[fixture: wardley/db-trend-duplicates] [fixture:
wardley/gram-evolve-replaced-invalid]

Check only the first annotations box’s coordinate pair. Later boxes must satisfy
grammar but receive no coordinate range check; a later valid box cannot rescue
an invalid first box. Empty names, prototype-looking names, duplicated
declarations, unresolved links and later overwritten or unpublished statements
introduce no other rejection. [fixture: wardley/db-later-invalid-box] [fixture:
wardley/gram-box-first-invalid] [fixture: wardley/db-empty-texts] [fixture:
wardley/db-prototype-names] [fixture: wardley/db-node-duplicates] [fixture:
wardley/db-link-unresolved-duplicates] [fixture: wardley/db-singletons-last]

Only links resolve a name by exact ID, then the first current label match in
initial node-registration order, otherwise retaining the unresolved comparison
name. This fallback never decides acceptance and is not applied to pipeline
parents or evolve. The tree retains each original reference spelling. [fixture:
wardley/db-link-resolution] [fixture: wardley/db-link-exact-id] [fixture:
wardley/db-link-unresolved-duplicates] [fixture:
wardley/gram-pipeline-plain-name-ref] [fixture:
wardley/gram-evolve-missing-label-invalid]

### Retaining occurrences and configuration

Keep every authored occurrence of size, evolution, common metadata, annotations
box, node declaration, pipeline, link and evolve in the tree, including empty,
replaced and unpublished forms. The tests summary defines selection, nullish
merging, ordering and omitted values; they are not grounds to delete syntax or
add a divergence. In particular, preserve both link labels and both ports even
when one takes precedence. [fixture: wardley/db-singletons-last] [fixture:
wardley/common-repeat-empty] [fixture: wardley/frontmatter-empty-body-title]
[fixture: wardley/db-node-duplicates] [fixture: wardley/db-pipeline-duplicates]
[fixture: wardley/db-trend-missing] [fixture: wardley/db-later-invalid-box]
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins]

There is no Wardley-specific semantic acceptance setting. Neither the adapter
nor the builder reads wardley or wardley-beta configuration; [wardleyDb.ts][db]
and the [wardleyRenderer.ts][renderer-config] expose or use drawing settings
only. Embedded drawing settings cannot rescue invalid coordinates. Invalid
embedded data, including numeric wardley.fontFamily failing common configuration
handling, uses embedded-data-opaque. Common metadata and Wardley names can have
different configuration-dependent escaping, as the tests summary records.
[fixture: wardley/config-frontmatter-drawing] [fixture:
wardley/config-init-drawing] [fixture: wardley/config-frontmatter-cannot-rescue]
[fixture: wardley/config-init-cannot-rescue] [fixture:
wardley/config-frontmatter-fontfamily-number] [fixture:
wardley/config-init-fontfamily-number] [fixture:
wardley/config-frontmatter-beta-fontfamily-number] [fixture:
wardley/config-init-beta-fontfamily-number] [fixture:
wardley/config-security-level-other] [fixture:
wardley/gram-reference-security-noeffect]

### Db normalization

The normalized values and their derivation belong to
[db-summaries.md](../../../tests/docs/db-summaries.md#wardley) and the tests
package’s [Db-from-tree contract](../../../tests/docs/db-from-tree.md). They
include coordinate normalization, labels, class names, selection and
replacement; the source tree defined here keeps authored occurrences and values.
[fixture: wardley/db-all-fields] [fixture: wardley/db-node-duplicates] [fixture:
wardley/db-singletons-last] [fixture: wardley/db-link-forms]

## Known divergences

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
Global directives cannot split a fixed word, id-name, number or indivisible
arrow/port/marker. Their shared records retain the source, but those atoms have
no authored internal gap. Complete component boundaries, spaced-name text,
strings and hidden punctuation remain readable. [fixture:
wardley/directive-keyword-middle] [fixture: wardley/directive-number] [fixture:
wardley/directive-header-inside] [fixture: wardley/directive-id-inside]
[fixture: wardley/directive-strategy-inside] [fixture:
wardley/directive-arrow-inside] [fixture: wardley/directive-port-inside]
[fixture: wardley/directive-flow-marker-inside] [fixture:
wardley/common-keyword-directive] [fixture: wardley/directive-coordinate-parts]
[fixture: wardley/directive-flow-before-label] [fixture:
wardley/directive-flow-after-label] [fixture:
wardley/directive-native-opener-split]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
The same atomic rule applies only to semicolons actually selected by the common
line rule. Selected punctuation at complete components and inside
text/string/hidden forms is retained as trivia; no arbitrary semicolon becomes a
separator. [fixture: wardley/lex-selected-decimal-inside] [fixture:
wardley/lex-selected-label-keyword] [fixture:
wardley/lex-selected-strategy-inside] [fixture:
wardley/lex-selected-port-inside] [fixture:
wardley/lex-selected-flow-marker-inside] [fixture:
wardley/lex-selected-arrow-inside] [fixture:
wardley/lex-selected-target-id-inside] [fixture:
wardley/lex-selected-coordinate-parts] [fixture:
wardley/lex-selected-strategy-parts] [fixture:
wardley/lex-selected-flow-after-label] [fixture:
wardley/lex-selected-native-yaml-opener] [fixture:
wardley/lex-selected-keyword-inside]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md).**
HTML quote scanning starts after real frontmatter. Source nodes retain both
blocks, but body string boundaries and values are not controlled by an
unfinished tag in opaque YAML. Mermaid can accept where this specification
rejects, reject where it accepts, or accept with a different common value.
[fixture: wardley/div-html-frontmatter-accept] [fixture:
wardley/div-html-frontmatter-reject] [fixture:
wardley/div-html-frontmatter-value] [fixture: wardley/html-body-double-control]
[fixture: wardley/html-body-single-control]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).**
Recognized frontmatter and global directive bodies are opaque shared records,
not parsed YAML or configuration. Common embedded-data failures do not reject
Wardley syntax; keep the comparison title and other valid configuration
according to the shared rule. Native retained YAML is a separate ignored node.
[fixture: wardley/div-frontmatter-invalid] [fixture:
wardley/config-frontmatter-fontfamily-number] [fixture:
wardley/config-init-fontfamily-number] [fixture:
wardley/config-fontfamily-keeps-title] [fixture:
wardley/div-invalid-keeps-config] [fixture:
wardley/detect-block-after-directive]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
Detection-passed bare percent lines are shared Comments, and accompanying passed
whitespace is trivia. Retained forms still have named owners and native
boundaries. Re-reading passed Unicode whitespace with Mermaid’s native lexer
causes its rejecting cases; a native gap without a passed line is a nondiffering
control. [fixture: wardley/bare-before-ls] [fixture: wardley/bare-line-ps]
[fixture: wardley/prefix-yaml-bare-unicode] [fixture:
wardley/detect-retained-secondscan-bare-ls] [fixture:
wardley/detect-retained-secondscan-bare-ascii] [fixture:
wardley/prefix-yaml-unicode-no-bare]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).** The
Wardley header selects Wardley even when a later written name or value contains
a C4 detector word. The text has Wardley nodes, but the tree cannot
simultaneously have Mermaid’s displaced C4 diagram kind. Ordinary LF-terminated
comments removed before detection remain nondiffering. [fixture:
wardley/c4-component-component] [fixture: wardley/c4-dynamic-flow-label]
[fixture: wardley/c4-container-title] [fixture: wardley/c4-component-header-eof]
[fixture: wardley/c4-component-header-lf]

Whole hidden forms, empty strings and description blocks, overwritten
statements, missing evolves and surplus annotations boxes have nodes and are not
additional divergences. Source arrow/label spelling can explain surprising
derived flow or line behavior without rejecting it. [fixture:
wardley/db-empty-texts] [fixture: wardley/common-empty-interleaved] [fixture:
wardley/db-singletons-last] [fixture: wardley/db-trend-missing] [fixture:
wardley/db-later-invalid-box] [fixture:
wardley/lex-flow-label-changes-direction] [fixture:
wardley/lex-flow-label-changes-bidirectional] [fixture:
wardley/lex-flow-label-changes-dashed] [fixture:
wardley/lex-flow-label-changes-dashed-short]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/wardley.langium#L1-L154
[common]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L1-L34
[module]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/module.ts#L39-L77
[wardley-converter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/valueConverter.ts#L5-L19
[converter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/valueConverter.ts#L27-L69
[parse]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L149
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts
[db]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyDb.ts
[terminals]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/wardley.langium#L106-L154
[detector]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyDetector.ts#L7-L11
[populate-common]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L13
[builder-build]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L187-L207
[renderer-config]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyRenderer.ts#L31-L64
[order]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L84-L126
