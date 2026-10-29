# @mmd-toolkit/mindmap-no-mismatched-shape

Japanese version:
[mindmap-no-mismatched-shape.ja.md](./mindmap-no-mismatched-shape.ja.md)

Disallow a shape whose closer does not match its opener.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A shape is written with an opener and its closer, as in `[text]` and `((text))`.
When the closer does not match, mermaid.js gives no error and draws the shape
that the opener writes, and for the opener `(`, a cloud. One of the two was
mistyped, and the shape drawn may not be the one meant.

## Rule Details

This rule applies to mind maps (`mindmap`). It reports a shape's closer when it
does not match its opener: `]` for `[`, `)` for `(`, `))` for `((`, `((` for
`))`, `(` for `)`, and `}}` for `{{`. Quoted or multiline labels and shapes
without preceding node text are checked in the same way.

The openers `(-` and `-)` are not checked because mermaid.js draws the default
shape for them regardless of the closer, and its documentation names no shape
for them.

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

## Further Reading

- [syntax/mindmap.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md#L56-L109)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/mindmap-no-mismatched-shape.ts)
- [Tests source](../../tests/rules/mindmap-no-mismatched-shape.test.ts)

<!-- end auto-generated rule resources -->
