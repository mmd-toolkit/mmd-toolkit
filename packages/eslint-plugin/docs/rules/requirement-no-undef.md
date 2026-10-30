# @mmd-toolkit/requirement-no-undef

Japanese version: [requirement-no-undef.ja.md](./requirement-no-undef.ja.md)

Disallow a name in `style`, `class`, `:::`, or a relationship that names no
requirement and no element.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, and `:::` name the requirements and elements that they style,
and a relationship names the two that it joins. When a name is that of none of
them, mermaid.js accepts the statement without an error: `style`, `class`, and
`:::` change nothing, and the relationship joins no box at that end. A
misspelled name gives no error.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports
each name in `style`, `class`, `:::`, or either end of a relationship that no
requirement or element in the diagram has. Names are case-sensitive, but quotes
around a name do not change it.

Each name in a list is checked, even though `style` stops applying styles at the
first unknown name. A `style` or `class` statement before the requirement or
element that it names is not reported, although mermaid.js does nothing with it
there: it names a box of the diagram correctly. A relationship before the boxes
that it joins is not reported: mermaid.js joins them.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-undef: error
requirementDiagram
  requirement r {
    id: 1
  }
  style rr fill:red
```

```mmd
%% eslint @mmd-toolkit/requirement-no-undef: error
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
  r - satisfies -> ee
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-undef: error
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
  r - satisfies -> e
  style r fill:red
```

## Options

This rule has no options.

## Related Rules

- [er-no-undef](./er-no-undef.md)
- [requirement-no-duplicate-name](./requirement-no-duplicate-name.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-undef.ts)
- [Tests source](../../tests/rules/requirement-no-undef.test.ts)

<!-- end auto-generated rule resources -->
