# Wardley formatting rules

Japanese version: [wardley.ja.md](./wardley.ja.md)

The printer follows the 35 adopted items using the authored
[Wardley tree](../../spec/docs/ast/wardley.md). The diagram and pipeline bodies
use the same body function in the shared factory.
[Compatibility](./compatibility.md#wardley-authored-text-and-required-line-breaks)
records preserved text and differences from mermaid.js.

## Rules

### Header

Print the authored wardley-beta header at column one and move an ordinary first
statement below it. This makes the diagram type easy to find; add no colon.
Hidden forms, retained prefixes and protected lines keep their shared
boundaries, including an empty body.

[fixture: wardley/header/header-glued]

[fixture: wardley/header/header-inline]

[fixture: wardley/header/header-empty]

Input (escaped): `"wardley-betacomponentHeader[0.3,0.6]"`.

Output
([header/header-glued-output.mmd](../tests/fixtures/wardley/header/header-glued-output.mmd)):

```mmd
wardley-beta
  component Header [0.3, 0.6]
```

### Indentation

Indent ordinary statements, metadata and standalone trivia by one configured
step. The default is two spaces; tabWidth four uses four and tabWidth zero uses
zero because columns have no grammatical meaning. useTabs uses a tab even at
width zero. Protected segments align their first line with the body; their
interiors and later lines keep written columns.

[fixture: wardley/indentation/indent-two]

[fixture: wardley/indentation/indent-four]

[fixture: wardley/indentation/indent-zero]

[fixture: wardley/indentation/indent-tabs]

[fixture: wardley/indentation/indent-zero-tabs]

Input (escaped): `"wardley-beta\n component Indent [0.3,0.6]"`.

Output
([indentation/indent-two-output.mmd](../tests/fixtures/wardley/indentation/indent-two-output.mmd)):

```mmd
wardley-beta
  component Indent [0.3, 0.6]
```

### Pipeline

Print pipeline Parent { with children one step deeper and } aligned with the
parent statement. Keep the visible LF after { and each child, including at
tabWidth zero: the grammar requires them. These delimiters show the authored
parent and children without adding coordinates or generated IDs.

[fixture: wardley/pipeline/pipeline-depth]

[fixture: wardley/pipeline/pipeline-zero]

[fixture: wardley/pipeline/pipeline-tab]

Input (escaped):
`"wardley-beta\ncomponent Parent[0.4,0.5]\npipelineParent{\n component Child[0.6]label[-1,2]\n      }"`.

Output
([pipeline/pipeline-depth-output.mmd](../tests/fixtures/wardley/pipeline/pipeline-depth-output.mmd)):

```mmd
wardley-beta
  component Parent [0.4, 0.5]
  pipeline Parent {
    component Child [0.6] label [-1, 2]
  }
```

### Statements one per line

Put ordinary statements on separate lines and keep their required EOL. Add no
semicolon: Wardley does not use semicolons as statement separators. Apparent
statements inside values remain value text; the source tree already
distinguishes them.

[fixture: wardley/statements-one-per-line/statement-eol]

Input (escaped):
`"wardley-beta\nanchor Sep [0.8,0.2]\ncomponent Step [0.2,0.4]"`.

Output
([statements-one-per-line/statement-eol-output.mmd](../tests/fixtures/wardley/statements-one-per-line/statement-eol-output.mmd)):

```mmd
wardley-beta
  anchor Sep [0.8, 0.2]
  component Step [0.2, 0.4]
```

### Component spacing

Put one ordinary space between each command keyword and its first complete name,
number, string or bracket. The same rule formats glued keywords, including the
pipeline keyword: keyword terminals have no trailing boundary, and the AST
already separates them from the name. Keep trivia and hidden boundaries instead
of applying ordinary gap rules through them.

[fixture: wardley/component-spacing/keyword-anchor]

[fixture: wardley/component-spacing/keyword-component]

[fixture: wardley/component-spacing/keyword-evolve]

[fixture: wardley/component-spacing/keyword-note]

[fixture: wardley/component-spacing/keyword-annotations]

[fixture: wardley/component-spacing/keyword-annotation]

[fixture: wardley/component-spacing/keyword-accelerator]

[fixture: wardley/component-spacing/keyword-deaccelerator]

[fixture: wardley/component-spacing/keyword-evolution]

Input (escaped): `"wardley-beta\nanchorUser[0.8,0.3]"`.

Output
([component-spacing/keyword-anchor-output.mmd](../tests/fixtures/wardley/component-spacing/keyword-anchor-output.mmd)):

```mmd
wardley-beta
  anchor User [0.8, 0.3]
```

[corpus fixture: wardley/keywords-all-glued]

### Names and quotes

Keep WardleyIdentifier and StringLiteral source spans, including internal
spaces/tabs, hyphens, parentheses, ampersands, quote styles, escapes, empty
strings and whitespace-only strings. singleQuote does not re-encode them.
Collapsing name whitespace or trimming string contents changes the Db; even
Db-equal requoting loses the authored spelling and needs another escape
interpretation.

[fixture: wardley/names-and-quotes/name-spaces]

[fixture: wardley/names-and-quotes/name-parenthesis-ampersand]

[fixture: wardley/names-and-quotes/name-quotes-empty]

[fixture: wardley/names-and-quotes/string-escape]

[fixture: wardley/names-and-quotes/name-hyphen]

Input (escaped): `"wardley-beta\ncomponent Foo  Bar\tBaz [0.3,0.6]"`.

Output
([names-and-quotes/name-spaces-output.mmd](../tests/fixtures/wardley/names-and-quotes/name-spaces-output.mmd)):

```mmd
wardley-beta
  component Foo  Bar	Baz [0.3, 0.6]
```

### Name boundaries

Separate ordinary names from following components by one space, except that a
bare name exactly title keeps its authored contact or separation before
coordinates, a pipeline brace, an evolve target, arrows, ports, @ and /.
Whitespace after title makes it metadata instead of a name. Quoted "title" and
bare titlex follow ordinary spacing; uppercase names stay names.

[fixture: wardley/name-boundaries/component-title-contact]

[fixture: wardley/name-boundaries/anchor-title-contact]

[fixture: wardley/name-boundaries/force-title-contact]

[fixture: wardley/name-boundaries/pipeline-title-contact]

[fixture: wardley/name-boundaries/link-title-contact]

[fixture: wardley/name-boundaries/stage-title-contact]

[fixture: wardley/name-boundaries/title-prefix-safe]

[fixture: wardley/name-boundaries/quoted-title]

[fixture: wardley/name-boundaries/title-link-port]

[fixture: wardley/name-boundaries/title-stage-slash]

[fixture: wardley/name-boundaries/title-evolve-hidden]

Input (escaped): `"wardley-beta\ncomponent title[0.3,0.6]"`.

Output
([name-boundaries/component-title-contact-output.mmd](../tests/fixtures/wardley/name-boundaries/component-title-contact-output.mmd)):

```mmd
wardley-beta
  component title[0.3, 0.6]
```

[corpus fixture: wardley/evolution-upper]

### Coordinates

Print coordinate pairs as [a, b], with tight inner edges, no space before the
comma and one after it. This selects readable punctuation among Db-equal padded
forms. Keep visibility before evolution and keep integer or decimal spellings;
hidden/global trivia use their shared gap rules.

[fixture: wardley/coordinates/coordinates-decimal]

[fixture: wardley/coordinates/coordinates-integer]

Input (escaped): `"wardley-beta\nanchor Coord [ 0.3 \t,\t 0.6 ]"`.

Output
([coordinates/coordinates-decimal-output.mmd](../tests/fixtures/wardley/coordinates/coordinates-decimal-output.mmd)):

```mmd
wardley-beta
  anchor Coord [0.3, 0.6]
```

### Numbers

Print NumericLiteral source spans without converting their double values back to
text. Preserve decimal leading/trailing zeros, precision, rounded boundaries,
subnormal values, underflow and overflow where accepted. Converting 01.00 to 1
can reject a decimal-only position; percent conversion also loses the chosen
unit. Rejected leading-zero integers are not repaired.

[fixture: wardley/numbers/decimal-leading-zero]

[fixture: wardley/numbers/integer-precision]

[corpus fixture: wardley/db-number-overflow]

[corpus fixture: wardley/db-number-subnormal]

[corpus fixture: wardley/db-number-underflow]

[corpus fixture: wardley/db-coordinate-double-one]

[corpus fixture: wardley/db-coordinate-double-hundred]

Input (escaped): `"wardley-beta\ncomponent Digits [000.30,01.00]"`.

Output
([numbers/decimal-leading-zero-output.mmd](../tests/fixtures/wardley/numbers/decimal-leading-zero-output.mmd)):

```mmd
wardley-beta
  component Digits [000.30, 01.00]
```

[corpus fixture: wardley/number-int-leading-zero]

### Decorations

Keep every authored label offset, strategy and inertia decoration in grammar
order. Separate decorations by one space and compact parenthesized interiors.
Keep bare inertia and (inertia) distinct, along with build, buy, outsource and
market. The inertia forms can share a Db, but converting them loses an authored
node form; do not supply defaults.

[fixture: wardley/decorations/decorations-all]

[fixture: wardley/decorations/decorations-bare]

[fixture: wardley/decorations/decorations-strategies]

[fixture: wardley/decorations/label-only]

[fixture: wardley/decorations/bare-inertia-only]

[fixture: wardley/decorations/parenthesized-inertia-only]

[fixture: wardley/decorations/label-strategy]

[fixture: wardley/decorations/label-bare-inertia]

[fixture: wardley/decorations/label-parenthesized-inertia]

[fixture: wardley/decorations/strategy-parenthesized-inertia]

[fixture: wardley/decorations/label-strategy-bare-inertia]

Input (escaped):
`"wardley-beta\ncomponent Decor[0.3,0.6]label[1,-2]( build )( inertia )"`.

Output
([decorations/decorations-all-output.mmd](../tests/fixtures/wardley/decorations/decorations-all-output.mmd)):

```mmd
wardley-beta
  component Decor [0.3, 0.6] label [1, -2] (build) (inertia)
```

### Label offsets

Print label [-1, 2]: attach each ordinary minus to its unsigned integer
magnitude. Keep the sign even for -0 and preserve the magnitude spelling. Spaced
signs can share the Db, but attachment makes their operand clear. Hidden/global
trivia between sign and magnitude retain their boundary.

[fixture: wardley/label-offsets/offset-sign-gap]

[fixture: wardley/label-offsets/offset-negative-zero]

Input (escaped): `"wardley-beta\ncomponent Sign[0.3,0.6]label[ - 1 , -\t2 ]"`.

Output
([label-offsets/offset-sign-gap-output.mmd](../tests/fixtures/wardley/label-offsets/offset-sign-gap-output.mmd)):

```mmd
wardley-beta
  component Sign [0.3, 0.6] label [-1, -2]
```

### Links

Separate complete AST names, ports and arrows by one ordinary space, including
arrowless links. Preserve every port and arrow spelling. A-->B is the name A-
and arrow ->, so it prints A- -> B; do not search the source for arrow-shaped
text. A -->B instead keeps -->. This spacing exposes the components already read
by the parser.

[fixture: wardley/links/link-short]

[fixture: wardley/links/link-long-glued]

[fixture: wardley/links/link-long-spaced]

[fixture: wardley/links/link-dotted]

[fixture: wardley/links/link-minimal]

[fixture: wardley/links/link-quoted-long]

[fixture: wardley/links/link-no-arrow]

[fixture: wardley/links/link-source-forward]

[fixture: wardley/links/link-source-backward]

[fixture: wardley/links/link-source-both]

[fixture: wardley/links/link-target-no-arrow]

[fixture: wardley/links/link-both-ports]

[fixture: wardley/links/link-multiword]

Input (escaped): `"wardley-beta\nAlpha->Beta"`.

Output
([links/link-short-output.mmd](../tests/fixtures/wardley/links/link-short-output.mmd)):

```mmd
wardley-beta
  Alpha -> Beta
```

### Flows

[test: wardley/flows/unicode-flow]

Keep the interior of each +'label'>, +'label'< or +'label'<> flow as written:
empty labels, padding, backslashes and physical continuation columns included.
Root directives between its complete components retain their source boundaries.
Ordinary inserted spaces reject the composite unit, and trimming content changes
the Db. Keep both ports and the semicolon label even when flow precedence hides
them.

[fixture: wardley/flows/flow-forward]

[fixture: wardley/flows/flow-backward]

[fixture: wardley/flows/flow-both]

[fixture: wardley/flows/flow-empty]

[fixture: wardley/flows/flow-padding-escapes]

[fixture: wardley/flows/flow-derived-direction]

[fixture: wardley/flows/flow-derived-dotted]

[fixture: wardley/flows/flow-ports-and-label]

Input (escaped): `"wardley-beta\nAlpha+'moving'>Beta"`.

Output
([flows/flow-forward-output.mmd](../tests/fixtures/wardley/flows/flow-forward-output.mmd)):

```mmd
wardley-beta
  Alpha +'moving'> Beta
```

### Semicolon labels

Attach the grammatical label-opening ; to its preceding component and print
everything after it through the physical line end as its source span. Choose
attachment among Db-equal forms to show the delimiter belongs to the link. Do
not add padding or trim it: ; followed by space is accepted with a
whitespace-only label, whereas bare ; rejects. Further semicolons use shared
prefix protection; native-looking forms and percent text remain label text.

[fixture: wardley/semicolon-labels/label-exterior]

[fixture: wardley/semicolon-labels/label-whitespace]

[fixture: wardley/semicolon-labels/label-two-semicolons]

[fixture: wardley/semicolon-labels/label-apparent-syntax]

[fixture: wardley/semicolon-labels/label-comment-native]

Input (escaped): `"wardley-beta\nAlpha->Beta;; extra"`.

Output
([semicolon-labels/label-two-semicolons-output.mmd](../tests/fixtures/wardley/semicolon-labels/label-two-semicolons-output.mmd)):

```mmd
wardley-beta
  Alpha->Beta;; extra
```

### Evolves

Print evolve Name 0.80 with one ordinary space between components, preserving
the authored reference and decimal. Keep empty quoted names and unpublished
targets. A missing ID does not justify deleting the statement, and joining a
bare name to its number can reject it.

[fixture: wardley/evolves/evolve-numeric-gap]

[fixture: wardley/evolves/evolve-empty-name]

Input (escaped):
`"wardley-beta\ncomponent Motion[0.3,0.6]\nevolveMotion\t0.80"`.

Output
([evolves/evolve-numeric-gap-output.mmd](../tests/fixtures/wardley/evolves/evolve-numeric-gap-output.mmd)):

```mmd
wardley-beta
  component Motion [0.3, 0.6]
  evolve Motion 0.80
```

### Notes and annotations

Separate note, annotations, annotation and force components with one space; the
outer annotation comma has no preceding space and one following space too. This
follows coordinate punctuation without aligning columns. Keep empty strings,
annotation zero, integer/decimal coordinate forms and later unchecked
annotations boxes.

[fixture: wardley/notes-and-annotations/note-spacing]

[fixture: wardley/notes-and-annotations/annotation-spacing]

[fixture: wardley/notes-and-annotations/annotation-empty]

[fixture: wardley/notes-and-annotations/annotations-later]

[fixture: wardley/notes-and-annotations/force-spacing]

Input (escaped): `"wardley-beta\nnote\t\"Body\"[ 0.3 ,0.6 ]"`.

Output
([notes-and-annotations/note-spacing-output.mmd](../tests/fixtures/wardley/notes-and-annotations/note-spacing-output.mmd)):

```mmd
wardley-beta
  note "Body" [0.3, 0.6]
```

### Evolution

Attach @ on both sides and put one ordinary space around / and each stage arrow
->. Preserve optional boundaries, second names, empty quoted names and source
stage order. The tight annotation mark and separated alternatives make the
stages readable without filling missing values; bare title retains Name
boundaries.

[fixture: wardley/evolution/stage-all-gaps]

[fixture: wardley/evolution/stage-no-boundary]

[fixture: wardley/evolution/stage-partial-boundary]

[fixture: wardley/evolution/stage-empty-names]

[fixture: wardley/evolution/stage-long-arrow-glued]

[fixture: wardley/evolution/stage-title-arrow]

Input (escaped):
`"wardley-beta\nevolution  Early  @ 0.20/ Concept->Late@1.00 / Utility"`.

Output
([evolution/stage-all-gaps-output.mmd](../tests/fixtures/wardley/evolution/stage-all-gaps-output.mmd)):

```mmd
wardley-beta
  evolution Early@0.20 / Concept -> Late@1.00 / Utility
```

### Size

Print size [800, 600], using coordinate punctuation while preserving the two
integer source spans. Zero dimensions remain zero; no effective drawing size
replaces the written statement. The common bracket form makes these numeric
pairs consistent.

[fixture: wardley/size/size-spacing]

[fixture: wardley/size/size-zero]

Input (escaped): `"wardley-beta\nsize[ 800 \t,\t 600 ]"`.

Output
([size/size-spacing-output.mmd](../tests/fixtures/wardley/size/size-spacing-output.mmd)):

```mmd
wardley-beta
  size [800, 600]
```

### Title

Use the shared common-line layout: one space before a nonempty value, trim
ordinary outer common whitespace and retain internal text, including unmatched
quotes. Empty titles stay empty and never take a value from the next line. This
chooses a compact Db-equal edge without treating the common value as a quoted
string.

[fixture: wardley/title/title-trim]

[fixture: wardley/title/title-empty]

[fixture: wardley/title/title-quotes]

[fixture: wardley/title/title-next-line]

Input (escaped): `"wardley-beta\ntitle\t  A  subject \t"`.

Output
([title/title-trim-output.mmd](../tests/fixtures/wardley/title/title-trim-output.mmd)):

```mmd
wardley-beta
  title A  subject
```

### Accessibility

[test: wardley/accessibility/unicode-empty-description]

Use the shared accessibility line layout for accTitle: Value and accDescr:
Value, retaining empty assignments. Description blocks go through the shared
description layout: keep touching/openly spaced braces, compact whitespace-only
interiors to {}, join plain opener whitespace, retain value columns and align a
separate closer. Trivia keeps its shared continuation layout. These are the
common Db-equal forms; there is no text for whitespace-only block interiors to
surround.

[fixture: wardley/accessibility/access-lines]

[fixture: wardley/accessibility/access-empty]

[fixture: wardley/accessibility/description-tight]

[fixture: wardley/accessibility/description-edges]

[fixture: wardley/accessibility/description-empty]

[fixture: wardley/accessibility/description-opener-newline]

[fixture: wardley/accessibility/description-closer]

[fixture: wardley/accessibility/description-comment-only]

[fixture: wardley/accessibility/description-directive-only]

Input (escaped): `"wardley-beta\naccTitle \t:  A  B \t\naccDescr\t:  C  D \t"`.

Output
([accessibility/access-lines-output.mmd](../tests/fixtures/wardley/accessibility/access-lines-output.mmd)):

```mmd
wardley-beta
  accTitle: A  B
  accDescr: C  D
```

### Hidden forms

Print each WardleyIgnoredText once from its source range at its AST owner:
retained prefix, body, named component gap, pipeline opening/body or statement
suffix. Its value omits shared removals, so do not reconstruct it. Hidden
YAML/directive interiors and closers keep written columns; earlier
strings/values own native-looking text, and failed native forms stay comments.
Preserve three-fence matches, separate matches and later qualifying closers.

[fixture: wardley/hidden-forms/hidden-body-directive]

[fixture: wardley/hidden-forms/hidden-body-yaml]

[fixture: wardley/hidden-forms/hidden-keyword-name]

[fixture: wardley/hidden-forms/hidden-coordinate]

[fixture: wardley/hidden-forms/hidden-sign]

[fixture: wardley/hidden-forms/hidden-stage]

[fixture: wardley/hidden-forms/hidden-pipeline-body]

[fixture: wardley/hidden-forms/hidden-three-fences]

[fixture: wardley/hidden-forms/hidden-two-yaml]

[fixture: wardley/hidden-forms/hidden-later-closer]

[fixture: wardley/hidden-forms/hidden-failed-comment]

[corpus fixture: wardley/hidden-all-unit-gaps]

Input (escaped): `"wardley-beta\n%%{!native}%%\ncomponent HiddenBody[0.3,0.6]"`.

Output
([hidden-forms/hidden-body-directive-output.mmd](../tests/fixtures/wardley/hidden-forms/hidden-body-directive-output.mmd)):

```mmd
wardley-beta
  %%{!native}%%
  component HiddenBody [0.3, 0.6]
```

[corpus fixture: wardley/hidden-directive-string]

[corpus fixture: wardley/hidden-yaml-string]

[corpus fixture: wardley/hidden-yaml-block]

[corpus fixture: wardley/directive-native-opener-split]

[corpus fixture: wardley/lex-hidden-yaml-comment-region]

### Hidden boundaries

Use the shared hidden-gap and block rules for consumed LF outside ranges, inline
contact and closer space/tab, including EOF padding. A suffix that consumes LF
needs a spare visible LF before another statement; closer padding can instead
keep the first LF visible. Only the header's own forms use its no-visible-EOL
exception, even when the first statement remains on its line. Pipeline openers
and children require their visible LF too; forms after visible EOL belong to
body. Preserve multiple suffixes and YAML boundaries without adding indentation
inside protected text. When a hidden form keeps the header line, keep the
pipeline opening on that line too.

[fixture: wardley/hidden-boundaries/meeting-inline-directive-directive]

[fixture: wardley/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: wardley/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: wardley/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: wardley/hidden-boundaries/meeting-unselected-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-selected-gap-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-comment-line-directive]

[fixture: wardley/hidden-boundaries/meeting-comment-line-yaml]

[test: wardley/hidden-boundaries/meeting-ls-in-form-directive]

[test: wardley/hidden-boundaries/meeting-ls-in-form-yaml]

[test: wardley/hidden-boundaries/meeting-ps-in-form-directive]

[test: wardley/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: wardley/hidden-boundaries/native-child-value]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-opening-directive]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-opening-yaml]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-child-directive]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-child-yaml]

[fixture: wardley/hidden-boundaries/hidden-spare-lf]

[fixture: wardley/hidden-boundaries/hidden-closing-space]

[fixture: wardley/hidden-boundaries/hidden-header-no-spare]

[fixture: wardley/hidden-boundaries/hidden-pipeline-opening]

[fixture: wardley/hidden-boundaries/hidden-pipeline-child]

[fixture: wardley/hidden-boundaries/hidden-eof-space]

[fixture: wardley/hidden-boundaries/yaml-suffix-space]

[fixture: wardley/hidden-boundaries/yaml-suffix-spare]

[fixture: wardley/hidden-boundaries/hidden-after-visible-eol]

[fixture: wardley/hidden-boundaries/hidden-two-suffixes]

[fixture: wardley/hidden-boundaries/header-hidden-spare]

[fixture: wardley/hidden-boundaries/header-first-statement-hidden]

[fixture: wardley/hidden-boundaries/pipeline-opening-space]

[fixture: wardley/hidden-boundaries/pipeline-child-space]

[fixture: wardley/hidden-boundaries/pipeline-after-close]

[fixture: wardley/hidden-boundaries/pipeline-opening-yaml]

[fixture: wardley/hidden-boundaries/pipeline-child-yaml]

[fixture: wardley/hidden-boundaries/pipeline-body-before-close]

Input (escaped):
`"wardley-beta\ncomponent Spare[0.3,0.6]%%{!end}%%\n\ncomponent After[0.4,0.7]"`.

Output
([hidden-boundaries/hidden-spare-lf-output.mmd](../tests/fixtures/wardley/hidden-boundaries/hidden-spare-lf-output.mmd)):

```mmd
wardley-beta
  component Spare [0.3, 0.6]%%{!end}%%

  component After [0.4, 0.7]
```

[fixture: wardley/hidden-boundaries/hidden-closing-tab]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-selected-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-child-before-closer]

[fixture: wardley/hidden-boundaries/wardley-pipeline-closer-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-hidden-spare-lf]

[fixture: wardley/hidden-boundaries/wardley-pipeline-closer-hidden-spare-lf]

### Global directives

Keep Root directive source, order and ownership. Within a printed line, keep
whether each side touches or is separated. When formatting splits units that
were on the same line, a directive in their gap moves with the following unit:
its right boundary stays touching or separated, while its left contact is
broken. Ordinary standalone directives align with their body; multiline
interiors and EOF-reaching unfinished endings remain written. Do not format
their JSON or reorder them: common removal joins surrounding text and can change
acceptance or values. Native hidden directives remain separate nodes.

[fixture: wardley/global-directives/header-to-body]

[fixture: wardley/global-directives/global-keyword-contact]

[fixture: wardley/global-directives/global-separated]

[fixture: wardley/global-directives/global-value]

[fixture: wardley/global-directives/global-flow-components]

[fixture: wardley/global-directives/global-coordinate-sign]

[fixture: wardley/global-directives/global-standalone]

[fixture: wardley/global-directives/global-right-separated]

[fixture: wardley/global-directives/global-left-separated]

[fixture: wardley/global-directives/global-multiline]

[fixture: wardley/global-directives/global-unclosed]

Input (escaped): `"wardley-beta\ncomponent%%{wrap}%%Glued[0.3,0.6]"`.

Output
([global-directives/global-keyword-contact-output.mmd](../tests/fixtures/wardley/global-directives/global-keyword-contact-output.mmd)):

```mmd
wardley-beta
  component%%{wrap}%%Glued [0.3, 0.6]
```

### Comments

[test: wardley/comments/native-separators]

Align ordinary standalone comments with the containing body and prefix comments
at column one. Inline comments keep their line and touching side, with one space
for a separated gap. Preserve marks, text and trailing padding; pipeline
comments use child depth. Enclosing strings, flows and link labels retain
percent text. Common comment-region joins keep their source columns, preventing
text from changing owner.

[fixture: wardley/comments/comment-standalone]

[fixture: wardley/comments/comment-inline-contact]

[fixture: wardley/comments/comment-inline-separated]

[fixture: wardley/comments/comment-pipeline]

[fixture: wardley/comments/comment-triple-bare]

Input (escaped): `"wardley-beta\ncomponent InlineSpace[0.3,0.6] \t%% tail"`.

Output
([comments/comment-inline-separated-output.mmd](../tests/fixtures/wardley/comments/comment-inline-separated-output.mmd)):

```mmd
wardley-beta
  component InlineSpace [0.3, 0.6] %% tail
```

### Blank lines

Keep at most one ordinary ASCII blank line between statements or trivia,
dropping excess document/body edge blanks and whitespace-only padding. Pipeline
edge blanks disappear while mandatory visible LF remains. This keeps authored
grouping without excess space. Values, hidden/directive interiors, retained
prefixes, protected stretches and required hidden LF use their own preservation
rules.

[fixture: wardley/blank-lines/blanks-collapse]

[fixture: wardley/blank-lines/blanks-pipeline]

[fixture: wardley/blank-lines/blanks-comments]

Input (escaped):
`"\n\nwardley-beta\n\n\ncomponent GroupA[0.3,0.6]\n \t\n\n\ncomponent GroupB[0.4,0.7]\n\n"`.

Output
([blank-lines/blanks-collapse-output.mmd](../tests/fixtures/wardley/blank-lines/blanks-collapse-output.mmd)):

```mmd
wardley-beta
  component GroupA [0.3, 0.6]

  component GroupB [0.4, 0.7]
```

### Trailing whitespace

Remove harmless exterior ASCII padding after the header, completed structures
and description closers. Decide by owner: preserve link-label tails, string/flow
contents, comments, directives, hidden interiors, required closer padding and
protected stretches. Trimming every physical line can change the Db or reject a
whitespace-only link label.

[fixture: wardley/trailing-whitespace/trailing-exterior]

[fixture: wardley/trailing-whitespace/trailing-string]

[fixture: wardley/trailing-whitespace/trailing-blank-label-keep]

Input (escaped):
`"wardley-beta \t\ncomponent Tail[0.3,0.6] \t\naccDescr { End } \t"`.

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/wardley/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
wardley-beta
  component Tail [0.3, 0.6]
  accDescr { End }
```

### Semicolons

Use shared complete-line protection for source lines containing literal style or
classDef after Root directives are omitted, including nontriggering word lines.
Keep their statements, comments and hidden forms together and do not join
neighboring lines. Align the first line with its body; keep its content and all
later columns. Count a line as Mermaid reads it, including directive-spanning
words and comment regions after U+2028/U+2029. The line rule can ignore a
grammatical label opener, so preserving the complete line avoids predicting its
selection after moving text. Keep all authored semicolons. Exclude grammatical
link-label openers from shared textual-prefix protection; other semicolons
protect their source segment through the last semicolon and whole crossing
values/trivia. Words inside removed Root directives alone do not trigger
complete-line protection.

[fixture: wardley/semicolons/style-label]

[fixture: wardley/semicolons/style-selected-delimiter]

[fixture: wardley/semicolons/classdef-selected-delimiter]

[fixture: wardley/semicolons/style-classdef-two-passes]

[fixture: wardley/semicolons/style-colon-space-nontrigger]

[fixture: wardley/semicolons/style-uppercase-nontrigger]

[fixture: wardley/semicolons/style-no-semicolon]

[fixture: wardley/semicolons/style-inside-global]

[fixture: wardley/semicolons/style-directive-rejoined]

[fixture: wardley/semicolons/style-directive-lines]

[fixture: wardley/semicolons/style-header-group]

[fixture: wardley/semicolons/style-header-delimiter]

[fixture: wardley/semicolons/style-hidden-value-last-line]

[test: wardley/semicolons/style-comment-ls-connected]

[test: wardley/semicolons/classdef-comment-ps-connected]

[fixture: wardley/semicolons/semicolon-value-no-style]

[fixture: wardley/semicolons/style-name-semicolon-padding]

[fixture: wardley/semicolons/style-delimiter-hash-after]

[fixture: wardley/semicolons/classdef-unclosed-directive]

[test: wardley/semicolons/style-comment-both-connected]

[test: wardley/semicolons/style-comment-before-connected]

[test: wardley/semicolons/classdef-comment-both-connected]

[test: wardley/semicolons/classdef-comment-before-connected]

[fixture: wardley/semicolons/style-pipeline-header]

[fixture: wardley/semicolons/style-pipeline-child]

[fixture: wardley/semicolons/style-trivia-line]

Input (escaped): `"wardley-beta\nAlpha  -> Beta; style:#tone;"`.

Output
([semicolons/style-label-output.mmd](../tests/fixtures/wardley/semicolons/style-label-output.mmd)):

```mmd
wardley-beta
  Alpha  -> Beta; style:#tone;
```

### Multiline values

Do not wrap at printWidth. Keep physical string, flow and description contents,
continuation columns and interior blank lines. Visible LF between ordinary
statement components can reject the input, and reindenting value continuations
changes the Db. Long component/evolution statements stay unwrapped; description
openers and closers use Accessibility.

[fixture: wardley/multiline-values/long-component]

[fixture: wardley/multiline-values/long-evolution]

[fixture: wardley/multiline-values/multiline-string-columns]

[fixture: wardley/multiline-values/multiline-flow-columns]

Input (escaped):
`"wardley-beta\ncomponent A very long component name with repeated words[0.123456789012345,0.987654321098765]label[-13,24](build)inertia"`.

Options: `{"printWidth":20}`.

Output
([multiline-values/long-component-output.mmd](../tests/fixtures/wardley/multiline-values/long-component-output.mmd)):

```mmd
wardley-beta
  component A very long component name with repeated words [0.123456789012345, 0.987654321098765] label [-13, 24] (build) inertia
```

### Frontmatter yaml

Use the shared guarded YAML formatter only for safe real frontmatter. Malformed
YAML, indented fences, delimiter padding, HTML hazards and bodies whose
formatting would create a fence remain written. YAML uses the shared positive
indentation minimum at tabWidth zero. If textBeforeHeader is present, keep the
complete prefix, including leading LF, passed trivia, second-scan forms and
real/retained order. The shared keepsPrefix rule prevents ignored YAML from
becoming effective frontmatter and changing configuration or title.

[fixture: wardley/frontmatter-yaml/frontmatter-safe]

[fixture: wardley/frontmatter-yaml/retained-prefix]

[fixture: wardley/frontmatter-yaml/frontmatter-html-keep]

[fixture: wardley/frontmatter-yaml/prefix-secondscan]

[fixture: wardley/frontmatter-yaml/frontmatter-indented-keep]

[fixture: wardley/frontmatter-yaml/frontmatter-scalar-minimum]

[fixture: wardley/frontmatter-yaml/frontmatter-malformed]

[fixture: wardley/frontmatter-yaml/frontmatter-padding]

[fixture: wardley/frontmatter-yaml/frontmatter-fence-guard]

Input (escaped):
`"---\ntitle: 'Map'\nconfig: {wardley: {width: 600}}\n---\nwardley-beta\ncomponent Fm[0.3,0.6]"`.

Output
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/wardley/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: "Map"
config: { wardley: { width: 600 } }
---
wardley-beta
  component Fm [0.3, 0.6]
```

### Line terminators and unicode

Use the shared host policy: read CR/CRLF as LF and print the configured line
ending, including inside values and hidden forms. LS/PS/NBSP/BOM retain their
lexical roles, except shared common-value edge trimming and plain
description-opener whitespace. Converting these to general padding can change
the Db or repair rejected input. Prettier removes/restores a file-leading BOM;
original frontmatter status and byte identity are not guaranteed.

[test: wardley/line-terminators-and-unicode/cr-structure]

[test: wardley/line-terminators-and-unicode/crlf-string]

[test: wardley/line-terminators-and-unicode/output-crlf]

[test: wardley/line-terminators-and-unicode/output-cr]

[test: wardley/line-terminators-and-unicode/unicode-values]

[test: wardley/line-terminators-and-unicode/unicode-common-trim]

[test: wardley/line-terminators-and-unicode/hidden-crlf]

[test: wardley/line-terminators-and-unicode/leading-bom]

[corpus fixture: wardley/space-nbsp-body]

### Source order

Keep every authored statement, child, stage, decoration, reference and empty
assignment in source order. Repeated declarations and pipelines, unpublished
evolves, first annotations boxes and last size/evolution/common assignments stay
written. Never rebuild from the effective Db: sorting or deleting occurrences
can change its reading and loses authored choices.

[fixture: wardley/source-order/order-repeated-components]

[fixture: wardley/source-order/order-common-reset]

[fixture: wardley/source-order/order-pipeline-stages]

Input (escaped):
`"wardley-beta\ncomponent Zorder[0.3,0.6]\ncomponent Aorder[0.4,0.7]\ncomponent Zorder[0.5,0.8]"`.

Output
([source-order/order-repeated-components-output.mmd](../tests/fixtures/wardley/source-order/order-repeated-components-output.mmd)):

```mmd
wardley-beta
  component Zorder [0.3, 0.6]
  component Aorder [0.4, 0.7]
  component Zorder [0.5, 0.8]
```

[corpus fixture: wardley/db-pipeline-duplicates]

[corpus fixture: wardley/db-singletons-last]

[corpus fixture: wardley/db-trend-missing]

### Final newline

End ordinary accepted files with one configured newline, removing ordinary
terminal blank lines. Header-only bodies, comments and closed hidden forms
follow the same consistent file ending. EOF-reaching global endings,
retained-prefix boundaries, protected text and required hidden closer padding
take precedence; label padding is value text rather than an extra final blank.

[corpus fixture: wardley/header-only]

[fixture: wardley/final-newline/final-comment]

[fixture: wardley/final-newline/final-hidden]

Input (escaped): `"wardley-beta\n%% final"`.

Output
([final-newline/final-comment-output.mmd](../tests/fixtures/wardley/final-newline/final-comment-output.mmd)):

```mmd
wardley-beta
  %% final
```

### Specified readings

[test: wardley/specified-readings/passed-unicode]

Follow the six existing divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque, bare-percent-line-before-header and c4-keyword-anywhere.
Wardley has no opaque acceptance-setting key. Raw rejection supplies no raw Db;
use available specified readings and embedded effects. Standalone parse failures
report syntax errors without output; Markdown declines embedding. No rejected
syntax is repaired.

[corpus fixture: wardley/directive-arrow-inside]

[corpus fixture: wardley/lex-selected-decimal-inside]

[corpus fixture: wardley/div-html-frontmatter-reject]

[corpus fixture: wardley/config-fontfamily-keeps-title]

[corpus fixture: wardley/bare-before-ls]

[corpus fixture: wardley/c4-component-component]

[corpus fixture: wardley/number-int-leading-zero]

[corpus fixture: wardley/directive-keyword-middle]

[corpus fixture: wardley/gram-replaced-invalid-node]

### Markdown fences

Apply these rules to dedented payloads through the shared Markdown connection.
The host supplies fence/list/quote columns and trims final code-line padding. In
particular, trimming the whitespace-only label after HostSource -> HostTarget;
leaves bare ; and makes Wardley reject the payload. Standalone formatting
preserves that padding; this is the existing Markdown host limitation, not a
rewritten label form. Test actual host output and three-pass idempotence
separately from standalone payload Db equality.

[test: wardley Markdown: top-level]

[test: wardley Markdown: list]

[test: wardley Markdown: quote]

[test: wardley Markdown: zero]

[test: wardley Markdown: tabs]

[test: wardley Markdown: hidden-boundary]

[test: wardley Markdown: prefix]

[test: wardley Markdown: frontmatter]

[test: wardley Markdown: final-whitespace-label]

[test: wardley Markdown: final-hidden-padding]

[test: wardley Markdown: rejected]

Input:

````markdown
```mermaid
wardley-betacomponentFenced[0.3,0.6]
```
````

Output:

````markdown
```mermaid
wardley-beta
  component Fenced [0.3, 0.6]
```
````
