# Updating mermaid.js (parser)

Section numbers below are those of [SKILL.md](../SKILL.md).

Input: the fixtures regenerated with the new version and their differences,
classified (the tests-mermaid-update skill), and the specification updated for
it (the spec skill). The parser does not change behavior before the
specification does.

1. Read the changed sections of the specification, and check each changed rule
   as in 4.2, step 2.
2. Fix what is tied to the version. A `grep -rn` for the old version number in
   `packages/parser` finds it in the README and `docs/development.md`, each with
   its `.ja.md`. The links to the source of mermaid.js are permalinks of the
   pinned commit: replace each with the link at the new commit, from the table
   of old and new links that the update of the specification gives, and check
   them with `node scripts/check-mermaid-links.mjs`.
3. When diagram type ids are added or changed: following `detection.md` and the
   DiagramType of `ast.md`, fix `src/detection.ts`, `DiagramType` in
   `packages/ast/src/ast.ts`, `allDiagramTypes` in `tests/types.test.ts`, and
   `tests/detection.test.ts`. An added id first goes into
   `DIAGRAM_TYPES_WITHOUT_BODY` of `tests/fixtures.test.ts`; then write its body
   (section 4), and make these fixes and remove the id from the list in the
   change that adds the body.
4. Check that tables copied from lists of the specification (in the flowchart,
   the letter ranges of `src/unicode-letters.ts`, which flowchart and class
   share) still agree with it.
5. Classify the differences of the trees as in 4.7, step 4, and check as in 4.8.
6. Show as the result: what was fixed, the number of differences of the trees by
   kind, the answer for each rewritten tree (4.7, step 3), and the mismatches
   that remain.

Where a step does not hold at an update, correct it.
