# eventmodeling

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

This defines eventmodeling syntax and its
[authored tree](../ast/eventmodeling.md), following
[event-modeling.langium][grammar], [the parser tests][parser-tests] and [the
adapter tests][mermaid-tests]. [fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/header-only]

## Detection

Entry 27 of [detection.md](../detection.md), [detector.ts][detector], selects
the exact lowercase prefix eventmodeling after common leading whitespace.
Anything may follow that prefix. Detection alone does not establish acceptance:
uppercase, unreadable suffixes, a colon and a repeated header reject. [fixture:
eventmodeling/header-only] [fixture: eventmodeling/header-uppercase] [fixture:
eventmodeling/header-letter] [fixture: eventmodeling/header-digit] [fixture:
eventmodeling/header-word] [fixture: eventmodeling/header-dash] [fixture:
eventmodeling/header-unicode] [fixture: eventmodeling/header-punctuation]
[fixture: eventmodeling/header-double]

Apply [common source reading](../common.md#reading-a-source): line conversion,
HTML attribute quotes, real leading frontmatter, global directives, comment
regions, leading trivia, entities and selected semicolons. The
[preprocessor][preprocess] and [detection scan][detect-type] run before the
diagram grammar. Real frontmatter is a shared Frontmatter record. The earlier C4
detector is subject to c4-keyword-anywhere. [fixture:
eventmodeling/frontmatter-title] [fixture: eventmodeling/line-cr] [fixture:
eventmodeling/line-crlf] [fixture: eventmodeling/html-common] [fixture:
eventmodeling/entity-common] [fixture: eventmodeling/directive-header-inside]
[fixture: eventmodeling/semicolon-selected-common-parts] [fixture:
eventmodeling/c4-component-identifier]

At the detection point, pass at most one retained block satisfying the common
[frontmatter shape](../common.md#frontmatter), before passed bare percent lines
and the second directive scan. It remains diagram text. A second retained block
rejects; real frontmatter may precede the retained block and a second-scan
directive. A block before a second-scan directive can pass; the reverse order
does not repeat the block skip. A preceding bare percent line prevents that
block skip. [fixture: eventmodeling/detect-retained-two] [fixture:
eventmodeling/detect-two-blocks] [fixture:
eventmodeling/detect-real-retained-secondscan] [fixture:
eventmodeling/detect-yaml-secondscan] [fixture:
eventmodeling/detect-secondscan-yaml] [fixture:
eventmodeling/prefix-yaml-between-bares] [fixture:
eventmodeling/detect-block-after-bare-brace]

Adjacent fences without a body line, a missing closer, four opening dashes,
closing-fence suffix text and a closer without a following line break stop the
retained-block skip. Leading trimming can remove only the opening indentation:
compare a formerly indented opener with an unindented closer, an indented closer
alone, and equally indented fences after that trimming. Closing padding followed
by LF can satisfy both detection and native reading. [fixture:
eventmodeling/detect-adjacent-no-body] [fixture:
eventmodeling/detect-missing-close] [fixture:
eventmodeling/detect-four-opening-dashes] [fixture:
eventmodeling/detect-closing-suffix] [fixture:
eventmodeling/detect-closer-no-lf] [fixture:
eventmodeling/detect-indent-mismatch] [fixture:
eventmodeling/detect-close-indent-mismatch] [fixture:
eventmodeling/detect-opening-indent-trim] [fixture:
eventmodeling/detect-close-space-native]

A genuine second-scan directive remains diagram text and must satisfy the native
directive boundary. Two such forms can be read independently; a closer glued to
the header can fail native reading. Retained native YAML and directives belong
to EventmodelingDiagram.textBeforeHeader, not shared frontmatter or
configuration. [fixture: eventmodeling/detect-two-secondscan] [fixture:
eventmodeling/detect-secondscan-glued] [fixture:
eventmodeling/detect-real-retained-secondscan]

Passed bare percent lines are shared Comments with mark %%. Their accompanying
passed whitespace and line breaks are trivia and are not read again, including
before, between and after retained forms. Distinguish the detection point, the
header reached, and later native whitespace. ASCII space/tab and Unicode
whitespace on their own lines or immediately before the header remain accepted
here, with or without a passed bare line; this does not create
bare-percent-line-before-header divergences. [fixture:
eventmodeling/bare-before-space] [fixture: eventmodeling/bare-before-tab]
[fixture: eventmodeling/bare-before-ls] [fixture: eventmodeling/bare-before-ps]
[fixture: eventmodeling/bare-line-ls] [fixture: eventmodeling/bare-line-ps]
[fixture: eventmodeling/prefix-directive-between-bares] [fixture:
eventmodeling/detect-bare-retained] [fixture:
eventmodeling/prefix-yaml-bare-unicode] [fixture:
eventmodeling/detect-retained-bare-ascii-line] [fixture:
eventmodeling/detect-retained-bare-ls-line] [fixture:
eventmodeling/detect-retained-no-bare-ls-line] [fixture:
eventmodeling/detect-retained-bare-nbsp-header] [fixture:
eventmodeling/detect-retained-no-bare-nbsp-header]

## Lexical structure

### Ordered units

Read diagram text from the detection point, omitting the passed intervals above.
At each position take the first applicable rule in the table, then restart in
that order. There is no general longest-match rule. [module.ts][module] uses
[EventModelingTokenBuilder][token-builder] and [the common token
builder][common-token-builder]. The [grammar][grammar] imports no common
grammar: no inherited STRING, INT, BOOLEAN or EOL supplies another unit. Any
character that no rule reads rejects the input. [fixture:
eventmodeling/header-only] [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/error-start] [fixture: eventmodeling/error-recovered] [fixture:
eventmodeling/error-after-prefix]

| Order | Unit or trivia                        | Reading                                        |
| ----- | ------------------------------------- | ---------------------------------------------- |
| 1     | `eventmodeling`                       | Keyword; identifier is its longer alternative. |
| 2     | `resetframe`                          | Keyword; identifier is its longer alternative. |
| 3     | `readmodel`                           | Keyword; identifier is its longer alternative. |
| 4     | `processor`                           | Keyword; identifier is its longer alternative. |
| 5     | `timeframe`                           | Keyword; identifier is its longer alternative. |
| 6     | `command`                             | Keyword; identifier is its longer alternative. |
| 7     | `entity`                              | Keyword; identifier is its longer alternative. |
| 8     | `event`                               | Keyword; identifier is its longer alternative. |
| 9     | `jsobj`                               | Keyword; identifier is its longer alternative. |
| 10    | `figma`                               | Keyword; identifier is its longer alternative. |
| 11    | `given`                               | Keyword; identifier is its longer alternative. |
| 12    | `json`                                | Keyword; identifier is its longer alternative. |
| 13    | `salt`                                | Keyword; identifier is its longer alternative. |
| 14    | `html`                                | Keyword; identifier is its longer alternative. |
| 15    | `text`                                | Keyword; identifier is its longer alternative. |
| 16    | `data`                                | Keyword; identifier is its longer alternative. |
| 17    | `note`                                | Keyword; identifier is its longer alternative. |
| 18    | `when`                                | Keyword; identifier is its longer alternative. |
| 19    | `then`                                | Keyword; identifier is its longer alternative. |
| 20    | `rmo`                                 | Keyword; identifier is its longer alternative. |
| 21    | `cmd`                                 | Keyword; identifier is its longer alternative. |
| 22    | `evt`                                 | Keyword; identifier is its longer alternative. |
| 23    | `pcr`                                 | Keyword; identifier is its longer alternative. |
| 24    | `uri`                                 | Keyword; identifier is its longer alternative. |
| 25    | `->>`                                 | Punctuation; no longer alternative.            |
| 26    | `gwt`                                 | Keyword; identifier is its longer alternative. |
| 27    | `ui`                                  | Keyword; identifier is its longer alternative. |
| 28    | `md`                                  | Keyword; identifier is its longer alternative. |
| 29    | `tf`                                  | Keyword; identifier is its longer alternative. |
| 30    | `[[`                                  | Punctuation; no longer alternative.            |
| 31    | `]]`                                  | Punctuation; no longer alternative.            |
| 32    | `rf`                                  | Keyword; identifier is its longer alternative. |
| 33    | type-tag-delimiter                    | Punctuation; no longer alternative.            |
| 34    | `.`                                   | Punctuation; no longer alternative.            |
| 35    | identifier                            | ASCII identifier.                              |
| 36    | frame-name                            | One to three digits.                           |
| 37    | inline-data                           | Brace or quoted same-line data.                |
| 38    | block-data                            | Multiline brace data.                          |
| 39    | description-line or description-block | Colon form before brace form.                  |
| 40    | accessibility-title-line              | Padded accessibility line.                     |
| 41    | title-line                            | Padded title or bare title.                    |
| 42    | native whitespace                     | Hidden general whitespace.                     |
| 43    | hidden-yaml                           | Native ignored block.                          |
| 44    | hidden-directive                      | Native ignored form.                           |
| 45    | percent-comment                       | Native line comment.                           |
| 46    | slash-block-comment                   | Native block comment.                          |
| 47    | slash-line-comment                    | Native line comment.                           |

Every word keyword has identifier as its explicit longer alternative: a strictly
longer identifier wins, but an equal-length keyword wins. Punctuation has no
longer alternative. Matching is case-sensitive. This is not Jison word-boundary
matching: tf01 and evtA are identifiers, while a numeric frame-name can touch
the next type keyword. Exact ordinary keywords cannot be identifiers, but longer
words such as eventX can. [fixture: eventmodeling/lex-glued-frame-id] [fixture:
eventmodeling/lex-glued-type-name] [fixture:
eventmodeling/lex-glued-frame-parts] [fixture: eventmodeling/lex-keyword-name]
[fixture: eventmodeling/lex-keyword-prefix-name] [fixture:
eventmodeling/gram-gwt-keyword-identifier-prefix] [fixture:
eventmodeling/type-uppercase] [fixture: eventmodeling/frame-uppercase]

### Header boundary

Only the eventmodeling keyword has an additional boundary: the next characters
must be %%, common Notation whitespace, or end of text. This includes LS, PS,
NBSP and BOM, but excludes U+0085 and U+200B. A glued percent comment can follow
it; a glued slash comment cannot. A space before the slash comment supplies the
boundary. Judge this after common removals: a removed directive leaving space or
LF succeeds, while eventmodeling joined to tf, or tf joined to digits, rejects.
[fixture: eventmodeling/header-percent-comment] [fixture:
eventmodeling/header-slash-comment-glued] [fixture:
eventmodeling/header-slash-comment-spaced] [fixture:
eventmodeling/header-global-directive-space] [fixture:
eventmodeling/header-global-directive-newline] [fixture:
eventmodeling/directive-header-glued] [fixture:
eventmodeling/directive-keyword-glued] [fixture: eventmodeling/line-ls-gap]
[fixture: eventmodeling/line-ps-gap] [fixture: eventmodeling/space-nbsp-body]
[fixture: eventmodeling/space-bom-body] [fixture: eventmodeling/header-nel]
[fixture: eventmodeling/header-zero-width-space]

When that custom keyword matcher fails in a name position, identifier can still
match. Thus eventmodeling.A is a qualified name, whereas event.A begins with the
ordinary reserved keyword event and rejects. [fixture:
eventmodeling/lex-name-custom-header-dot] [fixture:
eventmodeling/lex-name-ordinary-keyword-dot]

### Names and references

The [name rules][names] read an identifier as an ASCII letter or underscore
followed by zero or more ASCII letters, digits or underscores. One-character
names and prototype-shaped names are permitted. A Unicode letter, dash, quote or
entity cannot extend that unit. A frame-name is a string of one to three ASCII
digits, not a quantity: 1, 01 and 001 are distinct names. A fourth digit, a
sign, NaN, Infinity or two whitespace-separated digit units do not form a
frame-name. [fixture: eventmodeling/lex-id-forms] [fixture:
eventmodeling/lex-id-unicode] [fixture: eventmodeling/lex-id-unicode-tail]
[fixture: eventmodeling/db-prototype-names] [fixture:
eventmodeling/entity-id-rejected] [fixture:
eventmodeling/db-source-leading-zero] [fixture: eventmodeling/number-one]
[fixture: eventmodeling/number-three] [fixture: eventmodeling/number-four]
[fixture: eventmodeling/number-plus] [fixture:
eventmodeling/number-negative-zero] [fixture: eventmodeling/number-nan]
[fixture: eventmodeling/number-infinity] [fixture:
eventmodeling/gram-frame-id-split-whitespace]

A qualified-name is one or more identifiers separated by dot punctuation. Native
whitespace, comments and hidden forms can stand on either side of a dot, but a
missing segment, leading dot or trailing dot rejects. Data declaration names,
bracketed data references and GWT item references instead require one
identifier. Their names are not qualified-name forms. [fixture:
eventmodeling/db-qualified-names] [fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/lex-qualified-empty-segment] [fixture:
eventmodeling/lex-qualified-leading-dot] [fixture:
eventmodeling/lex-qualified-trailing-dot] [fixture:
eventmodeling/data-reference-qualified] [fixture:
eventmodeling/gwt-qualified-reference] [fixture:
eventmodeling/gram-gwt-numeric-source-four]

### Data

The [data fragments][data] permit an optional tag: opening backtick, one of
json, jsobj, figma, salt, uri, md, html or text, then closing backtick. These
are separate components with native gaps between them; the following body is
required. Empty or unknown tags reject. The tag does not validate its body as
JSON, a URI or another language. [fixture: eventmodeling/data-all-types]
[fixture: eventmodeling/data-block-types] [fixture:
eventmodeling/data-unknown-type] [fixture: eventmodeling/lex-block-type-empty]
[fixture: eventmodeling/lex-block-type-multiline-gaps] [fixture:
eventmodeling/lex-hidden-type-tag] [fixture:
eventmodeling/lex-hidden-data-tag-gaps]

The [inline-data rule][data-terminals] tries braces, double quotes, then single
quotes. It reads through the last matching closer on the same line, including
earlier closers and apparent later statements. CR, LF, LS and PS cannot be
inside it. Backslash is ordinary content and protects neither quote nor brace.
Empty braces and empty quoted strings are accepted. Inline data has priority
over block data at the same position, even where the grammar requires a block.
[fixture: eventmodeling/lex-inline-greedy] [fixture:
eventmodeling/lex-inline-quote-greedy] [fixture:
eventmodeling/lex-inline-two-objects-following-frame] [fixture:
eventmodeling/lex-inline-quote-conversion] [fixture:
eventmodeling/lex-inline-empty] [fixture: eventmodeling/lex-inline-multiline]
[fixture: eventmodeling/line-inline-ls] [fixture: eventmodeling/line-inline-ps]
[fixture: eventmodeling/lex-inline-brace-ls] [fixture:
eventmodeling/lex-inline-open-brace] [fixture:
eventmodeling/lex-inline-open-double] [fixture:
eventmodeling/lex-inline-open-single] [fixture:
eventmodeling/data-block-inline-rejected] [fixture:
eventmodeling/lex-block-data-quoted-not-block] [fixture:
eventmodeling/data-inline-block-rejected]

Block-data starts with an opening brace, zero or more ASCII spaces/tabs and LF.
Its closer is an unindented brace immediately after LF, followed by LF, another
Notation whitespace character or end of text. Opening NBSP or LS, an indented
closer and a closer immediately after LS reject. The interior can contain every
character, including LS and PS. Missing closure rejects. [fixture:
eventmodeling/data-block-empty] [fixture:
eventmodeling/lex-block-empty-whitespace] [fixture:
eventmodeling/lex-block-open-padding] [fixture:
eventmodeling/lex-block-opening-ls] [fixture:
eventmodeling/data-block-indented-close] [fixture:
eventmodeling/lex-block-close-after-ls] [fixture:
eventmodeling/line-block-values] [fixture:
eventmodeling/data-block-close-suffix] [fixture: eventmodeling/lex-block-open]

First try the block form with at least one body line after the opening line,
taking as few body characters as allow a qualifying closing line. Only if no
such form succeeds, try the empty form closed directly after the opening line.
Consequently an immediately adjacent closing line can become body text when a
later closer exists. Once a nonempty body has a qualifying closer, stop there;
quotes, nested braces and frame-looking lines do not protect it. A nonqualifying
closing-looking line can remain content. [fixture:
eventmodeling/lex-block-adjacent-closers] [fixture:
eventmodeling/lex-block-adjacent-later-close] [fixture:
eventmodeling/lex-block-unqualified-close-later] [fixture:
eventmodeling/data-block-nested] [fixture: eventmodeling/data-block-empty]

A closing LF is consumed by block-data; other following whitespace is only a
boundary and is not consumed. The logical LF appended at end of text may supply
it. These are lexical boundaries, not statement-ending EOL units. [fixture:
eventmodeling/data-block-close-eof] [fixture:
eventmodeling/data-block-close-space] [fixture:
eventmodeling/lex-block-close-ps-boundary] [fixture:
eventmodeling/lex-block-closer-native-comment] [fixture:
eventmodeling/lex-block-closer-native-comment-space]

### Common statements

The [metadata rules][metadata] are diagram-specific EM_TITLE, EM_ACC_TITLE and
EM_ACC_DESCR, not imported common terminals. [module.ts][module] selects
[CommonValueConverter][converter], whose TITLE, ACC_TITLE and ACC_DESCR branches
do not match these rule names. The active fallback retains the whole terminal,
including keyword, delimiter and leading horizontal padding, without trimming,
whitespace collapse or escape decoding. Authored tree payloads remain
unconverted;
[the tests summary](../../../tests/docs/db-summaries.md#eventmodeling) owns
subsequent Db normalization. [fixture: eventmodeling/common-inline] [fixture:
eventmodeling/common-whitespace] [fixture: eventmodeling/common-repeat-empty]
[fixture: eventmodeling/common-description-repeat] [fixture:
eventmodeling/common-quoted-values]

These composite forms precede native whitespace but follow identifier. They can
claim a leading ASCII space/tab run at the current position. Judge LF and
padding after common removals: global directives, common comment regions and the
semicolons selected by the common line rule. A common comment region, including
its padding and terminating LF, is removed. Removing a closed global directive
alone leaves the LF outside it; removing a selected semicolon leaves any LF as
well. A blank line also leaves LF. Whether a form can claim indentation on the
next line then depends on whether the preceding unit consumed the remaining LF.
If it did, the indentation begins at the current position and can enable the
composite before native whitespace. If it did not, native whitespace starts at
LF and consumes the indentation, leaving identifier to win at the keyword.
Block-data, hidden-yaml and hidden-directive consume their closing LF; without
indentation, identifier still wins on the following line. Common CRLF conversion
leaves the same LF case. LS and PS after these closers are not consumed: native
whitespace starts there and takes the padding before a common form. On the same
physical line, a surviving ASCII space/tab run can enable the composite,
including across an inline global directive or a selected semicolon. An
unselected semicolon is not whitespace and rejects in that gap. An empty
description block remains a statement; it leaves its following LF unconsumed,
but a common form can claim padding directly after its closing brace on the same
line. In a name position, padded title can steal the position as a composite,
whereas unpadded title can be an identifier. accTitle and accDescr without their
required delimiters are identifiers. [fixture:
eventmodeling/common-line-keywords] [fixture:
eventmodeling/lex-common-no-padding-after-brace] [fixture:
eventmodeling/common-inline] [fixture:
eventmodeling/lex-common-after-slash-comment] [fixture:
eventmodeling/lex-common-after-slash-comment-space] [fixture:
eventmodeling/lex-common-next-line-comment] [fixture:
eventmodeling/lex-name-title-padded] [fixture:
eventmodeling/lex-name-title-after-lf] [fixture:
eventmodeling/lex-name-title-after-comment] [fixture:
eventmodeling/lex-name-acctitle-without-colon] [fixture:
eventmodeling/lex-name-accdescr-without-delimiter] [fixture:
eventmodeling/gram-gwt-title-name-after-lf] [fixture:
eventmodeling/lex-common-after-block-lf-indented] [fixture:
eventmodeling/lex-common-after-block-lf-unindented] [fixture:
eventmodeling/lex-common-after-note-lf-tab] [fixture:
eventmodeling/lex-common-after-yaml-lf-indented] [fixture:
eventmodeling/lex-common-after-yaml-lf-unindented] [fixture:
eventmodeling/lex-common-after-directive-lf-indented] [fixture:
eventmodeling/lex-common-after-directive-lf-unindented] [fixture:
eventmodeling/lex-common-after-block-same-line-tab] [fixture:
eventmodeling/lex-common-after-block-ls-indented] [fixture:
eventmodeling/lex-common-after-yaml-crlf-indented] [fixture:
eventmodeling/lex-common-after-block-ps-indented] [fixture:
eventmodeling/lex-common-yaml-comment-line-padding] [fixture:
eventmodeling/lex-common-block-comment-line-padding] [fixture:
eventmodeling/lex-common-native-directive-comment-line-padding] [fixture:
eventmodeling/lex-common-yaml-directive-only-line] [fixture:
eventmodeling/lex-common-block-directive-only-line] [fixture:
eventmodeling/lex-common-yaml-blank-line-padding] [fixture:
eventmodeling/lex-common-block-inline-directive-padding] [fixture:
eventmodeling/lex-common-selected-semicolon-exposes-lf] [fixture:
eventmodeling/lex-common-selected-semicolon-padding] [fixture:
eventmodeling/lex-common-selected-semicolon-before-lf] [fixture:
eventmodeling/lex-common-unselected-semicolon-padding] [fixture:
eventmodeling/lex-common-empty-description-inline-padding] [fixture:
eventmodeling/lex-common-empty-description-leaves-lf]

Title-line reads optional ASCII space/tab padding, title, then either one ASCII
space/tab and any non-CR/LF line text, or an empty suffix.
Accessibility-title-line reads that padding, accTitle, optional ASCII space/tab,
colon and line text. Description-line uses accDescr in the same form and takes
precedence over its brace alternative. Line text may be empty and includes
LS/PS; prefer ending it immediately before the first %%, otherwise take it
through the end of the line. Bare title is permitted, but unreadable text after
its bare-prefix match still rejects. No later line supplies a missing line
value. [fixture: eventmodeling/common-title-empty] [fixture:
eventmodeling/common-title-prefix] [fixture: eventmodeling/common-acctitle-eof]
[fixture: eventmodeling/common-description-eof] [fixture:
eventmodeling/common-colon-block-priority] [fixture:
eventmodeling/line-common-values] [fixture: eventmodeling/common-next-statement]
[fixture: eventmodeling/common-title-comment-gap] [fixture:
eventmodeling/common-title-directive-gap] [fixture:
eventmodeling/common-title-empty-gap] [fixture:
eventmodeling/common-comment-gap] [fixture: eventmodeling/common-directive-gap]
[fixture: eventmodeling/common-empty-gap] [fixture:
eventmodeling/lex-common-title-two-spaces]

Description-block reads padded accDescr, any Notation whitespace, an opening
brace, any characters through the first closing brace, and that closer. It may
span LF, LS and PS. Quotes and backslashes do not shield a closer, and unclosed
forms reject. Empty blocks remain statements. Do not trim the authored interior:
whitespace-only content remains a literal. Global removals can make payloads
empty without removing the authored statement or data shell. [fixture:
eventmodeling/common-block-first-close] [fixture:
eventmodeling/lex-common-block-after-close] [fixture:
eventmodeling/common-block-quoted-close] [fixture:
eventmodeling/common-block-open] [fixture:
eventmodeling/common-description-repeat] [fixture:
eventmodeling/lex-common-block-whitespace-only] [fixture:
eventmodeling/lex-common-empty-line-whitespace] [fixture:
eventmodeling/line-common-values] [fixture:
eventmodeling/gram-empty-payload-after-removals] [fixture:
eventmodeling/gram-description-block-empty-after-removal]

In the keyword-to-brace gap, global directives and comment regions are left out
before matching whitespace; blank lines are allowed. Native comments cannot be
inserted into a composite unit. Native-looking slash comments or YAML inside an
already matched metadata value are its text, not separate hidden forms.
[fixture: eventmodeling/common-description-comment-gap] [fixture:
eventmodeling/common-description-directive-gap] [fixture:
eventmodeling/common-description-empty-gap] [fixture:
eventmodeling/lex-common-block-slash-text] [fixture:
eventmodeling/lex-native-yaml-inside-common]

### Native hidden forms and comments

Native whitespace is one or more common Notation whitespace characters,
including LF, LS, PS, BOM and NBSP. It makes no node. There is no visible EOL
unit and no EOL production after the header, a frame, entity, data, note or GWT.
Complete units can cross physical lines or share a line wherever their lexical
rules allow it. An ordinary semicolon is not a separator and rejects outside a
containing text unit; only common line-rule selection can ignore it. [fixture:
eventmodeling/space-tabs] [fixture: eventmodeling/space-bom-body] [fixture:
eventmodeling/space-nbsp-body] [fixture: eventmodeling/space-3000-body]
[fixture: eventmodeling/space-lines] [fixture: eventmodeling/line-ls-gap]
[fixture: eventmodeling/line-ps-gap] [fixture: eventmodeling/header-inline]
[fixture: eventmodeling/gram-gwt-next-top-level] [fixture:
eventmodeling/tail-frame-semicolon] [fixture: eventmodeling/tail-data-semicolon]
[fixture: eventmodeling/tail-gwt-semicolon] [fixture:
eventmodeling/semicolon-frame-parts]

In [the hidden rules][hidden], hidden-yaml starts with three dashes, optional
ASCII space/tab and LF. It has an unindented three-dash closer followed by LF,
another Notation whitespace character or end of text. Try a body of at least one
line before the adjacent empty form, with the same closing choice as block-data.
Four opening dashes or an indented closer fail. It does not parse YAML or apply
configuration. A following LF is consumed, other boundary whitespace is not.
[fixture: eventmodeling/hidden-yaml-adjacent-later] [fixture:
eventmodeling/hidden-yaml-adjacent-no-later] [fixture:
eventmodeling/hidden-yaml-adjacent-eof] [fixture:
eventmodeling/hidden-yaml-adjacent-space] [fixture:
eventmodeling/hidden-yaml-four-dashes] [fixture:
eventmodeling/hidden-yaml-closer-indent] [fixture:
eventmodeling/hidden-yaml-after-frame] [fixture:
eventmodeling/hidden-yaml-after-frame-space] [fixture:
eventmodeling/hidden-yaml-after-frame-spare] [fixture:
eventmodeling/hidden-yaml-closing-ls] [fixture: eventmodeling/hidden-yaml-eof]

Hidden-directive reads optional ASCII space/tab, %%{, any characters including
LF/LS/PS, then the first }%% whose following boundary is LF, other Notation
whitespace or end of text. A following LF is consumed; other whitespace is only
looked ahead at. A nonqualifying earlier closer can be included while seeking a
later qualifying closer. Separate this from global directive removal: word-named
forms such as %%{x}%% may already have disappeared. Nonword forms establish the
native behavior. [fixture: eventmodeling/lex-native-directive-object] [fixture:
eventmodeling/lex-native-directive-object-space] [fixture:
eventmodeling/lex-native-directive-object-eof] [fixture:
eventmodeling/hidden-native-directive-later] [fixture:
eventmodeling/hidden-directive-native] [fixture:
eventmodeling/hidden-directive-no-boundary]

If hidden-directive fails, try percent-comment: %% through before CR/LF or end
of text, including a bare %%. A one-line failed native directive can therefore
become a comment that swallows a following apparent frame; multiline leftover
text can still reject. Earlier inline, block and common-value units instead
enclose native-looking text as content. Hidden-yaml and hidden-directive become
EventmodelingIgnoredText; comments use shared Comment records. [fixture:
eventmodeling/lex-native-directive-one-line-fallback] [fixture:
eventmodeling/lex-native-directive-object-glued] [fixture:
eventmodeling/comment-eof] [fixture: eventmodeling/comment-header] [fixture:
eventmodeling/hidden-data-yaml-text] [fixture:
eventmodeling/lex-inline-double-embedded-slash] [fixture:
eventmodeling/lex-native-yaml-in-inline]

Slash-block-comment reads `/*` through the first `*/`, without nesting and
requiring closure; its body may contain LF, LS and PS. Slash-line-comment reads
`//` through before CR/LF or end of text; LS and PS do not end it. Their marks
are `/*` and `//`, their values exclude the marks and the block closer, and
outside padding is not content. Comments can occupy complete-unit gaps but do
not join identifier fragments. Global directives can lie inside comment text or
between the mark characters; shared comment-region removal still applies first.
[fixture: eventmodeling/comment-native] [fixture:
eventmodeling/comment-between-id] [fixture: eventmodeling/comment-block-open]
[fixture: eventmodeling/comment-block-nearest-close] [fixture:
eventmodeling/comment-line-ls-body] [fixture:
eventmodeling/comment-line-ps-body] [fixture:
eventmodeling/comment-mark-directive] [fixture:
eventmodeling/comment-block-open-mark-directive] [fixture:
eventmodeling/comment-block-close-mark-directive] [fixture:
eventmodeling/comment-inline-data] [fixture: eventmodeling/comment-block-data]

### Authored component boundaries

For the shared directive and selected-semicolon rules, each
header/statement/common keyword, entity/data-type word, identifier segment,
frame-name digit string, complete ->>, [[ and ]] is an atom. A directive or
selected semicolon inside one of these rejects here. Qualified-name dot
punctuation, type-tag backticks and type word, reference opener/name/closer,
arrow/reference name and common keyword/colon/brace/value are separate authored
components. Global removal between them is allowed only when the remaining
lexical boundaries still match. Native hidden forms do not gain the power to
split an atom. [fixture: eventmodeling/directive-header-inside] [fixture:
eventmodeling/directive-id-inside] [fixture:
eventmodeling/directive-number-inside] [fixture:
eventmodeling/directive-arrow-inside] [fixture:
eventmodeling/directive-reference-inside] [fixture:
eventmodeling/directive-reference-close-inside] [fixture:
eventmodeling/directive-json-inside] [fixture:
eventmodeling/directive-qualified] [fixture: eventmodeling/directive-reference]
[fixture: eventmodeling/directive-tag] [fixture:
eventmodeling/directive-common-parts] [fixture:
eventmodeling/directive-qualified-before-word] [fixture:
eventmodeling/lex-semicolon-identifier-inside] [fixture:
eventmodeling/lex-semicolon-frame-id-inside] [fixture:
eventmodeling/semicolon-arrow-inside] [fixture:
eventmodeling/lex-semicolon-before-dot] [fixture:
eventmodeling/lex-semicolon-after-dot] [fixture:
eventmodeling/lex-semicolon-after-reference-open] [fixture:
eventmodeling/lex-semicolon-before-reference-close] [fixture:
eventmodeling/lex-semicolon-after-tag-open] [fixture:
eventmodeling/lex-semicolon-before-tag-close] [fixture:
eventmodeling/lex-semicolon-after-tag] [fixture:
eventmodeling/lex-frame-native-split-arrow] [fixture:
eventmodeling/lex-reference-native-split-open]

Data and common-value interiors are text and can contain global directives and
selected semicolons. A retained ignored form or Comment can also hold joined
native-fence or comment-mark spelling; retain its source directive once, rather
than rejecting text that has an owner. Ignore only the semicolon selected by the
common line rule, not every semicolon on the line. [fixture:
eventmodeling/directive-block-middle] [fixture:
eventmodeling/directive-string-start] [fixture:
eventmodeling/directive-string-middle] [fixture:
eventmodeling/directive-string-end] [fixture: eventmodeling/style-every-text]
[fixture: eventmodeling/style-two-semicolons] [fixture:
eventmodeling/style-nohash] [fixture: eventmodeling/style-colon-space] [fixture:
eventmodeling/style-other-line] [fixture:
eventmodeling/lex-hidden-yaml-fence-directive] [fixture:
eventmodeling/comment-mark-directive]

## Grammar

Use [common notation](../common.md#notation). Native whitespace, comments and
ignored forms can separate complete units; composite line/data rules retain
their own boundaries and priorities. The [entry and reachable rules][entry] have
the following forms. Consume all units; trailing incomplete sources, references,
clauses or unreadable suffixes reject. [fixture: eventmodeling/header-only]
[fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/frame-source-missing] [fixture:
eventmodeling/frame-reference-open] [fixture: eventmodeling/gwt-empty-then]
[fixture: eventmodeling/gram-gwt-empty-name] [fixture:
eventmodeling/error-after-prefix]

```text
diagram = (hidden-yaml | hidden-directive)* "eventmodeling" body-item* end-of-text
body-item = time-frame | reset-frame | model-entity | data-entity | note | gwt
          | title-line | accessibility-title-line | description-line | description-block
          | hidden-yaml | hidden-directive
time-frame = ("tf" | "timeframe") frame-name entity-type qualified-name source*
             data-reference? inline-value?
reset-frame = ("rf" | "resetframe") frame-name entity-type qualified-name source*
              data-reference? inline-value?
model-entity = "entity" qualified-name
data-entity = "data" identifier block-value
note = "note" frame-name block-value
gwt = "gwt" frame-name given-clause when-clause? then-clause
given-clause = "given" gwt-item+
when-clause = "when" gwt-item+
then-clause = "then" gwt-item+
gwt-item = entity-type identifier
source = "->>" frame-name
data-reference = "[[" identifier "]]"
qualified-name = identifier ("." identifier)*
inline-value = type-tag? inline-data
block-value = type-tag? block-data
type-tag = "`" data-type "`"
entity-type = "rmo" | "readmodel" | "ui" | "cmd" | "command"
            | "evt" | "event" | "pcr" | "processor"
data-type = "json" | "jsobj" | "figma" | "salt" | "uri" | "md" | "html" | "text"
```

| Rule                                     | Node                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| diagram                                  | EventmodelingDiagram                                                 |
| time-frame                               | EventmodelingTimeFrameStatement                                      |
| reset-frame                              | EventmodelingResetFrameStatement                                     |
| model-entity                             | EventmodelingModelEntityStatement                                    |
| data-entity                              | EventmodelingDataEntityStatement                                     |
| note                                     | EventmodelingNoteStatement                                           |
| gwt                                      | EventmodelingGwtStatement                                            |
| given-clause / when-clause / then-clause | EventmodelingGwtClause                                               |
| gwt-item                                 | EventmodelingGwtItem                                                 |
| qualified-name                           | EventmodelingQualifiedName and its tail parts                        |
| source                                   | EventmodelingSourceReference and EventmodelingArrow                  |
| data-reference                           | EventmodelingDataReference                                           |
| inline-value / block-value               | EventmodelingInlineData / EventmodelingDataBlock                     |
| title-line                               | EventmodelingTitleStatement                                          |
| accessibility-title-line                 | EventmodelingAccTitleStatement                                       |
| description-line / description-block     | EventmodelingAccDescrStatement / EventmodelingAccDescrBlockStatement |
| hidden-yaml / hidden-directive           | EventmodelingIgnoredText                                             |

Sources can repeat in written order. A frame has at most one data reference,
after all sources and before any inline data. Data declarations and notes
require block data; frames permit inline data only. Each GWT group contains at
least one item; given and then are required and when is optional in that order.
GWT references use single identifiers even when entity declarations use
qualified names. Each complete following top-level statement starts a new body
item. [fixture: eventmodeling/db-source-order] [fixture:
eventmodeling/frame-data-order] [fixture:
eventmodeling/gram-frame-sources-after-dataref] [fixture:
eventmodeling/gram-frame-repeat-dataref] [fixture:
eventmodeling/gram-frame-reference-empty] [fixture:
eventmodeling/data-block-inline-rejected] [fixture:
eventmodeling/note-inline-rejected] [fixture:
eventmodeling/data-inline-block-rejected] [fixture: eventmodeling/gwt-complete]
[fixture: eventmodeling/gwt-without-when] [fixture:
eventmodeling/gwt-empty-given] [fixture: eventmodeling/gwt-empty-when] [fixture:
eventmodeling/gwt-empty-then] [fixture: eventmodeling/gwt-missing-then]
[fixture: eventmodeling/gram-gwt-order] [fixture:
eventmodeling/gwt-qualified-reference] [fixture:
eventmodeling/gram-gwt-next-top-level]

Within GWT, a global-directive-only line, a selected semicolon, a comment line,
a blank line, LS or PS can separate items. An empty description block there does
not become a GWT item and rejects. Within a data block, the corresponding forms
are text subject to common removals, not nested statements; LS, PS and an
empty-description-looking line remain content. [fixture:
eventmodeling/gram-nested-gwt-global-directive-line] [fixture:
eventmodeling/lex-native-directive-in-gwt] [fixture:
eventmodeling/gram-nested-gwt-selected-semicolon] [fixture:
eventmodeling/gram-nested-gwt-comment-line] [fixture:
eventmodeling/gram-nested-gwt-blank-line] [fixture:
eventmodeling/gram-nested-gwt-ls] [fixture: eventmodeling/gram-nested-gwt-ps]
[fixture: eventmodeling/gram-nested-gwt-empty-description] [fixture:
eventmodeling/gram-nested-block-global-directive-line] [fixture:
eventmodeling/gram-nested-block-selected-semicolon] [fixture:
eventmodeling/gram-nested-block-comment-line] [fixture:
eventmodeling/gram-nested-block-blank-line] [fixture:
eventmodeling/gram-nested-block-ls] [fixture:
eventmodeling/gram-nested-block-ps] [fixture:
eventmodeling/gram-nested-block-empty-description]

Inside a GWT item, the type word and required reference name are separate
components. A global-directive-only line, a selected semicolon, a comment line,
a blank line, LS or PS can separate them. An empty description block there
supplies no name and rejects. [fixture:
eventmodeling/gram-gwt-item-directive-only-line] [fixture:
eventmodeling/gram-gwt-item-selected-semicolon] [fixture:
eventmodeling/gram-gwt-item-comment-line] [fixture:
eventmodeling/gram-gwt-item-blank-line] [fixture:
eventmodeling/gram-gwt-item-ls] [fixture: eventmodeling/gram-gwt-item-ps]
[fixture: eventmodeling/gram-gwt-item-empty-description]

### Semantic acceptance conditions

The [public parse gate][parse] rejects every lexer or parser error, including
errors on a recovered tree. [Validator registration][validator] does not run
validation or reference linking through that wrapper. No extra semantic gate
rejects unknown, forward or self references, duplicate definitions or
source-type combinations. [The adapter][adapter] stores the AST and publishes
common metadata; [setAst][store] only stores it. Rendering and getState are
outside acceptance. [fixture: eventmodeling/error-start] [fixture:
eventmodeling/error-recovered] [fixture: eventmodeling/error-after-prefix]
[fixture: eventmodeling/db-source-missing] [fixture:
eventmodeling/db-source-forward] [fixture: eventmodeling/db-source-self]
[fixture: eventmodeling/db-frame-duplicates] [fixture:
eventmodeling/db-data-first] [fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/link-note-forward] [fixture:
eventmodeling/link-gwt-forward] [fixture:
eventmodeling/validator-command-invalid] [fixture:
eventmodeling/validator-event-invalid] [fixture:
eventmodeling/validator-readmodel-invalid] [fixture:
eventmodeling/validator-processor-invalid] [fixture:
eventmodeling/validator-ui-invalid] [fixture:
eventmodeling/validator-reset-invalid] [fixture:
eventmodeling/validator-multiple-invalid]

### Preserving occurrences

Keep every statement and reference occurrence in source order, including
repeated frames, later same-name data declarations, unused entities, notes and
GWT. Preserve the entity-type word of each GWT item even though the upstream
unassigned grammar call omits it from its model. Do not resolve references, sort
or deduplicate source references, replace a reference with selected data, or
discard authored inline data when referenced data exists. Empty data/common
forms remain nodes. Semantic misreadings with a place in the tree remain
accepted. [fixture: eventmodeling/db-frame-duplicates] [fixture:
eventmodeling/db-data-first] [fixture: eventmodeling/db-data-unused] [fixture:
eventmodeling/db-entities-notes-gwt] [fixture:
eventmodeling/gram-gwt-unassigned-type] [fixture: eventmodeling/db-source-order]
[fixture: eventmodeling/db-data-reference-inline] [fixture:
eventmodeling/lex-inline-empty] [fixture:
eventmodeling/common-description-repeat] [fixture:
eventmodeling/gram-written-tree]

### Configuration and Db normalization

There is no eventmodeling-specific acceptance key. Drawing padding and
useMaxWidth do not change syntax or rescue invalid input; [the
renderer][renderer] reads them outside parsing. Invalid embedded configuration
can fail common configuration processing and is compared under
embedded-data-opaque. Preserve independently valid metadata/configuration when
removing a rejected embedded block. Values affected by common sanitization and
all Db normalization are defined in
[the tests summary](../../../tests/docs/db-summaries.md#eventmodeling), not this
syntax or the authored tree. [fixture: eventmodeling/config-drawing-site]
[fixture: eventmodeling/config-frontmatter-drawing] [fixture:
eventmodeling/config-init-drawing] [fixture:
eventmodeling/config-frontmatter-cannot-rescue] [fixture:
eventmodeling/config-init-cannot-rescue] [fixture:
eventmodeling/config-frontmatter-fontfamily-number] [fixture:
eventmodeling/config-init-fontfamily-number] [fixture:
eventmodeling/config-fontfamily-keeps-title] [fixture:
eventmodeling/div-invalid-keeps-config] [fixture:
eventmodeling/config-security-level-other]

## Known divergences

Apply
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md)
and
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md)
to the atoms defined above. Parts of a single atom cannot be joined through
removed trivia; retaining its directive or semicolon alone cannot preserve that
atomic spelling. Complete authored components and text interiors retain their
permitted common trivia. [fixture: eventmodeling/directive-arrow-inside]
[fixture: eventmodeling/directive-reference-inside] [fixture:
eventmodeling/directive-reference-close-inside] [fixture:
eventmodeling/lex-semicolon-identifier-inside] [fixture:
eventmodeling/lex-semicolon-frame-id-inside] [fixture:
eventmodeling/directive-qualified] [fixture: eventmodeling/directive-reference]
[fixture: eventmodeling/directive-tag]

[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md)
confines HTML quote conversion to text after real frontmatter. A tag starting
inside opaque frontmatter cannot rewrite later authored values. This can reject
an input Mermaid accepts, accept one Mermaid rejects, or change only an
accessibility value; retain all three cases. [fixture:
eventmodeling/div-html-frontmatter-accept] [fixture:
eventmodeling/div-html-frontmatter-reject] [fixture:
eventmodeling/div-html-frontmatter-value] [fixture:
eventmodeling/html-body-double-control] [fixture:
eventmodeling/html-body-mismatch-control] [fixture:
eventmodeling/prefix-yaml-html] [fixture: eventmodeling/prefix-directive-html]

[embedded-data-opaque](../known-divergences/embedded-data-opaque.md) keeps
frontmatter bodies and global directive arguments without evaluating them. It
does not make native inline/block data opaque configuration.
[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md) selects this
diagram from its header rather than later C4 words inside names, references or
text. Bare-prefix whitespace and empty data/common forms have nodes or trivia
here, so neither bare-percent-line-before-header nor tokenless-empty-forms is
added. [fixture: eventmodeling/div-frontmatter-invalid] [fixture:
eventmodeling/div-init-invalid-colour] [fixture:
eventmodeling/div-init-primitive-wrap] [fixture:
eventmodeling/c4-container-data] [fixture:
eventmodeling/c4-component-identifier] [fixture: eventmodeling/c4-dynamic-gwt]
[fixture: eventmodeling/c4-deployment-reference] [fixture:
eventmodeling/c4-component-header-lf] [fixture: eventmodeling/bare-before-ls]
[fixture: eventmodeling/lex-inline-empty] [fixture:
eventmodeling/common-description-repeat]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L1-L70
[entry]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L49
[names]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L24-L55
[data]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L17-L22
[data-terminals]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L57-L58
[metadata]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L62
[hidden]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L64-L70
[module]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/module.ts#L31-L62
[token-builder]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/tokenBuilder.ts#L1-L7
[common-token-builder]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L6-L29
[converter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L81
[parse]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L150
[validator]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling-validator.ts#L12-L66
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/parser.ts#L8-L14
[store]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L50-L141
[renderer]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/renderer.ts#L128-L167
[detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/detector.ts#L4-L8
[preprocess]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L65
[detect-type]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48
[docs]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L1-L322
[parser-tests]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/tests/eventmodeling.test.ts#L1-L339
[mermaid-tests]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/eventmodeling.spec.ts#L1-L79
