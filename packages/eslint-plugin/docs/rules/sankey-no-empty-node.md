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

This rule applies to Sankey diagrams (`sankey` and `sankey-beta`). It reports
each source or target that is empty after surrounding whitespace is removed,
including quoted fields containing only spaces or line breaks. Each occurrence
is reported, even when several fields name the same empty node.

A nonempty name with surrounding whitespace, such as `"  a  "`, is not reported.

A field with nothing in it, as in `a,,1`, is not reported, because mermaid.js
gives an error for it. Whitespace-only link values are reported by
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
