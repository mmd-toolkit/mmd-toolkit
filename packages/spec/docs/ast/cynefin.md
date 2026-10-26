# Cynefin nodes

Japanese version: [cynefin.ja.md](./cynefin.ja.md)

This defines Cynefin’s authored tree; [ast.md](../ast.md) defines shared nodes
and invariants, and [the syntax](../diagrams/cynefin.md) defines acceptance.
Optional fields remain present as null, absent lists are empty, and every list
preserves source order. Each table independently defines one node; child fields
give visitor order. [fixture: cynefin/db-all-fields] [fixture:
cynefin/db-empty-texts] [fixture: cynefin/common-repeat-empty]

A domain word is one of a fixed set, so name/from/to are plain strings, not
Identifier nodes. Item and transition-label positions allow only quoted strings
and use shared StringLiteral: raw retains the exact whole source including
quotes and common trivia, value retains the unconverted interior outside common
removals, and closed is true. No domain-name node, numeric leaf or synthesized
effective declaration is added. [fixture: cynefin/db-all-fields] [fixture:
cynefin/lex-string-conversion] [fixture:
cynefin/lex-transition-string-conversion] [fixture:
cynefin/directive-every-field] [fixture: cynefin/db-empty-texts]

Every textBefore/textAfter field below is a list of whole CynefinIgnoredText
nodes, excluding whitespace, shared Comments and global Directives. Each hidden
match has exactly one owner. A consumed following line break lies outside its
own ignored-node range. Enclosing ranges can span internal source padding and
line endings; unrelated outer padding and visible EOL do not extend them.
[fixture: cynefin/hidden-all-unit-gaps] [fixture:
cynefin/hidden-domain-item-members] [fixture: cynefin/hidden-directive-cr]
[fixture: cynefin/hidden-directive-crlf] [fixture: cynefin/hidden-yaml-bare-cr]

## Nodes

### CynefinDiagram

| Field              | Type                       | Meaning                                     |
| ------------------ | -------------------------- | ------------------------------------------- |
| `textBeforeHeader` | list of CynefinIgnoredText | Retained native forms before the header.    |
| `body`             | list of CynefinBodyItem    | Every statement and body-owned hidden form. |

Child fields: textBeforeHeader, body. Range: the first retained pre-header form,
or the header when none, through the last written header/body form.
Root.diagramType is cynefin; neither header spelling introduces a separate
header or alias node. Both lists can be empty. [fixture: cynefin/header-only]
[fixture: cynefin/header-colon] [fixture:
cynefin/detect-real-before-retained-secondscan] [fixture: cynefin/db-all-fields]

CynefinBodyItem is CynefinDomainStatement, CynefinTransitionStatement,
CynefinTitleStatement, CynefinAccTitleStatement, CynefinAccDescrStatement,
CynefinAccDescrBlockStatement or CynefinIgnoredText. Keep every occurrence,
including self transitions, replaced/empty blocks and empty common statements.
Blank or comment-only lines add no body item. [fixture: cynefin/db-self-loops]
[fixture: cynefin/db-domain-duplicates] [fixture: cynefin/gram-domain-empty-eof]
[fixture: cynefin/common-repeat-empty] [fixture:
cynefin/hidden-header-after-visible-eol] [fixture: cynefin/space-lines]
[fixture: cynefin/comment-native-between-items]

textBeforeHeader owns retained YAML and genuine second-scan directives at their
native boundaries. Detection-passed bare lines are shared Comments and
accompanying passed whitespace/line breaks are trivia, also between retained
forms. After the header, forms before a statement or after its visible EOL
belong to body, except item-leading forms owned as below. [fixture:
cynefin/detect-real-before-retained-secondscan] [fixture:
cynefin/detect-retained-secondscan-bare-ascii] [fixture:
cynefin/prefix-two-secondscans] [fixture:
cynefin/hidden-header-after-visible-eol] [fixture:
cynefin/hidden-domain-end-after-visible-eol] [fixture:
cynefin/hidden-after-visible-eol] [fixture:
cynefin/hidden-common-after-visible-eol]

### CynefinDomainStatement

| Field           | Type                       | Meaning                                            |
| --------------- | -------------------------- | -------------------------------------------------- |
| `name`          | string                     | complex, complicated, clear, chaotic or confusion. |
| `textAfterName` | list of CynefinIgnoredText | Native forms immediately after the name.           |
| `items`         | list of CynefinDomainItem  | Every written item in this block.                  |

Child fields: textAfterName, items; name is not a child. Range: the domain word
through the last item, or through the last textAfterName form when items is
empty, or just the domain word when both lists are empty. Items may start on the
same line or after visible newlines. An empty block is still a statement; each
repeated declaration keeps its own list, including duplicates. [fixture:
cynefin/db-all-fields] [fixture: cynefin/gram-adjacent-items] [fixture:
cynefin/gram-domain-empty-eof] [fixture: cynefin/hidden-domain-empty-suffix]
[fixture: cynefin/gram-item-duplicates] [fixture: cynefin/db-domain-duplicates]

textAfterName ends at the first visible LF, next item, next statement or end of
text, whichever comes first. Hidden consumption is decided before locating that
LF. If visible LF precedes the first actual item in this block, subsequent
native forms belong to that item’s textBefore; without such an item they belong
to Diagram.body. [fixture: cynefin/hidden-domain-item-members] [fixture:
cynefin/hidden-domain-empty-suffix] [fixture:
cynefin/hidden-before-first-item-after-eol] [fixture:
cynefin/hidden-empty-domain-after-visible-eol] [fixture:
cynefin/hidden-after-domain]

### CynefinDomainItem

| Field        | Type                       | Meaning                                                   |
| ------------ | -------------------------- | --------------------------------------------------------- |
| `textBefore` | list of CynefinIgnoredText | Item-leading forms after a visible LF.                    |
| `label`      | StringLiteral              | Required authored quoted label.                           |
| `textAfter`  | list of CynefinIgnoredText | Forms after the label before visible LF or the next unit. |

Child fields: textBefore, label, textAfter. Range: the first textBefore form, or
the string opener without one, through the last textAfter form, or the string
closer without one. label is never null, including an empty string; raw and the
shared closed field preserve its quoted form. The two lists can be empty.
Adjacent strings remain separate items. [fixture:
cynefin/hidden-domain-item-members] [fixture:
cynefin/hidden-item-after-visible-eol] [fixture:
cynefin/hidden-before-first-item-after-eol] [fixture:
cynefin/gram-adjacent-items] [fixture: cynefin/db-empty-texts] [fixture:
cynefin/lex-string-conversion]

textAfter owns forms before the next item/statement or first visible LF. After
that LF, forms before a next item of the same block belong to the next item’s
textBefore; if the block has no next item they belong to Diagram.body. Comments,
blank lines, removed directives and selected semicolons do not manufacture an
item or close its sequence. [fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-item-after-visible-eol] [fixture:
cynefin/hidden-domain-end-after-visible-eol] [fixture:
cynefin/gram-items-directive-line] [fixture:
cynefin/gram-items-selected-semicolon] [fixture:
cynefin/gram-items-comment-line] [fixture: cynefin/gram-items-blank-line]

### CynefinTransitionStatement

| Field             | Type                       | Meaning                                                     |
| ----------------- | -------------------------- | ----------------------------------------------------------- |
| `from`            | string                     | Required fixed domain word.                                 |
| `textBeforeArrow` | list of CynefinIgnoredText | Forms between from and arrow.                               |
| `arrow`           | CynefinArrow               | Required whole arrow.                                       |
| `textBeforeTo`    | list of CynefinIgnoredText | Forms between arrow and to.                                 |
| `to`              | string                     | Required fixed domain word.                                 |
| `textBeforeColon` | list of CynefinIgnoredText | Forms before a written label colon.                         |
| `textBeforeLabel` | list of CynefinIgnoredText | Forms between colon and string.                             |
| `label`           | StringLiteral or null      | Written label, including empty, or absent.                  |
| `textAfter`       | list of CynefinIgnoredText | Forms after the last visible component, before visible EOL. |

Child fields: textBeforeArrow, arrow, textBeforeTo, textBeforeColon,
textBeforeLabel, label, textAfter. from and to are each complex, complicated,
clear, chaotic or confusion and are not children. Range: from through the last
textAfter form, otherwise through the label’s closer or, without a label,
through to. The required EOL is outside the range. [fixture:
cynefin/db-all-fields] [fixture: cynefin/hidden-all-unit-gaps] [fixture:
cynefin/hidden-unlabeled-transition-gaps] [fixture:
cynefin/hidden-two-transition-suffixes]

label is null only when the whole colon-and-string pair is absent. Then
textBeforeColon and textBeforeLabel are empty and all native forms after to
belong to textAfter. With a label, preserve each named gap and a non-null empty
StringLiteral for : "" or : ''. Keep self transitions, undeclared endpoints and
duplicate transitions as authored statements. [fixture:
cynefin/hidden-unlabeled-transition-gaps] [fixture:
cynefin/hidden-two-transition-suffixes] [fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/db-empty-texts] [fixture: cynefin/db-self-loops] [fixture:
cynefin/gram-transition-first] [fixture: cynefin/db-transition-duplicates]

### CynefinArrow

| Field         | Type   | Meaning                           |
| ------------- | ------ | --------------------------------- |
| `value`       | string | -->, the complete authored glyph. |
| `startMarker` | string | none.                             |
| `line`        | string | solid.                            |
| `endMarker`   | string | arrow.                            |

Child fields: none. Range: the first dash through >. The four fields are always
present with these fixed values; no kind field or nullable marker is added.
Hidden forms before and after the whole arrow belong to its transition, not the
arrow. [fixture: cynefin/db-all-fields] [fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/hidden-unlabeled-transition-gaps]

### CynefinTitleStatement

| Field       | Type                       | Meaning                                 |
| ----------- | -------------------------- | --------------------------------------- |
| `value`     | CynefinLiteral or null     | Authored title value, or empty.         |
| `textAfter` | list of CynefinIgnoredText | Native suffix forms before visible EOL. |

Child fields: value, textAfter. Range: title through its last value character,
or keyword when null, extended through textAfter. When value is null and
textAfter is empty, a single separator space/tab is ordinary whitespace outside
the range. The required EOL is outside the range. textAfter can be empty; a form
after visible EOL belongs to Diagram.body. Every repeated occurrence remains a
statement. [fixture: cynefin/hidden-title-suffix] [fixture:
cynefin/hidden-common-after-visible-eol] [fixture:
cynefin/common-title-comment-only] [fixture:
cynefin/common-title-directive-only] [fixture: cynefin/lex-title-one-space]
[fixture: cynefin/lex-title-one-tab] [fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/common-line-whitespace]

After title, exactly one ASCII space/tab, if present, is the separator, outside
value. No remainder means null, including a bare keyword or one separator alone.
Additional authored padding belongs to a non-null literal. [fixture:
cynefin/lex-title-one-space] [fixture: cynefin/lex-title-one-tab] [fixture:
cynefin/lex-title-two-spaces] [fixture: cynefin/common-title-eof] [fixture:
cynefin/common-line-whitespace]

### CynefinAccTitleStatement

| Field       | Type                       | Meaning                                 |
| ----------- | -------------------------- | --------------------------------------- |
| `value`     | CynefinLiteral or null     | Authored accTitle: value, or empty.     |
| `textAfter` | list of CynefinIgnoredText | Native suffix forms before visible EOL. |

Child fields: value, textAfter. Range: the accTitle keyword through the last
value character, or through the required colon when value is null, extended
through the last textAfter form when present. The required EOL is outside the
range. textAfter can be empty; a form after visible EOL belongs to Diagram.body.
Every repeated occurrence remains a statement. [fixture:
cynefin/hidden-acctitle-suffix] [fixture: cynefin/common-repeat-empty] [fixture:
cynefin/common-line-whitespace]

value begins immediately after the colon, including all following authored
padding. Only no remaining characters gives null; a whitespace-only remainder is
a non-null literal. Quotes are ordinary value characters. [fixture:
cynefin/lex-common-whitespace-literals] [fixture: cynefin/common-repeat-empty]
[fixture: cynefin/common-line-whitespace] [fixture:
cynefin/common-quoted-values]

### CynefinAccDescrStatement

| Field       | Type                       | Meaning                                 |
| ----------- | -------------------------- | --------------------------------------- |
| `value`     | CynefinLiteral or null     | Authored accDescr: value, or empty.     |
| `textAfter` | list of CynefinIgnoredText | Native suffix forms before visible EOL. |

Child fields: value, textAfter. Range: the accDescr keyword through the last
value character, or through the required colon when value is null, extended
through the last textAfter form when present. The required EOL is outside the
range. textAfter can be empty; a form after visible EOL belongs to Diagram.body.
Every repeated occurrence remains a statement. [fixture:
cynefin/hidden-description-suffix] [fixture: cynefin/common-repeat-empty]
[fixture: cynefin/common-line-whitespace]

value begins immediately after the colon and includes all following authored
padding. No remaining characters gives null; whitespace-only text is a non-null
literal. Braces following a colon are line-value text, not a block. [fixture:
cynefin/lex-common-whitespace-literals] [fixture: cynefin/common-repeat-empty]
[fixture: cynefin/common-line-whitespace] [fixture:
cynefin/common-colon-block-priority]

### CynefinAccDescrBlockStatement

| Field       | Type                       | Meaning                                 |
| ----------- | -------------------------- | --------------------------------------- |
| `value`     | CynefinLiteral or null     | Authored accDescr {…} value, or empty.  |
| `textAfter` | list of CynefinIgnoredText | Native suffix forms before visible EOL. |

Child fields: value, textAfter. Range: the accDescr keyword through the closing
brace, extended through the last textAfter form when present. The required EOL
is outside the range. textAfter can be empty; a form after visible EOL belongs
to Diagram.body. Every repeated occurrence remains a statement. [fixture:
cynefin/hidden-block-suffix] [fixture: cynefin/common-empty-interleaved]
[fixture: cynefin/common-block-whitespace]

value is the authored text inside the braces with common whitespace trimmed only
at its outer ends. Empty, whitespace-only, or common-removal-only bodies give
null. Internal indentation and line endings stay unchanged. The closing brace is
required; no closed field is added. [fixture: cynefin/common-empty-interleaved]
[fixture: cynefin/lex-common-whitespace-literals] [fixture:
cynefin/common-block-whitespace] [fixture: cynefin/common-block-comment-only]
[fixture: cynefin/common-block-directive-only] [fixture:
cynefin/line-block-values]

### CynefinLiteral

| Field   | Type   | Meaning                                                    |
| ------- | ------ | ---------------------------------------------------------- |
| `value` | string | Unconverted authored common value outside common removals. |

Child fields: none. Range: exactly the retained authored common value, including
line padding after the title separator or accessibility colon; for a block, from
its first through last non-common-whitespace character. Preserve interior
spacing, indentation, source line endings, quotes, backslashes and entity
spelling. Common removals lie in the source range but not value. A literal is
never empty; the parent’s value is null instead. A whitespace-only line literal
is nonempty. [fixture: cynefin/lex-title-two-spaces] [fixture:
cynefin/lex-common-whitespace-literals] [fixture:
cynefin/common-line-whitespace] [fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-quoted-values] [fixture: cynefin/line-common-values]
[fixture: cynefin/line-block-values] [fixture: cynefin/directive-every-field]
[fixture: cynefin/entity-texts]

### CynefinIgnoredText

| Field   | Type   | Meaning                                              |
| ------- | ------ | ---------------------------------------------------- |
| `kind`  | string | yaml-block or directive.                             |
| `value` | string | Authored whole native match outside common removals. |

Child fields: none. Range: the opening three dashes or %%{ through its
qualifying closing fence, excluding opener padding and an immediately consumed
following CR/LF sequence. value preserves the same authored delimiters and
internal source line endings, excluding common removals. Both forms must close;
there is no closed field or nullable value. Several apparent fences can be one
native match and one node; two nonempty YAML blocks can be separate nodes.
[fixture: cynefin/hidden-directive-adjacent] [fixture:
cynefin/hidden-yaml-adjacent-later] [fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-yaml-opener-padding] [fixture:
cynefin/hidden-directive-cr] [fixture: cynefin/hidden-directive-crlf] [fixture:
cynefin/hidden-yaml-bare-cr] [fixture: cynefin/hidden-yaml-common-directive]
[fixture: cynefin/hidden-yaml-comment-region] [fixture:
cynefin/hidden-native-directive-opener-raw]

Only successful native-yaml and native-directive matches make this node. They
never become embedded settings. A failed directive-shaped match can instead be a
shared Comment, while a later genuine YAML block still makes CynefinIgnoredText.
Global directives remain Root.directives. [fixture:
cynefin/hidden-directive-comment-fallback-kept] [fixture:
cynefin/detect-retained-yaml-properties] [fixture:
cynefin/hidden-yaml-common-directive] [fixture:
cynefin/hidden-native-directive-opener-raw]

## Ownership of hidden forms

Decide native consumption before locating visible LF. The following ownership
rules apply to whole matches, in source order, and introduce no
whitespace/comment nodes. Enclosing statements span their members; consumed line
endings are outside the ignored node even when spanned by its enclosing
statement. [fixture: cynefin/hidden-domain-item-members] [fixture:
cynefin/hidden-item-after-visible-eol] [fixture:
cynefin/hidden-domain-end-after-visible-eol] [fixture:
cynefin/hidden-directive-cr] [fixture:
cynefin/hidden-before-first-item-after-eol] [fixture:
cynefin/hidden-empty-domain-after-visible-eol] [fixture:
cynefin/hidden-all-unit-gaps]

| Position of a whole native form                                  | Owner                         |
| ---------------------------------------------------------------- | ----------------------------- |
| Before the header                                                | Diagram.textBeforeHeader      |
| After the header or before a statement                           | Diagram.body                  |
| After domain name, before first visible LF or next visible unit  | DomainStatement.textAfterName |
| After that visible LF, before an actual first item of that block | First DomainItem.textBefore   |
| After an item, before first visible LF or next item/statement    | That DomainItem.textAfter     |
| After that LF, before another item of the same block             | Next DomainItem.textBefore    |
| After last item’s visible LF, or empty domain’s LF with no item  | Diagram.body                  |
| Within a transition                                              | Its named gap or textAfter    |
| After common value/block, before first visible LF                | Common statement.textAfter    |
| After transition/common statement’s visible EOL                  | Diagram.body                  |

Thus forms on a last item’s line stay with that item even before a new domain;
after visible LF they move to the next same-block item only when that item
exists. Empty domains retain their immediate suffix but do not claim later body
forms. A suffix after an unlabeled transition target is textAfter, never a
hypothetical label gap. A suffix after a common line is owned before EOL; after
visible EOL it is a body item. [fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-domain-empty-suffix] [fixture:
cynefin/hidden-item-after-visible-eol] [fixture:
cynefin/hidden-domain-end-after-visible-eol] [fixture:
cynefin/hidden-unlabeled-transition-gaps] [fixture:
cynefin/hidden-two-transition-suffixes] [fixture:
cynefin/hidden-before-first-item-after-eol] [fixture:
cynefin/hidden-empty-domain-after-visible-eol] [fixture:
cynefin/hidden-title-suffix] [fixture: cynefin/hidden-acctitle-suffix] [fixture:
cynefin/hidden-description-suffix] [fixture: cynefin/hidden-block-suffix]
[fixture: cynefin/hidden-common-after-visible-eol] [fixture:
cynefin/hidden-after-visible-eol]

## Example

This adjacent-item input has one CynefinDomainStatement with two
CynefinDomainItem children. Each item owns its own StringLiteral; both gap lists
are empty. No extra separator or effective item is synthesized. [fixture:
cynefin/gram-adjacent-items]

```mmd
cynefin-beta
complex"A"'B'
```
