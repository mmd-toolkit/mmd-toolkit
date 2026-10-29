# @mmd-toolkit/usecase-no-duplicate-metadata

Japanese version:
[usecase-no-duplicate-metadata.ja.md](./usecase-no-duplicate-metadata.ja.md)

Disallow a metadata value that replaces the value of the same key set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

Metadata updates such as `User@{ type: hollow }` set properties of actors, use
cases, system boundaries, or relationships. When another update gives the same
key a different value for the same element, mermaid.js uses it without an error
and loses the earlier value.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports a `type`,
`business`, `icon`, or `animation` property that replaces a different nonempty
value from an earlier update of the same element. Updates are compared in source
order, including repeated keys in one update and updates before a declaration.
New keys, repeated values, and values after an empty value are not reported.

Ids and values are compared without surrounding quotes. Names that mermaid.js
turns into one id are still separate here: `"Place order"` and `Place_order` are
not compared. Values are otherwise compared as written, so character references
and HTML attribute quotes can differ for this rule although mermaid.js reads
them alike.

Metadata in `systemBoundary` headings is compared in source order: a heading can
replace an earlier heading or update and be reported. An update after a heading
is not reported, because the documentation of mermaid.js gives it as the way to
change the metadata of a heading.

Metadata written in an actor or use case declaration, as
`actor A@{ type: hollow }`, is not compared: the documentation of mermaid.js
changes it with an update, written anywhere, and mermaid.js gives an error for
two declarations with different metadata. `animate` is not compared because
`animate: false` does not stop animation after `animation: slow`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-metadata: error
usecase-beta
  actor User
  User@{ type: hollow }
  User@{ type: awesome }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-metadata: error
usecase-beta
  actor User
  User@{ type: hollow }
```

## Options

This rule has no options.

## Further Reading

- [Use case diagram syntax: system boundaries](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L223-L223)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-metadata.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-metadata.test.ts)

<!-- end auto-generated rule resources -->
