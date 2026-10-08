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
  block, trimmed; a later one of either form replaces the earlier. The lines of
  a block are joined by a line feed with the white space at the start of each
  line removed, so an empty line and a line of whitespace leave no extra line
  feed. A comment line and a directive line inside the block are no text, and
  U+2028 is kept. [fixture: er/db-acc-descr-line] [fixture:
  er/db-acc-descr-block] [fixture: er/db-acc-descr-replaces] [fixture:
  er/db-acc-descr-block-comment-line] [fixture:
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
