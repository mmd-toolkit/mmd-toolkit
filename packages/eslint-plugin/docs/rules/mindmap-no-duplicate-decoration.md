# @mmd-toolkit/mindmap-no-duplicate-decoration

Japanese version:
[mindmap-no-duplicate-decoration.ja.md](./mindmap-no-duplicate-decoration.ja.md)

Disallow a second icon or a second class line for one node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An icon line, `::icon(…)`, and a class line, `:::…`, decorate the node written
last before them. A node takes one icon and one class line: mermaid.js keeps the
last of each without an error, and the earlier one is lost. Two class lines are
usually written for two classes, which go on one line, as in `:::urgent large`.

## Rule Details

This rule applies to mind maps (`mindmap`). It reports an icon or class line
that replaces the current value of the same kind on the same node with a
different one. Icon and class lines are checked separately, and lines on
different nodes are not compared.

Each line belongs to the last node written before it, regardless of indentation
or intervening empty lines, comment lines, or directives. `::icon(` is read in
any case. Repeating the current value is not reported.

The text after `:::` and inside `::icon(` is compared as written, so
`:::large urgent` after `:::urgent large` is reported even though both give the
same classes. After `:::urgent` and `:::large`, a third `:::urgent` is reported
because it replaces `large`.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/mindmap-no-duplicate-decoration.ts)
- [Tests source](../../tests/rules/mindmap-no-duplicate-decoration.test.ts)

<!-- end auto-generated rule resources -->
