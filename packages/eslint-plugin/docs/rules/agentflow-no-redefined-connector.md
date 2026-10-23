# @mmd-toolkit/agentflow-no-redefined-connector

Japanese version:
[agentflow-no-redefined-connector.ja.md](./agentflow-no-redefined-connector.ja.md)

Disallow a connector declaration that replaces the title or the vertex written
for its id before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`connector C["Title"]` declares a connector and its title. Declared again with
another title, the connector takes the later title without an error, and the
earlier one is lost. Declared with the id of a vertex, the connector replaces
that vertex.

## Rule Details

This rule reports a connector declaration that changes the title of a connector
declared before it, or the label, the drawn shape, or the kind of a vertex
written before it with a shape. It applies to `agentflow`.

After `connector C[First]`, the declaration `connector C[Second]` gives the
connector the title `Second`, and `First` is lost. A declaration without a
title, or with a title of only whitespace, keeps the title that the connector
has and is not reported, and neither is a declaration with the title that the
connector already has. After `connector C[First]` and `connector C[Second]`, a
third `connector C[First]` is reported, because it replaces `Second`. A
connector declared first without a title has its id as its title, which nobody
wrote: a later title for it is not reported.

A connector and a vertex with one id are one element in mermaid.js. The first
declaration of a connector replaces a vertex of the id: after
`C[Ordinary] --> B`, the declaration `connector C[API]` gives the element `C`
the title `API`, the shape of a connector, a rounded rectangle, and the kind of
a connector, and is reported. Since a vertex written with a shape is never a
connector, the first declaration of a connector replaces every such vertex of
its id: `C[API] --> B` and then `connector C[API]` is reported too, because the
task becomes a connector. Without a title, the connector takes its id as its
label, so `connector C` is reported there too. A vertex that is only referred
to, as `C` in `A --> C`, has no label or shape that anybody wrote, and a
connector of its id is not reported. Shapes and kinds are compared as
[agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.md) compares
them, which reports a vertex that replaces the title of a connector.

A connector with an empty trimmed name creates nothing and is not compared. An
ordinary vertex occurrence ignored because its id is an existing link id or
`connectors` writes no replacement history, even before or after a real
connector declaration of that id.

The id of a connector is its name, without the whitespace at its ends and
without the parts that mermaid.js erases from it. A title or a label set by a
data block, as in `C@{ label: API }`, is not compared, also where it stands
between two declarations. Titles are compared without the whitespace at their
ends, which mermaid.js removes, and otherwise as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a title, so two titles that differ only in those may
be one title for mermaid.js and two for this rule.

Give each connector its own id, and write its title once.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  connector C[First]
  connector C[Second]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  github["create_issue"] --> done
  connector github["GitHub API"]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  connector C[First]
  connector C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  create["create_issue"] --> done
  connector github["GitHub API"]
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.md)

## Background

[`addConnector`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1380-L1411)
stores the first declaration of an id as a new element in place of any vertex of
that id, and later sets only a title that is not empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-connector.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-connector.test.ts)

<!-- end auto-generated rule resources -->
