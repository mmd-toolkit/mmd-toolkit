# @mmd-toolkit/sankey-no-empty-node

Japanese version: [sankey-no-empty-node.ja.md](./sankey-no-empty-node.ja.md)

Disallow a source or a target of whitespace only, which makes a node without a
name.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The first two fields of a record name the source and the target of the link.
mermaid.js reads each without the whitespace at its ends, so a field of spaces
only names the empty id: mermaid.js accepts it without an error and adds a node
without a name to the diagram, with the link to it. Such a field is usually left
over from deleting a name and keeping the space.

## Rule Details

This rule reports a source or a target that is empty once the whitespace at its
ends is removed. It applies to `sankey`.

`a, ,1` links `a` to a node with the empty name, and so does `  ,b,1` from one.
A field in quotes is read in the same way: `" "` and a field of line feeds only
in quotes are the empty id too. Each such field is reported: `  ,  ,1` gives two
reports, and two records that link to the empty id give one each, although
mermaid.js makes the node once. The field is read as mermaid.js reads it,
without its directives, the comment lines inside a string, and a `;` that the
rule of
[`style` and `classDef` lines](../../../spec/docs/common.md#style-and-classdef-lines)
in the specification ignores, so `a, %%{init: {}}%% ,1`, a string of a comment
line only, as `"`, `%% c`, and `"`, and the target ` ;` on the line
`style:#x, ;,1` are the empty id, and they are reported. A name with whitespace
at its ends, as `"  a  "`, is the id `a` and is not reported. A field with
nothing in it, as `a,,1`, is rejected by mermaid.js, and no rule is needed. A
value of spaces only is reported by
[sankey-no-invalid-value](./sankey-no-invalid-value.md).

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sankey-no-empty-node: error
sankey
Electricity grid, ,104.453
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sankey-no-empty-node: error
sankey
Electricity grid,Homes,104.453
```

## Options

This rule has no options.

## Related Rules

- [journey-no-empty-person](./journey-no-empty-person.md)
- [sankey-no-invalid-value](./sankey-no-invalid-value.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sankey-no-empty-node.ts)
- [Tests source](../../tests/rules/sankey-no-empty-node.test.ts)

<!-- end auto-generated rule resources -->
