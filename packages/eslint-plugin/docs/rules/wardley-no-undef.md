# @mmd-toolkit/wardley-no-undef

Japanese version: [wardley-no-undef.ja.md](./wardley-no-undef.ja.md)

Disallow a link or an `evolve` that names no node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A link and an `evolve` name the nodes that they join or move. When the name is
the name of no node, mermaid.js accepts it without an error and draws no line
and no arrow.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports a link end or an
`evolve` that names no node. A node declared after the link or `evolve` counts.
A link can name a node by id or by a pipeline child's label.

The child `SQL` of pipeline `Database` can be named `Database_SQL` or `SQL`, but
an `evolve` can use only its id, `Database_SQL`.

Names are compared with their case and spaces, and otherwise as written.
mermaid.js converts HTML attribute quotes before reading a name, so names
differing only in these may be the same for mermaid.js and different for this
rule. A pipeline whose parent is no node is not reported, because mermaid.js
gives an error for it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-undef: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API -> Databse
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-undef: error
wardley-beta
  component API [0.6, 0.7]
  component Database [0.3, 0.8]
  API -> Database
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-undef.ts)
- [Tests source](../../tests/rules/wardley-no-undef.test.ts)

<!-- end auto-generated rule resources -->
