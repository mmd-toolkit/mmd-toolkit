# @mmd-toolkit/journey-no-empty-person

Japanese version:
[journey-no-empty-person.ja.md](./journey-no-empty-person.ja.md)

Disallow a person of a task that has no name.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The people of a task are written after its second colon, separated by commas. An
empty place in the list, as after a comma at its end, is a person with an empty
name for mermaid.js, which adds that person to the journey and to its legend
without an error.

## Rule Details

This rule reports each person of a task that is empty or whitespace only. It
applies to `journey`.

`Make tea: 5: Me,` has the people `Me` and an empty name, and so has
`A: 3: a,,b` between `a` and `b`. A second colon with nothing after it, as in
`Make tea: 5:`, gives the task one person with an empty name; without the second
colon, as in `Make tea: 5`, the task has no people, and the rule does not report
it. A person of whitespace only, as in `A: 3: ` followed by a space, is empty
too.

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

## Background

mermaid.js trims each person and gathers the people of every task, an empty name
among them, into the actors of the journey, which the legend shows
([`updateActors`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L49-L58)
and
[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)).

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-empty-person.ts)
- [Tests source](../../tests/rules/journey-no-empty-person.test.ts)

<!-- end auto-generated rule resources -->
