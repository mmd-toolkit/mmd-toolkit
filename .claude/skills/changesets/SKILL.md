---
name: changesets
description:
  Add the changeset that a change to a released package needs, in the same
  change. Use when a change touches `packages/parser`,
  `packages/prettier-plugin-mmd`, `packages/eslint-plugin`, or
  `packages/textmate-grammar` in a way a user of the package can see, when a
  change touches `packages/spec`, and before opening or updating a pull request.
---

# Changesets

The packages `@mmd-toolkit/parser`, `prettier-plugin-mmd`,
`@mmd-toolkit/eslint-plugin`, and `@mmd-toolkit/textmate-grammar` are published
from `main` with Changesets (CONTRIBUTING.md, Releases). The specification,
`@mmd-toolkit/spec`, is not published to npm but is released the same way: a
release gives it a version, a changelog entry, and the git tag
`@mmd-toolkit/spec@<version>`, so that an implementation can name the version of
the specification it follows and read what changed since. A change to one of
these five ships with a changeset in the same pull request; without it, the
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
"@mmd-toolkit/eslint-plugin": minor
---

One or two sentences, for the changelog, in the words of a user of the package.
```

- The front matter names every package the change touches, each with its bump.
  For a published package: `patch` for a fix that makes the package do what it
  already claimed; `minor` for a behavior a user can notice, a new rule, report,
  fix, or export; `major` for a change that breaks a published API after 1.0.
  For the specification, while its version is below 1.0: `minor` for a change
  that an implementation must follow (what is accepted, how it is read, the
  tree, the detection of a diagram type, a diagram type added or removed),
  `patch` for any other change (wording, examples, links, fixture citations).
- The sentences say what changed for the user and why it matters, not how it was
  implemented or reviewed. Name the rule, the option, or the diagram type
  concerned in backticks. For the specification, the user is an implementation:
  name the diagram type and the section that changed.
- Several unrelated changes in one pull request get one changeset each.
