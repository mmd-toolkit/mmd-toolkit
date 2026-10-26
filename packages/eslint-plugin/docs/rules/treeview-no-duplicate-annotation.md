# @mmd-toolkit/treeview-no-duplicate-annotation

Japanese version:
[treeview-no-duplicate-annotation.ja.md](./treeview-no-duplicate-annotation.ja.md)

Disallow an annotation that replaces an annotation of the same kind on one node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A node of a tree view has at most one class, one icon, and one description,
which the annotations `:::`, `icon()`, and `##` give it. A later annotation of a
kind replaces the earlier one without an error, and the earlier value is lost.

## Rule Details

This rule reports a class, an icon, or a `##` description that changes the value
that an earlier annotation of the same kind gave the same node, when that value
is not empty. It applies to `treeView`.

After `file :::highlight :::muted`, the node has only the class `muted`, and no
highlight is drawn. After `file icon(file) icon(folder)`, only the folder icon
is drawn, and after `file icon(file) icon()`, no icon. An annotation on a later
line, as `## Second` on the line after `file ## First`, belongs to the node
before it, also across comment lines, empty lines, and directives. The three
kinds are separate: a class and an icon do not replace each other. A later
annotation is compared with the one just before it: after `:::highlight`,
`:::muted`, and `:::highlight`, both later classes are reported.

An annotation that gives the value that the node already has is not reported.
Classes are compared by their names, with their case. Icons are compared as
mermaid.js resolves them without configuration: `icon()` and `icon(none)` both
hide the icon, and a name without a pack, as `file`, is the name in the built-in
pack, `mermaid-treeview:file`. Hiding the icon is a value too: after `icon()`,
`icon(file)` is reported. The rule reads no configuration: where
`defaultIconPack` names a pack, a name without a pack, other than `file` and
`folder`, is an icon of that pack, so `icon(mark)` and `icon(custom:mark)` may
be one icon for mermaid.js and two for this rule.

Descriptions are compared without the whitespace at their ends and with their
inner spaces: `## First  line` and `## First line` are two descriptions. `##`
with no text gives no description: after a description, it is reported, and an
annotation after it loses nothing. Descriptions are otherwise compared as
written: mermaid.js turns character references, as `#35;`, and HTML into other
text before it shows a description, and reads a tab on a line that starts with
box-drawing characters as four spaces, so two descriptions that differ only in
those may be one description for mermaid.js and two for this rule. Text after
`##` on its line belongs to the description: `## note :::highlight` gives the
description `note :::highlight` and no class.

Keep one annotation of each kind on a node.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-annotation: error
treeView-beta
  file :::highlight :::muted
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-annotation: error
treeView-beta
  file :::highlight icon(file) ## note
```

## Options

This rule has no options.

## Background

The
[grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treeView/treeView.langium#L59-L64)
keeps the last annotation of each kind on a node, and the
[parser](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/parser.ts#L11-L39)
gives the node that class, that icon, with `none` for an empty one, and that
description.
[`getNodeIcon`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/icons.ts#L57-L100)
hides the icon for `none`, and puts a name without a pack in the built-in pack,
unless `defaultIconPack` names another pack.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treeview-no-duplicate-annotation.ts)
- [Tests source](../../tests/rules/treeview-no-duplicate-annotation.test.ts)

<!-- end auto-generated rule resources -->
