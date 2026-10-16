# ER

Japanese version: [er.ja.md](./er.ja.md)

Source of truth in mermaid.js:

- [`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison)
- [`erDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts)
- the tests (`*.spec.js`) in
  [`er/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er)

This document covers the diagram type `er`, the entity relationship diagram. The
nodes of the tree are defined in [ast/er.md](../ast/er.md).

## Detection

Entry 10 of [detection.md](../detection.md) selects this grammar: the text
starts with `erDiagram`, after whitespace, in exactly this case
([`erDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDetector.ts#L9-L11)).
[fixture: er/header-only] [fixture: er/header-leading-whitespace]

The lexer then reads the header again, case-insensitively and not followed by a
word character (see [The statement context](#the-statement-context)). So
`erDiagramX` is detected as an ER diagram and rejected, while `erDiagram-x` is
the header followed by the entity `-x`. A statement may follow the header on its
line, after whitespace or not, and the header alone is accepted, also without a
line feed after it. [fixture: er/header-other-suffix] [fixture:
er/header-dash-suffix] [fixture: er/header-statement-same-line] [fixture:
er/header-tab-then-statement] [fixture: er/header-only] [fixture:
er/header-line-feed-only] [fixture: er/header-crlf-only]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, which detection reads and passes to find the header,
and which is a comment of the diagram here, with the mark `%%`, as in every
diagram type (see [Diagram detection](../common.md#diagram-detection)); the
comment belongs to no node, and the ErDiagram starts at the header. mermaid.js
rejects the input in both cases, and also with a line of whitespace only after
the bare line, because the lexer of this diagram has no rule for `%`: the known
divergence [`bare-percent-line-before-header`](#known-divergences). A directive
on a line before the header, on the header's line before it, or after the header
on its line is a directive and nothing else. [fixture:
er/header-after-bare-percent-line] [fixture: er/header-after-empty-braces-line]
[fixture: er/header-after-bare-percent-line-and-whitespace-line] [fixture:
er/header-after-directive-line] [fixture: er/header-after-directive-same-line]
[fixture: er/header-then-directive-same-line]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text. This
section describes the diagram's own unit rules, item 4 of
[Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters case-insensitively
(see [Notation](../common.md#notation)): `CLASSDEF a fill:red`, `STYLE A …`,
`ACCTITLE: T`, `DIRECTION tb`, `END`, `A ONE OR MORE TO MANY B : x`,
`A U--o{ B : x`, and `int id pk` in an attribute block are read as with the
lower-case words. [fixture: er/lex-classdef-upper-case] [fixture:
er/lex-style-upper-case] [fixture: er/lex-acc-title-upper-case] [fixture:
er/lex-direction-upper-case] [fixture: er/lex-end-upper-case] [fixture:
er/lex-cardinality-words-upper-case] [fixture: er/lex-md-parent-upper-case]
[fixture: er/lex-key-lower-case] A **keyword** below is a word, matched
case-insensitively, that is not followed by a word character (see
[Notation](../common.md#notation)): `ones`, `tomato`, `manyx`, `ending`,
`classes`, and `styles` are names, while `end` and `many` are keywords wherever
a unit starts. [fixture: er/lex-keyword-one-prefix] [fixture:
er/lex-keyword-to-prefix] [fixture: er/lex-keyword-many-prefix] [fixture:
er/lex-keyword-end-prefix] [fixture: er/lex-keyword-class-prefix] [fixture:
er/lex-keyword-style-prefix] [fixture: er/gram-end-alone] [fixture:
er/lex-many-alone]

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

The text may end in the statement context only. It may not end in the attribute
block context, inside a backquoted word, in the title context, the description
context, the description block context, or the style context: the input is then
rejected. So `A {` with attributes but no `}`, a backquoted word that is not
closed, `accTitle:` with nothing after it, and `accDescr {` without `}`, with
text after it or without, are rejected. `classDef a fill:red` and
`style A fill:red;` at the end of the text are accepted, because the line feed
that the lexer reads after the last character (see
[End of text](../common.md#end-of-text)) is a `newline` unit, which leaves the
style context; `classDef a fill:red` followed by a space, `style A fill:red`
followed by a tab, `classDef a fill:red` followed by a space and a line break,
and `style A fill:red;` followed by a space are rejected, because that
whitespace takes the line feed (rule 2 of the style context), and the text ends
in the style context. [fixture: er/lex-block-unclosed] [fixture:
er/lex-block-unclosed-empty] [fixture: er/lex-backquote-unclosed] [fixture:
er/lex-acc-title-at-end] [fixture: er/lex-acc-title-space-at-end] [fixture:
er/lex-acc-title-line-feed-at-end] [fixture: er/lex-acc-descr-at-end] [fixture:
er/lex-acc-descr-block-unclosed] [fixture:
er/lex-acc-descr-block-unclosed-empty] [fixture:
er/lex-acc-descr-block-unclosed-lines] [fixture: er/lex-classdef-at-end]
[fixture: er/lex-style-semicolon-at-end] [fixture:
er/lex-classdef-trailing-space-at-end] [fixture:
er/lex-style-trailing-tab-at-end] [fixture:
er/lex-classdef-trailing-space-line-feed-at-end] [fixture:
er/lex-style-semicolon-space-at-end]

**Whitespace.** The rules below say which characters each one takes as
whitespace. In the statement context, only a space and a tab lie between units
without being part of one (rule 5), and a line feed is a `newline` unit; every
other whitespace character of [Notation](../common.md#notation), such as U+00A0,
U+2028, U+3000, and U+FEFF, is a character of a name there, and a form feed or a
vertical tab is an `invalid` unit. In the attribute block context and the style
context, every whitespace character lies between units, line feeds included,
except where a rule says otherwise. Where a rule of the statement context reads
whitespace itself, as the rules for `accTitle`, `accDescr`, `end`, a direction
line, and the `1` of a cardinality do, it reads every whitespace character, line
feeds included. [fixture: er/lex-name-nbsp] [fixture:
er/lex-name-line-separator] [fixture: er/lex-name-trailing-nbsp] [fixture:
er/lex-bom-in-name] [fixture: er/lex-form-feed] [fixture: er/lex-vertical-tab]
[fixture: er/lex-tab-whitespace] [fixture: er/lex-block-nbsp] [fixture:
er/lex-block-form-feed] [fixture: er/lex-block-vertical-tab] [fixture:
er/lex-classdef-nbsp] [fixture: er/lex-classdef-line-separator] [fixture:
er/lex-acc-title-ideographic-space] [fixture: er/lex-end-blank-line-then-name]
[fixture: er/lex-direction-value-tab] [fixture: er/lex-direction-value-nbsp]
[fixture: er/lex-direction-value-line-separator] [fixture: er/lex-one-tab]

**Names.** In the statement context, one or more characters each of which is a
character outside ASCII, a word character, `-`, `*`, or `.`, as many as
possible, make a `name` unit: `ÀB-c.d*e`, `_a`, an emoji, and `C4Context` are
names, while `#`, `,`, `;`, `'`, `(`, `)`, `[`, `]`, `{`, `}`, `|`, `:`, `=`,
`+`, `/`, `&`, `@`, `$`, `!`, `^`, `` ` ``, `~`, and `?` are not characters of a
name; a line that holds a name and one of them is rejected, as the `?` of
`Blo?rf` is, unless the character starts a unit of its own. [fixture:
er/lex-name-unicode-characters] [fixture: er/lex-name-underscore] [fixture:
er/lex-name-emoji] [fixture: er/lex-c4context-name] [fixture: er/lex-name-hash]
[fixture: er/lex-name-comma] [fixture: er/lex-semicolon-after-name] [fixture:
er/lex-single-quote] [fixture: er/spec-er-diagram-039f9cc0] [fixture:
er/spec-er-diagram-594d55f9] [fixture: er/spec-er-diagram-05b13768] [fixture:
er/spec-er-diagram-38540142] [fixture: er/spec-er-diagram-3c37dc3e] [fixture:
er/spec-er-diagram-bd6185fa] [fixture: er/spec-er-diagram-d7ac9ccb] [fixture:
er/spec-er-diagram-471b8346] [fixture: er/spec-er-diagram-619a550d] [fixture:
er/spec-er-diagram-20fe2993] [fixture: er/spec-er-diagram-6666d913] [fixture:
er/spec-er-diagram-7725a167] [fixture: er/spec-er-diagram-99529c2d] [fixture:
er/spec-er-diagram-cade6c9d] [fixture: er/spec-er-diagram-ec259794] [fixture:
er/spec-er-diagram-f8b6820d] [fixture: er/spec-er-diagram-aa6cb3a0] [fixture:
er/spec-er-diagram-94764f48] [fixture: er/spec-er-diagram-95010e73] An entity is
read as its placeholder before the lexer reads the text (see
[Entities](../common.md#entities)), and the placeholder is made of characters
outside ASCII, so `A#amp;` is one name, `Aﬂ°amp¶ß`, in the statement context,
and `"A#amp;"` is the quoted name of the same entity; in an attribute block, the
`°` of the placeholder is no character of a word, so `a#amp;b` is rejected
there. [fixture: er/entity-placeholder-in-name] [fixture:
er/entity-placeholder-in-quoted-name] [fixture:
er/entity-placeholder-in-attribute-word] A `#` or `%%` after a unit on its line
is no comment: this diagram has no comment rule, so `A # c` and
`A ||--o{ B : x %% c` are rejected, while a comment line is removed before the
lexer reads the text (see [Comment lines](../common.md#comment-lines)), also
inside an attribute block or a subgraph, and inside a string that runs over
several lines, where it is a comment region of the string. [fixture:
er/lex-hash-after-name] [fixture: er/lex-percent-after-statement] [fixture:
er/comment-line] [fixture: er/lex-block-comment-line] [fixture:
er/lex-subgraph-comment-line] [fixture: er/tokens-comment-line-in-role-string]
[fixture: er/tokens-comment-line-in-comment-string] [fixture:
er/tokens-comment-line-in-backquoted-word] A comment line that holds the closing
quote of a string takes it with it, and the string is then not closed:
`A ||--o{ B : "x`, a line break, and `%% c"` is rejected. [fixture:
er/lex-comment-line-takes-closing-quote]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit, a name unit
included, makes the input rejected. The **name units** are a `name`, a `number`,
a `word` of an attribute block, a `key`, and a `style-text` where it is the name
after `style` or `classDef` or a class name. The **text units** are a
`tilde-word`, a `style-text` inside a style, a `title-text`, a
`description-text`, a `description-block-text`, and a `direction-text`. The
**string units** are a `quoted-name`, a `string`, a `comment-string`, and a
`backquoted-word`.

- `A ||--o{ B : "x%%{init: {}}%%y"` has the role `xy`, `"A%%{init: {}}%%B"` is
  the entity `AB`, an attribute comment `"x%%{init: {}}%%y"` is `xy`, a
  backquoted word `` `a%%{init: {}}%%b` `` is `ab`, the tilde word
  `Li%%{init: {}}%%st~a~` is `List~a~`, the title of
  `accTitle: a%%{init: {}}%%b` is `ab`, and so is the description of
  `accDescr { a%%{init: {}}%%b }`; `direction LR x%%{init: {}}%%y` sets the
  direction, and `classDef a fi%%{init: {}}%%ll:red` defines the style
  `fill:red`, as in mermaid.js, because a style is the texts of its units joined
  (see [ErLiteral](../ast/er.md#erliteral)). [fixture:
  er/lex-directive-in-role-string] [fixture: er/lex-directive-in-quoted-name]
  [fixture: er/lex-directive-in-comment-string] [fixture:
  er/lex-directive-in-backquoted-word] [fixture: er/lex-directive-in-tilde-word]
  [fixture: er/lex-directive-in-acc-title] [fixture:
  er/lex-directive-in-acc-descr-block] [fixture:
  er/lex-directive-in-direction-text] [fixture: er/lex-directive-in-style-text]
- A directive between two units is allowed whatever their kind:
  `A %%{init: {}}%%||--o{ B : x`, `A ||%%{init: {}}%%--o{ B : x`,
  `A %%{init: {}}%%{` before attributes, `p[%%{init: {}}%%P]`,
  `string%%{init: {}}%%? a` and `int a PK %%{init: {}}%% , FK` in a block are
  read as without the directive. [fixture: er/lex-directive-between-units]
  [fixture: er/lex-directive-between-cardinality-and-line] [fixture:
  er/lex-directive-before-block] [fixture: er/lex-directive-after-alias-open]
  [fixture: er/lex-directive-before-optional-mark] [fixture:
  er/lex-directive-between-keys] [fixture: er/lex-directive-before-key-comma]
- In `A%%{init: {}}%%B`, `1%%{init: {}}%%2`, `1%%{init: {}}%%.5`,
  `A ||--o{ B : x%%{init: {}}%%y`, `A:::c%%{init: {}}%%d`,
  `p[Per%%{init: {}}%%son]`, `subgraph S%%{init: {}}%%T`, `str%%{init: {}}%%ing`
  and `P%%{init: {}}%%K` in a block, and `style A%%{init: {}}%%B fill:red`, the
  directive lies inside a name unit, and in `er%%{init: {}}%%Diagram`,
  `sub%%{init: {}}%%graph`, `e%%{init: {}}%%nd`, `acc%%{init: {}}%%Title:`,
  `class%%{init: {}}%%Def`, `cl%%{init: {}}%%ass`, `st%%{init: {}}%%yle`,
  `dir%%{init: {}}%%ection LR`, `direction L%%{init: {}}%%R`,
  `one or %%{init: {}}%%more`, `1%%{init: {}}%%+`, `many(%%{init: {}}%%0)`,
  `|%%{init: {}}%%|`, and `::%%{init: {}}%%:` inside a keyword, a cardinality,
  or a delimiter: the input is rejected, while mermaid.js accepts it, reading
  the two parts as one (see [Known divergences](#known-divergences)). [fixture:
  er/div-directive-in-name] [fixture: er/div-directive-in-number-name] [fixture:
  er/div-directive-in-decimal-name] [fixture: er/div-directive-in-role-name]
  [fixture: er/div-directive-in-class-name] [fixture: er/div-directive-in-alias]
  [fixture: er/div-directive-in-subgraph-id] [fixture:
  er/div-directive-in-attribute-word] [fixture: er/div-directive-in-key]
  [fixture: er/div-directive-in-style-id] [fixture:
  er/div-directive-in-header-keyword] [fixture:
  er/div-directive-in-subgraph-keyword] [fixture: er/div-directive-in-end]
  [fixture: er/div-directive-in-acc-title-keyword] [fixture:
  er/div-directive-in-classdef-keyword] [fixture:
  er/div-directive-in-class-keyword] [fixture:
  er/div-directive-in-style-keyword] [fixture:
  er/div-directive-in-direction-keyword] [fixture:
  er/div-directive-in-direction-value] [fixture:
  er/div-directive-in-cardinality-words] [fixture:
  er/div-directive-in-cardinality-plus] [fixture:
  er/div-directive-in-cardinality-many] [fixture:
  er/div-directive-in-cardinality-symbol] [fixture:
  er/div-directive-in-class-separator]

**Trivia between units.** The trivia of [common.md](../common.md) meet the units
of this diagram as follows. A lone CR is a line terminator, read as a line feed
(see [Line terminators](../common.md#line-terminators)): a direction line, a
`classDef` and a `style` statement, a relationship, an `accTitle` line, a
subgraph, and an attribute block are read between lone CRs as between line
feeds. [fixture: er/lex-cr-only-direction] [fixture: er/lex-cr-only-classdef]
[fixture: er/lex-cr-only-style] [fixture: er/lex-cr-only-relationship] [fixture:
er/lex-cr-only-acc-title] [fixture: er/lex-cr-only-subgraph] [fixture:
er/lex-cr-only-block] A closed directive between two units is read as nothing,
and the whitespace around it by the rule of the context:
`accDescr %%{init: {}}%%{ x }`, `accTitle %%{init: {}}%%: x`,
`direction %%{init: {}}%%LR`, `subgraph %%{init: {}}%%S`,
`style A %%{init: {}}%%fill:red`, and `end%%{init: {}}%%` followed by a line
break are read as without the directive, and so is a directive at the end of a
relationship line, a subgraph header, or an `accTitle` line. At the end of a
`classDef` or `style` line, the space before the directive takes the line feed
after it (rule 2 of the style context): `classDef a fill:red %%{init: {}}%%`, a
line break, and `A` defines `fill:redA`, as the same text without the directive
does. [fixture: er/lex-directive-between-acc-descr-and-brace] [fixture:
er/lex-directive-between-acc-title-and-colon] [fixture:
er/lex-directive-between-direction-and-value] [fixture:
er/lex-directive-between-subgraph-and-id] [fixture:
er/lex-directive-between-style-id-and-style] [fixture:
er/lex-directive-between-end-and-line-feed] [fixture:
er/tokens-closed-directive-end-of-relationship-line] [fixture:
er/tokens-closed-directive-end-of-subgraph-header] [fixture:
er/tokens-closed-directive-end-of-acc-title] [fixture:
er/tokens-closed-directive-end-of-classdef-line] [fixture:
er/tokens-closed-directive-end-of-style-line] An unclosed directive takes the
rest of the text (see
[Where a directive is](../common.md#where-a-directive-is)):
`A ||--o{ B : x %%{init: {}` followed by a line `C` has no entity C, with
whitespace before the directive or without, `erDiagram %%{init: {}` followed by
a line `A` has no entity, and `classDef a fill:red%%{init: {}` followed by a
line `A` defines the style `fill:red`; `classDef a fill:red %%{init: {}` with a
space before the directive is rejected, because the text then ends in the style
context, and an unclosed directive inside an attribute block takes the `}` of
the block, so the input is rejected. [fixture:
er/tokens-unclosed-directive-after-relationship] [fixture:
er/tokens-unclosed-directive-glued-after-role] [fixture:
er/tokens-unclosed-directive-after-header] [fixture:
er/tokens-unclosed-directive-glued-after-classdef] [fixture:
er/tokens-unclosed-directive-after-classdef] [fixture:
er/tokens-unclosed-directive-in-block] A comment line between a keyword and what
follows it is removed before the lexer reads the text: `accTitle:`, a comment
line, and `T` has the title `T`, and so with `accDescr:`, and with `direction`
and its value; `classDef a fill:red` followed by a space, a comment line, and
`A` defines `fill:redA`; `subgraph 1`, a comment line, and `A` is rejected, as
without the comment line; `end`, a comment line, and `B` is accepted; and
`accDescr {`, a comment line, and `D }` has the description `D`. [fixture:
er/tokens-comment-line-after-acc-title-colon] [fixture:
er/tokens-comment-line-after-acc-descr-colon] [fixture:
er/tokens-comment-line-after-direction] [fixture:
er/tokens-comment-line-after-classdef-space] [fixture:
er/tokens-comment-line-after-subgraph-one] [fixture:
er/tokens-comment-line-after-end] [fixture:
er/tokens-comment-line-after-acc-descr-brace]

### The statement context

In the statement context, the lexer tries these rules in order:

1. `accTitle`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accTitle` unit
   and a `:` unit; enters the title context. [fixture: er/gram-acc-title]
   [fixture: er/lex-acc-title-no-space] [fixture:
   er/lex-acc-title-space-before-colon] [fixture:
   er/lex-acc-title-line-feed-after-colon] [fixture:
   er/lex-acc-title-line-feed-before-colon]
2. `accDescr`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `:` unit; enters the description context. [fixture: er/gram-acc-descr]
3. `accDescr`, zero or more whitespace characters, line feeds included, `{`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `{` unit; enters the description block context. [fixture:
   er/gram-acc-descr-block] [fixture: er/lex-acc-descr-block-no-space] [fixture:
   er/lex-acc-descr-block-line-feed-before-brace]
4. A **direction line** (see below). [fixture: er/gram-direction]
5. One or more spaces or tabs: nothing. [fixture: er/lex-tab-whitespace]
6. One or more line feeds: a `newline` unit. [fixture: er/header-blank-lines]
7. `"`, one or more characters other than `"`, `%`, line feed, U+000B, U+0008,
   and `\`, and `"`: a `quoted-name` unit. `"A B"`, `"A#B"`, and `"<b>A</b>"`
   are quoted names; `""` is no quoted name but an empty `string` (rule 8),
   which no entity name takes, and so is a string with a `%`, a line feed, a
   U+000B, a U+0008, or a `\` inside. [fixture: er/lex-quoted-name] [fixture:
   er/lex-quoted-name-hash] [fixture: er/lex-quoted-name-html] [fixture:
   er/spec-er-diagram-f4c59d78] [fixture: er/spec-er-diagram-c0a2be45] [fixture:
   er/spec-er-diagram-20d6ae6a] [fixture: er/spec-er-diagram-98428822] [fixture:
   er/spec-er-diagram-a1c253bf] [fixture: er/spec-er-diagram-a49c73a0]
8. `"`, zero or more characters other than `"`, line feeds included, and `"`: a
   `string` unit, which may be empty. [fixture: er/gram-role-string] [fixture:
   er/lex-role-string-percent] [fixture: er/lex-role-string-line-feed] [fixture:
   er/gram-role-string-empty]
9. The keyword `erDiagram`: a `header` unit. [fixture: er/header-only]
10. `{`: a `{` unit; enters the attribute block context. [fixture:
    er/gram-attribute] [fixture: er/lex-block-no-space]
11. `#`: a `#` unit, which no rule of the grammar takes. [fixture:
    er/lex-hash-after-name]
12. `,`: a `,` unit. [fixture: er/lex-class-list-comma-spaces]
13. `:::`: a `:::` unit. [fixture: er/gram-entity-classes]
14. `:`: a `:` unit. [fixture: er/gram-relationship-symbols]
15. `[`: a `[` unit. [fixture: er/gram-alias]
16. `]`: a `]` unit. [fixture: er/gram-alias]
17. The keyword `style`: a `style` unit; enters the style context. [fixture:
    er/gram-style]
18. The keyword `classDef`: a `classDef` unit; enters the style context.
    [fixture: er/gram-classdef]
19. The keyword `class`: a `class` unit. [fixture: er/gram-class]
20. The keyword `subgraph`: a `subgraph` unit. [fixture: er/gram-subgraph]
21. The keyword `end` and zero or more whitespace characters, line feeds
    included: an `end` unit. [fixture: er/gram-subgraph] [fixture:
    er/lex-end-blank-line-then-name]
22. A **cardinality**, a **number**, or a **relationship line** (see below).
    [fixture: er/gram-relationship-symbols]
23. A name (see [Names](#units-and-contexts)). [fixture:
    er/lex-name-unicode-characters]
24. Any other character other than a line feed: an `invalid` unit. [fixture:
    er/lex-single-quote]

The units `#`, `invalid`, a `string` where no role is read, and a `newline`
where the grammar does not take one are taken by no rule of the grammar, so an
input with one of them is rejected: `A # c`, `A 'x'`, `"A` and `A ||--o{ B : "x`
without their closing quote, and `A`, a line break, and `||--o{ B : x` are
rejected. [fixture: er/lex-hash-after-name] [fixture: er/lex-single-quote]
[fixture: er/lex-quoted-name-unclosed] [fixture: er/lex-role-string-unclosed]
[fixture: er/lex-relationship-spec-next-line] Some consequences of the order:

- A keyword is a keyword wherever a unit starts, and a name may not start with
  one: `end` alone, `many` alone, and `1+` alone are rejected, and so is a role
  `one`, `to`, or `end`, while `ending`, `ones`, `tomato`, `manyx`, `classes`,
  and `styles` are names. [fixture: er/gram-end-alone] [fixture:
  er/lex-many-alone] [fixture: er/lex-one-plus-alone] [fixture:
  er/lex-role-keyword-one] [fixture: er/lex-role-keyword-to] [fixture:
  er/lex-role-keyword-end] [fixture: er/lex-keyword-end-prefix] [fixture:
  er/lex-keyword-one-prefix] [fixture: er/lex-keyword-to-prefix] [fixture:
  er/lex-keyword-many-prefix] [fixture: er/lex-keyword-class-prefix] [fixture:
  er/lex-keyword-style-prefix] `classDefa fill:red`, `classA a`, and
  `styleA fill:red` hold no keyword: the first is the name `classDefa` followed
  by `fill` and a `:`, which is rejected, the second is the two names `classA`
  and `a`, and the third is rejected. [fixture: er/lex-classdef-no-whitespace]
  [fixture: er/lex-class-no-whitespace] [fixture: er/lex-style-no-whitespace]
- The `end` unit reads the whitespace after it, line feeds included, so after
  `end` the next line gives no `newline` unit: `end`, a blank line, and `B` is
  the entity B after the subgraph, `end B` on one line is the same, and
  `end B ||--o{ C : x` has the relationship. Where the whitespace after `end`
  reaches a `classDef` line, that line is read as usual. [fixture:
  er/lex-end-blank-line-then-name] [fixture: er/lex-end-then-name] [fixture:
  er/lex-end-then-relationship] [fixture: er/lex-end-space-before-line-feed]
  [fixture: er/lex-end-line-feeds-then-classdef]
- A line of `%%` or `#` after a unit is rejected (see
  [Names](#units-and-contexts)). A `;` is no separator and no character of a
  name: `A;` is rejected, except where the line rule ignores it (see
  [`style` and `classDef` lines](../common.md#style-and-classdef-lines)):
  `A ||--o{ Bstyle : "x:#y";` is accepted, with the role `x:#y`, and
  `A ||--o{ B : "x:#y";` is rejected. [fixture: er/lex-semicolon-after-name]
  [fixture: er/tokens-ignored-semicolon-after-role] [fixture:
  er/lex-semicolon-after-role]
- A `:` outside a relationship is rejected, and so is `:::` without a name
  before it or without a class after it: `A : x`, `:::c`, `A:::`, and
  `A:::c:::d` are rejected. [fixture: er/gram-colon-after-name] [fixture:
  er/gram-class-separator-alone] [fixture:
  er/gram-class-separator-without-class] [fixture: er/gram-two-class-separators]
- A `}` or `]` that closes nothing, and a `{` right after the header, are
  rejected. [fixture: er/lex-close-brace-alone] [fixture:
  er/lex-close-bracket-alone] [fixture: er/gram-header-then-block]

**Keywords and what follows them.** A keyword ends at a word boundary, so an
ASCII digit or letter after it continues a name, while a letter outside ASCII,
which is no word character, `-`, `"`, `:`, `#`, `{`, a line feed, or the end of
the text ends it. `subgraph1`, `end1`, `class1`, `classDef1`, `style1`, `one1`,
`to1`, and `many1` are names, so `subgraph1` is an entity, `end1` closes no
subgraph, `class1 A a` is three entities, and `classDef1 fill:red`,
`style1 fill:red`, `A ||--one1 B : x`, `A ||to1|| B : x`, and
`A many1 to one B : x` are rejected. `subgraph-x` is the subgraph `-x`,
`subgraph"S"` the subgraph S, `end-x` and `end"x"` are `end` and the entity `-x`
or `x`, `class-A a` is a `class` statement for the name `-A`,
`classDef-a fill:red` defines the class `-a`, `style-A fill:red` is a `style`
statement for the name `-A`, and `erDiagram"A"` is the header and the entity A.
`subgraph:S`, `subgraph#S`, `subgraph{S}`, `end:`, `end#`, `end{}`, `class:A a`,
`class"A" a`, `classDef:a`, `classDef#a`, `classDef{a}`, `classDef"a"`,
`style:A`, `style"A"`, `erDiagram1`, `erDiagram:`, `erDiagram#`, `erDiagram%%`,
and `A one-- B : x` are rejected, and so are `subgraph`, `class`, `classDef`,
and `style` followed by a line feed or by the end of the text, where a name must
follow. The rules for `direction`, `accTitle`, and `accDescr` need whitespace or
a `:` or `{` after the word: `directionx LR`, `direction1 LR`, `direction-LR`,
and `direction`, `accTitle`, and `accDescr` alone are names, and
`direction: LR`, `accTitle1: T`, `accTitle-: T`, and `accTitle {T}` are
rejected. A keyword of several words has exactly one space between its words:
`A only  one to one B : x` with two spaces is a relationship from the entity
`only` to B, and `A one  or more to one B : x`, `A one or`, a line break, and
`more to one B : x`, `A || optionally  to || B : x`, and
`A many (0) to one B : x` are rejected. A letter outside ASCII starts a name
right after the keyword: `subgraphé` is the subgraph `é`, `classé A a` a `class`
statement that gives `é` the class A, followed by the entity `a`,
`styleé fill:red` and `classDefé fill:red` statements for the name `é`,
`A ||--oneé : x` and `A ||--|oé : x` relationships to the entity `é`, `endé` is
`end` and the entity `é`, and `erDiagramé` the header and the entity `é`;
`A manyé to one B : x` and `A ||toé|| B : x` are rejected, since a line or a
cardinality is expected after the keyword, and `directioné LR` is two names.
[fixture: er/lex-keyword-subgraph-then-e-acute] [fixture:
er/lex-keyword-class-then-e-acute] [fixture: er/lex-keyword-style-then-e-acute]
[fixture: er/lex-keyword-classdef-then-e-acute] [fixture:
er/lex-keyword-one-then-e-acute] [fixture: er/lex-pipe-o-then-e-acute] [fixture:
er/lex-keyword-end-then-e-acute] [fixture: er/header-then-e-acute] [fixture:
er/lex-keyword-many-then-e-acute] [fixture: er/lex-keyword-to-then-e-acute]
[fixture: er/lex-keyword-direction-then-e-acute] [fixture:
er/lex-keyword-subgraph-then-digit] [fixture: er/lex-keyword-end-then-digit]
[fixture: er/lex-keyword-class-then-digit] [fixture:
er/lex-keyword-classdef-then-digit] [fixture: er/lex-keyword-style-then-digit]
[fixture: er/lex-keyword-one-then-digit] [fixture: er/lex-keyword-to-then-digit]
[fixture: er/lex-keyword-many-then-digit] [fixture:
er/lex-keyword-subgraph-then-dash] [fixture: er/lex-keyword-subgraph-then-quote]
[fixture: er/lex-keyword-end-then-dash] [fixture: er/lex-keyword-end-then-quote]
[fixture: er/lex-keyword-class-then-dash] [fixture:
er/lex-keyword-classdef-then-dash] [fixture: er/lex-keyword-style-then-dash]
[fixture: er/header-then-quoted-name] [fixture:
er/lex-keyword-subgraph-then-colon] [fixture: er/lex-keyword-subgraph-then-hash]
[fixture: er/lex-keyword-subgraph-then-brace] [fixture:
er/lex-keyword-end-then-colon] [fixture: er/lex-keyword-end-then-hash] [fixture:
er/lex-keyword-end-then-brace] [fixture: er/lex-keyword-class-then-colon]
[fixture: er/lex-keyword-class-then-quote] [fixture:
er/lex-keyword-classdef-then-colon] [fixture: er/lex-keyword-classdef-then-hash]
[fixture: er/lex-keyword-classdef-then-brace] [fixture:
er/lex-keyword-classdef-then-quote] [fixture: er/lex-keyword-style-then-colon]
[fixture: er/lex-keyword-style-then-quote] [fixture: er/header-then-digit]
[fixture: er/header-then-colon] [fixture: er/header-then-hash] [fixture:
er/header-then-percent] [fixture: er/lex-keyword-one-then-dashes] [fixture:
er/lex-keyword-one-then-colon] [fixture: er/lex-keyword-subgraph-then-line-feed]
[fixture: er/lex-keyword-subgraph-at-end] [fixture:
er/lex-keyword-class-then-line-feed] [fixture: er/lex-keyword-class-at-end]
[fixture: er/lex-keyword-classdef-then-line-feed] [fixture:
er/lex-keyword-classdef-at-end] [fixture: er/lex-keyword-style-then-line-feed]
[fixture: er/lex-keyword-style-at-end] [fixture:
er/lex-keyword-direction-then-letter] [fixture:
er/lex-keyword-direction-then-digit] [fixture:
er/lex-keyword-direction-then-dash] [fixture: er/lex-keyword-direction-at-end]
[fixture: er/lex-keyword-acc-title-at-end] [fixture:
er/lex-keyword-acc-descr-at-end] [fixture: er/lex-keyword-direction-then-colon]
[fixture: er/lex-keyword-acc-title-then-digit] [fixture:
er/lex-keyword-acc-title-then-dash] [fixture:
er/lex-keyword-acc-title-then-brace] [fixture: er/lex-only-one-two-spaces]
[fixture: er/lex-one-or-more-two-spaces] [fixture:
er/lex-one-or-more-line-feed-inside] [fixture: er/lex-optionally-to-two-spaces]
[fixture: er/lex-many-space-before-parenthesis] [fixture:
er/lex-md-parent-upper-case-dash-dot]

**The cardinalities, numbers, and relationship lines.** Rule 22 tries these
rules in order; each makes one unit named after the cardinality or the line,
whatever its spelling: `zero-or-one`, `zero-or-more`, `one-or-more`, `only-one`,
and `md-parent` for a cardinality, `identifying` and `non-identifying` for a
relationship line, and `number` for a number. The keywords among them are
compared case-insensitively and are not followed by a word character; the
spellings that end with a symbol may be followed by anything.

1. The keyword `one or zero`: `zero-or-one`. [fixture:
   er/lex-cardinality-only-one-optionally-to]
2. The keyword `one or more`, the keyword `one or many`, or `1+`: `one-or-more`.
   [fixture: er/lex-cardinality-words] [fixture: er/lex-cardinality-one-or-many]
   [fixture: er/lex-cardinality-plus]
3. `|o` not followed by a word character: `zero-or-one`. [fixture:
   er/lex-line-dot-dash] [fixture: er/lex-pipe-o-glued-left]
4. The keyword `zero or one`: `zero-or-one`. [fixture: er/lex-cardinality-words]
5. The keyword `zero or more`, the keyword `zero or many`, or `0+`:
   `zero-or-more`. [fixture: er/lex-cardinality-one-or-many] [fixture:
   er/lex-cardinality-plus] [fixture:
   er/docs-syntax-entity-relationship-diagram-fff06d91]
6. `}o` not followed by a word character: `zero-or-more`. [fixture:
   er/lex-o-brace-glued-letter]
7. `many(0)`: `zero-or-more`; `many(1)`: `one-or-more`; the keyword `many`:
   `zero-or-more`. [fixture: er/lex-cardinality-many-zero] [fixture:
   er/lex-cardinality-many]
8. `}|`: `one-or-more`. [fixture: er/spec-er-diagram-7b5988ee]
9. The keyword `one` or the keyword `only one`: `only-one`. [fixture:
   er/lex-cardinality-many-zero] [fixture:
   er/lex-cardinality-only-one-optionally-to]
10. One or more ASCII digits, `.`, and one or more ASCII digits: a `number`.
    [fixture: er/lex-name-decimal]
11. `1` followed by one or more whitespace characters, line feeds included, and
    an ASCII letter, `_`, `"`, or `'`; or followed by one or more whitespace
    characters, line feeds included, and an ASCII digit; or followed directly by
    `--`, `..`, `.-`, or `-.`: `only-one`. [fixture:
    er/lex-one-digit-cardinalities] [fixture: er/spec-er-diagram-155d18bb]
    [fixture: er/spec-er-diagram-92625f77] [fixture:
    er/spec-er-diagram-4fd0ae58] [fixture: er/lex-one-before-string] [fixture:
    er/lex-one-before-underscore] [fixture: er/lex-one-before-number-name]
    [fixture: er/lex-one-tab]
12. `1` not followed by a word character: a `number`. [fixture: er/lex-name-one]
13. One or more ASCII digits: a `number`. [fixture: er/lex-name-number]
14. `||`: `only-one`; `o|`: `zero-or-one`; `o{`: `zero-or-more`; `|{`:
    `one-or-more`. [fixture: er/gram-relationship-symbols] [fixture:
    er/lex-line-dash-dot] [fixture: er/lex-only-one-symbols]
15. `u` followed by `.`, `-`, or `|`: `md-parent`. [fixture: er/lex-md-parent]
16. `..`: `non-identifying`; `--`: `identifying`; the keyword `to`:
    `identifying`; the keyword `optionally to`: `non-identifying`; `.-`:
    `non-identifying`; `-.`: `non-identifying`. [fixture:
    er/spec-er-diagram-7b5988ee] [fixture: er/gram-relationship-symbols]
    [fixture: er/lex-cardinality-words] [fixture:
    er/lex-cardinality-only-one-optionally-to] [fixture: er/lex-line-dot-dash]
    [fixture: er/lex-line-dash-dot] [fixture: er/lex-optionally-to-upper-case]

The three units of a relationship need no whitespace between them or around
them, and may have it: `A||--o{B:has` and `A || -- o{ B : has` are the same
relationship, and so are `A ||to|| B : x`, `A one--one B : x`, `A 1+--0+ B : x`,
`A many(0)--many(1) B : x`, and `A one or more--one B : x`; word and symbol
spellings mix, as in `A one or zero--|| B : x` and `A ||--only one B : x`.
[fixture: er/lex-relationship-no-spaces] [fixture:
er/lex-relationship-spaces-in-spec] [fixture: er/lex-to-glued] [fixture:
er/lex-one-glued-dashes] [fixture: er/lex-plus-glued] [fixture:
er/lex-many-paren-glued] [fixture: er/lex-one-or-more-glued] [fixture:
er/lex-cardinality-word-then-symbol] [fixture:
er/lex-cardinality-symbol-then-word] Some consequences of the rules:

- `|o` and `}o` end at a word boundary, the other symbols do not: `A|o--|| B`
  and `A }o--o{B : x` are relationships, `A }|--|{B : x` too, while
  `A o|--|oB : x`, `A |o--|o1 : x`, and `A o{--}oB : x` are rejected, because
  the `|o` or `}o` before the name is no cardinality. `1+`, `0+`, `many(0)`, and
  `many(1)` may be followed by a name: `A 1+--0+x : x` and
  `A many(0)--many(1)x : x` have the entity `x`. The keyword `to` is not:
  `A ||tox|| B : x` is rejected. [fixture: er/lex-pipe-o-glued-left] [fixture:
  er/lex-o-brace-glued-letter] [fixture: er/lex-brace-pipe-glued] [fixture:
  er/lex-pipe-o-glued-letter] [fixture: er/lex-pipe-o-glued-digit] [fixture:
  er/lex-brace-o-glued-letter] [fixture: er/lex-plus-glued-letter] [fixture:
  er/lex-many-paren-glued-letter] [fixture: er/lex-to-glued-letter]
- `u` is `md-parent` only right before `.`, `-`, or `|`, on the right as well as
  on the left, and the character after it then starts a name: `A u--o{ B : x`,
  `A u..o{ B : x`, and `A U--o{ B : x` have the cardinality `md-parent` on the
  left, `A ||--u-B : x` and `A ||--u.B : x` have it on the right, with the
  entities `-B` and `.B`, and `A u--u-B : x` at both ends; `A u --o{ B : x` has
  the name `u` and is rejected, `u` alone is the entity `u`, `Au--o{ B : x` has
  the name `Au` and is rejected, `u--o{ B : x` has no entity before the
  cardinality and is rejected, and `A u|--o{ B : x`, `A ||--u B : x`, and
  `A ||--u| B : x` are rejected. [fixture: er/lex-md-parent] [fixture:
  er/lex-md-parent-dots] [fixture: er/lex-md-parent-upper-case] [fixture:
  er/lex-md-parent-right-glued-name] [fixture: er/lex-md-parent-right-glued-dot]
  [fixture: er/lex-md-parent-both-glued] [fixture: er/lex-u-then-space]
  [fixture: er/lex-u-as-name] [fixture: er/lex-u-glued-name] [fixture:
  er/gram-md-parent-without-left] [fixture: er/lex-md-parent-pipe] [fixture:
  er/lex-md-parent-right] [fixture: er/lex-md-parent-right-pipe]
- A name may start with `o`, but `o{` is a cardinality: `o{` followed by
  attributes is rejected, while `o {` is the entity `o` with its attributes.
  [fixture: er/lex-name-o-then-block] [fixture: er/lex-name-o-space-block]
- Rule 11 reads `1` as `only-one` also where a statement starts: `1 A` and
  `1 12` are rejected, and so is `1--1 B : x`, which has no entity before the
  cardinality, while `1 é` is the two entities `1` and `é`, because `é` is no
  ASCII letter. After a relationship line, `1` followed by whitespace and an
  ASCII letter, `_`, a `"`, a `'`, or a digit is `only-one`: `A 1--1 B : has`,
  `A 1--1 "B" : has`, `A 1--1 _B : x`, `A 1--1 12 : has`, and `A 1--1`, a tab,
  and `B : has` are relationships; `A 1--1 é : x`, `A 1--1 -B : x`,
  `A 1--1 *B : x`, `A 1--1B : has`, `A ||--1"B" : x`, and `A 1--12 B : x` are
  rejected, because the `1` after the relationship line is a `number` there, or
  because `12` is one; in `A 1--1 'B' : x` that `1` is `only-one`, since `'` is
  among the characters of rule 11, and the `'` after it is an `invalid` unit.
  [fixture: er/lex-one-space-letter] [fixture: er/lex-one-space-digit] [fixture:
  er/lex-one-arrow-no-left] [fixture: er/lex-one-space-e-acute] [fixture:
  er/lex-one-digit-cardinalities] [fixture: er/lex-one-before-string] [fixture:
  er/lex-one-before-underscore] [fixture: er/lex-one-before-number-name]
  [fixture: er/lex-one-tab] [fixture: er/lex-one-before-e-acute] [fixture:
  er/lex-one-before-dash] [fixture: er/lex-one-before-star] [fixture:
  er/lex-one-before-single-quote] [fixture: er/lex-one-glued-letter] [fixture:
  er/lex-one-before-string-glued] [fixture: er/lex-one-then-two-digits]
- A number ends where a name begins: `1a` is the two entities `1` and `a`, `12a`
  the entities `12` and `a`, `2.5x` the entities `2.5` and `x`, and `12.` the
  entities `12` and `.`; `12`, `2.5`, and `1` are entities. [fixture:
  er/lex-name-number-then-letter] [fixture: er/lex-name-number2-then-letter]
  [fixture: er/lex-name-decimal-then-letter] [fixture:
  er/lex-name-number-then-dot] [fixture: er/lex-name-number] [fixture:
  er/lex-name-decimal] [fixture: er/lex-name-one]
- A relationship line is exactly two characters or a keyword:
  `A ||----o{ B : x`, `A ||---o{ B : x`, and `A ||.-.o{ B : x` are rejected, and
  so are `A ||-- B : x` and `A --o{ B : x`, which lack a cardinality,
  `A many(2) to one B : x`, and `A one or zeros B : x`. [fixture:
  er/lex-line-four-dashes] [fixture: er/lex-line-three-dashes] [fixture:
  er/lex-line-dot-dash-dot] [fixture:
  er/gram-relationship-missing-right-cardinality] [fixture:
  er/gram-relationship-missing-left-cardinality] [fixture:
  er/lex-many-paren-two] [fixture: er/lex-keyword-one-or-zero-suffix]

**The direction line.** Compared case-insensitively: from the current position,
a run of characters without line feeds, U+2028, or U+2029, the longest one that
the rest can follow; then `direction`; then one or more whitespace characters,
line feeds included; then one of `TB`, `BT`, `RL`, and `LR`, tried in this
order; and then every character up to the next line feed. The rule reads
`direction` as a `direction` unit, the value as a `direction-value` unit, and
the characters before `direction` and after the value as `direction-text` units,
which mermaid.js does not read. The rule is tried before the whitespace and name
rules, so it takes the whole line: `A direction LR` sets the direction and has
no entity, and so do `A ||--o{ B : x direction LR` and
`A ||--o{ B : direction TB`; `Direction lr` and `DIRECTION tb` are direction
lines, and the indentation before `direction` is part of the run. It is also
tried before the keyword rules that follow it: `classDef a direction LR` sets
the direction and defines no class, `A accTitle: direction LR` sets the
direction, and `subgraph direction LR` is a direction line, so that the `end`
after it closes nothing and is rejected; only rules 1 to 3 come before it, so
`accTitle: direction LR` is a title. Neither does the value need to end at a
word boundary: `direction LRX` sets `LR`, and `X` is a `direction-text` unit;
`direction LR %% c` sets `LR` with the text `%% c`, and `direction LR;` with the
text `;`. The values are tried in the order given: if the line has `direction`,
whitespace, and `TB` anywhere, the value is `TB`; otherwise `BT` is tried, and
so on. For a value, the lexer takes the last `direction` of the run that the
value follows. So `direction TB x direction TB` is read at its last `direction`,
and `direction TB x` is a `direction-text` unit, while
`direction TB x direction LR` and `direction TBx direction RL` set `TB` and are
read at their first `direction`, with the rest as a `direction-text` unit.
[fixture: er/lex-direction-line-text-before] [fixture:
er/lex-direction-line-after-relationship] [fixture:
er/lex-direction-line-as-role] [fixture: er/lex-direction-lower-case] [fixture:
er/lex-direction-upper-case] [fixture: er/lex-direction-leading-space] [fixture:
er/lex-direction-line-leading-tab] [fixture:
er/lex-direction-line-before-classdef] [fixture:
er/lex-direction-line-with-acc-title] [fixture: er/lex-direction-line-subgraph]
[fixture: er/lex-acc-title-direction] [fixture: er/lex-direction-value-glued]
[fixture: er/lex-direction-line-percent] [fixture:
er/lex-direction-line-semicolon] [fixture: er/lex-direction-line-text-after]
[fixture: er/lex-direction-line-same-value-twice] [fixture:
er/lex-direction-line-two-values] [fixture:
er/lex-direction-value-glued-then-other] The whitespace between `direction` and
its value may hold a line feed, a tab, a U+00A0, or a U+2028: `direction`, a
line break, and `LR` is a direction line, and so is `direction`, U+2028, and
`LR`, while the run before `direction` may not hold a U+2028: `A`, U+2028, and
`direction LR` are the names `A`, U+2028, `direction` and `LR`. The text after
the value may hold a U+2028 or a U+2029. `direction` alone on its line, with no
value, is the name `direction`. [fixture: er/lex-direction-value-next-line]
[fixture: er/lex-direction-value-tab] [fixture: er/lex-direction-value-nbsp]
[fixture: er/lex-direction-value-line-separator] [fixture:
er/lex-line-separator-before-direction] [fixture:
er/lex-line-separator-after-direction-value] [fixture:
er/lex-paragraph-separator-after-direction-value] [fixture:
er/lex-direction-without-value] [fixture: er/lex-direction-at-end]

### The attribute block context

The attribute block context is entered by `{` in the statement context. It reads
the attributes of an entity:

1. One or more whitespace characters, line feeds included: nothing. A line feed
   makes no unit here, so the attributes need no line structure: `string a` and
   `string b` on one line are two attributes, and `string` and `a` on two lines
   are one. [fixture: er/gram-attributes-one-line] [fixture:
   er/gram-attribute-split-lines] [fixture: er/lex-block-nbsp] [fixture:
   er/lex-block-tab] [fixture: er/lex-block-form-feed] [fixture:
   er/lex-block-vertical-tab] [fixture: er/lex-block-crlf] [fixture:
   er/gram-block-blank-lines]
2. `PK`, `FK`, or `UK`, compared case-insensitively, not followed by a word
   character: a `key` unit. `pk` is a key, and `PKx` is a word. [fixture:
   er/gram-keys-comma-space] [fixture: er/lex-key-lower-case] [fixture:
   er/lex-key-prefix-word] [fixture: er/lex-key-line-separator-after]
3. A **tilde word**: from the current position, a run of one or more characters
   other than whitespace that holds a `~`, where a second `~` follows on the
   same line segment, a run of characters without line feeds, U+2028, or U+2029;
   the unit runs from the position through the last `~` of that line segment and
   the characters other than whitespace right after it: a `tilde-word` unit,
   which may hold whitespace. `List~int~ a` has the type `List~int~`, `~int~ a`
   the type `~int~`, `List~a b~ c` the type `List~a b~`, `List~~ a` the type
   `List~~`, `List~int~ Map~k~ x` the one type `List~int~ Map~k~` and the name
   `x`, and `int~x~a b` the type `int~x~a`; `a~b c` holds one `~` and is
   rejected, `List~int~ Map~k~` alone has a type and no name and is rejected,
   and `List~a`, U+2028, and `b~ c` is rejected, because the segment ends at the
   U+2028. The rule comes before the rules for a comment and a backquoted word,
   so `string a "x~y" List~int~ b` has the second type `"x~y" List~int~`,
   `string a "a~b~c" d` the second type `"a~b~c"`, `string a "a~b~c"` alone is
   rejected, and `` `a~b~` c `` has the type `` `a~b~` `` with its backquotes,
   while `string a "a~b"` has the comment `a~b`, and the `` `b` `` after `~` in
   ``a~`b`~ c`` is part of the tilde word. The line segment runs past a `}`:
   `A { List~int~ a } B { Map~k~ v }` is the one entity A with the type
   `List~int~ a } B { Map~k~` and the name `v`, `A { int x~y } B { z~w }` the
   entity A with the attribute named `x~y } B { z~w`, and `A {` followed by a
   line `List~int~}` is rejected, because the tilde word takes the `}`; with
   `List~int~ a` on its line and `}` on the next, the `}` lies outside the word.
   [fixture: er/lex-tilde-across-close-brace] [fixture:
   er/lex-tilde-across-close-brace-name] [fixture:
   er/lex-tilde-before-close-brace-glued] [fixture:
   er/lex-tilde-then-close-brace-next-line] [fixture: er/lex-tilde-word]
   [fixture: er/lex-tilde-word-start] [fixture: er/lex-tilde-space-inside]
   [fixture: er/lex-tilde-double] [fixture: er/lex-tilde-run-two-words]
   [fixture: er/lex-tilde-word-glued-name] [fixture: er/lex-tilde-single]
   [fixture: er/lex-tilde-run-two-words-no-name] [fixture:
   er/lex-tilde-line-separator] [fixture: er/lex-tilde-after-quoted] [fixture:
   er/lex-tilde-in-comment-two-then-word] [fixture: er/lex-tilde-in-comment-two]
   [fixture: er/lex-backquote-containing-tilde] [fixture:
   er/lex-tilde-in-comment-one] [fixture: er/lex-tilde-with-backquote-inside]
4. A **word**: a first character that is `*`, an ASCII letter, `_`, or a
   character from U+00C0 on, characters outside the Basic Multilingual Plane
   included, and then zero or more characters each of which is an ASCII letter,
   an ASCII digit, `-`, `_`, `[`, `]`, `(`, `)`, `.`, `,`, `*`, or a character
   from U+00C0 on: a `word` unit. `string[]`, `decimal(10,2)`, `a.b`, `*a`,
   `_a`, `a-b`, `a,b`, `a1`, `é`, and an emoji are words, and so is `end`, while
   `0a`, `[a`, `)a`, `]a`, `-a`, `©`, and `a#b` are not: the first five start
   with a character that only follows, `©` is U+00A9, below U+00C0, and `#` is
   no character of a word. The whitespace characters from U+00C0 on, U+2028,
   U+3000, and U+FEFF among them, are characters of a word where they follow its
   first character: `string`, U+2028, and `a` is one word, and so is `str`,
   U+FEFF, and `ing`, while `str`, U+00A0, and `ing` is two words. [fixture:
   er/lex-word-brackets] [fixture: er/lex-word-parentheses] [fixture:
   er/lex-word-dot] [fixture: er/lex-word-star] [fixture:
   er/lex-word-underscore] [fixture: er/lex-word-dash] [fixture:
   er/lex-word-comma] [fixture: er/lex-word-digits-inside] [fixture:
   er/lex-word-e-acute] [fixture: er/lex-word-emoji] [fixture:
   er/lex-word-surrogate-start] [fixture: er/lex-block-keyword-end] [fixture:
   er/spec-er-diagram-f42b9d44] [fixture: er/spec-er-diagram-6963c994] [fixture:
   er/spec-er-diagram-a1584d91] [fixture: er/spec-er-diagram-ef201912] [fixture:
   er/spec-er-diagram-a7625799] [fixture: er/lex-word-copyright] [fixture:
   er/lex-word-hash] [fixture: er/lex-block-line-separator] [fixture:
   er/lex-word-bom-inside] [fixture: er/lex-word-nbsp-inside]
5. `` ` ``, one or more characters other than `` ` ``, line feeds included, and
   `` ` ``: a `backquoted-word` unit, backquotes included. So `` `a b` c `` has
   the type `a b`, and the type of `` `a``, a line break, and ``b` c`` holds the
   line feed; `` `a"b` `` holds a `"`. Two backquotes with nothing between them
   are an `empty-backquotes` unit, for which mermaid.js reads no token (see
   [Attributes](#attributes)). The word after the closing backquote starts a new
   unit: `` `a`b c `` is three words and is rejected, and `` `a`? b `` has the
   type `a` with `?`. [fixture: er/lex-backquote-word] [fixture:
   er/lex-backquote-line-feed] [fixture: er/lex-backquote-quote-inside]
   [fixture: er/lex-backquote-both] [fixture: er/lex-backquote-glued] [fixture:
   er/lex-backquote-optional] [fixture: er/lex-backquote-unclosed]
6. `"`, zero or more characters other than `"`, line feeds included, and `"`: a
   `comment-string` unit, which may be empty. `"c%%d"` is one, and the string
   needs no whitespace before it: `string a"c"` is accepted. [fixture:
   er/gram-comment] [fixture: er/gram-comment-empty] [fixture:
   er/lex-comment-line-feed] [fixture: er/lex-comment-percent] [fixture:
   er/lex-comment-glued] [fixture: er/lex-comment-unclosed]
7. `}`: a `}` unit; leaves the attribute block context. [fixture:
   er/gram-attribute]
8. `?`: a `?` unit. `,`: a `,` unit. Any other character other than a line feed,
   U+2028, and U+2029: an `invalid` unit, which no rule takes, so `%`, `#`, `{`,
   and `~` outside a tilde word are rejected. `?` needs no whitespace before it:
   `string ? a` and `string? a` are the same. [fixture: er/gram-optional-type]
   [fixture: er/lex-optional-type-space] [fixture: er/lex-block-percent]
   [fixture: er/lex-word-hash] [fixture: er/lex-block-brace] [fixture:
   er/lex-tilde-single]

The rules of the statement context are not tried here: `end`, `direction LR`,
and `accDescr { x }` after `{` are words, so `end a` is an attribute,
`direction LR` is the attribute of type `direction`, and `accDescr { x }` is
rejected at its `{`. [fixture: er/lex-block-keyword-end] [fixture:
er/lex-direction-in-block] [fixture: er/lex-block-acc-descr] The text may not
end in this context, nor inside a backquoted word: `A {` with or without
attributes, and `` `a `` without its closing backquote, are rejected. [fixture:
er/lex-block-unclosed] [fixture: er/lex-block-unclosed-empty] [fixture:
er/lex-backquote-unclosed]

### The style context

The style context is entered by `style` and by `classDef`. It reads the names
and the styles of the statement:

1. One or more line feeds: a `newline` unit; leaves the style context. [fixture:
   er/gram-classdef]
2. One or more whitespace characters, line feeds included: nothing. This rule
   comes after rule 1, so a run of whitespace that starts with a space or a tab
   takes the line feeds inside it, and the statement goes on on the next line:
   `classDef a fill:red`, a space, a line break, and `A` defines the style
   `fill:redA` and has no entity, and so with a tab, and with a blank line
   between. [fixture: er/lex-classdef-space-before-line-feed] [fixture:
   er/lex-style-space-before-line-feed] [fixture:
   er/lex-style-tab-before-line-feed] [fixture:
   er/lex-classdef-space-before-line-feed-then-blank]
3. `:`: a `:` unit. [fixture: er/gram-classdef]
4. `,`: a `,` unit. [fixture: er/gram-classdef]
5. `#`: a `#` unit. [fixture: er/gram-classdef]
6. One or more characters each of which is a character outside ASCII, a word
   character, `-`, or `*`: a `style-text` unit. `.`, `%`, `(`, `)`, and `"` are
   no characters of it, and no rule takes them: `classDef a font-size:1.5em`,
   `classDef a width:50%`, `classDef a fill:rgb(1,2,3)`, `style A.B fill:red`,
   and `classDef a.b fill:red` are rejected. U+00A0 is a character of it:
   `style A fill:red`, U+00A0, a line break, and `B` has the style `fill:red`
   and U+00A0, and the entity B. [fixture: er/lex-classdef-dot] [fixture:
   er/lex-classdef-percent] [fixture: er/lex-classdef-parentheses] [fixture:
   er/lex-style-dot-name] [fixture: er/lex-classdef-dot-name] [fixture:
   er/lex-style-nbsp-before-line-feed] [fixture: er/lex-classdef-dash-name]
   [fixture: er/lex-classdef-unicode-name] [fixture: er/lex-classdef-star-style]
7. `;`: a `;` unit. [fixture: er/lex-classdef-semicolon-line-feed]

The `;` unit ends the statement, but the lexer stays in the style context until
a line feed: `classDef a fill:red;`, a line break, and `A` is the class and the
entity, while `classDef a fill:red; A` is rejected, because `A` is a
`style-text` unit after the statement has ended. The line rule removes the `;`
after a `#` on such a line before the lexer reads it (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)):
`classDef a fill:#f00;` followed by a line `A` has the style `fill:#f00`, and
`classDef a fill:#f00; B` has the style `fill:#f00B` and no entity, as in
mermaid.js; with `;;`, one `;` remains, and `#f00;` is then read as an entity
(see [Entities](../common.md#entities)). The style context has no rule for
`accDescr {`, which is a `style-text` unit and a `{`:
`classDef a accDescr {} fill:red` and `style A accDescr {} fill:red` are
rejected. [fixture: er/lex-classdef-semicolon-line-feed] [fixture:
er/lex-classdef-semicolon-then-name] [fixture: er/lex-style-semicolon-line-feed]
[fixture: er/lex-style-semicolon-at-end] [fixture:
er/lex-classdef-ignored-semicolon] [fixture:
er/lex-classdef-ignored-semicolon-then-text] [fixture:
er/lex-style-ignored-semicolon] [fixture:
er/lex-style-ignored-semicolon-then-text] [fixture:
er/lex-classdef-double-semicolon-entity] [fixture:
er/lex-classdef-empty-description-block] [fixture:
er/lex-style-empty-description-block] The keywords `style` and `classDef` need
whitespace after them only because a name must follow: `classDef` and `class`
are compared as keywords, so `classDefa` holds neither. [fixture:
er/lex-classdef-no-whitespace]

### Accessibility values

In the title context, zero or more characters other than line feed are a
`title-text` unit, and the context is left; the description context reads a
`description-text` unit in the same way. The whitespace after the `:`, line
feeds included, is read with the `:` unit (rules 1 and 2 of the statement
context), so the text starts at the first character that is not whitespace,
which may be on a later line, and the unit is never empty where the text goes
on: `accTitle:`, a line break, and `T` has the title `T`, and `accTitle:`, a
blank line, and `A` has the title `A` and no entity. At the end of the text the
input is rejected: `accTitle:`, also followed by a space or a line break, and
`accDescr:` are rejected, while `accTitle: T` at the end of the text is
accepted. `;`, `#`, `%%`, `{`, `}`, and `accDescr {}` are characters of the
text: `accTitle: a;b #c %% d` has the title `a;b #c %% d`, and
`accTitle: T accDescr {}` the title `T accDescr {}`. The whitespace at the end
of the text, U+00A0 included, is read into the unit and left out of the value
(see [ErLiteral](../ast/er.md#erliteral)). [fixture: er/gram-acc-title]
[fixture: er/lex-acc-title-line-feed-after-colon] [fixture:
er/lex-acc-title-blank-line-then-name] [fixture:
er/lex-acc-title-spaces-then-name] [fixture: er/lex-acc-title-at-end] [fixture:
er/lex-acc-title-space-at-end] [fixture: er/lex-acc-title-line-feed-at-end]
[fixture: er/lex-acc-descr-at-end] [fixture: er/gram-acc-title-at-end-with-text]
[fixture: er/gram-acc-descr-at-end-with-text] [fixture:
er/lex-acc-title-semicolon-hash-percent] [fixture:
er/lex-acc-title-then-semicolon] [fixture: er/lex-acc-title-braces] [fixture:
er/lex-acc-title-empty-description-block] [fixture:
er/db-acc-title-trailing-space] [fixture: er/lex-acc-title-trailing-nbsp]
[fixture: er/lex-acc-title-crlf] [fixture: er/lex-acc-title-line-separator]
[fixture: er/lex-acc-title-tabs]

In the description block context, `}` is a `}` unit and leaves the context, and
one or more characters other than `}`, line feeds included, are a
`description-block-text` unit. The whitespace after `{`, line feeds included, is
read with the `{` unit (rule 3 of the statement context), so the text starts at
the first character that is not whitespace, and `accDescr {}`, `accDescr { }`,
`accDescr {`, a line of spaces, and `}`, and a block whose braces hold only a
directive or only a comment line have no text and make no token in mermaid.js:
an **empty description block** (see
[Empty description blocks](#empty-description-blocks)). The text runs to the
first `}`, whitespace at its end included: `accDescr { a {b }` has the
description `a {b`, `accDescr { D   }` the description `D`, and
`accDescr { direction LR }` the description `direction LR`. The text may not end
in this context: `accDescr {`, `accDescr { D`, and `accDescr { D` followed by a
line `A` are rejected. [fixture: er/gram-acc-descr-block] [fixture:
er/gram-acc-descr-block-multiline] [fixture: er/gram-acc-descr-block-empty]
[fixture: er/gram-acc-descr-block-empty-space] [fixture:
er/db-acc-descr-block-whitespace-only] [fixture:
er/gram-acc-descr-block-directive-only] [fixture:
er/gram-acc-descr-block-comment-line-only] [fixture:
er/lex-acc-descr-block-brace-in-text] [fixture:
er/lex-acc-descr-block-trailing-spaces] [fixture:
er/lex-acc-descr-block-leading-line-feeds] [fixture:
er/lex-acc-descr-block-direction] [fixture:
er/lex-acc-descr-block-unclosed-empty] [fixture:
er/lex-acc-descr-block-unclosed] [fixture:
er/lex-acc-descr-block-unclosed-lines]

The rules that enter these contexts are rules of the statement context only; in
an attribute block and in the style context, `accTitle` and `accDescr` are words
(see [The attribute block context](#the-attribute-block-context) and
[The style context](#the-style-context)). [fixture: er/lex-block-acc-descr]
[fixture: er/lex-classdef-empty-description-block]

### Comments

This diagram has no comment rule: `#` and `%%` are no comments after a unit, and
the only comments of the diagram are the comment lines and bare `%%` lines that
are read before the lexer (see [Names](#units-and-contexts) and
[Detection](#detection)). Their mark is `%%`, and their value is the text after
the mark. [fixture: er/comment-line] [fixture: er/lex-percent-after-statement]
[fixture: er/header-after-bare-percent-line]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `name`, stands for one unit with
that name, and text in double quotes stands for the unit named by that text,
such as `"subgraph"` or `"{"`. The grammar is a restatement of the grammar in
[`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L102-L334)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in [ast/er.md](../ast/er.md):

| Rule                                                                     | Node                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `diagram`                                                                | ErDiagram                                                             |
| `entity-statement`                                                       | ErEntityStatement; its `attribute-block` is the `attributes` list     |
| `attribute`                                                              | ErAttribute                                                           |
| `relationship-statement`                                                 | ErRelationshipStatement; each `entity-reference` an ErEntityReference |
| `relationship`                                                           | ErRelationship                                                        |
| `subgraph-statement`                                                     | ErSubgraphStatement                                                   |
| `direction-statement`                                                    | ErDirectionStatement, with an ErIgnoredText for each `direction-text` |
| `class-def-statement`                                                    | ErClassDefStatement                                                   |
| `class-statement`                                                        | ErClassStatement                                                      |
| `style-statement`                                                        | ErStyleStatement                                                      |
| `accessibility-statement`                                                | ErAccTitleStatement, ErAccDescrStatement, or ErAccDescrBlockStatement |
| `empty-description-block`                                                | ErAccDescrBlockStatement without text, a statement of its own         |
| `quoted-name`, `string`, `comment-string`, or `backquoted-word`          | StringLiteral                                                         |
| `key`                                                                    | Identifier                                                            |
| `name`, `number`, a `style-text` that is a name, `word`, or `tilde-word` | ErIdentifier                                                          |
| `style-item`, `title-text`, `description-text`, `description-block-text` | ErLiteral                                                             |
| `direction-text`                                                         | ErIgnoredText                                                         |
| `empty-backquotes` between two attributes                                | ErIgnoredText, an item of the `attributes` list                       |

### Diagram and statements

```text
diagram   = "header" line*
line      = statement | newline
statement = entity-statement
          | relationship-statement
          | subgraph-statement
          | direction-statement
          | class-def-statement
          | class-statement
          | style-statement
          | accessibility-statement
          | empty-description-block
```

Nothing separates two statements: a statement may follow another on the same
line, and a `newline` unit between them is a `line` of its own.
`A ||--o{ B : x C ||--o{ D : y` has two relationships, `A B` is two entity
statements, `A ||--o{ B : has it` has the role `has` and the entity `it`, and so
a statement follows a role in quotes, a `}`, a `class` statement, an `accTitle`
line's start, or a `classDef` and `style` statement on the same line only after
its separator. [fixture: er/gram-two-relationships-one-line] [fixture:
er/lex-two-names-one-line] [fixture: er/lex-role-then-name] [fixture:
er/gram-role-string-then-name] [fixture: er/lex-role-string-glued-name]
[fixture: er/gram-block-then-name-one-line] [fixture:
er/gram-block-one-line-then-name] [fixture: er/gram-class-then-name] [fixture:
er/gram-class-then-relationship-one-line] [fixture:
er/gram-acc-title-after-name] [fixture: er/gram-classdef-after-name-one-line]
[fixture: er/gram-style-after-name-one-line] [fixture:
er/gram-relationship-then-name-one-line] The grammar of mermaid.js has a rule
for a `title` statement, but its lexer makes no unit for it
([`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L188)),
so `title T` is the two entities `title` and `T`. [fixture:
er/gram-title-words-as-names]

### Entities

```text
entity-statement = entity-name alias? class-list? attribute-block?
entity-name      = name | number | quoted-name
alias            = "[" entity-name "]"
class-list       = ":::" name ( "," name )*
attribute-block  = "{" block-item* "}"
```

An entity statement is an entity name, with an alias, classes, and an attribute
block or without them: `A`, `A[P]`, `A:::c`, `A { … }`, `A[P]:::c { … }`, and
`"A B"`, `12`, `2.5`, and `1` are entity statements. [fixture:
er/lex-name-unicode-characters] [fixture: er/gram-alias] [fixture:
er/gram-entity-classes] [fixture: er/gram-attribute] [fixture:
er/gram-alias-class-block] [fixture: er/lex-quoted-name] [fixture:
er/lex-name-number] [fixture: er/lex-name-decimal] [fixture: er/lex-name-one]
[fixture: er/db-name-twice]

- The alias is an entity name between `[` and `]`, with whitespace around it or
  not: `p[Person]`, `p [ Person ]`, `p["Per son"]`, `p[12]`, `p[1]`, `"A"[P]`,
  `12[P]`, and `1[P]` are entities with an alias. `p[]` and `p[A B]` are
  rejected. The alias comes before the classes, and an entity with an alias
  takes no relationship on its line: `A:::c[P]`, `p[P] ||--o{ B : x`,
  `p[P]:::c ||--o{ B : x`, `A ||--o{ p[P] : x`, and `A:::c ||--o{ p[P] : x` are
  rejected, while `p[P]:::c`, `p[P] { … }`, `p[P]:::c { … }`, and `p[P]:::c {}`
  are accepted. [fixture: er/gram-alias] [fixture: er/gram-alias-spaces]
  [fixture: er/gram-alias-string] [fixture: er/gram-alias-number] [fixture:
  er/gram-alias-one] [fixture: er/gram-alias-string-name] [fixture:
  er/gram-alias-number-name] [fixture: er/gram-alias-one-name] [fixture:
  er/gram-alias-empty] [fixture: er/gram-alias-two-words] [fixture:
  er/gram-class-list-then-alias] [fixture: er/gram-alias-then-relationship]
  [fixture: er/gram-alias-class-then-relationship] [fixture:
  er/gram-relationship-right-alias] [fixture:
  er/gram-relationship-left-class-right-alias] [fixture:
  er/gram-alias-then-class] [fixture: er/gram-alias-then-block] [fixture:
  er/gram-alias-class-block] [fixture: er/gram-alias-class-empty-block]
- The classes after `:::` are names separated by `,`, with whitespace around the
  `:::` and the `,` or not: `A:::c1,c2`, `A ::: c, d`, and `A:::é,b-c` are
  accepted, while `A:::`, `A:::c,`, `A:::12`, `A:::"c"`, and `A:::c:::d` are
  rejected. [fixture: er/gram-entity-classes] [fixture:
  er/lex-class-separator-spaces-then-names] [fixture: er/lex-class-list-unicode]
  [fixture: er/gram-class-separator-without-class] [fixture:
  er/gram-class-list-trailing-comma] [fixture: er/lex-class-list-number]
  [fixture: er/lex-class-list-string] [fixture: er/gram-two-class-separators]
- The attribute block starts on the line of the name, right after it or after
  whitespace, and may be empty or hold its attributes on one line or on several:
  `A {}`, `A { }`, `A {`, a line break, and `}`, `A {` with blank lines and `}`,
  `A{`, `A {string a}`, and `A { string a } B` are accepted, the last with the
  entity B after it. `A`, a line break, and `{` is rejected, and so is `A:::c`,
  a line break, and `{`, and `A {} ||--o{ B : x`, where the block comes before a
  relationship. [fixture: er/gram-block-empty] [fixture:
  er/gram-block-empty-space] [fixture: er/gram-block-empty-line-feed] [fixture:
  er/gram-block-blank-lines] [fixture: er/lex-block-no-space] [fixture:
  er/gram-block-one-line] [fixture: er/gram-block-one-line-then-name] [fixture:
  er/gram-block-next-line] [fixture: er/gram-classes-then-block-next-line]
  [fixture: er/gram-block-then-relationship] The same name may have a second
  block. [fixture: er/db-block-twice]

### Attributes

```text
block-item     = attribute | empty-backquotes
attribute      = attribute-word "?"? attribute-word key-list? comment-string?
attribute-word = word | tilde-word | backquoted-word
key-list       = key ( "," key )*
```

An attribute is a type, a name, and then its keys and its comment, in this
order, each of the four parts a unit of the attribute block context:
`string name`, `string? middleName`, `int id PK, FK`, `string a "c d"`, and
`int a PK "x"` followed by `string b` are attributes. [fixture:
er/gram-attribute] [fixture: er/gram-optional-type] [fixture:
er/gram-keys-comma-space] [fixture: er/gram-comment] [fixture:
er/gram-attributes-keys-comment]

- The type and the name are each one `word`, `tilde-word`, or `backquoted-word`
  unit, and the type may be followed by `?`: `string? a`, `string ? a`,
  `` `a`? b ``, `List~int~? a`, `int? a~b~`, `` `a` b~c~ ``, and `a~b~ c "d"`
  are attributes. A type without a name, three words, `??`, a `?` after the
  name, a `?` alone, and a `,` alone are rejected: `string`, `string a b`,
  `string?? a`, `string a?`, `? a`, and `string a , b`. [fixture:
  er/gram-optional-type] [fixture: er/lex-optional-type-space] [fixture:
  er/lex-backquote-optional] [fixture: er/lex-tilde-then-optional-mark]
  [fixture: er/lex-optional-then-tilde-name] [fixture:
  er/lex-backquote-then-tilde] [fixture: er/lex-tilde-then-comment] [fixture:
  er/gram-attribute-type-only] [fixture: er/gram-attribute-three-words]
  [fixture: er/gram-optional-type-twice] [fixture: er/gram-optional-name]
  [fixture: er/lex-block-question-alone] [fixture: er/lex-block-comma-alone]
- The keys are `key` units separated by `,`, with whitespace around the `,` or
  not, and may follow the name on a later line: `PK, FK`, `PK,FK`, `PK ,FK`, and
  `PK, FK, UK` are key lists, and so is `PK` on the line after `int a`. `PK FK`
  without `,`, `PK,` with nothing after it, a key where a type or a name is
  expected, and a word after a key are rejected: `int id PK FK`, `int id PK,`,
  `PK id`, `string PK`, and `int a PK b`; `int id,PK` is the attribute named
  `id,PK`, because `,` is a character of a word. [fixture:
  er/gram-keys-comma-space] [fixture: er/gram-keys-comma] [fixture:
  er/lex-keys-space-comma] [fixture: er/gram-keys-three] [fixture:
  er/gram-name-then-key-next-line] [fixture: er/gram-keys-space] [fixture:
  er/gram-keys-trailing-comma] [fixture: er/lex-key-as-type] [fixture:
  er/lex-key-as-name] [fixture: er/gram-key-then-word] [fixture:
  er/lex-key-glued-to-name] [fixture: er/lex-key-lower-case]
- The comment is one `comment-string` unit after the name or the keys, with
  whitespace before it or not, also on a later line: `string a "c d"`,
  `string a ""`, `string a"c"`, `int a PK"c"`, and `int a PK` followed by a line
  `"c"` are attributes, and the comment may hold line feeds and `%%`. A comment
  before the keys, two comments, and a key after the comment are rejected:
  `string a "c" PK`, `string a "c" "d"`, and `int a "c"` followed by a line
  `PK`. The attribute after a comment needs no whitespace: `int a "c"string b`
  is two attributes. [fixture: er/gram-comment] [fixture: er/gram-comment-empty]
  [fixture: er/lex-comment-glued] [fixture: er/lex-key-glued-comment] [fixture:
  er/gram-keys-then-comment-next-line] [fixture: er/lex-comment-line-feed]
  [fixture: er/lex-comment-percent] [fixture: er/gram-comment-before-keys]
  [fixture: er/gram-comment-two] [fixture: er/gram-comment-then-key-next-line]
  [fixture: er/lex-comment-glued-next-attribute]
- An `empty-backquotes` unit, for which mermaid.js reads no token, is a block
  item where it lies between two attributes, before the first, after the last,
  or alone in the block, and the input is accepted: `int a` followed by two
  backquotes and `string b`, two backquotes and `int a`, `int a` and two
  backquotes, two backquotes alone in the block, two such units in a row, also
  with a line break, a comment line, or a directive between them, and two
  backquotes after the keys or after the comment, before `}`. Where it lies
  inside an attribute, between the units of the attribute, the tree has no place
  for it and the input is rejected, while mermaid.js accepts it (see
  [Known divergences](#known-divergences)): between the type and `?`, between
  the type and the name, after `?`, before a key, before or after the `,` of the
  keys, and before a comment, as in `int `` ? a`, `int `` a`, `int? `` a`,
  `int a `` PK`, `int a PK `` , FK`, `int a PK, `` FK`, and `int a `` "c"`.
  Units written one after another, with only whitespace between them, are
  decided together, by the unit after the last of them: `int `` `` a` and
  `int a PK `` `` , FK` are rejected as with one unit. [fixture:
  er/gram-empty-backquotes-between-attributes] [fixture:
  er/gram-empty-backquotes-before-first] [fixture:
  er/gram-empty-backquotes-after-last] [fixture: er/gram-empty-backquotes-alone]
  [fixture: er/gram-empty-backquotes-twice] [fixture:
  er/gram-empty-backquotes-run-across-line-feed] [fixture:
  er/gram-empty-backquotes-run-across-comment-line] [fixture:
  er/gram-empty-backquotes-run-across-directive] [fixture:
  er/div-empty-backquotes-twice-between-type-and-name] [fixture:
  er/div-empty-backquotes-twice-before-key-comma] [fixture:
  er/gram-empty-backquotes-after-keys] [fixture:
  er/gram-empty-backquotes-after-comment] [fixture:
  er/div-empty-backquotes-before-optional-mark] [fixture:
  er/div-empty-backquotes-before-key-comma] [fixture:
  er/div-empty-backquotes-after-key-comma] [fixture:
  er/div-empty-backquotes-between-type-and-name] [fixture:
  er/div-empty-backquotes-after-optional-mark] [fixture:
  er/div-empty-backquotes-before-key] [fixture:
  er/div-empty-backquotes-before-comment]

### Relationships

```text
relationship-statement = entity-reference relationship entity-reference ":" role
entity-reference       = entity-name class-list?
relationship           = cardinality relationship-line cardinality
cardinality            = "zero-or-one" | "zero-or-more" | "one-or-more" | "only-one" | "md-parent"
relationship-line      = "identifying" | "non-identifying"
role                   = string | quoted-name | name
```

A relationship statement is two entity references with a relationship between
them, a `:`, and a role: `A ||--o{ B : has`,
`A one or more to zero or one B : has`, `A:::c ||--o{ B:::d : x`,
`A ||--o{ A : x`, `"A 1" ||--o{ "B 2" : x`, and `12 ||--o{ 3.5 : x` are
relationships. The role is required and is one unit: a string, which may be
empty, hold `%`, or hold line feeds, a quoted name, or a name, after a `:` with
whitespace around it or not. `A ||--o{ B`, `A ||--o{ B has`,
`A ||--o{ B : x : y`, and `A ||--o{ B :: x` are rejected, and so is a role that
is a number, `12` or `1`, or a keyword. The role ends with its unit: in
`A ||--o{ B : has it`, `A ||--o{ B : "x" C`, and `A ||--o{ B : "x"C`, the entity
after it is a statement of its own, and `A ||--o{ B : has many` is rejected,
because `many` is a keyword. [fixture: er/gram-relationship-symbols] [fixture:
er/lex-cardinality-words] [fixture: er/gram-relationship-both-classes] [fixture:
er/gram-relationship-left-classes] [fixture: er/gram-relationship-right-classes]
[fixture: er/db-relationship-self] [fixture: er/gram-relationship-string-names]
[fixture: er/gram-relationship-number-names] [fixture: er/gram-role-string]
[fixture: er/gram-role-string-empty] [fixture: er/lex-role-string-percent]
[fixture: er/lex-role-string-line-feed] [fixture: er/lex-role-unicode] [fixture:
er/lex-colon-no-space] [fixture: er/gram-relationship-without-role] [fixture:
er/gram-role-without-colon] [fixture: er/gram-two-roles] [fixture:
er/lex-double-colon] [fixture: er/lex-role-number] [fixture: er/lex-role-one]
[fixture: er/lex-role-keyword-one] [fixture: er/lex-role-then-name] [fixture:
er/gram-role-string-then-name] [fixture: er/lex-role-string-glued-name]
[fixture: er/lex-role-then-keyword] The three units of the relationship and the
role may not be on a line after the first entity: `A`, a line break, and
`||--o{ B : x`, and `A ||--o{ B :`, a line break, and `x`, are rejected.
[fixture: er/lex-relationship-spec-next-line] [fixture: er/lex-role-next-line]
An end may have the name of a subgraph defined before or after the statement;
how mermaid.js refers the relationship then is in the summary of the tests
package. [fixture: er/db-relationship-to-subgraph-after] [fixture:
er/db-relationship-to-subgraph-before]

### Subgraphs

```text
subgraph-statement = "subgraph" entity-name subgraph-title? empty-description-block* newline line* "end"
subgraph-title     = "[" entity-name+ "]"
```

A subgraph statement is `subgraph`, an entity name, a title in `[` and `]` or
none, a line break, the statements of its body, and `end`: `subgraph S`,
`subgraph S [T1  T2]`, `subgraph S [T]`, `subgraph "S 1"`, `subgraph "S" [T]`,
`subgraph 12`, and `subgraph 1.5` start subgraphs. The title is one or more
entity names, with whitespace between them or not: `["T 1" x]`, `["a"b]`,
`[a"b"]`, `[12 3.5]`, `[1]`, and `[a b c]` are titles, and mermaid.js joins the
names with one space. `subgraph S []`, `subgraph S [T] x`, `subgraph S [T:::c]`,
`subgraph S ["T`, a line break, and `1"]`, and `subgraph S ["T"]x` are rejected.
[fixture: er/gram-subgraph] [fixture: er/gram-subgraph-title] [fixture:
er/lex-subgraph-title-no-space] [fixture: er/gram-subgraph-string-id] [fixture:
er/gram-subgraph-string-id-title] [fixture: er/gram-subgraph-number-id]
[fixture: er/gram-subgraph-decimal-id] [fixture: er/gram-subgraph-title-string]
[fixture: er/lex-subgraph-title-glued-string] [fixture:
er/lex-subgraph-title-word-then-string] [fixture:
er/gram-subgraph-title-numbers] [fixture: er/gram-subgraph-title-one] [fixture:
er/gram-subgraph-title-three-words] [fixture: er/gram-subgraph-title-empty]
[fixture: er/gram-subgraph-title-then-text] [fixture:
er/lex-subgraph-title-class-separator] [fixture:
er/lex-subgraph-title-string-line-feed] [fixture:
er/lex-subgraph-title-then-string-glued]

- After the name or the title, only empty description blocks may come before the
  line break, and they are the first statements of the body (see
  [Empty description blocks](#empty-description-blocks)): `subgraph S x`,
  `subgraph S end`, `subgraph S:::c`, and `subgraph S accDescr {} x` are
  rejected, while `subgraph S accDescr {} accDescr {}` and
  `subgraph S [T] accDescr {}` are accepted. [fixture:
  er/gram-subgraph-id-then-text] [fixture:
  er/gram-subgraph-header-then-end-same-line] [fixture:
  er/gram-subgraph-id-class] [fixture: er/gram-subgraph-header-block-then-text]
  [fixture: er/gram-subgraph-header-blocks] [fixture:
  er/gram-subgraph-title-then-block]
- The name `1` followed by the line break and a line that starts with an ASCII
  letter, `_`, `"`, `'`, or a digit is `only-one` (see
  [The statement context](#the-statement-context)), so `subgraph 1` followed by
  `A`, by `12`, or by `end`, and `subgraph 1` with a space before its line
  break, are rejected. [fixture: er/lex-subgraph-one-id] [fixture:
  er/lex-subgraph-one-id-then-number] [fixture: er/lex-subgraph-one-id-then-end]
  [fixture: er/lex-subgraph-one-id-trailing-space]
- The body holds any statements, subgraphs included, and may be empty; a comment
  line and blank lines may lie in it. `end` closes the innermost subgraph and
  must be there: `subgraph S` followed by `A` and the end of the text,
  `subgraph S` alone, `subgraph S` with a line break at the end of the text, and
  `end` after a closed subgraph or alone are rejected, while `subgraph S`, a
  line `A end`, and `subgraph O`, `subgraph I`, `A`, and `end end` are accepted.
  [fixture: er/gram-subgraph-nested] [fixture: er/gram-subgraph-relationship]
  [fixture: er/gram-subgraph-alias-inside] [fixture:
  er/db-subgraph-classdef-inside] [fixture: er/db-subgraph-class-inside]
  [fixture: er/db-subgraph-style-inside] [fixture:
  er/db-subgraph-acc-title-inside] [fixture: er/db-subgraph-acc-descr-inside]
  [fixture: er/db-subgraph-acc-descr-block-inside] [fixture:
  er/gram-direction-in-subgraph] [fixture: er/gram-subgraph-empty] [fixture:
  er/lex-subgraph-comment-line] [fixture: er/lex-subgraph-blank-lines] [fixture:
  er/gram-subgraph-unclosed] [fixture: er/gram-subgraph-header-at-end] [fixture:
  er/lex-subgraph-header-line-feed-at-end] [fixture: er/gram-end-twice]
  [fixture: er/gram-end-alone] [fixture: er/lex-end-same-line] [fixture:
  er/lex-end-end-same-line] [fixture: er/lex-subgraph-crlf] [fixture:
  er/gram-subgraph-after-header-same-line]
- An entity may have the name of a subgraph: `S` before or after `subgraph S` is
  an entity and a subgraph. [fixture: er/db-subgraph-id-as-name-after] [fixture:
  er/db-subgraph-id-as-name-before]

### Empty description blocks

```text
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `description-block-text` unit. mermaid.js reads
no token for it (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)). It is a
description block statement without text, which changes nothing, wherever a
statement starts: at the start of a line, right after the header, right after
another statement on the same line, and in the body of a subgraph, also right
before `end`; `accDescr {}` followed by `A`, `erDiagram accDescr {}`,
`A accDescr {} B`, `A:::c accDescr {} B`, `A ||--o{ B : x accDescr {}`,
`A ||--o{ B : "x" accDescr {}`, `A ||--o{ B : x accDescr {} C`,
`accDescr {}accDescr {}`, `accDescr {} A` in a subgraph, `A accDescr {} end`,
`accDescr {} end`, and `end accDescr {}` are accepted. Blocks after the name or
the title of a subgraph, before its line break, are the first statements of its
body. A block after `direction LR` on its line is part of the text of the
direction line, and a block after `accTitle:` part of the title. [fixture:
er/gram-acc-descr-block-empty] [fixture: er/header-empty-description-block]
[fixture: er/gram-empty-description-block-between-names] [fixture:
er/gram-empty-description-block-after-classes-then-name] [fixture:
er/gram-empty-description-block-after-relationship] [fixture:
er/gram-empty-description-block-after-role-string] [fixture:
er/gram-empty-description-block-then-name] [fixture:
er/gram-empty-description-blocks-adjacent] [fixture:
er/gram-empty-description-block-first-in-subgraph] [fixture:
er/gram-empty-description-block-before-end] [fixture:
er/gram-empty-description-block-alone-before-end] [fixture:
er/gram-empty-description-block-after-end] [fixture:
er/gram-subgraph-header-blocks] [fixture:
er/lex-direction-line-empty-description-block] [fixture:
er/lex-acc-title-empty-description-block]

A block lies inside a statement instead, and the input is rejected (see
[Known divergences](#known-divergences)), where the unit after it continues the
statement before it or the statement has not ended: between the name of an
entity and its relationship, classes, block, or alias, inside the brackets of an
alias, between `:::` and a class, around the `,` of a class list, between an
alias and `:::`, between the units of a relationship, after the classes of its
right entity, between `subgraph` and its name, between the name and the title,
inside the title, also between two of its names, and between the units of a
`class` statement, `class` and its first name included, also when the block runs
over several lines. Blocks written one after another, with only whitespace
between them, are decided together, by the unit after the last of them:
`A accDescr {} accDescr {} ||--o{ B : x`,
`A ||--o{ B : accDescr {} accDescr {} x`, and
`class accDescr {} accDescr {} A a` are rejected as with one block. So
`A accDescr {} ||--o{ B : x`, `A accDescr {}||--o{ B : x`,
`A:::c accDescr {} ||--o{ B : x`, `A accDescr {} :::c`, `A accDescr {} {`,
`A accDescr {} [P]`, `A ||--o{ accDescr {} B : x`, `A ||--o{ B accDescr {} : x`,
`A ||--o{ B : accDescr {} x`, `class A accDescr {} a`, `A[accDescr {} P]`,
`A[P accDescr {}]`, `A ::: accDescr {} c`, `A:::c, accDescr {} d`,
`A:::c accDescr {} , d`, `A[P] accDescr {} :::c`,
`A ||--o{ B:::c accDescr {} : x`, `subgraph accDescr {} S`,
`subgraph S accDescr {} [T]`, `subgraph S [accDescr {} T]`,
`subgraph S [T accDescr {}]`, `class A, accDescr {} B a`,
`class A a accDescr {} , b`, `class accDescr {} A a`,
`subgraph S [T accDescr {} U]`, and `A accDescr {`, a line break, and
`} ||--o{ B : x` are rejected, as is `A accDescr {}` followed by a line `{`,
which mermaid.js rejects too. In the style context and in an attribute block,
`accDescr` is a word and the `{` is rejected (see
[The style context](#the-style-context)). [fixture:
er/div-empty-description-block-in-relationship] [fixture:
er/div-empty-description-block-before-spec-no-space] [fixture:
er/div-empty-description-block-after-classes] [fixture:
er/div-empty-description-block-before-class-separator] [fixture:
er/div-empty-description-block-before-block] [fixture:
er/div-empty-description-block-before-alias] [fixture:
er/div-empty-description-block-after-spec] [fixture:
er/div-empty-description-block-before-colon] [fixture:
er/div-empty-description-block-before-role] [fixture:
er/div-empty-description-block-in-class] [fixture:
er/div-empty-description-block-in-alias-start] [fixture:
er/div-empty-description-block-in-alias-end] [fixture:
er/div-empty-description-block-after-class-separator] [fixture:
er/div-empty-description-block-after-class-comma] [fixture:
er/div-empty-description-block-before-class-comma] [fixture:
er/div-empty-description-block-after-alias] [fixture:
er/div-empty-description-block-after-right-classes] [fixture:
er/div-empty-description-block-before-subgraph-id] [fixture:
er/div-empty-description-block-before-subgraph-title] [fixture:
er/div-empty-description-block-in-subgraph-title-start] [fixture:
er/div-empty-description-block-in-subgraph-title-end] [fixture:
er/div-empty-description-block-in-class-after-comma] [fixture:
er/div-empty-description-block-in-class-before-comma] [fixture:
er/div-empty-description-block-multiline-in-relationship] [fixture:
er/div-empty-description-block-after-class-keyword] [fixture:
er/div-empty-description-block-between-title-names] [fixture:
er/div-empty-description-blocks-in-relationship] [fixture:
er/div-empty-description-blocks-before-role] [fixture:
er/div-empty-description-blocks-after-class-keyword] [fixture:
er/gram-empty-description-block-then-block-next-line] [fixture:
er/lex-classdef-empty-description-block] [fixture: er/lex-block-acc-descr]

### Other statements

```text
direction-statement     = direction-text? "direction" "direction-value" direction-text?
class-def-statement     = "classDef" style-text ( "," style-text )* styles statement-end
style-statement         = "style" style-text ( "," style-text )* styles statement-end
styles                  = style-item ( "," style-item )*
style-item              = ( style-text | ":" | "#" )+
statement-end           = newline | ";"
class-statement         = "class" name ( "," name )* name ( "," name )*
accessibility-statement = "accTitle" ":" title-text
                        | "accDescr" ":" description-text
                        | "accDescr" "{" description-block-text "}"
```

- A direction statement sets the direction of the diagram, or, in a subgraph, of
  that subgraph, and may be written more than once. `direction LR` at the end of
  the text is one. [fixture: er/gram-direction] [fixture: er/db-direction-twice]
  [fixture: er/gram-direction-in-subgraph] [fixture:
  er/db-direction-in-subgraph-twice] [fixture:
  er/gram-direction-in-nested-subgraph] [fixture: er/lex-direction-at-end]
- In a `classDef` and a `style` statement, the names are `style-text` units
  separated by `,`, and they end at the first unit that no `,` precedes; the
  styles then follow, and at least one is needed. The statement ends with a
  `newline` or a `;` unit; at the end of the text, the line feed of
  [End of text](../common.md#end-of-text) is that `newline`, so the text may not
  end in the style context (see [Units and contexts](#units-and-contexts)). A
  style is the `style-text`, `:`, and `#` units up to the next `,` or the
  separator, and its value is their texts joined (see
  [ErLiteral](../ast/er.md#erliteral)), so `classDef a fill : #f9f` defines
  `fill:#f9f`, and `classDef a fill:red stroke:blue` the one style
  `fill:redstroke:blue`, while `classDef a fill:red , stroke:blue` defines two.
  `classDef a,b fill:red`, `classDef a, b fill:red`,
  `classDef default fill:red`, `classDef a 1`, `classDef a #`, `classDef a :`,
  `classDef a *:red`, `classDef end fill:red`, and `style A, fill:red`, which
  styles A and `fill` with `:red`, are accepted. `classDef a`, `classDef a`
  followed by a line `fill:red`, `style A`, `classDef a fill:red,`,
  `classDef a fill:red,,stroke:blue`, `style ,A fill:red`, and
  `style A,,B fill:red` are rejected. [fixture: er/gram-classdef] [fixture:
  er/lex-classdef-style-spaces] [fixture: er/lex-classdef-styles-joined]
  [fixture: er/lex-style-styles-joined] [fixture: er/lex-classdef-comma-spaces]
  [fixture: er/gram-classdef-two-names] [fixture:
  er/lex-classdef-names-comma-space] [fixture: er/gram-classdef-default]
  [fixture: er/lex-classdef-number-style] [fixture: er/lex-classdef-hash-only]
  [fixture: er/lex-classdef-colon-only] [fixture: er/lex-classdef-star-style]
  [fixture: er/lex-classdef-keyword-end-name] [fixture:
  er/lex-style-trailing-comma] [fixture: er/gram-classdef-without-styles]
  [fixture: er/gram-classdef-without-styles-next-line] [fixture:
  er/gram-style-without-styles] [fixture: er/gram-classdef-trailing-comma]
  [fixture: er/gram-classdef-double-comma] [fixture:
  er/gram-style-leading-comma] [fixture: er/gram-style-double-comma] [fixture:
  er/gram-style] [fixture: er/gram-style-two-names] [fixture:
  er/lex-style-dash-name] [fixture: er/lex-style-star-name] [fixture:
  er/lex-style-unicode-name] [fixture: er/gram-style-number-name] [fixture:
  er/lex-style-hash-first]
- A `class` statement is two lists of names separated by `,`, with whitespace
  around the `,` or not: the names of entities or subgraphs, and the classes.
  The first list ends at the first name that no `,` precedes, and the second at
  the next unit that is no `,` or name: `class A a`, `class A,B a,b`,
  `class A , B a`, `class A a b`, which has the entity `b` after it, and
  `class A a,b c` are accepted. `class A`, `class A` followed by a line `B`,
  `class A, a`, `class 12 a`, `class "A" a`, and `class A end` are rejected.
  [fixture: er/gram-class] [fixture: er/gram-class-two-lists] [fixture:
  er/lex-class-list-comma-spaces] [fixture: er/gram-class-then-name] [fixture:
  er/gram-class-two-lists-then-name] [fixture: er/gram-class-without-classes]
  [fixture: er/gram-class-names-then-line-feed] [fixture:
  er/gram-class-trailing-comma] [fixture: er/lex-class-number] [fixture:
  er/lex-class-string] [fixture: er/lex-class-keyword-end] [fixture:
  er/lex-class-unicode]
- An accessibility statement sets the title or the description, and each may be
  written more than once, as a line or as a block, also as an empty block; how
  mermaid.js reads them into its Db is in the summary of the tests package.
  [fixture: er/gram-acc-title] [fixture: er/gram-acc-descr] [fixture:
  er/gram-acc-descr-block] [fixture: er/db-acc-title-twice] [fixture:
  er/db-acc-descr-twice] [fixture: er/db-acc-descr-then-block] [fixture:
  er/db-acc-descr-block-then-empty]

### Rejections outside the grammar

None. The Db of this diagram throws for no input, so every input that the
grammar accepts is accepted.

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a unit other than a text unit and a string unit makes the
  input rejected in this specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): inside a name, a number,
  a word or a key of an attribute block, a name after `style`, a keyword, a
  cardinality, a relationship line, `:::`, or `[`. [fixture:
  er/div-directive-in-name] [fixture: er/div-directive-in-number-name] [fixture:
  er/div-directive-in-attribute-word] [fixture: er/div-directive-in-key]
  [fixture: er/div-directive-in-style-id] [fixture:
  er/div-directive-in-subgraph-keyword] [fixture:
  er/div-directive-in-cardinality-words] [fixture:
  er/div-directive-in-cardinality-symbol] [fixture:
  er/div-directive-in-class-separator]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule or the `classDef` rule, an ignored `;`
  inside a unit other than a text unit and a string unit makes the input
  rejected here, while mermaid.js removes the `;` and reads the parts as one.
  The `style`, the `:`, and the `#` that the rule looks for may lie anywhere
  before the `;` on the line, as in the role `:"#"` after an entity `Bstyle`, or
  in an attribute comment `"c:#"`: `A ||--o{ Bstyle :"#" C;D` is the entity `CD`
  in mermaid.js, `1;2` the entity `12` and `1.;5` the entity `1.5`, `|;|--o{` a
  cardinality, `on;e or more` and `su;bgraph` keywords, `||-;-o{` a relationship
  line, `C::;:c` the `:::` of a class, in `Astyle { string a "c:#" int x;y }`
  and `int x P;K` a word and a key of the block, and after `BclassDef :"#"` too
  the `C;D` is the entity `CD`. After a string, or inside a string unit or a
  text unit, the reading of mermaid.js is kept. [fixture:
  er/div-ignored-semicolon-in-name] [fixture:
  er/div-ignored-semicolon-in-number] [fixture:
  er/div-ignored-semicolon-in-decimal] [fixture:
  er/div-ignored-semicolon-in-cardinality-symbol] [fixture:
  er/div-ignored-semicolon-in-cardinality-words] [fixture:
  er/div-ignored-semicolon-in-keyword] [fixture:
  er/div-ignored-semicolon-in-relationship-line] [fixture:
  er/div-ignored-semicolon-in-class-separator] [fixture:
  er/div-ignored-semicolon-classdef-rule-in-name] [fixture:
  er/div-ignored-semicolon-in-attribute-word] [fixture:
  er/div-ignored-semicolon-in-key] [fixture:
  er/tokens-ignored-semicolon-after-role] [fixture:
  er/tokens-ignored-semicolon-in-role-string] [fixture:
  er/tokens-ignored-semicolon-in-tilde-word] [fixture:
  er/tokens-ignored-semicolon-in-backquoted-word] [fixture:
  er/tokens-ignored-semicolon-in-acc-title] [fixture:
  er/tokens-ignored-semicolon-in-direction-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `A ||--o{ B : "b="c">d"` has the role
  `b='c'>d` in mermaid.js, while here the string ends at its second `"`, and the
  input is rejected; `"b="c">d"` as an entity name is read in the same way.
  [fixture: er/div-html-tag-starts-in-frontmatter-role] [fixture:
  er/div-html-tag-starts-in-frontmatter-name]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: er/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty description block inside a statement, and an `empty-backquotes` unit
  inside an attribute, make the input rejected in this specification, while
  mermaid.js reads no token for them and accepts the input (see
  [Empty description blocks](#empty-description-blocks) and
  [Attributes](#attributes)). Where a statement starts, an empty description
  block is a statement, and between two attributes an `empty-backquotes` unit is
  an item of the block, and the input is accepted. [fixture:
  er/div-empty-description-block-in-relationship] [fixture:
  er/div-empty-description-block-before-class-separator] [fixture:
  er/div-empty-description-block-before-block] [fixture:
  er/div-empty-description-block-before-alias] [fixture:
  er/div-empty-description-block-after-spec] [fixture:
  er/div-empty-description-block-before-colon] [fixture:
  er/div-empty-description-block-before-role] [fixture:
  er/div-empty-description-block-in-class] [fixture:
  er/div-empty-backquotes-between-type-and-name] [fixture:
  er/div-empty-backquotes-after-optional-mark] [fixture:
  er/div-empty-backquotes-before-key] [fixture:
  er/div-empty-backquotes-before-comment] [fixture:
  er/gram-empty-description-block-between-names] [fixture:
  er/gram-empty-backquotes-between-attributes]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, as an entity name or a role, makes mermaid.js hand the text to the
  C4 parser, which rejects it; here the text is an ER diagram. `C4Context` is a
  name in both. [fixture: er/div-c4-keyword-as-name] [fixture:
  er/div-c4-keyword-as-role] [fixture: er/lex-c4context-name]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone, a line `%%{ }%%`, which is no directive, and a line of
  whitespace only after such a line, before the header, are a comment or nothing
  here, while mermaid.js rejects the input, because the lexer of this diagram
  has no rule for `%` (see [Detection](#detection)). [fixture:
  er/header-after-bare-percent-line] [fixture:
  er/header-after-empty-braces-line] [fixture:
  er/header-after-bare-percent-line-and-whitespace-line]
