# Known divergences

Japanese version: [known-divergences.ja.md](./known-divergences.ja.md)

This specification follows mermaid.js in every accept or reject decision and
every Db value, except for the inputs defined in this document. Each group of
such inputs has a divergence identifier, and the fixtures affected by it are
marked with that identifier. Only the accept or reject decision and the Db are
compared: when both reject an input, it is not a divergence and its fixture is
not marked, even when they reject it at different stages.
`flow%%{init: {}}%%chart LR` followed by a line `A-->` is rejected by the
flowchart grammar in mermaid.js, and here because the directive lies inside the
header keyword, a `Keyword` unit. [fixture:
common/directive-splits-header-keyword]

Each diagram document lists, in its Known divergences section, the divergences
that apply to it and how they show in that diagram type.

| Identifier                                                    | Diagram types       | Inputs                                                          |
| ------------------------------------------------------------- | ------------------- | --------------------------------------------------------------- |
| [`directive-as-token-boundary`](#directive-as-token-boundary) | all                 | A directive inside a unit that is not `RawText` or `Identifier` |
| [`html-tag-in-frontmatter`](#html-tag-in-frontmatter)         | all                 | An HTML tag that starts in the frontmatter                      |
| [`embedded-data-opaque`](#embedded-data-opaque)               | all                 | Embedded data that mermaid.js rejects                           |
| [`click-reserved-word`](#click-reserved-word)                 | flowchart           | The word `click` where no click statement starts                |
| [`tokenless-empty-forms`](#tokenless-empty-forms)             | flowchart, sequence | An empty form that mermaid.js reads no token for                |
| [`comment-takes-character`](#comment-takes-character)         | sequence            | A character or a number right before `%%`                       |

## `directive-as-token-boundary`

mermaid.js removes each directive from the text and joins the text before and
after it. This specification reads the text in the same way (see
[A directive is a token boundary](./common.md#a-directive-is-a-token-boundary)),
with one difference: a unit that is not `RawText` or `Identifier`, such as a
keyword, an arrow, or a string, cannot have a directive inside it, and the input
is rejected, while mermaid.js accepts it whenever it accepts the joined text.
The difference goes one way only: this specification never accepts an input that
mermaid.js rejects, and it gives every input that both accept the same Db.

- `A["a %%{init: {}}%% b"]` is a node with the label `a  b` in mermaid.js. Here
  the directive lies inside the string, a `String` unit, and the input is
  rejected. [fixture: common/directive-in-string]
- `flow%%{init: {}}%%chart LR` followed by a line `A-->B` is a flowchart in
  mermaid.js. Here detection also sees `flowchart`, but the directive lies
  inside the header keyword, a `Keyword` unit, and the input is rejected.
  [fixture: common/directive-in-header-keyword]

Each diagram document lists the units of its own that this concerns; for
flowchart, see [Known divergences](./diagrams/flowchart.md#known-divergences).

mermaid.js does not document or test directives inside tokens. Its own tests
place every directive on a line of its own, possibly spanning several lines. Of
the 37 occurrences of `%%{` in the 287 `*.spec.ts` and `*.spec.js` files of the
pinned version, 34 are in test inputs, and each of them is the first thing on
its line of the input, after any indentation. The other 3 are in code comments
of
[`diagrams/agentflow/parser/agentflow-comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow-comments.spec.ts).
The test inputs are in
[`utils.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.spec.ts),
[`mermaidAPI.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.spec.ts),
[`diagram-api/comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.spec.ts),
[`config.appearance.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.appearance.spec.ts),
[`rendering-util/layout-algorithms/dagre/index.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.spec.js),
[`diagrams/sequence/sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js),
[`diagrams/radar/radar.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/radar.spec.ts),
and
[`docs/.vitepress/theme/exampleConfig.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/.vitepress/theme/exampleConfig.spec.ts).
The flowchart parser tests contain no directive at all. The behavior inside
tokens is a side effect of implementing Step 4 as a textual replacement over the
whole text.

This specification departs from it on purpose in one way: a unit that is not
`RawText` or `Identifier`, such as a keyword, an arrow, or a string, stands for
its text as a whole and is never split, so a directive inside it makes the input
rejected. Every other rule reads the text without its directives, as mermaid.js
does.

## `html-tag-in-frontmatter`

mermaid.js looks for HTML tags in
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
over the whole source, before it removes the frontmatter. A tag that starts in
the frontmatter can therefore reach a `>` in the text and change how a `"` in
the text is read. This specification looks for tags only in the text after the
frontmatter (see [HTML attribute quotes](./common.md#html-attribute-quotes)):
the lexer starts reading after the frontmatter, and what the frontmatter
contains does not change how the text is read. The difference goes both ways,
and it can change acceptance or the Db. A tag that starts and ends inside the
frontmatter makes no difference: the lexer does not read the frontmatter body,
and a value derived from it, such as the title, is the one that mermaid.js
derives (see
[Frontmatter configuration](./common.md#frontmatter-configuration)). [fixture:
flowchart/frontmatter-title-html-attribute]

mermaid.js accepts and this specification rejects:

- `title: <a` in the frontmatter starts a tag in mermaid.js whose attribute part
  reaches the `>` in `A[b="c">d]`, so the label is `b='c'>d`. Here the `"`
  stays, and the flowchart grammar rejects the label. [fixture:
  flowchart/html-tag-starts-in-frontmatter]

mermaid.js rejects and this specification accepts:

- With `title: <a z="` in the frontmatter, the tag in mermaid.js reaches the `>`
  in `A[<b x="y">t]`, and its quoted value runs from `z="` in the frontmatter to
  the `"` after `x=`. The `"` after `y` stays, and the flowchart grammar rejects
  the label. Here `<b x="y">` is a tag of its own, and the label is
  `<b x='y'>t`. [fixture: flowchart/html-tag-starts-in-frontmatter-value]

Both accept, with a different Db:

- With `title: <a` in the frontmatter, `accTitle: b="c">d` gives the accessible
  title `b='c'>d` in mermaid.js and `b="c">d` here. [fixture:
  flowchart/html-tag-starts-in-frontmatter-acc-title]

## `embedded-data-opaque`

Three kinds of embedded data are kept as written, and neither parsed nor
checked: the frontmatter body, the arguments of directives, and the `@{ ... }`
data blocks in the text of some diagrams, such as the shape data of a flowchart
node. mermaid.js parses the frontmatter body and the data blocks as YAML and the
arguments of some directives as JSON, derives configuration and diagram data
from them, and rejects the input when that fails or when the result has a form
it does not know (see
[Configuration (reference)](./common.md#configuration-reference)). Parsing YAML
and JSON and checking what they contain is not needed to build the tree, and
leaving it out keeps implementations free of both.

This specification therefore accepts every input that mermaid.js rejects only
because of what embedded data contains. For the frontmatter body and directive
arguments, these are:

- a YAML syntax error in the frontmatter body, also one that mermaid.js makes
  when it rewrites `="..."` in a tag to `='...'`, as in `title: '<a b="c">'`;
  [fixture: common/frontmatter-title-single-quoted-tag] [fixture:
  common/frontmatter-yaml-error] [fixture: flowchart/frontmatter-invalid-yaml]
  [fixture: common/frontmatter-duplicate-key] [fixture:
  common/frontmatter-two-documents]
- a `displayMode` together with a frontmatter `config`, or a `gantt` in it, that
  is a string, a number, or true; [fixture:
  common/frontmatter-display-mode-primitive-config] [fixture:
  common/config-display-mode-gantt-primitive]
- a wrap directive together with an init configuration that is a string, a
  number, or true; [fixture: common/directive-primitive-init-wrap] [fixture:
  common/directive-primitive-init-two-wrap-substrings]
- a number or boolean under a key that contains `themeCSS`, `fontFamily`, or
  `altFontFamily`, and a string `themeVariables` with a character that
  mermaid.js does not allow there; [fixture: common/config-css-key-not-string]
  [fixture: common/config-theme-variables-string-rejected]
- a theme variable that mermaid.js cannot parse as a colour; [fixture:
  common/config-theme-colour-rejected]
- a failure of the second detection that mermaid.js runs when there is an init
  directive. [fixture: common/config-init-detection-rejects]

For the data blocks, mermaid.js rejects, for example, `A@{ shape: [ }` with a
`YAMLException` and `A@{ shape: nonsense }` because no such shape exists, and it
accepts `A@{ label: 12 }` with the number 12 as the label. Where a data block
starts and ends is part of each diagram's syntax; the flowchart document defines
it, and these three cases become fixtures in its Known divergences.

The difference goes one way only: no input is known that mermaid.js accepts and
this specification rejects because of what embedded data contains. mermaid.js
gives no Db for these inputs, so their fixtures record only the rejection; this
specification defines their tree like that of any other input.

## `click-reserved-word`

In flowchart, `click` is a reserved word, which only starts a click statement.
The word `click` where a unit starts, with the whitespace after it, is a `click`
unit, which enters the click context (see
[Click and callbacks](./diagrams/flowchart.md#click-and-callbacks)). This
specification accepts a `click` unit only as the first unit of a click
statement, and rejects an input with a `click` unit anywhere else. The lexer of
mermaid.js enters its click context at every `click` followed by whitespace, in
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L112-L114),
without checking that a click statement can start there. It reads what follows
as click ids, or reads nothing when only strings and whitespace follow, and its
grammar accepts the result wherever it takes those click ids or nothing: inside
a statement, between statements, inside an id or a style, and in a subgraph
name. The difference goes one way only: mermaid.js accepts and this
specification rejects. The flowchart document lists the forms in its
[Known divergences](./diagrams/flowchart.md#known-divergences).

A click statement itself is read as mermaid.js reads it, also where `click` may
have been meant as a vertex. Its click ids are the runs of characters that the
click context reads, whatever they are (see
[Click statements](./diagrams/flowchart.md#click-statements)): `click --- abc;`
is a click statement on the id `---` with the callback name `abc`, and its
diagram has no vertices and no edges, while `click & B` and `click B C` are
click statements with the callback names `B` and `C`. [fixture:
flowchart/lex-click-id-arrow-callback] [fixture:
flowchart/gram-click-ampersand-id] [fixture:
flowchart/gram-click-id-then-callback-name]

The maintainers of mermaid.js treat `click` as reserved. As of 2026-10-01:
[issue #4182](https://github.com/mermaid-js/mermaid/issues/4182), "`click`
cannot be used for node IDs", was closed with the answer that `click` is a
reserved word. [issue #7023](https://github.com/mermaid-js/mermaid/issues/7023),
"node named click is not rendered in flowgraph", is about `click --- abc;`,
which mermaid.js reads as a click statement and draws as an empty diagram, as
this specification reads it too. The issue is open and approved as a bug; the
first reply of a maintainer there says that the input should throw a syntax
error, and how mermaid.js will change is not decided.

The **reference input** of such an input is the input without its comment
regions, without its empty forms (see
[`tokenless-empty-forms`](#tokenless-empty-forms)), and without, for each
`click` unit that does not start a click statement, the word `click`, the
whitespace after it, and the one whitespace character with which the lexer
leaves the click context that it entered, if there is one. mermaid.js gives the
reference input the same Db as the input where three conditions hold: mermaid.js
accepts the reference input; the lexer of this specification reads the reference
input as the units of the input other than the removed ones, except the click
ids and `click-comma` units that the click contexts of those `click` units read,
whose text it may read as other units that start and end where each of them
does; and the text of each of those click ids lies within the range of one leaf
node of the tree of the reference input. `A:click "" b-->C` becomes `A:b-->C`,
with the vertex `A:b` and its edge to C in both, and `subgraph click me`
followed by an empty line becomes `subgraph me`, with the id `me` in both.
[fixture: flowchart/db-vertex-id-bare-click] [fixture:
flowchart/db-subgraph-id-click-blank-line] Otherwise the removal joins what lies
on both sides, or puts the text of a click id where the statement context reads
it otherwise, and mermaid.js may read the reference input otherwise. Some joins
give the same Db: `subgraph click me`, a line break, and `A` becomes
`subgraph meA`, with the id `meA` in both, because mermaid.js joins the click id
and the next line in the same way. Others do not: in `subgraph click m;e`, the
`;` of the click id becomes a separator in the reference input `subgraph m;e`,
which has the id `m` instead of `m;e`, and in `subgraph click a,b` the `,`
becomes a `,` unit, which a name does not take, so mermaid.js rejects
`subgraph a,b`. [fixture: flowchart/gram-subgraph-name-click] [fixture:
flowchart/gram-subgraph-name-click-semicolon-in-id] [fixture:
flowchart/gram-subgraph-name-click-comma]

## `tokenless-empty-forms`

Forms that are written but hold nothing are rejected where the tree has no place
for them. In flowchart there are three: an **empty string**, `""` or an empty
markdown string; an **empty call**, `call` and the whitespace after it, followed
by parentheses with only whitespace between them; and an **empty description
block**, `accDescr {}`, that does not start a statement. In sequence, whose
grammar has no strings and no `call`, there is the empty description block only
(see below). The lexer of mermaid.js reads no token for any of them. In
flowchart, it passes over the quotes of an empty string, in
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87),
over the `call` and the parentheses of an empty call, in
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79),
and over the `accDescr {` and the `}` of an empty description block, in
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37).
Its grammar therefore never sees them, and mermaid.js reads an input with one of
them as if the form were not there. So it accepts them in many places: between
statements, inside a statement, next to other text in a label, a style, or a
subgraph name, before the ids of a click statement, and right after the header
keyword. It rejects an input where what is left around the form is not accepted:
where the form is all of a value, as in the examples below, and where it lies
inside what its lexer reads as one token, such as an arrow or a number, as in
`A --""> B` and `linkStyle 0""0 stroke:red`. [fixture:
flowchart/lex-empty-string-in-arrow] [fixture:
flowchart/gram-linkstyle-number-empty-string] Each of these forms can lie
between any two units, inside the value of a leaf node, such as an id, a label,
or a style, as well as between the fields of a node, and the tree has no place
there for a node of its own. This specification therefore reads each of them as
units that no rule of its grammar takes, and rejects the input (see
[Strings](./diagrams/flowchart.md#strings),
[Click and callbacks](./diagrams/flowchart.md#click-and-callbacks), and
[Accessibility values](./diagrams/flowchart.md#accessibility-values)). That
mermaid.js reads no token for a text is not by itself a reason to reject it:
where the tree has a place for such a text, it is a node, and the input is
accepted. The text before `direction` and after its value on a direction line,
which mermaid.js discards, is a
[FlowchartIgnoredText](./ast/flowchart.md#flowchartignoredtext), and an empty
description block where a statement starts is a description block statement
without text, which changes nothing; both are accepted by both. [fixture:
flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value] [fixture:
flowchart/gram-acc-descr-block-empty] Text that only looks like one of these
forms is none of them and stays accepted: in `A""-->B` the quotes are characters
of the vertex `A""`, `accTitle: ""` has the title `""`, `A[" "]` has a string of
one space, and `A["call ()"]` has the label `call ()`. [fixture:
flowchart/lex-empty-quotes-in-id] [fixture: flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text] The difference goes one way only:
mermaid.js accepts and this specification rejects. The flowchart document lists
the forms in its [Known divergences](./diagrams/flowchart.md#known-divergences).
In sequence, whose grammar has no strings and no `call`, the one such form is
the empty description block, which mermaid.js reads no token for in the same
way, in
[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77):
`A->>accDescr {}B: x` and `note left of accDescr {} A: x` are accepted by
mermaid.js and rejected here, while `accDescr {} A->>B: x` is a description
block statement followed by a message (see
[sequence.md](./diagrams/sequence.md#known-divergences)). [fixture:
sequence/gram-empty-description-block-after-arrow] [fixture:
sequence/gram-empty-description-block-after-placement] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] Where an author writes one
of these forms to mean something empty, mermaid.js rejects it too: `A[""]`,
`A("")`, `A-->|""|B`, `A -- "" --> B`, `click A href ""`, `subgraph ""`, and
`click A call ()` are rejected by both. [fixture:
flowchart/gram-label-empty-string] [fixture:
flowchart/gram-shape-round-empty-string] [fixture:
flowchart/gram-link-text-empty-string] [fixture:
flowchart/gram-link-text-dash-empty-string] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-subgraph-name-empty-string-only] [fixture:
flowchart/gram-click-empty-call-only] mermaid.js accepts them only where they
leave nothing, next to other text. None of the inputs collected from the tests,
the documentation, and the demos of mermaid.js contains one of them.

The **reference input** of such an input is the input without its comment
regions and without its empty forms: each empty string, each empty call from its
`call` to its `)`, and each empty description block that does not start a
statement from its `accDescr` to its `}`. Whether a block starts a statement is
decided without the empty strings and empty calls before it: in `""accDescr {}`
followed by a line break and `A`, the block starts a statement once the empty
string is removed, so it stays in the reference input. [fixture:
flowchart/lex-empty-string-before-empty-description-block] Where the lexer of
this specification reads the reference input as the units of the input other
than those of the empty forms, and mermaid.js accepts the reference input,
mermaid.js gives it the same Db as the input: `A[""x]` becomes `A[x]`, and
`click A call ()cb` becomes `click A cb`. [fixture:
flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] Otherwise the removal joins
what lies on both sides of a form into other units, and mermaid.js may read the
reference input otherwise. In `style A "" fill:red`, the spaces before and after
the empty string become one `space` unit, so the style of the reference input is
`fill:red` instead of a space and `fill:red`. In `A:""::c`, `:` and `::` become
`:::`, so the reference input has the vertex `A` with the class `c` instead of
the vertex `A:::c`. `flowchart""TD` becomes `flowchartTD`, which mermaid.js
rejects. [fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

## `comment-takes-character`

In sequence, a diagram comment starts at its `%%`, and the character before the
`%%` belongs to what the lexer reads there. The lexer of mermaid.js has two
rules that differ from this
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)).
In its statement state, before its rules for numbers and ids, it tries a rule
that reads a character other than `}` followed by `%%` and the rest of the line
as one comment; and it reads a number only where a space or a line feed follows
it. Where a rule would start its match at the character right before `%%`,
mermaid.js therefore loses that character with the rest of the line, and a
number right before `%%` is no number for it. This specification writes the
rules of the syntax directly instead of the order of those rules: a comment
starts at its mark, and a number may be followed by `%%` (see
[The statement context](./diagrams/sequence.md#the-statement-context)). Whether
a `%%` comes right after a character is decided on the diagram text without its
directives, which is the text that both lexers read: in
`autonumber 1%%{init: {}}%%%% c0`, the `%%` comes right after the number 1.
[fixture: sequence/div-comment-after-number-across-directive]

The difference goes both ways. Inputs made by inserting `%% c` after each
character of the accepted sequence fixtures, 42,541 of them, were compared; of
those, 2,478 differ, in three kinds.

mermaid.js accepts and this specification rejects (604 of the inputs): a
one-character id, a digit, or a `.`, where a statement or its next unit starts,
right before `%%`, whatever follows on the line. mermaid.js reads the rest of
the line as a comment. Here `C%% c` and `p%% carticipant A` are id runs,
statements without an arrow, `1%% c` is a number, which cannot start a
statement, and in `autonumber .%% c5` the `.` is no number. This specification
has no rule that ends an id run before `%%` when the run has one character:
inside an id run, `%` is a character of the run whatever its length, and
mermaid.js reads `CD%% c` as the id run `CD%% c` too. [fixture:
sequence/div-comment-after-one-character-id] [fixture:
sequence/div-comment-after-one-digit-line] [fixture:
sequence/div-comment-after-first-letter-of-keyword] [fixture:
sequence/div-comment-after-dot-before-number]

mermaid.js rejects and this specification accepts (1,368): `%%` right after the
first character of an id run that the statement needs, as in
`Alice->>B%% cob: Hello`, where mermaid.js loses the target of the message; `%%`
right after the `:` before a message text, where mermaid.js loses the `:`; and
`%%` right after a number of two or more characters, which mermaid.js reads as
an id run. Here the target is `B%% cob`, `A->>B:%% c` has the message `%% c`,
and `autonumber 10%% c` and `autonumber .5%% c` start at 10 and 0.5. [fixture:
sequence/div-comment-after-id-run-first-character-target] [fixture:
sequence/div-comment-after-text-colon] [fixture:
sequence/div-comment-after-two-digit-number] [fixture:
sequence/div-comment-after-fraction-number]

Both accept with a different Db (506): `%%` right after the first character of
an id run where what is left of the line after mermaid.js's comment is still
accepted, and `%%` right after a number of one digit, which mermaid.js loses.
`A%% clice->>Bob: Hello` is a message from `A%% clice` here and no message in
mermaid.js; `autonumber 5%% c` starts at 5 here and has no start in mermaid.js;
and `autonumber 5 2%% c` has the step 2 here and 1 in mermaid.js. [fixture:
sequence/div-comment-after-id-run-first-character-line-start] [fixture:
sequence/lex-percent-comment-takes-number] [fixture:
sequence/div-comment-after-step-number]

Where the character that mermaid.js loses changes nothing, as with a `;` or a
`)` before `%%`, both give the same result, and the input is not a divergence. A
space before the `%%` makes both read the same in most places:
`autonumber 10 %% c` starts at 10 and `A->>B: %% c` has the message `%% c` in
both; but in an id run the space stays, so `A %% clice->>Bob: Hello` is a
message from `A %% clice` in both. [fixture:
sequence/lex-comment-after-semicolon] [fixture:
sequence/lex-comment-after-invalid-unit] [fixture:
sequence/lex-space-before-comment-after-two-digit-number] [fixture:
sequence/lex-space-before-comment-after-text-colon] [fixture:
sequence/lex-space-before-comment-in-id-run]

The difference is these two rules and nothing else. mermaid.js with a lexer
changed in only these two ways, without the rule that reads a character and `%%`
as a comment, and with a number that may also end before `%%`, accepts and
rejects every input as this specification does and gives every accepted input
the Db that this specification gives it, apart from the other known divergences.
This is how the claim is checked: each input is run through mermaid.js with that
changed lexer, and the result is compared with this specification's. For the
42,541 inputs above, the only differences are inputs of
[`embedded-data-opaque`](#embedded-data-opaque). No input given to mermaid.js
with its own lexer can serve instead: its statement state reads a character
followed by `%%` as a comment before any rule for ids, so no input gives it an
id run, as in a message, whose second and third characters are `%%`.
