---
since: v0.1.0
---

# @mmd-toolkit/agentflow-no-redefined-connector

Japanese version:
[agentflow-no-redefined-connector.ja.md](./agentflow-no-redefined-connector.ja.md)

Disallow a connector declaration that replaces the title or the vertex written
for its id before, or that a later flow does not get.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A connector declared again with another title takes the later title without an
error, losing the earlier one. Declared with the id of a vertex, it replaces
that vertex. A connector also belongs to the first flow that ended with it:
declaring it in a later flow does not add it there.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a
connector declaration that changes an earlier connector title or replaces a
vertex written with a shape. Even with the same label, a vertex becomes a
connector and is reported. A connector declared with the id of a vertex that is
only referred to, as `C` in `A --> C`, is not reported: nobody wrote a label or
shape for that vertex. A declaration without a title replaces a vertex written
with a shape too and is reported. A vertex written with a shape after a
connector of its id is reported by
[agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.md), not by this
rule.

A repeated connector declaration with no title, a whitespace-only title, or the
current title is not reported, except in a flow that does not get the connector
(below). A connector first declared without a title has its id as its title, and
a later title for it is not reported.

A flow does not get a connector that a flow before it has, in the order in which
the flows end (a flow inside another one ends first): mermaid.js leaves the
connector in the first and the later one does not get it. A declaration in the
later flow is reported when it has no data block and has no title or the title
that the connector has: it says nothing new about the connector; another title
is reported for the title, as above. It is not reported when the earlier flow is
inside the later one, or has the same id, since nothing is lost; nor when no
earlier flow has the connector, or when the earlier flow only refers to the id,
since the declaration then makes it a connector. A connector written directly in
a `global` block belongs to no flow, so it is never reported. The same applies
to a vertex that an earlier flow holds, as
[agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.md) reports.

A vertex with the reserved id `connectors` does not count as an earlier label or
shape. Titles and labels set by data blocks, such as `C@{ label: API }`, are not
compared, even between declarations.

Titles are compared without whitespace at their ends and otherwise as written,
so differences in character references or HTML attribute quotes can be reported
even when mermaid.js reads them as the same title.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  connector C["First"]
  connector C["Second"]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  github["create_issue"] --> done
  connector github["GitHub API"]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  flow a
    connector C
  end
  flow b
    connector C
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  connector C["First"]
  connector C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  create["create_issue"] --> done
  connector github["GitHub API"]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  flow a
    connector C["One"]
  end
  flow b
    connector C["One"]@{ label: Two }
  end
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.md)

<!-- begin auto-generated rule version -->

## Version

This rule was introduced in `@mmd-toolkit/eslint-plugin` v0.1.0.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-connector.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-connector.test.ts)

<!-- end auto-generated rule resources -->
