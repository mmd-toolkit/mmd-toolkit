# @mmd-toolkit/wardley-no-ignored-link-label

Japanese version:
[wardley-no-ignored-link-label.ja.md](./wardley-no-ignored-link-label.ja.md)

Disallow a label after `;` that the label in the arrow of the link replaces.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A link has one label: the one in its arrow, as `+'calls'>`, or the one after
`;`. When a link has both, mermaid.js uses the label in the arrow without an
error, and the label after `;` is lost.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports a link label
after `;` when the arrow holds a different label, including an empty label, as
in `+''>`. An identical label after `;`, one containing only spaces, and a link
with only one label are not reported. A link that draws nothing, because an end
names no node or because it goes from a pipeline child to its parent, is not
reported.

Labels are otherwise compared as written. mermaid.js converts character
references such as `#35;` and HTML attribute quotes before reading a label, so
labels differing only in these ways may be the same for mermaid.js and different
for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-ignored-link-label: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API +'calls'> Database; storage
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-ignored-link-label: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API +'calls'> Database
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-undef](./wardley-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-ignored-link-label.ts)
- [Tests source](../../tests/rules/wardley-no-ignored-link-label.test.ts)

<!-- end auto-generated rule resources -->
