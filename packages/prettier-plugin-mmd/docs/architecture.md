# Architecture formatting rules

Japanese version: [architecture.ja.md](./architecture.ja.md)

The printer follows the 29 adopted items using the authored AST and shared
flat-body layouts. The rules below explain each formatting choice; compatibility
limits are in [compatibility.md](./compatibility.md).

## Rules

### Header

Print `architecture-beta` at column one and move an ordinary first statement
below it, making the heading visible. Keep empty bodies. Hidden boundaries and
protected header/body segments take precedence; never invent a glued keyword.

[fixture: architecture/header/header-empty]

[fixture: architecture/header/header-inline-accessibility]

[fixture: architecture/header/header-inline-description]

[corpus fixture: architecture/header-inline-group]

[corpus fixture: architecture/header-inline-service]

[corpus fixture: architecture/header-inline-junction]

[corpus fixture: architecture/header-inline-edge]

[corpus fixture: architecture/header-inline-align]

[corpus fixture: architecture/common-all]

[corpus fixture: architecture/header-glued-service]

[corpus fixture: architecture/header-letter-suffix]

Input (escaped): `"architecture-beta accTitle: Topic\n"`.

Output
([header/header-inline-accessibility-output.mmd](../tests/fixtures/architecture/header/header-inline-accessibility-output.mmd)):

```mmd
architecture-beta
  accTitle: Topic
```

### Indentation

Indent ordinary declarations, edges, alignments, common statements and
standalone trivia one configured step. The body is flat: `in` is a reference,
not nesting. `tabWidth: 0` gives zero spaces; `useTabs` gives one tab even at
width zero, because architecture columns have no grammatical meaning. Value
continuation columns, hidden closers and retained prefixes stay written.

[fixture: architecture/indentation/indent-four]

[fixture: architecture/indentation/indent-tabs]

[fixture: architecture/indentation/indent-two]

[fixture: architecture/indentation/indent-zero]

[fixture: architecture/indentation/zero-tabs]

Input (escaped): `"architecture-beta\nservice a\n"`.

Options: `{"tabWidth": 4}`.

Output
([indentation/indent-four-output.mmd](../tests/fixtures/architecture/indentation/indent-four-output.mmd)):

```mmd
architecture-beta
    service a
```

### Statements one per line

Print ordinary statements one per line for readability. A common line value owns
apparent keywords through physical EOL, so do not split it. Semicolons are not
statement separators; invalid adjacent statements and empty descriptions used as
component gaps remain failures.

[fixture: architecture/statements-one-per-line/line-value-owns-keywords]

[corpus fixture: architecture/gram-same-line-statements]

[corpus fixture: architecture/end-group-semicolon]

[corpus fixture: architecture/gram-empty-description-gap]

[corpus fixture: architecture/gram-empty-description-after-service]

Input (escaped): `"architecture-beta title t service a; junction j\n"`.

Output
([statements-one-per-line/line-value-owns-keywords-output.mmd](../tests/fixtures/architecture/statements-one-per-line/line-value-owns-keywords-output.mmd)):

```mmd
architecture-beta title t service a; junction j
```

### Declaration spacing

Use one space between the keyword and ID. Print `group g(cloud)[G]`,
`service a(server)[A]` and `service a[A]`: touching parentheses and brackets
make the attached parts read as one node. A quoted text icon is an independent
value, so print `service a "I" [A]`. Missing optional parts stay absent.
Trivia-bearing gaps keep their contact.

[fixture: architecture/declaration-spacing/double-text-icon]

[fixture: architecture/declaration-spacing/group-id]

[fixture: architecture/declaration-spacing/group-label]

[fixture: architecture/declaration-spacing/junction-id]

[fixture: architecture/declaration-spacing/named-group]

[fixture: architecture/declaration-spacing/named-service]

[fixture: architecture/declaration-spacing/service-id]

[fixture: architecture/declaration-spacing/service-label]

[fixture: architecture/declaration-spacing/single-text-icon]

Input (escaped): `"architecture-beta\ngroup  g (cloud) [Group]\n"`.

Output
([declaration-spacing/named-group-output.mmd](../tests/fixtures/architecture/declaration-spacing/named-group-output.mmd)):

```mmd
architecture-beta
  group g(cloud)[Group]
```

### Parent references

Put one space on each side of `in`, without column alignment. This gives
equivalent padding a consistent spelling while preserving explicit references
and their absence. Do not move declarations to resolve parents or turn
membership into a nested body.

[fixture: architecture/parent-references/group-parent]

[fixture: architecture/parent-references/junction-parent]

[fixture: architecture/parent-references/service-parent]

[corpus fixture: architecture/lex-keyword-prefix-ids]

[corpus fixture: architecture/db-service-forward-parent]

[corpus fixture: architecture/db-junction-forward-parent]

Input (escaped): `"architecture-beta\ngroup p\ngroup g(cloud)[G]in\tp\n"`.

Output
([parent-references/group-parent-output.mmd](../tests/fixtures/architecture/parent-references/group-parent-output.mmd)):

```mmd
architecture-beta
  group p
  group g(cloud)[G] in p
```

### Named icons

Keep each icon name as written inside its parentheses, including leading symbols
and unknown names. The composite requires a nonempty unpadded name: inserting
spaces would reject accepted input. Global directives between complete
components retain their boundaries.

[fixture: architecture/named-icons/leading-symbols]

[fixture: architecture/named-icons/unknown-name]

[corpus fixture: architecture/lex-icon-leading-symbols]

[corpus fixture: architecture/db-unknown-icon]

[corpus fixture: architecture/lex-icon-empty]

[corpus fixture: architecture/lex-icon-spaces]

[corpus fixture: architecture/lex-icon-text-parenthesized]

Input (escaped): `"architecture-beta\ngroup symbols (-:A_)\n"`.

Output
([named-icons/leading-symbols-output.mmd](../tests/fixtures/architecture/named-icons/leading-symbols-output.mmd)):

```mmd
architecture-beta
  group symbols(-:A_)
```

### Text icons

Keep each StringLiteral source span, including single/double quotes, opposite
quotes, empty text, escapes, padding and physical continuation lines.
`singleQuote` does not rewrite it: re-encoding loses authored spelling, and
trimming or decoding can change the Db.

[fixture: architecture/text-icons/double-quote]

[fixture: architecture/text-icons/empty]

[fixture: architecture/text-icons/padding]

[fixture: architecture/text-icons/single-quote]

[corpus fixture: architecture/lex-string-conversion]

[corpus fixture: architecture/lex-string-number-escape]

[corpus fixture: architecture/directive-empty-text-icon]

Input (escaped): `"architecture-beta\nservice double\"a'\\n\\t\\q\\\\b\"\n"`.

Options: `{"singleQuote": true}`.

Output
([text-icons/double-quote-output.mmd](../tests/fixtures/architecture/text-icons/double-quote-output.mmd)):

```mmd
architecture-beta
  service double "a'\n\t\q\\b"
```

### Label forms

Keep the whole ArchitectureLabel range and its authored bare/quoted form and
quote spelling. `[ "x" ]` is bare, not a quoted label to compact. Even Db-equal
requoting would lose the chosen kind and source form. Fallback quote-looking
text stays bare; never infer kind from converted text.

[fixture: architecture/label-forms/backslash-fallback]

[fixture: architecture/label-forms/bare]

[fixture: architecture/label-forms/inner-quote]

[fixture: architecture/label-forms/padded-quotes]

[fixture: architecture/label-forms/quoted-brackets]

[fixture: architecture/label-forms/single-quote]

[fixture: architecture/label-forms/unclosed-quote]

[fixture: architecture/label-forms/unescaped-quote]

[corpus fixture: architecture/lex-title-unclosed-quote-with-close]

[corpus fixture: architecture/lex-title-bare-inner-quote]

[corpus fixture: architecture/lex-title-unescaped-quote-fallback]

[corpus fixture: architecture/lex-title-quoted-backslash-fallback]

[corpus fixture: architecture/lex-title-quoted-brackets]

[corpus fixture: architecture/lex-title-single-quoted-brackets]

[corpus fixture: architecture/lex-title-padded-quoted-brackets]

[corpus fixture: architecture/html-label-authored-quotes]

[corpus fixture: architecture/lex-label-selected-semicolon-after-quote]

[corpus fixture: architecture/db-title-quote-only-double]

[corpus fixture: architecture/db-title-quote-only-single]

[corpus fixture: architecture/db-title-quote-only-padded]

Input (escaped): `"architecture-beta\nservice padded [ \"x\" ]\n"`.

Options: `{"singleQuote": true}`.

Output
([label-forms/padded-quotes-output.mmd](../tests/fixtures/architecture/label-forms/padded-quotes-output.mmd)):

```mmd
architecture-beta
  service padded[ "x" ]
```

### Label content

Preserve bracket interiors exactly: edge padding, repeated spaces, tabs,
whitespace-only and quoted-empty content, escapes, HTML, entities and
hidden-looking text. The Db can distinguish these values; normalizing them is
not exterior spacing. Physical CR/CRLF alone follow the shared host policy.

[fixture: architecture/label-content/bare-padding]

[fixture: architecture/label-content/escapes]

[fixture: architecture/label-content/hidden-looking]

[fixture: architecture/label-content/html-entities]

[fixture: architecture/label-content/quoted-empty]

[fixture: architecture/label-content/quoted-padding]

[fixture: architecture/label-content/whitespace-only]

[corpus fixture: architecture/lex-title-conversion]

[corpus fixture: architecture/db-empty-values]

[corpus fixture: architecture/lex-title-bare-trailing-backslash]

[corpus fixture: architecture/line-ls-ps-values]

[corpus fixture: architecture/space-unicode-values]

Input (escaped): `"architecture-beta\ngroup labels [  A  B\t C  ]\n"`.

Output
([label-content/bare-padding-output.mmd](../tests/fixtures/architecture/label-content/bare-padding-output.mmd)):

```mmd
architecture-beta
  group labels[  A  B	 C  ]
```

### Port colons

Close ordinary gaps on both sides of each port colon, as `a:R` and `L:b`. The
colon belongs to its endpoint rather than an aligned field; keep trivia and
hidden boundaries instead of tightening them.

[fixture: architecture/port-colons/port-colons-tight]

Input (escaped):
`"architecture-beta\nservice a\nservice b\na {group} : R -- L : b {group}\n"`.

Output
([port-colons/port-colons-tight-output.mmd](../tests/fixtures/architecture/port-colons/port-colons-tight-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Arrow lines

Keep the line and its optional markers together, with one ordinary space on each
side: `a:R <-- L:b`, `a:T --> B:b`, `a:R <--> L:b`. This separates the line from
the ports. Keep both actual marker characters, including `>--<`; their presence
flags do not specify their glyphs. No-marker lines use the same spaces.

[fixture: architecture/arrow-lines/arrow-both-markers]

[fixture: architecture/arrow-lines/arrow-end-marker]

[fixture: architecture/arrow-lines/arrow-no-markers]

[fixture: architecture/arrow-lines/arrow-reversed-markers]

[fixture: architecture/arrow-lines/arrow-start-marker]

[corpus fixture: architecture/db-directions]

[corpus fixture: architecture/gram-edge-separated-dashes]

Input (escaped): `"architecture-beta\nservice a\nservice b\na:R < -- > L:b\n"`.

Output
([arrow-lines/arrow-both-markers-output.mmd](../tests/fixtures/architecture/arrow-lines/arrow-both-markers-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R <--> L:b
```

### Arrow labels

Print labelled lines as `a:R <-[label]-> L:b`: the single dashes, whole
bracketed label and markers form one visual unit. Remove only ordinary exterior
gaps; preserve the complete label range, including padded quote-looking text and
empty quoted content.

[fixture: architecture/arrow-labels/edge-label-padded-quote]

[fixture: architecture/arrow-labels/edge-label-quoted]

[fixture: architecture/arrow-labels/labelled-dash-tight]

[corpus fixture: architecture/gram-edge-reversed-labeled-markers]

[corpus fixture: architecture/db-edge-title-quote-only]

Input (escaped):
`"architecture-beta\nservice a\nservice b\na:R - [ \"x\" ] - L:b\n"`.

Output
([arrow-labels/edge-label-padded-quote-output.mmd](../tests/fixtures/architecture/arrow-labels/edge-label-padded-quote-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R -[ "x" ]- L:b
```

### Group modifiers

Attach the authored `{group}` to its endpoint, as `a{group}:R`. This makes the
modifier read with its ID. Keep its fixed interior and both authored presence
flags, even on ungrouped nodes; do not substitute resolved group IDs.

[fixture: architecture/group-modifiers/modifier-touch]

[corpus fixture: architecture/db-group-modifier-junction]

[corpus fixture: architecture/db-group-modifier-one-group]

[corpus fixture: architecture/db-group-modifier-other-parent]

[corpus fixture: architecture/gram-hidden-modifier-gaps]

Input (escaped):
`"architecture-beta\nservice a\nservice b\na  {group}:R -- L:b\t{group}\n"`.

Output
([group-modifiers/modifier-touch-output.mmd](../tests/fixtures/architecture/group-modifiers/modifier-touch-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Alignment

Use one ordinary space between `align`, its row/column direction and each
member. Do not align columns, sort members, merge repeated constraints or wrap
them: consistent gaps improve reading without changing authored order or
introducing visible EOL.

[fixture: architecture/alignment/alignment-row-and-column]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/db-align-layout-conflict]

Input (escaped):
`"architecture-beta\nservice a\nservice b\njunction j\nalign\t row\t a   b\tj\nalign  column j\t b\n"`.

Output
([alignment/alignment-row-and-column-output.mmd](../tests/fixtures/architecture/alignment/alignment-row-and-column-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  junction j
  align row a b j
  align column j b
```

### Title

Use shared common-line layout: `title value` trims only common-whitespace edges,
and null or whitespace-only values print `title`. This compacts equivalent outer
padding. Never read the next physical line as a value, even across trivia. Keep
occurrences and content even though the architecture summary does not publish
title. Trivia-bearing values and protected hidden boundaries keep their source
gaps.

[corpus fixture: architecture/directive-fields]

[fixture: architecture/title/empty-next-statement]

[fixture: architecture/title/title-edge-trim]

[fixture: architecture/title/title-empty]

[fixture: architecture/title/title-next-global-gap]

[corpus fixture: architecture/common-title-next-statement]

[corpus fixture: architecture/common-title-comment-gap]

[corpus fixture: architecture/common-title-literal-quotes]

[corpus fixture: architecture/common-repeat-empty]

Input (escaped):
`"architecture-beta\ntitle\n%% next\nservice next_title\ntitle \"unclosed\n"`.

Output
([title/empty-next-statement-output.mmd](../tests/fixtures/architecture/title/empty-next-statement-output.mmd)):

```mmd
architecture-beta
  title
  %% next
  service next_title
  title "unclosed
```

### Accessibility lines

Reuse shared `accTitle: value` and `accDescr: value`: the colon touches its
keyword, with one space before a trimmed nonempty value; empty values end at the
colon. This keeps consistent outer spacing. Never join a next-line statement.
Braces after a colon remain line text, and protected trivia/hidden gaps take
precedence.

[fixture: architecture/accessibility-lines/a11y-empty-comment-gap]

[fixture: architecture/accessibility-lines/accdescr-spacing]

[fixture: architecture/accessibility-lines/acctitle-spacing]

[fixture: architecture/accessibility-lines/empty-next-statement]

[corpus fixture: architecture/common-acctitle-next-statement]

[corpus fixture: architecture/common-accdescr-next-statement]

[corpus fixture: architecture/common-repeat-empty]

Input (escaped):
`"architecture-beta\naccTitle: %% note\n\naccDescr: %% note\nservice a\n"`.

Output
([accessibility-lines/a11y-empty-comment-gap-output.mmd](../tests/fixtures/architecture/accessibility-lines/a11y-empty-comment-gap-output.mmd)):

```mmd
architecture-beta
  accTitle: %% note

  accDescr: %% note
  service a
```

### Description blocks

Reuse shared `layoutDescriptionBlock`: touching keyword/opener and interior
edges stay touching; present outer runs become one space. Whitespace-only
interiors become `{}` because no text needs surrounding space. Plain opener
whitespace can join; real trivia keeps its break. Keep comment/directive-only
interiors, nonempty continuation columns and internal blank lines. A separate
closer aligns with the statement; the first closing brace still ends the value.

[fixture: architecture/description-blocks/asymmetric]

[fixture: architecture/description-blocks/block-empty-fixed]

[fixture: architecture/description-blocks/block-present-spaces-fixed]

[fixture: architecture/description-blocks/block-touching-fixed]

[fixture: architecture/description-blocks/empty-block-comment-only-fixed]

[fixture: architecture/description-blocks/empty-block-global-only-fixed]

[fixture: architecture/description-blocks/interior-trivia]

[fixture: architecture/description-blocks/opener-trivia]

[corpus fixture: architecture/common-block-newline-gap]

[corpus fixture: architecture/common-block-comment-gap]

[corpus fixture: architecture/common-block-directive-gap]

[corpus fixture: architecture/common-description-block-comment]

[corpus fixture: architecture/common-description-block-directive]

[corpus fixture: architecture/common-block-whitespace]

[test: architecture/description-blocks/unicode-empty]

[test: architecture/description-blocks/unicode-opener]

Input (escaped):
`"architecture-beta\naccDescr{A }\naccDescr{ B}\naccDescr {C}\naccDescr\n\n{ D }\n"`.

Output
([description-blocks/asymmetric-output.mmd](../tests/fixtures/architecture/description-blocks/asymmetric-output.mmd)):

```mmd
architecture-beta
  accDescr{A }
  accDescr{ B}
  accDescr {C}
  accDescr { D }
```

### Multiline values

Do not wrap at printWidth. Visible LF between ordinary components can reject
input, and reflowing text icons or labels can change their Db. Keep authored
physical value lines, continuation columns and internal blanks. Only a separate
description closer uses the shared alignment.

[fixture: architecture/multiline-values/continuation-columns]

[fixture: architecture/multiline-values/no-wrap-long-declaration]

[fixture: architecture/multiline-values/no-wrap-long-edge]

[corpus fixture: architecture/line-lf-string-title]

Input (escaped):
`"architecture-beta\nservice multi \"A\n   B\n\nC\" [\"D\n E\"]\naccDescr {\n  F\n\n G\n}\n"`.

Output
([multiline-values/continuation-columns-output.mmd](../tests/fixtures/architecture/multiline-values/continuation-columns-output.mmd)):

```mmd
architecture-beta
  service multi "A
   B

C" ["D
 E"]
  accDescr {
  F

 G
  }
```

### Comments

Align ordinary standalone comments one body step in, or column one before the
header. Inline comments keep their line and touching side, or one separating
space. Preserve marks, content and trailing padding for attachment. Native
comments end at LF/CR and keep LS/PS as content. Earlier values own enclosed
percent text; common lines stop at it. Removed common regions keep complete
source and continuation columns.

[fixture: architecture/comments/comment-attachments]

[fixture: architecture/comments/value-ownership]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/comment-in-quoted-label]

[corpus fixture: architecture/comment-directive-in-mark]

[corpus fixture: architecture/comment-directive-in-value]

[test: architecture/comments/ls-ps-content]

Input (escaped):
`"architecture-beta\nservice percent \"A%%B\" [C%%D]\naccDescr {E%%F}\ntitle Topic%% inline\n"`.

Output
([comments/value-ownership-output.mmd](../tests/fixtures/architecture/comments/value-ownership-output.mmd)):

```mmd
architecture-beta
  service percent "A%%B" [C%%D]
  accDescr {E%%F}
  title Topic%% inline
```

### Global directives

Keep Root directive content, order, ownership and contact on each side. Ordinary
standalone starts align one body step in; multiline interiors and EOF-reaching
endings stay written. Common removal joins surrounding text, so deleting
boundary whitespace can reject a declaration. Preserve component/value-internal
directives rather than treating their opaque text as JSON.

[fixture: architecture/global-directives/composite-boundaries]

[fixture: architecture/global-directives/global-both-separated]

[fixture: architecture/global-directives/global-left-touch-right-separated]

[fixture: architecture/global-directives/global-neither-side-separated]

[fixture: architecture/global-directives/global-side-spacing]

[fixture: architecture/global-directives/global-standalone]

[fixture: architecture/global-directives/inside-values]

[fixture: architecture/global-directives/multiline]

[corpus fixture: architecture/directive-fields]

[corpus fixture: architecture/directive-edge-components]

[corpus fixture: architecture/directive-parent-align-components]

[corpus fixture: architecture/directive-icon-delimiters]

[corpus fixture: architecture/directive-group-delimiters]

[corpus fixture: architecture/end-group-unclosed-directive]

[corpus fixture: architecture/end-junction-unclosed-directive]

Input (escaped):
`"architecture-beta\nservice composite(%%{wrap}%%cloud%%{wrap}%%)\nservice target\ncomposite{%%{wrap}%%group%%{wrap}%%} : R < %%{wrap}%% -- > L :target\n"`.

Output
([global-directives/composite-boundaries-output.mmd](../tests/fixtures/architecture/global-directives/composite-boundaries-output.mmd)):

```mmd
architecture-beta
  service composite(%%{wrap}%%cloud%%{wrap}%%)
  service target
  composite{%%{wrap}%%group%%{wrap}%%}:R < %%{wrap}%% --> L:target
```

### Hidden forms

Keep each ArchitectureIgnoredText exactly once in its named gap,
textBeforeHeader, body or textAfter owner, using its complete source span rather
than its trivia-filtered value. Native YAML and DIRECTIVE are opaque, not
frontmatter or Root directives. Body openers may indent; internal and closing
columns stay. Keep three-fence matches, separate forms, later qualifying closers
and internal global cuts. Earlier values retain ownership of hidden-looking
text; no native gap is invented inside icons or modifiers.

[fixture: architecture/hidden-forms/body-directive]

[fixture: architecture/hidden-forms/body-yaml]

[fixture: architecture/hidden-forms/hidden-group-parent-gaps]

[fixture: architecture/hidden-forms/hidden-rhs-modifier-gap]

[fixture: architecture/hidden-forms/yaml-named-icon-title-and-parent-gaps]

[corpus fixture: architecture/hidden-directive-unit-gaps]

[corpus fixture: architecture/hidden-yaml-group-gap]

[corpus fixture: architecture/hidden-yaml-service-gap]

[corpus fixture: architecture/hidden-yaml-junction-gap]

[corpus fixture: architecture/hidden-yaml-parent-gap]

[corpus fixture: architecture/hidden-yaml-edge-gaps]

[corpus fixture: architecture/hidden-yaml-align-gap]

[corpus fixture: architecture/hidden-yaml-three-fences]

[corpus fixture: architecture/hidden-yaml-adjacent-later-closer]

[corpus fixture: architecture/lex-yaml-two-nonempty]

[corpus fixture: architecture/lex-yaml-global-directive]

[corpus fixture: architecture/lex-yaml-common-comment]

[corpus fixture: architecture/lex-yaml-selected-semicolon]

[corpus fixture: architecture/lex-native-directive-selected-semicolon]

[corpus fixture: architecture/hidden-directive-nonqualifying-close]

[corpus fixture: architecture/hidden-directive-close-glued]

[corpus fixture: architecture/hidden-directive-unclosed]

[corpus fixture: architecture/hidden-directive-inside-values]

[corpus fixture: architecture/hidden-yaml-inside-values]

[corpus fixture: architecture/gram-hidden-inside-icon]

[corpus fixture: architecture/gram-hidden-inside-modifier]

Input (escaped):
`"architecture-beta\n%%{!opaque\nbody}%%\nservice body_directive\n"`.

Output
([hidden-forms/body-directive-output.mmd](../tests/fixtures/architecture/hidden-forms/body-directive-output.mmd)):

```mmd
architecture-beta
  %%{!opaque
body}%%
  service body_directive
```

### Hidden boundaries

Reuse the shared consumed-LF and closing-padding rules: these boundaries decide
whether the following statement has visible EOL. A statement suffix without
closing padding needs one spare LF before its successor; EOF also ends a
statement. Only the header's own hidden forms need no spare LF. A statement
retained on the header line still has a statement boundary after its suffix.
Keep multiple suffix owners and forms after visible EOL distinct; exterior
excess blanks use the shared one-blank-line rule.

[fixture: architecture/hidden-boundaries/header-and-statement]

[fixture:
architecture/hidden-boundaries/header-inline-statement-suffix-spare-fixed]

[fixture: architecture/hidden-boundaries/header-own-hidden-no-spare-fixed]

[fixture: architecture/hidden-boundaries/hidden-multiple-blank-grouping]

[fixture: architecture/hidden-boundaries/suffix-space]

[fixture: architecture/hidden-boundaries/yaml-header-inline-statement-suffix]

[fixture: architecture/hidden-boundaries/yaml-space]

[corpus fixture: architecture/hidden-directive-group-space]

[corpus fixture: architecture/hidden-directive-closing-space]

[corpus fixture: architecture/hidden-directive-junction-space]

[corpus fixture: architecture/hidden-directive-edge-space]

[corpus fixture: architecture/hidden-directive-align-space]

[corpus fixture: architecture/hidden-directive-title-space]

[corpus fixture: architecture/hidden-directive-acctitle-space]

[corpus fixture: architecture/hidden-directive-accdescr-space]

[corpus fixture: architecture/hidden-directive-block-space]

[corpus fixture: architecture/hidden-directive-spare-lf]

[corpus fixture: architecture/hidden-yaml-service-space]

[corpus fixture: architecture/hidden-yaml-service-spare]

[corpus fixture: architecture/hidden-yaml-group-space]

[corpus fixture: architecture/hidden-yaml-junction-space]

[corpus fixture: architecture/hidden-yaml-edge-space]

[corpus fixture: architecture/hidden-yaml-align-space]

[corpus fixture: architecture/hidden-yaml-common-space]

[corpus fixture: architecture/hidden-yaml-title-absorbs-opener]

[corpus fixture: architecture/hidden-yaml-acctitle-absorbs-opener]

[corpus fixture: architecture/hidden-yaml-accdescr-absorbs-opener]

[corpus fixture: architecture/lex-hidden-two-suffixes]

[corpus fixture: architecture/lex-hidden-after-visible-eol]

[corpus fixture: architecture/hidden-directive-body]

[corpus fixture: architecture/hidden-yaml-after-header]

Input (escaped): `"architecture-beta%%{}%% group a%%{}%%\n\nservice b"`.

Output
([hidden-boundaries/header-and-statement-output.mmd](../tests/fixtures/architecture/hidden-boundaries/header-and-statement-output.mmd)):

```mmd
architecture-beta%%{}%% group a%%{}%%

  service b
```

### Blank lines

Keep at most one ordinary ASCII blank line between statements or trivia,
removing ordinary body/document-edge blanks. This preserves visible grouping
without excess space. Value interiors, retained prefixes, protected segments and
required hidden-boundary LFs keep their own rules.

[fixture: architecture/blank-lines/blank-collapse]

[fixture: architecture/blank-lines/blank-in-value-kept]

Input (escaped):
`"\n\narchitecture-beta\n\n\nservice a\n\n \t\n\n%% note\n\n\nservice b\n\n\n"`.

Output
([blank-lines/blank-collapse-output.mmd](../tests/fixtures/architecture/blank-lines/blank-collapse-output.mmd)):

```mmd
architecture-beta
  service a

  %% note

  service b
```

### Trailing whitespace

Remove harmless exterior ASCII padding after the header and completed
declarations, edges, alignments and description closers. Keep source inside
values and continuation lines, comment tails, directive/hidden interiors,
retained prefixes and protected segments. Hidden closing padding remains even at
EOF because trimming it can remove visible EOL.

[fixture: architecture/trailing-whitespace/trailing-exterior]

[fixture: architecture/trailing-whitespace/trailing-string-content-kept]

Input (escaped):
`"architecture-beta \t\nservice a(cloud)[A] \t\njunction j\t\na:R -- L:j\t\nalign row a j \t\naccDescr {D}\t\n"`.

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/architecture/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
architecture-beta
  service a(cloud)[A]
  junction j
  a:R -- L:j
  align row a j
  accDescr {D}
```

### Frontmatter yaml

Format only safe real frontmatter with the shared guarded YAML formatter. Keep
malformed YAML, indented fences, delimiter padding, HTML hazards and bodies
whose formatting would produce a fence. YAML uses the shared positive minimum
indentation at tabWidth zero. If textBeforeHeader is present, retain the
complete prefix, including leading LF, comments, passed bare trivia, second-scan
forms and real/hidden order: cleanup could promote ignored YAML into effective
data.

[fixture: architecture/frontmatter-yaml/frontmatter-delimiter-padding-kept]

[fixture: architecture/frontmatter-yaml/frontmatter-html-guard]

[fixture: architecture/frontmatter-yaml/frontmatter-indented-keep]

[fixture: architecture/frontmatter-yaml/frontmatter-safe]

[fixture: architecture/frontmatter-yaml/frontmatter-yaml-delimiter-hazard]

[fixture: architecture/frontmatter-yaml/frontmatter-zero-minimum-block-scalar]

[fixture: architecture/frontmatter-yaml/invalid-real]

[fixture: architecture/frontmatter-yaml/prefix-leading-lf-keep]

[fixture: architecture/frontmatter-yaml/real-and-retained]

[fixture: architecture/frontmatter-yaml/second-scan]

[corpus fixture: architecture/div-frontmatter-invalid-yaml]

[corpus fixture: architecture/div-invalid-keeps-config]

[corpus fixture: architecture/frontmatter-config]

[corpus fixture: architecture/div-frontmatter-open-tag-label]

[corpus fixture: architecture/detect-retained-before-second-scan]

[corpus fixture: architecture/detect-retained-bare-second-scan]

[corpus fixture: architecture/detect-retained-three-fences]

[corpus fixture: architecture/detect-retained-indent-opening]

[corpus fixture: architecture/retained-prefix-before-bare]

[corpus fixture: architecture/retained-directive-between-bare]

Input (escaped):
`"---\ntitle: \"<a b=\\\"c\\\">\"\n---\narchitecture-beta\nservice a\n"`.

Output
([frontmatter-yaml/frontmatter-html-guard-output.mmd](../tests/fixtures/architecture/frontmatter-yaml/frontmatter-html-guard-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
architecture-beta
  service a
```

### Semicolons

Keep every authored semicolon and use shared `protectSemicolonPrefixes`. Protect
the textual segment through its last semicolon, extending through whole crossing
values and trivia; format safe suffix gaps only. Protected
header/first-statement groups stay together. Removing one selected semicolon or
moving style/classDef triggers can select another and change the Db, so keep
both passes, nontriggers, entities, physical value lines and global-rejoined
triggers.

[fixture: architecture/semicolons/crossing-comment]

[fixture: architecture/semicolons/global-rejoin]

[fixture: architecture/semicolons/protected-header-first-statement]

[fixture: architecture/semicolons/selection]

[fixture: architecture/semicolons/values]

[corpus fixture: architecture/style-fields]

[corpus fixture: architecture/style-controls]

[corpus fixture: architecture/style-entity-semicolons]

[corpus fixture: architecture/style-block]

[corpus fixture: architecture/style-other-line]

[corpus fixture: architecture/style-quoted-lines]

[corpus fixture: architecture/lex-yaml-global-opener]

[corpus fixture: architecture/lex-label-selected-semicolon-after-quote]

[test: architecture/semicolons/unicode-segment]

Input (escaped):
`"architecture-beta\naccDescr {\nstyle A fill:#red\n%% owned;\ntext\n}\n"`.

Output
([semicolons/crossing-comment-output.mmd](../tests/fixtures/architecture/semicolons/crossing-comment-output.mmd)):

```mmd
architecture-beta
  accDescr {
style A fill:#red
%% owned;
text
  }
```

### Line terminators and unicode

Use the shared host policy: normalize physical CR/CRLF to LF, then emit
configured endOfLine, including in values and hidden forms. Keep LS/PS/NBSP/BOM
in content; common line-value edges alone trim common whitespace. Non-ASCII
structural separators remain rejected. A leading BOM follows Prettier host
handling rather than byte identity.

[corpus fixture: architecture/hidden-yaml-crlf]

[corpus fixture: architecture/line-cr-title]

[corpus fixture: architecture/line-cr-values]

[corpus fixture: architecture/frontmatter-crlf]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/lex-yaml-ls-ps-body]

[corpus fixture: architecture/common-block-ls-gap]

[corpus fixture: architecture/common-block-bom-gap]

[corpus fixture: architecture/line-ls-between]

[corpus fixture: architecture/space-body-nbsp]

[corpus fixture: architecture/div-retained-bare-second-scan-ls]

[corpus fixture: architecture/space-bom-leading]

[corpus fixture: architecture/detect-retained-leading-bom]

[test: architecture/line-terminators-and-unicode/cr-structure]

[test: architecture/line-terminators-and-unicode/crlf-values-hidden]

[test: architecture/line-terminators-and-unicode/cr-yaml-block]

[test: architecture/line-terminators-and-unicode/output-crlf]

[test: architecture/line-terminators-and-unicode/output-cr]

[test: architecture/line-terminators-and-unicode/value-content]

[test: architecture/line-terminators-and-unicode/common-edge-trim]

[test: architecture/line-terminators-and-unicode/bom-header]

[test: architecture/line-terminators-and-unicode/hidden-content]

[test: architecture/line-terminators-and-unicode/description-content]

[test: architecture/line-terminators-and-unicode/frontmatter-crlf]

[test: architecture/line-terminators-and-unicode/frontmatter-bom]

Input (escaped): `"architecture-beta\rservice cr_node\r"`.

Output (escaped): `"architecture-beta\n  service cr_node\n"`.

### Final newline

End ordinary accepted input with one configured newline, including empty bodies,
final statements and comments. Remove ordinary terminal blank runs for a
predictable file ending. EOF-reaching global directives and hidden closing
padding keep their shared boundary behavior; a closed hidden form can gain LF.

[fixture: architecture/final-newline/ending-comment]

[fixture: architecture/final-newline/ending-common-empty]

[fixture: architecture/final-newline/ending-hidden-space]

[fixture: architecture/final-newline/ending-service]

[fixture: architecture/final-newline/ending-triple-comment]

[fixture: architecture/final-newline/global-open-at-eof]

[corpus fixture: architecture/hidden-directive-eof]

[corpus fixture: architecture/hidden-yaml-service-eof]

[corpus fixture: architecture/end-group-unclosed-directive]

[corpus fixture: architecture/end-junction-unclosed-directive]

Input (escaped): `"architecture-beta\nservice a"`.

Output
([final-newline/ending-service-output.mmd](../tests/fixtures/architecture/final-newline/ending-service-output.mmd)):

```mmd
architecture-beta
  service a
```

### Source order

Keep every statement, reference, alignment member, repeated edge/constraint and
empty assignment in source order. Do not rebuild the tree from the Db or sort
declarations into publication order: those steps lose authored structure, and
deleting an empty assignment can change the final value. Numeric-looking IDs
remain written text.

[fixture: architecture/source-order/authored-order]

[corpus fixture: architecture/db-mixed]

[corpus fixture: architecture/db-junction-order]

[corpus fixture: architecture/db-duplicate-edges]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/lex-numeric-ids-text]

[corpus fixture: architecture/db-prototype-ids]

[corpus fixture: architecture/db-id-case]

[corpus fixture: architecture/common-repeat-empty]

Input (escaped):
`"architecture-beta\nalign row later cross\njunction cross in parent\nservice later in parent\ngroup parent\nlater:R -- L:cross\nlater:R -- L:cross\nalign column cross later\nalign row later cross\ntitle First\ntitle\naccTitle: First\naccTitle:\naccDescr {First}\naccDescr {}\n"`.

Output
([source-order/authored-order-output.mmd](../tests/fixtures/architecture/source-order/authored-order-output.mmd)):

```mmd
architecture-beta
  align row later cross
  junction cross in parent
  service later in parent
  group parent
  later:R -- L:cross
  later:R -- L:cross
  align column cross later
  align row later cross
  title First
  title
  accTitle: First
  accTitle:
  accDescr {First}
  accDescr {}
```

### Specified readings

Use the existing specification readings for directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque and bare-percent-line-before-header. Architecture has no
acceptance-setting configuration key, and its detection precedes C4. Raw
rejection supplies no raw Db. Do not repair rejected syntax: standalone
formatting reports a syntax error without output; Markdown declines embedding.
Empty quoted icons/labels, empty descriptions and native hidden forms need no
new divergence.

[corpus fixture: architecture/div-frontmatter-invalid-yaml]

[corpus fixture: architecture/div-frontmatter-open-tag-icon]

[corpus fixture: architecture/div-retained-bare-second-scan-ls]

[corpus fixture: architecture/div-directive-name]

[corpus fixture: architecture/div-semicolon-parent-id]

[corpus fixture: architecture/error-service-duplicate]

[corpus fixture: architecture/error-edge-group-lhs]

[corpus fixture: architecture/config-embedded-limit]

[test: architecture/specified-readings/bare-unicode]

For example, `service a%%{wrap}%%b` is an atomic ID cut and produces no repaired
output.

### Markdown fences

Apply the same rules to the dedented payload through the shared Markdown route.
The host supplies fence/list/quote indentation and EOL. It trims final
payload-line padding, including final hidden padding, while interior hidden
boundaries remain necessary. Check host output and idempotence separately from
payload Db and source preservation.

[test: architecture Markdown: top-level]

[test: architecture Markdown: list]

[test: architecture Markdown: quote]

[test: architecture Markdown: zero]

[test: architecture Markdown: tabs]

[test: architecture Markdown: hidden-gap]

[test: architecture Markdown: hidden-boundary]

[test: architecture Markdown: preheader]

[test: architecture Markdown: frontmatter]

[test: architecture Markdown: global-and-semicolons]

[test: architecture Markdown: final-comment]

[test: architecture Markdown: final-hidden-padding]

[test: architecture Markdown: rejected]

Input (escaped):

````json
"```mermaid\narchitecture-beta service fence\n```\n"
````

Output (escaped):

````json
"```mermaid\narchitecture-beta\n  service fence\n```\n"
````
