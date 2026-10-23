# @mmd-toolkit/usecase-no-duplicate-metadata

Japanese version:
[usecase-no-duplicate-metadata.ja.md](./usecase-no-duplicate-metadata.ja.md)

Disallow a metadata value that replaces the value of the same key set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A metadata update, as `User@{ type: hollow }`, sets properties of the actor, use
case, system boundary, or relationship that it names. When an update gives a key
another value than an earlier update gave the same element, mermaid.js uses the
later value without an error, and the earlier one is lost.

## Rule Details

This rule reports a property `type`, `business`, `icon`, or `animation` of a
metadata update that gives the element another value than the one that an
earlier update gave it with the same key. It applies to `usecase`.

The updates of one element are compared in source order, also two properties of
the same key in one update and updates written before the element is declared.
An update names the element by its id, bare or quoted: `"A"@{ type: hollow }`
updates `A`. Two names that mermaid.js turns into one id are two elements for
this rule: `"Place order"@{ business: true }` and
`Place_order@{ business: false }` update one use case, and the later value is
not reported. The metadata of a `systemBoundary` heading takes part in source
order too: a second heading of the boundary with another `type` is reported, and
so is a heading after an update that it replaces. An update after a heading is
not reported: it changes the type that the heading gave, as the
[documentation of mermaid.js](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L223-L223)
writes. A key that the element has not had is not reported, and neither is a
value that it already has. Values are compared as written, with or without
quotes: `type: hollow` and `type: "hollow"` are the same. An earlier empty
value, as `icon: ""`, holds nothing to lose. Values are otherwise compared as
written: mermaid.js turns character references, as `#35;`, and the quotes of
HTML attributes into other characters before it reads a value, so two values
that differ only in those may be one value for mermaid.js and two for this rule.

The metadata of an actor or a use case declaration, as
`actor A@{ type: hollow }`, is not compared: mermaid.js applies an update over
it wherever the update stands, which is the way that the documentation writes to
change inline metadata, and two declarations with different values are rejected.
`animate` is not compared: after `animation: slow`, mermaid.js draws the
relationship animated also after `animate: false`, which the documentation
writes to stop the animation.

Give each key of an element one value.

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

## Background

[`applyMetadataAssignments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L620-L688)
applies the updates in order, each value replacing the one before it.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-metadata.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-metadata.test.ts)

<!-- end auto-generated rule resources -->
