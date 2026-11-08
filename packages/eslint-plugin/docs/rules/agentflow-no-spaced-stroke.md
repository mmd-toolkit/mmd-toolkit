# @mmd-toolkit/agentflow-no-spaced-stroke

Japanese version:
[agentflow-no-spaced-stroke.ja.md](./agentflow-no-spaced-stroke.ja.md)

Disallow whitespace before the `:` of a `stroke` style.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

The mermaid.js documentation writes the name of a style directly before the `:`,
as in `stroke:#f00`. A `stroke` with whitespace before the `:` is not a form
that the documentation shows. mermaid.js finds the colour of the arrowhead of a
link by looking for `stroke:` in the styles of the link, so it does not give the
arrowhead the colour of `stroke :#f00`, although a browser draws the line in
that colour.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a style
named `stroke` in lower case when whitespace stands between the name and the
`:`, in a `linkStyle` statement with link numbers, in `linkStyle default`, and
in a `classDef`, whether or not a link takes it. A `stroke` in a `style`
statement is not reported: `style` gives a style to a vertex or a subgraph and
never to a link, so there is no arrowhead for the form to affect, and a browser
reads `stroke :#f00` there as it reads `stroke:#f00`. A name that only ends with
`stroke`, such as `text-stroke`, and a name in another case, such as `Stroke`,
are not reported.

The fix removes the whitespace. It is not offered when a style named `stroke`,
in any case and with or without whitespace before its `:`, follows the style in
the styles of a link that the style reaches: the line then takes the colour of
the later style, and the arrowhead, which takes the colour of the first
`stroke:`, would take the colour of this style or of an earlier one. The styles
of a link are those of its classes, in the order they were given, then those of
`linkStyle default`, then its own. A class is given to a link by a `class`
statement or a `:::`, as in `e1:::hot`, that comes after the statement that
writes the link.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  linkStyle 0 stroke :#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  classDef hot stroke :#f00
  class A hot
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  linkStyle 0 stroke:#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  classDef hot stroke:#f00
  class A hot
```

## Options

This rule has no options.

## When Not To Use It

mermaid.js reads `stroke :#f00` as intended where the drawing does not depend on
the arrowhead, and a pull request of mermaid.js gives arrowheads the colour of
their line in the browsers that support it. Turn the rule off if you write the
form on purpose, or once that change is part of the version you use.

## Related Rules

- [flowchart-no-spaced-stroke](./flowchart-no-spaced-stroke.md)

## Further Reading

- [mermaid-js/mermaid#7974](https://github.com/mermaid-js/mermaid/pull/7974)
- [mermaid-js/mermaid#1236](https://github.com/mermaid-js/mermaid/issues/1236)

<!-- begin auto-generated rule version -->

## Version

This rule has not been released yet.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-spaced-stroke.ts)
- [Tests source](../../tests/rules/agentflow-no-spaced-stroke.test.ts)

<!-- end auto-generated rule resources -->
