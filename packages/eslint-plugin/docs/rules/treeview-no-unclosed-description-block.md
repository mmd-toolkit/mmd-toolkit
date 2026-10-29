# @mmd-toolkit/treeview-no-unclosed-description-block

Japanese version:
[treeview-no-unclosed-description-block.ja.md](./treeview-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that no `}` closes.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to its `}`. When the `}` is missing, mermaid.js reads
the line as a node without an error: the text of the block becomes the name of a
file, and the tree view gets no description.

## Rule Details

This rule applies to tree views (`treeView-beta`). It reports a node whose name
starts with `accDescr`, then spaces or tabs or nothing, then `{`. A quoted name
such as `"accDescr { Project files"` is written as a name and is not reported. A
`}` on a later line, even in a file name such as `a}b`, closes the block and
makes the preceding lines its description; such a block is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-unclosed-description-block: error
treeView-beta
  accDescr { Project files
  root/
    file
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-unclosed-description-block: error
treeView-beta
  accDescr { Project files }
  root/
    file
```

## Options

This rule has no options.

## Related Rules

- [treeview-no-empty-description-block](./treeview-no-empty-description-block.md)
- [treeview-no-duplicate-description](./treeview-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treeview-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/treeview-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
