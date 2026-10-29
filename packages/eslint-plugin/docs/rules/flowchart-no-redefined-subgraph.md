# @mmd-toolkit/flowchart-no-redefined-subgraph

Japanese version:
[flowchart-no-redefined-subgraph.ja.md](./flowchart-no-redefined-subgraph.ja.md)

Disallow a subgraph declaration whose title differs from the title kept for its
id.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Repeating a subgraph id adds members to the same subgraph. mermaid.js keeps its
first title, so a different title in another declaration is lost without an
error.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a title in a declaration of the same subgraph id
that differs from the title the subgraph keeps. That is the title of the first
declaration, or the name it writes when it has no separate title, rather than a
generated id.

A later declaration without a title, or with the title the subgraph already has,
is not reported: it adds members without losing a title. A nested subgraph is
read before its enclosing declaration finishes, so it supplies the title when
both have the same id.

Title comparisons ignore whitespace at the ends, treat LF, CRLF, and CR as LF,
and do not distinguish text, quoted text, and markdown text. Otherwise titles
are compared as written, so differences in character references or HTML
attribute quotes can be reported even when mermaid.js reads them as the same
title.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-subgraph: error
flowchart LR
  subgraph S [One]
    A
  end
  subgraph S [Two]
    B
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-subgraph: error
flowchart LR
  subgraph S [One]
    A
  end
  subgraph S
    B
  end
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-redefined-subgraph: error
flowchart LR
  subgraph S [One]
    A
  end
  subgraph S [One]
    B
  end
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.md)
- [agentflow-no-redefined-flow](./agentflow-no-redefined-flow.md)

## Further Reading

- [Issue #8326](https://github.com/mermaid-js/mermaid/issues/8326)
- [Pull request #8337](https://github.com/mermaid-js/mermaid/pull/8337)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-redefined-subgraph.ts)
- [Tests source](../../tests/rules/flowchart-no-redefined-subgraph.test.ts)

<!-- end auto-generated rule resources -->
