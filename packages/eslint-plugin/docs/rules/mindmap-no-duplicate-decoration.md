# @mmd-toolkit/mindmap-no-duplicate-decoration

Japanese version:
[mindmap-no-duplicate-decoration.ja.md](./mindmap-no-duplicate-decoration.ja.md)

Disallow a second icon or a second class line for one node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An icon line, `::icon(…)`, and a class line, `:::…`, decorate the node written
last before them. A node takes one icon and one class line: mermaid.js keeps the
last of each without an error, and the earlier one is lost. Two class lines are
usually written for two classes, which go on one line, as in `:::urgent large`.

## Rule Details

This rule reports every icon line of a node after its first icon line, and every
class line after its first class line, when the line sets a value other than the
one before it. It applies to `mindmap`.

After `:::urgent` and `:::large`, the node has the class `large` only, and after
`::icon(fa fa-book)` and `::icon(fa fa-pen)`, the icon `fa fa-pen`. The two
kinds are counted apart: an icon line and a class line on one node are not
reported, and in `:::urgent`, `::icon(fa fa-book)`, and `:::large`, only
`:::large` is reported. A line belongs to the node written last before it
whatever its indentation, also across empty lines, comment lines, and
directives, and `::icon(` is read in any case. An icon line of a node and one of
its child are on two nodes, and they are not reported.

A line that sets the icon or the class that the node already has is not
reported: after `:::urgent`, a second `:::urgent` loses nothing. The values are
compared as mermaid.js keeps them, as written: the text after `:::` to the end
of the line, and the text inside the parentheses of `::icon(`. So
`:::urgent large` and `:::large urgent` are two values, and the second is
reported, although the node gets the same two classes in the drawing. After
`:::urgent` and `:::large`, a third `:::urgent` is reported, because it replaces
`large`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    :::urgent
    :::large
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    ::icon(fa fa-book)
    ::icon(fa fa-pen)
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    :::urgent large
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    ::icon(fa fa-book)
    :::urgent
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-duplicate-decoration: error
mindmap
  Plans
    Write
    :::urgent
    :::urgent
```

## Options

This rule has no options.

## Background

mermaid.js sets the icon or the class of the node that it added last, replacing
what it had
([`decorateNode`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L154-L167)).

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/mindmap-no-duplicate-decoration.ts)
- [Tests source](../../tests/rules/mindmap-no-duplicate-decoration.test.ts)

<!-- end auto-generated rule resources -->
