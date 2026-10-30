# @mmd-toolkit/agentflow-no-redefined-vertex

Japanese version:
[agentflow-no-redefined-vertex.ja.md](./agentflow-no-redefined-vertex.ja.md)

Disallow a vertex that replaces the label or the shape written for its id
before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A vertex written with a shape, such as `A[End]`, sets its id's label and shape.
When an earlier statement wrote them for the same id, mermaid.js uses the later
ones without an error, and the earlier label or shape is lost.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a vertex
written with a shape whose label, drawn shape, or kind differs from the current
one for the same id. Repeating the current label and shape, or referring to the
vertex without a shape, is not reported.

The diamond `{ }`, hexagon `{{ }}`, and subroutine `[[ ]]` are drawn as written;
other bracket shapes are rounded rectangles. Kinds also count, because the
default `redux-color` theme gives each its own colour: subroutines are tools,
diamonds decisions, hexagons actions, `[/ /]` inputs, connectors connectors, and
other bracket shapes tasks. Thus `A[x]` followed by `A(x)` is not reported, but
`A[x]` followed by `A[/x/]` is.

A vertex written with a shape after a connector of its id is reported when it
changes the connector's title or shape, as `C[Other]` or `C{API}` after
`connector C[API]`; the kind stays that of a connector. After a connector
declared without a title, a vertex is not reported for its label: that label is
the id, which nobody wrote. A vertex with the reserved id `connectors` changes
nothing and does not count as an earlier label or shape.

Labels and shapes set by data blocks, such as `A@{ shape: decision }`, are not
compared, even between shaped vertices. Text, quoted text, and markdown text are
not distinguished when comparing labels. Labels are compared without whitespace
at their ends and otherwise as written, so differences in character references
or HTML attribute quotes can be reported even when mermaid.js reads them as the
same label.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-vertex.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
