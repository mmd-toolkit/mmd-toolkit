# @mmd-toolkit/kanban-no-duplicate-section

Japanese version:
[kanban-no-duplicate-section.ja.md](./kanban-no-duplicate-section.ja.md)

Disallow a repeated section id that lists its items more than once.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Each column needs its own id. mermaid.js accepts two sections with the same id
without an error and lists all items belonging to that id under both columns.
Even an item written under only one appears twice.

## Rule Details

This rule applies to Kanban boards (`kanban`). It reports each section after the
first with the same id if any item on the board belongs to that id, including
items written later. Repeated empty sections with no items belonging to their id
are not reported.

The first entry's indentation sets the section level, and entries at that level
are sections. Entries at other levels are items of the most recent section. Ids
are case-sensitive and keep whitespace before a shape, so `Todo [Second]` after
`Todo[First]` is not reported. Shapes without ids use their labels as ids. A
title set by a data block, such as `Todo@{label: First}`, does not change the
id.

Repeated item ids and items sharing a section's id are not reported because they
add no extra item listing. Columns with different ids and the same title, as
`Todo[Queue]` and `Ready[Queue]`, are not reported.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/kanban-no-duplicate-section.ts)
- [Tests source](../../tests/rules/kanban-no-duplicate-section.test.ts)

<!-- end auto-generated rule resources -->
