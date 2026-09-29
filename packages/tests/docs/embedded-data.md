# Values from embedded data

Japanese version: [embedded-data.ja.md](./embedded-data.ja.md)

This document explains the values `resolveEmbeddedData()` and
`runMermaidWithEmbeddedData()` hand to an implementation, and what comparing
with them checks.

## Why an implementation needs them

The specification treats embedded data as opaque: the frontmatter YAML, the
contents of directives, and `@{ ... }` data blocks. A parser neither parses nor
validates them (Known divergence `embedded-data-opaque`). Some Db values still
depend on that data, for example a subgraph direction on `flowchart.inheritDir`,
the title on the frontmatter `title`, and the fields only data blocks set
(`icon`, `animate`, `metadata`, ...). To build those, an implementation's test
takes the values from mermaid.js:

- `resolveEmbeddedData(text, { config })` returns
  `{ config, title, dataBlockEffects }`. It returns `undefined` when mermaid.js
  rejects the text, since there is then no mermaid.js Db to compare with.
- `runMermaidWithEmbeddedData(text, { config })` returns the outcome of
  `runMermaid()` and those values from a single run.
- The mutation differential test passes the same values to the candidate as its
  third argument (see [mutation-testing.md](./mutation-testing.md)).

None of these values is stored in `expected.json`: the whole configuration is
large, and a change of mermaid.js's defaults would touch every fixture.

## `config` and `title`

- `config` is mermaid.js's whole configuration for the text: its defaults, the
  site configuration, the frontmatter `config` and the directives, merged by
  mermaid.js itself, and read with `mermaidAPI.getConfig()` right after
  `mermaid.parse()`. Per-diagram appearance defaults (such as `look`) are not in
  it; they do not affect Db summaries.
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

Each entry is `{ id, set }`:

- `id` is the id written right before the block;
- `set` holds the summary fields of the element the block applied to that the
  block changed, with their new values (`{}` when it changed nothing).

An implementation builds the Db from the syntax and, at each data block, applies
the next entry to the element the block belongs to.

The list is empty when the text has no data blocks, and for diagram types whose
Db patch does not record them yet.

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

If a block creates or removes an element, or changes more than one, or the
participant cannot be added without its block, the run fails instead of
guessing. The patch cannot throw while mermaid.js parses, since
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
