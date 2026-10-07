# State

Japanese version: [state.ja.md](./state.ja.md)

Source of truth in mermaid.js:

- [`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison)
- [`stateDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts)
- [`dataFetcher.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts)
- the tests (`*.spec.js`, `*.spec.ts`) in
  [`state/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state)

This document covers the diagram type `stateDiagram`. The nodes of the tree are
defined in [ast/state.md](../ast/state.md).

## Detection

Entry 20 of [detection.md](../detection.md) selects this grammar: the text
starts with `stateDiagram`, after whitespace, in exactly this case. mermaid.js
has one detector for both headers, `stateDiagram` and `stateDiagram-v2`, and
reads both with the same grammar and the same Db
([`stateDetector-V2.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDetector-V2.ts#L7-L15)).
[fixture: state/header-v1] [fixture: state/header-v2]

The lexer then reads the header again, case-insensitively and followed by
whitespace (see [The statement context](#the-statement-context)). So
`stateDiagram-V2` is a header, while `stateDiagramX` and `stateDiagram-v3` are
detected as state diagrams and rejected. The whitespace after the header may be
a line break or not: a statement may follow the header on its line, and the
header alone is accepted, also without a line feed after it, because the lexer
reads a line feed after the last character (see
[End of text](../common.md#end-of-text)). [fixture: state/header-v2-upper-case]
[fixture: state/header-word-after-keyword] [fixture: state/header-other-suffix]
[fixture: state/header-statement-same-line] [fixture: state/header-only]
[fixture: state/header-only-without-line-feed]

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
(see [Notation](../common.md#notation)): `STATE A {`, `Note Left Of A : x`, and
`HIDE EMPTY DESCRIPTION` are read as with the lower-case words. [fixture:
state/lex-keyword-upper-case] [fixture: state/lex-note-mixed-case] [fixture:
state/lex-hide-upper-case] A **keyword** below is a word, matched
case-insensitively, that is not followed by a word character (see
[Notation](../common.md#notation)), so `clickable` and `notes` are ids, while in
`click-x` the lexer reads the keyword `click`. [fixture:
state/lex-keyword-prefix-of-id] [fixture: state/lex-keyword-before-dash]

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it; leaving the statement
context keeps the statement context. At each position, the lexer applies the
first rule of the current context that matches there. Whitespace that a rule
reads belongs to no unit unless the rule says otherwise. When no rule of the
current context matches, the input is rejected; the lists below do not repeat
this.

The text may end in the statement context, and also in the title, description,
and description block contexts, in the styles of `classDef` and `style`, in the
css class of `class`, and in the id after `as`; where it ends right after the
unit that enters such a context, that value is empty. The input is rejected when
the text ends in a composite body, a string, a note, or the scale context.
[fixture: state/lex-acc-title-at-end] [fixture:
state/db-acc-descr-empty-replaces] [fixture: state/lex-acc-descr-block-unclosed]
[fixture: state/lex-classdef-without-styles] [fixture:
state/lex-style-without-styles] [fixture: state/lex-class-css-class-at-end]
[fixture: state/lex-alias-as-at-end] [fixture:
state/lex-floating-note-as-at-end] [fixture: state/lex-composite-unclosed]
[fixture: state/lex-alias-string-unclosed] [fixture:
state/lex-floating-note-string-unclosed] [fixture:
state/lex-note-unclosed-at-end] [fixture: state/lex-scale-at-end]

**Ids.** In several contexts, the same rule reads an id: one or more characters
other than `:`, line feed, whitespace, `-`, and `{`, as many as possible, makes
an `id` unit. When the characters read contain `%%` after their first character,
the unit ends before that `%%`, and the lexer reads on from the `%%` in the
context that the rule leaves it in: in the statement, composite body, and state
contexts, the `%%` starts a diagram comment (see [Comments](#comments)), while
after a `note-id`, the note text context has no comment rule, and
`note left of A%% c : hi` is rejected. [fixture: state/lex-note-id-percent] So
an id may contain `;`, `#`, `"`, `}`, and a single `%`: `A;B` and `A#1` are
states, and `}` alone is a state in the statement context. [fixture:
state/lex-semicolon-in-id] [fixture: state/lex-hash-in-id] [fixture:
state/lex-close-brace-as-id] [fixture: state/lex-percent-comment-in-id] The same
holds for the other rules below that say they read an id. Where a unit starts in
the statement or composite body context, `%%` is read as a comment unless `{`
follows. A `%%` before a `{` that starts no directive is an `ignored-text` unit
in the statement context (rule 9), and an id in the composite body context,
which has no rule for the `{`, so the input is rejected there. In both contexts,
the direction line is tried first: a line `%%{}direction LR` sets the direction,
also in a body. [fixture: state/lex-direction-line-after-ignored-percent]
[fixture: state/lex-composite-direction-line-after-ignored-percent] [fixture:
state/lex-composite-direction-line-after-ignored-percent-space-brace] [fixture:
state/lex-composite-direction-line-after-emptied-directive] [fixture:
state/lex-composite-ignored-percent-rejected] A `floating-note-id` may start
with `%%` too; the `alias-id` and the `note-id` end before a `%%` also at their
first character (see below).

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit, a name unit
included, makes the input rejected. The **name units** are an `id`,
`state-name`, `class-name`, or `note-id` unit. The **text units** are the text
of a `description` unit after its `:`, an `alias-id`, `second-description`,
`pseudostate-name`, `note-text`, `floating-note-text`, `floating-note-id`,
`style-text`, or `css-class` unit, a `title-text`, `description-text`, or
`description-block-text` unit, and a `direction-text` or `ignored-text` unit.
The **string units** are the `string` and `empty-string` units. [fixture:
state/div-directive-in-state-name] [fixture: state/div-directive-in-class-name]
[fixture: state/div-directive-in-note-id] [fixture:
state/div-directive-in-class-separator] [fixture:
state/div-directive-in-terminal] [fixture:
state/div-directive-in-pseudostate-mark] [fixture:
state/div-directive-in-divider] [fixture: state/lex-directive-in-alias-id]
[fixture: state/lex-directive-in-second-description] [fixture:
state/lex-directive-in-pseudostate-name] [fixture:
state/lex-directive-in-floating-note-id] [fixture:
state/lex-directive-in-style-text] [fixture: state/lex-directive-in-css-class]
[fixture: state/lex-directive-in-acc-title-text] [fixture:
state/lex-directive-in-acc-descr-text] [fixture:
state/lex-directive-in-acc-descr-block-text] [fixture:
state/lex-directive-in-direction-text] [fixture:
state/lex-directive-in-ignored-text] [fixture:
state/tokens-directive-note-spaces]

- `A : x%%{init: {}}%%y` gives A the description `xy`, and
  `note "x%%{init: {}}%%y" as N` is a floating note with the text `xy`, as in
  mermaid.js. [fixture: state/lex-directive-in-description] [fixture:
  state/lex-directive-in-floating-note-text]
- A directive between two units is allowed whatever their kind:
  `A%%{init: {}}%%--> B` is a transition. [fixture:
  state/lex-directive-between-units]
- A directive inside a string keeps the reading of mermaid.js, wherever it lies
  inside the unit: `state "a%%{init: {}}%%b" as A` gives A the label `ab`,
  `state "a %%{init: {}}%% b" as A` the label `a`, two spaces, and `b`, and a
  click statement whose URL is `"u%%{init: {}}%%v"` is accepted. [fixture:
  state/lex-directive-in-state-string] [fixture:
  state/lex-directive-in-state-string-spaces] [fixture:
  state/lex-directive-in-click-href-string] A string with only a directive is
  read as the empty string: `state "%%{init: {}}%%" as A` is rejected, as
  `state "" as A` is, and `state "%%{init: {}}%%" A` is accepted, as
  `state "" A` is. [fixture: state/lex-directive-in-state-string-only] [fixture:
  state/lex-directive-in-empty-string-before-name]
- In `sta%%{init: {}}%%te A {`, `Fo%%{init: {}}%%o --> B`, and
  `A -%%{init: {}}%%-> B`, the directive lies inside a keyword, an id, or an
  arrow, and the input is rejected, while mermaid.js accepts it, with a
  transition from `Foo` in the second (see
  [Known divergences](#known-divergences)). [fixture:
  state/div-directive-in-keyword] [fixture: state/div-directive-in-id] [fixture:
  state/div-directive-in-arrow]

### The statement context

In the statement context, the lexer tries these rules in order:

1. The keyword `click`: a `click` unit. [fixture: state/lex-click-empty-strings]
2. The keyword `href`: an `href` unit. [fixture: state/gram-click-terminal]
3. `"`, zero or more characters other than `"`, line feeds included, and `"`: a
   `string` unit, which is empty when no character lies between the quotes.
   [fixture: state/tokens-comment-region-in-alias-string] [fixture:
   state/gram-state-empty-string-before-name]
4. The keyword `default`: a `default` unit. [fixture:
   state/lex-keyword-default-as-id]
5. A **direction line** (see below). [fixture:
   state/lex-direction-line-then-comment]
6. One or more line feeds: a `newline` unit. [fixture:
   state/lex-blank-lines-between-statements]
7. One or more whitespace characters, line feeds included: nothing. [fixture:
   state/lex-state-name-next-line]
8. `#` and the rest of its line, up to the line feed: a diagram comment whose
   mark is `#` (see [Comments](#comments)). [fixture:
   state/lex-hash-comment-after-statement]
9. `%%` not followed by `{`, and the rest of its line, up to the line feed: a
   diagram comment whose mark is `%%`. `%%` followed by a `{` that starts no
   directive: an `ignored-text` unit, which mermaid.js does not read. [fixture:
   state/lex-percent-comment-after-statement] [fixture:
   state/lex-percent-before-brace-rejected]
10. `scale` and one or more whitespace characters: a `scale` unit; enters the
    scale context. [fixture: state/gram-scale] [fixture:
    state/lex-scale-number-next-line]
11. `accTitle`, zero or more whitespace, `:`, and zero or more whitespace: an
    `accTitle` unit and a `:` unit; enters the title context. [fixture:
    state/lex-acc-title-at-end] [fixture:
    state/lex-acc-title-space-before-colon] [fixture:
    state/lex-acc-title-line-feed-before-colon] [fixture:
    state/lex-acc-title-no-whitespace]
12. `accDescr`, zero or more whitespace, `:`, and zero or more whitespace: an
    `accDescr` unit and a `:` unit; enters the description context. [fixture:
    state/db-acc-descr-empty-replaces] [fixture:
    state/lex-acc-descr-space-before-colon] [fixture: state/demo-state-26627e00]
    [fixture: state/lex-acc-descr-line-feed-before-colon]
13. `accDescr`, zero or more whitespace, `{`, and zero or more whitespace: an
    `accDescr` unit and a `{` unit; enters the description block context.
    [fixture: state/db-acc-descr-block-replaces] [fixture:
    state/lex-acc-descr-block-line-feed-before-brace] [fixture:
    state/lex-acc-descr-block-no-whitespace]
14. `classDef` and one or more whitespace characters: a `classDef` unit; enters
    the classDef context. [fixture: state/lex-classdef-without-styles] [fixture:
    state/lex-classdef-keyword-line-feed]
15. `class` and one or more whitespace characters: a `class` unit; enters the
    class context. [fixture: state/db-class-before-state] [fixture:
    state/lex-class-keyword-line-feed]
16. `style` and one or more whitespace characters: a `style` unit; enters the
    style context. [fixture: state/db-style-without-text] [fixture:
    state/lex-style-keyword-line-feed]
17. `state` and one or more whitespace characters, line feeds included: a
    `state` unit; enters the state context. When the first unit after it that is
    not an `empty-string` unit is a `{` unit, an `ignored-text` unit, or another
    `ignored-state` unit, it is an `ignored-state` unit instead: mermaid.js
    reads no token for `state`, so that `{` starts the body of the statement
    before it (see
    [Composite states, aliases, and pseudostates](#composite-states-aliases-and-pseudostates)).
    [fixture: state/lex-state-without-body] [fixture:
    state/gram-ignored-state-before-body-next-line]
18. `{`: a `{` unit; enters the composite body context. [fixture:
    state/db-parent-set-by-later-composite]
19. `note` and one or more whitespace characters: a `note` unit; enters the note
    context. [fixture: state/db-note-after-state-shape] [fixture:
    state/lex-note-keyword-line-feed]
20. `stateDiagram` and one or more whitespace characters, or `stateDiagram-v2`
    and one or more whitespace characters: a `header` unit. [fixture:
    state/header-v1] [fixture: state/header-v2]
21. The keyword `hide empty description`, with one space between the words: a
    `hide` unit, an `empty` unit, and a `description-word` unit, the last named
    so because `description` is the unit of a description.
    `hide empty descriptionx` is three states. [fixture:
    state/lex-hide-then-word] The spaces are counted in the diagram text, and a
    directive next to one lies between two units:
    `hide%%{init: {}}%% empty description` and
    `hide empty%%{init: {}}%% description` are this statement, while
    `hide %%{init: {}}%% empty description` has two spaces and is the three
    states `hide`, `empty`, and `description`, all as in mermaid.js. [fixture:
    state/lex-directive-between-hide-and-empty] [fixture:
    state/lex-directive-between-empty-and-description] [fixture:
    state/lex-hide-directive-between-spaces]
22. `[*]`: a `[*]` unit. [fixture: state/db-root-start-shared]
23. An id (see [Ids](#units-and-contexts)). [fixture:
    state/lex-keyword-prefix-of-id]
24. A **description**: zero or more whitespace, `:`, and then one or more
    characters as many as possible, each of which is a character other than `:`,
    `;`, and line feed, or a `:` followed by such a character: a `description`
    unit. [fixture: state/lex-colon-in-description] [fixture:
    state/lex-description-without-space]
25. `-->`: a `-->` unit. [fixture: state/lex-semicolon-after-transition]
26. `:::`: a `:::` unit. [fixture: state/db-definition-css-class]
27. Any other character: an `invalid` unit. [fixture: state/lex-dash-in-id]

The words of rules 10 to 21 are compared case-insensitively, as everywhere in
this diagram; the whitespace after them, line feeds included, belongs to no
unit. The units `default`, `href` outside a click statement, `string` outside a
click statement, and `invalid` are taken by no rule of the grammar, so an input
with one of them is rejected. [fixture: state/lex-keyword-default-as-id]
[fixture: state/lex-string-outside-click] [fixture:
state/lex-keyword-href-as-id] [fixture: state/lex-dash-in-id] Some consequences
of the order:

- A directive starts at `%%{` only when zero or more whitespace characters and
  then a name, a word, follow it (see
  [Where a directive is](../common.md#where-a-directive-is)), and a comment
  starts at `%%` only when no `{` follows it. So `%%{}` and `%%{ }` are neither:
  their `%%` is an `ignored-text` unit, which the grammar takes only before the
  `{` of a body (see [Grammar](#composite-states-aliases-and-pseudostates)).
  `state X` followed by a line `%%{}`, `%%{ }`, or `%%{}%%` is the composite
  state X with an empty body, while after `A` the `{` is rejected; and after
  `state X`, a line `%%{init: {}}%%` or `%%{` followed by a line `A` is a
  directive, and `%% {}` is a comment, so X has no body. [fixture:
  state/gram-ignored-percent-before-body-next-line] [fixture:
  state/gram-ignored-percent-space-brace-before-body-next-line] [fixture:
  state/gram-ignored-percent-emptied-directive-next-line] [fixture:
  state/lex-percent-before-brace-rejected] [fixture:
  state/lex-directive-line-after-state-name] [fixture:
  state/lex-directive-name-next-line-after-state-name] [fixture:
  state/lex-comment-space-brace-after-state-name]
- A keyword is a keyword wherever a unit starts: a transition to `click`,
  `default`, or `note` is rejected, while `clickable` and `notes` are ids.
  [fixture: state/lex-keyword-click-as-id] [fixture:
  state/lex-keyword-default-as-id] [fixture: state/lex-keyword-prefix-of-id]
- `-` is no character of an id, so `A-B` is rejected, and `--` is read only in a
  composite body. [fixture: state/lex-dash-in-id] [fixture:
  state/lex-divider-outside-composite]
- `;` is a character of an id, not a separator: `A --> B; B --> C` has a
  transition from A to the state `B;`, and then one from B to C. A description
  ends at `;`, and what follows is read as the next statement: `A : x;y` gives A
  the description `x` and adds the state `;y`. [fixture:
  state/lex-semicolon-after-transition] [fixture:
  state/lex-semicolon-ends-description]
- A description may hold a single `:`, but no two in a row, and it cannot end
  with `:`: `A : x:y` has the description `x:y`, `A : x::y` is rejected, and
  `A::c` gives A the description `:c`. [fixture: state/lex-colon-in-description]
  [fixture: state/lex-two-colons-in-description] [fixture:
  state/lex-double-colon-description]
- A description needs a character after its `:`: `A :` is rejected, and `A : `,
  with a space, is accepted. [fixture: state/gram-description-colon-only]
  [fixture: state/gram-description-blank]
- A string is read only where the grammar of a click statement takes it:
  `A --> "B"` is rejected. [fixture: state/lex-string-outside-click]
- Whitespace before a line feed is read with it by rule 7, which makes no
  `newline` unit. The grammar needs a `newline` unit only after a click
  statement, so `click A href "u"` followed by spaces and a line break, and then
  another statement, is rejected, while without the spaces it is accepted.
  [fixture: state/lex-click-spaces-before-line-feed] [fixture:
  state/lex-click-line-feed]

**The direction line.** Compared case-insensitively: from the current position,
a run of characters without line feeds, U+2028, or U+2029, the longest one that
the rest can follow; then `direction`; then one or more whitespace characters;
then one of `TB`, `BT`, `RL`, and `LR`, tried in this order; and then every
character up to the next line feed. The rule reads `direction` as a `direction`
unit, the value as a `direction-value` unit, and the characters before
`direction` and after the value as `direction-text` units, which mermaid.js does
not read. The rule is tried before the id rule, so it takes the whole line:
`B : x direction LR` sets the direction and has no state, and so does
`A --> B direction LR`, and `Direction lr` is a direction line. It is also tried
before the comment rules, so the text after the value may hold `%%`:
`direction LR %% c` sets the direction `LR`, and `%% c` is a `direction-text`
unit, not a comment. Neither does the value need to end at a word boundary:
`direction TBX` sets `TB`, and `X` is a `direction-text` unit. The run is the
longest one: `direction TB x direction TB` is read at its last `direction`, and
`direction TB x` is a `direction-text` unit. [fixture:
state/lex-direction-line-same-value-twice] [fixture:
state/lex-direction-line-in-description] [fixture:
state/lex-direction-line-same-line-transition] [fixture:
state/lex-direction-lower-case] [fixture: state/lex-direction-line-then-comment]
[fixture: state/lex-direction-line-value-then-text] [fixture:
state/lex-direction-line-after-line-separator] [fixture: state/lex-direction-rl]
The whitespace between `direction` and its value may hold a line feed:
`direction`, a line break, and `LR` is a direction line. [fixture:
state/lex-direction-value-next-line]

### The composite body context

The composite body context is entered by `{`, in the statement context or in the
state context. It reads the statements of a composite state:

1. One or more whitespace characters other than line feed: nothing. [fixture:
   state/db-nested-terminals]
2. `#` and the rest of its line: a diagram comment, as in rule 8 of the
   statement context. [fixture: state/lex-composite-hash-comment]
3. `%%` not followed by `{`, and the rest of its line: a diagram comment, as in
   rule 9 of the statement context. [fixture:
   state/lex-composite-percent-comment]
4. Rules 14 to 17 of the statement context: `classDef`, `class`, `style`, and
   `state`. [fixture: state/db-nested-classdef] [fixture:
   state/db-nested-class-statement] [fixture:
   state/gram-ignored-states-in-composite-body] [fixture:
   state/db-nested-style-statement]
5. A direction line. [fixture: state/lex-composite-direction-line]
6. `}`: a `}` unit; leaves the composite body context. [fixture:
   state/db-nested-terminals]
7. A line feed: nothing. [fixture: state/db-nested-terminals]
8. Rule 19 of the statement context: `note`. [fixture:
   state/db-note-in-composite]
9. `[*]`: a `[*]` unit. [fixture: state/db-nested-terminals]
10. An id. [fixture: state/lex-composite-default-as-id]
11. A description, as in rule 24 of the statement context. [fixture:
    state/tokens-composite-description-ignored-semicolon]
12. `-->`: a `-->` unit. [fixture: state/db-nested-terminals]
13. `--`: a `--` unit, a **divider**. [fixture: state/lex-composite-divider]
14. `:::`: a `:::` unit. [fixture: state/lex-composite-class-separator]

The other rules of the statement context are not tried here: `click`, `href`,
`default`, `"`, `accTitle`, `accDescr`, `scale`, `hide empty description`, and
the header. Their words are ids in a composite body: `click B href "u"` is four
states, `click`, `B`, `href`, and `"u"`; `accTitle: x` is the state `accTitle`
with the description `x`; and `hide empty description` is three states.
[fixture: state/lex-composite-click-as-ids] [fixture:
state/lex-composite-acc-title-as-state] [fixture:
state/lex-composite-hide-as-states] [fixture: state/lex-composite-string-as-id]
[fixture: state/lex-composite-default-as-id] A line feed makes no unit here. The
`state` rule comes before the direction line, so `state B direction LR` in a
body is a state statement, while `B : x direction LR` is a direction line.
[fixture: state/lex-composite-state-before-direction] [fixture:
state/lex-composite-direction-line]

### The state context

The state context is entered by `state`. The whitespace after `state` may hold
line feeds, so the name may be on the next line. [fixture:
state/lex-state-name-next-line]

1. One or more whitespace characters other than line feed: nothing. [fixture:
   state/lex-state-two-names]
2. `#` and the rest of its line: a diagram comment, as in rule 8 of the
   statement context. [fixture: state/lex-state-name-hash-comment]
3. `%%` not followed by `{`, and the rest of its line: a diagram comment, as in
   rule 9 of the statement context. [fixture:
   state/gram-ignored-state-after-comment-before-body]
4. A **pseudostate mark**: `<<fork>>`, `<<join>>`, `<<choice>>`, `[[fork]]`,
   `[[join]]`, and `[[choice]]` are tried in this order, and for the first that
   occurs before the next line feed, U+2028, or U+2029, the rule reads every
   character from the current position up to its last occurrence there. The
   characters before the mark, without the whitespace at their ends, are a
   `pseudostate-name` unit when they are not empty, and the mark is a unit named
   by its text; leaves the state context. [fixture: state/lex-fork-spaced-id]
5. `"`: enters the state string context. [fixture:
   state/db-alias-blank-without-body]
6. Zero or more whitespace, `as`, and one or more whitespace characters, line
   feeds included: an `as` unit; enters the alias id context. [fixture:
   state/lex-alias-no-space-before-as] [fixture:
   state/lex-alias-id-percent-next-line]
7. A word, one or more whitespace characters, line feeds included, another word,
   and then zero or more characters other than line feed, U+2028, and U+2029, as
   few as possible, and `{`: rejected. mermaid.js throws the error "State name
   must be a single word". Like the other rules, it is tried wherever a unit may
   start in the state context, so it is tried again at each name after the
   first. [fixture: state/lex-state-two-names-body]
8. One or more characters other than line feed, whitespace, and `{`: a
   `state-name` unit. [fixture: state/lex-state-without-body]
9. A line feed: leaves the state context. [fixture:
   state/lex-state-name-state-then-composite]
10. `{`: a `{` unit; leaves the state context and enters the composite body
    context. [fixture: state/lex-state-brace-next-line]

Some consequences:

- The text before a pseudostate mark is its name, whitespace included:
  `state f 1 <<fork>>` is the fork `f 1`, and
  `state "Some::call()" as one <<choice>>` is the choice
  `"Some::call()" as one`, because rule 4 comes before the string. Nothing
  before the mark is allowed too: `state <<join>>` is a join with the empty id.
  A later mark of an earlier kind wins: `state a <<join>> b <<fork>>` is the
  fork `a <<join>> b`. [fixture: state/lex-pseudostate-first-mark-kind] After
  the mark, the line is read in the statement context: `state x <<choice>> y`
  adds the choice x and the state y. [fixture: state/lex-fork-spaced-id]
  [fixture: state/lex-choice-after-alias] [fixture: state/lex-join-empty-id]
  [fixture: state/lex-choice-then-state] [fixture:
  state/lex-choice-square-brackets] A mark after a U+2028 on the line is not
  found from before it: `state a`, U+2028, and `b <<fork>>` is the state name
  `a` and the fork `b`. [fixture:
  state/lex-pseudostate-mark-after-line-separator]
- Each `state-name` is a statement of its own, which adds nothing without a body
  (see [Grammar](#grammar)): `state A` and `state a b` add nothing, and `state`
  alone is accepted. [fixture: state/lex-state-without-body] [fixture:
  state/lex-state-two-names] [fixture: state/lex-state-keyword-alone]
- Rule 7 rejects two or more words before a `{` that is on the line of the last
  of them, also when the whitespace between two words holds line breaks:
  `state a b {`, `state a b c {`, `state a`, a tab, and `b {`, and `state a`, a
  line break, and `b {`, also with blank lines between, are rejected. So is
  `state a b`, a line break, and `C {`: rule 7 does not match at `a`, because no
  `{` follows on the line of `b`, so `a` is a `state-name`, and the rule, tried
  again at `b`, reads `b`, the line break, `C`, and `{`. [fixture:
  state/lex-state-two-names-body-next-line] [fixture:
  state/lex-state-three-names-body] [fixture: state/lex-state-two-names-tab]
  [fixture: state/lex-state-name-blank-lines-then-brace] [fixture:
  state/lex-state-two-names-brace-next-line] The rule needs a word on each side
  of the whitespace, and a `{` on the line of the second word: `state a -b {` is
  the state name `a` and the composite state `-b`, `state a:b {` is the
  composite state `a:b`, and after `state a`, a line break, and `B`, the line
  break leaves the state context, so a `state D {` on a later line is a
  composite statement. [fixture: state/lex-state-dash-word-body] [fixture:
  state/lex-state-colon-name-body] [fixture:
  state/lex-state-name-lines-then-composite] [fixture:
  state/lex-state-name-state-then-composite] After `state a`, a line break, and
  `B`, a `C {` on the next line is read in the statement context, where the
  grammar takes no `{` after a definition statement, and the input is rejected.
  [fixture: state/lex-state-name-lines-then-two-names] Issue
  [#7091](https://github.com/mermaid-js/mermaid/issues/7091) reported that only
  the last word was taken; it has the labels `Type: Bug / Error` and
  `Status: Approved`, and was closed on 2026-06-04 by pull request
  [#7570](https://github.com/mermaid-js/mermaid/pull/7570), which added this
  rule. [fixture: state/lex-state-two-names-body]
- A line feed leaves the state context, and `{` in the statement context enters
  the composite body context too, so the `{` of a body may be on the line after
  the name. [fixture: state/lex-state-brace-next-line]

**The state string context.** `"` leaves the state string context; one or more
characters other than `"` are the text of the string. The string from `"` to `"`
is one `string` unit; when the second `"` follows the first directly, it is an
`empty-string` unit instead. mermaid.js returns no token for the quotes of a
string in this context, only for its text, so it does not read an empty string
([`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L128-L132)),
and the tree holds it as a StateIgnoredText where the grammar takes it (see
[Composite states, aliases, and pseudostates](#composite-states-aliases-and-pseudostates)).
An empty string is still a unit, which ends the unit before it, as its quotes do
in mermaid.js: in `state ""`, a line break, and `A`, the line break leaves the
state context, and `A` is a state, while in `state`, a line break, and `A`, the
whitespace after `state` takes the line break, and `A` is a state name; and in
`state x "" y {`, rule 7 does not match at `x`, because a `"` follows the
whitespace, so the input is the statement x and the composite state y, while
`state x y {` is rejected. [fixture: state/gram-state-empty-string-alone]
[fixture: state/gram-state-empty-string-then-line] [fixture:
state/gram-state-empty-string-between-names-before-body] Where the grammar takes
no empty string, both reject the input: `state "" as A` and `state "" as`, where
`as` needs a string before it, and `state "" {` with a body, as `state {`.
[fixture: state/lex-alias-empty-string] [fixture:
state/gram-state-empty-string-before-as-at-end] [fixture:
state/gram-state-empty-string-before-body] Quotes that are no empty string at
the start of a unit are read the same by both: `state "" <<fork>>` is the fork
`""`, because rule 4 comes before rule 5, and `state x"" {` with a body is the
composite state `x""`, because rule 8 reads the quotes as characters of the
name. [fixture: state/lex-state-empty-string-before-pseudostate-mark] [fixture:
state/lex-state-name-ending-in-quotes] `as` may follow the string directly:
`state "d"as A`. [fixture: state/lex-alias-no-space-before-as]

**The alias id context.** Zero or more characters other than line feed and `{`
are an `alias-id` unit, without the whitespace at its ends; it ends before the
first `%%`, also when that is its first character. It leaves the alias id
context, so the state context reads on, where the `%%` starts a comment unless
`{` follows. So the id after `as` may hold whitespace and `:`:
`state "d" as my id` adds the state `my id`, and the id may be empty: before a
`{`, and before a `%%`, so that `state "d" as %% c` and `state "d" as %%A` are
alias definitions with the empty id followed by a comment, which add no state.
[fixture: state/lex-alias-id-spaces] [fixture:
state/lex-alias-id-trailing-spaces] [fixture: state/lex-alias-without-id]
[fixture: state/lex-alias-comment-after-id] [fixture:
state/lex-alias-id-percent-comment] [fixture: state/lex-alias-id-percent-word]
[fixture: state/lex-alias-id-percent-next-line] When the text starts with `%%`
and a `{` follows it on its line, the text before the `{`, without the
whitespace at its end, is an `ignored-text` unit instead, which mermaid.js does
not read, and there is no `alias-id`: `state "d" as %%{}` and
`state "d" as %% c {` are alias definitions without an id, with a body.
[fixture: state/lex-alias-id-ignored-percent-brace] [fixture:
state/lex-alias-id-ignored-percent-before-body]

When the alias statement has no body, the lexer divides the `alias-id` at its
first `:`: the text before it is the `alias-id`, the `:` is a `:` unit, the text
between it and the second `:`, or the end, is a `second-description` unit, which
may be empty or all whitespace, and the text from the second `:` is an
`ignored-text` unit, which mermaid.js does not read
([`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L233-L243)).
It has a body when a `{` follows the `alias-id`, on its line or after the line
feed of its line and only line whitespace and comment lines, with only units
between them that the grammar takes before the `{` of a body: empty description
blocks, an `ignored-state` unit and empty strings, or a `%%` right before the
`{` (see
[Composite states, aliases, and pseudostates](#composite-states-aliases-and-pseudostates)).
So `state "d" as A : x` followed by a line `%%{}` or `accDescr {} %%{}` defines
the composite state `A : x` with an empty body. [fixture:
state/lex-alias-colon-ignored-percent-before-body-next-line] [fixture:
state/lex-alias-colon-block-and-ignored-percent-before-body-next-line] The alias
id is then not divided: `state "d" as A : x {`, and `state "d" as A : x`
followed by a line `{`, define the composite state `A : x`, while after an empty
line the `{` starts no body, and the input is rejected; a line of only
whitespace, which rule 7 of the statement context reads with its line feed,
makes no unit and changes nothing. [fixture:
state/lex-alias-colon-whitespace-line-before-body] [fixture:
state/lex-alias-colon-tab-line-before-body] [fixture:
state/lex-alias-colon-block-then-spaces-before-body] [fixture:
state/lex-alias-second-description] [fixture: state/lex-alias-third-part]
[fixture: state/db-alias-colon-empty-second] [fixture:
state/db-alias-colon-spaces-second] [fixture: state/lex-alias-colon-before-body]
[fixture: state/lex-alias-colon-before-body-next-line] [fixture:
state/lex-alias-colon-before-body-after-comment-line] [fixture:
state/lex-alias-colon-blank-line-before-brace]

### The classDef, class, and style contexts

`classDef` enters the **classDef context**:

1. `default` and one or more whitespace characters: a `default` unit, which the
   grammar does not take, so `classDef default …` is rejected. [fixture:
   state/lex-classdef-default]
2. One or more word characters and one or more whitespace characters, line feeds
   included: a `class-name` unit, without the whitespace; enters the styles
   context. [fixture: state/lex-classdef-styles-next-line] [fixture:
   state/lex-classdef-name-non-word]

`class` enters the **class context**:

1. One or more word characters, followed by zero or more of `,`, zero or more
   whitespace, and one or more word characters: an `id` unit for each run of
   word characters and an `id-comma` unit for each `,`; enters the class name
   context. [fixture: state/lex-class-ids-space] [fixture:
   state/lex-class-ids-comma]

`style` enters the **style context**:

1. One or more word characters and `,`, and one or more whitespace characters,
   line feeds included: an `id` unit for each run of word characters and an
   `id-comma` unit for each `,`; enters the styles context. [fixture:
   state/lex-style-empty-id]

Each of these contexts leaves when its rule has read. The **styles context**
then reads the rest of the line, up to the line feed, and divides it at each `,`
into `style-text` units, without the whitespace at their ends, and `,` units;
the **class name context** reads the rest of the line as one `css-class` unit,
without the whitespace at its ends. Either may be empty, and each leaves when it
has read.

- `classDef default fill:#f00` is rejected. [fixture:
  state/lex-classdef-default]
- The whitespace after the class name may hold a line feed, so the styles may be
  on the next line: `classDef a`, a line break, and `B` defines the class `a`
  with the style `B`, and `classDef a`, a line break, and `B --> C` defines the
  class `a` with the style `B --> C` and has no transition. [fixture:
  state/lex-classdef-styles-next-line] [fixture:
  state/db-classdef-without-styles-takes-transition]
- The css class of a `class` statement is the rest of the line, spaces included:
  `class A bad x` applies `bad x`, and may be empty: `class A` is accepted.
  [fixture: state/lex-class-name-spaces] [fixture: state/lex-class-ids-space]
  [fixture: state/lex-class-without-name] After a `,` and spaces, a word is one
  more id, while a space before the `,` ends the ids: `class A, c` applies the
  empty css class to A and c, and `class A ,B c` applies `,B c` to A. [fixture:
  state/lex-class-comma-space-id] [fixture: state/lex-class-ids-then-comma]
- The ids of a `style` statement may have empty items, also at the end:
  `style A,,B fill:red` and `style A, fill:red` are accepted. [fixture:
  state/lex-style-empty-id] [fixture: state/lex-style-ids-trailing-comma] The
  ids end at the whitespace after them, so a `,` after that whitespace is a `,`
  unit of the styles, not an `id-comma`: `style A ,x` styles A with an empty
  style and `x`, `style A ,` with two empty styles, and `style A , ,x` with two
  empty styles and `x`; `style A,B , x` styles A and B with an empty style and
  `x`, and `style A , B x` styles A with an empty style and `B x`. [fixture:
  state/db-style-comma-after-space] [fixture:
  state/db-style-comma-only-after-space] [fixture:
  state/db-style-two-commas-after-space] [fixture:
  state/db-style-ids-then-comma-after-space] [fixture:
  state/db-style-comma-then-id-and-style]

### The scale context

`scale` enters the scale context: one or more ASCII digits are a `number` unit,
and one or more whitespace characters followed by the keyword `width` are a
`width` unit, which leaves the scale context; `scale 3 widthx` is rejected.
`scale 350 width` is accepted, and `scale 350` is rejected. [fixture:
state/gram-scale] [fixture: state/gram-scale-without-width] [fixture:
state/lex-scale-width-then-word] [fixture: state/lex-scale-non-ascii-digit] The
whitespace after `scale` may hold a line feed: `scale`, a line break, and
`3 width` is a scale statement. [fixture: state/lex-scale-number-next-line]

### The note contexts

`note` enters the **note context**:

1. The keyword `left of` or `right of`, with one space between the words, the
   **position**: a `position` unit for `left` or `right` and an `of` unit;
   enters the note id context. [fixture: state/db-note-after-state-shape]
2. `"`: enters the floating note context. [fixture: state/lex-floating-note]

`note left  of A : x`, with two spaces, the same with a tab, and
`note over A : x` are rejected, and so are `note right ofx A`,
`note left ofA : x`, and `note left of1 : x`, where a word character follows the
position, while in `note right of#A : x` the position is followed by the note id
`#A`. [fixture: state/lex-note-two-spaces-in-position] [fixture:
state/lex-note-over] [fixture: state/lex-note-position-then-word] [fixture:
state/lex-note-position-then-id] [fixture: state/lex-note-position-then-digit]
[fixture: state/lex-note-position-then-hash] [fixture:
state/lex-note-tab-in-position] The space is counted in the diagram text, and a
directive next to it lies between two units: `note left%%{init: {}}%% of A: t`
and `note left %%{init: {}}%%of A: t` are notes of A, while
`note left %%{init: {}}%% of A: t` has two spaces and is rejected, all as in
mermaid.js. [fixture: state/lex-directive-between-left-and-of] [fixture:
state/lex-directive-between-space-and-of] [fixture:
state/lex-note-position-directive-between-spaces]

The **note id context** reads zero or more whitespace characters, line feeds
included, and then an id of characters other than `:`, line feed, whitespace,
and `-`: a `note-id` unit, which ends before the first `%%`, also when that is
its first character, and is then empty. Without such a `%%`, it needs one or
more characters: `note left of : x` is rejected. [fixture:
state/lex-note-empty-id-before-colon] The note id context then enters the note
text context, which has no comment rule. When `%%` follows the position
directly, with no whitespace between, the characters from it other than `:`,
line feed, whitespace, and `-` are an `ignored-text` unit instead, which
mermaid.js does not read, and the note id context reads on:
`note left of%%x A : t` is a note of A. [fixture:
state/lex-note-id-ignored-percent-after-position] So in `note right of %% c S`,
a line `x`, and `end note`, the note id is empty, and the note text is `%% c S`,
a line break, and `x`, while `note right of %%S : x` is rejected, because
`%%S : x` is no note text. [fixture: state/lex-note-id-percent-block] [fixture:
state/lex-note-id-percent-after-space] `note right of`, a line break, and
`A : x` is a note of A, and `note right of-A : x` is rejected. [fixture:
state/lex-note-position-then-line-feed] [fixture:
state/lex-note-position-then-dash]

The **note text context**:

1. Zero or more whitespace, `:`, and one or more characters other than `:`, `;`,
   and line feed, as many as possible: a `:` unit for the `:`, an `ignored-text`
   unit for the character after it when the `:` follows the `note-id` directly
   and that character is not whitespace, which mermaid.js drops (below), and a
   `note-text` unit for the characters after them, without the whitespace at
   their ends; leaves the note contexts. [fixture:
   state/db-note-after-state-shape]
2. Any characters, line feeds included, as few as possible, then a line feed,
   zero or more whitespace characters, and the keyword `end note`: a `note-text`
   unit for the characters before the line feed, without the whitespace at their
   ends, and an `end` unit and a `note` unit; leaves the note contexts. With two
   spaces or a tab between the words, the note does not end there. The space is
   counted in the diagram text, and a directive next to it lies between two
   units: `end%%{init: {}}%% note` and `end %%{init: {}}%%note` end the note,
   while with `end %%{init: {}}%% note`, which has two spaces, it does not end
   and the input is rejected, all as in mermaid.js. [fixture:
   state/lex-end-note-two-spaces] [fixture: state/lex-end-note-tab] [fixture:
   state/lex-directive-between-end-and-note] [fixture:
   state/lex-directive-between-space-and-note] [fixture:
   state/lex-end-note-directive-between-spaces] [fixture: state/lex-note-block]

- mermaid.js reads the text of a note on one line from right after the
  `note-id`, without its first two characters and without the whitespace at its
  ends. The first of them is whitespace or the `:`. With two or more whitespace
  characters before the `:`, the `:` is a character of the text that mermaid.js
  reads: `note left of A  :hi` has the text `:hi`. With the `:` right after the
  `note-id`, the character after the `:`, when it is not whitespace, is dropped,
  and it is the `ignored-text` unit of rule 1: `note left of A:hi` has the text
  `i`, and `note left of A:h` the empty text. Otherwise the two characters are
  the `:` and whitespace, and the text is the `note-text` unit. [fixture:
  state/lex-note-two-spaces-before-colon] [fixture:
  state/lex-note-colon-without-space] [fixture:
  state/lex-note-colon-then-one-character]
- A note text on one line ends at `:` or `;`: `note left of A : a:b` is
  rejected, and in `note left of A : hi;x`, the rest after `;` is the state
  `;x`. [fixture: state/lex-note-colon-in-text] [fixture:
  state/lex-note-semicolon]
- A note text over lines ends at the first line whose first word is `end note`,
  after whitespace: `send note` does not end it, and neither does `end notex`,
  because `end note` is a keyword. [fixture: state/lex-note-end-note-then-word]
  Issue [#7089](https://github.com/mermaid-js/mermaid/issues/7089) reported that
  it did; it has the labels `Type: Bug / Error` and `Status: Approved`, and was
  closed on 2026-04-14 by pull request
  [#7508](https://github.com/mermaid-js/mermaid/pull/7508). [fixture:
  state/lex-note-block] [fixture: state/lex-note-block-upper-case] [fixture:
  state/lex-note-block-empty] [fixture: state/lex-note-end-note-in-word]

The **floating note context**:

1. Zero or more whitespace, `as`, and zero or more whitespace: an `as` unit;
   leaves the context and enters the floating note id context. [fixture:
   state/lex-floating-note]
2. `"`: a `"` unit. [fixture: state/lex-floating-note-extra-quote-before-text]
3. One or more characters other than `"`, line feeds included: a
   `floating-note-text` unit. [fixture: state/lex-floating-note]

The `"` after `note` is a `"` unit too. The quotes do not pair: mermaid.js
returns no token for a `"` here and a token for each run of other characters
([`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L143-L146)),
and its grammar takes one text before `as`. So a floating note has one or more
`"` units, one `floating-note-text`, and one or more `"` units before `as`:
`note "x" as N`, `note ""x" as N`, `note "x"" as N`, and `note """x""" as N`
have the text `x`, and so has `note "" x" as N`: the text is the
`floating-note-text` unit without the whitespace at its ends (see
[StateFloatingNoteStatement](../ast/state.md#statefloatingnotestatement)).
[fixture: state/lex-floating-note-extra-quote-before-text] [fixture:
state/lex-floating-note-extra-quote-after-text] [fixture:
state/lex-floating-note-extra-quotes-around-text] [fixture:
state/lex-floating-note-text-after-quotes-and-space] The text may be all
whitespace, as in `note " " as N` and in a text of a line feed alone, and it may
hold line feeds. [fixture: state/lex-floating-note-whitespace-text] [fixture:
state/lex-floating-note-line-feed-text] [fixture:
state/lex-floating-note-line-feed] Two texts, or none, make the input rejected:
`note "a"b" as N`, `note "x" "" as N`, where the space between the quotes is a
second text, `note "" as N`, and `note """ as N`. [fixture:
state/lex-floating-note-two-texts] [fixture:
state/lex-floating-note-space-between-quoted-parts] [fixture:
state/lex-floating-note-empty-string] [fixture:
state/lex-floating-note-quotes-only] Rule 1 is tried before rule 3 wherever a
unit starts, and its `as` needs no whitespace after it, so a text that starts
with `as`, in any case and after whitespace, line feeds included, or not, is
read as an `as` unit, the floating note has no text, and the input is rejected:
`note "assume" as N`, `note "as you like" as N`, `note " as x" as N`, and
`note "AS x" as N`. Rule 3 reads a text to the next `"`, so an `as` later in it
is part of it: `note "a as b" as N` and `note "x as" as N`. `as` may follow the
last `"` directly, or on the next line. [fixture: state/lex-floating-note]
[fixture: state/lex-floating-note-text-starts-with-as] [fixture:
state/lex-floating-note-text-starts-with-as-word] [fixture:
state/lex-floating-note-text-starts-with-space-as] [fixture:
state/lex-floating-note-text-starts-with-upper-case-as] [fixture:
state/lex-floating-note-as-inside-text] [fixture:
state/lex-floating-note-text-ends-with-as] [fixture:
state/lex-floating-note-no-space-before-as] [fixture:
state/lex-floating-note-as-next-line] The **floating note id context** reads the
rest of the line as an id: a `floating-note-id` unit, which may hold whitespace,
and which ends before a `%%` after its first character; it then leaves the
context. [fixture: state/lex-floating-note-id-spaces]

### Accessibility values

In the title context and in the description context, the rest of the line, zero
or more characters other than line feed, is a `title-text` or `description-text`
unit, and the context is left. `#`, `;`, and `%%` are characters of it:
`accTitle: a;b #c %% d` has the title `a;b #c %% d`. The whitespace after `:` is
read with the `:` unit, line feeds included (rules 11 and 12 of the statement
context), so the text may be on the next line. [fixture:
state/lex-acc-title-semicolon] [fixture: state/lex-acc-descr-semicolon]
[fixture: state/lex-acc-title-next-line]

In the description block context, `}` is a `}` unit and leaves the context, and
one or more other characters are a `description-block-text` unit. The whitespace
after `{` is read with the `{` unit (rule 13 of the statement context), so
`accDescr {  }` has no text. [fixture: state/db-acc-descr-empty-block-keeps]

The rules that enter these contexts are rules of the statement context only; in
a composite body, `accTitle` and `accDescr` are ids (see
[The composite body context](#the-composite-body-context)). The text may end in
any of these contexts (see [Units and contexts](#units-and-contexts)). [fixture:
state/lex-composite-acc-title-as-state] [fixture: state/lex-acc-title-at-end]
[fixture: state/lex-acc-descr-block-unclosed]

### Comments

`#` and `%%` start a diagram comment where the comment rule of the current
context is tried before a unit starts: at the start of a unit in the statement
context, the composite body context, and the state context, and after an id and
a `floating-note-id`, which end before a `%%` after their first character, and
after an `alias-id`, which ends before any `%%`. After a `note-id`, the note
text context has no comment rule. A comment after a statement is read so:
`A --> B # c`, `A --> B %% c`, and `A --> B%% c` have the transition from A to B
and a comment. [fixture: state/lex-hash-comment-after-statement] [fixture:
state/lex-percent-comment-after-statement] [fixture:
state/lex-percent-comment-in-id] [fixture: state/lex-alias-comment-after-id]
[fixture: state/lex-floating-note-id-comment]

A diagram comment runs from its **mark** to the line feed, also past a comment
line that follows a U+2028 or U+2029 on its line, whose comment region then cuts
it in two: `A %% x`, U+2029, a line `%% end`, and a line `B` have the only state
A. [fixture: state/lex-diagram-comment-across-comment-line] The mark is `#` when
the comment starts with `#`, and `%%` when it starts with `%%`, and its value is
the text after the mark. The value of `# c` and of `%% c` is a space and `c`,
and that of `%%% c` is `%`, a space, and `c`. A comment in an id starts at the
`%%` where the id ends: `B%% c` is the state B and a comment whose value is a
space and `c`. [fixture: state/lex-comment-percent-three] The mark is found in
the text without directives, as the lexer reads it, and the value is the source
text after the mark, directives included: in `A --> B %%%{init: {}}%%% c`, the
text without the directive is `A --> B %% c`, so the mark is the first and the
last `%`, and the value is a space and `c`; the value of the comment
`# x%%{init: {}}%%y` is a space and `x%%{init: {}}%%y`. [fixture:
state/lex-comment-directive-between-marks] [fixture:
state/lex-hash-comment-directive-inside]

Inside the other units, `#` and `%%` are characters of the text: a description,
a transition label, a note text, the styles of `classDef` and `style`, the css
class of `class`, a title, a description, a pseudostate name, and a string.
`A : x %% c` gives A the description `x %% c`, `A --> B : x %% c` has the label
`x %% c`, and `state "a%%b" as A` has the description `a%%b`. [fixture:
state/lex-percent-in-description] [fixture: state/lex-hash-in-description]
[fixture: state/lex-percent-in-label] [fixture: state/lex-percent-in-note]
[fixture: state/lex-classdef-percent] [fixture:
state/lex-alias-percent-in-string] [fixture: state/lex-style-percent] [fixture:
state/lex-class-css-class-percent] [fixture: state/lex-pseudostate-name-percent]
Within an id, `#` is a character: `A#1` is a state. [fixture:
state/lex-hash-in-id] An entity is read as its placeholder before the lexer
reads the text (see [Entities](../common.md#entities)), so `#amp;` starts no
comment: `A --> B #amp; x` adds the states `ﬂ°amp¶ß` and `x`. [fixture:
state/lex-entity-in-id]

The documentation of mermaid.js says, under
[Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/stateDiagram.md#L307-L320),
that "any text after their start to the next newline will be treated as a
comment" and that comments "can be on their own line or at the end of a
statement"; after a description, a label, or a note text, `%%` is part of the
text instead. Issue [#7090](https://github.com/mermaid-js/mermaid/issues/7090),
"state diagram: comments are not on their own line", listed such differences
between the documentation and the lexer, among them `s2: %% not a comment !!!`.
On 2026-02-27 a collaborator answered, in a reply marked as written by a bot,
that comments should not work inline with transitions, and approved it as a bug.
Pull request [#7520](https://github.com/mermaid-js/mermaid/pull/7520) first
restricted comments to their own lines; on 2026-04-13, a reply marked as written
by a bot asked instead that the lexer recognize `%%` as a comment start "both at
the beginning of a line and inline (anywhere on a line, outside of the
`%%{...}%%` directive syntax)", and the pull request was merged on 2026-04-21
with comments after an id and the documentation above. Its tests cover comments
after an id only. The issue is closed.

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `id`, stands for one unit with that
name, and text in double quotes stands for the unit named by that text, such as
`"state"` or `"{"`. `end-of-text` stands for the end of the text. `string`
stands for a `string` unit that is not empty, and `string-or-empty` for a
`string` unit that may be empty. The grammar is a restatement of the grammar in
[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L178-L352)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in
[ast/state.md](../ast/state.md):

| Rule                                                                                                            | Node                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                                                       | StateDiagram                                                                                                                                |
| `definition-statement`                                                                                          | StateDefinitionStatement                                                                                                                    |
| `transition-statement`                                                                                          | StateTransitionStatement                                                                                                                    |
| `state-reference`                                                                                               | StateReference; its `"[*]"` a StateTerminal                                                                                                 |
| `composite-statement`                                                                                           | StateCompositeStatement                                                                                                                     |
| `alias-statement`                                                                                               | StateAliasDefinitionStatement                                                                                                               |
| `pseudostate-statement`                                                                                         | StatePseudostateDefinitionStatement                                                                                                         |
| `ignored-statement`                                                                                             | StateIgnoredStatement                                                                                                                       |
| `"--"`                                                                                                          | StateDividerStatement                                                                                                                       |
| `note-statement`                                                                                                | StateNoteStatement                                                                                                                          |
| `floating-note-statement`                                                                                       | StateFloatingNoteStatement                                                                                                                  |
| `click-statement`                                                                                               | StateClickStatement                                                                                                                         |
| `empty-description-block`                                                                                       | StateAccDescrBlockStatement without text, a statement after the statement before it; before the `{` of a body, part of the `textBeforeBody` |
| `class-def-statement`                                                                                           | StateClassDefStatement                                                                                                                      |
| `class-statement`                                                                                               | StateClassStatement                                                                                                                         |
| `style-statement`                                                                                               | StateStyleStatement                                                                                                                         |
| `direction-statement`                                                                                           | StateDirectionStatement, with a StateIgnoredText for each `direction-text`                                                                  |
| `accessibility-statement`                                                                                       | StateAccTitleStatement, StateAccDescrStatement, or StateAccDescrBlockStatement                                                              |
| `scale-statement`                                                                                               | StateScaleStatement                                                                                                                         |
| `"hide" "empty" "description"`                                                                                  | StateHideEmptyDescriptionStatement                                                                                                          |
| `string` or `string-or-empty`                                                                                   | StringLiteral                                                                                                                               |
| `number`                                                                                                        | NumericLiteral                                                                                                                              |
| a name, listed below                                                                                            | Identifier                                                                                                                                  |
| a text without quotes, listed below                                                                             | StateLiteral                                                                                                                                |
| the empty strings, empty description blocks, `ignored-state` units, and `ignored-text` before the `{` of a body | one StateIgnoredText together, the `textBeforeBody` of the statement                                                                        |
| `ignored-text`, `ignored-state`, or a run of `empty-string` units elsewhere in another statement                | StateIgnoredText                                                                                                                            |

The names are an `id`, a `state-name`, a `class-name`, and a `note-id`. The
texts without quotes are the text of a `description` after its `:`, an
`alias-id`, a `second-description`, a `pseudostate-name`, a `note-text`, a
`floating-note-text`, a `floating-note-id`, a `style-text`, a `css-class`, and a
`title-text`, `description-text`, or `description-block-text`. After two or more
whitespace characters, the `:` unit of a note on one line and the `note-text`
unit after it are one text together: the StateLiteral of `note left of A  :hi`
is `:hi` (see [StateNoteStatement](../ast/state.md#statenotestatement)).
[fixture: state/lex-note-two-spaces-before-colon] [fixture:
state/lex-note-three-spaces-before-colon]

### Diagram and statements

```text
diagram    = newline* "header" line*
line       = statement | newline
statement  = definition-statement
           | transition-statement
           | composite-statement
           | alias-statement
           | pseudostate-statement
           | ignored-statement
           | "--"
           | note-statement
           | floating-note-statement
           | click-statement statement-end
           | class-def-statement
           | class-statement
           | style-statement
           | direction-statement
           | accessibility-statement
           | scale-statement
           | "hide" "empty" "description"
```

Nothing separates two statements: a statement may follow another on the same
line, and a `newline` unit between them is a `line` of its own.
`A --> B C --> D` has two transitions, and `A B` adds two states. [fixture:
state/lex-two-transitions-one-line] [fixture: state/lex-two-states-one-line] A
`;` is no separator but a character of an id (see
[The statement context](#the-statement-context)). The units `"--"` come only
from a composite body (see
[The composite body context](#the-composite-body-context)).

### Empty description blocks before a separator

```text
statement-end           = empty-description-block* ( newline | end-of-text )
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `description-block-text` unit. A statement that
needs a separator ends with a `statement-end`: after its last unit and before
its separator, any number of empty description blocks may come. Each is a
description block statement without text, a statement of its own after that
statement, and changes nothing. mermaid.js reads no token for an empty
description block (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)), so it
reads the statement as followed directly by its separator. A description block
with text and any other statement may not come before the separator.

In state, nothing separates two statements, so a statement starts right after
each one, and the only statement that needs a separator, a line break or the end
of the text, is a click statement (see [Click statements](#click-statements)).
So `click A "u" "t" accDescr {}` is a click statement and an empty description
block statement. Whitespace before the block is read alone, so the line break
after the block is the `newline` unit of the click statement:
`click A href "u"`, two spaces, `accDescr {}`, and a line break is accepted,
while without the block the spaces and the line break are read together, which
leaves no `newline` unit, and the input is rejected.
`click A "u" "t" accDescr {x}` and `click A "u" "t" accDescr {} B` are rejected,
as in mermaid.js. [fixture: state/gram-click-empty-description-block-after]
[fixture: state/gram-click-empty-description-blocks-after] [fixture:
state/gram-click-spaces-then-empty-description-block] [fixture:
state/gram-click-after-statement-then-empty-description-block] [fixture:
state/gram-click-description-block-with-text-after] [fixture:
state/gram-click-empty-description-block-then-statement] [fixture:
state/lex-click-spaces-before-line-feed]

A statement may start right after the header, on its line (see
[Detection](#detection)), so an empty description block there needs no rule of
its own: it lies where a statement starts and is the first statement of the
diagram. `stateDiagram-v2 accDescr {}`, a line break, and `A --> B` is accepted,
as in mermaid.js. [fixture: state/header-empty-description-block]

### States and transitions

```text
definition-statement = state-reference description?
transition-statement = state-reference "-->" state-reference description?
state-reference      = ( id | "[*]" ) ( ":::" id )?
```

A state is written by its id, or as `[*]`, the start or the end. A `description`
after a state is its description, and after a transition, the label of the
transition. The second state of a transition is on the line of the arrow:
`A -->`, a line break, and `B` is rejected. [fixture:
state/gram-transition-line-feed-after-arrow] `:::` and an id give the state a
class, with whitespace around `:::` or not. [fixture:
state/gram-style-separator-spaces] [fixture:
state/gram-style-separator-transition] [fixture:
state/gram-terminal-style-separator] `[*]` alone is a statement, and `[*]x` is
`[*]` and the state x. [fixture: state/gram-terminal-alone] [fixture:
state/gram-terminal-then-id]

### Composite states, aliases, and pseudostates

```text
composite-statement   = "state"
                                            | "state"? empty-string* state-name ( empty-string* empty-description-block* ( ignored-state empty-string* )* ignored-text? "{" line* "}" )?
ignored-statement     = empty-string+
alias-statement       = "state"? empty-string* string empty-string* "as" alias-id? ( ":" second-description? ignored-text? )? ( empty-description-block* ( ignored-state empty-string* )* ignored-text? "{" line* "}" )?
pseudostate-statement = "state"? pseudostate-name? pseudostate-mark
pseudostate-mark      = "<<fork>>" | "<<join>>" | "<<choice>>" | "[[fork]]" | "[[join]]" | "[[choice]]"
```

The units of these statements come from the state context, which `state` enters
(see [The state context](#the-state-context)). The `state` unit belongs to the
first statement that the state context reads, and the statements after it in the
same context have none: `state a b` is two composite statements, the second
without `state`. [fixture: state/lex-state-two-names] An `ignored-text` before
the `{` of a body is a `%%` that mermaid.js does not read: on the line after the
name, or after `as` (see [The state context](#the-state-context)). [fixture:
state/gram-ignored-percent-before-body-next-line] [fixture:
state/gram-ignored-percent-before-alias-body-next-line] [fixture:
state/lex-alias-id-ignored-percent-before-body] An alias statement has a `:`, a
`second-description`, and an `ignored-text` after them only without a body (see
[The alias id context](#the-state-context)).

When the `{` of a body is on the line after the name or the alias id, empty
description blocks may come before it on its line, with whitespace around them,
also before a `%%` there: mermaid.js reads no token for them, so the `{` still
starts the body. They are part of the `textBeforeBody` of the statement, the
text before the `{` that mermaid.js does not read, with the empty strings and
the `%%` there. So `state "d" as A`, a line break, and `accDescr {} {` with a
body is accepted, with the Db of the same without the block, and so are two
blocks, a block followed by `%%{}`, and a comment line between the two lines;
`state "d" as A : x` followed by `accDescr {}{` keeps `A : x` whole, as without
the block, and after `state X ""` or `state X %% c`, a block before the `{` on
the next line is the `textBeforeBody` of X. The blocks must be on the line of
the `{`: a block on a line of its own, followed by a line `{`, is a statement
after which the `{` starts no body, and on the line of the alias id the block is
part of the alias id; both inputs are rejected, as in mermaid.js. After
`state X`, a line break, and `accDescr {} {`, rule 7 of the state context reads
`accDescr` as a second word and rejects the input, as mermaid.js does. A
description block with text before the `{` is rejected by both. [fixture:
state/gram-empty-description-block-before-alias-body-next-line] [fixture:
state/gram-empty-description-block-before-alias-colon-body-next-line] [fixture:
state/gram-empty-description-block-after-empty-string-before-body] [fixture:
state/gram-empty-description-block-after-comment-before-body] [fixture:
state/gram-empty-description-blocks-before-alias-body-next-line] [fixture:
state/gram-empty-description-block-before-ignored-percent-body] [fixture:
state/gram-empty-description-block-after-comment-line-before-body] [fixture:
state/gram-empty-description-block-before-body-second-word] [fixture:
state/gram-empty-description-block-line-before-body] [fixture:
state/gram-empty-description-block-same-line-before-alias-body] [fixture:
state/gram-description-block-with-text-before-body]

After the empty description blocks, an `ignored-state` unit (rule 17 of the
statement context) may come before that `{`, with empty strings after it, and is
part of the `textBeforeBody` too: after `state X ""`, `state X %% c`,
`state "d" as A`, or `state "d" as A : x`, which it keeps whole, a line
`state {` starts the body of that statement. The whitespace after `state` holds
line feeds, so `state`, a line break or an empty line, and `{` do the same, and
so does `state %% c` followed by a line `{`. Several `ignored-state` units may
follow one another, as mermaid.js reads no token for any of them: after
`state "d" as A : x`, the lines `state %% c`, `state "" ""`, and `{` with a body
start the body of A, and so do `state %% c` and a line `state {`, also after
`state X` and in a composite body, and a `state` before the `%%` of a line
`%%{ }%%{`. Without a `{` after them, they are `state` statements, and an empty
line between them is a `newline` unit, after which the input is rejected, as in
mermaid.js. [fixture: state/gram-ignored-states-two-before-alias-body] [fixture:
state/gram-ignored-states-three-before-alias-body] [fixture:
state/gram-ignored-states-empty-strings-then-comment] [fixture:
state/gram-ignored-states-whitespace-line-between] [fixture:
state/gram-ignored-states-then-state-brace] [fixture:
state/gram-ignored-states-before-composite-body] [fixture:
state/gram-ignored-states-in-composite-body] [fixture:
state/gram-ignored-state-before-ignored-percent] [fixture:
state/gram-ignored-states-empty-line-between-rejected] [fixture:
state/gram-ignored-states-after-plain-name-rejected] [fixture:
state/gram-state-comment-lines-then-statement] In the statement context, an
empty line after the line of the name is a `newline` unit (rule 6), and the
grammar takes no `newline` unit before the `{` of a body, so the `ignored-state`
unit after it is taken by no rule, and the input is rejected, as in mermaid.js.
A line of only whitespace is no `newline` unit, because rule 7 reads it with its
line feed and with the empty lines after it, so after it a `{` or `state {`
still starts the body; only an empty line right after the line of the name is a
`newline` unit. [fixture:
state/gram-composite-whitespace-line-then-empty-line-before-body] [fixture:
state/gram-composite-empty-line-then-whitespace-line-before-body-rejected] An
empty line between the comment after `state` and the `{` is a `newline` unit
after `state`, which is then a `state` unit, and the input is rejected. In a
composite body, where a line feed makes no unit, an empty line after the name
changes nothing, while the composite body context has no rule for `{`: a `{` on
a line after the name is rejected, whatever lies between, and only `state {`
starts the body there. [fixture:
state/gram-composite-brace-next-line-in-composite-body-rejected] The `state` of
`state X`, a line break, and `state {` is the second word of rule 7 of the state
context, which rejects the input. [fixture:
state/gram-ignored-state-before-body-next-line] [fixture:
state/gram-ignored-state-after-comment-before-body] [fixture:
state/gram-ignored-state-before-alias-body-next-line] [fixture:
state/gram-ignored-state-before-alias-colon-body-next-line] [fixture:
state/gram-ignored-state-after-empty-description-block] [fixture:
state/gram-ignored-state-empty-string-before-brace] [fixture:
state/gram-ignored-state-empty-body] [fixture:
state/gram-ignored-state-line-feed-before-brace] [fixture:
state/gram-ignored-state-blank-line-before-brace] [fixture:
state/gram-ignored-state-comment-before-brace] [fixture:
state/gram-ignored-state-in-composite-body] [fixture:
state/gram-ignored-state-blank-line-after-name-in-composite-body] [fixture:
state/gram-ignored-state-after-hash-comment-before-body] [fixture:
state/gram-ignored-state-directive-before-brace] [fixture:
state/gram-ignored-state-upper-case] [fixture:
state/gram-ignored-state-empty-strings-before-brace] [fixture:
state/gram-ignored-state-after-whitespace-line] [fixture:
state/gram-composite-whitespace-line-before-body] [fixture:
state/gram-ignored-state-empty-line-after-alias-in-composite-body] [fixture:
state/gram-ignored-state-after-plain-name-rejected] [fixture:
state/gram-ignored-state-blank-line-after-name-rejected] [fixture:
state/gram-ignored-state-comment-blank-line-rejected] [fixture:
state/gram-ignored-state-comment-blank-line-in-composite-body-rejected]
[fixture: state/gram-ignored-state-after-definition-rejected] [fixture:
state/gram-ignored-state-at-start-rejected] [fixture:
state/lex-state-glued-brace-rejected]

The `empty-string` units come from the state context too, where a unit starts
(see [The state string context](#the-state-context)). mermaid.js does not read
them, and each run of them, with only whitespace between them, is one node in
the tree, a StateIgnoredText in a field or a StateIgnoredStatement: before a
name, the `textBeforeId` of its composite statement, also when it follows
another statement on the line; [fixture:
state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-strings-before-name] [fixture:
state/gram-state-empty-strings-adjacent] [fixture:
state/gram-state-empty-string-before-word-starting-with-as] [fixture:
state/gram-state-empty-string-before-name-with-body] [fixture:
state/gram-state-empty-string-between-names] before the `{` of a body, the
`textBeforeBody`, which also holds a `%%` on the next line before the `{`, one
StateIgnoredText from the first empty string to the `%%`; [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-state-empty-string-after-name-body-next-line] [fixture:
state/gram-state-empty-string-then-percent-before-body] [fixture:
state/gram-state-empty-strings-before-and-after-name] before and after the
string of an alias statement, its `textBeforeDescription` and
`textAfterDescription`; [fixture:
state/gram-state-empty-string-before-alias-string] [fixture:
state/gram-state-empty-strings-before-alias-string] [fixture:
state/gram-state-empty-string-after-alias-string] [fixture:
state/gram-state-empty-string-after-alias-string-glued] [fixture:
state/gram-state-empty-strings-around-alias-string] and where no name, no
string, and no `{` of a body follows it, after `state` or after a statement, an
`ignored-statement`, a StateIgnoredStatement: `state ""` is the statement
`state` and such a statement, and so is `state x ""`, with the statement x,
while `state x ""` or `state x "" %% c` followed by a line `{` has the empty
string as the `textBeforeBody` of x. A run of empty strings that a name, a
string, or a body follows belongs to that statement, never to an
`ignored-statement`. [fixture: state/gram-state-empty-string-alone] [fixture:
state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-before-comment] [fixture:
state/gram-state-empty-string-after-name-body-next-line] [fixture:
state/gram-state-empty-string-before-comment-body-next-line] So the empty
strings are accepted wherever they lie in the state context, as in mermaid.js,
and they change nothing in the Db.

### Notes

```text
note-statement          = "note" position "of" ignored-text? note-id? ( ":" ignored-text? note-text? | note-text? "end" "note" )
floating-note-statement = "note" '"'+ floating-note-text '"'+ "as" floating-note-id?
```

### Click statements

```text
click-statement = "click" state-reference ( string-or-empty string-or-empty | "href" string-or-empty )
```

A click statement needs a line break after it, or the end of the text, with
nothing but empty description blocks between (see
[Empty description blocks before a separator](#empty-description-blocks-before-a-separator)):
`click A "u" "t" B` is rejected, and so is `click A href` without a string.
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href] [fixture:
state/gram-click-trailing-word] [fixture: state/gram-click-href-at-end]
[fixture: state/lex-click-at-end] The state may be `[*]`, and the strings may be
empty: `click A "" ""` is accepted. [fixture: state/gram-click-terminal]
[fixture: state/lex-click-empty-strings] Like any statement, a click statement
may follow another statement on its line: `A click A href "u"`,
`A --> B click A "u" "t"`, and `accDescr {} click A href "u"` are accepted.
[fixture: state/gram-click-after-statement] [fixture:
state/gram-click-after-transition] [fixture:
state/gram-click-after-empty-description-block]

### Other statements

```text
class-def-statement     = "classDef" class-name styles
class-statement         = "class" id ( id-comma id )* css-class?
style-statement         = "style" id? ( id-comma id? )* styles
styles                  = style-text? ( "," style-text? )*
direction-statement     = direction-text? "direction" direction-value direction-text?
accessibility-statement = "accTitle" ":" title-text?
                        | "accDescr" ":" description-text?
                        | "accDescr" "{" description-block-text? ( "}" | end-of-text )
scale-statement         = "scale" number "width"
```

`scale` and `hide empty description` are statements that change nothing in the
Db. [fixture: state/gram-scale] [fixture: state/gram-hide-empty-description] A
statement starts where the text of a `line` starts and right after each
statement, also on the same line, because nothing separates two statements. An
empty description block where a statement starts is a description block
statement: `accDescr {}` followed by `A`, and `A --> B accDescr {}`,
`A accDescr {}`, `[*] accDescr {}`, and `accDescr {}accDescr {}`, are statements
followed or preceded by a description block statement. A block lies inside a
statement instead, and the input is rejected (see
[Known divergences](#known-divergences)), where the unit after it continues the
statement before it: a `-->`, a `:::`, or a description after a state reference.
Blocks written one after another, with only whitespace between them, are decided
together, by the unit after the last of them: in `A accDescr {} accDescr {} : x`
and `A accDescr {} accDescr {} --> B` both blocks lie inside the statement A.
[fixture: state/div-empty-description-blocks-before-label] [fixture:
state/div-empty-description-blocks-before-arrow] So `A accDescr {} --> B`,
`A accDescr {} : x`, `A accDescr {} :::c --> B`, and `A --> B accDescr {} : x`
are rejected, and so is a block between the units of a statement, as in
`A --> accDescr {} B`. [fixture: state/gram-empty-description-block-statement]
[fixture: state/gram-empty-description-block-after-transition] [fixture:
state/gram-empty-description-block-after-definition] [fixture:
state/gram-empty-description-block-after-terminal] [fixture:
state/gram-empty-description-blocks-adjacent] [fixture:
state/gram-empty-description-block-after-transition-keeps] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-description] [fixture:
state/div-empty-description-block-before-class] [fixture:
state/div-empty-description-block-before-label] [fixture:
state/div-empty-description-block-after-arrow]

### Rejections outside the grammar

- A state with a body and more than one description, among those of all the
  statements that give the state a description, wherever they lie: mermaid
  throws "Group nodes can only have label". The statements of a state are those
  whose state has its **id**. The id of a state is the name of its Identifier,
  or the value of its StateLiteral. A StateTerminal before the arrow of a
  transition, or alone in a definition statement, has the id of the composite
  state or region that it lies in, or `root` at the top level, followed by
  `_start`; after the arrow, followed by `_end`. Two of them with the same id
  are one state. [fixture: state/gram-terminal-alone] [fixture:
  state/db-nested-terminals] [fixture: state/db-root-start-shared] A state named
  `[*]` in a composite statement, an alias definition, a pseudostate definition,
  or a note statement has the id that a StateTerminal before the arrow has
  there: `state [*] {` with a body defines the composite state `root_start`, or
  `Y_start` in the body of Y, and `note left of [*] : x` is a note on
  `root_start`, while `state [*]x {` defines `[*]x`. [fixture:
  state/db-composite-id-terminal] [fixture:
  state/db-composite-id-terminal-nested] [fixture:
  state/db-composite-id-terminal-after-empty-string] [fixture:
  state/db-composite-id-terminal-then-transition] [fixture:
  state/db-alias-id-terminal] [fixture: state/db-pseudostate-id-terminal]
  [fixture: state/db-note-id-terminal] [fixture:
  state/db-note-id-terminal-block] [fixture: state/db-note-id-terminal-region]
  [fixture: state/db-composite-id-terminal-prefix] A composite body is
  **divided** when it has divider statements and its last statement is not one:
  each divider statement then closes a **region** of the statements since the
  previous divider statement or the start of the body, which may be none, and
  the statements after the last divider statement are one more region. A comment
  is no statement, and a direction statement is one. A region is a state with a
  body, and the composite state or region that a StateTerminal lies in may be a
  region. Each divider statement has the id `divider-id-` followed by its number
  among all the divider statements of the text, in source order, counted from 1,
  also in a body that is not divided, where it is a state without a body; a
  region that a divider statement closes has the id of that divider statement.
  The last region has an id that mermaid.js makes at random; this specification
  takes it as an id that no state written in the text has, also one written with
  spaces in an alias definition. So in `state X {` with `state [*] {` and a
  body, `--`, and `C`, the inner composite state is `divider-id-1_start`, and
  two alias definitions for that id at the top level make the input rejected, as
  do two for `divider-id-1`, the region; with a body that has a divider
  statement before X, the divider statement of X is `divider-id-2`, also when
  that body is not divided; and `[*]` in the last region, or in a body whose
  last statement is the divider statement, is neither. [fixture:
  state/gram-region-terminal-composite-two-descriptions] [fixture:
  state/db-region-terminal-composite-one-description] [fixture:
  state/db-region-terminal-composite-other-number] [fixture:
  state/gram-region-terminal-composite-second-divider] [fixture:
  state/db-region-terminal-composite-first-divider-elsewhere] [fixture:
  state/gram-region-divider-number-undivided-body] [fixture:
  state/gram-region-two-descriptions] [fixture: state/db-region-one-description]
  [fixture: state/db-last-region-terminal-composite] [fixture:
  state/db-last-region-alias-with-spaces] [fixture:
  state/db-undivided-body-terminal-composite] [fixture:
  state/db-divider-state-two-descriptions] [fixture:
  state/lex-composite-divider] [fixture: state/db-divider-first-then-state]
  [fixture: state/db-divider-then-direction] [fixture:
  state/db-divider-last-in-body] [fixture: state/db-divider-then-comment-only] A
  statement **gives a description** to its state when it is a definition
  statement whose description is not null, or an alias definition, except one
  without a body and without a `:` whose string is empty or all whitespace once
  the whitespace at its ends is left out; an alias definition with a `:` gives
  two. No other statement gives one. So `A : ` with a space after the `:`, and
  `state " " as A`, give no description, while `state " " as A : y` and
  `state " " as A` with a body do. [fixture: state/gram-description-blank]
  [fixture: state/db-description-blank-after-description] [fixture:
  state/db-alias-blank-without-body] [fixture:
  state/db-alias-blank-second-description] [fixture:
  state/db-alias-body-blank-description] So `state [*] {` with a body and the
  definition statements `[*] : a` and `[*] : b` at the top level are rejected,
  while the same two in the body of another composite state describe its start.
  [fixture: state/db-composite-one-description] [fixture:
  state/db-composite-two-descriptions] [fixture:
  state/db-composite-one-description-then-body] [fixture:
  state/db-composite-alias-body-one-description] [fixture:
  state/db-composite-blank-description-then-description] [fixture:
  state/db-composite-blank-alias-then-description] [fixture:
  state/db-composite-terminal-descriptions-in-other-composite] [fixture:
  state/gram-composite-alias-colon-then-body] [fixture:
  state/gram-composite-blank-alias-colon-then-body] [fixture:
  state/gram-composite-descriptions-equal-to-id] [fixture:
  state/gram-composite-descriptions-after-body] [fixture:
  state/gram-composite-description-in-other-composite] [fixture:
  state/gram-composite-terminal-two-descriptions]
- Two words between `state` and `{` (see
  [The state context](#the-state-context)), which the lexer rejects. [fixture:
  state/lex-state-two-names-body]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a unit other than a text unit and a string unit makes the
  input rejected in this specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): inside a keyword, a name
  unit, `:::`, `[*]`, a pseudostate mark, the divider `--`, or an arrow.
  [fixture: state/div-directive-in-keyword] [fixture: state/div-directive-in-id]
  [fixture: state/div-directive-in-arrow] [fixture:
  state/div-directive-in-state-name] [fixture:
  state/div-directive-in-class-name] [fixture: state/div-directive-in-note-id]
  [fixture: state/div-directive-in-class-separator] [fixture:
  state/div-directive-in-terminal] [fixture:
  state/div-directive-in-pseudostate-mark] [fixture:
  state/div-directive-in-divider]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule, an ignored `;` inside a unit other
  than a text unit and a string unit makes the input rejected here, while
  mermaid.js accepts it: the name after `state` may hold `style`, a `:`, and a
  `#`, so in `state style:#x;B`, with a body or without, the ignored `;` lies
  inside the name. With a body, mermaid.js reads the composite state
  `style:#xB`; without one, it accepts the input, which adds nothing. [fixture:
  state/div-ignored-semicolon-in-state-name] [fixture:
  state/div-ignored-semicolon-in-state-name-without-body]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `A : b="c">d` gives A the description
  `b='c'>d` in mermaid.js and `b="c">d` in this specification. [fixture:
  state/div-html-tag-starts-in-frontmatter-description]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: state/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty description block inside a statement makes the input rejected in this
  specification, while mermaid.js reads no token for it and accepts the input:
  `A accDescr {} --> B`, where the `-->` after the block continues the statement
  `A`, so that the block lies inside the transition, as in `A accDescr {} : x`,
  `A accDescr {} :::c --> B`, `A --> B accDescr {} : x`, and
  `A --> B accDescr {} :::c`, and `A --> accDescr {} B`. An empty description
  block where a statement starts, also right after another statement on the same
  line, is a description block statement without text, which changes nothing:
  `A --> B accDescr {}` is accepted. A block before the `{` of a body on the
  line after the name is part of the `textBeforeBody` of the statement, and is
  accepted too (see
  [Composite states, aliases, and pseudostates](#composite-states-aliases-and-pseudostates)).
  [fixture: state/div-empty-description-block-in-transition] [fixture:
  state/div-empty-description-block-after-arrow] [fixture:
  state/div-empty-description-block-before-description] [fixture:
  state/div-empty-description-block-before-class] [fixture:
  state/div-empty-description-block-before-label] [fixture:
  state/div-empty-description-block-before-target-class] [fixture:
  state/gram-empty-description-block-statement] [fixture:
  state/gram-empty-description-block-after-transition] So is a block between
  `:::` and the class, next to `[*]` in a transition, and inside a click
  statement, as in `click A "u" accDescr {} "t"` (see
  [tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md) for the
  rule and more examples). [fixture:
  state/div-empty-description-block-after-class-separator] [fixture:
  state/div-empty-description-block-terminal-before-arrow] [fixture:
  state/div-empty-description-block-before-terminal-target] [fixture:
  state/div-empty-description-block-in-click-before-id] [fixture:
  state/div-empty-description-block-in-click-before-url] [fixture:
  state/div-empty-description-block-in-click-after-href] [fixture:
  state/div-empty-description-block-in-click-before-tooltip]
