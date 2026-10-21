# @mmd-toolkit/kanban-no-duplicate-section

Japanese version:
[kanban-no-duplicate-section.ja.md](./kanban-no-duplicate-section.ja.md)

Disallow a repeated section id that lists its items more than once.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Each column needs its own id. When two sections use `Todo`, mermaid.js accepts
both without an error and lists every item belonging to `Todo` under both
columns. Even an item written under only one of them appears twice.

## Rule Details

This rule reports each section after the first with the same id, when any item
of the board belongs to that id. It applies to `kanban`.

The first node's indentation sets the section level. Every node at that level is
a section; every other node is an item of the most recent section. Items are
considered throughout the board: an item written after the repeated section also
appears under the earlier section. A third section with that id is another
report.

Ids are compared with their case, keeping trailing whitespace. A shape without
an id uses its label as its id. Changing the title with metadata changes no id.
Repeated item ids, an item with the same id as a section, and repeated empty
sections with no items belonging to their id are not reported: they add no extra
item listing.

Give each column its own id, as `Todo` and `Ready`. Two columns may deliberately
have the same displayed title when they have different ids.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Backlog]
    docs[Write docs]
  Todo[Ready]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Backlog]
    docs[Write docs]
  Ready[Ready]
```

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Backlog]
  Todo[Ready]
```

```mmd
%% eslint @mmd-toolkit/kanban-no-duplicate-section: error
kanban
  Todo[Queue]
    docs
  Ready[Queue]
    review
```

## Options

This rule has no options.

## Background

[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L61-L94)
selects the children by section id for each section, so a repeated id selects
the same items again.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/kanban-no-duplicate-section.ts)
- [Tests source](../../tests/rules/kanban-no-duplicate-section.test.ts)

<!-- end auto-generated rule resources -->
