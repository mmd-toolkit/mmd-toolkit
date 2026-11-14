# Checking the recorded trees of a change

Japanese version: [recorded-trees.ja.md](./recorded-trees.ja.md)

This document explains the command that checks the recorded trees (`ast.json`)
that a change adds or rewrites. It runs [`checkTree()`](./check-tree.md) on
them, and it lists the conditions of the documents of the tree that
`checkTree()` is not shown to check, for a person to read against the trees,
with the answers that the change gives.

```sh
pnpm --filter @mmd-toolkit/tests run recorded-trees:check --base <ref> [--places]
```

## Why

`checkTree()` reports a condition only when it has a rule for it. A tree that
breaks a condition without a rule passes with no problem: "no problem" says that
the rules hold, not that the tree is right. So each condition that the documents
of the tree state is either shown to be checked by `checkTree()`, with test
cases in which it reports a tree that breaks the condition, or read by a person
against the trees that a change records. The table of what is shown is the
coverage table below; the readings are the answers, kept in files, so that a
missing reading is found by the command and not by memory.

## Running it

- `--base <ref>` is required. The base is the merge base of `<ref>` and `HEAD`,
  and the change is everything of the working tree that differs from it: the
  commits after the base, what is not committed, and the files that git does not
  track yet. With no default, a run after a commit cannot check nothing by
  mistake.
  - Right after recording, the records of that step alone: `--base HEAD`.
  - The whole pull request: `--base origin/main`.
- `--places` prints every place of each item: the node or the token, with the
  text of the input at it.

The exit code is 1 when a checked tree has a problem of `checkTree()`, when a
record cannot be read (its `ast.json` is not JSON or its `input.mmd` is
missing), when a tree has a node type that is classified neither as a value node
nor as a structure node, when an answer file cannot be read, or when an item or
a changed tree has no answer. It is 2 for a wrong use of the command and for an
error of git (a base that does not exist, a history too shallow for the merge
base). It is 0 otherwise: stale rows of the table, items that the table does not
judge yet, and items whose key changed do not fail it.

## The changed trees

A changed tree is a fixture whose `input.mmd` or `ast.json` the change adds,
changes or removes, and that has an `ast.json` now. The paths are compared one
by one (`git diff --no-renames`): git's guess of a rename is not used, since it
can pair two unrelated fixtures whose records happen to be equal. A renamed tree
is a changed tree; its answers are found by its content (see Answers).

The command counts the `ast.json` that the change removes, and lists the
`parse-error.json` that it changes without reading them.

## When every recorded tree is checked

`tools/src/recorded-trees-run.ts` (the runner) runs the check on one tree. The
files that it reaches by its imports at run time, read with the TypeScript
parser (`tools/src/runtime-imports.ts`), decide the result of the check. When
the change changes the runner or one of those files, the command checks every
recorded tree, and says which file made it.

The files that the runner reaches import only relative paths, by import and
export declarations. If one of them imports a package or a built-in module of
Node.js, calls `import()` or the global `require()`, or uses `import.meta`, the
files that decide the result cannot be known, and the command checks every
recorded tree and names the file and the read. The runner itself imports only
built-in modules of Node.js and relative paths: the version of a package that it
imported could change the result without changing a file of the repository.

## The blocks and the items

The documents of the tree are `packages/spec/docs/ast.md` and
`ast/<diagram>.md`, `packages/parser/docs/tokens.md` and `tokens/<diagram>.md`,
and `packages/parser/docs/positions.md` and `positions/<diagram>.md`, in
English. They are read as Markdown, as `pnpm run lint:md` reads them. A block is
a paragraph outside a list and a table, an item of a list (its own text: not the
lists and the tables in it, whose items and rows are blocks of their own), or a
row of the body of a table. The line `Japanese version: …` is no block.

An item is a block and a diagram type. A block of `<document>/<diagram>.md`
holds for that diagram type; a block of `ast.md`, `tokens.md` or `positions.md`
holds for every diagram type and for `error`, the trees whose body is an
`ErrorDiagram`. The diagram type of a tree is the one whose name, with its first
letter capitalized and `Diagram` after it, is the type of the body of the tree.

The places of an item are where it applies in a tree:

- A block under a heading that is a node type: the nodes of that type.
- A row of a table whose first heading cell is `Kind`, whose first cell is a
  token kind of `tokens.md`: the tokens of that kind, each with the innermost
  node that holds it.
- Any other block: the whole tree.

A place is written `<fixture> <type>@<start>-<end>` for a node,
`<fixture> <kind>@<start>-<end> in <node type>` for a token, and `<fixture> *`
for the whole tree. An item with no place in a tree is still read: a token of a
wrong kind is a place of the row of that kind, not of the row of the kind it
should have.

The cases of an item are the fixtures that its block cites (`[fixture: …]`): a
help for reading, not a part of the answer.

A block that links to a heading of `packages/spec/docs/common.md` or of a
document of `packages/spec/docs/diagrams/` reads its words as that section
defines them, so the section goes with the item. A section runs from its heading
to the next heading of the same depth or a smaller one. Its anchor is made from
the heading as `pnpm run lint:md` makes it to check a link (`github-slugger`). A
link without an anchor names no section.

## Keys

The key of a block is `<document>:<hash>`, where the hash is the first 12
hexadecimal digits of the SHA-256 of its key text. The key text is, line by
line:

- `under <type>` when the block is under a heading that is a node type: the same
  row of fields under two node types states two conditions;
- the text of the block;
- the text of each section that it links to, in the order of the links, or
  `<target> names no section` when the anchor names no heading.

Every part is taken without its fixture citations, and with every run of
whitespace made one space. A citation names a case and does not change the
condition, and Prettier may wrap the text again, so neither changes the key.
When two blocks of one document have the same key text, the second has `.2`
after its hash, the third `.3`.

The key of an item is `<block key>@<diagram>`. The content key of a tree is
`<input>:<tree>`, the git blob ids of its `input.mmd` and `ast.json`.

## The coverage table

`packages/tests/src/check-tree/coverage.ts` holds the table. A row gives one
judgment of one block (`block`, its key) for the diagram types it names
(`diagrams`); `about` holds the opening words of the block for a person who
reads the table, and is not compared. A judgment is one of:

- `shown`: for each case that the block distinguishes, a test case in which
  `checkTree()` reports a tree that breaks the condition. A case is named by its
  test file under `packages/tests/tests/` and a string that the file holds, such
  as the name of the fixture that it breaks; a title is not used, since a test
  may build its title.
- `not-shown`: why, with a note. `no-rule`: no rule of `checkTree()` is about
  the condition. `rule-misses-condition`: a rule is about it, but a case that
  breaks a part of it is not reported.

An item without a row is not judged yet. A row counts only when its block has
that key now, every case that it names is still in its test file, the block
holds for each of its diagram types, and no earlier row covers one of its items.
Otherwise it is stale: the command lists it, and its items are read again. The
items to read are those that are not `shown`, judged or not.

A change that makes a row stale, or that adds a block, has the judgment made
again by `packages/tests` in the same pull request: the coverage table is a
shared interface of the documents of the tree. The review of the change checks
that the command lists no stale row and no item that is not judged; the command
does not fail on them, so that a change of the documents alone is not stopped by
a machine.

## Answers

The answers of a change are in one file of
`packages/tests/recorded-trees/answers/` (`<name>.json`), kept after the change
is merged and not rewritten by a later change:

```json
{
  "items": [
    {
      "item": "packages/spec/docs/ast/er.md:0123456789ab@er",
      "trees": [
        { "key": "<input blob>:<tree blob>", "fixture": "er/gram-alias" }
      ],
      "answer": "…"
    }
  ],
  "trees": [
    {
      "key": "<input blob>:<tree blob>",
      "fixture": "er/gram-alias",
      "answer": "…"
    }
  ]
}
```

- `items` answer the items: one answer for each item, for the trees named by
  their content keys.
- `trees` answer the reading of each changed tree against the sentences that
  cite its fixture.
- `fixture` is for a person who reads the file. It is not compared: a renamed
  tree is still covered by its content, and the name is not corrected when it
  goes out of date.

An item has an answer for a changed tree when an answer of any file covers the
item and the content key of the tree; a changed tree has an answer when an entry
of `trees` covers its content key. What the text of an answer says is defined by
the steps of the work of recording, not here.

- An answer of a file at the base answers the item for good: the item is not
  asked again, and the command lists it only by its key. A tree that is renamed
  or moved is covered so.
- An answer that the change adds leaves the item in the list, with a note that
  the change answers it: the reviewer reads the same items, without reading the
  answers first.
- An answer whose item key or content key no longer matches is not used, does
  not fail the check, and is not removed: it records what was read then.

The reviewer's answers are in the report of the review, not in these files.

## What it prints

The command prints Markdown, the same on a terminal and in the log of CI:

1. Which trees it checked: the changed trees, or every recorded tree and why.
2. The counts: trees checked, changed trees by diagram type, removed `ast.json`,
   changed `parse-error.json`.
3. The problems: each problem of `checkTree()` with its tree, the records that
   cannot be read, the node types that are not classified, and the answer files
   that cannot be read.
4. The items to read, by diagram type: the key, the document and the line, the
   judgment (not shown, or not judged yet), the opening of the block, the number
   of places, the cases, the sections to read with it, and whether an answer of
   the change covers it; the places themselves with `--places`. Then the items
   that the base answers.
5. For each changed tree, the sentences that cite its fixture: the
   `[fixture: …]` of the documents of `packages/spec/docs`,
   `packages/parser/docs` and `packages/tests/docs`, and the
   `[corpus fixture: …]` of those of `packages/prettier-plugin-mmd/docs`, whose
   `[fixture: …]` names fixtures of the formatter. A tree that no sentence cites
   says whether the change adds its fixture.
6. The missing answers, and a template of an answer file with the keys filled
   and the answers empty. The command writes no file.
7. The stale rows of the coverage table, with why.
8. The items of every document that the table does not judge, by document and
   line.
9. The items whose key changed since the base, with what changed (the text of
   the block, or which section) and the fixtures to read against the new text:
   those of the block when its own text changed; and, in each section that
   changed, those of the blocks that only one of the two versions has, as that
   version cites them, of the diagram type of the item. When only a section
   changed, the fixtures of the block itself show no case of the change and are
   not read. Each fixture comes with its content key, or says that it has no
   tree or no longer exists; with `--places`, with the places of the item in its
   tree.
10. The `parse-error.json` of the change, which it does not read.

## Until the table is judged

Until every item of the coverage table is judged,
`tests/check-tree-corpus.test.ts` runs `checkTree()` on every recorded tree in
every run of the tests, and this command is not part of CI.
