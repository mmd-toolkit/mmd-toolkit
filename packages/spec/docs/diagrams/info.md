# Info

Japanese version: [info.ja.md](./info.ja.md)

This document defines `info`. Its source tree is in
[ast/info.md](../ast/info.md); derived values are summarized by the
[tests package](../../../tests/docs/db-summaries.md#info). The syntax follows
[info.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/info/info.langium#L1-L9)
and its imported
[common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L1-L34).
[fixture: info/header-lf] [fixture: info/common-all]

## Detection

Entry 12 of [detection.md](../detection.md) selects the exact lower-case prefix
`info`, without a suffix boundary. `information` is detected as info but
rejected by the lexical rules. Neither `Info` nor `INFO` is an alias; a split or
absent header does not select info. [fixture: info/header-lf] [fixture:
info/detect-lower-suffix] [fixture: info/detect-titlecase] [fixture:
info/detect-uppercase] [fixture: info/detect-header-split] [fixture:
info/detect-bare-only]

Common leading trivia, real frontmatter, directives, comment regions, HTML
attribute quotes, entities and selected semicolons apply. Frontmatter title is
the value Mermaid derives in every diagram type; it does not become an info
statement. [fixture: info/frontmatter-title] [fixture: info/frontmatter-html]
[fixture: info/frontmatter-config] [fixture: info/directive-config] [fixture:
info/html-all-common] [fixture: info/style-title]

At the detection point, detection passes at most one block satisfying the common
[Frontmatter](../common.md#frontmatter) shape, before bare percent-pair lines
and the second directive scan. The block remains diagram text. Info applies its
hidden YAML rule and holds a matching block as InfoIgnoredText in
textBeforeHeader, without applying its YAML properties. Invalid YAML there is
still accepted. [fixture: info/frontmatter-nonleading-comment] [fixture:
info/frontmatter-nonleading-lf] [fixture: info/frontmatter-bom-opening]
[fixture: info/hidden-yaml-config-ignored] [fixture:
info/hidden-yaml-preheader-invalid]

Real frontmatter may precede that retained block; a second-scan directive may
follow it. A second block, or a block after a second-scan directive or a passed
bare line, is not passed. Leading trimming can leave only the closer indented
and prevent the skip. [fixture: info/detect-block-after-real-frontmatter]
[fixture: info/detect-block-before-second-scan] [fixture:
info/detect-two-blocks] [fixture: info/detect-second-scan-before-block]
[fixture: info/detect-block-after-bare-brace] [fixture:
info/detect-block-equally-indented]

Adjacent fences without a body line, an unclosed block, mismatched indentation,
four opening dashes, closing suffix text and a closer without the required
following line break do not satisfy the detection shape. Three adjacent fence
lines can supply its body line. Passing detection does not relax native
boundaries: Unicode opener padding and unreadable whitespace after a closer
still reject. [fixture: info/lex-detect-preheader-adjacent] [fixture:
info/lex-preheader-unclosed] [fixture: info/lex-preheader-mismatched-indent]
[fixture: info/lex-detect-preheader-four] [fixture:
info/lex-detect-preheader-closing-suffix] [fixture: info/frontmatter-unclosed]
[fixture: info/lex-preheader-three-fences] [fixture:
info/lex-detect-preheader-open-nbsp] [fixture:
info/lex-detect-preheader-close-nbsp] [fixture: info/lex-preheader-closer-u3000]

Read retained second-scan directives with the hidden DIRECTIVE rule, including
its closing boundary, in textBeforeHeader. A header glued to the closer rejects.
Bare lines detection passes, including `%%{}%%` and an unclosed `%%{!`, are
shared Comments with mark `%%`, never InfoIgnoredText. They and the whitespace
and line breaks passed with them are not read again. Retained forms are still
read from the detection point rather than only from the reached header.
[fixture: info/detect-second-scan-directive] [fixture:
info/detect-second-scan-glued] [fixture: info/lex-detect-preheader-empty-braces]
[fixture: info/lex-detect-preheader-open-brace] [fixture:
info/detect-retained-yaml-ascii] [fixture: info/detect-retained-directive-ascii]

All common whitespace passed after a bare line is trivia, on a line of its own,
immediately before the header or between retained forms. After common CR
conversion, Mermaid rejects characters other than ASCII space, tab and LF there;
this specification accepts them under
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).
Without a passed bare line, whitespace after a retained prefix remains subject
to native lexical rules. [fixture: info/div-bare-before-header-1680] [fixture:
info/div-bare-before-header-2000] [fixture: info/div-bare-before-header-2001]
[fixture: info/div-bare-before-header-2002] [fixture:
info/div-bare-before-header-2003] [fixture: info/div-bare-before-header-2004]
[fixture: info/div-bare-before-header-2005] [fixture:
info/div-bare-before-header-2006] [fixture: info/div-bare-before-header-2007]
[fixture: info/div-bare-before-header-2008] [fixture:
info/div-bare-before-header-2009] [fixture: info/div-bare-before-header-200a]
[fixture: info/div-bare-before-header-202f] [fixture:
info/div-bare-before-header-205f] [fixture: info/div-bare-before-header-3000]
[fixture: info/div-bare-before-header-bom] [fixture:
info/div-bare-before-header-ff] [fixture: info/div-bare-before-header-ls]
[fixture: info/div-bare-before-header-nbsp] [fixture:
info/div-bare-before-header-ps] [fixture: info/div-bare-before-header-vt]
[fixture: info/div-bare-line-1680] [fixture: info/div-bare-line-2000] [fixture:
info/div-bare-line-2001] [fixture: info/div-bare-line-2002] [fixture:
info/div-bare-line-2003] [fixture: info/div-bare-line-2004] [fixture:
info/div-bare-line-2005] [fixture: info/div-bare-line-2006] [fixture:
info/div-bare-line-2007] [fixture: info/div-bare-line-2008] [fixture:
info/div-bare-line-2009] [fixture: info/div-bare-line-200a] [fixture:
info/div-bare-line-202f] [fixture: info/div-bare-line-205f] [fixture:
info/div-bare-line-3000] [fixture: info/div-bare-line-bom] [fixture:
info/div-bare-line-ff] [fixture: info/div-bare-line-ls] [fixture:
info/div-bare-line-nbsp] [fixture: info/div-bare-line-ps] [fixture:
info/div-bare-line-vt] [fixture: info/div-detect-retained-directive-bare-bom]
[fixture: info/div-detect-retained-directive-bare-ls] [fixture:
info/div-detect-retained-directive-bare-ls-line] [fixture:
info/div-detect-retained-yaml-bare-bom] [fixture:
info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-yaml-bare-ls-line] [fixture:
info/bare-before-header-space] [fixture: info/bare-line-tab] [fixture:
info/div-detect-yaml-bare-directive] [fixture:
info/lex-detect-yaml-bare-directive-ascii] [fixture:
info/lex-retained-no-bare-ls]

## Lexical structure

### Ordered rules

Read the converted diagram text of [common.md](../common.md#reading-a-source)
from the detection point, excluding the intervals passed above. At each unit
start take the first matching rule below and restart after it; there is no
general longest-match choice. Unreadable characters reject the whole input.
[fixture: info/common-all] [fixture: info/hidden-directive-body] [fixture:
info/hidden-yaml-body] [fixture: info/comment-bare-body] [fixture:
info/error-after-prefix] [fixture: info/error-after-common]

1. `showInfo`.
2. `info`.
3. `acc-descr-line` or `acc-descr-block`.
4. `acc-title-line`.
5. `title-line`.
6. `newline` (LF).
7. Hidden ASCII whitespace.
8. Hidden YAML.
9. Hidden DIRECTIVE.
10. Diagram comment.

Imported BOOLEAN, FLOAT, INT, NUMBER, STRING and ID are unreachable and supply
no additional units. Standalone strings, empty strings, booleans, numbers and
names reject; common text that looks quoted remains ordinary text. [fixture:
info/terminal-string-double] [fixture: info/terminal-string-single] [fixture:
info/lex-empty-quotes-standalone] [fixture: info/terminal-boolean] [fixture:
info/terminal-number] [fixture: info/terminal-id] [fixture:
info/title-open-quote]

### Keyword boundaries

Both fixed keywords are case-sensitive and require immediate common whitespace,
`%%` or end of text. Judge that boundary with common directives and selected
semicolons left out. A removed directive alone supplies no boundary. A letter,
digit, underscore, dash, Unicode letter, colon, hash, single percent, brace or
quote does not qualify. [fixture: info/detect-lower-suffix] [fixture:
info/detect-digit-suffix] [fixture: info/detect-underscore-suffix] [fixture:
info/detect-dash-suffix] [fixture: info/detect-unicode-suffix] [fixture:
info/detect-colon] [fixture: info/flag-letter-suffix] [fixture:
info/flag-digit-suffix] [fixture: info/flag-underscore-suffix] [fixture:
info/flag-dash-suffix] [fixture: info/flag-unicode-suffix] [fixture:
info/flag-colon-suffix] [fixture: info/flag-uppercase] [fixture:
info/flag-lowercase] [fixture: info/directive-header-glued] [fixture:
info/directive-header-space-control] [fixture: info/directive-flag-glued]
[fixture: info/lex-header-hash] [fixture: info/lex-header-percent] [fixture:
info/lex-header-brace] [fixture: info/lex-header-quote] [fixture:
info/lex-flag-hash] [fixture: info/lex-flag-percent] [fixture:
info/lex-flag-brace] [fixture: info/lex-flag-quote]

A keyword boundary does not consume its whitespace. NBSP, BOM and other common
whitespace may satisfy it yet reject as native gaps. Only ASCII space/tab is
hidden between units; LF is visible. Common CR and CRLF become one LF each.
LS/PS and other common whitespace remain readable only where a value, a
block-opening gap or common leading trivia owns them, including at original EOF.
[fixture: info/space-header-tab] [fixture: info/space-header-nbsp] [fixture:
info/space-header-bom] [fixture: info/space-leading-unicode] [fixture:
info/space-trailing-unicode] [fixture: info/line-cr] [fixture: info/line-crlf]
[fixture: info/line-ls-between] [fixture: info/line-ps-between] [fixture:
info/line-ls-eof] [fixture: info/line-ps-eof] [fixture: info/line-ls-in-value]
[fixture: info/line-ps-in-value] [fixture: info/accdescr-block-gap-ls] [fixture:
info/end-block-tab] [fixture: info/end-block-ls] [fixture: info/end-block-ps]

### Composite common forms

At any unit start optional ASCII indentation may precede a common form.
`title-line` reads `title` alone, or `title`, one ASCII space/tab and possibly
empty line text. `acc-title-line` reads `accTitle`, zero or more ASCII
spaces/tabs, a colon and possibly empty line text; `acc-descr-line` does so with
`accDescr`. Unicode separator/colon-gap whitespace rejects. Their own component
rules apply, not the info/showInfo boundary. [fixture: info/title-empty]
[fixture: info/title-tabs] [fixture: info/acctitle-empty] [fixture:
info/acctitle-gap] [fixture: info/accdescr-line-empty] [fixture:
info/space-title-separator-nbsp] [fixture: info/space-acctitle-colon-nbsp]
[fixture: info/accdescr-colon-gap-ls] [fixture: info/title-colon] [fixture:
info/title-digit-suffix] [fixture: info/acctitle-no-colon] [fixture:
info/lex-acctitle-brace] [fixture: info/lex-accdescr-bare] [fixture:
info/lex-title-hash] [fixture: info/lex-title-percent] [fixture:
info/lex-title-brace] [fixture: info/lex-title-double-percent]

Line text ends before the first `%%` or physical line end. LS/PS, single percent
signs, semicolons, colons, quotes, backslashes and braces are content; quotes
need not close and escapes are not string syntax. Later same-line keywords are
content too. An empty value never takes the next physical line as its content,
even across blank, directive or comment lines. [fixture: info/comment-title]
[fixture: info/comment-acctitle] [fixture: info/comment-accdescr] [fixture:
info/common-line-leading-percent] [fixture: info/title-open-quote] [fixture:
info/title-double-quotes] [fixture: info/title-single-quotes] [fixture:
info/acctitle-quoted] [fixture: info/accdescr-line-quoted] [fixture:
info/title-consumes-next-keyword] [fixture: info/acctitle-next-line] [fixture:
info/common-title-comment-gap] [fixture: info/common-acctitle-comment-gap]
[fixture: info/lex-title-blank-gap] [fixture: info/lex-acctitle-blank-gap]
[fixture: info/lex-accdescr-blank-gap] [fixture: info/lex-title-directive-gap]
[fixture: info/lex-acctitle-directive-gap] [fixture:
info/lex-accdescr-directive-gap] [fixture: info/lex-accdescr-comment-gap]
[fixture: info/end-title-semicolons] [fixture: info/end-acctitle-semicolons]
[fixture: info/end-accdescr-semicolons] [fixture: info/line-ls-in-value]
[fixture: info/line-ps-in-value] [fixture: info/lex-block-colon-first]

The block alternative reads `accDescr`, zero or more common whitespace
characters, `{` and arbitrary content through the first `}`. Its opening gap may
cross physical line breaks, blank lines and Unicode separators; common
directives/comment regions can be left out there. A surviving native comment
cannot bridge that gap. Content includes physical line breaks and LS/PS. Braces
do not nest; quotes/backslashes do not protect the closer, while an extra
opening brace is content. A closing brace is required. A colon chooses the line
form even before a brace. [fixture: info/accdescr-block-gap-lf] [fixture:
info/accdescr-block-gap-ls] [fixture: info/accdescr-block-gap-bom] [fixture:
info/common-block-blank-gap] [fixture: info/common-accdescr-directive-gap]
[fixture: info/lex-block-common-comment-gap] [fixture:
info/common-block-native-comment-gap] [fixture: info/accdescr-block-lines]
[fixture: info/line-ls-block] [fixture: info/accdescr-block-empty] [fixture:
info/accdescr-block-nested] [fixture: info/common-block-closer-quoted] [fixture:
info/accdescr-block-escaped-brace] [fixture: info/lex-block-open-brace]
[fixture: info/accdescr-block-open] [fixture: info/lex-block-colon-first]

### Hidden YAML

At a unit start, `---`, zero or more ASCII spaces/tabs and LF open hidden YAML,
even off a physical line start. Try the body-present form first: read as few
arbitrary characters as possible through a subsequent LF followed by unindented
`---` whose next character is LF, common whitespace or EOF. Only if that form
cannot match, try an empty body with the closer immediately after the opening
LF. The body includes LF/LS/PS; no YAML validation occurs. [fixture:
info/hidden-yaml-body] [fixture: info/hidden-yaml-open-padding] [fixture:
info/hidden-yaml-empty] [fixture: info/hidden-yaml-invalid] [fixture:
info/lex-yaml-body-separators] [fixture: info/lex-yaml-close-space] [fixture:
info/lex-yaml-close-tab-eof] [fixture: info/lex-yaml-three-fences] [fixture:
info/lex-yaml-empty-then-content] [fixture: info/lex-yaml-empty-spare-line]

Three adjacent fences therefore make one form; what looks like two empty blocks
can leave an unmatched fourth fence. A nonqualifying closer stays body text when
a later one qualifies. Two nonempty blocks remain separate when the first body
has a qualifying closer. Indented closers, Unicode opener padding, four opening
dashes and missing closers reject. [fixture: info/lex-yaml-three-fences]
[fixture: info/lex-yaml-two-empty] [fixture:
info/lex-yaml-empty-before-later-block] [fixture:
info/hidden-yaml-nonqualifying-closer] [fixture: info/lex-yaml-two-before-flag]
[fixture: info/hidden-yaml-indent] [fixture: info/hidden-yaml-open-nbsp]
[fixture: info/hidden-yaml-four-dashes] [fixture: info/hidden-yaml-unclosed]
[fixture: info/lex-yaml-close-indent-inline]

An earlier composite value already owns hidden-looking text inside it. Line
values absorb appended YAML dashes; a description block owns YAML-looking lines.
Hidden forms are whole InfoIgnoredText nodes at unit positions, not a global
removal pass or a way to join a fixed keyword. [fixture:
info/hidden-yaml-after-title] [fixture: info/hidden-yaml-after-acctitle]
[fixture: info/hidden-yaml-after-accdescr] [fixture:
info/hidden-yaml-inside-block] [fixture: info/hidden-yaml-after-header]
[fixture: info/hidden-yaml-flag-glued]

### Hidden DIRECTIVE and line endings

After optional ASCII padding, hidden DIRECTIVE reads `%%{` and arbitrary content
through the earliest `}%%` followed by LF, common whitespace or EOF.
Empty/nonword bodies, physical line breaks and LS/PS are allowed. A
nonqualifying closer can be passed for a later one. Without a qualifying closer
try the native comment rule, which can swallow a glued same-line flag as comment
text. [fixture: info/hidden-directive-padding] [fixture:
info/hidden-directive-nonqualifying-closer] [fixture:
info/hidden-directive-first-close] [fixture: info/hidden-directive-unclosed]
[fixture: info/hidden-directive-close-glued] [fixture:
info/lex-hidden-body-separators] [fixture: info/hidden-directive-header-eof]

Both hidden forms consume an immediately following LF; another qualifying
whitespace character is lookahead only. It must still be readable at its
position. Consuming the only LF after a common form prevents the following
statement; a spare LF or ASCII space/tab immediately after the closer preserves
EOL. At original EOF they can consume the appended LF, leaving EOF to satisfy
EOL. The consumed LF is outside the ignored-text range. [fixture:
info/hidden-directive-after-title] [fixture:
info/hidden-directive-title-spare-lf] [fixture:
info/hidden-directive-title-space] [fixture: info/hidden-directive-title-eof]
[fixture: info/hidden-directive-after-acctitle] [fixture:
info/hidden-directive-acctitle-spare-lf] [fixture:
info/hidden-directive-acctitle-space] [fixture:
info/hidden-directive-acctitle-eof] [fixture:
info/hidden-directive-after-accdescr] [fixture:
info/hidden-directive-accdescr-spare-lf] [fixture:
info/hidden-directive-accdescr-space] [fixture:
info/hidden-directive-accdescr-eof] [fixture: info/hidden-directive-after-block]
[fixture: info/hidden-directive-block-spare-lf] [fixture:
info/hidden-directive-block-space] [fixture: info/hidden-directive-block-eof]
[fixture: info/hidden-yaml-after-block] [fixture:
info/hidden-yaml-block-spare-lf] [fixture: info/hidden-yaml-block-space]
[fixture: info/hidden-yaml-block-eof] [fixture: info/hidden-directive-close-tab]
[fixture: info/hidden-directive-close-ls] [fixture: info/hidden-yaml-close-ls]
[fixture: info/lex-hidden-close-ps] [fixture: info/lex-yaml-close-nbsp]
[fixture: info/hidden-directive-cr] [fixture: info/hidden-directive-crlf]
[fixture: info/hidden-yaml-cr] [fixture: info/hidden-yaml-crlf]

### Comments and common trivia

The native comment rule reads optional ASCII indentation, `%%` and maximal text
before physical EOL. Its mark is `%%`, its value follows the mark, and the
preceding character and terminating LF stay outside it. A single percent is not
a comment; bare and triple-percent forms are allowed. LS/PS do not end it. A
common directive can separate the two percent characters, and a common comment
region can cut its content. [fixture: info/comment-header] [fixture:
info/comment-flag] [fixture: info/comment-title] [fixture:
info/comment-acctitle] [fixture: info/comment-accdescr] [fixture:
info/comment-after-block] [fixture: info/comment-eof] [fixture:
info/comment-bare-body] [fixture: info/comment-triple] [fixture:
info/lex-comment-single-percent] [fixture: info/lex-comment-split-mark]
[fixture: info/lex-comment-ls-bridge] [fixture: info/lex-native-comment-ps]

Comments are shared Comment records, not InfoIgnoredText. Inside an earlier
description block a bare percent line remains content; common comment lines are
still removed. A directive-looking body closes that block at its first `}`,
leaving the remaining `%%` to the comment rule. Subsequent leftover block text
can then reject. [fixture: info/comment-bare-block] [fixture:
info/comment-block] [fixture: info/hidden-directive-block-first-brace] [fixture:
info/hidden-directive-inside-block] [fixture: info/lex-block-comment-only]

Common directives, comment regions and selected semicolons can lie in
common-value and ignored-form text, including hidden fences. Their written
values leave that trivia out while retaining the other source spelling. This
permits a global directive to create a hidden opener/closer, or the shared
style/classDef rule to select a semicolon inside hidden text. Complete
keyword/colon or keyword/brace boundaries also admit common trivia.
Fixed-keyword interiors follow the atomic divergences below. [fixture:
info/directive-title-value] [fixture: info/directive-acctitle-value] [fixture:
info/directive-accdescr-value] [fixture: info/directive-block-value] [fixture:
info/directive-acctitle-colon] [fixture: info/directive-block-brace] [fixture:
info/lex-line-comment-region-ls] [fixture: info/lex-yaml-opener-global]
[fixture: info/lex-yaml-closer-global] [fixture: info/lex-hidden-opener-global]
[fixture: info/lex-hidden-closer-global] [fixture:
info/lex-hidden-nested-global] [fixture: info/lex-yaml-common-comment] [fixture:
info/lex-hidden-common-comment] [fixture: info/lex-yaml-fences-selected]
[fixture: info/lex-hidden-opener-selected] [fixture:
info/lex-hidden-closer-selected] [fixture: info/lex-selected-colon-boundary]
[fixture: info/lex-selected-brace-boundary]

The shared line rule selects only qualifying semicolons, with its style/classDef
trigger, case and line-segment boundaries. A selected suffix after a complete
block can therefore be accepted, while a remaining semicolon rejects. The rule
does not make semicolons statement separators. HTML and entity conversion keep
their shared scope; authored values stay as written. [fixture:
info/style-block-end-semicolon] [fixture: info/style-block-end-double] [fixture:
info/style-block-end-upper] [fixture: info/style-block-end-nohash] [fixture:
info/style-block-end-colon-space] [fixture: info/style-block-end-ls] [fixture:
info/style-block-end-ps] [fixture: info/style-block-end-directive] [fixture:
info/style-both] [fixture: info/html-all-common] [fixture:
info/entity-standalone] [fixture: info/lex-yaml-opener-selected]

## Grammar

```text
diagram = newline* "info" newline* ("showInfo" newline*)?
          common-statements? end-of-text
common-statements = (common-statement eol)+
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

The notation is [common notation](../common.md#notation). Hidden forms have the
owners defined in [ast/info.md](../ast/info.md), without adding visible
separators. The body may be empty. The first common form may share the header or
flag line. Visible newlines may precede the optional flag, including before
comment/directive lines or hidden forms. The flag may occur only once and before
any common form; an empty block ends that opportunity too. [fixture:
info/header-lf] [fixture: info/header-inline-flag] [fixture:
info/header-flag-next-line] [fixture: info/header-blank-lines] [fixture:
info/header-common-inline] [fixture: info/header-flag-common-inline] [fixture:
info/comment-between-header-flag] [fixture: info/lex-flag-hidden-two] [fixture:
info/lex-flag-global-directive-gap] [fixture: info/header-repeated-flag]
[fixture: info/header-common-then-flag] [fixture:
info/lex-flag-after-empty-block] [fixture: info/hidden-directive-glued-header]
[fixture: info/hidden-directive-flag-next-common] [fixture:
info/hidden-yaml-after-flag]

Each common form requires visible EOL or EOF, including an empty block. Blank
lines can separate common forms and trail the last one. A visible EOL before a
hidden form still separates statements. A second header, unsupported unit, late
flag or adjacent completed block/common form rejects; a line value may instead
absorb apparent later keywords. [fixture: info/common-blank-lines] [fixture:
info/end-block-eof] [fixture: info/end-common-eof] [fixture:
info/hidden-directive-between-common] [fixture: info/hidden-yaml-between-common]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/header-repeated]
[fixture: info/spec-info-1b111b64] [fixture: info/header-common-then-flag]
[fixture: info/common-same-line] [fixture: info/lex-block-empty-inline]
[fixture: info/title-consumes-next-keyword] [fixture: info/lex-hidden-tail-two]

| Rule                 | Node                       |
| -------------------- | -------------------------- |
| diagram              | InfoDiagram                |
| title-line           | InfoTitleStatement         |
| acc-title-line       | InfoAccTitleStatement      |
| acc-descr-line       | InfoAccDescrStatement      |
| acc-descr-block      | InfoAccDescrBlockStatement |
| Written common value | InfoLiteral                |
| Retained hidden form | InfoIgnoredText            |

All common statements remain separate source occurrences, including repeats and
empty values. Their source tree is not the final common fragment of Mermaid.
Derived values and publication are defined by the
[info summary](../../../tests/docs/db-summaries.md#info), not substituted for
authored nodes. [fixture: info/common-all] [fixture: info/common-flag-all]
[fixture: info/title-repeat-empty] [fixture: info/acctitle-repeat-empty]
[fixture: info/accdescr-line-repeat] [fixture: info/accdescr-block-repeat]

### Rejections outside the grammar

Any lexical error, parser error or unconsumed visible unit rejects the entire
input, even if a recovered tree or valid prefix exists. The
[public parse wrapper](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L134-L150)
checks both error lists. The
[info adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/info/infoParser.ts#L6-L11)
adds no semantic rejection. Shared detection and embedded-data rules still
apply. [fixture: info/error-after-prefix] [fixture: info/error-after-common]
[fixture: info/spec-info-1b111b64] [fixture: info/terminal-number] [fixture:
info/div-frontmatter-invalid-yaml]

## Known divergences

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
Common Directive records hold global directives and InfoIgnoredText holds
complete hidden forms. Neither supplies a separate component strictly inside a
fixed keyword. The direct atomic rule rejects a directive inside info, showInfo,
title, accTitle or accDescr although Mermaid joins its parts; this is reason 2.
It adds no reverse acceptance. Complete component boundaries and value/hidden
text are allowed; independently invalid joined inputs remain rejected by both.
[fixture: info/div-directive-header-middle] [fixture:
info/div-directive-flag-middle] [fixture: info/div-directive-title-middle]
[fixture: info/div-directive-acctitle-middle] [fixture:
info/div-directive-accdescr-middle] [fixture:
info/div-directive-accdescr-line-keyword] [fixture:
info/directive-acctitle-colon] [fixture: info/directive-block-brace] [fixture:
info/lex-yaml-opener-global] [fixture: info/lex-directive-rejected-tail]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
The one-character selected-semicolon range can be common trivia, but no
statement or ignored-text sibling can stand inside a fixed keyword. Reason 2
rejects selected semicolons inside showInfo, title, accTitle and both accDescr
forms although Mermaid joins them. There is no reverse acceptance. Complete
component boundaries and hidden/value text agree; an unselected semicolon, a
split header rejected before selection, or another invalid tail remains
unmarked. [fixture: info/div-selected-showinfo] [fixture:
info/div-selected-title] [fixture: info/div-selected-acctitle] [fixture:
info/div-selected-accdescr-line] [fixture: info/div-selected-accdescr-block]
[fixture: info/lex-selected-colon-boundary] [fixture:
info/lex-selected-brace-boundary] [fixture: info/lex-hidden-opener-selected]
[fixture: info/lex-selected-header] [fixture:
info/lex-selected-keyword-rejected-tail] [fixture: info/end-header-semicolon]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).**
Frontmatter already holds its written body. Malformed content, including YAML
made invalid by attribute-quote conversion, does not decide that source
structure and is accepted here although Mermaid rejects it. There is no Db from
the rejection of the written input, but the accepted reference defined by the
comparison rule supplies the comparison Db and embedded values recorded in
`specified.json`, under
[The comparison Db](../known-divergences/embedded-data-opaque.md#the-comparison-db).
For these two frontmatters, that Db is `{}`. This rule rejects no
Mermaid-accepted input. Invalid hidden YAML and the recorded malformed init
argument already accept in both and are unmarked. [fixture:
info/div-frontmatter-invalid-yaml] [fixture:
info/div-frontmatter-html-invalid-yaml] [fixture:
info/hidden-yaml-preheader-invalid] [fixture: info/directive-invalid-init]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).**
InfoLiteral, InfoIgnoredText and shared Comments hold the C4 words as written.
The existing reverse pipeline-order rule selects the header grammar: four
unanchored C4 words later in detection text can reject in Mermaid but accept
here as info. This rejects no Mermaid-accepted input. C4Context, removed
frontmatter/directives and LF-terminated comment controls agree; an otherwise
invalid info body still rejects. [fixture: info/div-c4container-title] [fixture:
info/div-c4component-acctitle] [fixture: info/div-c4dynamic-line] [fixture:
info/div-c4deployment-block] [fixture: info/div-c4container-header-comment-eof]
[fixture: info/div-c4component-flag-comment-eof] [fixture:
info/c4container-header-comment-lf] [fixture: info/c4component-flag-comment-lf]
[fixture: info/div-c4-hidden-yaml] [fixture: info/div-c4-hidden-directive]
[fixture: info/div-c4-retained-yaml] [fixture: info/div-c4-retained-directive]
[fixture: info/lex-c4context-common] [fixture: info/lex-c4-removed-directive]
[fixture: info/lex-c4-frontmatter] [fixture: info/lex-c4-invalid-info]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
Shared Comments hold the passed bare lines, and the accompanying common
whitespace is trivia. The existing reverse pipeline-order rule accepts
whitespace that Mermaid rejects on native re-reading, including after or between
retained forms. It rejects no Mermaid-accepted input. ASCII controls agree,
while Unicode gaps without a passed bare line remain native rejections.
[fixture: info/div-bare-before-header-bom] [fixture: info/div-bare-line-ls]
[fixture: info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive] [fixture: info/bare-before-header-space]
[fixture: info/bare-line-tab] [fixture:
info/lex-detect-yaml-bare-directive-ascii] [fixture:
info/lex-retained-no-bare-ls]

Hidden forms have nodes and empty common forms have statements, so neither needs
tokenless-empty-forms. Native comments take neither a preceding character nor
LF. The body-only HTML rule still applies, but cross-frontmatter quote
conversion changes neither this grammar nor its comparable empty summary; the
controls therefore have no html-tag-in-frontmatter mark. YAML rejected after
quote conversion is the opaque-data case above. [fixture:
info/hidden-yaml-empty] [fixture: info/accdescr-block-empty] [fixture:
info/lex-block-empty-inline] [fixture: info/comment-title] [fixture:
info/comment-after-block] [fixture: info/frontmatter-html] [fixture:
info/lex-html-cross-title] [fixture: info/lex-html-cross-acctitle] [fixture:
info/lex-html-blocking] [fixture: info/div-frontmatter-html-invalid-yaml]
