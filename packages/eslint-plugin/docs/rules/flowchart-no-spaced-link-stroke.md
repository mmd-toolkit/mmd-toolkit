# @mmd-toolkit/flowchart-no-spaced-link-stroke

Japanese version:
[flowchart-no-spaced-link-stroke.ja.md](./flowchart-no-spaced-link-stroke.ja.md)

Disallow whitespace before the `:` of a `stroke` style of a link.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A link takes a style from a `linkStyle` statement, or from a class that a
`class` statement gives to it. mermaid.js puts the style on the line as written,
so `stroke :#f00` colours the line, but it finds the colour of the arrowhead by
looking for `stroke:` in the same text, which that style does not contain. The
line is red and its arrowhead keeps the colour of the theme, without an error.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a style whose name ends with `stroke` when
whitespace stands between the name and the `:`, in a `linkStyle` statement with
link numbers, in `linkStyle default`, and in a `classDef` whose class a `class`
statement gives to a link, before or after the `classDef`. A link is named by
the id written for it, such as `e1` in `A e1@--> B`, or by the id that
mermaid.js gives it, such as `L_A_B_0`.

A `classDef` that only vertices take is not reported: a vertex keeps its colour
with `stroke :#f00`. Whitespace after the `:` is not reported, and neither is a
name in another case, such as `Stroke`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke :#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A e1@--> B
  classDef hot stroke :#f00
  class e1 hot
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke:#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A --> B
  classDef hot stroke :#f00
  class A hot
```

## Options

This rule has no options.

## When Not To Use It

A pull request of mermaid.js gives arrowheads the stroke of their line in the
browsers that support it. Once it is part of the version you use, the arrowhead
takes the colour of a line written as `stroke :#f00`, and this rule would report
text that is drawn as intended. Turn the rule off then.

## Related Rules

- [agentflow-no-spaced-link-stroke](./agentflow-no-spaced-link-stroke.md)

## Further Reading

- [mermaid-js/mermaid#7974](https://github.com/mermaid-js/mermaid/pull/7974)
- [mermaid-js/mermaid#1236](https://github.com/mermaid-js/mermaid/issues/1236)

<!-- begin auto-generated rule version -->

## Version

This rule has not been released yet.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-spaced-link-stroke.ts)
- [Tests source](../../tests/rules/flowchart-no-spaced-link-stroke.test.ts)

<!-- end auto-generated rule resources -->
