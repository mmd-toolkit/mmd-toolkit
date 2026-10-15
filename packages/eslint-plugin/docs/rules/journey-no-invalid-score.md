# @mmd-toolkit/journey-no-invalid-score

Japanese version:
[journey-no-invalid-score.ja.md](./journey-no-invalid-score.ja.md)

Disallow a task score that is not a number from 1 to 5.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A missing colon, as in `Make tea: 5 Me`, or a colon in the name of a task, as in
`Lunch at 12:30: 4: Me`, moves other text into the score. mermaid.js accepts it
without an error: a score that is no number gives the face of the task no place,
and a number outside the scale places it outside. The score of a task, the text
between its first and its second colon, is a number from 1 to 5, which places
the face on the scale of the journey.

## Rule Details

This rule reports the score of a task when it is no number, or a number below 1
or above 5, as mermaid.js reads it. It applies to `journey`.

mermaid.js reads the score with the `Number` of JavaScript, without the
whitespace at its ends. In `Make tea: 5 Me`, the colon before the people is
missing, and the score is `5 Me`, no number, with no people; so it is for
`Make tea: 5, Me`, and for a second task on the same line, as in `A: 5 B: 3`,
whose score is `5 B`. A colon in the name of a task ends the name:
`Lunch at 12:30: 4: Me`, which the formatter prints as `Lunch at 12: 30: 4: Me`,
is the task `Lunch at 12` with the score 30 and the person `4`, and
`Meet at 9:00: 3` has the score 0. A score that is empty or whitespace only, as
in `A: : x`, is the number 0, and the rule reports the task. Numbers in other
forms are read as numbers: `3.5` and `0x3` are in the scale and are not
reported, and `1e2`, `-2`, and `Infinity` are outside it. A comment written in
the score, as in `a: 5 %% c`, is part of it.

What each report marks in the output:

- A score that is no number, as `5 Me`, is lost: the face has no place, and the
  people written in the score are lost with it.
- A number outside the scale, as `7`, `0`, `-2`, `1e2`, or `Infinity`, does not
  place the face on the scale, which is what a score does: the
  [documentation of mermaid.js](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/userJourney.md#L22-L24)
  defines the score as a number from 1 to 5, inclusive, and mermaid.js draws the
  face outside the scale.
- An empty score adds a score 0 that was not written, outside the scale too.

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

## Background

mermaid.js turns the score into a number with `Number`
([`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84))
and places the face by it when it draws the journey
([`drawTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/svgDraw.js#L216-L220)).
Its documentation
([syntax/userJourney.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/userJourney.md#L24))
says that the score is a number between 1 and 5, inclusive.
[#6262](https://github.com/mermaid-js/mermaid/issues/6262) ("Faces in Journey
Diagram Out of Bound"), open with the labels "Type: Bug / Error" and "Status:
Approved", reports faces drawn over the lines of the journey for scores above 7,
and [#4248](https://github.com/mermaid-js/mermaid/issues/4248) ("Add scale
customization to User Journey"), open as an enhancement, proposes a scale of the
author's choice.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-invalid-score.ts)
- [Tests source](../../tests/rules/journey-no-invalid-score.test.ts)

<!-- end auto-generated rule resources -->
