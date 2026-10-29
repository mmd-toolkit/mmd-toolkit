# @mmd-toolkit/architecture-no-ungrouped-modifier

Japanese version:
[architecture-no-ungrouped-modifier.ja.md](./architecture-no-ungrouped-modifier.ja.md)

Disallow the `{group}` modifier on an end of an edge that is in no group.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`{group}` after the id at an end of an edge makes the edge leave or enter the
group of that service at its boundary, and the documentation of mermaid.js
allows it only for a service in a group. On a service or a junction in no group,
mermaid.js accepts it without an error and moves the end of the edge to where a
group boundary would be: the edge stops short of the service, and no group is
drawn.

## Rule Details

This rule applies to architecture diagrams (`architecture-beta`). It reports
`{group}` at an end of an edge whose service or junction is declared without
`in`. An edge with two such ends is reported twice.

`{group}` on a service or junction declared in a group is not reported, even
when the declaration follows the edge. The other end being in a group does not
count. `{group}` in an edge label is text and is not reported. `{group}` on an
edge between two services or junctions in the same group is not reported either,
because mermaid.js gives an error for it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-ungrouped-modifier: error
architecture-beta
  service api(server)[API]
  service db(database)[Database]
  api{group}:R --> L:db
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-ungrouped-modifier: error
architecture-beta
  group backend(cloud)[Backend]
  service api(server)[API] in backend
  service db(database)[Database]
  api{group}:R --> L:db
```

## Options

This rule has no options.

## Further Reading

- [Architecture diagram syntax: group edges](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L111-L126)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/architecture-no-ungrouped-modifier.ts)
- [Tests source](../../tests/rules/architecture-no-ungrouped-modifier.test.ts)

<!-- end auto-generated rule resources -->
