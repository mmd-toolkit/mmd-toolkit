# When the formatter changes what it prints (eslint-plugin)

Section numbers below are those of [SKILL.md](../SKILL.md).

1. Run `pnpm --filter @mmd-toolkit/eslint-plugin run update:docs`. It builds the
   parser and rewrites the examples of both languages.
2. Run `pnpm --filter @mmd-toolkit/eslint-plugin run test:update` and read the
   diff of the snapshots. An incorrect example that is no longer reported, or a
   correct example that now is, is kept as written (step 4 of section 4) or
   dropped. An example under `<!-- prettier-ignore -->` that the formatter now
   prints the same way is no longer kept: remove the mark and its sentence.
3. Search the prose of each changed document for the old forms: a code span that
   quotes a line the formatter changed. Write the new form, in both languages.
4. Where the change makes the formatter leave as written what it used to change,
   rebuild the affected examples from the `input.mmd` of their fixtures (step 4
   of section 4): formatting the old printed example does not give back the text
   of the fixture.
5. Run `pnpm run lint:docs`. Then run the tests of the documentation site, which
   render the examples of every rule document with the built plugin:
   `pnpm --filter @mmd-toolkit/eslint-plugin run build`, then
   `pnpm --filter @mmd-toolkit/docs run test`. The examples of the pages in
   `packages/docs/pages/linter` are written by hand; print them as the formatter
   prints them too.
