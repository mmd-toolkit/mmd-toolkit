# @mmd-toolkit/journey-no-invalid-score

Japanese version:
[journey-no-invalid-score.ja.md](./journey-no-invalid-score.ja.md)

Disallow a task score that is not a number from 1 to 5.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A task's score places its face on the journey's scale from 1 to 5. A missing
colon, as in `Make tea: 5 Me`, can put other text in the score without an error:
a nonnumeric score leaves the face without a place, and a number outside the
scale places it outside.

## Rule Details

This rule applies to user journey diagrams (`journey`). It reports a task's
score when mermaid.js does not read it as a number from 1 to 5, inclusive. The
score is the text after the first colon, up to the second colon if there is one,
read with JavaScript's `Number` after trimming whitespace. A colon in the name
of a task ends the name, so `Lunch at 12:30: 4: Me` has the score `30` and is
reported.

An empty or whitespace-only score is 0 and is reported. Other numeric forms are
checked by their value: `3.5` and `0x3` are not reported, while `1e2`, `-2`, and
`Infinity` are. A comment written in the score is part of it, so `a: 5 %% c` is
reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 5 Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 7: Me
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-invalid-score: error
journey
  section Work
    Make tea: 1: Me, Cat
```

## Options

This rule has no options.

## Further Reading

- [User Journey diagram syntax: score](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/userJourney.md#L24)
- [Issue #6262: faces out of bounds in journey diagrams](https://github.com/mermaid-js/mermaid/issues/6262)
- [Issue #4248: scale customization for user journeys](https://github.com/mermaid-js/mermaid/issues/4248)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-invalid-score.ts)
- [Tests source](../../tests/rules/journey-no-invalid-score.test.ts)

<!-- end auto-generated rule resources -->
