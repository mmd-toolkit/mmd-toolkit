# @mmd-toolkit/mindmap-no-mismatched-shape

Japanese version:
[mindmap-no-mismatched-shape.ja.md](./mindmap-no-mismatched-shape.ja.md)

Disallow a shape whose closer does not match its opener.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A shape is written with an opener and its closer, as in `[text]` and `((text))`.
When the closer does not match, mermaid.js gives no error and draws the shape
that the opener writes, and for the opener `(`, a cloud. One of the two was
mistyped, and the shape drawn may not be the one meant.

## Rule Details

This rule reports the closer of a shape when it is not the closer of its opener:
`]` for `[`, `)` for `(`, `))` for `((`, `((` for `))`, `(` for `)`, and `}}`
for `{{`. It applies to `mindmap`.

`Write[draft)` is a rectangle, `a((x)` a circle, `a))x(` a bang, `a)x)` a cloud,
and `a{{x]` a hexagon. With the opener `(`, any closer other than `)` gives a
cloud: `Review(notes))` and `a(x]` are clouds, not rounded rectangles. A label
that is a string or that goes over lines, and a shape without a node text, as
`((x)`, are reported in the same way. The openers `(-` and `-)` are not checked:
mermaid.js draws the default shape for them whatever the closer, and its
documentation names no shape for them.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Write[draft)
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Review(notes))
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Write[draft]
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Review((notes))
```

## Options

This rule has no options.

## Background

mermaid.js takes the type of a shape from its opener, and the closer only for
`(`
([`getType`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L127-L145)).
Its documentation
([syntax/mindmap.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md#L56-L109))
lists each shape with its opener and its closer.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/mindmap-no-mismatched-shape.ts)
- [Tests source](../../tests/rules/mindmap-no-mismatched-shape.test.ts)

<!-- end auto-generated rule resources -->
