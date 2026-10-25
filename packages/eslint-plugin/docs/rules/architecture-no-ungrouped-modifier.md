# @mmd-toolkit/architecture-no-ungrouped-modifier

Japanese version:
[architecture-no-ungrouped-modifier.ja.md](./architecture-no-ungrouped-modifier.ja.md)

Disallow the `{group}` modifier on an end of an edge that is in no group.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`{group}` after the id at an end of an edge makes the edge leave or enter the
group of that service at its boundary, and the documentation of mermaid.js
allows it only for a service in a group. On a service or a junction in no group,
mermaid.js accepts it without an error and moves the end of the edge to where a
group boundary would be: the edge stops short of the service, and no group is
drawn.

## Rule Details

This rule reports `{group}` at an end of an edge whose service or junction is
declared without `in`. It applies to `architecture`. An edge with `{group}` at
two such ends is reported twice.

In `api{group}:R --> L:db`, with `api` in no group, the edge starts at the
distance of the padding of a group, and 4 more, to the right of `api`.

`{group}` on a service or a junction declared in a group is not reported, also
where it is declared after the edge. That the other end is in a group does not
count. `{group}` in the label of an edge is text and is not reported.

Remove `{group}` to connect the edge to the service, or declare the service in
its group with `in`.

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

## Background

The
[documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L111-L126)
allows `{group}` only for a service in a group. The
[Db](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L225-L236)
rejects `{group}` on an edge between two services of one group, but not on an
end in no group, and the
[drawing](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/svgDraw.ts#L54-L71)
moves every end with `{group}` by the padding of a group and 4.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/architecture-no-ungrouped-modifier.ts)
- [Tests source](../../tests/rules/architecture-no-ungrouped-modifier.test.ts)

<!-- end auto-generated rule resources -->
