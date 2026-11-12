# Tests after writing (eslint-plugin)

Section numbers below are those of [SKILL.md](../SKILL.md). Item 6 of section 5:

A change to documents only runs these checks and no tests (the skill
`conventions`, [Running tests](../../conventions/SKILL.md#running-tests)). The
exception is a change to what a test reads: the examples (the code blocks after
the two lines of section 3) or the rule files. Then run
`tests/rule-cases.test.ts` and the test of the rule,
`tests/rules/<name>.test.ts`, and `pnpm run check:docs` for the first paragraph
and the generated parts. A changed example changes its snapshot: update it with
`pnpm --filter @mmd-toolkit/eslint-plugin run test:update` and read the diff.
Which tests go with which change is in the skill `eslint-plugin-rules`,
[section 4](../../eslint-plugin-rules/SKILL.md#4-tests-and-fixtures).
