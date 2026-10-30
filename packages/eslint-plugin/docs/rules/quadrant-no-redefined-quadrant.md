# @mmd-toolkit/quadrant-no-redefined-quadrant

Japanese version:
[quadrant-no-redefined-quadrant.ja.md](./quadrant-no-redefined-quadrant.ja.md)

Disallow a quadrant statement that replaces the text of its quadrant.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`quadrant-1` to `quadrant-4` set the texts of the four quadrants. mermaid.js
accepts another statement for the same quadrant without an error and uses its
text, so the earlier text is lost.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports a
`quadrant-1`, `quadrant-2`, `quadrant-3`, or `quadrant-4` statement that
replaces the current nonempty text of that quadrant with a different value.
Repeating the current text, or setting a text where the current one is empty, is
not reported, and statements of other quadrants are checked separately.

Texts are compared without surrounding whitespace, quotes, or the backquotes of
a markdown string, while whitespace between words counts. A quoted text of only
spaces sets an empty text, so `quadrant-1 "  "` after `quadrant-1 A` is
reported. The keywords are read in any case, and `quadrant-10 B` sets the first
quadrant's text to `0 B`, so after `quadrant-1 A` it is reported. After
`quadrant-1 A` and `quadrant-1 B`, a third `quadrant-1 A` is reported because it
replaces `B`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-quadrant: error
quadrantChart
  quadrant-1 We should expand
  quadrant-2 Need to promote
  quadrant-2 Re-evaluate
  A: [0.3, 0.6]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-quadrant: error
quadrantChart
  quadrant-1 We should expand
  quadrant-2 Need to promote
  quadrant-3 Re-evaluate
  A: [0.3, 0.6]
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-redefined-axis](./quadrant-no-redefined-axis.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-redefined-quadrant.ts)
- [Tests source](../../tests/rules/quadrant-no-redefined-quadrant.test.ts)

<!-- end auto-generated rule resources -->
