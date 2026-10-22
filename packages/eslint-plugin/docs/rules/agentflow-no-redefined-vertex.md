# @mmd-toolkit/agentflow-no-redefined-vertex

Japanese version:
[agentflow-no-redefined-vertex.ja.md](./agentflow-no-redefined-vertex.ja.md)

Disallow a vertex that replaces the label or the shape written for its id
before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A vertex written with a shape, as `A[End]`, sets the label and the shape of its
id. When an earlier statement wrote them for the same id, mermaid.js uses the
later ones without an error, and the earlier label or shape is lost.

## Rule Details

This rule reports a vertex written with a shape whose label, drawn shape, or
kind differs from the one written for the same id before it. It applies to
`agentflow`.

After `A[Start] --> B`, the line `C --> A[End]` gives the vertex `A` the label
`End`, and the label `Start` is lost. Writing the vertex again without a shape,
as in `A --> C`, keeps its label and shape and is not reported, and neither is
writing the label and shape that the vertex already has: after `A[x]` and
`A[y]`, a third `A[y]` changes nothing and is not reported.

An element is compared by its label and by how the drawing shows it: its shape
and its kind. agentflow draws the diamond `{ }`, the hexagon `{{ }}`, and the
subroutine `[[ ]]` as written, and every other bracket shape as a rounded
rectangle. It also gives each element a kind, which its default theme,
`redux-color`, draws in a colour of its own: the subroutine is a tool, the
diamond a decision, the hexagon an action, `[/ /]` an input, a connector a
connector, and every other bracket shape a task. So `A[x]` and then `A(x)`, both
rounded tasks, change nothing and are not reported, while `A(x)` and then
`A{x}`, and `A[x]` and then `A[/x/]`, an input, are reported.

A connector and a vertex with one id are one element in mermaid.js. A vertex
written with a shape after `connector C[API]` gives the connector its label and
its shape, while the element keeps the kind of a connector: `C[Other]` replaces
the title `API`, and `C{API}` the rounded rectangle, and both are reported. A
connector declared without a title has its id as its label, which nobody wrote,
and a vertex after it is not reported for that label.
[agentflow-no-redefined-connector](./agentflow-no-redefined-connector.md)
reports a connector declaration that replaces a vertex.

An ordinary vertex occurrence with an existing link id, or with the reserved id
`connectors`, changes nothing and is not compared. Such an occurrence does not
replace any earlier label or shape in the comparison history. Link targets are
read before that link creates its edges, so a shaped target can still replace a
vertex before its id becomes a link id.

A label or a shape set by a data block, as in `A@{ shape: decision }`, is not
compared, also where it stands between two vertices of the id. The kind of the
label (text, string, or markdown string) is not compared. Labels are compared
without the whitespace at their ends, which mermaid.js removes, and otherwise as
written: mermaid.js turns character references, as `#35;`, and the quotes of
HTML attributes into other characters before it reads a label, so two labels
that differ only in those may be one label for mermaid.js and two for this rule.

Give each vertex its own id, and write its label and shape once.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A[Start] --> B
  C --> A[End]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  github["create_issue"] --> done
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A[Start] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  create["create_issue"] --> done
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.md)

## Background

[`addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L347-L565)
sets the label and the type of the existing element of the id, a connector
included.
[`getTypeFromVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1571-L1587)
gives the drawing the shape of the type, and
[`normaliseNodeShapes`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/shapes.ts#L113-L147)
draws the rectangle, and every shape that agentflow does not allow, as a rounded
rectangle.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-vertex.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
