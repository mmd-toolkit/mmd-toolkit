# @mmd-toolkit/quadrant-no-redefined-quadrant

Japanese version:
[quadrant-no-redefined-quadrant.ja.md](./quadrant-no-redefined-quadrant.ja.md)

Disallow a quadrant statement that replaces the text of its quadrant.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`quadrant-1` to `quadrant-4` set the text of the four quadrants. mermaid.js
accepts a second statement of the same quadrant and silently replaces the text
that the first one set. A second statement is usually left over from rewriting
the text, or a number that was not changed after pasting a line.

## Rule Details

This rule reports a `quadrant-1`, `quadrant-2`, `quadrant-3`, or `quadrant-4`
statement after the first one of the same number, when it replaces a text that
an earlier statement of that quadrant set with another value. It applies to
`quadrantChart`.

After `quadrant-1 We should expand`, the statement `quadrant-1 Need to promote`
gives the first quadrant the text `Need to promote`, and the text
`We should expand` is lost. A text in quotes that holds only spaces sets the
empty text, and after `quadrant-1 A`, `quadrant-1 "  "` is reported. The keyword
is read in any case, and `quadrant-10 B` is a statement of the first quadrant
with the text `0 B`, so after `quadrant-1 A` it is reported. Statements of other
quadrants between them do not count.

A statement that loses nothing is not reported: a text that was empty is not
lost. Texts are compared as mermaid.js keeps them, without the whitespace at
their ends and without the quotes and backquotes of a string, so
`quadrant-1 " A "` and ``quadrant-1 "`A`"`` after `quadrant-1 A` set the same
text; the whitespace between the words counts. After `quadrant-1 A` and
`quadrant-1 B`, a third `quadrant-1 A` is reported, because it replaces `B`.

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
