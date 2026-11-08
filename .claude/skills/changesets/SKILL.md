---
name: changesets
description:
  Add the changeset that a change to a released package needs, in the same
  change. Use when a change touches `packages/ast`, `packages/parser`,
  `packages/prettier-plugin-mmd`, `packages/mmdfmt`, `packages/eslint-plugin`,
  or `packages/textmate-grammar` in a way a user of the package can see, when a
  change touches `packages/spec`, and before opening or updating a pull request.
---

# Changesets

The packages `@mmd-toolkit/ast`, `@mmd-toolkit/parser`, `prettier-plugin-mmd`,
`mmdfmt`, `@mmd-toolkit/eslint-plugin`, and `@mmd-toolkit/textmate-grammar` are
published from `main` with Changesets (CONTRIBUTING.md, Releases).
`@mmd-toolkit/ast` and `@mmd-toolkit/parser` are a `fixed` group of
`.changeset/config.json`: a bump of one bumps the other to the same version, so
a changeset names only the package that changed. The specification,
`@mmd-toolkit/spec`, is not published to npm but is released the same way: a
release gives it a version, a changelog entry, and the git tag
`@mmd-toolkit/spec@<version>`, so that an implementation can name the version of
the specification it follows and read what changed since. A change to one of
these seven ships with a changeset in the same pull request; without it, the
change is left out of the next version's changelog and its version bump.

## When a changeset is needed

- A change to what a published package does: what the parser accepts or puts in
  the tree, what the formatter prints, what a lint rule reports or fixes, a
  message, a rule added or removed, an option, an exported type or function,
  what the grammar colors a unit as, a scope, the version of the specification
  that the grammar follows.
- Any change to `packages/spec`.
- Not needed: a change only to tests, fixtures, the private packages that have
  no versions (`tests`, `docs`, `playground`; the `ignore` list of
  `.changeset/config.json`), the repository's documents and skills, tooling, or
  CI.

Check before the pull request: `pnpm exec changeset status --since=origin/main`
fails when a package changed on the branch has no changeset, and lists the bumps
otherwise. It reads changeset files that are staged or committed; an untracked
file is not seen.

## How to write it

One file `.changeset/<short-kebab-name>.md`:

```md
---
"prettier-plugin-mmd": minor
---

Print a one-line `@{ ... }` with one space inside each end: `A@{shape: rect}`
becomes `A@{ shape: rect }`.
```

The text goes as it stands into the changelog of every package in the front
matter and into the release pull request, where a user reads it to decide
whether to upgrade.

What one changeset holds:

- One change that a user would name in one phrase. A pull request with several
  changes has a changeset for each, and a change to one form in several diagram
  types is one change.
- One package, with its bump. A change that reaches several packages has a
  changeset for each, saying what changes for the users of that package: text
  about another package tells them nothing. For a `fixed` group, name only the
  package that changed. A package that only takes a new version of a dependency
  needs none: its changelog lists the update.
- A change that is not released yet has one entry. When a later change extends
  it, edit the file in `.changeset/` instead of adding a second one.

How it reads:

- At most two sentences. The first starts with what changes, as a verb (`Print`,
  `Report`, `Accept`, `Fix`). The second, only if it is needed, says what the
  user has to do.
- A change of what the formatter prints shows one example, before and after. A
  change of what a lint rule reports names the rule and shows one reported form.
- Leave out the forms that stay as they were and the conditions of a rule: the
  rules documents hold them. Name one only when a user would take it for a bug
  or has to act on it.
- Use the words of a user of the package. A word from the rules documents or the
  specification (`Db`, a kept line, the tree) and a comparison with what another
  diagram type does tell that user nothing. Say what changed, not how it was
  implemented or reviewed, and why only if the user can act on it.
- A change that makes code of a user stop working says first what to change in
  that code.
- Name the rule, the option, or the diagram type concerned in backticks. For the
  specification, the user is an implementation: name the diagram type and the
  section that changed.

The bump: for a published package, `patch` for a fix that makes the package do
what it already claimed; `minor` for a behavior a user can notice, a new rule,
report, fix, or export; `major` for a change that breaks a published API after
1.0. For the specification, while its version is below 1.0: `minor` for a change
that an implementation must follow (what is accepted, how it is read, the tree,
the detection of a diagram type, a diagram type added or removed), `patch` for
any other change (wording, examples, links, fixture citations).

Before the pull request, read the files in `.changeset/` for each package
together, as its changelog will show them: an entry that repeats another is
merged with it, and one that holds two changes is split.
