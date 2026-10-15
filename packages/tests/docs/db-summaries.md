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
