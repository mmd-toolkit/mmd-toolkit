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

This rule reports a node whose name starts with `accDescr`, then spaces or tabs
or nothing, then `{`. It applies to `treeView`.

After `accDescr { Project files`, the tree has a file named
`accDescr { Project files`, and the description is empty. A block whose `{` ends
its line makes a file named `accDescr {`, and its lines of text become files
too. A name in quotes, as `"accDescr { Project files"`, is written as a name and
is not reported.

A `}` on a later line, as in a file named `a}b`, closes the block: the lines up
to it become the description and disappear from the tree. This rule does not
report such a block.

Close the block where the description ends.

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

## Background

The
[terminal of the block](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L15-L15)
matches a block only with its `}`, and the
[terminal of a name](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L57-L57)
takes the rest of the line as the name of a node.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treeview-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/treeview-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
