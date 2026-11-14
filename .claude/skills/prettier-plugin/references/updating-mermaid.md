# When mermaid.js is updated (prettier-plugin)

Section numbers below are those of [SKILL.md](../SKILL.md).

1. Updating the pin of mermaid.js, regenerating the fixtures, and classifying
   the differences come first, with the tests-mermaid-update SKILL. Their
   results are the input.
2. Run the regular tests.
3. Classify the failures:
   - The Db of a corpus input or fixture differs before and after formatting:
     mermaid.js's lexing or grammar changed, and the premise of a printer rule
     (a section of the specification) changed. Fix the specification first (the
     spec SKILL), then the rule.
   - The acceptance or the Db of the input before formatting changed: not a
     printer problem. Write the fixture outputs again and read the diff.
   - An exception or a non-idempotent output: a missing printer rule.
4. When a rule changes, write it into the documents as in section 5, and bring
   the fixtures, the rules document, `docs/compatibility.md`, and the README
   along.
5. Check that the sections of the specification and the mermaid.js links that
   the rules' comments point to still match the new version.
6. Compute the versions that count for each diagram type again (the table in
   `docs/compatibility.md`, Versions of mermaid.js that count) and go through
   the table Forms kept for versions of mermaid.js that count, row by row. For a
   diagram type added during the period, its first minor version replaces the
   smallest minor version of its major version for that diagram type only. A
   rule none of whose named versions counts any longer for its diagram type is
   taken out, and the form that the rules of `docs/printed-form.md` give is
   printed; the published output changes, so a changeset goes with it. Write
   only the versions that still count for each diagram type into the rows that
   stay, and add a row, in the same change, for each new kind that the drawings
   of the new versions show.
