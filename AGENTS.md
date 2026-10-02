# AGENTS.md

Instructions for agents (and people) working in this repository. The Japanese
version is `AGENTS.ja.md`.

## Project

A third-party project unrelated to mermaid-js. For the Mermaid text syntax
(`.mmd`), covering every diagram type that mermaid.js has, it builds these five
things.

| Package                        | npm name              | Contents                                                         |
| ------------------------------ | --------------------- | ---------------------------------------------------------------- |
| `packages/spec`                | `@mmd-toolkit/spec`   | Syntax specification (private)                                   |
| `packages/tests`               | `@mmd-toolkit/tests`  | Conformance corpus (private)                                     |
| `packages/parser`              | `@mmd-toolkit/parser` | Parser that returns an AST                                       |
| `packages/prettier-plugin-mmd` | `prettier-plugin-mmd` | Formatter, as a Prettier plugin                                  |
| `packages/eslint-plugin-mmd`   | `eslint-plugin-mmd`   | Linter, as an ESLint language plugin (rules not implemented yet) |

Correctness is defined by the pinned mermaid.js.

1. Accept and reject the same inputs as mermaid.js. The exceptions are the
   inputs that the specification defines in its Known divergences
   (`packages/spec/docs/known-divergences.md`), each with an identifier that
   marks the fixtures it affects. An input that mermaid.js accepts is rejected
   only as such a divergence, and only for one of these reasons:
   - Text that mermaid.js does not read has no place of its own in the tree.
     Text that mermaid.js does not read is a node wherever it can be one
     (`FlowchartIgnoredText`, an empty description block that starts a
     statement), and such an input is accepted; that mermaid.js does not read a
     text is not a reason to reject it. The same holds for text that mermaid.js
     reads as something other than what is written (`create destroy A`): it is
     accepted, shown in the tree as written, and left to a lint rule.
   - The specification states a direct rule where the behavior of mermaid.js
     comes from the order of the steps of its pipeline and is nothing a
     specification would state (a directive inside a keyword, a comment that
     takes the character before it). The inputs that are then read differently
     are the divergence.
   - The maintainers of mermaid.js treat the behavior as a defect (the reserved
     word `click`).

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

### `packages/tests`, with the CLIs in `tools/`

- Pins mermaid as a devDependency and extracts mermaid's Db in Node (no DOM).
- Defines the fixture format; keeps the loader and the README in step with it.
- Provides the fixture generator and the mutation-diff harness. Whatever imports
  mermaid (Db extraction, normalizers, the mutation core) lives in subpaths of
  `@mmd-toolkit/tests`; the CLIs live in `tools/`.
- Provides the CI job that regenerates fixtures and fails when mermaid's
  behavior changed.
- For each diagram type: extracting the truth (normalizer) and collecting
  fixtures.

### `packages/spec`

- Defines the abstract syntax tree: in `docs/ast.md`, what every diagram shares
  (the root with its lists of tokens, comments, and directives, the token kinds,
  the leaf nodes for values that an author writes, the invariants); in
  `docs/ast/<diagram>.md`, one document per diagram type, that diagram's nodes.
  Every node type of a diagram starts with the diagram's name
  (`FlowchartVertex`, `FlowchartLink`): node types share one namespace across
  all diagram types, and other diagrams will want the same plain names. Token
  kinds and the shared leaf nodes (`Identifier` for a name or a single bare
  word, `StringLiteral` for a quoted string, `NumericLiteral` for a number) have
  the same form in every diagram and carry no prefix. Text without quotes that
  may contain whitespace is read differently by each diagram, so it is a literal
  node of the diagram (`FlowchartLiteral`). Which of these a field holds is
  decided by what the grammar allows at that position, not by how one example
  looks. As in ESTree, a name or a value that an author writes is such a leaf
  node with its own range, so that a tool can report on it or rewrite it without
  searching the tokens; only words from a fixed set (a direction, a shape name,
  the marker at an end of an arrow) are plain string fields. An arrow is a node
  of its own (`FlowchartArrow`, `SequenceArrow`), with the markers at its ends
  and the kind of its line as such fields, so that a tool reads them without
  reading the characters of the arrow again. A node type says what the node is,
  never how its text is lexed: there is no node type per token kind and no
  catch-all node. Nodes have no generic `children` list; punctuation and
  keywords appear only as tokens. Text that the author writes and mermaid.js
  does not read is a node of the tree wherever it can be one
  (`FlowchartIgnoredText`); making it a node comes before rejecting the input,
  and an input is rejected for such text only when the text has no place of its
  own in the tree. This is the source of the definition; implementations follow
  it.
- For each diagram type, `docs/diagrams/<diagram>.md` with its five sections,
  written from mermaid's grammar definition and Db class.
- Every claim in the specification has a fixture, added through the tests
  package's generator.
- The items in each Db normalization section match the tests package's
  normalizers.
- The specification introduces no single-letter or abbreviated symbols (no "let
  _T_ be the text", no italic one-letter names, no subscripts). Every concept is
  named in words each time, or given a meaningful multi-word name at the start
  of its section. Single-letter symbols only make the text harder to read.
- The specification contains no code in any programming language: no regular
  expressions, no TypeScript type definitions. Even where mermaid.js is
  implemented with regular expressions, acceptance conditions are stated in
  prose and grammar; the AST is defined with tables and prose, using
  language-neutral types (integer, string, list of nodes). The parser's `ast.ts`
  is an implementation of that definition, not its source. The specification is
  independent of any implementation language.

### `packages/parser`

- Is the reference implementation of the specification. Every behavior it
  implements comes from the specification (`docs/common.md`, `docs/ast.md`,
  `docs/ast/*.md`, `docs/diagrams/*.md`) and the fixtures. mermaid.js's source
  may be read to check what the specification says, never as the source of a
  behavior to implement. When the specification is silent on something, the
  parser does not fill the gap from mermaid's code; it reports the gap to the
  specification's owner.
- Implements the AST as TypeScript types with the same node names and field
  names: the shared part of `docs/ast.md` in `ast.ts`, and each diagram's nodes
  of `docs/ast/<diagram>.md` in `ast/<diagram>.ts`.
- Diagram-type detection and dispatch to per-diagram parsers.
- A test helper checks that the tokens, comments, directives, and frontmatter
  hold the input at their ranges and that only whitespace and line terminators
  lie outside them. It is not public API.
- Per-diagram parsers are hand-written lexers and recursive-descent parsers. No
  parser generators.
- Four test layers: accept/reject agreement, Db-equivalent JSON agreement,
  coverage of the input by the tokens and trivia, mutation diff. AST snapshots
  are kept.

### `packages/prettier-plugin-mmd`

- Dispatch to per-diagram printers.
- Input that fails to parse is returned unchanged.
- Mermaid fences in Markdown are handled and tested.
- Per-diagram printers follow formatting choices that are decided explicitly,
  item by item.
- Four tests: idempotence, Db agreement before and after formatting, no change
  on failure, fences in Markdown.

### `packages/eslint-plugin-mmd`

- Its rules are implemented before the release, after every diagram type is
  done. Until then it holds what does not depend on a rule (the package, the
  language that gives ESLint the tree, their tests) and the rule ideas: one
  document per idea under `docs/rules/`, written for the users of the rule, and
  one under `docs/rule-notes/` for whoever implements it, with how the tree
  shows what the rule reports and the fixtures that record what mermaid.js does.
  Each idea also has a rule file under `src/rules/` that reports nothing yet: it
  carries the name, the description, and whether the rule is recommended, and
  the list of the rules in `docs/rules/index.md` and the generated parts of the
  rule documents are written from these files (`pnpm run update`).
  `pnpm run lint:docs` fails when the rule files and the documents disagree.
- Is an ESLint language plugin (the `languages` of a plugin), not a custom
  parser: it gives ESLint the tree of `@mmd-toolkit/parser`, its tokens and
  comments, and its visitor keys.
- A rule reports a mistake of the author that mermaid.js accepts without a word
  and reads as something other than what was meant: a typing mistake, something
  left unclosed, broken JSON, an id used twice. Each rule is checked by running
  the pinned mermaid.js on an example of ordinary writing, and by formatting the
  example.
- The package holds no rule of these kinds:
  - A stylistic rule: mermaid.js reads the text as written, and only a later
    edit would break it.
  - A rule for text that is obscure on purpose.
  - A rule for a defect of mermaid.js: the author writes something correct and
    meaningful and mermaid.js misreads it (`subgraph Front end`, CSS in a
    label). Such a thing is reported to mermaid.js.
  - A rule whose condition also matches a way of writing that an author means
    (`A[Issue #123; fixed]` has the same form as the entity `#9829;`).
  - A rule for what the formatter of this project already makes visible: when
    the formatted text shows how mermaid.js reads it (`A---orders` is printed as
    `A ---o rders`), a rule would only be a second thing to maintain.
  - For now, a rule for a mistake that comes from not knowing the syntax, where
    the specification's grammar or text says that the way of writing means
    something else (`A"Start"` without brackets, `;` between styles).
- A rule is common only when one definition, over the part of the tree that
  every diagram type shares, covers every diagram type and they all behave the
  same; otherwise it belongs to a diagram type, in `docs/rules/<diagram>/`.
- A rule reads the tree and the tokens; it does not lex the text again. How the
  tree shows what a rule reports is checked by applying the condition to the
  result of `parse()`.

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
- No regular expressions in `packages/parser` and
  `packages/prettier-plugin-mmd`, in source and tests alike. The parser matches
  character by character on code points, and its tests state expectations with
  string comparisons. Elsewhere (`packages/tests`, `tools/`, `scripts/`), prefer
  string methods; a regular expression that is still needed carries the `u` flag
  and never the `i` flag (the ESLint rule `regexp/require-unicode-regexp` checks
  the former).
- Leave no empty JSDoc, no stubs generated by autofix, no meaningless comments,
  no commented-out code. Always read the result of an autofix such as
  `eslint --fix`. Known dangerous autofix: `regexp/no-missing-g-flag` rewrites
  `new RegExp(re)` to `new RegExp(re, "g")` and drops the original flags
  (`new RegExp(re.source, re.flags)` is not reported).
- Never put invisible characters (U+2028, U+2029, U+00A0, U+FEFF, control
  characters) literally into source or documents; write escapes, and check the
  bytes after writing. Fixture inputs that need the real characters are the
  exception.
- Commit and push only when the user says so.
- When a document refers to mermaid.js source code, it links to the exact lines
  on GitHub with a commit-hash permalink of the pinned version
  (`https://github.com/mermaid-js/mermaid/blob/<commit>/packages/mermaid/src/<path>#L<from>-L<to>`),
  with the function or file name as the link text. Bare file names or function
  names without such a link are not enough. The pinned commit is recorded once
  in `packages/spec/docs/index.md`. `pnpm run lint:docs` fails when a link to
  mermaid.js in a Markdown document points anywhere else.
- Every Markdown document in the repository (READMEs, everything under
  `packages/spec/docs/`, this document) is written in English, with a Japanese
  version of the same content next to it as `<name>.ja.md`. Both are updated in
  the same change: a change to an English document is not done until the
  `.ja.md` carries the same change. `pnpm run lint:docs` (part of
  `pnpm run lint` and CI) fails when a document has no pair. Generated tool
  files such as `.changeset/README.md` are exempt; `scripts/markdown-files.mjs`
  lists what the check covers.
- Prose in Markdown documents is wrapped at 80 columns by Prettier
  (`proseWrap: "always"` in `prettier.config.js`). Run `pnpm run format` after
  editing a document; `pnpm run format:check` fails otherwise. Do not write a
  check or a test that depends on where a line of prose breaks. Tables and code
  blocks are not wrapped, so keep table cells short and put long explanations
  below the table. Prettier does not wrap Japanese text, which has no
  whitespace, so it keeps the line breaks of the Japanese documents as written
  (`proseWrap: "preserve"` for `*.ja.md`), and their author writes the line
  breaks: one sentence on a line, and a long sentence broken after a `、` where
  the meaning pauses, so that no line of prose is longer than 80 columns,
  counting a full-width character as two.
- A code block that holds Mermaid text has the info string `mmd`, not `mermaid`
  and not `text`. GitHub highlights it and does not try to render it as a
  diagram, which matters because many examples are rejected or are edge cases on
  purpose. Whitespace at the end of a line does not survive in a code block, so
  an example that needs it is described in a sentence instead. A Mermaid example
  is written as the formatter of this project prints it (indentation, spacing
  around arrows), unless the example is there to show a way of writing: an input
  of the formatter, or text whose spacing is the point. An example taken from a
  fixture is the formatted form of the fixture's input; formatting does not
  change the Db, so the fixture still records what mermaid.js does with it.
