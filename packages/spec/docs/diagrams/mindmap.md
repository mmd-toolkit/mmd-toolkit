# Mindmap

Japanese version: [mindmap.ja.md](./mindmap.ja.md)

Source of truth in mermaid.js:

- [`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison)
- [`mindmapDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts)
- the tests (`*.spec.ts`, `*.test.ts`) in
  [`mindmap/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap)

This document covers the diagram type `mindmap`. The nodes of the tree are
defined in [ast/mindmap.md](../ast/mindmap.md).

## Detection

Entry 4 of [detection.md](../detection.md) selects this grammar: the text starts
with `mindmap`, after whitespace, in exactly this case
([`detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/detector.ts#L8-L10)).
`MINDMAP` and `Mindmap` match no detector, and empty lines and lines of
whitespace before the header change nothing. [fixture: mindmap/db-header-only]
[fixture: mindmap/db-header-indented] [fixture: mindmap/header-upper-case]
[fixture: mindmap/header-capitalized] [fixture:
mindmap/header-after-empty-lines] [fixture:
mindmap/header-after-whitespace-line]

The lexer then reads the header, the keyword `mindmap`, case-insensitively and
not followed by a word character (see
[The statement context](#the-statement-context)). So `mindmapx` is detected and
rejected, as it is a node text, while `mindmap-x` is the header with the root
`-x` on its line, and `mindmap(x)` the header with a shape as the root. The
first node may stand on the line of the header, after whitespace or right after
it if it starts with a shape or a character other than a word character.
[fixture: mindmap/header-word-suffix] [fixture: mindmap/header-dash-suffix]
[fixture: mindmap/header-shape-glued] [fixture:
mindmap/db-first-node-on-header-line] [fixture:
mindmap/db-first-node-after-header-tab]

The header may not end the diagram text: when nothing follows it in the text
that the lexer reads, which has no directives, but the `\n` that the lexer reads
after the last character (see [End of text](../common.md#end-of-text)), the
input is rejected. So `mindmap`, `  mindmap`, and `mindmap%%{init: {}}%%` with
nothing after them, and `mindmap` at the end of the text after a frontmatter, a
directive line, a comment line, or a bare `%%` line, are rejected. Anything else
after the header is enough: a line break, a lone CR, whitespace, a U+2028, a
comment, or the root. `mindmap` followed by a line break, `mindmap `,
`mindmap %% c`, `mindmap%% c`, `mindmap %%{init: {}}%%`, and `mindmap`, a line
break, and a comment line or a directive line, each at the end of the text, are
diagrams without nodes. [fixture: mindmap/db-header-without-line-feed] [fixture:
mindmap/header-indented-at-end] [fixture: mindmap/header-directive-at-end]
[fixture: mindmap/header-after-frontmatter-at-end] [fixture:
mindmap/header-after-directive-line-at-end] [fixture:
mindmap/header-after-comment-line-at-end] [fixture:
mindmap/header-after-bare-percent-line-at-end] [fixture: mindmap/db-header-only]
[fixture: mindmap/header-cr-at-end] [fixture: mindmap/header-space-at-end]
[fixture: mindmap/db-header-only-trailing-spaces] [fixture:
mindmap/header-line-separator-at-end] [fixture: mindmap/header-comment-at-end]
[fixture: mindmap/header-glued-comment-at-end] [fixture:
mindmap/header-space-directive-at-end] [fixture:
mindmap/header-comment-line-at-end] [fixture:
mindmap/header-directive-line-at-end] [fixture: mindmap/header-root-at-end]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, a comment of the diagram (see
[Diagram detection](../common.md#diagram-detection)); mermaid.js accepts it too,
as its lexer reads it as a comment. A comment line or a directive on a line
before the header, a directive right after the header, and the frontmatter
change nothing. [fixture: mindmap/header-after-bare-percent-line] [fixture:
mindmap/header-after-empty-braces-line] [fixture:
mindmap/db-comment-before-header] [fixture: mindmap/header-after-directive-line]
[fixture: mindmap/header-then-directive-same-line] [fixture:
mindmap/db-frontmatter-before-header]

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
(see [Notation](../common.md#notation)): `::ICON(x)` is an icon, and `MindMap`
is the keyword. A **keyword** below is a word, matched case-insensitively, that
is not followed by a word character. [fixture: mindmap/db-icon-case-insensitive]
[fixture: mindmap/lex-keyword-other-case-as-node]

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

The text may end in the statement context and in the class context only: a
shape, a string, a markdown string, and an icon must be closed. `a[x` followed
by a line `  b`, `a["x]`, and `::icon(x` at the end of the text are rejected.
CRLF and lone CR are line feeds. [fixture: mindmap/lex-shape-unclosed] [fixture:
mindmap/lex-string-unclosed] [fixture: mindmap/lex-icon-unclosed] [fixture:
mindmap/db-crlf-line-ends] [fixture: mindmap/db-lone-cr-line-ends]

**Whitespace and lines.** In the statement context, whitespace other than a line
feed lies between units. A line feed is a `newline` unit, and so is the end of a
diagram comment that a U+2028 or a U+2029 ends (see [Comments](#comments)). A
line that holds only whitespace, and an empty line, are nothing (see
[Blank lines](#blank-lines)). The **indentation** of a node is the whitespace
characters before it on its line, in the text without its directives: every
whitespace character other than a line feed is one character of it, a tab, a
U+3000, a U+00A0, a U+2028, a vertical tab, and a U+FEFF included. [fixture:
mindmap/db-indent-tab-levels] [fixture:
mindmap/db-indent-tab-counts-as-one-char] [fixture:
mindmap/db-indent-fullwidth-space] [fixture: mindmap/db-indent-no-break-space]
[fixture: mindmap/db-indent-mixed-whitespace-kinds] [fixture:
mindmap/lex-indent-line-separator] [fixture: mindmap/lex-indent-vertical-tab]
[fixture: mindmap/lex-indent-byte-order-mark] [fixture:
mindmap/lex-indent-around-directive]

**Node texts.** In the statement context, one or more characters other than `(`,
`[`, `)`, `{`, `}`, and line feed, as many as possible, are a `node-text` unit
(rule 8 of [The statement context](#the-statement-context)). Its text keeps the
whitespace at its end, which mermaid.js keeps in the node: `root` followed by
three spaces is the node `root   `. `]`, `:`, `#`, `"`, `%%`, `:::`, and U+2028
after the first character are characters of it: `a]b`, `a: b # c`, `a"b`,
`root %% c`, `a:::b`, and `a`, U+2028, `b` are node texts, and so are `::x` and
`-x`, which no other rule reads. A single `{`, a `}`, and `}}` after a node text
are read by no rule: `a{b`, `a}b`, and `a}}` are rejected. An entity is one
placeholder (see [Entities](../common.md#entities)). [fixture:
mindmap/db-node-trailing-whitespace] [fixture:
mindmap/lex-node-text-closing-bracket] [fixture:
mindmap/db-text-with-colon-and-hash] [fixture: mindmap/db-text-with-quote]
[fixture: mindmap/db-comment-after-node-text] [fixture:
mindmap/db-class-same-line-as-node] [fixture:
mindmap/lex-node-text-line-separator] [fixture:
mindmap/lex-node-text-double-colon] [fixture: mindmap/lex-node-text-dash-start]
[fixture: mindmap/lex-node-text-open-brace] [fixture:
mindmap/lex-node-text-close-brace] [fixture:
mindmap/lex-node-text-double-close-brace] [fixture:
mindmap/entity-placeholder-in-node-text] [fixture:
mindmap/entity-placeholder-numeric]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit makes the
input rejected. The **text units** are a `node-text`, a `shape-text`, an
`icon-text`, and a `class-text`. The **string units** are a `string` and a
`markdown-string`. The other units, the keyword `mindmap`, `::icon(`, `:::`, and
the openers and closers of shapes, are no text units.

- `a%%{init: {}}%%b` is the node `ab`, `::icon(a%%{init: {}}%%b)` the icon `ab`,
  `:::a%%{init: {}}%%b` the class `ab`, and `a[x%%{init: {}}%%y]` and
  `a["x%%{init: {}}%%y"]` the text `xy`, as in mermaid.js;
  ``r["`a%%{init: {}}%%b`"]`` has the text `ab`. [fixture:
  mindmap/lex-directive-in-node-text] [fixture: mindmap/lex-directive-in-icon]
  [fixture: mindmap/lex-directive-in-class] [fixture:
  mindmap/lex-directive-in-shape-text] [fixture:
  mindmap/lex-directive-in-string] [fixture:
  mindmap/lex-directive-in-markdown-string]
- A directive between two units is allowed: `a((%%{init: {}}%%x))` is a circle,
  and a directive at the end of a node text is no part of it. [fixture:
  mindmap/lex-directive-after-opener] [fixture:
  mindmap/db-directive-after-node-text]
- In `a(%%{init: {}}%%(x))`, `a)%%{init: {}}%%)x((`, `a{%%{init: {}}%%{x}}`,
  `-%%{init: {}}%%)x(-`, `a((x)%%{init: {}}%%)`, `::ic%%{init: {}}%%on(x)`,
  `::%%{init: {}}%%:c`, and `mind%%{init: {}}%%map` as the header, the directive
  lies inside an opener, a closer, or a keyword: the input is rejected, while
  mermaid.js accepts it, reading the two parts as one (see
  [Known divergences](#known-divergences)). [fixture:
  mindmap/div-directive-in-opener] [fixture:
  mindmap/div-directive-in-bang-opener] [fixture:
  mindmap/div-directive-in-hexagon-opener] [fixture:
  mindmap/div-directive-in-dash-opener] [fixture:
  mindmap/div-directive-in-closer] [fixture:
  mindmap/div-directive-in-icon-keyword] [fixture:
  mindmap/div-directive-in-class-marker] [fixture:
  mindmap/div-directive-in-header-keyword]

**Trivia between units.** A comment line, and a directive on a line of its own,
are removed before the lexer reads the text (see
[Comment lines](../common.md#comment-lines)); a comment line goes with its line
feed, while a directive leaves its line empty. An unclosed directive takes the
rest of the text (see
[Where a directive is](../common.md#where-a-directive-is)): `  a`, a line
`%%{x`, and a line `  b` have no node b. On a line that matches the `style` rule
(see [`style` and `classDef` lines](../common.md#style-and-classdef-lines)), the
last `;` is ignored, and the lexer reads through it inside every text unit and
string unit: `style:#x;y` is the node `style:#xy`, `a[style:#x;y]` and
`a["style:#x;y"]` have the text `style:#xy`, and `::icon(style:#x;y)` and
`:::style:#x;y` the icon and the class `style:#xy`. Only the last `;` of the
line is ignored, so with two the first may end an entity: `style:#x;y;z` is the
node text `style:` followed by the placeholder of `#x;` and by `yz`. An ignored
`;` inside an opener or a closer makes the input rejected, while mermaid.js
reads the two parts as one: `style:#x{;{b}}` is a hexagon in mermaid.js (see
[Known divergences](#known-divergences)). [fixture:
mindmap/db-comment-line-between-nodes] [fixture:
mindmap/db-comment-line-indented-deeper] [fixture:
mindmap/db-directive-line-between-nodes] [fixture:
mindmap/db-directive-line-indented] [fixture:
mindmap/tokens-unclosed-directive-takes-rest] [fixture:
mindmap/tokens-ignored-semicolon-in-node-text] [fixture:
mindmap/tokens-ignored-semicolon-in-shape-text] [fixture:
mindmap/tokens-ignored-semicolon-in-string] [fixture:
mindmap/tokens-ignored-semicolon-in-icon] [fixture:
mindmap/tokens-ignored-semicolon-in-class] [fixture:
mindmap/tokens-ignored-semicolon-last-of-two] [fixture:
mindmap/div-ignored-semicolon-in-opener]

### The statement context

In the statement context, the lexer tries these rules in order:

1. `%%` and the characters up to the end of its line segment: a diagram comment
   (see [Comments](#comments)). [fixture:
   mindmap/lex-bare-percent-line-between-nodes]
2. The keyword `mindmap`: a `header` unit. [fixture: mindmap/db-header-only]
3. `:::`: a `:::` unit; enters the class context. [fixture:
   mindmap/db-class-line]
4. `::icon(`, compared case-insensitively: an `::icon(` unit; enters the icon
   context. [fixture: mindmap/db-icon-line]
5. One or more line feeds: a `newline` unit. [fixture:
   mindmap/db-first-node-unindented]
6. An opener: `-)`, `(-`, `))`, `)`, `((`, `{{`, `(`, or `[`, tried in this
   order: an `opener` unit; enters the shape context. [fixture:
   mindmap/db-shape-rect]
7. One or more whitespace characters other than line feed: nothing. [fixture:
   mindmap/db-indent-root-offset]
8. A node text (see [Node texts](#units-and-contexts)): a `node-text` unit.
   [fixture: mindmap/db-first-node-unindented]

Some consequences of the order:

- The keyword is a keyword wherever a unit starts, so no node text starts with
  it: a node `mindmap`, `MindMap(x)`, and `mindmap stuff` are rejected, while
  `mindmapx` and `a mindmap` are node texts. [fixture:
  mindmap/lex-keyword-as-node] [fixture: mindmap/lex-keyword-other-case-as-node]
  [fixture: mindmap/lex-keyword-then-words] [fixture:
  mindmap/lex-keyword-prefix-as-node] [fixture:
  mindmap/lex-keyword-inside-node-text]
- A node text runs to the first `(`, `[`, `)`, `{`, or `}`, so the opener after
  it starts a shape, and `-)` only starts a shape where a unit starts:
  `r-)text(-` is the node text `r-` and the shape `)text(-`, while `-)x(-` is a
  shape alone. [fixture: mindmap/db-shape-explode-dash-form] [fixture:
  mindmap/gram-shape-dash-opener-without-id]
- `::icon(` and `:::` start an icon or a class line only where a unit starts:
  `root ::icon(x)` is the node text `root ::icon` and the shape `(x)`. [fixture:
  mindmap/db-icon-same-line]

### The shape context

The shape context is entered by an opener. It reads the label and the closer:

1. `` "` ``, zero or more characters other than `` ` `` and `"`, line feeds
   included, and `` `" ``: a `markdown-string` unit; an `empty-markdown-string`
   unit when nothing lies between. When anything else comes first after the
   `` "` ``, a `"`, a `` ` `` that no `"` follows, or the end of the text, the
   input is rejected, and rule 2 is not tried: ``a["`x"]``, ``a["`x" ]``,
   ``a["`"]``, ``a["`x`y"]``, ```a["`x``"]```, and ``a["`x`` at the end of the
   text are rejected. [fixture: mindmap/db-shape-markdown-string] [fixture:
   mindmap/lex-markdown-string-quote] [fixture:
   mindmap/lex-markdown-string-quote-then-space] [fixture:
   mindmap/lex-markdown-string-backquote-only] [fixture:
   mindmap/lex-markdown-string-then-text] [fixture:
   mindmap/lex-markdown-string-two-backquotes] [fixture:
   mindmap/lex-markdown-string-unclosed]
2. `"`, zero or more characters other than `"`, line feeds included, and `"`: a
   `string` unit; an `empty-string` unit when nothing lies between. [fixture:
   mindmap/db-shape-string]
3. A closer: `))`, `)`, `]`, `}}`, `(-`, `-)`, `((`, or `(`, tried in this
   order: a `closer` unit; leaves the shape context. [fixture:
   mindmap/db-shape-rect]
4. One or more characters other than `)`, `]`, `(`, and `}`, line feeds
   included, as many as possible: a `shape-text` unit. [fixture:
   mindmap/gram-shape-text-line-feed]

A `}` that does not start `}}` is read by no rule, so `a[x}y]`, `a[}]`, and
`a{{x}y}}` are rejected. `{`, `[`, `"` after the first character, and `%%` are
characters of a shape text, and the shape text may go over lines: `a[x{y]`,
`a[x[y]`, `a[x"y]`, `a[%% c]`, and `a[x`, a line break, and `y]` are shapes. A
`"` is a string only where a unit starts, right after the opener: `a[ "x" ]` has
the text `"x"`. Rule 4 reads a `-` before a `)`, so the closer `-)` follows only
a string or a markdown string. [fixture: mindmap/gram-shape-text-close-brace]
[fixture: mindmap/gram-shape-text-close-brace-first] [fixture:
mindmap/gram-shape-text-close-brace-in-hexagon] [fixture:
mindmap/gram-shape-text-open-brace] [fixture:
mindmap/gram-shape-text-open-bracket] [fixture: mindmap/gram-shape-text-quote]
[fixture: mindmap/lex-percent-in-shape-text] [fixture:
mindmap/gram-shape-text-line-feed] [fixture:
mindmap/gram-shape-text-quoted-with-space] [fixture:
mindmap/gram-shape-dash-in-text-before-closer] [fixture:
mindmap/gram-shape-dash-closer-after-string]

### The icon and class contexts

In the icon context, `)` leaves the context, and one or more characters other
than `)`, line feeds included, are an `icon-text` unit: `::icon(x`, a line
break, and `  a)` has the icon `x`, a line feed, two spaces, and `a`. In the
class context, one or more characters other than line feed, U+2028, and U+2029
are a `class-text` unit, and the context is left; a line feed, a U+2028, or a
U+2029 leaves the context without a unit. So a class line takes the rest of its
line segment: `:::c ::icon(x)` has the class `c ::icon(x)`, and `:::a`, U+2028,
`b` is a class and a node text on one line, which is rejected. [fixture:
mindmap/gram-icon-line-feed] [fixture: mindmap/db-icon-line] [fixture:
mindmap/gram-class-takes-rest-of-line] [fixture:
mindmap/lex-class-ends-at-line-separator] [fixture:
mindmap/lex-class-line-separator-then-line-feed]

### Comments

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line segment and that mermaid.js reads as nothing. They are not the
comment lines of [common.md](../common.md#comment-lines), which are removed
before the lexer reads the text; a line `%%` alone and a line `%%{ }%%` are
diagram comments, not comment lines. [fixture:
mindmap/lex-bare-percent-line-between-nodes] [fixture:
mindmap/lex-percent-brace-line-between-nodes]

A diagram comment starts at `%%` where a unit starts in the statement context
(rule 1): on a line of its own, after the header, after a shape, and after an
icon, with whitespace before it or not. It runs to the end of its line segment
(see [Notation](../common.md#notation)): a line feed, a U+2028, or a U+2029 ends
it, and the text after a U+2028 or a U+2029 is read as a new line, whose
indentation starts with that character: `a[x] %% c`, U+2028, and `y` is the node
`a[x]` and the node `y` at the indentation of one character. Inside a node text,
a shape text, and a class, `%%` is a character of the text. The **mark** of a
diagram comment is `%%`, and its value is the text after it. [fixture:
mindmap/lex-comment-after-header] [fixture:
mindmap/lex-comment-after-header-glued] [fixture:
mindmap/lex-comment-after-shape] [fixture:
mindmap/lex-comment-after-shape-glued] [fixture: mindmap/lex-comment-after-icon]
[fixture: mindmap/lex-comment-ends-at-line-separator] [fixture:
mindmap/db-comment-after-node-text] [fixture: mindmap/lex-percent-in-shape-text]
[fixture: mindmap/lex-percent-in-class]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name stands for one unit with that name, and text
in double quotes stands for the unit named by that text. The grammar is a
restatement of the grammar in
[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L66-L127),
except where [Blank lines](#blank-lines) says otherwise.

Each rule below makes a node of the tree, defined in
[ast/mindmap.md](../ast/mindmap.md):

| Rule                                   | Node                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `diagram`                              | MindmapDiagram                                                                                                     |
| `node`                                 | MindmapNode; its place in the tree comes from [Indentation and parents](#indentation-and-parents)                  |
| `shape`                                | MindmapShape                                                                                                       |
| `shape-label`                          | MindmapLabel, whose kind is `text`, `string`, or `markdown` for a `shape-text`, a `string`, or a `markdown-string` |
| `icon-line`                            | MindmapIconStatement, a decoration of the node added last                                                          |
| `class-line`                           | MindmapClassStatement, a decoration of the node added last                                                         |
| `node-text`, `icon-text`, `class-text` | MindmapLiteral                                                                                                     |

### Diagram and lines

```text
diagram    = "header" node? ( newline line? )*
line       = node | icon-line | class-line
node       = node-text shape? | shape
shape      = opener shape-label closer
shape-label = shape-text | string | markdown-string
icon-line  = "::icon(" icon-text ")"
class-line = ":::" class-text
```

Each node, icon, and class stands on a line of its own: nothing but whitespace
and a comment may follow a shape or an icon on its line, and a node text runs to
the end of its line. `a["x"]y`, `a[x] y`, `a[x]]`, `a[x] :::c`, `::icon(x) y`,
`::icon(x)::icon(y)`, and `::icon(x):::c` are rejected, while whitespace after a
shape changes nothing. The first node may stand on the line of the header, and
the header may not end the diagram text (see [Detection](#detection)). [fixture:
mindmap/gram-shape-then-text-glued] [fixture: mindmap/db-shape-text-after-end]
[fixture: mindmap/gram-shape-then-bracket] [fixture:
mindmap/gram-shape-then-class] [fixture: mindmap/gram-icon-then-text] [fixture:
mindmap/gram-icon-then-icon] [fixture: mindmap/gram-icon-then-class] [fixture:
mindmap/gram-shape-trailing-whitespace]

### Indentation and parents

The first node is the root, whatever its indentation. Every other node is a
child of the nearest node before it whose indentation is smaller than its own;
so a node as indented as an earlier one is its sibling, after the nodes below
that one, and a node may be indented by any number of characters more than its
parent. In `root`, `    a`, `  b`, `    c` on four lines, a and b are children
of the root and c a child of b, and a tab counts as one character, so `  b`
after a line `\ta` is a child of a. A node that is not the first and has no such
node, because it is as indented as the root or less, makes the input rejected
(see [Rejections outside the grammar](#rejections-outside-the-grammar)).
[fixture: mindmap/db-first-node-unindented] [fixture:
mindmap/db-indent-root-offset] [fixture: mindmap/db-indent-skips-levels]
[fixture: mindmap/db-indent-parent-is-nearest-shallower] [fixture:
mindmap/db-indent-sibling-after-deeper] [fixture:
mindmap/gram-indent-between-earlier-levels] [fixture:
mindmap/gram-indent-tab-then-spaces] [fixture:
mindmap/db-first-node-on-header-line] [fixture:
mindmap/db-first-node-on-header-line-wide-gap] [fixture:
mindmap/db-first-node-on-header-line-child-too-shallow]

### Nodes and shapes

A node is a node text, a node text and a shape, or a shape alone: `root`,
`a(text)`, `[text]`, and `((text))`. The node text before a shape keeps its
whitespace: `a (x)` has the id `a `. `a(b)c` is rejected, as text follows the
shape. A shape alone has no node text. [fixture:
mindmap/db-first-node-unindented] [fixture: mindmap/db-shape-rounded] [fixture:
mindmap/db-shape-without-id] [fixture: mindmap/db-shape-without-id-circle]
[fixture: mindmap/gram-node-text-space-before-shape] [fixture:
mindmap/db-shape-id-with-parentheses]

The closer need not match the opener: `[text)`, `((x)`, `(x))`, `(x]`, and
`-)x(-` are shapes, and `(-text-)` is the opener `(-`, the text `text-`, and the
closer `)`. How mermaid.js reads the type of the shape from the opener and the
closer is in the summary of the tests package. A shape needs a label: `r[]` is
rejected. [fixture: mindmap/db-shape-rect] [fixture: mindmap/db-shape-rounded]
[fixture: mindmap/db-shape-circle] [fixture: mindmap/db-shape-cloud] [fixture:
mindmap/db-shape-bang] [fixture: mindmap/db-shape-hexagon] [fixture:
mindmap/db-shape-mismatched-end] [fixture:
mindmap/gram-shape-circle-single-closer] [fixture:
mindmap/gram-shape-round-double-closer] [fixture:
mindmap/gram-shape-round-other-closer] [fixture:
mindmap/db-shape-cloud-dash-form] [fixture:
mindmap/gram-shape-dash-opener-without-id] [fixture:
mindmap/db-shape-empty-description] [fixture:
mindmap/gram-shape-parenthesis-closes-rect]

The label is one unit: a shape text, a string, or a markdown string. After a
string or a markdown string only a closer may follow, and any closer may:
`a["x" ]`, `a["x""]`, `a["x""y"]`, and ``a["`x`" ]`` are rejected, and `a["x"))`
is accepted. Strings may stand in every shape: `r{{"x"}}`, `r)"x"(`, `r))"x"((`,
and `r(-"x"-)` are accepted. A string and a markdown string may hold line feeds;
a CRLF in a string is a line feed. [fixture: mindmap/gram-string-then-space]
[fixture: mindmap/gram-string-then-quote] [fixture: mindmap/gram-two-strings]
[fixture: mindmap/gram-markdown-string-then-space] [fixture:
mindmap/gram-string-then-double-closer] [fixture:
mindmap/gram-strings-in-round-and-circle] [fixture:
mindmap/gram-string-in-hexagon] [fixture: mindmap/gram-string-in-cloud]
[fixture: mindmap/gram-string-in-bang] [fixture:
mindmap/gram-string-in-dash-form] [fixture: mindmap/lex-string-line-feed]
[fixture: mindmap/lex-string-crlf] [fixture:
mindmap/lex-markdown-string-line-feed] [fixture:
mindmap/lex-html-attribute-quote-in-description] [fixture:
mindmap/entity-placeholder-in-description]

### Icons and classes

An icon line gives an icon, and a class line a class, to the node added last,
which is the node of the nearest node line before it, whatever the indentation
of the icon or class line; a node may have more than one icon line and class
line. An icon line before the line of a child decorates the node before it. The
icon keeps the whitespace inside its parentheses, and the class the whitespace
at its ends. [fixture: mindmap/db-icon-line] [fixture: mindmap/db-icon-twice]
[fixture: mindmap/db-icon-and-class-on-child] [fixture:
mindmap/db-icon-indent-ignored] [fixture: mindmap/gram-icon-then-child]
[fixture: mindmap/db-icon-surrounding-whitespace] [fixture:
mindmap/db-class-line] [fixture: mindmap/db-class-twice] [fixture:
mindmap/db-class-trailing-space] [fixture: mindmap/db-class-leading-whitespace]
[fixture: mindmap/entity-placeholder-in-icon] [fixture:
mindmap/entity-placeholder-in-class]

### Empty forms

An empty icon, `::icon()`, an empty class line, `:::` with nothing after it on
its line, an empty string, `""`, and an empty markdown string in a shape have no
text unit, so no rule of the grammar takes them, and the input is rejected
wherever they stand. mermaid.js reads no token for them and accepts the input
where what is left is accepted: `::icon()` after a node, an indented `::icon()`
and a `:::` before the root, and `a[""x]` and `a["``"x]`, which have the text
`x`. It rejects `::icon()` right after the header, an indented `:::` before a
node line, and `a[""]` and `a["``"]`, as both do. This is the known divergence
[`tokenless-empty-forms`](#known-divergences). Quotes after the first character
of a shape text are characters of it: `a[x""]` has the text `x""`. [fixture:
mindmap/db-icon-empty] [fixture: mindmap/div-empty-icon-before-root] [fixture:
mindmap/gram-empty-icon-right-after-header] [fixture: mindmap/db-class-empty]
[fixture: mindmap/div-empty-class-before-root] [fixture:
mindmap/gram-empty-class-then-node] [fixture: mindmap/div-empty-string-in-shape]
[fixture: mindmap/div-empty-markdown-string-in-shape] [fixture:
mindmap/gram-empty-string-shape] [fixture:
mindmap/gram-empty-markdown-string-shape] [fixture:
mindmap/gram-shape-text-quotes-after-text]

### Blank lines

Empty lines, lines of whitespace only, comment lines, and diagram comments
change nothing wherever they stand after the header: between nodes, between the
header and the first node, and at the end. [fixture:
mindmap/db-blank-line-between-nodes] [fixture:
mindmap/db-whitespace-only-line-between-nodes] [fixture:
mindmap/db-tab-only-line-between-nodes] [fixture:
mindmap/db-whitespace-after-last-node] [fixture:
mindmap/db-comment-line-after-header] [fixture:
mindmap/gram-comment-then-blank-at-end] [fixture:
mindmap/gram-blank-then-comment-between-nodes] [fixture:
mindmap/gram-comment-line-then-blank-between-nodes] [fixture:
mindmap/gram-blank-then-icon]

mermaid.js rejects some of these inputs, as its lexer reads a diagram comment
together with the whitespace and line feeds before it, and a run of whitespace
that ends with a line feed as one token, each of which it counts as a statement
or as the end of one in turn. This is the known divergence
[`blank-line-after-header-or-comments`](#known-divergences), which lists the
inputs. [fixture: mindmap/db-blank-line-after-header] [fixture:
mindmap/div-comment-then-blank-between-nodes]

### Rejections outside the grammar

The Db of mermaid.js throws for two kinds of input, which are rejected:

- A node that is not the first and has no node before it with a smaller
  indentation, because it is as indented as the root or less: it would be a
  second root. A tab is one character, so a line `\tchild` after a root indented
  by four spaces is rejected. [fixture: mindmap/db-indent-same-as-root]
  [fixture: mindmap/db-indent-less-than-root] [fixture:
  mindmap/db-indent-tab-not-expanded-below-root]
- An icon line or a class line before the first node, which has no node to
  decorate. [fixture: mindmap/db-icon-before-node] [fixture:
  mindmap/db-class-before-node]

## Known divergences

- **[`blank-line-after-header-or-comments`](../known-divergences/blank-line-after-header-or-comments.md).**
  An empty line or a line of whitespace after the header or after diagram
  comments, in the places that the document of the divergence lists, is accepted
  in this specification, while mermaid.js rejects the input (see
  [Blank lines](#blank-lines)). [fixture: mindmap/db-blank-line-after-header]
  [fixture: mindmap/db-whitespace-line-after-header] [fixture:
  mindmap/db-directive-between-header-and-first-node] [fixture:
  mindmap/div-header-trailing-spaces-then-node] [fixture:
  mindmap/div-header-two-comments-then-blank] [fixture:
  mindmap/div-comment-then-blank-between-nodes] [fixture:
  mindmap/div-three-comments-then-blank-between-nodes]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty icon, an empty class line, and an empty string or empty markdown
  string in a shape make the input rejected in this specification, wherever they
  stand, while mermaid.js reads no token for them and accepts many such inputs
  (see [Empty forms](#empty-forms)). [fixture: mindmap/db-icon-empty] [fixture:
  mindmap/div-empty-icon-before-root] [fixture: mindmap/db-class-empty]
  [fixture: mindmap/div-empty-class-before-root] [fixture:
  mindmap/div-empty-string-in-shape] [fixture:
  mindmap/div-empty-markdown-string-in-shape]
- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside an opener, a closer, `::icon(`, `:::`, or the header makes
  the input rejected in this specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)). [fixture:
  mindmap/div-directive-in-opener] [fixture: mindmap/div-directive-in-closer]
  [fixture: mindmap/div-directive-in-icon-keyword] [fixture:
  mindmap/div-directive-in-class-marker] [fixture:
  mindmap/div-directive-in-header-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule, an ignored `;` inside an opener or a
  closer makes the input rejected here, while mermaid.js removes the `;` and
  reads the parts as one: `style:#x{;{b}}` is a hexagon in mermaid.js. Inside a
  text unit, the reading of mermaid.js is kept. [fixture:
  mindmap/div-ignored-semicolon-in-opener] [fixture:
  mindmap/tokens-ignored-semicolon-in-node-text] [fixture:
  mindmap/tokens-ignored-semicolon-in-shape-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `root["b="c">d"]` has the text `b='c'>d`
  in mermaid.js, while here the string ends at its second `"`, and the input is
  rejected. [fixture: mindmap/div-html-tag-starts-in-frontmatter-string]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: mindmap/div-frontmatter-invalid-yaml]

The known divergence `c4-keyword-anywhere` does not show in this diagram type,
because mermaid.js tries the detector of mindmap before that of C4:
`C4Container` is a node text. [fixture: mindmap/lex-c4-keyword-as-node-text]
