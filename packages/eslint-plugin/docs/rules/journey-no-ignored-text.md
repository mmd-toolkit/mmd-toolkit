# @mmd-toolkit/journey-no-ignored-text

Japanese version:
[journey-no-ignored-text.ja.md](./journey-no-ignored-text.ja.md)

Disallow text in the data of a task that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A colon written between two people, as in `Make tea: 5: Me: Cat`, drops the
people after it: mermaid.js keeps the data of a task only up to its third colon
and drops the rest without an error. The data of a task is its score and its
people, separated by a colon, and the people are separated by commas.

## Rule Details

This rule applies to user journey diagrams (`journey`). It reports task data
from the third colon onward when it contains anything other than colons and
whitespace. A third colon with nothing after it is not reported because it drops
nothing. Directives do not count as dropped text, so a third colon followed only
by a directive is not reported either.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-ignored-text: error
journey
  section Work
    Make tea: 5: Me: Cat
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-ignored-text: error
journey
  section Work
    Make tea: 5: Me, Cat
```

```mmd
%% eslint @mmd-toolkit/journey-no-ignored-text: error
journey
  section Work
    Make tea: 5: Me:
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)
- [journey-no-invalid-score](./journey-no-invalid-score.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-ignored-text.ts)
- [Tests source](../../tests/rules/journey-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
