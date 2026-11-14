# When mermaid.js is upgraded (spec)

Section numbers below are those of [SKILL.md](../SKILL.md).

Input: the pin of mermaid.js is raised, and the differences of `fixtures:check`
are sorted (the tests-mermaid-update SKILL).

1. Change the pinned version and commit in index.md (recorded in one place).
2. Move every permalink to the new commit. Collect the URLs with the old commit
   from the documents; for each link, find the function in the same file of the
   new version and adjust the line range. Reread the claim of every link whose
   function moved, disappeared, or was renamed. Then run `pnpm run lint:docs`,
   which reports any link to mermaid.js that still points to another commit.
3. For each fixture that changed, reread the claims that cite it, and follow the
   new reading of mermaid.js.
4. Check that each Known divergence identifier still holds.
5. Check the order and the list of detectors in detection.md against the new
   version.
6. Show the result as in section 7.
