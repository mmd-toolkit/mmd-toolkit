# Treeview

Japanese version: [treeview.ja.md](./treeview.ja.md)

This document defines the syntax of `treeView-beta`, selected as `treeView`. The
[source tree](../ast/treeview.md) preserves authored syntax; derived values are
defined by the [tests summary](../../../tests/docs/db-summaries.md#treeview).
The rules follow [treeView.langium][grammar] and the [box-drawing reading][box].
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]

## Detection

Entry 28 of [detection.md](../detection.md), the [treeview detector][detector],
selects the exact case-sensitive prefix `treeView-beta`, with no following
boundary. The grammar header has the same spelling; `treeview-beta`,
`TREEVIEW-BETA` and `treeView` do not select this diagram. Detection alone does
not establish acceptance. [fixture: treeview/header-only] [fixture:
treeview/header-letter] [fixture: treeview/header-lower] [fixture:
treeview/header-upper] [fixture: treeview/header-no-beta]

Apply the [common reading](../common.md#reading-a-source): real leading
frontmatter, directives, comment regions, leading trivia, line terminators, HTML
attribute quotes, entities and selected semicolons. A frontmatter record belongs
to Root; it is not a treeview statement. The earlier C4 detector and its
divergence apply. [fixture: treeview/frontmatter-title] [fixture:
treeview/line-cr] [fixture: treeview/line-crlf] [fixture: treeview/html-bare]
[fixture: treeview/entity-bare] [fixture: treeview/semicolon-selected] [fixture:
treeview/c4-component-header-eof]

At the detection point, pass at most one retained frontmatter-shaped block
before bare percent-pair lines and the second directive scan. It remains diagram
text. There is no native YAML rule, so a retained block rejects even when
detection passes it; a second block, a block after a bare line, and one after a
second-scan directive do not restart that skip. Real frontmatter may precede a
retained block. [fixture: treeview/detect-block-after-directive] [fixture:
treeview/detect-retained-two-blocks] [fixture:
treeview/detect-bare-before-retained] [fixture:
treeview/detect-retained-secondscan-before] [fixture:
treeview/detect-retained-secondscan-after] [fixture:
treeview/detect-block-after-frontmatter]

Adjacent fences without a body line, a missing closer, mismatched indentation,
four dashes, closing-fence suffix text and a closer without a following line
break stop the block skip. Leading trimming can remove the opener indentation
and leave mismatched fences. A padded closer followed by LF may pass detection
while native reading still rejects. [fixture: treeview/detect-retained-adjacent]
[fixture: treeview/detect-retained-missing-close] [fixture:
treeview/detect-retained-mismatch] [fixture:
treeview/detect-retained-trimmed-indent] [fixture:
treeview/detect-retained-four] [fixture: treeview/detect-retained-suffix]
[fixture: treeview/detect-retained-close-no-lf] [fixture:
treeview/detect-retained-close-padding]

A retained one-line second-scan form is a native Comment, not a hidden Directive
node. A multiline form with a noncomment closing line rejects. A bare line can
precede the retained comment. Source directives within the retained form remain
shared Directives. [fixture: treeview/detect-secondscan-singleline] [fixture:
treeview/detect-secondscan-multiline] [fixture:
treeview/detect-bare-before-secondscan]

Detection-passed bare `%%` lines are shared Comments. Their accompanying
whitespace and line breaks are trivia and are not read again, also around
retained forms. This can accept ASCII and Unicode padding Mermaid rejects.
Without a passed bare line, the later padding remains native text: ASCII space
is visible indentation, while NBSP or U+2028 can start a bare name, all
forbidden before the header. True leading Unicode whitespace is instead leading
trivia. [fixture: treeview/bare-line-space] [fixture: treeview/bare-line-ls]
[fixture: treeview/bare-line-ps] [fixture:
treeview/detect-secondscan-bare-ascii] [fixture:
treeview/detect-secondscan-bare-unicode] [fixture:
treeview/detect-retained-comment-ascii-header] [fixture:
treeview/detect-retained-comment-unicode-header] [fixture:
treeview/detect-retained-gap-ls-control] [fixture:
treeview/detect-no-bare-unicode-before-header]

## Lexical structure

### Ordered units

Read the source under the common rules and the box-drawing rules below. At each
unit start take the first applicable row, then try the list again after it.
There is no general longest-match choice. Only the header has an explicit longer
alternative: when bare-name matches more characters at the same position, take
bare-name instead. Unreadable characters reject. [fixture: treeview/header-only]
[fixture: treeview/header-nbsp-custom-boundary] [fixture:
treeview/header-annotation-shorter-bare] [fixture: treeview/error-after-prefix]

| Order | Unit or trivia                   | Reading                                                 |
| ----- | -------------------------------- | ------------------------------------------------------- |
| 1     | header                           | `treeView-beta`, boundary and longer alternative below. |
| 2     | acc-descr-line / acc-descr-block | Padded common description; colon form first.            |
| 3     | acc-title-line                   | Padded common title with a colon.                       |
| 4     | title-line                       | Padded title or bare title keyword.                     |
| 5     | class-annotation                 | Leading ASCII space/tab, `:::`, class name.             |
| 6     | icon-annotation                  | Leading ASCII space/tab, `icon(`, reference, `)`.       |
| 7     | description-annotation           | Leading ASCII space/tab, `##`, line text.               |
| 8     | indentation                      | One maximal nonempty ASCII space/tab run.               |
| 9     | quoted-name                      | A closed single- or double-quoted name.                 |
| 10    | Hidden ASCII whitespace          | Shadowed by indentation.                                |
| 11    | Native Comment                   | `%%` through before LF.                                 |
| 12    | Hidden newline                   | LF, including the logical LF at EOF.                    |
| 13    | bare-name                        | The name form below.                                    |

The [grammar][grammar] imports no common grammar. It has no native YAML, hidden
directive or visible EOL unit. Hidden ASCII whitespace never overrides
indentation. Body fences are bare names, not hidden YAML; ordinary source
directives have already been left out by the common rules. [fixture:
treeview/gram-body-yaml] [fixture: treeview/gram-body-directive] [fixture:
treeview/gram-quoted-tail-space-next-indent]

### Header boundary

The [header matcher][keyword] requires common Notation whitespace, `%%` or end
of text immediately after the exact keyword. Whitespace here is the full set in
common Notation, not just ASCII space/tab. A word character, digit, dash, colon
or non-ASCII letter does not satisfy that boundary. [fixture:
treeview/header-letter] [fixture: treeview/header-digit] [fixture:
treeview/header-word] [fixture: treeview/header-dash] [fixture:
treeview/header-colon] [fixture: treeview/header-unicode] [fixture:
treeview/header-percent] [fixture: treeview/header-formfeed-custom-boundary]

A boundary does not guarantee the header wins: a trailing ASCII space/tab, NBSP,
form feed, inline comment or same-line name can extend bare-name past the
header. LF does not extend bare-name. A directive touching the keyword is
allowed when its removal leaves LF, but cannot supply missing whitespace or
prevent the longer bare reading. [fixture: treeview/db-header-tail-space]
[fixture: treeview/db-header-tail-tab] [fixture:
treeview/header-nbsp-custom-boundary] [fixture:
treeview/header-formfeed-custom-boundary] [fixture: treeview/header-percent]
[fixture: treeview/box-header-same-line] [fixture:
treeview/header-directive-newline-boundary] [fixture:
treeview/directive-header-glued] [fixture:
treeview/directive-header-space-glued]

### Indentation and lines

Ordinary indentation counts each ASCII space or tab once. It is one maximal run,
not a tab stop or a required multiple. Newlines are hidden, so a run after a
quoted name, class or icon can become the next node's indentation, even from a
preceding or whitespace-only line. Two runs separated by a hidden newline do not
merge; when both precede the next name, the grammar rejects. For this rejection
condition, the indentation denoted by a
[branch prefix](#columns-and-prefix-indentation) counts as another run.
[fixture: treeview/db-tabs-one-unit] [fixture: treeview/db-quoted-tail-space]
[fixture: treeview/db-class-tail-space] [fixture: treeview/db-icon-tail-space]
[fixture: treeview/space-line-tab] [fixture: treeview/box-blank-space-indent]
[fixture: treeview/gram-quoted-tail-space-next-indent] [fixture:
treeview/gram-class-tail-space-next-indent] [fixture:
treeview/gram-icon-tail-space-next-indent] [fixture:
treeview/box-tail-quoted-prefix-collision] [fixture:
treeview/box-tail-class-prefix-collision] [fixture:
treeview/box-tail-icon-prefix-collision] [fixture:
treeview/box-tail-collision-directive-inline] [fixture:
treeview/box-tail-collision-directive-line] [fixture:
treeview/box-tail-collision-selected-semicolon] [fixture:
treeview/box-tail-collision-unselected-semicolon] [fixture:
treeview/box-tail-collision-comment-line] [fixture:
treeview/box-tail-collision-empty-line] [fixture:
treeview/box-tail-collision-ls] [fixture: treeview/box-tail-collision-ps]
[fixture: treeview/box-tail-collision-empty-block]

Trailing whitespace excluded by the
[branch-line rule](#columns-and-prefix-indentation) cannot become the next
node's indentation. [fixture: treeview/box-tail-branch-no-carry] [fixture:
treeview/box-tail-trim-directive-inline] [fixture:
treeview/box-tail-trim-directive-line] [fixture:
treeview/box-tail-trim-selected-semicolon] [fixture:
treeview/box-tail-trim-unselected-semicolon] [fixture:
treeview/box-tail-trim-comment-line] [fixture:
treeview/box-tail-trim-empty-line] [fixture: treeview/box-tail-trim-ls]
[fixture: treeview/box-tail-trim-ps] [fixture:
treeview/box-tail-trim-empty-block]

An intervening [box decoration](#line-classification-and-errors) does not
consume or clear a pending run from an ordinary line. [fixture:
treeview/box-tail-decoration-carry] [fixture:
treeview/box-tail-decoration-directive-inline] [fixture:
treeview/box-tail-decoration-directive-line] [fixture:
treeview/box-tail-decoration-selected-semicolon] [fixture:
treeview/box-tail-decoration-unselected-semicolon] [fixture:
treeview/box-tail-decoration-comment-line] [fixture:
treeview/box-tail-decoration-empty-line] [fixture:
treeview/box-tail-decoration-ls] [fixture: treeview/box-tail-decoration-ps]
[fixture: treeview/box-tail-decoration-empty-block]

Bare names and description-annotation text instead enclose their trailing ASCII
spaces/tabs. A directive-only line can leave visible indentation behind; a
common comment region follows the shared removal rule. Unicode whitespace is not
ordinary indentation and can be bare-name text. U+2028/U+2029 do not end a line.
[fixture: treeview/db-bare-tail-space] [fixture:
treeview/db-description-tail-space] [fixture:
treeview/nested-child-directive-line] [fixture:
treeview/nested-child-directive-unindented] [fixture:
treeview/nested-child-comment-line] [fixture: treeview/nested-child-empty-line]
[fixture: treeview/nested-child-ls] [fixture: treeview/nested-child-ps]
[fixture: treeview/space-indent-nbsp]

### Names

A quoted-name starts with a single or double quote and closes at the next
matching quote under the common and box-drawing rules. Its interior can be
empty, cross line feeds, and contain U+2028/U+2029. Backslashes neither protect
quotes nor decode escapes. Quotes inside an already-started bare name are
ordinary characters. [fixture: treeview/db-empty-names] [fixture:
treeview/db-quote-conversion] [fixture: treeview/text-double-crlf] [fixture:
treeview/text-single-ls] [fixture: treeview/text-double-ps] [fixture:
treeview/lex-bare-quote-interior]

A bare-name begins with any character except ASCII space/tab, CR/LF, single
quote or double quote, provided `:::`, `icon(` and `##` do not begin there. Read
through before CR/LF, but stop before ASCII space/tab followed by one of: `:::`
and optional ASCII space/tab and an ASCII letter or underscore; `icon(`; or
`##`. The name may otherwise contain whitespace, quotes, percent text,
punctuation and Unicode characters. [fixture: treeview/db-bare-internal-space]
[fixture: treeview/comment-in-bare] [fixture: treeview/gram-class-no-space]
[fixture: treeview/gram-icon-no-space] [fixture:
treeview/gram-description-no-space] [fixture: treeview/gram-invalid-class]
[fixture: treeview/bare-invalid-class-zero]

These stopping tests do not require a complete annotation. An invalid class
suffix can stay inside a previously-started bare name, but cannot begin a new
bare name after a quote. A failed icon reference can reject after bare-name has
already stopped at `icon(`. A class suffix ending before punctuation can leave
another bare node. [fixture: treeview/gram-invalid-class] [fixture:
treeview/quoted-invalid-class-fallback] [fixture: treeview/icon-pack-empty-tail]
[fixture: treeview/gram-invalid-icon] [fixture:
treeview/annotation-class-punctuation] [fixture: treeview/class-unicode-suffix]

### Annotations

Each annotation begins with one or more ASCII spaces/tabs. A class-annotation
then reads `:::`, zero or more ASCII spaces/tabs, an ASCII letter or underscore,
and zero or more ASCII word characters or dashes. The name can be one character.
[fixture: treeview/annotation-class-space] [fixture:
treeview/annotation-class-digit] [fixture: treeview/annotation-class-hyphen]
[fixture: treeview/annotation-class-uppercase] [fixture:
treeview/gram-class-quote-follow]

An icon-annotation reads exact lowercase `icon`, `(`, a reference and `)`,
without internal whitespace. The reference is zero or more ASCII word characters
or dashes, optionally followed by one colon and one or more of those characters.
Empty references and `:file` are allowed; a trailing colon, second colon, quoted
reference or internal space is not. A following suffix may begin another node.
[fixture: treeview/db-icon-none] [fixture:
treeview/annotation-icon-leading-colon] [fixture:
treeview/annotation-icon-hyphen] [fixture: treeview/annotation-icon-underscore]
[fixture: treeview/annotation-icon-uppercase] [fixture:
treeview/icon-pack-empty-tail] [fixture: treeview/gram-invalid-icon] [fixture:
treeview/annotation-icon-quote] [fixture: treeview/annotation-icon-suffix]

A description-annotation reads `##` and all following characters before CR/LF,
possibly none. It includes U+2028/U+2029, percent text and later
annotation-looking text on that line. Repeated annotations and any ordering are
allowed; a description on a later line is another annotation. A hidden newline
or a removed comment line does not detach an annotation from the preceding node.
[fixture: treeview/spec-parser-ab2c8458] [fixture:
treeview/db-description-empty] [fixture: treeview/text-description-ls] [fixture:
treeview/text-description-ps] [fixture:
treeview/db-description-absorbs-annotations] [fixture: treeview/db-repeat-class]
[fixture: treeview/db-repeat-icon] [fixture:
treeview/annotation-description-repeat-lines] [fixture:
treeview/annotation-description-repeat-empty] [fixture:
treeview/db-annotations-next-line] [fixture: treeview/annotation-comment-gap]

### Common forms

The four common statement forms can read preceding ASCII spaces/tabs. A
title-line reads `title` followed by exactly one ASCII space/tab and possibly
empty line text, or the bare keyword. There is no word boundary: `titlex` can be
an empty title and a name, and `title"node"` an empty title and a quoted name.
[fixture: treeview/common-whitespace] [fixture: treeview/common-title-eof]
[fixture: treeview/common-title-prefix] [fixture:
treeview/common-title-quoted-next]

An acc-title-line or acc-descr-line reads its exact keyword, optional ASCII
space/tab, a colon and possibly empty line text. Try the colon description
before the block form. All three line values stop at the first `%%` or CR/LF;
they include U+2028/U+2029. Quotes in common values are text and need not close.
[fixture: treeview/common-acctitle-eof] [fixture: treeview/common-accline-eof]
[fixture: treeview/common-colon-block-priority] [fixture:
treeview/common-title-percent-boundary] [fixture: treeview/text-title-ls]
[fixture: treeview/text-acctitle-ps] [fixture: treeview/text-accline-ls]
[fixture: treeview/common-open-quoted-eof]

An acc-descr-block reads `accDescr`, zero or more common Notation whitespace
characters, `{`, any characters through before the first `}`, then that required
closer. Whitespace before the opener can cross line feeds; quotes and
backslashes do not protect a closer. Empty and whitespace-only blocks are
statements. A failed unclosed block can fall back to bare-name rather than
becoming an unclosed block node. [fixture: treeview/common-whitespace] [fixture:
treeview/common-repeat-empty] [fixture: treeview/common-block-whitespace-raw]
[fixture: treeview/common-block-first-close] [fixture:
treeview/common-block-quoted-close] [fixture:
treeview/common-block-escaped-close] [fixture: treeview/common-block-open]
[fixture: treeview/box-decoration-before-block-open]

### Comments and boundaries

At a native unit start, `%%` reads a shared Comment through before the next LF.
Its mark is `%%`; value excludes the mark, and range includes the mark but
excludes LF. U+2028/U+2029 and any apparent `}%%` closers stay inside the
comment. Hidden newline reads LF separately, including the logical LF at EOF.
[fixture: treeview/tail-quoted-comment] [fixture:
treeview/native-comment-closer-greedy] [fixture: treeview/native-comment-ls]
[fixture: treeview/native-comment-ps] [fixture: treeview/comment-bare-body]
[fixture: treeview/gram-body-hidden-eof]

An earlier enclosing name, quoted value, description-annotation or accessibility
block owns its percent-looking text. Common line values instead stop before
`%%`. Common source directives and comment regions keep their shared ownership,
including where their removal joins a native percent mark; they are not native
hidden-directive nodes. [fixture: treeview/comment-in-bare] [fixture:
treeview/comment-in-quotes] [fixture: treeview/tail-description-comment]
[fixture: treeview/common-block-bare-percent] [fixture:
treeview/common-title-percent-boundary] [fixture:
treeview/detect-secondscan-singleline] [fixture:
treeview/comment-native-mark-directive]

For directives and selected semicolons, the header, common keywords, the word
`icon`, class names and complete icon references are atoms. `:::` and `##` are
atomic markers. Bare names, string interiors, common values and description text
are text/string positions. Whitespace is transparent. Allow common trivia
between complete authored components, such as keyword and colon, `icon` and `(`,
marker and name, or reference and `)`, without supplying missing whitespace.
[fixture: treeview/directive-header-inside] [fixture:
treeview/directive-acctitle-inside] [fixture:
treeview/directive-icon-word-inside] [fixture:
treeview/directive-class-value-inside] [fixture:
treeview/directive-icon-value-inside] [fixture: treeview/directive-class-inside]
[fixture: treeview/directive-description-inside] [fixture:
treeview/directive-bare-middle] [fixture: treeview/directive-double-middle]
[fixture: treeview/directive-acctitle-parts] [fixture:
treeview/directive-icon-parts-parts] [fixture:
treeview/directive-class-value-parts] [fixture:
treeview/icon-name-close-directive] [fixture:
treeview/semicolon-icon-value-inside] [fixture:
treeview/semicolon-class-value-inside] [fixture:
treeview/icon-word-open-semicolon] [fixture: treeview/icon-name-close-semicolon]

### Box-drawing reading

#### Scope and mode

Apply these direct rules on source diagram text, with common removals and
character readings already deciding its logical lines. Do not build rewritten
text. Find the first line whose whole text, ignoring its outer common
whitespace, is `treeView-beta`; box rules apply only after it. With no such line
there is no box reading. The line boundary is LF after common line-terminator
reading, not U+2028/U+2029, and a line break inside a common directive is not a
boundary. [fixture: treeview/box-written-tree] [fixture:
treeview/box-header-same-line] [fixture: treeview/box-physical-directive-inline]
[fixture: treeview/box-physical-directive-line] [fixture:
treeview/box-physical-ls] [fixture: treeview/box-physical-ps]

For mode detection, exclude whitespace-only lines, lines starting after common
whitespace with `%%`, metadata-shaped lines, and lines made only of common
whitespace and vertical `│` or `┃`. A metadata-shaped line starts after common
whitespace with `title` and ASCII space/tab, `accTitle` and optional ASCII
space/tab and `:`, or `accDescr` and optional ASCII space/tab and `:` or `{`.
Bare `title` alone does not qualify. [fixture: treeview/box-comment-only]
[fixture: treeview/box-metadata-only] [fixture: treeview/box-decoration-only]
[fixture: treeview/box-title-bare-not-metadata] [fixture:
treeview/box-title-inside-string]

Box mode is active exactly when some remaining line contains `─`, `━`, `│`, `┃`,
`└`, `┗`, `├` or `┣`. This test and every physical-line rule below ignore quote
and block boundaries. A numeric entity is read as its common placeholder, not
decoded into a branch. A box character removed with a common directive cannot
select the mode. [fixture: treeview/box-quoted-dash] [fixture:
treeview/box-mode-dash-only] [fixture: treeview/box-mode-vertical-with-text]
[fixture: treeview/box-entity-not-branch] [fixture:
treeview/box-entity-mixed-indent] [fixture: treeview/box-global-directive-line]
[fixture: treeview/box-global-directive-inline] [fixture:
treeview/box-metadata-inside-string-active]

#### Columns and prefix indentation

A branch is one of `└`, `┗`, `├`, `┣`. On each mode-detection candidate line,
find its first branch. Measure its zero-based column in the converted diagram
text, counting UTF-16 code units and treating each tab as four ASCII spaces, not
a tab stop. Common removed forms contribute nothing; entities contribute their
placeholder spelling. [fixture: treeview/box-heavy] [fixture:
treeview/box-prefix-directive-column] [fixture:
treeview/box-column-nonbmp-discriminating] [fixture:
treeview/box-entity-not-branch] [fixture: treeview/box-tab-quoted]

The segment width is the first positive branch column in written line order, or
four if no candidate has one. Ignore column zero when choosing the width; do not
choose the smallest column or infer uniform steps. A later line or a
quoted-looking prefix can decide the width used by earlier lines. [fixture:
treeview/box-infer-first-column] [fixture: treeview/box-first-width-from-name]
[fixture: treeview/box-first-branch-leading-text] [fixture:
treeview/box-branch-no-dash]

For a branch line, divide its branch column by the segment width, round to the
nearest nonnegative integer with halves rounded upward, then add one. This is
the prefix depth. The prefix denotes four times that many indentation units; no
synthetic spaces or source tokens are created. [fixture:
treeview/box-infer-first-column] [fixture: treeview/box-round-below] [fixture:
treeview/box-round-above] [fixture: treeview/box-written-tree]

The prefix consists of all characters through the first branch, then the maximal
immediately adjacent run of `─` and `━`, then the following ASCII spaces, with
tabs read as four spaces. After those spaces, another dash is content, not
prefix. A leading NBSP, U+2028 or U+2029 is content, not that separator. Read
all tabs throughout the remaining branch-line content as four spaces, and leave
its trailing common whitespace out of the reading. Preserve its authored
spelling in the source tree. [fixture: treeview/box-branch-quoted-second]
[fixture: treeview/box-skip-space-before-dash] [fixture:
treeview/box-branch-leading-nbsp] [fixture: treeview/box-branch-leading-ls]
[fixture: treeview/box-branch-leading-ps] [fixture: treeview/box-tab-name]
[fixture: treeview/box-only-branch-content-tab] [fixture:
treeview/box-trim-unicode-tail] [fixture: treeview/box-multiline-name-tail-trim]
[fixture: treeview/box-dir-name-trim]

#### Line classification and errors

In active box mode, apply the following cases in order to every line after the
keyword line, even inside multiline quoted names or accessibility blocks.
Inactive mode leaves these characters to the ordinary unit rules. [fixture:
treeview/box-quoted-decoration] [fixture: treeview/box-block-decoration]
[fixture: treeview/box-block-decoration-plain] [fixture:
treeview/box-quoted-indent-error] [fixture: treeview/box-block-indent-error]

| Case                                            | Direct reading                                          |
| ----------------------------------------------- | ------------------------------------------------------- |
| Whitespace-only line                            | Keep its reading unchanged.                             |
| Comment-shaped or metadata-shaped line          | Keep its reading unchanged.                             |
| Only whitespace and vertical `│`/`┃`            | Decoration: denote no content or following line break.  |
| A branch anywhere                               | Read the first branch prefix and its remaining content. |
| No branch; only whitespace and box characters   | Decoration: denote no content or following line break.  |
| No branch; a box character and other content    | Keep the original line and indentation, including tabs. |
| No box character; starts with common whitespace | Reject mixed indentation.                               |
| Otherwise                                       | Keep the original line.                                 |

Mode detection and decoration classification are different: a lone vertical bar
does not select the mode, whereas a lone horizontal dash can select it and then
denote decoration. A branch with no remaining content after the prefix and
trailing-whitespace reading rejects before it can be decoration. A quoted empty
name is still nonempty content. [fixture: treeview/box-decoration-only]
[fixture: treeview/box-mode-dash-only] [fixture:
treeview/box-empty-branch-after-decoration] [fixture:
treeview/box-prefixed-directive] [fixture: treeview/box-empty-quoted]

The unchanged cases do not erase visible indentation. An ASCII-whitespace-only
line or a prefixed native comment can leave indentation before another
indentation and reject. NBSP-only lines pass unchanged and can become bare
nodes, while NBSP/U+2028/U+2029 before nonblank content without box characters
reject. An unchanged box-containing line can retain deep indentation rather than
becoming a root. [fixture: treeview/box-blank-space-indent] [fixture:
treeview/box-comment-indentation-error] [fixture: treeview/box-prefixed-comment]
[fixture: treeview/box-blank-nbsp-line] [fixture:
treeview/box-mixed-indent-nbsp] [fixture: treeview/box-mixed-indent-ls]
[fixture: treeview/box-mixed-indent-ps] [fixture:
treeview/box-indented-content-no-branch] [fixture:
treeview/box-trim-bare-no-branch-unicode]

Physical-line exclusions do not change grammar positions. A metadata-shaped line
after a node is still forbidden, and an ordinary indented annotation line can
still fail the mixed-format guard. A prefix can introduce a common statement
before the nodes, an annotation on the preceding node, a native comment whose
indentation reaches a later node, or padding before an accessibility-block
opener. It does not necessarily introduce a new node. [fixture:
treeview/box-prefixed-empty-block] [fixture:
treeview/box-decoration-annotation-gap] [fixture:
treeview/box-metadata-after-node] [fixture: treeview/box-common-prefix]
[fixture: treeview/box-annotation-prefix] [fixture:
treeview/box-comment-indent-carry] [fixture:
treeview/box-branch-before-block-open] [fixture:
treeview/box-prefix-common-block-two-prefixes]

Quotes and braces inside a prefix do not close an enclosing value. Prefix text
can include an opening quote or the earlier name and description on that line;
the remaining bare name is then read as written there. Within an already-open
value, the prefix and decoration stay in that value's authored spelling;
prefix-denoted whitespace there does not start an annotation. These forms are
accepted with the direct reading, not rejected as new divergences. [fixture:
treeview/box-multiline-annotation-space] [fixture: treeview/box-quoted-branch]
[fixture: treeview/box-description-branch] [fixture:
treeview/box-prefix-arbitrary] [fixture: treeview/box-trim-string-closing-quote]
[fixture: treeview/box-trim-block-closing-brace] [fixture:
treeview/box-multiline-quoted] [fixture: treeview/box-quoted-decoration]
[fixture: treeview/box-block-decoration]

Common directives, selected semicolons, comment lines, empty lines and line
separators retain their own rules in nested rows and multiline values. An empty
accessibility block is a preamble statement, but literal text when enclosed by a
quoted name; it cannot interrupt nodes. A common directive in a value remains
shared trivia. [fixture: treeview/nested-child-selected-semicolon] [fixture:
treeview/nested-box-directive-line] [fixture:
treeview/nested-box-selected-semicolon] [fixture:
treeview/nested-box-comment-line] [fixture: treeview/nested-box-empty-line]
[fixture: treeview/nested-box-ls] [fixture: treeview/nested-box-ps] [fixture:
treeview/nested-child-empty-block] [fixture: treeview/nested-box-empty-block]
[fixture: treeview/box-physical-directive-inline] [fixture:
treeview/box-physical-directive-line] [fixture:
treeview/box-physical-selected-semicolon] [fixture:
treeview/box-physical-comment-line] [fixture: treeview/box-physical-empty-line]
[fixture: treeview/box-physical-ls] [fixture: treeview/box-physical-ps]
[fixture: treeview/box-physical-empty-description] [fixture:
treeview/block-physical-comment-line] [fixture:
treeview/block-physical-empty-line] [fixture:
treeview/block-physical-selected-semicolon] [fixture:
treeview/block-physical-ls] [fixture: treeview/block-physical-ps] [fixture:
treeview/block-physical-empty-description]

A branch and each dash in its variable-length run are separate authored
components: directives or selected semicolons between them are allowed. Prefix
text before the branch is text, not reclassified as earlier-looking keywords or
annotations. An unselected semicolon interrupts the dash run and remains
content. [fixture: treeview/box-branch-directive-parts] [fixture:
treeview/box-dash-directive-inside] [fixture:
treeview/box-branch-selected-semicolon] [fixture:
treeview/box-dash-selected-semicolon] [fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-branch-unselected-semicolon] [fixture:
treeview/box-dash-unselected-semicolon]

The empty-branch and mixed-indentation conditions reject independently of
lexing. Error locations refer to original source lines after intervening
decorations; this specification does not require Mermaid's rewritten offsets,
columns, message wording or line-mapping implementation. [fixture:
treeview/box-error-remap] [fixture: treeview/box-empty-branch-after-decoration]
[fixture: treeview/box-mixed-reject]

## Grammar

```text
diagram = header common-statement* node* end-of-text
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
node = indentation? (quoted-name | bare-name) annotation*
annotation = class-annotation | icon-annotation | description-annotation
```

Use [common Notation](../common.md#notation). Hidden newlines and Comments are
not separators. Box prefixes denote indentation or padding at their positions;
decorations add no grammatical statement and do not end the common-statement
preamble. Every input character is still kept by the source tree or shared
trivia. [fixture: treeview/gram-written-tree] [fixture:
treeview/box-written-tree] [fixture: treeview/box-decoration-preamble-body]
[fixture: treeview/box-decoration-pending-name-gap] [fixture:
treeview/box-decoration-before-annotation]

The body and annotation lists may be empty. Common forms may repeat in any order
before the first node but never after it. Quoted nodes may be adjacent on one
line. A bare row can enclose same-line quote-looking text. An annotation without
a node, a repeated header or extra indentation rejects. A semicolon is not a
general separator: an unselected semicolon may instead form part or all of a
bare name. [fixture: treeview/header-only] [fixture: treeview/common-repeat]
[fixture: treeview/common-repeat-empty] [fixture:
treeview/gram-title-after-node] [fixture:
treeview/gram-accessibility-after-node] [fixture:
treeview/gram-description-after-node] [fixture: treeview/gram-adjacent-quoted]
[fixture: treeview/gram-inline-quoted] [fixture: treeview/gram-inline-bare]
[fixture: treeview/gram-annotation-without-node] [fixture:
treeview/gram-repeated-header] [fixture: treeview/tail-quoted-semicolon]
[fixture: treeview/tail-bare-semicolon]

| Rule                        | Source node                    |
| --------------------------- | ------------------------------ |
| diagram                     | TreeviewDiagram                |
| node                        | TreeviewNode                   |
| class-annotation            | TreeviewClassAnnotation        |
| icon-annotation             | TreeviewIconAnnotation         |
| description-annotation      | TreeviewDescriptionAnnotation  |
| title-line                  | TreeviewTitleStatement         |
| acc-title-line              | TreeviewAccTitleStatement      |
| acc-descr-line              | TreeviewAccDescrStatement      |
| acc-descr-block             | TreeviewAccDescrBlockStatement |
| bare-name                   | TreeviewIdentifier             |
| quoted-name                 | StringLiteral                  |
| Class name / icon reference | Identifier                     |
| Common / description text   | TreeviewLiteral                |
| Authored branch prefix      | TreeviewBranchPrefix           |
| Decoration outside a value  | TreeviewIgnoredText            |

### Indentation and parents

Keep nodes flat and in written order, with indentation assigned once to each
node. To interpret parents, keep the still-open preceding nodes in order. Before
a new node, remove open nodes from the end while their indentation is greater
than or equal to its indentation. The last remaining node is its parent; with
none it is another root. Add the current node to the open list. Common
statements and decorations do not participate. [fixture: treeview/db-indent-pop]
[fixture: treeview/box-written-tree] [fixture:
treeview/box-decoration-trailing-body] [fixture: treeview/gram-written-tree]

Files as well as directory-looking names can be parents. The first node can be
indented; multiple roots, arbitrary indentation increases/decreases, duplicate
names and empty quoted names are allowed. Ordinary indentation and
branch-denoted indentation use the same comparison. Do not synthesize an
authored root, parent field or children list. [fixture: treeview/db-file-parent]
[fixture: treeview/db-first-indented] [fixture: treeview/db-duplicate-names]
[fixture: treeview/db-empty-names] [fixture: treeview/box-indented-box-text]
[fixture: treeview/box-round-below]

Inside an accessibility block, an empty-description-looking line is still
content through its first closing brace; that brace closes the enclosing block.
Text on later lines can then become ordinary nodes. [fixture:
treeview/block-physical-empty-description]

### Semantic acceptance conditions

The [public parse wrapper][parse] rejects any lexer or parser error, including
incomplete consumption and errors attached to a recovered model. There is no
additional treeview validator or semantic rejection in the [adapter][adapter] or
[Db][db]. In addition to common rules and lexical/grammar rejection, the two
box-reading errors above are the only treeview-specific gates. [fixture:
treeview/error-after-prefix] [fixture: treeview/gram-invalid-icon] [fixture:
treeview/gram-accessibility-after-node] [fixture:
treeview/box-empty-branch-after-decoration] [fixture: treeview/box-mixed-reject]

Do not add single-root, uniform-indent, directory-only-parent, unique-name,
registered-class or installed-icon-pack requirements. Empty quoted names and
explicit empty annotations remain syntax, not tokenless-empty-forms divergences.
[fixture: treeview/db-first-indented] [fixture: treeview/db-file-parent]
[fixture: treeview/db-prototype-names] [fixture: treeview/db-duplicate-names]
[fixture: treeview/db-empty-names] [fixture: treeview/db-icon-none] [fixture:
treeview/spec-parser-ab2c8458]

### Authored occurrences, configuration and normalization

Keep every written common statement and annotation independently, including
empty and overwritten occurrences, both quote styles, original slashes,
description padding, tabs, prefixes and decorations. The
[tree document](../ast/treeview.md) defines their ranges and ownership.
[fixture: treeview/gram-written-tree] [fixture: treeview/common-repeat-empty]
[fixture: treeview/db-repeat-class] [fixture: treeview/db-repeat-icon] [fixture:
treeview/annotation-description-repeat-empty] [fixture:
treeview/box-written-tree] [fixture: treeview/box-tab-quoted]

Treeview configuration is drawing configuration and supplies no acceptance key.
Site, frontmatter and init settings do not rescue invalid syntax or reject
otherwise valid treeview syntax. Icon resolution is a drawing operation, not a
reference-validation gate. Invalid embedded data remains subject to the shared
opaque-data divergence. [fixture: treeview/config-drawing-site] [fixture:
treeview/config-frontmatter-drawing] [fixture: treeview/config-init-drawing]
[fixture: treeview/config-frontmatter-cannot-rescue] [fixture:
treeview/config-frontmatter-cannot-reject] [fixture:
treeview/config-init-cannot-rescue] [fixture:
treeview/config-init-cannot-reject] [fixture: treeview/div-frontmatter-invalid]

The [tests summary](../../../tests/docs/db-summaries.md#treeview) defines Db
normalization: common-value publication, name and annotation conversion,
directory suffix interpretation, sanitization and the derived forest.
Configuration-dependent sanitization is an external Db input, not a change to
authored leaf values or a treeview-specific acceptance condition. [fixture:
treeview/db-all-fields] [fixture: treeview/db-directory-trailing-space]
[fixture: treeview/config-security-level-default] [fixture:
treeview/config-security-level-other] [fixture:
treeview/config-security-level-other-html-false]

## Known divergences

**[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
A directive inside an atomic header, keyword, marker, class name or complete
icon reference rejects; text, string interiors and complete-component gaps
retain their permitted reading. [fixture: treeview/directive-header-inside]
[fixture: treeview/directive-class-inside] [fixture:
treeview/directive-class-value-inside] [fixture:
treeview/directive-icon-value-inside] [fixture:
treeview/icon-pack-name-directive] [fixture:
treeview/directive-icon-parts-parts]

**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
The same atomic boundaries apply only to semicolons actually selected by the
common line rule. An unselected semicolon is not this divergence; a split header
normally fails detection before that rule. [fixture:
treeview/semicolon-class-inside] [fixture:
treeview/semicolon-class-value-inside] [fixture:
treeview/semicolon-icon-value-inside] [fixture:
treeview/semicolon-header-inside] [fixture:
treeview/box-branch-selected-semicolon] [fixture:
treeview/box-branch-unselected-semicolon]

**[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
An open frontmatter tag cannot change body quote boundaries here. Both
acceptance directions and value-only differences are recorded by specified
readings. [fixture: treeview/div-html-frontmatter-accept] [fixture:
treeview/div-html-frontmatter-reject] [fixture:
treeview/div-html-frontmatter-value]

**[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).**
Shared embedded payloads are opaque; there is no treeview acceptance key to
retain. A valid neighboring title or configuration remains part of the
comparison. [fixture: treeview/div-frontmatter-invalid] [fixture:
treeview/config-fontfamily-keeps-title] [fixture:
treeview/div-invalid-keeps-config] [fixture: treeview/div-init-primitive-wrap]

**[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
Passed bare lines and their accompanying trivia are not read again; retained
forms still require native readability. This includes ASCII indentation as well
as Unicode padding. [fixture: treeview/bare-line-space] [fixture:
treeview/bare-line-nbsp] [fixture: treeview/detect-secondscan-bare-ascii]
[fixture: treeview/detect-secondscan-bare-unicode] [fixture:
treeview/detect-retained-comment-gap]

**[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).** Select
treeview by its header even when a later authored value, comment or directive
contains one of the four anywhere C4 keywords. [fixture:
treeview/c4-component-header-eof] [fixture: treeview/c4-container-bare]
[fixture: treeview/c4-dynamic-title] [fixture: treeview/c4-deployment-block]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L13-L64
[box]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/boxDrawingPreprocessor.ts#L8-L208
[detector]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/detector.ts#L4-L8
[keyword]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L14-L28
[parse]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L176
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/parser.ts#L11-L57
[db]:
  https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/db.ts#L17-L91
