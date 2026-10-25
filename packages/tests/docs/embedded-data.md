# Values from embedded data

Japanese version: [embedded-data.ja.md](./embedded-data.ja.md)

This document explains the values that mermaid.js derives from the embedded data
of an input, how the fixtures record them, and what comparing with them checks.

## Why an implementation needs them

The specification treats embedded data as opaque: the frontmatter YAML, the
contents of directives, and `@{ ... }` data blocks. A parser neither parses nor
validates them (Known divergence `embedded-data-opaque`). Some Db values still
depend on that data, for example a subgraph direction on `flowchart.inheritDir`,
the title on the frontmatter `title`, and the fields only data blocks set
(`icon`, `animate`, `metadata`, ...). To build those, an implementation takes
the values from the fixture.

## Where the values are

Every accepted result in `expected.json` (and in `specified.json`, see
[expected-results.md](./expected-results.md)) may have a field `embedded`:
`{ config?, title?, dataBlockEffects? }`. A field is left out where the input
gives no such value, and `embedded` where it gives none. An accepted fixture has
it where its input has a data block, a frontmatter `title`, or a frontmatter or
directive that changes the configuration; the rest need nothing from embedded
data. A specified reading has its own `embedded`: where mermaid.js rejects the
input, the reading may carry the configuration that a directive sets, or the
effects of the data blocks. [fixture:
class/div-comment-then-directive-line-sets-config] [fixture:
sequence/div-comment-after-number-with-data-block]

- `title` and `dataBlockEffects` are the values below.
- `config` is what the input changes in mermaid.js's configuration, not the
  whole configuration, which is large (23 KB) and the same for almost every
  fixture. It is the values that differ from the configuration mermaid.js has
  for a text that changes nothing in it, read with the fixture's own `config`.
  An implementation takes a key from `embedded.config`, then from the `config`
  of the fixture, then from the defaults in
  [`fixtures/default-config.json`](../fixtures/default-config.json)
  (`getDefaultConfig()`). An object is merged key by key; an array and any other
  value replace.

Within recorded configuration, a non-finite number is a reserved one-field
object: `{ "nonFinite": "Infinity" }`, `{ "nonFinite": "-Infinity" }`, or
`{ "nonFinite": "NaN" }`. This applies recursively, including array items.
Finite numbers remain JSON numbers; strings such as `"Infinity"`, `"-Infinity"`,
and `"NaN"` remain strings. A tag is restored to a number before merging, so it
replaces a value rather than merging as an ordinary object. `getDefaultConfig()`
and `embeddedValuesOf()` give numeric values to `dbFromTree()`. [fixture:
packet/config-frontmatter-row-infinity] [fixture:
packet/config-frontmatter-row-negative-infinity] [fixture:
packet/config-frontmatter-row-nan] [fixture:
packet/config-frontmatter-row-infinity-string] [fixture:
packet/config-init-row-overflow] [fixture:
packet/config-init-row-infinity-word-string]

`embeddedValuesOf(fixture)` builds these values from the fixture: the defaults,
then the fixture's `config`, then `embedded.config`. When an input changes
`theme`, mermaid.js recomputes `themeVariables` and may drop some of its keys;
the difference does not record drops, so the built configuration can hold a key
that mermaid.js's own lacks (16 of the accepted fixtures). No Db value depends
on those keys.

The functions of `@mmd-toolkit/tests/mermaid` give the values for any text, with
the whole configuration:

- `resolveEmbeddedData(text, { config })` returns
  `{ config, title, dataBlockEffects }`. It returns `undefined` when mermaid.js
  rejects the text, since there is then no mermaid.js Db to compare with.
- `runMermaidWithEmbeddedData(text, { config })` returns the outcome of
  `runMermaid()` and those values from a single run.

The generator records the fixtures' values from them, and `fixtures:check`
compares the recorded values with mermaid.js.

## `config` and `title`

- The whole `config` is mermaid.js's configuration for the text, derived as
  [configuration.md](./configuration.md) describes, and read with
  `mermaidAPI.getConfig()` right after `mermaid.parse()`. Per-diagram appearance
  defaults (such as `look`) are not in it; they do not affect Db summaries. The
  runner returns numbers, including non-finite numbers, in memory; the generator
  applies the tags only when recording configuration as JSON.
- `title` is the frontmatter title, as `render()` passes it to the Db (see
  [expected-results.md](./expected-results.md)).

## `dataBlockEffects`

`dataBlockEffects` lists what each `@{ ... }` data block did to the Db, in the
order mermaid.js applied the blocks. That order is expected to be source order;
an implementation's tests check it, by comparing the number of entries and their
ids with the blocks the implementation finds.

In a flowchart, blocks written one right after another, as in
`A@{ ... }@{ ... }`, count as one: the grammar joins their contents and passes
them in one call
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L396-L401)).

Adjacent `@{ ... }` blocks of one kanban node are read as one suffix whose
contents are concatenated, and one effect is recorded for the group. [fixture:
kanban/db-metadata-adjacent-comma] [fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-two-items] [fixture:
kanban/gram-metadata-two-blocks] [fixture: kanban/db-metadata-all]

Each entry is `{ id, set }`:

- `id` is the id written right before the block;
- `set` holds the summary fields of the element the block applied to that the
  block changed, with their new values (`{}` when it changed nothing).

An implementation builds the Db from the syntax and, at each data block, applies
the next entry to the element the block belongs to.

The list is empty when the text has no data blocks, and for diagram types whose
Db patch does not record them yet.

Usecase JSON tables record the complete Mermaid-read value and property order as
`{ id, set: { value, propertyOrder } }`, including an empty object. Effects
follow authored JSON declaration order, which can differ from Db map order after
a forward reference. Native usecase metadata is syntax and has no such effect.
The usecase patch intercepts the published model at `commit`, takes JSON
statements in source order and looks up their Mermaid-read values; it never
reads the JSON interior again. `clear` resets the effects. [fixture:
usecase/gram-json-empty] [fixture: usecase/db-json-source-map-order] [fixture:
usecase/db-native-metadata-not-yaml]

### How it is recorded

The flowchart Db patch records it by wrapping
[`FlowDB.addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L127-L277).
The grammar passes a block to `addVertex` in a call of its own
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L403-L421)),
after the call that creates the element
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L464-L465)).
The patch compares the summaries of all elements before and after that call. It
reads neither the block nor mermaid.js's rules for it.

The sequence Db patch records it by wrapping
[`SequenceDB.addActor`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L155-L231).
The grammar passes the block of a participant in the same call that adds the
participant
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L358-L367),
[`SequenceDB.apply`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L578-L580)),
so the patch runs that call once without the block, keeps the summaries of all
actors and boxes, puts the Db's lists back as they were, and runs the call as
mermaid.js made it. The fields that differ between the two runs are the block's
effect. It reads neither the block nor mermaid.js's rules for it.

The kanban Db patch wraps
[`addNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L99-L165),
which also receives the block in the call that adds the node
([`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison#L126-L133)).
It compares the node summaries after that call without and with the block;
because the shared Db keeps its state in module variables, it restores the
prefix by clearing the Db and replaying the original node and decoration calls.
The recorded effects and problems are reset with the Db's `clear()` before the
next parse. [fixture: kanban/db-metadata-all] [fixture:
kanban/db-metadata-repeated-id] [fixture: kanban/db-decoration-icon-twice]
[fixture: kanban/header-only-lf]

If a block creates or removes an element, or changes more than one, or the
participant or kanban node cannot be added without its block, the run fails
instead of guessing. The patch cannot throw while mermaid.js parses, since
`mermaid.parse()` would report the error as a rejection of the input; it records
the problem, and reading the effects of that Db throws it
(`src/normalizers/data-blocks.ts`).

### Fields only data blocks set

Some summary fields are set only by data blocks: in a flowchart, `icon`, `form`,
`pos`, `img`, `constraint`, `assetWidth` and `assetHeight` of vertices,
`animate` and `animation` of edges, and `metadata` of subgraphs. An
implementation that does not read data blocks gets them only through
`dataBlockEffects`, so they are checked on mermaid.js's side alone. A sequence
diagram has none: a block sets an actor's `type` and description, which the
keyword (`participant`, `actor`) and the alias also set.

In kanban, `ticket` and `priority` are set only by blocks, as is `assigned`;
`label` also comes from the node description, and an icon decoration can set
`icon`. Only fields exposed in the node summary contribute to the effect: column
`assigned`, `priority`, and `icon`, and the fixed `shape`, contribute nothing.
[fixture: kanban/db-metadata-all] [fixture: kanban/db-metadata-section-assigned]
[fixture: kanban/db-metadata-section-priority] [fixture:
kanban/db-metadata-section-icon] [fixture: kanban/db-metadata-shape-lower]
[fixture: kanban/db-decoration-icon-twice]

### What comparing with them checks

With these values, an implementation's test checks:

- where the blocks are and in which order;
- which element each applies to (the entry does not say; picking the wrong one
  gives a different Db);
- the fields the syntax sets before and after a block;
- the order in which syntax and blocks apply.

It does not check the following; they arrive as mermaid.js computed them:

- how the content of a block turns into values (for example `shape` into `type`,
  `w` into a number, or `labelType` becoming `markdown` when only `label` is
  given);
- whether the content is valid (malformed YAML or an unknown shape; Known
  divergence `embedded-data-opaque`);
- effects that depend on the element at that moment (an `icon` or `img` empties
  `text` only while `text` equals the id).
