# Pie nodes

Japanese version: [pie.ja.md](./pie.ja.md)

This document defines the source tree for `pie`; shared leaves are in
[ast.md](../ast.md), and syntax and acceptance in
[diagrams/pie.md](../diagrams/pie.md). All values keep their written text rather
than Db conversion. Optional fields are present as null and absent lists are
empty. Child fields below give visitor order, and each list is in source order.
[fixture: pie/db-all-fields] [fixture: pie/header-only] [fixture:
pie/label-unknown-escapes] [fixture: pie/number-negative-zero]

## Nodes

### PieDiagram

| Field                | Type                   | Meaning                                |
| -------------------- | ---------------------- | -------------------------------------- |
| `showData`           | boolean                | Whether the header flag is written.    |
| `textBeforeHeader`   | list of PieIgnoredText | Hidden forms read before pie.          |
| `textBeforeShowData` | list of PieIgnoredText | Hidden forms between pie and its flag. |
| `body`               | list of PieBodyItem    | Written body items.                    |

Child fields: `textBeforeHeader`, `textBeforeShowData`, `body`. Range: the
earliest retained pre-header form, or pie if none, through the last written
header/body form; unrelated outside whitespace is excluded. No separate header
node or effective title/sections is synthesized. [fixture:
pie/frontmatter-nonleading-comment] [fixture: pie/header-only] [fixture:
pie/db-all-fields] [fixture: pie/lex-hidden-directive-second-detection-scan]

textBeforeHeader holds the PieIgnoredText forms read before pie by its hidden
YAML and hidden DIRECTIVE rules. The retained nonleading block and second-scan
directive are read by those pie rules, whose boundaries decide acceptance. A
bare line detection passes, including `%%{}%%`, `%%{!}%%` and an unclosed
`%%{!`, is a shared Comment with mark `%%`; it is not PieIgnoredText and does
not extend the PieDiagram range. The lexical rules for pie read from the
detection point; the bare `%%` lines and the whitespace and line breaks
detection passes with them are not read again. The whitespace and line breaks
are trivia. Such a bare line and its passed trivia can follow a retained form or
lie between retained forms; only the hidden forms belong to textBeforeHeader.
[fixture: pie/div-preheader-retained-directive-bare-bom] [fixture:
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
pie/lex-preheader-ls-without-bare-control] [fixture:
pie/comment-preheader-unclosed-percent-brace] [fixture:
pie/lex-bare-percent-braces-before-header] [fixture:
pie/lex-hidden-comment-before-header] [fixture:
pie/frontmatter-nonleading-comment] [fixture:
pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/lex-preheader-yaml-opening-nbsp] [fixture:
pie/lex-preheader-yaml-opening-bom] [fixture:
pie/lex-preheader-yaml-closing-nbsp] [fixture:
pie/lex-preheader-yaml-closing-u3000] [fixture:
pie/lex-preheader-yaml-after-closing-u3000-line] [fixture:
pie/lex-preheader-yaml-adjacent-fence-tail] [fixture:
pie/lex-preheader-yaml-empty-line-control] [fixture:
pie/lex-hidden-directive-second-detection-scan-glued]

PieBodyItem is PieSectionStatement, PieTitleStatement, PieAccTitleStatement,
PieAccDescrStatement, PieAccDescrBlockStatement or PieIgnoredText.
Empty/comment-only lines make no body item; comments use the shared Comment
records. All duplicate sections and repeated common statements remain separate.
[fixture: pie/db-all-fields] [fixture: pie/lex-section-blank-comment-directive]
[fixture: pie/db-three-definitions] [fixture: pie/title-repeat] [fixture:
pie/yaml-inline-after-title]

`showData` is true only for the written header keyword. If it is absent,
textBeforeShowData is empty and hidden forms after pie start body; hidden forms
after a written flag also start body. These fields preserve the authored
structure even where hidden forms consume physical line breaks. [fixture:
pie/showdata] [fixture: pie/review-hidden-directive-before-showdata] [fixture:
pie/review-yaml-before-showdata] [fixture: pie/frontmatter-after-header]
[fixture: pie/lex-yaml-after-showdata-before-first-section] [fixture:
pie/lex-yaml-after-showdata-eof] [fixture:
pie/lex-hidden-directive-with-second-hidden-token]

### PieSectionStatement

| Field             | Type                   | Meaning                                       |
| ----------------- | ---------------------- | --------------------------------------------- |
| `label`           | StringLiteral          | Written quoted label, including empty labels. |
| `textBeforeColon` | list of PieIgnoredText | Hidden forms before the colon.                |
| `textBeforeValue` | list of PieIgnoredText | Hidden forms after the colon.                 |
| `value`           | NumericLiteral         | Written section number.                       |
| `textAfter`       | list of PieIgnoredText | Hidden forms after the value, before EOL.     |

Child fields: `label`, `textBeforeColon`, `textBeforeValue`, `value`,
`textAfter`. Range: the opening label quote through the numeric value or the
last textAfter form, including the colon but excluding the EOL. A hidden form
after a visible EOL newline belongs to the diagram body instead. Each separately
recognized hidden form in a gap is one list item. [fixture:
pie/review-yaml-between-label-colon] [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/yaml-inline-after-title]
[fixture: pie/lex-yaml-before-colon-two-blocks] [fixture:
pie/lex-hidden-before-colon-lf] The three adjacent YAML fences between a colon
and its number are one textBeforeValue item. [fixture:
pie/lex-yaml-three-fences-before-value]

StringLiteral has the written content between its matching quotes, without
escape decoding; raw keeps the complete original quoted source, and closed is
true. NumericLiteral keeps the original spelling in raw and the shared double in
value, including negative zero and positive infinity. Both quote styles,
padding, entities, physical line endings and number precision are retained as
written. No Identifier is introduced for a numeric-looking label. [fixture:
pie/label-single-quote] [fixture: pie/label-escaped-quotes] [fixture:
pie/label-unknown-escapes] [fixture: pie/label-whitespace] [fixture:
pie/label-crlf] [fixture: pie/entity-single-quoted] [fixture:
pie/number-negative-zero] [fixture: pie/number-overflow] [fixture:
pie/number-decimal-leading-zero] [fixture: pie/review-number-fraction-precision]
[fixture: pie/db-numeric-label-order]

An empty quoted label with colon/number remains a section; duplicate labels
remain distinct nodes. Converting or suppressing duplicates is a Db operation
and does not replace this source list. [fixture: pie/label-empty] [fixture:
pie/review-label-empty-single] [fixture: pie/lex-empty-label-duplicate]
[fixture: pie/db-three-definitions] [fixture: pie/label-escaped-name-collision]

### PieTitleStatement

| Field       | Type                   | Meaning                  |
| ----------- | ---------------------- | ------------------------ |
| `value`     | PieLiteral or null     | Written common value.    |
| `textAfter` | list of PieIgnoredText | Hidden forms before EOL. |

The text after title and one ASCII space/tab, through its line-value end,
preserving remaining whitespace at both ends. Null when nothing follows that one
separator, or when title has no separator. [fixture: pie/title-spaces] [fixture:
pie/review-title-bare-lone-eof] [fixture: pie/lex-empty-title-vs-null-reference]
[fixture: pie/title-whitespace-last] [fixture: pie/title-comment] [fixture:
pie/ast-title-tab-null-eof] [fixture: pie/lex-title-tab-separator] [fixture:
pie/ast-common-values-directive-only] [fixture:
pie/lex-common-values-comment-region-ls]

Child fields: `value`, `textAfter`. Range: title through its last written value
character, or its keyword when value is null, extended through the last
textAfter form when present; exclude the EOL and unrelated outside padding. A
hidden form after a visible EOL newline instead belongs to the diagram body.
[fixture: pie/title-spaces] [fixture: pie/review-title-bare-lone-eof] [fixture:
pie/lex-empty-title-vs-null-reference] [fixture: pie/title-whitespace-last]
[fixture: pie/title-comment] [fixture: pie/review-hidden-directive-title-eof]

### PieAccTitleStatement

| Field       | Type                   | Meaning                  |
| ----------- | ---------------------- | ------------------------ |
| `value`     | PieLiteral or null     | Written common value.    |
| `textAfter` | list of PieIgnoredText | Hidden forms before EOL. |

The text immediately after the colon through its line-value end, as written,
with padding at both ends. Null only when that content is empty; whitespace-only
content is a literal. [fixture: pie/acctitle-spaces] [fixture: pie/acctitle-eof]
[fixture: pie/review-acctitle-whitespace-final] [fixture: pie/acctitle-comment]
[fixture: pie/ast-common-values-directive-only] [fixture:
pie/lex-common-values-comment-region-ls]

Child fields: `value`, `textAfter`. Range: accTitle through its colon or last
value character, extended through the last textAfter form when present; exclude
the EOL and unrelated outside padding. A hidden form after a visible EOL newline
instead belongs to the diagram body. [fixture: pie/acctitle-spaces] [fixture:
pie/acctitle-eof] [fixture: pie/review-acctitle-whitespace-final] [fixture:
pie/acctitle-comment] [fixture: pie/review-hidden-directive-acctitle-eof]

### PieAccDescrStatement

| Field       | Type                   | Meaning                  |
| ----------- | ---------------------- | ------------------------ |
| `value`     | PieLiteral or null     | Written common value.    |
| `textAfter` | list of PieIgnoredText | Hidden forms before EOL. |

The text immediately after the colon through its line-value end, as written,
with padding at both ends. Null only when that content is empty; whitespace-only
content is a literal. [fixture: pie/accdescr-spaces] [fixture: pie/accdescr-eof]
[fixture: pie/review-accdescr-whitespace-final] [fixture: pie/accdescr-comment]
[fixture: pie/ast-common-values-directive-only] [fixture:
pie/lex-common-values-comment-region-ls]

Child fields: `value`, `textAfter`. Range: accDescr through its colon or last
value character, extended through the last textAfter form when present; exclude
the EOL and unrelated outside padding. A hidden form after a visible EOL newline
instead belongs to the diagram body. [fixture: pie/accdescr-spaces] [fixture:
pie/accdescr-eof] [fixture: pie/review-accdescr-whitespace-final] [fixture:
pie/accdescr-comment] [fixture: pie/review-hidden-directive-accdescr-eof]

### PieAccDescrBlockStatement

| Field       | Type                   | Meaning                  |
| ----------- | ---------------------- | ------------------------ |
| `value`     | PieLiteral or null     | Written common value.    |
| `textAfter` | list of PieIgnoredText | Hidden forms before EOL. |

The brace interior without common whitespace at its ends. Null when only
whitespace, common directives and comment regions lie inside. Internal
whitespace, line endings, quotes and escapes remain written text. [fixture:
pie/accdescr-block] [fixture: pie/accdescr-block-unicode-trim] [fixture:
pie/accdescr-space-block-last] [fixture: pie/accdescr-empty-block-last]
[fixture: pie/directive-block-lines] [fixture: pie/accdescr-block-comment-lines]
[fixture: pie/review-block-quotes-backslashes] [fixture:
pie/gram-description-block-directive-only] [fixture:
pie/gram-description-block-comment-only]

Child fields: `value`, `textAfter`. Range: accDescr through its first closing
brace, extended through the last textAfter form when present; exclude the EOL
and unrelated outside padding. A hidden form after a visible EOL newline instead
belongs to the diagram body. [fixture: pie/accdescr-block] [fixture:
pie/accdescr-block-unicode-trim] [fixture: pie/accdescr-space-block-last]
[fixture: pie/accdescr-empty-block-last] [fixture: pie/directive-block-lines]
[fixture: pie/accdescr-block-comment-lines] [fixture:
pie/review-block-quotes-backslashes] [fixture:
pie/gram-description-block-directive-only] [fixture:
pie/gram-description-block-comment-only] [fixture:
pie/gram-block-eof-hidden-yaml]

The block must close, so no closed field is needed. Its empty form remains this
statement and can replace an earlier description assignment; it is not a free
ignored form between arbitrary units. [fixture: pie/accdescr-block-unclosed]
[fixture: pie/accdescr-empty-block-last] [fixture:
pie/lex-block-empty-followed-inline]

### PieLiteral

| Field   | Type   | Meaning                           |
| ------- | ------ | --------------------------------- |
| `value` | string | Written text of the common value. |

No child fields. Range: from the first through the last source character of the
value defined above, spanning any internal common trivia; do not create an empty
literal for null. Leave common directives, comment regions and selected
semicolons out of value, but retain all other source characters. Quote-looking
text remains PieLiteral rather than StringLiteral. [fixture: pie/title-spaces]
[fixture: pie/acctitle-eof] [fixture: pie/accdescr-block] [fixture:
pie/directive-title-middle] [fixture: pie/accdescr-block-comment-lines]
[fixture: pie/style-acctitle-trigger] [fixture:
pie/review-common-quotes-backslashes]

### PieIgnoredText

| Field   | Type   | Meaning                                          |
| ------- | ------ | ------------------------------------------------ |
| `kind`  | string | yaml-block or directive.                         |
| `value` | string | Nonempty written ignored form, including fences. |

No child fields. Range: the recognized `---` or `%%{` opener through its closing
fence, excluding optional preceding ASCII padding and the LF that the lexical
rule consumes after the closer. Internal line endings and padding belong to its
written text. The appended LF never enters a range or value. [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/review-directive-hidden-crlf] [fixture:
pie/review-directive-hidden-space-boundary] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-yaml-body-unicode-separators] [fixture:
pie/lex-hidden-body-unicode-separators] [fixture:
pie/lex-hidden-directive-lone-cr]

Choose the YAML closer by the body-present priority in
[Hidden YAML](../diagrams/pie.md#hidden-yaml): an apparent immediate closer may
belong to the leaf's value instead. Three adjacent fence lines make one leaf,
including the middle fence. [fixture: pie/lex-yaml-three-adjacent-fences]
[fixture: pie/lex-yaml-immediate-fence-before-later-closer] A retained
pre-header block with three adjacent fences is one textBeforeHeader item.
[fixture: pie/lex-nonleading-yaml-three-adjacent-fences]

Use kind yaml-block for each hidden YAML occurrence and directive for each
hidden DIRECTIVE occurrence. Empty bodies remain nonempty ignored leaves because
their fences are written. Leave common directives, comment regions and selected
semicolons out of value; the source range still spans them. These nodes have no
YAML properties or configuration effect of their own. A recognized global
directive inside them retains its common effect. [fixture:
pie/review-yaml-hidden-empty] [fixture: pie/review-directive-empty-body]
[fixture: pie/lex-yaml-body-directive-content] [fixture:
pie/lex-yaml-body-comment-content] [fixture:
pie/lex-yaml-opener-selected-semicolon] [fixture:
pie/lex-hidden-body-global-directive] [fixture:
pie/lex-yaml-leading-config-not-applied] [fixture: pie/frontmatter-after-header]
[fixture: pie/lex-hidden-global-comment-region] [fixture:
pie/lex-hidden-opener-selected-semicolon] [fixture:
pie/lex-hidden-closer-selected-semicolon] [fixture:
pie/lex-hidden-closer-global-directive]

Own each hidden form in the named gap, before-header list or body position
described above, without a second copy elsewhere. An already-started string or
description block encloses hidden-looking text as content. A line value ends
before the first `%%`: a hidden DIRECTIVE starting there belongs to that
statement's textAfter, while YAML-looking text already read by the line value
remains content. A fallback diagram comment is a shared Comment rather than
PieIgnoredText. Keeping the skipped text is possible, so these forms do not
justify rejection as a divergence. [fixture:
pie/review-yaml-between-label-colon] [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/frontmatter-nonleading-comment] [fixture:
pie/review-hidden-directive-before-showdata] [fixture:
pie/review-hidden-directive-in-string] [fixture:
pie/review-block-hidden-yaml-text] [fixture:
pie/lex-hidden-comment-fallback-no-boundary] [fixture:
pie/review-hidden-directive-title-eof] [fixture:
pie/review-hidden-directive-acctitle-eof] [fixture:
pie/review-hidden-directive-accdescr-eof] [fixture: pie/lex-yaml-in-title-line]
