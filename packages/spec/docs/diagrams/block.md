# Block diagram

Japanese version: [block.ja.md](./block.ja.md)

Source of truth in mermaid.js:

- [`block.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/parser/block.jison)
- [`blockDB.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/blockDB.ts)
- the tests (`*.spec.ts`) in
  [`block/`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block)

This document covers the diagram type `block`. The nodes of the tree are defined
in [ast/block.md](../ast/block.md). How mermaid.js reads an accepted text into
its Db (the order of the blocks, a block defined twice, the type of a shape) is
in the summary of the tests package.

## Detection

Entry 26 of [detection.md](../detection.md) selects this grammar: the text
starts with `block`, after whitespace, in exactly this case
([`blockDetector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/blockDetector.ts#L6-L6)).
The lexer then reads the header, `block-beta` or `block`, in this case and not
followed by a word character (see
[The statement context](#the-statement-context)): `Block-beta` and `BLOCK` match
no detector, `block-Beta` is the header `block` and text that no rule reads, and
`blockx`, `block_beta`, `block2`, `block-betax`, and `block-alpha` are rejected,
while `blocké` is the header and the node `é`. A header alone, with or without a
line feed, is rejected: the diagram needs a statement. [fixture:
block/header-block-beta] [fixture: block/header-block] [fixture:
block/header-only-block-beta] [fixture: block/header-only-block] [fixture:
block/header-only-block-beta-no-line-break] [fixture: block/header-capitalized]
[fixture: block/header-upper-case] [fixture: block/header-capitalized-block]
[fixture: block/header-word-suffix] [fixture: block/header-dash-suffix]
[fixture: block/header-alpha-suffix] [fixture: block/header-underscore-suffix]
[fixture: block/header-digit-suffix] [fixture: block/header-non-ascii-suffix]
[fixture: block/header-beta-capital] [fixture: block/header-beta-upper]

Whitespace, empty lines, comment lines, directive lines, and a frontmatter
before the header change nothing (see
[Leading whitespace](../common.md#leading-whitespace)); a line that starts with
`#` or `;`, and a statement before the header are detected as no diagram. A line
of `%%` alone, a line `%%{ }%%`, and a line of `%%` alone followed by a line of
spaces before the header are comments (see
[Diagram detection](../common.md#diagram-detection)), while mermaid.js reads
them as a node before the header and rejects the input: the known divergence
[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).
[fixture: block/div-after-bare-percent-line-and-whitespace-line] [fixture:
block/header-indented] [fixture: block/header-tab-indented] [fixture:
block/header-blank-lines-before] [fixture: block/header-nbsp-before] [fixture:
block/header-ideographic-space-before] [fixture: block/header-bom-before]
[fixture: block/header-ls-before] [fixture: block/header-after-comment-line]
[fixture: block/header-after-directive-line] [fixture:
block/header-after-whitespace-line] [fixture: block/header-after-frontmatter]
[fixture: block/header-after-frontmatter-and-comment] [fixture:
block/header-after-hash-line] [fixture: block/header-after-semicolon-line]
[fixture: block/header-leading-semicolon] [fixture:
block/header-statement-first]

On the line of the header, a statement may follow the header after whitespace,
and a `;` or `%%` after it is a node, not a separator or a comment. A second
header opens a composite, which `end` must close (see
[Composites](#composites)). After the header, a vertical tab, a form feed, and
the whitespace characters outside ASCII are whitespace, a CR and a CRLF end the
line, and a U+0085 is part of the id after it. [fixture:
block/header-spaced-word-suffix] [fixture:
block/header-statement-on-header-line] [fixture:
block/header-statement-on-header-line-tab] [fixture:
block/header-columns-on-header-line] [fixture: block/header-semicolon] [fixture:
block/header-semicolon-spaced] [fixture: block/header-comment-on-header-line]
[fixture: block/header-comment-glued] [fixture: block/header-twice] [fixture:
block/header-twice-closed] [fixture: block/header-twice-same-line] [fixture:
block/header-twice-block] [fixture: block/header-keyword-header-in-text]
[fixture: block/header-trailing-spaces] [fixture: block/header-trailing-tab]
[fixture: block/header-trailing-nbsp] [fixture: block/header-bom-after]
[fixture: block/header-ls-after] [fixture: block/header-ps-after] [fixture:
block/header-nel-after] [fixture: block/header-vt-after] [fixture:
block/header-ff-after] [fixture: block/header-cr] [fixture: block/header-crlf]
[fixture: block/header-directive-glued]

## Lexical structure

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it. At each position, the lexer
applies the first rule of the current context that matches there. When no rule
of the current context matches, the input is rejected; the lists below do not
repeat this. The text may end in the statement context only: a string, a shape,
a block arrow, an edge label, and the rest of a `classDef`, `class`, or `style`
line are closed or end at the end of the text, and a composite must be closed by
`end` (see [Composites](#composites)).

**Whitespace and line breaks.** Whitespace is the set of
[Notation](../common.md#notation), line feeds included: a line break of the
source is whitespace like a space, so statements need no separator, and a
statement may run over several lines. Between two ids, a tab, a vertical tab, a
form feed, a CR, a CRLF, U+00A0, U+2028, U+2029, U+3000, and U+FEFF separate
them, while a U+0085 is no whitespace and joins the two words into one id. A
comment line or a directive line between the parts of a statement is no part of
the diagram text, so `columns`, a line `%% c`, and `2` is `columns 2`. [fixture:
block/db-name-tab-between] [fixture: block/db-name-nbsp-between] [fixture:
block/db-name-ideographic-between] [fixture: block/db-name-bom-between]
[fixture: block/db-name-ls-between] [fixture: block/db-name-ps-between]
[fixture: block/db-name-nel-between] [fixture: block/db-name-vt-between]
[fixture: block/db-name-ff-between] [fixture: block/db-name-cr-between]
[fixture: block/db-name-crlf-between] [fixture: block/db-name-ls-around]
[fixture: block/db-name-trailing-spaces] [fixture: block/db-name-indented-more]
[fixture: block/db-name-blank-lines] [fixture: block/db-name-no-final-line-feed]
[fixture: block/db-grid-tab-id] [fixture: block/db-grid-tab-composite-id]
[fixture: block/db-grid-lf-id] [fixture: block/db-grid-lf-composite-id]
[fixture: block/db-grid-cr-id] [fixture: block/db-grid-cr-composite-id]
[fixture: block/db-grid-crlf-id] [fixture: block/db-grid-crlf-composite-id]
[fixture: block/db-grid-ls-id] [fixture: block/db-grid-ls-composite-id]
[fixture: block/db-grid-ps-id] [fixture: block/db-grid-ps-composite-id]
[fixture: block/db-grid-nbsp-id] [fixture: block/db-grid-nbsp-composite-id]
[fixture: block/db-grid-bom-id] [fixture: block/db-grid-bom-composite-id]
[fixture: block/db-grid-ideographic-id] [fixture:
block/db-grid-ideographic-composite-id] [fixture: block/db-grid-ff-id] [fixture:
block/db-grid-ff-composite-id] [fixture: block/db-grid-vt-id] [fixture:
block/db-grid-vt-composite-id] [fixture: block/db-grid-spaces-id] [fixture:
block/db-grid-spaces-composite-id] [fixture: block/db-grid-nel-id] [fixture:
block/db-grid-nel-composite-id] [fixture: block/db-between-columns-comment-line]
[fixture: block/db-between-columns-directive-line] [fixture:
block/db-between-columns-empty-line] [fixture:
block/db-between-columns-spaces-line] [fixture:
block/db-between-class-def-name-comment-line] [fixture:
block/db-between-class-def-name-directive-line] [fixture:
block/db-between-class-def-name-empty-line] [fixture:
block/db-between-class-def-name-spaces-line] [fixture:
block/db-between-class-def-style-comment-line] [fixture:
block/db-between-class-def-style-directive-line] [fixture:
block/db-between-class-def-style-empty-line] [fixture:
block/db-between-class-def-style-spaces-line] [fixture:
block/db-between-class-ids-comment-line] [fixture:
block/db-between-class-ids-directive-line] [fixture:
block/db-between-class-ids-empty-line] [fixture:
block/db-between-class-ids-spaces-line] [fixture:
block/db-between-class-name-comment-line] [fixture:
block/db-between-class-name-directive-line] [fixture:
block/db-between-class-name-empty-line] [fixture:
block/db-between-class-name-spaces-line] [fixture:
block/db-between-style-ids-comment-line] [fixture:
block/db-between-style-ids-directive-line] [fixture:
block/db-between-style-ids-empty-line] [fixture:
block/db-between-style-ids-spaces-line] [fixture:
block/gram-between-style-text-comment-line] [fixture:
block/gram-between-style-text-directive-line] [fixture:
block/gram-between-style-text-empty-line] [fixture:
block/gram-between-style-text-spaces-line] [fixture:
block/db-between-composite-id-comment-line] [fixture:
block/db-between-composite-id-directive-line] [fixture:
block/db-between-composite-id-empty-line] [fixture:
block/db-between-composite-id-spaces-line] [fixture:
block/db-comment-between-id-and-width] [fixture:
block/db-between-width-directive-line] [fixture:
block/db-between-width-empty-line] [fixture: block/db-between-width-spaces-line]
[fixture: block/db-between-edge-comment-line] [fixture:
block/db-between-edge-directive-line] [fixture:
block/db-between-edge-empty-line] [fixture: block/db-between-edge-spaces-line]
[fixture: block/db-between-edge-end-comment-line] [fixture:
block/db-between-edge-end-directive-line] [fixture:
block/db-between-edge-end-empty-line] [fixture:
block/db-between-edge-end-spaces-line] [fixture:
block/db-between-shape-comment-line] [fixture:
block/db-between-shape-directive-line] [fixture:
block/db-between-shape-empty-line] [fixture: block/db-between-shape-spaces-line]
[fixture: block/db-between-directions-comment-line] [fixture:
block/db-between-directions-directive-line] [fixture:
block/db-between-directions-empty-line] [fixture:
block/db-between-directions-spaces-line]

**Comments.** This diagram type has no comment rule: comment lines are removed
before the lexer reads the text (see
[Comment lines](../common.md#comment-lines)), and a `%%` that does not start a
line is the text of an id, a class name, or a style, as is `%%` alone on a line.
[fixture: block/db-comment-line] [fixture: block/db-comment-line-indented]
[fixture: block/db-comment-line-tab] [fixture: block/db-comment-line-glued]
[fixture: block/db-comment-line-bare] [fixture:
block/db-comment-line-bare-spaces] [fixture:
block/db-comment-line-single-percent] [fixture: block/db-comment-line-hash]
[fixture: block/db-comment-line-triple] [fixture: block/db-comment-line-first]
[fixture: block/db-comment-line-last] [fixture:
block/db-comment-line-last-no-line-feed] [fixture: block/gram-comment-line-only]
[fixture: block/db-comment-lines-two] [fixture:
block/db-comment-before-header-and-after] [fixture:
block/db-comment-inside-composite] [fixture:
block/db-comment-between-composite-lines] [fixture:
block/db-comment-between-edge-parts] [fixture: block/db-comment-crlf] [fixture:
block/db-comment-cr] [fixture: block/db-comment-ls-inside] [fixture:
block/db-comment-ps-inside] [fixture: block/db-comment-nel-inside] [fixture:
block/db-comment-bom-before] [fixture: block/db-comment-nbsp-before] [fixture:
block/db-comment-ideographic-before] [fixture: block/db-comment-ls-before]
[fixture: block/db-comment-directive-like] [fixture: block/db-comment-proto]
[fixture: block/db-comment-long] [fixture: block/db-comment-unicode] [fixture:
block/db-comment-markers-inside] [fixture:
block/db-comment-quote-unclosed-inside] [fixture: block/db-label-comment-line]
[fixture: block/db-label-comment-line-spaced] [fixture:
block/db-edge-label-comment-line] [fixture: block/db-comment-after-node]
[fixture: block/db-comment-after-node-glued] [fixture:
block/db-comment-after-edge] [fixture: block/db-comment-after-columns] [fixture:
block/db-composite-end-comment] [fixture: block/db-comment-inside-string-start]
[fixture: block/db-label-comment] [fixture: block/db-comment-after-style]
[fixture: block/db-class-apply-comment] [fixture: block/db-class-def-comment]
[fixture: block/db-style-comment] [fixture: block/db-name-percent-percent]
[fixture: block/db-tail-node-comment] [fixture: block/db-tail-columns-comment]
[fixture: block/db-tail-space-comment] [fixture: block/db-tail-class-comment]
[fixture: block/db-tail-class-def-comment] [fixture:
block/db-tail-style-comment]

**Entities, HTML attribute quotes, and `style` lines.** In a string, a class
name, and a style, an entity is read as its placeholder (see
[Entities](../common.md#entities)), the attribute quotes of an HTML tag are read
as `'` (see [HTML attribute quotes](../common.md#html-attribute-quotes)), and
the `;` that the line rule of `style` and `classDef` lines ignores (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)) is left
out. [fixture: block/db-class-def-semicolon-end] [fixture:
block/db-class-def-semicolon-middle] [fixture:
block/db-class-def-semicolon-comma] [fixture: block/db-class-def-two-semicolons]
[fixture: block/db-class-def-space-semicolon] [fixture: block/db-class-def-hash]
[fixture: block/db-class-def-directive] [fixture: block/db-class-def-quotes]
[fixture: block/db-class-def-html] [fixture: block/db-class-def-entity]
[fixture: block/db-class-def-colon-hash-semicolon] [fixture:
block/db-class-def-nbsp] [fixture: block/db-semicolon-in-class-def] [fixture:
block/db-semicolon-class-def-then-node] [fixture: block/db-style-semicolon-end]
[fixture: block/db-style-semicolon-middle] [fixture:
block/db-style-semicolon-comma] [fixture: block/db-style-empty-style] [fixture:
block/db-style-line-rule-hash] [fixture: block/db-style-entity] [fixture:
block/db-style-directive] [fixture: block/db-style-quotes] [fixture:
block/db-style-nbsp] [fixture: block/db-semicolon-in-style]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a string, a class name, or a style
keeps the reading of mermaid.js, while a directive inside an id, a keyword, the
header, an arrow, a direction of a block arrow, or the name of a class of
`classDef` makes the input rejected, where mermaid.js joins the parts:
`A%%{init: {}}%%B`, `col%%{init: {}}%%umns 2`, `e%%{init: {}}%%nd`,
`blo%%{init: {}}%%ck-beta`, `A -%%{init: {}}%%-> B`, and
`A<["x"]>(rig%%{init: {}}%%ht)`. This is the known divergence
[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).
A directive between two units, also glued to them, is allowed: `A%%{init: {}}%%`
followed by `:2`, `-->B`, or a line feed, `space:` followed by it and `2`, and
one between the string of a shape or a block arrow and its opening or closing. A
directive that is not closed runs to the end of the text (see
[Where a directive is](../common.md#where-a-directive-is)). [fixture:
block/div-directive-in-id] [fixture: block/div-directive-inside-direction]
[fixture: block/div-directive-inside-class-keyword] [fixture:
block/div-directive-inside-end] [fixture: block/div-directive-inside-header]
[fixture: block/div-directive-inside-keyword] [fixture:
block/div-grid-directive-class-apply-id] [fixture:
block/div-grid-directive-class-def-name] [fixture:
block/div-grid-directive-composite-id] [fixture: block/div-grid-directive-id]
[fixture: block/div-grid-directive-style-id] [fixture:
block/div-spec-edge-directive-before-head] [fixture:
block/div-spec-edge-directive-in-arrow] [fixture:
block/div-spec-edge-directive-in-label-start] [fixture:
block/div-spec-edge-directive-in-start] [fixture: block/db-directive-init-line]
[fixture: block/db-directive-init-before-header] [fixture:
block/db-directive-init-block-config] [fixture: block/db-directive-wrap]
[fixture: block/db-directive-not-init] [fixture: block/db-directive-multi-line]
[fixture: block/db-directive-two] [fixture: block/db-directive-between-ids]
[fixture: block/db-directive-at-end-of-line] [fixture:
block/db-directive-inside-string] [fixture: block/db-directive-inside-shape]
[fixture: block/db-directive-glued-to-id] [fixture:
block/db-directive-glued-to-width] [fixture:
block/db-directive-between-colon-and-width] [fixture:
block/db-directive-between-space-colon-and-width] [fixture:
block/db-directive-after-shape-label] [fixture:
block/db-directive-before-block-arrow-label] [fixture:
block/db-directive-after-block-arrow-label] [fixture:
block/db-directive-glued-to-edge] [fixture:
block/db-directive-line-feed-inside-id] [fixture:
block/db-directive-spaces-around] [fixture: block/db-directive-class-def-line]
[fixture: block/db-directive-after-end-of-text] [fixture:
block/gram-directive-unclosed] [fixture:
block/db-directive-unclosed-end-of-text] [fixture:
block/gram-directive-unclosed-word-next-line] [fixture:
block/gram-directive-empty] [fixture: block/gram-directive-only] [fixture:
block/db-label-directive] [fixture: block/db-label-directive-line] [fixture:
block/db-edge-label-directive] [fixture: block/db-tail-node-directive] [fixture:
block/db-tail-node-directive-unclosed] [fixture:
block/db-tail-node-shape-directive] [fixture:
block/db-tail-node-width-directive] [fixture: block/db-tail-edge-directive]
[fixture: block/db-tail-edge-label-directive] [fixture:
block/db-tail-block-arrow-directive] [fixture: block/db-tail-columns-directive]
[fixture: block/db-tail-space-directive] [fixture:
block/db-tail-class-directive] [fixture: block/db-tail-style-directive]
[fixture: block/db-tail-class-def-directive-unclosed] [fixture:
block/db-tail-composite-end-directive] [fixture:
block/db-tail-composite-end-keyword-directive]

### The statement context

The rules of the statement context, in the order they are tried:

1. `block-beta`, `block:`, and `block`, the first and the last not followed by a
   word character: the header, a `block:` unit, or a `block` unit, which opens a
   composite.
2. One or more whitespace characters, line feeds included: nothing.
3. `columns`, whitespace, and digits: a `columns` unit with the number, and
   `columns`, whitespace, and `auto`: a `columns` unit with `auto`.
4. `"` and a backquote: enters the markdown string context, and `"`: enters the
   string context (see [Strings](#strings)).
5. `space:` and digits, and `space` not followed by a word character: a `space`
   unit.
6. `default`, `linkStyle`, and `interpolate`, not followed by a word character:
   a unit that no rule of the grammar takes.
7. `classDef` and whitespace, `class` and whitespace, and `style` and
   whitespace: enter the class definition, class, and style contexts (see
   [Classes and styles](#classes-and-styles)).
8. `accTitle`, whitespace, and `:`, `accDescr`, whitespace, and `:`, and
   `accDescr`, whitespace, and `{`: units that no rule of the grammar takes, but
   for the empty description block (see
   [Empty description blocks](#empty-description-blocks)).
9. `end`, not followed by a word character, and the whitespace after it: an
   `end` unit.
10. The opening of a **shape** (see [Shapes](#shapes)), which enters the shape
    context, and `<[`, which enters the block arrow context.
11. An **id**: one or more characters other than whitespace and `(`, `[`, `-`,
    `)`, `{`, `}`, `<`, `>`, `:`, and `=`: an `id` unit.
12. An **arrow** or an **opening arrow** (see [Edges](#edges)).
13. `:` and digits: a `width` unit.

The keywords are read in this case only. A keyword is tried before an id, so a
keyword is read where a unit starts, and an id reads all the characters it may
hold, so a keyword inside a word is part of the id: `friend`, `endless`,
`mycolumns`, `blockade`, `classy`, `styled`, `spaceship`, and `space1` are ids,
while `space.a`, `space;`, `end.x`, and `end;` are the keyword and an id. A
keyword in another case is an id: `Space`, `END`, `Columns 2`, and `COLUMNS 2`
are ids, and `END` where `end` would close a composite leaves it unclosed.
`columns` is a keyword only when whitespace and digits or `auto` follow it, so
`columns`, `columns x`, `columns2`, and `columnsauto` are ids, `columns:2` is
the id `columns` with the width 2, and the number ends at the first character
that is no digit: `columns 2.5` is the columns 2 and the id `.5`, while
`columns -1` and `columns 2:3` are rejected. `title t` is two ids, and
`default`, `linkStyle`, and `interpolate` are rejected. An id is tried before an
arrow, so `x`, `o`, and `~` before dashes start an id: `A x--x B` is the id A
and an edge from `x`, and `~~~` and `A~~~B` are ids. [fixture:
block/db-statement-many-line] [fixture: block/db-statement-mixed-line] [fixture:
block/db-statement-columns-between] [fixture:
block/db-statement-statements-then-class] [fixture:
block/db-statement-statements-then-style] [fixture:
block/db-statement-statements-then-class-def] [fixture:
block/db-statement-edge-then-class] [fixture:
block/db-statement-class-then-node] [fixture:
block/db-statement-order-class-def-last] [fixture:
block/db-statement-long-diagram] [fixture: block/db-statement-tab-indent]
[fixture: block/db-statement-no-indent] [fixture:
block/db-statement-deep-indent] [fixture:
block/db-statement-trailing-whitespace-lines] [fixture:
block/db-statement-final-spaces] [fixture: block/db-statement-final-lines]
[fixture: block/db-statement-leading-blank-lines] [fixture:
block/db-statement-control] [fixture: block/db-statement-delete] [fixture:
block/db-statement-keywords-as-ids] [fixture:
block/gram-statement-block-as-node] [fixture:
block/db-statement-end-keyword-inside-id] [fixture:
block/db-statement-end-prefix-id] [fixture:
block/db-statement-keywords-inside-ids] [fixture:
block/gram-name-reserved-default] [fixture:
block/gram-name-reserved-default-after-node] [fixture:
block/db-name-reserved-default-in-class-def] [fixture:
block/db-name-reserved-default-in-label] [fixture:
block/db-name-reserved-default-in-style] [fixture:
block/db-name-reserved-default-prefix] [fixture:
block/db-name-reserved-default-upper] [fixture:
block/gram-name-reserved-interpolate] [fixture:
block/gram-name-reserved-interpolate-after-node] [fixture:
block/db-name-reserved-interpolate-prefix] [fixture:
block/gram-name-reserved-link-style] [fixture:
block/db-name-reserved-link-style-in-class] [fixture:
block/db-name-reserved-link-style-in-label] [fixture:
block/db-name-reserved-link-style-prefix] [fixture:
block/gram-name-reserved-link-style-statement] [fixture: block/db-columns-plus]
[fixture: block/gram-columns-negative] [fixture: block/db-columns-decimal]
[fixture: block/db-columns-exponent] [fixture: block/db-columns-hexadecimal]
[fixture: block/db-columns-fullwidth-digit] [fixture:
block/db-columns-arabic-digit] [fixture: block/gram-columns-colon-number]
[fixture: block/db-columns-no-number] [fixture: block/db-columns-no-number-last]
[fixture: block/db-columns-word] [fixture: block/db-columns-auto-upper]
[fixture: block/db-columns-auto-suffix] [fixture: block/db-columns-auto-glued]
[fixture: block/db-columns-glued-number] [fixture: block/db-columns-upper-case]
[fixture: block/db-columns-upper-case-all] [fixture:
block/db-columns-two-numbers]

So an id holds `_`, `.`, `/`, `,`, `|`, `#`, `&`, `%`, `$`, `*`, `+`, `~`, `^`,
`@`, `!`, `?`, a backquote, a backslash, `;`, `"`, `]`, control characters, and
every character outside ASCII but the whitespace, and it may start with any of
them: `A;B`, `50%`, `A"x"`, and `A""` are ids, and a `;` after an id and a space
is an id of its own. Ids keep their case. `__proto__`, `constructor`, and `root`
are ids like any other; `root` is the id of the block that holds the diagram
(see the summary of the tests package). [fixture: block/db-name-two] [fixture:
block/db-name-three-lines] [fixture: block/db-name-digits] [fixture:
block/db-name-digits-and-letters] [fixture: block/db-name-underscore] [fixture:
block/db-name-underscore-first] [fixture: block/db-name-dot] [fixture:
block/db-name-slash] [fixture: block/db-name-comma] [fixture:
block/db-name-pipe] [fixture: block/db-name-hash] [fixture:
block/db-name-ampersand] [fixture: block/db-name-percent] [fixture:
block/db-name-dollar] [fixture: block/db-name-asterisk] [fixture:
block/db-name-plus] [fixture: block/db-name-tilde] [fixture:
block/db-name-caret] [fixture: block/db-name-at] [fixture:
block/db-name-exclamation] [fixture: block/db-name-question] [fixture:
block/db-name-backtick] [fixture: block/db-name-backslash] [fixture:
block/db-name-semicolon] [fixture: block/db-name-quote] [fixture:
block/db-name-single-quote] [fixture: block/db-name-brackets-in-id] [fixture:
block/db-name-non-ascii] [fixture: block/db-name-cjk] [fixture:
block/db-name-emoji] [fixture: block/db-name-long] [fixture:
block/db-name-same-twice] [fixture: block/db-name-same-three] [fixture:
block/db-name-case] [fixture: block/db-name-leading-digits] [fixture:
block/db-name-percent-first] [fixture: block/db-name-hash-first] [fixture:
block/db-name-semicolon-first] [fixture: block/gram-name-dash] [fixture:
block/gram-name-dash-first] [fixture: block/gram-name-colon] [fixture:
block/gram-name-equals] [fixture: block/gram-name-less-than] [fixture:
block/gram-name-greater-than] [fixture: block/gram-name-brace] [fixture:
block/gram-name-close-paren] [fixture: block/gram-grid-open-square-id] [fixture:
block/gram-grid-open-round-id] [fixture: block/gram-grid-open-brace-id]
[fixture: block/gram-grid-punct-id] [fixture: block/db-grid-arrow-id] [fixture:
block/db-grid-arrow-spaced-id] [fixture: block/db-grid-comment-id] [fixture:
block/db-grid-comment-line-id] [fixture: block/db-grid-directive-line-id]
[fixture: block/db-grid-entity-id] [fixture: block/db-grid-entity-named-id]
[fixture: block/gram-grid-html-id] [fixture: block/gram-grid-html-br-id]
[fixture: block/gram-grid-html-attribute-id] [fixture:
block/db-grid-ampersand-entity-id] [fixture: block/gram-grid-keyword-end-id]
[fixture: block/gram-grid-keyword-block-id] [fixture:
block/db-grid-keyword-columns-id] [fixture: block/db-grid-keyword-space-id]
[fixture: block/db-grid-keyword-class-id] [fixture:
block/gram-grid-keyword-style-id] [fixture: block/db-grid-keyword-classdef-id]
[fixture: block/gram-grid-keyword-header-id] [fixture: block/db-grid-proto-id]
[fixture: block/db-grid-constructor-id] [fixture: block/db-grid-root-id]
[fixture: block/db-grid-nonascii-id] [fixture: block/db-grid-emoji-id] [fixture:
block/db-grid-digits-id] [fixture: block/db-grid-empty-id] [fixture:
block/gram-grid-style-rule-id] [fixture: block/gram-grid-classdef-rule-id]
[fixture: block/db-semicolon-after-node] [fixture: block/db-semicolon-between]
[fixture: block/db-semicolon-space-before] [fixture: block/db-semicolon-alone]
[fixture: block/db-semicolon-double] [fixture: block/db-semicolon-after-width]
[fixture: block/db-semicolon-after-shape] [fixture:
block/db-semicolon-after-edge] [fixture:
block/db-semicolon-separates-statements-line] [fixture:
block/db-tail-node-semicolon] [fixture: block/db-tail-node-space-semicolon]
[fixture: block/db-tail-node-hash] [fixture:
block/db-tail-node-shape-space-semicolon] [fixture:
block/db-tail-node-shape-two-semicolons] [fixture:
block/db-tail-node-width-space-semicolon] [fixture:
block/db-tail-node-width-two-semicolons] [fixture:
block/db-tail-edge-space-semicolon] [fixture: block/db-tail-edge-two-semicolons]
[fixture: block/db-tail-edge-hash] [fixture:
block/db-tail-block-arrow-semicolon] [fixture:
block/db-tail-block-arrow-space-semicolon] [fixture:
block/db-tail-block-arrow-two-semicolons] [fixture:
block/db-tail-columns-semicolon] [fixture:
block/db-tail-columns-space-semicolon] [fixture:
block/db-tail-columns-two-semicolons] [fixture: block/db-tail-columns-hash]
[fixture: block/db-tail-space-space-semicolon] [fixture:
block/db-tail-space-two-semicolons] [fixture: block/db-tail-space-hash]
[fixture: block/db-tail-space-width-semicolon] [fixture:
block/db-tail-class-space-semicolon] [fixture:
block/db-tail-class-two-semicolons] [fixture: block/db-tail-class-hash]
[fixture: block/db-tail-style-semicolon] [fixture:
block/db-tail-style-space-semicolon] [fixture:
block/db-tail-style-two-semicolons] [fixture: block/db-tail-style-hash]
[fixture: block/db-tail-class-def-semicolon] [fixture:
block/db-tail-class-def-space-semicolon] [fixture:
block/db-tail-class-def-two-semicolons] [fixture: block/db-tail-class-def-hash]
[fixture: block/db-tail-composite-end-space-semicolon] [fixture:
block/db-tail-composite-end-two-semicolons] [fixture:
block/db-tail-composite-end-hash] [fixture:
block/db-tail-composite-end-keyword-semicolon] [fixture:
block/db-tail-composite-end-keyword-hash] [fixture:
block/gram-tail-composite-line-semicolon] [fixture: block/db-proto-proto]
[fixture: block/db-proto-constructor] [fixture: block/db-proto-to-string]
[fixture: block/db-proto-has-own-property] [fixture: block/db-proto-value-of]
[fixture: block/db-proto-proto-twice] [fixture: block/db-proto-proto-shape]
[fixture: block/db-proto-proto-width] [fixture:
block/db-proto-proto-composite-child] [fixture: block/db-proto-proto-edge-label]
[fixture: block/db-proto-proto-undefined-class] [fixture: block/db-label-proto]
[fixture: block/db-label-constructor] [fixture: block/db-composite-proto-id]
[fixture: block/db-composite-constructor-id] [fixture: block/db-arrow-proto]
[fixture: block/db-class-apply-proto-id] [fixture:
block/db-class-apply-proto-class] [fixture:
block/db-class-apply-constructor-class] [fixture: block/db-style-proto-id]
[fixture: block/db-style-constructor-id] [fixture: block/db-class-def-proto]
[fixture: block/db-class-def-constructor] [fixture: block/db-edge-proto]

### Strings

`"` enters the string context, which reads all the characters up to the next `"`
as a `string` unit and leaves at that `"`. The text may hold any character but
`"`, line feeds included: whitespace at its ends, brackets, braces, `<`, `>`, an
arrow, `:`, `;`, `#`, `%%`, keywords, and characters outside ASCII. A string has
no escape, and a string that is not closed makes the input rejected. A quote
followed by a backquote is a markdown string, which no rule of the grammar
takes: ``A["`x`"]`` is rejected. An empty string, `""`, and an empty markdown
string read no unit (see [Empty strings](#empty-strings)). [fixture:
block/db-label-plain] [fixture: block/gram-label-empty] [fixture:
block/db-label-spaces] [fixture: block/db-label-padded] [fixture:
block/gram-label-single-quote] [fixture: block/gram-label-unquoted] [fixture:
block/gram-label-unquoted-space] [fixture: block/gram-label-unclosed] [fixture:
block/gram-label-unclosed-shape] [fixture: block/gram-label-quote-inside]
[fixture: block/gram-label-backslash-quote] [fixture: block/db-label-backslash]
[fixture: block/db-label-escaped-n] [fixture:
block/db-label-single-quote-inside] [fixture: block/gram-label-backtick]
[fixture: block/db-label-backtick-inside] [fixture:
block/gram-label-backtick-start] [fixture: block/db-label-backtick-end]
[fixture: block/gram-label-markdown] [fixture: block/db-label-round-brackets]
[fixture: block/db-label-square-brackets] [fixture: block/db-label-braces]
[fixture: block/db-label-angle] [fixture: block/db-label-arrow] [fixture:
block/db-label-colon] [fixture: block/db-label-semicolon] [fixture:
block/db-label-hash] [fixture: block/db-label-percent] [fixture:
block/db-label-non-ascii] [fixture: block/db-label-emoji] [fixture:
block/db-label-long] [fixture: block/db-label-keyword] [fixture:
block/db-label-keyword-columns] [fixture: block/db-label-equals-id] [fixture:
block/db-label-line-feed] [fixture: block/db-label-crlf] [fixture:
block/db-label-cr] [fixture: block/db-label-tab] [fixture: block/db-label-ls]
[fixture: block/db-label-ps] [fixture: block/db-label-nbsp] [fixture:
block/db-label-ideographic] [fixture: block/db-label-bom] [fixture:
block/db-label-nel] [fixture: block/db-label-entity-numeric] [fixture:
block/db-label-entity-named] [fixture: block/db-label-entity-no-semicolon]
[fixture: block/db-label-html-tag] [fixture: block/db-label-html-br] [fixture:
block/db-label-html-br-slash] [fixture: block/db-label-html-script] [fixture:
block/db-label-html-attribute] [fixture: block/db-label-html-attribute-double]
[fixture: block/db-label-ampersand] [fixture: block/db-label-after-string]
[fixture: block/db-label-after-string-glued] [fixture:
block/gram-label-string-only] [fixture: block/db-label-string-after-id]
[fixture: block/gram-label-string-after-space] [fixture:
block/db-grid-tab-block-arrow-label] [fixture: block/db-grid-tab-edge-label]
[fixture: block/db-grid-tab-composite-label] [fixture:
block/db-grid-lf-block-arrow-label] [fixture: block/db-edge-label-line-feed]
[fixture: block/db-grid-lf-composite-label] [fixture:
block/db-grid-cr-block-arrow-label] [fixture: block/db-grid-cr-edge-label]
[fixture: block/db-grid-cr-composite-label] [fixture:
block/db-grid-crlf-block-arrow-label] [fixture: block/db-grid-crlf-edge-label]
[fixture: block/db-grid-crlf-composite-label] [fixture:
block/db-grid-ls-block-arrow-label] [fixture: block/db-grid-ls-edge-label]
[fixture: block/db-grid-ls-composite-label] [fixture:
block/db-grid-ps-block-arrow-label] [fixture: block/db-grid-ps-edge-label]
[fixture: block/db-grid-ps-composite-label] [fixture:
block/db-grid-nbsp-block-arrow-label] [fixture: block/db-grid-nbsp-edge-label]
[fixture: block/db-grid-nbsp-composite-label] [fixture: block/db-grid-bom-label]
[fixture: block/db-grid-bom-block-arrow-label] [fixture:
block/db-grid-bom-edge-label] [fixture: block/db-grid-bom-composite-label]
[fixture: block/db-grid-ideographic-block-arrow-label] [fixture:
block/db-grid-ideographic-edge-label] [fixture:
block/db-grid-ideographic-composite-label] [fixture: block/db-grid-ff-label]
[fixture: block/db-grid-ff-block-arrow-label] [fixture:
block/db-grid-ff-edge-label] [fixture: block/db-grid-ff-composite-label]
[fixture: block/db-grid-vt-label] [fixture: block/db-grid-vt-block-arrow-label]
[fixture: block/db-grid-vt-edge-label] [fixture:
block/db-grid-vt-composite-label] [fixture: block/db-grid-spaces-label]
[fixture: block/db-grid-spaces-block-arrow-label] [fixture:
block/db-grid-spaces-edge-label] [fixture: block/db-grid-spaces-composite-label]
[fixture: block/db-grid-nel-block-arrow-label] [fixture:
block/db-grid-nel-edge-label] [fixture: block/db-grid-nel-composite-label]
[fixture: block/db-grid-semicolon-block-arrow-label] [fixture:
block/db-grid-semicolon-edge-label] [fixture:
block/db-grid-semicolon-composite-label] [fixture:
block/db-grid-hash-block-arrow-label] [fixture: block/db-grid-hash-edge-label]
[fixture: block/db-grid-hash-composite-label] [fixture:
block/db-grid-percent-block-arrow-label] [fixture:
block/db-grid-percent-edge-label] [fixture:
block/db-grid-percent-composite-label] [fixture:
block/db-grid-colon-block-arrow-label] [fixture: block/db-grid-colon-edge-label]
[fixture: block/db-grid-colon-composite-label] [fixture:
block/db-grid-comma-label] [fixture: block/db-grid-comma-block-arrow-label]
[fixture: block/db-grid-comma-edge-label] [fixture:
block/db-grid-comma-composite-label] [fixture: block/db-grid-dash-label]
[fixture: block/db-grid-dash-block-arrow-label] [fixture:
block/db-grid-dash-edge-label] [fixture: block/db-grid-dash-composite-label]
[fixture: block/db-grid-pipe-label] [fixture:
block/db-grid-pipe-block-arrow-label] [fixture: block/db-grid-pipe-edge-label]
[fixture: block/db-grid-pipe-composite-label] [fixture:
block/gram-grid-quote-block-arrow-label] [fixture:
block/gram-grid-quote-edge-label] [fixture:
block/gram-grid-quote-composite-label] [fixture:
block/db-grid-single-quote-block-arrow-label] [fixture:
block/db-grid-single-quote-edge-label] [fixture:
block/db-grid-single-quote-composite-label] [fixture:
block/db-grid-backtick-block-arrow-label] [fixture:
block/db-grid-backtick-edge-label] [fixture:
block/db-grid-backtick-composite-label] [fixture:
block/db-grid-backslash-block-arrow-label] [fixture:
block/db-grid-backslash-edge-label] [fixture:
block/db-grid-backslash-composite-label] [fixture:
block/db-grid-open-square-label] [fixture:
block/db-grid-open-square-block-arrow-label] [fixture:
block/db-grid-open-square-edge-label] [fixture:
block/db-grid-open-square-composite-label] [fixture:
block/db-grid-close-square-label] [fixture:
block/db-grid-close-square-block-arrow-label] [fixture:
block/db-grid-close-square-edge-label] [fixture:
block/db-grid-close-square-composite-label] [fixture:
block/db-grid-open-round-label] [fixture:
block/db-grid-open-round-block-arrow-label] [fixture:
block/db-grid-open-round-edge-label] [fixture:
block/db-grid-open-round-composite-label] [fixture:
block/db-grid-close-round-label] [fixture:
block/db-grid-close-round-block-arrow-label] [fixture:
block/db-grid-close-round-edge-label] [fixture:
block/db-grid-close-round-composite-label] [fixture:
block/db-grid-open-brace-label] [fixture:
block/db-grid-open-brace-block-arrow-label] [fixture:
block/db-grid-open-brace-edge-label] [fixture:
block/db-grid-open-brace-composite-label] [fixture:
block/db-grid-close-brace-label] [fixture:
block/db-grid-close-brace-block-arrow-label] [fixture:
block/db-grid-close-brace-edge-label] [fixture:
block/db-grid-close-brace-composite-label] [fixture:
block/db-grid-less-than-label] [fixture:
block/db-grid-less-than-block-arrow-label] [fixture:
block/db-grid-less-than-edge-label] [fixture:
block/db-grid-less-than-composite-label] [fixture:
block/db-grid-greater-than-label] [fixture:
block/db-grid-greater-than-block-arrow-label] [fixture:
block/db-grid-greater-than-edge-label] [fixture:
block/db-grid-greater-than-composite-label] [fixture:
block/db-grid-equals-label] [fixture: block/db-grid-equals-block-arrow-label]
[fixture: block/db-grid-equals-edge-label] [fixture:
block/db-grid-equals-composite-label] [fixture: block/db-grid-punct-label]
[fixture: block/db-grid-punct-block-arrow-label] [fixture:
block/db-grid-punct-edge-label] [fixture: block/db-grid-punct-composite-label]
[fixture: block/db-grid-arrow-label] [fixture:
block/db-grid-arrow-block-arrow-label] [fixture: block/db-grid-arrow-edge-label]
[fixture: block/db-grid-arrow-composite-label] [fixture:
block/db-grid-arrow-spaced-block-arrow-label] [fixture:
block/db-grid-arrow-spaced-edge-label] [fixture:
block/db-grid-arrow-spaced-composite-label] [fixture:
block/db-grid-comment-label] [fixture: block/db-grid-comment-block-arrow-label]
[fixture: block/db-grid-comment-edge-label] [fixture:
block/db-grid-comment-composite-label] [fixture:
block/db-grid-comment-line-label] [fixture:
block/db-grid-comment-line-block-arrow-label] [fixture:
block/db-grid-comment-line-edge-label] [fixture:
block/db-grid-comment-line-composite-label] [fixture:
block/db-grid-directive-block-arrow-label] [fixture:
block/db-grid-directive-composite-label] [fixture:
block/db-grid-directive-line-block-arrow-label] [fixture:
block/db-grid-directive-line-edge-label] [fixture:
block/db-grid-directive-line-composite-label] [fixture:
block/db-grid-entity-block-arrow-label] [fixture: block/db-edge-label-entity]
[fixture: block/db-grid-entity-composite-label] [fixture:
block/db-grid-entity-named-block-arrow-label] [fixture:
block/db-grid-entity-named-edge-label] [fixture:
block/db-grid-entity-named-composite-label] [fixture: block/db-grid-html-label]
[fixture: block/db-grid-html-block-arrow-label] [fixture:
block/db-grid-html-edge-label] [fixture: block/db-grid-html-composite-label]
[fixture: block/db-grid-html-br-block-arrow-label] [fixture:
block/db-grid-html-br-edge-label] [fixture:
block/db-grid-html-br-composite-label] [fixture:
block/db-grid-html-attribute-label] [fixture:
block/db-grid-html-attribute-block-arrow-label] [fixture:
block/db-grid-html-attribute-edge-label] [fixture:
block/db-grid-html-attribute-composite-label] [fixture:
block/db-grid-ampersand-entity-label] [fixture:
block/db-grid-ampersand-entity-block-arrow-label] [fixture:
block/db-grid-ampersand-entity-edge-label] [fixture:
block/db-grid-ampersand-entity-composite-label] [fixture:
block/db-grid-keyword-end-label] [fixture:
block/db-grid-keyword-end-block-arrow-label] [fixture:
block/db-grid-keyword-end-edge-label] [fixture:
block/db-grid-keyword-end-composite-label] [fixture:
block/db-grid-keyword-block-label] [fixture:
block/db-grid-keyword-block-block-arrow-label] [fixture:
block/db-grid-keyword-block-edge-label] [fixture:
block/db-grid-keyword-block-composite-label] [fixture:
block/db-grid-keyword-columns-label] [fixture:
block/db-grid-keyword-columns-block-arrow-label] [fixture:
block/db-grid-keyword-columns-edge-label] [fixture:
block/db-grid-keyword-columns-composite-label] [fixture:
block/db-grid-keyword-space-label] [fixture:
block/db-grid-keyword-space-block-arrow-label] [fixture:
block/db-grid-keyword-space-edge-label] [fixture:
block/db-grid-keyword-space-composite-label] [fixture:
block/db-grid-keyword-class-label] [fixture:
block/db-grid-keyword-class-block-arrow-label] [fixture:
block/db-grid-keyword-class-edge-label] [fixture:
block/db-grid-keyword-class-composite-label] [fixture:
block/db-grid-keyword-style-label] [fixture:
block/db-grid-keyword-style-block-arrow-label] [fixture:
block/db-grid-keyword-style-edge-label] [fixture:
block/db-grid-keyword-style-composite-label] [fixture:
block/db-grid-keyword-classdef-label] [fixture:
block/db-grid-keyword-classdef-block-arrow-label] [fixture:
block/db-grid-keyword-classdef-edge-label] [fixture:
block/db-grid-keyword-classdef-composite-label] [fixture:
block/db-grid-keyword-header-label] [fixture:
block/db-grid-keyword-header-block-arrow-label] [fixture:
block/db-grid-keyword-header-edge-label] [fixture:
block/db-grid-keyword-header-composite-label] [fixture:
block/db-grid-proto-label] [fixture: block/db-grid-proto-block-arrow-label]
[fixture: block/db-grid-proto-edge-label] [fixture:
block/db-grid-proto-composite-label] [fixture: block/db-grid-constructor-label]
[fixture: block/db-grid-constructor-block-arrow-label] [fixture:
block/db-grid-constructor-edge-label] [fixture:
block/db-grid-constructor-composite-label] [fixture: block/db-grid-root-label]
[fixture: block/db-grid-root-block-arrow-label] [fixture:
block/db-grid-root-edge-label] [fixture: block/db-grid-root-composite-label]
[fixture: block/db-grid-nonascii-label] [fixture:
block/db-grid-nonascii-block-arrow-label] [fixture:
block/db-grid-nonascii-edge-label] [fixture:
block/db-grid-nonascii-composite-label] [fixture: block/db-grid-emoji-label]
[fixture: block/db-grid-emoji-block-arrow-label] [fixture:
block/db-grid-emoji-edge-label] [fixture: block/db-grid-emoji-composite-label]
[fixture: block/db-grid-digits-label] [fixture:
block/db-grid-digits-block-arrow-label] [fixture:
block/db-grid-digits-edge-label] [fixture: block/db-grid-digits-composite-label]
[fixture: block/db-grid-empty-label] [fixture:
block/db-grid-empty-block-arrow-label] [fixture: block/db-grid-empty-edge-label]
[fixture: block/db-grid-empty-composite-label] [fixture:
block/db-grid-style-rule-label] [fixture:
block/db-grid-style-rule-block-arrow-label] [fixture:
block/db-grid-style-rule-edge-label] [fixture:
block/db-grid-style-rule-composite-label] [fixture:
block/db-grid-classdef-rule-label] [fixture:
block/db-grid-classdef-rule-block-arrow-label] [fixture:
block/db-grid-classdef-rule-edge-label] [fixture:
block/db-grid-classdef-rule-composite-label]

### Shapes

An opening of a shape enters the shape context, which reads a string and then a
closing, and leaves. The openings are tried in this order: `-)`, `(-`, `))`,
`)`, `(((`, `((`, `{{`, `{`, `>`, `([`, `(`, `[[`, `[|`, `[(`, `[\`, `[/`, and
`[`. So `)))` is no opening: it is `))` and `)`, which is rejected. The closings
are tried in this order: `(((`, `)))`, `))`, `}}`, `}`, `(-`, `-)`, `((`, `]]`,
`(`, `])`, `\]`, `/]`, `)]`, `)`, `]>`, and `]`. The shape context has no rule
for whitespace: `A[ "x" ]`, `A[ "x"]`, `A["x" ]`, and a line feed inside the
brackets are rejected, while whitespace between the id and the opening is
allowed (`A ("x")`). Any opening may meet any closing: a pair that is no shape
of mermaid.js, such as `["x")`, `("x"]`, `-)"x"(-`, and `[|"x"]`, is accepted
and has no type in the Db. `[|"x"|]` and `[[["x"]]]` are rejected, and a shape
with no id before it is rejected. [fixture: block/db-shape-square] [fixture:
block/db-shape-round] [fixture: block/db-shape-circle] [fixture:
block/db-shape-doublecircle] [fixture: block/db-shape-stadium] [fixture:
block/db-shape-subroutine] [fixture: block/db-shape-cylinder] [fixture:
block/db-shape-diamond] [fixture: block/db-shape-hexagon] [fixture:
block/db-shape-rect-left-inv-arrow] [fixture: block/db-shape-lean-right]
[fixture: block/db-shape-lean-left] [fixture: block/db-shape-trapezoid]
[fixture: block/db-shape-inv-trapezoid] [fixture: block/db-shape-block-arrow]
[fixture: block/db-shape-odd-left] [fixture: block/db-shape-odd-double]
[fixture: block/db-shape-minus-round] [fixture: block/db-shape-minus-reverse]
[fixture: block/db-shape-mixed-round-square] [fixture:
block/db-shape-mixed-square-round] [fixture: block/db-shape-mixed-arrow-brace]
[fixture: block/db-shape-mixed-brace-square] [fixture:
block/db-shape-mixed-double] [fixture: block/db-shape-mixed-circle-stadium]
[fixture: block/db-shape-extra-close] [fixture: block/gram-shape-pipe] [fixture:
block/gram-shape-triple-square] [fixture: block/db-shape-space-before] [fixture:
block/db-shape-line-feed-before] [fixture: block/gram-shape-shape-only]
[fixture: block/gram-shape-shape-only-round] [fixture:
block/db-shape-two-defs-line] [fixture: block/db-shape-no-space-between]
[fixture: block/db-spec-bracket-pipe] [fixture:
block/gram-spec-triple-round-start] [fixture: block/db-spec-space-before-round]
[fixture: block/gram-spec-spaces-inside-square] [fixture:
block/gram-spec-space-before-string] [fixture:
block/gram-spec-space-after-string] [fixture:
block/gram-spec-line-feed-inside-square] [fixture: block/gram-spec-two-strings]
[fixture: block/gram-spec-spaces-inside-block-arrow] [fixture:
block/db-spec-spaces-around-directions] [fixture:
block/db-spec-directions-line-feeds] [fixture:
block/gram-spec-directions-unknown] [fixture:
block/db-closer-arrow-open-with-bracket] [fixture:
block/db-closer-backslash-open-with-bracket] [fixture:
block/gram-closer-block-arrow-open-with-bracket] [fixture:
block/db-closer-brace-brace-pair] [fixture:
block/db-closer-circle-then-triple-close] [fixture:
block/db-closer-double-circle-then-double-close] [fixture:
block/db-closer-hexagon-single-close] [fixture:
block/db-closer-round-then-paren-bracket] [fixture:
block/db-closer-slash-open-with-bracket] [fixture:
block/db-closer-square-then-arrow-close] [fixture:
block/db-closer-square-then-backslash-bracket] [fixture:
block/db-closer-square-then-brace] [fixture:
block/db-closer-square-then-double-brace] [fixture:
block/db-closer-square-then-double-open] [fixture:
block/db-closer-square-then-double-paren-close] [fixture:
block/db-closer-square-then-minus-close] [fixture:
block/db-closer-square-then-minus-open] [fixture:
block/db-closer-square-then-paren-bracket] [fixture:
block/db-closer-square-then-paren-close-bracket] [fixture:
block/db-closer-square-then-round-open] [fixture:
block/db-closer-square-then-slash-bracket] [fixture:
block/db-closer-square-then-triple-close] [fixture:
block/db-closer-square-then-triple-open]

### Block arrows

`<[` enters the block arrow context, which reads a string, then `]>`,
whitespace, and `(`, and then the directions context, which reads one or more
**directions** and `)`, and leaves both. A direction is `right`, `left`, `up`,
`down`, `x`, or `y`, in lower case; a `,` and whitespace may stand before a
direction, line feeds included, and two directions need nothing between them:
`(right down)`, `(right, down)`, and `(rightdown)` are the directions `right`
and `down`. No direction, an unknown word, upper case, a `,` at the end or two
in a row, and whitespace inside the brackets of `<[` are rejected, and so is
`<[` closed by `]` alone. [fixture: block/db-arrow-left] [fixture:
block/db-arrow-up] [fixture: block/db-arrow-down] [fixture: block/db-arrow-x]
[fixture: block/db-arrow-y] [fixture: block/db-arrow-two] [fixture:
block/db-arrow-all] [fixture: block/db-arrow-no-space] [fixture:
block/db-arrow-spaces] [fixture: block/db-arrow-trailing-space] [fixture:
block/db-arrow-leading-space] [fixture: block/db-arrow-tab] [fixture:
block/db-arrow-line-feed] [fixture: block/db-arrow-twice] [fixture:
block/db-arrow-leading-comma] [fixture: block/db-arrow-glued-words] [fixture:
block/db-arrow-word-suffix] [fixture: block/db-arrow-word-prefix] [fixture:
block/db-arrow-up-down] [fixture: block/db-arrow-space-before-paren] [fixture:
block/db-arrow-line-feed-before-paren] [fixture:
block/gram-arrow-trailing-comma] [fixture: block/gram-arrow-double-comma]
[fixture: block/gram-arrow-empty] [fixture: block/gram-arrow-unknown] [fixture:
block/gram-arrow-upper-case] [fixture: block/gram-arrow-dir-keywords] [fixture:
block/gram-arrow-no-paren] [fixture: block/gram-arrow-unclosed-paren] [fixture:
block/gram-arrow-unquoted-label] [fixture: block/gram-arrow-empty-label]
[fixture: block/gram-arrow-markdown-label] [fixture:
block/gram-arrow-closing-wrong] [fixture: block/gram-arrow-closing-square]
[fixture: block/db-arrow-spaces-label] [fixture: block/db-arrow-nbsp-label]
[fixture: block/db-arrow-with-width] [fixture: block/db-arrow-two-lines]
[fixture: block/db-arrow-class] [fixture: block/db-grid-tab-columns] [fixture:
block/gram-grid-tab-width] [fixture: block/gram-grid-tab-space-width] [fixture:
block/db-grid-tab-directions] [fixture: block/db-grid-lf-columns] [fixture:
block/gram-grid-lf-width] [fixture: block/gram-grid-lf-space-width] [fixture:
block/db-grid-lf-directions] [fixture: block/db-grid-lf-header-line] [fixture:
block/db-grid-cr-columns] [fixture: block/gram-grid-cr-width] [fixture:
block/gram-grid-cr-space-width] [fixture: block/db-grid-cr-directions] [fixture:
block/db-grid-cr-header-line] [fixture: block/db-grid-crlf-columns] [fixture:
block/gram-grid-crlf-width] [fixture: block/gram-grid-crlf-space-width]
[fixture: block/db-grid-crlf-directions] [fixture:
block/db-grid-crlf-header-line] [fixture: block/db-grid-ls-columns] [fixture:
block/gram-grid-ls-width] [fixture: block/gram-grid-ls-space-width] [fixture:
block/db-grid-ls-directions] [fixture: block/db-grid-ps-columns] [fixture:
block/gram-grid-ps-width] [fixture: block/gram-grid-ps-space-width] [fixture:
block/db-grid-ps-directions] [fixture: block/db-grid-nbsp-columns] [fixture:
block/gram-grid-nbsp-width] [fixture: block/gram-grid-nbsp-space-width]
[fixture: block/db-grid-nbsp-directions] [fixture:
block/db-grid-nbsp-header-line] [fixture: block/db-grid-bom-columns] [fixture:
block/gram-grid-bom-width] [fixture: block/gram-grid-bom-space-width] [fixture:
block/db-grid-bom-directions] [fixture: block/db-grid-bom-header-line] [fixture:
block/db-grid-ideographic-columns] [fixture: block/gram-grid-ideographic-width]
[fixture: block/gram-grid-ideographic-space-width] [fixture:
block/db-grid-ideographic-directions] [fixture:
block/db-grid-ideographic-header-line] [fixture: block/db-grid-ff-columns]
[fixture: block/gram-grid-ff-width] [fixture: block/gram-grid-ff-space-width]
[fixture: block/db-grid-ff-directions] [fixture: block/db-grid-vt-columns]
[fixture: block/gram-grid-vt-width] [fixture: block/gram-grid-vt-space-width]
[fixture: block/db-grid-vt-directions] [fixture: block/db-grid-spaces-columns]
[fixture: block/gram-grid-spaces-width] [fixture:
block/gram-grid-spaces-space-width] [fixture: block/db-grid-spaces-directions]
[fixture: block/db-grid-spaces-header-line] [fixture: block/db-grid-nel-columns]
[fixture: block/gram-grid-nel-width] [fixture: block/gram-grid-nel-space-width]
[fixture: block/gram-grid-nel-directions] [fixture:
block/db-grid-semicolon-columns] [fixture: block/gram-grid-semicolon-width]
[fixture: block/gram-grid-semicolon-space-width] [fixture:
block/gram-grid-semicolon-directions] [fixture:
block/db-grid-semicolon-header-line] [fixture: block/db-grid-hash-columns]
[fixture: block/gram-grid-hash-width] [fixture:
block/gram-grid-hash-space-width] [fixture: block/gram-grid-hash-directions]
[fixture: block/db-grid-hash-header-line] [fixture:
block/db-grid-percent-columns] [fixture: block/gram-grid-percent-width]
[fixture: block/gram-grid-percent-space-width] [fixture:
block/gram-grid-percent-directions] [fixture: block/db-grid-percent-header-line]
[fixture: block/gram-grid-colon-columns] [fixture: block/gram-grid-colon-width]
[fixture: block/gram-grid-colon-space-width] [fixture:
block/gram-grid-colon-directions] [fixture: block/gram-grid-colon-header-line]
[fixture: block/db-grid-comma-columns] [fixture: block/gram-grid-comma-width]
[fixture: block/gram-grid-comma-space-width] [fixture:
block/db-grid-comma-header-line] [fixture: block/gram-grid-dash-columns]
[fixture: block/gram-grid-dash-width] [fixture:
block/gram-grid-dash-space-width] [fixture: block/gram-grid-dash-directions]
[fixture: block/gram-grid-dash-header-line] [fixture:
block/db-grid-pipe-columns] [fixture: block/gram-grid-pipe-width] [fixture:
block/gram-grid-pipe-space-width] [fixture: block/gram-grid-pipe-directions]
[fixture: block/db-grid-pipe-header-line] [fixture:
block/gram-grid-quote-columns] [fixture: block/gram-grid-quote-width] [fixture:
block/gram-grid-quote-space-width] [fixture: block/gram-grid-quote-directions]
[fixture: block/gram-grid-quote-header-line] [fixture:
block/db-grid-single-quote-columns] [fixture:
block/gram-grid-single-quote-width] [fixture:
block/gram-grid-single-quote-space-width] [fixture:
block/gram-grid-single-quote-directions] [fixture:
block/db-grid-single-quote-header-line] [fixture:
block/db-grid-backtick-columns] [fixture: block/gram-grid-backtick-width]
[fixture: block/gram-grid-backtick-space-width] [fixture:
block/gram-grid-backtick-directions] [fixture:
block/db-grid-backtick-header-line] [fixture: block/db-grid-backslash-columns]
[fixture: block/gram-grid-backslash-width] [fixture:
block/gram-grid-backslash-space-width] [fixture:
block/gram-grid-backslash-directions] [fixture:
block/db-grid-backslash-header-line] [fixture:
block/gram-grid-open-square-columns] [fixture:
block/gram-grid-open-square-width] [fixture:
block/gram-grid-open-square-space-width] [fixture:
block/gram-grid-open-square-directions] [fixture:
block/gram-grid-open-square-header-line] [fixture:
block/db-grid-close-square-columns] [fixture:
block/gram-grid-close-square-width] [fixture:
block/gram-grid-close-square-space-width] [fixture:
block/gram-grid-close-square-directions] [fixture:
block/db-grid-close-square-header-line] [fixture:
block/gram-grid-open-round-columns] [fixture: block/gram-grid-open-round-width]
[fixture: block/gram-grid-open-round-space-width] [fixture:
block/gram-grid-open-round-directions] [fixture:
block/gram-grid-open-round-header-line] [fixture:
block/gram-grid-close-round-columns] [fixture:
block/gram-grid-close-round-width] [fixture:
block/gram-grid-close-round-space-width] [fixture:
block/gram-grid-close-round-directions] [fixture:
block/gram-grid-close-round-header-line] [fixture:
block/gram-grid-open-brace-columns] [fixture: block/gram-grid-open-brace-width]
[fixture: block/gram-grid-open-brace-space-width] [fixture:
block/gram-grid-open-brace-directions] [fixture:
block/gram-grid-open-brace-header-line] [fixture:
block/gram-grid-close-brace-columns] [fixture:
block/gram-grid-close-brace-width] [fixture:
block/gram-grid-close-brace-space-width] [fixture:
block/gram-grid-close-brace-directions] [fixture:
block/gram-grid-close-brace-header-line] [fixture:
block/gram-grid-less-than-columns] [fixture: block/gram-grid-less-than-width]
[fixture: block/gram-grid-less-than-space-width] [fixture:
block/gram-grid-less-than-directions] [fixture:
block/gram-grid-less-than-header-line] [fixture:
block/gram-grid-greater-than-columns] [fixture:
block/gram-grid-greater-than-width] [fixture:
block/gram-grid-greater-than-space-width] [fixture:
block/gram-grid-greater-than-directions] [fixture:
block/gram-grid-greater-than-header-line] [fixture:
block/gram-grid-equals-columns] [fixture: block/gram-grid-equals-width]
[fixture: block/gram-grid-equals-space-width] [fixture:
block/gram-grid-equals-directions] [fixture: block/gram-grid-equals-header-line]
[fixture: block/gram-grid-punct-columns] [fixture: block/gram-grid-punct-width]
[fixture: block/gram-grid-punct-space-width] [fixture:
block/gram-grid-punct-directions] [fixture: block/gram-grid-punct-header-line]
[fixture: block/db-grid-arrow-columns] [fixture: block/gram-grid-arrow-width]
[fixture: block/gram-grid-arrow-space-width] [fixture:
block/gram-grid-arrow-directions] [fixture: block/gram-grid-arrow-header-line]
[fixture: block/db-grid-arrow-spaced-columns] [fixture:
block/gram-grid-arrow-spaced-width] [fixture:
block/gram-grid-arrow-spaced-space-width] [fixture:
block/gram-grid-arrow-spaced-directions] [fixture:
block/gram-grid-arrow-spaced-header-line] [fixture:
block/db-grid-comment-columns] [fixture: block/gram-grid-comment-width]
[fixture: block/gram-grid-comment-space-width] [fixture:
block/gram-grid-comment-directions] [fixture: block/db-grid-comment-header-line]
[fixture: block/db-grid-comment-line-columns] [fixture:
block/gram-grid-comment-line-width] [fixture:
block/gram-grid-comment-line-space-width] [fixture:
block/db-grid-comment-line-directions] [fixture:
block/db-grid-directive-columns] [fixture: block/gram-grid-directive-width]
[fixture: block/gram-grid-directive-space-width] [fixture:
block/db-grid-directive-directions] [fixture:
block/gram-grid-directive-header-line] [fixture:
block/db-grid-directive-line-columns] [fixture:
block/gram-grid-directive-line-width] [fixture:
block/gram-grid-directive-line-space-width] [fixture:
block/db-grid-directive-line-directions] [fixture:
block/db-grid-directive-line-header-line] [fixture:
block/db-grid-entity-columns] [fixture: block/gram-grid-entity-width] [fixture:
block/gram-grid-entity-space-width] [fixture: block/gram-grid-entity-directions]
[fixture: block/db-grid-entity-header-line] [fixture:
block/db-grid-entity-named-columns] [fixture:
block/gram-grid-entity-named-width] [fixture:
block/gram-grid-entity-named-space-width] [fixture:
block/gram-grid-entity-named-directions] [fixture:
block/db-grid-entity-named-header-line] [fixture: block/gram-grid-html-columns]
[fixture: block/gram-grid-html-width] [fixture:
block/gram-grid-html-space-width] [fixture: block/gram-grid-html-directions]
[fixture: block/gram-grid-html-header-line] [fixture:
block/gram-grid-html-br-columns] [fixture: block/gram-grid-html-br-width]
[fixture: block/gram-grid-html-br-space-width] [fixture:
block/gram-grid-html-br-directions] [fixture:
block/gram-grid-html-br-header-line] [fixture:
block/gram-grid-html-attribute-columns] [fixture:
block/gram-grid-html-attribute-width] [fixture:
block/gram-grid-html-attribute-space-width] [fixture:
block/gram-grid-html-attribute-directions] [fixture:
block/gram-grid-html-attribute-header-line] [fixture:
block/db-grid-ampersand-entity-columns] [fixture:
block/gram-grid-ampersand-entity-width] [fixture:
block/gram-grid-ampersand-entity-space-width] [fixture:
block/gram-grid-ampersand-entity-directions] [fixture:
block/db-grid-ampersand-entity-header-line] [fixture:
block/gram-grid-keyword-end-columns] [fixture:
block/gram-grid-keyword-end-width] [fixture:
block/gram-grid-keyword-end-space-width] [fixture:
block/gram-grid-keyword-end-directions] [fixture:
block/gram-grid-keyword-end-header-line] [fixture:
block/gram-grid-keyword-block-columns] [fixture:
block/gram-grid-keyword-block-width] [fixture:
block/gram-grid-keyword-block-space-width] [fixture:
block/gram-grid-keyword-block-directions] [fixture:
block/gram-grid-keyword-block-header-line] [fixture:
block/db-grid-keyword-columns-columns] [fixture:
block/gram-grid-keyword-columns-width] [fixture:
block/gram-grid-keyword-columns-space-width] [fixture:
block/gram-grid-keyword-columns-directions] [fixture:
block/db-grid-keyword-columns-header-line] [fixture:
block/db-grid-keyword-space-columns] [fixture:
block/gram-grid-keyword-space-width] [fixture:
block/gram-grid-keyword-space-space-width] [fixture:
block/gram-grid-keyword-space-directions] [fixture:
block/db-grid-keyword-space-header-line] [fixture:
block/db-grid-keyword-class-columns] [fixture:
block/gram-grid-keyword-class-width] [fixture:
block/gram-grid-keyword-class-space-width] [fixture:
block/gram-grid-keyword-class-directions] [fixture:
block/db-grid-keyword-class-header-line] [fixture:
block/gram-grid-keyword-style-columns] [fixture:
block/gram-grid-keyword-style-width] [fixture:
block/gram-grid-keyword-style-space-width] [fixture:
block/gram-grid-keyword-style-directions] [fixture:
block/gram-grid-keyword-style-header-line] [fixture:
block/db-grid-keyword-classdef-columns] [fixture:
block/gram-grid-keyword-classdef-width] [fixture:
block/gram-grid-keyword-classdef-space-width] [fixture:
block/gram-grid-keyword-classdef-directions] [fixture:
block/db-grid-keyword-classdef-header-line] [fixture:
block/gram-grid-keyword-header-columns] [fixture:
block/gram-grid-keyword-header-width] [fixture:
block/gram-grid-keyword-header-space-width] [fixture:
block/gram-grid-keyword-header-directions] [fixture:
block/gram-grid-keyword-header-header-line] [fixture:
block/db-grid-proto-columns] [fixture: block/gram-grid-proto-width] [fixture:
block/gram-grid-proto-space-width] [fixture: block/gram-grid-proto-directions]
[fixture: block/gram-grid-proto-header-line] [fixture:
block/db-grid-constructor-columns] [fixture: block/gram-grid-constructor-width]
[fixture: block/gram-grid-constructor-space-width] [fixture:
block/gram-grid-constructor-directions] [fixture:
block/gram-grid-constructor-header-line] [fixture: block/db-grid-root-columns]
[fixture: block/gram-grid-root-width] [fixture:
block/gram-grid-root-space-width] [fixture: block/gram-grid-root-directions]
[fixture: block/gram-grid-root-header-line] [fixture:
block/db-grid-nonascii-columns] [fixture: block/gram-grid-nonascii-width]
[fixture: block/gram-grid-nonascii-space-width] [fixture:
block/gram-grid-nonascii-directions] [fixture:
block/db-grid-nonascii-header-line] [fixture: block/db-grid-emoji-columns]
[fixture: block/gram-grid-emoji-width] [fixture:
block/gram-grid-emoji-space-width] [fixture: block/gram-grid-emoji-directions]
[fixture: block/db-grid-emoji-header-line] [fixture:
block/db-grid-digits-columns] [fixture: block/db-grid-digits-width] [fixture:
block/db-grid-digits-space-width] [fixture: block/gram-grid-digits-directions]
[fixture: block/gram-grid-digits-header-line] [fixture:
block/db-grid-empty-columns] [fixture: block/gram-width-colon-only] [fixture:
block/gram-space-no-number] [fixture: block/db-grid-empty-directions] [fixture:
block/gram-grid-empty-header-line] [fixture: block/gram-grid-style-rule-columns]
[fixture: block/gram-grid-style-rule-width] [fixture:
block/gram-grid-style-rule-space-width] [fixture:
block/gram-grid-style-rule-directions] [fixture:
block/gram-grid-style-rule-header-line] [fixture:
block/gram-grid-classdef-rule-columns] [fixture:
block/gram-grid-classdef-rule-width] [fixture:
block/gram-grid-classdef-rule-space-width] [fixture:
block/gram-grid-classdef-rule-directions] [fixture:
block/gram-grid-classdef-rule-header-line]

### Edges

An **arrow** is a line between two optional markers:

- a solid line, two or more `-`, with an end marker `-`, `x`, `o`, or `>`;
- a thick line, two or more `=`, with an end marker `=`, `x`, `o`, or `>`;
- a dotted line, an optional `-`, one or more `.`, and `-`, with an optional end
  marker `x`, `o`, or `>`;
- an invisible line, three or more `~`, which is never read, since an id is
  tried first;

and, before a solid, thick, or dotted line, an optional start marker `x`, `o`,
or `<`, of which only `<` is read, since `x` and `o` start an id. An invisible
line takes no start marker: `A <~~~ B` and `A<~~~B` are rejected. The whitespace
around an arrow belongs to it. `-->`, `---`, `==>`, `===`, `-.->`, `-.-`, `--x`,
`--o`, and `<-->` are arrows, also glued to the ids (`A-->B`, `A--xB`), while
`->`, `-`, `<--` alone, and `--` alone are rejected. An **opening arrow**, `--`,
`==`, or `-.` after an optional `<`, with whitespace around it, enters the edge
label context, which reads a string and then an arrow, which leaves the context.
The arrow may have another line than the opening arrow: `A -- "x" ==> B` is
accepted. A label without quotes, an empty label, and a markdown label are
rejected. [fixture: block/db-edge-arrow] [fixture: block/db-edge-open] [fixture:
block/db-edge-thick] [fixture: block/db-edge-thick-open] [fixture:
block/db-edge-dotted] [fixture: block/db-edge-dotted-open] [fixture:
block/db-edge-dotted-long] [fixture: block/db-edge-cross] [fixture:
block/db-edge-circle] [fixture: block/db-edge-bidirectional] [fixture:
block/db-edge-long] [fixture: block/db-edge-long-open] [fixture:
block/db-edge-thick-long] [fixture: block/db-edge-start-cross] [fixture:
block/db-edge-start-cross-spaced] [fixture: block/db-edge-start-circle]
[fixture: block/gram-edge-reverse] [fixture: block/gram-edge-two-dashes]
[fixture: block/gram-edge-one-dash] [fixture: block/db-edge-tilde] [fixture:
block/db-edge-tilde-glued] [fixture: block/gram-edge-start-lt-invisible]
[fixture: block/gram-edge-start-lt-invisible-glued] [fixture:
block/db-edge-glued] [fixture: block/db-edge-glued-x] [fixture:
block/db-edge-glued-o] [fixture: block/db-edge-spaces] [fixture:
block/db-edge-tab] [fixture: block/db-edge-line-feed-before] [fixture:
block/db-edge-line-feed-after] [fixture: block/db-edge-line-feed-both] [fixture:
block/db-edge-blank-line-after] [fixture: block/gram-edge-no-end] [fixture:
block/gram-edge-no-start] [fixture: block/gram-edge-only-arrow] [fixture:
block/db-edge-crlf] [fixture: block/db-edge-nbsp] [fixture:
block/db-edge-ideographic] [fixture: block/db-edge-ls] [fixture:
block/db-edge-digit] [fixture: block/db-edge-unicode] [fixture:
block/db-edge-same-line-statements] [fixture: block/db-edge-then-columns]
[fixture: block/db-edge-spaces-in-id] [fixture:
block/gram-spec-single-dash-arrow] [fixture:
block/gram-spec-edge-to-block-keyword] [fixture:
block/gram-spec-colon-colon-colon] [fixture: block/gram-spec-colon-colon]
[fixture: block/gram-spec-colon-colon-colon-two] [fixture:
block/gram-spec-edge-directive-in-dashes] [fixture:
block/db-spec-edge-label-spaces-around] [fixture:
block/gram-spec-edge-label-two-strings] [fixture: block/db-edge-label] [fixture:
block/db-edge-label-open] [fixture: block/db-edge-label-thick] [fixture:
block/db-edge-label-dotted] [fixture: block/db-edge-label-glued] [fixture:
block/gram-edge-label-empty] [fixture: block/db-edge-label-spaces] [fixture:
block/gram-edge-label-unquoted] [fixture: block/db-edge-label-pipe] [fixture:
block/db-edge-label-pipe-spaced] [fixture: block/gram-edge-label-markdown]
[fixture: block/db-edge-label-html] [fixture:
block/gram-edge-label-start-without-end] [fixture:
block/gram-edge-label-wrong-end] [fixture: block/db-edge-label-mismatched]
[fixture: block/db-edge-label-mismatched-dotted] [fixture:
block/db-edge-label-cross] [fixture: block/db-edge-label-bidirectional]
[fixture: block/db-edge-label-start-cross]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `id`, stands for one unit with that
name, and text in double quotes stands for the unit named by that text. The
grammar is a restatement of the grammar in
[`block.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/block/parser/block.jison#L168-L291)
and accepts the same sequences of units, but for the known divergences.

Each rule below makes a node of the tree, defined in
[ast/block.md](../ast/block.md):

| Rule                                                                        | Node                        |
| --------------------------------------------------------------------------- | --------------------------- |
| `diagram`                                                                   | BlockDiagram                |
| `node-statement`                                                            | BlockNodeStatement          |
| `node`                                                                      | BlockNode                   |
| `shape`                                                                     | BlockShape                  |
| `block-arrow`                                                               | BlockArrowShape             |
| `link`                                                                      | BlockLink                   |
| `arrow`                                                                     | BlockArrow                  |
| `opening-arrow`                                                             | BlockOpeningArrow           |
| `space-statement`                                                           | BlockSpaceStatement         |
| `columns-statement`                                                         | BlockColumnsStatement       |
| `composite-statement`                                                       | BlockCompositeStatement     |
| `class-def-statement`                                                       | BlockClassDefStatement      |
| `class-statement`                                                           | BlockClassStatement         |
| `style-statement`                                                           | BlockStyleStatement         |
| `empty-description-block`                                                   | BlockAccDescrBlockStatement |
| `id`, `class-id`, the `class-ids` of `style`                                | Identifier                  |
| `string`                                                                    | StringLiteral               |
| `class-name`, `style`, `direction`, the parts of the `class-ids` of `class` | BlockLiteral                |

### Diagram and statements

```text
diagram   = header statement+
statement = node-statement | space-statement | columns-statement
          | composite-statement | class-def-statement | class-statement
          | style-statement | empty-description-block
```

The diagram is the header and one or more statements, which follow one another
with only whitespace between them: any number of nodes, edges, `columns`,
`space`, and composites stand on a line, in any order, and indentation, empty
lines, and lines of whitespace change nothing. A `;`, `%%`, and `#` after a
statement are ids, while after `classDef`, `class`, and `style` they are part of
the rest of the line. The examples of the documentation of mermaid.js are
accepted. [fixture: block/db-tail-node-comment-glued] [fixture:
block/db-tail-node-trailing-tab] [fixture: block/db-tail-node-trailing-nbsp]
[fixture: block/db-tail-node-shape-comment] [fixture:
block/db-tail-node-shape-comment-glued] [fixture:
block/db-tail-node-shape-directive-glued] [fixture:
block/db-tail-node-shape-directive-unclosed] [fixture:
block/db-tail-node-shape-trailing-spaces] [fixture:
block/db-tail-node-shape-trailing-tab] [fixture:
block/db-tail-node-shape-trailing-nbsp] [fixture: block/db-tail-node-shape-hash]
[fixture: block/db-tail-node-width-comment] [fixture:
block/db-tail-node-width-comment-glued] [fixture:
block/db-tail-node-width-directive-glued] [fixture:
block/db-tail-node-width-directive-unclosed] [fixture:
block/db-tail-node-width-trailing-spaces] [fixture:
block/db-tail-node-width-trailing-tab] [fixture:
block/db-tail-node-width-trailing-nbsp] [fixture: block/db-tail-node-width-hash]
[fixture: block/db-tail-edge-comment-glued] [fixture:
block/db-tail-edge-directive-glued] [fixture:
block/db-tail-edge-directive-unclosed] [fixture:
block/db-tail-edge-trailing-spaces] [fixture: block/db-tail-edge-trailing-tab]
[fixture: block/db-tail-edge-trailing-nbsp] [fixture:
block/db-tail-edge-label-semicolon] [fixture:
block/db-tail-edge-label-space-semicolon] [fixture:
block/db-tail-edge-label-two-semicolons] [fixture:
block/db-tail-edge-label-comment] [fixture:
block/db-tail-edge-label-comment-glued] [fixture:
block/db-tail-edge-label-directive-glued] [fixture:
block/db-tail-edge-label-directive-unclosed] [fixture:
block/db-tail-edge-label-trailing-spaces] [fixture:
block/db-tail-edge-label-trailing-tab] [fixture:
block/db-tail-edge-label-trailing-nbsp] [fixture: block/db-tail-edge-label-hash]
[fixture: block/db-tail-block-arrow-comment] [fixture:
block/db-tail-block-arrow-comment-glued] [fixture:
block/db-tail-block-arrow-directive-glued] [fixture:
block/db-tail-block-arrow-directive-unclosed] [fixture:
block/db-tail-block-arrow-trailing-spaces] [fixture:
block/db-tail-block-arrow-trailing-tab] [fixture:
block/db-tail-block-arrow-trailing-nbsp] [fixture:
block/db-tail-block-arrow-hash] [fixture: block/db-tail-columns-comment-glued]
[fixture: block/db-tail-columns-directive-glued] [fixture:
block/db-tail-columns-directive-unclosed] [fixture:
block/db-tail-columns-trailing-spaces] [fixture:
block/db-tail-columns-trailing-tab] [fixture:
block/db-tail-columns-trailing-nbsp] [fixture: block/db-space-semicolon]
[fixture: block/db-tail-space-comment-glued] [fixture:
block/db-tail-space-directive-glued] [fixture:
block/db-tail-space-directive-unclosed] [fixture:
block/db-tail-space-trailing-spaces] [fixture: block/db-tail-space-trailing-tab]
[fixture: block/db-tail-space-trailing-nbsp] [fixture:
block/db-tail-space-width-space-semicolon] [fixture:
block/db-tail-space-width-two-semicolons] [fixture:
block/db-tail-space-width-comment] [fixture:
block/db-tail-space-width-comment-glued] [fixture:
block/db-tail-space-width-directive] [fixture:
block/db-tail-space-width-directive-glued] [fixture:
block/db-tail-space-width-directive-unclosed] [fixture:
block/db-tail-space-width-trailing-spaces] [fixture:
block/db-tail-space-width-trailing-tab] [fixture:
block/db-tail-space-width-trailing-nbsp] [fixture:
block/db-tail-space-width-hash] [fixture: block/db-class-apply-semicolon]
[fixture: block/db-tail-class-comment-glued] [fixture:
block/db-class-apply-directive] [fixture:
block/db-tail-class-directive-unclosed] [fixture:
block/db-class-apply-trailing-spaces] [fixture:
block/db-tail-class-trailing-tab] [fixture: block/db-class-apply-nbsp] [fixture:
block/db-tail-style-comment-glued] [fixture:
block/db-tail-style-directive-glued] [fixture:
block/db-tail-style-directive-unclosed] [fixture:
block/db-tail-style-trailing-spaces] [fixture: block/db-tail-style-trailing-tab]
[fixture: block/db-tail-style-trailing-nbsp] [fixture:
block/db-tail-class-def-comment-glued] [fixture:
block/db-tail-class-def-directive-glued] [fixture:
block/db-tail-class-def-trailing-spaces] [fixture:
block/db-tail-class-def-trailing-tab] [fixture:
block/db-tail-class-def-trailing-nbsp] [fixture:
block/db-composite-end-semicolon] [fixture:
block/db-tail-composite-end-comment-glued] [fixture:
block/db-tail-composite-end-directive-glued] [fixture:
block/db-tail-composite-end-directive-unclosed] [fixture:
block/db-tail-composite-end-trailing-spaces] [fixture:
block/db-composite-end-tab] [fixture: block/db-composite-end-nbsp] [fixture:
block/db-tail-composite-end-keyword-space-semicolon] [fixture:
block/db-tail-composite-end-keyword-two-semicolons] [fixture:
block/db-tail-composite-end-keyword-comment] [fixture:
block/db-tail-composite-end-keyword-comment-glued] [fixture:
block/db-tail-composite-end-keyword-directive-glued] [fixture:
block/db-tail-composite-end-keyword-directive-unclosed] [fixture:
block/db-tail-composite-end-keyword-trailing-spaces] [fixture:
block/db-tail-composite-end-keyword-trailing-tab] [fixture:
block/db-tail-composite-end-keyword-trailing-nbsp] [fixture:
block/demo-block-0f7b1b81] [fixture: block/demo-block-2472aba6] [fixture:
block/demo-block-44d70be5] [fixture: block/demo-block-7d24edf7] [fixture:
block/demo-block-8b6e7c41] [fixture: block/demo-block-a8323c64] [fixture:
block/demo-block-b3231b02] [fixture: block/demo-block-b4d9a28a] [fixture:
block/demo-block-ca540acf] [fixture: block/demo-block-f71819c7] [fixture:
block/demo-block-fbbaee87] [fixture: block/docs-syntax-block-0c75f481] [fixture:
block/docs-syntax-block-0eeed10a] [fixture: block/docs-syntax-block-1493c734]
[fixture: block/docs-syntax-block-1d2ef9d1] [fixture:
block/docs-syntax-block-24e2536f] [fixture: block/docs-syntax-block-2a2aedc0]
[fixture: block/docs-syntax-block-3eeec690] [fixture:
block/docs-syntax-block-50dc2ed1] [fixture: block/docs-syntax-block-668adabd]
[fixture: block/docs-syntax-block-66fde579] [fixture:
block/docs-syntax-block-6a5c5e67] [fixture: block/docs-syntax-block-6dd28f68]
[fixture: block/docs-syntax-block-6fbaef0c] [fixture:
block/docs-syntax-block-7134441c] [fixture: block/docs-syntax-block-715f1762]
[fixture: block/docs-syntax-block-78e30a8a] [fixture:
block/docs-syntax-block-7c6756e8] [fixture: block/docs-syntax-block-7ddc4030]
[fixture: block/docs-syntax-block-8c1f8d53] [fixture:
block/docs-syntax-block-a5a467c8] [fixture: block/docs-syntax-block-ab04e715]
[fixture: block/docs-syntax-block-b6eebb8c] [fixture:
block/docs-syntax-block-bd54fe8a] [fixture: block/docs-syntax-block-c1690d0b]
[fixture: block/docs-syntax-block-c574652d] [fixture:
block/docs-syntax-block-e29ee1ca] [fixture: block/docs-syntax-block-f3c3e654]
[fixture: block/docs-syntax-block-f8418640] [fixture:
block/docs-syntax-block-fd481f6b] [fixture: block/docs-syntax-block-fddacaac]
[fixture: block/spec-block-0365699a] [fixture: block/spec-block-12f308cf]
[fixture: block/spec-block-17e824ed] [fixture: block/spec-block-1b677ef0]
[fixture: block/spec-block-256830d9] [fixture: block/spec-block-269adfec]
[fixture: block/spec-block-324a07d6] [fixture: block/spec-block-39bb98c0]
[fixture: block/spec-block-48aaf41f] [fixture: block/spec-block-52e0ec56]
[fixture: block/spec-block-6382a25a] [fixture: block/spec-block-855ca1c9]
[fixture: block/spec-block-870f6dc9] [fixture: block/spec-block-946762fc]
[fixture: block/spec-block-9a645429] [fixture: block/spec-block-a3184350]
[fixture: block/spec-block-ae4c1db0] [fixture: block/spec-block-be5706bf]
[fixture: block/spec-block-cc1ee20b] [fixture: block/spec-block-cd0ecd2d]
[fixture: block/spec-block-cf4d00b8] [fixture:
block/spec-block-color-index-29ce8f4b] [fixture:
block/spec-block-color-index-7228003b] [fixture:
block/spec-block-color-index-9a40ae65] [fixture:
block/spec-block-color-index-dd469c8d] [fixture: block/spec-block-d0ba877e]
[fixture: block/spec-block-d1395cc6] [fixture: block/spec-block-ee611de8]
[fixture: block/spec-block-f4c30090] [fixture: block/spec-block-f6ceb4d8]
[fixture: block/spec-block-fd3dd910] [fixture: block/spec-block-ff426370]
[fixture: block/gram-tail-composite-line-comment] [fixture:
block/gram-tail-composite-line-comment-glued] [fixture:
block/gram-tail-composite-line-directive] [fixture:
block/gram-tail-composite-line-directive-glued] [fixture:
block/gram-tail-composite-line-directive-unclosed] [fixture:
block/gram-tail-composite-line-hash] [fixture:
block/gram-tail-composite-line-space-semicolon] [fixture:
block/gram-tail-composite-line-trailing-nbsp] [fixture:
block/gram-tail-composite-line-trailing-spaces] [fixture:
block/gram-tail-composite-line-trailing-tab] [fixture:
block/gram-tail-composite-line-two-semicolons]

### Nodes and widths

```text
node-statement = node width? link*
node           = id ( shape | block-arrow )?
width          = ":" digits
```

A node is an id with a shape, a block arrow, or neither. A width follows the
first node of the statement only, with whitespace before the `:` or not, line
feeds included: `A:2`, `A["x"]:2`, `A :2`, and `A:2 --> B` are accepted, while
`A --> B:2`, a space after the `:`, a `:` with no digits, a sign, and two widths
are rejected; what follows the digits is read on its own (`A:2.5` is the width 2
and the id `.5`). [fixture: block/db-width-plain] [fixture: block/db-width-one]
[fixture: block/db-width-zero] [fixture: block/db-width-leading-zeros] [fixture:
block/db-width-large] [fixture: block/db-width-overflow] [fixture:
block/db-width-space-before] [fixture: block/db-width-tab-before] [fixture:
block/db-width-line-feed-before] [fixture: block/gram-width-space-after]
[fixture: block/gram-width-negative] [fixture: block/db-width-decimal] [fixture:
block/gram-width-letters] [fixture: block/gram-width-twice] [fixture:
block/gram-width-fullwidth-digit] [fixture: block/db-width-glued-node] [fixture:
block/db-width-comma] [fixture: block/db-width-hash] [fixture:
block/db-width-semicolon] [fixture: block/db-width-on-two-nodes] [fixture:
block/db-width-with-label] [fixture: block/db-width-label-then-space] [fixture:
block/db-width-with-block-arrow] [fixture: block/db-width-redefine] [fixture:
block/db-width-redefine-without] [fixture: block/db-width-redefine-first]
[fixture: block/db-width-on-edge-source] [fixture:
block/gram-width-on-edge-target] [fixture: block/db-width-before-edge] [fixture:
block/db-edge-keeps-width] [fixture: block/db-definitions-three-widths]

### Shapes and block arrows

```text
shape       = shape-open string shape-close
block-arrow = "<[" string "]>" "(" direction+ ")"
```

A shape is an opening, a string, and a closing (see [Shapes](#shapes)), and a
block arrow a string and its directions (see [Block arrows](#block-arrows)). The
string is never empty and is never a markdown string. [fixture:
block/db-shape-square] [fixture: block/db-shape-round] [fixture:
block/db-shape-block-arrow]

### Edge statements

```text
link          = ( arrow | opening-arrow string arrow ) node
```

An edge statement is a node, its width, and one or more links, each an arrow, or
an opening arrow, a label, and an arrow, followed by a node. The node at the end
of a link takes no width. An edge to `end`, to `space`, or to a composite is
rejected, while `A --> columns` is an edge to the node `columns`. A chain of
links, `A --> B --> C`, is accepted, and mermaid.js reads it badly: its Db loses
the nodes before the last and the edges between them (see the summary of the
tests package); the tree holds the chain as written. [fixture:
block/db-edge-twice] [fixture: block/db-edge-opposite] [fixture:
block/db-edge-self] [fixture: block/db-edge-different-kinds] [fixture:
block/db-edge-defined-before] [fixture: block/db-edge-new-shape] [fixture:
block/db-edge-start-shape] [fixture: block/db-edge-both-shapes] [fixture:
block/db-edge-to-composite] [fixture: block/db-edge-from-composite-child]
[fixture: block/db-edge-inside-composite] [fixture:
block/db-edge-across-composites] [fixture:
block/db-edge-edge-in-composite-order] [fixture: block/db-edge-root] [fixture:
block/db-edge-to-columns] [fixture: block/gram-edge-to-end] [fixture:
block/db-definitions-edges-three] [fixture: block/db-proto-proto-edge] [fixture:
block/db-proto-root-edge-end] [fixture: block/db-edge-chain] [fixture:
block/db-edge-chain-open] [fixture: block/db-edge-chain-four] [fixture:
block/db-edge-chain-labels] [fixture: block/db-edge-chain-twice] [fixture:
block/db-edge-chain-then-node] [fixture: block/db-edge-chain-in-block] [fixture:
block/db-style-on-undefined-chain-end] [fixture:
block/gram-style-on-chain-middle]

### Spaces and columns

```text
space-statement   = "space" | "space:" digits
columns-statement = "columns" ( digits | "auto" )
```

`space` and `space:N` are statements of their own: a `space` takes no shape, no
width after it, and no edge, and `space :2`, `space: 2`, `space:` with no
digits, and a sign are rejected. `columns` sets the columns of the block it
stands in, and whitespace between `columns` and its number may hold line feeds.
[fixture: block/db-space-plain] [fixture: block/db-space-width] [fixture:
block/db-space-width-one] [fixture: block/db-space-width-zero] [fixture:
block/db-space-zero-before-node] [fixture: block/db-space-leading-zeros]
[fixture: block/gram-space-space-before-colon] [fixture:
block/gram-space-space-after-colon] [fixture: block/gram-space-letters]
[fixture: block/gram-space-negative] [fixture: block/db-space-decimal] [fixture:
block/gram-space-twice-width] [fixture: block/gram-space-fullwidth-digit]
[fixture: block/gram-space-nbsp-colon] [fixture: block/db-space-width-suffix]
[fixture: block/db-space-upper-case] [fixture: block/db-space-upper-case-all]
[fixture: block/db-space-suffix] [fixture: block/db-space-digit-suffix]
[fixture: block/db-space-underscore-suffix] [fixture: block/db-space-prefix]
[fixture: block/db-space-dot-suffix] [fixture: block/db-space-hash] [fixture:
block/gram-space-dash-suffix] [fixture: block/gram-space-edge-start] [fixture:
block/gram-edge-to-space] [fixture: block/gram-space-shape] [fixture:
block/gram-space-quoted] [fixture: block/db-space-class] [fixture:
block/db-space-then-node] [fixture: block/db-space-node-then] [fixture:
block/db-space-between] [fixture: block/db-space-two] [fixture:
block/db-space-two-widths] [fixture: block/db-space-with-columns] [fixture:
block/db-space-in-composite] [fixture: block/db-space-in-named-composite]
[fixture: block/db-space-label-in-line] [fixture: block/db-space-crlf] [fixture:
block/db-definitions-space-three] [fixture: block/db-columns-plain] [fixture:
block/db-columns-auto] [fixture: block/db-columns-zero] [fixture:
block/db-columns-double-zero] [fixture: block/db-columns-leading-zeros]
[fixture: block/db-columns-one] [fixture: block/db-columns-large] [fixture:
block/db-columns-overflow] [fixture: block/db-columns-twice] [fixture:
block/db-columns-twice-auto-last] [fixture: block/db-columns-twice-number-last]
[fixture: block/db-definitions-columns-three] [fixture:
block/db-columns-after-nodes] [fixture: block/db-columns-between-nodes]
[fixture: block/db-columns-only] [fixture: block/db-columns-only-auto] [fixture:
block/db-columns-after-block] [fixture: block/db-columns-after-end] [fixture:
block/db-columns-in-block] [fixture: block/db-columns-in-block-and-root]
[fixture: block/db-columns-in-block-auto] [fixture:
block/db-columns-in-block-only] [fixture: block/db-columns-in-anonymous-block]
[fixture: block/db-columns-in-nested-block] [fixture:
block/db-columns-in-block-header-line] [fixture:
block/db-composite-width-and-columns] [fixture: block/db-columns-tab] [fixture:
block/db-columns-line-feed] [fixture: block/db-columns-blank-line] [fixture:
block/db-columns-nbsp] [fixture: block/db-columns-ideographic] [fixture:
block/db-columns-ls] [fixture: block/db-columns-bom] [fixture:
block/db-columns-crlf] [fixture: block/db-columns-two-spaces] [fixture:
block/db-columns-trailing] [fixture: block/db-columns-then-word] [fixture:
block/db-columns-semicolon] [fixture: block/db-columns-with-width] [fixture:
block/db-columns-width-exceeds-zero] [fixture: block/db-columns-auto-then-width]

### Composites

```text
composite-statement = ( "block:" node-statement | "block" | "block-beta" )
                      statement+ "end"
```

`block:` with a node statement opens a composite with that node, and `block` and
`block-beta` open one with none; `end` closes it. The node may have a width and
a shape (`block:G:2`, `block:G["x"]`), and whitespace, line feeds included, may
stand after `block:`. A composite holds one or more statements: an empty
composite, one that holds only an empty description block, one that is not
closed, an `end` with nothing to close, and `end` as an id are rejected.
Composites nest to any depth. An edge statement after `block:` is the node
statement of the composite, which mermaid.js then reads with no id, and whose
nodes make no block (see
[Rejections outside the grammar](#rejections-outside-the-grammar)); the tree
holds it as written. A quoted id, a space before the `:`, `Block:G`, and `space`
after `block:` are rejected. [fixture: block/db-composite-plain] [fixture:
block/db-composite-no-id] [fixture: block/db-composite-no-id-beta] [fixture:
block/db-composite-width] [fixture: block/db-composite-width-zero] [fixture:
block/db-composite-label] [fixture: block/db-composite-label-shapes] [fixture:
block/db-composite-label-and-width] [fixture: block/db-composite-block-arrow]
[fixture: block/db-composite-nested] [fixture: block/db-composite-nested-no-id]
[fixture: block/db-composite-nested-three] [fixture:
block/db-composite-siblings] [fixture: block/db-composite-siblings-no-id]
[fixture: block/db-composite-end-in-line] [fixture:
block/db-composite-two-statements-line] [fixture:
block/db-composite-composite-in-line-with-node] [fixture:
block/db-composite-many-composites] [fixture: block/db-composite-colors]
[fixture: block/db-composite-child-width-in] [fixture:
block/db-composite-columns-id] [fixture: block/gram-composite-empty] [fixture:
block/gram-composite-empty-no-id] [fixture: block/gram-composite-not-closed]
[fixture: block/gram-composite-not-closed-nested] [fixture:
block/gram-composite-extra-end] [fixture: block/gram-composite-end-first]
[fixture: block/gram-composite-end-as-id] [fixture:
block/gram-composite-end-as-node-in-block] [fixture:
block/db-composite-only-columns] [fixture: block/db-composite-only-class-def]
[fixture: block/db-composite-only-class] [fixture:
block/db-composite-only-style] [fixture: block/gram-composite-end-upper-case]
[fixture: block/gram-composite-end-capital] [fixture:
block/gram-composite-end-suffix] [fixture: block/gram-composite-end-underscore]
[fixture: block/gram-composite-end-width] [fixture: block/db-composite-end-dot]
[fixture: block/db-composite-end-hash] [fixture:
block/db-composite-end-then-node] [fixture: block/db-composite-end-in-label]
[fixture: block/db-composite-end-glued] [fixture: block/db-composite-end-crlf]
[fixture: block/db-composite-space-after-colon] [fixture:
block/gram-composite-id-quoted] [fixture:
block/gram-composite-no-id-after-colon] [fixture:
block/gram-composite-space-before-colon] [fixture:
block/gram-composite-id-with-dash] [fixture: block/gram-composite-upper-case]
[fixture: block/gram-composite-space-id] [fixture: block/db-composite-suffix]
[fixture: block/db-composite-digit-suffix] [fixture:
block/db-composite-underscore-suffix] [fixture:
block/gram-composite-dash-suffix] [fixture: block/gram-composite-beta-suffix]
[fixture: block/gram-composite-colon-suffix] [fixture:
block/db-composite-edge-header] [fixture: block/db-composite-edge-header-width]
[fixture: block/gram-style-on-composite-edge-head-start] [fixture:
block/gram-style-on-composite-edge-head-end] [fixture:
block/db-style-on-composite-edge-head-child] [fixture:
block/db-composite-shape-edge-header] [fixture: block/gram-composite-in-edge]
[fixture: block/db-grid-semicolon-composite-id] [fixture:
block/db-grid-hash-composite-id] [fixture: block/db-grid-percent-composite-id]
[fixture: block/gram-grid-colon-composite-id] [fixture:
block/db-grid-comma-composite-id] [fixture: block/db-grid-pipe-composite-id]
[fixture: block/db-grid-quote-composite-id] [fixture:
block/db-grid-single-quote-composite-id] [fixture:
block/db-grid-backtick-composite-id] [fixture:
block/db-grid-backslash-composite-id] [fixture:
block/gram-grid-open-square-composite-id] [fixture:
block/db-grid-close-square-composite-id] [fixture:
block/gram-grid-open-round-composite-id] [fixture:
block/gram-grid-close-round-composite-id] [fixture:
block/gram-grid-open-brace-composite-id] [fixture:
block/gram-grid-close-brace-composite-id] [fixture:
block/gram-grid-less-than-composite-id] [fixture:
block/gram-grid-greater-than-composite-id] [fixture:
block/gram-grid-equals-composite-id] [fixture:
block/gram-grid-punct-composite-id] [fixture: block/db-grid-arrow-composite-id]
[fixture: block/db-grid-arrow-spaced-composite-id] [fixture:
block/db-grid-comment-composite-id] [fixture:
block/db-grid-comment-line-composite-id] [fixture:
block/db-grid-directive-line-composite-id] [fixture:
block/db-grid-entity-composite-id] [fixture:
block/db-grid-entity-named-composite-id] [fixture:
block/gram-grid-html-composite-id] [fixture:
block/gram-grid-html-br-composite-id] [fixture:
block/gram-grid-html-attribute-composite-id] [fixture:
block/db-grid-ampersand-entity-composite-id] [fixture:
block/gram-grid-keyword-end-composite-id] [fixture:
block/gram-grid-keyword-block-composite-id] [fixture:
block/db-grid-keyword-columns-composite-id] [fixture:
block/db-grid-keyword-space-composite-id] [fixture:
block/db-grid-keyword-class-composite-id] [fixture:
block/db-grid-keyword-classdef-composite-id] [fixture:
block/gram-grid-keyword-header-composite-id] [fixture:
block/db-grid-proto-composite-id] [fixture:
block/db-grid-constructor-composite-id] [fixture:
block/db-grid-root-composite-id] [fixture: block/db-grid-nonascii-composite-id]
[fixture: block/db-grid-emoji-composite-id] [fixture:
block/db-grid-digits-composite-id] [fixture: block/db-grid-empty-composite-id]
[fixture: block/gram-grid-style-rule-composite-id] [fixture:
block/gram-grid-classdef-rule-composite-id] [fixture:
block/db-spec-composite-lf-id] [fixture:
block/db-spec-class-def-next-line-styles] [fixture:
block/db-spec-class-def-next-line-two] [fixture:
block/db-spec-class-def-name-only-then-class] [fixture:
block/db-spec-id-with-quoted-part] [fixture: block/db-spec-id-comment-glued]
[fixture: block/db-spec-percent-id]

### Classes and styles

```text
class-def-statement = "classDef" class-id style ( "," style )*
class-statement     = "class" class-ids class-name?
style-statement     = "style" class-ids style ( "," style )*
```

After `classDef`, `class`, and `style` and the whitespace after them, line feeds
included, the class definition, class, and style contexts read one or more word
characters of ASCII (letters, digits, and `_`) as a `class-id` unit, or, in the
class and style contexts, as a `class-ids` unit, which may go on with any number
of `,`, whitespace, line feeds included, or none, and word characters, and then
the rest of the line as the class name or the styles. In the class definition
context the `class-id` needs whitespace after it, line feeds included, so its
styles may start on the next line, and `classDef c` followed by a line
`class A c` defines the class `c` with the style `class A c`.
`classDef DEFAULT`, a name with `-` or `:`, or with a letter outside ASCII, and
a `classDef` with no name or no styles are rejected, while `default` is a name.
The ids of `class` are the parts of its `class-ids` between `,`, each with the
whitespace after its `,`, and the id of `style` is its `class-ids` as one text.
The styles are the parts between `,` of the rest of the line without the
whitespace at its ends; the class name of `class` is the rest of the line as one
text, which may be empty and may hold whitespace, so `class A c d` gives the
class `c d`. The keywords need whitespace after them and are read in this case
only. [fixture: block/db-class-def-and-apply] [fixture:
block/db-class-def-two-styles] [fixture:
block/db-class-def-spaces-around-styles] [fixture:
block/db-class-def-empty-style] [fixture: block/db-class-def-leading-comma]
[fixture: block/gram-class-def-no-style] [fixture:
block/gram-class-def-spaces-only] [fixture: block/gram-class-def-no-name]
[fixture: block/db-class-def-twice] [fixture: block/db-class-def-twice-same]
[fixture: block/db-class-def-three] [fixture: block/db-class-def-color]
[fixture: block/db-class-def-color-fill] [fixture: block/db-class-def-default]
[fixture: block/gram-class-def-default-upper] [fixture:
block/db-class-def-digits] [fixture: block/db-class-def-underscore] [fixture:
block/gram-class-def-dash] [fixture: block/gram-class-def-non-ascii] [fixture:
block/db-class-def-keyword-names] [fixture: block/db-class-def-keyword-end]
[fixture: block/gram-class-def-name-colon] [fixture:
block/gram-class-def-upper-case] [fixture: block/gram-class-def-lower-case]
[fixture: block/db-class-def-tab] [fixture:
block/db-class-def-line-feed-after-keyword] [fixture:
block/db-class-def-line-feed-after-name] [fixture: block/gram-class-def-glued]
[fixture: block/db-class-def-in-block] [fixture: block/db-class-def-after-use]
[fixture: block/db-class-def-undefined-use] [fixture:
block/db-definitions-class-def-three] [fixture:
block/db-definitions-class-def-three-others] [fixture:
block/db-proto-proto-class-def] [fixture: block/db-proto-proto-class-twice]
[fixture: block/db-proto-constructor-class-def] [fixture:
block/db-class-apply-two] [fixture: block/db-class-apply-same-twice] [fixture:
block/db-class-apply-names-list] [fixture: block/db-class-apply-names-spaces]
[fixture: block/db-class-apply-no-name] [fixture:
block/db-class-apply-no-name-spaces] [fixture: block/gram-class-apply-no-id]
[fixture: block/gram-class-apply-no-id-end] [fixture: block/gram-style-no-id]
[fixture: block/gram-style-no-id-line-feed] [fixture:
block/db-class-apply-name-upper] [fixture: block/db-class-apply-hash] [fixture:
block/db-class-apply-tab] [fixture:
block/db-class-apply-line-feed-after-keyword] [fixture:
block/db-class-apply-line-feed-after-ids] [fixture:
block/db-class-apply-line-feed-after-comma] [fixture:
block/db-class-apply-upper-case-keyword] [fixture: block/db-class-apply-glued]
[fixture: block/db-class-apply-lower-keyword-id] [fixture:
block/db-class-apply-space-shape] [fixture: block/db-class-apply-edge] [fixture:
block/db-definitions-class-three] [fixture:
block/db-definitions-class-three-ids] [fixture: block/db-proto-to-string-class]
[fixture: block/db-proto-proto-directions] [fixture: block/db-class-apply-list]
[fixture: block/db-class-apply-list-spaces] [fixture:
block/db-class-apply-list-space-before-comma] [fixture:
block/db-class-apply-list-three] [fixture:
block/db-class-apply-list-trailing-comma] [fixture:
block/db-class-apply-id-semicolon] [fixture: block/db-class-apply-id-dash]
[fixture: block/db-class-apply-id-case] [fixture: block/db-class-apply-root]
[fixture: block/db-composite-class-on] [fixture:
block/db-composite-class-inside] [fixture: block/db-class-apply-in-block]
[fixture: block/db-class-apply-in-block-outer] [fixture:
block/db-class-apply-undefined-id] [fixture: block/db-class-apply-before-node]
[fixture: block/db-class-apply-before-node-shape] [fixture:
block/db-class-apply-before-node-width] [fixture:
block/db-class-apply-before-edge] [fixture: block/db-class-apply-before-block]
[fixture: block/db-class-apply-undefined-twice] [fixture:
block/db-class-apply-undefined-list] [fixture: block/db-class-apply-mixed-list]
[fixture: block/db-class-apply-in-block-later] [fixture:
block/db-definitions-composite-then-shape-then-composite] [fixture:
block/db-grid-tab-class-def-name] [fixture: block/db-grid-tab-class-apply-id]
[fixture: block/db-grid-tab-style-id] [fixture: block/db-grid-lf-class-def-name]
[fixture: block/db-grid-lf-class-apply-id] [fixture:
block/gram-grid-lf-style-id] [fixture: block/db-grid-cr-class-def-name]
[fixture: block/db-grid-cr-class-apply-id] [fixture:
block/gram-grid-cr-style-id] [fixture: block/db-grid-crlf-class-def-name]
[fixture: block/db-grid-crlf-class-apply-id] [fixture:
block/gram-grid-crlf-style-id] [fixture: block/db-grid-ls-class-def-name]
[fixture: block/db-grid-ls-class-apply-id] [fixture: block/db-grid-ls-style-id]
[fixture: block/db-grid-ps-class-def-name] [fixture:
block/db-grid-ps-class-apply-id] [fixture: block/db-grid-ps-style-id] [fixture:
block/db-grid-nbsp-class-def-name] [fixture: block/db-grid-nbsp-class-apply-id]
[fixture: block/db-grid-nbsp-style-id] [fixture:
block/db-grid-bom-class-def-name] [fixture: block/db-grid-bom-class-apply-id]
[fixture: block/db-grid-bom-style-id] [fixture:
block/db-grid-ideographic-class-def-name] [fixture:
block/db-grid-ideographic-class-apply-id] [fixture:
block/db-grid-ideographic-style-id] [fixture: block/db-grid-ff-class-def-name]
[fixture: block/db-grid-ff-class-apply-id] [fixture: block/db-grid-ff-style-id]
[fixture: block/db-grid-vt-class-def-name] [fixture:
block/db-grid-vt-class-apply-id] [fixture: block/db-grid-vt-style-id] [fixture:
block/db-grid-spaces-class-def-name] [fixture:
block/db-grid-spaces-class-apply-id] [fixture: block/db-grid-spaces-style-id]
[fixture: block/gram-grid-nel-class-def-name] [fixture:
block/db-grid-nel-class-apply-id] [fixture:
block/gram-grid-semicolon-class-def-name] [fixture:
block/db-grid-semicolon-class-apply-id] [fixture:
block/gram-grid-hash-class-def-name] [fixture:
block/db-grid-hash-class-apply-id] [fixture:
block/gram-grid-percent-class-def-name] [fixture:
block/db-grid-percent-class-apply-id] [fixture:
block/gram-grid-colon-class-def-name] [fixture:
block/gram-grid-colon-class-apply-id] [fixture: block/gram-grid-colon-style-id]
[fixture: block/gram-grid-comma-class-def-name] [fixture:
block/db-grid-comma-class-apply-id] [fixture: block/db-grid-comma-style-id]
[fixture: block/gram-grid-dash-class-def-name] [fixture:
block/gram-grid-dash-class-apply-id] [fixture: block/gram-grid-dash-style-id]
[fixture: block/gram-grid-pipe-class-def-name] [fixture:
block/db-grid-pipe-class-apply-id] [fixture:
block/gram-grid-quote-class-def-name] [fixture:
block/db-grid-quote-class-apply-id] [fixture:
block/gram-grid-single-quote-class-def-name] [fixture:
block/db-grid-single-quote-class-apply-id] [fixture:
block/gram-grid-backtick-class-def-name] [fixture:
block/db-grid-backtick-class-apply-id] [fixture:
block/gram-grid-backslash-class-def-name] [fixture:
block/db-grid-backslash-class-apply-id] [fixture:
block/gram-grid-open-square-class-def-name] [fixture:
block/gram-grid-open-square-class-apply-id] [fixture:
block/gram-grid-open-square-style-id] [fixture:
block/gram-grid-close-square-class-def-name] [fixture:
block/db-grid-close-square-class-apply-id] [fixture:
block/gram-grid-open-round-class-def-name] [fixture:
block/gram-grid-open-round-class-apply-id] [fixture:
block/gram-grid-open-round-style-id] [fixture:
block/gram-grid-close-round-class-def-name] [fixture:
block/gram-grid-close-round-class-apply-id] [fixture:
block/gram-grid-close-round-style-id] [fixture:
block/gram-grid-open-brace-class-def-name] [fixture:
block/gram-grid-open-brace-class-apply-id] [fixture:
block/gram-grid-open-brace-style-id] [fixture:
block/gram-grid-close-brace-class-def-name] [fixture:
block/gram-grid-close-brace-class-apply-id] [fixture:
block/gram-grid-close-brace-style-id] [fixture:
block/gram-grid-less-than-class-def-name] [fixture:
block/gram-grid-less-than-class-apply-id] [fixture:
block/gram-grid-less-than-style-id] [fixture:
block/gram-grid-greater-than-class-def-name] [fixture:
block/gram-grid-greater-than-class-apply-id] [fixture:
block/gram-grid-greater-than-style-id] [fixture:
block/gram-grid-equals-class-def-name] [fixture:
block/gram-grid-equals-class-apply-id] [fixture:
block/gram-grid-equals-style-id] [fixture: block/gram-grid-punct-class-def-name]
[fixture: block/gram-grid-punct-class-apply-id] [fixture:
block/gram-grid-punct-style-id] [fixture: block/gram-grid-arrow-class-def-name]
[fixture: block/db-grid-arrow-class-apply-id] [fixture:
block/db-grid-arrow-style-id] [fixture:
block/db-grid-arrow-spaced-class-def-name] [fixture:
block/db-grid-arrow-spaced-class-apply-id] [fixture:
block/db-grid-arrow-spaced-style-id] [fixture:
block/gram-grid-comment-class-def-name] [fixture:
block/db-grid-comment-class-apply-id] [fixture:
block/db-grid-comment-line-class-def-name] [fixture:
block/db-grid-comment-line-class-apply-id] [fixture:
block/gram-grid-comment-line-style-id] [fixture:
block/db-grid-directive-line-class-def-name] [fixture:
block/db-grid-directive-line-class-apply-id] [fixture:
block/gram-grid-directive-line-style-id] [fixture:
block/gram-grid-entity-class-def-name] [fixture:
block/db-grid-entity-class-apply-id] [fixture:
block/gram-grid-entity-named-class-def-name] [fixture:
block/db-grid-entity-named-class-apply-id] [fixture:
block/gram-grid-html-class-def-name] [fixture:
block/gram-grid-html-class-apply-id] [fixture: block/gram-grid-html-style-id]
[fixture: block/gram-grid-html-br-class-def-name] [fixture:
block/gram-grid-html-br-class-apply-id] [fixture:
block/gram-grid-html-br-style-id] [fixture:
block/gram-grid-html-attribute-class-def-name] [fixture:
block/gram-grid-html-attribute-class-apply-id] [fixture:
block/gram-grid-html-attribute-style-id] [fixture:
block/gram-grid-ampersand-entity-class-def-name] [fixture:
block/db-grid-ampersand-entity-class-apply-id] [fixture:
block/db-grid-keyword-end-class-def-name] [fixture:
block/gram-grid-keyword-end-class-apply-id] [fixture:
block/gram-grid-keyword-end-style-id] [fixture:
block/db-grid-keyword-block-class-def-name] [fixture:
block/gram-grid-keyword-block-class-apply-id] [fixture:
block/gram-grid-keyword-block-style-id] [fixture:
block/db-grid-keyword-columns-class-def-name] [fixture:
block/db-grid-keyword-columns-class-apply-id] [fixture:
block/db-grid-keyword-columns-style-id] [fixture:
block/db-grid-keyword-space-class-def-name] [fixture:
block/db-grid-keyword-space-class-apply-id] [fixture:
block/db-grid-keyword-space-style-id] [fixture:
block/db-grid-keyword-class-class-def-name] [fixture:
block/db-grid-keyword-class-class-apply-id] [fixture:
block/db-grid-keyword-class-style-id] [fixture:
block/db-grid-keyword-style-class-def-name] [fixture:
block/db-grid-keyword-classdef-class-def-name] [fixture:
block/db-grid-keyword-classdef-class-apply-id] [fixture:
block/db-grid-keyword-classdef-style-id] [fixture:
block/db-grid-keyword-header-class-def-name] [fixture:
block/gram-grid-keyword-header-class-apply-id] [fixture:
block/gram-grid-keyword-header-style-id] [fixture:
block/db-grid-proto-class-def-name] [fixture:
block/db-grid-proto-class-apply-id] [fixture: block/db-grid-proto-style-id]
[fixture: block/db-grid-constructor-class-def-name] [fixture:
block/db-grid-constructor-class-apply-id] [fixture:
block/db-grid-constructor-style-id] [fixture: block/db-grid-root-class-def-name]
[fixture: block/db-grid-root-class-apply-id] [fixture:
block/db-grid-root-style-id] [fixture: block/gram-grid-nonascii-class-def-name]
[fixture: block/db-grid-nonascii-class-apply-id] [fixture:
block/gram-grid-emoji-class-def-name] [fixture:
block/db-grid-emoji-class-apply-id] [fixture:
block/db-grid-digits-class-def-name] [fixture:
block/db-grid-digits-class-apply-id] [fixture: block/db-grid-digits-style-id]
[fixture: block/db-grid-empty-class-def-name] [fixture:
block/db-grid-empty-class-apply-id] [fixture: block/db-grid-empty-style-id]
[fixture: block/gram-grid-style-rule-class-def-name] [fixture:
block/gram-grid-style-rule-class-apply-id] [fixture:
block/gram-grid-style-rule-style-id] [fixture:
block/gram-grid-classdef-rule-class-def-name] [fixture:
block/gram-grid-classdef-rule-class-apply-id] [fixture:
block/gram-grid-classdef-rule-style-id] [fixture:
block/db-grid-tab-class-def-style] [fixture: block/db-grid-tab-class-apply-name]
[fixture: block/db-grid-tab-style-text] [fixture:
block/db-grid-lf-class-def-style] [fixture: block/db-grid-lf-class-apply-name]
[fixture: block/db-grid-lf-style-text] [fixture:
block/db-grid-cr-class-def-style] [fixture: block/db-grid-cr-class-apply-name]
[fixture: block/db-grid-cr-style-text] [fixture:
block/db-grid-crlf-class-def-style] [fixture:
block/db-grid-crlf-class-apply-name] [fixture: block/db-grid-crlf-style-text]
[fixture: block/db-grid-ls-class-def-style] [fixture:
block/db-grid-ls-class-apply-name] [fixture: block/db-grid-ls-style-text]
[fixture: block/db-grid-ps-class-def-style] [fixture:
block/db-grid-ps-class-apply-name] [fixture: block/db-grid-ps-style-text]
[fixture: block/db-grid-nbsp-class-def-style] [fixture:
block/db-grid-nbsp-class-apply-name] [fixture: block/db-grid-nbsp-style-text]
[fixture: block/db-grid-bom-class-def-style] [fixture:
block/db-grid-bom-class-apply-name] [fixture: block/db-grid-bom-style-text]
[fixture: block/db-grid-ideographic-class-def-style] [fixture:
block/db-grid-ideographic-class-apply-name] [fixture:
block/db-grid-ideographic-style-text] [fixture:
block/db-grid-ff-class-def-style] [fixture: block/db-grid-ff-class-apply-name]
[fixture: block/db-grid-ff-style-text] [fixture:
block/db-grid-vt-class-def-style] [fixture: block/db-grid-vt-class-apply-name]
[fixture: block/db-grid-vt-style-text] [fixture:
block/db-grid-spaces-class-def-style] [fixture:
block/db-grid-spaces-class-apply-name] [fixture:
block/db-grid-spaces-style-text] [fixture: block/db-grid-nel-class-def-style]
[fixture: block/db-grid-nel-class-apply-name] [fixture:
block/db-grid-nel-style-text] [fixture: block/db-grid-semicolon-class-def-style]
[fixture: block/db-grid-semicolon-class-apply-name] [fixture:
block/db-grid-semicolon-style-text] [fixture:
block/db-grid-hash-class-def-style] [fixture:
block/db-grid-hash-class-apply-name] [fixture: block/db-grid-hash-style-text]
[fixture: block/db-grid-percent-class-def-style] [fixture:
block/db-grid-percent-class-apply-name] [fixture:
block/db-grid-percent-style-text] [fixture: block/db-grid-colon-class-def-style]
[fixture: block/db-grid-colon-class-apply-name] [fixture:
block/db-grid-colon-style-text] [fixture: block/db-grid-comma-class-def-style]
[fixture: block/db-grid-comma-class-apply-name] [fixture:
block/db-grid-comma-style-text] [fixture: block/db-grid-dash-class-def-style]
[fixture: block/db-grid-dash-class-apply-name] [fixture:
block/db-grid-dash-style-text] [fixture: block/db-grid-pipe-class-def-style]
[fixture: block/db-grid-pipe-class-apply-name] [fixture:
block/db-grid-pipe-style-text] [fixture: block/db-grid-quote-class-def-style]
[fixture: block/db-grid-quote-class-apply-name] [fixture:
block/db-grid-quote-style-text] [fixture:
block/db-grid-single-quote-class-def-style] [fixture:
block/db-grid-single-quote-class-apply-name] [fixture:
block/db-grid-single-quote-style-text] [fixture:
block/db-grid-backtick-class-def-style] [fixture:
block/db-grid-backtick-class-apply-name] [fixture:
block/db-grid-backtick-style-text] [fixture:
block/db-grid-backslash-class-def-style] [fixture:
block/db-grid-backslash-class-apply-name] [fixture:
block/db-grid-backslash-style-text] [fixture:
block/db-grid-open-square-class-def-style] [fixture:
block/db-grid-open-square-class-apply-name] [fixture:
block/db-grid-open-square-style-text] [fixture:
block/db-grid-close-square-class-def-style] [fixture:
block/db-grid-close-square-class-apply-name] [fixture:
block/db-grid-close-square-style-text] [fixture:
block/db-grid-open-round-class-def-style] [fixture:
block/db-grid-open-round-class-apply-name] [fixture:
block/db-grid-open-round-style-text] [fixture:
block/db-grid-close-round-class-def-style] [fixture:
block/db-grid-close-round-class-apply-name] [fixture:
block/db-grid-close-round-style-text] [fixture:
block/db-grid-open-brace-class-def-style] [fixture:
block/db-grid-open-brace-class-apply-name] [fixture:
block/db-grid-open-brace-style-text] [fixture:
block/db-grid-close-brace-class-def-style] [fixture:
block/db-grid-close-brace-class-apply-name] [fixture:
block/db-grid-close-brace-style-text] [fixture:
block/db-grid-less-than-class-def-style] [fixture:
block/db-grid-less-than-class-apply-name] [fixture:
block/db-grid-less-than-style-text] [fixture:
block/db-grid-greater-than-class-def-style] [fixture:
block/db-grid-greater-than-class-apply-name] [fixture:
block/db-grid-greater-than-style-text] [fixture:
block/db-grid-equals-class-def-style] [fixture:
block/db-grid-equals-class-apply-name] [fixture:
block/db-grid-equals-style-text] [fixture: block/db-grid-punct-class-def-style]
[fixture: block/db-grid-punct-class-apply-name] [fixture:
block/db-grid-punct-style-text] [fixture: block/db-grid-arrow-class-def-style]
[fixture: block/db-grid-arrow-class-apply-name] [fixture:
block/db-grid-arrow-style-text] [fixture:
block/db-grid-arrow-spaced-class-def-style] [fixture:
block/db-grid-arrow-spaced-class-apply-name] [fixture:
block/db-grid-arrow-spaced-style-text] [fixture:
block/db-grid-comment-class-def-style] [fixture:
block/db-grid-comment-class-apply-name] [fixture:
block/db-grid-comment-style-text] [fixture:
block/db-grid-comment-line-class-def-style] [fixture:
block/db-grid-comment-line-class-apply-name] [fixture:
block/db-grid-comment-line-style-text] [fixture:
block/db-grid-directive-class-def-style] [fixture:
block/db-grid-directive-class-apply-name] [fixture:
block/db-grid-directive-style-text] [fixture:
block/db-grid-directive-line-class-def-style] [fixture:
block/db-grid-directive-line-class-apply-name] [fixture:
block/db-grid-directive-line-style-text] [fixture:
block/db-grid-entity-class-def-style] [fixture:
block/db-grid-entity-class-apply-name] [fixture:
block/db-grid-entity-style-text] [fixture:
block/db-grid-entity-named-class-def-style] [fixture:
block/db-grid-entity-named-class-apply-name] [fixture:
block/db-grid-entity-named-style-text] [fixture:
block/db-grid-html-class-def-style] [fixture:
block/db-grid-html-class-apply-name] [fixture: block/db-grid-html-style-text]
[fixture: block/db-grid-html-br-class-def-style] [fixture:
block/db-grid-html-br-class-apply-name] [fixture:
block/db-grid-html-br-style-text] [fixture:
block/db-grid-html-attribute-class-def-style] [fixture:
block/db-grid-html-attribute-class-apply-name] [fixture:
block/db-grid-html-attribute-style-text] [fixture:
block/db-grid-ampersand-entity-class-def-style] [fixture:
block/db-grid-ampersand-entity-class-apply-name] [fixture:
block/db-grid-ampersand-entity-style-text] [fixture:
block/db-grid-keyword-end-class-def-style] [fixture:
block/db-grid-keyword-end-class-apply-name] [fixture:
block/db-grid-keyword-end-style-text] [fixture:
block/db-grid-keyword-block-class-def-style] [fixture:
block/db-grid-keyword-block-class-apply-name] [fixture:
block/db-grid-keyword-block-style-text] [fixture:
block/db-grid-keyword-columns-class-def-style] [fixture:
block/db-grid-keyword-columns-class-apply-name] [fixture:
block/db-grid-keyword-columns-style-text] [fixture:
block/db-grid-keyword-space-class-def-style] [fixture:
block/db-grid-keyword-space-class-apply-name] [fixture:
block/db-grid-keyword-space-style-text] [fixture:
block/db-grid-keyword-class-class-def-style] [fixture:
block/db-grid-keyword-class-class-apply-name] [fixture:
block/db-grid-keyword-class-style-text] [fixture:
block/db-grid-keyword-style-class-def-style] [fixture:
block/db-grid-keyword-style-class-apply-name] [fixture:
block/db-grid-keyword-style-style-text] [fixture:
block/db-grid-keyword-classdef-class-def-style] [fixture:
block/db-grid-keyword-classdef-class-apply-name] [fixture:
block/db-grid-keyword-classdef-style-text] [fixture:
block/db-grid-keyword-header-class-def-style] [fixture:
block/db-grid-keyword-header-class-apply-name] [fixture:
block/db-grid-keyword-header-style-text] [fixture:
block/db-grid-proto-class-def-style] [fixture:
block/db-grid-proto-class-apply-name] [fixture: block/db-grid-proto-style-text]
[fixture: block/db-grid-constructor-class-def-style] [fixture:
block/db-grid-constructor-class-apply-name] [fixture:
block/db-grid-constructor-style-text] [fixture:
block/db-grid-root-class-def-style] [fixture:
block/db-grid-root-class-apply-name] [fixture: block/db-grid-root-style-text]
[fixture: block/db-grid-nonascii-class-def-style] [fixture:
block/db-grid-nonascii-class-apply-name] [fixture:
block/db-grid-nonascii-style-text] [fixture:
block/db-grid-emoji-class-def-style] [fixture:
block/db-grid-emoji-class-apply-name] [fixture: block/db-grid-emoji-style-text]
[fixture: block/db-grid-digits-class-def-style] [fixture:
block/db-grid-digits-class-apply-name] [fixture:
block/db-grid-digits-style-text] [fixture: block/db-grid-empty-class-def-style]
[fixture: block/db-grid-empty-class-apply-name] [fixture:
block/db-grid-empty-style-text] [fixture:
block/db-grid-style-rule-class-def-style] [fixture:
block/db-grid-style-rule-class-apply-name] [fixture:
block/db-grid-style-rule-style-text] [fixture:
block/db-grid-classdef-rule-class-def-style] [fixture:
block/db-grid-classdef-rule-class-apply-name] [fixture:
block/db-grid-classdef-rule-style-text]

The style statement has a rule outside the grammar: its ids, `,` included, must
name a block that an earlier statement made; otherwise the Db of mermaid.js
throws, and the input is rejected (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). [fixture:
block/db-style-plain] [fixture: block/db-style-two] [fixture:
block/db-style-spaces] [fixture: block/db-style-leading-space] [fixture:
block/db-style-trailing-space] [fixture: block/db-style-none] [fixture:
block/db-style-spaces-only] [fixture: block/db-style-only-comma] [fixture:
block/db-style-twice] [fixture: block/db-style-then-none] [fixture:
block/db-definitions-style-three] [fixture:
block/db-definitions-style-three-empty-middle] [fixture:
block/db-style-class-made] [fixture: block/db-style-composite] [fixture:
block/db-style-root] [fixture: block/db-style-in-composite] [fixture:
block/db-composite-style-on] [fixture: block/db-composite-style-inside]
[fixture: block/db-composite-style-outer-inside] [fixture:
block/db-style-before-edge] [fixture: block/db-proto-proto-style-id] [fixture:
block/db-style-name-only] [fixture: block/db-style-tab] [fixture:
block/db-style-line-feed-after-keyword] [fixture:
block/gram-style-line-feed-after-id] [fixture: block/gram-style-upper-case]
[fixture: block/gram-style-glued]

### Empty description blocks

`accDescr`, whitespace, `{`, whitespace, and `}` read no unit in mermaid.js,
wherever they stand, and the block diagram has no accessibility statement: a
block with text, `accTitle:`, and `accDescr:` are rejected. An **empty
description block** is a statement where a statement starts: on the line of the
header, between two statements, before the first, and inside a composite, with
whitespace inside it or a line feed, as in `A accDescr {} B`. A text and a
composite that hold only one are rejected. Anywhere else, inside a statement,
the grammar takes it nowhere, and the input is rejected, while mermaid.js
accepts it as if it were not there: `A --> accDescr {} B`. This is the known
divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).
[fixture: block/db-empty-block-on-header-line] [fixture:
block/gram-description-block-on-header-line] [fixture:
block/div-empty-block-in-edge] [fixture:
block/gram-empty-block-as-only-statement-in-composite] [fixture:
block/db-empty-block-before-columns] [fixture: block/db-empty-block-before-end]
[fixture: block/db-empty-block-between] [fixture:
block/db-empty-block-between-columns-and-number] [fixture:
block/db-empty-block-glued-brace] [fixture: block/db-empty-block-glued-to-id]
[fixture: block/db-empty-block-in-composite] [fixture:
block/db-empty-block-in-label] [fixture: block/db-empty-block-line] [fixture:
block/db-empty-block-line-feed] [fixture: block/gram-empty-block-only] [fixture:
block/db-empty-block-spaces] [fixture: block/gram-empty-block-then-colon]
[fixture: block/db-empty-block-twice] [fixture: block/gram-empty-block-unclosed]
[fixture: block/gram-empty-block-upper-case] [fixture:
block/db-empty-block-with-comment-line] [fixture:
block/gram-empty-block-with-text] [fixture: block/gram-acc-acc-title] [fixture:
block/gram-acc-acc-descr] [fixture: block/gram-acc-acc-descr-block] [fixture:
block/db-acc-acc-title-word] [fixture: block/gram-acc-acc-title-space] [fixture:
block/gram-acc-acc-title-upper] [fixture: block/gram-acc-acc-title-glued]
[fixture: block/db-acc-title-word] [fixture: block/gram-acc-title-colon]

### Empty strings

An empty string, `""`, and an empty markdown string read no unit in mermaid.js,
wherever they stand. The grammar takes them nowhere, since a label is never
empty: `A[""]` and `A -- "" --> B` are rejected by both. Where mermaid.js
accepts an input with them, as if they were not there, it is rejected here: on a
line of its own, before or after an id, an edge, a shape, a width, or `end`,
before a composite, inside a composite, and between `columns` and its number.
Glued to an id, `""` is part of the id (`A""`). This is the known divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).
[fixture: block/div-empty-markdown-between] [fixture:
block/div-empty-markdown-line] [fixture: block/div-empty-string-after-edge]
[fixture: block/div-empty-string-after-id] [fixture:
block/div-empty-string-before-columns-number] [fixture:
block/div-empty-string-before-edge] [fixture: block/div-empty-string-before-end]
[fixture: block/div-empty-string-before-shape] [fixture:
block/div-empty-string-before-width] [fixture: block/div-empty-string-between]
[fixture: block/div-empty-string-first-in-line] [fixture:
block/div-empty-string-in-composite] [fixture: block/div-empty-string-line]
[fixture: block/div-empty-strings-two] [fixture:
block/div-empty-string-before-block-key] [fixture:
block/gram-empty-string-between-edge-parts] [fixture:
block/db-empty-string-glued-to-id] [fixture: block/gram-empty-string-only]
[fixture: block/gram-empty-string-three-quotes] [fixture:
block/gram-empty-markdown-only] [fixture: block/gram-empty-markdown-spaces]

### Rejections outside the grammar

The Db of mermaid.js throws for a `style` statement whose ids, read as one text
with their commas, are not the id of a block that an earlier statement made: a
block defined after the `style`, also inside a composite, `style A,B` when no
block has the id `A,B`, a node lost in a chain of edges or in the edge statement
after `block:`, and `space`. The block `root`, which holds the diagram, is there
before any statement, so `style root` needs no statement before it. After a
`class` statement each of its ids, without the whitespace at its start, is the
id of a block, since the statement makes one for an id that no block has:
`class A, B c` followed by `style B` is accepted with no node `B`. Nothing else
that the grammar accepts is rejected by the Db. [fixture:
block/gram-composite-style-later-outer] [fixture:
block/gram-grid-ampersand-entity-style-id] [fixture:
block/gram-grid-backslash-style-id] [fixture: block/gram-grid-backtick-style-id]
[fixture: block/gram-grid-close-square-style-id] [fixture:
block/gram-grid-comment-style-id] [fixture: block/gram-grid-emoji-style-id]
[fixture: block/gram-grid-entity-named-style-id] [fixture:
block/gram-grid-entity-style-id] [fixture: block/gram-grid-hash-style-id]
[fixture: block/gram-grid-keyword-style-class-apply-id] [fixture:
block/gram-grid-keyword-style-composite-id] [fixture:
block/gram-grid-keyword-style-style-id] [fixture: block/gram-grid-nel-style-id]
[fixture: block/gram-grid-nonascii-style-id] [fixture:
block/gram-grid-percent-style-id] [fixture: block/gram-grid-pipe-style-id]
[fixture: block/gram-grid-quote-style-id] [fixture:
block/gram-grid-semicolon-style-id] [fixture:
block/gram-grid-single-quote-style-id] [fixture: block/gram-style-defined-after]
[fixture: block/gram-style-list] [fixture: block/gram-style-list-spaces]
[fixture: block/gram-style-list-undefined] [fixture: block/gram-style-on-chain]
[fixture: block/gram-style-space] [fixture: block/gram-style-undefined]
[fixture: block/gram-style-on-chain-middle] [fixture:
block/gram-style-on-composite-edge-head-start] [fixture:
block/gram-style-on-composite-edge-head-end] [fixture:
block/gram-style-in-composite-edge-head-before-child] [fixture:
block/db-style-in-composite-edge-head-after-child] [fixture:
block/db-style-root] [fixture: block/db-proto-root-style] [fixture:
block/db-style-after-class-undefined] [fixture:
block/db-style-after-class-list-spaces] [fixture:
block/db-class-apply-list-spaces-then-style]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside an id, a keyword, the header, an arrow, or the name of a
  class makes the input rejected here, while mermaid.js joins the parts (see
  [Directives inside units](#directives-inside-units)).
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that the line rule of `style` lines applies to, as one with the
  label `"style:#a"`, the ignored `;` inside an id or a keyword makes the input
  rejected here, while mermaid.js joins the parts: `A["style:#a"] B;C` has the
  id `BC` there. [fixture: block/div-ignored-semicolon-in-id] [fixture:
  block/div-ignored-semicolon-in-keyword]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty string, an empty markdown string, and an empty description block
  inside a statement are rejected here, while mermaid.js accepts them as if they
  were not there (see [Empty description blocks](#empty-description-blocks) and
  [Empty strings](#empty-strings)).
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in an id, a label, a class name, or a style, makes mermaid.js hand
  the text to the C4 parser, which rejects it; here the text is a block diagram.
  `C4Context` counts at the start of the text only in both, so it is an id.
  [fixture: block/div-c4-component-in-id] [fixture:
  block/div-c4-container-after-node] [fixture:
  block/gram-c4-container-before-header] [fixture:
  block/div-c4-container-in-class-def-name] [fixture:
  block/div-c4-container-in-class-def-style] [fixture:
  block/div-c4-container-in-class-name] [fixture:
  block/db-c4-container-in-comment-line] [fixture:
  block/div-c4-container-in-composite-id] [fixture:
  block/div-c4-container-in-composite-label] [fixture:
  block/db-c4-container-in-directive] [fixture:
  block/div-c4-container-in-edge-label] [fixture:
  block/db-c4-container-in-frontmatter] [fixture: block/div-c4-container-in-id]
  [fixture: block/div-c4-container-in-label] [fixture:
  block/div-c4-container-in-style] [fixture: block/db-c4-container-lower-case]
  [fixture: block/div-c4-container-with-context] [fixture:
  block/db-c4-context-in-id] [fixture: block/db-c4-context-lower-case] [fixture:
  block/div-c4-deployment-in-id] [fixture: block/div-c4-dynamic-in-id]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md)**
  and **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md)**
  apply as in every diagram type.

- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone or `%%{ }%%` before the header is a comment here, while
  mermaid.js reads it as a node before the header and rejects the input (see
  [Detection](#detection)). [fixture: block/div-after-bare-percent-line]
  [fixture: block/div-after-empty-braces-line]

The known divergences
[`comment-takes-character`](../known-divergences/comment-takes-character.md) and
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md)
have no case in this diagram type: its lexer has no comment rule.

## The Db

The summary of the tests package describes how the Db collects the blocks, what
a block defined again keeps, which blocks are left out of the diagram, the type
of a shape, and the block `root`. [fixture: block/db-shape-redefine-shape]
[fixture: block/db-shape-redefine-to-na] [fixture:
block/db-shape-redefine-from-na] [fixture: block/db-shape-redefine-same-label]
[fixture: block/db-shape-redefine-to-odd] [fixture:
block/db-shape-redefine-width] [fixture: block/db-shape-redefine-label-only]
[fixture: block/db-definitions-three-shapes] [fixture:
block/db-definitions-three-labels-first-equal] [fixture:
block/db-definitions-three-na-in-the-middle] [fixture:
block/db-definitions-three-edge-ends] [fixture:
block/db-definitions-three-edge-and-node] [fixture:
block/db-edge-redefine-by-edge] [fixture: block/db-edge-keeps-shape] [fixture:
block/db-arrow-redefine] [fixture: block/db-arrow-redefine-from-square]
[fixture: block/db-arrow-redefine-to-square] [fixture:
block/db-definitions-three-arrows] [fixture: block/db-edge-to-block-arrow]
[fixture: block/db-edge-from-block-arrow] [fixture: block/db-arrow-after-edge]
[fixture: block/db-composite-id-same-as-node-before] [fixture:
block/db-composite-id-same-as-node-after] [fixture:
block/db-composite-id-same-as-node-after-shape] [fixture:
block/db-composite-id-same-composite] [fixture:
block/db-composite-id-same-nested] [fixture:
block/db-composite-id-same-as-child] [fixture:
block/db-composite-id-same-child-defined-in-inner] [fixture:
block/db-composite-child-first-then-composite] [fixture:
block/db-definitions-three-composites] [fixture:
block/db-definitions-shape-then-composite-then-shape] [fixture:
block/db-composite-root-id] [fixture: block/db-proto-root] [fixture:
block/db-proto-root-twice] [fixture: block/db-proto-root-width] [fixture:
block/db-proto-root-label] [fixture: block/db-proto-root-columns] [fixture:
block/db-proto-root-composite-child] [fixture: block/db-proto-root-style]
[fixture: block/db-frontmatter-config-block] [fixture:
block/db-frontmatter-look] [fixture: block/db-frontmatter-html-in-title]
[fixture: block/db-frontmatter-crlf] [fixture: block/gram-frontmatter-empty]
[fixture: block/gram-frontmatter-unclosed] [fixture:
block/gram-frontmatter-indented] [fixture:
block/gram-frontmatter-comment-before] [fixture:
block/gram-frontmatter-after-header] [fixture: block/config-block-padding]
[fixture: block/config-block-use-max-width] [fixture:
block/config-deterministic-ids] [fixture:
block/config-flowchart-html-labels-false] [fixture:
block/config-html-labels-false] [fixture: block/config-look-neo] [fixture:
block/config-max-text-size-small] [fixture:
block/config-security-level-antiscript-all] [fixture:
block/config-security-level-loose-all] [fixture:
block/config-security-level-other-all] [fixture:
block/config-security-level-other-ampersand] [fixture:
block/config-security-level-other-block-arrow-label] [fixture:
block/config-security-level-other-br] [fixture:
block/config-security-level-other-class-style] [fixture:
block/config-security-level-other-composite-label] [fixture:
block/config-security-level-other-directions] [fixture:
block/config-security-level-other-edge-label] [fixture:
block/config-security-level-other-empty-label-space] [fixture:
block/config-security-level-other-label] [fixture:
block/config-security-level-other-style] [fixture:
block/config-security-level-sandbox-all] [fixture:
block/config-security-level-strict-all] [fixture: block/config-theme-dark]
[fixture: block/db-collecting-child-first-then-outer] [fixture:
block/db-collecting-columns-per-composite] [fixture:
block/db-collecting-composite-then-node-shape-width] [fixture:
block/db-collecting-depth-first] [fixture:
block/db-collecting-edge-order-in-composite] [fixture:
block/db-collecting-edge-then-redefine] [fixture:
block/db-collecting-redefine-keeps-directions] [fixture:
block/db-collecting-redefine-label-equal-id] [fixture:
block/db-collecting-redefine-label-only-odd] [fixture:
block/db-collecting-redefine-type-na-keeps] [fixture:
block/db-collecting-two-composites-share-child] [fixture:
block/db-unplaced-class-on-unplaced-child] [fixture:
block/db-unplaced-columns-in-dropped] [fixture:
block/db-unplaced-dropped-with-label] [fixture:
block/db-unplaced-dropped-with-width] [fixture:
block/db-unplaced-edge-into-dropped] [fixture:
block/db-unplaced-nested-composite] [fixture: block/db-unplaced-order] [fixture:
block/db-unplaced-order-defined-later] [fixture: block/db-unplaced-space]
[fixture: block/db-unplaced-style-on-unplaced]
