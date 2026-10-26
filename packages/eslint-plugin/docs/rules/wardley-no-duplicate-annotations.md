# @mmd-toolkit/wardley-no-duplicate-annotations

Japanese version:
[wardley-no-duplicate-annotations.ja.md](./wardley-no-duplicate-annotations.ja.md)

Disallow an `annotations` after the first that gives the box of the annotations
another position.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A map has one box of annotations, at the position of its first `annotations`.
mermaid.js leaves a later `annotations` out without an error, so the position
that it gives has no effect.

## Rule Details

This rule reports an `annotations` after the first that gives another position
than the first, when the map has an annotation with a text, which the box shows.
It applies to `wardley`.

After `annotations [0.1, 0.2]` and `annotations [0.3, 0.4]`, the box stands at
the first position. Each later `annotations` is compared with the first one, not
with the one before it.

An `annotations` that gives the position of the first is not reported, and
neither is one in a map with no annotation text, which draws no box. Positions
are compared as percentages: `0.1` and `10` are one position. mermaid.js moves a
box that runs over the edge of the map inside it, so two positions near the edge
may give one box, and the rule reports them as two positions.

Write one `annotations`, at the position of the box.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-annotations: error
wardley-beta
  annotations [0.1, 0.2]
  annotations [0.3, 0.4]
  annotation 1, [0.6, 0.7] "Review"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-annotations: error
wardley-beta
  annotations [0.1, 0.2]
  annotation 1, [0.6, 0.7] "Review"
```

## Options

This rule has no options.

## Background

The
[parser](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L199-L204)
takes the position of the box from the first `annotations` only.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-annotations.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-annotations.test.ts)

<!-- end auto-generated rule resources -->
