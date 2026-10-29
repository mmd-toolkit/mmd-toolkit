# @mmd-toolkit/journey-no-empty-person

Japanese version:
[journey-no-empty-person.ja.md](./journey-no-empty-person.ja.md)

Disallow a person of a task that has no name.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

The people of a task are written after its second colon, separated by commas. An
empty place in the list, as after a comma at its end, is a person with an empty
name for mermaid.js, which adds that person to the journey and to its legend
without an error.

## Rule Details

This rule applies to user journey diagrams (`journey`). It reports each empty or
whitespace-only name in the comma-separated list of people after a task's second
colon. A second colon with nothing after it gives one empty name and is
reported. A task without a second colon has no people and is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5: Me,
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5:
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-person: error
journey
  section Work
    Make tea: 5
```

## Options

This rule has no options.

## Related Rules

- [journey-no-ignored-text](./journey-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-empty-person.ts)
- [Tests source](../../tests/rules/journey-no-empty-person.test.ts)

<!-- end auto-generated rule resources -->
