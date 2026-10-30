# @mmd-toolkit/agentflow-no-redefined-connector

Japanese version:
[agentflow-no-redefined-connector.ja.md](./agentflow-no-redefined-connector.ja.md)

Disallow a connector declaration that replaces the title or the vertex written
for its id before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A connector declared again with another title takes the later title without an
error, losing the earlier one. Declared with the id of a vertex, it replaces
that vertex.

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
current title is not reported. A connector first declared without a title has
its id as its title, and a later title for it is not reported.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-connector.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-connector.test.ts)

<!-- end auto-generated rule resources -->
