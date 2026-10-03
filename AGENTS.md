# AGENTS.md

Instructions for agents (and people) working in this repository. The Japanese
version is `AGENTS.ja.md`.

## Project

A third-party project unrelated to mermaid-js. For the Mermaid text syntax
(`.mmd`), covering every diagram type that mermaid.js has, it builds these five
things.

| Package                        | npm name              | Contents                             |
| ------------------------------ | --------------------- | ------------------------------------ |
| `packages/spec`                | `@mmd-toolkit/spec`   | Syntax specification (private)       |
| `packages/tests`               | `@mmd-toolkit/tests`  | Conformance corpus (private)         |
| `packages/parser`              | `@mmd-toolkit/parser` | Parser that returns an AST           |
| `packages/prettier-plugin-mmd` | `prettier-plugin-mmd` | Formatter, as a Prettier plugin      |
| `packages/eslint-plugin-mmd`   | `eslint-plugin-mmd`   | Linter, as an ESLint language plugin |

Correctness is defined by the pinned mermaid.js.

1. Accept and reject the same inputs as mermaid.js. The exceptions are the
   inputs that the specification defines in its Known divergences
   (`packages/spec/docs/known-divergences.md`), each with an identifier that
   marks the fixtures it affects.

   An input becomes a divergence only after two questions, asked in this order.
   Whoever proposes a divergence writes down the answer to both, and a proposal
   without the answer to the first is not decided.

   1. Can the tree hold what was written, so that the input is read as
      mermaid.js reads it? Text that mermaid.js does not read, drops, or reads
      as something other than what is written is a node wherever it can be one
      (`FlowchartIgnoredText`, an empty description block that starts a
      statement, `create destroy A`): the input is then accepted, shown in the
      tree as written, and a misreading is left to a lint rule. This question
      comes first whatever the cause of the behavior, also where the second or
      the third reason below seems to apply. That mermaid.js does not read a
      text, and that nobody would write it, are not reasons to reject it.
   2. Only where no node can hold it: an input that mermaid.js accepts is
      rejected, or read differently, as a divergence, and only for one of these
      reasons:
      - Text that mermaid.js does not read has no place of its own in the tree.
      - The specification states a direct rule where the behavior of mermaid.js
        comes from the order of the steps of its pipeline and is nothing a
        specification would state (a directive inside a keyword, a comment that
        takes the character before it). The inputs that are then read
        differently are the divergence.
      - The maintainers of mermaid.js treat the behavior as a defect (the
        reserved word `click`).

   Before proposing a divergence for a behavior that looks like a defect, read
   what the documentation of mermaid.js says about that syntax, search its
   issues and pull requests, and cite what is found as fact.

2. For accepted inputs, the Db matches mermaid.js, except where a Known
   divergence defines that an input is read differently.
3. The AST loses nothing of the input: every character of the input is in a
   token or a comment, or is whitespace or a line terminator, and the text of
   each token and comment equals the input at its range. Whitespace and line
   terminators are not nodes; with the source text and the ranges, the input is
   reproduced byte for byte.
4. Formatting is idempotent and does not change the Db.

The diagram types are done one at a time; flowchart and sequence are done.
Release only after every diagram type is done.

## What each package is responsible for

The policies and criteria of a package are in the section Policies and criteria
of its skill under `.claude/skills/`. Read that skill before working on the
package.

- `packages/tests`, with the CLIs in `tools/`: pins mermaid.js, extracts its Db,
  defines the fixture format, and holds the conformance corpus and the tools
  that generate and check it. Skill `tests`.
- `packages/spec`: defines the syntax and the abstract syntax tree. It is the
  source of the definition; implementations follow it. Skill `spec`.
- `packages/parser`: the reference implementation of the specification. Every
  behavior it implements comes from the specification and the fixtures, never
  from the source of mermaid.js. Skill `parser`.
- `packages/prettier-plugin-mmd`: the formatter, with one printer for each
  diagram type, following formatting choices that are decided explicitly, item
  by item. Skill `prettier-plugin`.
- `packages/eslint-plugin-mmd`: the linter, an ESLint language plugin. A rule
  reports a mistake of the author that mermaid.js accepts without a word and
  reads as something other than what was meant. Which rules exist is decided
  with the skill `rule-ideas`; their documents follow the skill `eslint-plugin`,
  and their implementation the skill `eslint-plugin-rules`.

## Shared interfaces

Changing one of these affects the packages that use it; tell them before
changing it.

| Interface                                       | Defined in     | Used by                                |
| ----------------------------------------------- | -------------- | -------------------------------------- |
| Fixture format and loader                       | tests          | spec, parser, prettier-plugin          |
| Function that extracts mermaid's Db             | tests          | parser, prettier-plugin                |
| Generator and mutation-diff CLIs                | tests          | spec, parser                           |
| Db normalization format                         | tests and spec | parser                                 |
| AST definition (`docs/ast.md`, `docs/ast/*.md`) | spec           | parser, prettier-plugin, eslint-plugin |
| The `parse()` API                               | parser         | prettier-plugin, eslint-plugin         |

## Principles

- Do not take a claim at face value, whoever makes it. Check it against the
  specification and against what mermaid.js actually does before acting.
- Do not write code that depends on a shared interface before it has been
  defined and announced. Do the independent parts first.
- Objections to a design are made with the code open, not from memory, and with
  evidence: code, mermaid's actual output, or the place in the specification.
  When shown to be wrong, withdraw.
- Always put readability first. Prefer an explicit definition that a reader
  understands on sight over tricks such as inferring types from values or
  over-generalizing. Keep duplicates consistent with types and tests.
- Always build the proper form, not a form that merely works. Do not leave a
  structure that repeats the same decision in several places, relies on callers
  keeping an unwritten promise, or reproduces a foreign pipeline where a direct
  rule would do. When the proper form is unclear, ask before writing it.
- The conventions for code and documents are in the skill `conventions`. Read it
  before writing code or a Markdown document. In short:
  - No regular expressions in `packages/parser` and
    `packages/prettier-plugin-mmd`.
  - No empty JSDoc, no stubs of an autofix, no commented-out code; read the
    result of every autofix.
  - No invisible characters written literally (`pnpm run lint:chars`). The
    fixtures of the conformance corpus are the only exception.
  - Every Markdown document is in English with a `.ja.md` pair, changed in the
    same change, and a link to the source of mermaid.js is a permalink of the
    pinned commit (`pnpm run lint:docs`).
  - Prose is wrapped at 80 columns: in English by Prettier
    (`pnpm run format:check`), in Japanese by the author, which no check
    enforces.
  - A code block of Mermaid text has the info string `mmd` and is written as the
    formatter prints it, unless the example is there to show a way of writing.
  - Run the tests that a change can affect, and the whole suite of the package
    once before reporting the work as done; the runs at full size once for each
    step of the plan.
- Commit and push only when the user says so.
