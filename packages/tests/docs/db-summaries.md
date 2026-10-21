# Db summaries

Japanese version: [db-summaries.ja.md](./db-summaries.ja.md)

This document explains the `db` field of `expected.json`: what a summary of
mermaid.js's Db keeps, and what it leaves out for each diagram type.

## What a summary is

A summary keeps only what the syntax determines, as plain JSON: collections
become arrays in declaration order, `undefined` fields are omitted, internal
counters and DOM ids are dropped. The normalizers live in `src/normalizers/`,
one per Db class, registered by diagram id in `src/normalizers/index.ts`. The
summary of each diagram type is described below, and the steps that build it
from a tree are in [db-from-tree/](./db-from-tree/) (`flowchart.md`,
`sequence.md`, `class.md`, `state.md`, `er.md`).

## Diagram types without a summary yet

For a diagram id without a normalizer, `runMermaid()` returns `db: null`. In
`common/`, whose fixtures may use any diagram type as a carrier, the generator
records `db: null`, meaning "not summarized yet: this diagram type has no
normalizer". In a diagram type's own directory it refuses to write the fixture.
When a normalizer is added for that diagram type, regeneration replaces `null`
with the summary, and the change shows up as a diff. Implementations skip the Db
comparison where `db` is `null`; the loader rejects `db: null` outside
`common/`.

## Flowchart

The fields of the summary:

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
| `clickCalls`   | The calls that bind a click callback, in source order, one for each id of each click: `id`, `name`, and `args`, as the Db receives them (see below). The field is absent when there is none.                                                                       |

`normalizeFlowchart()` (`src/normalizers/flowchart.ts`) summarizes the Db of
`flowchart-v2`, `flowchart-elk` and `swimlane`, which share `FlowDB`. It keeps
what `FlowDB` exposes through its getters and drops the following, each for the
reason given:

- `vertices[].domId`: a DOM id built from a counter, used only for rendering.
- `classDefs[].textStyles`: derived from `styles` for rendering (the entries
  containing `color`, with `fill` replaced by `bgFill`).
- `textBefore` and `textAfter` of a
  [FlowchartDirectionStatement](../../spec/docs/ast/flowchart.md#flowchartdirectionstatement):
  the text of a direction line that mermaid.js does not read.
- `vertices[].haveCallback`: set only under `securityLevel: loose`, a site
  setting; the click itself shows as the class `clickable`.
- Click callback names and arguments are not in the state of the Db, which keeps
  them only inside closures, and only under `securityLevel: loose`. The summary
  has them as `clickCalls` instead: a patch of `FlowDB.setClickFun`
  (`src/normalizers/click-calls.ts`) records each call as it comes, also one
  that the Db ignores (an id that is no vertex, a `securityLevel` other than
  `loose`). `id` is the id as passed, `name` the name of the function, and
  `args` the text between the parentheses as written, whitespace at its ends
  too, or null when the call has no parentheses or only whitespace between them.
  [fixture: flowchart/gram-click-call] [fixture:
  flowchart/db-click-callback-whitespace-arguments] [fixture:
  flowchart/lex-callback-blank-parentheses] [fixture:
  class/lex-callback-blank-parentheses] [fixture:
  flowchart/tokens-callback-name-trailing-space] [fixture:
  flowchart/tokens-callback-arguments-spaces-at-ends]
- Internal bookkeeping (`vertexCounter`, `subCount`, `posCrossRef`, ...).
- Whitespace at the end of each style value (`vertices[].styles`,
  `classDefs[].styles`, `edges[].style`, `edgeDefaults.style`). The grammar
  keeps the whitespace written before a comma or the end of the line in the
  value, but nothing in mermaid.js reads it, and the formatter removes
  whitespace at the end of these lines. The characters removed are those of
  `String.prototype.trimEnd()`, which are exactly the ones the grammar can leave
  there. In the tree, that whitespace is outside the range of the style (see
  **Style statements** in
  [db-from-tree/flowchart.md](./db-from-tree/flowchart.md)). Whitespace at the
  start of a value is kept: it can change the Db (`linkStyle` adds `fill:none`
  when no value starts with `fill`). [fixture:
  flowchart/db-style-trailing-whitespace-characters] [fixture:
  flowchart/db-linkstyle-default-trailing-whitespace]

Other values of the summary:

- Texts (labels, subgraph and diagram titles, `accTitle`, `accDescr`, tooltips)
  are recorded before HTML sanitization, and `vertices[].link` is the URL as
  written (trimmed); see [expected-results.md](./expected-results.md). [fixture:
  flowchart/db-text-unsanitized-edge-label] [fixture:
  flowchart/db-text-unsanitized-subgraph-title] [fixture:
  flowchart/db-text-unsanitized-diagram-title] [fixture:
  flowchart/db-text-unsanitized-acc-title] [fixture:
  flowchart/db-text-unsanitized-acc-descr] [fixture:
  flowchart/db-text-unsanitized-tooltip]
- A style that is all whitespace gives the empty text: `style A fill:#f00, ` has
  the styles `fill:#f00` and the empty text. [fixture:
  flowchart/gram-style-whitespace] [fixture:
  flowchart/db-style-whitespace-only-value] [fixture:
  flowchart/db-style-trailing-comma]
- With these choices the summary does not depend on `securityLevel`, as long as
  it is one of `strict`, `loose`, `antiscript`, and `sandbox`. [fixture:
  flowchart/config-security-level-loose-click-call] [fixture:
  flowchart/config-security-level-loose-click-link-javascript]
- `icon`, `form`, `pos`, `img`, `constraint`, `assetWidth` and `assetHeight` of
  vertices, `animate` and `animation` of edges, and `metadata` of subgraphs are
  set only by `@{ ... }` data blocks; see
  [embedded-data.md](./embedded-data.md). [fixture:
  flowchart/db-data-block-asset-width]

## sequence

The fields of the summary:

| Field             | Content                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `title`           | The title.                                                                                |
| `accTitle`        | The accessibility title, or the empty text.                                               |
| `accDescr`        | The accessibility description, or the empty text.                                         |
| `actors`          | The participants, in the order in which they were first added.                            |
| `boxes`           | The boxes, in source order: `name`, `wrap`, `fill`, and `actorKeys`.                      |
| `createdActors`   | The created participants: `id` and `messageIndex`.                                        |
| `destroyedActors` | The destroyed participants: `id` and `messageIndex`.                                      |
| `messages`        | The messages, notes, autonumber settings, activations, and the starts and ends of blocks. |

A participant has `name`, `description`, `wrap`, `prevActor`, `nextActor`,
`links`, `properties`, `type`, and `box`, the position of its box in `boxes`. A
field that the Db leaves unset is absent.

`normalizeSequence()` (`src/normalizers/sequence.ts`) summarizes the Db of
`sequence`. It keeps what `SequenceDB` exposes through its getters: the actors
in the order they were first added, the boxes, the created and destroyed actors
with the number of messages before the statement, the messages, and the titles.
An actor's box is its position in `boxes`. It drops the following, each for the
reason given:

- `messages[].id`: the position of the message, as a string.
- `actors[].actorCnt` and `actors[].rectData`: the renderer fills them in; after
  parsing they are always `null`.
- The list of notes: every note is also a message of the `NOTE` type with the
  same text, placement and actors, and the renderer reads the messages.
- `sequenceNumbersEnabled`: only the renderer turns it on; `autonumber` is a
  message.
- Internal bookkeeping (the last actor added, the open box, the last created and
  destroyed actors, the wrap setting copied from the configuration).

Other values of the summary:

- `wrap` of actors, boxes and messages follows the `wrap:` and `nowrap:`
  prefixes, and otherwise the configuration (`wrap` or `sequence.wrap`, from the
  site, the frontmatter or a directive). [fixture:
  sequence/config-wrap-frontmatter] [fixture:
  sequence/config-sequence-wrap-frontmatter] [fixture:
  sequence/config-wrap-init-directive]
- The numbers of an `autonumber` (`start` and `step`) are numbers, and the text
  `"Infinity"` where a number is too large for a double, since JSON has no such
  number. [fixture: sequence/db-autonumber-start-overflow] [fixture:
  sequence/db-autonumber-step-overflow]
- The title is kept as the grammar passes it, with the whitespace after the
  first space following `title` and at the end of the line. A title of only
  whitespace still counts as a title for the renderer, which reserves room for
  it, so the whitespace is not dropped.
- The links and properties of an actor are the keys an author wrote in JSON.
  `SequenceDB` copies them into the actor key by key
  ([`insertLinks`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L488-L496),
  [`insertProperties`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L512-L520)),
  so a key `__proto__` sets the prototype of the object instead of adding an
  entry, and mermaid.js then reads the prototype's entries too. The summary
  records such a prototype as a first entry `__proto__`.
- An actor's `type` and description can be set by its `@{ ... }` data block. See
  [embedded-data.md](./embedded-data.md).

## class

The fields of the summary:

| Field        | Content                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `direction`  | The direction, `TB` unless a direction statement sets it.                                                                                        |
| `title`      | The title of the frontmatter, or the empty text.                                                                                                 |
| `accTitle`   | The accessibility title, or the empty text.                                                                                                      |
| `accDescr`   | The accessibility description, or the empty text.                                                                                                |
| `classes`    | The classes, in the order in which they were first added.                                                                                        |
| `relations`  | The relations, in source order.                                                                                                                  |
| `notes`      | The notes, in source order.                                                                                                                      |
| `namespaces` | The namespaces, in the order in which they were first added.                                                                                     |
| `interfaces` | The interfaces that lollipop relations add, in source order.                                                                                     |
| `clickCalls` | The calls that bind a click callback, in source order, one for each name of each statement: `id`, `name`, and `args`. Absent when there is none. |

A class has `id`, `type`, `label`, `text`, `shape`, which is always `classBox`,
`cssClasses`, `methods`, `members`, `annotations`, `styles`, and, when they are
set, `parent`, `link`, `linkTarget`, `haveCallback`, and `tooltip`. A method has
`memberType` (`method`), `visibility`, `classifier`, `id`, `parameters`, and
`returnType`; an attribute, in `members`, has `memberType` (`attribute`),
`visibility`, `classifier`, and `id`. A relation has `id1`, `id2`, `relation`
with `type1`, `type2`, and `lineType`, `relationTitle1`, `relationTitle2`, and,
when it has a label, `title`. A note has `id`, `text`, and, when they are set,
`class` and `parent`. A namespace has `id`, `label`, the ids of its `classes`,
`notes`, and `children`, `explicit`, and, when it has one, `parent`. An
interface has `id`, `label`, and `classId`.

`normalizeClass()` (`src/normalizers/class.ts`) summarizes the Db of
`classDiagram`, which mermaid.js detects for both `classDiagram` and
`classDiagram-v2`. It keeps what `ClassDB` exposes through its getters, in the
order the Db holds it: the direction, the titles, the classes with their members
and methods, the relations, the notes, the namespaces, and the interfaces that
lollipop relations create, which the renderer draws. A namespace lists its
classes, notes and child namespaces by id. It drops the following, each for the
reason given:

- `classes[].domId` and `namespaces[].domId`: DOM ids built from counters, used
  only for rendering.
- The display text of a member or a method (`text`), built from its other
  fields.
- `notes[].index`: the number in the note's id.
- The class definitions (`classDef`): the Db keeps them in a private map that
  nothing reads
  ([`ClassDB`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L40-L40));
  what they change shows in `classes[].styles`.
- Click callbacks: the Db keeps the function name and arguments only inside
  closures, and only under `securityLevel: loose`. The summary has them as
  `clickCalls` instead, recorded as for flowchart by a patch of
  `ClassDB.setClickFunc`, also for a name that is no class. [fixture:
  class/db-callback-names-comma] [fixture:
  class/tokens-callback-name-trailing-space]
- Whitespace at the end of each style value (`classes[].styles`), as in the
  flowchart summary: the grammar keeps the whitespace written before a comma or
  the end of the line, and nothing reads it. [fixture:
  class/db-style-trailing-whitespace-eol] [fixture:
  class/db-class-def-trailing-whitespace]

Other values of the summary:

- `classes[].text` is kept, although it is built from the label and the type:
  `addClass` writes the type as `&lt;T&gt;` and a label statement as `<T>`
  ([`addClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L112-L137)),
  so the label and the type alone do not give it.
- `classes[].haveCallback` is kept: unlike flowchart, `setClickEvent` sets it
  under every `securityLevel`
  ([`setClickEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L434-L444)).
  [fixture: class/config-security-level-loose-click]
- `classes[].link` is the URL as written (trimmed), and `classes[].linkTarget`
  the target as written, or `_blank`, under every `securityLevel` (see
  [expected-results.md](./expected-results.md)). [fixture:
  class/config-security-level-loose-click]

## state

The fields of the summary:

| Field         | Content                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `direction`   | The direction of the diagram.                                            |
| `title`       | The title of the frontmatter, or the empty text.                         |
| `accTitle`    | The accessibility title, or the empty text.                              |
| `accDescr`    | The accessibility description, or the empty text.                        |
| `states`      | The states, in the order of their nodes.                                 |
| `notes`       | The notes, in the order of their nodes.                                  |
| `transitions` | The transitions, in source order.                                        |
| `classDefs`   | The class definitions, in the order of their first `classDef` statement. |
| `links`       | The click statements at the top level, in source order.                  |

A state has `id`, `label`, `classes`, and `styles`, and, when they are set,
`shape`, `description`, `parentId`, and `dir` (see
[Building the summary from the tree](./db-from-tree/state.md#building-the-summary-from-the-tree)).
A note has `state`, `position`, and `text`. A transition has `start`, `end`, and
`label`. A class definition has `id` and `styles`. A link has `state`, `url`,
and `tooltip`.

`normalizeState()` (`src/normalizers/state.ts`) summarizes the Db of
`stateDiagram`, which mermaid.js detects for both `stateDiagram` and
`stateDiagram-v2`. Its source is the layout data that the renderer draws,
[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L763-L778),
which mermaid.js builds from the statements while it parses. The Db holds two
other forms, and neither is summarized: the statement tree keeps statements that
change nothing (a `classDef`, `class` or `style` inside a composite state, a
floating note, `scale`), and the table of states holds the top level only, since
[`extract`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L249-L272)
reads only the statements of the top level.

The summary keeps, in the order of the layout data:

- `states`: every node but notes, with its `id`, `shape`, `label` and
  `description`, the composite state or region it lies in (`parentId`), and the
  direction of a composite state or region (`dir`). `classes` and `styles` are
  those that the table of states gives the node's id, which is where
  [`dataFetcher`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L250-L254)
  takes them; a state without an entry has none.
- `notes`: each note, with the state it belongs to, its `position` and its
  `text`.
- `transitions`: each transition, with its `start`, `end` and `label`.
- `classDefs`: the class definitions, with their `styles`.
- `links`: each click, with its state, and its `url` and `tooltip` as written,
  quotes included.
- `direction`: the direction the renderer uses, from the last `direction`
  statement of the top level
  ([`getDir`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L185-L195));
  `getDirection()`, which takes the first one, is not read by the renderer.
- `title`, `accTitle` and `accDescr`.

It drops the following, each for the reason given:

- The fields of the layout data used only for drawing: DOM ids, edge ids,
  padding, corner radii, `look`, label types and positions, the CSS class names
  mermaid.js adds, the palette slot of a composite state, the arrow markers, and
  the sizes `getData()` takes from the configuration.
- Values derived from kept ones: whether a node is a group (from `shape`), the
  styles of a node's classes (`cssCompiledStyles`, from `classDefs`),
  `classDefs[].textStyles` (from `styles`), and the group around a state and its
  notes, whose label and position are those of the last note.

The region after the last `--` of a composite state gets an id that mermaid.js
makes at random
([`docTranslator`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L366-L375)).
It is recorded as `generated-region-1`, `generated-region-2`, ... in the order
of the nodes, wherever it appears: in the node's id, in the ids and labels of
the start and end states of that region, in `parentId`, and in transitions. A
region made by a `--` keeps its id `divider-id-<number>`, which a counter gives.

Values are recorded as the Db holds them, whitespace included. The summary is
the same under `look`, under `securityLevel` when it is one of `strict`,
`loose`, `antiscript` and `sandbox`, and under `htmlLabels` as long as it does
not make mermaid.js replace characters; for another `securityLevel`, with HTML
labels enabled, the labels and descriptions of the states, the text of a note,
and the labels of transitions hold the replaced characters (see
[db-from-tree.md](./db-from-tree.md), the replacement of characters). [fixture:
state/config-security-level-sandbox-click] [fixture:
state/config-look-hand-drawn] [fixture: state/config-html-labels-false]
[fixture: state/config-security-level-other-description] [fixture:
state/config-security-level-other-note] [fixture:
state/config-security-level-other-transition-label]

## er

The fields of the summary:

| Field           | Content                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `direction`     | The direction, `TB` unless a `direction` statement outside the subgraphs sets it.                |
| `title`         | The title of the frontmatter, or the empty text.                                                 |
| `accTitle`      | The accessibility title, or the empty text.                                                      |
| `accDescr`      | The accessibility description, or the empty text.                                                |
| `entities`      | The entities, in the order of their first appearance.                                            |
| `relationships` | The relationships, in source order.                                                              |
| `classes`       | The class definitions, in the order of their first `classDef`.                                   |
| `subGraphs`     | The subgraphs, in the order in which they end: an inner subgraph comes before the one around it. |

An entity has `id`, `name`, `alias`, `attributes`, `classes`, and `cssStyles`.
An attribute has `type`, `name`, `keys`, and `comment`. A relationship has
`entityA`, `roleA`, `entityB`, `cardA`, `cardB`, and `relType`. A class
definition has `id` and `styles`. A subgraph has `id`, `title`, `nodes`,
`classes`, `cssStyles`, and, when its body has a `direction` statement, `dir`.

`normalizeEr()` (`src/normalizers/er.ts`) summarizes the Db of `er`. It keeps
what `ErDB` holds in its own lists, in the order it holds them. It does not take
the layout data of
[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L377-L459),
which leaves out what the renderer does not draw (a class definition that no
entity uses, an entity that has the id of a subgraph) and adds values made from
the others. The Db reads no browser feature, no time and no random value, and
the syntax has no data blocks and no links, so the summary needs no patch of the
Db. It drops the following, each for the reason given:

- `entities[].shape`, `look` and `labelType`: the fixed shape `erBox` and label
  type `markdown`, and the `look` of the site configuration, used only for
  rendering.
- `entities[].label`: the name, which the summary already has as `name`.
- `entities[].cssClasses`: the text `default` followed by the names of
  `classes`. The summary has the names in `classes`.
- `classes[].textStyles`: the styles that contain `color`, with `fill` replaced
  by `bgFill`, made from `styles` alone.
- `subGraphs[].labelType`: the label type `markdown`, which the grammar never
  chooses.
- The lookup of subgraphs by id, the counter of subgraphs, and the depth of
  subgraphs while parsing: derived from the list of subgraphs, or kept only
  while parsing.
- What `getData()` makes of the Db: the ids of the edges, the arrow types and
  the line pattern, the compiled styles of an entity (`cssCompiledStyles`), and
  the color index (`colorIndex`).

Values of the summary, by field:

**Entities**

- `id` is `entity-<name>-<number>`, where the number is how many entities
  existed when this one was made. The entities are therefore numbered from 0 in
  the order of their first appearance, wherever it is: a relationship, a block,
  a `:::` statement, or the body of a subgraph. A relationship refers to an
  entity by its `id`. [fixture: er/basic-entity] [fixture:
  er/db-entity-ids-first-appearance]
- `name` is the name as written, without quotes. A quoted name keeps its spaces,
  also in the `id`. The quoted and the bare form of a name are one entity, and
  names are case-sensitive. [fixture: er/db-entity-name-quoted-spaces] [fixture:
  er/db-entity-name-quoted-same-as-bare] [fixture: er/db-entity-names-case]
  [fixture: er/db-relationship-quoted-entities]
- A name is recorded as the lexer reads it. It can be made of digits, hold `-`,
  `.`, `*`, and non-ASCII letters, and U+2028, U+2029 and U+00A0 are part of it:
  between the units of a statement they are not whitespace. [fixture:
  er/db-entity-name-numbers] [fixture: er/db-entity-name-characters] [fixture:
  er/db-entity-name-line-separator] [fixture:
  er/db-entity-name-paragraph-separator] [fixture:
  er/db-entity-name-no-break-space] [fixture:
  er/db-entity-name-quoted-line-separator]
- A relationship from an entity to itself has the same `id` at both ends.
  [fixture: er/db-entity-relationship-self]
- `alias` is the text of `[alias]`, or the empty text. The first non-empty alias
  is kept: a later `A[second]`, and a later `A` without an alias, change
  nothing. An entity made without an alias gets the alias of a later statement,
  also when a relationship made it. An alias is a name: quoted, a number, or
  with a hyphen. [fixture: er/db-alias-first-kept] [fixture:
  er/db-alias-set-after-entity] [fixture: er/db-alias-after-relationship]
  [fixture: er/db-alias-with-attributes] [fixture: er/db-alias-with-class]
  [fixture: er/db-alias-empty-block] [fixture: er/db-alias-forms] [fixture:
  er/db-alias-first-kept-directive-line]

**Attributes**

- `attributes` are in the written order. The grammar builds the list of a block
  backwards and
  [`addAttributes`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L95-L110)
  reads it backwards, so the summary has the written order. A name written twice
  is kept twice. [fixture: er/db-attribute-order] [fixture:
  er/db-attribute-keys]
- Blocks of one entity add up: a later block adds its attributes after the
  earlier ones, also an attribute of the same name. An empty block, written as
  `{}`, with a line feed, or with a space, makes the entity and adds nothing,
  also after a block with attributes. A block may come after the relationship
  that made the entity, and a block may be written on one line. [fixture:
  er/db-attribute-blocks-add-up] [fixture: er/db-attribute-block-empty]
  [fixture: er/db-attribute-block-empty-after-attributes] [fixture:
  er/db-attribute-block-entity-from-relationship] [fixture:
  er/db-attribute-block-one-line] [fixture:
  er/db-attribute-blocks-add-up-comment-line]
- `keys` is the list of the keys `PK`, `FK` and `UK` in the written order, as
  written in any case, a repeated key twice; it is the empty list when the
  attribute has none. `comment` is the text between the double quotes, without
  them and with its spaces, or the empty text when the attribute has none or an
  empty one. [fixture: er/db-attribute-keys] [fixture:
  er/db-attribute-keys-case] [fixture: er/db-attribute-defaults] [fixture:
  er/db-attribute-comment-with-keys] [fixture: er/db-attribute-comment-spaces]
  [fixture: er/db-attribute-comment-empty]
- `type` and `name` are the words as read. A type may carry a length
  (`string(30)`, `decimal(10,2)`), a `?`, generic marks (`List~int~`, also with
  a space inside), and brackets; a word may hold `_`, `-`, `.`, and start with
  `*`. In backquotes it may hold spaces, and the backquotes are not part of it.
  U+2028 inside a word is part of it. [fixture: er/db-attribute-type-length]
  [fixture: er/db-attribute-type-question-mark] [fixture:
  er/db-attribute-type-generic] [fixture: er/db-attribute-type-brackets]
  [fixture: er/db-attribute-name-characters] [fixture:
  er/db-attribute-backquoted] [fixture: er/db-attribute-name-line-separator]
- Inside a block, a comment line, a directive line, an empty line, and a line of
  whitespace are no text, and CRLF and a lone CR end a line. The words
  `direction RL` there are an attribute with the type `direction` and the name
  `RL`, not a direction statement. [fixture: er/db-attribute-block-comment-line]
  [fixture: er/db-attribute-block-directive-line] [fixture:
  er/db-attribute-block-empty-line] [fixture:
  er/db-attribute-block-whitespace-line] [fixture: er/db-attribute-block-crlf]
  [fixture: er/db-attribute-block-cr] [fixture:
  er/db-attribute-block-direction-text]
- A line with `style`, then a `:` followed by `#`, then a `;` has its last `;`
  ignored by the line rule of [common.md](../../spec/docs/common.md), also
  inside the comment of an attribute: the comment `"style:#x;"` is `style:#x`.
  [fixture: er/db-attribute-comment-ignored-semicolon]

**Classes and styles of an entity**

- `classes` are the names that `class` statements and `:::` gave the entity, in
  the order of the statements, a name given twice kept twice. No `classDef` is
  needed. [fixture: er/db-class-statement-ids] [fixture:
  er/db-class-statement-repeat] [fixture: er/db-class-without-class-def]
- `class A,B c` gives `c` to each entity of its list. A name that is no entity
  gets nothing and is not made, and an entity made after the statement does not
  have the class. Spaces around the commas of a list do not matter, and a class
  named `default` is recorded like any other. [fixture:
  er/db-class-undefined-entity] [fixture: er/db-class-before-entity] [fixture:
  er/db-class-list-spaces] [fixture: er/db-class-named-default] [fixture:
  er/db-class-name-line-separator]
- `A:::c1,c2` makes the entity A and gives it the classes of the list. It also
  gives them to the first entity of a relationship, to the second, or to both,
  and it may come after an alias and before a block. [fixture:
  er/db-class-separator] [fixture: er/db-class-separator-relationship-first]
  [fixture: er/db-class-separator-relationship-second] [fixture:
  er/db-class-separator-relationship-both] [fixture:
  er/db-class-separator-block]
- `cssStyles` are the styles of the `style` statements of the entity, split at
  commas, in the order of the statements, over all statements. A statement with
  a list of names gives its styles to each, and a name that is no entity gets
  nothing and is not made, also when the statement comes before the entity.
  [fixture: er/db-style-statement] [fixture: er/db-style-id-list-spaces]
  [fixture: er/db-style-undefined-entity] [fixture: er/db-style-before-entity]
  [fixture: er/db-style-non-ascii] [fixture: er/db-style-line-separator]
- A `;` after the styles ends the statement. When the line has `style`, then a
  `:` followed by `#`, then a `;`, as in `style A fill:#f00;`, the last `;` is
  ignored by the line rule, as if it were not there. Only the last one is: in
  `style A fill:#f00;stroke:#00f;` the `#f00;` before it is read as a character
  entity and replaced by a placeholder (see
  [Entities](../../spec/docs/common.md#entities)). [fixture:
  er/db-style-semicolon-separator] [fixture: er/db-style-ignored-semicolon]
  [fixture: er/db-style-ignored-semicolon-last-only] [fixture:
  er/db-style-ignored-semicolon-two-statements]

**Relationships**

- `entityA` and `entityB` are the `id`s of the entities. A relationship makes
  the entities that do not exist yet. When a subgraph with the name was closed
  before the statement, the end is the id of the subgraph instead (see
  **Subgraphs**). The relationships are in source order, and one written twice
  is kept twice. [fixture: er/db-relationship-source-order]
- `cardA` is the cardinality written right of the line and `cardB` the one
  written left of it, as mermaid.js names them: in `||--o{`, `cardA` is
  `ZERO_OR_MORE` and `cardB` is `ONLY_ONE`. A spelling means the same on either
  side. [fixture: er/db-cardinality-sides] [fixture:
  er/db-cardinality-symbol-either-side]
- The spellings of a cardinality, each case-insensitive for words:
  - `ONLY_ONE`: `||`, `one`, `only one`, and `1`. [fixture:
    er/db-cardinality-symbols-only-one] [fixture:
    er/db-cardinality-words-only-one] [fixture: er/db-cardinality-digit-one]
  - `ZERO_OR_ONE`: `|o`, `o|`, `zero or one`, and `one or zero`. [fixture:
    er/db-cardinality-symbols-zero-or-one] [fixture:
    er/db-cardinality-words-zero-or-one]
  - `ZERO_OR_MORE`: `}o`, `o{`, `zero or more`, `zero or many`, `0+`, `many(0)`,
    and `many`. [fixture: er/db-cardinality-symbols-zero-or-more] [fixture:
    er/db-cardinality-words-zero-or-more] [fixture: er/db-cardinality-plus]
    [fixture: er/db-cardinality-many-with-count] [fixture:
    er/db-cardinality-many]
  - `ONE_OR_MORE`: `}|`, `|{`, `one or more`, `one or many`, `1+`, and
    `many(1)`. [fixture: er/db-cardinality-symbols-one-or-more] [fixture:
    er/db-cardinality-words-one-or-more] [fixture: er/db-cardinality-plus]
    [fixture: er/db-cardinality-many-with-count]
  - `MD_PARENT`: `u` directly before `-`, `.`, or `|`, as in `u--` and `u..`,
    and `U`, on either side. On the right side the character after it starts the
    next name: `A ||--u-B : x` has the cardinality `MD_PARENT` on the right and
    the entity `-B`. [fixture: er/db-cardinality-parent] [fixture:
    er/db-cardinality-parent-uppercase] [fixture: er/lex-md-parent-right]
    [fixture: er/lex-md-parent-right-glued-name] [fixture:
    er/lex-md-parent-right-glued-dot] [fixture: er/lex-md-parent-both-glued]
  - Words in capitals or mixed case are the same. [fixture:
    er/db-cardinality-words-case]
- `relType` is `IDENTIFYING` for `--` and `to`, and `NON_IDENTIFYING` for `..`,
  `.-`, `-.`, and `optionally to`. [fixture: er/db-cardinality-symbols-only-one]
  [fixture: er/db-relationship-type-to] [fixture: er/db-relationship-type-dots]
  [fixture: er/db-relationship-type-dot-dash] [fixture:
  er/db-relationship-type-dash-dot] [fixture:
  er/db-relationship-type-optionally-to] [fixture: er/db-relationship-words-to]
- `roleA` is the role, which every relationship has: a bare word, or a quoted
  text without its quotes and with its spaces, also the empty text, a `%`, an
  apostrophe, and non-ASCII letters. U+2028 is part of a bare role, and is kept
  in a quoted one. [fixture: er/db-role-word] [fixture: er/db-role-quoted]
  [fixture: er/db-role-quoted-empty] [fixture: er/db-role-quoted-percent]
  [fixture: er/db-role-non-ascii] [fixture: er/db-role-line-separator] [fixture:
  er/db-role-quoted-line-separator]

**Class definitions**

- `classes` has one entry for each name of a `classDef`, in the order of the
  first definition of the name. `styles` are the items split at commas, in
  order, also those with `color`. A second `classDef` of the name adds its
  styles to the first and does not move it. A `classDef` with a list of names
  defines each. A definition that no entity uses is kept. A name `default` is
  kept. [fixture: er/db-class-def-styles] [fixture:
  er/db-class-def-several-styles] [fixture: er/db-class-def-twice] [fixture:
  er/db-class-def-ids] [fixture: er/db-class-def-unused] [fixture:
  er/db-class-def-default] [fixture: er/db-class-def-twice-empty-line]
- As for `style`, a `;` after the styles ends the statement, and the last `;` of
  a line with `classDef`, then a `:` followed by `#`, then a `;` is ignored by
  the line rule. U+2028 is part of a style. [fixture:
  er/db-class-def-semicolon-separator] [fixture:
  er/db-class-def-ignored-semicolon] [fixture: er/db-class-def-line-separator]

**Subgraphs**

- `id` is the id of the header, without quotes and trimmed. A quoted id keeps
  its spaces. Two subgraphs may have the same id, and both are in the list.
  [fixture: er/db-subgraph-id-quoted] [fixture: er/db-subgraph-id-trimmed]
  [fixture: er/db-subgraph-same-id-twice] [fixture:
  er/db-subgraph-nested-same-id]
- `title` is the words of the bracket joined by a space, each a name that may be
  quoted, with spaces between them reduced to one, and trimmed after the
  replacement of characters; without a bracket it is the id. [fixture:
  er/db-subgraph-title-words] [fixture: er/db-subgraph-title-quoted] [fixture:
  er/db-subgraph-title-spaces-collapse] [fixture:
  er/db-subgraph-title-quoted-and-bare] [fixture: er/db-subgraph-title-trimmed]
  [fixture: er/db-subgraph-title-line-separator] [fixture:
  er/db-subgraph-no-title]
- `nodes` are the names of the entities in the body, and the ids of the
  subgraphs in it, in order. A nested subgraph ends first, so it is in the list
  before the subgraph around it, and its id is a node of that one. [fixture:
  er/db-subgraph-empty] [fixture: er/db-subgraph-nested]
- A node is the value of a statement of the body. A relationship gives both
  names, and an entity with an alias, a block or `:::` gives its name. Other
  statements give a value too: `class`, `classDef` and `style` give their own
  word, and `accTitle`, `accDescr` and an `accDescr` block give their text
  trimmed. A `direction` statement gives none. [fixture:
  er/db-subgraph-nodes-relationship] [fixture: er/db-subgraph-nodes-block]
  [fixture: er/db-subgraph-nodes-alias] [fixture:
  er/db-subgraph-nodes-class-separator] [fixture:
  er/db-subgraph-nodes-class-statement] [fixture:
  er/db-subgraph-nodes-class-def-statement] [fixture:
  er/db-subgraph-nodes-style-statement] [fixture:
  er/db-subgraph-nodes-acc-title] [fixture: er/db-subgraph-nodes-acc-descr-line]
  [fixture: er/db-subgraph-nodes-acc-descr-block] [fixture:
  er/db-subgraph-nodes-all-statements] [fixture: er/db-subgraph-direction-only]
- A node is kept as written, with its spaces, and quotes removed. It is dropped
  when its trimmed text is empty or equals the trimmed text of an earlier node
  of the body, and when an earlier subgraph already has it. Nested subgraphs
  close first, so a name in a nested subgraph is not a node of the one around it
  even when that one names it too. [fixture: er/db-subgraph-nodes-untrimmed]
  [fixture: er/db-subgraph-nodes-blank-name] [fixture:
  er/db-subgraph-nodes-quoted-name] [fixture: er/db-subgraph-member-repeated]
  [fixture: er/db-subgraph-member-in-earlier] [fixture:
  er/db-subgraph-member-nested-and-outer]
- A comment line, a directive line, an empty line, and a line of whitespace in
  the body are no text. [fixture: er/db-subgraph-nodes-comment-line] [fixture:
  er/db-subgraph-nodes-directive-line] [fixture:
  er/db-subgraph-nodes-empty-line] [fixture:
  er/db-subgraph-nodes-whitespace-line]
- `dir` is the value of the last `direction` statement of the body, and is
  absent when there is none. A nested subgraph has its own. A `direction`
  statement inside a subgraph does not set the direction of the diagram.
  [fixture: er/db-subgraph-direction] [fixture:
  er/db-subgraph-direction-top-level] [fixture: er/db-subgraph-direction-nested]
- A relationship ends at the id of a subgraph when a subgraph with the name was
  closed before the statement: the relationship in its own body does not, as the
  subgraph is added when it ends. The statement also makes an entity with that
  name, so the entity stays in `entities`, although the renderer does not draw
  it. A subgraph without nodes counts as well. When the subgraph comes after the
  statement, the end is the entity. [fixture: er/db-subgraph-relationship-after]
  [fixture: er/db-subgraph-relationship-before] [fixture:
  er/db-subgraph-relationship-inside] [fixture:
  er/db-subgraph-relationship-two-subgraphs] [fixture:
  er/db-subgraph-relationship-empty-subgraph]
- `classes` and `cssStyles` of a subgraph come from `class` statements, `:::`,
  and `style` statements that follow its end, and are applied to every entity or
  subgraph that has the name: when two subgraphs have the same id, the last one;
  when an entity has it too, also the entity. A statement before the subgraph
  does nothing for it, and a `style` statement makes no entity. [fixture:
  er/db-subgraph-class-statement] [fixture: er/db-subgraph-style-statement]
  [fixture: er/db-subgraph-class-before-definition] [fixture:
  er/db-subgraph-entity-and-subgraph-style] [fixture:
  er/db-subgraph-same-id-class-last]

**Direction, title and accessibility texts**

- `direction` is `TB`, `BT`, `RL`, or `LR`, from the last `direction` statement
  outside the subgraphs. The word and the value may be in any case, and the
  value is recorded in capitals. The statement is the line that holds them: text
  before the word or after the value is part of the statement, and makes no
  entity. [fixture: er/db-direction-values] [fixture: er/db-direction-case]
  [fixture: er/db-direction-line-text-before] [fixture:
  er/db-direction-line-text-after]
- `title` comes from the frontmatter only. The grammar has a rule for a `title`
  statement but no token for it, so a line `title My ER` makes the entities
  `title`, `My` and `ER`. [fixture: er/db-title-frontmatter] [fixture:
  er/db-title-frontmatter-quoted] [fixture: er/db-title-line-is-entities]
- `accTitle` is the text after `accTitle:`, trimmed; a later one replaces the
  earlier. The white space after the colon includes line terminators, so an
  `accTitle:` with no text on its line takes the next line. A directive inside
  the text is not part of it. [fixture: er/db-acc-title-line] [fixture:
  er/db-acc-title-spaces] [fixture: er/db-acc-title-replaces] [fixture:
  er/db-acc-title-empty-takes-next-line] [fixture:
  er/db-acc-title-directive-in-text]
- `accDescr` is the text after `accDescr:`, or the text of an `accDescr { }`
  block, trimmed; a later one of either form replaces the earlier, but an empty
  block changes nothing and leaves the description before it. The lines of a
  block are joined by a line feed with the white space at the start of each line
  removed, so an empty line and a line of whitespace leave no extra line feed. A
  comment line and a directive line inside the block are no text, and U+2028 is
  kept. [fixture: er/db-acc-descr-line] [fixture: er/db-acc-descr-block]
  [fixture: er/db-acc-descr-replaces] [fixture:
  er/db-acc-descr-block-comment-line] [fixture:
  er/db-acc-descr-block-then-empty] [fixture:
  er/db-acc-descr-block-directive-line] [fixture:
  er/db-acc-descr-block-empty-line] [fixture:
  er/db-acc-descr-block-whitespace-line] [fixture:
  er/db-acc-descr-block-line-separator]
- The line rule applies to these lines like to any other: in
  `accTitle: style:#x;y;` the last `;` is ignored and `#x;` is read as a
  character entity, replaced by a placeholder, in the title as in the
  description. [fixture: er/db-acc-title-ignored-semicolon] [fixture:
  er/db-acc-descr-block-ignored-semicolon]
- A comment line, a directive line, an empty line, and a line of whitespace
  between statements are no text. [fixture: er/db-comment-line] [fixture:
  er/db-directive-line] [fixture: er/db-empty-line] [fixture:
  er/db-whitespace-line]

Values are recorded as the Db holds them. mermaid.js passes four texts through
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L351-L353):
`title`, `accTitle`, `accDescr`, and the title of a subgraph, and no other text
of the Db: names, aliases, attributes, roles, ids, nodes, classes, and styles
are as written. The summary is the same under `look` (`classic`, `handDrawn`,
`neo`), and under `securityLevel` when it is one of `strict`, `loose`,
`antiscript` and `sandbox`. For another `securityLevel`, with HTML labels
enabled, those four texts hold the replaced characters (see
[db-from-tree.md](./db-from-tree.md#the-replacement-of-characters)); with HTML
labels disabled they do not. [fixture: er/config-look-classic] [fixture:
er/config-look-hand-drawn] [fixture: er/config-look-neo] [fixture:
er/config-security-level-strict-subgraph-title] [fixture:
er/config-security-level-loose-subgraph-title] [fixture:
er/config-security-level-antiscript-subgraph-title] [fixture:
er/config-security-level-sandbox-subgraph-title] [fixture:
er/config-security-level-other-subgraph-title] [fixture:
er/config-security-level-other-subgraph-title-words] [fixture:
er/config-security-level-other-subgraph-title-trimmed] [fixture:
er/config-security-level-other-subgraph-title-html-labels-false] [fixture:
er/config-security-level-other-diagram-title] [fixture:
er/config-security-level-other-acc-title] [fixture:
er/config-security-level-other-acc-descr] [fixture:
er/config-security-level-other-acc-descr-block] [fixture:
er/config-security-level-other-names-as-written]

## gantt

The fields of the summary:

| Field               | Content                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| `dateFormat`        | The text of the last `dateFormat` statement, or the empty text.                        |
| `axisFormat`        | The text of the last `axisFormat` statement, or the empty text.                        |
| `tickInterval`      | The text of the last `tickInterval` statement; no field without one.                   |
| `todayMarker`       | The text of the last `todayMarker` statement, or the empty text.                       |
| `includes`          | The included tokens, in lower case, merged over the statements.                        |
| `excludes`          | The excluded tokens, in lower case, merged over the statements.                        |
| `inclusiveEndDates` | Whether an `inclusiveEndDates` statement is there.                                     |
| `weekday`           | The first day of the week of the last `weekday` statement, `sunday` without one.       |
| `weekend`           | The first day of the weekend of the last `weekend` statement, `saturday` without one.  |
| `title`             | The title of the last `title` statement, else of the frontmatter, else the empty text. |
| `accTitle`          | The accessibility title, or the empty text.                                            |
| `accDescr`          | The accessibility description, or the empty text.                                      |
| `sections`          | The names of the sections, one for each `section` statement, in source order.          |
| `tasks`             | The tasks, in source order.                                                            |
| `links`             | The links of the tasks, in the order of their first `click` with `href`.               |
| `clickCalls`        | The `click` statements with `call`, in source order; no field without one.             |

A task has `section`, `task`, `classes`, `raw`, `order`, and, when the text sets
them, `id`, `active`, `done`, `crit`, `milestone`, and `vert`. `raw` has
`startTime` and `endTime`. A link has `id` and `url`. A click call has `id`,
`name`, and `args`.

`normalizeGantt()` (`src/normalizers/gantt.ts`) summarizes the Db of `gantt`.
The Db is
[one object](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDiagram.ts#L8-L10)
that every gantt diagram shares, and its state is variables of the module that
`clear()` resets before each parse, so its patch (`patchGanttDb()`) is applied
to the object and not to a class. The patch keeps what the Db does not give back
or gives back changed:

- The tasks. The Db keeps them in a private array that only
  [`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L169-L181)
  returns, and it computes the dates of the tasks first (see below). The patch
  takes the array right after `clear()`, when it is empty, and the summary reads
  the tasks as
  [`addTask()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L557-L591)
  made them.
- The ids of the tasks. `clear()` resets the tasks but not the table from an id
  to the position of its task, so an id that a text does not define would find
  the task that has the position of an old id of an earlier text, and a `click`
  on it would link that task. Before `clear()`, the patch moves the positions of
  the ids of the earlier text beyond every task, so that the Db of a text does
  not depend on the texts parsed before it.
- The links. `setLink()` stores what `@braintree/sanitize-url` makes of the URL
  unless `securityLevel` is `loose`, which is not what the text says, and the
  summary is the same under every `securityLevel` (see
  [expected-results.md](./expected-results.md)). The patch stores the URL as
  written, which is what the Db stores under `loose`. [fixture:
  gantt/config-security-level-strict-click-href] [fixture:
  gantt/config-security-level-sandbox-click-href]
- The calls that bind a click callback. The Db keeps the function name and the
  arguments in a closure, and only under `securityLevel: loose`. The patch
  records each call as the grammar makes it (see
  `src/normalizers/click-calls.ts`). [fixture:
  gantt/config-security-level-loose-click-call] [fixture:
  gantt/config-security-level-antiscript-click-call]

`weekend` has no getter. It is read through
[`isInvalidDate()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L183-L201),
the method that uses it: given a Friday and `weekends` as the excluded tokens,
it answers true only when the weekend starts on Friday.

It drops the following, each for the reason given:

- The dates of the tasks (`startTime`, `endTime`, `renderEndTime`) and the
  fields that only say how far they are computed (`processed`, `manualEndTime`).
  The renderer computes them when it draws the diagram, not while the text is
  parsed:
  [`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L169-L181)
  does, and the result depends on the time zone of the process; on the day on
  which it runs, since a start after an id that is no task, and an end until
  one, is
  [today](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L320-L322);
  and on how `dayjs` reads `dateFormat`. It also throws for a start that is no
  date
  ([`Invalid date`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L346-L346)),
  although the text is accepted. What the text determines is how the dates are
  given, which is `raw`; it does not determine the dates. The summary is
  therefore the same on every day and in every time zone. [fixture:
  gantt/db-task-start-after-unknown] [fixture: gantt/db-task-start-not-a-date]
  [fixture: gantt/db-task-end-until-unknown]
- `type`: the section again. `prevTaskId`: the id of the task before, which
  `raw.startTime` and the order of the tasks give. `raw.data`: the text of the
  data, of which `raw`, `id`, and the tags are the reading.
- `topAxis`: only the method `enableTopAxis()` sets it, but the statement
  `topAxis` calls
  [`yy.TopAxis()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L141-L141),
  which the Db does not have, so mermaid.js rejects the statement with a
  `TypeError` and no accepted text sets the flag. [fixture:
  gantt/db-top-axis-statement]
- `displayMode`, which no statement sets (the renderer reads it from the
  configuration), and `diagramId` and the functions of the click statements,
  which are set when the diagram is drawn.

Values of the summary, by field:

**Settings**

- `dateFormat`, `axisFormat`, `tickInterval`, and `todayMarker` are the text
  after the keyword, without the one whitespace character that follows it; the
  other spaces, also at the end, stay. The text ends before a `#`, a `;`, or the
  line break, except for `todayMarker`, which ends before a `;` or the line
  break and holds a `#`; what follows is read as a statement of its own. The
  same end holds for the tokens of `includes` and `excludes` (below). A later
  statement replaces an earlier one. [fixture:
  gantt/db-date-format-ends-at-hash] [fixture:
  gantt/db-date-format-ends-at-semicolon] [fixture:
  gantt/db-axis-format-ends-at-hash] [fixture:
  gantt/db-axis-format-ends-at-semicolon] [fixture:
  gantt/db-tick-interval-ends-at-hash] [fixture:
  gantt/db-tick-interval-ends-at-semicolon] [fixture:
  gantt/db-excludes-ends-at-hash] [fixture: gantt/db-excludes-ends-at-semicolon]
  [fixture: gantt/db-includes-ends-at-hash] [fixture:
  gantt/db-includes-ends-at-semicolon] [fixture:
  gantt/db-today-marker-holds-hash] [fixture:
  gantt/db-today-marker-ends-at-semicolon] [fixture: gantt/db-date-format]
  [fixture: gantt/db-date-format-extra-spaces] [fixture:
  gantt/db-date-format-last-wins] [fixture: gantt/db-axis-format] [fixture:
  gantt/db-tick-interval] [fixture: gantt/db-today-marker] [fixture:
  gantt/db-today-marker-off]
- `includes` and `excludes` are lists of tokens, which
  [`mergeTokens`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L133-L139)
  makes: the text of each statement in lower case, split at whitespace and
  commas, added to the tokens of the earlier statements, a token only once, at
  its first place. [fixture: gantt/db-excludes-tokens] [fixture:
  gantt/db-excludes-merged-lines] [fixture: gantt/db-excludes-duplicates]
  [fixture: gantt/db-includes-tokens]
- `inclusiveEndDates` is true with the statement. [fixture:
  gantt/db-inclusive-end-dates]
- `weekday` is the day of the last `weekday` statement, and `weekend` the day of
  the last `weekend` statement, in lower case, whatever the case in the text.
  [fixture: gantt/db-weekday-last-wins] [fixture: gantt/db-weekend-friday]
  [fixture: gantt/db-weekend-saturday]

**Texts**

- `title` is the text after `title` and its whitespace, with `#` and `;`. A
  `title` statement replaces the title of the frontmatter. [fixture:
  gantt/db-title-statement] [fixture: gantt/db-title-frontmatter] [fixture:
  gantt/db-title-statement-after-frontmatter]
- `accTitle` and `accDescr` are the text of the statement, trimmed. The text of
  a description in a block has its line breaks, and the whitespace after each of
  them is left out. [fixture: gantt/db-acc-title] [fixture: gantt/db-acc-descr]
  [fixture: gantt/db-acc-descr-block]
- The title and the accessibility texts pass through `sanitizeText` and, under a
  `securityLevel` that is not one of mermaid.js's values with HTML labels
  enabled, hold the replaced characters (see
  [db-from-tree.md](./db-from-tree.md), the replacement of characters). The
  names of sections and the descriptions of tasks are not changed. [fixture:
  gantt/config-security-level-other-title] [fixture:
  gantt/config-security-level-other-acc-title] [fixture:
  gantt/config-security-level-other-acc-descr] [fixture:
  gantt/config-security-level-other-names-as-written]

**Sections and tasks**

- `sections` has the text of each `section` statement without the keyword and
  the one whitespace character after it, also when a name repeats. A task before
  the first section has the empty `section`. [fixture: gantt/db-sections]
  [fixture: gantt/db-task-before-section]
- `task` is the text before the colon, with the spaces before it. [fixture:
  gantt/db-task-description-spaces]
- The data after the colon is split at commas into items, after the tags (see
  below), and
  [`parseData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L497-L551)
  reads one item as the end, two as the start and the end, and three as the id,
  the start, and the end. With one item the start is `prevTaskEnd`, with the id
  of the task before, and without an id for the first task. [fixture:
  gantt/db-task-id-written] [fixture: gantt/db-task-forms] [fixture:
  gantt/db-task-empty-data]
- With four items or more, the task has no `id`, and `raw` has neither a start
  nor an end. [fixture: gantt/db-task-four-items]
- The items are trimmed and kept as written: a start after ids (`after a b`), an
  end until an id, and an end that is a date or a length. [fixture:
  gantt/db-task-after-ids] [fixture: gantt/db-task-end-until] [fixture:
  gantt/db-task-end-date]
- A task without an id is
  [numbered](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L430-L436)
  `task1`, `task2`, ... among the tasks without one, from one in each text.
  [fixture: gantt/db-task-id-numbered]
- A tag is one of `active`, `done`, `crit`, `milestone`, and `vert`, written in
  lower case, and
  [taken from the front](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L846-L860)
  of the items as long as the first item is one; it sets its flag, once for a
  repeated tag, and is not an item. A tag in another place, or in another case,
  is an item. [fixture: gantt/db-task-tags] [fixture: gantt/db-task-tag-case]
  [fixture: gantt/db-task-tag-after-item] [fixture: gantt/db-task-tag-repeated]
- `order` is the number of the task among the tasks, from 0; a `vert` task has
  -1 and takes no number. [fixture: gantt/db-task-vert]
- `id` is not unique. A later task with the same id is the one that `click`
  finds. [fixture: gantt/db-task-duplicate-id]

**Links and clicks**

- A `click` statement gives the tasks of its ids the class `clickable` once for
  each of its two parts, `href` and `call`, in `classes`. An id that is no task
  at that point (an unknown id, a task that comes later) gets nothing. [fixture:
  gantt/db-click-href] [fixture: gantt/db-click-call] [fixture:
  gantt/db-click-href-then-call] [fixture: gantt/db-click-call-then-href]
  [fixture: gantt/db-click-unknown-id] [fixture: gantt/db-click-before-task]
- The ids of a `click` are a list separated by commas. [fixture:
  gantt/db-click-ids-list]
- `links` has the URL of `href` as written, once for each task, at the place of
  its first link, with the URL of its last. [fixture:
  gantt/db-click-links-order]
- `clickCalls` has each call as the grammar made it: `id` is the list of ids as
  written, also with an id that is no task, `name` the function, and `args` the
  text between the parentheses as written, or null. [fixture:
  gantt/db-click-call-args] [fixture: gantt/db-click-ids-list]

Values are recorded as the Db holds them, whitespace included.

## journey

The fields of the summary:

| Field      | Content                                                                       |
| ---------- | ----------------------------------------------------------------------------- |
| `title`    | The title of the last `title` statement, else of the frontmatter, else empty. |
| `accTitle` | The accessibility title, or the empty text.                                   |
| `accDescr` | The accessibility description, or the empty text.                             |
| `sections` | The names of the sections, one for each `section` statement, in source order. |
| `tasks`    | The tasks, in source order.                                                   |

A task has `section`, `task`, `people`, and `score`.

`normalizeJourney()` (`src/normalizers/journey.ts`) summarizes the Db of
`journey`. The Db reads no browser feature, no time and no random value, and the
syntax has no links, so the summary needs no patch of the Db. It is one object
that every journey diagram shares, whose state `clear()` resets before each
parse.
[`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L35-L47)
appends the tasks to its list every time it is called, so the summary reads the
list once and empties it again, which leaves the Db as it was. It drops the
following, each for the reason given:

- `tasks[].type`: the section again.
- `getActors()`
  ([`updateActors`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L49-L59)):
  the people of the tasks, without repeats and sorted, made from the tasks
  alone.

Values of the summary, by field:

- `title` is the text after `title` and one whitespace character, up to a `#` or
  the end of the line. The whitespace at its ends stays: `title  T`, with two
  spaces, has the title ` T`. A `;` after the text makes the input rejected,
  because it ends the text and no rule takes it. A `title` statement replaces
  the title of the frontmatter. [fixture: journey/db-title-statement] [fixture:
  journey/lex-title-two-spaces] [fixture: journey/lex-title-trailing-spaces]
  [fixture: journey/db-title-ends-at-hash] [fixture:
  journey/lex-title-semicolon] [fixture: journey/db-title-frontmatter] [fixture:
  journey/db-title-statement-after-frontmatter]
- `accTitle` and `accDescr` are the text of the statement, trimmed. The text of
  a description in a block has its line breaks, and the whitespace after each of
  them is left out. [fixture: journey/db-acc-title] [fixture:
  journey/db-acc-descr] [fixture: journey/db-acc-descr-block]
- The title and the accessibility texts pass through `sanitizeText` and, under a
  `securityLevel` that is not one of mermaid.js's values with HTML labels
  enabled, hold the replaced characters (see
  [db-from-tree.md](./db-from-tree.md), the replacement of characters). The
  names of sections, the descriptions of tasks, and the people are not changed.
  [fixture: journey/config-security-level-other-title] [fixture:
  journey/config-security-level-other-diagram-title] [fixture:
  journey/config-security-level-other-acc-title] [fixture:
  journey/config-security-level-other-acc-descr] [fixture:
  journey/config-security-level-other-acc-descr-block] [fixture:
  journey/config-security-level-other-names-as-written]
- `sections` has the text of each `section` statement without the keyword and
  the one whitespace character after it, also when a name repeats. A task before
  the first section has the empty `section`. The name ends before a `#`, which
  starts a comment to the end of the line; the space before it stays, and so
  does the whitespace at its start, a name of whitespace only included. A `;`
  after the name and a `:` after it make the input rejected, because they end
  the text and no rule takes what follows. [fixture: journey/db-sections]
  [fixture: journey/db-task-before-section] [fixture:
  journey/db-section-ends-at-hash] [fixture: journey/lex-section-two-spaces]
  [fixture: journey/lex-section-whitespace-only] [fixture:
  journey/lex-section-semicolon] [fixture: journey/lex-section-colon]
- `task` is the text before the first colon, with the whitespace that stands
  before the colon; the whitespace before the text is not part of it. [fixture:
  journey/db-task-description-spaces] [fixture:
  journey/lex-whitespace-ideographic-space-around-task]
- [`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
  splits the text after the first colon at each colon. `score` is the number
  that JavaScript makes of the first piece, so a decimal, a hexadecimal number,
  an exponent, and a negative number are numbers, the spaces around the number
  are not part of it, and an empty piece and a piece of whitespace only are 0.
  `-0` is the number -0 in the Db, and the summary holds 0, since JSON has no
  -0. [fixture: journey/db-task-score-decimal] [fixture:
  journey/db-task-score-hexadecimal] [fixture: journey/db-task-score-exponent]
  [fixture: journey/db-task-score-negative] [fixture:
  journey/db-task-score-negative-zero] [fixture: journey/db-task-score-spaces]
  [fixture: journey/db-task-score-empty] [fixture:
  journey/gram-task-data-whitespace-only] A score that is no finite number is
  recorded as the text of the number, since JSON has no such number: `NaN` for a
  piece that is no number, and `Infinity` or `-Infinity` for the pieces
  `Infinity` and `-Infinity` and for a number too large for a double, such as
  `1e400`. [fixture: journey/db-task-score-not-a-number] [fixture:
  journey/db-task-score-infinity] [fixture:
  journey/db-task-score-negative-infinity] [fixture:
  journey/db-task-score-overflow]
- `people` is the second piece split at each comma and trimmed, one name more
  than there are commas, so an empty item is an empty name and a blank piece is
  one empty name. Without a second colon there are no people, while a second
  colon with nothing after it gives one empty name. The text from the third
  colon is left out. [fixture: journey/db-task-people] [fixture:
  journey/db-task-people-empty-item] [fixture: journey/db-task-people-blank]
  [fixture: journey/gram-task-people-trailing-comma] [fixture:
  journey/gram-task-second-colon-at-end] [fixture: journey/db-task-score-only]
  [fixture: journey/db-task-extra-colon] The data of a task ends before a `#` as
  well, and the rest of the line is a comment: `A: 1: x #y, z` has the people
  `x`. [fixture: journey/db-task-data-ends-at-hash]

Values are recorded as the Db holds them, whitespace included.

## requirement

The fields of the summary:

| Field           | Content                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| `direction`     | `TB`, or the direction of the last direction statement.                            |
| `title`         | The title of the frontmatter, or the empty text.                                   |
| `accTitle`      | The accessibility title, or the empty text.                                        |
| `accDescr`      | The accessibility description, or the empty text.                                  |
| `requirements`  | The requirements, in the order of their first definitions.                         |
| `elements`      | The elements, in the order of their first definitions.                             |
| `relationships` | The relationships, in source order.                                                |
| `classes`       | The class definitions (`classDef`), in the order of the first definition of an id. |

A requirement has `name`, `type`, `requirementId`, `text`, `risk`,
`verifyMethod`, `cssStyles` and `classes`. An element has `name`, `type`,
`docRef`, `cssStyles` and `classes`. A relationship has `type`, `src` and `dst`.
A class definition has `id` and `styles`.

`normalizeRequirement()` (`src/normalizers/requirement.ts`) summarizes the Db of
`requirement`. The Db reads no browser feature, no time and no random value, and
the syntax has no links, so the summary needs no patch of the Db. It reads the
Db's own lists (`getRequirements()`, `getElements()`, `getRelationships()`,
`getClasses()`), not the layout data of
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L292-L342):
that function sets more fields on the stored objects of the requirements and
elements, and makes the edges, all from the lists. It drops the following, each
for the reason given:

- The first name of `classes` of a requirement or an element, `default`: every
  one starts with it, whatever the statements say. The names that statements
  give follow it, and a statement may give `default` too, which stays.
- `classes[].textStyles`: the styles of the class that mention a color, made
  from `styles` alone.
- What `getData()` makes of the Db: the `id`, `shape`, `look`, `cssClasses` and
  `colorIndex` of a node, and the ids, labels, arrow types and line pattern of
  the edges. `look` is a site setting.
- The requirement and the element being read: each is reset when its definition
  ends.

Values of the summary, by field:

- `direction` is `TB` without a direction statement. The last direction
  statement gives it, written in any case and recorded in upper case. [fixture:
  requirement/db-direction-last-wins] [fixture:
  requirement/db-direction-lower-case] [fixture:
  requirement/spec-requirement-diagram-7522200d] [fixture:
  requirement/spec-requirement-diagram-08cfba06] [fixture:
  requirement/spec-requirement-diagram-34fcfcee] [fixture:
  requirement/spec-requirement-diagram-6d165a76]
- `title` is the title of the frontmatter; the diagram has no statement for it.
  `accTitle` and `accDescr` are the text of the last statement of their kind,
  trimmed, but for an empty description block, which changes nothing and leaves
  the description before it. The text of a description in a block has its line
  breaks, and the whitespace after each of them is left out. [fixture:
  requirement/db-frontmatter-title] [fixture: requirement/db-acc-title-descr]
  [fixture: requirement/db-acc-descr-block] [fixture:
  requirement/db-empty-description-block-keeps-acc-descr-line] [fixture:
  requirement/db-empty-description-block-keeps-acc-descr-block] [fixture:
  requirement/spec-requirement-diagram-e5ae8f38] [fixture:
  requirement/spec-requirement-diagram-27be7222]
- The title and the accessibility texts pass through `sanitizeText` and, under a
  `securityLevel` that is not one of mermaid.js's values with HTML labels
  enabled, hold the replaced characters (see
  [db-from-tree.md](./db-from-tree.md), the replacement of characters). The
  names, ids, texts, types and references of requirements and elements, the
  names of relationships and the classes are not changed. [fixture:
  requirement/config-security-level-other-title] [fixture:
  requirement/config-security-level-other-acc-title] [fixture:
  requirement/config-security-level-other-acc-descr] [fixture:
  requirement/config-security-level-other-acc-descr-block] [fixture:
  requirement/config-security-level-other-html-labels-false] [fixture:
  requirement/config-security-level-other-names-as-written]
- Each value is read in
  [converted form](../../spec/docs/common.md#reading-a-source), so an entity is
  its placeholder in a name, an id, a text, a type, a reference, the name of a
  relationship and the accessibility texts. [fixture:
  requirement/entity-placeholder-in-requirement-fields] [fixture:
  requirement/entity-placeholder-in-element-fields] [fixture:
  requirement/entity-placeholder-in-relationship] [fixture:
  requirement/entity-placeholder-in-acc-title] [fixture:
  requirement/entity-placeholder-in-acc-descr] [fixture:
  requirement/entity-placeholder-in-acc-descr-block]
- `requirements` has a requirement for each name, in the order of the first
  definitions. A field that the body does not set is the empty text. [fixture:
  requirement/db-requirement-defaults] [fixture:
  requirement/db-requirement-all-fields] [fixture:
  requirement/db-requirement-order]
- The `type` of a requirement is the name of the word that starts the
  definition: `Requirement`, `Functional Requirement`, `Interface Requirement`,
  `Performance Requirement`, `Physical Requirement` or `Design Constraint`. The
  `risk` is `Low`, `Medium` or `High`, and the `verifyMethod` is `Analysis`,
  `Demonstration`, `Inspection` or `Test`. The words of the syntax are read
  without regard to case, and the Db names them as given here. [fixture:
  requirement/spec-requirement-diagram-54ea0a9d] [fixture:
  requirement/spec-requirement-diagram-d1dc0373] [fixture:
  requirement/spec-requirement-diagram-17e0a905] [fixture:
  requirement/spec-requirement-diagram-f221edee] [fixture:
  requirement/spec-requirement-diagram-0e21244e] [fixture:
  requirement/spec-requirement-diagram-06f108a7] [fixture:
  requirement/spec-requirement-diagram-4a3ca536] [fixture:
  requirement/spec-requirement-diagram-f64fbd88] [fixture:
  requirement/spec-requirement-diagram-1a2f68fa] [fixture:
  requirement/spec-requirement-diagram-1e009b06] [fixture:
  requirement/db-keywords-upper-case]
- An unquoted name or value loses the whitespace at its ends and may hold spaces
  inside. A quoted one keeps every character between the quotes, also those an
  unquoted one cannot hold, and the whitespace. [fixture:
  requirement/db-requirement-value-spaces] [fixture:
  requirement/db-requirement-name-spaces] [fixture:
  requirement/db-requirement-quoted-values]
- A field set more than once keeps the first value, since the Db applies the
  fields of a body from the last to the first. [fixture:
  requirement/db-requirement-fields-repeated] [fixture:
  requirement/db-element-fields-repeated]
- A name defined again, as a requirement of any type or as an element, leaves
  the fields of the first definition as they were, the second body included, but
  the classes after `:::` in the head of the second definition are given: to the
  requirement of that name, or to the element of that name when there is no
  requirement of it, whichever the second definition is. A requirement and an
  element may have the same name, and a statement that names it applies to the
  requirement only. [fixture:
  requirement/db-requirement-definition-again-with-class] [fixture:
  requirement/db-element-definition-with-class-of-requirement] [fixture:
  requirement/db-element-definition-again-with-class] [fixture:
  requirement/db-requirement-name-repeated] [fixture:
  requirement/db-element-name-repeated] [fixture:
  requirement/db-requirement-and-element-same-name] A name is any name,
  `__proto__` and `constructor` too. [fixture:
  requirement/spec-requirement-diagram-7e4de658] [fixture:
  requirement/spec-requirement-diagram-dec8a0d9] [fixture:
  requirement/spec-requirement-diagram-29c59902] [fixture:
  requirement/spec-requirement-diagram-20d637a1]
- `elements` has an element for each name. Its `type` and `docRef` are any text,
  and the empty text where the body does not set them. [fixture:
  requirement/db-element-defaults] [fixture: requirement/db-element-fields]
  [fixture: requirement/spec-requirement-diagram-aa701d4f]
- `relationships` has one relationship for each relationship statement, also for
  one written again. `type` is `contains`, `copies`, `derives`, `satisfies`,
  `verifies`, `refines` or `traces`. `src` is the name at the line and `dst` the
  name at the arrowhead, whichever side of the word it is written on. The names
  need not be those of a requirement or an element, and may be quoted. [fixture:
  requirement/spec-requirement-diagram-ef787489] [fixture:
  requirement/spec-requirement-diagram-50b3d65a] [fixture:
  requirement/spec-requirement-diagram-7dfbfd0b] [fixture:
  requirement/spec-requirement-diagram-bbf167e5] [fixture:
  requirement/spec-requirement-diagram-d742a321] [fixture:
  requirement/spec-requirement-diagram-3adb8f93] [fixture:
  requirement/spec-requirement-diagram-3b9d9ff5] [fixture:
  requirement/db-relationship-arrows] [fixture:
  requirement/db-relationship-quoted-names] [fixture:
  requirement/db-relationship-undefined-names] [fixture:
  requirement/db-relationships-repeated]
- `cssStyles` is the styles that statements gave the requirement or element, in
  the order they were given. A `style` statement adds each of its styles, one
  for each comma, to each name it lists; at the first name that is no
  requirement or element it stops, so that the names after it get nothing.
  [fixture: requirement/db-style-statement] [fixture:
  requirement/db-style-unknown-name] [fixture:
  requirement/db-class-statement-unknown-name-first] [fixture:
  requirement/spec-requirement-diagram-5305b791] [fixture:
  requirement/spec-requirement-diagram-e39bdc99] [fixture:
  requirement/spec-requirement-diagram-5ee6d26d]
- `classes` of a requirement or an element is the class names that statements
  gave it, in order: a `class` statement, `:::` after a name, and `:::` in the
  head of a definition. A name in a `class` statement that is no requirement or
  element is skipped, and the names after it still get the classes. [fixture:
  requirement/db-class-statement] [fixture:
  requirement/db-class-statement-unknown-name-first] [fixture:
  requirement/db-class-colon-form] [fixture: requirement/db-class-in-definition]
  [fixture: requirement/db-class-default-name] [fixture:
  requirement/spec-requirement-diagram-6bb10181] [fixture:
  requirement/spec-requirement-diagram-5128588b] [fixture:
  requirement/spec-requirement-diagram-a55d1b35] [fixture:
  requirement/spec-requirement-diagram-a8854583] [fixture:
  requirement/spec-requirement-diagram-0799fd14]
- A class gives its styles to a requirement or an element in two ways: when the
  member joins the class, if the class is defined by then, and when the class is
  defined, to the members it has at that time. Every requirement and element is
  a member of `default` from the start, so a definition of `default` adds its
  styles to all those defined before it. [fixture:
  requirement/db-class-styles-order] [fixture:
  requirement/db-class-styles-order-defined-first] [fixture:
  requirement/db-class-statement-before-def] [fixture:
  requirement/db-class-def-default-all]
- `classes` of the summary has a class definition for each id, in the order of
  the first definition, with `styles` in the order given. A definition of an id
  again adds its styles; one statement may define several ids. [fixture:
  requirement/db-class-def] [fixture:
  requirement/spec-requirement-diagram-7ee9ffc8] [fixture:
  requirement/spec-requirement-diagram-f9464f3d]

Values are recorded as the Db holds them, whitespace included.

## mindmap

The summary has one field:

| Field  | Content                                             |
| ------ | --------------------------------------------------- |
| `root` | The first node, with the nodes below it, or `null`. |

A node has `nodeId`, `level`, `descr`, `type`, and `children`, and `icon` and
`class` where a statement gave them. `children` are the nodes whose parent it
is, in source order.

`normalizeMindmap()` (`src/normalizers/mindmap.ts`) summarizes the Db of
`mindmap`. The Db reads no browser feature, no time and no random value (the
random id belongs to
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L345-L408)),
and the syntax has no links, so the summary needs no patch of the Db. It reads
the tree that
[`getMindmap()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L71-L73)
returns, which holds every node once with its children, and not the layout data
of `getData()`, which numbers the sections of the nodes and makes new nodes from
them. It drops the following, each for the reason given:

- `id`: the number of the node in the order it was added, which is the order of
  the tree walked from the root, children after their parent.
- `isRoot`: true for the root and for no other node.
- `width` and `padding`: values of the site configuration
  (`mindmap.maxNodeWidth` and `mindmap.padding`, the padding doubled for some
  shapes). [fixture: mindmap/config-mindmap-padding-and-width]

The layout and `getData()` put more fields on a node (`section`, `height`, `x`,
and `y`); the Db that is read has none of them.

Values of the summary, by field:

- `root` is `null` for a header with nothing after it, also when whitespace or a
  comment line follows. The first node is the root. A header that has no line
  feed after it is rejected. [fixture: mindmap/db-header-only] [fixture:
  mindmap/db-header-only-trailing-spaces] [fixture:
  mindmap/db-header-then-comment-line-only] [fixture:
  mindmap/db-header-without-line-feed]
- The root is the first node whatever its indentation, and the whitespace before
  the header does not change the levels: a node after the header on its line is
  the root, with the whole run of whitespace after the header as its
  indentation, so that a child must be indented by more characters than that run
  has. [fixture: mindmap/db-first-node-unindented] [fixture:
  mindmap/db-header-indented] [fixture: mindmap/db-first-node-on-header-line]
  [fixture: mindmap/db-first-node-on-header-line-wide-gap] [fixture:
  mindmap/db-first-node-on-header-line-child-too-shallow] [fixture:
  mindmap/db-first-node-after-header-tab] [fixture:
  mindmap/spec-mindmap-903e1973] [fixture: mindmap/spec-mindmap-54e233b2]
- `level` is the number of characters of the indentation of the node minus that
  of the root. Every whitespace character is one character: a space, a tab
  (which is not expanded to a tab stop), a fullwidth space, and a no-break
  space. [fixture: mindmap/db-indent-tab-levels] [fixture:
  mindmap/db-indent-tab-counts-as-one-char] [fixture:
  mindmap/db-indent-fullwidth-space] [fixture: mindmap/db-indent-no-break-space]
  [fixture: mindmap/db-indent-mixed-whitespace-kinds] [fixture:
  mindmap/db-indent-root-offset] [fixture: mindmap/db-indent-skips-levels]
- The parent of a node is the nearest node before it whose level is less than
  its own, so a node as indented as an earlier one is its sibling, after the
  nodes below that one. A node that is not the first and has no such node is
  rejected: one as indented as the root, or less. [fixture:
  mindmap/db-indent-parent-is-nearest-shallower] [fixture:
  mindmap/db-indent-sibling-after-deeper] [fixture:
  mindmap/db-indent-less-than-root] [fixture: mindmap/db-indent-same-as-root]
  [fixture: mindmap/db-indent-tab-not-expanded-below-root] [fixture:
  mindmap/docs-syntax-mindmap-5106c1aa] [fixture:
  mindmap/docs-syntax-mindmap-50120b03] [fixture: mindmap/spec-mindmap-53c49526]
  [fixture: mindmap/spec-mindmap-bc95ec97]
- An empty line, a line of whitespace, and a line break that is a CRLF or a lone
  CR between nodes change nothing, and an empty line or a line of whitespace
  between the header and the first node is rejected. Whitespace after the last
  node changes nothing. [fixture: mindmap/db-blank-line-between-nodes] [fixture:
  mindmap/db-whitespace-only-line-between-nodes] [fixture:
  mindmap/db-tab-only-line-between-nodes] [fixture:
  mindmap/db-blank-line-after-header] [fixture:
  mindmap/db-whitespace-line-after-header] [fixture:
  mindmap/db-whitespace-after-last-node] [fixture: mindmap/db-crlf-line-ends]
  [fixture: mindmap/db-lone-cr-line-ends] [fixture:
  mindmap/spec-mindmap-c6c76671] [fixture: mindmap/spec-mindmap-931bf91d]
- A comment line, `%%` with the whitespace before it, changes nothing wherever
  it stands, also between the header and the first node and before the header,
  and its indentation changes no level. `%%` after the text of a node is part of
  the text. A directive line is removed like a comment line, so one between the
  header and the first node leaves an empty line there and is rejected, while
  one between nodes changes nothing; a directive after the text of a node is not
  part of it. The frontmatter changes nothing, and the diagram keeps no title.
  [fixture: mindmap/db-comment-line-between-nodes] [fixture:
  mindmap/db-comment-line-indented-deeper] [fixture:
  mindmap/db-comment-line-after-header] [fixture:
  mindmap/db-comment-before-header] [fixture:
  mindmap/db-comment-after-node-text] [fixture:
  mindmap/db-directive-line-between-nodes] [fixture:
  mindmap/db-directive-line-indented] [fixture:
  mindmap/db-directive-between-header-and-first-node] [fixture:
  mindmap/db-directive-after-node-text] [fixture:
  mindmap/db-frontmatter-before-header] [fixture: mindmap/spec-mindmap-32c71b33]
  [fixture: mindmap/spec-mindmap-f8ad2bf0]
- A node without a shape has the whole line after its indentation as `nodeId`
  and as `descr`, the whitespace at its end included, and a colon, a hash, a
  quote, and spaces are characters of it. Two nodes may have the same text.
  [fixture: mindmap/db-node-trailing-whitespace] [fixture:
  mindmap/db-text-with-colon-and-hash] [fixture: mindmap/db-text-with-quote]
  [fixture: mindmap/db-same-text-twice] [fixture:
  mindmap/docs-syntax-mindmap-85604c12]
- A shape is a delimiter pair after the id (or without an id, then the text is
  the id) and gives `type`: 0 for no shape, 1 for `( )`, 2 for `[ ]`, 3 for
  `(( ))`, 4 for `) (`, 5 for `)) ((`, and 6 for `{{ }}`. `descr` is the text
  between the delimiters. The closing delimiter of a rectangle need not match
  the opening one, the forms `(-text-)` and `-)text(-` follow the lexer and not
  the pairs, and a string between the delimiters holds delimiter characters; a
  markdown string is the text without its backquotes. A shape with no text, and
  text after the closing delimiter, are rejected. [fixture:
  mindmap/db-shape-rect] [fixture: mindmap/db-shape-rounded] [fixture:
  mindmap/db-shape-circle] [fixture: mindmap/db-shape-cloud] [fixture:
  mindmap/db-shape-bang] [fixture: mindmap/db-shape-hexagon] [fixture:
  mindmap/db-shape-cloud-dash-form] [fixture:
  mindmap/db-shape-explode-dash-form] [fixture: mindmap/db-shape-without-id]
  [fixture: mindmap/db-shape-without-id-circle] [fixture:
  mindmap/db-shape-mismatched-end] [fixture: mindmap/db-shape-string] [fixture:
  mindmap/db-shape-markdown-string] [fixture:
  mindmap/db-shape-empty-description] [fixture: mindmap/db-shape-text-after-end]
  [fixture: mindmap/db-shape-id-with-parentheses] [fixture:
  mindmap/spec-mindmap-2ab5d128] [fixture: mindmap/spec-mindmap-3b2342ba]
  [fixture: mindmap/spec-mindmap-5ccc3578] [fixture:
  mindmap/spec-mindmap-20bffa18] [fixture: mindmap/spec-mindmap-042bfdb5]
  [fixture: mindmap/spec-mindmap-3a9de64e]
- A line `::icon(text)` gives `icon` to the last node added, and a line
  `:::text` gives `class`, whatever their indentation; a second line replaces
  the first. An icon on the line of a node is no icon, and a class there is part
  of the text of the node. The word `icon` is read without regard to case, an
  icon with nothing in the parentheses gives none, and the whitespace inside the
  parentheses of an icon and at both ends of a class stays. An icon line or a
  class line before the first node is rejected. [fixture: mindmap/db-icon-line]
  [fixture: mindmap/db-icon-same-line] [fixture: mindmap/db-icon-twice]
  [fixture: mindmap/db-icon-and-class-on-child] [fixture:
  mindmap/db-icon-indent-ignored] [fixture: mindmap/db-icon-before-node]
  [fixture: mindmap/db-icon-case-insensitive] [fixture: mindmap/db-icon-empty]
  [fixture: mindmap/db-class-line] [fixture: mindmap/db-class-twice] [fixture:
  mindmap/db-class-same-line-as-node] [fixture: mindmap/db-class-before-node]
  [fixture: mindmap/db-class-trailing-space] [fixture:
  mindmap/db-class-leading-whitespace] [fixture:
  mindmap/db-icon-surrounding-whitespace] [fixture: mindmap/db-class-empty]
  [fixture: mindmap/spec-mindmap-2b7307a0] [fixture:
  mindmap/spec-mindmap-4755cd73] [fixture: mindmap/spec-mindmap-c9bb7eac]
  [fixture: mindmap/spec-mindmap-da41aead]
- Each value is read in
  [converted form](../../spec/docs/common.md#reading-a-source), so an entity is
  its placeholder in the text of a node and of a shape, in an icon, and in a
  class. A line feed inside a string stays in the text, a CRLF there is a line
  feed, and an attribute quote in the text of a shape is a single quote.
  [fixture: mindmap/entity-placeholder-in-node-text] [fixture:
  mindmap/entity-placeholder-numeric] [fixture:
  mindmap/entity-placeholder-in-description] [fixture:
  mindmap/entity-placeholder-in-icon] [fixture:
  mindmap/entity-placeholder-in-class] [fixture:
  mindmap/lex-html-attribute-quote-in-description] [fixture:
  mindmap/lex-string-line-feed] [fixture: mindmap/lex-string-crlf] [fixture:
  mindmap/lex-markdown-string-line-feed] [fixture:
  mindmap/docs-syntax-mindmap-d3468819]
- `nodeId`, `descr`, `icon`, and `class` pass through `sanitizeText` and, under
  a `securityLevel` that is not one of mermaid.js's values with HTML labels
  enabled, hold the replaced characters (see
  [db-from-tree.md](./db-from-tree.md), the replacement of characters).
  [fixture: mindmap/config-security-level-other-texts] [fixture:
  mindmap/config-security-level-other-html-labels-false]

Values are recorded as the Db holds them, whitespace included.

## timeline

The fields of the summary:

| Field       | Content                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| `direction` | `LR`, or `TD` for `timeline TD`.                                              |
| `title`     | The title of the last `title` statement, or the empty text.                   |
| `accTitle`  | The accessibility title, or the empty text.                                   |
| `accDescr`  | The accessibility description, or the empty text.                             |
| `sections`  | The texts of the sections, one for each `section` statement, in source order. |
| `tasks`     | The tasks, in source order.                                                   |

A task has `section`, `task`, and `events`.

`normalizeTimeline()` (`src/normalizers/timeline.ts`) summarizes the Db of
`timeline`. The Db reads no browser feature, no time and no random value, and
the syntax has no links, so the summary needs no patch of the Db. It is one
module that every timeline diagram shares, whose state
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L12-L19)
resets before each parse, but for the counter of the tasks.
[`getTasks()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L38-L50)
appends the tasks to its list every time it is called, so the summary reads the
list once and empties it again, which leaves the Db as it was. It drops the
following, each for the reason given:

- `tasks[].id`: the number of the task, taken from a counter that `clear()` does
  not reset, so that it depends on the diagrams parsed before this one. The
  order of the tasks is their order in the list.
- `tasks[].type`: the section again.
- `tasks[].score`: always 0, since
  [the grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L35)
  adds every task with the score 0
  ([`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L52-L63)).

Values of the summary, by field:

- `direction` is `TD` where the header is followed by spaces or tabs and `TD`,
  `LR` otherwise; the direction is read in any case. The keyword must end there:
  `TDx` and `LRx` are the period of a task, and the direction stays `LR`. Only a
  space or a tab separates the header and the direction: any other whitespace, a
  line feed included, leaves the direction to be the period of a task. A second
  direction is a period as well. [fixture: timeline/db-header-only] [fixture:
  timeline/db-direction-lr] [fixture: timeline/db-direction-td] [fixture:
  timeline/db-direction-lower-case] [fixture: timeline/db-direction-mixed-case]
  [fixture: timeline/db-direction-two-spaces] [fixture:
  timeline/db-direction-tab] [fixture: timeline/db-direction-trailing-space]
  [fixture: timeline/header-direction-no-break-space] [fixture:
  timeline/header-direction-ideographic-space] [fixture:
  timeline/header-direction-line-feed] [fixture:
  timeline/header-direction-word-suffix] [fixture:
  timeline/header-direction-word-suffix-lr] [fixture:
  timeline/header-direction-twice]
- The header is detected in lower case only. What follows the header on its line
  is read as lines are: a period, a title, a section, an accessibility title, a
  `#` or `%` comment, and a directive that is removed; an event has no task
  there and is rejected. A word glued to the header is not the header, a dash
  after the header starts the period `-x`, and a colon after it is an event with
  no task. A second header is rejected. [fixture:
  timeline/header-without-line-feed] [fixture: timeline/header-trailing-spaces]
  [fixture: timeline/header-direction-then-colon] [fixture:
  timeline/header-direction-glued-colon] [fixture:
  timeline/header-glued-direction] [fixture: timeline/header-word-suffix]
  [fixture: timeline/header-dash-suffix] [fixture: timeline/header-colon-suffix]
  [fixture: timeline/header-text-on-header-line] [fixture:
  timeline/header-period-with-event-on-header-line] [fixture:
  timeline/header-event-on-header-line] [fixture:
  timeline/header-title-on-header-line] [fixture:
  timeline/header-section-on-header-line] [fixture:
  timeline/header-acc-title-on-header-line] [fixture: timeline/header-indented]
  [fixture: timeline/header-after-blank-lines] [fixture:
  timeline/header-after-comment-line] [fixture: timeline/header-after-hash-line]
  [fixture: timeline/header-upper-case] [fixture: timeline/header-capitalized]
  [fixture: timeline/header-hash-comment-on-header-line] [fixture:
  timeline/header-percent-comment-on-header-line] [fixture:
  timeline/header-single-percent-comment-on-header-line] [fixture:
  timeline/header-directive-before-direction] [fixture:
  timeline/header-directive-after-header] [fixture: timeline/header-twice]
  [fixture: timeline/header-twice-with-directions]
- `title` is the text of a
  [`title` statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L23),
  after the keyword and one whitespace character, to the end of the line. The
  keyword is read in any case. The whitespace at its ends stays: `title  T`,
  with two spaces, has the title ` T`, and the spaces at the end stay. A `:`, a
  `#`, and `%%` are characters of the title, and so is a `;` but for the one
  that the line rule of `style` lines drops (see below). The last `title`
  statement is the title. Any whitespace character can follow the keyword and is
  no part of the title, a line feed included, so that `title` at the end of a
  line takes the next line as its title, whatever that line says. [fixture:
  timeline/db-title-statement] [fixture: timeline/db-title-upper-case] [fixture:
  timeline/db-title-two-spaces] [fixture: timeline/db-title-three-spaces]
  [fixture: timeline/db-title-trailing-spaces] [fixture:
  timeline/db-title-only-space] [fixture: timeline/db-title-colon] [fixture:
  timeline/db-title-hash] [fixture: timeline/db-title-percent] [fixture:
  timeline/db-title-semicolon] [fixture: timeline/db-title-twice] [fixture:
  timeline/db-title-with-tags] [fixture: timeline/lex-title-separator-tab]
  [fixture: timeline/lex-title-separator-no-break-space] [fixture:
  timeline/lex-title-separator-ideographic-space] [fixture:
  timeline/lex-title-separator-line-separator] [fixture:
  timeline/lex-title-separator-paragraph-separator] [fixture:
  timeline/lex-title-separator-byte-order-mark] [fixture:
  timeline/lex-title-separator-line-feed] [fixture:
  timeline/lex-title-separator-carriage-return] [fixture:
  timeline/lex-title-line-separator-inside] [fixture:
  timeline/db-period-title-then-section-lines]
- A title statement needs a character after the whitespace that follows the
  keyword, on the same line. The keyword alone at the end of the text, or with
  one space before the end of the line, is the period of a task, as are the
  words that start with `title`. A colon right after the keyword is rejected,
  since a colon needs whitespace after it. [fixture:
  timeline/gram-title-keyword-alone] [fixture:
  timeline/gram-title-keyword-trailing-space] [fixture:
  timeline/gram-title-word-suffix] [fixture: timeline/gram-title-colon-glued]
- The title of the frontmatter is not the title of the diagram:
  [the Diagram](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L52-L54)
  gives it to a Db that has `setDiagramTitle`, and the Db of the timeline has no
  such method. A `title` statement is the title in either case. [fixture:
  timeline/db-title-frontmatter] [fixture:
  timeline/db-title-frontmatter-and-statement]
- `accTitle` and `accDescr` after a `:` are the text of the line, trimmed. The
  whitespace around the colon, a line feed included, is not part of the text, so
  that the colon, or the text, can be on the next line; the keywords are read in
  any case. A `:`, a `#`, and `%%` are characters of the text, and so is a `;`
  but for the one that the line rule of `style` lines drops. A statement with no
  text is rejected. The last statement of each kind is the value, and a
  description in a block and a description on a line replace each other, but for
  an empty block, which replaces nothing. [fixture:
  timeline/db-acc-title-statement] [fixture: timeline/db-acc-title-glued]
  [fixture: timeline/db-acc-title-space-before-colon] [fixture:
  timeline/db-acc-title-upper-case] [fixture: timeline/db-acc-title-many-spaces]
  [fixture: timeline/db-acc-title-trailing-spaces] [fixture:
  timeline/db-acc-title-colon] [fixture: timeline/db-acc-title-hash] [fixture:
  timeline/db-acc-title-percent] [fixture: timeline/db-acc-title-semicolon]
  [fixture: timeline/db-acc-title-twice] [fixture:
  timeline/lex-acc-title-colon-on-next-line] [fixture:
  timeline/lex-acc-title-value-on-next-line] [fixture:
  timeline/lex-acc-title-separator-no-break-space] [fixture:
  timeline/gram-acc-title-empty] [fixture: timeline/gram-acc-title-only-space]
  [fixture: timeline/gram-acc-descr-empty] [fixture:
  timeline/lex-acc-title-line-separator-inside] [fixture:
  timeline/db-acc-descr-statement] [fixture: timeline/db-acc-descr-glued]
  [fixture: timeline/db-acc-descr-trailing-spaces] [fixture:
  timeline/db-acc-descr-hash] [fixture: timeline/db-acc-descr-line-then-block]
  [fixture: timeline/db-acc-descr-block-then-line] [fixture:
  timeline/lex-acc-descr-line-separator-inside] [fixture:
  timeline/db-acc-all-statements]
- The text of a description in a block runs to the first `}`, and a description
  is changed by
  [`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L22-L24):
  the line feed and the whitespace after it, of any kind (a tab, a no-break
  space, a U+3000, a U+2028, a U+FEFF), become one line feed, so that the
  indentation of the lines and the empty lines inside the block are left out;
  the whitespace before a line feed stays. A block needs no whitespace after
  `accDescr`, and the whitespace at its ends is not part of the text. An empty
  block changes nothing: it leaves the description before it, of a line or of a
  block, and without one the description stays empty. A block with no `}` is
  rejected, and what follows the first `}` is read as a line. A line that starts
  with `%%` inside a block is a comment line and is removed. [fixture:
  timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-glued]
  [fixture: timeline/db-acc-descr-block-spaces] [fixture:
  timeline/db-acc-descr-block-empty] [fixture:
  timeline/db-acc-descr-block-braces-only] [fixture:
  timeline/db-acc-descr-block-then-empty-block] [fixture:
  timeline/db-acc-descr-line-then-empty-braces] [fixture:
  timeline/gram-empty-description-block-keeps-description] [fixture:
  timeline/gram-empty-description-block-directive-only] [fixture:
  timeline/gram-empty-description-block-comment-line-only] [fixture:
  timeline/db-acc-descr-block-blank-line] [fixture:
  timeline/db-acc-descr-block-spaces-before-line-feed] [fixture:
  timeline/db-acc-descr-block-tab-before-line-feed] [fixture:
  timeline/db-acc-descr-block-no-break-space-before-line-feed] [fixture:
  timeline/db-acc-descr-block-ideographic-space-before-line-feed] [fixture:
  timeline/db-acc-descr-block-tab-after-line-feed] [fixture:
  timeline/db-acc-descr-block-no-break-space-after-line-feed] [fixture:
  timeline/db-acc-descr-block-ideographic-space-after-line-feed] [fixture:
  timeline/db-acc-descr-block-line-separator-after-line-feed] [fixture:
  timeline/db-acc-descr-block-byte-order-mark-after-line-feed] [fixture:
  timeline/db-acc-descr-block-hash-and-percent] [fixture:
  timeline/db-acc-descr-block-percent-line] [fixture:
  timeline/gram-acc-descr-block-unclosed] [fixture:
  timeline/db-acc-descr-block-brace-inside] [fixture:
  timeline/db-acc-descr-block-then-text] [fixture:
  timeline/lex-acc-descr-block-line-separator-inside]
- The keywords `accTitle` and `accDescr` alone on a line, with no colon or
  brace, are periods. [fixture: timeline/db-period-acc-keywords-alone]
- `sections` has the text of each
  [`section` statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L31)
  without the keyword and the one whitespace character after it, also when a
  text repeats. The text runs to a `:` or the end of the line, so a `#` and `%%`
  are part of it, and so is the whitespace at its ends, a text of one space
  included. The keyword is read in any case, and any whitespace character can
  follow it, a line feed included, which makes the text the next line. A `:`
  ends the text, and the event after it belongs to the last task before the
  section, so it is rejected where there is none; a colon right after the
  keyword is rejected. The keyword alone, the keyword and one space, and the
  words that start with `section` are periods. [fixture:
  timeline/db-section-statement] [fixture: timeline/db-section-upper-case]
  [fixture: timeline/db-section-two-spaces] [fixture:
  timeline/db-section-trailing-spaces] [fixture: timeline/db-section-only-space]
  [fixture: timeline/db-section-hash] [fixture: timeline/db-section-percent]
  [fixture: timeline/db-section-twice-same-name] [fixture:
  timeline/db-section-with-tags] [fixture: timeline/lex-section-separator-tab]
  [fixture: timeline/lex-section-separator-ideographic-space] [fixture:
  timeline/lex-section-separator-line-feed] [fixture:
  timeline/lex-section-separator-line-separator] [fixture:
  timeline/lex-section-line-separator-inside] [fixture:
  timeline/gram-section-keyword-alone] [fixture:
  timeline/gram-section-keyword-trailing-space] [fixture:
  timeline/gram-section-word-suffix] [fixture:
  timeline/gram-section-colon-glued] [fixture:
  timeline/db-section-with-event-after-task] [fixture:
  timeline/gram-section-with-event] [fixture:
  timeline/gram-section-then-event-line]
- A task takes the section before it, and the empty `section` before the first
  section. A title between a section and a task changes nothing. [fixture:
  timeline/db-section-two-with-tasks] [fixture: timeline/db-section-after-tasks]
  [fixture: timeline/db-section-then-title]
- `task` is the period, the text of a line that is no other statement, to a `:`
  or a `#` or the end of the line. The whitespace before it is not part of it,
  and the whitespace after it stays. A line is a task of its own whatever its
  indentation, and a text can repeat. [fixture: timeline/db-period-only]
  [fixture: timeline/db-period-trailing-spaces] [fixture:
  timeline/db-period-with-spaces] [fixture:
  timeline/db-period-leading-whitespace] [fixture:
  timeline/db-period-leading-ideographic-space] [fixture:
  timeline/db-period-two-lines] [fixture: timeline/db-period-same-text-twice]
  [fixture: timeline/db-indentation-does-not-nest] [fixture:
  timeline/db-tab-indentation] [fixture: timeline/db-names-of-object-prototype]
  [fixture: timeline/db-period-cjk]
- An
  [event](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L34)
  is the text after a `:` and one whitespace character, of the task before it,
  up to the next `:` that has whitespace after it, or the end of the line. A `:`
  that has no whitespace after it is part of the event; one that has whitespace
  after it ends the event, whatever lies before it, and starts the next event of
  the same task. The whitespace before the colon is part of the previous text,
  and the whitespace after it, but the first character, is part of the event.
  Any whitespace character can follow the colon. [fixture:
  timeline/db-period-and-event] [fixture:
  timeline/db-period-colon-glued-to-period] [fixture:
  timeline/db-event-two-spaces] [fixture: timeline/db-event-leading-spaces]
  [fixture: timeline/db-event-trailing-spaces] [fixture:
  timeline/db-event-two-on-a-line] [fixture: timeline/db-event-three-on-a-line]
  [fixture: timeline/db-event-colon-glued-inside] [fixture:
  timeline/db-event-colon-space-before-glued-after] [fixture:
  timeline/db-event-colon-glued-before] [fixture:
  timeline/lex-event-separator-tab] [fixture:
  timeline/lex-event-separator-no-break-space] [fixture:
  timeline/lex-event-separator-ideographic-space] [fixture:
  timeline/lex-event-separator-line-separator] [fixture:
  timeline/lex-event-separator-paragraph-separator] [fixture:
  timeline/lex-event-separator-byte-order-mark]
- A `:` right after a period with no whitespace after it is rejected. So is a
  `:` with nothing after it, or with one whitespace character and nothing after
  it, at the end of the text, whether it follows a period or an event. [fixture:
  timeline/gram-event-colon-glued-to-event] [fixture:
  timeline/gram-event-colon-space-glued] [fixture:
  timeline/gram-event-empty-after-colon] [fixture:
  timeline/gram-event-empty-after-colon-space] [fixture:
  timeline/gram-event-trailing-colon] [fixture:
  timeline/gram-event-trailing-colon-space] [fixture:
  timeline/gram-event-colon-at-end-glued]
- An event on a line of its own belongs to the last task before it. Empty lines,
  lines of whitespace, comment lines, directive lines, a title, an accessibility
  title and description, and a section between them do not end the task. An
  event before every task has no task, and the Db throws a `TypeError`, so the
  input is rejected. [fixture: timeline/db-event-own-line] [fixture:
  timeline/db-event-own-line-after-event] [fixture:
  timeline/db-event-own-line-two-tasks] [fixture:
  timeline/db-event-own-line-after-blank-line] [fixture:
  timeline/db-event-own-line-after-whitespace-line] [fixture:
  timeline/db-event-own-line-after-comment-line] [fixture:
  timeline/db-event-own-line-after-hash-line] [fixture:
  timeline/db-event-own-line-after-directive-line] [fixture:
  timeline/db-event-own-line-after-title] [fixture:
  timeline/db-event-own-line-after-acc-title] [fixture:
  timeline/db-event-own-line-after-acc-descr-block] [fixture:
  timeline/db-event-after-section-joins-earlier-task] [fixture:
  timeline/gram-event-first] [fixture: timeline/gram-event-after-title]
  [fixture: timeline/gram-event-after-section-only]
- Whitespace after a `:` includes the line feed, so a `:` at the end of a line
  takes the next line as the event, with its indentation, and the same holds for
  a line with only a `:`. An empty line after it is rejected, and a line of
  spaces is an event of those spaces, whose next line is a task. [fixture:
  timeline/db-event-line-feed-after-colon] [fixture:
  timeline/db-event-line-feed-after-colon-indented] [fixture:
  timeline/db-event-line-feed-after-second-colon] [fixture:
  timeline/db-event-own-line-colon-then-line-feed] [fixture:
  timeline/gram-event-line-feed-then-empty-line] [fixture:
  timeline/db-event-line-feed-then-whitespace-line] [fixture:
  timeline/db-event-colon-only-twice]
- Quotes, brackets, arrows, markup, links, a backslash, and characters outside
  the Basic Multilingual Plane are characters of the text, and so is a `;` but
  for the one that the line rule of `style` lines drops. [fixture:
  timeline/db-event-semicolons] [fixture: timeline/db-event-links-and-tags]
  [fixture: timeline/db-event-quotes-and-brackets] [fixture:
  timeline/db-event-arrows] [fixture: timeline/db-event-backslash-n] [fixture:
  timeline/db-event-non-bmp]
- A `#` or `%%` inside an event, a `#` or `%%` alone as an event, and `%%` glued
  to an event are characters of the event. [fixture: timeline/db-event-hash]
  [fixture: timeline/db-event-percent] [fixture:
  timeline/db-event-percent-glued] [fixture: timeline/db-event-only-hash]
  [fixture: timeline/db-event-only-percent]
- A line that starts with `#` or with a `%` that no `{` follows is a comment
  line: `% c`, `%c`, `%`, and `%% c` are comments, and `%{x}` is a period. A `%`
  inside a period or a title, or at the start of an event, is part of the text.
  The indentation of a comment line changes nothing, and a comment line can
  stand between a task and its events, and right after the header. A `#` after a
  period starts a comment that runs to the end of the line, so an event after it
  is lost, and the whitespace before it stays in the period. [fixture:
  timeline/db-comment-hash-line] [fixture: timeline/db-comment-percent-line]
  [fixture: timeline/db-comment-hash-only] [fixture:
  timeline/db-comment-percent-only] [fixture:
  timeline/db-comment-hash-line-at-end] [fixture:
  timeline/db-comment-hash-line-indented] [fixture:
  timeline/db-comment-before-event-line] [fixture:
  timeline/db-comment-hash-between-header-and-first-line] [fixture:
  timeline/db-comment-percent-after-header] [fixture:
  timeline/db-comment-hash-after-period] [fixture:
  timeline/db-comment-hash-after-period-hides-event] [fixture:
  timeline/db-comment-hash-after-period-only] [fixture:
  timeline/db-comment-single-percent-line] [fixture:
  timeline/db-comment-single-percent-glued] [fixture:
  timeline/db-comment-single-percent-only] [fixture:
  timeline/db-comment-single-percent-between-task-and-event] [fixture:
  timeline/lex-percent-brace-period] [fixture:
  timeline/db-period-percent-inside] [fixture: timeline/db-title-single-percent]
  [fixture: timeline/db-event-single-percent]
- `%%` after a period and whitespace is part of the period. `%%` glued to a
  period of one character starts a comment that takes that character, since the
  [rule of the comment](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L15)
  takes one character of any kind but `}` before the `%%`, at the start of a
  token: the task is lost. After two characters or more, or after a `}`, it is
  part of the period. [fixture: timeline/db-comment-percent-after-period]
  [fixture: timeline/db-comment-percent-after-period-glued] [fixture:
  timeline/db-comment-percent-after-period-glued-no-space] [fixture:
  timeline/db-comment-percent-glued-after-two-characters] [fixture:
  timeline/db-comment-percent-after-closing-brace] [fixture:
  timeline/db-comment-percent-glued-in-event]
- The common line rule of
  [`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)
  acts on the text of a timeline as on that of every diagram: on a line that has
  `style` or `classDef` in lower case, then a `:`, then characters that are no
  whitespace, a `#`, and later a `;`, the last `;` of the line is dropped, and
  the `;` before it can end a character reference. A line without a `#` after
  the `:`, or with the `#` before the `:`, keeps its `;` as written. A line with
  `Style` in upper case does not match the rule, so it drops no `;`; but a `;`
  that follows a `#` and word characters ends a character reference there, so
  the Db shows the placeholder and no `;`. The rule reaches the title, the
  accessibility texts, and the events; a section and a period end at the `:`
  that follows `style`, which has no whitespace after it, so such a line is
  rejected. [fixture: timeline/lex-title-semicolon-in-style-line] [fixture:
  timeline/lex-title-semicolon-in-style-line-last-only] [fixture:
  timeline/lex-title-semicolon-in-classdef-line] [fixture:
  timeline/lex-title-semicolon-after-text-before-style] [fixture:
  timeline/lex-title-semicolon-in-style-line-entity] [fixture:
  timeline/lex-title-semicolon-without-hash] [fixture:
  timeline/lex-title-semicolon-hash-before-colon] [fixture:
  timeline/lex-title-semicolon-style-upper-case] [fixture:
  timeline/lex-acc-title-semicolon-in-style-line] [fixture:
  timeline/lex-acc-descr-semicolon-in-style-line] [fixture:
  timeline/lex-acc-descr-block-semicolon-in-style-line] [fixture:
  timeline/lex-event-semicolon-in-style-line] [fixture:
  timeline/lex-event-semicolon-in-style-line-second-event] [fixture:
  timeline/gram-section-style-line] [fixture: timeline/gram-period-style-line]
- Where a keyword or a `:` at the end of a line takes the next line, the lines
  between are read first. A `%%` comment line is removed, so the line after it
  is taken. A `#` line is no comment line there: it is taken as the text of a
  title or an event. A directive line is removed and leaves its indentation:
  with indentation, the indentation is the title, the section, or the event, and
  the next line is a task; with none, it leaves an empty line, which an empty
  line in the text does as well, so `title` and `section` are periods and the
  `:` is rejected. After `accTitle:` and `accDescr:`, the whitespace takes
  directive lines and empty lines, so the text is the next line. [fixture:
  timeline/lex-title-line-feed-comment-line] [fixture:
  timeline/lex-title-line-feed-two-comment-lines] [fixture:
  timeline/lex-title-line-feed-hash-line] [fixture:
  timeline/lex-title-line-feed-directive-line] [fixture:
  timeline/lex-title-line-feed-directive-line-unindented] [fixture:
  timeline/lex-title-line-feed-empty-line] [fixture:
  timeline/lex-section-line-feed-comment-line] [fixture:
  timeline/lex-section-line-feed-directive-line] [fixture:
  timeline/lex-section-line-feed-directive-line-unindented] [fixture:
  timeline/lex-section-line-feed-empty-line] [fixture:
  timeline/lex-acc-title-value-after-comment-line] [fixture:
  timeline/lex-acc-title-value-after-directive-line] [fixture:
  timeline/lex-acc-descr-value-after-comment-line] [fixture:
  timeline/lex-acc-descr-value-after-directive-line] [fixture:
  timeline/lex-event-line-feed-comment-line] [fixture:
  timeline/lex-event-line-feed-directive-line] [fixture:
  timeline/lex-event-line-feed-directive-line-unindented] [fixture:
  timeline/lex-event-own-line-colon-comment-line] [fixture:
  timeline/lex-event-own-line-colon-directive-line-unindented]
- A directive is removed before the text is read, and the whitespace around it
  stays, so that the parts around it join: in a period, an event, a title, a
  section, and the accessibility texts. [fixture:
  timeline/db-period-directive-before-colon] [fixture:
  timeline/db-period-directive-glued] [fixture: timeline/db-event-directive]
  [fixture: timeline/db-title-directive] [fixture:
  timeline/db-section-directive] [fixture: timeline/db-acc-title-directive]
  [fixture: timeline/db-acc-descr-block-directive]
- Each value is read in
  [converted form](../../spec/docs/common.md#reading-a-source), so a character
  reference is its placeholder in every text. The `#` of a reference starts no
  comment, and a `#` that starts no reference does. [fixture:
  timeline/db-title-entity] [fixture: timeline/db-section-entity] [fixture:
  timeline/db-event-entity] [fixture: timeline/db-event-entity-named] [fixture:
  timeline/db-event-entity-hex] [fixture:
  timeline/db-event-entity-is-no-comment] [fixture:
  timeline/db-period-unclosed-reference] [fixture: timeline/db-acc-title-entity]
  [fixture: timeline/db-acc-descr-entity] [fixture:
  timeline/db-acc-descr-block-entity]
- A CRLF and a lone CR end a line as a line feed does. A U+2028 and a U+2029 end
  no line: they are part of a period, an event, a section, a title, and the
  accessibility texts, and the whitespace before a period includes them. Other
  whitespace, a no-break space and a U+3000 among it, is indentation before a
  period, and a no-break space and a U+3000 at the end of a period are part of
  it. [fixture: timeline/db-crlf-line-ends] [fixture:
  timeline/db-lone-cr-line-ends] [fixture: timeline/db-blank-line-between-tasks]
  [fixture: timeline/db-whitespace-only-line] [fixture:
  timeline/db-whitespace-after-last-line] [fixture:
  timeline/lex-period-line-separator-inside] [fixture:
  timeline/lex-period-paragraph-separator-inside] [fixture:
  timeline/lex-event-line-separator-inside] [fixture:
  timeline/lex-event-paragraph-separator-inside] [fixture:
  timeline/lex-section-line-separator-inside] [fixture:
  timeline/lex-line-separator-before-period] [fixture:
  timeline/lex-line-separator-before-event-colon] [fixture:
  timeline/lex-line-separator-after-header] [fixture:
  timeline/lex-ideographic-space-at-end-of-period] [fixture:
  timeline/lex-ideographic-space-indentation] [fixture:
  timeline/lex-no-break-space-around-period-and-event]
- `title`, `accTitle`, and `accDescr` pass through `sanitizeText` and, under a
  `securityLevel` that is not one of mermaid.js's values with HTML labels
  enabled, hold the replaced characters (see
  [db-from-tree.md](./db-from-tree.md), the replacement of characters). The
  sections, the periods, and the events are not changed. The theme and the
  settings of the timeline change nothing. [fixture:
  timeline/config-security-level-other-title-and-accessibility] [fixture:
  timeline/config-security-level-other-accessibility-block] [fixture:
  timeline/config-security-level-other-html-labels-false] [fixture:
  timeline/config-security-level-other-flowchart-html-labels-false] [fixture:
  timeline/config-security-level-other-sections-periods-events] [fixture:
  timeline/config-security-level-loose-title] [fixture:
  timeline/config-security-level-sandbox-title] [fixture:
  timeline/config-theme-and-timeline-settings]
- All the fields at once. [fixture: timeline/db-everything]

Values are recorded as the Db holds them, whitespace included.

## sankey

The fields of the summary:

| Field   | Content                                                                  |
| ------- | ------------------------------------------------------------------------ |
| `title` | The title of the frontmatter, or the empty text.                         |
| `nodes` | The ids of the nodes, each node once, in the order in which it is named. |
| `links` | The links, in source order.                                              |

A link has `source` and `target`, the ids of its nodes, and `value`, a number. A
value that is no finite number is the text of the number: `"NaN"`, `"Infinity"`,
or `"-Infinity"`, since JSON has no such number.

`normalizeSankey()` (`src/normalizers/sankey.ts`) summarizes the Db of `sankey`.
The Db reads no browser feature, no time and no random value, and the syntax has
no links to follow, so the summary needs no patch of the Db. It is one module
that every sankey diagram shares, whose state
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L20-L25)
resets before each parse. The summary reads
[`getGraph()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L63-L70),
which lists the nodes and the links by id, and the title. It drops the
following, each for the reason given:

- `getAccTitle()` and `getAccDescription()`: the grammar has no statement for
  them, so they are always the empty text.
- The `SankeyNode` objects of `getNodes()`, and those that the links hold: the
  id again.

Values of the summary, by field. The text is first cleaned by
[`prepareTextForParsing()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyUtils.ts#L1-L8),
which
[the diagram](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDiagram.ts#L9-L10)
calls before the parser: it removes the whitespace at the two ends of the whole
text, and it replaces every run of line feeds and carriage returns, anywhere in
the text, by one line feed. The comment lines, the directives, and the
frontmatter are removed before it, as for every diagram.

- The header is `sankey` or `sankey-beta`.
  [The detector](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDetector.ts#L5-L7)
  reads it in lower case only, and the lexer reads the `-beta` in any case. The
  whitespace before the header is removed, and so are empty lines, comment
  lines, and directive lines before it. A word, a dash, or a character outside
  ASCII glued to the header is not the header. [fixture:
  sankey/header-non-ascii-suffix] [fixture: sankey/header-beta-non-ascii-suffix]
  [fixture: sankey/db-header-beta] [fixture: sankey/db-header-beta-upper-case]
  [fixture: sankey/header-upper-case] [fixture: sankey/header-capitalized]
  [fixture: sankey/header-word-suffix] [fixture: sankey/header-beta-suffix]
  [fixture: sankey/header-dash-suffix] [fixture: sankey/header-indented]
  [fixture: sankey/header-tab-indented] [fixture: sankey/header-nbsp-before]
- The header ends its line: the lexer then needs a line feed, so that text,
  spaces, a tab, or a `%%` after the header on its line is rejected. A directive
  is removed, and what it leaves decides: glued to the header it leaves the
  header, and after a space it leaves the space, which is rejected. Comment
  lines, directive lines, and empty lines after the header are removed, and
  change nothing. [fixture: sankey/header-record-on-header-line] [fixture:
  sankey/header-trailing-spaces] [fixture: sankey/header-trailing-tab] [fixture:
  sankey/header-comment-on-header-line] [fixture:
  sankey/header-after-blank-lines] [fixture: sankey/header-after-comment-line]
  [fixture: sankey/header-after-directive-line] [fixture:
  sankey/header-then-directive-line] [fixture:
  sankey/header-directive-glued-to-header] [fixture:
  sankey/header-directive-after-space-on-header-line]
- A diagram needs at least one record: a header with no record, or with only
  empty lines or comment lines after it, is rejected. [fixture:
  sankey/header-only] [fixture: sankey/header-without-line-feed] [fixture:
  sankey/header-blank-line-only] [fixture: sankey/header-beta-only] [fixture:
  sankey/header-then-comment-line-only] [fixture:
  sankey/header-only-after-frontmatter]
- Each line is a record, and a record is a link from the first field to the
  second with the number of the third. The links are in source order. The last
  line needs no line feed, empty lines change nothing, and the spaces before and
  after a record are no part of it. [fixture: sankey/db-link-basic] [fixture:
  sankey/db-two-links] [fixture: sankey/db-no-line-feed-at-end] [fixture:
  sankey/db-blank-lines-between] [fixture: sankey/db-indented-records] [fixture:
  sankey/db-trailing-spaces-line]
- A line of spaces is a field, so that between two records or after the header
  it is rejected, and at the end of the text it is removed with the end.
  [fixture: sankey/gram-whitespace-line-between] [fixture:
  sankey/gram-whitespace-line-after-header] [fixture:
  sankey/db-whitespace-line-at-end]
- A CRLF and a lone CR end a line as a line feed does. A U+2028 and a U+2029 end
  no line: between records, or before the first record, they are rejected, and
  at the end of the text they are whitespace and are removed, as are a no-break
  space, a U+3000, a U+FEFF, and a tab. A U+FEFF before the header is removed in
  the same way. Before a record, inside a field, after the header, and after a
  value that another record follows, a no-break space, a U+FEFF, and a tab are
  rejected, since the lexer takes them as no character of a field. [fixture:
  sankey/db-crlf-line-ends] [fixture: sankey/db-lone-cr-line-ends] [fixture:
  sankey/db-trailing-nbsp-at-end] [fixture:
  sankey/db-trailing-line-separator-at-end] [fixture:
  sankey/db-trailing-ideographic-space-at-end] [fixture:
  sankey/gram-line-separator-between-records] [fixture:
  sankey/gram-line-separator-before-first-record] [fixture:
  sankey/gram-no-break-space-before-record] [fixture:
  sankey/db-trailing-paragraph-separator-at-end] [fixture:
  sankey/gram-paragraph-separator-between-records] [fixture:
  sankey/db-byte-order-mark-at-start] [fixture:
  sankey/gram-byte-order-mark-after-header] [fixture:
  sankey/gram-byte-order-mark-before-record] [fixture:
  sankey/gram-byte-order-mark-in-field] [fixture:
  sankey/gram-byte-order-mark-between-records] [fixture:
  sankey/db-byte-order-mark-at-end] [fixture: sankey/db-tab-at-end-of-text]
  [fixture: sankey/gram-tab-after-value-before-record]
- A field that is not in quotes runs to the next comma or line end, and the
  spaces around it are no part of it. It may hold the characters of
  [the lexer](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L25)
  other than the comma and the quote: the space and the characters from `!` to
  `~`, so that `;`, `#`, `<`, `>`, `&`, `'`, a slash, a backslash, and `%%`
  inside the text are characters of the field, but for the `;` that the next
  item drops. Markup is kept as written, and so is a `#` that does not start a
  character reference (`a#35` has no `;`). A quote inside a field that does not
  start with one is rejected. [fixture: sankey/db-fields-trimmed] [fixture:
  sankey/db-text-with-spaces] [fixture: sankey/db-text-punctuation] [fixture:
  sankey/db-text-semicolon-and-hash] [fixture: sankey/db-text-hash-leading]
  [fixture: sankey/db-text-slashes] [fixture:
  sankey/db-text-ampersand-and-angle] [fixture: sankey/db-text-html-tags]
  [fixture: sankey/db-text-apostrophe] [fixture:
  sankey/db-text-percent-in-field] [fixture: sankey/db-text-percent-in-target]
  [fixture: sankey/gram-quote-in-unquoted-field] [fixture:
  sankey/gram-doubled-quote-in-unquoted-field] [fixture:
  sankey/db-text-reference-without-semicolon] [fixture:
  sankey/db-text-semicolon-at-end-of-field]
- A `;` is dropped by
  [the line rule of `style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines),
  which every diagram type has. A line of the text that has `style`, later a `:`
  followed by characters that are not whitespace and then a `#`, and later a
  `;`, loses its last `;`; then the same is done with `classDef`. The line is a
  line of the text, so that a line inside quotes is a line of its own, and the
  rule reads all the fields of the line, in quotes or not, and drops the last
  `;` of the line wherever it is. [fixture:
  sankey/lex-style-line-semicolon-source] [fixture:
  sankey/lex-style-line-semicolon-target] [fixture:
  sankey/lex-style-line-semicolon-in-quotes] [fixture:
  sankey/lex-style-line-semicolon-in-second-line-of-quotes] [fixture:
  sankey/lex-classdef-line-semicolon] [fixture:
  sankey/lex-style-line-last-semicolon-only] [fixture:
  sankey/lex-style-line-semicolon-in-other-field] [fixture:
  sankey/lex-style-line-semicolon-at-end-of-field] [fixture:
  sankey/lex-style-line-space-before-colon] [fixture:
  sankey/lex-style-line-text-between-colon-and-hash] The rule is textual and
  does not match every line. Where the `:` has no `#` after it, or whitespace
  stands between the `:` and the `#`, or the keyword is `Style` or `classdef`,
  the `;` stays, and a `;` that follows a `#` and word characters ends a
  character reference, whose placeholder is rejected (see the next item); so is
  a line with a second `;` after the first, since the first stays. The rule
  reads one line: a `;` on another line stays. [fixture:
  sankey/lex-style-line-without-hash-keeps-semicolon] [fixture:
  sankey/lex-style-line-does-not-cross-lines] [fixture:
  sankey/lex-style-line-does-not-cross-lines-in-quotes] [fixture:
  sankey/lex-style-upper-case-entity] [fixture:
  sankey/lex-classdef-lower-case-entity] [fixture:
  sankey/lex-style-line-last-semicolon-of-two] [fixture:
  sankey/lex-style-line-space-after-colon]
- Only the characters of that set are allowed, in or out of quotes: a character
  outside ASCII, a tab, a no-break space, a U+3000, a U+2028, a U+2029 are
  rejected, wherever they stand in a field and before a record or a field. A
  character reference such as `#35;` or `#amp;` is replaced by a placeholder
  before the parse, and the placeholder is outside ASCII, so a field that holds
  one is rejected. [fixture: sankey/gram-non-ascii] [fixture: sankey/gram-cjk]
  [fixture: sankey/gram-emoji] [fixture: sankey/gram-no-break-space-in-field]
  [fixture: sankey/gram-ideographic-space-in-field] [fixture:
  sankey/gram-line-separator-in-field] [fixture:
  sankey/gram-paragraph-separator-in-field] [fixture: sankey/gram-tab-in-field]
  [fixture: sankey/gram-tab-before-record] [fixture:
  sankey/gram-tab-before-second-field] [fixture:
  sankey/gram-tab-after-first-field] [fixture: sankey/gram-quoted-non-ascii]
  [fixture: sankey/gram-quoted-line-separator] [fixture:
  sankey/gram-entity-numeric] [fixture: sankey/gram-entity-named] [fixture:
  sankey/gram-entity-in-quoted-field] [fixture:
  sankey/gram-entity-in-quoted-value]
- A field in quotes
  ([`escaped`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L65))
  may hold commas, and two quotes in it are one quote of the field. The quotes
  around it are no part of it. The quotes are read from left to right: a quote
  that is not followed by a quote closes the field, so that five quotes after a
  letter are two quotes of the field and the closing quote. [fixture:
  sankey/db-quoted-fields] [fixture: sankey/db-quoted-comma] [fixture:
  sankey/db-quoted-doubled-quote] [fixture: sankey/db-quoted-four-quotes]
  [fixture: sankey/db-quoted-doubled-quote-at-end] [fixture:
  sankey/db-quoted-doubled-quote-at-start] [fixture:
  sankey/db-quoted-only-quote] [fixture: sankey/db-quoted-two-quotes-at-end]
  [fixture: sankey/db-id-quote-and-comma] [fixture:
  sankey/db-quoted-and-unquoted-same-id]
- A line feed inside quotes is part of the field. A CRLF, a lone CR, and a run
  of empty lines are one line feed there, by `prepareTextForParsing()`; the
  spaces before and after a line feed, and a line of spaces, stay. [fixture:
  sankey/db-quoted-line-feed] [fixture: sankey/db-quoted-crlf] [fixture:
  sankey/db-quoted-cr] [fixture: sankey/db-quoted-blank-line-collapses]
  [fixture: sankey/db-quoted-crlf-blank-line-collapses] [fixture:
  sankey/db-quoted-space-line-kept] [fixture:
  sankey/db-quoted-trailing-spaces-before-line-feed] [fixture:
  sankey/db-quoted-leading-spaces-after-line-feed]
- The field is then trimmed, as every field is, so that the spaces and line
  feeds at the ends of a quoted field are no part of the id. A value in quotes
  is trimmed as well. [fixture: sankey/db-quoted-leading-line-feed] [fixture:
  sankey/db-quoted-trailing-line-feed] [fixture:
  sankey/db-quoted-both-line-feed-ids] [fixture:
  sankey/db-quoted-line-feeds-only] [fixture: sankey/db-quoted-space-only]
  [fixture: sankey/db-quoted-spaces-trimmed] [fixture:
  sankey/db-quoted-space-before-value]
- A field of spaces only, or of spaces and line feeds in quotes, is the empty
  id, and a node is made for it. A field with nothing in it, with or without
  quotes, is rejected: the empty id has to be written with a space. [fixture:
  sankey/db-spaces-only-source-id] [fixture: sankey/db-spaces-only-target-id]
  [fixture: sankey/db-spaces-only-source-id-first-record]
- A quote that is not closed, text before the opening quote or after the closing
  quote, spaces on either side of the quotes, and a quoted field that is empty
  are rejected. [fixture: sankey/gram-quoted-empty] [fixture:
  sankey/gram-quoted-empty-value] [fixture: sankey/gram-quoted-unclosed]
  [fixture: sankey/gram-quoted-value-unclosed] [fixture:
  sankey/gram-text-after-closing-quote] [fixture:
  sankey/gram-text-before-opening-quote] [fixture:
  sankey/gram-space-before-opening-quote] [fixture:
  sankey/gram-space-after-closing-quote] [fixture:
  sankey/gram-space-before-quoted-second-field] [fixture:
  sankey/gram-quoted-value-then-text] [fixture:
  sankey/gram-quote-after-space-in-field] [fixture:
  sankey/gram-quoted-then-trailing-comma] [fixture:
  sankey/gram-quoted-unclosed-at-end-of-text]
- A record has exactly three fields, as
  [the grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L51-L58)
  says: fewer, more, a comma after the third field, and an empty field are
  rejected. [fixture: sankey/gram-two-columns] [fixture: sankey/gram-one-column]
  [fixture: sankey/gram-four-columns] [fixture: sankey/gram-trailing-comma]
  [fixture: sankey/gram-empty-source] [fixture: sankey/gram-empty-target]
  [fixture: sankey/gram-empty-value] [fixture: sankey/gram-commas-only]
  [fixture: sankey/gram-comma-only-line] [fixture:
  sankey/gram-short-line-after-record] [fixture:
  sankey/gram-one-field-after-record]
- `value` is
  [`parseFloat()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L55)
  of the third field, after the trim, so that the number is read as the
  beginning of the text: a sign, a decimal point, an exponent, and a leading dot
  are read, and anything after the number is dropped (`1abc`, `1 2`, `1_000`,
  `1.2.3`, `0x10` is `0`, and a `%%`, a `#`, a `;`, or a space and a `;` after
  the number is part of the text that is dropped). A negative value is accepted,
  and `-0` is the number -0 in the Db, and the summary holds 0, since JSON has
  no -0. [fixture: sankey/db-value-negative] [fixture:
  sankey/db-value-plus-sign] [fixture: sankey/db-value-zero] [fixture:
  sankey/db-value-decimal] [fixture: sankey/db-value-leading-dot] [fixture:
  sankey/db-value-trailing-dot] [fixture: sankey/db-value-exponent] [fixture:
  sankey/db-value-exponent-negative] [fixture: sankey/db-value-hexadecimal]
  [fixture: sankey/db-value-text-after-number] [fixture:
  sankey/db-value-two-numbers] [fixture: sankey/db-value-underscore] [fixture:
  sankey/db-value-two-dots] [fixture: sankey/db-value-spaces] [fixture:
  sankey/db-value-percent-after-number] [fixture:
  sankey/db-value-hash-after-number] [fixture: sankey/db-quoted-value] [fixture:
  sankey/db-quoted-value-with-comma] [fixture:
  sankey/db-quoted-value-with-quotes] [fixture: sankey/db-value-negative-zero]
  [fixture: sankey/db-value-semicolon-after-number] [fixture:
  sankey/db-value-space-semicolon-after-number] [fixture:
  sankey/db-value-two-semicolons-after-number]
- A value that starts with no number is `NaN`, and the record is accepted; `NaN`
  is recorded as the text `"NaN"`. A value of spaces only is such a value,
  unless it ends the text, where the spaces are removed and the record is
  rejected for its columns. [fixture: sankey/db-value-not-a-number] [fixture:
  sankey/db-value-number-after-text] [fixture: sankey/db-value-nan-text]
  [fixture: sankey/db-quoted-value-not-a-number] [fixture:
  sankey/db-spaces-only-value] [fixture:
  sankey/gram-spaces-only-value-at-end-of-text]
- `Infinity` and `-Infinity` are read as those numbers, and so is a number too
  large for a double (`1e999`). They are recorded as the text `"Infinity"` and
  `"-Infinity"`. [fixture: sankey/db-value-infinity] [fixture:
  sankey/db-value-negative-infinity] [fixture: sankey/db-value-overflow]
- A node is
  [found or created](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L48-L58)
  by its id after the trim and the replacement of two quotes by one. Ids are
  case-sensitive, and the same text with quotes or without is one node. A node
  is first named by the source of its first link, then by the target. A link
  from a node to itself, two links with the same nodes, and a link back are all
  accepted, and a link is added for each. The names of the properties of objects
  are ids like any other. [fixture: sankey/db-self-link] [fixture:
  sankey/db-duplicate-link] [fixture: sankey/db-reverse-link] [fixture:
  sankey/db-node-order] [fixture: sankey/db-ids-case-sensitive] [fixture:
  sankey/db-ids-compared-after-trim] [fixture:
  sankey/db-ids-of-object-prototype]
- A line that starts, after its indentation, with `%%` is a comment line and is
  removed, also inside quotes, so that the lines around it join into one field
  with a line feed. A line of `%%` alone is no comment line, and a `#` starts no
  comment: both are fields, and are rejected for their columns. [fixture:
  sankey/db-comment-line] [fixture: sankey/db-comment-line-between-records]
  [fixture: sankey/db-comment-line-with-blank-lines] [fixture:
  sankey/db-comment-line-at-end] [fixture: sankey/db-comment-line-indented]
  [fixture: sankey/gram-percent-line-alone] [fixture:
  sankey/gram-hash-line-alone] [fixture: sankey/db-quoted-comment-line]
  [fixture: sankey/db-quoted-directive-line]
- A directive is removed before the text is read, wherever it stands, so that
  the parts around it join: in a field, after the value, at the start of a
  record, and in quotes. A directive with settings of the diagram changes
  nothing in the Db. A directive line inside quotes is removed as a comment line
  is (see above). A directive without `}%%` takes, as its argument, the word at
  the start of the next line
  ([Directives](../../spec/docs/common.md#directives)): `a,b,1 %%{init` and the
  line `c,d,2` leave `a,b,1 ,d,2`, four fields, which is rejected, while at the
  end of the text it takes nothing and the record stays. [fixture:
  sankey/db-directive-in-field] [fixture:
  sankey/db-directive-at-start-of-record] [fixture:
  sankey/db-directive-after-value] [fixture: sankey/db-directive-in-quotes]
  [fixture: sankey/db-directive-sankey-settings] [fixture:
  sankey/gram-directive-unclosed-takes-next-line] [fixture:
  sankey/db-directive-unclosed-at-end]
- `title` is the title of the frontmatter, which the Diagram gives to the Db
  with `setDiagramTitle`; the spaces of the title stay. The grammar has no
  `title` statement and no accessibility statements, so such a line is read as a
  record and is rejected for its columns. The settings of the frontmatter change
  nothing in the Db. [fixture: sankey/db-title-frontmatter] [fixture:
  sankey/db-title-frontmatter-spaces] [fixture: sankey/gram-title-statement]
  [fixture: sankey/gram-acc-title-statement] [fixture:
  sankey/db-frontmatter-config]
- `title` and the ids pass through `sanitizeText` and, under a `securityLevel`
  that is not one of mermaid.js's values with HTML labels enabled, hold the
  replaced characters (see [db-from-tree.md](./db-from-tree.md), the replacement
  of characters). Under `loose` and `sandbox`, or with `htmlLabels` false at the
  top of the settings or in `flowchart`, they are as written. The theme and the
  settings of the diagram change nothing. [fixture:
  sankey/config-security-level-other-title-and-ids] [fixture:
  sankey/config-security-level-other-html-labels-false] [fixture:
  sankey/config-security-level-other-flowchart-html-labels-false] [fixture:
  sankey/config-security-level-loose-ids] [fixture:
  sankey/config-security-level-sandbox-ids] [fixture:
  sankey/config-sankey-settings]
- All the fields at once. [fixture: sankey/db-everything]

Values are recorded as the Db holds them, whitespace included.

## xychart

The fields of the summary:

| Field         | Content                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `orientation` | `vertical` or `horizontal`.                                                  |
| `title`       | The title of the chart: the last `title` statement, or else the frontmatter. |
| `accTitle`    | The accessibility title, or the empty text.                                  |
| `accDescr`    | The accessibility description, or the empty text.                            |
| `xAxis`       | The x axis.                                                                  |
| `yAxis`       | The y axis.                                                                  |
| `plots`       | The plots, in source order.                                                  |

An axis has `type`, `title`, and, for the type `band`, `categories`, the texts
of the categories, or, for the type `linear`, `min` and `max`, numbers. A plot
has `type` (`line` or `bar`), `title`, `data`, and, for a line with a label
written, `pointLabels`. A number that is no finite number is the text of the
number (`"Infinity"`, `"-Infinity"`), since JSON has no such number, and `-0` is
0, since JSON has no -0.

`normalizeXyChart()` (`src/normalizers/xychart.ts`) summarizes the Db of
`xychart`. The Db reads no browser feature, no time and no random value while it
parses, so the summary needs no patch of the Db. It is one module that every
xychart diagram shares, whose state
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L223-L232)
resets before each parse. The summary reads the title and the accessibility
texts of the common Db, the orientation of
[`getChartConfig()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L215-L217),
and
[`getXYChartData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L219-L221).
It drops the following, each for the reason given:

- `plots[].strokeFill`, `plots[].strokeWidth`, and `plots[].fill`: the colour
  and the width that the renderer uses, taken from the theme by the number of
  the plot.
- `getChartThemeConfig()`, and `getChartConfig()` but for `chartOrientation`:
  the colours of the theme and the settings of the renderer, which the site
  gives.
- `getXYChartData().title`: set only when the chart is drawn
  ([`getDrawableElem()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L203-L209)),
  so it is the empty text when the text is parsed; the title is that of the
  common Db.

The ranges of the axes and the x of the pairs of a plot follow from the values
and the axes, but the Db computes them where each statement is executed
([`transformDataWithoutCategory()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L125-L164),
[`setYAxisRangeFromPlotData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L112-L123)),
from the state at that point, so a statement after a plot does not change what
the plot made. They are kept as the Db holds them.

Values of the summary, by field. The text is read by
[the lexer](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L15-L75)
and
[the grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L83-L175).

- The header is `xychart` or `xychart-beta`.
  [The detector](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDetector.ts#L9-L11)
  reads it in lower case only, so that `XYCHART` and `Xychart-Beta` are
  rejected, while the lexer reads it in any case. A word, a dash and a digit, or
  a character outside ASCII glued to the header is not the header. A colon, a
  brace, a `#`, a quote, a digit, a comma, or a bracket after the header is
  rejected, and a line that starts with `#` before it too: no detector reads the
  text. A header with no statement after it is accepted: the chart is empty.
  [fixture: xychart/db-header-beta-only] [fixture: xychart/db-header-plain]
  [fixture: xychart/header-upper-case] [fixture:
  xychart/header-beta-capitalized] [fixture: xychart/header-word-suffix]
  [fixture: xychart/header-plain-word-suffix] [fixture:
  xychart/header-dash-suffix] [fixture: xychart/header-non-ascii-suffix]
  [fixture: xychart/header-without-line-feed] [fixture:
  xychart/gram-header-after-hash-line] [fixture:
  xychart/gram-header-brace-suffix] [fixture:
  xychart/gram-header-bracket-suffix] [fixture:
  xychart/gram-header-colon-suffix] [fixture: xychart/gram-header-comma-suffix]
  [fixture: xychart/gram-header-digit-suffix] [fixture:
  xychart/gram-header-hash-suffix] [fixture: xychart/gram-header-quote-suffix]
- Spaces, tabs, empty lines, a no-break space, a U+FEFF, a comment line, and a
  directive line before the header change nothing. A directive glued to the
  header is removed, and a comment after it, with a space or glued, is skipped.
  A line of `%%` alone, or `%%{ }%%`, before the header or after it is a comment
  line. [fixture: xychart/header-indented] [fixture:
  xychart/header-tab-indented] [fixture: xychart/header-after-bare-percent-line]
  [fixture: xychart/header-after-bare-percent-line-and-whitespace-line]
  [fixture: xychart/header-after-blank-lines] [fixture:
  xychart/header-after-comment-line] [fixture:
  xychart/header-after-directive-line] [fixture:
  xychart/header-after-empty-braces-line] [fixture: xychart/header-nbsp-before]
  [fixture: xychart/header-bom-before] [fixture:
  xychart/header-directive-glued-after-header] [fixture:
  xychart/header-comment-on-header-line] [fixture:
  xychart/header-comment-glued-to-header] [fixture:
  xychart/header-bare-percent-line-after-header]
- A statement can follow the header on its line, and so can a `;`, which ends
  the line. A second header, on a line of its own or after the first, is read as
  a header again. [fixture: xychart/header-statement-on-header-line] [fixture:
  xychart/header-line-on-header-line] [fixture: xychart/header-semicolon]
  [fixture: xychart/header-semicolon-only] [fixture:
  xychart/header-semicolon-spaced] [fixture: xychart/header-leading-semicolon]
  [fixture: xychart/header-twice] [fixture: xychart/header-twice-same-line]
- `orientation` is `vertical`, or `horizontal` where the header is followed by
  the word `horizontal`. The word is read in any case by the lexer, but the Db
  takes any word other than `horizontal` as vertical: `HORIZONTAL` and
  `Horizontal` give `vertical`. Spaces or a tab can separate the header and the
  word, and a statement can follow it on the line. The word is no statement and
  no text: on the next line, twice, glued to another word, after a statement, or
  as a title, a category, or the title of an axis, it is rejected; in quotes it
  is a text. [fixture: xychart/db-orientation-capitalized] [fixture:
  xychart/db-orientation-horizontal] [fixture: xychart/db-orientation-in-quotes]
  [fixture: xychart/db-orientation-plain-header] [fixture:
  xychart/db-orientation-tab] [fixture: xychart/db-orientation-two-spaces]
  [fixture: xychart/db-orientation-upper-case] [fixture:
  xychart/db-orientation-vertical] [fixture:
  xychart/db-orientation-vertical-upper-case] [fixture:
  xychart/db-orientation-with-statement] [fixture:
  xychart/gram-orientation-after-statement] [fixture:
  xychart/gram-orientation-as-axis-title] [fixture:
  xychart/gram-orientation-as-category] [fixture:
  xychart/gram-orientation-as-title] [fixture:
  xychart/gram-orientation-on-next-line] [fixture:
  xychart/gram-orientation-twice] [fixture:
  xychart/gram-orientation-word-suffix]
- Where the header has no orientation word, `orientation` is the setting
  `xyChart.chartOrientation`, which `vertical` is by default, whether it comes
  from the site, the frontmatter, or a directive; the word of the header wins
  over the setting. The other settings of the chart, the theme, and the colours
  of the palette change nothing in the Db. [fixture:
  xychart/config-orientation-directive] [fixture:
  xychart/config-orientation-frontmatter] [fixture:
  xychart/config-orientation-frontmatter-header-wins] [fixture:
  xychart/config-orientation-header-wins] [fixture:
  xychart/config-orientation-setting-horizontal] [fixture:
  xychart/config-settings-do-not-change-db]
- A statement ends at a line end, a `;`, or the end of the text; empty lines and
  empty statements change nothing, and so do spaces, a tab, a vertical tab, a
  form feed, a no-break space, a U+FEFF, and a U+3000 around a statement. A CRLF
  and a lone CR end a line as a line feed does. A U+2028 or a U+2029 after a
  word is whitespace. A statement needs no line feed at the end of the text.
  [fixture: xychart/db-statement-blank-lines] [fixture:
  xychart/db-statement-leading-semicolon] [fixture:
  xychart/db-statement-tab-indented] [fixture:
  xychart/db-lines-form-feed-before-statement] [fixture:
  xychart/db-lines-keyword-bom-end] [fixture:
  xychart/db-lines-nbsp-after-statement] [fixture:
  xychart/db-lines-no-line-feed-at-end] [fixture:
  xychart/db-lines-prototype-title] [fixture:
  xychart/db-lines-statement-on-header-line-crlf] [fixture:
  xychart/db-lines-statements-after-bom-and-tab] [fixture:
  xychart/db-lines-trailing-spaces] [fixture: xychart/db-lines-trailing-tab]
  [fixture: xychart/db-lines-unicode-line-separator-between-statements]
  [fixture: xychart/db-lines-vertical-tab-before-statement] [fixture:
  xychart/db-semicolon-after-statement] [fixture:
  xychart/db-semicolon-line-alone] [fixture: xychart/db-semicolon-spaced]
  [fixture: xychart/db-semicolon-statements] [fixture:
  xychart/db-semicolon-twice] [fixture: xychart/db-title-crlf-line-ends]
  [fixture: xychart/db-title-lone-cr-line-ends] [fixture:
  xychart/db-title-line-separator-end] [fixture:
  xychart/db-title-paragraph-separator-end] [fixture:
  xychart/db-title-bom-after-word] [fixture:
  xychart/db-title-bom-before-keyword] [fixture:
  xychart/db-title-form-feed-after-word] [fixture:
  xychart/db-title-nbsp-before-keyword] [fixture:
  xychart/db-title-ideographic-space]
- A title is a text: text in quotes, which is what lies between the quotes,
  without the spaces at its ends, or words without quotes, which are joined
  without the spaces between them. A word holds letters, digits, and `-`, `_`,
  `.`, `+`, `=`, `*`, `&`, `#`; a `#` starts no comment, so `T # c` is the title
  `T#c`. Text in quotes can hold punctuation, a keyword, a `%%` after a space,
  markup, characters outside ASCII, backquotes, and line feeds, a CRLF being one
  line feed. [fixture: xychart/db-title-quoted] [fixture:
  xychart/db-title-bare-word] [fixture: xychart/db-title-bare-digit] [fixture:
  xychart/db-title-bare-number] [fixture: xychart/db-title-bare-words] [fixture:
  xychart/db-title-bare-characters] [fixture:
  xychart/db-title-quoted-spaces-trimmed] [fixture:
  xychart/db-title-quoted-special] [fixture: xychart/db-title-quoted-line-feed]
  [fixture: xychart/db-title-quoted-crlf] [fixture:
  xychart/db-title-quoted-non-ascii] [fixture: xychart/db-title-quoted-keyword]
  [fixture: xychart/db-title-quoted-hash-and-semicolon-apart] [fixture:
  xychart/db-title-quoted-percent] [fixture: xychart/db-title-quoted-html]
  [fixture: xychart/db-title-md-string] [fixture:
  xychart/db-title-hash-bare-word] [fixture: xychart/db-title-bare-hash-comment]
  [fixture: xychart/db-title-bare-percent-comment] [fixture:
  xychart/db-title-quoted-line-separator] [fixture:
  xychart/db-title-nbsp-between-words] [fixture:
  xychart/db-title-quoted-semicolon] [fixture: xychart/db-title-bare-semicolon]
  [fixture: xychart/db-title-semicolon-empty-statements]
- The last `title` statement is the title, and it replaces the title of the
  frontmatter, which is the title where no statement gives one, with the spaces
  it has. The keyword is read in any case, and a tab can follow it; a word that
  starts with `title` is a text, while a word glued to the keyword, `titles`,
  and `title` or `Title` as the text are rejected. [fixture:
  xychart/db-title-twice] [fixture: xychart/db-title-three-times] [fixture:
  xychart/db-title-bare-then-quoted] [fixture: xychart/db-title-frontmatter]
  [fixture: xychart/db-title-frontmatter-and-statement] [fixture:
  xychart/db-title-frontmatter-spaces] [fixture:
  xychart/db-title-at-end-of-text] [fixture:
  xychart/db-title-upper-case-keyword] [fixture:
  xychart/db-title-capitalized-keyword] [fixture:
  xychart/db-title-tab-separator] [fixture:
  xychart/db-title-keyword-prefix-word] [fixture: xychart/gram-title-glued]
  [fixture: xychart/gram-title-plural] [fixture:
  xychart/gram-title-keyword-as-text] [fixture:
  xychart/gram-title-bare-title-keyword]
- A character reference in a text in quotes or in an accessibility text is its
  placeholder: `#35;`, and also `#b;` in `a#b;c`; a `#` and a `;` that no word
  joins are characters of the text. In a title, the title of an axis, a
  category, and the title of a plot without quotes, a reference is rejected,
  since its placeholder is outside ASCII. The quotes of an HTML tag are read as
  `'`. [fixture: xychart/lex-title-entity-in-quotes] [fixture:
  xychart/gram-title-entity-bare] [fixture:
  xychart/lex-title-quoted-hash-word-semicolon-entity] [fixture:
  xychart/lex-acc-descr-block-entity] [fixture: xychart/lex-acc-descr-entity]
  [fixture: xychart/lex-acc-title-entity] [fixture:
  xychart/db-title-html-tag-in-quotes]
- A title with no text, with two quotes and nothing between them, with its text
  on the next line, or with text after the text in quotes is rejected. So is a
  quote that is not closed, also at the end of the text. A title without quotes
  holds none of `,`, `:`, `/`, `(`, `)`, `'`, `<`, `>`, `[`, `]` and no
  character outside ASCII, and a `%%` glued to a word takes the character before
  it, so that the title is rejected. [fixture: xychart/gram-title-after-quoted]
  [fixture: xychart/gram-title-bare-angle] [fixture:
  xychart/gram-title-bare-apostrophe] [fixture: xychart/gram-title-bare-colon]
  [fixture: xychart/gram-title-bare-comma] [fixture:
  xychart/gram-title-bare-non-ascii] [fixture:
  xychart/gram-title-bare-parenthesis] [fixture:
  xychart/gram-title-bare-percent-at-end] [fixture:
  xychart/gram-title-bare-percent-inside] [fixture:
  xychart/gram-title-bare-slash] [fixture: xychart/gram-title-bare-square]
  [fixture: xychart/gram-title-comment-line-before-text] [fixture:
  xychart/gram-title-comment-line-between] [fixture:
  xychart/gram-title-empty-string] [fixture:
  xychart/gram-title-keyword-alone-at-end] [fixture: xychart/gram-title-no-text]
  [fixture: xychart/gram-title-quoted-unclosed] [fixture:
  xychart/gram-title-quoted-unclosed-at-end] [fixture:
  xychart/gram-title-text-on-next-line]
- The line rule of `style` and `classDef` lines drops the last `;` of a line
  that has `style:` or `classDef:`, later a `#`, and later a `;`, from any text
  in quotes: a title, the title of an axis, a category, the title of a plot, a
  label, and an accessibility text. Two `;` leave the first, which ends a
  character reference; `Style` in another case, no `#`, and whitespace between
  the `:` and the `#` keep the `;`, and a line inside quotes is a line of its
  own. [fixture: xychart/lex-title-style-line-semicolon] [fixture:
  xychart/lex-style-line-classdef] [fixture:
  xychart/lex-style-line-does-not-cross-lines-in-quotes] [fixture:
  xychart/lex-style-line-no-hash] [fixture:
  xychart/lex-style-line-semicolon-in-second-line-of-quotes] [fixture:
  xychart/lex-style-line-semicolon-two] [fixture:
  xychart/lex-style-line-space-after-colon] [fixture:
  xychart/lex-style-line-statement-separator] [fixture:
  xychart/lex-style-line-upper-case-keyword] [fixture:
  xychart/db-x-axis-title-quoted-style-line-semicolon] [fixture:
  xychart/db-y-axis-title-quoted-style-line-semicolon] [fixture:
  xychart/db-x-axis-band-quoted-style-line-semicolon] [fixture:
  xychart/db-plot-title-style-line-semicolon] [fixture:
  xychart/db-label-style-line-semicolon] [fixture:
  xychart/lex-acc-descr-block-style-line-semicolon] [fixture:
  xychart/lex-acc-descr-style-line-semicolon] [fixture:
  xychart/lex-acc-title-style-line-semicolon]
- A directive is removed before the text is read and the parts around it join:
  inside a title in quotes, between and after the words of a title, before a
  keyword, between the categories and inside a word, inside a number, a range,
  and an arrow, and between a keyword and a bracket. A comment line and a
  directive line inside a text in quotes are removed with their lines. A
  directive that is not closed takes nothing at the end of the text, and takes
  the word at the start of the next line, which is then rejected. [fixture:
  xychart/db-title-directive-after-bare] [fixture:
  xychart/db-title-directive-before-keyword] [fixture:
  xychart/db-title-directive-in-quotes] [fixture:
  xychart/db-title-quoted-comment-line-inside] [fixture:
  xychart/db-title-quoted-directive-line-inside] [fixture:
  xychart/db-directive-after-plot] [fixture: xychart/db-directive-between-label]
  [fixture: xychart/db-directive-between-title-words] [fixture:
  xychart/db-directive-glued-to-keyword] [fixture:
  xychart/db-directive-in-arrow] [fixture: xychart/db-directive-in-range]
  [fixture: xychart/db-directive-line] [fixture:
  xychart/db-directive-unclosed-after-categories] [fixture:
  xychart/db-directive-unclosed-after-header] [fixture:
  xychart/db-directive-unclosed-after-plot] [fixture:
  xychart/db-directive-unclosed-at-end] [fixture:
  xychart/gram-directive-unclosed-next-line] [fixture:
  xychart/db-x-axis-band-directive] [fixture:
  xychart/db-x-axis-band-directive-in-word] [fixture:
  xychart/db-plot-directive-in-number] [fixture:
  xychart/db-plot-directive-inside]
- A comment is a `%%` and runs to the end of its line: a comment line, and a
  comment after a statement, are skipped. A `%%` glued to the character before
  it takes that character: after the closing bracket of values or categories, a
  number, or a word, the statement is rejected, while after the closing quote of
  a text in quotes the comment is skipped and the text is kept, and after a
  space nothing is taken. A `#` starts no comment, so a line that starts with it
  is rejected, and neither does a single `%`. [fixture:
  xychart/db-comment-after-bracket-line] [fixture:
  xychart/db-comment-after-statement] [fixture: xychart/db-comment-at-end]
  [fixture: xychart/db-comment-glued-after-quote] [fixture:
  xychart/db-comment-glued-after-quoted-axis-title] [fixture:
  xychart/db-comment-indented] [fixture: xychart/db-comment-line] [fixture:
  xychart/db-comment-line-between] [fixture:
  xychart/db-comment-spaced-after-range] [fixture:
  xychart/gram-comment-hash-line] [fixture:
  xychart/gram-comment-in-label-quotes-closing] [fixture:
  xychart/gram-comment-percent-single] [fixture:
  xychart/div-comment-glued-after-axis-title] [fixture:
  xychart/div-comment-glued-after-bracket] [fixture:
  xychart/div-comment-glued-after-categories] [fixture:
  xychart/div-comment-glued-after-label] [fixture:
  xychart/div-comment-glued-after-range] [fixture:
  xychart/div-comment-glued-after-title-word] [fixture:
  xychart/gram-plot-comment-inside] [fixture: xychart/db-plot-comment-after]
  [fixture: xychart/db-x-axis-band-comment-after]
- `xAxis` is `{ type: "band", title, categories }` until a statement gives a
  range. The text after `x-axis` is its title, in quotes or words, and the title
  is empty where there is none. A later `x-axis` replaces the earlier axis, its
  title too, so that a statement with no title gives the empty one; two titles
  in quotes are rejected. A title without quotes holds letters and `_`, `.`,
  `&`, `=`, `*`, `#`, `+`, `-`, but no digit: a digit starts a number, which is
  no part of a title, so that `Q1`, `A-1`, `Year 2024`, and `2024` are rejected
  as the title of an axis, while `"Q1"` is accepted; the title of the chart, of
  a plot, and a category can hold digits. The text of the statement is on its
  line: a comment or a line feed between the keyword and the text or the
  brackets does not join them, and the statement is rejected. The keyword is
  read in any case; a bracket or a quote can follow it with no space; a letter
  glued to it is rejected, and `x-axis` alone is rejected. [fixture:
  xychart/db-x-axis-title-at-end-of-text] [fixture:
  xychart/db-x-axis-title-bare-characters] [fixture:
  xychart/db-x-axis-title-bare-hyphen] [fixture:
  xychart/db-x-axis-title-bare-word] [fixture:
  xychart/db-x-axis-title-keyword-prefix] [fixture:
  xychart/db-x-axis-title-quoted] [fixture:
  xychart/db-x-axis-title-quoted-digit] [fixture: xychart/db-x-axis-title-words]
  [fixture: xychart/gram-x-axis-title-bare-digit] [fixture:
  xychart/gram-x-axis-title-bare-digit-before-band] [fixture:
  xychart/gram-x-axis-title-bare-hyphen-digit] [fixture:
  xychart/gram-x-axis-title-bare-title-keyword] [fixture:
  xychart/gram-x-axis-title-bare-underscore-digit] [fixture:
  xychart/gram-x-axis-title-bare-words-number] [fixture:
  xychart/db-x-axis-three-times] [fixture: xychart/db-x-axis-twice] [fixture:
  xychart/db-x-axis-twice-title-cleared] [fixture:
  xychart/gram-x-axis-keyword-alone-at-end] [fixture:
  xychart/gram-x-axis-line-feed-before-bracket] [fixture:
  xychart/gram-x-axis-comment-before-bracket] [fixture:
  xychart/db-x-axis-upper-case-keyword] [fixture:
  xychart/db-x-axis-keyword-glued-bracket] [fixture:
  xychart/db-x-axis-keyword-glued-quote] [fixture:
  xychart/db-x-axis-prototype-title] [fixture: xychart/gram-x-axis-empty]
  [fixture: xychart/gram-x-axis-keyword-suffix] [fixture:
  xychart/gram-x-axis-band-after-string-title] [fixture:
  xychart/db-x-axis-range-then-band]
- A range is two numbers and `-->`: `{ type: "linear", title, min, max }`. A
  number is digits with an optional fraction, or a fraction with no integer
  part, and an optional sign; leading zeros are read as digits. The first can be
  greater than the second or equal to it, spaces around the arrow are not
  needed, `-0` is 0, and a number too large for an exact double is the number
  the Db holds. An exponent, `->`, a third number, a number with no arrow or
  with no second or first number, a word, and `1.` are rejected. [fixture:
  xychart/db-x-axis-range] [fixture: xychart/db-x-axis-range-decimal] [fixture:
  xychart/db-x-axis-range-equal] [fixture: xychart/db-x-axis-range-large]
  [fixture: xychart/db-x-axis-range-leading-zeros] [fixture:
  xychart/db-x-axis-range-negative] [fixture:
  xychart/db-x-axis-range-negative-zero] [fixture:
  xychart/db-x-axis-range-no-spaces] [fixture: xychart/db-x-axis-range-plus]
  [fixture: xychart/db-x-axis-range-title] [fixture:
  xychart/db-x-axis-range-title-quoted] [fixture:
  xychart/gram-x-axis-range-exponent] [fixture:
  xychart/gram-x-axis-range-no-end] [fixture:
  xychart/gram-x-axis-range-no-start] [fixture:
  xychart/gram-x-axis-range-one-number] [fixture:
  xychart/gram-x-axis-range-short-arrow] [fixture:
  xychart/gram-x-axis-range-text] [fixture: xychart/gram-x-axis-range-third]
  [fixture: xychart/gram-x-axis-range-trailing-dot]
- A list of categories is texts between `[` and `]` separated by commas: words,
  which are joined without the spaces between them, or text in quotes, which
  holds spaces, commas, and line feeds and loses the spaces at its ends.
  Numbers, signs, and the names of properties of objects are categories like
  others; two categories with the same text are two categories; a keyword in
  quotes is a category, while a keyword without quotes is rejected in any case.
  A list with a comma before the closing bracket, with nothing, with a space
  only, with an empty text in quotes, with a line feed between its items, with a
  character outside ASCII or a single `%` in a word, twice, with text after it,
  or not closed is rejected. [fixture: xychart/db-x-axis-band] [fixture:
  xychart/db-x-axis-band-characters] [fixture: xychart/db-x-axis-band-digit]
  [fixture: xychart/db-x-axis-band-entity] [fixture:
  xychart/db-x-axis-band-line-separator-inside] [fixture:
  xychart/db-x-axis-band-nbsp-inside] [fixture: xychart/db-x-axis-band-negative]
  [fixture: xychart/db-x-axis-band-no-spaces] [fixture:
  xychart/db-x-axis-band-numbers] [fixture: xychart/db-x-axis-band-one]
  [fixture: xychart/db-x-axis-band-prototype-names] [fixture:
  xychart/db-x-axis-band-quoted] [fixture:
  xychart/db-x-axis-band-quoted-keyword] [fixture:
  xychart/db-x-axis-band-quoted-line-feed] [fixture:
  xychart/db-x-axis-band-quoted-spaces] [fixture:
  xychart/db-x-axis-band-same-category] [fixture:
  xychart/db-x-axis-band-tab-inside] [fixture: xychart/db-x-axis-band-title]
  [fixture: xychart/db-x-axis-band-title-quoted] [fixture:
  xychart/db-x-axis-band-words] [fixture: xychart/gram-x-axis-band-axis-keyword]
  [fixture: xychart/gram-x-axis-band-empty] [fixture:
  xychart/gram-x-axis-band-empty-string] [fixture:
  xychart/gram-x-axis-band-extra-text] [fixture:
  xychart/gram-x-axis-band-keyword] [fixture:
  xychart/gram-x-axis-band-keyword-upper-case] [fixture:
  xychart/gram-x-axis-band-line-feed] [fixture:
  xychart/gram-x-axis-band-non-ascii] [fixture:
  xychart/gram-x-axis-band-percent-inside] [fixture:
  xychart/gram-x-axis-band-spaces-only] [fixture:
  xychart/gram-x-axis-band-title-keyword] [fixture:
  xychart/gram-x-axis-band-trailing-comma] [fixture:
  xychart/gram-x-axis-band-twice] [fixture: xychart/gram-x-axis-band-unclosed]
  [fixture: xychart/gram-x-axis-band-unclosed-string] [fixture:
  xychart/db-category-quoted-line-separator] [fixture:
  xychart/db-title-quoted-crlf-category]
- `yAxis` is `{ type: "linear", title, min, max }`; the range is `Infinity` and
  `-Infinity` where no statement gives one and no plot adds values. The text
  before the range is the title; a later `y-axis` with a range only gives the
  empty title, and one with a title only changes the title and keeps the range.
  A range written before or after the plots wins over the one the plots give.
  Categories, a third number, one number, the brackets around a range, and
  `y-axis` alone are rejected. [fixture: xychart/db-y-axis-after-plot] [fixture:
  xychart/db-y-axis-before-plot] [fixture: xychart/db-y-axis-no-range-no-plot]
  [fixture: xychart/db-y-axis-range] [fixture:
  xychart/db-y-axis-range-negative-decimal] [fixture:
  xychart/db-y-axis-range-reversed] [fixture: xychart/db-y-axis-range-title]
  [fixture: xychart/db-y-axis-title-bare-word] [fixture:
  xychart/db-y-axis-title-only-then-range] [fixture:
  xychart/db-y-axis-title-quoted] [fixture: xychart/db-y-axis-twice] [fixture:
  xychart/db-y-axis-upper-case-keyword] [fixture: xychart/gram-y-axis-band]
  [fixture: xychart/gram-y-axis-empty] [fixture:
  xychart/gram-y-axis-glued-bracket] [fixture:
  xychart/gram-y-axis-keyword-alone-at-end] [fixture:
  xychart/gram-y-axis-one-number] [fixture: xychart/gram-y-axis-third] [fixture:
  xychart/gram-y-axis-title-bare-digit] [fixture:
  xychart/gram-y-axis-title-bare-digit-before-range] [fixture:
  xychart/gram-y-axis-title-bare-letters-digits] [fixture:
  xychart/gram-y-axis-title-bare-title-keyword]
- A plot is `line` or `bar`, an optional title (in quotes, or words), and values
  between `[` and `]` separated by commas: `{ type, title, data }`. The keyword
  is read in any case, a bracket can follow it with no space, and a tab can
  separate them; a word glued to it, values with no brackets, empty brackets,
  and values on the next line are rejected. The plots are in the order of the
  text; two plots can have one title. A title that is a letter or a property
  name of objects is a title. [fixture: xychart/db-line-title-bare] [fixture:
  xychart/db-line-title-bare-digit] [fixture: xychart/db-line-title-quoted]
  [fixture: xychart/db-line-title-words] [fixture: xychart/db-line-values]
  [fixture: xychart/db-bar-title-bare] [fixture:
  xychart/db-bar-title-bare-number] [fixture: xychart/db-bar-title-quoted]
  [fixture: xychart/db-bar-values] [fixture:
  xychart/db-plot-title-bare-hyphen-digit] [fixture:
  xychart/db-plot-title-entity] [fixture: xychart/db-plot-title-keyword-like]
  [fixture: xychart/db-plot-title-prototype-name] [fixture:
  xychart/db-plot-title-quoted-line-feed] [fixture:
  xychart/db-plot-title-quoted-lone-cr] [fixture:
  xychart/db-plot-title-quoted-special] [fixture: xychart/db-plot-title-trimmed]
  [fixture: xychart/db-plot-bar-keyword-glued-bracket] [fixture:
  xychart/db-plot-capitalized-keyword] [fixture:
  xychart/db-plot-keyword-glued-bracket] [fixture: xychart/db-plot-tab-keyword]
  [fixture: xychart/db-plot-upper-case-keyword] [fixture:
  xychart/db-plot-bar-then-line] [fixture: xychart/db-plot-same-title-twice]
  [fixture: xychart/gram-line-comment-before-bracket] [fixture:
  xychart/gram-line-keyword-alone-at-end] [fixture:
  xychart/gram-line-title-only-at-end] [fixture:
  xychart/gram-bar-keyword-alone-at-end] [fixture:
  xychart/gram-bar-title-only-at-end] [fixture:
  xychart/gram-plot-values-keyword-glued-title] [fixture:
  xychart/gram-plot-values-bar-keyword-glued] [fixture:
  xychart/gram-plot-values-no-brackets] [fixture:
  xychart/gram-plot-values-empty] [fixture:
  xychart/gram-plot-values-line-feed-before-bracket] [fixture:
  xychart/gram-plot-values-title-line-feed-before-bracket] [fixture:
  xychart/gram-plot-values-extra-text]
- A value is a number as the range of an axis writes it: digits with an optional
  fraction, or a fraction with no integer part, and an optional sign; `-0` is 0
  and a number too large for an exact double is the number the Db holds. Spaces,
  tabs, no-break spaces, U+FEFF, and U+2028 inside the brackets and around the
  commas change nothing; a line feed or a CRLF does not. An exponent, a word,
  `NaN`, `Infinity`, `5.`, `1.5.2`, an underscore, two commas, a comma before
  the first value or the closing bracket, two values with no comma, a line feed
  inside the brackets, and brackets that are not closed are rejected. [fixture:
  xychart/db-plot-values-bom-inside] [fixture: xychart/db-plot-values-decimal]
  [fixture: xychart/db-plot-values-decimal-division] [fixture:
  xychart/db-plot-values-form-feed-inside] [fixture:
  xychart/db-plot-values-large] [fixture: xychart/db-plot-values-leading-zeros]
  [fixture: xychart/db-plot-values-line-separator-inside] [fixture:
  xychart/db-plot-values-nbsp-inside] [fixture: xychart/db-plot-values-negative]
  [fixture: xychart/db-plot-values-negative-zero] [fixture:
  xychart/db-plot-values-no-spaces] [fixture: xychart/db-plot-values-one]
  [fixture: xychart/db-plot-values-plus] [fixture:
  xychart/db-plot-values-spaces] [fixture: xychart/db-plot-values-tab-inside]
  [fixture: xychart/gram-plot-values-crlf-inside] [fixture:
  xychart/gram-plot-values-double-comma] [fixture:
  xychart/gram-plot-values-exponent] [fixture:
  xychart/gram-plot-values-infinity] [fixture:
  xychart/gram-plot-values-leading-comma] [fixture:
  xychart/gram-plot-values-line-feed-after-bracket] [fixture:
  xychart/gram-plot-values-line-feed-before-comma] [fixture:
  xychart/gram-plot-values-missing-comma] [fixture:
  xychart/gram-plot-values-nan] [fixture:
  xychart/gram-plot-values-trailing-comma] [fixture:
  xychart/gram-plot-values-trailing-dot] [fixture:
  xychart/gram-plot-values-two-dots] [fixture:
  xychart/gram-plot-values-unclosed] [fixture:
  xychart/gram-plot-values-underscore] [fixture: xychart/gram-plot-values-word]
- A value of a line can be followed by a label, a text in quotes, with or
  without a space: `pointLabels` lists the label of each value, the empty text
  for a value with none, and is there only when a label is written. A label that
  is empty gives no label. A label holds punctuation and line feeds, and loses
  the spaces at its ends. A label on a bar is accepted and not kept. A label
  without quotes, before the value, twice, with two quotes inside it, or not
  closed is rejected. [fixture: xychart/db-label-all] [fixture:
  xychart/db-label-empty-string] [fixture: xychart/db-label-entity] [fixture:
  xychart/db-label-last] [fixture: xychart/db-label-line-feed] [fixture:
  xychart/db-label-no-space] [fixture: xychart/db-label-on-bar] [fixture:
  xychart/db-label-one] [fixture: xychart/db-label-quoted-crlf] [fixture:
  xychart/db-label-spaces-trimmed] [fixture: xychart/db-label-special] [fixture:
  xychart/gram-label-bare] [fixture: xychart/gram-label-before-value] [fixture:
  xychart/gram-label-doubled-quote] [fixture: xychart/gram-label-twice]
  [fixture: xychart/gram-label-unclosed]
- `data` is the list of the pairs `[x, y]` that the Db makes where the plot is
  added, from the x axis at that point of the text: with a list of categories,
  one pair for each category, the values beyond the categories dropped and a
  category with no value having `null`; with a range, or with none, one pair for
  each value, the x being the text of the number computed by spreading the
  values evenly over the range, the first at its start. Where no x-axis
  statement comes before the first plot, the x axis becomes the range from 1 to
  the number of its values, and a later plot is spread over that range. An x
  axis written after a plot does not change its pairs. [fixture:
  xychart/db-data-band-after-plot] [fixture:
  xychart/db-data-band-after-plot-longer] [fixture: xychart/db-data-band-equal]
  [fixture: xychart/db-data-band-fewer-values] [fixture:
  xychart/db-data-band-more-values] [fixture: xychart/db-data-band-two-plots]
  [fixture: xychart/db-data-longer-second-plot] [fixture:
  xychart/db-data-shorter-second-plot] [fixture:
  xychart/db-data-no-axis-bar-and-line] [fixture:
  xychart/db-data-range-after-plot] [fixture: xychart/db-data-range-equal]
  [fixture: xychart/db-data-range-fractions] [fixture:
  xychart/db-data-range-integers] [fixture: xychart/db-data-range-negative]
  [fixture: xychart/db-data-range-one-value] [fixture:
  xychart/db-data-range-reversed] [fixture: xychart/db-data-range-three]
- The range of the y axis that no statement gives is computed from the values of
  the plots: the smallest and the greatest value of every plot, without the
  values that a list of categories drops; it is the range of one value for a
  plot of one value. [fixture: xychart/db-data-y-range-band-truncation]
  [fixture: xychart/db-data-y-range-from-plots] [fixture:
  xychart/db-data-y-range-negative-zero] [fixture:
  xychart/db-data-y-range-single-value]
- All the fields at once. [fixture: xychart/db-data-everything] [fixture:
  xychart/db-data-xy-title-and-plots]
- `accTitle` is the text after `accTitle:` to the end of its line, without the
  spaces at its ends; `accDescr` is the text after `accDescr:`, or the lines
  between `accDescr {` and `}`. No space is needed after the colon or before the
  brace; the colon or the brace can be on the line after the keyword; a colon, a
  `;`, a `#`, and spaces are characters of the text; the keyword is read in any
  case, and spaces can precede the colon. Where the line of `accTitle:` or
  `accDescr:` has no text, the keyword takes the next line that has text, over
  empty lines, comment lines, and directive lines, whole, as its value, and that
  line is no statement: a `title` line or a `line` line is then the text; only
  where no text follows to the end of the text is the value empty. A letter, a
  dash, a digit, or a space glued to or inside the keyword is rejected, and the
  keyword alone at the end of the text is rejected. The last statement of each
  kind is the value. A block that is not closed at the end of the text sets the
  empty description, an empty block (braces, or spaces between them) sets
  nothing and keeps the description before it, a description on a line and a
  block replace each other, and a `}` ends a block, after which the text is read
  as statements. A CRLF in a block joins the lines with a line feed, and a
  U+2028 is a character of the text. [fixture: xychart/db-acc-descr] [fixture:
  xychart/db-acc-descr-blank-lines-then-text] [fixture:
  xychart/db-acc-descr-block] [fixture:
  xychart/db-acc-descr-block-comment-line-inside] [fixture:
  xychart/db-acc-descr-block-cr] [fixture: xychart/db-acc-descr-block-crlf]
  [fixture: xychart/db-acc-descr-block-directive-inside] [fixture:
  xychart/db-acc-descr-block-empty] [fixture:
  xychart/db-acc-descr-block-hash-semicolon] [fixture:
  xychart/db-acc-descr-block-line-feed-before-brace] [fixture:
  xychart/db-acc-descr-block-line-separator-inside] [fixture:
  xychart/db-acc-descr-block-no-space] [fixture:
  xychart/db-acc-descr-block-percent] [fixture:
  xychart/db-acc-descr-block-spaces-inside] [fixture:
  xychart/db-acc-descr-block-then-empty-block] [fixture:
  xychart/db-acc-descr-block-then-empty-line] [fixture:
  xychart/db-acc-descr-block-then-line] [fixture:
  xychart/db-acc-descr-block-then-title-same-line] [fixture:
  xychart/db-acc-descr-block-twice-same-line] [fixture:
  xychart/db-acc-descr-block-upper-case] [fixture:
  xychart/db-acc-descr-colon-on-next-line] [fixture:
  xychart/db-acc-descr-comment-line-then-text] [fixture:
  xychart/db-acc-descr-directive-line-then-text] [fixture:
  xychart/db-acc-descr-empty-block-after-title-same-line] [fixture:
  xychart/db-acc-descr-empty-block-before-plot] [fixture:
  xychart/db-acc-descr-empty-block-before-title-same-line] [fixture:
  xychart/db-acc-descr-line-separator-inside] [fixture:
  xychart/db-acc-descr-line-then-block] [fixture:
  xychart/db-acc-descr-line-then-empty-block] [fixture:
  xychart/db-acc-descr-line-then-empty-braces] [fixture:
  xychart/db-acc-descr-line-then-empty-line] [fixture:
  xychart/db-acc-descr-line-then-spaces-block] [fixture:
  xychart/db-acc-descr-no-space] [fixture:
  xychart/db-acc-descr-takes-title-line] [fixture:
  xychart/db-acc-descr-unclosed-block] [fixture: xychart/db-acc-title] [fixture:
  xychart/db-acc-title-blank-lines-then-text] [fixture:
  xychart/db-acc-title-colon-inside] [fixture:
  xychart/db-acc-title-colon-on-next-line] [fixture:
  xychart/db-acc-title-comment-line-then-text] [fixture:
  xychart/db-acc-title-directive-line-then-text] [fixture:
  xychart/db-acc-title-empty] [fixture:
  xychart/db-acc-title-empty-at-end-after-value] [fixture:
  xychart/db-acc-title-hash] [fixture:
  xychart/db-acc-title-leading-ideographic-space] [fixture:
  xychart/db-acc-title-line-separator-inside] [fixture:
  xychart/db-acc-title-no-space] [fixture: xychart/db-acc-title-semicolon]
  [fixture: xychart/db-acc-title-space-before-colon] [fixture:
  xychart/db-acc-title-spaces-trimmed] [fixture:
  xychart/db-acc-title-takes-next-line] [fixture:
  xychart/db-acc-title-then-empty-line] [fixture:
  xychart/db-acc-title-three-times] [fixture: xychart/db-acc-title-trailing-bom]
  [fixture: xychart/db-acc-title-trailing-ideographic-space] [fixture:
  xychart/db-acc-title-trailing-nbsp] [fixture:
  xychart/db-acc-title-trailing-tab] [fixture: xychart/db-acc-title-twice]
  [fixture: xychart/db-acc-title-two-colons] [fixture:
  xychart/db-acc-title-upper-case] [fixture:
  xychart/gram-acc-descr-block-braces-inside] [fixture:
  xychart/gram-acc-descr-block-double-close] [fixture:
  xychart/gram-acc-descr-block-two-blocks] [fixture:
  xychart/gram-acc-descr-empty-block-before-header] [fixture:
  xychart/gram-acc-descr-keyword-alone] [fixture:
  xychart/gram-acc-title-dash-suffix] [fixture:
  xychart/gram-acc-title-digit-suffix] [fixture:
  xychart/gram-acc-title-keyword-alone] [fixture:
  xychart/gram-acc-title-space-in-keyword] [fixture:
  xychart/gram-acc-title-word-suffix] [fixture:
  xychart/div-empty-description-block-inside-axis] [fixture:
  xychart/div-empty-description-block-inside-plot] [fixture:
  xychart/div-empty-description-block-inside-title-text] [fixture:
  xychart/div-empty-description-block-inside-values]
- `title`, `accTitle`, the titles of the axes, the categories, the titles of the
  plots, and the labels pass through `sanitizeText` and, under a `securityLevel`
  that is not one of mermaid.js's values with HTML labels enabled, hold the
  replaced characters (see [db-from-tree.md](./db-from-tree.md), the replacement
  of characters); the pairs of the plots hold the replaced categories. Under
  `loose` and `sandbox`, or with `htmlLabels` false at the top of the settings
  or in `flowchart`, they are as written. [fixture:
  xychart/config-security-level-loose-all] [fixture:
  xychart/config-security-level-other-all] [fixture:
  xychart/config-security-level-other-flowchart-html-labels-false] [fixture:
  xychart/config-security-level-other-html-labels-false] [fixture:
  xychart/config-security-level-other-orientation-horizontal] [fixture:
  xychart/config-security-level-sandbox-all]
- The places that hold a text are a title, the accessibility title, a
  description on a line and in braces, the title of the x axis, a category, the
  title of the y axis, the title of a plot, and a label; all but the
  accessibility texts and the label hold a text without quotes or in quotes. The
  same rules hold in every place, but where a following item says otherwise.
  Whitespace of any kind (a tab, a U+FEFF, a no-break space, a U+3000, a U+2028,
  a U+2029) separates the words of a text without quotes and is skipped, so that
  the words join; in quotes and in an accessibility text it is a character of
  the text. [fixture: xychart/db-grid-tab-acc-descr] [fixture:
  xychart/db-grid-tab-acc-descr-block] [fixture: xychart/db-grid-tab-acc-title]
  [fixture: xychart/db-grid-tab-category-bare] [fixture:
  xychart/db-grid-tab-category-quoted] [fixture: xychart/db-grid-tab-label]
  [fixture: xychart/db-grid-tab-plot-title-bare] [fixture:
  xychart/db-grid-tab-plot-title-quoted] [fixture:
  xychart/db-grid-tab-title-bare] [fixture: xychart/db-grid-tab-title-quoted]
  [fixture: xychart/db-grid-tab-x-title-bare] [fixture:
  xychart/db-grid-tab-x-title-quoted] [fixture:
  xychart/db-grid-tab-y-title-bare] [fixture:
  xychart/db-grid-tab-y-title-quoted] [fixture: xychart/db-grid-bom-acc-descr]
  [fixture: xychart/db-grid-bom-acc-descr-block] [fixture:
  xychart/db-grid-bom-acc-title] [fixture: xychart/db-grid-bom-category-bare]
  [fixture: xychart/db-grid-bom-category-quoted] [fixture:
  xychart/db-grid-bom-label] [fixture: xychart/db-grid-bom-plot-title-bare]
  [fixture: xychart/db-grid-bom-plot-title-quoted] [fixture:
  xychart/db-grid-bom-title-bare] [fixture: xychart/db-grid-bom-title-quoted]
  [fixture: xychart/db-grid-bom-x-title-bare] [fixture:
  xychart/db-grid-bom-x-title-quoted] [fixture:
  xychart/db-grid-bom-y-title-bare] [fixture:
  xychart/db-grid-bom-y-title-quoted] [fixture: xychart/db-grid-nbsp-acc-descr]
  [fixture: xychart/db-grid-nbsp-acc-descr-block] [fixture:
  xychart/db-grid-nbsp-acc-title] [fixture: xychart/db-grid-nbsp-category-bare]
  [fixture: xychart/db-grid-nbsp-category-quoted] [fixture:
  xychart/db-grid-nbsp-label] [fixture: xychart/db-grid-nbsp-plot-title-bare]
  [fixture: xychart/db-grid-nbsp-plot-title-quoted] [fixture:
  xychart/db-grid-nbsp-title-quoted] [fixture:
  xychart/db-grid-nbsp-x-title-bare] [fixture:
  xychart/db-grid-nbsp-x-title-quoted] [fixture:
  xychart/db-grid-nbsp-y-title-bare] [fixture:
  xychart/db-grid-nbsp-y-title-quoted] [fixture:
  xychart/db-grid-ideographic-acc-descr] [fixture:
  xychart/db-grid-ideographic-acc-descr-block] [fixture:
  xychart/db-grid-ideographic-acc-title] [fixture:
  xychart/db-grid-ideographic-category-bare] [fixture:
  xychart/db-grid-ideographic-category-quoted] [fixture:
  xychart/db-grid-ideographic-label] [fixture:
  xychart/db-grid-ideographic-plot-title-bare] [fixture:
  xychart/db-grid-ideographic-plot-title-quoted] [fixture:
  xychart/db-grid-ideographic-title-quoted] [fixture:
  xychart/db-grid-ideographic-x-title-bare] [fixture:
  xychart/db-grid-ideographic-x-title-quoted] [fixture:
  xychart/db-grid-ideographic-y-title-bare] [fixture:
  xychart/db-grid-ideographic-y-title-quoted] [fixture:
  xychart/db-grid-ls-acc-descr-block] [fixture:
  xychart/db-grid-ls-category-bare] [fixture:
  xychart/db-grid-ls-category-quoted] [fixture: xychart/db-grid-ls-label]
  [fixture: xychart/db-grid-ls-plot-title-bare] [fixture:
  xychart/db-grid-ls-plot-title-quoted] [fixture: xychart/db-grid-ls-title-bare]
  [fixture: xychart/db-grid-ls-x-title-bare] [fixture:
  xychart/db-grid-ls-x-title-quoted] [fixture: xychart/db-grid-ls-y-title-bare]
  [fixture: xychart/db-grid-ls-y-title-quoted] [fixture:
  xychart/db-grid-ps-acc-descr] [fixture: xychart/db-grid-ps-acc-descr-block]
  [fixture: xychart/db-grid-ps-acc-title] [fixture:
  xychart/db-grid-ps-category-bare] [fixture:
  xychart/db-grid-ps-category-quoted] [fixture: xychart/db-grid-ps-label]
  [fixture: xychart/db-grid-ps-plot-title-bare] [fixture:
  xychart/db-grid-ps-plot-title-quoted] [fixture: xychart/db-grid-ps-title-bare]
  [fixture: xychart/db-grid-ps-title-quoted] [fixture:
  xychart/db-grid-ps-x-title-bare] [fixture: xychart/db-grid-ps-x-title-quoted]
  [fixture: xychart/db-grid-ps-y-title-bare] [fixture:
  xychart/db-grid-ps-y-title-quoted]
- A line feed, a CRLF, and a lone CR inside a text: in quotes and in braces they
  are one line feed in the text; without quotes and on the line of `accTitle:`
  or `accDescr:` they end the line, and the rest is read as the next statement,
  which is rejected. [fixture: xychart/db-grid-crlf-acc-descr-block] [fixture:
  xychart/db-grid-crlf-category-quoted] [fixture: xychart/db-grid-crlf-label]
  [fixture: xychart/db-grid-crlf-plot-title-quoted] [fixture:
  xychart/db-grid-crlf-title-quoted] [fixture:
  xychart/db-grid-crlf-x-title-quoted] [fixture:
  xychart/db-grid-crlf-y-title-quoted] [fixture:
  xychart/gram-grid-crlf-acc-descr] [fixture: xychart/gram-grid-crlf-acc-title]
  [fixture: xychart/gram-grid-crlf-category-bare] [fixture:
  xychart/gram-grid-crlf-plot-title-bare] [fixture:
  xychart/gram-grid-crlf-title-bare] [fixture:
  xychart/gram-grid-crlf-x-title-bare] [fixture:
  xychart/gram-grid-crlf-y-title-bare] [fixture:
  xychart/db-grid-cr-acc-descr-block] [fixture:
  xychart/db-grid-cr-category-quoted] [fixture: xychart/db-grid-cr-label]
  [fixture: xychart/db-grid-cr-title-quoted] [fixture:
  xychart/db-grid-cr-x-title-quoted] [fixture:
  xychart/db-grid-cr-y-title-quoted] [fixture: xychart/gram-grid-cr-acc-descr]
  [fixture: xychart/gram-grid-cr-acc-title] [fixture:
  xychart/gram-grid-cr-category-bare] [fixture:
  xychart/gram-grid-cr-plot-title-bare] [fixture:
  xychart/gram-grid-cr-title-bare] [fixture: xychart/gram-grid-cr-x-title-bare]
  [fixture: xychart/gram-grid-cr-y-title-bare] [fixture:
  xychart/db-grid-lf-acc-descr-block] [fixture:
  xychart/db-grid-lf-category-quoted] [fixture:
  xychart/db-grid-lf-x-title-quoted] [fixture:
  xychart/db-grid-lf-y-title-quoted] [fixture: xychart/gram-grid-lf-acc-descr]
  [fixture: xychart/gram-grid-lf-acc-title] [fixture:
  xychart/gram-grid-lf-category-bare] [fixture:
  xychart/gram-grid-lf-plot-title-bare] [fixture:
  xychart/gram-grid-lf-title-bare] [fixture: xychart/gram-grid-lf-x-title-bare]
  [fixture: xychart/gram-grid-lf-y-title-bare]
- A directive inside a text is removed in every place and the parts join. A `%%`
  after a space inside a text is a character of the text in quotes, in the
  accessibility texts, and in a label; without quotes it starts a comment that
  ends the text in a title and in the title of an axis, and, since a category
  and the title of a plot are followed by more of the statement, it is rejected
  there. [fixture: xychart/db-grid-directive-acc-descr] [fixture:
  xychart/db-grid-directive-acc-descr-block] [fixture:
  xychart/db-grid-directive-acc-title] [fixture:
  xychart/db-grid-directive-category-bare] [fixture:
  xychart/db-grid-directive-category-quoted] [fixture:
  xychart/db-grid-directive-label] [fixture:
  xychart/db-grid-directive-plot-title-bare] [fixture:
  xychart/db-grid-directive-plot-title-quoted] [fixture:
  xychart/db-grid-directive-title-bare] [fixture:
  xychart/db-grid-directive-title-quoted] [fixture:
  xychart/db-grid-directive-x-title-bare] [fixture:
  xychart/db-grid-directive-x-title-quoted] [fixture:
  xychart/db-grid-directive-y-title-bare] [fixture:
  xychart/db-grid-directive-y-title-quoted] [fixture:
  xychart/db-grid-comment-acc-descr] [fixture:
  xychart/db-grid-comment-acc-descr-block] [fixture:
  xychart/db-grid-comment-acc-title] [fixture:
  xychart/db-grid-comment-category-quoted] [fixture:
  xychart/db-grid-comment-label] [fixture:
  xychart/db-grid-comment-plot-title-quoted] [fixture:
  xychart/db-grid-comment-title-bare] [fixture:
  xychart/db-grid-comment-x-title-bare] [fixture:
  xychart/db-grid-comment-x-title-quoted] [fixture:
  xychart/db-grid-comment-y-title-bare] [fixture:
  xychart/db-grid-comment-y-title-quoted] [fixture:
  xychart/gram-grid-comment-category-bare] [fixture:
  xychart/gram-grid-comment-plot-title-bare]
- A `;` that the line rule drops, a character reference, a keyword, a character
  outside ASCII, an HTML tag, and punctuation are texts in quotes, in the
  accessibility texts, and in a label (the tag with its attribute quotes read as
  `'`); without quotes they are rejected, since a text without quotes holds the
  characters of a word only. [fixture: xychart/db-grid-style-acc-descr]
  [fixture: xychart/db-grid-style-acc-descr-block] [fixture:
  xychart/db-grid-style-acc-title] [fixture:
  xychart/db-grid-style-x-title-quoted] [fixture:
  xychart/gram-grid-style-category-bare] [fixture:
  xychart/gram-grid-style-plot-title-bare] [fixture:
  xychart/gram-grid-style-title-bare] [fixture:
  xychart/gram-grid-style-x-title-bare] [fixture:
  xychart/gram-grid-style-y-title-bare] [fixture:
  xychart/db-grid-entity-acc-descr] [fixture:
  xychart/db-grid-entity-acc-descr-block] [fixture:
  xychart/db-grid-entity-acc-title] [fixture:
  xychart/db-grid-entity-category-quoted] [fixture:
  xychart/db-grid-entity-plot-title-quoted] [fixture:
  xychart/db-grid-entity-x-title-quoted] [fixture:
  xychart/db-grid-entity-y-title-quoted] [fixture:
  xychart/gram-grid-entity-category-bare] [fixture:
  xychart/gram-grid-entity-plot-title-bare] [fixture:
  xychart/gram-grid-entity-x-title-bare] [fixture:
  xychart/gram-grid-entity-y-title-bare] [fixture:
  xychart/db-grid-keyword-acc-descr] [fixture:
  xychart/db-grid-keyword-acc-descr-block] [fixture:
  xychart/db-grid-keyword-acc-title] [fixture:
  xychart/db-grid-keyword-category-quoted] [fixture:
  xychart/db-grid-keyword-label] [fixture:
  xychart/db-grid-keyword-plot-title-quoted] [fixture:
  xychart/db-grid-keyword-title-quoted] [fixture:
  xychart/db-grid-keyword-x-title-quoted] [fixture:
  xychart/db-grid-keyword-y-title-quoted] [fixture:
  xychart/gram-grid-keyword-category-bare] [fixture:
  xychart/gram-grid-keyword-plot-title-bare] [fixture:
  xychart/gram-grid-keyword-title-bare] [fixture:
  xychart/gram-grid-keyword-x-title-bare] [fixture:
  xychart/gram-grid-keyword-y-title-bare] [fixture:
  xychart/db-grid-nonascii-acc-descr] [fixture:
  xychart/db-grid-nonascii-acc-descr-block] [fixture:
  xychart/db-grid-nonascii-acc-title] [fixture:
  xychart/db-grid-nonascii-category-quoted] [fixture:
  xychart/db-grid-nonascii-label] [fixture:
  xychart/db-grid-nonascii-plot-title-quoted] [fixture:
  xychart/db-grid-nonascii-title-quoted] [fixture:
  xychart/db-grid-nonascii-x-title-quoted] [fixture:
  xychart/db-grid-nonascii-y-title-quoted] [fixture:
  xychart/gram-grid-nonascii-category-bare] [fixture:
  xychart/gram-grid-nonascii-plot-title-bare] [fixture:
  xychart/gram-grid-nonascii-x-title-bare] [fixture:
  xychart/gram-grid-nonascii-y-title-bare] [fixture:
  xychart/db-grid-html-acc-descr] [fixture:
  xychart/db-grid-html-acc-descr-block] [fixture:
  xychart/db-grid-html-acc-title] [fixture:
  xychart/db-grid-html-category-quoted] [fixture: xychart/db-grid-html-label]
  [fixture: xychart/db-grid-html-plot-title-quoted] [fixture:
  xychart/db-grid-html-x-title-quoted] [fixture:
  xychart/db-grid-html-y-title-quoted] [fixture:
  xychart/gram-grid-html-category-bare] [fixture:
  xychart/gram-grid-html-plot-title-bare] [fixture:
  xychart/gram-grid-html-title-bare] [fixture:
  xychart/gram-grid-html-x-title-bare] [fixture:
  xychart/gram-grid-html-y-title-bare] [fixture:
  xychart/db-grid-punct-acc-descr] [fixture:
  xychart/db-grid-punct-acc-descr-block] [fixture:
  xychart/db-grid-punct-acc-title] [fixture:
  xychart/db-grid-punct-category-quoted] [fixture: xychart/db-grid-punct-label]
  [fixture: xychart/db-grid-punct-plot-title-quoted] [fixture:
  xychart/db-grid-punct-title-quoted] [fixture:
  xychart/db-grid-punct-x-title-quoted] [fixture:
  xychart/db-grid-punct-y-title-quoted] [fixture:
  xychart/gram-grid-punct-category-bare] [fixture:
  xychart/gram-grid-punct-plot-title-bare] [fixture:
  xychart/gram-grid-punct-title-bare] [fixture:
  xychart/gram-grid-punct-x-title-bare] [fixture:
  xychart/gram-grid-punct-y-title-bare]
- The name `__proto__` and a `#` inside a word are texts in every place. An
  empty text is rejected as a title, the title of an axis, and a category, in
  quotes or not; it is the empty text in the accessibility texts and the title
  of a plot, and no label in a label. [fixture: xychart/db-grid-proto-acc-descr]
  [fixture: xychart/db-grid-proto-acc-descr-block] [fixture:
  xychart/db-grid-proto-acc-title] [fixture:
  xychart/db-grid-proto-category-bare] [fixture:
  xychart/db-grid-proto-category-quoted] [fixture: xychart/db-grid-proto-label]
  [fixture: xychart/db-grid-proto-plot-title-quoted] [fixture:
  xychart/db-grid-proto-title-bare] [fixture:
  xychart/db-grid-proto-title-quoted] [fixture:
  xychart/db-grid-proto-x-title-bare] [fixture:
  xychart/db-grid-proto-x-title-quoted] [fixture:
  xychart/db-grid-proto-y-title-bare] [fixture:
  xychart/db-grid-proto-y-title-quoted] [fixture:
  xychart/db-grid-hash-acc-descr] [fixture:
  xychart/db-grid-hash-acc-descr-block] [fixture:
  xychart/db-grid-hash-acc-title] [fixture: xychart/db-grid-hash-category-bare]
  [fixture: xychart/db-grid-hash-category-quoted] [fixture:
  xychart/db-grid-hash-label] [fixture: xychart/db-grid-hash-plot-title-bare]
  [fixture: xychart/db-grid-hash-plot-title-quoted] [fixture:
  xychart/db-grid-hash-title-bare] [fixture: xychart/db-grid-hash-title-quoted]
  [fixture: xychart/db-grid-hash-x-title-bare] [fixture:
  xychart/db-grid-hash-x-title-quoted] [fixture:
  xychart/db-grid-hash-y-title-bare] [fixture:
  xychart/db-grid-hash-y-title-quoted] [fixture:
  xychart/db-grid-empty-acc-descr] [fixture:
  xychart/db-grid-empty-acc-descr-block] [fixture:
  xychart/db-grid-empty-acc-title] [fixture:
  xychart/db-grid-empty-plot-title-bare] [fixture:
  xychart/db-grid-empty-plot-title-quoted] [fixture:
  xychart/gram-grid-empty-category-bare] [fixture:
  xychart/gram-grid-empty-category-quoted] [fixture:
  xychart/gram-grid-empty-title-bare] [fixture:
  xychart/gram-grid-empty-x-title-bare] [fixture:
  xychart/gram-grid-empty-x-title-quoted] [fixture:
  xychart/gram-grid-empty-y-title-bare] [fixture:
  xychart/gram-grid-empty-y-title-quoted]

## quadrant

The fields of the summary:

| Field       | Content                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| `title`     | The title of the chart: the last `title` statement, or else the frontmatter. |
| `accTitle`  | The accessibility title, or the empty text.                                  |
| `accDescr`  | The accessibility description, or the empty text.                            |
| `quadrants` | The texts of `quadrant-1` to `quadrant-4`, in that order.                    |
| `xAxis`     | The texts of the x axis: `left` and `right`.                                 |
| `yAxis`     | The texts of the y axis: `bottom` and `top`.                                 |
| `points`    | The points, in the order the Db holds them.                                  |
| `classes`   | The classes, in the order of their first definition.                         |

A point has `text`, `className` (the empty text if the point has no class), `x`
and `y` (the texts of the two numbers as the lexer read them), and the styles it
has, as the text wrote them: `radius`, a number, `color`, `strokeColor`, and
`strokeWidth`. A class has `name` and the styles it has. A radius that is no
finite number (the digits of one are too many for a double) is the text of the
number (`"Infinity"`), since JSON has no such number.

`normalizeQuadrant()` (`src/normalizers/quadrant.ts`) summarizes the Db of
`quadrantChart`. The Db reads no browser feature, no time and no random value
while it parses. It is one object that every quadrant chart shares, whose state
is in a `QuadrantBuilder` that only its own methods reach, and
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L147-L150)
resets it before each parse. The only way to read what the text gave is
[`getQuadrantData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L120-L145),
which lays the chart out
([`build()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantBuilder.ts#L604-L623)),
so the summary takes from it what the layout keeps as the Db holds it: the texts
of the quadrants, of the axes, and of the points. The layout does not keep the
class name of a point, the coordinates as written, the styles as written, or the
classes, so a patch of the Db (`patchQuadrantDb()`) records what
[`addPoint()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L95-L106)
and
[`addClass()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L108-L110)
receive, after the Db has accepted it, with the styles that
[`parseStyles()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L64-L93)
makes of the written ones. The patch is applied to the Db itself, since there is
one Db, and `clear()` starts the recording over.

The layout lists a label of an axis only for a text that is not empty, so a
single label is the first text of its axis when the layout puts it at `left`,
which it does where the second text is empty, and the second text when it puts
it at `center`, which it does where the second text is not empty
([`getAxisLabels()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantBuilder.ts#L286-L382)).
A setting of the site that hides the labels of an axis would lose a text that
the Db holds, so the patch also records, in the setters of the texts of the
axes, which texts the text set, and the summary throws a
`MermaidEnvironmentError` where the layout lists others.

It drops the following, each for the reason given:

- The layout that `getQuadrantData()` makes: the coordinates and sizes in the
  units of the chart, the colours of the theme, the borders, the default radius
  and stroke width, and the position of a text. They depend on the settings of
  the site (`quadrantChart`, the theme) and on nothing the text says.
- The merge of the styles of a point with those of its class
  (`{ ...classStyles, ...point }`), which the renderer makes: the styles of a
  point and of its class are kept as the text wrote them.

Values of the summary, by field. The text is read by
[the lexer](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L15-L77)
and
[the grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L83-L189),
and the styles by
[`parseStyles()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L64-L93),
which rejects what it does not know
([`validateNumber()` and the others](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/utils.ts#L8-L18)).

- The header is `quadrantChart`.
  [The detector](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDetector.ts#L9-L11)
  reads it with this exact case, so `QUADRANTCHART`, `quadrantchart`, and
  `QuadrantChart` are not detected. A word, a dash and a word, a digit, or a
  character outside ASCII glued to the header is a text where no statement
  starts, so the text is rejected, while a keyword glued to it, `title`, is read
  as the keyword. A second header, on a line of its own, after spaces, or on the
  header line, is rejected. [fixture: quadrant/spec-quadrant-jison-fe2d2340]
  [fixture: quadrant/header-upper-case] [fixture: quadrant/header-lower-case]
  [fixture: quadrant/header-capitalized] [fixture: quadrant/header-word-suffix]
  [fixture: quadrant/header-spaced-word-suffix] [fixture:
  quadrant/header-dash-suffix] [fixture: quadrant/header-non-ascii-suffix]
  [fixture: quadrant/header-digit-suffix] [fixture: quadrant/header-title-glued]
  [fixture: quadrant/header-twice] [fixture: quadrant/header-twice-indented]
  [fixture: quadrant/header-twice-same-line]
- Spaces, tabs, empty lines, a line of spaces and tabs, a no-break space, a
  U+FEFF, an ideographic space, a U+2028, a comment line, a line of `%%` alone,
  a directive line, and `%%{ }%%` before the header change nothing, and neither
  does a frontmatter, with a comment line after it. A line that starts with `#`,
  a `;`, a statement, or a text of nothing but a comment line before the header
  is not detected. [fixture: quadrant/header-indented] [fixture:
  quadrant/header-tab-indented] [fixture:
  quadrant/header-after-bare-percent-line] [fixture:
  quadrant/header-after-blank-lines] [fixture:
  quadrant/header-after-comment-line] [fixture:
  quadrant/header-after-directive-line] [fixture:
  quadrant/header-after-empty-braces-line] [fixture:
  quadrant/header-after-frontmatter] [fixture:
  quadrant/header-after-frontmatter-and-comment] [fixture:
  quadrant/header-after-hash-line] [fixture:
  quadrant/header-after-semicolon-line] [fixture:
  quadrant/header-after-whitespace-line] [fixture: quadrant/header-bom-before]
  [fixture: quadrant/header-nbsp-before] [fixture:
  quadrant/header-ideographic-space-before] [fixture: quadrant/header-ls-before]
  [fixture: quadrant/header-leading-semicolon] [fixture:
  quadrant/header-only-comment] [fixture: quadrant/header-statement-first]
- After the header, a comment after a space or glued to it is skipped, a
  directive glued to it or inside it is removed, and a line of `%%` alone is a
  comment line. A statement can follow the header on its line, separated by a
  space or a tab, and so can a `;`, which ends the line. Spaces and tabs after
  the header are skipped; a CRLF or a CR alone ends the line, and so do the line
  feeds in the other forms; a vertical tab and a form feed are white space,
  while a no-break space, a U+2028, a U+2029, and a U+0085 are a text where no
  statement starts, and the text is rejected. [fixture:
  quadrant/header-comment-on-header-line] [fixture:
  quadrant/header-comment-glued] [fixture: quadrant/header-directive-glued]
  [fixture: quadrant/div-directive-inside] [fixture:
  quadrant/header-bare-percent-line-after-header] [fixture:
  quadrant/header-statement-on-header-line] [fixture:
  quadrant/header-statement-on-header-line-tab] [fixture:
  quadrant/header-semicolon] [fixture: quadrant/header-semicolon-spaced]
  [fixture: quadrant/header-semicolon-statement] [fixture:
  quadrant/header-trailing-nbsp] [fixture: quadrant/header-trailing-spaces]
  [fixture: quadrant/header-trailing-tab] [fixture: quadrant/header-crlf]
  [fixture: quadrant/header-cr] [fixture: quadrant/header-ls-after] [fixture:
  quadrant/header-ps-after] [fixture: quadrant/header-vt-after] [fixture:
  quadrant/header-ff-after] [fixture: quadrant/header-nel-after]
- The last `title` statement is the title of the chart, and it replaces the
  title of the frontmatter, which is the title where no statement gives one; an
  empty `title` statement replaces it with the empty text too. The keyword is
  read in any case, spaces or a tab can separate it from the text, and spaces or
  a tab can come before it. A word glued to the keyword, `titleT`, is not the
  keyword but a text where no statement starts, so the line is rejected; a word
  that starts with `title` and goes on as a word is a text, `Titles: [0.3, 0.6]`
  being a point, while the word `title` inside a text is the keyword, so that
  `My title: [0.3, 0.6]` and `x-axis A title T` are rejected. A line feed ends a
  title, and the next line is a statement. [fixture:
  quadrant/db-title-keyword-capitalized] [fixture:
  quadrant/db-title-keyword-upper-case] [fixture:
  quadrant/db-title-keyword-alone] [fixture:
  quadrant/db-title-keyword-trailing-space] [fixture:
  quadrant/gram-title-glued-word] [fixture: quadrant/db-title-twice] [fixture:
  quadrant/db-title-twice-empty-last] [fixture: quadrant/db-title-indented]
  [fixture: quadrant/db-title-tab-indented] [fixture:
  quadrant/db-title-tab-separator] [fixture: quadrant/db-title-after-semicolon]
  [fixture: quadrant/db-title-frontmatter] [fixture:
  quadrant/db-title-frontmatter-after-statement] [fixture:
  quadrant/db-title-frontmatter-and-statement] [fixture:
  quadrant/db-title-prefix-of-name] [fixture:
  quadrant/gram-title-in-name-middle] [fixture: quadrant/gram-title-lf-ends]
  [fixture: quadrant/gram-title-after-axis-text]
- A title takes the rest of its line, without the spaces and tabs at its ends:
  every character of the line is text, the quotes, a `;`, a `#`, a single `%`, a
  `%%` and what follows it, a colon, a dash, characters outside ASCII, and a
  tag, so that the statements after a `;` are part of the title. The comment
  rules do not apply to it. A directive inside it is removed before the lexer
  reads the text. A title can look like a point: `title: [0.3, 0.6]` is a title.
  A title of digits is a title, also after another statement or a `;`. [fixture:
  quadrant/db-title-spaces-trimmed] [fixture: quadrant/db-title-tab-trailing]
  [fixture: quadrant/db-title-inner-spaces] [fixture: quadrant/db-title-colon]
  [fixture: quadrant/db-title-quotes-kept] [fixture:
  quadrant/db-title-semicolon-kept] [fixture:
  quadrant/db-title-semicolon-then-statement] [fixture:
  quadrant/db-acc-title-after-semicolon] [fixture: quadrant/db-title-hash-kept]
  [fixture: quadrant/db-title-leading-dash] [fixture:
  quadrant/db-title-leading-hash] [fixture: quadrant/db-title-leading-semicolon]
  [fixture: quadrant/db-title-percent-kept] [fixture:
  quadrant/db-title-comment-glued-kept] [fixture:
  quadrant/db-title-comment-kept] [fixture: quadrant/db-title-comment-only]
  [fixture: quadrant/db-title-directive-removed] [fixture:
  quadrant/db-title-dash] [fixture: quadrant/db-title-non-ascii] [fixture:
  quadrant/db-title-html] [fixture: quadrant/db-title-entity] [fixture:
  quadrant/db-title-keyword-in-text] [fixture:
  quadrant/db-title-with-colon-point-like] [fixture:
  quadrant/db-title-digit-after-axis-semicolon] [fixture:
  quadrant/db-title-digit-after-classdef] [fixture:
  quadrant/db-title-digit-after-empty-block] [fixture:
  quadrant/db-title-digit-after-point] [fixture:
  quadrant/db-title-digit-after-quadrant] [fixture:
  quadrant/db-title-digit-after-x-axis] [fixture:
  quadrant/db-title-digit-after-x-axis-arrow] [fixture:
  quadrant/db-title-digit-alone] [fixture: quadrant/db-title-digits-with-space]
- `accTitle:` and `accDescr:` set the accessibility title and description. The
  keyword is read in any case, spaces or a tab can stand between it and the
  colon, the text can follow the colon with no space, and the colon is needed.
  The text is the rest of the line without the spaces at its ends, the last
  statement wins, and the two statements do not touch each other. A word glued
  to the keyword is not the keyword. The frontmatter fields `accTitle` and
  `accDescr` set nothing. [fixture: quadrant/db-acc-title-plain] [fixture:
  quadrant/db-acc-title-glued-colon] [fixture:
  quadrant/db-acc-title-space-before-colon] [fixture:
  quadrant/db-acc-title-tab-before-colon] [fixture:
  quadrant/gram-acc-title-no-colon] [fixture: quadrant/db-acc-title-upper-case]
  [fixture: quadrant/db-acc-title-trimmed] [fixture:
  quadrant/db-acc-title-twice] [fixture: quadrant/db-acc-title-indented]
  [fixture: quadrant/db-acc-title-frontmatter-like-yaml] [fixture:
  quadrant/gram-acc-title-glued-word] [fixture: quadrant/db-acc-descr-plain]
  [fixture: quadrant/db-acc-descr-glued-colon] [fixture:
  quadrant/db-acc-descr-space-before-colon] [fixture:
  quadrant/gram-acc-descr-no-colon] [fixture: quadrant/db-acc-descr-upper-case]
  [fixture: quadrant/db-acc-descr-trimmed] [fixture:
  quadrant/db-acc-descr-twice] [fixture:
  quadrant/db-acc-descr-frontmatter-like-yaml] [fixture:
  quadrant/gram-acc-descr-glued-word] [fixture: quadrant/db-acc-both]
- The text of an accessibility line is, like a title, the rest of its line: a
  `;`, a `#`, a colon, quotes, and a `%%` with what follows are part of the
  text, a directive inside it is removed, and a directive inside the keyword is
  removed so that the keyword is whole. The white space after the colon includes
  the line feeds, so a line with no text takes the next line that has one as its
  text, a keyword on it being text, and at the end of the text it is rejected,
  also after an earlier text. [fixture: quadrant/db-acc-title-semicolon-kept]
  [fixture: quadrant/db-acc-title-semicolon-only] [fixture:
  quadrant/db-acc-title-semicolon-then-statement] [fixture:
  quadrant/db-acc-title-hash-kept] [fixture: quadrant/db-acc-title-comment-kept]
  [fixture: quadrant/db-acc-title-quotes-kept] [fixture:
  quadrant/db-acc-title-colon-kept] [fixture:
  quadrant/db-acc-title-directive-removed] [fixture:
  quadrant/div-acc-title-keyword-inside-directive] [fixture:
  quadrant/db-acc-descr-semicolon-kept] [fixture:
  quadrant/db-acc-descr-semicolon-only] [fixture:
  quadrant/db-acc-descr-comment-kept] [fixture: quadrant/db-acc-descr-hash-kept]
  [fixture: quadrant/db-acc-descr-directive-removed] [fixture:
  quadrant/gram-acc-title-empty] [fixture: quadrant/gram-acc-title-spaces-only]
  [fixture: quadrant/gram-acc-title-twice-empty-last] [fixture:
  quadrant/gram-acc-descr-empty] [fixture: quadrant/db-acc-title-next-line]
  [fixture: quadrant/db-acc-title-next-line-after-blank-lines] [fixture:
  quadrant/db-acc-title-next-line-crlf] [fixture:
  quadrant/db-acc-title-next-line-indented] [fixture:
  quadrant/db-acc-title-next-line-keyword] [fixture:
  quadrant/db-acc-title-next-line-no-line-feed-at-end] [fixture:
  quadrant/db-acc-descr-next-line] [fixture:
  quadrant/db-acc-descr-next-line-tab]
- `accDescr {` starts a block that ends at the first `}`, and the description is
  the text of the block without the spaces at its ends and without the white
  space after a line feed, so that the lines are joined with single line feeds
  and blank lines and indents go. The brace can follow the keyword with no
  space, stand on the next line, or follow a tab, and the block can stand on one
  line or have no line feed; an empty block, a block of spaces, and a block of
  blank lines set the empty text. Inside a block a `;`, a `#`, quotes, a
  keyword, and a `%%` with what follows are text, a directive is removed, and a
  CRLF and a CR alone are line feeds. A later block or `accDescr:` line replaces
  the description. [fixture: quadrant/db-acc-descr-block] [fixture:
  quadrant/db-acc-descr-block-glued-brace] [fixture:
  quadrant/db-acc-descr-block-lines] [fixture:
  quadrant/db-acc-descr-block-indented-lines] [fixture:
  quadrant/db-acc-descr-block-empty] [fixture:
  quadrant/db-acc-descr-block-one-line] [fixture:
  quadrant/db-acc-descr-block-blank-lines] [fixture:
  quadrant/db-acc-descr-block-semicolon-kept] [fixture:
  quadrant/db-acc-descr-block-hash-kept] [fixture:
  quadrant/db-acc-descr-block-comment-kept] [fixture:
  quadrant/db-acc-descr-block-directive-removed] [fixture:
  quadrant/db-acc-descr-block-twice] [fixture:
  quadrant/db-acc-descr-block-then-line] [fixture:
  quadrant/db-acc-descr-line-then-block] [fixture:
  quadrant/db-acc-descr-block-crlf] [fixture: quadrant/db-acc-descr-block-cr]
  [fixture: quadrant/db-acc-descr-block-quotes-kept] [fixture:
  quadrant/db-acc-descr-block-keyword-inside] [fixture:
  quadrant/db-acc-descr-block-after-title] [fixture:
  quadrant/db-acc-descr-block-brace-on-next-line] [fixture:
  quadrant/db-acc-descr-block-tab-before-brace] [fixture:
  quadrant/db-acc-descr-block-no-line-feed-after-brace] [fixture:
  quadrant/db-acc-descr-block-empty-braces] [fixture:
  quadrant/db-acc-descr-block-spaces-only] [fixture:
  quadrant/db-acc-descr-block-only-blank-lines]
- A block is a statement that needs the end of its line or a `;` right after the
  closing brace: `} ;`, a space and anything after the brace but a `;`, a text
  glued to the brace, a second `}`, and a block with no closing brace are
  rejected, as is text after the brace that is read as statements, such as
  `D}E`. A comment glued to the brace, and a `;` with a statement after it, are
  fine. [fixture: quadrant/db-acc-descr-block-closing-brace-same-line] [fixture:
  quadrant/gram-acc-descr-block-braces-inside] [fixture:
  quadrant/gram-acc-descr-block-unclosed] [fixture:
  quadrant/gram-acc-descr-block-unclosed-no-line-feed] [fixture:
  quadrant/gram-acc-descr-block-statement-after-brace] [fixture:
  quadrant/db-acc-descr-block-statement-after-brace-semicolon] [fixture:
  quadrant/gram-acc-descr-block-stray-brace] [fixture:
  quadrant/gram-acc-descr-block-trailing-spaces-before-brace] [fixture:
  quadrant/gram-acc-descr-block-text-after-brace] [fixture:
  quadrant/gram-acc-descr-block-semicolon-spaced-after-brace] [fixture:
  quadrant/db-comment-after-statement-brace]
- `x-axis` and `y-axis` take one text or two. `x-axis L --> R` sets the left and
  the right text of the x axis, and `y-axis B --> T` the bottom and the top text
  of the y axis. A text with no arrow sets the first text only, and a text with
  an arrow and nothing after it sets the first text with ` ⟶` after it (`L ⟶`),
  the second staying as it was. The arrow is two dashes or more and `>`, with or
  without spaces around it; `->`, `-- >`, a second arrow, an arrow with no text
  before it, an arrow alone, and the keyword alone are rejected. A statement for
  an axis sets what it names and keeps the rest: a later `x-axis M` changes the
  left text and keeps the right one, a later `x-axis M -->` sets the left text
  with the arrow and keeps the right one, and a later statement with two texts
  sets both. [fixture: quadrant/db-x-axis-both] [fixture:
  quadrant/db-y-axis-both] [fixture: quadrant/db-x-axis-left-only] [fixture:
  quadrant/db-y-axis-bottom-only] [fixture: quadrant/db-x-axis-left-with-arrow]
  [fixture: quadrant/db-y-axis-bottom-with-arrow] [fixture:
  quadrant/gram-x-axis-right-only] [fixture: quadrant/gram-y-axis-top-only]
  [fixture: quadrant/gram-x-axis-arrow-only] [fixture:
  quadrant/gram-y-axis-arrow-only] [fixture: quadrant/gram-x-axis-no-text]
  [fixture: quadrant/gram-y-axis-no-text] [fixture:
  quadrant/db-x-axis-glued-arrow] [fixture: quadrant/db-y-axis-glued-arrow]
  [fixture: quadrant/db-x-axis-long-arrow] [fixture:
  quadrant/db-y-axis-long-arrow] [fixture: quadrant/gram-x-axis-short-arrow]
  [fixture: quadrant/gram-y-axis-short-arrow] [fixture:
  quadrant/gram-x-axis-broken-arrow] [fixture:
  quadrant/gram-y-axis-broken-arrow] [fixture: quadrant/gram-x-axis-two-arrows]
  [fixture: quadrant/gram-y-axis-two-arrows] [fixture: quadrant/db-x-axis-twice]
  [fixture: quadrant/db-x-axis-twice-arrow-then-both] [fixture:
  quadrant/db-x-axis-twice-arrow-without-right] [fixture:
  quadrant/db-x-axis-twice-both] [fixture: quadrant/db-y-axis-twice] [fixture:
  quadrant/db-y-axis-twice-arrow-then-both] [fixture:
  quadrant/db-y-axis-twice-arrow-without-top] [fixture:
  quadrant/db-y-axis-twice-both] [fixture:
  quadrant/db-x-axis-right-only-after-left] [fixture:
  quadrant/db-y-axis-top-only-after-bottom] [fixture:
  quadrant/db-x-axis-arrow-form-then-both] [fixture:
  quadrant/db-y-axis-arrow-form-then-both] [fixture:
  quadrant/db-x-axis-arrow-alone-with-text-after-no-space] [fixture:
  quadrant/db-y-axis-arrow-alone-with-text-after-no-space] [fixture:
  quadrant/db-x-axis-dash-before-arrow] [fixture:
  quadrant/db-y-axis-dash-before-arrow] [fixture:
  quadrant/db-x-axis-dashes-after-text] [fixture:
  quadrant/db-y-axis-dashes-after-text]
- A text of an axis is bare or in quotes. A bare text is words, the characters
  `!?$&=+*_./\',` with the backtick, `#`, and dashes inside, and characters
  outside ASCII, with spaces between the words, and it may not start with a
  dash; a colon, a `;` (which ends the statement, and what follows is another
  statement), a bracket, and the keywords `x-axis`, `y-axis`, `title` and the
  rest are not part of it, and the line is rejected. A text in quotes holds all
  of these, an arrow, brackets, and a line feed, and is the text without the
  quotes; a bare text after a text in quotes is joined to it with a space, while
  a quoted text after a bare text, two quoted texts in a row, and a quote that
  is not closed are rejected. Backticks inside the quotes make a markdown
  string, the text without them, also with a line feed in it, while backticks
  without quotes are part of the text and an unclosed markdown string is
  rejected. [fixture: quadrant/db-x-axis-quoted-both] [fixture:
  quadrant/db-y-axis-quoted-both] [fixture: quadrant/db-x-axis-quoted-left-only]
  [fixture: quadrant/db-y-axis-quoted-bottom-only] [fixture:
  quadrant/db-x-axis-quoted-arrow] [fixture: quadrant/db-y-axis-quoted-arrow]
  [fixture: quadrant/db-x-axis-quoted-real-arrow] [fixture:
  quadrant/db-y-axis-quoted-real-arrow] [fixture:
  quadrant/db-x-axis-markdown-string] [fixture:
  quadrant/db-y-axis-markdown-string] [fixture:
  quadrant/db-x-axis-backticks-without-quotes] [fixture:
  quadrant/db-y-axis-backticks-without-quotes] [fixture:
  quadrant/db-x-axis-text-with-dash] [fixture:
  quadrant/db-y-axis-text-with-dash] [fixture:
  quadrant/db-x-axis-quoted-brackets] [fixture:
  quadrant/db-y-axis-quoted-brackets] [fixture:
  quadrant/db-x-axis-quoted-newline] [fixture:
  quadrant/db-y-axis-quoted-newline] [fixture:
  quadrant/db-x-axis-quoted-glued-text] [fixture:
  quadrant/db-y-axis-quoted-glued-text] [fixture:
  quadrant/db-x-axis-markdown-multiline] [fixture:
  quadrant/db-y-axis-markdown-multiline] [fixture:
  quadrant/db-x-axis-unicode-text] [fixture: quadrant/db-y-axis-unicode-text]
  [fixture: quadrant/db-x-axis-numeric-text] [fixture:
  quadrant/db-y-axis-numeric-text] [fixture:
  quadrant/db-x-axis-space-text-with-punctuation] [fixture:
  quadrant/db-y-axis-space-text-with-punctuation] [fixture:
  quadrant/db-x-axis-html] [fixture: quadrant/db-y-axis-html] [fixture:
  quadrant/db-x-axis-entity] [fixture: quadrant/db-y-axis-entity] [fixture:
  quadrant/gram-x-axis-text-with-colon] [fixture:
  quadrant/gram-y-axis-text-with-colon] [fixture:
  quadrant/gram-x-axis-text-starting-with-dash] [fixture:
  quadrant/gram-y-axis-text-starting-with-dash] [fixture:
  quadrant/gram-x-axis-text-with-brackets] [fixture:
  quadrant/gram-y-axis-text-with-brackets] [fixture:
  quadrant/gram-x-axis-keyword-in-text] [fixture:
  quadrant/gram-y-axis-keyword-in-text] [fixture:
  quadrant/gram-x-axis-semicolon-in-text] [fixture:
  quadrant/gram-y-axis-semicolon-in-text] [fixture:
  quadrant/gram-x-axis-quoted-unclosed] [fixture:
  quadrant/gram-y-axis-quoted-unclosed] [fixture:
  quadrant/gram-x-axis-text-then-quoted] [fixture:
  quadrant/gram-y-axis-text-then-quoted] [fixture:
  quadrant/gram-x-axis-two-quoted] [fixture: quadrant/gram-y-axis-two-quoted]
  [fixture: quadrant/gram-x-axis-markdown-unclosed] [fixture:
  quadrant/gram-y-axis-markdown-unclosed]
- An empty string in quotes is rejected where the statement starts with it
  (`x-axis ""` and `x-axis "" --> R`), while after the arrow it is dropped and
  the statement is the text and the arrow with nothing after them. A string of
  spaces is a text that the Db trims to nothing: `x-axis "  " --> R` leaves the
  left text empty and sets the right one, and `x-axis "  "` sets the empty left
  text. [fixture: quadrant/gram-x-axis-empty-string] [fixture:
  quadrant/gram-y-axis-empty-string] [fixture:
  quadrant/gram-x-axis-empty-string-with-arrow] [fixture:
  quadrant/gram-y-axis-empty-string-with-arrow] [fixture:
  quadrant/div-x-axis-empty-string-after-arrow] [fixture:
  quadrant/div-y-axis-empty-string-after-arrow] [fixture:
  quadrant/db-x-axis-spaces-only-string] [fixture:
  quadrant/db-y-axis-spaces-only-string] [fixture:
  quadrant/db-x-axis-spaces-only-string-alone] [fixture:
  quadrant/db-y-axis-spaces-only-string-alone]
- The keyword is read in any case, spaces can come before it, and the text can
  be glued to it (`x-axisL`), while a dash after it, a tab between the keyword
  and the text, and a tab around the arrow are rejected. Extra spaces around the
  texts and the arrow are removed; a no-break space around the arrow is part of
  the text and the Db trims it. The x axis and the y axis are separate
  statements, in either order, and a `;` ends a statement so that another can
  follow. [fixture: quadrant/db-x-axis-upper-case] [fixture:
  quadrant/db-y-axis-upper-case] [fixture: quadrant/db-x-axis-extra-spaces]
  [fixture: quadrant/db-y-axis-extra-spaces] [fixture:
  quadrant/db-x-axis-glued-text] [fixture: quadrant/db-y-axis-glued-text]
  [fixture: quadrant/gram-x-axis-glued-dash] [fixture:
  quadrant/gram-y-axis-glued-dash] [fixture: quadrant/db-x-axis-indented]
  [fixture: quadrant/db-y-axis-indented] [fixture:
  quadrant/gram-x-axis-tab-after-keyword] [fixture:
  quadrant/gram-y-axis-tab-after-keyword] [fixture:
  quadrant/gram-x-axis-tab-around-arrow] [fixture:
  quadrant/gram-y-axis-tab-around-arrow] [fixture:
  quadrant/db-x-axis-nbsp-around-arrow] [fixture:
  quadrant/db-y-axis-nbsp-around-arrow] [fixture:
  quadrant/db-x-axis-then-y-axis] [fixture: quadrant/db-axes-y-then-x] [fixture:
  quadrant/db-x-axis-semicolon-then-y] [fixture:
  quadrant/db-axes-semicolon-y-then-x] [fixture:
  quadrant/db-x-axis-trailing-semicolon] [fixture:
  quadrant/db-y-axis-trailing-semicolon]
- A comment after a space is skipped, and so is a directive; a directive inside
  the keyword, the text, or the arrow is removed. A comment glued to the text
  takes the character before it where that character is a unit of one character
  for the lexer (see the comments below): `x-axis L%% c` has no text and is
  rejected, `x-axis L --> R%% c` is the left text with the arrow,
  `x-axis Lm-%% c` loses the dash and `x-axis L --> Rm1%% c` the digit, while a
  comment glued to a word of two characters or more takes nothing of it.
  [fixture: quadrant/db-x-axis-comment-after-text] [fixture:
  quadrant/db-y-axis-comment-after-text] [fixture:
  quadrant/div-x-axis-comment-glued-text] [fixture:
  quadrant/div-y-axis-comment-glued-text] [fixture:
  quadrant/db-x-axis-comment-glued-text-longer] [fixture:
  quadrant/db-y-axis-comment-glued-text-longer] [fixture:
  quadrant/div-x-axis-comment-glued-arrow] [fixture:
  quadrant/div-y-axis-comment-glued-arrow] [fixture:
  quadrant/div-x-axis-comment-unit-dash] [fixture:
  quadrant/div-x-axis-comment-unit-right-digit] [fixture:
  quadrant/div-y-axis-comment-unit-dash] [fixture:
  quadrant/div-y-axis-comment-unit-top-digit] [fixture:
  quadrant/db-x-axis-comment-after-arrow] [fixture:
  quadrant/db-y-axis-comment-after-arrow] [fixture:
  quadrant/db-x-axis-directive-in-text] [fixture:
  quadrant/db-y-axis-directive-in-text] [fixture:
  quadrant/div-x-axis-directive-in-arrow] [fixture:
  quadrant/div-y-axis-directive-in-arrow] [fixture:
  quadrant/div-x-axis-directive-in-keyword] [fixture:
  quadrant/div-y-axis-directive-in-keyword]
- `quadrant-1` to `quadrant-4` set the four texts, and `quadrants` lists them in
  the order of the numbers whatever the order of the statements; a quadrant that
  no statement names has the empty text, and the last statement for a quadrant
  wins, a string of spaces setting the empty text. The keyword is read in any
  case, the text can be glued to it, and `quadrant-10` is `quadrant-1` with the
  text `0 …`. `quadrant-0`, `quadrant-5`, the keyword alone, and an empty string
  are rejected. The spaces around the text are removed, and those inside it are
  kept. [fixture: quadrant/db-quadrant-all-four] [fixture:
  quadrant/db-quadrant-reverse-order] [fixture: quadrant/db-quadrant-1-alone]
  [fixture: quadrant/db-quadrant-2-alone] [fixture:
  quadrant/db-quadrant-3-alone] [fixture: quadrant/db-quadrant-4-alone]
  [fixture: quadrant/gram-quadrant-no-text] [fixture:
  quadrant/gram-quadrant-empty-string] [fixture: quadrant/gram-quadrant-five]
  [fixture: quadrant/gram-quadrant-zero] [fixture: quadrant/db-quadrant-ten]
  [fixture: quadrant/db-quadrant-upper-case] [fixture:
  quadrant/db-quadrant-glued-text] [fixture: quadrant/db-quadrant-twice]
  [fixture: quadrant/db-quadrant-twice-empty-spaces] [fixture:
  quadrant/db-quadrant-spaces-trimmed]
- A text of a quadrant is bare or in quotes, as a text of an axis is, with the
  same characters: words, `-` inside, `#`, the punctuation `!?$&=+*_./\',` and
  the backtick, characters outside ASCII, a tab, a no-break space, an
  ideographic space; no leading dash, no colon, no `;` (it ends the statement),
  and none of the brackets, parentheses, angle brackets, braces, `|`, `@`, `^`,
  `~`; an arrow `-->` is the arrow, which the statement does not have, so the
  line is rejected. Inside quotes all of these are text, with a line feed. A
  bare text after a string is joined to it, a string after a bare text is not
  allowed, and markdown strings are the text without the backticks. A keyword
  inside a text, `quadrant-2`, `title`, is the keyword, and a point-like
  `A: [0.3, 0.6]` after the keyword is rejected. [fixture:
  quadrant/gram-quadrant-tab-after-keyword] [fixture:
  quadrant/db-quadrant-tab-inside] [fixture: quadrant/db-quadrant-dash-inside]
  [fixture: quadrant/gram-quadrant-leading-dash] [fixture:
  quadrant/gram-quadrant-colon] [fixture: quadrant/db-quadrant-colon-in-quotes]
  [fixture: quadrant/db-quadrant-quoted] [fixture:
  quadrant/db-quadrant-quoted-then-bare] [fixture:
  quadrant/gram-quadrant-bare-then-quoted] [fixture:
  quadrant/gram-quadrant-two-strings] [fixture:
  quadrant/gram-quadrant-quoted-unclosed] [fixture:
  quadrant/db-quadrant-quoted-newline] [fixture: quadrant/db-quadrant-markdown]
  [fixture: quadrant/db-quadrant-markdown-newline] [fixture:
  quadrant/gram-quadrant-markdown-unclosed] [fixture:
  quadrant/db-quadrant-markdown-then-bare] [fixture:
  quadrant/gram-quadrant-semicolon] [fixture:
  quadrant/db-quadrant-semicolon-in-quotes] [fixture: quadrant/db-quadrant-hash]
  [fixture: quadrant/gram-quadrant-brackets] [fixture:
  quadrant/gram-quadrant-parens] [fixture: quadrant/gram-quadrant-angle]
  [fixture: quadrant/gram-quadrant-braces] [fixture:
  quadrant/gram-quadrant-pipe] [fixture: quadrant/gram-quadrant-at] [fixture:
  quadrant/gram-quadrant-caret] [fixture: quadrant/gram-quadrant-tilde]
  [fixture: quadrant/db-quadrant-punctuation] [fixture:
  quadrant/db-quadrant-brackets-in-quotes] [fixture:
  quadrant/gram-quadrant-arrow-in-text] [fixture:
  quadrant/db-quadrant-double-dash] [fixture: quadrant/db-quadrant-non-ascii]
  [fixture: quadrant/db-quadrant-nbsp-inside] [fixture:
  quadrant/db-quadrant-ideographic-inside] [fixture:
  quadrant/db-quadrant-ideographic-after-keyword] [fixture:
  quadrant/db-quadrant-nbsp-after-keyword] [fixture:
  quadrant/db-quadrant-nbsp-trailing] [fixture: quadrant/db-quadrant-entity]
  [fixture: quadrant/db-quadrant-html] [fixture:
  quadrant/gram-quadrant-keyword-in-text] [fixture:
  quadrant/gram-quadrant-title-in-text] [fixture:
  quadrant/gram-quadrant-point-like-text] [fixture:
  quadrant/db-quadrant-proto-text] [fixture:
  quadrant/db-quadrant-constructor-text] [fixture:
  quadrant/db-quadrant-trailing-tab] [fixture:
  quadrant/db-quadrant-markdown-then-title]
- A comment after a space is skipped, a directive is removed, also inside the
  keyword or the text, and a comment glued to a unit of one character takes that
  character (see the comments below) and leaves the statement with no text where
  it was the whole text, while one glued to a longer unit takes nothing. A `;`
  ends the statement, with or without spaces around it, and another statement
  can follow it. Blank lines, lines of spaces, and trailing spaces change
  nothing, a CRLF and a CR alone end a statement, and a U+2028 and a vertical
  tab do not; two statements on a line with no `;` are rejected. [fixture:
  quadrant/db-quadrant-comment-after-space] [fixture:
  quadrant/div-quadrant-comment-glued] [fixture:
  quadrant/db-quadrant-comment-glued-longer] [fixture:
  quadrant/db-quadrant-directive-inside] [fixture:
  quadrant/div-quadrant-directive-in-keyword] [fixture:
  quadrant/db-quadrant-semicolon-then-next] [fixture:
  quadrant/db-quadrant-semicolon-spaced-then-next] [fixture:
  quadrant/db-quadrant-trailing-semicolon] [fixture:
  quadrant/db-quadrant-blank-lines-between] [fixture:
  quadrant/db-quadrant-whitespace-lines-between] [fixture:
  quadrant/db-quadrant-crlf-between] [fixture: quadrant/db-quadrant-cr-between]
  [fixture: quadrant/db-quadrant-cr-cr-lf] [fixture:
  quadrant/gram-quadrant-ls-between] [fixture:
  quadrant/gram-quadrant-vt-between] [fixture:
  quadrant/gram-quadrant-keyword-in-text]
- A point is a name, a colon, and two coordinates in brackets, `A: [0.3, 0.6]`.
  The spaces, tabs, and line feeds (a CRLF too) around the colon, inside the
  brackets, and around the comma are white space, and none of them is needed. A
  coordinate is `1`, or `0` with a fraction `.` and digits, and the summary
  holds `x` and `y` as the texts the lexer read, so `0.30` stays `0.30`. The `.`
  of the fraction is any character in the lexer: `0x5`, `0a5`, `0 3`, `0,3`,
  `0;3`, `0#3`, a quote, and a character outside ASCII in its place are
  coordinates, held as written, while a line feed in its place is not. A
  coordinate over 1, one with no leading zero or with a leading zero, a negative
  one, a sign, a point with no digit after it, an exponent, one or three
  coordinates, a missing comma or brackets or colon, a `;` for the comma, a
  word, and an empty or unclosed pair of brackets are rejected. [fixture:
  quadrant/db-point-plain] [fixture: quadrant/db-point-glued] [fixture:
  quadrant/db-point-spaces-everywhere] [fixture:
  quadrant/db-point-tab-around-colon] [fixture:
  quadrant/db-point-tab-inside-brackets] [fixture:
  quadrant/db-point-nbsp-inside-brackets] [fixture:
  quadrant/db-point-newline-after-bracket] [fixture:
  quadrant/db-point-newline-after-comma] [fixture:
  quadrant/db-point-newline-before-bracket] [fixture:
  quadrant/db-point-newline-before-comma] [fixture:
  quadrant/gram-point-newline-before-bracket-open] [fixture:
  quadrant/db-point-crlf-inside] [fixture: quadrant/db-point-both-one] [fixture:
  quadrant/db-point-both-zero] [fixture: quadrant/db-point-zero-decimals]
  [fixture: quadrant/db-point-trailing-zero] [fixture:
  quadrant/db-point-long-fraction] [fixture: quadrant/db-point-one-zero]
  [fixture: quadrant/gram-point-x-over-one] [fixture: quadrant/gram-point-x-ten]
  [fixture: quadrant/gram-point-x-two] [fixture: quadrant/gram-point-y-over-one]
  [fixture: quadrant/gram-point-no-leading-zero] [fixture:
  quadrant/gram-point-double-zero] [fixture: quadrant/gram-point-leading-zero]
  [fixture: quadrant/gram-point-negative] [fixture: quadrant/gram-point-plus]
  [fixture: quadrant/gram-point-trailing-dot] [fixture:
  quadrant/gram-point-exponent] [fixture: quadrant/gram-point-one-coordinate]
  [fixture: quadrant/gram-point-three-coordinates] [fixture:
  quadrant/gram-point-no-comma] [fixture: quadrant/gram-point-semicolon-comma]
  [fixture: quadrant/gram-point-word-coordinate] [fixture:
  quadrant/gram-point-word-second] [fixture: quadrant/gram-point-empty-brackets]
  [fixture: quadrant/gram-point-open-bracket-only] [fixture:
  quadrant/gram-point-unclosed] [fixture: quadrant/gram-point-double-close]
  [fixture: quadrant/gram-point-no-brackets] [fixture:
  quadrant/gram-point-no-colon] [fixture: quadrant/gram-point-parens] [fixture:
  quadrant/db-point-coordinate-any-char-x] [fixture:
  quadrant/db-point-coordinate-any-char-x2] [fixture:
  quadrant/db-point-coordinate-any-char-y] [fixture:
  quadrant/db-point-coordinate-comma] [fixture:
  quadrant/db-point-coordinate-hash] [fixture:
  quadrant/db-point-coordinate-nonascii] [fixture:
  quadrant/db-point-coordinate-quote] [fixture:
  quadrant/db-point-coordinate-semicolon] [fixture:
  quadrant/db-point-coordinate-space-in-x] [fixture:
  quadrant/db-point-coordinate-tab-in-x] [fixture:
  quadrant/gram-point-coordinate-line-feed]
- A point ends at its closing bracket; spaces after it are skipped, and a tab
  after it is read as a style with no name and rejected. A `;` ends the point,
  with a statement after it, and `;;` or `; ;` between statements are empty
  statements. Another point or a word on the same line with no `;` is rejected:
  a word is read as a style, and `x` is no style. A comment after a space or
  glued to the closing bracket is skipped, while a comment inside the brackets
  is not, since `%` is no character of a coordinate; a directive inside the
  brackets, between the colon and the bracket, or in the name is removed. A CRLF
  and a CR alone end a point. [fixture: quadrant/db-point-trailing-space]
  [fixture: quadrant/gram-point-trailing-tab] [fixture:
  quadrant/db-point-semicolon] [fixture:
  quadrant/db-point-semicolon-spaced-next] [fixture:
  quadrant/db-point-semicolon-twice] [fixture: quadrant/db-point-semicolon-gap]
  [fixture: quadrant/gram-point-two-on-line] [fixture:
  quadrant/gram-point-text-after] [fixture:
  quadrant/gram-point-text-after-spaced] [fixture:
  quadrant/db-point-comment-after-space] [fixture:
  quadrant/db-point-comment-glued] [fixture: quadrant/gram-point-comment-inside]
  [fixture: quadrant/db-point-directive-inside] [fixture:
  quadrant/db-point-directive-after-colon] [fixture:
  quadrant/db-point-directive-in-name] [fixture: quadrant/db-point-crlf-between]
  [fixture: quadrant/db-point-cr-between]
- `points` lists the points in the order the Db holds them, which is the reverse
  of the order of the text, since each new point is put first. Two points with
  the same name, the same position, or both are two points, and the other
  statements between the points change nothing in their order. [fixture:
  quadrant/db-points-three] [fixture: quadrant/db-points-same-name] [fixture:
  quadrant/db-points-same-position] [fixture: quadrant/db-points-identical]
  [fixture: quadrant/db-points-between-statements]
- The name of a point is a text like those of a quadrant: bare or in quotes,
  spaces inside it kept and around it removed, a comma, a `#`, a dash inside,
  digits, and characters outside ASCII are part of it; a leading dash, a colon,
  a `;`, and a bracket are not, and an arrow `-->` is rejected, while quotes
  allow a colon, and markdown strings, line feeds, and tags. A string of spaces
  is a name that the Db trims to the empty text, and an empty string is
  rejected. The names of `Object.prototype` are plain names. A keyword is not a
  name, `x-axis: [0.3, 0.6]`, `quadrant-1: [0.3, 0.6]`, `classDef: [0.3, 0.6]`,
  and `quadrantChart: [0.3, 0.6]` are rejected, while `title: [0.3, 0.6]` is a
  title and `accTitle: [0.3, 0.6]` an accessibility title, the keyword in quotes
  is a name, and a word that starts with a keyword and goes on as a word
  (`classDefs`) is a name. A name with no point is rejected. A comment after a
  space ends the name's line and the point on the next line is rejected; a
  comment glued to a name takes its last character when that is a unit of one
  character, and the rest of the line, so that `A1%% c: [0.3, 0.6]` has no point
  and is rejected, while a one-character name leaves a line that is all comment
  and is accepted. [fixture: quadrant/db-name-acc-descr-word] [fixture:
  quadrant/db-name-acc-title-word] [fixture: quadrant/db-name-backticks]
  [fixture: quadrant/db-name-comma] [fixture: quadrant/div-name-comment-glued]
  [fixture: quadrant/db-name-constructor] [fixture: quadrant/db-name-dash]
  [fixture: quadrant/db-name-digits] [fixture: quadrant/db-name-entity]
  [fixture: quadrant/db-name-has-own-property] [fixture: quadrant/db-name-hash]
  [fixture: quadrant/db-name-html] [fixture: quadrant/db-name-ideographic]
  [fixture: quadrant/db-name-indented] [fixture:
  quadrant/db-name-keyword-in-quotes] [fixture: quadrant/db-name-keyword-prefix]
  [fixture: quadrant/db-name-long-spaces] [fixture: quadrant/db-name-markdown]
  [fixture: quadrant/db-name-nbsp] [fixture: quadrant/db-name-non-ascii]
  [fixture: quadrant/db-name-proto] [fixture: quadrant/db-name-quoted] [fixture:
  quadrant/db-name-quoted-colon] [fixture: quadrant/db-name-quoted-newline]
  [fixture: quadrant/db-name-quoted-spaces] [fixture:
  quadrant/db-name-single-dash] [fixture: quadrant/db-name-spaces] [fixture:
  quadrant/db-name-spaces-trimmed] [fixture: quadrant/db-name-tab-inside]
  [fixture: quadrant/db-name-to-string] [fixture: quadrant/gram-name-arrow]
  [fixture: quadrant/gram-name-bracket] [fixture:
  quadrant/gram-name-class-def-keyword] [fixture: quadrant/gram-name-colon]
  [fixture: quadrant/gram-name-comment-after-space] [fixture:
  quadrant/gram-name-comment-unit-digit] [fixture:
  quadrant/gram-name-header-word] [fixture:
  quadrant/gram-name-keyword-word-inside] [fixture:
  quadrant/gram-name-leading-dash] [fixture: quadrant/gram-name-only] [fixture:
  quadrant/gram-name-quadrant-keyword] [fixture:
  quadrant/gram-name-quoted-empty] [fixture: quadrant/gram-name-semicolon]
  [fixture: quadrant/gram-name-x-axis]
- The styles of a point follow its closing bracket, separated by commas:
  `radius` (digits only, held as a number, so that `007` is 7), `color` and
  `stroke-color` (a hex code of three or six digits, with or without `#`, held
  as written), and `stroke-width` (digits and `px`, held as written). A radius
  with so many digits that the number is infinite, also in a class, is the text
  `Infinity`, since JSON has no such number. A style given twice has the last
  value; the names are read in lower case only; spaces around names, values, and
  commas are removed, and a space may stand before the colon. A colon after the
  value ends it, and what follows is dropped. Rejected are an unknown name, a
  unit or a sign or a fraction in a radius, a value that is not a hex code, a
  stroke width with no `px`, in upper case `PX`, or with a space before it, a
  missing value or colon, an empty style, two values with a space and no comma,
  a trailing, leading, or double comma, a style that goes on the next line, a
  keyword in a value, and a no-break space in a value. [fixture:
  quadrant/db-style-radius] [fixture: quadrant/db-style-radius-glued] [fixture:
  quadrant/db-style-radius-spaced-colon] [fixture:
  quadrant/db-style-radius-zero] [fixture:
  quadrant/db-style-radius-leading-zeros] [fixture:
  quadrant/db-style-radius-big] [fixture: quadrant/db-style-radius-overflow]
  [fixture: quadrant/gram-style-radius-unit] [fixture:
  quadrant/gram-style-radius-negative] [fixture:
  quadrant/gram-style-radius-fraction] [fixture:
  quadrant/gram-style-radius-word] [fixture: quadrant/gram-style-radius-empty]
  [fixture: quadrant/gram-style-radius-no-colon] [fixture:
  quadrant/gram-style-radius-two-values] [fixture:
  quadrant/db-style-radius-trailing-space] [fixture:
  quadrant/db-style-radius-colon-after] [fixture:
  quadrant/gram-style-radius-double-colon] [fixture:
  quadrant/gram-style-radius-leading-colon] [fixture: quadrant/db-style-color]
  [fixture: quadrant/db-style-color-colon-after] [fixture:
  quadrant/db-style-color-colon-space-after] [fixture:
  quadrant/db-style-color-no-hash] [fixture: quadrant/db-style-color-short]
  [fixture: quadrant/db-style-color-upper] [fixture:
  quadrant/gram-style-color-four-digits] [fixture:
  quadrant/gram-style-color-function] [fixture:
  quadrant/gram-style-color-hash-only] [fixture: quadrant/gram-style-color-name]
  [fixture: quadrant/gram-style-color-not-hex] [fixture:
  quadrant/db-style-stroke-color] [fixture: quadrant/db-style-stroke-width]
  [fixture: quadrant/db-style-stroke-width-big] [fixture:
  quadrant/db-style-stroke-width-leading-zero] [fixture:
  quadrant/gram-style-stroke-width-fraction] [fixture:
  quadrant/gram-style-stroke-width-no-unit] [fixture:
  quadrant/gram-style-stroke-width-spaced-unit] [fixture:
  quadrant/gram-style-stroke-width-upper-unit] [fixture: quadrant/db-style-two]
  [fixture: quadrant/db-style-two-reversed] [fixture: quadrant/db-style-four]
  [fixture: quadrant/db-style-same-twice] [fixture:
  quadrant/gram-style-trailing-comma] [fixture:
  quadrant/gram-style-leading-comma] [fixture: quadrant/gram-style-double-comma]
  [fixture: quadrant/gram-style-no-comma] [fixture:
  quadrant/gram-style-upper-case-key] [fixture: quadrant/gram-style-capital-key]
  [fixture: quadrant/gram-style-unknown-key] [fixture:
  quadrant/db-style-space-around] [fixture: quadrant/db-style-tab-around]
  [fixture: quadrant/gram-style-nbsp-in-value] [fixture:
  quadrant/gram-style-newline-after-comma] [fixture:
  quadrant/gram-style-newline-in-style] [fixture:
  quadrant/db-style-semicolon-then-point] [fixture:
  quadrant/db-style-with-class] [fixture: quadrant/gram-style-keyword-in-value]
  [fixture: quadrant/gram-style-value-hash] [fixture:
  quadrant/gram-style-non-ascii-key] [fixture:
  quadrant/db-style-colon-in-point-name] [fixture:
  quadrant/db-classdef-with-point-radius-overflow]
- A comment, a directive, and a `;` after the styles end the point as they end a
  point with no style, and a directive inside a value is removed; a comment
  glued to a number of two digits takes nothing of it, while one glued to a
  number of one digit takes that digit and leaves the style with no value, which
  is rejected. [fixture: quadrant/db-style-radius-semicolon] [fixture:
  quadrant/db-style-radius-comment] [fixture:
  quadrant/db-style-radius-comment-glued] [fixture:
  quadrant/div-style-radius-comment-glued-one-digit] [fixture:
  quadrant/db-style-radius-directive-inside]
- `:::` after the name gives a point a class name, `A:::c1: [0.3, 0.6]`, with
  spaces allowed before the `:::` and the colon, and styles after the point
  still allowed. A class name is ASCII word characters (letters, digits, `_`),
  keeps its case, and is not checked: a class that no `classDef` gives stays on
  the point. A space after `:::`, an empty name, a dash, a character outside
  ASCII, a second `:::`, a name with no colon after it, and a class with no name
  before it are rejected. The names of `Object.prototype` are plain class names,
  and a directive inside the name is removed. [fixture:
  quadrant/db-class-constructor] [fixture: quadrant/db-class-digits] [fixture:
  quadrant/div-class-directive-inside] [fixture:
  quadrant/db-class-has-own-property] [fixture:
  quadrant/db-class-marker-in-bare-name] [fixture:
  quadrant/db-class-marker-with-comment] [fixture:
  quadrant/db-class-name-with-trailing-text] [fixture:
  quadrant/db-class-on-quoted-name] [fixture: quadrant/db-class-plain] [fixture:
  quadrant/db-class-proto] [fixture: quadrant/db-class-spaces-around] [fixture:
  quadrant/db-class-undefined] [fixture: quadrant/db-class-underscore] [fixture:
  quadrant/db-class-upper-case] [fixture: quadrant/gram-class-after-colon-name]
  [fixture: quadrant/gram-class-dash] [fixture: quadrant/gram-class-empty-name]
  [fixture: quadrant/gram-class-in-name-position] [fixture:
  quadrant/gram-class-non-ascii] [fixture:
  quadrant/gram-class-space-after-marker] [fixture:
  quadrant/gram-class-two-markers]
- `classDef name styles` defines a class: a name, a space, and the styles of a
  point. A class has the styles of its last definition only, and a second
  definition replaces the first with no merge; `classes` lists the classes in
  the order of their first definition. A class that no point uses is listed, a
  class may be defined before or after the point that uses it, and the Db does
  not merge the styles of a point with those of its class. The keyword is read
  in any case, and a word glued to it, two spaces before the name, a name in
  quotes, and the keyword as the name are rejected; two spaces after the name
  are fine. A directive inside the keyword, the name, or a value is removed.
  [fixture: quadrant/db-classdef-color] [fixture:
  quadrant/db-classdef-two-styles] [fixture: quadrant/db-classdef-all-four]
  [fixture: quadrant/db-classdef-twice-replaces] [fixture:
  quadrant/db-classdef-twice-same-style] [fixture:
  quadrant/db-classdef-two-classes] [fixture:
  quadrant/db-classdef-redefine-order] [fixture:
  quadrant/gram-classdef-no-style] [fixture:
  quadrant/gram-classdef-name-only-space] [fixture:
  quadrant/gram-classdef-no-name] [fixture: quadrant/gram-classdef-bad-style]
  [fixture: quadrant/gram-classdef-empty-value] [fixture:
  quadrant/db-classdef-two-spaces-after-name] [fixture:
  quadrant/gram-classdef-two-spaces-before-name] [fixture:
  quadrant/db-classdef-upper-case] [fixture: quadrant/db-classdef-lower-case]
  [fixture: quadrant/gram-classdef-glued-name] [fixture:
  quadrant/gram-classdef-quoted-name] [fixture:
  quadrant/db-classdef-class-used-after] [fixture:
  quadrant/db-classdef-class-used-before] [fixture:
  quadrant/db-classdef-point-style-and-class] [fixture:
  quadrant/db-classdef-unused] [fixture: quadrant/db-classdef-indented]
  [fixture: quadrant/gram-classdef-keyword-as-class] [fixture:
  quadrant/gram-classdef-name-keyword-title] [fixture:
  quadrant/db-classdef-blank-line-between]
- The name of a class is digits and letters, a dash, a colon, a comma, an `&`, a
  `#`, a `*`, and characters outside ASCII; an underscore, a dot, and a space
  are not allowed (a space ends the name, and the next word is read as a style),
  and neither is `__proto__`, while `constructor`, `hasOwnProperty`, and
  `toString` are plain names. The line of a class ends at a line end, with no
  `;`: `classDef c1 color: #f00;` is rejected, while a `;` at the start of the
  next line is an empty statement. A comment after the styles is skipped; one
  glued to a colour that ends in a single digit (`#ff0`) takes the digit, and
  the colour is rejected, while one glued to `#f00` takes nothing, and a tab
  between styles belongs to the value, which is rejected. [fixture:
  quadrant/db-classdef-comment-after] [fixture:
  quadrant/db-classdef-comment-glued] [fixture:
  quadrant/db-classdef-constructor-name] [fixture:
  quadrant/db-classdef-dash-name] [fixture: quadrant/db-classdef-digit-name]
  [fixture: quadrant/db-classdef-has-own-property-name] [fixture:
  quadrant/db-classdef-name-amp] [fixture: quadrant/db-classdef-name-colon]
  [fixture: quadrant/db-classdef-name-comma] [fixture:
  quadrant/db-classdef-name-hash] [fixture: quadrant/db-classdef-name-star]
  [fixture: quadrant/db-classdef-non-ascii-name] [fixture:
  quadrant/db-classdef-proto-via-dash] [fixture:
  quadrant/db-classdef-semicolon-line-start] [fixture:
  quadrant/db-classdef-to-string-name] [fixture:
  quadrant/div-classdef-comment-unit-single-digit] [fixture:
  quadrant/gram-classdef-name-dot] [fixture: quadrant/gram-classdef-proto-name]
  [fixture: quadrant/gram-classdef-semicolon-end] [fixture:
  quadrant/gram-classdef-semicolon-separated] [fixture:
  quadrant/gram-classdef-space-in-name] [fixture:
  quadrant/gram-classdef-tab-between-styles] [fixture:
  quadrant/gram-classdef-underscore-name]
- A comment line is a line that starts, after spaces or a tab, with `%%`, and it
  runs to the end of the line: a `;`, a keyword, or a `#` in it is part of it,
  and a line of `%%` alone and `%%%` are comments too. A comment line before the
  first statement, between statements, between the points, and at the end of the
  text, with or without a line feed, changes nothing, and a CRLF or a CR alone
  ends it, while a U+2028 is part of it. A single `%` starts no comment, and
  `%%{` with no closing `}%%` is no comment: both lines are rejected; `}%% c` is
  rejected because the comment would take the brace. [fixture:
  quadrant/db-comment-line] [fixture:
  quadrant/header-bare-percent-line-after-header] [fixture:
  quadrant/db-comment-line-last] [fixture:
  quadrant/db-comment-line-no-line-feed] [fixture:
  quadrant/db-comment-line-indented] [fixture:
  quadrant/db-comment-line-tab-indented] [fixture:
  quadrant/db-comment-line-semicolon] [fixture:
  quadrant/db-comment-line-keyword] [fixture: quadrant/db-comment-line-hash]
  [fixture: quadrant/db-comment-line-triple] [fixture:
  quadrant/gram-comment-line-single-percent] [fixture:
  quadrant/gram-comment-line-brace] [fixture:
  quadrant/gram-comment-line-after-brace] [fixture: quadrant/db-comment-crlf]
  [fixture: quadrant/db-comment-cr] [fixture: quadrant/db-comment-ls] [fixture:
  quadrant/db-comment-two-lines] [fixture:
  quadrant/db-comment-between-point-lines]
- A `%%` glued to what comes before it takes the character before it where the
  lexer reads that character as a unit of one character. The lexer reads a run
  of letters, a run of digits, a run of characters outside ASCII, or any other
  character alone: the comment takes the `1` of `ab1`, the `é` of `aé`, the `,`
  of `ab,`, and the `-` of `Lm-`, and the `b` of `a b`, while it takes nothing
  of `ab12` or `a日本`. What it takes goes with the rest of the line. [fixture:
  quadrant/div-comment-unit-letter-then-non-ascii] [fixture:
  quadrant/div-comment-unit-letters-then-digit] [fixture:
  quadrant/db-comment-unit-non-ascii-run] [fixture:
  quadrant/div-comment-unit-non-ascii-single] [fixture:
  quadrant/div-comment-unit-punctuation] [fixture:
  quadrant/db-comment-unit-two-digits] [fixture:
  quadrant/div-comment-unit-word-after-space]
- A directive is removed before the text is read, wherever it stands: on a line
  of its own, before a statement on its line, after a statement, glued to a
  word, inside a keyword, a name, a number, or a text in quotes, between the
  statements of a `;`, and across lines
  ([Directives](../../spec/docs/common.md#directives)). A directive with
  settings of the chart changes nothing in the Db. A directive with no closing
  `}%%` takes the rest of the text, so the statements after it are not read, and
  at the end of the text it takes nothing; so does `%%{ c }`. [fixture:
  quadrant/db-directive-after-statement] [fixture:
  quadrant/db-directive-before-statement-same-line] [fixture:
  quadrant/db-directive-between-statements] [fixture:
  quadrant/db-directive-config-width] [fixture:
  quadrant/db-directive-glued-to-statement] [fixture:
  quadrant/db-directive-in-acc-block] [fixture:
  quadrant/div-directive-in-class-name] [fixture:
  quadrant/db-directive-in-header-line] [fixture:
  quadrant/div-directive-in-keyword-classdef] [fixture:
  quadrant/div-directive-in-keyword-title] [fixture:
  quadrant/db-directive-in-point-brackets] [fixture:
  quadrant/db-directive-in-quotes] [fixture:
  quadrant/db-directive-in-style-value] [fixture: quadrant/db-directive-line]
  [fixture: quadrant/db-directive-line-empty] [fixture:
  quadrant/db-directive-line-spaces] [fixture: quadrant/db-directive-multiline]
  [fixture: quadrant/db-directive-two-in-text] [fixture:
  quadrant/db-directive-unclosed] [fixture:
  quadrant/db-directive-unclosed-last-line] [fixture:
  quadrant/db-directive-wrap-statement] [fixture:
  quadrant/db-comment-line-brace-closed-wrong]
- A `%%` inside quotes, in a markdown string too, is part of the text, also
  glued to a word; a `%%` after a space outside quotes is a comment. [fixture:
  quadrant/db-quoted-comment-glued-kept] [fixture:
  quadrant/db-quoted-comment-mark-kept-axis] [fixture:
  quadrant/db-quoted-comment-mark-kept-point] [fixture:
  quadrant/db-quoted-comment-mark-kept-quadrant] [fixture:
  quadrant/db-quoted-comment-mark-markdown]
- What follows a statement on its line decides how it ends. Spaces, a comment
  after a space, a `;`, a `;` with a comment, a directive, a CRLF, and a CR
  alone end a title, an accessibility line, an axis, a quadrant, a point, and a
  point with a class or styles, the title and the accessibility lines taking the
  comment, the `;`, and the directive as text (a directive is removed), while a
  `;` after a `classDef` line is rejected, and a tab after a point or a point
  with a class is read as a style with no name and rejected, while after styles
  or a `classDef` line it is skipped. A comment glued to the statement takes the
  last character when that character is a unit of one character: it empties a
  text of a quadrant that is that one character, and the value of a style of one
  digit, and rejects the statement, and it takes the right text of an axis when
  that is one character, which leaves the left text with the arrow; after the
  closing bracket of a point, or after a unit of two characters or more, it
  takes nothing. [fixture: quadrant/db-after-acc-descr-cr] [fixture:
  quadrant/db-after-acc-descr-crlf] [fixture:
  quadrant/db-after-acc-descr-directive] [fixture:
  quadrant/db-after-acc-descr-directive-glued] [fixture:
  quadrant/db-after-acc-descr-glued-comment] [fixture:
  quadrant/db-after-acc-descr-semicolon] [fixture:
  quadrant/db-after-acc-descr-semicolon-comment] [fixture:
  quadrant/db-after-acc-descr-space-comment] [fixture:
  quadrant/db-after-acc-descr-trailing-spaces] [fixture:
  quadrant/db-after-acc-descr-trailing-tab] [fixture:
  quadrant/db-after-acc-title-cr] [fixture: quadrant/db-after-acc-title-crlf]
  [fixture: quadrant/db-after-acc-title-directive] [fixture:
  quadrant/db-after-acc-title-directive-glued] [fixture:
  quadrant/db-after-acc-title-glued-comment] [fixture:
  quadrant/db-after-acc-title-semicolon] [fixture:
  quadrant/db-after-acc-title-semicolon-comment] [fixture:
  quadrant/db-after-acc-title-space-comment] [fixture:
  quadrant/db-after-acc-title-trailing-spaces] [fixture:
  quadrant/db-after-acc-title-trailing-tab] [fixture:
  quadrant/db-after-classdef-cr] [fixture: quadrant/db-after-classdef-crlf]
  [fixture: quadrant/db-after-classdef-directive] [fixture:
  quadrant/db-after-classdef-directive-glued] [fixture:
  quadrant/db-after-classdef-glued-comment] [fixture:
  quadrant/db-after-classdef-space-comment] [fixture:
  quadrant/db-after-classdef-trailing-spaces] [fixture:
  quadrant/db-after-classdef-trailing-tab] [fixture:
  quadrant/db-after-point-class-cr] [fixture:
  quadrant/db-after-point-class-crlf] [fixture:
  quadrant/db-after-point-class-directive] [fixture:
  quadrant/db-after-point-class-directive-glued] [fixture:
  quadrant/db-after-point-class-glued-comment] [fixture:
  quadrant/db-after-point-class-semicolon] [fixture:
  quadrant/db-after-point-class-semicolon-comment] [fixture:
  quadrant/db-after-point-class-space-comment] [fixture:
  quadrant/db-after-point-class-trailing-spaces] [fixture:
  quadrant/db-after-point-cr] [fixture: quadrant/db-after-point-crlf] [fixture:
  quadrant/db-after-point-directive] [fixture:
  quadrant/db-after-point-directive-glued] [fixture:
  quadrant/db-after-point-glued-comment] [fixture:
  quadrant/db-after-point-semicolon] [fixture:
  quadrant/db-after-point-semicolon-comment] [fixture:
  quadrant/db-after-point-space-comment] [fixture:
  quadrant/db-after-point-style-cr] [fixture:
  quadrant/db-after-point-style-crlf] [fixture:
  quadrant/db-after-point-style-directive] [fixture:
  quadrant/db-after-point-style-directive-glued] [fixture:
  quadrant/db-after-point-style-semicolon] [fixture:
  quadrant/db-after-point-style-semicolon-comment] [fixture:
  quadrant/db-after-point-style-space-comment] [fixture:
  quadrant/db-after-point-style-trailing-spaces] [fixture:
  quadrant/db-after-point-style-trailing-tab] [fixture:
  quadrant/db-after-point-trailing-spaces] [fixture:
  quadrant/db-after-quadrant-cr] [fixture: quadrant/db-after-quadrant-crlf]
  [fixture: quadrant/db-after-quadrant-directive] [fixture:
  quadrant/db-after-quadrant-directive-glued] [fixture:
  quadrant/db-after-quadrant-semicolon] [fixture:
  quadrant/db-after-quadrant-semicolon-comment] [fixture:
  quadrant/db-after-quadrant-space-comment] [fixture:
  quadrant/db-after-quadrant-trailing-spaces] [fixture:
  quadrant/db-after-quadrant-trailing-tab] [fixture: quadrant/db-after-title-cr]
  [fixture: quadrant/db-after-title-crlf] [fixture:
  quadrant/db-after-title-directive] [fixture:
  quadrant/db-after-title-directive-glued] [fixture:
  quadrant/db-after-title-glued-comment] [fixture:
  quadrant/db-after-title-semicolon] [fixture:
  quadrant/db-after-title-semicolon-comment] [fixture:
  quadrant/db-after-title-space-comment] [fixture:
  quadrant/db-after-title-trailing-spaces] [fixture:
  quadrant/db-after-title-trailing-tab] [fixture: quadrant/db-after-x-axis-cr]
  [fixture: quadrant/db-after-x-axis-crlf] [fixture:
  quadrant/db-after-x-axis-directive] [fixture:
  quadrant/db-after-x-axis-directive-glued] [fixture:
  quadrant/div-after-x-axis-glued-comment] [fixture:
  quadrant/db-after-x-axis-semicolon] [fixture:
  quadrant/db-after-x-axis-semicolon-comment] [fixture:
  quadrant/db-after-x-axis-space-comment] [fixture:
  quadrant/db-after-x-axis-trailing-spaces] [fixture:
  quadrant/db-after-x-axis-trailing-tab] [fixture: quadrant/db-after-y-axis-cr]
  [fixture: quadrant/db-after-y-axis-crlf] [fixture:
  quadrant/db-after-y-axis-directive] [fixture:
  quadrant/db-after-y-axis-directive-glued] [fixture:
  quadrant/div-after-y-axis-glued-comment] [fixture:
  quadrant/db-after-y-axis-semicolon] [fixture:
  quadrant/db-after-y-axis-semicolon-comment] [fixture:
  quadrant/db-after-y-axis-space-comment] [fixture:
  quadrant/db-after-y-axis-trailing-spaces] [fixture:
  quadrant/db-after-y-axis-trailing-tab] [fixture:
  quadrant/gram-after-classdef-semicolon] [fixture:
  quadrant/gram-after-classdef-semicolon-comment] [fixture:
  quadrant/gram-after-point-class-trailing-tab] [fixture:
  quadrant/div-after-point-style-glued-comment] [fixture:
  quadrant/gram-after-point-trailing-tab] [fixture:
  quadrant/div-after-quadrant-glued-comment]
- A style line rule of mermaid.js applies to any text: from a line that has
  `style:` or `classDef:`, later a `#`, and later a `;`, the last `;` is
  dropped, so that `style:#x;y` is `style:#xy` in a title, an accessibility
  text, a text in quotes, and the name of a class of `classDef`. A bare text of
  an axis or a quadrant and a name of a point do not take the colon, and the
  class name of a point is word characters only, so those places reject it.
  [fixture: quadrant/db-grid-style-acc-descr] [fixture:
  quadrant/db-grid-style-acc-descr-block] [fixture:
  quadrant/db-grid-style-acc-title] [fixture:
  quadrant/div-grid-style-classdef-name] [fixture:
  quadrant/db-grid-style-point-quoted] [fixture:
  quadrant/db-grid-style-quadrant-quoted] [fixture:
  quadrant/db-grid-style-title] [fixture: quadrant/db-grid-style-x-axis-quoted]
  [fixture: quadrant/db-grid-style-x-axis-right-quoted] [fixture:
  quadrant/db-grid-style-y-axis-quoted] [fixture:
  quadrant/db-grid-style-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-style-class-name] [fixture:
  quadrant/gram-grid-style-point-bare] [fixture:
  quadrant/gram-grid-style-quadrant-bare] [fixture:
  quadrant/gram-grid-style-x-axis-bare] [fixture:
  quadrant/gram-grid-style-x-axis-right-bare] [fixture:
  quadrant/gram-grid-style-y-axis-bare] [fixture:
  quadrant/gram-grid-style-y-axis-top-bare]
- A character reference such as `#35;` is its placeholder (`ﬂ°°35¶ß`, which the
  Db turns back when it draws) in a title, an accessibility text, a text of an
  axis or a quadrant, bare or in quotes, a name of a point, and the name of a
  class of `classDef`; in the class name of a point it is rejected, since the
  placeholder is no word character. A `#` with no reference is a character of
  every one of these texts and not of the class name of a point. A reference is
  `#`, a word or digits, and `;`, so `#b;` is one; `#35` with no `;` is none,
  and `&amp;` is no reference and stays as written, while the `#35;` of `&#35;`
  is one. Two references in a row are two placeholders. [fixture:
  quadrant/db-grid-entity-acc-descr] [fixture:
  quadrant/db-grid-entity-acc-descr-block] [fixture:
  quadrant/db-grid-entity-acc-title] [fixture:
  quadrant/db-grid-entity-classdef-name] [fixture:
  quadrant/db-grid-entity-point-quoted] [fixture:
  quadrant/db-grid-entity-quadrant-bare] [fixture:
  quadrant/db-grid-entity-quadrant-quoted] [fixture:
  quadrant/db-grid-entity-x-axis-quoted] [fixture:
  quadrant/db-grid-entity-x-axis-right-bare] [fixture:
  quadrant/db-grid-entity-x-axis-right-quoted] [fixture:
  quadrant/db-grid-entity-y-axis-quoted] [fixture:
  quadrant/db-grid-entity-y-axis-top-bare] [fixture:
  quadrant/db-grid-entity-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-entity-class-name] [fixture: quadrant/db-title-entity]
  [fixture: quadrant/db-x-axis-entity] [fixture: quadrant/db-y-axis-entity]
  [fixture: quadrant/db-quadrant-entity] [fixture: quadrant/db-name-entity]
  [fixture: quadrant/db-grid-hash-acc-descr] [fixture:
  quadrant/db-grid-hash-acc-descr-block] [fixture:
  quadrant/db-grid-hash-acc-title] [fixture:
  quadrant/db-grid-hash-classdef-name] [fixture:
  quadrant/db-grid-hash-point-bare] [fixture:
  quadrant/db-grid-hash-point-quoted] [fixture:
  quadrant/db-grid-hash-quadrant-bare] [fixture:
  quadrant/db-grid-hash-quadrant-quoted] [fixture: quadrant/db-grid-hash-title]
  [fixture: quadrant/db-grid-hash-x-axis-bare] [fixture:
  quadrant/db-grid-hash-x-axis-quoted] [fixture:
  quadrant/db-grid-hash-x-axis-right-bare] [fixture:
  quadrant/db-grid-hash-x-axis-right-quoted] [fixture:
  quadrant/db-grid-hash-y-axis-bare] [fixture:
  quadrant/db-grid-hash-y-axis-quoted] [fixture:
  quadrant/db-grid-hash-y-axis-top-bare] [fixture:
  quadrant/db-grid-hash-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-hash-class-name] [fixture:
  quadrant/db-entity-hash-in-class-name] [fixture:
  quadrant/db-entity-hash-word-semicolon] [fixture:
  quadrant/db-entity-html-named] [fixture: quadrant/db-entity-html-numeric]
  [fixture: quadrant/db-entity-numeric-quadrant-quoted-two] [fixture:
  quadrant/db-entity-without-semicolon]
- The same characters stand in every place that takes a text. A tab, a U+FEFF, a
  no-break space, an ideographic space, a U+2028, and a U+2029 are characters of
  a title, an accessibility text, a text of an axis or a quadrant, bare or in
  quotes, and a name of a point, and of the name of a class of `classDef` but
  for the tab, which ends the name, and the class name of a point takes none of
  them. A line feed, a CR, and a CRLF end the statement in the places that are
  not quoted, and the next line is then read as a statement, which is rejected;
  in a text in quotes and in the block of an accessibility description they are
  a line feed of the text. [fixture: quadrant/db-grid-tab-acc-descr] [fixture:
  quadrant/db-grid-tab-acc-descr-block] [fixture:
  quadrant/db-grid-tab-acc-title] [fixture: quadrant/db-grid-tab-point-bare]
  [fixture: quadrant/db-grid-tab-point-quoted] [fixture:
  quadrant/db-grid-tab-quadrant-bare] [fixture:
  quadrant/db-grid-tab-quadrant-quoted] [fixture: quadrant/db-grid-tab-title]
  [fixture: quadrant/db-grid-tab-x-axis-bare] [fixture:
  quadrant/db-grid-tab-x-axis-quoted] [fixture:
  quadrant/db-grid-tab-x-axis-right-bare] [fixture:
  quadrant/db-grid-tab-x-axis-right-quoted] [fixture:
  quadrant/db-grid-tab-y-axis-bare] [fixture:
  quadrant/db-grid-tab-y-axis-quoted] [fixture:
  quadrant/db-grid-tab-y-axis-top-bare] [fixture:
  quadrant/db-grid-tab-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-tab-class-name] [fixture:
  quadrant/gram-grid-tab-classdef-name] [fixture:
  quadrant/db-grid-bom-acc-descr] [fixture:
  quadrant/db-grid-bom-acc-descr-block] [fixture:
  quadrant/db-grid-bom-acc-title] [fixture: quadrant/db-grid-bom-classdef-name]
  [fixture: quadrant/db-grid-bom-point-bare] [fixture:
  quadrant/db-grid-bom-point-quoted] [fixture:
  quadrant/db-grid-bom-quadrant-bare] [fixture:
  quadrant/db-grid-bom-quadrant-quoted] [fixture: quadrant/db-grid-bom-title]
  [fixture: quadrant/db-grid-bom-x-axis-bare] [fixture:
  quadrant/db-grid-bom-x-axis-quoted] [fixture:
  quadrant/db-grid-bom-x-axis-right-bare] [fixture:
  quadrant/db-grid-bom-x-axis-right-quoted] [fixture:
  quadrant/db-grid-bom-y-axis-bare] [fixture:
  quadrant/db-grid-bom-y-axis-quoted] [fixture:
  quadrant/db-grid-bom-y-axis-top-bare] [fixture:
  quadrant/db-grid-bom-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-bom-class-name] [fixture: quadrant/db-grid-nbsp-acc-descr]
  [fixture: quadrant/db-grid-nbsp-acc-descr-block] [fixture:
  quadrant/db-grid-nbsp-acc-title] [fixture:
  quadrant/db-grid-nbsp-classdef-name] [fixture:
  quadrant/db-grid-nbsp-point-bare] [fixture:
  quadrant/db-grid-nbsp-point-quoted] [fixture:
  quadrant/db-grid-nbsp-quadrant-bare] [fixture:
  quadrant/db-grid-nbsp-quadrant-quoted] [fixture: quadrant/db-grid-nbsp-title]
  [fixture: quadrant/db-grid-nbsp-x-axis-bare] [fixture:
  quadrant/db-grid-nbsp-x-axis-quoted] [fixture:
  quadrant/db-grid-nbsp-x-axis-right-bare] [fixture:
  quadrant/db-grid-nbsp-x-axis-right-quoted] [fixture:
  quadrant/db-grid-nbsp-y-axis-bare] [fixture:
  quadrant/db-grid-nbsp-y-axis-quoted] [fixture:
  quadrant/db-grid-nbsp-y-axis-top-bare] [fixture:
  quadrant/db-grid-nbsp-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-nbsp-class-name] [fixture:
  quadrant/db-grid-ideographic-acc-descr] [fixture:
  quadrant/db-grid-ideographic-acc-descr-block] [fixture:
  quadrant/db-grid-ideographic-acc-title] [fixture:
  quadrant/db-grid-ideographic-classdef-name] [fixture:
  quadrant/db-grid-ideographic-point-bare] [fixture:
  quadrant/db-grid-ideographic-point-quoted] [fixture:
  quadrant/db-grid-ideographic-quadrant-bare] [fixture:
  quadrant/db-grid-ideographic-quadrant-quoted] [fixture:
  quadrant/db-grid-ideographic-title] [fixture:
  quadrant/db-grid-ideographic-x-axis-bare] [fixture:
  quadrant/db-grid-ideographic-x-axis-quoted] [fixture:
  quadrant/db-grid-ideographic-x-axis-right-bare] [fixture:
  quadrant/db-grid-ideographic-x-axis-right-quoted] [fixture:
  quadrant/db-grid-ideographic-y-axis-bare] [fixture:
  quadrant/db-grid-ideographic-y-axis-quoted] [fixture:
  quadrant/db-grid-ideographic-y-axis-top-bare] [fixture:
  quadrant/db-grid-ideographic-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-ideographic-class-name] [fixture:
  quadrant/db-grid-ls-acc-descr] [fixture: quadrant/db-grid-ls-acc-descr-block]
  [fixture: quadrant/db-grid-ls-acc-title] [fixture:
  quadrant/db-grid-ls-classdef-name] [fixture: quadrant/db-grid-ls-point-bare]
  [fixture: quadrant/db-grid-ls-point-quoted] [fixture:
  quadrant/db-grid-ls-quadrant-bare] [fixture:
  quadrant/db-grid-ls-quadrant-quoted] [fixture: quadrant/db-grid-ls-title]
  [fixture: quadrant/db-grid-ls-x-axis-bare] [fixture:
  quadrant/db-grid-ls-x-axis-quoted] [fixture:
  quadrant/db-grid-ls-x-axis-right-bare] [fixture:
  quadrant/db-grid-ls-x-axis-right-quoted] [fixture:
  quadrant/db-grid-ls-y-axis-bare] [fixture: quadrant/db-grid-ls-y-axis-quoted]
  [fixture: quadrant/db-grid-ls-y-axis-top-bare] [fixture:
  quadrant/db-grid-ls-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-ls-class-name] [fixture: quadrant/db-grid-ps-acc-descr]
  [fixture: quadrant/db-grid-ps-acc-descr-block] [fixture:
  quadrant/db-grid-ps-acc-title] [fixture: quadrant/db-grid-ps-classdef-name]
  [fixture: quadrant/db-grid-ps-point-bare] [fixture:
  quadrant/db-grid-ps-point-quoted] [fixture: quadrant/db-grid-ps-quadrant-bare]
  [fixture: quadrant/db-grid-ps-quadrant-quoted] [fixture:
  quadrant/db-grid-ps-title] [fixture: quadrant/db-grid-ps-x-axis-bare]
  [fixture: quadrant/db-grid-ps-x-axis-quoted] [fixture:
  quadrant/db-grid-ps-x-axis-right-bare] [fixture:
  quadrant/db-grid-ps-x-axis-right-quoted] [fixture:
  quadrant/db-grid-ps-y-axis-bare] [fixture: quadrant/db-grid-ps-y-axis-quoted]
  [fixture: quadrant/db-grid-ps-y-axis-top-bare] [fixture:
  quadrant/db-grid-ps-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-ps-class-name] [fixture:
  quadrant/db-grid-lf-acc-descr-block] [fixture:
  quadrant/db-grid-lf-point-quoted] [fixture:
  quadrant/db-grid-lf-quadrant-quoted] [fixture:
  quadrant/db-grid-lf-x-axis-quoted] [fixture:
  quadrant/db-grid-lf-x-axis-right-quoted] [fixture:
  quadrant/db-grid-lf-y-axis-quoted] [fixture:
  quadrant/db-grid-lf-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-lf-acc-descr] [fixture: quadrant/gram-grid-lf-acc-title]
  [fixture: quadrant/gram-grid-lf-class-name] [fixture:
  quadrant/gram-grid-lf-classdef-name] [fixture:
  quadrant/gram-grid-lf-point-bare] [fixture:
  quadrant/gram-grid-lf-quadrant-bare] [fixture: quadrant/gram-grid-lf-title]
  [fixture: quadrant/gram-grid-lf-x-axis-bare] [fixture:
  quadrant/gram-grid-lf-x-axis-right-bare] [fixture:
  quadrant/gram-grid-lf-y-axis-bare] [fixture:
  quadrant/gram-grid-lf-y-axis-top-bare] [fixture:
  quadrant/db-grid-cr-acc-descr-block] [fixture:
  quadrant/db-grid-cr-point-quoted] [fixture:
  quadrant/db-grid-cr-quadrant-quoted] [fixture:
  quadrant/db-grid-cr-x-axis-quoted] [fixture:
  quadrant/db-grid-cr-x-axis-right-quoted] [fixture:
  quadrant/db-grid-cr-y-axis-quoted] [fixture:
  quadrant/db-grid-cr-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-cr-acc-descr] [fixture: quadrant/gram-grid-cr-acc-title]
  [fixture: quadrant/gram-grid-cr-class-name] [fixture:
  quadrant/gram-grid-cr-classdef-name] [fixture:
  quadrant/gram-grid-cr-point-bare] [fixture:
  quadrant/gram-grid-cr-quadrant-bare] [fixture: quadrant/gram-grid-cr-title]
  [fixture: quadrant/gram-grid-cr-x-axis-bare] [fixture:
  quadrant/gram-grid-cr-x-axis-right-bare] [fixture:
  quadrant/gram-grid-cr-y-axis-bare] [fixture:
  quadrant/gram-grid-cr-y-axis-top-bare] [fixture:
  quadrant/db-grid-crlf-acc-descr-block] [fixture:
  quadrant/db-grid-crlf-point-quoted] [fixture:
  quadrant/db-grid-crlf-quadrant-quoted] [fixture:
  quadrant/db-grid-crlf-x-axis-quoted] [fixture:
  quadrant/db-grid-crlf-x-axis-right-quoted] [fixture:
  quadrant/db-grid-crlf-y-axis-quoted] [fixture:
  quadrant/db-grid-crlf-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-crlf-acc-descr] [fixture:
  quadrant/gram-grid-crlf-acc-title] [fixture:
  quadrant/gram-grid-crlf-class-name] [fixture:
  quadrant/gram-grid-crlf-classdef-name] [fixture:
  quadrant/gram-grid-crlf-point-bare] [fixture:
  quadrant/gram-grid-crlf-quadrant-bare] [fixture:
  quadrant/gram-grid-crlf-title] [fixture: quadrant/gram-grid-crlf-x-axis-bare]
  [fixture: quadrant/gram-grid-crlf-x-axis-right-bare] [fixture:
  quadrant/gram-grid-crlf-y-axis-bare] [fixture:
  quadrant/gram-grid-crlf-y-axis-top-bare]
- A directive inside a text is removed in every place, the class names included.
  The names of `Object.prototype` are plain names in every place that takes a
  name, but `__proto__` as the name of a class of `classDef`, where the
  underscore is not allowed. The keyword `title` is text in a title, an
  accessibility text, a text in quotes, and the class name of a point; a bare
  text of an axis or a quadrant and the name of a class of `classDef` do not
  take it, and a name of a point that is `title` is the title. [fixture:
  quadrant/db-grid-directive-acc-descr] [fixture:
  quadrant/db-grid-directive-acc-descr-block] [fixture:
  quadrant/db-grid-directive-acc-title] [fixture:
  quadrant/div-grid-directive-class-name] [fixture:
  quadrant/div-grid-directive-classdef-name] [fixture:
  quadrant/db-grid-directive-point-bare] [fixture:
  quadrant/db-grid-directive-point-quoted] [fixture:
  quadrant/db-grid-directive-quadrant-bare] [fixture:
  quadrant/db-grid-directive-quadrant-quoted] [fixture:
  quadrant/db-grid-directive-title] [fixture:
  quadrant/db-grid-directive-x-axis-bare] [fixture:
  quadrant/db-grid-directive-x-axis-quoted] [fixture:
  quadrant/db-grid-directive-x-axis-right-bare] [fixture:
  quadrant/db-grid-directive-x-axis-right-quoted] [fixture:
  quadrant/db-grid-directive-y-axis-bare] [fixture:
  quadrant/db-grid-directive-y-axis-quoted] [fixture:
  quadrant/db-grid-directive-y-axis-top-bare] [fixture:
  quadrant/db-grid-directive-y-axis-top-quoted] [fixture:
  quadrant/db-grid-proto-acc-descr] [fixture:
  quadrant/db-grid-proto-acc-descr-block] [fixture:
  quadrant/db-grid-proto-acc-title] [fixture:
  quadrant/db-grid-proto-point-quoted] [fixture:
  quadrant/db-grid-proto-quadrant-bare] [fixture:
  quadrant/db-grid-proto-quadrant-quoted] [fixture:
  quadrant/db-grid-proto-title] [fixture: quadrant/db-grid-proto-x-axis-bare]
  [fixture: quadrant/db-grid-proto-x-axis-quoted] [fixture:
  quadrant/db-grid-proto-x-axis-right-bare] [fixture:
  quadrant/db-grid-proto-x-axis-right-quoted] [fixture:
  quadrant/db-grid-proto-y-axis-bare] [fixture:
  quadrant/db-grid-proto-y-axis-quoted] [fixture:
  quadrant/db-grid-proto-y-axis-top-bare] [fixture:
  quadrant/db-grid-proto-y-axis-top-quoted] [fixture:
  quadrant/db-grid-constructor-acc-descr] [fixture:
  quadrant/db-grid-constructor-acc-descr-block] [fixture:
  quadrant/db-grid-constructor-acc-title] [fixture:
  quadrant/db-grid-constructor-point-quoted] [fixture:
  quadrant/db-grid-constructor-quadrant-bare] [fixture:
  quadrant/db-grid-constructor-quadrant-quoted] [fixture:
  quadrant/db-grid-constructor-title] [fixture:
  quadrant/db-grid-constructor-x-axis-bare] [fixture:
  quadrant/db-grid-constructor-x-axis-quoted] [fixture:
  quadrant/db-grid-constructor-x-axis-right-bare] [fixture:
  quadrant/db-grid-constructor-x-axis-right-quoted] [fixture:
  quadrant/db-grid-constructor-y-axis-bare] [fixture:
  quadrant/db-grid-constructor-y-axis-quoted] [fixture:
  quadrant/db-grid-constructor-y-axis-top-bare] [fixture:
  quadrant/db-grid-constructor-y-axis-top-quoted] [fixture:
  quadrant/db-class-proto] [fixture: quadrant/db-name-proto] [fixture:
  quadrant/gram-classdef-proto-name] [fixture:
  quadrant/db-grid-keyword-acc-descr] [fixture:
  quadrant/db-grid-keyword-acc-descr-block] [fixture:
  quadrant/db-grid-keyword-acc-title] [fixture:
  quadrant/db-grid-keyword-class-name] [fixture:
  quadrant/db-grid-keyword-point-quoted] [fixture:
  quadrant/db-grid-keyword-quadrant-quoted] [fixture:
  quadrant/db-grid-keyword-title] [fixture:
  quadrant/db-grid-keyword-x-axis-quoted] [fixture:
  quadrant/db-grid-keyword-x-axis-right-quoted] [fixture:
  quadrant/db-grid-keyword-y-axis-quoted] [fixture:
  quadrant/db-grid-keyword-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-keyword-quadrant-bare] [fixture:
  quadrant/gram-grid-keyword-x-axis-bare] [fixture:
  quadrant/gram-grid-keyword-x-axis-right-bare] [fixture:
  quadrant/gram-grid-keyword-y-axis-bare] [fixture:
  quadrant/gram-grid-keyword-y-axis-top-bare] [fixture:
  quadrant/gram-classdef-name-keyword-title] [fixture:
  quadrant/db-title-with-colon-point-like]
- A `%%` after a space is part of the text in a title, an accessibility text,
  the block of a description, and a text in quotes, and a comment outside them:
  the comment is skipped and the text before it stays in a bare text of an axis
  or a quadrant, while after the name of a point, the class name of a point, or
  the name of a class of `classDef` the line has no point or styles and is
  rejected. A `%%` glued to a unit of one character takes the character: a bare
  text of an axis or a quadrant is then empty and rejected, the right text of an
  axis is dropped, a name of a point leaves a line that is all comment and is
  accepted, and the class names are rejected. [fixture:
  quadrant/db-grid-comment-acc-descr] [fixture:
  quadrant/db-grid-comment-acc-descr-block] [fixture:
  quadrant/db-grid-comment-acc-title] [fixture:
  quadrant/db-grid-comment-glued-acc-descr] [fixture:
  quadrant/db-grid-comment-glued-acc-descr-block] [fixture:
  quadrant/db-grid-comment-glued-acc-title] [fixture:
  quadrant/div-grid-comment-glued-point-bare] [fixture:
  quadrant/db-grid-comment-glued-point-quoted] [fixture:
  quadrant/db-grid-comment-glued-quadrant-quoted] [fixture:
  quadrant/db-grid-comment-glued-title] [fixture:
  quadrant/db-grid-comment-glued-x-axis-quoted] [fixture:
  quadrant/div-grid-comment-glued-x-axis-right-bare] [fixture:
  quadrant/db-grid-comment-glued-x-axis-right-quoted] [fixture:
  quadrant/db-grid-comment-glued-y-axis-quoted] [fixture:
  quadrant/div-grid-comment-glued-y-axis-top-bare] [fixture:
  quadrant/db-grid-comment-glued-y-axis-top-quoted] [fixture:
  quadrant/db-grid-comment-point-quoted] [fixture:
  quadrant/db-grid-comment-quadrant-bare] [fixture:
  quadrant/db-grid-comment-quadrant-quoted] [fixture:
  quadrant/db-grid-comment-title] [fixture:
  quadrant/db-grid-comment-x-axis-bare] [fixture:
  quadrant/db-grid-comment-x-axis-quoted] [fixture:
  quadrant/db-grid-comment-x-axis-right-bare] [fixture:
  quadrant/db-grid-comment-x-axis-right-quoted] [fixture:
  quadrant/db-grid-comment-y-axis-bare] [fixture:
  quadrant/db-grid-comment-y-axis-quoted] [fixture:
  quadrant/db-grid-comment-y-axis-top-bare] [fixture:
  quadrant/db-grid-comment-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-comment-class-name] [fixture:
  quadrant/gram-grid-comment-classdef-name] [fixture:
  quadrant/gram-grid-comment-glued-class-name] [fixture:
  quadrant/gram-grid-comment-glued-classdef-name] [fixture:
  quadrant/div-grid-comment-glued-quadrant-bare] [fixture:
  quadrant/div-grid-comment-glued-x-axis-bare] [fixture:
  quadrant/div-grid-comment-glued-y-axis-bare] [fixture:
  quadrant/gram-grid-comment-point-bare]
- Punctuation and markup follow the rules of each place. A colon, a `;`,
  brackets, a tag, an arrow, and the other punctuation are text in a title, an
  accessibility text, and a text in quotes (the quotes of a tag are read as
  `'`); a bare text of an axis, a quadrant, or a name of a point takes none of
  the colon, the `;`, the brackets, the tag, and the arrow (the arrow of an axis
  is the arrow of the statement), and the names of classes take none of them but
  the colon in `classDef`. A `"` inside quotes ends the string, so that the text
  is rejected, while it is text in a title and an accessibility text. A single
  `%`, a backtick, and a character outside ASCII are text in every place that
  takes text, except the names of classes, which take no backtick and no `%`. An
  empty text sets the empty text in a title and in the block of a description,
  is rejected in the other places that need a text, and is dropped as the right
  text of an axis. [fixture: quadrant/db-grid-nonascii-acc-descr] [fixture:
  quadrant/db-grid-nonascii-acc-descr-block] [fixture:
  quadrant/db-grid-nonascii-acc-title] [fixture:
  quadrant/db-grid-nonascii-point-quoted] [fixture:
  quadrant/db-grid-nonascii-quadrant-bare] [fixture:
  quadrant/db-grid-nonascii-quadrant-quoted] [fixture:
  quadrant/db-grid-nonascii-x-axis-bare] [fixture:
  quadrant/db-grid-nonascii-x-axis-quoted] [fixture:
  quadrant/db-grid-nonascii-x-axis-right-bare] [fixture:
  quadrant/db-grid-nonascii-x-axis-right-quoted] [fixture:
  quadrant/db-grid-nonascii-y-axis-bare] [fixture:
  quadrant/db-grid-nonascii-y-axis-quoted] [fixture:
  quadrant/db-grid-nonascii-y-axis-top-bare] [fixture:
  quadrant/db-grid-nonascii-y-axis-top-quoted] [fixture:
  quadrant/db-grid-html-acc-descr] [fixture:
  quadrant/db-grid-html-acc-descr-block] [fixture:
  quadrant/db-grid-html-acc-title] [fixture: quadrant/db-grid-html-point-quoted]
  [fixture: quadrant/db-grid-html-quadrant-quoted] [fixture:
  quadrant/db-grid-html-title] [fixture: quadrant/db-grid-html-x-axis-quoted]
  [fixture: quadrant/db-grid-html-x-axis-right-quoted] [fixture:
  quadrant/db-grid-html-y-axis-quoted] [fixture:
  quadrant/db-grid-html-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-html-class-name] [fixture:
  quadrant/gram-grid-html-classdef-name] [fixture:
  quadrant/gram-grid-html-point-bare] [fixture:
  quadrant/gram-grid-html-quadrant-bare] [fixture:
  quadrant/gram-grid-html-x-axis-bare] [fixture:
  quadrant/gram-grid-html-x-axis-right-bare] [fixture:
  quadrant/gram-grid-html-y-axis-bare] [fixture:
  quadrant/gram-grid-html-y-axis-top-bare] [fixture:
  quadrant/db-grid-punct-acc-descr] [fixture:
  quadrant/db-grid-punct-acc-descr-block] [fixture:
  quadrant/db-grid-punct-acc-title] [fixture:
  quadrant/db-grid-punct-point-quoted] [fixture:
  quadrant/db-grid-punct-quadrant-quoted] [fixture:
  quadrant/db-grid-punct-title] [fixture: quadrant/db-grid-punct-x-axis-quoted]
  [fixture: quadrant/db-grid-punct-x-axis-right-quoted] [fixture:
  quadrant/db-grid-punct-y-axis-quoted] [fixture:
  quadrant/db-grid-punct-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-punct-class-name] [fixture:
  quadrant/gram-grid-punct-classdef-name] [fixture:
  quadrant/gram-grid-punct-point-bare] [fixture:
  quadrant/gram-grid-punct-quadrant-bare] [fixture:
  quadrant/gram-grid-punct-x-axis-bare] [fixture:
  quadrant/gram-grid-punct-x-axis-right-bare] [fixture:
  quadrant/gram-grid-punct-y-axis-bare] [fixture:
  quadrant/gram-grid-punct-y-axis-top-bare] [fixture:
  quadrant/db-grid-semicolon-acc-descr] [fixture:
  quadrant/db-grid-semicolon-acc-descr-block] [fixture:
  quadrant/db-grid-semicolon-acc-title] [fixture:
  quadrant/db-grid-semicolon-point-quoted] [fixture:
  quadrant/db-grid-semicolon-quadrant-quoted] [fixture:
  quadrant/db-grid-semicolon-title] [fixture:
  quadrant/db-grid-semicolon-x-axis-quoted] [fixture:
  quadrant/db-grid-semicolon-x-axis-right-quoted] [fixture:
  quadrant/db-grid-semicolon-y-axis-quoted] [fixture:
  quadrant/db-grid-semicolon-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-semicolon-class-name] [fixture:
  quadrant/gram-grid-semicolon-classdef-name] [fixture:
  quadrant/gram-grid-semicolon-point-bare] [fixture:
  quadrant/gram-grid-semicolon-quadrant-bare] [fixture:
  quadrant/gram-grid-semicolon-x-axis-bare] [fixture:
  quadrant/gram-grid-semicolon-x-axis-right-bare] [fixture:
  quadrant/gram-grid-semicolon-y-axis-bare] [fixture:
  quadrant/gram-grid-semicolon-y-axis-top-bare] [fixture:
  quadrant/db-grid-colon-acc-descr] [fixture:
  quadrant/db-grid-colon-acc-descr-block] [fixture:
  quadrant/db-grid-colon-acc-title] [fixture:
  quadrant/db-grid-colon-classdef-name] [fixture:
  quadrant/db-grid-colon-point-quoted] [fixture:
  quadrant/db-grid-colon-quadrant-quoted] [fixture:
  quadrant/db-grid-colon-title] [fixture: quadrant/db-grid-colon-x-axis-quoted]
  [fixture: quadrant/db-grid-colon-x-axis-right-quoted] [fixture:
  quadrant/db-grid-colon-y-axis-quoted] [fixture:
  quadrant/db-grid-colon-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-colon-class-name] [fixture:
  quadrant/gram-grid-colon-point-bare] [fixture:
  quadrant/gram-grid-colon-quadrant-bare] [fixture:
  quadrant/gram-grid-colon-x-axis-bare] [fixture:
  quadrant/gram-grid-colon-x-axis-right-bare] [fixture:
  quadrant/gram-grid-colon-y-axis-bare] [fixture:
  quadrant/gram-grid-colon-y-axis-top-bare] [fixture:
  quadrant/db-grid-arrow-acc-descr] [fixture:
  quadrant/db-grid-arrow-acc-descr-block] [fixture:
  quadrant/db-grid-arrow-acc-title] [fixture:
  quadrant/db-grid-arrow-point-quoted] [fixture:
  quadrant/db-grid-arrow-quadrant-quoted] [fixture:
  quadrant/db-grid-arrow-title] [fixture: quadrant/db-grid-arrow-x-axis-bare]
  [fixture: quadrant/db-grid-arrow-x-axis-quoted] [fixture:
  quadrant/db-grid-arrow-x-axis-right-quoted] [fixture:
  quadrant/db-grid-arrow-y-axis-bare] [fixture:
  quadrant/db-grid-arrow-y-axis-quoted] [fixture:
  quadrant/db-grid-arrow-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-arrow-class-name] [fixture:
  quadrant/gram-grid-arrow-classdef-name] [fixture:
  quadrant/gram-grid-arrow-point-bare] [fixture:
  quadrant/gram-grid-arrow-quadrant-bare] [fixture:
  quadrant/gram-grid-arrow-x-axis-right-bare] [fixture:
  quadrant/gram-grid-arrow-y-axis-top-bare] [fixture:
  quadrant/db-grid-quote-acc-descr] [fixture:
  quadrant/db-grid-quote-acc-descr-block] [fixture:
  quadrant/db-grid-quote-acc-title] [fixture: quadrant/db-grid-quote-title]
  [fixture: quadrant/gram-grid-quote-class-name] [fixture:
  quadrant/gram-grid-quote-classdef-name] [fixture:
  quadrant/gram-grid-quote-point-bare] [fixture:
  quadrant/gram-grid-quote-point-quoted] [fixture:
  quadrant/gram-grid-quote-quadrant-bare] [fixture:
  quadrant/gram-grid-quote-quadrant-quoted] [fixture:
  quadrant/gram-grid-quote-x-axis-bare] [fixture:
  quadrant/gram-grid-quote-x-axis-quoted] [fixture:
  quadrant/gram-grid-quote-x-axis-right-bare] [fixture:
  quadrant/gram-grid-quote-x-axis-right-quoted] [fixture:
  quadrant/gram-grid-quote-y-axis-bare] [fixture:
  quadrant/gram-grid-quote-y-axis-quoted] [fixture:
  quadrant/gram-grid-quote-y-axis-top-bare] [fixture:
  quadrant/gram-grid-quote-y-axis-top-quoted] [fixture:
  quadrant/db-grid-backtick-acc-descr] [fixture:
  quadrant/db-grid-backtick-acc-descr-block] [fixture:
  quadrant/db-grid-backtick-acc-title] [fixture:
  quadrant/db-grid-backtick-point-bare] [fixture:
  quadrant/db-grid-backtick-point-quoted] [fixture:
  quadrant/db-grid-backtick-quadrant-bare] [fixture:
  quadrant/db-grid-backtick-quadrant-quoted] [fixture:
  quadrant/db-grid-backtick-title] [fixture:
  quadrant/db-grid-backtick-x-axis-bare] [fixture:
  quadrant/db-grid-backtick-x-axis-quoted] [fixture:
  quadrant/db-grid-backtick-x-axis-right-bare] [fixture:
  quadrant/db-grid-backtick-x-axis-right-quoted] [fixture:
  quadrant/db-grid-backtick-y-axis-bare] [fixture:
  quadrant/db-grid-backtick-y-axis-quoted] [fixture:
  quadrant/db-grid-backtick-y-axis-top-bare] [fixture:
  quadrant/db-grid-backtick-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-backtick-class-name] [fixture:
  quadrant/gram-grid-backtick-classdef-name] [fixture:
  quadrant/db-grid-percent-acc-descr] [fixture:
  quadrant/db-grid-percent-acc-descr-block] [fixture:
  quadrant/db-grid-percent-acc-title] [fixture:
  quadrant/db-grid-percent-point-bare] [fixture:
  quadrant/db-grid-percent-point-quoted] [fixture:
  quadrant/db-grid-percent-quadrant-bare] [fixture:
  quadrant/db-grid-percent-quadrant-quoted] [fixture:
  quadrant/db-grid-percent-title] [fixture:
  quadrant/db-grid-percent-x-axis-bare] [fixture:
  quadrant/db-grid-percent-x-axis-quoted] [fixture:
  quadrant/db-grid-percent-x-axis-right-bare] [fixture:
  quadrant/db-grid-percent-x-axis-right-quoted] [fixture:
  quadrant/db-grid-percent-y-axis-bare] [fixture:
  quadrant/db-grid-percent-y-axis-quoted] [fixture:
  quadrant/db-grid-percent-y-axis-top-bare] [fixture:
  quadrant/db-grid-percent-y-axis-top-quoted] [fixture:
  quadrant/gram-grid-percent-class-name] [fixture:
  quadrant/gram-grid-percent-classdef-name] [fixture:
  quadrant/db-grid-empty-x-axis-right-bare] [fixture:
  quadrant/db-grid-empty-y-axis-top-bare] [fixture:
  quadrant/gram-grid-empty-acc-descr] [fixture:
  quadrant/gram-grid-empty-acc-title] [fixture:
  quadrant/gram-grid-empty-classdef-name] [fixture:
  quadrant/gram-grid-empty-point-bare] [fixture:
  quadrant/gram-grid-empty-quadrant-bare] [fixture:
  quadrant/gram-grid-empty-quadrant-quoted] [fixture:
  quadrant/gram-grid-empty-x-axis-bare] [fixture:
  quadrant/gram-grid-empty-y-axis-bare]
- The title of the frontmatter is the title of the chart, a quoted string or a
  number being the text, and the empty title being the empty text; the
  delimiters can be indented, and the lines can end with a CRLF. A frontmatter
  with settings and no title leaves the title to the statements, and a statement
  that is not a title keeps the title of the frontmatter. The spaces around the
  title go and those inside stay, a folded YAML title is one line with a line
  feed at its end, and a U+FEFF before the header after the frontmatter changes
  nothing. A frontmatter that is not valid YAML is rejected, and a tag that
  starts in a field of the frontmatter and ends in the diagram has its quotes
  changed as one tag. [fixture: quadrant/db-frontmatter-crlf] [fixture:
  quadrant/div-frontmatter-html-tag-starts-in-field] [fixture:
  quadrant/db-frontmatter-indented-delimiters] [fixture:
  quadrant/db-frontmatter-no-title] [fixture:
  quadrant/db-frontmatter-then-bom-header] [fixture:
  quadrant/db-frontmatter-title-empty] [fixture:
  quadrant/db-frontmatter-title-number] [fixture:
  quadrant/db-frontmatter-title-quoted] [fixture:
  quadrant/db-frontmatter-title-spaces] [fixture:
  quadrant/db-frontmatter-title-with-quadrant-statement] [fixture:
  quadrant/db-frontmatter-title-yaml-multiline] [fixture:
  quadrant/db-frontmatter-with-quadrant-config] [fixture:
  quadrant/db-frontmatter-with-theme] [fixture:
  quadrant/div-frontmatter-invalid-yaml]
- The settings of the chart (`quadrantChart`: the width and the height, the
  paddings and font sizes, the position of the axes, the radius of the points),
  the theme, and its variables change nothing in the Db, whether the site, the
  frontmatter, or a directive gives them: the radius of a point is the one the
  text gave, and a point with no radius has none. The settings `showXAxis` and
  `showYAxis`, which the schema does not list, hide the labels of the layout,
  and the summary reads the texts of the axes from the labels; where a site sets
  one of them false and the text sets a text of that axis, the summary would
  lose the text, so `runMermaid()` stops with a `MermaidEnvironmentError` (a
  directive and the frontmatter do not change these settings). [fixture:
  quadrant/config-settings-chart] [fixture:
  quadrant/config-settings-max-text-size] [fixture:
  quadrant/config-settings-point-radius]
- The texts hold the characters replaced under a securityLevel that is not one
  of mermaid.js's values (`other`) with `htmlLabels` unset, in the title, the
  accessibility title, the texts of the axes and the quadrants, and the names of
  the points; with `htmlLabels` false, under `loose`, and under `sandbox` they
  are as written, and with the default settings a tag is kept as it is.
  [fixture: quadrant/config-security-level-default-script] [fixture:
  quadrant/config-security-level-loose-all] [fixture:
  quadrant/config-security-level-other-all] [fixture:
  quadrant/config-security-level-other-flowchart-html-labels-false] [fixture:
  quadrant/config-security-level-other-html-labels-false] [fixture:
  quadrant/config-security-level-other-script] [fixture:
  quadrant/config-security-level-sandbox-all]
- The style line rule has the forms that it had in other diagrams. The keyword
  in another case (`Style:#x;y`), a space between the `:` and the `#`, and no
  `#` keep the `;`, which then ends a character reference where a `#` stands
  before it; with two `;` the last is dropped and the first stays; `classDef:`
  is a keyword of the rule too. A `;` on another line of a text in quotes is
  kept, and a line inside quotes with the keyword is a line of its own. The `;`
  that would end a statement is dropped, so that
  `quadrant-1 "style:#a"; quadrant-2 B` and two axis statements with a `;`
  between them are joined and rejected, while the `;` that ends a point is
  dropped and the point still ends at the end of its line, and a `;` in a title
  is dropped, so that the title holds the rest of the line. [fixture:
  quadrant/db-style-line-classdef-keyword-acc-title] [fixture:
  quadrant/db-style-line-classdef-keyword-quadrant-quoted] [fixture:
  quadrant/db-style-line-classdef-keyword-title] [fixture:
  quadrant/db-style-line-hash-on-another-line-quoted] [fixture:
  quadrant/db-style-line-ignored-in-point] [fixture:
  quadrant/db-style-line-ignored-in-value] [fixture:
  quadrant/db-style-line-keyword-on-another-line-quoted] [fixture:
  quadrant/db-style-line-no-hash-acc-title] [fixture:
  quadrant/db-style-line-no-hash-quadrant-quoted] [fixture:
  quadrant/db-style-line-no-hash-title] [fixture:
  quadrant/db-style-line-semicolon-on-another-line-quoted] [fixture:
  quadrant/db-style-line-semicolon-statement-separator-in-title] [fixture:
  quadrant/db-style-line-space-after-colon-acc-title] [fixture:
  quadrant/db-style-line-space-after-colon-quadrant-quoted] [fixture:
  quadrant/db-style-line-space-after-colon-title] [fixture:
  quadrant/db-style-line-two-semicolons-acc-title] [fixture:
  quadrant/db-style-line-two-semicolons-quadrant-quoted] [fixture:
  quadrant/db-style-line-two-semicolons-title] [fixture:
  quadrant/db-style-line-upper-case-acc-title] [fixture:
  quadrant/db-style-line-upper-case-quadrant-quoted] [fixture:
  quadrant/db-style-line-upper-case-title] [fixture:
  quadrant/gram-style-line-ignored-between-axis-statements] [fixture:
  quadrant/gram-style-line-ignored-between-statements]
- A keyword with its text on the next line is rejected: `x-axis`, `y-axis`,
  `quadrant-1`, `classDef`, and `title`, whether a blank line, a comment line,
  or a directive line stands between, since the text is a statement of its own.
  The accessibility keywords take the next line as their text: comment lines and
  directive lines between are removed, and the line may say anything, a point, a
  quadrant statement, a `classDef` line, or a `title` line, which then sets no
  title. [fixture: quadrant/gram-keyword-line-feed-classdef] [fixture:
  quadrant/gram-keyword-line-feed-quadrant] [fixture:
  quadrant/gram-keyword-line-feed-title] [fixture:
  quadrant/gram-keyword-line-feed-x-axis] [fixture:
  quadrant/gram-keyword-line-feed-y-axis] [fixture:
  quadrant/gram-keyword-comment-line-classdef] [fixture:
  quadrant/gram-keyword-comment-line-quadrant] [fixture:
  quadrant/gram-keyword-comment-line-title] [fixture:
  quadrant/gram-keyword-comment-line-x-axis] [fixture:
  quadrant/gram-keyword-comment-line-y-axis] [fixture:
  quadrant/gram-keyword-directive-line-classdef] [fixture:
  quadrant/gram-keyword-directive-line-quadrant] [fixture:
  quadrant/gram-keyword-directive-line-x-axis] [fixture:
  quadrant/gram-keyword-directive-line-y-axis] [fixture:
  quadrant/gram-keyword-blank-line-classdef] [fixture:
  quadrant/gram-keyword-blank-line-quadrant] [fixture:
  quadrant/gram-keyword-blank-line-x-axis] [fixture:
  quadrant/gram-keyword-blank-line-y-axis] [fixture:
  quadrant/db-acc-title-comment-line-before-text] [fixture:
  quadrant/db-acc-title-directive-line-before-text] [fixture:
  quadrant/db-acc-title-statement-as-text] [fixture:
  quadrant/db-acc-title-quadrant-as-text] [fixture:
  quadrant/db-acc-descr-comment-line-before-text] [fixture:
  quadrant/db-acc-descr-classdef-as-text] [fixture:
  quadrant/db-acc-descr-title-text-keeps-title]
- What follows a keyword glued to it: after `title`, a character outside ASCII
  or a dash is the start of the title (`titleé` is the title `é`), while a digit
  or an underscore makes a word and the line is rejected; `accTitle` and
  `accDescr` need the colon next to them, and `classDef` the space, so any
  suffix is rejected; `x-axis`, `y-axis`, and `quadrant-1` are followed by the
  text, which may start with a character outside ASCII, a digit, or an
  underscore, but not with a dash. An underscore or a U+FEFF after the header is
  a text where no statement starts. [fixture:
  quadrant/db-keyword-suffix-quadrant-digit] [fixture:
  quadrant/db-keyword-suffix-quadrant-non-ascii] [fixture:
  quadrant/db-keyword-suffix-quadrant-underscore] [fixture:
  quadrant/db-keyword-suffix-title-dash] [fixture:
  quadrant/db-keyword-suffix-title-non-ascii] [fixture:
  quadrant/db-keyword-suffix-x-axis-digit] [fixture:
  quadrant/db-keyword-suffix-x-axis-non-ascii] [fixture:
  quadrant/db-keyword-suffix-x-axis-underscore] [fixture:
  quadrant/db-keyword-suffix-y-axis-digit] [fixture:
  quadrant/db-keyword-suffix-y-axis-non-ascii] [fixture:
  quadrant/db-keyword-suffix-y-axis-underscore] [fixture:
  quadrant/gram-keyword-suffix-acc-descr-dash] [fixture:
  quadrant/gram-keyword-suffix-acc-descr-digit] [fixture:
  quadrant/gram-keyword-suffix-acc-descr-non-ascii] [fixture:
  quadrant/gram-keyword-suffix-acc-descr-underscore] [fixture:
  quadrant/gram-keyword-suffix-acc-title-dash] [fixture:
  quadrant/gram-keyword-suffix-acc-title-digit] [fixture:
  quadrant/gram-keyword-suffix-acc-title-non-ascii] [fixture:
  quadrant/gram-keyword-suffix-acc-title-underscore] [fixture:
  quadrant/gram-keyword-suffix-classdef-dash] [fixture:
  quadrant/gram-keyword-suffix-classdef-digit] [fixture:
  quadrant/gram-keyword-suffix-classdef-non-ascii] [fixture:
  quadrant/gram-keyword-suffix-classdef-underscore] [fixture:
  quadrant/gram-keyword-suffix-quadrant-dash] [fixture:
  quadrant/gram-keyword-suffix-title-digit] [fixture:
  quadrant/gram-keyword-suffix-title-underscore] [fixture:
  quadrant/gram-keyword-suffix-x-axis-dash] [fixture:
  quadrant/gram-keyword-suffix-y-axis-dash] [fixture:
  quadrant/header-underscore-suffix] [fixture: quadrant/header-bom-after]
  [fixture: quadrant/header-bom-after-statement]
- The keywords `title`, `x-axis`, and `classDef` need no boundary before them:
  after a `.`, a dash, an underscore, or a digit inside a bare text or a name
  they are the keyword, and the line is rejected, while inside a title `title`
  is text. The word `quadrantChart` inside a bare text is the header, and the
  line is rejected, while inside a title it is text. [fixture:
  quadrant/db-keyword-after-dot-in-title] [fixture:
  quadrant/gram-keyword-after-dash-in-name] [fixture:
  quadrant/gram-keyword-after-dash-in-quadrant-text] [fixture:
  quadrant/gram-keyword-after-digit-in-name] [fixture:
  quadrant/gram-keyword-after-digit-in-quadrant-text] [fixture:
  quadrant/gram-keyword-after-dot-in-name] [fixture:
  quadrant/gram-keyword-after-dot-in-quadrant-text] [fixture:
  quadrant/gram-keyword-after-underscore-in-name] [fixture:
  quadrant/gram-keyword-after-underscore-in-quadrant-text] [fixture:
  quadrant/gram-keyword-axis-after-dot-in-quadrant-text] [fixture:
  quadrant/gram-keyword-classdef-after-dot-in-name] [fixture:
  quadrant/db-keyword-header-in-word] [fixture:
  quadrant/gram-keyword-header-in-quadrant-text]
- The names of `Object.prototype` are plain names of points and of classes, a
  class named `constructor` is defined and used like any other, and a second
  definition replaces the first. [fixture:
  quadrant/db-name-prototype-definegetter] [fixture:
  quadrant/db-name-prototype-isprototypeof] [fixture:
  quadrant/db-name-prototype-lookupgetter] [fixture:
  quadrant/db-name-prototype-propertyisenumerable] [fixture:
  quadrant/db-name-prototype-tolocalestring] [fixture:
  quadrant/db-name-prototype-valueof] [fixture:
  quadrant/db-class-prototype-value-of] [fixture:
  quadrant/db-classdef-prototype-to-string-redefined] [fixture:
  quadrant/db-classdef-prototype-twice] [fixture:
  quadrant/db-classdef-prototype-used]
- Several definitions of one name: the last of three titles, or of three texts
  of a quadrant, is the value; two quadrants set in turn each keep their last
  text; for an axis, the third statement sets what it names, so that a left text
  with the arrow is replaced by a text without it and the right text of the
  first stays, and a third statement with two texts sets both; the third
  definition of a class replaces the second, and with a partner class in between
  each class keeps its last styles and the order of first definitions stays.
  [fixture: quadrant/db-title-three-times] [fixture:
  quadrant/db-quadrant-three-times] [fixture:
  quadrant/db-quadrant-three-times-with-partner] [fixture:
  quadrant/db-x-axis-three-times-arrow-forms] [fixture:
  quadrant/db-x-axis-three-times-then-both] [fixture:
  quadrant/db-y-axis-three-times-arrow-forms] [fixture:
  quadrant/db-classdef-three-times] [fixture:
  quadrant/db-classdef-three-times-partner]
- An empty block (`{}`, a line feed, a space, blank lines, or a tab inside it)
  sets nothing, so the description that a line or a block set before it stays,
  also after two empty blocks; it does not touch the accessibility title. An
  `accDescr:` with no text at the end of the text is rejected even after a text.
  [fixture: quadrant/db-acc-descr-empty-block-keeps-block] [fixture:
  quadrant/db-acc-descr-empty-block-keeps-line-blank-line] [fixture:
  quadrant/db-acc-descr-empty-block-keeps-line-braces] [fixture:
  quadrant/db-acc-descr-empty-block-keeps-line-line-feed] [fixture:
  quadrant/db-acc-descr-empty-block-keeps-line-space] [fixture:
  quadrant/db-acc-descr-empty-block-keeps-line-tab] [fixture:
  quadrant/db-acc-descr-empty-block-twice-keeps] [fixture:
  quadrant/db-acc-title-then-empty-block] [fixture:
  quadrant/gram-acc-descr-empty-line-after-text]
- An empty block inside a statement is skipped: in a text of an axis or a
  quadrant, in a name, after a point, in a `classDef` line, at the start of a
  statement, and on the header line, where a block with text sets the
  description. The spaces around the block stay in the text. Right after the
  keyword of an axis it leaves a space before the text, and the line is
  rejected, and a block with text inside a statement is a statement of its own,
  which ends the line before it, so the line is rejected. [fixture:
  quadrant/db-empty-block-after-point] [fixture:
  quadrant/db-empty-block-before-statement] [fixture:
  quadrant/div-empty-block-in-classdef] [fixture:
  quadrant/div-empty-block-in-name] [fixture:
  quadrant/div-empty-block-in-quadrant-text] [fixture:
  quadrant/div-empty-block-in-x-axis-text] [fixture:
  quadrant/db-empty-block-on-header-line] [fixture:
  quadrant/gram-empty-block-before-x-axis-text] [fixture:
  quadrant/gram-block-with-text-in-quadrant-text] [fixture:
  quadrant/db-block-on-header-line]
- An empty string is dropped wherever it stands: at the start of a statement or
  on a line of its own, after or before a text, a word, or a name (the spaces
  around it stay and a word is joined), among the styles of a point or a class.
  A statement of nothing but empty strings has no text and is rejected, and so
  is an empty string between the colon and the bracket of a point or inside the
  brackets; in a title it is text. [fixture:
  quadrant/div-empty-string-after-name] [fixture:
  quadrant/div-empty-string-before-name] [fixture:
  quadrant/div-empty-string-before-quadrant-text] [fixture:
  quadrant/div-empty-string-before-statement] [fixture:
  quadrant/div-empty-string-between-words] [fixture:
  quadrant/div-empty-string-in-classdef] [fixture:
  quadrant/div-empty-string-in-point-styles] [fixture:
  quadrant/div-empty-string-in-quadrant-text] [fixture:
  quadrant/db-empty-string-in-title] [fixture:
  quadrant/div-empty-string-inside-word] [fixture:
  quadrant/div-empty-string-line] [fixture:
  quadrant/db-empty-string-title-before-statement-line] [fixture:
  quadrant/gram-empty-string-after-colon] [fixture:
  quadrant/gram-empty-string-in-brackets] [fixture:
  quadrant/gram-empty-string-twice-quadrant]
- Where the word `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment`
  stands in the text, mermaid.js detects a C4 diagram, which rejects the text:
  in a title, an accessibility text, a text of a quadrant, a name in quotes, and
  a class name. `C4Context` is detected only at the start of the text, so a name
  that is `C4Context` is a name. [fixture: quadrant/db-c4-context-in-name]
  [fixture: quadrant/div-c4-keyword-in-acc-title] [fixture:
  quadrant/div-c4-keyword-in-class-name] [fixture:
  quadrant/div-c4-keyword-in-quadrant-text] [fixture:
  quadrant/div-c4-keyword-in-quoted-name] [fixture:
  quadrant/div-c4-keyword-in-title]
- A statement is followed by a CRLF, a CR alone, or the end of the text with no
  line feed. A tab, a U+FEFF, a no-break space, an ideographic space, a U+2028,
  and a U+2029 at the end of the line or of the text are skipped after a title,
  an accessibility text, an axis, and a quadrant, while after a point they are
  read as a style with no name and rejected, a tab after the styles of a point
  being skipped, and after a `classDef` line only a tab is skipped. A tab before
  a statement is skipped, and a U+FEFF before a statement that starts with a
  keyword is rejected, while a point that starts with it holds it in its name,
  trimmed. [fixture: quadrant/db-ends-acc-descr-bom-end] [fixture:
  quadrant/db-ends-acc-descr-bom-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-cr-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-crlf-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-ideographic-end] [fixture:
  quadrant/db-ends-acc-descr-ideographic-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-ls-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-nbsp-end] [fixture:
  quadrant/db-ends-acc-descr-nbsp-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-no-line-feed] [fixture:
  quadrant/db-ends-acc-descr-ps-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-tab-end] [fixture:
  quadrant/db-ends-acc-descr-tab-end-of-text] [fixture:
  quadrant/db-ends-acc-descr-tab-start] [fixture:
  quadrant/db-ends-acc-title-bom-end] [fixture:
  quadrant/db-ends-acc-title-bom-end-of-text] [fixture:
  quadrant/db-ends-acc-title-cr-end-of-text] [fixture:
  quadrant/db-ends-acc-title-crlf-end-of-text] [fixture:
  quadrant/db-ends-acc-title-ideographic-end] [fixture:
  quadrant/db-ends-acc-title-ideographic-end-of-text] [fixture:
  quadrant/db-ends-acc-title-ls-end-of-text] [fixture:
  quadrant/db-ends-acc-title-nbsp-end] [fixture:
  quadrant/db-ends-acc-title-nbsp-end-of-text] [fixture:
  quadrant/db-ends-acc-title-no-line-feed] [fixture:
  quadrant/db-ends-acc-title-ps-end-of-text] [fixture:
  quadrant/db-ends-acc-title-tab-end] [fixture:
  quadrant/db-ends-acc-title-tab-end-of-text] [fixture:
  quadrant/db-ends-acc-title-tab-start] [fixture:
  quadrant/db-ends-classdef-cr-end-of-text] [fixture:
  quadrant/db-ends-classdef-crlf-end-of-text] [fixture:
  quadrant/db-ends-classdef-no-line-feed] [fixture:
  quadrant/db-ends-classdef-tab-end] [fixture:
  quadrant/db-ends-classdef-tab-end-of-text] [fixture:
  quadrant/db-ends-classdef-tab-start] [fixture:
  quadrant/db-ends-point-bom-start] [fixture:
  quadrant/db-ends-point-class-bom-start] [fixture:
  quadrant/db-ends-point-class-cr-end-of-text] [fixture:
  quadrant/db-ends-point-class-crlf-end-of-text] [fixture:
  quadrant/db-ends-point-class-no-line-feed] [fixture:
  quadrant/db-ends-point-class-tab-start] [fixture:
  quadrant/db-ends-point-cr-end-of-text] [fixture:
  quadrant/db-ends-point-crlf-end-of-text] [fixture:
  quadrant/db-ends-point-no-line-feed] [fixture:
  quadrant/db-ends-point-style-bom-start] [fixture:
  quadrant/db-ends-point-style-cr-end-of-text] [fixture:
  quadrant/db-ends-point-style-crlf-end-of-text] [fixture:
  quadrant/db-ends-point-style-no-line-feed] [fixture:
  quadrant/db-ends-point-style-tab-end] [fixture:
  quadrant/db-ends-point-style-tab-end-of-text] [fixture:
  quadrant/db-ends-point-style-tab-start] [fixture:
  quadrant/db-ends-point-tab-start] [fixture: quadrant/db-ends-quadrant-bom-end]
  [fixture: quadrant/db-ends-quadrant-bom-end-of-text] [fixture:
  quadrant/db-ends-quadrant-cr-end-of-text] [fixture:
  quadrant/db-ends-quadrant-crlf-end-of-text] [fixture:
  quadrant/db-ends-quadrant-ideographic-end] [fixture:
  quadrant/db-ends-quadrant-ideographic-end-of-text] [fixture:
  quadrant/db-ends-quadrant-ls-end-of-text] [fixture:
  quadrant/db-ends-quadrant-nbsp-end] [fixture:
  quadrant/db-ends-quadrant-nbsp-end-of-text] [fixture:
  quadrant/db-ends-quadrant-no-line-feed] [fixture:
  quadrant/db-ends-quadrant-ps-end-of-text] [fixture:
  quadrant/db-ends-quadrant-tab-end] [fixture:
  quadrant/db-ends-quadrant-tab-end-of-text] [fixture:
  quadrant/db-ends-quadrant-tab-start] [fixture: quadrant/db-ends-title-bom-end]
  [fixture: quadrant/db-ends-title-bom-end-of-text] [fixture:
  quadrant/db-ends-title-cr-end-of-text] [fixture:
  quadrant/db-ends-title-crlf-end-of-text] [fixture:
  quadrant/db-ends-title-ideographic-end] [fixture:
  quadrant/db-ends-title-ideographic-end-of-text] [fixture:
  quadrant/db-ends-title-ls-end-of-text] [fixture:
  quadrant/db-ends-title-nbsp-end] [fixture:
  quadrant/db-ends-title-nbsp-end-of-text] [fixture:
  quadrant/db-ends-title-no-line-feed] [fixture:
  quadrant/db-ends-title-ps-end-of-text] [fixture:
  quadrant/db-ends-title-tab-end-of-text] [fixture:
  quadrant/db-ends-x-axis-bom-end] [fixture:
  quadrant/db-ends-x-axis-bom-end-of-text] [fixture:
  quadrant/db-ends-x-axis-cr-end-of-text] [fixture:
  quadrant/db-ends-x-axis-crlf-end-of-text] [fixture:
  quadrant/db-ends-x-axis-ideographic-end] [fixture:
  quadrant/db-ends-x-axis-ideographic-end-of-text] [fixture:
  quadrant/db-ends-x-axis-ls-end-of-text] [fixture:
  quadrant/db-ends-x-axis-nbsp-end] [fixture:
  quadrant/db-ends-x-axis-nbsp-end-of-text] [fixture:
  quadrant/db-ends-x-axis-no-line-feed] [fixture:
  quadrant/db-ends-x-axis-ps-end-of-text] [fixture:
  quadrant/db-ends-x-axis-tab-end] [fixture:
  quadrant/db-ends-x-axis-tab-end-of-text] [fixture:
  quadrant/db-ends-x-axis-tab-start] [fixture: quadrant/db-ends-y-axis-bom-end]
  [fixture: quadrant/db-ends-y-axis-bom-end-of-text] [fixture:
  quadrant/db-ends-y-axis-cr-end-of-text] [fixture:
  quadrant/db-ends-y-axis-crlf-end-of-text] [fixture:
  quadrant/db-ends-y-axis-ideographic-end] [fixture:
  quadrant/db-ends-y-axis-ideographic-end-of-text] [fixture:
  quadrant/db-ends-y-axis-ls-end-of-text] [fixture:
  quadrant/db-ends-y-axis-nbsp-end] [fixture:
  quadrant/db-ends-y-axis-nbsp-end-of-text] [fixture:
  quadrant/db-ends-y-axis-no-line-feed] [fixture:
  quadrant/db-ends-y-axis-ps-end-of-text] [fixture:
  quadrant/db-ends-y-axis-tab-end] [fixture:
  quadrant/db-ends-y-axis-tab-end-of-text] [fixture:
  quadrant/db-ends-y-axis-tab-start] [fixture:
  quadrant/gram-ends-acc-descr-bom-start] [fixture:
  quadrant/gram-ends-acc-title-bom-start] [fixture:
  quadrant/gram-ends-classdef-bom-end] [fixture:
  quadrant/gram-ends-classdef-bom-end-of-text] [fixture:
  quadrant/gram-ends-classdef-bom-start] [fixture:
  quadrant/gram-ends-classdef-ideographic-end] [fixture:
  quadrant/gram-ends-classdef-ideographic-end-of-text] [fixture:
  quadrant/gram-ends-classdef-ls-end-of-text] [fixture:
  quadrant/gram-ends-classdef-nbsp-end] [fixture:
  quadrant/gram-ends-classdef-nbsp-end-of-text] [fixture:
  quadrant/gram-ends-classdef-ps-end-of-text] [fixture:
  quadrant/gram-ends-point-bom-end] [fixture:
  quadrant/gram-ends-point-bom-end-of-text] [fixture:
  quadrant/gram-ends-point-class-bom-end] [fixture:
  quadrant/gram-ends-point-class-bom-end-of-text] [fixture:
  quadrant/gram-ends-point-class-ideographic-end] [fixture:
  quadrant/gram-ends-point-class-ideographic-end-of-text] [fixture:
  quadrant/gram-ends-point-class-ls-end-of-text] [fixture:
  quadrant/gram-ends-point-class-nbsp-end] [fixture:
  quadrant/gram-ends-point-class-nbsp-end-of-text] [fixture:
  quadrant/gram-ends-point-class-ps-end-of-text] [fixture:
  quadrant/gram-ends-point-class-tab-end] [fixture:
  quadrant/gram-ends-point-class-tab-end-of-text] [fixture:
  quadrant/gram-ends-point-ideographic-end] [fixture:
  quadrant/gram-ends-point-ideographic-end-of-text] [fixture:
  quadrant/gram-ends-point-ls-end-of-text] [fixture:
  quadrant/gram-ends-point-nbsp-end] [fixture:
  quadrant/gram-ends-point-nbsp-end-of-text] [fixture:
  quadrant/gram-ends-point-ps-end-of-text] [fixture:
  quadrant/gram-ends-point-style-bom-end] [fixture:
  quadrant/gram-ends-point-style-bom-end-of-text] [fixture:
  quadrant/gram-ends-point-style-ideographic-end] [fixture:
  quadrant/gram-ends-point-style-ideographic-end-of-text] [fixture:
  quadrant/gram-ends-point-style-ls-end-of-text] [fixture:
  quadrant/gram-ends-point-style-nbsp-end] [fixture:
  quadrant/gram-ends-point-style-nbsp-end-of-text] [fixture:
  quadrant/gram-ends-point-style-ps-end-of-text] [fixture:
  quadrant/gram-ends-point-tab-end-of-text] [fixture:
  quadrant/gram-ends-quadrant-bom-start] [fixture:
  quadrant/gram-ends-title-bom-start] [fixture:
  quadrant/gram-ends-x-axis-bom-start] [fixture:
  quadrant/gram-ends-y-axis-bom-start]
- A line of nothing but white space stands before the first statement, between
  statements, and at the end of the text when it is spaces and tabs; a line of a
  no-break space, an ideographic space, a U+FEFF, or a U+2028 is a text where no
  statement starts, and the text is rejected. [fixture:
  quadrant/db-whitespace-line-between-spaces-and-tab] [fixture:
  quadrant/db-whitespace-line-between-tab] [fixture:
  quadrant/db-whitespace-line-first-spaces-and-tab] [fixture:
  quadrant/db-whitespace-line-first-tab] [fixture:
  quadrant/db-whitespace-line-last-spaces-and-tab] [fixture:
  quadrant/db-whitespace-line-last-tab] [fixture:
  quadrant/gram-whitespace-line-between-bom] [fixture:
  quadrant/gram-whitespace-line-between-ideographic] [fixture:
  quadrant/gram-whitespace-line-between-ls] [fixture:
  quadrant/gram-whitespace-line-between-nbsp] [fixture:
  quadrant/gram-whitespace-line-first-bom] [fixture:
  quadrant/gram-whitespace-line-first-ideographic] [fixture:
  quadrant/gram-whitespace-line-first-ls] [fixture:
  quadrant/gram-whitespace-line-first-nbsp] [fixture:
  quadrant/gram-whitespace-line-last-bom] [fixture:
  quadrant/gram-whitespace-line-last-ideographic] [fixture:
  quadrant/gram-whitespace-line-last-ls] [fixture:
  quadrant/gram-whitespace-line-last-nbsp]
- A comment, a `;`, or a directive after a statement has the further forms of
  the earlier diagrams: a space and a `;`, two `;`, two `;` with spaces, and two
  directives end every statement as one does, except that `;;` after a
  `classDef` line is rejected. A directive with no closing takes the rest of the
  text, so the lines after it are not read, and a directive that is just
  `%%{init` takes the word at the start of the next line, which joins that
  line's rest to the text (`R U`, `T -1 U`), or to the styles, which are then
  rejected. [fixture: quadrant/db-after-acc-descr-space-semicolon] [fixture:
  quadrant/db-after-acc-title-space-semicolon] [fixture:
  quadrant/db-after-classdef-space-semicolon] [fixture:
  quadrant/db-after-point-class-space-semicolon] [fixture:
  quadrant/db-after-point-space-semicolon] [fixture:
  quadrant/db-after-point-style-space-semicolon] [fixture:
  quadrant/db-after-quadrant-space-semicolon] [fixture:
  quadrant/db-after-title-space-semicolon] [fixture:
  quadrant/db-after-x-axis-space-semicolon] [fixture:
  quadrant/db-after-y-axis-space-semicolon] [fixture:
  quadrant/db-after-acc-descr-double-semicolon] [fixture:
  quadrant/db-after-acc-title-double-semicolon] [fixture:
  quadrant/db-after-point-class-double-semicolon] [fixture:
  quadrant/db-after-point-double-semicolon] [fixture:
  quadrant/db-after-point-style-double-semicolon] [fixture:
  quadrant/db-after-quadrant-double-semicolon] [fixture:
  quadrant/db-after-title-double-semicolon] [fixture:
  quadrant/db-after-x-axis-double-semicolon] [fixture:
  quadrant/db-after-y-axis-double-semicolon] [fixture:
  quadrant/gram-after-classdef-double-semicolon] [fixture:
  quadrant/db-after-acc-descr-spaced-semicolons] [fixture:
  quadrant/db-after-acc-title-spaced-semicolons] [fixture:
  quadrant/db-after-classdef-spaced-semicolons] [fixture:
  quadrant/db-after-point-class-spaced-semicolons] [fixture:
  quadrant/db-after-point-spaced-semicolons] [fixture:
  quadrant/db-after-point-style-spaced-semicolons] [fixture:
  quadrant/db-after-quadrant-spaced-semicolons] [fixture:
  quadrant/db-after-title-spaced-semicolons] [fixture:
  quadrant/db-after-x-axis-spaced-semicolons] [fixture:
  quadrant/db-after-y-axis-spaced-semicolons] [fixture:
  quadrant/db-after-acc-descr-directive-unclosed] [fixture:
  quadrant/db-after-acc-title-directive-unclosed] [fixture:
  quadrant/db-after-classdef-directive-unclosed] [fixture:
  quadrant/db-after-point-class-directive-unclosed] [fixture:
  quadrant/db-after-point-directive-unclosed] [fixture:
  quadrant/db-after-point-style-directive-unclosed] [fixture:
  quadrant/db-after-quadrant-directive-unclosed] [fixture:
  quadrant/db-after-title-directive-unclosed] [fixture:
  quadrant/db-after-x-axis-directive-unclosed] [fixture:
  quadrant/db-after-y-axis-directive-unclosed] [fixture:
  quadrant/db-after-acc-descr-directive-closed-twice] [fixture:
  quadrant/db-after-acc-title-directive-closed-twice] [fixture:
  quadrant/db-after-classdef-directive-closed-twice] [fixture:
  quadrant/db-after-point-class-directive-closed-twice] [fixture:
  quadrant/db-after-point-directive-closed-twice] [fixture:
  quadrant/db-after-point-style-directive-closed-twice] [fixture:
  quadrant/db-after-quadrant-directive-closed-twice] [fixture:
  quadrant/db-after-title-directive-closed-twice] [fixture:
  quadrant/db-after-x-axis-directive-closed-twice] [fixture:
  quadrant/db-after-y-axis-directive-closed-twice] [fixture:
  quadrant/db-after-acc-descr-directive-word-unclosed] [fixture:
  quadrant/db-after-acc-title-directive-word-unclosed] [fixture:
  quadrant/db-after-quadrant-directive-word-unclosed] [fixture:
  quadrant/db-after-title-directive-word-unclosed] [fixture:
  quadrant/db-after-x-axis-directive-word-unclosed] [fixture:
  quadrant/db-after-y-axis-directive-word-unclosed] [fixture:
  quadrant/gram-after-classdef-directive-word-unclosed] [fixture:
  quadrant/gram-after-point-class-directive-word-unclosed] [fixture:
  quadrant/gram-after-point-directive-word-unclosed] [fixture:
  quadrant/gram-after-point-style-directive-word-unclosed]
- A directive that is cut off takes more than its own text: `%%{init` at the
  start of a line takes the word at the start of the next line, which is the
  keyword, and the rest of that line is rejected; so does `%%{init:`, while
  `%%{init: x` takes `x` and leaves the next line, and `%%{ init }%%` with its
  closing is removed. A directive is removed at the start of a title, a text of
  an axis or a quadrant, a name, and the styles of a class, and between a
  keyword and its text. [fixture:
  quadrant/gram-directive-word-unclosed-takes-keyword] [fixture:
  quadrant/gram-directive-colon-unclosed-takes-keyword] [fixture:
  quadrant/db-directive-argument-word-unclosed] [fixture:
  quadrant/db-directive-name-only-closed] [fixture:
  quadrant/db-directive-at-start-of-axis-text] [fixture:
  quadrant/db-directive-at-start-of-classdef-styles] [fixture:
  quadrant/db-directive-at-start-of-name] [fixture:
  quadrant/db-directive-at-start-of-quadrant-text] [fixture:
  quadrant/db-directive-at-start-of-title] [fixture:
  quadrant/db-directive-glued-before-axis-text] [fixture:
  quadrant/db-directive-glued-before-quadrant-text] [fixture:
  quadrant/db-directive-glued-before-title-text] [fixture:
  quadrant/db-directive-glued-after-classdef]
- A comment line and a directive line inside a value that runs over several
  lines are removed as lines of their own: inside a block of a description, a
  text in quotes, a markdown string, the name of a point in quotes, and the
  brackets of a point, the lines before and after them are joined by a line
  feed, a directive line leaving an empty line; a `%%` after a space inside
  quotes is part of the text. [fixture:
  quadrant/db-comment-line-inside-acc-block] [fixture:
  quadrant/db-comment-line-inside-brackets] [fixture:
  quadrant/db-comment-line-inside-markdown] [fixture:
  quadrant/db-comment-line-inside-quoted-axis] [fixture:
  quadrant/db-comment-line-inside-quoted-name] [fixture:
  quadrant/db-comment-line-inside-quoted-text] [fixture:
  quadrant/db-directive-line-inside-brackets] [fixture:
  quadrant/db-directive-inside-quoted-multiline] [fixture:
  quadrant/db-directive-inside-acc-block-line] [fixture:
  quadrant/db-comment-inline-in-quoted-block]
- The numbers that the Db reads from text are only the digits of a radius: `-0`,
  `NaN`, `Infinity`, `1e3`, `0x10`, a number followed by text, a plus sign, an
  underscore, a digit outside ASCII, and fullwidth digits are rejected; a radius
  above the safe integers is the number a double holds, 309 digits that a double
  still holds are a number, and 310 are infinite and the text `Infinity` in the
  summary. A stroke width that is negative or has text after the unit is
  rejected, and `0px` is kept as written. [fixture:
  quadrant/db-radius-above-safe-integer] [fixture:
  quadrant/db-radius-first-infinite] [fixture:
  quadrant/db-radius-largest-finite] [fixture:
  quadrant/gram-radius-arabic-digit] [fixture: quadrant/gram-radius-exponent]
  [fixture: quadrant/gram-radius-fullwidth-digits] [fixture:
  quadrant/gram-radius-hexadecimal] [fixture: quadrant/gram-radius-infinity]
  [fixture: quadrant/gram-radius-nan] [fixture:
  quadrant/gram-radius-negative-zero] [fixture: quadrant/gram-radius-plus]
  [fixture: quadrant/gram-radius-space-text-after-number] [fixture:
  quadrant/gram-radius-text-after-number] [fixture:
  quadrant/gram-radius-underscore] [fixture:
  quadrant/gram-stroke-width-negative] [fixture:
  quadrant/gram-stroke-width-text-after-unit] [fixture:
  quadrant/db-stroke-width-zero]
- A text that ends inside a context that is not closed is rejected where the
  context needs more: a name or a text in quotes with no closing quote, a
  markdown string with no closing, a point cut after the comma or the bracket, a
  class marker or a class name with no point, `accTitle:` and `accDescr:` at the
  end, a block with no closing brace, and `classDef` cut after a colon; an arrow
  at the end is the arrow with no right text, `title` at the end is the empty
  title, and a directive cut at the end takes nothing. [fixture:
  quadrant/db-unclosed-axis-arrow-at-end] [fixture:
  quadrant/db-unclosed-directive-at-end] [fixture:
  quadrant/db-unclosed-title-keyword-at-end] [fixture:
  quadrant/gram-unclosed-acc-block-after-text] [fixture:
  quadrant/gram-unclosed-acc-descr-at-end] [fixture:
  quadrant/gram-unclosed-acc-title-at-end] [fixture:
  quadrant/gram-unclosed-axis-quote-at-end] [fixture:
  quadrant/gram-unclosed-class-marker-at-end] [fixture:
  quadrant/gram-unclosed-class-name-at-end] [fixture:
  quadrant/gram-unclosed-classdef-at-end] [fixture:
  quadrant/gram-unclosed-markdown-at-end] [fixture:
  quadrant/gram-unclosed-name-quote-at-end] [fixture:
  quadrant/gram-unclosed-point-after-comma-at-end] [fixture:
  quadrant/gram-unclosed-quadrant-quote-at-end]

## block

The fields of the summary:

| Field      | Content                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`     | The block that holds the diagram: its `columns`, which is `-1` where the text has no `columns` at its top level, and its `children`, the blocks of the diagram in the order of the text. |
| `unplaced` | The blocks that the Db holds in its table and that no list of children holds.                                                                                                            |
| `edges`    | The edges, in the order of the text.                                                                                                                                                     |
| `classes`  | The classes of `classDef`, in the order of their first definition.                                                                                                                       |

`normalizeBlock()` (`src/normalizers/block.ts`) summarizes the Db of `block`.
The Db is one object that every block diagram shares, with its state in module
variables, and
[`clear()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L197-L209)
resets it before each parse. It reads no browser feature and no time while it
parses. The grammar builds a list of statements, and only when the whole text is
parsed does
[`setHierarchy()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L305-L309)
call
[`populateBlockDatabase()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L105-L192),
which walks the list in the order of the text, one list of children at a time,
and fills the Db: a table of blocks by id, the lists of edges, and the classes.
The summary is read from the Db when that is done.

A block is `{ id, label, type, ... }` with the fields it has, as the Db holds
them. `widthInColumns` is the `:N` of a node, which a node at an end of an edge
does not get; `width` is the width of a `space`; `directions` are the directions
of a block arrow, as the lexer read them; `columns` is the last `columns` inside
a composite; `classes` are the class names that `class` gave it, in the order of
the statements; `styles` are the styles of the last `style` statement for it,
split at each `,`; and a composite has `children`, the blocks of its own list in
the order of the text. The Db makes up an id for a `block` with no id and for
each `space`, with
[`generateId()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDB.ts#L300-L303),
which holds a random part, so the summary has no `id` for such a block, and no
`label` for a `space`, whose label is the id the Db made up. The block that
holds the diagram is `root`, a block like the others but for its `id`.

`root.columns` is `-1` where the text has no `columns` at its top level.
`unplaced` lists the blocks that the Db holds in its table and that no list of
children holds, in the order of the table: the block that `class` made for an id
that no statement had defined yet, or for an id with white space before it that
finds no block (`class A, B c`), which takes the place of the entry of that id
in the table (the later definition of the id takes it, and it stays out of the
diagram), and the blocks inside a composite whose id the Db already had (the Db
keeps the first block of an id and drops the new one, with its list of
children). A block that another listed block holds in its `children` is listed
there only. An edge is
`{ start, end, label, thickness, pattern, arrowTypeStart, arrowTypeEnd }`, with
`directions` where the block at its end is a block arrow, and the edges are in
the order of the text, those inside a composite included. A class is
`{ id, styles }`, with the styles of every `classDef` of that id one after the
other.

It drops the following, each for the reason given:

- `colorIndex` of a composite: the slot of the palette for the renderer, counted
  in the order of the composites.
- `textStyles` of a class: the styles that name a colour, written again for the
  renderer. They follow from the styles.
- `id` and `type` of an edge: the id is the number of the edge between the same
  two ids, with the two ids, and the type is always `edge`.
- `children` of a block that is not a composite and holds none (`[]`), `label`
  of a `space` (the id the Db made up), and the entry that each `space`
  statement makes in the table of blocks (the blocks of its width hold the
  width; `space:0` makes no block).
- The fields `0`, `1`, and `2` of a composite whose `block:` is followed by an
  edge statement: the Db spreads the list of three blocks of the statement into
  the composite, and nothing reads the fields.
- The layout that the renderer fills in (`size`, `intersect`, `node`), which the
  Db does not hold while it parses.
- `getColumns()`, which gives the number of children for a block that has no
  `columns` or has `0`: it follows from the fields that are kept.

The patch of the Db (`patchBlockDb()`) records the ids that `generateId()`
makes, so that the summary can tell them from the ids of the text, and `clear()`
forgets them. It is applied to the Db itself, since there is one Db. The summary
is the same under every `securityLevel` that mermaid.js has and under the
settings of the site, but for the replaced characters of the labels under a
`securityLevel` that is none of its values.

Values of the summary, by field.

- The header is `block-beta` or `block`.
  [The detector](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/block/blockDetector.ts#L6-L6)
  reads any text that starts, after white space, with `block`, in this exact
  case, so `Block-beta`, `BLOCK-BETA`, and `Block` are not detected, and
  `block-Beta` and `block-BETA` are the header `block` followed by text that no
  rule reads. A word character glued to the header makes a node and not the
  header, so `blockx`, `block_beta`, `block2`, `block-betax`, and `block-alpha`
  are rejected, while a character outside ASCII is no word character, so
  `blocké` is the header and the node `é`. A header and nothing else is
  rejected, with or without a line feed. [fixture: block/header-block-beta]
  [fixture: block/header-block] [fixture: block/header-only-block-beta]
  [fixture: block/header-only-block] [fixture:
  block/header-only-block-beta-no-line-break] [fixture:
  block/header-capitalized] [fixture: block/header-upper-case] [fixture:
  block/header-capitalized-block] [fixture: block/header-word-suffix] [fixture:
  block/header-dash-suffix] [fixture: block/header-alpha-suffix] [fixture:
  block/header-underscore-suffix] [fixture: block/header-digit-suffix] [fixture:
  block/header-non-ascii-suffix] [fixture: block/header-beta-capital] [fixture:
  block/header-beta-upper]
- A statement may follow the header on its line, separated by a space or a tab,
  and so may `columns`. A `;` and a `%%` with the text after it are nodes there,
  not a separator or a comment. A second header opens a composite, which `end`
  must close: on a line of its own, after the header line, or as `block`.
  [fixture: block/header-spaced-word-suffix] [fixture:
  block/header-statement-on-header-line] [fixture:
  block/header-statement-on-header-line-tab] [fixture:
  block/header-columns-on-header-line] [fixture: block/header-semicolon]
  [fixture: block/header-semicolon-spaced] [fixture:
  block/header-comment-on-header-line] [fixture: block/header-comment-glued]
  [fixture: block/header-twice] [fixture: block/header-twice-closed] [fixture:
  block/header-twice-same-line] [fixture: block/header-twice-block] [fixture:
  block/header-keyword-header-in-text]
- Spaces, tabs, blank lines, a no-break space, a U+3000, a U+FEFF, and a U+2028
  before the header change nothing, and neither does a frontmatter, a comment
  line, or a directive line, whose title and configuration the summary does not
  keep. A line that starts with `#`, a `;`, or a statement before the header is
  not detected. A line of `%%` alone or `%%{ }%%` before the header is not
  removed, and the lexer reads it as a node before the header: rejected.
  [fixture: block/header-indented] [fixture: block/header-tab-indented]
  [fixture: block/header-blank-lines-before] [fixture: block/header-nbsp-before]
  [fixture: block/header-ideographic-space-before] [fixture:
  block/header-bom-before] [fixture: block/header-ls-before] [fixture:
  block/header-after-comment-line] [fixture: block/header-after-directive-line]
  [fixture: block/header-after-whitespace-line] [fixture:
  block/header-after-frontmatter] [fixture:
  block/header-after-frontmatter-and-comment] [fixture:
  block/header-after-hash-line] [fixture: block/header-after-semicolon-line]
  [fixture: block/header-leading-semicolon] [fixture:
  block/header-statement-first] [fixture: block/div-after-bare-percent-line]
  [fixture: block/div-after-bare-percent-line-and-whitespace-line] [fixture:
  block/div-after-empty-braces-line]
- After the header, spaces and tabs and a no-break space, a U+FEFF, an
  ideographic space, a U+2028, a U+2029, a vertical tab, and a form feed are
  white space, a CR alone and a CRLF end the line, and a directive glued to the
  header is removed. A U+0085 is no white space for the lexer: it joins the id
  after it. [fixture: block/header-trailing-spaces] [fixture:
  block/header-trailing-tab] [fixture: block/header-trailing-nbsp] [fixture:
  block/header-bom-after] [fixture: block/header-ls-after] [fixture:
  block/header-ps-after] [fixture: block/header-nel-after] [fixture:
  block/header-vt-after] [fixture: block/header-ff-after] [fixture:
  block/header-cr] [fixture: block/header-crlf] [fixture:
  block/header-directive-glued]
- `columns N` sets the columns of the block it stands in, the root or a
  composite, and the last `columns` of a block is its columns, wherever in the
  block it stands. The number is read as a decimal number, so `007` is 7, and
  `0` and `00` are 0; `columns auto` is `-1`, the value of a block that has no
  `columns`, and a number of so many digits that the double is infinite is
  recorded as the text `Infinity`. The Db keeps the number as it is: `0` is
  stored as `0`, while `getColumns()` gives the number of children for it.
  [fixture: block/db-columns-plain] [fixture: block/db-columns-auto] [fixture:
  block/db-columns-zero] [fixture: block/db-columns-double-zero] [fixture:
  block/db-columns-leading-zeros] [fixture: block/db-columns-one] [fixture:
  block/db-columns-large] [fixture: block/db-columns-overflow] [fixture:
  block/db-columns-twice] [fixture: block/db-columns-twice-auto-last] [fixture:
  block/db-columns-twice-number-last] [fixture:
  block/db-definitions-columns-three] [fixture: block/db-columns-after-nodes]
  [fixture: block/db-columns-between-nodes] [fixture: block/db-columns-only]
  [fixture: block/db-columns-only-auto] [fixture: block/db-columns-after-block]
  [fixture: block/db-columns-after-end]
- A composite has its own columns, apart from those of the root and of the
  composite around it: `columns` inside a composite with an id, with none, or
  inside a nested one sets the columns of the innermost composite, and a
  composite that holds only `columns` has no children. A `columns` after the id
  of a composite on its line is a statement of the composite. [fixture:
  block/db-columns-in-block] [fixture: block/db-columns-in-block-and-root]
  [fixture: block/db-columns-in-block-auto] [fixture:
  block/db-columns-in-block-only] [fixture: block/db-columns-in-anonymous-block]
  [fixture: block/db-columns-in-nested-block] [fixture:
  block/db-columns-in-block-header-line] [fixture:
  block/db-composite-width-and-columns]
- What is not a number after `columns` does not make one: a sign (`+2`, `-1`), a
  decimal point, an exponent, a hexadecimal prefix, and a digit outside ASCII
  end the number or stop it from starting, and the rest is read as nodes
  (`columns 2.5` is the columns 2 and the node `.5`), while `columns -1` and
  `columns 2:3` are rejected. A word after `columns`, `AUTO`, and `auto2` are
  nodes with `columns` itself a node, and so are `Columns 2`, `COLUMNS 2`,
  `columns2`, and `columnsauto`: the keyword is read in lower case, followed by
  white space. [fixture: block/db-columns-plus] [fixture:
  block/gram-columns-negative] [fixture: block/db-columns-decimal] [fixture:
  block/db-columns-exponent] [fixture: block/db-columns-hexadecimal] [fixture:
  block/db-columns-fullwidth-digit] [fixture: block/db-columns-arabic-digit]
  [fixture: block/gram-columns-colon-number] [fixture:
  block/db-columns-no-number] [fixture: block/db-columns-no-number-last]
  [fixture: block/db-columns-word] [fixture: block/db-columns-auto-upper]
  [fixture: block/db-columns-auto-suffix] [fixture: block/db-columns-auto-glued]
  [fixture: block/db-columns-glued-number] [fixture:
  block/db-columns-upper-case] [fixture: block/db-columns-upper-case-all]
  [fixture: block/db-columns-two-numbers]
- The white space between `columns` and its number is any white space of the
  lexer, a line feed and blank lines included, and a node may follow the number
  on its line. A `;` after the number is a node. The width of a node is kept
  whatever the columns: a wider one than `columns` is not changed. [fixture:
  block/db-columns-tab] [fixture: block/db-columns-line-feed] [fixture:
  block/db-columns-blank-line] [fixture: block/db-columns-nbsp] [fixture:
  block/db-columns-ideographic] [fixture: block/db-columns-ls] [fixture:
  block/db-columns-bom] [fixture: block/db-columns-crlf] [fixture:
  block/db-columns-two-spaces] [fixture: block/db-columns-trailing] [fixture:
  block/db-columns-then-word] [fixture: block/db-columns-semicolon] [fixture:
  block/db-columns-with-width] [fixture: block/db-columns-width-exceeds-zero]
  [fixture: block/db-columns-auto-then-width]
- A word is a node, whose id and label are the word, and a line may hold any
  number of them, separated by white space. The word holds any character but
  white space and `(`, `)`, `[`, `{`, `}`, `<`, `>`, `:`, `=`, and `-`, which
  end it: `_`, `.`, `/`, `,`, `|`, `#`, `&`, `%`, `$`, `*`, `+`, `~`, `^`, `@`,
  `!`, `?`, a backtick, a backslash, a `;`, a quote, a `]`, and any letter, CJK
  character, or emoji are part of an id, `%%` inside a word is part of it, and
  an id may start with a digit, `%`, `#`, `;`, or `_`. Ids keep their case, and
  an id that is used again is the same block, in the place of the first.
  [fixture: block/db-name-two] [fixture: block/db-name-three-lines] [fixture:
  block/db-name-digits] [fixture: block/db-name-digits-and-letters] [fixture:
  block/db-name-underscore] [fixture: block/db-name-underscore-first] [fixture:
  block/db-name-dot] [fixture: block/db-name-slash] [fixture:
  block/db-name-comma] [fixture: block/db-name-pipe] [fixture:
  block/db-name-hash] [fixture: block/db-name-ampersand] [fixture:
  block/db-name-percent] [fixture: block/db-name-percent-percent] [fixture:
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
  block/gram-name-close-paren]
- Tabs, vertical tabs, form feeds, CRs, CRLFs, no-break spaces, U+3000, U+FEFF,
  U+2028, and U+2029 separate two ids, while a U+0085 does not, and joins the
  two words into one id. Spaces after a node, the indentation of a line, blank
  lines, and a missing final line feed change nothing. [fixture:
  block/db-name-tab-between] [fixture: block/db-name-nbsp-between] [fixture:
  block/db-name-ideographic-between] [fixture: block/db-name-bom-between]
  [fixture: block/db-name-ls-between] [fixture: block/db-name-ps-between]
  [fixture: block/db-name-nel-between] [fixture: block/db-name-vt-between]
  [fixture: block/db-name-ff-between] [fixture: block/db-name-cr-between]
  [fixture: block/db-name-crlf-between] [fixture: block/db-name-ls-around]
  [fixture: block/db-name-trailing-spaces] [fixture:
  block/db-name-indented-more] [fixture: block/db-name-blank-lines] [fixture:
  block/db-name-no-final-line-feed]
- `:N` after an id, after a shape, or after the directions of a block arrow is
  the width of the node in columns, and a node with no `:N` has the width 1. The
  number is read as a decimal number, so `:007` is 7 and `:0` is 0, and a number
  of so many digits that the double is infinite is the text `Infinity`. White
  space before the `:`, a line feed included, is allowed. A space after the `:`,
  a `:` with no number, a sign, a letter, a digit outside ASCII, and two widths
  are rejected. What follows a number is read on its own: `A:2.5` is the width 2
  and the node `.5`, and `A:3B`, `A:3,B`, `A:3#`, and `A:3;` are the node A and
  another node. [fixture: block/db-width-plain] [fixture: block/db-width-one]
  [fixture: block/db-width-zero] [fixture: block/db-width-leading-zeros]
  [fixture: block/db-width-large] [fixture: block/db-width-overflow] [fixture:
  block/db-width-space-before] [fixture: block/db-width-tab-before] [fixture:
  block/db-width-line-feed-before] [fixture: block/gram-width-space-after]
  [fixture: block/gram-width-colon-only] [fixture: block/gram-width-negative]
  [fixture: block/db-width-decimal] [fixture: block/gram-width-letters]
  [fixture: block/gram-width-twice] [fixture: block/gram-width-fullwidth-digit]
  [fixture: block/db-width-glued-node] [fixture: block/db-width-comma] [fixture:
  block/db-width-hash] [fixture: block/db-width-semicolon] [fixture:
  block/db-width-on-two-nodes] [fixture: block/db-width-with-label] [fixture:
  block/db-width-label-then-space] [fixture: block/db-width-with-block-arrow]
- A node that is used again keeps the width of its first use, whether that use
  gave a width or not. The node at the start of an edge has no width in the Db,
  and the node at its end cannot have one: the width of the start is lost, and a
  width at the end is rejected, but a node defined before the edge keeps its
  width. [fixture: block/db-width-redefine] [fixture:
  block/db-width-redefine-without] [fixture: block/db-width-redefine-first]
  [fixture: block/db-width-on-edge-source] [fixture:
  block/gram-width-on-edge-target] [fixture: block/db-width-before-edge]
  [fixture: block/db-edge-keeps-width] [fixture:
  block/db-definitions-three-widths]
- A shape after an id gives the node its type, and its text between the quotes
  the label: `[ ]` is `square`, `( )` is `round`, `(( ))` is `circle`, `((( )))`
  is `doublecircle`, `([ ])` is `stadium`, `[[ ]]` is `subroutine`, `[( )]` is
  `cylinder`, `{ }` is `diamond`, `{{ }}` is `hexagon`, `> ]` is
  `rect_left_inv_arrow`, `[/ /]` is `lean_right`, `[\ \]` is `lean_left`,
  `[/ \]` is `trapezoid`, `[\ /]` is `inv_trapezoid`, and `<[ ]>( )` is
  `block_arrow`. A node with no shape has the type `na`. [fixture:
  block/db-shape-square] [fixture: block/db-shape-round] [fixture:
  block/db-shape-circle] [fixture: block/db-shape-doublecircle] [fixture:
  block/db-shape-stadium] [fixture: block/db-shape-subroutine] [fixture:
  block/db-shape-cylinder] [fixture: block/db-shape-diamond] [fixture:
  block/db-shape-hexagon] [fixture: block/db-shape-rect-left-inv-arrow]
  [fixture: block/db-shape-lean-right] [fixture: block/db-shape-lean-left]
  [fixture: block/db-shape-trapezoid] [fixture: block/db-shape-inv-trapezoid]
  [fixture: block/db-shape-block-arrow]
- A pair of opening and closing characters that is none of these has no type:
  the Db gives `na`, and the label stays. This is so for `) (`, `)) ((`,
  `(- -)`, `-) (-`, a mismatched pair such as `( ]`, `[ )`, `> }`, `{ ]`, and
  `(( )`, and an extra `]`. `[| |]` and `[[[ ]]]` are not shapes: rejected. A
  space or a line feed may stand between the id and the shape, and a shape with
  no id is rejected. [fixture: block/db-shape-odd-left] [fixture:
  block/db-shape-odd-double] [fixture: block/db-shape-minus-round] [fixture:
  block/db-shape-minus-reverse] [fixture: block/db-shape-mixed-round-square]
  [fixture: block/db-shape-mixed-square-round] [fixture:
  block/db-shape-mixed-arrow-brace] [fixture: block/db-shape-mixed-brace-square]
  [fixture: block/db-shape-mixed-double] [fixture:
  block/db-shape-mixed-circle-stadium] [fixture: block/db-shape-extra-close]
  [fixture: block/gram-shape-pipe] [fixture: block/gram-shape-triple-square]
  [fixture: block/db-shape-space-before] [fixture:
  block/db-shape-line-feed-before] [fixture: block/gram-shape-shape-only]
  [fixture: block/gram-shape-shape-only-round] [fixture:
  block/db-shape-two-defs-line] [fixture: block/db-shape-no-space-between]
- When a node is defined again, the Db takes the type of the new definition if
  it has one (a shape with no type, or no shape, leaves the type), and the label
  if it differs from the id, but it keeps the first width and the first
  directions, and the node stays in the place of the first. A label that equals
  the id does not replace a label. A third definition meets the second, and a
  use with no shape between two with shapes changes nothing. [fixture:
  block/db-shape-redefine-shape] [fixture: block/db-shape-redefine-to-na]
  [fixture: block/db-shape-redefine-from-na] [fixture:
  block/db-shape-redefine-same-label] [fixture: block/db-shape-redefine-to-odd]
  [fixture: block/db-shape-redefine-width] [fixture:
  block/db-shape-redefine-label-only] [fixture:
  block/db-definitions-three-shapes] [fixture:
  block/db-definitions-three-labels-first-equal] [fixture:
  block/db-definitions-three-na-in-the-middle] [fixture:
  block/db-definitions-three-edge-ends] [fixture:
  block/db-definitions-three-edge-and-node] [fixture:
  block/db-edge-redefine-by-edge] [fixture: block/db-edge-keeps-shape]
- The label is the text between the quotes. It is not empty: `""` is rejected. A
  string of spaces is a label with its spaces, and the spaces around a text
  stay. Single quotes, a text without quotes, and a string that is not closed
  (or a shape that is not) are rejected, and so is a `"` inside a string, with
  or without a backslash before it. The characters other than `"` in a string
  are part of the label: brackets and braces, `<` and `>`, an arrow, `:`, `;`,
  `#`, `%`, `%%`, an apostrophe, a backtick or a backslash, a letter outside
  ASCII, an emoji, keywords such as `end` and `columns 2`, and `__proto__`. A
  string that starts with a backtick (a markdown string) is rejected. [fixture:
  block/db-label-plain] [fixture: block/gram-label-empty] [fixture:
  block/db-label-spaces] [fixture: block/db-label-padded] [fixture:
  block/gram-label-single-quote] [fixture: block/gram-label-unquoted] [fixture:
  block/gram-label-unquoted-space] [fixture: block/gram-label-unclosed]
  [fixture: block/gram-label-unclosed-shape] [fixture:
  block/gram-label-quote-inside] [fixture: block/gram-label-backslash-quote]
  [fixture: block/db-label-backslash] [fixture: block/db-label-escaped-n]
  [fixture: block/db-label-single-quote-inside] [fixture:
  block/gram-label-backtick] [fixture: block/db-label-backtick-inside] [fixture:
  block/gram-label-backtick-start] [fixture: block/db-label-backtick-end]
  [fixture: block/gram-label-markdown] [fixture: block/db-label-round-brackets]
  [fixture: block/db-label-square-brackets] [fixture: block/db-label-braces]
  [fixture: block/db-label-angle] [fixture: block/db-label-arrow] [fixture:
  block/db-label-colon] [fixture: block/db-label-semicolon] [fixture:
  block/db-label-hash] [fixture: block/db-label-percent] [fixture:
  block/db-label-comment] [fixture: block/db-label-non-ascii] [fixture:
  block/db-label-emoji] [fixture: block/db-label-long] [fixture:
  block/db-label-keyword] [fixture: block/db-label-keyword-columns] [fixture:
  block/db-label-proto] [fixture: block/db-label-constructor] [fixture:
  block/db-label-equals-id]
- A line feed, a tab, a U+2028, a U+2029, a no-break space, an ideographic
  space, a U+FEFF, and a U+0085 in a string are part of the label, but a CR
  alone and a CRLF become a line feed. A comment line inside a string is removed
  with its line feed, a directive inside a string is removed, and a directive on
  a line of its own inside a string leaves the line breaks around it. A
  character reference is read as its placeholder, a `#` and digits without a `;`
  are not one, and a `"` that is the quote of an attribute of an HTML tag is
  read as `'`, so it does not end the string. HTML tags, `<br>`, and `&amp;` are
  kept as they are. [fixture: block/db-label-line-feed] [fixture:
  block/db-label-crlf] [fixture: block/db-label-cr] [fixture:
  block/db-label-tab] [fixture: block/db-label-ls] [fixture: block/db-label-ps]
  [fixture: block/db-label-nbsp] [fixture: block/db-label-ideographic] [fixture:
  block/db-label-bom] [fixture: block/db-label-nel] [fixture:
  block/db-label-comment-line] [fixture: block/db-label-comment-line-spaced]
  [fixture: block/db-label-directive] [fixture: block/db-label-directive-line]
  [fixture: block/db-label-entity-numeric] [fixture:
  block/db-label-entity-named] [fixture: block/db-label-entity-no-semicolon]
  [fixture: block/db-label-html-tag] [fixture: block/db-label-html-br] [fixture:
  block/db-label-html-br-slash] [fixture: block/db-label-html-script] [fixture:
  block/db-label-html-attribute] [fixture: block/db-label-html-attribute-double]
  [fixture: block/db-label-ampersand] [fixture: block/db-label-after-string]
  [fixture: block/db-label-after-string-glued] [fixture:
  block/gram-label-string-only] [fixture: block/db-label-string-after-id]
  [fixture: block/gram-label-string-after-space]
- A block arrow `<[ "text" ]>( directions )` has the directions after the `]>`,
  a space or a line feed between them being allowed. A direction is `right`,
  `left`, `up`, `down`, `x`, or `y`, in lower case, separated by commas, and the
  directions are kept in order, one entry for each, also when a direction is
  repeated. The text of a direction holds the white space that follows it:
  `right  ,  down` is `right  ` and `down`, `right down` is `right ` and `down`,
  and `( right)` is ` right`, while the white space after a comma is dropped,
  and a comma before the first direction is dropped too. A space before the
  first direction stays in it when no comma stands before: `( right , down)` is
  `right` with a space before and after it, and `down`. A comment line or a
  directive between the `(` and the first direction is left out of its text,
  which keeps the white space around it. A CR, a directive, and a LF after a
  direction are two line terminators, read as two line feeds, while a CRLF is
  one. A word that is made of directions, such as `rightx`, `xright`, and
  `updown`, is read as the directions in it. An unknown word, upper case, no
  directions, a comma at the end or two in a row, a keyword, a closing without
  `>`, a list that is not closed, and a label without quotes or with none are
  rejected. The label may be a space or `&nbsp;`. [fixture:
  block/db-shape-block-arrow] [fixture: block/db-arrow-left] [fixture:
  block/db-arrow-up] [fixture: block/db-arrow-down] [fixture: block/db-arrow-x]
  [fixture: block/db-arrow-y] [fixture: block/db-arrow-two] [fixture:
  block/db-arrow-all] [fixture: block/db-arrow-no-space] [fixture:
  block/db-arrow-spaces] [fixture: block/db-arrow-spaces-around-comma] [fixture:
  block/db-arrow-spaces-around-first] [fixture:
  block/db-arrow-comment-line-before-first] [fixture:
  block/db-arrow-directive-before-first] [fixture:
  block/db-arrow-cr-directive-lf] [fixture: block/db-arrow-trailing-space]
  [fixture: block/db-arrow-leading-space] [fixture: block/db-arrow-tab]
  [fixture: block/db-arrow-line-feed] [fixture: block/db-arrow-twice] [fixture:
  block/db-arrow-leading-comma] [fixture: block/db-arrow-glued-words] [fixture:
  block/db-arrow-word-suffix] [fixture: block/db-arrow-word-prefix] [fixture:
  block/db-arrow-up-down] [fixture: block/db-arrow-space-before-paren] [fixture:
  block/db-arrow-line-feed-before-paren] [fixture:
  block/gram-arrow-trailing-comma] [fixture: block/gram-arrow-double-comma]
  [fixture: block/gram-arrow-empty] [fixture: block/gram-arrow-unknown]
  [fixture: block/gram-arrow-upper-case] [fixture:
  block/gram-arrow-dir-keywords] [fixture: block/gram-arrow-no-paren] [fixture:
  block/gram-arrow-unclosed-paren] [fixture: block/gram-arrow-unquoted-label]
  [fixture: block/gram-arrow-empty-label] [fixture:
  block/gram-arrow-markdown-label] [fixture: block/gram-arrow-closing-wrong]
  [fixture: block/gram-arrow-closing-square] [fixture:
  block/db-arrow-spaces-label] [fixture: block/db-arrow-nbsp-label] [fixture:
  block/db-arrow-with-width] [fixture: block/db-arrow-two-lines] [fixture:
  block/db-arrow-class] [fixture: block/db-arrow-proto]
- A block arrow defined again keeps its first directions and takes the new
  label, a block arrow given to a node with another shape takes the type
  `block_arrow` and has no directions, and a shape given to a block arrow takes
  the type of the shape and keeps the directions. A block arrow at the end of an
  edge gives the directions to the edge too, while one at its start does not.
  [fixture: block/db-arrow-redefine] [fixture:
  block/db-arrow-redefine-from-square] [fixture:
  block/db-arrow-redefine-to-square] [fixture:
  block/db-definitions-three-arrows] [fixture: block/db-edge-to-block-arrow]
  [fixture: block/db-edge-from-block-arrow] [fixture: block/db-arrow-after-edge]
- `space` is a keyword and not an id: it makes `space` blocks, with the type
  `space` and the width 1, and `space:N` makes N of them, each with the width N,
  which the summary lists as N entries. `space:0` makes none, and the leading
  zeros of the number are read as a decimal number. A space or a colon next to
  the number makes a different text: `space :2` and `space: 2` are rejected,
  `space:` with no number, a sign, a letter, a digit outside ASCII, and two
  widths are rejected, and `space:2.5` is `space:2` and the node `.5`, and
  `space:2A` is `space:2` and the node A. `Space` and `SPACE:2` are nodes. A
  word that holds `space` and a word character is a node (`spaceship`, `space1`,
  `space_a`, `aspace`), while `space.a`, `space;`, and `space#` are a `space`
  block and a node. A `space` cannot start or end an edge, take a shape, or be
  named by a `class` or `style` statement: `class space c` makes a block of the
  id `space` that is not in the diagram. [fixture: block/db-space-plain]
  [fixture: block/db-space-width] [fixture: block/db-space-width-one] [fixture:
  block/db-space-width-zero] [fixture: block/db-space-zero-before-node]
  [fixture: block/db-space-leading-zeros] [fixture:
  block/gram-space-space-before-colon] [fixture:
  block/gram-space-space-after-colon] [fixture: block/gram-space-no-number]
  [fixture: block/gram-space-letters] [fixture: block/gram-space-negative]
  [fixture: block/db-space-decimal] [fixture: block/gram-space-twice-width]
  [fixture: block/gram-space-fullwidth-digit] [fixture:
  block/gram-space-nbsp-colon] [fixture: block/db-space-width-suffix] [fixture:
  block/db-space-upper-case] [fixture: block/db-space-upper-case-all] [fixture:
  block/db-space-suffix] [fixture: block/db-space-digit-suffix] [fixture:
  block/db-space-underscore-suffix] [fixture: block/db-space-prefix] [fixture:
  block/db-space-dot-suffix] [fixture: block/db-space-semicolon] [fixture:
  block/db-space-hash] [fixture: block/gram-space-dash-suffix] [fixture:
  block/gram-space-edge-start] [fixture: block/gram-edge-to-space] [fixture:
  block/gram-space-shape] [fixture: block/gram-space-quoted] [fixture:
  block/db-space-class]
- `space` blocks stand among the other blocks in the order of the text: before,
  between, and after nodes, two in a row, with a width of their own, in a row of
  columns, and inside a composite. [fixture: block/db-space-then-node] [fixture:
  block/db-space-node-then] [fixture: block/db-space-between] [fixture:
  block/db-space-two] [fixture: block/db-space-two-widths] [fixture:
  block/db-space-with-columns] [fixture: block/db-space-in-composite] [fixture:
  block/db-space-in-named-composite] [fixture: block/db-space-label-in-line]
  [fixture: block/db-space-crlf] [fixture: block/db-definitions-space-three]
- `block:G` opens a composite with the id `G`, which `end` closes, and `block`
  or `block-beta` with no id opens one that has no id. A composite has the type
  `composite`, the label `""`, and its `children`, and its id may be followed by
  a width (`block:G:2`) and by a shape with a label (`block:G["text"]`), whose
  label is kept while its shape and its type are not: the type stays
  `composite`. Composites nest to any depth, follow one another, and may stand
  on a line with other statements. A composite with the label of a block arrow
  keeps the directions. [fixture: block/db-composite-plain] [fixture:
  block/db-composite-no-id] [fixture: block/db-composite-no-id-beta] [fixture:
  block/db-composite-width] [fixture: block/db-composite-width-zero] [fixture:
  block/db-composite-label] [fixture: block/db-composite-label-shapes] [fixture:
  block/db-composite-label-and-width] [fixture: block/db-composite-block-arrow]
  [fixture: block/db-composite-nested] [fixture:
  block/db-composite-nested-no-id] [fixture: block/db-composite-nested-three]
  [fixture: block/db-composite-siblings] [fixture:
  block/db-composite-siblings-no-id] [fixture: block/db-composite-end-in-line]
  [fixture: block/db-composite-two-statements-line] [fixture:
  block/db-composite-composite-in-line-with-node] [fixture:
  block/db-composite-many-composites] [fixture: block/db-composite-colors]
  [fixture: block/db-composite-child-width-in] [fixture:
  block/db-composite-columns-id] [fixture: block/db-composite-proto-id]
  [fixture: block/db-composite-constructor-id]
- A composite needs a statement that makes a block, and `end` must close it: an
  empty composite, a composite that is not closed, an `end` with nothing to
  close, an `end` at the start, and an `end` as an id are rejected, while a
  composite that holds only `columns`, `classDef`, `class`, or `style` has no
  children. `end` is read in lower case, and as a word of its own: `END`, `End`,
  `endx`, `end_`, and `end:2` are rejected, and `end.x`, `end#`, `end;`, and
  `end` followed by a node are the keyword and a node. `end` inside a label is
  text, and a directive inside the word `end` is removed. [fixture:
  block/gram-composite-empty] [fixture: block/gram-composite-empty-no-id]
  [fixture: block/gram-composite-not-closed] [fixture:
  block/gram-composite-not-closed-nested] [fixture:
  block/gram-composite-extra-end] [fixture: block/gram-composite-end-first]
  [fixture: block/gram-composite-end-as-id] [fixture:
  block/gram-composite-end-as-node-in-block] [fixture:
  block/db-composite-only-columns] [fixture: block/db-composite-only-class-def]
  [fixture: block/db-composite-only-class] [fixture:
  block/db-composite-only-style] [fixture: block/gram-composite-end-upper-case]
  [fixture: block/gram-composite-end-capital] [fixture:
  block/gram-composite-end-suffix] [fixture:
  block/gram-composite-end-underscore] [fixture: block/gram-composite-end-width]
  [fixture: block/db-composite-end-dot] [fixture: block/db-composite-end-hash]
  [fixture: block/db-composite-end-semicolon] [fixture:
  block/db-composite-end-then-node] [fixture: block/db-composite-end-comment]
  [fixture: block/db-composite-end-in-label] [fixture:
  block/db-composite-end-glued] [fixture: block/db-composite-end-tab] [fixture:
  block/db-composite-end-crlf] [fixture: block/db-composite-end-nbsp] [fixture:
  block/div-directive-inside-end]
- The id after `block:` is a word as an id of a node is, with the white space
  before it allowed: `block: G` is `block:G`. A quoted id, no id, a space before
  the colon, a dash, `Block:G`, and `space` as the id are rejected, while
  `columns` is an id. `blockx`, `block2`, and `block_a` are nodes, and
  `block-a`, `block-betax`, and `blockx:G` are rejected. [fixture:
  block/db-composite-space-after-colon] [fixture:
  block/gram-composite-id-quoted] [fixture:
  block/gram-composite-no-id-after-colon] [fixture:
  block/gram-composite-space-before-colon] [fixture:
  block/gram-composite-id-with-dash] [fixture: block/gram-composite-upper-case]
  [fixture: block/gram-composite-space-id] [fixture: block/db-composite-suffix]
  [fixture: block/db-composite-digit-suffix] [fixture:
  block/db-composite-underscore-suffix] [fixture:
  block/gram-composite-dash-suffix] [fixture: block/gram-composite-beta-suffix]
  [fixture: block/gram-composite-colon-suffix]
- A composite whose id is that of a block the Db already has does not make a new
  block: the old block takes the type `composite` and the label `""`, it keeps
  its place, its width, and no children, and the blocks inside the new composite
  are held apart in `unplaced`. A node with the id of a composite keeps the
  composite, unless it has a shape, which gives the block the shape's type and
  label, and the children stay. A node with the id of its own composite is the
  composite. A node used again inside a composite stays in its first place,
  outside it. [fixture: block/db-composite-id-same-as-node-before] [fixture:
  block/db-composite-id-same-as-node-after] [fixture:
  block/db-composite-id-same-as-node-after-shape] [fixture:
  block/db-composite-id-same-composite] [fixture:
  block/db-composite-id-same-nested] [fixture:
  block/db-composite-id-same-as-child] [fixture:
  block/db-composite-id-same-child-defined-in-inner] [fixture:
  block/db-composite-child-first-then-composite] [fixture:
  block/db-definitions-three-composites] [fixture:
  block/db-definitions-composite-then-shape-then-composite] [fixture:
  block/db-definitions-shape-then-composite-then-shape] [fixture:
  block/db-composite-root-id]
- An edge statement after `block:` is a statement of the composite and not of
  its id: the composite takes the three blocks of the statement as fields and
  has no id, which the summary leaves out. An edge cannot end at a composite
  that is opened on the edge. A `style` on the first or the last node of that
  statement throws in the Db, since the statement makes no block for them, and
  so does a `style` on a node inside the composite that stands before the
  statement that makes it; after it the `style` is accepted. [fixture:
  block/db-composite-edge-header] [fixture:
  block/db-composite-edge-header-width] [fixture:
  block/db-composite-shape-edge-header] [fixture: block/gram-composite-in-edge]
  [fixture: block/gram-style-on-composite-edge-head-start] [fixture:
  block/gram-style-on-composite-edge-head-end] [fixture:
  block/gram-style-in-composite-edge-head-before-child] [fixture:
  block/db-style-on-composite-edge-head-child] [fixture:
  block/db-style-in-composite-edge-head-after-child]
- An edge is a link between two nodes. `-->` is a normal solid edge with an
  arrow at its end (`arrow_point`), `---` has none, `==>` and `===` are thick,
  `-.->` and `-.-` are dotted, `--x` ends with a cross (`arrow_cross`), `--o`
  with a circle (`arrow_circle`), and `<-->` has an arrow at both ends. More
  dashes, equal signs, or dots make the same edge. An edge is `{ start, end }`
  and has the label `""` when it has none. The blocks at its ends are made in
  the order of the text as nodes with no width. `<--` alone, `--` alone, `-`, an
  edge with no start or no end, and an arrow alone are rejected, `~~~` is a
  node, and `A~~~B` is one id. `<~~~` is rejected, with a space or glued: an
  invisible line takes no start marker. `x` and `o` glued before an arrow are
  nodes, so `A x--x B` is the node A and an edge from `x`. The edge needs no
  space around it: `A-->B`, `A--xB`, and `A--oB` are edges, and tabs, several
  spaces, and line feeds around it are white space. [fixture:
  block/db-edge-arrow] [fixture: block/db-edge-open] [fixture:
  block/db-edge-thick] [fixture: block/db-edge-thick-open] [fixture:
  block/db-edge-dotted] [fixture: block/db-edge-dotted-open] [fixture:
  block/db-edge-dotted-long] [fixture: block/db-edge-cross] [fixture:
  block/db-edge-circle] [fixture: block/db-edge-bidirectional] [fixture:
  block/db-edge-long] [fixture: block/db-edge-long-open] [fixture:
  block/db-edge-thick-long] [fixture: block/db-edge-start-cross] [fixture:
  block/db-edge-start-cross-spaced] [fixture: block/db-edge-start-circle]
  [fixture: block/gram-edge-reverse] [fixture: block/gram-edge-two-dashes]
  [fixture: block/gram-edge-one-dash] [fixture: block/db-edge-tilde] [fixture:
  block/db-edge-tilde-glued] [fixture: block/db-edge-glued] [fixture:
  block/db-edge-glued-x] [fixture: block/db-edge-glued-o] [fixture:
  block/db-edge-spaces] [fixture: block/db-edge-tab] [fixture:
  block/db-edge-line-feed-before] [fixture: block/db-edge-line-feed-after]
  [fixture: block/db-edge-line-feed-both] [fixture:
  block/db-edge-blank-line-after] [fixture: block/gram-edge-no-end] [fixture:
  block/gram-edge-no-start] [fixture: block/gram-edge-only-arrow] [fixture:
  block/db-edge-crlf] [fixture: block/db-edge-nbsp] [fixture:
  block/db-edge-ideographic] [fixture: block/db-edge-ls] [fixture:
  block/db-edge-digit] [fixture: block/db-edge-unicode] [fixture:
  block/db-edge-same-line-statements] [fixture: block/db-edge-then-columns]
  [fixture: block/db-edge-spaces-in-id]
- An edge may carry a label, `-- "text" -->`, with `==` for a thick edge and
  `-.` for a dotted one, and the quotes may touch the dashes. The label is a
  string like that of a node: it is not empty, it has no markdown, and a comment
  line, a directive, a character reference, and HTML in it are read as in a
  label. The end of the edge gives its arrows, its thickness, and its pattern,
  whatever the start was, so `-- "t" ==> B` is thick, `-. "t" --> B` is solid,
  and `<-- "t" -->` has no arrow at the start. A label with no end of the edge,
  a label without quotes, and a start followed by a wrong end are rejected.
  `-->|text|` is no label: `|text|` is the node at the end of the edge, and B is
  another node. [fixture: block/db-edge-label] [fixture:
  block/db-edge-label-open] [fixture: block/db-edge-label-thick] [fixture:
  block/db-edge-label-dotted] [fixture: block/db-edge-label-glued] [fixture:
  block/gram-edge-label-empty] [fixture: block/db-edge-label-spaces] [fixture:
  block/gram-edge-label-unquoted] [fixture: block/db-edge-label-pipe] [fixture:
  block/db-edge-label-pipe-spaced] [fixture: block/gram-edge-label-markdown]
  [fixture: block/db-edge-label-line-feed] [fixture:
  block/db-edge-label-comment-line] [fixture: block/db-edge-label-directive]
  [fixture: block/db-edge-label-html] [fixture: block/db-edge-label-entity]
  [fixture: block/gram-edge-label-start-without-end] [fixture:
  block/gram-edge-label-wrong-end] [fixture: block/db-edge-label-mismatched]
  [fixture: block/db-edge-label-mismatched-dotted] [fixture:
  block/db-edge-label-cross] [fixture: block/db-edge-label-bidirectional]
  [fixture: block/db-edge-label-start-cross]
- Edges are listed in the order of the text, those inside a composite at the
  place of the composite, and the same edge twice is two edges. An edge may join
  nodes of two composites, a composite and a node, a node and itself, and the
  ids `__proto__`, `constructor`, and `root`. The blocks at its ends keep what
  an earlier definition gave them (shape, label, width), and a shape at either
  end defines the block as a node does. `A --> end`, `A --> space`, and
  `A --> block:G` are rejected, while `A --> columns` is an edge to a node named
  `columns`. [fixture: block/db-edge-twice] [fixture: block/db-edge-opposite]
  [fixture: block/db-edge-self] [fixture: block/db-edge-different-kinds]
  [fixture: block/db-edge-defined-before] [fixture: block/db-edge-new-shape]
  [fixture: block/db-edge-start-shape] [fixture: block/db-edge-both-shapes]
  [fixture: block/db-edge-to-composite] [fixture:
  block/db-edge-from-composite-child] [fixture: block/db-edge-inside-composite]
  [fixture: block/db-edge-across-composites] [fixture:
  block/db-edge-edge-in-composite-order] [fixture: block/db-edge-proto]
  [fixture: block/db-edge-root] [fixture: block/db-edge-to-columns] [fixture:
  block/gram-edge-to-end] [fixture: block/gram-edge-start-lt-invisible]
  [fixture: block/gram-edge-start-lt-invisible-glued] [fixture:
  block/db-definitions-edges-three] [fixture: block/db-proto-proto-edge]
  [fixture: block/db-proto-root-edge-end]
- A chain of edges, `A --> B --> C`, is read badly: the grammar takes the first
  edge as the start of the next, which has no `id`, so the Db keeps a block with
  no field, no start for the edge, and only the last node `C`. The nodes before
  it are lost, with the edges between them. The label and the arrows of the last
  edge are kept, two chains give one block with no field, and a node used after
  a chain is a block of its own. A `style` on the middle of a chain throws, too.
  The summary shows the block as `{}` and the edge with no `start`. [fixture:
  block/db-edge-chain] [fixture: block/db-edge-chain-open] [fixture:
  block/db-edge-chain-four] [fixture: block/db-edge-chain-labels] [fixture:
  block/db-edge-chain-twice] [fixture: block/db-edge-chain-then-node] [fixture:
  block/db-edge-chain-in-block] [fixture: block/gram-style-on-chain] [fixture:
  block/gram-style-on-chain-middle] [fixture:
  block/db-style-on-undefined-chain-end]
- `classDef name styles` defines a class: the name is one or more word
  characters (ASCII letters, digits, and `_`), and the styles are the rest of
  the line, split at each `,`, each trimmed. `default`, `class`, `end`,
  `__proto__`, and `constructor` are names like another, while `DEFAULT`, a name
  with `-` or `:`, or with a letter outside ASCII, is rejected, and so are a
  `classDef` with no name or no styles, in another case, or glued to a word. The
  keyword may be followed by tabs and line feeds, and the styles may start on
  the next line. A `,` at the end or at the start leaves an empty style. A class
  defined again, at any distance, keeps the styles of every definition in order,
  and keeps its place in the order of the classes; the same style twice is kept
  twice. A class is the same for the whole diagram, wherever its `classDef`
  stands, also in a composite. [fixture: block/db-class-def-and-apply] [fixture:
  block/db-class-def-two-styles] [fixture:
  block/db-class-def-spaces-around-styles] [fixture:
  block/db-class-def-directive-before-comma] [fixture:
  block/db-class-def-empty-style] [fixture: block/db-class-def-leading-comma]
  [fixture: block/gram-class-def-no-style] [fixture:
  block/gram-class-def-spaces-only] [fixture: block/gram-class-def-no-name]
  [fixture: block/db-class-def-twice] [fixture: block/db-class-def-twice-same]
  [fixture: block/db-class-def-three] [fixture: block/db-class-def-color]
  [fixture: block/db-class-def-color-fill] [fixture: block/db-class-def-default]
  [fixture: block/gram-class-def-default-upper] [fixture:
  block/db-class-def-digits] [fixture: block/db-class-def-underscore] [fixture:
  block/gram-class-def-dash] [fixture: block/gram-class-def-non-ascii] [fixture:
  block/db-class-def-proto] [fixture: block/db-class-def-constructor] [fixture:
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
  [fixture: block/db-proto-constructor-class-def]
- In the styles of a `classDef`, a `#`, quotes, HTML, and `%%` are text, a
  directive is removed, and a character reference is read as its placeholder.
  The Db removes the first `;` of each style. The line rule of mermaid.js, which
  drops the last `;` of a line that has a `:` and a `#` (`style:#x;y` becomes
  `style:#xy`), acts on the line before the lexer reads it, so the `;` at the
  end of `fill:#f00;` is gone, the `;` between two styles joins them,
  `fill:#f00;,stroke:#000` stays two styles, a space and a `;` at the end are
  dropped, and a second `;` after `#f00` is read as the end of a character
  reference. [fixture: block/db-class-def-semicolon-end] [fixture:
  block/db-class-def-semicolon-middle] [fixture:
  block/db-class-def-semicolon-comma] [fixture:
  block/db-class-def-two-semicolons] [fixture:
  block/db-class-def-space-semicolon] [fixture: block/db-class-def-hash]
  [fixture: block/db-class-def-comment] [fixture: block/db-class-def-directive]
  [fixture: block/db-class-def-quotes] [fixture: block/db-class-def-html]
  [fixture: block/db-class-def-entity] [fixture:
  block/db-class-def-colon-hash-semicolon] [fixture: block/db-class-def-nbsp]
  [fixture: block/db-semicolon-in-class-def] [fixture:
  block/db-semicolon-class-def-then-node]
- `class ids name` applies a class to the nodes of the ids, which are one or
  more word characters, split at each `,` with no space before the comma: the
  class name is kept in the `classes` of each node, in the order of the
  statements, also when it repeats, and also when no `classDef` defines it, and
  the rest of the line, trimmed, is the class name as one text, so `c,d` and
  `c d` are one name, a name may hold `;`, `#`, and `%%`, and a `class A` with
  no name gives the empty name. The ids and the name are read on the same line,
  and the keyword may be followed by tabs and line feeds; in another case, or
  glued to a word, it is not the keyword, and `class` alone is rejected. A name
  that is `__proto__` or `constructor` is a name like another. [fixture:
  block/db-class-apply-two] [fixture: block/db-class-apply-same-twice] [fixture:
  block/db-class-apply-names-list] [fixture: block/db-class-apply-names-spaces]
  [fixture: block/db-class-apply-no-name] [fixture:
  block/db-class-apply-no-name-spaces] [fixture: block/gram-class-apply-no-id]
  [fixture: block/db-class-apply-name-upper] [fixture:
  block/db-class-apply-proto-class] [fixture:
  block/db-class-apply-constructor-class] [fixture:
  block/db-class-apply-semicolon] [fixture: block/db-class-apply-hash] [fixture:
  block/db-class-apply-comment] [fixture: block/db-class-apply-directive]
  [fixture: block/db-class-apply-trailing-spaces] [fixture:
  block/db-class-apply-nbsp] [fixture: block/db-class-apply-tab] [fixture:
  block/db-class-apply-line-feed-after-keyword] [fixture:
  block/db-class-apply-line-feed-after-ids] [fixture:
  block/db-class-apply-upper-case-keyword] [fixture: block/db-class-apply-glued]
  [fixture: block/db-class-apply-lower-keyword-id] [fixture:
  block/db-class-apply-space-shape] [fixture: block/db-class-apply-edge]
  [fixture: block/db-definitions-class-three] [fixture:
  block/db-definitions-class-three-ids] [fixture:
  block/db-proto-to-string-class] [fixture: block/db-proto-proto-directions]
- The ids of a `class` statement are split at each comma and looked up as they
  are, with no trimming: `class A,B c` and `class A,B,C c` apply the class to
  each, while `class A, B c` looks up ` B`, finds no block, and makes a new
  block with the id `B`, which takes the place of the entry `B` of the table and
  is not in the diagram: the B of the diagram gets no class, and a later
  `style B` or shape for `B` finds the new block. A space before the comma ends
  the ids: `class A ,B c` applies the class `,B c` to A. A `;` or a `-` in an id
  ends it. An id of another case is another id. A line feed may follow the comma
  as a space does, and a `class` with no ids before the end of the text is
  rejected. A comment line or a directive after the comma is left out of the id,
  which keeps the white space before it. The id `root` is the block that holds
  the diagram, and a class on a composite or on a node inside a composite is
  kept there, also from a statement inside another composite. [fixture:
  block/db-class-apply-list] [fixture: block/db-class-apply-list-spaces]
  [fixture: block/db-class-apply-list-space-before-comma] [fixture:
  block/db-class-apply-list-three] [fixture:
  block/db-class-apply-list-trailing-comma] [fixture:
  block/db-class-apply-list-spaces-then-style] [fixture:
  block/db-class-apply-list-spaces-then-edge] [fixture:
  block/db-class-apply-list-spaces-then-shape] [fixture:
  block/gram-class-apply-no-id-end] [fixture:
  block/db-class-apply-line-feed-after-comma] [fixture:
  block/db-class-apply-comment-line-after-comma] [fixture:
  block/db-class-apply-directive-after-comma] [fixture:
  block/db-class-apply-id-semicolon] [fixture: block/db-class-apply-id-dash]
  [fixture: block/db-class-apply-id-case] [fixture:
  block/db-class-apply-proto-id] [fixture: block/db-class-apply-root] [fixture:
  block/db-composite-class-on] [fixture: block/db-composite-class-inside]
  [fixture: block/db-class-apply-in-block] [fixture:
  block/db-class-apply-in-block-outer]
- A `class` statement for an id that no statement has defined yet makes a block
  of that id with the type `na`, which the summary lists in `unplaced`: the
  later definition of the id (a node, a shape, an edge, or a composite) does not
  add the block to its list of children, and only changes its type and its
  label, so the node stays out of the diagram, and its width is lost. Two
  classes on such an id are kept in order, and a `class` for two such ids makes
  two blocks, in the order of the ids. A `class` for a node defined before it is
  in the diagram, also inside a composite, while a `class` inside a composite
  for a node defined after it makes a block that stays out. [fixture:
  block/db-class-apply-undefined-id] [fixture: block/db-class-apply-before-node]
  [fixture: block/db-class-apply-before-node-shape] [fixture:
  block/db-class-apply-before-node-width] [fixture:
  block/db-class-apply-before-edge] [fixture: block/db-class-apply-before-block]
  [fixture: block/db-class-apply-undefined-twice] [fixture:
  block/db-class-apply-undefined-list] [fixture:
  block/db-class-apply-mixed-list] [fixture:
  block/db-class-apply-in-block-later] [fixture:
  block/db-definitions-composite-then-shape-then-composite]
- `style id styles` sets the styles of the node `id`: the styles are the rest of
  the line, split at each `,` and not trimmed, so the spaces around a comma stay
  in the styles, and a style that starts with a space is another style for the
  renderer than one that starts with `color:`
  ([`getStylesFromArray()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L443-L459)).
  A `style` replaces the styles of an earlier `style` for the node, a `style`
  with no styles or with spaces only changes nothing, and a `,` alone gives two
  empty styles. The white space at the two ends of the rest of the line is
  dropped, so that a part before the first `,` or after the last `,` that is
  white space only is empty, while a part between two `,` that is white space
  only is a style of that white space, which `classDef` trims to an empty style.
  A directive before a `,` is left out of the style, which keeps the white space
  on both sides of it. The id is one or more word characters, and a `style` for
  an id that no earlier statement defined is rejected: the Db finds no block,
  and throws a `TypeError`. That is so for a list of ids, which the Db does not
  split at the comma, for a block that no statement defines, for the id of a
  block lost in a chain, and for `space`. A `style` for a block that a `class`
  made, for a composite, for the id `root`, and from inside a composite for a
  node outside it is accepted. The keyword may be followed by tabs and line
  feeds, and the styles must be on the line of the id; in upper case or glued to
  a word it is not the keyword. A `style` with no id before the end of the text
  is rejected. [fixture: block/db-style-plain] [fixture: block/db-style-two]
  [fixture: block/db-style-spaces] [fixture: block/db-style-spaces-at-line-ends]
  [fixture: block/db-style-whitespace-only-between-commas] [fixture:
  block/db-style-tab-only-between-commas] [fixture:
  block/db-style-whitespace-only-first] [fixture:
  block/db-style-whitespace-only-last] [fixture:
  block/db-style-directive-before-comma] [fixture:
  block/db-class-def-whitespace-only-between-commas] [fixture:
  block/db-style-leading-space] [fixture: block/db-style-trailing-space]
  [fixture: block/db-style-none] [fixture: block/db-style-spaces-only] [fixture:
  block/db-style-only-comma] [fixture: block/db-style-twice] [fixture:
  block/db-style-then-none] [fixture: block/db-definitions-style-three]
  [fixture: block/db-definitions-style-three-empty-middle] [fixture:
  block/gram-style-undefined] [fixture: block/gram-style-defined-after]
  [fixture: block/gram-style-list] [fixture: block/gram-style-list-spaces]
  [fixture: block/gram-style-list-undefined] [fixture: block/gram-style-space]
  [fixture: block/gram-style-no-id] [fixture: block/gram-style-no-id-line-feed]
  [fixture: block/db-style-class-made] [fixture:
  block/db-style-after-class-undefined] [fixture:
  block/db-style-after-class-list-spaces] [fixture: block/db-style-composite]
  [fixture: block/db-style-root] [fixture: block/db-style-in-composite]
  [fixture: block/db-composite-style-on] [fixture:
  block/db-composite-style-inside] [fixture:
  block/db-composite-style-outer-inside] [fixture:
  block/gram-composite-style-later-outer] [fixture: block/db-style-before-edge]
  [fixture: block/db-style-proto-id] [fixture: block/db-style-constructor-id]
  [fixture: block/db-proto-proto-style-id] [fixture: block/db-style-name-only]
  [fixture: block/db-style-tab] [fixture:
  block/db-style-line-feed-after-keyword] [fixture:
  block/gram-style-line-feed-after-id] [fixture: block/gram-style-upper-case]
  [fixture: block/gram-style-glued]
- In the styles of a `style`, a `#` with a word, quotes, HTML, and `%%` are
  text, a directive is removed, and a character reference is read as its
  placeholder. The line rule drops the last `;` of the line that has a `:` and a
  `#`, so `fill:#f00;` is `fill:#f00`, `fill:#f00;stroke:#333` is one style,
  `fill:#f00;,stroke:#333` is two, a space and a `;` at the end are dropped, and
  a line with no `#` keeps its `;`. [fixture: block/db-style-semicolon-end]
  [fixture: block/db-style-semicolon-middle] [fixture:
  block/db-style-semicolon-comma] [fixture: block/db-style-empty-style]
  [fixture: block/db-style-line-rule-hash] [fixture: block/db-style-entity]
  [fixture: block/db-style-comment] [fixture: block/db-style-directive]
  [fixture: block/db-style-quotes] [fixture: block/db-style-nbsp] [fixture:
  block/db-semicolon-in-style]
- The id `root` is the id of the block that holds the diagram, so a statement
  for that id acts on it. A node `root`, with a width, or inside a composite
  changes nothing; `root["x"]` gives the block that holds the diagram the label
  `x` and the type of the shape, and it keeps its `columns` and its children;
  `block:root` gives it the label `""` and holds the blocks of the composite
  apart in `unplaced`; `class root c` gives it the class, `style root` the
  styles; and an edge may start or end at `root`. [fixture: block/db-proto-root]
  [fixture: block/db-proto-root-twice] [fixture: block/db-proto-root-width]
  [fixture: block/db-proto-root-label] [fixture: block/db-proto-root-columns]
  [fixture: block/db-proto-root-composite-child] [fixture:
  block/db-composite-root-id] [fixture: block/db-class-apply-root] [fixture:
  block/db-proto-root-style] [fixture: block/db-edge-root] [fixture:
  block/db-proto-root-edge-end]
- The names of `Object.prototype` are ids like any other: `__proto__`,
  `constructor`, `toString`, `hasOwnProperty`, and `valueOf` as the id of a
  node, with a shape, a width, or a class, as the id of a composite, as an end
  of an edge, in a label, as the name of a class and the name in `class`, and in
  a `style`. The Db keeps its blocks and classes in `Map`s, so none of them acts
  on a prototype. [fixture: block/db-proto-proto] [fixture:
  block/db-proto-constructor] [fixture: block/db-proto-to-string] [fixture:
  block/db-proto-has-own-property] [fixture: block/db-proto-value-of] [fixture:
  block/db-proto-proto-twice] [fixture: block/db-proto-proto-shape] [fixture:
  block/db-proto-proto-width] [fixture: block/db-proto-proto-composite-child]
  [fixture: block/db-proto-proto-edge-label] [fixture:
  block/db-proto-proto-undefined-class] [fixture: block/db-label-proto]
  [fixture: block/db-label-constructor] [fixture: block/db-composite-proto-id]
  [fixture: block/db-composite-constructor-id] [fixture: block/db-arrow-proto]
  [fixture: block/db-class-apply-proto-id] [fixture:
  block/db-class-apply-proto-class] [fixture:
  block/db-class-apply-constructor-class] [fixture: block/db-style-proto-id]
  [fixture: block/db-style-constructor-id] [fixture: block/db-class-def-proto]
  [fixture: block/db-class-def-constructor] [fixture: block/db-edge-proto]
- A comment line starts, after white space of any kind (a U+FEFF, a no-break
  space, an ideographic space, and a U+2028 included), with `%%` and at least
  one character after it, and it is removed with its line feed wherever it
  stands: before and after the header, at the end of the text, inside a
  composite, between the parts of an edge or of a statement, and inside a
  string. It ends at a line feed, a CRLF, or a CR; a U+2028, a U+2029, and a
  U+0085 do not end it. `%%` alone, `%` and a word, and `#` and a word are not
  comments: they are nodes. What a comment line holds is not read: quotes,
  arrows, and keywords in it do nothing. [fixture: block/db-comment-line]
  [fixture: block/db-comment-line-indented] [fixture: block/db-comment-line-tab]
  [fixture: block/db-comment-line-glued] [fixture: block/db-comment-line-bare]
  [fixture: block/db-comment-line-bare-spaces] [fixture:
  block/db-comment-line-single-percent] [fixture: block/db-comment-line-hash]
  [fixture: block/db-comment-line-triple] [fixture: block/db-comment-line-first]
  [fixture: block/db-comment-line-last] [fixture:
  block/db-comment-line-last-no-line-feed] [fixture:
  block/gram-comment-line-only] [fixture: block/db-comment-lines-two] [fixture:
  block/db-comment-before-header-and-after] [fixture:
  block/db-comment-inside-composite] [fixture:
  block/db-comment-between-composite-lines] [fixture:
  block/db-comment-between-edge-parts] [fixture:
  block/db-comment-between-id-and-width] [fixture: block/db-comment-crlf]
  [fixture: block/db-comment-cr] [fixture: block/db-comment-ls-inside] [fixture:
  block/db-comment-ps-inside] [fixture: block/db-comment-nel-inside] [fixture:
  block/db-comment-bom-before] [fixture: block/db-comment-nbsp-before] [fixture:
  block/db-comment-ideographic-before] [fixture: block/db-comment-ls-before]
  [fixture: block/db-comment-directive-like] [fixture: block/db-comment-proto]
  [fixture: block/db-comment-long] [fixture: block/db-comment-unicode] [fixture:
  block/db-comment-markers-inside] [fixture:
  block/db-comment-quote-unclosed-inside] [fixture: block/db-label-comment-line]
  [fixture: block/db-label-comment-line-spaced] [fixture:
  block/db-edge-label-comment-line]
- A `%%` that does not start a line is not a comment: after a node, an edge,
  `columns`, or `end` it is a node, with the text after it, glued to a word it
  is part of the id, and inside a string it is part of the label. After `class`
  and `style` and in `classDef` it is part of the class name or the styles.
  [fixture: block/db-comment-after-node] [fixture:
  block/db-comment-after-node-glued] [fixture: block/db-comment-after-edge]
  [fixture: block/db-comment-after-columns] [fixture:
  block/db-composite-end-comment] [fixture:
  block/db-comment-inside-string-start] [fixture: block/db-label-comment]
  [fixture: block/db-comment-after-style] [fixture:
  block/db-class-apply-comment] [fixture: block/db-class-def-comment] [fixture:
  block/db-style-comment] [fixture: block/db-name-percent-percent] [fixture:
  block/db-tail-node-comment] [fixture: block/db-tail-columns-comment] [fixture:
  block/db-tail-space-comment] [fixture: block/db-tail-class-comment] [fixture:
  block/db-tail-class-def-comment] [fixture: block/db-tail-style-comment]
- A `;` is not a separator, and a `#` starts no comment: a `;` is part of the id
  it touches, a node of its own after a space, a shape, a width, a block arrow,
  `columns`, `space`, or `end`, and part of a class name or a style, and so is a
  `#`. The statements that take the rest of their line (`class`, `style`,
  `classDef`) keep what follows them on the line: a space and a `;`, two `;`, a
  `%%`, and a `#` are part of the class name or the styles, apart from the `;`
  that the line rule or the Db removes. The line rule drops that `;` also inside
  an id or a keyword: `A["style:#a"] B;C` has the id `BC`, and
  `A["style:#a"] col;umns 2` is `columns 2`. [fixture:
  block/db-semicolon-after-node] [fixture: block/db-semicolon-between] [fixture:
  block/db-semicolon-space-before] [fixture: block/db-semicolon-alone] [fixture:
  block/db-semicolon-double] [fixture: block/db-semicolon-after-width] [fixture:
  block/db-semicolon-after-shape] [fixture: block/db-semicolon-after-edge]
  [fixture: block/db-semicolon-separates-statements-line] [fixture:
  block/db-tail-node-semicolon] [fixture: block/div-ignored-semicolon-in-id]
  [fixture: block/div-ignored-semicolon-in-keyword] [fixture:
  block/db-tail-node-space-semicolon] [fixture: block/db-tail-node-hash]
  [fixture: block/db-tail-node-shape-space-semicolon] [fixture:
  block/db-tail-node-shape-two-semicolons] [fixture:
  block/db-tail-node-width-space-semicolon] [fixture:
  block/db-tail-node-width-two-semicolons] [fixture:
  block/db-tail-edge-space-semicolon] [fixture:
  block/db-tail-edge-two-semicolons] [fixture: block/db-tail-edge-hash]
  [fixture: block/db-tail-block-arrow-semicolon] [fixture:
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
  block/db-tail-class-def-two-semicolons] [fixture:
  block/db-tail-class-def-hash] [fixture:
  block/db-tail-composite-end-space-semicolon] [fixture:
  block/db-tail-composite-end-two-semicolons] [fixture:
  block/db-tail-composite-end-hash] [fixture:
  block/db-tail-composite-end-keyword-semicolon] [fixture:
  block/db-tail-composite-end-keyword-hash] [fixture:
  block/gram-tail-composite-line-semicolon]
- A directive `%%{...}%%` is removed wherever it stands, and the pieces on its
  two sides join: inside an id, a string, the header, and the keywords
  `columns`, `class`, and `end`, a direction of a block arrow, between an id and
  its width or its shape, between `:` or `space:` and the number of a width,
  around the label of a shape or of a block arrow, and at the end of a
  statement. A directive of any name is removed, over several lines too, and so
  are two in a row. `%%{}%%`, which names no word, is no directive, and its text
  cannot be read: rejected. A directive that is not closed takes the rest of the
  text with it: at the end of the text it takes nothing else, and before a
  statement it leaves no statement in the diagram, which is rejected. A
  directive on a line of its own inside a string leaves the line breaks around
  it. A text of only a directive after the header is rejected. [fixture:
  block/db-directive-init-line] [fixture: block/db-directive-init-before-header]
  [fixture: block/db-directive-init-block-config] [fixture:
  block/db-directive-wrap] [fixture: block/db-directive-not-init] [fixture:
  block/db-directive-multi-line] [fixture: block/db-directive-two] [fixture:
  block/div-directive-in-id] [fixture: block/db-directive-between-ids] [fixture:
  block/db-directive-at-end-of-line] [fixture: block/db-directive-inside-string]
  [fixture: block/div-directive-inside-keyword] [fixture:
  block/div-directive-inside-class-keyword] [fixture:
  block/div-directive-inside-header] [fixture:
  block/div-directive-inside-direction] [fixture:
  block/db-directive-inside-shape] [fixture:
  block/db-directive-after-shape-label] [fixture:
  block/db-directive-before-block-arrow-label] [fixture:
  block/db-directive-after-block-arrow-label] [fixture:
  block/db-directive-between-colon-and-width] [fixture:
  block/db-directive-between-space-colon-and-width] [fixture:
  block/db-directive-glued-to-id] [fixture: block/db-directive-glued-to-width]
  [fixture: block/db-directive-glued-to-edge] [fixture:
  block/db-directive-line-feed-inside-id] [fixture:
  block/db-directive-spaces-around] [fixture: block/db-directive-class-def-line]
  [fixture: block/db-directive-after-end-of-text] [fixture:
  block/gram-directive-unclosed] [fixture:
  block/db-directive-unclosed-end-of-text] [fixture:
  block/gram-directive-unclosed-word-next-line] [fixture:
  block/gram-directive-empty] [fixture: block/gram-directive-only] [fixture:
  block/db-label-directive] [fixture: block/db-label-directive-line] [fixture:
  block/db-edge-label-directive] [fixture: block/db-tail-node-directive]
  [fixture: block/db-tail-node-directive-unclosed] [fixture:
  block/db-tail-node-shape-directive] [fixture:
  block/db-tail-node-width-directive] [fixture: block/db-tail-edge-directive]
  [fixture: block/db-tail-edge-label-directive] [fixture:
  block/db-tail-block-arrow-directive] [fixture:
  block/db-tail-columns-directive] [fixture: block/db-tail-space-directive]
  [fixture: block/db-tail-class-directive] [fixture:
  block/db-tail-style-directive] [fixture:
  block/db-tail-class-def-directive-unclosed] [fixture:
  block/db-tail-composite-end-directive] [fixture:
  block/db-tail-composite-end-keyword-directive]
- A frontmatter before the header is removed: its `title` is not kept, since the
  Db has no title, and its configuration, `block` included, changes nothing in
  the summary. A frontmatter that is empty, not closed, indented, after a
  comment, or after the header is no frontmatter, and the text is rejected.
  [fixture: block/db-frontmatter-config-block] [fixture:
  block/db-frontmatter-look] [fixture: block/db-frontmatter-html-in-title]
  [fixture: block/db-frontmatter-crlf] [fixture: block/header-after-frontmatter]
  [fixture: block/header-after-frontmatter-and-comment] [fixture:
  block/gram-frontmatter-empty] [fixture: block/gram-frontmatter-unclosed]
  [fixture: block/gram-frontmatter-indented] [fixture:
  block/gram-frontmatter-comment-before] [fixture:
  block/gram-frontmatter-after-header]
- `accTitle:`, `accDescr:`, and `accDescr {` are not statements of a block
  diagram: the lexer reads them as keywords for which the grammar has no rule,
  and the text is rejected. `accTitle` alone is a node, `title t` is the nodes
  `title` and `t`, and `title: t` is rejected. [fixture:
  block/gram-acc-acc-title] [fixture: block/gram-acc-acc-descr] [fixture:
  block/gram-acc-acc-descr-block] [fixture: block/db-acc-acc-title-word]
  [fixture: block/gram-acc-acc-title-space] [fixture:
  block/gram-acc-acc-title-upper] [fixture: block/gram-acc-acc-title-glued]
  [fixture: block/db-acc-title-word] [fixture: block/gram-acc-title-colon]
- Statements follow one another with nothing between them but white space: any
  number of nodes, edges, `columns`, `space` blocks, and composites on a line,
  in any order, and `class`, `style`, and `classDef` take the rest of their
  line, so what follows them on it is part of them. Indentation is not
  significant, a line may be empty or white space only, and so may the end of
  the text. A word that holds a keyword is a node (`friend`, `endless`,
  `mycolumns`, `blockade`, `classy`, `styled`), `columns:2` is a node `columns`
  of width 2, and a control character or a delete character is part of an id.
  [fixture: block/db-statement-many-line] [fixture:
  block/db-statement-mixed-line] [fixture: block/db-statement-columns-between]
  [fixture: block/db-statement-statements-then-class] [fixture:
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
  block/db-statement-keywords-inside-ids]
- White space in the id of a node: a tab, a line feed, a CR, a CRLF, a no-break
  space, an ideographic space, a U+FEFF, a U+2028, a U+2029, a form feed, a
  vertical tab, and spaces separate two ids, while a U+0085 does not, and joins
  the two words into one id. In the id of a composite, white space ends the id,
  and the rest is a node inside the composite. [fixture: block/db-grid-tab-id]
  [fixture: block/db-grid-tab-composite-id] [fixture: block/db-grid-lf-id]
  [fixture: block/db-grid-lf-composite-id] [fixture: block/db-grid-cr-id]
  [fixture: block/db-grid-cr-composite-id] [fixture: block/db-grid-crlf-id]
  [fixture: block/db-grid-crlf-composite-id] [fixture: block/db-grid-ls-id]
  [fixture: block/db-grid-ls-composite-id] [fixture: block/db-grid-ps-id]
  [fixture: block/db-grid-ps-composite-id] [fixture: block/db-grid-nbsp-id]
  [fixture: block/db-grid-nbsp-composite-id] [fixture: block/db-grid-bom-id]
  [fixture: block/db-grid-bom-composite-id] [fixture:
  block/db-grid-ideographic-id] [fixture:
  block/db-grid-ideographic-composite-id] [fixture: block/db-grid-ff-id]
  [fixture: block/db-grid-ff-composite-id] [fixture: block/db-grid-vt-id]
  [fixture: block/db-grid-vt-composite-id] [fixture: block/db-grid-spaces-id]
  [fixture: block/db-grid-spaces-composite-id] [fixture: block/db-grid-nel-id]
  [fixture: block/db-grid-nel-composite-id]
- White space in a string, in the label of a node, of a block arrow, of an edge,
  or of a composite, is part of the text, but a CR alone and a CRLF become a
  line feed. A `;`, a `#`, a `%`, a `:`, a `,`, a `-`, a `|`, a `'`, a backtick,
  a backslash, brackets, braces, `<`, `>`, `=`, a run of punctuation, an arrow,
  `%%`, HTML tags, `&amp;`, keywords, `__proto__`, `constructor`, `root`, a
  letter outside ASCII, an emoji, and digits are part of the text too, but a `"`
  ends the string, and the string is then rejected. A comment line inside a
  string is removed, a directive is removed, a directive on a line of its own
  leaves the line breaks around it, a character reference is read as its
  placeholder, the quote of an HTML attribute is read as `'`, and the line rule
  drops the last `;` of `style:#x;y` and of `classDef:#x;y`. [fixture:
  block/db-label-tab] [fixture: block/db-grid-tab-block-arrow-label] [fixture:
  block/db-grid-tab-edge-label] [fixture: block/db-grid-tab-composite-label]
  [fixture: block/db-label-line-feed] [fixture:
  block/db-grid-lf-block-arrow-label] [fixture: block/db-edge-label-line-feed]
  [fixture: block/db-grid-lf-composite-label] [fixture: block/db-label-cr]
  [fixture: block/db-grid-cr-block-arrow-label] [fixture:
  block/db-grid-cr-edge-label] [fixture: block/db-grid-cr-composite-label]
  [fixture: block/db-label-crlf] [fixture: block/db-grid-crlf-block-arrow-label]
  [fixture: block/db-grid-crlf-edge-label] [fixture:
  block/db-grid-crlf-composite-label] [fixture: block/db-label-ls] [fixture:
  block/db-grid-ls-block-arrow-label] [fixture: block/db-grid-ls-edge-label]
  [fixture: block/db-grid-ls-composite-label] [fixture: block/db-label-ps]
  [fixture: block/db-grid-ps-block-arrow-label] [fixture:
  block/db-grid-ps-edge-label] [fixture: block/db-grid-ps-composite-label]
  [fixture: block/db-label-nbsp] [fixture: block/db-grid-nbsp-block-arrow-label]
  [fixture: block/db-grid-nbsp-edge-label] [fixture:
  block/db-grid-nbsp-composite-label] [fixture: block/db-grid-bom-label]
  [fixture: block/db-grid-bom-block-arrow-label] [fixture:
  block/db-grid-bom-edge-label] [fixture: block/db-grid-bom-composite-label]
  [fixture: block/db-label-ideographic] [fixture:
  block/db-grid-ideographic-block-arrow-label] [fixture:
  block/db-grid-ideographic-edge-label] [fixture:
  block/db-grid-ideographic-composite-label] [fixture: block/db-grid-ff-label]
  [fixture: block/db-grid-ff-block-arrow-label] [fixture:
  block/db-grid-ff-edge-label] [fixture: block/db-grid-ff-composite-label]
  [fixture: block/db-grid-vt-label] [fixture:
  block/db-grid-vt-block-arrow-label] [fixture: block/db-grid-vt-edge-label]
  [fixture: block/db-grid-vt-composite-label] [fixture:
  block/db-grid-spaces-label] [fixture: block/db-grid-spaces-block-arrow-label]
  [fixture: block/db-grid-spaces-edge-label] [fixture:
  block/db-grid-spaces-composite-label] [fixture: block/db-label-nel] [fixture:
  block/db-grid-nel-block-arrow-label] [fixture: block/db-grid-nel-edge-label]
  [fixture: block/db-grid-nel-composite-label] [fixture:
  block/db-label-semicolon] [fixture: block/db-grid-semicolon-block-arrow-label]
  [fixture: block/db-grid-semicolon-edge-label] [fixture:
  block/db-grid-semicolon-composite-label] [fixture: block/db-label-hash]
  [fixture: block/db-grid-hash-block-arrow-label] [fixture:
  block/db-grid-hash-edge-label] [fixture: block/db-grid-hash-composite-label]
  [fixture: block/db-label-percent] [fixture:
  block/db-grid-percent-block-arrow-label] [fixture:
  block/db-grid-percent-edge-label] [fixture:
  block/db-grid-percent-composite-label] [fixture: block/db-label-colon]
  [fixture: block/db-grid-colon-block-arrow-label] [fixture:
  block/db-grid-colon-edge-label] [fixture: block/db-grid-colon-composite-label]
  [fixture: block/db-grid-comma-label] [fixture:
  block/db-grid-comma-block-arrow-label] [fixture:
  block/db-grid-comma-edge-label] [fixture: block/db-grid-comma-composite-label]
  [fixture: block/db-grid-dash-label] [fixture:
  block/db-grid-dash-block-arrow-label] [fixture: block/db-grid-dash-edge-label]
  [fixture: block/db-grid-dash-composite-label] [fixture:
  block/db-grid-pipe-label] [fixture: block/db-grid-pipe-block-arrow-label]
  [fixture: block/db-grid-pipe-edge-label] [fixture:
  block/db-grid-pipe-composite-label] [fixture: block/gram-label-quote-inside]
  [fixture: block/gram-grid-quote-block-arrow-label] [fixture:
  block/gram-grid-quote-edge-label] [fixture:
  block/gram-grid-quote-composite-label] [fixture:
  block/db-label-single-quote-inside] [fixture:
  block/db-grid-single-quote-block-arrow-label] [fixture:
  block/db-grid-single-quote-edge-label] [fixture:
  block/db-grid-single-quote-composite-label] [fixture:
  block/db-label-backtick-inside] [fixture:
  block/db-grid-backtick-block-arrow-label] [fixture:
  block/db-grid-backtick-edge-label] [fixture:
  block/db-grid-backtick-composite-label] [fixture: block/db-label-backslash]
  [fixture: block/db-grid-backslash-block-arrow-label] [fixture:
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
  block/db-grid-arrow-block-arrow-label] [fixture:
  block/db-grid-arrow-edge-label] [fixture: block/db-grid-arrow-composite-label]
  [fixture: block/db-label-arrow] [fixture:
  block/db-grid-arrow-spaced-block-arrow-label] [fixture:
  block/db-grid-arrow-spaced-edge-label] [fixture:
  block/db-grid-arrow-spaced-composite-label] [fixture:
  block/db-grid-comment-label] [fixture:
  block/db-grid-comment-block-arrow-label] [fixture:
  block/db-grid-comment-edge-label] [fixture:
  block/db-grid-comment-composite-label] [fixture:
  block/db-grid-comment-line-label] [fixture:
  block/db-grid-comment-line-block-arrow-label] [fixture:
  block/db-grid-comment-line-edge-label] [fixture:
  block/db-grid-comment-line-composite-label] [fixture:
  block/db-label-directive] [fixture: block/db-grid-directive-block-arrow-label]
  [fixture: block/db-edge-label-directive] [fixture:
  block/db-grid-directive-composite-label] [fixture:
  block/db-label-directive-line] [fixture:
  block/db-grid-directive-line-block-arrow-label] [fixture:
  block/db-grid-directive-line-edge-label] [fixture:
  block/db-grid-directive-line-composite-label] [fixture:
  block/db-label-entity-numeric] [fixture:
  block/db-grid-entity-block-arrow-label] [fixture: block/db-edge-label-entity]
  [fixture: block/db-grid-entity-composite-label] [fixture:
  block/db-label-entity-named] [fixture:
  block/db-grid-entity-named-block-arrow-label] [fixture:
  block/db-grid-entity-named-edge-label] [fixture:
  block/db-grid-entity-named-composite-label] [fixture:
  block/db-grid-html-label] [fixture: block/db-grid-html-block-arrow-label]
  [fixture: block/db-grid-html-edge-label] [fixture:
  block/db-grid-html-composite-label] [fixture: block/db-label-html-br-slash]
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
  block/db-grid-proto-composite-label] [fixture:
  block/db-grid-constructor-label] [fixture:
  block/db-grid-constructor-block-arrow-label] [fixture:
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
  block/db-grid-digits-edge-label] [fixture:
  block/db-grid-digits-composite-label] [fixture: block/db-grid-empty-label]
  [fixture: block/db-grid-empty-block-arrow-label] [fixture:
  block/db-grid-empty-edge-label] [fixture: block/db-grid-empty-composite-label]
  [fixture: block/db-grid-style-rule-label] [fixture:
  block/db-grid-style-rule-block-arrow-label] [fixture:
  block/db-grid-style-rule-edge-label] [fixture:
  block/db-grid-style-rule-composite-label] [fixture:
  block/db-grid-classdef-rule-label] [fixture:
  block/db-grid-classdef-rule-block-arrow-label] [fixture:
  block/db-grid-classdef-rule-edge-label] [fixture:
  block/db-grid-classdef-rule-composite-label]
- In the id of a node, a `;`, a `#`, a `%`, a `,`, a `|`, a `'`, a `"`, a
  backtick, a backslash, a `]`, `%%`, a character reference, `&amp;`,
  `__proto__`, `constructor`, `root`, a letter outside ASCII, an emoji, digits,
  and nothing are part of the id, a directive in it is removed, and a comment
  line in it ends the id. A `[`, a `(`, a `{`, a `-` that is not an arrow, a
  `:`, a `=`, a `<`, a `>`, a `}`, a `)`, a run of punctuation, HTML, and the
  line rule are rejected, `a-->b` is an edge, `end` and `block-beta` after the
  id open or close composites and are rejected, and `columns 2`, `space`,
  `class A c`, and `classDef c fill:red` are statements, while
  `style A fill:red` makes a `style` of an id that is not there. [fixture:
  block/db-name-semicolon] [fixture: block/db-name-hash] [fixture:
  block/db-name-percent] [fixture: block/gram-name-colon] [fixture:
  block/db-name-comma] [fixture: block/gram-name-dash] [fixture:
  block/db-name-pipe] [fixture: block/db-name-quote] [fixture:
  block/db-name-single-quote] [fixture: block/db-name-backtick] [fixture:
  block/db-name-backslash] [fixture: block/gram-grid-open-square-id] [fixture:
  block/db-name-brackets-in-id] [fixture: block/gram-grid-open-round-id]
  [fixture: block/gram-name-close-paren] [fixture:
  block/gram-grid-open-brace-id] [fixture: block/gram-name-brace] [fixture:
  block/gram-name-less-than] [fixture: block/gram-name-greater-than] [fixture:
  block/gram-name-equals] [fixture: block/gram-grid-punct-id] [fixture:
  block/db-grid-arrow-id] [fixture: block/db-grid-arrow-spaced-id] [fixture:
  block/db-grid-comment-id] [fixture: block/db-grid-comment-line-id] [fixture:
  block/div-grid-directive-id] [fixture: block/db-grid-directive-line-id]
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
  [fixture: block/db-grid-nonascii-id] [fixture: block/db-grid-emoji-id]
  [fixture: block/db-grid-digits-id] [fixture: block/db-grid-empty-id] [fixture:
  block/gram-grid-style-rule-id] [fixture: block/gram-grid-classdef-rule-id]
- Where an id of a `class` or `style` statement, the name of a class, or the
  name of a `classDef` holds one of these characters: in `classDef`, the name is
  one or more word characters, and white space ends it, so the rest is the first
  style; the other characters, punctuation, a non-ASCII letter, a comment, and
  an entity make the text rejected, and `__proto__`, `constructor`, `root`,
  digits, and nothing are word characters or no character. The ids of `class`
  and `style` are word characters too, so a character that is none ends the id
  and the rest is the class name or the styles; a `style` for an id that is not
  there is rejected. [fixture: block/db-grid-tab-class-def-name] [fixture:
  block/db-grid-tab-class-apply-id] [fixture: block/db-grid-tab-style-id]
  [fixture: block/db-grid-lf-class-def-name] [fixture:
  block/db-grid-lf-class-apply-id] [fixture: block/gram-grid-lf-style-id]
  [fixture: block/db-grid-cr-class-def-name] [fixture:
  block/db-grid-cr-class-apply-id] [fixture: block/gram-grid-cr-style-id]
  [fixture: block/db-grid-crlf-class-def-name] [fixture:
  block/db-grid-crlf-class-apply-id] [fixture: block/gram-grid-crlf-style-id]
  [fixture: block/db-grid-ls-class-def-name] [fixture:
  block/db-grid-ls-class-apply-id] [fixture: block/db-grid-ls-style-id]
  [fixture: block/db-grid-ps-class-def-name] [fixture:
  block/db-grid-ps-class-apply-id] [fixture: block/db-grid-ps-style-id]
  [fixture: block/db-grid-nbsp-class-def-name] [fixture:
  block/db-grid-nbsp-class-apply-id] [fixture: block/db-grid-nbsp-style-id]
  [fixture: block/db-grid-bom-class-def-name] [fixture:
  block/db-grid-bom-class-apply-id] [fixture: block/db-grid-bom-style-id]
  [fixture: block/db-grid-ideographic-class-def-name] [fixture:
  block/db-grid-ideographic-class-apply-id] [fixture:
  block/db-grid-ideographic-style-id] [fixture: block/db-grid-ff-class-def-name]
  [fixture: block/db-grid-ff-class-apply-id] [fixture:
  block/db-grid-ff-style-id] [fixture: block/db-grid-vt-class-def-name]
  [fixture: block/db-grid-vt-class-apply-id] [fixture:
  block/db-grid-vt-style-id] [fixture: block/db-grid-spaces-class-def-name]
  [fixture: block/db-grid-spaces-class-apply-id] [fixture:
  block/db-grid-spaces-style-id] [fixture: block/gram-grid-nel-class-def-name]
  [fixture: block/db-grid-nel-class-apply-id] [fixture:
  block/gram-grid-nel-style-id] [fixture:
  block/gram-grid-semicolon-class-def-name] [fixture:
  block/db-grid-semicolon-class-apply-id] [fixture:
  block/gram-grid-semicolon-style-id] [fixture:
  block/gram-grid-hash-class-def-name] [fixture:
  block/db-grid-hash-class-apply-id] [fixture: block/gram-grid-hash-style-id]
  [fixture: block/gram-grid-percent-class-def-name] [fixture:
  block/db-grid-percent-class-apply-id] [fixture:
  block/gram-grid-percent-style-id] [fixture:
  block/gram-grid-colon-class-def-name] [fixture:
  block/gram-grid-colon-class-apply-id] [fixture:
  block/gram-grid-colon-style-id] [fixture:
  block/gram-grid-comma-class-def-name] [fixture:
  block/db-grid-comma-class-apply-id] [fixture: block/db-grid-comma-style-id]
  [fixture: block/gram-grid-dash-class-def-name] [fixture:
  block/gram-grid-dash-class-apply-id] [fixture: block/gram-grid-dash-style-id]
  [fixture: block/gram-grid-pipe-class-def-name] [fixture:
  block/db-grid-pipe-class-apply-id] [fixture: block/gram-grid-pipe-style-id]
  [fixture: block/gram-grid-quote-class-def-name] [fixture:
  block/db-grid-quote-class-apply-id] [fixture: block/gram-grid-quote-style-id]
  [fixture: block/gram-grid-single-quote-class-def-name] [fixture:
  block/db-grid-single-quote-class-apply-id] [fixture:
  block/gram-grid-single-quote-style-id] [fixture:
  block/gram-grid-backtick-class-def-name] [fixture:
  block/db-grid-backtick-class-apply-id] [fixture:
  block/gram-grid-backtick-style-id] [fixture:
  block/gram-grid-backslash-class-def-name] [fixture:
  block/db-grid-backslash-class-apply-id] [fixture:
  block/gram-grid-backslash-style-id] [fixture:
  block/gram-grid-open-square-class-def-name] [fixture:
  block/gram-grid-open-square-class-apply-id] [fixture:
  block/gram-grid-open-square-style-id] [fixture:
  block/gram-grid-close-square-class-def-name] [fixture:
  block/db-grid-close-square-class-apply-id] [fixture:
  block/gram-grid-close-square-style-id] [fixture:
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
  block/gram-grid-equals-style-id] [fixture:
  block/gram-grid-punct-class-def-name] [fixture:
  block/gram-grid-punct-class-apply-id] [fixture:
  block/gram-grid-punct-style-id] [fixture:
  block/gram-grid-arrow-class-def-name] [fixture:
  block/db-grid-arrow-class-apply-id] [fixture: block/db-grid-arrow-style-id]
  [fixture: block/db-grid-arrow-spaced-class-def-name] [fixture:
  block/db-grid-arrow-spaced-class-apply-id] [fixture:
  block/db-grid-arrow-spaced-style-id] [fixture:
  block/gram-grid-comment-class-def-name] [fixture:
  block/db-grid-comment-class-apply-id] [fixture:
  block/gram-grid-comment-style-id] [fixture:
  block/db-grid-comment-line-class-def-name] [fixture:
  block/db-grid-comment-line-class-apply-id] [fixture:
  block/gram-grid-comment-line-style-id] [fixture:
  block/div-grid-directive-class-def-name] [fixture:
  block/div-grid-directive-class-apply-id] [fixture:
  block/div-grid-directive-style-id] [fixture:
  block/db-grid-directive-line-class-def-name] [fixture:
  block/db-grid-directive-line-class-apply-id] [fixture:
  block/gram-grid-directive-line-style-id] [fixture:
  block/gram-grid-entity-class-def-name] [fixture:
  block/db-grid-entity-class-apply-id] [fixture:
  block/gram-grid-entity-style-id] [fixture:
  block/gram-grid-entity-named-class-def-name] [fixture:
  block/db-grid-entity-named-class-apply-id] [fixture:
  block/gram-grid-entity-named-style-id] [fixture:
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
  block/gram-grid-ampersand-entity-style-id] [fixture:
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
  block/gram-grid-keyword-style-class-apply-id] [fixture:
  block/gram-grid-keyword-style-style-id] [fixture:
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
  block/db-grid-constructor-style-id] [fixture:
  block/db-grid-root-class-def-name] [fixture:
  block/db-grid-root-class-apply-id] [fixture: block/db-grid-root-style-id]
  [fixture: block/gram-grid-nonascii-class-def-name] [fixture:
  block/db-grid-nonascii-class-apply-id] [fixture:
  block/gram-grid-nonascii-style-id] [fixture:
  block/gram-grid-emoji-class-def-name] [fixture:
  block/db-grid-emoji-class-apply-id] [fixture: block/gram-grid-emoji-style-id]
  [fixture: block/db-grid-digits-class-def-name] [fixture:
  block/db-grid-digits-class-apply-id] [fixture: block/db-grid-digits-style-id]
  [fixture: block/db-grid-empty-class-def-name] [fixture:
  block/db-grid-empty-class-apply-id] [fixture: block/db-grid-empty-style-id]
  [fixture: block/gram-grid-style-rule-class-def-name] [fixture:
  block/gram-grid-style-rule-class-apply-id] [fixture:
  block/gram-grid-style-rule-style-id] [fixture:
  block/gram-grid-classdef-rule-class-def-name] [fixture:
  block/gram-grid-classdef-rule-class-apply-id] [fixture:
  block/gram-grid-classdef-rule-style-id]
- In the styles of `classDef` and `style` and in the name of a class of `class`,
  white space other than a line terminator is part of the text, and a line
  terminator ends it, so the rest of the text is read as statements; the other
  characters are part of the text, the Db drops the first `;` of a style of
  `classDef`, the line rule drops the last `;` of a line that has a `:` and a
  `#`, a comment line is removed, and a directive is removed. A U+0085 is part
  of the text. [fixture: block/db-grid-tab-class-def-style] [fixture:
  block/db-grid-tab-class-apply-name] [fixture: block/db-grid-tab-style-text]
  [fixture: block/db-grid-lf-class-def-style] [fixture:
  block/db-grid-lf-class-apply-name] [fixture: block/db-grid-lf-style-text]
  [fixture: block/db-grid-cr-class-def-style] [fixture:
  block/db-grid-cr-class-apply-name] [fixture: block/db-grid-cr-style-text]
  [fixture: block/db-grid-crlf-class-def-style] [fixture:
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
  block/db-grid-nel-style-text] [fixture:
  block/db-grid-semicolon-class-def-style] [fixture:
  block/db-grid-semicolon-class-apply-name] [fixture:
  block/db-grid-semicolon-style-text] [fixture:
  block/db-grid-hash-class-def-style] [fixture:
  block/db-grid-hash-class-apply-name] [fixture: block/db-grid-hash-style-text]
  [fixture: block/db-grid-percent-class-def-style] [fixture:
  block/db-grid-percent-class-apply-name] [fixture:
  block/db-grid-percent-style-text] [fixture:
  block/db-grid-colon-class-def-style] [fixture:
  block/db-grid-colon-class-apply-name] [fixture:
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
  block/db-grid-equals-style-text] [fixture:
  block/db-grid-punct-class-def-style] [fixture:
  block/db-grid-punct-class-apply-name] [fixture:
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
  block/db-grid-proto-class-apply-name] [fixture:
  block/db-grid-proto-style-text] [fixture:
  block/db-grid-constructor-class-def-style] [fixture:
  block/db-grid-constructor-class-apply-name] [fixture:
  block/db-grid-constructor-style-text] [fixture:
  block/db-grid-root-class-def-style] [fixture:
  block/db-grid-root-class-apply-name] [fixture: block/db-grid-root-style-text]
  [fixture: block/db-grid-nonascii-class-def-style] [fixture:
  block/db-grid-nonascii-class-apply-name] [fixture:
  block/db-grid-nonascii-style-text] [fixture:
  block/db-grid-emoji-class-def-style] [fixture:
  block/db-grid-emoji-class-apply-name] [fixture:
  block/db-grid-emoji-style-text] [fixture:
  block/db-grid-digits-class-def-style] [fixture:
  block/db-grid-digits-class-apply-name] [fixture:
  block/db-grid-digits-style-text] [fixture:
  block/db-grid-empty-class-def-style] [fixture:
  block/db-grid-empty-class-apply-name] [fixture:
  block/db-grid-empty-style-text] [fixture:
  block/db-grid-style-rule-class-def-style] [fixture:
  block/db-grid-style-rule-class-apply-name] [fixture:
  block/db-grid-style-rule-style-text] [fixture:
  block/db-grid-classdef-rule-class-def-style] [fixture:
  block/db-grid-classdef-rule-class-apply-name] [fixture:
  block/db-grid-classdef-rule-style-text]
- After `columns`, only digits make the number of columns; every other character
  makes `columns` a node, followed by what the character makes, or makes the
  text rejected. As the width of a node or of a `space`, only digits make a
  width. Between the directions of a block arrow, white space is part of the
  direction before it, a comment line and a directive are removed, and nothing
  makes two directions, while any other character is rejected. Glued to the
  header on its line, white space, a `;`, a `#`, a `%`, a `,`, a `|`, a `'`, a
  backtick, a backslash, a `]`, a comment, a character reference, `&amp;`, and a
  non-ASCII letter make a node that starts with the character, and keywords make
  the statement they start. [fixture: block/db-grid-tab-columns] [fixture:
  block/gram-grid-tab-width] [fixture: block/gram-grid-tab-space-width]
  [fixture: block/db-grid-tab-directions] [fixture:
  block/header-statement-on-header-line-tab] [fixture: block/db-grid-lf-columns]
  [fixture: block/gram-grid-lf-width] [fixture: block/gram-grid-lf-space-width]
  [fixture: block/db-grid-lf-directions] [fixture: block/db-grid-lf-header-line]
  [fixture: block/db-grid-cr-columns] [fixture: block/gram-grid-cr-width]
  [fixture: block/gram-grid-cr-space-width] [fixture:
  block/db-grid-cr-directions] [fixture: block/db-grid-cr-header-line] [fixture:
  block/db-grid-crlf-columns] [fixture: block/gram-grid-crlf-width] [fixture:
  block/gram-grid-crlf-space-width] [fixture: block/db-grid-crlf-directions]
  [fixture: block/db-grid-crlf-header-line] [fixture: block/db-grid-ls-columns]
  [fixture: block/gram-grid-ls-width] [fixture: block/gram-grid-ls-space-width]
  [fixture: block/db-grid-ls-directions] [fixture: block/header-ls-after]
  [fixture: block/db-grid-ps-columns] [fixture: block/gram-grid-ps-width]
  [fixture: block/gram-grid-ps-space-width] [fixture:
  block/db-grid-ps-directions] [fixture: block/header-ps-after] [fixture:
  block/db-grid-nbsp-columns] [fixture: block/gram-grid-nbsp-width] [fixture:
  block/gram-grid-nbsp-space-width] [fixture: block/db-grid-nbsp-directions]
  [fixture: block/db-grid-nbsp-header-line] [fixture: block/db-grid-bom-columns]
  [fixture: block/gram-grid-bom-width] [fixture:
  block/gram-grid-bom-space-width] [fixture: block/db-grid-bom-directions]
  [fixture: block/db-grid-bom-header-line] [fixture:
  block/db-grid-ideographic-columns] [fixture:
  block/gram-grid-ideographic-width] [fixture:
  block/gram-grid-ideographic-space-width] [fixture:
  block/db-grid-ideographic-directions] [fixture:
  block/db-grid-ideographic-header-line] [fixture: block/db-grid-ff-columns]
  [fixture: block/gram-grid-ff-width] [fixture: block/gram-grid-ff-space-width]
  [fixture: block/db-grid-ff-directions] [fixture: block/header-ff-after]
  [fixture: block/db-grid-vt-columns] [fixture: block/gram-grid-vt-width]
  [fixture: block/gram-grid-vt-space-width] [fixture:
  block/db-grid-vt-directions] [fixture: block/header-vt-after] [fixture:
  block/db-grid-spaces-columns] [fixture: block/gram-grid-spaces-width]
  [fixture: block/gram-grid-spaces-space-width] [fixture:
  block/db-grid-spaces-directions] [fixture: block/db-grid-spaces-header-line]
  [fixture: block/db-grid-nel-columns] [fixture: block/gram-grid-nel-width]
  [fixture: block/gram-grid-nel-space-width] [fixture:
  block/gram-grid-nel-directions] [fixture: block/header-nel-after] [fixture:
  block/db-grid-semicolon-columns] [fixture: block/gram-grid-semicolon-width]
  [fixture: block/gram-grid-semicolon-space-width] [fixture:
  block/gram-grid-semicolon-directions] [fixture:
  block/db-grid-semicolon-header-line] [fixture: block/db-grid-hash-columns]
  [fixture: block/gram-grid-hash-width] [fixture:
  block/gram-grid-hash-space-width] [fixture: block/gram-grid-hash-directions]
  [fixture: block/db-grid-hash-header-line] [fixture:
  block/db-grid-percent-columns] [fixture: block/gram-grid-percent-width]
  [fixture: block/gram-grid-percent-space-width] [fixture:
  block/gram-grid-percent-directions] [fixture:
  block/db-grid-percent-header-line] [fixture: block/gram-grid-colon-columns]
  [fixture: block/gram-grid-colon-width] [fixture:
  block/gram-grid-colon-space-width] [fixture: block/gram-grid-colon-directions]
  [fixture: block/gram-grid-colon-header-line] [fixture:
  block/db-grid-comma-columns] [fixture: block/gram-grid-comma-width] [fixture:
  block/gram-grid-comma-space-width] [fixture: block/db-arrow-no-space]
  [fixture: block/db-grid-comma-header-line] [fixture:
  block/gram-grid-dash-columns] [fixture: block/gram-grid-dash-width] [fixture:
  block/gram-grid-dash-space-width] [fixture: block/gram-grid-dash-directions]
  [fixture: block/gram-grid-dash-header-line] [fixture:
  block/db-grid-pipe-columns] [fixture: block/gram-grid-pipe-width] [fixture:
  block/gram-grid-pipe-space-width] [fixture: block/gram-grid-pipe-directions]
  [fixture: block/db-grid-pipe-header-line] [fixture:
  block/gram-grid-quote-columns] [fixture: block/gram-grid-quote-width]
  [fixture: block/gram-grid-quote-space-width] [fixture:
  block/gram-grid-quote-directions] [fixture: block/gram-grid-quote-header-line]
  [fixture: block/db-grid-single-quote-columns] [fixture:
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
  block/gram-grid-open-round-columns] [fixture:
  block/gram-grid-open-round-width] [fixture:
  block/gram-grid-open-round-space-width] [fixture:
  block/gram-grid-open-round-directions] [fixture:
  block/gram-grid-open-round-header-line] [fixture:
  block/gram-grid-close-round-columns] [fixture:
  block/gram-grid-close-round-width] [fixture:
  block/gram-grid-close-round-space-width] [fixture:
  block/gram-grid-close-round-directions] [fixture:
  block/gram-grid-close-round-header-line] [fixture:
  block/gram-grid-open-brace-columns] [fixture:
  block/gram-grid-open-brace-width] [fixture:
  block/gram-grid-open-brace-space-width] [fixture:
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
  block/gram-grid-equals-directions] [fixture:
  block/gram-grid-equals-header-line] [fixture: block/gram-grid-punct-columns]
  [fixture: block/gram-grid-punct-width] [fixture:
  block/gram-grid-punct-space-width] [fixture: block/gram-grid-punct-directions]
  [fixture: block/gram-grid-punct-header-line] [fixture:
  block/db-grid-arrow-columns] [fixture: block/gram-grid-arrow-width] [fixture:
  block/gram-grid-arrow-space-width] [fixture: block/gram-grid-arrow-directions]
  [fixture: block/gram-grid-arrow-header-line] [fixture:
  block/db-grid-arrow-spaced-columns] [fixture:
  block/gram-grid-arrow-spaced-width] [fixture:
  block/gram-grid-arrow-spaced-space-width] [fixture:
  block/gram-grid-arrow-spaced-directions] [fixture:
  block/gram-grid-arrow-spaced-header-line] [fixture:
  block/db-grid-comment-columns] [fixture: block/gram-grid-comment-width]
  [fixture: block/gram-grid-comment-space-width] [fixture:
  block/gram-grid-comment-directions] [fixture:
  block/db-grid-comment-header-line] [fixture:
  block/db-grid-comment-line-columns] [fixture:
  block/gram-grid-comment-line-width] [fixture:
  block/gram-grid-comment-line-space-width] [fixture:
  block/db-grid-comment-line-directions] [fixture: block/db-comment-line-first]
  [fixture: block/db-grid-directive-columns] [fixture:
  block/gram-grid-directive-width] [fixture:
  block/gram-grid-directive-space-width] [fixture:
  block/db-grid-directive-directions] [fixture:
  block/gram-grid-directive-header-line] [fixture:
  block/db-grid-directive-line-columns] [fixture:
  block/gram-grid-directive-line-width] [fixture:
  block/gram-grid-directive-line-space-width] [fixture:
  block/db-grid-directive-line-directions] [fixture:
  block/db-grid-directive-line-header-line] [fixture:
  block/db-grid-entity-columns] [fixture: block/gram-grid-entity-width]
  [fixture: block/gram-grid-entity-space-width] [fixture:
  block/gram-grid-entity-directions] [fixture: block/db-grid-entity-header-line]
  [fixture: block/db-grid-entity-named-columns] [fixture:
  block/gram-grid-entity-named-width] [fixture:
  block/gram-grid-entity-named-space-width] [fixture:
  block/gram-grid-entity-named-directions] [fixture:
  block/db-grid-entity-named-header-line] [fixture:
  block/gram-grid-html-columns] [fixture: block/gram-grid-html-width] [fixture:
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
  block/db-grid-constructor-columns] [fixture:
  block/gram-grid-constructor-width] [fixture:
  block/gram-grid-constructor-space-width] [fixture:
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
  block/gram-space-no-number] [fixture: block/db-grid-empty-directions]
  [fixture: block/gram-grid-empty-header-line] [fixture:
  block/gram-grid-style-rule-columns] [fixture:
  block/gram-grid-style-rule-width] [fixture:
  block/gram-grid-style-rule-space-width] [fixture:
  block/gram-grid-style-rule-directions] [fixture:
  block/gram-grid-style-rule-header-line] [fixture:
  block/gram-grid-classdef-rule-columns] [fixture:
  block/gram-grid-classdef-rule-width] [fixture:
  block/gram-grid-classdef-rule-space-width] [fixture:
  block/gram-grid-classdef-rule-directions] [fixture:
  block/gram-grid-classdef-rule-header-line]
- White space and comments inside a statement: a statement whose parts are
  separated by white space in the lexer (`columns` and its number, `classDef`
  and its name or its styles, `class` and its ids, `style` and its ids, `block:`
  and its id, a node and its width, its shape, or its directions, an edge and
  its end) may have a line feed, a blank line, a comment line, or a directive
  line between the parts, and the Db reads them as if they were not there. The
  exceptions are the ids of `class` and `style` from their styles or class name:
  after the class ids `class A` a line feed ends the statement, and the name is
  empty, and after `style A` the styles must be on its line: rejected. [fixture:
  block/db-between-columns-comment-line] [fixture:
  block/db-between-columns-directive-line] [fixture:
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
  block/db-between-width-empty-line] [fixture:
  block/db-between-width-spaces-line] [fixture:
  block/db-between-edge-comment-line] [fixture:
  block/db-between-edge-directive-line] [fixture:
  block/db-between-edge-empty-line] [fixture: block/db-between-edge-spaces-line]
  [fixture: block/db-between-edge-end-comment-line] [fixture:
  block/db-between-edge-end-directive-line] [fixture:
  block/db-between-edge-end-empty-line] [fixture:
  block/db-between-edge-end-spaces-line] [fixture:
  block/db-between-shape-comment-line] [fixture:
  block/db-between-shape-directive-line] [fixture:
  block/db-between-shape-empty-line] [fixture:
  block/db-between-shape-spaces-line] [fixture:
  block/db-between-directions-comment-line] [fixture:
  block/db-between-directions-directive-line] [fixture:
  block/db-between-directions-empty-line] [fixture:
  block/db-between-directions-spaces-line]
- What stands after a statement at the end of its line: a `;`, a space and a
  `;`, two `;`, a `%%` comment, a directive, a directive that is not closed,
  trailing spaces, a tab, a no-break space, and `# c`. After a node, a shape, a
  width, a block arrow, `columns`, `space`, `end`, or an edge, a `;` after a
  space, the `%%`, and the `#` with their text are nodes, a `;` glued to an id
  (a node, or the end of an edge) is part of the id, and the directive and the
  trailing white space are not read. After `class`, `style`, and `classDef` they
  are part of the class name or the styles, except the ones that the line rule
  and the Db remove. [fixture: block/db-tail-node-semicolon] [fixture:
  block/db-tail-node-space-semicolon] [fixture: block/db-semicolon-double]
  [fixture: block/db-tail-node-comment] [fixture:
  block/db-tail-node-comment-glued] [fixture: block/db-tail-node-directive]
  [fixture: block/db-directive-glued-to-id] [fixture:
  block/db-tail-node-directive-unclosed] [fixture:
  block/db-name-trailing-spaces] [fixture: block/db-tail-node-trailing-tab]
  [fixture: block/db-tail-node-trailing-nbsp] [fixture: block/db-tail-node-hash]
  [fixture: block/db-semicolon-after-shape] [fixture:
  block/db-tail-node-shape-space-semicolon] [fixture:
  block/db-tail-node-shape-two-semicolons] [fixture:
  block/db-tail-node-shape-comment] [fixture:
  block/db-tail-node-shape-comment-glued] [fixture:
  block/db-tail-node-shape-directive] [fixture:
  block/db-tail-node-shape-directive-glued] [fixture:
  block/db-tail-node-shape-directive-unclosed] [fixture:
  block/db-tail-node-shape-trailing-spaces] [fixture:
  block/db-tail-node-shape-trailing-tab] [fixture:
  block/db-tail-node-shape-trailing-nbsp] [fixture:
  block/db-tail-node-shape-hash] [fixture: block/db-semicolon-after-width]
  [fixture: block/db-tail-node-width-space-semicolon] [fixture:
  block/db-tail-node-width-two-semicolons] [fixture:
  block/db-tail-node-width-comment] [fixture:
  block/db-tail-node-width-comment-glued] [fixture:
  block/db-tail-node-width-directive] [fixture:
  block/db-tail-node-width-directive-glued] [fixture:
  block/db-tail-node-width-directive-unclosed] [fixture:
  block/db-tail-node-width-trailing-spaces] [fixture:
  block/db-tail-node-width-trailing-tab] [fixture:
  block/db-tail-node-width-trailing-nbsp] [fixture:
  block/db-tail-node-width-hash] [fixture: block/db-semicolon-after-edge]
  [fixture: block/db-tail-edge-space-semicolon] [fixture:
  block/db-tail-edge-two-semicolons] [fixture: block/db-comment-after-edge]
  [fixture: block/db-tail-edge-comment-glued] [fixture:
  block/db-tail-edge-directive] [fixture: block/db-tail-edge-directive-glued]
  [fixture: block/db-tail-edge-directive-unclosed] [fixture:
  block/db-tail-edge-trailing-spaces] [fixture: block/db-tail-edge-trailing-tab]
  [fixture: block/db-tail-edge-trailing-nbsp] [fixture: block/db-tail-edge-hash]
  [fixture: block/db-tail-edge-label-semicolon] [fixture:
  block/db-tail-edge-label-space-semicolon] [fixture:
  block/db-tail-edge-label-two-semicolons] [fixture:
  block/db-tail-edge-label-comment] [fixture:
  block/db-tail-edge-label-comment-glued] [fixture:
  block/db-tail-edge-label-directive] [fixture:
  block/db-tail-edge-label-directive-glued] [fixture:
  block/db-tail-edge-label-directive-unclosed] [fixture:
  block/db-tail-edge-label-trailing-spaces] [fixture:
  block/db-tail-edge-label-trailing-tab] [fixture:
  block/db-tail-edge-label-trailing-nbsp] [fixture:
  block/db-tail-edge-label-hash] [fixture: block/db-tail-block-arrow-semicolon]
  [fixture: block/db-tail-block-arrow-space-semicolon] [fixture:
  block/db-tail-block-arrow-two-semicolons] [fixture:
  block/db-tail-block-arrow-comment] [fixture:
  block/db-tail-block-arrow-comment-glued] [fixture:
  block/db-tail-block-arrow-directive] [fixture:
  block/db-tail-block-arrow-directive-glued] [fixture:
  block/db-tail-block-arrow-directive-unclosed] [fixture:
  block/db-tail-block-arrow-trailing-spaces] [fixture:
  block/db-tail-block-arrow-trailing-tab] [fixture:
  block/db-tail-block-arrow-trailing-nbsp] [fixture:
  block/db-tail-block-arrow-hash] [fixture: block/db-tail-columns-semicolon]
  [fixture: block/db-tail-columns-space-semicolon] [fixture:
  block/db-tail-columns-two-semicolons] [fixture: block/db-tail-columns-comment]
  [fixture: block/db-tail-columns-comment-glued] [fixture:
  block/db-tail-columns-directive] [fixture:
  block/db-tail-columns-directive-glued] [fixture:
  block/db-tail-columns-directive-unclosed] [fixture:
  block/db-tail-columns-trailing-spaces] [fixture:
  block/db-tail-columns-trailing-tab] [fixture:
  block/db-tail-columns-trailing-nbsp] [fixture: block/db-tail-columns-hash]
  [fixture: block/db-space-semicolon] [fixture:
  block/db-tail-space-space-semicolon] [fixture:
  block/db-tail-space-two-semicolons] [fixture: block/db-tail-space-comment]
  [fixture: block/db-tail-space-comment-glued] [fixture:
  block/db-tail-space-directive] [fixture: block/db-tail-space-directive-glued]
  [fixture: block/db-tail-space-directive-unclosed] [fixture:
  block/db-tail-space-trailing-spaces] [fixture:
  block/db-tail-space-trailing-tab] [fixture: block/db-tail-space-trailing-nbsp]
  [fixture: block/db-tail-space-hash] [fixture:
  block/db-tail-space-width-semicolon] [fixture:
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
  [fixture: block/db-tail-class-space-semicolon] [fixture:
  block/db-tail-class-two-semicolons] [fixture: block/db-tail-class-comment]
  [fixture: block/db-tail-class-comment-glued] [fixture:
  block/db-tail-class-directive] [fixture: block/db-class-apply-directive]
  [fixture: block/db-tail-class-directive-unclosed] [fixture:
  block/db-class-apply-trailing-spaces] [fixture:
  block/db-tail-class-trailing-tab] [fixture: block/db-class-apply-nbsp]
  [fixture: block/db-tail-class-hash] [fixture: block/db-tail-style-semicolon]
  [fixture: block/db-tail-style-space-semicolon] [fixture:
  block/db-tail-style-two-semicolons] [fixture: block/db-tail-style-comment]
  [fixture: block/db-tail-style-comment-glued] [fixture:
  block/db-tail-style-directive] [fixture: block/db-tail-style-directive-glued]
  [fixture: block/db-tail-style-directive-unclosed] [fixture:
  block/db-tail-style-trailing-spaces] [fixture:
  block/db-tail-style-trailing-tab] [fixture: block/db-tail-style-trailing-nbsp]
  [fixture: block/db-tail-style-hash] [fixture:
  block/db-tail-class-def-semicolon] [fixture:
  block/db-tail-class-def-space-semicolon] [fixture:
  block/db-tail-class-def-two-semicolons] [fixture:
  block/db-tail-class-def-comment] [fixture:
  block/db-tail-class-def-comment-glued] [fixture:
  block/db-directive-class-def-line] [fixture:
  block/db-tail-class-def-directive-glued] [fixture:
  block/db-tail-class-def-directive-unclosed] [fixture:
  block/db-tail-class-def-trailing-spaces] [fixture:
  block/db-tail-class-def-trailing-tab] [fixture:
  block/db-tail-class-def-trailing-nbsp] [fixture: block/db-tail-class-def-hash]
  [fixture: block/db-composite-end-semicolon] [fixture:
  block/db-tail-composite-end-space-semicolon] [fixture:
  block/db-tail-composite-end-two-semicolons] [fixture:
  block/db-composite-end-comment] [fixture:
  block/db-tail-composite-end-comment-glued] [fixture:
  block/db-tail-composite-end-directive] [fixture:
  block/db-tail-composite-end-directive-glued] [fixture:
  block/db-tail-composite-end-directive-unclosed] [fixture:
  block/db-tail-composite-end-trailing-spaces] [fixture:
  block/db-composite-end-tab] [fixture: block/db-composite-end-nbsp] [fixture:
  block/db-tail-composite-end-hash] [fixture:
  block/db-tail-composite-end-keyword-semicolon] [fixture:
  block/db-tail-composite-end-keyword-space-semicolon] [fixture:
  block/db-tail-composite-end-keyword-two-semicolons] [fixture:
  block/db-tail-composite-end-keyword-comment] [fixture:
  block/db-tail-composite-end-keyword-comment-glued] [fixture:
  block/db-tail-composite-end-keyword-directive] [fixture:
  block/db-tail-composite-end-keyword-directive-glued] [fixture:
  block/db-tail-composite-end-keyword-directive-unclosed] [fixture:
  block/db-tail-composite-end-keyword-trailing-spaces] [fixture:
  block/db-tail-composite-end-keyword-trailing-tab] [fixture:
  block/db-tail-composite-end-keyword-trailing-nbsp] [fixture:
  block/db-tail-composite-end-keyword-hash]
- The summary is the same under every `securityLevel` that mermaid.js has
  (`strict`, `loose`, `antiscript`, and `sandbox`), and under the settings of
  the site (the `block` settings `padding` and `useMaxWidth`, the theme, the
  look, `htmlLabels`, `flowchart.htmlLabels`, `maxTextSize`, and
  `deterministicIds`), which affect the drawing and not the Db. Under a
  `securityLevel` that is none of its values, the texts the Db sanitizes, the
  labels of the nodes, of the block arrows, of the composites, and of the edges,
  hold the replaced characters (`<` as `&lt;`, `>` as `&gt;`, and `<br>` as
  `<br/>`), while the ids, the styles, the classes, and the directions are as
  written. [fixture: block/config-block-padding] [fixture:
  block/config-block-use-max-width] [fixture: block/config-deterministic-ids]
  [fixture: block/config-flowchart-html-labels-false] [fixture:
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
- In the id after `block:`, the characters other than white space are read as in
  the id of a node: a `;`, a `#`, a `%`, a `,`, a `|`, a `'`, a `"`, a backtick,
  a backslash, a `]`, `%%`, a character reference, `&amp;`, `__proto__`,
  `constructor`, `root`, a letter outside ASCII, an emoji, and digits are part
  of the id, a directive in it is removed, and a comment line ends it. An arrow
  in it makes the statement an edge statement, so the composite has no id.
  `columns 2`, `space`, `class A c`, and `classDef c fill:red` after the id are
  statements of the composite, and `style A fill:red` is rejected, as are `[`,
  `(`, `{`, `)`, `}`, `<`, `>`, `=`, `:`, HTML, a run of punctuation, the line
  rule, `end`, `block`, and `block-beta`. [fixture:
  block/db-grid-semicolon-composite-id] [fixture:
  block/db-grid-hash-composite-id] [fixture: block/db-grid-percent-composite-id]
  [fixture: block/gram-grid-colon-composite-id] [fixture:
  block/db-grid-comma-composite-id] [fixture: block/gram-composite-id-with-dash]
  [fixture: block/db-grid-pipe-composite-id] [fixture:
  block/db-grid-quote-composite-id] [fixture:
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
  block/gram-grid-punct-composite-id] [fixture:
  block/db-grid-arrow-composite-id] [fixture:
  block/db-grid-arrow-spaced-composite-id] [fixture:
  block/db-grid-comment-composite-id] [fixture:
  block/db-grid-comment-line-composite-id] [fixture:
  block/div-grid-directive-composite-id] [fixture:
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
  block/gram-grid-keyword-style-composite-id] [fixture:
  block/db-grid-keyword-classdef-composite-id] [fixture:
  block/gram-grid-keyword-header-composite-id] [fixture:
  block/db-grid-proto-composite-id] [fixture:
  block/db-grid-constructor-composite-id] [fixture:
  block/db-grid-root-composite-id] [fixture:
  block/db-grid-nonascii-composite-id] [fixture:
  block/db-grid-emoji-composite-id] [fixture: block/db-grid-digits-composite-id]
  [fixture: block/db-grid-empty-composite-id] [fixture:
  block/gram-grid-style-rule-composite-id] [fixture:
  block/gram-grid-classdef-rule-composite-id]
- A composite opened on a line with a node and not closed with `end`, with a
  `;`, a comment, a directive, a `#`, or trailing white space after the node, is
  rejected like one without them. [fixture:
  block/gram-tail-composite-line-comment] [fixture:
  block/gram-tail-composite-line-comment-glued] [fixture:
  block/gram-tail-composite-line-directive] [fixture:
  block/gram-tail-composite-line-directive-glued] [fixture:
  block/gram-tail-composite-line-directive-unclosed] [fixture:
  block/gram-tail-composite-line-hash] [fixture:
  block/gram-tail-composite-line-semicolon] [fixture:
  block/gram-tail-composite-line-space-semicolon] [fixture:
  block/gram-tail-composite-line-trailing-nbsp] [fixture:
  block/gram-tail-composite-line-trailing-spaces] [fixture:
  block/gram-tail-composite-line-trailing-tab] [fixture:
  block/gram-tail-composite-line-two-semicolons]
- The inputs of the tests, the documentation, and the demos of mermaid.js are
  accepted. They show the forms that its authors write: nodes, widths, the
  shapes, block arrows, `space`, composites with `columns`, edges with labels,
  and the classes and styles. [fixture: block/demo-block-0f7b1b81] [fixture:
  block/demo-block-2472aba6] [fixture: block/demo-block-44d70be5] [fixture:
  block/demo-block-7d24edf7] [fixture: block/demo-block-8b6e7c41] [fixture:
  block/demo-block-a8323c64] [fixture: block/demo-block-b3231b02] [fixture:
  block/demo-block-b4d9a28a] [fixture: block/demo-block-ca540acf] [fixture:
  block/demo-block-f71819c7] [fixture: block/demo-block-fbbaee87] [fixture:
  block/docs-syntax-block-0c75f481] [fixture: block/docs-syntax-block-0eeed10a]
  [fixture: block/docs-syntax-block-1493c734] [fixture:
  block/docs-syntax-block-1d2ef9d1] [fixture: block/docs-syntax-block-24e2536f]
  [fixture: block/docs-syntax-block-2a2aedc0] [fixture:
  block/docs-syntax-block-3eeec690] [fixture: block/docs-syntax-block-50dc2ed1]
  [fixture: block/docs-syntax-block-668adabd] [fixture:
  block/docs-syntax-block-66fde579] [fixture: block/docs-syntax-block-6a5c5e67]
  [fixture: block/docs-syntax-block-6dd28f68] [fixture:
  block/docs-syntax-block-6fbaef0c] [fixture: block/docs-syntax-block-7134441c]
  [fixture: block/docs-syntax-block-715f1762] [fixture:
  block/docs-syntax-block-78e30a8a] [fixture: block/docs-syntax-block-7c6756e8]
  [fixture: block/docs-syntax-block-7ddc4030] [fixture:
  block/docs-syntax-block-8c1f8d53] [fixture: block/docs-syntax-block-a5a467c8]
  [fixture: block/docs-syntax-block-ab04e715] [fixture:
  block/docs-syntax-block-b6eebb8c] [fixture: block/docs-syntax-block-bd54fe8a]
  [fixture: block/docs-syntax-block-c1690d0b] [fixture:
  block/docs-syntax-block-c574652d] [fixture: block/docs-syntax-block-e29ee1ca]
  [fixture: block/docs-syntax-block-f3c3e654] [fixture:
  block/docs-syntax-block-f8418640] [fixture: block/docs-syntax-block-fd481f6b]
  [fixture: block/docs-syntax-block-fddacaac] [fixture:
  block/spec-block-0365699a] [fixture: block/spec-block-12f308cf] [fixture:
  block/spec-block-17e824ed] [fixture: block/spec-block-1b677ef0] [fixture:
  block/spec-block-256830d9] [fixture: block/spec-block-269adfec] [fixture:
  block/spec-block-324a07d6] [fixture: block/spec-block-39bb98c0] [fixture:
  block/spec-block-48aaf41f] [fixture: block/spec-block-52e0ec56] [fixture:
  block/spec-block-6382a25a] [fixture: block/spec-block-855ca1c9] [fixture:
  block/spec-block-870f6dc9] [fixture: block/spec-block-946762fc] [fixture:
  block/spec-block-9a645429] [fixture: block/spec-block-a3184350] [fixture:
  block/spec-block-ae4c1db0] [fixture: block/spec-block-be5706bf] [fixture:
  block/spec-block-cc1ee20b] [fixture: block/spec-block-cd0ecd2d] [fixture:
  block/spec-block-cf4d00b8] [fixture: block/spec-block-color-index-29ce8f4b]
  [fixture: block/spec-block-color-index-7228003b] [fixture:
  block/spec-block-color-index-9a40ae65] [fixture:
  block/spec-block-color-index-dd469c8d] [fixture: block/spec-block-d0ba877e]
  [fixture: block/spec-block-d1395cc6] [fixture: block/spec-block-ee611de8]
  [fixture: block/spec-block-f4c30090] [fixture: block/spec-block-f6ceb4d8]
  [fixture: block/spec-block-fd3dd910] [fixture: block/spec-block-ff426370]
- The detector of the C4 diagrams reads `C4Container`, `C4Component`,
  `C4Dynamic`, and `C4Deployment` anywhere in the text, and the other detectors
  read the text only after the C4 one, so a text that holds one of them
  anywhere, in an id, a label, the label of an edge, the id or label of a
  composite, the name or styles of a class, a class name, a style, or before the
  header, is not detected as a block diagram and is rejected by the lexer of the
  C4 diagrams. `C4Context` is detected only at the start of the text, so it is
  an id in a block diagram. A comment line, a directive, and a frontmatter are
  removed before the detectors read the text, so the words in them do nothing,
  and the words are read in this exact case. [fixture:
  block/div-c4-component-in-id] [fixture: block/div-c4-container-after-node]
  [fixture: block/gram-c4-container-before-header] [fixture:
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
- `default`, `linkStyle`, and `interpolate` are words of the lexer that no
  statement of a block diagram accepts: as an id, after a node, and as a
  `linkStyle` statement, they are rejected, while `DEFAULT`, `defaultx`,
  `linkStylex`, and `interpolatex` are ids, and the three words are text inside
  a label, a class name, and a style. `default` is a name of a class in
  `classDef`. [fixture: block/gram-name-reserved-default] [fixture:
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
  block/gram-name-reserved-link-style-statement]
- An empty string `""` and an empty markdown string `"``"` read no token, so
  they are skipped wherever a statement may stand: between statements, before
  and after an id, an edge, a shape, a width, or `end`, before a composite, and
  inside a composite, and two in a row are skipped too. Glued to an id, `""` is
  part of the id. A text of nothing but one is rejected, as are three quotes in
  a row (an empty string and a quote), a markdown string of a space, and a
  second string after the empty label that starts an edge label. Between
  `columns` and its number, an empty string is skipped, but the white space
  around it makes `columns` a node and the number another. [fixture:
  block/div-empty-string-after-edge] [fixture: block/div-empty-string-after-id]
  [fixture: block/div-empty-string-before-block-key] [fixture:
  block/div-empty-string-before-columns-number] [fixture:
  block/div-empty-string-before-edge] [fixture:
  block/div-empty-string-before-end] [fixture:
  block/div-empty-string-before-shape] [fixture:
  block/div-empty-string-before-width] [fixture: block/div-empty-string-between]
  [fixture: block/gram-empty-string-between-edge-parts] [fixture:
  block/div-empty-string-first-in-line] [fixture:
  block/db-empty-string-glued-to-id] [fixture:
  block/div-empty-string-in-composite] [fixture: block/div-empty-string-line]
  [fixture: block/gram-empty-string-only] [fixture:
  block/gram-empty-string-three-quotes] [fixture: block/div-empty-strings-two]
  [fixture: block/div-empty-markdown-between] [fixture:
  block/div-empty-markdown-line] [fixture: block/gram-empty-markdown-only]
  [fixture: block/gram-empty-markdown-spaces]
- An empty `accDescr` block, `accDescr {}`, with spaces, a line feed, or a
  comment line inside, or with no space before the brace, reads no token either:
  it is skipped between statements, between two ids, after an edge, before
  `columns`, inside a composite, and before `end`, and two in a row are skipped,
  while a composite that holds only one has no statement, and a text of only one
  is rejected. A block with text, `ACCDESCR {}`, `accDescr: {}`, and a block
  that is not closed are rejected, and `accDescr {}` inside a string is text. On
  the line of the header it is skipped, and a block with text is rejected.
  Between `columns` and its number it is skipped, and the white space around it
  makes `columns` a node. [fixture:
  block/gram-empty-block-as-only-statement-in-composite] [fixture:
  block/db-empty-block-before-columns] [fixture:
  block/db-empty-block-before-end] [fixture: block/db-empty-block-between]
  [fixture: block/db-empty-block-between-columns-and-number] [fixture:
  block/db-empty-block-glued-brace] [fixture: block/db-empty-block-glued-to-id]
  [fixture: block/db-empty-block-in-composite] [fixture:
  block/div-empty-block-in-edge] [fixture: block/db-empty-block-in-label]
  [fixture: block/db-empty-block-line] [fixture: block/db-empty-block-line-feed]
  [fixture: block/gram-empty-block-only] [fixture: block/db-empty-block-spaces]
  [fixture: block/gram-empty-block-then-colon] [fixture:
  block/db-empty-block-twice] [fixture: block/gram-empty-block-unclosed]
  [fixture: block/gram-empty-block-upper-case] [fixture:
  block/db-empty-block-with-comment-line] [fixture:
  block/db-empty-block-on-header-line] [fixture:
  block/gram-description-block-on-header-line] [fixture:
  block/gram-empty-block-with-text]
- A shape takes no white space inside its brackets: `A[ "x" ]`, `A[ "x"]`,
  `A["x" ]`, a line feed inside the brackets, `A<[ "x" ]>(right)`, and two
  strings are rejected, while a space before the shape is allowed (`A ("x")`),
  and so is a space inside the parentheses of the directions, which is part of
  the texts of the directions, with a line feed. `[|` with the end `]` has no
  type, `)))` is read as `))` and `)` and rejected, and an unknown direction is
  rejected. [fixture: block/db-spec-bracket-pipe] [fixture:
  block/gram-spec-triple-round-start] [fixture:
  block/db-spec-space-before-round] [fixture:
  block/gram-spec-spaces-inside-square] [fixture:
  block/gram-spec-space-before-string] [fixture:
  block/gram-spec-space-after-string] [fixture:
  block/gram-spec-line-feed-inside-square] [fixture:
  block/gram-spec-two-strings] [fixture:
  block/gram-spec-spaces-inside-block-arrow] [fixture:
  block/db-spec-spaces-around-directions] [fixture:
  block/db-spec-directions-line-feeds] [fixture:
  block/gram-spec-directions-unknown]
- `->` is not an edge, `A --> block` opens a composite and is rejected, and
  `:::`, `::`, and a class name after `A:::` are rejected: the lexer stops at
  the `:`. A directive is removed inside an arrow, after the `<`, before the
  head, inside the dashes that start a label, and the pieces join, while one
  between the two dashes of `--` leaves `A -- B`, which is rejected. The spaces
  around the label of an edge change nothing, and two strings in the label are
  rejected. [fixture: block/gram-spec-single-dash-arrow] [fixture:
  block/gram-spec-edge-to-block-keyword] [fixture:
  block/gram-spec-colon-colon-colon] [fixture: block/gram-spec-colon-colon]
  [fixture: block/gram-spec-colon-colon-colon-two] [fixture:
  block/div-spec-edge-directive-in-arrow] [fixture:
  block/div-spec-edge-directive-before-head] [fixture:
  block/gram-spec-edge-directive-in-dashes] [fixture:
  block/div-spec-edge-directive-in-start] [fixture:
  block/div-spec-edge-directive-in-label-start] [fixture:
  block/db-spec-edge-label-spaces-around] [fixture:
  block/gram-spec-edge-label-two-strings]
- The id after `block:` may be on the next line, since the white space after
  `block:` includes the line feed. The styles of a `classDef` may be on the line
  after its name for the same reason, and when they are, the line is the styles
  even if it is a statement: `classDef c` and `class A c` on the next line make
  the class `c` with the style `class A c`. A quote inside an id is part of it
  and the white space after the quote ends the id, `%%` and `%` are part of an
  id when glued to it. [fixture: block/db-spec-composite-lf-id] [fixture:
  block/db-spec-class-def-next-line-styles] [fixture:
  block/db-spec-class-def-next-line-two] [fixture:
  block/db-spec-class-def-name-only-then-class] [fixture:
  block/db-spec-id-with-quoted-part] [fixture: block/db-spec-id-comment-glued]
  [fixture: block/db-spec-percent-id]
- How the Db collects the blocks. After the whole text is parsed, the Db walks
  the statements in the order of the text, one list of children at a time, and
  it enters a composite when it meets it: a composite is put in the table of
  blocks first, then its children one after another (each composite before its
  own children, and its children before the next block of the list), then the
  next block. A statement that defines a block that the table already holds, a
  node, a shape, a composite, or the end of an edge, does not make a new block.
  It updates the old one: the type becomes the type of the new definition when
  that is not `na`, the label becomes the new label when it differs from the id,
  and the width, the directions, the `columns`, the classes, the styles, and the
  children stay as they were. The new block is dropped, and so is the list of
  children of a composite. An edge is added to the list of edges when the walk
  meets it, also inside a composite, whatever the blocks at its ends are. A
  block used inside a composite and again outside stays where it was first used.
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
  block/db-shape-redefine-from-na] [fixture: block/db-shape-redefine-label-only]
  [fixture: block/db-shape-redefine-same-label] [fixture:
  block/db-shape-redefine-shape] [fixture: block/db-shape-redefine-to-na]
  [fixture: block/db-shape-redefine-to-odd] [fixture:
  block/db-shape-redefine-width] [fixture: block/db-definitions-class-def-three]
  [fixture: block/db-definitions-class-def-three-others] [fixture:
  block/db-definitions-class-three] [fixture:
  block/db-definitions-class-three-ids] [fixture:
  block/db-definitions-columns-three] [fixture:
  block/db-definitions-composite-then-shape-then-composite] [fixture:
  block/db-definitions-edges-three] [fixture:
  block/db-definitions-shape-then-composite-then-shape] [fixture:
  block/db-definitions-space-three] [fixture: block/db-definitions-style-three]
  [fixture: block/db-definitions-style-three-empty-middle] [fixture:
  block/db-definitions-three-arrows] [fixture:
  block/db-definitions-three-composites] [fixture:
  block/db-definitions-three-edge-and-node] [fixture:
  block/db-definitions-three-edge-ends] [fixture:
  block/db-definitions-three-labels-first-equal] [fixture:
  block/db-definitions-three-na-in-the-middle] [fixture:
  block/db-definitions-three-shapes] [fixture:
  block/db-definitions-three-widths] [fixture:
  block/db-composite-id-same-as-node-before] [fixture:
  block/db-composite-id-same-as-node-after] [fixture:
  block/db-composite-id-same-as-node-after-shape] [fixture:
  block/db-composite-id-same-composite] [fixture:
  block/db-composite-id-same-nested] [fixture:
  block/db-composite-id-same-as-child] [fixture:
  block/db-composite-id-same-child-defined-in-inner] [fixture:
  block/db-width-redefine] [fixture: block/db-width-redefine-without] [fixture:
  block/db-width-redefine-first] [fixture: block/db-arrow-redefine] [fixture:
  block/db-arrow-redefine-from-square] [fixture:
  block/db-arrow-redefine-to-square] [fixture: block/db-edge-keeps-shape]
  [fixture: block/db-edge-keeps-width] [fixture: block/db-edge-redefine-by-edge]
  [fixture: block/db-edge-edge-in-composite-order]
- The table of blocks holds the blocks in the order they were put in it, the
  block of the diagram first. `unplaced` lists the entries of the table that the
  walk from the block of the diagram does not reach through lists of children,
  in the order of the table, with the entries of `space` statements left out
  (the entry of a `space` statement, whose type is `space` and whose id the Db
  made up, holds a width that the blocks of its width hold, and `space:0` makes
  no block). A block that another listed block holds in its `children` is listed
  there only, so a dropped composite is listed with its children, and not again.
  The blocks of a dropped composite, the block that a `class` made for an id
  that no statement had defined or that it did not find (`class A, B c`), and
  the block a later definition of that id updated are unplaced; an edge, a
  `class`, and a `style` find them as they find any block. What is lost with a
  dropped composite is its `columns` and its width, which the old block does not
  take. [fixture: block/db-unplaced-class-on-unplaced-child] [fixture:
  block/db-unplaced-columns-in-dropped] [fixture:
  block/db-unplaced-dropped-with-label] [fixture:
  block/db-unplaced-dropped-with-width] [fixture:
  block/db-unplaced-edge-into-dropped] [fixture:
  block/db-unplaced-nested-composite] [fixture: block/db-unplaced-order]
  [fixture: block/db-unplaced-order-defined-later] [fixture:
  block/db-unplaced-space] [fixture: block/db-unplaced-style-on-unplaced]
  [fixture: block/db-class-apply-undefined-id] [fixture:
  block/db-class-apply-before-node] [fixture:
  block/db-class-apply-before-node-shape] [fixture:
  block/db-class-apply-before-node-width] [fixture:
  block/db-class-apply-before-edge] [fixture: block/db-class-apply-before-block]
  [fixture: block/db-class-apply-undefined-twice] [fixture:
  block/db-class-apply-undefined-list] [fixture:
  block/db-class-apply-mixed-list] [fixture:
  block/db-class-apply-in-block-later] [fixture: block/db-style-class-made]
  [fixture: block/db-composite-id-same-as-node-before] [fixture:
  block/db-composite-id-same-composite] [fixture:
  block/db-composite-id-same-nested] [fixture: block/db-space-class] [fixture:
  block/db-space-width-zero] [fixture: block/db-space-in-composite]
- The type of a shape is decided by the pair of the text that opens it and the
  text that closes it, which the lexer reads one after the other: the opening is
  one of `(((`... in the order of its rules (`-)`, `(-`, `))`, `)`, `(((`, `((`,
  `{{`, `{`, `>`, `([`, `(`, `[[`, `[|`, `[(`, `)))`, `[\`, `[/`, `[`), and the
  closing is the first of `(((`, `)))`, `))`, `}}`, `}`, `(-`, `-)`, `((`, `]]`,
  `(`, `])`, `\]`, `/]`, `)]`, `)`, `]>`, and `]` that fits. The pair `[` and
  `]`, `(` and `)`, `((` and `))`, `(((` and `)))`, `([` and `])`, `[[` and
  `]]`, `[(` and `)]`, `{` and `}`, `{{` and `}}`, `>` and `]`, `[/` and `/]`,
  `[\` and `\]`, `[/` and `\]`, `[\` and `/]` have a type, and any other pair
  has none (`na`), whichever closing token it ends with, while the label stays.
  A shape that is closed by `]>` with no directions after it is not a block
  arrow, and `<[` closed by a plain `]` is rejected. [fixture:
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
  block/db-closer-square-then-triple-open] [fixture: block/db-shape-odd-left]
  [fixture: block/db-shape-odd-double] [fixture: block/db-shape-minus-round]
  [fixture: block/db-shape-minus-reverse] [fixture:
  block/db-shape-mixed-round-square] [fixture:
  block/db-shape-mixed-square-round] [fixture: block/db-shape-mixed-arrow-brace]
  [fixture: block/db-shape-mixed-brace-square] [fixture:
  block/db-shape-mixed-double] [fixture: block/db-shape-mixed-circle-stadium]
  [fixture: block/db-shape-extra-close] [fixture: block/db-shape-square]
  [fixture: block/db-shape-round] [fixture: block/db-shape-circle] [fixture:
  block/db-shape-doublecircle] [fixture: block/db-shape-stadium] [fixture:
  block/db-shape-subroutine] [fixture: block/db-shape-cylinder] [fixture:
  block/db-shape-diamond] [fixture: block/db-shape-hexagon] [fixture:
  block/db-shape-rect-left-inv-arrow] [fixture: block/db-shape-lean-right]
  [fixture: block/db-shape-lean-left] [fixture: block/db-shape-trapezoid]
  [fixture: block/db-shape-inv-trapezoid] [fixture: block/db-shape-block-arrow]

## kanban

`normalizeKanban()` (`src/normalizers/kanban.ts`) reads
[`getData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L54-L97),
the form the renderer consumes, rather than merging it with the separate
internal section list. [fixture: kanban/db-metadata-all] [fixture:
kanban/db-decoration-class-item] [fixture: kanban/db-decoration-icon-section]

The summary is `{ nodes }`, with a section followed by its items, sections in
declaration order and items in the order of the internal node list. [fixture:
kanban/db-sections-items]

Each node keeps `id`, `label`, and `isGroup`; an item also keeps `parentId`, and
the optional fields are omitted when undefined. [fixture:
kanban/db-sections-items] [fixture: kanban/db-metadata-all]

`id` is the sanitized written id, or the description when no id precedes the
shape; spaces before a shape and trailing spaces in bare ids remain part of the
id. [fixture: kanban/db-name-no-id] [fixture: kanban/db-name-space-before-shape]
[fixture: kanban/db-name-trailing-space]

`label` is the sanitized description, or the bare id when there is no
description, with surrounding string and markdown delimiters removed but
internal whitespace retained. [fixture: kanban/db-name-two-words] [fixture:
kanban/db-markdown-label] [fixture: kanban/db-label-multiline] [fixture:
kanban/db-spaces-label]

The indentation decides the structure: a tab counts as one character, the first
node establishes the section indentation, a node with an equal indentation
starts a section, and every other node is attached to the most recent section.
The summary does not keep the indentation itself (`level`):
[the renderer](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanRenderer.ts#L16-L73)
tells a section from an item by `isGroup` and `parentId` and does not read
`level`. [fixture: kanban/db-indent-tabs] [fixture: kanban/db-indent-unindented]
[fixture: kanban/db-indent-deeper] [fixture: kanban/db-indent-shallower-last]

[`getSection()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L25-L48)
checks already stored nodes for indentation below the first section level, so a
final shallower item is accepted and a further node then causes rejection.
[fixture: kanban/db-indent-shallower-last] [fixture:
kanban/gram-indent-shallower-followed]

`isGroup` is true for a section and false for an item, and `parentId` is the
section id used by the Db's equality filter, rather than a reconstructed tree
parent. [fixture: kanban/db-sections-items] [fixture:
kanban/db-section-item-same-id]

Duplicate ids are not merged: repeated item definitions remain separate, and
each repeated section lists every item whose `parentId` equals that section id,
including items written under its other definitions. [fixture:
kanban/db-section-three-definitions] [fixture: kanban/db-item-three-definitions]
[fixture: kanban/db-metadata-repeated-id]

The names of `Object.prototype` and different letter cases remain ordinary,
distinct ids. [fixture: kanban/db-object-prototype-ids] [fixture:
kanban/db-name-case]

Both sections and items keep `ticket`, while only items expose `assigned`,
`priority`, and `icon` through `getData()`. [fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-section-ticket] [fixture:
kanban/db-metadata-section-assigned] [fixture:
kanban/db-metadata-section-priority] [fixture: kanban/db-metadata-section-icon]

[`addNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L99-L165)
reads metadata with YAML's JSON schema, applies only truthy values, converts
`ticket`, `assigned`, and `icon` with `toString()`, and retains `priority` as
its YAML value without checking the documented priority enumeration. [fixture:
kanban/db-metadata-ticket-number] [fixture: kanban/db-metadata-assigned-list]
[fixture: kanban/db-metadata-icon-true] [fixture:
kanban/db-metadata-priority-number] [fixture: kanban/db-metadata-priority-list]
[fixture: kanban/db-metadata-priorities] [fixture:
kanban/db-metadata-priority-zero] [fixture: kanban/db-metadata-priority-null]
[fixture: kanban/db-metadata-priority-overflow-word]

Infinite scalar priorities are recorded as `"Infinity"` or `"-Infinity"`, while
a scalar YAML `.nan` is falsy and is not assigned; non-finite values in a nested
list or mapping become `"Infinity"`, `"-Infinity"`, or `"NaN"`, and own keys
such as `__proto__` remain own keys. [fixture:
kanban/db-metadata-priority-non-finite] [fixture:
kanban/db-metadata-priority-nested-non-finite] [fixture:
kanban/db-metadata-priority-own-prototype-key]

A truthy metadata `label` replaces the description and is converted to text by
`getData()`; a false, zero, null, or empty label leaves the original
description. [fixture: kanban/db-metadata-label-number] [fixture:
kanban/db-metadata-label-list] [fixture: kanban/db-metadata-label-false]
[fixture: kanban/db-metadata-label-zero] [fixture:
kanban/db-metadata-label-null] [fixture: kanban/db-metadata-label-empty-string]

Metadata keys are case-sensitive, unknown keys have no effect, duplicate keys
are rejected by YAML, and inline mapping braces can end the lexer block before
YAML reads the nested value. [fixture: kanban/db-metadata-assigned-upper-key]
[fixture: kanban/db-metadata-unknown-key] [fixture:
kanban/gram-metadata-assigned-duplicate] [fixture:
kanban/gram-metadata-assigned-mapping]

An inline metadata block is wrapped in braces for YAML, while a block containing
a line feed is passed as a block mapping; a double-quoted line feed and
subsequent whitespace become `<br/>` before YAML parsing. A YAML comment on a
line of the block is ignored. [fixture: kanban/db-metadata-multiline] [fixture:
kanban/db-metadata-quoted-newline] [fixture:
kanban/db-metadata-single-quoted-newline] [fixture:
kanban/db-metadata-yaml-comment] [fixture: kanban/gram-metadata-two-blocks]

Adjacent `@{ ... }` blocks of one kanban node are read as one suffix whose
contents are concatenated, and one effect is recorded for the group. [fixture:
kanban/db-metadata-adjacent-comma] [fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-two-items] [fixture:
kanban/gram-metadata-two-blocks] [fixture: kanban/db-metadata-all]

A lower-case shape value without underscores is accepted without changing the
fixed kanban shape, but `kanbanItem` is rejected by the preceding lower-case
check, and a truthy non-string shape throws a TypeError. [fixture:
kanban/db-metadata-shape-lower] [fixture: kanban/db-metadata-shape-known-other]
[fixture: kanban/gram-metadata-shape-camel] [fixture:
kanban/gram-metadata-shape-underscore] [fixture:
kanban/gram-metadata-shape-number]

The last icon decoration replaces the previous item's icon, while empty icon and
class forms have no effect and a decoration before any node throws a TypeError.
[fixture: kanban/db-decoration-icon-twice] [fixture:
kanban/db-decoration-empty-icon] [fixture: kanban/db-decoration-empty-class]
[fixture: kanban/gram-decoration-before-node] [fixture:
kanban/gram-decoration-class-before-node]

The summary drops `shape` and `labelType`, whose values follow from `isGroup`
and are fixed to the kanban shapes and markdown labels, and drops the fixed
`rx`, `ry`, and `cssStyles`, the empty `edges` and `other`, and the
configuration and layout values `look`, `width`, `padding`, and the renderer's
element table. [fixture: kanban/db-metadata-all] [fixture:
kanban/db-shape-square] [fixture: kanban/db-shape-round] [fixture:
kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon] [fixture:
kanban/db-frontmatter-drawing-config] [fixture:
kanban/db-directive-drawing-config]

It also leaves out the section-only internal `assigned`, `priority`, `icon`, and
`cssClasses`, and item `cssClasses`, because `getData()` does not expose them;
this choice deliberately compares the renderer's Db reading. [fixture:
kanban/db-metadata-section-assigned] [fixture:
kanban/db-metadata-section-priority] [fixture: kanban/db-metadata-section-icon]
[fixture: kanban/db-decoration-class-section] [fixture:
kanban/db-decoration-class-item]

There are no title or accessibility setters in this Db: frontmatter titles add
no summary field, `title`, `accTitle:`, and `accDescr:` are ordinary node text,
and `accDescr {}` is rejected rather than acting as an empty description block.
[fixture: kanban/header-after-frontmatter] [fixture:
kanban/db-frontmatter-accessibility] [fixture: kanban/db-title-not-statement]
[fixture: kanban/db-acc-title-not-statement] [fixture:
kanban/db-acc-descr-not-statement] [fixture:
kanban/gram-acc-descr-block-not-statement] [fixture:
kanban/gram-empty-description-block-after-value] [fixture:
kanban/db-acc-descr-empty] [fixture: kanban/db-acc-title-next-statement]
[fixture: kanban/db-frontmatter-after-header] [fixture:
kanban/db-frontmatter-crlf] [fixture: kanban/db-frontmatter-title-number]

`patchKanbanDb()` records each accepted data block as `{ id, set }` in
`dataBlockEffects`, in application order, keeping separate entries for repeated
item ids. [fixture: kanban/db-metadata-all] [fixture:
kanban/db-metadata-repeated-id]

`set` contains the node summary fields changed by the block: `label` and
`ticket` for columns and items, and `assigned`, `priority`, and `icon` for
items; unexposed column metadata contributes no fields. [fixture:
kanban/db-metadata-all] [fixture: kanban/db-metadata-section-label] [fixture:
kanban/db-metadata-section-ticket] [fixture:
kanban/db-metadata-section-assigned] [fixture:
kanban/db-metadata-section-priority] [fixture: kanban/db-metadata-section-icon]

The effects keep mermaid.js's conversions even for values outside the documented
types: a numeric `ticket` becomes text, a list of assignees becomes comma-joined
text, a boolean icon becomes text, and a priority list stays a list, with nested
non-finite numbers represented as above. [fixture:
kanban/db-metadata-ticket-number] [fixture: kanban/db-metadata-assigned-list]
[fixture: kanban/db-metadata-icon-true] [fixture:
kanban/db-metadata-priority-list] [fixture:
kanban/db-metadata-priority-nested-non-finite]

An empty inline block, ignored keys, falsy values, and accepted `shape` values
record `set: {}` when they change no kept field; rejected shape values produce
no embedded effects. [fixture: kanban/db-metadata-empty] [fixture:
kanban/db-metadata-unknown-key] [fixture: kanban/db-metadata-assigned-upper-key]
[fixture: kanban/db-metadata-ticket-false] [fixture:
kanban/db-metadata-assigned-null] [fixture:
kanban/db-metadata-icon-empty-string] [fixture:
kanban/db-metadata-priority-zero] [fixture: kanban/db-metadata-label-false]
[fixture: kanban/db-metadata-shape-lower] [fixture:
kanban/db-metadata-shape-known-other] [fixture:
kanban/gram-metadata-shape-camel] [fixture: kanban/gram-metadata-shape-number]

A multiline block records the same changed fields, including the lexer's `<br/>`
conversion inside a double-quoted label; an empty multiline document and
duplicate keys are rejected and have no embedded effects. [fixture:
kanban/db-metadata-multiline] [fixture: kanban/db-metadata-quoted-newline]
[fixture: kanban/gram-metadata-empty-multiline] [fixture:
kanban/gram-metadata-label-duplicate] [fixture:
kanban/gram-metadata-ticket-duplicate] [fixture:
kanban/gram-metadata-assigned-duplicate] [fixture:
kanban/gram-metadata-priority-duplicate] [fixture:
kanban/gram-metadata-icon-duplicate] [fixture:
kanban/gram-metadata-shape-duplicate]

The patch compares the summaries after adding a node without and with its block
using the shared `blockEffect` mechanism; because the Db's state is private to
its module, it restores the prefix with the original node and decoration calls
after `clear()`, and resets the recorded effects and problems when the shared Db
is cleared for the next parse. [fixture: kanban/db-metadata-all] [fixture:
kanban/db-metadata-repeated-id] [fixture: kanban/db-decoration-icon-twice]
[fixture: kanban/header-only-lf]

The default, `strict`, `loose`, `antiscript`, and `sandbox` settings preserve
the same text with the shared sanitizers disabled. [fixture:
kanban/config-security-level-other-html-labels-false]

An unsupported `securityLevel` with HTML labels enabled replaces `<`, `>`, and
`=`, and normalizes break tags, while `htmlLabels` and its `flowchart` fallback
control whether this replacement occurs. [fixture:
kanban/config-security-level-other] [fixture:
kanban/config-security-level-other-html-labels-false] [fixture:
kanban/config-security-level-other-flowchart-html-labels-false] [fixture:
kanban/config-security-level-other-root-overrides-flowchart]

Kanban drawing settings, including `ticketBaseUrl`, and the mindmap width and
padding read while adding nodes change no kept field, so a ticket stays the
ticket text rather than becoming a URL. [fixture:
kanban/db-frontmatter-drawing-config] [fixture:
kanban/db-directive-drawing-config]

The detector requires lower-case `kanban`, while the case-insensitive lexer
reserves that word inside the document too; word characters glued to the header
can make an unrecognized first node, but a dash or a non-ASCII suffix can start
the first section. [fixture: kanban/header-upper-case] [fixture:
kanban/header-mixed-case] [fixture: kanban/header-word-suffix] [fixture:
kanban/header-digit-suffix] [fixture: kanban/header-dash-suffix] [fixture:
kanban/header-non-ascii-suffix] [fixture: kanban/lex-keyword-kanban-upper]

A header without a final line feed is rejected, while a line feed or a comment
supplies an empty document, and trailing whitespace on a header line can change
which lexer rule wins. [fixture: kanban/header-only] [fixture:
kanban/header-only-lf] [fixture: kanban/db-empty-board-comment] [fixture:
kanban/header-tab-trailing] [fixture: kanban/header-crlf-trailing]

A bare node consumes its line, including spaces, punctuation, and semicolons,
but a shaped node needs a statement stop after its closing delimiter and rejects
a semicolon suffix. [fixture: kanban/db-name-two-words] [fixture:
kanban/db-semicolon-bare-node] [fixture: kanban/lex-after-shape-semicolon]
[fixture: kanban/lex-after-bare-semicolon] [fixture:
kanban/gram-two-shapes-on-line]

Square, round, circle, hexagon, cloud, bang, and mismatched delimiters provide
descriptions without changing the fixed output shape; an empty bracketed or
quoted description is rejected, whereas a bare empty-string spelling is an id.
[fixture: kanban/db-shape-square] [fixture: kanban/db-shape-round] [fixture:
kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon] [fixture:
kanban/db-shape-cloud] [fixture: kanban/db-shape-bang] [fixture:
kanban/db-shape-mismatched] [fixture: kanban/gram-empty-label] [fixture:
kanban/gram-empty-quoted-label] [fixture: kanban/db-empty-string-node]

CRLF and lone CR are normalized to line feeds, while tabs, BOM, no-break and
ideographic spaces, and Unicode line and paragraph separators can participate in
indentation or in values rather than behaving as interchangeable statement
stops. [fixture: kanban/lex-crlf-quoted-value] [fixture:
kanban/lex-cr-quoted-value] [fixture: kanban/lex-tab-line-start] [fixture:
kanban/lex-bom-line-start] [fixture: kanban/lex-nbsp-line-start] [fixture:
kanban/lex-ideographic-line-start] [fixture: kanban/lex-ls-bare-value] [fixture:
kanban/lex-ps-bare-value]

Comment lines are removed even inside multiline descriptions and metadata,
inline percent pairs in quoted labels stay text, and closed directives are
removed with their surrounding fragments joined, while unclosed directives can
remove subsequent text. [fixture: kanban/lex-comment-quoted-line] [fixture:
kanban/lex-comment-quoted-inline] [fixture: kanban/db-metadata-comment-line]
[fixture: kanban/header-directive-inside] [fixture:
kanban/lex-directive-at-value-start] [fixture:
kanban/lex-directive-at-value-end] [fixture:
kanban/lex-directive-word-unclosed-next-line] [fixture:
kanban/lex-directive-colon-unclosed-next-line]

The shared preprocessing also replaces character references with placeholders
and removes the last semicolon of a matching `style:` or `classDef:` line,
including inside labels and metadata, while the spelling and line boundaries of
that rule determine when the semicolon stays. [fixture:
kanban/db-grid-entity-item-label-quoted] [fixture: kanban/lex-label-style-rule]
[fixture: kanban/lex-label-style-rule-upper] [fixture:
kanban/lex-label-style-rule-space] [fixture:
kanban/lex-label-style-rule-no-hash] [fixture:
kanban/lex-label-style-rule-two-semicolons] [fixture:
kanban/lex-label-classdef-rule] [fixture:
kanban/lex-label-style-rule-other-line] [fixture:
kanban/lex-style-entity-two-semicolons]

C4 detector words in ids, labels, and metadata can select a C4 diagram before
the kanban lexer runs, whereas those words in removed comments or frontmatter do
not; no fixture here assigns a divergence for this behavior. [fixture:
kanban/lex-c4-c4container-id] [fixture: kanban/lex-c4-c4component-label]
[fixture: kanban/lex-c4-c4dynamic-metadata] [fixture:
kanban/lex-c4-c4deployment-id] [fixture: kanban/lex-c4-c4container-comment]
[fixture: kanban/lex-c4-c4container-frontmatter] [fixture:
kanban/lex-c4-c4context-id]

The following fixtures write one text, a kind, in each of 33 places of a kanban
text, and record what the Db reads from it. A kind is named for the text that it
writes; a text with a character that is not printable ASCII, a backtick, or a
space at an end is shown by its code points.

| Kind               | Text                                |
| ------------------ | ----------------------------------- |
| `ampersand-entity` | `&amp;`                             |
| `arrow`            | `-->`                               |
| `arrow-spaced`     | U+0020 `-->` U+0020                 |
| `backslash`        | `\`                                 |
| `backtick`         | U+0060                              |
| `bom`              | U+FEFF                              |
| `classdef-rule`    | `classDef:#x;y`                     |
| `close-brace`      | `}`                                 |
| `close-round`      | `)`                                 |
| `close-square`     | `]`                                 |
| `colon`            | `:`                                 |
| `comma`            | `,`                                 |
| `comment`          | `%% c`                              |
| `comment-line`     | U+000A `%% c` U+000A                |
| `constructor`      | `constructor`                       |
| `cr`               | U+000D                              |
| `crlf`             | U+000D U+000A                       |
| `dash`             | `-`                                 |
| `digits`           | `123`                               |
| `directive`        | `%%{init: {}}%%`                    |
| `directive-line`   | U+000A `%%{init: {}}%%` U+000A      |
| `emoji`            | U+1F600                             |
| `empty`            | (empty)                             |
| `entity`           | `#35;`                              |
| `entity-named`     | `#amp;`                             |
| `equals`           | `=`                                 |
| `ff`               | U+000C                              |
| `greater-than`     | `>`                                 |
| `hash`             | `#`                                 |
| `html`             | `<b>`                               |
| `html-attribute`   | `<a href="x">`                      |
| `html-br`          | `<br>`                              |
| `ideographic`      | U+3000                              |
| `keyword`          | `kanban`                            |
| `keyword-block`    | U+0020 `block` U+0020               |
| `keyword-class`    | U+0020 `class A c` U+0020           |
| `keyword-classdef` | U+0020 `classDef c fill:red` U+0020 |
| `keyword-columns`  | U+0020 `columns 2` U+0020           |
| `keyword-end`      | U+0020 `end` U+0020                 |
| `keyword-header`   | U+0020 `kanban` U+0020              |
| `keyword-space`    | U+0020 `space` U+0020               |
| `keyword-style`    | U+0020 `style A fill:red` U+0020    |
| `less-than`        | `<`                                 |
| `lf`               | U+000A                              |
| `ls`               | U+2028                              |
| `nbsp`             | U+00A0                              |
| `nel`              | U+0085                              |
| `nonascii`         | U+00E9                              |
| `open-brace`       | `{`                                 |
| `open-round`       | `(`                                 |
| `open-square`      | `[`                                 |
| `percent`          | `%`                                 |
| `pipe`             | `                                   | `   |
| `proto`            | `__proto__`                         |
| `ps`               | U+2029                              |
| `punct`            | `!$&*+.,/=?^_~@`                    |
| `quote`            | `"`                                 |
| `root`             | `root`                              |
| `semicolon`        | `;`                                 |
| `single-quote`     | `'`                                 |
| `spaces`           | U+0020 U+0020                       |
| `style-rule`       | `style:#x;y`                        |
| `tab`              | U+0009                              |
| `vt`               | U+000B                              |

In each place below, the kinds that are not named are kept as written.

`header-line` is the text after `kanban` on the header line, which starts the
first section. Kept as the text of the first section: `ampersand-entity`,
`arrow`, `backslash`, `backtick`, `close-square`, `colon`, `comma`, `dash`,
`emoji`, `equals`, `greater-than`, `hash`, `html`, `html-br`, `less-than`,
`percent`, `pipe`, `quote`, `single-quote`. [fixture:
kanban/db-grid-ampersand-entity-header-line] [fixture:
kanban/db-grid-arrow-header-line] [fixture:
kanban/db-grid-backslash-header-line] [fixture:
kanban/db-grid-backtick-header-line] [fixture:
kanban/db-grid-close-square-header-line] [fixture:
kanban/db-grid-colon-header-line] [fixture: kanban/db-grid-comma-header-line]
[fixture: kanban/db-grid-dash-header-line] [fixture:
kanban/db-grid-emoji-header-line] [fixture: kanban/db-grid-equals-header-line]
[fixture: kanban/db-grid-greater-than-header-line] [fixture:
kanban/db-grid-hash-header-line] [fixture: kanban/db-grid-html-header-line]
[fixture: kanban/db-grid-html-br-header-line] [fixture:
kanban/db-grid-less-than-header-line] [fixture:
kanban/db-grid-percent-header-line] [fixture: kanban/db-grid-pipe-header-line]
[fixture: kanban/db-grid-quote-header-line] [fixture:
kanban/db-grid-single-quote-header-line] The whitespace before the text is
dropped and the rest kept: `arrow-spaced`, `keyword-block`, `keyword-class`,
`keyword-classdef`, `keyword-columns`, `keyword-end`, `keyword-space`,
`keyword-style`. [fixture: kanban/db-grid-arrow-spaced-header-line] [fixture:
kanban/db-grid-keyword-block-header-line] [fixture:
kanban/db-grid-keyword-class-header-line] [fixture:
kanban/db-grid-keyword-classdef-header-line] [fixture:
kanban/db-grid-keyword-columns-header-line] [fixture:
kanban/db-grid-keyword-end-header-line] [fixture:
kanban/db-grid-keyword-space-header-line] [fixture:
kanban/db-grid-keyword-style-header-line] No text, so the first section is the
one on the next line: `empty`. [fixture: kanban/db-grid-empty-header-line] The
double quotes of the HTML attribute are read as single quotes: `html-attribute`.
[fixture: kanban/db-grid-html-attribute-header-line] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-header-line] [fixture:
kanban/db-grid-entity-named-header-line] Rejected by the lexer: `close-brace`,
`open-brace`, `punct`. [fixture: kanban/gram-grid-close-brace-header-line]
[fixture: kanban/gram-grid-open-brace-header-line] [fixture:
kanban/gram-grid-punct-header-line] Rejected by the grammar: `classdef-rule`,
`close-round`, `comment-line`, `constructor`, `digits`, `directive-line`,
`keyword`, `keyword-header`, `lf`, `open-round`, `open-square`, `proto`, `root`,
`spaces`, `style-rule`. [fixture: kanban/gram-grid-classdef-rule-header-line]
[fixture: kanban/gram-grid-close-round-header-line] [fixture:
kanban/gram-grid-comment-line-header-line] [fixture:
kanban/gram-grid-constructor-header-line] [fixture:
kanban/gram-grid-digits-header-line] [fixture:
kanban/gram-grid-directive-line-header-line] [fixture:
kanban/gram-grid-keyword-header-line] [fixture:
kanban/gram-grid-keyword-header-header-line] [fixture:
kanban/gram-grid-lf-header-line] [fixture:
kanban/gram-grid-open-round-header-line] [fixture:
kanban/gram-grid-open-square-header-line] [fixture:
kanban/gram-grid-proto-header-line] [fixture: kanban/gram-grid-root-header-line]
[fixture: kanban/gram-grid-spaces-header-line] [fixture:
kanban/gram-grid-style-rule-header-line]

`section-id` is the id of a section, before its `[`. The double quotes of the
HTML attribute are read as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-section-id] Read as the placeholder of the entity
(common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-section-id] [fixture:
kanban/db-grid-entity-named-section-id] Removed as a directive: `directive`.
[fixture: kanban/db-grid-directive-section-id] The first `;` is dropped by the
line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-section-id] [fixture:
kanban/db-grid-style-rule-section-id] The value ends there and is `a`:
`close-round`, `open-round`, `open-square`. [fixture:
kanban/db-grid-close-round-section-id] [fixture:
kanban/db-grid-open-round-section-id] [fixture:
kanban/db-grid-open-square-section-id] Rejected by the lexer: `close-brace`,
`open-brace`, `punct`. [fixture: kanban/gram-grid-close-brace-section-id]
[fixture: kanban/gram-grid-open-brace-section-id] [fixture:
kanban/gram-grid-punct-section-id] Rejected by the Db: the items have no section
before them (`Items without section detected`): `comment-line`, `cr`, `crlf`,
`directive-line`, `lf`. [fixture: kanban/gram-grid-comment-line-section-id]
[fixture: kanban/gram-grid-cr-section-id] [fixture:
kanban/gram-grid-crlf-section-id] [fixture:
kanban/gram-grid-directive-line-section-id] [fixture:
kanban/gram-grid-lf-section-id] Kept as written: the other kinds. [fixture:
kanban/db-grid-ampersand-entity-section-id] [fixture:
kanban/db-grid-arrow-section-id] [fixture:
kanban/db-grid-arrow-spaced-section-id] [fixture:
kanban/db-grid-backslash-section-id] [fixture:
kanban/db-grid-backtick-section-id] [fixture: kanban/db-grid-bom-section-id]
[fixture: kanban/db-grid-close-square-section-id] [fixture:
kanban/db-grid-colon-section-id] [fixture: kanban/db-grid-comma-section-id]
[fixture: kanban/db-grid-comment-section-id] [fixture:
kanban/db-grid-constructor-section-id] [fixture: kanban/db-grid-dash-section-id]
[fixture: kanban/db-grid-digits-section-id] [fixture:
kanban/db-grid-emoji-section-id] [fixture: kanban/db-grid-empty-section-id]
[fixture: kanban/db-grid-equals-section-id] [fixture:
kanban/db-grid-ff-section-id] [fixture: kanban/db-grid-greater-than-section-id]
[fixture: kanban/db-grid-hash-section-id] [fixture:
kanban/db-grid-html-section-id] [fixture: kanban/db-grid-html-br-section-id]
[fixture: kanban/db-grid-ideographic-section-id] [fixture:
kanban/db-grid-keyword-section-id] [fixture:
kanban/db-grid-keyword-block-section-id] [fixture:
kanban/db-grid-keyword-class-section-id] [fixture:
kanban/db-grid-keyword-classdef-section-id] [fixture:
kanban/db-grid-keyword-columns-section-id] [fixture:
kanban/db-grid-keyword-end-section-id] [fixture:
kanban/db-grid-keyword-header-section-id] [fixture:
kanban/db-grid-keyword-space-section-id] [fixture:
kanban/db-grid-keyword-style-section-id] [fixture:
kanban/db-grid-less-than-section-id] [fixture: kanban/db-grid-ls-section-id]
[fixture: kanban/db-grid-nbsp-section-id] [fixture:
kanban/db-grid-nel-section-id] [fixture: kanban/db-grid-nonascii-section-id]
[fixture: kanban/db-grid-percent-section-id] [fixture:
kanban/db-grid-pipe-section-id] [fixture: kanban/db-grid-proto-section-id]
[fixture: kanban/db-grid-ps-section-id] [fixture:
kanban/db-grid-quote-section-id] [fixture: kanban/db-grid-root-section-id]
[fixture: kanban/db-grid-semicolon-section-id] [fixture:
kanban/db-grid-single-quote-section-id] [fixture:
kanban/db-grid-spaces-section-id] [fixture: kanban/db-grid-tab-section-id]
[fixture: kanban/db-grid-vt-section-id]

`item-id` is the id of an item, before its `[`. The double quotes of the HTML
attribute are read as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-item-id] Read as the placeholder of the entity
(common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-item-id] [fixture: kanban/db-grid-entity-named-item-id]
Removed as a directive: `directive`. [fixture: kanban/db-grid-directive-item-id]
The first `;` is dropped by the line rule: `classdef-rule`, `style-rule`.
[fixture: kanban/db-grid-classdef-rule-item-id] [fixture:
kanban/db-grid-style-rule-item-id] The value ends there and is `a`:
`close-round`, `comment-line`, `cr`, `crlf`, `directive-line`, `lf`,
`open-round`, `open-square`. [fixture: kanban/db-grid-close-round-item-id]
[fixture: kanban/db-grid-comment-line-item-id] [fixture:
kanban/db-grid-cr-item-id] [fixture: kanban/db-grid-crlf-item-id] [fixture:
kanban/db-grid-directive-line-item-id] [fixture: kanban/db-grid-lf-item-id]
[fixture: kanban/db-grid-open-round-item-id] [fixture:
kanban/db-grid-open-square-item-id] Rejected by the lexer: `close-brace`,
`open-brace`, `punct`. [fixture: kanban/gram-grid-close-brace-item-id] [fixture:
kanban/gram-grid-open-brace-item-id] [fixture: kanban/gram-grid-punct-item-id]
Kept as written: the other kinds. [fixture:
kanban/db-grid-ampersand-entity-item-id] [fixture: kanban/db-grid-arrow-item-id]
[fixture: kanban/db-grid-arrow-spaced-item-id] [fixture:
kanban/db-grid-backslash-item-id] [fixture: kanban/db-grid-backtick-item-id]
[fixture: kanban/db-grid-bom-item-id] [fixture:
kanban/db-grid-close-square-item-id] [fixture: kanban/db-grid-colon-item-id]
[fixture: kanban/db-grid-comma-item-id] [fixture:
kanban/db-grid-comment-item-id] [fixture: kanban/db-grid-constructor-item-id]
[fixture: kanban/db-grid-dash-item-id] [fixture: kanban/db-grid-digits-item-id]
[fixture: kanban/db-grid-emoji-item-id] [fixture: kanban/db-grid-empty-item-id]
[fixture: kanban/db-grid-equals-item-id] [fixture: kanban/db-grid-ff-item-id]
[fixture: kanban/db-grid-greater-than-item-id] [fixture:
kanban/db-grid-hash-item-id] [fixture: kanban/db-grid-html-item-id] [fixture:
kanban/db-grid-html-br-item-id] [fixture: kanban/db-grid-ideographic-item-id]
[fixture: kanban/db-grid-keyword-item-id] [fixture:
kanban/db-grid-keyword-block-item-id] [fixture:
kanban/db-grid-keyword-class-item-id] [fixture:
kanban/db-grid-keyword-classdef-item-id] [fixture:
kanban/db-grid-keyword-columns-item-id] [fixture:
kanban/db-grid-keyword-end-item-id] [fixture:
kanban/db-grid-keyword-header-item-id] [fixture:
kanban/db-grid-keyword-space-item-id] [fixture:
kanban/db-grid-keyword-style-item-id] [fixture:
kanban/db-grid-less-than-item-id] [fixture: kanban/db-grid-ls-item-id] [fixture:
kanban/db-grid-nbsp-item-id] [fixture: kanban/db-grid-nel-item-id] [fixture:
kanban/db-grid-nonascii-item-id] [fixture: kanban/db-grid-percent-item-id]
[fixture: kanban/db-grid-pipe-item-id] [fixture: kanban/db-grid-proto-item-id]
[fixture: kanban/db-grid-ps-item-id] [fixture: kanban/db-grid-quote-item-id]
[fixture: kanban/db-grid-root-item-id] [fixture:
kanban/db-grid-semicolon-item-id] [fixture: kanban/db-grid-single-quote-item-id]
[fixture: kanban/db-grid-spaces-item-id] [fixture: kanban/db-grid-tab-item-id]
[fixture: kanban/db-grid-vt-item-id]

`section-label-bare` is the label of a section in `[ ]`, without quotes. The
double quotes of the HTML attribute are read as single quotes: `html-attribute`.
[fixture: kanban/db-grid-html-attribute-section-label-bare] Read as the
placeholder of the entity (common.md, Entities): `entity`, `entity-named`.
[fixture: kanban/db-grid-entity-section-label-bare] [fixture:
kanban/db-grid-entity-named-section-label-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-section-label-bare] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-section-label-bare] [fixture:
kanban/db-grid-style-rule-section-label-bare] Read as one line feed:
`comment-line`, `cr`, `crlf`. [fixture:
kanban/db-grid-comment-line-section-label-bare] [fixture:
kanban/db-grid-cr-section-label-bare] [fixture:
kanban/db-grid-crlf-section-label-bare] Read as two line feeds:
`directive-line`. [fixture: kanban/db-grid-directive-line-section-label-bare]
Rejected by the grammar: `close-brace`, `close-round`, `close-square`,
`open-round`. [fixture: kanban/gram-grid-close-brace-section-label-bare]
[fixture: kanban/gram-grid-close-round-section-label-bare] [fixture:
kanban/gram-grid-close-square-section-label-bare] [fixture:
kanban/gram-grid-open-round-section-label-bare] Kept as written: the other
kinds. [fixture: kanban/db-grid-ampersand-entity-section-label-bare] [fixture:
kanban/db-grid-arrow-section-label-bare] [fixture:
kanban/db-grid-arrow-spaced-section-label-bare] [fixture:
kanban/db-grid-backslash-section-label-bare] [fixture:
kanban/db-grid-backtick-section-label-bare] [fixture:
kanban/db-grid-bom-section-label-bare] [fixture:
kanban/db-grid-colon-section-label-bare] [fixture:
kanban/db-grid-comma-section-label-bare] [fixture:
kanban/db-grid-comment-section-label-bare] [fixture:
kanban/db-grid-constructor-section-label-bare] [fixture:
kanban/db-grid-dash-section-label-bare] [fixture:
kanban/db-grid-digits-section-label-bare] [fixture:
kanban/db-grid-emoji-section-label-bare] [fixture:
kanban/db-grid-empty-section-label-bare] [fixture:
kanban/db-grid-equals-section-label-bare] [fixture:
kanban/db-grid-ff-section-label-bare] [fixture:
kanban/db-grid-greater-than-section-label-bare] [fixture:
kanban/db-grid-hash-section-label-bare] [fixture:
kanban/db-grid-html-section-label-bare] [fixture:
kanban/db-grid-html-br-section-label-bare] [fixture:
kanban/db-grid-ideographic-section-label-bare] [fixture:
kanban/db-grid-keyword-section-label-bare] [fixture:
kanban/db-grid-keyword-block-section-label-bare] [fixture:
kanban/db-grid-keyword-class-section-label-bare] [fixture:
kanban/db-grid-keyword-classdef-section-label-bare] [fixture:
kanban/db-grid-keyword-columns-section-label-bare] [fixture:
kanban/db-grid-keyword-end-section-label-bare] [fixture:
kanban/db-grid-keyword-header-section-label-bare] [fixture:
kanban/db-grid-keyword-space-section-label-bare] [fixture:
kanban/db-grid-keyword-style-section-label-bare] [fixture:
kanban/db-grid-less-than-section-label-bare] [fixture:
kanban/db-grid-lf-section-label-bare] [fixture:
kanban/db-grid-ls-section-label-bare] [fixture:
kanban/db-grid-nbsp-section-label-bare] [fixture:
kanban/db-grid-nel-section-label-bare] [fixture:
kanban/db-grid-nonascii-section-label-bare] [fixture:
kanban/db-grid-open-brace-section-label-bare] [fixture:
kanban/db-grid-open-square-section-label-bare] [fixture:
kanban/db-grid-percent-section-label-bare] [fixture:
kanban/db-grid-pipe-section-label-bare] [fixture:
kanban/db-grid-proto-section-label-bare] [fixture:
kanban/db-grid-ps-section-label-bare] [fixture:
kanban/db-grid-punct-section-label-bare] [fixture:
kanban/db-grid-quote-section-label-bare] [fixture:
kanban/db-grid-root-section-label-bare] [fixture:
kanban/db-grid-semicolon-section-label-bare] [fixture:
kanban/db-grid-single-quote-section-label-bare] [fixture:
kanban/db-grid-spaces-section-label-bare] [fixture:
kanban/db-grid-tab-section-label-bare] [fixture:
kanban/db-grid-vt-section-label-bare]

`section-label-quoted` is the label of a section in `[" "]`. The double quotes
of the HTML attribute are read as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-section-label-quoted] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-section-label-quoted] [fixture:
kanban/db-grid-entity-named-section-label-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-section-label-quoted] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-section-label-quoted] [fixture:
kanban/db-grid-style-rule-section-label-quoted] Read as one line feed:
`comment-line`, `cr`, `crlf`. [fixture:
kanban/db-grid-comment-line-section-label-quoted] [fixture:
kanban/db-grid-cr-section-label-quoted] [fixture:
kanban/db-grid-crlf-section-label-quoted] Read as two line feeds:
`directive-line`. [fixture: kanban/db-grid-directive-line-section-label-quoted]
Rejected by the grammar: `quote`. [fixture:
kanban/gram-grid-quote-section-label-quoted] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-section-label-quoted] [fixture:
kanban/db-grid-arrow-section-label-quoted] [fixture:
kanban/db-grid-arrow-spaced-section-label-quoted] [fixture:
kanban/db-grid-backslash-section-label-quoted] [fixture:
kanban/db-grid-backtick-section-label-quoted] [fixture:
kanban/db-grid-bom-section-label-quoted] [fixture:
kanban/db-grid-close-brace-section-label-quoted] [fixture:
kanban/db-grid-close-round-section-label-quoted] [fixture:
kanban/db-grid-close-square-section-label-quoted] [fixture:
kanban/db-grid-colon-section-label-quoted] [fixture:
kanban/db-grid-comma-section-label-quoted] [fixture:
kanban/db-grid-comment-section-label-quoted] [fixture:
kanban/db-grid-constructor-section-label-quoted] [fixture:
kanban/db-grid-dash-section-label-quoted] [fixture:
kanban/db-grid-digits-section-label-quoted] [fixture:
kanban/db-grid-emoji-section-label-quoted] [fixture:
kanban/db-grid-empty-section-label-quoted] [fixture:
kanban/db-grid-equals-section-label-quoted] [fixture:
kanban/db-grid-ff-section-label-quoted] [fixture:
kanban/db-grid-greater-than-section-label-quoted] [fixture:
kanban/db-grid-hash-section-label-quoted] [fixture:
kanban/db-grid-html-section-label-quoted] [fixture:
kanban/db-grid-html-br-section-label-quoted] [fixture:
kanban/db-grid-ideographic-section-label-quoted] [fixture:
kanban/db-grid-keyword-section-label-quoted] [fixture:
kanban/db-grid-keyword-block-section-label-quoted] [fixture:
kanban/db-grid-keyword-class-section-label-quoted] [fixture:
kanban/db-grid-keyword-classdef-section-label-quoted] [fixture:
kanban/db-grid-keyword-columns-section-label-quoted] [fixture:
kanban/db-grid-keyword-end-section-label-quoted] [fixture:
kanban/db-grid-keyword-header-section-label-quoted] [fixture:
kanban/db-grid-keyword-space-section-label-quoted] [fixture:
kanban/db-grid-keyword-style-section-label-quoted] [fixture:
kanban/db-grid-less-than-section-label-quoted] [fixture:
kanban/db-grid-lf-section-label-quoted] [fixture:
kanban/db-grid-ls-section-label-quoted] [fixture:
kanban/db-grid-nbsp-section-label-quoted] [fixture:
kanban/db-grid-nel-section-label-quoted] [fixture:
kanban/db-grid-nonascii-section-label-quoted] [fixture:
kanban/db-grid-open-brace-section-label-quoted] [fixture:
kanban/db-grid-open-round-section-label-quoted] [fixture:
kanban/db-grid-open-square-section-label-quoted] [fixture:
kanban/db-grid-percent-section-label-quoted] [fixture:
kanban/db-grid-pipe-section-label-quoted] [fixture:
kanban/db-grid-proto-section-label-quoted] [fixture:
kanban/db-grid-ps-section-label-quoted] [fixture:
kanban/db-grid-punct-section-label-quoted] [fixture:
kanban/db-grid-root-section-label-quoted] [fixture:
kanban/db-grid-semicolon-section-label-quoted] [fixture:
kanban/db-grid-single-quote-section-label-quoted] [fixture:
kanban/db-grid-spaces-section-label-quoted] [fixture:
kanban/db-grid-tab-section-label-quoted] [fixture:
kanban/db-grid-vt-section-label-quoted]

`section-label-markdown` is the label of a section in `["` `"]`, a markdown
string. The double quotes of the HTML attribute are read as single quotes:
`html-attribute`. [fixture:
kanban/db-grid-html-attribute-section-label-markdown] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-section-label-markdown] [fixture:
kanban/db-grid-entity-named-section-label-markdown] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-section-label-markdown] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-section-label-markdown] [fixture:
kanban/db-grid-style-rule-section-label-markdown] Read as one line feed:
`comment-line`, `cr`, `crlf`. [fixture:
kanban/db-grid-comment-line-section-label-markdown] [fixture:
kanban/db-grid-cr-section-label-markdown] [fixture:
kanban/db-grid-crlf-section-label-markdown] Read as two line feeds:
`directive-line`. [fixture:
kanban/db-grid-directive-line-section-label-markdown] Rejected by the lexer:
`backtick`, `quote`. [fixture: kanban/gram-grid-backtick-section-label-markdown]
[fixture: kanban/gram-grid-quote-section-label-markdown] Kept as written: the
other kinds. [fixture: kanban/db-grid-ampersand-entity-section-label-markdown]
[fixture: kanban/db-grid-arrow-section-label-markdown] [fixture:
kanban/db-grid-arrow-spaced-section-label-markdown] [fixture:
kanban/db-grid-backslash-section-label-markdown] [fixture:
kanban/db-grid-bom-section-label-markdown] [fixture:
kanban/db-grid-close-brace-section-label-markdown] [fixture:
kanban/db-grid-close-round-section-label-markdown] [fixture:
kanban/db-grid-close-square-section-label-markdown] [fixture:
kanban/db-grid-colon-section-label-markdown] [fixture:
kanban/db-grid-comma-section-label-markdown] [fixture:
kanban/db-grid-comment-section-label-markdown] [fixture:
kanban/db-grid-constructor-section-label-markdown] [fixture:
kanban/db-grid-dash-section-label-markdown] [fixture:
kanban/db-grid-digits-section-label-markdown] [fixture:
kanban/db-grid-emoji-section-label-markdown] [fixture:
kanban/db-grid-empty-section-label-markdown] [fixture:
kanban/db-grid-equals-section-label-markdown] [fixture:
kanban/db-grid-ff-section-label-markdown] [fixture:
kanban/db-grid-greater-than-section-label-markdown] [fixture:
kanban/db-grid-hash-section-label-markdown] [fixture:
kanban/db-grid-html-section-label-markdown] [fixture:
kanban/db-grid-html-br-section-label-markdown] [fixture:
kanban/db-grid-ideographic-section-label-markdown] [fixture:
kanban/db-grid-keyword-section-label-markdown] [fixture:
kanban/db-grid-keyword-block-section-label-markdown] [fixture:
kanban/db-grid-keyword-class-section-label-markdown] [fixture:
kanban/db-grid-keyword-classdef-section-label-markdown] [fixture:
kanban/db-grid-keyword-columns-section-label-markdown] [fixture:
kanban/db-grid-keyword-end-section-label-markdown] [fixture:
kanban/db-grid-keyword-header-section-label-markdown] [fixture:
kanban/db-grid-keyword-space-section-label-markdown] [fixture:
kanban/db-grid-keyword-style-section-label-markdown] [fixture:
kanban/db-grid-less-than-section-label-markdown] [fixture:
kanban/db-grid-lf-section-label-markdown] [fixture:
kanban/db-grid-ls-section-label-markdown] [fixture:
kanban/db-grid-nbsp-section-label-markdown] [fixture:
kanban/db-grid-nel-section-label-markdown] [fixture:
kanban/db-grid-nonascii-section-label-markdown] [fixture:
kanban/db-grid-open-brace-section-label-markdown] [fixture:
kanban/db-grid-open-round-section-label-markdown] [fixture:
kanban/db-grid-open-square-section-label-markdown] [fixture:
kanban/db-grid-percent-section-label-markdown] [fixture:
kanban/db-grid-pipe-section-label-markdown] [fixture:
kanban/db-grid-proto-section-label-markdown] [fixture:
kanban/db-grid-ps-section-label-markdown] [fixture:
kanban/db-grid-punct-section-label-markdown] [fixture:
kanban/db-grid-root-section-label-markdown] [fixture:
kanban/db-grid-semicolon-section-label-markdown] [fixture:
kanban/db-grid-single-quote-section-label-markdown] [fixture:
kanban/db-grid-spaces-section-label-markdown] [fixture:
kanban/db-grid-tab-section-label-markdown] [fixture:
kanban/db-grid-vt-section-label-markdown]

`item-label-bare` is the label of an item in `[ ]`, without quotes. The double
quotes of the HTML attribute are read as single quotes: `html-attribute`.
[fixture: kanban/db-grid-html-attribute-item-label-bare] Read as the placeholder
of the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-item-label-bare] [fixture:
kanban/db-grid-entity-named-item-label-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-item-label-bare] The first `;`
is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-item-label-bare] [fixture:
kanban/db-grid-style-rule-item-label-bare] Read as one line feed:
`comment-line`, `cr`, `crlf`. [fixture:
kanban/db-grid-comment-line-item-label-bare] [fixture:
kanban/db-grid-cr-item-label-bare] [fixture:
kanban/db-grid-crlf-item-label-bare] Read as two line feeds: `directive-line`.
[fixture: kanban/db-grid-directive-line-item-label-bare] Rejected by the
grammar: `close-brace`, `close-round`, `close-square`, `open-round`. [fixture:
kanban/gram-grid-close-brace-item-label-bare] [fixture:
kanban/gram-grid-close-round-item-label-bare] [fixture:
kanban/gram-grid-close-square-item-label-bare] [fixture:
kanban/gram-grid-open-round-item-label-bare] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-item-label-bare] [fixture:
kanban/db-grid-arrow-item-label-bare] [fixture:
kanban/db-grid-arrow-spaced-item-label-bare] [fixture:
kanban/db-grid-backslash-item-label-bare] [fixture:
kanban/db-grid-backtick-item-label-bare] [fixture:
kanban/db-grid-bom-item-label-bare] [fixture:
kanban/db-grid-colon-item-label-bare] [fixture:
kanban/db-grid-comma-item-label-bare] [fixture:
kanban/db-grid-comment-item-label-bare] [fixture:
kanban/db-grid-constructor-item-label-bare] [fixture:
kanban/db-grid-dash-item-label-bare] [fixture:
kanban/db-grid-digits-item-label-bare] [fixture:
kanban/db-grid-emoji-item-label-bare] [fixture:
kanban/db-grid-empty-item-label-bare] [fixture:
kanban/db-grid-equals-item-label-bare] [fixture:
kanban/db-grid-ff-item-label-bare] [fixture:
kanban/db-grid-greater-than-item-label-bare] [fixture:
kanban/db-grid-hash-item-label-bare] [fixture:
kanban/db-grid-html-item-label-bare] [fixture:
kanban/db-grid-html-br-item-label-bare] [fixture:
kanban/db-grid-ideographic-item-label-bare] [fixture:
kanban/db-grid-keyword-item-label-bare] [fixture:
kanban/db-grid-keyword-block-item-label-bare] [fixture:
kanban/db-grid-keyword-class-item-label-bare] [fixture:
kanban/db-grid-keyword-classdef-item-label-bare] [fixture:
kanban/db-grid-keyword-columns-item-label-bare] [fixture:
kanban/db-grid-keyword-end-item-label-bare] [fixture:
kanban/db-grid-keyword-header-item-label-bare] [fixture:
kanban/db-grid-keyword-space-item-label-bare] [fixture:
kanban/db-grid-keyword-style-item-label-bare] [fixture:
kanban/db-grid-less-than-item-label-bare] [fixture:
kanban/db-grid-lf-item-label-bare] [fixture: kanban/db-grid-ls-item-label-bare]
[fixture: kanban/db-grid-nbsp-item-label-bare] [fixture:
kanban/db-grid-nel-item-label-bare] [fixture:
kanban/db-grid-nonascii-item-label-bare] [fixture:
kanban/db-grid-open-brace-item-label-bare] [fixture:
kanban/db-grid-open-square-item-label-bare] [fixture:
kanban/db-grid-percent-item-label-bare] [fixture:
kanban/db-grid-pipe-item-label-bare] [fixture:
kanban/db-grid-proto-item-label-bare] [fixture:
kanban/db-grid-ps-item-label-bare] [fixture:
kanban/db-grid-punct-item-label-bare] [fixture:
kanban/db-grid-quote-item-label-bare] [fixture:
kanban/db-grid-root-item-label-bare] [fixture:
kanban/db-grid-semicolon-item-label-bare] [fixture:
kanban/db-grid-single-quote-item-label-bare] [fixture:
kanban/db-grid-spaces-item-label-bare] [fixture:
kanban/db-grid-tab-item-label-bare] [fixture: kanban/db-grid-vt-item-label-bare]

`item-label-quoted` is the label of an item in `[" "]`. The double quotes of the
HTML attribute are read as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-item-label-quoted] Read as the placeholder of the
entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-item-label-quoted] [fixture:
kanban/db-grid-entity-named-item-label-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-item-label-quoted] The first `;`
is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-item-label-quoted] [fixture:
kanban/db-grid-style-rule-item-label-quoted] Read as one line feed:
`comment-line`, `cr`, `crlf`. [fixture:
kanban/db-grid-comment-line-item-label-quoted] [fixture:
kanban/db-grid-cr-item-label-quoted] [fixture:
kanban/db-grid-crlf-item-label-quoted] Read as two line feeds: `directive-line`.
[fixture: kanban/db-grid-directive-line-item-label-quoted] Rejected by the
grammar: `quote`. [fixture: kanban/gram-grid-quote-item-label-quoted] Kept as
written: the other kinds. [fixture:
kanban/db-grid-ampersand-entity-item-label-quoted] [fixture:
kanban/db-grid-arrow-item-label-quoted] [fixture:
kanban/db-grid-arrow-spaced-item-label-quoted] [fixture:
kanban/db-grid-backslash-item-label-quoted] [fixture:
kanban/db-grid-backtick-item-label-quoted] [fixture:
kanban/db-grid-bom-item-label-quoted] [fixture:
kanban/db-grid-close-brace-item-label-quoted] [fixture:
kanban/db-grid-close-round-item-label-quoted] [fixture:
kanban/db-grid-close-square-item-label-quoted] [fixture:
kanban/db-grid-colon-item-label-quoted] [fixture:
kanban/db-grid-comma-item-label-quoted] [fixture:
kanban/db-grid-comment-item-label-quoted] [fixture:
kanban/db-grid-constructor-item-label-quoted] [fixture:
kanban/db-grid-dash-item-label-quoted] [fixture:
kanban/db-grid-digits-item-label-quoted] [fixture:
kanban/db-grid-emoji-item-label-quoted] [fixture:
kanban/db-grid-empty-item-label-quoted] [fixture:
kanban/db-grid-equals-item-label-quoted] [fixture:
kanban/db-grid-ff-item-label-quoted] [fixture:
kanban/db-grid-greater-than-item-label-quoted] [fixture:
kanban/db-grid-hash-item-label-quoted] [fixture:
kanban/db-grid-html-item-label-quoted] [fixture:
kanban/db-grid-html-br-item-label-quoted] [fixture:
kanban/db-grid-ideographic-item-label-quoted] [fixture:
kanban/db-grid-keyword-item-label-quoted] [fixture:
kanban/db-grid-keyword-block-item-label-quoted] [fixture:
kanban/db-grid-keyword-class-item-label-quoted] [fixture:
kanban/db-grid-keyword-classdef-item-label-quoted] [fixture:
kanban/db-grid-keyword-columns-item-label-quoted] [fixture:
kanban/db-grid-keyword-end-item-label-quoted] [fixture:
kanban/db-grid-keyword-header-item-label-quoted] [fixture:
kanban/db-grid-keyword-space-item-label-quoted] [fixture:
kanban/db-grid-keyword-style-item-label-quoted] [fixture:
kanban/db-grid-less-than-item-label-quoted] [fixture:
kanban/db-grid-lf-item-label-quoted] [fixture:
kanban/db-grid-ls-item-label-quoted] [fixture:
kanban/db-grid-nbsp-item-label-quoted] [fixture:
kanban/db-grid-nel-item-label-quoted] [fixture:
kanban/db-grid-nonascii-item-label-quoted] [fixture:
kanban/db-grid-open-brace-item-label-quoted] [fixture:
kanban/db-grid-open-round-item-label-quoted] [fixture:
kanban/db-grid-open-square-item-label-quoted] [fixture:
kanban/db-grid-percent-item-label-quoted] [fixture:
kanban/db-grid-pipe-item-label-quoted] [fixture:
kanban/db-grid-proto-item-label-quoted] [fixture:
kanban/db-grid-ps-item-label-quoted] [fixture:
kanban/db-grid-punct-item-label-quoted] [fixture:
kanban/db-grid-root-item-label-quoted] [fixture:
kanban/db-grid-semicolon-item-label-quoted] [fixture:
kanban/db-grid-single-quote-item-label-quoted] [fixture:
kanban/db-grid-spaces-item-label-quoted] [fixture:
kanban/db-grid-tab-item-label-quoted] [fixture:
kanban/db-grid-vt-item-label-quoted]

`item-label-markdown` is the label of an item in `["` `"]`, a markdown string.
The double quotes of the HTML attribute are read as single quotes:
`html-attribute`. [fixture: kanban/db-grid-html-attribute-item-label-markdown]
Read as the placeholder of the entity (common.md, Entities): `entity`,
`entity-named`. [fixture: kanban/db-grid-entity-item-label-markdown] [fixture:
kanban/db-grid-entity-named-item-label-markdown] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-item-label-markdown] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-item-label-markdown] [fixture:
kanban/db-grid-style-rule-item-label-markdown] Read as one line feed:
`comment-line`, `cr`, `crlf`. [fixture:
kanban/db-grid-comment-line-item-label-markdown] [fixture:
kanban/db-grid-cr-item-label-markdown] [fixture:
kanban/db-grid-crlf-item-label-markdown] Read as two line feeds:
`directive-line`. [fixture: kanban/db-grid-directive-line-item-label-markdown]
Rejected by the lexer: `backtick`, `quote`. [fixture:
kanban/gram-grid-backtick-item-label-markdown] [fixture:
kanban/gram-grid-quote-item-label-markdown] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-item-label-markdown] [fixture:
kanban/db-grid-arrow-item-label-markdown] [fixture:
kanban/db-grid-arrow-spaced-item-label-markdown] [fixture:
kanban/db-grid-backslash-item-label-markdown] [fixture:
kanban/db-grid-bom-item-label-markdown] [fixture:
kanban/db-grid-close-brace-item-label-markdown] [fixture:
kanban/db-grid-close-round-item-label-markdown] [fixture:
kanban/db-grid-close-square-item-label-markdown] [fixture:
kanban/db-grid-colon-item-label-markdown] [fixture:
kanban/db-grid-comma-item-label-markdown] [fixture:
kanban/db-grid-comment-item-label-markdown] [fixture:
kanban/db-grid-constructor-item-label-markdown] [fixture:
kanban/db-grid-dash-item-label-markdown] [fixture:
kanban/db-grid-digits-item-label-markdown] [fixture:
kanban/db-grid-emoji-item-label-markdown] [fixture:
kanban/db-grid-empty-item-label-markdown] [fixture:
kanban/db-grid-equals-item-label-markdown] [fixture:
kanban/db-grid-ff-item-label-markdown] [fixture:
kanban/db-grid-greater-than-item-label-markdown] [fixture:
kanban/db-grid-hash-item-label-markdown] [fixture:
kanban/db-grid-html-item-label-markdown] [fixture:
kanban/db-grid-html-br-item-label-markdown] [fixture:
kanban/db-grid-ideographic-item-label-markdown] [fixture:
kanban/db-grid-keyword-item-label-markdown] [fixture:
kanban/db-grid-keyword-block-item-label-markdown] [fixture:
kanban/db-grid-keyword-class-item-label-markdown] [fixture:
kanban/db-grid-keyword-classdef-item-label-markdown] [fixture:
kanban/db-grid-keyword-columns-item-label-markdown] [fixture:
kanban/db-grid-keyword-end-item-label-markdown] [fixture:
kanban/db-grid-keyword-header-item-label-markdown] [fixture:
kanban/db-grid-keyword-space-item-label-markdown] [fixture:
kanban/db-grid-keyword-style-item-label-markdown] [fixture:
kanban/db-grid-less-than-item-label-markdown] [fixture:
kanban/db-grid-lf-item-label-markdown] [fixture:
kanban/db-grid-ls-item-label-markdown] [fixture:
kanban/db-grid-nbsp-item-label-markdown] [fixture:
kanban/db-grid-nel-item-label-markdown] [fixture:
kanban/db-grid-nonascii-item-label-markdown] [fixture:
kanban/db-grid-open-brace-item-label-markdown] [fixture:
kanban/db-grid-open-round-item-label-markdown] [fixture:
kanban/db-grid-open-square-item-label-markdown] [fixture:
kanban/db-grid-percent-item-label-markdown] [fixture:
kanban/db-grid-pipe-item-label-markdown] [fixture:
kanban/db-grid-proto-item-label-markdown] [fixture:
kanban/db-grid-ps-item-label-markdown] [fixture:
kanban/db-grid-punct-item-label-markdown] [fixture:
kanban/db-grid-root-item-label-markdown] [fixture:
kanban/db-grid-semicolon-item-label-markdown] [fixture:
kanban/db-grid-single-quote-item-label-markdown] [fixture:
kanban/db-grid-spaces-item-label-markdown] [fixture:
kanban/db-grid-tab-item-label-markdown] [fixture:
kanban/db-grid-vt-item-label-markdown]

`section-icon` is the name in the `::icon( )` line after a section. Read, and
the summary does not change: `ampersand-entity`, `arrow`, `arrow-spaced`,
`backslash`, `backtick`, `bom`, `classdef-rule`, `close-brace`, `close-square`,
`colon`, `comma`, `comment`, `comment-line`, `constructor`, `cr`, `crlf`,
`dash`, `digits`, `directive`, `directive-line`, `emoji`, `empty`, `entity`,
`entity-named`, `equals`, `ff`, `greater-than`, `hash`, `html`,
`html-attribute`, `html-br`, `ideographic`, `keyword`, `keyword-block`,
`keyword-class`, `keyword-classdef`, `keyword-columns`, `keyword-end`,
`keyword-header`, `keyword-space`, `keyword-style`, `less-than`, `lf`, `ls`,
`nbsp`, `nel`, `nonascii`, `open-brace`, `open-round`, `open-square`, `percent`,
`pipe`, `proto`, `ps`, `punct`, `quote`, `root`, `semicolon`, `single-quote`,
`spaces`, `style-rule`, `tab`, `vt`. [fixture:
kanban/db-grid-ampersand-entity-section-icon] [fixture:
kanban/db-grid-arrow-section-icon] [fixture:
kanban/db-grid-arrow-spaced-section-icon] [fixture:
kanban/db-grid-backslash-section-icon] [fixture:
kanban/db-grid-backtick-section-icon] [fixture: kanban/db-grid-bom-section-icon]
[fixture: kanban/db-grid-classdef-rule-section-icon] [fixture:
kanban/db-grid-close-brace-section-icon] [fixture:
kanban/db-grid-close-square-section-icon] [fixture:
kanban/db-grid-colon-section-icon] [fixture: kanban/db-grid-comma-section-icon]
[fixture: kanban/db-grid-comment-section-icon] [fixture:
kanban/db-grid-comment-line-section-icon] [fixture:
kanban/db-grid-constructor-section-icon] [fixture:
kanban/db-grid-cr-section-icon] [fixture: kanban/db-grid-crlf-section-icon]
[fixture: kanban/db-grid-dash-section-icon] [fixture:
kanban/db-grid-digits-section-icon] [fixture:
kanban/db-grid-directive-section-icon] [fixture:
kanban/db-grid-directive-line-section-icon] [fixture:
kanban/db-grid-emoji-section-icon] [fixture: kanban/db-grid-empty-section-icon]
[fixture: kanban/db-grid-entity-section-icon] [fixture:
kanban/db-grid-entity-named-section-icon] [fixture:
kanban/db-grid-equals-section-icon] [fixture: kanban/db-grid-ff-section-icon]
[fixture: kanban/db-grid-greater-than-section-icon] [fixture:
kanban/db-grid-hash-section-icon] [fixture: kanban/db-grid-html-section-icon]
[fixture: kanban/db-grid-html-attribute-section-icon] [fixture:
kanban/db-grid-html-br-section-icon] [fixture:
kanban/db-grid-ideographic-section-icon] [fixture:
kanban/db-grid-keyword-section-icon] [fixture:
kanban/db-grid-keyword-block-section-icon] [fixture:
kanban/db-grid-keyword-class-section-icon] [fixture:
kanban/db-grid-keyword-classdef-section-icon] [fixture:
kanban/db-grid-keyword-columns-section-icon] [fixture:
kanban/db-grid-keyword-end-section-icon] [fixture:
kanban/db-grid-keyword-header-section-icon] [fixture:
kanban/db-grid-keyword-space-section-icon] [fixture:
kanban/db-grid-keyword-style-section-icon] [fixture:
kanban/db-grid-less-than-section-icon] [fixture: kanban/db-grid-lf-section-icon]
[fixture: kanban/db-grid-ls-section-icon] [fixture:
kanban/db-grid-nbsp-section-icon] [fixture: kanban/db-grid-nel-section-icon]
[fixture: kanban/db-grid-nonascii-section-icon] [fixture:
kanban/db-grid-open-brace-section-icon] [fixture:
kanban/db-grid-open-round-section-icon] [fixture:
kanban/db-grid-open-square-section-icon] [fixture:
kanban/db-grid-percent-section-icon] [fixture: kanban/db-grid-pipe-section-icon]
[fixture: kanban/db-grid-proto-section-icon] [fixture:
kanban/db-grid-ps-section-icon] [fixture: kanban/db-grid-punct-section-icon]
[fixture: kanban/db-grid-quote-section-icon] [fixture:
kanban/db-grid-root-section-icon] [fixture:
kanban/db-grid-semicolon-section-icon] [fixture:
kanban/db-grid-single-quote-section-icon] [fixture:
kanban/db-grid-spaces-section-icon] [fixture:
kanban/db-grid-style-rule-section-icon] [fixture:
kanban/db-grid-tab-section-icon] [fixture: kanban/db-grid-vt-section-icon]
Rejected by the grammar: `close-round`. [fixture:
kanban/gram-grid-close-round-section-icon]

`item-icon` is the name in the `::icon( )` line after an item. The double quotes
of the HTML attribute are read as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-item-icon] Read as the placeholder of the entity
(common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-item-icon] [fixture:
kanban/db-grid-entity-named-item-icon] Removed as a directive: `directive`.
[fixture: kanban/db-grid-directive-item-icon] The first `;` is dropped by the
line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-item-icon] [fixture:
kanban/db-grid-style-rule-item-icon] Read as one line feed: `comment-line`,
`cr`, `crlf`. [fixture: kanban/db-grid-comment-line-item-icon] [fixture:
kanban/db-grid-cr-item-icon] [fixture: kanban/db-grid-crlf-item-icon] Read as
two line feeds: `directive-line`. [fixture:
kanban/db-grid-directive-line-item-icon] Rejected by the grammar: `close-round`.
[fixture: kanban/gram-grid-close-round-item-icon] Kept as written: the other
kinds. [fixture: kanban/db-grid-ampersand-entity-item-icon] [fixture:
kanban/db-grid-arrow-item-icon] [fixture: kanban/db-grid-arrow-spaced-item-icon]
[fixture: kanban/db-grid-backslash-item-icon] [fixture:
kanban/db-grid-backtick-item-icon] [fixture: kanban/db-grid-bom-item-icon]
[fixture: kanban/db-grid-close-brace-item-icon] [fixture:
kanban/db-grid-close-square-item-icon] [fixture: kanban/db-grid-colon-item-icon]
[fixture: kanban/db-grid-comma-item-icon] [fixture:
kanban/db-grid-comment-item-icon] [fixture:
kanban/db-grid-constructor-item-icon] [fixture: kanban/db-grid-dash-item-icon]
[fixture: kanban/db-grid-digits-item-icon] [fixture:
kanban/db-grid-emoji-item-icon] [fixture: kanban/db-grid-empty-item-icon]
[fixture: kanban/db-grid-equals-item-icon] [fixture:
kanban/db-grid-ff-item-icon] [fixture: kanban/db-grid-greater-than-item-icon]
[fixture: kanban/db-grid-hash-item-icon] [fixture:
kanban/db-grid-html-item-icon] [fixture: kanban/db-grid-html-br-item-icon]
[fixture: kanban/db-grid-ideographic-item-icon] [fixture:
kanban/db-grid-keyword-item-icon] [fixture:
kanban/db-grid-keyword-block-item-icon] [fixture:
kanban/db-grid-keyword-class-item-icon] [fixture:
kanban/db-grid-keyword-classdef-item-icon] [fixture:
kanban/db-grid-keyword-columns-item-icon] [fixture:
kanban/db-grid-keyword-end-item-icon] [fixture:
kanban/db-grid-keyword-header-item-icon] [fixture:
kanban/db-grid-keyword-space-item-icon] [fixture:
kanban/db-grid-keyword-style-item-icon] [fixture:
kanban/db-grid-less-than-item-icon] [fixture: kanban/db-grid-lf-item-icon]
[fixture: kanban/db-grid-ls-item-icon] [fixture: kanban/db-grid-nbsp-item-icon]
[fixture: kanban/db-grid-nel-item-icon] [fixture:
kanban/db-grid-nonascii-item-icon] [fixture:
kanban/db-grid-open-brace-item-icon] [fixture:
kanban/db-grid-open-round-item-icon] [fixture:
kanban/db-grid-open-square-item-icon] [fixture:
kanban/db-grid-percent-item-icon] [fixture: kanban/db-grid-pipe-item-icon]
[fixture: kanban/db-grid-proto-item-icon] [fixture: kanban/db-grid-ps-item-icon]
[fixture: kanban/db-grid-punct-item-icon] [fixture:
kanban/db-grid-quote-item-icon] [fixture: kanban/db-grid-root-item-icon]
[fixture: kanban/db-grid-semicolon-item-icon] [fixture:
kanban/db-grid-single-quote-item-icon] [fixture:
kanban/db-grid-spaces-item-icon] [fixture: kanban/db-grid-tab-item-icon]
[fixture: kanban/db-grid-vt-item-icon]

`section-class` is the class in the `:::` line after a section. Read, and the
summary does not change: `ampersand-entity`, `arrow`, `arrow-spaced`,
`backslash`, `backtick`, `bom`, `classdef-rule`, `close-brace`, `close-round`,
`close-square`, `colon`, `comma`, `comment`, `constructor`, `dash`, `digits`,
`directive`, `emoji`, `empty`, `entity`, `entity-named`, `equals`, `ff`,
`greater-than`, `hash`, `html`, `html-attribute`, `html-br`, `ideographic`,
`keyword`, `keyword-block`, `keyword-class`, `keyword-classdef`,
`keyword-columns`, `keyword-end`, `keyword-header`, `keyword-space`,
`keyword-style`, `less-than`, `nbsp`, `nel`, `nonascii`, `open-brace`,
`open-round`, `open-square`, `percent`, `pipe`, `proto`, `punct`, `quote`,
`root`, `semicolon`, `single-quote`, `spaces`, `style-rule`, `tab`, `vt`.
[fixture: kanban/db-grid-ampersand-entity-section-class] [fixture:
kanban/db-grid-arrow-section-class] [fixture:
kanban/db-grid-arrow-spaced-section-class] [fixture:
kanban/db-grid-backslash-section-class] [fixture:
kanban/db-grid-backtick-section-class] [fixture:
kanban/db-grid-bom-section-class] [fixture:
kanban/db-grid-classdef-rule-section-class] [fixture:
kanban/db-grid-close-brace-section-class] [fixture:
kanban/db-grid-close-round-section-class] [fixture:
kanban/db-grid-close-square-section-class] [fixture:
kanban/db-grid-colon-section-class] [fixture:
kanban/db-grid-comma-section-class] [fixture:
kanban/db-grid-comment-section-class] [fixture:
kanban/db-grid-constructor-section-class] [fixture:
kanban/db-grid-dash-section-class] [fixture:
kanban/db-grid-digits-section-class] [fixture:
kanban/db-grid-directive-section-class] [fixture:
kanban/db-grid-emoji-section-class] [fixture:
kanban/db-grid-empty-section-class] [fixture:
kanban/db-grid-entity-section-class] [fixture:
kanban/db-grid-entity-named-section-class] [fixture:
kanban/db-grid-equals-section-class] [fixture: kanban/db-grid-ff-section-class]
[fixture: kanban/db-grid-greater-than-section-class] [fixture:
kanban/db-grid-hash-section-class] [fixture: kanban/db-grid-html-section-class]
[fixture: kanban/db-grid-html-attribute-section-class] [fixture:
kanban/db-grid-html-br-section-class] [fixture:
kanban/db-grid-ideographic-section-class] [fixture:
kanban/db-grid-keyword-section-class] [fixture:
kanban/db-grid-keyword-block-section-class] [fixture:
kanban/db-grid-keyword-class-section-class] [fixture:
kanban/db-grid-keyword-classdef-section-class] [fixture:
kanban/db-grid-keyword-columns-section-class] [fixture:
kanban/db-grid-keyword-end-section-class] [fixture:
kanban/db-grid-keyword-header-section-class] [fixture:
kanban/db-grid-keyword-space-section-class] [fixture:
kanban/db-grid-keyword-style-section-class] [fixture:
kanban/db-grid-less-than-section-class] [fixture:
kanban/db-grid-nbsp-section-class] [fixture: kanban/db-grid-nel-section-class]
[fixture: kanban/db-grid-nonascii-section-class] [fixture:
kanban/db-grid-open-brace-section-class] [fixture:
kanban/db-grid-open-round-section-class] [fixture:
kanban/db-grid-open-square-section-class] [fixture:
kanban/db-grid-percent-section-class] [fixture:
kanban/db-grid-pipe-section-class] [fixture: kanban/db-grid-proto-section-class]
[fixture: kanban/db-grid-punct-section-class] [fixture:
kanban/db-grid-quote-section-class] [fixture: kanban/db-grid-root-section-class]
[fixture: kanban/db-grid-semicolon-section-class] [fixture:
kanban/db-grid-single-quote-section-class] [fixture:
kanban/db-grid-spaces-section-class] [fixture:
kanban/db-grid-style-rule-section-class] [fixture:
kanban/db-grid-tab-section-class] [fixture: kanban/db-grid-vt-section-class]
Rejected by the grammar: `ls`, `ps`. [fixture:
kanban/gram-grid-ls-section-class] [fixture: kanban/gram-grid-ps-section-class]
Rejected by the Db: the items have no section before them
(`Items without section detected`): `comment-line`, `cr`, `crlf`,
`directive-line`, `lf`. [fixture: kanban/gram-grid-comment-line-section-class]
[fixture: kanban/gram-grid-cr-section-class] [fixture:
kanban/gram-grid-crlf-section-class] [fixture:
kanban/gram-grid-directive-line-section-class] [fixture:
kanban/gram-grid-lf-section-class]

`item-class` is the class in the `:::` line after an item. Read, and the summary
does not change: `ampersand-entity`, `arrow`, `arrow-spaced`, `backslash`,
`backtick`, `bom`, `classdef-rule`, `close-brace`, `close-round`,
`close-square`, `colon`, `comma`, `comment`, `comment-line`, `constructor`,
`cr`, `crlf`, `dash`, `digits`, `directive`, `directive-line`, `emoji`, `empty`,
`entity`, `entity-named`, `equals`, `ff`, `greater-than`, `hash`, `html`,
`html-attribute`, `html-br`, `ideographic`, `keyword`, `keyword-block`,
`keyword-class`, `keyword-classdef`, `keyword-columns`, `keyword-end`,
`keyword-header`, `keyword-space`, `keyword-style`, `less-than`, `lf`, `nbsp`,
`nel`, `nonascii`, `open-brace`, `open-round`, `open-square`, `percent`, `pipe`,
`proto`, `punct`, `quote`, `root`, `semicolon`, `single-quote`, `spaces`,
`style-rule`, `tab`, `vt`. [fixture: kanban/db-grid-ampersand-entity-item-class]
[fixture: kanban/db-grid-arrow-item-class] [fixture:
kanban/db-grid-arrow-spaced-item-class] [fixture:
kanban/db-grid-backslash-item-class] [fixture:
kanban/db-grid-backtick-item-class] [fixture: kanban/db-grid-bom-item-class]
[fixture: kanban/db-grid-classdef-rule-item-class] [fixture:
kanban/db-grid-close-brace-item-class] [fixture:
kanban/db-grid-close-round-item-class] [fixture:
kanban/db-grid-close-square-item-class] [fixture:
kanban/db-grid-colon-item-class] [fixture: kanban/db-grid-comma-item-class]
[fixture: kanban/db-grid-comment-item-class] [fixture:
kanban/db-grid-comment-line-item-class] [fixture:
kanban/db-grid-constructor-item-class] [fixture: kanban/db-grid-cr-item-class]
[fixture: kanban/db-grid-crlf-item-class] [fixture:
kanban/db-grid-dash-item-class] [fixture: kanban/db-grid-digits-item-class]
[fixture: kanban/db-grid-directive-item-class] [fixture:
kanban/db-grid-directive-line-item-class] [fixture:
kanban/db-grid-emoji-item-class] [fixture: kanban/db-grid-empty-item-class]
[fixture: kanban/db-grid-entity-item-class] [fixture:
kanban/db-grid-entity-named-item-class] [fixture:
kanban/db-grid-equals-item-class] [fixture: kanban/db-grid-ff-item-class]
[fixture: kanban/db-grid-greater-than-item-class] [fixture:
kanban/db-grid-hash-item-class] [fixture: kanban/db-grid-html-item-class]
[fixture: kanban/db-grid-html-attribute-item-class] [fixture:
kanban/db-grid-html-br-item-class] [fixture:
kanban/db-grid-ideographic-item-class] [fixture:
kanban/db-grid-keyword-item-class] [fixture:
kanban/db-grid-keyword-block-item-class] [fixture:
kanban/db-grid-keyword-class-item-class] [fixture:
kanban/db-grid-keyword-classdef-item-class] [fixture:
kanban/db-grid-keyword-columns-item-class] [fixture:
kanban/db-grid-keyword-end-item-class] [fixture:
kanban/db-grid-keyword-header-item-class] [fixture:
kanban/db-grid-keyword-space-item-class] [fixture:
kanban/db-grid-keyword-style-item-class] [fixture:
kanban/db-grid-less-than-item-class] [fixture: kanban/db-grid-lf-item-class]
[fixture: kanban/db-grid-nbsp-item-class] [fixture:
kanban/db-grid-nel-item-class] [fixture: kanban/db-grid-nonascii-item-class]
[fixture: kanban/db-grid-open-brace-item-class] [fixture:
kanban/db-grid-open-round-item-class] [fixture:
kanban/db-grid-open-square-item-class] [fixture:
kanban/db-grid-percent-item-class] [fixture: kanban/db-grid-pipe-item-class]
[fixture: kanban/db-grid-proto-item-class] [fixture:
kanban/db-grid-punct-item-class] [fixture: kanban/db-grid-quote-item-class]
[fixture: kanban/db-grid-root-item-class] [fixture:
kanban/db-grid-semicolon-item-class] [fixture:
kanban/db-grid-single-quote-item-class] [fixture:
kanban/db-grid-spaces-item-class] [fixture:
kanban/db-grid-style-rule-item-class] [fixture: kanban/db-grid-tab-item-class]
[fixture: kanban/db-grid-vt-item-class] Rejected by the grammar: `ls`, `ps`.
[fixture: kanban/gram-grid-ls-item-class] [fixture:
kanban/gram-grid-ps-item-class]

`metadata-key` is a key of the data block `@{ }` of an item. Read, and the
summary does not change: `ampersand-entity`, `arrow`, `arrow-spaced`,
`backslash`, `backtick`, `bom`, `classdef-rule`, `close-round`, `colon`,
`comma`, `comment`, `constructor`, `dash`, `digits`, `directive`, `emoji`,
`empty`, `entity`, `entity-named`, `equals`, `greater-than`, `hash`, `html`,
`html-attribute`, `html-br`, `ideographic`, `keyword`, `keyword-block`,
`keyword-class`, `keyword-classdef`, `keyword-columns`, `keyword-end`,
`keyword-header`, `keyword-space`, `keyword-style`, `less-than`, `ls`, `nbsp`,
`nel`, `nonascii`, `open-round`, `percent`, `pipe`, `proto`, `ps`, `root`,
`semicolon`, `single-quote`, `spaces`, `style-rule`, `tab`. [fixture:
kanban/db-grid-ampersand-entity-metadata-key] [fixture:
kanban/db-grid-arrow-metadata-key] [fixture:
kanban/db-grid-arrow-spaced-metadata-key] [fixture:
kanban/db-grid-backslash-metadata-key] [fixture:
kanban/db-grid-backtick-metadata-key] [fixture: kanban/db-grid-bom-metadata-key]
[fixture: kanban/db-grid-classdef-rule-metadata-key] [fixture:
kanban/db-grid-close-round-metadata-key] [fixture:
kanban/db-grid-colon-metadata-key] [fixture: kanban/db-grid-comma-metadata-key]
[fixture: kanban/db-grid-comment-metadata-key] [fixture:
kanban/db-grid-constructor-metadata-key] [fixture:
kanban/db-grid-dash-metadata-key] [fixture: kanban/db-grid-digits-metadata-key]
[fixture: kanban/db-grid-directive-metadata-key] [fixture:
kanban/db-grid-emoji-metadata-key] [fixture: kanban/db-grid-empty-metadata-key]
[fixture: kanban/db-grid-entity-metadata-key] [fixture:
kanban/db-grid-entity-named-metadata-key] [fixture:
kanban/db-grid-equals-metadata-key] [fixture:
kanban/db-grid-greater-than-metadata-key] [fixture:
kanban/db-grid-hash-metadata-key] [fixture: kanban/db-grid-html-metadata-key]
[fixture: kanban/db-grid-html-attribute-metadata-key] [fixture:
kanban/db-grid-html-br-metadata-key] [fixture:
kanban/db-grid-ideographic-metadata-key] [fixture:
kanban/db-grid-keyword-metadata-key] [fixture:
kanban/db-grid-keyword-block-metadata-key] [fixture:
kanban/db-grid-keyword-class-metadata-key] [fixture:
kanban/db-grid-keyword-classdef-metadata-key] [fixture:
kanban/db-grid-keyword-columns-metadata-key] [fixture:
kanban/db-grid-keyword-end-metadata-key] [fixture:
kanban/db-grid-keyword-header-metadata-key] [fixture:
kanban/db-grid-keyword-space-metadata-key] [fixture:
kanban/db-grid-keyword-style-metadata-key] [fixture:
kanban/db-grid-less-than-metadata-key] [fixture: kanban/db-grid-ls-metadata-key]
[fixture: kanban/db-grid-nbsp-metadata-key] [fixture:
kanban/db-grid-nel-metadata-key] [fixture: kanban/db-grid-nonascii-metadata-key]
[fixture: kanban/db-grid-open-round-metadata-key] [fixture:
kanban/db-grid-percent-metadata-key] [fixture: kanban/db-grid-pipe-metadata-key]
[fixture: kanban/db-grid-proto-metadata-key] [fixture:
kanban/db-grid-ps-metadata-key] [fixture: kanban/db-grid-root-metadata-key]
[fixture: kanban/db-grid-semicolon-metadata-key] [fixture:
kanban/db-grid-single-quote-metadata-key] [fixture:
kanban/db-grid-spaces-metadata-key] [fixture:
kanban/db-grid-style-rule-metadata-key] [fixture:
kanban/db-grid-tab-metadata-key] Rejected by the lexer: `punct`. [fixture:
kanban/gram-grid-punct-metadata-key] Rejected by the grammar: `close-brace`,
`quote`. [fixture: kanban/gram-grid-close-brace-metadata-key] [fixture:
kanban/gram-grid-quote-metadata-key] Rejected by the YAML of the data block:
`close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`, `lf`,
`open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-key] [fixture:
kanban/gram-grid-comment-line-metadata-key] [fixture:
kanban/gram-grid-cr-metadata-key] [fixture: kanban/gram-grid-crlf-metadata-key]
[fixture: kanban/gram-grid-directive-line-metadata-key] [fixture:
kanban/gram-grid-ff-metadata-key] [fixture: kanban/gram-grid-lf-metadata-key]
[fixture: kanban/gram-grid-open-brace-metadata-key] [fixture:
kanban/gram-grid-open-square-metadata-key] [fixture:
kanban/gram-grid-vt-metadata-key]

`metadata-multiline` is the value of `label` in a data block of an item that
spans lines. The double quotes of the HTML attribute are read as single quotes:
`html-attribute`. [fixture: kanban/db-grid-html-attribute-metadata-multiline]
Read as the placeholder of the entity (common.md, Entities): `entity`,
`entity-named`. [fixture: kanban/db-grid-entity-metadata-multiline] [fixture:
kanban/db-grid-entity-named-metadata-multiline] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-multiline] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-multiline] [fixture:
kanban/db-grid-style-rule-metadata-multiline] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-multiline] Rejected by the grammar:
`close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-multiline] [fixture:
kanban/gram-grid-quote-metadata-multiline] Rejected by the YAML of the data
block: `comment-line`, `cr`, `crlf`, `directive-line`, `ff`, `lf`, `vt`.
[fixture: kanban/gram-grid-comment-line-metadata-multiline] [fixture:
kanban/gram-grid-cr-metadata-multiline] [fixture:
kanban/gram-grid-crlf-metadata-multiline] [fixture:
kanban/gram-grid-directive-line-metadata-multiline] [fixture:
kanban/gram-grid-ff-metadata-multiline] [fixture:
kanban/gram-grid-lf-metadata-multiline] [fixture:
kanban/gram-grid-vt-metadata-multiline] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-multiline] [fixture:
kanban/db-grid-arrow-metadata-multiline] [fixture:
kanban/db-grid-arrow-spaced-metadata-multiline] [fixture:
kanban/db-grid-backslash-metadata-multiline] [fixture:
kanban/db-grid-backtick-metadata-multiline] [fixture:
kanban/db-grid-bom-metadata-multiline] [fixture:
kanban/db-grid-close-round-metadata-multiline] [fixture:
kanban/db-grid-close-square-metadata-multiline] [fixture:
kanban/db-grid-colon-metadata-multiline] [fixture:
kanban/db-grid-comma-metadata-multiline] [fixture:
kanban/db-grid-comment-metadata-multiline] [fixture:
kanban/db-grid-constructor-metadata-multiline] [fixture:
kanban/db-grid-dash-metadata-multiline] [fixture:
kanban/db-grid-digits-metadata-multiline] [fixture:
kanban/db-grid-emoji-metadata-multiline] [fixture:
kanban/db-grid-empty-metadata-multiline] [fixture:
kanban/db-grid-equals-metadata-multiline] [fixture:
kanban/db-grid-greater-than-metadata-multiline] [fixture:
kanban/db-grid-hash-metadata-multiline] [fixture:
kanban/db-grid-html-metadata-multiline] [fixture:
kanban/db-grid-html-br-metadata-multiline] [fixture:
kanban/db-grid-ideographic-metadata-multiline] [fixture:
kanban/db-grid-keyword-metadata-multiline] [fixture:
kanban/db-grid-keyword-block-metadata-multiline] [fixture:
kanban/db-grid-keyword-class-metadata-multiline] [fixture:
kanban/db-grid-keyword-classdef-metadata-multiline] [fixture:
kanban/db-grid-keyword-columns-metadata-multiline] [fixture:
kanban/db-grid-keyword-end-metadata-multiline] [fixture:
kanban/db-grid-keyword-header-metadata-multiline] [fixture:
kanban/db-grid-keyword-space-metadata-multiline] [fixture:
kanban/db-grid-keyword-style-metadata-multiline] [fixture:
kanban/db-grid-less-than-metadata-multiline] [fixture:
kanban/db-grid-ls-metadata-multiline] [fixture:
kanban/db-grid-nbsp-metadata-multiline] [fixture:
kanban/db-grid-nel-metadata-multiline] [fixture:
kanban/db-grid-nonascii-metadata-multiline] [fixture:
kanban/db-grid-open-brace-metadata-multiline] [fixture:
kanban/db-grid-open-round-metadata-multiline] [fixture:
kanban/db-grid-open-square-metadata-multiline] [fixture:
kanban/db-grid-percent-metadata-multiline] [fixture:
kanban/db-grid-pipe-metadata-multiline] [fixture:
kanban/db-grid-proto-metadata-multiline] [fixture:
kanban/db-grid-ps-metadata-multiline] [fixture:
kanban/db-grid-root-metadata-multiline] [fixture:
kanban/db-grid-semicolon-metadata-multiline] [fixture:
kanban/db-grid-single-quote-metadata-multiline] [fixture:
kanban/db-grid-spaces-metadata-multiline] [fixture:
kanban/db-grid-tab-metadata-multiline]

`metadata-label-bare` is the value of `label` in the data block of an item,
written without quotes. The double quotes of the HTML attribute are read as
single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-label-bare] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-label-bare] [fixture:
kanban/db-grid-entity-named-metadata-label-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-label-bare] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-label-bare] [fixture:
kanban/db-grid-style-rule-metadata-label-bare] The value ends there and is `a`:
`comma`. [fixture: kanban/db-grid-comma-metadata-label-bare] Rejected by the
lexer: `punct`. [fixture: kanban/gram-grid-punct-metadata-label-bare] Rejected
by the grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-label-bare] [fixture:
kanban/gram-grid-quote-metadata-label-bare] Rejected by the YAML of the data
block: `close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`,
`lf`, `open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-label-bare] [fixture:
kanban/gram-grid-comment-line-metadata-label-bare] [fixture:
kanban/gram-grid-cr-metadata-label-bare] [fixture:
kanban/gram-grid-crlf-metadata-label-bare] [fixture:
kanban/gram-grid-directive-line-metadata-label-bare] [fixture:
kanban/gram-grid-ff-metadata-label-bare] [fixture:
kanban/gram-grid-lf-metadata-label-bare] [fixture:
kanban/gram-grid-open-brace-metadata-label-bare] [fixture:
kanban/gram-grid-open-square-metadata-label-bare] [fixture:
kanban/gram-grid-vt-metadata-label-bare] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-label-bare] [fixture:
kanban/db-grid-arrow-metadata-label-bare] [fixture:
kanban/db-grid-arrow-spaced-metadata-label-bare] [fixture:
kanban/db-grid-backslash-metadata-label-bare] [fixture:
kanban/db-grid-backtick-metadata-label-bare] [fixture:
kanban/db-grid-bom-metadata-label-bare] [fixture:
kanban/db-grid-close-round-metadata-label-bare] [fixture:
kanban/db-grid-colon-metadata-label-bare] [fixture:
kanban/db-grid-comment-metadata-label-bare] [fixture:
kanban/db-grid-constructor-metadata-label-bare] [fixture:
kanban/db-grid-dash-metadata-label-bare] [fixture:
kanban/db-grid-digits-metadata-label-bare] [fixture:
kanban/db-grid-emoji-metadata-label-bare] [fixture:
kanban/db-grid-empty-metadata-label-bare] [fixture:
kanban/db-grid-equals-metadata-label-bare] [fixture:
kanban/db-grid-greater-than-metadata-label-bare] [fixture:
kanban/db-grid-hash-metadata-label-bare] [fixture:
kanban/db-grid-html-metadata-label-bare] [fixture:
kanban/db-grid-html-br-metadata-label-bare] [fixture:
kanban/db-grid-ideographic-metadata-label-bare] [fixture:
kanban/db-grid-keyword-metadata-label-bare] [fixture:
kanban/db-grid-keyword-block-metadata-label-bare] [fixture:
kanban/db-grid-keyword-class-metadata-label-bare] [fixture:
kanban/db-grid-keyword-classdef-metadata-label-bare] [fixture:
kanban/db-grid-keyword-columns-metadata-label-bare] [fixture:
kanban/db-grid-keyword-end-metadata-label-bare] [fixture:
kanban/db-grid-keyword-header-metadata-label-bare] [fixture:
kanban/db-grid-keyword-space-metadata-label-bare] [fixture:
kanban/db-grid-keyword-style-metadata-label-bare] [fixture:
kanban/db-grid-less-than-metadata-label-bare] [fixture:
kanban/db-grid-ls-metadata-label-bare] [fixture:
kanban/db-grid-nbsp-metadata-label-bare] [fixture:
kanban/db-grid-nel-metadata-label-bare] [fixture:
kanban/db-grid-nonascii-metadata-label-bare] [fixture:
kanban/db-grid-open-round-metadata-label-bare] [fixture:
kanban/db-grid-percent-metadata-label-bare] [fixture:
kanban/db-grid-pipe-metadata-label-bare] [fixture:
kanban/db-grid-proto-metadata-label-bare] [fixture:
kanban/db-grid-ps-metadata-label-bare] [fixture:
kanban/db-grid-root-metadata-label-bare] [fixture:
kanban/db-grid-semicolon-metadata-label-bare] [fixture:
kanban/db-grid-single-quote-metadata-label-bare] [fixture:
kanban/db-grid-spaces-metadata-label-bare] [fixture:
kanban/db-grid-tab-metadata-label-bare]

`metadata-label-single` is the value of `label` in the data block of an item, in
single quotes. Read as the placeholder of the entity (common.md, Entities):
`entity`, `entity-named`. [fixture: kanban/db-grid-entity-metadata-label-single]
[fixture: kanban/db-grid-entity-named-metadata-label-single] Removed as a
directive: `directive`. [fixture:
kanban/db-grid-directive-metadata-label-single] The first `;` is dropped by the
line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-label-single] [fixture:
kanban/db-grid-style-rule-metadata-label-single] Read as one line feed:
`directive-line`. [fixture: kanban/db-grid-directive-line-metadata-label-single]
Read as one space, as YAML folds the line break: `comment-line`, `cr`, `crlf`,
`lf`. [fixture: kanban/db-grid-comment-line-metadata-label-single] [fixture:
kanban/db-grid-cr-metadata-label-single] [fixture:
kanban/db-grid-crlf-metadata-label-single] [fixture:
kanban/db-grid-lf-metadata-label-single] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-label-single] Rejected by the grammar:
`close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-label-single] [fixture:
kanban/gram-grid-quote-metadata-label-single] Rejected by the YAML of the data
block: `ff`, `html-attribute`, `single-quote`, `vt`. [fixture:
kanban/gram-grid-ff-metadata-label-single] [fixture:
kanban/gram-grid-html-attribute-metadata-label-single] [fixture:
kanban/gram-grid-single-quote-metadata-label-single] [fixture:
kanban/gram-grid-vt-metadata-label-single] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-label-single] [fixture:
kanban/db-grid-arrow-metadata-label-single] [fixture:
kanban/db-grid-arrow-spaced-metadata-label-single] [fixture:
kanban/db-grid-backslash-metadata-label-single] [fixture:
kanban/db-grid-backtick-metadata-label-single] [fixture:
kanban/db-grid-bom-metadata-label-single] [fixture:
kanban/db-grid-close-round-metadata-label-single] [fixture:
kanban/db-grid-close-square-metadata-label-single] [fixture:
kanban/db-grid-colon-metadata-label-single] [fixture:
kanban/db-grid-comma-metadata-label-single] [fixture:
kanban/db-grid-comment-metadata-label-single] [fixture:
kanban/db-grid-constructor-metadata-label-single] [fixture:
kanban/db-grid-dash-metadata-label-single] [fixture:
kanban/db-grid-digits-metadata-label-single] [fixture:
kanban/db-grid-emoji-metadata-label-single] [fixture:
kanban/db-grid-empty-metadata-label-single] [fixture:
kanban/db-grid-equals-metadata-label-single] [fixture:
kanban/db-grid-greater-than-metadata-label-single] [fixture:
kanban/db-grid-hash-metadata-label-single] [fixture:
kanban/db-grid-html-metadata-label-single] [fixture:
kanban/db-grid-html-br-metadata-label-single] [fixture:
kanban/db-grid-ideographic-metadata-label-single] [fixture:
kanban/db-grid-keyword-metadata-label-single] [fixture:
kanban/db-grid-keyword-block-metadata-label-single] [fixture:
kanban/db-grid-keyword-class-metadata-label-single] [fixture:
kanban/db-grid-keyword-classdef-metadata-label-single] [fixture:
kanban/db-grid-keyword-columns-metadata-label-single] [fixture:
kanban/db-grid-keyword-end-metadata-label-single] [fixture:
kanban/db-grid-keyword-header-metadata-label-single] [fixture:
kanban/db-grid-keyword-space-metadata-label-single] [fixture:
kanban/db-grid-keyword-style-metadata-label-single] [fixture:
kanban/db-grid-less-than-metadata-label-single] [fixture:
kanban/db-grid-ls-metadata-label-single] [fixture:
kanban/db-grid-nbsp-metadata-label-single] [fixture:
kanban/db-grid-nel-metadata-label-single] [fixture:
kanban/db-grid-nonascii-metadata-label-single] [fixture:
kanban/db-grid-open-brace-metadata-label-single] [fixture:
kanban/db-grid-open-round-metadata-label-single] [fixture:
kanban/db-grid-open-square-metadata-label-single] [fixture:
kanban/db-grid-percent-metadata-label-single] [fixture:
kanban/db-grid-pipe-metadata-label-single] [fixture:
kanban/db-grid-proto-metadata-label-single] [fixture:
kanban/db-grid-ps-metadata-label-single] [fixture:
kanban/db-grid-root-metadata-label-single] [fixture:
kanban/db-grid-semicolon-metadata-label-single] [fixture:
kanban/db-grid-spaces-metadata-label-single] [fixture:
kanban/db-grid-tab-metadata-label-single]

`metadata-label-quoted` is the value of `label` in the data block of an item, in
double quotes. The double quotes of the HTML attribute are read as single
quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-label-quoted] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-label-quoted] [fixture:
kanban/db-grid-entity-named-metadata-label-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-label-quoted] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-label-quoted] [fixture:
kanban/db-grid-style-rule-metadata-label-quoted] Read as `<br/>`:
`comment-line`, `cr`, `crlf`, `directive-line`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-label-quoted] [fixture:
kanban/db-grid-cr-metadata-label-quoted] [fixture:
kanban/db-grid-crlf-metadata-label-quoted] [fixture:
kanban/db-grid-directive-line-metadata-label-quoted] [fixture:
kanban/db-grid-lf-metadata-label-quoted] Read as a backspace, the YAML escape
`\b`: `backslash`. [fixture: kanban/db-grid-backslash-metadata-label-quoted]
Rejected by the grammar: `quote`. [fixture:
kanban/gram-grid-quote-metadata-label-quoted] Rejected by the YAML of the data
block: `ff`, `vt`. [fixture: kanban/gram-grid-ff-metadata-label-quoted]
[fixture: kanban/gram-grid-vt-metadata-label-quoted] Kept as written: the other
kinds. [fixture: kanban/db-grid-ampersand-entity-metadata-label-quoted]
[fixture: kanban/db-grid-arrow-metadata-label-quoted] [fixture:
kanban/db-grid-arrow-spaced-metadata-label-quoted] [fixture:
kanban/db-grid-backtick-metadata-label-quoted] [fixture:
kanban/db-grid-bom-metadata-label-quoted] [fixture:
kanban/db-grid-close-brace-metadata-label-quoted] [fixture:
kanban/db-grid-close-round-metadata-label-quoted] [fixture:
kanban/db-grid-close-square-metadata-label-quoted] [fixture:
kanban/db-grid-colon-metadata-label-quoted] [fixture:
kanban/db-grid-comma-metadata-label-quoted] [fixture:
kanban/db-grid-comment-metadata-label-quoted] [fixture:
kanban/db-grid-constructor-metadata-label-quoted] [fixture:
kanban/db-grid-dash-metadata-label-quoted] [fixture:
kanban/db-grid-digits-metadata-label-quoted] [fixture:
kanban/db-grid-emoji-metadata-label-quoted] [fixture:
kanban/db-grid-empty-metadata-label-quoted] [fixture:
kanban/db-grid-equals-metadata-label-quoted] [fixture:
kanban/db-grid-greater-than-metadata-label-quoted] [fixture:
kanban/db-grid-hash-metadata-label-quoted] [fixture:
kanban/db-grid-html-metadata-label-quoted] [fixture:
kanban/db-grid-html-br-metadata-label-quoted] [fixture:
kanban/db-grid-ideographic-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-block-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-class-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-classdef-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-columns-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-end-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-header-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-space-metadata-label-quoted] [fixture:
kanban/db-grid-keyword-style-metadata-label-quoted] [fixture:
kanban/db-grid-less-than-metadata-label-quoted] [fixture:
kanban/db-grid-ls-metadata-label-quoted] [fixture:
kanban/db-grid-nbsp-metadata-label-quoted] [fixture:
kanban/db-grid-nel-metadata-label-quoted] [fixture:
kanban/db-grid-nonascii-metadata-label-quoted] [fixture:
kanban/db-grid-open-brace-metadata-label-quoted] [fixture:
kanban/db-grid-open-round-metadata-label-quoted] [fixture:
kanban/db-grid-open-square-metadata-label-quoted] [fixture:
kanban/db-grid-percent-metadata-label-quoted] [fixture:
kanban/db-grid-pipe-metadata-label-quoted] [fixture:
kanban/db-grid-proto-metadata-label-quoted] [fixture:
kanban/db-grid-ps-metadata-label-quoted] [fixture:
kanban/db-grid-punct-metadata-label-quoted] [fixture:
kanban/db-grid-root-metadata-label-quoted] [fixture:
kanban/db-grid-semicolon-metadata-label-quoted] [fixture:
kanban/db-grid-single-quote-metadata-label-quoted] [fixture:
kanban/db-grid-spaces-metadata-label-quoted] [fixture:
kanban/db-grid-tab-metadata-label-quoted]

`metadata-assigned-bare` is the value of `assigned` in the data block of an
item, written without quotes. The double quotes of the HTML attribute are read
as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-assigned-bare] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-assigned-bare] [fixture:
kanban/db-grid-entity-named-metadata-assigned-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-assigned-bare] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-assigned-bare] [fixture:
kanban/db-grid-style-rule-metadata-assigned-bare] The value ends there and is
`a`: `comma`. [fixture: kanban/db-grid-comma-metadata-assigned-bare] Rejected by
the lexer: `punct`. [fixture: kanban/gram-grid-punct-metadata-assigned-bare]
Rejected by the grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-assigned-bare] [fixture:
kanban/gram-grid-quote-metadata-assigned-bare] Rejected by the YAML of the data
block: `close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`,
`lf`, `open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-assigned-bare] [fixture:
kanban/gram-grid-comment-line-metadata-assigned-bare] [fixture:
kanban/gram-grid-cr-metadata-assigned-bare] [fixture:
kanban/gram-grid-crlf-metadata-assigned-bare] [fixture:
kanban/gram-grid-directive-line-metadata-assigned-bare] [fixture:
kanban/gram-grid-ff-metadata-assigned-bare] [fixture:
kanban/gram-grid-lf-metadata-assigned-bare] [fixture:
kanban/gram-grid-open-brace-metadata-assigned-bare] [fixture:
kanban/gram-grid-open-square-metadata-assigned-bare] [fixture:
kanban/gram-grid-vt-metadata-assigned-bare] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-assigned-bare] [fixture:
kanban/db-grid-arrow-metadata-assigned-bare] [fixture:
kanban/db-grid-arrow-spaced-metadata-assigned-bare] [fixture:
kanban/db-grid-backslash-metadata-assigned-bare] [fixture:
kanban/db-grid-backtick-metadata-assigned-bare] [fixture:
kanban/db-grid-bom-metadata-assigned-bare] [fixture:
kanban/db-grid-close-round-metadata-assigned-bare] [fixture:
kanban/db-grid-colon-metadata-assigned-bare] [fixture:
kanban/db-grid-comment-metadata-assigned-bare] [fixture:
kanban/db-grid-constructor-metadata-assigned-bare] [fixture:
kanban/db-grid-dash-metadata-assigned-bare] [fixture:
kanban/db-grid-digits-metadata-assigned-bare] [fixture:
kanban/db-grid-emoji-metadata-assigned-bare] [fixture:
kanban/db-grid-empty-metadata-assigned-bare] [fixture:
kanban/db-grid-equals-metadata-assigned-bare] [fixture:
kanban/db-grid-greater-than-metadata-assigned-bare] [fixture:
kanban/db-grid-hash-metadata-assigned-bare] [fixture:
kanban/db-grid-html-metadata-assigned-bare] [fixture:
kanban/db-grid-html-br-metadata-assigned-bare] [fixture:
kanban/db-grid-ideographic-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-block-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-class-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-classdef-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-columns-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-end-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-header-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-space-metadata-assigned-bare] [fixture:
kanban/db-grid-keyword-style-metadata-assigned-bare] [fixture:
kanban/db-grid-less-than-metadata-assigned-bare] [fixture:
kanban/db-grid-ls-metadata-assigned-bare] [fixture:
kanban/db-grid-nbsp-metadata-assigned-bare] [fixture:
kanban/db-grid-nel-metadata-assigned-bare] [fixture:
kanban/db-grid-nonascii-metadata-assigned-bare] [fixture:
kanban/db-grid-open-round-metadata-assigned-bare] [fixture:
kanban/db-grid-percent-metadata-assigned-bare] [fixture:
kanban/db-grid-pipe-metadata-assigned-bare] [fixture:
kanban/db-grid-proto-metadata-assigned-bare] [fixture:
kanban/db-grid-ps-metadata-assigned-bare] [fixture:
kanban/db-grid-root-metadata-assigned-bare] [fixture:
kanban/db-grid-semicolon-metadata-assigned-bare] [fixture:
kanban/db-grid-single-quote-metadata-assigned-bare] [fixture:
kanban/db-grid-spaces-metadata-assigned-bare] [fixture:
kanban/db-grid-tab-metadata-assigned-bare]

`metadata-assigned-single` is the value of `assigned` in the data block of an
item, in single quotes. Read as the placeholder of the entity (common.md,
Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-assigned-single] [fixture:
kanban/db-grid-entity-named-metadata-assigned-single] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-assigned-single] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-assigned-single] [fixture:
kanban/db-grid-style-rule-metadata-assigned-single] Read as one line feed:
`directive-line`. [fixture:
kanban/db-grid-directive-line-metadata-assigned-single] Read as one space, as
YAML folds the line break: `comment-line`, `cr`, `crlf`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-assigned-single] [fixture:
kanban/db-grid-cr-metadata-assigned-single] [fixture:
kanban/db-grid-crlf-metadata-assigned-single] [fixture:
kanban/db-grid-lf-metadata-assigned-single] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-assigned-single] Rejected by the
grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-assigned-single] [fixture:
kanban/gram-grid-quote-metadata-assigned-single] Rejected by the YAML of the
data block: `ff`, `html-attribute`, `single-quote`, `vt`. [fixture:
kanban/gram-grid-ff-metadata-assigned-single] [fixture:
kanban/gram-grid-html-attribute-metadata-assigned-single] [fixture:
kanban/gram-grid-single-quote-metadata-assigned-single] [fixture:
kanban/gram-grid-vt-metadata-assigned-single] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-assigned-single] [fixture:
kanban/db-grid-arrow-metadata-assigned-single] [fixture:
kanban/db-grid-arrow-spaced-metadata-assigned-single] [fixture:
kanban/db-grid-backslash-metadata-assigned-single] [fixture:
kanban/db-grid-backtick-metadata-assigned-single] [fixture:
kanban/db-grid-bom-metadata-assigned-single] [fixture:
kanban/db-grid-close-round-metadata-assigned-single] [fixture:
kanban/db-grid-close-square-metadata-assigned-single] [fixture:
kanban/db-grid-colon-metadata-assigned-single] [fixture:
kanban/db-grid-comma-metadata-assigned-single] [fixture:
kanban/db-grid-comment-metadata-assigned-single] [fixture:
kanban/db-grid-constructor-metadata-assigned-single] [fixture:
kanban/db-grid-dash-metadata-assigned-single] [fixture:
kanban/db-grid-digits-metadata-assigned-single] [fixture:
kanban/db-grid-emoji-metadata-assigned-single] [fixture:
kanban/db-grid-empty-metadata-assigned-single] [fixture:
kanban/db-grid-equals-metadata-assigned-single] [fixture:
kanban/db-grid-greater-than-metadata-assigned-single] [fixture:
kanban/db-grid-hash-metadata-assigned-single] [fixture:
kanban/db-grid-html-metadata-assigned-single] [fixture:
kanban/db-grid-html-br-metadata-assigned-single] [fixture:
kanban/db-grid-ideographic-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-block-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-class-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-classdef-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-columns-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-end-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-header-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-space-metadata-assigned-single] [fixture:
kanban/db-grid-keyword-style-metadata-assigned-single] [fixture:
kanban/db-grid-less-than-metadata-assigned-single] [fixture:
kanban/db-grid-ls-metadata-assigned-single] [fixture:
kanban/db-grid-nbsp-metadata-assigned-single] [fixture:
kanban/db-grid-nel-metadata-assigned-single] [fixture:
kanban/db-grid-nonascii-metadata-assigned-single] [fixture:
kanban/db-grid-open-brace-metadata-assigned-single] [fixture:
kanban/db-grid-open-round-metadata-assigned-single] [fixture:
kanban/db-grid-open-square-metadata-assigned-single] [fixture:
kanban/db-grid-percent-metadata-assigned-single] [fixture:
kanban/db-grid-pipe-metadata-assigned-single] [fixture:
kanban/db-grid-proto-metadata-assigned-single] [fixture:
kanban/db-grid-ps-metadata-assigned-single] [fixture:
kanban/db-grid-root-metadata-assigned-single] [fixture:
kanban/db-grid-semicolon-metadata-assigned-single] [fixture:
kanban/db-grid-spaces-metadata-assigned-single] [fixture:
kanban/db-grid-tab-metadata-assigned-single]

`metadata-assigned-quoted` is the value of `assigned` in the data block of an
item, in double quotes. The double quotes of the HTML attribute are read as
single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-assigned-quoted] Read as the placeholder
of the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-assigned-quoted] [fixture:
kanban/db-grid-entity-named-metadata-assigned-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-assigned-quoted] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-assigned-quoted] [fixture:
kanban/db-grid-style-rule-metadata-assigned-quoted] Read as `<br/>`:
`comment-line`, `cr`, `crlf`, `directive-line`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-assigned-quoted] [fixture:
kanban/db-grid-cr-metadata-assigned-quoted] [fixture:
kanban/db-grid-crlf-metadata-assigned-quoted] [fixture:
kanban/db-grid-directive-line-metadata-assigned-quoted] [fixture:
kanban/db-grid-lf-metadata-assigned-quoted] Read as a backspace, the YAML escape
`\b`: `backslash`. [fixture: kanban/db-grid-backslash-metadata-assigned-quoted]
Rejected by the grammar: `quote`. [fixture:
kanban/gram-grid-quote-metadata-assigned-quoted] Rejected by the YAML of the
data block: `ff`, `vt`. [fixture: kanban/gram-grid-ff-metadata-assigned-quoted]
[fixture: kanban/gram-grid-vt-metadata-assigned-quoted] Kept as written: the
other kinds. [fixture: kanban/db-grid-ampersand-entity-metadata-assigned-quoted]
[fixture: kanban/db-grid-arrow-metadata-assigned-quoted] [fixture:
kanban/db-grid-arrow-spaced-metadata-assigned-quoted] [fixture:
kanban/db-grid-backtick-metadata-assigned-quoted] [fixture:
kanban/db-grid-bom-metadata-assigned-quoted] [fixture:
kanban/db-grid-close-brace-metadata-assigned-quoted] [fixture:
kanban/db-grid-close-round-metadata-assigned-quoted] [fixture:
kanban/db-grid-close-square-metadata-assigned-quoted] [fixture:
kanban/db-grid-colon-metadata-assigned-quoted] [fixture:
kanban/db-grid-comma-metadata-assigned-quoted] [fixture:
kanban/db-grid-comment-metadata-assigned-quoted] [fixture:
kanban/db-grid-constructor-metadata-assigned-quoted] [fixture:
kanban/db-grid-dash-metadata-assigned-quoted] [fixture:
kanban/db-grid-digits-metadata-assigned-quoted] [fixture:
kanban/db-grid-emoji-metadata-assigned-quoted] [fixture:
kanban/db-grid-empty-metadata-assigned-quoted] [fixture:
kanban/db-grid-equals-metadata-assigned-quoted] [fixture:
kanban/db-grid-greater-than-metadata-assigned-quoted] [fixture:
kanban/db-grid-hash-metadata-assigned-quoted] [fixture:
kanban/db-grid-html-metadata-assigned-quoted] [fixture:
kanban/db-grid-html-br-metadata-assigned-quoted] [fixture:
kanban/db-grid-ideographic-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-block-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-class-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-classdef-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-columns-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-end-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-header-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-space-metadata-assigned-quoted] [fixture:
kanban/db-grid-keyword-style-metadata-assigned-quoted] [fixture:
kanban/db-grid-less-than-metadata-assigned-quoted] [fixture:
kanban/db-grid-ls-metadata-assigned-quoted] [fixture:
kanban/db-grid-nbsp-metadata-assigned-quoted] [fixture:
kanban/db-grid-nel-metadata-assigned-quoted] [fixture:
kanban/db-grid-nonascii-metadata-assigned-quoted] [fixture:
kanban/db-grid-open-brace-metadata-assigned-quoted] [fixture:
kanban/db-grid-open-round-metadata-assigned-quoted] [fixture:
kanban/db-grid-open-square-metadata-assigned-quoted] [fixture:
kanban/db-grid-percent-metadata-assigned-quoted] [fixture:
kanban/db-grid-pipe-metadata-assigned-quoted] [fixture:
kanban/db-grid-proto-metadata-assigned-quoted] [fixture:
kanban/db-grid-ps-metadata-assigned-quoted] [fixture:
kanban/db-grid-punct-metadata-assigned-quoted] [fixture:
kanban/db-grid-root-metadata-assigned-quoted] [fixture:
kanban/db-grid-semicolon-metadata-assigned-quoted] [fixture:
kanban/db-grid-single-quote-metadata-assigned-quoted] [fixture:
kanban/db-grid-spaces-metadata-assigned-quoted] [fixture:
kanban/db-grid-tab-metadata-assigned-quoted]

`metadata-ticket-bare` is the value of `ticket` in the data block of an item,
written without quotes. The double quotes of the HTML attribute are read as
single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-ticket-bare] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-ticket-bare] [fixture:
kanban/db-grid-entity-named-metadata-ticket-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-ticket-bare] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-ticket-bare] [fixture:
kanban/db-grid-style-rule-metadata-ticket-bare] The value ends there and is `a`:
`comma`. [fixture: kanban/db-grid-comma-metadata-ticket-bare] Rejected by the
lexer: `punct`. [fixture: kanban/gram-grid-punct-metadata-ticket-bare] Rejected
by the grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-ticket-bare] [fixture:
kanban/gram-grid-quote-metadata-ticket-bare] Rejected by the YAML of the data
block: `close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`,
`lf`, `open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-ticket-bare] [fixture:
kanban/gram-grid-comment-line-metadata-ticket-bare] [fixture:
kanban/gram-grid-cr-metadata-ticket-bare] [fixture:
kanban/gram-grid-crlf-metadata-ticket-bare] [fixture:
kanban/gram-grid-directive-line-metadata-ticket-bare] [fixture:
kanban/gram-grid-ff-metadata-ticket-bare] [fixture:
kanban/gram-grid-lf-metadata-ticket-bare] [fixture:
kanban/gram-grid-open-brace-metadata-ticket-bare] [fixture:
kanban/gram-grid-open-square-metadata-ticket-bare] [fixture:
kanban/gram-grid-vt-metadata-ticket-bare] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-ticket-bare] [fixture:
kanban/db-grid-arrow-metadata-ticket-bare] [fixture:
kanban/db-grid-arrow-spaced-metadata-ticket-bare] [fixture:
kanban/db-grid-backslash-metadata-ticket-bare] [fixture:
kanban/db-grid-backtick-metadata-ticket-bare] [fixture:
kanban/db-grid-bom-metadata-ticket-bare] [fixture:
kanban/db-grid-close-round-metadata-ticket-bare] [fixture:
kanban/db-grid-colon-metadata-ticket-bare] [fixture:
kanban/db-grid-comment-metadata-ticket-bare] [fixture:
kanban/db-grid-constructor-metadata-ticket-bare] [fixture:
kanban/db-grid-dash-metadata-ticket-bare] [fixture:
kanban/db-grid-digits-metadata-ticket-bare] [fixture:
kanban/db-grid-emoji-metadata-ticket-bare] [fixture:
kanban/db-grid-empty-metadata-ticket-bare] [fixture:
kanban/db-grid-equals-metadata-ticket-bare] [fixture:
kanban/db-grid-greater-than-metadata-ticket-bare] [fixture:
kanban/db-grid-hash-metadata-ticket-bare] [fixture:
kanban/db-grid-html-metadata-ticket-bare] [fixture:
kanban/db-grid-html-br-metadata-ticket-bare] [fixture:
kanban/db-grid-ideographic-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-block-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-class-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-classdef-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-columns-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-end-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-header-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-space-metadata-ticket-bare] [fixture:
kanban/db-grid-keyword-style-metadata-ticket-bare] [fixture:
kanban/db-grid-less-than-metadata-ticket-bare] [fixture:
kanban/db-grid-ls-metadata-ticket-bare] [fixture:
kanban/db-grid-nbsp-metadata-ticket-bare] [fixture:
kanban/db-grid-nel-metadata-ticket-bare] [fixture:
kanban/db-grid-nonascii-metadata-ticket-bare] [fixture:
kanban/db-grid-open-round-metadata-ticket-bare] [fixture:
kanban/db-grid-percent-metadata-ticket-bare] [fixture:
kanban/db-grid-pipe-metadata-ticket-bare] [fixture:
kanban/db-grid-proto-metadata-ticket-bare] [fixture:
kanban/db-grid-ps-metadata-ticket-bare] [fixture:
kanban/db-grid-root-metadata-ticket-bare] [fixture:
kanban/db-grid-semicolon-metadata-ticket-bare] [fixture:
kanban/db-grid-single-quote-metadata-ticket-bare] [fixture:
kanban/db-grid-spaces-metadata-ticket-bare] [fixture:
kanban/db-grid-tab-metadata-ticket-bare]

`metadata-ticket-single` is the value of `ticket` in the data block of an item,
in single quotes. Read as the placeholder of the entity (common.md, Entities):
`entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-ticket-single] [fixture:
kanban/db-grid-entity-named-metadata-ticket-single] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-ticket-single] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-ticket-single] [fixture:
kanban/db-grid-style-rule-metadata-ticket-single] Read as one line feed:
`directive-line`. [fixture:
kanban/db-grid-directive-line-metadata-ticket-single] Read as one space, as YAML
folds the line break: `comment-line`, `cr`, `crlf`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-ticket-single] [fixture:
kanban/db-grid-cr-metadata-ticket-single] [fixture:
kanban/db-grid-crlf-metadata-ticket-single] [fixture:
kanban/db-grid-lf-metadata-ticket-single] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-ticket-single] Rejected by the
grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-ticket-single] [fixture:
kanban/gram-grid-quote-metadata-ticket-single] Rejected by the YAML of the data
block: `ff`, `html-attribute`, `single-quote`, `vt`. [fixture:
kanban/gram-grid-ff-metadata-ticket-single] [fixture:
kanban/gram-grid-html-attribute-metadata-ticket-single] [fixture:
kanban/gram-grid-single-quote-metadata-ticket-single] [fixture:
kanban/gram-grid-vt-metadata-ticket-single] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-ticket-single] [fixture:
kanban/db-grid-arrow-metadata-ticket-single] [fixture:
kanban/db-grid-arrow-spaced-metadata-ticket-single] [fixture:
kanban/db-grid-backslash-metadata-ticket-single] [fixture:
kanban/db-grid-backtick-metadata-ticket-single] [fixture:
kanban/db-grid-bom-metadata-ticket-single] [fixture:
kanban/db-grid-close-round-metadata-ticket-single] [fixture:
kanban/db-grid-close-square-metadata-ticket-single] [fixture:
kanban/db-grid-colon-metadata-ticket-single] [fixture:
kanban/db-grid-comma-metadata-ticket-single] [fixture:
kanban/db-grid-comment-metadata-ticket-single] [fixture:
kanban/db-grid-constructor-metadata-ticket-single] [fixture:
kanban/db-grid-dash-metadata-ticket-single] [fixture:
kanban/db-grid-digits-metadata-ticket-single] [fixture:
kanban/db-grid-emoji-metadata-ticket-single] [fixture:
kanban/db-grid-empty-metadata-ticket-single] [fixture:
kanban/db-grid-equals-metadata-ticket-single] [fixture:
kanban/db-grid-greater-than-metadata-ticket-single] [fixture:
kanban/db-grid-hash-metadata-ticket-single] [fixture:
kanban/db-grid-html-metadata-ticket-single] [fixture:
kanban/db-grid-html-br-metadata-ticket-single] [fixture:
kanban/db-grid-ideographic-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-block-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-class-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-classdef-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-columns-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-end-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-header-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-space-metadata-ticket-single] [fixture:
kanban/db-grid-keyword-style-metadata-ticket-single] [fixture:
kanban/db-grid-less-than-metadata-ticket-single] [fixture:
kanban/db-grid-ls-metadata-ticket-single] [fixture:
kanban/db-grid-nbsp-metadata-ticket-single] [fixture:
kanban/db-grid-nel-metadata-ticket-single] [fixture:
kanban/db-grid-nonascii-metadata-ticket-single] [fixture:
kanban/db-grid-open-brace-metadata-ticket-single] [fixture:
kanban/db-grid-open-round-metadata-ticket-single] [fixture:
kanban/db-grid-open-square-metadata-ticket-single] [fixture:
kanban/db-grid-percent-metadata-ticket-single] [fixture:
kanban/db-grid-pipe-metadata-ticket-single] [fixture:
kanban/db-grid-proto-metadata-ticket-single] [fixture:
kanban/db-grid-ps-metadata-ticket-single] [fixture:
kanban/db-grid-root-metadata-ticket-single] [fixture:
kanban/db-grid-semicolon-metadata-ticket-single] [fixture:
kanban/db-grid-spaces-metadata-ticket-single] [fixture:
kanban/db-grid-tab-metadata-ticket-single]

`metadata-ticket-quoted` is the value of `ticket` in the data block of an item,
in double quotes. The double quotes of the HTML attribute are read as single
quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-ticket-quoted] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-ticket-quoted] [fixture:
kanban/db-grid-entity-named-metadata-ticket-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-ticket-quoted] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-ticket-quoted] [fixture:
kanban/db-grid-style-rule-metadata-ticket-quoted] Read as `<br/>`:
`comment-line`, `cr`, `crlf`, `directive-line`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-ticket-quoted] [fixture:
kanban/db-grid-cr-metadata-ticket-quoted] [fixture:
kanban/db-grid-crlf-metadata-ticket-quoted] [fixture:
kanban/db-grid-directive-line-metadata-ticket-quoted] [fixture:
kanban/db-grid-lf-metadata-ticket-quoted] Read as a backspace, the YAML escape
`\b`: `backslash`. [fixture: kanban/db-grid-backslash-metadata-ticket-quoted]
Rejected by the grammar: `quote`. [fixture:
kanban/gram-grid-quote-metadata-ticket-quoted] Rejected by the YAML of the data
block: `ff`, `vt`. [fixture: kanban/gram-grid-ff-metadata-ticket-quoted]
[fixture: kanban/gram-grid-vt-metadata-ticket-quoted] Kept as written: the other
kinds. [fixture: kanban/db-grid-ampersand-entity-metadata-ticket-quoted]
[fixture: kanban/db-grid-arrow-metadata-ticket-quoted] [fixture:
kanban/db-grid-arrow-spaced-metadata-ticket-quoted] [fixture:
kanban/db-grid-backtick-metadata-ticket-quoted] [fixture:
kanban/db-grid-bom-metadata-ticket-quoted] [fixture:
kanban/db-grid-close-brace-metadata-ticket-quoted] [fixture:
kanban/db-grid-close-round-metadata-ticket-quoted] [fixture:
kanban/db-grid-close-square-metadata-ticket-quoted] [fixture:
kanban/db-grid-colon-metadata-ticket-quoted] [fixture:
kanban/db-grid-comma-metadata-ticket-quoted] [fixture:
kanban/db-grid-comment-metadata-ticket-quoted] [fixture:
kanban/db-grid-constructor-metadata-ticket-quoted] [fixture:
kanban/db-grid-dash-metadata-ticket-quoted] [fixture:
kanban/db-grid-digits-metadata-ticket-quoted] [fixture:
kanban/db-grid-emoji-metadata-ticket-quoted] [fixture:
kanban/db-grid-empty-metadata-ticket-quoted] [fixture:
kanban/db-grid-equals-metadata-ticket-quoted] [fixture:
kanban/db-grid-greater-than-metadata-ticket-quoted] [fixture:
kanban/db-grid-hash-metadata-ticket-quoted] [fixture:
kanban/db-grid-html-metadata-ticket-quoted] [fixture:
kanban/db-grid-html-br-metadata-ticket-quoted] [fixture:
kanban/db-grid-ideographic-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-block-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-class-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-classdef-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-columns-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-end-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-header-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-space-metadata-ticket-quoted] [fixture:
kanban/db-grid-keyword-style-metadata-ticket-quoted] [fixture:
kanban/db-grid-less-than-metadata-ticket-quoted] [fixture:
kanban/db-grid-ls-metadata-ticket-quoted] [fixture:
kanban/db-grid-nbsp-metadata-ticket-quoted] [fixture:
kanban/db-grid-nel-metadata-ticket-quoted] [fixture:
kanban/db-grid-nonascii-metadata-ticket-quoted] [fixture:
kanban/db-grid-open-brace-metadata-ticket-quoted] [fixture:
kanban/db-grid-open-round-metadata-ticket-quoted] [fixture:
kanban/db-grid-open-square-metadata-ticket-quoted] [fixture:
kanban/db-grid-percent-metadata-ticket-quoted] [fixture:
kanban/db-grid-pipe-metadata-ticket-quoted] [fixture:
kanban/db-grid-proto-metadata-ticket-quoted] [fixture:
kanban/db-grid-ps-metadata-ticket-quoted] [fixture:
kanban/db-grid-punct-metadata-ticket-quoted] [fixture:
kanban/db-grid-root-metadata-ticket-quoted] [fixture:
kanban/db-grid-semicolon-metadata-ticket-quoted] [fixture:
kanban/db-grid-single-quote-metadata-ticket-quoted] [fixture:
kanban/db-grid-spaces-metadata-ticket-quoted] [fixture:
kanban/db-grid-tab-metadata-ticket-quoted]

`metadata-priority-bare` is the value of `priority` in the data block of an
item, written without quotes. The double quotes of the HTML attribute are read
as single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-priority-bare] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-priority-bare] [fixture:
kanban/db-grid-entity-named-metadata-priority-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-priority-bare] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-priority-bare] [fixture:
kanban/db-grid-style-rule-metadata-priority-bare] The value ends there and is
`a`: `comma`. [fixture: kanban/db-grid-comma-metadata-priority-bare] Rejected by
the lexer: `punct`. [fixture: kanban/gram-grid-punct-metadata-priority-bare]
Rejected by the grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-priority-bare] [fixture:
kanban/gram-grid-quote-metadata-priority-bare] Rejected by the YAML of the data
block: `close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`,
`lf`, `open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-priority-bare] [fixture:
kanban/gram-grid-comment-line-metadata-priority-bare] [fixture:
kanban/gram-grid-cr-metadata-priority-bare] [fixture:
kanban/gram-grid-crlf-metadata-priority-bare] [fixture:
kanban/gram-grid-directive-line-metadata-priority-bare] [fixture:
kanban/gram-grid-ff-metadata-priority-bare] [fixture:
kanban/gram-grid-lf-metadata-priority-bare] [fixture:
kanban/gram-grid-open-brace-metadata-priority-bare] [fixture:
kanban/gram-grid-open-square-metadata-priority-bare] [fixture:
kanban/gram-grid-vt-metadata-priority-bare] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-priority-bare] [fixture:
kanban/db-grid-arrow-metadata-priority-bare] [fixture:
kanban/db-grid-arrow-spaced-metadata-priority-bare] [fixture:
kanban/db-grid-backslash-metadata-priority-bare] [fixture:
kanban/db-grid-backtick-metadata-priority-bare] [fixture:
kanban/db-grid-bom-metadata-priority-bare] [fixture:
kanban/db-grid-close-round-metadata-priority-bare] [fixture:
kanban/db-grid-colon-metadata-priority-bare] [fixture:
kanban/db-grid-comment-metadata-priority-bare] [fixture:
kanban/db-grid-constructor-metadata-priority-bare] [fixture:
kanban/db-grid-dash-metadata-priority-bare] [fixture:
kanban/db-grid-digits-metadata-priority-bare] [fixture:
kanban/db-grid-emoji-metadata-priority-bare] [fixture:
kanban/db-grid-empty-metadata-priority-bare] [fixture:
kanban/db-grid-equals-metadata-priority-bare] [fixture:
kanban/db-grid-greater-than-metadata-priority-bare] [fixture:
kanban/db-grid-hash-metadata-priority-bare] [fixture:
kanban/db-grid-html-metadata-priority-bare] [fixture:
kanban/db-grid-html-br-metadata-priority-bare] [fixture:
kanban/db-grid-ideographic-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-block-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-class-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-classdef-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-columns-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-end-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-header-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-space-metadata-priority-bare] [fixture:
kanban/db-grid-keyword-style-metadata-priority-bare] [fixture:
kanban/db-grid-less-than-metadata-priority-bare] [fixture:
kanban/db-grid-ls-metadata-priority-bare] [fixture:
kanban/db-grid-nbsp-metadata-priority-bare] [fixture:
kanban/db-grid-nel-metadata-priority-bare] [fixture:
kanban/db-grid-nonascii-metadata-priority-bare] [fixture:
kanban/db-grid-open-round-metadata-priority-bare] [fixture:
kanban/db-grid-percent-metadata-priority-bare] [fixture:
kanban/db-grid-pipe-metadata-priority-bare] [fixture:
kanban/db-grid-proto-metadata-priority-bare] [fixture:
kanban/db-grid-ps-metadata-priority-bare] [fixture:
kanban/db-grid-root-metadata-priority-bare] [fixture:
kanban/db-grid-semicolon-metadata-priority-bare] [fixture:
kanban/db-grid-single-quote-metadata-priority-bare] [fixture:
kanban/db-grid-spaces-metadata-priority-bare] [fixture:
kanban/db-grid-tab-metadata-priority-bare]

`metadata-priority-single` is the value of `priority` in the data block of an
item, in single quotes. Read as the placeholder of the entity (common.md,
Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-priority-single] [fixture:
kanban/db-grid-entity-named-metadata-priority-single] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-priority-single] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-priority-single] [fixture:
kanban/db-grid-style-rule-metadata-priority-single] Read as one line feed:
`directive-line`. [fixture:
kanban/db-grid-directive-line-metadata-priority-single] Read as one space, as
YAML folds the line break: `comment-line`, `cr`, `crlf`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-priority-single] [fixture:
kanban/db-grid-cr-metadata-priority-single] [fixture:
kanban/db-grid-crlf-metadata-priority-single] [fixture:
kanban/db-grid-lf-metadata-priority-single] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-priority-single] Rejected by the
grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-priority-single] [fixture:
kanban/gram-grid-quote-metadata-priority-single] Rejected by the YAML of the
data block: `ff`, `html-attribute`, `single-quote`, `vt`. [fixture:
kanban/gram-grid-ff-metadata-priority-single] [fixture:
kanban/gram-grid-html-attribute-metadata-priority-single] [fixture:
kanban/gram-grid-single-quote-metadata-priority-single] [fixture:
kanban/gram-grid-vt-metadata-priority-single] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-priority-single] [fixture:
kanban/db-grid-arrow-metadata-priority-single] [fixture:
kanban/db-grid-arrow-spaced-metadata-priority-single] [fixture:
kanban/db-grid-backslash-metadata-priority-single] [fixture:
kanban/db-grid-backtick-metadata-priority-single] [fixture:
kanban/db-grid-bom-metadata-priority-single] [fixture:
kanban/db-grid-close-round-metadata-priority-single] [fixture:
kanban/db-grid-close-square-metadata-priority-single] [fixture:
kanban/db-grid-colon-metadata-priority-single] [fixture:
kanban/db-grid-comma-metadata-priority-single] [fixture:
kanban/db-grid-comment-metadata-priority-single] [fixture:
kanban/db-grid-constructor-metadata-priority-single] [fixture:
kanban/db-grid-dash-metadata-priority-single] [fixture:
kanban/db-grid-digits-metadata-priority-single] [fixture:
kanban/db-grid-emoji-metadata-priority-single] [fixture:
kanban/db-grid-empty-metadata-priority-single] [fixture:
kanban/db-grid-equals-metadata-priority-single] [fixture:
kanban/db-grid-greater-than-metadata-priority-single] [fixture:
kanban/db-grid-hash-metadata-priority-single] [fixture:
kanban/db-grid-html-metadata-priority-single] [fixture:
kanban/db-grid-html-br-metadata-priority-single] [fixture:
kanban/db-grid-ideographic-metadata-priority-single] [fixture:
kanban/db-grid-keyword-metadata-priority-single] [fixture:
kanban/db-grid-keyword-block-metadata-priority-single] [fixture:
kanban/db-grid-keyword-class-metadata-priority-single] [fixture:
kanban/db-grid-keyword-classdef-metadata-priority-single] [fixture:
kanban/db-grid-keyword-columns-metadata-priority-single] [fixture:
kanban/db-grid-keyword-end-metadata-priority-single] [fixture:
kanban/db-grid-keyword-header-metadata-priority-single] [fixture:
kanban/db-grid-keyword-space-metadata-priority-single] [fixture:
kanban/db-grid-keyword-style-metadata-priority-single] [fixture:
kanban/db-grid-less-than-metadata-priority-single] [fixture:
kanban/db-grid-ls-metadata-priority-single] [fixture:
kanban/db-grid-nbsp-metadata-priority-single] [fixture:
kanban/db-grid-nel-metadata-priority-single] [fixture:
kanban/db-grid-nonascii-metadata-priority-single] [fixture:
kanban/db-grid-open-brace-metadata-priority-single] [fixture:
kanban/db-grid-open-round-metadata-priority-single] [fixture:
kanban/db-grid-open-square-metadata-priority-single] [fixture:
kanban/db-grid-percent-metadata-priority-single] [fixture:
kanban/db-grid-pipe-metadata-priority-single] [fixture:
kanban/db-grid-proto-metadata-priority-single] [fixture:
kanban/db-grid-ps-metadata-priority-single] [fixture:
kanban/db-grid-root-metadata-priority-single] [fixture:
kanban/db-grid-semicolon-metadata-priority-single] [fixture:
kanban/db-grid-spaces-metadata-priority-single] [fixture:
kanban/db-grid-tab-metadata-priority-single]

`metadata-priority-quoted` is the value of `priority` in the data block of an
item, in double quotes. The double quotes of the HTML attribute are read as
single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-priority-quoted] Read as the placeholder
of the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-priority-quoted] [fixture:
kanban/db-grid-entity-named-metadata-priority-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-priority-quoted] The
first `;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-priority-quoted] [fixture:
kanban/db-grid-style-rule-metadata-priority-quoted] Read as `<br/>`:
`comment-line`, `cr`, `crlf`, `directive-line`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-priority-quoted] [fixture:
kanban/db-grid-cr-metadata-priority-quoted] [fixture:
kanban/db-grid-crlf-metadata-priority-quoted] [fixture:
kanban/db-grid-directive-line-metadata-priority-quoted] [fixture:
kanban/db-grid-lf-metadata-priority-quoted] Read as a backspace, the YAML escape
`\b`: `backslash`. [fixture: kanban/db-grid-backslash-metadata-priority-quoted]
Rejected by the grammar: `quote`. [fixture:
kanban/gram-grid-quote-metadata-priority-quoted] Rejected by the YAML of the
data block: `ff`, `vt`. [fixture: kanban/gram-grid-ff-metadata-priority-quoted]
[fixture: kanban/gram-grid-vt-metadata-priority-quoted] Kept as written: the
other kinds. [fixture: kanban/db-grid-ampersand-entity-metadata-priority-quoted]
[fixture: kanban/db-grid-arrow-metadata-priority-quoted] [fixture:
kanban/db-grid-arrow-spaced-metadata-priority-quoted] [fixture:
kanban/db-grid-backtick-metadata-priority-quoted] [fixture:
kanban/db-grid-bom-metadata-priority-quoted] [fixture:
kanban/db-grid-close-brace-metadata-priority-quoted] [fixture:
kanban/db-grid-close-round-metadata-priority-quoted] [fixture:
kanban/db-grid-close-square-metadata-priority-quoted] [fixture:
kanban/db-grid-colon-metadata-priority-quoted] [fixture:
kanban/db-grid-comma-metadata-priority-quoted] [fixture:
kanban/db-grid-comment-metadata-priority-quoted] [fixture:
kanban/db-grid-constructor-metadata-priority-quoted] [fixture:
kanban/db-grid-dash-metadata-priority-quoted] [fixture:
kanban/db-grid-digits-metadata-priority-quoted] [fixture:
kanban/db-grid-emoji-metadata-priority-quoted] [fixture:
kanban/db-grid-empty-metadata-priority-quoted] [fixture:
kanban/db-grid-equals-metadata-priority-quoted] [fixture:
kanban/db-grid-greater-than-metadata-priority-quoted] [fixture:
kanban/db-grid-hash-metadata-priority-quoted] [fixture:
kanban/db-grid-html-metadata-priority-quoted] [fixture:
kanban/db-grid-html-br-metadata-priority-quoted] [fixture:
kanban/db-grid-ideographic-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-block-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-class-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-classdef-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-columns-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-end-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-header-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-space-metadata-priority-quoted] [fixture:
kanban/db-grid-keyword-style-metadata-priority-quoted] [fixture:
kanban/db-grid-less-than-metadata-priority-quoted] [fixture:
kanban/db-grid-ls-metadata-priority-quoted] [fixture:
kanban/db-grid-nbsp-metadata-priority-quoted] [fixture:
kanban/db-grid-nel-metadata-priority-quoted] [fixture:
kanban/db-grid-nonascii-metadata-priority-quoted] [fixture:
kanban/db-grid-open-brace-metadata-priority-quoted] [fixture:
kanban/db-grid-open-round-metadata-priority-quoted] [fixture:
kanban/db-grid-open-square-metadata-priority-quoted] [fixture:
kanban/db-grid-percent-metadata-priority-quoted] [fixture:
kanban/db-grid-pipe-metadata-priority-quoted] [fixture:
kanban/db-grid-proto-metadata-priority-quoted] [fixture:
kanban/db-grid-ps-metadata-priority-quoted] [fixture:
kanban/db-grid-punct-metadata-priority-quoted] [fixture:
kanban/db-grid-root-metadata-priority-quoted] [fixture:
kanban/db-grid-semicolon-metadata-priority-quoted] [fixture:
kanban/db-grid-single-quote-metadata-priority-quoted] [fixture:
kanban/db-grid-spaces-metadata-priority-quoted] [fixture:
kanban/db-grid-tab-metadata-priority-quoted]

`metadata-icon-bare` is the value of `icon` in the data block of an item,
written without quotes. The double quotes of the HTML attribute are read as
single quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-icon-bare] Read as the placeholder of the
entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-icon-bare] [fixture:
kanban/db-grid-entity-named-metadata-icon-bare] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-icon-bare] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-icon-bare] [fixture:
kanban/db-grid-style-rule-metadata-icon-bare] The value ends there and is `a`:
`comma`. [fixture: kanban/db-grid-comma-metadata-icon-bare] Rejected by the
lexer: `punct`. [fixture: kanban/gram-grid-punct-metadata-icon-bare] Rejected by
the grammar: `close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-icon-bare] [fixture:
kanban/gram-grid-quote-metadata-icon-bare] Rejected by the YAML of the data
block: `close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`,
`lf`, `open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-icon-bare] [fixture:
kanban/gram-grid-comment-line-metadata-icon-bare] [fixture:
kanban/gram-grid-cr-metadata-icon-bare] [fixture:
kanban/gram-grid-crlf-metadata-icon-bare] [fixture:
kanban/gram-grid-directive-line-metadata-icon-bare] [fixture:
kanban/gram-grid-ff-metadata-icon-bare] [fixture:
kanban/gram-grid-lf-metadata-icon-bare] [fixture:
kanban/gram-grid-open-brace-metadata-icon-bare] [fixture:
kanban/gram-grid-open-square-metadata-icon-bare] [fixture:
kanban/gram-grid-vt-metadata-icon-bare] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-icon-bare] [fixture:
kanban/db-grid-arrow-metadata-icon-bare] [fixture:
kanban/db-grid-arrow-spaced-metadata-icon-bare] [fixture:
kanban/db-grid-backslash-metadata-icon-bare] [fixture:
kanban/db-grid-backtick-metadata-icon-bare] [fixture:
kanban/db-grid-bom-metadata-icon-bare] [fixture:
kanban/db-grid-close-round-metadata-icon-bare] [fixture:
kanban/db-grid-colon-metadata-icon-bare] [fixture:
kanban/db-grid-comment-metadata-icon-bare] [fixture:
kanban/db-grid-constructor-metadata-icon-bare] [fixture:
kanban/db-grid-dash-metadata-icon-bare] [fixture:
kanban/db-grid-digits-metadata-icon-bare] [fixture:
kanban/db-grid-emoji-metadata-icon-bare] [fixture:
kanban/db-grid-empty-metadata-icon-bare] [fixture:
kanban/db-grid-equals-metadata-icon-bare] [fixture:
kanban/db-grid-greater-than-metadata-icon-bare] [fixture:
kanban/db-grid-hash-metadata-icon-bare] [fixture:
kanban/db-grid-html-metadata-icon-bare] [fixture:
kanban/db-grid-html-br-metadata-icon-bare] [fixture:
kanban/db-grid-ideographic-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-block-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-class-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-classdef-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-columns-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-end-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-header-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-space-metadata-icon-bare] [fixture:
kanban/db-grid-keyword-style-metadata-icon-bare] [fixture:
kanban/db-grid-less-than-metadata-icon-bare] [fixture:
kanban/db-grid-ls-metadata-icon-bare] [fixture:
kanban/db-grid-nbsp-metadata-icon-bare] [fixture:
kanban/db-grid-nel-metadata-icon-bare] [fixture:
kanban/db-grid-nonascii-metadata-icon-bare] [fixture:
kanban/db-grid-open-round-metadata-icon-bare] [fixture:
kanban/db-grid-percent-metadata-icon-bare] [fixture:
kanban/db-grid-pipe-metadata-icon-bare] [fixture:
kanban/db-grid-proto-metadata-icon-bare] [fixture:
kanban/db-grid-ps-metadata-icon-bare] [fixture:
kanban/db-grid-root-metadata-icon-bare] [fixture:
kanban/db-grid-semicolon-metadata-icon-bare] [fixture:
kanban/db-grid-single-quote-metadata-icon-bare] [fixture:
kanban/db-grid-spaces-metadata-icon-bare] [fixture:
kanban/db-grid-tab-metadata-icon-bare]

`metadata-icon-single` is the value of `icon` in the data block of an item, in
single quotes. Read as the placeholder of the entity (common.md, Entities):
`entity`, `entity-named`. [fixture: kanban/db-grid-entity-metadata-icon-single]
[fixture: kanban/db-grid-entity-named-metadata-icon-single] Removed as a
directive: `directive`. [fixture: kanban/db-grid-directive-metadata-icon-single]
The first `;` is dropped by the line rule: `classdef-rule`, `style-rule`.
[fixture: kanban/db-grid-classdef-rule-metadata-icon-single] [fixture:
kanban/db-grid-style-rule-metadata-icon-single] Read as one line feed:
`directive-line`. [fixture: kanban/db-grid-directive-line-metadata-icon-single]
Read as one space, as YAML folds the line break: `comment-line`, `cr`, `crlf`,
`lf`. [fixture: kanban/db-grid-comment-line-metadata-icon-single] [fixture:
kanban/db-grid-cr-metadata-icon-single] [fixture:
kanban/db-grid-crlf-metadata-icon-single] [fixture:
kanban/db-grid-lf-metadata-icon-single] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-icon-single] Rejected by the grammar:
`close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-icon-single] [fixture:
kanban/gram-grid-quote-metadata-icon-single] Rejected by the YAML of the data
block: `ff`, `html-attribute`, `single-quote`, `vt`. [fixture:
kanban/gram-grid-ff-metadata-icon-single] [fixture:
kanban/gram-grid-html-attribute-metadata-icon-single] [fixture:
kanban/gram-grid-single-quote-metadata-icon-single] [fixture:
kanban/gram-grid-vt-metadata-icon-single] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-icon-single] [fixture:
kanban/db-grid-arrow-metadata-icon-single] [fixture:
kanban/db-grid-arrow-spaced-metadata-icon-single] [fixture:
kanban/db-grid-backslash-metadata-icon-single] [fixture:
kanban/db-grid-backtick-metadata-icon-single] [fixture:
kanban/db-grid-bom-metadata-icon-single] [fixture:
kanban/db-grid-close-round-metadata-icon-single] [fixture:
kanban/db-grid-close-square-metadata-icon-single] [fixture:
kanban/db-grid-colon-metadata-icon-single] [fixture:
kanban/db-grid-comma-metadata-icon-single] [fixture:
kanban/db-grid-comment-metadata-icon-single] [fixture:
kanban/db-grid-constructor-metadata-icon-single] [fixture:
kanban/db-grid-dash-metadata-icon-single] [fixture:
kanban/db-grid-digits-metadata-icon-single] [fixture:
kanban/db-grid-emoji-metadata-icon-single] [fixture:
kanban/db-grid-empty-metadata-icon-single] [fixture:
kanban/db-grid-equals-metadata-icon-single] [fixture:
kanban/db-grid-greater-than-metadata-icon-single] [fixture:
kanban/db-grid-hash-metadata-icon-single] [fixture:
kanban/db-grid-html-metadata-icon-single] [fixture:
kanban/db-grid-html-br-metadata-icon-single] [fixture:
kanban/db-grid-ideographic-metadata-icon-single] [fixture:
kanban/db-grid-keyword-metadata-icon-single] [fixture:
kanban/db-grid-keyword-block-metadata-icon-single] [fixture:
kanban/db-grid-keyword-class-metadata-icon-single] [fixture:
kanban/db-grid-keyword-classdef-metadata-icon-single] [fixture:
kanban/db-grid-keyword-columns-metadata-icon-single] [fixture:
kanban/db-grid-keyword-end-metadata-icon-single] [fixture:
kanban/db-grid-keyword-header-metadata-icon-single] [fixture:
kanban/db-grid-keyword-space-metadata-icon-single] [fixture:
kanban/db-grid-keyword-style-metadata-icon-single] [fixture:
kanban/db-grid-less-than-metadata-icon-single] [fixture:
kanban/db-grid-ls-metadata-icon-single] [fixture:
kanban/db-grid-nbsp-metadata-icon-single] [fixture:
kanban/db-grid-nel-metadata-icon-single] [fixture:
kanban/db-grid-nonascii-metadata-icon-single] [fixture:
kanban/db-grid-open-brace-metadata-icon-single] [fixture:
kanban/db-grid-open-round-metadata-icon-single] [fixture:
kanban/db-grid-open-square-metadata-icon-single] [fixture:
kanban/db-grid-percent-metadata-icon-single] [fixture:
kanban/db-grid-pipe-metadata-icon-single] [fixture:
kanban/db-grid-proto-metadata-icon-single] [fixture:
kanban/db-grid-ps-metadata-icon-single] [fixture:
kanban/db-grid-root-metadata-icon-single] [fixture:
kanban/db-grid-semicolon-metadata-icon-single] [fixture:
kanban/db-grid-spaces-metadata-icon-single] [fixture:
kanban/db-grid-tab-metadata-icon-single]

`metadata-icon-quoted` is the value of `icon` in the data block of an item, in
double quotes. The double quotes of the HTML attribute are read as single
quotes: `html-attribute`. [fixture:
kanban/db-grid-html-attribute-metadata-icon-quoted] Read as the placeholder of
the entity (common.md, Entities): `entity`, `entity-named`. [fixture:
kanban/db-grid-entity-metadata-icon-quoted] [fixture:
kanban/db-grid-entity-named-metadata-icon-quoted] Removed as a directive:
`directive`. [fixture: kanban/db-grid-directive-metadata-icon-quoted] The first
`;` is dropped by the line rule: `classdef-rule`, `style-rule`. [fixture:
kanban/db-grid-classdef-rule-metadata-icon-quoted] [fixture:
kanban/db-grid-style-rule-metadata-icon-quoted] Read as `<br/>`: `comment-line`,
`cr`, `crlf`, `directive-line`, `lf`. [fixture:
kanban/db-grid-comment-line-metadata-icon-quoted] [fixture:
kanban/db-grid-cr-metadata-icon-quoted] [fixture:
kanban/db-grid-crlf-metadata-icon-quoted] [fixture:
kanban/db-grid-directive-line-metadata-icon-quoted] [fixture:
kanban/db-grid-lf-metadata-icon-quoted] Read as a backspace, the YAML escape
`\b`: `backslash`. [fixture: kanban/db-grid-backslash-metadata-icon-quoted]
Rejected by the grammar: `quote`. [fixture:
kanban/gram-grid-quote-metadata-icon-quoted] Rejected by the YAML of the data
block: `ff`, `vt`. [fixture: kanban/gram-grid-ff-metadata-icon-quoted] [fixture:
kanban/gram-grid-vt-metadata-icon-quoted] Kept as written: the other kinds.
[fixture: kanban/db-grid-ampersand-entity-metadata-icon-quoted] [fixture:
kanban/db-grid-arrow-metadata-icon-quoted] [fixture:
kanban/db-grid-arrow-spaced-metadata-icon-quoted] [fixture:
kanban/db-grid-backtick-metadata-icon-quoted] [fixture:
kanban/db-grid-bom-metadata-icon-quoted] [fixture:
kanban/db-grid-close-brace-metadata-icon-quoted] [fixture:
kanban/db-grid-close-round-metadata-icon-quoted] [fixture:
kanban/db-grid-close-square-metadata-icon-quoted] [fixture:
kanban/db-grid-colon-metadata-icon-quoted] [fixture:
kanban/db-grid-comma-metadata-icon-quoted] [fixture:
kanban/db-grid-comment-metadata-icon-quoted] [fixture:
kanban/db-grid-constructor-metadata-icon-quoted] [fixture:
kanban/db-grid-dash-metadata-icon-quoted] [fixture:
kanban/db-grid-digits-metadata-icon-quoted] [fixture:
kanban/db-grid-emoji-metadata-icon-quoted] [fixture:
kanban/db-grid-empty-metadata-icon-quoted] [fixture:
kanban/db-grid-equals-metadata-icon-quoted] [fixture:
kanban/db-grid-greater-than-metadata-icon-quoted] [fixture:
kanban/db-grid-hash-metadata-icon-quoted] [fixture:
kanban/db-grid-html-metadata-icon-quoted] [fixture:
kanban/db-grid-html-br-metadata-icon-quoted] [fixture:
kanban/db-grid-ideographic-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-block-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-class-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-classdef-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-columns-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-end-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-header-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-space-metadata-icon-quoted] [fixture:
kanban/db-grid-keyword-style-metadata-icon-quoted] [fixture:
kanban/db-grid-less-than-metadata-icon-quoted] [fixture:
kanban/db-grid-ls-metadata-icon-quoted] [fixture:
kanban/db-grid-nbsp-metadata-icon-quoted] [fixture:
kanban/db-grid-nel-metadata-icon-quoted] [fixture:
kanban/db-grid-nonascii-metadata-icon-quoted] [fixture:
kanban/db-grid-open-brace-metadata-icon-quoted] [fixture:
kanban/db-grid-open-round-metadata-icon-quoted] [fixture:
kanban/db-grid-open-square-metadata-icon-quoted] [fixture:
kanban/db-grid-percent-metadata-icon-quoted] [fixture:
kanban/db-grid-pipe-metadata-icon-quoted] [fixture:
kanban/db-grid-proto-metadata-icon-quoted] [fixture:
kanban/db-grid-ps-metadata-icon-quoted] [fixture:
kanban/db-grid-punct-metadata-icon-quoted] [fixture:
kanban/db-grid-root-metadata-icon-quoted] [fixture:
kanban/db-grid-semicolon-metadata-icon-quoted] [fixture:
kanban/db-grid-single-quote-metadata-icon-quoted] [fixture:
kanban/db-grid-spaces-metadata-icon-quoted] [fixture:
kanban/db-grid-tab-metadata-icon-quoted]

`metadata-shape-bare` is the value of `shape` in the data block of an item,
written without quotes. Read, and the summary does not change:
`ampersand-entity`, `arrow`, `arrow-spaced`, `backslash`, `backtick`, `bom`,
`close-round`, `colon`, `comma`, `comment`, `constructor`, `dash`, `digits`,
`directive`, `emoji`, `empty`, `entity`, `entity-named`, `equals`,
`greater-than`, `hash`, `html`, `html-attribute`, `html-br`, `ideographic`,
`keyword`, `keyword-block`, `keyword-columns`, `keyword-end`, `keyword-header`,
`keyword-space`, `less-than`, `ls`, `nbsp`, `nel`, `nonascii`, `open-round`,
`percent`, `pipe`, `ps`, `root`, `semicolon`, `single-quote`, `spaces`,
`style-rule`, `tab`. [fixture:
kanban/db-grid-ampersand-entity-metadata-shape-bare] [fixture:
kanban/db-grid-arrow-metadata-shape-bare] [fixture:
kanban/db-grid-arrow-spaced-metadata-shape-bare] [fixture:
kanban/db-grid-backslash-metadata-shape-bare] [fixture:
kanban/db-grid-backtick-metadata-shape-bare] [fixture:
kanban/db-grid-bom-metadata-shape-bare] [fixture:
kanban/db-grid-close-round-metadata-shape-bare] [fixture:
kanban/db-grid-colon-metadata-shape-bare] [fixture:
kanban/db-grid-comma-metadata-shape-bare] [fixture:
kanban/db-grid-comment-metadata-shape-bare] [fixture:
kanban/db-grid-constructor-metadata-shape-bare] [fixture:
kanban/db-grid-dash-metadata-shape-bare] [fixture:
kanban/db-grid-digits-metadata-shape-bare] [fixture:
kanban/db-grid-directive-metadata-shape-bare] [fixture:
kanban/db-grid-emoji-metadata-shape-bare] [fixture:
kanban/db-grid-empty-metadata-shape-bare] [fixture:
kanban/db-grid-entity-metadata-shape-bare] [fixture:
kanban/db-grid-entity-named-metadata-shape-bare] [fixture:
kanban/db-grid-equals-metadata-shape-bare] [fixture:
kanban/db-grid-greater-than-metadata-shape-bare] [fixture:
kanban/db-grid-hash-metadata-shape-bare] [fixture:
kanban/db-grid-html-metadata-shape-bare] [fixture:
kanban/db-grid-html-attribute-metadata-shape-bare] [fixture:
kanban/db-grid-html-br-metadata-shape-bare] [fixture:
kanban/db-grid-ideographic-metadata-shape-bare] [fixture:
kanban/db-grid-keyword-metadata-shape-bare] [fixture:
kanban/db-grid-keyword-block-metadata-shape-bare] [fixture:
kanban/db-grid-keyword-columns-metadata-shape-bare] [fixture:
kanban/db-grid-keyword-end-metadata-shape-bare] [fixture:
kanban/db-grid-keyword-header-metadata-shape-bare] [fixture:
kanban/db-grid-keyword-space-metadata-shape-bare] [fixture:
kanban/db-grid-less-than-metadata-shape-bare] [fixture:
kanban/db-grid-ls-metadata-shape-bare] [fixture:
kanban/db-grid-nbsp-metadata-shape-bare] [fixture:
kanban/db-grid-nel-metadata-shape-bare] [fixture:
kanban/db-grid-nonascii-metadata-shape-bare] [fixture:
kanban/db-grid-open-round-metadata-shape-bare] [fixture:
kanban/db-grid-percent-metadata-shape-bare] [fixture:
kanban/db-grid-pipe-metadata-shape-bare] [fixture:
kanban/db-grid-ps-metadata-shape-bare] [fixture:
kanban/db-grid-root-metadata-shape-bare] [fixture:
kanban/db-grid-semicolon-metadata-shape-bare] [fixture:
kanban/db-grid-single-quote-metadata-shape-bare] [fixture:
kanban/db-grid-spaces-metadata-shape-bare] [fixture:
kanban/db-grid-style-rule-metadata-shape-bare] [fixture:
kanban/db-grid-tab-metadata-shape-bare] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-shape-bare] Rejected by the grammar:
`close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-shape-bare] [fixture:
kanban/gram-grid-quote-metadata-shape-bare] Rejected by the YAML of the data
block: `close-square`, `comment-line`, `cr`, `crlf`, `directive-line`, `ff`,
`lf`, `open-brace`, `open-square`, `vt`. [fixture:
kanban/gram-grid-close-square-metadata-shape-bare] [fixture:
kanban/gram-grid-comment-line-metadata-shape-bare] [fixture:
kanban/gram-grid-cr-metadata-shape-bare] [fixture:
kanban/gram-grid-crlf-metadata-shape-bare] [fixture:
kanban/gram-grid-directive-line-metadata-shape-bare] [fixture:
kanban/gram-grid-ff-metadata-shape-bare] [fixture:
kanban/gram-grid-lf-metadata-shape-bare] [fixture:
kanban/gram-grid-open-brace-metadata-shape-bare] [fixture:
kanban/gram-grid-open-square-metadata-shape-bare] [fixture:
kanban/gram-grid-vt-metadata-shape-bare] Rejected by the Db: the shape name has
an upper-case letter or a `_` (`No such shape`): `classdef-rule`,
`keyword-class`, `keyword-classdef`, `keyword-style`, `proto`. [fixture:
kanban/gram-grid-classdef-rule-metadata-shape-bare] [fixture:
kanban/gram-grid-keyword-class-metadata-shape-bare] [fixture:
kanban/gram-grid-keyword-classdef-metadata-shape-bare] [fixture:
kanban/gram-grid-keyword-style-metadata-shape-bare] [fixture:
kanban/gram-grid-proto-metadata-shape-bare]

`metadata-shape-single` is the value of `shape` in the data block of an item, in
single quotes. Read, and the summary does not change: `ampersand-entity`,
`arrow`, `arrow-spaced`, `backslash`, `backtick`, `bom`, `close-round`,
`close-square`, `colon`, `comma`, `comment`, `comment-line`, `constructor`,
`cr`, `crlf`, `dash`, `digits`, `directive`, `directive-line`, `emoji`, `empty`,
`entity`, `entity-named`, `equals`, `greater-than`, `hash`, `html`, `html-br`,
`ideographic`, `keyword`, `keyword-block`, `keyword-columns`, `keyword-end`,
`keyword-header`, `keyword-space`, `less-than`, `lf`, `ls`, `nbsp`, `nel`,
`nonascii`, `open-brace`, `open-round`, `open-square`, `percent`, `pipe`, `ps`,
`root`, `semicolon`, `spaces`, `style-rule`, `tab`. [fixture:
kanban/db-grid-ampersand-entity-metadata-shape-single] [fixture:
kanban/db-grid-arrow-metadata-shape-single] [fixture:
kanban/db-grid-arrow-spaced-metadata-shape-single] [fixture:
kanban/db-grid-backslash-metadata-shape-single] [fixture:
kanban/db-grid-backtick-metadata-shape-single] [fixture:
kanban/db-grid-bom-metadata-shape-single] [fixture:
kanban/db-grid-close-round-metadata-shape-single] [fixture:
kanban/db-grid-close-square-metadata-shape-single] [fixture:
kanban/db-grid-colon-metadata-shape-single] [fixture:
kanban/db-grid-comma-metadata-shape-single] [fixture:
kanban/db-grid-comment-metadata-shape-single] [fixture:
kanban/db-grid-comment-line-metadata-shape-single] [fixture:
kanban/db-grid-constructor-metadata-shape-single] [fixture:
kanban/db-grid-cr-metadata-shape-single] [fixture:
kanban/db-grid-crlf-metadata-shape-single] [fixture:
kanban/db-grid-dash-metadata-shape-single] [fixture:
kanban/db-grid-digits-metadata-shape-single] [fixture:
kanban/db-grid-directive-metadata-shape-single] [fixture:
kanban/db-grid-directive-line-metadata-shape-single] [fixture:
kanban/db-grid-emoji-metadata-shape-single] [fixture:
kanban/db-grid-empty-metadata-shape-single] [fixture:
kanban/db-grid-entity-metadata-shape-single] [fixture:
kanban/db-grid-entity-named-metadata-shape-single] [fixture:
kanban/db-grid-equals-metadata-shape-single] [fixture:
kanban/db-grid-greater-than-metadata-shape-single] [fixture:
kanban/db-grid-hash-metadata-shape-single] [fixture:
kanban/db-grid-html-metadata-shape-single] [fixture:
kanban/db-grid-html-br-metadata-shape-single] [fixture:
kanban/db-grid-ideographic-metadata-shape-single] [fixture:
kanban/db-grid-keyword-metadata-shape-single] [fixture:
kanban/db-grid-keyword-block-metadata-shape-single] [fixture:
kanban/db-grid-keyword-columns-metadata-shape-single] [fixture:
kanban/db-grid-keyword-end-metadata-shape-single] [fixture:
kanban/db-grid-keyword-header-metadata-shape-single] [fixture:
kanban/db-grid-keyword-space-metadata-shape-single] [fixture:
kanban/db-grid-less-than-metadata-shape-single] [fixture:
kanban/db-grid-lf-metadata-shape-single] [fixture:
kanban/db-grid-ls-metadata-shape-single] [fixture:
kanban/db-grid-nbsp-metadata-shape-single] [fixture:
kanban/db-grid-nel-metadata-shape-single] [fixture:
kanban/db-grid-nonascii-metadata-shape-single] [fixture:
kanban/db-grid-open-brace-metadata-shape-single] [fixture:
kanban/db-grid-open-round-metadata-shape-single] [fixture:
kanban/db-grid-open-square-metadata-shape-single] [fixture:
kanban/db-grid-percent-metadata-shape-single] [fixture:
kanban/db-grid-pipe-metadata-shape-single] [fixture:
kanban/db-grid-ps-metadata-shape-single] [fixture:
kanban/db-grid-root-metadata-shape-single] [fixture:
kanban/db-grid-semicolon-metadata-shape-single] [fixture:
kanban/db-grid-spaces-metadata-shape-single] [fixture:
kanban/db-grid-style-rule-metadata-shape-single] [fixture:
kanban/db-grid-tab-metadata-shape-single] Rejected by the lexer: `punct`.
[fixture: kanban/gram-grid-punct-metadata-shape-single] Rejected by the grammar:
`close-brace`, `quote`. [fixture:
kanban/gram-grid-close-brace-metadata-shape-single] [fixture:
kanban/gram-grid-quote-metadata-shape-single] Rejected by the YAML of the data
block: `ff`, `html-attribute`, `single-quote`, `vt`. [fixture:
kanban/gram-grid-ff-metadata-shape-single] [fixture:
kanban/gram-grid-html-attribute-metadata-shape-single] [fixture:
kanban/gram-grid-single-quote-metadata-shape-single] [fixture:
kanban/gram-grid-vt-metadata-shape-single] Rejected by the Db: the shape name
has an upper-case letter or a `_` (`No such shape`): `classdef-rule`,
`keyword-class`, `keyword-classdef`, `keyword-style`, `proto`. [fixture:
kanban/gram-grid-classdef-rule-metadata-shape-single] [fixture:
kanban/gram-grid-keyword-class-metadata-shape-single] [fixture:
kanban/gram-grid-keyword-classdef-metadata-shape-single] [fixture:
kanban/gram-grid-keyword-style-metadata-shape-single] [fixture:
kanban/gram-grid-proto-metadata-shape-single]

`metadata-shape-quoted` is the value of `shape` in the data block of an item, in
double quotes. Read, and the summary does not change: `ampersand-entity`,
`arrow`, `arrow-spaced`, `backslash`, `backtick`, `bom`, `close-brace`,
`close-round`, `close-square`, `colon`, `comma`, `comment`, `comment-line`,
`constructor`, `cr`, `crlf`, `dash`, `digits`, `directive`, `directive-line`,
`emoji`, `empty`, `entity`, `entity-named`, `equals`, `greater-than`, `hash`,
`html`, `html-attribute`, `html-br`, `ideographic`, `keyword`, `keyword-block`,
`keyword-columns`, `keyword-end`, `keyword-header`, `keyword-space`,
`less-than`, `lf`, `ls`, `nbsp`, `nel`, `nonascii`, `open-brace`, `open-round`,
`open-square`, `percent`, `pipe`, `ps`, `root`, `semicolon`, `single-quote`,
`spaces`, `style-rule`, `tab`. [fixture:
kanban/db-grid-ampersand-entity-metadata-shape-quoted] [fixture:
kanban/db-grid-arrow-metadata-shape-quoted] [fixture:
kanban/db-grid-arrow-spaced-metadata-shape-quoted] [fixture:
kanban/db-grid-backslash-metadata-shape-quoted] [fixture:
kanban/db-grid-backtick-metadata-shape-quoted] [fixture:
kanban/db-grid-bom-metadata-shape-quoted] [fixture:
kanban/db-grid-close-brace-metadata-shape-quoted] [fixture:
kanban/db-grid-close-round-metadata-shape-quoted] [fixture:
kanban/db-grid-close-square-metadata-shape-quoted] [fixture:
kanban/db-grid-colon-metadata-shape-quoted] [fixture:
kanban/db-grid-comma-metadata-shape-quoted] [fixture:
kanban/db-grid-comment-metadata-shape-quoted] [fixture:
kanban/db-grid-comment-line-metadata-shape-quoted] [fixture:
kanban/db-grid-constructor-metadata-shape-quoted] [fixture:
kanban/db-grid-cr-metadata-shape-quoted] [fixture:
kanban/db-grid-crlf-metadata-shape-quoted] [fixture:
kanban/db-grid-dash-metadata-shape-quoted] [fixture:
kanban/db-grid-digits-metadata-shape-quoted] [fixture:
kanban/db-grid-directive-metadata-shape-quoted] [fixture:
kanban/db-grid-directive-line-metadata-shape-quoted] [fixture:
kanban/db-grid-emoji-metadata-shape-quoted] [fixture:
kanban/db-grid-empty-metadata-shape-quoted] [fixture:
kanban/db-grid-entity-metadata-shape-quoted] [fixture:
kanban/db-grid-entity-named-metadata-shape-quoted] [fixture:
kanban/db-grid-equals-metadata-shape-quoted] [fixture:
kanban/db-grid-greater-than-metadata-shape-quoted] [fixture:
kanban/db-grid-hash-metadata-shape-quoted] [fixture:
kanban/db-grid-html-metadata-shape-quoted] [fixture:
kanban/db-grid-html-attribute-metadata-shape-quoted] [fixture:
kanban/db-grid-html-br-metadata-shape-quoted] [fixture:
kanban/db-grid-ideographic-metadata-shape-quoted] [fixture:
kanban/db-grid-keyword-metadata-shape-quoted] [fixture:
kanban/db-grid-keyword-block-metadata-shape-quoted] [fixture:
kanban/db-grid-keyword-columns-metadata-shape-quoted] [fixture:
kanban/db-grid-keyword-end-metadata-shape-quoted] [fixture:
kanban/db-grid-keyword-header-metadata-shape-quoted] [fixture:
kanban/db-grid-keyword-space-metadata-shape-quoted] [fixture:
kanban/db-grid-less-than-metadata-shape-quoted] [fixture:
kanban/db-grid-lf-metadata-shape-quoted] [fixture:
kanban/db-grid-ls-metadata-shape-quoted] [fixture:
kanban/db-grid-nbsp-metadata-shape-quoted] [fixture:
kanban/db-grid-nel-metadata-shape-quoted] [fixture:
kanban/db-grid-nonascii-metadata-shape-quoted] [fixture:
kanban/db-grid-open-brace-metadata-shape-quoted] [fixture:
kanban/db-grid-open-round-metadata-shape-quoted] [fixture:
kanban/db-grid-open-square-metadata-shape-quoted] [fixture:
kanban/db-grid-percent-metadata-shape-quoted] [fixture:
kanban/db-grid-pipe-metadata-shape-quoted] [fixture:
kanban/db-grid-ps-metadata-shape-quoted] [fixture:
kanban/db-grid-root-metadata-shape-quoted] [fixture:
kanban/db-grid-semicolon-metadata-shape-quoted] [fixture:
kanban/db-grid-single-quote-metadata-shape-quoted] [fixture:
kanban/db-grid-spaces-metadata-shape-quoted] [fixture:
kanban/db-grid-style-rule-metadata-shape-quoted] [fixture:
kanban/db-grid-tab-metadata-shape-quoted] Rejected by the grammar: `quote`.
[fixture: kanban/gram-grid-quote-metadata-shape-quoted] Rejected by the YAML of
the data block: `ff`, `vt`. [fixture: kanban/gram-grid-ff-metadata-shape-quoted]
[fixture: kanban/gram-grid-vt-metadata-shape-quoted] Rejected by the Db: the
shape name has an upper-case letter or a `_` (`No such shape`): `classdef-rule`,
`keyword-class`, `keyword-classdef`, `keyword-style`, `proto`, `punct`.
[fixture: kanban/gram-grid-classdef-rule-metadata-shape-quoted] [fixture:
kanban/gram-grid-keyword-class-metadata-shape-quoted] [fixture:
kanban/gram-grid-keyword-classdef-metadata-shape-quoted] [fixture:
kanban/gram-grid-keyword-style-metadata-shape-quoted] [fixture:
kanban/gram-grid-proto-metadata-shape-quoted] [fixture:
kanban/gram-grid-punct-metadata-shape-quoted]

Values of the data block are read as YAML. The following sentences give what
each key reads from each kind of value, the keys being `label`, `assigned`,
`ticket`, `priority`, `icon`, and `shape`.

A value in plain, single-quoted, or double-quoted YAML text sets `label`,
`assigned`, `ticket`, `icon`, and `priority` to that text, and `label` replaces
the written label. [fixture: kanban/db-metadata-label-plain] [fixture:
kanban/db-metadata-assigned-plain] [fixture: kanban/db-metadata-ticket-plain]
[fixture: kanban/db-metadata-icon-plain] [fixture:
kanban/db-metadata-priority-plain] [fixture:
kanban/db-metadata-label-single-quoted] [fixture:
kanban/db-metadata-assigned-single-quoted] [fixture:
kanban/db-metadata-ticket-single-quoted] [fixture:
kanban/db-metadata-icon-single-quoted] [fixture:
kanban/db-metadata-priority-single-quoted] [fixture:
kanban/db-metadata-label-double-quoted] [fixture:
kanban/db-metadata-assigned-double-quoted] [fixture:
kanban/db-metadata-ticket-double-quoted] [fixture:
kanban/db-metadata-icon-double-quoted] [fixture:
kanban/db-metadata-priority-double-quoted]

A quoted value of spaces only is kept as the value. [fixture:
kanban/db-metadata-label-spaces] [fixture: kanban/db-metadata-assigned-spaces]
[fixture: kanban/db-metadata-ticket-spaces] [fixture:
kanban/db-metadata-icon-spaces] [fixture: kanban/db-metadata-priority-spaces]

An empty value, an empty string, `null`, `false`, `0`, and `-0` set nothing:
`label` keeps the written label and the other fields are absent. [fixture:
kanban/db-metadata-label-empty] [fixture: kanban/db-metadata-assigned-empty]
[fixture: kanban/db-metadata-ticket-empty] [fixture:
kanban/db-metadata-icon-empty] [fixture: kanban/db-metadata-priority-empty]
[fixture: kanban/db-metadata-label-empty-string] [fixture:
kanban/db-metadata-assigned-empty-string] [fixture:
kanban/db-metadata-ticket-empty-string] [fixture:
kanban/db-metadata-icon-empty-string] [fixture:
kanban/db-metadata-priority-empty-string] [fixture:
kanban/db-metadata-label-null] [fixture: kanban/db-metadata-assigned-null]
[fixture: kanban/db-metadata-ticket-null] [fixture:
kanban/db-metadata-icon-null] [fixture: kanban/db-metadata-priority-null]
[fixture: kanban/db-metadata-label-false] [fixture:
kanban/db-metadata-assigned-false] [fixture: kanban/db-metadata-ticket-false]
[fixture: kanban/db-metadata-icon-false] [fixture:
kanban/db-metadata-priority-false] [fixture: kanban/db-metadata-label-zero]
[fixture: kanban/db-metadata-assigned-zero] [fixture:
kanban/db-metadata-ticket-zero] [fixture: kanban/db-metadata-icon-zero]
[fixture: kanban/db-metadata-priority-zero] [fixture:
kanban/db-metadata-label-negative-zero] [fixture:
kanban/db-metadata-assigned-negative-zero] [fixture:
kanban/db-metadata-ticket-negative-zero] [fixture:
kanban/db-metadata-icon-negative-zero] [fixture:
kanban/db-metadata-priority-negative-zero]

A number, a negative number, and a number with a sign are read as their text by
`label`, `assigned`, `ticket`, and `icon` (`23`, `-2`, `2`), and `priority`
keeps the number, `true` is read as the text `true` and `priority` keeps the
boolean. [fixture: kanban/db-metadata-label-number] [fixture:
kanban/db-metadata-assigned-number] [fixture: kanban/db-metadata-ticket-number]
[fixture: kanban/db-metadata-icon-number] [fixture:
kanban/db-metadata-priority-number] [fixture: kanban/db-metadata-label-negative]
[fixture: kanban/db-metadata-assigned-negative] [fixture:
kanban/db-metadata-ticket-negative] [fixture: kanban/db-metadata-icon-negative]
[fixture: kanban/db-metadata-priority-negative] [fixture:
kanban/db-metadata-label-plus] [fixture: kanban/db-metadata-assigned-plus]
[fixture: kanban/db-metadata-ticket-plus] [fixture:
kanban/db-metadata-icon-plus] [fixture: kanban/db-metadata-priority-plus]
[fixture: kanban/db-metadata-label-true] [fixture:
kanban/db-metadata-assigned-true] [fixture: kanban/db-metadata-ticket-true]
[fixture: kanban/db-metadata-icon-true] [fixture:
kanban/db-metadata-priority-true]

A number with a suffix (`12px`) and the words `Infinity` and `NaN` are text in
every field. [fixture: kanban/db-metadata-label-number-suffix] [fixture:
kanban/db-metadata-assigned-number-suffix] [fixture:
kanban/db-metadata-ticket-number-suffix] [fixture:
kanban/db-metadata-icon-number-suffix] [fixture:
kanban/db-metadata-priority-number-suffix] [fixture:
kanban/db-metadata-label-infinity-word] [fixture:
kanban/db-metadata-assigned-infinity-word] [fixture:
kanban/db-metadata-ticket-infinity-word] [fixture:
kanban/db-metadata-icon-infinity-word] [fixture:
kanban/db-metadata-priority-infinity-word] [fixture:
kanban/db-metadata-label-nan-word] [fixture:
kanban/db-metadata-assigned-nan-word] [fixture:
kanban/db-metadata-ticket-nan-word] [fixture: kanban/db-metadata-icon-nan-word]
[fixture: kanban/db-metadata-priority-nan-word]

A list `[a, b]` is joined with a comma by `label`, `assigned`, `ticket`, and
`icon` (`a,b`), and `priority` keeps the list. [fixture:
kanban/db-metadata-label-list] [fixture: kanban/db-metadata-assigned-list]
[fixture: kanban/db-metadata-ticket-list] [fixture:
kanban/db-metadata-icon-list] [fixture: kanban/db-metadata-priority-list]

A key is case sensitive: `ASSIGNED`, `ICON`, `LABEL`, `PRIORITY`, `SHAPE`, and
`TICKET` set nothing. [fixture: kanban/db-metadata-label-upper-key] [fixture:
kanban/db-metadata-assigned-upper-key] [fixture:
kanban/db-metadata-ticket-upper-key] [fixture:
kanban/db-metadata-icon-upper-key] [fixture:
kanban/db-metadata-priority-upper-key] [fixture:
kanban/db-metadata-shape-upper-key]

The values of `.inf`, `-.inf`, and `.nan` in `priority` are read as the text
`Infinity` and `-Infinity`, and `.nan` sets nothing; the same words in a list
are texts, `1e400` is the text `1e400`, and the keys `__proto__` and
`constructor` of a mapping are kept as own keys. [fixture:
kanban/db-metadata-priority-non-finite] [fixture:
kanban/db-metadata-priority-nested-non-finite] [fixture:
kanban/db-metadata-priority-overflow-word] [fixture:
kanban/db-metadata-priority-own-prototype-key]

The key `shape` is not read: every value of it, including an empty value, a
number with a suffix, a name of a shape, and an upper-case key, changes nothing
in the summary. [fixture: kanban/db-metadata-shape-empty] [fixture:
kanban/db-metadata-shape-empty-string] [fixture: kanban/db-metadata-shape-false]
[fixture: kanban/db-metadata-shape-known-other] [fixture:
kanban/db-metadata-shape-lower] [fixture:
kanban/db-metadata-shape-negative-zero] [fixture: kanban/db-metadata-shape-null]
[fixture: kanban/db-metadata-shape-number-suffix] [fixture:
kanban/db-metadata-shape-spaces] [fixture: kanban/db-metadata-shape-upper-key]
[fixture: kanban/db-metadata-shape-zero]

## c4

`normalizeC4()` (`src/normalizers/c4.ts`) reads the shared C4 Db immediately
after parsing, before rendering. [fixture: c4/db-all-fields]

The summary keeps `type` from
[`getC4Type()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L76-L78).
[fixture: c4/db-all-fields]

The summary keeps `title` from
[`getTitle()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L722-L724).
[fixture: c4/db-all-fields]

The summary keeps `accTitle` from
[`getAccTitle()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L20-L20).
[fixture: c4/db-acc-title]

The summary keeps `accDescr` from
[`getAccDescription()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L26-L26).
[fixture: c4/db-all-fields]

`shapes`, `boundaries`, and `rels` are the complete own attribute bags from
[`getC4ShapeArray()`, `getBoundaries()`, and `getRels()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L684-L720),
in first-insertion order. [fixture: c4/db-shape-three-definitions] [fixture:
c4/db-boundary-three-definitions] [fixture: c4/db-rel-three-definitions]

A shape keeps `alias`, `label`, `descr`, `techn`, `typeC4Shape`,
`parentBoundary`, `wrap`, `sprite`, `tags`, `link`, and every other assigned
attribute, with undefined fields omitted. [fixture: c4/db-all-fields] [fixture:
c4/db-named-text-fields] [fixture: c4/db-style-layout-key-attributes]

A boundary keeps `alias`, `label`, `type`, `parentBoundary`, `wrap`, `tags`,
`link`, and every other assigned attribute; deployment nodes also keep
`nodeType` and their assigned description. [fixture: c4/db-all-fields] [fixture:
c4/db-keyword-node-l] [fixture: c4/db-keyword-node-r]

The first boundary is the initial `global` boundary, whose label and type are
`{ text: "global" }`, whose parent is the empty text, and whose tags and link
are null; declarations and style updates can update this entry. [fixture:
c4/db-number-layout-zero] [fixture: c4/gram-boundary-global-alias]

`parentBoundary` is the alias selected by the parsing stack at the declaration,
including repeated aliases, object-valued aliases, and aliases shared with a
shape; the summary does not rebuild a hierarchy. [fixture:
c4/gram-boundary-nested] [fixture: c4/db-boundary-alias-named-change] [fixture:
c4/gram-boundary-reused-alias] [fixture: c4/db-parent-c4container] [fixture:
c4/db-parent-c4context] [fixture: c4/db-parent-constructor] [fixture:
c4/db-parent-global] [fixture: c4/db-parent-hasownproperty] [fixture:
c4/db-parent-person] [fixture: c4/db-parent-proto] [fixture: c4/db-parent-title]
[fixture: c4/db-parent-tostring] [fixture: c4/demo-c4context-1d531a27] [fixture:
c4/demo-c4context-3c40673b] [fixture: c4/demo-c4context-49481a12] [fixture:
c4/demo-c4context-61e43307] [fixture: c4/docs-syntax-c4-5f697bdc] [fixture:
c4/docs-syntax-c4-90f106b9] [fixture: c4/docs-syntax-c4-f96d2403]

A relationship keeps `type`, `from`, `to`, `label`, `techn`, `descr`, `wrap`,
`sprite`, `tags`, `link`, its assigned style and offset fields, and every other
assigned attribute, without resolving its endpoints. [fixture: c4/db-all-fields]
[fixture: c4/db-alias-constructor] [fixture: c4/db-rel-named-endpoints]
[fixture: c4/db-rel-self] [fixture: c4/db-alias-c4container] [fixture:
c4/db-alias-c4context] [fixture: c4/db-alias-global] [fixture:
c4/db-alias-hasownproperty] [fixture: c4/db-alias-person] [fixture:
c4/db-alias-proto] [fixture: c4/db-alias-title] [fixture: c4/db-alias-tostring]

Shape and boundary aliases use strict equality, while relationships use the
ordered pair of endpoints; repeated definitions update the first matching entry
without moving it, and separate object-valued aliases or endpoints remain
separate entries. [fixture: c4/db-shape-three-definitions] [fixture:
c4/db-boundary-three-definitions] [fixture: c4/db-rel-three-definitions]
[fixture: c4/db-required-named-alias-repeat] [fixture:
c4/db-rel-object-endpoint-repeat] [fixture: c4/db-shape-case-sensitive]

A repeated shape resets its label, shape kind, parent and wrap; absent optional
technology, description and other attributes keep their earlier values.
[fixture: c4/db-shape-three-definitions]

A repeated boundary resets its label, type, parent and wrap, while absent tags,
links and deployment descriptions keep their earlier values. [fixture:
c4/db-boundary-three-definitions]

A repeated relationship resets type, endpoints, label and wrap, while absent
optional attributes keep their earlier values. [fixture:
c4/db-rel-three-definitions]

The grammar trims positional strings and named keys and values, including quoted
strings, and preserves their internal text; an empty positional string is an
empty argument, while an empty named value is rejected. [fixture:
c4/db-named-key-whitespace] [fixture: c4/db-required-label-empty] [fixture:
c4/db-required-alias-empty] [fixture: c4/gram-named-empty-value] [fixture:
c4/lex-empty-strings] [fixture: c4/lex-empty-comma] [fixture:
c4/lex-bare-whitespace-only] [fixture: c4/lex-named-whitespace-value]

Named arguments in required slots remain object-valued aliases or endpoints, or
the object inside a label's `text`; optional slots dispatch by the named key.
[fixture: c4/db-named-person-unknown-slot-1] [fixture:
c4/db-named-person-unknown-slot-2] [fixture: c4/db-rel-named-endpoints]
[fixture: c4/db-named-repeat] [fixture: c4/db-named-boundary-link-slot-1]
[fixture: c4/db-named-boundary-link-slot-2] [fixture:
c4/db-named-boundary-sprite-slot-1] [fixture:
c4/db-named-boundary-sprite-slot-2] [fixture: c4/db-named-boundary-tags-slot-1]
[fixture: c4/db-named-boundary-tags-slot-2] [fixture:
c4/db-named-boundary-unknown-slot-1] [fixture:
c4/db-named-boundary-unknown-slot-2] [fixture:
c4/db-named-component-link-slot-1] [fixture: c4/db-named-component-link-slot-2]
[fixture: c4/db-named-component-sprite-slot-1] [fixture:
c4/db-named-component-sprite-slot-2] [fixture:
c4/db-named-component-tags-slot-1] [fixture: c4/db-named-component-tags-slot-2]
[fixture: c4/db-named-component-unknown-slot-1] [fixture:
c4/db-named-component-unknown-slot-2] [fixture:
c4/db-named-container-boundary-link-slot-1] [fixture:
c4/db-named-container-boundary-link-slot-2] [fixture:
c4/db-named-container-boundary-sprite-slot-1] [fixture:
c4/db-named-container-boundary-sprite-slot-2] [fixture:
c4/db-named-container-boundary-tags-slot-1] [fixture:
c4/db-named-container-boundary-tags-slot-2] [fixture:
c4/db-named-container-boundary-type-slot-1] [fixture:
c4/db-named-container-boundary-type-slot-2] [fixture:
c4/db-named-container-boundary-unknown-slot-1] [fixture:
c4/db-named-container-boundary-unknown-slot-2] [fixture:
c4/db-named-container-link-slot-1] [fixture: c4/db-named-container-link-slot-2]
[fixture: c4/db-named-container-sprite-slot-1] [fixture:
c4/db-named-container-sprite-slot-2] [fixture:
c4/db-named-container-tags-slot-1] [fixture: c4/db-named-container-tags-slot-2]
[fixture: c4/db-named-container-unknown-slot-1] [fixture:
c4/db-named-container-unknown-slot-2] [fixture:
c4/db-named-enterprise-boundary-link-slot-1] [fixture:
c4/db-named-enterprise-boundary-link-slot-2] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-1] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-2] [fixture:
c4/db-named-enterprise-boundary-tags-slot-1] [fixture:
c4/db-named-enterprise-boundary-tags-slot-2] [fixture:
c4/db-named-enterprise-boundary-type-slot-1] [fixture:
c4/db-named-enterprise-boundary-type-slot-2] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-1] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-2] [fixture:
c4/db-named-index-link-slot-2] [fixture: c4/db-named-index-link-slot-3]
[fixture: c4/db-named-index-link-slot-4] [fixture:
c4/db-named-index-sprite-slot-2] [fixture: c4/db-named-index-sprite-slot-3]
[fixture: c4/db-named-index-sprite-slot-4] [fixture:
c4/db-named-index-tags-slot-2] [fixture: c4/db-named-index-tags-slot-3]
[fixture: c4/db-named-index-tags-slot-4] [fixture:
c4/db-named-index-unknown-slot-2] [fixture: c4/db-named-index-unknown-slot-3]
[fixture: c4/db-named-index-unknown-slot-4] [fixture:
c4/db-named-node-link-slot-1] [fixture: c4/db-named-node-link-slot-2] [fixture:
c4/db-named-node-sprite-slot-1] [fixture: c4/db-named-node-sprite-slot-2]
[fixture: c4/db-named-node-tags-slot-1] [fixture: c4/db-named-node-tags-slot-2]
[fixture: c4/db-named-node-unknown-slot-1] [fixture:
c4/db-named-node-unknown-slot-2] [fixture: c4/db-named-person-link-slot-1]
[fixture: c4/db-named-person-link-slot-2] [fixture:
c4/db-named-person-sprite-slot-1] [fixture: c4/db-named-person-sprite-slot-2]
[fixture: c4/db-named-person-tags-slot-1] [fixture:
c4/db-named-person-tags-slot-2] [fixture: c4/db-named-rel-link-slot-1] [fixture:
c4/db-named-rel-link-slot-2] [fixture: c4/db-named-rel-link-slot-3] [fixture:
c4/db-named-rel-sprite-slot-1] [fixture: c4/db-named-rel-sprite-slot-2]
[fixture: c4/db-named-rel-sprite-slot-3] [fixture: c4/db-named-rel-tags-slot-1]
[fixture: c4/db-named-rel-tags-slot-2] [fixture: c4/db-named-rel-tags-slot-3]
[fixture: c4/db-named-rel-unknown-slot-1] [fixture:
c4/db-named-rel-unknown-slot-2] [fixture: c4/db-named-rel-unknown-slot-3]
[fixture: c4/db-named-system-boundary-link-slot-1] [fixture:
c4/db-named-system-boundary-link-slot-2] [fixture:
c4/db-named-system-boundary-sprite-slot-1] [fixture:
c4/db-named-system-boundary-sprite-slot-2] [fixture:
c4/db-named-system-boundary-tags-slot-1] [fixture:
c4/db-named-system-boundary-tags-slot-2] [fixture:
c4/db-named-system-boundary-type-slot-1] [fixture:
c4/db-named-system-boundary-type-slot-2] [fixture:
c4/db-named-system-boundary-unknown-slot-1] [fixture:
c4/db-named-system-boundary-unknown-slot-2] [fixture:
c4/gram-proto-required-alias] [fixture: c4/spec-c4-boundary-b3599bdb] [fixture:
c4/spec-c4-boundary-bee7a277] [fixture: c4/spec-c4-container-227cee1f] [fixture:
c4/spec-c4-container-23198f5c] [fixture: c4/spec-c4-container-4d212df1]
[fixture: c4/spec-c4-container-525a49b6] [fixture:
c4/spec-c4-container-69e27135] [fixture: c4/spec-c4-container-6f47ed69]
[fixture: c4/spec-c4-container-709d6da2] [fixture:
c4/spec-c4-container-71f1f40a] [fixture: c4/spec-c4-container-73efb750]
[fixture: c4/spec-c4-container-7b219cb5] [fixture:
c4/spec-c4-container-7ff21db3] [fixture: c4/spec-c4-container-9fafe60a]
[fixture: c4/spec-c4-container-a4898ac9] [fixture:
c4/spec-c4-container-a8bcc8bb] [fixture: c4/spec-c4-container-cc23077f]
[fixture: c4/spec-c4-container-cfc9805a] [fixture:
c4/spec-c4-container-f61118ef] [fixture: c4/spec-c4-container-f76371df]
[fixture: c4/spec-c4-person-7cbb425f] [fixture: c4/spec-c4-person-7ddb8a15]
[fixture: c4/spec-c4-person-ext-428d8710] [fixture:
c4/spec-c4-person-ext-8bf8e3f1] [fixture: c4/spec-c4-person-ext-dea72a2a]
[fixture: c4/spec-c4-person-fb9d8438] [fixture: c4/spec-c4-system-059c79a3]
[fixture: c4/spec-c4-system-2554a22f] [fixture: c4/spec-c4-system-2eea5541]
[fixture: c4/spec-c4-system-3287508c] [fixture: c4/spec-c4-system-3650d093]
[fixture: c4/spec-c4-system-4e007e49] [fixture: c4/spec-c4-system-5c2436b9]
[fixture: c4/spec-c4-system-7af0386b] [fixture: c4/spec-c4-system-87ba2480]
[fixture: c4/spec-c4-system-94276e42] [fixture: c4/spec-c4-system-a59e3342]
[fixture: c4/spec-c4-system-c4992129] [fixture: c4/spec-c4-system-cdbd60ee]
[fixture: c4/spec-c4-system-d179118a] [fixture: c4/spec-c4-system-d386f240]
[fixture: c4/spec-c4-system-eb1891a8] [fixture: c4/spec-c4-system-ee47b0a8]
[fixture: c4/spec-c4-system-fecdbb6e]

Optional named `label`, `descr`, `techn`, and `type` values are stored as
`{ text }`, while other named values are plain strings, and later assignments to
the same key replace earlier assignments. [fixture: c4/db-named-text-fields]
[fixture: c4/db-named-repeat] [fixture: c4/db-named-case-sensitive] [fixture:
c4/db-named-boundary-link-slot-3] [fixture: c4/db-named-boundary-link-slot-4]
[fixture: c4/db-named-boundary-link-slot-5] [fixture:
c4/db-named-boundary-sprite-slot-3] [fixture:
c4/db-named-boundary-sprite-slot-4] [fixture:
c4/db-named-boundary-sprite-slot-5] [fixture: c4/db-named-boundary-tags-slot-3]
[fixture: c4/db-named-boundary-tags-slot-4] [fixture:
c4/db-named-boundary-tags-slot-5] [fixture: c4/db-named-boundary-unknown-slot-3]
[fixture: c4/db-named-boundary-unknown-slot-4] [fixture:
c4/db-named-boundary-unknown-slot-5] [fixture:
c4/db-named-component-link-slot-3] [fixture: c4/db-named-component-link-slot-4]
[fixture: c4/db-named-component-link-slot-5] [fixture:
c4/db-named-component-link-slot-6] [fixture: c4/db-named-component-link-slot-7]
[fixture: c4/db-named-component-sprite-slot-3] [fixture:
c4/db-named-component-sprite-slot-4] [fixture:
c4/db-named-component-sprite-slot-5] [fixture:
c4/db-named-component-sprite-slot-6] [fixture:
c4/db-named-component-sprite-slot-7] [fixture:
c4/db-named-component-tags-slot-3] [fixture: c4/db-named-component-tags-slot-4]
[fixture: c4/db-named-component-tags-slot-5] [fixture:
c4/db-named-component-tags-slot-6] [fixture: c4/db-named-component-tags-slot-7]
[fixture: c4/db-named-component-unknown-slot-3] [fixture:
c4/db-named-component-unknown-slot-4] [fixture:
c4/db-named-component-unknown-slot-5] [fixture:
c4/db-named-component-unknown-slot-6] [fixture:
c4/db-named-component-unknown-slot-7] [fixture:
c4/db-named-container-boundary-link-slot-3] [fixture:
c4/db-named-container-boundary-link-slot-4] [fixture:
c4/db-named-container-boundary-sprite-slot-3] [fixture:
c4/db-named-container-boundary-sprite-slot-4] [fixture:
c4/db-named-container-boundary-tags-slot-3] [fixture:
c4/db-named-container-boundary-tags-slot-4] [fixture:
c4/db-named-container-boundary-type-slot-3] [fixture:
c4/db-named-container-boundary-type-slot-4] [fixture:
c4/db-named-container-boundary-unknown-slot-3] [fixture:
c4/db-named-container-boundary-unknown-slot-4] [fixture:
c4/db-named-container-link-slot-3] [fixture: c4/db-named-container-link-slot-4]
[fixture: c4/db-named-container-link-slot-5] [fixture:
c4/db-named-container-link-slot-6] [fixture: c4/db-named-container-link-slot-7]
[fixture: c4/db-named-container-sprite-slot-3] [fixture:
c4/db-named-container-sprite-slot-4] [fixture:
c4/db-named-container-sprite-slot-5] [fixture:
c4/db-named-container-sprite-slot-6] [fixture:
c4/db-named-container-sprite-slot-7] [fixture:
c4/db-named-container-tags-slot-3] [fixture: c4/db-named-container-tags-slot-4]
[fixture: c4/db-named-container-tags-slot-5] [fixture:
c4/db-named-container-tags-slot-6] [fixture: c4/db-named-container-tags-slot-7]
[fixture: c4/db-named-container-unknown-slot-3] [fixture:
c4/db-named-container-unknown-slot-4] [fixture:
c4/db-named-container-unknown-slot-5] [fixture:
c4/db-named-container-unknown-slot-6] [fixture:
c4/db-named-container-unknown-slot-7] [fixture:
c4/db-named-enterprise-boundary-link-slot-3] [fixture:
c4/db-named-enterprise-boundary-link-slot-4] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-3] [fixture:
c4/db-named-enterprise-boundary-sprite-slot-4] [fixture:
c4/db-named-enterprise-boundary-tags-slot-3] [fixture:
c4/db-named-enterprise-boundary-tags-slot-4] [fixture:
c4/db-named-enterprise-boundary-type-slot-3] [fixture:
c4/db-named-enterprise-boundary-type-slot-4] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-3] [fixture:
c4/db-named-enterprise-boundary-unknown-slot-4] [fixture:
c4/db-named-index-link-slot-5] [fixture: c4/db-named-index-link-slot-6]
[fixture: c4/db-named-index-link-slot-7] [fixture:
c4/db-named-index-link-slot-8] [fixture: c4/db-named-index-link-slot-9]
[fixture: c4/db-named-index-sprite-slot-5] [fixture:
c4/db-named-index-sprite-slot-6] [fixture: c4/db-named-index-sprite-slot-7]
[fixture: c4/db-named-index-sprite-slot-8] [fixture:
c4/db-named-index-sprite-slot-9] [fixture: c4/db-named-index-tags-slot-5]
[fixture: c4/db-named-index-tags-slot-6] [fixture:
c4/db-named-index-tags-slot-7] [fixture: c4/db-named-index-tags-slot-8]
[fixture: c4/db-named-index-tags-slot-9] [fixture:
c4/db-named-index-unknown-slot-5] [fixture: c4/db-named-index-unknown-slot-6]
[fixture: c4/db-named-index-unknown-slot-7] [fixture:
c4/db-named-index-unknown-slot-8] [fixture: c4/db-named-index-unknown-slot-9]
[fixture: c4/db-named-node-link-slot-3] [fixture: c4/db-named-node-link-slot-4]
[fixture: c4/db-named-node-link-slot-6] [fixture: c4/db-named-node-link-slot-7]
[fixture: c4/db-named-node-sprite-slot-3] [fixture:
c4/db-named-node-sprite-slot-4] [fixture: c4/db-named-node-sprite-slot-6]
[fixture: c4/db-named-node-sprite-slot-7] [fixture:
c4/db-named-node-tags-slot-3] [fixture: c4/db-named-node-tags-slot-4] [fixture:
c4/db-named-node-tags-slot-6] [fixture: c4/db-named-node-tags-slot-7] [fixture:
c4/db-named-node-unknown-slot-3] [fixture: c4/db-named-node-unknown-slot-4]
[fixture: c4/db-named-node-unknown-slot-6] [fixture:
c4/db-named-node-unknown-slot-7] [fixture: c4/db-named-person-link-slot-3]
[fixture: c4/db-named-person-link-slot-4] [fixture:
c4/db-named-person-link-slot-5] [fixture: c4/db-named-person-link-slot-6]
[fixture: c4/db-named-person-sprite-slot-3] [fixture:
c4/db-named-person-sprite-slot-4] [fixture: c4/db-named-person-sprite-slot-5]
[fixture: c4/db-named-person-sprite-slot-6] [fixture:
c4/db-named-person-tags-slot-3] [fixture: c4/db-named-person-tags-slot-4]
[fixture: c4/db-named-person-tags-slot-5] [fixture:
c4/db-named-person-tags-slot-6] [fixture: c4/db-named-person-unknown-slot-3]
[fixture: c4/db-named-person-unknown-slot-4] [fixture:
c4/db-named-person-unknown-slot-5] [fixture: c4/db-named-person-unknown-slot-6]
[fixture: c4/db-named-rel-link-slot-4] [fixture: c4/db-named-rel-link-slot-5]
[fixture: c4/db-named-rel-link-slot-6] [fixture: c4/db-named-rel-link-slot-7]
[fixture: c4/db-named-rel-link-slot-8] [fixture: c4/db-named-rel-sprite-slot-4]
[fixture: c4/db-named-rel-sprite-slot-5] [fixture:
c4/db-named-rel-sprite-slot-6] [fixture: c4/db-named-rel-sprite-slot-7]
[fixture: c4/db-named-rel-sprite-slot-8] [fixture: c4/db-named-rel-tags-slot-4]
[fixture: c4/db-named-rel-tags-slot-5] [fixture: c4/db-named-rel-tags-slot-6]
[fixture: c4/db-named-rel-tags-slot-7] [fixture: c4/db-named-rel-tags-slot-8]
[fixture: c4/db-named-rel-unknown-slot-4] [fixture:
c4/db-named-rel-unknown-slot-5] [fixture: c4/db-named-rel-unknown-slot-6]
[fixture: c4/db-named-rel-unknown-slot-7] [fixture:
c4/db-named-rel-unknown-slot-8] [fixture:
c4/db-named-system-boundary-link-slot-3] [fixture:
c4/db-named-system-boundary-link-slot-4] [fixture:
c4/db-named-system-boundary-sprite-slot-3] [fixture:
c4/db-named-system-boundary-sprite-slot-4] [fixture:
c4/db-named-system-boundary-tags-slot-3] [fixture:
c4/db-named-system-boundary-tags-slot-4] [fixture:
c4/db-named-system-boundary-type-slot-3] [fixture:
c4/db-named-system-boundary-type-slot-4] [fixture:
c4/db-named-system-boundary-unknown-slot-3] [fixture:
c4/db-named-system-boundary-unknown-slot-4] [fixture:
c4/db-boundary-named-descr] [fixture: c4/demo-c4context-b284cb21] [fixture:
c4/docs-syntax-c4-96b1a834] [fixture: c4/spec-c4-named-attributes-0430c0e7]
[fixture: c4/spec-c4-named-attributes-048742bf] [fixture:
c4/spec-c4-named-attributes-04ac9f75] [fixture:
c4/spec-c4-named-attributes-0cb2c3dc] [fixture:
c4/spec-c4-named-attributes-1285022a] [fixture:
c4/spec-c4-named-attributes-13f03f92] [fixture:
c4/spec-c4-named-attributes-19f2c0e1] [fixture:
c4/spec-c4-named-attributes-1f32f4f3] [fixture:
c4/spec-c4-named-attributes-239d1762] [fixture:
c4/spec-c4-named-attributes-2c7bc6a9] [fixture:
c4/spec-c4-named-attributes-2f2e1475] [fixture:
c4/spec-c4-named-attributes-2fee60c3] [fixture:
c4/spec-c4-named-attributes-371eb482] [fixture:
c4/spec-c4-named-attributes-3a593391] [fixture:
c4/spec-c4-named-attributes-5fa9c306] [fixture:
c4/spec-c4-named-attributes-71ada770] [fixture:
c4/spec-c4-named-attributes-7bd43315] [fixture:
c4/spec-c4-named-attributes-7f638d49] [fixture:
c4/spec-c4-named-attributes-85d2588f] [fixture:
c4/spec-c4-named-attributes-8de80acb] [fixture:
c4/spec-c4-named-attributes-8e42e31e] [fixture:
c4/spec-c4-named-attributes-8ff48937] [fixture:
c4/spec-c4-named-attributes-94bcf784] [fixture:
c4/spec-c4-named-attributes-9c3f1780] [fixture:
c4/spec-c4-named-attributes-b5341020] [fixture:
c4/spec-c4-named-attributes-bd7f9fb7] [fixture:
c4/spec-c4-named-attributes-c242ed1a] [fixture:
c4/spec-c4-named-attributes-cd95a907] [fixture:
c4/spec-c4-named-attributes-d917387b] [fixture:
c4/spec-c4-named-attributes-dcc2d963] [fixture:
c4/spec-c4-named-attributes-ded1fdf7] [fixture:
c4/spec-c4-named-attributes-e2fffdaa] [fixture:
c4/spec-c4-named-attributes-e489689c] [fixture:
c4/spec-c4-named-attributes-ea0439ad] [fixture:
c4/spec-c4-named-attributes-f69f8e0b] [fixture:
c4/spec-c4-named-attributes-f7287970] [fixture:
c4/spec-c4-named-attributes-fb9b339a] [fixture:
c4/spec-c4-named-attributes-fe324471] [fixture: c4/spec-c4-person-1505b32b]

Fixed boundary keywords insert their type before the optional written arguments,
and a later named `$type` can replace it. [fixture:
c4/db-boundary-style-named-type] [fixture: c4/spec-c4-named-attributes-5d8133dd]
[fixture: c4/spec-c4-named-attributes-cdf4c373]

The deployment node's positional sprite slot is ignored, including a named
attribute in that slot, while a `$sprite` in another consumed optional slot can
set the sprite. [fixture: c4/db-node-sprite] [fixture:
c4/db-named-node-sprite-slot-3] [fixture: c4/db-named-node-sprite-slot-5]
[fixture: c4/db-named-node-link-slot-5] [fixture: c4/db-named-node-tags-slot-5]
[fixture: c4/db-named-node-unknown-slot-5] [fixture:
c4/gram-named-proto-node-ignored-sprite] [fixture:
c4/spec-c4-named-attributes-8fe1ed13]

`RelIndex` drops its first written argument and otherwise uses the ordinary
relationship arguments and type. [fixture: c4/db-keyword-relindex] [fixture:
c4/db-named-index-link-slot-1] [fixture: c4/db-named-index-sprite-slot-1]
[fixture: c4/db-named-index-tags-slot-1] [fixture:
c4/db-named-index-unknown-slot-1] [fixture:
c4/db-grid-ampersand-entity-index-argument-bare] [fixture:
c4/db-grid-arrow-index-argument-bare] [fixture:
c4/db-grid-arrow-spaced-index-argument-bare] [fixture:
c4/db-grid-backslash-index-argument-bare] [fixture:
c4/db-grid-backtick-index-argument-bare] [fixture:
c4/db-grid-bom-index-argument-bare] [fixture:
c4/db-grid-classdef-rule-index-argument-bare] [fixture:
c4/db-grid-close-brace-index-argument-bare] [fixture:
c4/db-grid-close-round-index-argument-bare] [fixture:
c4/db-grid-close-square-index-argument-bare] [fixture:
c4/db-grid-colon-index-argument-bare] [fixture:
c4/db-grid-comment-index-argument-bare] [fixture:
c4/db-grid-comment-line-index-argument-bare] [fixture:
c4/db-grid-constructor-index-argument-bare] [fixture:
c4/db-grid-cr-index-argument-bare] [fixture:
c4/db-grid-crlf-index-argument-bare] [fixture:
c4/db-grid-dash-index-argument-bare] [fixture:
c4/db-grid-digits-index-argument-bare] [fixture:
c4/db-grid-directive-index-argument-bare] [fixture:
c4/db-grid-directive-line-index-argument-bare] [fixture:
c4/db-grid-emoji-index-argument-bare] [fixture:
c4/db-grid-empty-index-argument-bare] [fixture:
c4/db-grid-entity-index-argument-bare] [fixture:
c4/db-grid-entity-named-index-argument-bare] [fixture:
c4/db-grid-equals-index-argument-bare] [fixture:
c4/db-grid-ff-index-argument-bare] [fixture:
c4/db-grid-greater-than-index-argument-bare] [fixture:
c4/db-grid-hash-index-argument-bare] [fixture:
c4/db-grid-html-index-argument-bare] [fixture:
c4/db-grid-html-attribute-index-argument-bare] [fixture:
c4/db-grid-html-br-index-argument-bare] [fixture:
c4/db-grid-ideographic-index-argument-bare] [fixture:
c4/db-grid-keyword-index-argument-bare] [fixture:
c4/db-grid-keyword-block-index-argument-bare] [fixture:
c4/db-grid-keyword-class-index-argument-bare] [fixture:
c4/db-grid-keyword-classdef-index-argument-bare] [fixture:
c4/db-grid-keyword-columns-index-argument-bare] [fixture:
c4/db-grid-keyword-end-index-argument-bare] [fixture:
c4/db-grid-keyword-header-index-argument-bare] [fixture:
c4/db-grid-keyword-space-index-argument-bare] [fixture:
c4/db-grid-keyword-style-index-argument-bare] [fixture:
c4/db-grid-less-than-index-argument-bare] [fixture:
c4/db-grid-lf-index-argument-bare] [fixture: c4/db-grid-ls-index-argument-bare]
[fixture: c4/db-grid-nbsp-index-argument-bare] [fixture:
c4/db-grid-nel-index-argument-bare] [fixture:
c4/db-grid-nonascii-index-argument-bare] [fixture:
c4/db-grid-open-brace-index-argument-bare] [fixture:
c4/db-grid-open-round-index-argument-bare] [fixture:
c4/db-grid-open-square-index-argument-bare] [fixture:
c4/db-grid-percent-index-argument-bare] [fixture:
c4/db-grid-pipe-index-argument-bare] [fixture:
c4/db-grid-proto-index-argument-bare] [fixture:
c4/db-grid-ps-index-argument-bare] [fixture:
c4/db-grid-quote-index-argument-bare] [fixture:
c4/db-grid-root-index-argument-bare] [fixture:
c4/db-grid-semicolon-index-argument-bare] [fixture:
c4/db-grid-single-quote-index-argument-bare] [fixture:
c4/db-grid-spaces-index-argument-bare] [fixture:
c4/db-grid-style-rule-index-argument-bare] [fixture:
c4/db-grid-tab-index-argument-bare] [fixture: c4/db-grid-vt-index-argument-bare]
[fixture: c4/db-grid-ampersand-entity-index-argument-quoted] [fixture:
c4/db-grid-arrow-index-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-index-argument-quoted] [fixture:
c4/db-grid-backslash-index-argument-quoted] [fixture:
c4/db-grid-backtick-index-argument-quoted] [fixture:
c4/db-grid-bom-index-argument-quoted] [fixture:
c4/db-grid-classdef-rule-index-argument-quoted] [fixture:
c4/db-grid-close-brace-index-argument-quoted] [fixture:
c4/db-grid-close-round-index-argument-quoted] [fixture:
c4/db-grid-close-square-index-argument-quoted] [fixture:
c4/db-grid-colon-index-argument-quoted] [fixture:
c4/db-grid-comma-index-argument-quoted] [fixture:
c4/db-grid-comment-index-argument-quoted] [fixture:
c4/db-grid-comment-line-index-argument-quoted] [fixture:
c4/db-grid-constructor-index-argument-quoted] [fixture:
c4/db-grid-cr-index-argument-quoted] [fixture:
c4/db-grid-crlf-index-argument-quoted] [fixture:
c4/db-grid-dash-index-argument-quoted] [fixture:
c4/db-grid-digits-index-argument-quoted] [fixture:
c4/db-grid-directive-index-argument-quoted] [fixture:
c4/db-grid-directive-line-index-argument-quoted] [fixture:
c4/db-grid-emoji-index-argument-quoted] [fixture:
c4/db-grid-empty-index-argument-quoted] [fixture:
c4/db-grid-entity-index-argument-quoted] [fixture:
c4/db-grid-entity-named-index-argument-quoted] [fixture:
c4/db-grid-equals-index-argument-quoted] [fixture:
c4/db-grid-ff-index-argument-quoted] [fixture:
c4/db-grid-greater-than-index-argument-quoted] [fixture:
c4/db-grid-hash-index-argument-quoted] [fixture:
c4/db-grid-html-index-argument-quoted] [fixture:
c4/db-grid-html-attribute-index-argument-quoted] [fixture:
c4/db-grid-html-br-index-argument-quoted] [fixture:
c4/db-grid-ideographic-index-argument-quoted] [fixture:
c4/db-grid-keyword-index-argument-quoted] [fixture:
c4/db-grid-keyword-block-index-argument-quoted] [fixture:
c4/db-grid-keyword-class-index-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-index-argument-quoted] [fixture:
c4/db-grid-keyword-columns-index-argument-quoted] [fixture:
c4/db-grid-keyword-end-index-argument-quoted] [fixture:
c4/db-grid-keyword-header-index-argument-quoted] [fixture:
c4/db-grid-keyword-space-index-argument-quoted] [fixture:
c4/db-grid-keyword-style-index-argument-quoted] [fixture:
c4/db-grid-less-than-index-argument-quoted] [fixture:
c4/db-grid-lf-index-argument-quoted] [fixture:
c4/db-grid-ls-index-argument-quoted] [fixture:
c4/db-grid-nbsp-index-argument-quoted] [fixture:
c4/db-grid-nel-index-argument-quoted] [fixture:
c4/db-grid-nonascii-index-argument-quoted] [fixture:
c4/db-grid-open-brace-index-argument-quoted] [fixture:
c4/db-grid-open-round-index-argument-quoted] [fixture:
c4/db-grid-open-square-index-argument-quoted] [fixture:
c4/db-grid-percent-index-argument-quoted] [fixture:
c4/db-grid-pipe-index-argument-quoted] [fixture:
c4/db-grid-proto-index-argument-quoted] [fixture:
c4/db-grid-ps-index-argument-quoted] [fixture:
c4/db-grid-punct-index-argument-quoted] [fixture:
c4/db-grid-root-index-argument-quoted] [fixture:
c4/db-grid-semicolon-index-argument-quoted] [fixture:
c4/db-grid-single-quote-index-argument-quoted] [fixture:
c4/db-grid-spaces-index-argument-quoted] [fixture:
c4/db-grid-style-rule-index-argument-quoted] [fixture:
c4/db-grid-tab-index-argument-quoted] [fixture:
c4/db-grid-vt-index-argument-quoted]

[`UpdateElementStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L494-L590)
updates the first matching shape, or the first matching boundary when no shape
matches, and a missing target changes nothing. [fixture:
c4/gram-boundary-reused-alias] [fixture: c4/db-style-boundary] [fixture:
c4/db-style-before-definition] [fixture: c4/db-named-element-style-link-slot-1]
[fixture: c4/db-named-element-style-sprite-slot-1] [fixture:
c4/db-named-element-style-tags-slot-1] [fixture:
c4/db-named-element-style-unknown-slot-1] [fixture:
c4/db-style-required-named-target]

Element styles keep `bgColor`, `fontColor`, `borderColor`, `shadowing`, `shape`,
`sprite`, `techn`, `legendText`, and `legendSprite`; named style arguments write
plain values even for text fields and arbitrary keys, and later updates replace
only the supplied fields. [fixture: c4/db-all-fields] [fixture:
c4/db-style-text-replacement] [fixture: c4/db-style-three-updates] [fixture:
c4/db-named-element-style-link-slot-10] [fixture:
c4/db-named-element-style-link-slot-2] [fixture:
c4/db-named-element-style-link-slot-3] [fixture:
c4/db-named-element-style-link-slot-4] [fixture:
c4/db-named-element-style-link-slot-5] [fixture:
c4/db-named-element-style-link-slot-6] [fixture:
c4/db-named-element-style-link-slot-7] [fixture:
c4/db-named-element-style-link-slot-8] [fixture:
c4/db-named-element-style-link-slot-9] [fixture:
c4/db-named-element-style-sprite-slot-10] [fixture:
c4/db-named-element-style-sprite-slot-2] [fixture:
c4/db-named-element-style-sprite-slot-3] [fixture:
c4/db-named-element-style-sprite-slot-4] [fixture:
c4/db-named-element-style-sprite-slot-5] [fixture:
c4/db-named-element-style-sprite-slot-6] [fixture:
c4/db-named-element-style-sprite-slot-7] [fixture:
c4/db-named-element-style-sprite-slot-8] [fixture:
c4/db-named-element-style-sprite-slot-9] [fixture:
c4/db-named-element-style-tags-slot-10] [fixture:
c4/db-named-element-style-tags-slot-2] [fixture:
c4/db-named-element-style-tags-slot-3] [fixture:
c4/db-named-element-style-tags-slot-4] [fixture:
c4/db-named-element-style-tags-slot-5] [fixture:
c4/db-named-element-style-tags-slot-6] [fixture:
c4/db-named-element-style-tags-slot-7] [fixture:
c4/db-named-element-style-tags-slot-8] [fixture:
c4/db-named-element-style-tags-slot-9] [fixture:
c4/db-named-element-style-unknown-slot-10] [fixture:
c4/db-named-element-style-unknown-slot-2] [fixture:
c4/db-named-element-style-unknown-slot-3] [fixture:
c4/db-named-element-style-unknown-slot-4] [fixture:
c4/db-named-element-style-unknown-slot-5] [fixture:
c4/db-named-element-style-unknown-slot-6] [fixture:
c4/db-named-element-style-unknown-slot-7] [fixture:
c4/db-named-element-style-unknown-slot-8] [fixture:
c4/db-named-element-style-unknown-slot-9] [fixture: c4/demo-c4context-61e43307]
[fixture: c4/docs-syntax-c4-f96d2403]

`UpdateRelStyle` updates only an already stored ordered endpoint pair, retaining
`textColor`, `lineColor`, `offsetX`, `offsetY`, and arbitrary named fields, with
later updates replacing only supplied fields. [fixture:
c4/db-style-before-definition] [fixture: c4/db-update-rel-style-three-times]
[fixture: c4/db-update-rel-style-named-text] [fixture:
c4/db-named-rel-style-link-slot-1] [fixture: c4/db-named-rel-style-link-slot-2]
[fixture: c4/db-named-rel-style-link-slot-3] [fixture:
c4/db-named-rel-style-link-slot-4] [fixture:
c4/db-named-rel-style-sprite-slot-1] [fixture:
c4/db-named-rel-style-sprite-slot-2] [fixture:
c4/db-named-rel-style-sprite-slot-3] [fixture:
c4/db-named-rel-style-sprite-slot-4] [fixture:
c4/db-named-rel-style-tags-slot-1] [fixture: c4/db-named-rel-style-tags-slot-2]
[fixture: c4/db-named-rel-style-tags-slot-3] [fixture:
c4/db-named-rel-style-tags-slot-4] [fixture:
c4/db-named-rel-style-unknown-slot-1] [fixture:
c4/db-named-rel-style-unknown-slot-2] [fixture:
c4/db-named-rel-style-unknown-slot-3] [fixture:
c4/db-named-rel-style-unknown-slot-4] [fixture: c4/demo-c4context-3c40673b]
[fixture: c4/docs-syntax-c4-5f697bdc]

Offset slots use `parseInt()` on the supplied value, even when the named key
selects another field; non-finite numbers are recorded as `"NaN"`, `"Infinity"`,
or `"-Infinity"`, and negative zero as zero. [fixture:
c4/db-number-rel-style-negative-zero] [fixture: c4/db-number-rel-style-nan]
[fixture: c4/db-number-rel-style-overflow] [fixture:
c4/db-update-rel-style-named-number-key] [fixture: c4/db-number-rel-style-empty]
[fixture: c4/db-number-rel-style-exponent] [fixture:
c4/db-number-rel-style-fraction] [fixture: c4/db-number-rel-style-fullwidth]
[fixture: c4/db-number-rel-style-hex] [fixture: c4/db-number-rel-style-infinity]
[fixture: c4/db-number-rel-style-negative] [fixture:
c4/db-number-rel-style-non-ascii] [fixture: c4/db-number-rel-style-plus]
[fixture: c4/db-number-rel-style-space-text-after] [fixture:
c4/db-number-rel-style-text-after] [fixture: c4/db-number-rel-style-zero]
[fixture: c4/db-named-rel-style-link-slot-5] [fixture:
c4/db-named-rel-style-link-slot-6] [fixture:
c4/db-named-rel-style-sprite-slot-5] [fixture:
c4/db-named-rel-style-sprite-slot-6] [fixture:
c4/db-named-rel-style-tags-slot-5] [fixture: c4/db-named-rel-style-tags-slot-6]
[fixture: c4/db-named-rel-style-unknown-slot-5] [fixture:
c4/db-named-rel-style-unknown-slot-6] [fixture: c4/demo-c4context-61e43307]
[fixture: c4/docs-syntax-c4-bc80e69a] [fixture: c4/docs-syntax-c4-f96d2403]

In `UpdateRelStyle`, named `offsetX` and `offsetY` values supplied in the
`textColor` or `lineColor` slots remain strings; only the offset slots parse
numbers. [fixture: c4/demo-c4context-1d531a27] [fixture:
c4/demo-c4context-3c40673b] [fixture: c4/demo-c4context-49481a12] [fixture:
c4/demo-c4context-b284cb21] [fixture: c4/docs-syntax-c4-5f697bdc] [fixture:
c4/docs-syntax-c4-90f106b9] [fixture: c4/docs-syntax-c4-96b1a834] [fixture:
c4/docs-syntax-c4-e233a726]

`c4ShapeInRow` and `c4BoundaryInRow` come from their Db getters, start at 4 and
2, and change independently when the corresponding `UpdateLayoutConfig`
argument's `parseInt()` value is at least one; argument position selects the
counter even for named arguments. [fixture: c4/db-number-layout-zero] [fixture:
c4/db-named-layout-order] [fixture: c4/db-named-layout-key] [fixture:
c4/db-update-layout-three-times] [fixture: c4/db-number-layout-exponent]
[fixture: c4/db-number-layout-fraction] [fixture: c4/db-number-layout-fullwidth]
[fixture: c4/db-number-layout-hex] [fixture: c4/db-number-layout-infinity]
[fixture: c4/db-number-layout-nan] [fixture: c4/db-number-layout-negative]
[fixture: c4/db-number-layout-negative-zero] [fixture:
c4/db-number-layout-non-ascii] [fixture: c4/db-number-layout-overflow] [fixture:
c4/db-number-layout-plus] [fixture: c4/db-number-layout-space-text-after]
[fixture: c4/db-number-layout-text-after] [fixture:
c4/db-named-layout-link-slot-1] [fixture: c4/db-named-layout-link-slot-2]
[fixture: c4/db-named-layout-sprite-slot-1] [fixture:
c4/db-named-layout-sprite-slot-2] [fixture: c4/db-named-layout-tags-slot-1]
[fixture: c4/db-named-layout-tags-slot-2] [fixture:
c4/db-named-layout-unknown-slot-1] [fixture: c4/db-named-layout-unknown-slot-2]
[fixture: c4/gram-proto-layout] [fixture: c4/gram-update-empty-string] [fixture:
c4/demo-c4context-61e43307] [fixture: c4/docs-syntax-c4-bc80e69a] [fixture:
c4/docs-syntax-c4-f96d2403]

The grammar accepts an unbounded sequence of attributes; the Db ignores those
past the called function's parameters. [fixture: c4/gram-arguments-person-above]
[fixture: c4/gram-arguments-rel-above] [fixture:
c4/gram-arguments-element-style-above] [fixture:
c4/gram-arguments-boundary-above] [fixture: c4/gram-arguments-component-above]
[fixture: c4/gram-arguments-container-above] [fixture:
c4/gram-arguments-index-above] [fixture: c4/gram-arguments-layout-above]
[fixture: c4/gram-arguments-node-above] [fixture:
c4/gram-arguments-rel-style-above] [fixture: c4/gram-proto-unused-extra]

The five exact header words set `type`, require a line break before statements,
and require a nonempty statement list. [fixture: c4/header-context-minimal]
[fixture: c4/header-container-minimal] [fixture: c4/header-component-minimal]
[fixture: c4/header-dynamic-minimal] [fixture: c4/header-deployment-minimal]
[fixture: c4/db-empty-board] [fixture:
c4/header-context-statement-on-header-line] [fixture:
c4/db-grid-empty-header-line] [fixture: c4/header-component-only] [fixture:
c4/header-component-only-lf] [fixture:
c4/header-component-statement-on-header-line] [fixture:
c4/header-component-tab-statement-on-header-line] [fixture:
c4/header-component-title-on-header-line] [fixture: c4/header-component-twice]
[fixture: c4/header-container-only] [fixture: c4/header-container-only-lf]
[fixture: c4/header-container-statement-on-header-line] [fixture:
c4/header-container-tab-statement-on-header-line] [fixture:
c4/header-container-title-on-header-line] [fixture: c4/header-container-twice]
[fixture: c4/header-context-only] [fixture:
c4/header-context-tab-statement-on-header-line] [fixture:
c4/header-context-title-on-header-line] [fixture: c4/header-context-twice]
[fixture: c4/header-deployment-only] [fixture: c4/header-deployment-only-lf]
[fixture: c4/header-deployment-statement-on-header-line] [fixture:
c4/header-deployment-tab-statement-on-header-line] [fixture:
c4/header-deployment-title-on-header-line] [fixture: c4/header-deployment-twice]
[fixture: c4/header-dynamic-only] [fixture: c4/header-dynamic-only-lf] [fixture:
c4/header-dynamic-statement-on-header-line] [fixture:
c4/header-dynamic-tab-statement-on-header-line] [fixture:
c4/header-dynamic-title-on-header-line] [fixture: c4/header-dynamic-twice]
[fixture: c4/header-header-semicolon]

All five headers use the same statement grammar, including every element,
boundary, node, relationship and update family. [fixture:
c4/db-keyword-person-ext] [fixture: c4/db-keyword-systemqueue-ext] [fixture:
c4/db-keyword-containerqueue-ext] [fixture: c4/db-keyword-componentqueue-ext]
[fixture: c4/db-keyword-rel-back]

`title` takes the text after its first separator, keeping additional leading and
trailing spaces; `accTitle:` trims its value and sets the same title, leaving
`accTitle` empty, and the last such statement wins. [fixture:
c4/db-title-whitespace] [fixture: c4/db-acc-title] [fixture:
c4/db-title-acc-order] [fixture: c4/db-title-frontmatter] [fixture:
c4/db-title-plain] [fixture: c4/db-title-spaces] [fixture:
c4/db-title-spaces-only] [fixture: c4/db-title-tab] [fixture:
c4/db-title-tab-only] [fixture: c4/db-title-three-times] [fixture:
c4/db-acctitle-empty] [fixture: c4/db-acctitle-plain] [fixture:
c4/db-acctitle-spaces] [fixture: c4/db-acctitle-tab] [fixture:
c4/db-acctitle-three-times] [fixture: c4/db-acc-title-space-before-colon]
[fixture: c4/demo-c4context-61e43307] [fixture: c4/spec-c4-component-0da5aed2]
[fixture: c4/spec-c4-component-469fb648] [fixture:
c4/spec-c4-component-a8988ac2] [fixture: c4/spec-c4-component-d1298236]
[fixture: c4/spec-c4-component-ebbe1176] [fixture:
c4/spec-c4-component-f06e3225] [fixture: c4/spec-c4-diagram-a95fd4b0]

`accDescription` keeps the text after its first separator, while `accDescr:`
trims its value and a nonempty `accDescr { ... }` trims the block; all three set
`accDescr`, whose setter removes whitespace following line feeds. [fixture:
c4/db-acc-description-whitespace] [fixture: c4/db-acc-description-order]
[fixture: c4/gram-acc-descr-block-text] [fixture: c4/db-accdescription-plain]
[fixture: c4/db-accdescription-spaces] [fixture: c4/db-accdescription-tab]
[fixture: c4/db-accdescription-three-times] [fixture: c4/db-accdescr-empty]
[fixture: c4/db-accdescr-plain] [fixture: c4/db-accdescr-spaces] [fixture:
c4/db-accdescr-tab] [fixture: c4/db-accdescr-three-times] [fixture:
c4/db-acc-descr-tab-before-colon] [fixture: c4/db-acc-description-spaces-only]
[fixture: c4/gram-acc-descr-block-after-text-text] [fixture:
c4/gram-acc-descr-block-comment-line] [fixture:
c4/gram-acc-descr-block-after-text-comment-line] [fixture:
c4/gram-acc-descr-block-directive-line] [fixture:
c4/gram-acc-descr-block-after-text-directive-line] [fixture:
c4/demo-c4context-61e43307]

An empty description block emits no statement and keeps the preceding value when
inline with a diagram statement, while a line break after it can leave an extra
newline that the grammar rejects. [fixture:
c4/db-empty-block-inline-before-shape] [fixture:
c4/db-empty-block-inline-after-shape] [fixture: c4/db-empty-block-inline-two]
[fixture: c4/db-empty-description-block-after-value] [fixture:
c4/gram-block-with-comment-only] [fixture: c4/db-empty-block-inline-blank-lines]
[fixture: c4/db-empty-block-inline-spaces] [fixture:
c4/gram-empty-block-after-title] [fixture: c4/gram-empty-block-before-person]
[fixture: c4/gram-empty-block-before-close] [fixture:
c4/gram-empty-block-after-boundary-open] [fixture:
c4/gram-empty-block-after-boundary-close] [fixture:
c4/gram-empty-block-after-args-before-body] [fixture:
c4/gram-empty-block-boundary-between-line-brace] [fixture:
c4/gram-grid-empty-acc-descr-block]

Frontmatter title and accessibility fields do not set these C4 getters.
[fixture: c4/db-title-frontmatter] [fixture: c4/db-frontmatter-drawing-config]

The root `wrap` configuration is copied to shapes, boundaries and relationships;
undefined wrap and a null configuration value are omitted, false and other
supplied values are kept, and `wrap:` and `nowrap:` in labels remain literal
text. [fixture: c4/db-wrap-directive] [fixture: c4/config-wrap-true] [fixture:
c4/config-wrap-false] [fixture: c4/config-wrap-null] [fixture:
c4/config-wrap-text] [fixture: c4/db-wrap-frontmatter] [fixture:
c4/db-wrap-init-directive]

Theme settings, `c4.wrap`, and C4 row settings do not change the parse-time Db
fields, while an unsupported `securityLevel` with HTML labels enabled replaces
characters in title and accessibility text; root `htmlLabels` takes precedence
over `flowchart.htmlLabels`. [fixture: c4/db-directive-drawing-config] [fixture:
c4/db-frontmatter-drawing-config] [fixture: c4/config-security-level-other]
[fixture: c4/config-security-level-other-html-labels-false] [fixture:
c4/config-security-level-other-flowchart-html-labels-false] [fixture:
c4/config-security-level-other-root-overrides-flowchart]

The summary drops the configuration object, renderer constants, redundant shape
keys, and the boundary parsing stack; renderer geometry is not populated during
parsing, and geometry-like named attributes remain written attributes. [fixture:
c4/db-number-layout-zero] [fixture: c4/gram-boundary-nested] [fixture:
c4/db-style-layout-key-attributes]

`patchC4Db()` clears the shared accessibility texts through their setters when
C4 clears its own fields, so each input starts with empty accessibility texts.
[fixture: c4/db-all-fields] [fixture: c4/header-context-minimal]

C4 has no `@{ ... }` data block production. [fixture: c4/gram-data-block]

The unanchored direction lexer rule can consume arbitrary preceding text on the
same line; a direction token inside a diagram's statement list is rejected, and
one that replaces the header calls the absent `setDirection` method and throws a
TypeError. [fixture: c4/gram-direction-tb-prefix] [fixture:
c4/gram-header-direction-tb] [fixture: c4/gram-header-direction-bt] [fixture:
c4/gram-header-direction-rl] [fixture: c4/gram-header-direction-lr]

### Headers and statement boundaries

After directive removal, a call keyword must touch its opening `(`; spaces,
tabs, line breaks, or comment lines between them are rejected. [fixture:
c4/lex-keyword-gap-birel-blank-line] [fixture:
c4/lex-keyword-gap-birel-comment-line] [fixture:
c4/lex-keyword-gap-birel-directive-line] [fixture: c4/lex-keyword-gap-birel-lf]
[fixture: c4/lex-keyword-gap-birel-space] [fixture:
c4/lex-keyword-gap-birel-tab] [fixture: c4/lex-keyword-gap-boundary-blank-line]
[fixture: c4/lex-keyword-gap-boundary-comment-line] [fixture:
c4/lex-keyword-gap-boundary-directive-line] [fixture:
c4/lex-keyword-gap-boundary-lf] [fixture: c4/lex-keyword-gap-boundary-space]
[fixture: c4/lex-keyword-gap-boundary-tab] [fixture:
c4/lex-keyword-gap-component-blank-line] [fixture:
c4/lex-keyword-gap-component-comment-line] [fixture:
c4/lex-keyword-gap-component-directive-line] [fixture:
c4/lex-keyword-gap-component-ext-blank-line] [fixture:
c4/lex-keyword-gap-component-ext-comment-line] [fixture:
c4/lex-keyword-gap-component-ext-directive-line] [fixture:
c4/lex-keyword-gap-component-ext-lf] [fixture:
c4/lex-keyword-gap-component-ext-space] [fixture:
c4/lex-keyword-gap-component-ext-tab] [fixture: c4/lex-keyword-gap-component-lf]
[fixture: c4/lex-keyword-gap-component-space] [fixture:
c4/lex-keyword-gap-component-tab] [fixture:
c4/lex-keyword-gap-componentdb-blank-line] [fixture:
c4/lex-keyword-gap-componentdb-comment-line] [fixture:
c4/lex-keyword-gap-componentdb-directive-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-blank-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-comment-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-directive-line] [fixture:
c4/lex-keyword-gap-componentdb-ext-lf] [fixture:
c4/lex-keyword-gap-componentdb-ext-space] [fixture:
c4/lex-keyword-gap-componentdb-ext-tab] [fixture:
c4/lex-keyword-gap-componentdb-lf] [fixture:
c4/lex-keyword-gap-componentdb-space] [fixture:
c4/lex-keyword-gap-componentdb-tab] [fixture:
c4/lex-keyword-gap-componentqueue-blank-line] [fixture:
c4/lex-keyword-gap-componentqueue-comment-line] [fixture:
c4/lex-keyword-gap-componentqueue-directive-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-blank-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-comment-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-directive-line] [fixture:
c4/lex-keyword-gap-componentqueue-ext-lf] [fixture:
c4/lex-keyword-gap-componentqueue-ext-space] [fixture:
c4/lex-keyword-gap-componentqueue-ext-tab] [fixture:
c4/lex-keyword-gap-componentqueue-lf] [fixture:
c4/lex-keyword-gap-componentqueue-space] [fixture:
c4/lex-keyword-gap-componentqueue-tab] [fixture:
c4/lex-keyword-gap-container-blank-line] [fixture:
c4/lex-keyword-gap-container-boundary-blank-line] [fixture:
c4/lex-keyword-gap-container-boundary-comment-line] [fixture:
c4/lex-keyword-gap-container-boundary-directive-line] [fixture:
c4/lex-keyword-gap-container-boundary-lf] [fixture:
c4/lex-keyword-gap-container-boundary-space] [fixture:
c4/lex-keyword-gap-container-boundary-tab] [fixture:
c4/lex-keyword-gap-container-comment-line] [fixture:
c4/lex-keyword-gap-container-directive-line] [fixture:
c4/lex-keyword-gap-container-ext-blank-line] [fixture:
c4/lex-keyword-gap-container-ext-comment-line] [fixture:
c4/lex-keyword-gap-container-ext-directive-line] [fixture:
c4/lex-keyword-gap-container-ext-lf] [fixture:
c4/lex-keyword-gap-container-ext-space] [fixture:
c4/lex-keyword-gap-container-ext-tab] [fixture: c4/lex-keyword-gap-container-lf]
[fixture: c4/lex-keyword-gap-container-space] [fixture:
c4/lex-keyword-gap-container-tab] [fixture:
c4/lex-keyword-gap-containerdb-blank-line] [fixture:
c4/lex-keyword-gap-containerdb-comment-line] [fixture:
c4/lex-keyword-gap-containerdb-directive-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-blank-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-comment-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-directive-line] [fixture:
c4/lex-keyword-gap-containerdb-ext-lf] [fixture:
c4/lex-keyword-gap-containerdb-ext-space] [fixture:
c4/lex-keyword-gap-containerdb-ext-tab] [fixture:
c4/lex-keyword-gap-containerdb-lf] [fixture:
c4/lex-keyword-gap-containerdb-space] [fixture:
c4/lex-keyword-gap-containerdb-tab] [fixture:
c4/lex-keyword-gap-containerqueue-blank-line] [fixture:
c4/lex-keyword-gap-containerqueue-comment-line] [fixture:
c4/lex-keyword-gap-containerqueue-directive-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-blank-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-comment-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-directive-line] [fixture:
c4/lex-keyword-gap-containerqueue-ext-lf] [fixture:
c4/lex-keyword-gap-containerqueue-ext-space] [fixture:
c4/lex-keyword-gap-containerqueue-ext-tab] [fixture:
c4/lex-keyword-gap-containerqueue-lf] [fixture:
c4/lex-keyword-gap-containerqueue-space] [fixture:
c4/lex-keyword-gap-containerqueue-tab] [fixture:
c4/lex-keyword-gap-deployment-node-blank-line] [fixture:
c4/lex-keyword-gap-deployment-node-comment-line] [fixture:
c4/lex-keyword-gap-deployment-node-directive-line] [fixture:
c4/lex-keyword-gap-deployment-node-lf] [fixture:
c4/lex-keyword-gap-deployment-node-space] [fixture:
c4/lex-keyword-gap-deployment-node-tab] [fixture:
c4/lex-keyword-gap-enterprise-boundary-blank-line] [fixture:
c4/lex-keyword-gap-enterprise-boundary-comment-line] [fixture:
c4/lex-keyword-gap-enterprise-boundary-directive-line] [fixture:
c4/lex-keyword-gap-enterprise-boundary-lf] [fixture:
c4/lex-keyword-gap-enterprise-boundary-space] [fixture:
c4/lex-keyword-gap-enterprise-boundary-tab] [fixture:
c4/lex-keyword-gap-node-blank-line] [fixture:
c4/lex-keyword-gap-node-comment-line] [fixture:
c4/lex-keyword-gap-node-directive-line] [fixture:
c4/lex-keyword-gap-node-l-blank-line] [fixture:
c4/lex-keyword-gap-node-l-comment-line] [fixture:
c4/lex-keyword-gap-node-l-directive-line] [fixture:
c4/lex-keyword-gap-node-l-lf] [fixture: c4/lex-keyword-gap-node-l-space]
[fixture: c4/lex-keyword-gap-node-l-tab] [fixture: c4/lex-keyword-gap-node-lf]
[fixture: c4/lex-keyword-gap-node-r-blank-line] [fixture:
c4/lex-keyword-gap-node-r-comment-line] [fixture:
c4/lex-keyword-gap-node-r-directive-line] [fixture:
c4/lex-keyword-gap-node-r-lf] [fixture: c4/lex-keyword-gap-node-r-space]
[fixture: c4/lex-keyword-gap-node-r-tab] [fixture:
c4/lex-keyword-gap-node-space] [fixture: c4/lex-keyword-gap-node-tab] [fixture:
c4/lex-keyword-gap-person-blank-line] [fixture:
c4/lex-keyword-gap-person-comment-line] [fixture:
c4/lex-keyword-gap-person-directive-line] [fixture:
c4/lex-keyword-gap-person-ext-blank-line] [fixture:
c4/lex-keyword-gap-person-ext-comment-line] [fixture:
c4/lex-keyword-gap-person-ext-directive-line] [fixture:
c4/lex-keyword-gap-person-ext-lf] [fixture: c4/lex-keyword-gap-person-ext-space]
[fixture: c4/lex-keyword-gap-person-ext-tab] [fixture:
c4/lex-keyword-gap-person-lf] [fixture: c4/lex-keyword-gap-person-space]
[fixture: c4/lex-keyword-gap-person-tab] [fixture:
c4/lex-keyword-gap-rel-back-blank-line] [fixture:
c4/lex-keyword-gap-rel-back-comment-line] [fixture:
c4/lex-keyword-gap-rel-back-directive-line] [fixture:
c4/lex-keyword-gap-rel-back-lf] [fixture: c4/lex-keyword-gap-rel-back-space]
[fixture: c4/lex-keyword-gap-rel-back-tab] [fixture:
c4/lex-keyword-gap-rel-blank-line] [fixture:
c4/lex-keyword-gap-rel-comment-line] [fixture:
c4/lex-keyword-gap-rel-d-blank-line] [fixture:
c4/lex-keyword-gap-rel-d-comment-line] [fixture:
c4/lex-keyword-gap-rel-d-directive-line] [fixture: c4/lex-keyword-gap-rel-d-lf]
[fixture: c4/lex-keyword-gap-rel-d-space] [fixture:
c4/lex-keyword-gap-rel-d-tab] [fixture: c4/lex-keyword-gap-rel-directive-line]
[fixture: c4/lex-keyword-gap-rel-down-blank-line] [fixture:
c4/lex-keyword-gap-rel-down-comment-line] [fixture:
c4/lex-keyword-gap-rel-down-directive-line] [fixture:
c4/lex-keyword-gap-rel-down-lf] [fixture: c4/lex-keyword-gap-rel-down-space]
[fixture: c4/lex-keyword-gap-rel-down-tab] [fixture:
c4/lex-keyword-gap-rel-l-blank-line] [fixture:
c4/lex-keyword-gap-rel-l-comment-line] [fixture:
c4/lex-keyword-gap-rel-l-directive-line] [fixture: c4/lex-keyword-gap-rel-l-lf]
[fixture: c4/lex-keyword-gap-rel-l-space] [fixture:
c4/lex-keyword-gap-rel-l-tab] [fixture: c4/lex-keyword-gap-rel-left-blank-line]
[fixture: c4/lex-keyword-gap-rel-left-comment-line] [fixture:
c4/lex-keyword-gap-rel-left-directive-line] [fixture:
c4/lex-keyword-gap-rel-left-lf] [fixture: c4/lex-keyword-gap-rel-left-space]
[fixture: c4/lex-keyword-gap-rel-left-tab] [fixture: c4/lex-keyword-gap-rel-lf]
[fixture: c4/lex-keyword-gap-rel-r-blank-line] [fixture:
c4/lex-keyword-gap-rel-r-comment-line] [fixture:
c4/lex-keyword-gap-rel-r-directive-line] [fixture: c4/lex-keyword-gap-rel-r-lf]
[fixture: c4/lex-keyword-gap-rel-r-space] [fixture:
c4/lex-keyword-gap-rel-r-tab] [fixture: c4/lex-keyword-gap-rel-right-blank-line]
[fixture: c4/lex-keyword-gap-rel-right-comment-line] [fixture:
c4/lex-keyword-gap-rel-right-directive-line] [fixture:
c4/lex-keyword-gap-rel-right-lf] [fixture: c4/lex-keyword-gap-rel-right-space]
[fixture: c4/lex-keyword-gap-rel-right-tab] [fixture:
c4/lex-keyword-gap-rel-space] [fixture: c4/lex-keyword-gap-rel-tab] [fixture:
c4/lex-keyword-gap-rel-u-blank-line] [fixture:
c4/lex-keyword-gap-rel-u-comment-line] [fixture:
c4/lex-keyword-gap-rel-u-directive-line] [fixture: c4/lex-keyword-gap-rel-u-lf]
[fixture: c4/lex-keyword-gap-rel-u-space] [fixture:
c4/lex-keyword-gap-rel-u-tab] [fixture: c4/lex-keyword-gap-rel-up-blank-line]
[fixture: c4/lex-keyword-gap-rel-up-comment-line] [fixture:
c4/lex-keyword-gap-rel-up-directive-line] [fixture:
c4/lex-keyword-gap-rel-up-lf] [fixture: c4/lex-keyword-gap-rel-up-space]
[fixture: c4/lex-keyword-gap-rel-up-tab] [fixture:
c4/lex-keyword-gap-relindex-blank-line] [fixture:
c4/lex-keyword-gap-relindex-comment-line] [fixture:
c4/lex-keyword-gap-relindex-directive-line] [fixture:
c4/lex-keyword-gap-relindex-lf] [fixture: c4/lex-keyword-gap-relindex-space]
[fixture: c4/lex-keyword-gap-relindex-tab] [fixture:
c4/lex-keyword-gap-system-blank-line] [fixture:
c4/lex-keyword-gap-system-boundary-blank-line] [fixture:
c4/lex-keyword-gap-system-boundary-comment-line] [fixture:
c4/lex-keyword-gap-system-boundary-directive-line] [fixture:
c4/lex-keyword-gap-system-boundary-lf] [fixture:
c4/lex-keyword-gap-system-boundary-space] [fixture:
c4/lex-keyword-gap-system-boundary-tab] [fixture:
c4/lex-keyword-gap-system-comment-line] [fixture:
c4/lex-keyword-gap-system-directive-line] [fixture:
c4/lex-keyword-gap-system-ext-blank-line] [fixture:
c4/lex-keyword-gap-system-ext-comment-line] [fixture:
c4/lex-keyword-gap-system-ext-directive-line] [fixture:
c4/lex-keyword-gap-system-ext-lf] [fixture: c4/lex-keyword-gap-system-ext-space]
[fixture: c4/lex-keyword-gap-system-ext-tab] [fixture:
c4/lex-keyword-gap-system-lf] [fixture: c4/lex-keyword-gap-system-space]
[fixture: c4/lex-keyword-gap-system-tab] [fixture:
c4/lex-keyword-gap-systemdb-blank-line] [fixture:
c4/lex-keyword-gap-systemdb-comment-line] [fixture:
c4/lex-keyword-gap-systemdb-directive-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-blank-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-comment-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-directive-line] [fixture:
c4/lex-keyword-gap-systemdb-ext-lf] [fixture:
c4/lex-keyword-gap-systemdb-ext-space] [fixture:
c4/lex-keyword-gap-systemdb-ext-tab] [fixture: c4/lex-keyword-gap-systemdb-lf]
[fixture: c4/lex-keyword-gap-systemdb-space] [fixture:
c4/lex-keyword-gap-systemdb-tab] [fixture:
c4/lex-keyword-gap-systemqueue-blank-line] [fixture:
c4/lex-keyword-gap-systemqueue-comment-line] [fixture:
c4/lex-keyword-gap-systemqueue-directive-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-blank-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-comment-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-directive-line] [fixture:
c4/lex-keyword-gap-systemqueue-ext-lf] [fixture:
c4/lex-keyword-gap-systemqueue-ext-space] [fixture:
c4/lex-keyword-gap-systemqueue-ext-tab] [fixture:
c4/lex-keyword-gap-systemqueue-lf] [fixture:
c4/lex-keyword-gap-systemqueue-space] [fixture:
c4/lex-keyword-gap-systemqueue-tab] [fixture:
c4/lex-keyword-gap-updateelementstyle-blank-line] [fixture:
c4/lex-keyword-gap-updateelementstyle-comment-line] [fixture:
c4/lex-keyword-gap-updateelementstyle-directive-line] [fixture:
c4/lex-keyword-gap-updateelementstyle-lf] [fixture:
c4/lex-keyword-gap-updateelementstyle-space] [fixture:
c4/lex-keyword-gap-updateelementstyle-tab] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-blank-line] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-comment-line] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-directive-line] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-lf] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-space] [fixture:
c4/lex-keyword-gap-updatelayoutconfig-tab] [fixture:
c4/lex-keyword-gap-updaterelstyle-blank-line] [fixture:
c4/lex-keyword-gap-updaterelstyle-comment-line] [fixture:
c4/lex-keyword-gap-updaterelstyle-directive-line] [fixture:
c4/lex-keyword-gap-updaterelstyle-lf] [fixture:
c4/lex-keyword-gap-updaterelstyle-space] [fixture:
c4/lex-keyword-gap-updaterelstyle-tab] [fixture: c4/lex-keyword-eof] [fixture:
c4/gram-empty-block-in-keyword-gap]

Call and text keywords require their exact spelling; changed case or a glued
letter, digit, underscore, dash, or non-ASCII suffix is rejected. [fixture:
c4/lex-keyword-accdescr-dash] [fixture: c4/lex-keyword-accdescr-digit] [fixture:
c4/lex-keyword-accdescr-letter] [fixture: c4/lex-keyword-accdescr-lower]
[fixture: c4/lex-keyword-accdescr-non-ascii] [fixture:
c4/lex-keyword-accdescr-underscore] [fixture: c4/lex-keyword-accdescr-upper]
[fixture: c4/lex-keyword-accdescription-dash] [fixture:
c4/lex-keyword-accdescription-digit] [fixture:
c4/lex-keyword-accdescription-letter] [fixture:
c4/lex-keyword-accdescription-lower] [fixture:
c4/lex-keyword-accdescription-non-ascii] [fixture:
c4/lex-keyword-accdescription-underscore] [fixture:
c4/lex-keyword-accdescription-upper] [fixture: c4/lex-keyword-acctitle-dash]
[fixture: c4/lex-keyword-acctitle-digit] [fixture:
c4/lex-keyword-acctitle-letter] [fixture: c4/lex-keyword-acctitle-lower]
[fixture: c4/lex-keyword-acctitle-non-ascii] [fixture:
c4/lex-keyword-acctitle-underscore] [fixture: c4/lex-keyword-acctitle-upper]
[fixture: c4/lex-keyword-birel-dash] [fixture: c4/lex-keyword-birel-digit]
[fixture: c4/lex-keyword-birel-letter] [fixture: c4/lex-keyword-birel-lower]
[fixture: c4/lex-keyword-birel-non-ascii] [fixture:
c4/lex-keyword-birel-underscore] [fixture: c4/lex-keyword-birel-upper] [fixture:
c4/lex-keyword-boundary-dash] [fixture: c4/lex-keyword-boundary-digit] [fixture:
c4/lex-keyword-boundary-letter] [fixture: c4/lex-keyword-boundary-lower]
[fixture: c4/lex-keyword-boundary-non-ascii] [fixture:
c4/lex-keyword-boundary-underscore] [fixture: c4/lex-keyword-boundary-upper]
[fixture: c4/lex-keyword-component-dash] [fixture:
c4/lex-keyword-component-digit] [fixture: c4/lex-keyword-component-ext-dash]
[fixture: c4/lex-keyword-component-ext-digit] [fixture:
c4/lex-keyword-component-ext-letter] [fixture:
c4/lex-keyword-component-ext-lower] [fixture:
c4/lex-keyword-component-ext-non-ascii] [fixture:
c4/lex-keyword-component-ext-underscore] [fixture:
c4/lex-keyword-component-ext-upper] [fixture: c4/lex-keyword-component-letter]
[fixture: c4/lex-keyword-component-lower] [fixture:
c4/lex-keyword-component-non-ascii] [fixture:
c4/lex-keyword-component-underscore] [fixture: c4/lex-keyword-component-upper]
[fixture: c4/lex-keyword-componentdb-dash] [fixture:
c4/lex-keyword-componentdb-digit] [fixture: c4/lex-keyword-componentdb-ext-dash]
[fixture: c4/lex-keyword-componentdb-ext-digit] [fixture:
c4/lex-keyword-componentdb-ext-letter] [fixture:
c4/lex-keyword-componentdb-ext-lower] [fixture:
c4/lex-keyword-componentdb-ext-non-ascii] [fixture:
c4/lex-keyword-componentdb-ext-underscore] [fixture:
c4/lex-keyword-componentdb-ext-upper] [fixture:
c4/lex-keyword-componentdb-letter] [fixture: c4/lex-keyword-componentdb-lower]
[fixture: c4/lex-keyword-componentdb-non-ascii] [fixture:
c4/lex-keyword-componentdb-underscore] [fixture:
c4/lex-keyword-componentdb-upper] [fixture: c4/lex-keyword-componentqueue-dash]
[fixture: c4/lex-keyword-componentqueue-digit] [fixture:
c4/lex-keyword-componentqueue-ext-dash] [fixture:
c4/lex-keyword-componentqueue-ext-digit] [fixture:
c4/lex-keyword-componentqueue-ext-letter] [fixture:
c4/lex-keyword-componentqueue-ext-lower] [fixture:
c4/lex-keyword-componentqueue-ext-non-ascii] [fixture:
c4/lex-keyword-componentqueue-ext-underscore] [fixture:
c4/lex-keyword-componentqueue-ext-upper] [fixture:
c4/lex-keyword-componentqueue-letter] [fixture:
c4/lex-keyword-componentqueue-lower] [fixture:
c4/lex-keyword-componentqueue-non-ascii] [fixture:
c4/lex-keyword-componentqueue-underscore] [fixture:
c4/lex-keyword-componentqueue-upper] [fixture:
c4/lex-keyword-container-boundary-dash] [fixture:
c4/lex-keyword-container-boundary-digit] [fixture:
c4/lex-keyword-container-boundary-letter] [fixture:
c4/lex-keyword-container-boundary-lower] [fixture:
c4/lex-keyword-container-boundary-non-ascii] [fixture:
c4/lex-keyword-container-boundary-underscore] [fixture:
c4/lex-keyword-container-boundary-upper] [fixture:
c4/lex-keyword-container-dash] [fixture: c4/lex-keyword-container-digit]
[fixture: c4/lex-keyword-container-ext-dash] [fixture:
c4/lex-keyword-container-ext-digit] [fixture:
c4/lex-keyword-container-ext-letter] [fixture:
c4/lex-keyword-container-ext-lower] [fixture:
c4/lex-keyword-container-ext-non-ascii] [fixture:
c4/lex-keyword-container-ext-underscore] [fixture:
c4/lex-keyword-container-ext-upper] [fixture: c4/lex-keyword-container-letter]
[fixture: c4/lex-keyword-container-lower] [fixture:
c4/lex-keyword-container-non-ascii] [fixture:
c4/lex-keyword-container-underscore] [fixture: c4/lex-keyword-container-upper]
[fixture: c4/lex-keyword-containerdb-dash] [fixture:
c4/lex-keyword-containerdb-digit] [fixture: c4/lex-keyword-containerdb-ext-dash]
[fixture: c4/lex-keyword-containerdb-ext-digit] [fixture:
c4/lex-keyword-containerdb-ext-letter] [fixture:
c4/lex-keyword-containerdb-ext-lower] [fixture:
c4/lex-keyword-containerdb-ext-non-ascii] [fixture:
c4/lex-keyword-containerdb-ext-underscore] [fixture:
c4/lex-keyword-containerdb-ext-upper] [fixture:
c4/lex-keyword-containerdb-letter] [fixture: c4/lex-keyword-containerdb-lower]
[fixture: c4/lex-keyword-containerdb-non-ascii] [fixture:
c4/lex-keyword-containerdb-underscore] [fixture:
c4/lex-keyword-containerdb-upper] [fixture: c4/lex-keyword-containerqueue-dash]
[fixture: c4/lex-keyword-containerqueue-digit] [fixture:
c4/lex-keyword-containerqueue-ext-dash] [fixture:
c4/lex-keyword-containerqueue-ext-digit] [fixture:
c4/lex-keyword-containerqueue-ext-letter] [fixture:
c4/lex-keyword-containerqueue-ext-lower] [fixture:
c4/lex-keyword-containerqueue-ext-non-ascii] [fixture:
c4/lex-keyword-containerqueue-ext-underscore] [fixture:
c4/lex-keyword-containerqueue-ext-upper] [fixture:
c4/lex-keyword-containerqueue-letter] [fixture:
c4/lex-keyword-containerqueue-lower] [fixture:
c4/lex-keyword-containerqueue-non-ascii] [fixture:
c4/lex-keyword-containerqueue-underscore] [fixture:
c4/lex-keyword-containerqueue-upper] [fixture:
c4/lex-keyword-deployment-node-dash] [fixture:
c4/lex-keyword-deployment-node-digit] [fixture:
c4/lex-keyword-deployment-node-letter] [fixture:
c4/lex-keyword-deployment-node-lower] [fixture:
c4/lex-keyword-deployment-node-non-ascii] [fixture:
c4/lex-keyword-deployment-node-underscore] [fixture:
c4/lex-keyword-deployment-node-upper] [fixture:
c4/lex-keyword-enterprise-boundary-dash] [fixture:
c4/lex-keyword-enterprise-boundary-digit] [fixture:
c4/lex-keyword-enterprise-boundary-letter] [fixture:
c4/lex-keyword-enterprise-boundary-lower] [fixture:
c4/lex-keyword-enterprise-boundary-non-ascii] [fixture:
c4/lex-keyword-enterprise-boundary-underscore] [fixture:
c4/lex-keyword-enterprise-boundary-upper] [fixture: c4/lex-keyword-node-dash]
[fixture: c4/lex-keyword-node-digit] [fixture: c4/lex-keyword-node-l-dash]
[fixture: c4/lex-keyword-node-l-digit] [fixture: c4/lex-keyword-node-l-letter]
[fixture: c4/lex-keyword-node-l-lower] [fixture:
c4/lex-keyword-node-l-non-ascii] [fixture: c4/lex-keyword-node-l-underscore]
[fixture: c4/lex-keyword-node-l-upper] [fixture: c4/lex-keyword-node-letter]
[fixture: c4/lex-keyword-node-lower] [fixture: c4/lex-keyword-node-non-ascii]
[fixture: c4/lex-keyword-node-r-dash] [fixture: c4/lex-keyword-node-r-digit]
[fixture: c4/lex-keyword-node-r-letter] [fixture: c4/lex-keyword-node-r-lower]
[fixture: c4/lex-keyword-node-r-non-ascii] [fixture:
c4/lex-keyword-node-r-underscore] [fixture: c4/lex-keyword-node-r-upper]
[fixture: c4/lex-keyword-node-underscore] [fixture: c4/lex-keyword-node-upper]
[fixture: c4/lex-keyword-person-dash] [fixture: c4/lex-keyword-person-digit]
[fixture: c4/lex-keyword-person-ext-dash] [fixture:
c4/lex-keyword-person-ext-digit] [fixture: c4/lex-keyword-person-ext-letter]
[fixture: c4/lex-keyword-person-ext-lower] [fixture:
c4/lex-keyword-person-ext-non-ascii] [fixture:
c4/lex-keyword-person-ext-underscore] [fixture: c4/lex-keyword-person-ext-upper]
[fixture: c4/lex-keyword-person-letter] [fixture: c4/lex-keyword-person-lower]
[fixture: c4/lex-keyword-person-non-ascii] [fixture:
c4/lex-keyword-person-underscore] [fixture: c4/lex-keyword-person-upper]
[fixture: c4/lex-keyword-rel-back-dash] [fixture: c4/lex-keyword-rel-back-digit]
[fixture: c4/lex-keyword-rel-back-letter] [fixture:
c4/lex-keyword-rel-back-lower] [fixture: c4/lex-keyword-rel-back-non-ascii]
[fixture: c4/lex-keyword-rel-back-underscore] [fixture:
c4/lex-keyword-rel-back-upper] [fixture: c4/lex-keyword-rel-d-dash] [fixture:
c4/lex-keyword-rel-d-digit] [fixture: c4/lex-keyword-rel-d-letter] [fixture:
c4/lex-keyword-rel-d-lower] [fixture: c4/lex-keyword-rel-d-non-ascii] [fixture:
c4/lex-keyword-rel-d-underscore] [fixture: c4/lex-keyword-rel-d-upper] [fixture:
c4/lex-keyword-rel-dash] [fixture: c4/lex-keyword-rel-digit] [fixture:
c4/lex-keyword-rel-down-dash] [fixture: c4/lex-keyword-rel-down-digit] [fixture:
c4/lex-keyword-rel-down-letter] [fixture: c4/lex-keyword-rel-down-lower]
[fixture: c4/lex-keyword-rel-down-non-ascii] [fixture:
c4/lex-keyword-rel-down-underscore] [fixture: c4/lex-keyword-rel-down-upper]
[fixture: c4/lex-keyword-rel-l-dash] [fixture: c4/lex-keyword-rel-l-digit]
[fixture: c4/lex-keyword-rel-l-letter] [fixture: c4/lex-keyword-rel-l-lower]
[fixture: c4/lex-keyword-rel-l-non-ascii] [fixture:
c4/lex-keyword-rel-l-underscore] [fixture: c4/lex-keyword-rel-l-upper] [fixture:
c4/lex-keyword-rel-left-dash] [fixture: c4/lex-keyword-rel-left-digit] [fixture:
c4/lex-keyword-rel-left-letter] [fixture: c4/lex-keyword-rel-left-lower]
[fixture: c4/lex-keyword-rel-left-non-ascii] [fixture:
c4/lex-keyword-rel-left-underscore] [fixture: c4/lex-keyword-rel-left-upper]
[fixture: c4/lex-keyword-rel-letter] [fixture: c4/lex-keyword-rel-lower]
[fixture: c4/lex-keyword-rel-non-ascii] [fixture: c4/lex-keyword-rel-r-dash]
[fixture: c4/lex-keyword-rel-r-digit] [fixture: c4/lex-keyword-rel-r-letter]
[fixture: c4/lex-keyword-rel-r-lower] [fixture: c4/lex-keyword-rel-r-non-ascii]
[fixture: c4/lex-keyword-rel-r-underscore] [fixture: c4/lex-keyword-rel-r-upper]
[fixture: c4/lex-keyword-rel-right-dash] [fixture:
c4/lex-keyword-rel-right-digit] [fixture: c4/lex-keyword-rel-right-letter]
[fixture: c4/lex-keyword-rel-right-lower] [fixture:
c4/lex-keyword-rel-right-non-ascii] [fixture:
c4/lex-keyword-rel-right-underscore] [fixture: c4/lex-keyword-rel-right-upper]
[fixture: c4/lex-keyword-rel-u-dash] [fixture: c4/lex-keyword-rel-u-digit]
[fixture: c4/lex-keyword-rel-u-letter] [fixture: c4/lex-keyword-rel-u-lower]
[fixture: c4/lex-keyword-rel-u-non-ascii] [fixture:
c4/lex-keyword-rel-u-underscore] [fixture: c4/lex-keyword-rel-u-upper] [fixture:
c4/lex-keyword-rel-underscore] [fixture: c4/lex-keyword-rel-up-dash] [fixture:
c4/lex-keyword-rel-up-digit] [fixture: c4/lex-keyword-rel-up-letter] [fixture:
c4/lex-keyword-rel-up-lower] [fixture: c4/lex-keyword-rel-up-non-ascii]
[fixture: c4/lex-keyword-rel-up-underscore] [fixture:
c4/lex-keyword-rel-up-upper] [fixture: c4/lex-keyword-rel-upper] [fixture:
c4/lex-keyword-relindex-dash] [fixture: c4/lex-keyword-relindex-digit] [fixture:
c4/lex-keyword-relindex-letter] [fixture: c4/lex-keyword-relindex-lower]
[fixture: c4/lex-keyword-relindex-non-ascii] [fixture:
c4/lex-keyword-relindex-underscore] [fixture: c4/lex-keyword-relindex-upper]
[fixture: c4/lex-keyword-system-boundary-dash] [fixture:
c4/lex-keyword-system-boundary-digit] [fixture:
c4/lex-keyword-system-boundary-letter] [fixture:
c4/lex-keyword-system-boundary-lower] [fixture:
c4/lex-keyword-system-boundary-non-ascii] [fixture:
c4/lex-keyword-system-boundary-underscore] [fixture:
c4/lex-keyword-system-boundary-upper] [fixture: c4/lex-keyword-system-dash]
[fixture: c4/lex-keyword-system-digit] [fixture: c4/lex-keyword-system-ext-dash]
[fixture: c4/lex-keyword-system-ext-digit] [fixture:
c4/lex-keyword-system-ext-letter] [fixture: c4/lex-keyword-system-ext-lower]
[fixture: c4/lex-keyword-system-ext-non-ascii] [fixture:
c4/lex-keyword-system-ext-underscore] [fixture: c4/lex-keyword-system-ext-upper]
[fixture: c4/lex-keyword-system-letter] [fixture: c4/lex-keyword-system-lower]
[fixture: c4/lex-keyword-system-non-ascii] [fixture:
c4/lex-keyword-system-underscore] [fixture: c4/lex-keyword-system-upper]
[fixture: c4/lex-keyword-systemdb-dash] [fixture: c4/lex-keyword-systemdb-digit]
[fixture: c4/lex-keyword-systemdb-ext-dash] [fixture:
c4/lex-keyword-systemdb-ext-digit] [fixture: c4/lex-keyword-systemdb-ext-letter]
[fixture: c4/lex-keyword-systemdb-ext-lower] [fixture:
c4/lex-keyword-systemdb-ext-non-ascii] [fixture:
c4/lex-keyword-systemdb-ext-underscore] [fixture:
c4/lex-keyword-systemdb-ext-upper] [fixture: c4/lex-keyword-systemdb-letter]
[fixture: c4/lex-keyword-systemdb-lower] [fixture:
c4/lex-keyword-systemdb-non-ascii] [fixture: c4/lex-keyword-systemdb-underscore]
[fixture: c4/lex-keyword-systemdb-upper] [fixture:
c4/lex-keyword-systemqueue-dash] [fixture: c4/lex-keyword-systemqueue-digit]
[fixture: c4/lex-keyword-systemqueue-ext-dash] [fixture:
c4/lex-keyword-systemqueue-ext-digit] [fixture:
c4/lex-keyword-systemqueue-ext-letter] [fixture:
c4/lex-keyword-systemqueue-ext-lower] [fixture:
c4/lex-keyword-systemqueue-ext-non-ascii] [fixture:
c4/lex-keyword-systemqueue-ext-underscore] [fixture:
c4/lex-keyword-systemqueue-ext-upper] [fixture:
c4/lex-keyword-systemqueue-letter] [fixture: c4/lex-keyword-systemqueue-lower]
[fixture: c4/lex-keyword-systemqueue-non-ascii] [fixture:
c4/lex-keyword-systemqueue-underscore] [fixture:
c4/lex-keyword-systemqueue-upper] [fixture: c4/lex-keyword-title-dash] [fixture:
c4/lex-keyword-title-digit] [fixture: c4/lex-keyword-title-letter] [fixture:
c4/lex-keyword-title-non-ascii] [fixture: c4/lex-keyword-title-underscore]
[fixture: c4/lex-keyword-title-upper] [fixture:
c4/lex-keyword-updateelementstyle-dash] [fixture:
c4/lex-keyword-updateelementstyle-digit] [fixture:
c4/lex-keyword-updateelementstyle-letter] [fixture:
c4/lex-keyword-updateelementstyle-lower] [fixture:
c4/lex-keyword-updateelementstyle-non-ascii] [fixture:
c4/lex-keyword-updateelementstyle-underscore] [fixture:
c4/lex-keyword-updateelementstyle-upper] [fixture:
c4/lex-keyword-updatelayoutconfig-dash] [fixture:
c4/lex-keyword-updatelayoutconfig-digit] [fixture:
c4/lex-keyword-updatelayoutconfig-letter] [fixture:
c4/lex-keyword-updatelayoutconfig-lower] [fixture:
c4/lex-keyword-updatelayoutconfig-non-ascii] [fixture:
c4/lex-keyword-updatelayoutconfig-underscore] [fixture:
c4/lex-keyword-updatelayoutconfig-upper] [fixture:
c4/lex-keyword-updaterelstyle-dash] [fixture:
c4/lex-keyword-updaterelstyle-digit] [fixture:
c4/lex-keyword-updaterelstyle-letter] [fixture:
c4/lex-keyword-updaterelstyle-lower] [fixture:
c4/lex-keyword-updaterelstyle-non-ascii] [fixture:
c4/lex-keyword-updaterelstyle-underscore] [fixture:
c4/lex-keyword-updaterelstyle-upper]

An unmatched closing brace, another call or word immediately after a complete
call, or a semicolon after a complete statement is rejected. [fixture:
c4/lex-after-boundary-call] [fixture: c4/lex-after-boundary-double-close]
[fixture: c4/lex-after-boundary-double-semicolon] [fixture:
c4/lex-after-boundary-semicolon] [fixture:
c4/lex-after-boundary-semicolon-spaced] [fixture: c4/lex-after-boundary-word]
[fixture: c4/lex-after-component-call] [fixture:
c4/lex-after-component-double-close] [fixture:
c4/lex-after-component-double-semicolon] [fixture:
c4/lex-after-component-semicolon] [fixture:
c4/lex-after-component-semicolon-spaced] [fixture: c4/lex-after-component-word]
[fixture: c4/lex-after-container-call] [fixture:
c4/lex-after-container-double-close] [fixture:
c4/lex-after-container-double-semicolon] [fixture:
c4/lex-after-container-semicolon] [fixture:
c4/lex-after-container-semicolon-spaced] [fixture: c4/lex-after-container-word]
[fixture: c4/lex-after-element-style-call] [fixture:
c4/lex-after-element-style-double-close] [fixture:
c4/lex-after-element-style-double-semicolon] [fixture:
c4/lex-after-element-style-semicolon] [fixture:
c4/lex-after-element-style-semicolon-spaced] [fixture:
c4/lex-after-element-style-word] [fixture: c4/lex-after-index-call] [fixture:
c4/lex-after-index-double-close] [fixture: c4/lex-after-index-double-semicolon]
[fixture: c4/lex-after-index-semicolon] [fixture:
c4/lex-after-index-semicolon-spaced] [fixture: c4/lex-after-index-word]
[fixture: c4/lex-after-layout-call] [fixture: c4/lex-after-layout-double-close]
[fixture: c4/lex-after-layout-double-semicolon] [fixture:
c4/lex-after-layout-semicolon] [fixture: c4/lex-after-layout-semicolon-spaced]
[fixture: c4/lex-after-layout-word] [fixture: c4/lex-after-node-call] [fixture:
c4/lex-after-node-double-close] [fixture: c4/lex-after-node-double-semicolon]
[fixture: c4/lex-after-node-semicolon] [fixture:
c4/lex-after-node-semicolon-spaced] [fixture: c4/lex-after-node-word] [fixture:
c4/lex-after-person-call] [fixture: c4/lex-after-person-double-close] [fixture:
c4/lex-after-person-double-semicolon] [fixture: c4/lex-after-person-semicolon]
[fixture: c4/lex-after-person-semicolon-spaced] [fixture:
c4/lex-after-person-word] [fixture: c4/lex-after-rel-call] [fixture:
c4/lex-after-rel-double-close] [fixture: c4/lex-after-rel-double-semicolon]
[fixture: c4/lex-after-rel-semicolon] [fixture:
c4/lex-after-rel-semicolon-spaced] [fixture: c4/lex-after-rel-style-call]
[fixture: c4/lex-after-rel-style-double-close] [fixture:
c4/lex-after-rel-style-double-semicolon] [fixture:
c4/lex-after-rel-style-semicolon] [fixture:
c4/lex-after-rel-style-semicolon-spaced] [fixture: c4/lex-after-rel-style-word]
[fixture: c4/lex-after-rel-word] [fixture: c4/gram-unmatched-right-brace]
[fixture: c4/gram-unmatched-right-brace-after-person] [fixture:
c4/gram-two-statements-on-line] [fixture: c4/gram-title-adjacent-person]
[fixture: c4/gram-boundary-close-person-same-line]

A closed directive or a percent-pair comment after the final call or boundary
does not change its Db, and an unclosed percent-brace suffix can be removed
through end of input. [fixture: c4/lex-after-boundary-comment] [fixture:
c4/lex-after-boundary-comment-glued] [fixture: c4/lex-after-boundary-directive]
[fixture: c4/lex-after-boundary-directive-unclosed] [fixture:
c4/lex-after-boundary-directive-word-unclosed] [fixture:
c4/lex-after-component-comment] [fixture: c4/lex-after-component-comment-glued]
[fixture: c4/lex-after-component-directive] [fixture:
c4/lex-after-component-directive-unclosed] [fixture:
c4/lex-after-component-directive-word-unclosed] [fixture:
c4/lex-after-container-comment] [fixture: c4/lex-after-container-comment-glued]
[fixture: c4/lex-after-container-directive] [fixture:
c4/lex-after-container-directive-unclosed] [fixture:
c4/lex-after-container-directive-word-unclosed] [fixture:
c4/lex-after-element-style-comment] [fixture:
c4/lex-after-element-style-comment-glued] [fixture:
c4/lex-after-element-style-directive] [fixture:
c4/lex-after-element-style-directive-unclosed] [fixture:
c4/lex-after-element-style-directive-word-unclosed] [fixture:
c4/lex-after-index-comment] [fixture: c4/lex-after-index-comment-glued]
[fixture: c4/lex-after-index-directive] [fixture:
c4/lex-after-index-directive-unclosed] [fixture:
c4/lex-after-index-directive-word-unclosed] [fixture:
c4/lex-after-layout-comment] [fixture: c4/lex-after-layout-comment-glued]
[fixture: c4/lex-after-layout-directive] [fixture:
c4/lex-after-layout-directive-unclosed] [fixture:
c4/lex-after-layout-directive-word-unclosed] [fixture:
c4/lex-after-node-comment] [fixture: c4/lex-after-node-comment-glued] [fixture:
c4/lex-after-node-directive] [fixture: c4/lex-after-node-directive-unclosed]
[fixture: c4/lex-after-node-directive-word-unclosed] [fixture:
c4/lex-after-person-comment] [fixture: c4/lex-after-person-comment-glued]
[fixture: c4/lex-after-person-directive] [fixture:
c4/lex-after-person-directive-unclosed] [fixture:
c4/lex-after-person-directive-word-unclosed] [fixture: c4/lex-after-rel-comment]
[fixture: c4/lex-after-rel-comment-glued] [fixture: c4/lex-after-rel-directive]
[fixture: c4/lex-after-rel-directive-unclosed] [fixture:
c4/lex-after-rel-directive-word-unclosed] [fixture:
c4/lex-after-rel-style-comment] [fixture: c4/lex-after-rel-style-comment-glued]
[fixture: c4/lex-after-rel-style-directive] [fixture:
c4/lex-after-rel-style-directive-unclosed] [fixture:
c4/lex-after-rel-style-directive-word-unclosed] [fixture:
c4/db-unclosed-directive-at-end] [fixture:
c4/lex-comment-unclosed-percent-brace]

A nonempty word or punctuation fragment between the header and its required line
break is rejected. [fixture: c4/gram-grid-ampersand-entity-header-line]
[fixture: c4/gram-grid-arrow-header-line] [fixture:
c4/gram-grid-arrow-spaced-header-line] [fixture:
c4/gram-grid-backslash-header-line] [fixture: c4/gram-grid-backtick-header-line]
[fixture: c4/gram-grid-bom-header-line] [fixture:
c4/gram-grid-classdef-rule-header-line] [fixture:
c4/gram-grid-close-brace-header-line] [fixture:
c4/gram-grid-close-round-header-line] [fixture:
c4/gram-grid-close-square-header-line] [fixture: c4/gram-grid-colon-header-line]
[fixture: c4/gram-grid-comma-header-line] [fixture:
c4/gram-grid-comment-header-line] [fixture:
c4/gram-grid-comment-line-header-line] [fixture:
c4/gram-grid-constructor-header-line] [fixture: c4/gram-grid-cr-header-line]
[fixture: c4/gram-grid-crlf-header-line] [fixture:
c4/gram-grid-dash-header-line] [fixture: c4/gram-grid-digits-header-line]
[fixture: c4/gram-grid-directive-header-line] [fixture:
c4/gram-grid-directive-line-header-line] [fixture:
c4/gram-grid-emoji-header-line] [fixture: c4/gram-grid-entity-header-line]
[fixture: c4/gram-grid-entity-named-header-line] [fixture:
c4/gram-grid-equals-header-line] [fixture: c4/gram-grid-ff-header-line]
[fixture: c4/gram-grid-greater-than-header-line] [fixture:
c4/gram-grid-hash-header-line] [fixture: c4/gram-grid-html-header-line]
[fixture: c4/gram-grid-html-attribute-header-line] [fixture:
c4/gram-grid-html-br-header-line] [fixture:
c4/gram-grid-ideographic-header-line] [fixture:
c4/gram-grid-keyword-header-line] [fixture:
c4/gram-grid-keyword-block-header-line] [fixture:
c4/gram-grid-keyword-class-header-line] [fixture:
c4/gram-grid-keyword-classdef-header-line] [fixture:
c4/gram-grid-keyword-columns-header-line] [fixture:
c4/gram-grid-keyword-end-header-line] [fixture:
c4/gram-grid-keyword-header-header-line] [fixture:
c4/gram-grid-keyword-space-header-line] [fixture:
c4/gram-grid-keyword-style-header-line] [fixture:
c4/gram-grid-less-than-header-line] [fixture: c4/gram-grid-lf-header-line]
[fixture: c4/gram-grid-ls-header-line] [fixture: c4/gram-grid-nbsp-header-line]
[fixture: c4/gram-grid-nel-header-line] [fixture:
c4/gram-grid-nonascii-header-line] [fixture:
c4/gram-grid-open-brace-header-line] [fixture:
c4/gram-grid-open-round-header-line] [fixture:
c4/gram-grid-open-square-header-line] [fixture:
c4/gram-grid-percent-header-line] [fixture: c4/gram-grid-pipe-header-line]
[fixture: c4/gram-grid-proto-header-line] [fixture: c4/gram-grid-ps-header-line]
[fixture: c4/gram-grid-punct-header-line] [fixture:
c4/gram-grid-quote-header-line] [fixture: c4/gram-grid-root-header-line]
[fixture: c4/gram-grid-semicolon-header-line] [fixture:
c4/gram-grid-single-quote-header-line] [fixture:
c4/gram-grid-spaces-header-line] [fixture: c4/gram-grid-style-rule-header-line]
[fixture: c4/gram-grid-tab-header-line] [fixture: c4/gram-grid-vt-header-line]

A direction token in the statement list is rejected even when its line also
contains words, punctuation, whitespace, quotes, entities, or directives.
[fixture: c4/gram-grid-ampersand-entity-direction-line] [fixture:
c4/gram-grid-arrow-direction-line] [fixture:
c4/gram-grid-arrow-spaced-direction-line] [fixture:
c4/gram-grid-backslash-direction-line] [fixture:
c4/gram-grid-backtick-direction-line] [fixture: c4/gram-grid-bom-direction-line]
[fixture: c4/gram-grid-classdef-rule-direction-line] [fixture:
c4/gram-grid-close-brace-direction-line] [fixture:
c4/gram-grid-close-round-direction-line] [fixture:
c4/gram-grid-close-square-direction-line] [fixture:
c4/gram-grid-colon-direction-line] [fixture: c4/gram-grid-comma-direction-line]
[fixture: c4/gram-grid-comment-direction-line] [fixture:
c4/gram-grid-comment-line-direction-line] [fixture:
c4/gram-grid-constructor-direction-line] [fixture:
c4/gram-grid-cr-direction-line] [fixture: c4/gram-grid-crlf-direction-line]
[fixture: c4/gram-grid-dash-direction-line] [fixture:
c4/gram-grid-digits-direction-line] [fixture:
c4/gram-grid-directive-direction-line] [fixture:
c4/gram-grid-directive-line-direction-line] [fixture:
c4/gram-grid-emoji-direction-line] [fixture: c4/gram-grid-empty-direction-line]
[fixture: c4/gram-grid-entity-direction-line] [fixture:
c4/gram-grid-entity-named-direction-line] [fixture:
c4/gram-grid-equals-direction-line] [fixture: c4/gram-grid-ff-direction-line]
[fixture: c4/gram-grid-greater-than-direction-line] [fixture:
c4/gram-grid-hash-direction-line] [fixture: c4/gram-grid-html-direction-line]
[fixture: c4/gram-grid-html-attribute-direction-line] [fixture:
c4/gram-grid-html-br-direction-line] [fixture:
c4/gram-grid-ideographic-direction-line] [fixture:
c4/gram-grid-keyword-direction-line] [fixture:
c4/gram-grid-keyword-block-direction-line] [fixture:
c4/gram-grid-keyword-class-direction-line] [fixture:
c4/gram-grid-keyword-classdef-direction-line] [fixture:
c4/gram-grid-keyword-columns-direction-line] [fixture:
c4/gram-grid-keyword-end-direction-line] [fixture:
c4/gram-grid-keyword-header-direction-line] [fixture:
c4/gram-grid-keyword-space-direction-line] [fixture:
c4/gram-grid-keyword-style-direction-line] [fixture:
c4/gram-grid-less-than-direction-line] [fixture: c4/gram-grid-lf-direction-line]
[fixture: c4/gram-grid-ls-direction-line] [fixture:
c4/gram-grid-nbsp-direction-line] [fixture: c4/gram-grid-nel-direction-line]
[fixture: c4/gram-grid-nonascii-direction-line] [fixture:
c4/gram-grid-open-brace-direction-line] [fixture:
c4/gram-grid-open-round-direction-line] [fixture:
c4/gram-grid-open-square-direction-line] [fixture:
c4/gram-grid-percent-direction-line] [fixture: c4/gram-grid-pipe-direction-line]
[fixture: c4/gram-grid-proto-direction-line] [fixture:
c4/gram-grid-ps-direction-line] [fixture: c4/gram-grid-punct-direction-line]
[fixture: c4/gram-grid-quote-direction-line] [fixture:
c4/gram-grid-root-direction-line] [fixture:
c4/gram-grid-semicolon-direction-line] [fixture:
c4/gram-grid-single-quote-direction-line] [fixture:
c4/gram-grid-spaces-direction-line] [fixture:
c4/gram-grid-style-rule-direction-line] [fixture:
c4/gram-grid-tab-direction-line] [fixture: c4/gram-grid-vt-direction-line]

Header spelling is case sensitive; lowercase, uppercase, or mixed-case spellings
and glued word, digit, underscore, dash, or non-ASCII suffixes are rejected.
[fixture: c4/header-component-dash-suffix] [fixture:
c4/header-component-digit-suffix] [fixture:
c4/header-component-glued-keyword-suffix] [fixture: c4/header-component-lower]
[fixture: c4/header-component-mixed] [fixture:
c4/header-component-non-ascii-suffix] [fixture:
c4/header-component-underscore-suffix] [fixture: c4/header-component-upper]
[fixture: c4/header-component-word-suffix] [fixture:
c4/header-container-dash-suffix] [fixture: c4/header-container-digit-suffix]
[fixture: c4/header-container-glued-keyword-suffix] [fixture:
c4/header-container-lower] [fixture: c4/header-container-mixed] [fixture:
c4/header-container-non-ascii-suffix] [fixture:
c4/header-container-underscore-suffix] [fixture: c4/header-container-upper]
[fixture: c4/header-container-word-suffix] [fixture:
c4/header-context-dash-suffix] [fixture: c4/header-context-digit-suffix]
[fixture: c4/header-context-glued-keyword-suffix] [fixture:
c4/header-context-lower] [fixture: c4/header-context-mixed] [fixture:
c4/header-context-non-ascii-suffix] [fixture:
c4/header-context-underscore-suffix] [fixture: c4/header-context-upper]
[fixture: c4/header-context-word-suffix] [fixture:
c4/header-deployment-dash-suffix] [fixture: c4/header-deployment-digit-suffix]
[fixture: c4/header-deployment-glued-keyword-suffix] [fixture:
c4/header-deployment-lower] [fixture: c4/header-deployment-mixed] [fixture:
c4/header-deployment-non-ascii-suffix] [fixture:
c4/header-deployment-underscore-suffix] [fixture: c4/header-deployment-upper]
[fixture: c4/header-deployment-word-suffix] [fixture:
c4/header-dynamic-dash-suffix] [fixture: c4/header-dynamic-digit-suffix]
[fixture: c4/header-dynamic-glued-keyword-suffix] [fixture:
c4/header-dynamic-lower] [fixture: c4/header-dynamic-mixed] [fixture:
c4/header-dynamic-non-ascii-suffix] [fixture:
c4/header-dynamic-underscore-suffix] [fixture: c4/header-dynamic-upper]
[fixture: c4/header-dynamic-word-suffix]

Blank lines, whitespace-only lines, comment lines, directive lines and valid
frontmatter before the header leave the diagram and its C4 type unchanged.
[fixture: c4/header-after-bare-percent-line] [fixture:
c4/header-after-blank-lines] [fixture: c4/header-after-comment-line] [fixture:
c4/header-after-directive-line] [fixture: c4/header-after-empty-braces-line]
[fixture: c4/header-after-frontmatter-and-comment] [fixture:
c4/header-after-whitespace-line]

A leading hash line, semicolon line or single-percent line is not a C4 comment
and rejects the input. [fixture: c4/header-after-hash-line] [fixture:
c4/header-after-semicolon-line] [fixture: c4/lex-comment-hash] [fixture:
c4/lex-comment-single-percent]

Invalid frontmatter YAML rejects the input before any C4 summary is made.
[fixture: c4/div-frontmatter-invalid-yaml]

A bare percent-pair line before the header is accepted when followed by the
header or an empty line, but a following line containing spaces can leave it
unremoved and reject the input. [fixture: c4/header-after-bare-percent-line]
[fixture: c4/header-leading-percent-before-different-header] [fixture:
c4/header-leading-percent-blank] [fixture: c4/div-leading-percent-space-blank]

Tabs, form feeds, vertical tabs, NBSP, U+3000, U+FEFF, U+2028 and U+2029 around
statements or on whitespace-only lines are ignored, while CR and CRLF can
separate statements. [fixture: c4/lex-bom-after-header] [fixture:
c4/lex-bom-before-header] [fixture: c4/lex-bom-line-end] [fixture:
c4/lex-bom-line-start] [fixture: c4/lex-bom-text-end] [fixture:
c4/lex-bom-whitespace-between] [fixture: c4/lex-bom-whitespace-first] [fixture:
c4/lex-bom-whitespace-last] [fixture: c4/lex-cr-after-header] [fixture:
c4/lex-cr-before-header] [fixture: c4/lex-cr-between-statements] [fixture:
c4/lex-cr-line-end] [fixture: c4/lex-cr-line-start] [fixture:
c4/lex-cr-text-end] [fixture: c4/lex-cr-whitespace-between] [fixture:
c4/lex-cr-whitespace-first] [fixture: c4/lex-cr-whitespace-last] [fixture:
c4/lex-crlf-after-header] [fixture: c4/lex-crlf-before-header] [fixture:
c4/lex-crlf-line-end] [fixture: c4/lex-crlf-text-end] [fixture:
c4/lex-crlf-whitespace-between] [fixture: c4/lex-crlf-whitespace-first]
[fixture: c4/lex-crlf-whitespace-last] [fixture: c4/lex-ff-after-header]
[fixture: c4/lex-ff-before-header] [fixture: c4/lex-ff-line-end] [fixture:
c4/lex-ff-line-start] [fixture: c4/lex-ff-text-end] [fixture:
c4/lex-ff-whitespace-between] [fixture: c4/lex-ff-whitespace-first] [fixture:
c4/lex-ff-whitespace-last] [fixture: c4/lex-ideographic-after-header] [fixture:
c4/lex-ideographic-before-header] [fixture: c4/lex-ideographic-line-end]
[fixture: c4/lex-ideographic-line-start] [fixture: c4/lex-ideographic-text-end]
[fixture: c4/lex-ideographic-whitespace-between] [fixture:
c4/lex-ideographic-whitespace-first] [fixture:
c4/lex-ideographic-whitespace-last] [fixture: c4/lex-ls-after-header] [fixture:
c4/lex-ls-before-header] [fixture: c4/lex-ls-line-end] [fixture:
c4/lex-ls-line-start] [fixture: c4/lex-ls-text-end] [fixture:
c4/lex-ls-whitespace-between] [fixture: c4/lex-ls-whitespace-first] [fixture:
c4/lex-ls-whitespace-last] [fixture: c4/lex-nbsp-after-header] [fixture:
c4/lex-nbsp-before-header] [fixture: c4/lex-nbsp-line-end] [fixture:
c4/lex-nbsp-line-start] [fixture: c4/lex-nbsp-text-end] [fixture:
c4/lex-nbsp-whitespace-between] [fixture: c4/lex-nbsp-whitespace-first]
[fixture: c4/lex-nbsp-whitespace-last] [fixture: c4/lex-ps-after-header]
[fixture: c4/lex-ps-before-header] [fixture: c4/lex-ps-line-end] [fixture:
c4/lex-ps-line-start] [fixture: c4/lex-ps-text-end] [fixture:
c4/lex-ps-whitespace-between] [fixture: c4/lex-ps-whitespace-first] [fixture:
c4/lex-ps-whitespace-last] [fixture: c4/lex-tab-after-header] [fixture:
c4/lex-tab-before-header] [fixture: c4/lex-tab-line-end] [fixture:
c4/lex-tab-line-start] [fixture: c4/lex-tab-text-end] [fixture:
c4/lex-tab-whitespace-between] [fixture: c4/lex-tab-whitespace-first] [fixture:
c4/lex-tab-whitespace-last] [fixture: c4/lex-vt-after-header] [fixture:
c4/lex-vt-before-header] [fixture: c4/lex-vt-line-end] [fixture:
c4/lex-vt-line-start] [fixture: c4/lex-vt-text-end] [fixture:
c4/lex-vt-whitespace-between] [fixture: c4/lex-vt-whitespace-first] [fixture:
c4/lex-vt-whitespace-last]

A tab, form feed, vertical tab, NBSP, U+3000, U+FEFF, U+2028 or U+2029 alone
does not separate two diagram statements. [fixture:
c4/lex-bom-between-statements] [fixture: c4/lex-ff-between-statements] [fixture:
c4/lex-ideographic-between-statements] [fixture: c4/lex-ls-between-statements]
[fixture: c4/lex-nbsp-between-statements] [fixture:
c4/lex-ps-between-statements] [fixture: c4/lex-tab-between-statements] [fixture:
c4/lex-vt-between-statements]

U+0085 outside a text argument is not whitespace and rejects the input,
including before the header or on an otherwise empty line. [fixture:
c4/lex-nel-after-header] [fixture: c4/lex-nel-before-header] [fixture:
c4/lex-nel-between-statements] [fixture: c4/lex-nel-line-end] [fixture:
c4/lex-nel-line-start] [fixture: c4/lex-nel-text-end] [fixture:
c4/lex-nel-whitespace-between] [fixture: c4/lex-nel-whitespace-first] [fixture:
c4/lex-nel-whitespace-last]

An inline percent-pair comment after a header or diagram statement consumes its
line break, so a following statement or boundary opening can be rejected even
with an empty line between them. [fixture: c4/header-component-comment-glued]
[fixture: c4/header-component-comment-on-header-line] [fixture:
c4/header-container-comment-glued] [fixture:
c4/header-container-comment-on-header-line] [fixture:
c4/header-context-comment-glued] [fixture:
c4/header-context-comment-on-header-line] [fixture:
c4/header-deployment-comment-glued] [fixture:
c4/header-deployment-comment-on-header-line] [fixture:
c4/header-dynamic-comment-glued] [fixture:
c4/header-dynamic-comment-on-header-line] [fixture:
c4/header-header-comment-eof] [fixture: c4/div-header-comment-blank-recovery]
[fixture: c4/div-comment-between-joined-statements] [fixture:
c4/div-comment-between-blank-recovery] [fixture:
c4/div-boundary-comment-before-inline-body] [fixture:
c4/div-boundary-comment-before-next-statement] [fixture:
c4/div-diagram-comment-u2028] [fixture: c4/div-diagram-comment-u2029]

A whitespace-only line after an inline comment can supply the missing line break
and restore the following statement. [fixture:
c4/header-header-comment-spaces-recovery] [fixture:
c4/lex-comment-between-spaces-recovery]

A boundary closing brace may follow a child directly, or after a comment that
consumed the intervening line break. [fixture:
c4/gram-boundary-close-without-newline] [fixture: c4/lex-comment-before-close]

On an ordinary statement line, lowercase `direction` followed by whitespace and
`TB`, `BT`, `RL` or `LR` takes precedence over a title, element, boundary,
description opening or inline comment, including inside longer words and with
trailing text. [fixture: c4/gram-direction-bt-inside-label] [fixture:
c4/gram-direction-bt-line] [fixture: c4/gram-direction-bt-prefix] [fixture:
c4/gram-direction-comment] [fixture:
c4/gram-direction-in-description-opening-line] [fixture:
c4/gram-direction-inside-longer-word] [fixture:
c4/gram-direction-lr-inside-label] [fixture: c4/gram-direction-lr-line]
[fixture: c4/gram-direction-lr-prefix] [fixture:
c4/gram-direction-rl-inside-label] [fixture: c4/gram-direction-rl-line]
[fixture: c4/gram-direction-rl-prefix] [fixture: c4/gram-direction-suffix-ls]
[fixture: c4/gram-direction-suffix-u2029] [fixture: c4/gram-direction-tb]
[fixture: c4/gram-direction-tb-inside-label] [fixture:
c4/gram-direction-tb-line] [fixture: c4/gram-direction-tb-prefix] [fixture:
c4/gram-title-direction] [fixture: c4/gram-boundary-direction] [fixture:
c4/gram-boundary-next-line-direction]

Uppercase DIRECTION, a lowercase direction value or a value on the next line
also fails to form a diagram statement, while lowercase `direction tb` stays
literal inside a title. [fixture: c4/gram-direction-bt-lower-value] [fixture:
c4/gram-direction-bt-upper] [fixture: c4/gram-direction-lr-lower-value]
[fixture: c4/gram-direction-lr-upper] [fixture:
c4/gram-direction-rl-lower-value] [fixture: c4/gram-direction-rl-upper]
[fixture: c4/gram-direction-tb-lower-value] [fixture:
c4/gram-direction-tb-upper] [fixture: c4/gram-direction-value-next-line]
[fixture: c4/gram-title-lower-direction]

Direction text on a later line of an already open quoted or bare argument or
description block stays literal, and a whole direction comment line removed
before parsing changes nothing. [fixture: c4/lex-quote-multiline-direction]
[fixture: c4/lex-bare-multiline-direction] [fixture:
c4/lex-direction-in-multiline-description-block] [fixture:
c4/gram-direction-comment-removed]

U+2028 or U+2029 before direction text prevents its same-line prefix match, so
title and quoted-argument text after that separator can keep `direction TB`
literally. [fixture: c4/gram-title-direction-after-ls] [fixture:
c4/gram-title-direction-after-ps] [fixture: c4/lex-quoted-direction-after-ls]
[fixture: c4/lex-title-value-ls]

An unclosed init directive on a line before a call is rejected, with or without
a colon after init. [fixture: c4/lex-directive-unclosed-next-line] [fixture:
c4/lex-directive-colon-unclosed-next-line]

### Positional arguments and named attributes

A named alias or endpoint override changes the key used by later definitions,
while a boundary child keeps the parent alias selected before the override.
[fixture: c4/db-shape-alias-named-change] [fixture:
c4/db-rel-endpoint-named-change] [fixture: c4/db-boundary-alias-named-change]

Named keys are case sensitive, so `$Tags` and `$tags` remain separate
attributes. [fixture: c4/db-named-case-sensitive]

The Person and System families, including their external, database and queue
forms, take positional arguments in the order `alias`, `label.text`,
`descr.text`, `sprite`, `tags`, `link`. [fixture: c4/db-keyword-person-ext]
[fixture: c4/db-keyword-person] [fixture: c4/db-keyword-systemqueue-ext]
[fixture: c4/db-keyword-systemdb-ext] [fixture: c4/db-keyword-system-ext]
[fixture: c4/db-keyword-systemqueue] [fixture: c4/db-keyword-systemdb] [fixture:
c4/db-keyword-system] [fixture: c4/spec-c4-diagram-f0d3f937] [fixture:
c4/spec-c4-person-658cf221] [fixture: c4/spec-c4-person-a1d68b7d] [fixture:
c4/spec-c4-person-ext-31a32f69] [fixture: c4/spec-c4-person-ext-cde14a2b]
[fixture: c4/spec-c4-system-4d9f1bce] [fixture: c4/spec-c4-system-553fd5b2]
[fixture: c4/spec-c4-system-5e851605] [fixture: c4/spec-c4-system-61b143cb]
[fixture: c4/spec-c4-system-62c3dca2] [fixture: c4/spec-c4-system-7e1bd7e9]
[fixture: c4/spec-c4-system-7f4c3d18] [fixture: c4/spec-c4-system-84ca45f9]
[fixture: c4/spec-c4-system-af636454] [fixture: c4/spec-c4-system-b5a30fc8]
[fixture: c4/spec-c4-system-ca506508] [fixture: c4/spec-c4-system-f240d0bd]

`Boundary` takes positional arguments in the order `alias`, `label.text`,
`type.text`, `tags`, `link`. [fixture: c4/db-keyword-boundary] [fixture:
c4/spec-c4-boundary-08686298] [fixture: c4/spec-c4-boundary-8c562ee4]

`Enterprise_Boundary`, `System_Boundary`, `Container_Boundary` take positional
arguments in the order `alias`, `label.text`, `tags`, `link`. [fixture:
c4/db-keyword-enterprise-boundary] [fixture: c4/db-keyword-system-boundary]
[fixture: c4/db-keyword-container-boundary]

The Container and Component families, including their external, database and
queue forms, take positional arguments in the order `alias`, `label.text`,
`techn.text`, `descr.text`, `sprite`, `tags`, `link`. [fixture:
c4/db-keyword-containerqueue-ext] [fixture: c4/db-keyword-containerdb-ext]
[fixture: c4/db-keyword-container-ext] [fixture: c4/db-keyword-containerqueue]
[fixture: c4/db-keyword-containerdb] [fixture: c4/db-keyword-container]
[fixture: c4/db-keyword-componentqueue-ext] [fixture:
c4/db-keyword-componentdb-ext] [fixture: c4/db-keyword-component-ext] [fixture:
c4/db-keyword-componentqueue] [fixture: c4/db-keyword-componentdb] [fixture:
c4/db-keyword-component] [fixture: c4/docs-syntax-c4-e233a726] [fixture:
c4/spec-c4-component-67febb82] [fixture: c4/spec-c4-component-82a9b2bd]
[fixture: c4/spec-c4-component-bd0e301a] [fixture:
c4/spec-c4-component-e0ffc102] [fixture: c4/spec-c4-component-ef7ed092]
[fixture: c4/spec-c4-component-f8fbb57a] [fixture:
c4/spec-c4-container-04b94850] [fixture: c4/spec-c4-container-06e57d08]
[fixture: c4/spec-c4-container-0979e261] [fixture:
c4/spec-c4-container-0c888a1d] [fixture: c4/spec-c4-container-29db0dde]
[fixture: c4/spec-c4-container-40136510] [fixture:
c4/spec-c4-container-650b0e8f] [fixture: c4/spec-c4-container-79b6a78b]
[fixture: c4/spec-c4-container-7a65e408] [fixture:
c4/spec-c4-container-85b656fa] [fixture: c4/spec-c4-container-8a22d744]
[fixture: c4/spec-c4-container-98760505] [fixture:
c4/spec-c4-container-9f732139] [fixture: c4/spec-c4-container-a087a6ea]
[fixture: c4/spec-c4-container-a5979794] [fixture:
c4/spec-c4-container-a5b85126] [fixture: c4/spec-c4-container-aa32c573]
[fixture: c4/spec-c4-container-bbf08ef2] [fixture:
c4/spec-c4-container-cef673d4] [fixture: c4/spec-c4-container-db66cc1e]
[fixture: c4/spec-c4-container-e174083e] [fixture:
c4/spec-c4-container-e58a9a00] [fixture: c4/spec-c4-container-eae6e364]
[fixture: c4/spec-c4-container-fd30d76e]

`Deployment_Node`, `Node`, `Node_L`, `Node_R` take positional arguments in the
order `alias`, `label.text`, `type.text`, `descr.text`, `ignored sprite`,
`tags`, `link`. [fixture: c4/db-keyword-deployment-node] [fixture:
c4/db-keyword-node] [fixture: c4/db-keyword-node-l] [fixture:
c4/db-keyword-node-r] [fixture: c4/demo-c4context-1d531a27] [fixture:
c4/docs-syntax-c4-90f106b9]

Relationship keywords other than RelIndex take positional arguments in the order
`from`, `to`, `label.text`, `techn.text`, `descr.text`, `sprite`, `tags`,
`link`. [fixture: c4/db-keyword-rel] [fixture: c4/db-keyword-birel] [fixture:
c4/db-keyword-rel-up] [fixture: c4/db-keyword-rel-u] [fixture:
c4/db-keyword-rel-down] [fixture: c4/db-keyword-rel-d] [fixture:
c4/db-keyword-rel-left] [fixture: c4/db-keyword-rel-l] [fixture:
c4/db-keyword-rel-right] [fixture: c4/db-keyword-rel-r] [fixture:
c4/db-keyword-rel-back] [fixture: c4/spec-c4-boundary-e7bc47fe]

`RelIndex` takes positional arguments in the order `discarded index`, `from`,
`to`, `label.text`, `techn.text`, `descr.text`, `sprite`, `tags`, `link`.
[fixture: c4/db-keyword-relindex]

`UpdateElementStyle` takes positional arguments in the order `target alias`,
`bgColor`, `fontColor`, `borderColor`, `shadowing`, `shape`, `sprite`, `techn`,
`legendText`, `legendSprite`. [fixture: c4/db-keyword-updateelementstyle]

`UpdateRelStyle` takes positional arguments in the order `target from`,
`target to`, `textColor`, `lineColor`, `offsetX`, `offsetY`. [fixture:
c4/db-keyword-updaterelstyle]

`UpdateLayoutConfig` takes positional arguments in the order `c4ShapeInRow`,
`c4BoundaryInRow`. [fixture: c4/db-keyword-updatelayoutconfig]

Fixed boundary keywords set their type to `ENTERPRISE`, `SYSTEM`, or
`CONTAINER`, while `Node` and `Deployment_Node` use nodeType `node`, `Node_L`
uses `nodeL`, and `Node_R` uses `nodeR`. [fixture:
c4/db-keyword-enterprise-boundary] [fixture: c4/db-keyword-system-boundary]
[fixture: c4/db-keyword-container-boundary] [fixture: c4/db-keyword-node]
[fixture: c4/db-keyword-deployment-node] [fixture: c4/db-keyword-node-l]
[fixture: c4/db-keyword-node-r] [fixture: c4/docs-syntax-c4-bc80e69a]

`Person` and `Person_Ext` set `typeC4Shape.text` to `person` and
`external_person` respectively. [fixture: c4/db-keyword-person] [fixture:
c4/db-keyword-person-ext] [fixture: c4/spec-c4-person-c3534964] [fixture:
c4/spec-c4-person-ext-403c6383]

`System`, `SystemDb`, `SystemQueue` set their shape kinds to `system`,
`system_db`, and `system_queue`, and their `_Ext` forms prefix that kind with
`external_`. [fixture: c4/db-keyword-system] [fixture: c4/db-keyword-systemdb]
[fixture: c4/db-keyword-systemqueue] [fixture: c4/db-keyword-system-ext]
[fixture: c4/db-keyword-systemdb-ext] [fixture: c4/db-keyword-systemqueue-ext]
[fixture: c4/spec-c4-system-4c688f50] [fixture: c4/spec-c4-system-6500d002]
[fixture: c4/spec-c4-system-8ae77b48] [fixture: c4/spec-c4-system-9c3b4db9]
[fixture: c4/spec-c4-system-cb5e70a4] [fixture: c4/spec-c4-system-eb1a0dc9]

`Container`, `ContainerDb`, `ContainerQueue` set their shape kinds to
`container`, `container_db`, and `container_queue`, and their `_Ext` forms
prefix that kind with `external_`. [fixture: c4/db-keyword-container] [fixture:
c4/db-keyword-containerdb] [fixture: c4/db-keyword-containerqueue] [fixture:
c4/db-keyword-container-ext] [fixture: c4/db-keyword-containerdb-ext] [fixture:
c4/db-keyword-containerqueue-ext] [fixture: c4/demo-c4context-b284cb21]
[fixture: c4/docs-syntax-c4-96b1a834] [fixture: c4/spec-c4-container-40136510]
[fixture: c4/spec-c4-container-7a65e408] [fixture:
c4/spec-c4-container-8a22d744] [fixture: c4/spec-c4-container-aa32c573]
[fixture: c4/spec-c4-container-bbf08ef2] [fixture:
c4/spec-c4-container-e58a9a00]

`Component`, `ComponentDb`, `ComponentQueue` set their shape kinds to
`component`, `component_db`, and `component_queue`, and their `_Ext` forms
prefix that kind with `external_`. [fixture: c4/db-keyword-component] [fixture:
c4/db-keyword-componentdb] [fixture: c4/db-keyword-componentqueue] [fixture:
c4/db-keyword-component-ext] [fixture: c4/db-keyword-componentdb-ext] [fixture:
c4/db-keyword-componentqueue-ext] [fixture: c4/docs-syntax-c4-e233a726]
[fixture: c4/spec-c4-component-0da5aed2] [fixture:
c4/spec-c4-component-469fb648] [fixture: c4/spec-c4-component-67febb82]
[fixture: c4/spec-c4-component-82a9b2bd] [fixture:
c4/spec-c4-component-a8988ac2] [fixture: c4/spec-c4-component-bd0e301a]
[fixture: c4/spec-c4-component-d1298236] [fixture:
c4/spec-c4-component-e0ffc102] [fixture: c4/spec-c4-component-ebbe1176]
[fixture: c4/spec-c4-component-ef7ed092] [fixture:
c4/spec-c4-component-f06e3225] [fixture: c4/spec-c4-component-f8fbb57a]

`Rel` and `RelIndex` set type `rel`, `BiRel` sets `birel`, each short or long
directional form sets `rel_u`, `rel_d`, `rel_l`, or `rel_r`, and `Rel_Back` sets
`rel_b`. [fixture: c4/db-keyword-rel] [fixture: c4/db-keyword-relindex]
[fixture: c4/db-keyword-birel] [fixture: c4/db-keyword-rel-u] [fixture:
c4/db-keyword-rel-up] [fixture: c4/db-keyword-rel-d] [fixture:
c4/db-keyword-rel-down] [fixture: c4/db-keyword-rel-l] [fixture:
c4/db-keyword-rel-left] [fixture: c4/db-keyword-rel-r] [fixture:
c4/db-keyword-rel-right] [fixture: c4/db-keyword-rel-back] [fixture:
c4/demo-c4context-49481a12]

Single commas separate arguments, an opening comma or a `,,` token supplies an
empty argument, and adjacent quoted or named arguments need no comma. [fixture:
c4/lex-arguments-no-comma] [fixture: c4/lex-arguments-spaces-between-strings]
[fixture: c4/lex-arguments-many-commas] [fixture: c4/lex-double-comma] [fixture:
c4/lex-trailing-comma] [fixture: c4/lex-empty-before-named] [fixture:
c4/lex-quoted-empty-before-bare] [fixture: c4/gram-person-comma-only] [fixture:
c4/gram-person-one-empty-string]

A bare argument consumes text through the next comma, including a closing
parenthesis or a line break, so a final bare argument needs a following comma.
[fixture: c4/gram-arguments-bare-final] [fixture:
c4/gram-arguments-bare-final-before-comma] [fixture:
c4/lex-bare-last-with-comma] [fixture: c4/lex-bare-across-close-and-line]
[fixture: c4/lex-unclosed-parenthesis] [fixture: c4/lex-missing-comma] [fixture:
c4/gram-arguments-person-bare] [fixture: c4/gram-arguments-container-bare]
[fixture: c4/gram-arguments-component-bare] [fixture:
c4/gram-arguments-boundary-bare] [fixture: c4/gram-arguments-node-bare]
[fixture: c4/gram-arguments-rel-bare] [fixture: c4/gram-arguments-index-bare]
[fixture: c4/gram-arguments-element-style-bare] [fixture:
c4/gram-arguments-rel-style-bare] [fixture: c4/gram-arguments-layout-bare]

A leading tab or a longer bare fragment wins over a following quote or dollar
sign, which remains part of the bare text. [fixture:
c4/lex-bare-tab-before-quote] [fixture: c4/lex-bare-before-dollar-is-text]
[fixture: c4/lex-empty-description-form-in-bare-argument]

Omitted optional arguments keep the Db defaults, an empty required label stays
empty, and a relationship with a missing endpoint or label adds no entry.
[fixture: c4/gram-rel-too-few-quoted] [fixture: c4/gram-rel-empty-label]
[fixture: c4/gram-arguments-boundary-below] [fixture:
c4/gram-arguments-boundary-empty] [fixture: c4/gram-arguments-component-below]
[fixture: c4/gram-arguments-component-empty] [fixture:
c4/gram-arguments-container-below] [fixture: c4/gram-arguments-container-empty]
[fixture: c4/gram-arguments-element-style-below] [fixture:
c4/gram-arguments-element-style-empty] [fixture: c4/gram-arguments-index-below]
[fixture: c4/gram-arguments-index-empty] [fixture: c4/gram-arguments-index-one]
[fixture: c4/gram-arguments-layout-empty] [fixture:
c4/gram-arguments-layout-one] [fixture: c4/gram-arguments-node-below] [fixture:
c4/gram-arguments-node-empty] [fixture: c4/gram-arguments-person-below]
[fixture: c4/gram-arguments-person-empty] [fixture: c4/gram-arguments-rel-below]
[fixture: c4/gram-arguments-rel-empty] [fixture:
c4/gram-arguments-rel-style-below] [fixture: c4/gram-arguments-rel-style-empty]

The check for a missing endpoint or label also applies after `RelIndex` discards
its index; supplied empty strings count as arguments. [fixture:
c4/gram-arguments-index-one] [fixture: c4/gram-rel-too-few-quoted] [fixture:
c4/gram-rel-empty-label] [fixture: c4/gram-arguments-rel-empty]

A missing call parenthesis or quote is rejected unless a preceding bare argument
absorbs the apparent call as text. [fixture:
c4/gram-arguments-boundary-missing-close] [fixture:
c4/gram-arguments-component-missing-close] [fixture:
c4/gram-arguments-container-missing-close] [fixture:
c4/gram-arguments-element-style-missing-close] [fixture:
c4/gram-arguments-index-missing-close] [fixture:
c4/gram-arguments-layout-missing-close] [fixture:
c4/gram-arguments-node-missing-close] [fixture:
c4/gram-arguments-person-missing-close] [fixture:
c4/gram-arguments-rel-missing-close] [fixture:
c4/gram-arguments-rel-style-missing-close] [fixture: c4/lex-missing-open]
[fixture: c4/lex-unclosed-quote] [fixture: c4/lex-unclosed-named]

A comma ends a bare positional argument and shifts the remaining arguments,
including endpoints after a RelIndex index. [fixture:
c4/db-grid-comma-text-argument-bare] [fixture:
c4/db-grid-punct-text-argument-bare] [fixture:
c4/db-grid-comma-alias-argument-bare] [fixture:
c4/db-grid-punct-alias-argument-bare] [fixture:
c4/db-grid-comma-plain-argument-bare] [fixture:
c4/db-grid-punct-plain-argument-bare] [fixture:
c4/db-grid-comma-index-argument-bare] [fixture:
c4/db-grid-punct-index-argument-bare]

The first equals sign ends a named key, so an equals sign or an HTML attribute
assignment inserted into that key is rejected rather than kept in its name.
[fixture: c4/gram-grid-equals-named-key] [fixture:
c4/gram-grid-html-attribute-named-key] [fixture: c4/gram-grid-punct-named-key]

A double quote ends a quoted positional argument, and the following bare
fragment becomes another argument even without a comma. [fixture:
c4/db-grid-quote-text-argument-quoted] [fixture:
c4/db-grid-quote-alias-argument-quoted] [fixture:
c4/db-grid-quote-plain-argument-quoted] [fixture:
c4/db-grid-quote-index-argument-quoted]

A double quote ends a named value; a following bare fragment is not a
continuation of that value and is rejected. [fixture:
c4/gram-grid-quote-named-value] [fixture: c4/gram-grid-quote-style-value]

An empty positional argument is kept as the empty string rather than dropped.
[fixture: c4/db-grid-empty-text-argument-bare] [fixture:
c4/db-grid-empty-alias-argument-bare] [fixture:
c4/db-grid-empty-plain-argument-bare] [fixture:
c4/db-grid-empty-text-argument-quoted] [fixture:
c4/db-grid-empty-alias-argument-quoted] [fixture:
c4/db-grid-empty-plain-argument-quoted] [fixture: c4/spec-c4-boundary-08686298]
[fixture: c4/spec-c4-container-06e57d08] [fixture:
c4/spec-c4-container-0979e261] [fixture: c4/spec-c4-container-29db0dde]
[fixture: c4/spec-c4-container-79b6a78b] [fixture:
c4/spec-c4-container-85b656fa] [fixture: c4/spec-c4-container-9f732139]
[fixture: c4/spec-c4-container-a5979794] [fixture:
c4/spec-c4-container-a5b85126] [fixture: c4/spec-c4-container-cef673d4]
[fixture: c4/spec-c4-container-db66cc1e] [fixture:
c4/spec-c4-container-e174083e] [fixture: c4/spec-c4-container-eae6e364]

An empty named key is allowed and selects the attribute whose name is the empty
string. [fixture: c4/db-grid-empty-named-key] [fixture: c4/lex-named-empty-key]

A literally empty named value is rejected, while a nonempty value containing
only whitespace is trimmed to an empty string. [fixture:
c4/gram-grid-empty-named-value] [fixture: c4/gram-grid-empty-style-value]
[fixture: c4/gram-named-empty-value] [fixture: c4/lex-named-whitespace-value]

An empty call or a call with only an unterminated bare argument has no complete
attribute list and is rejected. [fixture: c4/gram-arguments-boundary-none]
[fixture: c4/gram-arguments-boundary-one] [fixture:
c4/gram-arguments-component-none] [fixture: c4/gram-arguments-component-one]
[fixture: c4/gram-arguments-container-none] [fixture:
c4/gram-arguments-container-one] [fixture: c4/gram-arguments-element-style-none]
[fixture: c4/gram-arguments-element-style-one] [fixture:
c4/gram-arguments-index-none] [fixture: c4/gram-arguments-layout-none] [fixture:
c4/gram-arguments-node-none] [fixture: c4/gram-arguments-node-one] [fixture:
c4/gram-arguments-person-none] [fixture: c4/gram-arguments-person-one] [fixture:
c4/gram-arguments-rel-none] [fixture: c4/gram-arguments-rel-one] [fixture:
c4/gram-arguments-rel-style-none] [fixture: c4/gram-arguments-rel-style-one]

Whitespace after a quoted argument or a line break immediately after `(` can
start a bare fragment that absorbs the closing parenthesis and rejects the call.
[fixture: c4/lex-bare-after-quoted-spaces] [fixture:
c4/gram-statement-newline-in-call]

A backslash does not escape a double quote in a quoted argument, so the quote
closes the value and can leave an invalid suffix. [fixture:
c4/lex-quote-backslash]

A named argument requires a double-quoted value after `=`; bare or single-quoted
values and an unfinished `$` argument are rejected. [fixture:
c4/gram-named-bare-value] [fixture: c4/gram-named-single-quote] [fixture:
c4/lex-named-open-eof]

A named key keeps internal commas, closing parentheses, line feeds and
indentation until its first equals sign. [fixture: c4/lex-named-key-comma-close]
[fixture: c4/lex-named-key-multiline]

Assigning a string to the named key `__proto__` leaves an argument object with
no own entry, and consuming that object as an optional field throws a TypeError.
[fixture: c4/gram-named-proto] [fixture: c4/gram-named-proto-boundary-type]
[fixture: c4/gram-named-proto-container-technology] [fixture:
c4/gram-named-proto-existing-relationship-style] [fixture:
c4/gram-named-proto-index-relationship-technology] [fixture:
c4/gram-named-proto-node-type] [fixture: c4/gram-named-proto-person-description]
[fixture: c4/gram-named-proto-relationship-technology] [fixture:
c4/gram-named-proto-system-boundary-tags]

In a required alias slot, a named `__proto__` argument is retained as a fresh
empty object `{}`. [fixture: c4/gram-proto-required-alias]

An `UpdateLayoutConfig` argument named `__proto__` has no own value, so
`parseInt(undefined)` yields `NaN` and leaves its row counter unchanged, while
the other argument is still processed. [fixture: c4/gram-proto-layout]

An empty-entry named object in an unused extra argument or in a style call with
no matching target is not consumed and does not throw. [fixture:
c4/gram-proto-unused-extra] [fixture: c4/gram-proto-rel-missing-target]

A new Person, deployment node or relationship with no description keeps
`{ text: "" }`, and a Container with no technology keeps the same empty-text
wrapper for techn. [fixture: c4/header-context-minimal] [fixture:
c4/gram-boundary-nested] [fixture: c4/db-rel-self] [fixture:
c4/spec-c4-named-attributes-bd7f9fb7]

On a new Container or Component, an omitted description becomes `{ text: "" }`.
[fixture: c4/spec-c4-named-attributes-19f2c0e1] [fixture:
c4/spec-c4-named-attributes-af0fa0d8]

An omitted Boundary type becomes `{ text: "system" }`, while an omitted
deployment-node type becomes `{ text: "node" }`. [fixture:
c4/gram-boundary-nested] [fixture: c4/spec-c4-boundary-826935af]

On newly declared entries, absent sprite, tags and link are omitted rather than
filled with empty strings; the initial global boundary retains its own null
defaults. [fixture: c4/header-context-minimal] [fixture:
c4/gram-boundary-nested] [fixture: c4/db-rel-self]

### Text values

Internal spaces, tabs, form feeds, vertical tabs, NBSP, U+3000, U+FEFF, U+2028,
U+2029, and U+0085 are kept in argument, named-key, title, and accessibility
text, apart from trimmed ends and accDescr indentation after LF. [fixture:
c4/db-grid-bom-title] [fixture: c4/db-grid-ff-title] [fixture:
c4/db-grid-ideographic-title] [fixture: c4/db-grid-ls-title] [fixture:
c4/db-grid-nbsp-title] [fixture: c4/db-grid-nel-title] [fixture:
c4/db-grid-ps-title] [fixture: c4/db-grid-spaces-title] [fixture:
c4/db-grid-tab-title] [fixture: c4/db-grid-vt-title] [fixture:
c4/db-grid-bom-acc-description] [fixture: c4/db-grid-ff-acc-description]
[fixture: c4/db-grid-ideographic-acc-description] [fixture:
c4/db-grid-ls-acc-description] [fixture: c4/db-grid-nbsp-acc-description]
[fixture: c4/db-grid-nel-acc-description] [fixture:
c4/db-grid-ps-acc-description] [fixture: c4/db-grid-spaces-acc-description]
[fixture: c4/db-grid-tab-acc-description] [fixture:
c4/db-grid-vt-acc-description] [fixture: c4/db-grid-bom-acc-title] [fixture:
c4/db-grid-ff-acc-title] [fixture: c4/db-grid-ideographic-acc-title] [fixture:
c4/db-grid-ls-acc-title] [fixture: c4/db-grid-nbsp-acc-title] [fixture:
c4/db-grid-nel-acc-title] [fixture: c4/db-grid-ps-acc-title] [fixture:
c4/db-grid-spaces-acc-title] [fixture: c4/db-grid-tab-acc-title] [fixture:
c4/db-grid-vt-acc-title] [fixture: c4/db-grid-bom-acc-descr] [fixture:
c4/db-grid-ff-acc-descr] [fixture: c4/db-grid-ideographic-acc-descr] [fixture:
c4/db-grid-ls-acc-descr] [fixture: c4/db-grid-nbsp-acc-descr] [fixture:
c4/db-grid-nel-acc-descr] [fixture: c4/db-grid-ps-acc-descr] [fixture:
c4/db-grid-spaces-acc-descr] [fixture: c4/db-grid-tab-acc-descr] [fixture:
c4/db-grid-vt-acc-descr] [fixture: c4/db-grid-bom-acc-descr-block] [fixture:
c4/db-grid-ff-acc-descr-block] [fixture: c4/db-grid-ideographic-acc-descr-block]
[fixture: c4/db-grid-ls-acc-descr-block] [fixture:
c4/db-grid-nbsp-acc-descr-block] [fixture: c4/db-grid-nel-acc-descr-block]
[fixture: c4/db-grid-ps-acc-descr-block] [fixture:
c4/db-grid-spaces-acc-descr-block] [fixture: c4/db-grid-tab-acc-descr-block]
[fixture: c4/db-grid-vt-acc-descr-block] [fixture:
c4/db-grid-bom-text-argument-bare] [fixture: c4/db-grid-ff-text-argument-bare]
[fixture: c4/db-grid-ideographic-text-argument-bare] [fixture:
c4/db-grid-ls-text-argument-bare] [fixture: c4/db-grid-nbsp-text-argument-bare]
[fixture: c4/db-grid-nel-text-argument-bare] [fixture:
c4/db-grid-ps-text-argument-bare] [fixture:
c4/db-grid-spaces-text-argument-bare] [fixture:
c4/db-grid-tab-text-argument-bare] [fixture: c4/db-grid-vt-text-argument-bare]
[fixture: c4/db-grid-bom-alias-argument-bare] [fixture:
c4/db-grid-ff-alias-argument-bare] [fixture:
c4/db-grid-ideographic-alias-argument-bare] [fixture:
c4/db-grid-ls-alias-argument-bare] [fixture:
c4/db-grid-nbsp-alias-argument-bare] [fixture:
c4/db-grid-nel-alias-argument-bare] [fixture: c4/db-grid-ps-alias-argument-bare]
[fixture: c4/db-grid-spaces-alias-argument-bare] [fixture:
c4/db-grid-tab-alias-argument-bare] [fixture: c4/db-grid-vt-alias-argument-bare]
[fixture: c4/db-grid-bom-plain-argument-bare] [fixture:
c4/db-grid-ff-plain-argument-bare] [fixture:
c4/db-grid-ideographic-plain-argument-bare] [fixture:
c4/db-grid-ls-plain-argument-bare] [fixture:
c4/db-grid-nbsp-plain-argument-bare] [fixture:
c4/db-grid-nel-plain-argument-bare] [fixture: c4/db-grid-ps-plain-argument-bare]
[fixture: c4/db-grid-spaces-plain-argument-bare] [fixture:
c4/db-grid-tab-plain-argument-bare] [fixture: c4/db-grid-vt-plain-argument-bare]
[fixture: c4/db-grid-bom-text-argument-quoted] [fixture:
c4/db-grid-ff-text-argument-quoted] [fixture:
c4/db-grid-ideographic-text-argument-quoted] [fixture:
c4/db-grid-ls-text-argument-quoted] [fixture:
c4/db-grid-nbsp-text-argument-quoted] [fixture:
c4/db-grid-nel-text-argument-quoted] [fixture:
c4/db-grid-ps-text-argument-quoted] [fixture:
c4/db-grid-spaces-text-argument-quoted] [fixture:
c4/db-grid-tab-text-argument-quoted] [fixture:
c4/db-grid-vt-text-argument-quoted] [fixture:
c4/db-grid-bom-alias-argument-quoted] [fixture:
c4/db-grid-ff-alias-argument-quoted] [fixture:
c4/db-grid-ideographic-alias-argument-quoted] [fixture:
c4/db-grid-ls-alias-argument-quoted] [fixture:
c4/db-grid-nbsp-alias-argument-quoted] [fixture:
c4/db-grid-nel-alias-argument-quoted] [fixture:
c4/db-grid-ps-alias-argument-quoted] [fixture:
c4/db-grid-spaces-alias-argument-quoted] [fixture:
c4/db-grid-tab-alias-argument-quoted] [fixture:
c4/db-grid-vt-alias-argument-quoted] [fixture:
c4/db-grid-bom-plain-argument-quoted] [fixture:
c4/db-grid-ff-plain-argument-quoted] [fixture:
c4/db-grid-ideographic-plain-argument-quoted] [fixture:
c4/db-grid-ls-plain-argument-quoted] [fixture:
c4/db-grid-nbsp-plain-argument-quoted] [fixture:
c4/db-grid-nel-plain-argument-quoted] [fixture:
c4/db-grid-ps-plain-argument-quoted] [fixture:
c4/db-grid-spaces-plain-argument-quoted] [fixture:
c4/db-grid-tab-plain-argument-quoted] [fixture:
c4/db-grid-vt-plain-argument-quoted] [fixture: c4/db-grid-bom-named-key]
[fixture: c4/db-grid-ff-named-key] [fixture: c4/db-grid-ideographic-named-key]
[fixture: c4/db-grid-ls-named-key] [fixture: c4/db-grid-nbsp-named-key]
[fixture: c4/db-grid-nel-named-key] [fixture: c4/db-grid-ps-named-key] [fixture:
c4/db-grid-spaces-named-key] [fixture: c4/db-grid-tab-named-key] [fixture:
c4/db-grid-vt-named-key] [fixture: c4/db-grid-bom-named-value] [fixture:
c4/db-grid-ff-named-value] [fixture: c4/db-grid-ideographic-named-value]
[fixture: c4/db-grid-ls-named-value] [fixture: c4/db-grid-nbsp-named-value]
[fixture: c4/db-grid-nel-named-value] [fixture: c4/db-grid-ps-named-value]
[fixture: c4/db-grid-spaces-named-value] [fixture: c4/db-grid-tab-named-value]
[fixture: c4/db-grid-vt-named-value] [fixture: c4/db-grid-bom-style-value]
[fixture: c4/db-grid-ff-style-value] [fixture:
c4/db-grid-ideographic-style-value] [fixture: c4/db-grid-ls-style-value]
[fixture: c4/db-grid-nbsp-style-value] [fixture: c4/db-grid-nel-style-value]
[fixture: c4/db-grid-ps-style-value] [fixture: c4/db-grid-spaces-style-value]
[fixture: c4/db-grid-tab-style-value] [fixture: c4/db-grid-vt-style-value]

Non-ASCII letters and emoji are kept in text values and named keys. [fixture:
c4/db-grid-emoji-title] [fixture: c4/db-grid-nonascii-title] [fixture:
c4/db-grid-emoji-acc-description] [fixture: c4/db-grid-nonascii-acc-description]
[fixture: c4/db-grid-emoji-acc-title] [fixture: c4/db-grid-nonascii-acc-title]
[fixture: c4/db-grid-emoji-acc-descr] [fixture: c4/db-grid-nonascii-acc-descr]
[fixture: c4/db-grid-emoji-acc-descr-block] [fixture:
c4/db-grid-nonascii-acc-descr-block] [fixture:
c4/db-grid-emoji-text-argument-bare] [fixture:
c4/db-grid-nonascii-text-argument-bare] [fixture:
c4/db-grid-emoji-alias-argument-bare] [fixture:
c4/db-grid-nonascii-alias-argument-bare] [fixture:
c4/db-grid-emoji-plain-argument-bare] [fixture:
c4/db-grid-nonascii-plain-argument-bare] [fixture:
c4/db-grid-emoji-text-argument-quoted] [fixture:
c4/db-grid-nonascii-text-argument-quoted] [fixture:
c4/db-grid-emoji-alias-argument-quoted] [fixture:
c4/db-grid-nonascii-alias-argument-quoted] [fixture:
c4/db-grid-emoji-plain-argument-quoted] [fixture:
c4/db-grid-nonascii-plain-argument-quoted] [fixture: c4/db-grid-emoji-named-key]
[fixture: c4/db-grid-nonascii-named-key] [fixture: c4/db-grid-emoji-named-value]
[fixture: c4/db-grid-nonascii-named-value] [fixture:
c4/db-grid-emoji-style-value] [fixture: c4/db-grid-nonascii-style-value]
[fixture: c4/db-title-non-ascii] [fixture: c4/db-acctitle-non-ascii] [fixture:
c4/db-accdescription-non-ascii] [fixture: c4/db-accdescr-non-ascii]

Digits, `root`, and the words `constructor` and `__proto__` inside a longer text
stay literal in text values and named keys. [fixture:
c4/db-grid-constructor-title] [fixture: c4/db-grid-digits-title] [fixture:
c4/db-grid-proto-title] [fixture: c4/db-grid-root-title] [fixture:
c4/db-grid-constructor-acc-description] [fixture:
c4/db-grid-digits-acc-description] [fixture: c4/db-grid-proto-acc-description]
[fixture: c4/db-grid-root-acc-description] [fixture:
c4/db-grid-constructor-acc-title] [fixture: c4/db-grid-digits-acc-title]
[fixture: c4/db-grid-proto-acc-title] [fixture: c4/db-grid-root-acc-title]
[fixture: c4/db-grid-constructor-acc-descr] [fixture:
c4/db-grid-digits-acc-descr] [fixture: c4/db-grid-proto-acc-descr] [fixture:
c4/db-grid-root-acc-descr] [fixture: c4/db-grid-constructor-acc-descr-block]
[fixture: c4/db-grid-digits-acc-descr-block] [fixture:
c4/db-grid-proto-acc-descr-block] [fixture: c4/db-grid-root-acc-descr-block]
[fixture: c4/db-grid-constructor-text-argument-bare] [fixture:
c4/db-grid-digits-text-argument-bare] [fixture:
c4/db-grid-proto-text-argument-bare] [fixture:
c4/db-grid-root-text-argument-bare] [fixture:
c4/db-grid-constructor-alias-argument-bare] [fixture:
c4/db-grid-digits-alias-argument-bare] [fixture:
c4/db-grid-proto-alias-argument-bare] [fixture:
c4/db-grid-root-alias-argument-bare] [fixture:
c4/db-grid-constructor-plain-argument-bare] [fixture:
c4/db-grid-digits-plain-argument-bare] [fixture:
c4/db-grid-proto-plain-argument-bare] [fixture:
c4/db-grid-root-plain-argument-bare] [fixture:
c4/db-grid-constructor-text-argument-quoted] [fixture:
c4/db-grid-digits-text-argument-quoted] [fixture:
c4/db-grid-proto-text-argument-quoted] [fixture:
c4/db-grid-root-text-argument-quoted] [fixture:
c4/db-grid-constructor-alias-argument-quoted] [fixture:
c4/db-grid-digits-alias-argument-quoted] [fixture:
c4/db-grid-proto-alias-argument-quoted] [fixture:
c4/db-grid-root-alias-argument-quoted] [fixture:
c4/db-grid-constructor-plain-argument-quoted] [fixture:
c4/db-grid-digits-plain-argument-quoted] [fixture:
c4/db-grid-proto-plain-argument-quoted] [fixture:
c4/db-grid-root-plain-argument-quoted] [fixture:
c4/db-grid-constructor-named-key] [fixture: c4/db-grid-digits-named-key]
[fixture: c4/db-grid-proto-named-key] [fixture: c4/db-grid-root-named-key]
[fixture: c4/db-grid-constructor-named-value] [fixture:
c4/db-grid-digits-named-value] [fixture: c4/db-grid-proto-named-value] [fixture:
c4/db-grid-root-named-value] [fixture: c4/db-grid-constructor-style-value]
[fixture: c4/db-grid-digits-style-value] [fixture: c4/db-grid-proto-style-value]
[fixture: c4/db-grid-root-style-value]

C4 headers and element keywords, and words from other diagram types such as
`block`, `class`, `columns`, `end`, `space`, `style`, and `classDef`, stay
literal inside text values and named keys. [fixture: c4/db-grid-keyword-title]
[fixture: c4/db-grid-keyword-block-title] [fixture:
c4/db-grid-keyword-class-title] [fixture: c4/db-grid-keyword-classdef-title]
[fixture: c4/db-grid-keyword-columns-title] [fixture:
c4/db-grid-keyword-end-title] [fixture: c4/db-grid-keyword-header-title]
[fixture: c4/db-grid-keyword-space-title] [fixture:
c4/db-grid-keyword-style-title] [fixture: c4/db-grid-keyword-acc-description]
[fixture: c4/db-grid-keyword-block-acc-description] [fixture:
c4/db-grid-keyword-class-acc-description] [fixture:
c4/db-grid-keyword-classdef-acc-description] [fixture:
c4/db-grid-keyword-columns-acc-description] [fixture:
c4/db-grid-keyword-end-acc-description] [fixture:
c4/db-grid-keyword-header-acc-description] [fixture:
c4/db-grid-keyword-space-acc-description] [fixture:
c4/db-grid-keyword-style-acc-description] [fixture:
c4/db-grid-keyword-acc-title] [fixture: c4/db-grid-keyword-block-acc-title]
[fixture: c4/db-grid-keyword-class-acc-title] [fixture:
c4/db-grid-keyword-classdef-acc-title] [fixture:
c4/db-grid-keyword-columns-acc-title] [fixture:
c4/db-grid-keyword-end-acc-title] [fixture: c4/db-grid-keyword-header-acc-title]
[fixture: c4/db-grid-keyword-space-acc-title] [fixture:
c4/db-grid-keyword-style-acc-title] [fixture: c4/db-grid-keyword-acc-descr]
[fixture: c4/db-grid-keyword-block-acc-descr] [fixture:
c4/db-grid-keyword-class-acc-descr] [fixture:
c4/db-grid-keyword-classdef-acc-descr] [fixture:
c4/db-grid-keyword-columns-acc-descr] [fixture:
c4/db-grid-keyword-end-acc-descr] [fixture: c4/db-grid-keyword-header-acc-descr]
[fixture: c4/db-grid-keyword-space-acc-descr] [fixture:
c4/db-grid-keyword-style-acc-descr] [fixture:
c4/db-grid-keyword-acc-descr-block] [fixture:
c4/db-grid-keyword-block-acc-descr-block] [fixture:
c4/db-grid-keyword-class-acc-descr-block] [fixture:
c4/db-grid-keyword-classdef-acc-descr-block] [fixture:
c4/db-grid-keyword-columns-acc-descr-block] [fixture:
c4/db-grid-keyword-end-acc-descr-block] [fixture:
c4/db-grid-keyword-header-acc-descr-block] [fixture:
c4/db-grid-keyword-space-acc-descr-block] [fixture:
c4/db-grid-keyword-style-acc-descr-block] [fixture:
c4/db-grid-keyword-text-argument-bare] [fixture:
c4/db-grid-keyword-block-text-argument-bare] [fixture:
c4/db-grid-keyword-class-text-argument-bare] [fixture:
c4/db-grid-keyword-classdef-text-argument-bare] [fixture:
c4/db-grid-keyword-columns-text-argument-bare] [fixture:
c4/db-grid-keyword-end-text-argument-bare] [fixture:
c4/db-grid-keyword-header-text-argument-bare] [fixture:
c4/db-grid-keyword-space-text-argument-bare] [fixture:
c4/db-grid-keyword-style-text-argument-bare] [fixture:
c4/db-grid-keyword-alias-argument-bare] [fixture:
c4/db-grid-keyword-block-alias-argument-bare] [fixture:
c4/db-grid-keyword-class-alias-argument-bare] [fixture:
c4/db-grid-keyword-classdef-alias-argument-bare] [fixture:
c4/db-grid-keyword-columns-alias-argument-bare] [fixture:
c4/db-grid-keyword-end-alias-argument-bare] [fixture:
c4/db-grid-keyword-header-alias-argument-bare] [fixture:
c4/db-grid-keyword-space-alias-argument-bare] [fixture:
c4/db-grid-keyword-style-alias-argument-bare] [fixture:
c4/db-grid-keyword-plain-argument-bare] [fixture:
c4/db-grid-keyword-block-plain-argument-bare] [fixture:
c4/db-grid-keyword-class-plain-argument-bare] [fixture:
c4/db-grid-keyword-classdef-plain-argument-bare] [fixture:
c4/db-grid-keyword-columns-plain-argument-bare] [fixture:
c4/db-grid-keyword-end-plain-argument-bare] [fixture:
c4/db-grid-keyword-header-plain-argument-bare] [fixture:
c4/db-grid-keyword-space-plain-argument-bare] [fixture:
c4/db-grid-keyword-style-plain-argument-bare] [fixture:
c4/db-grid-keyword-text-argument-quoted] [fixture:
c4/db-grid-keyword-block-text-argument-quoted] [fixture:
c4/db-grid-keyword-class-text-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-text-argument-quoted] [fixture:
c4/db-grid-keyword-columns-text-argument-quoted] [fixture:
c4/db-grid-keyword-end-text-argument-quoted] [fixture:
c4/db-grid-keyword-header-text-argument-quoted] [fixture:
c4/db-grid-keyword-space-text-argument-quoted] [fixture:
c4/db-grid-keyword-style-text-argument-quoted] [fixture:
c4/db-grid-keyword-alias-argument-quoted] [fixture:
c4/db-grid-keyword-block-alias-argument-quoted] [fixture:
c4/db-grid-keyword-class-alias-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-alias-argument-quoted] [fixture:
c4/db-grid-keyword-columns-alias-argument-quoted] [fixture:
c4/db-grid-keyword-end-alias-argument-quoted] [fixture:
c4/db-grid-keyword-header-alias-argument-quoted] [fixture:
c4/db-grid-keyword-space-alias-argument-quoted] [fixture:
c4/db-grid-keyword-style-alias-argument-quoted] [fixture:
c4/db-grid-keyword-plain-argument-quoted] [fixture:
c4/db-grid-keyword-block-plain-argument-quoted] [fixture:
c4/db-grid-keyword-class-plain-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-plain-argument-quoted] [fixture:
c4/db-grid-keyword-columns-plain-argument-quoted] [fixture:
c4/db-grid-keyword-end-plain-argument-quoted] [fixture:
c4/db-grid-keyword-header-plain-argument-quoted] [fixture:
c4/db-grid-keyword-space-plain-argument-quoted] [fixture:
c4/db-grid-keyword-style-plain-argument-quoted] [fixture:
c4/db-grid-keyword-named-key] [fixture: c4/db-grid-keyword-block-named-key]
[fixture: c4/db-grid-keyword-class-named-key] [fixture:
c4/db-grid-keyword-classdef-named-key] [fixture:
c4/db-grid-keyword-columns-named-key] [fixture:
c4/db-grid-keyword-end-named-key] [fixture: c4/db-grid-keyword-header-named-key]
[fixture: c4/db-grid-keyword-space-named-key] [fixture:
c4/db-grid-keyword-style-named-key] [fixture: c4/db-grid-keyword-named-value]
[fixture: c4/db-grid-keyword-block-named-value] [fixture:
c4/db-grid-keyword-class-named-value] [fixture:
c4/db-grid-keyword-classdef-named-value] [fixture:
c4/db-grid-keyword-columns-named-value] [fixture:
c4/db-grid-keyword-end-named-value] [fixture:
c4/db-grid-keyword-header-named-value] [fixture:
c4/db-grid-keyword-space-named-value] [fixture:
c4/db-grid-keyword-style-named-value] [fixture: c4/db-grid-keyword-style-value]
[fixture: c4/db-grid-keyword-block-style-value] [fixture:
c4/db-grid-keyword-class-style-value] [fixture:
c4/db-grid-keyword-classdef-style-value] [fixture:
c4/db-grid-keyword-columns-style-value] [fixture:
c4/db-grid-keyword-end-style-value] [fixture:
c4/db-grid-keyword-header-style-value] [fixture:
c4/db-grid-keyword-space-style-value] [fixture:
c4/db-grid-keyword-style-style-value] [fixture: c4/spec-c4-diagram-e515e297]

Arrows, hyphens, parentheses, square brackets, opening braces, angle brackets,
colons, pipes, percent signs, single quotes, backslashes, and backticks are kept
inside text values and named keys. [fixture: c4/db-grid-arrow-title] [fixture:
c4/db-grid-arrow-spaced-title] [fixture: c4/db-grid-backslash-title] [fixture:
c4/db-grid-backtick-title] [fixture: c4/db-grid-close-round-title] [fixture:
c4/db-grid-close-square-title] [fixture: c4/db-grid-colon-title] [fixture:
c4/db-grid-dash-title] [fixture: c4/db-grid-greater-than-title] [fixture:
c4/db-grid-less-than-title] [fixture: c4/db-grid-open-brace-title] [fixture:
c4/db-grid-open-round-title] [fixture: c4/db-grid-open-square-title] [fixture:
c4/db-grid-percent-title] [fixture: c4/db-grid-pipe-title] [fixture:
c4/db-grid-single-quote-title] [fixture: c4/db-grid-arrow-acc-description]
[fixture: c4/db-grid-arrow-spaced-acc-description] [fixture:
c4/db-grid-backslash-acc-description] [fixture:
c4/db-grid-backtick-acc-description] [fixture:
c4/db-grid-close-round-acc-description] [fixture:
c4/db-grid-close-square-acc-description] [fixture:
c4/db-grid-colon-acc-description] [fixture: c4/db-grid-dash-acc-description]
[fixture: c4/db-grid-greater-than-acc-description] [fixture:
c4/db-grid-less-than-acc-description] [fixture:
c4/db-grid-open-brace-acc-description] [fixture:
c4/db-grid-open-round-acc-description] [fixture:
c4/db-grid-open-square-acc-description] [fixture:
c4/db-grid-percent-acc-description] [fixture: c4/db-grid-pipe-acc-description]
[fixture: c4/db-grid-single-quote-acc-description] [fixture:
c4/db-grid-arrow-acc-title] [fixture: c4/db-grid-arrow-spaced-acc-title]
[fixture: c4/db-grid-backslash-acc-title] [fixture:
c4/db-grid-backtick-acc-title] [fixture: c4/db-grid-close-round-acc-title]
[fixture: c4/db-grid-close-square-acc-title] [fixture:
c4/db-grid-colon-acc-title] [fixture: c4/db-grid-dash-acc-title] [fixture:
c4/db-grid-greater-than-acc-title] [fixture: c4/db-grid-less-than-acc-title]
[fixture: c4/db-grid-open-brace-acc-title] [fixture:
c4/db-grid-open-round-acc-title] [fixture: c4/db-grid-open-square-acc-title]
[fixture: c4/db-grid-percent-acc-title] [fixture: c4/db-grid-pipe-acc-title]
[fixture: c4/db-grid-single-quote-acc-title] [fixture:
c4/db-grid-arrow-acc-descr] [fixture: c4/db-grid-arrow-spaced-acc-descr]
[fixture: c4/db-grid-backslash-acc-descr] [fixture:
c4/db-grid-backtick-acc-descr] [fixture: c4/db-grid-close-round-acc-descr]
[fixture: c4/db-grid-close-square-acc-descr] [fixture:
c4/db-grid-colon-acc-descr] [fixture: c4/db-grid-dash-acc-descr] [fixture:
c4/db-grid-greater-than-acc-descr] [fixture: c4/db-grid-less-than-acc-descr]
[fixture: c4/db-grid-open-brace-acc-descr] [fixture:
c4/db-grid-open-round-acc-descr] [fixture: c4/db-grid-open-square-acc-descr]
[fixture: c4/db-grid-percent-acc-descr] [fixture: c4/db-grid-pipe-acc-descr]
[fixture: c4/db-grid-single-quote-acc-descr] [fixture:
c4/db-grid-arrow-acc-descr-block] [fixture:
c4/db-grid-arrow-spaced-acc-descr-block] [fixture:
c4/db-grid-backslash-acc-descr-block] [fixture:
c4/db-grid-backtick-acc-descr-block] [fixture:
c4/db-grid-close-round-acc-descr-block] [fixture:
c4/db-grid-close-square-acc-descr-block] [fixture:
c4/db-grid-colon-acc-descr-block] [fixture: c4/db-grid-dash-acc-descr-block]
[fixture: c4/db-grid-greater-than-acc-descr-block] [fixture:
c4/db-grid-less-than-acc-descr-block] [fixture:
c4/db-grid-open-brace-acc-descr-block] [fixture:
c4/db-grid-open-round-acc-descr-block] [fixture:
c4/db-grid-open-square-acc-descr-block] [fixture:
c4/db-grid-percent-acc-descr-block] [fixture: c4/db-grid-pipe-acc-descr-block]
[fixture: c4/db-grid-single-quote-acc-descr-block] [fixture:
c4/db-grid-arrow-text-argument-bare] [fixture:
c4/db-grid-arrow-spaced-text-argument-bare] [fixture:
c4/db-grid-backslash-text-argument-bare] [fixture:
c4/db-grid-backtick-text-argument-bare] [fixture:
c4/db-grid-close-round-text-argument-bare] [fixture:
c4/db-grid-close-square-text-argument-bare] [fixture:
c4/db-grid-colon-text-argument-bare] [fixture:
c4/db-grid-dash-text-argument-bare] [fixture:
c4/db-grid-greater-than-text-argument-bare] [fixture:
c4/db-grid-less-than-text-argument-bare] [fixture:
c4/db-grid-open-brace-text-argument-bare] [fixture:
c4/db-grid-open-round-text-argument-bare] [fixture:
c4/db-grid-open-square-text-argument-bare] [fixture:
c4/db-grid-percent-text-argument-bare] [fixture:
c4/db-grid-pipe-text-argument-bare] [fixture:
c4/db-grid-single-quote-text-argument-bare] [fixture:
c4/db-grid-arrow-alias-argument-bare] [fixture:
c4/db-grid-arrow-spaced-alias-argument-bare] [fixture:
c4/db-grid-backslash-alias-argument-bare] [fixture:
c4/db-grid-backtick-alias-argument-bare] [fixture:
c4/db-grid-close-round-alias-argument-bare] [fixture:
c4/db-grid-close-square-alias-argument-bare] [fixture:
c4/db-grid-colon-alias-argument-bare] [fixture:
c4/db-grid-dash-alias-argument-bare] [fixture:
c4/db-grid-greater-than-alias-argument-bare] [fixture:
c4/db-grid-less-than-alias-argument-bare] [fixture:
c4/db-grid-open-brace-alias-argument-bare] [fixture:
c4/db-grid-open-round-alias-argument-bare] [fixture:
c4/db-grid-open-square-alias-argument-bare] [fixture:
c4/db-grid-percent-alias-argument-bare] [fixture:
c4/db-grid-pipe-alias-argument-bare] [fixture:
c4/db-grid-single-quote-alias-argument-bare] [fixture:
c4/db-grid-arrow-plain-argument-bare] [fixture:
c4/db-grid-arrow-spaced-plain-argument-bare] [fixture:
c4/db-grid-backslash-plain-argument-bare] [fixture:
c4/db-grid-backtick-plain-argument-bare] [fixture:
c4/db-grid-close-round-plain-argument-bare] [fixture:
c4/db-grid-close-square-plain-argument-bare] [fixture:
c4/db-grid-colon-plain-argument-bare] [fixture:
c4/db-grid-dash-plain-argument-bare] [fixture:
c4/db-grid-greater-than-plain-argument-bare] [fixture:
c4/db-grid-less-than-plain-argument-bare] [fixture:
c4/db-grid-open-brace-plain-argument-bare] [fixture:
c4/db-grid-open-round-plain-argument-bare] [fixture:
c4/db-grid-open-square-plain-argument-bare] [fixture:
c4/db-grid-percent-plain-argument-bare] [fixture:
c4/db-grid-pipe-plain-argument-bare] [fixture:
c4/db-grid-single-quote-plain-argument-bare] [fixture:
c4/db-grid-arrow-text-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-text-argument-quoted] [fixture:
c4/db-grid-backslash-text-argument-quoted] [fixture:
c4/db-grid-backtick-text-argument-quoted] [fixture:
c4/db-grid-close-round-text-argument-quoted] [fixture:
c4/db-grid-close-square-text-argument-quoted] [fixture:
c4/db-grid-colon-text-argument-quoted] [fixture:
c4/db-grid-dash-text-argument-quoted] [fixture:
c4/db-grid-greater-than-text-argument-quoted] [fixture:
c4/db-grid-less-than-text-argument-quoted] [fixture:
c4/db-grid-open-brace-text-argument-quoted] [fixture:
c4/db-grid-open-round-text-argument-quoted] [fixture:
c4/db-grid-open-square-text-argument-quoted] [fixture:
c4/db-grid-percent-text-argument-quoted] [fixture:
c4/db-grid-pipe-text-argument-quoted] [fixture:
c4/db-grid-single-quote-text-argument-quoted] [fixture:
c4/db-grid-arrow-alias-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-alias-argument-quoted] [fixture:
c4/db-grid-backslash-alias-argument-quoted] [fixture:
c4/db-grid-backtick-alias-argument-quoted] [fixture:
c4/db-grid-close-round-alias-argument-quoted] [fixture:
c4/db-grid-close-square-alias-argument-quoted] [fixture:
c4/db-grid-colon-alias-argument-quoted] [fixture:
c4/db-grid-dash-alias-argument-quoted] [fixture:
c4/db-grid-greater-than-alias-argument-quoted] [fixture:
c4/db-grid-less-than-alias-argument-quoted] [fixture:
c4/db-grid-open-brace-alias-argument-quoted] [fixture:
c4/db-grid-open-round-alias-argument-quoted] [fixture:
c4/db-grid-open-square-alias-argument-quoted] [fixture:
c4/db-grid-percent-alias-argument-quoted] [fixture:
c4/db-grid-pipe-alias-argument-quoted] [fixture:
c4/db-grid-single-quote-alias-argument-quoted] [fixture:
c4/db-grid-arrow-plain-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-plain-argument-quoted] [fixture:
c4/db-grid-backslash-plain-argument-quoted] [fixture:
c4/db-grid-backtick-plain-argument-quoted] [fixture:
c4/db-grid-close-round-plain-argument-quoted] [fixture:
c4/db-grid-close-square-plain-argument-quoted] [fixture:
c4/db-grid-colon-plain-argument-quoted] [fixture:
c4/db-grid-dash-plain-argument-quoted] [fixture:
c4/db-grid-greater-than-plain-argument-quoted] [fixture:
c4/db-grid-less-than-plain-argument-quoted] [fixture:
c4/db-grid-open-brace-plain-argument-quoted] [fixture:
c4/db-grid-open-round-plain-argument-quoted] [fixture:
c4/db-grid-open-square-plain-argument-quoted] [fixture:
c4/db-grid-percent-plain-argument-quoted] [fixture:
c4/db-grid-pipe-plain-argument-quoted] [fixture:
c4/db-grid-single-quote-plain-argument-quoted] [fixture:
c4/db-grid-arrow-named-key] [fixture: c4/db-grid-arrow-spaced-named-key]
[fixture: c4/db-grid-backslash-named-key] [fixture:
c4/db-grid-backtick-named-key] [fixture: c4/db-grid-close-round-named-key]
[fixture: c4/db-grid-close-square-named-key] [fixture:
c4/db-grid-colon-named-key] [fixture: c4/db-grid-dash-named-key] [fixture:
c4/db-grid-greater-than-named-key] [fixture: c4/db-grid-less-than-named-key]
[fixture: c4/db-grid-open-brace-named-key] [fixture:
c4/db-grid-open-round-named-key] [fixture: c4/db-grid-open-square-named-key]
[fixture: c4/db-grid-percent-named-key] [fixture: c4/db-grid-pipe-named-key]
[fixture: c4/db-grid-single-quote-named-key] [fixture:
c4/db-grid-arrow-named-value] [fixture: c4/db-grid-arrow-spaced-named-value]
[fixture: c4/db-grid-backslash-named-value] [fixture:
c4/db-grid-backtick-named-value] [fixture: c4/db-grid-close-round-named-value]
[fixture: c4/db-grid-close-square-named-value] [fixture:
c4/db-grid-colon-named-value] [fixture: c4/db-grid-dash-named-value] [fixture:
c4/db-grid-greater-than-named-value] [fixture: c4/db-grid-less-than-named-value]
[fixture: c4/db-grid-open-brace-named-value] [fixture:
c4/db-grid-open-round-named-value] [fixture: c4/db-grid-open-square-named-value]
[fixture: c4/db-grid-percent-named-value] [fixture: c4/db-grid-pipe-named-value]
[fixture: c4/db-grid-single-quote-named-value] [fixture:
c4/db-grid-arrow-style-value] [fixture: c4/db-grid-arrow-spaced-style-value]
[fixture: c4/db-grid-backslash-style-value] [fixture:
c4/db-grid-backtick-style-value] [fixture: c4/db-grid-close-round-style-value]
[fixture: c4/db-grid-close-square-style-value] [fixture:
c4/db-grid-colon-style-value] [fixture: c4/db-grid-dash-style-value] [fixture:
c4/db-grid-greater-than-style-value] [fixture: c4/db-grid-less-than-style-value]
[fixture: c4/db-grid-open-brace-style-value] [fixture:
c4/db-grid-open-round-style-value] [fixture: c4/db-grid-open-square-style-value]
[fixture: c4/db-grid-percent-style-value] [fixture: c4/db-grid-pipe-style-value]
[fixture: c4/db-grid-single-quote-style-value]

A closing brace stays literal in arguments, keys, and line texts, but ends an
accDescr block and leaves any following text to the statement grammar. [fixture:
c4/db-grid-close-brace-title] [fixture: c4/db-grid-close-brace-acc-description]
[fixture: c4/db-grid-close-brace-acc-title] [fixture:
c4/db-grid-close-brace-acc-descr] [fixture:
c4/db-grid-close-brace-text-argument-bare] [fixture:
c4/db-grid-close-brace-alias-argument-bare] [fixture:
c4/db-grid-close-brace-plain-argument-bare] [fixture:
c4/db-grid-close-brace-text-argument-quoted] [fixture:
c4/db-grid-close-brace-alias-argument-quoted] [fixture:
c4/db-grid-close-brace-plain-argument-quoted] [fixture:
c4/db-grid-close-brace-named-key] [fixture: c4/db-grid-close-brace-named-value]
[fixture: c4/db-grid-close-brace-style-value] [fixture:
c4/gram-grid-close-brace-acc-descr-block] [fixture:
c4/gram-acc-descr-block-braces-inside] [fixture:
c4/gram-acc-descr-block-after-text-braces-inside]

Commas and punctuation containing commas stay literal in quoted arguments, named
values, title and accessibility text; commas also stay in named keys. [fixture:
c4/db-grid-comma-title] [fixture: c4/db-grid-comma-acc-description] [fixture:
c4/db-grid-comma-acc-title] [fixture: c4/db-grid-comma-acc-descr] [fixture:
c4/db-grid-comma-acc-descr-block] [fixture:
c4/db-grid-comma-text-argument-quoted] [fixture:
c4/db-grid-comma-alias-argument-quoted] [fixture:
c4/db-grid-comma-plain-argument-quoted] [fixture: c4/db-grid-comma-named-key]
[fixture: c4/db-grid-comma-named-value] [fixture: c4/db-grid-comma-style-value]
[fixture: c4/db-grid-punct-title] [fixture: c4/db-grid-punct-acc-description]
[fixture: c4/db-grid-punct-acc-title] [fixture: c4/db-grid-punct-acc-descr]
[fixture: c4/db-grid-punct-acc-descr-block] [fixture:
c4/db-grid-punct-text-argument-quoted] [fixture:
c4/db-grid-punct-alias-argument-quoted] [fixture:
c4/db-grid-punct-plain-argument-quoted] [fixture: c4/db-grid-punct-named-value]
[fixture: c4/db-grid-punct-style-value]

An equals sign outside a named-key delimiter is kept in text. [fixture:
c4/db-grid-equals-title] [fixture: c4/db-grid-equals-acc-description] [fixture:
c4/db-grid-equals-acc-title] [fixture: c4/db-grid-equals-acc-descr] [fixture:
c4/db-grid-equals-acc-descr-block] [fixture:
c4/db-grid-equals-text-argument-bare] [fixture:
c4/db-grid-equals-alias-argument-bare] [fixture:
c4/db-grid-equals-plain-argument-bare] [fixture:
c4/db-grid-equals-text-argument-quoted] [fixture:
c4/db-grid-equals-alias-argument-quoted] [fixture:
c4/db-grid-equals-plain-argument-quoted] [fixture:
c4/db-grid-equals-named-value] [fixture: c4/db-grid-equals-style-value]

A double quote stays literal inside a bare argument, a named key, a title, or
accessibility text. [fixture: c4/db-grid-quote-title] [fixture:
c4/db-grid-quote-acc-description] [fixture: c4/db-grid-quote-acc-title]
[fixture: c4/db-grid-quote-acc-descr] [fixture:
c4/db-grid-quote-acc-descr-block] [fixture: c4/db-grid-quote-text-argument-bare]
[fixture: c4/db-grid-quote-alias-argument-bare] [fixture:
c4/db-grid-quote-plain-argument-bare] [fixture: c4/db-grid-quote-named-key]
[fixture: c4/db-title-quotes] [fixture: c4/db-acctitle-quotes] [fixture:
c4/db-accdescription-quotes] [fixture: c4/db-accdescr-quotes]

LF is kept inside arguments, named keys and values, and description blocks; CR
and CRLF there become LF before the Db reads them. [fixture:
c4/db-grid-cr-acc-descr-block] [fixture: c4/db-grid-crlf-acc-descr-block]
[fixture: c4/db-grid-lf-acc-descr-block] [fixture:
c4/db-grid-cr-text-argument-bare] [fixture: c4/db-grid-crlf-text-argument-bare]
[fixture: c4/db-grid-lf-text-argument-bare] [fixture:
c4/db-grid-cr-alias-argument-bare] [fixture:
c4/db-grid-crlf-alias-argument-bare] [fixture:
c4/db-grid-lf-alias-argument-bare] [fixture: c4/db-grid-cr-plain-argument-bare]
[fixture: c4/db-grid-crlf-plain-argument-bare] [fixture:
c4/db-grid-lf-plain-argument-bare] [fixture: c4/db-grid-cr-text-argument-quoted]
[fixture: c4/db-grid-crlf-text-argument-quoted] [fixture:
c4/db-grid-lf-text-argument-quoted] [fixture:
c4/db-grid-cr-alias-argument-quoted] [fixture:
c4/db-grid-crlf-alias-argument-quoted] [fixture:
c4/db-grid-lf-alias-argument-quoted] [fixture:
c4/db-grid-cr-plain-argument-quoted] [fixture:
c4/db-grid-crlf-plain-argument-quoted] [fixture:
c4/db-grid-lf-plain-argument-quoted] [fixture: c4/db-grid-cr-named-key]
[fixture: c4/db-grid-crlf-named-key] [fixture: c4/db-grid-lf-named-key]
[fixture: c4/db-grid-cr-named-value] [fixture: c4/db-grid-crlf-named-value]
[fixture: c4/db-grid-lf-named-value] [fixture: c4/db-grid-cr-style-value]
[fixture: c4/db-grid-crlf-style-value] [fixture: c4/db-grid-lf-style-value]

An LF inside title, accDescription, accTitle, or accDescr line text ends that
value, and the leftover bare word in these inputs is rejected. [fixture:
c4/gram-grid-comment-line-title] [fixture: c4/gram-grid-cr-title] [fixture:
c4/gram-grid-crlf-title] [fixture: c4/gram-grid-directive-line-title] [fixture:
c4/gram-grid-lf-title] [fixture: c4/gram-grid-comment-line-acc-description]
[fixture: c4/gram-grid-cr-acc-description] [fixture:
c4/gram-grid-crlf-acc-description] [fixture:
c4/gram-grid-directive-line-acc-description] [fixture:
c4/gram-grid-lf-acc-description] [fixture: c4/gram-grid-comment-line-acc-title]
[fixture: c4/gram-grid-cr-acc-title] [fixture: c4/gram-grid-crlf-acc-title]
[fixture: c4/gram-grid-directive-line-acc-title] [fixture:
c4/gram-grid-lf-acc-title] [fixture: c4/gram-grid-comment-line-acc-descr]
[fixture: c4/gram-grid-cr-acc-descr] [fixture: c4/gram-grid-crlf-acc-descr]
[fixture: c4/gram-grid-directive-line-acc-descr] [fixture:
c4/gram-grid-lf-acc-descr]

A closed directive is removed even inside a header, keyword, title, argument,
named key, or named value. [fixture: c4/db-grid-directive-title] [fixture:
c4/db-grid-directive-acc-description] [fixture: c4/db-grid-directive-acc-title]
[fixture: c4/db-grid-directive-acc-descr] [fixture:
c4/db-grid-directive-acc-descr-block] [fixture:
c4/db-grid-directive-text-argument-bare] [fixture:
c4/db-grid-directive-alias-argument-bare] [fixture:
c4/db-grid-directive-plain-argument-bare] [fixture:
c4/db-grid-directive-text-argument-quoted] [fixture:
c4/db-grid-directive-alias-argument-quoted] [fixture:
c4/db-grid-directive-plain-argument-quoted] [fixture:
c4/db-grid-directive-named-key] [fixture: c4/db-grid-directive-named-value]
[fixture: c4/db-grid-directive-style-value] [fixture: c4/div-directive-header]
[fixture: c4/div-acc-title-directive] [fixture:
c4/div-acc-block-marker-directive] [fixture: c4/lex-directive-keyword] [fixture:
c4/lex-directive-bare-alias] [fixture: c4/lex-directive-named-key] [fixture:
c4/lex-directive-named-equals-quote] [fixture: c4/lex-directive-quoted]
[fixture: c4/lex-title-directive-value] [fixture: c4/lex-directive-line]
[fixture: c4/lex-directive-start] [fixture: c4/lex-directive-end]

Removing a directive on its own line leaves the surrounding line feeds in
arguments and named keys and values, while the accDescr setter folds consecutive
whitespace after an LF. [fixture: c4/db-grid-directive-line-text-argument-bare]
[fixture: c4/db-grid-directive-line-alias-argument-bare] [fixture:
c4/db-grid-directive-line-plain-argument-bare] [fixture:
c4/db-grid-directive-line-text-argument-quoted] [fixture:
c4/db-grid-directive-line-alias-argument-quoted] [fixture:
c4/db-grid-directive-line-plain-argument-quoted] [fixture:
c4/db-grid-directive-line-named-key] [fixture:
c4/db-grid-directive-line-named-value] [fixture:
c4/db-grid-directive-line-style-value] [fixture:
c4/db-grid-directive-line-acc-descr-block] [fixture: c4/lex-bare-crlf-directive]
[fixture: c4/lex-quote-crlf-directive]

A comment line inside an argument, named key or value, or description block is
removed, joining the surrounding text with one LF. [fixture:
c4/db-grid-comment-line-acc-descr-block] [fixture:
c4/db-grid-comment-line-text-argument-bare] [fixture:
c4/db-grid-comment-line-alias-argument-bare] [fixture:
c4/db-grid-comment-line-plain-argument-bare] [fixture:
c4/db-grid-comment-line-text-argument-quoted] [fixture:
c4/db-grid-comment-line-alias-argument-quoted] [fixture:
c4/db-grid-comment-line-plain-argument-quoted] [fixture:
c4/db-grid-comment-line-named-key] [fixture:
c4/db-grid-comment-line-named-value] [fixture:
c4/db-grid-comment-line-style-value] [fixture: c4/lex-bare-comment-line]
[fixture: c4/lex-named-value-comment-line] [fixture: c4/lex-comment-line]

An inline percent-pair fragment inside a text value or named key stays literal,
as does a bare percent-pair line inside a longer bare argument. [fixture:
c4/db-grid-comment-title] [fixture: c4/db-grid-comment-acc-description]
[fixture: c4/db-grid-comment-acc-title] [fixture: c4/db-grid-comment-acc-descr]
[fixture: c4/db-grid-comment-acc-descr-block] [fixture:
c4/db-grid-comment-text-argument-bare] [fixture:
c4/db-grid-comment-alias-argument-bare] [fixture:
c4/db-grid-comment-plain-argument-bare] [fixture:
c4/db-grid-comment-text-argument-quoted] [fixture:
c4/db-grid-comment-alias-argument-quoted] [fixture:
c4/db-grid-comment-plain-argument-quoted] [fixture:
c4/db-grid-comment-named-key] [fixture: c4/db-grid-comment-named-value]
[fixture: c4/db-grid-comment-style-value] [fixture:
c4/lex-bare-multiple-line-comment] [fixture: c4/lex-comment-inline] [fixture:
c4/db-title-comment] [fixture: c4/db-acctitle-comment] [fixture:
c4/db-accdescription-comment] [fixture: c4/db-accdescr-comment]

Hashes and semicolons stay literal in arguments, named keys and values,
colon-line accessibility text and description blocks. [fixture:
c4/db-grid-hash-acc-title] [fixture: c4/db-grid-semicolon-acc-title] [fixture:
c4/db-grid-hash-acc-descr] [fixture: c4/db-grid-semicolon-acc-descr] [fixture:
c4/db-grid-hash-acc-descr-block] [fixture: c4/db-grid-semicolon-acc-descr-block]
[fixture: c4/db-grid-hash-text-argument-bare] [fixture:
c4/db-grid-semicolon-text-argument-bare] [fixture:
c4/db-grid-hash-alias-argument-bare] [fixture:
c4/db-grid-semicolon-alias-argument-bare] [fixture:
c4/db-grid-hash-plain-argument-bare] [fixture:
c4/db-grid-semicolon-plain-argument-bare] [fixture:
c4/db-grid-hash-text-argument-quoted] [fixture:
c4/db-grid-semicolon-text-argument-quoted] [fixture:
c4/db-grid-hash-alias-argument-quoted] [fixture:
c4/db-grid-semicolon-alias-argument-quoted] [fixture:
c4/db-grid-hash-plain-argument-quoted] [fixture:
c4/db-grid-semicolon-plain-argument-quoted] [fixture: c4/db-grid-hash-named-key]
[fixture: c4/db-grid-semicolon-named-key] [fixture: c4/db-grid-hash-named-value]
[fixture: c4/db-grid-semicolon-named-value] [fixture:
c4/db-grid-hash-style-value] [fixture: c4/db-grid-semicolon-style-value]
[fixture: c4/db-acctitle-hash] [fixture: c4/db-accdescr-hash] [fixture:
c4/db-acctitle-semicolon] [fixture: c4/db-accdescr-semicolon]

A hash or semicolon ends title and accDescription text, so a following bare
fragment, including the tail of `&amp;`, is rejected. [fixture:
c4/gram-grid-ampersand-entity-title] [fixture: c4/gram-grid-hash-title]
[fixture: c4/gram-grid-semicolon-title] [fixture:
c4/gram-grid-ampersand-entity-acc-description] [fixture:
c4/gram-grid-hash-acc-description] [fixture:
c4/gram-grid-semicolon-acc-description] [fixture: c4/lex-title-hash-first]
[fixture: c4/lex-title-semicolon-selected] [fixture:
c4/lex-title-single-space-eof] [fixture: c4/db-title-hash] [fixture:
c4/db-accdescription-hash] [fixture: c4/db-title-semicolon] [fixture:
c4/db-accdescription-semicolon]

HTML-style `&amp;` stays literal in arguments, named keys and values, colon-line
accessibility text and description blocks. [fixture:
c4/db-grid-ampersand-entity-acc-title] [fixture:
c4/db-grid-ampersand-entity-acc-descr] [fixture:
c4/db-grid-ampersand-entity-acc-descr-block] [fixture:
c4/db-grid-ampersand-entity-text-argument-bare] [fixture:
c4/db-grid-ampersand-entity-alias-argument-bare] [fixture:
c4/db-grid-ampersand-entity-plain-argument-bare] [fixture:
c4/db-grid-ampersand-entity-text-argument-quoted] [fixture:
c4/db-grid-ampersand-entity-alias-argument-quoted] [fixture:
c4/db-grid-ampersand-entity-plain-argument-quoted] [fixture:
c4/db-grid-ampersand-entity-named-key] [fixture:
c4/db-grid-ampersand-entity-named-value] [fixture:
c4/db-grid-ampersand-entity-style-value]

Mermaid character references are kept as placeholders: `#N;` becomes
`\ufb02\u00b0\u00b0N\u00b6\u00df`, and `#name;` becomes
`\ufb02\u00b0name\u00b6\u00df`. [fixture: c4/db-grid-entity-title] [fixture:
c4/db-grid-entity-named-title] [fixture: c4/db-grid-entity-acc-description]
[fixture: c4/db-grid-entity-named-acc-description] [fixture:
c4/db-grid-entity-acc-title] [fixture: c4/db-grid-entity-named-acc-title]
[fixture: c4/db-grid-entity-acc-descr] [fixture:
c4/db-grid-entity-named-acc-descr] [fixture: c4/db-grid-entity-acc-descr-block]
[fixture: c4/db-grid-entity-named-acc-descr-block] [fixture:
c4/db-grid-entity-text-argument-bare] [fixture:
c4/db-grid-entity-named-text-argument-bare] [fixture:
c4/db-grid-entity-alias-argument-bare] [fixture:
c4/db-grid-entity-named-alias-argument-bare] [fixture:
c4/db-grid-entity-plain-argument-bare] [fixture:
c4/db-grid-entity-named-plain-argument-bare] [fixture:
c4/db-grid-entity-text-argument-quoted] [fixture:
c4/db-grid-entity-named-text-argument-quoted] [fixture:
c4/db-grid-entity-alias-argument-quoted] [fixture:
c4/db-grid-entity-named-alias-argument-quoted] [fixture:
c4/db-grid-entity-plain-argument-quoted] [fixture:
c4/db-grid-entity-named-plain-argument-quoted] [fixture:
c4/db-grid-entity-named-key] [fixture: c4/db-grid-entity-named-named-key]
[fixture: c4/db-grid-entity-named-value] [fixture:
c4/db-grid-entity-named-named-value] [fixture: c4/db-grid-entity-style-value]
[fixture: c4/db-grid-entity-named-style-value] [fixture: c4/db-title-entity]
[fixture: c4/db-acctitle-entity] [fixture: c4/db-accdescription-entity]
[fixture: c4/db-accdescr-entity]

HTML tag and break fragments stay in the stored text rather than being
interpreted as C4 syntax. [fixture: c4/db-grid-html-title] [fixture:
c4/db-grid-html-br-title] [fixture: c4/db-grid-html-acc-description] [fixture:
c4/db-grid-html-br-acc-description] [fixture: c4/db-grid-html-acc-title]
[fixture: c4/db-grid-html-br-acc-title] [fixture: c4/db-grid-html-acc-descr]
[fixture: c4/db-grid-html-br-acc-descr] [fixture:
c4/db-grid-html-acc-descr-block] [fixture: c4/db-grid-html-br-acc-descr-block]
[fixture: c4/db-grid-html-text-argument-bare] [fixture:
c4/db-grid-html-br-text-argument-bare] [fixture:
c4/db-grid-html-alias-argument-bare] [fixture:
c4/db-grid-html-br-alias-argument-bare] [fixture:
c4/db-grid-html-plain-argument-bare] [fixture:
c4/db-grid-html-br-plain-argument-bare] [fixture:
c4/db-grid-html-text-argument-quoted] [fixture:
c4/db-grid-html-br-text-argument-quoted] [fixture:
c4/db-grid-html-alias-argument-quoted] [fixture:
c4/db-grid-html-br-alias-argument-quoted] [fixture:
c4/db-grid-html-plain-argument-quoted] [fixture:
c4/db-grid-html-br-plain-argument-quoted] [fixture: c4/db-grid-html-named-key]
[fixture: c4/db-grid-html-br-named-key] [fixture: c4/db-grid-html-named-value]
[fixture: c4/db-grid-html-br-named-value] [fixture: c4/db-grid-html-style-value]
[fixture: c4/db-grid-html-br-style-value] [fixture: c4/db-title-html] [fixture:
c4/db-acctitle-html] [fixture: c4/db-accdescription-html] [fixture:
c4/db-accdescr-html] [fixture: c4/demo-c4context-1d531a27] [fixture:
c4/docs-syntax-c4-90f106b9] [fixture: c4/docs-syntax-c4-bc80e69a]

Double quotes inside HTML attribute text become single quotes before C4 reads
the argument, title, or accessibility value. [fixture:
c4/db-grid-html-attribute-title] [fixture:
c4/db-grid-html-attribute-acc-description] [fixture:
c4/db-grid-html-attribute-acc-title] [fixture:
c4/db-grid-html-attribute-acc-descr] [fixture:
c4/db-grid-html-attribute-acc-descr-block] [fixture:
c4/db-grid-html-attribute-text-argument-bare] [fixture:
c4/db-grid-html-attribute-alias-argument-bare] [fixture:
c4/db-grid-html-attribute-plain-argument-bare] [fixture:
c4/db-grid-html-attribute-text-argument-quoted] [fixture:
c4/db-grid-html-attribute-alias-argument-quoted] [fixture:
c4/db-grid-html-attribute-plain-argument-quoted] [fixture:
c4/db-grid-html-attribute-named-value] [fixture:
c4/db-grid-html-attribute-style-value] [fixture: c4/div-frontmatter-open-tag]

A `style` or `classDef` fragment in that exact case, followed on the same line
by a colon and a hash with no whitespace between them, removes the last
semicolon after that hash, even inside a later argument or keyword. [fixture:
c4/db-grid-classdef-rule-acc-title] [fixture: c4/db-grid-style-rule-acc-title]
[fixture: c4/db-grid-classdef-rule-acc-descr] [fixture:
c4/db-grid-style-rule-acc-descr] [fixture:
c4/db-grid-classdef-rule-acc-descr-block] [fixture:
c4/db-grid-style-rule-acc-descr-block] [fixture:
c4/db-grid-classdef-rule-text-argument-bare] [fixture:
c4/db-grid-style-rule-text-argument-bare] [fixture:
c4/db-grid-classdef-rule-alias-argument-bare] [fixture:
c4/db-grid-style-rule-alias-argument-bare] [fixture:
c4/db-grid-classdef-rule-plain-argument-bare] [fixture:
c4/db-grid-style-rule-plain-argument-bare] [fixture:
c4/db-grid-classdef-rule-text-argument-quoted] [fixture:
c4/db-grid-style-rule-text-argument-quoted] [fixture:
c4/db-grid-classdef-rule-alias-argument-quoted] [fixture:
c4/db-grid-style-rule-alias-argument-quoted] [fixture:
c4/db-grid-classdef-rule-plain-argument-quoted] [fixture:
c4/db-grid-style-rule-plain-argument-quoted] [fixture:
c4/db-grid-classdef-rule-named-key] [fixture: c4/db-grid-style-rule-named-key]
[fixture: c4/db-grid-classdef-rule-named-value] [fixture:
c4/db-grid-style-rule-named-value] [fixture:
c4/db-grid-classdef-rule-style-value] [fixture:
c4/db-grid-style-rule-style-value] [fixture: c4/db-preprocessing-style]
[fixture: c4/db-preprocessing-classdef] [fixture:
c4/db-preprocessing-two-semicolons] [fixture: c4/db-preprocessing-quoted-line]
[fixture: c4/lex-semicolon-delimiter-selected] [fixture:
c4/lex-semicolon-key-selected] [fixture: c4/lex-semicolon-text-selected]
[fixture: c4/div-semicolon-call-keyword-after-block]

Removing a semicolon from a style-like fragment does not remove its hash, so
that fragment is still rejected inside title or accDescription text. [fixture:
c4/gram-grid-classdef-rule-title] [fixture: c4/gram-grid-style-rule-title]
[fixture: c4/gram-grid-classdef-rule-acc-description] [fixture:
c4/gram-grid-style-rule-acc-description]

An uppercase `Style`, a missing hash, whitespace or LF between the colon and
hash, or a semicolon before the style-like fragment does not trigger that
removal, while character-reference encoding still applies. [fixture:
c4/db-preprocessing-space] [fixture: c4/db-preprocessing-upper] [fixture:
c4/db-preprocessing-no-hash] [fixture: c4/db-preprocessing-other-line] [fixture:
c4/lex-semicolon-bare-alias] [fixture: c4/lex-semicolon-keyword] [fixture:
c4/lex-semicolon-keyword-selected] [fixture:
c4/lex-semicolon-keyword-selected-same-line] [fixture:
c4/lex-semicolon-named-delimiter]

Under an unsupported securityLevel, disabling HTML labels leaves title and
accessibility markup literal but stores the label `<b>A</b> = value` as `A`.
[fixture: c4/config-security-level-other-html-labels-false] [fixture:
c4/config-security-level-other-flowchart-html-labels-false]

### Titles, descriptions, and boundary bodies

An empty title or accDescription value is rejected, while an empty accTitle or
accDescr colon line can consume the following statement as its value. [fixture:
c4/db-title-empty] [fixture: c4/db-accdescription-empty] [fixture:
c4/db-acctitle-empty] [fixture: c4/db-accdescr-empty]

A boundary or deployment node needs braces and a first diagram statement in its
body; an empty body, a title first, a title-only body or an empty description
block alone is rejected. [fixture: c4/gram-boundary-no-brace] [fixture:
c4/gram-boundary-empty] [fixture: c4/gram-boundary-empty-same-line] [fixture:
c4/gram-boundary-only-title] [fixture: c4/gram-boundary-title-first] [fixture:
c4/gram-boundary-empty-block-body-only] [fixture: c4/gram-boundary-unclosed]

A boundary opening brace on its declaration line requires a following line
break, while a brace on the next line may have its first child immediately after
it. [fixture: c4/gram-boundary-same-line] [fixture: c4/gram-boundary-next-line]
[fixture: c4/gram-boundary-next-line-inline-child]

Title and accessibility statements may follow a diagram statement, including
inside a boundary, and update the shared diagram fields. [fixture:
c4/gram-other-statements-after-shape] [fixture: c4/gram-title-inside-boundary]

A nonempty accDescr block may start its brace on the same or next line, may form
the whole body, and may be followed immediately by a diagram statement.
[fixture: c4/gram-acc-descr-block-same-line] [fixture:
c4/gram-acc-descr-block-next-line] [fixture:
c4/gram-acc-descr-block-after-text-same-line] [fixture:
c4/gram-acc-descr-block-after-text-next-line] [fixture:
c4/gram-acc-descr-block-statement-after-brace] [fixture:
c4/gram-acc-descr-block-after-text-statement-after-brace] [fixture:
c4/gram-body-only-description-block]

An empty or whitespace-only accDescr block emits no value token, so a standalone
empty block or two empty blocks before another statement can leave a rejected
newline. [fixture: c4/gram-acc-descr-block-after-text-blank-lines] [fixture:
c4/gram-acc-descr-block-after-text-space] [fixture:
c4/gram-acc-descr-block-after-text-tab] [fixture:
c4/gram-acc-descr-block-after-text-two-empty] [fixture:
c4/gram-acc-descr-block-blank-lines] [fixture: c4/gram-acc-descr-block-empty]
[fixture: c4/gram-acc-descr-block-space] [fixture: c4/gram-acc-descr-block-tab]
[fixture: c4/gram-acc-descr-block-two-empty] [fixture:
c4/gram-empty-block-alone-before-person] [fixture: c4/gram-empty-block-only]

A tokenless empty accDescr block can stand between the header and its line
break, including before a removed directive, without setting a description.
[fixture: c4/gram-empty-block-header-gap] [fixture:
c4/gram-empty-block-header-followed-directive]

An unclosed description block or plain text after its closing brace is rejected,
and accTitle and accDescription do not have a multiline block form. [fixture:
c4/gram-acc-descr-block-after-text-text-after-brace] [fixture:
c4/gram-acc-descr-block-after-text-unclosed] [fixture:
c4/gram-acc-descr-block-text-after-brace] [fixture:
c4/gram-acc-descr-block-unclosed] [fixture:
c4/lex-acc-block-unclosed-after-text] [fixture: c4/gram-acc-title-block]
[fixture: c4/gram-acc-description-block]

`title` and `accDescription` can take one LF, CRLF or U+2028 separator before
the value, but an additional blank or directive line can leave them without a
value and reject the input. [fixture: c4/lex-title-newline-value] [fixture:
c4/lex-title-separator-crlf] [fixture: c4/lex-title-separator-ls] [fixture:
c4/lex-keyword-gap-accdescription-blank-line] [fixture:
c4/lex-keyword-gap-accdescription-comment-line] [fixture:
c4/lex-keyword-gap-accdescription-directive-line] [fixture:
c4/lex-keyword-gap-accdescription-lf] [fixture:
c4/lex-keyword-gap-title-blank-line] [fixture:
c4/lex-keyword-gap-title-comment-line] [fixture:
c4/lex-keyword-gap-title-directive-line] [fixture: c4/lex-keyword-gap-title-lf]

Whitespace after an accTitle or accDescr colon can include line feeds, blank
lines and removed comment or directive lines, so the next nonempty line becomes
its value. [fixture: c4/lex-keyword-gap-accdescr-blank-line] [fixture:
c4/lex-keyword-gap-accdescr-comment-line] [fixture:
c4/lex-keyword-gap-accdescr-directive-line] [fixture:
c4/lex-keyword-gap-accdescr-lf] [fixture:
c4/lex-keyword-gap-acctitle-blank-line] [fixture:
c4/lex-keyword-gap-acctitle-comment-line] [fixture:
c4/lex-keyword-gap-acctitle-directive-line] [fixture:
c4/lex-keyword-gap-acctitle-lf] [fixture: c4/lex-acc-title-next-line-hash]
[fixture: c4/lex-acc-title-empty-before-hash] [fixture:
c4/lex-acc-title-empty-before-semicolon] [fixture:
c4/lex-acc-title-direction-next-line]

End of input before a title or accessibility value is complete is rejected.
[fixture: c4/gram-unclosed-accdescr] [fixture: c4/gram-unclosed-accdescription]
[fixture: c4/gram-unclosed-acctitle] [fixture: c4/gram-unclosed-title]

### Layout and offsets

An empty offset argument or one with no numeric prefix becomes `NaN`, whether
bare or quoted. [fixture: c4/db-grid-ampersand-entity-offset-argument-bare]
[fixture: c4/db-grid-arrow-offset-argument-bare] [fixture:
c4/db-grid-arrow-spaced-offset-argument-bare] [fixture:
c4/db-grid-backslash-offset-argument-bare] [fixture:
c4/db-grid-backtick-offset-argument-bare] [fixture:
c4/db-grid-bom-offset-argument-bare] [fixture:
c4/db-grid-classdef-rule-offset-argument-bare] [fixture:
c4/db-grid-close-brace-offset-argument-bare] [fixture:
c4/db-grid-close-round-offset-argument-bare] [fixture:
c4/db-grid-close-square-offset-argument-bare] [fixture:
c4/db-grid-colon-offset-argument-bare] [fixture:
c4/db-grid-comma-offset-argument-bare] [fixture:
c4/db-grid-comment-offset-argument-bare] [fixture:
c4/db-grid-comment-line-offset-argument-bare] [fixture:
c4/db-grid-constructor-offset-argument-bare] [fixture:
c4/db-grid-cr-offset-argument-bare] [fixture:
c4/db-grid-crlf-offset-argument-bare] [fixture:
c4/db-grid-dash-offset-argument-bare] [fixture:
c4/db-grid-digits-offset-argument-bare] [fixture:
c4/db-grid-directive-offset-argument-bare] [fixture:
c4/db-grid-directive-line-offset-argument-bare] [fixture:
c4/db-grid-emoji-offset-argument-bare] [fixture:
c4/db-grid-empty-offset-argument-bare] [fixture:
c4/db-grid-entity-offset-argument-bare] [fixture:
c4/db-grid-entity-named-offset-argument-bare] [fixture:
c4/db-grid-equals-offset-argument-bare] [fixture:
c4/db-grid-ff-offset-argument-bare] [fixture:
c4/db-grid-greater-than-offset-argument-bare] [fixture:
c4/db-grid-hash-offset-argument-bare] [fixture:
c4/db-grid-html-offset-argument-bare] [fixture:
c4/db-grid-html-attribute-offset-argument-bare] [fixture:
c4/db-grid-html-br-offset-argument-bare] [fixture:
c4/db-grid-ideographic-offset-argument-bare] [fixture:
c4/db-grid-keyword-offset-argument-bare] [fixture:
c4/db-grid-keyword-block-offset-argument-bare] [fixture:
c4/db-grid-keyword-class-offset-argument-bare] [fixture:
c4/db-grid-keyword-classdef-offset-argument-bare] [fixture:
c4/db-grid-keyword-columns-offset-argument-bare] [fixture:
c4/db-grid-keyword-end-offset-argument-bare] [fixture:
c4/db-grid-keyword-header-offset-argument-bare] [fixture:
c4/db-grid-keyword-space-offset-argument-bare] [fixture:
c4/db-grid-keyword-style-offset-argument-bare] [fixture:
c4/db-grid-less-than-offset-argument-bare] [fixture:
c4/db-grid-lf-offset-argument-bare] [fixture:
c4/db-grid-ls-offset-argument-bare] [fixture:
c4/db-grid-nbsp-offset-argument-bare] [fixture:
c4/db-grid-nel-offset-argument-bare] [fixture:
c4/db-grid-nonascii-offset-argument-bare] [fixture:
c4/db-grid-open-brace-offset-argument-bare] [fixture:
c4/db-grid-open-round-offset-argument-bare] [fixture:
c4/db-grid-open-square-offset-argument-bare] [fixture:
c4/db-grid-percent-offset-argument-bare] [fixture:
c4/db-grid-pipe-offset-argument-bare] [fixture:
c4/db-grid-proto-offset-argument-bare] [fixture:
c4/db-grid-ps-offset-argument-bare] [fixture:
c4/db-grid-punct-offset-argument-bare] [fixture:
c4/db-grid-quote-offset-argument-bare] [fixture:
c4/db-grid-root-offset-argument-bare] [fixture:
c4/db-grid-semicolon-offset-argument-bare] [fixture:
c4/db-grid-single-quote-offset-argument-bare] [fixture:
c4/db-grid-spaces-offset-argument-bare] [fixture:
c4/db-grid-style-rule-offset-argument-bare] [fixture:
c4/db-grid-tab-offset-argument-bare] [fixture:
c4/db-grid-vt-offset-argument-bare] [fixture:
c4/db-grid-ampersand-entity-offset-argument-quoted] [fixture:
c4/db-grid-arrow-offset-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-offset-argument-quoted] [fixture:
c4/db-grid-backslash-offset-argument-quoted] [fixture:
c4/db-grid-backtick-offset-argument-quoted] [fixture:
c4/db-grid-bom-offset-argument-quoted] [fixture:
c4/db-grid-classdef-rule-offset-argument-quoted] [fixture:
c4/db-grid-close-brace-offset-argument-quoted] [fixture:
c4/db-grid-close-round-offset-argument-quoted] [fixture:
c4/db-grid-close-square-offset-argument-quoted] [fixture:
c4/db-grid-colon-offset-argument-quoted] [fixture:
c4/db-grid-comma-offset-argument-quoted] [fixture:
c4/db-grid-comment-offset-argument-quoted] [fixture:
c4/db-grid-comment-line-offset-argument-quoted] [fixture:
c4/db-grid-constructor-offset-argument-quoted] [fixture:
c4/db-grid-cr-offset-argument-quoted] [fixture:
c4/db-grid-crlf-offset-argument-quoted] [fixture:
c4/db-grid-dash-offset-argument-quoted] [fixture:
c4/db-grid-digits-offset-argument-quoted] [fixture:
c4/db-grid-directive-offset-argument-quoted] [fixture:
c4/db-grid-directive-line-offset-argument-quoted] [fixture:
c4/db-grid-emoji-offset-argument-quoted] [fixture:
c4/db-grid-empty-offset-argument-quoted] [fixture:
c4/db-grid-entity-offset-argument-quoted] [fixture:
c4/db-grid-entity-named-offset-argument-quoted] [fixture:
c4/db-grid-equals-offset-argument-quoted] [fixture:
c4/db-grid-ff-offset-argument-quoted] [fixture:
c4/db-grid-greater-than-offset-argument-quoted] [fixture:
c4/db-grid-hash-offset-argument-quoted] [fixture:
c4/db-grid-html-offset-argument-quoted] [fixture:
c4/db-grid-html-attribute-offset-argument-quoted] [fixture:
c4/db-grid-html-br-offset-argument-quoted] [fixture:
c4/db-grid-ideographic-offset-argument-quoted] [fixture:
c4/db-grid-keyword-offset-argument-quoted] [fixture:
c4/db-grid-keyword-block-offset-argument-quoted] [fixture:
c4/db-grid-keyword-class-offset-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-offset-argument-quoted] [fixture:
c4/db-grid-keyword-columns-offset-argument-quoted] [fixture:
c4/db-grid-keyword-end-offset-argument-quoted] [fixture:
c4/db-grid-keyword-header-offset-argument-quoted] [fixture:
c4/db-grid-keyword-space-offset-argument-quoted] [fixture:
c4/db-grid-keyword-style-offset-argument-quoted] [fixture:
c4/db-grid-less-than-offset-argument-quoted] [fixture:
c4/db-grid-lf-offset-argument-quoted] [fixture:
c4/db-grid-ls-offset-argument-quoted] [fixture:
c4/db-grid-nbsp-offset-argument-quoted] [fixture:
c4/db-grid-nel-offset-argument-quoted] [fixture:
c4/db-grid-nonascii-offset-argument-quoted] [fixture:
c4/db-grid-open-brace-offset-argument-quoted] [fixture:
c4/db-grid-open-round-offset-argument-quoted] [fixture:
c4/db-grid-open-square-offset-argument-quoted] [fixture:
c4/db-grid-percent-offset-argument-quoted] [fixture:
c4/db-grid-pipe-offset-argument-quoted] [fixture:
c4/db-grid-proto-offset-argument-quoted] [fixture:
c4/db-grid-ps-offset-argument-quoted] [fixture:
c4/db-grid-punct-offset-argument-quoted] [fixture:
c4/db-grid-quote-offset-argument-quoted] [fixture:
c4/db-grid-root-offset-argument-quoted] [fixture:
c4/db-grid-semicolon-offset-argument-quoted] [fixture:
c4/db-grid-single-quote-offset-argument-quoted] [fixture:
c4/db-grid-spaces-offset-argument-quoted] [fixture:
c4/db-grid-style-rule-offset-argument-quoted] [fixture:
c4/db-grid-tab-offset-argument-quoted] [fixture:
c4/db-grid-vt-offset-argument-quoted]

An empty layout argument or one with no numeric prefix leaves its row counter
unchanged, whether bare or quoted. [fixture:
c4/db-grid-ampersand-entity-layout-argument-bare] [fixture:
c4/db-grid-arrow-layout-argument-bare] [fixture:
c4/db-grid-arrow-spaced-layout-argument-bare] [fixture:
c4/db-grid-backslash-layout-argument-bare] [fixture:
c4/db-grid-backtick-layout-argument-bare] [fixture:
c4/db-grid-bom-layout-argument-bare] [fixture:
c4/db-grid-classdef-rule-layout-argument-bare] [fixture:
c4/db-grid-close-brace-layout-argument-bare] [fixture:
c4/db-grid-close-round-layout-argument-bare] [fixture:
c4/db-grid-close-square-layout-argument-bare] [fixture:
c4/db-grid-colon-layout-argument-bare] [fixture:
c4/db-grid-comma-layout-argument-bare] [fixture:
c4/db-grid-comment-layout-argument-bare] [fixture:
c4/db-grid-comment-line-layout-argument-bare] [fixture:
c4/db-grid-constructor-layout-argument-bare] [fixture:
c4/db-grid-cr-layout-argument-bare] [fixture:
c4/db-grid-crlf-layout-argument-bare] [fixture:
c4/db-grid-dash-layout-argument-bare] [fixture:
c4/db-grid-digits-layout-argument-bare] [fixture:
c4/db-grid-directive-layout-argument-bare] [fixture:
c4/db-grid-directive-line-layout-argument-bare] [fixture:
c4/db-grid-emoji-layout-argument-bare] [fixture:
c4/db-grid-empty-layout-argument-bare] [fixture:
c4/db-grid-entity-layout-argument-bare] [fixture:
c4/db-grid-entity-named-layout-argument-bare] [fixture:
c4/db-grid-equals-layout-argument-bare] [fixture:
c4/db-grid-ff-layout-argument-bare] [fixture:
c4/db-grid-greater-than-layout-argument-bare] [fixture:
c4/db-grid-hash-layout-argument-bare] [fixture:
c4/db-grid-html-layout-argument-bare] [fixture:
c4/db-grid-html-attribute-layout-argument-bare] [fixture:
c4/db-grid-html-br-layout-argument-bare] [fixture:
c4/db-grid-ideographic-layout-argument-bare] [fixture:
c4/db-grid-keyword-layout-argument-bare] [fixture:
c4/db-grid-keyword-block-layout-argument-bare] [fixture:
c4/db-grid-keyword-class-layout-argument-bare] [fixture:
c4/db-grid-keyword-classdef-layout-argument-bare] [fixture:
c4/db-grid-keyword-columns-layout-argument-bare] [fixture:
c4/db-grid-keyword-end-layout-argument-bare] [fixture:
c4/db-grid-keyword-header-layout-argument-bare] [fixture:
c4/db-grid-keyword-space-layout-argument-bare] [fixture:
c4/db-grid-keyword-style-layout-argument-bare] [fixture:
c4/db-grid-less-than-layout-argument-bare] [fixture:
c4/db-grid-lf-layout-argument-bare] [fixture:
c4/db-grid-ls-layout-argument-bare] [fixture:
c4/db-grid-nbsp-layout-argument-bare] [fixture:
c4/db-grid-nel-layout-argument-bare] [fixture:
c4/db-grid-nonascii-layout-argument-bare] [fixture:
c4/db-grid-open-brace-layout-argument-bare] [fixture:
c4/db-grid-open-round-layout-argument-bare] [fixture:
c4/db-grid-open-square-layout-argument-bare] [fixture:
c4/db-grid-percent-layout-argument-bare] [fixture:
c4/db-grid-pipe-layout-argument-bare] [fixture:
c4/db-grid-proto-layout-argument-bare] [fixture:
c4/db-grid-ps-layout-argument-bare] [fixture:
c4/db-grid-punct-layout-argument-bare] [fixture:
c4/db-grid-quote-layout-argument-bare] [fixture:
c4/db-grid-root-layout-argument-bare] [fixture:
c4/db-grid-semicolon-layout-argument-bare] [fixture:
c4/db-grid-single-quote-layout-argument-bare] [fixture:
c4/db-grid-spaces-layout-argument-bare] [fixture:
c4/db-grid-style-rule-layout-argument-bare] [fixture:
c4/db-grid-tab-layout-argument-bare] [fixture:
c4/db-grid-vt-layout-argument-bare] [fixture:
c4/db-grid-ampersand-entity-layout-argument-quoted] [fixture:
c4/db-grid-arrow-layout-argument-quoted] [fixture:
c4/db-grid-arrow-spaced-layout-argument-quoted] [fixture:
c4/db-grid-backslash-layout-argument-quoted] [fixture:
c4/db-grid-backtick-layout-argument-quoted] [fixture:
c4/db-grid-bom-layout-argument-quoted] [fixture:
c4/db-grid-classdef-rule-layout-argument-quoted] [fixture:
c4/db-grid-close-brace-layout-argument-quoted] [fixture:
c4/db-grid-close-round-layout-argument-quoted] [fixture:
c4/db-grid-close-square-layout-argument-quoted] [fixture:
c4/db-grid-colon-layout-argument-quoted] [fixture:
c4/db-grid-comma-layout-argument-quoted] [fixture:
c4/db-grid-comment-layout-argument-quoted] [fixture:
c4/db-grid-comment-line-layout-argument-quoted] [fixture:
c4/db-grid-constructor-layout-argument-quoted] [fixture:
c4/db-grid-cr-layout-argument-quoted] [fixture:
c4/db-grid-crlf-layout-argument-quoted] [fixture:
c4/db-grid-dash-layout-argument-quoted] [fixture:
c4/db-grid-digits-layout-argument-quoted] [fixture:
c4/db-grid-directive-layout-argument-quoted] [fixture:
c4/db-grid-directive-line-layout-argument-quoted] [fixture:
c4/db-grid-emoji-layout-argument-quoted] [fixture:
c4/db-grid-empty-layout-argument-quoted] [fixture:
c4/db-grid-entity-layout-argument-quoted] [fixture:
c4/db-grid-entity-named-layout-argument-quoted] [fixture:
c4/db-grid-equals-layout-argument-quoted] [fixture:
c4/db-grid-ff-layout-argument-quoted] [fixture:
c4/db-grid-greater-than-layout-argument-quoted] [fixture:
c4/db-grid-hash-layout-argument-quoted] [fixture:
c4/db-grid-html-layout-argument-quoted] [fixture:
c4/db-grid-html-attribute-layout-argument-quoted] [fixture:
c4/db-grid-html-br-layout-argument-quoted] [fixture:
c4/db-grid-ideographic-layout-argument-quoted] [fixture:
c4/db-grid-keyword-layout-argument-quoted] [fixture:
c4/db-grid-keyword-block-layout-argument-quoted] [fixture:
c4/db-grid-keyword-class-layout-argument-quoted] [fixture:
c4/db-grid-keyword-classdef-layout-argument-quoted] [fixture:
c4/db-grid-keyword-columns-layout-argument-quoted] [fixture:
c4/db-grid-keyword-end-layout-argument-quoted] [fixture:
c4/db-grid-keyword-header-layout-argument-quoted] [fixture:
c4/db-grid-keyword-space-layout-argument-quoted] [fixture:
c4/db-grid-keyword-style-layout-argument-quoted] [fixture:
c4/db-grid-less-than-layout-argument-quoted] [fixture:
c4/db-grid-lf-layout-argument-quoted] [fixture:
c4/db-grid-ls-layout-argument-quoted] [fixture:
c4/db-grid-nbsp-layout-argument-quoted] [fixture:
c4/db-grid-nel-layout-argument-quoted] [fixture:
c4/db-grid-nonascii-layout-argument-quoted] [fixture:
c4/db-grid-open-brace-layout-argument-quoted] [fixture:
c4/db-grid-open-round-layout-argument-quoted] [fixture:
c4/db-grid-open-square-layout-argument-quoted] [fixture:
c4/db-grid-percent-layout-argument-quoted] [fixture:
c4/db-grid-pipe-layout-argument-quoted] [fixture:
c4/db-grid-proto-layout-argument-quoted] [fixture:
c4/db-grid-ps-layout-argument-quoted] [fixture:
c4/db-grid-punct-layout-argument-quoted] [fixture:
c4/db-grid-quote-layout-argument-quoted] [fixture:
c4/db-grid-root-layout-argument-quoted] [fixture:
c4/db-grid-semicolon-layout-argument-quoted] [fixture:
c4/db-grid-single-quote-layout-argument-quoted] [fixture:
c4/db-grid-spaces-layout-argument-quoted] [fixture:
c4/db-grid-style-rule-layout-argument-quoted] [fixture:
c4/db-grid-tab-layout-argument-quoted] [fixture:
c4/db-grid-vt-layout-argument-quoted]

A bare comma or an early closing quote can shift a nonnumeric fragment into the
second numeric slot, making offsetY `NaN` but leaving c4BoundaryInRow at its
previous value. [fixture: c4/db-grid-comma-offset-argument-bare] [fixture:
c4/db-grid-punct-offset-argument-bare] [fixture:
c4/db-grid-quote-offset-argument-quoted] [fixture:
c4/db-grid-comma-layout-argument-bare] [fixture:
c4/db-grid-punct-layout-argument-bare] [fixture:
c4/db-grid-quote-layout-argument-quoted]
