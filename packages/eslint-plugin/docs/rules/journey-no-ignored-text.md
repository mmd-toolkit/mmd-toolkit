# @mmd-toolkit/journey-no-ignored-text

Japanese version:
[journey-no-ignored-text.ja.md](./journey-no-ignored-text.ja.md)

Disallow text in the data of a task that mermaid.js does not read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A colon written between two people, as in `Make tea: 5: Me: Cat`, drops the
people after it: mermaid.js reads the data of a task only up to its third colon
and drops the rest without an error. The data of a task is its score and its
people, separated by a colon, and the people are separated by commas.

## Rule Details

This rule reports the text of the data of a task from its third colon, when it
holds anything but colons and whitespace. It applies to `journey`.

`Make tea: 5: Me: Cat` is a task with the person `Me` only, and
`A: 3: a,b: c, d` has the people `a` and `b`. A third colon with nothing after
it, as in `Make tea: 5: Me:`, drops nothing, and the rule does not report it. A
directive in the dropped text is not part of it: `A: 5: Me: a%%{init: {}}%%b`
drops `ab`, and `Make tea: 5: Me:` followed by a directive drops nothing.

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
