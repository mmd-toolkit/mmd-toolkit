# @mmd-toolkit/architecture-no-reversed-marker

Japanese version:
[architecture-no-reversed-marker.ja.md](./architecture-no-reversed-marker.ja.md)

Disallow an arrowhead of an edge written pointing the other way.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An edge gets an arrowhead into its left end with `<` before the line, and into
its right end with `>` after it. mermaid.js reads `>` before the line and `<`
after it as the same arrowheads, without an error: the arrowhead is drawn
pointing the other way than written.

## Rule Details

This rule reports an edge with `>` before its line or `<` after it. It applies
to `architecture`, to edges with and without a label. An edge with both is
reported once.

`api:R >--< L:db` is drawn as `api:R <--> L:db`, with an arrowhead into each
end. `api:R >-- L:db` is drawn as `api:R <-- L:db`, with an arrowhead into
`api`, and `api:R --< L:db` as `api:R --> L:db`, with an arrowhead into `db`.

`<` before the line and `>` after it are not reported, and neither is `<` or `>`
in the label of an edge, as in `api:R -[> -- <]- L:db`, which is text.

Write `<` before the line for an arrowhead into the left end, and `>` after it
for an arrowhead into the right end.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-reversed-marker: error
architecture-beta
  service api(server)[API]
  service db(database)[Database]
  api:R >--< L:db
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-reversed-marker: error
architecture-beta
  service api(server)[API]
  service db(database)[Database]
  api:R <--> L:db
```

## Options

This rule has no options.

## Background

The
[grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/architecture.langium#L31-L57)
reads `<` and `>` alike as an arrowhead at the end where they stand, and the
[documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L99-L109)
writes `<` on the left and `>` on the right.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/architecture-no-reversed-marker.ts)
- [Tests source](../../tests/rules/architecture-no-reversed-marker.test.ts)

<!-- end auto-generated rule resources -->
