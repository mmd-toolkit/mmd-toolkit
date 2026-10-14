# Requirement

Japanese version: [requirement.ja.md](./requirement.ja.md)

Source of truth in mermaid.js:

- [`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison)
- [`requirementDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts)
- the tests (`*.spec.js`, `*.spec.ts`) in
  [`requirement/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement)

This document covers the diagram type `requirement`, the requirement diagram.
The nodes of the tree are defined in
[ast/requirement.md](../ast/requirement.md).

## Detection

Entry 14 of [detection.md](../detection.md) selects this grammar: the text
starts with `requirement`, after whitespace, in exactly this case
([`requirementDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDetector.ts#L9-L11)).
`REQUIREMENTDIAGRAM` and `RequirementDiagram` match no detector. [fixture:
requirement/header-only] [fixture:
requirement/docs-syntax-requirement-diagram-7919bd6c] [fixture:
requirement/header-upper-case] [fixture: requirement/header-capitalized]

The lexer then reads the header, the keyword `requirementDiagram`,
case-insensitively and not followed by a word character (see
[The statement context](#the-statement-context)). So `requirementdiagram` is the
header, while `requirement` alone, `requirementDiagramX`, and
`requirementDiagram2` are detected and rejected, the first because it is the
keyword `requirement`, the others because they are names. The header must be
followed by a `newline` unit, before which only comments, directives, and empty
description blocks may stand on its line: `requirementDiagram #c`,
`requirementDiagram %c`, and `requirementDiagram accDescr {}`, each followed by
a line break, are accepted, while a statement after the header on its line, as
in `requirementDiagram element e {`, is rejected, and so are a description block
with text, an `accTitle` line, `requirementDiagram-x`, and
`requirementDiagram;`. Whitespace after the header that starts with a space or a
tab takes the line feed after it (see
[Units and contexts](#units-and-contexts)), so `requirementDiagram` followed by
two spaces or a tab and a line break is rejected, and so is
`requirementDiagram %%{init: {}}%%` followed by a line break, which is read
without its directive. The header alone is accepted, also without a line feed
after it, as the lexer reads a line feed after the last character (see
[End of text](../common.md#end-of-text)), while the header followed by two
spaces at the end of the text is rejected. [fixture:
requirement/header-lower-case-d] [fixture: requirement/header-requirement-only]
[fixture: requirement/header-word-suffix] [fixture:
requirement/header-digit-suffix] [fixture: requirement/header-hash-comment]
[fixture: requirement/header-percent-comment] [fixture:
requirement/header-empty-description-block] [fixture:
requirement/header-statement-same-line] [fixture:
requirement/header-description-block] [fixture: requirement/header-acc-title]
[fixture: requirement/header-dash-suffix] [fixture:
requirement/header-semicolon] [fixture: requirement/header-trailing-spaces]
[fixture: requirement/header-trailing-tab] [fixture:
requirement/header-space-directive-line-feed] [fixture: requirement/header-only]
[fixture: requirement/header-trailing-spaces-at-end] [fixture:
requirement/header-crlf] [fixture: requirement/header-cr-only]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, which detection reads and passes to find the header,
and which is a comment of the diagram here, with the mark `%%`, as in every
diagram type (see [Diagram detection](../common.md#diagram-detection)); the
comment belongs to no node, and the RequirementDiagram starts at the header.
mermaid.js rejects the input in both cases, and also with a line of whitespace
only after the bare line: its lexer reads the line as a comment, and the line
feed after it as a `newline` unit before the header, which its grammar does not
take. This is the known divergence
[`bare-percent-line-before-header`](#known-divergences). A comment line before
the header is removed before detection, and a directive on a line before the
header or right after the header on its line is a directive and nothing else. An
accessibility statement or an empty description block before the header is the
start of the text, so no detector matches it. [fixture:
requirement/header-after-bare-percent-line] [fixture:
requirement/header-after-empty-braces-line] [fixture:
requirement/header-after-bare-percent-line-and-whitespace-line] [fixture:
requirement/header-after-percent-space-line] [fixture:
requirement/header-after-comment-line] [fixture:
requirement/header-after-directive-line] [fixture:
requirement/header-then-directive-same-line] [fixture:
requirement/header-after-acc-title] [fixture:
requirement/header-after-empty-description-block]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there; so an
entity in an accessibility text is read as its placeholder, and an attribute
quote there as `'`. [fixture: requirement/entity-placeholder-in-acc-title]
[fixture: requirement/entity-placeholder-in-acc-descr] [fixture:
requirement/entity-placeholder-in-acc-descr-block] [fixture:
requirement/lex-html-attribute-quote-in-acc-title] [fixture:
requirement/lex-html-attribute-quote-in-acc-descr] [fixture:
requirement/lex-html-attribute-quote-in-acc-descr-block] The `\n` that the lexer
reads after the last character ([End of text](../common.md#end-of-text)) is part
of the diagram text. This section describes the diagram's own unit rules, item 4
of [Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters case-insensitively
(see [Notation](../common.md#notation)): `REQUIREMENT r {`, `ID: 1`,
`RISK: HIGH`, `VERIFYMETHOD: INSPECTION`, `ELEMENT e {`, `DOCREF: d`,
`a - SATISFIES -> b`, `DIRECTION BT`, `CLASSDEF`, `STYLE`, `CLASS`,
`ACCTITLE: T`, `ACCDESCR: D`, and `accdescr {` are read as with the words as
this document writes them. [fixture: requirement/db-keywords-upper-case]
[fixture: requirement/lex-relationship-upper-case] [fixture:
requirement/lex-direction-upper-case] [fixture:
requirement/lex-style-keywords-upper-case] [fixture:
requirement/lex-acc-keywords-upper-case] [fixture:
requirement/lex-acc-descr-block-lower-case] A **keyword** below is a word,
matched case-insensitively, that is not followed by a word character (see
[Notation](../common.md#notation)): `test_x`, `tests`, and `stylex` are names,
while `test` and `element` are keywords wherever a unit starts. [fixture:
requirement/lex-name-keyword-underscore] [fixture:
requirement/lex-value-keyword-prefix] [fixture:
requirement/lex-name-style-word-suffix] [fixture:
requirement/lex-name-starts-with-keyword] [fixture:
requirement/lex-target-keyword]

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it. At each position, the lexer
applies the first rule of the current context that matches there. Whitespace
that a rule reads belongs to no unit unless the rule says otherwise. When no
rule of the current context matches, the input is rejected; the lists below do
not repeat this.

The text may end in the statement context and in the style context, which the
line feed that the lexer reads after the last character leaves. It may not end
in the title context, the description context, or the description block context,
and a string must be closed: `accTitle:` with nothing after it, also followed by
a line break, `accDescr:` followed by a line break, `accDescr {` without `}`,
and a `"` without its closing quote are rejected, while `style r fill:red` at
the end of the text is accepted, also with two spaces after it. [fixture:
requirement/lex-acc-title-at-end] [fixture:
requirement/lex-acc-title-line-feed-at-end] [fixture:
requirement/lex-acc-descr-at-end] [fixture:
requirement/lex-acc-descr-block-unclosed] [fixture:
requirement/lex-string-unclosed] [fixture: requirement/lex-style-at-end-of-text]
[fixture: requirement/lex-style-trailing-spaces-at-end]

**Whitespace.** In the statement context, the line feeds where a unit starts are
a `newline` unit (rule 6), and a run of whitespace that starts with any other
whitespace character, U+00A0, U+2028, and a vertical tab included, lies between
units and takes the line feeds inside it (rule 7). So where the grammar needs a
`newline` unit, after the header, after `{`, and after a field, whitespace other
than a line feed before the line break makes the input rejected:
`requirement r {` followed by two spaces or a tab and a line break, the field
`id: "1"` followed by two spaces and a line break, and the field `risk: high`
followed by a space and a line break, are rejected. Elsewhere it changes
nothing: `}` followed by two spaces and a line break, and a relationship to
`"b"` followed by two spaces and a line break, are followed by the next
statement as usual, and `id`, two spaces, a line break, and `: 1` is the field
`id: 1`, while `id`, a line break, and `: 1` is rejected. An unquoted name or
value reads the whitespace after it on its line (rule 23), so `id: 1` followed
by spaces and a line break is a field. In the style context, only a space lies
between units, and a line feed leaves the context; every other whitespace
character is read by no rule there. [fixture:
requirement/lex-brace-trailing-spaces] [fixture:
requirement/lex-string-value-trailing-spaces] [fixture:
requirement/lex-brace-trailing-tab] [fixture:
requirement/lex-risk-value-trailing-space] [fixture:
requirement/lex-close-brace-trailing-spaces] [fixture:
requirement/lex-relationship-string-trailing-spaces] [fixture:
requirement/gram-field-spaces-line-feed-before-colon] [fixture:
requirement/gram-field-line-feed-before-colon] [fixture:
requirement/db-requirement-value-spaces] [fixture:
requirement/lex-whitespace-line-separator-between-statements] [fixture:
requirement/lex-whitespace-nbsp-before-name] [fixture:
requirement/lex-whitespace-vertical-tab-between-units] [fixture:
requirement/lex-tab-before-field] [fixture: requirement/lex-blank-lines-in-body]
[fixture: requirement/lex-style-tab]

**Names and values.** In the statement context, an ASCII word character followed
by zero or more characters other than `:`, `,`, line feed, `{`, `<`, `>`, `-`,
and `=`, as many as possible, is an `unquoted-text` unit (rule 23). It is a name
or a value, depending on where the grammar takes it. Its written text leaves out
the whitespace at its end, which the rule reads, as mermaid.js trims it, and
keeps the whitespace between its characters, U+00A0 and U+2028 included:
`requirement  spaced name  {` is the requirement `spaced name`, `a`, U+00A0, and
`b` one name, and `a` followed by U+00A0 and `{` the name `a`. `#`, `%`, `;`,
`}`, and `.` are characters of the unit after its first character: `r#1`, `r}`,
`r.1`, `r %c`, `1r`, and `b # c` are names, and `a #b`, `1;`, and `1 %c` values.
A name or a value starts with an ASCII word character, and `=`, `-`, `:`, and
`,` end it: `é`, `-r`, and `a=b` are rejected as names, and `a-b`, `a:b`, `a,b`,
`a > b`, and `été` as values; a string may hold any of them (see
[Requirements](#requirements)). The placeholder of an entity is made of
characters outside ASCII (see [Entities](../common.md#entities)), so `a#amp; b`
is one name or value, `aﬂ°amp¶ß b`, while a name may not start with an entity.
[fixture: requirement/db-requirement-name-spaces] [fixture:
requirement/lex-whitespace-nbsp-in-name] [fixture:
requirement/lex-whitespace-nbsp-after-name] [fixture:
requirement/lex-whitespace-line-separator-in-name] [fixture:
requirement/lex-name-tab-at-end] [fixture: requirement/lex-name-hash] [fixture:
requirement/lex-name-close-brace] [fixture: requirement/lex-name-dot] [fixture:
requirement/lex-name-percent] [fixture: requirement/lex-name-digit-start]
[fixture: requirement/lex-relationship-target-hash] [fixture:
requirement/lex-value-hash] [fixture: requirement/lex-value-semicolon] [fixture:
requirement/lex-value-percent] [fixture: requirement/lex-name-non-ascii-start]
[fixture: requirement/lex-name-dash-start] [fixture:
requirement/lex-name-equals] [fixture: requirement/lex-value-dash] [fixture:
requirement/lex-value-colon] [fixture: requirement/lex-value-comma] [fixture:
requirement/lex-value-greater-than] [fixture:
requirement/lex-value-non-ascii-start] [fixture:
requirement/db-requirement-quoted-values] [fixture:
requirement/entity-placeholder-in-unquoted-name] [fixture:
requirement/entity-placeholder-in-unquoted-value] [fixture:
requirement/entity-placeholder-at-name-start]

**Strings.** In the statement context and in the style context, `"`, zero or
more characters other than `"`, line feeds included, and `"` are a `string` unit
when a character lies between the quotes, and an `empty-string` unit otherwise.
The text of a `string` is the characters between the quotes, so `#`, `%`, `:`,
`,`, `-`, `{`, and `}` are characters of it, and an attribute quote of an HTML
tag inside it is read as `'`, so that the string runs to its last quote:
`text: "<b a="x">t</b>"` has the text `<b a='x'>t</b>`. [fixture:
requirement/db-relationship-quoted-names] [fixture:
requirement/lex-string-line-feed] [fixture: requirement/lex-string-hash-percent]
[fixture: requirement/db-requirement-quoted-values] [fixture:
requirement/lex-html-tag-in-string-value] [fixture:
requirement/entity-placeholder-in-requirement-fields] [fixture:
requirement/entity-placeholder-in-element-fields] [fixture:
requirement/entity-placeholder-in-relationship] No rule of the grammar takes an
`empty-string` unit, so an empty string makes the input rejected wherever the
statement context or the style context reads one: on a line of its own, before a
statement, after the header, after `}`, on a line of a body, before or after the
value of a field, between two units of a statement, and in the style context, as
in `style "" r fill:red` and `style r fi""ll:red`. mermaid.js reads no token for
it and accepts these inputs (see [Known divergences](#known-divergences)).
`requirement "" {` and `text: ""` are rejected by both. Two quotes inside an
unquoted text are characters of it: `requirement r "" x {` is the requirement
`r "" x`, and `text: a "" b` has the text `a "" b`. In the title, description,
and description block contexts, and on a direction line, which takes the whole
line before the string rule, two quotes are text: `accTitle: ""` has the title
`""`, `accDescr { "" }` the description `""`, and `direction LR ""` and
`"" direction LR` set `LR`. [fixture: requirement/div-empty-string-line]
[fixture: requirement/div-empty-string-before-statement] [fixture:
requirement/div-empty-string-after-header] [fixture:
requirement/div-empty-string-after-close-brace] [fixture:
requirement/div-empty-string-body-line] [fixture:
requirement/div-empty-string-after-open-brace] [fixture:
requirement/div-empty-string-before-value] [fixture:
requirement/div-empty-string-after-string-value] [fixture:
requirement/div-empty-string-between-keyword-and-name] [fixture:
requirement/div-empty-string-before-brace] [fixture:
requirement/div-empty-string-in-relationship] [fixture:
requirement/div-empty-string-before-target] [fixture:
requirement/div-empty-string-after-string-source] [fixture:
requirement/div-empty-string-before-style-name] [fixture:
requirement/div-empty-string-before-style] [fixture:
requirement/div-empty-string-in-style-word] [fixture:
requirement/div-empty-string-in-class-statement] [fixture:
requirement/div-empty-string-after-shorthand-separator] [fixture:
requirement/gram-requirement-name-empty-string] [fixture:
requirement/gram-requirement-value-empty-string] [fixture:
requirement/lex-quotes-in-unquoted-name] [fixture:
requirement/lex-quotes-in-unquoted-value] [fixture:
requirement/lex-acc-title-empty-quotes] [fixture:
requirement/lex-acc-descr-block-empty-quotes] [fixture:
requirement/lex-direction-text-empty-quotes] [fixture:
requirement/lex-quotes-before-direction]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit, a name unit
included, makes the input rejected. The **name units** are a `style-word` where
it is a name after `style`, `classDef`, or `class`, or a class. The **text
units** are an `unquoted-text`, a name as well as a value, a `style-word` inside
a style, a `title-text`, a `description-text`, a `description-block-text`, and a
`direction-text`. An `unquoted-text` is a text unit also where it is a name, as
it may hold several words with ASCII spaces between them, which mermaid.js reads
as one name: `requirement  spaced name  {` is the requirement `spaced name` (see
[Names and values](#units-and-contexts)). [fixture:
requirement/db-requirement-name-spaces] The **string unit** is a `string`.

- `requirement a%%{init: {}}%%b {` is the requirement `ab`,
  `a - satisfies -> b%%{init: {}}%%c` has the target `bc`,
  `r:::c%%{init: {}}%%d`, `requirement r:::c%%{init: {}}%%d {`, and `class r`, a
  line break, and `c%%{init: {}}%%d` give r the class `cd`,
  `text: a%%{init: {}}%%b` and `text: "a%%{init: {}}%%b"` have the text `ab`,
  `docref: a%%{init: {}}%%b` the reference `ab`, `accTitle: a%%{init: {}}%%b`
  the title `ab`, `accDescr: a%%{init: {}}%%b` and the same text in a
  description block the description `ab`,
  `fo%%{init: {}}%%o direction LR ba%%{init: {}}%%r` the direction `LR`, and
  `style r fi%%{init: {}}%%ll:red` the style `fill:red`, as in mermaid.js,
  because a style is the texts of its units joined (see
  [RequirementLiteral](../ast/requirement.md#requirementliteral)). [fixture:
  requirement/lex-directive-in-name] [fixture:
  requirement/lex-directive-in-target] [fixture:
  requirement/lex-directive-in-shorthand-class] [fixture:
  requirement/lex-directive-in-requirement-class] [fixture:
  requirement/lex-directive-in-class-list-next-line] [fixture:
  requirement/lex-directive-in-value] [fixture:
  requirement/lex-directive-in-string] [fixture:
  requirement/lex-directive-in-docref] [fixture:
  requirement/lex-directive-in-acc-title] [fixture:
  requirement/lex-directive-in-acc-descr] [fixture:
  requirement/lex-directive-in-acc-descr-block] [fixture:
  requirement/lex-directive-in-direction-text] [fixture:
  requirement/lex-directive-in-style]
- A directive between two units is allowed whatever their kind:
  `requirement r%%{init: {}}%%{`, `id:%%{init: {}}%% 1`,
  `a -%%{init: {}}%%satisfies -> b`, and `requirementDiagram%%{init: {}}%%`
  followed by a line break are read as without the directive. [fixture:
  requirement/lex-directive-between-name-and-brace] [fixture:
  requirement/lex-directive-after-field-colon] [fixture:
  requirement/lex-directive-between-line-and-relation] [fixture:
  requirement/header-then-directive-same-line]
- In `style r%%{init: {}}%%x fill:red` and `class r c%%{init: {}}%%d`, the
  directive lies inside a name unit, and in `requirement%%{init: {}}%%Diagram`,
  `requ%%{init: {}}%%irement r {`, `te%%{init: {}}%%xt: t`,
  `risk: hi%%{init: {}}%%gh`, `a - sati%%{init: {}}%%sfies -> b`,
  `a - satisfies -%%{init: {}}%%> b`, `r:%%{init: {}}%%::c`,
  `sty%%{init: {}}%%le r fill:red`, `acc%%{init: {}}%%Title: T`,
  `dir%%{init: {}}%%ection LR`, and `direction L%%{init: {}}%%R` inside a
  keyword, a delimiter, or a direction value: the input is rejected, while
  mermaid.js accepts it, reading the two parts as one (see
  [Known divergences](#known-divergences)). [fixture:
  requirement/div-directive-in-style-name] [fixture:
  requirement/div-directive-in-class-name] [fixture:
  requirement/div-directive-in-header-keyword] [fixture:
  requirement/div-directive-in-requirement-keyword] [fixture:
  requirement/div-directive-in-field-keyword] [fixture:
  requirement/div-directive-in-risk-keyword] [fixture:
  requirement/div-directive-in-relationship-keyword] [fixture:
  requirement/div-directive-in-arrow] [fixture:
  requirement/div-directive-in-separator] [fixture:
  requirement/div-directive-in-style-keyword] [fixture:
  requirement/div-directive-in-acc-title-keyword] [fixture:
  requirement/div-directive-in-direction-keyword] [fixture:
  requirement/div-directive-in-direction-value]

**Trivia between units.** The trivia of [common.md](../common.md) meet the units
of this diagram as follows. A lone CR is a line terminator, read as a line feed
(see [Line terminators](../common.md#line-terminators)), and so is CRLF: a
requirement and a `style` statement are read between lone CRs, and a field
between CRLFs, as between line feeds, and a CRLF or a lone CR inside a string is
a line feed of its text. [fixture: requirement/header-crlf] [fixture:
requirement/header-cr-only] [fixture: requirement/lex-cr-only-style] [fixture:
requirement/lex-string-crlf] [fixture: requirement/lex-string-lone-cr] A closed
directive between two units is read as nothing, and the whitespace around it as
the rules of [Units and contexts](#units-and-contexts) read the same text
without the directive, so a space before a directive at the end of a line is a
space before the line break. `id: "1" %%{init: {}}%%`,
`risk: high %%{init: {}}%%`, `requirement r { %%{init: {}}%%`, and
`requirementDiagram %%{init: {}}%%`, each followed by a line break, are
rejected, as those lines with a space at their end are (see
[Detection](#detection)); `risk: high%%{init: {}}%%` and
`requirement r {%%{init: {}}%%`, with no space, `id: 1 %%{init: {}}%%`, whose
unquoted value reads the space, and `} %%{init: {}}%%`,
`class r "c" %%{init: {}}%%`, and a `style` line that ends with a space and a
directive, where no `newline` unit is needed, are accepted. [fixture:
requirement/lex-directive-at-end-of-field-line] [fixture:
requirement/lex-directive-at-end-of-style-line] [fixture:
requirement/header-space-directive-line-feed] [fixture:
requirement/lex-directive-after-string-value-space] [fixture:
requirement/lex-directive-after-risk-space] [fixture:
requirement/lex-directive-after-brace-space] [fixture:
requirement/lex-directive-after-risk-glued] [fixture:
requirement/lex-directive-after-brace-glued] [fixture:
requirement/lex-directive-after-close-brace-space] [fixture:
requirement/lex-directive-after-class-string-space] [fixture:
requirement/lex-directive-after-style-space] An unclosed directive takes the
rest of the text (see
[Where a directive is](../common.md#where-a-directive-is)): `id: 1 %%{init: {}`
inside a body leaves the body unclosed, and the input is rejected, while
`style r fill:red %%{init: {}` followed by more lines has the style `fill:red`,
because the line feed read after the last character leaves the style context.
[fixture: requirement/tokens-unclosed-directive-in-body] [fixture:
requirement/tokens-unclosed-directive-after-style] A comment line is removed
before the lexer reads the text (see
[Comment lines](../common.md#comment-lines)), also inside a body, right after
`{`, inside a description block, between `accTitle:` and its text, between
`direction` and its value, and inside a string over several lines, where it is a
comment region of the string: `text: "a`, a comment line, and `b"` has the text
`a`, a line feed, and `b`. [fixture: requirement/tokens-comment-line-in-body]
[fixture: requirement/tokens-comment-line-after-brace] [fixture:
requirement/tokens-comment-line-in-acc-block] [fixture:
requirement/tokens-comment-line-after-acc-title-colon] [fixture:
requirement/tokens-comment-line-after-direction] [fixture:
requirement/tokens-comment-line-in-string-value] On a line that matches the
`style` rule or the `classDef` rule (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)), the last
`;` is ignored: `style r fill:#f00;` has the style `fill:#f00`, also with a
space after the `;`, `classDef c fill:#f00;` the style `fill:#f00`,
`accTitle: style:#x a;b` the title `style:#x ab`, and so do
`accDescr: style:#x a;b`, the same text in a description block, and the string
value `text: "style:#x a;b"`; `accTitle: style:#x a;b;c;` has the title
`style:#x a;b;c`. With two `;`, only the last is ignored, and `#f00;` is then an
entity, whose placeholder no rule of the style context reads, so
`style r fill:#f00;stroke:#0f0;` is rejected. Inside a text unit an ignored `;`
keeps the reading of mermaid.js too: after the requirement `"style:#x"`,
`"style:#x" - satisfies -> b;c` has the target `bc`, and `class r`, a line
break, and `"style:#x",c;d` gives r the classes `style:#x` and `cd`. Inside any
other unit, a keyword or a delimiter among them, it makes the input rejected,
while mermaid.js reads the two parts as one (see
[Known divergences](#known-divergences)). [fixture:
requirement/tokens-ignored-semicolon-in-name] [fixture:
requirement/tokens-ignored-semicolon-in-class-list-next-line] [fixture:
requirement/tokens-ignored-semicolon-in-style] [fixture:
requirement/tokens-ignored-semicolon-in-acc-title] [fixture:
requirement/tokens-ignored-semicolon-in-style-trailing-space] [fixture:
requirement/tokens-ignored-semicolon-in-classdef] [fixture:
requirement/tokens-ignored-semicolon-in-acc-descr] [fixture:
requirement/tokens-ignored-semicolon-in-acc-descr-block] [fixture:
requirement/tokens-ignored-semicolon-in-string-value] [fixture:
requirement/tokens-ignored-semicolon-last-of-three] [fixture:
requirement/tokens-ignored-semicolon-in-direction-text] [fixture:
requirement/tokens-ignored-semicolon-first-of-two-in-style] [fixture:
requirement/div-ignored-semicolon-in-relationship-keyword]

### The statement context

In the statement context, the lexer tries these rules in order:

1. `title`, one whitespace character, line feeds included, and one or more
   characters other than `#`, line feed, and `;`: a `title` unit, which no rule
   of the grammar takes. [fixture: requirement/lex-title-statement] [fixture:
   requirement/lex-title-line-feed]
2. `accTitle`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accTitle` unit
   and a `:` unit; enters the title context. [fixture:
   requirement/db-acc-title-descr] [fixture: requirement/lex-acc-title-no-space]
   [fixture: requirement/lex-acc-title-line-feed-before-colon]
3. `accDescr`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `:` unit; enters the description context. [fixture:
   requirement/db-acc-title-descr] [fixture:
   requirement/lex-acc-descr-line-feed-before-colon]
4. `accDescr`, zero or more whitespace characters, line feeds included, `{`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `{` unit; enters the description block context. [fixture:
   requirement/db-acc-descr-block] [fixture:
   requirement/lex-acc-descr-block-no-space] [fixture:
   requirement/lex-acc-descr-line-feed-before-brace]
5. A **direction line** (see below). [fixture:
   requirement/spec-requirement-diagram-08cfba06]
6. One or more line feeds: a `newline` unit. [fixture:
   requirement/lex-blank-lines-in-body]
7. One or more whitespace characters, line feeds included: nothing. [fixture:
   requirement/lex-close-brace-trailing-spaces]
8. `#` and the characters up to the next line feed: a diagram comment (see
   [Comments](#comments)). [fixture: requirement/lex-hash-comment-line]
9. `%` and the characters up to the next line feed: a diagram comment. [fixture:
   requirement/lex-percent-comment-line]
10. The keyword `requirementDiagram`: a `header` unit. [fixture:
    requirement/header-only]
11. `{`: a `{` unit. [fixture: requirement/db-requirement-defaults]
12. `}`: a `}` unit. [fixture: requirement/db-requirement-defaults]
13. `:::`: a `:::` unit. [fixture: requirement/db-class-colon-form]
14. `:`: a `:` unit. [fixture: requirement/db-requirement-all-fields]
15. The keywords `id`, `text`, `risk`, and `verifyMethod`; the requirement kinds
    `requirement`, `functionalRequirement`, `interfaceRequirement`,
    `performanceRequirement`, `physicalRequirement`, and `designConstraint`; the
    risks `low`, `medium`, and `high`; the methods `analysis`, `demonstration`,
    `inspection`, and `test`; `element`; the relations `contains`, `copies`,
    `derives`, `satisfies`, `verifies`, `refines`, and `traces`; and `type` and
    `docref`: a unit named by the keyword. [fixture:
    requirement/db-requirement-all-fields] [fixture:
    requirement/db-element-fields] [fixture: requirement/db-relationship-arrows]
16. The keyword `style`: a `style` unit; enters the style context. [fixture:
    requirement/db-style-statement]
17. The keyword `classDef`: a `classDef` unit; enters the style context.
    [fixture: requirement/db-class-def]
18. The keyword `class`: a `class` unit; enters the style context. [fixture:
    requirement/db-class-statement]
19. `<-`: a `<-` unit. [fixture: requirement/db-relationship-arrows]
20. `->`: a `->` unit. [fixture: requirement/db-relationship-arrows]
21. `-`: a `-` unit. [fixture: requirement/db-relationship-arrows]
22. A string or an empty string (see [Strings](#units-and-contexts)). [fixture:
    requirement/db-relationship-quoted-names]
23. An unquoted text (see [Names and values](#units-and-contexts)). [fixture:
    requirement/db-requirement-name-spaces]
24. `,`: a `,` unit. [fixture: requirement/db-class-colon-form]

The units `title` and a `newline` where the grammar does not take one are taken
by no rule of the grammar, so an input with one of them is rejected: `title x`,
`a - satisfies -> title x`, and `title - satisfies -> b` are rejected, and so is
a field after `{` on its line. `;`, `<` alone, and `=` at the start of a unit
are read by no rule: `;` on a line of its own and `a < b` are rejected.
[fixture: requirement/lex-title-statement] [fixture:
requirement/lex-title-after-arrow] [fixture:
requirement/lex-title-before-relationship] [fixture:
requirement/gram-requirement-field-after-brace] [fixture:
requirement/lex-semicolon-line] [fixture: requirement/lex-less-than-alone] Some
consequences of the order:

- A keyword is a keyword wherever a unit starts, and a name or a value may not
  start with one: `requirement test req {`, `text: test`, `text: high risk`, and
  `a - satisfies -> element` are rejected, while `test_x` and `tests` are a name
  and a value. [fixture: requirement/lex-name-starts-with-keyword] [fixture:
  requirement/lex-value-keyword] [fixture:
  requirement/lex-value-keyword-then-words] [fixture:
  requirement/lex-target-keyword] [fixture:
  requirement/lex-name-keyword-underscore] [fixture:
  requirement/lex-value-keyword-prefix]
- Rule 1 needs a character after the whitespace that is no `#`, line feed, or
  `;`, and reads the rest of the line: `requirement title page {` is rejected,
  `title` followed by a line feed and a line `x - satisfies -> b` is one `title`
  unit and rejected, while `title #c - satisfies -> b` is a relationship from
  the name `title #c`, `title ;x - satisfies -> b` one from `title ;x`,
  `titles - satisfies -> b` one from `titles`, and `title` as the last name of
  the text a name. The `title` in the frontmatter is the title of the diagram.
  [fixture: requirement/lex-name-starts-with-title] [fixture:
  requirement/lex-title-line-feed] [fixture: requirement/lex-title-then-hash]
  [fixture: requirement/lex-title-then-semicolon] [fixture:
  requirement/lex-name-titles] [fixture: requirement/lex-title-as-last-name]
  [fixture: requirement/db-frontmatter-title]
- Rules 8 and 9 apply only where a unit starts, after rule 7: a `#` or a `%`
  inside an unquoted text is a character of it (see
  [Names and values](#units-and-contexts)), and inside a string too.

**Keywords and what follows them.** A keyword ends at a word boundary, so an
ASCII digit, letter, or `_` after it continues an unquoted text, while a letter
outside ASCII, which is no word character, ends the keyword and is then read by
no rule: `requirementé r {` is rejected. [fixture:
requirement/lex-name-keyword-underscore] [fixture:
requirement/lex-keyword-then-e-acute]

**The direction line.** Compared case-insensitively: from the current position,
a run of characters without line feeds, U+2028, or U+2029, the longest one that
the rest can follow; then `direction`; then one or more whitespace characters,
line feeds included; then one of `TB`, `BT`, `RL`, and `LR`, tried in this
order; and then every character up to the next line feed. The rule reads
`direction` as a `direction` unit, the value as a `direction-value` unit, and
the characters before `direction` and after the value as `direction-text` units,
which mermaid.js does not read. The rule is tried before every rule but rules 1
to 4, so it takes the whole line, a string on it included, while a line that
rule 1 reads is a `title` unit: `title direction LR` is rejected, and so is
`requirement "direction LR" {`; `foo direction LR bar` and `mydirection RL` are
direction lines, `a - satisfies -> direction LR` sets the direction and has no
relationship, `classDef a direction LR` defines no class, and
`requirement direction LR {` is a direction line, after which the `}` on the
next line closes nothing; `accTitle: direction LR` is a title, and a block
`accDescr {`, `direction LR`, and `}` on three lines has the description
`direction LR`. A direction line inside a body takes its whole line:
`text: direction TB` in a body, and `} direction LR` at its end, are direction
lines, which no body takes, and the input is rejected. The rule also comes
before the comment rules: `% direction LR` and `# c direction LR` set the
direction, while a comment line `%% direction LR` is removed before the lexer
reads the text. Neither does the value need to end at a word boundary:
`direction LRX` sets `LR`, with `X` as a `direction-text` unit, and
`direction LR %% c` sets `LR` with the text `%% c`. The values are tried in the
order given: if the line has `direction`, whitespace, and `TB` anywhere, the
value is `TB`, so `direction LR x direction TB` sets `TB`; otherwise `BT` is
tried, and so on. For a value, the lexer takes the last `direction` of the run
that the value follows: `direction BT x direction BT` is read at its last
`direction`, with `direction BT x` as a `direction-text` unit. [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/lex-title-direction] [fixture:
requirement/lex-direction-line-in-string-name] [fixture:
requirement/lex-direction-line-word-before] [fixture:
requirement/lex-direction-in-relationship-line] [fixture:
requirement/lex-direction-line-before-classdef] [fixture:
requirement/lex-direction-line-in-requirement-name] [fixture:
requirement/lex-acc-title-direction] [fixture:
requirement/lex-acc-descr-block-direction] [fixture:
requirement/lex-direction-in-body] [fixture:
requirement/lex-direction-after-close-brace] [fixture:
requirement/lex-direction-in-percent-comment] [fixture:
requirement/lex-direction-in-hash-comment] [fixture:
requirement/lex-direction-in-comment-line] [fixture:
requirement/lex-direction-value-suffix] [fixture:
requirement/lex-direction-line-percent] [fixture:
requirement/lex-direction-tb-first] [fixture:
requirement/lex-direction-line-same-value-twice] [fixture:
requirement/db-direction-lower-case] [fixture:
requirement/lex-direction-upper-case] The whitespace between `direction` and its
value may hold a line feed, an empty line, a tab, or a U+2028, while the run
before `direction` may not hold a U+2028: `a`, U+2028, and `direction LR` is one
unquoted text, which is no statement, and is rejected. The text after the value
may hold a U+2028. `direction` alone on its line, with no value, and
`directionLR` are names, and rejected. [fixture:
requirement/lex-direction-line-feed-before-value] [fixture:
requirement/lex-direction-blank-line-before-value] [fixture:
requirement/lex-direction-tab-before-value] [fixture:
requirement/lex-direction-value-line-separator] [fixture:
requirement/lex-line-separator-before-direction] [fixture:
requirement/lex-line-separator-after-direction-value] [fixture:
requirement/lex-direction-without-value] [fixture:
requirement/lex-direction-glued]

### The style context

The style context is entered by `style`, `classDef`, and `class`. It reads the
names, the classes, and the styles of the statement:

1. One or more ASCII word characters: a `style-word` unit. [fixture:
   requirement/db-style-statement]
2. `:`: a `style-colon` unit. [fixture: requirement/db-style-statement]
3. `;`: a `style-semicolon` unit. [fixture: requirement/lex-style-semicolon]
4. `%`: a `style-percent` unit, which no rule of the grammar takes. [fixture:
   requirement/lex-style-percent]
5. `-`: a `style-dash` unit. [fixture:
   requirement/spec-requirement-diagram-5305b791]
6. `#`: a `style-hash` unit. [fixture: requirement/db-style-statement]
7. A space: nothing. [fixture: requirement/lex-style-two-spaces]
8. A string or an empty string (see [Strings](#units-and-contexts)). [fixture:
   requirement/lex-style-string-name]
9. A line feed: nothing; leaves the style context. [fixture:
   requirement/lex-style-blank-line-after]
10. `,`: a `,` unit. [fixture: requirement/db-style-statement]

The units of rules 2 to 6 have names of their own, apart from the `:` and `-`
units of the statement context, so the grammar reads a style from units of the
style context only (see [Styles and classes](#styles-and-classes)): a `:` or a
`-` on the line after a style is no part of it. [fixture:
requirement/lex-style-colon-next-line] [fixture:
requirement/lex-style-dash-next-line] A tab, every other whitespace character,
`.`, a letter outside ASCII, and every other character are read by no rule:
`style r\tfill:red`, `opacity:0.5`, and `fill:é` are rejected, and so is
`style r accDescr {} fill:red`, as the style context has no rule for
`accDescr {`. Only rule 9 leaves the style context, also after a string that
ends a class statement, and after a string that follows the styles of a `style`
or a `classDef` statement and starts the next statement, so
`class r "c" accDescr {}`, `style r fill:red "a" accDescr {}`, and
`class r "c" #x` are read in the style context, where `accDescr` is a
`style-word` and `#` a `style-hash` unit, which no class statement takes, and
are rejected. The line feed that leaves the context is no unit, so the statement
may go on on the next line in the statement context: `class r`, a line break,
and `c` gives r the class c, and so do `class r,e`, a line break, and `c,d`, and
`class`, a line break, and `"r" "c"`. A string after the styles or the classes
starts the next statement, which the next line may continue:
`style r fill:red "r"`, a line break, and `:::c` gives r the class c, and
`style r fill:red "a"`, a line break, and `- satisfies -> b` is a relationship
from a to b, while `style r fill:red "a"` at the end of the text is rejected.
`style`, a line break, and `r fill:red` is rejected, because the styles can only
be read in the style context. The second line feed of an empty line is a
`newline` unit. [fixture: requirement/lex-style-tab] [fixture:
requirement/lex-style-dot] [fixture: requirement/lex-style-non-ascii] [fixture:
requirement/lex-style-empty-description-block] [fixture:
requirement/lex-class-string-then-empty-description-block] [fixture:
requirement/lex-style-string-then-empty-description-block] [fixture:
requirement/lex-class-string-hash] [fixture:
requirement/lex-classdef-string-then-empty-description-block] [fixture:
requirement/lex-class-list-next-line] [fixture:
requirement/lex-class-list-comma-next-line] [fixture:
requirement/lex-class-strings-next-line] [fixture:
requirement/lex-style-string-then-shorthand] [fixture:
requirement/lex-class-string-then-shorthand] [fixture:
requirement/lex-style-string-then-relationship] [fixture:
requirement/lex-style-string-alone] [fixture:
requirement/lex-style-keyword-line-feed] [fixture:
requirement/lex-style-blank-line-after] [fixture:
requirement/lex-style-trailing-spaces]

### Accessibility values

In the title context, zero or more characters other than line feed are a
`title-text` unit, and the context is left; the description context reads a
`description-text` unit in the same way. The whitespace after the `:`, line
feeds included, is read with the `:` unit (rules 2 and 3 of the statement
context), so the text starts at the first character that is not whitespace,
which may be on a later line: `accTitle:`, a line break, and `T` has the title
`T`. At the end of the text the input is rejected (see
[Units and contexts](#units-and-contexts)). `;`, `#`, and `%%` are characters of
the text: `accTitle: a;b #c %% d` has the title `a;b #c %% d`. The whitespace at
the end of the text is read into the unit and left out of the value (see
[RequirementLiteral](../ast/requirement.md#requirementliteral)). An `accTitle`
line may start wherever a statement starts: right after `}`, after a directive,
and after a comment line. [fixture: requirement/db-acc-title-descr] [fixture:
requirement/gram-acc-title-line-feed-then-text] [fixture:
requirement/lex-acc-title-semicolon-hash-percent] [fixture:
requirement/lex-acc-title-after-close-brace] [fixture:
requirement/lex-acc-title-after-directive] [fixture:
requirement/lex-acc-title-after-comment-line]

In the description block context, `}` is a `}` unit and leaves the context, and
one or more characters other than `}`, line feeds included, are a
`description-block-text` unit. The whitespace after `{`, line feeds included, is
read with the `{` unit (rule 4 of the statement context), so the text starts at
the first character that is not whitespace, and `accDescr {}`, and a block whose
braces hold only a directive or only a comment line, have no text and make no
token in mermaid.js: an **empty description block** (see
[Empty description blocks](#empty-description-blocks)). The text runs to the
first `}`: `accDescr { a {b }` has the description `a {b`. [fixture:
requirement/db-acc-descr-block] [fixture:
requirement/gram-acc-descr-block-empty] [fixture:
requirement/gram-acc-descr-block-directive-only] [fixture:
requirement/gram-acc-descr-block-comment-line-only] [fixture:
requirement/lex-acc-descr-block-brace-in-text] [fixture:
requirement/lex-acc-descr-block-unclosed]

The rules that enter these contexts are rules of the statement context only; in
the style context, `accDescr` is a `style-word` (see
[The style context](#the-style-context)). [fixture:
requirement/lex-style-empty-description-block]

### Comments

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line and that mermaid.js reads as nothing. They are not the comment lines
of [common.md](../common.md#comment-lines), which are removed before the lexer
reads the text; a diagram comment can start in the middle of a line, and a line
`%%` alone, `% c`, or `%%{ }%%` after the header is a diagram comment, not a
comment line. [fixture: requirement/lex-hash-comment-line] [fixture:
requirement/lex-percent-comment-line] [fixture:
requirement/lex-bare-percent-line-after-statement] [fixture:
requirement/lex-percent-brace-line]

A diagram comment starts where a unit starts in the statement context, at a `#`
(rule 8) or at a `%` (rule 9), and runs to the line feed, which is not part of
it: after the header, after `{`, after `}`, after a string value or a keyword
value, and after a string target of a relationship. [fixture:
requirement/header-hash-comment] [fixture: requirement/header-percent-comment]
[fixture: requirement/lex-hash-comment-after-brace] [fixture:
requirement/lex-percent-comment-after-brace] [fixture:
requirement/lex-hash-comment-after-close-brace] [fixture:
requirement/lex-percent-comment-after-string-value] [fixture:
requirement/lex-hash-comment-after-risk] [fixture:
requirement/lex-percent-comment-after-verify-method] [fixture:
requirement/lex-hash-comment-after-string-target] The **mark** of a diagram
comment is `#` when it starts with `#`, `%%` when it starts with `%%`, and `%`
otherwise, and its value is the text after the mark: the value of `# c` is a
space and `c`, that of `% c` the same, that of `%%` alone is empty, and that of
`%%{ }%%` is `{ }%%`. The mark is found in the text without directives, as the
lexer reads it, and the value is the source text after the mark, directives
included, as for a comment line. A `#` or a `%` inside an unquoted text or a
string, and in the style context, starts no comment: in the style context `#` is
a `style-hash` unit, which a style takes and a class statement does not, so
`class r c #x` is rejected (see [The style context](#the-style-context)), while
after `r:::"c"`, in the statement context, `#x` is a comment. [fixture:
requirement/lex-name-percent] [fixture: requirement/lex-value-hash] [fixture:
requirement/lex-string-hash-percent] [fixture:
requirement/lex-style-hash-after-style] [fixture:
requirement/lex-class-hash-after-classes] [fixture:
requirement/lex-hash-comment-after-shorthand-string-class]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `unquoted-text`, stands for one unit
with that name, and text in double quotes stands for the unit named by that
text, such as `"element"` or `"{"`. The grammar is a restatement of the grammar
in
[`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L107-L267)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in
[ast/requirement.md](../ast/requirement.md):

| Rule                                                                                                      | Node                                                                                             |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `diagram`                                                                                                 | RequirementDiagram                                                                               |
| `requirement-statement`                                                                                   | RequirementRequirementStatement; the items of its `requirement-body` are the `body` list         |
| `requirement-field`                                                                                       | RequirementValueField, RequirementRiskField, or RequirementVerifyMethodField                     |
| `element-statement`                                                                                       | RequirementElementStatement; the items of its `element-body` are the `body` list                 |
| `element-field`                                                                                           | RequirementElementField                                                                          |
| `relationship-statement`                                                                                  | RequirementRelationshipStatement                                                                 |
| `direction-statement`                                                                                     | RequirementDirectionStatement, with a RequirementIgnoredText for each `direction-text`           |
| `style-statement`                                                                                         | RequirementStyleStatement                                                                        |
| `class-def-statement`                                                                                     | RequirementClassDefStatement                                                                     |
| `class-statement`                                                                                         | RequirementClassStatement                                                                        |
| `class-shorthand-statement`                                                                               | RequirementClassShorthandStatement                                                               |
| `accessibility-statement`                                                                                 | RequirementAccTitleStatement, RequirementAccDescrStatement, or RequirementAccDescrBlockStatement |
| `empty-description-block` where a statement starts                                                        | RequirementAccDescrBlockStatement without text, a statement of its own                           |
| `empty-description-block` in a body                                                                       | RequirementIgnoredText, an item of the `body` list                                               |
| `string`                                                                                                  | StringLiteral                                                                                    |
| `unquoted-text` that is a name, or `style-word` that is a name                                            | RequirementIdentifier                                                                            |
| `unquoted-text` that is a value, `style-item`, `title-text`, `description-text`, `description-block-text` | RequirementLiteral                                                                               |
| `direction-text`                                                                                          | RequirementIgnoredText                                                                           |

### Diagram and statements

```text
diagram   = "header" empty-description-block* newline line*
line      = statement | newline
statement = requirement-statement
          | element-statement
          | relationship-statement
          | direction-statement
          | style-statement
          | class-def-statement
          | class-statement
          | class-shorthand-statement
          | accessibility-statement
          | empty-description-block
name      = unquoted-text | string
```

Nothing separates two statements: a statement may follow another on the same
line where the units allow it, and a `newline` unit between them is a `line` of
its own. A statement may follow `}` on its line, with whitespace or without:
`} element e {` and `}element e {` are accepted. After an unquoted text, nothing
may follow on its line but what ends the text: `id: 1 text: t` is the value
`1 text` followed by a `:`, and is rejected, and
`a - satisfies -> b - traces -> c` is rejected, as no statement starts with `-`.
The grammar of mermaid.js has no rule for a `title` statement, and its lexer
reads `title` with the text after it as a unit that the grammar does not take
(rule 1 of [The statement context](#the-statement-context)). [fixture:
requirement/lex-statement-after-close-brace] [fixture:
requirement/lex-statement-glued-after-close-brace] [fixture:
requirement/lex-two-fields-on-a-line] [fixture:
requirement/lex-relationship-chain] [fixture:
requirement/lex-statement-after-class-same-line] [fixture:
requirement/lex-title-statement]

### Requirements

```text
requirement-statement = requirement-kind name class-list? requirement-body
requirement-kind      = "requirement" | "functionalRequirement"
                      | "interfaceRequirement" | "performanceRequirement"
                      | "physicalRequirement" | "designConstraint"
class-list            = ":::" name ( "," name )*
requirement-body      = "{" empty-description-block* newline requirement-line*
                        empty-description-block* "}"
requirement-line      = empty-description-block* requirement-field?
                        empty-description-block* newline
requirement-field     = ( "id" | "text" ) ":" field-value
                      | "risk" ":" ( "low" | "medium" | "high" )
                      | "verifyMethod" ":"
                        ( "analysis" | "demonstration" | "inspection" | "test" )
field-value           = unquoted-text | string
```

A requirement statement adds the requirement when the Db has none with its name,
with its kind and the values of its fields; a second statement with the same
name adds nothing and changes no field, and of a field written twice the first
counts. The classes after `:::` are given to the name in every case, as a class
statement gives them (see [Styles and classes](#styles-and-classes)), so the
classes of a second statement go to the first requirement. The kinds are read as
`Requirement`, `Functional Requirement`, and so on, the risks as `Low`,
`Medium`, and `High`, and the methods as `Analysis`, `Demonstration`,
`Inspection`, and `Test`, whatever the case in which they are written. A field
that is not written is the empty string. `__proto__` and `constructor` are names
like any other. [fixture: requirement/db-requirement-all-fields] [fixture:
requirement/db-requirement-defaults] [fixture:
requirement/db-requirement-name-repeated] [fixture:
requirement/db-requirement-fields-repeated] [fixture:
requirement/db-requirement-second-definition-classes] [fixture:
requirement/db-keywords-upper-case] [fixture:
requirement/lex-risk-method-mixed-case] [fixture:
requirement/spec-requirement-diagram-f221edee] [fixture:
requirement/spec-requirement-diagram-06f108a7] [fixture:
requirement/spec-requirement-diagram-7e4de658] [fixture:
requirement/spec-requirement-diagram-dec8a0d9] [fixture:
requirement/spec-requirement-diagram-29c59902]

- The `{` follows the name or the classes on their line, with whitespace or
  without, and a `newline` unit follows the `{`: `requirement r{` is accepted,
  while `requirement r` followed by `{` on the next line, `requirement r {}`,
  and `requirement r { id: 1` are rejected. A comment may stand between `{` and
  its line feed. [fixture: requirement/gram-requirement-brace-glued] [fixture:
  requirement/gram-requirement-brace-next-line] [fixture:
  requirement/gram-requirement-braces-one-line] [fixture:
  requirement/gram-requirement-field-after-brace] [fixture:
  requirement/lex-hash-comment-after-brace]
- Each field stands on a line of its own and is followed by a `newline` unit;
  the `}` stands where a field could start: `id: 1 }` holds the `}` in its value
  and leaves the body unclosed. Empty lines may stand between the fields.
  [fixture: requirement/gram-requirement-close-after-value] [fixture:
  requirement/lex-blank-lines-in-body]
- The value of `id` and `text` is an unquoted text or a string; a value is
  needed: `text:` alone is rejected. The value of `risk` and `verifyMethod` is
  one of their keywords, not a string: `risk: extreme`, `risk: "high"`, and
  `verifymethod: guess` are rejected. The fields of an element are no fields of
  a requirement: `type: t` in a requirement is rejected. [fixture:
  requirement/gram-requirement-value-empty] [fixture:
  requirement/gram-requirement-risk-unknown] [fixture:
  requirement/gram-requirement-risk-quoted] [fixture:
  requirement/gram-requirement-verify-method-unknown] [fixture:
  requirement/gram-requirement-element-field]
- The classes after `:::` are unquoted texts or strings separated by `,`; an
  unquoted class ends at the `{` and may hold spaces: `requirement r:::a,b {`,
  `requirement r ::: c {`, `requirement r:::c{`, `requirement r:::a b {`, and
  `requirement r:::"a b" {` are accepted. [fixture:
  requirement/db-class-in-definition] [fixture:
  requirement/gram-requirement-separator-spaced] [fixture:
  requirement/gram-requirement-separator-glued-brace] [fixture:
  requirement/gram-requirement-class-space] [fixture:
  requirement/gram-requirement-class-string]

### Elements

```text
element-statement = "element" name class-list? element-body
element-body      = "{" empty-description-block* newline element-line*
                    empty-description-block* "}"
element-line      = empty-description-block* element-field?
                    empty-description-block* newline
element-field     = ( "type" | "docref" ) ":" field-value
```

An element statement adds the element when the Db has none with its name, with
the values of its fields, and gives its classes to the name as a class statement
does (see [Styles and classes](#styles-and-classes)); the body is read as the
body of a requirement. A requirement and an element may have the same name.
`id: 1` in an element is rejected, a `docref` may be a string with `:` inside
it, and an unquoted `docref` ends at `-`. [fixture:
requirement/db-element-fields] [fixture: requirement/db-element-defaults]
[fixture: requirement/db-element-name-repeated] [fixture:
requirement/db-element-fields-repeated] [fixture:
requirement/db-requirement-and-element-same-name] [fixture:
requirement/db-element-definition-with-class-of-requirement] [fixture:
requirement/gram-element-requirement-field] [fixture:
requirement/gram-element-docref-quoted-url] [fixture:
requirement/gram-element-docref-dash]

### Relationships

```text
relationship-statement = name "-" relation "->" name
                       | name "<-" relation "-" name
relation               = "contains" | "copies" | "derives" | "satisfies"
                       | "verifies" | "refines" | "traces"
```

A relationship statement adds the relationship, from the left name to the right
one for `-` and `->`, and from the right name to the left one for `<-` and `-`;
the names need not be those of a requirement or an element, and a relationship
written twice is added twice. The units need no whitespace between them:
`a-satisfies->b` and `a<-satisfies-b` are relationships. `a - likes -> b`,
`a - satisfies - > b`, and `- satisfies -> b` are rejected. [fixture:
requirement/db-relationship-arrows] [fixture:
requirement/db-relationship-undefined-names] [fixture:
requirement/db-relationships-repeated] [fixture:
requirement/gram-relationship-glued] [fixture:
requirement/gram-relationship-backward-glued] [fixture:
requirement/gram-relationship-unknown] [fixture:
requirement/gram-relationship-split-arrow] [fixture:
requirement/gram-relationship-no-source]

### Styles and classes

```text
direction-statement       = direction-text? "direction" "direction-value" direction-text?
style-statement           = "style" style-names styles
class-def-statement       = "classDef" style-names styles
style-names               = style-name ( "," style-name )*
style-name                = style-word | string
styles                    = style-item ( "," style-item )*
style-item                = ( style-word | style-colon | style-semicolon | style-dash | style-hash )+
class-statement           = "class" class-names class-names
class-names               = class-name ( "," class-name )*
class-name                = style-word | unquoted-text | string
class-shorthand-statement = name ":::" name ( "," name )*
accessibility-statement   = "accTitle" ":" title-text
                          | "accDescr" ":" description-text
                          | "accDescr" "{" description-block-text "}"
```

- A direction statement sets the direction of the diagram; the last one counts.
  [fixture: requirement/spec-requirement-diagram-7522200d] [fixture:
  requirement/spec-requirement-diagram-6d165a76] [fixture:
  requirement/spec-requirement-diagram-34fcfcee] [fixture:
  requirement/db-direction-last-wins]
- In a `style` and a `classDef` statement, the names end at the first unit that
  no `,` precedes; the styles then follow, and at least one is needed. A style
  is the `style-word`, `style-colon`, `style-semicolon`, `style-dash`, and
  `style-hash` units up to the next `,` or the line feed that leaves the style
  context, and its value is their texts joined (see
  [RequirementLiteral](../ast/requirement.md#requirementliteral)):
  `style r fill: red , stroke : blue` has the styles `fill:red` and
  `stroke:blue`, `style r fill:red stroke:blue` the one style
  `fill:redstroke:blue`, `style r fill:red;` the style `fill:red;`,
  `style r fill:red #c` the style `fill:red#c`, `style r 4px` the style `4px`,
  and `style r-x fill:red` the name r with the style `-xfill:red`. A name may be
  a string, with a style after it with whitespace or without. `style r`,
  `classDef c`, `style r fill:red,`, `style r width:50%`, and
  `style r fill:"red x"` are rejected. As no style unit is read after the line
  feed that leaves the style context (rule 9 of
  [The style context](#the-style-context)), and a name after `style` or
  `classDef` is a `style-word` or a string, `style r fill:red`, a line break,
  and `: x - satisfies -> y`, `style "r"`, a line break, and the same line,
  `classDef c fill:red`, a line break, and `,stroke:blue`, and `style r`, a line
  break, and `,e fill:red` are rejected. [fixture:
  requirement/lex-style-colon-next-line] [fixture:
  requirement/lex-style-string-name-colon-next-line] [fixture:
  requirement/lex-classdef-comma-next-line] [fixture:
  requirement/lex-style-names-comma-next-line] [fixture:
  requirement/db-style-statement] [fixture:
  requirement/spec-requirement-diagram-5305b791] [fixture:
  requirement/lex-style-spaces] [fixture: requirement/lex-style-no-comma]
  [fixture: requirement/lex-style-semicolon] [fixture:
  requirement/lex-style-hash-after-style] [fixture:
  requirement/lex-style-digit-start] [fixture:
  requirement/lex-style-dash-after-name] [fixture:
  requirement/lex-style-string-name] [fixture:
  requirement/lex-style-string-name-glued] [fixture:
  requirement/lex-style-string-name-line-feed] [fixture:
  requirement/lex-classdef-string-name] [fixture:
  requirement/lex-style-without-style] [fixture:
  requirement/lex-classdef-without-style] [fixture:
  requirement/lex-style-trailing-comma] [fixture: requirement/lex-style-percent]
  [fixture: requirement/lex-style-string]
- A `style` statement adds its styles to the requirement of each name, or to the
  element of that name when there is no requirement, up to the first name that
  is neither; the names after it get none. A `classDef` statement defines its
  classes, or adds the styles to a class that is defined, and adds them to every
  requirement and element that the Db has with the class at that point. Every
  requirement and element has the class `default` from the start, so
  `classDef default fill:red` styles those that the Db has at that point.
  [fixture: requirement/db-style-unknown-name] [fixture:
  requirement/db-requirement-and-element-same-name] [fixture:
  requirement/db-class-def] [fixture: requirement/db-class-statement-before-def]
  [fixture: requirement/db-class-def-default-all]
- A `class` statement is two lists of names separated by `,`: the names of
  requirements or elements, and the classes. The first list ends at the first
  name that no `,` precedes, and the second at a `newline` unit or at a unit
  that is no `,` or name: `class r,e a,b`, `class r , e c`, and `class r "my c"`
  are accepted, and `class r` and `class r c d` are rejected. The line feed that
  leaves the style context is no unit (see
  [The style context](#the-style-context)), so after it a name or a `,` of the
  statement context continues a list: `class r c`, a line break, and `,d`,
  `, d`, or `,"d"` gives r the classes c and d, while in `class r`, a line
  break, `c`, a line break, and `,d` the line feed after `c` is a `newline`
  unit, which ends the statement, and the input is rejected. [fixture:
  requirement/lex-class-second-list-comma-next-line] [fixture:
  requirement/lex-class-second-list-comma-space-next-line] [fixture:
  requirement/lex-class-second-list-string-next-line] [fixture:
  requirement/lex-class-second-list-after-newline] The statement adds the
  classes, with the styles that each has at that point, to the requirement of
  each name, or to the element of that name when there is no requirement; a name
  that is neither changes nothing. A class shorthand statement, and the classes
  after `:::` in a requirement or an element statement, do the same for one
  name. [fixture: requirement/db-class-statement] [fixture:
  requirement/gram-class-comma-spaces] [fixture:
  requirement/gram-class-string-class] [fixture: requirement/lex-class-one-list]
  [fixture: requirement/lex-class-three-lists] [fixture:
  requirement/lex-class-list-next-line] [fixture:
  requirement/db-class-statement-unknown-name-first] [fixture:
  requirement/db-class-styles-order] [fixture:
  requirement/db-class-styles-order-defined-first] [fixture:
  requirement/db-class-colon-form] [fixture:
  requirement/gram-class-shorthand-spaced] [fixture:
  requirement/db-class-shorthand-requirement-and-element]
- An accessibility statement sets the title or the description; the last one
  counts, a description line after a description block as well as a block after
  a line. An empty description block changes nothing. [fixture:
  requirement/db-acc-title-descr] [fixture: requirement/db-acc-descr-block]
  [fixture: requirement/db-acc-descr-block-then-line] [fixture:
  requirement/db-acc-descr-line-then-block]

### Empty description blocks

```text
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `description-block-text` unit. mermaid.js reads
no token for it. It is a description block statement without text, which changes
nothing, wherever a statement starts in the statement context, as at the start
of a line, right after the header, and right after a statement that ends with
`}` or with a string, such as `a - satisfies -> "b" accDescr {}` and
`r:::"c" accDescr {}`. Only the statement context reads `accDescr {` (see
[Accessibility values](#accessibility-values)): after a class statement that
ends with a string the lexer is still in the style context (see
[The style context](#the-style-context)), and after `accTitle:` or a direction
value the block is text, as in `accTitle: T accDescr {}`, which has the title
`T accDescr {}`, and `direction LR accDescr {}`. On a line of the body of a
requirement or an element, it is an item of the body, which mermaid.js does not
read: right after `{`, before a field, after a field whose value is a string or
a keyword, before `}`, and alone on its line, also over several lines and with a
comment line inside, and two of them are two items. After an unquoted name or
value it is part of the text, which ends at its `{` (see
[Names and values](#units-and-contexts)): `requirement r accDescr {} {` is the
name `r accDescr` followed by `{` and `}`, and is rejected. Elsewhere a block
lies inside a statement, between two of its units, that is, where a unit of the
statement before it follows it, and the tree has no place for it there, and the
input is rejected, while mermaid.js reads no token for it and accepts the input
(see [Known divergences](#known-divergences)), as after `requirement` or
`element`, between a string name and `:::` or `{`, after `:::` or a `,` of the
classes, between a string class and the `,` or the `{` after it, between the
name of a field and its `:`, between the `:` and the value, and between two
units of a relationship. So `r:::"a" accDescr {} ,b`, `class r`, a line break,
and `"c" accDescr {} ,d`, and `class r`, a line break, and `accDescr {} c` are
rejected, as `,b`, `,d`, and the class `c` continue the statement, while
`class r`, a line break, and `"c" accDescr {}`, and `style r fill:red`, a line
break, and `accDescr {}`, after which nothing of the statement follows, have the
block as a statement. A block after an unquoted class, or after an unquoted
source of a relationship, is part of the text, as above. [fixture:
requirement/div-empty-description-block-before-shorthand-class-comma] [fixture:
requirement/div-empty-description-block-before-class-comma-next-line] [fixture:
requirement/div-empty-description-block-before-class-next-line] [fixture:
requirement/gram-empty-description-block-after-class-string-next-line] [fixture:
requirement/gram-empty-description-block-after-style-line] [fixture:
requirement/div-empty-description-block-between-keyword-and-name] [fixture:
requirement/div-empty-description-block-after-class-separator] [fixture:
requirement/div-empty-description-block-after-shorthand-separator] [fixture:
requirement/div-empty-description-block-before-brace] [fixture:
requirement/div-empty-description-block-before-field-colon] [fixture:
requirement/div-empty-description-block-after-field-colon] [fixture:
requirement/div-empty-description-block-before-risk] [fixture:
requirement/div-empty-description-block-before-element-value] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/div-empty-description-block-before-arrow] [fixture:
requirement/div-empty-description-block-after-arrow] [fixture:
requirement/div-empty-description-block-in-backward-relationship] [fixture:
requirement/div-empty-description-block-after-string-source] [fixture:
requirement/gram-acc-descr-block-empty] [fixture:
requirement/header-empty-description-block] [fixture:
requirement/gram-empty-description-block-after-close-brace] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/gram-empty-description-block-after-brace] [fixture:
requirement/gram-empty-description-block-before-field] [fixture:
requirement/gram-empty-description-block-after-string-value] [fixture:
requirement/gram-empty-description-block-before-close-brace] [fixture:
requirement/gram-empty-description-block-in-element-body] [fixture:
requirement/gram-empty-description-block-space-in-body] [fixture:
requirement/gram-empty-description-blocks-adjacent-in-body] [fixture:
requirement/gram-empty-description-block-multiline-in-body] [fixture:
requirement/gram-empty-description-block-comment-line-in-body] [fixture:
requirement/gram-empty-description-block-multiline-after-string-value] [fixture:
requirement/lex-name-then-empty-description-block] [fixture:
requirement/gram-empty-description-block-after-string-target] [fixture:
requirement/lex-class-string-then-empty-description-block] [fixture:
requirement/lex-acc-title-empty-description-block] [fixture:
requirement/lex-direction-line-empty-description-block] [fixture:
requirement/gram-empty-description-block-after-shorthand-string-class] [fixture:
requirement/gram-empty-description-block-after-keyword-value] [fixture:
requirement/div-empty-description-block-before-class-separator] [fixture:
requirement/div-empty-description-block-before-shorthand-separator] [fixture:
requirement/div-empty-description-block-after-string-class] [fixture:
requirement/div-empty-description-block-after-string-class-before-brace]
[fixture: requirement/div-empty-description-block-after-class-comma] [fixture:
requirement/div-empty-description-block-between-element-keyword-and-name]
[fixture: requirement/lex-class-then-empty-description-block] [fixture:
requirement/lex-source-then-empty-description-block]

### Rejections outside the grammar

None. The Db of this diagram throws for no input, so every input that the
grammar accepts is accepted.

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a unit other than a text unit and a string unit makes the
  input rejected in this specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): inside a name or a class
  after `style`, `classDef`, or `class`, a keyword, an arrow, `:::`,
  `direction`, or a direction value. [fixture:
  requirement/div-directive-in-style-name] [fixture:
  requirement/div-directive-in-class-name] [fixture:
  requirement/div-directive-in-header-keyword] [fixture:
  requirement/div-directive-in-requirement-keyword] [fixture:
  requirement/div-directive-in-field-keyword] [fixture:
  requirement/div-directive-in-risk-keyword] [fixture:
  requirement/div-directive-in-relationship-keyword] [fixture:
  requirement/div-directive-in-arrow] [fixture:
  requirement/div-directive-in-separator] [fixture:
  requirement/div-directive-in-style-keyword] [fixture:
  requirement/div-directive-in-acc-title-keyword] [fixture:
  requirement/div-directive-in-direction-keyword] [fixture:
  requirement/div-directive-in-direction-value]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule or the `classDef` rule, an ignored `;`
  inside a unit other than a text unit and a string unit makes the input
  rejected here, while mermaid.js removes the `;` and reads the parts as one:
  after the requirement `"style:#x"`, `"style:#x" - sati;sfies -> b` is a
  relationship with the relation `satisfies` in mermaid.js. Inside a text unit,
  an unquoted name among them, the reading of mermaid.js is kept:
  `"style:#x" - satisfies -> b;c` is a relationship to `bc` in both. [fixture:
  requirement/div-ignored-semicolon-in-relationship-keyword] [fixture:
  requirement/tokens-ignored-semicolon-in-name] [fixture:
  requirement/tokens-ignored-semicolon-in-acc-title] [fixture:
  requirement/tokens-ignored-semicolon-in-direction-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `text: "b="c">d"` has the text `b='c'>d`
  in mermaid.js, while here the string ends at its second `"`, and the input is
  rejected. [fixture: requirement/div-html-tag-starts-in-frontmatter-string]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: requirement/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty description block inside a statement, and an empty string wherever it
  stands, make the input rejected in this specification, while mermaid.js reads
  no token for them and accepts the input (see [Strings](#units-and-contexts)
  and [Empty description blocks](#empty-description-blocks)). Where a statement
  starts, an empty description block is a statement, and on a line of a body an
  item of the body, and the input is accepted. [fixture:
  requirement/div-empty-description-block-between-keyword-and-name] [fixture:
  requirement/div-empty-description-block-before-field-colon] [fixture:
  requirement/div-empty-description-block-in-relationship] [fixture:
  requirement/div-empty-string-line] [fixture:
  requirement/div-empty-string-body-line] [fixture:
  requirement/div-empty-string-before-value] [fixture:
  requirement/gram-acc-descr-block-empty] [fixture:
  requirement/gram-empty-description-block-in-body]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, as a name or in a value, makes mermaid.js hand the text to the C4
  parser, which rejects it; here the text is a requirement diagram. `C4Context`
  is a name in both. [fixture: requirement/div-c4-keyword-in-name] [fixture:
  requirement/div-c4-keyword-in-value] [fixture: requirement/lex-c4context-name]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone, a line `%%{ }%%`, which is no directive, and a line of
  whitespace only after such a line, before the header, are a comment or nothing
  here, while mermaid.js rejects the input, because its lexer reads the line as
  a comment and the line feed after it as a `newline` unit, which its grammar
  does not take before the header (see [Detection](#detection)). [fixture:
  requirement/header-after-bare-percent-line] [fixture:
  requirement/header-after-empty-braces-line] [fixture:
  requirement/header-after-bare-percent-line-and-whitespace-line]
