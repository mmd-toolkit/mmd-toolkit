# @mmd-toolkit/class-no-redefined-class

Japanese version:
[class-no-redefined-class.ja.md](./class-no-redefined-class.ja.md)

Disallow writing the label of a class again, differently.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A class may be declared many times, and the last label is used. Reusing a name
for what was meant as another class loses the earlier label without an error.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports a class statement whose label differs from the label that the class
already has. Declaring the class again without a label, or with the current
label, is not reported. Members in repeated class declarations are added
together and are not compared.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-redefined-class: error
classDiagram
  class A["First"]
  class A["Second"]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-redefined-class: error
classDiagram
  class A["First"]
  class A
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-redefined-class.ts)
- [Tests source](../../tests/rules/class-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
