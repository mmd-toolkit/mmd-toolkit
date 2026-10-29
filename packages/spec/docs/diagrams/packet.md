# Packet

Japanese version: [packet.ja.md](./packet.ja.md)

This document defines `packet` and `packet-beta`. The
[source tree](../ast/packet.md) preserves authored forms; derived values belong
to the [tests summary](../../../tests/docs/db-summaries.md#packet). The syntax
follows
[packet.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/packet/packet.langium#L1-L21)
and
[common.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L6-L34).
[fixture: packet/gram-mixed] [fixture: packet/spec-packet-c4580507]

## Detection

Entry 24 of [detection.md](../detection.md), the
[packet detector](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/packet/detector.ts#L7-L15),
selects the exact lowercase prefix `packet` without a suffix boundary, including
`packet-beta`; both report diagram id `packet`. Detection alone does not accept
`packetx`, `packet2`, or `packet-BETA`. `Packet` is not an alias. [fixture:
packet/spec-packet-7426afc4] [fixture: packet/spec-packet-c4580507] [fixture:
packet/header-letter-suffix] [fixture: packet/header-digit-suffix] [fixture:
packet/header-beta-uppercase] [fixture: packet/header-uppercase]

Apply common leading trivia, real frontmatter and conversion from
[common.md](../common.md#reading-a-source). Leading spaces, tabs, blank lines
and indentation may precede either header. Real frontmatter is a shared
Frontmatter, never a packet statement. Matching byte order marks immediately
before both fences can make the block real leading frontmatter. [fixture:
packet/lex-yaml-bom-both-fences] [fixture: packet/header-parser-packet-spaces]
[fixture: packet/header-parser-packet-tabs] [fixture:
packet/header-parser-packet-indented] [fixture:
packet/header-parser-beta-spaces] [fixture: packet/header-parser-beta-tabs]
[fixture: packet/header-parser-beta-indented] [fixture:
packet/space-leading-unicode] [fixture: packet/frontmatter-title]

At the detection point, detection passes at most one retained block with the
common [Frontmatter](../common.md#frontmatter) shape, before bare percent-pair
lines and the second directive scan. The block remains diagram text and must
match native hidden YAML; textBeforeHeader owns it as PacketIgnoredText, without
applying its properties. Real frontmatter may precede it, and a second-scan
directive may follow it. A second block, or a block after a second-scan
directive or a passed bare line, is not passed. Leading trimming can remove only
opening indentation and leave mismatched fences. [fixture:
packet/detect-one-block] [fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/detect-block-after-real-frontmatter] [fixture:
packet/detect-block-before-directive] [fixture: packet/detect-two-blocks]
[fixture: packet/detect-directive-before-block] [fixture:
packet/detect-block-after-bare-brace] [fixture: packet/detect-equally-indented]
[fixture: packet/detect-opener-indent]

Adjacent fences without a body line, a missing closer, mismatched indentation,
four opening dashes, closing suffix text and a closer without its following line
break stop that skip. Three adjacent fence lines can instead supply a body line.
Detection success still requires native acceptance: Unicode opening padding and
unreadable whitespace after a closer reject. [fixture:
packet/detect-adjacent-fences] [fixture: packet/detect-unclosed-block] [fixture:
packet/detect-mismatched-indent] [fixture: packet/detect-four-dashes] [fixture:
packet/detect-closing-suffix] [fixture: packet/detect-no-closing-lf] [fixture:
packet/detect-three-fences] [fixture: packet/detect-opener-bom] [fixture:
packet/detect-closer-u3000]

A directive found only by the second scan is also retained in textBeforeHeader
and must satisfy native DIRECTIVE boundaries; a glued header can therefore
reject. Multiple matching retained directives remain separate nodes. Passed bare
lines, including `%%{}%%` and unclosed `%%{!`, are shared Comments with mark
`%%`; they and their accompanying whitespace and line breaks are not read again.
[fixture: packet/detect-second-scan-directive] [fixture:
packet/detect-second-scan-glued] [fixture: packet/detect-two-second-scan-forms]
[fixture: packet/detect-empty-braces-bare] [fixture:
packet/detect-unclosed-brace-bare]

All common whitespace passed with a bare line is trivia, immediately before the
header, on a line of its own, or between retained forms. Mermaid's native
reading rejects non-ASCII whitespace there; this specification accepts it under
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).
Without a passed line the same gap remains native diagram text. [fixture:
packet/bare-before-header-space] [fixture: packet/bare-line-ascii-whitespace]
[fixture: packet/bare-before-header-tab] [fixture:
packet/bare-before-header-bom] [fixture: packet/bare-before-header-ls] [fixture:
packet/bare-line-ps] [fixture: packet/retained-directive-bare-bom] [fixture:
packet/retained-yaml-bare-ls] [fixture: packet/retained-yaml-bare-ls-line]
[fixture: packet/retained-directive-bare-ls] [fixture:
packet/detect-yaml-bare-directive-ascii] [fixture:
packet/div-detect-yaml-bare-directive-ls] [fixture:
packet/lex-retained-no-bare-ls] [fixture: packet/bare-before-header-1680]
[fixture: packet/bare-before-header-2000] [fixture:
packet/bare-before-header-2001] [fixture: packet/bare-before-header-2002]
[fixture: packet/bare-before-header-2003] [fixture:
packet/bare-before-header-2004] [fixture: packet/bare-before-header-2005]
[fixture: packet/bare-before-header-2006] [fixture:
packet/bare-before-header-2007] [fixture: packet/bare-before-header-2008]
[fixture: packet/bare-before-header-2009] [fixture:
packet/bare-before-header-200a] [fixture: packet/bare-before-header-202f]
[fixture: packet/bare-before-header-205f] [fixture:
packet/bare-before-header-3000] [fixture: packet/bare-before-header-ff]
[fixture: packet/bare-before-header-nbsp] [fixture:
packet/bare-before-header-ps] [fixture: packet/bare-before-header-vt] [fixture:
packet/bare-line-1680] [fixture: packet/bare-line-2000] [fixture:
packet/bare-line-2001] [fixture: packet/bare-line-2002] [fixture:
packet/bare-line-2003] [fixture: packet/bare-line-2004] [fixture:
packet/bare-line-2005] [fixture: packet/bare-line-2006] [fixture:
packet/bare-line-2007] [fixture: packet/bare-line-2008] [fixture:
packet/bare-line-2009] [fixture: packet/bare-line-200a] [fixture:
packet/bare-line-202f] [fixture: packet/bare-line-205f] [fixture:
packet/bare-line-3000] [fixture: packet/bare-line-bom] [fixture:
packet/bare-line-ff] [fixture: packet/bare-line-nbsp] [fixture:
packet/bare-line-vt]

## Lexical structure

### Ordered rules

Read converted diagram text from the detection point, excluding the passed
intervals above. At each unit start take the first matching rule in this order
and restart after it. There is no general longest-match choice. The range dash
has an explicit longer alternative: choose a whole hidden YAML match instead
when one starts there. Unreadable characters reject the entire input. [fixture:
packet/gram-mixed] [fixture: packet/hidden-yaml-body] [fixture:
packet/lex-dash-before-yaml] [fixture: packet/error-start] [fixture:
packet/error-after-prefix]

1. `packet-beta`.
2. `packet`.
3. `range-dash` (`-`), with the hidden YAML alternative above.
4. `relative-plus` (`+`).
5. `colon` (`:`).
6. `acc-descr-line` or `acc-descr-block`.
7. `acc-title-line`.
8. `title-line`.
9. `integer`.
10. `string`.
11. `newline` (LF).
12. Hidden ASCII whitespace.
13. Hidden YAML.
14. Hidden DIRECTIVE.
15. Native comment.

Imported BOOLEAN, FLOAT, NUMBER and ID supply no additional units. A standalone
boolean, name or empty string rejects; a string is legal only as a block label.
[fixture: packet/gram-standalone-boolean] [fixture: packet/gram-standalone-name]
[fixture: packet/gram-standalone-empty-string] [fixture:
packet/gram-number-float] [fixture: packet/db-label-empty-double]

### Header boundaries and gaps

Only `packet` requires immediate common whitespace, `%%` or end of text. A
letter, digit, underscore, dash, Unicode letter, colon, hash, single percent,
brace or quote fails that boundary. Judge it after common directives and
selected semicolons are left out; a removed directive alone supplies no
boundary. `packet-beta` has no such check and may touch a block or common form.
[fixture: packet/header-letter-suffix] [fixture: packet/header-digit-suffix]
[fixture: packet/lex-header-underscore] [fixture: packet/header-dash-suffix]
[fixture: packet/header-unicode-suffix] [fixture: packet/lex-header-colon]
[fixture: packet/lex-header-hash] [fixture: packet/lex-header-percent] [fixture:
packet/lex-header-brace] [fixture: packet/lex-header-quote] [fixture:
packet/directive-header-glued] [fixture: packet/directive-header-space-control]
[fixture: packet/header-beta-glued-block] [fixture:
packet/header-beta-glued-relative] [fixture:
packet/directive-beta-glued-relative] [fixture: packet/header-beta-title]

A boundary does not consume whitespace or make it a legal gap. Only ASCII
space/tab is hidden between units; LF is visible. Common CR and CRLF conversion
applies first. NBSP, BOM, LS/PS and other common whitespace are readable only
where common leading trivia or an enclosing value/opening gap admits them.
[fixture: packet/header-packet-spaces-before-lf] [fixture:
packet/header-packet-tab-before-lf] [fixture:
packet/header-beta-spaces-before-lf] [fixture: packet/header-beta-tab-before-lf]
[fixture: packet/space-count-tab] [fixture: packet/space-header-nbsp] [fixture:
packet/space-header-bom] [fixture: packet/space-count-bom] [fixture:
packet/lex-integer-trailing-gap-ls] [fixture: packet/space-block-3000] [fixture:
packet/line-cr] [fixture: packet/line-crlf] [fixture: packet/line-ls-between]
[fixture: packet/line-ps-eof]

### Numbers and strings

An integer is `0`, or a nonzero ASCII digit followed by as many ASCII digits as
possible while the next character is not a dot. The zero alternative ends after
one digit. A nonzero match can shorten before a dot, but leftover characters
still reject. Signs, decimal points, exponents, NaN and Infinity spellings are
not integers. [fixture: packet/gram-single-zero] [fixture:
packet/gram-leading-zero] [fixture: packet/lex-integer-shorter-before-dot]
[fixture: packet/gram-negative-zero] [fixture: packet/gram-number-dot] [fixture:
packet/gram-number-exponent] [fixture: packet/gram-number-nan] [fixture:
packet/gram-number-infinity]

A string starts with either quote and requires the same closing quote. It
contains zero or more ordinary characters other than that quote/backslash, or a
backslash and one character other than LF, CR, LS or PS; take as many complete
components as possible. Ordinary content may include physical line breaks, LS/PS
and the other quote. Strings own enclosed native-comment, YAML and
native-directive-looking text. Common directives and comment regions still have
their shared scope. [fixture: packet/db-label-empty-double] [fixture:
packet/db-label-empty-single] [fixture: packet/db-label-single-escapes]
[fixture: packet/lex-label-open] [fixture: packet/lex-label-open-single]
[fixture: packet/lex-label-multiline] [fixture: packet/line-crlf-label]
[fixture: packet/line-ls-label] [fixture: packet/line-ps-label] [fixture:
packet/html-all-fields] [fixture: packet/lex-label-escaped-lf] [fixture:
packet/lex-label-escaped-ls] [fixture: packet/lex-label-escaped-ps] [fixture:
packet/lex-label-comment] [fixture: packet/hidden-yaml-in-label] [fixture:
packet/lex-label-native-directive] [fixture: packet/directive-label-middle]
[fixture: packet/lex-label-comment-line]

NumericLiteral keeps written digits in raw and their double value; StringLiteral
keeps quotes and escapes in raw and its authored interior in value, without
escape decoding or whitespace normalization. Db conversion is separate.
[fixture: packet/db-precision-rounded] [fixture: packet/db-overflow-wide]
[fixture: packet/db-label-escapes] [fixture: packet/db-label-space]

### Composite common forms

Optional ASCII indentation may precede each common form. `title-line` is `title`
alone or followed by one ASCII space/tab and possibly empty line text.
`acc-title-line` is `accTitle`, zero or more ASCII spaces/tabs, colon and
possibly empty line text; `acc-descr-line` uses `accDescr`. Their component
rules are case-sensitive and do not use the header's custom boundary. A colon is
required for the two accessibility line forms. [fixture: packet/title-empty]
[fixture: packet/lex-title-one-space] [fixture: packet/lex-title-one-tab]
[fixture: packet/lex-title-two-spaces] [fixture: packet/common-whitespace]
[fixture: packet/acctitle-empty] [fixture: packet/accdescr-line-empty] [fixture:
packet/acctitle-no-colon] [fixture: packet/title-colon] [fixture:
packet/title-uppercase] [fixture: packet/acctitle-uppercase] [fixture:
packet/accdescr-uppercase] [fixture: packet/common-title-nbsp-gap] [fixture:
packet/common-acctitle-nbsp-gap]

Line text ends before the first `%%` or physical line end. LS/PS, single
percent, punctuation, quotes, backslashes and apparent later keywords remain
content; quotes need not close and escapes are not string syntax. Empty values
do not take the next physical line, including across comment lines. [fixture:
packet/comment-title] [fixture: packet/comment-acctitle] [fixture:
packet/comment-accdescr] [fixture: packet/common-title-ls] [fixture:
packet/common-acctitle-ps] [fixture: packet/common-accdescr-ls] [fixture:
packet/title-open-quote] [fixture: packet/title-quotes] [fixture:
packet/acctitle-quoted] [fixture: packet/accdescr-line-quoted] [fixture:
packet/end-line-semicolons] [fixture: packet/common-line-consumes-keyword]
[fixture: packet/lex-common-line-percent] [fixture:
packet/common-line-no-next-value] [fixture: packet/common-comment-gap]

`acc-descr-block` is `accDescr`, zero or more common whitespace characters, `{`,
and arbitrary text through the first required `}`. The opening gap may include
LF, blank lines, LS/BOM and common directives; a surviving native comment cannot
bridge it. Content includes LF/LS/PS. Braces do not nest; quotes and backslashes
do not protect the closer. A colon instead chooses line text, including braces.
[fixture: packet/accdescr-block-gap-lf] [fixture:
packet/lex-block-native-comment-inline-gap] [fixture:
packet/lex-block-gap-comment-region] [fixture: packet/accdescr-block-gap-ls]
[fixture: packet/accdescr-block-gap-bom] [fixture: packet/common-empty-gap]
[fixture: packet/common-directive-gap] [fixture: packet/accdescr-block-lines]
[fixture: packet/common-block-ps] [fixture: packet/gram-empty-description]
[fixture: packet/accdescr-block-first-close] [fixture:
packet/accdescr-block-escaped-close] [fixture:
packet/lex-description-quoted-close] [fixture:
packet/lex-description-nested-open] [fixture: packet/accdescr-block-open]
[fixture: packet/lex-description-colon-first]

### Hidden forms

At any unit start, hidden YAML starts with `---`, zero or more ASCII spaces/tabs
and LF, even off a physical line start. First try a body-present match: take as
few arbitrary characters as possible through a subsequent LF and unindented
`---` followed by LF, common whitespace or EOF. Only if that cannot match, try
the empty form whose closer immediately follows the opening LF. Body text
includes LF/LS/PS and is not parsed as YAML. Four opening dashes, Unicode
opening padding, indented closers and missing closers do not match; a range dash
may precede a valid YAML opener. [fixture: packet/hidden-yaml-padding] [fixture:
packet/hidden-yaml-body] [fixture: packet/hidden-yaml-adjacent-eof] [fixture:
packet/hidden-yaml-adjacent-later] [fixture: packet/lex-yaml-body-separators]
[fixture: packet/lex-yaml-opener-bom] [fixture:
packet/lex-hidden-yaml-four-dashes] [fixture: packet/hidden-yaml-indent-close]
[fixture: packet/hidden-yaml-unclosed] [fixture: packet/lex-dash-before-yaml]

Three adjacent fences can be one match; two apparent empty blocks can leave a
fourth unmatched fence. Two nonempty blocks with qualifying closers remain
separate. A nonqualifying closer remains body text until a later closer
qualifies. [fixture: packet/hidden-yaml-adjacent-later] [fixture:
packet/lex-yaml-two-empty] [fixture: packet/lex-yaml-two-nonempty] [fixture:
packet/hidden-yaml-nonqualifying]

After optional ASCII padding, native hidden DIRECTIVE starts with `%%{` and
takes as few arbitrary characters as possible through `}%%` followed by LF,
common whitespace or EOF. Empty/nonword content and LF/LS/PS are allowed. A
nonqualifying closer is passed for a later one; without any qualifying closer
the native comment rule may apply instead. [fixture:
packet/hidden-directive-header] [fixture:
packet/hidden-directive-empty-adjacent] [fixture:
packet/lex-directive-body-separators] [fixture:
packet/hidden-directive-later-close] [fixture:
packet/hidden-directive-close-glued] [fixture: packet/hidden-directive-unclosed]

Both forms consume a directly following LF; other qualifying whitespace is
lookahead only and must be readable in its following position. Consuming the
only LF after a statement prevents a following statement. A spare LF or ASCII
space/tab after the closer preserves visible EOL. At original EOF the appended
LF can be consumed and EOF satisfies EOL. The consumed line terminator is
outside PacketIgnoredText's range. [fixture: packet/hidden-directive-block]
[fixture: packet/hidden-directive-block-spare] [fixture:
packet/hidden-directive-block-space] [fixture:
packet/hidden-directive-block-eof] [fixture: packet/hidden-directive-title]
[fixture: packet/hidden-directive-title-spare] [fixture:
packet/hidden-directive-title-space] [fixture:
packet/hidden-directive-title-eof] [fixture: packet/hidden-directive-acctitle]
[fixture: packet/hidden-directive-acctitle-spare] [fixture:
packet/hidden-directive-acctitle-space] [fixture:
packet/hidden-directive-acctitle-eof] [fixture:
packet/hidden-directive-accdescr] [fixture:
packet/hidden-directive-accdescr-spare] [fixture:
packet/hidden-directive-accdescr-space] [fixture:
packet/hidden-directive-accdescr-eof] [fixture:
packet/hidden-directive-description] [fixture:
packet/hidden-directive-description-spare] [fixture:
packet/hidden-directive-description-space] [fixture:
packet/hidden-directive-description-eof] [fixture: packet/hidden-yaml-block]
[fixture: packet/hidden-yaml-block-spare] [fixture:
packet/hidden-yaml-block-space] [fixture: packet/hidden-yaml-block-eof]
[fixture: packet/hidden-yaml-description] [fixture:
packet/hidden-yaml-description-spare] [fixture:
packet/hidden-yaml-description-space] [fixture:
packet/hidden-yaml-description-eof] [fixture: packet/hidden-directive-close-ls]
[fixture: packet/hidden-yaml-close-ps] [fixture: packet/hidden-directive-cr]
[fixture: packet/hidden-directive-crlf] [fixture: packet/hidden-yaml-cr]
[fixture: packet/hidden-yaml-crlf]

Whole hidden forms have exactly one owner: textBeforeHeader, body or a
statement's named gap/suffix. After a visible EOL they belong to body. Earlier
strings, line values and description blocks own enclosed hidden-looking text
instead; line values absorb YAML dashes. Hidden forms separate units and never
concatenate integers or fixed keywords. [fixture: packet/gram-hidden-gap]
[fixture: packet/gram-single-hidden-gaps] [fixture:
packet/gram-relative-hidden-colon] [fixture:
packet/gram-hidden-range-gap-spaced] [fixture: packet/gram-hidden-range-gap]
[fixture: packet/gram-hidden-yaml-gap] [fixture: packet/gram-yaml-around-range]
[fixture: packet/lex-hidden-after-visible-eol] [fixture:
packet/lex-hidden-two-suffixes] [fixture: packet/lex-yaml-directive-sequence]
[fixture: packet/hidden-yaml-in-label] [fixture:
packet/hidden-yaml-in-description] [fixture: packet/hidden-yaml-title-absorbed]
[fixture: packet/hidden-yaml-acctitle-absorbed] [fixture:
packet/hidden-yaml-accdescr-absorbed] [fixture:
packet/lex-hidden-between-digits]

### Comments and common trivia

Native comments read optional ASCII indentation, `%%` and maximal content before
physical LF/CR; LS/PS remain content. The mark is `%%` and value follows it.
Neither a preceding character nor the ending line terminator belongs to the
Comment. Bare/triple percent-pair lines are allowed, a single percent is not.
[fixture: packet/comment-header] [fixture: packet/comment-block] [fixture:
packet/comment-eof] [fixture: packet/comment-bare] [fixture:
packet/lex-native-comment-triple] [fixture: packet/lex-native-comment-single]
[fixture: packet/lex-native-comment-ls] [fixture: packet/lex-native-comment-ps]

Comments are shared records, never PacketIgnoredText. A description block owns
bare percent lines; common comment regions are still removed. A
native-directive-looking form inside a description closes it at its first brace
and can leave a native comment. [fixture: packet/common-block-bare] [fixture:
packet/common-block-comment] [fixture: packet/lex-description-comment-only]
[fixture: packet/lex-description-hidden-first-brace]

Common directives, comment regions and selected semicolons retain their shared
scope inside values and hidden forms. Written value fields leave them out, while
source ranges span internal trivia. Removal can join punctuation in hidden
delimiters or a native comment mark; it may also occur between a complete common
keyword and colon/brace/title separator. Fixed-word and integer interiors
instead follow the atomic divergences below. [fixture:
packet/directive-label-middle] [fixture: packet/directive-title-value] [fixture:
packet/directive-acctitle-value] [fixture: packet/directive-accdescr-value]
[fixture: packet/directive-description-value] [fixture:
packet/lex-hidden-nested-global] [fixture: packet/lex-yaml-common-comment]
[fixture: packet/detect-second-scan-directive] [fixture:
packet/lex-yaml-opener-global] [fixture: packet/lex-yaml-closer-global]
[fixture: packet/lex-hidden-joined-opener] [fixture:
packet/lex-hidden-joined-closer] [fixture: packet/lex-native-comment-split-mark]
[fixture: packet/lex-yaml-fence-selected] [fixture:
packet/lex-hidden-opener-selected] [fixture: packet/lex-hidden-closer-selected]
[fixture: packet/directive-acctitle-colon] [fixture:
packet/directive-accdescr-colon] [fixture: packet/directive-accdescr-brace]
[fixture: packet/directive-title-separator] [fixture:
packet/lex-selected-colon-boundary] [fixture:
packet/lex-selected-brace-boundary]

The shared style/classDef line rule selects only qualifying semicolons;
remaining semicolons reject outside values and never separate packet statements.
HTML attribute quotes and entities follow common conversion, while the authored
tree keeps their spelling. [fixture: packet/style-label] [fixture:
packet/style-title] [fixture: packet/style-description-end] [fixture:
packet/style-description-double] [fixture: packet/end-block-semicolon] [fixture:
packet/end-header-semicolon] [fixture: packet/html-all-fields] [fixture:
packet/entity-all-text] [fixture: packet/entity-block]

## Grammar

```text
diagram = newline* ("packet" | "packet-beta")
          (block | common-statement | newline)* end-of-text
block = (range-block | single-block | relative-block) eol
range-block = integer range-dash integer colon string
single-block = integer colon string
relative-block = relative-plus integer colon string
common-statement = (title-line | acc-title-line
                   | acc-descr-line | acc-descr-block) eol
eol = newline+ | end-of-text
```

The [common notation](../common.md#notation) applies. Hidden forms have the
owners defined by the tree and supply no visible separators. Body may be empty;
no newline is required after the header. Blocks and common statements may
alternate. There is no showInfo or showBits flag, and a second header rejects.
[fixture: packet/spec-packet-7426afc4] [fixture: packet/header-inline-block]
[fixture: packet/header-inline-title] [fixture: packet/header-beta-title]
[fixture: packet/gram-common-interleaved] [fixture: packet/gram-no-showinfo]
[fixture: packet/gram-no-showbits] [fixture: packet/gram-second-header]

Each complete block/common form requires visible EOL or EOF. Blank lines may
precede, separate or trail statements; a trailing EOL creates no extra body
item. A visible newline, comment line or empty description cannot be used
between block components. A missing endpoint, colon or quoted label rejects, as
do adjacent same-line blocks or a common statement after a completed block.
[fixture: packet/gram-block-blank-lines] [fixture: packet/comment-inside-range]
[fixture: packet/gram-visible-newline-in-block] [fixture:
packet/gram-empty-description-in-block] [fixture: packet/gram-end-missing]
[fixture: packet/gram-colon-missing] [fixture: packet/gram-label-missing]
[fixture: packet/gram-bare-label] [fixture: packet/gram-same-line-blocks]
[fixture: packet/gram-block-title-same-line] [fixture:
packet/common-block-needs-eol]

| Rule              | Node                         |
| ----------------- | ---------------------------- |
| diagram           | PacketDiagram                |
| range-block       | PacketRangeBlockStatement    |
| single-block      | PacketSingleBlockStatement   |
| relative-block    | PacketRelativeBlockStatement |
| title-line        | PacketTitleStatement         |
| acc-title-line    | PacketAccTitleStatement      |
| acc-descr-line    | PacketAccDescrStatement      |
| acc-descr-block   | PacketAccDescrBlockStatement |
| integer           | NumericLiteral               |
| string            | StringLiteral                |
| Common value      | PacketLiteral                |
| Whole hidden form | PacketIgnoredText            |

### Db normalization

The [tests package's packet summary](../../../tests/docs/db-summaries.md#packet)
defines converted text, final common values and published rows. These are
derived values, not additional syntax nodes or acceptance rules. Preserve each
authored statement, including repetitions, empty values and blocks omitted after
the publication cap. [fixture: packet/gram-mixed] [fixture:
packet/db-label-escapes] [fixture: packet/title-repeat-empty] [fixture:
packet/accdescr-block-repeat] [fixture:
packet/db-cap-following-block-unpublished] [fixture:
packet/db-cap-later-logical-end]

### Semantic acceptance conditions

After complete lexical and grammatical acceptance, apply the following
conditions in statement order. Any lexer/parser error or unread visible unit
rejects the whole source, including after a valid prefix or recovery. Labels and
common values introduce no additional semantic rejection. The
[public wrapper](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L134-L150)
and
[packet adapter](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/packet/parser.ts#L11-L90)
are the sources of these gates. [fixture: packet/error-after-prefix] [fixture:
packet/error-recovered-block] [fixture: packet/db-label-empty-double] [fixture:
packet/gram-empty-description]

Use IEEE 754 double values for written integers and every arithmetic operation
below, including rounding and overflow; preserve the stated operation order. The
last logical endpoint initially is minus one. For each block, first reject an
explicit range whose end is less than its start; equal endpoints are allowed.
Then set a relative block's start to the last logical endpoint plus one, and
require every explicit start to equal that same value using the rounded double
values. Next reject a relative count of zero. [fixture:
packet/db-precision-rounded] [fixture: packet/db-overflow-wide] [fixture:
packet/error-descending-before-gap] [fixture: packet/gram-zero-range] [fixture:
packet/error-first-nonzero] [fixture: packet/error-overlap] [fixture:
packet/error-repeat-third] [fixture: packet/gram-mixed] [fixture:
packet/spec-packet-a0e6e5ca] [fixture: packet/error-zero-after-valid] [fixture:
packet/db-explicit-start-rounded] [fixture:
packet/db-explicit-end-rounded-continuity] [fixture:
packet/db-explicit-end-and-start-rounded-continuity] [fixture:
packet/db-explicit-end-overflow-continuity]

For example, a written explicit start of `9007199254740993` is rounded to
`9007199254740992` before comparing continuity.

For example, after an explicit end of `9007199254740992`, adding one still gives
that endpoint, so a next start written as either `9007199254740992` or
`9007199254740993` passes the continuity comparison even though the block
overlaps the previous range.

When a written explicit end and next start both overflow to infinity, adding one
leaves infinity, so the continuity comparison accepts the next block. [fixture:
packet/db-explicit-end-overflow-continuity]

For a relative block, its logical end is start plus the written count, then
minus one. For a single block it is start plus one, then minus one; for a range
it is the explicit end. Update the last logical endpoint to that end before any
row splitting. Common statements, comments and hidden forms do not update it. Do
not replace these operations with an algebraically simplified expression.
[fixture: packet/gram-mixed] [fixture: packet/gram-common-interleaved] [fixture:
packet/comment-block] [fixture: packet/lex-hidden-after-visible-eol] [fixture:
packet/db-rounded-following-unpublished] [fixture:
packet/error-rounded-following-wide] [fixture:
packet/error-single-rounded-end-wide] [fixture:
packet/db-single-rounded-end-default]

For example, a single block starting at `9007199254740992` has end
`9007199254740991` with that operation order; a site row width of
`10000000000000000` lets the pending fragment check reject it, whereas the
default width reaches the publication cap first and accepts it.

The row width is `packet.bitsPerRow`, 32 by default. When site configuration
changes it, whoever holds that configuration applies it to the following checks,
as with the site limit maxEdges in flowchart; the remaining block checks above
are determined from the tree alone. Do not add schema validation as a syntax
rejection. Embedded frontmatter/directive configuration does not change these
acceptance conditions: when text configuration's `packet.bitsPerRow` changes
acceptance in either direction, the input carries
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md). [fixture:
packet/config-fraction-default] [fixture: packet/config-fraction-reject]
[fixture: packet/config-rows-eight] [fixture:
packet/config-frontmatter-fraction] [fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site] [fixture:
packet/config-directive-overrides-site] [fixture:
packet/config-frontmatter-row-fraction-accepted] [fixture:
packet/config-frontmatter-row-zero] [fixture:
packet/config-frontmatter-row-negative]

For the row-boundary checks keep a row number initially one, a current-row
fragment count initially zero and a published-row count initially zero. These
carry across blocks. Start each block with its logical start and end as the
pending fragment. Enter the following iteration only while the current-row
fragment count is at most row width plus one and the published-row count is less
than 10,000. [fixture: packet/db-row-split] [fixture: packet/db-row-exact]
[fixture: packet/config-fraction-reject] [fixture:
packet/db-rounded-following-unpublished] [fixture:
packet/error-rounded-following-wide]

Inside each entered iteration, first reject if the pending start exceeds its
end. If pending end plus one is at most row number times row width, the fragment
fits unchanged with no remainder. Otherwise its fitting end is row number times
row width minus one, and the remainder starts at row number times row width with
the same pending end. Increase the current-row fragment count by one. If the
fitting end plus one equals row number times row width, increase the
published-row count and row number by one and reset the current-row fragment
count to zero. With a remainder, repeat from the entrance condition; without
one, finish this block. [fixture: packet/db-row-split] [fixture:
packet/db-row-exact] [fixture: packet/config-fraction-reject] [fixture:
packet/error-rounded-following-wide]

At the default row width of 32, the rejection for a pending start greater than
its end cannot occur: integers and their arithmetic below 2^53 are exact, and
the 10,000-row cap is reached before a start near 2^53, where inversion becomes
possible. This rejection matters only to whoever applies a changed site row
width. [fixture: packet/db-single-rounded-end-default] [fixture:
packet/error-single-rounded-end-wide] [fixture:
packet/db-rounded-following-unpublished] [fixture:
packet/error-rounded-following-wide]

Reaching the publication cap skips further row-boundary iterations, not later
blocks' descending-range, continuity or zero-count checks. Their logical-end
updates continue too. A later block can therefore be accepted and remain in the
source tree without being published. [fixture:
packet/db-cap-following-block-unpublished] [fixture:
packet/db-cap-later-logical-end] [fixture:
packet/error-cap-following-descending] [fixture:
packet/error-cap-following-noncontiguous] [fixture:
packet/error-cap-following-zero] [fixture:
packet/db-rounded-following-unpublished]

## Known divergences

Only the following six existing identifiers apply;
[their documents](../known-divergences.md) define the reasons and comparison
readings. Whole hidden forms, empty labels and empty descriptions have nodes of
their own and need no tokenless-empty-forms divergence. [fixture:
packet/hidden-yaml-body] [fixture: packet/db-label-empty-double] [fixture:
packet/gram-empty-description]

- **[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
  Shared Directive records hold the text, but a fixed word or integer has no
  internal component boundary. The direct atomic rule rejects their split forms
  under reason 2. A complete keyword/colon or keyword/brace boundary and value
  text are nondiffering controls. [fixture: packet/directive-header-middle]
  [fixture: packet/directive-beta-middle] [fixture:
  packet/directive-title-middle] [fixture: packet/directive-acctitle-middle]
  [fixture: packet/directive-accdescr-middle] [fixture:
  packet/directive-number-middle] [fixture: packet/directive-acctitle-colon]
  [fixture: packet/directive-accdescr-brace] [fixture:
  packet/directive-label-middle]
- **[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  A selected character is trivia, but cannot split a fixed word or integer.
  Complete component boundaries and hidden punctuation can contain it. Detection
  precedes selection, so a split header can reject before this difference
  arises. [fixture: packet/div-selected-title-interior] [fixture:
  packet/div-selected-acctitle-interior] [fixture:
  packet/div-selected-accdescr-line-interior] [fixture:
  packet/div-selected-accdescr-block-interior] [fixture:
  packet/div-selected-integer-interior] [fixture:
  packet/lex-selected-colon-boundary] [fixture:
  packet/lex-selected-brace-boundary] [fixture: packet/lex-yaml-fence-selected]
  [fixture: packet/detect-selected-split-header]
- **[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md).**
  Frontmatter and values retain their source, but body quote conversion does not
  depend on an unclosed opaque frontmatter tag. It can change a value or reverse
  acceptance in either direction; the body-only control agrees. [fixture:
  packet/div-html-frontmatter-value] [fixture:
  packet/div-html-frontmatter-accept] [fixture:
  packet/div-html-frontmatter-reject] [fixture:
  packet/gram-html-body-only-reference]
- **[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).**
  Frontmatter/directive nodes hold their bodies without interpreting them for
  acceptance. Malformed YAML may reject only in Mermaid. In both acceptance
  directions the comparison removes only `packet.bitsPerRow` from valid text
  configuration, retaining site configuration, Mermaid's derived frontmatter
  title and other valid settings. [fixture: packet/frontmatter-invalid]
  [fixture: packet/frontmatter-invalid-keeps-config] [fixture:
  packet/config-frontmatter-fraction] [fixture:
  packet/config-directive-fraction] [fixture:
  packet/config-frontmatter-overrides-site] [fixture:
  packet/config-directive-overrides-site]
- **[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).**
  Strings, common literals, ignored text and Comments already hold C4 words.
  Header-only selection under reverse reason 2 accepts later C4 words that
  switch Mermaid to C4 and reject. It rejects no Mermaid-accepted input.
  LF-terminated suffixes and detection-passed retained YAML are nondiffering
  controls. [fixture: packet/c4container-label] [fixture:
  packet/c4component-title] [fixture: packet/c4deployment-block] [fixture:
  packet/c4dynamic-header-comment-eof] [fixture: packet/div-c4-hidden-yaml]
  [fixture: packet/div-c4-hidden-suffix-eof] [fixture:
  packet/c4-hidden-suffix-lf] [fixture: packet/c4-retained-preheader-yaml]
- **[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
  Passed lines are shared Comments and accompanying whitespace is trivia; the
  direct detection rule accepts Unicode trivia Mermaid rejects, including
  between retained forms. This rejects no Mermaid-accepted input. Without a
  passed line, native gap rules still apply. [fixture:
  packet/bare-before-header-bom] [fixture: packet/bare-line-ls] [fixture:
  packet/retained-yaml-bare-ls] [fixture:
  packet/div-detect-yaml-bare-directive-ls] [fixture:
  packet/detect-yaml-bare-directive-ascii] [fixture:
  packet/lex-retained-no-bare-ls]
