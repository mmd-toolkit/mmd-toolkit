# Db summaries

Japanese version: [db-summaries.ja.md](./db-summaries.ja.md)

This document explains the `db` field of `expected.json`: what a summary of
mermaid.js's Db keeps, and what it leaves out for each diagram type.

## What a summary is

A summary keeps only what the syntax determines, as plain JSON: collections
become arrays in declaration order, `undefined` fields are omitted, internal
counters and DOM ids are dropped. The normalizers live in `src/normalizers/`,
one per Db class, registered by diagram id in `src/normalizers/index.ts`. The
summary of each diagram type is specified in the "Db normalization" section of
`docs/diagrams/<diagram>.md` in `@mmd-toolkit/spec`.

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

`normalizeFlowchart()` (`src/normalizers/flowchart.ts`) summarizes the Db of
`flowchart-v2`, `flowchart-elk` and `swimlane`, which share `FlowDB`. It keeps
what `FlowDB` exposes through its getters and drops the following, each for the
reason given:

- `vertices[].domId`: a DOM id built from a counter, used only for rendering.
- `classDefs[].textStyles`: derived from `styles` for rendering (the entries
  containing `color`, with `fill` replaced by `bgFill`).
- `vertices[].haveCallback`: set only under `securityLevel: loose`, a site
  setting; the click itself shows as the class `clickable`.
- Click callback names and arguments: kept only inside closures.
- Internal bookkeeping (`vertexCounter`, `subCount`, `posCrossRef`, ...).
- Whitespace at the end of each style value (`vertices[].styles`,
  `classDefs[].styles`, `edges[].style`, `edgeDefaults.style`). The grammar
  keeps the whitespace written before a comma or the end of the line in the
  value, but nothing in mermaid.js reads it, and the formatter removes
  whitespace at the end of these lines. The characters removed are those of
  `String.prototype.trimEnd()`, which are exactly the ones the grammar can leave
  there. Whitespace at the start of a value is kept: it can change the Db
  (`linkStyle` adds `fill:none` when no value starts with `fill`).

Other values of the summary:

- Texts (labels, subgraph and diagram titles, `accTitle`, `accDescr`, tooltips)
  are recorded before HTML sanitization, and `vertices[].link` is the URL as
  written (trimmed); see [expected-results.md](./expected-results.md).
- `icon`, `form`, `pos`, `img`, `constraint`, `assetWidth` and `assetHeight` of
  vertices, `animate` and `animation` of edges, and `metadata` of subgraphs are
  set only by `@{ ... }` data blocks; see
  [embedded-data.md](./embedded-data.md).

## sequence

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
  site, the frontmatter or a directive).
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
  closures.
- Whitespace at the end of each style value (`classes[].styles`), as in the
  flowchart summary: the grammar keeps the whitespace written before a comma or
  the end of the line, and nothing reads it.

Other values of the summary:

- `classes[].text` is kept, although it is built from the label and the type:
  `addClass` writes the type as `&lt;T&gt;` and a label statement as `<T>`
  ([`addClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L112-L137)),
  so the label and the type alone do not give it.
- `classes[].haveCallback` is kept: unlike flowchart, `setClickEvent` sets it
  under every `securityLevel`
  ([`setClickEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L434-L444)).
- `classes[].link` is the URL as written (trimmed), and `classes[].linkTarget`
  the target as written, or `_blank`, under every `securityLevel` (see
  [expected-results.md](./expected-results.md)).

## state

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
the same under every `securityLevel`, `look` and `htmlLabels`.
