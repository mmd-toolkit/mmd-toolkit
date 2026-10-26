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

This rule reports an end of a link that names no node, and an `evolve` that
names no node. It applies to `wardley`.

After `component Database`, the link `API -> Databse` draws no line and no
label, and `evolve Databse 0.9` draws no arrow.

A node declared after the link or the `evolve` counts. A link names a node by
its id or by the label of a child of a pipeline: the child `SQL` of the pipeline
`Database` has the id `Database_SQL`, and a link may name it `Database_SQL` or
`SQL`. An `evolve` names a node by its id only, so `evolve SQL 0.9` names no
node there. Names are compared with their case and their spaces, and every line
break (LF, CRLF, or CR) in a name is read as a line feed. Names are otherwise
compared as written: mermaid.js decodes escapes, as `\q`, and turns the quotes
of HTML attributes into other characters before it reads a name, so two names
that differ only in those may be one name for mermaid.js and two for this rule.
A pipeline whose parent is no node is rejected by mermaid.js.

Correct the name, or declare the node.

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

## Background

[`resolveNodeId`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L175-L185)
finds the node of a link by its id and then by its label, and keeps a name that
names no node, which the drawing leaves out; an
[`evolve`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L189-L197)
of a name that is the id of no node adds no arrow.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-undef.ts)
- [Tests source](../../tests/rules/wardley-no-undef.test.ts)

<!-- end auto-generated rule resources -->
