# Usecase formatting rules

Japanese version: [usecase.ja.md](./usecase.ja.md)

These rules format `usecase-beta` from its written
[syntax tree](../../spec/docs/ast/usecase.md), following the
[usecase specification](../../spec/docs/diagrams/usecase.md). Each rule explains
its choice, links shared rules with their reasons, and cites fixed sentence-led
fixtures. Inputs use escaped JSON strings; each output block copies one fixture.
Unicode/control/CR cases are escaped in `usecase-cases.ts`.

HWS means ASCII horizontal whitespace: U+0020 SPACE and U+0009 TAB. LS means
U+2028 LINE SEPARATOR; PS means U+2029 PARAGRAPH SEPARATOR.

Formatting follows the shared failure path: standalone parser failures report
`SyntaxError`, and rejected Markdown payloads are declined to their host.
Headers, semicolon-separated statements, aliases, chains, nested boundaries,
unresolved notes, native validation and unclosed strings are never repaired. In
particular, usecase rejects unclosed single-quoted strings, including native
metadata; the EOF rule for class backquoted names does not apply. [corpus
fixture: usecase/header-uppercase] [corpus fixture:
usecase/gram-two-statements-line] [corpus fixture: usecase/gram-entity-as-alias]
[corpus fixture: usecase/gram-arrow-chain] [corpus fixture:
usecase/gram-boundary-nested] [corpus fixture: usecase/gram-note-unresolved]
[corpus fixture: usecase/gram-metadata-unknown-key] [corpus fixture:
usecase/lex-plain-unclosed] [corpus fixture:
usecase/lex-native-single-quote-comment-region-lf]

Accepted divergences use the specified reading under
[Compatibility](./compatibility.md#usecase-native-syntax-and-authored-values).
The six existing identifiers are `directive-as-token-boundary`,
`ignored-semicolon-as-token-boundary`, `html-tag-in-frontmatter`,
`embedded-data-opaque`, `c4-keyword-anywhere` and
`bare-percent-line-before-header`; they do not make every `div-` input accepted.
All corpus inputs run through the shared format/corpus test families, including
rejections and the marked cases. A raw rejection provides no raw Db. [corpus
fixture: usecase/div-directive-in-id] [corpus fixture:
usecase/div-semicolon-identifier-selected] [corpus fixture:
usecase/div-html-frontmatter-acc-title-db] [corpus fixture:
usecase/div-gram-json-unquoted-key] [corpus fixture:
usecase/div-detect-c4-label] [corpus fixture:
usecase/div-comment-preheader-bare]

## Rules

### Header

Reuse the visible header convention of [C4](./c4.md#header): put exact
lower-case `usecase-beta` at column one and place the body below it, so the
diagram starts visibly. Exterior ASCII spaces/tabs disappear; direction remains
a separate statement. A header alone is accepted and gains the ordinary final
newline; case, stable-header and inline-body failures follow the shared failure
path. Leading comments and directives follow their rules below.

[fixture: header/header-column] [fixture: header/leading-trivia-empty] [corpus
fixture: usecase/spec-usecase-parser-7ae00acb]

Input (escaped): `" \tusecase-beta  \nA"`

Output
([header/header-column-output.mmd](../tests/fixtures/usecase/header/header-column-output.mmd)):

```mmd
usecase-beta
  A
```

### Indentation

Reuse structural [class indentation](./class.md#indentation): one configured
step below the header, two for boundary declarations, and `end` aligned with its
opener make membership visible. [fixture:
system-boundaries/boundary-header-comment-empty] A step follows `tabWidth` and
`useTabs`, two spaces by default or one tab per level. Indentation does not
determine usecase syntax, so `tabWidth: 0` stays zero; accessibility remains
accessibility at column zero and after ASCII whitespace. YAML retains the shared
minimum of one. Value, JSON and directive continuation columns stay authored.
[fixture: native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive] [fixture:
classes-and-styles/css-name-multiline-directive] [fixture:
json-tables/json-prefix-id-at-multiline-directive]

[fixture: indentation/indent-depth] [fixture: indentation/indent-four] [fixture:
indentation/indent-tabs] [fixture: indentation/indent-zero] [fixture:
indentation/indent-zero-a11y] [fixture: indentation/indent-zero-tabs] [fixture:
indentation/boundary-comments-before-end] [fixture:
indentation/zero-tabs-boundary] [fixture: indentation/value-and-json-columns]

Input (escaped):
`"usecase-beta\nsystemBoundary Portal\nactor User\nTask(Work)\nend\nUser-->Task"`

Output
([indentation/indent-depth-output.mmd](../tests/fixtures/usecase/indentation/indent-depth-output.mmd)):

```mmd
usecase-beta
  systemBoundary Portal
    actor User
    Task(Work)
  end
  User --> Task
```

### Statements and semicolons

Each native statement keeps its required physical grammar line; semicolons never
separate statements, and actor lists use commas. Reuse the non-separator
[C4 kept-prefix policy](./c4.md#line-rule-and-semicolons): every semicolon
stays, including a selected terminal one whose deletion would be Db-equal,
because one source policy avoids retargeting the shared textual rule. Protect
text from the first non-whitespace character through the last semicolon of each
segment, extending through whole crossing values, CSS declarations, comments and
directives. Exterior indentation and a safe suffix still format. [fixture:
native-metadata/metadata-selected-semicolon-between-properties] Both textual
passes, colon/hash separation, Unicode segment boundaries and an open
directive's semicolon stop keep their reading.

[fixture: statements-and-semicolons/statements-lines] [fixture:
statements-and-semicolons/semicolon-label-content] [fixture:
statements-and-semicolons/semicolon-selected-boundary] [fixture:
statements-and-semicolons/semicolon-selected-retarget-kept] [fixture:
statements-and-semicolons/safe-suffix-after-kept-value] [fixture:
statements-and-semicolons/selected-directive-prefix]

Input (escaped): `"usecase-beta\n actor  Reader\nRead(Inspect)\nReader-->Read"`

Output
([statements-and-semicolons/statements-lines-output.mmd](../tests/fixtures/usecase/statements-and-semicolons/statements-lines-output.mmd)):

```mmd
usecase-beta
  actor Reader
  Read(Inspect)
  Reader --> Read
```

### Declarations

Reuse [ER's compact entity layout](./er.md#entities): one gap after `actor`,
tight id/shape delimiters and metadata/class suffixes, no exterior ASCII label
padding, and comma-space between actor items. Stereotype spacing follows
[its class-based rule](#stereotypes). Keep explicit ids, quoted-only names,
ellipse/rectangle spelling, label kinds, suffix order and every
declaration/reference occurrence. Generated ids and resolved actor endpoints
never replace authored nodes; boundary metadata forms remain declarations while
top-level forms remain updates. This shows written syntax without inventing
aliases or geometry.

[fixture: declarations/actor-list] [fixture: declarations/entity-shapes]
[fixture: declarations/suffixes] [fixture: declarations/generated-name]
[fixture: declarations/shape-change-kept] [fixture:
declarations/reference-not-redeclared] [fixture:
declarations/actor-source-occurrence]

Input (escaped):
`"usecase-beta\nactor  User ( Person ) , Clerk('Desk') , \"Guest\""`

Output
([declarations/actor-list-output.mmd](../tests/fixtures/usecase/declarations/actor-list-output.mmd)):

```mmd
usecase-beta
  actor User(Person), Clerk('Desk'), "Guest"
```

### Labels

Reuse [C4's authored value forms](./c4.md#argument-forms): bare, single-quoted,
double-quoted and markdown labels keep their spelling and interior characters,
including empty quoted values. Plain quotes can be Db-equal to bare text, but
retaining the author's form avoids unnecessary rewriting; markdown changes the
label type. Only exterior ASCII HWS outside a bare label's contributing units is
trimmed. Internal gaps, Unicode padding, backslashes, entities and HTML stay;
`singleQuote` does not rewrite native strings.

[fixture: labels/label-quote-kinds] [fixture: labels/label-empty-quotes]
[fixture: labels/label-quote-rewrite-kept] [fixture:
labels/label-quote-remove-kept] [fixture: labels/label-interior-kept] [fixture:
labels/label-backslash-kept] [fixture: labels/label-html-entities] [fixture:
labels/div-c4-label] [fixture: labels/label-markdown-remove-kept] [test:
usecase: label-unicode-padding] [fixture: labels/single-quote-option] [fixture:
labels/empty-shape-labels] [corpus fixture: usecase/div-c4-inline-percent-eof]

Input (escaped):
``"usecase-beta\nA(unquoted  words)\nB(' single  text ')\nC(\" double  text \" )\nD(\"` markdown  text `\")"``

Output
([labels/label-quote-kinds-output.mmd](../tests/fixtures/usecase/labels/label-quote-kinds-output.mmd)):

```mmd
usecase-beta
  A(unquoted  words)
  B(' single  text ')
  C(" double  text ")
  D("` markdown  text `")
```

### Stereotypes

Reuse the spacing of annotations attached to
[class statements](./class.md#whitespace-between-tokens): keep whether
whitespace is present inside each delimiter, shrinking a nonempty run to one
ASCII space. Thus `<<a>>` stays `<<a>>`, while `<<  a  >>` becomes `<< a >>`;
each side is independent, and no padding is added. The gap before `<<` follows
the same class rule: touching stays touching, and existing whitespace becomes
one ASCII space. [fixture: stereotypes/opener-gap-sides] [test: usecase:
stereotype-opener-tab] Actors and use cases follow the same rule, including
relationship endpoints and declarations inside system boundaries. Mermaid trims
the interior ends; whitespace before `<<` is structural. Both spacing choices
keep the Db, so usecase follows the shared rule. [fixture:
stereotypes/stereotype-inner-kept] [fixture: stereotypes/stereotype-padding]
[fixture: stereotypes/declaration-suffixes] [fixture: stereotypes/side-padding]
[fixture: stereotypes/endpoint-suffixes] [fixture:
stereotypes/boundary-suffixes]

Keep the interior text as written: word gaps, nested openers, quotes,
backslashes, punctuation and directives remain. LS/PS and NBSP can be interior
content; exterior common whitespace follows the padding rule. [fixture:
stereotypes/stereotype-plain-backslash] [fixture: stereotypes/directive-padding]
[fixture: stereotypes/directive-gap-sides] [test: usecase:
stereotype-unicode-exterior-padding] [test: usecase:
stereotype-unicode-gap-sides] Protected common comment regions and semicolon
prefixes still retain complete crossing values, including their padding.
[fixture: stereotypes/semicolon-padding-kept] [test: usecase:
stereotype-comment-region-padding-kept] Physical multiline, empty and unclosed
failures are never repaired. [corpus fixture: usecase/gram-stereotype-newline]
[corpus fixture: usecase/gram-stereotype-empty] [corpus fixture:
usecase/gram-stereotype-open]

[fixture: stereotypes/stereotype-padding] [fixture:
stereotypes/stereotype-inner-kept] [fixture: stereotypes/stereotype-punctuation]
[fixture: stereotypes/directive-and-selected-semicolon]

Input (escaped): `"usecase-beta\nactor User <<  service  user  >>"`

Output
([stereotypes/stereotype-padding-output.mmd](../tests/fixtures/usecase/stereotypes/stereotype-padding-output.mmd)):

```mmd
usecase-beta
  actor User << service  user >>
```

### System boundaries

Openings, declaration bodies and aligned `end` use separate lines, including
empty boundaries and empty quoted names. [fixture:
system-boundaries/boundary-header-comment-empty] Reuse the authored heading
choice of [flowchart subgraphs](./flowchart.md#subgraph-header): an id/title gap
becomes one space if present, touching stays touching, and parentheses/brackets
with their interior padding stay written. [fixture:
system-boundaries/boundary-id-title-directed-gap] Compact title padding is
Db-equal, but keeping container headings consistent with flowchart avoids a
second heading policy. Preserve native metadata/classes and repeated
declarations; body membership comes from the AST's single declaration-body
level.

[fixture: system-boundaries/boundary-headings] [fixture:
system-boundaries/boundary-empty] [corpus fixture: usecase/db-empty-boundary-id]
[fixture: system-boundaries/boundary-title-touch] [fixture:
system-boundaries/empty-quoted-name-members] [fixture:
system-boundaries/repeated-boundaries] [fixture:
system-boundaries/quoted-markdown-title]

Input (escaped):
`"usecase-beta\nsystemBoundary Box [ Display ] @{ type : 'package' } ::: box , group\nactor User\nA@{ business : true }\nend"`

Output
([system-boundaries/boundary-headings-output.mmd](../tests/fixtures/usecase/system-boundaries/boundary-headings-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box [ Display ]@{ type: 'package' }:::box,group
    actor User
    A@{ business: true }
  end
```

### Arrows

Reuse readable [arrow spacing](./class.md#arrow-spacing): one ordinary gap on
each side of the actual complete usecase operator. Keep direction, marker, case
and every dash/dot, including long split closing halves whose Db length is
fixed. Semantic operators print compact `..>:InClUdE` or the written extend
case, then one target gap; their colon and keyword are operator syntax.
[fixture: arrows/semantic-operator-directives] Case normalization can be
Db-equal, but authored spelling follows the shared keyword policy. Never swap
endpoints or translate operator families.

[fixture: arrows/arrows-solid] [fixture: arrows/arrows-markers] [fixture:
arrows/arrows-semantic] [fixture: arrows/arrows-length-kept] [fixture:
arrows/arrows-source-order-kept] [fixture: arrows/arrows-semantic-case-kept]
[fixture: arrows/arrows-generalization-actors] [fixture:
arrows/extended-split-lengths]

Input (escaped): `"usecase-beta\nA..>:InClUdE B\nB..> : EXTEND C\nC--|>D"`

Output
([arrows/arrows-semantic-output.mmd](../tests/fixtures/usecase/arrows/arrows-semantic-output.mmd)):

```mmd
usecase-beta
  A ..>:InClUdE B
  B ..>:EXTEND C
  C --|> D
```

### Arrow id boundaries

Space the arrow and endpoint exactly as the AST records them: `A --order` prints
`A --o rder`, while `A -- order` keeps `order`. Forward `--o`/`--x` are tried
before markerless `--` without a word boundary, so adding or removing a gap
inside those units changes the reading. Longer markerless dash runs and
uppercase O/X keep their recorded target; directives at complete boundaries
retain their gap sides. [fixture:
arrow-id-boundaries/arrow-marker-both-gap-sides] This differs from class's
o-marker boundary. Recovering an apparent intended id belongs to lint, not
formatting.

[corpus fixture: usecase/lex-forward-circle-id-prefix] [corpus fixture:
usecase/lex-forward-cross-id-prefix] [fixture:
arrow-id-boundaries/markerless-o-id] [fixture:
arrow-id-boundaries/markerless-x-id] [fixture:
arrow-id-boundaries/circle-spaced-id] [corpus fixture:
usecase/lex-forward-cross-id-spaced] [fixture:
arrow-id-boundaries/markerless-long-before-o] [fixture:
arrow-id-boundaries/marker-uppercase-is-id] [fixture:
arrow-id-boundaries/circle-prefix-suffixes]

Input (escaped):
`"usecase-beta\nStart --order\nrder@{business:true}\nclass rder current"`

Output
([arrow-id-boundaries/circle-prefix-suffixes-output.mmd](../tests/fixtures/usecase/arrow-id-boundaries/circle-prefix-suffixes-output.mmd)):

```mmd
usecase-beta
  Start --o rder
  rder@{ business: true }
  class rder current
```

### Relationship labels and ids

Reuse
[flowchart's authored edge-label principle](./flowchart.md#link-label-form) and
tight edge-id attachment: keep split labels with one exterior gap, and print an
explicit id touching `@` and its opening/sole arrow. Usecase keeps only its
allowed split halves, written label kinds, empty quoted labels, actor source
keywords and both endpoint occurrences. Explicit ids remain available to later
metadata/class/style targets. A pipe or class-style colon label would be another
grammar, and a chain is never split into valid relationships.

[fixture: relationship-labels-and-ids/split-labels] [fixture:
relationship-labels-and-ids/edge-id-tight] [fixture:
relationship-labels-and-ids/edge-id-split] [fixture:
relationship-labels-and-ids/edge-empty-label] [fixture:
relationship-labels-and-ids/edge-pipe-convert-kept] [fixture:
relationship-labels-and-ids/split-circle-and-cross]

Input (escaped):
``"usecase-beta\nA--  likes  -->B\nB<--'uses'--C\nC o-- part --- D\nD x--\"`blocks`\"----E"``

Output
([relationship-labels-and-ids/split-labels-output.mmd](../tests/fixtures/usecase/relationship-labels-and-ids/split-labels-output.mmd)):

```mmd
usecase-beta
  A -- likes --> B
  B <-- 'uses' -- C
  C o-- part --- D
  D x-- "`blocks`" ---- E
```

### Native metadata

Native metadata is parsed, validated syntax. Format only structural whitespace:
tight target/`@{`, no gap before a property colon, one after it, comma-space on
one line and one space inside inline braces, including `@{ }`. Preserve key and
scalar spelling, quote kinds, integer-looking text, booleans, order, duplicates,
separate updates, separators and trailing commas. [fixture:
native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive] Neither YAML nor opaque
flowchart/Agentflow metadata supplies a formatting model here.

Keep the first property on its written opening or following line. [fixture:
native-metadata/metadata-first-gap-standalone-directive] Ordinary
property/comment/directive lines stand one level below the containing statement;
a separate closing brace aligns with that statement. [fixture:
native-metadata/metadata-comma-comment-close] [fixture:
native-metadata/metadata-closer-directive-own-line] Preserve every metadata
blank line and comma-versus-newline separator; never insert a newline within a
key/colon/value property. [fixture:
native-metadata/metadata-first-gap-standalone-directive] [fixture:
native-metadata/metadata-selected-semicolon-between-properties] This improves
structural readability without changing native validation or the
declaration/update roles.

After common comment-region and line-terminator handling, the optional trailing
comma and physical line breaks between the last property and `}` total at most
two, with the comma allowed only before the line breaks. Keep the written line
breaks and blank lines of accepted tails. [corpus fixture:
usecase/gram-metadata-property-comma-no-newline] [corpus fixture:
usecase/gram-native-trailing-newline] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-three-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-four-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines] [corpus
fixture: usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
[corpus fixture: usecase/gram-edge-metadata-two-newlines] [corpus fixture:
usecase/gram-edge-metadata-three-newlines] [corpus fixture:
usecase/gram-metadata-trailing-comma-no-newline] [corpus fixture:
usecase/gram-native-trailing-comma-newline] [corpus fixture:
usecase/gram-metadata-trailing-comma-two-newlines] [corpus fixture:
usecase/gram-metadata-trailing-comma-three-newlines] [corpus fixture:
usecase/gram-native-trailing-newline-comma] [corpus fixture:
usecase/gram-metadata-tail-newline-before-comma] [corpus fixture:
usecase/gram-metadata-tail-newline-before-comma-newline] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-crlf] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-three-crlf] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-whitespace-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-whitespace-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-tab-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-tab-lines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-comment-two-newlines] [corpus fixture:
usecase/gram-metadata-no-trailing-comma-comment-three-newlines] A comma between
properties permits zero or more line breaks. [corpus fixture:
usecase/gram-metadata-property-comma-no-newline] [corpus fixture:
usecase/gram-metadata-property-comma-one-newline] [corpus fixture:
usecase/gram-metadata-property-comma-two-newlines] [corpus fixture:
usecase/gram-metadata-property-comma-three-newlines]

[fixture: native-metadata/metadata-inline] [fixture:
native-metadata/metadata-newline] [fixture: native-metadata/metadata-empty]
[fixture: native-metadata/metadata-duplicate-order] [fixture:
native-metadata/metadata-quote-spelling] [fixture:
native-metadata/metadata-update-order-kept] [fixture:
native-metadata/metadata-boolean-quote-kept] [fixture:
native-metadata/metadata-blank-lines-kept] [fixture:
native-metadata/metadata-target-roles] [fixture:
native-metadata/metadata-newline-separators] [fixture:
native-metadata/metadata-empty-touch] [fixture: native-metadata/all-targets]
[fixture: native-metadata/empty-multiline] [fixture:
native-metadata/blank-runs-around-trivia] [fixture:
native-metadata/boundary-property-columns] [fixture:
native-metadata/spelling-and-trailing-comma-option] [fixture:
native-metadata/multiline-directive-value-gap]

Input (escaped):
`"usecase-beta\nactor U @{\n type : hollow\n , business : true,\n}"`

Output
([native-metadata/metadata-newline-output.mmd](../tests/fixtures/usecase/native-metadata/metadata-newline-output.mmd)):

```mmd
usecase-beta
  actor U@{
    type: hollow
    , business: true,
  }
```

### JSON tables

Reuse [opaque data retention](./compatibility.md#embedded-data-is-not-checked):
keep the whole JSON data range, including `@`, its gap before `{`, every body
character and closing brace. Format only exterior json/id gaps and class
suffixes; one ordinary gap precedes the data. [fixture:
json-tables/json-prefix-id-at-multiline-directive] Nested objects, duplicates,
integer-key order, numbers/escapes, apparent comments and continuation columns
stay authored. Even Db-equal JSON pretty-printing edits opaque source; sorting
keys can change `propertyOrder`. Balanced malformed contents follow the
specified opaque reading, while balancing failures remain failures. Db checks
follow the shared data-block path: authored formatting fixtures without supplied
effects compare as null and check the written embedded strings instead. The
corpus uses recorded effects where available.

[fixture: json-tables/json-opaque] [corpus fixture:
usecase/gram-json-prefix-id-control] [fixture: json-tables/json-invalid-opaque]
[fixture: json-tables/json-order-kept] [fixture:
json-tables/json-directive-opaque] [fixture:
json-tables/numbers-escapes-and-comment-text] [fixture:
json-tables/empty-prefix-gap]

Input (escaped):
`"usecase-beta\njson  Table  @ {\n \"2\": 2, \"1\": {\"z\":1}, \"2\": 3\n} ::: data , table"`

Output
([json-tables/json-opaque-output.mmd](../tests/fixtures/usecase/json-tables/json-opaque-output.mmd)):

```mmd
usecase-beta
  json Table @ {
 "2": 2, "1": {"z":1}, "2": 3
}:::data,table
```

### Classes and styles

Reuse [ER's tight class lists](./er.md#styles-and-classes): commas touch target
and class names, with one gap between lists and before the first declaration;
CSS declarations use comma-space. Each CSS declaration stays exactly as written
from its name's start through its last value component. Mermaid stores padding
before and after the colon and inside `--  color`, so this is not ER's
whitespace-discarding CSS reading. Tabs, directives in the dash gap, quoted or
escaped commas, empty string components, functions, order and repetition stay.
[fixture: classes-and-styles/css-name-multiline-directive] Only exterior HWS
after the last component can disappear; selected-semicolon prefixes override
ordinary list layout.

[fixture: classes-and-styles/class-lists] [fixture:
classes-and-styles/css-colon-padding] [fixture:
classes-and-styles/css-post-colon-trim-kept] [fixture:
classes-and-styles/css-custom-gap] [fixture:
classes-and-styles/css-custom-gap-remove-kept] [fixture:
classes-and-styles/css-value-internal] [corpus fixture:
usecase/gram-css-empty-string-component] [fixture:
classes-and-styles/css-gap-directive] [fixture:
classes-and-styles/css-semicolon-gap] [corpus fixture:
usecase/lex-style-hash-semicolon] [fixture:
classes-and-styles/css-pre-colon-trim-kept] [fixture:
classes-and-styles/css-classdef-gap] [fixture:
classes-and-styles/css-line-rule-colon-gap-kept] [fixture:
classes-and-styles/css-both-passes] [test: usecase: css-other-case-segment]
[fixture: classes-and-styles/declaration-order-and-repetition] [fixture:
classes-and-styles/css-functions] [fixture:
classes-and-styles/css-inline-percent] [fixture:
classes-and-styles/trailing-after-comma]

Input (escaped):
`"usecase-beta\nA\nstyle  A   fill   :  red   ,  stroke-width : 2px  "`

Output
([classes-and-styles/css-colon-padding-output.mmd](../tests/fixtures/usecase/classes-and-styles/css-colon-padding-output.mmd)):

```mmd
usecase-beta
  A
  style A fill   :  red, stroke-width : 2px
```

### Notes

Print `note for <target> <label>` with one ordinary gap between parts, keeping
the target, authored bare/plain/markdown or empty label and note order. This
reuses the source-value and readable keyword-spacing reasons of
[class notes](./class.md#whitespace-between-tokens). Forward resolution never
manufactures an id, position or declaration; inline percent text remains label
content.

[fixture: notes/notes-forms] [fixture: notes/notes-forward] [fixture:
notes/notes-empty-markdown] [fixture: notes/empty-and-markdown-order]

Input (escaped):
`"usecase-beta\nA\nnote  for  A'quoted note'\nnote for A bare  note %% literal"`

Output
([notes/notes-forms-output.mmd](../tests/fixtures/usecase/notes/notes-forms-output.mmd)):

```mmd
usecase-beta
  A
  note for A 'quoted note'
  note for A bare  note %% literal
```

### Direction and accessibility

Direction prints `direction <written value>`, retaining TD and every occurrence
rather than rebuilding the final direction. Reuse
[class labels](./class.md#labels) and
[C4 accessibility lines](./c4.md#accessibility-lines): the colon touches its
keyword and one space precedes the trimmed value. Equivalent exterior whitespace
gets the same compact form as the sibling diagrams. Internal characters and
whitespace, comments, directives, percent and semicolon text stay. Empty and
whitespace-only lines print the colon form without a value. The next physical
line remains a separate statement; the siblings' next-line joining does not
apply. In particular, direction text after an empty colon line remains a
separate direction statement, rather than becoming accessibility value text.
[fixture: direction-and-accessibility/title-next-direction-separate] [fixture:
direction-and-accessibility/description-next-direction-separate] [fixture:
direction-and-accessibility/a11y-trimmed] [test: usecase: a11y-unicode-exterior]

Description blocks reuse [class multiline values](./class.md#multi-line-values):
keep the body's lines and columns and align a separate `}` with the statement.
The keyword-to-brace gap reuses
[flowchart's Whitespace between tokens](./flowchart.md#whitespace-between-tokens)
with the same reason: the common token-gap rule keeps contact that Mermaid may
need to read a token. Usecase has no reason to differ among these Db-equal
forms: `accDescr{ a }` stays touching; a space, run of spaces or tab becomes one
space. [fixture: direction-and-accessibility/keyword-brace-touching] [fixture:
direction-and-accessibility/keyword-brace-space] [fixture:
direction-and-accessibility/keyword-brace-run] [test: accessibility revisions:
usecase keyword-brace-tab] Empty and whitespace-only interiors print `{}`,
keeping that exterior gap. The source retention rules for protected common
comment regions and semicolon prefixes still take priority. Structural
indentation keeps the same layout with zero width or tabs. [fixture:
direction-and-accessibility/a11y-closer-aligned] [fixture:
direction-and-accessibility/a11y-closer-tabs] [fixture:
direction-and-accessibility/a11y-closer-zero] [fixture:
direction-and-accessibility/a11y-directive-padding]

[fixture: direction-and-accessibility/direction-values] [fixture:
direction-and-accessibility/a11y-padding] [fixture:
direction-and-accessibility/a11y-empty-distinct] [fixture:
direction-and-accessibility/a11y-block-value] [fixture:
direction-and-accessibility/a11y-trimmed] [fixture:
direction-and-accessibility/a11y-next-line-is-node] [fixture:
direction-and-accessibility/a11y-comment-empty] [fixture:
direction-and-accessibility/a11y-closer-aligned] [fixture:
direction-and-accessibility/all-directions] [fixture:
direction-and-accessibility/literal-directives-semicolons] [fixture:
direction-and-accessibility/empty-block-lines]

Input (escaped): `"usecase-beta\ndirection  TD\nA\ndirection\tBT\ndirection RL"`

Output
([direction-and-accessibility/direction-values-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/direction-values-output.mmd)):

```mmd
usecase-beta
  direction TD
  A
  direction BT
  direction RL
```

Input (escaped): `"usecase-beta\naccDescr{ a }\nA[Keyword gap]"`.

Output
([direction-and-accessibility/keyword-brace-touching-output.mmd](../tests/fixtures/usecase/direction-and-accessibility/keyword-brace-touching-output.mmd)):

```mmd
usecase-beta
  accDescr{ a }
  A[Keyword gap]
```

### Blank lines

Reuse [class blank grouping](./class.md#blank-lines): collapse ordinary blank
runs to one and drop diagram/boundary-edge blanks, because one blank separates
groups and more add nothing. ASCII space/tab-only lines are ordinary blanks,
including after native bare comments and around standalone directives. Values,
native metadata, JSON, directives and protected common-region joins keep their
own blank lines. No C4 recovery-gap or Ishikawa blank-pairing rule is imported.

[fixture: blank-lines/blank-runs] [fixture: blank-lines/blank-boundary]
[fixture: blank-lines/blank-comments] [fixture: blank-lines/blank-in-value]
[fixture: blank-lines/directives-and-boundary-edges]

Input (escaped): `"usecase-beta\nsystemBoundary Box\n\nactor U\n\n\nA\n\nend"`

Output
([blank-lines/blank-boundary-output.mmd](../tests/fixtures/usecase/blank-lines/blank-boundary-output.mmd)):

```mmd
usecase-beta
  systemBoundary Box
    actor U

    A
  end
```

### Comments

Reuse [standalone comment alignment](./class.md#comments): comments align with
nearby statements, with declarations before boundary `end`, and at column one
before the header, retaining all comment text and terminal HWS. [fixture:
system-boundaries/boundary-header-comment-empty] [test: usecase:
terminal-comment-tab] A native comment starts only at an ASCII-HWS-only
physical-line prefix and runs through LS/PS to LF/EOF; bare percent and
non-directive brace forms are comments here. There is no native trailing
statement comment: inline percent text remains label/note/CSS/accessibility
content where allowed. Common comment regions apply earlier in all contexts;
preserve their swallowed suffixes, joins and later columns so text is not
exposed or reindented into another value. No Agentflow size branch applies.

[fixture: comments/comments-align] [fixture: comments/comments-bare] [fixture:
comments/comments-inline-label] [test: usecase: comment-region-join] [corpus
fixture: usecase/div-comment-preheader-bare] [fixture:
comments/div-preheader-braces] [fixture: comments/inline-note-css-accessibility]
[fixture: comments/common-region-inside-values]

Input (escaped): `"usecase-beta\n%%\n%%{}%%\nA"`

Output
([comments/comments-bare-output.mmd](../tests/fixtures/usecase/comments/comments-bare-output.mmd)):

```mmd
usecase-beta
  %%
  %%{}%%
  A
```

### Directives

Reuse [shared directive attachment](./class.md#directives): removal supplies no
separator. Keep directive contents, order, touching and multiline columns; align
standalone directives and collapse only harmless exterior HWS gap sides.
[fixture: system-boundaries/boundary-id-title-directed-gap] [fixture:
arrows/semantic-operator-directives] [fixture:
arrow-id-boundaries/arrow-marker-both-gap-sides] Header-line directives remain
with the header. Value-side gaps, CSS name/value spans and opaque JSON remain
exact, including separate JSON id/`@`/brace boundaries. [fixture:
classes-and-styles/css-name-multiline-directive] [fixture:
json-tables/json-prefix-id-at-multiline-directive] Native `@{`, unquoted words
and arrows stay atomic. EOF-reaching directives keep their ending and semicolon
stops keep their place; quoted native keys/scalars may contain directive
fragments. [fixture: native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive]

[fixture: directives/directives-align] [fixture:
directives/directives-ordinary-gap] [fixture: directives/directives-touch]
[fixture: directives/directives-value-gap] [fixture:
directives/directives-multiline] [fixture: directives/directives-json-prefix]
[corpus fixture: usecase/directive-after-header] [fixture:
directives/directives-open-eof] [fixture:
directives/directives-native-key-quoted] [fixture:
directives/directives-css-value] [fixture: directives/directives-gap-prefix-o]
[fixture: directives/directives-header-spaced] [fixture:
directives/header-at-eof] [fixture: directives/before-boundary-end] [fixture:
directives/open-word-stop]

Input (escaped): `"usecase-beta\nactor  %%{init: {}}%%  User"`

Output
([directives/directives-ordinary-gap-output.mmd](../tests/fixtures/usecase/directives/directives-ordinary-gap-output.mmd)):

```mmd
usecase-beta
  actor %%{init: {}}%% User
```

### Multiline values and order

Reuse [C4 value columns](./c4.md#multiline-values) and
[flowchart's no-wrapping rule](./flowchart.md#line-wrapping): authored lines and
columns are characters, and `printWidth` does not wrap long statements. Keep
markdown, JSON, descriptions, directives and common-region continuations;
ordinary strings and stereotypes gain no physical newline. Native metadata
structure follows its own rule. [fixture:
native-metadata/metadata-key-multiline-directive] [fixture:
native-metadata/metadata-scalar-multiline-directive] Repeated compatible
declarations, boundaries, relationships, notes, class definitions/assignments
and updates stay in source order, even when a shorter representation would have
the same Db. Do not join physical statements or print the resolved model.

[fixture: multiline-values-and-order/no-wrap] [fixture:
multiline-values-and-order/multiline-markdown] [fixture:
multiline-values-and-order/repeated-order] [fixture:
multiline-values-and-order/wrap-arrow-kept] [fixture:
multiline-values-and-order/repeated-notes-and-updates]

Input (escaped):
`"usecase-beta\nVeryLongSourceIdentifier-- a deliberately long label -->VeryLongTargetIdentifier"`

Output
([multiline-values-and-order/no-wrap-output.mmd](../tests/fixtures/usecase/multiline-values-and-order/no-wrap-output.mmd)):

```mmd
usecase-beta
  VeryLongSourceIdentifier -- a deliberately long label --> VeryLongTargetIdentifier
```

### Trailing whitespace

Reuse [exterior cleanup](./c4.md#trailing-whitespace): remove harmless ASCII
spaces/tabs after completed structural forms and final CSS components. CSS colon
padding is inside its declaration and stays. Accessibility lines and stereotype
boundaries normalize exterior whitespace by their sibling rules. [fixture:
stereotypes/side-padding] Quoted/markdown values, JSON, native property strings,
comments and directive contents keep their trailing characters. [test: usecase:
terminal-comment-tab] [test: usecase: terminal-a11y-tab] Unicode characters are
not automatically exterior HWS; no dangling null CSS style is synthesized.

[fixture: trailing-whitespace/trailing-exterior] [fixture:
trailing-whitespace/trailing-values] [fixture:
trailing-whitespace/trailing-global-trim-kept] [fixture:
trailing-whitespace/opaque-and-metadata-lines]

Input (escaped):
`"usecase-beta  \nactor U \t\nA-->B  \nA@{ }\t\nstyle A fill:red \t"`

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/usecase/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
usecase-beta
  actor U
  A --> B
  A@{ }
  style A fill:red
```

### Line terminators

Reuse shared [line endings](./compatibility.md#line-endings): Mermaid normalizes
physical CR/CRLF to LF before reading, and output follows `endOfLine`, including
inside metadata, JSON, markdown, accessibility, CSS and directives. LS/PS remain
contextual characters in labels, stereotype text, notes, quoted native/CSS
values, accessibility and comments; accessibility and stereotype exterior
whitespace follows their normalization rules. [test: usecase:
a11y-unicode-exterior] [test: usecase: stereotype-unicode-exterior-padding] In
JSON they remain opaque string or structural content. Native comments continue
through them to LF, and textual semicolon segments retain their Unicode
boundaries. Rejected default id/gap/property/CSS placements are not repaired.
Leading common trivia alone uses the broader whitespace set. The shared
file-leading BOM and frontmatter limitation remains. Escaped tests keep these
characters out of package files. For example, `"usecase-beta\rA\rA-->B\r"`
prints `"usecase-beta\n  A\n  A --> B\n"`.

[test: usecase: eol-cr] [test: usecase: eol-crlf] [test: usecase: eol-output-cr]
[test: usecase: eol-output-crlf] [test: usecase: unicode-labels] [test: usecase:
unicode-stereotype] [test: usecase: unicode-native-metadata] [test: usecase:
unicode-json-string] [test: usecase: unicode-a11y] [test: usecase:
unicode-comment] [test: usecase: unicode-comment-to-lf-kept] [test: usecase:
unicode-metadata-separator-opaque] [test: usecase: bom-leading] [test: usecase:
unicode-note] [test: usecase: eol-cr-all-modes] [test: usecase:
unicode-css-string] [test: usecase: unicode-joined-native-metadata] [test:
usecase: unicode-semicolon-segments] [test: usecase: crlf-metadata-blank-lines]
[test: usecase: nbsp-css-string] [test: usecase: unicode-boundary-title] [test:
usecase: crlf-output-values]

### Frontmatter YAML

Reuse [guarded frontmatter](./flowchart.md#frontmatter-yaml): safe configuration
benefits from YAML formatting, while malformed bodies, indented delimiters, HTML
tag starts in written/formatted YAML and formatted delimiter hazards retain
their reading. Keep delimiters and closing padding, comments and directives
before the header; frontmatter title is not an accessibility statement, and
usecase clears the common title at this pin. YAML uses the shared positive
minimum even with `tabWidth: 0`, while the body remains zero. HTML
cross-frontmatter cases use the specified body-only reading without rewriting
body quotes to imitate raw Mermaid.

[fixture: frontmatter-yaml/frontmatter-safe] [corpus fixture:
usecase/div-frontmatter-malformed] [fixture:
frontmatter-yaml/frontmatter-indented] [fixture:
frontmatter-yaml/frontmatter-html-guard] [fixture:
frontmatter-yaml/frontmatter-delimiter-guard] [fixture:
frontmatter-yaml/frontmatter-zero] [fixture:
frontmatter-yaml/frontmatter-zero-scalar] [corpus fixture:
usecase/div-html-frontmatter-acc-title-db] [fixture:
frontmatter-yaml/closing-padding-and-trivia] [fixture:
frontmatter-yaml/body-only-html-reading] [fixture:
frontmatter-yaml/malformed-title] [fixture:
frontmatter-yaml/ineffective-title-types]

Input (escaped):
`"---\ntitle:   T\nconfig: {usecase: {useMaxWidth:  true}}\n---\nusecase-beta\nA"`

Output
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/usecase/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: T
config: { usecase: { useMaxWidth: true } }
---
usecase-beta
  A
```

### Final newline

Reuse the [shared file ending](./c4.md#final-newline): ordinary accepted input
ends with exactly one configured newline, including header-only input, bare
comments and empty accessibility lines. Padding kept by each value's rule stays
before it; accessibility exterior whitespace is trimmed by its rule. An
EOF-reaching directive gains no character inside its value. [test: usecase:
terminal-comment-tab] [test: usecase: terminal-a11y-tab] Exterior terminal
directive whitespace follows the shared range rule. Rejected syntax is never
rescued by adding an ending.

[fixture: final-newline/final-ordinary] [fixture:
final-newline/final-bare-comment] [fixture: final-newline/final-value-padding]
[fixture: final-newline/final-open-directive] [fixture:
final-newline/empty-title-and-bare-comment] [fixture:
final-newline/directive-exterior-whitespace] [corpus fixture:
usecase/db-acctitle-eof]

Input (escaped): `"usecase-beta\nA\n\n\n"`

Output
([final-newline/final-ordinary-output.mmd](../tests/fixtures/usecase/final-newline/final-ordinary-output.mmd)):

```mmd
usecase-beta
  A
```

### Markdown fences

Reuse shared [Markdown containers](./compatibility.md#markdown-code-blocks):
apply these rules to the dedented payload, while the host supplies fence, list
and quote indentation. Fixed host tests cover stereotype suffixes, native
metadata, JSON, multiline values, directives, zero width, tabs, an empty header
and declined failures. [test: usecase Markdown: stereotype-suffixes]
Accessibility lines trim exterior whitespace in standalone files and Markdown:
`accTitle:  Title  ` becomes `accTitle: Title` in both. Declined fences receive
only the host's whitespace/EOL handling.

[fixture: markdown-fences/markdown-top-payload] [fixture:
markdown-fences/markdown-list-payload] [test: usecase Markdown: top-level]
[test: usecase Markdown: list] [test: usecase Markdown: block-quote] [test:
usecase Markdown: zero-metadata] [test: usecase Markdown: tabs-boundary] [test:
usecase Markdown: json] [test: usecase Markdown: multiline-value] [test: usecase
Markdown: directives] [test: usecase Markdown: last-value-padding] [test:
usecase Markdown: rejected-payload] [test: usecase Markdown: empty-header]

Input (escaped): `"usecase-beta\nactor U\nU-->A"`

Output
([markdown-fences/markdown-top-payload-output.mmd](../tests/fixtures/usecase/markdown-fences/markdown-top-payload-output.mmd)):

```mmd
usecase-beta
  actor U
  U --> A
```
