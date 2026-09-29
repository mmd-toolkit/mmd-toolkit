# Flowchart

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

Source of truth in mermaid.js:

- [`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison)
- [`flowParser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flowParser.ts)
- [`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts)
- the tests (`*.spec.js`) in
  [`parser/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser)

This document covers the diagram types `flowchart-v2`, `flowchart-elk`, and
`swimlane`: all three use the same grammar and the same Db. The nodes and tokens
of the tree are defined in [ast/flowchart.md](../ast/flowchart.md).

## Detection

Three entries of [detection.md](../detection.md) select this grammar: entry 3
(`flowchart-elk`, id `flowchart-elk`), entry 16 (`swimlane-beta`, id
`swimlane`), and entry 17 (`graph` or `flowchart`, id `flowchart-v2`). [fixture:
common/detect-minimal-flowchart-elk] [fixture: common/detect-minimal-swimlane]
[fixture: common/detect-minimal-flowchart-v2]

Detection only looks at the start of the text. The grammar then reads the header
keyword again (see [The header context](#the-header-context)), and it requires
that no word character follows it. So `graphTD` is detected as `flowchart-v2`
and rejected, and `flowchart-elkX` is detected as `flowchart-elk` and rejected,
because the grammar reads `flowchart` and then cannot read `-elkX`. [fixture:
common/detect-no-boundary-graph] [fixture: flowchart/header-elk-suffix]

Detection leaves out a line that holds only `%%` before the header (see
[Diagram detection](../common.md#diagram-detection)), but the lexer reads it as
diagram text, an id, and the grammar starts with the header, so the input is
rejected, as in mermaid.js. [fixture: flowchart/header-after-bare-percent-line]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text: the rules
read it, and check conditions on it, like any other line feed, and `end-of-text`
in the grammar is the position after it. So `flowchart` alone, without a line
break, is accepted: the header context reads the added `\n` as the end of the
header. [fixture: flowchart/header-only-no-line-break] [fixture:
flowchart/header-direction-trailing-space] This section describes the diagram's
own token rules, item 4 of [Reading a source](../common.md#reading-a-source).

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units, and the tokens of the tree are made from them (see
[ast/flowchart.md](../ast/flowchart.md#tokens)). Each unit has a name, which the
grammar uses, and a **text**: the characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it; leaving the statement
context keeps the statement context. At each position, the lexer applies the
first rule of the current context that matches there. Every character that a
rule reads belongs to one of the units it produces; where a rule would read each
character of the placeholder of an entity as a unit of its own, the placeholder
is one unit instead, which holds the source characters of the entity (see
[Entities](../common.md#entities)). Whitespace that a rule reads between or
after its other characters belongs to the unit that the rule produces before it,
or, when there is none before it, to the first; whitespace read by a rule that
produces no unit, such as the one whitespace character that leaves the click
context, belongs to no unit. Which unit such whitespace belongs to changes no
token and no value: tokens leave out the whitespace at their ends, and the
values that could hold it say whether they do. At the end of the text, the lexer
stops.

The rules of each context are listed below. When no rule of the current context
matches, the input is rejected; the lists do not repeat this. A rule that
rejects the input is listed only where it comes before a rule that would
otherwise match: there the lexer of mermaid.js reads something that its grammar
never accepts.

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them: the units, the conditions on the characters
that follow, the contexts, and the whitespace after `}` are all decided on that
text. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units and to the tokens made from them
([ast/flowchart.md](../ast/flowchart.md#tokens)): a unit that is not `RawText`
or `Identifier` with a directive inside it makes the input rejected, and a token
with a directive inside it is cut at the directive.

- A directive in whitespace at the edge of a token changes nothing: in
  `A --> %%{init: {}}%% B`, the directive lies in the whitespace of the arrow
  unit. [fixture: flowchart/lex-directive-after-arrow]
- `style%%{init: {}}%%A-->B` has the vertex `styleA`, as in mermaid.js: the
  lexer reads the id run `styleA`, and the directive splits its `Identifier`
  token. `A-->en%%{init: {}}%%d` is rejected, as in mermaid.js: the lexer reads
  the keyword `end`. [fixture: flowchart/lex-directive-inside-id] [fixture:
  flowchart/lex-directive-joins-keyword]
- The title of `accTitle: a %%{init: {}}%% b` is `a`, two spaces, and `b`, the
  click id of `click A%%{init: {}}%%B "u"` is `AB`, and the subgraph
  `subgraph sty%%{init: {}}%%le x` has the title `style x`, all as in
  mermaid.js: the directive splits a `RawText` or `Identifier` token. [fixture:
  flowchart/lex-directive-in-title] [fixture:
  flowchart/lex-directive-in-description-block] [fixture:
  flowchart/lex-directive-in-click-id] [fixture:
  flowchart/lex-directive-in-callback-name] [fixture:
  flowchart/lex-directive-in-callback-arguments] [fixture:
  flowchart/lex-directive-in-subgraph-name]
- In `A--%%{init: {}}%%>B`, the directive lies inside the arrow unit `-->`, of
  kind `Punctuator`, and the input is rejected, while mermaid.js accepts it. So
  it is with strings and markdown strings, keywords such as the `href` of
  `click A hr%%{init: {}}%%ef "u"`, and delimiters such as `:::` (see
  [Known divergences](#known-divergences)). [fixture:
  flowchart/lex-directive-inside-arrow] [fixture: common/directive-in-string]
  [fixture: flowchart/div-directive-in-markdown-string]
- A directive between two units is allowed whatever their kind.
  `accTitle%%{init: {}}%%: t` has the title `t`, and `A(%%{init: {}}%%(x))` is a
  circle, as in mermaid.js: in the second, the directive cuts the token of the
  opening delimiters into `(` and `(`. [fixture:
  flowchart/lex-directive-between-acctitle-colon] [fixture:
  flowchart/tokens-circle-directive-between]

### Whitespace after `}`

When a `}` is followed by whitespace that contains a line feed, the lexer reads
that whitespace, up to and including its last line feed, as one line feed. The
whitespace is that of the diagram text, so comment regions and directives inside
it are left out. mermaid.js makes this replacement in
[`flowParser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flowParser.ts#L6-L10)
before its grammar reads the text.

So a directive in that whitespace gives the result of mermaid.js: `A-- a}`, two
spaces, a directive, two spaces, a line break, and ` b -->B` has the link text
`a}`, a line break, and ` b`, and `click A call f(a}`, two spaces, a directive,
two spaces, a line break, and ` b)` is accepted. [fixture:
flowchart/lex-brace-link-text-directive] [fixture:
flowchart/lex-brace-callback-arguments-directive]

- It lets a line end in whitespace after a data block: `A@{ shape: rect }`
  followed by spaces and a line break is accepted, although the grammar does not
  accept whitespace after a data block at the end of a statement. [fixture:
  flowchart/lex-brace-data-trailing-space] [fixture:
  flowchart/lex-brace-data-trailing-directive]
- It changes the value of a string that contains such a `}`: the label of
  `A["a}`, two spaces, a line break, and `  b"]` is `a}`, a line break, and
  `  b`. [fixture: flowchart/lex-brace-string]

### The statement context

At each position in the statement context, the lexer applies the first of these
rules that matches:

1. `accTitle`, zero or more whitespace, `:`, and zero or more whitespace: an
   `accTitle` unit and a `:` unit; enters the title context.
2. `accDescr`, zero or more whitespace, `:`, and zero or more whitespace: an
   `accDescr` unit and a `:` unit; enters the description context.
3. `accDescr`, zero or more whitespace, `{`, and zero or more whitespace: an
   `accDescr` unit and a `{` unit; enters the description block context.
4. `@{`: a `data-start` unit; enters the data context.
5. `call` and one or more whitespace: a `call` unit; enters the callback name
   context.
6. `"`: a string (see [Strings](#strings)), which is one unit.
7. `style`, `default`, `linkStyle`, `interpolate`, `classDef`, or `class`, not
   followed by a word character: a unit named by its text. `classDef` is tried
   before `class`.
8. `href` and one whitespace character: an `href` unit.
9. `click` and one or more whitespace: a `click` unit; enters the click context.
10. `flowchart-elk`, `swimlane-beta`, `graph`, or `flowchart`, not followed by a
    word character: a `header-keyword` unit. The first header keyword in the
    text also enters the header context.
11. `subgraph`, not followed by a word character: a `subgraph` unit.
12. `end`, not followed by a word character, and all whitespace after it, line
    feeds included: an `end` unit.
13. `_self`, `_blank`, `_parent`, or `_top`, not followed by a word character: a
    `link-target` unit.
14. A direction line (see below).
15. An edge id: one or more characters that are neither whitespace nor `"`, and
    then an `@` that is followed by a character other than `{` and `"`. The run
    ends at the last such `@` before the next whitespace or `"`. The characters
    before that `@` are an `edge-id` unit, and the `@` is an `@` unit. `A @-->B`
    has no edge id, because no character comes before its `@`, and no rule reads
    that `@`, so the input is rejected. [fixture:
    flowchart/lex-edge-id-at-start]
16. One or more ASCII digits: a `number` unit.
17. `#`, `:::`, `:`, `&`, `;`, `,`, or `*`: a unit named by its text. `:::` is
    tried before `:`.
18. An arrow (see [Arrows](#arrows)): an `arrow` unit, or an `opening-arrow`
    unit, which enters the link text context of its kind.
19. `(-`, which enters the ellipse context; `([`, `[[`, `>`, `[(`, or `(((`,
    which enter the label context; `[|`; `[/` or `[\`, which enter the slanted
    context; `^`. Each is a unit named by its text, tried in this order. Then
    `\|` (a backslash and a vertical bar): rejected; without this rule, rule 21
    would read the backslash.
20. `v`, not followed by a word character: a `v` unit.
21. An id run: one or more characters, as many as possible, each of which is an
    ASCII letter or digit, one of `!` `"` `#` `$` `%` `&` `'` `*` `+` `.`
    `` ` `` `?` `\` `_` `/`, or a `-` followed by a character other than `>`,
    `-`, and `.`. An `id-run` unit.
22. `-`: a `-` unit.
23. A Unicode letter (see [Unicode letters](#unicode-letters)): a `letter` unit
    of one character.
24. `|`, `(`, `[`, or `{`: a unit named by its text; enters the label context.
25. One or more line feeds: a `newline` unit.
26. One or more whitespace characters other than line feeds: a `space` unit.

Anything else is rejected, for example `=` on its own, `}`, `]`, `)`, `@` that
no edge id or data block takes, or a character outside the Unicode letters, such
as an emoji. Some consequences of the order:

- A keyword is a keyword wherever a unit starts, also inside what looks like an
  id: in `A-->1end`, the `1` is a number and `end` is the keyword, so the input
  is rejected. Inside an id run, a keyword is just characters: `A-->xend` has
  the vertex `xend`. [fixture: flowchart/lex-keyword-after-number] [fixture:
  flowchart/lex-keyword-inside-id-run]
- `"` starts a string only where a unit starts; inside an id run it is an id
  character: `A"x"-->B` has the vertex `A"x"`. An empty string `""` is an
  `empty-string` unit, which no rule of the grammar takes (see
  [Strings](#strings)), so `A ""` is rejected, while mermaid.js accepts it as
  the vertex `A`. [fixture: flowchart/lex-quote-in-id] [fixture:
  flowchart/lex-empty-string]
- `&` starts its own unit only where a unit starts: `A&B` is the one vertex
  `A&B`, while `A & B` is two vertices. [fixture: flowchart/lex-ampersand-in-id]
  [fixture: flowchart/gram-group-two-vertices]
- An `x` or `o` at the start of a unit, before `--`, is the head of an arrow: in
  `A-->x-->B` the lexer reads the two arrows `-->` and `x-->`, and the input is
  rejected. [fixture: flowchart/lex-arrow-head-x]
- `-` followed by `>` is not an arrow and not part of an id run: `A->B]` is the
  vertex `A-` with the shape `>B]` (see [Shapes](#shapes)). [fixture:
  flowchart/lex-minus-then-tag]
- `accTitle` and `accDescr` are keywords only with the `:` that rules 1 and 2
  read after them, past whitespace, line feeds included: `accTitle ; :` is the
  vertices `accTitle` and `:`, while `accTitle`, a line break, and `:` is an
  accessibility statement with an empty title and no vertex, and so for
  `accDescr`. [fixture: flowchart/lex-acc-title-semicolon-before-colon]
  [fixture: flowchart/lex-acc-title-line-feed-before-colon] [fixture:
  flowchart/lex-acc-descr-semicolon-before-colon] [fixture:
  flowchart/lex-acc-descr-line-feed-before-colon]
- `click`, `call`, and `href` are keywords only with whitespace after them
  (rules 9, 5, and 8), and a line feed is whitespace: `A-->click;B`,
  `A-->call;B`, and `A-->href;B` are links to the vertices `click`, `call`, and
  `href`, followed by the vertex `B`, while with a line break in place of the
  `;` the input is rejected. `click;A`, `call;A`, `href;A`, and `A;click;B` are
  vertices. [fixture: flowchart/lex-click-keyword-semicolon] [fixture:
  flowchart/lex-call-keyword-semicolon] [fixture:
  flowchart/lex-href-keyword-semicolon] [fixture:
  flowchart/lex-click-keyword-line-feed] [fixture:
  flowchart/lex-call-keyword-line-feed] [fixture:
  flowchart/lex-href-keyword-line-feed] [fixture:
  flowchart/lex-click-keyword-semicolon-vertex] [fixture:
  flowchart/lex-call-keyword-semicolon-statement] [fixture:
  flowchart/lex-href-keyword-semicolon-statement] [fixture:
  flowchart/lex-click-keyword-between-semicolons]
- The units that open a shape, such as `[/` and `(-`, have no whitespace inside,
  so a space after `[` or `(` changes the shape: `A[ /x/]` is a rectangle with
  the label `/x/` and `A[/x/]` a `lean-right` shape with the label `x`;
  `A( -x-)` is a rounded shape with the label `-x-` and `A(-x-)` an ellipse;
  `A(( -x))` is a circle with the label `-x`, while in `A((-x))` the `(-` after
  `(` starts an ellipse, and the input is rejected. An edge id (rule 15) ends at
  the next whitespace: `A[ x@ ]` has the label `x@` and `A-->| x@ |B` the link
  text `x@`, while `A[x@]` and `A-->|x@|B` read `A[x` and `A-->|x` as edge ids
  and are rejected. [fixture: flowchart/lex-square-label-space-slash] [fixture:
  flowchart/lex-lean-right-label] [fixture:
  flowchart/lex-round-label-space-dash] [fixture: flowchart/lex-ellipse-label]
  [fixture: flowchart/lex-circle-label-space-dash] [fixture:
  flowchart/lex-circle-dash-ellipse] [fixture:
  flowchart/lex-edge-id-space-label] [fixture: flowchart/lex-edge-id-in-label]
  [fixture: flowchart/lex-edge-id-space-pipe-label] [fixture:
  flowchart/lex-edge-id-in-pipe-label]

**The direction line.** From the current position: a run of characters without
line feeds, U+2028, or U+2029; then `direction`; then one or more whitespace
characters, line feeds included; then one of `TB`, `BT`, `RL`, `LR`, and `TD`;
and then every character up to the next line feed, which is not included. The
rule reads the characters before `direction` as a `direction-text` unit,
`direction` as a `direction` unit, the value as a `direction-value` unit, and
the characters after the value as another `direction-text` unit; a
`direction-text` unit that would be empty or all whitespace is left out.
mermaid.js does not read the `direction-text` units; in the tree they are the
`textBefore` and `textAfter` of the
[FlowchartDirectionStatement](../ast/flowchart.md#flowchartdirectionstatement).
The values are tried in the order given: if the line has `direction` followed by
`TB` anywhere, the value is `TB`; otherwise `BT` is tried, and so on. For a
value, the lexer takes the last `direction` of the run that it follows, and the
unit ends at the end of the line on which the value stands. Because rules 1 to
13 are tried first, a direction line starts at the first position of a line
where none of them applies, and it takes the rest of the line:

- `A-->B direction TB` is a direction line, and the vertices and the link are
  not read at all; `A[direction TB]` is one as well. [fixture:
  flowchart/lex-direction-line-swallows-edge] [fixture:
  flowchart/lex-direction-line-in-label] A `;` before `direction` changes
  nothing: in a subgraph, `A-->B; direction TB` is one direction line, which
  gives the subgraph the direction `TB` and leaves it without members, while
  with `direction TB` on a line of its own, A links to B and the subgraph has
  the members B and A. [fixture: flowchart/lex-direction-line-after-semicolon]
  [fixture: flowchart/lex-direction-line-own-line-after-link]
- `end direction TB` is the `end` keyword followed by a direction line, and
  `style A direction TB` is the `style` keyword followed by a direction line,
  which the grammar rejects. [fixture: flowchart/lex-direction-line-after-end]
  [fixture: flowchart/lex-direction-line-after-style]
- `A-->B %%{init: {}}%% direction TB` is a direction line, as in mermaid.js;
  `A-->B direction%%{init: {}}%%TB` is not, because the text is `directionTB`,
  and it is rejected, as in mermaid.js. [fixture:
  flowchart/lex-direction-line-directive-between] [fixture:
  flowchart/lex-direction-line-directive-glued]
- `direction`, a line break, and `TB` is a direction line: the whitespace may
  contain line feeds. [fixture: flowchart/lex-direction-line-value-next-line]
- Indentation alone decides some lines: `accTitle: t;direction TB` at the start
  of a line has the title `t;direction TB`, because the `accTitle` rule applies
  at its first position, while the same line after spaces or a tab is a
  direction line, because no rule before it applies at the first whitespace
  character, and it has no title. In a subgraph, `accDescr: d ; direction LR` at
  the start of a line is a description and gives the subgraph no direction, and
  indented it gives the subgraph the direction `LR`. [fixture:
  flowchart/lex-direction-line-acc-title-column-zero] [fixture:
  flowchart/lex-direction-line-acc-title-indented] [fixture:
  flowchart/lex-direction-line-acc-title-tab-indented] [fixture:
  flowchart/lex-direction-line-acc-descr-subgraph-column-zero] [fixture:
  flowchart/lex-direction-line-acc-descr-subgraph-indented]
- A `;` is not whitespace: `direction ; TB` is no direction line but the
  vertices `direction` and `TB`, and `A-->direction; TB` is a link to the vertex
  `direction` and the vertex `TB`, while `direction`, a line break, and `TB` is
  a direction line, which changes nothing outside a subgraph. [fixture:
  flowchart/lex-direction-line-semicolon-before-value] [fixture:
  flowchart/lex-direction-line-link-target-semicolon] [fixture:
  flowchart/lex-direction-line-top-level-next-line]
- The line goes on after the value: in a subgraph, `direction TB; A-->B` gives
  the subgraph the direction `TB` and reads no link, and in
  `direction TB %% vertical` the `%%`, which follows text on its line, is no
  comment but part of the text after the value, while the link on the next line
  is read. A string does not keep the rule out: `A["Set direction LR"]-->B` is a
  direction line, as `A[Set direction LR]-->B` is, and neither has vertices or
  edges. [fixture: flowchart/lex-direction-line-then-semicolon-statement]
  [fixture: flowchart/lex-direction-line-percent-after-value] [fixture:
  flowchart/lex-direction-line-in-string-label] [fixture:
  flowchart/lex-direction-line-in-label-with-link]

### Arrows

Every arrow, closed or opening, is read with zero or more whitespace before it
and zero or more whitespace after it; the whitespace on both sides, line feeds
included, is part of its unit. The arrow itself is one of these, tried in this
order:

1. a **closed dash arrow**: optionally `x`, `o`, or `<` (the head); then either
   three or more `-`, or two or more `-` followed by `x`, `o`, or `>`. All the
   `-` are taken: `---->` is one arrow. Examples: `-->`, `---`, `--x`, `<-->`,
   `o--o`. The head is taken also when an id follows it without a space:
   `A---orders` is the arrow `---o` to the vertex `rders`, and `A---xray` the
   arrow `---x` to `ray`, while `A --- orders` links to `orders`. [fixture:
   flowchart/lex-arrow-head-o-before-id] [fixture:
   flowchart/lex-arrow-head-x-before-id] [fixture:
   flowchart/lex-arrow-spaced-before-id-o]
2. an **opening dash arrow**: optionally a head, then `--`.
3. a **closed thick arrow**: optionally a head; then three or more `=`, or two
   or more `=` followed by `x`, `o`, or `>`.
4. an **opening thick arrow**: optionally a head, then `==`.
5. a **closed dotted arrow**: optionally a head; then optionally `-`; then one
   or more `.`; then `-`; then optionally `x`, `o`, or `>`. Examples: `-.->`,
   `-.-`, `.-`, `-..-`.
6. an **opening dotted arrow**: optionally a head, then `-.`.
7. an **invisible arrow**: three or more `~`.

A closed arrow is an `arrow` unit. An opening arrow is an `opening-arrow` unit
and enters the dash, thick, or dotted link text context. Because the whitespace
belongs to the arrow, `A` and `-->B` on two lines are one link, and so are
`A-->` and `B` on two lines. In `A-->B`, a line break, and `x-->C`, the second
line starts with the arrow `x-->`, so the link goes from `B` to `C` and there is
no vertex `x`. [fixture: flowchart/lex-arrow-line-break-before] [fixture:
flowchart/lex-arrow-line-break-after] [fixture:
flowchart/lex-arrow-line-break-head] [fixture:
flowchart/lex-arrow-line-break-comment] `<--` with two `-` is an opening arrow,
so `B <-- C` is rejected, as no closing arrow follows; mermaid.js rejects it
too, and [issue #6402](https://github.com/mermaid-js/mermaid/issues/6402), open
and approved as of 2026-10-01 and labelled both a bug and an enhancement, asks
for it to be read as an arrow from C to B. [fixture:
flowchart/gram-reverse-arrow-two-dashes]

### The label context

The label context reads the label of a vertex shape or of a pipe label
(`|...|`). At each position:

1. `"`: a string (see [Strings](#strings)).
2. Zero or more whitespace and three or more `~`: rejected.
3. `(-`, `([`, or `(((`: rejected. Without this rule, rule 5 would read their
   `(`.
4. `])`, `]]`, `)]`, `)))`, `|`, `)`, `]`, or `}`, tried in this order: a unit
   named by its text; leaves the context.
5. `(` or `{`: a unit named by its text; enters the label context. The grammar
   accepts this only right after the `(` or `{` that opens a circle or a hexagon
   (see [Shapes](#shapes)).
6. One or more characters other than `[`, `]`, `(`, `)`, `{`, `}`, `|`, and `"`:
   a `text-run` unit.

So a label ends at the first `]`, `)`, `}`, or `|` outside a string, and which
closing unit the lexer reads depends on the character after it: `A[x])` reads
`])`, which does not close a rectangle, and is rejected. `~~~` is text inside a
text run, but not at its start: `A[x ~~~]` is accepted, and `A[ ~~~x]` is
rejected. [fixture: flowchart/lex-label-closing-bracket-paren] [fixture:
flowchart/lex-label-closing-double-bracket] [fixture:
flowchart/lex-label-tilde-inside] [fixture: flowchart/lex-label-tilde-start] A
`(` in the label of a rectangle is rejected, as in `A[This is a () in text]`,
while a string may contain it:
`A["<span style='color:rgb(51,51,51);font-size:12px'>x</span>"]` is accepted.
[fixture: flowchart/spec-flow-text-aa363bda] [fixture:
flowchart/lex-label-string-with-parenthesis]

### The slanted context

The slanted context reads the label of the four slanted shapes. At each
position:

1. `"`: a string (see [Strings](#strings)).
2. Zero or more whitespace and three or more `~`: rejected.
3. One of `\`, `(`, `?`, `=`, `]`, `)`, followed by `]`: a `backslash-end` unit;
   leaves the context.
4. `/]`: a `slash-end` unit; leaves the context.
5. `/` or `\` not followed by `]`, or one or more characters other than `\`,
   `[`, `]`, `(`, `)`, `{`, `}`, and `/`: a `text-run` unit.

Rule 5 reads a `/` or `\` as a text run of its own, so a unit can start at a `?`
or `=`: `A[/a/?]` is a trapezoid with the label `a/`, while `A[/a?]` is
rejected, because the text run `a?` takes the `?`. `A[/a]]` and `A[/a)]` are
trapezoids with the label `a`. [fixture: flowchart/lex-slanted-question-end]
[fixture: flowchart/lex-slanted-question-in-run] [fixture:
flowchart/lex-slanted-double-bracket-end] [fixture:
flowchart/lex-slanted-paren-end] Rule 1 applies where a unit starts: `A[/ "x /]`
is a `lean-right` shape with the label `"x`, because the text run that starts at
the space takes the `"`, while `A[/"x/]` starts a string that is not closed, and
the input is rejected. [fixture: flowchart/lex-slanted-label-space-quote]
[fixture: flowchart/lex-slanted-label-quote]

### The ellipse context

The ellipse context reads the label of `(-...-)`. At each position:

1. `"`: a string (see [Strings](#strings)).
2. Zero or more whitespace and three or more `~`: rejected.
3. `-`, `/`, or `)`, followed by `)`: an `ellipse-end` unit; leaves the context.
4. One character other than `(`, `)`, `[`, `]`, `{`, and `}`: a `text-run` unit
   of that one character. The placeholder of an entity is one such unit (see
   [Entities](../common.md#entities)).

`A(-a/)` and `A(-a))` are ellipses with the label `a`, and `A(-a|b-)` has the
label `a|b`. [fixture: flowchart/lex-ellipse-slash-end] [fixture:
flowchart/lex-ellipse-paren-end] [fixture: flowchart/lex-ellipse-pipe]
`A(-#x;t-)` and `A(-t#x;-)` have the labels of the placeholder of `#x;` and `t`,
in their order. [fixture: flowchart/lex-ellipse-entity-start] [fixture:
flowchart/lex-ellipse-entity-end]

### The link text contexts

An opening arrow enters the link text context of its kind: dash, thick, or
dotted. At each position:

1. `"`: a string (see [Strings](#strings)).
2. A closed arrow of the same kind, with its whitespace (see [Arrows](#arrows)):
   an `arrow` unit; leaves the context.
3. One character other than the kind's character (`-` for dash, `=` for thick,
   `.` for dotted), or, in the dash context, a `-` not followed by another `-`:
   a `link-text-char` unit. The placeholder of an entity is one such unit (see
   [Entities](../common.md#entities)).

So `--` inside the text of a dash link is rejected unless it closes the link,
and so are `=` inside a thick link and `.` inside a dotted link. The closing
arrow is tried first at every position, so the whitespace before it and a head
letter right before it belong to the arrow: `A-- box-->B` has the link text `bo`
and the arrow `x-->`. [fixture: flowchart/lex-link-text-double-dash] [fixture:
flowchart/lex-link-text-equals] [fixture: flowchart/lex-link-text-dot] [fixture:
flowchart/lex-link-text-head-letter] An entity in a link text is one unit:
`A--#x;-->B`, `A==#x;==>B`, and `A-.#x;.->B` have the edge text of the
placeholder of `#x;`, and so do numeric entities and entities whose word has `o`
or `x`; in `A--#x;x-->B` the `x` after the entity is the head of the closing
arrow. A directive inside the entity cuts the token, as in
`A--#x%%{init: {}}%%y;-->B`, and `A--#x;--#y;-->B` is rejected, as `--` would be
without the entity. [fixture: flowchart/lex-link-text-entity-dash] [fixture:
flowchart/lex-link-text-entity-thick] [fixture:
flowchart/lex-link-text-entity-dotted] [fixture:
flowchart/lex-link-text-entity-between-words] [fixture:
flowchart/lex-link-text-entity-numeric] [fixture:
flowchart/lex-link-text-two-entities] [fixture:
flowchart/lex-link-text-entity-word-o] [fixture:
flowchart/lex-link-text-entity-word-x-o] [fixture:
flowchart/lex-link-text-entity-before-head-x] [fixture:
flowchart/lex-link-text-entity-before-head-o] [fixture:
flowchart/lex-link-text-entity-directive-inside] [fixture:
flowchart/lex-link-text-entity-then-double-dash]

### Strings

A string starts at a `"` in any context that reads strings: the statement
context, the label, slanted, ellipse, and link text contexts, the click context,
and the header context, each at the rule that says so. When the string ends, the
lexer is back in the context in which it started. The other contexts read a `"`
as a character of their text, or, in the data contexts, as a `data-quote` unit.
It is read in the string context, or in the markdown string context when a
backtick follows the `"`; these contexts may enter further string contexts, and
the string ends when the lexer leaves the context that its opening `"` entered.
The whole string, from the opening `"` to its closing `"`, is one unit. The runs
of characters that the string contexts read inside it are its **content**:

- no content: an `empty-string` unit. It can lie between any two units, also
  inside the value of an id, a label, or a style, where the tree has no place
  for a node of its own, so no rule of the grammar takes it, and an input with
  an empty string is rejected: `""` alone on a line, `""A`, `A[""x]`,
  `A["a"""]`, and `A[x]""`. mermaid.js reads no token for an empty string and
  accepts these as if it were not there; they are the known divergence
  [`tokenless-empty-forms`](../known-divergences.md#tokenless-empty-forms) (see
  [Known divergences](#known-divergences)). Both reject `A --""> B`, because
  inside the text of a link the `""` does not end the opening `--`; [fixture:
  flowchart/lex-empty-string-line] [fixture:
  flowchart/lex-empty-string-before-id] [fixture:
  flowchart/tokens-empty-string-in-label] [fixture:
  flowchart/lex-empty-string-after-string] [fixture:
  flowchart/lex-empty-string-after-shape] [fixture:
  flowchart/lex-empty-string-in-arrow]
- one run: a `string` unit, or a `markdown-string` unit when the run was read in
  the markdown string context. The text of the unit is the run;
- two or more runs: rejected.

The value of a string, in a label or as a
[StringLiteral](../ast.md#stringliteral), is its content: the
[text of the range](../ast.md#nodes) of its one run. Every delimiter of the
contexts is left out, however they nest, so the width of the outer delimiters
does not decide it. ``A[""`x`""]`` is a markdown string whose content is `x`:
the first `"` enters the string context, the next `"` and a backtick the
markdown string context, which reads `x`, and a backtick and `"`, and then the
last `"`, leave the two contexts. In `click A href "u"``""`, the `"` and the
backtick after `u` enter a markdown string context that reads nothing, so the
URL is `u`, read in the string context. In the string context, a backtick that
does not follow a `"` is content: ``A["a`b"]`` has the label `a`, a backtick,
and `b`, of kind `string`. ``A["""`x`"""]`` is an empty string, a markdown
string with the content `x`, and another empty string, and so it is rejected.
`A["``"x"]` is rejected too: the markdown string closes with no content, and the
`"` after `x` opens a string that is not closed. [fixture:
flowchart/gram-string-nested-markdown] [fixture:
flowchart/gram-string-nested-empty-markdown] [fixture:
flowchart/gram-string-backtick-inside] [fixture:
flowchart/gram-string-triple-quotes-markdown] [fixture:
flowchart/gram-string-markdown-empty-then-string]

In the string context:

1. `"` followed by a backtick: enters the markdown string context.
2. `"`: leaves the context.
3. One or more characters other than `"`: a run of content.

In the markdown string context:

1. One or more characters other than a backtick and `"`: a run of content.
2. A backtick followed by `"`: leaves the context.
3. `"` followed by a backtick: enters the markdown string context.
4. `"`: enters the string context.

A string may span lines, and a line feed in it is part of its text, with the
whitespace at the start of the next line: the label of `A["a`, a line break, and
`   b"]` is `a`, a line feed, three spaces, and `b`. [fixture:
flowchart/lex-string-multiline] [fixture: flowchart/lex-string-multiline-indent]
A string whose context is not left before the end of the text makes no unit, and
the input is rejected. [fixture: flowchart/lex-string-unclosed] [fixture:
flowchart/lex-markdown-string-unclosed]

### Data blocks

In the data context, entered by `@{`:

1. `"`: a `data-quote` unit; enters the data string context.
2. One or more characters other than `}`, `^`, and `"`: a `data-text` unit.
3. `}`: a `}` unit; leaves the context.

In the data string context, `"` is a `data-quote` unit and leaves the context,
and one or more other characters are a `data-text` unit. So a data block ends at
the first `}` outside a quoted string, and `^` is rejected outside a quoted
string. [fixture: flowchart/lex-data-brace-in-string] [fixture:
flowchart/lex-data-caret]

### Click and callbacks

The click context is entered by `click` and the whitespace after it:

1. `"`: a string (see [Strings](#strings)); when it ends, the lexer is back in
   the click context.
2. One whitespace character: leaves the context.
3. One or more characters other than whitespace: each `,` among them is a
   `click-comma` unit, and each run of the other characters is a `click-id`
   unit.

So the ids of a click statement are every character up to the next whitespace,
parted at each `,`, and the one whitespace character after them is read with
them. Rule 3 reads as many characters as it can, so rule 1 applies only at the
start of the context and right after a string: after a `,`, a `"` belongs to the
next id, and `click A"" href "x"` has the id `A""`, which names no vertex.
[fixture: flowchart/lex-click-id-with-quotes] `click A[x],B href "u"` has the
ids `A[x]` and `B`, and `click A,"x" href "u"` has the ids `A` and `"x"`, as in
mermaid.js. [fixture: flowchart/lex-click-id-comma] [fixture:
flowchart/lex-click-id-comma-quote] A `,` that the click context reads is a
`click-comma` unit, not a `,` unit: mermaid.js reads it as part of the click
ids, while a `,` of the statement context is a unit of its own, which the
grammar of a click statement does not accept. So `click , href "x"` and
`click , call cb()` are click statements whose ids are empty, while `,href "x"`
and `,call cb()` are rejected, and `,cb` alone is the vertex `,cb`. [fixture:
flowchart/gram-click-comma-only-href] [fixture:
flowchart/gram-comma-href-statement] [fixture:
flowchart/gram-click-comma-only-call] [fixture:
flowchart/gram-comma-call-statement] [fixture:
flowchart/lex-comma-starts-vertex-id] That character may be a line feed:
`click A`, a line break, and `cb` is the click statement `click A cb`. Two
spaces after the id are rejected, because the second one is a `space` unit where
the grammar expects the callback. So is a line feed followed by indentation:
`click A`, a line break, and `  cb` is rejected. [fixture:
flowchart/lex-click-line-feed] [fixture: flowchart/lex-click-two-spaces]
[fixture: flowchart/lex-click-line-feed-indented]

The grammar allows no string in a click statement, so a string before the ids is
rejected: `click "A" href "x"`, and the same with a markdown string that has
content. So is an empty string there (see [Strings](#strings)):
`click ""A href "x"`, the same with an empty markdown string `"``"` or with two
empty strings in place of `""`, `click ""A,B href "x"`, and `click ""A callback`
are rejected here, while mermaid.js accepts them with the id `A` first. Both
reject `click "" A href "x"`, because the space after the empty string leaves
the context before any id. An empty string after the id and its whitespace, as
in `click A ""href "x"`, is read in the statement context, and the input is
rejected in the same way. [fixture: flowchart/gram-click-empty-string-before-id]
[fixture: flowchart/gram-click-empty-markdown-string-before-id] [fixture:
flowchart/gram-click-two-empty-strings-before-id] [fixture:
flowchart/gram-click-empty-string-before-ids] [fixture:
flowchart/gram-click-empty-string-before-callback-id] [fixture:
flowchart/gram-click-string-id] [fixture:
flowchart/gram-click-markdown-string-id] [fixture:
flowchart/gram-click-empty-string-then-space] [fixture:
flowchart/gram-click-empty-string-after-id]

`click` is a reserved word. The grammar reads a `click` unit only as the first
unit of a click statement, which starts where a statement starts, and a `click`
unit anywhere else makes the input rejected. mermaid.js enters its click context
wherever its lexer reads `click` and whitespace, and accepts some inputs with
such a `click` elsewhere; they are the known divergence
[`click-reserved-word`](../known-divergences.md#click-reserved-word) (see
[Known divergences](#known-divergences)). A click statement therefore has one
`click` unit, at its start, and its click ids are those that the click context
of that unit reads: `click A click href "u"`, `click A click B href "u"`,
`click A click cb "tip"`, `click A, click B href "u"`,
`click A click , href "u"`, `click A click ""href "u"`,
`click A click B call cb()`, `click A cb click B`, and
`click A href "u" click _blank` are rejected, as in mermaid.js, and so are
`style A click fill:red`, `style A click ""fill:red`, and `A:click b-->C`, while
`click A,B href "u"` is accepted. [fixture:
flowchart/gram-click-second-click-before-href] [fixture:
flowchart/gram-click-second-click-id-before-href] [fixture:
flowchart/gram-click-second-click-before-callback] [fixture:
flowchart/gram-click-second-click-after-comma] [fixture:
flowchart/gram-click-second-click-comma] [fixture:
flowchart/gram-click-second-click-empty-string-then-id] [fixture:
flowchart/gram-click-second-click-call] [fixture:
flowchart/gram-click-mid-statement-click-id] [fixture:
flowchart/gram-click-mid-statement-link-target] [fixture:
flowchart/gram-style-click-id-before-style] [fixture:
flowchart/gram-style-click-empty-string-then-click-id] [fixture:
flowchart/gram-click-ids-after-id-colon] [fixture:
flowchart/gram-click-two-ids-one-click] The word `click` is a `click` unit only
where a unit starts and whitespace follows it (rule 9 of
[The statement context](#the-statement-context)): `A-click` and `vclick` are id
runs, and `A:click""b` is the id run `click""b` after `A` and `:`. [fixture:
flowchart/lex-click-inside-id-run-vertex] [fixture:
flowchart/lex-click-v-id-run] [fixture: flowchart/lex-click-no-whitespace-in-id]
When the text ends while the click context has read nothing since a `click` unit
entered it, the input is rejected, because mermaid.js reads an empty click id
there: `A-->B click` followed by a line break at the end of the text. [fixture:
flowchart/lex-click-at-end-of-text]

The callback name context is entered by `call` and the whitespace after it:

1. `(`, zero or more whitespace, and `)`: a `(` unit and a `)` unit; leaves the
   context.
2. `(`: a `(` unit; leaves the context and enters the callback arguments
   context.
3. One or more characters other than `(`: a `callback-name` unit.

In the callback arguments context, `)` is a `)` unit and leaves the context, and
one or more other characters are a `callback-arguments` unit. The name and the
arguments may contain any character, line feeds included, but a callback without
`(` reads the rest of the text as its name and is rejected: when the text ends
in the callback name context or in the callback arguments context, the input is
rejected, because mermaid.js reads an empty name or empty arguments there.
[fixture: flowchart/lex-callback-no-parenthesis] [fixture:
flowchart/lex-callback-arguments-end-of-text]

mermaid.js reads no token for the `call` unit, nor for the `(` and `)` units of
the callback contexts: of a callback, only the name and the arguments are tokens
of its grammar. The grammar here reads these units in a click statement, around
the name and the arguments (see [Click statements](#click-statements)). A `call`
unit followed directly by a `(` unit and a `)` unit, with only whitespace
between them, is an **empty call**. It holds neither a name nor arguments, and,
like an empty string, it can lie between any two units, also inside a value,
where the tree has no place for it; so no rule of the grammar takes it, and an
input with an empty call is rejected. mermaid.js reads no token for any of it
and accepts it, as if it were not there, in places such as these: `call ()`
alone on a line, `A call ()`, `call () B`, `A call ()-->B`, and `A-->call ()B`,
also with a line feed between `(` and `)`; `A,call ()`, as the vertex `A,`; and,
in a click statement, `click A call ()cb`, as `click A cb`, and
`click A call ()href "u"`. They are the known divergence
[`tokenless-empty-forms`](../known-divergences.md#tokenless-empty-forms). Both
reject `A-->call () B`, because mermaid.js reads the whitespace after the empty
call as a space before the target. [fixture: flowchart/gram-empty-call-line]
[fixture: flowchart/gram-empty-call-after-vertex] [fixture:
flowchart/gram-empty-call-before-vertex] [fixture:
flowchart/gram-empty-call-before-link] [fixture:
flowchart/gram-empty-call-after-arrow] [fixture:
flowchart/gram-empty-call-line-feed] [fixture:
flowchart/gram-empty-call-after-comma] [fixture:
flowchart/gram-click-empty-call-before-callback] [fixture:
flowchart/gram-click-empty-call-before-href] [fixture:
flowchart/gram-empty-call-after-arrow-space] `call` is a keyword only with
whitespace after it (rule 5 of [The statement context](#the-statement-context)):
`call()` is rejected. A callback name or arguments are accepted only in a click
statement, where they follow the click ids: `,call x` and `A,call (x)` are
rejected, and so is `click ,call ()`, whose click ids are `,call`. [fixture:
flowchart/gram-call-no-whitespace] [fixture:
flowchart/gram-call-name-outside-click] [fixture:
flowchart/gram-call-arguments-outside-click] [fixture:
flowchart/gram-click-comma-call-empty] In a click statement, the arguments may
also follow the name after a second `call`: `click A call cb()call (x)` calls
`cb` with the arguments `x`, as `click A call cb(x)` does. `click A call ()`
alone, `click A call () href "u"`, with the space after the ids,
`click A call cb(y)call (x)`, with two arguments, and
`click A call cb()call x()`, with two names, are rejected by both. [fixture:
flowchart/gram-click-empty-call-then-arguments] [fixture:
flowchart/gram-click-empty-call-only] [fixture:
flowchart/gram-click-empty-call-space-before-href] [fixture:
flowchart/gram-click-call-arguments-twice] [fixture:
flowchart/gram-click-call-name-twice]

### Accessibility values

In the title context and in the description context, a line feed leaves the
context without being read, and one or more other characters are a `title-text`
or `description-text` unit; so they read the rest of the line, which may be
empty. In the description block context, `}` is a `}` unit and leaves the
context, and one or more other characters are a `description-block-text` unit.
When the text ends before a `}`, the block has none: `accDescr { x` and
`accDescr {` at the end of the text are accepted, as in mermaid.js. [fixture:
flowchart/lex-acc-descr-block-unclosed] [fixture:
flowchart/lex-acc-descr-block-unclosed-empty] An `accDescr` unit and a `{` unit
followed directly by a `}` unit, with no `description-block-text` unit, are an
**empty description block**. It is a description block statement without text
(see
[Direction and accessibility statements](#direction-and-accessibility-statements)),
so, like every statement, it is accepted where a statement starts: `accDescr {}`
alone on a line, after a `;`, or with `{` and `}` on two lines, also with a
comment line between them, changes nothing. [fixture:
flowchart/db-acc-descr-empty-block-alone] [fixture:
flowchart/db-acc-descr-empty-block-spaces-alone] [fixture:
flowchart/db-acc-descr-empty-block-lines-alone] [fixture:
flowchart/db-acc-descr-block-comment-only-alone] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/db-acc-descr-empty-block-after-semicolon-keeps] [fixture:
flowchart/db-acc-descr-empty-block-lines-keeps] [fixture:
flowchart/db-acc-descr-block-comment-only-keeps] Anywhere else it lies inside a
statement, where the tree has no place for it, so no rule of the grammar takes
it, and the input is rejected: `A accDescr {}`, `A accDescr {}-->B`, and
`A accDescr {` and `}` on two lines. mermaid.js reads no token for an empty
description block and accepts these, as if it were not there; these are the
known divergence
[`tokenless-empty-forms`](../known-divergences.md#tokenless-empty-forms). Both
reject `A-->accDescr {} B`, because mermaid.js reads the space after the block
as a space before the target, and `A accDescr {x}`, because a block with text is
a statement of its own, which cannot start inside another. [fixture:
flowchart/gram-acc-descr-block-empty] [fixture:
flowchart/gram-empty-description-block-after-vertex] [fixture:
flowchart/gram-empty-description-block-before-link] [fixture:
flowchart/gram-empty-description-block-line-feed] [fixture:
flowchart/gram-empty-description-block-after-arrow-space] [fixture:
flowchart/gram-description-block-after-vertex] The rule reads the whitespace
after the `:` or `{`, line feeds included, as part of the `:` or `{` unit:
`accTitle:`, a line break, and `  foo` has the title `foo`. [fixture:
flowchart/lex-acc-title-next-line] So a statement on the next line becomes the
title: `accTitle:`, a line break, and `A-->B` has the title `A-->B` and no
vertices and no edges. [fixture: flowchart/lex-acc-title-next-line-statement]

### The header context

The first header keyword enters the header context:

1. Whitespace that contains a line feed, up to and including its last line feed:
   a `no-direction` unit; leaves the context.
2. Zero or more whitespace, then `LR`, `RL`, `TB`, `BT`, `TD`, `BR`, or `v`, not
   followed by a word character, or `<`, `>`, or `^`: a `header-direction` unit
   of the direction; leaves the context.
3. `"`: a string (see [Strings](#strings)); when it ends, the lexer is back in
   the header context.

Rule 1 comes first, so a direction on the next line is not a direction:
`flowchart`, a line break, and `LR` has no direction and the vertex `LR`.
`flowchart LR;A` is accepted, while `graph;A` is rejected. [fixture:
flowchart/header-direction-next-line] [fixture:
flowchart/header-semicolon-no-direction] The grammar allows no string in the
header: `flowchart"x" TD`, whose string has content, is rejected, and so is an
empty string (see [Strings](#strings)). `flowchart"" TD`, `flowchart""TD`,
`flowchart"""" TD`, `flowchart` followed by an empty markdown string `"``"` and
` TD`, `flowchart"" LR;A`, and `flowchart""` followed by a line break are
rejected here, while mermaid.js accepts them as if the empty strings were not
there, with the direction `TD`, `LR`, or none. Both reject `flowchart "" TD`,
because no rule of the header context reads a space that no direction or line
feed follows. [fixture: flowchart/header-empty-string-before-direction]
[fixture: flowchart/header-empty-string-no-space] [fixture:
flowchart/header-two-empty-strings] [fixture:
flowchart/header-empty-markdown-string] [fixture:
flowchart/header-empty-string-semicolon] [fixture:
flowchart/header-empty-string-no-direction] [fixture:
flowchart/header-space-before-empty-string] [fixture: flowchart/header-string]

### Unicode letters

A `letter` unit is one character from these ranges, the letters that
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L211-L272)
lists: U+00AA, U+00B5, U+00BA, U+00C0–U+00D6, U+00D8–U+00F6, U+00F8–U+02C1,
U+02C6–U+02D1, U+02E0–U+02E4, U+02EC, U+02EE, U+0370–U+0374, U+0376, U+0377,
U+037A–U+037D, U+0386, U+0388–U+038A, U+038C, U+038E–U+03A1, U+03A3–U+03F5,
U+03F7–U+0481, U+048A–U+0527, U+0531–U+0556, U+0559, U+0561–U+0587,
U+05D0–U+05EA, U+05F0–U+05F2, U+0620–U+064A, U+066E, U+066F, U+0671–U+06D3,
U+06D5, U+06E5, U+06E6, U+06EE, U+06EF, U+06FA–U+06FC, U+06FF, U+0710,
U+0712–U+072F, U+074D–U+07A5, U+07B1, U+07CA–U+07EA, U+07F4, U+07F5, U+07FA,
U+0800–U+0815, U+081A, U+0824, U+0828, U+0840–U+0858, U+08A0, U+08A2–U+08AC,
U+0904–U+0939, U+093D, U+0950, U+0958–U+0961, U+0971–U+0977, U+0979–U+097F,
U+0985–U+098C, U+098F, U+0990, U+0993–U+09A8, U+09AA–U+09B0, U+09B2,
U+09B6–U+09B9, U+09BD, U+09CE, U+09DC, U+09DD, U+09DF–U+09E1, U+09F0, U+09F1,
U+0A05–U+0A0A, U+0A0F, U+0A10, U+0A13–U+0A28, U+0A2A–U+0A30, U+0A32, U+0A33,
U+0A35, U+0A36, U+0A38, U+0A39, U+0A59–U+0A5C, U+0A5E, U+0A72–U+0A74,
U+0A85–U+0A8D, U+0A8F–U+0A91, U+0A93–U+0AA8, U+0AAA–U+0AB0, U+0AB2, U+0AB3,
U+0AB5–U+0AB9, U+0ABD, U+0AD0, U+0AE0, U+0AE1, U+0B05–U+0B0C, U+0B0F, U+0B10,
U+0B13–U+0B28, U+0B2A–U+0B30, U+0B32, U+0B33, U+0B35–U+0B39, U+0B3D, U+0B5C,
U+0B5D, U+0B5F–U+0B61, U+0B71, U+0B83, U+0B85–U+0B8A, U+0B8E–U+0B90,
U+0B92–U+0B95, U+0B99, U+0B9A, U+0B9C, U+0B9E, U+0B9F, U+0BA3, U+0BA4,
U+0BA8–U+0BAA, U+0BAE–U+0BB9, U+0BD0, U+0C05–U+0C0C, U+0C0E–U+0C10,
U+0C12–U+0C28, U+0C2A–U+0C33, U+0C35–U+0C39, U+0C3D, U+0C58, U+0C59, U+0C60,
U+0C61, U+0C85–U+0C8C, U+0C8E–U+0C90, U+0C92–U+0CA8, U+0CAA–U+0CB3,
U+0CB5–U+0CB9, U+0CBD, U+0CDE, U+0CE0, U+0CE1, U+0CF1, U+0CF2, U+0D05–U+0D0C,
U+0D0E–U+0D10, U+0D12–U+0D3A, U+0D3D, U+0D4E, U+0D60, U+0D61, U+0D7A–U+0D7F,
U+0D85–U+0D96, U+0D9A–U+0DB1, U+0DB3–U+0DBB, U+0DBD, U+0DC0–U+0DC6,
U+0E01–U+0E30, U+0E32, U+0E33, U+0E40–U+0E46, U+0E81, U+0E82, U+0E84, U+0E87,
U+0E88, U+0E8A, U+0E8D, U+0E94–U+0E97, U+0E99–U+0E9F, U+0EA1–U+0EA3, U+0EA5,
U+0EA7, U+0EAA, U+0EAB, U+0EAD–U+0EB0, U+0EB2, U+0EB3, U+0EBD, U+0EC0–U+0EC4,
U+0EC6, U+0EDC–U+0EDF, U+0F00, U+0F40–U+0F47, U+0F49–U+0F6C, U+0F88–U+0F8C,
U+1000–U+102A, U+103F, U+1050–U+1055, U+105A–U+105D, U+1061, U+1065, U+1066,
U+106E–U+1070, U+1075–U+1081, U+108E, U+10A0–U+10C5, U+10C7, U+10CD,
U+10D0–U+10FA, U+10FC–U+1248, U+124A–U+124D, U+1250–U+1256, U+1258,
U+125A–U+125D, U+1260–U+1288, U+128A–U+128D, U+1290–U+12B0, U+12B2–U+12B5,
U+12B8–U+12BE, U+12C0, U+12C2–U+12C5, U+12C8–U+12D6, U+12D8–U+1310,
U+1312–U+1315, U+1318–U+135A, U+1380–U+138F, U+13A0–U+13F4, U+1401–U+166C,
U+166F–U+167F, U+1681–U+169A, U+16A0–U+16EA, U+1700–U+170C, U+170E–U+1711,
U+1720–U+1731, U+1740–U+1751, U+1760–U+176C, U+176E–U+1770, U+1780–U+17B3,
U+17D7, U+17DC, U+1820–U+1877, U+1880–U+18A8, U+18AA, U+18B0–U+18F5,
U+1900–U+191C, U+1950–U+196D, U+1970–U+1974, U+1980–U+19AB, U+19C1–U+19C7,
U+1A00–U+1A16, U+1A20–U+1A54, U+1AA7, U+1B05–U+1B33, U+1B45–U+1B4B,
U+1B83–U+1BA0, U+1BAE, U+1BAF, U+1BBA–U+1BE5, U+1C00–U+1C23, U+1C4D–U+1C4F,
U+1C5A–U+1C7D, U+1CE9–U+1CEC, U+1CEE–U+1CF1, U+1CF5, U+1CF6, U+1D00–U+1DBF,
U+1E00–U+1F15, U+1F18–U+1F1D, U+1F20–U+1F45, U+1F48–U+1F4D, U+1F50–U+1F57,
U+1F59, U+1F5B, U+1F5D, U+1F5F–U+1F7D, U+1F80–U+1FB4, U+1FB6–U+1FBC, U+1FBE,
U+1FC2–U+1FC4, U+1FC6–U+1FCC, U+1FD0–U+1FD3, U+1FD6–U+1FDB, U+1FE0–U+1FEC,
U+1FF2–U+1FF4, U+1FF6–U+1FFC, U+2071, U+207F, U+2090–U+209C, U+2102, U+2107,
U+210A–U+2113, U+2115, U+2119–U+211D, U+2124, U+2126, U+2128, U+212A–U+212D,
U+212F–U+2139, U+213C–U+213F, U+2145–U+2149, U+214E, U+2183, U+2184,
U+2C00–U+2C2E, U+2C30–U+2C5E, U+2C60–U+2CE4, U+2CEB–U+2CEE, U+2CF2, U+2CF3,
U+2D00–U+2D25, U+2D27, U+2D2D, U+2D30–U+2D67, U+2D6F, U+2D80–U+2D96,
U+2DA0–U+2DA6, U+2DA8–U+2DAE, U+2DB0–U+2DB6, U+2DB8–U+2DBE, U+2DC0–U+2DC6,
U+2DC8–U+2DCE, U+2DD0–U+2DD6, U+2DD8–U+2DDE, U+2E2F, U+3005, U+3006,
U+3031–U+3035, U+303B, U+303C, U+3041–U+3096, U+309D–U+309F, U+30A1–U+30FA,
U+30FC–U+30FF, U+3105–U+312D, U+3131–U+318E, U+31A0–U+31BA, U+31F0–U+31FF,
U+3400–U+4DB5, U+4E00–U+9FCC, U+A000–U+A48C, U+A4D0–U+A4FD, U+A500–U+A60C,
U+A610–U+A61F, U+A62A, U+A62B, U+A640–U+A66E, U+A67F–U+A697, U+A6A0–U+A6E5,
U+A717–U+A71F, U+A722–U+A788, U+A78B–U+A78E, U+A790–U+A793, U+A7A0–U+A7AA,
U+A7F8–U+A801, U+A803–U+A805, U+A807–U+A80A, U+A80C–U+A822, U+A840–U+A873,
U+A882–U+A8B3, U+A8F2–U+A8F7, U+A8FB, U+A90A–U+A925, U+A930–U+A946,
U+A960–U+A97C, U+A984–U+A9B2, U+A9CF, U+AA00–U+AA28, U+AA40–U+AA42,
U+AA44–U+AA4B, U+AA60–U+AA76, U+AA7A, U+AA80–U+AAAF, U+AAB1, U+AAB5, U+AAB6,
U+AAB9–U+AABD, U+AAC0, U+AAC2, U+AADB–U+AADD, U+AAE0–U+AAEA, U+AAF2–U+AAF4,
U+AB01–U+AB06, U+AB09–U+AB0E, U+AB11–U+AB16, U+AB20–U+AB26, U+AB28–U+AB2E,
U+ABC0–U+ABE2, U+AC00–U+D7A3, U+D7B0–U+D7C6, U+D7CB–U+D7FB, U+F900–U+FA6D,
U+FA70–U+FAD9, U+FB00–U+FB06, U+FB13–U+FB17, U+FB1D, U+FB1F–U+FB28,
U+FB2A–U+FB36, U+FB38–U+FB3C, U+FB3E, U+FB40, U+FB41, U+FB43, U+FB44,
U+FB46–U+FBB1, U+FBD3–U+FD3D, U+FD50–U+FD8F, U+FD92–U+FDC7, U+FDF0–U+FDFB,
U+FE70–U+FE74, U+FE76–U+FEFC, U+FF21–U+FF3A, U+FF41–U+FF5A, U+FF66–U+FFBE,
U+FFC2–U+FFC7, U+FFCA–U+FFCF, U+FFD2–U+FFD7, U+FFDA–U+FFDC. A character outside
them that no other rule reads is rejected; `é` (U+00E9) is a letter, while `°`
(U+00B0) is not. [fixture: flowchart/lex-letter-in-id] [fixture:
flowchart/lex-non-letter]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `id-run`, stands for one unit with
that name, and text in double quotes stands for the unit named by that text,
such as `"style"` or `"["`. `end-of-text` stands for the end of the text; it is
not a unit, and several rules can see it. A unit that no rule takes makes the
input rejected, such as an `empty-string` unit (see [Strings](#strings)). Where
a repetition cannot be completed, it is not taken, and the rule goes on with
what follows it. The grammar is a restatement of the grammar in
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L302-L633)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in
[ast/flowchart.md](../ast/flowchart.md):

| Rule                                                                                                  | Node                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                                             | [`FlowchartDiagram`](../ast/flowchart.md#flowchartdiagram)                                                                                                                                                                         |
| `empty-statement`                                                                                     | [`FlowchartEmptyStatement`](../ast/flowchart.md#flowchartemptystatement)                                                                                                                                                           |
| `vertex-statement`                                                                                    | [`FlowchartVertexStatement`](../ast/flowchart.md#flowchartvertexstatement)                                                                                                                                                         |
| `vertex-group`                                                                                        | [`FlowchartVertexGroup`](../ast/flowchart.md#flowchartvertexgroup)                                                                                                                                                                 |
| `vertex`                                                                                              | [`FlowchartVertex`](../ast/flowchart.md#flowchartvertex)                                                                                                                                                                           |
| `shape`                                                                                               | [`FlowchartShape`](../ast/flowchart.md#flowchartshape); with `"[\|"`, also a [`FlowchartShapeProperty`](../ast/flowchart.md#flowchartshapeproperty)                                                                                |
| `label`, `link-text`, `subgraph-name`                                                                 | [`FlowchartLabel`](../ast/flowchart.md#flowchartlabel)                                                                                                                                                                             |
| `id`, `id-list-part`, `click-id`, `edge-id`, `callback-name`, `name`, and each `id-run` after `"[\|"` | [`Identifier`](../ast.md#identifier)                                                                                                                                                                                               |
| `string` in a click statement                                                                         | [`StringLiteral`](../ast.md#stringliteral)                                                                                                                                                                                         |
| `number` in a link style statement                                                                    | [`NumericLiteral`](../ast.md#numericliteral)                                                                                                                                                                                       |
| `style`, `callback-arguments`, `title-text`, `description-text`, and `description-block-text`         | [`FlowchartLiteral`](../ast/flowchart.md#flowchartliteral), or null for a `style` that is all whitespace (see [FlowchartStyleStatement](../ast/flowchart.md#flowchartstylestatement))                                              |
| `data`                                                                                                | [`FlowchartDataBlock`](../ast/flowchart.md#flowchartdatablock)                                                                                                                                                                     |
| `link`                                                                                                | [`FlowchartLink`](../ast/flowchart.md#flowchartlink), whose target is the vertex group after it                                                                                                                                    |
| `arrow`                                                                                               | [`FlowchartArrow`](../ast/flowchart.md#flowchartarrow)                                                                                                                                                                             |
| `opening-arrow`                                                                                       | [`FlowchartOpeningArrow`](../ast/flowchart.md#flowchartopeningarrow)                                                                                                                                                               |
| `subgraph-statement`                                                                                  | [`FlowchartSubgraphStatement`](../ast/flowchart.md#flowchartsubgraphstatement)                                                                                                                                                     |
| `style-statement`                                                                                     | [`FlowchartStyleStatement`](../ast/flowchart.md#flowchartstylestatement)                                                                                                                                                           |
| `class-def-statement`                                                                                 | [`FlowchartClassDefStatement`](../ast/flowchart.md#flowchartclassdefstatement)                                                                                                                                                     |
| `class-statement`                                                                                     | [`FlowchartClassStatement`](../ast/flowchart.md#flowchartclassstatement)                                                                                                                                                           |
| `link-style-statement`                                                                                | [`FlowchartLinkStyleStatement`](../ast/flowchart.md#flowchartlinkstylestatement), or with `"default"` a [`FlowchartDefaultLinkStyleStatement`](../ast/flowchart.md#flowchartdefaultlinkstylestatement)                             |
| `click-statement`                                                                                     | [`FlowchartClickCallbackStatement`](../ast/flowchart.md#flowchartclickcallbackstatement) for the first and third alternatives, and for the second a [`FlowchartClickUrlStatement`](../ast/flowchart.md#flowchartclickurlstatement) |
| `direction-statement`                                                                                 | [`FlowchartDirectionStatement`](../ast/flowchart.md#flowchartdirectionstatement)                                                                                                                                                   |
| `title-statement`                                                                                     | [`FlowchartAccTitleStatement`](../ast/flowchart.md#flowchartacctitlestatement)                                                                                                                                                     |
| `description-statement`                                                                               | [`FlowchartAccDescrStatement`](../ast/flowchart.md#flowchartaccdescrstatement)                                                                                                                                                     |
| `description-block-statement`                                                                         | [`FlowchartAccDescrBlockStatement`](../ast/flowchart.md#flowchartaccdescrblockstatement)                                                                                                                                           |

### Diagram and statements

```text
diagram                     = header line*
header                      = header-keyword ( no-direction | header-direction ( ";" | newline | space+ newline ) )
line                        = statement | empty-statement | newline | space
statement                   = vertex-statement separator
                            | style-statement separator
                            | class-def-statement separator
                            | class-statement separator
                            | link-style-statement separator
                            | click-statement separator
                            | subgraph-statement
                            | direction-statement
                            | title-statement
                            | description-statement
                            | description-block-statement
empty-statement             = ";"
separator                   = newline | ";" | end-of-text
direction-statement         = direction-text? "direction" direction-value direction-text?
title-statement             = "accTitle" ":" title-text?
description-statement       = "accDescr" ":" description-text?
description-block-statement = "accDescr" "{" description-block-text? ( "}" | end-of-text )
```

The diagram ends at the end of the text. A `space` after the header's direction
must be followed by a line feed: `flowchart TD ;` is rejected. [fixture:
flowchart/header-space-before-semicolon] A statement other than a subgraph, a
direction statement, and an accessibility statement must be followed by its
separator: a line feed, a `;`, or the end of the text. So
`class A c; %%{init: {}}%%` is accepted, while without the `;` the space before
the directive is a `space` unit after the class name, and the input is rejected;
In `class A c""` the quotes are characters of the id run, and the class is
`c""`, while in `class A c;""` they are an empty string after the separator, and
the input is rejected (see [Strings](#strings)). [fixture:
flowchart/gram-separator-before-directive] [fixture:
flowchart/gram-no-separator-before-directive] [fixture:
flowchart/gram-separator-before-empty-string] [fixture:
flowchart/lex-quotes-after-class-name] The separator belongs to no statement
(see [ast/flowchart.md](../ast/flowchart.md#tokens)). Every other `;` that the
grammar reads is an empty statement: a second `;` after a separator, a `;` on a
line of its own, and a `;` right after a statement that takes no separator.
`end` takes the whitespace after it, so in `end;` on its own line the `;` is an
empty statement. [fixture: flowchart/db-subgraph-member-empty-statement]
[fixture: flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/gram-empty-statement-line] A line feed that follows a separator is a
line of its own.

### Vertex statements

```text
vertex-statement = vertex-group ( data | space+ )? ( link vertex-group ( data | space+ )? )*
vertex-group     = vertex ( data? space+ "&" space+ vertex )*
vertex           = id shape? ( ":::" id )?
id               = id-piece+
id-piece         = number | id-run | letter | "v" | "-" | "default" | "," | ":" | "&" | "#" | "*"
data             = ( data-start ( data-text | data-quote )* "}" )+
```

A vertex statement is a chain of vertex groups joined by links. A vertex group
is one or more vertices joined by `&`, which needs whitespace on both sides. A
data block belongs to the vertex right before it, and so do the blocks written
right after it; each is a node of the tree.

- `A & B --> C & D` links each vertex of the first group to each vertex of the
  second. A group may stand alone: `A & B` is accepted. [fixture:
  flowchart/gram-group-links] [fixture: flowchart/gram-group-two-vertices]
- `A &B` is rejected, because `&` needs a `space` after it; `A&B` is one id (see
  [The statement context](#the-statement-context)). [fixture:
  flowchart/gram-group-no-space-after-ampersand] [fixture:
  flowchart/lex-ampersand-in-id]
- `A%%{init: {}}%%B-->C` has the vertex `AB`, as in mermaid.js: the lexer reads
  the id run `AB`, whose `Identifier` token the directive splits. [fixture:
  flowchart/gram-id-across-directive]
- Whitespace may not come between the id and its shape: `A [x]` is rejected.
  [fixture: flowchart/gram-space-before-shape]
- A data block may follow a vertex only without whitespace, and nothing but `&`,
  a link, or a separator may follow it: `A @{ shape: rect }` is rejected. Blocks
  written one after another are one data block: `A@{` and `}@{` on consecutive
  lines are read together. [fixture: flowchart/gram-data-space-before] [fixture:
  flowchart/gram-data-consecutive-blocks]
- `A:::c@{ shape: rect }` and `A[x]:::c-->B` are accepted: the class comes after
  the shape and before the data block. [fixture: flowchart/gram-class-then-data]
  [fixture: flowchart/gram-class-after-shape]

### Shapes

```text
shape = "[" label "]"
      | "(" label ")"
      | "(" "(" label ")" ")"
      | "(((" label ")))"
      | "{" label "}"
      | "{" "{" label "}" "}"
      | "([" label "])"
      | "[[" label "]]"
      | "[(" label ")]"
      | ">" label "]"
      | "(-" label ellipse-end
      | "[/" label ( backslash-end | slash-end )
      | "[\" label ( slash-end | backslash-end )
      | "[|" id-run ":" id-run "|" label "]"
```

Each alternative gives the shape its name and the vertex its type in the Db:

| Written                | Name               | Db type         |
| ---------------------- | ------------------ | --------------- |
| `[` … `]`              | `rectangle`        | `square`        |
| `(` … `)`              | `rounded`          | `round`         |
| `((` … `))`            | `circle`           | `circle`        |
| `(((` … `)))`          | `double-circle`    | `doublecircle`  |
| `{` … `}`              | `diamond`          | `diamond`       |
| `{{` … `}}`            | `hexagon`          | `hexagon`       |
| `([` … `])`            | `stadium`          | `stadium`       |
| `[[` … `]]`            | `framed-rectangle` | `subroutine`    |
| `[(` … `)]`            | `cylinder`         | `cylinder`      |
| `>` … `]`              | `odd`              | `odd`           |
| `(-` … `ellipse-end`   | `ellipse`          | `ellipse`       |
| `[/` … `backslash-end` | `trapezoid-bottom` | `trapezoid`     |
| `[/` … `slash-end`     | `lean-right`       | `lean_right`    |
| `[\` … `slash-end`     | `trapezoid-top`    | `inv_trapezoid` |
| `[\` … `backslash-end` | `lean-left`        | `lean_left`     |
| `[\|` … `\|` … `]`     | `rectangle`        | `rect`          |

The name is a word that mermaid.js accepts for the same shape in a data block,
`A@{ shape: … }`
([`shapesDefs`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/rendering-elements/shapes.ts#L107-L534)):
of those words, the one that names the shape itself and is not abbreviated, not
a word for a use, such as `process`, `decision`, or `subroutine`, and not an
abbreviation, such as `rect`, `diam`, or `fr-rect`. A bracketed shape is drawn
as the shape of its name in a data block, while its Db type is the word of the
table, which mermaid.js gives it
([`getTypeFromVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L973-L1001)):
`A[x]` and `A@{ shape: rectangle }` are drawn alike, with the Db types `square`
and `rectangle`. [fixture: flowchart/db-data-block-shape-names] The shape `(-` …
`-)` has no such word: mermaid.js defines no shape `ellipse`, so
`A@{ shape: ellipse }` is rejected by mermaid.js and accepted here (see
[`embedded-data-opaque`](../known-divergences.md#embedded-data-opaque)), and
drawing `A(-x-)` fails, which
[issue #5976](https://github.com/mermaid-js/mermaid/issues/5976) reports, open
and approved as a bug as of 2026-10-01; its acceptance and its Db are not
affected. [fixture: flowchart/div-data-block-shape-ellipse]

The two `(` of a circle and the two `{` of a hexagon are separate units, but no
whitespace or text may come between them: `A( (x) )` is rejected. A rectangle
written with `[|` carries one property, a name and a value, each a single id
run: `A[|borders:lt|text]` has the property `borders` with the value `lt`. Its
name is `rectangle`, as that of `[` … `]`: the property is kept in the Db's
`props` and changes nothing in how mermaid.js draws the rectangle, and only the
Db type, `rect`, differs. [fixture: flowchart/gram-circle-gap] [fixture:
flowchart/gram-rect-property]

### Labels

```text
label = ( string | markdown-string | text-run ) text-run*
```

A label is a string, a markdown string, or a text run, followed by any further
text runs. Its **kind** is `string` when it starts with a string, `markdown`
when it starts with a markdown string, and `text` otherwise. Its **value** is
the content of the string or markdown string that it starts with (see
[Strings](#strings)), followed by the [text of the range](../ast.md#nodes) of
the rest of the label; for a label that starts with a text run, it is the text
of its range. ``A["`x`" y]`` has the value `x y` of kind `markdown`. [fixture:
flowchart/gram-string-markdown-then-text] It keeps the whitespace inside it; it
has whitespace at its ends only inside the content of that string, or when the
label is all whitespace. It keeps what the author wrote, not the converted form,
which the Db uses; mermaid.js also trims it (see
[Db normalization](#db-normalization)).

- `A["x" y]` is accepted with the kind `string` and the value `x y`, while
  `A[ "x" ]` is rejected, because a text run cannot come before a string.
  [fixture: flowchart/gram-label-string-then-text] [fixture:
  flowchart/gram-label-text-then-string]
- A label cannot be empty: `A[]` and `A[""]` are rejected. `A[ ]` is accepted;
  its value is one space. [fixture: flowchart/gram-label-empty] [fixture:
  flowchart/gram-label-empty-string] [fixture: flowchart/gram-label-space]
- A directive inside a text run does not change the label: the value of
  `A[x %%{init: {}}%% y]` is `x`, two spaces, and `y`, as in mermaid.js, and the
  directive splits the label's `RawText` token. [fixture:
  flowchart/gram-label-across-directive]

### Links

```text
link      = ( edge-id "@" )? arrow ( "|" label "|" space? )?
          | ( edge-id "@" )? opening-arrow link-text arrow
link-text = ( string | markdown-string | link-text-char ) link-text-char*
```

A link has an arrow, and optionally an edge id before it and a label, either
between `|` after the arrow or between an opening arrow and the closing arrow.
The closing arrow of the second form is always of the same kind as the opening
arrow, because only such an arrow leaves the link text context. The label of a
link text is built like a label: it is a string, a markdown string, or a
character, followed by any further characters; its kind is `string`, `markdown`,
or `text`, and its value is defined as for a label.

- `A e1@-->B`, `A e1@ --> B`, and `A e1@-- t -->B` give the link the id `e1`;
  `A e1 @-->B` is rejected, because an edge id must end with its `@`. [fixture:
  flowchart/gram-edge-id] [fixture: flowchart/gram-edge-id-space-after]
  [fixture: flowchart/gram-edge-id-link-text] [fixture:
  flowchart/gram-edge-id-space-before-at]
- `A-->|t| B` is accepted: a `space` may follow the closing `|`. [fixture:
  flowchart/gram-pipe-label-space-after]
- `A-- "a"b -->B` has the link text `ab` of kind `string`, and `A-- "a" x -->B`
  the text `a x`; a markdown string may be continued in the same way.
  `A-- b"a" -->B` and `A-- "a""b" -->B` are rejected, because a string can only
  come first. [fixture: flowchart/gram-link-text-string-then-text] [fixture:
  flowchart/gram-link-text-string-space-text] [fixture:
  flowchart/gram-link-text-markdown-then-text] [fixture:
  flowchart/gram-link-text-text-then-string] [fixture:
  flowchart/gram-link-text-string-then-string]

### Subgraphs

```text
subgraph-statement = "subgraph" space subgraph-name ( "[" label "]" )? separator line* "end"
subgraph-name      = ( string | markdown-string | name-piece ) name-piece*
name-piece         = number | id-run | letter | space | "-" | "&" | ":" | "*" | "#" | "v" | "^"
                   | "style" | "linkStyle" | "classDef" | "class" | header-keyword | "subgraph" | "end"
```

The name after `subgraph` is required: mermaid.js accepts `subgraph` alone in
its grammar and then rejects it in its Db. [fixture:
flowchart/gram-subgraph-no-name] The name is a label of its own: it is a string,
a markdown string, or a name piece, followed by any further name pieces; its
kind is `string`, `markdown`, or `text` as for a label, and its value is defined
as for a label. The Db reads it without some of its characters (see
[Db normalization](#db-normalization)). `subgraph "a"b` has the name `ab`, which
is its id and its title; `subgraph "a" b` has the name `a b`; a markdown string
may be continued in the same way. `subgraph "a""b"` is rejected. In
`subgraph b"a"`, the `"` are characters of the id run `b"a"` (see
[The statement context](#the-statement-context)), which is the name. [fixture:
flowchart/gram-subgraph-name-string-then-text] [fixture:
flowchart/gram-subgraph-name-string-space-text] [fixture:
flowchart/gram-subgraph-name-markdown-then-text] [fixture:
flowchart/gram-subgraph-name-string-then-text-title] [fixture:
flowchart/gram-subgraph-name-string-then-string] [fixture:
flowchart/gram-subgraph-name-quote-inside] The `end` unit holds the whitespace
after it, so a statement may follow `end` on the same line: `end B` is accepted.
[fixture: flowchart/gram-subgraph-end-then-statement] The name keeps the
whitespace inside it: `subgraph a   b` has the title `a`, three spaces, and `b`.
[fixture: flowchart/db-subgraph-title-inner-spaces]

The name may contain keywords, which are then part of its text. `end` changes
what follows, because of how it is read: in a name it takes the line feed after
it: `subgraph a end`, a line break, `A`, a line break, and `end` is a subgraph
named `a end`, a line break, and `A`, with no members. [fixture:
flowchart/gram-subgraph-name-end] So `subgraph Front end`, `A`, and `end` has
the title `Front end`, a line feed, and `A`, and no members, while
`subgraph fe [Front end]` has the id `fe`, the title `Front end`, and the member
A. [fixture: flowchart/db-subgraph-name-end-word] [fixture:
flowchart/db-subgraph-id-with-title-spaces]

A name cannot contain a `click` unit, which only starts a click statement (see
[Click and callbacks](#click-and-callbacks)): `subgraph click me`,
`subgraph 1click me`, and `subgraph Handle click events` are rejected here,
while mermaid.js accepts them (see [Known divergences](#known-divergences)).
Inside an id run, `click` is no unit: `subgraph xclick me` has `xclick` in its
title. [fixture: flowchart/gram-subgraph-name-click-inside-id-run]

A `space` before `[` is part of the name, and nothing may follow the closing `]`
but the separator: `subgraph S [t]` is accepted, and `subgraph S[t]` followed by
a space and a line break is rejected. [fixture:
flowchart/gram-subgraph-title-space-before] [fixture:
flowchart/gram-subgraph-title-space-after]

### Style, class, and link style statements

```text
style-statement      = "style" space id space styles
class-def-statement  = "classDef" space id-list space styles
class-statement      = "class" space id-list space id
id-list              = ( id-list-part | "," )+
id-list-part         = ( number | id-run | letter | "v" | "-" | "default" | ":" | "&" | "#" | "*" )+
link-style-statement = "linkStyle" space ( "default" | number ( "," number )* ) space
                       ( "interpolate" space name ( space styles )? | styles )
styles               = style ( "," style )*
style                = ( number | id-run | ":" | "#" | space | "style" )+
name                 = ( number | letter | id-run | "v" | "-" | "," | ":" | "&" | "#" | "*" )+
```

A `;` that the line rule does not ignore ends the statement:
`style A fill:red;stroke:blue` gives A the style `fill:red` and makes the vertex
`stroke:blue`, and so does `classDef c fill:red;stroke:blue` for the class `c`,
while with `,` in place of the `;` both are styles. [fixture:
flowchart/gram-style-semicolon-ends-statement] [fixture:
flowchart/gram-classdef-semicolon-ends-statement] [fixture:
flowchart/db-style-comma-two-styles] So
`linkStyle 0 stroke:red;stroke-width:2px` makes the vertex `stroke-width:2px`,
and `style A fill:red; style B fill:blue` is two statements. [fixture:
flowchart/gram-linkstyle-semicolon-ends-statement] [fixture:
flowchart/gram-style-semicolon-two-statements]

In the tree, a style is the text of its range:
`style A fill:#f00 , stroke:#333 ` has the styles `fill:#f00` and `stroke:#333`,
and a style that is all whitespace is null (see
[ast/flowchart.md](../ast/flowchart.md#flowchartstylestatement)). The whitespace
written around a style matters to the Db, which reads it from the source (see
**Style statements** under
[Building the summary from the tree](#building-the-summary-from-the-tree)).

In a `classDef` statement, a `,` right after a `\` in the diagram text does not
separate two styles of the tree: the styles on its two sides, with the `,`, are
one style. `classDef c fill:x\,y` has the one style `fill:x\,y`, and so has
`classDef c fill:x\%%{init: {}}%%,y`, since the directive is not diagram text,
while `classDef c fill:x\ ,y` has two, and `style A fill:x\,y` and
`linkStyle 0 fill:x\,y` have the two styles `fill:x\` and `y`. The grammar still
reads that `,` and needs a style after it, so `classDef c fill:x\,` is rejected,
as in mermaid.js, while `classDef c fill:x\, ` is accepted. [fixture:
flowchart/gram-classdef-escaped-comma-one-style] [fixture:
flowchart/gram-classdef-escaped-comma-directive] [fixture:
flowchart/gram-style-escaped-comma-two-styles] [fixture:
flowchart/gram-classdef-escaped-comma-at-end] [fixture:
flowchart/gram-classdef-escaped-comma-then-space] [fixture:
flowchart/db-classdef-escape-space-before-comma] [fixture:
flowchart/gram-style-whitespace] A style may contain only those units:
`fill:rgb(0,0,0)` is rejected, because `(` starts a label, and `fill:default` is
rejected, because `default` is a keyword. [fixture:
flowchart/gram-style-parenthesis] [fixture: flowchart/gram-style-keyword]

An `id-list` accepts the same units as an `id`, and is read as a list: its
elements are the parts between its `,` units, so it has one element more than it
has `,` units, and a part that is empty is an empty element. `class ,A c` gives
A the class c, `class , c` is accepted, and `classDef a,,b` defines the classes
`a`, the empty name, and `b`, as in mermaid.js. [fixture:
flowchart/db-class-ids-empty-first] [fixture: flowchart/db-class-ids-only-comma]
[fixture: flowchart/db-classdef-names-empty] [fixture:
flowchart/db-classdef-names-trailing-comma] The id of a `style` statement, the
second id of a `class` statement, the class after `:::`, and the id of a vertex
are not lists: `style A,B fill:red` makes the vertex `A,B`. [fixture:
flowchart/gram-style-id-comma] [fixture: flowchart/gram-class-name-comma]
[fixture: flowchart/gram-vertex-class-comma] [fixture:
flowchart/gram-vertex-id-comma]

After `interpolate` and its name, a `space` must be followed by styles:
`linkStyle 0 interpolate basis` followed by a space is rejected. [fixture:
flowchart/gram-interpolate-trailing-space]

### Click statements

```text
click-statement = "click" click-ids ( callback ( space string )?
                                   | "href"? string ( space string )? ( space link-target )?
                                   | name ( space string )? )
click-ids       = ( click-id | click-comma )+
callback        = "call" callback-name "(" ( callback-arguments ")" | ")" ( "call" "(" callback-arguments ")" )? )
```

The first alternative calls the function named after `call`, with the arguments
in the parentheses after it, or in those after a second `call` when the first
ones are empty (see [Click and callbacks](#click-and-callbacks)); the second
links to the URL in the first string, with an optional tooltip and target; the
third calls the function named by a name. In each, a string after the call or
the link is the tooltip. The click ids are a list as an `id-list` is:
`click A,,B href "u" "tip"` gives the tooltip to A, to the empty id, and to B.
[fixture: flowchart/db-click-ids-empty-tooltip] [fixture:
flowchart/gram-click-call] [fixture: flowchart/gram-click-href] [fixture:
flowchart/gram-click-url-target]

The click ids are the runs of characters that the click context reads, whatever
they are, as in mermaid.js, also where `click` may have been meant as a vertex:
`click --- abc;` is a click statement on the id `---` with the callback name
`abc`, and its diagram has no vertices and no edges; `click --> B` is one on the
id `-->` with the callback name `B`; `click end href "u"` and
`click A[x] href "u"` are on the ids `end` and `A[x]`, so the vertex A gets no
link; `click & B` is one on the id `&` with the callback name `B`, and
`click B C` one on the id `B` with the callback name `C`. A click id that names
no vertex still gets its tooltip: `click --> cb "tip"` gives the tooltip `tip`
to the id `-->`. [fixture: flowchart/lex-click-id-arrow-callback] [fixture:
flowchart/lex-click-id-arrow] [fixture: flowchart/lex-click-id-keyword]
[fixture: flowchart/lex-click-id-shape] [fixture:
flowchart/gram-click-ampersand-id] [fixture:
flowchart/gram-click-id-then-callback-name] [fixture:
flowchart/db-click-tooltip-arrow-id]

### Direction and accessibility statements

A direction statement is a direction line, and so a statement of its own; so are
`accTitle:` and `accDescr:` with their text and `accDescr {` with its text and
`}`. None of them takes a separator: their text runs to the end of the line, or
to `}`. The text may be empty, also in a closed block: `accDescr {}` is a
description block statement without text. It starts where a statement starts, as
every statement does, so `accDescr {} A-->B` is a description block statement
and a vertex statement, and in `accDescr {};A` the `;` is an empty statement
before the vertex statement, while `A accDescr {}` is rejected (see
[Accessibility values](#accessibility-values)). [fixture:
flowchart/gram-acc-descr-block-empty] [fixture:
flowchart/gram-acc-descr-block-empty-then-statement] [fixture:
flowchart/gram-acc-descr-block-empty-then-semicolon] The title is the rest of
the line, `;` and `#` included: `accTitle: a;b #c` has the title `a;b #c`.
[fixture: flowchart/gram-acc-title-semicolon]

### Rejections outside the grammar

mermaid.js rejects some inputs that the grammar accepts, while it builds the Db:

- **Link style numbers.** Each number of a `linkStyle` statement must name an
  edge that exists when the statement is read: the source text of its token must
  be an integer written without leading zeros (the `value` of its NumericLiteral
  does not tell `00` from `0`), and less than the number of Db edges that the
  statements before it have made (see [Db normalization](#db-normalization)).
  `linkStyle 00 stroke:red` and a `linkStyle` before the link it names are
  rejected, with and without `interpolate`. mermaid.js rejects them with a
  `TypeError` in
  [`updateLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L391-L413)
  and
  [`updateLinkInterpolate()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L377-L386),
  which do not check the index they receive as text. [fixture:
  flowchart/linkstyle-index-out-of-range] [fixture:
  flowchart/gram-linkstyle-leading-zero] [fixture:
  flowchart/gram-linkstyle-before-link] [fixture:
  flowchart/gram-interpolate-out-of-range]
- **Too many edges.** An input with more Db edges than the site configuration's
  `maxEdges` (500 by default) is rejected. The limit is in the site
  configuration, not in the text, so this check is made like the Db values that
  depend on the configuration (see [Db normalization](#db-normalization) and
  [Configuration (reference)](../common.md#configuration-reference)): whoever
  holds the configuration compares the number of edges that the tree makes with
  it. The link style numbers above, by contrast, are checked from the tree
  alone. [fixture: flowchart/config-max-edges-exceeded]
- **Subgraph members.** A subgraph is rejected when, among its members in the
  order given under **Subgraphs** in
  [Building the summary from the tree](#building-the-summary-from-the-tree), a
  member `hasOwnProperty` is followed by any other member. Members that are
  empty or all whitespace do not count, and a statement that adds no member,
  such as a direction statement, changes nothing. The check is made for each
  subgraph on its own members, before the members that an earlier subgraph has
  are left out. So a subgraph with the lines `hasOwnProperty` and `A` is
  rejected, and so is one with `hasOwnProperty` twice, with `A-->hasOwnProperty`
  or `hasOwnProperty & A`, whose members are `hasOwnProperty` and then `A`, or
  with `hasOwnProperty` followed by a direction statement and `A`, by an empty
  statement, by an accessibility statement, or by a nested subgraph; an earlier
  subgraph that has `hasOwnProperty` does not change this. [fixture:
  flowchart/gram-subgraph-member-has-own-property-then-member] [fixture:
  flowchart/gram-subgraph-member-has-own-property-twice] [fixture:
  flowchart/gram-subgraph-member-has-own-property-link-target] [fixture:
  flowchart/gram-subgraph-member-has-own-property-group] [fixture:
  flowchart/gram-subgraph-member-has-own-property-direction-then-member]
  [fixture: flowchart/gram-subgraph-member-has-own-property-empty-statement]
  [fixture: flowchart/gram-subgraph-member-has-own-property-acc-title] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested] [fixture:
  flowchart/gram-subgraph-member-has-own-property-earlier-subgraph-then-member]
  A subgraph with `hasOwnProperty` alone, with `A` and then `hasOwnProperty`,
  with `hasOwnProperty-->A`, whose members are `A` and then `hasOwnProperty`, or
  with `hasOwnProperty` followed only by statements that add no member is
  accepted, and so is a nested subgraph with the member `hasOwnProperty`
  followed by `A` in the subgraph around it. [fixture:
  flowchart/db-subgraph-member-has-own-property-alone] [fixture:
  flowchart/db-subgraph-member-has-own-property-last] [fixture:
  flowchart/db-subgraph-member-has-own-property-link-source] [fixture:
  flowchart/db-subgraph-member-has-own-property-acc-title-last] [fixture:
  flowchart/db-subgraph-member-has-own-property-direction] [fixture:
  flowchart/db-subgraph-member-has-own-property-no-member-statements] [fixture:
  flowchart/db-subgraph-member-has-own-property-in-nested] The member
  `hasOwnProperty` may be any kind of member: the Db id of a nested subgraph,
  which is its name text trimmed, as with `subgraph hasOwnProperty`,
  `subgraph "hasOwnProperty"`, `subgraph hasOwnProperty [T]`, and
  `subgraph " hasOwnProperty "[T]`; an id with a directive inside,
  `hasOwn%%{init: {}}%%Property`; or the value of an accessibility statement,
  such as an `accDescr {` block whose text is `hasOwnProperty`. Each of them
  followed by `A` is rejected. A nested `subgraph x[hasOwnProperty]` has the id
  `x`, and a nested `subgraph hasOwnProperty ` with a space after the name has
  the id `subGraph0`, so followed by `A` they are accepted. [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-id] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-string-id] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-id-title] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested-string-space-id-title]
  [fixture: flowchart/gram-subgraph-member-has-own-property-directive-inside]
  [fixture: flowchart/gram-subgraph-member-has-own-property-acc-descr-block]
  [fixture: flowchart/db-subgraph-member-has-own-property-nested-title]
  [fixture: flowchart/db-subgraph-member-has-own-property-nested-name-space] The
  name is not reserved anywhere else. mermaid.js keeps the members it has seen
  as the keys of a plain object in
  [`addSubGraph()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L685-L707)
  and asks the object's `hasOwnProperty` function about each member; keeping the
  member `hasOwnProperty` replaces that function with `true`, so the next member
  makes it throw a `TypeError`.
- **Data blocks.** mermaid.js reads each data block as YAML and rejects some of
  them; this specification does not (see
  [Known divergences](#known-divergences)).

## Db normalization

The diagram title from the frontmatter and the Db values that depend on the
configuration do not come from the tree: whoever checks Db values derives them
with mermaid.js's own functions (see
[Configuration (reference)](../common.md#configuration-reference)).

### The summary

The fixtures record the Db of mermaid.js as a summary with these fields, made by
[`normalizeFlowchart()`](../../../tests/src/normalizers/flowchart.ts) of
`@mmd-toolkit/tests`:

| Field          | Content                                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `direction`    | The direction of the diagram.                                                                                                                                                                                                                                      |
| `title`        | The title from the frontmatter.                                                                                                                                                                                                                                    |
| `accTitle`     | The accessibility title, or the empty text.                                                                                                                                                                                                                        |
| `accDescr`     | The accessibility description, or the empty text.                                                                                                                                                                                                                  |
| `vertices`     | The vertices, in the order in which they were added: `id`, `labelType`, `styles`, `classes`, `text`, `type`, `props`, `link`, `linkTarget`, and the fields that only data blocks set: `icon`, `form`, `pos`, `img`, `constraint`, `assetWidth`, and `assetHeight`. |
| `edges`        | The edges, in the order in which they were added: `start`, `end`, `type`, `stroke`, `length`, `text`, `labelType`, `classes`, `isUserDefinedId`, `id`, `interpolate`, `style`, and `animate` and `animation`, which only data blocks set.                          |
| `edgeDefaults` | `interpolate` and `style` from `linkStyle default`, each null when not set.                                                                                                                                                                                        |
| `classDefs`    | The classes defined by `classDef`, in the order in which they were defined: `id` and `styles`.                                                                                                                                                                     |
| `subgraphs`    | The subgraphs, in the order in which they were added: `id`, `nodes`, `title`, `classes`, `labelType`, `dir`, and `metadata`, which only data blocks set.                                                                                                           |
| `tooltips`     | The tooltips, in the order in which their ids were first given one: `id` and `text`.                                                                                                                                                                               |

A field that the Db leaves unset is absent. The summary leaves out what only
rendering uses: the DOM ids of vertices, the text styles of classes, whether a
click has a callback that mermaid.js would call (it does so only under the site
configuration `securityLevel: loose`), and the names and arguments of callbacks.
The text of a direction line that mermaid.js does not read, `textBefore` and
`textAfter` of a
[FlowchartDirectionStatement](../ast/flowchart.md#flowchartdirectionstatement),
is not used either. It also leaves out the whitespace at the end of the Db text
of each style (see **Style statements** below), in the `styles` of vertices and
of classes, in the `style` of edges, and in the `style` of `edgeDefaults`:
mermaid.js does not read that whitespace, and formatting removes whitespace at
the end of lines, so a summary that kept it would change when a text is
formatted. A Db text of a style contains no line terminator, so what is dropped
is line whitespace. The whitespace at the start of a Db text is kept, because it
decides whether the style starts with `fill` (see below). A style that is all
whitespace gives the empty text: `style A fill:#f00, ` has the styles
`fill:#f00` and the empty text, while `style A fill:#f00,` is rejected, because
a style needs at least one unit. [fixture: flowchart/gram-style-whitespace]
[fixture: flowchart/db-style-whitespace-only-value] [fixture:
flowchart/db-style-trailing-comma] Texts are recorded as mermaid.js holds them
before HTML sanitization, and the `link` of a vertex is the URL as written,
trimmed, before the URL sanitization that mermaid.js applies unless
`securityLevel` is `loose`; how they are obtained is described in
[Sanitizers are disabled](../../../tests/docs/expected-results.md#sanitizers-are-disabled)
and
[Label text is recorded before HTML sanitization](../../../tests/docs/expected-results.md#label-text-is-recorded-before-html-sanitization).
With these choices the summary does not depend on `securityLevel`, as long as it
is one of `strict`, `loose`, `antiscript`, and `sandbox`.

The fields that only data blocks set are not derived from the tree (see
[Data blocks](#data-blocks-in-the-db)).

### Building the summary from the tree

The summary is built by going through the statements of the diagram in source
order, the statements inside a subgraph before the subgraph itself, and applying
the steps below; this is the order in which the grammar of mermaid.js calls its
Db. Each step reads a value in [converted form](../common.md#reading-a-source),
with whitespace after `}` read as in [Whitespace after `}`](#whitespace-after-);
a data block's value is not read. Labels contribute their converted value
trimmed of whitespace at both ends, which a value has only inside the delimiters
of the string it starts with or when the label is all whitespace, and their kind
as the label type. The other values are those of the
[shared leaf nodes](../ast.md#shared-leaf-nodes): the `name` of an Identifier
and the `value` of a StringLiteral, a NumericLiteral, or a FlowchartLiteral. A
null element of a list of ids or class names stands for the empty text; styles,
null or not, are read through their Db texts (see **Style statements**).
[fixture: flowchart/db-linkstyle-whitespace-only-style] [fixture:
flowchart/db-classdef-whitespace-only-style] A null `value` of an accessibility
statement is described under **Accessibility statements** below. The `arguments`
of a click statement are not used, because the summary leaves out the arguments
of callbacks.

**Direction.** The direction of the header: `<` gives `RL`, `^` gives `BT`, `>`
gives `LR`, `v` and `TD` give `TB`, and any other value, `BR` included, stays as
written. A header without a direction gives `TB`. A direction statement outside
a subgraph changes nothing, also when the header has no direction: `flowchart`,
`direction LR`, and `A-->B` has the direction `TB`. [fixture:
flowchart/db-direction-mapping] [fixture: flowchart/db-direction-br] [fixture:
flowchart/header-direction-next-line] [fixture:
flowchart/db-direction-statement-top-level] [fixture:
flowchart/db-direction-statement-top-level-no-header-direction]

**The vertex step,** with an id, and optionally a label, a shape, styles, and a
property:

1. If an edge with that id exists, nothing happens. [fixture:
   flowchart/db-vertex-edge-id]
2. If no vertex has that id, a vertex is added at the end, with the id, the
   label type `text`, and no styles and no classes.
3. With a label, the vertex takes its text and label type from the label, also
   when it has a text already: after `A[Start]-->B`, `C-->A[End]` gives A the
   label `End`. [fixture: flowchart/db-vertex-label-redefined] Without one, a
   vertex that has no text yet takes the id as its text, and one that has a text
   keeps it: after `A[Start]-->B`, both `A-->C` and `C-->A[Start]` leave A with
   the label `Start`. [fixture: flowchart/db-vertex-label-kept-without-label]
   [fixture: flowchart/db-vertex-label-redefined-same]
4. With a shape, the Db type of the shape (see [Shapes](#shapes)) becomes the
   vertex type; with styles, they are appended to the vertex's styles.
5. A vertex that has no `props` yet gets them: the property, or an empty set of
   properties without one. A vertex that has `props` gets the property added to
   them, or the value of the property with that name replaced. A property named
   `__proto__` is the exception: added later, it replaces the value of the
   vertex's property `__proto__`, which only the step that made the `props` can
   have given it, and otherwise changes nothing. So after `A`,
   `A[|__proto__:x|text]` leaves the `props` of `A` as the first step made them,
   empty, and so it is after a link, a style statement, or a data block; after
   `A[|b:y|t]`, they keep `b` with the value `y` and get no `__proto__`. A
   `class` statement adds no vertex and does not make them, so a later
   `A[|__proto__:x|text]` makes them with `__proto__`. mermaid.js adds a
   property to existing `props` in
   [`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L229-L233)
   by assigning it to a plain object, where `__proto__` does not become a key.
   [fixture: flowchart/db-props-merge] [fixture:
   flowchart/db-props-existing-vertex] [fixture: flowchart/db-props-replaced]
   [fixture: flowchart/db-props-constructor-existing-vertex] [fixture:
   flowchart/db-vertex-props-proto] [fixture: flowchart/db-props-proto-replaced]
   [fixture: flowchart/db-props-proto-then-other] [fixture:
   flowchart/db-props-proto-existing-vertex] [fixture:
   flowchart/db-props-proto-existing-link-vertex] [fixture:
   flowchart/db-props-proto-after-style] [fixture:
   flowchart/db-props-proto-after-data-block] [fixture:
   flowchart/db-props-proto-after-other-property] [fixture:
   flowchart/db-props-proto-after-class]

**The class step,** with ids and a class name: the class name is appended to the
classes of the vertex with each id, of the first edge with that id, and of the
last subgraph added with that id. [fixture:
flowchart/db-class-on-edge-and-subgraph] [fixture:
flowchart/db-class-vertex-id-with-comma]

**Vertex statements.** For each vertex group, from the first to the last: for
each of its vertices, the vertex step with its shape, then the class step with
the parts of the vertex's id between its `,` characters and its class, if it has
one (so `A,B:::c` gives no class to the vertex `A,B`), and then the data blocks
of the vertex before it in the group, if that vertex has any. After the last
vertex of a group come the data blocks of that vertex. After each link's target
group come the link's edges. So the data blocks of a vertex that is followed by
`&` apply after the next vertex: in `A@{ label: x } & A[y]`, the label of `A` is
`x`. [fixture: flowchart/db-data-after-next-vertex] The **members** of a vertex
statement are the ids of its last group, then those of the group before it, and
so on back to the first group.

**Links.** A link makes edges from the group before it to its target group: for
each vertex of the first group, in order, one edge to each vertex of the target
group, in order. Each edge has the start and end ids, the type, stroke, and
length of the arrows (see below; a length above 10 counts as 10), the label's
text and label type, or the empty text and `text` without a label, no classes,
and the default interpolate of `linkStyle default`, if one is set at that point.
[fixture: flowchart/db-arrow-length-cap] [fixture:
flowchart/db-default-interpolate-later-edge] Its id is:

- the edge id of the link, for the edge whose start is the id of the last vertex
  of the first group and whose end is the id of the first vertex of the second,
  unless an earlier edge has that id. The Db id is the edge id when it contains
  no `@`; when it does, its first `@` is removed and an `@` is added at its end.
  Such an edge has `isUserDefinedId` true; [fixture: flowchart/db-edge-id-group]
  [fixture: flowchart/db-edge-id-reused] [fixture: flowchart/db-edge-id-at-sign]
- otherwise `L_`, the start id, `_`, the end id, `_`, and a counter: 0 when no
  earlier edge has the same start and end, and one more than the number of such
  edges otherwise. The third `A-->B` gets `L_A_B_3`. [fixture:
  flowchart/db-edge-id-counter]

An input with more edges than the site configuration's `maxEdges` is rejected
(see [Rejections outside the grammar](#rejections-outside-the-grammar)).

**Arrows.** The link's FlowchartArrow gives a type, a stroke, and a length. The
type comes from its end marker: `arrow_point` for `arrow`, `arrow_cross` for
`cross`, `arrow_circle` for `circle`, and `arrow_open` for `none`. Its start
marker **matches** when it is the same marker as its end marker, other than
`none`; then the type is prefixed with `double_`. The stroke is `invisible` for
the line `invisible`, `dotted` for `dotted`, `normal` for `solid`, and, for
`thick`, `thick` when the start marker is `none` or matches and `normal`
otherwise. The length is, for a dotted line, the arrow's `length`; otherwise it
is the arrow's `length` less one, less one more when the end marker is `none`,
and plus one when the start marker is neither `none` nor matching. These are the
values that mermaid.js derives from the arrow without its last character and
without a matching start marker, which keeps a start marker that does not match:
`---` and `-->` have the length 1, `A x-->B` has the type `arrow_point`, the
stroke `normal`, and the length 2, `A x==>B` the stroke `normal`, `<-->` the
type `double_arrow_point`, `A x---B` the type `arrow_open` and the length 2,
`~~~` the stroke `invisible` and the length 1, and `-..->` the stroke `dotted`
and the length 2. [fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-link-text-head-letter] That a start marker that does not match is
drawn as no marker and makes the edge longer, as in `A o--> B`, is reported as a
defect in [issue #1665](https://github.com/mermaid-js/mermaid/issues/1665), open
and approved as a bug as of 2026-10-01, whose comments also report that a link
with text between two such arrows, as in `A o-- test1 --> B`, draws no
arrowheads, which is the type `INVALID` below. [fixture:
flowchart/db-arrow-mixed-markers]

For a link with an opening arrow, the FlowchartOpeningArrow gives a type from
its start marker (`arrow_point` for `arrow`, `arrow_cross` for `cross`,
`arrow_circle` for `circle`, and `arrow_open` for `none`) and a stroke from its
line (`thick` for `thick`, `dotted` for `dotted`, and `normal` for `solid`).
When this stroke differs from the stroke of the closing arrow above, the type
and the stroke are `INVALID` and there is no length. This happens only when the
closing arrow is thick and its start marker neither is `none` nor matches, since
the two arrows have the same line: in `A== t x==>B`, the closing arrow's start
marker `cross` makes its stroke `normal`. Otherwise, when the opening arrow's
type is `arrow_open`, the edge takes the type of the closing arrow; when it
equals the closing arrow's type, the type is prefixed with `double_`; and
otherwise the type and the stroke are `INVALID` and there is no length. The
stroke is the one they share, and the length is that of the closing arrow:
`A x-- t --xB` has the type `double_arrow_cross`, while `A x-- t -->B` and
`A x-- t x--x B` are `INVALID`, the second because `arrow_cross` is not
`double_arrow_cross`. [fixture: flowchart/db-arrow-double] [fixture:
flowchart/db-arrow-invalid] [fixture: flowchart/db-arrow-thick-head-invalid]
[fixture: flowchart/db-arrow-dash-head-length] [fixture:
flowchart/db-arrow-closing-double-in-link-text] [fixture:
flowchart/db-arrow-opening-cross-closing-cross] [fixture:
flowchart/db-arrow-opening-cross-closing-double-cross] [fixture:
flowchart/db-arrow-dotted-closing-start-marker]

**Subgraphs.** A subgraph statement adds a subgraph after the statements of its
body, so a nested subgraph comes before the one around it. Its members are, in
the order of the body: the members of its vertex statements, the Db id of each
nested subgraph, the value of each accessibility statement whose value is not
null, as it is (the line feeds of a description are not collapsed here), and `;`
for each empty statement; an empty statement outside a subgraph changes nothing.
[fixture: flowchart/gram-empty-statement-top-level] Members that are empty or
all whitespace are left out. Of the others, only the first of equal members is
kept, except that every member `__proto__` is kept, because mermaid.js keeps the
members it has seen as the keys of a plain object, where `__proto__` does not
become a key. Then a member that a subgraph added earlier already has is left
out, `__proto__` included. [fixture:
flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/db-subgraph-member-acc-title] [fixture:
flowchart/db-subgraph-member-acc-descr-block] [fixture:
flowchart/db-subgraph-member-empty-acc-descr-block] [fixture:
flowchart/db-subgraph-nested-members] [fixture:
flowchart/db-subgraph-member-proto-twice] [fixture:
flowchart/db-subgraph-member-proto-mixed] [fixture:
flowchart/db-subgraph-member-proto-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-has-own-property-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-constructor-to-string] A subgraph with the member
`hasOwnProperty` followed by another member is rejected (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). The subgraph
has:

- `id`: the name text, trimmed. The **name text** is the text that mermaid.js
  reads as the name: the name's value, then the text of the range from the end
  of the name to what follows it, the `[` of its title or its separator, in
  converted form. The `space` unit after `subgraph` is not part of it, also when
  a directive lies in it, as in `subgraph %%{init: {}}%% a`. [fixture:
  flowchart/db-subgraph-id-directive-in-statement-space] When the subgraph has
  no title and its name text contains whitespace, the id is `subGraph` followed
  by the number of subgraphs added before it, instead. `subgraph a ` with a
  space after the name has the name text `a` and a space, and gets `subGraph0`.
  [fixture: flowchart/db-subgraph-name-trailing-space] [fixture:
  flowchart/db-subgraph-counter] A string or a directive before the space
  changes nothing of this: `subgraph "S"` and `subgraph S%%{init: {}}%%`, each
  followed by a space at the end of its line, have the id `subGraph0`, and so
  does `subgraph S` followed by a space; a later `A-->S` then links to a new
  vertex `S`. In `subgraph "click me"`, `click` is inside a string and no
  `click` unit, so the name text is `click me`, the id `subGraph0`, and the
  title `click me`. [fixture: flowchart/db-subgraph-string-name-trailing-space]
  [fixture: flowchart/db-subgraph-name-directive-trailing-space] [fixture:
  flowchart/db-subgraph-name-trailing-space-then-vertex] [fixture:
  flowchart/gram-subgraph-string-click-title] [fixture:
  flowchart/db-subgraph-string-click-name-member]
- `title`: the value of the title in converted form, or the name text when there
  is no title, trimmed.
- `labelType`: the kind of the title; without a title, `markdown` when the
  name's kind is `markdown`, that is, when it starts with a markdown string, and
  `text` otherwise, also for a name that starts with a string. [fixture:
  flowchart/db-subgraph-quoted-name] [fixture:
  flowchart/db-subgraph-markdown-name] [fixture:
  flowchart/gram-subgraph-name-markdown-then-text]
- `dir`: the direction of the last direction statement in its body. Without one,
  the diagram's direction when `flowchart.inheritDir` in the
  [effective configuration](../common.md#the-effective-configuration) counts as
  true in the test of mermaid.js, that is, when it is anything but `false`,
  zero, NaN, the empty string, and null; otherwise none. `true`, `1`, `yes`, and
  the strings `false` and `0` make the subgraph take the diagram's direction,
  while `false`, `0`, and the empty string do not. A list or a mapping written
  in the frontmatter or a directive does not replace the default `false` (see
  [The effective configuration](../common.md#the-effective-configuration)), and
  a null is removed by the key filter, so `[]`, `{}`, and `null` do not either.
  [fixture: flowchart/config-inherit-dir-site] [fixture:
  flowchart/config-inherit-dir-frontmatter] [fixture:
  flowchart/config-inherit-dir-fm-one] [fixture:
  flowchart/config-inherit-dir-fm-yes] [fixture:
  flowchart/config-inherit-dir-fm-string-false] [fixture:
  flowchart/config-inherit-dir-fm-string-zero] [fixture:
  flowchart/config-inherit-dir-directive-string-false] [fixture:
  flowchart/config-inherit-dir-fm-false] [fixture:
  flowchart/config-inherit-dir-fm-zero] [fixture:
  flowchart/config-inherit-dir-fm-empty-string] [fixture:
  flowchart/config-inherit-dir-fm-list] [fixture:
  flowchart/config-inherit-dir-fm-mapping] [fixture:
  flowchart/config-inherit-dir-fm-null]
- `classes`: none, until the class step adds some.

**Style statements.** The **Db text** of a style is the
[text of the range](../ast.md#nodes) from the end of the `,` before it to the
start of the `,` after it; the first style starts at the end of the `space` unit
that the rule of the statement reads before `styles`, and the last one ends at
the separator of the statement. It is the style with the whitespace written
around it, which no node holds, and a style that is null has one too, all
whitespace. `style` applies the vertex step with the id, not split at commas,
and the Db texts of its styles, so it adds a vertex that no statement has made
yet: `style C fill:red` after `A-->B` adds C with the style `fill:red`.
[fixture: flowchart/db-style-unknown-vertex] A `style` statement before the
other statements of a vertex gives it the style, as `style A fill:red` before
`A-->B` does, and the vertex step does not look at subgraphs, so
`style S fill:red` after `subgraph S` adds a vertex `S` beside the subgraph.
[fixture: flowchart/db-style-before-vertex] [fixture:
flowchart/db-style-subgraph-id] `classDef` reads each `\,` in the Db texts of
its styles as `,`; for each class name, a class is added at the end if none has
that name, and the styles are appended to it. `classDef c fill:a\ ,stroke:b` has
the two styles `fill:a\` and `stroke:b`, and `classDef c fill:a\,  stroke:b` the
one style `fill:a,`, two spaces, and `stroke:b` (see
[Style, class, and link style statements](#style-class-and-link-style-statements)).
`class` applies the class step with its ids and class name. [fixture:
flowchart/db-class-def-escaped-comma] [fixture:
flowchart/db-classdef-escape-space-before-comma] [fixture:
flowchart/db-classdef-escape-space-after-comma]

**Link style statements.** A `linkStyle` statement first sets the interpolate of
each numbered edge, when it has `interpolate`, and then, when it has styles,
gives each numbered edge the Db texts of its styles; when none of them starts
with `fill`, `fill:none` is added once to the styles, which all the numbered
edges share. The check looks at the Db texts, so a style written after
whitespace does not start with `fill`: `linkStyle 0 stroke:#f00 , fill:red` gets
`fill:none`. The summary then drops the whitespace at the end of each Db text,
as for every style. [fixture: flowchart/db-linkstyle-shared-fill] [fixture:
flowchart/db-linkstyle-leading-space-fill] A statement with `interpolate` and no
styles changes no style: an edge keeps the styles an earlier statement gave it,
and no `fill:none` is added. [fixture:
flowchart/db-linkstyle-interpolate-keeps-style] [fixture:
flowchart/db-linkstyle-interpolate-only] `linkStyle default` sets the default
interpolate, which edges added later take, and, when it has styles, the `style`
of `edgeDefaults`, which is the Db texts of its styles: no `fill:none` is added,
and no edge gets them. Without styles, it leaves that `style` as it is, null
when no statement has set it. [fixture:
flowchart/db-default-linkstyle-interpolate-keeps-style] [fixture:
flowchart/db-default-interpolate-later-edge] [fixture:
flowchart/db-linkstyle-default-no-fill]

**Click statements.** A click with a callback applies the class step with the
click's ids and the class `clickable`. A click with a URL gives each vertex
whose id is one of the click's ids the URL, trimmed and not sanitized, as `link`
(none when it is empty) and the target as `linkTarget`, and then applies the
same class step. A tooltip is recorded for each id, whether or not a vertex has
it, with the `value` of its StringLiteral as its text, not trimmed; a later
tooltip for the same id replaces the text and keeps the position. [fixture:
flowchart/db-click-on-edge] [fixture: flowchart/db-tooltip-unknown-id] [fixture:
flowchart/db-tooltip-replaced] [fixture: flowchart/db-tooltip-untrimmed]

**Accessibility statements.** `accTitle:` sets the title to its value.
`accDescr:` and `accDescr {` set the description to their value, with each line
feed, together with the whitespace that follows it, line feeds included,
replaced by one line feed. mermaid.js trims these texts, which changes nothing,
because a value has no whitespace at its ends. A later statement replaces the
value that an earlier one set, whichever of the two forms each has:
`accTitle: first` followed by `accTitle: second` gives the title `second`, and
so for `accDescr:`; `accDescr { y }` alone gives the description `y`,
`accDescr: x` followed by `accDescr { y }` gives `y`, and `accDescr { first }`
followed by `accDescr: second` gives `second`. A statement inside a subgraph
sets the same description as one outside it, so `accDescr: inner` in a subgraph
followed by `accDescr: outer` after its `end` gives `outer`, and so for
`accTitle:`. [fixture: flowchart/db-acc-title-alone] [fixture:
flowchart/db-acc-descr-line-alone] [fixture: flowchart/db-acc-descr-lines]
[fixture: flowchart/db-acc-descr-collapse-whitespace] [fixture:
flowchart/db-acc-repeated] [fixture: flowchart/db-acc-descr-block-alone]
[fixture: flowchart/db-acc-descr-block-replaces] [fixture:
flowchart/db-acc-descr-line-replaces-block] [fixture:
flowchart/db-acc-descr-outer-replaces-subgraph] [fixture:
flowchart/db-acc-title-replaces] [fixture: flowchart/db-acc-descr-replaces]
[fixture: flowchart/db-acc-title-outer-replaces-subgraph] An `accDescr {` block
that is not closed sets the empty description, whatever its text, because
mermaid.js reads its text and then, at the end of the text, an empty text as a
second block: `accDescr: d` followed by `accDescr { x` at the end of the text
gives the empty description, and the title stays as it was. [fixture:
flowchart/lex-acc-descr-block-unclosed] [fixture:
flowchart/db-acc-descr-unclosed-replaces] [fixture:
flowchart/db-acc-descr-unclosed-empty-replaces] [fixture:
flowchart/db-acc-descr-unclosed-keeps-title] Otherwise, a statement whose value
is null sets the empty text, while a closed description block without text
changes nothing: `accDescr: x` followed by `accDescr:` at the end of the text
gives the empty description, and so does `accDescr { x }` followed by it, while
`accDescr: x` followed by `accDescr {  }` keeps `x`, as `accDescr { x }`
followed by `accDescr {}` does. [fixture: flowchart/db-acc-title-empty-replaces]
[fixture: flowchart/db-acc-descr-empty-replaces] [fixture:
flowchart/db-acc-descr-block-then-empty-line] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/db-acc-descr-empty-block-after-block]

### Data blocks in the Db

The values that a data block sets come from `dataBlockEffects` of
`@mmd-toolkit/tests`, one entry per vertex with data blocks: the blocks written
one after another count as one entry. The entries are in source order (see
[`dataBlockEffects`](../../../tests/docs/embedded-data.md#datablockeffects)):
the entries of
`A@{ label: a } & B@{ label: b } --> C@{ label: c } & D@{ label: d }` are those
of `A`, `B`, `C`, and `D`, in this order. [fixture:
flowchart/db-data-block-entries-source-order] At the position given above, the
next entry is applied: its fields are set on the subgraph added last with the
vertex's id, if there is one; otherwise on the first edge with that id, if there
is one; otherwise on the vertex with that id, which the vertex step has already
added. [fixture: flowchart/gram-data-consecutive-blocks]

## Known divergences

These divergences of [known-divergences.md](../known-divergences.md) apply to
flowchart, and show in it as follows.

- **[`directive-as-token-boundary`](../known-divergences.md#directive-as-token-boundary).**
  The lexer reads the text as mermaid.js does, without its directives (see
  [Directives inside units](#directives-inside-units)), so, in the lexer and the
  grammar, a directive makes a difference only by lying inside a unit that is
  not `RawText` or `Identifier`, which makes the input rejected here while
  mermaid.js accepts it. Examples: the arrows in `A--%%{init: {}}%%>B`,
  `A-%%{init: {}}%%-->B`, and `A-%%{init: {}}%%.->B`; the keywords in
  `click A hr%%{init: {}}%%ef "u"`,
  `linkStyle 0 interpo%%{init: {}}%%late basis`, and
  `A-->B dir%%{init: {}}%%ection TB`; the `:::` in `A::%%{init: {}}%%:c`; a
  string and a markdown string. [fixture: flowchart/lex-directive-inside-arrow]
  [fixture: flowchart/div-directive-in-arrow-length] [fixture:
  flowchart/div-directive-in-arrow-dotted] [fixture:
  flowchart/div-directive-in-keyword-href] [fixture:
  flowchart/div-directive-in-keyword-interpolate] [fixture:
  flowchart/div-direction-line-directive-in-word] [fixture:
  flowchart/div-directive-in-style-separator] [fixture:
  common/directive-in-string] [fixture:
  flowchart/div-directive-in-markdown-string]
- **[`embedded-data-opaque`](../known-divergences.md#embedded-data-opaque).**
  The content of a data block is not read. mermaid.js reads it as YAML and
  rejects content that is not valid YAML and content that names an unknown
  shape; here they are accepted. [fixture: flowchart/div-data-invalid-yaml]
  [fixture: flowchart/div-data-unknown-shape]
- **[`html-tag-in-frontmatter`](../known-divergences.md#html-tag-in-frontmatter).**
  In mermaid.js, an HTML tag that starts in the frontmatter can change how a `"`
  of the diagram is read; here it cannot. [fixture:
  flowchart/html-tag-starts-in-frontmatter]
- **[`click-reserved-word`](../known-divergences.md#click-reserved-word).** A
  `click` unit that does not start a click statement makes the input rejected
  here (see [Click and callbacks](#click-and-callbacks)), while mermaid.js
  accepts these, for example: a `click` inside a statement, whose click context
  reads a string, as in `click A href "u" click "tip"`, or only empty strings,
  as in `click A click "" href "u"`; a `click` before a statement, as in
  `click "" click A href "x"` and `click "" A-->B`, and after one, as in
  `A-->B click ""`; a `click` inside an id, as in `A:click "" b-->C`, and inside
  a style, as in `style A fill:red click "" x`; and a `click` in a subgraph
  name, with click ids after it, as in `subgraph click me`,
  `subgraph 1click me`, `subgraph Handle click events`, and
  `subgraph click a,b`, or without, as in `subgraph click "" y`. [fixture:
  flowchart/gram-click-mid-statement-tooltip] [fixture:
  flowchart/gram-click-bare-click-before-href] [fixture:
  flowchart/gram-click-bare-before-click-statement] [fixture:
  flowchart/gram-click-bare-before-vertex-statement] [fixture:
  flowchart/gram-click-bare-after-vertex] [fixture:
  flowchart/db-vertex-id-bare-click] [fixture:
  flowchart/db-style-bare-click-inside-style] [fixture:
  flowchart/gram-subgraph-name-click] [fixture:
  flowchart/gram-subgraph-name-click-after-number] [fixture:
  flowchart/db-subgraph-name-click-word] [fixture:
  flowchart/gram-subgraph-name-click-comma] [fixture:
  flowchart/gram-subgraph-name-bare-click]
- **[`tokenless-empty-forms`](../known-divergences.md#tokenless-empty-forms).**
  An empty string, an empty call, and an empty description block that does not
  start a statement make the input rejected here, because the tree has no place
  for them where they lie (see [Strings](#strings),
  [Click and callbacks](#click-and-callbacks), and
  [Accessibility values](#accessibility-values)), while mermaid.js reads no
  token for them and accepts many such inputs, for example: an empty string on a
  line of its own, as in `""`, inside a label, as in `A[""x]`, before the ids of
  a click statement, as in `click ""A href "x"`, and after the header keyword,
  as in `flowchart"" TD`; an empty call inside a statement, as in
  `A call ()-->B`, and in a click statement, as in `click A call ()cb`; and an
  empty description block inside a statement, as in `A accDescr {}-->B`.
  [fixture: flowchart/lex-empty-string-line] [fixture:
  flowchart/tokens-empty-string-in-label] [fixture:
  flowchart/gram-click-empty-string-before-id] [fixture:
  flowchart/header-empty-string-before-direction] [fixture:
  flowchart/gram-empty-call-before-link] [fixture:
  flowchart/gram-click-empty-call-before-callback] [fixture:
  flowchart/gram-empty-description-block-before-link]
