# Changing the shared tree (spec)

Section numbers below are those of [SKILL.md](../SKILL.md). The steps of section
10, in one pass:

1. Review the shared part as a whole, not only the sentence that prompted the
   change. List every sentence that depends on what changes, in `ast.md`,
   `common.md`, and every `ast/<diagram>.md` and `diagrams/<diagram>.md`, with
   what it becomes. When the change accepts a form in new places, list its
   places and the values read from ranges first, as item 5 of section 6 says.
2. Write the proposal outside the repository: the options for each point that
   needs a decision, with a recommendation, and the effect on the packages that
   read the tree. Wait for the decision.
3. Write the revision in one change, in English and in Japanese, and check that
   the fixtures cited by the changed sentences still record what the sentences
   say.
4. Write one list of changes for the packages that read the tree, outside the
   repository: for each package what it must change, which records or ranges
   change, how to find the fixtures whose `ast.json` changes, and the invariants
   that the tree check must test.
