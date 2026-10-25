# Packet formatting rules

Japanese version: [packet.ja.md](./packet.ja.md)

The 26 adopted items use the written AST and shared layouts, without runtime
Mermaid calls or output reparsing. Invisible characters and physical CR use
escaped fixed tests.

## Rules

### Header

Keep the authored `packet` or `packet-beta` keyword at column one. Move an
ordinary first statement below it for a visible heading. Only `packet` requires
a following boundary; never create a glued spelling. Hidden boundaries and
protected header/body groups take precedence. Keep the authored synonym:
replacing `packet-beta` with `packet` adds no formatting benefit, as with
[gitgraph checkout aliases](./gitgraph.md#checkout-aliases).

[fixture: packet/header/header-packet]

[fixture: packet/header/header-beta]

[fixture: packet/header/header-global-boundary]

Input (escaped): `" \tpacket \t\n0:\"Head\"\n"`.

Output
([header/header-packet-output.mmd](../tests/fixtures/packet/header/header-packet-output.mmd)):

```mmd
packet
  0: "Head"
```

### Indentation

Place ordinary statements and standalone comments/global directives one
configured step below the header. The body is flat: published rows add no source
nesting. `tabWidth: 0` gives zero spaces, and `useTabs` gives one tab even at
width zero, because packet columns have no grammatical meaning. Value
continuation columns, hidden closers and retained prefixes stay written; YAML
uses the shared positive minimum.

[fixture: packet/indentation/indent-default]

[fixture: packet/indentation/indent-four]

[fixture: packet/indentation/indent-zero]

[fixture: packet/indentation/indent-tabs]

[fixture: packet/indentation/indent-zero-tabs]

Input (escaped): `"packet\n0:\"Indent\"\n       1:\"Next\"\n"`.

Output
([indentation/indent-default-output.mmd](../tests/fixtures/packet/indentation/indent-default-output.mmd)):

```mmd
packet
  0: "Indent"
  1: "Next"
```

### Statements one per line

Print each ordinary statement on its own line for readability. A common line
value owns apparent later keywords through physical EOL; do not split that text.
Semicolons are not packet separators. Invalid adjacent blocks or block/common
forms follow the shared failure path rather than being repaired.

[fixture: packet/statements-one-per-line/inline-title]

[fixture: packet/statements-one-per-line/beta-title]

[fixture: packet/statements-one-per-line/line-owns-keyword]

[corpus fixture: packet/gram-same-line-blocks]

[corpus fixture: packet/end-block-semicolon]

[corpus fixture: packet/common-block-needs-eol]

[corpus fixture: packet/gram-visible-newline-in-block]

[corpus fixture: packet/comment-inside-range]

[corpus fixture: packet/gram-empty-description-in-block]

Input (escaped): `"packet title Inline topic"`.

Output
([statements-one-per-line/inline-title-output.mmd](../tests/fixtures/packet/statements-one-per-line/inline-title-output.mmd)):

```mmd
packet
  title Inline topic
```

### Block forms and order

Keep `start-end`, `start` and `+count` as their three authored AST forms,
including equal endpoints. Keep every occurrence in order, repeated labels and
empty common assignments. Never merge or reconstruct statements from the Db: row
splitting and the publication cap lose authored structure, and deleting empty
assignments can change the final value.

[fixture: packet/block-forms-and-order/block-three-forms]

[fixture: packet/block-forms-and-order/keep-interleaving]

[fixture: packet/block-forms-and-order/row-split-kept]

[fixture: packet/block-forms-and-order/cap-unpublished-kept]

Input (escaped):
`"packet\n+2:\"relative\"\n2:\"single\"\n3-3:\"equal range\"\n"`.

Output
([block-forms-and-order/block-three-forms-output.mmd](../tests/fixtures/packet/block-forms-and-order/block-three-forms-output.mmd)):

```mmd
packet
  +2: "relative"
  2: "single"
  3-3: "equal range"
```

### Range dash

Print ordinary range gaps with no spaces, as `0-15`, so the numeric range reads
as one visual unit. Preserve global trivia and hidden boundaries instead of
tightening them: a consumed LF is not an ordinary space.

[fixture: packet/range-dash/dash-tight]

[fixture: packet/range-dash/dash-hidden]

[fixture: packet/range-dash/dash-global-before]

[fixture: packet/range-dash/dash-global-after]

Input (escaped): `"packet\n0 \t- 2 : \"Dash\"\n"`.

Output
([range-dash/dash-tight-output.mmd](../tests/fixtures/packet/range-dash/dash-tight-output.mmd)):

```mmd
packet
  0-2: "Dash"
```

### Relative plus

Print ordinary plus/count gaps without a space, as `+3`, so the prefix and
relative length read together. Keep the count digits as written. Global trivia
and hidden forms retain their contact and consumed LF.

[fixture: packet/relative-plus/plus-tight]

[fixture: packet/relative-plus/plus-hidden]

[fixture: packet/relative-plus/plus-global-after]

Input (escaped): `"packet\n+ \t3 :\"Plus\"\n"`.

Output
([relative-plus/plus-tight-output.mmd](../tests/fixtures/packet/relative-plus/plus-tight-output.mmd)):

```mmd
packet
  +3: "Plus"
```

### Block colons

Print `0-15: "Source Port"`, `16: "Flag"` and `+3: "Payload"`: zero ordinary
spaces before the colon, one after it, without column alignment. This follows
gitgraph option colons and shared accessibility colons. Pie spacing is a
pie-specific choice. Trivia-bearing gaps retain their boundaries.

[fixture: packet/block-colons/colon-compact]

[fixture: packet/block-colons/colon-hidden]

[fixture: packet/block-colons/colon-global-after]

Input (escaped):
`"packet\n0 - 2 \t:  \"Range\"\n3 \t:\t'Single'\n+ 2 :\"Relative\"\n"`.

Output
([block-colons/colon-compact-output.mmd](../tests/fixtures/packet/block-colons/colon-compact-output.mmd)):

```mmd
packet
  0-2: "Range"
  3: 'Single'
  +2: "Relative"
```

### Quotes

Keep complete StringLiteral source spans with single, double and opposite
quotes, empty labels and escapes. `singleQuote` does not rewrite labels.
Re-encoding would lose authored spelling and require new escape/preprocessing
choices. Quote-looking common values remain literals, not strings to requote.

[fixture: packet/quotes/quotes-authored]

[fixture: packet/quotes/quotes-single-option]

Input (escaped):
`"packet\n0:'single \"quote\"'\n1:\"double 'quote'\"\n2:''\n3:\"\"\n"`.

Output
([quotes/quotes-authored-output.mmd](../tests/fixtures/packet/quotes/quotes-authored-output.mmd)):

```mmd
packet
  0: 'single "quote"'
  1: "double 'quote'"
  2: ''
  3: ""
```

### Label content

Keep label padding, repeated spaces, tabs, escapes, HTML, entities and
hidden-looking text as the complete source range, including internal common
trivia. Trimming, collapsing or decoding this text can change the Db. Physical
line endings alone follow the shared host policy.

[fixture: packet/label-content/label-padding]

[fixture: packet/label-content/label-escapes]

[fixture: packet/label-content/label-html-entity]

[fixture: packet/label-content/label-hidden-looking]

Input (escaped): `"packet\n0:\"  A  B\t C  \"\n1:\" \t \"\n"`.

Output
([label-content/label-padding-output.mmd](../tests/fixtures/packet/label-content/label-padding-output.mmd)):

```mmd
packet
  0: "  A  B	 C  "
  1: " 	 "
```

### Numbers

Print the written unsigned digits of start/end/count rather than
NumericLiteral.value. Preserve zero, precision-losing integers and overflow
digits. Rounded doubles can lose spelling or print rejected exponent/Infinity
syntax. Invalid leading-zero, decimal, signed or exponent inputs remain corpus
failures.

[fixture: packet/numbers/number-zero]

[fixture: packet/numbers/number-precision]

[fixture: packet/numbers/number-overflow]

[fixture: packet/numbers/number-exponent]

[corpus fixture: packet/gram-leading-zero]

[corpus fixture: packet/gram-zero-range]

[corpus fixture: packet/db-precision-rounded]

[corpus fixture: packet/db-overflow-wide]

Input (escaped): `"packet\n0-0:\"Zero\"\n"`.

Output
([numbers/number-zero-output.mmd](../tests/fixtures/packet/numbers/number-zero-output.mmd)):

```mmd
packet
  0-0: "Zero"
```

### Title

Print `title`, one space and a nonempty value trimmed at common-whitespace
edges; null or whitespace-only values print bare `title`. This compacts
equivalent exterior whitespace while keeping interior text, quotes and escapes.
Never take a value from the next physical line, even across
blank/comment/directive gaps. Keep empty final assignments and frontmatter
fallback; protected trivia/hidden boundaries take precedence.

[fixture: packet/title/title-trim]

[fixture: packet/title/title-null]

[fixture: packet/title/title-no-next]

[fixture: packet/title/title-literal]

[fixture: packet/title/title-frontmatter]

Input (escaped): `"packet\ntitle\t  Topic  words \t\n"`.

Output
([title/title-trim-output.mmd](../tests/fixtures/packet/title/title-trim-output.mmd)):

```mmd
packet
  title Topic  words
```

### Accessibility lines

Reuse the shared compact form `accTitle: value` / `accDescr: value`: the colon
touches its keyword, with one space before a trimmed nonempty value; empty
values end at the colon. This keeps consistent exterior spacing without changing
interior text or comment attachment. Braces after the colon are line text. Never
join a next-line value; hidden suffixes and protected groups keep their gaps.

[fixture: packet/accessibility-lines/a11y-lines]

[fixture: packet/accessibility-lines/a11y-empty-next]

[corpus fixture: packet/common-line-no-next-value]

[corpus fixture: packet/common-comment-gap]

Input (escaped):
`"packet\naccTitle \t:  Access  words \t\naccDescr\t:  Details  words \t\n"`.

Output
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/packet/accessibility-lines/a11y-lines-output.mmd)):

```mmd
packet
  accTitle: Access  words
  accDescr: Details  words
```

### Description blocks

Reuse shared `layoutDescriptionBlock`: keep touching keyword/opener and interior
sides touching, and compact present runs to one space. Plain opener whitespace
can join across physical or Unicode lines; real opener trivia keeps its break.
Whitespace-only interiors become `{}` because no text needs surrounding
whitespace. Comment/directive-only interiors keep their trivia. Nonempty
continuation columns and blank lines stay written; a separate closer aligns with
the statement. Quotes, backslashes and hidden-looking text do not protect the
first closing brace.

[fixture: packet/description-blocks/description-gaps]

[fixture: packet/description-blocks/description-columns]

[fixture: packet/description-blocks/description-trivia]

[corpus fixture: packet/lex-description-directive-only]

[fixture: packet/description-blocks/description-bare]

[corpus fixture: packet/lex-description-hidden-first-brace]

[fixture: packet/description-blocks/description-opener-global]

[fixture: packet/description-blocks/description-opener-comment]

[test: packet/description-blocks/description-empty]

[test: packet/description-blocks/description-opener]

[corpus fixture: packet/lex-description-quoted-close]

[corpus fixture: packet/accdescr-block-escaped-close]

Input (escaped):
`"packet\naccDescr{A}\naccDescr   {  B  }\naccDescr {C }\naccDescr{ D}\n"`.

Output
([description-blocks/description-gaps-output.mmd](../tests/fixtures/packet/description-blocks/description-gaps-output.mmd)):

```mmd
packet
  accDescr{A}
  accDescr { B }
  accDescr {C }
  accDescr{ D}
```

### Multiline values

Do not wrap components or values at printWidth: visible LF between block
components rejects, and changing label line breaks changes its Db. Keep existing
physical label/block lines, continuation columns and internal blanks. A separate
description closer uses the shared alignment; hidden consumed LFs use their
boundary rules.

[fixture: packet/multiline-values/long-no-wrap]

[fixture: packet/multiline-values/multiline-label]

Input (escaped):
`"packet\n0-30:\"Long authored label with enough words to exceed a narrow width\"\n"`.

Options: `{"printWidth": 20}`.

Output
([multiline-values/long-no-wrap-output.mmd](../tests/fixtures/packet/multiline-values/long-no-wrap-output.mmd)):

```mmd
packet
  0-30: "Long authored label with enough words to exceed a narrow width"
```

### Comments

Use shared attachment: ordinary standalone comments align one body step in, or
column one before the header; inline comments keep their line and touching side,
or one separating space. Preserve marks, content and trailing padding. Native
comments end at physical LF/CR, keeping LS/PS as content. Earlier strings/blocks
own percent text; common lines stop at it. Common removed regions keep complete
source and joined columns, because moving them can change ownership.

[fixture: packet/comments/comments-placement]

[fixture: packet/comments/comments-value]

[fixture: packet/comments/comments-common-region]

[test: packet/comments/comments-ls-ps]

Input (escaped):
`"packet\n0:\"A%%B\"\naccDescr { A%%B }\ntitle Text%%comment\n"`.

Output
([comments/comments-value-output.mmd](../tests/fixtures/packet/comments/comments-value-output.mmd)):

```mmd
packet
  0: "A%%B"
  accDescr { A%%B }
  title Text%%comment
```

[fixture: packet/comments/hidden-comment-indentation]

### Global directives

Use shared Root directive attachment and preserve opaque content, order, each
side's contact, component boundaries and value-internal text. Ordinary
standalone starts align one body step in; multiline interiors and EOF-reaching
endings stay written. Common removal supplies no separator, and deleting init
can change row configuration. Native hidden DIRECTIVE stays a separate owned
node.

[fixture: packet/global-directives/global-positions]

[fixture: packet/global-directives/global-in-values]

[fixture: packet/global-directives/global-standalone]

[corpus fixture: packet/directive-unclosed-after-header]

[fixture: packet/global-directives/global-multiline]

Input (escaped):
`"packet\n0%%{wrap}%%:\t\"Global\"\naccTitle%%{wrap}%%: Access\naccDescr%%{wrap}%%{ Detail }\n"`.

Output
([global-directives/global-positions-output.mmd](../tests/fixtures/packet/global-directives/global-positions-output.mmd)):

```mmd
packet
  0%%{wrap}%%: "Global"
  accTitle%%{wrap}%%: Access
  accDescr%%{wrap}%%{ Detail }
```

### Hidden yaml

Keep every yaml-block PacketIgnoredText once at its
textBeforeHeader/body/named-gap/textAfter owner, as its complete source span.
Preserve consumed LF outside the range and closing padding, including EOF:
moving or trimming a required boundary can reject a following statement.
Exterior spare LF and edge blanks follow [Blank lines](#blank-lines). Never
format its opaque body as YAML or add LF before it. Ordinary body openers may
indent; internal and closing columns stay. Preserve empty/three-fence matches,
multiple forms, later qualifying closers and global cuts. Earlier values retain
lexical priority.

[fixture: packet/hidden-yaml/yaml-gap-count]

[fixture: packet/hidden-yaml/yaml-gap-end]

[fixture: packet/hidden-yaml/yaml-body]

[fixture: packet/hidden-yaml/yaml-suffix-space]

[fixture: packet/hidden-yaml/yaml-suffix-spare]

[fixture: packet/hidden-yaml/yaml-suffix-eof]

[fixture: packet/hidden-yaml/yaml-three-fences]

[fixture: packet/hidden-yaml/yaml-two-forms]

[fixture: packet/hidden-yaml/yaml-later-closer]

[fixture: packet/hidden-yaml/yaml-global-cut]

[fixture: packet/hidden-yaml/yaml-all-range-gaps]

[fixture: packet/hidden-yaml/yaml-beta-header]

[fixture: packet/hidden-yaml/yaml-eof-padding]

[corpus fixture: packet/hidden-yaml-adjacent-eof]

[corpus fixture: packet/hidden-yaml-title-absorbed]

[corpus fixture: packet/hidden-yaml-in-label]

[corpus fixture: packet/hidden-yaml-in-description]

[corpus fixture: packet/hidden-yaml-acctitle-absorbed]

[corpus fixture: packet/hidden-yaml-accdescr-absorbed]

[corpus fixture: packet/lex-yaml-common-comment]

Input (escaped): `"packet\n+---\nopaque count\n---\n2:\"Ycount\"\n"`.

Output
([hidden-yaml/yaml-gap-count-output.mmd](../tests/fixtures/packet/hidden-yaml/yaml-gap-count-output.mmd)):

```mmd
packet
  +---
opaque count
---
2: "Ycount"
```

### Hidden directives

Apply the same shared source/boundary preservation to directive-kind
PacketIgnoredText, distinct from Root directives. Keep all range/single/relative
interior gaps, seven statement suffix kinds, header contact and body forms after
visible EOL. Keep arbitrary/multiline bodies, later qualifying closers, multiple
forms and global cuts. Glued nonqualifying or unclosed forms can remain native
Comments: adding a boundary could change their classification.

[fixture: packet/hidden-directives/hidden-all-range-gaps]

[fixture: packet/hidden-directives/hidden-single-gaps]

[fixture: packet/hidden-directives/hidden-relative-gaps]

[fixture: packet/hidden-directives/hidden-header]

[fixture: packet/hidden-directives/hidden-body]

[fixture: packet/hidden-directives/hidden-suffix-range]

[fixture: packet/hidden-directives/hidden-suffix-single]

[fixture: packet/hidden-directives/hidden-suffix-relative]

[fixture: packet/hidden-directives/hidden-common-suffixes]

[fixture: packet/hidden-directives/hidden-multiple]

[fixture: packet/hidden-directives/hidden-later-close]

[fixture: packet/hidden-directives/hidden-fallback]

[fixture: packet/hidden-directives/hidden-unclosed-comment]

[fixture: packet/hidden-directives/hidden-global-inside]

[fixture: packet/hidden-directives/hidden-eof-padding]

[corpus fixture: packet/hidden-directive-empty-adjacent]

[corpus fixture: packet/lex-directive-body-separators]

[corpus fixture: packet/lex-hidden-after-visible-eol]

Input (escaped):
`"packet\n0%%{!d}%% -%%{!e}%% 1%%{!c}%% :%%{!l}%% \"Dgaps\"\n"`.

Output
([hidden-directives/hidden-all-range-gaps-output.mmd](../tests/fixtures/packet/hidden-directives/hidden-all-range-gaps-output.mmd)):

```mmd
packet
  0%%{!d}%% -%%{!e}%% 1%%{!c}%% :%%{!l}%% "Dgaps"
```

### Retained prefix

Keep the complete prefix whenever textBeforeHeader contains a hidden form,
including leading LF, comment columns, passed bare-line trivia, second-scan
forms and real/hidden order. Removing leading LF can promote ignored YAML into
effective title/configuration or malformed frontmatter. A prefix with only
ordinary passed comments uses shared root cleanup.

[fixture: packet/retained-prefix/prefix-retain]

[fixture: packet/retained-prefix/prefix-real-hidden]

[fixture: packet/retained-prefix/prefix-second-scan]

[fixture: packet/retained-prefix/prefix-between-retained]

Input (escaped):
`"\n---\ntitle: Ignored title\nconfig: {packet: {bitsPerRow: 8}}\n---\npacket\n0-9:\"Prefix\"\n"`.

Output
([retained-prefix/prefix-retain-output.mmd](../tests/fixtures/packet/retained-prefix/prefix-retain-output.mmd)):

```mmd

---
title: Ignored title
config: {packet: {bitsPerRow: 8}}
---
packet
  0-9: "Prefix"
```

### Semicolons

Keep every semicolon and reuse shared textual segment protection: protect from
the first non-whitespace character through the last semicolon, extending through
whole crossing values/comments/directives. Keep protected header/first-statement
groups together, formatting only safe exterior/suffix gaps. Both style/classDef
passes, case, colon/hash whitespace, repetitions, Unicode segment bounds and
directive-rejoined triggers stay written. Removing one selected semicolon can
select another and change the Db; atomic cuts remain failures.

[fixture: packet/semicolons/semicolons-text]

[fixture: packet/semicolons/semicolons-trigger]

[fixture: packet/semicolons/semicolons-header-group]

[fixture: packet/semicolons/semicolons-nontrigger]

[fixture: packet/semicolons/semicolons-global-rejoin]

[fixture: packet/semicolons/semicolons-component]

[fixture: packet/semicolons/semicolons-comment-crossing]

[test: packet/semicolons/semicolons-ls-segment]

Input (escaped):
`"packet\ntitle Text;;\naccTitle: Access;\naccDescr: Detail;;\n0:\"Label;\"\n"`.

Output
([semicolons/semicolons-text-output.mmd](../tests/fixtures/packet/semicolons/semicolons-text-output.mmd)):

```mmd
packet
  title Text;;
  accTitle: Access;
  accDescr: Detail;;
  0:"Label;"
```

### Blank lines

Collapse ordinary internal ASCII blank runs to one blank line and remove
ordinary document/body edge blanks, also around comments, for visible grouping
without excess space. Keep value, block, directive and hidden interiors,
common-region joins and retained prefixes: those breaks belong to content or
source roles. After a hidden form consumes LF, keep one spare LF only when a
following statement needs it. At the document end use one configured final
newline; directly after the header remove blank lines, since the header needs no
EOL before its first statement. Elsewhere apply the ordinary blank-line rules
after the spare LF: collapse a run to one blank line and clear whitespace-only
lines. The spare LF meets the grammar; later blanks express grouping, just as
after comments.

A hidden boundary or semicolon protection can keep a statement on the header's
line; the gap after that statement's hidden suffix still lies between
statements.

[fixture: packet/blank-lines/hidden-following-blanks]

[fixture: packet/blank-lines/header-statement-hidden]

[fixture: packet/blank-lines/header-statement-semicolon]

[fixture: packet/blank-lines/header-statement-directive-line]

[fixture: packet/blank-lines/hidden-document-end]

[fixture: packet/blank-lines/hidden-body-end]

[fixture: packet/blank-lines/hidden-header-blanks]

[fixture: packet/blank-lines/hidden-comment-blanks]

[fixture: packet/blank-lines/hidden-comment-whitespace]

[fixture: packet/blank-lines/blanks-collapse]

[fixture: packet/blank-lines/blanks-comments]

[fixture: packet/blank-lines/blanks-values]

Input (escaped): `"\n\npacket\n\n\n0:\"Blank\"\n \t\n\n1:\"Group\"\n\n"`.

Output
([blank-lines/blanks-collapse-output.mmd](../tests/fixtures/packet/blank-lines/blanks-collapse-output.mmd)):

```mmd
packet
  0: "Blank"

  1: "Group"
```

### Trailing whitespace

Remove harmless exterior ASCII padding after ordinary headers, completed blocks
and description closers, giving ordinary line ends one form. Common line edges
use their compact layouts. Preserve value continuation lines, comments,
directives, hidden interiors and protected segments. Hidden closing padding
stays even at EOF because range-exterior whitespace can keep required EOL
visible.

[fixture: packet/trailing-whitespace/trailing-safe]

[fixture: packet/trailing-whitespace/trailing-comment]

[fixture: packet/trailing-whitespace/trailing-multiline]

Input (escaped): `"packet \t\n0:\"Exterior\" \t\naccDescr { Detail } \t\n"`.

Output
([trailing-whitespace/trailing-safe-output.mmd](../tests/fixtures/packet/trailing-whitespace/trailing-safe-output.mmd)):

```mmd
packet
  0: "Exterior"
  accDescr { Detail }
```

### Frontmatter yaml

Use shared guarded YAML formatting only for safe real frontmatter. Keep
delimiter padding and malformed, indented-delimiter, HTML-hazard or
delimiter-producing bodies as written. Equivalent YAML quoting can otherwise
become invalid after Mermaid HTML conversion. YAML uses a positive indentation
minimum even at tabWidth zero because nested values and block scalars need
indentation. Hidden YAML and retained prefixes never enter this formatter.

[fixture: packet/frontmatter-yaml/frontmatter-safe]

[fixture: packet/frontmatter-yaml/frontmatter-html-guard]

[fixture: packet/frontmatter-yaml/frontmatter-indent]

[fixture: packet/frontmatter-yaml/frontmatter-zero-min]

[fixture: packet/frontmatter-yaml/frontmatter-malformed]

[fixture: packet/frontmatter-yaml/frontmatter-delimiter-producing]

Input (escaped):
`"---\ntitle: \"<a b=\\\"c\\\">\"\n---\npacket\n0:\"Html guard\"\n"`.

Output
([frontmatter-yaml/frontmatter-html-guard-output.mmd](../tests/fixtures/packet/frontmatter-yaml/frontmatter-html-guard-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
packet
  0: "Html guard"
```

### Line terminators and unicode

Use shared host line endings: normalize physical CR/CRLF and emit configured
endOfLine, including inside labels, blocks, hidden text and frontmatter.
LS/PS/NBSP/BOM retain their lexical roles as content; common line edges trim and
plain block-opener whitespace can join. Invalid native Unicode gaps stay
rejected. Prettier removes/restores a leading BOM, so an opening-fence BOM can
promote YAML; a repeated closing-fence BOM can fail. Byte identity is not
guaranteed.

[corpus fixture: packet/line-ls-between]

[corpus fixture: packet/lex-yaml-bom-both-fences] [corpus fixture:
packet/space-count-bom]

[test: packet/line-terminators-and-unicode/eol-cr]

[test: packet/line-terminators-and-unicode/eol-crlf-label]

[test: packet/line-terminators-and-unicode/eol-crlf-hidden]

[test: packet/line-terminators-and-unicode/eol-cr-yaml-block]

[test: packet/line-terminators-and-unicode/eol-output-crlf]

[test: packet/line-terminators-and-unicode/eol-output-cr]

[test: packet/line-terminators-and-unicode/unicode-values]

[test: packet/line-terminators-and-unicode/unicode-line-trim]

[test: packet/line-terminators-and-unicode/bom-header]

[test: packet/line-terminators-and-unicode/unicode-hidden-content]

[test: packet/line-terminators-and-unicode/unicode-common-interiors]

[test: packet/line-terminators-and-unicode/eol-frontmatter]

[test: packet/line-terminators-and-unicode/bom-frontmatter-opening]

Input (escaped): `"packet\r0:\"Physical\"\r"`.

Output (escaped): `"packet\n  0: \"Physical\"\n"`.

### Final newline

End ordinary accepted files with one configured newline for a predictable file
ending, including header-only inputs, common lines, empty blocks, comments and
closed hidden forms. Remove ordinary terminal blank runs. Keep EOF-reaching
global endings, hidden closing padding and required prefix/consumed-LF
boundaries. A final LF can change raw C4 detection while keeping the specified
packet reading.

[corpus fixture: packet/spec-packet-c4580507]

[fixture: packet/final-newline/final-statement]

[fixture: packet/final-newline/final-comment]

[corpus fixture: packet/spec-packet-7426afc4]

[corpus fixture: packet/c4container-header-comment-eof]

[corpus fixture: packet/c4component-header-comment-eof]

[corpus fixture: packet/div-c4-hidden-suffix-eof]

Input (escaped): `"packet\n0:\"Final\"\n\n"`.

Output
([final-newline/final-statement-output.mmd](../tests/fixtures/packet/final-newline/final-statement-output.mmd)):

```mmd
packet
  0: "Final"
```

### Specified readings

Use the
[six specified divergences](../../spec/docs/diagrams/packet.md#known-divergences):
atomic directive/selected-semicolon cuts remain failures; frontmatter HTML uses
body-only conversion; opaque embedded data, C4 detection and bare-percent
preheader trivia use their specified readings. Text bitsPerRow that changes
acceptance is excluded only by the specified comparison path, retaining site
configuration, title and other settings. Raw rejection supplies no raw Db.
Hidden forms, empty labels and empty descriptions add no divergence. Standalone
failures report a syntax error without output; Markdown declines embedding,
leaving the payload to its host.

[corpus fixture: packet/directive-header-middle]

[corpus fixture: packet/div-selected-title-interior]

[corpus fixture: packet/frontmatter-invalid]

[corpus fixture: packet/div-html-frontmatter-value]

[corpus fixture: packet/c4container-label]

[corpus fixture: packet/bare-before-header-ls]

[corpus fixture: packet/config-frontmatter-fraction]

[corpus fixture: packet/config-frontmatter-overrides-site]

[test: packet/specified-readings/div-bare-unicode]

For example, `packet\ntit%%{wrap}%%le Atomic\n` reports a syntax error; no
repaired output is supplied.

### Markdown fences

Apply packet rules to the dedented payload through the shared Markdown route;
the host supplies fence/list/quote indentation and EOL. Check actual host
output/idempotence separately from payload Db, tree and source. Markdown trims
final code-block-line padding, including a final hidden-boundary space where no
following statement requires EOL; interior hidden padding stays necessary.
Rejected payloads follow the host unchanged-code path.

[test: packet Markdown: top-level]

[test: packet Markdown: list]

[test: packet Markdown: quote]

[test: packet Markdown: zero]

[test: packet Markdown: tabs]

[test: packet Markdown: hidden-gap]

[test: packet Markdown: hidden-boundary]

[test: packet Markdown: preheader]

[test: packet Markdown: frontmatter]

[test: packet Markdown: global-and-semicolons]

[test: packet Markdown: final-comment]

[test: packet Markdown: final-hidden-padding]

[test: packet Markdown: rejected]

Input (escaped): `"```mermaid\npacket 0:\"Fence\"\n```\n"`.

Output (escaped): `"```mermaid\npacket\n  0: \"Fence\"\n```\n"`.
