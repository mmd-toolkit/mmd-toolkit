# Building the state Db from the tree

Japanese version: [state.ja.md](./state.ja.md)

The steps that build the Db summary of a state diagram from its tree, which
`src/db-from-tree/state.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in [diagrams/state.md](../../../spec/docs/diagrams/state.md)
and [ast/state.md](../../../spec/docs/ast/state.md).

mermaid.js builds the data that it draws, a list of nodes and a list of edges,
while it parses
([`StateDB.extract`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L249-L302),
[`dataFetcher`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L241-L477)).
The summary is taken from that data, from the class definitions, and from the
links. Values are kept as the Db holds them, whitespace included; the only
change is to the id that mermaid.js makes at random for the last region of a
composite state (see below).

## Building the summary from the tree

Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in an id as in a text: `A#amp; --> B` has a transition from the
state `Aﬂ°amp¶ß`, and `A : x#amp;y` gives A the description `xﬂ°amp¶ßy`. The
same holds in a title, a style, a class definition, a URL, and the name of a
pseudostate. The same form has each line terminator, `\r\n` and a lone `\r` too,
as `\n`, and each attribute quote as `'`; U+2028 is no line terminator and stays
in a value. [fixture: state/lex-entity-in-id] [fixture:
state/db-transition-id-entity] [fixture: state/db-state-alias-id-entity]
[fixture: state/db-description-entity] [fixture: state/db-note-text-entity]
[fixture: state/db-transition-label-entity] [fixture:
state/db-state-string-entity] [fixture: state/db-acc-title-entity] [fixture:
state/db-style-entity] [fixture: state/db-classdef-entity] [fixture:
state/db-click-url-entity] [fixture: state/db-pseudostate-id-entity] [fixture:
state/db-description-attribute-quote] [fixture:
state/db-state-string-attribute-quote] [fixture: state/db-acc-descr-block-crlf]
[fixture: state/db-acc-descr-block-lone-cr] [fixture: state/db-note-block-crlf]
[fixture: state/db-description-line-separator]

**Ids.** The id of a state is the one that
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)
defines, and two states with the same id are one state.

**Regions.** Divided bodies, regions, and the ids of divider statements and
regions are those that
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)
defines. mermaid.js gives the last region an id made at random; the summary has
`generated-region-` followed by the number of that region among such regions, in
the order of the nodes, counted from 1, wherever the id appears. So in
`state X {` with a body that holds `state Y {` with a divider statement, and a
divider statement of its own, the last region of Y is `generated-region-1` and
that of X is `generated-region-2`, as the node of the first comes first in the
list; and the end state of a last region has the id `generated-region-1_end`. A
state that an author writes with the id `generated-region-1` is not told apart
from that region in the summary, which has the two under one id. A divider state
or a region that a definition describes by its id (`state "a" as divider-id-1`)
has the label and the descriptions of those definitions, as any state does; one
that no definition describes has the empty label and no `description`. [fixture:
state/db-last-region-alias-with-spaces] [fixture:
state/db-last-region-terminal-composite] [fixture:
state/db-last-region-numbers-follow-node-order] [fixture:
state/db-last-region-terminal-end] [fixture:
state/db-divider-state-two-descriptions] [fixture:
state/db-divider-state-one-description] [fixture:
state/db-region-one-description]

**The walk.** The nodes and the transitions are made by a walk over the
statements of the body, in order, with a **parent**: none at the top level, and
the composite state or region whose body is walked otherwise. A statement adds
these:

- A definition statement visits its state, with its description.
- A transition statement visits its `from` state and its `to` state, and then
  adds a transition: `start` and `end` their ids, and `label` the value of its
  label, or the empty text.
- A composite statement with a body, an alias definition, and a pseudostate
  definition visit their state. The description of an alias definition is the
  value of its string without the whitespace at its ends, U+2028 included, or,
  with a body, the text of the string between its quotes, whitespace included;
  an alias definition with a `:` has a second description, the value of its
  `secondDescription`, whitespace included, or the empty text when it has none:
  `state "d" as A :` gives A the descriptions `d` and the empty text. A
  pseudostate definition visits its state with the shape of its kind. [fixture:
  state/db-alias-description-trimmed] [fixture:
  state/db-alias-body-description-untrimmed] [fixture:
  state/lex-alias-second-description] [fixture:
  state/db-alias-colon-empty-second] [fixture:
  state/db-alias-colon-spaces-second] [fixture:
  state/db-alias-description-trimmed-line-separator]
- A note statement visits its state, and adds a note.
- A body that is divided is walked as its regions: each region is visited as a
  state of the composite state, with the shape `divider`, and its statements are
  walked with the region as their parent. Any other body is walked as it is, and
  each divider statement in it visits the state of its id, without a body: so
  `state A {`, `B`, `--`, and `}` gives B the parent A, and the state
  `divider-id-1` in A after it, with the shape `divider` and no `dir`. A
  directive, a comment line, an empty line, and a U+2028 after the last divider
  statement are no statements, so they leave the body not divided, while a
  `style` statement is one and makes it divided, with a last region that has no
  states. A second body of a composite state is walked as the first is, and adds
  its regions to the state, with the next numbers: after a first body with `B`,
  `--`, and `C`, a second body with `D`, `--`, and `E` adds `divider-id-2` and
  `generated-region-2` to A. [fixture: state/db-divider-last-in-body] [fixture:
  state/db-dividers-each-last] [fixture: state/db-divider-alone-in-body]
  [fixture: state/db-divider-then-directive] [fixture:
  state/db-divider-then-comment-line] [fixture:
  state/db-divider-then-empty-line] [fixture:
  state/db-divider-then-line-separator] [fixture: state/db-divider-then-style]
  [fixture: state/db-composite-divided-twice]
- No other statement adds a node: a composite statement without a body, a
  floating note, a click, classDef, class, or style statement, a direction, an
  accessibility, a scale, or a hide statement. A click, class, or style
  statement for an id that no statement visits adds no state. [fixture:
  state/lex-state-without-body] [fixture: state/lex-floating-note] [fixture:
  state/gram-scale] [fixture: state/gram-hide-empty-description] [fixture:
  state/db-click-undefined-state] [fixture: state/db-class-undefined-state]
  [fixture: state/db-style-undefined-state] A note statement visits its state,
  so it adds the state when no other statement does. [fixture:
  state/db-note-undefined-state]

Visiting a state adds a node with its id at the end of the list when there is
none, and otherwise updates that node where it is. A state with the empty id,
`</choice>`, or `</join></fork>` makes no node, also when a note statement, an
alias definition, or a composite state with a body visits it; a note adds its
record, with that id as its `state`. [fixture: state/lex-join-empty-id]
[fixture: state/db-choice-close-tag-id] [fixture: state/db-fork-close-tags-id]
[fixture: state/db-note-close-tag-id] [fixture: state/db-alias-close-tag-id]

A visit **has a description** when its statement gives the state a description,
as
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)
defines it, that is not the empty text. A visit sets:

- `parentId`: the id of the parent, when there is one, also when that id makes
  no node, as the empty id and `</choice>` do. A later visit in another
  composite state or region moves the state there, and a later visit at the top
  level leaves `parentId` as it is. [fixture: state/db-state-in-two-composites]
  [fixture: state/db-parent-kept-at-top-level] [fixture:
  state/db-parent-set-by-later-composite] [fixture: state/lex-alias-without-id]
  [fixture: state/db-composite-close-tag-parent]
- the **descriptions** of the state, which start as its id alone. The first
  visit with a description replaces them with the descriptions of the visit,
  also when one of them is the id; each later visit with a description adds its
  descriptions after the others, also when one of them is the id or the same as
  one there: `A : x`, `A : y`, and `A : z` give A the label `x` and the
  descriptions `y` and `z`. [fixture: state/db-description-id-alone] [fixture:
  state/db-description-equal-to-id] [fixture:
  state/db-description-id-after-description] [fixture:
  state/db-description-twice-same] [fixture: state/db-description-three-visits]
- `shape`: the first visit sets `stateStart` or `stateEnd` for a StateTerminal,
  `fork`, `join`, or `choice` for a pseudostate, `divider` for a region or a
  divider statement, nothing for a note statement, and `rect` otherwise; no
  later visit does so again. A visit with a description then sets
  `rectWithTitle` when the state has more than one description, and otherwise
  `roundedWithTitle` when an earlier visit had a body, or `rect`; so a start, a
  fork, or a divider statement with a description has the shape `rect`, and
  `state A {` with a body followed by `A : x` gives A the shape
  `roundedWithTitle`. The first visit with a body then sets `roundedWithTitle`,
  or `divider` for a region. [fixture: state/db-terminal-description] [fixture:
  state/db-fork-description] [fixture: state/db-fork-two-descriptions] [fixture:
  state/db-divider-state-one-description] [fixture:
  state/db-body-then-description] So a state that a note statement visits first
  has no shape until a visit with a description or a body: after
  `note left of A : x`, A has no shape when `A --> B`, `A`, or
  `state A <<fork>>` follows, the shape `rect` when `A : d` follows, and
  `roundedWithTitle` when `state A {` with a body follows, while `A` followed by
  the note gives `rect`. A note in a composite body visits its state with the
  composite state as its parent. [fixture: state/db-note-first-no-shape]
  [fixture: state/db-note-first-then-state] [fixture:
  state/db-note-first-then-fork] [fixture: state/db-note-first-then-description]
  [fixture: state/db-note-first-then-body] [fixture:
  state/db-note-after-state-shape] [fixture: state/db-note-in-composite]
- `dir`: the first visit with a body sets the direction of the last direction
  statement in that body, or `TB`, also when the body is empty; a later body
  does not change it. A direction statement in a nested body belongs to that
  body alone: `state A {` with `state B {`, `direction LR`, and `C` in it gives
  B `LR` and A `TB`. The direction statements of a body that is divided lie in
  its regions, so such a composite state has `TB`, and each region the direction
  of the last direction statement in it, or `TB`; a body that is not divided
  keeps them, and a divider statement has no `dir`. [fixture:
  state/lex-composite-state-before-direction] [fixture: state/db-dir-first-body]
  [fixture: state/db-dir-last-in-body] [fixture: state/db-dir-nested-body]
  [fixture: state/db-dir-first-body-empty] [fixture:
  state/db-composite-divider-dir] [fixture:
  state/db-divider-last-in-body-direction]

A note adds a record: `state` the id of the state, or the empty text when the
`note-id` is empty, which visits no state (see above), `position` the texts of
its two `Keyword` tokens `left` or `right` and `of`, as written, with the one
space between them that mermaid.js reads, and `text` the value of its text,
which is the text that mermaid.js reads (see
[The note contexts](../../../spec/docs/diagrams/state.md#the-note-contexts)), or
the empty text. So `note left of A:hi` has the text `i`. The text of a block
keeps the whitespace of its lines, and an empty line is a line: the lines `a`,
an empty line, and ` b` give `a`, two line feeds, and ` b`; a line that holds
only a directive keeps its whitespace, so the lines `a`, that line with one
space before the directive, and ` b` give `a`, a line feed, a space, a line
feed, and ` b`. [fixture: state/lex-note-mixed-case] [fixture:
state/lex-note-colon-without-space] [fixture:
state/lex-note-two-spaces-before-colon] [fixture: state/lex-note-block]
[fixture: state/lex-note-id-percent-block] [fixture:
state/db-note-block-empty-line] [fixture: state/db-note-block-directive-line]

After the walk, a state that had a visit with a description has the first of its
descriptions as `label` and the others as `description`, a list that is empty
when it has one description. Any other state has its id as `label` and no
`description`. A region and a divider statement have the empty label and no
`description`. [fixture: state/lex-composite-divider] A state with a body and
more than one description is rejected (see
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)).
[fixture: state/db-composite-two-descriptions] [fixture:
state/gram-region-two-descriptions]

**Classes and styles.** The `classes` and `styles` of a state come from the
statements at the top level only, and apply to a state of that id wherever it
lies:

- the `cssClass` of a StateReference in a transition, and each `class` statement
  for each of its states, add a class, in source order, also a class that the
  state has: `class A c` twice gives A `c` twice, and `A:::e --> B` followed by
  `class A c` gives `e` and `c`. The `cssClass` of a definition statement adds
  none, nor does that of a StateReference in a click statement, nor does that of
  a transition in a composite body: `A:::c --> B` in the body of P gives A no
  class. [fixture: state/db-classes-order] [fixture:
  state/db-classes-order-transition-first] [fixture: state/db-class-twice-same]
  [fixture: state/db-definition-css-class] [fixture:
  state/db-click-reference-css-class] [fixture:
  state/db-nested-transition-css-class] [fixture: state/db-class-before-state]
  [fixture: state/db-top-class-applies-nested] The class of a StateReference in
  a transition goes to the state of each part of its id divided at each `,`, and
  not to the state of an id with a `,`: `A,B:::e --> C` gives A and B the class
  e and `A,B` none, and `A,:::e --> B` gives A the class; an empty part, like an
  id that no statement visits, adds no state; a StateTerminal after the arrow
  takes the class too: `A --> [*]:::c` gives `root_end` the class `c`. [fixture:
  state/db-css-class-reference-comma] [fixture:
  state/db-css-class-reference-two-ids] [fixture:
  state/db-css-class-reference-comma-after-arrow] [fixture:
  state/db-css-class-reference-comma-undefined] [fixture:
  state/db-css-class-reference-comma-only] [fixture:
  state/db-css-class-terminal-end]
- a `style` statement sets the styles of each of its states, replacing earlier
  ones, also for a state that a later statement visits and a state in a
  composite body: the text after its ids, up to the end of the line, divided at
  each `,`, each part without every `;` in it, and then without the whitespace
  at its ends, empty parts included. These parts are the styles of the
  statement, the value of each, or the empty text for a null: `style A x,,y`
  gives `x`, the empty text, and `y`, `style A a;b;c` gives `abc`, and `style A`
  at the end of the text one empty style. The whitespace after the ids includes
  line feeds, so the text may start on a later line, after comment lines:
  `style A` followed by the line `B --> C` gives A the style `B --> C` and adds
  no transition, and `style A`, a comment line, and `B` give `B`. The text is
  read without its directives and without the `;` that the line rule ignores:
  `style A x %%{init: {}}%% ,y` gives `x` and `y`, `style A %%{init: {}}%%` one
  empty style, and `style A fill:#f00;` gives `fill:#f00`, while in
  `style A fill:#f00;b;c` only the last `;` is ignored, so that `#f00;` is an
  entity and the style is `fill:`, the placeholder of that entity, and `bc`.
  [fixture: state/db-style-replaced] [fixture: state/db-style-semicolons]
  [fixture: state/db-style-two-semicolons-in-part] [fixture:
  state/db-style-semicolon-after-space] [fixture: state/db-style-empty-items]
  [fixture: state/db-style-blank] [fixture: state/db-style-trailing-comma]
  [fixture: state/db-style-takes-next-line] [fixture:
  state/db-style-comment-line-before-styles] [fixture:
  state/db-style-directive-before-comma] [fixture:
  state/db-style-directive-only] [fixture: state/db-style-ignored-semicolon]
  [fixture: state/db-style-ignored-semicolon-last-only] [fixture:
  state/db-style-before-state] [fixture: state/db-top-style-applies-nested]

A `classDef`, `class`, or `style` statement in a composite body changes nothing.
[fixture: state/db-nested-class-statement] [fixture: state/db-nested-classdef]
[fixture: state/db-nested-style]

**Class definitions.** Each `classDef` statement at the top level adds its
styles to the class definition of its CSS class, which it adds when there is
none: the text after its class name, up to the end of the line, divided at each
`,`, each part without its first `;`, and then without the whitespace at its
ends, empty parts included, as for a `style` statement but for the `;`: a
`style` part loses every one, and a `classDef` part only its first, so
`classDef c a;b;c,d;e;f` gives `ab;c` and `de;f`, each part losing its own first
`;`. A statement whose text is empty or all whitespace, or only a directive,
adds no style, but still adds the class definition. `classDef a x,,y` gives `x`,
the empty text, and `y`, and `classDef a ,` two empty styles. As for a `style`
statement, the text may start on a later line, after comment lines, and is read
without its directives and without the `;` that the line rule ignores: in
`classDef c a:#f00;b,d;e` the last `;`, in the second part, is ignored, so the
styles are `a:`, the placeholder of the entity `#f00;`, and `b`, and `de`.
[fixture: state/db-classdef-appended] [fixture: state/db-classdef-semicolons]
[fixture: state/db-classdef-semicolon-in-each-part] [fixture:
state/db-classdef-semicolon-after-space] [fixture:
state/db-classdef-empty-items] [fixture: state/db-classdef-comma-only] [fixture:
state/db-classdef-trailing-comma] [fixture: state/lex-classdef-without-styles]
[fixture: state/db-classdef-directive-only] [fixture:
state/db-classdef-without-styles-takes-transition] [fixture:
state/db-classdef-comment-line-before-styles] [fixture:
state/db-classdef-ignored-semicolon-last-only]

**Links.** Each click statement adds a link: `state` the id of its
StateReference, `[*]` for a StateTerminal, `url` and `tooltip` the texts of its
strings with their quotes, or the empty text for a statement with `href`. Two
click statements for one state add two links, in source order, and a `;` that
the line rule ignores is not in a string: `click A href "style:#x;"` has the url
`"style:#x"`. [fixture: state/gram-click-tooltip] [fixture:
state/gram-click-href] [fixture: state/gram-click-terminal] [fixture:
state/db-click-twice-same-state] [fixture: state/db-click-url-ignored-semicolon]

**The rest.** `direction` is the direction of the last direction statement at
the top level, or `TB`. The title is that of the frontmatter; a line `title T`
is two states. [fixture: state/db-direction-last] [fixture:
state/db-title-frontmatter] [fixture: state/db-title-line-states]

**Accessibility statements.** `accTitle:` sets the title to its value.
`accDescr:` and `accDescr {` set the description to their value, with each line
feed, together with the whitespace that follows it, line feeds included,
replaced by one line feed. The value has no whitespace at its ends, as the
[StateLiteral](../../../spec/docs/ast/state.md#stateliteral) of the tree holds
it: `accTitle: x` and `accDescr: x` followed by two spaces give `x`, and
`accDescr { a  }` gives `a`. [fixture: state/db-acc-title-trailing-whitespace]
[fixture: state/db-acc-descr-trailing-whitespace] [fixture:
state/db-acc-descr-block-whitespace-before-close] In a block, empty lines and a
line that holds only a directive are such whitespace, so the lines `a`, an empty
line, and `b` give `a`, a line feed, and `b`; the whitespace before a line feed
stays, so `a` followed by two spaces and a line feed gives `a`, two spaces, and
a line feed; and U+2028 is whitespace after a line feed, but no line feed, so a
U+2028 between two words stays in the description. [fixture:
state/db-acc-descr-block-empty-line] [fixture:
state/db-acc-descr-block-directive-line] [fixture:
state/db-acc-descr-block-space-before-line-feed] [fixture:
state/db-acc-descr-block-line-separator] [fixture:
state/db-acc-descr-block-line-separator-after-line-feed] The value of a line
form may start on a later line, since the whitespace after the colon includes
line feeds: `accDescr:` followed by the line `A --> B` gives the description
`A --> B` and adds no transition, and `accTitle:`, a comment line, a line of a
directive, an empty line, or a U+2028 before `x` gives the title `x`. [fixture:
state/db-acc-descr-line-next-line] [fixture:
state/db-acc-title-comment-line-before-value] [fixture:
state/db-acc-title-directive-line-before-value] [fixture:
state/db-acc-title-empty-line-before-value] [fixture:
state/db-acc-title-line-separator-before-value] The value runs to the end of the
line, and an `accDescr {}` in it is part of it: `accTitle: x accDescr {}` gives
`x accDescr {}`. The value is read without its directives and without the `;`
that the line rule ignores: `accTitle: x %%{init: {}}%% y` gives `x`, two
spaces, and `y`, and `accDescr: style:#x;` and a block with the line `style:#x;`
give `style:#x`. [fixture: state/db-acc-title-with-empty-description-block]
[fixture: state/db-acc-title-directive-in-text] [fixture:
state/db-acc-descr-ignored-semicolon] [fixture:
state/db-acc-descr-block-ignored-semicolon] The text of a block ends at the
first `}`: the line `a accDescr {} b` in a block gives `a accDescr {`, and `b`
and `}` are states. [fixture: state/db-acc-descr-block-text-with-empty-block] A
later statement replaces the value that an earlier one set, whichever of the two
forms each has: `accTitle: first` followed by `accTitle: second` gives the title
`second`, `accDescr: x` followed by `accDescr { y }` gives the description `y`,
and `accDescr { x }` followed by `accDescr: y` gives `y`. [fixture:
state/spec-state-diagram-480eb00e] [fixture: state/db-acc-title-replaces]
[fixture: state/db-acc-title-replaces-then-transition] [fixture:
state/db-acc-descr-replaces] [fixture: state/db-acc-descr-block-replaces]
[fixture: state/db-acc-descr-line-replaces-block] An `accDescr {` block that is
not closed sets the empty description, whatever its text, because mermaid.js
reads its text and then, at the end of the text, an empty text as a second
block: `accDescr: d` followed by `accDescr {` and a line `x` at the end of the
text gives the empty description, and the title stays as it was. Such a block
takes the rest of the text, so `A --> B` followed by `accDescr {`, a line
`never`, and a line `C --> D` has no states C and D. [fixture:
state/db-acc-descr-block-unclosed-takes-lines] [fixture:
state/lex-acc-descr-block-unclosed] [fixture:
state/db-acc-descr-unclosed-replaces] [fixture:
state/db-acc-descr-unclosed-keeps-title] Otherwise, a statement whose value is
null sets the empty text, while a closed description block without text changes
nothing: `accTitle: x` followed by `accTitle:` at the end of the text gives the
empty title, and so for `accDescr:`, while `accDescr: x` followed by
`accDescr {  }` keeps `x`. [fixture: state/lex-acc-title-at-end] [fixture:
state/db-acc-title-empty-replaces] [fixture: state/db-acc-descr-empty-replaces]
[fixture: state/db-acc-descr-empty-block-keeps] [fixture:
state/db-acc-descr-empty-block-keeps-then-transition]
