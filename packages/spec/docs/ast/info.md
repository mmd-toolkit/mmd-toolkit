# Info nodes

Japanese version: [info.ja.md](./info.ja.md)

This document defines the source tree for `info`; [ast.md](../ast.md) defines
the shared tree and [diagrams/info.md](../diagrams/info.md) defines syntax and
acceptance. Fields keep authored values. Optional values are present as null,
absent lists are empty, and lists preserve source order. Child fields give
visitor order. [fixture: info/header-lf] [fixture: info/common-all] [fixture:
info/common-flag-all] [fixture: info/title-repeat-empty] [fixture:
info/acctitle-repeat-empty] [fixture: info/accdescr-line-repeat] [fixture:
info/accdescr-block-repeat]

## Nodes

### InfoDiagram

| Field                | Type                    | Meaning                              |
| -------------------- | ----------------------- | ------------------------------------ |
| `showInfo`           | boolean                 | Whether the flag is written.         |
| `textBeforeHeader`   | list of InfoIgnoredText | Retained forms before info.          |
| `textBeforeShowInfo` | list of InfoIgnoredText | Forms before a written flag.         |
| `body`               | list of InfoBodyItem    | Written statements and hidden forms. |

Child fields: `textBeforeHeader`, `textBeforeShowInfo`, `body`. Range: the first
retained pre-header form, or info if none, through the last written
header/flag/body form; exclude unrelated outside padding. The fixed header is a
keyword, not a separate node. No effective-title or version field is
synthesized. [fixture: info/header-lf] [fixture: info/header-inline-flag]
[fixture: info/common-all] [fixture: info/frontmatter-nonleading-comment]
[fixture: info/detect-second-scan-directive]

textBeforeHeader owns native hidden forms retained from the detection point.
Passed bare lines, including percent-brace forms, are shared Comments and do not
extend this range; accompanying passed whitespace/line breaks are trivia and are
not read again. This also applies when passed trivia lies between retained
forms. Native hidden boundaries still decide acceptance. [fixture:
info/frontmatter-nonleading-comment] [fixture:
info/detect-second-scan-directive] [fixture:
info/lex-detect-preheader-empty-braces] [fixture:
info/lex-detect-preheader-open-brace] [fixture:
info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive] [fixture:
info/lex-detect-yaml-bare-directive-ascii] [fixture:
info/lex-preheader-closer-u3000]

showInfo is true only when the flag keyword is written. When true, all hidden
forms between info and the flag belong to textBeforeShowInfo, even across
visible newlines. Without a written flag that list is empty and those
post-header forms start body. Hidden forms after the flag also start body.
Comments are never duplicated there. [fixture: info/header-lf] [fixture:
info/header-inline-flag] [fixture: info/header-flag-next-line] [fixture:
info/hidden-directive-body] [fixture: info/hidden-yaml-body] [fixture:
info/lex-flag-hidden-two] [fixture: info/lex-hidden-without-flag] [fixture:
info/hidden-directive-flag-next-common] [fixture: info/hidden-yaml-after-flag]
[fixture: info/hidden-directive-close-glued]

InfoBodyItem is InfoTitleStatement, InfoAccTitleStatement,
InfoAccDescrStatement, InfoAccDescrBlockStatement or InfoIgnoredText. Keep all
repeated and empty statements, even though no common value is published by info.
Empty/comment-only lines make no body item. A visible EOL before a hidden form
makes it a body item rather than the preceding statement's suffix. [fixture:
info/common-all] [fixture: info/common-blank-lines] [fixture:
info/title-repeat-empty] [fixture: info/acctitle-repeat-empty] [fixture:
info/accdescr-line-repeat] [fixture: info/accdescr-block-repeat] [fixture:
info/comment-bare-body] [fixture: info/lex-hidden-after-visible-eol] [fixture:
info/hidden-yaml-between-common]

### InfoTitleStatement

| Field       | Type                    | Meaning                   |
| ----------- | ----------------------- | ------------------------- |
| `value`     | InfoLiteral or null     | Written common value.     |
| `textAfter` | list of InfoIgnoredText | Hidden suffix before EOL. |

value is the text after title and exactly one ASCII space/tab through its
line-value end, preserving all remaining padding. It is null when no separator
or no content follows; a second separator is a whitespace literal. Common
directives alone can leave null content. [fixture: info/title-empty] [fixture:
info/title-tabs] [fixture: info/lex-title-one-space] [fixture:
info/lex-title-one-tab] [fixture: info/lex-title-two-spaces] [fixture:
info/lex-title-directive-only]

Child fields: `value`, `textAfter`. Range: title through its last value
character, or the keyword for null, extended through the last textAfter form.
Exclude EOL and unrelated outside padding. Hidden forms before the first visible
EOL belong to textAfter; after that EOL they belong to body. Keep separate
occurrences, including empty and repeated statements. A native comment is a
shared Comment, not a hidden suffix. [fixture: info/title-empty] [fixture:
info/title-tabs] [fixture: info/lex-title-one-space] [fixture:
info/lex-title-one-tab] [fixture: info/lex-title-two-spaces] [fixture:
info/lex-title-directive-only] [fixture: info/hidden-directive-title-eof]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoAccTitleStatement

| Field       | Type                    | Meaning                   |
| ----------- | ----------------------- | ------------------------- |
| `value`     | InfoLiteral or null     | Written common value.     |
| `textAfter` | list of InfoIgnoredText | Hidden suffix before EOL. |

value is the text immediately after the colon through its line-value end,
preserving padding at both ends. It is null only when no content remains after
common trivia is left out; whitespace-only content is a literal. [fixture:
info/acctitle-empty] [fixture: info/acctitle-gap] [fixture:
info/acctitle-repeat-empty] [fixture: info/lex-acctitle-directive-only]

Child fields: `value`, `textAfter`. Range: accTitle through its colon or last
value character, extended through the last textAfter form. Exclude EOL and
unrelated outside padding. Hidden forms before the first visible EOL belong to
textAfter; after that EOL they belong to body. Keep separate occurrences,
including empty and repeated statements. A native comment is a shared Comment,
not a hidden suffix. [fixture: info/acctitle-empty] [fixture: info/acctitle-gap]
[fixture: info/acctitle-repeat-empty] [fixture:
info/lex-acctitle-directive-only] [fixture: info/hidden-directive-acctitle-eof]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoAccDescrStatement

| Field       | Type                    | Meaning                   |
| ----------- | ----------------------- | ------------------------- |
| `value`     | InfoLiteral or null     | Written common value.     |
| `textAfter` | list of InfoIgnoredText | Hidden suffix before EOL. |

value is the line text immediately after the colon through its line-value end,
preserving padding at both ends. It is null only when no content remains after
common trivia is left out; whitespace-only content is a literal. A brace-looking
value after the colon remains this line form. [fixture:
info/accdescr-line-empty] [fixture: info/accdescr-line-repeat] [fixture:
info/lex-accdescr-directive-only] [fixture: info/lex-accdescr-line-whitespace]
[fixture: info/lex-block-colon-first]

Child fields: `value`, `textAfter`. Range: accDescr through its colon or last
value character, extended through the last textAfter form. Exclude EOL and
unrelated outside padding. Hidden forms before the first visible EOL belong to
textAfter; after that EOL they belong to body. Keep separate occurrences,
including empty and repeated statements. A native comment is a shared Comment,
not a hidden suffix. [fixture: info/accdescr-line-empty] [fixture:
info/accdescr-line-repeat] [fixture: info/lex-accdescr-directive-only] [fixture:
info/lex-accdescr-line-whitespace] [fixture: info/lex-block-colon-first]
[fixture: info/hidden-directive-accdescr-eof] [fixture:
info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoAccDescrBlockStatement

| Field       | Type                    | Meaning                   |
| ----------- | ----------------------- | ------------------------- |
| `value`     | InfoLiteral or null     | Written common value.     |
| `textAfter` | list of InfoIgnoredText | Hidden suffix before EOL. |

value is the brace interior with common whitespace removed only at its outer
ends. It is null for whitespace/common-directive/comment-region-only content.
Internal indentation, source line endings, bare percent lines, quotes and
backslashes stay written text. The first closing brace is required, so no closed
field is needed. An empty block is still this statement. [fixture:
info/accdescr-block-empty] [fixture: info/space-block-interior] [fixture:
info/accdescr-block-quoted] [fixture: info/comment-bare-block] [fixture:
info/lex-block-directive-only] [fixture: info/lex-block-comment-only] [fixture:
info/lex-block-whitespace-only] [fixture: info/accdescr-block-open]

Child fields: `value`, `textAfter`. Range: accDescr through its first closing
brace, extended through the last textAfter form. Exclude EOL and unrelated
outside padding. Hidden forms before the first visible EOL belong to textAfter;
after that EOL they belong to body. Keep separate occurrences, including empty
and repeated statements. A native comment is a shared Comment, not a hidden
suffix. [fixture: info/accdescr-block-empty] [fixture:
info/space-block-interior] [fixture: info/accdescr-block-quoted] [fixture:
info/comment-bare-block] [fixture: info/lex-block-directive-only] [fixture:
info/lex-block-comment-only] [fixture: info/lex-block-whitespace-only] [fixture:
info/accdescr-block-open] [fixture: info/hidden-directive-block-eof] [fixture:
info/hidden-yaml-block-eof] [fixture: info/lex-hidden-after-visible-eol]
[fixture: info/comment-after-block]

### InfoLiteral

| Field   | Type   | Meaning                    |
| ------- | ------ | -------------------------- |
| `value` | string | Written common-value text. |

No child fields. Range: the first through last source character of the value
defined by its statement, spanning internal common trivia. Do not create an
empty literal for null. Leave out common directives, comment regions and
selected semicolons, but preserve all remaining source characters, including
line endings, attribute quotes, entities and escape spelling. Quote-looking text
stays InfoLiteral rather than StringLiteral; it need not close its quotes. No
whitespace collapse or escape decoding is applied. [fixture: info/title-tabs]
[fixture: info/title-open-quote] [fixture: info/title-double-quotes] [fixture:
info/directive-title-value] [fixture: info/directive-block-value] [fixture:
info/comment-block] [fixture: info/lex-line-comment-region-ls] [fixture:
info/style-title] [fixture: info/html-all-common] [fixture: info/line-crlf]
[fixture: info/space-block-interior] [fixture: info/lex-title-one-tab]

### InfoIgnoredText

| Field   | Type   | Meaning                                  |
| ------- | ------ | ---------------------------------------- |
| `kind`  | string | yaml-block or directive.                 |
| `value` | string | Nonempty written form, including fences. |

No child fields. Range: the `---` or `%%{` opener through its qualifying closer,
excluding preceding ASCII padding and the LF consumed immediately after the
closer. Internal source line endings and padding remain. The appended LF never
enters a source range or value. Both forms must close, so no closed field is
needed; empty bodies still make nonempty fenced values. [fixture:
info/hidden-yaml-empty] [fixture: info/hidden-yaml-open-padding] [fixture:
info/hidden-directive-padding] [fixture:
info/hidden-directive-nonqualifying-closer] [fixture: info/hidden-directive-cr]
[fixture: info/hidden-directive-crlf] [fixture: info/hidden-yaml-cr] [fixture:
info/hidden-yaml-crlf] [fixture: info/hidden-directive-title-eof] [fixture:
info/hidden-yaml-block-eof] [fixture: info/lex-yaml-body-separators] [fixture:
info/lex-hidden-body-separators]

Leave common directives, comment regions and selected semicolons out of value;
its source range still spans them. The whole hidden form supplies no
frontmatter/configuration of its own. A recognized global directive inside it
retains that directive's independent common effect. Failed directive-like forms
are shared Comments, not these nodes. Already-started line/block values own
enclosed hidden-looking text. [fixture: info/hidden-yaml-config-ignored]
[fixture: info/lex-hidden-nested-global] [fixture: info/lex-yaml-common-comment]
[fixture: info/lex-hidden-common-comment] [fixture:
info/lex-yaml-fences-selected] [fixture: info/lex-hidden-opener-selected]
[fixture: info/lex-hidden-closer-selected] [fixture:
info/hidden-directive-close-glued] [fixture: info/hidden-yaml-inside-block]
[fixture: info/hidden-yaml-after-title] [fixture:
info/hidden-directive-block-first-brace]

Each whole match has exactly one owner: textBeforeHeader, textBeforeShowInfo,
body or a statement's textAfter. Do not duplicate it in
Root.frontmatter/directives. Body-present YAML priority can make three adjacent
fences one match rather than an empty form plus another opener; two nonempty
blocks can remain separate. The [lexical rules](../diagrams/info.md#hidden-yaml)
determine that extent. [fixture: info/frontmatter-nonleading-comment] [fixture:
info/hidden-yaml-body] [fixture: info/lex-hidden-without-flag] [fixture:
info/lex-hidden-tail-two] [fixture: info/lex-yaml-three-fences] [fixture:
info/lex-yaml-empty-then-content] [fixture: info/lex-yaml-two-before-flag]
