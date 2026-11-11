---
since: v0.1.0
---

# @mmd-toolkit/agentflow-no-redefined-vertex

Japanese version:
[agentflow-no-redefined-vertex.ja.md](./agentflow-no-redefined-vertex.ja.md)

Disallow a vertex that replaces the label or the shape written for its id
before, or that a later flow does not get.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A vertex written with a shape, such as `A[End]`, sets its id's label and shape.
When an earlier statement wrote them for the same id, mermaid.js uses the later
ones without an error, and the earlier label or shape is lost. A vertex also
belongs to the first flow that ended with it: writing it in a later flow does
not add it there.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a vertex
written with a shape whose label or drawn shape differs from the current one for
the same id. Repeating the current label and shape, or referring to the vertex
without a shape, is not reported, except in a flow that does not get the vertex
(below).

The diamond `{ }`, hexagon `{{ }}`, subroutine `[[ ]]`, and `[/ /]` are drawn as
written; other bracket shapes are rounded rectangles. Thus `A[x]` followed by
`A(x)` is not reported, but `A[x]` followed by `A[/x/]` is, and so is `A[/x/]`
followed by `A(x)`.

A vertex written with a shape after a connector of its id is reported when it
changes the connector's title or shape, as `C[Other]` or `C{API}` after
`connector C[API]`; the element stays a connector. After a connector declared
without a title, a vertex is not reported for its label: that label is the id,
which nobody wrote. A vertex with the reserved id `connectors` changes nothing
and does not count as an earlier label or shape.

A flow does not get a vertex or a connector that a flow before it has, in the
order in which the flows end (a flow inside another one ends first): mermaid.js
leaves it in the first and the later one does not get it. A vertex statement in
the later flow is reported when it has no link, no class, and no data block, and
writes only the id, or the label and the shape that the element has with the
same label kind and property of the shape: it says nothing new about the
element. A connector declaration counts as an earlier occurrence, and a
connector declaration in a later flow is reported by
[agentflow-no-redefined-connector](./agentflow-no-redefined-connector.md). In a
group such as `A & B`, each vertex is reported for itself. It is not reported
when the earlier flow is inside the later one, or has the same id, since nothing
is lost; nor when no earlier flow has the element, or the element was not
written before, or when the statement says something new: a link, a class, a
data block, the first shape of the vertex, or another label kind or property. A
vertex or a connector written directly in a `global` block, wherever the block
stands, belongs to no flow, so it is never reported; a flow written in a
`global` block holds its own vertices.

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
  A["Start"] --> B
  C --> A["End"]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  github["create_issue"] --> done
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  flow a
    A
  end
  flow b
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A["Start"] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  create["create_issue"] --> done
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  global
    shared
  end
  flow a
    shared
  end
  flow b
    shared
  end
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.md)

<!-- begin auto-generated rule version -->

## Version

This rule was introduced in `@mmd-toolkit/eslint-plugin` v0.1.0.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-vertex.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->
