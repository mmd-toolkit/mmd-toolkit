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
lists the bumps that the changesets of the branch give. It fails only when a
package changed on the branch and the branch has no changeset at all; it does
not check that each changed package has one, so compare its list with the
packages the branch changes. It reads changeset files that are staged or
committed; an untracked file is not seen.

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
  user has to do. The entry is kept short by leaving things out, not by joining
  sentences with a semicolon or a comma.
- A change of what the formatter prints shows one example, before and after; a
  change that goes both ways, such as quotes added to some texts and removed
  from others, shows one of each. A change of what a lint rule reports names the
  rule and shows one reported form.
- A change of what the formatter prints that overturns a decision of a released
  version, so that an input it printed one way on purpose now prints another
  way, adds two sentences after the first: what the earlier rule did and why,
  and what was wrong with it as a user sees it; then how the new rule fixes that
  and keeps what the earlier rule was for, naming one kept case at most, for
  example `such as a text with a comma`. Such an entry has three sentences, or
  four with the one of what the user has to do.
- Such a change names the released version that introduced the decision it
  overturns, where that was a later version than the first one of the package
  (`which 0.5.0 began to print without the space`).
- Where that version changed what is printed and the new change turns the output
  back the other way (0.5.0 took the space after a comma away, and the new
  change puts it back), the change also adds one line to the entry of that
  version in the `CHANGELOG.md` of the package, after the text of the entry and
  indented like it: `Overturned in the next release: ` and one sentence that
  says what is printed now. The line tells the reader of that entry that its
  change was reversed; it is not a history of later changes. No line is added
  where the earlier version left a form as written and the new change prints it
  in one form, where the new change carries the earlier one further or replaces
  its form with a third one, or to the entry of the first release, which changed
  nothing. `version:ci` replaces `the next release` with the version that
  Changesets gives the package (`scripts/stamp-overturned-notes.mjs`), so the
  changeset has to bump the package whose `CHANGELOG.md` holds the entry. Where
  a version that is already released reversed the change, the line names that
  version itself.
- Leave out the forms that stay as they were, the conditions of a rule, and the
  counts behind it, such as how many times the documentation of mermaid.js
  writes each form: the rules documents hold them. Name one only when a user
  would take it for a bug or has to act on it.
- Use the words of a user of the package. A word from the rules documents or the
  specification (`Db`, a kept line, the tree) and a comparison with what another
  diagram type does tell that user nothing. Say what changed, not how it was
  implemented or reviewed, and why only if the user can act on it or the change
  overturns a decision of a released version.
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
together, as its changelog will show them, against this section: an entry that
repeats another is merged with it, one that holds two changes is split, and one
that breaks a rule above is rewritten.
