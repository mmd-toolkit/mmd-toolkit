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
Where a statement stands is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [architecture](./architecture.md#header),
[cynefin](./cynefin.md#header), [radar](./radar.md#header), and
[treemap](./treemap.md#header) print the header on a line of its own and an
ordinary first statement on the next line. mermaid.js 12.3.0 rejects a colon
after the header, so none is added. Hidden forms, retained prefixes and
protected lines keep their shared boundaries, including an empty body.

[fixture: wardley/header/header-glued]

[fixture: wardley/header/header-inline]

[fixture: wardley/header/header-empty]

[fixture: radar/header/bare-inline] [fixture: cynefin/header/header-bare-inline]
[fixture: treemap/header/stable] [fixture:
architecture/header/header-inline-accessibility] [corpus fixture:
wardley/header-punctuation]

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
width zero. A level is what Prettier's `useTabs` and `tabWidth` options say:
Prettier prints the declarations of a CSS rule and the statements of a
JavaScript block one level in, with two spaces by default, four at `tabWidth` 4,
none at 0, and a tab with `useTabs`, also at width 0. The statements after the
header stand one level deeper, as [flowchart](./flowchart.md#indentation),
[radar](./radar.md#indentation), [architecture](./architecture.md#indentation),
and [pie](./pie.md#indentation) print theirs
([rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)).
Protected segments align their first line with the body; their interiors and
later lines keep written columns.

[fixture: wardley/indentation/indent-two]

[fixture: wardley/indentation/indent-four]

[fixture: wardley/indentation/indent-zero]

[fixture: wardley/indentation/indent-tabs]

[fixture: wardley/indentation/indent-zero-tabs]

[fixture: flowchart/indentation/statements] [fixture:
radar/indentation/indent-two] [fixture: architecture/indentation/indent-two]
[fixture: pie/indentation/indent-default]

Input (escaped): `"wardley-beta\n component Indent [0.3,0.6]"`.

Output
([indentation/indent-two-output.mmd](../tests/fixtures/wardley/indentation/indent-two-output.mmd)):

```mmd
wardley-beta
  component Indent [0.3, 0.6]
```

### Pipeline

Print pipeline Parent { with children one step deeper and } aligned with the
parent statement. Rule 1 gives one space before the `{` that opens a block
(`class A{}` is printed `class A {}`). The start of a line is no place of rule
1, so [rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides where the statements and the `}` stand, as
[class](./class.md#indentation), [er](./er.md#indentation), and
[state](./state.md#indentation) print the statements of the block one level
deeper than that line and the `}` on a line of its own at the level of that
line. Keep the visible LF after { and each child, including at tabWidth zero:
the grammar requires them. These delimiters show the authored parent and
children without adding coordinates or generated IDs.

[fixture: wardley/pipeline/pipeline-depth]

[fixture: wardley/pipeline/pipeline-zero]

[fixture: wardley/pipeline/pipeline-tab]

[fixture: class/indentation/namespaces] [fixture:
er/indentation/attribute-blocks-in-subgraphs] [fixture:
state/indentation/composite-states]

Input (escaped):
`"wardley-beta\ncomponent Parent[0.4,0.5]\npipelineParent{\n component Child[0.6]label[-1,2]\n      }"`.

Output
([pipeline/pipeline-depth-output.mmd](../tests/fixtures/wardley/pipeline/pipeline-depth-output.mmd)):

```mmd
wardley-beta
  component Parent [0.4, 0.5]
  pipeline Parent {
    component "Child" [0.6] label [-1, 2]
  }
```

### Statements one per line

Put ordinary statements on separate lines and keep their required EOL.
mermaid.js rejects a second statement after a space on the line of a statement,
and after a U+2028 or U+2029, which is no line break, a statement on the line of
the `{` that opens a pipeline, and a `;` after any statement but a link, a
title, an `accTitle` line, and an `accDescr` line. A `;` after a link opens its
label (see [Semicolon labels](#semicolon-labels)), and after one of the other
three it is part of the text. Add no semicolon: Wardley does not use semicolons
as statement separators. Apparent statements inside values remain value text;
the source tree already distinguishes them.

[fixture: wardley/statements-one-per-line/statement-eol] [corpus fixture:
wardley/line-ls-gap] [corpus fixture: wardley/line-ps-gap] [corpus fixture:
wardley/gram-anchor-component-one-line] [corpus fixture:
wardley/gram-pipeline-inline] [corpus fixture: wardley/tail-component-semicolon]
[corpus fixture: wardley/tail-anchor-semicolon] [corpus fixture:
wardley/tail-note-semicolon] [corpus fixture: wardley/tail-evolve-semicolon]
[corpus fixture: wardley/tail-evolution-semicolon] [corpus fixture:
wardley/tail-size-semicolon] [corpus fixture: wardley/tail-annotation-semicolon]
[corpus fixture: wardley/tail-annotations-semicolon] [corpus fixture:
wardley/tail-accelerator-semicolon] [corpus fixture:
wardley/tail-deaccelerator-semicolon] [corpus fixture:
wardley/tail-pipeline-semicolon] [corpus fixture: wardley/tail-child-semicolon]
[corpus fixture: wardley/tail-block-semicolon] [corpus fixture:
wardley/tail-link-empty-label] [corpus fixture: wardley/tail-link-spaced-label]
[corpus fixture: wardley/tail-common-semicolons]

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
number, string or bracket.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives that space,
also before a bracket: Prettier prints one space between a keyword and what it
takes (`return  x` is printed `return x;`), including the `[` that opens the
values of the keyword (`return  [800, 600]` is printed `return [800, 600];`).
The same rule formats glued keywords, including the pipeline keyword: keyword
terminals have no trailing boundary, and the AST already separates them from the
name. Keep trivia and hidden boundaries instead of applying ordinary gap rules
through them.

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

The name of a component, an anchor, a link, an `evolve` statement, a pipeline,
and a stage of an evolution is printed without quotes where it is plain, and the
name of an accelerator, a deaccelerator, and a component of a pipeline is
printed in quotes, as the examples in the documentation of mermaid.js write them
(see [The quotes of a text](./compatibility.md#the-quotes-of-a-text)):
`component "Customer"` is printed `component Customer`, and `accelerator Market`
is printed `accelerator "Market"`. A name is plain where it is words of ASCII
letters, digits, and `_` that start with a letter, with a space between them,
and it does not start with a word that the lexer reads as a command or a
strategy (`build`, `component`, `title`, and the others, in lower case). A name
with a `-` keeps its quotes, since the first release with the diagram type
rejects it without them (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The name of a link without an arrow, `"A" "B"`, and a name that touches the
`---` of a hidden YAML block keep their quotes. Without the quotes the two names
would be read as one name, and the `---` would join the name (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)).

[fixture: names-and-quotes/plain-names-without-quotes] [fixture:
names-and-quotes/names-that-need-quotes]

Keep WardleyIdentifier and StringLiteral source spans otherwise, including
internal spaces/tabs, hyphens, parentheses, ampersands, escapes, empty strings
and whitespace-only strings, except for the label of a link, which prints a run
of spaces and tabs as one space (see [Semicolon labels](#semicolon-labels)). The
name of a component is its id in the Db, and a pipeline finds its component by
the exact id, so a name with another run of whitespace is another name: 12.3.0
holds the id with the whitespace as written, and rejects a pipeline whose name
differs from its component's by a tab for a space. The figures differ too for
two components whose names differ by a run (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
A string of a name between `'` is printed between `"` unless its text holds a
`'`, a `"`, a backslash, a line break, U+2028, U+2029, a backquote, `&`, `#`, or
`<` (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)),
and `singleQuote` is not read. [Rule 3](./printed-form.md#3-a-spelling) gives
`"`: the examples in the documentation of mermaid.js write 408 of the 409
strings of the ten diagram types that read both quotes in `"`. The label of a
link (`+'moving'>`) stays between `'`, the only quote that mermaid.js reads
there.

[fixture: names-and-quotes/single-quote-sensitive-kept]

[corpus fixture: wardley/space-name-values] [corpus fixture:
wardley/gram-reference-same-whitespace]

Collapsing name whitespace or trimming string contents changes the Db, and a
requoting that needs another escape interpretation is not made.

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
coordinates, a pipeline brace, an evolve target, arrows, ports, @ and /. The one
space is the gap of [Component spacing](#component-spacing) after a keyword, of
[Pipeline](#pipeline) before a `{`, and of [Links](#links) around an arrow. The
space before the number of an `evolve` is the one that [Evolves](#evolves) says
no rule gives. Before the `[` of a coordinate pair the space is the one that
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives before the `[`
that opens the values of a statement, also after a name or a string, since the
coordinates are what the statement takes and no label of the name. The examples
in the documentation of mermaid.js write the `[` of all 66 coordinates after a
space (see
[The examples that decide the whitespace in a Wardley diagram](./compatibility.md#the-examples-that-decide-the-whitespace-in-a-wardley-diagram)).
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
comma and one after it. This is the whitespace that Prettier prints beside a
comma, chosen among Db-equal padded forms. Keep visibility before evolution and
keep integer or decimal spellings; hidden/global trivia use their shared gap
rules.

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
Prettier prints no space inside parentheses
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)).
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the space
before the `[` of a label offset, which the keyword `label` takes (see
[Component spacing](#component-spacing)). Rule 1 names no mark for the other
gaps before a decoration, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides where another diagram type has a gap of that kind. Two gaps have one:
[quadrant](./quadrant.md#styles) prints one space between the `]` of a point and
its first style, written touching or not (`]radius:9`), as wardley prints one
between a `]` and the word `label` or the bare `inertia` that follows it; and
[class](./class.md#member-lines) prints one space between the `)` of a method
and its return type, where no other rule keeps the method as written (class
keeps a method with a directive inside it as written), as wardley prints one
between the `)` of a strategy in parentheses and the bare `inertia` that follows
it. Those descriptions are of a gap in which no directive stands. A directive in
the gap is printed after one space and touches the unit that follows it, in
xychart as in wardley (`line %%{init: {}}%% [1]` is printed
`line %%{init: {}}%%[1]`, and `label [1, 2] %%{x}%% (build)` is printed
`label [1, 2] %%{x}%%(build)`). The gap before a `(` that follows a `]` or a
`)`, which holds a strategy or `(inertia)` in parentheses, has none: the
documents of the other printers name no such gap, no printed fixture of another
diagram type holds a `] (` or a `) (`, and the one space that
[ER](./er.md#attribute-spacing) prints between the keys of an attribute and its
comment stands before a quoted string, not before a `(`. So the form that the
released version prints, one space, stays for the gap before a `(` until it is
decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Keep bare inertia and (inertia) distinct, along with build, buy, outsource and
market. The inertia forms can share a Db, but converting them loses an authored
node form; do not supply defaults. The versions that were run accept both forms
and draw them alike, and the examples write `(inertia)` 2 times and the bare
form never (see
[The examples that decide the whitespace in a Wardley diagram](./compatibility.md#the-examples-that-decide-the-whitespace-in-a-wardley-diagram)),
so the bare form is printed against rule 3 and waits to be fixed by the rule.

[fixture: wardley/decorations/decorations-all] [fixture:
wardley/decorations/decorations-spaced] [fixture:
wardley/decorations/decorations-touching] [fixture:
quadrant/styles/styles-after-one-space] [fixture:
class/member-lines/method-padding] [fixture:
xychart/directives/directive-between-keyword-and-bracket] [fixture:
wardley/decorations/decoration-directive-in-the-gap]

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
signs can share the Db, but the sign touches its magnitude, as Prettier prints a
unary minus. Hidden/global trivia between sign and magnitude retain their
boundary.

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
arrowless links. Preserve every port and arrow spelling.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the space
around an arrow, a mark between two things: a flowchart prints `A-->B` as
`A --> B`, and Prettier prints `x = a+b` as `x = a + b;`. The examples in the
documentation of mermaid.js write all 31 of their links with a space on each
side (see
[The examples that decide the whitespace in a Wardley diagram](./compatibility.md#the-examples-that-decide-the-whitespace-in-a-wardley-diagram))
(`Customer -> Service`, `App +> API`, `Cache +'backup'> Database`). A-->B is the
name A- and arrow ->, but the first version with the diagram rejects a name with
a `-` in it and reads the same text as the name A and the arrow -->, so an arrow
is not separated from a name that ends with `-`: A-->B prints A--> B, which
every version draws as it draws A-->B, not A- -> B (see
[Wardley authored text and required line breaks](./compatibility.md#wardley-authored-text-and-required-line-breaks)).
A directive between the name and the arrow does not part them, as mermaid.js
takes the directive away before it reads the text: A-%%{init: {}}%%->B prints
A-%%{init: {}}%%-> B.

[fixture: wardley/links/link-glued-directive-between]

Do not search the source for arrow-shaped text. A -->B instead keeps -->. The
versions that were run accept `-->` and `->` and draw them alike, and the
examples write 28 of the 31 links with `->` and none with `-->` (see
[The examples that decide the whitespace in a Wardley diagram](./compatibility.md#the-examples-that-decide-the-whitespace-in-a-wardley-diagram)),
so keeping `-->` is printed against rule 3 and waits to be fixed by the rule.
This spacing follows the components already read by the parser.

[fixture: wardley/links/link-short]

[fixture: wardley/links/link-long-glued]

[fixture: wardley/links/link-name-dashes-glued]

[fixture: wardley/links/link-name-dash-spaced]

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

Keep the interior of each +'label'>, +'label'< or +'label'<> flow as written:
empty labels, padding, backslashes and physical continuation columns included.
The Db holds the label as written: a backslash is an ordinary character in it
and no escape is read, so `A +'a\n\q'> B` has the label `a\n\q`, and a label
over several lines stays as written, as any text over several lines does (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
Root directives between its complete components retain their source boundaries.
Ordinary inserted spaces reject the composite unit: every version of mermaid.js
that counts rejects `Alpha+ ' F  G\n\q ' >Beta` (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Trimming content changes the Db. Keep both ports and the semicolon label even
when flow precedence hides them.

[test: wardley/flows/unicode-flow] [fixture: wardley/flows/flow-forward]

[fixture: wardley/flows/flow-backward]

[fixture: wardley/flows/flow-both]

[fixture: wardley/flows/flow-empty]

[fixture: wardley/flows/flow-padding-escapes]

[fixture: wardley/flows/flow-derived-direction]

[fixture: wardley/flows/flow-derived-dotted]

[fixture: wardley/flows/flow-ports-and-label]

[corpus fixture: wardley/lex-link-flow-raw-escapes]

Input (escaped): `"wardley-beta\nAlpha+'moving'>Beta"`.

Output
([flows/flow-forward-output.mmd](../tests/fixtures/wardley/flows/flow-forward-output.mmd)):

```mmd
wardley-beta
  Alpha +'moving'> Beta
```

### Semicolon labels

Attach the grammatical label-opening ; to its preceding component and print
everything after it through the physical line end as its source span. No rule
gives the attachment. The row of
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) for a `;` is for the
`;` that ends a statement (`a ;` is printed `a;`), and this `;` opens the label
of the link, which runs to the end of the line, so it is no statement end. The
forms with and without whitespace before the `;` have the same Db, and the
released version prints it touching what precedes it (`Alpha ->Beta ;label` is
printed `Alpha -> Beta;label`), which stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Do not add padding or trim it: ; followed by space is accepted with a
whitespace-only label, whereas bare ; rejects in every version of mermaid.js
that counts (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Further semicolons use shared prefix protection; native-looking forms and
percent text remain label text. A run of spaces and tabs inside the label of a
link, after the `;` or between the quotes of a flow, is printed as one space
(see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
while the names of the components stay.

[fixture: wardley/flows/flow-padding-escapes] [fixture:
wardley/flows/flow-ports-and-label] [fixture:
wardley/semicolon-labels/label-exterior]

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
the authored reference and decimal.
[Rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the one space after the keyword (see [Component spacing](#component-spacing)),
No rule gives the space between the name and its number:
[radar](./radar.md#named-entries) prints a name and its number with one space as
well (`North 4`), but its document says that form is printed against rule 3 and
waits to be fixed by the rule, so it is no basis for rule 2, and the released
form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Keep empty quoted names and unpublished targets. A missing ID does not justify
deleting the statement, and joining a bare name to its number can reject it.

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
follows coordinate punctuation without aligning columns. The space between a
keyword and a string is that of [Component spacing](#component-spacing), the
space before the `[` after a string and the one before the `[` of `annotations`
are the space that [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives before the `[` that opens the values of a statement (see
[Component spacing](#component-spacing)), and the comma is the whitespace that
Prettier prints beside a comma
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)). Keep empty
strings, annotation zero, integer/decimal coordinate forms and later unchecked
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
stage order. The annotation mark is tight and the alternatives are separated,
without filling missing values; bare title retains Name boundaries.

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
pairs consistent. The comma and the brackets are those of
[Coordinates](#coordinates)
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark): none inside a
bracket, none before a comma and one after it), the space between `size` and the
`[` is the one that [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives before the `[` that opens the values of a keyword (see
[Component spacing](#component-spacing)), and the examples in the documentation
of mermaid.js write their one size so (`size [1100, 800]`; see
[The examples that decide the whitespace in a Wardley diagram](./compatibility.md#the-examples-that-decide-the-whitespace-in-a-wardley-diagram)).

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

Use the shared common-line layout, except as the paragraphs below and the
[Semicolons](#semicolons) section state: one space before a nonempty value, trim
ordinary outer common whitespace and retain internal text, including unmatched
quotes, apart from a run of spaces and tabs inside the value, which is printed
as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
Empty titles stay empty and never take a value from the next line. This chooses
a compact Db-equal edge without treating the common value as a quoted string.
[Rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the one space after `title`, as `title    Pets` in a pie chart and
`title    Plan` in a Gantt chart are printed with one, and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)
gives the reason of the trim. The text of a title stops before the line break,
so an empty title takes no value from the next line, and a quote in a title is a
character of its text, closed or not (see
[Common metadata values](../../spec/docs/diagrams/wardley.md#common-metadata-values)).
Where a title has text and no directive stands before its text or inside it, and
no U+2028 or U+2029 stands inside the text, the directives that end it are
printed as follows, by what stands before them and after them, except for the
undecided lines. A line with directives is undecided when, besides its
directives, it holds a `;` anywhere, also inside a directive or a comment, when
a U+2028 or U+2029 stands inside or after its first directive, when a directive
holds a line break, or when a line between it and the next statement holds a `;`
inside a comment or a directive. A wide space is one of U+000B, U+000C, U+00A0,
U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF. Where item 6
splits a line, none of the other items applies to it:

- Where only spaces and tabs, or nothing, stand before the directives, no `;`
  stands in the text before them or inside one of them, no directive holds a
  line break, a U+2028, or a U+2029, and nothing but spaces and tabs follow the
  last one, one space is printed before each directive that has spaces or tabs
  before it, and the spaces and tabs after the last one are left out, whatever
  the spaces and tabs at the end of the line.
- Where a wide space stands before the directives, they touch one another, and
  the end of the line or a comment touches the last one, the character is
  printed as one space with the rest of its run.
- Where a wide space stands before the directives and spaces or tabs and another
  directive or a comment follow the first one, the character stays, and each run
  of spaces and tabs after it before a directive or the comment is printed as
  one space.
- Where a U+2028 or U+2029 stands before the directives, they touch one another,
  and the end of the line touches the last one, it is printed as one space.
- Where a U+2028 or U+2029 stands before the directives, no comment follows the
  last one, and spaces or tabs follow the last one, or spaces or tabs and
  another directive follow the first one, the line stays as written.
- Where a U+2028 or U+2029 stands before the directives and a comment follows
  the last one, the comment region joins the next line of the source (see
  [A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)).
  The comment lines are removed, with the empty lines, the lines of whitespace,
  and the directive lines that stand before them, and the first line that is
  left decides. Where it is a statement or a line of whitespace, the line stays
  as written through that line. Where it is an empty line or a directive line,
  or no line is left, the U+2028 or U+2029 is dropped, the directives and the
  comment stand on a line of their own, a gap between them is printed as one
  space whatever whitespace it holds. Where no comment line follows it, a
  directive line holds directives only, with no whitespace before, between, or
  after them (`%%{y}%%`, `%%{y}%%%%{z}%%`); an indented directive, a directive
  that whitespace follows, directives that whitespace separates, and a directive
  that text follows are statements there. A comment line holds a comment
  (`%% d`, `  %% d`, `%%{y}%% %% e`). A line of whitespace holds spaces, tabs,
  wide spaces, U+2028, and U+2029 only: U+0085 and U+180E are no whitespace, and
  a line that holds one of them is a statement. A line that stands before a
  comment line is removed with it where it holds nothing but whitespace,
  directives, and comments, whatever their arrangement: an empty line, a line of
  whitespace, a directive line, an indented directive, a directive that
  whitespace follows, and directives that whitespace separate (`%%{y}%%`, two
  spaces, and `%%{z}%%`) are removed, and a line that holds text, U+0085,
  U+180E, or a `;` outside a comment and a directive is a statement.
- Where a wide space stands between two directives, the line stays as written,
  whatever follows the last one.
- Where a wide space stands after the last directive, also after spaces or tabs,
  the line stays as written, whatever follows the character. A title with a
  directive inside its text stays as written too.

Where a comment follows the last directive, no U+2028 or U+2029 stands between
the text and the comment, the line is not undecided, and neither of items 7 and
8 applies, a run of spaces and tabs before each directive and before the comment
is printed as one space (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).

Rule 1 names no mark for a gap beside a directive, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: the other diagram types of
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)
print a run of spaces and tabs before a directive as one space and leave out the
spaces at the end of the line (item 1). The other items say what the released
version prints for the gaps and the characters that the rules do not decide, and
a form that the other diagram types print differently stays as it is until it is
decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

Where a U+2028 or U+2029 stands inside the text, or the value holds directives
only, and the line is not undecided, the line stays as written if spaces or tabs
follow the last directive, whether the end of the line or a comment comes after
them, or if spaces or tabs stand between two directives, and item 3 does not
apply to it; otherwise the other items print it as they print a line of any
other text, so each run of spaces and tabs before a directive, the one after the
keyword included, is one space.

The undecided lines are not stated: the output there depends on each character
on each side of the `;` and of the U+2028 or U+2029, rule 1 names no mark for
these gaps, and the diagram types do not print them alike. The forms that the
released version prints there stay until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
A `;` inside a comment makes a line undecided, since Wardley keeps such a line
as written. The lines that make the formatter throw there are not stated.

A title that holds a `;` and no directive stays as written through its last `;`
where the line holds neither `style` nor `classDef`, the last `;` stands outside
a comment, nothing but spaces and tabs follow it, and no U+2028 or U+2029 stands
in the line, and the spaces and tabs after the last `;` are left out:
`title   T;` and `title A   B;` are not changed, and `title T;` followed by two
spaces is printed `title T;`. The other lines that hold a `;` and no directive
are not stated here: the released version prints them as it prints them until
they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)),
except the lines that hold `style` or `classDef`, which the
[Semicolons](#semicolons) section states.

Where the text of a title starts with a directive, or with directives that touch
one another, after the one space or tab that follows the keyword, and the rest
of the line holds no directive, comment, `;`, wide space, U+2028, or U+2029, and
the line is not undecided, the spaces and tabs between the directives and the
rest of the text are left out, with the spaces and tabs at the end of the line:
`title %%{x}%%  T  ` is printed `title %%{x}%%T`, and
`title %%{x}%%%%{y}%%  T  ` is printed `title %%{x}%%%%{y}%%T`.
[Rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as the Title of [a sequence diagram](./sequence.md#title) does, which
prints `title %%{init: {}}%% T` as `title %%{init: {}}%%T`: mermaid.js removes
the directives before it reads the text, and it draws the title without the
whitespace at its start (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
The other titles that hold a directive before their text are not stated: a
directive that touches the keyword, a second whitespace character before the
first directive, whitespace between two directives, and a directive, a comment,
a `;`, a wide space, a U+2028, or a U+2029 elsewhere in the line, and the
`accTitle:` and `accDescr:` lines whose text starts with a directive. The
released version prints them as it prints them until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: title/title-directives-end-blanks-dropped] [fixture:
title/title-directives-end-tabs-dropped] [fixture:
title/title-directives-in-the-text-kept] [fixture:
title/title-directives-end-before-comment-line-and-empty-line] [fixture:
title/title-directives-then-comment] [fixture:
title/title-directives-end-at-the-end-of-the-text] [fixture:
wardley/title/title-trim] [test: a no-break space after the last directive of a
title of a Wardley map] [test: U+3000 after the last directive of a title of a
Wardley map] [test: U+2028 after the last directive of a title of a Wardley map]
[test: U+2029 after the last directive of a title of a Wardley map] [test: a
space and a no-break space after the last directive of a title of a Wardley map]
[test: a no-break space after the last of two directives of a title of a Wardley
map] [test: a no-break space before the directive that ends a title of a Wardley
map] [test: U+3000 before the directive that ends a title of a Wardley map]
[test: a space, a no-break space, and a space before the directive that ends a
title of a Wardley map] [test: a no-break space before two directives that touch
and end a title of a Wardley map] [test: a no-break space before a directive
that a comment touches in a title of a Wardley map] [test: U+2028 before the
directive that ends a title of a Wardley map] [test: U+2029 before the directive
that ends a title of a Wardley map] [test: a no-break space before a directive
that a space and another directive follow in a title of a Wardley map] [test:
U+3000 before a directive that a space and a comment follow in a title of a
Wardley map] [test: a tab and a no-break space after the last directive of a
title of a Wardley map] [test: U+3000 before a directive that a comment touches
in a title of a Wardley map] [test: U+3000 before two directives that touch and
end a title of a Wardley map] [test: U+3000 before a directive that a space and
another directive follow in a title of a Wardley map] [test: a no-break space
before a directive that a space and a comment follow in a title of a Wardley
map] [test: a no-break space between two directives that end a title of a
Wardley map] [test: U+3000 between two directives that end a title of a Wardley
map] [test: a no-break space between two directives, spaces after the last, in a
title of a Wardley map] [test: U+3000 between two directives, spaces after the
last, in a title of a Wardley map] [test: U+2028 before two directives that
touch and end a title of a Wardley map] [test: U+2029 before two directives that
touch and end a title of a Wardley map] [test: U+2028 before the last directive,
a space and a tab after it, in a title of a Wardley map] [test: U+2029 before
the last directive, a space and a tab after it, in a title of a Wardley map]
[test: U+2028 before a directive that a space and another directive follow in a
title of a Wardley map] [test: U+2029 before a directive that a space and
another directive follow in a title of a Wardley map] [test: U+2028 between two
directives that end a title of a Wardley map] [test: U+2029 between two
directives that end a title of a Wardley map] [test: U+2028 between two
directives, spaces after the last, in a title of a Wardley map] [test: U+2029
between two directives, spaces after the last, in a title of a Wardley map]
[test: a space, a tab, and a no-break space after the last directive of a title
of a Wardley map] [test: a space, a tab, and U+3000 after the last directive of
a title of a Wardley map] [test: a space, a tab, and U+2028 after the last
directive of a title of a Wardley map] [test: a space, a tab, and U+2029 after
the last directive of a title of a Wardley map] [test: a semicolon before the
directive of a title of a Wardley map, spaces after it] [test: a semicolon and
spaces before the directive that ends a title of a Wardley map] [test: a
semicolon after the last directive of a title of a Wardley map, spaces around
it] [test: a semicolon before the directive of a title of a Wardley map, a tab
after it] [test: a semicolon and a no-break space before the directive of a
title of a Wardley map, spaces after it] [test: a semicolon and a no-break space
before the directive that ends a title of a Wardley map] [test: a semicolon
touching the last directive of a title of a Wardley map] [test: U+000B before
the directive that ends a title of a Wardley map] [test: U+000C before the
directive that ends a title of a Wardley map] [test: U+1680 before the directive
that ends a title of a Wardley map] [test: U+2000 before the directive that ends
a title of a Wardley map] [test: U+2001 before the directive that ends a title
of a Wardley map] [test: U+2002 before the directive that ends a title of a
Wardley map] [test: U+2003 before the directive that ends a title of a Wardley
map] [test: U+2004 before the directive that ends a title of a Wardley map]
[test: U+2005 before the directive that ends a title of a Wardley map] [test:
U+2006 before the directive that ends a title of a Wardley map] [test: U+2007
before the directive that ends a title of a Wardley map] [test: U+2008 before
the directive that ends a title of a Wardley map] [test: U+2009 before the
directive that ends a title of a Wardley map] [test: U+200A before the directive
that ends a title of a Wardley map] [test: U+202F before the directive that ends
a title of a Wardley map] [test: U+205F before the directive that ends a title
of a Wardley map] [test: U+FEFF before the directive that ends a title of a
Wardley map] [test: U+000B before two directives that touch and end a title of a
Wardley map] [test: U+000B before a directive that a comment touches in a title
of a Wardley map] [test: U+000B between two directives that end a title of a
Wardley map] [test: U+000B after the last directive of a title of a Wardley map]
[test: a semicolon and U+000B before the directive that ends a title of a
Wardley map] [test: U+000C before two directives that touch and end a title of a
Wardley map] [test: U+000C before a directive that a comment touches in a title
of a Wardley map] [test: U+000C between two directives that end a title of a
Wardley map] [test: U+000C after the last directive of a title of a Wardley map]
[test: a semicolon and U+000C before the directive that ends a title of a
Wardley map] [test: U+1680 before two directives that touch and end a title of a
Wardley map] [test: U+1680 before a directive that a comment touches in a title
of a Wardley map] [test: U+1680 between two directives that end a title of a
Wardley map] [test: U+1680 after the last directive of a title of a Wardley map]
[test: a semicolon and U+1680 before the directive that ends a title of a
Wardley map] [test: U+2000 before two directives that touch and end a title of a
Wardley map] [test: U+2000 before a directive that a comment touches in a title
of a Wardley map] [test: U+2000 between two directives that end a title of a
Wardley map] [test: U+2000 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2000 before the directive that ends a title of a
Wardley map] [test: U+2001 before two directives that touch and end a title of a
Wardley map] [test: U+2001 before a directive that a comment touches in a title
of a Wardley map] [test: U+2001 between two directives that end a title of a
Wardley map] [test: U+2001 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2001 before the directive that ends a title of a
Wardley map] [test: U+2002 before two directives that touch and end a title of a
Wardley map] [test: U+2002 before a directive that a comment touches in a title
of a Wardley map] [test: U+2002 between two directives that end a title of a
Wardley map] [test: U+2002 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2002 before the directive that ends a title of a
Wardley map] [test: U+2003 before two directives that touch and end a title of a
Wardley map] [test: U+2003 before a directive that a comment touches in a title
of a Wardley map] [test: U+2003 between two directives that end a title of a
Wardley map] [test: U+2003 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2003 before the directive that ends a title of a
Wardley map] [test: U+2004 before two directives that touch and end a title of a
Wardley map] [test: U+2004 before a directive that a comment touches in a title
of a Wardley map] [test: U+2004 between two directives that end a title of a
Wardley map] [test: U+2004 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2004 before the directive that ends a title of a
Wardley map] [test: U+2005 before two directives that touch and end a title of a
Wardley map] [test: U+2005 before a directive that a comment touches in a title
of a Wardley map] [test: U+2005 between two directives that end a title of a
Wardley map] [test: U+2005 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2005 before the directive that ends a title of a
Wardley map] [test: U+2006 before two directives that touch and end a title of a
Wardley map] [test: U+2006 before a directive that a comment touches in a title
of a Wardley map] [test: U+2006 between two directives that end a title of a
Wardley map] [test: U+2006 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2006 before the directive that ends a title of a
Wardley map] [test: U+2007 before two directives that touch and end a title of a
Wardley map] [test: U+2007 before a directive that a comment touches in a title
of a Wardley map] [test: U+2007 between two directives that end a title of a
Wardley map] [test: U+2007 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2007 before the directive that ends a title of a
Wardley map] [test: U+2008 before two directives that touch and end a title of a
Wardley map] [test: U+2008 before a directive that a comment touches in a title
of a Wardley map] [test: U+2008 between two directives that end a title of a
Wardley map] [test: U+2008 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2008 before the directive that ends a title of a
Wardley map] [test: U+2009 before two directives that touch and end a title of a
Wardley map] [test: U+2009 before a directive that a comment touches in a title
of a Wardley map] [test: U+2009 between two directives that end a title of a
Wardley map] [test: U+2009 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2009 before the directive that ends a title of a
Wardley map] [test: U+200A before two directives that touch and end a title of a
Wardley map] [test: U+200A before a directive that a comment touches in a title
of a Wardley map] [test: U+200A between two directives that end a title of a
Wardley map] [test: U+200A after the last directive of a title of a Wardley map]
[test: a semicolon and U+200A before the directive that ends a title of a
Wardley map] [test: U+202F before two directives that touch and end a title of a
Wardley map] [test: U+202F before a directive that a comment touches in a title
of a Wardley map] [test: U+202F between two directives that end a title of a
Wardley map] [test: U+202F after the last directive of a title of a Wardley map]
[test: a semicolon and U+202F before the directive that ends a title of a
Wardley map] [test: U+205F before two directives that touch and end a title of a
Wardley map] [test: U+205F before a directive that a comment touches in a title
of a Wardley map] [test: U+205F between two directives that end a title of a
Wardley map] [test: U+205F after the last directive of a title of a Wardley map]
[test: a semicolon and U+205F before the directive that ends a title of a
Wardley map] [test: a semicolon and U+3000 before the directive that ends a
title of a Wardley map] [test: U+FEFF before two directives that touch and end a
title of a Wardley map] [test: U+FEFF before a directive that a comment touches
in a title of a Wardley map] [test: U+FEFF between two directives that end a
title of a Wardley map] [test: U+FEFF after the last directive of a title of a
Wardley map] [test: a semicolon and U+FEFF before the directive that ends a
title of a Wardley map] [test: a semicolon and U+2028 before the directive that
ends a title of a Wardley map] [test: a semicolon and U+2029 before the
directive that ends a title of a Wardley map] [test: a semicolon and a tab
before the directive that ends a title of a Wardley map] [test: a semicolon that
the line rule ignores and spaces before the directive that ends a title of a
Wardley map] [test: a semicolon that the line rule ignores before the directive
of a title of a Wardley map, spaces after it] [test: a semicolon before the
directive of a title of a Wardley map, a space and a comment after it] [test: a
semicolon and spaces before a directive that a comment touches in a title of a
Wardley map] [test: a comment that ends with a semicolon after the last
directive of a title of a Wardley map] [test: a comment that has a space before
its semicolon after the last directive of a title of a Wardley map] [test: a
comment that starts with a semicolon after the last directive of a title of a
Wardley map] [test: a semicolon inside the directive that ends a title, spaces
after it, of a Wardley map] [test: a semicolon inside the directive that ends a
title, spaces and a comment after it, of a Wardley map] [test: a semicolon
inside the directive that ends a title, a space and a comment after it, of a
Wardley map] [test: a semicolon inside the last of two directives that end a
title, spaces after it, of a Wardley map] [test: a semicolon inside the first of
two directives that end a title, spaces between them, of a Wardley map] [test: a
semicolon inside the first of two directives that end a title, a space between
them, of a Wardley map] [test: a semicolon inside the only directive that ends a
title, spaces before it, of a Wardley map] [test: a semicolon inside the last of
two directives that end a title, spaces before both, of a Wardley map] [test: a
semicolon inside a directive that a comment touches in a title, spaces before
the directive, of a Wardley map] [test: a semicolon inside the first of two
directives that touch in a title, spaces before them, of a Wardley map] [test: a
semicolon inside the directive that ends a title, a no-break space before it, of
a Wardley map] [test: a semicolon inside the directive that ends a title, U+2028
before it, of a Wardley map] [test: a semicolon in the text, two directives with
spaces between them, a title, of a Wardley map] [test: a semicolon in the text,
two directives with a space between them, a title, of a Wardley map] [test: a
semicolon and a space before two directives with spaces between them, a title,
of a Wardley map] [test: a semicolon in the text, two directives with a tab
between them, a title, of a Wardley map] [test: a semicolon in the text, two
directives that touch, spaces before them, a title, of a Wardley map] [test: a
semicolon that touches two directives in a title, of a Wardley map] [test: a
semicolon that touches the second of two directives in a title, of a Wardley
map] [test: a semicolon that touches the first of two directives in a title, of
a Wardley map] [test: a semicolon between two directives in a title, spaces
around it, of a Wardley map] [test: a semicolon touching the last of two
directives in a title, of a Wardley map] [test: a semicolon after the last of
two directives in a title, spaces around it and a comment after it, of a Wardley
map] [test: a second semicolon touching the semicolon that the line rule
ignores, spaces and a directive after them, in a title of a Wardley map] [test:
a second semicolon touching the semicolon that the line rule ignores, a
directive and spaces after them, in a title of a Wardley map] [test: a second
semicolon touching the semicolon that the line rule ignores, a directive
touching them, in a title of a Wardley map] [test: a second semicolon touching
the semicolon that the line rule ignores, a directive that a comment touches, in
a title of a Wardley map] [test: a second semicolon touching the semicolon that
the line rule ignores, a directive and a space and a comment, in a title of a
Wardley map] [test: spaces and a second semicolon after the semicolon that the
line rule ignores, a directive after them, in a title of a Wardley map] [test: a
space and a second semicolon after the semicolon that the line rule ignores, a
directive after them, in a title of a Wardley map] [test: a tab and a second
semicolon after the semicolon that the line rule ignores, a directive after
them, in a title of a Wardley map] [test: a no-break space and a second
semicolon after the semicolon that the line rule ignores, a directive after
them, in a title of a Wardley map] [test: a second semicolon touching the
semicolon that the line rule ignores, a no-break space and a directive after
them, in a title of a Wardley map] [test: a second semicolon touching the
semicolon that the line rule ignores, U+2028 and a directive after them, in a
title of a Wardley map] [test: two semicolons after the semicolon that the line
rule ignores, a directive after them, in a title of a Wardley map] [test: U+2028
and a directive after the semicolon that the line rule ignores, in a title of a
Wardley map] [test: U+2029 and a directive after the semicolon that the line
rule ignores, in a title of a Wardley map] [test: U+2028, a directive and spaces
after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: two semicolons that the line rule does not ignore, spaces and a directive
after them, in a title of a Wardley map] [test: text and a semicolon after the
semicolon that the line rule does not ignore, spaces and a directive after them,
in a title of a Wardley map] [test: a tab and a directive after the semicolon
that the line rule ignores, in a title of a Wardley map] [test: a no-break space
and a directive after the semicolon that the line rule ignores, in a title of a
Wardley map] [test: spaces and a directive that a comment touches after the
semicolon that the line rule ignores, in a title of a Wardley map] [test: spaces
and two directives with spaces between them after the semicolon that the line
rule ignores, in a title of a Wardley map] [test: a semicolon at the end of a
title with whitespace around its text, of a Wardley map] [test: a semicolon in
the text of a title, spaces and a directive after it, of a Wardley map] [test:
spaces around a semicolon in the text of a title, a directive after it, of a
Wardley map] [test: U+000B between two directives, spaces after the last, in a
title of a Wardley map] [test: U+000B after the last directive and spaces of a
title of a Wardley map] [test: U+000C between two directives, spaces after the
last, in a title of a Wardley map] [test: U+000C after the last directive and
spaces of a title of a Wardley map] [test: a no-break space after the last
directive and spaces of a title of a Wardley map] [test: U+1680 between two
directives, spaces after the last, in a title of a Wardley map] [test: U+1680
after the last directive and spaces of a title of a Wardley map] [test: U+2000
between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2000 after the last directive and spaces of a title of a Wardley map]
[test: U+2001 between two directives, spaces after the last, in a title of a
Wardley map] [test: U+2001 after the last directive and spaces of a title of a
Wardley map] [test: U+2002 between two directives, spaces after the last, in a
title of a Wardley map] [test: U+2002 after the last directive and spaces of a
title of a Wardley map] [test: U+2003 between two directives, spaces after the
last, in a title of a Wardley map] [test: U+2003 after the last directive and
spaces of a title of a Wardley map] [test: U+2004 between two directives, spaces
after the last, in a title of a Wardley map] [test: U+2004 after the last
directive and spaces of a title of a Wardley map] [test: U+2005 between two
directives, spaces after the last, in a title of a Wardley map] [test: U+2005
after the last directive and spaces of a title of a Wardley map] [test: U+2006
between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2006 after the last directive and spaces of a title of a Wardley map]
[test: U+2007 between two directives, spaces after the last, in a title of a
Wardley map] [test: U+2007 after the last directive and spaces of a title of a
Wardley map] [test: U+2008 between two directives, spaces after the last, in a
title of a Wardley map] [test: U+2008 after the last directive and spaces of a
title of a Wardley map] [test: U+2009 between two directives, spaces after the
last, in a title of a Wardley map] [test: U+2009 after the last directive and
spaces of a title of a Wardley map] [test: U+200A between two directives, spaces
after the last, in a title of a Wardley map] [test: U+200A after the last
directive and spaces of a title of a Wardley map] [test: U+202F between two
directives, spaces after the last, in a title of a Wardley map] [test: U+202F
after the last directive and spaces of a title of a Wardley map] [test: U+205F
between two directives, spaces after the last, in a title of a Wardley map]
[test: U+205F after the last directive and spaces of a title of a Wardley map]
[test: U+3000 after the last directive and spaces of a title of a Wardley map]
[test: U+FEFF between two directives, spaces after the last, in a title of a
Wardley map] [test: U+FEFF after the last directive and spaces of a title of a
Wardley map] [test: U+2028 after the last directive and spaces of a title of a
Wardley map] [test: U+2029 after the last directive and spaces of a title of a
Wardley map] [test: a no-break space between two directives, a comment touching
the last, in a title of a Wardley map] [test: a no-break space between two
directives, a space and a comment after the last, in a title of a Wardley map]
[test: a no-break space between two directives, spaces and a comment after the
last, in a title of a Wardley map] [test: a no-break space after the last
directive, a comment touching it, in a title of a Wardley map] [test: a no-break
space after the last directive, spaces and a comment after it, in a title of a
Wardley map] [test: a no-break space after the last directive and spaces, spaces
and a comment after it, in a title of a Wardley map] [test: a no-break space
after the last directive and a tab, spaces and a comment after it, in a title of
a Wardley map] [test: U+2003 between two directives, a comment touching the
last, in a title of a Wardley map] [test: U+2003 between two directives, a space
and a comment after the last, in a title of a Wardley map] [test: U+2003 between
two directives, spaces and a comment after the last, in a title of a Wardley
map] [test: U+2003 after the last directive, a comment touching it, in a title
of a Wardley map] [test: U+2003 after the last directive, spaces and a comment
after it, in a title of a Wardley map] [test: U+2003 after the last directive
and spaces, spaces and a comment after it, in a title of a Wardley map] [test:
U+2003 after the last directive and a tab, spaces and a comment after it, in a
title of a Wardley map] [test: a semicolon in the text, a no-break space between
two directives, in a title of a Wardley map] [test: a semicolon in the text, a
no-break space after the last directive, in a title of a Wardley map] [test: a
semicolon inside the directive, a no-break space after it, in a title of a
Wardley map] [test: U+000B before the first of two directives that a space
separates, in a title of a Wardley map] [test: U+000B before the first of two
directives that spaces separate, in a title of a Wardley map] [test: U+000B
before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+000C before the first of two directives that a space separates, in a
title of a Wardley map] [test: U+000C before the first of two directives that
spaces separate, in a title of a Wardley map] [test: U+000C before a directive
that spaces and a comment follow in a title of a Wardley map] [test: a no-break
space before the first of two directives that spaces separate, in a title of a
Wardley map] [test: U+1680 before the first of two directives that a space
separates, in a title of a Wardley map] [test: U+1680 before the first of two
directives that spaces separate, in a title of a Wardley map] [test: U+1680
before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2000 before the first of two directives that a space separates, in a
title of a Wardley map] [test: U+2000 before the first of two directives that
spaces separate, in a title of a Wardley map] [test: U+2000 before a directive
that spaces and a comment follow in a title of a Wardley map] [test: U+2001
before the first of two directives that a space separates, in a title of a
Wardley map] [test: U+2001 before the first of two directives that spaces
separate, in a title of a Wardley map] [test: U+2001 before a directive that
spaces and a comment follow in a title of a Wardley map] [test: U+2002 before
the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2002 before the first of two directives that spaces separate, in a
title of a Wardley map] [test: U+2002 before a directive that spaces and a
comment follow in a title of a Wardley map] [test: U+2003 before the first of
two directives that a space separates, in a title of a Wardley map] [test:
U+2003 before the first of two directives that spaces separate, in a title of a
Wardley map] [test: U+2003 before a directive that spaces and a comment follow
in a title of a Wardley map] [test: U+2004 before the first of two directives
that a space separates, in a title of a Wardley map] [test: U+2004 before the
first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2004 before a directive that spaces and a comment follow in a title of
a Wardley map] [test: U+2005 before the first of two directives that a space
separates, in a title of a Wardley map] [test: U+2005 before the first of two
directives that spaces separate, in a title of a Wardley map] [test: U+2005
before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2006 before the first of two directives that a space separates, in a
title of a Wardley map] [test: U+2006 before the first of two directives that
spaces separate, in a title of a Wardley map] [test: U+2006 before a directive
that spaces and a comment follow in a title of a Wardley map] [test: U+2007
before the first of two directives that a space separates, in a title of a
Wardley map] [test: U+2007 before the first of two directives that spaces
separate, in a title of a Wardley map] [test: U+2007 before a directive that
spaces and a comment follow in a title of a Wardley map] [test: U+2008 before
the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2008 before the first of two directives that spaces separate, in a
title of a Wardley map] [test: U+2008 before a directive that spaces and a
comment follow in a title of a Wardley map] [test: U+2009 before the first of
two directives that a space separates, in a title of a Wardley map] [test:
U+2009 before the first of two directives that spaces separate, in a title of a
Wardley map] [test: U+2009 before a directive that spaces and a comment follow
in a title of a Wardley map] [test: U+200A before the first of two directives
that a space separates, in a title of a Wardley map] [test: U+200A before the
first of two directives that spaces separate, in a title of a Wardley map]
[test: U+200A before a directive that spaces and a comment follow in a title of
a Wardley map] [test: U+202F before the first of two directives that a space
separates, in a title of a Wardley map] [test: U+202F before the first of two
directives that spaces separate, in a title of a Wardley map] [test: U+202F
before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+205F before the first of two directives that a space separates, in a
title of a Wardley map] [test: U+205F before the first of two directives that
spaces separate, in a title of a Wardley map] [test: U+205F before a directive
that spaces and a comment follow in a title of a Wardley map] [test: U+3000
before the first of two directives that spaces separate, in a title of a Wardley
map] [test: U+FEFF before the first of two directives that a space separates, in
a title of a Wardley map] [test: U+FEFF before the first of two directives that
spaces separate, in a title of a Wardley map] [test: U+FEFF before a directive
that spaces and a comment follow in a title of a Wardley map] [test: a run
before the directive after a U+2028 inside the text of a title of a Wardley map]
[test: spaces after the directive after a U+2028 inside the text of a title of a
Wardley map] [test: spaces after the directive after a U+2029 inside the text of
a title of a Wardley map] [test: spaces between two directives after a U+2028
inside the text of a title of a Wardley map] [test: a tab after the directive
after a U+2028 inside the text of a title of a Wardley map] [test: a run before
two directives that touch after a U+2028 inside the text of a title of a Wardley
map] [test: spaces after the last semicolon of a title, no directive, of a
Wardley map] [test: a tab after the last semicolon of a title, no directive, of
a Wardley map] [test: released output that the document does not state: a
no-break space after the last semicolon of a title, no directive, of a Wardley
map] [test: spaces after the semicolon that the line rule ignores, no directive,
in a title of a Wardley map] [test: a tab after the semicolon that the line rule
ignores, no directive, in a title of a Wardley map] [test: released output that
the document does not state: a semicolon inside a comment after the text of a
title, no directive, of a Wardley map] [test: released output that the document
does not state: spaces after a semicolon inside a comment after the text of a
title, no directive, of a Wardley map] [test: U+000B and spaces before the first
of two directives that spaces separate, in a title of a Wardley map] [test:
U+000C and spaces before the first of two directives that spaces separate, in a
title of a Wardley map] [test: a no-break space and spaces before the first of
two directives that spaces separate, in a title of a Wardley map] [test: U+1680
and spaces before the first of two directives that spaces separate, in a title
of a Wardley map] [test: U+2000 and spaces before the first of two directives
that spaces separate, in a title of a Wardley map] [test: U+2001 and spaces
before the first of two directives that spaces separate, in a title of a Wardley
map] [test: U+2002 and spaces before the first of two directives that spaces
separate, in a title of a Wardley map] [test: U+2003 and spaces before the first
of two directives that spaces separate, in a title of a Wardley map] [test:
U+2004 and spaces before the first of two directives that spaces separate, in a
title of a Wardley map] [test: U+2005 and spaces before the first of two
directives that spaces separate, in a title of a Wardley map] [test: U+2006 and
spaces before the first of two directives that spaces separate, in a title of a
Wardley map] [test: U+2007 and spaces before the first of two directives that
spaces separate, in a title of a Wardley map] [test: U+2008 and spaces before
the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2009 and spaces before the first of two directives that spaces
separate, in a title of a Wardley map] [test: U+200A and spaces before the first
of two directives that spaces separate, in a title of a Wardley map] [test:
U+202F and spaces before the first of two directives that spaces separate, in a
title of a Wardley map] [test: U+205F and spaces before the first of two
directives that spaces separate, in a title of a Wardley map] [test: U+3000 and
spaces before the first of two directives that spaces separate, in a title of a
Wardley map] [test: U+FEFF and spaces before the first of two directives that
spaces separate, in a title of a Wardley map] [test: a no-break space and a tab
before the first of two directives that a space separates, in a title of a
Wardley map] [test: a no-break space before the first of two directives that a
tab separates, in a title of a Wardley map] [test: U+2003 and a tab before the
first of two directives that a space separates, in a title of a Wardley map]
[test: U+2003 before the first of two directives that a tab separates, in a
title of a Wardley map] [test: U+2028 before the first of two directives that a
tab separates, in a title of a Wardley map] [test: U+2029 before the first of
two directives that a tab separates, in a title of a Wardley map] [test: a
U+2028 inside the directive that ends a title, spaces before it, of a Wardley
map] [test: a U+2028 inside the directive that ends a title, spaces after it, of
a Wardley map] [test: a U+2029 inside the directive that ends a title, spaces
before it, of a Wardley map] [test: a U+2029 inside the directive that ends a
title, spaces after it, of a Wardley map] [test: a line break inside the
directive that ends a title, spaces before it, of a Wardley map] [test: a line
break inside the directive that ends a title, spaces after it, of a Wardley map]
[test: a U+2028 inside the first of two directives that spaces separate, in a
title of a Wardley map] [test: a U+2028 inside the last of two directives,
spaces before both, in a title of a Wardley map] [test: a U+2028 inside the
first of two directives that touch, spaces before them, in a title of a Wardley
map] [test: a U+2028 inside the directive that ends a title, a no-break space
before it, of a Wardley map] [test: a U+2028 inside a directive that a comment
touches in a title, spaces before it, of a Wardley map] [test: a U+2028 inside a
directive that spaces and a comment follow in a title, of a Wardley map] [test:
a line break inside the first of two directives that spaces separate, in a title
of a Wardley map] [test: a line break inside the last of two directives, spaces
before both, in a title of a Wardley map] [test: a line break inside the first
of two directives that touch, spaces before them, in a title of a Wardley map]
[test: a line break inside the directive that ends a title, a no-break space
before it, of a Wardley map] [test: a line break inside a directive that a
comment touches in a title, spaces before it, of a Wardley map] [test: a line
break inside a directive that spaces and a comment follow in a title, of a
Wardley map] [test: a tab between the keyword and the directive of a title of
directives only of a Wardley map] [test: spaces between the keyword and the
directive of a title of directives only of a Wardley map] [test: spaces after
the directive of a title of directives only of a Wardley map] [test: spaces on
both sides of the directive of a title of directives only of a Wardley map]
[test: two directives that spaces separate, a title of directives only of a
Wardley map] [test: two directives that touch, spaces before them, a title of
directives only of a Wardley map] [test: a comment that touches the directive of
a title of directives only of a Wardley map] [test: a space and a comment after
the directive of a title of directives only of a Wardley map] [test: released
output that the document does not state: U+000B after the last semicolon of a
title, no directive, of a Wardley map] [test: released output that the document
does not state: U+000B between the last semicolon of a title and a comment, no
directive, of a Wardley map] [test: released output that the document does not
state: U+000C after the last semicolon of a title, no directive, of a Wardley
map] [test: released output that the document does not state: U+000C between the
last semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: a no-break space between the
last semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: U+1680 after the last
semicolon of a title, no directive, of a Wardley map] [test: released output
that the document does not state: U+1680 between the last semicolon of a title
and a comment, no directive, of a Wardley map] [test: released output that the
document does not state: U+2000 after the last semicolon of a title, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2000 between the last semicolon of a title and a comment, no directive,
of a Wardley map] [test: released output that the document does not state:
U+2001 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2001 between the last
semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: U+2002 after the last
semicolon of a title, no directive, of a Wardley map] [test: released output
that the document does not state: U+2002 between the last semicolon of a title
and a comment, no directive, of a Wardley map] [test: released output that the
document does not state: U+2003 after the last semicolon of a title, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2003 between the last semicolon of a title and a comment, no directive,
of a Wardley map] [test: released output that the document does not state:
U+2004 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2004 between the last
semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: U+2005 after the last
semicolon of a title, no directive, of a Wardley map] [test: released output
that the document does not state: U+2005 between the last semicolon of a title
and a comment, no directive, of a Wardley map] [test: released output that the
document does not state: U+2006 after the last semicolon of a title, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2006 between the last semicolon of a title and a comment, no directive,
of a Wardley map] [test: released output that the document does not state:
U+2007 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2007 between the last
semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: U+2008 after the last
semicolon of a title, no directive, of a Wardley map] [test: released output
that the document does not state: U+2008 between the last semicolon of a title
and a comment, no directive, of a Wardley map] [test: released output that the
document does not state: U+2009 after the last semicolon of a title, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2009 between the last semicolon of a title and a comment, no directive,
of a Wardley map] [test: released output that the document does not state:
U+200A after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+200A between the last
semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: U+202F after the last
semicolon of a title, no directive, of a Wardley map] [test: released output
that the document does not state: U+202F between the last semicolon of a title
and a comment, no directive, of a Wardley map] [test: released output that the
document does not state: U+205F after the last semicolon of a title, no
directive, of a Wardley map] [test: released output that the document does not
state: U+205F between the last semicolon of a title and a comment, no directive,
of a Wardley map] [test: released output that the document does not state:
U+3000 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+3000 between the last
semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: U+FEFF after the last
semicolon of a title, no directive, of a Wardley map] [test: released output
that the document does not state: U+FEFF between the last semicolon of a title
and a comment, no directive, of a Wardley map] [test: released output that the
document does not state: U+2028 after the last semicolon of a title, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2029 after the last semicolon of a title, no directive, of a Wardley
map] [test: released output that the document does not state: spaces between the
last semicolon of a title and a comment, no directive, of a Wardley map] [test:
released output that the document does not state: a tab between the last
semicolon of a title and a comment, no directive, of a Wardley map] [test: a
wide space before two directives that spaces separate, one space before the
first directive, in a title of a Wardley map] [test: a wide space before two
directives that spaces separate, a run of spaces before the first directive, in
a title of a Wardley map] [test: a wide space before two directives that spaces
separate, a tab before the first directive, in a title of a Wardley map] [test:
a wide space before two directives that spaces separate, U+2028 before the first
directive, in a title of a Wardley map] [test: a wide space before two
directives that spaces separate, U+2029 before the first directive, in a title
of a Wardley map] [test: a wide space before two directives that spaces
separate, a no-break space between the two directives, in a title of a Wardley
map] [test: a wide space before two directives that spaces separate, U+2028
between the two directives, in a title of a Wardley map] [test: a wide space
before two directives that spaces separate, U+2029 between the two directives,
in a title of a Wardley map] [test: a wide space before two directives that
spaces separate, the first directive holds a line break inside, in a title of a
Wardley map] [test: a wide space before two directives that spaces separate, the
last directive holds a line break inside, in a title of a Wardley map] [test: a
wide space before two directives that spaces separate, the first directive holds
a `;` inside, in a title of a Wardley map] [test: a wide space before two
directives that spaces separate, the last directive holds a `;` inside, in a
title of a Wardley map] [test: a wide space before two directives that spaces
separate, the first directive holds a U+2028 inside, in a title of a Wardley
map] [test: a wide space before two directives that spaces separate, the last
directive holds a U+2028 inside, in a title of a Wardley map] [test: a wide
space before two directives that spaces separate, a comment touching the last
directive, in a title of a Wardley map] [test: a wide space before two
directives that spaces separate, a value of directives only, in a title of a
Wardley map] [test: a wide space before a directive that spaces and a comment
follow, one space before the first directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a run
of spaces before the first directive, in a title of a Wardley map] [test: a wide
space before a directive that spaces and a comment follow, a tab before the
first directive, in a title of a Wardley map] [test: a wide space before a
directive that spaces and a comment follow, one space after the last directive,
in a title of a Wardley map] [test: a wide space before a directive that spaces
and a comment follow, a tab after the last directive, in a title of a Wardley
map] [test: a wide space before a directive that spaces and a comment follow, a
no-break space after the last directive, in a title of a Wardley map] [test: a
wide space before a directive that spaces and a comment follow, the first
directive holds a line break inside, in a title of a Wardley map] [test: a wide
space before a directive that spaces and a comment follow, the first directive
holds a `;` inside, in a title of a Wardley map] [test: a wide space before a
directive that spaces and a comment follow, the first directive holds a U+2028
inside, in a title of a Wardley map] [test: a wide space before a directive that
spaces and a comment follow, a second directive touching the first, in a title
of a Wardley map] [test: a wide space before a directive that spaces and a
comment follow, a second directive after a space, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a value
of directives only, in a title of a Wardley map] [test: a wide space before two
directives that touch and a comment that touches the last, in a title of a
Wardley map] [test: a wide space before two directives that touch and a comment
that touches the last, one space before the first directive, in a title of a
Wardley map] [test: a wide space before two directives that touch and a comment
that touches the last, a run of spaces before the first directive, in a title of
a Wardley map] [test: a wide space before two directives that touch and a
comment that touches the last, a tab before the first directive, in a title of a
Wardley map] [test: a wide space before two directives that touch and a comment
that touches the last, one space after the last directive, in a title of a
Wardley map] [test: a wide space before two directives that touch and a comment
that touches the last, a tab after the last directive, in a title of a Wardley
map] [test: a wide space before two directives that touch and a comment that
touches the last, a no-break space after the last directive, in a title of a
Wardley map] [test: a wide space before two directives that touch and a comment
that touches the last, the first directive holds a line break inside, in a title
of a Wardley map] [test: a wide space before two directives that touch and a
comment that touches the last, the last directive holds a line break inside, in
a title of a Wardley map] [test: a wide space before two directives that touch
and a comment that touches the last, the first directive holds a `;` inside, in
a title of a Wardley map] [test: a wide space before two directives that touch
and a comment that touches the last, the last directive holds a `;` inside, in a
title of a Wardley map] [test: a wide space before two directives that touch and
a comment that touches the last, the first directive holds a U+2028 inside, in a
title of a Wardley map] [test: a wide space before two directives that touch and
a comment that touches the last, the last directive holds a U+2028 inside, in a
title of a Wardley map] [test: a wide space before two directives that touch and
a comment that touches the last, a value of directives only, in a title of a
Wardley map] [test: a U+2028 before two directives that touch, one space before
the first directive, in a title of a Wardley map] [test: a U+2028 before two
directives that touch, a run of spaces before the first directive, in a title of
a Wardley map] [test: a U+2028 before two directives that touch, a tab before
the first directive, in a title of a Wardley map] [test: a U+2028 before two
directives that touch, one space after the last directive, in a title of a
Wardley map] [test: a U+2028 before two directives that touch, a run of spaces
after the last directive, in a title of a Wardley map] [test: a U+2028 before
two directives that touch, a tab after the last directive, in a title of a
Wardley map] [test: a U+2028 before two directives that touch, a no-break space
after the last directive, in a title of a Wardley map] [test: a U+2028 before
two directives that touch, U+2028 after the last directive, in a title of a
Wardley map] [test: a U+2028 before two directives that touch, U+2029 after the
last directive, in a title of a Wardley map] [test: a U+2028 before two
directives that touch, the first directive holds a line break inside, in a title
of a Wardley map] [test: a U+2028 before two directives that touch, the last
directive holds a line break inside, in a title of a Wardley map] [test: a
U+2028 before two directives that touch, the first directive holds a `;` inside,
in a title of a Wardley map] [test: a U+2028 before two directives that touch,
the last directive holds a `;` inside, in a title of a Wardley map] [test: a
U+2028 before two directives that touch, the first directive holds a U+2028
inside, in a title of a Wardley map] [test: a U+2028 before two directives that
touch, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a value of directives only, in
a title of a Wardley map] [test: a U+2028 before a directive that spaces follow,
in a title of a Wardley map] [test: a U+2028 before a directive that spaces
follow, one space before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, a run of spaces before
the first directive, in a title of a Wardley map] [test: a U+2028 before a
directive that spaces follow, a tab before the first directive, in a title of a
Wardley map] [test: a U+2028 before a directive that spaces follow, U+2029
before the first directive, in a title of a Wardley map] [test: a U+2028 before
a directive that spaces follow, one space after the last directive, in a title
of a Wardley map] [test: a U+2028 before a directive that spaces follow, a tab
after the last directive, in a title of a Wardley map] [test: a U+2028 before a
directive that spaces follow, a no-break space after the last directive, in a
title of a Wardley map] [test: a U+2028 before a directive that spaces follow,
U+2028 after the last directive, in a title of a Wardley map] [test: a U+2028
before a directive that spaces follow, U+2029 after the last directive, in a
title of a Wardley map] [test: a U+2028 before a directive that spaces follow,
the first directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the first directive holds
a `;` inside, in a title of a Wardley map] [test: a U+2028 before a directive
that spaces follow, the first directive holds a U+2028 inside, in a title of a
Wardley map] [test: a U+2028 before a directive that spaces follow, a second
directive after a space, in a title of a Wardley map] [test: a U+2028 before two
directives that spaces separate, a no-break space between the two directives, in
a title of a Wardley map] [test: a U+2028 before two directives that spaces
separate, U+2028 between the two directives, in a title of a Wardley map] [test:
a U+2028 before two directives that spaces separate, U+2029 between the two
directives, in a title of a Wardley map] [test: a U+2028 before two directives
that spaces separate, the first directive holds a line break inside, in a title
of a Wardley map] [test: a U+2028 before two directives that spaces separate,
the last directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the first directive
holds a `;` inside, in a title of a Wardley map] [test: a U+2028 before two
directives that spaces separate, the last directive holds a `;` inside, in a
title of a Wardley map] [test: a U+2028 before two directives that spaces
separate, the first directive holds a U+2028 inside, in a title of a Wardley
map] [test: a U+2028 before two directives that spaces separate, the last
directive holds a U+2028 inside, in a title of a Wardley map] [test: a directive
that holds a line break, spaces before it, one space before the first directive,
in a title of a Wardley map] [test: a directive that holds a line break, spaces
before it, a tab before the first directive, in a title of a Wardley map] [test:
a directive that holds a line break, spaces before it, U+2028 before the first
directive, in a title of a Wardley map] [test: a directive that holds a line
break, spaces before it, U+2029 before the first directive, in a title of a
Wardley map] [test: a directive that holds a line break, spaces before it, one
space after the last directive, in a title of a Wardley map] [test: a directive
that holds a line break, spaces before it, a tab after the last directive, in a
title of a Wardley map] [test: a directive that holds a line break, spaces
before it, a no-break space after the last directive, in a title of a Wardley
map] [test: a directive that holds a line break, spaces before it, U+2028 after
the last directive, in a title of a Wardley map] [test: a directive that holds a
line break, spaces before it, U+2029 after the last directive, in a title of a
Wardley map] [test: a directive that holds a line break, spaces before it, a
second directive after a space, in a title of a Wardley map] [test: a directive
that holds a line break, spaces before it, a value of directives only, in a
title of a Wardley map] [test: a directive that holds a U+2028, spaces before
it, one space before the first directive, in a title of a Wardley map] [test: a
directive that holds a U+2028, spaces before it, a tab before the first
directive, in a title of a Wardley map] [test: a directive that holds a U+2028,
spaces before it, U+2028 before the first directive, in a title of a Wardley
map] [test: a directive that holds a U+2028, spaces before it, U+2029 before the
first directive, in a title of a Wardley map] [test: a directive that holds a
U+2028, spaces before it, one space after the last directive, in a title of a
Wardley map] [test: a directive that holds a U+2028, spaces before it, a tab
after the last directive, in a title of a Wardley map] [test: a directive that
holds a U+2028, spaces before it, a no-break space after the last directive, in
a title of a Wardley map] [test: a directive that holds a U+2028, spaces before
it, U+2028 after the last directive, in a title of a Wardley map] [test: a
directive that holds a U+2028, spaces before it, U+2029 after the last
directive, in a title of a Wardley map] [test: a directive that holds a U+2028,
spaces before it, a second directive after a space, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, a value of directives
only, in a title of a Wardley map] [test: a U+2028 inside the text, spaces
before the directive, one space before the first directive, in a title of a
Wardley map] [test: a U+2028 inside the text, spaces before the directive, a tab
before the first directive, in a title of a Wardley map] [test: a U+2028 inside
the text, spaces before the directive, a no-break space before the first
directive, in a title of a Wardley map] [test: a U+2028 inside the text, spaces
before the directive, U+2028 before the first directive, in a title of a Wardley
map] [test: a U+2028 inside the text, spaces before the directive, U+2029 before
the first directive, in a title of a Wardley map] [test: a U+2028 inside the
text, spaces before the directive, one space after the last directive, in a
title of a Wardley map] [test: a U+2028 inside the text, spaces before the
directive, a tab after the last directive, in a title of a Wardley map] [test: a
U+2028 inside the text, spaces before the directive, a no-break space after the
last directive, in a title of a Wardley map] [test: a U+2028 inside the text,
spaces before the directive, U+2028 after the last directive, in a title of a
Wardley map] [test: a U+2028 inside the text, spaces before the directive,
U+2029 after the last directive, in a title of a Wardley map] [test: a U+2028
inside the text, spaces before the directive, the first directive holds a line
break inside, in a title of a Wardley map] [test: a U+2028 inside the text,
spaces before the directive, the first directive holds a `;` inside, in a title
of a Wardley map] [test: a U+2028 inside the text, spaces before the directive,
the first directive holds a U+2028 inside, in a title of a Wardley map] [test: a
U+2028 inside the text, spaces before the directive, a second directive touching
the first, in a title of a Wardley map] [test: a U+2028 inside the text, spaces
before the directive, a second directive after a space, in a title of a Wardley
map] [test: a U+2028 inside the text, spaces before the directive, a comment
touching the last directive, in a title of a Wardley map] [test: a U+2028 inside
the text, spaces before the directive, a value of directives only, in a title of
a Wardley map] [test: a value of directives only, spaces after the directive, a
tab before the first directive, in a title of a Wardley map] [test: a value of
directives only, spaces after the directive, one space after the last directive,
in a title of a Wardley map] [test: a value of directives only, spaces after the
directive, a tab after the last directive, in a title of a Wardley map] [test: a
value of directives only, spaces after the directive, a no-break space after the
last directive, in a title of a Wardley map] [test: a value of directives only,
spaces after the directive, U+2028 after the last directive, in a title of a
Wardley map] [test: a value of directives only, spaces after the directive,
U+2029 after the last directive, in a title of a Wardley map] [test: a value of
directives only, spaces after the directive, the first directive holds a line
break inside, in a title of a Wardley map] [test: a value of directives only,
spaces after the directive, the first directive holds a `;` inside, in a title
of a Wardley map] [test: a value of directives only, spaces after the directive,
the first directive holds a U+2028 inside, in a title of a Wardley map] [test: a
value of directives only, spaces after the directive, a second directive
touching the first, in a title of a Wardley map] [test: a value of directives
only, spaces after the directive, a second directive after a space, in a title
of a Wardley map] [test: a directive inside the text, spaces before and after
the last directive, in a title of a Wardley map] [test: a directive inside the
text, spaces before and after the last directive, one space before the first
directive, in a title of a Wardley map] [test: a directive inside the text,
spaces before and after the last directive, a tab before the first directive, in
a title of a Wardley map] [test: a directive inside the text, spaces before and
after the last directive, a no-break space before the first directive, in a
title of a Wardley map] [test: a directive inside the text, spaces before and
after the last directive, U+2028 before the first directive, in a title of a
Wardley map] [test: a directive inside the text, spaces before and after the
last directive, U+2029 before the first directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive,
one space after the last directive, in a title of a Wardley map] [test: a
directive inside the text, spaces before and after the last directive, a tab
after the last directive, in a title of a Wardley map] [test: a directive inside
the text, spaces before and after the last directive, a no-break space after the
last directive, in a title of a Wardley map] [test: a directive inside the text,
spaces before and after the last directive, U+2028 after the last directive, in
a title of a Wardley map] [test: a directive inside the text, spaces before and
after the last directive, U+2029 after the last directive, in a title of a
Wardley map] [test: a directive inside the text, spaces before and after the
last directive, the first directive holds a line break inside, in a title of a
Wardley map] [test: a directive inside the text, spaces before and after the
last directive, the first directive holds a `;` inside, in a title of a Wardley
map] [test: a directive inside the text, spaces before and after the last
directive, the first directive holds a U+2028 inside, in a title of a Wardley
map] [test: a directive inside the text, spaces before and after the last
directive, a second directive touching the first, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive,
a second directive after a space, in a title of a Wardley map] [test: a
directive inside the text, spaces before and after the last directive, a comment
touching the last directive, in a title of a Wardley map] [test: a directive
inside the text, spaces before and after the last directive, a value of
directives only, in a title of a Wardley map] [test: a `;` and no directive, in
a title of a Wardley map] [test: a `;` and no directive, one space after the
last `;`, in a title of a Wardley map] [test: released output that the document
does not state: a `;` and no directive, one space after the last `;`, a comment
follows, in a title of a Wardley map] [test: a `;` and no directive, one space
between the text and the `;`, in a title of a Wardley map] [test: a `;` and no
directive, a run of spaces between the text and the `;`, in a title of a Wardley
map] [test: a `;` and no directive, a run of spaces between the keyword and the
text, in a title of a Wardley map] [test: a `;` and no directive, a tab between
the text and the `;`, in a title of a Wardley map] [test: a `;` and no
directive, a no-break space between the text and the `;`, in a title of a
Wardley map] [test: a `;` and no directive, a no-break space between the keyword
and the text, in a title of a Wardley map] [test: a `;` and no directive, U+3000
between the text and the `;`, in a title of a Wardley map] [test: a `;` and no
directive, U+3000 between the keyword and the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive,
U+2028 between the text and the `;`, in a title of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, U+2028
between the keyword and the text, in a title of a Wardley map] [test: released
output that the document does not state: a `;` and no directive, U+2029 between
the text and the `;`, in a title of a Wardley map] [test: released output that
the document does not state: a `;` and no directive, U+2029 between the keyword
and the text, in a title of a Wardley map] [test: released output that the
document does not state: a `;` and no directive, a comment touching the `;`, in
a title of a Wardley map] [test: released output that the document does not
state: a `;` and no directive, a `;` in a comment after the text, no `;` before,
in a title of a Wardley map] [test: released output that the document does not
state: a `;` and no directive, a `;` in a comment after the `;`, in a title of a
Wardley map] [test: a `;` and no directive, two `;`, in a title of a Wardley
map] [test: a `;` and no directive, two `;` that spaces separate, in a title of
a Wardley map] [test: a `;` and no directive, the `;` that the line rule
ignores, in a title of a Wardley map] [test: a `;` and no directive, the `;`
that the line rule ignores, a no-break space after, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, one space before the
first directive, in a title of a Wardley map] [test: a `;` in the text, spaces
before the directive, one space after the last directive, in a title of a
Wardley map] [test: a `;` in the text, spaces before the directive, U+2028 after
the last directive, in a title of a Wardley map] [test: a `;` in the text,
spaces before the directive, U+2029 after the last directive, in a title of a
Wardley map] [test: a `;` in the text, spaces before the directive, the first
directive holds a line break inside, in a title of a Wardley map] [test: a `;`
in the text, spaces before the directive, the first directive holds a `;`
inside, in a title of a Wardley map] [test: a `;` in the text, spaces before the
directive, the first directive holds a U+2028 inside, in a title of a Wardley
map] [test: a `;` in the text, spaces between two directives, a tab before the
first directive, in a title of a Wardley map] [test: a `;` in the text, spaces
between two directives, a no-break space before the first directive, in a title
of a Wardley map] [test: a `;` in the text, spaces between two directives,
U+2028 before the first directive, in a title of a Wardley map] [test: a `;` in
the text, spaces between two directives, U+2029 before the first directive, in a
title of a Wardley map] [test: a `;` in the text, spaces between two directives,
a tab between the two directives, in a title of a Wardley map] [test: a `;` in
the text, spaces between two directives, U+2028 between the two directives, in a
title of a Wardley map] [test: a `;` in the text, spaces between two directives,
U+2029 between the two directives, in a title of a Wardley map] [test: a `;` in
the text, spaces between two directives, the first directive holds a line break
inside, in a title of a Wardley map] [test: a `;` in the text, spaces between
two directives, the last directive holds a line break inside, in a title of a
Wardley map] [test: a `;` in the text, spaces between two directives, the first
directive holds a `;` inside, in a title of a Wardley map] [test: a `;` in the
text, spaces between two directives, the last directive holds a `;` inside, in a
title of a Wardley map] [test: a `;` in the text, spaces between two directives,
the first directive holds a U+2028 inside, in a title of a Wardley map] [test: a
`;` in the text, spaces between two directives, the last directive holds a
U+2028 inside, in a title of a Wardley map] [test: a `;` in the text, spaces
between two directives, a comment touching the last directive, in a title of a
Wardley map] [test: a `;` between two directives, spaces around it, one space
before the first directive, in a title of a Wardley map] [test: a `;` between
two directives, spaces around it, a tab before the first directive, in a title
of a Wardley map] [test: a `;` between two directives, spaces around it, a
no-break space before the first directive, in a title of a Wardley map] [test: a
`;` between two directives, spaces around it, U+2028 before the first directive,
in a title of a Wardley map] [test: a `;` between two directives, spaces around
it, U+2029 before the first directive, in a title of a Wardley map] [test: a `;`
between two directives, spaces around it, one space after the last directive, in
a title of a Wardley map] [test: a `;` between two directives, spaces around it,
a run of spaces after the last directive, in a title of a Wardley map] [test: a
`;` between two directives, spaces around it, a tab after the last directive, in
a title of a Wardley map] [test: a `;` between two directives, spaces around it,
a no-break space after the last directive, in a title of a Wardley map] [test: a
`;` between two directives, spaces around it, U+2028 after the last directive,
in a title of a Wardley map] [test: a `;` between two directives, spaces around
it, U+2029 after the last directive, in a title of a Wardley map] [test: a `;`
between two directives, spaces around it, the first directive holds a line break
inside, in a title of a Wardley map] [test: a `;` between two directives, spaces
around it, the last directive holds a line break inside, in a title of a Wardley
map] [test: a `;` between two directives, spaces around it, the first directive
holds a `;` inside, in a title of a Wardley map] [test: a `;` between two
directives, spaces around it, the last directive holds a `;` inside, in a title
of a Wardley map] [test: a `;` between two directives, spaces around it, the
first directive holds a U+2028 inside, in a title of a Wardley map] [test: a `;`
between two directives, spaces around it, the last directive holds a U+2028
inside, in a title of a Wardley map] [test: a `;` between two directives, spaces
around it, one directive only, in a title of a Wardley map] [test: a `;` between
two directives, spaces around it, a comment touching the last directive, in a
title of a Wardley map] [test: a `;` between two directives, spaces around it, a
value of directives only, in a title of a Wardley map] [test: a `;` after the
last directive, one space before the first directive, in a title of a Wardley
map] [test: a `;` after the last directive, a tab before the first directive, in
a title of a Wardley map] [test: a `;` after the last directive, a no-break
space before the first directive, in a title of a Wardley map] [test: a `;`
after the last directive, U+2028 before the first directive, in a title of a
Wardley map] [test: a `;` after the last directive, U+2029 before the first
directive, in a title of a Wardley map] [test: a `;` after the last directive,
the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` after the last directive, the first directive holds a `;` inside,
in a title of a Wardley map] [test: a `;` after the last directive, the first
directive holds a U+2028 inside, in a title of a Wardley map] [test: a `;` after
the last directive, a second directive touching the first, in a title of a
Wardley map] [test: a `;` after the last directive, a second directive after a
space, in a title of a Wardley map] [test: a `;` after the last directive, a
comment touching the last directive, in a title of a Wardley map] [test: a `;`
after the last directive, a value of directives only, in a title of a Wardley
map] [test: a U+2028 before two directives that a wide space separates, a
comment after them, one space before the first directive, in a title of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, a tab before the first directive, in a title of a Wardley
map] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a no-break space before the first directive, in a title of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, a value of directives only, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, one
space before the first directive, in a title of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, a tab before the
first directive, in a title of a Wardley map] [test: a U+2028 before a directive
that a wide space and a comment follow, a value of directives only, in a title
of a Wardley map] [test: released output that the document does not state: a `;`
and no directive, spaces and a U+2028 after the last `;`, in a title of a
Wardley map] [test: released output that the document does not state: a `;` and
no directive, a U+2028 and spaces after the last `;`, in a title of a Wardley
map] [test: released output that the document does not state: a `;` and no
directive, spaces, a U+2028, and spaces after the last `;`, in a title of a
Wardley map] [test: released output that the document does not state: a `;` and
no directive, a no-break space, a U+2028, and a no-break space after the last
`;`, in a title of a Wardley map] [test: released output that the document does
not state: a `;` and no directive, a U+2028 and a tab after the last `;`, in a
title of a Wardley map] [test: released output that the document does not state:
a `;` and no directive, a U+2029 and a no-break space after the last `;`, in a
title of a Wardley map] [test: a `;` after the last directive, a U+2028 before
the directives, a comment after it, in a title of a Wardley map] [test: a `;`
after the last directive, a U+2028 before the directives, a comment after it,
one space before the first directive, in a title of a Wardley map] [test: a `;`
after the last directive, a U+2028 before the directives, a comment after it, a
run of spaces before the first directive, in a title of a Wardley map] [test: a
`;` after the last directive, a U+2028 before the directives, a comment after
it, a tab before the first directive, in a title of a Wardley map] [test: a `;`
after the last directive, a U+2028 before the directives, a comment after it, a
no-break space before the first directive, in a title of a Wardley map] [test: a
`;` after the last directive, a U+2028 before the directives, a comment after
it, U+2029 before the first directive, in a title of a Wardley map] [test: a `;`
after the last directive, a U+2028 before the directives, a comment after it,
the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment
after it, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment
after it, the first directive holds a U+2028 inside, in a title of a Wardley
map] [test: a `;` after the last directive, a U+2028 before the directives, a
comment after it, a second directive touching the first, in a title of a Wardley
map] [test: a `;` after the last directive, a U+2028 before the directives, a
comment after it, a second directive after a space, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment
after it, no comment, in a title of a Wardley map] [test: a `;` after the last
directive, a U+2028 before the directives, a comment after it, a value of
directives only, in a title of a Wardley map] [test: a `;` between two
directives, a U+2028 before the directives, a comment after them, in a title of
a Wardley map] [test: a `;` between two directives, a U+2028 before the
directives, a comment after them, one space before the first directive, in a
title of a Wardley map] [test: a `;` between two directives, a U+2028 before the
directives, a comment after them, a run of spaces before the first directive, in
a title of a Wardley map] [test: a `;` between two directives, a U+2028 before
the directives, a comment after them, a tab before the first directive, in a
title of a Wardley map] [test: a `;` between two directives, a U+2028 before the
directives, a comment after them, a no-break space before the first directive,
in a title of a Wardley map] [test: a `;` between two directives, a U+2028
before the directives, a comment after them, U+2029 before the first directive,
in a title of a Wardley map] [test: a `;` between two directives, a U+2028
before the directives, a comment after them, the first directive holds a line
break inside, in a title of a Wardley map] [test: a `;` between two directives,
a U+2028 before the directives, a comment after them, the last directive holds a
line break inside, in a title of a Wardley map] [test: a `;` between two
directives, a U+2028 before the directives, a comment after them, the first
directive holds a `;` inside, in a title of a Wardley map] [test: a `;` between
two directives, a U+2028 before the directives, a comment after them, the last
directive holds a `;` inside, in a title of a Wardley map] [test: a `;` between
two directives, a U+2028 before the directives, a comment after them, the first
directive holds a U+2028 inside, in a title of a Wardley map] [test: a `;`
between two directives, a U+2028 before the directives, a comment after them,
the last directive holds a U+2028 inside, in a title of a Wardley map] [test: a
`;` between two directives, a U+2028 before the directives, a comment after
them, no comment, in a title of a Wardley map] [test: a `;` between two
directives, a U+2028 before the directives, a comment after them, a value of
directives only, in a title of a Wardley map] [test: a U+2028 after the last
directive that spaces and a comment follow, one space after the last directive,
in a title of a Wardley map] [test: a U+2028 after the last directive that
spaces and a comment follow, a tab after the last directive, in a title of a
Wardley map] [test: a U+2028 after the last directive that spaces and a comment
follow, no comment, in a title of a Wardley map] [test: a U+2028 between two
directives, spaces and a comment after the last one, one space between the two
directives, in a title of a Wardley map] [test: a U+2028 between two directives,
spaces and a comment after the last one, a run of spaces between the two
directives, in a title of a Wardley map] [test: a U+2028 between two directives,
spaces and a comment after the last one, a tab between the two directives, in a
title of a Wardley map] [test: a U+2028 between two directives, spaces and a
comment after the last one, a no-break space between the two directives, in a
title of a Wardley map] [test: a U+2028 between two directives, spaces and a
comment after the last one, no comment, in a title of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, a
U+2028 and a space stand before the text, in a title of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, a
U+2028 and a tab stand before the text, in a title of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, a
U+2029 and two spaces stand before the text, in a title of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, a
U+2028 and a no-break space stand before the text, in a title of a Wardley map]
[test: a directive, a `;`, two spaces, a directive, in a title of directives
only of a Wardley map] [test: a directive, a space, a `;`, two spaces, a
directive, in a title of directives only of a Wardley map] [test: a directive, a
tab, a `;`, two spaces, a directive, in a title of directives only of a Wardley
map] [test: a directive, a no-break space, a `;`, two spaces, a directive, in a
title of directives only of a Wardley map] [test: a directive, U+3000, a `;`,
two spaces, a directive, in a title of directives only of a Wardley map] [test:
a directive, a vertical tab, a `;`, two spaces, a directive, in a title of
directives only of a Wardley map] [test: a directive, a form feed, a `;`, two
spaces, a directive, in a title of directives only of a Wardley map] [test: a
directive, U+2028, a `;`, two spaces, a directive, in a title of directives only
of a Wardley map] [test: a directive, U+2029, a `;`, two spaces, a directive, in
a title of directives only of a Wardley map] [test: a directive, a space,
U+2028, a `;`, two spaces, a directive, in a title of directives only of a
Wardley map] [test: a directive, U+2028, a space, a `;`, two spaces, a
directive, in a title of directives only of a Wardley map] [test: a directive,
two spaces, a `;`, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a space, a directive, in a title of
directives only of a Wardley map] [test: a directive, two spaces, a `;`, a tab,
a directive, in a title of directives only of a Wardley map] [test: a directive,
two spaces, a `;`, a no-break space, a directive, in a title of directives only
of a Wardley map] [test: a directive, two spaces, a `;`, U+3000, a directive, in
a title of directives only of a Wardley map] [test: a directive, two spaces, a
`;`, U+2028, a directive, in a title of directives only of a Wardley map] [test:
a directive, two spaces, a `;`, U+2029, a directive, in a title of directives
only of a Wardley map] [test: a directive, two spaces, a `;`, a space, U+2028, a
directive, in a title of directives only of a Wardley map] [test: a directive,
two spaces, a `;`, two spaces, a directive, a space, in a title of directives
only of a Wardley map] [test: a directive, two spaces, a `;`, two spaces, a
directive, two spaces, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a directive, a tab, in a title of
directives only of a Wardley map] [test: a directive, two spaces, a `;`, two
spaces, a directive, a no-break space, in a title of directives only of a
Wardley map] [test: a directive, two spaces, a `;`, two spaces, a directive,
U+3000, in a title of directives only of a Wardley map] [test: a directive, two
spaces, a `;`, two spaces, a directive, a vertical tab, in a title of directives
only of a Wardley map] [test: a directive, two spaces, a `;`, two spaces, a
directive, U+2028, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a directive, U+2029, in a title of
directives only of a Wardley map] [test: a directive, two spaces, a `;`, two
spaces, a directive, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a space, a
comment, in a title of directives only of a Wardley map] [test: a directive, two
spaces, a `;`, two spaces, a directive, a tab, a comment, in a title of
directives only of a Wardley map] [test: a directive, two spaces, a `;`, two
spaces, a directive, a no-break space, a comment, in a title of directives only
of a Wardley map] [test: a directive, two spaces, a `;`, in a title of
directives only of a Wardley map] [test: a directive, a `;`, two spaces, in a
title of directives only of a Wardley map] [test: a directive, two spaces, a
`;`, two spaces, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, a comment, in a title of directives only of a
Wardley map] [test: a directive, a `;`, a space, a comment, in a title of
directives only of a Wardley map] [test: a directive, two spaces, a `;`, two
spaces, a comment, in a title of directives only of a Wardley map] [test: a
directive, a `;`, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a tab, a comment, in a title of
directives only of a Wardley map] [test: a directive, a `;`, a `;`, in a title
of directives only of a Wardley map] [test: a directive, two spaces, a `;`, a
`;`, in a title of directives only of a Wardley map] [test: a directive, a `;`,
two spaces, a `;`, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a `;`, in a title of directives only
of a Wardley map] [test: a directive, two spaces, a `;`, two spaces, a `;`, two
spaces, a directive, in a title of directives only of a Wardley map] [test: a
directive, a `;`, a `;`, two spaces, a directive, in a title of directives only
of a Wardley map] [test: a directive, a directive, two spaces, a `;`, two
spaces, a directive, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a directive, a directive, in a title
of directives only of a Wardley map] [test: a directive, a `;`, a directive, a
`;`, a directive, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a directive, two spaces, a `;`, two
spaces, a directive, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a directive, a `;`, in a title of
directives only of a Wardley map] [test: a directive, two spaces, a `;`, two
spaces, a directive, two spaces, a `;`, in a title of directives only of a
Wardley map] [test: a directive, two spaces, a directive, two spaces, a `;`, two
spaces, a directive, in a title of directives only of a Wardley map] [test: a
directive, two spaces, a `;`, two spaces, a directive, two spaces, a directive,
in a title of directives only of a Wardley map] [test: a directive, a `;`, two
spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of
directives only of a Wardley map] [test: a directive, a `;`, a directive, a `;`,
in a title of directives only of a Wardley map] [test: a `;`, a directive, in a
title of directives only of a Wardley map] [test: a `;`, two spaces, a
directive, in a title of directives only of a Wardley map] [test: a directive, a
`;`, two spaces, a `;`, two spaces, in a title of directives only of a Wardley
map] [test: a `;` in the comment after the last directive, two spaces around the
`;` between two directives, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a no-break space, a `;`, two spaces, a directive, in
a title of directives only of a Wardley map] [test: a directive, a no-break
space, a `;`, two spaces, a `;`, two spaces, a directive, in a title of
directives only of a Wardley map] [test: a directive, a `;`, U+2028, a `;`, a
directive, in a title of directives only of a Wardley map] [test: a directive,
two spaces, a `;`, two spaces, a no-break space, two spaces, a `;`, two spaces,
a directive, in a title of directives only of a Wardley map] [test: a directive,
a `;`, a no-break space, a `;`, two spaces, a `;`, two spaces, a directive, in a
title of directives only of a Wardley map] [test: a directive, U+2028, a `;`,
two spaces, a `;`, two spaces, a directive, in a title of directives only of a
Wardley map] [test: two U+2028 before the directive that ends a title, of a
Wardley map] [test: two U+2029 before the directive that ends a title, of a
Wardley map] [test: U+2028 and U+2029 before the directive that ends a title, of
a Wardley map] [test: two U+2028 before the directive that ends a title, spaces
after it, of a Wardley map] [test: U+2029 and U+2028 before the directive that
ends a title, spaces after it, of a Wardley map] [test: two U+2028 before two
directives that touch and end a title, of a Wardley map] [test: two U+2028
before a directive that a space and another directive follow in a title, of a
Wardley map] [test: a U+2028 inside the directive that ends a title, spaces
before it, a comment after two spaces, of a Wardley map] [test: a U+2028 inside
the directive of a title of directives only, spaces before and after it, of a
Wardley map] [test: a directive that starts the text of a title, two spaces and
a text after it, spaces at the end, of a Wardley map] [test: a directive that
starts the text of a title, a space and a text after it, of a Wardley map]
[test: two directives that touch and start the text of a title, two spaces and a
text after them, spaces at the end, of a Wardley map] [test: two directives that
touch and start the text of a title, a tab and a text after them, of a Wardley
map] [test: a directive that starts the text of a title, a text with a run of
spaces inside it, spaces at the end, of a Wardley map] [test: a directive that
starts the text of a title, a text with a tab inside it, a tab at the end, of a
Wardley map] [test: two spaces before the directive that starts the text of a
title, of a Wardley map] [test: two directives with spaces between them that
start the text of a title, of a Wardley map] [test: a directive that starts the
text of a title and a directive that ends it, of a Wardley map] [test: a U+2028
inside the directive that starts the text of a title, two spaces and a text
after it, spaces at the end, of a Wardley map] [test: a line break inside the
directive that starts the text of a title, two spaces and a text after it,
spaces at the end, of a Wardley map] [test: a `;` inside the directive that
starts the text of a title, two spaces and a text after it, spaces at the end,
of a Wardley map] [test: a `;` at the end of a title, spaces after the keyword,
of a Wardley map] [test: a `;` at the end of a title, a run of spaces inside the
text, of a Wardley map] [test: a `;` after spaces at the end of a title, spaces
after it, of a Wardley map] [test: released output that the document does not
state: a text after the `;` of a title, spaces at the end, of a Wardley map]
[test: released output that the document does not state: a U+2028 in the text of
a title that ends with a `;`, of a Wardley map] [test: a comment after the text
of a title, spaces before it, of a Wardley map] [test: a run of spaces inside
the text of a title, of a Wardley map] [test: a run of tabs inside the text of a
title, spaces at the end, of a Wardley map] [test: a run of spaces inside a
quoted string in a title, of a Wardley map] [test: a run of spaces beside a
directive inside the text of a title, of a Wardley map] [test: text after the
`;` that the line rule ignores in a title, runs before and after it, of a
Wardley map] [test: text touching the `;` that the line rule ignores in a title,
a run before it, of a Wardley map] [test: text and a run after the `;` that the
line rule ignores in a title, spaces at the end, of a Wardley map] [test: two
touching `;` that the line rule reads in a title, a run before them, of a
Wardley map] [test: two `;` with spaces between them that the line rule reads in
a title, a run before them, of a Wardley map] [test: text after the last of two
`;` that the line rule reads in a title, runs around them, of a Wardley map]
[test: text after the `;` that the line rule ignores after classDef in a title,
of a Wardley map] [test: nothing after the `;` that the line rule ignores in a
title, runs before it, of a Wardley map] [test: a run inside the stretch of the
line rule, nothing after the `;` in a title, spaces at the end, of a Wardley
map] [test: nothing after the last of two `;` that the line rule reads in a
title, of a Wardley map] [test: a comment after the `;` that the line rule
ignores in a title, of a Wardley map] [test: released output that the document
does not state: a `;` inside the comment at the end of a title, a run and spaces
at the end, of a Wardley map] [test: nothing after the `;` that the line rule
ignores in a title, spaces at the end, of a Wardley map] [test: a run after the
keyword of a title, nothing after the `;` that the line rule ignores, of a
Wardley map] [test: the literal style without the trigger and a `;` at the end
of a title, spaces at the end, of a Wardley map] [test: the word Style with a
capital and a `;` at the end of a title, spaces at the end, of a Wardley map]
[test: a tab after the `;` that the line rule ignores in a title, runs before
it, of a Wardley map] [test: a classDef trigger with nothing after the `;` in a
title, runs before it, of a Wardley map] [test: the literal classDef and a `;`
at the end of a title, spaces at the end, of a Wardley map] [test: the literal
style inside a word and a `;` at the end of a title, spaces at the end, of a
Wardley map] [test: the word classdef in lower case and a `;` at the end of a
title, spaces at the end, of a Wardley map] [test: U+2028 before a directive
that a comment touches, a line follows, in a title of a Wardley map] [test:
U+2028 before a directive that a comment touches, the text ends, in a title of a
Wardley map] [test: U+2028 before a directive that a comment touches, an empty
line follows, in a title of a Wardley map] [test: U+2028 before a directive that
a comment follows after spaces, a line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, the text
ends, in a title of a Wardley map] [test: U+2028 before a directive that a
comment follows after spaces, an empty line follows, in a title of a Wardley
map] [test: U+2029 before a directive that a comment touches, a line follows, in
a title of a Wardley map] [test: U+2029 before a directive that a comment
touches, the text ends, in a title of a Wardley map] [test: U+2029 before a
directive that a comment touches, an empty line follows, in a title of a Wardley
map] [test: U+2029 before a directive that a comment follows after spaces, a
line follows, in a title of a Wardley map] [test: U+2029 before a directive that
a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, an empty
line follows, in a title of a Wardley map] [test: U+2028 before a directive that
a comment touches, a comment line follows, in a title of a Wardley map] [test:
U+2028 before a directive that a comment touches, a line of whitespace follows,
in a title of a Wardley map] [test: U+2028 before a directive that a comment
touches, a directive line follows, in a title of a Wardley map] [test: U+2028
before a directive that a comment touches, a directive line and a comment line
follow, in a title of a Wardley map] [test: U+2028 before a directive that a
comment touches, an empty line and a comment line follow, in a title of a
Wardley map] [test: U+2028 before a directive that a comment touches, a
directive line, an empty line, and a comment line follow, in a title of a
Wardley map] [test: U+2028 before a directive that a comment touches, an empty
line and a directive line follow, in a title of a Wardley map] [test: U+2028
before a directive that a comment touches, a directive line follows and the text
ends, in a title of a Wardley map] [test: U+2028 before two directives with
spaces between them that a comment touches, the text ends, in a title of a
Wardley map] [test: U+2028 before two directives with a tab between them that a
comment follows after spaces, the text ends, in a title of a Wardley map] [test:
U+2029 before a directive that a comment touches, a directive line and a comment
line follow, in a title of a Wardley map] [test: U+2028 after the last
directive, spaces and a comment after it, a comment line follows, in a title of
a Wardley map] [test: U+2028 after the last directive, spaces and a comment
after it, a line of whitespace follows, in a title of a Wardley map] [test:
U+2028 after the last directive, spaces and a comment after it, a directive line
follows, in a title of a Wardley map] [test: U+2028 after the last directive,
spaces and a comment after it, a directive line and a comment line follow, in a
title of a Wardley map] [test: U+2028 after the last directive, spaces and a
comment after it, an empty line and a comment line follow, in a title of a
Wardley map] [test: U+2028 after the last directive, spaces and a comment after
it, a directive line, an empty line, and a comment line follow, in a title of a
Wardley map] [test: U+2028 after the last directive, spaces and a comment after
it, an empty line and a directive line follow, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a
directive line follows and the text ends, in a title of a Wardley map] [test:
U+2028 after the last directive, spaces and a comment after it, the text ends,
in a title of a Wardley map] [test: U+2028 after the last directive, spaces and
a comment after it, an empty line follows, in a title of a Wardley map] [test:
U+2028 after the last directive, spaces and a comment after it, a line follows,
in a title of a Wardley map] [test: U+2029 after the last directive, spaces and
a comment after it, the text ends, in a title of a Wardley map] [test: U+2028
after the last directive, a comment touching it, the text ends, in a title of a
Wardley map] [test: U+2028 after the last directive, a comment touching it, a
directive line follows, in a title of a Wardley map] [test: U+2028 between two
directives, spaces and a comment after it, a comment line follows, in a title of
a Wardley map] [test: U+2028 between two directives, spaces and a comment after
it, a line of whitespace follows, in a title of a Wardley map] [test: U+2028
between two directives, spaces and a comment after it, a directive line follows,
in a title of a Wardley map] [test: U+2028 between two directives, spaces and a
comment after it, a directive line and a comment line follow, in a title of a
Wardley map] [test: U+2028 between two directives, spaces and a comment after
it, an empty line and a comment line follow, in a title of a Wardley map] [test:
U+2028 between two directives, spaces and a comment after it, a directive line,
an empty line, and a comment line follow, in a title of a Wardley map] [test:
U+2028 between two directives, spaces and a comment after it, an empty line and
a directive line follow, in a title of a Wardley map] [test: U+2028 between two
directives, spaces and a comment after it, a directive line follows and the text
ends, in a title of a Wardley map] [test: U+2028 between two directives, spaces
and a comment after it, the text ends, in a title of a Wardley map] [test:
U+2028 between two directives, spaces and a comment after it, an empty line
follows, in a title of a Wardley map] [test: U+2028 between two directives,
spaces and a comment after it, a line follows, in a title of a Wardley map]
[test: U+2029 between two directives, spaces and a comment after it, the text
ends, in a title of a Wardley map] [test: U+2028 between two directives, a
comment touching it, the text ends, in a title of a Wardley map] [test: U+2028
between two directives, a comment touching it, a directive line follows, in a
title of a Wardley map] [test: U+2028 after the last directive and spaces,
spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: a U+2028 inside the text, a directive, and a comment after spaces, in a
title of a Wardley map] [test: a U+2028 inside the text, a directive that a
comment touches, in a title of a Wardley map] [test: a wide space before two
directives that spaces separate, the text ends, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the
text ends, in a title of a Wardley map] [test: a wide space before two
directives that touch and a comment that touches the last, the text ends, in a
title of a Wardley map] [test: a U+2028 before two directives that touch, the
text ends, in a title of a Wardley map] [test: a U+2028 before a directive that
spaces follow, the text ends, in a title of a Wardley map] [test: a U+2028
before two directives that spaces separate, the text ends, in a title of a
Wardley map] [test: a directive that holds a line break, spaces before it, the
text ends, in a title of a Wardley map] [test: a directive that holds a U+2028,
spaces before it, the text ends, in a title of a Wardley map] [test: a U+2028
inside the text, spaces before the directive, the text ends, in a title of a
Wardley map] [test: a value of directives only, spaces after the directive, the
text ends, in a title of a Wardley map] [test: a directive inside the text,
spaces before and after the last directive, the text ends, in a title of a
Wardley map] [test: a `;` and no directive, the text ends, in a title of a
Wardley map] [test: a `;` and no directive, the text ends, in a title of a
Wardley map] [test: a `;` in the text, spaces before the directive, the text
ends, in a title of a Wardley map] [test: a `;` in the text, spaces between two
directives, the text ends, in a title of a Wardley map] [test: a `;` between two
directives, spaces around it, the text ends, in a title of a Wardley map] [test:
a `;` after the last directive, the text ends, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment
line follows, in a title of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, an empty line follows, in a title of a Wardley
map] [test: a U+2028 before a directive that spaces and a comment follow, a line
of whitespace follows, in a title of a Wardley map] [test: a U+2028 before a
directive that spaces and a comment follow, a directive line follows, in a title
of a Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty
line and a statement follow, in a title of a Wardley map] [test: a U+2028 before
a directive that spaces and a comment follow, the text ends, in a title of a
Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a comment line follows, in a title of a Wardley map] [test: a U+2028
before a directive that spaces and a comment follow, an empty line follows, in a
title of a Wardley map] [test: a U+2028 before a directive that spaces and a
comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive
line follows, in a title of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, a comment line and a statement follow, in a
title of a Wardley map] [test: a U+2028 before a directive that spaces and a
comment follow, an empty line and a statement follow, in a title of a Wardley
map] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a comment line follows, in a title of a Wardley map] [test:
a U+2028 before two directives that a wide space separates, a comment after
them, an empty line follows, in a title of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a line of
whitespace follows, in a title of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a directive line
follows, in a title of a Wardley map] [test: a U+2028 before two directives that
a wide space separates, a comment after them, a comment line and a statement
follow, in a title of a Wardley map] [test: a U+2028 before two directives that
a wide space separates, a comment after them, an empty line and a statement
follow, in a title of a Wardley map] [test: a U+2028 before two directives that
a wide space separates, a comment after them, the text ends, in a title of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment
after them, an empty line follows, in a title of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, a line
of whitespace follows, in a title of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a directive line
follows, in a title of a Wardley map] [test: a U+2028 before two directives that
a wide space separates, a comment after them, a comment line and a statement
follow, in a title of a Wardley map] [test: a U+2028 before two directives that
a wide space separates, a comment after them, an empty line and a statement
follow, in a title of a Wardley map] [test: a U+2028 before a directive that a
wide space and a comment follow, a comment line follows, in a title of a Wardley
map] [test: a U+2028 before a directive that a wide space and a comment follow,
an empty line follows, in a title of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, a line of whitespace follows,
in a title of a Wardley map] [test: a U+2028 before a directive that a wide
space and a comment follow, a directive line follows, in a title of a Wardley
map] [test: a U+2028 before a directive that a wide space and a comment follow,
a comment line and a statement follow, in a title of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, an empty line
and a statement follow, in a title of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, the text ends, in a title of a
Wardley map] [test: a U+2028 before a directive that a wide space and a comment
follow, a comment line follows, in a title of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, an empty line
follows, in a title of a Wardley map] [test: a U+2028 before a directive that a
wide space and a comment follow, a line of whitespace follows, in a title of a
Wardley map] [test: a U+2028 before a directive that a wide space and a comment
follow, a directive line follows, in a title of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, a comment line and a
statement follow, in a title of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, an empty line and a statement
follow, in a title of a Wardley map] [test: a U+2028 before a directive that
spaces and a comment follow, an indented directive line follows, in a title of a
Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a directive and spaces follow, in a title of a Wardley map] [test: a
U+2028 before a directive that spaces and a comment follow, two directives that
touch follow, in a title of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, a directive and a comment on a line follow, in
a title of a Wardley map] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a
tab follows, in a title of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, an indented comment line follows, in a title
of a Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, an indented directive line follows, in a title of a Wardley map] [test:
a U+2028 before a directive that spaces and a comment follow, a directive and
spaces follow, in a title of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, two directives that touch follow, in a title
of a Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a
no-break space follows, in a title of a Wardley map] [test: a U+2028 before a
directive that spaces and a comment follow, a line of a tab follows, in a title
of a Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, an indented comment line follows, in a title of a Wardley map] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
an indented directive line follows, in a title of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, a
directive and spaces follow, in a title of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, two directives
that touch follow, in a title of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a directive and a
comment on a line follow, in a title of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a line of a
no-break space follows, in a title of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a line of a tab
follows, in a title of a Wardley map] [test: a U+2028 before two directives that
a wide space separates, a comment after them, an indented comment line follows,
in a title of a Wardley map] [test: a U+2028 before two directives that a wide
space separates, a comment after them, an indented directive line follows, in a
title of a Wardley map] [test: a U+2028 before two directives that a wide space
separates, a comment after them, a directive and spaces follow, in a title of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, two directives that touch follow, in a title of a Wardley
map] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a directive and a comment on a line follow, in a title of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, a line of a no-break space follows, in a title of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment
after them, an indented comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an
indented directive line follows, in a title of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, a directive and
spaces follow, in a title of a Wardley map] [test: a U+2028 before a directive
that a wide space and a comment follow, two directives that touch follow, in a
title of a Wardley map] [test: a U+2028 before a directive that a wide space and
a comment follow, a directive and a comment on a line follow, in a title of a
Wardley map] [test: a U+2028 before a directive that a wide space and a comment
follow, a line of a no-break space follows, in a title of a Wardley map] [test:
a U+2028 before a directive that a wide space and a comment follow, a line of a
tab follows, in a title of a Wardley map] [test: a U+2028 before a directive
that a wide space and a comment follow, an indented comment line follows, in a
title of a Wardley map] [test: a U+2028 before a directive that a wide space and
a comment follow, an indented directive line follows, in a title of a Wardley
map] [test: a U+2028 before a directive that a wide space and a comment follow,
a directive and spaces follow, in a title of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, two directives that
touch follow, in a title of a Wardley map] [test: a U+2028 before a directive
that a wide space and a comment follow, a directive and a comment on a line
follow, in a title of a Wardley map] [test: a U+2028 before a directive that a
wide space and a comment follow, a line of a no-break space follows, in a title
of a Wardley map] [test: a U+2028 before a directive that a wide space and a
comment follow, a line of a tab follows, in a title of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, an indented
comment line follows, in a title of a Wardley map] [test: a `;` after the last
directive, a U+2028 before the directives, a comment after it, the text ends, in
a title of a Wardley map] [test: a `;` between two directives, a U+2028 before
the directives, a comment after them, the text ends, in a title of a Wardley
map] [test: a U+2028 after the last directive that spaces and a comment follow,
a comment line follows, in a title of a Wardley map] [test: a U+2028 after the
last directive that spaces and a comment follow, an empty line follows, in a
title of a Wardley map] [test: a U+2028 after the last directive that spaces and
a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a
directive line follows, in a title of a Wardley map] [test: a U+2028 after the
last directive that spaces and a comment follow, a comment line and a statement
follow, in a title of a Wardley map] [test: a U+2028 after the last directive
that spaces and a comment follow, an empty line and a statement follow, in a
title of a Wardley map] [test: a U+2028 after the last directive that spaces and
a comment follow, the text ends, in a title of a Wardley map] [test: a U+2028
after the last directive that spaces and a comment follow, a comment line
follows, in a title of a Wardley map] [test: a U+2028 after the last directive
that spaces and a comment follow, an empty line follows, in a title of a Wardley
map] [test: a U+2028 after the last directive that spaces and a comment follow,
a line of whitespace follows, in a title of a Wardley map] [test: a U+2028 after
the last directive that spaces and a comment follow, a directive line follows,
in a title of a Wardley map] [test: a U+2028 after the last directive that
spaces and a comment follow, a comment line and a statement follow, in a title
of a Wardley map] [test: a U+2028 after the last directive that spaces and a
comment follow, an empty line and a statement follow, in a title of a Wardley
map] [test: a U+2028 between two directives, spaces and a comment after the last
one, a comment line follows, in a title of a Wardley map] [test: a U+2028
between two directives, spaces and a comment after the last one, an empty line
follows, in a title of a Wardley map] [test: a U+2028 between two directives,
spaces and a comment after the last one, a line of whitespace follows, in a
title of a Wardley map] [test: a U+2028 between two directives, spaces and a
comment after the last one, a directive line follows, in a title of a Wardley
map] [test: a U+2028 between two directives, spaces and a comment after the last
one, a comment line and a statement follow, in a title of a Wardley map] [test:
a U+2028 between two directives, spaces and a comment after the last one, an
empty line and a statement follow, in a title of a Wardley map] [test: a U+2028
between two directives, spaces and a comment after the last one, the text ends,
in a title of a Wardley map] [test: a U+2028 between two directives, spaces and
a comment after the last one, a comment line follows, in a title of a Wardley
map] [test: a U+2028 between two directives, spaces and a comment after the last
one, an empty line follows, in a title of a Wardley map] [test: a U+2028 between
two directives, spaces and a comment after the last one, a line of whitespace
follows, in a title of a Wardley map] [test: a U+2028 between two directives,
spaces and a comment after the last one, a directive line follows, in a title of
a Wardley map] [test: a U+2028 between two directives, spaces and a comment
after the last one, a comment line and a statement follow, in a title of a
Wardley map] [test: a U+2028 between two directives, spaces and a comment after
the last one, an empty line and a statement follow, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive,
a U+2028 and a space stand before the text, the text ends, in a title of a
Wardley map] [test: released output that the document does not state: a `;` and
no directive, a U+2028 and a tab stand before the text, the text ends, in a
title of a Wardley map] [test: released output that the document does not state:
a `;` and no directive, a U+2029 and two spaces stand before the text, the text
ends, in a title of a Wardley map] [test: released output that the document does
not state: a `;` and no directive, a U+2028 and a no-break space stand before
the text, the text ends, in a title of a Wardley map] [test: a line of a
directive, two spaces before a comment line after a U+2028 before two
directives, the text ends, in a title of a Wardley map] [test: a line of two
spaces, a directive before a comment line after a U+2028 before two directives,
the text ends, in a title of a Wardley map] [test: a line of a tab, a directive
before a comment line after a U+2028 before two directives, the text ends, in a
title of a Wardley map] [test: a line of a directive, a tab before a comment
line after a U+2028 before two directives, the text ends, in a title of a
Wardley map] [test: a line of a no-break space, a directive before a comment
line after a U+2028 before two directives, the text ends, in a title of a
Wardley map] [test: a line of a directive, a no-break space before a comment
line after a U+2028 before two directives, the text ends, in a title of a
Wardley map] [test: a line of a directive, two spaces, a directive before a
comment line after a U+2028 before two directives, the text ends, in a title of
a Wardley map] [test: a line of a directive, U+2028 before a comment line after
a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a directive, a space, a comment before a comment line after a
U+2028 before two directives, the text ends, in a title of a Wardley map] [test:
a line of a tab before a comment line after a U+2028 before a directive, the
text ends, in a title of a Wardley map] [test: a line of a no-break space before
a comment line after a U+2028 before a directive, the text ends, in a title of a
Wardley map] [test: a line of U+3000 before a comment line after a U+2028 before
a directive, the text ends, in a title of a Wardley map] [test: a line of a
vertical tab before a comment line after a U+2028 before a directive, the text
ends, in a title of a Wardley map] [test: a line of a form feed before a comment
line after a U+2028 before a directive, the text ends, in a title of a Wardley
map] [test: a line of U+2028 before a comment line after a U+2028 before a
directive, the text ends, in a title of a Wardley map] [test: a line of U+2029
before a comment line after a U+2028 before a directive, the text ends, in a
title of a Wardley map] [test: a line of U+0085 before a comment line after a
U+2028 before a directive, the text ends, in a title of a Wardley map] [test: a
line of U+180E before a comment line after a U+2028 before a directive, the text
ends, in a title of a Wardley map] [test: U+2028 between two directives and
after the last, a comment touches it, the text ends, in a title of a Wardley
map] [test: U+2028 between two directives and after the last, a comment follows
after spaces, the text ends, in a title of a Wardley map] [test: U+2029 between
two directives and after the last, a comment follows after spaces, the text
ends, in a title of a Wardley map] [test: U+2029 between two directives and
U+2028 after the last, a comment follows after a tab, the text ends, in a title
of a Wardley map] [test: U+2028 between two directives and after the last, a
comment follows after a no-break space, the text ends, in a title of a Wardley
map] [test: U+2028 between two directives and after the last, a comment follows
after spaces, a statement follows, in a title of a Wardley map] [test: U+2028
between two directives and after the last, a comment follows after spaces, an
empty line and a statement follow, in a title of a Wardley map] [test: U+2028
between two directives and after the last, a comment follows after spaces, a
directive line and a statement follow, in a title of a Wardley map] [test:
U+2028 between two directives and after the last, a comment follows after
spaces, a comment line and a statement follow, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after
spaces, a comment line follows and the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after
spaces, a directive line follows and the text ends, in a title of a Wardley map]
[test: U+2028 between the first and the second of three directives, between the
second and the third, and after the third, a comment touches it, the text ends,
in a title of a Wardley map] [test: U+2028 before the directives, between two
directives, and after the last, a comment touches it, the text ends, in a title
of a Wardley map] [test: U+2028 between two directives of a title of directives
only and after the last, a comment follows after spaces, the text ends, in a
title of a Wardley map] [test: U+2028 after the last directive, a no-break space
and a comment after it, the text ends, in a title of a Wardley map] [test:
U+2028 between two directives, a no-break space and a comment after the last,
the text ends, in a title of a Wardley map] [test: U+2028 after the last
directive, U+3000 and a comment after it, the text ends, in a title of a Wardley
map] [test: U+2028 between two directives, U+3000 and a comment after the last,
the text ends, in a title of a Wardley map] [test: U+2028 after the last
directive, a space and a no-break space and a comment after it, the text ends,
in a title of a Wardley map] [test: U+2028 between two directives, a space and a
no-break space and a comment after the last, the text ends, in a title of a
Wardley map] [test: U+2028 after the last directive, a no-break space and a
comment after it, a statement follows, in a title of a Wardley map] [test:
U+2028 between two directives and after the last, two spaces after the first, a
comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a tab after the first,
a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a no-break space after
the first, a comment touches the last U+2028, the text ends, in a title of a
Wardley map] [test: U+2028 between two directives and after the last, U+3000
after the first, a comment touches the last U+2028, the text ends, in a title of
a Wardley map] [test: U+2028 between two directives and after the last, two
spaces before the first, a comment touches the last U+2028, the text ends, in a
title of a Wardley map] [test: U+2028 between two directives and after the last,
a tab before the first, a comment touches the last U+2028, the text ends, in a
title of a Wardley map] [test: U+2028 between two directives and after the last,
a no-break space before the first, a comment touches the last U+2028, the text
ends, in a title of a Wardley map] [test: U+2029 between two directives, two
spaces after it, and U+2028 after the last, a comment touches the last U+2028,
the text ends, in a title of a Wardley map] [test: U+2028 between two directives
of a title of directives only, two spaces after it, and U+2028 after the last, a
comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, two spaces after it, and U+2028 after the
last, a comment touches the last U+2028, a statement follows, in a title of a
Wardley map] [test: U+2028 between two directives, two spaces after it, a
comment touches the last directive, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, two spaces after it, a comment follows the
last directive after spaces, the text ends, in a title of a Wardley map] [test:
U+2028 between two directives, a no-break space before the comment, the text
ends, in a title of a Wardley map] [test: U+2028 between two directives, two
spaces after it, a comment touches the last directive, a statement follows, in a
title of a Wardley map] [test: U+2028 between the first and the second of three
directives and between the second and the third, a comment follows the third
after a space, the text ends, in a title of a Wardley map] [test: U+2028 between
the first and the second of three directives and between the second and the
third, a comment touches the third, the text ends, in a title of a Wardley map]
[test: U+2029 between the first and the second of three directives and between
the second and the third, a comment follows the third after two spaces, the text
ends, in a title of a Wardley map] [test: U+2028 between the first and the
second of three directives and between the second and the third, a comment
follows the third after a space, a statement follows, in a title of a Wardley
map] [test: U+2028 between the first and the second of three directives and
between the second and the third of a title of directives only, a comment
follows the third after a space, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment line stands
between the last U+2028 and a statement, in a title of a Wardley map] [test: a
`;` after the last directive, touching the directive, U+2028 after it, the text
ends, in a title of a Wardley map] [test: a `;` after the last directive, two
spaces after the directive, U+2028 after it, the text ends, in a title of a
Wardley map] [test: a `;` after the last directive, touching the directive,
U+2029 after it, the text ends, in a title of a Wardley map] [test: a `;` after
the last directive, two spaces after the directive, U+2029 after it, the text
ends, in a title of a Wardley map] [test: a `;` after the last directive,
touching the directive, a space and U+2028 after it, the text ends, in a title
of a Wardley map] [test: a `;` after the last directive, two spaces after the
directive, a space and U+2028 after it, the text ends, in a title of a Wardley
map] [test: a `;` after the last directive, touching the directive, U+2028 and a
space after it, the text ends, in a title of a Wardley map] [test: a `;` after
the last directive, two spaces after the directive, U+2028 and a space after it,
the text ends, in a title of a Wardley map] [test: a `;` after the last
directive, touching the directive, a no-break space and U+2028 after it, the
text ends, in a title of a Wardley map] [test: a `;` after the last directive,
two spaces after the directive, a no-break space and U+2028 after it, the text
ends, in a title of a Wardley map] [test: a `;` after the last directive,
touching the directive, U+2028 and a no-break space after it, the text ends, in
a title of a Wardley map] [test: a `;` after the last directive, two spaces
after the directive, U+2028 and a no-break space after it, the text ends, in a
title of a Wardley map] [test: a `;` after the last directive, touching the
directive, U+2028, a space, and U+2028 after it, the text ends, in a title of a
Wardley map] [test: a `;` after the last directive, two spaces after the
directive, U+2028, a space, and U+2028 after it, the text ends, in a title of a
Wardley map] [test: a `;` after the last directive, touching the directive, two
spaces and U+2028 after it, the text ends, in a title of a Wardley map] [test: a
`;` after the last directive, two spaces after the directive, two spaces and
U+2028 after it, the text ends, in a title of a Wardley map] [test: a `;` after
the last directive, touching the directive, a no-break space after it, the text
ends, in a title of a Wardley map] [test: a `;` after the last directive, two
spaces after the directive, a no-break space after it, the text ends, in a title
of a Wardley map] [test: a `;` after the last directive, touching the directive,
U+3000 after it, the text ends, in a title of a Wardley map] [test: a `;` after
the last directive, two spaces after the directive, U+3000 after it, the text
ends, in a title of a Wardley map] [test: a `;` after the last directive, U+2028
after it, a statement follows, in a title of a Wardley map] [test: a `;` after
the last directive, two spaces and U+2028 after it, a statement follows, in a
title of a Wardley map] [test: a `;` after the last directive, a no-break space
after it, a statement follows, in a title of a Wardley map] [test: a `;`, two
spaces, a `;`, and U+2028 after the last directive, the text ends, in a title of
a Wardley map] [test: a line of a directive and a `;` before a comment line
after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a `;` and a comment before a comment line after a U+2028 before
a directive, the text ends, in a title of a Wardley map] [test: a line of a
comment that holds a `;` before a comment line after a U+2028 before a
directive, the text ends, in a title of a Wardley map] [test: a line of a
directive and a comment that holds a `;` before a comment line after a U+2028
before a directive, the text ends, in a title of a Wardley map] [test: a line of
a directive that holds a `;` before a comment line after a U+2028 before a
directive, the text ends, in a title of a Wardley map] [test: a `;` before the
U+2028 between two directives, a comment follows the last directive after two
spaces, the text ends, in a title of a Wardley map] [test: a `;` before the
U+2028 between two directives, two spaces after the U+2028, a comment follows
the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 after the last directive, two
spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: a `;` after the U+2028 between two directives, a comment follows the last
directive after two spaces, the text ends, in a title of a Wardley map] [test: a
`;` before the U+2028 between two directives, two spaces after the U+2028, a
comment follows the last directive after two spaces, a statement follows, in a
title of a Wardley map] [test: two U+2028 with two spaces on each side between
two directives, a comment follows the last directive after two spaces, the text
ends, in a title of a Wardley map] [test: two U+2029 between two directives, a
comment follows the last directive after two spaces, the text ends, in a title
of a Wardley map] [test: U+2028 and U+2029 between two directives, a comment
follows the last directive after two spaces, the text ends, in a title of a
Wardley map] [test: two U+2028 after the last directive, a comment touches the
second, the text ends, in a title of a Wardley map] [test: U+2028 and U+2029
with two spaces on each side after the last directive, a comment follows the
second after two spaces, the text ends, in a title of a Wardley map] [test: two
U+2028 with two spaces on each side after a single directive, a comment follows
after two spaces, the text ends, in a title of a Wardley map] [test: a `;`
inside the comment after the last directive, two spaces before the comment, the
text ends, in a title of a Wardley map] [test: a U+2028 between the text and a
directive, a U+2028 between the directive and the comment, an empty line and a
statement follow, in a title of a Wardley map] [test: a U+2028 after the last
directive of a title of directives only, two spaces before and after it, a
comment follows, the text ends, in a title of a Wardley map] [test: two U+2028
before a directive that a comment touches, an empty line and a statement follow,
in a title of a Wardley map] [test: two U+2028 before a directive that a comment
follows after spaces, an empty line and a statement follow, in a title of a
Wardley map] [test: U+2029 and U+2028 before a directive that a comment touches,
the text ends, in a title of a Wardley map] [test: two U+2028 before a directive
that a comment touches, a comment line follows, in a title of a Wardley map]
[test: two U+2028 before a directive that a comment touches, a line of
whitespace follows, in a title of a Wardley map] [test: two U+2028 before a
directive that a comment touches, a directive line follows, in a title of a
Wardley map] [test: a comment after the last directive after two spaces, a
comment line that holds a `;` and an empty line follow, a statement follows, in
a title of a Wardley map] [test: a U+2028 before a directive that a comment
follows after two spaces, a comment line that holds a `;` follows, a statement
follows, in a title of a Wardley map] [test: a comment after the last directive
after two spaces, a directive line that holds a `;` and an empty line follow, a
statement follows, in a title of a Wardley map] [test: a directive that starts
the text, two spaces and a text after it, spaces at the end, the text ends, in a
title of a Wardley map] [test: two directives that touch and start the text, a
text after them, spaces at the end, the text ends, in a title of a Wardley map]
[test: a directive that starts the text, two spaces and a text after it, spaces
at the end, a statement follows, in a title of a Wardley map] [test: a directive
that starts the text, two spaces and a text after it, a statement whose label
holds a `;` follows, in a title of a Wardley map]

[fixture: wardley/title/title-empty]

[fixture: wardley/title/title-quotes]

[fixture: wardley/title/title-next-line]

Input (escaped): `"wardley-beta\ntitle\t  A  subject \t"`.

Output
([title/title-trim-output.mmd](../tests/fixtures/wardley/title/title-trim-output.mmd)):

```mmd
wardley-beta
  title A subject
```

### Accessibility

Use the shared accessibility line layout for accTitle: Value and accDescr:
Value, retaining empty assignments, except as the paragraphs below state, as the
[paragraph on a directive before the text](#title) states, and as the
[Semicolons](#semicolons) section states. A run of spaces and tabs inside the
value of an `accDescr` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of an `accTitle` stays as written, since the browser shows it as a
tooltip. The colon of `accTitle` and `accDescr` is the colon of a key, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the form
`accTitle: text`: no whitespace before the colon and one space after it. Where a
value has text and no directive stands before its text or inside it, and no
U+2028 or U+2029 stands inside the text, the directives that end it are printed
as follows, by what stands before them and after them, except for the undecided
lines that the [title list](#title) states. A wide space is one of U+000B,
U+000C, U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF.
Where a U+2028 or U+2029 stands before the directives and a comment follows the
last one, a line that is not undecided is printed as under item 6 of the title
list, and where item 6 of the title list splits it, none of the items below
applies to it. The colon touches the keyword, so a gap before it is printed as
no gap even where the line stays as written:

- Where only spaces and tabs, or nothing, stand before the directives, no `;`
  stands in the text before them or inside one of them, no directive holds a
  line break, a U+2028, or a U+2029, and nothing but spaces and tabs follow the
  last one, one space is printed before each directive that has spaces or tabs
  before it, and the spaces and tabs after the last one are left out, whatever
  the spaces and tabs at the end of the line.
- Where a wide space stands before the directives, they touch one another, and
  the end of the line or a comment touches the last one, the character is
  printed as one space with the rest of its run. So it does where a U+2028 or
  U+2029 stands there and the end of the line touches the last one.
- Where a wide space stands before the directives and spaces or tabs and another
  directive or a comment follow the first one, the character stays, and each run
  of spaces and tabs after it before a directive or the comment is printed as
  one space.
- Where a U+2028 or U+2029 stands before the directives, no comment follows the
  last one, and spaces or tabs follow the last one, or spaces or tabs and
  another directive follow the first one, the line stays as written.
- Where a wide space stands between two directives, the line stays as written,
  whatever follows the last one.
- Where a wide space stands after the last directive, also after spaces or tabs,
  the line stays as written, whatever follows the character. A value with a
  directive inside its text stays as written too.

Where a comment follows the last directive, no U+2028 or U+2029 stands between
the text and the comment, the line is not undecided, and neither of items 5 and
6 applies, a run of spaces and tabs before each directive and before the comment
is printed as one space (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).

Rule 1 names no mark for a gap beside a directive, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: the other diagram types of
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)
print a run of spaces and tabs before a directive as one space and leave out the
spaces at the end of the line (item 1). The other items say what the released
version prints for the gaps and the characters that the rules do not decide, and
a form that the other diagram types print differently stays as it is until it is
decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

Where a U+2028 or U+2029 stands inside the text, or the value holds directives
only, and the line is not undecided, the line stays as written if spaces or tabs
follow the last directive, whether the end of the line or a comment comes after
them, or if spaces or tabs stand between two directives, and item 3 does not
apply to it; otherwise the other items print it as they print a line of any
other text, so each run of spaces and tabs before a directive, the one after the
keyword included, is one space.

The undecided lines are not stated: the output there depends on each character
on each side of the `;` and of the U+2028 or U+2029, rule 1 names no mark for
these gaps, and the diagram types do not print them alike. The forms that the
released version prints there stay until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
A `;` inside a comment makes a line undecided, since Wardley keeps such a line
as written. The lines that make the formatter throw there are not stated.

A line of `accTitle:` or `accDescr:` that holds a `;` and no directive stays as
written through its last `;`, the gap before its colon included, where the line
holds neither `style` nor `classDef`, the last `;` stands outside a comment,
nothing but spaces and tabs follow it, and no U+2028 or U+2029 stands in the
line, and the spaces and tabs after the last `;` are left out: `accTitle : T;`
and `accDescr:   A   B;` are not changed. The other lines that hold a `;` and no
directive are not stated here: the released version prints them as it prints
them until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)),
except the lines that hold `style` or `classDef`, which the
[Semicolons](#semicolons) section states.

[fixture: accessibility/acc-directives-end-blanks-dropped] [fixture:
accessibility/acc-directives-end-tabs-dropped] [fixture:
accessibility/acc-directives-in-the-text-kept] [fixture:
accessibility/acc-directives-then-comment] [fixture:
accessibility/acctitle-directives-end-at-the-end-of-the-text] [fixture:
accessibility/accdescr-directives-end-at-the-end-of-the-text] [fixture:
accessibility/acc-directives-end-before-comment-line-and-empty-line] [fixture:
wardley/accessibility/access-lines] [fixture:
wardley/accessibility/access-empty] [fixture:
wardley/accessibility/access-colon-touching] [test: a no-break space after the
last directive of an accTitle line of a Wardley map] [test: a no-break space
before the directive that ends an accTitle line of a Wardley map] [test: a
no-break space after the last directive of an accDescr line of a Wardley map]
[test: a no-break space before the directive that ends an accDescr line of a
Wardley map] [test: U+2028 before the directive that ends an accTitle line of a
Wardley map] [test: a no-break space before a directive that a space and a
comment follow in an accDescr line of a Wardley map] [test: the gap before the
colon of an accTitle line with a no-break space after its last directive of a
Wardley map] [test: U+3000 after the last directive of an accTitle line of a
Wardley map] [test: U+2028 after the last directive of an accTitle line of a
Wardley map] [test: U+2029 after the last directive of an accTitle line of a
Wardley map] [test: U+3000 before the directive that ends an accTitle line of a
Wardley map] [test: U+2029 before the directive that ends an accTitle line of a
Wardley map] [test: U+3000 after the last directive of an accDescr line of a
Wardley map] [test: U+2028 after the last directive of an accDescr line of a
Wardley map] [test: U+2029 after the last directive of an accDescr line of a
Wardley map] [test: U+3000 before the directive that ends an accDescr line of a
Wardley map] [test: U+2028 before the directive that ends an accDescr line of a
Wardley map] [test: U+2029 before the directive that ends an accDescr line of a
Wardley map] [test: a no-break space before a directive that a space and a
comment follow in an accTitle line of a Wardley map] [test: U+2028 before the
last directive, a space and a tab after it, in an accTitle line of a Wardley
map] [test: U+2029 before the last directive, a space and a tab after it, in an
accTitle line of a Wardley map] [test: a space, a tab, and a no-break space
after the last directive of an accTitle line of a Wardley map] [test: a space, a
tab, and U+3000 after the last directive of an accTitle line of a Wardley map]
[test: the gap before the colon of an accTitle line with U+3000 after its last
directive of a Wardley map] [test: a space, a tab, and U+2028 after the last
directive of an accTitle line of a Wardley map] [test: the gap before the colon
of an accTitle line with U+2028 after its last directive of a Wardley map]
[test: a space, a tab, and U+2029 after the last directive of an accTitle line
of a Wardley map] [test: the gap before the colon of an accTitle line with
U+2029 after its last directive of a Wardley map] [test: a semicolon before the
directive of an accTitle line of a Wardley map, spaces after it] [test: a
semicolon and spaces before the directive that ends an accTitle line of a
Wardley map] [test: a semicolon after the last directive of an accTitle line of
a Wardley map, spaces around it] [test: U+2028 before the last directive, a
space and a tab after it, in an accDescr line of a Wardley map] [test: U+2029
before the last directive, a space and a tab after it, in an accDescr line of a
Wardley map] [test: a space, a tab, and a no-break space after the last
directive of an accDescr line of a Wardley map] [test: the gap before the colon
of an accDescr line with a no-break space after its last directive of a Wardley
map] [test: a space, a tab, and U+3000 after the last directive of an accDescr
line of a Wardley map] [test: the gap before the colon of an accDescr line with
U+3000 after its last directive of a Wardley map] [test: a space, a tab, and
U+2028 after the last directive of an accDescr line of a Wardley map] [test: the
gap before the colon of an accDescr line with U+2028 after its last directive of
a Wardley map] [test: a space, a tab, and U+2029 after the last directive of an
accDescr line of a Wardley map] [test: the gap before the colon of an accDescr
line with U+2029 after its last directive of a Wardley map] [test: a semicolon
before the directive of an accDescr line of a Wardley map, spaces after it]
[test: a semicolon and spaces before the directive that ends an accDescr line of
a Wardley map] [test: a semicolon after the last directive of an accDescr line
of a Wardley map, spaces around it] [test: a semicolon before the directive of
an accTitle line of a Wardley map, a space and a comment after it] [test: a
semicolon and spaces before a directive that a comment touches in an accTitle
line of a Wardley map] [test: a comment that ends with a semicolon after the
last directive of an accTitle line of a Wardley map] [test: a comment that has a
space before its semicolon after the last directive of an accTitle line of a
Wardley map] [test: a comment that starts with a semicolon after the last
directive of an accTitle line of a Wardley map] [test: a semicolon before the
directive of an accDescr line of a Wardley map, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in an
accDescr line of a Wardley map] [test: a comment that ends with a semicolon
after the last directive of an accDescr line of a Wardley map] [test: a comment
that has a space before its semicolon after the last directive of an accDescr
line of a Wardley map] [test: a comment that starts with a semicolon after the
last directive of an accDescr line of a Wardley map] [test: U+3000 before a
directive that a space and a comment follow in an accTitle line of a Wardley
map] [test: the gap before the colon of an accTitle line with U+2028 before the
last directive, a space and a tab after it of a Wardley map] [test: the gap
before the colon of an accTitle line with U+2029 before the last directive, a
space and a tab after it of a Wardley map] [test: the gap before the colon of an
accTitle line with a semicolon before the directive, spaces after it of a
Wardley map] [test: the gap before the colon of an accTitle line with a
semicolon and spaces before the directive that ends it of a Wardley map] [test:
the gap before the colon of an accTitle line with a semicolon after the last
directive of a Wardley map] [test: the gap before the colon of an accTitle line
with a space, a tab, and a no-break space after the last directive of a Wardley
map] [test: the gap before the colon of an accTitle line with a space, a tab,
and U+3000 after the last directive of a Wardley map] [test: the gap before the
colon of an accTitle line with a space, a tab, and U+2028 after the last
directive of a Wardley map] [test: the gap before the colon of an accTitle line
with a space, a tab, and U+2029 after the last directive of a Wardley map]
[test: a semicolon that the line rule ignores before the directive of an
accTitle line of a Wardley map, spaces after it] [test: U+3000 before a
directive that a space and a comment follow in an accDescr line of a Wardley
map] [test: the gap before the colon of an accDescr line with U+2028 before the
last directive, a space and a tab after it of a Wardley map] [test: the gap
before the colon of an accDescr line with U+2029 before the last directive, a
space and a tab after it of a Wardley map] [test: the gap before the colon of an
accDescr line with a semicolon before the directive, spaces after it of a
Wardley map] [test: the gap before the colon of an accDescr line with a
semicolon and spaces before the directive that ends it of a Wardley map] [test:
the gap before the colon of an accDescr line with a semicolon after the last
directive of a Wardley map] [test: the gap before the colon of an accDescr line
with a space, a tab, and a no-break space after the last directive of a Wardley
map] [test: the gap before the colon of an accDescr line with a space, a tab,
and U+3000 after the last directive of a Wardley map] [test: the gap before the
colon of an accDescr line with a space, a tab, and U+2028 after the last
directive of a Wardley map] [test: the gap before the colon of an accDescr line
with a space, a tab, and U+2029 after the last directive of a Wardley map]
[test: a semicolon that the line rule ignores before the directive of an
accDescr line of a Wardley map, spaces after it] [test: a semicolon that the
line rule ignores and spaces before the directive that ends an accTitle line of
a Wardley map] [test: a semicolon that the line rule ignores and spaces before
the directive that ends an accDescr line of a Wardley map] [test: the gap before
the colon of an accTitle line that holds only `a;` of a Wardley map] [test: the
gap before the colon of an accDescr line that holds only `a;` of a Wardley map]
[test: the gap before the colon of an accTitle line that holds only `style:#x;`
of a Wardley map] [test: the gap before the colon of an accTitle line with a
semicolon inside the directive, spaces after it, of a Wardley map] [test: the
gap before the colon of an accDescr line with a semicolon inside the directive
that ends it, of a Wardley map] [test: a semicolon inside the directive of an
accDescr line, spaces and a comment after it, of a Wardley map] [test: a
semicolon inside the directive that ends an accTitle line, spaces before it, of
a Wardley map] [test: a second semicolon touching the semicolon that the line
rule ignores, a tab and a directive after them, in an accTitle line of a Wardley
map] [test: spaces and a second semicolon after the semicolon that the line rule
ignores, a directive after them, in an accTitle line of a Wardley map] [test: a
second semicolon touching the semicolon that the line rule ignores, spaces and a
directive after them, in an accDescr line of a Wardley map] [test: U+2029 and a
directive after the semicolon that the line rule ignores, in an accTitle line of
a Wardley map] [test: U+2028 and a directive after the semicolon that the line
rule ignores, in an accDescr line of a Wardley map] [test: a no-break space and
a directive after the semicolon that the line rule ignores, in an accDescr line
of a Wardley map] [test: a tab before the text of a title that ends with a
semicolon, of a Wardley map] [test: spaces before the text of an accTitle line
that ends with a semicolon, of a Wardley map] [test: no gap before the text of
an accTitle line that ends with a semicolon, of a Wardley map] [test: a tab
before the text of an accDescr line that ends with a semicolon, of a Wardley
map] [test: the gap before the colon of an accTitle line that ends with a
semicolon, of a Wardley map] [test: the gap before the colon of an accDescr line
with a semicolon inside the last of two directives, of a Wardley map] [test:
U+000B before the directive that ends an accTitle line of a Wardley map] [test:
U+000B before a directive that a space and a comment follow in an accDescr line
of a Wardley map] [test: U+000B after the last directive of an accTitle line of
a Wardley map] [test: U+000B after the last directive and spaces of an accDescr
line, spaces after it, of a Wardley map] [test: U+000C before the directive that
ends an accTitle line of a Wardley map] [test: U+000C before a directive that a
space and a comment follow in an accDescr line of a Wardley map] [test: U+000C
after the last directive of an accTitle line of a Wardley map] [test: U+000C
after the last directive and spaces of an accDescr line, spaces after it, of a
Wardley map] [test: a no-break space after the last directive and spaces of an
accDescr line, spaces after it, of a Wardley map] [test: U+1680 before the
directive that ends an accTitle line of a Wardley map] [test: U+1680 before a
directive that a space and a comment follow in an accDescr line of a Wardley
map] [test: U+1680 after the last directive of an accTitle line of a Wardley
map] [test: U+1680 after the last directive and spaces of an accDescr line,
spaces after it, of a Wardley map] [test: U+2000 before the directive that ends
an accTitle line of a Wardley map] [test: U+2000 before a directive that a space
and a comment follow in an accDescr line of a Wardley map] [test: U+2000 after
the last directive of an accTitle line of a Wardley map] [test: U+2000 after the
last directive and spaces of an accDescr line, spaces after it, of a Wardley
map] [test: U+2001 before the directive that ends an accTitle line of a Wardley
map] [test: U+2001 before a directive that a space and a comment follow in an
accDescr line of a Wardley map] [test: U+2001 after the last directive of an
accTitle line of a Wardley map] [test: U+2001 after the last directive and
spaces of an accDescr line, spaces after it, of a Wardley map] [test: U+2002
before the directive that ends an accTitle line of a Wardley map] [test: U+2002
before a directive that a space and a comment follow in an accDescr line of a
Wardley map] [test: U+2002 after the last directive of an accTitle line of a
Wardley map] [test: U+2002 after the last directive and spaces of an accDescr
line, spaces after it, of a Wardley map] [test: U+2003 before the directive that
ends an accTitle line of a Wardley map] [test: U+2003 before a directive that a
space and a comment follow in an accDescr line of a Wardley map] [test: U+2003
after the last directive of an accTitle line of a Wardley map] [test: U+2003
after the last directive and spaces of an accDescr line, spaces after it, of a
Wardley map] [test: U+2004 before the directive that ends an accTitle line of a
Wardley map] [test: U+2004 before a directive that a space and a comment follow
in an accDescr line of a Wardley map] [test: U+2004 after the last directive of
an accTitle line of a Wardley map] [test: U+2004 after the last directive and
spaces of an accDescr line, spaces after it, of a Wardley map] [test: U+2005
before the directive that ends an accTitle line of a Wardley map] [test: U+2005
before a directive that a space and a comment follow in an accDescr line of a
Wardley map] [test: U+2005 after the last directive of an accTitle line of a
Wardley map] [test: U+2005 after the last directive and spaces of an accDescr
line, spaces after it, of a Wardley map] [test: U+2006 before the directive that
ends an accTitle line of a Wardley map] [test: U+2006 before a directive that a
space and a comment follow in an accDescr line of a Wardley map] [test: U+2006
after the last directive of an accTitle line of a Wardley map] [test: U+2006
after the last directive and spaces of an accDescr line, spaces after it, of a
Wardley map] [test: U+2007 before the directive that ends an accTitle line of a
Wardley map] [test: U+2007 before a directive that a space and a comment follow
in an accDescr line of a Wardley map] [test: U+2007 after the last directive of
an accTitle line of a Wardley map] [test: U+2007 after the last directive and
spaces of an accDescr line, spaces after it, of a Wardley map] [test: U+2008
before the directive that ends an accTitle line of a Wardley map] [test: U+2008
before a directive that a space and a comment follow in an accDescr line of a
Wardley map] [test: U+2008 after the last directive of an accTitle line of a
Wardley map] [test: U+2008 after the last directive and spaces of an accDescr
line, spaces after it, of a Wardley map] [test: U+2009 before the directive that
ends an accTitle line of a Wardley map] [test: U+2009 before a directive that a
space and a comment follow in an accDescr line of a Wardley map] [test: U+2009
after the last directive of an accTitle line of a Wardley map] [test: U+2009
after the last directive and spaces of an accDescr line, spaces after it, of a
Wardley map] [test: U+200A before the directive that ends an accTitle line of a
Wardley map] [test: U+200A before a directive that a space and a comment follow
in an accDescr line of a Wardley map] [test: U+200A after the last directive of
an accTitle line of a Wardley map] [test: U+200A after the last directive and
spaces of an accDescr line, spaces after it, of a Wardley map] [test: U+202F
before the directive that ends an accTitle line of a Wardley map] [test: U+202F
before a directive that a space and a comment follow in an accDescr line of a
Wardley map] [test: U+202F after the last directive of an accTitle line of a
Wardley map] [test: U+202F after the last directive and spaces of an accDescr
line, spaces after it, of a Wardley map] [test: U+205F before the directive that
ends an accTitle line of a Wardley map] [test: U+205F before a directive that a
space and a comment follow in an accDescr line of a Wardley map] [test: U+205F
after the last directive of an accTitle line of a Wardley map] [test: U+205F
after the last directive and spaces of an accDescr line, spaces after it, of a
Wardley map] [test: U+3000 after the last directive and spaces of an accDescr
line, spaces after it, of a Wardley map] [test: U+FEFF before the directive that
ends an accTitle line of a Wardley map] [test: U+FEFF before a directive that a
space and a comment follow in an accDescr line of a Wardley map] [test: U+FEFF
after the last directive of an accTitle line of a Wardley map] [test: U+FEFF
after the last directive and spaces of an accDescr line, spaces after it, of a
Wardley map] [test: a no-break space after the last directive of an accTitle
line, a comment touching it, of a Wardley map] [test: a no-break space after the
last directive of an accDescr line, spaces and a comment after it, of a Wardley
map] [test: U+2003 after the last directive of an accTitle line, a comment
touching it, of a Wardley map] [test: U+2003 after the last directive of an
accDescr line, spaces and a comment after it, of a Wardley map] [test: a
semicolon in the text, two directives with spaces between them, an accTitle
line, of a Wardley map] [test: a semicolon in the text, two directives that
touch, spaces before them, an accTitle line, of a Wardley map] [test: a
semicolon inside the first of two directives, a space between them, an accDescr
line, of a Wardley map] [test: a semicolon inside the last of two directives,
spaces after it, an accDescr line, of a Wardley map] [test: a semicolon inside
the last of two directives that end an accTitle line, spaces before both, of a
Wardley map] [test: a semicolon that touches two directives in an accTitle line,
of a Wardley map] [test: a semicolon after the last of two directives in an
accDescr line, spaces around it and a comment after it, of a Wardley map] [test:
a semicolon in the text, a no-break space after the last directive, an accTitle
line, of a Wardley map] [test: a semicolon inside the directive, a no-break
space after it, an accDescr line, of a Wardley map] [test: U+000B before two
directives that touch and end an accTitle line of a Wardley map] [test: U+000C
before two directives that touch and end an accTitle line of a Wardley map]
[test: a no-break space before two directives that touch and end an accTitle
line of a Wardley map] [test: U+1680 before two directives that touch and end an
accTitle line of a Wardley map] [test: U+2000 before two directives that touch
and end an accTitle line of a Wardley map] [test: U+2001 before two directives
that touch and end an accTitle line of a Wardley map] [test: U+2002 before two
directives that touch and end an accTitle line of a Wardley map] [test: U+2003
before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2004 before two directives that touch and end an accTitle line of a
Wardley map] [test: U+2005 before two directives that touch and end an accTitle
line of a Wardley map] [test: U+2006 before two directives that touch and end an
accTitle line of a Wardley map] [test: U+2007 before two directives that touch
and end an accTitle line of a Wardley map] [test: U+2008 before two directives
that touch and end an accTitle line of a Wardley map] [test: U+2009 before two
directives that touch and end an accTitle line of a Wardley map] [test: U+200A
before two directives that touch and end an accTitle line of a Wardley map]
[test: U+202F before two directives that touch and end an accTitle line of a
Wardley map] [test: U+205F before two directives that touch and end an accTitle
line of a Wardley map] [test: U+3000 before two directives that touch and end an
accTitle line of a Wardley map] [test: U+FEFF before two directives that touch
and end an accTitle line of a Wardley map] [test: U+2028 before two directives
that touch and end an accTitle line of a Wardley map] [test: U+2029 before two
directives that touch and end an accTitle line of a Wardley map] [test: U+000B
before the first of two directives that a space separates, in an accTitle line
of a Wardley map] [test: U+000B before the first of two directives that spaces
separate, in an accTitle line of a Wardley map] [test: U+000C before the first
of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+000C before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: a no-break space before the first of two
directives that a space separates, in an accTitle line of a Wardley map] [test:
a no-break space before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+1680 before the first of two directives
that a space separates, in an accTitle line of a Wardley map] [test: U+1680
before the first of two directives that spaces separate, in an accTitle line of
a Wardley map] [test: U+2000 before the first of two directives that a space
separates, in an accTitle line of a Wardley map] [test: U+2000 before the first
of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2001 before the first of two directives that a space separates, in an
accTitle line of a Wardley map] [test: U+2001 before the first of two directives
that spaces separate, in an accTitle line of a Wardley map] [test: U+2002 before
the first of two directives that a space separates, in an accTitle line of a
Wardley map] [test: U+2002 before the first of two directives that spaces
separate, in an accTitle line of a Wardley map] [test: U+2003 before the first
of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2003 before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2004 before the first of two directives
that a space separates, in an accTitle line of a Wardley map] [test: U+2004
before the first of two directives that spaces separate, in an accTitle line of
a Wardley map] [test: U+2005 before the first of two directives that a space
separates, in an accTitle line of a Wardley map] [test: U+2005 before the first
of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2006 before the first of two directives that a space separates, in an
accTitle line of a Wardley map] [test: U+2006 before the first of two directives
that spaces separate, in an accTitle line of a Wardley map] [test: U+2007 before
the first of two directives that a space separates, in an accTitle line of a
Wardley map] [test: U+2007 before the first of two directives that spaces
separate, in an accTitle line of a Wardley map] [test: U+2008 before the first
of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2008 before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2009 before the first of two directives
that a space separates, in an accTitle line of a Wardley map] [test: U+2009
before the first of two directives that spaces separate, in an accTitle line of
a Wardley map] [test: U+200A before the first of two directives that a space
separates, in an accTitle line of a Wardley map] [test: U+200A before the first
of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+202F before the first of two directives that a space separates, in an
accTitle line of a Wardley map] [test: U+202F before the first of two directives
that spaces separate, in an accTitle line of a Wardley map] [test: U+205F before
the first of two directives that a space separates, in an accTitle line of a
Wardley map] [test: U+205F before the first of two directives that spaces
separate, in an accTitle line of a Wardley map] [test: U+3000 before the first
of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+3000 before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+FEFF before the first of two directives
that a space separates, in an accTitle line of a Wardley map] [test: U+FEFF
before the first of two directives that spaces separate, in an accTitle line of
a Wardley map] [test: U+2028 before the first of two directives that a space
separates, in an accTitle line of a Wardley map] [test: U+2028 before the first
of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2029 before the first of two directives that a space separates, in an
accTitle line of a Wardley map] [test: U+2029 before the first of two directives
that spaces separate, in an accTitle line of a Wardley map] [test: U+000B
between two directives that end an accTitle line of a Wardley map] [test: U+000B
between two directives, spaces after the last, in an accDescr line of a Wardley
map] [test: U+000C between two directives that end an accTitle line of a Wardley
map] [test: U+000C between two directives, spaces after the last, in an accDescr
line of a Wardley map] [test: a no-break space between two directives that end
an accTitle line of a Wardley map] [test: a no-break space between two
directives, spaces after the last, in an accDescr line of a Wardley map] [test:
U+1680 between two directives that end an accTitle line of a Wardley map] [test:
U+1680 between two directives, spaces after the last, in an accDescr line of a
Wardley map] [test: U+2000 between two directives that end an accTitle line of a
Wardley map] [test: U+2000 between two directives, spaces after the last, in an
accDescr line of a Wardley map] [test: U+2001 between two directives that end an
accTitle line of a Wardley map] [test: U+2001 between two directives, spaces
after the last, in an accDescr line of a Wardley map] [test: U+2002 between two
directives that end an accTitle line of a Wardley map] [test: U+2002 between two
directives, spaces after the last, in an accDescr line of a Wardley map] [test:
U+2003 between two directives that end an accTitle line of a Wardley map] [test:
U+2003 between two directives, spaces after the last, in an accDescr line of a
Wardley map] [test: U+2004 between two directives that end an accTitle line of a
Wardley map] [test: U+2004 between two directives, spaces after the last, in an
accDescr line of a Wardley map] [test: U+2005 between two directives that end an
accTitle line of a Wardley map] [test: U+2005 between two directives, spaces
after the last, in an accDescr line of a Wardley map] [test: U+2006 between two
directives that end an accTitle line of a Wardley map] [test: U+2006 between two
directives, spaces after the last, in an accDescr line of a Wardley map] [test:
U+2007 between two directives that end an accTitle line of a Wardley map] [test:
U+2007 between two directives, spaces after the last, in an accDescr line of a
Wardley map] [test: U+2008 between two directives that end an accTitle line of a
Wardley map] [test: U+2008 between two directives, spaces after the last, in an
accDescr line of a Wardley map] [test: U+2009 between two directives that end an
accTitle line of a Wardley map] [test: U+2009 between two directives, spaces
after the last, in an accDescr line of a Wardley map] [test: U+200A between two
directives that end an accTitle line of a Wardley map] [test: U+200A between two
directives, spaces after the last, in an accDescr line of a Wardley map] [test:
U+202F between two directives that end an accTitle line of a Wardley map] [test:
U+202F between two directives, spaces after the last, in an accDescr line of a
Wardley map] [test: U+205F between two directives that end an accTitle line of a
Wardley map] [test: U+205F between two directives, spaces after the last, in an
accDescr line of a Wardley map] [test: U+3000 between two directives that end an
accTitle line of a Wardley map] [test: U+3000 between two directives, spaces
after the last, in an accDescr line of a Wardley map] [test: U+FEFF between two
directives that end an accTitle line of a Wardley map] [test: U+FEFF between two
directives, spaces after the last, in an accDescr line of a Wardley map] [test:
U+2028 between two directives that end an accTitle line of a Wardley map] [test:
U+2028 between two directives, spaces after the last, in an accDescr line of a
Wardley map] [test: U+2029 between two directives that end an accTitle line of a
Wardley map] [test: U+2029 between two directives, spaces after the last, in an
accDescr line of a Wardley map] [test: a no-break space between two directives,
a comment touching the last, in an accTitle line of a Wardley map] [test: a
no-break space between two directives, a space and a comment after the last, in
an accTitle line of a Wardley map] [test: a no-break space between two
directives, spaces and a comment after the last, in an accTitle line of a
Wardley map] [test: U+2003 between two directives, a comment touching the last,
in an accTitle line of a Wardley map] [test: U+2003 between two directives, a
space and a comment after the last, in an accTitle line of a Wardley map] [test:
U+2003 between two directives, spaces and a comment after the last, in an
accTitle line of a Wardley map] [test: a run before the directive after a U+2028
inside the text of an accTitle line of a Wardley map] [test: spaces after the
directive after a U+2028 inside the text of an accTitle line of a Wardley map]
[test: spaces after the last semicolon of an accTitle line, no directive, of a
Wardley map] [test: a tab after the last semicolon of an accDescr line, no
directive, of a Wardley map] [test: spaces after the semicolon that the line
rule ignores, no directive, in an accTitle line of a Wardley map] [test:
released output that the document does not state: a semicolon inside a comment
after the text of an accTitle line, no directive, of a Wardley map] [test:
released output that the document does not state: a semicolon inside a comment
after the text of an accDescr line, no directive, of a Wardley map] [test:
U+000B before a directive that a comment touches in an accTitle line of a
Wardley map] [test: U+000C before a directive that a comment touches in an
accTitle line of a Wardley map] [test: a no-break space before a directive that
a comment touches in an accTitle line of a Wardley map] [test: U+1680 before a
directive that a comment touches in an accTitle line of a Wardley map] [test:
U+2000 before a directive that a comment touches in an accTitle line of a
Wardley map] [test: U+2001 before a directive that a comment touches in an
accTitle line of a Wardley map] [test: U+2002 before a directive that a comment
touches in an accTitle line of a Wardley map] [test: U+2003 before a directive
that a comment touches in an accTitle line of a Wardley map] [test: U+2004
before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2005 before a directive that a comment touches in an accTitle line of a
Wardley map] [test: U+2006 before a directive that a comment touches in an
accTitle line of a Wardley map] [test: U+2007 before a directive that a comment
touches in an accTitle line of a Wardley map] [test: U+2008 before a directive
that a comment touches in an accTitle line of a Wardley map] [test: U+2009
before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+200A before a directive that a comment touches in an accTitle line of a
Wardley map] [test: U+202F before a directive that a comment touches in an
accTitle line of a Wardley map] [test: U+205F before a directive that a comment
touches in an accTitle line of a Wardley map] [test: U+3000 before a directive
that a comment touches in an accTitle line of a Wardley map] [test: U+FEFF
before a directive that a comment touches in an accTitle line of a Wardley map]
[test: a no-break space and spaces before a directive that a comment touches in
an accTitle line of a Wardley map] [test: a no-break space and a tab before the
directive that ends an accTitle line of a Wardley map] [test: U+000B and spaces
before the first of two directives that spaces separate, in an accTitle line of
a Wardley map] [test: U+000C and spaces before the first of two directives that
spaces separate, in an accTitle line of a Wardley map] [test: a no-break space
and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+1680 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+2000 and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2001 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+2002 and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2003 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+2004 and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2005 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+2006 and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2007 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+2008 and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+2009 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+200A and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+202F and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+205F and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: U+3000 and spaces before the first of two
directives that spaces separate, in an accTitle line of a Wardley map] [test:
U+FEFF and spaces before the first of two directives that spaces separate, in an
accTitle line of a Wardley map] [test: a no-break space and a tab before the
first of two directives that a space separates, in an accTitle line of a Wardley
map] [test: a no-break space before the first of two directives that a tab
separates, in an accTitle line of a Wardley map] [test: U+2003 and a tab before
the first of two directives that a space separates, in an accTitle line of a
Wardley map] [test: U+2003 before the first of two directives that a tab
separates, in an accTitle line of a Wardley map] [test: U+2028 before the first
of two directives that a tab separates, in an accTitle line of a Wardley map]
[test: U+2029 before the first of two directives that a tab separates, in an
accTitle line of a Wardley map] [test: a U+2028 inside the directive that ends
an accTitle line, spaces before it, of a Wardley map] [test: a U+2028 inside the
directive that ends an accTitle line, spaces after it, of a Wardley map] [test:
a U+2029 inside the directive that ends an accTitle line, spaces before it, of a
Wardley map] [test: a U+2029 inside the directive that ends an accTitle line,
spaces after it, of a Wardley map] [test: a line break inside the directive that
ends an accTitle line, spaces before it, of a Wardley map] [test: a line break
inside the directive that ends an accTitle line, spaces after it, of a Wardley
map] [test: a U+2028 inside the directive that ends an accDescr line, spaces
before it, of a Wardley map] [test: a U+2028 inside the directive that ends an
accDescr line, spaces after it, of a Wardley map] [test: a U+2029 inside the
directive that ends an accDescr line, spaces before it, of a Wardley map] [test:
a U+2029 inside the directive that ends an accDescr line, spaces after it, of a
Wardley map] [test: a line break inside the directive that ends an accDescr
line, spaces before it, of a Wardley map] [test: a line break inside the
directive that ends an accDescr line, spaces after it, of a Wardley map] [test:
U+000B between the colon and the directive of an accTitle line of directives
only of a Wardley map] [test: U+000C between the colon and the directive of an
accTitle line of directives only of a Wardley map] [test: a no-break space
between the colon and the directive of an accTitle line of directives only of a
Wardley map] [test: U+1680 between the colon and the directive of an accTitle
line of directives only of a Wardley map] [test: U+2000 between the colon and
the directive of an accTitle line of directives only of a Wardley map] [test:
U+2001 between the colon and the directive of an accTitle line of directives
only of a Wardley map] [test: U+2002 between the colon and the directive of an
accTitle line of directives only of a Wardley map] [test: U+2003 between the
colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2004 between the colon and the directive of an accTitle line of
directives only of a Wardley map] [test: U+2005 between the colon and the
directive of an accTitle line of directives only of a Wardley map] [test: U+2006
between the colon and the directive of an accTitle line of directives only of a
Wardley map] [test: U+2007 between the colon and the directive of an accTitle
line of directives only of a Wardley map] [test: U+2008 between the colon and
the directive of an accTitle line of directives only of a Wardley map] [test:
U+2009 between the colon and the directive of an accTitle line of directives
only of a Wardley map] [test: U+200A between the colon and the directive of an
accTitle line of directives only of a Wardley map] [test: U+202F between the
colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+205F between the colon and the directive of an accTitle line of
directives only of a Wardley map] [test: U+3000 between the colon and the
directive of an accTitle line of directives only of a Wardley map] [test: U+FEFF
between the colon and the directive of an accTitle line of directives only of a
Wardley map] [test: a directive that touches the keyword of a title of
directives only of a Wardley map] [test: the gap before the colon of an accDescr
line of directives only of a Wardley map] [test: spaces after the directive of
an accDescr line of directives only of a Wardley map] [test: spaces between two
directives after a U+2028 inside the text of an accTitle line of a Wardley map]
[test: spaces after the directive after a U+2029 inside the text of an accTitle
line of a Wardley map] [test: a run before the directive after a U+2029 inside
the text of an accTitle line of a Wardley map] [test: a run before two
directives that touch after a U+2028 inside the text of an accTitle line of a
Wardley map] [test: spaces between two directives after a U+2028 inside the text
of an accDescr line of a Wardley map] [test: spaces after the directive after a
U+2029 inside the text of an accDescr line of a Wardley map] [test: a run before
the directive after a U+2029 inside the text of an accDescr line of a Wardley
map] [test: a run before two directives that touch after a U+2028 inside the
text of an accDescr line of a Wardley map] [test: released output that the
document does not state: U+000B after the last semicolon of an accTitle line, no
directive, of a Wardley map] [test: released output that the document does not
state: U+000C after the last semicolon of an accTitle line, no directive, of a
Wardley map] [test: released output that the document does not state: a no-break
space after the last semicolon of an accTitle line, no directive, of a Wardley
map] [test: released output that the document does not state: U+1680 after the
last semicolon of an accTitle line, no directive, of a Wardley map] [test:
released output that the document does not state: U+2000 after the last
semicolon of an accTitle line, no directive, of a Wardley map] [test: released
output that the document does not state: U+2001 after the last semicolon of an
accTitle line, no directive, of a Wardley map] [test: released output that the
document does not state: U+2002 after the last semicolon of an accTitle line, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2003 after the last semicolon of an accTitle line, no directive, of a
Wardley map] [test: released output that the document does not state: U+2004
after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2005 after the last
semicolon of an accTitle line, no directive, of a Wardley map] [test: released
output that the document does not state: U+2006 after the last semicolon of an
accTitle line, no directive, of a Wardley map] [test: released output that the
document does not state: U+2007 after the last semicolon of an accTitle line, no
directive, of a Wardley map] [test: released output that the document does not
state: U+2008 after the last semicolon of an accTitle line, no directive, of a
Wardley map] [test: released output that the document does not state: U+2009
after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+200A after the last
semicolon of an accTitle line, no directive, of a Wardley map] [test: released
output that the document does not state: U+202F after the last semicolon of an
accTitle line, no directive, of a Wardley map] [test: released output that the
document does not state: U+205F after the last semicolon of an accTitle line, no
directive, of a Wardley map] [test: released output that the document does not
state: U+3000 after the last semicolon of an accTitle line, no directive, of a
Wardley map] [test: released output that the document does not state: U+FEFF
after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2028 after the last
semicolon of an accTitle line, no directive, of a Wardley map] [test: released
output that the document does not state: U+2029 after the last semicolon of an
accTitle line, no directive, of a Wardley map] [test: released output that the
document does not state: spaces between the last semicolon of an accDescr line
and a comment, no directive, of a Wardley map] [test: a wide space before two
directives that spaces separate, in an accDescr line of a Wardley map] [test: a
wide space before two directives that touch and a comment that touches the last,
in an accTitle line of a Wardley map] [test: a wide space before two directives
that touch and a comment that touches the last, in an accDescr line of a Wardley
map] [test: a U+2028 before two directives that touch, in an accDescr line of a
Wardley map] [test: a U+2028 before a directive that spaces follow, in an
accTitle line of a Wardley map] [test: a U+2028 before a directive that spaces
follow, in an accDescr line of a Wardley map] [test: a U+2028 before two
directives that spaces separate, in an accDescr line of a Wardley map] [test: a
U+2028 inside the text, spaces before the directive, in an accDescr line of a
Wardley map] [test: a value of directives only, spaces after the directive, in
an accTitle line of a Wardley map] [test: a directive inside the text, spaces
before and after the last directive, in an accTitle line of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive,
in an accDescr line of a Wardley map] [test: a `;` and no directive, in an
accTitle line of a Wardley map] [test: a `;` and no directive, in an accDescr
line of a Wardley map] [test: a `;` and no directive, the gap before the colon
of accTitle is a space, in an accTitle line of a Wardley map] [test: a `;` and
no directive, the gap before the colon of accTitle is a tab, in an accTitle line
of a Wardley map] [test: a `;` and no directive, the gap before the colon of
accDescr is a space, in an accDescr line of a Wardley map] [test: a `;` and no
directive, the gap before the colon of accDescr is a tab, in an accDescr line of
a Wardley map] [test: a `;` in the text, spaces between two directives, in an
accDescr line of a Wardley map] [test: a `;` between two directives, spaces
around it, in an accTitle line of a Wardley map] [test: a `;` between two
directives, spaces around it, in an accDescr line of a Wardley map] [test: a `;`
after the last directive, in an accTitle line of a Wardley map] [test: a `;`
after the last directive, in an accDescr line of a Wardley map] [test: released
output that the document does not state: a `;` and no directive, the gap before
the colon of accTitle is a space, a U+2028 stands before the text, in an
accTitle line of a Wardley map] [test: released output that the document does
not state: a `;` and no directive, a U+2028 stands before the text of accTitle,
in an accTitle line of a Wardley map] [test: released output that the document
does not state: a `;` and no directive, the gap before the colon of accDescr is
a space, a U+2028 stands before the text, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive,
a U+2028 stands before the text of accDescr, in an accDescr line of a Wardley
map] [test: a `;` after the last directive, a U+2028 before the directives, a
comment after it, in an accTitle line of a Wardley map] [test: a `;` after the
last directive, a U+2028 before the directives, a comment after it, in an
accDescr line of a Wardley map] [test: a `;` between two directives, a U+2028
before the directives, a comment after them, in an accTitle line of a Wardley
map] [test: a `;` between two directives, a U+2028 before the directives, a
comment after them, in an accDescr line of a Wardley map] [test: released output
that the document does not state: a `;` and no directive, a U+2028 and a space
stand before the text of accTitle, the gap before the colon is a space, in an
accTitle line of a Wardley map] [test: released output that the document does
not state: a `;` and no directive, a U+2029 and two spaces stand before the text
of accTitle, in an accTitle line of a Wardley map] [test: released output that
the document does not state: a `;` and no directive, a U+2028 and a space stand
before the text of accDescr, the gap before the colon is a space, in an accDescr
line of a Wardley map] [test: released output that the document does not state:
a `;` and no directive, a U+2029 and two spaces stand before the text of
accDescr, in an accDescr line of a Wardley map] [test: two U+2028 before the
directive that ends an accTitle line, of a Wardley map] [test: U+2029 and U+2028
before the directive that ends an accDescr line, of a Wardley map] [test: two
U+2028 before the directive that ends an accTitle line, spaces after it, of a
Wardley map] [test: two U+2029 before a directive that a space and another
directive follow in an accDescr line, of a Wardley map] [test: a U+2028 inside
the directive that ends an accDescr line, spaces before it, a comment after two
spaces, of a Wardley map] [test: a line break inside the directive that ends an
accTitle line, a comment after two spaces, of a Wardley map] [test: a directive
that starts the text of a title, tabs before and after it, of a Wardley map]
[test: a directive that touches the keyword of a title, a space and a text after
it, of a Wardley map] [test: a directive that touches the colon of an accTitle
line, a space and a text after it, of a Wardley map] [test: a directive that
starts the text of an accTitle line, two spaces and a text after it, spaces at
the end, of a Wardley map] [test: a directive that starts the text of an
accDescr line, two spaces and a text after it, spaces at the end, of a Wardley
map] [test: a `;` at the end of a title, a tab after the keyword, spaces after
the `;`, of a Wardley map] [test: a `;` at the end of an accDescr line, a run of
spaces inside the text, of a Wardley map] [test: a `;` at the end of an accTitle
line, a tab after the colon, spaces after the `;`, of a Wardley map] [test: a
`;` at the end of an accDescr line, a gap before the colon, of a Wardley map]
[test: a comment after the text of an accTitle line, spaces before it, of a
Wardley map] [test: a comment after the text of an accDescr line, spaces before
it, of a Wardley map] [test: a run of spaces inside the text of an accDescr
line, of a Wardley map] [test: a run of spaces inside the text of an accTitle
line, of a Wardley map] [test: a run of spaces inside a quoted string in an
accDescr line, of a Wardley map] [test: text after the `;` that the line rule
ignores in an accDescr line, runs before and after it, of a Wardley map] [test:
nothing after the `;` that the line rule ignores in an accDescr line, runs
before it, of a Wardley map] [test: two touching `;` that the line rule reads in
an accDescr line, a run before them, of a Wardley map] [test: text after the `;`
that the line rule ignores in an accTitle line, of a Wardley map] [test:
released output that the document does not state: a `;` inside the comment at
the end of an accTitle line, a gap before the colon, spaces at the end, of a
Wardley map] [test: a gap before and after the colon of an accTitle line,
nothing after the `;` that the line rule ignores, of a Wardley map] [test:
U+2028 before a directive that a comment touches, a line follows, in an accTitle
line of a Wardley map] [test: U+2028 before a directive that a comment touches,
the text ends, in an accTitle line of a Wardley map] [test: U+2028 before a
directive that a comment follows after spaces, a line follows, in an accTitle
line of a Wardley map] [test: U+2028 before a directive that a comment follows
after spaces, the text ends, in an accTitle line of a Wardley map] [test: U+2029
before a directive that a comment touches, a line follows, in an accTitle line
of a Wardley map] [test: U+2029 before a directive that a comment touches, the
text ends, in an accTitle line of a Wardley map] [test: U+2029 before a
directive that a comment follows after spaces, a line follows, in an accTitle
line of a Wardley map] [test: U+2029 before a directive that a comment follows
after spaces, the text ends, in an accTitle line of a Wardley map] [test: U+2028
before a directive that a comment touches, a line follows, in an accDescr line
of a Wardley map] [test: U+2028 before a directive that a comment touches, the
text ends, in an accDescr line of a Wardley map] [test: U+2028 before a
directive that a comment follows after spaces, a line follows, in an accDescr
line of a Wardley map] [test: U+2028 before a directive that a comment follows
after spaces, the text ends, in an accDescr line of a Wardley map] [test: U+2029
before a directive that a comment touches, a line follows, in an accDescr line
of a Wardley map] [test: U+2029 before a directive that a comment touches, the
text ends, in an accDescr line of a Wardley map] [test: U+2029 before a
directive that a comment follows after spaces, a line follows, in an accDescr
line of a Wardley map] [test: U+2029 before a directive that a comment follows
after spaces, the text ends, in an accDescr line of a Wardley map] [test: a
U+2028 inside the text, a directive, and a comment after spaces, in an accTitle
line of a Wardley map] [test: a U+2028 inside the text, a directive that a
comment touches, in an accTitle line of a Wardley map] [test: a U+2029 inside
the text, a directive, and a comment after spaces, in an accDescr line of a
Wardley map] [test: a U+2028 inside the text, two directives that touch, and a
comment after spaces, in an accDescr line of a Wardley map] [test: a wide space
before two directives that spaces separate, the text ends, in an accTitle line
of a Wardley map] [test: a wide space before two directives that spaces
separate, the text ends, in an accDescr line of a Wardley map] [test: a wide
space before a directive that spaces and a comment follow, the text ends, in an
accTitle line of a Wardley map] [test: a wide space before a directive that
spaces and a comment follow, the text ends, in an accDescr line of a Wardley
map] [test: a wide space before two directives that touch and a comment that
touches the last, the text ends, in an accTitle line of a Wardley map] [test: a
wide space before two directives that touch and a comment that touches the last,
the text ends, in an accDescr line of a Wardley map] [test: a U+2028 before two
directives that touch, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that touch, the text ends, in an accDescr
line of a Wardley map] [test: a U+2028 before a directive that spaces follow,
the text ends, in an accTitle line of a Wardley map] [test: a U+2028 before a
directive that spaces follow, the text ends, in an accDescr line of a Wardley
map] [test: a U+2028 before two directives that spaces separate, the text ends,
in an accTitle line of a Wardley map] [test: a U+2028 before two directives that
spaces separate, the text ends, in an accDescr line of a Wardley map] [test: a
directive that holds a line break, spaces before it, the text ends, in an
accTitle line of a Wardley map] [test: a directive that holds a line break,
spaces before it, the text ends, in an accDescr line of a Wardley map] [test: a
directive that holds a U+2028, spaces before it, the text ends, in an accTitle
line of a Wardley map] [test: a directive that holds a U+2028, spaces before it,
the text ends, in an accDescr line of a Wardley map] [test: a U+2028 inside the
text, spaces before the directive, the text ends, in an accTitle line of a
Wardley map] [test: a U+2028 inside the text, spaces before the directive, the
text ends, in an accDescr line of a Wardley map] [test: a value of directives
only, spaces after the directive, the text ends, in an accTitle line of a
Wardley map] [test: a value of directives only, spaces after the directive, the
text ends, in an accDescr line of a Wardley map] [test: a directive inside the
text, spaces before and after the last directive, the text ends, in an accTitle
line of a Wardley map] [test: a directive inside the text, spaces before and
after the last directive, the text ends, in an accDescr line of a Wardley map]
[test: a `;` and no directive, the text ends, in an accTitle line of a Wardley
map] [test: a `;` and no directive, the text ends, in an accDescr line of a
Wardley map] [test: a `;` and no directive, the gap before the colon of accTitle
is a space, the text ends, in an accTitle line of a Wardley map] [test: a `;`
and no directive, the gap before the colon of accTitle is a tab, the text ends,
in an accTitle line of a Wardley map] [test: a `;` and no directive, the gap
before the colon of accDescr is a space, the text ends, in an accDescr line of a
Wardley map] [test: a `;` and no directive, the gap before the colon of accDescr
is a tab, the text ends, in an accDescr line of a Wardley map] [test: a `;` in
the text, spaces before the directive, the text ends, in an accTitle line of a
Wardley map] [test: a `;` in the text, spaces before the directive, the text
ends, in an accDescr line of a Wardley map] [test: a `;` in the text, spaces
between two directives, the text ends, in an accTitle line of a Wardley map]
[test: a `;` in the text, spaces between two directives, the text ends, in an
accDescr line of a Wardley map] [test: a `;` between two directives, spaces
around it, the text ends, in an accTitle line of a Wardley map] [test: a `;`
between two directives, spaces around it, the text ends, in an accDescr line of
a Wardley map] [test: a `;` after the last directive, the text ends, in an
accTitle line of a Wardley map] [test: a `;` after the last directive, the text
ends, in an accDescr line of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, the text ends, in an accTitle line of a
Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a comment line follows, in an accTitle line of a Wardley map] [test: a
U+2028 before a directive that spaces and a comment follow, an empty line
follows, in an accTitle line of a Wardley map] [test: a U+2028 before a
directive that spaces and a comment follow, a line of whitespace follows, in an
accTitle line of a Wardley map] [test: a U+2028 before a directive that spaces
and a comment follow, a directive line follows, in an accTitle line of a Wardley
map] [test: a U+2028 before a directive that spaces and a comment follow, a
comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty
line and a statement follow, in an accTitle line of a Wardley map] [test: a
U+2028 before a directive that spaces and a comment follow, the text ends, in an
accDescr line of a Wardley map] [test: a U+2028 before a directive that spaces
and a comment follow, a comment line follows, in an accDescr line of a Wardley
map] [test: a U+2028 before a directive that spaces and a comment follow, an
empty line follows, in an accDescr line of a Wardley map] [test: a U+2028 before
a directive that spaces and a comment follow, a line of whitespace follows, in
an accDescr line of a Wardley map] [test: a U+2028 before a directive that
spaces and a comment follow, a directive line follows, in an accDescr line of a
Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a comment line and a statement follow, in an accDescr line of a Wardley
map] [test: a U+2028 before a directive that spaces and a comment follow, an
empty line and a statement follow, in an accDescr line of a Wardley map] [test:
a U+2028 before two directives that a wide space separates, a comment after
them, the text ends, in an accTitle line of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, a
comment line follows, in an accTitle line of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, an
empty line follows, in an accTitle line of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a line of
whitespace follows, in an accTitle line of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a directive
line follows, in an accTitle line of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a comment line and
a statement follow, in an accTitle line of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, an empty line
and a statement follow, in an accTitle line of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, the
text ends, in an accDescr line of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a comment line
follows, in an accDescr line of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, an empty line
follows, in an accDescr line of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a line of
whitespace follows, in an accDescr line of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, a directive
line follows, in an accDescr line of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a comment line and
a statement follow, in an accDescr line of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, an empty line
and a statement follow, in an accDescr line of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, the text ends, in an
accTitle line of a Wardley map] [test: a U+2028 before a directive that a wide
space and a comment follow, a comment line follows, in an accTitle line of a
Wardley map] [test: a U+2028 before a directive that a wide space and a comment
follow, an empty line follows, in an accTitle line of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, a line of
whitespace follows, in an accTitle line of a Wardley map] [test: a U+2028 before
a directive that a wide space and a comment follow, a directive line follows, in
an accTitle line of a Wardley map] [test: a U+2028 before a directive that a
wide space and a comment follow, a comment line and a statement follow, in an
accTitle line of a Wardley map] [test: a U+2028 before a directive that a wide
space and a comment follow, an empty line and a statement follow, in an accTitle
line of a Wardley map] [test: a U+2028 before a directive that a wide space and
a comment follow, the text ends, in an accDescr line of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, a comment line
follows, in an accDescr line of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, an empty line follows, in an
accDescr line of a Wardley map] [test: a U+2028 before a directive that a wide
space and a comment follow, a line of whitespace follows, in an accDescr line of
a Wardley map] [test: a U+2028 before a directive that a wide space and a
comment follow, a directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a
comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an
empty line and a statement follow, in an accDescr line of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, the
gap before the colon of accTitle is a space, a U+2028 stands before the text,
the text ends, in an accTitle line of a Wardley map] [test: released output that
the document does not state: a `;` and no directive, a U+2028 stands before the
text of accTitle, the text ends, in an accTitle line of a Wardley map] [test:
released output that the document does not state: a `;` and no directive, the
gap before the colon of accDescr is a space, a U+2028 stands before the text,
the text ends, in an accDescr line of a Wardley map] [test: released output that
the document does not state: a `;` and no directive, a U+2028 stands before the
text of accDescr, the text ends, in an accDescr line of a Wardley map] [test: a
U+2028 before a directive that spaces and a comment follow, an indented
directive line follows, in an accTitle line of a Wardley map] [test: a U+2028
before a directive that spaces and a comment follow, a directive and spaces
follow, in an accTitle line of a Wardley map] [test: a U+2028 before a directive
that spaces and a comment follow, two directives that touch follow, in an
accTitle line of a Wardley map] [test: a U+2028 before a directive that spaces
and a comment follow, a directive and a comment on a line follow, in an accTitle
line of a Wardley map] [test: a U+2028 before a directive that spaces and a
comment follow, a line of a no-break space follows, in an accTitle line of a
Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, a line of a tab follows, in an accTitle line of a Wardley map] [test: a
U+2028 before a directive that spaces and a comment follow, an indented comment
line follows, in an accTitle line of a Wardley map] [test: a U+2028 before a
directive that spaces and a comment follow, an indented directive line follows,
in an accDescr line of a Wardley map] [test: a U+2028 before a directive that
spaces and a comment follow, a directive and spaces follow, in an accDescr line
of a Wardley map] [test: a U+2028 before a directive that spaces and a comment
follow, two directives that touch follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive
and a comment on a line follow, in an accDescr line of a Wardley map] [test: a
U+2028 before a directive that spaces and a comment follow, a line of a no-break
space follows, in an accDescr line of a Wardley map] [test: a U+2028 before a
directive that spaces and a comment follow, a line of a tab follows, in an
accDescr line of a Wardley map] [test: a U+2028 before a directive that spaces
and a comment follow, an indented comment line follows, in an accDescr line of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, an indented directive line follows, in an accTitle line of
a Wardley map] [test: a U+2028 before two directives that a wide space
separates, a comment after them, a directive and spaces follow, in an accTitle
line of a Wardley map] [test: a U+2028 before two directives that a wide space
separates, a comment after them, two directives that touch follow, in an
accTitle line of a Wardley map] [test: a U+2028 before two directives that a
wide space separates, a comment after them, a directive and a comment on a line
follow, in an accTitle line of a Wardley map] [test: a U+2028 before two
directives that a wide space separates, a comment after them, a line of a
no-break space follows, in an accTitle line of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, a line
of a tab follows, in an accTitle line of a Wardley map] [test: a U+2028 before
two directives that a wide space separates, a comment after them, an indented
comment line follows, in an accTitle line of a Wardley map] [test: a U+2028
before two directives that a wide space separates, a comment after them, an
indented directive line follows, in an accDescr line of a Wardley map] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
a directive and spaces follow, in an accDescr line of a Wardley map] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
two directives that touch follow, in an accDescr line of a Wardley map] [test: a
U+2028 before two directives that a wide space separates, a comment after them,
a directive and a comment on a line follow, in an accDescr line of a Wardley
map] [test: a U+2028 before two directives that a wide space separates, a
comment after them, a line of a no-break space follows, in an accDescr line of a
Wardley map] [test: a U+2028 before two directives that a wide space separates,
a comment after them, a line of a tab follows, in an accDescr line of a Wardley
map] [test: a U+2028 before two directives that a wide space separates, a
comment after them, an indented comment line follows, in an accDescr line of a
Wardley map] [test: a U+2028 before a directive that a wide space and a comment
follow, an indented directive line follows, in an accTitle line of a Wardley
map] [test: a U+2028 before a directive that a wide space and a comment follow,
a directive and spaces follow, in an accTitle line of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, two directives
that touch follow, in an accTitle line of a Wardley map] [test: a U+2028 before
a directive that a wide space and a comment follow, a directive and a comment on
a line follow, in an accTitle line of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, a line of a no-break space
follows, in an accTitle line of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, a line of a tab follows, in an
accTitle line of a Wardley map] [test: a U+2028 before a directive that a wide
space and a comment follow, an indented comment line follows, in an accTitle
line of a Wardley map] [test: a U+2028 before a directive that a wide space and
a comment follow, an indented directive line follows, in an accDescr line of a
Wardley map] [test: a U+2028 before a directive that a wide space and a comment
follow, a directive and spaces follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, two
directives that touch follow, in an accDescr line of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, a directive
and a comment on a line follow, in an accDescr line of a Wardley map] [test: a
U+2028 before a directive that a wide space and a comment follow, a line of a
no-break space follows, in an accDescr line of a Wardley map] [test: a U+2028
before a directive that a wide space and a comment follow, a line of a tab
follows, in an accDescr line of a Wardley map] [test: a U+2028 before a
directive that a wide space and a comment follow, an indented comment line
follows, in an accDescr line of a Wardley map] [test: a `;` after the last
directive, a U+2028 before the directives, a comment after it, the text ends, in
an accTitle line of a Wardley map] [test: a `;` after the last directive, a
U+2028 before the directives, a comment after it, the text ends, in an accDescr
line of a Wardley map] [test: a `;` between two directives, a U+2028 before the
directives, a comment after them, the text ends, in an accTitle line of a
Wardley map] [test: a `;` between two directives, a U+2028 before the
directives, a comment after them, the text ends, in an accDescr line of a
Wardley map] [test: a U+2028 after the last directive that spaces and a comment
follow, the text ends, in an accTitle line of a Wardley map] [test: a U+2028
after the last directive that spaces and a comment follow, a comment line
follows, in an accTitle line of a Wardley map] [test: a U+2028 after the last
directive that spaces and a comment follow, an empty line follows, in an
accTitle line of a Wardley map] [test: a U+2028 after the last directive that
spaces and a comment follow, a line of whitespace follows, in an accTitle line
of a Wardley map] [test: a U+2028 after the last directive that spaces and a
comment follow, a directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a
comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an
empty line and a statement follow, in an accTitle line of a Wardley map] [test:
a U+2028 after the last directive that spaces and a comment follow, the text
ends, in an accDescr line of a Wardley map] [test: a U+2028 after the last
directive that spaces and a comment follow, a comment line follows, in an
accDescr line of a Wardley map] [test: a U+2028 after the last directive that
spaces and a comment follow, an empty line follows, in an accDescr line of a
Wardley map] [test: a U+2028 after the last directive that spaces and a comment
follow, a line of whitespace follows, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a
directive line follows, in an accDescr line of a Wardley map] [test: a U+2028
after the last directive that spaces and a comment follow, a comment line and a
statement follow, in an accDescr line of a Wardley map] [test: a U+2028 after
the last directive that spaces and a comment follow, an empty line and a
statement follow, in an accDescr line of a Wardley map] [test: a U+2028 between
two directives, spaces and a comment after the last one, the text ends, in an
accTitle line of a Wardley map] [test: a U+2028 between two directives, spaces
and a comment after the last one, a comment line follows, in an accTitle line of
a Wardley map] [test: a U+2028 between two directives, spaces and a comment
after the last one, an empty line follows, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one,
a line of whitespace follows, in an accTitle line of a Wardley map] [test: a
U+2028 between two directives, spaces and a comment after the last one, a
directive line follows, in an accTitle line of a Wardley map] [test: a U+2028
between two directives, spaces and a comment after the last one, a comment line
and a statement follow, in an accTitle line of a Wardley map] [test: a U+2028
between two directives, spaces and a comment after the last one, an empty line
and a statement follow, in an accTitle line of a Wardley map] [test: a U+2028
between two directives, spaces and a comment after the last one, the text ends,
in an accDescr line of a Wardley map] [test: a U+2028 between two directives,
spaces and a comment after the last one, a comment line follows, in an accDescr
line of a Wardley map] [test: a U+2028 between two directives, spaces and a
comment after the last one, an empty line follows, in an accDescr line of a
Wardley map] [test: a U+2028 between two directives, spaces and a comment after
the last one, a line of whitespace follows, in an accDescr line of a Wardley
map] [test: a U+2028 between two directives, spaces and a comment after the last
one, a directive line follows, in an accDescr line of a Wardley map] [test: a
U+2028 between two directives, spaces and a comment after the last one, a
comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one,
an empty line and a statement follow, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive,
a U+2028 and a space stand before the text of accTitle, the gap before the colon
is a space, the text ends, in an accTitle line of a Wardley map] [test: released
output that the document does not state: a `;` and no directive, a U+2029 and
two spaces stand before the text of accTitle, the text ends, in an accTitle line
of a Wardley map] [test: released output that the document does not state: a `;`
and no directive, a U+2028 and a space stand before the text of accDescr, the
gap before the colon is a space, the text ends, in an accDescr line of a Wardley
map] [test: released output that the document does not state: a `;` and no
directive, a U+2029 and two spaces stand before the text of accDescr, the text
ends, in an accDescr line of a Wardley map] [test: a directive that two spaces
follow, before a comment line after a U+2028 before a directive, the text ends,
in an accTitle line of a Wardley map] [test: a directive that two spaces follow,
before a comment line after a U+2028 before a directive, the text ends, in an
accDescr line of a Wardley map] [test: U+2028 between two directives and after
the last, a comment follows after spaces, the text ends, in an accTitle line of
a Wardley map] [test: U+2028 between two directives and after the last, a
comment follows after spaces, the text ends, in an accDescr line of a Wardley
map] [test: U+2028 between two directives and after the last, two spaces after
the first, a comment touches the last U+2028, the text ends, in an accTitle line
of a Wardley map] [test: U+2028 between two directives and after the last, two
spaces after the first, a comment touches the last U+2028, the text ends, in an
accDescr line of a Wardley map] [test: U+2028 between the first and the second
of three directives and between the second and the third, a comment follows the
third after a space, the text ends, in an accTitle line of a Wardley map] [test:
U+2028 between the first and the second of three directives and between the
second and the third, a comment follows the third after a space, the text ends,
in an accDescr line of a Wardley map] [test: released output that the document
does not state: accTitle with a gap before the colon, a `;` before a U+2028, the
text ends, in an accTitle line of a Wardley map] [test: released output that the
document does not state: accTitle with a gap before the colon, a `;` after the
U+2028, the text ends, in an accTitle line of a Wardley map] [test: released
output that the document does not state: accDescr with a gap before the colon, a
`;` before a U+2028, the text ends, in an accDescr line of a Wardley map] [test:
released output that the document does not state: accDescr with a gap before the
colon, a `;` after the U+2028, the text ends, in an accDescr line of a Wardley
map] [test: accTitle with a gap before the colon, a `;` inside a directive that
touches the text, the text ends, in an accTitle line of a Wardley map] [test:
released output that the document does not state: accTitle with a gap before the
colon, a `;` inside a comment after the text, the text ends, in an accTitle line
of a Wardley map] [test: released output that the document does not state:
accTitle with a gap before the colon, a `;` right after the colon and a U+2028
after it, the text ends, in an accTitle line of a Wardley map] [test: a `;`
before the U+2028 between two directives, a comment follows the last directive
after two spaces, the text ends, in an accTitle line of a Wardley map] [test:
two U+2028 with two spaces on each side between two directives, a comment
follows the last directive after two spaces, the text ends, in an accTitle line
of a Wardley map] [test: released output that the document does not state:
accTitle with a gap before the colon, a U+2028 before a `;`, and a second U+2028
after the `;`, the text ends, in an accTitle line of a Wardley map] [test:
released output that the document does not state: accDescr with a gap before the
colon, a U+2028 before a `;`, and a second U+2028 after the `;`, the text ends,
in an accDescr line of a Wardley map] [test: released output that the document
does not state: accTitle with a gap before the colon, a `;` before two U+2028,
the text ends, in an accTitle line of a Wardley map] [test: accTitle with a gap
before the colon, a `;` inside a directive that a U+2028 follows, the text ends,
in an accTitle line of a Wardley map] [test: released output that the document
does not state: accTitle with a gap before the colon, a `;` inside a comment
that a U+2028 follows, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and a
`;` after it inside the same directive, the text ends, in an accTitle line of a
Wardley map] [test: accTitle with a gap before the colon, a U+2028 inside a
directive and no `;`, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and a
`;` inside a directive after it, the text ends, in an accTitle line of a Wardley
map] [test: released output that the document does not state: accTitle with a
gap before the colon, a U+2028 inside a comment and a `;` after it in the
comment, the text ends, in an accTitle line of a Wardley map] [test: accTitle
with a gap before the colon, a U+2028 inside a comment and no `;`, the text
ends, in an accTitle line of a Wardley map] [test: a U+2028 between the text and
a directive, a U+2028 between the directive and the comment, an empty line and a
statement follow, in an accTitle line of a Wardley map] [test: a U+2028 before a
directive that a comment follows after two spaces, an empty line and a statement
follow, in an accTitle line of a Wardley map] [test: a U+2028 before a directive
that a comment follows after two spaces, a comment line follows, in an accTitle
line of a Wardley map] [test: a comment after the last directive after two
spaces, a comment line that holds a `;` follows, in an accTitle line of a
Wardley map]

A description block on one line follows
[A description block on one line](./compatibility.md#a-description-block-on-one-line).

[fixture: wardley/accessibility/description-tight] [fixture:
wardley/accessibility/description-edges] [fixture:
wardley/accessibility/description-opener-newline]

In a block that keeps its braces, separate the keyword and `{` by one ordinary
space even when written touching, compact whitespace-only interiors to `{}`
because there is no text for the whitespace to surround, join plain opener
whitespace and align a separate closer.

[fixture: wardley/accessibility/description-empty]

The line that holds the `{` after a comment or a directive stands at the level
of its statement. Of the 23 other diagram types that accept the form, c4, class,
er, flowchart, gantt, journey, quadrant, requirement, sequence, state, timeline,
and xychart print it one level deeper, with the comment line, and architecture,
cynefin, gitgraph, info, ishikawa, packet, pie, radar, railroad, treemap, and
treeview print it at the level of the statement. Rule 2 gives no one form for
it, so the released form stays until it is decided.

[fixture: wardley/accessibility/description-opener-comment-line]

Protected trivia and semicolon layouts keep their gaps. Ordinary description
body and standalone comment lines align one level inside the statement: the Db
removes indentation after LF. A directive line among the lines of a block with
text stands there too, one level inside the statement, as
[quadrant](./quadrant.md#titles-and-accessibility-statements) indents the body
of such a block. Keep line breaks and interior blank lines, and the whitespace
at the end of each line of text except the last one; a line of whitespace only
becomes an empty line. The whitespace at the end of the last line of text is
dropped where the closer stands on a line of its own, and is printed as one
space where the closer follows it on that line. Directives and shared removed
comment regions keep their complete source, including in a block that contains
only a directive, and trivia keeps its shared continuation layout. Rule 1 names
no mark for a line inside a block. For a block that holds only comment lines,
rule 2 decides, as [flowchart](./flowchart.md#multi-line-values) keeps the
comment lines of a block without text and puts them one level inside the block,
with its `}` at the level of the `accDescr`. No rule gives the interior of a
block that holds a directive: [flowchart](./flowchart.md#multi-line-values),
[xychart](./xychart.md#empty-description-blocks), and
[quadrant](./quadrant.md#empty-description-blocks) keep its contents and line
breaks, but in them this is a question of the list of undecided forms (D34) and
a form printed against a rule, so their printing is no decided form, and the
released form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: wardley/accessibility/description-closer] [fixture:
wardley/accessibility/description-comment-only] [fixture:
wardley/accessibility/description-directive-only] [fixture:
wardley/accessibility/block-trailing-whitespace] [fixture:
wardley/accessibility/block-trailing-whitespace-closer-on-the-text-line]
[fixture: wardley/accessibility/description-directive-line]

Input (escaped): `"wardley-beta\naccTitle \t:  A  B \t\naccDescr\t:  C  D \t"`.

Output
([accessibility/access-lines-output.mmd](../tests/fixtures/wardley/accessibility/access-lines-output.mmd)):

```mmd
wardley-beta
  accTitle: A  B
  accDescr: C D
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

Keep Root directive source, order and ownership. Within a printed line, place a
directive as under [Directives](./flowchart.md#directives). When formatting
splits units that were on the same line, a directive in their gap moves with the
following unit: its right boundary stays touching or separated, while its left
contact is broken. Rule 1 names no mark for a directive between two units, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: [sequence](./sequence.md#directives),
[flowchart](./flowchart.md#directives), and [journey](./journey.md#directives)
print such a gap in the same way (`A%%{init: {}}%%-->B` is printed
`A %%{init: {}}%%--> B` in a flowchart, `A->>%%{init: {}}%%B: x` is printed
`A ->> %%{init: {}}%%B: x` in a sequence diagram, and `component%%{wrap}%%Glued`
is printed `component %%{wrap}%%Glued` here). Ordinary standalone directives
align with their body, as [flowchart](./flowchart.md#directives) stands a
directive on a line of its own at the level of the statements around it
([rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have));
multiline interiors and EOF-reaching unfinished endings remain written. Do not
format their JSON or reorder them: common removal joins surrounding text and can
change acceptance or values. Native hidden directives remain separate nodes.

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

[fixture: flowchart/directives/touching-token] [fixture:
sequence/directives/whitespace-on-each-side]

Input (escaped): `"wardley-beta\ncomponent%%{wrap}%%Glued[0.3,0.6]"`.

Output
([global-directives/global-keyword-contact-output.mmd](../tests/fixtures/wardley/global-directives/global-keyword-contact-output.mmd)):

```mmd
wardley-beta
  component %%{wrap}%%Glued [0.3, 0.6]
```

### Comments

Align ordinary standalone comments with the containing body and prefix comments
at column one.
[Rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
the column of a comment before the header: [flowchart](./flowchart.md#comments),
[xychart](./xychart.md#comments), [radar](./radar.md#comments), and
[pie](./pie.md#comments) print it at column one. Inline comments keep their
line, touching where they touch, and a run of spaces and tabs before one becomes
one space. Rule 1 names no mark before a comment, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#comments),
[journey](./journey.md#comments), and [timeline](./timeline.md#comments) print a
comment after a statement in the same way, where no other rule keeps the
whitespace as written; each of them names those cases in its own sections or in
[A comment right after a character](./compatibility.md#a-comment-right-after-a-character)
(whitespace that the Db holds, as after a `section` or a period, and whitespace
that changes what mermaid.js reads). Preserve marks, text and trailing padding;
pipeline comments use child depth. The start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [journey](./journey.md#comments) and
[timeline](./timeline.md#comments) stand a comment on a line of its own at the
level of the statement after it, and at the end of the text at the level of the
last statement. In a pipeline the statements are the children: a comment before
a child stands at the level of the children, and so does one after the last
child. A comment line between `accDescr` and its `{` is the exception: it stands
one level inside the statement, deeper than the `{` line that follows. Enclosing
strings, flows and link labels retain percent text. Common comment-region joins
keep their source columns, preventing text from changing owner.

[test: wardley/comments/native-separators] [fixture:
wardley/comments/comment-standalone] [fixture:
wardley/accessibility/description-opener-comment-line]

[fixture: wardley/comments/comment-inline-contact]

[fixture: wardley/comments/comment-inline-separated] [fixture:
wardley/comments/inline-gap-run-before-comment]

[fixture: wardley/comments/comment-pipeline] [fixture:
wardley/comments/comment-pipeline-after-last-child] [fixture:
wardley/comments/comment-after-pipeline-end] [fixture:
wardley/comments/comment-line-after-pipeline-end] [fixture:
wardley/comments/comment-at-end-of-text]

[fixture: wardley/comments/comment-triple-bare]

[fixture: flowchart/comments/before-header] [fixture:
xychart/comments/comment-line-before-the-header]

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
grouping without excess space.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the empty
lines: Prettier keeps one blank line where a run of them stands in JavaScript,
CSS, and YAML, and drops the blank lines at the start and the end of a file in
all three, and at the start and the end of a block in JavaScript and CSS;
[flowchart](./flowchart.md#blank-lines), [pie](./pie.md#blank-lines), and
[radar](./radar.md#blank-lines) print them so: a run of empty lines as one, and
none at the start or the end of a body. Values, hidden/directive interiors,
retained prefixes, protected stretches and required hidden LF use their own
preservation rules.

[fixture: wardley/blank-lines/blanks-collapse]

[fixture: wardley/blank-lines/blanks-pipeline]

[fixture: wardley/blank-lines/blanks-comments]

[fixture: flowchart/blank-lines/single-kept] [fixture:
radar/blank-lines/blanks-ordinary]

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
and description closers. Prettier prints no whitespace at the end of a line in
JavaScript, CSS, and YAML, and [radar](./radar.md#trailing-whitespace),
[pie](./pie.md#trailing-whitespace), and
[gitgraph](./gitgraph.md#trailing-whitespace) print none after the header or a
statement. Decide by owner: preserve link-label tails, string/flow contents,
comments, directives, hidden interiors, required closer padding and protected
stretches. Trimming every physical line can change the Db or reject a
whitespace-only link label in every version of mermaid.js that counts (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: wardley/trailing-whitespace/trailing-exterior]

[fixture: wardley/trailing-whitespace/trailing-string]

[fixture: wardley/trailing-whitespace/trailing-blank-label-keep]

[fixture: radar/trailing-whitespace/trailing-safe] [fixture:
pie/trailing-whitespace/trailing-exterior] [fixture:
gitgraph/trailing-whitespace/trailing-safe]

Input (escaped):
`"wardley-beta \t\ncomponent Tail[0.3,0.6] \t\naccDescr { End } \t"`.

Output
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/wardley/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
wardley-beta
  component Tail [0.3, 0.6]
  accDescr: End
```

### Semicolons

Use shared complete-line protection for source lines containing both a semicolon
and literal style or classDef after Root directives are omitted, including
nontriggering word lines with a semicolon. A name such as `mystyle` alone does
not prevent ordinary component and pipeline spacing. Keep their statements,
comments and hidden forms together and do not join neighboring lines. Align the
first line with its body; keep its content and all later columns. Count a line
as Mermaid reads it, including directive-spanning words and comment regions
after U+2028/U+2029. The line rule can ignore a grammatical label opener, so
preserving the complete line avoids predicting its selection after moving text.
Keep all authored semicolons. Exclude grammatical link-label openers from shared
textual-prefix protection; other semicolons protect their source segment through
the last semicolon and whole crossing values/trivia. Words inside removed Root
directives alone do not trigger complete-line protection. A Root directive
before the header is omitted in the same way, and the lines of the body after it
are protected or formatted as before.

The whitespace around a `;` of a word line stays as written, since it changes
how mermaid.js reads the line: `A -> B;` at the end of a line is rejected, while
`A -> B;` followed by spaces is accepted, so the printer does not choose a form
that mermaid.js reads otherwise.

[fixture: wardley/semicolons/word-line-semicolon-whitespace-kept] [fixture:
wardley/semicolons/style-label]

[fixture: wardley/semicolons/style-selected-delimiter]

[fixture: wardley/semicolons/classdef-selected-delimiter]

[fixture: wardley/semicolons/style-classdef-two-passes]

[fixture: wardley/semicolons/style-colon-space-nontrigger]

[fixture: wardley/semicolons/style-uppercase-nontrigger]

[fixture: wardley/semicolons/style-no-semicolon]

[fixture: wardley/semicolons/style-no-semicolon-directive-lines]

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

[fixture: wardley/semicolons/style-after-leading-directive]

Input (escaped): `"wardley-beta\nAlpha  -> Beta; style:#tone;"`.

Output
([semicolons/style-label-output.mmd](../tests/fixtures/wardley/semicolons/style-label-output.mmd)):

```mmd
wardley-beta
  Alpha  -> Beta; style:#tone;
```

### Multiline values

Do not wrap at printWidth. Keep physical string and flow contents, continuation
columns and interior blank lines. Description bodies use the shared indentation
above. Visible LF between ordinary statement components can reject the input,
and reindenting value continuations changes the Db. Long component/evolution
statements stay unwrapped; description openers and closers use Accessibility.

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

Use the shared guarded YAML formatter only for safe real frontmatter. The YAML
is formatted by Prettier's YAML formatter, as the YAML of any file that Prettier
formats: `title: 'Map'` is printed `title: "Map"`, and
`config: {wardley: {width: 600}}` is printed
`config: { wardley: { width: 600 } }`. Malformed YAML, indented fences,
delimiter padding, HTML hazards and bodies whose formatting would create a fence
remain written. [Frontmatter](./compatibility.md#frontmatter) gives the reason
for the HTML hazards (mermaid.js rewrites `="..."` inside an HTML tag before it
reads the YAML) and for a body that would create a fence (`--- !!map` after
`%YAML 1.2`, which every version that counts accepts and rejects once it is
split); the indented fences stay as written until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
Prettier prints the delimiter of a front matter without the whitespace after
`---`, and the versions that were run read a delimiter with it like one without
it (the same Db and the same drawing), so the padding of a delimiter is printed
against rule 1 and waits to be fixed by the rule. YAML uses the shared positive
indentation minimum at tabWidth zero. Its indentation carries block scalars and
nested values: at zero width every version that counts rejects a block scalar
and draws a diagram differently where a nested `config` value is no longer
nested (see [Frontmatter](./compatibility.md#frontmatter) and the rows of
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
If textBeforeHeader is present, keep the complete prefix, including leading LF,
passed trivia, second-scan forms and real/retained order. The shared keepsPrefix
rule prevents ignored YAML from becoming effective frontmatter and changing
configuration or title.

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
ending, including inside values and hidden forms. mermaid.js reads CR and CRLF
as it reads LF, and Prettier prints the line ending of its `endOfLine` option,
as for every other language (see
[Line endings](./compatibility.md#line-endings)). LS/PS/NBSP/BOM retain their
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
terminal blank lines. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives it: Prettier ends a file with one newline and removes the blank lines
after the last statement in JavaScript, CSS, and YAML, and
[radar](./radar.md#final-newline), [pie](./pie.md#final-newline), and
[gitgraph](./gitgraph.md#final-newline) end a text with one newline. Header-only
bodies, comments and closed hidden forms follow the same consistent file ending.
EOF-reaching global endings, retained-prefix boundaries, protected text and
required hidden closer padding take precedence; label padding is value text
rather than an extra final blank.

[corpus fixture: wardley/header-only]

[fixture: wardley/final-newline/final-comment]

[fixture: wardley/final-newline/final-hidden]

[fixture: radar/final-newline/final-comment] [fixture:
pie/final-newline/final-newline] [fixture: gitgraph/final-newline/final-commit]

Input (escaped): `"wardley-beta\n%% final"`.

Output
([final-newline/final-comment-output.mmd](../tests/fixtures/wardley/final-newline/final-comment-output.mmd)):

```mmd
wardley-beta
  %% final
```

### Specified readings

Follow the six existing divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque, bare-percent-line-before-header and c4-keyword-anywhere.
Wardley has no opaque acceptance-setting key. Raw rejection supplies no raw Db;
use available specified readings and embedded effects. Standalone parse failures
report syntax errors without output; Markdown declines embedding. No rejected
syntax is repaired.

[test: wardley/specified-readings/passed-unicode] [corpus fixture:
wardley/directive-arrow-inside]

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
rewritten label form. Trimming that padding in the standalone text would make
every version that counts reject it (see
[Trailing whitespace](#trailing-whitespace)). Test actual host output and
three-pass idempotence separately from standalone payload Db equality.

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
