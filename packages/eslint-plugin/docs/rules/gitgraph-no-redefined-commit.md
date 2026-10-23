# @mmd-toolkit/gitgraph-no-redefined-commit

Japanese version:
[gitgraph-no-redefined-commit.ja.md](./gitgraph-no-redefined-commit.ja.md)

Disallow a `commit` with the id of a commit or a merge written before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A git graph keeps one commit for each id. A later `commit` with the id of an
earlier commit replaces it without an error, and the earlier commit is lost:
mermaid.js only writes a warning to its log, which the default configuration
does not show.

## Rule Details

This rule reports a `commit` statement whose id is the id of a `commit` or a
`merge` statement before it. It applies to `gitgraph`.

After `commit id: "A" tag: "first"` and `commit id: "A" tag: "second"`, the
diagram has one commit `A`, with the tag `second` and itself as its parent. The
later commit takes the place of the earlier one in the order of the commits, and
the commits that came after the earlier one can become its parents. A `commit`
with the id of a `merge` replaces the merge in the same way. The second commit
is reported also where it gives the same options as the first.

The id of a statement is the value of its last `id:` option, as mermaid.js reads
it: after `commit id: "A" id: "B"`, a later `commit id: "B"` is reported, and a
later `commit id: "A"` is not. A `commit` without `id:` or with `id: ""` gets an
id that mermaid.js makes, and it is not compared. A `merge` with the id of an
earlier commit is rejected by mermaid.js, and a `cherry-pick` names the commit
that it copies with `id:` and declares none. Ids are compared with their case,
and the quotes around them do not count: `id: 'A'` and `id: "A"` are one id.
Every line break (LF, CRLF, or CR) in an id is read as a line feed. Ids are
otherwise compared as written: mermaid.js decodes escapes, as `\q`, and turns
the quotes of HTML attributes into other characters before it reads an id, so
two ids that differ only in those may be one id for mermaid.js and two for this
rule.

Give each commit its own id.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-redefined-commit: error
gitGraph
  commit id: "A" tag: "first"
  commit id: "A" tag: "second"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-redefined-commit: error
gitGraph
  commit id: "A" tag: "first"
  commit id: "B" tag: "second"
```

## Options

This rule has no options.

## Related Rules

- [gitgraph-no-duplicate-option](./gitgraph-no-duplicate-option.md)

## Background

[`commit`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/git/gitGraphAst.ts#L114-L134)
stores the commit under its id, over a commit of the same id, after a warning in
the log.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-redefined-commit.ts)
- [Tests source](../../tests/rules/gitgraph-no-redefined-commit.test.ts)

<!-- end auto-generated rule resources -->
