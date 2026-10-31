# Contributing

Japanese version: [CONTRIBUTING.ja.md](./CONTRIBUTING.ja.md)

How to build and test this repository. The rules for changes, and what each
package is responsible for, are in [AGENTS.md](./AGENTS.md).

## Setup

The repository is a pnpm workspace. The supported Node.js versions are in
`engines` of [package.json](./package.json).

```sh
pnpm install
pnpm run build
```

## Checks

```sh
pnpm test
pnpm run lint
pnpm run format:check
```

- `pnpm test` runs the tests of every package.
- `pnpm run lint` runs ESLint, the type check, the document checks, and the
  check for invisible characters. Documents are in English with a Japanese
  version (`<name>.ja.md`). AI-written text is generously long every time,
  repeats itself tirelessly, and takes care to present even trivia as if it
  mattered: in a language other than the maintainer's own, picking out what is
  needed takes too long. So a change made with an AI agent includes the Japanese
  version; the agent writes it, following the agent instructions in this
  repository. A hand-written change may omit it; an agent adds it later. Do not
  link to a Japanese version that does not exist.
- `pnpm run format:check` checks the formatting with Prettier; `pnpm run format`
  applies it.
- `pnpm run update` writes the files that are generated from the sources: today,
  the list of the rules of `@mmd-toolkit/eslint-plugin` and the generated parts
  of its rule documents. `pnpm run lint` fails when they are out of date.

## Releases

Releases are made with [Changesets](https://github.com/changesets/changesets).
On a push to `main`, the Release workflow opens a pull request that bumps the
versions and writes the changelogs. It makes that pull request with
`pnpm run version:ci`, which runs `changeset version` and then
`pnpm run update`, so the generated files in it are up to date. Merging that
pull request publishes the packages. The specification, `@mmd-toolkit/spec`, is
not published to npm; a release gives it a version, a changelog entry, and the
git tag `@mmd-toolkit/spec@<version>`.

## Where things are

| Path                           | Contents                                                           |
| ------------------------------ | ------------------------------------------------------------------ |
| `packages/spec`                | The specification.                                                 |
| `packages/tests`               | The fixtures, and what compares an implementation with mermaid.js. |
| `packages/parser`              | The parser.                                                        |
| `packages/prettier-plugin-mmd` | The Prettier plugin.                                               |
| `packages/eslint-plugin`       | The ESLint plugin.                                                 |
| `packages/textmate-grammar`    | The TextMate grammar.                                              |
| `.claude`                      | The skills, settings and hooks of Claude Code.                     |
| `tools`                        | Command-line tools that maintain the fixtures.                     |
| `scripts`                      | The checks that `pnpm run lint` runs.                              |

Each package keeps its notes for contributors under its own `docs/` directory.
