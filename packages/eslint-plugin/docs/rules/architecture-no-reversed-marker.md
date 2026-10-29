# @mmd-toolkit/architecture-no-reversed-marker

Japanese version:
[architecture-no-reversed-marker.ja.md](./architecture-no-reversed-marker.ja.md)

Disallow an arrowhead of an edge written pointing the other way.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An edge gets an arrowhead into its left end with `<` before the line, and into
its right end with `>` after it. mermaid.js reads `>` before the line and `<`
after it as the same arrowheads, without an error: the arrowhead is drawn
pointing the other way than written.

## Rule Details

This rule applies to architecture diagrams (`architecture-beta`). It reports an
edge with `>` before its line or `<` after it, with or without a label. An edge
with both is reported once.

`<` before the line and `>` after it are not reported. Neither is `<` or `>` in
an edge label, where it is text.

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

## Further Reading

- [Architecture diagram syntax: edges](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L99-L109)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/architecture-no-reversed-marker.ts)
- [Tests source](../../tests/rules/architecture-no-reversed-marker.test.ts)

<!-- end auto-generated rule resources -->
