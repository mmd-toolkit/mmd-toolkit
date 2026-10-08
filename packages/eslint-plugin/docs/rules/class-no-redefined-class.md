# @mmd-toolkit/class-no-redefined-class

Japanese version:
[class-no-redefined-class.ja.md](./class-no-redefined-class.ja.md)

Disallow writing the label of a class again, differently.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A class may be declared many times, and the label written last wins. When a name
that is already in use is declared again for what is meant as a new class, the
earlier label is lost without an error.

## Rule Details

This rule reports a class statement with a label when the same class was
declared before with a different label. It applies to `classDiagram`.

After `class A["First"]`, the statement `class A["Second"]` gives the class `A`
the label `Second`, and the label `First` is lost. Declaring the class again
without a label, as in `class A`, keeps its label and is not reported, and
neither is writing the same label again. Members written in two class statements
of the same class are added together; they are not compared.

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
