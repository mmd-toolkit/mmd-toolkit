---
since: v0.4.0
---

# @mmd-toolkit/flowchart-no-spaced-stroke

Japanese version:
[flowchart-no-spaced-stroke.ja.md](./flowchart-no-spaced-stroke.ja.md)

Disallow whitespace before the `:` of a `stroke` style.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

The mermaid.js documentation writes the name of a style directly before the `:`,
as in `stroke: #f00`. A `stroke` with whitespace before the `:` is not a form
that the documentation shows. mermaid.js finds the colour of the arrowhead of a
link by looking for `stroke:` in the styles of the link, so it does not give the
arrowhead the colour of `stroke : #f00`, although a browser draws the line in
that colour.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a style named `stroke` in lower case when
whitespace stands between the name and the `:`, in a `linkStyle` statement with
link numbers, in `linkStyle default`, and in a `classDef`, whether or not a link
takes it. A `stroke` in a `style` statement is not reported: `style` gives a
style to a vertex or a subgraph and never to a link, so there is no arrowhead
for the form to affect, and a browser reads `stroke : #f00` there as it reads
`stroke: #f00`. A name that only ends with `stroke`, such as `text-stroke`, and
a name in another case, such as `Stroke`, are not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke : #f00, stroke-width: 4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  classDef hot stroke : #f00
  class A hot
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke: #f00, stroke-width: 4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  classDef hot stroke: #f00
  class A hot
```

## Options

This rule has no options.

## When Not To Use It

mermaid.js reads `stroke : #f00` as intended where the drawing does not depend
on the arrowhead, and a pull request of mermaid.js gives arrowheads the colour
of their line in the browsers that support it. Turn the rule off if you write
the form on purpose, or once that change is part of the version you use.

## Related Rules

- [agentflow-no-spaced-stroke](./agentflow-no-spaced-stroke.md)

## Further Reading

- [mermaid-js/mermaid#7974](https://github.com/mermaid-js/mermaid/pull/7974)
- [mermaid-js/mermaid#1236](https://github.com/mermaid-js/mermaid/issues/1236)

<!-- begin auto-generated rule version -->

## Version

This rule was introduced in `@mmd-toolkit/eslint-plugin` v0.4.0.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-spaced-stroke.ts)
- [Tests source](../../tests/rules/flowchart-no-spaced-stroke.test.ts)

<!-- end auto-generated rule resources -->
