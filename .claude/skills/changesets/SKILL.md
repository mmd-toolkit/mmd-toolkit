---
name: changesets
description:
  Add the changeset that a change to a published package needs, in the same
  change. Use when a change touches `packages/parser`,
  `packages/prettier-plugin-mmd`, or `packages/eslint-plugin` in a way a user of
  the package can see, and before opening or updating a pull request.
---

# Changesets

The packages `@mmd-toolkit/parser`, `prettier-plugin-mmd`, and
`@mmd-toolkit/eslint-plugin` are published from `main` with Changesets
(CONTRIBUTING.md, Releases). A change that a user of one of them can see ships
with a changeset in the same pull request; without it, the change is left out of
the next version's changelog and its version bump.

## When a changeset is needed

- A change to what a published package does: what the parser accepts or puts in
  the tree, what the formatter prints, what a lint rule reports or fixes, a
  message, a rule added or removed, an option, an exported type or function.
- Not needed: a change only to tests, fixtures, the private packages (`spec`,
  `tests`), the repository's documents and skills, tooling, or CI.

Check before the pull request: `pnpm exec changeset status --since=origin/main`
fails when a published package changed on the branch has no changeset, and lists
the bumps otherwise. It reads changeset files that are staged or committed; an
untracked file is not seen.

## How to write it

One file `.changeset/<short-kebab-name>.md`:

```md
---
"@mmd-toolkit/eslint-plugin": minor
---

One or two sentences, for the changelog, in the words of a user of the package.
```

- The front matter names every published package the change touches, each with
  its bump: `patch` for a fix that makes the package do what it already claimed;
  `minor` for a behavior a user can notice, a new rule, report, fix, or export;
  `major` for a change that breaks a published API after 1.0.
- The sentences say what changed for the user and why it matters, not how it was
  implemented or reviewed. Name the rule, the option, or the diagram type
  concerned in backticks.
- Several unrelated changes in one pull request get one changeset each.
