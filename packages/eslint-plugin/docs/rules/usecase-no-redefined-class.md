# @mmd-toolkit/usecase-no-redefined-class

Japanese version:
[usecase-no-redefined-class.ja.md](./usecase-no-redefined-class.ja.md)

Disallow a `classDef` that drops or changes the styles of the class defined
before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `classDef` defines the styles of a class. A later `classDef` of the same class
replaces the whole definition without an error, unlike a flowchart, where the
styles are added: after `classDef hot fill:red` and `classDef hot stroke:blue`,
the class has no fill.

## Rule Details

This rule reports a class of a `classDef` whose earlier definition has a style
that the later one drops or gives another value. It applies to `usecase`. Each
class of a `classDef` with several classes, as `classDef hot,cold fill:red`, is
checked on its own.

A definition that keeps every style of the earlier one is not reported, also
when it adds styles or writes them in another order. Styles are compared as
mermaid.js draws them: of a property written twice in one definition, the last
value counts; property names are compared as written, with their case, because
mermaid.js tells the styles of the label from those of the shape by the written
name: after `color:red`, `COLOR:red` goes to the shape, and the label is no
longer red; values are compared as CSS reads them, without the whitespace at
their ends, with a run of whitespace outside a quoted string as one space, and
otherwise as written: `font-family:"A  B"` and `font-family:"A B"` name two
fonts. After `fill:red` and `fill:blue`, a third definition with `fill:red` is
reported, because it changes `blue`.

A `style` statement adds its styles to an element and is not compared.

Write one `classDef` for each class, with all its styles.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red
  classDef hot stroke:blue
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red, stroke:blue
```

## Options

This rule has no options.

## Background

[`applyClassDefinitions`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L846-L852)
keeps the last definition of each class whole, and
[`getCompiledStyles`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L118-L134)
takes the last value of a property in it.
[`styles2String`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L53-L104)
gives a style whose written name is `color`, `font-size`, or another property of
text to the label, and every other style to the shape.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-redefined-class.ts)
- [Tests source](../../tests/rules/usecase-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
