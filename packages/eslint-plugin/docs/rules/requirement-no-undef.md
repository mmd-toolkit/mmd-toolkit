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

This rule reports a name in a `style`, `class`, or `:::` statement, and an end
of a relationship, that is the name of no requirement and no element of the
diagram. It applies to `requirement`.

After `requirement r`, `style rr fill:red` and `rr:::c` change nothing, and
`r - satisfies -> ee` adds a relationship whose end `ee` is no box; so it is for
the source of a relationship, and for `r <- copies - ee`. Each name of a list is
checked. `class missing,r,e a` gives `r` and `e` the class `a`, and `missing` is
reported. `style` stops at the first name that is no box:
`style r,missing,s fill:red` styles `r` and not `s`, and `missing` is reported.

The names of the diagram are those of its requirements and its elements. A name
in quotes is the same name as without them: after `requirement "r"`, `style r`
styles it. Names differ in case: after `requirement r`, `style R` is reported. A
`style` or `class` statement written before the requirement or the element that
it names changes nothing in mermaid.js; such a statement names a box of the
diagram, which is written correctly, and the rule does not report it. A
relationship may be written before the boxes that it joins.

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

## Background

mermaid.js looks the names of `style`, `class`, and `:::` up while the text is
read, and `style` returns at the first name that it does not find
([`setCssStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L226-L240)
and
[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L242-L255)).
The ends of a relationship are looked up when the diagram is drawn
([`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L292-L325)).

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-undef.ts)
- [Tests source](../../tests/rules/requirement-no-undef.test.ts)

<!-- end auto-generated rule resources -->
