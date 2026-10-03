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
state `Aﬂ°amp¶ß`, and `A : x#amp;y` gives A the description `xﬂ°amp¶ßy`.
[fixture: state/lex-entity-in-id] [fixture: state/db-transition-id-entity]
[fixture: state/db-state-alias-id-entity] [fixture: state/db-description-entity]
[fixture: state/db-note-text-entity] [fixture: state/db-transition-label-entity]
[fixture: state/db-state-string-entity]

**Ids.** The id of a state is the one that
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)
defines, and two states with the same id are one state.

**Regions.** Divided bodies, regions, and the ids of divider statements and
regions are those that
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)
defines. mermaid.js gives the last region an id made at random; the summary has
`generated-region-` followed by the number of that region among such regions, in
the order of the nodes, counted from 1, wherever the id appears. A divider state
or a region that a definition describes by its id (`state "a" as divider-id-1`)
has the label and the descriptions of those definitions, as any state does; one
that no definition describes has the empty label and no `description`. [fixture:
state/db-last-region-alias-with-spaces] [fixture:
state/db-last-region-terminal-composite] [fixture:
state/db-divider-state-two-descriptions] [fixture:
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
  value of its string without the whitespace at its ends, or, with a body, the
  text of the string between its quotes, whitespace included; an alias
  definition with a `:` has a second description, the value of its
  `secondDescription`, whitespace included, or the empty text when it has none:
  `state "d" as A :` gives A the descriptions `d` and the empty text. A
  pseudostate definition visits its state with the shape of its kind. [fixture:
  state/db-alias-description-trimmed] [fixture:
  state/db-alias-body-description-untrimmed] [fixture:
  state/lex-alias-second-description] [fixture:
  state/db-alias-colon-empty-second] [fixture:
  state/db-alias-colon-spaces-second]
- A note statement visits its state, and adds a note.
- A body that is divided is walked as its regions: each region is visited as a
  state of the composite state, with the shape `divider`, and its statements are
  walked with the region as their parent. Any other body is walked as it is, and
  each divider statement in it visits the state of its id, without a body: so
  `state A {`, `B`, `--`, and `}` gives B the parent A, and the state
  `divider-id-1` in A after it, with the shape `divider` and no `dir`. [fixture:
  state/db-divider-last-in-body] [fixture: state/db-dividers-each-last]
  [fixture: state/db-divider-alone-in-body]
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
`</choice>`, or `</join></fork>` makes no node. [fixture:
state/lex-join-empty-id] [fixture: state/db-choice-close-tag-id] [fixture:
state/db-fork-close-tags-id]

A visit **has a description** when its statement gives the state a description,
as
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)
defines it, that is not the empty text. A visit sets:

- `parentId`: the id of the parent, when there is one, also when that id is
  empty and makes no node. A later visit in another composite state or region
  moves the state there, and a later visit at the top level leaves `parentId` as
  it is. [fixture: state/db-state-in-two-composites] [fixture:
  state/db-parent-kept-at-top-level] [fixture:
  state/db-parent-set-by-later-composite] [fixture: state/lex-alias-without-id]
- the **descriptions** of the state, which start as its id alone. The first
  visit with a description replaces them with the descriptions of the visit,
  also when one of them is the id; each later visit with a description adds its
  descriptions after the others, also when one of them is the id or the same as
  one there. [fixture: state/db-description-id-alone] [fixture:
  state/db-description-equal-to-id] [fixture:
  state/db-description-id-after-description] [fixture:
  state/db-description-twice-same]
- `shape`: the first visit sets `stateStart` or `stateEnd` for a StateTerminal,
  `fork`, `join`, or `choice` for a pseudostate, `divider` for a region or a
  divider statement, nothing for a note statement, and `rect` otherwise; no
  later visit does so again. A visit with a description then sets
  `rectWithTitle` when the state has more than one description, and otherwise
  `roundedWithTitle` when an earlier visit had a body, or `rect`; so a start or
  a fork with a description has the shape `rect`. The first visit with a body
  then sets `roundedWithTitle`, or `divider` for a region. [fixture:
  state/db-terminal-description] [fixture: state/db-fork-description] [fixture:
  state/db-fork-two-descriptions] So a state that a note statement visits first
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
  statement in that body, or `TB`; a later body does not change it. The
  direction statements of a body that is divided lie in its regions, so such a
  composite state has `TB`, and each region the direction of the last direction
  statement in it, or `TB`; a body that is not divided keeps them, and a divider
  statement has no `dir`. [fixture: state/lex-composite-state-before-direction]
  [fixture: state/db-dir-first-body] [fixture: state/db-composite-divider-dir]
  [fixture: state/db-divider-last-in-body-direction]

A note adds a record: `state` the id of the state, or the empty text when the
`note-id` is empty, which visits no state (see above), `position` the texts of
its two `Keyword` tokens `left` or `right` and `of`, as written, with the one
space between them that mermaid.js reads, and `text` the value of its text,
which is the text that mermaid.js reads (see
[The note contexts](../../../spec/docs/diagrams/state.md#the-note-contexts)), or
the empty text. So `note left of A:hi` has the text `i`. [fixture:
state/lex-note-mixed-case] [fixture: state/lex-note-colon-without-space]
[fixture: state/lex-note-two-spaces-before-colon] [fixture:
state/lex-note-block] [fixture: state/lex-note-id-percent-block]

After the walk, a state that had a visit with a description has the first of its
descriptions as `label` and the others as `description`, a list that is empty
when it has one description. Any other state has its id as `label` and no
`description`. A region and a divider statement have the empty label and no
`description`. A state with a body and more than one description is rejected
(see
[Rejections outside the grammar](../../../spec/docs/diagrams/state.md#rejections-outside-the-grammar)).
[fixture: state/lex-composite-divider]

**Classes and styles.** The `classes` and `styles` of a state come from the
statements at the top level only, and apply to a state of that id wherever it
lies:

- the `cssClass` of a StateReference in a transition, and each `class` statement
  for each of its states, add a class, in source order; the `cssClass` of a
  definition statement adds none. [fixture: state/db-classes-order] [fixture:
  state/db-definition-css-class] [fixture: state/db-class-before-state]
  [fixture: state/db-top-class-applies-nested] The class of a StateReference in
  a transition goes to the state of each part of its id divided at each `,`, and
  not to the state of an id with a `,`: `A,B:::e --> C` gives A and B the class
  e and `A,B` none, and `A,:::e --> B` gives A the class; an empty part, like an
  id that no statement visits, adds no state. [fixture:
  state/db-css-class-reference-comma] [fixture:
  state/db-css-class-reference-two-ids] [fixture:
  state/db-css-class-reference-comma-after-arrow] [fixture:
  state/db-css-class-reference-comma-undefined] [fixture:
  state/db-css-class-reference-comma-only]
- a `style` statement sets the styles of each of its states, replacing earlier
  ones: the text after its ids, up to the end of the line, divided at each `,`,
  each part without its `;` and without the whitespace at its ends, empty parts
  included. These parts are the styles of the statement, the value of each, or
  the empty text for a null: `style A x,,y` gives `x`, the empty text, and `y`,
  and `style A` one empty style. [fixture: state/db-style-replaced] [fixture:
  state/db-style-semicolons] [fixture: state/db-style-empty-items] [fixture:
  state/db-style-blank] [fixture: state/db-style-trailing-comma]

A `classDef`, `class`, or `style` statement in a composite body changes nothing.
[fixture: state/db-nested-class-statement] [fixture: state/db-nested-classdef]

**Class definitions.** Each `classDef` statement at the top level adds its
styles to the class definition of its CSS class, which it adds when there is
none: the text after its class name, up to the end of the line, divided at each
`,`, each part without its first `;` and without the whitespace at its ends,
empty parts included, as for a `style` statement. A statement whose text is
empty or all whitespace adds no style, but still adds the class definition.
`classDef a x,,y` gives `x`, the empty text, and `y`, and `classDef a ,` two
empty styles. [fixture: state/db-classdef-appended] [fixture:
state/db-classdef-semicolons] [fixture: state/db-classdef-empty-items] [fixture:
state/db-classdef-comma-only] [fixture: state/db-classdef-trailing-comma]
[fixture: state/lex-classdef-without-styles]

**Links.** Each click statement adds a link: `state` the id of its
StateReference, `[*]` for a StateTerminal, `url` and `tooltip` the texts of its
strings with their quotes, or the empty text for a statement with `href`.
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href] [fixture:
state/gram-click-terminal]

**The rest.** `direction` is the direction of the last direction statement at
the top level, or `TB`. The title is that of the frontmatter; a line `title T`
is two states. [fixture: state/db-direction-last] [fixture:
state/db-title-frontmatter] [fixture: state/db-title-line-states]

**Accessibility statements.** `accTitle:` sets the title to its value.
`accDescr:` and `accDescr {` set the description to their value, with each line
feed, together with the whitespace that follows it, line feeds included,
replaced by one line feed. A later statement replaces the value that an earlier
one set, whichever of the two forms each has: `accTitle: first` followed by
`accTitle: second` gives the title `second`, `accDescr: x` followed by
`accDescr { y }` gives the description `y`, and `accDescr { x }` followed by
`accDescr: y` gives `y`. [fixture: state/spec-state-diagram-480eb00e] [fixture:
state/db-acc-title-replaces] [fixture:
state/db-acc-title-replaces-then-transition] [fixture:
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
