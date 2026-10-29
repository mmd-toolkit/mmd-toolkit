# @mmd-toolkit/treeview-no-duplicate-annotation

Japanese version:
[treeview-no-duplicate-annotation.ja.md](./treeview-no-duplicate-annotation.ja.md)

Disallow an annotation that replaces an annotation of the same kind on one node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A node of a tree view has at most one class, one icon, and one description,
which the annotations `:::`, `icon()`, and `##` give it. A later annotation of a
kind replaces the earlier one without an error, and the earlier value is lost.

## Rule Details

This rule applies to tree views (`treeView-beta`). It reports a class, icon, or
`##` description that changes a nonempty value given to the same node by the
preceding annotation of the same kind. The three kinds are compared separately,
each with the preceding annotation of that kind on the node. An annotation on a
later line belongs to the preceding node, even across comment lines, empty
lines, and directives.

Repeating the current value is not reported. Going back to an earlier value is
reported: after `:::highlight`, `:::muted`, and `:::highlight`, both later
classes are reported.

Classes are compared by name, with their case. Icons are compared as mermaid.js
resolves them without configuration: `icon()` and `icon(none)` both hide the
icon, and a name without a pack such as `file` means `mermaid-treeview:file`.
Hiding an icon is a value too, so `icon(file)` after `icon()` is reported. The
rule does not read `defaultIconPack`, so `icon(mark)` and `icon(custom:mark)`
may be one icon for mermaid.js and two for this rule when that setting names the
pack `custom`.

Descriptions are compared without whitespace at their ends, keeping inner
spaces, so `## First  line` and `## First line` differ. An empty `##` is
reported after a description, and a `##` description after an empty one is not
reported. mermaid.js converts character references such as `#35;` and HTML
before showing a description. Descriptions differing only in these ways may be
the same for mermaid.js and different for this rule.

Text after `##` on its line belongs to the description, so
`## note :::highlight` gives no class.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treeview-no-duplicate-annotation.ts)
- [Tests source](../../tests/rules/treeview-no-duplicate-annotation.test.ts)

<!-- end auto-generated rule resources -->
