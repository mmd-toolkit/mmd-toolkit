# Reading items for the recorded trees of a change

Japanese version: [recorded-trees.ja.md](./recorded-trees.ja.md)

The command lists the recorded trees (`ast.json`) that a change adds or
rewrites, every applicable block of the tree, token, and position documents, and
whether each item and changed tree has an answer.

```sh
pnpm --filter @mmd-toolkit/tests run recorded-trees:check --base <ref> [--places]
```

## Running it

The CI job `recorded-trees` runs the command on a pull request only when a
commit between its base and head carries a `Co-Authored-By` trailer of Claude.

- `--base <ref>` is required. The base is the merge base of `<ref>` and `HEAD`,
  and the change is everything of the working tree that differs from it: the
  commits after the base, what is not committed, and the files that git does not
  track yet. With no default, a run after a commit cannot check nothing by
  mistake.
- `--places` prints every place of each item: the node or the token, with the
  text of the input at it.

The exit code is 1 when a record or answer file cannot be read, or an item or a
changed tree has no answer. It is 2 for a wrong use of the command (no `--base`,
or `--base` given twice), outside a git repository, and for an error of git (a
base that does not exist, a history too shallow for the merge base). It is 0
otherwise. Items whose key changed do not fail it by themselves.

## The changed trees

A changed tree is a fixture whose `input.mmd` or `ast.json` the change adds,
changes or removes, and that has an `ast.json` now. The paths are compared one
by one (`git diff --no-renames`): git's guess of a rename is not used, since it
can pair two unrelated fixtures whose records happen to be equal. A renamed tree
is a changed tree; its answers are found by its content (see Answers).

The command counts the `ast.json` that the change removes, and lists the
`parse-error.json` that it changes without reading them.

## The blocks and the items

The documents of the tree are `packages/spec/docs/ast.md` and
`ast/<diagram>.md`, `packages/parser/docs/tokens.md` and `tokens/<diagram>.md`,
and `packages/parser/docs/positions.md` and `positions/<diagram>.md`, in
English. They are read as Markdown, as `pnpm run lint:md` reads them. A block is
a paragraph outside a list and a table, an item of a list (its own text: not the
lists and the tables in it, whose items and rows are blocks of their own), or a
row of the body of a table. The line `Japanese version: …` is no block.

A paragraph with only whitespace left after its fixture citations are removed is
no block. Its citations are added to the cases of the last preceding block in
the same document. If that block is a row of a table, every body row of that
table receives the citations. Code and HTML are skipped because they are not
blocks. Without a preceding block, the citations are assigned nowhere.

An item is a block and a diagram type. A block of `<document>/<diagram>.md`
holds for that diagram type; a block of `ast.md`, `tokens.md` or `positions.md`
holds for every diagram type and for `error`, the trees whose body is an
`ErrorDiagram`. Every block applicable to a changed tree's diagram type is an
item, including blocks with no places. The diagram type of a tree is the one
whose name, with its first letter capitalized and `Diagram` after it, is the
type of the body of the tree.

The places of an item are where it applies in a tree:

- A block under a heading that is a node type: the nodes of that type.
- A row of a table whose first heading cell is `Kind`, whose first cell is a
  token kind of `tokens.md`: the tokens of that kind, each with the innermost
  node that holds it.
- Any other block: the whole tree.

A place is written `<fixture> <type>@<start>-<end>` for a node,
`<fixture> <kind>@<start>-<end> in <node type>` for a token, and `<fixture> *`
for the whole tree.

The cases of an item are the fixtures that its block cites
(`[fixture: <diagram>/<name>]`). They are listed separately from the answer.

A block that links to a heading of `packages/spec/docs/common.md` or of a
document of `packages/spec/docs/diagrams/` reads its words as that section
defines them, so the section goes with the item. A section runs from its heading
to the next heading of the same depth or a smaller one. Its anchor is made from
the heading as `pnpm run lint:md` makes it to check a link: with
`github-slugger`, which the rule `markdown-links/no-missing-fragments` uses, so
that a link that the lint accepts names a section here. A link without an anchor
names no section.

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
whitespace made one space. For a table row, the text in the key is formed from
the source text of each cell: remove its fixture citations, make every run of
whitespace one space, omit empty cells, and join the rest with `|`, with one
space on each side of the pipe. Adding a citation-only column, or moving
citations into it, therefore keeps the key. The text of the row shown to a
reader stays as written in the source. A citation names a case and does not
change the condition, and Prettier may wrap the text again, so neither changes
the key. When two blocks of one document have the same key text, the second has
`.2` after its hash, the third `.3`.

The key of an item is `<block key>@<diagram>`. The content key of a tree is
`<input>:<tree>`, the git blob ids of its `input.mmd` and `ast.json`.

## Answers

The command reads files under `packages/tests/recorded-trees/answers/`
(`<name>.json`) in this format:

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
  tree is still covered by its content even when its name has changed.
- An answer whose text is empty or whitespace only, as the template that the
  command prints has it, answers nothing.

An item has an answer for a changed tree when an answer of any file covers the
item and the content key of the tree; a changed tree has an answer when an entry
of `trees` covers its content key. What the text of an answer says is defined by
the steps of the work of recording, not here.

- An answer of a file at the base answers the item for good: the item is not
  asked again, and the command lists it only by its key. A tree that is renamed
  or moved is covered so.
- An answer that the change adds leaves the item in the list, with a note that
  the change answers it.
- An answer whose item key or content key no longer matches is not used, does
  not fail the check, and is left unchanged by the command.

## What it prints

The command prints Markdown, the same on a terminal and in the log of CI:

1. The base and the changed trees to read.
2. The counts: trees read, changed trees by diagram type, removed `ast.json`,
   changed `parse-error.json`.
3. The problems: the records and answer files that cannot be read.
4. The items to read, by diagram type: the key, the document and the line, the
   opening of the block, the number of places, the cases, the sections to read
   with it, and whether an answer of the change covers it; the places themselves
   with `--places`. Then the items that the base answers.
5. For each changed tree, the sentences that cite its fixture: the
   `[fixture: <diagram>/<name>]` of the documents of `packages/spec/docs`,
   `packages/parser/docs` and `packages/tests/docs`, and the
   `[corpus fixture: <diagram>/<name>]` of those of
   `packages/prettier-plugin-mmd/docs`, whose `[fixture: <diagram>/<name>]`
   names fixtures of the formatter. A tree that no sentence cites says whether
   the change adds its fixture and whether it is a collected input, read from
   `source.kind` in `expected.json`: `mermaid` for collected, `authored` for
   authored, or unknown when the source kind cannot be read.
6. The missing answers, and a template of an answer file with the keys filled
   and the answers empty. The command writes no file.
7. The items whose key changed since the base, with what changed (the text of
   the block, or which section) and the fixtures associated with the new text:
   those of the block when its own text changed; and, in each section that
   changed, those of the blocks that only one of the two versions has, as that
   version cites them, of the diagram type of the item. When only a section
   changed, the block's own fixtures are not included. Each fixture comes with
   its content key, or says that it has no tree or no longer exists; with
   `--places`, with the places of the item in its tree.
8. The `parse-error.json` of the change, which it does not read.
