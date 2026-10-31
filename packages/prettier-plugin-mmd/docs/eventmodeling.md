# Eventmodeling formatting

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

Formatting rules for `eventmodeling`, following its
[syntax](../../spec/docs/diagrams/eventmodeling.md),
[authored tree](../../spec/docs/ast/eventmodeling.md) and shared
[compatibility limits](./compatibility.md).

The printer uses the shared factory, blocks, atoms and hidden-gap path. GWT uses
two range-ended child bodies without synthesized closers. Common-terminal and
data boundaries constrain the line and indentation plan before it is printed.

## Rules

### Header

Keep `eventmodeling` at column one and move an ordinary first statement to the
next line, making the header easy to find. Hidden forms, retained prefixes and
protected lines use their shared rules: when the header line is kept, its first
statement stays on that line. This gives diagram types the same treatment. A
first common statement retains its original connection and padding: moving it to
line start can make identifier win and reject the input.

[fixture: eventmodeling/header/ordinary-frame]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/header/ordinary-frame-with-native-directive]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/header/empty-header]

[fixture: eventmodeling/header/first-title-preserved]

[fixture: eventmodeling/header/title-moved-to-line-start]

[fixture: eventmodeling/header/acctitle-moved-to-line-start]

[fixture: eventmodeling/header/accdescr-moved-to-line-start]

[fixture: eventmodeling/header/header-percent]

[fixture: eventmodeling/header/header-slash-boundary]

Input (escaped): `"  eventmodeling tf 01 evt Alpha"`.

Output
([header/ordinary-frame-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha
```

Input (escaped): `"eventmodeling tf 01 evt A %%{{x}}%%\n"`.

Output
([header/ordinary-frame-with-native-directive-output.mmd](../tests/fixtures/eventmodeling/header/ordinary-frame-with-native-directive-output.mmd)):

```mmd
eventmodeling tf 01 evt A %%{{x}}%%
```

### Indentation

Use one configured step for ordinary body statements, two for GWT clauses and
three for GWT items. Structural continuation lines stand one step deeper than
their statement. The first line of an ordinary `data` declaration or `note`
instead stands at column one, aligning it with the required unindented closing
brace while its body keeps its authored columns. A continued `data` header still
uses the ordinary continuation level. Columns do not define parents, so
`tabWidth: 0` adds no spaces; `useTabs` adds one tab per step even at width
zero. Value continuations, metadata padding and hidden consumed-LF boundaries
retain their authored columns.

[fixture: eventmodeling/indentation/body-four-spaces]

[fixture: eventmodeling/indentation/body-tabs]

[fixture: eventmodeling/indentation/zero-width]

[fixture: eventmodeling/indentation/ordinary-continuation]

[fixture: eventmodeling/indentation/zero-width-tabs]

[fixture: eventmodeling/indentation/data-declaration-column-one]

[fixture: eventmodeling/indentation/data-declaration-four-spaces]

[fixture: eventmodeling/indentation/data-declaration-tabs]

[fixture: eventmodeling/indentation/note-column-one]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

Input (escaped): `"eventmodeling\ntf 01 evt Alpha\nrf 02 cmd Beta"`.

Output
([indentation/body-four-spaces-output.mmd](../tests/fixtures/eventmodeling/indentation/body-four-spaces-output.mmd)):

```mmd
eventmodeling
    tf 01 evt Alpha
    rf 02 cmd Beta
```

Output
([indentation/data-declaration-column-one-output.mmd](../tests/fixtures/eventmodeling/indentation/data-declaration-column-one-output.mmd)):

```mmd
eventmodeling
data AddItem01 {
  sku: 'SHIRT-M'
  quantity: 2
}
```

Output
([indentation/note-column-one-output.mmd](../tests/fixtures/eventmodeling/indentation/note-column-one-output.mmd)):

```mmd
eventmodeling
note 01 {
  explanation
}
```

### Statements one per line

Put ordinary top-level AST statements on separate lines in source order, without
adding semicolons. The grammar needs no visible EOL between complete units, so
this exposes their boundaries without changing the Db. A common successor keeps
its connection to the preceding unit. Apparent statements inside greedy inline
data remain part of that single value; a closed description can instead be
followed by an ordinary new statement.

[fixture: eventmodeling/statements-one-per-line/adjacent-frame-reset-entity]

[fixture: eventmodeling/statements-one-per-line/frame-metadata-adjacency]

[fixture: eventmodeling/statements-one-per-line/metadata-split-unsafe]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-frame]

[fixture: eventmodeling/statements-one-per-line/description-followed-by-common]

[fixture:
eventmodeling/statements-one-per-line/do-not-manufacture-statement-from-greedy-data]

Input (escaped):
`"eventmodeling tf 01 evt Alpha rf 02 cmd Beta entity Shop.Beta"`.

Output
([statements-one-per-line/adjacent-frame-reset-entity-output.mmd](../tests/fixtures/eventmodeling/statements-one-per-line/adjacent-frame-reset-entity-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha
  rf 02 cmd Beta
  entity Shop.Beta
```

### Frame components

Separate the frame keyword, digit-string name, entity-type word and qualified
name by one ordinary space, including where native whitespace originally crossed
lines. This distinguishes complete components such as `01 evt`. A required
identifier exactly `title` keeps its successful boundary: an ordinary LF remains
a continuation, while padding after a hidden form's consumed LF stays exact.
Introducing padded `title` there can turn the required name into EM_TITLE.

[fixture: eventmodeling/frame-components/time-parts-glued-number-type]

[fixture: eventmodeling/frame-components/reset-all-parts]

[fixture: eventmodeling/frame-components/long-time-and-type]

[fixture: eventmodeling/frame-components/name-title-lf-protected]

[fixture: eventmodeling/frame-components/acc-identifiers-without-delimiters]

[fixture:
eventmodeling/frame-components/hidden-before-required-title-identifier-keep-zero-indentation]

[test: eventmodeling/frame-components/required-title-unicode-gap]

[corpus fixture: eventmodeling/lex-name-title-after-lf]

Input (escaped): `"eventmodeling tf 01evt Alpha"`.

Output
([frame-components/time-parts-glued-number-type-output.mmd](../tests/fixtures/eventmodeling/frame-components/time-parts-glued-number-type-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha
```

### Source references

Print complete source arrows as `Name ->> 02 ->> 001`, with one ordinary space
on each side. The whole arrow is easier to distinguish this way. Preserve every
source, its order and leading zeroes; do not reverse or resolve references.
Hidden gaps and global trivia keep their protected boundaries.

[fixture: eventmodeling/source-references/arrows-touching]

[fixture: eventmodeling/source-references/source-newlines-and-repetitions]

[fixture: eventmodeling/source-references/arrow-comment-contact]

Input (escaped): `"eventmodeling tf 01 evt Alpha->>02->>001"`.

Output
([source-references/arrows-touching-output.mmd](../tests/fixtures/eventmodeling/source-references/arrows-touching-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha ->> 02 ->> 001
```

### Data references

Use one ordinary space before a data reference and tight inner edges, `[[D]]`.
This makes the delimiters one readable pair. Compact ordinary component newlines
too; `[[title]]` also avoids a padded title composite. Preserve hidden forms and
trivia in their owned gaps, and never qualify a single reference name.

[fixture: eventmodeling/data-references/reference-padded]

[fixture: eventmodeling/data-references/reference-component-lines]

[fixture: eventmodeling/data-references/reference-title-compact-valid]

[fixture: eventmodeling/data-references/reference-title-padding-unsafe]

[fixture: eventmodeling/data-references/reference-names-acctitle-accdescr]

Input (escaped): `"eventmodeling tf 01 evt Alpha [[ \tD\t ]]"`.

Output
([data-references/reference-padded-output.mmd](../tests/fixtures/eventmodeling/data-references/reference-padded-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha [[D]]
```

### Type tags

Keep type-tag inner gaps tight, as in `` `json` ``, and use one ordinary space
before its body. Tight tags distinguish the annotation from its value. Retain
the presence or absence of a tag and all eight authored type words. A tag does
not ask the formatter to parse its payload as JSON or another language; hidden
forms and global trivia retain their boundaries.

[fixture: eventmodeling/type-tags/inline-tag-parts]

[fixture: eventmodeling/type-tags/block-tag-parts]

[fixture: eventmodeling/type-tags/all-inline-tags-retained]

[fixture: eventmodeling/type-tags/tag-comments-retained]

[fixture: eventmodeling/type-tags/tag-absent-kept-absent]

[fixture: eventmodeling/type-tags/all-block-tags-retained]

Input (escaped): `"eventmodeling tf 01 evt Alpha \u0060 \tjson \t\u0060{ x }"`.

Output
([type-tags/inline-tag-parts-output.mmd](../tests/fixtures/eventmodeling/type-tags/inline-tag-parts-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha `json` { x }
```

### Qualified names

Join ordinary gaps around qualified-name dots into `Shop.Bought`, including
ordinary component newlines and Unicode whitespace. The dot connects the
existing identifier segments rather than starting another component. Keep each
complete identifier's spelling and every owned hidden/comment gap. After a
hidden consumed LF, a `title` segment gains no new padding.

[test: eventmodeling/qualified-names/qualified-padded]

[fixture: eventmodeling/qualified-names/qualified-lines]

[fixture: eventmodeling/qualified-names/dot-title-no-padding]

[fixture: eventmodeling/qualified-names/dot-title-padded-unsafe]

[fixture: eventmodeling/qualified-names/dot-native-comment]

[fixture: eventmodeling/qualified-names/custom-header-identifier]

[fixture:
eventmodeling/qualified-names/hidden-before-title-segment-keep-no-prefix-space]

Input (escaped): `"eventmodeling rf 02 cmd Shop\n.\nBuy entity Root\n.\nChild"`.

Output
([qualified-names/qualified-lines-output.mmd](../tests/fixtures/eventmodeling/qualified-names/qualified-lines-output.mmd)):

```mmd
eventmodeling
  rf 02 cmd Shop.Buy
  entity Root.Child
```

### Authored spellings

Retain the authored short or long frame keyword, all nine entity-type words and
every digit-string spelling. Although changing a frame keyword alias can leave
the comparison Db equal, it loses the chosen form. Entity-type aliases remain in
the Db, and `1`, `01` and `001` name different frames, so neither alias
conversion nor numeric normalization is appropriate.

[fixture: eventmodeling/authored-spellings/alias-retained]

[fixture: eventmodeling/authored-spellings/frame-aliases-db-equal]

[fixture: eventmodeling/authored-spellings/entity-type-aliases-db-different]

[fixture: eventmodeling/authored-spellings/numeric-identity-zeroes]

[fixture: eventmodeling/authored-spellings/nine-entity-types-preserved]

Input (escaped):
`"eventmodeling timeframe 001 event Alpha resetframe 02 command Beta"`.

Output
([authored-spellings/alias-retained-output.mmd](../tests/fixtures/eventmodeling/authored-spellings/alias-retained-output.mmd)):

```mmd
eventmodeling
  timeframe 001 event Alpha
  resetframe 02 command Beta
```

### Declarations and notes

Separate declaration and note components with one ordinary space:
`entity Shop.Buy`, `data D` and `note 01`. Put a block opener on its header line
after one space, exposing the declaration's parts. Values and closing boundaries
follow the data rules. A required name `title` keeps its safe preceding
boundary, as for frames.

[fixture: eventmodeling/declarations-and-notes/entity-ordinary]

[fixture: eventmodeling/declarations-and-notes/entity-title-lf-protected]

[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]

[fixture: eventmodeling/declarations-and-notes/data-name-title-keep-lf]

Input (escaped): `"eventmodeling entity\tShop\n.\nBuy"`.

Output
([declarations-and-notes/entity-ordinary-output.mmd](../tests/fixtures/eventmodeling/declarations-and-notes/entity-ordinary-output.mmd)):

```mmd
eventmodeling
  entity Shop.Buy
```

### Gwt clauses and items

Put `gwt 99` at body depth, each clause keyword one step deeper and every item
another step deeper. This shows the authored clause/item relationship without
inventing closing punctuation. Keep required given/then, optional when, item
order, repetition and type words. Ordinary item components use one space;
required `title` boundaries, hidden forms, trivia and protected opening edges
take precedence.

[fixture: eventmodeling/gwt-clauses-and-items/given-when-then-nested]

[fixture: eventmodeling/gwt-clauses-and-items/without-when-repeated-items]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-inline-alternative]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-title-identifier-keep-lf]

[fixture: eventmodeling/gwt-clauses-and-items/gwt-clause-and-item-comments]

[test: eventmodeling/gwt-clauses-and-items/gwt-blanks-and-separators]

[fixture:
eventmodeling/gwt-clauses-and-items/gwt-title-after-hidden-keep-zero-indentation]

[corpus fixture: eventmodeling/gram-gwt-item-comment-line]

Input (escaped):
`"eventmodeling gwt 99 given evt Alpha cmd Beta when command Buy then ui Screen rmo View tf 01 evt End"`.

Output
([gwt-clauses-and-items/given-when-then-nested-output.mmd](../tests/fixtures/eventmodeling/gwt-clauses-and-items/given-when-then-nested-output.mmd)):

```mmd
eventmodeling
  gwt 99
    given
      evt Alpha
      cmd Beta
    when
      command Buy
    then
      ui Screen
      rmo View
  tf 01 evt End
```

### Inline data

Print each inline body from its complete source span, retaining braces or
quotes, backslashes, padding, empty forms and native-looking text. `singleQuote`
does not rewrite these terminals. The lexer takes the last matching same-line
closer: apparent later frames inside that span are data, not statements.
Trimming, requoting or splitting that text changes the raw terminal in the Db.

[fixture: eventmodeling/inline-data/inline-braces-unchanged]

[fixture: eventmodeling/inline-data/inline-quote-spelling]

[fixture: eventmodeling/inline-data/inline-empty-and-whitespace]

[fixture: eventmodeling/inline-data/inline-trimming-changes-raw-value]

[fixture: eventmodeling/inline-data/inline-requote-changes-raw-value]

[fixture: eventmodeling/inline-data/greedy-apparent-frames-kept]

[fixture: eventmodeling/inline-data/data-hidden-looking-text]

Input (escaped): `"eventmodeling tf 01 evt Alpha { \t x  }"`.

Output
([inline-data/inline-braces-unchanged-output.mmd](../tests/fixtures/eventmodeling/inline-data/inline-braces-unchanged-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha { 	 x  }
```

### Data blocks

Keep data and note bodies exactly from `{` through `}`, including opening
padding, interior blank lines, authored columns and the unindented closer.
Indenting that closer can reject the input; reindenting the body changes its raw
terminal. Preserve apparent statements, nested-looking text and an adjacent
closing-looking line when the block's body-present rule reads through it to a
later closer.

Body text written at column one stays at column one, so the formatter can leave
the body and closing brace visually unindented. [fixture:
eventmodeling/final-newline/final-block-padding-kept]

[fixture: eventmodeling/data-blocks/block-interior-unchanged]

[fixture: eventmodeling/data-blocks/block-empty-kept]

[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]

[fixture: eventmodeling/data-blocks/later-closer-owns-apparent-text]

[fixture: eventmodeling/data-blocks/block-nested-text]

Input (escaped): `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}\n"`.

Output
([data-blocks/block-closer-indent-unsafe-output.mmd](../tests/fixtures/eventmodeling/data-blocks/block-closer-indent-unsafe-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha [[D]]
data D {
x
}
```

### Data boundaries

Preserve whether block-data consumes its closing LF or stops at a whitespace
lookahead. Keep closing horizontal padding before moving an ordinary successor
to a new line. LS/PS lookahead remains outside the terminal rather than becoming
LF. Before a common successor, retain the first LF or its absence, the complete
leading run and its connection to the prior unit, even at width zero: adding a
spare LF, removing indentation or trimming closing padding can change the Db or
reject the text. EOF's logical LF may become one explicit final LF.

[fixture: eventmodeling/data-boundaries/block-eof-logical-lf-kept]

[fixture: eventmodeling/data-boundaries/block-closer-space-retained]

[fixture: eventmodeling/data-boundaries/same-line-block-successor]

[fixture: eventmodeling/data-boundaries/lf-consuming-before-acctitle]

[fixture:
eventmodeling/data-boundaries/lf-consuming-before-accdescr-preserve-one-space]

[fixture: eventmodeling/data-boundaries/note-consumed-lf]

[fixture:
eventmodeling/data-boundaries/after-block-lf-tabwidth-zero-must-keep-metadata-padding]

[fixture:
eventmodeling/data-boundaries/after-block-same-line-tab-metadata-boundary-kept]

Input (escaped): `"eventmodeling tf 01 evt Alpha [[D]] data D {\nx\n}"`.

Output
([data-boundaries/block-eof-logical-lf-kept-output.mmd](../tests/fixtures/eventmodeling/data-boundaries/block-eof-logical-lf-kept-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha [[D]]
data D {
x
}
```

### Common boundaries

Keep a common statement's complete source, the immediately preceding ASCII
space/tab run and its connection to the unit that makes it readable. Preserve
the entire intervening source interval across global directives, selected
semicolons; these removals decide which padding joins. Do not reconstruct a run
after losing it. The shared accessibility layout is deliberately bypassed here:
EM terminals retain keyword, delimiter and leading padding as values, unlike the
converted common terminals of other diagrams. Even when accTitle's setter strips
some leading padding, retaining all common forms avoids inconsistent exceptions.

[fixture:
eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps]

[fixture:
eventmodeling/common-boundaries/acctitle-prefix-leading-stripped-by-setter]

[fixture: eventmodeling/common-boundaries/accdescr-prefix-significant]

[fixture:
eventmodeling/common-boundaries/common-after-empty-description-keep-adjacency]

[fixture:
eventmodeling/common-boundaries/native-comment-separates-common-requires-following-padding]

[fixture:
eventmodeling/common-boundaries/native-comment-common-padding-change-db]

Input (escaped): `"eventmodeling tf 01 evt Alpha \t%%{init:{}}%%  accDescr: D"`.

Output
([common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd](../tests/fixtures/eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha 	%%{init:{}}%%  accDescr: D
```

### Title

Keep title padding, its one separator, payload and trailing text as written,
including quotes, empty titles and overwritten occurrences. Do not take a value
from the next physical line. The comparison summary omits diagram titles, so an
equal comparison Db would not justify rewriting the public EM_TITLE terminal.

[fixture: eventmodeling/title/title-exact-padding-and-quotes]

[fixture: eventmodeling/title/title-normalized-invisible-to-comparison-db]

[fixture: eventmodeling/title/title-empty-remains]

[fixture: eventmodeling/title/overwritten-occurrences]

Input (escaped): `"eventmodeling title\ntf 01 evt Alpha"`.

Output
([title/title-empty-remains-output.mmd](../tests/fixtures/eventmodeling/title/title-empty-remains-output.mmd)):

```mmd
eventmodeling title
  tf 01 evt Alpha
```

### Accessibility lines

Keep accessibility line forms as written: leading padding, the keyword/colon
gap, colon-side and trailing padding, empty payloads, quotes and brace-looking
text. EM_ACC_TITLE and EM_ACC_DESCR include these parts in their values. An
empty payload is still a nonempty terminal; the colon form is not converted into
a description block. LS/PS inside line values remain content.

[fixture: eventmodeling/accessibility-lines/accessibility-lines-exact]

[fixture: eventmodeling/accessibility-lines/accessibility-shared-trim-changes]

[fixture:
eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string]

[fixture: eventmodeling/accessibility-lines/colon-braces-remain-text]

[test: eventmodeling/accessibility-lines/line-value-ls-ps-preserved]

[corpus fixture: eventmodeling/common-repeat-empty]

Input (escaped): `"eventmodeling accTitle: First\ntf 01 evt Alpha accTitle:"`.

Output
([accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd](../tests/fixtures/eventmodeling/accessibility-lines/empty-accessibility-terminal-is-not-reset-to-empty-string-output.mmd)):

```mmd
eventmodeling accTitle: First
  tf 01 evt Alpha accTitle:
```

### Description blocks

Keep the complete description block and its leading run, including opener
newlines, whitespace-only interiors and closing columns. Empty, whitespace-only
and removal-only interiors remain distinct authored forms. This is the single
selection point that bypasses shared `layoutDescriptionBlock`: its ordinary `{}`
compaction and closer alignment would rewrite an EM_ACC_DESCR value. No
diagram-local empty-block normalization replaces it.

[fixture:
eventmodeling/description-blocks/description-whitespace-literal-retained]

[fixture: eventmodeling/description-blocks/description-opener-newline-unchanged]

[fixture:
eventmodeling/description-blocks/description-closer-column-normalized-by-setter]

[fixture: eventmodeling/description-blocks/description-slash-yaml-are-content]

[corpus fixture: eventmodeling/gram-description-block-empty-after-removal]

[corpus fixture: eventmodeling/common-description-repeat]

Input (escaped): `"eventmodeling accDescr\n\n{ Details }"`.

Output
([description-blocks/description-opener-newline-unchanged-output.mmd](../tests/fixtures/eventmodeling/description-blocks/description-opener-newline-unchanged-output.mmd)):

```mmd
eventmodeling accDescr

{ Details }
```

### Hidden forms

Print each IgnoredText once from its source range at its AST owner. Keep
pre-header/body forms, required and optional named gaps, qualified-name tails,
tags and GWT clause/item gaps. Do not parse retained YAML or native DIRECTIVE as
configuration. The shared hidden path preserves internal columns, consumed LF
and closing lookahead padding; ordinary body openers align with their body.
Required opening gaps and common successors keep their authored boundaries. A
fallback percent comment stays a comment.

Forms at authored body boundaries keep their line through GWT clause and item
openings too. The header and nested bodies share that decision so moving an item
cannot remove an enclosing opening's protection on the next formatting.

[fixture: eventmodeling/hidden-forms/header-inline-gwt-item-directive]

[fixture: eventmodeling/hidden-forms/header-inline-gwt-item-yaml]

[fixture: eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed]

[fixture: eventmodeling/hidden-forms/hidden-frame-required-gaps]

[fixture: eventmodeling/hidden-forms/hidden-optional-owners]

[fixture: eventmodeling/hidden-forms/hidden-dot-owners]

[fixture: eventmodeling/hidden-forms/hidden-data-tag-owners]

[fixture: eventmodeling/hidden-forms/hidden-gwt-clause-item-owners]

[fixture:
eventmodeling/hidden-forms/hidden-next-common-keep-consumed-lf-padding]

[fixture: eventmodeling/hidden-forms/yaml-next-common-keep-consumed-lf-padding]

[fixture: eventmodeling/hidden-forms/native-later-qualifying-close-retained]

[fixture: eventmodeling/hidden-forms/fallback-percent-comment-remains-comment]

[fixture: eventmodeling/hidden-forms/adjacent-yaml-closer-source-whole]

[fixture: eventmodeling/hidden-forms/native-directive-closer-padding-retained]

[fixture: eventmodeling/hidden-forms/no-spare-lf-required-before-ordinary-frame]

[fixture: eventmodeling/hidden-forms/reference-internal-hidden-owners]

[fixture: eventmodeling/hidden-forms/inline-tag-hidden-owners]

[fixture: eventmodeling/hidden-forms/gwt-required-source-and-given-hidden-gaps]

[corpus fixture: eventmodeling/detect-real-retained-secondscan]

Input (escaped): `"eventmodeling tf 01 evt Alpha ---\nx\n---\ntf 02 evt Beta"`.

Output
([hidden-forms/body-hidden-yaml-no-visible-eol-needed-output.mmd](../tests/fixtures/eventmodeling/hidden-forms/body-hidden-yaml-no-visible-eol-needed-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha ---
x
---
  tf 02 evt Beta
```

### Comments

Align ordinary standalone comments with their owning body; between GWT items
this is item depth. Within a printed line, preserve inline contact and normalize
harmless separation to one space. When units split into separate lines, attach
intervening inline comments to the following unit, in the same direction as
directives. Use this shared placement so the same comments are treated alike
across diagram types. Keep marks, contents, trailing padding and block-comment
continuation columns. Native `//` and `%%` run through LS/PS to physical LF. A
`%%` comment line inside a data block, a note, an `accDescr` block, a slash
block comment or a hidden form is part of that text and keeps its columns.
Boundaries needed for metadata or a required `title` take precedence. Slash
comments are not moved before the header, where detection would reject them.

[fixture: eventmodeling/comments/standalone-native-comments]

[fixture: eventmodeling/comments/inline-comments-keep-contact]

[fixture: eventmodeling/comments/native-percent-and-bare-percent]

[test: eventmodeling/comments/native-line-comment-ls-stays-content]

[fixture: eventmodeling/comments/slash-comment-before-title-identifier]

[fixture: eventmodeling/comments/do-not-move-slash-comment-before-header]

[test: eventmodeling/comments/comment-after-ls-gap-ends-at-lf]

[fixture: eventmodeling/comments/comment-line-inside-data-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-note-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-accdescr-block-kept]

[fixture: eventmodeling/comments/comment-line-inside-slash-block-comment-kept]

[fixture: eventmodeling/comments/comment-line-inside-hidden-yaml-kept]

[corpus fixture: eventmodeling/comment-line-directive-in-data]

[corpus fixture: eventmodeling/comment-line-ignored-semicolon-in-data]

[corpus fixture: eventmodeling/comment-line-entity-in-data]

[corpus fixture: eventmodeling/comment-line-line-separator]

[corpus fixture: eventmodeling/comment-line-paragraph-separator]

[corpus fixture: eventmodeling/comment-line-directive]

[test: eventmodeling/comments/ps-native-line-comment-remains-owned]

[fixture: eventmodeling/comments/mixed-directive-order]

[fixture: eventmodeling/comments/split-statements-block]

[fixture: eventmodeling/comments/inline-percent-before-next-statement]

Input (escaped): `"eventmodeling\ntf 01 evt A /*c*/ tf 02 evt B\n"`.

Output
([comments/split-statements-block-output.mmd](../tests/fixtures/eventmodeling/comments/split-statements-block-output.mmd)):

```mmd
eventmodeling
  tf 01 evt A
  /*c*/ tf 02 evt B
```

### Default size branches

Eventmodeling differs from flowchart because its Db keeps comment lines, and
removes them when the source is longer than `maxTextSize`, 50000 UTF-16 code
units by default; agentflow has the same limit (see
[Default size branches](./agentflow.md#default-size-branches)). Measure after
the frontmatter, the whitespace-only lines that follow it and the directives are
removed, counting CRLF as one unit and a surrogate pair as two. [fixture:
default-size-branches/size-frontmatter-not-counted] [fixture:
default-size-branches/size-frontmatter-trivia-not-counted] [fixture:
default-size-branches/size-directive-not-counted] [fixture:
default-size-branches/size-utf16-surrogate] At or above 50000 retain the
complete diagram text and its ending. [fixture:
default-size-branches/size-preserving-to-fallback-unsafe] Below it apply
ordinary layout only when the planned printed measurement also stays strictly
below 50000; otherwise retain the complete diagram and its ending. [fixture:
default-size-branches/size-below-planned-crossing] This keeps indentation or the
final line break from moving the text across the limit, where the comment lines
in a value would be removed and the Db would change. The boundary itself is
covered by the corpus, also with CRLF, an inline directive and frontmatter.
[corpus fixture: eventmodeling/comment-default-size-equal] [corpus fixture:
eventmodeling/comment-default-size-above] [corpus fixture:
eventmodeling/comment-default-size-equal-crlf] [corpus fixture:
eventmodeling/comment-default-size-above-crlf] [corpus fixture:
eventmodeling/comment-default-size-equal-inline-directive] [corpus fixture:
eventmodeling/comment-default-size-above-inline-directive] [corpus fixture:
eventmodeling/comment-default-size-equal-frontmatter] [corpus fixture:
eventmodeling/comment-default-size-above-frontmatter] [corpus fixture:
eventmodeling/frontmatter-extra-trivia-below] [corpus fixture:
eventmodeling/frontmatter-extra-trivia-boundary] [corpus fixture:
eventmodeling/frontmatter-extra-trivia-above] [corpus fixture:
eventmodeling/frontmatter-extra-whitespace-line-boundary]

### Global directives

Use the shared directive placement: on the same printed line retain contact or
separation on each side. When statements, clauses or items split into lines,
attach an intervening directive to the following unit, retaining right contact.
Keep content, order, multiline interiors, positions inside values and unfinished
EOF endings. Standalone starts align with the owning body. Common boundaries
retain the full original gap instead of this ordinary spacing; a removed
directive cannot replace required whitespace.

[fixture: eventmodeling/global-directives/directive-same-line-contacts]

[fixture:
eventmodeling/global-directives/directive-follows-split-next-statement]

[fixture: eventmodeling/global-directives/directive-follows-split-next-gwt-item]

[fixture: eventmodeling/global-directives/directive-follows-split-clause]

[fixture: eventmodeling/global-directives/directive-in-value-exact]

[fixture:
eventmodeling/global-directives/directive-creates-comment-mark-keep-source]

[fixture: eventmodeling/global-directives/unfinished-free-text-eof-unchanged]

[fixture:
eventmodeling/global-directives/standalone-directive-before-normal-frame]

Input (escaped):
`"eventmodeling tf%%{wrap}%% 01 evt Alpha%%{wrap}%%->>%%{wrap}%%02"`.

Output
([global-directives/directive-same-line-contacts-output.mmd](../tests/fixtures/eventmodeling/global-directives/directive-same-line-contacts-output.mmd)):

```mmd
eventmodeling
  tf%%{wrap}%% 01 evt Alpha%%{wrap}%%->>%%{wrap}%%02
```

### Semicolons

Keep every authored semicolon using shared textual-prefix protection: preserve
through the last semicolon of each protected segment and every complete crossing
value or trivia item. The first protected body line aligns with its body;
contents and later columns remain authored. Required identifier and common-value
padding takes precedence over structural indentation. Keep a child body's
opening edge on the protected line too, so a second formatting cannot split it
differently. This grammar has no grammatical semicolon, so `verbatimStyleLines`
is false: a `style` or `classDef` word alone does not freeze the whole line.

[fixture: eventmodeling/semicolons/native-gwt-value]

[fixture: eventmodeling/semicolons/native-frame-value]

[fixture: eventmodeling/semicolons/selected-external-semicolon-preserved]

[fixture: eventmodeling/semicolons/semicolon-inside-inline-data-protected]

[fixture: eventmodeling/semicolons/two-semicolons-removing-selected-changes-db]

[fixture: eventmodeling/semicolons/no-grammar-semicolon-style-word-line-formats]

[fixture: eventmodeling/semicolons/gwt-protected-opening-kept]

[fixture: eventmodeling/semicolons/metadata-across-selected-semicolon-gap-exact]

[fixture: eventmodeling/semicolons/selected-semicolon-exposes-native-lf]

[fixture: eventmodeling/semicolons/classdef-trigger-inline-unchanged]

[fixture:
eventmodeling/semicolons/protected-metadata-prefix-is-value-whitespace]

[fixture: eventmodeling/semicolons/protected-gwt-title-hidden-gap-remains-zero]

[fixture: eventmodeling/semicolons/prefix-crosses-clause-header]

Input (escaped): `"eventmodeling tf 01 evt Alpha \"style:#x\" ;rf 02 cmd Beta"`.

Output
([semicolons/selected-external-semicolon-preserved-output.mmd](../tests/fixtures/eventmodeling/semicolons/selected-external-semicolon-preserved-output.mmd)):

```mmd
eventmodeling tf 01 evt Alpha "style:#x" ;rf 02 cmd Beta
```

### Blank lines

Keep at most one ordinary ASCII blank line between statements or items and
remove ordinary blanks at document/body edges. This keeps separation without
unlimited vertical space. Whitespace-only ordinary lines become empty; data,
description, hidden and directive interiors, retained prefixes and common
consumed-LF boundaries remain as written.

[fixture: eventmodeling/blank-lines/ordinary-blanks-bounded]

[fixture: eventmodeling/blank-lines/gwt-blanks-bounded]

[fixture: eventmodeling/blank-lines/block-blank-contents-retained]

[fixture:
eventmodeling/blank-lines/hidden-spare-blank-before-normal-frame-collapse]

[fixture:
eventmodeling/blank-lines/description-empty-ends-same-line-common-no-split]

Input (escaped):
`"\n\neventmodeling\n\n\ntf 01 evt Alpha\n\n \t\n\nrf 02 cmd Beta\n\n"`.

Output
([blank-lines/ordinary-blanks-bounded-output.mmd](../tests/fixtures/eventmodeling/blank-lines/ordinary-blanks-bounded-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha

  rf 02 cmd Beta
```

### Trailing whitespace

Remove only harmless exterior ASCII padding after the header or structural
components. Decide by ownership rather than trimming every physical line. Keep
metadata values and prefixes, data interiors, comment/directive tails,
hidden/data closing boundaries and protected stretches; their whitespace can be
content or determine acceptance.

[fixture: eventmodeling/trailing-whitespace/harmless-trailing-structure]

[fixture:
eventmodeling/trailing-whitespace/metadata-trailing-whitespace-retained]

[fixture:
eventmodeling/trailing-whitespace/metadata-trailing-whitespace-removal-changes]

Input (escaped): `"eventmodeling \t\ntf 01 evt Alpha \t\nentity Shop.Buy \t"`.

Output
([trailing-whitespace/harmless-trailing-structure-output.mmd](../tests/fixtures/eventmodeling/trailing-whitespace/harmless-trailing-structure-output.mmd)):

```mmd
eventmodeling
  tf 01 evt Alpha
  entity Shop.Buy
```

### Long lines

Do not wrap by `printWidth`. Ordinary whitespace-only component newlines follow
their spacing rules, while trivia continuations retain structural depth. Only
GWT's decided clause/item layout adds structural splits. Values, hidden forms,
metadata and protected boundaries retain their contents. Avoiding
width-dependent choices keeps those lexical boundaries explicit and never
inserts a forbidden LF into inline data.

[fixture: eventmodeling/long-lines/long-structural-line-no-wrap]

[fixture: eventmodeling/long-lines/safe-structural-wrapping-alternate]

[fixture: eventmodeling/long-lines/inline-value-wrapping-rejects]

Input (escaped):
`"eventmodeling tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] \u0060text\u0060 {a very long authored payload}"`.

Output
([long-lines/long-structural-line-no-wrap-output.mmd](../tests/fixtures/eventmodeling/long-lines/long-structural-line-no-wrap-output.mmd)):

```mmd
eventmodeling
  tf 001 evt VeryLongNamespace.VeryLongEventName ->> 002 ->> 003 ->> 004 [[LongDataName]] `text` {a very long authored payload}
```

### Frontmatter yaml

Use the shared YAML formatter only for safe real leading frontmatter. Malformed
YAML, indented or padded fences, HTML quote hazards and bodies that would create
a fence stay written under the existing guards. YAML nesting uses a positive
minimum indentation even at width zero. If textBeforeHeader is present, retain
the complete prefix through the header: promoting native YAML or DIRECTIVE into
real frontmatter/configuration can change acceptance.

[fixture: eventmodeling/frontmatter-yaml/safe-real-yaml]

[fixture: eventmodeling/frontmatter-yaml/positive-minimum-yaml-indent]

[fixture: eventmodeling/frontmatter-yaml/retained-prefix-whole]

[fixture: eventmodeling/frontmatter-yaml/real-plus-retained-plus-second-scan]

[fixture: eventmodeling/frontmatter-yaml/html-frontmatter-guard-unchanged]

[fixture: eventmodeling/frontmatter-yaml/delimiter-padding-kept]

[fixture: eventmodeling/frontmatter-yaml/indented-fences-kept]

Input (escaped):
`"---\ntitle: 'YamlTitle'\nconfig: {eventmodeling: {padding: 12}}\n---\neventmodeling tf 01 evt Alpha"`.

Output
([frontmatter-yaml/safe-real-yaml-output.mmd](../tests/fixtures/eventmodeling/frontmatter-yaml/safe-real-yaml-output.mmd)):

```mmd
---
title: "YamlTitle"
config: { eventmodeling: { padding: 12 } }
---
eventmodeling
  tf 01 evt Alpha
```

### Line terminators and unicode

Follow the shared host policy: read CR and CRLF as LF and write the configured
`endOfLine`, including inside values and hidden forms. Normalize ordinary native
Unicode gaps through their component rules. Preserve LS/PS in common values and
line comments, and preserve their block-closing lookahead role; they are not
interchangeable with consumed LF. Unicode value edges are not trimmed.
Prettier's leading-BOM handling keeps its existing limitation.

[test:
eventmodeling/line-terminators-and-unicode/cr-block-and-description-to-lf]

[test: eventmodeling/line-terminators-and-unicode/crlf-block-and-common-to-lf]

[test: eventmodeling/line-terminators-and-unicode/configured-crlf-output]

[test: eventmodeling/line-terminators-and-unicode/configured-cr-output-hidden]

[test:
eventmodeling/line-terminators-and-unicode/ls-ps-native-whitespace-safe-ordinary-components]

[test: eventmodeling/line-terminators-and-unicode/ls-ps-description-value-kept]

[test:
eventmodeling/line-terminators-and-unicode/block-ls-boundary-stays-outside-value]

[test: eventmodeling/line-terminators-and-unicode/common-unicode-edges-kept]

[test: eventmodeling/line-terminators-and-unicode/leading-bom-host]

[corpus fixture: eventmodeling/lex-block-close-ps-boundary]

[corpus fixture: eventmodeling/line-inline-ls]

[corpus fixture: eventmodeling/line-inline-ps]

### Source order

Retain every occurrence in source order, including unused model entities/data,
notes, GWT, type tags, repeated sources, later same-name data, overwritten
common forms and inline data alongside a reference. Only their decided outer
layout changes. An equal comparison Db after deduplication would still lose
authored occurrences; reordering data can also change the first lookup.

[fixture: eventmodeling/source-order/all-occurrences-retained]

[fixture:
eventmodeling/source-order/deduplicating-source-db-equal-but-not-permitted]

[fixture:
eventmodeling/source-order/reordering-duplicate-data-changes-first-lookup]

[fixture:
eventmodeling/source-order/unread-model-note-gwt-retained-not-raw-line-lock]

[fixture: eventmodeling/title/overwritten-occurrences]

[corpus fixture: eventmodeling/common-repeat-empty]

[corpus fixture: eventmodeling/common-description-repeat]

Input (escaped):
`"eventmodeling entity Shop.Alpha entity Shop.Alpha note 99 {\nunused\n}\ngwt 99 given evt Alpha then cmd Beta tf 01 evt Alpha ->> 02 ->> 02 [[D]] {unused} data D {\nfirst\n}\ndata D {\nsecond\n}\ndata Unused {\nx\n}\n"`.

Output
([source-order/all-occurrences-retained-output.mmd](../tests/fixtures/eventmodeling/source-order/all-occurrences-retained-output.mmd)):

```mmd
eventmodeling
  entity Shop.Alpha
  entity Shop.Alpha
note 99 {
unused
}
  gwt 99
    given
      evt Alpha
    then
      cmd Beta
  tf 01 evt Alpha ->> 02 ->> 02 [[D]] {unused}
data D {
first
}
data D {
second
}
data Unused {
x
}
```

### Final newline

End ordinary accepted text with one configured newline, removing ordinary
terminal blank runs. Required hidden/data closing padding, protected source and
EOF-reaching unfinished directives retain their lexical endings. This shares the
file-ending policy without adding LF to directive content or changing a block
terminal's lookahead.

[fixture: eventmodeling/final-newline/final-common-line-newline]

[fixture: eventmodeling/final-newline/final-native-comment-newline]

[fixture: eventmodeling/final-newline/final-hidden-closer-padding-kept]

[fixture: eventmodeling/final-newline/final-block-padding-kept]

[fixture: eventmodeling/final-newline/hidden-eof-with-no-lf-gets-lf]

Input (escaped): `"eventmodeling accDescr: D"`.

Output
([final-newline/final-common-line-newline-output.mmd](../tests/fixtures/eventmodeling/final-newline/final-common-line-newline-output.mmd)):

```mmd
eventmodeling accDescr: D
```

### Specified readings

Follow the five existing divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque and c4-keyword-anywhere. Add no divergence and do not
repair atomic cuts in rejected inputs. Raw rejection supplies no raw Db;
comparisons use the recorded specified reading where needed. Rejected files
report syntax errors without being rewritten, and rejected Markdown payloads are
left to the host.

[corpus fixture: eventmodeling/directive-arrow-inside]

[corpus fixture: eventmodeling/lex-semicolon-frame-id-inside]

[corpus fixture: eventmodeling/div-html-frontmatter-value]

[corpus fixture: eventmodeling/div-frontmatter-invalid]

[corpus fixture: eventmodeling/c4-container-data]

### Markdown fences

Use the shared embedding path for dedented top-level, list and quote payloads,
with the same options, retained prefixes and common padding. The host strips
trailing embedded newlines and padding on the final code line, so final retained
padding lacks the standalone guarantee. Rejected payloads use Prettier's
ordinary code handling.

[test: eventmodeling Markdown: top-level]

[test: eventmodeling Markdown: data-declaration]

[test: eventmodeling Markdown: list]

[test: eventmodeling Markdown: quote]

[test: eventmodeling Markdown: zero]

[test: eventmodeling Markdown: tabs]

[test: eventmodeling Markdown: metadata]

[test: eventmodeling Markdown: hidden-boundary]

[test: eventmodeling Markdown: prefix]

[test: eventmodeling Markdown: frontmatter]

[test: eventmodeling Markdown: final-hidden-padding]

[test: eventmodeling Markdown: rejected]
